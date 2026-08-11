<script setup>
import { ref, nextTick, watch } from 'vue';
import { FileText, Pencil, Trash2, GripVertical } from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';

const props = defineProps({
  doc: { type: Object, required: true },
  isActive: { type: Boolean, default: false }
});

const emit = defineEmits(['select', 'rename', 'delete', 'move-doc']);

const isRenaming = ref(false);
const renameValue = ref('');
const renameInputRef = ref(null);
const isDragOver = ref(false);
const elRef = ref(null);

watch(() => props.isActive, (newVal) => {
  if (newVal) {
    nextTick(() => {
      elRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}, { immediate: true });

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
  e.dataTransfer.setData('text/plain', props.doc.title);
}

function onDragOver(e) {
  if (!e.dataTransfer.types.includes('application/nicemd-doc')) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  isDragOver.value = true;
}

function onDragEnter(e) {
  if (!e.dataTransfer.types.includes('application/nicemd-doc')) return;
  e.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDrop(e) {
  isDragOver.value = false;
  const docId = e.dataTransfer.getData('application/nicemd-doc');
  if (!docId || docId === props.doc.id) return;
  e.stopPropagation();
  emit('move-doc', { docId, targetDocId: props.doc.id, position: 'before' });
}
</script>

<template>
  <div
    class="doc-item"
    ref="elRef"
    :class="{ 'is-active': isActive, 'is-dragging': isDragOver }"
    draggable="true"
    @click="$emit('select', props.doc.id)"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <GripVertical size="11" class="grip-icon" />

    <FileText size="14" class="doc-icon" />

    <!-- display mode -->
    <span
      v-if="!isRenaming"
      class="doc-title"
      @dblclick.stop="startRename"
    >{{ doc.title }}</span>

    <!-- rename mode -->
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

    <!-- hover actions -->
    <div class="doc-actions" v-show="!isRenaming">
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
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 8px 0 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  user-select: none;
}

.doc-item:hover {
  background: var(--accent-bg, rgba(0, 0, 0, 0.04));
}

.doc-item.is-active {
  background: var(--accent-bg, rgba(39, 117, 182, 0.08));
}

.doc-item.is-active .doc-title {
  color: var(--accent-color, #2775b6);
  font-weight: 600;
}

.doc-item.is-dragging {
  background: var(--accent-bg);
  box-shadow: inset 0 2px 0 var(--accent-color);
}

.grip-icon {
  color: #a8a29e;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
  cursor: grab;
}

.doc-item:hover .grip-icon {
  opacity: 0.6;
}

.doc-icon {
  color: #78716c;
  flex-shrink: 0;
}

.is-active .doc-icon {
  color: #1c1917;
}

.doc-title {
  flex: 1;
  font-size: 12px;
  font-weight: 400;
  color: #44403c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rename-input {
  flex: 1;
  min-width: 0;
  width: 0;
  font-size: 12px;
  padding: 2px 6px;
  border: 1px solid var(--border-color, #78716c);
  border-radius: 4px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #1c1917);
  outline: none;
}

.doc-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.doc-item:hover .doc-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: none;
  color: #78716c;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1c1917;
}
</style>
