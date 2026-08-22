/**
 * WeChat Inline Style Decorator
 * Decorates standard HTML with inline CSS to preserve formatting when pasted into WeChat editor.
 */

const wechatTheme = {
  primary: '#5f6caf', // Accent color
  secondary: '#a7b1e2',
  bgLight: '#f5f6fa',
  text: '#3f3f3f',
  muted: '#7f7f7f',
  codeBg: '#282c34',
  codeText: '#abb2bf',
  border: '#eaeef2'
};

import { codeThemes } from './codeThemes';
import { themes } from './themePresets';
import { buildWechatTypo } from './themeTypography';
import { allMaterialTemplatesMap, getBackgroundPatternStyle } from './materialLibrary';

function isMaterialEl(el) {
  if (!el || el.nodeType !== 1) return false;
  try {
    if (el.getAttribute && (el.getAttribute('data-material') === 'true' || el.hasAttribute('data-material') || el.getAttribute('data-code-block') === 'true')) {
      return true;
    }
    if (el.classList && (el.classList.contains('material-block') || el.classList.contains('code-snippet__fix'))) {
      return true;
    }
    if (el.closest && el.closest('[data-material="true"], [data-material], .material-block, [data-heading][data-material="true"], [data-code-block="true"], .code-snippet__fix')) {
      return true;
    }
  } catch (e) {}
  return false;
}

export function cleanCss(css) {
  return (css || '').replace(/;+/g, ';').replace(/\s+/g, ' ').trim();
}

