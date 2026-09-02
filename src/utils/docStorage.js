/**
 * Document & Group persistence via localStorage.
 * All functions are pure — no reactivity, no watchers.
 */

const KEYS = {
  documents: 'nicemd_documents',
  groups: 'nicemd_groups',
  activeDocId: 'nicemd_active_doc_id',
  sidebarVisible: 'nicemd_sidebar_visible'
};

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function normalizeDoc(doc) {
  if (!doc) return doc;
  const isDel = Boolean(
    doc.isDeleted === true ||
    doc.isDeleted === 1 ||
    doc.isDeleted === '1' ||
    doc.isDeleted === 'true' ||
    doc.is_deleted === 1 ||
    doc.is_deleted === true ||
    doc.is_deleted === '1' ||
    doc.is_deleted === 'true'
  );
  return {
    ...doc,
    isDeleted: isDel,
    is_deleted: isDel ? 1 : 0
  };
}

export function loadDocuments() {
  const docs = safeGet(KEYS.documents, []);
  return (Array.isArray(docs) ? docs : []).map(normalizeDoc);
}

export function saveDocuments(docs) {
  const normalized = (Array.isArray(docs) ? docs : []).map(normalizeDoc);
  safeSet(KEYS.documents, normalized);
}

export function loadGroups() {
  return safeGet(KEYS.groups, []);
}

export function saveGroups(groups) {
  safeSet(KEYS.groups, groups);
}

export function loadActiveDocId() {
  try {
    return localStorage.getItem(KEYS.activeDocId) || null;
  } catch {
    return null;
  }
}

export function saveActiveDocId(id) {
  try {
    localStorage.setItem(KEYS.activeDocId, id);
  } catch {
    // ignore
  }
}

export function loadSidebarVisible() {
  try {
    const raw = localStorage.getItem(KEYS.sidebarVisible);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function saveSidebarVisible(visible) {
  try {
    localStorage.setItem(KEYS.sidebarVisible, visible ? 'true' : 'false');
  } catch {
    // ignore
  }
}
