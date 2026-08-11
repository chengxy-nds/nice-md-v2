/**
 * NiceMD Content Extractor Content Script
 * Extracts article title and body content, converts to clean Markdown, and sends to background worker.
 */

console.log('NiceMD Content Extractor Active 🚀');

// Neo-brutalist custom styled Floating Action Button CSS
const NEO_BRUTALIST_CSS = `
  #nicemd-sync-fab {
    position: fixed !important;
    right: 32px !important;
    bottom: 88px !important;
    height: 48px !important;
    padding: 0 20px !important;
    background-color: #f3f4f6 !important;
    color: #000000 !important;
    border: 3px solid #000000 !important;
    box-shadow: 4px 4px 0px #000000 !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    z-index: 2147483640 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    user-select: none !important;
    transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  }
  #nicemd-sync-fab:hover {
    transform: translate(-2px, -2px) !important;
    box-shadow: 6px 6px 0px #000000 !important;
    background-color: #ffd60a !important; /* Satisfying bright yellow hover */
  }
  #nicemd-sync-fab:active {
    transform: translate(2px, 2px) !important;
    box-shadow: 2px 2px 0px #000000 !important;
  }
  #nicemd-sync-fab .fab-icon {
    display: flex !important;
    align-items: center !important;
  }
  #nicemd-sync-fab .fab-tooltip {
    position: absolute !important;
    right: 0 !important;
    bottom: calc(100% + 12px) !important;
    background: #000000 !important;
    color: #ffffff !important;
    padding: 6px 12px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    border-radius: 4px !important;
    white-space: nowrap !important;
    pointer-events: none !important;
    opacity: 0 !important;
    transform: translateY(5px) !important;
    transition: all 0.2s ease !important;
    border: 2px solid #000000 !important;
    box-shadow: 3px 3px 0px #ffd60a !important;
  }
  #nicemd-sync-fab:hover .fab-tooltip {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;

// Helper to check if current page is supported for FAB injection
function getPlatformRules() {
  const url = window.location.href;
  const host = window.location.hostname;

  if (host.includes('mp.weixin.qq.com') && url.includes('/s')) {
    return {
      platform: 'wechat',
      title: '#activity-name, .rich_media_title, h1',
      content: '#js_content, .rich_media_content, article',
      clean: ['.qr_code_pc_outer', '#js_to_share_div', '.rich_media_tool']
    };
  }
  if (host.includes('juejin.cn') && url.includes('/post/')) {
    return {
      platform: 'juejin',
      title: '.article-title, h1.article-title, h1, [itemprop="headline"]',
      content: '.markdown-body.article-content, .article-content, .markdown-body, article, main',
      clean: ['.banner', '.directory-block', '.heading-anchor', '.copy-code-btn', '.copy-btn']
    };
  }
  if (host.includes('csdn.net') && (url.includes('/article/details/') || url.includes('/link'))) {
    return {
      platform: 'csdn',
      title: '.title-article, #articleContentId, h1, .article-title-box h1',
      content: '#content_views, .markdown_views, .htmledit_views, article, main',
      clean: ['.csdn-side-toolbar', '.template-box', '.copy-btn', '.hljs-button']
    };
  }
  if (host.includes('zhuanlan.zhihu.com') && url.includes('/p/')) {
    return {
      platform: 'zhihu',
      title: '.Post-Title, h1.Post-Title, h1',
      content: '.Post-RichTextContainer, .Post-RichText, article, .Post-content',
      clean: ['.ContentItem-actions', '.Reward', '.VoteButton', '.Button']
    };
  }
  return null;
}

// Injects the sync FAB button if on a supported article page
function injectFab() {
  const rules = getPlatformRules();
  if (!rules) return;

  // Prevent duplicate injection
  if (document.getElementById('nicemd-sync-fab')) return;

  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = NEO_BRUTALIST_CSS;
  document.head.appendChild(styleEl);

  // Create button
  const fab = document.createElement('button');
  fab.id = 'nicemd-sync-fab';
  fab.innerHTML = `
    <span class="fab-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    </span>
    <span>同步到 NiceMD</span>
    <div class="fab-tooltip">提取文章并导入 NiceMD 编辑器</div>
  `;

  fab.addEventListener('click', () => {
    // Play a satisfying click effect
    fab.style.transform = 'scale(0.95)';
    setTimeout(() => {
      fab.style.transform = '';
      triggerArticleExtraction(rules);
    }, 100);
  });

  document.body.appendChild(fab);
}

// Preprocesses article DOM before converting to Markdown
// Resolves lazy images, fixes links, handles nested structures
function preprocessDOM(element) {
  const cloned = element.cloneNode(true);

  // 1. Resolve lazy loaded images
  const images = cloned.querySelectorAll('img');
  images.forEach((img) => {
    const lazySrc =
      img.getAttribute('data-src') ||
      img.getAttribute('data-original') ||
      img.getAttribute('data-actualsrc') ||
      img.getAttribute('_src') ||
      img.src;

    if (lazySrc && !lazySrc.startsWith('data:image/svg')) {
      // Resolve to absolute URL
      try {
        img.src = new URL(lazySrc, window.location.href).href;
      } catch {
        img.src = lazySrc;
      }
    }

    // Clean obsolete lazy attributes
    img.removeAttribute('data-src');
    img.removeAttribute('data-original');
    img.removeAttribute('data-actualsrc');
    img.removeAttribute('_src');
  });

  // 2. Resolve relative anchor links to absolute URLs
  const links = cloned.querySelectorAll('a');
  links.forEach((a) => {
    if (a.href) {
      try {
        a.href = new URL(a.getAttribute('href'), window.location.href).href;
      } catch {}
    }
  });

  // 3. Remove script, style, comments, and common UI noise (copy buttons, banners, share widgets, anchors)
  const stripSelectors = [
    'script', 'style', 'iframe', 'noscript', '.hidden', '[style*="display: none"]',
    '.copy-btn', '.copy-code-btn', '.hljs-button', '.code-copy', 'button.copy',
    '.heading-anchor', '.anchor', '.ad-container', '.ads', '.banner',
    '.share-group', '.social-share', '.share-bar', '.comment-list', '.comment-container', '#comments'
  ].join(', ');
  cloned.querySelectorAll(stripSelectors).forEach(el => el.remove());

  return cloned;
}

// Custom built HTML to Markdown parser for the extension (aligned with nice-md web-app)
function convertDOMToMarkdown(node) {
  function traverse(currentNode) {
    let markdown = '';
    
    if (currentNode.nodeType === Node.TEXT_NODE) {
      return currentNode.textContent;
    }
    
    if (currentNode.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const children = Array.from(currentNode.childNodes).map(traverse).join('');
    const tag = currentNode.tagName.toLowerCase();

    switch (tag) {
      case 'h1':
        return `\n# ${children.trim()}\n\n`;
      case 'h2':
        return `\n## ${children.trim()}\n\n`;
      case 'h3':
        return `\n### ${children.trim()}\n\n`;
      case 'h4':
        return `\n#### ${children.trim()}\n\n`;
      case 'h5':
        return `\n##### ${children.trim()}\n\n`;
      case 'h6':
        return `\n###### ${children.trim()}\n\n`;
      case 'p':
        return `\n${children.trim()}\n\n`;
      case 'blockquote':
        return `\n> ${children.trim().replace(/\n/g, '\n> ')}\n\n`;
      case 'strong':
      case 'b':
        return `**${children}**`;
      case 'em':
      case 'i':
        return `*${children}*`;
      case 'code':
        // Check if inside pre
        if (currentNode.parentNode && currentNode.parentNode.tagName.toLowerCase() === 'pre') {
          return children;
        }
        return ` \`${children}\` `;
      case 'pre':
        // Try to dynamically extract code language from CSS classes
        let lang = 'javascript';
        const codeEl = currentNode.querySelector('code');
        const targetEl = codeEl || currentNode;
        const className = targetEl.className || '';
        const langMatch = className.match(/(?:lang|language)-([a-zA-Z0-9+-]+)/) || 
                          className.match(/hljs\s+([a-zA-Z0-9+-]+)/);
        if (langMatch) {
          lang = langMatch[1];
        }
        return `\n\`\`\`${lang}\n${children.trim()}\n\`\`\`\n\n`;
      case 'ul':
        return `\n${children}\n`;
      case 'ol':
        return `\n${children}\n`;
      case 'li':
        const parent = currentNode.parentNode;
        if (parent && parent.tagName.toLowerCase() === 'ol') {
          const index = Array.from(parent.children).indexOf(currentNode) + 1;
          return `${index}. ${children.trim()}\n`;
        }
        return `* ${children.trim()}\n`;
      case 'a':
        const href = currentNode.getAttribute('href') || '';
        return `[${children}](${href})`;
      case 'img':
        const src = currentNode.getAttribute('src') || '';
        const alt = currentNode.getAttribute('alt') || 'image';
        return `![${alt}](${src})`;
      case 'br':
        return '\n';
      case 'div':
      case 'section':
      case 'article':
        return `\n${children}\n`;
      default:
        return children;
    }
  }

  let result = traverse(node);
  
  // Clean up excessive newlines
  result = result
    .replace(/\n{3,}/g, '\n\n')
    .trim();
    
  return result;
}

