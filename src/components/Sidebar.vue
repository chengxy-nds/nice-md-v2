<script setup>
import { ref, computed, nextTick, watch } from 'vue';
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
  X
} from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';
import SidebarDocItem from './SidebarDocItem.vue';

const props = defineProps({
  documents: { type: Array, required: true },
  groups: { type: Array, required: true },
  activeDocId: { type: String, default: null },
  currentView: { type: String, default: 'editor' }
});

const emit = defineEmits([
  'select-doc', 'create-doc', 'rename-doc', 'delete-doc',
  'create-group', 'rename-group', 'delete-group',
  'move-doc', 'reorder-docs', 'reorder-groups', 'toggle-collapse',
  'open-templates', 'open-materials'
]);

// ── Search & Filter State ──
const searchQuery = ref('');
const showSearchInput = ref(false);

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
    if (sidebarBodyRef.value) {
      sidebarBodyRef.value.scrollTo({
        top: sidebarBodyRef.value.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
}

function handleSaveNewGroup() {
  const name = newGroupName.value.trim() || '未命名分组';
  emit('create-group', name);
  isCreatingGroup.value = false;
  newGroupName.value = '';
}

function handleCreateDoc(groupId) {
  const targetGroupId = groupId || '__default__';
  const s = new Set(expandedGroups.value);
  if (!s.has(targetGroupId)) {
    s.add(targetGroupId);
    expandedGroups.value = s;
  }
  emit('create-doc', groupId);
}

// ── Group Expansion State ──
const expandedGroups = ref(new Set());

watch(() => props.activeDocId, (newId) => {
  if (newId) {
    const doc = props.documents.find(d => d.id === newId);
    const groupId = doc?.groupId || '__default__';
    const s = new Set(expandedGroups.value);
    if (!s.has(groupId)) {
      s.add(groupId);
      expandedGroups.value = s;
    }
  }
}, { immediate: true });
const renamingGroupId = ref(null);
const renameGroupValue = ref('');
const renameGroupInputRef = ref(null);

function toggleGroup(groupId) {
  const s = new Set(expandedGroups.value);
  if (s.has(groupId)) s.delete(groupId); else s.add(groupId);
  expandedGroups.value = s;
}

function isGroupExpanded(groupId) {
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
    message: `确定要删除「${group.name}」吗？分组内的文档将移到「默认」分组。`,
    confirmText: '删除',
    danger: true
  });
  if (ok) emit('delete-group', group.id);
}

// ── Computed Filtered Lists ──
const filteredUngroupedDocs = computed(() => {
  const all = props.documents.filter(d => !d.groupId || d.groupId === null);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return all;
  return all.filter(d => (d.title || '').toLowerCase().includes(q));
});

