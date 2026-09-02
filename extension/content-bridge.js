/**
 * Content Bridge Script
 * Injected into the NiceMD editor page (localhost) to forward window messages to the extension's background script.
 */

console.log('NiceMD Bridge Active 🚀');

/**
 * Safely send a message to the background script.
 * Handles the "Extension context invalidated" error gracefully.
 */
function safeSendMessage(message, callback) {
  try {
    if (!chrome.runtime || !chrome.runtime.id) {
      console.log('[NiceMD Bridge] Extension context is invalidated. Please reload the editor page to reconnect.');
      return false;
    }
    chrome.runtime.sendMessage(message, (response) => {
      // Check lastError to prevent Chrome runtime exceptions
      if (chrome.runtime.lastError) {
        // Safe to ignore or log
        console.log('[NiceMD Bridge] chrome.runtime.lastError:', chrome.runtime.lastError.message);
      }
      if (callback) {
        callback(response);
      }
    });
    return true;
  } catch (err) {
    console.log('[NiceMD Bridge] Failed to send message:', err.message);
    return false;
  }
}

// Listen to messages from the NiceMD web app
window.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message !== 'object') return;

  // 1. Ping Check
  if (message.type === 'NICEMD_PING') {
    safeSendMessage({ type: 'PING' }, (response) => {
      if (response && response.status === 'PONG') {
        window.postMessage({ type: 'NICEMD_PONG', version: response.version }, '*');
      }
    });
  }

  // 2. Publish Launch
  if (message.type === 'NICEMD_PUBLISH') {
    const { platform, title, markdown, html, cover, themeId, isScheduled, scheduledTime, isOriginal } = message.payload || {};
    const sent = safeSendMessage({
      type: 'LAUNCH_PUBLISH',
      payload: { platform, title, markdown, html, cover, themeId, isScheduled, scheduledTime, isOriginal }
    }, (response) => {
      if (response) {
        window.postMessage({ type: 'NICEMD_PUBLISH_RESPONSE', success: response.success, platform, postUrl: response.postUrl, postId: response.postId }, '*');
      }
    });
    if (!sent) {
      window.postMessage({ type: 'NICEMD_PUBLISH_RESPONSE', success: false, error: 'Extension context invalidated' }, '*');
    }
  }

  // 3. Get Platforms Config
  if (message.type === 'NICEMD_GET_CONFIG') {
    const sent = safeSendMessage({ type: 'GET_CONFIG' }, (response) => {
      if (response) {
        window.postMessage({ type: 'NICEMD_GET_CONFIG_RESPONSE', success: true, config: response.config }, '*');
      }
    });
    if (!sent) {
      window.postMessage({ type: 'NICEMD_GET_CONFIG_RESPONSE', success: false, error: 'Extension context invalidated' }, '*');
    }
  }

  // 4. Save Platforms Config
  if (message.type === 'NICEMD_SAVE_CONFIG') {
    const sent = safeSendMessage({ type: 'SAVE_CONFIG', config: message.config }, (response) => {
      if (response) {
        window.postMessage({ type: 'NICEMD_SAVE_CONFIG_RESPONSE', success: response.success }, '*');
      }
    });
    if (!sent) {
      window.postMessage({ type: 'NICEMD_SAVE_CONFIG_RESPONSE', success: false, error: 'Extension context invalidated' }, '*');
    }
  }

  // 5. Check Login Status
  if (message.type === 'NICEMD_CHECK_LOGINS') {
    const sent = safeSendMessage({ type: 'CHECK_LOGINS', platforms: message.platforms }, (response) => {
      if (response) {
        window.postMessage({ type: 'NICEMD_CHECK_LOGINS_RESPONSE', success: true, statuses: response.statuses }, '*');
      }
    });
    if (!sent) {
      window.postMessage({ type: 'NICEMD_CHECK_LOGINS_RESPONSE', success: false, error: 'Extension context invalidated' }, '*');
    }
  }

  // 6. Open Tab
  if (message.type === 'NICEMD_OPEN_TAB') {
    safeSendMessage({ type: 'OPEN_TAB', url: message.url });
  }

  // 7. Fetch URL (bypass CORS)
  if (message.type === 'NICEMD_FETCH_URL') {
    const sent = safeSendMessage({ type: 'FETCH_URL', url: message.url }, (response) => {
      if (response) {
        window.postMessage({ type: 'NICEMD_FETCH_URL_RESPONSE', success: response.success, html: response.html, finalUrl: response.finalUrl, error: response.error }, '*');
      }
    });
    if (!sent) {
      window.postMessage({ type: 'NICEMD_FETCH_URL_RESPONSE', success: false, error: 'Extension context invalidated' }, '*');
    }
  }

  // 8. Get Pending Import
  if (message.type === 'NICEMD_GET_PENDING_IMPORT') {
    const sent = safeSendMessage({ type: 'GET_PENDING_IMPORT' }, (response) => {
      if (response) {
        window.postMessage({ type: 'NICEMD_GET_PENDING_IMPORT_RESPONSE', success: response.success, article: response.article }, '*');
      }
    });
    if (!sent) {
      window.postMessage({ type: 'NICEMD_GET_PENDING_IMPORT_RESPONSE', success: false, error: 'Extension context invalidated' }, '*');
    }
  }

  // 9. TiDB Cloud CORS Bypass Fetch
  if (message.type === 'NICEMD_TIDB_FETCH') {
    const { requestId, url, options } = message;
    const sent = safeSendMessage({ type: 'TIDB_FETCH', url, options }, (response) => {
      if (response) {
        window.postMessage({
          type: 'NICEMD_TIDB_FETCH_RESPONSE',
          requestId,
          ...response
        }, '*');
      }
    });
    if (!sent) {
      window.postMessage({
        type: 'NICEMD_TIDB_FETCH_RESPONSE',
        requestId,
        success: false,
        error: 'Extension context invalidated'
      }, '*');
    }
  }
});

// Listen to messages from background worker and forward to NiceMD web app page
try {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.type === 'IMPORT_NOTIFICATION') {
      window.postMessage({ type: 'NICEMD_IMPORT_NOTIFICATION' }, '*');
      if (sendResponse) sendResponse({ success: true });
    }
  });
} catch (err) {
  console.log('[NiceMD Bridge] Failed to register runtime message listener:', err.message);
}

