import { htmlToMarkdown } from './htmlToMarkdown';

/**
 * Parses article HTML string into clean Title and Markdown
 * @param {string} htmlString - Raw page HTML
 * @param {string} url - Source article URL
 * @returns {{platform: string, title: string, markdown: string}}
 */
export function extractArticleFromHtml(htmlString, url) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  let platform = 'generic';
  let title = '';
  let contentEl = null;
  let cleanRules = [];

  let host = '';
  try {
    host = new URL(url).hostname;
  } catch (e) {
    console.error('Invalid URL during platform parsing:', url);
  }

  if (host.includes('mp.weixin.qq.com')) {
    platform = 'wechat';
    title = doc.querySelector('#activity-name')?.textContent?.trim() || '';
    contentEl = doc.querySelector('#js_content');
    cleanRules = ['.qr_code_pc_outer', '#js_to_share_div', '.rich_media_tool'];
  } else if (host.includes('juejin.cn')) {
    platform = 'juejin';
    title = doc.querySelector('.article-title')?.textContent?.trim() || '';
    contentEl = doc.querySelector('.article-content');
    cleanRules = ['.banner', '.directory-block', '.heading-anchor'];
  } else if (host.includes('csdn.net')) {
    platform = 'csdn';
    title = doc.querySelector('.title-article')?.textContent?.trim() || doc.querySelector('#articleContentId')?.textContent?.trim() || '';
    contentEl = doc.querySelector('#content_views');
    cleanRules = ['.csdn-side-toolbar', '.template-box'];
  } else if (host.includes('zhuanlan.zhihu.com')) {
    platform = 'zhihu';
    title = doc.querySelector('.Post-Title')?.textContent?.trim() || '';
    contentEl = doc.querySelector('.Post-RichTextContainer') || doc.querySelector('.Post-RichText');
    cleanRules = ['.ContentItem-actions', '.Reward'];
  } else {
    // Generic density extraction
    const containers = Array.from(doc.querySelectorAll('article, section, .content, .post, .article, .entry, .markdown-body, div'));
    let bestContainer = null;
    let maxScore = -1;

    containers.forEach(el => {
      const pCount = el.querySelectorAll('p').length;
      const textLen = el.textContent?.trim().length || 0;
      if (el.tagName.toLowerCase() === 'body' || textLen < 150) return;
      
      let score = pCount * 10 + Math.min(textLen / 50, 100);
      if (el.tagName.toLowerCase() === 'article') score += 50;
      if (el.className.includes('content') || el.className.includes('post') || el.className.includes('article') || el.className.includes('markdown')) score += 30;

      if (score > maxScore) {
        maxScore = score;
        bestContainer = el;
      }
    });

    title = doc.querySelector('h1')?.textContent?.trim() || doc.title || '';
    contentEl = bestContainer || doc.body;
  }

  if (!contentEl) {
    throw new Error('无法定位文章正文区域。');
  }

  // Preprocess DOM to clean lazy images
  const cleanDOM = contentEl.cloneNode(true);
  
  if (cleanRules.length) {
    cleanRules.forEach(sel => {
      cleanDOM.querySelectorAll(sel).forEach(el => el.remove());
    });
  }

  const images = cleanDOM.querySelectorAll('img');
  images.forEach((img) => {
    const lazySrc =
      img.getAttribute('data-src') ||
      img.getAttribute('data-original') ||
      img.getAttribute('data-actualsrc') ||
      img.getAttribute('_src') ||
      img.src;

    if (lazySrc && !lazySrc.startsWith('data:image/svg')) {
      try {
        img.src = new URL(lazySrc, url).href;
      } catch {
        img.src = lazySrc;
      }
    }
    img.removeAttribute('data-src');
    img.removeAttribute('data-original');
    img.removeAttribute('data-actualsrc');
    img.removeAttribute('_src');
  });

  const links = cleanDOM.querySelectorAll('a');
  links.forEach((a) => {
    if (a.getAttribute('href')) {
      try {
        a.href = new URL(a.getAttribute('href'), url).href;
      } catch {}
    }
  });

  // Clean scripts, styles, iframes
  cleanDOM.querySelectorAll('script, style, iframe, noscript, .hidden, [style*="display: none"]').forEach(el => el.remove());

  const markdown = htmlToMarkdown(cleanDOM.innerHTML);

  return {
    platform,
    title: title || '未命名文章',
    markdown: `# ${title || '未命名文章'}\n\n` + markdown
  };
}
