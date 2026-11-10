<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import {
  Plus,
  FolderPlus,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  GripVertical,
  Check,
  X,
  Cloud,
  RotateCcw,
  FileText,
  ArrowUpDown,
  ChevronsUpDown
} from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';
import SidebarDocItem from './SidebarDocItem.vue';
import { isCloudSyncEnabled, getActiveCloudProvider } from '../utils/cloudSync';

const CLOUD_PROVIDER_LABELS = {
  tidb: 'TiDB Cloud (MySQL)',
  neon: 'Neon (Postgres)',
  github: 'GitHub 仓库',
};

const currentCloudProvider = ref(getActiveCloudProvider());
const isCloudSyncActive = ref(isCloudSyncEnabled());

const cloudSyncTitle = computed(() => {
  const provider = CLOUD_PROVIDER_LABELS[currentCloudProvider.value] || '云端同步';
  return `${provider} 实时同步已开启`;
});

function refreshCloudSyncState() {
  currentCloudProvider.value = getActiveCloudProvider();
  isCloudSyncActive.value = isCloudSyncEnabled();
}

onMounted(() => {
  refreshCloudSyncState();
  loadSavedSidebarWidth();
  window.addEventListener('nicemd-cloud-provider-changed', refreshCloudSyncState);
  window.addEventListener('nicemd-tidb-config-updated', refreshCloudSyncState);
  window.addEventListener('nicemd-neon-config-updated', refreshCloudSyncState);
  window.addEventListener('nicemd-github-config-updated', refreshCloudSyncState);
  window.addEventListener('storage', refreshCloudSyncState);
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
});

const props = defineProps({
  documents: { type: Array, required: true },
  groups: { type: Array, required: true },
  activeDocId: { type: String, default: null },
  currentView: { type: String, default: 'editor' }
});

