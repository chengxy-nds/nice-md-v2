import { marked } from 'marked';
import hljs from './highlight';

export const CONTAINER_CONFIGS = {
  note: { icon: 'ℹ️', label: '核心信息提示 (Note)', bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', titleColor: '#1e40af', textColor: '#1e3a8a' },
  info: { icon: 'ℹ️', label: '补充说明 (Info)', bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', titleColor: '#1e40af', textColor: '#1e3a8a' },
  tip: { icon: '💡', label: '效率提升技巧 (Tip)', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', titleColor: '#166534', textColor: '#14532d' },
  important: { icon: '📌', label: '关键核心要点 (Important)', bg: '#f5f3ff', border: '#ddd6fe', accent: '#7c3aed', titleColor: '#5b21b6', textColor: '#4c1d95' },
  warning: { icon: '⚠️', label: '重点注意要点 (Warning)', bg: '#fff7ed', border: '#fed7aa', accent: '#ea580c', titleColor: '#9a3412', textColor: '#7c2d12' },
  danger: { icon: '🛑', label: '高危红线警示 (Danger)', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', titleColor: '#991b1b', textColor: '#7f1d1d' },
  caution: { icon: '🛑', label: '高危红线警示 (Caution)', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', titleColor: '#991b1b', textColor: '#7f1d1d' }
};

export const EMOJI_SHORTCODES = {
  smile: '😄', grin: '😁', joy: '😂', rofl: '🤣', blush: '😊', relaxed: '☺️',
  wink: '😉', heart_eyes: '😍', kissing_heart: '😘', yum: '😋', stuck_out_tongue: '😛',
  thinking: '🤔', neutral_face: '😐', expressionless: '😑', smirking: '😏', smirk: '😏',
  sunglasses: '😎', sweat_smile: '😅', sob: '😭', cry: '😢', angry: '😠', rage: '😡',
  scream: '😱', astonished: '😲', flushed: '😳', sleeping: '😴', mask: '😷',
  '+1': '👍', thumbsup: '👍', '-1': '👎', thumbsdown: '👎', ok_hand: '👌',
  clap: '👏', wave: '👋', pray: '🙏', muscle: '💪', point_right: '👉',
  point_left: '👈', point_up: '👆', point_down: '👇', raised_hands: '🙌', fist: '✊',
  heart: '❤️', orange_heart: '🧡', yellow_heart: '💛', green_heart: '💚',
  blue_heart: '💙', purple_heart: '💜', broken_heart: '💔', sparkling_heart: '💖',
  fire: '🔥', sparkles: '✨', star: '⭐', star2: '🌟', zap: '⚡', boom: '💥',
  '100': '💯', rocket: '🚀', tada: '🎉', confetti_ball: '🎊', trophy: '🏆',
  medal: '🏅', crown: '👑', gem: '💎', bulb: '💡', bell: '🔔', loudspeaker: '📢',
  memo: '📝', book: '📖', books: '📚', bookmark: '🔖', pushpin: '📌', paperclip: '📎',
  link: '🔗', mag: '🔍', lock: '🔒', unlock: '🔓', key: '🔑', shield: '🛡️',
  gear: '⚙️', wrench: '🔧', hammer: '🔨', computer: '💻', laptop: '💻',
  iphone: '📱', keyboard: '⌨️', bug: '🐛', package: '📦', gift: '🎁',
  warning: '⚠️', x: '❌', white_check_mark: '✅', heavy_check_mark: '✔️',
  ballot_box_with_check: '☑️', question: '❓', exclamation: '❗',
  information_source: 'ℹ️', stop_sign: '🛑', hourglass: '⏳', alarm_clock: '⏰',
  calendar: '📅', chart_with_upwards_trend: '📈', chart_with_downwards_trend: '📉',
  arrow_right: '➡️', arrow_left: '⬅️', arrow_up: '⬆️', arrow_down: '⬇️',
  coffee: '☕', tea: '🍵', pizza: '🍕', beer: '🍺', cake: '🎂',
  sunny: '☀️', cloud: '☁️', umbrella: '☔', snowflake: '❄️', rainbow: '🌈',
  moon: '🌙', earth_asia: '🌏', seedling: '🌱', herb: '🌿', four_leaf_clover: '🍀',
  maple_leaf: '🍁', rose: '🌹', cherry_blossom: '🌸', email: '📧', envelope: '✉️',
  pencil: '✏️', pencil2: '✏️', scissors: '✂️', wastebasket: '🗑️', eye: '👁️',
  check: '✅', cross: '❌', pin: '📌', note: '📝', tip: '💡'
};

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeDimValue(val) {
  if (!val || val === 'auto') return '';
  return /^\d+$/.test(val) ? `${val}px` : val;
}

function buildImgSizeAttrs(widthRaw, heightRaw) {
  const w = normalizeDimValue(widthRaw);
  const h = normalizeDimValue(heightRaw);
  const attrs = [];
  const styleParts = [];
  if (w) {
    attrs.push(`width="${escapeHtml(widthRaw.replace(/px$/i, ''))}"`);
    attrs.push(`data-img-width="${escapeHtml(w)}"`);
    styleParts.push(`width: ${w}`);
  }
  if (h) {
    attrs.push(`height="${escapeHtml(heightRaw.replace(/px$/i, ''))}"`);
    attrs.push(`data-img-height="${escapeHtml(h)}"`);
    styleParts.push(`height: ${h}`);
  }
  if (styleParts.length) {
    attrs.push(`style="${styleParts.join('; ')};"`);
  }
  return attrs.join(' ');
}

let extensionsRegistered = false;

/**
 * Configure global `marked` options, highlight/mermaid renderer, and extended Markdown syntax.
 */
export function ensureMarkdownExtensions() {
  if (extensionsRegistered) return;
  extensionsRegistered = true;

  marked.setOptions({
    gfm: true,
    breaks: true
  });

  marked.use({
    renderer: {
      code(arg1, arg2) {
        let code = '';
        let lang = '';
        if (typeof arg1 === 'object' && arg1 !== null) {
          code = arg1.text || '';
          lang = arg1.lang || '';
        } else {
          code = arg1 || '';
          lang = arg2 || '';
        }
        if (lang === 'mermaid') {
          const escapedCode = encodeURIComponent(code);
          return `<div class="mermaid" data-original-code="${escapedCode}">${code}</div>`;
        }

        let highlighted = '';
        if (lang && hljs.getLanguage(lang)) {
          try {
            highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
          } catch {
            highlighted = code;
          }
        } else {
          try {
            highlighted = hljs.highlightAuto(code).value;
          } catch {
            highlighted = code;
          }
        }
        return `<pre class="custom" data-lang="${lang || ''}"><code class="hljs language-${lang || 'text'}">${highlighted}</code></pre>`;
      }
    },
    extensions: [
      {
        name: 'customContainer',
        level: 'block',
        start(src) {
          const m = src.match(/^:::/m);
          return m ? m.index : -1;
        },
        tokenizer(src) {
          const openMatch = src.match(/^:::[ \t]*([a-zA-Z0-9_-]+)(?:[ \t]+([^\r\n]*))?[ \t]*(?:\r?\n|$)/);
          if (!openMatch) return;
          const afterOpen = src.slice(openMatch[0].length);
          const closeMatch = afterOpen.match(/^:::[ \t]*(?:\r?\n|$)/m);
          if (!closeMatch) return;

          const bodyRaw = afterOpen.slice(0, closeMatch.index).replace(/\r?\n$/, '');
          const raw = src.slice(0, openMatch[0].length + closeMatch.index + closeMatch[0].length);
          const containerType = openMatch[1].toLowerCase();
          const title = (openMatch[2] || '').trim();
          const bodyTokens = this.lexer.blockTokens(bodyRaw, []);

          return {
            type: 'customContainer',
            raw,
            containerType,
            title,
            tokens: bodyTokens
          };
        },
        renderer(token) {
          const bodyHtml = this.parser.parse(token.tokens);
          if (token.containerType === 'details') {
            const summary = escapeHtml(token.title || '点击展开详情');
            return `<details class="md-container md-container-details" data-container="details"><summary>${summary}</summary><div class="md-container-body">${bodyHtml}</div></details>\n`;
          }
          const cfg = CONTAINER_CONFIGS[token.containerType] || CONTAINER_CONFIGS.note;
          const displayTitle = token.title || cfg.label;
          return `<section class="md-container md-container-${escapeHtml(token.containerType)}" data-container="${escapeHtml(token.containerType)}" data-container-title="${escapeHtml(displayTitle)}">${bodyHtml}</section>\n`;
        }
      },
      {
        name: 'definitionList',
        level: 'block',
        start(src) {
          const m = src.match(/^[^\r\n]+\r?\n:[ \t]+\S/m);
          return m ? m.index : -1;
        },
        tokenizer(src) {
          const rawSegments = [];
          const re = /([^\r\n]*)(\r?\n|$)/g;
          let m;
          while ((m = re.exec(src)) !== null) {
            if (m[0] === '' && m.index === src.length) break;
            rawSegments.push({ text: m[1], rawLen: m[0].length });
            if (re.lastIndex === src.length) break;
          }

          const items = [];
          let i = 0;

          while (i + 1 < rawSegments.length) {
            const termLine = rawSegments[i].text;
            if (!termLine.trim() || /^(?:#{1,6}[ \t]|>|[-*+][ \t]|\d+\.[ \t]|```|~~~|:::|\||\[[^\]]+\]:)/.test(termLine)) {
              break;
            }
            if (!/^:[ \t]+\S/.test(rawSegments[i + 1].text)) {
              break;
            }

            const term = termLine.trim();
            const defs = [];
            i++;
            while (i < rawSegments.length && /^:[ \t]+/.test(rawSegments[i].text)) {
              const defLines = [rawSegments[i].text.replace(/^:[ \t]+/, '')];
              i++;
              while (i < rawSegments.length && /^[ \t]{2,}\S/.test(rawSegments[i].text)) {
                defLines.push(rawSegments[i].text.trim());
                i++;
              }
              defs.push(defLines.join(' '));
            }
            items.push({
              termTokens: this.lexer.inlineTokens(term),
              defTokensList: defs.map(d => this.lexer.inlineTokens(d))
            });
            if (
              i + 2 < rawSegments.length &&
              !rawSegments[i].text.trim() &&
              rawSegments[i + 1].text.trim() &&
              /^:[ \t]+\S/.test(rawSegments[i + 2].text)
            ) {
              i++;
            } else {
              break;
            }
          }

          if (!items.length) return;
          const totalLen = rawSegments.slice(0, i).reduce((sum, seg) => sum + seg.rawLen, 0);
          return {
            type: 'definitionList',
            raw: src.slice(0, totalLen),
            items
          };
        },
        renderer(token) {
          const inner = token.items.map(item => {
            const dt = `<dt>${this.parser.parseInline(item.termTokens)}</dt>`;
            const dds = item.defTokensList.map(dtks => `<dd>${this.parser.parseInline(dtks)}</dd>`).join('');
            return dt + dds;
          }).join('');
          return `<dl class="md-definition-list">${inner}</dl>\n`;
        }
      },
      {
        name: 'blockMath',
        level: 'block',
        start(src) { return src.indexOf('$$'); },
        tokenizer(src) {
          const match = src.match(/^\$\$\n?([\s\S]+?)\n?\$\$/);
          if (match) {
            return { type: 'blockMath', raw: match[0], text: match[1] };
          }
        },
        renderer(token) {
          return `<div class="math-block">$$${token.text}$$</div>`;
        }
      },
      {
        name: 'sizedImage',
        level: 'inline',
        start(src) { return src.indexOf('!['); },
        tokenizer(src) {
          const match = src.match(/^!\[((?:\\.|[^[\]])*)\]\(\s*<?([^\s<>()]+)>?(?:\s+"([^"]*)")?\s+=(\d+(?:%|px)?|auto)?(?:x(\d+(?:%|px)?|auto)?)?\s*\)/);
          if (!match) return;
          const [, alt, href, title, widthRaw, heightRaw] = match;
          if (!widthRaw && !heightRaw) return;
          return {
            type: 'sizedImage',
            raw: match[0],
            alt: alt || '',
            href,
            title: title || '',
            widthRaw: widthRaw || '',
            heightRaw: heightRaw || ''
          };
        },
        renderer(token) {
          const titleAttr = token.title ? ` title="${escapeHtml(token.title)}"` : '';
          const sizeAttrs = buildImgSizeAttrs(token.widthRaw, token.heightRaw);
          return `<img src="${escapeHtml(token.href)}" alt="${escapeHtml(token.alt)}"${titleAttr}${sizeAttrs ? ' ' + sizeAttrs : ''} />`;
        }
      },
      {
        name: 'rubyPinyin',
        level: 'inline',
        start(src) { return src.indexOf('{'); },
        tokenizer(src) {
          const match = src.match(/^\{([^}\n]+)\}\^\(([^)\n]+)\)/);
          if (!match) return;
          return {
            type: 'rubyPinyin',
            raw: match[0],
            base: match[1],
            ruby: match[2]
          };
        },
        renderer(token) {
          return `<ruby>${escapeHtml(token.base)}<rp>(</rp><rt>${escapeHtml(token.ruby)}</rt><rp>)</rp></ruby>`;
        }
      },
      {
        name: 'inlineMath',
        level: 'inline',
        start(src) { return src.indexOf('$'); },
        tokenizer(src) {
          const match = src.match(/^\$([^$\n]+?)\$/);
          if (match) {
            return { type: 'inlineMath', raw: match[0], text: match[1] };
          }
        },
        renderer(token) {
          return `<span class="math-inline">$${token.text}$</span>`;
        }
      },
      {
        name: 'highlight',
        level: 'inline',
        start(src) { return src.indexOf('=='); },
        tokenizer(src) {
          const match = src.match(/^==([^=\n]+?)==/);
          if (match) {
            return { type: 'highlight', raw: match[0], text: match[1] };
          }
        },
        renderer(token) {
          return `<mark>${escapeHtml(token.text)}</mark>`;
        }
      },
      {
        name: 'plusUnderline',
        level: 'inline',
        start(src) { return src.indexOf('++'); },
        tokenizer(src) {
          const match = src.match(/^\+\+([^\s+][^\n]*?[^\s+]|[^\s+])\+\+/);
          if (!match) return;
          return {
            type: 'plusUnderline',
            raw: match[0],
            tokens: this.lexer.inlineTokens(match[1])
          };
        },
        renderer(token) {
          return `<u>${this.parser.parseInline(token.tokens)}</u>`;
        }
      },
      {
        name: 'superscript',
        level: 'inline',
        start(src) {
          let idx = src.indexOf('^');
          while (idx !== -1) {
            const isFootnoteStart = idx > 0 && src[idx - 1] === '[' && /^[^\]]+\]/.test(src.slice(idx));
            const isRubyCaret = src[idx + 1] === '(';
            if (!isFootnoteStart && !isRubyCaret) return idx;
            idx = src.indexOf('^', idx + 1);
          }
          return -1;
        },
        tokenizer(src) {
          if (src.startsWith('^(')) return;
          const match = src.match(/^\^([^^\n\s[\]]+?)\^/);
          if (match) {
            return { type: 'superscript', raw: match[0], text: match[1] };
          }
        },
        renderer(token) {
          return `<sup>${escapeHtml(token.text)}</sup>`;
        }
      },
      {
        name: 'subscript',
        level: 'inline',
        start(src) {
          const idx = src.indexOf('~');
          if (idx === -1 || src[idx + 1] === '~') return -1;
          return idx;
        },
        tokenizer(src) {
          const match = src.match(/^~([^~\n\s]+?)~(?!~)/);
          if (match) {
            return { type: 'subscript', raw: match[0], text: match[1] };
          }
        },
        renderer(token) {
          return `<sub>${escapeHtml(token.text)}</sub>`;
        }
      },
      {
        name: 'emojiShortcode',
        level: 'inline',
        start(src) { return src.indexOf(':'); },
        tokenizer(src) {
          const match = src.match(/^:([a-z0-9_+-]+):/i);
          if (!match) return;
          const emoji = EMOJI_SHORTCODES[match[1].toLowerCase()];
          if (!emoji) return;
          return { type: 'emojiShortcode', raw: match[0], emoji };
        },
        renderer(token) {
          return token.emoji;
        }
      }
    ]
  });
}

/**
 * Strip YAML Front Matter block at document start when it contains YAML key-value pairs.
 */
export function stripYamlFrontMatter(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') return markdownText || '';
  const match = markdownText.match(/^\uFEFF?[ \t]*---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!match) return markdownText;
  const body = match[1];
  if (!/^[A-Za-z0-9_.\-\u4e00-\u9fa5]+\s*:/m.test(body)) {
    return markdownText;
  }
  return markdownText.slice(match[0].length);
}

/**
 * Extract top-level footnote (`[^id]: text`) and abbreviation (`*[ABBR]: desc`) definitions
 * outside fenced code blocks, returning cleaned markdown and definition maps.
 */
export function preprocessMarkdownSyntax(markdownText) {
  const withoutFrontMatter = stripYamlFrontMatter(markdownText);
  const lines = withoutFrontMatter.split(/\r?\n/);
  const footnotes = new Map();
  const abbreviations = new Map();
  const keptLines = [];

  let fenceChar = null;
  let fenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const ch = fenceMatch[1][0];
      const len = fenceMatch[1].length;
      if (!fenceChar) {
        fenceChar = ch;
        fenceLen = len;
      } else if (ch === fenceChar && len >= fenceLen && /^[ \t]*$/.test(line.slice(fenceMatch[0].length))) {
        fenceChar = null;
        fenceLen = 0;
      }
      keptLines.push(line);
      continue;
    }

    if (!fenceChar) {
      const abbrMatch = line.match(/^[ \t]*\*\[([^\]]+)\]:[ \t]*(.+?)[ \t]*$/);
      if (abbrMatch) {
        const key = abbrMatch[1].trim();
        const title = abbrMatch[2].trim();
        if (key && title) abbreviations.set(key, title);
        continue;
      }

      const fnMatch = line.match(/^[ \t]*\[\^([^\]]+)\]:[ \t]*(.*)$/);
      if (fnMatch) {
        const id = fnMatch[1].trim();
        const defParts = [fnMatch[2].trim()];
        while (i + 1 < lines.length && /^(?:[ \t]{2,}|\t)\S/.test(lines[i + 1])) {
          i++;
          defParts.push(lines[i].trim());
        }
        if (id) footnotes.set(id, defParts.filter(Boolean).join(' '));
        continue;
      }
    }

    keptLines.push(line);
  }

  return {
    markdown: keptLines.join('\n'),
    footnotes,
    abbreviations
  };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Post-process parsed DOM root: resolve `[^id]` footnote refs + bottom footnote list,
 * and annotate `*[ABBR]` terms with `<abbr title="...">`.
 */
