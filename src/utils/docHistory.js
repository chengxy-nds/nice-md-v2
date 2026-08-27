/**
 * docHistory.js - Document version snapshot persistence & history manager
 * Handles creating auto/manual snapshots, retrieving timeline, restoring, renaming, and deleting.
 */

const HISTORY_PREFIX = 'nicemd_history_';
const MAX_SNAPSHOTS_PER_DOC = 50;

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
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('[NiceMD] Failed to get doc snapshots:', e);
    return [];
  }
}

/**
 * Saves snapshots array for a document
 */
function saveDocSnapshots(docId, snapshots) {
  if (!docId) return;
  try {
    localStorage.setItem(HISTORY_PREFIX + docId, JSON.stringify(snapshots));
  } catch (e) {
    // If quota exceeded, prune oldest auto snapshots and try again
    try {
      const pruned = snapshots.filter((s, idx) => s.type === 'manual' || idx < 20);
      localStorage.setItem(HISTORY_PREFIX + docId, JSON.stringify(pruned));
    } catch {}
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
    id: 'snap_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    docId,
    title: title || '未命名文档',
    content,
    customStyles: customStyles ? JSON.parse(JSON.stringify(customStyles)) : null,
    createdAt: Date.now(),
    type: type || 'auto', // 'auto' | 'manual'
    name: name ? name.trim() : (type === 'manual' ? '手动快照' : '自动保存'),
    charCount: stats.charCount,
    wordCount: stats.wordCount,
    lineCount: stats.lineCount
  };

  // Prepend to list (latest first)
  snapshots.unshift(snapshot);

  // Prune if exceeding limit (keep manual snapshots if possible)
  if (snapshots.length > MAX_SNAPSHOTS_PER_DOC) {
    const manualSnaps = snapshots.filter(s => s.type === 'manual');
    const autoSnaps = snapshots.filter(s => s.type === 'auto').slice(0, MAX_SNAPSHOTS_PER_DOC - manualSnaps.length);
    const combined = [...manualSnaps, ...autoSnaps].sort((a, b) => b.createdAt - a.createdAt);
    saveDocSnapshots(docId, combined);
    return snapshot;
  }

  saveDocSnapshots(docId, snapshots);
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
    saveDocSnapshots(docId, snapshots);
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
  return snapshots;
}

/**
 * Clears all snapshots for a document
 */
export function clearDocSnapshots(docId) {
  try {
    localStorage.removeItem(HISTORY_PREFIX + docId);
  } catch {}
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
