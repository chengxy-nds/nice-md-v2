/**
 * Content Automation Script
 * Injected on target editor pages to inject the saved article payload.
 */

const SELECTORS = {
  wechat: {
    title: '.title-editor__input .ProseMirror, .title-editor__input [contenteditable="true"], #title, #js_title, #js_article_title',
    editor: '.rich_media_content .ProseMirror, .rich_media_content [contenteditable="true"], body.view, body[contenteditable="true"]',
    format: 'text/html'
  },
  zhihu: {
    title: 'textarea.WriteIndex-titleInput, [placeholder*="请输入标题"]',
    editor: '.public-DraftEditor-content, .DraftEditor-root [contenteditable="true"], [role="textbox"]',
    format: 'text/plain'
  },
  juejin: {
    title: 'input.title-input, [placeholder*="文章标题"]',
    editor: '.cm-content, .bytemd-editor [contenteditable="true"], .cm-editor [contenteditable="true"], .bytemd-editor textarea',
    format: 'text/plain'
  },
  csdn: {
    title: 'input.article-bar__title, #txtTitle, [placeholder*="标题"]',
    editor: 'body.cke_editable, .cke_editable, .CodeMirror textarea, .cm-content, .ck-editor__editable, .ck-content, .editor__inner, .editor textarea, #editor textarea, .editor [contenteditable="true"], .markdown-editor-content textarea',
    format: 'text/plain'
  },
  cnblogs: {
    title: '#txt-title, [placeholder*="标题"], .post-title-input',
    editor: '#Editor_Edit_EditorBody, .editor-textarea, textarea, .cm-content, #editor-content',
    format: 'text/plain'
  },
  baijiahao: {
    title: '.editor-title input, [placeholder*="文章标题"], #title-input',
    editor: '.ProseMirror, [contenteditable="true"], .ueditor-content',
    format: 'text/html'
  },
  bilibili: {
    title: '.title-input, input[placeholder*="请输入标题"]',
    editor: '.ProseMirror, [contenteditable="true"], .editor-content',
    format: 'text/plain'
  },
  eastmoney: {
    title: '.title-input, [placeholder*="标题"], #txtTitle',
    editor: '[contenteditable="true"], .editor-content, textarea',
    format: 'text/html'
  },
  oschina: {
    title: '[placeholder*="标题"], .title-input, #title',
    editor: '.ProseMirror, [contenteditable="true"], textarea',
    format: 'text/plain'
  },
  sohu: {
    title: '.title-input, [placeholder*="标题"], input',
    editor: '.ProseMirror, [contenteditable="true"], .editor',
    format: 'text/html'
  },
  yuque: {
    title: '[placeholder*="标题"], .title-input, .ne-title-editor',
    editor: '.ne-engine, [contenteditable="true"]',
    format: 'text/plain'
  },
  '51cto': {
    title: '#title, [placeholder*="标题"], .title-input',
    editor: '[contenteditable="true"], textarea',
    format: 'text/plain'
  },
  douban: {
    title: '#note_title, [placeholder*="题目"], input',
    editor: '#note_text, textarea',
    format: 'text/plain'
  },
  segmentfault: {
    title: '[placeholder*="标题"], #title, .title-input, input[type="text"]',
    editor: '.cm-content, .ProseMirror, .sf-editor, [contenteditable="true"], #text, textarea',
    format: 'text/plain'
  },
  weibo: {
    title: '.title-input, [placeholder*="标题"], input',
    editor: '.editor-content, [contenteditable="true"], textarea',
    format: 'text/html'
  },
  xueqiu: {
    title: '.write-title, [placeholder*="标题"], input',
    editor: '.editor-body, [contenteditable="true"], textarea',
    format: 'text/html'
  },
  imooc: {
    title: '#article_title, .article-title, input#article_title, [placeholder="请在此输入标题"], [placeholder*="输入标题"], .js-title, #art_title, [placeholder*="标题"], .title-input, input[type="text"]',
    editor: '.editormd-markdown-textarea, #markdown, .CodeMirror textarea, #article_content, [contenteditable="true"], textarea',
    format: 'text/plain'
  },
  woshipm: {
    title: '#post_title, [placeholder*="标题"], input',
    editor: '[contenteditable="true"], textarea',
    format: 'text/html'
  }
};

function getPlatformKey() {
  const host = window.location.hostname;
  if (host.includes('zhihu.com')) return 'zhihu';
  if (host.includes('juejin.cn')) return 'juejin';
  if (host.includes('csdn.net')) return 'csdn';
  if (host.includes('weixin.qq.com')) return 'wechat';
  if (host.includes('cnblogs.com')) return 'cnblogs';
  if (host.includes('baidu.com')) return 'baijiahao';
  if (host.includes('bilibili.com')) return 'bilibili';
  if (host.includes('eastmoney.com')) return 'eastmoney';
  if (host.includes('oschina.net')) return 'oschina';
  if (host.includes('sohu.com')) return 'sohu';
  if (host.includes('yuque.com')) return 'yuque';
  if (host.includes('51cto.com')) return '51cto';
  if (host.includes('douban.com')) return 'douban';
  if (host.includes('segmentfault.com')) return 'segmentfault';
  if (host.includes('weibo.com')) return 'weibo';
  if (host.includes('xueqiu.com')) return 'xueqiu';
  if (host.includes('imooc.com')) return 'imooc';
  if (host.includes('woshipm.com')) return 'woshipm';
  return null;
}

