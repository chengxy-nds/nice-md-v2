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
  deleteCustomThemeInTidb
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

import {
  getGithubConfig,
  saveGithubConfig,
  isGithubSyncEnabled,
  hasGithubCredentials,
  getGithubLastSyncTime,
  testGithubConnection,
  pushAllToGithub,
  pullFromGithub,
  syncGithubBidirectional,
  recordGithubTombstone,
  scheduleGithubRealtimeSync
} from './githubStorage';

const CLOUD_SYNC_PROVIDER_KEY = 'nicemd_cloud_sync_provider_v1';
const SUPPORTED_PROVIDERS = ['tidb', 'neon', 'github'];

export {
  getTidbConfig,
  saveTidbConfig,
  isTidbSyncEnabled,
  getNeonConfig,
  saveNeonConfig,
  isNeonSyncEnabled,
  getGithubConfig,
  saveGithubConfig,
  isGithubSyncEnabled,
  hasGithubCredentials,
  getGithubLastSyncTime
};

// Normalize credential input so TiDB/Neon accept string or config object, while GitHub uses config object.
const asConnStr = (cfgOrConn, fallbackCfg) =>
  typeof cfgOrConn === 'string' ? cfgOrConn : (cfgOrConn?.connectionString ?? fallbackCfg.connectionString);

const asGithubCfg = (cfgOrConn) =>
  cfgOrConn && typeof cfgOrConn === 'object' ? cfgOrConn : getGithubConfig();

