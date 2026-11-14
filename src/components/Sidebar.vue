<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
/* P1-2: 图标语义修正（均已核对 @lucide/vue 存在）。
   - 删 Cloud（同步按钮统一用 RefreshCw，状态靠颜色/转速/绿点区分）
     与 FolderUp/FolderDown（易误读为移动文件夹，改 Upload/Download）
     与 ChevronsUpDown/ChevronsDownUp（两个方向几乎一样，改
     FoldVertical/UnfoldVertical）。
   - Folder/FolderOpen 现在真的用上了（替代手绘 CSS 文件夹）；
     GripVertical 留着，手动排序模式时用它表示可拖拽顺序。 */
import {
  Plus,
  FolderPlus,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  Pencil,
  Trash2,
  Trash,
  GripVertical,
  Check,
  X,
  RotateCcw,
  RefreshCw,
  Upload,
  Download,
  Settings,
  ArrowDownWideNarrow,
  FoldVertical,
  UnfoldVertical
} from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';
import SidebarDocItem from './SidebarDocItem.vue';
import { getConfiguredCloudSyncInfo } from '../utils/cloudSync';

const CLOUD_PROVIDER_LABELS = {
  tidb: 'TiDB Cloud',
  neon: 'Neon Postgres',
  github: 'GitHub 仓库',
};

const cloudSyncInfo = ref(getConfiguredCloudSyncInfo());
const showSyncMenu = ref(false);
const syncMenuRef = ref(null);

const currentProviderLabel = computed(() =>
  CLOUD_PROVIDER_LABELS[cloudSyncInfo.value.provider] || '云端同步'
);

const syncButtonTitle = computed(() => {
  if (props.isCloudSyncing) return '正在执行云端同步...';
  if (!cloudSyncInfo.value.configured) return '未设置自定义同步，点击前往配置';
  if (cloudSyncInfo.value.enabled) return `${currentProviderLabel.value} 实时同步已开启（点击选择同步操作）`;
  return `已配置 ${currentProviderLabel.value}（点击选择同步操作）`;
});

const syncMenuOptions = computed(() => {
  const isGithub = cloudSyncInfo.value.provider === 'github';
  const targetName = isGithub ? '仓库' : '云端';
  return [
    {
      action: 'bidirectional',
      title: '双向同步',
      desc: `合并本地和${targetName}最新内容`,
      icon: RefreshCw,
      colorClass: 'icon-blue',
    },
    {
      action: 'push',
      title: isGithub ? '推送到仓库' : '备份到云端',
      desc: `将本地文档与分组备份到${targetName}`,
      icon: Upload,
      colorClass: 'icon-green',
    },
    {
      action: 'pull',
      title: isGithub ? '从仓库拉取' : '从云端恢复',
      desc: `将${targetName}内容拉取还原到本地`,
      icon: Download,
      colorClass: 'icon-purple',
    },
  ];
});

function refreshCloudSyncState() {
  cloudSyncInfo.value = getConfiguredCloudSyncInfo();
}

function handleSyncTriggerClick() {
  if (props.isCloudSyncing) return;
  refreshCloudSyncState();
  if (!cloudSyncInfo.value.configured) {
    showSyncMenu.value = false;
    emit('open-cloud-settings');
    return;
  }
  showSyncMenu.value = !showSyncMenu.value;
}

function handleSelectSyncAction(action) {
  showSyncMenu.value = false;
  emit('cloud-sync-action', action, cloudSyncInfo.value.provider);
}

function handleOpenCloudSettings() {
  showSyncMenu.value = false;
  emit('open-cloud-settings');
}

function handleSyncMenuPointerDown(e) {
  if (showSyncMenu.value && syncMenuRef.value && !syncMenuRef.value.contains(e.target)) {
    showSyncMenu.value = false;
  }
}

function handleSyncMenuKeyDown(e) {
  if (e.key === 'Escape' && showSyncMenu.value) {
    showSyncMenu.value = false;
  }
}

onMounted(() => {
  refreshCloudSyncState();
  loadSavedSidebarWidth();
  window.addEventListener('nicemd-cloud-provider-changed', refreshCloudSyncState);
  window.addEventListener('nicemd-tidb-config-updated', refreshCloudSyncState);
  window.addEventListener('nicemd-neon-config-updated', refreshCloudSyncState);
  window.addEventListener('nicemd-github-config-updated', refreshCloudSyncState);
  window.addEventListener('storage', refreshCloudSyncState);
  document.addEventListener('mousedown', handleSyncMenuPointerDown);
  document.addEventListener('keydown', handleSyncMenuKeyDown);
  window.addEventListener('dragend', resetDragState);
});

onUnmounted(() => {
  if (cleanupResizeListeners) {
    cleanupResizeListeners();
    cleanupResizeListeners = null;
  }
  window.removeEventListener('nicemd-cloud-provider-changed', refreshCloudSyncState);
  window.removeEventListener('nicemd-tidb-config-updated', refreshCloudSyncState);
  window.removeEventListener('nicemd-neon-config-updated', refreshCloudSyncState);
  window.removeEventListener('nicemd-github-config-updated', refreshCloudSyncState);
  window.removeEventListener('storage', refreshCloudSyncState);
  document.removeEventListener('mousedown', handleSyncMenuPointerDown);
  document.removeEventListener('keydown', handleSyncMenuKeyDown);
  window.removeEventListener('dragend', resetDragState);
});

const props = defineProps({
  documents: { type: Array, required: true },
  groups: { type: Array, required: true },
  activeDocId: { type: String, default: null },
  currentView: { type: String, default: 'editor' },
  isCloudSyncing: { type: Boolean, default: false }
});

const emit = defineEmits([
  'select-doc', 'create-doc', 'rename-doc', 'delete-doc',
  'restore-doc', 'permanent-delete-doc', 'empty-recycle-bin',
  'create-group', 'rename-group', 'delete-group',
  'move-doc', 'reorder-docs', 'reorder-groups', 'toggle-collapse',
  'open-templates', 'open-materials', 'open-doc-history',
  'duplicate-doc', 'toggle-pin',
  'cloud-sync-action', 'open-cloud-settings', 'swipe-close', 'close-drawer'
]);

// ── Search, Filter & Sort State ──
const searchQuery = ref('');
const showSearchInput = ref(false);
// Opening a document must never change its position. Start with persisted order;
// explicit sort modes are only applied after the user chooses them.
const SORT_STORAGE_KEY = 'nicemd_doc_sort_v2';
const sortBy = ref(localStorage.getItem(SORT_STORAGE_KEY) || 'manual');
const lastSortMode = ref(sortBy.value === 'manual' ? 'updatedAt' : sortBy.value);

function toggleSorting() {
  if (sortBy.value === 'manual') {
    sortBy.value = lastSortMode.value;
    localStorage.setItem(SORT_STORAGE_KEY, lastSortMode.value);
    return;
  }
  lastSortMode.value = sortBy.value;
  sortBy.value = 'manual';
  localStorage.setItem(SORT_STORAGE_KEY, 'manual');
}

// 手机抽屉左滑关闭：只认“横向为主、左滑 >70px”的手势，竖向滚动不受影响；
// 不 preventDefault，所以抽屉里的竖滑、点按都照常。桌面端没有触摸，不触发。
// 父组件收到 swipe-close 后关抽屉（mobileSidebarOpen = false），桌面端它本来就是 false。
let drawerTouchStart = null;
function onDrawerTouchStart(e) {
  if (!e.touches || e.touches.length !== 1) return;
  drawerTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}
function onDrawerTouchEnd(e) {
  if (!drawerTouchStart || !e.changedTouches || e.changedTouches.length !== 1) {
    drawerTouchStart = null;
    return;
  }
  const dx = e.changedTouches[0].clientX - drawerTouchStart.x;
  const dy = e.changedTouches[0].clientY - drawerTouchStart.y;
  drawerTouchStart = null;
  if (dx < -70 && Math.abs(dx) > Math.abs(dy) * 1.5) emit('swipe-close');
}

const expandableGroupIds = computed(() => {
  if (props.groups.length === 0) return [];
  const ids = props.groups.map(group => group.id);
  if (filteredUngroupedDocs.value.length > 0) ids.push('__ungrouped__');
  return ids;
});

const areAllGroupsExpanded = computed(() =>
  expandableGroupIds.value.length > 0 && expandableGroupIds.value.every(id => expandedGroups.value.has(id))
);

