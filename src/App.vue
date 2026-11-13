<script setup>
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted, watch, nextTick } from 'vue';
import {
  Menu, Sparkles, Search, Image, ImagePlus, BookOpen, Link, Upload, Trash2,
  Eye, EyeOff, Download, Undo2, Redo2, Code2,
  ChevronDown, FileCode, FileText, Globe, Settings, Check, X,
  History, Copy, Plus, ArrowLeftToLine, ArrowRightToLine, CircleX,
  LayoutGrid
} from '@lucide/vue';
import { applyTheme, getThemeDefaultStyles, getThemeSavedStyles, themes as themePresets } from './utils/themePresets';
import { codeThemes } from './utils/codeThemes';
import { htmlToMarkdown } from './utils/htmlToMarkdown';
import { soundEngine } from './utils/synthAudio';
import { showConfirm } from './utils/confirmDialog';
import EditorPanel from './components/EditorPanel.vue';
import PreviewPanel from './components/PreviewPanel.vue';
const LaunchpadModal = defineAsyncComponent(() => import('./components/LaunchpadModal.vue'));
const SettingsModal = defineAsyncComponent(() => import('./components/SettingsModal.vue'));
import ConfirmDialog from './components/ConfirmDialog.vue';
const CoverCollageModal = defineAsyncComponent(() => import('./components/CoverCollageModal.vue'));
import Sidebar from './components/Sidebar.vue';
import IconBar from './components/IconBar.vue';
const DocHistoryModal = defineAsyncComponent(() => import('./components/DocHistoryModal.vue'));
import { compileToWeChatHtml, cleanEmptyListItems, stripOssProcessFromMarkdown } from './utils/wechatStyles';
import { writeTextToClipboard } from './utils/clipboard';
import { EDITOR_SETTINGS_UPDATED_EVENT, loadSyncScrollPreference } from './utils/editorPreferences';
import { ensureMarkdownExtensions, stripYamlFrontMatter } from './utils/markdownExtensions';
import { parseMarkdownWithDocToc, isDocTocToken, extractHeadingsFromTokens } from './utils/markdownToc';
import { marked } from 'marked';
import { fireConfetti } from './utils/celebrate';
import { defaultMarkdown } from './utils/defaultMarkdown';
const TemplateCenter = defineAsyncComponent(() => import('./components/TemplateCenter.vue'));
const MaterialCenter = defineAsyncComponent(() => import('./components/MaterialCenter.vue'));
import HomeLandingView from './components/HomeLandingView.vue';
import BrandLogo from './components/BrandLogo.vue';
import { createSnapshot, getAllDocSnapshots, saveAllDocSnapshots } from './utils/docHistory';
import { loadCustomThemes, saveCustomThemes, mergeCustomThemes } from './utils/themePresets';
import {
  loadDocuments, saveDocuments, normalizeDoc,
  loadGroups, saveGroups,
  loadActiveDocId, saveActiveDocId,
  loadOpenTabs, hasPersistedOpenTabs, saveOpenTabs,
  loadSidebarVisible, saveSidebarVisible,
  generateId
} from './utils/docStorage';
import {
  triggerAutoSyncDebounced,
  triggerAutoSyncImmediate,
  isCloudSyncEnabled,
  isNeonSyncEnabled,
  isTidbSyncEnabled,
  getConfiguredCloudSyncInfo,
  pushAllToCloud,
  pullFromCloud,
  syncCloudBidirectional,
  realtimeSyncDoc,
  realtimeSyncGroup,
  flushPendingRealtimeSync,
  realtimeDeleteDoc,
  realtimePermanentDeleteDoc,
  realtimePermanentDeleteDocsBatch,
  realtimeDeleteGroup,
  realtimeSyncHistory,
  realtimeDeleteHistory,
  realtimeSyncCustomTheme,
  realtimeDeleteCustomTheme
} from './utils/cloudSync';
import { filterOutTombstonedEntities } from './utils/syncTombstones';
import { getActiveStorageSummary, initStorageDefaultIfAvailable } from './utils/fileStorage';
import { unlockSecureCredentials } from './utils/secureCredentials';
import { logger } from './utils/logger.js';

// ── view & document state ──
const currentView = ref('editor'); // 'home' | 'editor' | 'templates' | 'materials'

function ensureActiveDoc() {
  if (!activeDocument.value) {
    handleCreateDoc(null);
  }
}

function handleInsertMaterial(htmlSnippet) {
  ensureActiveDoc();
  let snippet = htmlSnippet ? htmlSnippet.trim() : '';
  if (snippet && !snippet.includes('data-material="true"')) {
    snippet = snippet.replace(/^<([a-zA-Z0-9]+)/, '<$1 data-material="true"');
  }
  if (!markdownContent.value) {
    markdownContent.value = snippet;
  } else {
    markdownContent.value = markdownContent.value.trim() + '\n\n' + snippet;
  }
  currentView.value = 'editor';
  soundEngine.playChime();
}

function handleApplyBackground(mat) {
  ensureActiveDoc();
  const normId = (mat.id || '').replace(/^bg-/, '').replace(/-classic$/, '').replace(/-none$/, '');
  const updatedStyles = JSON.parse(JSON.stringify(customStyles.value || {}));
  if (!updatedStyles.body) updatedStyles.body = {};
  updatedStyles.body.backgroundTexture = normId;
  updatedStyles.body.materialTemplateId = normId;
  customStyles.value = updatedStyles;
  currentView.value = 'editor';
  soundEngine.playChime();
}
const documents = ref([]);
const groups = ref([]);
const activeDocId = ref(null);
const openTabIds = ref([]);
const tabsScrollRef = ref(null);
const sidebarVisible = ref(true);

const activeDocument = computed(() =>
  documents.value.find(d => d.id === activeDocId.value)
);

const activeDocMap = computed(() => {
  const map = new Map();
  for (const doc of documents.value) {
    if (!doc.isDeleted && !doc.is_deleted) {
      map.set(doc.id, doc);
    }
  }
  return map;
});

const openTabs = computed(() =>
  openTabIds.value
    .map(id => activeDocMap.value.get(id))
    .filter(Boolean)
    .map(doc => ({ id: doc.id, title: doc.title || '未命名文档' }))
);

