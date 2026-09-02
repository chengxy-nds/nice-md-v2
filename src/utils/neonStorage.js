import { neon } from '@neondatabase/serverless';
import { builtInThemeIds } from './themePresets.js';

const NEON_CONFIG_KEY = 'nicemd_neon_sync_config_v1';
const NEON_LAST_SYNC_KEY = 'nicemd_neon_last_sync_timestamp';

/**
 * Default Neon Sync configuration
 */
export function getNeonConfig() {
  try {
    const raw = localStorage.getItem(NEON_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load neon config', e);
  }
  return {
    enabled: false,
    connectionString: '',
    autoSync: true,
    lastSyncTime: 0
  };
}

let tablesEnsuredFor = null;

export async function ensureNeonTables(connectionString) {
  if (!connectionString) return;
  const conn = connectionString.trim();
  if (tablesEnsuredFor === conn) return;
  try {
    await initNeonTables(conn);
    tablesEnsuredFor = conn;
  } catch (err) {
    console.warn('[Neon Sync] Failed to ensure tables:', err);
  }
}

export function saveNeonConfig(config) {
  try {
    localStorage.setItem(NEON_CONFIG_KEY, JSON.stringify(config));
    if (config.enabled && config.connectionString) {
      ensureNeonTables(config.connectionString);
    }
    window.dispatchEvent(new CustomEvent('nicemd-neon-config-updated', { detail: config }));
  } catch (e) {
    console.error('Failed to save neon config', e);
  }
}

export function isNeonSyncEnabled() {
  const config = getNeonConfig();
  return Boolean(config.enabled && config.connectionString && config.connectionString.trim().length > 10);
}

export function getLastSyncTime() {
  try {
    const t = localStorage.getItem(NEON_LAST_SYNC_KEY);
    return t ? parseInt(t, 10) : 0;
  } catch {
    return 0;
  }
}

export function setLastSyncTime(timestamp = Date.now()) {
  try {
    localStorage.setItem(NEON_LAST_SYNC_KEY, String(timestamp));
  } catch {}
}

/**
 * Initialize Tables on Neon Postgres
 * Creates tables for:
 * 1. nicemd_groups (分组)
 * 2. nicemd_documents (文档)
 * 3. nicemd_doc_histories (历史版本快照)
 * 4. nicemd_custom_themes (自定义主题)
 */
export async function initNeonTables(connectionString) {
  if (!connectionString) throw new Error('数据库连接串不能为空');
  const sql = neon(connectionString.trim());

  // 1. Groups Table (分组)
  await sql`
    CREATE TABLE IF NOT EXISTS nicemd_groups (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      collapsed BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE
    );
  `;

  // 2. Documents Table (文档)
  await sql`
    CREATE TABLE IF NOT EXISTS nicemd_documents (
      id VARCHAR(64) PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      markdown TEXT NOT NULL DEFAULT '',
      group_id VARCHAR(64),
      theme_id VARCHAR(64) DEFAULT 'default',
      code_theme_id VARCHAR(64) DEFAULT 'atom-one-dark',
      font_size VARCHAR(16) DEFAULT '16px',
      custom_styles TEXT DEFAULT '{}',
      is_favorite BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      version INT DEFAULT 1,
      is_deleted BOOLEAN DEFAULT FALSE
    );
  `;

  // 3. Document Histories Table (历史版本)
  await sql`
    CREATE TABLE IF NOT EXISTS nicemd_doc_histories (
      id VARCHAR(64) PRIMARY KEY,
      doc_id VARCHAR(64) NOT NULL,
      title TEXT DEFAULT '',
      name VARCHAR(255) DEFAULT '',
      type VARCHAR(32) DEFAULT 'auto',
      content TEXT DEFAULT '',
      custom_styles TEXT DEFAULT '{}',
      char_count INT DEFAULT 0,
      word_count INT DEFAULT 0,
      line_count INT DEFAULT 0,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE
    );
  `;

  // 4. Custom Themes Table (自定义主题)
  await sql`
    CREATE TABLE IF NOT EXISTS nicemd_custom_themes (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(64) DEFAULT 'Palette',
      dark BOOLEAN DEFAULT FALSE,
      description TEXT DEFAULT '',
      tag VARCHAR(64) DEFAULT '我的主题',
      is_custom BOOLEAN DEFAULT TRUE,
      custom_styles TEXT DEFAULT '{}',
      styles TEXT DEFAULT '{}',
      custom_css TEXT DEFAULT '',
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE
    );
  `;

  // Migration / compatibility columns
  try {
    await sql`ALTER TABLE nicemd_documents ADD COLUMN IF NOT EXISTS custom_styles TEXT DEFAULT '{}';`;
  } catch (e) {}

  try {
    await sql`ALTER TABLE nicemd_doc_histories ADD COLUMN IF NOT EXISTS custom_styles TEXT DEFAULT '{}';`;
  } catch (e) {}

  try {
    await sql`ALTER TABLE nicemd_custom_themes ADD COLUMN IF NOT EXISTS custom_css TEXT DEFAULT '';`;
  } catch (e) {}

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_docs_updated_at ON nicemd_documents(updated_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_groups_updated_at ON nicemd_groups(updated_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_histories_doc_id ON nicemd_doc_histories(doc_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_histories_created_at ON nicemd_doc_histories(created_at);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_custom_themes_updated_at ON nicemd_custom_themes(updated_at);`;

  // Clean up any built-in preset theme ids that might have been accidentally inserted in earlier versions
  await sql`
    UPDATE nicemd_custom_themes 
    SET is_deleted = TRUE 
    WHERE id IN (
      'classic-indigo', 'mountain-warm', 'mountain-forest', 'mountain-tea',
      'mountain-red', 'mountain-purple', 'mountain-gold', '135-morandi',
      '135-guofeng', 'github-clean', 'typora-github', 'typora-vue',
      'vue-emerald', 'nordic-ice', 'typora-dark', 'default'
    );
  `;

  return true;
}

/**
 * Test Connection & Verify DB schema
 */
export async function testNeonConnection(connectionString) {
  if (!connectionString) throw new Error('请输入 Neon Postgres 数据库连接串');
  
  const sql = neon(connectionString.trim());
  const ping = await sql`SELECT NOW() as current_time, version();`;
  if (!ping || !ping[0]) {
    throw new Error('数据库无响应');
  }

  // Ensure all tables exist
  await initNeonTables(connectionString);

  // Count existing records
  const docCountRes = await sql`SELECT count(*)::int as count FROM nicemd_documents WHERE is_deleted = FALSE;`;
  const groupCountRes = await sql`SELECT count(*)::int as count FROM nicemd_groups WHERE is_deleted = FALSE;`;
  const historyCountRes = await sql`SELECT count(*)::int as count FROM nicemd_doc_histories WHERE is_deleted = FALSE;`;
  const themeCountRes = await sql`
    SELECT count(*)::int as count FROM nicemd_custom_themes 
    WHERE is_deleted = FALSE
    AND id NOT IN (
      'classic-indigo', 'mountain-warm', 'mountain-forest', 'mountain-tea',
      'mountain-red', 'mountain-purple', 'mountain-gold', '135-morandi',
      '135-guofeng', 'github-clean', 'typora-github', 'typora-vue',
      'vue-emerald', 'nordic-ice', 'typora-dark', 'default'
    );
  `;

  return {
    ok: true,
    dbVersion: ping[0].version,
    currentTime: ping[0].current_time,
    docCount: docCountRes[0]?.count || 0,
    groupCount: groupCountRes[0]?.count || 0,
    historyCount: historyCountRes[0]?.count || 0,
    themeCount: themeCountRes[0]?.count || 0
  };
}

/**
 * Pull all documents, groups, histories & custom themes from Neon Cloud
 */
export async function pullFromNeon(connectionString) {
  if (!connectionString) throw new Error('数据库连接串为空');
  const sql = neon(connectionString.trim());
  await ensureNeonTables(connectionString);

  // 1. Documents (all documents including recycle bin)
  const docsRows = await sql`
    SELECT id, title, markdown, group_id, theme_id, code_theme_id, font_size, custom_styles, is_favorite, sort_order, created_at, updated_at, is_deleted
    FROM nicemd_documents
    ORDER BY sort_order ASC, updated_at DESC;
  `;

  // 2. Groups
  const groupsRows = await sql`
    SELECT id, name, collapsed, sort_order, created_at, updated_at
    FROM nicemd_groups
    WHERE is_deleted = FALSE
    ORDER BY sort_order ASC, created_at ASC;
  `;

  // 3. Histories
  const historyRows = await sql`
    SELECT id, doc_id, title, name, type, content, custom_styles, char_count, word_count, line_count, created_at, updated_at
    FROM nicemd_doc_histories
    WHERE is_deleted = FALSE
    ORDER BY created_at DESC;
  `;

  // 4. Custom Themes
  const themeRows = await sql`
    SELECT id, name, icon, dark, description, tag, is_custom, custom_styles, styles, custom_css, created_at, updated_at
    FROM nicemd_custom_themes
    WHERE is_deleted = FALSE
    ORDER BY updated_at DESC;
  `;

  const docs = docsRows.map(r => {
    let customStyles = {};
    if (r.custom_styles) {
      try {
        customStyles = typeof r.custom_styles === 'string' ? JSON.parse(r.custom_styles) : r.custom_styles;
      } catch (e) {}
    }

    return {
      id: r.id,
      title: r.title || '无标题文档',
      content: r.markdown || '',
      markdown: r.markdown || '',
      groupId: r.group_id || null,
      themeId: r.theme_id || 'default',
      codeThemeId: r.code_theme_id || 'atom-one-dark',
      fontSize: r.font_size || '16px',
      customStyles: customStyles || {},
      isFavorite: Boolean(r.is_favorite),
      isDeleted: Boolean(r.is_deleted),
      sortOrder: r.sort_order || 0,
      createdAt: Number(r.created_at) || Date.now(),
      updatedAt: Number(r.updated_at) || Date.now()
    };
  });

  const groups = groupsRows.map(r => ({
    id: r.id,
    name: r.name || '新建分组',
    collapsed: Boolean(r.collapsed),
    sortOrder: r.sort_order || 0,
    createdAt: Number(r.created_at) || Date.now(),
    updatedAt: Number(r.updated_at) || Date.now()
  }));

  const histories = historyRows.map(r => {
    let customStyles = null;
    if (r.custom_styles && r.custom_styles !== '{}') {
      try {
        customStyles = typeof r.custom_styles === 'string' ? JSON.parse(r.custom_styles) : r.custom_styles;
      } catch (e) {}
    }
    return {
      id: r.id,
      docId: r.doc_id,
      title: r.title || '',
      name: r.name || (r.type === 'manual' ? '手动快照' : '自动保存'),
      type: r.type || 'auto',
      content: r.content || '',
      customStyles,
      charCount: Number(r.char_count) || 0,
      wordCount: Number(r.word_count) || 0,
      lineCount: Number(r.line_count) || 0,
      createdAt: Number(r.created_at) || Date.now(),
      updatedAt: Number(r.updated_at) || Number(r.created_at) || Date.now()
    };
  });

  const customThemes = themeRows.map(r => {
    let customStyles = {};
    let styles = {};
    try {
      customStyles = typeof r.custom_styles === 'string' ? JSON.parse(r.custom_styles) : (r.custom_styles || {});
    } catch (e) {}
    try {
      styles = typeof r.styles === 'string' ? JSON.parse(r.styles) : (r.styles || {});
    } catch (e) {}

    return {
      id: r.id,
      name: r.name || '自定义主题',
      icon: r.icon || 'Palette',
      dark: Boolean(r.dark),
      description: r.description || '用户自定义主题',
      tag: r.tag || '我的主题',
      isCustom: true,
      builtIn: false,
      customStyles,
      styles,
      customCss: r.custom_css || '',
      createdAt: Number(r.created_at) || Date.now(),
      updatedAt: Number(r.updated_at) || Date.now()
    };
  }).filter(t => t && t.id && !builtInThemeIds.has(t.id));

  return { docs, groups, histories, customThemes };
}

/**
 * Full Push: Backup all local groups, documents, histories & custom themes to Neon Cloud
 */
export async function pushAllToNeon(connectionString, localDocs = [], localGroups = [], localHistories = [], localCustomThemes = []) {
  if (!connectionString) throw new Error('数据库连接串为空');
  const sql = neon(connectionString.trim());
  await initNeonTables(connectionString);

  // 1. Push Groups
  for (const g of localGroups) {
    await sql`
      INSERT INTO nicemd_groups (id, name, collapsed, sort_order, created_at, updated_at, is_deleted)
      VALUES (
        ${g.id},
        ${g.name || '分组'},
        ${Boolean(g.collapsed)},
        ${g.sortOrder || 0},
        ${g.createdAt || Date.now()},
        ${g.updatedAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        collapsed = EXCLUDED.collapsed,
        sort_order = EXCLUDED.sort_order,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
  }

  // 2. Push Documents
  for (const d of localDocs) {
    const customStylesJson = JSON.stringify(d.customStyles || {});
    await sql`
      INSERT INTO nicemd_documents (
        id, title, markdown, group_id, theme_id, code_theme_id, font_size, custom_styles, is_favorite, sort_order, created_at, updated_at, is_deleted
      )
      VALUES (
        ${d.id},
        ${d.title || ''},
        ${d.content || d.markdown || ''},
        ${d.groupId || null},
        ${d.themeId || 'default'},
        ${d.codeThemeId || 'atom-one-dark'},
        ${d.fontSize || '16px'},
        ${customStylesJson},
        ${Boolean(d.isFavorite)},
        ${d.sortOrder || 0},
        ${d.createdAt || Date.now()},
        ${d.updatedAt || Date.now()},
        ${Boolean(d.isDeleted || d.is_deleted)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        markdown = EXCLUDED.markdown,
        group_id = EXCLUDED.group_id,
        theme_id = EXCLUDED.theme_id,
        code_theme_id = EXCLUDED.code_theme_id,
        font_size = EXCLUDED.font_size,
        custom_styles = EXCLUDED.custom_styles,
        is_favorite = EXCLUDED.is_favorite,
        sort_order = EXCLUDED.sort_order,
        updated_at = EXCLUDED.updated_at,
        is_deleted = EXCLUDED.is_deleted;
    `;
  }

  // 3. Push Histories
  for (const h of localHistories) {
    const customStylesJson = JSON.stringify(h.customStyles || {});
    await sql`
      INSERT INTO nicemd_doc_histories (
        id, doc_id, title, name, type, content, custom_styles, char_count, word_count, line_count, created_at, updated_at, is_deleted
      )
      VALUES (
        ${h.id},
        ${h.docId},
        ${h.title || ''},
        ${h.name || ''},
        ${h.type || 'auto'},
        ${h.content || ''},
        ${customStylesJson},
        ${h.charCount || 0},
        ${h.wordCount || 0},
        ${h.lineCount || 0},
        ${h.createdAt || Date.now()},
        ${h.updatedAt || h.createdAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        content = EXCLUDED.content,
        custom_styles = EXCLUDED.custom_styles,
        char_count = EXCLUDED.char_count,
        word_count = EXCLUDED.word_count,
        line_count = EXCLUDED.line_count,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
  }

  // 4. Push Custom Themes (Only user-created "另存为" custom themes, NEVER built-in presets)
  const validCustomThemes = (localCustomThemes || []).filter(t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || t.id.startsWith('custom-')));
  for (const t of validCustomThemes) {
    const customStylesJson = JSON.stringify(t.customStyles || {});
    const stylesJson = JSON.stringify(t.styles || {});
    await sql`
      INSERT INTO nicemd_custom_themes (
        id, name, icon, dark, description, tag, is_custom, custom_styles, styles, custom_css, created_at, updated_at, is_deleted
      )
      VALUES (
        ${t.id},
        ${t.name || '自定义主题'},
        ${t.icon || 'Palette'},
        ${Boolean(t.dark)},
        ${t.description || '用户自定义主题'},
        ${t.tag || '我的主题'},
        TRUE,
        ${customStylesJson},
        ${stylesJson},
        ${t.customCss || ''},
        ${t.createdAt || Date.now()},
        ${t.updatedAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        icon = EXCLUDED.icon,
        dark = EXCLUDED.dark,
        description = EXCLUDED.description,
        tag = EXCLUDED.tag,
        custom_styles = EXCLUDED.custom_styles,
        styles = EXCLUDED.styles,
        custom_css = EXCLUDED.custom_css,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
  }

  setLastSyncTime();
  return {
    pushedDocs: localDocs.length,
    pushedGroups: localGroups.length,
    pushedHistories: localHistories.length,
    pushedThemes: localCustomThemes.length
  };
}

/**
 * Intelligent Two-Way Incremental Sync across all 4 entities
 * Reconciles local and cloud data based on unique ID + updatedAt timestamps.
 */
export async function syncNeonBidirectional(
  connectionString,
  localDocs = [],
  localGroups = [],
  localHistories = [],
  localCustomThemes = []
) {
  if (!connectionString) throw new Error('数据库连接串为空');
  const sql = neon(connectionString.trim());
  await initNeonTables(connectionString);

  // 1. Pull current cloud state
  const {
    docs: cloudDocs,
    groups: cloudGroups,
    histories: cloudHistories,
    customThemes: cloudThemes
  } = await pullFromNeon(connectionString);

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
      if ((local.updatedAt || 0) >= (cloud.updatedAt || 0)) {
        mergedGroups.push(local);
        if ((local.updatedAt || 0) > (cloud.updatedAt || 0)) groupsToUpload.push(local);
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
      if ((local.updatedAt || 0) >= (cloud.updatedAt || 0)) {
        mergedDocs.push(local);
        if ((local.updatedAt || 0) > (cloud.updatedAt || 0)) docsToUpload.push(local);
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
  const validLocalThemes = (localCustomThemes || []).filter(t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || t.id.startsWith('custom-')));
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

  // 2. Upload newer local items to cloud
  for (const g of groupsToUpload) {
    await sql`
      INSERT INTO nicemd_groups (id, name, collapsed, sort_order, created_at, updated_at, is_deleted)
      VALUES (
        ${g.id},
        ${g.name || '分组'},
        ${Boolean(g.collapsed)},
        ${g.sortOrder || 0},
        ${g.createdAt || Date.now()},
        ${g.updatedAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        collapsed = EXCLUDED.collapsed,
        sort_order = EXCLUDED.sort_order,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
  }

  for (const d of docsToUpload) {
    const customStylesJson = JSON.stringify(d.customStyles || {});
    await sql`
      INSERT INTO nicemd_documents (
        id, title, markdown, group_id, theme_id, code_theme_id, font_size, custom_styles, is_favorite, sort_order, created_at, updated_at, is_deleted
      )
      VALUES (
        ${d.id},
        ${d.title || ''},
        ${d.content || d.markdown || ''},
        ${d.groupId || null},
        ${d.themeId || 'default'},
        ${d.codeThemeId || 'atom-one-dark'},
        ${d.fontSize || '16px'},
        ${customStylesJson},
        ${Boolean(d.isFavorite)},
        ${d.sortOrder || 0},
        ${d.createdAt || Date.now()},
        ${d.updatedAt || Date.now()},
        ${Boolean(d.isDeleted || d.is_deleted)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        markdown = EXCLUDED.markdown,
        group_id = EXCLUDED.group_id,
        theme_id = EXCLUDED.theme_id,
        code_theme_id = EXCLUDED.code_theme_id,
        font_size = EXCLUDED.font_size,
        custom_styles = EXCLUDED.custom_styles,
        is_favorite = EXCLUDED.is_favorite,
        sort_order = EXCLUDED.sort_order,
        updated_at = EXCLUDED.updated_at,
        is_deleted = EXCLUDED.is_deleted;
    `;
  }

  for (const h of historiesToUpload) {
    const customStylesJson = JSON.stringify(h.customStyles || {});
    await sql`
      INSERT INTO nicemd_doc_histories (
        id, doc_id, title, name, type, content, custom_styles, char_count, word_count, line_count, created_at, updated_at, is_deleted
      )
      VALUES (
        ${h.id},
        ${h.docId},
        ${h.title || ''},
        ${h.name || ''},
        ${h.type || 'auto'},
        ${h.content || ''},
        ${customStylesJson},
        ${h.charCount || 0},
        ${h.wordCount || 0},
        ${h.lineCount || 0},
        ${h.createdAt || Date.now()},
        ${h.updatedAt || h.createdAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        content = EXCLUDED.content,
        custom_styles = EXCLUDED.custom_styles,
        char_count = EXCLUDED.char_count,
        word_count = EXCLUDED.word_count,
        line_count = EXCLUDED.line_count,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
  }

  for (const t of themesToUpload) {
    const customStylesJson = JSON.stringify(t.customStyles || {});
    const stylesJson = JSON.stringify(t.styles || {});
    await sql`
      INSERT INTO nicemd_custom_themes (
        id, name, icon, dark, description, tag, is_custom, custom_styles, styles, custom_css, created_at, updated_at, is_deleted
      )
      VALUES (
        ${t.id},
        ${t.name || '自定义主题'},
        ${t.icon || 'Palette'},
        ${Boolean(t.dark)},
        ${t.description || '用户自定义主题'},
        ${t.tag || '我的主题'},
        TRUE,
        ${customStylesJson},
        ${stylesJson},
        ${t.customCss || ''},
        ${t.createdAt || Date.now()},
        ${t.updatedAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        icon = EXCLUDED.icon,
        dark = EXCLUDED.dark,
        description = EXCLUDED.description,
        tag = EXCLUDED.tag,
        custom_styles = EXCLUDED.custom_styles,
        styles = EXCLUDED.styles,
        custom_css = EXCLUDED.custom_css,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
  }

  setLastSyncTime();

  return {
    docs: mergedDocs,
    groups: mergedGroups,
    histories: mergedHistories,
    customThemes: mergedThemes,
    stats: {
      uploadedDocs: docsToUpload.length,
      uploadedGroups: groupsToUpload.length,
      uploadedHistories: historiesToUpload.length,
      uploadedThemes: themesToUpload.length,
      totalDocs: mergedDocs.length,
      totalGroups: mergedGroups.length,
      totalHistories: mergedHistories.length,
      totalThemes: mergedThemes.length
    }
  };
}

/**
 * Fast single document upsert to Neon
 */
export async function syncSingleDocToNeon(connectionString, doc) {
  if (!connectionString || !doc) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const sql = neon(conn);
    const customStylesJson = JSON.stringify(doc.customStyles || {});
    await sql`
      INSERT INTO nicemd_documents (
        id, title, markdown, group_id, theme_id, code_theme_id, font_size, custom_styles, is_favorite, sort_order, created_at, updated_at, is_deleted
      )
      VALUES (
        ${doc.id},
        ${doc.title || ''},
        ${doc.content ?? doc.markdown ?? ''},
        ${doc.groupId || null},
        ${doc.themeId || 'default'},
        ${doc.codeThemeId || 'atom-one-dark'},
        ${doc.fontSize || '16px'},
        ${customStylesJson},
        ${Boolean(doc.isFavorite)},
        ${doc.sortOrder || 0},
        ${doc.createdAt || Date.now()},
        ${doc.updatedAt || Date.now()},
        ${Boolean(doc.isDeleted)}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        markdown = EXCLUDED.markdown,
        group_id = EXCLUDED.group_id,
        theme_id = EXCLUDED.theme_id,
        code_theme_id = EXCLUDED.code_theme_id,
        font_size = EXCLUDED.font_size,
        custom_styles = EXCLUDED.custom_styles,
        is_favorite = EXCLUDED.is_favorite,
        sort_order = EXCLUDED.sort_order,
        updated_at = EXCLUDED.updated_at,
        is_deleted = EXCLUDED.is_deleted;
    `;
    setLastSyncTime();
  };

  try {
    await ensureNeonTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initNeonTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[Neon Sync] Fast doc sync error:', retryErr);
    }
  }
}

/**
 * Fast single group upsert to Neon
 */
export async function syncSingleGroupToNeon(connectionString, group) {
  if (!connectionString || !group) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const sql = neon(conn);
    await sql`
      INSERT INTO nicemd_groups (id, name, collapsed, sort_order, created_at, updated_at, is_deleted)
      VALUES (
        ${group.id},
        ${group.name || '分组'},
        ${Boolean(group.collapsed)},
        ${group.sortOrder || 0},
        ${group.createdAt || Date.now()},
        ${group.updatedAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        collapsed = EXCLUDED.collapsed,
        sort_order = EXCLUDED.sort_order,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
    setLastSyncTime();
  };

  try {
    await ensureNeonTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initNeonTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[Neon Sync] Fast group sync error:', retryErr);
    }
  }
}

/**
 * Fast single history snapshot upsert to Neon
 */
export async function syncSingleHistoryToNeon(connectionString, history) {
  if (!connectionString || !history) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const sql = neon(conn);
    const customStylesJson = JSON.stringify(history.customStyles || {});
    await sql`
      INSERT INTO nicemd_doc_histories (
        id, doc_id, title, name, type, content, custom_styles, char_count, word_count, line_count, created_at, updated_at, is_deleted
      )
      VALUES (
        ${history.id},
        ${history.docId},
        ${history.title || ''},
        ${history.name || ''},
        ${history.type || 'auto'},
        ${history.content || ''},
        ${customStylesJson},
        ${history.charCount || 0},
        ${history.wordCount || 0},
        ${history.lineCount || 0},
        ${history.createdAt || Date.now()},
        ${history.updatedAt || history.createdAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        content = EXCLUDED.content,
        custom_styles = EXCLUDED.custom_styles,
        char_count = EXCLUDED.char_count,
        word_count = EXCLUDED.word_count,
        line_count = EXCLUDED.line_count,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
    setLastSyncTime();
  };

  try {
    await ensureNeonTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initNeonTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[Neon Sync] Fast history sync error:', retryErr);
    }
  }
}

/**
 * Fast single custom theme upsert to Neon
 */
export async function syncSingleCustomThemeToNeon(connectionString, theme) {
  if (!connectionString || !theme || !theme.id || builtInThemeIds.has(theme.id) || (!theme.isCustom && !theme.id.startsWith('custom-'))) return;
  const conn = connectionString.trim();
  const executeInsert = async () => {
    const sql = neon(conn);
    const customStylesJson = JSON.stringify(theme.customStyles || {});
    const stylesJson = JSON.stringify(theme.styles || {});
    await sql`
      INSERT INTO nicemd_custom_themes (
        id, name, icon, dark, description, tag, is_custom, custom_styles, styles, custom_css, created_at, updated_at, is_deleted
      )
      VALUES (
        ${theme.id},
        ${theme.name || '自定义主题'},
        ${theme.icon || 'Palette'},
        ${Boolean(theme.dark)},
        ${theme.description || '用户自定义主题'},
        ${theme.tag || '我的主题'},
        TRUE,
        ${customStylesJson},
        ${stylesJson},
        ${theme.customCss || ''},
        ${theme.createdAt || Date.now()},
        ${theme.updatedAt || Date.now()},
        FALSE
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        icon = EXCLUDED.icon,
        dark = EXCLUDED.dark,
        description = EXCLUDED.description,
        tag = EXCLUDED.tag,
        custom_styles = EXCLUDED.custom_styles,
        styles = EXCLUDED.styles,
        custom_css = EXCLUDED.custom_css,
        updated_at = EXCLUDED.updated_at,
        is_deleted = FALSE;
    `;
    setLastSyncTime();
  };

  try {
    await ensureNeonTables(conn);
    await executeInsert();
  } catch (err) {
    try {
      await initNeonTables(conn);
      tablesEnsuredFor = conn;
      await executeInsert();
    } catch (retryErr) {
      console.warn('[Neon Sync] Fast custom theme sync error:', retryErr);
    }
  }
}

/**
 * Convenient Realtime Sync triggers for immediate UI actions
 */
export function realtimeSyncDoc(doc) {
  if (!isNeonSyncEnabled() || !doc) return;
  const config = getNeonConfig();
  syncSingleDocToNeon(config.connectionString, doc);
}

export function realtimeSyncGroup(group) {
  if (!isNeonSyncEnabled() || !group) return;
  const config = getNeonConfig();
  syncSingleGroupToNeon(config.connectionString, group);
}

export function realtimeSyncHistory(history) {
  if (!isNeonSyncEnabled() || !history) return;
  const config = getNeonConfig();
  syncSingleHistoryToNeon(config.connectionString, history);
}

export function realtimeSyncCustomTheme(theme) {
  if (!isNeonSyncEnabled() || !theme) return;
  const config = getNeonConfig();
  syncSingleCustomThemeToNeon(config.connectionString, theme);
}

/**
 * Deletions
 */
export function realtimeDeleteDoc(docId) {
  if (!isNeonSyncEnabled() || !docId) return;
  const config = getNeonConfig();
  deleteDocInNeon(config.connectionString, docId);
}

export function realtimeDeleteGroup(groupId) {
  if (!isNeonSyncEnabled() || !groupId) return;
  const config = getNeonConfig();
  deleteGroupInNeon(config.connectionString, groupId);
}

export function realtimeDeleteHistory(historyId) {
  if (!isNeonSyncEnabled() || !historyId) return;
  const config = getNeonConfig();
  deleteHistoryInNeon(config.connectionString, historyId);
}

export function realtimeClearDocHistories(docId) {
  if (!isNeonSyncEnabled() || !docId) return;
  const config = getNeonConfig();
  clearDocHistoriesInNeon(config.connectionString, docId);
}

export function realtimeDeleteCustomTheme(themeId) {
  if (!isNeonSyncEnabled() || !themeId) return;
  const config = getNeonConfig();
  deleteCustomThemeInNeon(config.connectionString, themeId);
}

export async function deleteDocInNeon(connectionString, docId) {
  if (!connectionString || !docId) return;
  try {
    await ensureNeonTables(connectionString);
    const sql = neon(connectionString.trim());
    await sql`
      UPDATE nicemd_documents 
      SET is_deleted = TRUE, updated_at = ${Date.now()}
      WHERE id = ${docId};
    `;
  } catch (e) {
    console.warn('[Neon Sync] Failed to delete document in cloud:', e);
  }
}

export async function permanentDeleteDocInNeon(connectionString, docId) {
  if (!connectionString || !docId) return;
  try {
    await ensureNeonTables(connectionString);
    const sql = neon(connectionString.trim());
    await sql`
      DELETE FROM nicemd_documents 
      WHERE id = ${docId};
    `;
  } catch (e) {
    console.warn('[Neon Sync] Failed to permanently delete document in cloud:', e);
  }
}

export async function deleteGroupInNeon(connectionString, groupId) {
  if (!connectionString || !groupId) return;
  try {
    await ensureNeonTables(connectionString);
    const sql = neon(connectionString.trim());
    // Hard delete group
    await sql`
      DELETE FROM nicemd_groups 
      WHERE id = ${groupId};
    `;
    // Set docs under this group to ungrouped (null)
    await sql`
      UPDATE nicemd_documents 
      SET group_id = NULL 
      WHERE group_id = ${groupId};
    `;
  } catch (e) {
    console.warn('[Neon Sync] Failed to delete group in cloud:', e);
  }
}

export async function deleteHistoryInNeon(connectionString, historyId) {
  if (!connectionString || !historyId) return;
  try {
    await ensureNeonTables(connectionString);
    const sql = neon(connectionString.trim());
    await sql`
      UPDATE nicemd_doc_histories 
      SET is_deleted = TRUE, updated_at = ${Date.now()}
      WHERE id = ${historyId};
    `;
  } catch (e) {
    console.warn('[Neon Sync] Failed to delete history in cloud:', e);
  }
}

export async function clearDocHistoriesInNeon(connectionString, docId) {
  if (!connectionString || !docId) return;
  try {
    await ensureNeonTables(connectionString);
    const sql = neon(connectionString.trim());
    await sql`
      UPDATE nicemd_doc_histories 
      SET is_deleted = TRUE, updated_at = ${Date.now()}
      WHERE doc_id = ${docId};
    `;
  } catch (e) {
    console.warn('[Neon Sync] Failed to clear doc histories in cloud:', e);
  }
}

export async function deleteCustomThemeInNeon(connectionString, themeId) {
  if (!connectionString || !themeId) return;
  try {
    await ensureNeonTables(connectionString);
    const sql = neon(connectionString.trim());
    await sql`
      UPDATE nicemd_custom_themes 
      SET is_deleted = TRUE, updated_at = ${Date.now()}
      WHERE id = ${themeId};
    `;
  } catch (e) {
    console.warn('[Neon Sync] Failed to delete custom theme in cloud:', e);
  }
}

// Debounce timer for background auto sync
let autoSyncTimer = null;

export function triggerAutoSyncDebounced(docs, groups, histories = [], customThemes = [], onSyncStart, onSyncEnd) {
  if (!isNeonSyncEnabled()) return;
  const config = getNeonConfig();
  if (!config.autoSync) return;

  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer);
  }

  autoSyncTimer = setTimeout(async () => {
    try {
      if (typeof onSyncStart === 'function') onSyncStart();
      const res = await syncNeonBidirectional(config.connectionString, docs, groups, histories, customThemes);
      if (typeof onSyncEnd === 'function') onSyncEnd(null, res);
    } catch (err) {
      console.warn('[Neon Auto-Sync] Sync failed:', err);
      if (typeof onSyncEnd === 'function') onSyncEnd(err);
    }
  }, 2000);
}
