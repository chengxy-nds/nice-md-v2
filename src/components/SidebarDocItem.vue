<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import { FileText, Pencil, Trash2, History, Copy, Pin } from 'lucide-vue-next';
import { showConfirm } from '../utils/confirmDialog';

const props = defineProps({
  doc: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' }
});

const emit = defineEmits(['select', 'rename', 'delete', 'move-doc', 'history', 'duplicate', 'toggle-pin']);

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

const docCharCount = computed(() => {
  const raw = props.doc.content || '';
  if (!raw) return 0;
  const cleaned = raw
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, m => m.replace(/```\w*\n?/g, ''))
    .replace(/[#*`~>\-\[\]()!|]/g, '')
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

async function handleDelete() {
  const ok = await showConfirm({
    title: '移至回收站',
    message: `确定要将「${props.doc.title || '未命名文档'}」移至回收站吗？您可随时在回收站中恢复。`,
    confirmText: '移至回收站',
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
      <FileText size="15" class="doc-icon" />
    </div>

    <!-- Right Content Column: Title Row + Time & Actions Row -->
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

        <!-- Pinned indicator -->
        <span
          v-if="doc.isPinned && !isRenaming"
          class="pin-badge"
          title="已置顶（点击取消置顶）"
          @click.stop="$emit('toggle-pin', doc)"
        >
          <Pin size="11" />
        </span>
      </div>

      <!-- Content Search Match Snippet -->
      <div v-if="searchSnippet && !isRenaming" class="doc-search-snippet">
        {{ searchSnippet }}
      </div>

      <!-- Time, Word Count & Actions Row (Same line, actions aligned right) -->
      <div class="doc-time-row">
        <div class="doc-meta-left">
          <span class="doc-time">{{ docTime }}</span>
          <span class="doc-meta-sep">·</span>
          <span class="doc-char-count">{{ docCharCount }}字</span>
        </div>

        <!-- hover actions: same line with time, aligned right -->
        <div class="doc-actions" v-show="!isRenaming">
          <button
            class="action-btn"
            :class="{ 'is-pinned': doc.isPinned }"
            @click.stop="$emit('toggle-pin', doc)"
            :title="doc.isPinned ? '取消置顶' : '置顶文档'"
          >
            <Pin size="12" />
          </button>
          <button class="action-btn" @click.stop="$emit('duplicate', doc)" title="创建副本">
            <Copy size="12" />
          </button>
          <button class="action-btn" @click.stop="$emit('history', doc)" title="历史版本与比对">
            <History size="12" />
          </button>
          <button class="action-btn" @click.stop="startRename" title="重命名">
            <Pencil size="12" />
          </button>
          <button class="action-btn btn-trash" @click.stop="handleDelete" title="移至回收站">
            <Trash2 size="12" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 48px;
  padding: 7px 10px;
  margin-bottom: 3px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  position: relative;
  user-select: none;
  box-sizing: border-box;
}

.doc-item:hover:not(.is-active) {
  background: rgba(15, 23, 42, 0.04);
}

html.dark .doc-item:hover:not(.is-active) {
  background: rgba(255, 255, 255, 0.06);
}

.doc-item.is-active {
  background: var(--bg-card, #ffffff);
  border-color: rgba(17, 106, 204, 0.22);
  box-shadow: 0 2px 6px rgba(17, 106, 204, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
}

.doc-item.is-active:hover {
  background: var(--bg-card, #ffffff);
  border-color: rgba(17, 106, 204, 0.32);
}

html.dark .doc-item.is-active {
  background: rgba(17, 106, 204, 0.18);
  border-color: rgba(56, 189, 248, 0.25);
}

html.dark .doc-item.is-active:hover {
  background: rgba(17, 106, 204, 0.24);
}

.doc-item.is-dragging-before {
  background: var(--accent-bg);
  box-shadow: inset 0 2px 0 var(--brand-primary, #116ACC);
}

.doc-item.is-dragging-after {
  background: var(--accent-bg);
  box-shadow: inset 0 -2px 0 var(--brand-primary, #116ACC);
}

/* Leading Icon Area */
.doc-leading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 20px;
  margin-top: 1px;
}

.doc-icon {
  color: var(--text-muted, #64748B);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.doc-item.is-active .doc-icon {
  color: var(--brand-primary, #116ACC);
}

/* Content Column (Title + Time & Actions Row) */
.doc-content-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.doc-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
  height: 20px;
}

.doc-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main, #0F172A);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.35;
}

.doc-item.is-active .doc-title {
  color: var(--brand-primary, #116ACC);
  font-weight: 600;
}

.pin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  flex-shrink: 0;
  transform: rotate(35deg);
  cursor: pointer;
}

.doc-search-snippet {
  font-size: 11px;
  color: var(--brand-primary, #116ACC);
  background: rgba(17, 106, 204, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.doc-time-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 20px;
  line-height: 1;
}

.doc-meta-left {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
  overflow: hidden;
}

.doc-time,
.doc-char-count,
.doc-meta-sep {
  font-size: 11px;
  color: var(--text-subtle, #94a3b8);
  line-height: 1.2;
  font-weight: 400;
  flex-shrink: 0;
  transition: opacity 0.12s ease;
}

.doc-item.is-active .doc-time,
.doc-item.is-active .doc-char-count,
.doc-item.is-active .doc-meta-sep {
  color: var(--text-muted, #64748B);
}

.doc-item:hover .doc-char-count,
.doc-item:hover .doc-meta-sep {
  opacity: 0;
}

.rename-input {
  flex: 1;
  min-width: 0;
  width: 0;
  font-size: 12.5px;
  padding: 1px 5px;
  border: 1px solid var(--brand-primary, #116ACC);
  border-radius: 4px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #0F172A);
  outline: none;
}

.doc-actions {
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 1px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.doc-item:hover .doc-actions {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #64748B);
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.action-btn.is-pinned {
  color: #f59e0b;
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