export function compileToWeChatHtml(htmlContent, themeId = 'classic-indigo', codeThemeId = 'mdnice-classic', customCss = '', customStyles = null, livePreviewEl = null) {
  const effectiveCodeThemeId = customStyles?.code?.codeThemeId || codeThemeId || 'mdnice-classic';
  const codeTheme = codeThemes.find(t => t.id === effectiveCodeThemeId) || codeThemes.find(t => t.id === codeThemeId) || codeThemes[0];
  const codeStyles = (codeTheme && codeTheme.styles) ? codeTheme.styles : {};
  const theme = themes.find(t => t.id === themeId) || themes[0];
  const themeStyles = theme.styles;

  const bodyColor = customStyles?.body?.color || themeStyles['--text-main'] || '#3f3f3f';
  const bodyBg = customStyles?.body?.backgroundColor || themeStyles['--bg-preview'] || '#ffffff';
  const bgTextureId = customStyles?.body?.backgroundTexture || customStyles?.body?.materialTemplateId || 'grid';
  const pattern = getBackgroundPatternStyle(bgTextureId);

  // Map colors directly to the selected theme's properties to perfectly match the Standard Preview
  let colors = {
    primary: themeStyles['--accent-color'] || '#5f6caf',
    secondary: themeStyles['--accent-hover'] || '#a7b1e2',
    bgLight: themeStyles['--code-bg'] || '#f5f6fa',
    text: bodyColor,
    muted: themeStyles['--text-muted'] || '#7f7f7f',
    codeBg: themeStyles['--code-bg'] || '#282c34',
    codeText: themeStyles['--code-text'] || '#abb2bf',
    border: themeStyles['--border-color'] || '#eaeef2',
    bgPreview: bodyBg,
    accentBg: themeStyles['--accent-bg'] || '#eef7f9',
    codeTextTheme: themeStyles['--code-text'] || '#bf616a'
  };

  // Per-theme inline-style overrides (empty object for themes without typography).
  const wechatTypo = buildWechatTypo(theme, colors);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<section>${htmlContent}</section>`, 'text/html');
  const root = doc.body.querySelector('section');

  // Clean empty list items (which are usually empty lines in markdown list)
  root.querySelectorAll('li').forEach(li => {
    const text = li.textContent.replace(/[\u200B-\u200D\uFEFF\u00A0\s]/g, '');
    const hasMedia = li.querySelector('img, iframe, code, pre, svg, video, audio, canvas') !== null;
    if (text === '' && !hasMedia) {
      li.remove();
    }
  });

  // 1. Global Container Styling with selected background pattern & body color
  root.setAttribute('style', cleanCss(`
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: ${colors.text};
    letter-spacing: 0.05em;
    padding: 10px 0px;
    background-image: ${pattern.backgroundImage};
    background-size: ${pattern.backgroundSize};
    ${pattern.backgroundPosition ? `background-position: ${pattern.backgroundPosition};` : ''}
    background-repeat: repeat;
    background-color: ${colors.bgPreview};
  `));

// Helper to set style safely and convert elements to section if it is a heading to prevent WeChat from overriding styles
  const styleEl = (selector, styleStr) => {
    root.querySelectorAll(selector).forEach(el => {
      if (isMaterialEl(el)) return;
      const cleanedStyle = cleanCss(styleStr);
      if (/^h[1-6]$/i.test(el.tagName)) {
        const section = doc.createElement('section');
        section.setAttribute('style', cleanedStyle);
        // Copy children to section
        while (el.firstChild) {
          section.appendChild(el.firstChild);
        }
        el.parentNode.replaceChild(section, el);
      } else {
        const existing = el.getAttribute('style') || '';
        if (existing) {
          const separator = existing.trim().endsWith(';') ? ' ' : '; ';
          el.setAttribute('style', existing + separator + cleanedStyle);
        } else {
          el.setAttribute('style', cleanedStyle);
        }
      }
    });
  };

  // 1.5 Material Template Replacement for Headings, Blockquotes & Dividers
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
    const matId = customStyles?.[tag]?.materialTemplateId || themeStyles?.[tag]?.materialTemplateId;
    const prefix = customStyles?.[tag]?.materialPrefix || (tag === 'h1' ? 'PART' : 'SECTION');
    if (matId && matId !== 'none' && allMaterialTemplatesMap[matId]) {
      const tmpl = allMaterialTemplatesMap[matId];
      let index = 0;
      root.querySelectorAll(tag).forEach(el => {
        if (isMaterialEl(el)) return;
        index++;
        const titleHtml = el.innerHTML.trim();
        const renderedHtml = tmpl.render ? tmpl.render(titleHtml, index, { prefix }) : null;
        if (renderedHtml) {
          const tempContainer = doc.createElement('div');
          tempContainer.innerHTML = renderedHtml;
          const replacement = tempContainer.firstElementChild;
          if (replacement) {
            replacement.setAttribute('data-heading', tag);
            replacement.setAttribute('data-material', 'true');
            el.parentNode.replaceChild(replacement, el);
          }
        }
      });
    }
  });

  // Blockquotes (引用/引入) Material Replacement
  const bqMatId = customStyles?.blockquote?.materialTemplateId || themeStyles?.blockquote?.materialTemplateId;
  if (bqMatId && bqMatId !== 'none' && allMaterialTemplatesMap[bqMatId]) {
    const tmpl = allMaterialTemplatesMap[bqMatId];
    root.querySelectorAll('blockquote').forEach(el => {
      if (isMaterialEl(el)) return;
      let contentHtml = el.innerHTML.trim();
      // If content is a single <p>...</p>, unwrap it to keep it inline with icons/quotes
      const pMatch = contentHtml.match(/^<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>$/i);
      if (pMatch) {
        contentHtml = pMatch[1].trim();
      }
      const renderedHtml = tmpl.render ? tmpl.render(contentHtml) : null;
      if (renderedHtml) {
        const tempContainer = doc.createElement('div');
        tempContainer.innerHTML = renderedHtml;
        const replacement = tempContainer.firstElementChild;
        if (replacement) {
          replacement.setAttribute('data-material', 'true');
          el.parentNode.replaceChild(replacement, el);
        }
      }
    });
  }

  // Dividers (分割线) Material Replacement
  const hrMatId = customStyles?.hr?.materialTemplateId || themeStyles?.hr?.materialTemplateId;
  if (hrMatId && hrMatId !== 'none' && allMaterialTemplatesMap[hrMatId]) {
    const tmpl = allMaterialTemplatesMap[hrMatId];
    root.querySelectorAll('hr').forEach(el => {
      if (isMaterialEl(el)) return;
      const renderedHtml = tmpl.render ? tmpl.render() : null;
      if (renderedHtml) {
        const tempContainer = doc.createElement('div');
        tempContainer.innerHTML = renderedHtml;
        const replacement = tempContainer.firstElementChild;
        if (replacement) {
          replacement.setAttribute('data-material', 'true');
          el.parentNode.replaceChild(replacement, el);
        }
      }
    });
  }

  // Lists (列表 ul/ol/li) Material Replacement
  const listMatId = customStyles?.li?.materialTemplateId || customStyles?.ul?.materialTemplateId || customStyles?.ol?.materialTemplateId || themeStyles?.li?.materialTemplateId;
  if (listMatId && listMatId !== 'none' && allMaterialTemplatesMap[listMatId]) {
    const tmpl = allMaterialTemplatesMap[listMatId];
    let liIndex = 0;
    root.querySelectorAll('li').forEach(el => {
      if (isMaterialEl(el)) return;
      liIndex++;
      const itemHtml = el.innerHTML.trim();
      const renderedHtml = tmpl.render ? tmpl.render(itemHtml, liIndex) : null;
      if (renderedHtml) {
        const tempContainer = doc.createElement('div');
        tempContainer.innerHTML = renderedHtml;
        const replacement = tempContainer.firstElementChild;
        if (replacement) {
          replacement.setAttribute('data-material', 'true');
          el.parentNode.replaceChild(replacement, el);
        }
      }
    });
  }

  // 2. Headings decoration matching theme personalities
  const isMountain = theme.id === 'classic-indigo' || theme.id.startsWith('mountain-') || !theme.typography;

  if (isMountain) {
    root.querySelectorAll('h1').forEach(el => {
      if (isMaterialEl(el)) return;
      const section = doc.createElement('section');
      section.setAttribute('data-heading', 'h1');
      section.setAttribute('style', cleanCss(`
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: ${colors.primary};
        margin-top: 32px;
        margin-bottom: 16px;
        line-height: 1.5em;
        letter-spacing: 0em;
      `));
      section.innerHTML = `<span class="prefix" style="display: none;"></span><span class="content" style="font-size: 24px; color: ${colors.primary}; line-height: 1.5em; font-weight: bold; display: block;">${el.innerHTML}</span><span class="suffix" style="display: none;"></span>`;
      el.parentNode.replaceChild(section, el);
    });

    root.querySelectorAll('h2').forEach(el => {
      if (isMaterialEl(el)) return;
      const section = doc.createElement('section');
      section.setAttribute('data-heading', 'h2');
      section.setAttribute('style', cleanCss(`
        margin-top: 28px;
        margin-bottom: 16px;
        padding-bottom: 6px;
        border-bottom: 3px solid ${colors.primary};
        display: block;
        clear: both;
      `));
      section.innerHTML = `<span style="font-size: 20px; font-weight: bold; color: ${colors.primary}; line-height: 1.5; display: inline-block;">${el.innerHTML}</span>`;
      el.parentNode.replaceChild(section, el);
    });

    // H3: read theme typography config so WeChat copy stays in sync with preview
    const T = theme.typography;
    const h3Spec = (T && T.h3) || {};
    root.querySelectorAll('h3').forEach(el => {
      if (isMaterialEl(el)) return;
      const section = doc.createElement('section');
      section.setAttribute('data-heading', 'h3');
      const h3FontSize = h3Spec.size || '18px';
      const h3Color = h3Spec.color || colors.text;
      const h3Weight = h3Spec.weight || 'bold';
      const h3MarginTop = h3Spec.marginTop || '15px';
      const h3MarginBottom = h3Spec.marginBottom || '15px';
      const h3Icon = h3Spec.iconUrl || 'https://files.mdnice.com/mountain_2.png';
      const h3IconSize = h3Spec.iconSize || '30px';
      const h3PadTop = h3Spec.textMarginTop || '38px';
      const h3Lh = h3Spec.lineHeight || '2.4em';
      section.setAttribute('style', cleanCss(`
        display: block;
        font-size: ${h3FontSize};
        font-weight: ${h3Weight};
        color: ${h3Color};
        margin-top: ${h3MarginTop};
        margin-bottom: ${h3MarginBottom};
        text-align: center;
        background-image: url('${h3Icon}');
        background-position: center top;
        background-repeat: no-repeat;
        background-size: ${h3IconSize} ${h3IconSize};
        padding-top: ${h3PadTop};
        line-height: ${h3Lh};
      `));
      section.innerHTML = el.innerHTML;
      el.parentNode.replaceChild(section, el);
    });

    root.querySelectorAll('h4').forEach(el => {
      if (isMaterialEl(el)) return;
      const section = doc.createElement('section');
      section.setAttribute('data-heading', 'h4');
      section.setAttribute('style', cleanCss(`
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: ${colors.text};
        margin-top: 22px;
        margin-bottom: 12px;
        border-left: 3px solid ${colors.primary};
        padding-left: 8px;
      `));
      section.innerHTML = el.innerHTML;
      el.parentNode.replaceChild(section, el);
    });
  } else {
    styleEl('h1', wechatTypo.h1 || `
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: ${colors.primary};
      margin-top: 32px;
      margin-bottom: 16px;
      line-height: 1.4em;
      border-bottom: 2px solid ${colors.primary};
      padding-bottom: 8px;
    `);
    styleEl('h2', wechatTypo.h2 || `
      display: block;
      font-size: 20px;
      font-weight: bold;
      color: ${colors.primary};
      margin-top: 28px;
      margin-bottom: 14px;
      border-left: 4px solid ${colors.primary};
      padding-left: 10px;
      line-height: 1.4em;
    `);
    styleEl('h3', wechatTypo.h3 || `
      display: block;
      font-size: 17px;
      font-weight: bold;
      color: ${colors.primary};
      margin-top: 22px;
      margin-bottom: 12px;
      line-height: 1.4em;
    `);
    styleEl('h4', wechatTypo.h4 || `
      display: block;
      font-size: 15px;
      font-weight: bold;
      color: ${colors.text};
      margin-top: 18px;
      margin-bottom: 10px;
      border-left: 3px solid ${colors.primary};
      padding-left: 8px;
    `);
  }
  styleEl('h5', wechatTypo.h5 || `
    display: block;
    font-size: 15px;
    font-weight: bold;
    color: #2b2b2b;
    margin-top: 15px;
    margin-bottom: 8px;
  `);
  styleEl('h6', wechatTypo.h6 || `
    display: block;
    font-size: 14px;
    font-weight: bold;
    color: ${colors.muted};
    margin-top: 15px;
    margin-bottom: 8px;
  `);

  // 3. Paragraphs & Text Elements (preserve explicit alignment if present)
  const pCustomColor = customStyles?.p?.color || customStyles?.body?.color;
  root.querySelectorAll('p').forEach(p => {
    if (isMaterialEl(p)) return;
    const existingAlign = p.getAttribute('align') || p.style.textAlign;
    const baseStyle = cleanCss(wechatTypo.p || `
      font-size: 16px;
      line-height: 2em;
      letter-spacing: 0.08em;
      color: ${colors.text};
      margin-top: 0;
      margin-bottom: 0;
      padding: 6px 0;
      text-align: justify;
    `);
    p.setAttribute('style', baseStyle);
    if (pCustomColor) {
      p.style.color = pCustomColor;
    }
    if (existingAlign) {
      p.style.textAlign = existingAlign;
    }
  });

  styleEl('strong', (wechatTypo.strong ? wechatTypo.strong + '; display: inline;' : `
    color: ${colors.primary};
    font-weight: bold;
    display: inline;
  `));

  styleEl('em', `
    font-style: italic;
    color: ${colors.primary};
    display: inline;
  `);

  styleEl('mark', `
    background-color: #fff566;
    color: #000000;
    padding: 2px 5px;
    border-radius: 3px;
    display: inline;
  `);

  styleEl('kbd', `
    font-family: Operator Mono, Consolas, Monaco, monospace;
    font-size: 12px;
    color: #24292e;
    background-color: #fafbfc;
    border: 1px solid #d1d5da;
    border-bottom-color: #c6cbd1;
    border-radius: 3px;
    box-shadow: inset 0 -1px 0 #c6cbd1;
    padding: 2px 5px;
    display: inline;
  `);

  styleEl('u', `text-decoration: underline; color: inherit; display: inline;`);
  styleEl('ins', `text-decoration: underline; color: inherit; display: inline;`);
  styleEl('del', `text-decoration: line-through; color: ${colors.muted}; display: inline;`);
  styleEl('s', `text-decoration: line-through; color: ${colors.muted}; display: inline;`);
  styleEl('strike', `text-decoration: line-through; color: ${colors.muted}; display: inline;`);
  styleEl('sub', `font-size: 11px; vertical-align: sub; line-height: 0;`);
  styleEl('sup', `font-size: 11px; vertical-align: super; line-height: 0;`);

  root.querySelectorAll('hr').forEach(hr => {
    const section = doc.createElement('section');
    section.setAttribute('style', cleanCss(`
      border: none;
      border-top: 1px solid ${colors.border};
      margin: 24px 0;
      display: block;
    `));
    hr.parentNode.replaceChild(section, hr);
  });

  // 4. Blockquotes
  styleEl('blockquote', wechatTypo.blockquote || `
    padding: 12px 20px;
    margin: 0 0 1.2em 0;
    background-color: ${colors.accentBg};
    border-left: 4px solid ${colors.primary};
    color: ${colors.text};
    border-radius: 4px;
  `);
  
  styleEl('blockquote p', wechatTypo.blockquoteP || `
    margin-bottom: 0;
    line-height: 1.6;
    color: ${colors.text};
  `);

  // 5. Lists
  styleEl('ul', `
    margin: 0 0 1.2em 0;
    padding-left: 18px;
    list-style-type: disc;
  `);

  styleEl('ol', `
    margin: 0 0 1.2em 0;
    padding-left: 18px;
    list-style-type: decimal;
  `);

  styleEl('li', `
    margin-bottom: 0.5em;
    line-height: 1.8;
    color: ${colors.text};
    height: auto;
  `);

  // Transform <li> children into <section> block wrappers to match mdnice structure
  // This ensures WeChat MP Editor's UEditor parser treats each list item as a unified block and NEVER breaks inline formatting tags on paste.
  root.querySelectorAll('li').forEach(li => {
    // 1. Convert task list checkboxes
    const checkbox = li.querySelector('input[type="checkbox"]');
    if (checkbox) {
      const isChecked = checkbox.checked || checkbox.hasAttribute('checked');
      const iconSpan = doc.createElement('span');
      if (isChecked) {
        iconSpan.innerHTML = '☑ ';
        iconSpan.setAttribute('style', 'color: #2563eb; font-weight: bold; margin-right: 4px; display: inline;');
      } else {
        iconSpan.innerHTML = '☐ ';
        iconSpan.setAttribute('style', 'color: #94a3b8; font-weight: bold; margin-right: 4px; display: inline;');
      }
      checkbox.parentNode.replaceChild(iconSpan, checkbox);
      li.setAttribute('style', cleanCss(`
        list-style: none !important;
        margin-bottom: 0.5em;
        line-height: 1.8;
        color: ${colors.text};
      `));
    }

    // 2. Wrap non-sublist content inside <li> into a <section> block (matching mdnice)
    const childNodes = Array.from(li.childNodes);
    let inlineGroup = [];

    const flushGroup = () => {
      if (inlineGroup.length === 0) return;
      const hasContent = inlineGroup.some(n => {
        if (n.nodeType === 3) return n.nodeValue.trim().length > 0;
        return true;
      });
      if (!hasContent) {
        inlineGroup.forEach(n => {
          if (n.nodeType === 3 && n.nodeValue.trim().length === 0) n.remove();
        });
        inlineGroup = [];
        return;
      }

      if (inlineGroup.length === 1 && inlineGroup[0].nodeType === 1 && ['P', 'SECTION', 'DIV'].includes(inlineGroup[0].tagName)) {
        const block = inlineGroup[0];
        const section = doc.createElement('section');
        section.setAttribute('style', cleanCss(`
          margin-top: 5px;
          margin-bottom: 5px;
          color: ${colors.text};
          font-size: 16px;
          line-height: 1.8em;
          letter-spacing: 0em;
          text-align: left;
          font-weight: normal;
        `));
        while (block.firstChild) section.appendChild(block.firstChild);
        block.parentNode.replaceChild(section, block);
      } else {
        const section = doc.createElement('section');
        section.setAttribute('style', cleanCss(`
          margin-top: 5px;
          margin-bottom: 5px;
          color: ${colors.text};
          font-size: 16px;
          line-height: 1.8em;
          letter-spacing: 0em;
          text-align: left;
          font-weight: normal;
        `));
        inlineGroup[0].parentNode.insertBefore(section, inlineGroup[0]);
        inlineGroup.forEach(node => section.appendChild(node));
      }
      inlineGroup = [];
    };

    childNodes.forEach(node => {
      if (node.nodeType === 1 && ['UL', 'OL'].includes(node.tagName)) {
        flushGroup();
      } else {
        inlineGroup.push(node);
      }
    });
    flushGroup();
  });

  // 6. Links
  styleEl('a', wechatTypo.a || `
    color: ${colors.primary};
    text-decoration: none;
  `);

  // 7. Inline Codes (Strictly isolated: ONLY target inline <code>, never code inside <pre>)
  const inlineCodeColor = customStyles?.code?.color || colors.codeTextTheme || colors.codeText || '#bb2243';
  const inlineCodeBg = customStyles?.code?.backgroundColor || colors.codeBg || 'rgba(27, 31, 35, 0.05)';
  root.querySelectorAll('code').forEach(codeEl => {
    if (codeEl.closest('pre') || isMaterialEl(codeEl)) return;
    const existing = codeEl.getAttribute('style') || '';
    const inlineStyle = cleanCss(`
      font-family: "SF Mono", Consolas, Monaco, Menlo, monospace;
      font-size: 14px;
      color: ${inlineCodeColor};
      background-color: ${inlineCodeBg};
      padding: 2px 5px;
      border-radius: 4px;
      display: inline;
      word-break: break-word;
    `);
    codeEl.setAttribute('style', existing ? existing + '; ' + inlineStyle : inlineStyle);
  });

  // 8. Code Blocks (Strictly isolated: styled according to selected codeTheme, with resilient section wrapper for WeChat MP)
  const isMacStyle = customStyles?.code?.macStyle !== false;
  const showCodeLang = customStyles?.code?.showLang === true;
  const codeFontSize = customStyles?.code?.fontSize || '13.5px';
  const codeLineHeight = customStyles?.code?.lineHeight || '1.7';
  const codeLetterSpacing = customStyles?.code?.letterSpacing || '0px';
  const codeFontFamily = customStyles?.code?.fontFamily || 'Consolas, Monaco, Menlo, "Courier New", Courier, monospace';

  // Strictly isolate code block background & text from inline code colors; Mac topbar matches code background seamlessly
  const codeBg = customStyles?.pre?.backgroundColor || codeStyles.bg || '#282c34';
  const codeText = customStyles?.pre?.color || codeStyles.text || '#abb2bf';
  const macBg = codeBg; // Keep 100% unified background color to eliminate visual seams
  const macText = codeStyles.macText || '#7f848e';

  root.querySelectorAll('pre').forEach(pre => {
    // Extract language name from code class or data-lang
    let langName = '';
    const codeTag = pre.querySelector('code');
    if (codeTag) {
      const match = codeTag.className.match(/(?:language|lang)-(\w+)/);
      if (match) {
        langName = match[1].toUpperCase();
      }
    }
    if (!langName && pre.getAttribute('data-lang')) {
      langName = (pre.getAttribute('data-lang') || '').toUpperCase();
    }
    if (langName === 'TEXT') {
      langName = '';
    }

    // 1. Outer section container - prevents WeChat UEditor from stripping code block styles
    const wrapper = doc.createElement('section');
    wrapper.className = 'code-snippet__fix custom';
    wrapper.setAttribute('data-code-block', 'true');
    wrapper.setAttribute('data-material', 'true');
    wrapper.setAttribute('data-tool', 'mdnice编辑器');
    wrapper.setAttribute('data-website', 'https://www.mdnice.com');
    wrapper.setAttribute('style', cleanCss(`
      margin-top: 16px;
      margin-bottom: 16px;
      margin-left: 0px;
      margin-right: 0px;
      padding-top: 0px;
      padding-bottom: 0px;
      padding-left: 0px;
      padding-right: 0px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.08);
      background-color: ${codeBg};
      overflow: hidden;
      display: block;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      text-align: left;
    `));

    // 2. Mac terminal 3-dots header
    if (isMacStyle) {
      const header = doc.createElement('section');
      header.setAttribute('style', cleanCss(`
        display: block;
        height: 28px;
        background-color: ${codeBg};
        padding: 0 14px;
        line-height: 28px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        box-sizing: border-box;
        overflow: hidden;
        text-align: left;
      `));
      
      const langSpan = (showCodeLang && langName) 
        ? `<span style="display: block; float: right; font-size: 10px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${macText}; text-transform: uppercase; letter-spacing: 0.05em; line-height: 28px;">${langName}</span>`
        : '';

      header.innerHTML = `
        <span style="display: inline-block; vertical-align: middle; line-height: 0; font-size: 0;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ff5f56; margin-right: 6px; vertical-align: middle;"></span>
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ffbd2e; margin-right: 6px; vertical-align: middle;"></span>
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #27c93f; vertical-align: middle;"></span>
        </span>
        ${langSpan}
      `;
      wrapper.appendChild(header);
    } else if (showCodeLang && langName) {
      // If not Mac style but showCodeLang is enabled, render a subtle top-right badge
      const header = doc.createElement('section');
      header.setAttribute('style', cleanCss(`
        display: block;
        height: 24px;
        background-color: ${codeBg};
        padding: 0 12px;
        line-height: 24px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        box-sizing: border-box;
        overflow: hidden;
        text-align: right;
      `));
      header.innerHTML = `<span style="font-size: 10px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${macText}; text-transform: uppercase; letter-spacing: 0.05em;">${langName}</span>`;
      wrapper.appendChild(header);
    }

    // 3. Create clean pre element
    const preNew = doc.createElement('pre');
    preNew.className = 'custom';
    preNew.setAttribute('style', cleanCss(`
      margin: 0;
      padding: ${isMacStyle ? '4px 16px 14px 16px' : '14px 16px'};
      background-color: ${codeBg};
      border-radius: ${isMacStyle ? '0 0 8px 8px' : '8px'};
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
      display: block;
      width: 100%;
      text-align: left;
      white-space: pre;
      word-wrap: normal;
    `));

    // 4. Create code element with highlight styles
    const codeTagNew = doc.createElement('code');
    codeTagNew.className = 'hljs';
    codeTagNew.setAttribute('style', cleanCss(`
      display: block;
      background: transparent;
      color: ${codeText};
      font-family: ${codeFontFamily};
      font-size: ${codeFontSize};
      line-height: ${codeLineHeight};
      letter-spacing: ${codeLetterSpacing};
      white-space: pre;
      word-break: normal;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      border-radius: 0;
    `));

    // Copy children from original code tag
    if (codeTag) {
      while (codeTag.firstChild) {
        codeTagNew.appendChild(codeTag.firstChild);
      }
    } else {
      while (pre.firstChild) {
        codeTagNew.appendChild(pre.firstChild);
      }
    }

    // 5. Transform text nodes: convert multi-spaces to non-breaking spaces (\u00a0) to preserve indentation in WeChat
    const processNode = (node) => {
      if (node.nodeType === 3) {
        const raw = node.nodeValue || '';
        // Replace leading/multiple spaces with non-breaking spaces
        node.nodeValue = raw.replace(/ {2,}/g, match => '\u00a0'.repeat(match.length));
      } else if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach(child => processNode(child));
      }
    };
    Array.from(codeTagNew.childNodes).forEach(child => processNode(child));

    // 6. Inline highlight.js token syntax colors with explicit font inherit
    const styleSpan = (selectors, styleStr) => {
      selectors.forEach(sel => {
        try {
          codeTagNew.querySelectorAll(sel).forEach(el => {
            const existing = el.getAttribute('style') || '';
            el.setAttribute('style', cleanCss(`${existing}; ${styleStr}`));
          });
        } catch (e) {}
      });
    };

    styleSpan(['.hljs-keyword', '.hljs-selector-tag', '.hljs-tag', '.hljs-name'], `color: ${codeStyles.keyword || '#c678dd'}; font-weight: bold;`);
    styleSpan(['.hljs-string', '.hljs-regexp', '.hljs-addition', '.hljs-attribute', '.hljs-template-variable', '.hljs-symbol'], `color: ${codeStyles.string || '#98c379'};`);
    styleSpan(['.hljs-number', '.hljs-literal'], `color: ${codeStyles.number || codeStyles.literal || '#d19a66'};`);
    styleSpan(['.hljs-type', '.hljs-built_in', '.hljs-class', '.hljs-title.class_'], `color: ${codeStyles.builtIn || codeStyles.type || codeStyles.title || '#e6c07b'};`);
    styleSpan(['.hljs-title', '.hljs-function', '.hljs-section', '.hljs-title.function_'], `color: ${codeStyles.title || '#61aeee'};`);
    styleSpan(['.hljs-attr', '.hljs-property'], `color: ${codeStyles.attr || codeStyles.property || '#d19a66'};`);
    styleSpan(['.hljs-comment', '.hljs-quote', '.hljs-deletion', '.hljs-doctag'], `color: ${codeStyles.comment || '#7f848e'}; font-style: italic;`);
    styleSpan(['.hljs-meta', '.hljs-operator', '.hljs-punctuation'], `color: ${codeStyles.meta || codeStyles.operator || '#56b6c2'};`);
    styleSpan(['.hljs-variable', '.hljs-params', '.hljs-subst', '.hljs-variable.language_'], `color: ${codeStyles.variable || codeStyles.property || '#abb2bf'};`);
    styleSpan(['.hljs-bullet'], `color: ${codeStyles.string || '#98c379'};`);
    styleSpan(['.hljs-emphasis'], `font-style: italic;`);
    styleSpan(['.hljs-strong'], `font-weight: bold;`);

    // Ensure all span tags in code maintain baseline and font inheritance
    codeTagNew.querySelectorAll('span').forEach(span => {
      const s = span.getAttribute('style') || '';
      span.setAttribute('style', cleanCss(`${s}; font-family: inherit; font-size: inherit; line-height: inherit; display: inline;`));
    });

    preNew.appendChild(codeTagNew);
    wrapper.appendChild(preNew);

    if (pre.parentNode) {
      pre.parentNode.replaceChild(wrapper, pre);
    }
  });

  // 9. Tables (wrapped in overflow container with zebra striping and explicit cell alignment)
  root.querySelectorAll('table').forEach(table => {
    table.setAttribute('style', cleanCss(`
      border-collapse: collapse;
      width: 100%;
      margin: 0;
      font-size: 14px;
      display: table;
      text-align: left;
    `));

    // Cell explicit styling & alignment
    table.querySelectorAll('th, td').forEach(cell => {
      const align = cell.getAttribute('align') || cell.style.textAlign || 'left';
      const isHeader = cell.tagName.toLowerCase() === 'th';
      const cellBg = isHeader ? (colors.accentBg || colors.bgLight || '#f0f0f0') : 'inherit';
      cell.setAttribute('style', cleanCss(`
        border: 1px solid ${colors.border || '#e1e4e8'};
        padding: 8px 12px;
        min-width: 85px;
        text-align: ${align};
        background-color: ${cellBg};
        font-weight: ${isHeader ? 'bold' : 'normal'};
      `));
    });

    // Zebra striping on rows
    table.querySelectorAll('tbody tr').forEach((tr, i) => {
      const rowBg = (i % 2 === 1) ? 'rgba(0, 0, 0, 0.02)' : '#ffffff';
      tr.setAttribute('style', `background-color: ${rowBg};`);
    });

    // Wrap in section.table-container for mobile horizontal scrolling in WeChat MP Editor
    const parent = table.parentNode;
    if (parent && !parent.classList.contains('table-container')) {
      const container = doc.createElement('section');
      container.className = 'table-container';
      container.setAttribute('data-tool', 'NiceMD编辑器');
      container.setAttribute('style', cleanCss('margin: 16px 0; padding: 0; overflow-x: auto; display: block;'));
      parent.replaceChild(container, table);
      container.appendChild(table);
    }
  });

  // 11. Convert LaTeX Math Formulas (KaTeX) into high-resolution transparent PNG images via CodeCogs
  
  // Pass A: Process any unrendered math wrappers containing raw text ($...$ or $$...$$)
  root.querySelectorAll('.math-block, .math-inline').forEach(el => {
    const text = el.textContent.trim();
    const isBlock = el.classList.contains('math-block');
    const hasDelimiters = isBlock 
      ? text.startsWith('$$') && text.endsWith('$$')
      : text.startsWith('$') && text.endsWith('$');

    if (hasDelimiters) {
      const rawFormula = isBlock ? text.slice(2, -2) : text.slice(1, -1);
      const latexCode = rawFormula.trim();
      if (!latexCode) return;

      const hexColor = colors.primary.replace('#', '').toUpperCase();
      const dpi = isBlock ? '140' : '130';
      const fullLatex = `\\dpi{${dpi}} \\bg{transparent} \\fg{${hexColor}} ${latexCode}`;
      const encodedLatex = encodeURIComponent(fullLatex)
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
      const imageUrl = `https://latex.codecogs.com/png.image?${encodedLatex}`;

      const img = doc.createElement('img');
      img.src = imageUrl;
      img.alt = latexCode;
      img.setAttribute('class', isBlock ? 'math-block-img' : 'math-inline-img');
      img.setAttribute('data-katex', isBlock ? 'block' : 'inline');

      if (isBlock) {
        img.setAttribute('style', cleanCss(`
          display: block !important;
          margin: 20px auto !important;
          max-width: 100% !important;
          height: auto !important;
        `));
        if (el.parentNode) {
          el.parentNode.replaceChild(img, el);
        }
      } else {
        img.setAttribute('style', cleanCss(`
          display: inline-block !important;
          vertical-align: middle !important;
          margin: 0 3px !important;
          height: 1.15em !important;
          width: auto !important;
          max-width: 100% !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        `));
        if (el.parentNode) {
          el.parentNode.replaceChild(img, el);
        }
      }
    }
  });

  // Pass B: Process already rendered KaTeX elements
  root.querySelectorAll('.katex').forEach(katexEl => {
    const annotation = katexEl.querySelector('annotation');
    if (!annotation) return;

    const latexCode = annotation.textContent.trim();
    if (!latexCode) return;

    const isBlock = Boolean(
      katexEl.closest('.math-block') || 
      katexEl.classList.contains('katex-display') ||
      katexEl.closest('.katex-display')
    );

    const hexColor = colors.primary.replace('#', '').toUpperCase();
    const dpi = isBlock ? '140' : '130';
    const fullLatex = `\\dpi{${dpi}} \\bg{transparent} \\fg{${hexColor}} ${latexCode}`;
    const encodedLatex = encodeURIComponent(fullLatex)
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
    const imageUrl = `https://latex.codecogs.com/png.image?${encodedLatex}`;

    const img = doc.createElement('img');
    img.src = imageUrl;
    img.alt = latexCode;
    img.setAttribute('class', isBlock ? 'math-block-img' : 'math-inline-img');
    img.setAttribute('data-katex', isBlock ? 'block' : 'inline');

    if (isBlock) {
      img.setAttribute('style', cleanCss(`
        display: block !important;
        margin: 20px auto !important;
        max-width: 100% !important;
        height: auto !important;
      `));
      
      const parentMathBlock = katexEl.closest('.math-block');
      if (parentMathBlock && parentMathBlock.parentNode) {
        parentMathBlock.parentNode.replaceChild(img, parentMathBlock);
      } else if (katexEl.parentNode) {
        katexEl.parentNode.replaceChild(img, katexEl);
      }
    } else {
      img.setAttribute('style', cleanCss(`
        display: inline-block !important;
        vertical-align: middle !important;
        margin: 0 3px !important;
        height: 1.15em !important;
        width: auto !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
      `));
      if (katexEl.parentNode) {
        katexEl.parentNode.replaceChild(img, katexEl);
      }
    }
  });

  // 12. Convert Mermaid Diagrams to High-Definition SVG Images for WeChat MP
  root.querySelectorAll('.mermaid').forEach((mNode, idx) => {
    let svgEl = mNode.querySelector('svg');
    if (!svgEl && typeof document !== 'undefined') {
      const docMermaids = document.querySelectorAll('.mermaid');
      if (docMermaids[idx]) {
        svgEl = docMermaids[idx].querySelector('svg');
      }
    }

    if (svgEl) {
      const clonedSvg = svgEl.cloneNode(true);
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const encodedSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

      const img = doc.createElement('img');
      img.src = encodedSvg;
      img.alt = 'Mermaid Diagram';
      img.setAttribute('class', 'mermaid-img');
      img.setAttribute('style', cleanCss(`
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
        margin: 16px auto !important;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      `));
      mNode.parentNode.replaceChild(img, mNode);
    }
  });

  // 13. Images styling (Differentiate inline math images from regular images)
  root.querySelectorAll('img').forEach(img => {
    const isInlineMath = img.classList.contains('math-inline-img') || img.getAttribute('data-katex') === 'inline';
    if (isInlineMath) {
      img.setAttribute('style', cleanCss(`
        display: inline-block !important;
        vertical-align: middle !important;
        margin: 0 3px !important;
        height: 1.15em !important;
        width: auto !important;
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
      `));
    } else if (!isMaterialEl(img)) {
      img.setAttribute('style', cleanCss(`
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
        margin: 16px auto !important;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      `));
    }
  });

  convertImageContainersAndMargins(root, colors);

  // Downgrade external hyperlinks to satisfy WeChat MP editor link policies by replacing them with <span>
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isWeChatDomain = href.includes('mp.weixin.qq.com') || href.startsWith('weixin://');
    if (!isWeChatDomain) {
      const span = doc.createElement('span');
      // Copy all attributes from <a> to <span> (like style, class, etc.) except href, target, rel
      for (let i = 0; i < a.attributes.length; i++) {
        const attr = a.attributes[i];
        if (attr.name !== 'href' && attr.name !== 'target' && attr.name !== 'rel') {
          span.setAttribute(attr.name, attr.value);
        }
      }
      // Move child nodes
      while (a.firstChild) {
        span.appendChild(a.firstChild);
      }
      a.parentNode.replaceChild(span, a);
    }
  });

  // Apply custom CSS source rules (e.g. #nice code, xiaofu code, h1) written in Theme Customizer
  applyCustomCssRules(root, customCss);

  // Convert inline non-standard tags (mark, del, kbd, sub, sup, code) & li p to <span> for WeChat
  convertNonStandardInlineTagsToSpans(root);

  // Insert Global Header and Footer Widgets if configured in customStyles or themeStyles
  const headerWidgetId = customStyles?.globalWidgets?.headerWidgetId || themeStyles?.globalWidgets?.headerWidgetId;
  if (headerWidgetId && headerWidgetId !== 'none' && allMaterialTemplatesMap[headerWidgetId]) {
    const tmpl = allMaterialTemplatesMap[headerWidgetId];
    const headerHtml = tmpl.render ? tmpl.render({
      summary: customStyles?.globalWidgets?.headerSummary,
      readTime: customStyles?.globalWidgets?.headerReadTime,
      guideText: customStyles?.globalWidgets?.headerGuideText
    }) : '';
    if (headerHtml) {
      const temp = doc.createElement('div');
      temp.innerHTML = headerHtml;
      if (temp.firstElementChild) {
        temp.firstElementChild.setAttribute('data-material', 'true');
        root.insertBefore(temp.firstElementChild, root.firstChild);
      }
    }
  }

  const footerWidgetId = customStyles?.globalWidgets?.footerWidgetId || themeStyles?.globalWidgets?.footerWidgetId;
  if (footerWidgetId && footerWidgetId !== 'none' && allMaterialTemplatesMap[footerWidgetId]) {
    const tmpl = allMaterialTemplatesMap[footerWidgetId];
    const footerHtml = tmpl.render ? tmpl.render({
      author: customStyles?.globalWidgets?.footerAuthor,
      desc: customStyles?.globalWidgets?.footerDesc,
      tip: customStyles?.globalWidgets?.footerTip,
      title: customStyles?.globalWidgets?.footerTitle,
      subTitle: customStyles?.globalWidgets?.footerSubTitle
    }) : '';
    if (footerHtml) {
      const temp = doc.createElement('div');
      temp.innerHTML = footerHtml;
      if (temp.firstElementChild) {
        temp.firstElementChild.setAttribute('data-material', 'true');
        root.appendChild(temp.firstElementChild);
      }
    }
  }

  // Remove top margin on first element inside article body to prevent massive blank header gap
  if (root.firstElementChild) {
    const removeTopMargin = (el) => {
      if (!el) return;
      const existingStyle = el.getAttribute('style') || '';
      let cleaned = existingStyle.replace(/margin-top\s*:\s*[^;]+;?/gi, '').trim();
      if (cleaned && !cleaned.endsWith(';')) cleaned += ';';
      el.setAttribute('style', cleanCss(cleaned + ' margin-top: 0 !important;'));
    };
    removeTopMargin(root.firstElementChild);
    if (root.firstElementChild.firstElementChild) {
      removeTopMargin(root.firstElementChild.firstElementChild);
    }
  }

  root.setAttribute('id', 'nice');
  root.setAttribute('data-tool', 'NiceMD编辑器');
  root.setAttribute('data-website', 'https://github.com/chengxy-nds/nice-md');

  // Resolve all CSS variables (var(--...)) into explicit color values so WeChat MP UEditor never strips styles
  resolveAllCssVariables(root, themeStyles);

  let finalHtml = root.outerHTML;
  // Clean all whitespace (spaces/tabs/newlines) between list tags so WeChat's parser doesn't create empty list items
  finalHtml = finalHtml.replace(/(<\/li>|<\/ol>|<\/ul>|<ol[^>]*>|<ul[^>]*>)\s+(<li>|<ol[^>]*>|<ul[^>]*>|<\/ol>|<\/ul>)/gi, '$1$2');
  finalHtml = finalHtml.replace(/(<\/li>|<\/ol>|<\/ul>|<ol[^>]*>|<ul[^>]*>)\s+(<li>|<ol[^>]*>|<ul[^>]*>|<\/ol>|<\/ul>)/gi, '$1$2');

  return finalHtml;
}


