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
const MAX_SNAPSHOTS_PER_DOC = 15;

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
  if (!docId) return [];
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + docId);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(0, MAX_SNAPSHOTS_PER_DOC) : [];
  } catch (e) {
    console.warn('[NiceMD] Failed to get doc snapshots:', e);
    return [];
  }
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
            all.push(...list.slice(0, MAX_SNAPSHOTS_PER_DOC));
          }
        }
      }
    }
  } catch (e) {
    console.warn('[NiceMD] Failed to load all doc snapshots:', e);
  }
  return all;
}

/**
 * Saves snapshots array for a document
 */
export function saveDocSnapshots(docId, snapshots) {
  if (!docId) return;
  const limited = (Array.isArray(snapshots) ? snapshots : []).slice(0, MAX_SNAPSHOTS_PER_DOC);
  try {
    localStorage.setItem(HISTORY_PREFIX + docId, JSON.stringify(limited));
  } catch (e) {
    // If quota exceeded, prune to manual or top 10 and try again
    try {
      const pruned = limited.filter((s, idx) => s.type === 'manual' || idx < 10);
      localStorage.setItem(HISTORY_PREFIX + docId, JSON.stringify(pruned));
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
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveDocSnapshots(docId, list.slice(0, MAX_SNAPSHOTS_PER_DOC));
  }
}

/**
 * Creates a new snapshot if content is meaningfully different from the latest one
 */
export function createSnapshot(docId, title, content = '', customStyles = null, type = 'auto', name = '') {
  if (!docId) return null;
  const snapshots = getDocSnapshots(docId);
  const stats = getStats(content);

  // If there's a latest snapshot, check if content has actually changed
  if (snapshots.length > 0) {
    const latest = snapshots[0];
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

  // Prepend to list (latest first)
  snapshots.unshift(snapshot);

  // Prune if exceeding limit (keep manual snapshots if possible, total capped at MAX_SNAPSHOTS_PER_DOC)
  if (snapshots.length > MAX_SNAPSHOTS_PER_DOC) {
    const manualSnaps = snapshots.filter(s => s.type === 'manual');
    const autoSnaps = snapshots.filter(s => s.type === 'auto').slice(0, Math.max(0, MAX_SNAPSHOTS_PER_DOC - manualSnaps.length));
    const combined = [...manualSnaps, ...autoSnaps].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, MAX_SNAPSHOTS_PER_DOC);
    saveDocSnapshots(docId, combined);
  } else {
    saveDocSnapshots(docId, snapshots);
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
