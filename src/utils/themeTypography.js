/**
 * Per-theme markdown typography.
 *
 * Each theme carries a `typography` recipe (plain data). From that single
 * recipe we render TWO outputs:
 *   1. buildThemeTypoCss(theme)  → `[data-theme="<id>"]` CSS block for the
 *      web surfaces (.markdown-body in the editor + .tc-rendered-paper in the
 *      template center). The rule is non-scoped, injected at the END of <head>
 *      so it beats the components' scoped `:deep()` defaults on equal
 *      specificity.
 *   2. buildWechatTypo(theme, colors) → { selector: inlineStyleString } for the
 *      WeChat phone preview + export (WeChat strips <style>, so it needs
 *      inline styles).
 *
 * Themes without a `typography` field (e.g. runtime custom themes) produce
 * empty output and fall back to the existing static defaults everywhere.
 */

import { themes } from './themePresets.js';

// ── helpers ────────────────────────────────────────────────────────────────

const esc = (s) => String(s ?? '');

// Render a heading spec into CSS declarations (web surface).
function headingDecl(spec, theme, ctPrefix, tag) {
  const d = [];
  const colorVar = `var(--ct-${ctPrefix}-color, ${spec.color || `var(--accent-color)`})`;
  const sizeVar = `var(--ct-${ctPrefix}-size, ${spec.size || '1.5em'})`;
  const weightVar = `var(--ct-${ctPrefix}-weight, ${spec.weight || 700})`;
  d.push(`color: ${colorVar};`);
  d.push(`font-size: ${sizeVar};`);
  d.push(`font-weight: ${weightVar};`);
  if (spec.letterSpacing) d.push(`letter-spacing: ${spec.letterSpacing};`);
  if (spec.marginTop) d.push(`margin-top: ${spec.marginTop};`);
  if (spec.marginBottom) d.push(`margin-bottom: ${spec.marginBottom};`);

  switch (spec.variant) {
    case 'pill':
      d.push(`display: block;`);
      d.push(`text-align: ${spec.align || 'center'};`);
      d.push(`background: ${spec.bg || 'var(--accent-color)'};`);
      d.push(`color: ${spec.color || '#ffffff'};`);
      d.push(`border-radius: ${spec.radius || '999px'};`);
      d.push(`padding: ${spec.padding || '0.35em 1em'};`);
      d.push(`line-height: 1.4;`);
      break;
    case 'bar':
      d.push(`border-left: ${spec.borderWidth || '4px'} solid ${spec.borderColor || 'var(--accent-color)'};`);
      d.push(`padding-left: ${spec.padding || '0.6em'};`);
      break;
    case 'underline':
      d.push(`border-bottom: ${spec.borderWidth || '2px'} solid ${spec.borderColor || 'var(--accent-color)'};`);
      d.push(`padding-bottom: 0.3em;`);
      break;
    case 'icon':
      // mdnice 山海 style: centered heading with a decorative icon behind the text.
      // The icon sits at the top-center; text is pushed below it via padding-top.
      d.push(`display: block;`);
      d.push(`text-align: center;`);
      d.push(`background-image: url('${spec.iconUrl || 'https://files.mdnice.com/mountain_2.png'}');`);
      d.push(`background-position: center 0;`);
      d.push(`background-repeat: no-repeat;`);
      d.push(`background-size: ${spec.iconSize || '30px'} ${spec.iconSize || '30px'};`);
      d.push(`line-height: ${spec.lineHeight || '2.4em'};`);
      d.push(`margin-top: ${spec.marginTop || '15px'};`);
      d.push(`margin-bottom: ${spec.marginBottom || '15px'};`);
      d.push(`padding-top: ${spec.textMarginTop || '38px'};`);
      d.push(`padding-bottom: 0;`);
      d.push(`padding-left: 0;`);
      d.push(`padding-right: 0;`);
      d.push(`position: relative;`);
      break;
    default: // plain
      break;
  }
  return d.join('\n');
}