const PROVIDER_ADAPTERS = {
  tidb: {
    getConfig: getTidbConfig,
    saveConfig: saveTidbConfig,
    isEnabled: isTidbSyncEnabled,
    canAutoSync: (cfg) => Boolean(cfg.autoSync && cfg.connectionString?.trim()),
    testConnection: (cfgOrConn) => testTidbConnection(asConnStr(cfgOrConn, getTidbConfig())),
    pushAll: (cfgOrConn, docs, groups, histories, themes) =>
      pushAllToTidb(asConnStr(cfgOrConn, getTidbConfig()), docs, groups, histories, themes),
    pull: (cfgOrConn) => pullFromTidb(asConnStr(cfgOrConn, getTidbConfig())),
    syncBidirectional: (cfgOrConn, docs, groups, histories, themes) =>
      syncTidbBidirectional(asConnStr(cfgOrConn, getTidbConfig()), docs, groups, histories, themes),
    getSyncArg: (cfg) => cfg.connectionString,
    syncDoc: (cfg, doc) => syncSingleDocToTidb(cfg.connectionString, doc),
    syncGroup: (cfg, group) => syncSingleGroupToTidb(cfg.connectionString, group),
    syncHistory: (cfg, history) => syncSingleHistoryToTidb(cfg.connectionString, history),
    syncTheme: (cfg, theme) => syncSingleCustomThemeToTidb(cfg.connectionString, theme),
    deleteDoc: (cfg, docId) => deleteDocInTidb(cfg.connectionString, docId),
    permanentDeleteDoc: (cfg, docId) => permanentDeleteDocInTidb(cfg.connectionString, docId),
    deleteGroup: (cfg, groupId) => deleteGroupInTidb(cfg.connectionString, groupId),
    deleteHistory: (cfg, historyId) => deleteHistoryInTidb(cfg.connectionString, historyId),
    clearDocHistories: (cfg, docId) => clearDocHistoriesInTidb(cfg.connectionString, docId),
    deleteTheme: (cfg, themeId) => deleteCustomThemeInTidb(cfg.connectionString, themeId),
  },
  neon: {
    getConfig: getNeonConfig,
    saveConfig: saveNeonConfig,
    isEnabled: isNeonSyncEnabled,
    canAutoSync: (cfg) => Boolean(cfg.autoSync && cfg.connectionString?.trim()),
    testConnection: (cfgOrConn) => testNeonConnection(asConnStr(cfgOrConn, getNeonConfig())),
    pushAll: (cfgOrConn, docs, groups, histories, themes) =>
      pushAllToNeon(asConnStr(cfgOrConn, getNeonConfig()), docs, groups, histories, themes),
    pull: (cfgOrConn) => pullFromNeon(asConnStr(cfgOrConn, getNeonConfig())),
    syncBidirectional: (cfgOrConn, docs, groups, histories, themes) =>
      syncNeonBidirectional(asConnStr(cfgOrConn, getNeonConfig()), docs, groups, histories, themes),
    getSyncArg: (cfg) => cfg.connectionString,
    syncDoc: (cfg, doc) => syncSingleDocToNeon(cfg.connectionString, doc),
    syncGroup: (cfg, group) => syncSingleGroupToNeon(cfg.connectionString, group),
    syncHistory: (cfg, history) => syncSingleHistoryToNeon(cfg.connectionString, history),
    syncTheme: (cfg, theme) => syncSingleCustomThemeToNeon(cfg.connectionString, theme),
    deleteDoc: (cfg, docId) => deleteDocInNeon(cfg.connectionString, docId),
    permanentDeleteDoc: (cfg, docId) => permanentDeleteDocInNeon(cfg.connectionString, docId),
    deleteGroup: (cfg, groupId) => deleteGroupInNeon(cfg.connectionString, groupId),
    deleteHistory: (cfg, historyId) => deleteHistoryInNeon(cfg.connectionString, historyId),
    clearDocHistories: (cfg, docId) => clearDocHistoriesInNeon(cfg.connectionString, docId),
    deleteTheme: (cfg, themeId) => deleteCustomThemeInNeon(cfg.connectionString, themeId),
  },
  github: {
    getConfig: getGithubConfig,
    saveConfig: saveGithubConfig,
    isEnabled: isGithubSyncEnabled,
    canAutoSync: (cfg) => Boolean(cfg.autoSync && hasGithubCredentials(cfg)),
    testConnection: (cfgOrConn) => testGithubConnection(asGithubCfg(cfgOrConn)),
    pushAll: (cfgOrConn, docs, groups, histories, themes) =>
      pushAllToGithub(asGithubCfg(cfgOrConn), docs, groups, histories, themes),
    pull: (cfgOrConn) => pullFromGithub(asGithubCfg(cfgOrConn)),
    syncBidirectional: (cfgOrConn, docs, groups, histories, themes) =>
      syncGithubBidirectional(asGithubCfg(cfgOrConn), docs, groups, histories, themes),
    getSyncArg: (cfg) => cfg,
    // Docs/groups changes are handled by App.vue's debounced watch -> syncBidirectional so typing never spams commits.
    syncDoc: () => {},
    syncGroup: () => {},
    syncHistory: () => scheduleGithubRealtimeSync(),
    syncTheme: () => scheduleGithubRealtimeSync(),
    deleteDoc: () => {},
    permanentDeleteDoc: (_cfg, docId) => recordGithubTombstone('docs', docId),
    deleteGroup: (_cfg, groupId) => recordGithubTombstone('groups', groupId),
    deleteHistory: (_cfg, historyId) => {
      recordGithubTombstone('histories', historyId);
      scheduleGithubRealtimeSync();
    },
    clearDocHistories: (_cfg, docId) => {
      recordGithubTombstone('clearedHistoryDocs', docId);
      scheduleGithubRealtimeSync();
    },
    deleteTheme: (_cfg, themeId) => {
      recordGithubTombstone('themes', themeId);
      scheduleGithubRealtimeSync();
    },
  },
};

function getAdapter(provider) {
  return PROVIDER_ADAPTERS[provider] || PROVIDER_ADAPTERS.tidb;
}

/**
 * Get active cloud provider ('tidb' | 'neon' | 'github')
 */
export function getActiveCloudProvider() {
  try {
    const saved = localStorage.getItem(CLOUD_SYNC_PROVIDER_KEY);
    if (SUPPORTED_PROVIDERS.includes(saved)) {
      return saved;
    }
  } catch {}

  for (const id of SUPPORTED_PROVIDERS) {
    if (PROVIDER_ADAPTERS[id].isEnabled()) return id;
  }
  return 'tidb';
}

