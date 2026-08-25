/**
 * NiceMD Electron Desktop Bridge
 * Provides in-app login window, cookie sharing, webRequest header modifications, and platform checks.
 */

const { BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let openLoginWindows = new Map();

/**
 * Configure WebRequest rules to allow CORS & set required Origin/Referer headers
 */
function setupWebRequestRules() {
  const filter = {
    urls: ['*://*/*']
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const { url, requestHeaders } = details;

    try {
      const u = new URL(url);
      const host = u.hostname;

      if (host.includes('zhihu.com') || host.includes('zhimg.com')) {
        requestHeaders['Origin'] = 'https://zhuanlan.zhihu.com';
        requestHeaders['Referer'] = 'https://zhuanlan.zhihu.com/';
      } else if (host.includes('segmentfault.com')) {
        requestHeaders['Origin'] = 'https://segmentfault.com';
        requestHeaders['Referer'] = 'https://segmentfault.com/';
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
        requestHeaders['Referer'] = 'https://i.cnblogs.com/';
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
      }
    } catch (e) {}

    callback({ requestHeaders });
  });
}

/**
 * Open in-app login window
 */
function openLoginWindow(mainWindow, { url, platformId }) {
  if (!url) return;

  // If already open, focus it
  if (openLoginWindows.has(url)) {
    const win = openLoginWindows.get(url);
    if (!win.isDestroyed()) {
      win.focus();
      return;
    }
  }

  const loginWin = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 800,
    minHeight: 600,
    parent: mainWindow,
    modal: false,
    title: `登录与创作 - NiceMD`,
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

  loginWin.webContents.on('did-navigate', () => {
    notifyCheck();
  });

  loginWin.webContents.on('did-navigate-in-page', () => {
    notifyCheck();
  });

  loginWin.on('closed', () => {
    openLoginWindows.delete(url);
    notifyCheck();
  });
}

/**
 * Check login status for all platforms
 */
