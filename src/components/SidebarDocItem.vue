<script>
let closeActiveDocMenu = null;
</script>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue';
import { Pencil, Trash2, History, Copy, Pin, MoreHorizontal } from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';

const props = defineProps({
  doc: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' }
});

const emit = defineEmits(['select', 'rename', 'delete', 'move-doc', 'history', 'duplicate', 'toggle-pin', 'drag-start', 'drag-end']);

const isRenaming = ref(false);
const renameValue = ref('');
const renameInputRef = ref(null);
const isDragOver = ref(false);
const dragPosition = ref('before'); // 'before' | 'after'
const elRef = ref(null);

const isMenuOpen = ref(false);
const menuRef = ref(null);
const moreBtnRef = ref(null);
const menuPlacement = ref('bottom');
const menuStyle = ref({
  top: '-9999px',
  left: '-9999px',
  visibility: 'hidden'
});

watch(() => props.isActive, (newVal) => {
  if (newVal) {
    nextTick(() => {
      elRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}, { immediate: true });

function formatDocTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  const pad = (n) => String(n).padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  if (isToday) {
    return `今天 ${hours}:${minutes}`;
  } else if (isYesterday) {
    return `昨天 ${hours}:${minutes}`;
  } else if (date.getFullYear() === now.getFullYear()) {
    return `${month}/${day} ${hours}:${minutes}`;
  } else {
    return `${date.getFullYear()}/${month}/${day}`;
  }
}

const docTime = computed(() => {
  return formatDocTime(props.doc.updatedAt || props.doc.createdAt || Date.now());
});

const docCharCount = computed(() => {
  const raw = props.doc.content || '';
  if (!raw) return 0;
  const cleaned = raw
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, m => m.replace(/```\w*\n?/g, ''))
    .replace(/[#*`~>\-[\]()!|]/g, '')
    .replace(/\s+/g, '');
  return cleaned.length;
});

const searchSnippet = computed(() => {
  const q = (props.searchQuery || '').trim().toLowerCase();
  if (!q) return '';
  const content = props.doc.content || '';
  const idx = content.toLowerCase().indexOf(q);
  if (idx === -1) return '';
  const start = Math.max(0, idx - 10);
  const end = Math.min(content.length, idx + q.length + 24);
  const slice = content.slice(start, end).replace(/\s+/g, ' ').trim();
  return (start > 0 ? '…' : '') + slice + (end < content.length ? '…' : '');
});

function startRename() {
  renameValue.value = props.doc.title;
  isRenaming.value = true;
  nextTick(() => renameInputRef.value?.focus());
}

function confirmRename() {
  const trimmed = renameValue.value.trim();
  if (trimmed && trimmed !== props.doc.title) {
    emit('rename', { id: props.doc.id, title: trimmed });
  }
  isRenaming.value = false;
}

function cancelRename() {
  isRenaming.value = false;
}

const MENU_VIEWPORT_PADDING = 8;
const MENU_GAP = 4;

function handleOutsidePointerDown(e) {
  if (!isMenuOpen.value) return;
  if (menuRef.value?.contains(e.target) || moreBtnRef.value?.contains(e.target)) return;
  closeMenu();
}

function handleMenuKeyDown(e) {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu();
  }
}

function handleViewportScroll(e) {
  if (!isMenuOpen.value) return;
  if (menuRef.value?.contains(e.target)) return;
  closeMenu();
}

function attachMenuGlobalListeners() {
  window.addEventListener('mousedown', handleOutsidePointerDown, true);
  window.addEventListener('keydown', handleMenuKeyDown);
  window.addEventListener('scroll', handleViewportScroll, true);
  window.addEventListener('resize', closeMenu);
}

function detachMenuGlobalListeners() {
  window.removeEventListener('mousedown', handleOutsidePointerDown, true);
  window.removeEventListener('keydown', handleMenuKeyDown);
  window.removeEventListener('scroll', handleViewportScroll, true);
  window.removeEventListener('resize', closeMenu);
}

