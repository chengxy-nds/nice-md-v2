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

export function loadDocuments() {
  return safeGet(KEYS.documents, []);
}

export function saveDocuments(docs) {
  safeSet(KEYS.documents, docs);
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