async function checkAllLogins(platforms) {
  const list = platforms || [
    'wechat', 'zhihu', 'juejin', 'csdn', 'cnblogs', 'baijiahao',
    'bilibili', 'eastmoney', 'oschina', 'sohu', 'yuque', '51cto',
    'douban', 'segmentfault', 'weibo', 'xueqiu', 'imooc', 'woshipm',
    'jianshu', 'toutiao', 'infoq', 'learnku', 'tencentcloud', 'nowcoder',
    'aliyun', 'leetcode'
  ];

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

async function checkSingleLogin(platformId) {
  const ses = session.defaultSession;

  if (platformId === 'zhihu') {
    const cookies = await ses.cookies.get({ domain: 'zhihu.com' });
    const zc0 = cookies.find(c => c.name === 'z_c0' || c.name === 'd_c0' || c.name === 'q_c1');
    if (!zc0 || !zc0.value) return { loggedIn: false };

    try {
      const res = await fetch('https://www.zhihu.com/api/v4/me', {
        headers: { 'x-requested-with': 'fetch' }
      });
      const data = await res.json();
      if (data && data.name) {
        return {
          loggedIn: true,
          userId: data.id || data.url_token,
          username: data.name,
          avatar: data.avatar_url
        };
      }
    } catch (e) {}

    return { loggedIn: true, username: '知乎用户' };
  }

  if (platformId === 'juejin') {
    const cookies = await ses.cookies.get({ domain: 'juejin.cn' });
    const sessionCookie = cookies.find(c => c.name === 'sessionid' || c.name === 'passport_csrf_token');
    if (!sessionCookie) return { loggedIn: false };

    try {
      const res = await fetch('https://api.juejin.cn/user_api/v1/user/get', {
        headers: { 'x-requested-with': 'fetch' }
      });
      const data = await res.json();
      if (data && data.data && data.data.user_name) {
        return {
          loggedIn: true,
          userId: data.data.user_id,
          username: data.data.user_name,
          avatar: data.data.avatar_large
        };
      }
    } catch (e) {}

    return { loggedIn: true, username: '掘金创作者' };
  }

  if (platformId === 'csdn') {
    const cookies = await ses.cookies.get({ domain: 'csdn.net' });
    const userCookie = cookies.find(c => c.name === 'UserName' || c.name === 'UserToken' || c.name === 'uuid_tt_dd');
    if (userCookie && userCookie.name === 'UserName' && userCookie.value) {
      return {
        loggedIn: true,
        userId: userCookie.value,
        username: userCookie.value
      };
    }
    try {
      const res = await fetch('https://bizapi.csdn.net/blog-console-api/v1/user/info');
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

  if (platformId === 'segmentfault') {
    const cookies = await ses.cookies.get({ domain: 'segmentfault.com' });
    const hasSess = cookies.some(c => c.name === 'PHPSESSID' || c.name === 'token' || c.name === 'SHARESESSID');
    if (!hasSess) return { loggedIn: false };

    try {
      const res = await fetch('https://segmentfault.com/user/settings');
      const html = await res.text();
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
    } catch (e) {}
    return { loggedIn: hasSess, username: '思否创作者' };
  }

  if (platformId === 'toutiao') {
    const [mpCookies, wwwCookies, rootCookies] = await Promise.all([
      ses.cookies.get({ url: 'https://mp.toutiao.com/' }),
      ses.cookies.get({ url: 'https://www.toutiao.com/' }),
      ses.cookies.get({ domain: 'toutiao.com' })
    ]);
    const cookieMap = new Map();
    [...mpCookies, ...wwwCookies, ...rootCookies].forEach(c => {
      if (c && c.name && c.value) cookieMap.set(c.name, c.value);
    });

    const hasSession = !!(
      cookieMap.get('sessionid_ss') || cookieMap.get('sessionid') ||
      cookieMap.get('sid_tt') || cookieMap.get('passport_auth_status') === '1'
    );

    if (!hasSession) return { loggedIn: false };

    try {
      const resAuthor = await fetch('https://mp.toutiao.com/mp/agw/creator/home/author_info', {
        headers: { 'Referer': 'https://mp.toutiao.com/profile_v4/index' }
      });
      const jsonAuthor = await resAuthor.json();
      if (jsonAuthor && (jsonAuthor.code === 0 || jsonAuthor.message === 'success') && jsonAuthor.data) {
        const d = jsonAuthor.data;
        return {
          loggedIn: true,
          userId: String(d.user_id || d.author_id || ''),
          username: d.author_name || d.user_name || '今日头条创作者',
          avatar: d.avatar_url || null
        };
      }
    } catch (e) {}

    return { loggedIn: true, username: '今日头条创作者' };
  }

  if (platformId === 'bilibili') {
    const cookies = await ses.cookies.get({ domain: 'bilibili.com' });
    const sessdata = cookies.find(c => c.name === 'SESSDATA');
    if (!sessdata) return { loggedIn: false };

    try {
      const res = await fetch('https://api.bilibili.com/x/web-interface/nav');
      const data = await res.json();
      if (data && data.data && data.data.isLogin) {
        return {
          loggedIn: true,
          userId: String(data.data.mid),
          username: data.data.uname,
          avatar: data.data.face
        };
      }
    } catch (e) {}

    return { loggedIn: true, username: 'B站UP主' };
  }

  if (platformId === 'wechat') {
    const cookies = await ses.cookies.get({ domain: 'mp.weixin.qq.com' });
    const hasTicket = cookies.some(c => c.name === 'data_ticket' || c.name === 'slave_sid' || c.name === 'bizuin');
    return { loggedIn: hasTicket, username: hasTicket ? '微信公众号' : '' };
  }

  if (platformId === 'cnblogs') {
    const cookies = await ses.cookies.get({ domain: 'cnblogs.com' });
    const hasCnblogs = cookies.some(c => c.name.includes('.Cnblogs.AspNetCore.Cookies') || c.name === '.CNBlogsCookie');
    if (!hasCnblogs) return { loggedIn: false };

    try {
      const res = await fetch('https://home.cnblogs.com/user/CurrentUserInfo');
      const html = await res.text();
      const uidMatch = html.match(/href="\/u\/([^\/]+)\/"/);
      if (uidMatch) {
        return { loggedIn: true, userId: uidMatch[1], username: uidMatch[1] };
      }
    } catch (e) {}
    return { loggedIn: true, username: '博客园博主' };
  }

  if (platformId === 'weibo') {
    const cookies = await ses.cookies.get({ domain: 'weibo.com' });
    const hasSub = cookies.some(c => c.name === 'SUB' || c.name === 'SUBP');
    if (!hasSub) return { loggedIn: false };

    try {
      const res = await fetch('https://card.weibo.com/article/v5/editor');
      const html = await res.text();
      const configMatch = html.match(/config:\s*JSON\.parse\('(.+?)'\)/);
      if (configMatch) {
        const config = JSON.parse(configMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\"));
        if (config && config.uid) {
          return {
            loggedIn: true,
            userId: String(config.uid),
            username: config.nick,
            avatar: config.avatar_large
          };
        }
      }
    } catch (e) {}
    return { loggedIn: true, username: '微博用户' };
  }

  // Generic cookie check for remaining platforms
  const domainMap = {
    baijiahao: 'baidu.com',
    eastmoney: 'eastmoney.com',
    oschina: 'oschina.net',
    sohu: 'sohu.com',
    yuque: 'yuque.com',
    '51cto': '51cto.com',
    douban: 'douban.com',
    xueqiu: 'xueqiu.com',
    imooc: 'imooc.com',
    woshipm: 'woshipm.com',
    jianshu: 'jianshu.com',
    infoq: 'infoq.cn',
    learnku: 'learnku.com',
    tencentcloud: 'cloud.tencent.com',
    nowcoder: 'nowcoder.com',
    aliyun: 'aliyun.com',
    leetcode: 'leetcode.cn'
  };

  const domain = domainMap[platformId];
  if (domain) {
    const cookies = await ses.cookies.get({ domain });
    const hasCookies = cookies && cookies.length > 0;
    return { loggedIn: hasCookies };
  }

  return { loggedIn: false };
}

module.exports = {
  setupWebRequestRules,
  openLoginWindow,
  checkAllLogins,
  checkSingleLogin
};