async function openMenuAt({ source = 'button', clientX = 0, clientY = 0 } = {}) {
  if (closeActiveDocMenu && closeActiveDocMenu !== closeMenu) {
    closeActiveDocMenu();
  }
  closeActiveDocMenu = closeMenu;
  menuStyle.value = { top: '-9999px', left: '-9999px', visibility: 'hidden' };
  isMenuOpen.value = true;
  attachMenuGlobalListeners();

  await nextTick();
  if (!isMenuOpen.value || !menuRef.value) return;

  const menuRect = menuRef.value.getBoundingClientRect();
  const maxLeft = Math.max(MENU_VIEWPORT_PADDING, window.innerWidth - menuRect.width - MENU_VIEWPORT_PADDING);
  const maxTop = Math.max(MENU_VIEWPORT_PADDING, window.innerHeight - menuRect.height - MENU_VIEWPORT_PADDING);

  let preferredLeft;
  let anchorTop;
  let anchorBottom;

  if (source === 'context' && (clientX > 0 || clientY > 0)) {
    preferredLeft = clientX + menuRect.width > window.innerWidth - MENU_VIEWPORT_PADDING
      ? clientX - menuRect.width
      : clientX;
    anchorTop = clientY;
    anchorBottom = clientY;
  } else {
    const anchorRect = (moreBtnRef.value || elRef.value)?.getBoundingClientRect();
    if (!anchorRect) {
      closeMenu();
      return;
    }
    preferredLeft = anchorRect.right - menuRect.width;
    anchorTop = anchorRect.top;
    anchorBottom = anchorRect.bottom;
  }

  const spaceBelow = window.innerHeight - anchorBottom - MENU_VIEWPORT_PADDING;
  const spaceAbove = anchorTop - MENU_VIEWPORT_PADDING;
  const flipUp = spaceBelow < menuRect.height + MENU_GAP && spaceAbove > spaceBelow;
  menuPlacement.value = flipUp ? 'top' : 'bottom';

  const top = flipUp
    ? Math.max(MENU_VIEWPORT_PADDING, anchorTop - menuRect.height - MENU_GAP)
    : Math.min(anchorBottom + MENU_GAP, maxTop);
  const left = Math.min(Math.max(preferredLeft, MENU_VIEWPORT_PADDING), maxLeft);

  menuStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    visibility: 'visible'
  };
}

function toggleMenu(e) {
  e?.stopPropagation();
  if (isMenuOpen.value) {
    closeMenu();
    return;
  }
  openMenuAt({ source: 'button' });
}

function closeMenu() {
  isMenuOpen.value = false;
  detachMenuGlobalListeners();
  if (closeActiveDocMenu === closeMenu) {
    closeActiveDocMenu = null;
  }
}

function openContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  openMenuAt({ source: 'context', clientX: e.clientX, clientY: e.clientY });
}

function handleTogglePin() {
  closeMenu();
  emit('toggle-pin', props.doc);
}

function startRenameFromMenu() {
  closeMenu();
  startRename();
}

function handleDuplicate() {
  closeMenu();
  emit('duplicate', props.doc);
}

function handleHistory() {
  closeMenu();
  emit('history', props.doc);
}

async function handleDelete() {
  closeMenu();
  const ok = await showConfirm({
    title: '移至回收站',
    message: `确定要将「${props.doc.title || '未命名文档'}」移至回收站吗？您可随时在回收站中恢复。`,
    confirmText: '移至回收站',
    danger: true
  });
  if (ok) emit('delete', props.doc.id);
}

function isDraggingDocTransfer(e) {
  return Boolean(e.dataTransfer?.types?.includes('application/nicemd-doc'));
}

function onDragStart(e) {
  closeMenu();
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/nicemd-doc', props.doc.id);
  e.dataTransfer.setData('text/plain', props.doc.id);
  emit('drag-start', props.doc);
}

function onDragEnd() {
  isDragOver.value = false;
  emit('drag-end');
}

