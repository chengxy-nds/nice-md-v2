import { connect } from '@tidbcloud/serverless';
import { builtInThemeIds } from './themePresets.js';

const TIDB_CONFIG_KEY = 'nicemd_tidb_sync_config_v1';
const TIDB_LAST_SYNC_KEY = 'nicemd_tidb_last_sync_timestamp';

export const DEFAULT_TIDB_URI = '';

/**
 * Get TiDB Cloud Sync configuration from localStorage
 */
export function getTidbConfig() {
  try {
    const raw = localStorage.getItem(TIDB_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: Boolean(parsed.enabled),
        connectionString: parsed.connectionString || '',
        autoSync: parsed.autoSync !== false,
        lastSyncTime: parsed.lastSyncTime || 0
      };
    }
  } catch (e) {
    console.warn('[TiDB Sync] Failed to load tidb config', e);
  }
  return {
    enabled: false,
    connectionString: '',
    autoSync: true,
    lastSyncTime: 0
  };
}

let tablesEnsuredFor = null;

export async function ensureTidbTables(connectionString) {
  if (!connectionString) return;
  const conn = connectionString.trim();
  if (tablesEnsuredFor === conn) return;
  try {
    await initTidbTables(conn);
    tablesEnsuredFor = conn;
  } catch (err) {
    console.warn('[TiDB Sync] Failed to ensure tables:', err);
  }
}

export function saveTidbConfig(config) {
  try {
    localStorage.setItem(TIDB_CONFIG_KEY, JSON.stringify(config));
    if (config.enabled && config.connectionString) {
      ensureTidbTables(config.connectionString);
    }
    window.dispatchEvent(new CustomEvent('nicemd-tidb-config-updated', { detail: config }));
  } catch (e) {
    console.error('[TiDB Sync] Failed to save tidb config', e);
  }
}

export function isTidbSyncEnabled() {
  const config = getTidbConfig();
  return Boolean(config.enabled && config.connectionString && config.connectionString.trim().length > 10);
}

export function getTidbLastSyncTime() {
  try {
    const t = localStorage.getItem(TIDB_LAST_SYNC_KEY);
    return t ? parseInt(t, 10) : 0;
  } catch {
    return 0;
  }
}

export function setTidbLastSyncTime(timestamp = Date.now()) {
  try {
    localStorage.setItem(TIDB_LAST_SYNC_KEY, String(timestamp));
  } catch {}
}

/**
 * Smart fetch implementation that solves browser CORS restrictions for TiDB Cloud Serverless:
 * 1. If running in browser with Vite dev server (or backend proxy /api/tidb-proxy), routes through proxy.
 * 2. If running with Chrome Extension, routes via Extension Background Service Worker (which has host_permissions).
 * 3. If in Node/Electron or direct support, uses native fetch.
 */
async function smartFetch(url, options = {}) {
  const urlStr = url.toString();

  // 1. Try local dev server proxy if in browser environment
  if (typeof window !== 'undefined' && window.location) {
    try {
      const headers = new Headers(options.headers || {});
      headers.set('x-tidb-target-url', urlStr);

      const proxyResp = await fetch('/api/tidb-proxy', {
        method: options.method || 'POST',
        headers,
        body: options.body
      });

      if (proxyResp.status !== 404 && proxyResp.status !== 502) {
        return proxyResp;
      }
    } catch (e) {
      // ignore and try next
    }
  }

  // 2. Try Chrome Extension Background Bridge
  if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
    try {
      const extResp = await fetchViaExtensionBridge(urlStr, options);
      if (extResp) {
        return extResp;
      }
    } catch (e) {
      // ignore and try next
    }
  }

  // 3. Fallback to native fetch
  return await fetch(url, options);
}

function fetchViaExtensionBridge(url, options, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const requestId = 'tidb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    let timer = null;

    function handleMessage(event) {
      if (!event.data || event.data.type !== 'NICEMD_TIDB_FETCH_RESPONSE') return;
      if (event.data.requestId !== requestId) return;

      window.removeEventListener('message', handleMessage);
      if (timer) clearTimeout(timer);

      const { success, status, statusText, headers, data, error } = event.data;
      if (!success && !status) {
        return reject(new Error(error || 'Extension fetch failed'));
      }

      const responseHeaders = new Headers(headers || {});
      const responseObj = new Response(data, {
        status: status || (success ? 200 : 500),
        statusText: statusText || (success ? 'OK' : 'Error'),
        headers: responseHeaders
      });

      resolve(responseObj);
    }

    timer = setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      reject(new Error('Extension bridge fetch timeout'));
    }, timeoutMs);

    window.addEventListener('message', handleMessage);
    
    // Normalize headers for postMessage cloning
    let cleanHeaders = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        cleanHeaders = Object.fromEntries(options.headers.entries());
      } else {
        cleanHeaders = { ...options.headers };
      }
    }

    window.postMessage({
      type: 'NICEMD_TIDB_FETCH',
      requestId,
      url,
      options: {
        method: options.method || 'POST',
        headers: cleanHeaders,
        body: options.body
      }
    }, '*');
  });
}

