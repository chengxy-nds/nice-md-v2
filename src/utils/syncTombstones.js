/**
 * Cross-provider deletion tombstone tracker.
 * Prevents deleted documents/groups/histories/themes from being resurrected by
 * in-flight async sync responses or delayed multi-device synchronization.
 */

const TOMBSTONE_STORAGE_KEY = 'nicemd_sync_tombstones_v1';
const LEGACY_GITHUB_TOMBSTONE_KEY = 'nicemd_github_tombstones_v1';
const TOMBSTONE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const VALID_KINDS = ['docs', 'groups', 'histories', 'clearedHistoryDocs', 'themes'];

const knownEntityUpdatedAt = new Map();

function emptyTombstones() {
  return {
    docs: {},
    groups: {},
    histories: {},
    clearedHistoryDocs: {},
    themes: {},
  };
}

export function pruneTombstones(tombstones = {}) {
  const cutoff = Date.now() - TOMBSTONE_RETENTION_MS;
  const cleanBucket = (bucket = {}) => {
    const out = {};
    for (const [id, ts] of Object.entries(bucket || {})) {
      const num = Number(ts) || 0;
      if (num > cutoff) out[id] = num;
    }
    return out;
  };
  return {
    docs: cleanBucket(tombstones.docs),
    groups: cleanBucket(tombstones.groups),
    histories: cleanBucket(tombstones.histories),
    clearedHistoryDocs: cleanBucket(tombstones.clearedHistoryDocs),
    themes: cleanBucket(tombstones.themes),
  };
}

export function mergeTombstoneMaps(localMap = {}, remoteMap = {}) {
  const merged = { ...(remoteMap || {}) };
  for (const [id, ts] of Object.entries(localMap || {})) {
    const num = Number(ts) || 0;
    if (num > (Number(merged[id]) || 0)) {
      merged[id] = num;
    }
  }
  return merged;
}

export function mergeAllTombstones(local = {}, remote = {}) {
  return {
    docs: mergeTombstoneMaps(local.docs, remote.docs),
    groups: mergeTombstoneMaps(local.groups, remote.groups),
    histories: mergeTombstoneMaps(local.histories, remote.histories),
    clearedHistoryDocs: mergeTombstoneMaps(local.clearedHistoryDocs, remote.clearedHistoryDocs),
    themes: mergeTombstoneMaps(local.themes, remote.themes),
  };
}

export function loadSyncTombstones() {
  let result = emptyTombstones();
  try {
    const raw = localStorage.getItem(TOMBSTONE_STORAGE_KEY);
    if (raw) {
      result = pruneTombstones(JSON.parse(raw));
    }
    // Migrate legacy GitHub-only tombstones once if present.
    const legacyRaw = localStorage.getItem(LEGACY_GITHUB_TOMBSTONE_KEY);
    if (legacyRaw) {
      const legacyParsed = pruneTombstones(JSON.parse(legacyRaw));
      result = mergeAllTombstones(result, legacyParsed);
      localStorage.setItem(TOMBSTONE_STORAGE_KEY, JSON.stringify(result));
      localStorage.removeItem(LEGACY_GITHUB_TOMBSTONE_KEY);
    }
  } catch {
    // ignore corrupted localStorage
  }
  return result;
}

export function saveSyncTombstones(tombstones) {
  try {
    localStorage.setItem(TOMBSTONE_STORAGE_KEY, JSON.stringify(pruneTombstones(tombstones)));
  } catch {}
}

export function recordEntityTimestamps(docs = [], groups = [], histories = [], themes = []) {
  for (const d of docs) if (d?.id) knownEntityUpdatedAt.set(`docs:${d.id}`, Number(d.updatedAt || d.createdAt) || 0);
  for (const g of groups) if (g?.id) knownEntityUpdatedAt.set(`groups:${g.id}`, Number(g.updatedAt || g.createdAt) || 0);
  for (const h of histories) if (h?.id) knownEntityUpdatedAt.set(`histories:${h.id}`, Number(h.updatedAt || h.createdAt) || 0);
  for (const t of themes) if (t?.id) knownEntityUpdatedAt.set(`themes:${t.id}`, Number(t.updatedAt || t.createdAt) || 0);
}

export function recordDeletedTombstonesBatch(kind, ids = []) {
  if (!VALID_KINDS.includes(kind) || !Array.isArray(ids) || ids.length === 0) return;
  const tombstones = loadSyncTombstones();
  const now = Date.now();
  let changed = false;

  for (const id of ids) {
    if (!id) continue;
    const knownFloor = knownEntityUpdatedAt.get(`${kind}:${id}`) || 0;
    const deletedAt = Math.max(now, knownFloor + 1);
    if (deletedAt > (Number(tombstones[kind][id]) || 0)) {
      tombstones[kind][id] = deletedAt;
      changed = true;
    }
  }

  if (changed) {
    saveSyncTombstones(tombstones);
  }
}

export function recordDeletedTombstone(kind, id) {
  if (!id) return;
  recordDeletedTombstonesBatch(kind, [id]);
}

export function clearDeletedTombstone(kind, id) {
  if (!VALID_KINDS.includes(kind) || !id) return;
  const tombstones = loadSyncTombstones();
  if (tombstones[kind] && id in tombstones[kind]) {
    delete tombstones[kind][id];
    saveSyncTombstones(tombstones);
  }
}

/**
 * Filter out any incoming remote entities that were already permanently deleted locally.
 */
export function filterOutTombstonedEntities(kind, items = [], getTs = (item) => item?.updatedAt || item?.createdAt || 0) {
  if (!VALID_KINDS.includes(kind) || !Array.isArray(items) || items.length === 0) return items;
  const bucket = loadSyncTombstones()[kind] || {};
  if (Object.keys(bucket).length === 0) return items;

  return items.filter((item) => {
    if (!item?.id) return false;
    const deletedAt = Number(bucket[item.id]) || 0;
    if (!deletedAt) return true;
    const itemTs = Number(getTs(item)) || 0;
    return itemTs > deletedAt;
  });
}

