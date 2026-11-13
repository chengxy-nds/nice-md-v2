const { app, BrowserWindow, shell, ipcMain, session, safeStorage } = require('electron');
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
    title: 'EasyMD',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Open external links (e.g. user profile, published draft view, help links) in user's default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
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

  ipcMain.handle('nicemd-get-cookie', async (event, { url, name, domain }) => {
    try {
      if (url) {
        const urlFilter = { url };
        if (name) urlFilter.name = name;
        const cookies = await session.defaultSession.cookies.get(urlFilter);
        if (cookies && cookies.length > 0) {
          return cookies[0].value;
        }
      }

      const filter = {};
      if (domain) filter.domain = domain;
      if (name) filter.name = name;
      if (domain || name) {
        const cookies = await session.defaultSession.cookies.get(filter);
        if (cookies && cookies.length > 0) {
          return cookies[0].value;
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  });

  // Item 4: OS-level credential encryption via safeStorage (DPAPI on
  // Windows, Keychain on macOS, libsecret on Linux). The renderer never
  // sees the OS key — only base64 ciphertext crosses the IPC bridge.
  ipcMain.handle('nicemd-secure-storage-available', () => {
    try {
      return safeStorage.isEncryptionAvailable();
    } catch {
      return false;
    }
  });

  ipcMain.handle('nicemd-secure-encrypt', async (event, plaintext) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return { success: false, error: 'OS secure storage unavailable' };
      }
      const buf = safeStorage.encryptString(String(plaintext ?? ''));
      return { success: true, data: buf.toString('base64') };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('nicemd-secure-decrypt', async (event, data) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        return { success: false, error: 'OS secure storage unavailable' };
      }
      const plain = safeStorage.decryptString(Buffer.from(String(data || ''), 'base64'));
      return { success: true, data: plain };
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