/**
 * Helper to get TiDB Serverless client
 */
function getClient(connectionString) {
  if (!connectionString) throw new Error('TiDB 数据库连接串不能为空');
  return connect({
    url: connectionString.trim(),
    fetch: smartFetch
  });
}

/**
 * Initialize Tables on TiDB Serverless MySQL
 * Creates tables for:
 * 1. nicemd_groups (分组)
 * 2. nicemd_documents (文档)
 * 3. nicemd_doc_histories (历史版本快照)
 * 4. nicemd_custom_themes (自定义主题)
 */
export async function initTidbTables(connectionString) {
  const client = getClient(connectionString);

  // 1. Groups Table (分组)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS nicemd_groups (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      collapsed TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      is_deleted TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Documents Table (文档)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS nicemd_documents (
      id VARCHAR(64) PRIMARY KEY,
      title TEXT,
      markdown LONGTEXT,
      group_id VARCHAR(64),
      theme_id VARCHAR(64) DEFAULT 'default',
      code_theme_id VARCHAR(64) DEFAULT 'atom-one-dark',
      font_size VARCHAR(16) DEFAULT '16px',
      custom_styles MEDIUMTEXT,
      is_favorite TINYINT(1) DEFAULT 0,
      sort_order INT DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      version INT DEFAULT 1,
      is_deleted TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Document Histories Table (历史版本)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS nicemd_doc_histories (
      id VARCHAR(64) PRIMARY KEY,
      doc_id VARCHAR(64) NOT NULL,
      title TEXT,
      name VARCHAR(255) DEFAULT '',
      type VARCHAR(32) DEFAULT 'auto',
      content LONGTEXT,
      custom_styles MEDIUMTEXT,
      char_count INT DEFAULT 0,
      word_count INT DEFAULT 0,
      line_count INT DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      is_deleted TINYINT(1) DEFAULT 0,
      INDEX idx_doc_id (doc_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Custom Themes Table (自定义主题)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS nicemd_custom_themes (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(64) DEFAULT 'Palette',
      dark TINYINT(1) DEFAULT 0,
      description TEXT,
      tag VARCHAR(64) DEFAULT '我的主题',
      is_custom TINYINT(1) DEFAULT 1,
      custom_styles MEDIUMTEXT,
      styles MEDIUMTEXT,
      custom_css LONGTEXT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      is_deleted TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Clean up any built-in preset theme ids that might have been accidentally inserted in earlier versions
  await client.execute(`
    UPDATE nicemd_custom_themes 
    SET is_deleted = 1 
    WHERE id IN (
      'classic-indigo', 'mountain-warm', 'mountain-forest', 'mountain-tea',
      'mountain-red', 'mountain-purple', 'mountain-gold', '135-morandi',
      '135-guofeng', 'github-clean', 'typora-github', 'typora-vue',
      'vue-emerald', 'nordic-ice', 'typora-dark', 'default'
    );
  `);

  return true;
}

/**
 * Test TiDB connection and fetch stats
 */
export async function testTidbConnection(connectionString) {
  if (!connectionString) throw new Error('请填写 TiDB 数据库连接串');
  const client = getClient(connectionString);

  // 1. Ensure tables exist
  await initTidbTables(connectionString);
  tablesEnsuredFor = connectionString.trim();

  // 2. Query Version and Table Counts
  const versionRes = await client.execute('SELECT VERSION() as ver, DATABASE() as db;');
  const dbVersion = (versionRes && versionRes[0] && versionRes[0].ver) ? String(versionRes[0].ver) : 'TiDB Serverless';
  const currentDb = (versionRes && versionRes[0] && versionRes[0].db) ? String(versionRes[0].db) : 'easymd';

  const docCountRes = await client.execute('SELECT COUNT(*) as cnt FROM nicemd_documents WHERE is_deleted = 0;');
  const groupCountRes = await client.execute('SELECT COUNT(*) as cnt FROM nicemd_groups WHERE is_deleted = 0;');
  const historyCountRes = await client.execute('SELECT COUNT(*) as cnt FROM nicemd_doc_histories WHERE is_deleted = 0;');
  const themeCountRes = await client.execute(`
    SELECT COUNT(*) as cnt FROM nicemd_custom_themes 
    WHERE is_deleted = 0 
    AND id NOT IN (
      'classic-indigo', 'mountain-warm', 'mountain-forest', 'mountain-tea',
      'mountain-red', 'mountain-purple', 'mountain-gold', '135-morandi',
      '135-guofeng', 'github-clean', 'typora-github', 'typora-vue',
      'vue-emerald', 'nordic-ice', 'typora-dark', 'default'
    );
  `);

  return {
    success: true,
    dbVersion,
    currentDb,
    docCount: parseInt(docCountRes[0]?.cnt || 0, 10),
    groupCount: parseInt(groupCountRes[0]?.cnt || 0, 10),
    historyCount: parseInt(historyCountRes[0]?.cnt || 0, 10),
    themeCount: parseInt(themeCountRes[0]?.cnt || 0, 10)
  };
}

/**
 * Full Push to TiDB (Overwrite / Upsert all local records)
 */
export async function pushAllToTidb(connectionString, docs = [], groups = [], histories = [], customThemes = []) {
  if (!connectionString) throw new Error('数据库连接串不能为空');
  await ensureTidbTables(connectionString);
  const client = getClient(connectionString);

  const now = Date.now();

  // 1. Push Groups
  if (groups && groups.length > 0) {
    for (const g of groups) {
      await client.execute(
        `INSERT INTO nicemd_groups (id, name, collapsed, sort_order, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           collapsed = VALUES(collapsed),
           sort_order = VALUES(sort_order),
           updated_at = VALUES(updated_at),
           is_deleted = 0;`,
        [
          g.id,
          g.name || '未命名分组',
          g.collapsed ? 1 : 0,
          g.sortOrder || 0,
          g.createdAt || now,
          g.updatedAt || now
        ]
      );
    }
  }

  // 2. Push Documents
  if (docs && docs.length > 0) {
    for (const d of docs) {
      const customStylesJson = JSON.stringify(d.customStyles || {});
      const textContent = d.content ?? d.markdown ?? '';
      await client.execute(
        `INSERT INTO nicemd_documents (
           id, title, markdown, group_id, theme_id, code_theme_id, font_size,
           custom_styles, is_favorite, sort_order, created_at, updated_at, version, is_deleted
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           markdown = VALUES(markdown),
           group_id = VALUES(group_id),
           theme_id = VALUES(theme_id),
           code_theme_id = VALUES(code_theme_id),
           font_size = VALUES(font_size),
           custom_styles = VALUES(custom_styles),
           is_favorite = VALUES(is_favorite),
           sort_order = VALUES(sort_order),
           updated_at = VALUES(updated_at),
           version = VALUES(version),
           is_deleted = VALUES(is_deleted);`,
        [
          d.id,
          d.title || '',
          textContent,
          d.groupId || null,
          d.themeId || 'default',
          d.codeThemeId || 'atom-one-dark',
          d.fontSize || '16px',
          customStylesJson,
          d.isFavorite ? 1 : 0,
          d.sortOrder || 0,
          d.createdAt || now,
          d.updatedAt || now,
          d.version || 1,
          (d.isDeleted || d.is_deleted) ? 1 : 0
        ]
      );
    }
  }

  // 3. Push Histories
  if (histories && histories.length > 0) {
    for (const h of histories) {
      const customStylesJson = JSON.stringify(h.customStyles || {});
      await client.execute(
        `INSERT INTO nicemd_doc_histories (
           id, doc_id, title, name, type, content, custom_styles,
           char_count, word_count, line_count, created_at, updated_at, is_deleted
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           name = VALUES(name),
           type = VALUES(type),
           content = VALUES(content),
           custom_styles = VALUES(custom_styles),
           char_count = VALUES(char_count),
           word_count = VALUES(word_count),
           line_count = VALUES(line_count),
           updated_at = VALUES(updated_at),
           is_deleted = 0;`,
        [
          h.id,
          h.docId,
          h.title || '',
          h.name || '',
          h.type || 'auto',
          h.content || '',
          customStylesJson,
          h.charCount || 0,
          h.wordCount || 0,
          h.lineCount || 0,
          h.createdAt || now,
          h.updatedAt || now
        ]
      );
    }
  }

  // 4. Push Custom Themes (Only user-created "另存为" custom themes, NEVER built-in presets)
  const validCustomThemes = (customThemes || []).filter(t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || t.id.startsWith('custom-')));
  if (validCustomThemes && validCustomThemes.length > 0) {
    for (const t of validCustomThemes) {
      const customStylesJson = JSON.stringify(t.customStyles || {});
      const stylesJson = JSON.stringify(t.styles || {});
      await client.execute(
        `INSERT INTO nicemd_custom_themes (
           id, name, icon, dark, description, tag, is_custom,
           custom_styles, styles, custom_css, created_at, updated_at, is_deleted
         )
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           icon = VALUES(icon),
           dark = VALUES(dark),
           description = VALUES(description),
           tag = VALUES(tag),
           custom_styles = VALUES(custom_styles),
           styles = VALUES(styles),
           custom_css = VALUES(custom_css),
           updated_at = VALUES(updated_at),
           is_deleted = 0;`,
        [
          t.id,
          t.name || '自定义主题',
          t.icon || 'Palette',
          t.dark ? 1 : 0,
          t.description || '用户自定义主题',
          t.tag || '我的主题',
          customStylesJson,
          stylesJson,
          t.customCss || '',
          t.createdAt || now,
          t.updatedAt || now
        ]
      );
    }
  }

  setTidbLastSyncTime();

  return {
    success: true,
    pushedDocs: docs.length,
    pushedGroups: groups.length,
    pushedHistories: histories.length,
    pushedThemes: customThemes.length
  };
}

/**
 * Full Pull from TiDB (Fetch non-deleted cloud records)
 */
export async function pullFromTidb(connectionString) {
  if (!connectionString) throw new Error('数据库连接串不能为空');
  await ensureTidbTables(connectionString);
  const client = getClient(connectionString);

  // 1. Pull Groups
  const groupRows = await client.execute(`
    SELECT * FROM nicemd_groups 
    WHERE is_deleted = 0 
    ORDER BY sort_order ASC, created_at ASC;
  `);
  const groups = (groupRows || []).map(r => ({
    id: r.id,
    name: r.name,
    collapsed: Boolean(Number(r.collapsed)),
    sortOrder: Number(r.sort_order || 0),
    createdAt: Number(r.created_at || Date.now()),
    updatedAt: Number(r.updated_at || Date.now())
  }));

  // 2. Pull Documents (all documents including recycle bin)
  const docRows = await client.execute(`
    SELECT * FROM nicemd_documents 
    ORDER BY sort_order ASC, updated_at DESC;
  `);
  const docs = (docRows || []).map(r => {
    let customStyles = {};
    try {
      if (r.custom_styles) customStyles = JSON.parse(r.custom_styles);
    } catch {}
    const textContent = r.markdown ?? r.content ?? '';
    return {
      id: r.id,
      title: r.title || '',
      content: textContent,
      markdown: textContent,
      groupId: r.group_id || null,
      themeId: r.theme_id || 'default',
      codeThemeId: r.code_theme_id || 'atom-one-dark',
      fontSize: r.font_size || '16px',
      customStyles,
      isFavorite: Boolean(Number(r.is_favorite)),
      isDeleted: Boolean(Number(r.is_deleted)),
      sortOrder: Number(r.sort_order || 0),
      createdAt: Number(r.created_at || Date.now()),
      updatedAt: Number(r.updated_at || Date.now()),
      version: Number(r.version || 1)
    };
  });

  // 3. Pull Histories
  const historyRows = await client.execute(`
    SELECT * FROM nicemd_doc_histories 
    WHERE is_deleted = 0 
    ORDER BY created_at DESC;
  `);
  const histories = (historyRows || []).map(r => {
    let customStyles = {};
    try {
      if (r.custom_styles) customStyles = JSON.parse(r.custom_styles);
    } catch {}
    return {
      id: r.id,
      docId: r.doc_id,
      title: r.title || '',
      name: r.name || '',
      type: r.type || 'auto',
      content: r.content || '',
      customStyles,
      charCount: Number(r.char_count || 0),
      wordCount: Number(r.word_count || 0),
      lineCount: Number(r.line_count || 0),
      createdAt: Number(r.created_at || Date.now()),
      updatedAt: Number(r.updated_at || Date.now())
    };
  });

  // 4. Pull Custom Themes
  const themeRows = await client.execute(`
    SELECT * FROM nicemd_custom_themes 
    WHERE is_deleted = 0 
    ORDER BY created_at ASC;
  `);
  const customThemes = (themeRows || [])
    .map(r => {
      let customStyles = {};
      let styles = {};
      try {
        if (r.custom_styles) customStyles = JSON.parse(r.custom_styles);
      } catch {}
      try {
        if (r.styles) styles = JSON.parse(r.styles);
      } catch {}
      return {
        id: r.id,
        name: r.name,
        icon: r.icon || 'Palette',
        dark: Boolean(Number(r.dark)),
        description: r.description || '',
        tag: r.tag || '我的主题',
        isCustom: true,
        customStyles,
        styles,
        customCss: r.custom_css || '',
        createdAt: Number(r.created_at || Date.now()),
        updatedAt: Number(r.updated_at || Date.now())
      };
    })
    .filter(t => t && t.id && !builtInThemeIds.has(t.id));

  setTidbLastSyncTime();

  return { docs, groups, histories, customThemes };
}

/**
 * Bi-directional Sync with TiDB
 */
export async function syncTidbBidirectional(connectionString, localDocs = [], localGroups = [], localHistories = [], localThemes = []) {
  if (!connectionString) throw new Error('数据库连接串不能为空');
  await ensureTidbTables(connectionString);
  const client = getClient(connectionString);

  // 1. Pull all remote records
  const { docs: cloudDocs, groups: cloudGroups, histories: cloudHistories, customThemes: cloudThemes } = await pullFromTidb(connectionString);

  // ── Reconcile Groups ──
  const localGroupsMap = new Map(localGroups.map(g => [g.id, g]));
  const cloudGroupsMap = new Map(cloudGroups.map(g => [g.id, g]));
  const mergedGroups = [];
  const groupsToUpload = [];
  const allGroupIds = new Set([...localGroupsMap.keys(), ...cloudGroupsMap.keys()]);

  for (const id of allGroupIds) {
    const local = localGroupsMap.get(id);
    const cloud = cloudGroupsMap.get(id);
    if (local && cloud) {
      if ((local.updatedAt || local.createdAt || 0) >= (cloud.updatedAt || cloud.createdAt || 0)) {
        mergedGroups.push(local);
        if ((local.updatedAt || local.createdAt || 0) > (cloud.updatedAt || cloud.createdAt || 0)) groupsToUpload.push(local);
      } else {
        mergedGroups.push(cloud);
      }
    } else if (local && !cloud) {
      mergedGroups.push(local);
      groupsToUpload.push(local);
    } else if (!local && cloud) {
      mergedGroups.push(cloud);
    }
  }

  // ── Reconcile Documents ──
  const localDocsMap = new Map(localDocs.map(d => [d.id, d]));
  const cloudDocsMap = new Map(cloudDocs.map(d => [d.id, d]));
  const mergedDocs = [];
  const docsToUpload = [];
  const allDocIds = new Set([...localDocsMap.keys(), ...cloudDocsMap.keys()]);

  for (const id of allDocIds) {
    const local = localDocsMap.get(id);
    const cloud = cloudDocsMap.get(id);
    if (local && cloud) {
      if ((local.updatedAt || local.createdAt || 0) >= (cloud.updatedAt || cloud.createdAt || 0)) {
        mergedDocs.push(local);
        if ((local.updatedAt || local.createdAt || 0) > (cloud.updatedAt || cloud.createdAt || 0)) docsToUpload.push(local);
      } else {
        mergedDocs.push(cloud);
      }
    } else if (local && !cloud) {
      mergedDocs.push(local);
      docsToUpload.push(local);
    } else if (!local && cloud) {
      mergedDocs.push(cloud);
    }
  }

  // ── Reconcile Histories ──
  const localHistoriesMap = new Map(localHistories.map(h => [h.id, h]));
  const cloudHistoriesMap = new Map(cloudHistories.map(h => [h.id, h]));
  const mergedHistories = [];
  const historiesToUpload = [];
  const allHistoryIds = new Set([...localHistoriesMap.keys(), ...cloudHistoriesMap.keys()]);

  for (const id of allHistoryIds) {
    const local = localHistoriesMap.get(id);
    const cloud = cloudHistoriesMap.get(id);
    if (local && cloud) {
      if ((local.updatedAt || local.createdAt || 0) >= (cloud.updatedAt || cloud.createdAt || 0)) {
        mergedHistories.push(local);
        if ((local.updatedAt || local.createdAt || 0) > (cloud.updatedAt || cloud.createdAt || 0)) {
          historiesToUpload.push(local);
        }
      } else {
        mergedHistories.push(cloud);
      }
    } else if (local && !cloud) {
      mergedHistories.push(local);
      historiesToUpload.push(local);
    } else if (!local && cloud) {
      mergedHistories.push(cloud);
    }
  }

  // ── Reconcile Custom Themes (Only user-created "另存为" custom themes) ──
  const validLocalThemes = (localThemes || []).filter(t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || t.id.startsWith('custom-')));
  const validCloudThemes = (cloudThemes || []).filter(t => t && t.id && !builtInThemeIds.has(t.id));

  const localThemesMap = new Map(validLocalThemes.map(t => [t.id, t]));
  const cloudThemesMap = new Map(validCloudThemes.map(t => [t.id, t]));
  const mergedThemes = [];
  const themesToUpload = [];
  const allThemeIds = new Set([...localThemesMap.keys(), ...cloudThemesMap.keys()]);

  for (const id of allThemeIds) {
    const local = localThemesMap.get(id);
    const cloud = cloudThemesMap.get(id);
    if (local && cloud) {
      if ((local.updatedAt || 0) >= (cloud.updatedAt || 0)) {
        mergedThemes.push(local);
        if ((local.updatedAt || 0) > (cloud.updatedAt || 0)) themesToUpload.push(local);
      } else {
        mergedThemes.push(cloud);
      }
    } else if (local && !cloud) {
      mergedThemes.push(local);
      themesToUpload.push(local);
    } else if (!local && cloud) {
      mergedThemes.push(cloud);
    }
  }

  // 2. Upload newer local items to TiDB
  for (const g of groupsToUpload) {
    await client.execute(
      `INSERT INTO nicemd_groups (id, name, collapsed, sort_order, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         collapsed = VALUES(collapsed),
         sort_order = VALUES(sort_order),
         updated_at = VALUES(updated_at),
         is_deleted = 0;`,
      [
        g.id,
        g.name || '未命名分组',
        g.collapsed ? 1 : 0,
        g.sortOrder || 0,
        g.createdAt || Date.now(),
        g.updatedAt || Date.now()
      ]
    );
  }

  for (const d of docsToUpload) {
    const customStylesJson = JSON.stringify(d.customStyles || {});
    const textContent = d.content ?? d.markdown ?? '';
    await client.execute(
      `INSERT INTO nicemd_documents (
         id, title, markdown, group_id, theme_id, code_theme_id, font_size,
         custom_styles, is_favorite, sort_order, created_at, updated_at, version, is_deleted
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         markdown = VALUES(markdown),
         group_id = VALUES(group_id),
         theme_id = VALUES(theme_id),
         code_theme_id = VALUES(code_theme_id),
         font_size = VALUES(font_size),
         custom_styles = VALUES(custom_styles),
         is_favorite = VALUES(is_favorite),
         sort_order = VALUES(sort_order),
         updated_at = VALUES(updated_at),
         version = VALUES(version),
         is_deleted = VALUES(is_deleted);`,
      [
        d.id,
        d.title || '',
        textContent,
        d.groupId || null,
        d.themeId || 'default',
        d.codeThemeId || 'atom-one-dark',
        d.fontSize || '16px',
        customStylesJson,
        d.isFavorite ? 1 : 0,
        d.sortOrder || 0,
        d.createdAt || Date.now(),
        d.updatedAt || Date.now(),
        d.version || 1,
        (d.isDeleted || d.is_deleted) ? 1 : 0
      ]
    );
  }

  for (const h of historiesToUpload) {
    const customStylesJson = JSON.stringify(h.customStyles || {});
    await client.execute(
      `INSERT INTO nicemd_doc_histories (
         id, doc_id, title, name, type, content, custom_styles,
         char_count, word_count, line_count, created_at, updated_at, is_deleted
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         name = VALUES(name),
         type = VALUES(type),
         content = VALUES(content),
         custom_styles = VALUES(custom_styles),
         char_count = VALUES(char_count),
         word_count = VALUES(word_count),
         line_count = VALUES(line_count),
         updated_at = VALUES(updated_at),
         is_deleted = 0;`,
      [
        h.id,
        h.docId,
        h.title || '',
        h.name || '',
        h.type || 'auto',
        h.content || '',
        customStylesJson,
        h.charCount || 0,
        h.wordCount || 0,
        h.lineCount || 0,
        h.createdAt || Date.now(),
        h.updatedAt || h.createdAt || Date.now()
      ]
    );
  }

  for (const t of themesToUpload) {
    const customStylesJson = JSON.stringify(t.customStyles || {});
    const stylesJson = JSON.stringify(t.styles || {});
    await client.execute(
      `INSERT INTO nicemd_custom_themes (
         id, name, icon, dark, description, tag, is_custom,
         custom_styles, styles, custom_css, created_at, updated_at, is_deleted
       )
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         icon = VALUES(icon),
         dark = VALUES(dark),
         description = VALUES(description),
         tag = VALUES(tag),
         custom_styles = VALUES(custom_styles),
         styles = VALUES(styles),
         custom_css = VALUES(custom_css),
         updated_at = VALUES(updated_at),
         is_deleted = 0;`,
      [
        t.id,
        t.name || '自定义主题',
        t.icon || 'Palette',
        t.dark ? 1 : 0,
        t.description || '用户自定义主题',
        t.tag || '我的主题',
        customStylesJson,
        stylesJson,
        t.customCss || '',
        t.createdAt || Date.now(),
        t.updatedAt || Date.now()
      ]
    );
  }

  setTidbLastSyncTime();

  return {
    docs: mergedDocs,
    groups: mergedGroups,
    histories: mergedHistories,
    customThemes: mergedThemes,
    stats: {
      uploadedDocs: docsToUpload.length,
      uploadedGroups: groupsToUpload.length,
      uploadedHistories: historiesToUpload.length,
      uploadedThemes: themesToUpload.length
    }
  };
}

const docSyncDebounceMap = new Map();

/**
 * Fast Single Document Upsert to TiDB (with debouncing to prevent high-frequency write collisions)
 */
export async function syncSingleDocToTidb(connectionString, doc, debounceMs = 500) {
  if (!connectionString || !doc || !doc.id) return;
  const conn = connectionString.trim();

  if (docSyncDebounceMap.has(doc.id)) {
    clearTimeout(docSyncDebounceMap.get(doc.id));
  }

  return new Promise((resolve) => {
    const doSync = async () => {
      docSyncDebounceMap.delete(doc.id);
      const executeInsert = async () => {
        const client = getClient(conn);
        const customStylesJson = JSON.stringify(doc.customStyles || {});
        const textContent = doc.content ?? doc.markdown ?? '';
        await client.execute(
          `INSERT INTO nicemd_documents (
             id, title, markdown, group_id, theme_id, code_theme_id, font_size,
             custom_styles, is_favorite, sort_order, created_at, updated_at, version, is_deleted
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             markdown = VALUES(markdown),
             group_id = VALUES(group_id),
             theme_id = VALUES(theme_id),
             code_theme_id = VALUES(code_theme_id),
             font_size = VALUES(font_size),
             custom_styles = VALUES(custom_styles),
             is_favorite = VALUES(is_favorite),
             sort_order = VALUES(sort_order),
             updated_at = VALUES(updated_at),
             version = VALUES(version),
             is_deleted = VALUES(is_deleted);`,
          [
            doc.id,
            doc.title || '',
            textContent,
            doc.groupId || null,
            doc.themeId || 'default',
            doc.codeThemeId || 'atom-one-dark',
            doc.fontSize || '16px',
            customStylesJson,
            doc.isFavorite ? 1 : 0,
            doc.sortOrder || 0,
            doc.createdAt || Date.now(),
            doc.updatedAt || Date.now(),
            doc.version || 1,
            doc.isDeleted ? 1 : 0
          ]
        );
        setTidbLastSyncTime();
        resolve(true);
      };

      try {
        await ensureTidbTables(conn);
        await executeInsert();
      } catch (err) {
        try {
          await initTidbTables(conn);
          tablesEnsuredFor = conn;
          await executeInsert();
        } catch (retryErr) {
          console.warn('[TiDB Sync] Fast single doc sync error:', retryErr);
          resolve(false);
        }
      }
    };

    if (debounceMs <= 0) {
      doSync();
    } else {
      const timer = setTimeout(doSync, debounceMs);
      docSyncDebounceMap.set(doc.id, timer);
    }
  });
}

/**
 * Fast Single Group Upsert to TiDB
 */
export async function syncSingleGroupToTidb(connectionString, group) {
  if (!connectionString || !group) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const client = getClient(conn);
    await client.execute(
      `INSERT INTO nicemd_groups (id, name, collapsed, sort_order, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         collapsed = VALUES(collapsed),
         sort_order = VALUES(sort_order),
         updated_at = VALUES(updated_at),
         is_deleted = 0;`,
      [
        group.id,
        group.name || '未命名分组',
        group.collapsed ? 1 : 0,
        group.sortOrder || 0,
        group.createdAt || Date.now(),
        group.updatedAt || Date.now()
      ]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Fast single group sync error:', retryErr);
    }
  }
}

