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

export function compileToWeChatHtml(htmlContent, themeId = 'classic-indigo', codeThemeId = 'atom-one-dark', customCss = '') {
  const codeTheme = codeThemes.find(t => t.id === codeThemeId) || codeThemes[0];
  const codeStyles = codeTheme.styles;
  const theme = themes.find(t => t.id === themeId) || themes[0];
  const themeStyles = theme.styles;

  // Map colors directly to the selected theme's properties to perfectly match the Standard Preview
  let colors = {
    primary: themeStyles['--accent-color'] || '#5f6caf',
    secondary: themeStyles['--accent-hover'] || '#a7b1e2',
    bgLight: themeStyles['--code-bg'] || '#f5f6fa',
    text: themeStyles['--text-main'] || '#3f3f3f',
    muted: themeStyles['--text-muted'] || '#7f7f7f',
    codeBg: themeStyles['--code-bg'] || '#282c34',
    codeText: themeStyles['--code-text'] || '#abb2bf',
    border: themeStyles['--border-color'] || '#eaeef2',
    bgPreview: themeStyles['--bg-preview'] || '#ffffff',
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

  const cleanCss = (css) => css.replace(/\s+/g, ' ').trim();

  // 1. Global Container Styling
  root.setAttribute('style', cleanCss(`
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: ${colors.text};
    letter-spacing: 0.05em;
    padding: 10px 0px;
    background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.03) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 12.16%);
    background-size: 20px 20px, 20px 20px;
    background-color: ${colors.bgPreview};
  `));

  // Helper to set style safely and convert elements to section if it is a heading to prevent WeChat from overriding styles
  const styleEl = (selector, styleStr) => {
    root.querySelectorAll(selector).forEach(el => {
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

  // 2. Headings decoration matching theme personalities
  const isMountain = theme.id === 'classic-indigo' || theme.id.startsWith('mountain-') || !theme.typography;

  if (isMountain) {
    root.querySelectorAll('h1').forEach(el => {
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
    font-size: 16px;
    font-weight: bold;
    color: #2b2b2b;
    margin-top: 20px;
    margin-bottom: 10px;
    border-left: 3px solid ${colors.primary};
    padding-left: 8px;
  `);
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

  // 3. Paragraphs & Text Elements
  styleEl('p', wechatTypo.p || `
    font-size: 16px;
    line-height: 2em;
    letter-spacing: 0.08em;
    color: #0d0d0d;
    margin-top: 0;
    margin-bottom: 0;
    padding: 6px 0;
    text-align: justify;
  `);

  styleEl('strong', wechatTypo.strong || `
    color: ${colors.primary};
    font-weight: bold;
  `);

  styleEl('em', `
    font-style: italic;
    color: ${colors.primary};
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

  styleEl('u', `text-decoration: underline; color: inherit;`);
  styleEl('ins', `text-decoration: underline; color: inherit;`);
  styleEl('del', `text-decoration: line-through; color: ${colors.muted};`);
  styleEl('s', `text-decoration: line-through; color: ${colors.muted};`);
  styleEl('strike', `text-decoration: line-through; color: ${colors.muted};`);
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

  // Ensure paragraphs inside list items stay inline and do not break into new lines
  root.querySelectorAll('li p').forEach(p => {
    p.setAttribute('style', cleanCss(`
      display: inline;
      margin: 0;
      padding: 0;
      line-height: inherit;
      font-size: inherit;
      color: inherit;
    `));
  });

  // 6. Links
  styleEl('a', wechatTypo.a || `
    color: ${colors.primary};
    text-decoration: none;
  `);

  // 7. Inline Codes
  styleEl('code', wechatTypo.code || `
    font-family: "SF Mono", Consolas, Monaco, Menlo, monospace;
    font-size: 14px;
    color: ${colors.codeText || '#bb2243'};
    background-color: ${colors.codeBg || 'rgba(27, 31, 35, 0.05)'};
    padding: 2px 4px;
    border-radius: 4px;
    display: inline;
    word-break: break-word;
  `);

  // 8. Code Blocks
  // Handled separately because marked wraps code inside pre
  root.querySelectorAll('pre').forEach(pre => {
    // 1. Create a wrapper section for styling and Mac header
    const wrapper = doc.createElement('section');
    wrapper.setAttribute('style', cleanCss(`
      margin: 0 0 1.5em 0;
      border-radius: 5px;
      box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px;
      text-align: left;
      overflow: hidden;
      background-color: ${codeStyles.macBg || codeStyles.bg || '#282c34'};
      display: block;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    `));

    // Extract language name from class
    let langName = 'Code';
    const codeTag = pre.querySelector('code');
    if (codeTag) {
      const match = codeTag.className.match(/(?:language|lang)-(\w+)/);
      if (match) {
        langName = match[1].toUpperCase();
      }
    }

    // 2. Create the Mac terminal dots header with language label on the right.
    // Uses an inline SVG background for the three dots — much more robust than
    // empty <span> elements which WeChat's editor would strip out.
    // Inline SVG data URI for the Mac dots — identical to /public/mac.svg
    // Inline SVG data URI. Use hex colours (not rgb()) so parentheses don't
    // break the CSS url() token. Quote the URL so special chars are safe.
    const dotsSvg = 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="450px" height="130px">' +
      '<ellipse cx="65" cy="65" rx="50" ry="52" stroke="#dc3c36" stroke-width="2" fill="#ed6c60"/>' +
      '<ellipse cx="225" cy="65" rx="50" ry="52" stroke="#da9721" stroke-width="2" fill="#f7c151"/>' +
      '<ellipse cx="385" cy="65" rx="50" ry="52" stroke="#1ba125" stroke-width="2" fill="#64c856"/>' +
      '</svg>');
    const header = doc.createElement('section');
    header.setAttribute('style', cleanCss(`
      height: 30px;
      padding: 0 14px;
      background-color: ${codeStyles.macBg || codeStyles.bg || '#282c34'};
      background-image: url("${dotsSvg}");
      background-size: 40px;
      background-repeat: no-repeat;
      background-position: 10px 10px;
      border-radius: 5px;
      margin-bottom: -7px;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      display: block !important;
      text-align: left;
    `));
    header.innerHTML = `
      <span style="display: block; float: right; line-height: 30px; color: ${codeStyles.macText || '#5c6370'}; font-family: -apple-system-font, sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${langName}</span>
    `;

    // 3. Create a pre tag for the code block.
    // NOTE: width is deliberately NOT set so the pre can expand to fit the
    // longest code line. Combined with white-space: pre this prevents
    // wrapping. The wrapper section's overflow:hidden clips the overflow
    // visually; the preview CSS adds overflow-x:auto for a scrollbar.
    const codeContentSection = doc.createElement('pre');
    codeContentSection.setAttribute('style', cleanCss(`
      margin: 0;
      padding: 8px 14px 14px 14px;
      background-color: ${codeStyles.bg || '#282c34'};
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      overflow-x: auto !important;
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
      -webkit-overflow-scrolling: touch;
      white-space: pre !important;
      word-break: normal !important;
      word-wrap: normal !important;
      display: block;
      width: 100% !important;
      box-sizing: border-box !important;
    `));

    const codeTagNew = doc.createElement('code');
    codeTagNew.setAttribute('style', cleanCss(`
      display: block !important;
      font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
      font-size: 13px !important;
      color: ${codeStyles.text || '#abb2bf'};
      white-space: pre !important;
      word-break: normal !important;
      word-wrap: normal !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
    `));
    
    // Copy the children of code tag (which has highlights) to the new code tag
    if (codeTag) {
      while (codeTag.firstChild) {
        codeTagNew.appendChild(codeTag.firstChild);
      }
    } else {
      while (pre.firstChild) {
        codeTagNew.appendChild(pre.firstChild);
      }
    }
    codeContentSection.appendChild(codeTagNew);

    // Inline highlight.js colors inside code block
    const styleSpan = (selector, styleStr) => {
      codeContentSection.querySelectorAll(selector).forEach(el => {
        el.setAttribute('style', styleStr);
      });
    };
    
    styleSpan('.hljs-keyword', `color: ${codeStyles.keyword || '#c678dd'}; font-weight: bold;`);
    styleSpan('.hljs-string', `color: ${codeStyles.string || '#98c379'};`);
    styleSpan('.hljs-number', `color: ${codeStyles.number || '#d19a66'};`);
    styleSpan('.hljs-literal', `color: ${codeStyles.literal || '#56b6c2'};`);
    styleSpan('.hljs-built_in', `color: ${codeStyles.type || '#e5c07b'};`);
    styleSpan('.hljs-type', `color: ${codeStyles.type || '#e5c07b'};`);
    styleSpan('.hljs-title', `color: ${codeStyles.title || '#61afef'};`);
    styleSpan('.hljs-attr', `color: ${codeStyles.attr || '#d19a66'};`);
    styleSpan('.hljs-comment', `color: ${codeStyles.comment || '#7f848e'}; font-style: italic;`);
    styleSpan('.hljs-meta', `color: ${codeStyles.meta || '#61afef'};`);
    styleSpan('.hljs-operator', `color: ${codeStyles.operator || '#56b6c2'};`);
    styleSpan('.hljs-property', `color: ${codeStyles.property || '#abb2bf'};`);
    styleSpan('.hljs-variable', `color: ${codeStyles.variable || '#e06c75'};`);

    // 4. Rearrange elements in DOM: replace pre with wrapper, then append header and codeContentSection to wrapper
    if (pre.parentNode) {
      pre.parentNode.replaceChild(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(codeContentSection);
    }
  });

  // 9. Tables
  styleEl('table', `
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 1.5em 0;
    font-size: 13px;
  `);

  styleEl('th', wechatTypo.th || `
    background-color: ${colors.bgLight};
    border: 1px solid ${colors.border};
    padding: 8px 12px;
    font-weight: bold;
    text-align: left;
  `);

  styleEl('td', `
    border: 1px solid ${colors.border};
    padding: 8px 12px;
  `);

  // 10. Images
  styleEl('img', `
    max-width: 100%;
    display: block;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  `);

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

      if (isBlock) {
        img.setAttribute('style', cleanCss(`
          display: block;
          max-width: 100%;
          height: auto;
        `));
        if (el.parentNode) {
          el.parentNode.replaceChild(img, el);
        }
      } else {
        img.setAttribute('style', cleanCss(`
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          max-width: 100%;
          height: auto;
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

    // Check if the formula is block-level or inline-level
    const isBlock = Boolean(
      katexEl.closest('.math-block') || 
      katexEl.classList.contains('katex-display') ||
      katexEl.closest('.katex-display')
    );

    const hexColor = colors.primary.replace('#', '').toUpperCase(); // Use primary accent color for math formulas to look very professional!
    
    // Construct LaTeX URL with DPI, background, and matching theme color
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

    if (isBlock) {
      img.setAttribute('style', cleanCss(`
        display: block;
        margin: 20px auto;
        max-width: 100%;
        height: auto;
      `));
      
      // Try to replace the outer .math-block wrapper if present
      const parentMathBlock = katexEl.closest('.math-block');
      if (parentMathBlock && parentMathBlock.parentNode) {
        parentMathBlock.parentNode.replaceChild(img, parentMathBlock);
      } else if (katexEl.parentNode) {
        katexEl.parentNode.replaceChild(img, katexEl);
      }
    } else {
      img.setAttribute('style', cleanCss(`
        display: inline-block;
        vertical-align: middle;
        margin: 0 4px;
        max-width: 100%;
        height: auto;
      `));
      if (katexEl.parentNode) {
        katexEl.parentNode.replaceChild(img, katexEl);
      }
    }
  });

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
    if (!props.some(p => p.startsWith('max-width'))) props.push('max-width: 100%');
    if (!props.some(p => p.startsWith('display'))) props.push('display: block');
    if (!props.some(p => p.startsWith('height')) && !props.some(p => p.startsWith('max-height')))
      props.push('height: auto');
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
 * Convert headings to <section> so WeChat editor doesn't override styles.
 */
function convertHeadingsToSections(root) {
  root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
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
 * Convert inline <code> and non-standard tags (mark, del, s, kbd, u, sub, sup) to <span>
 * and convert paragraphs inside <li> to <span> so WeChat editor doesn't create unwanted line breaks.
 */
function convertNonStandardInlineTagsToSpans(root) {
  const doc = root.ownerDocument || document;

  // 1. Convert <p> inside <li> to <span> so WeChat editor never creates unwanted line breaks inside list items
  root.querySelectorAll('li p').forEach(p => {
    const span = doc.createElement('span');
    let style = (p.getAttribute('style') || '')
      .replace(/padding:[^;]+;?/gi, '')
      .replace(/display:[^;]+;?/gi, '')
      .replace(/margin:[^;]+;?/gi, '');
    span.setAttribute('style', 'display: inline; margin: 0; padding: 0; ' + style.trim());
    while (p.firstChild) span.appendChild(p.firstChild);
    p.parentNode.replaceChild(span, p);
  });

  // 2. Convert non-standard inline tags (mark, del, s, strike, u, ins, kbd, sub, sup, code, font) to <span>
  root.querySelectorAll('font').forEach(font => {
    const color = font.getAttribute('color');
    const style = font.getAttribute('style') || '';
    const span = doc.createElement('span');
    span.setAttribute('data-tag', 'font');
    const newStyle = (color ? `color: ${color}; ` : '') + style;
    span.setAttribute('style', newStyle + (newStyle.includes('display:') ? '' : '; display: inline'));
    while (font.firstChild) span.appendChild(font.firstChild);
    font.parentNode.replaceChild(span, font);
  });

  root.querySelectorAll('mark, del, s, strike, u, ins, kbd, sub, sup, code').forEach(el => {
    if (el.tagName.toLowerCase() === 'code' && el.closest('pre')) return;

    const tag = el.tagName.toLowerCase();
    const span = doc.createElement('span');
    span.setAttribute('data-tag', tag);
    const style = el.getAttribute('style') || '';
    span.setAttribute('style', style + (style.includes('display:') ? '' : '; display: inline'));

    while (el.firstChild) span.appendChild(el.firstChild);
    el.parentNode.replaceChild(span, el);
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
      cleanSelector = `${h}, [data-heading="${h}"], [data-heading="${h}"] *`;
    }

    try {
      root.querySelectorAll(cleanSelector).forEach(el => {
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
 * Downgrade external links to <span> for WeChat MP policy compliance.
 */
function stripExternalLinks(root) {
  root.querySelectorAll('a').forEach(a => {
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
export async function copyToWeChat(htmlContent, plainText, themeId = 'classic-indigo', codeThemeId = 'atom-one-dark', customCss = '') {
  // Always use the bulletproof compileToWeChatHtml engine to ensure zero negative margins,
  // zero floats, zero layout collisions, and 100% WeChat MP Editor compatibility.
  const finalHtml = compileToWeChatHtml(htmlContent, themeId, codeThemeId, customCss);

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