function toggleAllGroups() {
  if (searchQuery.value.trim()) return;
  const next = new Set(expandedGroups.value);
  if (areAllGroupsExpanded.value) {
    expandableGroupIds.value.forEach(id => next.delete(id));
  } else {
    expandableGroupIds.value.forEach(id => next.add(id));
  }
  expandedGroups.value = next;
  saveExpandedGroups();
}

function isDocPinned(doc) {
  return Boolean(doc && (doc.isPinned === true || doc.isPinned === 1 || doc.isPinned === 'true'));
}

function sortDocList(list) {
  const pinned = [];
  const unpinned = [];
  for (const doc of list) {
    if (isDocPinned(doc)) pinned.push(doc);
    else unpinned.push(doc);
  }
  if (sortBy.value === 'manual') {
    return [...pinned, ...unpinned];
  }
  const compareDocs = (a, b) => {
    if (sortBy.value === 'updatedAt') {
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    }
    if (sortBy.value === 'createdAt') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (sortBy.value === 'title') {
      return (a.title || '').localeCompare(b.title || '', 'zh-CN');
    }
    return 0;
  };
  return [...pinned.sort(compareDocs), ...unpinned.sort(compareDocs)];
}

function toggleSearch() {
  showSearchInput.value = !showSearchInput.value;
  if (!showSearchInput.value) {
    searchQuery.value = '';
  }
}

// ── New Group Inline State ──
const isCreatingGroup = ref(false);
const newGroupName = ref('');
const newGroupInputRef = ref(null);
const sidebarBodyRef = ref(null);

function handleCreateGroupClick() {
  isCreatingGroup.value = true;
  newGroupName.value = '';
  nextTick(() => {
    newGroupInputRef.value?.focus();
  });
}

function handleSaveNewGroup() {
  if (!isCreatingGroup.value) return;
  const name = newGroupName.value.trim();
  if (name) {
    emit('create-group', name);
  }
  isCreatingGroup.value = false;
  newGroupName.value = '';
}

function handleCancelNewGroup() {
  isCreatingGroup.value = false;
  newGroupName.value = '';
}

// ── Group Expansion Persistence ──
const STORAGE_KEY_EXPANDED = 'nicemd_expanded_groups';
function loadExpandedGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPANDED);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set(['__ungrouped__']);
}

const expandedGroups = ref(loadExpandedGroups());

function saveExpandedGroups() {
  try {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify([...expandedGroups.value]));
  } catch (e) {}
}

function ensureGroupExpanded(groupKey) {
  if (!groupKey) return;
  if (!expandedGroups.value.has(groupKey)) {
    const s = new Set(expandedGroups.value);
    s.add(groupKey);
    expandedGroups.value = s;
    saveExpandedGroups();
  }
}

function handleCreateDoc(explicitGroupId = null) {
  const targetGroupId = explicitGroupId || null;
  ensureGroupExpanded(targetGroupId || '__ungrouped__');
  emit('create-doc', targetGroupId);
}

function handleCreateRootDoc() {
  handleCreateDoc(null);
}

function expandActiveGroup() {
  if (!props.activeDocId) return;
  const doc = props.documents.find(d => d.id === props.activeDocId);
  ensureGroupExpanded(doc?.groupId || '__ungrouped__');
  nextTick(() => {
    const activeEl = sidebarBodyRef.value?.querySelector('.file-row.selected');
    activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

watch(() => props.activeDocId, (newId) => {
  if (newId) {
    expandActiveGroup();
  }
}, { immediate: true });

defineExpose({
  expandActiveGroup
});
const renamingGroupId = ref(null);
const renameGroupValue = ref('');
const renameGroupInputRef = ref(null);

function toggleGroup(groupId) {
  if (groupId === '__trash__' && deletedDocs.value.length === 0) return;
  const s = new Set(expandedGroups.value);
  if (s.has(groupId)) s.delete(groupId); else s.add(groupId);
  expandedGroups.value = s;
  saveExpandedGroups();
}

function isGroupExpanded(groupId) {
  if (groupId === '__trash__' && deletedDocs.value.length === 0) return false;
  const q = searchQuery.value.trim();
  if (q) {
    if (groupId === '__ungrouped__') return filteredUngroupedDocs.value.length > 0;
    if (groupId === '__trash__') return filteredDeletedDocs.value.length > 0;
    return docsInGroup(groupId).length > 0;
  }
  return expandedGroups.value.has(groupId);
}

function focusRenameInput() {
  nextTick(() => {
    let el = renameGroupInputRef.value;
    if (Array.isArray(el)) el = el[0];
    if (el) {
      el.focus();
      el.select();
    }
  });
}

function startRenameGroup(group) {
  renamingGroupId.value = group.id;
  renameGroupValue.value = group.name;
  focusRenameInput();
}

function confirmRenameGroup() {
  if (renamingGroupId.value) {
    const name = renameGroupValue.value.trim() || '未命名分组';
    emit('rename-group', { id: renamingGroupId.value, name });
  }
  renamingGroupId.value = null;
}

async function handleDeleteGroup(group) {
  const ok = await showConfirm({
    title: '删除分组',
    message: `确定要删除「${group.name}」吗？分组内的文档将移至「未分组」。`,
    confirmText: '删除',
    danger: true
  });
  if (ok) emit('delete-group', group.id);
}

function isDocDeleted(d) {
  if (!d) return false;
  return Boolean(
    d.isDeleted === true ||
    d.isDeleted === 1 ||
    d.isDeleted === '1' ||
    d.isDeleted === 'true' ||
    d.is_deleted === 1 ||
    d.is_deleted === true ||
    d.is_deleted === '1' ||
    d.is_deleted === 'true'
  );
}

function matchesSearch(doc, q) {
  if (!q) return true;
  const titleMatch = (doc.title || '').toLowerCase().includes(q);
  const contentMatch = (doc.content || '').toLowerCase().includes(q);
  return titleMatch || contentMatch;
}

// ── Computed Filtered Lists ──
const filteredUngroupedDocs = computed(() => {
  const all = props.documents.filter(d => !isDocDeleted(d) && (!d.groupId || d.groupId === null));
  const q = searchQuery.value.trim().toLowerCase();
  const matched = q ? all.filter(d => matchesSearch(d, q)) : all;
  return sortDocList(matched);
});

// P0-4: 按 groupId 缓存的分组文档表。模板里每组原来调 3–4 次
// docsInGroup()，每次都全量 filter + 排序；现在一次 computed 建表，
// 模板只读缓存，documents / searchQuery / sortBy 变化时才重算。
const docsByGroup = computed(() => {
  const map = new Map();
  const q = searchQuery.value.trim().toLowerCase();
  for (const doc of props.documents) {
    if (isDocDeleted(doc)) continue;
    const gid = doc.groupId || null;
    if (!map.has(gid)) map.set(gid, []);
    map.get(gid).push(doc);
  }
  for (const [gid, list] of map) {
    const matched = q ? list.filter(d => matchesSearch(d, q)) : list;
    map.set(gid, sortDocList(matched));
  }
  return map;
});

function docsInGroup(groupId) {
  return docsByGroup.value.get(groupId) || [];
}

// ── 全局连续错峰序号 ── .nx-stagger-item 的 --nx-i 必须全列表连续，
// 不能按分组重置（笔记页 artifact 的毛病：每组从 0ms 重排，并行出现）。
// 顺序与模板一致：自定义分组按 groups 顺序，其次未分组；回收站是独立
// 列表，用自己的 docIndex，不走这里。
const staggerIndexById = computed(() => {
  const map = new Map();
  let i = 0;
  for (const group of props.groups) {
    for (const doc of docsInGroup(group.id)) map.set(doc.id, i++);
  }
  for (const doc of filteredUngroupedDocs.value) map.set(doc.id, i++);
  return map;
});
function staggerIndex(docId) {
  return staggerIndexById.value.get(docId) ?? 0;
}

const deletedDocs = computed(() => props.documents.filter(d => isDocDeleted(d)));

watch(() => deletedDocs.value.length, (len) => {
  if (len === 0 && expandedGroups.value.has('__trash__')) {
    const s = new Set(expandedGroups.value);
    s.delete('__trash__');
    expandedGroups.value = s;
    saveExpandedGroups();
  }
}, { immediate: true });

function formatTrashDocTime(doc) {
  const timestamp = doc.updatedAt || doc.createdAt;
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (date.toDateString() === now.toDateString()) return `今天 ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `昨天 ${time}`;
  if (date.getFullYear() === now.getFullYear()) return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${time}`;
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

function trashDocCharCount(doc) {
  const raw = doc.content || '';
  if (!raw) return 0;
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, match => match.replace(/```\w*\n?/g, ''))
    .replace(/[#*`~>\-[\]()!|]/g, '')
    .replace(/\s+/g, '').length;
}

const filteredDeletedDocs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const matched = q ? deletedDocs.value.filter(d => matchesSearch(d, q)) : deletedDocs.value;
  return sortDocList(matched);
});

async function handleSelectTrashDoc(doc) {
  const ok = await showConfirm({
    title: '恢复文档',
    message: `「${doc.title || '未命名文档'}」当前位于回收站中，是否立即恢复并打开编辑？`,
    confirmText: '恢复并打开',
    danger: false
  });
  if (ok) {
    emit('restore-doc', doc.id);
  }
}

function handleRestoreDoc(doc) {
  emit('restore-doc', doc.id);
}

async function handlePermanentDeleteDoc(doc) {
  const ok = await showConfirm({
    title: '彻底删除文档',
    message: `确定要彻底删除「${doc.title || '未命名文档'}」吗？此操作无法撤销！`,
    confirmText: '彻底删除',
    danger: true
  });
  if (ok) {
    emit('permanent-delete-doc', doc.id);
  }
}

async function handleEmptyTrashClick() {
  const ok = await showConfirm({
    title: '清空回收站',
    message: `确定要永久清空回收站中的 ${deletedDocs.value.length} 篇文档吗？此操作无法撤销！`,
    confirmText: '清空回收站',
    danger: true
  });
  if (ok) {
    emit('empty-recycle-bin');
  }
}

// ── Drag & Drop ──
const dragOverGroupId = ref(null);
const dragOverTrash = ref(false);
const draggingDoc = ref(null);

const isDraggingGroupedDoc = computed(() => Boolean(draggingDoc.value?.groupId));

function resetDragState() {
  dragOverGroupId.value = null;
  dragOverTrash.value = false;
  draggingDoc.value = null;
}

function handleDocDragStart(doc) {
  draggingDoc.value = doc || null;
}

function handleDocDragEnd() {
  resetDragState();
}

function isDocDragEvent(e) {
  return Boolean(e.dataTransfer?.types?.includes('application/nicemd-doc'));
}

function normalizeGroupId(groupId) {
  return (!groupId || groupId === '__ungrouped__' || groupId === '__default__') ? null : groupId;
}

function getActiveDocsInContainer(targetGroupId) {
  return props.documents.filter(d =>
    !isDocDeleted(d) && (targetGroupId === null ? !d.groupId : d.groupId === targetGroupId)
  );
}

function onListDragOver(e, groupId) {
  if (!isDocDragEvent(e)) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';
  dragOverTrash.value = false;
  dragOverGroupId.value = groupId || '__ungrouped__';
}

function onListDrop(e, groupId) {
  if (!isDocDragEvent(e)) {
    resetDragState();
    return;
  }
  const docId = e.dataTransfer.getData('application/nicemd-doc');
  if (!docId) {
    resetDragState();
    return;
  }
  e.preventDefault();
  e.stopPropagation();

  const targetGroupId = normalizeGroupId(groupId);
  ensureGroupExpanded(targetGroupId || '__ungrouped__');
  const listDocs = sortDocList(getActiveDocsInContainer(targetGroupId));
  const lastDoc = listDocs[listDocs.length - 1];
  if (lastDoc && lastDoc.id !== docId) {
    emit('reorder-docs', { docId, targetDocId: lastDoc.id, position: 'after' });
  } else {
    emit('move-doc', { docId, groupId: targetGroupId });
  }
  resetDragState();
}

function handleDocMove({ docId, targetDocId, position }) {
  emit('reorder-docs', { docId, targetDocId, position });
  resetDragState();
}

function onGroupHeaderDragOver(e, groupId) {
  if (isDocDragEvent(e)) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    dragOverTrash.value = false;
    dragOverGroupId.value = groupId;
  } else if (groupId !== '__ungrouped__' && e.dataTransfer?.types?.includes('application/nicemd-group')) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
}