function scrollActiveTabIntoView(tabId = activeDocId.value) {
  if (!tabId) return;
  nextTick(() => {
    const container = tabsScrollRef.value;
    if (!container) return;
    const target = Array.from(container.children).find(el => el.dataset?.tabId === tabId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  });
}

function handleTabsWheel(e) {
  const container = tabsScrollRef.value;
  if (!container) return;
  const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  container.scrollLeft += delta;
}

const TAB_DRAG_THRESHOLD = 4;
const isDraggingTabs = ref(false);
let tabDragStartX = 0;
let tabDragStartScrollLeft = 0;
let hasMovedDuringTabDrag = false;
let suppressNextTabClick = false;
let suppressClickTimer = null;

function handleTabsMouseDown(e) {
  if (e.button !== 0) return;
  if (e.target.closest('.workspace-tab-close, .workspace-tab-input')) return;
  const container = tabsScrollRef.value;
  if (!container || container.scrollWidth <= container.clientWidth) return;

  tabDragStartX = e.clientX;
  tabDragStartScrollLeft = container.scrollLeft;
  hasMovedDuringTabDrag = false;
  window.addEventListener('mousemove', handleTabsMouseMove);
  window.addEventListener('mouseup', stopTabDrag);
  window.addEventListener('blur', stopTabDrag);
}

function handleTabsMouseMove(e) {
  const container = tabsScrollRef.value;
  if (!container) return;
  const dx = e.clientX - tabDragStartX;
  if (!hasMovedDuringTabDrag && Math.abs(dx) < TAB_DRAG_THRESHOLD) return;
  if (!hasMovedDuringTabDrag) {
    hasMovedDuringTabDrag = true;
    isDraggingTabs.value = true;
  }
  container.scrollLeft = tabDragStartScrollLeft - dx;
}

function stopTabDrag() {
  window.removeEventListener('mousemove', handleTabsMouseMove);
  window.removeEventListener('mouseup', stopTabDrag);
  window.removeEventListener('blur', stopTabDrag);
  if (hasMovedDuringTabDrag) {
    suppressNextTabClick = true;
    clearTimeout(suppressClickTimer);
    suppressClickTimer = setTimeout(() => {
      suppressNextTabClick = false;
    }, 0);
  }
  hasMovedDuringTabDrag = false;
  isDraggingTabs.value = false;
}

function handleTabClick(tabId) {
  if (suppressNextTabClick) {
    suppressNextTabClick = false;
    return;
  }
  handleSelectDoc(tabId);
}

const markdownContent = computed({
  get: () => activeDocument.value?.content ?? '',
  set: (val) => {
    const doc = documents.value.find(d => d.id === activeDocId.value);
    if (doc) {
      const contentChanged = doc.content !== val;
      doc.content = val;
      if ((!doc.title || doc.title === '未命名文档') && val) {
        const h1Match = val.match(/^#\s+(.+)$/m);
        if (h1Match && h1Match[1]) {
          const cleanTitle = h1Match[1]
            .replace(/<[^>]+>/g, '')
            .replace(/[*`~_#>]/g, '')
            .trim()
            .slice(0, 40);
          if (cleanTitle) {
            doc.title = cleanTitle;
          }
        }
      }
      // NOTE (item 1): no synchronous save / cloud write here. Every
      // keystroke used to JSON.stringify ALL documents into localStorage
      // and fire an immediate cloud write. Persistence is now the 800ms
      // debounced watcher on markdownContent below; cloud sync goes
      // through dispatchRealtime's own debounce plus the 2s full auto-sync.
      if (contentChanged) doc.updatedAt = Date.now();
    }
  }
});

const customStyles = computed({
  get: () => activeDocument.value?.customStyles ?? {},
  set: (val) => {
    const doc = documents.value.find(d => d.id === activeDocId.value);
    if (doc) {
      const stylesChanged = JSON.stringify(doc.customStyles ?? {}) !== JSON.stringify(val ?? {});
      doc.customStyles = val;
      // NOTE (item 1): see markdownContent setter — persistence is the
      // debounced watcher below, not a synchronous write per change.
      if (stylesChanged) doc.updatedAt = Date.now();
    }
  }
});

// ── Document History State & Handlers ──
const historyModalVisible = ref(false);
const historyTargetDoc = ref(null);

const historyCurrentContent = computed(() => {
  if (historyTargetDoc.value?.id === activeDocument.value?.id) {
    return markdownContent.value;
  }
  return historyTargetDoc.value?.content || '';
});

const historyCurrentCustomStyles = computed(() => {
  if (historyTargetDoc.value?.id === activeDocument.value?.id) {
    return customStyles.value;
  }
  return historyTargetDoc.value?.customStyles || {};
});

function openDocHistory(doc = null) {
  const target = doc || activeDocument.value;
  if (!target) return;
  // If target is currently active document, save current state to snapshot first
  if (target.id === activeDocument.value?.id && markdownContent.value) {
    target.content = markdownContent.value;
    createSnapshot(target.id, target.title, markdownContent.value, customStyles.value, 'auto');
  }
  historyTargetDoc.value = target;
  historyModalVisible.value = true;
  soundEngine.playClick();
}

function handleRestoreVersion({ docId, content, customStyles: restoredStyles }) {
  soundEngine.playChime();
  const doc = documents.value.find(d => d.id === docId);
  if (doc) {
    doc.content = content;
    if (restoredStyles) {
      doc.customStyles = JSON.parse(JSON.stringify(restoredStyles));
    }
    doc.updatedAt = Date.now();
  }
  if (activeDocument.value?.id === docId) {
    markdownContent.value = content;
    if (restoredStyles) {
      customStyles.value = JSON.parse(JSON.stringify(restoredStyles));
    }
  }
  saveDocuments(documents.value);
}

// Auto-snapshot on typing pause (10s debounce)
let autoSnapshotTimer = null;
watch(markdownContent, (newContent) => {
  if (!activeDocument.value || !newContent) return;
  clearTimeout(autoSnapshotTimer);
  autoSnapshotTimer = setTimeout(() => {
    if (activeDocument.value && newContent) {
      createSnapshot(
        activeDocument.value.id,
        activeDocument.value.title,
        newContent,
        customStyles.value,
        'auto'
      );
    }
  }, 10000);
});

// Keep open tabs synced with active document & prune deleted/removed docs
watch([activeDocId, activeDocMap], ([newId, docMap]) => {
  const pruned = openTabIds.value.filter(id => docMap.has(id));
  if (newId && docMap.has(newId) && !pruned.includes(newId)) {
    pruned.push(newId);
  }
  const changed = pruned.length !== openTabIds.value.length || pruned.some((id, idx) => id !== openTabIds.value[idx]);
  if (changed) {
    openTabIds.value = pruned;
    saveOpenTabs(pruned);
  }
}, { immediate: false });

// Take snapshot before switching doc & clear transient inline rename
watch(activeDocId, (newId, oldId) => {
  renamingTabId.value = null;
  if (newId !== oldId) {
    scrollPercentage.value = 0;
  }
  if (oldId) {
    const prevDoc = documents.value.find(d => d.id === oldId);
    if (prevDoc && prevDoc.content) {
      createSnapshot(prevDoc.id, prevDoc.title, prevDoc.content, prevDoc.customStyles, 'auto');
    }
  }
  if (newId) {
    scrollActiveTabIntoView(newId);
  }
});

// ── CRUD handlers ──
function handleSelectDoc(id) {
  soundEngine.playClick();
  activeDocId.value = id;
  saveActiveDocId(id);
}

function closeTabList(nextIds, fallbackFocusId = null) {
  renamingTabId.value = null;
  closeTabMenu();
  soundEngine.playClick('backspace');
  openTabIds.value = nextIds;
  saveOpenTabs(nextIds);
  if (nextIds.length === 0) {
    activeDocId.value = null;
    saveActiveDocId('');
    return;
  }
  if (!activeDocId.value || !nextIds.includes(activeDocId.value)) {
    const nextActive = (fallbackFocusId && nextIds.includes(fallbackFocusId)) ? fallbackFocusId : nextIds[0];
    activeDocId.value = nextActive;
    saveActiveDocId(nextActive);
  }
}

function handleCloseTab(tabId) {
  const idx = openTabIds.value.indexOf(tabId);
  if (idx === -1) return;
  const nextIds = openTabIds.value.filter(id => id !== tabId);
  const fallbackId = nextIds[Math.min(idx, nextIds.length - 1)] || null;
  closeTabList(nextIds, fallbackId);
}

function handleCloseLeftTabs(tabId) {
  const idx = openTabIds.value.indexOf(tabId);
  if (idx <= 0) return;
  closeTabList(openTabIds.value.slice(idx), tabId);
}

function handleCloseRightTabs(tabId) {
  const idx = openTabIds.value.indexOf(tabId);
  if (idx === -1 || idx >= openTabIds.value.length - 1) return;
  closeTabList(openTabIds.value.slice(0, idx + 1), tabId);
}

function handleCloseAllTabs() {
  if (openTabIds.value.length === 0) return;
  closeTabList([]);
}

const TAB_MENU_VIEWPORT_PADDING = 8;
const TAB_MENU_OFFSET_Y = 6;
const tabMenuRef = ref(null);
const tabMenuVisible = ref(false);
const tabMenuTargetId = ref(null);
const tabMenuStyle = ref({});
let tabMenuHoverOpenTimer = null;
let tabMenuHoverCloseTimer = null;

const tabMenuTargetIndex = computed(() =>
  tabMenuTargetId.value ? openTabs.value.findIndex(t => t.id === tabMenuTargetId.value) : -1
);

const tabMenuItems = computed(() => {
  const targetId = tabMenuTargetId.value;
  const idx = tabMenuTargetIndex.value;
  const total = openTabs.value.length;
  return [
    { key: 'close', label: '关闭', icon: X, disabled: idx === -1, action: () => handleCloseTab(targetId) },
    { key: 'close-left', label: '关闭左侧', icon: ArrowLeftToLine, disabled: idx <= 0, action: () => handleCloseLeftTabs(targetId) },
    { key: 'close-right', label: '关闭右侧', icon: ArrowRightToLine, disabled: idx === -1 || idx >= total - 1, action: () => handleCloseRightTabs(targetId) },
    { key: 'close-all', label: '关闭全部', icon: CircleX, danger: true, dividerBefore: true, disabled: total === 0, action: () => handleCloseAllTabs() }
  ];
});

function clearTabMenuTimers() {
  if (tabMenuHoverOpenTimer) {
    clearTimeout(tabMenuHoverOpenTimer);
    tabMenuHoverOpenTimer = null;
  }
  if (tabMenuHoverCloseTimer) {
    clearTimeout(tabMenuHoverCloseTimer);
    tabMenuHoverCloseTimer = null;
  }
}

function handleTabMenuOutsidePointerDown(e) {
  if (!tabMenuVisible.value) return;
  if (tabMenuRef.value?.contains(e.target)) return;
  closeTabMenu();
}

function handleTabMenuKeyDown(e) {
  if (e.key === 'Escape' && tabMenuVisible.value) {
    closeTabMenu();
  }
}

function attachTabMenuListeners() {
  window.addEventListener('mousedown', handleTabMenuOutsidePointerDown, true);
  window.addEventListener('keydown', handleTabMenuKeyDown);
  window.addEventListener('resize', closeTabMenu);
}

function detachTabMenuListeners() {
  window.removeEventListener('mousedown', handleTabMenuOutsidePointerDown, true);
  window.removeEventListener('keydown', handleTabMenuKeyDown);
  window.removeEventListener('resize', closeTabMenu);
}

async function positionTabMenu(anchorX, anchorY) {
  tabMenuStyle.value = { top: '-9999px', left: '-9999px', visibility: 'hidden' };
  await nextTick();
  if (!tabMenuVisible.value || !tabMenuRef.value) return;

  const rect = tabMenuRef.value.getBoundingClientRect();
  const maxLeft = Math.max(TAB_MENU_VIEWPORT_PADDING, window.innerWidth - rect.width - TAB_MENU_VIEWPORT_PADDING);
  const maxTop = Math.max(TAB_MENU_VIEWPORT_PADDING, window.innerHeight - rect.height - TAB_MENU_VIEWPORT_PADDING);
  const left = Math.min(Math.max(anchorX, TAB_MENU_VIEWPORT_PADDING), maxLeft);
  const top = Math.min(Math.max(anchorY, TAB_MENU_VIEWPORT_PADDING), maxTop);

  tabMenuStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    visibility: 'visible'
  };
}

function openTabMenu(tabId, anchorX, anchorY) {
  clearTabMenuTimers();
  tabMenuTargetId.value = tabId;
  if (!tabMenuVisible.value) {
    tabMenuVisible.value = true;
    attachTabMenuListeners();
  }
  positionTabMenu(anchorX, anchorY);
}

function closeTabMenu() {
  clearTabMenuTimers();
  if (tabMenuVisible.value) {
    tabMenuVisible.value = false;
    tabMenuTargetId.value = null;
    detachTabMenuListeners();
  }
}

function scheduleTabMenuHoverOpen(anchorEl, tabId) {
  clearTabMenuTimers();
  if (!anchorEl || isDraggingTabs.value) return;
  const delayMs = tabMenuVisible.value ? 0 : 150;
  tabMenuHoverOpenTimer = setTimeout(() => {
    const rect = anchorEl.getBoundingClientRect();
    openTabMenu(tabId, rect.left - 8, rect.bottom + TAB_MENU_OFFSET_Y);
  }, delayMs);
}

function scheduleTabMenuClose() {
  clearTabMenuTimers();
  tabMenuHoverCloseTimer = setTimeout(() => {
    closeTabMenu();
  }, 160);
}

function openTabMenuFromContext(e, tabId) {
  openTabMenu(tabId, e.clientX, e.clientY);
}

function handleSelectTabMenuItem(item) {
  if (item.disabled) return;
  item.action();
}

function handleCreateDoc(groupId = null) {
  soundEngine.playClick();
  const id = generateId();
  const now = Date.now();
  const newDoc = {
    id, title: '未命名文档', content: '', groupId, createdAt: now, updatedAt: now,
    customStyles: {
      body: { backgroundTexture: 'clean', materialTemplateId: 'none' }
    }
  };
  documents.value.unshift(newDoc);
  activeDocId.value = id;
  saveDocuments(documents.value);
  saveActiveDocId(id);
  realtimeSyncDoc(newDoc);
}

async function handleFillSample() {
  if (!activeDocument.value) {
    handleCreateDoc(null);
  }
  const hasContent = Boolean((markdownContent.value || '').trim());
  if (hasContent) {
    const ok = await showConfirm({
      title: '填充示例内容',
      message: '当前文档已有内容，填充示例将覆盖当前文档的全部内容，确定继续吗？',
      confirmText: '确认覆盖',
      danger: true
    });
    if (!ok) return;
  }
  markdownContent.value = defaultMarkdown;
  soundEngine.playChime();
}

const toolbarDocCopied = ref(false);
let toolbarCopyTimer = null;

async function handleCopyDocContent() {
  const rawContent = markdownContent.value || '';
  if (!rawContent.trim()) {
    triggerAppToast('当前文档内容为空');
    return;
  }
  try {
    await writeTextToClipboard(stripOssProcessFromMarkdown(rawContent));
    soundEngine.playChime();
    toolbarDocCopied.value = true;
    clearTimeout(toolbarCopyTimer);
    toolbarCopyTimer = setTimeout(() => {
      toolbarDocCopied.value = false;
    }, 1600);
    triggerAppToast('已复制当前文档内容');
  } catch (err) {
    logger.error('[NiceMD] Copy doc content failed:', err);
    triggerAppToast('复制失败，请检查剪贴板权限');
  }
}

function handleDuplicateDoc(doc) {
  if (!doc) return;
  soundEngine.playChime();
  const id = generateId();
  const now = Date.now();
  const newDoc = {
    id,
    title: `${doc.title || '未命名文档'} (副本)`,
    content: doc.content || '',
    groupId: doc.groupId || null,
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    customStyles: doc.customStyles ? JSON.parse(JSON.stringify(doc.customStyles)) : {}
  };
  const idx = documents.value.findIndex(d => d.id === doc.id);
  if (idx !== -1) {
    documents.value.splice(idx + 1, 0, newDoc);
  } else {
    documents.value.unshift(newDoc);
  }
  activeDocId.value = id;
  saveDocuments(documents.value);
  saveActiveDocId(id);
  realtimeSyncDoc(newDoc);
  triggerAppToast('✨ 已创建文档副本');
}

function handleTogglePinDoc(doc) {
  if (!doc) return;
  soundEngine.playClick();
  const target = documents.value.find(d => d.id === doc.id);
  if (target) {
    target.isPinned = !target.isPinned;
    target.updatedAt = Date.now();
    saveDocuments(documents.value);
    realtimeSyncDoc(target);
  }
}

function handleApplyTemplate(template) {
  const content = typeof template === 'string' ? template : template.content;
  const title = (typeof template === 'object' && template.title) ? template.title : '已套用模板';
  const tmplCustomStyles = (typeof template === 'object' && template.customStyles) ? template.customStyles : {};

  if (activeDocument.value && (!markdownContent.value || markdownContent.value.trim() === defaultMarkdown.trim())) {
    markdownContent.value = content;
    if (activeDocument.value) {
      activeDocument.value.title = title;
      activeDocument.value.customStyles = JSON.parse(JSON.stringify(tmplCustomStyles));
      activeDocument.value.updatedAt = Date.now();
      saveDocuments(documents.value);
      realtimeSyncDoc(activeDocument.value);
    }
  } else {
    const id = generateId();
    const now = Date.now();
    const newDoc = {
      id, title, content, groupId: null, createdAt: now, updatedAt: now,
      customStyles: JSON.parse(JSON.stringify(tmplCustomStyles))
    };
    documents.value.unshift(newDoc);
    activeDocId.value = id;
    saveDocuments(documents.value);
    saveActiveDocId(id);
    realtimeSyncDoc(newDoc);
  }

  currentView.value = 'editor';
}

function handleApplyTheme(theme) {
  soundEngine.playChime();
  const themeId = typeof theme === 'string' ? theme : theme.id;
  const customStylesObj = (typeof theme === 'object' && theme.customStyles)
    ? JSON.parse(JSON.stringify(theme.customStyles))
    : ((typeof theme === 'object' && theme.customCss) ? { customCss: theme.customCss } : {});

  // 1) Switch active theme
  currentTheme.value = themeId;
  applyTheme(themeId);
  localStorage.setItem('nicemd_theme', themeId);

  // 2) Apply theme & customStyles onto current active document
  if (!activeDocument.value) {
    handleCreateDoc();
  }
  if (activeDocument.value) {
    activeDocument.value.customStyles = customStylesObj;
    activeDocument.value.updatedAt = Date.now();
    realtimeSyncDoc(activeDocument.value);
  }
  customStyles.value = customStylesObj;

  saveDocuments(documents.value);

  // 3) Switch back to editor
  currentView.value = 'editor';
}

function handleRenameDoc({ id, title }) {
  soundEngine.playClick();
  const doc = documents.value.find(d => d.id === id);
  if (doc) {
    doc.title = title;
    doc.updatedAt = Date.now();
    saveDocuments(documents.value);
    realtimeSyncDoc(doc);
  }
}

// ── Tab document title inline rename ──
const renamingTabId = ref(null);
const tabRenameValue = ref('');
const tabRenameInputRef = ref(null);

function startRenameTab(tab) {
  if (!tab?.id) return;
  closeTabMenu();
  tabRenameValue.value = tab.title || '未命名文档';
  renamingTabId.value = tab.id;
  nextTick(() => {
    const inputEl = Array.isArray(tabRenameInputRef.value) ? tabRenameInputRef.value[0] : tabRenameInputRef.value;
    inputEl?.focus();
    inputEl?.select();
  });
}

function confirmRenameTab() {
  if (!renamingTabId.value) return;
  const targetId = renamingTabId.value;
  const trimmed = tabRenameValue.value.trim();
  renamingTabId.value = null;
  if (trimmed) {
    handleRenameDoc({ id: targetId, title: trimmed });
  }
}

function cancelRenameTab() {
  renamingTabId.value = null;
}

function handleDeleteDoc(id) {
  soundEngine.playClick('backspace');
  const doc = documents.value.find(d => d.id === id);
  if (!doc) return;

  // 逻辑软删除
  doc.isDeleted = true;
  doc.updatedAt = Date.now();

  // 若当前正在查看被删除文档，自动切换到未删除文档
  if (activeDocId.value === id) {
    const activeDocs = documents.value.filter(d => !d.isDeleted);
    if (activeDocs.length === 0) {
      handleCreateDoc(null);
    } else {
      activeDocId.value = activeDocs[0].id;
      saveActiveDocId(activeDocId.value);
    }
  }

  saveDocuments(documents.value);
  realtimeDeleteDoc(id);
}

function handleRestoreDoc(id) {
  soundEngine.playChime();
  const doc = documents.value.find(d => d.id === id);
  if (!doc) return;

  // 恢复文档
  doc.isDeleted = false;
  doc.updatedAt = Date.now();
  activeDocId.value = id;
  saveActiveDocId(id);

  saveDocuments(documents.value);
  realtimeSyncDoc(doc);
}

function handlePermanentDeleteDoc(id) {
  soundEngine.playClick('backspace');
  const idx = documents.value.findIndex(d => d.id === id);
  if (idx !== -1) {
    documents.value.splice(idx, 1);
  }

  if (activeDocId.value === id) {
    const activeDocs = documents.value.filter(d => !d.isDeleted);
    if (activeDocs.length === 0) {
      handleCreateDoc(null);
    } else {
      activeDocId.value = activeDocs[0].id;
      saveActiveDocId(activeDocId.value);
    }
  }

  saveDocuments(documents.value);
  realtimePermanentDeleteDoc(id);
}

function handleEmptyRecycleBin() {
  soundEngine.playClick('backspace');
  const deletedIds = documents.value.filter(d => d.isDeleted || d.is_deleted).map(d => d.id);
  documents.value = documents.value.filter(d => !d.isDeleted && !d.is_deleted);

  if (activeDocId.value && deletedIds.includes(activeDocId.value)) {
    if (documents.value.length === 0) {
      handleCreateDoc(null);
    } else {
      activeDocId.value = documents.value[0].id;
      saveActiveDocId(activeDocId.value);
    }
  }

  saveDocuments(documents.value);
  if (deletedIds.length > 0) {
    realtimePermanentDeleteDocsBatch(deletedIds);
  }
}

function handleCreateGroup(name) {
  soundEngine.playClick();
  const group = { id: generateId(), name, createdAt: Date.now(), updatedAt: Date.now() };
  groups.value.push(group);
  saveGroups(groups.value);
  realtimeSyncGroup(group);
}

function handleRenameGroup({ id, name }) {
  soundEngine.playClick();
  const group = groups.value.find(g => g.id === id);
  if (group) {
    group.name = name;
    group.updatedAt = Date.now();
    saveGroups(groups.value);
    realtimeSyncGroup(group);
  }
}

function handleDeleteGroup(id) {
  soundEngine.playClick('backspace');
  groups.value = groups.value.filter(g => g.id !== id);
  documents.value.forEach(d => {
    if (d.groupId === id) {
      d.groupId = null;
      d.updatedAt = Date.now();
      realtimeSyncDoc(d);
    }
  });
  saveDocuments(documents.value);
  saveGroups(groups.value);
  realtimeDeleteGroup(id);
}

function handleMoveDoc({ docId, groupId }) {
  const doc = documents.value.find(d => d.id === docId);
  if (doc) {
    doc.groupId = groupId || null;
    doc.updatedAt = Date.now();
    const idx = documents.value.findIndex(d => d.id === docId);
    if (idx !== -1) {
      const [moved] = documents.value.splice(idx, 1);
      documents.value.push(moved);
    }
    documents.value = [...documents.value];
    saveDocuments(documents.value);
    realtimeSyncDoc(doc);
  }
}

function handleReorderDocs({ docId, targetDocId, position }) {
  const srcIdx = documents.value.findIndex(d => d.id === docId);
  const targetDoc = documents.value.find(d => d.id === targetDocId);
  if (srcIdx === -1 || !targetDoc || docId === targetDocId) return;

  const [moved] = documents.value.splice(srcIdx, 1);
  const prevGroupId = moved.groupId || null;
  moved.groupId = targetDoc.groupId || null;
  moved.updatedAt = Date.now();

  const tgtIdx = documents.value.findIndex(d => d.id === targetDocId);
  const insertIdx = position === 'after' ? tgtIdx + 1 : tgtIdx;
  documents.value.splice(insertIdx, 0, moved);
  documents.value = [...documents.value];
  saveDocuments(documents.value);
  if (prevGroupId !== moved.groupId) {
    realtimeSyncDoc(moved);
  }
}

function handleReorderGroups({ groupId, targetGroupId }) {
  const srcIdx = groups.value.findIndex(g => g.id === groupId);
  const tgtIdx = groups.value.findIndex(g => g.id === targetGroupId);
  if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx) return;
  const [moved] = groups.value.splice(srcIdx, 1);
  const insertIdx = srcIdx < tgtIdx ? tgtIdx - 1 : tgtIdx;
  groups.value.splice(insertIdx, 0, moved);
  saveGroups(groups.value);
}

let isApplyingSync = false;

function handleSyncComplete(payload) {
  if (!payload) return;
  isApplyingSync = true;
  if (payload.docs && Array.isArray(payload.docs)) {
    const localActive = documents.value.find(d => d.id === activeDocId.value);
    const localActiveTs = Number(localActive?.updatedAt || localActive?.createdAt || 0);
    const safeDocs = filterOutTombstonedEntities('docs', payload.docs.map(normalizeDoc)).map(doc => {
      if (localActive && doc.id === localActive.id) {
        const incomingTs = Number(doc.updatedAt || doc.createdAt || 0);
        if (localActiveTs > incomingTs) {
          return normalizeDoc({ ...localActive });
        }
      }
      return doc;
    });
    documents.value = [...safeDocs];
    saveDocuments(documents.value);
  }
  if (payload.groups && Array.isArray(payload.groups)) {
    const safeGroups = filterOutTombstonedEntities('groups', payload.groups);
    groups.value = [...safeGroups];
    saveGroups(groups.value);
  }
  if (payload.histories && Array.isArray(payload.histories)) {
    saveAllDocSnapshots(payload.histories);
  }
  if (payload.customThemes && Array.isArray(payload.customThemes)) {
    mergeCustomThemes(payload.customThemes);
  }
  const activeDocs = documents.value.filter(d => !d.isDeleted && !d.is_deleted);
  if (activeDocs.length > 0) {
    if (!activeDocs.some(d => d.id === activeDocId.value)) {
      activeDocId.value = activeDocs[0].id;
      saveActiveDocId(activeDocId.value);
    }
  }
  setTimeout(() => {
    isApplyingSync = false;
  }, 1000);
}

// Watch documents and groups changes for background debounced auto-sync to Cloud
function triggerFullAutoSync() {
  if (isApplyingSync) return;
  if (isCloudSyncEnabled()) {
    triggerAutoSyncDebounced(
      documents.value,
      groups.value,
      getAllDocSnapshots(),
      loadCustomThemes(),
      () => {},
      (err, res) => {
        if (!err && res) {
          handleSyncComplete(res);
        }
      }
    );
  }
}

watch([documents, groups], () => {
  triggerFullAutoSync();
}, { deep: true });

// Listen for cloud config updates from Settings Modal
window.addEventListener('nicemd-neon-config-updated', () => {
  triggerFullAutoSync();
});
window.addEventListener('nicemd-tidb-config-updated', () => {
  triggerFullAutoSync();
});
window.addEventListener('nicemd-github-config-updated', () => {
  triggerFullAutoSync();
});
window.addEventListener('nicemd-cloud-provider-changed', () => {
  triggerFullAutoSync();
});
window.addEventListener('nicemd-request-auto-sync', () => {
  triggerFullAutoSync();
});

// Initial startup sync if Cloud Sync is enabled
if (isCloudSyncEnabled()) {
  triggerFullAutoSync();
}

const currentTheme = ref(localStorage.getItem('nicemd_theme') || 'classic-indigo');
const currentCodeTheme = ref(localStorage.getItem('nicemd_code_theme') || 'mdnice-classic');

const activeThemeName = computed(() =>
  themePresets.find(t => t.id === currentTheme.value)?.name || '山海'
);
const editorPanelRef = ref(null);
const showImageMenu = ref(false);
const imageMenuRef = ref(null);
const imageStorageSummary = ref(getActiveStorageSummary());
const showImportMenu = ref(false);
const showExportMenu = ref(false);
const showDocThemeMenu = ref(false);
const showCodeThemeMenu = ref(false);

function refreshImageStorageSummary() {
  imageStorageSummary.value = getActiveStorageSummary();
}

function toggleImageMenu() {
  refreshImageStorageSummary();
  const next = !showImageMenu.value;
  showImportMenu.value = false;
  showExportMenu.value = false;
  showDocThemeMenu.value = false;
  showCodeThemeMenu.value = false;
  showImageMenu.value = next;
}

function handleToolbarImageUpload() {
  showImageMenu.value = false;
  editorPanelRef.value?.handleImageUpload();
}

function handleOpenImageStorageSettings() {
  showImageMenu.value = false;
  openSettings('storage');
}

function handleImageMenuPointerDown(e) {
  if (showImageMenu.value && imageMenuRef.value && !imageMenuRef.value.contains(e.target)) {
    showImageMenu.value = false;
  }
}

function handleImageMenuKeyDown(e) {
  if (e.key === 'Escape' && showImageMenu.value) {
    showImageMenu.value = false;
  }
}

const activeThemeObj = computed(() =>
  themePresets.find(t => t.id === currentTheme.value) || themePresets[0]
);

const activeCodeThemeObj = computed(() =>
  codeThemes.find(ct => ct.id === currentCodeTheme.value) || codeThemes[0]
);

function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value;
}
function closeExportMenu() {
  showExportMenu.value = false;
}
function handleSaveTheme(styles) {
  const name = prompt('请输入新主题名称：');
  if (!name || !name.trim()) return;
  const id = 'custom-' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const cleanStyles = JSON.parse(JSON.stringify(styles || {}));

  const newTheme = {
    id,
    name: name.trim(),
    icon: 'Palette',
    dark: false,
    builtIn: false,
    isCustom: true,
    description: '用户自定义主题',
    tag: '我的主题',
    customStyles: cleanStyles,
    styles: {
      '--bg-app': cleanStyles.body?.backgroundColor || '#fcfcfc',
      '--bg-editor': cleanStyles.body?.backgroundColor || '#ffffff',
      '--bg-preview': cleanStyles.body?.backgroundColor || '#fdfdfd',
      '--text-main': cleanStyles.body?.color || '#2b2b2b',
      '--text-muted': '#595959',
      '--border-color': '#e1e4e8',
      '--accent-color': cleanStyles.h1?.color || '#2775b6',
      '--accent-hover': '#1e5d93',
      '--accent-bg': cleanStyles.blockquote?.backgroundColor || 'rgba(39, 117, 182, 0.05)',
      '--code-bg': cleanStyles.code?.backgroundColor || 'rgba(27,31,35,0.05)',
      '--code-text': cleanStyles.code?.color || '#bb2243',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    },
    customCss: cleanStyles.customCss || '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  themePresets.push(newTheme);
  const customOnly = themePresets.filter(t => t.isCustom || !t.builtIn || t.id.startsWith('custom-'));
  saveCustomThemes(customOnly);
  realtimeSyncCustomTheme(newTheme);
  currentTheme.value = id;
  applyTheme(id);
  localStorage.setItem('nicemd_theme', id);
  customStyles.value = cleanStyles;
  if (activeDocument.value) {
    activeDocument.value.customStyles = cleanStyles;
    activeDocument.value.updatedAt = Date.now();
    saveDocuments(documents.value);
  }
  soundEngine.playChime();
}

function handleSaveCustomTheme({ themeId, styles, css }) {
  const theme = themePresets.find(t => t.id === themeId);
  if (!theme) return;
  const cleanStyles = JSON.parse(JSON.stringify(styles || {}));
  cleanStyles.customCss = css;
  theme.customStyles = cleanStyles;
  theme.customCss = css || '';
  theme.updatedAt = Date.now();
  if (!theme.styles) theme.styles = {};
  if (cleanStyles.body?.backgroundColor) {
    theme.styles['--bg-preview'] = cleanStyles.body.backgroundColor;
    theme.styles['--bg-editor'] = cleanStyles.body.backgroundColor;
  }
  if (cleanStyles.body?.color) {
    theme.styles['--text-main'] = cleanStyles.body.color;
  }
  if (cleanStyles.h1?.color) {
    theme.styles['--accent-color'] = cleanStyles.h1.color;
  }
  const customOnly = themePresets.filter(t => t.isCustom || !t.builtIn || t.id.startsWith('custom-'));
  saveCustomThemes(customOnly);
  realtimeSyncCustomTheme(theme);
  customStyles.value = cleanStyles;
  if (activeDocument.value) {
    activeDocument.value.customStyles = cleanStyles;
    activeDocument.value.updatedAt = Date.now();
    saveDocuments(documents.value);
  }
  soundEngine.playChime();
}

const isExtensionConnected = ref(false);

function handleCodeThemeSelect(id) {
  soundEngine.playClick();
  currentCodeTheme.value = id;
  showCodeThemeMenu.value = false;
  localStorage.setItem('nicemd_code_theme', id);
  const newStyles = JSON.parse(JSON.stringify(customStyles.value || {}));
  if (!newStyles.code) newStyles.code = {};
  newStyles.code.codeThemeId = id;
  customStyles.value = newStyles;
}

function handleCodeThemeChangeFromPreview(id) {
  currentCodeTheme.value = id;
  localStorage.setItem('nicemd_code_theme', id);
  const newStyles = JSON.parse(JSON.stringify(customStyles.value || {}));
  if (!newStyles.code) newStyles.code = {};
  newStyles.code.codeThemeId = id;
  customStyles.value = newStyles;
}

// Watch activeDocument to sync codeThemeId if stored in document
watch(activeDocument, (doc) => {
  if (doc?.customStyles?.code?.codeThemeId) {
    currentCodeTheme.value = doc.customStyles.code.codeThemeId;
  }
}, { immediate: true });

watch(currentCodeTheme, (newVal) => {
  localStorage.setItem('nicemd_code_theme', newVal);
});

const changeTheme = (themeId) => {
  soundEngine.playClick();
  currentTheme.value = themeId;
  applyTheme(themeId);
  localStorage.setItem('nicemd_theme', themeId);

  // Update active document's customStyles to match the new theme's default/saved styles so preview updates immediately with all material templates
  const newStyles = getThemeSavedStyles(themeId) || {};
  if (activeDocument.value) {
    activeDocument.value.customStyles = newStyles;
    activeDocument.value.updatedAt = Date.now();
  }
  customStyles.value = newStyles;
  saveDocuments(documents.value);
};

const handleImport = ({ content, type, filename }) => {
  if (type === 'html') {
    markdownContent.value = htmlToMarkdown(content);
  } else {
    markdownContent.value = content;
  }
};

// ── export ──
function getExportTitle() {
  const m = markdownContent.value.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '未命名文档';
}

function downloadBlob(content, filename, mime) {
  let blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    // Prepend UTF-8 BOM (\uFEFF) for text files so Word, Excel, and text editors recognize UTF-8 encoding
    const needBOM = mime.includes('text') || mime.includes('msword') || mime.includes('markdown') || mime.includes('html');
    const textContent = needBOM ? '\uFEFF' + content : content;
    blob = new Blob([textContent], { type: mime });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Reuse compileToWeChatHtml for export — it produces inline-styled HTML with
// Mac-dot SVG headers, syntax highlighting, code shadows, and all theme styles.
function getStyledHtml() {
  if (!markdownContent.value) return '';
  const rawHtml = parseMarkdownWithDocToc(markdownContent.value);
  const cleaned = cleanEmptyListItems(rawHtml);
  const effectiveCodeTheme = customStyles.value?.code?.codeThemeId || currentCodeTheme.value || 'mdnice-classic';
  return compileToWeChatHtml(cleaned, currentTheme.value, effectiveCodeTheme, customStyles.value?.customCss || '', customStyles.value);
}

function exportMD() {
  soundEngine.playClick();
  downloadBlob(markdownContent.value, getExportTitle() + '.md', 'text/markdown;charset=utf-8');
}

function exportHTML() {
  soundEngine.playClick();
  const title = getExportTitle();
  const body = getStyledHtml();
  const full = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="max-width:700px;margin:40px auto;padding:20px;">
${body}
</body></html>`;
  downloadBlob(full, title + '.html', 'text/html;charset=utf-8');
}

// Pre-process images for Canvas / PDF export: convert to Base64 to bypass CORS & ensure auto-adapting width
async function prepareContainerImages(container) {
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(imgs.map(async (img) => {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;

    // Determine if the image is same-origin. Cross-origin images (e.g. OSS
    // buckets without CORS headers) can't be fetched directly — the browser
    // logs an uncatchable CORS error for the direct fetch, so we must skip it
    // and go straight to a CORS proxy.
    let isSameOrigin = false;
    try {
      isSameOrigin = !src.startsWith('http') ||
        new URL(src).origin === window.location.origin;
    } catch { isSameOrigin = false; }

    const attempts = isSameOrigin
      ? [src]
      : [
          `https://proxy.cors.sh/${src}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`,
          `https://corsproxy.io/?url=${encodeURIComponent(src)}`
        ];

    for (const url of attempts) {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) continue;
        const blob = await response.blob();
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              img.setAttribute('src', reader.result);
            }
            resolve();
          };
          reader.onerror = resolve;
          reader.readAsDataURL(blob);
        });
        break; // converted successfully, stop trying
      } catch (e) {
        logger.warn('[NiceMD] Image Base64 conversion attempt failed for:', url, e);
      }
    }
  }));

  await new Promise(r => setTimeout(r, 150));
}

// ── real .docx (native OOXML, fully editable) export using the `docx` library ──
// html-docx-js-typescript embeds HTML as an altChunk blob, which Word treats as
// non-editable embedded content. Here we parse the markdown into native Word
// paragraphs / tables / runs so every line is real, editable text.

// Lazily loaded docx namespace (item 3) — filled by exportWord() just
// before the helpers below run. docx is only downloaded when the user
// exports Word, and exportWord() is the only caller of these helpers.
let docxNs = null;

function mdTextToRuns(text) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|~~[^~]+~~)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new docxNs.TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('~~') && part.endsWith('~~')) {
      runs.push(new docxNs.TextRun({ text: part.slice(2, -2), strike: true }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new docxNs.TextRun({ text: part.slice(1, -1), font: 'Consolas' }));
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      runs.push(new docxNs.TextRun({ text: part.slice(1, -1), italics: true }));
    } else {
      runs.push(new docxNs.TextRun({ text: part }));
    }
  }
  if (!runs.length) runs.push(new docxNs.TextRun({ text }));
  return runs;
}

