/**
 * Background Service Worker
 * Manages tab opening, stores publishing payloads, and handles dynamic platform configurations.
 */

self.hmacSHA256Base64 = hmacSHA256Base64;
importScripts('publish-adapters.js');

// Default platforms and selectors configuration
const DEFAULT_PLATFORMS_CONFIG = [
  {
    id: 'wechat',
    name: '微信公众号',
    color: '#07c160',
    writeUrl: 'https://mp.weixin.qq.com/',
    matchHosts: ['mp.weixin.qq.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-editor__input .ProseMirror, .title-editor__input [contenteditable="true"], #title, #js_title, #js_article_title',
      editor: '.rich_media_content .ProseMirror, .rich_media_content [contenteditable="true"], body.view, body[contenteditable="true"]',
      format: 'text/html'
    }
  },
  {
    id: 'zhihu',
    name: '知乎专栏',
    color: '#0084ff',
    writeUrl: 'https://zhuanlan.zhihu.com/write',
    matchHosts: ['zhuanlan.zhihu.com', 'zhihu.com', 'www.zhihu.com'],
    silentEnabled: true,
    selectors: {
      title: 'textarea.WriteIndex-titleInput, [placeholder*="请输入标题"]',
      editor: '.public-DraftEditor-content, .DraftEditor-root [contenteditable="true"], [role="textbox"]',
      format: 'text/plain'
    }
  },
  {
    id: 'juejin',
    name: '稀土掘金',
    color: '#1e80ff',
    writeUrl: 'https://juejin.cn/editor/drafts/new',
    matchHosts: ['juejin.cn'],
    silentEnabled: true,
    selectors: {
      title: 'input.title-input, [placeholder*="文章标题"]',
      editor: '.cm-content, .bytemd-editor [contenteditable="true"], .cm-editor [contenteditable="true"], .bytemd-editor textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'csdn',
    name: 'CSDN 博客',
    color: '#fc5531',
    writeUrl: 'https://editor.csdn.net/md/',
    matchHosts: ['editor.csdn.net', 'mp.csdn.net'],
    silentEnabled: true,
    selectors: {
      title: 'input.article-bar__title, #txtTitle, [placeholder*="标题"]',
      editor: 'body.cke_editable, .cke_editable, .CodeMirror textarea, .cm-content, .ck-editor__editable, .ck-content, .editor__inner, .editor textarea, #editor textarea, .editor [contenteditable="true"], .markdown-editor-content textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'cnblogs',
    name: '博客园',
    color: '#3272ad',
    writeUrl: 'https://i.cnblogs.com/posts/edit',
    matchHosts: ['i.cnblogs.com'],
    silentEnabled: true,
    selectors: {
      title: '#txt-title, [placeholder*="标题"], .post-title-input',
      editor: '#Editor_Edit_EditorBody, .editor-textarea, textarea, .cm-content, #editor-content',
      format: 'text/plain'
    }
  },
  {
    id: 'baijiahao',
    name: '百家号',
    color: '#ea4335',
    writeUrl: 'https://baijiahao.baidu.com/builder/rc/write/article',
    matchHosts: ['baijiahao.baidu.com'],
    silentEnabled: true,
    selectors: {
      title: '.editor-title input, [placeholder*="文章标题"], #title-input',
      editor: '.ProseMirror, [contenteditable="true"], .ueditor-content',
      format: 'text/html'
    }
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    color: '#fb7299',
    writeUrl: 'https://member.bilibili.com/platform/upload/text',
    matchHosts: ['member.bilibili.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-input, input[placeholder*="请输入标题"]',
      editor: '.ProseMirror, [contenteditable="true"], .editor-content',
      format: 'text/plain'
    }
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    color: '#ff2442',
    writeUrl: 'https://creator.xiaohongshu.com/publish/publish?source=official',
    matchHosts: ['creator.xiaohongshu.com', 'xiaohongshu.com', 'www.xiaohongshu.com'],
    silentEnabled: true,
    selectors: {
      title: '.titleInput input, input.d-input__inner, [placeholder*="填写标题"], input[placeholder*="标题"], .c-input_inner, .title-input',
      editor: '.post-content, .ql-editor, .notranslate[contenteditable="true"], [contenteditable="true"], .content-input textarea, textarea[placeholder*="正文"], textarea[placeholder*="填写正文"]',
      format: 'text/plain'
    }
  },
  {
    id: 'eastmoney',
    name: '东方财富',
    color: '#f59e0b',
    writeUrl: 'https://mp.eastmoney.com/NewWrite/Article',
    matchHosts: ['mp.eastmoney.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-input, [placeholder*="标题"], #txtTitle',
      editor: '[contenteditable="true"], .editor-content, textarea',
      format: 'text/html'
    }
  },
  {
    id: 'oschina',
    name: '开源中国',
    color: '#22c55e',
    writeUrl: 'https://my.oschina.net/action/blog/write',
    matchHosts: ['my.oschina.net'],
    silentEnabled: true,
    selectors: {
      title: '[placeholder*="标题"], .title-input, #title',
      editor: '.ProseMirror, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'sohu',
    name: '搜狐号',
    color: '#e11d48',
    writeUrl: 'https://mp.sohu.com/mpbp/bp/article/write',
    matchHosts: ['mp.sohu.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-input, [placeholder*="标题"], input',
      editor: '.ProseMirror, [contenteditable="true"], .editor',
      format: 'text/html'
    }
  },
  {
    id: 'yuque',
    name: '语雀',
    color: '#00b96b',
    writeUrl: 'https://www.yuque.com/dashboard',
    matchHosts: ['yuque.com', 'www.yuque.com'],
    silentEnabled: true,
    selectors: {
      title: '[placeholder*="标题"], .title-input, .ne-title-editor',
      editor: '.ne-engine, [contenteditable="true"]',
      format: 'text/plain'
    }
  },
  {
    id: '51cto',
    name: '51CTO',
    color: '#10b981',
    writeUrl: 'https://blog.51cto.com/blogger/publish',
    matchHosts: ['blog.51cto.com'],
    silentEnabled: true,
    selectors: {
      title: '#title, [placeholder*="标题"], .title-input',
      editor: '[contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'douban',
    name: '豆瓣',
    color: '#007722',
    writeUrl: 'https://www.douban.com/note/create',
    matchHosts: ['douban.com', 'www.douban.com'],
    silentEnabled: true,
    selectors: {
      title: '#note_title, [placeholder*="题目"], input',
      editor: '#note_text, textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'segmentfault',
    name: '思否',
    color: '#009a61',
    writeUrl: 'https://segmentfault.com/write',
    matchHosts: ['segmentfault.com'],
    silentEnabled: true,
    selectors: {
      title: '[placeholder*="标题"], #title, .title-input',
      editor: '.cm-content, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'weibo',
    name: '微博',
    color: '#e6162d',
    writeUrl: 'https://card.weibo.com/article/v5/editor',
    matchHosts: ['card.weibo.com', 'weibo.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-input, [placeholder*="标题"], input',
      editor: '.editor-content, [contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'xueqiu',
    name: '雪球',
    color: '#3b82f6',
    writeUrl: 'https://mp.xueqiu.com/writeV2',
    matchHosts: ['xueqiu.com', 'mp.xueqiu.com'],
    silentEnabled: true,
    selectors: {
      title: '.write-title, [placeholder*="标题"], input',
      editor: '.editor-body, [contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'imooc',
    name: '慕课手记',
    color: '#f01414',
    writeUrl: 'https://www.imooc.com/article/publish',
    matchHosts: ['imooc.com', 'www.imooc.com'],
    silentEnabled: true,
    selectors: {
      title: '.js-title, [placeholder*="标题"], input',
      editor: '[contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'woshipm',
    name: '人人都是产品经理',
    color: '#ea580c',
    writeUrl: 'https://www.woshipm.com/writing',
    matchHosts: ['woshipm.com', 'www.woshipm.com'],
    silentEnabled: true,
    selectors: {
      title: '#post_title, [placeholder*="标题"], input',
      editor: '[contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'jianshu',
    name: '简书',
    color: '#ea6f5a',
    writeUrl: 'https://www.jianshu.com/writer',
    matchHosts: ['jianshu.com', 'www.jianshu.com'],
    silentEnabled: true,
    selectors: {
      title: '._24i7u, [placeholder*="请输入标题"], input',
      editor: '#kalamu-editor, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'toutiao',
    name: '今日头条',
    color: '#ed4040',
    writeUrl: 'https://mp.toutiao.com/profile_v4/graphic/publish',
    matchHosts: ['toutiao.com', 'mp.toutiao.com'],
    silentEnabled: true,
    selectors: {
      title: '.editor-title textarea, .autofit-textarea-wrapper textarea, textarea[placeholder*="文章标题"], textarea[placeholder*="2～30个字"], .editor-title input, [placeholder*="文章标题"], .tui-textarea, .byte-input__inner',
      editor: '.ProseMirror, .byte-editor [contenteditable="true"], .editor-content [contenteditable="true"], .tui-editor [contenteditable="true"], [contenteditable="true"], .editor-tar, .ql-editor',
      format: 'text/html'
    }
  },
  {
    id: 'infoq',
    name: 'InfoQ',
    color: '#0066cc',
    writeUrl: 'https://xie.infoq.cn/article/draft/new',
    matchHosts: ['infoq.cn', 'xie.infoq.cn'],
    silentEnabled: true,
    selectors: {
      title: '.title-input, [placeholder*="标题"], input',
      editor: '.ProseMirror, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'learnku',
    name: 'LearnKu',
    color: '#00c875',
    writeUrl: 'https://learnku.com/articles/create',
    matchHosts: ['learnku.com'],
    silentEnabled: true,
    selectors: {
      title: '#title-field, input[name="title"], input.form-control, #article-title, [placeholder*="标题"]',
      editor: '.CodeMirror, #editor, textarea[name="body"], #body-field, .CodeMirror-code, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'tencentcloud',
    name: '腾讯云开发者',
    color: '#0052d9',
    writeUrl: 'https://cloud.tencent.com/developer/article/write',
    matchHosts: ['cloud.tencent.com'],
    silentEnabled: true,
    selectors: {
      title: 'textarea.article-title, .article-title-wrap textarea, .article-title, textarea[placeholder*="标题"], [placeholder*="请输入标题"], .article-title-input, input',
      editor: '.monaco-editor, .view-lines, .monaco-mouse-cursor-text, .ProseMirror, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'nowcoder',
    name: '牛客网',
    color: '#00db99',
    writeUrl: 'https://www.nowcoder.com/discuss/post/write',
    matchHosts: ['nowcoder.com', 'www.nowcoder.com'],
    silentEnabled: true,
    selectors: {
      title: '.discuss-title input, [placeholder*="标题"], input',
      editor: '.editor-content, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'aliyun',
    name: '阿里云开发者',
    color: '#ff5500',
    writeUrl: 'https://developer.aliyun.com/article/new',
    matchHosts: ['developer.aliyun.com', 'aliyun.com'],
    silentEnabled: true,
    selectors: {
      title: '.article-title input, [placeholder*="标题"], input',
      editor: '.monaco-editor, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'leetcode',
    name: '力扣 (LeetCode)',
    color: '#ffa116',
    writeUrl: 'https://leetcode.cn/circle/discuss/create/',
    matchHosts: ['leetcode.cn'],
    silentEnabled: true,
    selectors: {
      title: 'input[placeholder*="标题"], .topic-title-input',
      editor: '.cm-content, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'zip-download',
    name: 'Markdown 离线包',
    color: '#6366f1',
    writeUrl: '',
    matchHosts: [],
    silentEnabled: true,
    selectors: {
      title: '',
      editor: '',
      format: 'text/plain'
    }
  }
];

// Initialize configurations and declarativeNetRequest rules
chrome.runtime.onInstalled.addListener(() => {
  registerNetRequestRules();
  chrome.storage.local.get(['platforms_config'], (res) => {
    if (!res.platforms_config) {
      chrome.storage.local.set({ platforms_config: DEFAULT_PLATFORMS_CONFIG }, () => {
        console.log('[NiceMD Background] Initialized default platforms configuration.');
      });
    } else {
      // Merge missing default platforms and properties (so upgrades preserve configurations)
      const existing = res.platforms_config;
      let modified = false;
      DEFAULT_PLATFORMS_CONFIG.forEach(defaultPlat => {
        const match = existing.find(p => p.id === defaultPlat.id);
        if (!match) {
          existing.push(defaultPlat);
          modified = true;
        } else {
          // Merge missing properties (like silentEnabled: true)
          for (const key in defaultPlat) {
            if (match[key] === undefined) {
              match[key] = defaultPlat[key];
              modified = true;
            }
          }
        }
      });
      if (modified) {
        chrome.storage.local.set({ platforms_config: existing }, () => {
          console.log('[NiceMD Background] Merged new default platforms and properties.');
        });
      }
    }
  });
});

// Always register rules on service worker startup
registerNetRequestRules();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Save editor URL if sender is NiceMD
  if (sender.tab && sender.tab.url) {
    const urlStr = sender.tab.url;
    try {
      const url = new URL(urlStr);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '173.168.5.225') {
        chrome.storage.local.set({ last_editor_url: urlStr });
      }
    } catch {}
  }

  if (message.type === 'PING') {
    sendResponse({ status: 'PONG', version: '1.2.0' });
    return;
  }

  // 1. Get current active config
  if (message.type === 'GET_CONFIG') {
    chrome.storage.local.get(['platforms_config'], (res) => {
      const config = res.platforms_config || DEFAULT_PLATFORMS_CONFIG;
      sendResponse({ config });
    });
    return true; // async response
  }

  // 2. Save modified config
  if (message.type === 'SAVE_CONFIG') {
    chrome.storage.local.set({ platforms_config: message.config }, () => {
      sendResponse({ success: true });
    });
    return true; // async response
  }

  // 3. Launch publishing flow
  if (message.type === 'LAUNCH_PUBLISH') {
    const { platform, title, markdown, html, cover, isScheduled, scheduledTime, isOriginal } = message.payload;
    
    chrome.storage.local.get(['platforms_config'], (res) => {
      const configList = res.platforms_config || DEFAULT_PLATFORMS_CONFIG;
      const targetPlatform = configList.find(p => p.id === platform);
      const adapter = self.publishAdapters ? self.publishAdapters[platform] : null;
      const isWechat = platform === 'wechat' || platform === 'weixin';
      const silentEnabled = targetPlatform ? targetPlatform.silentEnabled !== false : true;
      
      if (adapter && silentEnabled) {
        adapter.publish({ title, markdown, html, cover, isScheduled, scheduledTime, isOriginal }).then((result) => {
          if (result.localOnly) {
            sendResponse({ success: true, localOnly: true });
          } else {
            // Save payload for any platform navigating to an edit/create page
            chrome.storage.local.set({
              [`pending_publish_${platform}`]: {
                title,
                markdown: result.markdown || markdown,
                html,
                cover,
                timestamp: Date.now()
              }
            }, () => {
              sendResponse({ success: true, postUrl: result.postUrl, postId: result.postId });
            });
          }
        }).catch((err) => {
          console.warn(`[NiceMD Background] Background API publish failed for ${platform}, falling back to tab automation:`, err.message);
          if (isWechat && adapter.getWechatParams) {
            adapter.getWechatParams().then((params) => {
              const dynamicUrl = `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&lang=zh_CN&token=${params.token}`;
              fallbackToTabPublishWithUrl(dynamicUrl, platform, title, markdown, html, cover, sendResponse);
            }).catch(() => {
              fallbackToTabPublishWithUrl('https://mp.weixin.qq.com/', platform, title, markdown, html, cover, sendResponse);
            });
          } else {
            fallbackToTabPublish(platform, title, markdown, html, cover, sendResponse);
          }
        });
      } else {
        if (isWechat && adapter && adapter.getWechatParams) {
          adapter.getWechatParams().then((params) => {
            const dynamicUrl = `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&lang=zh_CN&token=${params.token}`;
            fallbackToTabPublishWithUrl(dynamicUrl, platform, title, markdown, html, cover, sendResponse);
          }).catch(() => {
            fallbackToTabPublishWithUrl('https://mp.weixin.qq.com/', platform, title, markdown, html, cover, sendResponse);
          });
        } else {
          fallbackToTabPublish(platform, title, markdown, html, cover, sendResponse);
        }
      }
    });
    return true; // async response
  }

  // 4. Check login status of platforms
  if (message.type === 'CHECK_LOGINS') {
    const promises = message.platforms.map(async (p) => {
      const authInfo = await checkLoginStatus(p.id, p.writeUrl);
      return { id: p.id, authInfo };
    });
    Promise.all(promises).then((results) => {
      const statuses = {};
      results.forEach((res) => {
        statuses[res.id] = res.authInfo;
      });
      sendResponse({ statuses });
    }).catch((err) => {
      console.error('[NiceMD Background] Check logins failed:', err);
      sendResponse({ statuses: {} });
    });
    return true; // async response
  }

  // 5. Open new tab directly from extension scope
  if (message.type === 'OPEN_TAB') {
    chrome.tabs.create({ url: message.url });
    sendResponse({ success: true });
    return;
  }

  // 6. Fetch external URL to bypass CORS for editor
  if (message.type === 'FETCH_URL') {
    fetch(message.url)
      .then(async (response) => {
        const html = await response.text();
        sendResponse({ success: true, html, finalUrl: response.url });
      })
      .catch((err) => {
        console.warn('[NiceMD Background] FETCH_URL failed:', err.message);
        sendResponse({ success: false, error: err.message });
      });
    return true; // async response
  }

  // 7. Save extracted article and redirect to NiceMD editor
  if (message.type === 'EXTRACTED_ARTICLE_IMPORT') {
    const { title, markdown, html, sourceUrl } = message.payload;
    chrome.storage.local.set({
      pending_import_article: {
        title,
        markdown,
        html,
        sourceUrl,
        timestamp: Date.now()
      }
    }, async () => {
      const tab = await findNiceMDTab();
      if (tab) {
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
        chrome.tabs.sendMessage(tab.id, { type: 'IMPORT_NOTIFICATION' }, (res) => {
          if (chrome.runtime.lastError) {
            // tab might not be listening yet, ignore
          }
        });
      } else {
        chrome.storage.local.get(['last_editor_url'], (res) => {
          const url = res.last_editor_url || 'http://localhost:5173/';
          chrome.tabs.create({ url });
        });
      }
      sendResponse({ success: true });
    });
    return true; // async response
  }

  // 8. Retrieve pending article import for editor
  if (message.type === 'GET_PENDING_IMPORT') {
    chrome.storage.local.get(['pending_import_article'], (res) => {
      if (res.pending_import_article) {
        sendResponse({ success: true, article: res.pending_import_article });
        chrome.storage.local.remove('pending_import_article');
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // async response
  }

  // 9. TiDB Cloud Serverless Fetch (Bypass browser CORS restrictions)
  if (message.type === 'TIDB_FETCH') {
    (async () => {
      try {
        const { url, options = {} } = message;
        const resp = await fetch(url, options);
        const headers = {};
        resp.headers.forEach((v, k) => { headers[k] = v; });
        const text = await resp.text();
        sendResponse({
          success: resp.ok,
          status: resp.status,
          statusText: resp.statusText,
          headers,
          data: text
        });
      } catch (err) {
        sendResponse({
          success: false,
          status: 500,
          error: err.message || 'TiDB Background Fetch Error'
        });
      }
    })();
    return true; // async response
  }
});

// Helper to query open NiceMD editor tabs
async function findNiceMDTab() {
  const tabs = await chrome.tabs.query({});
  const niceMDTab = tabs.find(t => {
    try {
      const url = new URL(t.url);
      return url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '173.168.5.225';
    } catch {
      return false;
    }
  });
  return niceMDTab;
}

// Listen to browser toolbar action click to trigger extraction on active tab
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_EXTRACTION' }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[NiceMD Background] Active tab not listening for TRIGGER_EXTRACTION:', chrome.runtime.lastError.message);
    }
  });
});

// Dynamic session rule registration for CSRF/Origin/Referer spoofing
async function registerNetRequestRules() {
  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://baijiahao.baidu.com' },
          { header: 'Referer', operation: 'set', value: 'https://baijiahao.baidu.com/' }
        ]
      },
      condition: {
        urlFilter: '||baijiahao.baidu.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 2,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://member.bilibili.com' },
          { header: 'Referer', operation: 'set', value: 'https://member.bilibili.com/' }
        ]
      },
      condition: {
        urlFilter: '||api.bilibili.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 3,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://i.cnblogs.com' },
          { header: 'Referer', operation: 'set', value: 'https://i.cnblogs.com/' }
        ]
      },
      condition: {
        urlFilter: '||i.cnblogs.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 4,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://blog.51cto.com' },
          { header: 'Referer', operation: 'set', value: 'https://blog.51cto.com/' }
        ]
      },
      condition: {
        urlFilter: '||blog.51cto.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 5,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://www.douban.com' },
          { header: 'Referer', operation: 'set', value: 'https://www.douban.com/' }
        ]
      },
      condition: {
        urlFilter: '||www.douban.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 6,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://mp.eastmoney.com' },
          { header: 'Host', operation: 'set', value: 'mp.eastmoney.com' }
        ]
      },
      condition: {
        urlFilter: '||caifuhaoapi.eastmoney.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 7,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://www.imooc.com' },
          { header: 'Referer', operation: 'set', value: 'https://www.imooc.com/article/' }
        ]
      },
      condition: {
        urlFilter: '||www.imooc.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 8,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://my.oschina.net' },
          { header: 'Referer', operation: 'set', value: 'https://my.oschina.net/' }
        ]
      },
      condition: {
        urlFilter: '||apiv1.oschina.net',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 9,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://segmentfault.com' },
          { header: 'Referer', operation: 'set', value: 'https://segmentfault.com/' }
        ]
      },
      condition: {
        urlFilter: '||segmentfault.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 10,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://mp.sohu.com' },
          { header: 'Referer', operation: 'set', value: 'https://mp.sohu.com/' }
        ]
      },
      condition: {
        urlFilter: '||mp.sohu.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 11,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://card.weibo.com' },
          { header: 'Referer', operation: 'set', value: 'https://card.weibo.com/' }
        ]
      },
      condition: {
        urlFilter: '||card.weibo.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 12,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://mp.weixin.qq.com' },
          { header: 'Referer', operation: 'set', value: 'https://mp.weixin.qq.com/' }
        ]
      },
      condition: {
        urlFilter: '||mp.weixin.qq.com/cgi-bin/filetransfer',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 20,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://mp.weixin.qq.com' },
          { header: 'Referer', operation: 'set', value: 'https://mp.weixin.qq.com/' }
        ]
      },
      condition: {
        urlFilter: '||mp.weixin.qq.com/cgi-bin/operate_appmsg',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 13,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'X-Requested-With', operation: 'set', value: 'XMLHttpRequest' }
        ]
      },
      condition: {
        urlFilter: '||woshipm.com/api2',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 14,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://mp.xueqiu.com' },
          { header: 'Referer', operation: 'set', value: 'https://mp.xueqiu.com/' }
        ]
      },
      condition: {
        urlFilter: '||mp.xueqiu.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 15,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://www.yuque.com' },
          { header: 'Referer', operation: 'set', value: 'https://www.yuque.com/' }
        ]
      },
      condition: {
        urlFilter: '||www.yuque.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 16,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://juejin.cn' },
          { header: 'Referer', operation: 'set', value: 'https://juejin.cn/' }
        ]
      },
      condition: {
        urlFilter: '||api.juejin.cn',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 17,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://editor.csdn.net' },
          { header: 'Referer', operation: 'set', value: 'https://editor.csdn.net/' }
        ]
      },
      condition: {
        urlFilter: '||bizapi.csdn.net',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 18,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://editor.csdn.net' },
          { header: 'Referer', operation: 'set', value: 'https://editor.csdn.net/' }
        ]
      },
      condition: {
        urlFilter: '||imgservice.csdn.net',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 19,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://editor.csdn.net' },
          { header: 'Referer', operation: 'set', value: 'https://editor.csdn.net/' }
        ]
      },
      condition: {
        urlFilter: 'obs.cn-north-4.myhuaweicloud.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 21,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://segmentfault.com' },
          { header: 'Referer', operation: 'set', value: 'https://segmentfault.com/' }
        ]
      },
      condition: {
        urlFilter: '||segmentfault.com/gateway',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 22,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://zhuanlan.zhihu.com' },
          { header: 'Referer', operation: 'set', value: 'https://zhuanlan.zhihu.com/' }
        ]
      },
      condition: {
        urlFilter: '||api.zhihu.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 23,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://zhuanlan.zhihu.com' },
          { header: 'Referer', operation: 'set', value: 'https://zhuanlan.zhihu.com/' }
        ]
      },
      condition: {
        urlFilter: '||zhihu-pics-upload.zhimg.com',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 24,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://zhuanlan.zhihu.com' },
          { header: 'Referer', operation: 'set', value: 'https://zhuanlan.zhihu.com/' }
        ]
      },
      condition: {
        urlFilter: '||zhuanlan.zhihu.com/api',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 25,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://learnku.com' },
          { header: 'Referer', operation: 'set', value: 'https://learnku.com/articles/create' }
        ]
      },
      condition: {
        urlFilter: '||learnku.com/',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 26,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://developer.aliyun.com' },
          { header: 'Referer', operation: 'set', value: 'https://developer.aliyun.com/article/new' }
        ]
      },
      condition: {
        urlFilter: '||developer.aliyun.com/developer/api/',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 27,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://cloud.tencent.com' },
          { header: 'Referer', operation: 'set', value: 'https://cloud.tencent.com/developer/article/write' }
        ]
      },
      condition: {
        urlFilter: '||cloud.tencent.com/developer/services/ajax/',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 28,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://creator.xiaohongshu.com' },
          { header: 'Referer', operation: 'set', value: 'https://creator.xiaohongshu.com/' }
        ]
      },
      condition: {
        urlFilter: '||creator.xiaohongshu.com/api/',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    },
    {
      id: 29,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          { header: 'Origin', operation: 'set', value: 'https://www.xiaohongshu.com' },
          { header: 'Referer', operation: 'set', value: 'https://www.xiaohongshu.com/' }
        ]
      },
      condition: {
        urlFilter: '||edith.xiaohongshu.com/api/',
        resourceTypes: ['xmlhttprequest', 'other']
      }
    }
  ];

  try {
    const oldRuleIds = rules.map(r => r.id);
    await chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: oldRuleIds,
      addRules: rules
    });
    console.log('[NiceMD Background] Registered declarativeNetRequest session rules.');
  } catch (err) {
    console.error('[NiceMD Background] Failed to register session rules:', err.message);
  }
}