function onGroupDragLeave(e) {
  if (!e.relatedTarget || !e.currentTarget?.contains(e.relatedTarget)) {
    dragOverGroupId.value = null;
  }
}

function onGroupHeaderDrop(e, groupId) {
  const docId = e.dataTransfer?.getData('application/nicemd-doc');
  if (docId) {
    e.preventDefault();
    e.stopPropagation();
    const targetGroupId = normalizeGroupId(groupId);
    ensureGroupExpanded(targetGroupId || '__ungrouped__');
    emit('move-doc', { docId, groupId: targetGroupId });
    resetDragState();
    return;
  }
  resetDragState();
  if (groupId === '__ungrouped__') return;
  const draggedGroupId = e.dataTransfer?.getData('application/nicemd-group');
  if (draggedGroupId && draggedGroupId !== groupId) {
    e.preventDefault();
    e.stopPropagation();
    emit('reorder-groups', { groupId: draggedGroupId, targetGroupId: groupId });
  }
}

function onGroupDragStart(e, groupId) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/nicemd-group', groupId);
}

function onTrashDragOver(e) {
  if (!isDocDragEvent(e)) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';
  dragOverGroupId.value = null;
  dragOverTrash.value = true;
}

function onTrashDragLeave(e) {
  if (!e.relatedTarget || !e.currentTarget?.contains(e.relatedTarget)) {
    dragOverTrash.value = false;
  }
}

function onTrashDrop(e) {
  dragOverTrash.value = false;
  if (!isDocDragEvent(e)) {
    resetDragState();
    return;
  }
  const docId = e.dataTransfer.getData('application/nicemd-doc') || e.dataTransfer.getData('text/plain');
  resetDragState();
  if (!docId) return;
  const doc = props.documents.find(d => d.id === docId);
  if (!doc || isDocDeleted(doc)) return;
  e.preventDefault();
  e.stopPropagation();
  emit('delete-doc', docId);
}

// ── Sidebar Resizing & Responsive Width ──
const SIDEBAR_WIDTH_KEY = 'nicemd_sidebar_custom_width';
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 640;

const sidebarContainerRef = ref(null);
const customSidebarWidth = ref(null);
const isResizing = ref(false);

function loadSavedSidebarWidth() {
  try {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= MIN_SIDEBAR_WIDTH && val <= MAX_SIDEBAR_WIDTH) {
        customSidebarWidth.value = val;
      }
    }
  } catch (err) {
    // Ignore storage errors in restricted contexts
  }
}

let cleanupResizeListeners = null;

function startResizing(e) {
  if (window.innerWidth <= 960) return;
  isResizing.value = true;
  const startX = e.clientX;
  const initialWidth = customSidebarWidth.value || sidebarContainerRef.value?.offsetWidth || 280;

  const onMouseMove = (moveEvent) => {
    if (!isResizing.value) return;
    const delta = moveEvent.clientX - startX;
    const maxAllowed = Math.min(MAX_SIDEBAR_WIDTH, Math.round(window.innerWidth * 0.45));
    const nextWidth = Math.min(Math.max(initialWidth + delta, MIN_SIDEBAR_WIDTH), maxAllowed);
    customSidebarWidth.value = Math.round(nextWidth);
  };

  const onMouseUp = () => {
    isResizing.value = false;
    if (cleanupResizeListeners) {
      cleanupResizeListeners();
      cleanupResizeListeners = null;
    }
    if (customSidebarWidth.value) {
      try {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, String(customSidebarWidth.value));
      } catch (err) {
        // Ignore storage errors
      }
    }
  };

  cleanupResizeListeners = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
  };

  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function resetSidebarWidth() {
  customSidebarWidth.value = null;
  try {
    localStorage.removeItem(SIDEBAR_WIDTH_KEY);
  } catch (err) {
    // Ignore storage errors
  }
}
</script>