function docsInGroup(groupId) {
  const all = props.documents.filter(d => d.groupId === groupId);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return all;
  return all.filter(d => (d.title || '').toLowerCase().includes(q));
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
</script>

<template>
  <aside class="sidebar-container select-none">
    <!-- Section Header: 我的文档 -->
    <div class="section-title-row">
      <span class="section-title">我的文档</span>
      <div class="section-icons">
        <button class="title-icon-btn" @click="handleCreateDoc(null)" title="新建文档">
          <Plus size="16" stroke-width="2" />
        </button>
        <button class="title-icon-btn" @click="handleCreateGroupClick" title="新建分组">
          <FolderPlus size="15" stroke-width="1.8" />
        </button>
      </div>
    </div>

    <!-- Always Visible Search Filter Input -->
    <div class="search-input-wrap">
      <Search size="14" class="search-icon-inside" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索文档名称..."
        class="search-input"
      />
      <button 
        v-if="searchQuery" 
        class="search-clear-btn" 
        @click="searchQuery = ''"
        title="清空搜索"
      >
        <X size="12" />
      </button>
    </div>

    <!-- Sidebar Body / Document Tree -->
    <div class="sidebar-body" ref="sidebarBodyRef">
      <!-- ── 默认分组 ── -->
      <section class="group-section">
        <div
          class="group-header"
          :class="{ 'is-drop-target': dragOverGroupId === '__default__' }"
          @click="toggleGroup('__default__')"
          @dragover="onGroupHeaderDragOver($event, '__default__')"
          @dragenter.prevent="dragOverGroupId = '__default__'"
          @dragleave="onGroupDragLeave"
          @drop="onGroupHeaderDrop($event, '__default__')"
        >
          <span class="group-chevron">
            <ChevronRight v-if="!isGroupExpanded('__default__')" size="12" stroke-width="1.6" />
            <ChevronDown v-else size="12" stroke-width="1.6" />
          </span>
          <Folder v-if="!isGroupExpanded('__default__')" size="14" stroke-width="1.6" class="group-icon" />
          <FolderOpen v-else size="14" stroke-width="1.6" class="group-icon" />
          <span class="group-name">默认分组</span>
          <div class="group-header-right">
            <span class="group-count">{{ filteredUngroupedDocs.length }}</span>
            <div class="group-actions" @click.stop>
              <button class="mini-btn" @click="handleCreateDoc(null)" title="添加文档">
                <Plus size="12" />
              </button>
            </div>
          </div>
        </div>
        <div
          v-show="isGroupExpanded('__default__')"
          class="doc-list group-doc-list"
          @dragover="onListDragOver($event, '__default__')"
          @drop="onListDrop($event, '__default__')"
        >
          <SidebarDocItem
            v-for="doc in filteredUngroupedDocs"
            :key="doc.id"
            :doc="doc"
            :isActive="doc.id === activeDocId"
            @select="id => $emit('select-doc', id)"
            @rename="payload => $emit('rename-doc', payload)"
            @delete="id => $emit('delete-doc', id)"
            @move-doc="handleDocMove"
          />
          <div v-if="filteredUngroupedDocs.length === 0" class="empty-group-drop-hint">
            <span>暂无文档，可拖拽至此</span>
          </div>
        </div>
      </section>

      <!-- ── 自定义分组 ── -->
      <section
        v-for="group in groups"
        :key="group.id"
        class="group-section"
      >
        <div
          class="group-header"
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
          <span class="group-chevron">
            <ChevronRight v-if="!isGroupExpanded(group.id)" size="12" />
            <ChevronDown v-else size="12" />
          </span>
          <Folder v-if="!isGroupExpanded(group.id)" size="14" class="group-icon" />
          <FolderOpen v-else size="14" class="group-icon" />

          <!-- group name display -->
          <span
            v-if="renamingGroupId !== group.id"
            class="group-name"
            @dblclick.stop="startRenameGroup(group)"
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

          <div v-show="renamingGroupId !== group.id" class="group-header-right">
            <span class="group-count">{{ docsInGroup(group.id).length }}</span>
            <div class="group-actions" @click.stop>
              <button class="mini-btn" @click="handleCreateDoc(group.id)" title="添加文档">
                <Plus size="12" />
              </button>
              <button class="mini-btn" @click="startRenameGroup(group)" title="重命名">
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
          class="doc-list group-doc-list"
          @dragover="onListDragOver($event, group.id)"
          @drop="onListDrop($event, group.id)"
        >
          <SidebarDocItem
            v-for="doc in docsInGroup(group.id)"
            :key="doc.id"
            :doc="doc"
            :isActive="doc.id === activeDocId"
            @select="id => $emit('select-doc', id)"
            @rename="payload => $emit('rename-doc', payload)"
            @delete="id => $emit('delete-doc', id)"
            @move-doc="handleDocMove"
          />
          <div v-if="docsInGroup(group.id).length === 0" class="empty-group-drop-hint">
            <span>暂无文档，可拖拽至此</span>
          </div>
        </div>
      </section>

      <!-- Group Creation Inline Row (at bottom of list) -->
      <div v-if="isCreatingGroup" class="create-group-row">
        <Folder size="14" stroke-width="1.6" class="create-icon" />
        <input
          v-model="newGroupName"
          ref="newGroupInputRef"
          type="text"
          placeholder="分组名称..."
          class="create-group-input"
          @keyup.enter="handleSaveNewGroup"
          @keyup.escape="isCreatingGroup = false"
        />
        <div class="create-group-actions">
          <button class="action-btn confirm-btn" @click="handleSaveNewGroup" title="确认新建">
            <Check size="13" stroke-width="2" />
          </button>
          <button class="action-btn cancel-btn" @click="isCreatingGroup = false" title="取消">
            <X size="13" stroke-width="2" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-container {
  width: 16rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  box-shadow: var(--shadow-sidebar-left);
  padding: 20px 16px 20px;
  overflow: hidden;
  z-index: 4;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* ── 1. Action Buttons ── */
.action-buttons-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

/* ── 2. Section Header: 我的文档 ── */
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 2px 10px 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main, #18181b);
  letter-spacing: -0.01em;
}

.section-icons {
  display: flex;
  align-items: center;
  gap: 2px;
}

.title-icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted, #71717a);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.title-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main, #18181b);
}

