import { marked } from 'marked';

const DOC_TOC_LINE_RE = /^[ \t]*\[toc\][ \t]*$/im;
const DOC_TOC_PLACEHOLDER = '<section data-doc-toc-placeholder="true"></section>\n';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Check whether a top-level marked token represents a standalone `[TOC]` directive.
 */
export function isDocTocToken(token) {
  if (!token || token.type !== 'paragraph') return false;
  if (!token.tokens || token.tokens.length !== 1 || token.tokens[0].type !== 'text') return false;
  return token.text.trim().toLowerCase() === '[toc]';
}

/**
 * Build a hierarchical heading tree normalized by heading depth.
 */
export function buildHeadingTree(headings = []) {
  const rootNodes = [];
  const stack = [];

  for (const item of headings) {
    const node = { item, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      rootNodes.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }
    stack.push({ depth: item.depth, node });
  }

  return rootNodes;
}

/**
 * Flatten a heading tree with zero-based indentation levels (for Word export).
 */
export function flattenHeadingTree(nodes = [], level = 0, acc = []) {
  for (const node of nodes) {
    acc.push({ ...node.item, level });
    if (node.children?.length) {
      flattenHeadingTree(node.children, level + 1, acc);
    }
  }
  return acc;
}

function renderTocListHtml(nodes) {
  if (!nodes.length) return '';
  const items = nodes.map((node) => {
    const label = escapeHtml(node.item.text);
    const href = `#${escapeHtml(node.item.id)}`;
    const childHtml = node.children.length ? renderTocListHtml(node.children) : '';
    return `<li><a href="${href}">${label}</a>${childHtml}</li>`;
  }).join('');
  return `<ul>${items}</ul>`;
}

function buildDocTocInnerHtml(headings) {
  if (!headings.length) {
    return '<p style="color:#94a3b8;font-size:13px;margin:0 0 12px 0;">暂无标题，添加 # 标题后自动生成目录</p>';
  }
  return renderTocListHtml(buildHeadingTree(headings));
}

/**
 * Extract top-level heading items directly from marked tokens (used for non-DOM exports such as Word).
 */
export function extractHeadingsFromTokens(tokens = []) {
  const rawHeadings = [];
  for (const token of tokens) {
    if (token?.type !== 'heading') continue;
    const text = (token.text || '').replace(/[*_`~]/g, '').trim();
    if (!text) continue;
    rawHeadings.push({ depth: Number(token.depth) || 1, text });
  }
  return flattenHeadingTree(buildHeadingTree(rawHeadings));
}

/**
 * Parse Markdown into HTML and expand standalone `[TOC]` lines into a nested heading directory.
 */
export function parseMarkdownWithDocToc(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') return '';
  if (!DOC_TOC_LINE_RE.test(markdownText)) {
    return marked.parse(markdownText);
  }

  const tokens = marked.lexer(markdownText);
  let hasDirective = false;
  const outTokens = tokens.map((token) => {
    if (!isDocTocToken(token)) return token;
    hasDirective = true;
    return {
      type: 'html',
      raw: token.raw,
      text: DOC_TOC_PLACEHOLDER,
      block: true
    };
  });
  outTokens.links = tokens.links || {};

  const html = marked.parser(outTokens);
  if (!hasDirective || !html.includes('data-doc-toc-placeholder')) {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__easymd_toc_root__">${html}</div>`, 'text/html');
  const root = doc.getElementById('__easymd_toc_root__');
  if (!root) return html;

  const headings = [];
  root.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((headingEl) => {
    if (headingEl.closest('blockquote, [data-material="true"], [data-doc-toc-placeholder="true"]')) return;
    const text = (headingEl.textContent || '').trim();
    if (!text) return;
    const id = headingEl.id || `easymd-heading-${headings.length}`;
    headingEl.id = id;
    headings.push({
      depth: Number(headingEl.tagName.slice(1)) || 1,
      id,
      text
    });
  });

  const tocInnerHtml = buildDocTocInnerHtml(headings);
  root.querySelectorAll('[data-doc-toc-placeholder="true"]').forEach((placeholder) => {
    const tocSection = doc.createElement('section');
    tocSection.className = headings.length ? 'doc-toc' : 'doc-toc doc-toc-empty';
    tocSection.setAttribute('data-doc-toc', 'true');
    tocSection.setAttribute('aria-label', '文章目录');
    tocSection.innerHTML = tocInnerHtml;
    placeholder.replaceWith(tocSection);
  });

  return root.innerHTML;
}

