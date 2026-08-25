const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { setupWebRequestRules, openLoginWindow, checkAllLogins } = require('./desktop-bridge.cjs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 960,
    minHeight: 600,
    title: 'NiceMD',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Intercept external links: if it's a known creator/login site, open in in-app window, else external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      const isKnownPlatform = [
        'zhihu.com', 'juejin.cn', 'csdn.net', 'cnblogs.com', 'toutiao.com',
        'segmentfault.com', 'weibo.com', 'bilibili.com', 'baidu.com',
        'oschina.net', 'douban.com', '51cto.com', 'xueqiu.com', 'imooc.com',
        'woshipm.com', 'jianshu.com', 'eastmoney.com', 'sohu.com', 'yuque.com',
        'infoq.cn', 'learnku.com', 'cloud.tencent.com', 'nowcoder.com',
        'aliyun.com', 'leetcode.cn', 'qq.com'
      ].some(domain => url.includes(domain));

      if (isKnownPlatform) {
        openLoginWindow(mainWindow, { url });
        return { action: 'deny' };
      }

      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  setupWebRequestRules();

  // IPC Handlers
  ipcMain.handle('nicemd-check-logins', async (event, platforms) => {
    return await checkAllLogins(platforms);
  });

  ipcMain.handle('nicemd-open-login-window', async (event, { url, platformId }) => {
    openLoginWindow(mainWindow, { url, platformId });
    return { success: true };
  });

  ipcMain.handle('nicemd-fetch-url', async (event, url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      return { success: true, html, finalUrl: res.url };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
