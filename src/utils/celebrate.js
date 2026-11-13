import { logger } from './logger.js';
// Lazy confetti (item 3): canvas-confetti was statically imported in five
// files although it only fires on celebrations (import success, theme
// applied, ...). It is now fetched on first use; callers fire-and-forget
// via `void fireConfetti({...})`.
// (Also fixes a latent bug: EditorPanel called bare `confetti(...)` with
// no import at all, which threw ReferenceError on URL-import success.)
export async function fireConfetti(options) {
  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti(options);
  } catch (err) {
    logger.warn('[NiceMD] confetti failed:', err);
  }
}
