import {
  getTidbConfig,
  saveTidbConfig,
  isTidbSyncEnabled,
  testTidbConnection,
  pushAllToTidb,
  pullFromTidb,
  syncTidbBidirectional,
  syncSingleDocToTidb,
  syncSingleGroupToTidb,
  syncSingleHistoryToTidb,
  syncSingleCustomThemeToTidb,
  deleteDocInTidb,
  permanentDeleteDocInTidb,
  deleteGroupInTidb,
  deleteHistoryInTidb,
  clearDocHistoriesInTidb,
  deleteCustomThemeInTidb,
  DEFAULT_TIDB_URI
} from './tidbStorage';

import {
  getNeonConfig,
  saveNeonConfig,
  isNeonSyncEnabled,
  testNeonConnection,
  pushAllToNeon,
  pullFromNeon,
  syncNeonBidirectional,
  syncSingleDocToNeon,
  syncSingleGroupToNeon,
  syncSingleHistoryToNeon,
  syncSingleCustomThemeToNeon,
  deleteDocInNeon,
  permanentDeleteDocInNeon,
  deleteGroupInNeon,
  deleteHistoryInNeon,
  clearDocHistoriesInNeon,
  deleteCustomThemeInNeon
} from './neonStorage';

const CLOUD_SYNC_PROVIDER_KEY = 'nicemd_cloud_sync_provider_v1';

export {
  DEFAULT_TIDB_URI,
  getTidbConfig,
  saveTidbConfig,
  isTidbSyncEnabled,
  getNeonConfig,
  saveNeonConfig,
  isNeonSyncEnabled
};

/**
 * Get active cloud provider ('tidb' | 'neon')
 */
export function getActiveCloudProvider() {
  try {
    const saved = localStorage.getItem(CLOUD_SYNC_PROVIDER_KEY);
    if (saved === 'neon' || saved === 'tidb') {
      return saved;
    }
  } catch {}
  
  // Auto detect based on what user has enabled
  if (isTidbSyncEnabled()) return 'tidb';
  if (isNeonSyncEnabled()) return 'neon';
  return 'tidb'; // Default to TiDB Cloud
}

/**
 * Set active cloud provider and ensure only ONE provider is enabled at a time (mutual exclusion)
 */
export function setActiveCloudProvider(provider, enable = true) {
  try {
    if (provider === 'neon' || provider === 'tidb') {
      localStorage.setItem(CLOUD_SYNC_PROVIDER_KEY, provider);

      if (enable) {
        if (provider === 'tidb') {
          const tidb = getTidbConfig();
          tidb.enabled = true;
          saveTidbConfig(tidb);

          const neon = getNeonConfig();
          if (neon.enabled) {
            neon.enabled = false;
            saveNeonConfig(neon);
          }
        } else if (provider === 'neon') {
          const neon = getNeonConfig();
          neon.enabled = true;
          saveNeonConfig(neon);

          const tidb = getTidbConfig();
          if (tidb.enabled) {
            tidb.enabled = false;
            saveTidbConfig(tidb);
          }
        }
      }

      window.dispatchEvent(new CustomEvent('nicemd-cloud-provider-changed', { detail: { provider, enable } }));
    }
  } catch (e) {
    console.error('Failed to set active cloud provider', e);
  }
}

/**
 * Disable all cloud synchronization providers
 */
export function disableAllCloudSync() {
  try {
    const tidb = getTidbConfig();
    tidb.enabled = false;
    saveTidbConfig(tidb);

    const neon = getNeonConfig();
    neon.enabled = false;
    saveNeonConfig(neon);

    window.dispatchEvent(new CustomEvent('nicemd-cloud-provider-changed', { detail: { provider: null, enable: false } }));
  } catch (e) {
    console.error('Failed to disable cloud sync', e);
  }
}

/**
 * Check if active cloud sync is enabled
 */
export function isCloudSyncEnabled() {
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    return isTidbSyncEnabled();
  }
  if (provider === 'neon') {
    return isNeonSyncEnabled();
  }
  return false;
}

/**
 * Get active provider config
 */
export function getActiveCloudConfig() {
  const provider = getActiveCloudProvider();
  return provider === 'tidb' ? getTidbConfig() : getNeonConfig();
}

/**
 * Test Connection for a provider
 */
export async function testCloudConnection(provider, connectionString) {
  if (provider === 'tidb') {
    return await testTidbConnection(connectionString);
  }
  return await testNeonConnection(connectionString);
}

/**
 * Push all local data to active cloud provider
 */
export async function pushAllToCloud(connectionString, docs, groups, histories, customThemes, provider = null) {
  const targetProvider = provider || getActiveCloudProvider();
  if (targetProvider === 'tidb') {
    return await pushAllToTidb(connectionString, docs, groups, histories, customThemes);
  }
  return await pushAllToNeon(connectionString, docs, groups, histories, customThemes);
}

/**
 * Pull all cloud data from active provider
 */
export async function pullFromCloud(connectionString, provider = null) {
  const targetProvider = provider || getActiveCloudProvider();
  if (targetProvider === 'tidb') {
    return await pullFromTidb(connectionString);
  }
  return await pullFromNeon(connectionString);
}

/**
 * Bi-directional Sync with active cloud provider
 */
export async function syncCloudBidirectional(connectionString, localDocs, localGroups, localHistories, localThemes, provider = null) {
  const targetProvider = provider || getActiveCloudProvider();
  if (targetProvider === 'tidb') {
    return await syncTidbBidirectional(connectionString, localDocs, localGroups, localHistories, localThemes);
  }
  return await syncNeonBidirectional(connectionString, localDocs, localGroups, localHistories, localThemes);
}