export function postprocessMarkdownDom(doc, root, { footnotes, abbreviations }) {
  ensureMarkdownExtensions();

  // 1. Replace `[^id]` inline text references cleanly inside non-code nodes
  if (footnotes && footnotes.size > 0) {
    const orderedIds = [];
    const indexMap = new Map();
    const getFootnoteIndex = (fnId) => {
      if (!footnotes.has(fnId)) return null;
      if (!indexMap.has(fnId)) {
        orderedIds.push(fnId);
        indexMap.set(fnId, orderedIds.length);
      }
      return indexMap.get(fnId);
    };

    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const fnTextNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const parentEl = node.parentElement;
      if (!parentEl || parentEl.closest('pre, code, a, .math-inline, .math-block, [data-footnotes="true"]')) continue;
      if (node.nodeValue && node.nodeValue.includes('[^')) {
        fnTextNodes.push(node);
      }
    }

    fnTextNodes.forEach((textNode) => {
      const val = textNode.nodeValue;
      const fnRefRe = /\[\^([^\]]+)\]/g;
      let match;
      let lastIdx = 0;
      let replaced = false;
      const frag = doc.createDocumentFragment();

      while ((match = fnRefRe.exec(val)) !== null) {
        const fnId = match[1].trim();
        const num = getFootnoteIndex(fnId);
        if (!num) continue;
        replaced = true;
        if (match.index > lastIdx) {
          frag.appendChild(doc.createTextNode(val.slice(lastIdx, match.index)));
        }
        const sup = doc.createElement('sup');
        sup.className = 'footnote-ref';
        sup.setAttribute('data-footnote-id', `easymd-fn-${num}`);
        sup.innerHTML = `<a href="#easymd-fn-${num}" id="easymd-fnref-${num}">[${num}]</a>`;
        frag.appendChild(sup);
        lastIdx = fnRefRe.lastIndex;
      }

      if (replaced) {
        if (lastIdx < val.length) {
          frag.appendChild(doc.createTextNode(val.slice(lastIdx)));
        }
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });

    if (orderedIds.length > 0) {
      const fnSection = doc.createElement('section');
      fnSection.className = 'markdown-footnotes';
      fnSection.setAttribute('data-footnotes', 'true');
      const itemsHtml = orderedIds.map((fnId, idx) => {
        const num = idx + 1;
        const rawDef = footnotes.get(fnId) || '';
        const inlineHtml = marked.parseInline(rawDef);
        return `<li id="easymd-fn-${num}">${inlineHtml} <a href="#easymd-fnref-${num}" class="footnote-backref" aria-label="返回正文">↩</a></li>`;
      }).join('');
      fnSection.innerHTML = `<ol>${itemsHtml}</ol>`;
      root.appendChild(fnSection);
    }
  }

  // 2. Annotate abbreviations inside text nodes (skipping code, links, math, headings, TOC, footnotes)
  if (abbreviations && abbreviations.size > 0) {
    const keys = Array.from(abbreviations.keys()).sort((a, b) => b.length - a.length);
    const pattern = keys.map(k => {
      const escaped = escapeRegExp(k);
      const isAsciiWord = /^[A-Za-z0-9_]+$/.test(k);
      return isAsciiWord ? `(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])` : escaped;
    }).join('|');
    const abbrRe = new RegExp(`(${pattern})`, 'g');

    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const abbrNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      const parentEl = node.parentElement;
      if (!parentEl || parentEl.closest('pre, code, a, abbr, .math-inline, .math-block, [data-doc-toc="true"]')) continue;
      if (node.nodeValue && abbrRe.test(node.nodeValue)) {
        abbrNodes.push(node);
      }
      abbrRe.lastIndex = 0;
    }

    abbrNodes.forEach((textNode) => {
      const val = textNode.nodeValue;
      abbrRe.lastIndex = 0;
      let match;
      let lastIdx = 0;
      const frag = doc.createDocumentFragment();
      while ((match = abbrRe.exec(val)) !== null) {
        const term = match[1];
        const title = abbreviations.get(term);
        if (!title) continue;
        if (match.index > lastIdx) {
          frag.appendChild(doc.createTextNode(val.slice(lastIdx, match.index)));
        }
        const abbrEl = doc.createElement('abbr');
        abbrEl.setAttribute('title', title);
        abbrEl.textContent = term;
        frag.appendChild(abbrEl);
        lastIdx = abbrRe.lastIndex;
      }
      if (lastIdx < val.length) {
        frag.appendChild(doc.createTextNode(val.slice(lastIdx)));
      }
      textNode.parentNode.replaceChild(frag, textNode);
    });
  }
}
