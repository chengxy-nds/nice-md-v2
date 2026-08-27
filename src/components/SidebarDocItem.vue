<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { FileText, Pencil, Trash2, GripVertical, History } from 'lucide-vue-next';
import { showConfirm } from '../utils/confirmDialog';

const props = defineProps({
  doc: { type: Object, required: true },
  isActive: { type: Boolean, default: false }
});

const emit = defineEmits(['select', 'rename', 'delete', 'move-doc', 'history']);

const isRenaming = ref(false);
const renameValue = ref('');
const renameInputRef = ref(null);
const isDragOver = ref(false);
const dragPosition = ref('before'); // 'before' | 'after'
const elRef = ref(null);

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

async function handleDelete() {
  const ok = await showConfirm({
    title: '删除文档',
    message: `确定要删除「${props.doc.title}」吗？此操作不可撤销。`,
    confirmText: '删除',
    danger: true
  });
  if (ok) emit('delete', props.doc.id);
}

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/nicemd-doc', props.doc.id);
  e.dataTransfer.setData('text/plain', props.doc.id);
}

function onDragOver(e) {
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
  e.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDrop(e) {
  isDragOver.value = false;
  const docId = e.dataTransfer.getData('application/nicemd-doc') || e.dataTransfer.getData('text/plain');
  if (!docId || docId === props.doc.id) return;
  e.preventDefault();
  e.stopPropagation();
  emit('move-doc', { docId, targetDocId: props.doc.id, position: dragPosition.value });
}
</script>

<template>
  <div
    class="doc-item"
    ref="elRef"
    :class="{ 
      'is-active': isActive, 
      'is-dragging-before': isDragOver && dragPosition === 'before',
      'is-dragging-after': isDragOver && dragPosition === 'after'
    }"
    draggable="true"
    @click="$emit('select', props.doc.id)"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Left Icon Area: Aligned with the top title row -->
    <div class="doc-leading">
      <GripVertical size="11" class="grip-icon" />
      <FileText size="15" class="doc-icon" />
    </div>

    <!-- Right Content Column: Title Row + Time Row (100% Left Aligned) -->
    <div class="doc-content-col">
      <!-- Title Row -->
      <div class="doc-title-row">
        <span
          v-if="!isRenaming"
          class="doc-title"
          @dblclick.stop="startRename"
        >{{ doc.title }}</span>

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

        <!-- Active diamond indicator -->
        <span v-if="isActive && !isRenaming" class="active-point-indicator">✦</span>
      </div>

      <!-- Time Row -->
      <div class="doc-time-row">
        <span class="doc-time">{{ docTime }}</span>
      </div>
    </div>

    <!-- hover actions -->
    <div class="doc-actions" v-show="!isRenaming">
      <button class="action-btn" @click.stop="$emit('history', doc)" title="历史版本与比对">
        <History size="11" />
      </button>
      <button class="action-btn" @click.stop="startRename" title="重命名">
        <Pencil size="11" />
      </button>
      <button class="action-btn" @click.stop="handleDelete" title="删除">
        <Trash2 size="11" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.doc-item {
  display: flex;
  align-items: flex-start;
  min-height: 52px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  user-select: none;
  margin-bottom: 3px;
  box-sizing: border-box;
}

.doc-item:hover:not(.is-active) {
  background: rgba(99, 102, 241, 0.04);
}

html.dark .doc-item:hover:not(.is-active) {
  background: rgba(255, 255, 255, 0.06);
}

.doc-item.is-active {
  background: rgba(99, 102, 241, 0.08);
}

.doc-item.is-active:hover {
  background: rgba(99, 102, 241, 0.12);
}

html.dark .doc-item.is-active {
  background: rgba(99, 102, 241, 0.16);
}

html.dark .doc-item.is-active:hover {
  background: rgba(99, 102, 241, 0.22);
}

.doc-item.is-dragging-before {
  background: var(--accent-bg);
  box-shadow: inset 0 2px 0 var(--accent-color, #6366f1);
}

.doc-item.is-dragging-after {
  background: var(--accent-bg);
  box-shadow: inset 0 -2px 0 var(--accent-color, #6366f1);
}

/* Leading Icon Area */
.doc-leading {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 18px;
}

.grip-icon {
  color: #a8a29e;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
  cursor: grab;
  margin-left: -4px;
}

.doc-item:hover .grip-icon {
  opacity: 0.6;
}

.doc-icon {
  color: var(--text-muted, #78716c);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.doc-item.is-active .doc-icon {
  color: var(--accent-color, #4f46e5);
}

/* Content Column (Title + Time strictly left aligned) */
.doc-content-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doc-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
  height: 18px;
  transition: padding-right 0.15s ease;
}

.doc-item:hover .doc-title-row {
  padding-right: 76px;
}

.doc-title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-main, #1c1917);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.doc-item.is-active .doc-title {
  color: var(--accent-color, #4f46e5);
  font-weight: 600;
}

.active-point-indicator {
  font-size: 10px;
  color: var(--accent-color, #6366f1);
  flex-shrink: 0;
  line-height: 1;
  margin-left: 2px;
  transition: opacity 0.15s ease;
}

.doc-item:hover .active-point-indicator {
  opacity: 0;
}

.doc-time-row {
  display: flex;
  align-items: center;
  line-height: 1;
}

.doc-time {
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
  line-height: 1.2;
  font-weight: 400;
}

.doc-item.is-active .doc-time {
  color: var(--accent-color, #6366f1);
  opacity: 0.85;
}

.rename-input {
  flex: 1;
  min-width: 0;
  width: 0;
  font-size: 12px;
  padding: 1px 5px;
  border: 1px solid var(--accent-color, #6366f1);
  border-radius: 4px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #1c1917);
  outline: none;
}

.doc-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  padding: 0;
  z-index: 3;
}

.doc-item:hover .doc-actions {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #78716c);
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--text-main, #1c1917);
}

.action-btn.btn-trash:hover {
  background: #fee2e2;
  color: #ef4444;
}

html.dark .action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

html.dark .action-btn.btn-trash:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}
</style>
