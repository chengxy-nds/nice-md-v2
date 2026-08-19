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
    title: '.WriteIndex-titleInput textarea, .WriteIndex-titleInput .Input, textarea.Input, textarea[placeholder*="请输入标题"], [placeholder*="请输入标题"]',
    editor: '.public-DraftEditor-content, .DraftEditor-root [contenteditable="true"], [role="textbox"], .Editable-content',
    cover: 'input.UploadPicture-input, label.UploadPicture-wrapper input, .UploadPicture-wrapper input[type="file"], label.UploadPicture-wrapper input[type="file"], .WriteCover input[type="file"], .WriteCover-uploadWrapper input[type="file"], .WriteCover-wrapper input[type="file"], label.WriteCover input[type="file"], input[accept*=".jpeg"], input[accept*=".png"]',
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
  },
  infoq: {
    title: 'input.title-input, [placeholder*="标题"], .title-editor input, input[type="text"]',
    editor: '.ProseMirror, .bytemd-editor textarea, [contenteditable="true"], textarea',
    format: 'text/plain'
  },
  learnku: {
    title: '#title-field, input[name="title"], input.form-control#title-field, #article-title, [placeholder*="标题"], .article-title-input',
    editor: '.CodeMirror, #editor, textarea[name="body"], textarea#body-field, .CodeMirror-code, .simditor-body, [contenteditable="true"], textarea',
    format: 'text/plain'
  },
  tencentcloud: {
    title: '.article-title-input, [placeholder*="标题"], input.title, input[type="text"]',
    editor: '.ProseMirror, [contenteditable="true"], .editor-content, textarea',
    format: 'text/plain'
  },
  nowcoder: {
    title: '.discuss-title input, [placeholder*="标题"], input.title-input, input[type="text"]',
    editor: '.editor-content, [contenteditable="true"], .w-e-text-container [contenteditable="true"], textarea',
    format: 'text/plain'
  },
  aliyun: {
    title: '.article-title input, [placeholder*="标题"], .title-input, input[type="text"]',
    editor: '.monaco-editor, .cm-content, [contenteditable="true"], textarea',
    format: 'text/plain'
  },
  leetcode: {
    title: 'input[placeholder*="标题"], .topic-title-input, [placeholder*="Title"], input[type="text"]',
    editor: '.cm-content, [contenteditable="true"], textarea',
    format: 'text/plain'
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
  if (host.includes('infoq.cn')) return 'infoq';
  if (host.includes('learnku.com')) return 'learnku';
  if (host.includes('cloud.tencent.com') || host.includes('tencentcloud')) return 'tencentcloud';
  if (host.includes('nowcoder.com')) return 'nowcoder';
  if (host.includes('developer.aliyun.com') || host.includes('aliyun.com')) return 'aliyun';
  if (host.includes('leetcode.cn')) return 'leetcode';
  return null;
}

// Helper to check if element is valid text editable
function isElementValidTextEditable(el) {
  if (!el) return false;
  if (el.tagName === 'INPUT') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    const invalidTypes = ['file', 'hidden', 'submit', 'button', 'checkbox', 'radio', 'image', 'reset', 'range', 'color'];
    if (invalidTypes.includes(type)) return false;
  }
  return true;
}

