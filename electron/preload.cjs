const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron API to Renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  checkLogins: (platforms) => ipcRenderer.invoke('nicemd-check-logins', platforms),
  openLoginWindow: (url, platformId) => ipcRenderer.invoke('nicemd-open-login-window', { url, platformId }),
  fetchUrl: (url) => ipcRenderer.invoke('nicemd-fetch-url', url)
});

// Automatic Bridge: Bridge window.postMessage with Electron IPC
window.addEventListener('message', async (event) => {
  const message = event.data;
  if (!message || typeof message !== 'object') return;

  // 1. PING -> PONG
  if (message.type === 'NICEMD_PING') {
    window.postMessage({ type: 'NICEMD_PONG', version: '2.0.0 (NiceMD Desktop)' }, '*');
    return;
  }

  // 2. CHECK LOGINS
  if (message.type === 'NICEMD_CHECK_LOGINS') {
    try {
      const statuses = await ipcRenderer.invoke('nicemd-check-logins', message.platforms);
      window.postMessage({ type: 'NICEMD_CHECK_LOGINS_RESPONSE', success: true, statuses }, '*');
    } catch (err) {
      window.postMessage({ type: 'NICEMD_CHECK_LOGINS_RESPONSE', success: false, error: err.message }, '*');
    }
    return;
  }

  // 3. OPEN TAB / LOGIN WINDOW
  if (message.type === 'NICEMD_OPEN_TAB') {
    ipcRenderer.invoke('nicemd-open-login-window', { url: message.url });
    return;
  }

  // 4. FETCH URL (CORS bypass)
  if (message.type === 'NICEMD_FETCH_URL') {
    try {
      const res = await ipcRenderer.invoke('nicemd-fetch-url', message.url);
      window.postMessage({ type: 'NICEMD_FETCH_URL_RESPONSE', ...res }, '*');
    } catch (err) {
      window.postMessage({ type: 'NICEMD_FETCH_URL_RESPONSE', success: false, error: err.message }, '*');
    }
    return;
  }
});

// Listen to backend push updates from login window events
ipcRenderer.on('nicemd-logins-updated', (event, statuses) => {
  window.postMessage({ type: 'NICEMD_CHECK_LOGINS_RESPONSE', success: true, statuses }, '*');
});