<template>
  <aside
    ref="sidebarContainerRef"
    class="sidebar-container select-none"
    :class="{ 'is-resizing': isResizing }"
    :style="customSidebarWidth ? { width: `${customSidebarWidth}px`, flex: `0 0 ${customSidebarWidth}px` } : undefined"
    @touchstart.passive="onDrawerTouchStart"
    @touchend.passive="onDrawerTouchEnd"
  >
    <!-- Split Resizer Handle -->
    <div
      class="sidebar-resizer"
      @mousedown.prevent="startResizing"
      @dblclick="resetSidebarWidth"
      title="拖拽调整侧边栏宽度，双击恢复默认"
    ></div>
    <!-- Toolbar: 云端同步与文档操作 -->
    <div class="toolbar">
      <div class="toolbar-meta">
        <div class="sync-menu-container" ref="syncMenuRef">
          <button
            type="button"
            class="sync-trigger-btn"
            :class="{
              'is-active': cloudSyncInfo.enabled,
              'is-configured': cloudSyncInfo.configured && !cloudSyncInfo.enabled,
              'is-syncing': props.isCloudSyncing,
              'is-menu-open': showSyncMenu
            }"
            :title="syncButtonTitle"
            :aria-expanded="cloudSyncInfo.configured ? showSyncMenu : undefined"
            :disabled="props.isCloudSyncing"
            @click="handleSyncTriggerClick"
          >
            <!-- P1-2: 同步按钮统一用 RefreshCw，不再三种视觉语言混用：
                 未配置/已配置都是同一个图标，状态靠颜色、转速和绿点区分。 -->
            <RefreshCw size="13" class="sync-icon" :class="{ 'is-spinning': props.isCloudSyncing }" />
            <span v-if="cloudSyncInfo.enabled && !props.isCloudSyncing" class="dot"></span>
            <span class="sync-label">
              {{ props.isCloudSyncing ? '同步中...' : (cloudSyncInfo.enabled ? '已同步' : (cloudSyncInfo.configured ? '同步' : '云同步')) }}
            </span>
            <ChevronDown v-if="cloudSyncInfo.configured" size="12" class="sync-chevron" :class="{ 'is-open': showSyncMenu }" />
          </button>

          <Transition name="sync-dropdown">
            <div v-if="showSyncMenu && cloudSyncInfo.configured" class="sync-dropdown-menu" role="menu">
              <div class="sync-dropdown-header">
                <span class="sync-channel-name">{{ currentProviderLabel }}</span>
                <button type="button" class="sync-settings-link" @click="handleOpenCloudSettings" title="打开云端同步设置">
                  <Settings size="13" />
                  <span>配置</span>
                </button>
              </div>
              <button
                v-for="item in syncMenuOptions"
                :key="item.action"
                type="button"
                class="sync-dropdown-item"
                role="menuitem"
                @click="handleSelectSyncAction(item.action)"
              >
                <span class="sync-item-icon" :class="item.colorClass">
                  <component :is="item.icon" size="13" />
                </span>
                <span class="sync-item-copy">
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.desc }}</small>
                </span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
      <div class="toolbar-actions">
        <button class="create-action" @click="handleCreateRootDoc" title="新建文档" aria-label="新建文档">
          <Plus size="16" stroke-width="2.2" />
        </button>
        <button
          v-if="groups.length > 0"
          class="sidebar-toolbar-btn"
          :class="{ 'is-active': areAllGroupsExpanded }"
          @click="toggleAllGroups"
          :title="areAllGroupsExpanded ? '折叠全部文件夹' : '展开全部文件夹'"
          :aria-label="areAllGroupsExpanded ? '折叠全部文件夹' : '展开全部文件夹'"
          :aria-pressed="areAllGroupsExpanded"
          :disabled="Boolean(searchQuery.trim())"
        >
          <Transition name="toggle-icon-swap" mode="out-in">
            <!-- P1-2: 展开/折叠全部改用 FoldVertical/UnfoldVertical，
                 原来两个 Chevrons 方向几乎一样，分不清哪个是展开。 -->
            <FoldVertical v-if="areAllGroupsExpanded" key="collapse" size="15" stroke-width="2" />
            <UnfoldVertical v-else key="expand" size="15" stroke-width="2" />
          </Transition>
        </button>
        <button
          class="sidebar-toolbar-btn"
          :class="{ 'is-active': sortBy !== 'manual' }"
          @click="toggleSorting"
          :title="sortBy === 'manual' ? '手动顺序（可拖拽），点击按修改时间排序' : '已按时间排序，点击恢复手动顺序'"
          :aria-label="sortBy === 'manual' ? '启用排序' : '取消排序'"
          :aria-pressed="sortBy !== 'manual'"
        >
          <!-- P1-2: 图标按当前模式切换。手动模式用 GripVertical 表示
               可拖拽顺序；已排序时用 ArrowDownWideNarrow 表示按时间
               从新到旧。原来 ArrowUpDown 不表达当前模式。 -->
          <component :is="sortBy === 'manual' ? GripVertical : ArrowDownWideNarrow" size="15" stroke-width="2" />
        </button>
        <button class="sidebar-toolbar-btn" @click="handleCreateGroupClick" title="新建文件夹" aria-label="新建文件夹">
          <FolderPlus size="16" stroke-width="2" />
        </button>
        <button
          class="sidebar-toolbar-btn drawer-close-btn"
          @click="emit('close-drawer')"
          title="关闭文档列表"
          aria-label="关闭文档列表"
        >
          <X size="16" stroke-width="2.2" />
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <label class="search">
      <Search size="16" class="search-icon-inside" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文档标题或正文内容..."
      />
      <button 
        v-if="searchQuery" 
        class="search-clear-btn" 
        @click="searchQuery = ''"
        aria-label="清空搜索"
      >
        <X size="12" />
      </button>
    </label>

    <!-- Sidebar Body / Document Tree -->
    <div
      class="sidebar-body"
      ref="sidebarBodyRef"
      @dragover="onListDragOver($event, null)"
      @dragleave="onGroupDragLeave"
      @drop="onListDrop($event, null)"
    >
      <!-- Group Creation Inline Row (at top of list) -->
      <div v-if="isCreatingGroup" class="create-group-row">
        <Folder size="16" stroke-width="2" class="folder-lucide create-icon" />
        <input
          v-model="newGroupName"
          ref="newGroupInputRef"
          type="text"
          placeholder="输入文件夹名称回车新建..."
          class="create-group-input"
          @blur="handleSaveNewGroup"
          @keyup.enter="handleSaveNewGroup"
          @keyup.escape="handleCancelNewGroup"
        />
        <div class="create-group-actions">
          <button class="action-btn confirm-btn" @mousedown.prevent="handleSaveNewGroup" title="确认新建">
            <Check size="13" stroke-width="2" />
          </button>
          <button class="action-btn cancel-btn" @mousedown.prevent="handleCancelNewGroup" aria-label="取消">
            <X size="13" stroke-width="2" />
          </button>
        </div>
      </div>

      <!-- Mode A: 无自定义分组时平铺展示文档 -->
      <div
        v-if="groups.length === 0"
        class="doc-list flat-doc-list"
        @dragover="onListDragOver($event, null)"
        @drop="onListDrop($event, null)"
      >
        <!-- 搜索过滤是原位显隐（TransitionGroup + :key 复用节点），
             不重建 DOM、不丢滚动/悬停状态；不匹配的行淡出+缩放离开，
             匹配的行淡入+缩放进入，剩余行 FLIP 平移。 -->
        <TransitionGroup name="nx-search-filter" tag="div">
          <SidebarDocItem
            v-for="doc in filteredUngroupedDocs"
            :key="doc.id"
            :style="{ '--nx-i': staggerIndex(doc.id) }" class="nx-stagger-item"
            :doc="doc"
            :isActive="doc.id === activeDocId"
            :searchQuery="searchQuery"
            @select="id => $emit('select-doc', id)"
            @rename="payload => $emit('rename-doc', payload)"
            @delete="id => $emit('delete-doc', id)"
            @move-doc="handleDocMove"
            @history="doc => $emit('open-doc-history', doc)"
            @duplicate="doc => $emit('duplicate-doc', doc)"
            @toggle-pin="doc => $emit('toggle-pin', doc)"
            @drag-start="handleDocDragStart"
            @drag-end="handleDocDragEnd"
          />
        </TransitionGroup>
        <div v-if="filteredUngroupedDocs.length === 0" class="empty-group-drop-hint">
          <span>{{ searchQuery ? '无匹配文档' : '暂无文档，点击上方「新建文档」开始写作' }}</span>
        </div>
      </div>

      <!-- Mode B: 存在自定义分组时显示分组与「未分组」 -->
      <template v-else>
        <!-- 自定义分组列表 -->
        <section
          v-for="group in groups"
          :key="group.id"
          class="folder"
        >
          <div
            class="folder-row"
            :class="{ 
              'is-drop-target': dragOverGroupId === group.id,
              'is-renaming': renamingGroupId === group.id
            }"
            :draggable="renamingGroupId !== group.id"
            @click="renamingGroupId === group.id ? null : toggleGroup(group.id)"
            @dragstart="onGroupDragStart($event, group.id)"
            @dragover="onGroupHeaderDragOver($event, group.id)"
            @dragenter="onGroupHeaderDragOver($event, group.id)"
            @dragleave="onGroupDragLeave"
            @drop="onGroupHeaderDrop($event, group.id)"
          >
            <!-- P1-5: chevron 改单个 ChevronRight + 旋转 90° 过渡。
                 原来 v-if 在两个图标间切换，.chevron 的 0.28s 过渡是死代码。 -->
            <span class="chevron" :class="{ 'is-open': isGroupExpanded(group.id) }">
              <ChevronRight size="13" stroke-width="2.2" />
            </span>
            <!-- P1-2: 文件夹改回 Lucide Folder/FolderOpen，展开态切换。
                 原来是手绘 CSS 文件夹，与 Lucide 描边风格不一致，深色
                 模式还漏了琥珀色版。 -->
            <FolderOpen v-if="isGroupExpanded(group.id)" size="16" stroke-width="2" class="folder-lucide" />
            <Folder v-else size="16" stroke-width="2" class="folder-lucide" />

            <!-- group name display -->
            <span
              v-if="renamingGroupId !== group.id"
              class="folder-name"
              @dblclick.stop="startRenameGroup(group)"
              :title="group.name"
              data-tooltip-truncated="true"
            >{{ group.name }}</span>

            <!-- group name edit -->
            <input
              v-else
              v-model="renameGroupValue"
              class="group-rename-input"
              ref="renameGroupInputRef"
              @blur="confirmRenameGroup"
              @keyup.enter="confirmRenameGroup"
              @keyup.escape="renamingGroupId = null"
              @click.stop
              @mousedown.stop
              @dblclick.stop
            />

            <div v-show="renamingGroupId !== group.id" class="folder-right">
              <span class="count">{{ docsInGroup(group.id).length }}</span>
              <div class="folder-actions" @click.stop>
                <button class="mini-btn" @click="handleCreateDoc(group.id)" title="在此分组新建文档">
                  <Plus size="14" stroke-width="2" />
                </button>
                <button class="mini-btn" @click="startRenameGroup(group)" title="重命名分组">
                  <Pencil size="14" stroke-width="2" />
                </button>
                <button class="mini-btn" @click="handleDeleteGroup(group)" title="删除分组">
                  <Trash2 size="14" stroke-width="2" />
                </button>
              </div>
            </div>
          </div>

          <!-- P1-5: v-show 改 class 控制的 grid-template-rows 0fr→1fr
               过渡，展开/折叠有动画；内容包在 .children-inner 里裁剪。 -->
          <div
            class="children"
            :class="{ 'is-expanded': isGroupExpanded(group.id) }"
            @dragover="onListDragOver($event, group.id)"
            @dragleave="onGroupDragLeave"
            @drop="onListDrop($event, group.id)"
          >
            <div class="children-inner">
            <TransitionGroup name="nx-search-filter" tag="div">
            <SidebarDocItem
              v-for="doc in docsInGroup(group.id)"
              :key="doc.id"
          :style="{ '--nx-i': staggerIndex(doc.id) }" class="nx-stagger-item"
              :doc="doc"
              :isActive="doc.id === activeDocId"
              :searchQuery="searchQuery"
              @select="id => $emit('select-doc', id)"
              @rename="payload => $emit('rename-doc', payload)"
              @delete="id => $emit('delete-doc', id)"
              @move-doc="handleDocMove"
              @history="doc => $emit('open-doc-history', doc)"
              @duplicate="doc => $emit('duplicate-doc', doc)"
              @toggle-pin="doc => $emit('toggle-pin', doc)"
              @drag-start="handleDocDragStart"
              @drag-end="handleDocDragEnd"
            />
            </TransitionGroup>
            <div v-if="docsInGroup(group.id).length === 0" class="empty-group-drop-hint">
              <span>{{ searchQuery ? '无匹配文档' : '暂无文档，可拖拽至此' }}</span>
            </div>
            </div>
          </div>
        </section>

        <!-- 未分组 -->
        <section
          v-if="filteredUngroupedDocs.length > 0 || dragOverGroupId === '__ungrouped__' || isDraggingGroupedDoc"
          class="folder ungrouped-folder"
        >
          <div
            class="folder-row"
            :class="{ 'is-drop-target': dragOverGroupId === '__ungrouped__' }"
            @click="toggleGroup('__ungrouped__')"
            @dragover="onGroupHeaderDragOver($event, '__ungrouped__')"
            @dragenter="onGroupHeaderDragOver($event, '__ungrouped__')"
            @dragleave="onGroupDragLeave"
            @drop="onGroupHeaderDrop($event, '__ungrouped__')"
          >
            <span class="chevron" :class="{ 'is-open': isGroupExpanded('__ungrouped__') }">
              <ChevronRight size="13" stroke-width="2.2" />
            </span>
            <FolderOpen v-if="isGroupExpanded('__ungrouped__')" size="16" stroke-width="2" class="folder-lucide gray" />
            <Folder v-else size="16" stroke-width="2" class="folder-lucide gray" />
            <span class="folder-name">未分组</span>
            <div class="folder-right">
              <span class="count">{{ filteredUngroupedDocs.length }}</span>
              <div class="folder-actions" @click.stop>
                <button class="mini-btn" @click="handleCreateRootDoc" title="在未分组新建文档">
                  <Plus size="14" stroke-width="2" />
                </button>
              </div>
            </div>
          </div>

          <div
            class="children"
            :class="{ 'is-expanded': isGroupExpanded('__ungrouped__') || (filteredUngroupedDocs.length === 0 && isDraggingGroupedDoc) }"
            @dragover="onListDragOver($event, '__ungrouped__')"
            @dragleave="onGroupDragLeave"
            @drop="onListDrop($event, '__ungrouped__')"
          >
            <div class="children-inner">
            <TransitionGroup name="nx-search-filter" tag="div">
            <SidebarDocItem
              v-for="doc in filteredUngroupedDocs"
              :key="doc.id"
          :style="{ '--nx-i': staggerIndex(doc.id) }" class="nx-stagger-item"
              :doc="doc"
              :isActive="doc.id === activeDocId"
              :searchQuery="searchQuery"
              @select="id => $emit('select-doc', id)"
              @rename="payload => $emit('rename-doc', payload)"
              @delete="id => $emit('delete-doc', id)"
              @move-doc="handleDocMove"
              @history="doc => $emit('open-doc-history', doc)"
              @duplicate="doc => $emit('duplicate-doc', doc)"
              @toggle-pin="doc => $emit('toggle-pin', doc)"
              @drag-start="handleDocDragStart"
              @drag-end="handleDocDragEnd"
            />
            </TransitionGroup>
            <div v-if="filteredUngroupedDocs.length === 0" class="empty-group-drop-hint">
              <span>{{ searchQuery ? '无匹配文档' : '暂无文档，可拖拽至此' }}</span>
            </div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- ── 底部固定回收站 ── -->
    <div
      class="bottom"
      :class="{
        'is-doc-dragging': Boolean(draggingDoc),
        'is-trash-drop-target': dragOverTrash
      }"
      @dragover="onTrashDragOver"
      @dragenter="onTrashDragOver"
      @dragleave="onTrashDragLeave"
      @drop="onTrashDrop"
    >
      <div
        class="trash"
        :class="{ 'is-empty': deletedDocs.length === 0 }"
        @click="toggleGroup('__trash__')"
      >
        <span v-if="deletedDocs.length > 0" class="chevron" :class="{ 'is-open': isGroupExpanded('__trash__') }">
          <ChevronRight size="13" stroke-width="2.2" />
        </span>
        <Trash2 size="15" stroke-width="1.8" class="trash-icon" />
        <span class="trash-name">回收站</span>
        <span v-if="dragOverTrash" class="trash-drop-badge">松开移入</span>
        <span v-if="deletedDocs.length > 0" class="count">{{ deletedDocs.length }}</span>
        <button
          v-if="deletedDocs.length > 0"
          type="button"
          class="trash-clear-btn"
          @click.stop="handleEmptyTrashClick"
          title="永久删除回收站中的全部文档"
        >
          <!-- P1-2: 清空是永久删除，用 Trash（张开的垃圾桶）与
               “移至回收站”的 Trash2 区分开，且本身已是红色。 -->
          <Trash size="14" stroke-width="2" />
          <span>清空</span>
        </button>
      </div>

      <div
        v-show="deletedDocs.length > 0 && isGroupExpanded('__trash__')"
        class="trash-doc-list"
      >
        <div
          v-for="(doc, docIndex) in filteredDeletedDocs"
          :key="doc.id"
          class="trash-doc-item nx-stagger-item"
          :style="{ '--nx-i': docIndex }"
          :class="{ 'selected': doc.id === activeDocId }"
          @click="handleSelectTrashDoc(doc)"
        >
          <div class="file-copy">
            <span class="file-name" :title="doc.title || '未命名文档'" data-tooltip-truncated="true">{{ doc.title || '未命名文档' }}</span>
            <div class="meta">{{ formatTrashDocTime(doc) }} · {{ trashDocCharCount(doc) }}字</div>
          </div>
          <div class="trash-item-actions" @click.stop>
            <button class="trash-action-btn restore-btn" @click="handleRestoreDoc(doc)" title="恢复文档">
              <RotateCcw size="14" stroke-width="2" />
              <span>恢复</span>
            </button>
            <button class="trash-action-btn delete-btn" @click="handlePermanentDeleteDoc(doc)" title="彻底删除">
              <Trash size="14" stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-container {
  position: relative;
  width: clamp(17rem, 20vw, 24rem);
  min-width: 13.75rem;
  container: docs-sidebar / inline-size;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.88);
  border-right: 1px solid #e7edf5;
  padding: 10px 12px 10px;
  overflow: hidden;
  z-index: 4;
  box-sizing: border-box;
  backdrop-filter: blur(18px);
  transition: background 0.2s var(--ease-glide), border-color 0.2s var(--ease-glide);
}