/**
 * Clean empty list items from raw HTML compiled from Markdown.
 */
export function cleanEmptyListItems(html) {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  doc.querySelectorAll('li').forEach(li => {
    const text = li.textContent.replace(/[\u200B-\u200D\uFEFF\u00A0\s]/g, '');
    const hasMedia = li.querySelector('img, iframe, code, pre, svg, video, audio, canvas') !== null;
    if (text === '' && !hasMedia) {
      li.remove();
    }
  });
  
  return doc.body.innerHTML;
}

// ── WYSIWYG: capture live preview DOM → inline-styled WeChat HTML ─────────

const STYLE_PROPS = [
  // Text & font
  'font-size', 'font-family', 'font-weight', 'font-style',
  'color', 'line-height', 'letter-spacing', 'text-align',
  'text-decoration', 'text-decoration-line', 'text-decoration-color',
  'word-break', 'overflow-wrap', 'word-wrap', 'white-space',
  'text-indent', 'text-transform', 'font-variant',
  // Box model
  'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
  'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
  // Background
  'background-color', 'background-image', 'background-size',
  'background-position', 'background-repeat', 'background-origin',
  'background-clip', 'background-attachment',
  // Borders — shorthands first (useful in Chrome), then every longhand for Firefox/Safari
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-top-width', 'border-top-style', 'border-top-color',
  'border-right-width', 'border-right-style', 'border-right-color',
  'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
  'border-left-width', 'border-left-style', 'border-left-color',
  'border-radius', 'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'border-collapse', 'border-spacing',
  // Visual
  'box-shadow', 'text-shadow', 'opacity',
  'outline', 'outline-offset',
  // Layout & flow
  'display', 'vertical-align',
  'width', 'min-width', 'max-width',
  'height', 'min-height', 'max-height',
  'overflow', 'overflow-x', 'overflow-y',
  'box-sizing',
  // Positioning
  'position', 'top', 'right', 'bottom', 'left', 'z-index',
  'float', 'clear',
  // Flex / Grid (for preview layouts that use them)
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
  'justify-content', 'align-items', 'align-content', 'align-self',
  'gap', 'row-gap', 'column-gap',
  'grid-template-columns', 'grid-template-rows',
  // List
  'list-style-type', 'list-style-position',
  // Table
  'table-layout',
  // Misc
  'object-fit', 'object-position',
  'visibility',
  'cursor',
  'pointer-events',
  'user-select',
];

