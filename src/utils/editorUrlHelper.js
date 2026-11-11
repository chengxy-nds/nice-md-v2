const SAFE_URL_RE = /^(?:https?:\/\/|data:image\/)/i;
const IMAGE_EXT_RE = /\.(?:png|jpe?g|gif|webp|svg|bmp|ico|avif|tiff?)$/i;
const FILE_EXT_RE = /\.(?:pdf|docx?|xlsx?|pptx?|zip|rar|7z|tar|gz|bz2|csv|json|xml|txt|md|markdown|mp4|webm|mov|mp3|wav|flac|apk|dmg|exe|msi|iso|epub)$/i;

/**
 * Validate whether a URL uses an allowed external or image data scheme.
 */
export function isSafeHttpOrImageUrl(url) {
  return typeof url === 'string' && SAFE_URL_RE.test(url.trim());
}

/**
 * Determine whether a URL points to an image asset or originated from Markdown image syntax.
 */
export function isImageUrl(url, isMarkdownImageSyntax = false) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!isSafeHttpOrImageUrl(trimmed)) return false;
  if (/^data:image\//i.test(trimmed)) return true;

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname || '';
    if (IMAGE_EXT_RE.test(pathname)) return true;
    const wxFmt = parsed.searchParams.get('wx_fmt') || parsed.searchParams.get('format') || '';
    if (/^(?:png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(wxFmt)) return true;
    const ossProcess = parsed.searchParams.get('x-oss-process') || '';
    if (ossProcess.startsWith('image/')) return true;
  } catch {
    const cleanPath = trimmed.split(/[?#]/)[0];
    if (IMAGE_EXT_RE.test(cleanPath)) return true;
  }

  // Only fall back to non-extension Markdown image syntax if the URL isn't obviously another non-image file
  if (isMarkdownImageSyntax && !FILE_EXT_RE.test(trimmed.split(/[?#]/)[0])) {
    return true;
  }
  return false;
}

/**
 * Check whether the URL explicitly ends with a common downloadable document or archive extension.
 */
export function isLikelyDownloadableFile(url) {
  if (!url || typeof url !== 'string' || /^data:/i.test(url)) return false;
  const cleanPath = url.trim().split(/[?#]/)[0];
  return FILE_EXT_RE.test(cleanPath);
}

/**
 * Extract a readable filename or domain label from a URL for display and download fallback.
 */
export function extractUrlDisplayMeta(url) {
  if (!url || typeof url !== 'string') {
    return { filename: '', host: '' };
  }
  if (/^data:image\/([a-z0-9+.-]+)/i.test(url)) {
    const extMatch = url.match(/^data:image\/([a-z0-9+.-]+)/i);
    const rawExt = (extMatch?.[1] || 'png').replace(/\+xml$/i, '');
    return { filename: `image.${rawExt}`, host: 'Data URI' };
  }
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const lastSeg = segments.length ? segments[segments.length - 1] : '';
    let decodedName = lastSeg;
    try {
      decodedName = decodeURIComponent(lastSeg);
    } catch {
      // Keep raw segment when percent-encoding is malformed
    }
    return {
      filename: decodedName || '',
      host: parsed.host || ''
    };
  } catch {
    return { filename: '', host: '' };
  }
}

/**
 * Parse the inner target of `![alt](...)` or `[text](...)`, separating URL from optional title and `=WxH`.
 */
function parseMarkdownLinkTarget(innerText) {
  let cursor = 0;
  while (cursor < innerText.length && /\s/.test(innerText[cursor])) cursor++;

  if (cursor >= innerText.length) return null;

  let urlStart = cursor;
  let urlEnd = cursor;
  if (innerText[cursor] === '<') {
    const closeAngle = innerText.indexOf('>', cursor + 1);
    if (closeAngle === -1) return null;
    urlStart = cursor + 1;
    urlEnd = closeAngle;
  } else {
    while (urlEnd < innerText.length && !/\s/.test(innerText[urlEnd])) {
      urlEnd++;
    }
  }

  const url = innerText.slice(urlStart, urlEnd).trim();
  if (!isSafeHttpOrImageUrl(url)) return null;
  return { url, relStart: urlStart, relEnd: urlEnd };
}

/**
 * Detect a URL at character offset `offsetInLine` within a single line of Markdown source.
 * Supports Markdown links/images (`[text](url)`, `![alt](url =WxH)`), `<https://...>`, and bare URLs.
 */
export function detectUrlAtOffset(lineText, offsetInLine) {
  if (!lineText || offsetInLine < 0 || offsetInLine > lineText.length) return null;

  const coveredRanges = [];

  // 1. Scan Markdown links and images first so optional "title" or =WxH suffixes are excluded from URL bounds
  const mdLinkRe = /(!?)\[(?:\\.|[^\[\]])*\]\(([^)\n]+)\)/g;
  let match;
  while ((match = mdLinkRe.exec(lineText)) !== null) {
    const fullStart = match.index;
    const fullEnd = fullStart + match[0].length;
    coveredRanges.push([fullStart, fullEnd]);

    const openParenIdx = match[0].indexOf('](');
    if (openParenIdx === -1) continue;
    const innerStart = fullStart + openParenIdx + 2;
    const parsed = parseMarkdownLinkTarget(match[2]);
    if (!parsed) continue;

    const absStart = innerStart + parsed.relStart;
    const absEnd = innerStart + parsed.relEnd;
    if (offsetInLine >= absStart && offsetInLine <= absEnd) {
      const isMdImage = match[1] === '!';
      const type = isImageUrl(parsed.url, isMdImage) ? 'image' : 'link';
      const meta = extractUrlDisplayMeta(parsed.url);
      return {
        url: parsed.url,
        fromOffset: absStart,
        toOffset: absEnd,
        type,
        isDownloadableFile: isLikelyDownloadableFile(parsed.url),
        filename: meta.filename,
        host: meta.host
      };
    }
  }

  // 2. Scan bare URLs or `<https://...>` autolinks outside already scanned Markdown links
  const bareUrlRe = /(?:https?:\/\/[^\s<>"'`\])，。；：！？（）【】《》、”’「」\u3000]+|data:image\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/gi;
  while ((match = bareUrlRe.exec(lineText)) !== null) {
    let raw = match[0];
    const absStart = match.index;
    // Strip trailing sentence punctuation when URL appears inline in prose
    while (raw.length > 8 && /[.,;!?:'"`]$/.test(raw)) {
      raw = raw.slice(0, -1);
    }
    const absEnd = absStart + raw.length;
    const insideCovered = coveredRanges.some(([s, e]) => absStart >= s && absEnd <= e);
    if (insideCovered) continue;

    if (offsetInLine >= absStart && offsetInLine <= absEnd && isSafeHttpOrImageUrl(raw)) {
      const type = isImageUrl(raw, false) ? 'image' : 'link';
      const meta = extractUrlDisplayMeta(raw);
      return {
        url: raw,
        fromOffset: absStart,
        toOffset: absEnd,
        type,
        isDownloadableFile: isLikelyDownloadableFile(raw),
        filename: meta.filename,
        host: meta.host
      };
    }
  }

  return null;
}

/**
 * Trigger a browser download for a URL. Uses fetch + Blob when CORS permits so remote files save
 * instead of navigating away, and falls back to anchor download attribute otherwise.
 */
export async function downloadUrlResource(url, fallbackName = '') {
  if (!isSafeHttpOrImageUrl(url)) {
    throw new Error('不支持的 URL 协议');
  }
  const meta = extractUrlDisplayMeta(url);
  const filename = fallbackName || meta.filename || 'download';

  if (/^data:image\//i.test(url)) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return { method: 'data', filename };
  }

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return { method: 'blob', filename };
  } catch {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return { method: 'anchor', filename };
  }
}