.sidebar-container.is-resizing {
  transition: none !important;
  user-select: none !important;
}

/* P0-3: 滑入/滑出期间去掉 backdrop-filter: blur(18px)，否则 0.36s 内
   每帧重算背景模糊。过渡类由 Vue 加在根元素上，scoped 选择器
   优先级高于 .sidebar-container 的 blur 声明。 */
.sidebar-container.sidebar-slide-enter-active,
.sidebar-container.sidebar-slide-leave-active {
  backdrop-filter: none;
}

.sidebar-resizer {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 50;
  background: transparent;
}

.sidebar-resizer::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2px;
  width: 2px;
  background: transparent;
  transition: background 0.12s var(--ease-glide);
}

.sidebar-resizer:hover::after,
.sidebar-container.is-resizing .sidebar-resizer::after {
  background: #3289f5;
}

@media (max-width: 960px) {
  .sidebar-resizer {
    display: none !important;
  }
  /* 移动端抽屉才有的关闭 ×：桌面侧边栏常驻，不需要它。 */
  .drawer-close-btn {
    display: flex !important;
    width: 36px;
    height: 36px;
  }
}

/* 桌面端不显示抽屉关闭按钮（见上方 ≤960px 规则）。 */
.drawer-close-btn {
  display: none;
}

html.dark .sidebar-container {
  background: #18191f;
  border-right-color: rgba(255, 255, 255, 0.08);
}