// Fallback Generic Page Reader Extractor (Readability style container scorer)
function extractGenericArticle() {
  // 1. Clean Title Scraper
  let pageTitle = document.title || '';
  const titleTag = document.querySelector('title');
  if (titleTag && titleTag.textContent) {
    pageTitle = titleTag.textContent.trim();
  }

  // Remove common brand/separator parts (e.g., "My Article | Juejin", "Post - Blog")
  if (/ [\|\-\\\/>»:_] /.test(pageTitle)) {
    const parts = pageTitle.split(/ [\|\-\\\/>»:_] /);
    pageTitle = parts[0].trim();
    // If the left part is too short, take the right part instead
    if (pageTitle.split(/\s+/).length < 3 && parts[1]) {
      pageTitle = parts[1].trim();
    }
  }

  // Check if there is a single H1 on the page that is highly similar to the title
  const h1Elements = Array.from(document.querySelectorAll('h1'));
  if (h1Elements.length === 1 && h1Elements[0].textContent) {
    pageTitle = h1Elements[0].textContent.trim();
  }

  // 2. Select and Score Candidates (Inspired by Readability.js)
  const containers = Array.from(document.querySelectorAll('article, section, .content, .post, .article, .entry, .markdown-body, main, div'));
  
  let bestContainer = null;
  let maxScore = -1;

  // Regular expressions to detect noise vs article content
  const negativeRegex = /hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i;
  const positiveRegex = /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story|markdown/i;
  const unlikelyRegex = /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup/i;

  containers.forEach(el => {
    // Skip tiny nodes or body itself
    const textLen = el.textContent?.trim().length || 0;
    if (el.tagName.toLowerCase() === 'body' || textLen < 150) return;

    // Check if the node's class/id contains highly unlikely elements
    const matchString = (el.className || '') + ' ' + (el.id || '');
    if (unlikelyRegex.test(matchString) && !positiveRegex.test(matchString)) {
      return; // Filter out ad widgets, sidebars, headers, footers, etc.
    }

    // Base score based on content density
    const pCount = el.querySelectorAll('p').length;
    const codeCount = el.querySelectorAll('pre, code').length;
    const imgCount = el.querySelectorAll('img').length;
    
    let score = pCount * 12 + codeCount * 8 + imgCount * 5 + Math.min(textLen / 60, 150);

    // Score adjustments based on tagName
    const tag = el.tagName.toLowerCase();
    if (tag === 'article') {
      score += 45;
    } else if (tag === 'section') {
      score += 20;
    } else if (tag === 'pre' || tag === 'blockquote') {
      score += 15;
    } else if (tag === 'form' || tag === 'ol' || tag === 'ul' || tag === 'dl') {
      score -= 20;
    }

    // Score adjustments based on Class & ID names
    if (positiveRegex.test(matchString)) {
      score += 35;
    }
    if (negativeRegex.test(matchString)) {
      score -= 40;
    }

    // Score based on child density (discount menus/lists of links)
    const links = el.querySelectorAll('a');
    if (links.length > 0) {
      let linkLength = 0;
      links.forEach(a => {
        linkLength += a.textContent?.trim().length || 0;
      });
      const linkRatio = linkLength / textLen;
      if (linkRatio > 0.4) {
        score -= 50; // Discount index pages, navbars, link walls
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestContainer = el;
    }
  });

  // Fallback to body or article if no container scored well
  const sourceNode = bestContainer || document.querySelector('article') || document.body;
  
  return {
    title: pageTitle,
    element: sourceNode
  };
}

// Perform extraction and return data separately
function getArticleData(rules = null) {
  let title = '';
  let contentElement = null;

  if (rules) {
    // Platform-specific extraction
    try {
      const titleEl = document.querySelector(rules.title);
      title = titleEl ? titleEl.textContent.trim() : document.title;
      contentElement = document.querySelector(rules.content);
      
      // Clean target side elements
      if (contentElement && rules.clean) {
        rules.clean.forEach(sel => {
          contentElement.querySelectorAll(sel).forEach(el => el.remove());
        });
      }
    } catch (err) {
      console.warn('[NiceMD Extractor] Platform-specific selector query failed:', err.message);
    }
  }

  // Fallback to generic extractor if platform rules failed, element wasn't found, or matched container is too empty/small
  const textLength = contentElement ? (contentElement.textContent || '').trim().length : 0;
  if (!contentElement || textLength < 100) {
    console.log('[NiceMD Extractor] Platform rules returned no content or empty container. Falling back to generic extraction.');
    const res = extractGenericArticle();
    if (!title) {
      title = res.title;
    }
    contentElement = res.element;
  }

  if (!contentElement) {
    throw new Error('无法在该网页上定位到文章正文区域。');
  }

  // Preprocess DOM to clean images and links
  const cleanDOM = preprocessDOM(contentElement);
  const html = cleanDOM.innerHTML;
  
  // Convert DOM to clean Markdown (excluding the title header prefix)
  const markdown = convertDOMToMarkdown(cleanDOM);

  return {
    title,
    markdown,
    html,
    sourceUrl: window.location.href
  };
}

// Trigger article extraction and send result to background worker (original flow)
function triggerArticleExtraction(rules = null) {
  try {
    const data = getArticleData(rules);
    
    // Add title header back for standard direct import
    const fullMarkdown = `# ${data.title}\n\n` + data.markdown;

    // Send payload to background
    chrome.runtime.sendMessage({
      type: 'EXTRACTED_ARTICLE_IMPORT',
      payload: {
        title: data.title,
        markdown: fullMarkdown,
        html: data.html,
        sourceUrl: data.sourceUrl
      }
    }, (res) => {
      console.log('[NiceMD Extractor] Synchronized article to extension database:', res);
    });

  } catch (err) {
    console.error('[NiceMD Extractor] Extraction failed:', err);
    alert('NiceMD 提取文章失败: ' + err.message);
  }
}

// Listen to trigger commands from background page or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRIGGER_EXTRACTION') {
    const rules = getPlatformRules();
    triggerArticleExtraction(rules); // If rules is null, falls back to generic extraction
    sendResponse({ success: true });
  } else if (message.type === 'EXTRACT_CONTENT_DIRECTLY') {
    try {
      const rules = getPlatformRules();
      const data = getArticleData(rules);
      sendResponse({ success: true, data });
    } catch (err) {
      console.error('[NiceMD Extractor] Direct extraction failed:', err);
      sendResponse({ success: false, error: err.message });
    }
  }
});

// Check setting and run FAB injection on load
function initExtractor() {
  chrome.storage.local.get({ enable_sync_fab: false }, (result) => {
    if (result.enable_sync_fab) {
      injectFab();
    }
  });
}

// Listen to storage changes to add/remove FAB in real-time
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.enable_sync_fab) {
    const shouldShow = changes.enable_sync_fab.newValue;
    if (shouldShow) {
      const rules = getPlatformRules();
      if (rules) injectFab();
    } else {
      const fab = document.getElementById('nicemd-sync-fab');
      if (fab) fab.remove();
    }
  }
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtractor);
} else {
  initExtractor();
}