const emit = defineEmits([
  'select-doc', 'create-doc', 'rename-doc', 'delete-doc',
  'restore-doc', 'permanent-delete-doc', 'empty-recycle-bin',
  'create-group', 'rename-group', 'delete-group',
  'move-doc', 'reorder-docs', 'reorder-groups', 'toggle-collapse',
  'open-templates', 'open-materials', 'open-doc-history',
  'duplicate-doc', 'toggle-pin'
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

function sortDocList(list) {
  if (sortBy.value === 'manual') return list;
  return [...list].sort((a, b) => {
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
  });
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
  return new Set(['__ungrouped__', '__default__']);
}

const expandedGroups = ref(loadExpandedGroups());

function saveExpandedGroups() {
  try {
    localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify([...expandedGroups.value]));
  } catch (e) {}
}

function handleCreateDoc(explicitGroupId = null) {
  let targetGroupId = explicitGroupId;
  // If no explicit group passed, intelligently default to the active document's group if one exists
  if (!targetGroupId && props.activeDocId) {
    const activeDoc = props.documents.find(d => d.id === props.activeDocId && !isDocDeleted(d));
    if (activeDoc && activeDoc.groupId) {
      targetGroupId = activeDoc.groupId;
    }
  }

  const groupKey = targetGroupId || '__ungrouped__';
  const s = new Set(expandedGroups.value);
  if (!s.has(groupKey)) {
    s.add(groupKey);
    expandedGroups.value = s;
    saveExpandedGroups();
  }
  emit('create-doc', targetGroupId);
}

function expandActiveGroup() {
  if (props.activeDocId) {
    const doc = props.documents.find(d => d.id === props.activeDocId);
    const groupId = doc?.groupId || '__ungrouped__';
    const s = new Set(expandedGroups.value);
    if (!s.has(groupId)) {
      s.add(groupId);
      expandedGroups.value = s;
      saveExpandedGroups();
    }
    nextTick(() => {
      const activeEl = sidebarBodyRef.value?.querySelector('.sidebar-doc-item.is-active, .doc-item.is-active, .doc-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
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
  const s = new Set(expandedGroups.value);
  if (s.has(groupId)) s.delete(groupId); else s.add(groupId);
  expandedGroups.value = s;
  saveExpandedGroups();
}

function isGroupExpanded(groupId) {
  const q = searchQuery.value.trim();
  if (q) {
    if (groupId === '__default__' || groupId === '__ungrouped__') return filteredUngroupedDocs.value.length > 0;
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
    message: `确定要删除「${group.name}」吗？分组内的文档将移到「未分类」。`,
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

function docsInGroup(groupId) {
  const all = props.documents.filter(d => !isDocDeleted(d) && d.groupId === groupId);
  const q = searchQuery.value.trim().toLowerCase();
  const matched = q ? all.filter(d => matchesSearch(d, q)) : all;
  return sortDocList(matched);
}

const deletedDocs = computed(() => props.documents.filter(d => isDocDeleted(d)));

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

function onListDragOver(e, groupId) {
  if (!e.dataTransfer.types.includes('application/nicemd-doc')) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onListDrop(e, groupId) {
  const docId = e.dataTransfer.getData('application/nicemd-doc');
  if (!docId) return;
  const targetGroupId = (groupId === '__default__' || groupId === '__ungrouped__' || groupId === null) ? null : groupId;
  const listDocs = targetGroupId === null
    ? props.documents.filter(d => !d.groupId || d.groupId === null)
    : props.documents.filter(d => d.groupId === targetGroupId);
  const lastDoc = listDocs[listDocs.length - 1];
  if (lastDoc && lastDoc.id !== docId) {
    e.preventDefault();
    e.stopPropagation();
    emit('reorder-docs', { docId, targetDocId: lastDoc.id, position: 'after' });
  } else {
    e.preventDefault();
    e.stopPropagation();
    emit('move-doc', { docId, groupId: targetGroupId });
  }
}

function handleDocMove({ docId, targetDocId, position }) {
  emit('reorder-docs', { docId, targetDocId, position });
}

function onGroupHeaderDragOver(e, groupId) {
  if (e.dataTransfer.types.includes('application/nicemd-doc')) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    dragOverGroupId.value = groupId;
  } else if (e.dataTransfer.types.includes('application/nicemd-group')) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
}

function onGroupDragLeave() {
  dragOverGroupId.value = null;
}

function onGroupHeaderDrop(e, groupId) {
  dragOverGroupId.value = null;
  const docId = e.dataTransfer.getData('application/nicemd-doc');
  if (docId) {
    e.preventDefault();
    e.stopPropagation();
    const targetGroupId = (groupId === '__default__' || groupId === '__ungrouped__' || groupId === null) ? null : groupId;
    emit('move-doc', { docId, groupId: targetGroupId });
    return;
  }
  const draggedGroupId = e.dataTransfer.getData('application/nicemd-group');
  if (draggedGroupId && draggedGroupId !== groupId && groupId !== '__default__') {
    e.preventDefault();
    e.stopPropagation();
    emit('reorder-groups', { groupId: draggedGroupId, targetGroupId: groupId });
  }
}

function onGroupDragStart(e, groupId) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/nicemd-group', groupId);
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
  >
    <!-- Split Resizer Handle -->
    <div
      class="sidebar-resizer"
      @mousedown.prevent="startResizing"
      @dblclick="resetSidebarWidth"
      title="拖拽调整侧边栏宽度，双击恢复默认"
    ></div>
    <!-- Toolbar: 我的文档 -->
    <div class="toolbar">
      <div class="toolbar-meta">
        <div class="heading">我的文档</div>
        <div v-if="isCloudSyncActive" class="sync" :title="cloudSyncTitle" aria-label="云端同步已开启">
          <RotateCcw size="11" class="sync-icon" />
          <span class="sync-label">已同步</span>
          <span class="dot"></span>
        </div>
      </div>
      <div class="toolbar-actions">
        <button class="create-action" @click="handleCreateDoc(null)" title="新建文档" aria-label="新建文档">
          <Plus size="16" stroke-width="2.2" />
        </button>
        <button
          v-if="groups.length > 0"
          class="icon-btn"
          :class="{ 'is-active': areAllGroupsExpanded }"
          @click="toggleAllGroups"
          :title="areAllGroupsExpanded ? '折叠全部文件夹' : '展开全部文件夹'"
          :aria-label="areAllGroupsExpanded ? '折叠全部文件夹' : '展开全部文件夹'"
          :disabled="Boolean(searchQuery.trim())"
        >
          <ChevronsUpDown size="15" stroke-width="2" />
        </button>
        <button
          class="icon-btn"
          :class="{ 'is-active': sortBy !== 'manual' }"
          @click="toggleSorting"
          :title="sortBy === 'manual' ? '启用按修改时间排序' : '取消排序，恢复手动顺序'"
          :aria-label="sortBy === 'manual' ? '启用排序' : '取消排序'"
          :aria-pressed="sortBy !== 'manual'"
        >
          <ArrowUpDown size="15" stroke-width="2" />
        </button>
        <button class="icon-btn" @click="handleCreateGroupClick" title="新建文件夹" aria-label="新建文件夹">
          <FolderPlus size="16" stroke-width="2" />
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
        title="清空搜索"
      >
        <X size="12" />
      </button>
    </label>

    <!-- Sidebar Body / Document Tree -->
    <div class="sidebar-body" ref="sidebarBodyRef">
      <!-- Group Creation Inline Row (at top of list) -->
      <div v-if="isCreatingGroup" class="create-group-row">
        <span class="folder-icon create-icon"></span>
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
          <button class="action-btn cancel-btn" @mousedown.prevent="handleCancelNewGroup" title="取消">
            <X size="13" stroke-width="2" />
          </button>
        </div>
      </div>

      <!-- Mode A: Clean Flat List when no custom groups exist -->
      <div
        v-if="groups.length === 0"
        class="doc-list flat-doc-list"
        @dragover="onListDragOver($event, null)"
        @drop="onListDrop($event, null)"
      >
        <SidebarDocItem
          v-for="doc in filteredUngroupedDocs"
          :key="doc.id"
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
        />
        <div v-if="filteredUngroupedDocs.length === 0" class="empty-group-drop-hint">
          <span>{{ searchQuery ? '无匹配文档' : '暂无文档，点击上方「新建文档」开始写作' }}</span>
        </div>
      </div>

      <!-- Mode B: Grouped Tree when custom groups exist -->
      <template v-else>
        <!-- ── 自定义分组列表 ── -->
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
            @dragenter.prevent="dragOverGroupId = group.id"
            @dragleave="onGroupDragLeave"
            @drop="onGroupHeaderDrop($event, group.id)"
          >
            <span class="chevron">
              <ChevronRight v-if="!isGroupExpanded(group.id)" size="13" stroke-width="2.2" />
              <ChevronDown v-else size="13" stroke-width="2.2" />
            </span>
            <span class="folder-icon"></span>

            <!-- group name display -->
            <span
              v-if="renamingGroupId !== group.id"
              class="folder-name"
              @dblclick.stop="startRenameGroup(group)"
              :title="group.name"
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
                  <Plus size="12" />
                </button>
                <button class="mini-btn" @click="startRenameGroup(group)" title="重命名分组">
                  <Pencil size="12" />
                </button>
                <button class="mini-btn" @click="handleDeleteGroup(group)" title="删除分组">
                  <Trash2 size="12" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-show="isGroupExpanded(group.id)"
            class="children"
            @dragover="onListDragOver($event, group.id)"
            @drop="onListDrop($event, group.id)"
          >
            <SidebarDocItem
              v-for="doc in docsInGroup(group.id)"
              :key="doc.id"
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
            />
            <div v-if="docsInGroup(group.id).length === 0" class="empty-group-drop-hint">
              <span>{{ searchQuery ? '无匹配文档' : '暂无文档，可拖拽至此' }}</span>
            </div>
          </div>
        </section>

        <!-- ── 未分类文档 ── -->
        <section
          v-if="filteredUngroupedDocs.length > 0 || dragOverGroupId === '__ungrouped__'"
          class="folder ungrouped-folder"
        >
          <div
            class="folder-row"
            :class="{ 'is-drop-target': dragOverGroupId === '__ungrouped__' }"
            @click="toggleGroup('__ungrouped__')"
            @dragover="onGroupHeaderDragOver($event, '__ungrouped__')"
            @dragenter.prevent="dragOverGroupId = '__ungrouped__'"
            @dragleave="onGroupDragLeave"
            @drop="onGroupHeaderDrop($event, '__ungrouped__')"
          >
            <span class="chevron">
              <ChevronRight v-if="!isGroupExpanded('__ungrouped__')" size="13" stroke-width="2.2" />
              <ChevronDown v-else size="13" stroke-width="2.2" />
            </span>
            <span class="folder-icon gray"></span>
            <span class="folder-name">未分类</span>
            <div class="folder-right">
              <span class="count">{{ filteredUngroupedDocs.length }}</span>
              <div class="folder-actions" @click.stop>
                <button class="mini-btn" @click="handleCreateDoc(null)" title="新建未分类文档">
                  <Plus size="12" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-show="isGroupExpanded('__ungrouped__')"
            class="children"
            @dragover="onListDragOver($event, '__ungrouped__')"
            @drop="onListDrop($event, '__ungrouped__')"
          >
            <SidebarDocItem
              v-for="doc in filteredUngroupedDocs"
              :key="doc.id"
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
            />
            <div v-if="filteredUngroupedDocs.length === 0" class="empty-group-drop-hint">
              <span>{{ searchQuery ? '无匹配文档' : '暂无文档，可拖拽至此' }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- ── 底部固定回收站 ♻️ ── -->
    <div class="bottom">
      <div
        class="trash"
        @click="toggleGroup('__trash__')"
      >
        <span class="chevron">
          <ChevronRight v-if="!isGroupExpanded('__trash__')" size="13" stroke-width="2.2" />
          <ChevronDown v-else size="13" stroke-width="2.2" />
        </span>
        <Trash2 size="16" stroke-width="1.8" class="trash-icon" />
        <span class="trash-name">回收站</span>
        <span class="count">{{ deletedDocs.length }}</span>
        <button
          v-if="deletedDocs.length > 0"
          type="button"
          class="trash-clear-btn"
          @click.stop="handleEmptyTrashClick"
          title="永久删除回收站中的全部文档"
        >
          <Trash2 size="12" />
          <span>清空</span>
        </button>
      </div>

      <div
        v-show="isGroupExpanded('__trash__')"
        class="children trash-doc-list"
      >
        <div
          v-for="doc in filteredDeletedDocs"
          :key="doc.id"
          class="trash-doc-item"
          :class="{ 'selected': doc.id === activeDocId }"
          @click="handleSelectTrashDoc(doc)"
        >
          <div class="file-copy">
            <span class="file-name" :title="doc.title || '未命名文档'">{{ doc.title || '未命名文档' }}</span>
          </div>
          <div class="trash-item-actions" @click.stop>
            <button class="trash-action-btn restore-btn" @click="handleRestoreDoc(doc)" title="恢复文档">
              <RotateCcw size="12" />
              <span>恢复</span>
            </button>
            <button class="trash-action-btn delete-btn" @click="handlePermanentDeleteDoc(doc)" title="彻底删除">
              <Trash2 size="12" />
            </button>
          </div>
        </div>
        <div v-if="filteredDeletedDocs.length === 0" class="empty-group-drop-hint">
          <span>{{ searchQuery.trim() ? '没有匹配的文档' : '回收站为空' }}</span>
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
  padding: 16px 12px 10px;
  overflow: hidden;
  z-index: 4;
  box-sizing: border-box;
  backdrop-filter: blur(18px);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.sidebar-container.is-resizing {
  transition: none !important;
  user-select: none !important;
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
  transition: background 0.15s ease;
}

.sidebar-resizer:hover::after,
.sidebar-container.is-resizing .sidebar-resizer::after {
  background: #3289f5;
}

@media (max-width: 960px) {
  .sidebar-resizer {
    display: none !important;
  }
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
  transition: background 0.15s ease, color 0.15s ease;
}

.create-action:hover {
  color: #fff;
  background: #347fe5;
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
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 2px 10px;
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

.heading {
  font-size: 1.0625rem;
  font-weight: 750;
  letter-spacing: 0.2px;
  color: #1e293b;
  white-space: nowrap;
}

html.dark .heading {
  color: #f1f5f9;
}

.sync {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px;
  border-radius: 20px;
  background: #e9faf4;
  color: #0ca879;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.sync-label { line-height: 1; }

.sync-icon {
  font-size: 0.75rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: #20bd8b;
  border-radius: 50%;
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.15); }
}

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
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #f0f5fb;
  color: #2678e8;
}

.icon-btn.is-active {
  background: #edf5ff;
  color: #2678e8;
}

.icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.icon-btn:disabled:hover {
  background: transparent;
  color: #71839d;
}

html.dark .icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #60a5fa;
}

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
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #71839d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
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
  gap: 2px;
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
  min-height: 40px;
  padding: 0 8px;
  gap: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.15s background;
  background: transparent;
  user-select: none;
  box-sizing: border-box;
}

.folder-row:focus-visible,
.trash:focus-visible,
.icon-btn:focus-visible {
  outline: 2px solid #2678e8;
  outline-offset: 1px;
}

.folder-row:hover {
  background: #f5f8fc;
}

html.dark .folder-row {
  color: #f1f5f9;
}

html.dark .folder-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.folder-row.is-drop-target {
  background: #eaf3ff;
  box-shadow: inset 0 0 0 1.5px #2678e8;
}

.chevron {
  width: 14px;
  color: #72849e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s;
}

/* CSS Folder Icon from Demo */
.folder-icon {
  width: 17px;
  height: 14px;
  border: 1.6px solid #f0a13b;
  border-radius: 3px;
  position: relative;
  flex: none;
  background: #fff9ef;
  box-sizing: border-box;
}

.folder-icon:before {
  content: "";
  position: absolute;
  left: 1px;
  top: -5px;
  width: 7px;
  height: 4px;
  border: 1.5px solid #f0a13b;
  border-bottom: 0;
  border-radius: 3px 3px 0 0;
  background: #fff9ef;
  box-sizing: border-box;
}

.folder-icon.gray {
  border-color: #8ea0b8;
  background: #f7f9fc;
}

.folder-icon.gray:before {
  border-color: #8ea0b8;
  background: #f7f9fc;
}

html.dark .folder-icon.gray {
  border-color: #64748b;
  background: #23252d;
}

html.dark .folder-icon.gray:before {
  border-color: #64748b;
  background: #23252d;
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

.folder-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
  display: none;
  align-items: center;
  gap: 2px;
}

.folder-row:hover .count {
  display: none;
}

.folder-row:hover .folder-actions {
  display: flex;
}

.mini-btn {
  background: transparent;
  border: none;
  color: #78879b;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
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
.children {
  margin-left: 16px;
  padding-left: 9px;
  border-left: 1px solid #e4ebf4;
  min-height: 10px;
  padding-bottom: 4px;
  margin-top: 2px;
  margin-bottom: 4px;
}

html.dark .children {
  border-left-color: rgba(255, 255, 255, 0.1);
}

.flat-doc-list {
  padding: 0;
  min-height: 14px;
}

.empty-group-drop-hint {
  padding: 8px 10px;
  margin: 3px 0 5px;
  font-size: 0.75rem;
  color: #94a3b8;
  border: 1px solid #dfe7f1;
  background: rgba(27, 55, 90, 0.02);
  border-radius: 8px;
  text-align: center;
  user-select: none;
  transition: all 0.15s ease;
}

html.dark .empty-group-drop-hint {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.08);
}

/* ── 6. Bottom / Recycle Bin (.bottom / .trash) ── */
.bottom {
  border-top: 1px solid #e7edf5;
  padding-top: 10px;
  margin-top: 10px;
  flex-shrink: 0;
}

html.dark .bottom {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.trash {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 8px;
  border-radius: 9px;
  color: #52647d;
  font-size: 0.875rem;
  cursor: pointer;
  transition: 0.15s background;
  user-select: none;
}

.trash:hover {
  background: #f5f8fc;
}

html.dark .trash {
  color: #94a3b8;
}

html.dark .trash:hover {
  background: rgba(255, 255, 255, 0.05);
}

.trash-icon {
  color: #8798ae;
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
  transition: background 0.15s ease, border-color 0.15s ease;
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
  max-height: 180px;
  overflow-y: auto;
}

.trash-doc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  margin: 2px 0;
  transition: 0.15s background;
  min-width: 0;
  box-sizing: border-box;
}

.trash-doc-item:hover {
  background: #f5f8fc;
}

html.dark .trash-doc-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.trash-doc-item .file-name {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: inherit;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: #1e293b;
  text-decoration: line-through;
  opacity: 0.75;
}

html.dark .trash-doc-item .file-name {
  color: #f1f5f9;
}

.trash-doc-item .file-copy {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.trash-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex: 0 0 auto;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.trash-doc-item:hover .trash-item-actions {
  opacity: 1;
}

.trash-doc-item:focus-within .trash-item-actions {
  opacity: 1;
}

.trash-action-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  font-size: 0.6875rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: 0 0 auto;
  white-space: nowrap;
}

.trash-action-btn.restore-btn {
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  min-height: 24px;
}

.trash-action-btn.restore-btn:hover {
  background: rgba(16, 185, 129, 0.18);
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

  .toolbar-actions {
    margin-left: auto;
    gap: 3px;
  }

  .create-action,
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
    opacity: 1;
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