/* Compact document creation action in the toolbar */
.create-action {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  color: #347fe5;
  background: #edf4ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s var(--ease-glide), color 0.2s var(--ease-glide), transform 0.12s var(--ease-glide);
}

.create-action svg {
  transition: transform 0.45s var(--ease-spring);
  transform-origin: center;
}

.create-action:hover svg {
  transform: rotate(90deg);
}

.create-action:active {
  transform: scale(0.93);
}

.create-action:hover {
  color: #fff;
  background: #347fe5;
}

/* 触屏：新建按钮 30px 点按热区扩到 36px，视觉图标不变。 */
@media (hover: none) {
  .create-action {
    width: 36px;
    height: 36px;
  }
}

html.dark .create-action {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.14);
}

html.dark .create-action:hover {
  color: #fff;
  background: #347fe5;
}

/* ── 2. Toolbar (.toolbar) ── */
.toolbar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 2px 10px;
  flex-shrink: 0;
}

.toolbar-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  flex: 0 0 auto;
}

.sync-menu-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sync-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: #52647d;
  font-family: inherit;
  font-size: 0.78125rem;
  font-weight: 550;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide), color 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide);
}

.sync-trigger-btn:hover:not(:disabled),
.sync-trigger-btn.is-menu-open {
  background: #f0f5fb;
  color: #1e293b;
}

.sync-trigger-btn.is-configured {
  color: #475569;
}

.sync-trigger-btn.is-active {
  color: #334155;
}

.sync-trigger-btn.is-syncing {
  background: #edf5ff;
  color: #2678e8;
}

.sync-trigger-btn:disabled {
  opacity: 0.8;
  cursor: wait;
}

.sync-label {
  line-height: 1;
}

.sync-icon {
  flex-shrink: 0;
  color: #71839d;
  transition: transform var(--motion-base) var(--ease-out);
}

.sync-trigger-btn.is-syncing .sync-icon {
  color: #2678e8;
}

.sync-icon.is-spinning {
  animation: sync-spin 0.9s linear infinite;
}

@keyframes sync-spin {
  to { transform: rotate(360deg); }
}

.sync-chevron {
  color: #94a3b8;
  margin-left: -1px;
  transition: transform 0.16s ease, color 0.12s var(--ease-glide);
}

.sync-trigger-btn:hover .sync-icon:not(.is-spinning) {
  transform: rotate(45deg);
}

.sync-trigger-btn:hover .sync-chevron,
.sync-trigger-btn.is-menu-open .sync-chevron {
  color: #64748b;
}

.sync-chevron.is-open {
  transform: rotate(180deg);
}

.dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  /* E. 同步完成轻反馈：绿点出现时脉冲一次，不弹 Toast */
  animation: nx-dot-pulse 900ms var(--ease-out) 1;
}

/* Sync Dropdown Menu */
.sync-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: min(232px, calc(100cqw - 24px));
  min-width: 192px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 5px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.05);
  z-index: 80;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sync-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 6px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 2px;
}

.sync-channel-name {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

.sync-settings-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border: 0;
  background: transparent;
  padding: 2px 6px;
  border-radius: 5px;
  color: #3b82f6;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide);
}

.sync-settings-link:hover {
  background: rgba(59, 130, 246, 0.1);
}

.sync-dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide);
}

.sync-dropdown-item:hover {
  background: #f1f5f9;
}