function cleanCssInline(css) {
  return css.replace(/\s+/g, ' ').trim();
}

/**
 * Read computed styles from a live DOM element and apply as inline styles
 * to a clone element. This guarantees WYSIWYG.
 *
 * We skip default/meaningless values aggressively so the output doesn't
 * bloat — WeChat has a practical size limit for pasted HTML.
 */
function inlineComputedStyle(liveEl, cloneEl) {
  const cs = window.getComputedStyle(liveEl);
  const props = [];
  for (const prop of STYLE_PROPS) {
    const val = cs.getPropertyValue(prop);
    // Skip empty / default keyword values
    if (!val || val === 'normal' || val === 'none' || val === 'auto') continue;
    // Skip transparent / fully-transparent colors
    if (val === 'rgba(0, 0, 0, 0)' || val === 'transparent') continue;
    // Skip zero margins and paddings
    if (val === '0px' && /^(margin|padding)/.test(prop)) continue;
    // Skip zero-width borders and outlines
    if (val === '0px' && /^(border|outline)-.*width/.test(prop)) continue;
    // Skip "separate" border-collapse (the browser default)
    if (val === 'separate' && prop === 'border-collapse') continue;
    // Skip static position (default)
    if (val === 'static' && prop === 'position') continue;
    // Skip visible overflow/visibility (defaults)
    if (val === 'visible' && /^(overflow|visibility)/.test(prop)) continue;
    // Skip baseline vertical-align (default)
    if (val === 'baseline' && prop === 'vertical-align') continue;
    // Skip default cursor
    if (val === 'auto' && prop === 'cursor') continue;
    // Skip "inline" display for spans (the default) and "block" for divs
    // to reduce bloat — but keep for other elements
    if (val === 'inline' && prop === 'display') continue;
    // Skip "0s" transitions
    if (val === '0s' && /transition/.test(prop)) continue;

    // Skip fixed box sizing and positioning props on inline text elements to avoid text collision in WeChat
    const isTextTag = /^(SPAN|P|LI|CODE|STRONG|EM|MARK|KBD|A|DEL|S|INS|SUB|SUP|H1|H2|H3|H4|H5|H6)$/i.test(cloneEl.tagName);
    if (isTextTag) {
      if (/^(width|height|min-width|max-width|min-height|max-height|position|top|right|bottom|left|float|z-index)/.test(prop)) continue;
    }

    props.push(prop + ': ' + val);
  }

  // ── img fallbacks (essential for WeChat) ──
  if (cloneEl.tagName === 'IMG') {
    if (!props.some(p => p.startsWith('max-width'))) props.push('max-width: 100% !important');
    if (!props.some(p => p.startsWith('display'))) props.push('display: block !important');
    if (!props.some(p => p.startsWith('height') || p.startsWith('max-height')))
      props.push('height: auto !important');
    props.push('margin: 0 auto !important');
    props.push('margin-top: 16px !important');
    props.push('margin-bottom: 16px !important');
  }

  // Preserve existing inline style (e.g. from hljs syntax spans, mermaid diagrams)
  const existing = cloneEl.getAttribute('style');
  if (existing) {
    // Resolve any remaining var() expressions because WeChat MP Editor ignores styles with var()
    const resolvedExisting = existing.replace(/var\(--([^,\s)]+)(?:,\s*([^)]+))?\)/g, (m, varName, fallback) => {
      return fallback ? fallback.trim() : '#5f6caf';
    });
    props.push(resolvedExisting);
  }

  cloneEl.setAttribute('style', cleanCssInline(props.join('; ')));
}