async function fetchImageBytes(src) {
  const urls = [
    src,
    `https://proxy.cors.sh/${src}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(src)}`
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength) return buf;
    } catch { /* try next */ }
  }
  return null;
}

async function mdToDocxWithImages(tokens) {
  // Collect images in order of appearance, then fetch each and build ImageRuns.
  const imgList = [];
  (function collect(items) {
    for (const t of items) {
      if (t.type === 'image' && t.href) {
        imgList.push({ href: t.href, alt: t.text || '' });
      } else if (t.type === 'paragraph' && t.tokens && Array.isArray(t.tokens)) {
        collect(t.tokens);
      }
    }
  })(tokens);

  const MAX_W = 520;
  const prepared = await Promise.all(imgList.map(async (img) => {
    const bytes = await fetchImageBytes(img.href);
    if (!bytes) return null;
    const blob = new Blob([bytes]);
    const bitmap = await createImageBitmap(blob);
    const naturalW = bitmap.width;
    const naturalH = bitmap.height;
    const w = Math.min(naturalW, MAX_W);
    const h = naturalH ? Math.round((w / naturalW) * naturalH) : w;
    return { bytes, w, h, type: blob.type || 'image/png' };
  }));

  let imgIdx = 0;
  const getImg = () => prepared[imgIdx++];

  // Build an ImageRun (or fallback text) for an image token.
  const imgParagraph = (tk) => {
    const p = getImg();
    if (p) {
      return new docxNs.Paragraph({
        children: [new docxNs.ImageRun({
          data: p.bytes,
          transformation: { width: p.w, height: p.h },
          type: p.type
        })],
        alignment: docxNs.AlignmentType.CENTER,
        spacing: { before: 120, after: 120 }
      });
    }
    return new docxNs.Paragraph({
      children: [new docxNs.TextRun({ text: `[图片: ${tk.text || tk.href || ''}]`, color: '888888' })],
      alignment: docxNs.AlignmentType.CENTER,
      spacing: { before: 120, after: 120 }
    });
  };

  // Split a paragraph token into runs, inlining images in place.
  const paragraphWithImages = (t) => {
    const hasImg = t.tokens && t.tokens.some(tk => tk.type === 'image');
    if (!hasImg) {
      return [new docxNs.Paragraph({
        children: mdTextToRuns(t.text),
        spacing: { after: 120, line: 360 }
      })];
    }
    const runs = [];
    for (const tk of t.tokens) {
      if (tk.type === 'image') {
        const p = getImg();
        if (p) {
          runs.push(new docxNs.ImageRun({
            data: p.bytes,
            transformation: { width: p.w, height: p.h },
            type: p.type
          }));
        } else {
          runs.push(new docxNs.TextRun({ text: `[图片]`, color: '888888' }));
        }
      } else {
        runs.push(...mdTextToRuns(tk.raw || tk.text || ''));
      }
    }
    return [new docxNs.Paragraph({
      children: runs,
      alignment: docxNs.AlignmentType.CENTER,
      spacing: { before: 120, after: 120 }
    })];
  };

  const out = [];
  (function walk(items) {
    for (const t of items) {
      switch (t.type) {
        case 'image':
          out.push(imgParagraph(t));
          break;
        case 'paragraph':
          if (isDocTocToken(t)) {
            extractHeadingsFromTokens(tokens).forEach((item) => {
              out.push(new docxNs.Paragraph({
                children: [new docxNs.TextRun({ text: item.text })],
                bullet: { level: Math.min(item.level, 4) },
                spacing: { after: 60 }
              }));
            });
            break;
          }
          out.push(...paragraphWithImages(t));
          break;
        case 'heading': {
          const depth = Math.min(t.depth || 1, 6);
          const headingMap = {
            1: docxNs.HeadingLevel.HEADING_1, 2: docxNs.HeadingLevel.HEADING_2, 3: docxNs.HeadingLevel.HEADING_3,
            4: docxNs.HeadingLevel.HEADING_4, 5: docxNs.HeadingLevel.HEADING_5, 6: docxNs.HeadingLevel.HEADING_6
          };
          out.push(new docxNs.Paragraph({
            children: mdTextToRuns(t.text),
            heading: headingMap[depth],
            spacing: { before: 240, after: 120 }
          }));
          break;
        }
        case 'blockquote':
          out.push(new docxNs.Paragraph({
            children: mdTextToRuns(t.text),
            indent: { left: 400 },
            border: { left: { style: 'single', size: 12, color: '999999' } },
            spacing: { after: 120 }
          }));
          break;
        case 'list': {
          (t.items || []).forEach((item, i) => {
            const itemText = item.text || '';
            out.push(new docxNs.Paragraph({
              children: mdTextToRuns(itemText),
              numbering: t.ordered ? { reference: 'ordered-list', level: 0 } : undefined,
              bullet: t.ordered ? undefined : { level: 0 },
              spacing: { after: 60 }
            }));
          });
          break;
        }
        case 'code': {
          const lines = (t.text || '').split('\n');
          out.push(new docxNs.Paragraph({
            children: lines.map((l, i) => new docxNs.TextRun({
              text: l + (i < lines.length - 1 ? '\n' : ''),
              font: 'Consolas',
              size: 18,
              shading: { type: 'clear', color: 'auto', fill: 'F5F5F5' }
            })),
            indent: { left: 300 },
            spacing: { after: 120 }
          }));
          break;
        }
        case 'table': {
          const headerRow = t.header || [];
          const rows = t.rows || [];
          const makeRow = (cells, isHeader) => new docxNs.TableRow({
            children: cells.map((cell) => new docxNs.TableCell({
              children: [new docxNs.Paragraph({
                children: mdTextToRuns(cell.text || ''),
                spacing: { after: 0 }
              })],
              shading: isHeader ? { type: 'clear', fill: 'EDEDED' } : undefined
            }))
          });
          const tableRows = [];
          if (headerRow.length) tableRows.push(makeRow(headerRow, true));
          rows.forEach(r => tableRows.push(makeRow(r, false)));
          if (tableRows.length) {
            out.push(new docxNs.Table({
              width: { size: 100, type: docxNs.WidthType.PERCENTAGE },
              rows: tableRows
            }));
          }
          break;
        }
        case 'space':
          out.push(new docxNs.Paragraph({ children: [] }));
          break;
        default:
          break;
      }
    }
  })(tokens);

  return out;
}