/**
 * Fast Single History Upsert to TiDB
 */
export async function syncSingleHistoryToTidb(connectionString, history) {
  if (!connectionString || !history) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const client = getClient(conn);
    const customStylesJson = JSON.stringify(history.customStyles || {});
    await client.execute(
      `INSERT INTO nicemd_doc_histories (
         id, doc_id, title, name, type, content, custom_styles,
         char_count, word_count, line_count, created_at, updated_at, is_deleted
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         name = VALUES(name),
         type = VALUES(type),
         content = VALUES(content),
         custom_styles = VALUES(custom_styles),
         char_count = VALUES(char_count),
         word_count = VALUES(word_count),
         line_count = VALUES(line_count),
         updated_at = VALUES(updated_at),
         is_deleted = 0;`,
      [
        history.id,
        history.docId,
        history.title || '',
        history.name || '',
        history.type || 'auto',
        history.content || '',
        customStylesJson,
        history.charCount || 0,
        history.wordCount || 0,
        history.lineCount || 0,
        history.createdAt || Date.now(),
        history.updatedAt || Date.now()
      ]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Fast single history sync error:', retryErr);
    }
  }
}

/**
 * Fast Single Custom Theme Upsert to TiDB
 */
export async function syncSingleCustomThemeToTidb(connectionString, theme) {
  if (!connectionString || !theme || !theme.id || builtInThemeIds.has(theme.id) || (!theme.isCustom && !theme.id.startsWith('custom-'))) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const client = getClient(conn);
    const customStylesJson = JSON.stringify(theme.customStyles || {});
    const stylesJson = JSON.stringify(theme.styles || {});
    await client.execute(
      `INSERT INTO nicemd_custom_themes (
         id, name, icon, dark, description, tag, is_custom,
         custom_styles, styles, custom_css, created_at, updated_at, is_deleted
       )
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         icon = VALUES(icon),
         dark = VALUES(dark),
         description = VALUES(description),
         tag = VALUES(tag),
         custom_styles = VALUES(custom_styles),
         styles = VALUES(styles),
         custom_css = VALUES(custom_css),
         updated_at = VALUES(updated_at),
         is_deleted = 0;`,
      [
        theme.id,
        theme.name || '自定义主题',
        theme.icon || 'Palette',
        theme.dark ? 1 : 0,
        theme.description || '用户自定义主题',
        theme.tag || '我的主题',
        customStylesJson,
        stylesJson,
        theme.customCss || '',
        theme.createdAt || Date.now(),
        theme.updatedAt || Date.now()
      ]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Fast single custom theme sync error:', retryErr);
    }
  }
}