/**
 * Convert image wrappers (<p> or <figure>) to <section> and apply explicit 
 * top/bottom margins and center alignment so WeChat MP Editor never strips image margins.
 */
function convertImageContainersAndMargins(root, colors = {}) {
  const doc = root.ownerDocument || document;
  const mutedColor = colors.muted || '#7f7f7f';

  root.querySelectorAll('img').forEach(img => {
    // Skip material templates
    if (isMaterialEl(img)) return;

    // Skip inline math formula images
    if (img.classList.contains('math-inline-img')) return;

    const isBlockMath = img.classList.contains('math-block-img');

    // Ensure img itself has explicit block & margin inline styles
    const existingStyle = img.getAttribute('style') || '';
    const cleanExisting = existingStyle
      .replace(/margin-[^;]+;?/gi, '')
      .replace(/margin:[^;]+;?/gi, '')
      .replace(/display:[^;]+;?/gi, '')
      .replace(/max-width:[^;]+;?/gi, '');

    const imgStyle = `
      display: block !important;
      max-width: 100% !important;
      height: auto !important;
      margin: 0 auto !important;
      margin-top: 12px !important;
      margin-bottom: 12px !important;
      border-radius: 8px;
      box-shadow: ${isBlockMath ? 'none' : '0 4px 12px rgba(0,0,0,0.06)'};
    `;
    img.setAttribute('style', cleanCss(cleanExisting + ';' + imgStyle));

    // Get alt text for caption
    const altText = (img.getAttribute('alt') || '').trim();
    const hasMeaningfulAlt = altText && !/^(image|img|photo|pic|figure|\d+|https?:\/\/)/i.test(altText);

    // Parent container check (<p>, <figure>, <div>, etc.)
    const parent = img.parentNode;
    if (!parent) return;

    const parentTag = parent.tagName.toLowerCase();

    // If parent is <p> or <figure>
    if (parentTag === 'p' || parentTag === 'figure') {
      const section = doc.createElement('section');
      section.setAttribute('data-role', 'image-container');
      section.setAttribute('style', cleanCss(`
        margin-top: 20px !important;
        margin-bottom: 20px !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 0 !important;
        text-align: center !important;
        clear: both !important;
      `));

      const figcaption = parent.querySelector('figcaption, .caption');

      while (parent.firstChild) {
        section.appendChild(parent.firstChild);
      }

      if (hasMeaningfulAlt && !figcaption && !section.querySelector('.img-caption')) {
        const captionSec = doc.createElement('section');
        captionSec.className = 'img-caption';
        captionSec.setAttribute('style', cleanCss(`
          font-size: 13px !important;
          color: ${mutedColor} !important;
          text-align: center !important;
          margin-top: 8px !important;
          margin-bottom: 4px !important;
          line-height: 1.6 !important;
          letter-spacing: 0.05em !important;
        `));
        captionSec.textContent = altText;
        section.appendChild(captionSec);
      } else if (figcaption) {
        figcaption.setAttribute('style', cleanCss(`
          font-size: 13px !important;
          color: ${mutedColor} !important;
          text-align: center !important;
          margin-top: 8px !important;
          margin-bottom: 4px !important;
          line-height: 1.6 !important;
        `));
      }

      parent.parentNode.replaceChild(section, parent);
    } else if (parentTag !== 'section' || parent.getAttribute('data-role') !== 'image-container') {
      // If image is not inside an image-container <section>, wrap it
      const section = doc.createElement('section');
      section.setAttribute('data-role', 'image-container');
      section.setAttribute('style', cleanCss(`
        margin-top: 20px !important;
        margin-bottom: 20px !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 0 !important;
        text-align: center !important;
        clear: both !important;
      `));

      parent.insertBefore(section, img);
      section.appendChild(img);

      if (hasMeaningfulAlt) {
        const captionSec = doc.createElement('section');
        captionSec.className = 'img-caption';
        captionSec.setAttribute('style', cleanCss(`
          font-size: 13px !important;
          color: ${mutedColor} !important;
          text-align: center !important;
          margin-top: 8px !important;
          margin-bottom: 4px !important;
          line-height: 1.6 !important;
          letter-spacing: 0.05em !important;
        `));
        captionSec.textContent = altText;
        section.appendChild(captionSec);
      }
    }
  });
}