async function exportWord() {
  soundEngine.playClick();
  const title = getExportTitle();
  try {
    ensureMarkdownExtensions();
    docxNs = await import('docx');
    const { Document, Packer } = docxNs;
    const tokens = marked.lexer(stripYamlFrontMatter(markdownContent.value || ''));
    const children = await mdToDocxWithImages(tokens);

    const doc = new Document({
      creator: 'NiceMD',
      title,
      styles: {
        default: {
          document: {
            run: { font: 'PingFang SC', size: 24, color: '333333' }
          }
        }
      },
      numbering: {
        config: [{
          reference: 'ordered-list',
          levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left' }]
        }]
      },
      sections: [{ properties: {}, children }]
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, title + '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    logger.error('[NiceMD] docx export failed:', err);
    alert('导出 Word 失败：' + (err.message || '未知错误'));
  }
}

// ── PNG long-image export (Web desktop width 750px) ──
async function exportPNG() {
  soundEngine.playClick();
  if (!markdownContent.value) return;
  const title = getExportTitle();

  let host = null;
  try {
    const styledHtml = getStyledHtml();
    host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:750px;z-index:-9999;opacity:0.01;pointer-events:none;background:#ffffff;';
    const inner = document.createElement('div');
    inner.style.cssText = 'width:750px;padding:32px 40px;box-sizing:border-box;background:#ffffff;color:#2e3440;font-size:15px;line-height:1.8;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;';
    inner.innerHTML = styledHtml;
    host.appendChild(inner);
    document.body.appendChild(host);

    await prepareContainerImages(inner);

    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(inner, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 750
    });

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, title + '.png', 'image/png');
    }, 'image/png');
  } catch (err) {
    logger.error('[NiceMD] html2canvas Web PNG export failed:', err);
  } finally {
    if (host && host.parentNode) {
      document.body.removeChild(host);
    }
  }
}

