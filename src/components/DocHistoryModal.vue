<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  History,
  Clock,
  Check,
  X,
  Trash2,
  Pencil,
  Copy,
  RotateCcw,
  Plus,
  Search,
  Split,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  SlidersHorizontal
} from 'lucide-vue-next';
import {
  getDocSnapshots,
  createSnapshot,
  renameSnapshot,
  deleteSnapshot,
  clearDocSnapshots,
  formatRelativeTime,
  getStats
} from '../utils/docHistory';
import { computeLineDiff } from '../utils/diffUtils';
import { soundEngine } from '../utils/synthAudio';
import { showConfirm } from '../utils/confirmDialog';

const props = defineProps({
  visible: { type: Boolean, default: false },
  doc: { type: Object, default: () => ({}) },
  currentContent: { type: String, default: '' },
  currentCustomStyles: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'restore-version']);

// State
const snapshots = ref([]);
const selectedSnapshotId = ref(null);
const viewMode = ref('split'); // 'split' | 'unified' | 'preview'
const searchQuery = ref('');
const renamingId = ref(null);
const renameInputVal = ref('');
const renameInputRef = ref(null);
const copyToastVisible = ref(false);
const isCreatingManual = ref(false);
const manualSnapshotName = ref('');
const manualInputRef = ref(null);

// Load snapshots on open / doc change
function loadSnapshots() {
  if (!props.doc?.id) {
    snapshots.value = [];
    selectedSnapshotId.value = null;
    return;
  }
  const list = getDocSnapshots(props.doc.id);
  snapshots.value = list;
  if (list.length > 0) {
    if (!selectedSnapshotId.value || !list.some(s => s.id === selectedSnapshotId.value)) {
      selectedSnapshotId.value = list[0].id;
    }
  } else {
    selectedSnapshotId.value = null;
  }
}

watch([() => props.visible, () => props.doc?.id], ([vis]) => {
  if (vis) {
    loadSnapshots();
  }
}, { immediate: true });

// Filtered snapshots
const filteredSnapshots = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return snapshots.value;
  return snapshots.value.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.title || '').toLowerCase().includes(q)
  );
});

// Selected snapshot object
const selectedSnapshot = computed(() => {
  return snapshots.value.find(s => s.id === selectedSnapshotId.value) || null;
});

// Current text vs historical text
const oldText = computed(() => selectedSnapshot.value?.content || '');
const newText = computed(() => props.currentContent || '');

// Computed Diff
const diffResult = computed(() => {
  if (!selectedSnapshot.value) return null;
  return computeLineDiff(oldText.value, newText.value);
});

// Select a snapshot
function selectSnapshot(snap) {
  soundEngine.playClick();
  selectedSnapshotId.value = snap.id;
}

