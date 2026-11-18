// 文档统计与文内图片提取的统一口径：编辑区底部状态栏、灯箱预览均复用此处逻辑。

const zhWordSegmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh-CN', { granularity: 'word' })
    : null;

/** 用等长空格遮罩围栏代码块与行内代码，避免示例代码里的 ![alt](url) 或 <img> 被误算。 */
function maskCodeBlocksAndInlineCode(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, (m) => ' '.repeat(m.length))
    .replace(/~~~[\s\S]*?~~~/g, (m) => ' '.repeat(m.length))
    .replace(/`[^`\n]+`/g, (m) => ' '.repeat(m.length));
}

/**
 * 按正文出现顺序提取所有图片（支持标准语法、=WxH 尺寸扩展、title、相对路径与 HTML <img>）。
 * 同一张图在文中多次出现会按出现顺序保留多条，保证“N 图”统计与灯箱张数一一对应。
 */
export function extractDocImages(markdown) {
  const raw = markdown || '';
  if (!raw) return [];

  const masked = maskCodeBlocksAndInlineCode(raw);
  const found = [];

  // 1. Markdown 图片：![alt](url "title" =260xauto) 或 ![alt](<url>)
  const mdRegex =
    /!\[((?:\\.|[^\]\r\n])*)\]\(\s*(?:<([^>\r\n]+)>|([^\s()]+(?:\([^\s()]*\)[^\s()]*)*))(?:\s+(?:"[^"\r\n]*"|'[^'\r\n]*'))?(?:\s+=\s*(?:\d+(?:%|px)?|auto)?(?:x(?:\d+(?:%|px)?|auto)?)?)?\s*\)/g;
  let match;
  while ((match = mdRegex.exec(masked)) !== null) {
    const url = (match[2] || match[3] || '').trim();
    if (!url) continue;
    found.push({
      index: match.index,
      url,
      alt: (match[1] || '').trim(),
    });
  }

  // 2. HTML <img ... src="...">
  const htmlRegex = /<img\b[^>]*>/gi;
  while ((match = htmlRegex.exec(masked)) !== null) {
    const tag = match[0];
    const srcMatch = tag.match(/\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const url = (srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || '').trim();
    if (!url) continue;
    const altMatch = tag.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    found.push({
      index: match.index,
      url,
      alt: (altMatch?.[1] || altMatch?.[2] || '').trim(),
    });
  }

  found.sort((a, b) => a.index - b.index);
  return found.map(({ url, alt }) => ({ url, alt }));
}

/** 提取用于字词统计的正文纯文本（去掉 Front Matter、HTML 标签、URL、Markdown 排版符）。 */
export function extractDocPlainText(markdown) {
  const raw = markdown || '';
  if (!raw) return '';

  return raw
    // 1. 顶部 YAML Front Matter
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    // 2. 围栏代码块围栏行（保留代码内容）
    .replace(/^[ \t]*(?:```|~~~)[^\r\n]*$/gm, '')
    // 3. 图片语法整体去掉（避免 OSS/base64 URL 虚增字数）
    .replace(
      /!\[((?:\\.|[^\]\r\n])*)\]\(\s*(?:<[^>]+>|[^\s()]+(?:\([^\s()]*\)[^\s()]*)*)(?:\s+(?:"[^"\r\n]*"|'[^'\r\n]*'))?(?:\s+=\s*(?:\d+(?:%|px)?|auto)?(?:x(?:\d+(?:%|px)?|auto)?)?)?\s*\)/g,
      '',
    )
    // 4. 超链接仅保留可见文案 [text](url) -> text
    .replace(/\[([^\]]+)\]\(\s*(?:<[^>]+>|[^\s()]+)(?:\s+(?:"[^"\r\n]*"|'[^'\r\n]*'))?\s*\)/g, '$1')
    // 5. 引用链接定义 / 缩写定义 / 脚注标记
    .replace(/^[ \t]*\[[^\]]+\]:\s*\S+.*$/gm, '')
    .replace(/^[ \t]*\*\[[^\]]+\]:.*$/gm, '')
    .replace(/\[\^[^\]]+\]:?/g, '')
    // 6. 中文注音 {山海}^(shān hǎi) -> 山海
    .replace(/\{([^}\r\n]+)\}\^\([^)\r\n]+\)/g, '$1')
    // 7. 自定义提示容器标记 ::: tip 标题 -> 标题
    .replace(/^[ \t]*:::\s*(?:tip|info|note|important|warning|danger|caution|details)?[ \t]*/gim, '')
    // 8. 表格分隔行 | :--- | :--- |
    .replace(/^[ \t]*\|?(?:[\s:]*-{2,}[\s:]*\|)+[\s:|-]*$/gm, '')
    // 9. 分割线 --- / *** / ___
    .replace(/^[ \t]*(?:[-*_]\s*){3,}$/gm, '')
    // 10. [TOC] 占位符与 :emoji: 短代码
    .replace(/^[ \t]*\[TOC\][ \t]*$/gim, '')
    .replace(/:[a-z0-9_+-]+:/gi, ' ')
    // 11. HTML 标签
    .replace(/<[^>]+>/g, ' ')
    // 12. 行首 Markdown 结构标记（标题、引用、列表、任务框）
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*(?:>[ \t]*)+/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+\[[ xX]\][ \t]+/gm, '')
    .replace(/^[ \t]*(?:[-*+]|\d+\.)[ \t]+/gm, '')
    // 13. 行内 Markdown 格式符（保留英文内部连字符/小数点/下划线）
    .replace(/\+\+|==|~~|\^\^|\*\*|__/g, ' ')
    .replace(/[`*|~^]/g, ' ');
}

/** 词数：中英文混合分词统计（中文按词/字切分、英文/数字按单词切分，不含标点）。 */
export function countDocWords(markdown) {
  const plain = extractDocPlainText(markdown);
  if (!plain.trim()) return 0;

  if (zhWordSegmenter) {
    let count = 0;
    for (const seg of zhWordSegmenter.segment(plain)) {
      if (seg.isWordLike) count++;
    }
    return count;
  }

  const fallbackTokens = plain.match(
    /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]|[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*/g,
  );
  return fallbackTokens ? fallbackTokens.length : 0;
}

/** 字数：去掉 Front Matter、HTML 标签、图片/链接 URL、Markdown 符号和空白后剩下的可见字符数。 */
export function countDocChars(markdown) {
  const plain = extractDocPlainText(markdown);
  if (!plain) return 0;
  return plain.replace(/\s+/g, '').length;
}

/** 行数：空文档为 0，其余与编辑器实际行数一致。 */
export function countDocLines(markdown) {
  const raw = markdown || '';
  if (!raw) return 0;
  return raw.split(/\r\n|\r|\n/).length;
}

/** 图片数：与 extractDocImages 统一口径。 */
export function countDocImages(markdown) {
  return extractDocImages(markdown).length;
}