/**
 * Soft Deletions on TiDB Cloud
 */
export async function deleteDocInTidb(connectionString, docId) {
  if (!connectionString || !docId) return;
  const conn = connectionString.trim();

  // Cancel any pending debounced sync for this doc
  if (docSyncDebounceMap.has(docId)) {
    clearTimeout(docSyncDebounceMap.get(docId));
    docSyncDebounceMap.delete(docId);
  }

  const executeDelete = async () => {
    const client = getClient(conn);
    await client.execute(
      `UPDATE nicemd_documents SET is_deleted = 1, updated_at = ? WHERE id = ?;`,
      [Date.now(), docId]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeDelete();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeDelete();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Failed to delete document in cloud:', retryErr);
    }
  }
}

/**
 * Permanent Hard Deletions on TiDB Cloud
 */
export async function permanentDeleteDocInTidb(connectionString, docId) {
  if (!connectionString || !docId) return;
  const conn = connectionString.trim();

  if (docSyncDebounceMap.has(docId)) {
    clearTimeout(docSyncDebounceMap.get(docId));
    docSyncDebounceMap.delete(docId);
  }

  const executeDelete = async () => {
    const client = getClient(conn);
    await client.execute(
      `DELETE FROM nicemd_documents WHERE id = ?;`,
      [docId]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeDelete();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeDelete();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Failed to permanently delete document in cloud:', retryErr);
    }
  }
}

