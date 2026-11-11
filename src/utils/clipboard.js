/**
 * Write plain text to the system clipboard with an offscreen textarea fallback
 * when the async Clipboard API is unavailable or restricted.
 */
export async function writeTextToClipboard(text) {
  const value = text == null ? '' : String(text);
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall back to execCommand when Clipboard API is unavailable or denied
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) {
    throw new Error('Clipboard copy failed');
  }
}