/**
 * Convert headings to <section> so WeChat editor doesn't override styles.
 */
function convertHeadingsToSections(root) {
  root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
    if (isMaterialEl(h)) return;
    const tag = h.tagName.toLowerCase();
    const section = document.createElement('section');
    section.setAttribute('data-heading', tag);
    const style = h.getAttribute('style') || '';
    section.setAttribute('style', style + (style.includes('display:') ? '' : '; display: block'));
    while (h.firstChild) section.appendChild(h.firstChild);
    h.parentNode.replaceChild(section, h);
  });
}

/**
 * Clean whitespace/newlines inside <li> and ensure native inline formatting tags carry inline styles.
 */
function convertNonStandardInlineTagsToSpans(root) {
  // 1. Clean all newlines recursively inside <li> text nodes so WeChat paste filter doesn't convert \n to <br> or paragraphs
  root.querySelectorAll('li').forEach(li => {
    const cleanNode = (node) => {
      if (node.nodeType === 3 /* Text Node */ && node.nodeValue) {
        node.nodeValue = node.nodeValue.replace(/[\r\n]+/g, '');
      } else if (node.nodeType === 1 /* Element Node */) {
        node.childNodes.forEach(cleanNode);
      }
    };
    li.childNodes.forEach(cleanNode);
  });

  // 2. Ensure native inline formatting tags carry explicit inline styles for WeChat compatibility
  root.querySelectorAll('strong, b').forEach(el => {
    if (isMaterialEl(el)) return;
    const existing = el.getAttribute('style') || '';
    if (!/font-weight/i.test(existing)) {
      el.setAttribute('style', (existing ? existing + '; ' : '') + 'font-weight: bold;');
    }
  });

  root.querySelectorAll('em, i').forEach(el => {
    if (isMaterialEl(el)) return;
    const existing = el.getAttribute('style') || '';
    if (!/font-style/i.test(existing)) {
      el.setAttribute('style', (existing ? existing + '; ' : '') + 'font-style: italic;');
    }
  });

  root.querySelectorAll('u, ins').forEach(el => {
    if (isMaterialEl(el)) return;
    const existing = el.getAttribute('style') || '';
    if (!/text-decoration/i.test(existing)) {
      el.setAttribute('style', (existing ? existing + '; ' : '') + 'text-decoration: underline;');
    }
  });

  root.querySelectorAll('del, s, strike').forEach(el => {
    if (isMaterialEl(el)) return;
    const existing = el.getAttribute('style') || '';
    if (!/text-decoration/i.test(existing)) {
      el.setAttribute('style', (existing ? existing + '; ' : '') + 'text-decoration: line-through;');
    }
  });
}