html.dark .title-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

/* ── 3. Search Filter Input ── */
.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.search-icon-inside {
  position: absolute;
  left: 11px;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 34px;
  padding: 0 28px 0 32px;
  font-size: 12.5px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-radius: 17px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #18181b);
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.search-input:focus {
  border-color: var(--accent-color, #6366f1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

.search-clear-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.search-clear-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--text-main);
}

/* ── 4. Inline Create Group Row ── */
.create-group-row {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px;
  margin: 4px 0;
  border: 1px solid var(--accent-color, #2775b6);
  border-radius: 6px;
  background: var(--bg-editor, #ffffff);
  box-sizing: border-box;
}

.create-icon {
  color: var(--text-muted, #737373);
  flex-shrink: 0;
}

.create-group-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--text-main);
  outline: none;
  font-family: inherit;
}

.create-group-input::placeholder {
  color: var(--text-muted, #999999);
  font-size: 12px;
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
  color: var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.action-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

.action-btn.confirm-btn:hover {
  background: var(--accent-bg, rgba(39, 117, 182, 0.1));
  color: var(--accent-color, #2775b6);
}

/* ── 5. Sidebar Scroll Area ── */
.sidebar-body {
  flex: 1;
  overflow-y: auto;
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

.group-section {
  margin-top: 0;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.group-section.is-drop-target {
  background: var(--accent-bg);
  box-shadow: inset 0 0 0 2px var(--accent-color);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;
  min-height: 28px;
  box-sizing: border-box;
}

.group-header:not(.is-renaming) {
  cursor: grab;
}

.group-header:not(.is-renaming):active {
  cursor: grabbing;
}

.group-header:hover {
  background: rgba(0, 0, 0, 0.04);
}

.group-header.is-drop-target {
  background: var(--accent-bg);
  box-shadow: inset 0 0 0 2px var(--accent-color);
}

.group-chevron {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.group-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.group-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main, #2c2c2c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 20px;
  padding: 1px 2px;
  box-sizing: border-box;
}

.group-rename-input {
  flex: 1;
  min-width: 0;
  height: 22px;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  padding: 0 4px;
  margin: 0;
  border: 1px solid var(--accent-color, #6366f1);
  border-radius: 4px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main);
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

.group-header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.group-count {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted, #737373);
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 7px;
  border-radius: 12px;
  border: none;
  display: block;
}

html.dark .group-count {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.group-actions {
  display: none;
  align-items: center;
  gap: 2px;
}

.group-header:hover .group-count {
  display: none;
}

.group-header:hover .group-actions {
  display: flex;
}

.mini-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #737373);
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
  background: var(--bg-capsule, rgba(0, 0, 0, 0.08));
  color: var(--text-main, #111827);
}

html.dark .mini-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.group-doc-list {
  padding-left: 10px;
  min-height: 14px;
  padding-bottom: 4px;
}

.empty-group-drop-hint {
  padding: 6px 8px;
  margin: 2px 0 4px;
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
  border: 1px dashed var(--border-color, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  text-align: center;
  user-select: none;
  transition: all 0.15s ease;
}

.empty-group-drop-hint:hover {
  border-color: var(--accent-color, #6366f1);
  color: var(--accent-color, #6366f1);
  background: var(--accent-bg, rgba(99, 102, 241, 0.04));
}
</style>