function onDragOver(e) {
  if (!isDraggingDocTransfer(e)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  isDragOver.value = true;
  if (elRef.value) {
    const rect = elRef.value.getBoundingClientRect();
    const relY = e.clientY - rect.top;
    dragPosition.value = relY > rect.height / 2 ? 'after' : 'before';
  }
}

function onDragEnter(e) {
  if (!isDraggingDocTransfer(e)) return;
  e.preventDefault();
  isDragOver.value = true;
}

function onDragLeave(e) {
  if (!e.relatedTarget || !e.currentTarget?.contains(e.relatedTarget)) {
    isDragOver.value = false;
  }
}

function onDrop(e) {
  isDragOver.value = false;
  if (!isDraggingDocTransfer(e)) return;
  const docId = e.dataTransfer.getData('application/nicemd-doc') || e.dataTransfer.getData('text/plain');
  if (!docId) return;
  e.preventDefault();
  e.stopPropagation();
  if (docId !== props.doc.id) {
    emit('move-doc', { docId, targetDocId: props.doc.id, position: dragPosition.value });
  }
  emit('drag-end');
}

onUnmounted(() => {
  closeMenu();
});
</script>

<template>
  <div
    class="file-row"
    ref="elRef"
    :class="{ 
      'selected': isActive,
      'is-menu-open': isMenuOpen,
      'is-dragging-before': isDragOver && dragPosition === 'before',
      'is-dragging-after': isDragOver && dragPosition === 'after'
    }"
    draggable="true"
    @click="$emit('select', props.doc.id)"
    @contextmenu="openContextMenu"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Content column -->
    <div class="file-copy">
      <!-- Title -->
      <div
        v-if="!isRenaming"
        class="file-name"
        @dblclick.stop="startRename"
        :title="doc.title || '未命名文档'"
        data-tooltip-truncated="true"
      >
        <span>{{ doc.title }}</span>
        <!-- P1-3: 置顶徽标用 Lucide Pin，不再用 emoji 📌（菜单里本来
             就是 Pin，同一功能两种画风，且 emoji 在深色/不同系统字体
             下大小颜色都不可控）。 -->
        <Pin v-if="doc.isPinned" size="11" stroke-width="2" class="pin-badge" title="已置顶" />
      </div>

      <input
        v-else
        v-model="renameValue"
        class="rename-input"
        ref="renameInputRef"
        @blur="confirmRename"
        @keyup.enter="confirmRename"
        @keyup.escape="cancelRename"
        @click.stop
      />

      <!-- Content Search Match Snippet -->
      <div v-if="searchSnippet && !isRenaming" class="doc-search-snippet">
        {{ searchSnippet }}
      </div>

      <!-- Meta Row (Time · Word Count) -->
      <div class="meta">
        {{ docTime }} · {{ docCharCount }}字
      </div>
    </div>

    <!-- More button (···) -->
    <button
      ref="moreBtnRef"
      class="more"
      :class="{ 'is-active': isMenuOpen }"
      @click.stop="toggleMenu"
    >
      <!-- P1-3/P1-4: “···”按钮 16px，按钮本身 28px（见 .more 样式）。 -->
      <MoreHorizontal size="16" />
    </button>

    <!-- Floating Context Dropdown Menu (teleported to avoid scroll-area clipping) -->
    <Teleport to="body">
      <div
        v-if="isMenuOpen"
        class="doc-menu-dropdown"
        :class="{ 'is-flip-up': menuPlacement === 'top' }"
        :style="menuStyle"
        ref="menuRef"
        role="menu"
        @click.stop
      >
        <button class="menu-item" role="menuitem" @click="handleTogglePin">
          <Pin size="14" stroke-width="2" class="menu-item-icon" />
          <span>{{ doc.isPinned ? '取消置顶' : '置顶文档' }}</span>
        </button>
        <button class="menu-item" role="menuitem" @click="startRenameFromMenu">
          <Pencil size="14" stroke-width="2" class="menu-item-icon" />
          <span>重命名 (双击)</span>
        </button>
        <button class="menu-item" role="menuitem" @click="handleDuplicate">
          <Copy size="14" stroke-width="2" class="menu-item-icon" />
          <span>创建副本</span>
        </button>
        <button class="menu-item" role="menuitem" @click="handleHistory">
          <History size="14" stroke-width="2" class="menu-item-icon" />
          <span>历史版本与比对</span>
        </button>
        <div class="menu-divider"></div>
        <button class="menu-item text-danger" role="menuitem" @click="handleDelete">
          <Trash2 size="14" stroke-width="2" class="menu-item-icon" />
          <span>移至回收站</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.file-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 9px;
  min-height: 52px;
  margin: 2px 0;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.22s var(--ease-glide),
              transform 0.22s var(--ease-glide),
              box-shadow 0.2s var(--ease-glide);
  background: transparent;
  user-select: none;
  box-sizing: border-box;
}

/* P0-2: hover 只改背景色，去掉 translateX(2px) / :active scale，
   与文件夹行同理，避免悬停横移抖动。 */
