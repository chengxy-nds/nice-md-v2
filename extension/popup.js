/**
 * NiceMD Popup Controller
 * Manages configuration loading, login checking, dynamic list rendering, and tab redirection.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loadingState = document.getElementById('loading-state');
  const platformsList = document.getElementById('platforms-list');
  const btnRefresh = document.getElementById('btn-refresh');
  const iconRefresh = document.getElementById('icon-refresh');
  const btnOpenEditor = document.getElementById('btn-open-editor');
  const footerStats = document.getElementById('footer-stats');

  let platformsConfig = [];
  let loginStatuses = {};

  // 1. Fetch Platforms List & Initialize Checks
  function init() {
    toggleLoading(true);
    chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.config) {
        console.error('[NiceMD Popup] Failed to get config:', chrome.runtime.lastError);
        footerStats.textContent = '无法读取配置';
        toggleLoading(false);
        return;
      }
      platformsConfig = response.config;
      checkAllLogins();
    });
  }

  // 2. Query Login Statuses and Render Cards
  function checkAllLogins() {
    btnRefresh.classList.add('disabled');
    iconRefresh.classList.add('is-spinning');

    const payloadPlatforms = platformsConfig.map(p => ({ id: p.id, writeUrl: p.writeUrl }));
    
    chrome.runtime.sendMessage({ type: 'CHECK_LOGINS', platforms: payloadPlatforms }, (response) => {
      btnRefresh.classList.remove('disabled');
      iconRefresh.classList.remove('is-spinning');
      toggleLoading(false);

      if (chrome.runtime.lastError || !response || !response.statuses) {
        console.error('[NiceMD Popup] Login check failed:', chrome.runtime.lastError);
        footerStats.textContent = '无法检测登录状态';
        return;
      }

      loginStatuses = response.statuses || {};
      renderList(response.statuses);
    });
  }

  // 3. Render List DOM
  function renderList(statuses) {
    platformsList.innerHTML = '';
    let loggedInCount = 0;

    platformsConfig.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'platform-card';
      
      const authInfo = statuses[p.id] || { loggedIn: false };
      const isLoggedIn = p.id === 'zip-download' || authInfo.loggedIn;
      const username = authInfo.username || (p.id === 'zip-download' ? '本地下载' : '');
      const avatar = authInfo.avatar || '';

      if (isLoggedIn) loggedInCount++;

      // Set card border Accent styling on hover dynamically
      card.style.setProperty('--accent-color', p.color);

      // Card structure HTML
      card.innerHTML = `
        <div class="card-left">
          <div class="platform-indicator" style="background-color: ${p.color};"></div>
          <div class="platform-details">
            <span class="platform-name">${p.name}</span>
            ${isLoggedIn && username ? `
              <div class="user-account">
                ${avatar ? `<img class="user-avatar" src="${avatar}" />` : ''}
                <span class="user-name">${username}</span>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="card-right">
          <span class="badge-status ${isLoggedIn ? 'is-logged' : 'is-unlogged'}">
            ${isLoggedIn ? '已登录' : '未登录'}
          </span>
          <svg class="arrow-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>
      `;

      // Programmatic error listener to avoid inline event handler CSP violation
      const img = card.querySelector('.user-avatar');
      if (img) {
        img.addEventListener('error', () => {
          img.style.display = 'none';
        });
      }

      // Click to open target page
      card.addEventListener('click', () => {
        if (p.writeUrl) {
          chrome.tabs.create({ url: p.writeUrl });
        }
      });

      platformsList.appendChild(card);
    });

    // Update footer statistics
    footerStats.textContent = `已登录通道 ${loggedInCount} / ${platformsConfig.length}`;
  }

  // Helper to toggle Loader visibility
  function toggleLoading(isLoading) {
    if (isLoading) {
      loadingState.classList.remove('hidden');
      platformsList.classList.add('hidden');
    } else {
      loadingState.classList.add('hidden');
      platformsList.classList.remove('hidden');
    }
  }

  // 4. Tabs Toggle Logic
  const tabChannels = document.getElementById('tab-channels');
  const tabExtractor = document.getElementById('tab-extractor');
  const sectionChannels = document.getElementById('section-channels');
  const sectionExtractor = document.getElementById('section-extractor');

  tabChannels.addEventListener('click', () => {
    tabChannels.classList.add('active');
    tabExtractor.classList.remove('active');
    sectionChannels.classList.remove('hidden');
    sectionExtractor.classList.add('hidden');
    btnRefresh.classList.remove('hidden');
  });

  tabExtractor.addEventListener('click', () => {
    tabExtractor.classList.add('active');
    tabChannels.classList.remove('active');
    sectionExtractor.classList.remove('hidden');
    sectionChannels.classList.add('hidden');
    btnRefresh.classList.add('hidden');
  });

  // 5. Extractor Logic Bindings
  const btnExtractPage = document.getElementById('btn-extract-page');
  const extractStatus = document.getElementById('extract-status');
  const extractorTriggerView = document.getElementById('extractor-trigger-view');
  const extractorEditView = document.getElementById('extractor-edit-view');
  
  const extTitle = document.getElementById('ext-title');
  const extContent = document.getElementById('ext-content');
  const btnImportEditor = document.getElementById('btn-import-editor');
  const btnReExtract = document.getElementById('btn-re-extract');

  // New elements for popup publishing
  const btnGoPublish = document.getElementById('btn-go-publish');
  const extractorPublishView = document.getElementById('extractor-publish-view');
  const pubSummaryTitle = document.getElementById('pub-summary-title');
  const publishPlatformsList = document.getElementById('publish-platforms-list');
  const publishTerminal = document.getElementById('publish-terminal');
  const btnStartPublish = document.getElementById('btn-start-publish');
  const btnBackToEdit = document.getElementById('btn-back-to-edit');

  let cachedHtml = '';
  let cachedSourceUrl = '';

  btnExtractPage.addEventListener('click', async () => {
    extractStatus.textContent = '正在分析并提取网页内容...';
    btnExtractPage.disabled = true;
    btnExtractPage.style.opacity = '0.7';

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        throw new Error('未找到当前活动标签页。');
      }

      const url = activeTab.url || '';
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('devtools://')) {
        throw new Error('当前页面受系统安全限制，无法进行内容提取。请在网页文章或博客页面重试。');
      }

      // Check if trying to extract the NiceMD editor itself
      if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('173.168.5.225')) {
        throw new Error('当前正处于 NiceMD 编辑器网页。请切换到您想要提取内容的文章网页（如微信、知乎、掘金等），然后再打开插件提取。');
      }

      chrome.tabs.sendMessage(activeTab.id, { type: 'EXTRACT_CONTENT_DIRECTLY' }, (response) => {
        btnExtractPage.disabled = false;
        btnExtractPage.style.opacity = '';

        if (chrome.runtime.lastError) {
          console.warn('[NiceMD Popup] EXTRACT_CONTENT_DIRECTLY failed:', chrome.runtime.lastError.message);
          extractStatus.innerHTML = '<span style="color: var(--status-red)">提取失败：扩展未能与该页面建立连接。<br>请刷新该页面后重试，或确保该页面已被完整加载。</span>';
          return;
        }

        if (response && response.success && response.data) {
          const { title, markdown, html, sourceUrl } = response.data;
          extTitle.value = title || '';
          extContent.value = markdown || '';
          cachedHtml = html || '';
          cachedSourceUrl = sourceUrl || '';

          extractorTriggerView.classList.add('hidden');
          extractorEditView.classList.remove('hidden');
          extractStatus.textContent = '';
        } else {
          const errMsg = response ? response.error : '未知错误';
          extractStatus.innerHTML = `<span style="color: var(--status-red)">提取失败：${errMsg}</span>`;
        }
      });
    } catch (err) {
      btnExtractPage.disabled = false;
      btnExtractPage.style.opacity = '';
      extractStatus.innerHTML = `<span style="color: var(--status-red)">${err.message}</span>`;
    }
  });

  btnReExtract.addEventListener('click', () => {
    cachedHtml = '';
    cachedSourceUrl = '';
    extTitle.value = '';
    extContent.value = '';
    extractorEditView.classList.add('hidden');
    extractorTriggerView.classList.remove('hidden');
    extractStatus.textContent = '提取网页正文并转换为 Markdown，导入前可自由编辑修改。';
  });

  btnImportEditor.addEventListener('click', () => {
    const title = extTitle.value.trim();
    if (!title) {
      alert('文章标题不能为空！');
      return;
    }

    const markdown = `# ${title}\n\n` + extContent.value;
    
    btnImportEditor.disabled = true;
    btnImportEditor.textContent = '正在导入...';

    chrome.runtime.sendMessage({
      type: 'EXTRACTED_ARTICLE_IMPORT',
      payload: {
        title,
        markdown,
        html: cachedHtml,
        sourceUrl: cachedSourceUrl
      }
    }, (response) => {
      btnImportEditor.disabled = false;
      btnImportEditor.textContent = '导入 NiceMD 编辑器';

      if (chrome.runtime.lastError || !response || !response.success) {
        alert('导入失败，请检查 NiceMD 编辑器是否已开启。');
      } else {
        cachedHtml = '';
        cachedSourceUrl = '';
        extTitle.value = '';
        extContent.value = '';
        extractorEditView.classList.add('hidden');
        extractorTriggerView.classList.remove('hidden');
        extractStatus.textContent = '导入成功！已加载至编辑器中。';
      }
    });
  });

  // Extractor Publish Routing
  btnGoPublish.addEventListener('click', () => {
    const title = extTitle.value.trim();
    if (!title) {
      alert('文章标题不能为空！');
      return;
    }
    
    // Switch views
    extractorEditView.classList.add('hidden');
    extractorPublishView.classList.remove('hidden');
    pubSummaryTitle.textContent = title;
    
    // Render list of platforms to choose from
    renderPublishPlatformsList();
    
    // Hide terminal by default and enable button
    publishTerminal.classList.add('hidden');
    publishTerminal.innerHTML = '';
    btnStartPublish.disabled = false;
    btnStartPublish.textContent = '🚀 开始同步发布';
  });

  btnBackToEdit.addEventListener('click', () => {
    extractorPublishView.classList.add('hidden');
    extractorEditView.classList.remove('hidden');
  });

  function renderPublishPlatformsList() {
    publishPlatformsList.innerHTML = '';
    
    platformsConfig.forEach((p) => {
      if (p.id === 'zip-download') return; // Skip ZIP download in popup publish channel
      
      const authInfo = loginStatuses[p.id] || { loggedIn: false };
      const isLoggedIn = authInfo.loggedIn;
      
      const item = document.createElement('div');
      item.className = `publish-platform-item ${!isLoggedIn ? 'disabled' : ''}`;
      
      item.innerHTML = `
        <input type="checkbox" id="pub-check-${p.id}" ${isLoggedIn ? 'checked' : 'disabled'} />
        <span class="platform-indicator" style="background-color: ${p.color};"></span>
        <span class="publish-plat-name">${p.name} ${isLoggedIn ? '' : '（未登录）'}</span>
      `;
      
      if (isLoggedIn) {
        item.addEventListener('click', (e) => {
          if (e.target.tagName !== 'INPUT') {
            const chk = item.querySelector('input');
            chk.checked = !chk.checked;
          }
        });
      }
      
      publishPlatformsList.appendChild(item);
    });
  }

  btnStartPublish.addEventListener('click', async () => {
    const title = extTitle.value.trim();
    const markdown = extContent.value;
    
    // Collect checked platforms
    const selectedPlatforms = [];
    platformsConfig.forEach(p => {
      if (p.id === 'zip-download') return;
      const chk = document.getElementById(`pub-check-${p.id}`);
      if (chk && chk.checked) {
        selectedPlatforms.push(p);
      }
    });
    
    if (selectedPlatforms.length === 0) {
      alert('请选择至少一个已登录的发布平台！');
      return;
    }
    
    // Disable button, show terminal
    btnStartPublish.disabled = true;
    btnStartPublish.textContent = '正在分发中...';
    publishTerminal.classList.remove('hidden');
    publishTerminal.innerHTML = '';
    
    const addLog = (type, text) => {
      const line = document.createElement('div');
      line.className = `terminal-log-line ${type}`;
      line.textContent = `[${new Date().toTimeString().split(' ')[0]}] ${text}`;
      publishTerminal.appendChild(line);
      publishTerminal.scrollTop = publishTerminal.scrollHeight;
    };
    
    addLog('info', '🚀 开始一键分发任务...');
    
    // Compile HTML from markdown
    addLog('info', '正在解析并渲染排版内容...');
    let compiledHtml = '';
    try {
      if (window.marked && window.marked.parse) {
        compiledHtml = window.marked.parse(markdown);
      } else {
        // Simple fallback
        compiledHtml = markdown.replace(/\n/g, '<br>');
      }
    } catch (err) {
      addLog('error', `排版编译失败: ${err.message}`);
      btnStartPublish.disabled = false;
      btnStartPublish.textContent = '🚀 开始同步发布';
      return;
    }
    
    // Loop through each selected platform
    for (const p of selectedPlatforms) {
      addLog('info', `[${p.name}] 正在建立安全分发信道...`);
      await new Promise(resolve => setTimeout(resolve, 600)); // micro delay for realism and smooth UI
      
      // If WeChat, compile with inline styles
      let targetHtml = compiledHtml;
      if (p.id === 'wechat') {
        addLog('info', `[${p.name}] 正在生成专有内联排版样式...`);
        targetHtml = compileToWeChatHtml(compiledHtml);
      }
      
      // Call background script to publish
      const messagePayload = {
        type: 'LAUNCH_PUBLISH',
        payload: {
          platform: p.id,
          title,
          markdown: `# ${title}\n\n` + markdown,
          html: targetHtml
        }
      };
      
      await new Promise((resolve) => {
        chrome.runtime.sendMessage(messagePayload, (response) => {
          if (chrome.runtime.lastError) {
            addLog('error', `[${p.name}] 分发失败: 插件通信异常 (${chrome.runtime.lastError.message})`);
          } else if (response && response.success) {
            if (response.postUrl) {
              addLog('success', `[${p.name}] 草稿同步成功！草稿链接: ${response.postUrl}`);
            } else if (response.localOnly) {
              addLog('success', `[${p.name}] 样式复制成功！请在目标编辑器中手动粘贴。`);
            } else {
              addLog('success', `[${p.name}] 发布成功！已在标签页拉起并填装内容。`);
            }
          } else {
            const errDetail = response ? (response.error || '通道错误') : '未知错误';
            addLog('error', `[${p.name}] 分发失败: ${errDetail}`);
          }
          resolve();
        });
      });
    }
    
    addLog('success', '🎉 所有通道发布任务处理完毕。');
    btnStartPublish.disabled = false;
    btnStartPublish.textContent = '🚀 再次分发';
  });

  // 6. Original Action Bindings
  btnRefresh.addEventListener('click', () => {
    if (iconRefresh.classList.contains('is-spinning')) return;
    checkAllLogins();
  });

  btnOpenEditor.addEventListener('click', async () => {
    // Query if NiceMD is already open
    const tabs = await chrome.tabs.query({});
    const existingTab = tabs.find(t => {
      try {
        const url = new URL(t.url);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '173.168.5.225';
      } catch {
        return false;
      }
    });

    if (existingTab) {
      chrome.tabs.update(existingTab.id, { active: true });
      chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
      // Fetch last known editor URL or fallback
      chrome.storage.local.get(['last_editor_url'], (res) => {
        const url = res.last_editor_url || 'http://localhost:5173/';
        chrome.tabs.create({ url });
      });
    }
  });

  // 7. Sync FAB Setting Binding
  const chkShowFab = document.getElementById('chk-show-fab');
  if (chkShowFab) {
    chrome.storage.local.get({ enable_sync_fab: false }, (result) => {
      chkShowFab.checked = result.enable_sync_fab;
    });

    chkShowFab.addEventListener('change', (e) => {
      chrome.storage.local.set({ enable_sync_fab: e.target.checked });
    });
  }

  // Run initialization
  init();
});

/**
 * Compile a basic HTML representation of Markdown for WeChat MP.
 */
