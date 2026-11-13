import { logger } from './logger.js';
/**
 * docHistory.js - Document version snapshot persistence & history manager
 * Handles creating auto/manual snapshots, retrieving timeline, restoring, renaming, and deleting.
 * Integrated with Neon Cloud Database for instant multi-device synchronization.
 */

import {
  realtimeSyncHistory,
  realtimeDeleteHistory,
  realtimeClearDocHistories
} from './cloudSync';

const HISTORY_PREFIX = 'nicemd_history_';
export const MAX_SNAPSHOTS_PER_DOC = 10;
const QUOTA_FALLBACK_LIMIT = Math.max(1, Math.floor(MAX_SNAPSHOTS_PER_DOC / 2));

function readRawDocSnapshots(docId) {
  if (!docId) return [];
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + docId);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    logger.warn('[NiceMD] Failed to get doc snapshots:', e);
    return [];
  }
}

function pruneDocSnapshots(snapshots = [], maxCount = MAX_SNAPSHOTS_PER_DOC) {
  const list = (Array.isArray(snapshots) ? snapshots : []).filter(Boolean);
  const byNewest = (a, b) => (b.createdAt || 0) - (a.createdAt || 0);
  if (list.length <= maxCount) {
    return { kept: [...list].sort(byNewest), removed: [] };
  }

  const manualSnaps = list
    .filter(s => s.type === 'manual')
    .sort(byNewest)
    .slice(0, maxCount);
  const manualIds = new Set(manualSnaps.map(s => s.id));
  const autoLimit = Math.max(0, maxCount - manualSnaps.length);
  const autoSnaps = list
    .filter(s => !manualIds.has(s.id))
    .sort(byNewest)
    .slice(0, autoLimit);

  const kept = [...manualSnaps, ...autoSnaps].sort(byNewest);
  const keptIds = new Set(kept.map(s => s.id));
  const removed = list.filter(s => s.id && !keptIds.has(s.id));
  return { kept, removed };
}

/**
 * Calculates character and word count statistics
 */
export function getStats(text = '') {
  const charCount = text.length;
  const wordCount = (text.match(/[\w\u4e00-\u9fa5]+/g) || []).length;
  const lineCount = text.split('\n').length;
  return { charCount, wordCount, lineCount };
}

/**
 * Returns all snapshots for a given document
 */
export function getDocSnapshots(docId) {
  return pruneDocSnapshots(readRawDocSnapshots(docId)).kept;
}

/**
 * Returns all snapshots across all documents in local storage
 */
export function getAllDocSnapshots() {
  const all = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(HISTORY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            all.push(...pruneDocSnapshots(list).kept);
          }
        }
      }
    }
  } catch (e) {
    logger.warn('[NiceMD] Failed to load all doc snapshots:', e);
  }
  return all;
}

/**
 * Saves snapshots array for a document
 */
export function saveDocSnapshots(docId, snapshots) {
  if (!docId) return;
  const { kept } = pruneDocSnapshots(snapshots);
  try {
    localStorage.setItem(HISTORY_PREFIX + docId, JSON.stringify(kept));
  } catch (e) {
    try {
      const { kept: fallbackKept } = pruneDocSnapshots(kept, QUOTA_FALLBACK_LIMIT);
      localStorage.setItem(HISTORY_PREFIX + docId, JSON.stringify(fallbackKept));
    } catch {}
  }
}

/**
 * Saves a flat list of histories back into localStorage grouped by docId
 */
export function saveAllDocSnapshots(allHistories = []) {
  if (!Array.isArray(allHistories)) return;
  const map = new Map();
  for (const h of allHistories) {
    if (!h.docId) continue;
    if (!map.has(h.docId)) {
      map.set(h.docId, []);
    }
    map.get(h.docId).push(h);
  }

  for (const [docId, list] of map.entries()) {
    saveDocSnapshots(docId, list);
  }
}

/**
 * Creates a new snapshot if content is meaningfully different from the latest one
 */
export function createSnapshot(docId, title, content = '', customStyles = null, type = 'auto', name = '') {
  if (!docId) return null;
  const rawSnapshots = readRawDocSnapshots(docId);
  const currentKept = pruneDocSnapshots(rawSnapshots).kept;
  const stats = getStats(content);

  // If there's a latest snapshot, check if content has actually changed
  if (currentKept.length > 0) {
    const latest = currentKept[0];
    if (latest.content === content && latest.title === title && type === 'auto') {
      return null; // Skip redundant snapshot
    }
  }

  const snapshot = {
    id: 'snap_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8),
    docId,
    title: title || '未命名文档',
    content,
    customStyles: customStyles ? JSON.parse(JSON.stringify(customStyles)) : null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    type: type || 'auto', // 'auto' | 'manual'
    name: name ? name.trim() : (type === 'manual' ? '手动快照' : '自动保存'),
    charCount: stats.charCount,
    wordCount: stats.wordCount,
    lineCount: stats.lineCount
  };

  const { kept, removed } = pruneDocSnapshots([snapshot, ...rawSnapshots]);
  if (!kept.some(s => s.id === snapshot.id)) {
    return null;
  }

  saveDocSnapshots(docId, kept);
  for (const evicted of removed) {
    realtimeDeleteHistory(evicted.id);
  }

  // Realtime Cloud Sync
  realtimeSyncHistory(snapshot);

  return snapshot;
}

/**
 * Renames / labels a snapshot
 */
export function renameSnapshot(docId, snapshotId, newName) {
  const snapshots = getDocSnapshots(docId);
  const target = snapshots.find(s => s.id === snapshotId);
  if (target) {
    target.name = (newName || '').trim() || (target.type === 'manual' ? '手动快照' : '自动保存');
    target.type = 'manual'; // User manually labeled it
    target.updatedAt = Date.now();
    saveDocSnapshots(docId, snapshots);
    realtimeSyncHistory(target);
    return true;
  }
  return false;
}

/**
 * Deletes a snapshot
 */
export function deleteSnapshot(docId, snapshotId) {
  let snapshots = getDocSnapshots(docId);
  snapshots = snapshots.filter(s => s.id !== snapshotId);
  saveDocSnapshots(docId, snapshots);
  realtimeDeleteHistory(snapshotId);
  return snapshots;
}

/**
 * Clears all snapshots for a document
 */
export function clearDocSnapshots(docId) {
  try {
    localStorage.removeItem(HISTORY_PREFIX + docId);
  } catch {}
  realtimeClearDocHistories(docId);
}

/**
 * Human friendly relative time formatter for history items
 */
export function formatRelativeTime(ts) {
  if (!ts) return '';
  const now = Date.now();
  const diff = now - ts;

  if (diff < 60 * 1000) {
    return '刚刚';
  } else if (diff < 60 * 60 * 1000) {
    const min = Math.floor(diff / (60 * 1000));
    return `${min} 分钟前`;
  } else if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} 小时前`;
  }

  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${month}-${date} ${hours}:${minutes}`;
}