// Start manual snapshot creation
function startCreateManual() {
  isCreatingManual.value = true;
  manualSnapshotName.value = `快照 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  nextTick(() => manualInputRef.value?.focus());
}

// Confirm manual snapshot creation
function confirmCreateManual() {
  const name = manualSnapshotName.value.trim() || '手动快照';
  const newSnap = createSnapshot(
    props.doc.id,
    props.doc.title,
    props.currentContent,
    props.currentCustomStyles,
    'manual',
    name
  );
  isCreatingManual.value = false;
  soundEngine.playChime();
  loadSnapshots();
  if (newSnap) {
    selectedSnapshotId.value = newSnap.id;
  }
}

// Start renaming a snapshot
function startRename(snap) {
  renamingId.value = snap.id;
  renameInputVal.value = snap.name || '';
  nextTick(() => renameInputRef.value?.focus());
}

// Confirm rename
function confirmRename(snap) {
  if (renamingId.value) {
    renameSnapshot(props.doc.id, snap.id, renameInputVal.value);
    renamingId.value = null;
    loadSnapshots();
  }
}

// Delete a single snapshot
async function handleDeleteSnapshot(snap) {
  const ok = await showConfirm({
    title: '删除历史版本',
    message: `确定要删除版本「${snap.name} (${formatRelativeTime(snap.createdAt)})」吗？`,
    confirmText: '删除',
    danger: true
  });
  if (!ok) return;

  deleteSnapshot(props.doc.id, snap.id);
  soundEngine.playClick();
  loadSnapshots();
}

// Clear all history for this doc
async function handleClearAll() {
  const ok = await showConfirm({
    title: '清空历史版本',
    message: `确定要清空文档「${props.doc?.title}」的全部历史版本记录吗？此操作无法撤销。`,
    confirmText: '全部清空',
    danger: true
  });
  if (!ok) return;

  clearDocSnapshots(props.doc.id);
  soundEngine.playClick();
  loadSnapshots();
}

// Restore selected version to editor
async function handleRestore() {
  if (!selectedSnapshot.value) return;
  const ok = await showConfirm({
    title: '恢复历史版本',
    message: `确定要将文档内容恢复至「${selectedSnapshot.value.name} (${formatRelativeTime(selectedSnapshot.value.createdAt)})」吗？当前未保存的临时改动将被覆盖。`,
    confirmText: '确认恢复',
    danger: false
  });
  if (!ok) return;

  soundEngine.playChime();
  emit('restore-version', {
    docId: props.doc.id,
    content: selectedSnapshot.value.content,
    customStyles: selectedSnapshot.value.customStyles
  });
  emit('close');
}

// Copy historical content
async function copyHistoricalContent() {
  if (!selectedSnapshot.value) return;
  try {
    await navigator.clipboard.writeText(selectedSnapshot.value.content || '');
    soundEngine.playChime();
    copyToastVisible.value = true;
    setTimeout(() => {
      copyToastVisible.value = false;
    }, 2000);
  } catch (e) {
    console.error('Copy failed:', e);
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="history-modal-mask" @click.self="emit('close')">
      <div class="history-modal-container">
        <!-- Ambient subtle background glow -->
        <div class="history-glow history-glow-a"></div>
        <div class="history-glow history-glow-b"></div>

        <!-- 1. Header Toolbar -->
        <header class="history-header">
          <div class="header-left">
            <div class="header-icon-box">
              <History size="18" />
            </div>
            <div class="header-title-info">
              <h2 class="modal-title">
                <span>历史版本与内容比对</span>
                <span class="doc-badge">{{ props.doc?.title || '当前文档' }}</span>
              </h2>
              <p class="modal-subtitle">查看历史变更节点，逐行比对内容差异并支持一键回滚（自动保留最近 15 个版本快照）</p>
            </div>
          </div>

          <!-- Center: View Mode Switcher -->
          <div class="view-mode-tabs">
            <button
              class="mode-tab-btn"
              :class="{ active: viewMode === 'split' }"
              @click="viewMode = 'split'"
              title="左右双栏并排比对"
            >
              <Split size="14" />
              <span>双栏对比</span>
            </button>
            <button
              class="mode-tab-btn"
              :class="{ active: viewMode === 'unified' }"
              @click="viewMode = 'unified'"
              title="单栏上下行合并比对"
            >
              <SlidersHorizontal size="14" />
              <span>单栏合并</span>
            </button>
            <button
              class="mode-tab-btn"
              :class="{ active: viewMode === 'preview' }"
              @click="viewMode = 'preview'"
              title="仅预览历史版本纯文本"
            >
              <Eye size="14" />
              <span>历史原文</span>
            </button>
          </div>

          <!-- Right: Save manual snapshot & Close -->
          <div class="header-right">
            <button class="btn-create-snap" @click="startCreateManual" title="将当前编辑内容保存为一个永久快照">
              <Plus size="14" />
              <span>保存当前快照</span>
            </button>
            <button class="btn-close-modal" @click="emit('close')" title="关闭 (Esc)">
              <X size="16" />
            </button>
          </div>
        </header>

        <!-- 2. Main Body: Left Timeline + Right Diff Content -->
        <div class="history-body">
          <!-- ── Left Timeline Column ── -->
          <aside class="history-sidebar">
            <!-- Search & Count Bar -->
            <div class="sidebar-top">
              <div class="search-box">
                <Search size="13" class="search-icon" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索历史版本..."
                  class="search-input"
                />
              </div>
            </div>

            <!-- Manual snapshot creation inline input -->
            <div v-if="isCreatingManual" class="manual-create-card">
              <div class="manual-input-row">
                <input
                  ref="manualInputRef"
                  v-model="manualSnapshotName"
                  type="text"
                  placeholder="输入版本备注名称..."
                  class="manual-name-input"
                  @keyup.enter="confirmCreateManual"
                  @keyup.escape="isCreatingManual = false"
                />
                <button class="btn-manual-confirm" @click="confirmCreateManual" title="保存">
                  <Check size="13" />
                </button>
                <button class="btn-manual-cancel" @click="isCreatingManual = false" title="取消">
                  <X size="13" />
                </button>
              </div>
            </div>

            <!-- Snapshots Timeline List -->
            <div class="timeline-list">
              <div
                v-if="filteredSnapshots.length === 0"
                class="empty-history-box"
              >
                <Clock size="32" class="empty-icon" />
                <p class="empty-title">暂无历史版本记录</p>
                <p class="empty-desc">在编辑器中输入内容时系统将自动生成快照，或点击右上角「保存当前快照」。</p>
              </div>

              <div
                v-for="(snap, index) in filteredSnapshots"
                :key="snap.id"
                class="timeline-card"
                :class="{
                  'is-active': snap.id === selectedSnapshotId,
                  'is-manual': snap.type === 'manual'
                }"
                @click="selectSnapshot(snap)"
              >
                <!-- Timeline Node dot -->
                <div class="timeline-node">
                  <span class="node-dot" :class="{ 'is-manual': snap.type === 'manual' }"></span>
                  <span v-if="index < filteredSnapshots.length - 1" class="node-line"></span>
                </div>

                <!-- Card Content -->
                <div class="card-main">
                  <!-- Name & Tag Row -->
                  <div class="card-header-row">
                    <span v-if="renamingId !== snap.id" class="snap-name" :title="snap.name">
                      {{ snap.name || (snap.type === 'manual' ? '手动快照' : '自动保存') }}
                    </span>
                    <input
                      v-else
                      ref="renameInputRef"
                      v-model="renameInputVal"
                      class="rename-snap-input"
                      @blur="confirmRename(snap)"
                      @keyup.enter="confirmRename(snap)"
                      @keyup.escape="renamingId = null"
                      @click.stop
                    />

                    <span class="snap-badge" :class="snap.type === 'manual' ? 'badge-manual' : 'badge-auto'">
                      {{ snap.type === 'manual' ? '手动' : '自动' }}
                    </span>
                  </div>

                  <!-- Time & Stats Row -->
                  <div class="card-meta-row">
                    <span class="snap-time" :title="new Date(snap.createdAt).toLocaleString()">
                      {{ formatRelativeTime(snap.createdAt) }}
                    </span>
                    <span class="snap-stats">
                      {{ snap.charCount || 0 }} 字 · {{ snap.lineCount || 0 }} 行
                    </span>
                  </div>

                  <!-- Hover Action Buttons -->
                  <div class="card-hover-actions" @click.stop>
                    <button class="mini-action-btn" @click="startRename(snap)" title="重命名备注">
                      <Pencil size="11" />
                    </button>
                    <button class="mini-action-btn btn-del" @click="handleDeleteSnapshot(snap)" title="删除此记录">
                      <Trash2 size="11" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar Footer -->
            <div class="sidebar-footer">
              <span class="history-count">共 {{ snapshots.length }} 个版本记录</span>
              <button
                v-if="snapshots.length > 0"
                class="btn-clear-history"
                @click="handleClearAll"
                title="清空此文档的历史记录"
              >
                <Trash2 size="12" />
                <span>清空历史</span>
              </button>
            </div>
          </aside>

          <!-- ── Right Diff & Comparison Viewport ── -->
          <main class="history-diff-viewport">
            <div v-if="!selectedSnapshot" class="no-selection-box">
              <AlertCircle size="36" class="no-selection-icon" />
              <h3>未选择历史版本</h3>
              <p>请在左侧时间轴中点击选择一个历史快照以进行差异比对。</p>
            </div>

            <template v-else>
              <!-- Diff Overview Control Bar -->
              <div class="diff-control-bar">
                <div class="diff-summary-left">
                  <div class="summary-target-info">
                    <span class="summary-name">{{ selectedSnapshot.name }}</span>
                    <span class="summary-time">（{{ new Date(selectedSnapshot.createdAt).toLocaleString() }}）</span>
                  </div>

                  <!-- Diff Stat Badges -->
                  <div v-if="diffResult" class="diff-stat-badges">
                    <span class="stat-badge stat-added" title="相比历史版本，当前内容新增的行数">
                      +{{ diffResult.stats.additions }} 行
                    </span>
                    <span class="stat-badge stat-deleted" title="相比历史版本，当前内容删除的行数">
                      -{{ diffResult.stats.deletions }} 行
                    </span>
                    <span class="stat-badge stat-unchanged" title="未变动行数">
                      {{ diffResult.stats.unchanged }} 行无变化
                    </span>
                  </div>
                </div>

                <!-- Action Buttons: Restore & Copy -->
                <div class="diff-actions-right">
                  <button class="btn-copy-history" @click="copyHistoricalContent" title="复制该历史版本的 Markdown 文本">
                    <Copy size="13" />
                    <span>{{ copyToastVisible ? '已复制！' : '复制此版' }}</span>
                  </button>
                  <button class="btn-restore-version" @click="handleRestore" title="将此历史版本覆盖回当前正在编辑的文章">
                    <RotateCcw size="13" />
                    <span>恢复为此版本</span>
                  </button>
                </div>
              </div>

              <!-- ── 1. Split Side-by-Side View ── -->
              <div v-if="viewMode === 'split'" class="diff-split-container">
                <!-- Column Headers -->
                <div class="split-headers-row">
                  <div class="split-col-header header-left-col">
                    <span class="col-dot dot-old"></span>
                    <span class="col-title">历史版本快照</span>
                    <span class="col-sub">({{ formatRelativeTime(selectedSnapshot.createdAt) }})</span>
                  </div>
                  <div class="split-col-header header-right-col">
                    <span class="col-dot dot-new"></span>
                    <span class="col-title">当前编辑内容</span>
                    <span class="col-sub">(实时)</span>
                  </div>
                </div>

                <!-- Split Diff Body Table -->
                <div class="split-diff-scroll">
                  <table class="split-diff-table">
                    <tbody>
                      <tr
                        v-for="(row, rIdx) in diffResult?.sideBySide || []"
                        :key="rIdx"
                        class="diff-row"
                        :class="`row-${row.type}`"
                      >
                        <!-- Left Side: Old Version -->
                        <td class="line-num line-num-left">
                          {{ row.left.lineNum || '' }}
                        </td>
                        <td class="line-code line-code-left" :class="`cell-${row.type === 'added' ? 'empty' : row.type}`">
                          <template v-if="row.left.inlineDiff">
                            <span
                              v-for="(seg, sIdx) in row.left.inlineDiff"
                              :key="sIdx"
                              :class="{ 'inline-del': seg.type === 'del' }"
                            >{{ seg.text }}</span>
                          </template>
                          <template v-else>
                            {{ row.left.text }}
                          </template>
                        </td>

                        <!-- Right Side: Current New Version -->
                        <td class="line-num line-num-right">
                          {{ row.right.lineNum || '' }}
                        </td>
                        <td class="line-code line-code-right" :class="`cell-${row.type === 'deleted' ? 'empty' : row.type}`">
                          <template v-if="row.right.inlineDiff">
                            <span
                              v-for="(seg, sIdx) in row.right.inlineDiff"
                              :key="sIdx"
                              :class="{ 'inline-add': seg.type === 'add' }"
                            >{{ seg.text }}</span>
                          </template>
                          <template v-else>
                            {{ row.right.text }}
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- ── 2. Unified Inline View ── -->
              <div v-else-if="viewMode === 'unified'" class="diff-unified-container">
                <div class="unified-diff-scroll">
                  <table class="unified-diff-table">
                    <tbody>
                      <tr
                        v-for="(item, uIdx) in diffResult?.raw || []"
                        :key="uIdx"
                        class="unified-row"
                        :class="`unified-${item.type}`"
                      >
                        <td class="line-num line-old-num">{{ item.oldLineNum || '' }}</td>
                        <td class="line-num line-new-num">{{ item.newLineNum || '' }}</td>
                        <td class="line-sign">
                          <span v-if="item.type === 'added'">+</span>
                          <span v-else-if="item.type === 'deleted'">-</span>
                          <span v-else>&nbsp;</span>
                        </td>
                        <td class="line-code">
                          {{ item.type === 'added' ? item.newLine : item.oldLine }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- ── 3. Plain Preview View ── -->
              <div v-else-if="viewMode === 'preview'" class="diff-preview-container">
                <div class="preview-text-scroll">
                  <pre class="preview-raw-content"><code>{{ selectedSnapshot.content }}</code></pre>
                </div>
              </div>
            </template>
          </main>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Mask & Modal Backdrop ── */
.history-modal-mask {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.history-modal-container {
  position: relative;
  width: 96vw;
  max-width: 1320px;
  height: 88vh;
  max-height: 860px;
  background: var(--bg-editor, #ffffff);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 16px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

html.dark .history-modal-container {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* Ambient glow */
.history-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  opacity: 0.12;
  z-index: 0;
}
.history-glow-a {
  top: -100px;
  left: 20%;
  background: #3b82f6;
}
.history-glow-b {
  bottom: -100px;
  right: 20%;
  background: #10b981;
}

/* ── 1. Header Toolbar ── */
.history-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--bg-sidebar, #fafafa);
  flex-shrink: 0;
}

html.dark .history-header {
  background: #202023;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border-radius: 6px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

html.dark .doc-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.modal-subtitle {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-muted, #64748b);
}

/* View mode switcher tabs */
.view-mode-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: var(--border-color, rgba(0, 0, 0, 0.06));
  border-radius: 8px;
}

html.dark .view-mode-tabs {
  background: rgba(255, 255, 255, 0.06);
}

.mode-tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted, #64748b);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-tab-btn:hover {
  color: var(--text-main, #0f172a);
}

.mode-tab-btn.active {
  background: var(--bg-editor, #ffffff);
  color: #2563eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

html.dark .mode-tab-btn.active {
  background: #27272a;
  color: #60a5fa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-create-snap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-create-snap:hover {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-modal:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-main, #0f172a);
}

html.dark .btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* ── 2. Body Grid Layout ── */
.history-body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 310px 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Left Sidebar Timeline ── */
.history-sidebar {
  border-right: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--bg-sidebar, #fcfcfc);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

html.dark .history-sidebar {
  background: #1c1c1f;
  border-right-color: rgba(255, 255, 255, 0.08);
}

.sidebar-top {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 10px 0 30px;
  font-size: 12.5px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
  border-radius: 6px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #0f172a);
  outline: none;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

html.dark .search-input {
  background: #27272a;
  border-color: rgba(255, 255, 255, 0.12);
  color: #f4f4f5;
}

/* Manual snapshot inline create */
.manual-create-card {
  padding: 10px 14px;
  background: rgba(37, 99, 235, 0.05);
  border-bottom: 1px solid rgba(37, 99, 235, 0.15);
}

.manual-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.manual-name-input {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #2563eb;
  border-radius: 4px;
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #0f172a);
}

.btn-manual-confirm {
  width: 28px;
  height: 28px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-manual-cancel {
  width: 28px;
  height: 28px;
  background: transparent;
  color: #64748b;
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Timeline List */
.timeline-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
}

.empty-history-box {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-muted, #94a3b8);
}

.empty-icon {
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-main, #334155);
  margin: 0 0 4px 0;
}

.empty-desc {
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

/* Timeline Card */
.timeline-card {
  position: relative;
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 4px;
}

.timeline-card:hover {
  background: rgba(0, 0, 0, 0.03);
}

html.dark .timeline-card:hover {
  background: rgba(255, 255, 255, 0.04);
}

.timeline-card.is-active {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.25);
}

html.dark .timeline-card.is-active {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(59, 130, 246, 0.35);
}

/* Timeline Node */
.timeline-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  padding-top: 4px;
  flex-shrink: 0;
}

.node-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid var(--bg-editor, #ffffff);
  box-shadow: 0 0 0 1px #cbd5e1;
  transition: all 0.15s ease;
}

.node-dot.is-manual {
  background: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}

.timeline-card.is-active .node-dot {
  background: #2563eb;
  box-shadow: 0 0 0 2px #93c5fd;
  transform: scale(1.2);
}

.node-line {
  position: absolute;
  top: 14px;
  bottom: -16px;
  width: 1.5px;
  background: var(--border-color, #e2e8f0);
}

html.dark .node-line {
  background: rgba(255, 255, 255, 0.1);
}

/* Card Main */
.card-main {
  flex: 1;
  min-width: 0;
  position: relative;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.snap-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rename-snap-input {
  font-size: 12px;
  height: 22px;
  padding: 0 4px;
  border: 1px solid #2563eb;
  border-radius: 3px;
  width: 120px;
}

.snap-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.badge-manual {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.badge-auto {
  background: #f1f5f9;
  color: #64748b;
}

html.dark .badge-manual {
  background: rgba(37, 99, 235, 0.2);
  color: #93c5fd;
  border-color: rgba(37, 99, 235, 0.4);
}

html.dark .badge-auto {
  background: #27272a;
  color: #a1a1aa;
}

.card-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
}

.card-hover-actions {
  position: absolute;
  right: 0;
  top: 0;
  display: none;
  gap: 4px;
  background: var(--bg-sidebar, #ffffff);
  padding: 2px 4px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.timeline-card:hover .card-hover-actions {
  display: flex;
}

.mini-action-btn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mini-action-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #0f172a;
}

.mini-action-btn.btn-del:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 10px 14px;
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--text-muted, #94a3b8);
}

.btn-clear-history {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  font-size: 11.5px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.btn-clear-history:hover {
  color: #ef4444;
}

/* ── Right Diff Viewport ── */
.history-diff-viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--bg-editor, #ffffff);
}

html.dark .history-diff-viewport {
  background: #18181b;
}

.no-selection-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #94a3b8);
  padding: 40px;
  text-align: center;
}

.no-selection-icon {
  margin-bottom: 12px;
  opacity: 0.4;
}

/* Diff Control Bar */
.diff-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  background: var(--bg-sidebar, #fafafa);
  flex-shrink: 0;
}

html.dark .diff-control-bar {
  background: #202023;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.diff-summary-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

.summary-time {
  font-size: 12px;
  color: var(--text-muted, #64748b);
}

.diff-stat-badges {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', Consolas, monospace;
}

.stat-added {
  background: #dcfce7;
  color: #15803d;
}

.stat-deleted {
  background: #fee2e2;
  color: #b91c1c;
}

.stat-unchanged {
  background: #f1f5f9;
  color: #64748b;
}

html.dark .stat-added {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

html.dark .stat-deleted {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

html.dark .stat-unchanged {
  background: #27272a;
  color: #a1a1aa;
}

.diff-actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-copy-history {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--border-color, #cbd5e1);
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #334155);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-copy-history:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn-restore-version {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12.5px;
  font-weight: 700;
  border-radius: 6px;
  border: none;
  background: #16a34a;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
}

.btn-restore-version:hover {
  background: #15803d;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
  transform: translateY(-1px);
}

/* ── Split Diff View ── */
.diff-split-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.split-headers-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg-sidebar, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  font-size: 12px;
  font-weight: 600;
}

html.dark .split-headers-row {
  background: #1f1f23;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.split-col-header {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-left-col {
  border-right: 1px solid var(--border-color, #e2e8f0);
  color: #b91c1c;
}

.header-right-col {
  color: #15803d;
}

html.dark .header-left-col {
  border-right-color: rgba(255, 255, 255, 0.08);
  color: #f87171;
}

html.dark .header-right-col {
  color: #4ade80;
}

.col-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-old { background: #ef4444; }
.dot-new { background: #22c55e; }

.col-sub {
  font-weight: normal;
  color: var(--text-muted, #94a3b8);
  font-size: 11px;
}

.split-diff-scroll {
  flex: 1;
  overflow: auto;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 12.5px;
  line-height: 1.6;
}

.split-diff-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.diff-row td {
  padding: 1px 6px;
  vertical-align: top;
  white-space: pre-wrap;
  word-break: break-all;
}

.line-num {
  width: 44px;
  text-align: right;
  user-select: none;
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
  background: var(--bg-sidebar, #f8fafc);
  padding-right: 8px !important;
  border-right: 1px solid var(--border-color, #e2e8f0);
}

html.dark .line-num {
  background: #1c1c1f;
  border-right-color: rgba(255, 255, 255, 0.06);
}

.line-code-left {
  border-right: 1px solid var(--border-color, #e2e8f0);
}

html.dark .line-code-left {
  border-right-color: rgba(255, 255, 255, 0.08);
}

/* Diff Status Colors */
.row-deleted .line-code-left {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}

html.dark .row-deleted .line-code-left {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.row-added .line-code-right {
  background: rgba(34, 197, 94, 0.12);
  color: #14532d;
}

html.dark .row-added .line-code-right {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.row-modified .line-code-left {
  background: rgba(239, 68, 68, 0.08);
  color: #7f1d1d;
}

.row-modified .line-code-right {
  background: rgba(34, 197, 94, 0.08);
  color: #14532d;
}

html.dark .row-modified .line-code-left {
  background: rgba(239, 68, 68, 0.18);
  color: #fca5a5;
}

html.dark .row-modified .line-code-right {
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
}

.cell-empty {
  background: var(--bg-sidebar, #f8fafc);
}

html.dark .cell-empty {
  background: #141416;
}

/* Intra-line character highlight */
.inline-del {
  background: #fecaca;
  color: #7f1d1d;
  border-radius: 2px;
  padding: 0 1px;
  text-decoration: line-through;
}

.inline-add {
  background: #bbf7d0;
  color: #14532d;
  border-radius: 2px;
  padding: 0 1px;
}

html.dark .inline-del {
  background: rgba(239, 68, 68, 0.45);
  color: #ffffff;
}

html.dark .inline-add {
  background: rgba(34, 197, 94, 0.45);
  color: #ffffff;
}

/* ── 2. Unified Inline View ── */
.diff-unified-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
}

.unified-diff-scroll {
  flex: 1;
  overflow: auto;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 12.5px;
  line-height: 1.6;
}

.unified-diff-table {
  width: 100%;
  border-collapse: collapse;
}

.unified-row td {
  padding: 1px 6px;
  white-space: pre-wrap;
  word-break: break-all;
}

.line-sign {
  width: 20px;
  text-align: center;
  user-select: none;
  font-weight: bold;
}

.unified-added {
  background: rgba(34, 197, 94, 0.12);
  color: #14532d;
}

.unified-added .line-sign { color: #16a34a; }

.unified-deleted {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}

.unified-deleted .line-sign { color: #dc2626; }

html.dark .unified-added {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

html.dark .unified-deleted {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* ── 3. Plain Preview View ── */
.diff-preview-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 24px;
}

.preview-text-scroll {
  height: 100%;
}

.preview-raw-content {
  margin: 0;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-main, #1e293b);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