function compileToWeChatHtml(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<section>${htmlContent}</section>`, 'text/html');
  const root = doc.body.querySelector('section');

  const cleanCss = (css) => css.replace(/\s+/g, ' ').trim();

  // 1. Container Style
  root.setAttribute('style', cleanCss(`
    font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 15px;
    line-height: 1.75;
    color: #3f3f3f;
    letter-spacing: 0.05em;
    padding: 20px 10px;
    background-color: transparent;
  `));

  // Helper
  const styleEl = (selector, styleStr) => {
    root.querySelectorAll(selector).forEach(el => {
      const cleanedStyle = cleanCss(styleStr);
      if (/^h[1-6]$/i.test(el.tagName)) {
        const section = doc.createElement('section');
        section.setAttribute('style', cleanedStyle);
        while (el.firstChild) {
          section.appendChild(el.firstChild);
        }
        el.parentNode.replaceChild(section, el);
      } else {
        const existing = el.getAttribute('style') || '';
        el.setAttribute('style', existing ? existing + '; ' + cleanedStyle : cleanedStyle);
      }
    });
  };

  // Headings
  styleEl('h1', `display: block; font-size: 22px; font-weight: bold; color: #5b6c8f; margin-top: 30px; margin-bottom: 20px; text-align: center; border-bottom: 2px solid #5b6c8f; padding-bottom: 8px;`);
  styleEl('h2', `display: block; font-size: 18px; font-weight: bold; color: #5b6c8f; margin-top: 26px; margin-bottom: 16px; border-left: 4px solid #5b6c8f; padding-left: 10px; line-height: 1.3;`);
  styleEl('h3', `display: block; font-size: 16px; font-weight: bold; color: #2d3139; margin-top: 22px; margin-bottom: 12px; padding-left: 8px; border-left: 3px solid #a8c7a0;`);
  styleEl('h4', `display: block; font-size: 15px; font-weight: bold; color: #2d3139; margin-top: 18px; margin-bottom: 8px;`);

  // Paragraphs
  styleEl('p', `margin-top: 0; margin-bottom: 1.5em; text-align: justify; line-height: 1.75;`);
  styleEl('strong', `color: #5b6c8f; font-weight: bold;`);
  styleEl('em', `color: #626a7a; font-style: italic;`);

  // Blockquotes
  styleEl('blockquote', `padding: 12px 18px; margin: 0 0 1.5em 0; background-color: #f2f2ee; border-left: 4px solid #5b6c8f; color: #2d3139; border-radius: 4px; font-size: 14px;`);
  styleEl('blockquote p', `margin-bottom: 0; line-height: 1.6; color: #626a7a;`);

  // Lists
  styleEl('ul', `margin: 0 0 1.5em 0; padding-left: 20px; list-style-type: disc;`);
  styleEl('ol', `margin: 0 0 1.5em 0; padding-left: 20px; list-style-type: decimal;`);
  styleEl('li', `margin-bottom: 0.5em; line-height: 1.6;`);

  // Codes
  styleEl('code', `font-family: monospace; font-size: 13px; padding: 2px 6px; background-color: #f2f2ee; color: #ff7a59; border-radius: 3px; word-break: break-word;`);
  styleEl('pre', `background: #282c34; padding: 14px; border-radius: 8px; overflow-x: auto !important; margin: 0 0 1.5em 0; white-space: pre !important;`);
  styleEl('pre code', `background: transparent; color: #abb2bf; padding: 0; border-radius: 0; font-size: 13px; display: block !important; white-space: pre !important;`);

  // Tables
  styleEl('table', `border-collapse: collapse; width: 100%; margin: 0 0 1.5em 0; font-size: 13px;`);
  styleEl('th', `background-color: #f2f2ee; border: 1px solid #e6e6e2; padding: 8px 12px; font-weight: bold; text-align: left;`);
  styleEl('td', `border: 1px solid #e6e6e2; padding: 8px 12px;`);
  styleEl('img', `max-width: 100%; display: block; margin: 20px auto; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);`);

  root.setAttribute('id', 'nice');
  root.setAttribute('data-tool', 'NiceMD极简分发助手');

  let finalHtml = root.outerHTML;
  finalHtml = finalHtml.replace(/(<\/li>|<\/ol>|<\/ul>|<ol[^>]*>|<ul[^>]*>)\s+(<li>|<ol[^>]*>|<ul[^>]*>|<\/ol>|<\/ul>)/gi, '$1$2');
  return finalHtml;
}