/**
 * Parses custom CSS rules written in Theme Customizer Source Mode
 * and applies matching declarations as inline styles onto root elements.
 */
function applyCustomCssRules(root, customCss) {
  if (!customCss || typeof customCss !== 'string') return;
  const cleanCssStr = (css) => css.replace(/\s+/g, ' ').trim();

  const ruleRegex = /([^{}]+)\{([^}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(customCss)) !== null) {
    let rawSelector = match[1].trim();
    const declarations = match[2].trim();
    if (!declarations) continue;

    // Convert selector aliases like "#nice code", "xiaofu code", ".markdown-body code"
    let cleanSelector = rawSelector
      .replace(/(?:#nice|xiaofu|\.markdown-body|\.wechat-body)\s+/g, '')
      .trim();

    if (!cleanSelector) continue;

    // Expand heading selectors (h1..h6) to target both tag and all descendants of section[data-heading="h1..h6"]
    if (/^h[1-6]$/i.test(cleanSelector)) {
      const h = cleanSelector.toLowerCase();
      cleanSelector = `${h}, [data-heading="${h}"]:not([data-material="true"]), [data-heading="${h}"]:not([data-material="true"]) *`;
    } else if (cleanSelector === 'blockquote') {
      cleanSelector = 'blockquote:not([data-material="true"])';
    } else if (cleanSelector === 'hr') {
      cleanSelector = 'hr:not([data-material="true"])';
    }

    try {
      root.querySelectorAll(cleanSelector).forEach(el => {
        if (isMaterialEl(el)) return;
        declarations.split(';').forEach(decl => {
          const parts = decl.split(':');
          if (parts.length >= 2) {
            const prop = parts[0].trim();
            const val = parts.slice(1).join(':').trim().replace(/\s*!important/g, '');
            if (prop && val) {
              const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
              el.style[camelProp] = val;
            }
          }
        });
      });
    } catch (err) {
      // Ignore invalid CSS selectors safely
    }
  }
}

/**
 * Resolves all CSS variables (e.g. var(--accent-bg), var(--code-bg)) into concrete color strings
 * because WeChat Official Account UEditor strips styles containing unresolved var() expressions.
 */
function resolveAllCssVariables(root, themeStyles = {}) {
  const defaultVarMap = {
    '--accent-color': themeStyles['--accent-color'] || '#2775b6',
    '--accent-bg': themeStyles['--accent-bg'] || 'rgba(39, 117, 182, 0.05)',
    '--accent-hover': themeStyles['--accent-hover'] || '#1e5d93',
    '--code-bg': themeStyles['--code-bg'] || 'rgba(27, 31, 35, 0.05)',
    '--code-text': themeStyles['--code-text'] || '#bb2243',
    '--border-color': themeStyles['--border-color'] || '#e1e4e8',
    '--text-main': themeStyles['--text-main'] || '#2b2b2b',
    '--text-muted': themeStyles['--text-muted'] || '#595959',
    '--bg-app': themeStyles['--bg-app'] || '#fcfcfc',
    '--bg-editor': themeStyles['--bg-editor'] || '#ffffff',
    '--bg-preview': themeStyles['--bg-preview'] || '#fdfdfd',
    '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
    '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
  };

  const resolveString = (str) => {
    if (!str || !str.includes('var(')) return str;
    let maxPasses = 5;
    let current = str;
    while (current.includes('var(') && maxPasses > 0) {
      maxPasses--;
      current = current.replace(/var\(--([^,\s)]+)(?:,\s*([^)]+))?\)/g, (match, varName, fallback) => {
        const fullVarName = '--' + varName;
        if (themeStyles[fullVarName]) return themeStyles[fullVarName];
        if (defaultVarMap[fullVarName]) return defaultVarMap[fullVarName];
        if (fallback) return fallback.trim();
        return '#2775b6';
      });
    }
    return current;
  };

  const allElements = [root, ...root.querySelectorAll('*')];
  allElements.forEach(el => {
    const styleAttr = el.getAttribute('style');
    if (styleAttr && styleAttr.includes('var(')) {
      el.setAttribute('style', resolveString(styleAttr));
    }
  });
}

/**
 * Downgrade external links to <span> for WeChat MP policy compliance.
 */
function stripExternalLinks(root) {
  root.querySelectorAll('a').forEach(a => {
    if (isMaterialEl(a)) return;
    const href = a.getAttribute('href') || '';
    const isWeChat = href.includes('mp.weixin.qq.com') || href.startsWith('weixin://');
    if (!isWeChat) {
      const span = document.createElement('span');
      const style = a.getAttribute('style') || '';
      if (style) span.setAttribute('style', style);
      while (a.firstChild) span.appendChild(a.firstChild);
      a.parentNode.replaceChild(span, a);
    }
  });
}

/**
 * Restructure code blocks (<pre>) with Mac-style header and section wrapper
 * so the pasted output looks polished in WeChat. After inlineComputedStyle
 * has run, each <pre> already carries its visual styles; we move box-level
 * styles to the outer wrapper and add the decorative header.
 */