// ── PDF export via browser print (iframe) ──
// (The html2pdf.js branch was dead code — the library was never imported,
// so export always fell through to here. The dependency is removed.)
function printViaIframe(bodyHtml, title) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 15mm; }
    }
    body {
      max-width: 750px;
      margin: 20px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #2e3440;
      background: #fff;
    }
    img { max-width: 100%; height: auto; }
    pre, code { font-family: "Fira Code", Consolas, Monaco, monospace; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

async function exportPDF(options = {}) {
  const { raw = false } = options;
  soundEngine.playClick();
  if (!markdownContent.value) return;
  const title = getExportTitle();

  let styledHtml = '';
  if (raw) {
    // Pure raw markdown HTML without WeChat preset theme styles or colors
    const rawHtml = parseMarkdownWithDocToc(markdownContent.value);
    styledHtml = cleanEmptyListItems(rawHtml);
  } else {
    styledHtml = getStyledHtml();
  }

  // Force Web mode container (750px desktop web width)
  let host = null;
  try {
    host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:750px;z-index:-9999;opacity:0.01;pointer-events:none;background:#ffffff;';
    const inner = document.createElement('div');
    
    if (raw) {
      inner.style.cssText = 'width:750px;padding:36px 48px;box-sizing:border-box;background:#ffffff;color:#24292f;font-size:15px;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Helvetica,Arial,sans-serif;';
    } else {
      inner.style.cssText = 'width:750px;padding:32px 40px;box-sizing:border-box;background:#ffffff;color:#2e3440;font-size:15px;line-height:1.8;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;';
    }
    inner.innerHTML = styledHtml;

    // Prepend plain GitHub-like unstyled document CSS if raw mode
    if (raw) {
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        h1, h2, h3, h4, h5, h6 { font-family: inherit; font-weight: 600; color: #1f2328; margin-top: 1.5em; margin-bottom: 0.6em; line-height: 1.25; }
        h1 { font-size: 2em; border-bottom: 1px solid #d8dee4; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #d8dee4; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        p { margin-top: 0; margin-bottom: 1em; }
        blockquote { padding: 0.5em 1em; color: #656d76; border-left: 0.25em solid #d0d7de; margin: 0 0 1em 0; background: #f6f8fa; border-radius: 0 4px 4px 0; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; font-family: Consolas, "Liberation Mono", Menlo, monospace; font-size: 13px; line-height: 1.45; }
        code { font-family: Consolas, "Liberation Mono", Menlo, monospace; font-size: 85%; background: rgba(175,184,193,0.2); padding: 0.2em 0.4em; border-radius: 6px; }
        pre code { background: transparent; padding: 0; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #d0d7de; padding: 8px 12px; }
        th { background: #f6f8fa; font-weight: 600; }
        ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 1em; }
        img { max-width: 100%; height: auto; }
      `;
      inner.insertBefore(styleTag, inner.firstChild);
    }

    host.appendChild(inner);
    document.body.appendChild(host);

    await prepareContainerImages(inner);

  } catch (err) {
    logger.warn('[NiceMD] PDF prepare failed, falling back to iframe print:', err);
  } finally {
    if (host && host.parentNode) {
      document.body.removeChild(host);
    }
  }

  printViaIframe(styledHtml, title);
}

const openLaunchpad = () => {
  soundEngine.playChime();
  isLaunchpadOpen.value = true;
};

const closeLaunchpad = () => {
  soundEngine.playClick('backspace');
  isLaunchpadOpen.value = false;
};

const isCollageModalOpen = ref(false);

const openCollageModal = () => {
  soundEngine.playClick();
  isCollageModalOpen.value = true;
};

const closeCollageModal = () => {
  soundEngine.playClick('backspace');
  isCollageModalOpen.value = false;
};

const handleInsertCollageImage = ({ markdown, url }) => {
  if (editorPanelRef.value?.insertTextAtCursor) {
    editorPanelRef.value.insertTextAtCursor(markdown);
  } else {
    markdownContent.value += '\n' + markdown + '\n';
  }
};

const settingsInitialTab = ref('');
const isSidebarSyncing = ref(false);

const CLOUD_SYNC_PROVIDER_NAMES = {
  tidb: 'TiDB Cloud',
  neon: 'Neon Postgres',
  github: 'GitHub 仓库',
};

const openSettings = (tab = '') => {
  soundEngine.playChime();
  settingsInitialTab.value = typeof tab === 'string' ? tab : '';
  isSettingsOpen.value = true;
};

async function handleSidebarCloudSync(action) {
  if (isSidebarSyncing.value) return;

  const info = getConfiguredCloudSyncInfo();
  if (!info.configured || !info.syncArg) {
    openSettings('cloud');
    return;
  }

  const provider = info.provider;
  const isGithub = provider === 'github';
  const targetLabel = isGithub ? 'GitHub 仓库' : '云端数据库';
  const providerLabel = CLOUD_SYNC_PROVIDER_NAMES[provider] || targetLabel;

  if (action === 'push') {
    const ok = await showConfirm({
      title: `全量备份到 ${targetLabel}`,
      message: `确认将本地全部文档、分组、历史版本和自定义主题完整备份至 ${providerLabel} 吗？云端已有记录将被更新。`,
      confirmText: '开始备份',
    });
    if (!ok) return;
  } else if (action === 'pull') {
    const ok = await showConfirm({
      title: `从 ${targetLabel} 还原数据`,
      message: `⚠️ 此操作将从 ${providerLabel} 拉取所有云端文档、分组、历史版本及自定义主题并更新本地，确定继续吗？`,
      confirmText: '立即拉取',
      danger: true,
    });
    if (!ok) return;
  } else if (action !== 'bidirectional') {
    return;
  }

  isSidebarSyncing.value = true;
  try {
    const localDocs = documents.value;
    const localGroups = groups.value;
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();

    if (action === 'push') {
      const res = await pushAllToCloud(
        info.syncArg,
        localDocs,
        localGroups,
        localHistories,
        localThemes,
        provider
      );
      soundEngine.playChime();
      triggerAppToast(`已推送 ${res.pushedDocs} 篇文档、${res.pushedGroups} 个分组到 ${providerLabel}`);
      return;
    }

    if (action === 'pull') {
      const res = await pullFromCloud(info.syncArg, provider);
      handleSyncComplete(res);
      soundEngine.playChime();
      triggerAppToast(`已从 ${providerLabel} 拉取 ${(res.docs || []).length} 篇文档、${(res.groups || []).length} 个分组`);
      return;
    }

    const res = await syncCloudBidirectional(
      info.syncArg,
      localDocs,
      localGroups,
      localHistories,
      localThemes,
      provider
    );
    handleSyncComplete(res);
    soundEngine.playChime();
    triggerAppToast(`双向同步完成：共 ${(res.docs || []).length} 篇文档、${(res.groups || []).length} 个分组`);
  } catch (err) {
    triggerAppToast('同步失败：' + (err?.message || '请检查网络与云端配置'));
  } finally {
    isSidebarSyncing.value = false;
  }
}

// ── Global App Toast ──
const appToastText = ref('');
let appToastTimer = null;

const triggerAppToast = (msg) => {
  appToastText.value = msg;
  clearTimeout(appToastTimer);
  appToastTimer = setTimeout(() => {
    appToastText.value = '';
  }, 2500);
};

// Renders html content helper for Launchpad
const getCompiledHtml = () => {
  if (!markdownContent.value) return '';
  const rawHtml = parseMarkdownWithDocToc(markdownContent.value);
  return cleanEmptyListItems(rawHtml);
};

const activeScrollPane = ref('editor');
const scrollPercentage = ref(0);
const syncScrollEnabled = ref(loadSyncScrollPreference());

function refreshGeneralSettings() {
  syncScrollEnabled.value = loadSyncScrollPreference();
}

// Modal & panel state
const isSettingsOpen = ref(false);
const isLaunchpadOpen = ref(false);
const showThemePanel = ref(false);

// Mobile layout views state
const mobileActiveView = ref('editor'); // 'editor' or 'preview'
const mobileSidebarOpen = ref(false);

const previewVisible = ref(localStorage.getItem('nicemd_preview_visible') !== 'false');
const togglePreview = () => {
  soundEngine.playClick();
  previewVisible.value = !previewVisible.value;
  localStorage.setItem('nicemd_preview_visible', previewVisible.value.toString());
};

const toggleMobileSidebar = () => {
  soundEngine.playClick();
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
};

const sidebarRef = ref(null);

const handleScroll = (percentage) => {
  if (!syncScrollEnabled.value) return;
  scrollPercentage.value = percentage;
};

const handleFocusActive = (pane) => {
  activeScrollPane.value = pane;
};

const handleEditorClick = () => {
  sidebarRef.value?.expandActiveGroup();
};

onMounted(async () => {
  // Item 4: decrypt stored credential envelopes into the session cache
  // BEFORE any cloud-sync init reads the configs (step 5 below). Legacy
  // plaintext configs are unaffected if unlock finds nothing to decrypt.
  try { await unlockSecureCredentials(); } catch { /* legacy path still works */ }

  // 1. Load persisted state
  documents.value = loadDocuments();
  groups.value = loadGroups();
  sidebarVisible.value = loadSidebarVisible();

  // 1.5 Sanitize legacy auto-generated h1 background from document customStyles
  let docModified = false;
  documents.value.forEach(doc => {
    if (doc.customStyles?.h1) {
      if (doc.customStyles.h1.display === 'block' || doc.customStyles.h1.padding === '10px 24px' || (doc.customStyles.h1.backgroundColor && doc.customStyles.h1.color === '#ffffff')) {
        delete doc.customStyles.h1.backgroundColor;
        delete doc.customStyles.h1.display;
        delete doc.customStyles.h1.padding;
        delete doc.customStyles.h1.borderRadius;
        delete doc.customStyles.h1.textAlign;
        if (doc.customStyles.h1.color === '#ffffff') {
          doc.customStyles.h1.color = '#2775b6';
        }
        docModified = true;
      }
    }
    if (doc.customStyles?.customCss && /#nice h1[^{]*\{[^}]*background-color:[^}]*\}/i.test(doc.customStyles.customCss)) {
      doc.customStyles.customCss = doc.customStyles.customCss.replace(/#nice h1[^{]*\{[^}]*background-color:[^}]*\}/gi, '');
      docModified = true;
    }
  });
  if (docModified) {
    saveDocuments(documents.value);
  }

  // 2. First-time migration: seed default document
  if (documents.value.length === 0) {
    const id = generateId();
    const now = Date.now();
    documents.value = [{
      id, title: '欢迎文档', content: defaultMarkdown,
	      groupId: null, createdAt: now, updatedAt: now,
	      customStyles: {}
	    }];
    saveDocuments(documents.value);
  }

  // 3. Restore open tabs & active document
  const persistedTabsExist = hasPersistedOpenTabs();
  const savedTabs = loadOpenTabs().filter(id => activeDocMap.value.has(id));
  const savedActiveId = loadActiveDocId();
  const explicitClosedAll = persistedTabsExist && savedTabs.length === 0 && !savedActiveId;
  const initialActiveId = explicitClosedAll
    ? null
    : (activeDocMap.value.has(savedActiveId)
        ? savedActiveId
        : (documents.value.find(d => !d.isDeleted && !d.is_deleted)?.id || documents.value[0]?.id || null));
  if (initialActiveId && !savedTabs.includes(initialActiveId)) {
    savedTabs.push(initialActiveId);
  }
  openTabIds.value = savedTabs;
  saveOpenTabs(savedTabs);
  activeDocId.value = initialActiveId;

  // 4. Apply theme
  applyTheme(currentTheme.value);
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-color-mode', 'light');
  try { localStorage.removeItem('nicemd_color_mode'); } catch (e) {}

  // Probe server default OSS image storage if available
  initStorageDefaultIfAvailable().then(() => refreshImageStorageSummary()).catch(() => {});

  document.addEventListener('mousedown', handleImageMenuPointerDown);
  document.addEventListener('keydown', handleImageMenuKeyDown);
  window.addEventListener(EDITOR_SETTINGS_UPDATED_EVENT, refreshGeneralSettings);

  // 5. Immediate Cloud Sync on boot if enabled
  if (isCloudSyncEnabled()) {
    triggerAutoSyncImmediate(
      documents.value,
      groups.value,
      getAllDocSnapshots(),
      loadCustomThemes(),
      null,
      (err, res) => {
        if (!err && res) {
          handleSyncComplete(res);
        }
      }
    );
  }

  // 6. Load custom themes from localStorage (append, never replace built-ins)
  try {
    const saved = JSON.parse(localStorage.getItem('nicemd_custom_themes'));
    if (saved && Array.isArray(saved)) {
      const knownIds = new Set(themePresets.map(t => t.id));
      saved.forEach(t => {
        if (t && t.id && !knownIds.has(t.id)) {
          themePresets.push(t);
          knownIds.add(t.id);
        }
      });
    }
  } catch {}

  // 6. Listen to messages from Chrome Assistant Extension
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || typeof event.data !== 'object') return;

    // Connection established (PONG)
    if (event.data && event.data.type === 'NICEMD_PONG') {
      if (!isExtensionConnected.value) {
        logger.info('[NiceMD App] Assistant Extension connection active.');
        isExtensionConnected.value = true;
        window.postMessage({ type: 'NICEMD_GET_PENDING_IMPORT' }, '*');
      }
    }

    // Pending import article retrieved
    if (event.data && event.data.type === 'NICEMD_GET_PENDING_IMPORT_RESPONSE') {
      if (event.data.success && event.data.article) {
        const article = event.data.article;
        logger.info('[NiceMD App] Loaded pending import article:', article.title);

        markdownContent.value = article.markdown;

        soundEngine.playChime();
        void fireConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    // Background notification that a new article has been imported
    if (event.data && event.data.type === 'NICEMD_IMPORT_NOTIFICATION') {
      logger.info('[NiceMD App] Received background import trigger.');
      window.postMessage({ type: 'NICEMD_GET_PENDING_IMPORT' }, '*');
    }
  });

  // 6. Ping helper extension to check if it's loaded
  setTimeout(() => {
    window.postMessage({ type: 'NICEMD_PING' }, '*');
  }, 1000);
});

onUnmounted(() => {
  stopTabDrag();
  closeTabMenu();
  clearTimeout(suppressClickTimer);
  clearTimeout(toolbarCopyTimer);
  document.removeEventListener('mousedown', handleImageMenuPointerDown);
  document.removeEventListener('keydown', handleImageMenuKeyDown);
  window.removeEventListener(EDITOR_SETTINGS_UPDATED_EVENT, refreshGeneralSettings);
});

// ── auto-save watchers ──
// Single debounced persistence path (item 1): the markdownContent /
// customStyles computed setters only mutate memory now. This 800ms
// debounce is the only local save for typing; beforeunload below is
// the crash/close safety net that flushes it synchronously.
let docSaveTimer = null;
watch(markdownContent, () => {
  clearTimeout(docSaveTimer);
  docSaveTimer = setTimeout(() => {
    saveDocuments(documents.value);
  }, 800);
});

// Flush any pending debounced save + realtime cloud writes before the
// tab closes, so the 800ms/1200ms debounce can never lose the last edit.
window.addEventListener('beforeunload', () => {
  clearTimeout(docSaveTimer);
  saveDocuments(documents.value);
  void flushPendingRealtimeSync();
});

watch(sidebarVisible, (val) => {
  saveSidebarVisible(val);
});

watch(customStyles, () => {
  clearTimeout(docSaveTimer);
  docSaveTimer = setTimeout(() => {
    saveDocuments(documents.value);
  }, 800);
}, { deep: true });
</script>

<template>
  <div class="app-container" :class="{ 'is-standalone-home': currentView === 'home' }" data-color-mode="light">
    <!-- 0. 官方独立全屏首页 (Wandor Liquid Glass Full Viewport Landing Page) -->
    <HomeLandingView
      v-if="currentView === 'home'"
      @enter-editor="(prompt) => {
        if (prompt && typeof prompt === 'string') {
          ensureActiveDoc();
          markdownContent = '# 创作草稿\n\n' + prompt;
        }
        currentView = 'editor';
      }"
      @open-templates="currentView = 'templates'"
      @open-materials="currentView = 'materials'"
      @open-launchpad="isLaunchpadOpen = true"
      @insert-sample="handleFillSample(); currentView = 'editor';"
      @import-file="(file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          ensureActiveDoc();
          markdownContent = e.target.result || '';
          currentView = 'editor';
        };
        reader.readAsText(file);
      }"
    />

    <!-- 工作台模式（含顶部 Header + 左侧 IconBar + 编辑排版双栏） -->
    <template v-else>
      <!-- Header spanning top full width -->
      <header class="app-header">
        <div class="header-left">
          <div class="wandor-brand-box" @click="currentView = 'home'">
            <BrandLogo :size="28" />
            <span class="wandor-wordmark">EASY MD</span>
            <span class="brand-studio-badge">STUDIO</span>
          </div>
          <button class="btn-menu-toggle" @click="toggleMobileSidebar" title="文档列表">
            <Menu size="18" />
          </button>
        </div>

        <!-- Mobile / Tablet View Switcher -->
        <div class="header-center" :class="{ 'is-workspace-centered': sidebarVisible && currentView === 'editor' }">
          <!-- Segmented View Switcher on Mobile/Tablet -->
          <div class="mobile-view-tabs">
            <button 
              class="tab-view-btn" 
              :class="{ 'is-active': mobileActiveView === 'editor' }" 
              @click="mobileActiveView = 'editor'"
            >
              编辑
            </button>
            <button 
              class="tab-view-btn" 
              :class="{ 'is-active': mobileActiveView === 'preview' }" 
              @click="mobileActiveView = 'preview'"
            >
              预览
            </button>
          </div>
        </div>
      </header>

      <!-- App Body: Left IconBar + Main Content -->
      <div class="app-body">
        <div class="app-left">
          <IconBar
            :sidebarVisible="sidebarVisible"
            :currentView="currentView"
            @toggle-tab="(tab) => {
              if (tab === 'home') { currentView = 'home'; }
              if (tab === 'docs') {
                if (currentView !== 'editor') currentView = 'editor';
                else sidebarVisible = !sidebarVisible;
              }
              if (tab === 'templates') { currentView = 'templates'; }
              if (tab === 'materials') { currentView = 'materials'; }
              if (tab === 'settings') openSettings();
              if (tab === 'launch') isLaunchpadOpen = true;
              if (tab === 'theme') toggleColorMode();
            }"
          />
        </div>

        <main class="app-main">
          <!-- Sidebar Backdrop on Mobile -->
          <div v-if="mobileSidebarOpen" class="sidebar-backdrop" @click="mobileSidebarOpen = false"></div>

          <!-- 左侧抽屉平滑滑入/滑出过渡 (Muse Glide Transition) -->
          <!-- P0-3: v-if 改 v-show。原来每次点“文档”都销毁重建整个
               Sidebar（重读 localStorage、重注册 7 个监听、每篇文档
               全文算字数），展开卡顿主因之一。v-show 只切换显示，
               组件常驻，状态与滚动位置都保留。移动端抽屉仍由
               mobile-drawer-open 类控制，不受影响。 -->
          <Transition name="sidebar-slide">
            <Sidebar
              ref="sidebarRef"
              :class="{ 'mobile-drawer-open': mobileSidebarOpen }"
              v-show="(sidebarVisible || mobileSidebarOpen) && currentView === 'editor'"
              :documents="documents"
              :groups="groups"
              :activeDocId="activeDocId"
              :currentView="currentView"
              :isCloudSyncing="isSidebarSyncing"
              @select-doc="(id) => { handleSelectDoc(id); currentView = 'editor'; mobileSidebarOpen = false; }"
              @create-doc="(groupId) => { handleCreateDoc(groupId); currentView = 'editor'; }"
              @open-templates="currentView = 'templates'"
              @open-materials="currentView = 'materials'"
              @open-doc-history="openDocHistory"
              @rename-doc="handleRenameDoc"
              @delete-doc="handleDeleteDoc"
              @restore-doc="handleRestoreDoc"
              @permanent-delete-doc="handlePermanentDeleteDoc"
              @empty-recycle-bin="handleEmptyRecycleBin"
              @create-group="handleCreateGroup"
              @rename-group="handleRenameGroup"
              @delete-group="handleDeleteGroup"
              @move-doc="handleMoveDoc"
              @reorder-docs="handleReorderDocs"
              @reorder-groups="handleReorderGroups"
              @duplicate-doc="handleDuplicateDoc"
              @toggle-pin="handleTogglePinDoc"
              @cloud-sync-action="handleSidebarCloudSync"
              @open-cloud-settings="openSettings('cloud')"
            />
          </Transition>

          <!-- 1. 模板中心 -->
          <TemplateCenter
            v-if="currentView === 'templates'"
            :current-theme="currentTheme"
            @apply-theme="handleApplyTheme"
            @save-theme="handleSaveTheme"
            @save-custom-theme="handleSaveCustomTheme"
            @back-to-editor="currentView = 'editor'"
          />

          <!-- 2. 素材中心 -->
          <MaterialCenter
            v-else-if="currentView === 'materials'"
            @insert-material="handleInsertMaterial"
            @apply-background="handleApplyBackground"
            @back-to-editor="currentView = 'editor'"
          />

          <!-- 3. 编辑与排版双栏工作台 -->
          <div v-else class="workspace-grid" :class="[`active-view-${mobileActiveView}`, { 'preview-hidden': !previewVisible, 'theme-panel-open': showThemePanel }]">
          <!-- Document Tabs Bar -->
          <div class="workspace-tabs" role="tablist" aria-label="已打开文档标签">
            <div
              ref="tabsScrollRef"
              class="workspace-tabs-scroll"
              :class="{ 'is-dragging': isDraggingTabs }"
              @wheel.prevent="handleTabsWheel"
              @mousedown="handleTabsMouseDown"
              @dragstart.prevent
            >
              <div
                v-for="tab in openTabs"
                :key="tab.id"
                :data-tab-id="tab.id"
                class="workspace-tab-item"
                :class="{ 'is-active': tab.id === activeDocId, 'is-renaming': renamingTabId === tab.id }"
                role="tab"
                :aria-selected="tab.id === activeDocId"
                @click="handleTabClick(tab.id)"
                @dblclick.stop="startRenameTab(tab)"
                @contextmenu.prevent.stop="openTabMenuFromContext($event, tab.id)"
                @mousedown.middle.prevent
                @auxclick.middle.stop="handleCloseTab(tab.id)"
              >
                <FileText size="12.5" class="workspace-tab-icon" />
                <span
                  v-if="renamingTabId !== tab.id"
                  class="workspace-tab-title"
                  :title="tab.title"
                  data-tooltip-truncated="true"
                >{{ tab.title }}</span>
                <input
                  v-else
                  ref="tabRenameInputRef"
                  v-model="tabRenameValue"
                  class="workspace-tab-input"
                  placeholder="输入文档名称"
                  @blur="confirmRenameTab"
                  @keyup.enter="confirmRenameTab"
                  @keyup.escape="cancelRenameTab"
                  @mousedown.stop
                  @click.stop
                  @dblclick.stop
                />
                <button
                  v-show="renamingTabId !== tab.id"
                  type="button"
                  class="workspace-tab-close"
                  data-no-tooltip="true"
                  aria-label="关闭标签页"
                  @click.stop="handleCloseTab(tab.id)"
                  @mouseenter="scheduleTabMenuHoverOpen($event.currentTarget, tab.id)"
                  @mouseleave="scheduleTabMenuClose"
                >
                  <X size="11.5" />
                </button>
              </div>
            </div>
            <button
              type="button"
              class="workspace-tab-add"
              title="新建文档标签"
              aria-label="新建文档标签"
              @click="handleCreateDoc(null)"
            >
              <Plus size="14" />
            </button>
          </div>

          <template v-if="openTabs.length > 0">
          <!-- Top Toolbar: editor-header spanning 100% width across the top of both columns -->
          <div class="editor-header workspace-toolbar">
            <div class="header-actions">
              <!-- Content Editing & Import Group -->
              <div class="toolbar-btn-group">
                <button @click="editorPanelRef?.openFindReplace()" class="btn-icon" title="查找与替换"><Search size="14.5" /></button>
                <button @click="editorPanelRef?.toggleUrlImport()" class="btn-icon" title="URL 文章抓取导入"><Link size="14.5" /></button>
                <div class="export-trigger-container" ref="imageMenuRef">
                  <button
                    @click="toggleImageMenu"
                    class="btn-icon"
                    :class="{ 'is-active': showImageMenu }"
                    title="上传图片与配置图床"
                  >
                    <ImagePlus size="14.5" />
                  </button>
                  <div class="header-popout-panel align-left image-popout-panel" v-if="showImageMenu">
                    <div class="popout-status">
                      <span class="popout-status-dot" :class="{ 'is-enabled': imageStorageSummary.enabled }"></span>
                      <span class="popout-status-text">
                        {{ imageStorageSummary.enabled ? `图床：${imageStorageSummary.label}` : '未启用图床（本地插入）' }}
                      </span>
                    </div>
                    <button class="popout-item" @click="handleToolbarImageUpload">
                      <ImagePlus size="14" />
                      <span>上传图片</span>
                    </button>
                    <div class="popout-divider"></div>
                    <button class="popout-item" @click="handleOpenImageStorageSettings">
                      <Settings size="14" />
                      <span>配置图床</span>
                    </button>
                  </div>
                </div>
                <button
                  @click="openCollageModal"
                  class="btn-icon"
                  title="封面拼图制作 (多格拼图与尺寸定制)"
                  aria-label="封面拼图制作"
                >
                  <LayoutGrid size="14.5" />
                </button>
                <div class="export-trigger-container">
                  <button @click="showImportMenu = !showImportMenu" class="btn-icon" :class="{ 'is-active': showImportMenu }" title="导入本地文档"><Upload size="14.5" /></button>
                  <div class="header-popout-panel" v-if="showImportMenu" @mouseleave="showImportMenu = false">
                    <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.md,.markdown'); showImportMenu = false"><FileCode size="14" /><span>Markdown (.md)</span></button>
                    <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.docx,.doc'); showImportMenu = false"><FileText size="14" /><span>Word (.docx)</span></button>
                    <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.html,.htm'); showImportMenu = false"><Globe size="14" /><span>HTML (.html)</span></button>
                    <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.txt'); showImportMenu = false"><FileCode size="14" /><span>纯文本 (.txt)</span></button>
                  </div>
                </div>
                <button @click="handleFillSample()" class="btn-icon btn-toolbar-sample" title="填充 Markdown 示例内容"><BookOpen size="13.5" /><span>示例</span></button>
              </div>

              <span class="toolbar-sep"></span>

              <!-- History & Undo/Redo Group -->
              <div class="toolbar-btn-group">
                <button @click="editorPanelRef?.handleUndo()" class="btn-icon" title="撤销 (Ctrl+Z)"><Undo2 size="14.5" /></button>
                <button @click="editorPanelRef?.handleRedo()" class="btn-icon" title="重做 (Ctrl+Y)"><Redo2 size="14.5" /></button>
                <button @click="openDocHistory(activeDocument)" class="btn-icon" title="历史版本与内容比对"><History size="14.5" /></button>
              </div>

              <span class="toolbar-sep"></span>

              <!-- Export & Clean Group -->
              <div class="toolbar-btn-group">
                <button
                  @click="handleCopyDocContent()"
                  class="btn-icon"
                  :class="{ 'is-copied': toolbarDocCopied }"
                  title="复制当前文档内容"
                >
                  <Check v-if="toolbarDocCopied" size="14.5" />
                  <Copy v-else size="14.5" />
                </button>
                <div class="export-trigger-container">
                  <button class="btn-icon" @click="showExportMenu = !showExportMenu" title="导出文件"><Download size="14.5" /></button>
                  <div class="header-popout-panel" v-if="showExportMenu" @mouseleave="showExportMenu = false">
                    <button class="popout-item" @click="exportMD(); showExportMenu = false"><FileCode size="14" /><span>Markdown</span></button>
                    <button class="popout-item" @click="exportHTML(); showExportMenu = false"><Globe size="14" /><span>HTML</span></button>
                    <button class="popout-item" @click="exportWord(); showExportMenu = false"><FileText size="14" /><span>Word (.docx)</span></button>
                    <button class="popout-item" @click="exportPDF(); showExportMenu = false"><Download size="14" /><span>PDF</span></button>
                    <button class="popout-item" @click="exportPDF({ raw: true }); showExportMenu = false"><Download size="14" /><span>PDF (无主题)</span></button>
                    <button class="popout-item" @click="exportPNG(); showExportMenu = false"><Image size="14" /><span>PNG 长图</span></button>
                  </div>
                </div>
                <button @click="editorPanelRef?.clearContent()" class="btn-icon btn-danger" title="清空内容"><Trash2 size="14.5" /></button>
              </div>

              <!-- Spacer pushing Theme & Code style dropdowns to the far right -->
              <span class="toolbar-spacer"></span>

              <!-- Document Theme Dropdown -->
              <div class="export-trigger-container">
                <button
                  class="btn-toolbar-dropdown"
                  :class="{ 'is-active': showDocThemeMenu }"
                  @click="showDocThemeMenu = !showDocThemeMenu; showCodeThemeMenu = false"
                  title="切换文章排版主题"
                >
                  <span
                    class="theme-swatch-dot"
                    :style="{ backgroundColor: activeThemeObj?.styles?.['--accent-color'] || '#116ACC' }"
                  ></span>
                  <span class="dropdown-label-prefix">主题</span>
                  <span class="dropdown-label-val">{{ activeThemeObj?.name || '山海' }}</span>
                  <ChevronDown size="12" class="dropdown-chevron" />
                </button>
                <div class="header-popout-panel" v-if="showDocThemeMenu" @mouseleave="showDocThemeMenu = false">
                  <button
                    v-for="t in themePresets"
                    :key="t.id"
                    class="popout-item"
                    :class="{ 'is-active': t.id === currentTheme }"
                    @click="changeTheme(t.id); showDocThemeMenu = false"
                  >
                    <span
                      class="theme-swatch-dot"
                      :style="{ backgroundColor: t.styles?.['--accent-color'] || '#116ACC' }"
                    ></span>
                    <span>{{ t.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Code Theme Dropdown -->
              <div class="export-trigger-container">
                <button
                  class="btn-toolbar-dropdown"
                  :class="{ 'is-active': showCodeThemeMenu }"
                  @click="showCodeThemeMenu = !showCodeThemeMenu; showDocThemeMenu = false"
                  title="切换代码块高亮主题"
                >
                  <Code2 size="13" class="dropdown-code-icon" />
                  <span class="dropdown-label-prefix">代码</span>
                  <span class="dropdown-label-val">{{ activeCodeThemeObj?.name || 'Atom One Dark' }}</span>
                  <ChevronDown size="12" class="dropdown-chevron" />
                </button>
                <div class="header-popout-panel" v-if="showCodeThemeMenu" @mouseleave="showCodeThemeMenu = false">
                  <button
                    v-for="ct in codeThemes"
                    :key="ct.id"
                    class="popout-item"
                    :class="{ 'is-active': ct.id === currentCodeTheme }"
                    @click="handleCodeThemeSelect(ct.id)"
                  >
                    <span>{{ ct.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Split Workspace Columns below Toolbar -->
          <div class="workspace-columns">
            <div class="workspace-column editor-column" @click="handleEditorClick">
              <EditorPanel
                ref="editorPanelRef"
                v-model="markdownContent"
                :docId="activeDocId || ''"
                :docTitle="activeDocument?.title ?? '未命名文档'"
                :scrollPercentage="scrollPercentage"
                :activePane="activeScrollPane"
                :syncScrollEnabled="syncScrollEnabled"
                :previewVisible="previewVisible"
                @import="handleImport"
                @scroll="handleScroll"
                @focusActive="handleFocusActive"
                @editor-click="handleEditorClick"
                @togglePreview="togglePreview"
                @toast="triggerAppToast"
              />
            </div>
            <div class="workspace-column preview-column">
              <PreviewPanel
                :markdown="markdownContent"
                :docTitle="activeDocument?.title ?? '未命名文档'"
                :themeId="currentTheme"
                :scrollPercentage="scrollPercentage"
                :activePane="activeScrollPane"
                :previewVisible="previewVisible"
                :customStyles="customStyles"
                :themePanelVisible="showThemePanel"
                @update:customStyles="customStyles = $event"
                @save-theme="handleSaveTheme"
                @save-custom-theme="handleSaveCustomTheme"
                @update:themePanelVisible="showThemePanel = $event"
                :codeThemeId="currentCodeTheme"
                @update:codeThemeId="handleCodeThemeChangeFromPreview"
                @scroll="handleScroll"
                @focusActive="handleFocusActive"
                @togglePreview="togglePreview"
                @open-launchpad="openLaunchpad"
              />
            </div>
          </div>
          </template>
          <div v-else class="workspace-empty-tabs-state">
            <div class="empty-tabs-card">
              <FileText size="28" class="empty-tabs-icon" />
              <div class="empty-tabs-title">暂无打开的文档标签</div>
              <div class="empty-tabs-desc">可从左侧文档列表点击打开已有文档，或直接新建空白文档开始写作。</div>
              <button type="button" class="btn-empty-new-tab" @click="handleCreateDoc(null)">
                <Plus size="14" />
                <span>新建空白文档</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

    <!-- Launchpad Modal -->
    <LaunchpadModal
      :isOpen="isLaunchpadOpen"
      :articleTitle="activeDocument?.title || ''"
      :markdown="markdownContent"
      :html="getCompiledHtml()"
      :themeId="currentTheme"
      :codeThemeId="currentCodeTheme"
      @close="closeLaunchpad"
    />

    <!-- Settings Modal -->
    <SettingsModal
      :isOpen="isSettingsOpen"
      :initialTab="settingsInitialTab"
      @close="isSettingsOpen = false; settingsInitialTab = ''; refreshImageStorageSummary()"
      @sync-complete="handleSyncComplete"
    />

    <!-- Document Version History & Diff Modal -->
    <DocHistoryModal
      :visible="historyModalVisible"
      :doc="historyTargetDoc"
      :currentContent="historyCurrentContent"
      :currentCustomStyles="historyCurrentCustomStyles"
      @close="historyModalVisible = false"
      @restore-version="handleRestoreVersion"
    />

    <!-- Cover Collage Modal -->
    <CoverCollageModal
      :isOpen="isCollageModalOpen"
      :markdown="markdownContent"
      @close="closeCollageModal"
      @insert-image="handleInsertCollageImage"
      @toast="triggerAppToast"
    />

    <!-- Tab Close Context / Hover Menu -->
    <Teleport to="body">
      <div
        v-if="tabMenuVisible"
        ref="tabMenuRef"
        class="tab-context-menu"
        :style="tabMenuStyle"
        role="menu"
        @mouseenter="clearTabMenuTimers"
        @mouseleave="scheduleTabMenuClose"
      >
        <template v-for="item in tabMenuItems" :key="item.key">
          <div v-if="item.dividerBefore" class="tab-menu-divider"></div>
          <button
            type="button"
            class="tab-menu-item"
            :class="{ 'is-disabled': item.disabled, 'is-danger': item.danger }"
            :disabled="item.disabled"
            role="menuitem"
            @click="handleSelectTabMenuItem(item)"
          >
            <component :is="item.icon" size="13.5" class="tab-menu-icon" />
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Teleport>

    <!-- Global Confirm Dialog -->
    <ConfirmDialog />

    <!-- Global App Floating Toast -->
    <Transition name="toast-fade">
      <div v-if="appToastText" class="app-floating-toast">
        <Sparkles size="14" class="toast-sparkle" />
        <span>{{ appToastText }}</span>
      </div>
    </Transition>
  </div>
</template>

<style src="./App.css"></style>