.file-row:hover {
  background: var(--sidebar-hover, #f5f8fc);
}

html.dark .file-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* P1-4: 选中态加左侧 2px 指示条，不再只靠背景色区分。
   原来浅色 hover #f5f8fc 与选中 #f1f6fd 几乎看不出差别。 */
.file-row.selected {
  background: var(--sidebar-selected, #eaf3ff);
  box-shadow: inset 2px 0 0 #2678e8;
}

html.dark .file-row.selected {
  background: var(--sidebar-selected, rgba(59, 130, 246, 0.12));
  box-shadow: inset 2px 0 0 #60a5fa;
}

.file-row.is-dragging-before {
  background: #edf5ff;
  box-shadow: inset 0 2px 0 #2678e8;
}

.file-row.is-dragging-after {
  background: #edf5ff;
  box-shadow: inset 0 -2px 0 #2678e8;
}

.file-copy {
  min-width: 0;
  flex: 1;
}

.file-name {
  font-size: 0.8125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--sidebar-text, #6c7688);
  line-height: 1.35;
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-name > span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-row.selected .file-name {
  color: #1e293b;
  font-weight: 500;
}

html.dark .file-name {
  color: var(--sidebar-text, #cbd5e1);
}

html.dark .file-row.selected .file-name {
  color: #f1f5f9;
}

.pin-badge {
  flex-shrink: 0;
  color: #d97706;
}

html.dark .pin-badge {
  color: #fbbf24;
}

.meta {
  margin-top: 3px;
  color: #718198;
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

html.dark .meta {
  color: #94a3b8;
}

.more {
  opacity: 0.48;
  color: #6f829d;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: var(--sidebar-radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.file-row:hover .more,
.file-row.selected .more,
.more.is-active {
  opacity: 1;
}

.file-row:focus-within .more {
  opacity: 1;
}

.more:hover,
.more.is-active {
  background: rgba(38, 120, 232, 0.1);
  color: #2678e8;
}

/* Search match snippet */
.doc-search-snippet {
  font-size: 0.6875rem;
  color: #2678e8;
  background: rgba(38, 120, 232, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  margin-top: 2px;
}

/* Inline rename input */
.rename-input {
  display: block;
  width: 100%;
  height: 22px;
  min-width: 0;
  font: inherit;
  font-size: 0.78125rem;
  font-weight: 600;
  line-height: 20px;
  padding: 0 6px;
  border: 1px solid #c8d8ed;
  border-radius: 6px;
  background: #fff;
  color: #1e293b;
  outline: none;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color 0.12s var(--ease-glide), box-shadow 0.12s var(--ease-glide), background 0.12s var(--ease-glide);
}

.rename-input:focus {
  border-color: #8bb7ee;
  box-shadow: 0 0 0 2px rgba(38, 120, 232, 0.1);
}

html.dark .rename-input {
  border-color: #46566b;
  background: #202733;
  color: #f1f5f9;
  box-shadow: none;
}

html.dark .rename-input:focus {
  border-color: #679be0;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.14);
}

/* Floating Dropdown Context Menu */
.doc-menu-dropdown {
  position: fixed;
  z-index: 1500;
  min-width: 144px;
  background: #ffffff;
  border: 1px solid #dfe7f1;
  border-radius: 9px;
  padding: 4px;
  box-shadow: 0 10px 25px rgba(27, 55, 90, 0.14), 0 2px 6px rgba(27, 55, 90, 0.05);
  transform-origin: top right;
  /* B. 下拉按触发角缩放长出：transform-origin 已按翻转方向设为 top/bottom right */
  animation: menuFadeIn var(--motion-base) var(--ease-enter);
  will-change: transform, opacity;
  user-select: none;
  box-sizing: border-box;
}

.doc-menu-dropdown.is-flip-up {
  transform-origin: bottom right;
  animation-name: menuFadeInUp;
}

@keyframes menuFadeIn {
  from { opacity: 0; transform: translateY(-4px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes menuFadeInUp {
  from { opacity: 0; transform: translateY(4px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #334155;
  background: transparent;
  border: none;
  border-radius: var(--sidebar-radius-sm, 8px);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s var(--ease-glide), color 0.12s var(--ease-glide);
  box-sizing: border-box;
}

.menu-item:hover {
  background: #f0f5fb;
  color: #2678e8;
}

.menu-item.text-danger {
  color: #ef4444;
}

.menu-item.text-danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.menu-item-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.menu-divider {
  height: 1px;
  background: #e7edf5;
  margin: 3px 0;
}

html.dark .doc-menu-dropdown {
  background: #1e1e24;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

html.dark .menu-item {
  color: #cbd5e1;
}

html.dark .menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

html.dark .menu-divider {
  background: rgba(255, 255, 255, 0.08);
}
</style>