function restructureCodeBlocks(root) {
  const dotsSvg = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="450px" height="130px">' +
    '<ellipse cx="65" cy="65" rx="50" ry="52" stroke="#dc3c36" stroke-width="2" fill="#ed6c60"/>' +
    '<ellipse cx="225" cy="65" rx="50" ry="52" stroke="#da9721" stroke-width="2" fill="#f7c151"/>' +
    '<ellipse cx="385" cy="65" rx="50" ry="52" stroke="#1ba125" stroke-width="2" fill="#64c856"/>' +
    '</svg>');

  root.querySelectorAll('pre').forEach(pre => {
    const preStyle = pre.getAttribute('style') || '';

    // Extract language from code class (e.g. "language-javascript" → "JAVASCRIPT")
    let langName = '';
    const codeTag = pre.querySelector('code');
    if (codeTag) {
      const match = codeTag.className.match(/(?:language|lang)-(\w+)/);
      if (match) langName = match[1].toUpperCase();
    }

    // ── 1. Outer wrapper <section> — takes box-level visual styles ──
    const wrapper = document.createElement('section');
    const wrapperStyles = [];

    // Move box-level properties from <pre> to wrapper
    const boxProps = [
      'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
      'background-color', 'border-radius',
      'border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius',
      'box-shadow', 'max-width', 'width',
    ];
    for (const bp of boxProps) {
      const m = preStyle.match(new RegExp(bp.replace(/[-]/g, '\\-') + ':\\s*([^;]+)'));
      if (m) wrapperStyles.push(bp + ': ' + m[1].trim());
    }

    // Fallback styles if none were captured (shouldn't happen, but be safe)
    if (!wrapperStyles.some(s => s.startsWith('background-color')))
      wrapperStyles.push('background-color: #282c34');
    if (!wrapperStyles.some(s => s.startsWith('border-radius')))
      wrapperStyles.push('border-radius: 5px');
    wrapperStyles.push('overflow: hidden');
    wrapperStyles.push('display: block');
    wrapperStyles.push('width: 100%');
    wrapperStyles.push('max-width: 100%');
    wrapperStyles.push('box-sizing: border-box');

    wrapper.setAttribute('style', cleanCssInline(wrapperStyles.join('; ')));

    // ── 2. Mac header <section> ──
    const header = document.createElement('section');
    const bgColor = wrapperStyles.find(s => s.startsWith('background-color'));
    const bgVal = bgColor ? bgColor.split(':')[1].trim() : '#282c34';
    header.setAttribute('style', cleanCssInline(
      'height: 30px; ' +
      'padding: 0 14px; ' +
      'background-color: ' + bgVal + '; ' +
      'background-image: url("' + dotsSvg + '"); ' +
      'background-size: 40px; ' +
      'background-repeat: no-repeat; ' +
      'background-position: 10px 10px; ' +
      'border-radius: 5px 5px 0 0; ' +
      'margin-bottom: -7px; ' +
      'width: 100%; ' +
      'max-width: 100%; ' +
      'box-sizing: border-box; ' +
      'display: block; ' +
      'text-align: left;'
    ));
    header.innerHTML =
      '<span style="display: block; float: right; line-height: 30px; color: #5c6370; ' +
      'font-family: -apple-system, sans-serif; font-size: 11px; font-weight: 600; ' +
      'text-transform: uppercase; letter-spacing: 0.05em;">' + (langName || 'CODE') + '</span>';

    // ── 3. Keep <pre> for content — trim visual styles, keep code-layout styles ──
    const contentStyles = [];
    const contentProps = [
      'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
      'overflow-x', 'overflow-y', 'overflow',
      'white-space', 'word-break', 'word-wrap',
      'display', 'box-sizing',
    ];
    for (const cp of contentProps) {
      const m = preStyle.match(new RegExp(cp.replace(/[-]/g, '\\-') + ':\\s*([^;]+)'));
      if (m) contentStyles.push(cp + ': ' + m[1].trim());
    }
    if (!contentStyles.some(s => s.startsWith('white-space')))
      contentStyles.push('white-space: pre');
    if (!contentStyles.some(s => s.startsWith('overflow-x')))
      contentStyles.push('overflow-x: auto');
    contentStyles.push('margin: 0');
    contentStyles.push('width: 100%');
    contentStyles.push('box-sizing: border-box');
    contentStyles.push('-ms-overflow-style: none');
    contentStyles.push('scrollbar-width: none');

    // Remove old style from <pre>, set only content styles
    pre.setAttribute('style', cleanCssInline(contentStyles.join('; ')));

    // ── 4. Assemble DOM ──
    if (pre.parentNode) {
      pre.parentNode.replaceChild(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    }
  });
}

/**
 * Convert already-rendered KaTeX elements to CodeCogs PNG images.
 * WeChat's editor often strips the complex nested <span> tree KaTeX
 * produces, so replacing with a self-contained <img> is safer.
 */
function convertKatexToImages(root, primaryColor) {
  const hexColor = (primaryColor || '#5f6caf').replace('#', '').toUpperCase();

  root.querySelectorAll('.katex').forEach(katexEl => {
    const annotation = katexEl.querySelector('annotation');
    if (!annotation) return;

    const latexCode = annotation.textContent.trim();
    if (!latexCode) return;

    // Determine block vs inline
    const isBlock = Boolean(
      katexEl.closest('.math-block') ||
      katexEl.classList.contains('katex-display') ||
      katexEl.closest('.katex-display')
    );

    const dpi = isBlock ? '140' : '130';
    const fullLatex = '\\dpi{' + dpi + '} \\bg{transparent} \\fg{' + hexColor + '} ' + latexCode;
    const encodedLatex = encodeURIComponent(fullLatex)
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
    const imageUrl = 'https://latex.codecogs.com/png.image?' + encodedLatex;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = latexCode;

    if (isBlock) {
      img.setAttribute('style', cleanCssInline(
        'display: block; max-width: 100%; height: auto;'
      ));
      const parentMathBlock = katexEl.closest('.math-block');
      if (parentMathBlock && parentMathBlock.parentNode) {
        parentMathBlock.parentNode.replaceChild(img, parentMathBlock);
      } else if (katexEl.parentNode) {
        katexEl.parentNode.replaceChild(img, katexEl);
      }
    } else {
      img.setAttribute('style', cleanCssInline(
        'display: inline-block; vertical-align: middle; margin: 0 4px; max-width: 100%; height: auto;'
      ));
      if (katexEl.parentNode) {
        katexEl.parentNode.replaceChild(img, katexEl);
      }
    }
  });
}

/**
 * WYSIWYG WeChat copy — clones the live preview DOM, inlines every
 * element's computed styles, then applies WeChat-specific structural
 * transforms. Result: a self-contained HTML string matching the preview 1:1.
 *
 * @param {Element} previewEl  — live preview container DOM node
 * @param {string}  primaryColor — hex accent color (e.g. "#5f6caf") for math images
 */
export function previewDomToWechatHtml(previewEl, primaryColor) {
  // 1. Deep clone
  const clone = previewEl.cloneNode(true);

  // 2. Walk original & clone in lockstep — inline computed styles
  inlineComputedStyle(previewEl, clone);
  const origAll = previewEl.querySelectorAll('*');
  const cloneAll = clone.querySelectorAll('*');
  for (let i = 0; i < origAll.length; i++) {
    inlineComputedStyle(origAll[i], cloneAll[i]);
  }

  // 3. Fix image src — strip localhost origin (relative paths get resolved by the browser)
  clone.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith(location.origin)) {
      img.setAttribute('src', src.slice(location.origin.length));
    }
  });

  // 4. WeChat structural transforms (order matters)
  convertKatexToImages(clone, primaryColor);  // KaTeX → PNG before code restructuring
  restructureCodeBlocks(clone);               // <pre> → <section> wrapper + Mac header
  convertHeadingsToSections(clone);           // h1-h6 → <section> (WeChat overrides headings)
  convertImageContainersAndMargins(clone, { muted: '#7f7f7f' }); // img → <section> wrapper + explicit 20px margins
  convertNonStandardInlineTagsToSpans(clone); // convert inline non-standard tags & li p to <span> for WeChat
  stripExternalLinks(clone);                  // external <a> → <span> (WeChat link policy)

  // 5. Wrap in WeChat container (no background — WeChat provides its own)
  const wrapper = document.createElement('section');
  wrapper.setAttribute('style', cleanCssInline(
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif; ' +
    'font-size: 16px; line-height: 1.8; color: #3f3f3f; ' +
    'padding: 10px 0px;'
  ));
  wrapper.setAttribute('id', 'nice');
  wrapper.setAttribute('data-tool', 'NiceMD编辑器');
  wrapper.setAttribute('data-website', 'https://github.com/chengxy-nds/nice-md');

  while (clone.firstChild) wrapper.appendChild(clone.firstChild);

  // Clean list whitespace
  let html = wrapper.outerHTML;
  html = html.replace(/(<\/li>|<\/ol>|<\/ul>|<ol[^>]*>|<ul[^>]*>)\s+(<li>|<ol[^>]*>|<ul[^>]*>|<\/ol>|<\/ul>)/gi, '$1$2');
  html = html.replace(/(<\/li>|<\/ol>|<\/ul>|<ol[^>]*>|<ul[^>]*>)\s+(<li>|<ol[^>]*>|<ul[^>]*>|<\/ol>|<\/ul>)/gi, '$1$2');

  return html;
}

/**
 * Copies styled HTML + fallback plain text to user clipboard.
 * When `previewEl` is provided, uses WYSIWYG computed-style path.
 */
export async function copyToWeChat(htmlContent, plainText, themeId = 'classic-indigo', codeThemeId = 'mdnice-classic', customCss = '', customStyles = null, livePreviewEl = null) {
  // Always use the bulletproof compileToWeChatHtml engine to ensure zero negative margins,
  // zero floats, zero layout collisions, and 100% WeChat MP Editor compatibility.
  const effectiveCodeThemeId = customStyles?.code?.codeThemeId || codeThemeId || 'mdnice-classic';
  const finalHtml = compileToWeChatHtml(htmlContent, themeId, effectiveCodeThemeId, customCss, customStyles, livePreviewEl);

  const htmlBlob = new Blob([finalHtml], { type: 'text/html' });
  const textBlob = new Blob([plainText], { type: 'text/plain' });

  try {
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    await navigator.clipboard.writeText(plainText);
    return false;
  }
}