/**
 * Real-time Single Operations
 */
export function realtimeSyncDoc(doc) {
  if (!isCloudSyncEnabled() || !doc) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    syncSingleDocToTidb(config.connectionString, doc);
  } else {
    const config = getNeonConfig();
    syncSingleDocToNeon(config.connectionString, doc);
  }
}

export function realtimeSyncGroup(group) {
  if (!isCloudSyncEnabled() || !group) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    syncSingleGroupToTidb(config.connectionString, group);
  } else {
    const config = getNeonConfig();
    syncSingleGroupToNeon(config.connectionString, group);
  }
}

export function realtimeSyncHistory(history) {
  if (!isCloudSyncEnabled() || !history) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    syncSingleHistoryToTidb(config.connectionString, history);
  } else {
    const config = getNeonConfig();
    syncSingleHistoryToNeon(config.connectionString, history);
  }
}

export function realtimeSyncCustomTheme(theme) {
  if (!isCloudSyncEnabled() || !theme) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    syncSingleCustomThemeToTidb(config.connectionString, theme);
  } else {
    const config = getNeonConfig();
    syncSingleCustomThemeToNeon(config.connectionString, theme);
  }
}

export function realtimeDeleteDoc(docId) {
  if (!isCloudSyncEnabled() || !docId) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    deleteDocInTidb(config.connectionString, docId);
  } else {
    const config = getNeonConfig();
    deleteDocInNeon(config.connectionString, docId);
  }
}

export function realtimePermanentDeleteDoc(docId) {
  if (!isCloudSyncEnabled() || !docId) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    permanentDeleteDocInTidb(config.connectionString, docId);
  } else {
    const config = getNeonConfig();
    permanentDeleteDocInNeon(config.connectionString, docId);
  }
}

export function realtimeDeleteGroup(groupId) {
  if (!isCloudSyncEnabled() || !groupId) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    deleteGroupInTidb(config.connectionString, groupId);
  } else {
    const config = getNeonConfig();
    deleteGroupInNeon(config.connectionString, groupId);
  }
}

export function realtimeDeleteHistory(historyId) {
  if (!isCloudSyncEnabled() || !historyId) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    deleteHistoryInTidb(config.connectionString, historyId);
  } else {
    const config = getNeonConfig();
    deleteHistoryInNeon(config.connectionString, historyId);
  }
}

export function realtimeClearDocHistories(docId) {
  if (!isCloudSyncEnabled() || !docId) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    clearDocHistoriesInTidb(config.connectionString, docId);
  } else {
    const config = getNeonConfig();
    clearDocHistoriesInNeon(config.connectionString, docId);
  }
}

export function realtimeDeleteCustomTheme(themeId) {
  if (!isCloudSyncEnabled() || !themeId) return;
  const provider = getActiveCloudProvider();
  if (provider === 'tidb') {
    const config = getTidbConfig();
    deleteCustomThemeInTidb(config.connectionString, themeId);
  } else {
    const config = getNeonConfig();
    deleteCustomThemeInNeon(config.connectionString, themeId);
  }
}

// Background auto sync debounce & Auth error guard
let cloudAutoSyncTimer = null;
const cloudAuthErrorProviders = new Set();

window.addEventListener('nicemd-tidb-config-updated', () => {
  cloudAuthErrorProviders.delete('tidb');
});
window.addEventListener('nicemd-neon-config-updated', () => {
  cloudAuthErrorProviders.delete('neon');
});
window.addEventListener('nicemd-cloud-provider-changed', () => {
  cloudAuthErrorProviders.clear();
});

export function triggerAutoSyncDebounced(docs, groups, histories = [], customThemes = [], onSyncStart, onSyncEnd) {
  if (!isCloudSyncEnabled()) return;
  const provider = getActiveCloudProvider();
  
  // If credentials failed authentication, pause automatic retry until user updates configuration
  if (cloudAuthErrorProviders.has(provider)) {
    return;
  }

  const config = provider === 'tidb' ? getTidbConfig() : getNeonConfig();
  if (!config.autoSync || !config.connectionString) return;

  if (cloudAutoSyncTimer) {
    clearTimeout(cloudAutoSyncTimer);
  }

  cloudAutoSyncTimer = setTimeout(async () => {
    try {
      if (typeof onSyncStart === 'function') onSyncStart();
      const res = await syncCloudBidirectional(config.connectionString, docs, groups, histories, customThemes, provider);
      if (typeof onSyncEnd === 'function') onSyncEnd(null, res);
    } catch (err) {
      const errMsg = err?.message || String(err);
      // Detect auth failure: 401 Unauthorized, MySQL 1045 Access Denied, Postgres 28P01
      if (
        errMsg.includes('1045') || 
        errMsg.includes('401') || 
        errMsg.includes('28P01') || 
        errMsg.includes('Access denied') || 
        errMsg.includes('password authentication failed')
      ) {
        cloudAuthErrorProviders.add(provider);
        console.warn(`[${provider.toUpperCase()} Auto-Sync] 数据库连接鉴权失败 (Error 1045 / 401 Unauthorized): 密码错误或连接串无效。后台自动同步已暂停，请在「设置 -> 云端数据库同步」中更新正确的连接串。`);
      } else {
        console.warn(`[${provider.toUpperCase()} Auto-Sync] Sync failed:`, err);
      }
      if (typeof onSyncEnd === 'function') onSyncEnd(err);
    }
  }, 2000);
}