// Helper to generate HMAC-SHA256 Base64 signature in Service Worker context
async function hmacSHA256Base64(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(message)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Cookie reader helper using chrome.cookies API
function getCookieValue(url, name) {
  return new Promise((resolve) => {
    if (!chrome.cookies) {
      resolve(null);
      return;
    }
    chrome.cookies.get({ url, name }, (cookie) => {
      if (chrome.runtime.lastError) {
        console.warn(`[NiceMD Cookie] Failed to read ${name}:`, chrome.runtime.lastError.message);
        resolve(null);
      } else {
        resolve(cookie ? cookie.value : null);
      }
    });
  });
}

// Main logic to check login status of different platforms
async function checkLoginStatus(platformId, writeUrl) {
  try {
    if (platformId === 'zip-download') {
      return { loggedIn: true, username: '本地下载', avatar: null };
    }

    if (platformId === 'csdn') {
      const nonce = crypto.randomUUID();
      const key = '203803574';
      const secret = '9znpamsyl2c7cdrr9sas0le9vbc3r6ba';
      const path = '/blog-console-api/v3/editor/getBaseInfo';
      const stringToSign = `GET\n*/*\n\n\n\nx-ca-key:${key}\nx-ca-nonce:${nonce}\n${path}`;
      const signature = await hmacSHA256Base64(secret, stringToSign);

      const response = await fetch('https://bizapi.csdn.net/blog-console-api/v3/editor/getBaseInfo', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'accept': '*/*',
          'x-ca-key': key,
          'x-ca-nonce': nonce,
          'x-ca-signature': signature,
          'x-ca-signature-headers': 'x-ca-key,x-ca-nonce'
        }
      });
      const json = await response.json();
      if (json.code === 200 && json.data && json.data.name) {
        return {
          loggedIn: true,
          userId: json.data.name,
          username: json.data.nickname || json.data.name,
          avatar: json.data.avatar
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'eastmoney') {
      const ct = await getCookieValue('https://mp.eastmoney.com', 'ct');
      const ut = await getCookieValue('https://mp.eastmoney.com', 'ut');
      if (!ct || !ut) {
        return { loggedIn: false };
      }
      const response = await fetch(`https://caifuhaoapi.eastmoney.com/api/v2/getauthorinfo?platform=&ctoken=${encodeURIComponent(ct)}&utoken=${encodeURIComponent(ut)}`, {
        method: 'GET',
        credentials: 'include'
      });
      const json = await response.json();
      if (json.Success === 1 && json.Result && json.Result.accountId) {
        return {
          loggedIn: true,
          userId: json.Result.accountId,
          username: json.Result.accountName,
          avatar: json.Result.portrait
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'yuque') {
      const ctoken = await getCookieValue('https://www.yuque.com', 'yuque_ctoken');
      if (!ctoken) {
        return { loggedIn: false };
      }
      const response = await fetch('https://www.yuque.com/api/mine/common_used', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'x-csrf-token': ctoken
        }
      });
      const json = await response.json();
      if (json.data && Array.isArray(json.data.books) && json.data.books.length > 0) {
        const book = json.data.books[0];
        if (book.user) {
          return {
            loggedIn: true,
            userId: String(book.user.id),
            username: book.user.name,
            avatar: book.user.avatar_url
          };
        }
      }
      return { loggedIn: false };
    }

    if (platformId === 'baijiahao') {
      const response = await fetch(`https://baijiahao.baidu.com/builder/app/appinfo?_=${Date.now()}`, {
        method: 'GET',
        credentials: 'include'
      });
      const json = await response.json();
      if (json.errmsg === 'success' && json.data && json.data.user) {
        return {
          loggedIn: true,
          userId: json.data.user.userid,
          username: json.data.user.name,
          avatar: json.data.user.avatar
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'bilibili') {
      const response = await fetch('https://api.bilibili.com/x/web-interface/nav?build=0&mobi_app=web', {
        method: 'GET',
        credentials: 'include'
      });
      const json = await response.json();
      if (json.code === 0 && json.data && json.data.isLogin === true) {
        return {
          loggedIn: true,
          userId: String(json.data.mid),
          username: json.data.uname,
          avatar: json.data.face
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'xiaohongshu' || platformId === 'xhs') {
      try {
        // Step 1: Strict Cookie Verification (Only real auth session tokens)
        const [xhsCookies, creatorCookies] = await Promise.all([
          chrome.cookies.getAll({ domain: 'xiaohongshu.com' }).catch(() => []),
          chrome.cookies.getAll({ domain: 'creator.xiaohongshu.com' }).catch(() => [])
        ]);

        const cookieMap = new Map();
        [...xhsCookies, ...creatorCookies].forEach(c => {
          if (c && c.name && c.value) {
            cookieMap.set(c.name, c.value);
          }
        });

        // ONLY web_session and galaxy_creator_session represent logged-in user tokens.
        // Guest/device tracking cookies (customerClientId, a1, webId, etc.) MUST NEVER be used as auth flags.
        const webSession = cookieMap.get('web_session');
        const creatorSession = cookieMap.get('galaxy_creator_session') || cookieMap.get('galaxy.creator.session');

        const hasValidSession = !!(
          (webSession && webSession.trim().length > 15) ||
          (creatorSession && creatorSession.trim().length > 15)
        );

        if (!hasValidSession) {
          return { loggedIn: false };
        }

        // Helper to extract user info from various API response formats
        const extractUser = (json) => {
          if (!json) return null;
          if (json.code !== 0 && json.success !== true) return null;
          const d = json.data;
          if (!d) return null;
          
          const u = d.userInfo || d.user || d.creatorInfo || d.creator || d.personalInfo || d.userPageData || d;
          const nickname = u.nickname || u.userName || u.user_name || u.name || u.nickName || d.nickname || d.userName || '';
          const userId = u.user_id || u.userId || u.id || d.user_id || d.userId || '';
          const avatar = u.avatar || u.image || u.head_img || u.avatar_url || d.avatar || d.image || null;

          if (nickname || userId) {
            return {
              loggedIn: true,
              userId: String(userId),
              username: nickname || `小红书用户${userId ? String(userId).slice(-4) : ''}`,
              avatar: avatar
            };
          }
          return null;
        };

        // Step 2: Try Creator User Info endpoints
        const creatorEndpoints = [
          'https://creator.xiaohongshu.com/api/galaxy/creator/user/info',
          'https://creator.xiaohongshu.com/api/galaxy/user/info',
          'https://creator.xiaohongshu.com/api/galaxy/creator/home/personal_info',
          'https://creator.xiaohongshu.com/api/galaxy/creator/home/info'
        ];

        for (const endpoint of creatorEndpoints) {
          try {
            const resp = await fetch(endpoint, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://creator.xiaohongshu.com/'
              },
              cache: 'no-cache'
            });
            if (resp.ok) {
              const json = await resp.json();
              const user = extractUser(json);
              if (user) return user;
            }
          } catch (e) {}
        }

        // Step 3: Try Edith Main Site API
        const edithEndpoints = [
          'https://edith.xiaohongshu.com/api/sns/web/v1/user/selfinfo',
          'https://www.xiaohongshu.com/api/sns/web/v1/user/selfinfo',
          'https://edith.xiaohongshu.com/api/sns/web/v2/user/me'
        ];

        for (const endpoint of edithEndpoints) {
          try {
            const resp = await fetch(endpoint, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.xiaohongshu.com/'
              },
              cache: 'no-cache'
            });
            if (resp.ok) {
              const json = await resp.json();
              const user = extractUser(json);
              if (user) return user;
            }
          } catch (e) {}
        }

        // Step 4: Try fetching Creator Home HTML page to parse window.__INITIAL_STATE__
        try {
          const respHome = await fetch('https://creator.xiaohongshu.com/creator/home', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Referer': 'https://creator.xiaohongshu.com/'
            },
            cache: 'no-cache'
          });
          const finalUrl = respHome.url || '';
          if (!finalUrl.includes('/login') && !finalUrl.includes('unlogin')) {
            const html = await respHome.text();
            const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/);
            if (stateMatch) {
              try {
                const state = JSON.parse(stateMatch[1]);
                const user = extractUser({ code: 0, success: true, data: state.user || state.userInfo || state });
                if (user) return user;
              } catch (e) {}
            }
            const nickMatch = html.match(/"nickname":\s*"([^"]+)"/) || html.match(/"userName":\s*"([^"]+)"/);
            const avatarMatch = html.match(/"avatar":\s*"([^"]+)"/) || html.match(/"image":\s*"([^"]+)"/);
            const uidMatch = html.match(/"userId":\s*"([^"]+)"/) || html.match(/"user_id":\s*"([^"]+)"/);
            if (nickMatch && nickMatch[1]) {
              return {
                loggedIn: true,
                userId: uidMatch ? uidMatch[1] : '',
                username: nickMatch[1],
                avatar: avatarMatch ? avatarMatch[1] : null
              };
            }
          }
        } catch (e) {}

        // Step 5: Try fetching Main Site Explore HTML page to parse window.__INITIAL_STATE__
        try {
          const respExplore = await fetch('https://www.xiaohongshu.com/explore', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Referer': 'https://www.xiaohongshu.com/'
            },
            cache: 'no-cache'
          });
          const html = await respExplore.text();
          const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/);
          if (stateMatch) {
            try {
              const state = JSON.parse(stateMatch[1]);
              const u = state.user && (state.user.userPageData || state.user.userInfo || state.user);
              if (u && (u.nickname || u.userName)) {
                return {
                  loggedIn: true,
                  userId: u.userId || u.user_id || '',
                  username: u.nickname || u.userName,
                  avatar: u.avatar || u.image || null
                };
              }
            } catch (e) {}
          }
          const nickMatch = html.match(/"nickname":\s*"([^"]+)"/);
          if (nickMatch && nickMatch[1]) {
            return {
              loggedIn: true,
              username: nickMatch[1]
            };
          }
        } catch (e) {}

        // If we reach here, we have a valid web_session token (>30 chars), return logged in
        if ((webSession && webSession.length > 30) || (creatorSession && creatorSession.length > 30)) {
          return {
            loggedIn: true,
            username: '小红书已登录'
          };
        }

        return { loggedIn: false };
      } catch (err) {
        console.warn('[NiceMD Check Login] Xiaohongshu check error:', err);
        return { loggedIn: false };
      }
    }

    if (platformId === 'oschina') {
      const response = await fetch('https://apiv1.oschina.net/oschinapi/user/myDetails', {
        method: 'GET',
        credentials: 'include'
      });
      const json = await response.json();
      if (json.success === true && json.result && json.result.userId) {
        return {
          loggedIn: true,
          userId: String(json.result.userId),
          username: json.result.userVo ? json.result.userVo.name : String(json.result.userId),
          avatar: json.result.userVo ? json.result.userVo.portraitUrl : null
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'sohu') {
      const response = await fetch(`https://mp.sohu.com/mpbp/bp/account/list?_=${Date.now()}`, {
        method: 'GET',
        credentials: 'include'
      });
      const json = await response.json();
      if (json.code === 2000000 && json.data && Array.isArray(json.data.data)) {
        let accounts = [];
        for (const group of json.data.data) {
          if (group && Array.isArray(group.accounts)) {
            accounts.push(...group.accounts);
          }
        }
        if (accounts.length > 0) {
          const mainAcc = accounts[0];
          const username = mainAcc.nickName + (accounts.length > 1 ? ` (共${accounts.length}个子账号)` : '');
          return {
            loggedIn: true,
            userId: String(mainAcc.id),
            username: username,
            avatar: mainAcc.avatar
          };
        }
      }
      return { loggedIn: false };
    }

    if (platformId === 'zhihu') {
      const response = await fetch('https://www.zhihu.com/api/v4/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'x-requested-with': 'fetch'
        }
      });
      const json = await response.json();
      if (json && json.id) {
        return {
          loggedIn: true,
          userId: json.id,
          username: json.name,
          avatar: json.avatar_url
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'juejin') {
      const response = await fetch('https://api.juejin.cn/user_api/v1/user/get', {
        method: 'GET',
        credentials: 'include'
      });
      const json = await response.json();
      if (json && json.data && json.data.user_id) {
        return {
          loggedIn: true,
          userId: json.data.user_id,
          username: json.data.user_name,
          avatar: json.data.avatar_large
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'imooc') {
      const response = await fetch('https://www.imooc.com/u/card', {
        method: 'GET',
        credentials: 'include'
      });
      const text = await response.text();
      const match = text.match(/^[^(]*\(([\s\S]+)\)[^)]*$/);
      if (match) {
        const json = JSON.parse(match[1]);
        if (json.result === 0 && json.data) {
          return {
            loggedIn: true,
            userId: String(json.data.uid),
            username: json.data.nickname,
            avatar: json.data.img
          };
        }
      }
      return { loggedIn: false };
    }

    if (platformId === 'woshipm') {
      const response1 = await fetch('https://www.woshipm.com/writing', {
        method: 'GET',
        credentials: 'include'
      });
      const html1 = await response1.text();
      const uidMatch = html1.match(/var\s+userSettings\s*=\s*\{[^}]*"uid"\s*:\s*"(\d+)"/);
      if (!uidMatch) {
        return { loggedIn: false };
      }
      const uid = uidMatch[1];
      
      const response2 = await fetch(`https://www.woshipm.com/api2/user/profile?uid=${uid}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      const json2 = await response2.json();
      if (json2 && json2.CODE === 200 && json2.RESULT && json2.RESULT.userInfoVo && json2.RESULT.userInfoVo.uid) {
        return {
          loggedIn: true,
          userId: String(json2.RESULT.userInfoVo.uid),
          username: json2.RESULT.userInfoVo.nickName,
          avatar: json2.RESULT.userInfoVo.avartar
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'wechat' || platformId === 'weixin') {
      const response = await fetch('https://mp.weixin.qq.com/', {
        method: 'GET',
        credentials: 'include',
        redirect: 'follow',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const finalUrl = response.url;
      const html = await response.text();
      const tokenMatch = html.match(/data:\s*\{[\s\S]*?t:\s*["']([^"']+)["']/) || finalUrl.match(/token=(\d+)/);
      const isHome = finalUrl.includes('cgi-bin/home') || finalUrl.includes('token=') || !!tokenMatch;

      if (isHome) {
        const nickMatch = html.match(/nick_name:\s*["']([^"']+)["']/);
        const usernameMatch = html.match(/user_name:\s*["']([^"']+)["']/);
        const headImgMatch = html.match(/head_img:\s*['"]([^'"]+)['"]/);
        const avatarMatch = html.match(/class="weui-desktop-account__thumb"[^>]*src="([^"]+)"/);

        let avatar = avatarMatch ? avatarMatch[1] : (headImgMatch ? headImgMatch[1] : null);
        if (avatar && avatar.startsWith('http://')) {
          avatar = avatar.replace('http://', 'https://');
        }

        return {
          loggedIn: true,
          userId: usernameMatch ? usernameMatch[1] : 'wechat',
          username: nickMatch ? nickMatch[1] : '微信公众号',
          avatar: avatar
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'cnblogs') {
      const response = await fetch('https://home.cnblogs.com/user/CurrentUserInfo', {
        method: 'GET',
        credentials: 'include'
      });
      const html = await response.text();
      const uidMatch = html.match(/href="\/u\/([^\/]+)\/"/);
      if (uidMatch) {
        const uid = uidMatch[1];
        const avatarMatch = html.match(/<img[^>]+class="pfs"[^>]+src="([^"]+)"/);
        return {
          loggedIn: true,
          userId: uid,
          username: uid,
          avatar: avatarMatch ? avatarMatch[1] : null
        };
      }
      return { loggedIn: false };
    }

    if (platformId === '51cto') {
      const response = await fetch('https://blog.51cto.com/blogger/publish', {
        method: 'GET',
        credentials: 'include'
      });
      const html = await response.text();
      const userMatch = html.match(/<li class="more user">\s*<a[^>]*href="([^"]+)"[^>]*>\s*<img[^>]*src="([^"]+)"/);
      if (userMatch) {
        const userLink = userMatch[1];
        const avatar = userMatch[2];
        const parts = userLink.split('/');
        const uid = parts.filter(Boolean).pop();
        return {
          loggedIn: true,
          userId: uid,
          username: uid,
          avatar: avatar
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'douban') {
      const response = await fetch('https://www.douban.com/note/create', {
        method: 'GET',
        credentials: 'include'
      });
      const html = await response.text();
      const userMatch = html.match(/_USER_NAME\s*=\s*['"]([^'"]+)['"]/);
      const noteMatch = html.match(/name="note_id"\s+value="(\d+)"/);
      const ckMatch = html.match(/name="ck"\s+value="([^"]+)"/);
      if (userMatch && noteMatch && ckMatch) {
        const username = userMatch[1];
        const avatarMatch = html.match(/_USER_AVATAR\s*=\s*['"]([^'"]+)['"]/);
        return {
          loggedIn: true,
          userId: username,
          username: username,
          avatar: avatarMatch ? avatarMatch[1] : null
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'segmentfault') {
      const response = await fetch('https://segmentfault.com/user/settings', {
        method: 'GET',
        credentials: 'include'
      });
      const html = await response.text();
      const uidMatch = html.match(/href="\/u\/([^"]+)"/);
      if (uidMatch) {
        const uid = uidMatch[1];
        const avatarMatch = html.match(/src="(https:\/\/avatar-static\.segmentfault\.com\/[^"]+)"/);
        return {
          loggedIn: true,
          userId: uid,
          username: uid,
          avatar: avatarMatch ? avatarMatch[1] : null
        };
      }
      return { loggedIn: false };
    }

    if (platformId === 'weibo') {
      const response = await fetch('https://card.weibo.com/article/v5/editor', {
        method: 'GET',
        credentials: 'include'
      });
      const html = await response.text();
      const configMatch = html.match(/config:\s*JSON\.parse\('(.+?)'\)/);
      if (configMatch) {
        let jsonStr = configMatch[1];
        jsonStr = jsonStr.replace(/\\'/g, "'").replace(/\\\\/g, "\\");
        const config = JSON.parse(jsonStr);
        if (config && config.uid) {
          return {
            loggedIn: true,
            userId: String(config.uid),
            username: config.nick,
            avatar: config.avatar_large
          };
        }
      }
      return { loggedIn: false };
    }

    if (platformId === 'xueqiu') {
      const response = await fetch('https://mp.xueqiu.com/writeV2', {
        method: 'GET',
        credentials: 'include'
      });
      const html = await response.text();
      const userMatch = html.match(/window\.UOM_CURRENTUSER\s*=\s*(\{[\s\S]*?\})\s*<\/script>/);
      if (userMatch) {
        const stateJson = JSON.parse(userMatch[1]);
        if (stateJson && stateJson.currentUser && stateJson.currentUser.id) {
          const u = stateJson.currentUser;
          let avatar = '';
          if (u.profile_image_url) {
            avatar = 'https:' + u.photo_domain + u.profile_image_url.split(',')[0];
          }
          return {
            loggedIn: true,
            userId: String(u.id),
            username: u.screen_name,
            avatar: avatar
          };
        }
      }
      return { loggedIn: false };
    }

    if (platformId === 'toutiao') {
      try {
        // 1. 全域 Cookie 聚合（包含 mp.toutiao.com 与 www.toutiao.com 的 host 及 domain 级别的 Cookie）
        const [mpCookies, wwwCookies, rootCookies] = await Promise.all([
          chrome.cookies.getAll({ url: 'https://mp.toutiao.com/' }).catch(() => []),
          chrome.cookies.getAll({ url: 'https://www.toutiao.com/' }).catch(() => []),
          chrome.cookies.getAll({ domain: 'toutiao.com' }).catch(() => [])
        ]);

        const cookieMap = new Map();
        [...mpCookies, ...wwwCookies, ...rootCookies].forEach(c => {
          if (c && c.name && c.value) {
            cookieMap.set(c.name, c.value);
          }
        });

        const hasSession = !!(
          (cookieMap.get('sessionid_ss') && cookieMap.get('sessionid_ss').length > 5) ||
          (cookieMap.get('sessionid') && cookieMap.get('sessionid').length > 5) ||
          (cookieMap.get('sid_tt') && cookieMap.get('sid_tt').length > 5) ||
          (cookieMap.get('sid_guard') && cookieMap.get('sid_guard').length > 5) ||
          cookieMap.get('passport_auth_status') === '1' ||
          cookieMap.get('passport_auth_status_ss') === '1' ||
          cookieMap.get('login_flag') === '1'
        );

        let detectedUid = cookieMap.get('user_id') || cookieMap.get('uid_tt') || cookieMap.get('uid_tt_ss') || '';
        let detectedName = '';
        let detectedAvatar = null;

        const rawNick = cookieMap.get('user_name') || cookieMap.get('user_name_ss') || cookieMap.get('screen_name') || '';
        if (rawNick) {
          try { detectedName = decodeURIComponent(rawNick); } catch (e) { detectedName = rawNick; }
        }

        // 2. 尝试 mp.toutiao.com 创作者信息接口 (author_info)
        try {
          const resAuthor = await fetch('https://mp.toutiao.com/mp/agw/creator/home/author_info', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://mp.toutiao.com/profile_v4/index'
            },
            cache: 'no-cache'
          });
          const jsonAuthor = await resAuthor.json();
          if (jsonAuthor && (jsonAuthor.code === 0 || jsonAuthor.message === 'success') && jsonAuthor.data) {
            const d = jsonAuthor.data;
            return {
              loggedIn: true,
              userId: d.user_id ? String(d.user_id) : (d.author_id ? String(d.author_id) : detectedUid),
              username: d.author_name || d.user_name || d.name || detectedName || '今日头条创作者',
              avatar: d.avatar_url || d.avatar || null
            };
          }
        } catch (e) {}

        // 3. 尝试 mp.toutiao.com 图文基础信息接口 (basic_info)
        try {
          const response = await fetch('https://mp.toutiao.com/mp/agw/article_meta/basic_info', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://mp.toutiao.com/profile_v4/graphic/publish'
            },
            cache: 'no-cache'
          });
          const json = await response.json();
          if (json && (json.code === 0 || json.message === 'success') && json.data) {
            const d = json.data;
            return {
              loggedIn: true,
              userId: d.user_id ? String(d.user_id) : (d.media_id ? String(d.media_id) : detectedUid),
              username: d.user_name || d.name || d.screen_name || detectedName || '今日头条创作者',
              avatar: d.avatar_url || d.user_avatar || null
            };
          }
        } catch (e) {}

        // 4. 尝试 www.toutiao.com 用户信息接口 (user/info)
        try {
          const resMain = await fetch('https://www.toutiao.com/api/pc/user/info', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Referer': 'https://www.toutiao.com/'
            },
            cache: 'no-cache'
          });
          const jsonMain = await resMain.json();
          if (jsonMain && (jsonMain.code === 0 || jsonMain.message === 'success') && jsonMain.data) {
            const d = jsonMain.data;
            if (d.user_id || d.name || d.screen_name) {
              return {
                loggedIn: true,
                userId: d.user_id ? String(d.user_id) : detectedUid,
                username: d.name || d.screen_name || detectedName || '今日头条创作者',
                avatar: d.avatar_url || null
              };
            }
          }
        } catch (e) {}

        // 5. 尝试拉取 mp 发布页检测重定向与内嵌数据
        try {
          const resPage = await fetch('https://mp.toutiao.com/profile_v4/graphic/publish', {
            method: 'GET',
            credentials: 'include',
            redirect: 'follow',
            cache: 'no-cache'
          });
          const finalUrl = resPage.url || '';
          if (resPage.ok && !finalUrl.includes('/login') && !finalUrl.includes('/auth/page')) {
            const html = await resPage.text();
            const userMatch = html.match(/"user_name":\s*"([^"]+)"/) || 
                              html.match(/"screen_name":\s*"([^"]+)"/) ||
                              html.match(/"name":\s*"([^"]+)"/);
            const avatarMatch = html.match(/"avatar_url":\s*"([^"]+)"/);
            const uidMatch = html.match(/"user_id":\s*"?(\d+)"?/);
            if (userMatch || uidMatch || html.includes('byte-input')) {
              return {
                loggedIn: true,
                userId: uidMatch ? uidMatch[1] : detectedUid,
                username: userMatch ? userMatch[1] : (detectedName || '今日头条创作者'),
                avatar: avatarMatch ? avatarMatch[1] : null
              };
            }
          }
        } catch (e) {}

        // 6. Cookie 判定兜底
        if (hasSession) {
          return {
            loggedIn: true,
            userId: detectedUid,
            username: detectedName || '今日头条创作者',
            avatar: null
          };
        }

        return { loggedIn: false };
      } catch (e) {
        console.warn('[NiceMD Check Login] Toutiao check error:', e);
        return { loggedIn: false };
      }
    }

    if (platformId === 'infoq') {
      try {
        const response = await fetch('https://xie.infoq.cn/article/draft/new', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache'
        });
        const html = await response.text();
        const userMatch = html.match(/"nickname":\s*"([^"]+)"/) || 
                          html.match(/"userName":\s*"([^"]+)"/) ||
                          html.match(/"nickName":\s*"([^"]+)"/);
        if (userMatch && userMatch[1] && userMatch[1] !== 'null') {
          return { loggedIn: true, username: userMatch[1] };
        }
        // Check if page redirected or has login prompt
        if (html.includes('"isLogin":true') || html.includes('isLogin: true')) {
          return { loggedIn: true, username: 'InfoQ 创作者' };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    if (platformId === 'learnku') {
      try {
        const response = await fetch('https://learnku.com/', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache'
        });
        const html = await response.text();

        // 1. Direct match on .nav-user-item navbar container (Exact live structure)
        const navItemMatch = html.match(/class="[^"]*nav-user-item[^"]*"[^>]*>([\s\S]*?)<div class="ui menu/);
        if (navItemMatch) {
          const navContent = navItemMatch[1];
          // Extract avatar
          const avatarMatch = navContent.match(/src="([^"]+)"/);
          // Extract username: text between img/nbsp and <i class="dropdown icon">
          const nameMatch = navContent.match(/<img[^>]*>[\s\S]*?(?:&nbsp;)?\s*([^<\s][^<]*?)\s*<i class="[^"]*dropdown icon/);
          // Extract uid
          const uidMatch = html.match(/href="https:\/\/learnku\.com\/users\/(\d+)"/) || html.match(/'user_id':\s*([1-9]\d*)/);

          const username = nameMatch ? nameMatch[1].trim() : '';
          const avatar = avatarMatch ? avatarMatch[1] : null;
          const uid = uidMatch ? uidMatch[1] : '';

          if (username || uid) {
            return {
              loggedIn: true,
              userId: uid,
              username: username || `用户${uid}`,
              avatar: avatar
            };
          }
        }

        // 2. Secondary fallback via window.Config.user_id
        const userIdMatch = html.match(/'user_id':\s*([1-9]\d*)/) || 
                            html.match(/"user_id":\s*([1-9]\d*)/) ||
                            html.match(/'search_user_id':\s*([1-9]\d*)/);

        if (userIdMatch && parseInt(userIdMatch[1]) > 0) {
          const uid = userIdMatch[1];
          const nameMatch = html.match(/class="[^"]*nav-user-item[^"]*"[^>]*>[\s\S]*?<img[^>]*>[\s\S]*?(?:&nbsp;)?\s*([^<\s][^<]*?)\s*<i/) ||
                            html.match(/href="https:\/\/learnku\.com\/users\/\d+"[^>]*title="([^"]+)"/);
          const avatarMatch = html.match(/src="([^"]*uploads\/avatars\/[^"]+)"/);

          return {
            loggedIn: true,
            userId: uid,
            username: nameMatch ? nameMatch[1].trim() : `用户${uid}`,
            avatar: avatarMatch ? avatarMatch[1] : null
          };
        }

        return { loggedIn: false };
      } catch (e) {
        console.warn('[NiceMD Check Login] Learnku check error:', e);
        return { loggedIn: false };
      }
    }

    if (platformId === 'tencentcloud' || platformId === 'tencent-cloud') {
      try {
        const response = await fetch('https://cloud.tencent.com/developer/article/write', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache'
        });
        const html = await response.text();
        const nickMatch = html.match(/"nickName":\s*"([^"]+)"/) || html.match(/"username":\s*"([^"]+)"/);
        if (nickMatch && nickMatch[1]) {
          return { loggedIn: true, username: nickMatch[1] };
        }
        const cookies = await chrome.cookies.getAll({ domain: 'tencent.com' });
        const uinCookie = cookies.find(c => (c.name === 'uin' || c.name === 'o_cookie') && c.value && c.value !== 'o0');
        if (uinCookie) {
          return { loggedIn: true, username: '腾讯云创作者' };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    if (platformId === 'nowcoder') {
      try {
        // 1. Inspect cookies for Nowcoder
        const cookies = await chrome.cookies.getAll({ domain: 'nowcoder.com' });
        const userCookie = cookies.find(c => c.name === 'NOWCODERUSER' || c.name === 'userName' || c.name === 'nickname');
        const uidCookie = cookies.find(c => c.name === 'NOWCODERUID' || c.name === 'nowcoder_uid' || c.name === 'userId');
        const tokenCookie = cookies.find(c => c.name === 't' || c.name === 'nowcoder_token');

        let cookieUsername = '';
        if (userCookie && userCookie.value) {
          try {
            cookieUsername = decodeURIComponent(userCookie.value);
          } catch (e) {
            cookieUsername = userCookie.value;
          }
        }

        // 2. Fetch Nowcoder creation editor or profile
        const response = await fetch('https://www.nowcoder.com/creation/editor', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache'
        });
        const finalUrl = response.url || '';
        const html = await response.text();

        const isRedirectedToLogin = finalUrl.includes('/login') || finalUrl.includes('unlogin');
        const hasLoginBtn = html.includes('loginRegisterBtn') || html.includes('登录 / 注册');

        const nameMatch = html.match(/"userName":\s*"([^"]+)"/) ||
                          html.match(/"nickname":\s*"([^"]+)"/) ||
                          html.match(/class="[^"]*user-name[^"]*"[^>]*>([^<]+)</) ||
                          html.match(/class="[^"]*nav-avatar[^"]*"[^>]*alt="([^"]+)"/);

        const avatarMatch = html.match(/"headUrl":\s*"([^"]+)"/) ||
                            html.match(/"avatar":\s*"([^"]+)"/) ||
                            html.match(/class="[^"]*nav-avatar[^"]*"[^>]*src="([^"]+)"/);

        const detectedName = (nameMatch && nameMatch[1]) ? nameMatch[1].trim() : (cookieUsername || (uidCookie ? `牛客用户${uidCookie.value}` : ''));

        if (!isRedirectedToLogin && !hasLoginBtn && (detectedName || (tokenCookie && tokenCookie.value))) {
          return {
            loggedIn: true,
            userId: uidCookie ? uidCookie.value : '',
            username: detectedName || '牛客创作者',
            avatar: avatarMatch ? avatarMatch[1] : null
          };
        }

        // 3. Check profile page fallback
        if (tokenCookie && tokenCookie.value && tokenCookie.value.length > 5) {
          const profRes = await fetch('https://www.nowcoder.com/user/profile', {
            method: 'GET',
            credentials: 'include',
            cache: 'no-cache'
          });
          const profHtml = await profRes.text();
          if (!profHtml.includes('loginRegisterBtn') && !profRes.url.includes('login')) {
            const profNameMatch = profHtml.match(/class="[^"]*user-name[^"]*"[^>]*>([^<]+)</) ||
                                  profHtml.match(/"userName":\s*"([^"]+)"/);
            return {
              loggedIn: true,
              username: profNameMatch ? profNameMatch[1].trim() : (detectedName || '牛客创作者')
            };
          }
        }

        return { loggedIn: false };
      } catch (e) {
        console.warn('[NiceMD Check Login] Nowcoder check error:', e);
        return { loggedIn: false };
      }
    }

    if (platformId === 'aliyun') {
      try {
        const response = await fetch('https://developer.aliyun.com/article/new', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-cache'
        });
        const html = await response.text();
        const nickMatch = html.match(/"nickName":\s*"([^"]+)"/) || html.match(/"account":\s*"([^"]+)"/);
        if (nickMatch && nickMatch[1]) {
          return { loggedIn: true, username: nickMatch[1] };
        }
        const cookies = await chrome.cookies.getAll({ domain: 'aliyun.com' });
        const userCookie = cookies.find(c => c.name === 'login_aliyunid' && c.value);
        if (userCookie) {
          return { loggedIn: true, username: decodeURIComponent(userCookie.value) };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    if (platformId === 'leetcode') {
      try {
        const response = await fetch('https://leetcode.cn/graphql/', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            query: "query userStatus { userStatus { isSignedIn username userSlug avatar } }"
          })
        });
        const json = await response.json();
        if (json && json.data && json.data.userStatus && json.data.userStatus.isSignedIn) {
          const u = json.data.userStatus;
          return {
            loggedIn: true,
            userId: u.userSlug || u.username,
            username: u.username,
            avatar: u.avatar
          };
        }
      } catch (e) {}
      const cookies = await chrome.cookies.getAll({ domain: 'leetcode.cn' });
      const hasAuth = cookies.some(c => c.name.includes('LEETCODE_SESSION') || c.name.includes('csrftoken'));
      return { loggedIn: hasAuth, username: hasAuth ? '力扣创作者' : '' };
    }

    return { loggedIn: false };
  } catch (err) {
    console.log(`[NiceMD Check Login] Safe fallback triggered for ${platformId}:`, err.message);
    return { loggedIn: false, error: err.message };
  }
}

// Fallback method to open tab and let content-automation.js execute DOM injection
function fallbackToTabPublish(platform, title, markdown, html, cover, sendResponse) {
  chrome.storage.local.get(['platforms_config'], (res) => {
    const configList = res.platforms_config || DEFAULT_PLATFORMS_CONFIG;
    const targetPlatform = configList.find(p => p.id === platform);
    const url = targetPlatform ? targetPlatform.writeUrl : null;
    fallbackToTabPublishWithUrl(url, platform, title, markdown, html, cover, sendResponse);
  });
}

function fallbackToTabPublishWithUrl(url, platform, title, markdown, html, cover, sendResponse) {
  if (!url) {
    sendResponse({ success: true, localOnly: true });
    return;
  }

  // Save article details in storage keyed by platform
  chrome.storage.local.set({ 
    [`pending_publish_${platform}`]: {
      title,
      markdown,
      html,
      cover,
      timestamp: Date.now()
    }
  }, () => {
    // Open target write page
    chrome.tabs.create({ url }, (tab) => {
      const tabId = tab ? tab.id : null;
      sendResponse({ success: true, tabId: tabId, fallback: true });
    });
  });
}