/**
 * Set active cloud provider and ensure only ONE provider is enabled at a time (mutual exclusion)
 */
export function setActiveCloudProvider(provider, enable = true) {
  try {
    if (!SUPPORTED_PROVIDERS.includes(provider)) return;
    localStorage.setItem(CLOUD_SYNC_PROVIDER_KEY, provider);

    if (enable) {
      for (const id of SUPPORTED_PROVIDERS) {
        const adapter = PROVIDER_ADAPTERS[id];
        const cfg = adapter.getConfig();
        if (id === provider) {
          cfg.enabled = true;
          adapter.saveConfig(cfg);
        } else if (cfg.enabled) {
          cfg.enabled = false;
          adapter.saveConfig(cfg);
        }
      }
    }

    window.dispatchEvent(new CustomEvent('nicemd-cloud-provider-changed', { detail: { provider, enable } }));
  } catch (e) {
    console.error('Failed to set active cloud provider', e);
  }
}

/**
 * Disable all cloud synchronization providers
 */
export function disableAllCloudSync() {
  try {
    for (const id of SUPPORTED_PROVIDERS) {
      const adapter = PROVIDER_ADAPTERS[id];
      const cfg = adapter.getConfig();
      if (cfg.enabled) {
        cfg.enabled = false;
        adapter.saveConfig(cfg);
      }
    }
    window.dispatchEvent(new CustomEvent('nicemd-cloud-provider-changed', { detail: { provider: null, enable: false } }));
  } catch (e) {
    console.error('Failed to disable cloud sync', e);
  }
}

/**
 * Check if active cloud sync is enabled
 */
export function isCloudSyncEnabled() {
  return getAdapter(getActiveCloudProvider()).isEnabled();
}

/**
 * Get active provider config
 */
export function getActiveCloudConfig() {
  return getAdapter(getActiveCloudProvider()).getConfig();
}

/**
 * Test Connection for a provider
 */
export async function testCloudConnection(provider, credentialsOrConn) {
  return await getAdapter(provider).testConnection(credentialsOrConn);
}

/**
 * Push all local data to active cloud provider
 */
export async function pushAllToCloud(credentialsOrConn, docs, groups, histories, customThemes, provider = null) {
  cancelPendingAutoSync();
  const targetProvider = provider || getActiveCloudProvider();
  return await getAdapter(targetProvider).pushAll(credentialsOrConn, docs, groups, histories, customThemes);
}

/**
 * Pull all cloud data from active provider
 */
export async function pullFromCloud(credentialsOrConn, provider = null) {
  cancelPendingAutoSync();
  const targetProvider = provider || getActiveCloudProvider();
  return await getAdapter(targetProvider).pull(credentialsOrConn);
}

/**
 * Bi-directional Sync with active cloud provider
 */
export async function syncCloudBidirectional(credentialsOrConn, localDocs, localGroups, localHistories, localThemes, provider = null) {
  cancelPendingAutoSync();
  const targetProvider = provider || getActiveCloudProvider();
  return await getAdapter(targetProvider).syncBidirectional(credentialsOrConn, localDocs, localGroups, localHistories, localThemes);
}

function dispatchRealtime(action, payload) {
  if (!isCloudSyncEnabled() || !payload) return;
  const adapter = getAdapter(getActiveCloudProvider());
  adapter[action](adapter.getConfig(), payload);
}

export const realtimeSyncDoc = (doc) => dispatchRealtime('syncDoc', doc);
export const realtimeSyncGroup = (group) => dispatchRealtime('syncGroup', group);
export const realtimeSyncHistory = (history) => dispatchRealtime('syncHistory', history);
export const realtimeSyncCustomTheme = (theme) => dispatchRealtime('syncTheme', theme);
export const realtimeDeleteDoc = (docId) => dispatchRealtime('deleteDoc', docId);
export const realtimePermanentDeleteDoc = (docId) => dispatchRealtime('permanentDeleteDoc', docId);
export const realtimeDeleteGroup = (groupId) => dispatchRealtime('deleteGroup', groupId);
export const realtimeDeleteHistory = (historyId) => dispatchRealtime('deleteHistory', historyId);
export const realtimeClearDocHistories = (docId) => dispatchRealtime('clearDocHistories', docId);
export const realtimeDeleteCustomTheme = (themeId) => dispatchRealtime('deleteTheme', themeId);