// Helper to query element from main document and child iframes, excluding invalid inputs (file, hidden, etc.)
function findElement(selector) {
  const isElementValidTextEditable = (el) => {
    if (!el) return false;
    if (el.tagName === 'INPUT') {
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      const invalidTypes = ['file', 'hidden', 'submit', 'button', 'checkbox', 'radio', 'image', 'reset', 'range', 'color'];
      if (invalidTypes.includes(type)) return false;
    }
    return true;
  };

  // 1. Try main document
  try {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      if (isElementValidTextEditable(el)) return el;
    }
  } catch (e) {
    // Ignore invalid selectors
  }
  
  // 2. Try nested accessible iframes
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        const subEls = iframeDoc.querySelectorAll(selector);
        for (const el of subEls) {
          if (isElementValidTextEditable(el)) return el;
        }
      }
    } catch (e) {
      // Ignore cross-origin security warnings
    }
  }
  return null;
}

function escapeHtmlText(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to simulate paste event into Rich Text/Markdown editors with single-write guarantee
function simulatePaste(target, markdown, html, format = 'text/plain') {
  target.focus();
  
  // 0. Try CodeMirror 5 direct setValue if present
  const cm5 = target.CodeMirror || target.closest('.CodeMirror')?.CodeMirror;
  if (cm5 && typeof cm5.setValue === 'function') {
    cm5.setValue(markdown);
    console.log('[NiceMD Automation] CodeMirror 5 instance filled via setValue.');
    return;
  }

  const isCodeMirrorTextarea = target.tagName === 'TEXTAREA' && target.closest('.CodeMirror');
  const isStandardInput = (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') && !isCodeMirrorTextarea;
  
  // 1. For standard Input/Textarea elements
  if (isStandardInput) {
    target.value = markdown;
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('[NiceMD Automation] Standard input/textarea filled directly.');
    return;
  }

  // 2. For Contenteditable elements & CodeMirror 6 textareas
  const targetDoc = target.ownerDocument || document;

  // Clear existing content & select all
  try {
    const selection = targetDoc.getSelection();
    if (selection) {
      const range = targetDoc.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } catch (err) {
    console.warn('[NiceMD Automation] Failed to set selection range:', err);
  }

  // Create single DataTransfer
  const dataTransfer = new DataTransfer();
  dataTransfer.setData('text/plain', markdown);
  if (format === 'text/html' && html) {
    dataTransfer.setData('text/html', html);
  }

  // Dispatch ONLY ONE ClipboardEvent paste
  try {
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer
    });
    target.dispatchEvent(pasteEvent);
    console.log(`[NiceMD Automation] Dispatched single ClipboardEvent (format: ${format}).`);
  } catch (err) {
    console.error('[NiceMD Automation] ClipboardEvent dispatch failed:', err);
  }

  // Dispatch trailing input event to ensure reactive bindings update
  try {
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (e) {}
}

// Global execution guard per window lifecycle
if (!window.__NICEMD_AUTOMATION_INITIALIZED__) {
  window.__NICEMD_AUTOMATION_INITIALIZED__ = true;

  // Automate input filling with support for custom dynamic selectors
  function injectContent(platform, payload, customSelectors) {
    if (window.__NICEMD_INJECT_DONE__) return;
    window.__NICEMD_INJECT_DONE__ = true;

    const config = customSelectors || SELECTORS[platform];
    if (!config) return;

    console.log(`[NiceMD Automation] Start filling content for ${platform}...`);
    
    // Imooc special: If not in Markdown mode, try to click the Markdown tab
    if (platform === 'imooc') {
      const mdTab = Array.from(document.querySelectorAll('a, button, span, div, li'))
        .find(el => el.textContent.trim() === 'Markdown' && !el.classList.contains('active') && !el.classList.contains('selected') && el.children.length === 0);
      if (mdTab) {
        try {
          mdTab.click();
          console.log('[NiceMD Automation] Activated Imooc Markdown mode tab.');
        } catch (e) {}
      }
    }

    let titleDone = false;
    let bodyDone = false;
    let coverDone = false;
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      // 1. Find and fill all matching title inputs
      if (!titleDone) {
        try {
          const allTitleEls = document.querySelectorAll(config.title);
          allTitleEls.forEach((el) => {
            if (isElementValidTextEditable(el)) {
              const isContentEditable = el.getAttribute('contenteditable') === 'true' || el.contentEditable === 'true';
              if (isContentEditable) {
                el.textContent = payload.title;
              } else {
                el.focus();
                el.value = payload.title;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
              }
              titleDone = true;
            }
          });
        } catch (e) {}
      }
      
      // 2. Find and fill editor element EXACTLY ONCE
      if (!bodyDone) {
        const editorEl = findElement(config.editor);
        if (editorEl) {
          // If the editor already has substantial text (e.g. preloaded draft from server), skip injection
          const currentLength = (editorEl.textContent || editorEl.value || '').trim().length;
          if (currentLength > 20) {
            console.log(`[NiceMD Automation] Editor already contains content (${currentLength} chars) from server draft, skipping duplicate injection.`);
            bodyDone = true;
            clearInterval(interval);
            chrome.storage.local.remove(`pending_publish_${platform}`);
            return;
          }

          bodyDone = true; // Mark as done immediately so it NEVER re-runs in future interval ticks
          console.log(`[NiceMD Automation] Editor element found on attempt ${attempts}, injecting single paste.`);
          simulatePaste(editorEl, payload.markdown, payload.html, config.format);
        }
      }

      // 3. Find and inject Cover Image if present
      if (!coverDone && payload.cover) {
        try {
          const coverInput = document.querySelector('.cover-set input[type="file"], label.cover-set input, .cover-btn-groups input, input[type="file"][accept*="image"]');
          if (coverInput) {
            const existingCoverImg = document.querySelector('.cover.text, img.cover, .cover-img');
            const hasCoverBg = existingCoverImg && existingCoverImg.style && existingCoverImg.style.backgroundImage && existingCoverImg.style.backgroundImage.includes('/img/');
            if (!hasCoverBg) {
              const res = await fetch(payload.cover);
              const blob = await res.blob();
              if (blob) {
                const ext = blob.type.split('/')[1] || 'png';
                const file = new File([blob], `cover.${ext}`, { type: blob.type || 'image/png' });
                const dt = new DataTransfer();
                dt.items.add(file);
                coverInput.files = dt.files;
                coverInput.dispatchEvent(new Event('change', { bubbles: true }));
                coverInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('[NiceMD Automation] Dispatched cover file to input element.');
              }
            }
            coverDone = true;
          }
        } catch (coverErr) {
          console.warn('[NiceMD Automation] Cover automation warning:', coverErr);
        }
      }
      
      // 4. Check if finished or timeout (after 20 attempts, i.e., 10 seconds)
      if ((titleDone && bodyDone) || attempts > 20) {
        clearInterval(interval);
        console.log(`[NiceMD Automation] Injection complete. Status: Title=${titleDone}, Body=${bodyDone}`);
        chrome.storage.local.remove(`pending_publish_${platform}`);
        
        if (titleDone || bodyDone) {
          showSuccessBanner(platform);
        }
      }
    }, 500);
  }

  function showSuccessBanner(platform) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(16,185,129,0.3);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    banner.innerHTML = `
      <span style="font-size: 18px;">🚀</span>
      <span>NiceMD 已为您自动填充好文章标题与内容！</span>
    `;
    
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateY(-40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);
    
    setTimeout(() => {
      banner.style.transform = 'translateY(-20px) scale(0.9)';
      banner.style.opacity = '0';
      banner.style.transition = 'all 0.3s ease';
      setTimeout(() => banner.remove(), 300);
    }, 4000);
  }

  // Initial fetch from chrome local storage
  onMounted(() => {
    const platform = getPlatformKey();
    if (!platform) return;
    
    const storageKey = `pending_publish_${platform}`;
    
    // CRITICAL CHECK: If this page was opened to an existing draft via draftId/article_id parameter,
    // the backend API already saved the draft to the platform! We should NOT inject content again!
    const searchStr = window.location.search || '';
    const pathStr = window.location.pathname || '';
    const isExistingDraftUrl = searchStr.includes('draftId') || 
                               searchStr.includes('draft_id') || 
                               searchStr.includes('article_id') || 
                               searchStr.includes('id=') ||
                               pathStr.includes('/edit');
                               
    if (isExistingDraftUrl) {
      console.log(`[NiceMD Automation] Opening existing draft URL for ${platform}, skipping DOM injection to avoid duplicate content.`);
      chrome.storage.local.remove(storageKey);
      return;
    }
    
    chrome.storage.local.get([storageKey, 'platforms_config'], (res) => {
      const payload = res[storageKey];
      const platformsConfig = res.platforms_config || [];
      const activePlatform = platformsConfig.find(p => p.id === platform);
      
      if (payload) {
        const age = Date.now() - payload.timestamp;
        if (age < 5 * 60 * 1000) {
          chrome.storage.local.remove(storageKey); // Consume payload immediately
          injectContent(platform, payload, activePlatform ? activePlatform.selectors : null);
        } else {
          console.log('[NiceMD Automation] Stale payload ignored.');
          chrome.storage.local.remove(storageKey);
        }
      }
    });
  });

  function onMounted(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }
}