// Render a blockquote spec into CSS declarations.
function blockquoteDecl(spec) {
  const d = [];
  const border = `var(--ct-bq-border, ${spec.borderColor || 'var(--accent-color)'})`;
  const bg = `var(--ct-bq-bg, ${spec.bg || 'var(--accent-bg)'})`;
  const text = `var(--ct-bq-text, ${spec.textColor || 'var(--text-muted)'})`;
  switch (spec.variant) {
    case 'card':
      d.push(`border: 1px solid ${border};`);
      d.push(`background: ${bg};`);
      d.push(`border-radius: ${spec.radius || '10px'};`);
      d.push(`padding: ${spec.padding || '14px 20px'};`);
      break;
    case 'tag':
      d.push(`border-left: 4px solid ${border};`);
      d.push(`background: ${bg};`);
      d.push(`border-radius: ${spec.radius || '0 8px 8px 0'};`);
      d.push(`padding: ${spec.padding || '10px 18px'};`);
      break;
    case 'striped':
      d.push(`background: ${bg};`);
      d.push(`border-radius: ${spec.radius || '8px'};`);
      d.push(`padding: ${spec.padding || '12px 18px'};`);
      d.push(`border: none;`);
      break;
    default: // bar
      d.push(`border-left: ${spec.borderWidth || '4px'} solid ${border};`);
      d.push(`background: ${bg};`);
      d.push(`border-radius: ${spec.radius || '0 8px 8px 0'};`);
      d.push(`padding: ${spec.padding || '14px 22px'};`);
      break;
  }
  d.push(`color: ${text};`);
  return d.join('\n');
}

// ── web CSS renderer ───────────────────────────────────────────────────────

export function buildThemeTypoCss(theme) {
  const T = theme.typography;
  if (!T) return '';
  const id = theme.id;
  // Emit the same selector for both web surfaces. If the selector is a
  // comma list (e.g. "strong, b"), expand each into a fully-scoped selector.
  const sel = (s) => {
    const scoped = (base) => s.split(',').map(part => `[data-theme="${id}"] ${base} ${part.trim()}`).join(', ');
    return `${scoped(`.markdown-body`)},\n${scoped(`.tc-rendered-paper`)}`;
  };

  const parts = [];

  // Preview paper texture (mdnice 山海 style)
  if (theme.previewTexture && theme.previewTexture.bgImage) {
    const sBg = sel('.markdown-body');
    const texDecl = [];
    texDecl.push(`background-image: ${theme.previewTexture.bgImage};`);
    if (theme.previewTexture.bgSize) texDecl.push(`background-size: ${theme.previewTexture.bgSize};`);
    texDecl.push(`background-repeat: repeat, repeat;`);
    texDecl.push(`background-attachment: scroll;`);
    parts.push(`html:not(.dark) ${sBg} {\n${texDecl.join('\n')}\n}`);
  }

  const heading = (tag, prefix, spec) => {
    if (!spec) return;
    parts.push(`${sel(tag)} {\n${headingDecl(spec, theme, prefix, tag)}\n}`);
  };
  heading('h1', 'h1', T.h1);
  heading('h2', 'h2', T.h2);
  heading('h3', 'h3', T.h3);
  heading('h4', 'h4', T.h4);
  heading('h5', 'h5', T.h5);
  heading('h6', 'h6', T.h6);

  if (T.p) {
    const d = [];
    if (T.p.color) d.push(`color: var(--ct-p-color, var(--ct-body-color, ${T.p.color}));`);
    if (T.p.size) d.push(`font-size: var(--ct-p-size, ${T.p.size});`);
    if (T.p.lineHeight) d.push(`line-height: var(--ct-p-lineheight, ${T.p.lineHeight});`);
    if (T.p.letterSpacing) d.push(`letter-spacing: ${T.p.letterSpacing};`);
    if (T.p.justify) d.push(`text-align: justify;`);
    if (T.p.padding) d.push(`padding: ${T.p.padding};`);
    parts.push(`${sel('p')} {\n${d.join('\n')}\n}`);
  }

  if (T.strong) {
    const d = [];
    d.push(`color: var(--ct-strong-color, ${T.strong.color || 'var(--accent-color)'});`);
    d.push(`font-weight: var(--ct-strong-weight, ${T.strong.weight || 700});`);
    parts.push(`${sel('strong, b')} {\n${d.join('\n')}\n}`);
  }

  if (T.a) {
    const d = [];
    if (T.a.color) d.push(`color: ${T.a.color};`);
    parts.push(`${sel('a')} {\n${d.join('\n')}\n}`);
  }

  if (T.blockquote) {
    parts.push(`${sel('blockquote')} {\n${blockquoteDecl(T.blockquote)}\n}`);
    if (T.blockquote.textColor) {
      parts.push(`${sel('blockquote p')} {\n  margin-bottom: 0;\n  color: ${T.blockquote.textColor};\n}`);
    }
  }

  if (T.code) {
    const d = [];
    d.push(`font-family: "SF Mono", Consolas, Monaco, monospace;`);
    if (T.code.color) d.push(`color: var(--ct-code-color, ${T.code.color});`);
    if (T.code.bg) d.push(`background: var(--ct-code-bg, ${T.code.bg});`);
    if (T.code.size) d.push(`font-size: var(--ct-code-size, ${T.code.size});`);
    if (T.code.radius) d.push(`border-radius: ${T.code.radius};`);
    if (T.code.padding) d.push(`padding: ${T.code.padding};`);
    if (T.code.border) d.push(`border: ${T.code.border};`);
    parts.push(`${sel(':not(pre) > code')} {\n${d.join('\n')}\n}`);
  }

  if (T.pre) {
    const d = [];
    if (T.pre.radius) d.push(`border-radius: ${T.pre.radius};`);
    parts.push(`${sel('pre')} {\n${d.join('\n')}\n}`);
    // pre code keeps the scoped !important defaults; nothing needed here.
  }

  if (T.table) {
    const d = [];
    if (T.table.borderColor) d.push(`border-color: ${T.table.borderColor};`);
    if (T.table.radius) {
      parts.push(`${sel('table')} {\n  border-collapse: separate;\n  border-spacing: 0;\n  border-radius: ${T.table.radius};\n  overflow: hidden;\n}`);
    }
    if (T.table.headerBg) parts.push(`${sel('th')} {\n  background: ${T.table.headerBg};\n}`);
    parts.push(`${sel('th, td')} {\n${d.join('\n')}\n}`);
  }

  if (T.hr) {
    const d = [];
    switch (T.hr.variant) {
      case 'dashed':
        d.push(`border: none; border-top: 1px dashed ${T.hr.color || 'var(--border-color)'};`);
        break;
      case 'gradient':
        d.push(`border: none; height: 1px; background: linear-gradient(90deg, transparent, ${T.hr.color || 'var(--accent-color)'}, transparent);`);
        break;
      default:
        d.push(`border: none; border-top: 1px solid ${T.hr.color || 'var(--border-color)'};`);
        break;
    }
    parts.push(`${sel('hr')} {\n${d.join('\n')}\n}`);
  }

  if (T.img && T.img.radius) {
    parts.push(`${sel('img')} {\n  border-radius: ${T.img.radius};\n}`);
  }

  if (T.extraCss) parts.push(T.extraCss);

  return parts.join('\n');
}