// Background auto sync debounce & Auth error guard
let cloudAutoSyncTimer = null;
const cloudAuthErrorProviders = new Set();

window.addEventListener('nicemd-tidb-config-updated', () => {
  cloudAuthErrorProviders.delete('tidb');
});
window.addEventListener('nicemd-neon-config-updated', () => {
  cloudAuthErrorProviders.delete('neon');
});
window.addEventListener('nicemd-github-config-updated', () => {
  cloudAuthErrorProviders.delete('github');
});
window.addEventListener('nicemd-cloud-provider-changed', () => {
  cloudAuthErrorProviders.clear();
});

export function cancelPendingAutoSync() {
  if (cloudAutoSyncTimer) {
    clearTimeout(cloudAutoSyncTimer);
    cloudAutoSyncTimer = null;
  }
}

function isAuthError(errMsg = '') {
  return (
    errMsg.includes('1045') ||
    errMsg.includes('401') ||
    errMsg.includes('403 权限不足') ||
    errMsg.includes('28P01') ||
    errMsg.includes('Access denied') ||
    errMsg.includes('password authentication failed')
  );
}

export function triggerAutoSyncDebounced(docs, groups, histories = [], customThemes = [], onSyncStart, onSyncEnd) {
  if (!isCloudSyncEnabled()) return;
  const provider = getActiveCloudProvider();
  if (cloudAuthErrorProviders.has(provider)) return;

  const adapter = getAdapter(provider);
  const config = adapter.getConfig();
  if (!adapter.canAutoSync(config)) return;

  cancelPendingAutoSync();

  cloudAutoSyncTimer = setTimeout(async () => {
    cloudAutoSyncTimer = null;
    try {
      if (typeof onSyncStart === 'function') onSyncStart();
      const res = await adapter.syncBidirectional(adapter.getSyncArg(config), docs, groups, histories, customThemes);
      if (typeof onSyncEnd === 'function') onSyncEnd(null, res);
    } catch (err) {
      const errMsg = err?.message || String(err);
      if (isAuthError(errMsg)) {
        cloudAuthErrorProviders.add(provider);
        console.warn(`[${provider.toUpperCase()} Auto-Sync] 鉴权或权限验证失败 (${errMsg})。后台自动同步已暂停，请在「设置 -> 云端同步」中更新凭证。`);
      } else {
        console.warn(`[${provider.toUpperCase()} Auto-Sync] Sync failed:`, err);
      }
      if (typeof onSyncEnd === 'function') onSyncEnd(err);
    }
  }, 2000);
}

/**
 * Immediate bidirectional auto-sync (e.g. on application boot)
 */
export async function triggerAutoSyncImmediate(docs, groups, histories = [], customThemes = [], onSyncStart, onSyncEnd) {
  if (!isCloudSyncEnabled()) return;
  const provider = getActiveCloudProvider();
  if (cloudAuthErrorProviders.has(provider)) return;

  const adapter = getAdapter(provider);
  const config = adapter.getConfig();
  if (!adapter.canAutoSync(config)) return;

  try {
    if (typeof onSyncStart === 'function') onSyncStart();
    const res = await adapter.syncBidirectional(adapter.getSyncArg(config), docs, groups, histories, customThemes);
    if (typeof onSyncEnd === 'function') onSyncEnd(null, res);
    return res;
  } catch (err) {
    const errMsg = err?.message || String(err);
    if (isAuthError(errMsg)) {
      cloudAuthErrorProviders.add(provider);
    }
    if (typeof onSyncEnd === 'function') onSyncEnd(err);
  }
}