.sync-item-icon {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sync-item-icon.icon-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.sync-item-icon.icon-green {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.sync-item-icon.icon-purple {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}

.sync-item-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sync-item-copy strong {
  font-size: 12px;
  font-weight: 650;
  color: #1e293b;
  line-height: 1.25;
}

.sync-item-copy small {
  font-size: 10px;
  color: #64748b;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sync-dropdown-enter-active,
.sync-dropdown-leave-active {
  /* B. 同步下拉按触发角（左上）缩放长出，入场弹簧、出场 150ms 快收 */
  transition: opacity var(--motion-base) var(--ease-enter), transform var(--motion-base) var(--ease-enter);
  transform-origin: top left;
}

.sync-dropdown-leave-active {
  transition: opacity 150ms var(--ease-exit), transform 150ms var(--ease-exit);
}

.sync-dropdown-enter-from,
.sync-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(.96);
}

html.dark .sync-trigger-btn {
  background: transparent;
  color: #94a3b8;
}

html.dark .sync-trigger-btn:hover:not(:disabled),
html.dark .sync-trigger-btn.is-menu-open {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

html.dark .sync-trigger-btn.is-configured,
html.dark .sync-trigger-btn.is-active {
  color: #cbd5e1;
}

html.dark .sync-trigger-btn.is-syncing {
  background: rgba(59, 130, 246, 0.14);
  color: #60a5fa;
}

html.dark .sync-trigger-btn .sync-icon {
  color: #94a3b8;
}

html.dark .sync-trigger-btn.is-syncing .sync-icon {
  color: #60a5fa;
}

html.dark .sync-dropdown-menu {
  background: #1e2028;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}

html.dark .sync-dropdown-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

html.dark .sync-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.07);
}

html.dark .sync-item-copy strong {
  color: #f1f5f9;
}

html.dark .sync-item-copy small,
html.dark .sync-channel-name {
  color: #94a3b8;
}

.sidebar-toolbar-btn,
.icon-btn {
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: #71839d;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s var(--ease-glide), color 0.2s var(--ease-glide), transform 0.12s var(--ease-glide);
}

.sidebar-toolbar-btn:hover,
.icon-btn:hover {
  background: #f0f5fb;
  color: #2678e8;
}

.sidebar-toolbar-btn:active,
.icon-btn:active {
  transform: scale(0.93);
}

.toggle-icon-swap-enter-active,
.toggle-icon-swap-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.toggle-icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.toggle-icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.sidebar-toolbar-btn.is-active,
.icon-btn.is-active {
  background: #edf5ff;
  color: #2678e8;
}

.sidebar-toolbar-btn:disabled,
.icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sidebar-toolbar-btn:disabled:hover,
.icon-btn:disabled:hover {
  background: transparent;
  color: #71839d;
}

html.dark .sidebar-toolbar-btn:hover,
html.dark .icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #60a5fa;
}

html.dark .sidebar-toolbar-btn.is-active,
html.dark .icon-btn.is-active {
  background: rgba(59, 130, 246, 0.14);
  color: #60a5fa;
}

/* ── 3. Search Bar (.search) ── */
.search {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid #dfe7f1;
  border-radius: 11px;
  background: #ffffff;
  box-shadow: none;
  margin-bottom: 10px;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: border-color 0.12s var(--ease-glide), box-shadow 0.12s var(--ease-glide);
}

.search:focus-within {
  border-color: #2678e8;
  box-shadow: 0 0 0 3px rgba(38, 120, 232, 0.12);
}

html.dark .search {
  background: #1e1e24;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.search-icon-inside {
  color: #7488a5;
  flex: none;
}

.search input {
  width: 0;
  min-width: 0;
  flex: 1 1 auto;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 0.8125rem;
  color: #1e293b;
  font-family: inherit;
}

html.dark .search input {
  color: #f1f5f9;
}

.search input::placeholder {
  color: #a1adbd;
}

.search-clear-btn {
  background: transparent;
  border: none;
  color: #7488a5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
}

.search-clear-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #1e293b;
}

/* ── 4. Inline Create Group Row ── */
.create-group-row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 8px;
  margin: 4px 0 6px;
  border: 1px solid #2678e8;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

html.dark .create-group-row {
  background: #1e1e24;
}

.create-icon {
  flex-shrink: 0;
}

.create-group-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  font-size: 0.8125rem;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #1e293b;
  outline: none;
  font-family: inherit;
}

html.dark .create-group-input {
  color: #f1f5f9;
}

.create-group-input::placeholder {
  color: #94a3b8;
  font-size: 0.75rem;
}

.create-group-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #71839d;
  border-radius: var(--sidebar-radius-sm, 8px);
  cursor: pointer;
  transition: background 0.12s var(--ease-glide), color 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide);
  flex-shrink: 0;
}

.action-btn:hover {
  background: #edf1f6;
  color: #1e293b;
}

.action-btn.confirm-btn:hover {
  background: #eaf3ff;
  color: #2678e8;
}

/* ── 5. Tree & Folders ── */
.sidebar-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
  display: flex;
  flex-direction: column;
}

.sidebar-body::-webkit-scrollbar {
  width: 5px;
}
.sidebar-body::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.sidebar-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.folder {
  margin-top: 5px;
  border-radius: 10px;
}

.folder-row {
  display: flex;
  align-items: center;
  min-height: 35px;
  padding: 0 8px;
  gap: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  border-radius: var(--sidebar-radius, 10px);
  cursor: pointer;
  transition: background 0.2s var(--ease-glide), transform 0.2s var(--ease-glide);
  background: transparent;
  user-select: none;
  box-sizing: border-box;
}

/* P0-2: hover 只改背景色。原来的 translateX(1.5px) 会让整行在鼠标
   滑过时横移，悬停边缘反复进出 hover；:active 的 scale 同理去掉。 */
.folder-row:hover {
  background: var(--sidebar-hover, #f5f8fc);
}

.folder-row:focus-visible,
.trash:focus-visible,
.sidebar-toolbar-btn:focus-visible,
.icon-btn:focus-visible {
  outline: 2px solid #2678e8;
  outline-offset: 1px;
}

.folder-row.is-drop-target {
  background: #eaf3ff;
  box-shadow: inset 0 0 0 1.5px #2678e8;
}

html.dark .folder-row {
  color: #f1f5f9;
}

html.dark .folder-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chevron {
  width: 14px;
  color: #72849e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s var(--ease-spring);
}

/* P1-5: 单个 ChevronRight 旋转 90° 表示展开。 */
.chevron.is-open {
  transform: rotate(90deg);
}

/* P1-2: 文件夹图标改回 Lucide Folder/FolderOpen。原来是手绘 CSS
   文件夹（1.6px 描边 + 奶油填充），与全站 Lucide 线条风格不一致，
   深色模式还漏了琥珀色版。Lucide 是描边图标，深色下无需另配底色。 */
.folder-lucide {
  color: #f0a13b;
  flex: none;
  display: flex;
  align-items: center;
}

.folder-lucide.gray {
  color: #8ea0b8;
}

html.dark .folder-lucide.gray {
  color: #94a3b8;
}

.folder-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-rename-input {
  flex: 1;
  min-width: 0;
  height: 24px;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0 5px;
  border: 1px solid #2678e8;
  border-radius: 4px;
  background: #ffffff;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;
}

html.dark .group-rename-input {
  background: #1e1e24;
  color: #f1f5f9;
}

/* P0-1: 右侧区域定宽，计数与操作按钮绝对定位叠放，只切换
   opacity / visibility，不再 display: none ↔ flex。原来 hover 瞬间
   右侧从 ~30px 的计数跳成 ~70px 的 3 个按钮，整行重排导致抖动。
   定宽 88px 是按 P1 的 28px 按钮算的：3×28 + 2×2 gap = 88。 */
.folder-right {
  margin-left: auto;
  position: relative;
  width: 88px;
  height: 28px;
  flex-shrink: 0;
}

.folder-right .count,
.folder-right .folder-actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity 0.12s var(--ease-glide), visibility 0.12s var(--ease-glide);
}

.count {
  margin-left: auto;
  min-width: 23px;
  height: 23px;
  padding: 0 7px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: #edf1f6;
  color: #78879b;
  font-size: 0.6875rem;
  font-weight: 700;
}

.folder-right .count,
.trash > .count {
  margin-left: 0;
}

html.dark .count {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.folder-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  visibility: hidden;
}

.folder-row:hover .count,
.folder-row:focus-within .count {
  opacity: 0;
  visibility: hidden;
}

.folder-row:hover .folder-actions,
.folder-row:focus-within .folder-actions {
  opacity: 1;
  visibility: visible;
}

@media (hover: none) {
  /* 触屏没有 hover，操作按钮常显，否则分组操作够不着。 */
  .folder-right .folder-actions {
    opacity: 1;
    visibility: visible;
  }
  .folder-right .count {
    opacity: 0;
    visibility: hidden;
  }
}

.mini-btn {
  background: transparent;
  border: none;
  color: #78879b;
  width: 28px;
  height: 28px;
  border-radius: var(--sidebar-radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide), color 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide);
  padding: 0;
}

/* E. 按钮按压 scale(.97)，只给工具栏/操作按钮，不给文字链接 */
.create-action:active,
.sidebar-toolbar-btn:active,
.icon-btn:active,
.mini-btn:active,
.action-btn:active {
  transform: scale(.97);
}

.mini-btn:hover {
  background: #edf1f6;
  color: #1e293b;
}

html.dark .mini-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

/* Children tree indentation line */
/* P1-5: 展开/折叠用 grid-template-rows 0fr→1fr 过渡。原来是 v-show
   瞬间跳变。内容包在 .children-inner 里做 overflow 裁剪；收起时
   visibility 延迟隐藏，避免收起过程中内容闪现。 */
.children {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  margin-left: 16px;
  padding-left: 9px;
  border-left: 1px solid #e4ebf4;
  min-height: 0;
  transition: grid-template-rows 0.36s var(--ease-glide), visibility 0s linear 0.36s;
}

.children.is-expanded {
  grid-template-rows: 1fr;
  visibility: visible;
  padding-bottom: 4px;
  transition: grid-template-rows 0.36s var(--ease-glide), visibility 0s;
}