// ── WeChat inline-style renderer ───────────────────────────────────────────

// Sub {primary} {secondary} {accentBg} {border} {text} {muted} {codeBg} {codeText} tokens.
function fill(str, colors) {
  return esc(str)
    .replace(/\{primary\}/g, colors.primary)
    .replace(/\{secondary\}/g, colors.secondary)
    .replace(/\{accentBg\}/g, colors.accentBg)
    .replace(/\{border\}/g, colors.border)
    .replace(/\{text\}/g, colors.text)
    .replace(/\{muted\}/g, colors.muted)
    .replace(/\{codeBg\}/g, colors.codeBg)
    .replace(/\{codeText\}/g, colors.codeText);
}

export function buildWechatTypo(theme, colors) {
  const T = theme.typography;
  if (!T) return {};
  const out = {};

  const heading = (tag, spec) => {
    if (!spec) return;
    const s = ['display: block', 'font-weight: bold'];
    if (spec.size) s.push(`font-size: ${spec.size}`);
    if (spec.marginTop) s.push(`margin-top: ${spec.marginTop}`);
    if (spec.marginBottom) s.push(`margin-bottom: ${spec.marginBottom}`);
    switch (spec.variant) {
      case 'pill':
        s.push(`text-align: center`);
        s.push(`background-color: {primary}`);
        s.push(`color: #ffffff`);
        s.push(`border-radius: 999px`);
        s.push(`padding: 10px 20px`);
        s.push(`line-height: 1.5`);
        break;
      case 'bar':
        s.push(`border-left: 4px solid {primary}`);
        s.push(`padding-left: 10px`);
        s.push(`color: {text}`);
        break;
      case 'underline':
        s.push(`border-bottom: 2px solid {primary}`);
        s.push(`padding-bottom: 6px`);
        s.push(`color: {text}`);
        break;
      case 'icon':
        s.push(`text-align: center`);
        s.push(`line-height: ${spec.lineHeight || '2.4em'}`);
        s.push(`color: ${spec.color ? fill(spec.color, colors) : '{text}'}`);
        s.push(`background-image: url('${spec.iconUrl || 'https://files.mdnice.com/mountain_2.png'}')`);
        s.push(`background-position: center top`);
        s.push(`background-repeat: no-repeat`);
        s.push(`background-size: ${spec.iconSize || '30px'} ${spec.iconSize || '30px'}`);
        s.push(`padding-top: ${spec.textMarginTop || '38px'}`);
        s.push(`padding-bottom: 0`);
        s.push(`padding-left: 0`);
        s.push(`padding-right: 0`);
        break;
      default:
        s.push(`color: {primary}`);
        break;
    }
    out[tag] = fill(s.join('; '), colors);
  };
  heading('h1', T.h1);
  heading('h2', T.h2);
  heading('h3', T.h3);
  heading('h4', T.h4);
  heading('h5', T.h5);
  heading('h6', T.h6);

  if (T.p) {
    const s = [];
    if (T.p.size) s.push(`font-size: ${T.p.size}`);
    if (T.p.lineHeight) s.push(`line-height: ${T.p.lineHeight}`);
    if (T.p.letterSpacing) s.push(`letter-spacing: ${T.p.letterSpacing}`);
    if (T.p.justify) s.push(`text-align: justify`);
    if (T.p.color) s.push(`color: ${fill(T.p.color, colors)}`);
    if (T.p.padding) s.push(`padding: ${T.p.padding}`);
    if (s.length) out['p'] = fill(s.join('; '), colors);
  }

  if (T.strong) {
    out['strong'] = `color: ${T.strong.color ? fill(T.strong.color, colors) : colors.primary}; font-weight: ${T.strong.weight || 700};`;
  }

  if (T.a) {
    const s = [];
    if (T.a.color) s.push(`color: ${fill(T.a.color, colors)}`);
    if (s.length) out['a'] = fill(s.join('; '), colors);
  }

  if (T.blockquote) {
    const s = [];
    switch (T.blockquote.variant) {
      case 'card':
        s.push(`border: 1px solid {primary}`);
        s.push(`border-radius: 10px`);
        break;
      case 'striped':
        s.push(`border-radius: 8px`);
        break;
      default:
        s.push(`border-left: 4px solid {primary}`);
        s.push(`border-radius: 0 8px 8px 0`);
        break;
    }
    s.push(`background-color: ${T.blockquote.bg ? fill(T.blockquote.bg, colors) : '{accentBg}'}`);
    s.push(`color: ${T.blockquote.textColor ? fill(T.blockquote.textColor, colors) : '{muted}'}`);
    s.push(`padding: 14px 20px`);
    out['blockquote'] = fill(s.join('; '), colors);
    if (T.blockquote.textColor) {
      out['blockquoteP'] = `margin-bottom: 0; color: ${fill(T.blockquote.textColor, colors)};`;
    }
  }

  if (T.code) {
    const s = [];
    s.push(`font-family: monospace`);
    if (T.code.color) s.push(`color: ${fill(T.code.color, colors)}`);
    if (T.code.bg) s.push(`background-color: ${fill(T.code.bg, colors)}`);
    if (T.code.size) s.push(`font-size: ${T.code.size}`);
    if (T.code.radius) s.push(`border-radius: ${T.code.radius}`);
    if (T.code.padding) s.push(`padding: ${T.code.padding}`);
    if (T.code.border) s.push(`border: ${fill(T.code.border, colors)}`);
    out['code'] = fill(s.join('; '), colors);
  }

  if (T.table && T.table.headerBg) {
    out['th'] = `background-color: ${fill(T.table.headerBg, colors)}; font-weight: bold;`;
  }

  return out;
}

// ── injector ───────────────────────────────────────────────────────────────

export function injectThemeTypographyCss() {
  const css = themes.filter((t) => t.typography).map(buildThemeTypoCss).join('\n');
  let el = document.getElementById('nicemd-theme-typography');
  if (!el) {
    el = document.createElement('style');
    el.id = 'nicemd-theme-typography';
    document.head.appendChild(el);
  }
  el.textContent = css;
}
