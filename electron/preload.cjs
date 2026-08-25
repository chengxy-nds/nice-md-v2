const { contextBridge, ipcRenderer } = require('electron');

// Define global cookie helper for adapters inside preload context
globalThis.__NICEMD_GET_COOKIE__ = async (url, name, domain) => {
  try {
    return await ipcRenderer.invoke('nicemd-get-cookie', { url, name, domain });
  } catch (e) {
    return null;
  }
};

const { publishAdapters } = require('./publish-adapters.cjs');

// Expose Electron API to Renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  checkLogins: (platforms) => ipcRenderer.invoke('nicemd-check-logins', platforms),
  openLoginWindow: (url, platformId) => ipcRenderer.invoke('nicemd-open-login-window', { url, platformId }),
  fetchUrl: (url) => ipcRenderer.invoke('nicemd-fetch-url', url),
  getCookie: (url, name, domain) => ipcRenderer.invoke('nicemd-get-cookie', { url, name, domain })
});

// Automatic Bridge: Bridge window.postMessage with Electron IPC & Publish Adapters
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

  // 4. PUBLISH ARTICLE (Execute Platform Adapters)
  if (message.type === 'NICEMD_PUBLISH') {
    const { platform, title, markdown, html, cover, isScheduled, scheduledTime, isOriginal } = message.payload || {};
    try {
      const adapter = publishAdapters ? (publishAdapters[platform] || publishAdapters[platform.toLowerCase()]) : null;
      if (adapter && typeof adapter.publish === 'function') {
        const result = await adapter.publish({
          title,
          markdown,
          html,
          cover,
          isScheduled,
          scheduledTime,
          isOriginal
        });

        window.postMessage({
          type: 'NICEMD_PUBLISH_RESPONSE',
          success: true,
          platform,
          postUrl: result ? (result.postUrl || result.draftUrl) : null,
          postId: result ? result.postId : null
        }, '*');
      } else {
        window.postMessage({
          type: 'NICEMD_PUBLISH_RESPONSE',
          success: false,
          platform,
          error: `未找到 ${platform} 平台的草稿发布适配器`
        }, '*');
      }
    } catch (err) {
      console.error(`[NiceMD Desktop Publish Error - ${platform}]`, err);
      window.postMessage({
        type: 'NICEMD_PUBLISH_RESPONSE',
        success: false,
        platform,
        error: err.message || '草稿同步失败'
      }, '*');
    }
    return;
  }

  // 5. FETCH URL (CORS bypass)
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
