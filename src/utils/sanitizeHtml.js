// Central HTML sanitizer (item 5).
//
// Before this, user Markdown / imported articles / material-library HTML
// went straight into `v-html` sinks (ArticlePreview, MaterialCenter,
// MaterialPopup) and into `innerHTML` export containers with no cleaning
// at all — `marked` is not configured with any sanitizer and no cleaning
// library existed in the repo. Any `<script>`, event handler or
// `javascript:` link in an imported document would have executed in the
// app origin, where cloud credentials live in localStorage (see item 4).
//
// `sanitizeWeChatHtml` is applied at the two choke points that feed every
// sink:
//   1. `compileToWeChatHtml()` in wechatStyles.js — covers the preview,
//      PNG/PDF/Word/HTML export and copy-to-WeChat paths at once.
//   2. Material HTML in MaterialCenter / MaterialPopup, which does not go
//      through the compiler.
//
// The allowlist is deliberately close to DOMPurify's defaults, because the
// compiler's output relies on them: inline `style` attributes, `<section>`
// wrappers, `data-*` attributes, tables, SVG (mermaid diagrams render to
// SVG in the live preview). Only `<style>` tags are forbidden on top of
// the defaults — WeChat strips them anyway, and this compiler inlines all
// CSS (including user customCss, applied as attributes by
// applyCustomCssRules), so nothing legitimate is lost.
import DOMPurify from 'dompurify';

const WECHAT_SANITIZE_CONFIG = {
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'title'],
};

export function sanitizeWeChatHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return dirty || '';
  return DOMPurify.sanitize(dirty, WECHAT_SANITIZE_CONFIG);
}