export async function deleteGroupInTidb(connectionString, groupId) {
  if (!connectionString || !groupId) return;
  const conn = connectionString.trim();
  const executeDelete = async () => {
    const client = getClient(conn);
    // Hard delete group
    await client.execute(
      `DELETE FROM nicemd_groups WHERE id = ?;`,
      [groupId]
    );
    // Set docs under this group to ungrouped (null)
    await client.execute(
      `UPDATE nicemd_documents SET group_id = NULL WHERE group_id = ?;`,
      [groupId]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeDelete();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeDelete();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Failed to delete group in cloud:', retryErr);
    }
  }
}

export async function deleteHistoryInTidb(connectionString, historyId) {
  if (!connectionString || !historyId) return;
  const conn = connectionString.trim();
  const executeDelete = async () => {
    const client = getClient(conn);
    await client.execute(
      `UPDATE nicemd_doc_histories SET is_deleted = 1, updated_at = ? WHERE id = ?;`,
      [Date.now(), historyId]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeDelete();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeDelete();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Failed to delete history in cloud:', retryErr);
    }
  }
}

export async function clearDocHistoriesInTidb(connectionString, docId) {
  if (!connectionString || !docId) return;
  const conn = connectionString.trim();
  const executeDelete = async () => {
    const client = getClient(conn);
    await client.execute(
      `UPDATE nicemd_doc_histories SET is_deleted = 1, updated_at = ? WHERE doc_id = ?;`,
      [Date.now(), docId]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeDelete();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeDelete();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Failed to clear doc histories in cloud:', retryErr);
    }
  }
}

export async function deleteCustomThemeInTidb(connectionString, themeId) {
  if (!connectionString || !themeId) return;
  const conn = connectionString.trim();
  const executeDelete = async () => {
    const client = getClient(conn);
    await client.execute(
      `UPDATE nicemd_custom_themes SET is_deleted = 1, updated_at = ? WHERE id = ?;`,
      [Date.now(), themeId]
    );
    setTidbLastSyncTime();
  };

  try {
    await ensureTidbTables(conn);
    await executeDelete();
  } catch (err) {
    try {
      await initTidbTables(conn);
      tablesEnsuredFor = conn;
      await executeDelete();
    } catch (retryErr) {
      console.warn('[TiDB Sync] Failed to delete custom theme in cloud:', retryErr);
    }
  }
}