.children-inner {
  overflow: hidden;
  min-height: 0;
}

html.dark .children {
  border-left-color: rgba(255, 255, 255, 0.1);
}

.flat-doc-list {
  padding: 0;
  min-height: 14px;
}

/* ── 5b. 搜索过滤原位过渡（nx-search-filter / TransitionGroup）──
   不重建 DOM：匹配行淡入+缩放进入，不匹配行淡出+缩放离开，剩余行
   FLIP 平移；只用 opacity / transform。搜索框本身已有 focus-within
   3px 光圈（.search:focus-within），保持不变。
   另：分组计数用的 docsInGroup().length 本来就是过滤后的长度（见
   docsByGroup），搜索时自动显示过滤后计数，无需再改。 */
.nx-search-filter-enter-active {
  transition: opacity .25s var(--ease-spring), transform .25s var(--ease-spring);
}
.nx-search-filter-leave-active {
  transition: opacity .2s var(--ease-exit), transform .2s var(--ease-exit);
}
.nx-search-filter-enter-from,
.nx-search-filter-leave-to {
  opacity: 0;
  transform: scale(.96) translateY(2px);
}
.nx-search-filter-move {
  transition: transform .25s var(--ease-spring);
}

.empty-group-drop-hint {
  padding: 7px 10px;
  margin: 3px 0 5px;
  font-size: 0.75rem;
  color: #94a3b8;
  border: 1px dashed #dce5f0;
  background: transparent;
  border-radius: 8px;
  text-align: center;
  user-select: none;
  transition: background 0.12s var(--ease-glide), color 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide);
  /* 无结果提示淡入（搜索切到“无匹配文档”时不再生硬出现） */
  animation: nx-empty-fade-in .25s var(--ease-out) both;
}
@keyframes nx-empty-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

html.dark .empty-group-drop-hint {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.1);
}

/* ── 6. Bottom / Recycle Bin (.bottom / .trash) ── */
.bottom {
  border-top: 1px solid #eef2f7;
  padding-top: 8px;
  margin-top: 8px;
  flex-shrink: 0;
  transition: border-color 0.12s var(--ease-glide);
}

html.dark .bottom {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.trash {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 7px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: #52647d;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide), box-shadow 0.12s var(--ease-glide), color 0.12s var(--ease-glide);
  user-select: none;
}

.trash:hover {
  background: #f5f8fc;
}

.trash.is-empty {
  cursor: default;
}

.trash.is-empty:hover {
  background: transparent;
}

.bottom.is-doc-dragging .trash {
  border-style: dashed;
  border-color: #cbd5e1;
}

.bottom.is-trash-drop-target .trash {
  background: #fff1f2;
  border-style: solid;
  border-color: #ef4444;
  box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.bottom.is-trash-drop-target .trash-icon {
  color: #ef4444;
}

html.dark .trash {
  color: #94a3b8;
}

html.dark .trash:hover {
  background: rgba(255, 255, 255, 0.05);
}

html.dark .trash.is-empty:hover {
  background: transparent;
}

html.dark .bottom.is-doc-dragging .trash {
  border-color: rgba(255, 255, 255, 0.14);
}

html.dark .bottom.is-trash-drop-target .trash {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(248, 113, 113, 0.65);
  box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.25);
  color: #fca5a5;
}

html.dark .bottom.is-trash-drop-target .trash-icon {
  color: #f87171;
}

.trash-drop-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  white-space: nowrap;
}

html.dark .trash-drop-badge {
  background: rgba(248, 113, 113, 0.2);
  color: #fca5a5;
}

.trash-icon {
  color: #94a3b8;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.trash-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trash .count {
  margin-left: auto;
}

.trash-clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 0 0 auto;
  min-height: 26px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #d45454;
  font: inherit;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide);
}

.trash-clear-btn:hover {
  background: #fff1f1;
  border-color: #f6d4d4;
}

.trash-clear-btn:focus-visible {
  outline: 2px solid #dc6464;
  outline-offset: 1px;
}

html.dark .trash-clear-btn {
  color: #f28b8b;
}

html.dark .trash-clear-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.2);
}

.trash-doc-list {
  margin-top: 3px;
  padding: 2px 0 2px 21px;
  max-height: 200px;
  overflow-y: auto;
}

html.dark .trash-doc-list {
  background: transparent;
}

.trash-doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 9px;
  min-height: 52px;
  border-radius: 10px;
  cursor: pointer;
  margin: 2px 0;
  transition: background 0.12s var(--ease-glide), box-shadow 0.12s var(--ease-glide);
  min-width: 0;
  box-sizing: border-box;
}

.trash-doc-item:hover {
  background: var(--sidebar-hover, #f5f8fc);
}

.trash-doc-item.selected {
  background: var(--sidebar-selected, #eaf3ff);
  box-shadow: inset 2px 0 0 #2678e8, inset 0 0 0 1px #e1eaf7;
}

html.dark .trash-doc-item:hover {
  background: var(--sidebar-hover, rgba(255, 255, 255, 0.06));
}

html.dark .trash-doc-item.selected {
  background: var(--sidebar-selected, rgba(59, 130, 246, 0.12));
  box-shadow: inset 2px 0 0 #60a5fa, inset 0 0 0 1px rgba(96, 165, 250, 0.18);
}

.trash-doc-item .file-name {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: inherit;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: #1e293b;
}

html.dark .trash-doc-item .file-name {
  color: #f1f5f9;
}

.trash-doc-item .file-copy {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.trash-doc-item .file-name {
  display: block;
}

.trash-doc-item .meta {
  margin-top: 3px;
  color: #718198;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

html.dark .trash-doc-item .meta {
  color: #94a3b8;
}

/* P0-1 同理：回收站操作区常驻布局，只切换透明度。原来 hover 才
   display: flex，文件名会被突然出现的按钮挤压。 */
.trash-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex: 0 0 auto;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.12s var(--ease-glide), visibility 0.12s var(--ease-glide);
}

.trash-doc-item:hover .trash-item-actions,
.trash-doc-item:focus-within .trash-item-actions {
  opacity: 1;
  visibility: visible;
}

@media (hover: none) {
  .trash-item-actions {
    opacity: 1;
    visibility: visible;
  }
}

.trash-action-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  font-size: 0.6875rem;
  border-radius: var(--sidebar-radius-sm, 8px);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s var(--ease-glide), color 0.12s var(--ease-glide), border-color 0.12s var(--ease-glide);
  flex: 0 0 auto;
  white-space: nowrap;
}

.trash-action-btn.restore-btn {
  color: #10b981;
  background: transparent;
  min-height: 28px;
}

.trash-action-btn.restore-btn:hover {
  background: rgba(16, 185, 129, 0.1);
}

.trash-action-btn.delete-btn {
  color: #ef4444;
  padding: 3px 5px;
}

.trash-action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.12);
}

.text-danger {
  color: #ef4444 !important;
}

.text-danger:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

@container docs-sidebar (max-width: 280px) {
  .toolbar {
    flex-wrap: wrap;
    gap: 4px;
    margin: 12px 0 8px;
  }

  .toolbar-meta {
    min-height: 28px;
  }

  .sync-trigger-btn {
    height: 28px;
    padding: 0 7px;
    font-size: 0.75rem;
  }

  .toolbar-actions {
    margin-left: auto;
    gap: 2px;
  }

  .create-action,
  .sidebar-toolbar-btn,
  .icon-btn {
    width: 28px;
    height: 28px;
  }

  .search {
    height: 36px;
    margin-bottom: 8px;
  }

  .folder-row {
    min-height: 38px;
    padding-inline: 7px;
    gap: 7px;
  }

  .children {
    margin-left: 13px;
    padding-left: 7px;
  }

  .trash {
    gap: 6px;
    padding: 7px 6px;
  }

  .trash-clear-btn {
    min-height: 24px;
    padding-inline: 6px;
  }

  .trash-doc-list {
    max-height: 150px;
  }

  .trash-doc-item {
    gap: 6px;
    padding: 6px 4px;
  }

  .trash-item-actions {
    gap: 2px;
  }

  .trash-action-btn {
    padding-inline: 4px;
    font-size: 0.625rem;
  }

  .trash-action-btn.delete-btn {
    width: 22px;
    height: 24px;
    justify-content: center;
    padding: 3px 4px;
  }
}
</style>