// Helper to query element from main document and child iframes, excluding invalid inputs (file, hidden, etc.)
function findElement(selector) {
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

// Helper to execute code in the page's main JavaScript execution context (bypassing Chrome extension isolated worlds)
function injectIntoPageContext(fn, ...args) {
  try {
    const script = document.createElement('script');
    script.textContent = `(${fn.toString()})(${args.map(a => JSON.stringify(a)).join(',')});`;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  } catch (e) {
    console.warn('[NiceMD Automation] Page context injection fallback:', e);
  }
}

// Helper to simulate paste event into Rich Text/Markdown editors with single-write guarantee
function simulatePaste(target, markdown, html, format = 'text/plain') {
  target.focus();
  
  // 0. Try CodeMirror 5 direct setValue if present
  let cm5 = target.CodeMirror || target.closest('.CodeMirror')?.CodeMirror || document.querySelector('.CodeMirror')?.CodeMirror;
  if (!cm5) {
    const allCm = document.querySelectorAll('.CodeMirror');
    for (const cmEl of allCm) {
      if (cmEl.CodeMirror) {
        cm5 = cmEl.CodeMirror;
        break;
      }
    }
  }

  if (cm5 && typeof cm5.setValue === 'function') {
    cm5.setValue(markdown);
    if (typeof cm5.save === 'function') cm5.save();
    console.log('[NiceMD Automation] CodeMirror 5 instance filled via setValue.');
    return;
  }

  // 0.1 For CodeMirror containers where JS instance is in page context
  const cmContainer = target.closest('.CodeMirror') || (target.classList?.contains('CodeMirror') ? target : null) || document.querySelector('.CodeMirror');
  if (cmContainer) {
    const cmTa = cmContainer.querySelector('textarea') || target.querySelector('textarea');
    if (cmTa) {
      cmTa.focus();
      try {
        const dt = new DataTransfer();
        dt.setData('text/plain', markdown);
        const pasteEv = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt
        });
        cmTa.dispatchEvent(pasteEv);
      } catch (e) {}

      // Update underlying hidden textarea if exists
      const rawTextarea = document.querySelector('textarea#body-field, textarea[name="body"], #editor');
      if (rawTextarea && rawTextarea !== cmTa) {
        rawTextarea.value = markdown;
        rawTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        rawTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
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

    // Zhihu special: Prepend cover figure to content if present
    if (platform === 'zhihu' && payload.cover) {
      const coverFigure = `<figure data-size="normal"><img src="${payload.cover}" class="origin_image zh-lightbox-thumb" data-original="${payload.cover}"/></figure>`;
      if (payload.html && !payload.html.includes(payload.cover)) {
        payload.html = coverFigure + payload.html;
      }
      if (payload.markdown && !payload.markdown.includes(payload.cover)) {
        payload.markdown = `![](${payload.cover})\n\n` + payload.markdown;
      }
    }

    let titleDone = false;
    let bodyDone = false;
    let coverDone = false;
    let coverStarted = false;
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      // 1. Find and fill all matching title inputs
      if (!titleDone && payload.title) {
        try {
          const allTitleEls = document.querySelectorAll(config.title);
          allTitleEls.forEach((el) => {
            if (isElementValidTextEditable(el)) {
              const isContentEditable = el.getAttribute('contenteditable') === 'true' || el.contentEditable === 'true';
              if (isContentEditable) {
                el.textContent = payload.title;
                el.dispatchEvent(new Event('input', { bubbles: true }));
              } else {
                el.focus();
                // Use prototype value setter for React/Vue reactive bindings
                const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
                const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
                if (nativeSetter) {
                  nativeSetter.call(el, payload.title);
                } else {
                  el.value = payload.title;
                }
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('blur', { bubbles: true }));
              }
              titleDone = true;
              console.log(`[NiceMD Automation] Title filled successfully for ${platform}:`, payload.title);
            }
          });
        } catch (e) {
          console.warn('[NiceMD Automation] Title injection error:', e);
        }
      }
      
      // 2. Find and fill editor element EXACTLY ONCE
      if (!bodyDone) {
        if (platform === 'learnku') {
          const lkEditor = document.querySelector('.CodeMirror, #editor, textarea[name="body"], #body-field, .CodeMirror-code');
          if (lkEditor) {
            bodyDone = true;
            // 1. Set underlying textarea directly from content script
            const rawTa = document.querySelector('#body-field, textarea[name="body"], #editor, textarea');
            if (rawTa) {
              rawTa.value = payload.markdown;
              rawTa.dispatchEvent(new Event('input', { bubbles: true }));
              rawTa.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // 2. Inject into page context to trigger CodeMirror instance
            injectIntoPageContext((text) => {
              try {
                if (window.editor && typeof window.editor.setValue === 'function') {
                  window.editor.setValue(text);
                }
                const cmEls = document.querySelectorAll('.CodeMirror');
                for (const el of cmEls) {
                  if (el.CodeMirror && typeof el.CodeMirror.setValue === 'function') {
                    el.CodeMirror.setValue(text);
                    if (typeof el.CodeMirror.save === 'function') el.CodeMirror.save();
                  }
                }
                const ta = document.querySelector('#body-field, textarea[name="body"], #editor');
                if (ta && ta.CodeMirror && typeof ta.CodeMirror.setValue === 'function') {
                  ta.CodeMirror.setValue(text);
                  if (typeof ta.CodeMirror.save === 'function') ta.CodeMirror.save();
                }
                if (window.$ || window.jQuery) {
                  const $ = window.$ || window.jQuery;
                  $('.CodeMirror').each(function() {
                    if (this.CodeMirror && typeof this.CodeMirror.setValue === 'function') {
                      this.CodeMirror.setValue(text);
                      if (this.CodeMirror.save) this.CodeMirror.save();
                    }
                  });
                  $('#body-field, textarea[name="body"], #editor').val(text).trigger('input').trigger('change');
                }
              } catch (e) {
                console.error('Learnku CodeMirror injection failed:', e);
              }
            }, payload.markdown);
            console.log(`[NiceMD Automation] LearnKu CodeMirror injected directly into page context on attempt ${attempts}.`);
          }
        } else {
          const editorEl = findElement(config.editor);
          if (editorEl) {
            bodyDone = true; // Mark as done immediately so it NEVER re-runs in future interval ticks
            console.log(`[NiceMD Automation] Editor element found on attempt ${attempts}, injecting single paste.`);
            simulatePaste(editorEl, payload.markdown, payload.html, config.format);
          }
        }
      }

      // 3. Find and inject Cover Image if present (strictly targeted to article cover / settings area)
      if (!coverDone && payload.cover) {
        try {
          const existingCoverImg = document.querySelector('img[alt="封面图"], .css-6e7dvl img, .WriteCoverV2-buttonGroup, .cover.text, img.cover, .cover-img, .WriteCover-preview');
          const hasCoverBg = existingCoverImg && ((existingCoverImg.style && existingCoverImg.style.backgroundImage && !existingCoverImg.style.backgroundImage.includes('none')) || (existingCoverImg.src && !existingCoverImg.src.includes('data:image/svg')) || existingCoverImg.tagName === 'DIV');
          
          if (hasCoverBg) {
            coverDone = true;
          } else {
            // Helper to find cover file input specifically
            const findCoverFileInput = () => {
              // A. Explicit config cover selector
              if (config.cover) {
                const el = document.querySelector(config.cover);
                if (el) return el;
              }

              // B. Search by textual triggers: "添加文章封面", "添加封面", "上传封面", "添加题图"
              const textCandidates = Array.from(document.querySelectorAll('button, label, div, span, p'));
              for (const el of textCandidates) {
                const text = el.textContent?.trim() || '';
                if (text === '+ 添加文章封面' || text === '添加文章封面' || text === '+添加文章封面' || text.includes('添加文章封面') || text === '添加封面' || text === '添加题图' || text === '上传封面') {
                  const inInput = el.querySelector('input[type="file"]');
                  if (inInput) return inInput;
                  const parent = el.closest('div, label, section, fieldset');
                  const parentInput = parent?.querySelector('input[type="file"]');
                  if (parentInput) return parentInput;
                  const nextInput = el.nextElementSibling?.querySelector?.('input[type="file"]') || (el.nextElementSibling?.tagName === 'INPUT' && el.nextElementSibling.type === 'file' ? el.nextElementSibling : null);
                  if (nextInput) return nextInput;
                }
              }

              // C. Scan all input[type="file"] whose container text/class indicates cover
              const allFileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
              for (const input of allFileInputs) {
                const parent = input.closest('div, label, section, form');
                const parentText = parent?.textContent || '';
                const parentClass = ((parent?.className || '') + ' ' + (input.className || '') + ' ' + (input.id || '') + ' ' + (input.name || '')).toLowerCase();
                if (parentClass.includes('uploadpicture') || parentClass.includes('cover') || parentClass.includes('publish') || /添加文章封面|添加封面|上传封面|封面|题图/i.test(parentText)) {
                  return input;
                }
              }

              return null;
            };

            const coverInput = findCoverFileInput();
            if (coverInput && (!coverInput.__nicemd_injected__ || attempts % 3 === 0)) {
              coverInput.__nicemd_injected__ = true;
              console.log('[NiceMD Automation] Found cover input element, downloading cover blob:', payload.cover);
              const res = await fetch(payload.cover);
              const blob = await res.blob();
              if (blob) {
                const ext = (payload.cover && typeof payload.cover === 'string' && payload.cover.split('.').pop()?.toLowerCase()?.split('?')[0]) || blob.type.split('/')[1] || 'png';
                const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'png';
                const mimeType = validExt === 'png' ? 'image/png' : (validExt === 'webp' ? 'image/webp' : 'image/jpeg');
                const file = new File([blob], `cover_${Date.now()}.${validExt}`, { type: mimeType, lastModified: Date.now() });
                const dt = new DataTransfer();
                dt.items.add(file);
                coverInput.files = dt.files;

                // 1. Standard DOM Events
                coverInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                coverInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

                // 2. React Fiber Direct Props Trigger
                const triggerProps = (targetEl) => {
                  if (!targetEl) return;
                  for (const key of Object.keys(targetEl)) {
                    if (key.startsWith('__reactProps$') || key.startsWith('__reactEvents$') || key.startsWith('__reactEventHandlers$')) {
                      const p = targetEl[key];
                      if (p && typeof p.onChange === 'function') {
                        try {
                          p.onChange({
                            target: coverInput,
                            currentTarget: targetEl,
                            preventDefault: () => {},
                            stopPropagation: () => {},
                            nativeEvent: new Event('change', { bubbles: true })
                          });
                          console.log('[NiceMD Automation] Triggered React internal onChange on', key);
                        } catch (err) {
                          console.warn('[NiceMD Automation] React onChange invocation warning:', err);
                        }
                      }
                    }
                  }
                };

                triggerProps(coverInput);
                triggerProps(coverInput.parentElement);
                triggerProps(coverInput.closest('label'));

                console.log('[NiceMD Automation] Dispatched cover file to explicit cover input successfully:', coverInput);
              }
            }
          }
        } catch (coverErr) {
          console.warn('[NiceMD Automation] Cover automation warning:', coverErr);
        }
      }

      // 3.5 Auto-handle Zhihu "选择文件" / "我分享的文件" modal if present
      try {
        const allModals = Array.from(document.querySelectorAll('div, section')).filter(el => {
          const text = el.textContent || '';
          return text.includes('选择文件') && text.includes('我分享的文件') && el.querySelector('button');
        });
        if (allModals.length > 0) {
          const modal = allModals[allModals.length - 1];
          // Find the completed items in modal
          const items = Array.from(modal.querySelectorAll('div, label, li')).filter(el => {
            const t = el.textContent || '';
            return (t.includes('cover_') || t.includes('.png') || t.includes('.jpg') || t.includes('.jpeg')) && !t.includes('上传中');
          });

          if (items.length > 0) {
            const firstItem = items[0];
            const radio = firstItem.querySelector('input[type="radio"], [class*="radio"], [class*="Radio"], svg, span') || firstItem;
            radio.click();
            firstItem.click();
            await new Promise(r => setTimeout(r, 100));
          }

          // Click confirm button in modal
          const buttons = Array.from(modal.querySelectorAll('button'));
          const confirmBtn = buttons.find(btn => {
            const text = btn.textContent?.trim();
            return (text === '确定' || text === '确认' || text === '插入' || text === '选择' || text === '完成' || (text !== '请选择文件' && text.length <= 6)) && !btn.disabled;
          }) || buttons.find(btn => btn.textContent?.trim() !== '请选择文件' && !btn.disabled);

          if (confirmBtn && !confirmBtn.disabled) {
            confirmBtn.click();
            console.log('[NiceMD Automation] Clicked confirm button in Zhihu file modal:', confirmBtn.textContent?.trim());
          }
        }
      } catch (modalErr) {
        console.warn('[NiceMD Automation] Modal confirm warning:', modalErr);
      }

      // Check if cover is fully loaded on page
      const currentCoverImg = document.querySelector('img[alt="封面图"], .css-6e7dvl img, .WriteCoverV2-buttonGroup, .cover.text, img.cover, .cover-img, .WriteCover-preview');
      if (currentCoverImg) {
        coverDone = true;
      }
      
      // 4. Check if finished or timeout (after 20 attempts, i.e., 10 seconds)
      const isTitleFinished = titleDone || !payload.title;
      const isBodyFinished = bodyDone || (!payload.markdown && !payload.html);
      const isCoverFinished = coverDone || !payload.cover;

      if ((isTitleFinished && isBodyFinished && isCoverFinished) || attempts > 20) {
        clearInterval(interval);
        console.log(`[NiceMD Automation] Injection complete. Status: Title=${titleDone}, Body=${bodyDone}, Cover=${coverDone}`);
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
    
    // CRITICAL CHECK: Only skip injection if this is an already created draft from server (not creation pages)
    const searchStr = window.location.search || '';
    const pathStr = window.location.pathname || '';
    const isCreatePage = pathStr.includes('/create') || pathStr.includes('/new') || pathStr.includes('/write');
    const isExistingDraftUrl = !isCreatePage && (
      searchStr.includes('draftId') || 
      searchStr.includes('draft_id') || 
      searchStr.includes('article_id') || 
      searchStr.includes('id=') ||
      pathStr.includes('/edit')
    );
                               
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
          // Merge built-in selectors with activePlatform selectors so built-in updates take effect
          const builtIn = SELECTORS[platform] || {};
          const custom = activePlatform ? (activePlatform.selectors || {}) : {};
          const mergedConfig = {
            title: [builtIn.title, custom.title].filter(Boolean).join(', '),
            editor: [builtIn.editor, custom.editor].filter(Boolean).join(', '),
            format: custom.format || builtIn.format || 'text/plain',
            cover: custom.cover || builtIn.cover
          };
          chrome.storage.local.remove(storageKey); // Consume payload immediately
          injectContent(platform, payload, mergedConfig);
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
