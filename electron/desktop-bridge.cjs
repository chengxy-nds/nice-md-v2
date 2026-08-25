/**
 * NiceMD Electron Desktop Bridge
 * Provides in-app login window, cookie sharing, webRequest header modifications, and platform checks.
 */

const { BrowserWindow, session, ipcMain, shell, net } = require('electron');
const path = require('path');

let openLoginWindows = new Map();

/**
 * Configure WebRequest rules to allow CORS & set required Origin/Referer headers
 */
function setupWebRequestRules() {
  const filter = {
    urls: ['*://*/*']
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, async (details, callback) => {
    const { url, requestHeaders } = details;

    try {
      const u = new URL(url);
      const host = u.hostname;

      if (host.includes('zhihu.com') || host.includes('zhimg.com')) {
        requestHeaders['Origin'] = 'https://zhuanlan.zhihu.com';
        requestHeaders['Referer'] = 'https://zhuanlan.zhihu.com/';
      } else if (host.includes('segmentfault.com')) {
        requestHeaders['Origin'] = 'https://segmentfault.com';
        requestHeaders['Referer'] = 'https://segmentfault.com/write';
      } else if (host.includes('toutiao.com') || host.includes('snssdk.com')) {
        requestHeaders['Referer'] = 'https://mp.toutiao.com/';
      } else if (host.includes('csdn.net')) {
        requestHeaders['Origin'] = 'https://mp.csdn.net';
        requestHeaders['Referer'] = 'https://mp.csdn.net/';
      } else if (host.includes('juejin.cn')) {
        requestHeaders['Origin'] = 'https://juejin.cn';
        requestHeaders['Referer'] = 'https://juejin.cn/';
      } else if (host.includes('weibo.com')) {
        requestHeaders['Referer'] = 'https://card.weibo.com/';
      } else if (host.includes('bilibili.com')) {
        requestHeaders['Origin'] = 'https://member.bilibili.com';
        requestHeaders['Referer'] = 'https://member.bilibili.com/';
      } else if (host.includes('cnblogs.com')) {
        requestHeaders['Origin'] = 'https://i.cnblogs.com';
        requestHeaders['Referer'] = 'https://i.cnblogs.com/posts/edit';
      } else if (host.includes('51cto.com')) {
        requestHeaders['Referer'] = 'https://blog.51cto.com/';
      } else if (host.includes('douban.com')) {
        requestHeaders['Referer'] = 'https://www.douban.com/';
      } else if (host.includes('xueqiu.com')) {
        requestHeaders['Referer'] = 'https://mp.xueqiu.com/';
      } else if (host.includes('eastmoney.com')) {
        requestHeaders['Referer'] = 'https://mp.eastmoney.com/';
      } else if (host.includes('sohu.com')) {
        requestHeaders['Referer'] = 'https://mp.sohu.com/';
      } else if (host.includes('oschina.net')) {
        requestHeaders['Referer'] = 'https://my.oschina.net/';
      } else if (host.includes('baijiahao.baidu.com')) {
        requestHeaders['Referer'] = 'https://baijiahao.baidu.com/';
      } else if (host.includes('cloud.tencent.com')) {
        requestHeaders['Origin'] = 'https://cloud.tencent.com';
        requestHeaders['Referer'] = 'https://cloud.tencent.com/developer/article/write';
      } else if (host.includes('developer.aliyun.com')) {
        requestHeaders['Referer'] = 'https://developer.aliyun.com/article/new';
      }

      // Auto-inject session cookies for cross-origin API calls from renderer
      if (host !== 'localhost' && !host.startsWith('127.')) {
        try {
          const cookies = await session.defaultSession.cookies.get({ url });
          if (cookies && cookies.length > 0) {
            const existing = requestHeaders['Cookie'] || requestHeaders['cookie'] || '';
            const existingNames = new Set(existing.split(';').map(s => s.split('=')[0].trim()));
            
            let toAddList = [];
            cookies.forEach(c => {
              if (!existingNames.has(c.name)) {
                existingNames.add(c.name);
                toAddList.push(`${c.name}=${c.value}`);
              }
            });

            if (toAddList.length > 0) {
              const addedStr = toAddList.join('; ');
              requestHeaders['Cookie'] = existing ? `${existing}; ${addedStr}` : addedStr;
            }
          }
        } catch (e) {}
      }
    } catch (e) {}

    callback({ requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = details.responseHeaders || {};
    
    // 1. CORS headers
    responseHeaders['access-control-allow-origin'] = ['*'];
    responseHeaders['access-control-allow-credentials'] = ['true'];
    responseHeaders['access-control-allow-headers'] = ['*'];
    responseHeaders['access-control-allow-methods'] = ['GET, POST, PUT, DELETE, OPTIONS, PATCH'];

    // 2. Normalize and save Set-Cookie headers from third-party APIs
    const setCookieHeaders = responseHeaders['set-cookie'] || responseHeaders['Set-Cookie'];
    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
      responseHeaders['set-cookie'] = setCookieHeaders.map(cookieStr => {
        let modified = cookieStr;
        if (/SameSite=Lax/i.test(modified)) {
          modified = modified.replace(/SameSite=Lax/gi, 'SameSite=None; Secure');
        } else if (/SameSite=Strict/i.test(modified)) {
          modified = modified.replace(/SameSite=Strict/gi, 'SameSite=None; Secure');
        } else if (!/SameSite=/i.test(modified)) {
          modified = `${modified}; SameSite=None; Secure`;
        }
        return modified;
      });

      // Directly persist into Electron Session Cookie Store
      setCookieHeaders.forEach(cookieStr => {
        try {
          const parts = cookieStr.split(';');
          const [name, ...valParts] = parts[0].split('=');
          const value = valParts.join('=');
          if (name && value) {
            const cookieData = {
              url: details.url,
              name: name.trim(),
              value: value.trim(),
              path: '/'
            };
            const domainPart = parts.find(p => p.trim().toLowerCase().startsWith('domain='));
            if (domainPart) {
              cookieData.domain = domainPart.split('=')[1].trim();
            }
            cookieData.secure = details.url.startsWith('https://');
            cookieData.sameSite = 'no_restriction';
            session.defaultSession.cookies.set(cookieData).catch(() => {});
          }
        } catch (e) {}
      });
    }

    callback({ responseHeaders });
  });
}

/**
 * Fetch using Electron Chromium network stack with session cookies
 */
async function doFetch(url, options = {}) {
  try {
    return await net.fetch(url, {
      ...options,
      credentials: 'include'
    });
  } catch (err) {
    return await fetch(url, options);
  }
}

/**
 * Cookie reader helper from session.defaultSession
 */
async function getCookieValue(domain, name) {
  try {
    const cookies = await session.defaultSession.cookies.get({ domain, name });
    return cookies && cookies.length > 0 ? cookies[0].value : null;
  } catch (e) {
    return null;
  }
}

/**
 * Helper to generate HMAC-SHA256 Base64 signature for CSDN
 */
async function hmacSHA256Base64(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Buffer.from(signature).toString('base64');
}

const PLATFORM_NAMES = {
  zhihu: '知乎',
  juejin: '稀土掘金',
  csdn: 'CSDN',
  toutiao: '今日头条',
  wechat: '微信公众号',
  segmentfault: '思否',
  bilibili: '哔哩哔哩',
  cnblogs: '博客园',
  weibo: '微博',
  baijiahao: '百家号',
  oschina: '开源中国',
  douban: '豆瓣',
  '51cto': '51CTO',
  xueqiu: '雪球',
  jianshu: '简书',
  yuque: '语雀',
  sohu: '搜狐号',
  eastmoney: '东方财富',
  imooc: '慕课手记',
  woshipm: '人人都是产品经理',
  infoq: 'InfoQ',
  learnku: 'LearnKu',
  tencentcloud: '腾讯云开发者社区',
  nowcoder: '牛客网',
  aliyun: '阿里云开发者社区',
  leetcode: '力扣'
};

function inferPlatformId(url, platformId) {
  if (platformId && PLATFORM_NAMES[platformId]) return platformId;
  const lower = (url || '').toLowerCase();
  for (const key of Object.keys(PLATFORM_NAMES)) {
    if (lower.includes(key)) return key;
  }
  if (lower.includes('weixin.qq.com') || lower.includes('mp.weixin')) return 'wechat';
  if (lower.includes('baidu.com')) return 'baijiahao';
  return 'unknown';
}

/**
 * Open in-app login window with top helper bar & auto-detection
 */
function openLoginWindow(mainWindow, { url, platformId }) {
  if (!url) return;

  const targetPlatformId = inferPlatformId(url, platformId);
  const platformName = PLATFORM_NAMES[targetPlatformId] || '平台';

  // If already open, focus it
  if (openLoginWindows.has(url)) {
    const existing = openLoginWindows.get(url);
    if (existing && !existing.isDestroyed()) {
      existing.focus();
      return;
    }
  }

  const loginWin = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 800,
    minHeight: 600,
    modal: false,
    title: `登录 - ${platformName} (NiceMD 独立登录助手)`,
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      session: session.defaultSession
    }
  });

  openLoginWindows.set(url, loginWin);

  loginWin.loadURL(url, {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const notifyCheck = async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const statuses = await checkAllLogins();
      mainWindow.webContents.send('nicemd-logins-updated', statuses);
    }
  };

  const safelyCloseWindow = async () => {
    if (loginWin.isDestroyed()) return;
    try {
      await loginWin.webContents.executeJavaScript(`
        window.onbeforeunload = null;
        window.onunload = null;
      `).catch(() => {});
    } catch (e) {}

    await notifyCheck();
    setTimeout(() => {
      if (!loginWin.isDestroyed()) {
        loginWin.destroy();
      }
    }, 100);
  };

  // Listen to in-page button clicks via console-message bridge
  loginWin.webContents.on('console-message', (event, level, message) => {
    if (typeof message === 'string' && message.includes('__NICEMD_FORCE_CLOSE__')) {
      safelyCloseWindow();
    }
  });

  // Inject helper top bar
  const injectHelperBar = () => {
    if (loginWin.isDestroyed()) return;
    const script = `
      (function() {
        if (document.getElementById('nicemd-login-helper-bar')) return;
        const bar = document.createElement('div');
        bar.id = 'nicemd-login-helper-bar';
        bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:linear-gradient(135deg, #1e293b, #0f172a);color:#ffffff;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 16px rgba(0,0,0,0.3);font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.1);user-select:none;';
        
        bar.innerHTML = \`
          <div style="display:flex;align-items:center;gap:8px;font-weight:500;">
            <span style="font-size:15px;">🚀</span>
            <span>NiceMD 登录助手 - 请完成 <b>\${${JSON.stringify(platformName)}}</b> 账号登录</span>
            <span id="nicemd-login-status-hint" style="color:#94a3b8;font-size:12px;margin-left:4px;">(支持扫码 / 账号密码)</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <button id="nicemd-login-complete-btn" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 16px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(37,99,235,0.4);">
              ✅ 我已完成登录 (保存并关闭)
            </button>
            <button id="nicemd-login-close-btn" style="background:rgba(255,255,255,0.12);color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;">
              关闭窗口
            </button>
          </div>
        \`;
        document.body.appendChild(bar);
        document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0) + 42) + 'px';

        document.getElementById('nicemd-login-complete-btn').onclick = function() {
          window.onbeforeunload = null;
          console.log('__NICEMD_FORCE_CLOSE__');
        };
        document.getElementById('nicemd-login-close-btn').onclick = function() {
          window.onbeforeunload = null;
          console.log('__NICEMD_FORCE_CLOSE__');
        };
      })();
    `;
    loginWin.webContents.executeJavaScript(script).catch(() => {});
  };

  loginWin.webContents.on('did-finish-load', injectHelperBar);
  loginWin.webContents.on('did-navigate', injectHelperBar);
  loginWin.webContents.on('did-navigate-in-page', injectHelperBar);

  // Background polling to detect login and auto-close ONLY after real login is verified
  let hasAutoClosed = false;
  const pollTimer = setInterval(async () => {
    if (loginWin.isDestroyed()) {
      clearInterval(pollTimer);
      return;
    }
    if (targetPlatformId && targetPlatformId !== 'unknown') {
      const res = await checkSingleLogin(targetPlatformId);
      if (res && res.loggedIn === true) {
        if (!hasAutoClosed) {
          hasAutoClosed = true;
          const detectedUser = res.username || res.userId || '创作者';
          loginWin.webContents.executeJavaScript(`
            (function() {
              window.onbeforeunload = null;
              const hint = document.getElementById('nicemd-login-status-hint');
              const btn = document.getElementById('nicemd-login-complete-btn');
              if (hint) hint.innerHTML = '<b style="color:#4ade80;">🎉 登录成功（${detectedUser}）！3秒后自动关闭...</b>';
              if (btn) { btn.style.background = '#16a34a'; btn.innerText = '🎉 登录成功 (立即关闭)'; }
            })();
          `).catch(() => {});

          await notifyCheck();
          setTimeout(() => {
            safelyCloseWindow();
          }, 3000);
          clearInterval(pollTimer);
        }
      }
    }
  }, 1500);

  loginWin.on('closed', () => {
    clearInterval(pollTimer);
    openLoginWindows.delete(url);
    notifyCheck();
  });
}

/**
 * Check login status for all platforms
 */
async function checkAllLogins(platforms) {
  const list = platforms || Object.keys(PLATFORM_NAMES);

  const results = {};
  await Promise.all(
    list.map(async (pId) => {
      const id = typeof pId === 'string' ? pId : pId.id;
      try {
        results[id] = await checkSingleLogin(id);
      } catch (err) {
        results[id] = { loggedIn: false, error: err.message };
      }
    })
  );

  return results;
}

/**
 * Check single platform login with strict user verification
 */
async function checkSingleLogin(platformId) {
  try {
    if (platformId === 'zip-download') {
      return { loggedIn: true, username: '本地下载', avatar: null };
    }

    // 1. CSDN (csdn)
    if (platformId === 'csdn') {
      try {
        const nonce = crypto.randomUUID();
        const key = '203803574';
        const secret = '9znpamsyl2c7cdrr9sas0le9vbc3r6ba';
        const path = '/blog-console-api/v3/editor/getBaseInfo';
        const stringToSign = `GET\n*/*\n\n\n\nx-ca-key:${key}\nx-ca-nonce:${nonce}\n${path}`;
        const signature = await hmacSHA256Base64(secret, stringToSign);

        const response = await doFetch('https://bizapi.csdn.net/blog-console-api/v3/editor/getBaseInfo', {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'x-ca-key': key,
            'x-ca-nonce': nonce,
            'x-ca-signature': signature,
            'x-ca-signature-headers': 'x-ca-key,x-ca-nonce'
          }
        });
        const json = await response.json();
        if (json && json.code === 200 && json.data && json.data.name) {
          return {
            loggedIn: true,
            userId: json.data.name,
            username: json.data.nickname || json.data.name,
            avatar: json.data.avatar
          };
        }
      } catch (e) {}

      // Fallback to user/info
      try {
        const res = await doFetch('https://bizapi.csdn.net/blog-console-api/v1/user/info', {
          headers: { 'Referer': 'https://mp.csdn.net/' }
        });
        const data = await res.json();
        if (data && data.data && data.data.username) {
          return {
            loggedIn: true,
            userId: data.data.username,
            username: data.data.nickname || data.data.username,
            avatar: data.data.avatar
          };
        }
      } catch (e) {}

      return { loggedIn: false };
    }

    // 2. 东方财富 (eastmoney)
    if (platformId === 'eastmoney') {
      const ct = await getCookieValue('mp.eastmoney.com', 'ct');
      const ut = await getCookieValue('mp.eastmoney.com', 'ut');
      if (!ct || !ut) return { loggedIn: false };

      const response = await doFetch(`https://caifuhaoapi.eastmoney.com/api/v2/getauthorinfo?platform=&ctoken=${encodeURIComponent(ct)}&utoken=${encodeURIComponent(ut)}`);
      const json = await response.json();
      if (json && json.Success === 1 && json.Result && json.Result.accountId) {
        return {
          loggedIn: true,
          userId: json.Result.accountId,
          username: json.Result.accountName,
          avatar: json.Result.portrait
        };
      }
      return { loggedIn: false };
    }

    // 3. 语雀 (yuque)
    if (platformId === 'yuque') {
      const ctoken = await getCookieValue('yuque.com', 'yuque_ctoken');
      if (!ctoken) return { loggedIn: false };

      const response = await doFetch('https://www.yuque.com/api/mine/common_used', {
        headers: { 'x-csrf-token': ctoken }
      });
      const json = await response.json();
      if (json && json.data && Array.isArray(json.data.books) && json.data.books.length > 0) {
        const book = json.data.books[0];
        if (book && book.user) {
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

    // 4. 百家号 (baijiahao)
    if (platformId === 'baijiahao') {
      const response = await doFetch(`https://baijiahao.baidu.com/builder/app/appinfo?_=${Date.now()}`);
      const json = await response.json();
      if (json && json.errmsg === 'success' && json.data && json.data.user) {
        return {
          loggedIn: true,
          userId: json.data.user.userid,
          username: json.data.user.name,
          avatar: json.data.user.avatar
        };
      }
      return { loggedIn: false };
    }

    // 5. 哔哩哔哩 (bilibili)
    if (platformId === 'bilibili') {
      const response = await doFetch('https://api.bilibili.com/x/web-interface/nav?build=0&mobi_app=web');
      const json = await response.json();
      if (json && json.code === 0 && json.data && json.data.isLogin === true) {
        return {
          loggedIn: true,
          userId: String(json.data.mid),
          username: json.data.uname,
          avatar: json.data.face
        };
      }
      return { loggedIn: false };
    }

    // 6. 开源中国 (oschina)
    if (platformId === 'oschina') {
      const response = await doFetch('https://apiv1.oschina.net/oschinapi/user/myDetails');
      const json = await response.json();
      if (json && json.success === true && json.result && json.result.userId) {
        return {
          loggedIn: true,
          userId: String(json.result.userId),
          username: json.result.userVo ? json.result.userVo.name : String(json.result.userId),
          avatar: json.result.userVo ? json.result.userVo.portraitUrl : null
        };
      }
      return { loggedIn: false };
    }

    // 7. 搜狐号 (sohu)
    if (platformId === 'sohu') {
      const response = await doFetch(`https://mp.sohu.com/mpbp/bp/account/list?_=${Date.now()}`);
      const json = await response.json();
      if (json && json.code === 2000000 && json.data && Array.isArray(json.data.data)) {
        let accounts = [];
        for (const group of json.data.data) {
          if (group && Array.isArray(group.accounts)) {
            accounts.push(...group.accounts);
          }
        }
        if (accounts.length > 0) {
          const mainAcc = accounts[0];
          return {
            loggedIn: true,
            userId: String(mainAcc.id),
            username: mainAcc.nickName + (accounts.length > 1 ? ` (共${accounts.length}个子账号)` : ''),
            avatar: mainAcc.avatar
          };
        }
      }
      return { loggedIn: false };
    }

    // 8. 知乎 (zhihu)
    if (platformId === 'zhihu') {
      const response = await doFetch('https://www.zhihu.com/api/v4/me', {
        headers: { 'x-requested-with': 'fetch' }
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

    // 9. 稀土掘金 (juejin)
    if (platformId === 'juejin') {
      const response = await doFetch('https://api.juejin.cn/user_api/v1/user/get');
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

    // 10. 慕课网 (imooc)
    if (platformId === 'imooc') {
      const response = await doFetch('https://www.imooc.com/u/card');
      const text = await response.text();
      const match = text.match(/^[^(]*\(([\s\S]+)\)[^)]*$/);
      if (match) {
        const json = JSON.parse(match[1]);
        if (json && json.result === 0 && json.data) {
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

    // 11. 人人都是产品经理 (woshipm)
    if (platformId === 'woshipm') {
      const response1 = await doFetch('https://www.woshipm.com/writing');
      const html1 = await response1.text();
      const uidMatch = html1.match(/var\s+userSettings\s*=\s*\{[^}]*"uid"\s*:\s*"(\d+)"/);
      if (!uidMatch) return { loggedIn: false };

      const uid = uidMatch[1];
      const response2 = await doFetch(`https://www.woshipm.com/api2/user/profile?uid=${uid}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
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

    // 12. 微信公众号 (wechat / weixin)
    if (platformId === 'wechat' || platformId === 'weixin') {
      const response = await doFetch('https://mp.weixin.qq.com/', {
        redirect: 'follow',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const finalUrl = response.url || '';
      const html = await response.text();
      const tokenMatch = html.match(/data:\s*\{[\s\S]*?t:\s*["']([^"']+)["']/) || finalUrl.match(/token=(\d+)/);
      const isHome = finalUrl.includes('cgi-bin/home') || finalUrl.includes('token=') || !!tokenMatch;

      if (isHome) {
        const nickMatch = html.match(/nick_name:\s*["']([^"']+)["']/);
        const usernameMatch = html.match(/user_name:\s*["']([^"']+)["']/);
        const headImgMatch = html.match(/head_img:\s*['"]([^'"]+)['']/);
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

    // 13. 博客园 (cnblogs)
    if (platformId === 'cnblogs') {
      const response = await doFetch('https://home.cnblogs.com/user/CurrentUserInfo');
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

    // 14. 51CTO (51cto)
    if (platformId === '51cto') {
      const response = await doFetch('https://blog.51cto.com/blogger/publish');
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

    // 15. 豆瓣 (douban)
    if (platformId === 'douban') {
      const response = await doFetch('https://www.douban.com/note/create');
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

    // 16. 思否 (segmentfault)
    if (platformId === 'segmentfault') {
      const response = await doFetch('https://segmentfault.com/user/settings');
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

    // 17. 微博 (weibo)
    if (platformId === 'weibo') {
      const response = await doFetch('https://card.weibo.com/article/v5/editor');
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

    // 18. 雪球 (xueqiu)
    if (platformId === 'xueqiu') {
      const response = await doFetch('https://mp.xueqiu.com/writeV2');
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

    // 19. 今日头条 (toutiao)
    if (platformId === 'toutiao') {
      try {
        const resAuthor = await doFetch('https://mp.toutiao.com/mp/agw/creator/home/author_info', {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://mp.toutiao.com/profile_v4/index'
          }
        });
        const jsonAuthor = await resAuthor.json();
        if (jsonAuthor && (jsonAuthor.code === 0 || jsonAuthor.message === 'success') && jsonAuthor.data) {
          const d = jsonAuthor.data;
          return {
            loggedIn: true,
            userId: d.user_id ? String(d.user_id) : String(d.author_id || ''),
            username: d.author_name || d.user_name || d.name || '今日头条创作者',
            avatar: d.avatar_url || d.avatar || null
          };
        }
      } catch (e) {}

      try {
        const resMain = await doFetch('https://www.toutiao.com/api/pc/user/info', {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Referer': 'https://www.toutiao.com/'
          }
        });
        const jsonMain = await resMain.json();
        if (jsonMain && (jsonMain.code === 0 || jsonMain.message === 'success') && jsonMain.data) {
          const d = jsonMain.data;
          if (d.user_id || d.name || d.screen_name) {
            return {
              loggedIn: true,
              userId: String(d.user_id || ''),
              username: d.name || d.screen_name || '今日头条创作者',
              avatar: d.avatar_url || null
            };
          }
        }
      } catch (e) {}

      return { loggedIn: false };
    }

    // 20. InfoQ (infoq)
    if (platformId === 'infoq') {
      try {
        const response = await doFetch('https://xie.infoq.cn/article/draft/new');
        const html = await response.text();
        const userMatch = html.match(/"nickname":\s*"([^"]+)"/) || 
                          html.match(/"userName":\s*"([^"]+)"/) ||
                          html.match(/"nickName":\s*"([^"]+)"/);
        if (userMatch && userMatch[1] && userMatch[1] !== 'null') {
          return { loggedIn: true, username: userMatch[1] };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    // 21. LearnKu (learnku)
    if (platformId === 'learnku') {
      try {
        const response = await doFetch('https://learnku.com/');
        const html = await response.text();
        const navItemMatch = html.match(/class="[^"]*nav-user-item[^"]*"[^>]*>([\s\S]*?)<div class="ui menu/);
        if (navItemMatch) {
          const navContent = navItemMatch[1];
          const avatarMatch = navContent.match(/src="([^"]+)"/);
          const nameMatch = navContent.match(/<img[^>]*>[\s\S]*?(?:&nbsp;)?\s*([^<\s][^<]*?)\s*<i class="[^"]*dropdown icon/);
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
      } catch (e) {}
      return { loggedIn: false };
    }

    // 22. 腾讯云 (tencentcloud)
    if (platformId === 'tencentcloud' || platformId === 'tencent-cloud') {
      try {
        const response = await doFetch('https://cloud.tencent.com/developer/article/write');
        const html = await response.text();
        const nickMatch = html.match(/"nickName":\s*"([^"]+)"/) || html.match(/"username":\s*"([^"]+)"/);
        if (nickMatch && nickMatch[1]) {
          return { loggedIn: true, username: nickMatch[1] };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    // 23. 牛客网 (nowcoder)
    if (platformId === 'nowcoder') {
      try {
        const response = await doFetch('https://www.nowcoder.com/creation/editor');
        const finalUrl = response.url || '';
        const html = await response.text();

        const isRedirectedToLogin = finalUrl.includes('/login') || finalUrl.includes('unlogin');
        const hasLoginBtn = html.includes('loginRegisterBtn') || html.includes('登录 / 注册');

        const nameMatch = html.match(/"userName":\s*"([^"]+)"/) ||
                          html.match(/"nickname":\s*"([^"]+)"/) ||
                          html.match(/class="[^"]*user-name[^"]*"[^>]*>([^<]+)</);

        const avatarMatch = html.match(/"headUrl":\s*"([^"]+)"/) ||
                            html.match(/"avatar":\s*"([^"]+)"/);

        if (!isRedirectedToLogin && !hasLoginBtn && nameMatch && nameMatch[1]) {
          return {
            loggedIn: true,
            username: nameMatch[1].trim(),
            avatar: avatarMatch ? avatarMatch[1] : null
          };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    // 24. 阿里云 (aliyun)
    if (platformId === 'aliyun') {
      try {
        const response = await doFetch('https://developer.aliyun.com/article/new');
        const html = await response.text();
        const nickMatch = html.match(/"nickName":\s*"([^"]+)"/) || html.match(/"account":\s*"([^"]+)"/);
        if (nickMatch && nickMatch[1]) {
          return { loggedIn: true, username: nickMatch[1] };
        }
      } catch (e) {}
      return { loggedIn: false };
    }

    // 25. 力扣 (leetcode)
    if (platformId === 'leetcode') {
      try {
        const response = await doFetch('https://leetcode.cn/graphql/', {
          method: 'POST',
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
      return { loggedIn: false };
    }

    return { loggedIn: false };
  } catch (err) {
    console.warn(`[NiceMD Check Login] Safe check failed for ${platformId}:`, err.message);
    return { loggedIn: false, error: err.message };
  }
}

module.exports = {
  setupWebRequestRules,
  openLoginWindow,
  checkAllLogins,
  checkSingleLogin
};
