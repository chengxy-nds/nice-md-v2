<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  X,
  LayoutGrid,
  Download,
  Copy,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Move,
  Image as ImageIcon
} from 'lucide-vue-next';
import {
  COLLAGE_RATIOS,
  COLLAGE_LAYOUTS,
  COLLAGE_BG_COLORS,
  extractImagesFromMarkdown,
  loadImage,
  computeCellGeometry,
  renderCollageToCanvas,
  canvasToBlob,
  downloadCanvas
} from '../utils/collageEngine';
import { writeImageBlobToClipboard } from '../utils/clipboard';
import { isStorageEnabled, uploadToOSS } from '../utils/fileStorage';
import { soundEngine } from '../utils/synthAudio';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  markdown: { type: String, default: '' }
});

const emit = defineEmits(['close', 'insert-image', 'toast']);

// ── State ──
const selectedRatioId = ref('wechat-cover');
const selectedLayoutId = ref('3-hero-left');
const activeLayoutCount = ref(3);
const outputWidth = ref(1880);
const outputHeight = ref(800);
const gap = ref(12);
const padding = ref(12);
const radius = ref(14);
const backgroundColor = ref('#FFFFFF');

const cellStates = ref([]);
const selectedCellIndex = ref(0);

const activeSourceTab = ref('doc'); // 'doc' | 'upload'
const docImages = ref([]);
const uploadedImages = ref([]);

const canvasRef = ref(null);
const fileInputRef = ref(null);
const imageMap = new Map();

const isExporting = ref(false);
const isUploading = ref(false);

// ── Computed ──
const activeRatio = computed(() => {
  const preset = COLLAGE_RATIOS.find(r => r.id === selectedRatioId.value);
  const width = getSafeDimension(outputWidth.value, preset?.width || 1200);
  const height = getSafeDimension(outputHeight.value, preset?.height || 800);
  return {
    ...(preset || { id: 'custom', name: '自定义尺寸', badge: '' }),
    width,
    height,
    ratio: width / height
  };
});

const isOutputSizeValid = computed(() => [outputWidth.value, outputHeight.value].every(value => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 12000;
}) && Number(outputWidth.value) * Number(outputHeight.value) <= 40000000);

const activeLayout = computed(() => {
  return COLLAGE_LAYOUTS.find(l => l.id === selectedLayoutId.value) || COLLAGE_LAYOUTS[0];
});

const layoutCountOptions = computed(() => [...new Set(COLLAGE_LAYOUTS.map(layout => layout.cellsCount))].sort((a, b) => a - b));
const layoutsForCount = computed(() => COLLAGE_LAYOUTS.filter(layout => layout.cellsCount === activeLayoutCount.value));

const activeCellState = computed(() => {
  return cellStates.value[selectedCellIndex.value] || null;
});

function setLayoutCount(count) {
  activeLayoutCount.value = count;
  const firstLayout = COLLAGE_LAYOUTS.find(layout => layout.cellsCount === count);
  if (firstLayout && firstLayout.id !== selectedLayoutId.value) {
    selectedLayoutId.value = firstLayout.id;
  }
  soundEngine.playClick();
}

function selectLayout(layout) {
  activeLayoutCount.value = layout.cellsCount;
  selectedLayoutId.value = layout.id;
  soundEngine.playClick();
}

function getSafeDimension(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) return fallback;
  return Math.min(12000, Math.round(number));
}

// ── Initialize Cell States on Layout Change ──
function syncCellStates() {
  const count = activeLayout.value.cellsCount || 1;
  const next = [];
  for (let i = 0; i < count; i++) {
    next.push(cellStates.value[i] || {
      url: '',
      zoom: 1,
      panX: 0,
      panY: 0,
      alt: ''
    });
  }
  cellStates.value = next;
  if (selectedCellIndex.value >= count) {
    selectedCellIndex.value = 0;
  }
}

// ── Image Source Management ──
function refreshDocImages() {
  docImages.value = extractImagesFromMarkdown(props.markdown);
}

function handleAssignImageToCell(url, alt = '') {
  if (!url) return;
  soundEngine.playClick();
  const index = selectedCellIndex.value;
  if (!cellStates.value[index]) {
    cellStates.value[index] = { url: '', zoom: 1, panX: 0, panY: 0, alt: '' };
  }
  cellStates.value[index].url = url;
  cellStates.value[index].alt = alt || `拼块 #${index + 1}`;
  cellStates.value[index].zoom = 1;
  cellStates.value[index].panX = 0;
  cellStates.value[index].panY = 0;

  loadImage(url).then(img => {
    imageMap.set(url, img);
    triggerRender();
  }).catch(err => {
    console.warn('[Collage] Image load failed:', err);
    triggerRender();
  });

  // Automatically advance to next empty cell for rapid collage assembly
  const nextEmpty = cellStates.value.findIndex((c, i) => i > index && !c.url);
  if (nextEmpty !== -1) {
    selectedCellIndex.value = nextEmpty;
  }
}

function handleRemoveCellImage(index) {
  soundEngine.playClick();
  if (cellStates.value[index]) {
    cellStates.value[index].url = '';
    cellStates.value[index].zoom = 1;
    cellStates.value[index].panX = 0;
    cellStates.value[index].panY = 0;
  }
  triggerRender();
}

function handleResetCellTransform() {
  soundEngine.playClick();
  const c = activeCellState.value;
  if (c) {
    c.zoom = 1;
    c.panX = 0;
    c.panY = 0;
    triggerRender();
  }
}

function adjustZoom(delta) {
  const c = activeCellState.value;
  if (!c) return;
  c.zoom = Math.max(1, Math.min(3, Math.round((c.zoom + delta) * 10) / 10));
  triggerRender();
}

// ── Upload Local Images ──
function triggerUpload() {
  fileInputRef.value?.click();
}

function handleFilesSelected(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  processFiles(files);
  e.target.value = '';
}

function processFiles(files) {
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    uploadedImages.value.unshift({
      url: objectUrl,
      alt: file.name,
      file
    });
    // Fill into currently selected cell
    handleAssignImageToCell(objectUrl, file.name);
  });
}

// ── Live Canvas Rendering ──
function triggerRender() {
  if (!isOutputSizeValid.value) return;
  nextTick(() => {
    if (!canvasRef.value) return;
    renderCollageToCanvas(canvasRef.value, {
      width: activeRatio.value.width,
      height: activeRatio.value.height,
      layout: activeLayout.value,
      gap: gap.value,
      padding: padding.value,
      radius: radius.value,
      backgroundColor: backgroundColor.value,
      cellStates: cellStates.value,
      selectedCellIndex: selectedCellIndex.value
    }, imageMap);
  });
}

// ── Canvas Interactive Cell Selection & Panning ──
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialPanX = 0;
let initialPanY = 0;

function handleCanvasPointerDown(e) {
  if (!canvasRef.value) return;
  e.preventDefault();
  e.currentTarget?.setPointerCapture?.(e.pointerId);
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;

  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  // Find clicked cell
  const cells = activeLayout.value.cells || [];
  let clickedIndex = -1;

  for (let i = 0; i < cells.length; i++) {
    const geom = computeCellGeometry(
      cells[i],
      activeRatio.value.width,
      activeRatio.value.height,
      gap.value,
      padding.value
    );
    if (
      clickX >= geom.x &&
      clickX <= geom.x + geom.w &&
      clickY >= geom.y &&
      clickY <= geom.y + geom.h
    ) {
      clickedIndex = i;
      break;
    }
  }

  if (clickedIndex !== -1) {
    soundEngine.playClick();
    selectedCellIndex.value = clickedIndex;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const state = cellStates.value[clickedIndex];
    initialPanX = state?.panX || 0;
    initialPanY = state?.panY || 0;
    triggerRender();
  }
}

function handleCanvasPointerMove(e) {
  if (!isDragging) return;
  const state = activeCellState.value;
  if (!state || !state.url) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  // Sensitivity factor
  state.panX = Math.max(-1, Math.min(1, initialPanX + dx / 150));
  state.panY = Math.max(-1, Math.min(1, initialPanY + dy / 150));

  triggerRender();
}

function handleCanvasPointerUp() {
  isDragging = false;
}

function handleCanvasWheel(e) {
  const state = activeCellState.value;
  if (!state || !state.url) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  state.zoom = Math.max(1, Math.min(3, Math.round((state.zoom + delta) * 10) / 10));
  triggerRender();
}

// ── Export Actions ──
async function handleCopyImage() {
  if (!canvasRef.value) return;
  isExporting.value = true;
  try {
    const blob = await canvasToBlob(canvasRef.value);
    await writeImageBlobToClipboard(blob);
    soundEngine.playChime();
    emit('toast', '已成功复制拼图到剪贴板，可在公众号后台直接 Ctrl+V 粘贴！');
  } catch (err) {
    console.error('[Collage] Copy failed:', err);
    emit('toast', '复制失败，请尝试直接下载保存图片');
  } finally {
    isExporting.value = false;
  }
}

function handleDownloadImage() {
  if (!canvasRef.value) return;
  soundEngine.playChime();
  const filename = `collage-cover-${Date.now()}.png`;
  downloadCanvas(canvasRef.value, filename);
  emit('toast', `封面拼图已保存为 ${filename}`);
}

async function handleInsertToDoc() {
  if (!canvasRef.value) return;
  isUploading.value = true;
  try {
    const blob = await canvasToBlob(canvasRef.value);
    let finalUrl = '';

    if (isStorageEnabled()) {
      // Direct upload to configured OSS bucket
      const file = new File([blob], `cover-collage-${Date.now()}.png`, { type: 'image/png' });
      finalUrl = await uploadToOSS(file);
    } else {
      // Local Base64 Data URL fallback
      finalUrl = canvasRef.value.toDataURL('image/png', 0.96);
    }

    const mdSnippet = `![封面拼图](${finalUrl})`;
    soundEngine.playChime();
    emit('insert-image', { markdown: mdSnippet, url: finalUrl });
    emit('toast', '已成功将封面拼图插入文档');
    emit('close');
  } catch (err) {
    console.error('[Collage] Insert failed:', err);
    emit('toast', '插入图片失败: ' + err.message);
  } finally {
    isUploading.value = false;
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
}

// ── Watchers & Lifecycle ──
watch(() => props.isOpen, (open) => {
  if (open) {
    refreshDocImages();
    syncCellStates();
    // Preload document images
    docImages.value.forEach(img => {
      loadImage(img.url).then(loaded => imageMap.set(img.url, loaded)).catch(() => {});
    });
    nextTick(() => {
      triggerRender();
    });
  }
});

watch(selectedRatioId, (id) => {
  if (id === 'custom') return;
  const preset = COLLAGE_RATIOS.find(ratio => ratio.id === id);
  if (preset) {
    outputWidth.value = preset.width;
    outputHeight.value = preset.height;
  }
});

watch([selectedRatioId, selectedLayoutId, outputWidth, outputHeight, gap, padding, radius, backgroundColor], () => {
  syncCellStates();
  triggerRender();
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('pointerup', handleCanvasPointerUp);
  window.addEventListener('pointercancel', handleCanvasPointerUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('pointerup', handleCanvasPointerUp);
  window.removeEventListener('pointercancel', handleCanvasPointerUp);
  uploadedImages.value.forEach(item => {
    if (item.url?.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
  });
});
</script>

<template>
  <Teleport to="body">
    <Transition name="collage-modal-fade">
      <div v-if="isOpen" class="collage-backdrop" @click.self="$emit('close')">
        <div class="collage-modal-container">
          <!-- ── Header ── -->
          <div class="collage-header">
            <div class="header-left">
              <div class="header-icon-box">
                <LayoutGrid size="19" class="header-icon" />
              </div>
              <div class="header-title-box">
                <div class="header-title">
                  <span>拼图工坊</span>
                  <span class="header-badge">高清 PNG</span>
                </div>
                <div class="header-subtitle">
                  选图 · 排版 · 导出
                </div>
              </div>
            </div>
            <button class="btn-close" @click="$emit('close')" aria-label="关闭拼图窗口">
              <X size="18" />
            </button>
          </div>

          <!-- ── Body: 3-column workspace ── -->
          <div class="collage-body">
            <!-- Column 1: Image Source Picker -->
            <div class="source-panel">
              <div class="source-tabs">
                <button
                  class="source-tab-btn"
                  :class="{ 'is-active': activeSourceTab === 'doc' }"
                  @click="activeSourceTab = 'doc'"
                >
                  <ImageIcon size="13.5" />
                  <span>文档图片（{{ docImages.length }}）</span>
                </button>
                <button
                  class="source-tab-btn"
                  :class="{ 'is-active': activeSourceTab === 'upload' }"
                  @click="activeSourceTab = 'upload'"
                >
                  <UploadCloud size="13.5" />
                  <span>本地图片（{{ uploadedImages.length }}）</span>
                </button>
              </div>

              <!-- Doc Images Tab -->
              <div v-if="activeSourceTab === 'doc'" class="source-list-scroll">
                <div v-if="docImages.length === 0" class="source-empty-state">
                  <ImageIcon size="28" class="empty-icon" />
                  <p>本文暂无图片</p>
                  <small>上传图片开始</small>
                </div>
                <div v-else class="image-grid-flow">
                  <div
                    v-for="(img, idx) in docImages"
                    :key="idx"
                    class="source-image-card"
                    :class="{ 'is-used': cellStates.some(c => c.url === img.url) }"
                    @click="handleAssignImageToCell(img.url, img.alt)"
                  >
                    <img :src="img.url" :alt="img.alt" loading="lazy" />
                    <div class="card-overlay">
                      <Plus size="14" />
                  <span>填入 #{{ selectedCellIndex + 1 }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upload Images Tab -->
              <div v-else class="source-list-scroll">
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  multiple
                  class="source-file-input"
                  @change="handleFilesSelected"
                />
                <div
                  class="upload-dropzone"
                  @click="triggerUpload"
                  @dragover.prevent
                  @drop.prevent="e => processFiles(Array.from(e.dataTransfer.files || []))"
                >
                  <span class="upload-drop-icon-box"><UploadCloud size="18" class="upload-drop-icon" /></span>
                  <div class="upload-drop-copy">
                    <p class="upload-drop-title">拖拽或上传</p>
                    <small class="upload-drop-hint">JPG、PNG、WebP · 支持多选</small>
                  </div>
                  <button type="button" class="upload-select-btn" @click.stop="triggerUpload">选择图片</button>
                </div>

                <div v-if="uploadedImages.length > 0" class="image-grid-flow mt-3">
                  <div
                    v-for="(img, idx) in uploadedImages"
                    :key="idx"
                    class="source-image-card"
                    @click="handleAssignImageToCell(img.url, img.alt)"
                  >
                    <img :src="img.url" :alt="img.alt" />
                    <div class="card-overlay">
                      <Plus size="14" />
                      <span>填入格 #{{ selectedCellIndex + 1 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column 2: Live Canvas Stage -->
            <div class="stage-panel">
              <div class="stage-canvas-wrapper" @pointerdown="handleCanvasPointerDown" @pointermove="handleCanvasPointerMove" @wheel="handleCanvasWheel">
                <canvas ref="canvasRef" class="collage-main-canvas"></canvas>
              </div>

              <!-- Interactive Floating Bar for Selected Cell -->
              <div v-if="activeCellState" class="cell-action-bar">
                <div class="cell-label-pill">
                  <span>拼块 #{{ selectedCellIndex + 1 }}</span>
                </div>
                <template v-if="activeCellState.url">
                  <span class="cell-bar-sep"></span>
                  <div class="zoom-controls">
                    <button class="btn-tool" @click="adjustZoom(-0.1)" title="缩小图片"><ZoomOut size="13" /></button>
                    <span class="zoom-val">{{ Math.round((activeCellState.zoom || 1) * 100) }}%</span>
                    <button class="btn-tool" @click="adjustZoom(0.1)" title="放大图片"><ZoomIn size="13" /></button>
                  </div>
                  <span class="cell-bar-sep"></span>
                  <button class="btn-tool is-text" @click="handleResetCellTransform" title="重置居中与缩放">
                    <RotateCcw size="12" />
                    <span>居中</span>
                  </button>
                  <button class="btn-tool is-danger is-text" @click="handleRemoveCellImage(selectedCellIndex)" title="清空此格图片">
                    <Trash2 size="12" />
                    <span>清除</span>
                  </button>
                </template>
                <template v-else>
                  <span class="cell-empty-hint">选择图片填入此格</span>
                </template>
              </div>
            </div>

            <!-- Column 3: Customization Panel -->
            <div class="config-panel">
              <!-- Ratio Selection -->
              <div class="config-section">
                <label class="section-title" for="collage-ratio-select">输出尺寸</label>
                <select id="collage-ratio-select" v-model="selectedRatioId" class="ratio-select">
                  <option v-for="r in COLLAGE_RATIOS" :key="r.id" :value="r.id">{{ r.name }} · {{ r.width }} × {{ r.height }} px</option>
                  <option value="custom">自定义</option>
                </select>
                <div class="dimension-fields">
                  <label class="dimension-field">
                    <span>宽度</span>
                    <span class="dimension-input-wrap"><input v-model.number="outputWidth" type="number" min="1" max="12000" step="1" inputmode="numeric" @input="selectedRatioId = 'custom'" /><span>px</span></span>
                  </label>
                  <label class="dimension-field">
                    <span>高度</span>
                    <span class="dimension-input-wrap"><input v-model.number="outputHeight" type="number" min="1" max="12000" step="1" inputmode="numeric" @input="selectedRatioId = 'custom'" /><span>px</span></span>
                  </label>
                </div>
                <small v-if="!isOutputSizeValid" class="dimension-error">尺寸无效或超过 4000 万像素</small>
              </div>

              <!-- Layout Presets -->
              <div class="config-section">
                <div class="layout-section-heading">
                <label class="section-title">拼图布局</label>
                </div>
                <div class="layout-count-tabs" role="tablist" aria-label="选择拼图图片数量">
                  <button
                    v-for="count in layoutCountOptions"
                    :key="count"
                    class="layout-count-tab"
                    :class="{ 'is-selected': count === activeLayoutCount }"
                    role="tab"
                    :aria-selected="count === activeLayoutCount"
                    @click="setLayoutCount(count)"
                  >{{ count }}</button>
                </div>
                <div class="layout-grid-select">
                  <button
                    v-for="l in layoutsForCount"
                    :key="l.id"
                    class="layout-btn"
                    :class="{ 'is-selected': l.id === selectedLayoutId }"
                    @click="selectLayout(l)"
                    :aria-label="`${l.cellsCount} 张图片，${l.name}`"
                  >
                    <div class="layout-preview-box">
                      <div
                        v-for="(c, cIdx) in l.cells"
                        :key="cIdx"
                        class="layout-mini-cell"
                        :style="{
                          left: `${c.x * 100}%`,
                          top: `${c.y * 100}%`,
                          width: `${c.w * 100}%`,
                          height: `${c.h * 100}%`
                        }"
                      ></div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Spacing, Gap, Radius Sliders -->
              <div class="config-section">
                <label class="section-title">布局细节</label>
                <div class="slider-row">
                  <div class="slider-meta">
                    <span>拼块间距</span>
                    <span class="slider-val">{{ gap }} px</span>
                  </div>
                  <input v-model.number="gap" type="range" min="0" max="36" step="2" class="range-slider" />
                </div>

                <div class="slider-row">
                  <div class="slider-meta">
                    <span>画布边距</span>
                    <span class="slider-val">{{ padding }} px</span>
                  </div>
                  <input v-model.number="padding" type="range" min="0" max="40" step="2" class="range-slider" />
                </div>

                <div class="slider-row">
                  <div class="slider-meta">
                    <span>圆角</span>
                    <span class="slider-val">{{ radius }} px</span>
                  </div>
                  <input v-model.number="radius" type="range" min="0" max="32" step="2" class="range-slider" />
                </div>
              </div>

              <!-- Background Color -->
              <div class="config-section">
                <label class="section-title">底色</label>
                <div class="color-swatches">
                  <button
                    v-for="bg in COLLAGE_BG_COLORS"
                    :key="bg.value"
                    class="color-swatch-btn"
                    :class="{ 'is-selected': backgroundColor === bg.value, 'is-checker': bg.isTransparent }"
                    :style="{ backgroundColor: bg.value, borderColor: bg.border }"
                    @click="backgroundColor = bg.value; soundEngine.playClick()"
                    :title="bg.label"
                  >
                    <Check v-if="backgroundColor === bg.value" size="13" :class="bg.value === '#FFFFFF' || bg.isTransparent ? 'text-slate-800' : 'text-white'" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Footer: Actions ── -->
          <div class="collage-footer">
            <div class="footer-meta">
              <span class="dim-tag">{{ activeRatio.width }} × {{ activeRatio.height }} px · PNG</span>
              <span class="guide-hint"><Move size="12" class="inline mr-1" />拖动调整 · 滚轮缩放</span>
            </div>
            <div class="footer-actions">
              <button
                class="btn-footer-action is-secondary"
                :disabled="!isOutputSizeValid"
                @click="handleDownloadImage"
              >
                <Download size="14.5" />
                <span>下载</span>
              </button>

              <button
                class="btn-footer-action is-secondary"
                :disabled="isExporting || !isOutputSizeValid"
                @click="handleCopyImage"
              >
                <Copy size="14.5" />
                <span>{{ isExporting ? '生成中…' : '复制图片' }}</span>
              </button>

              <button
                class="btn-footer-action is-primary"
                :disabled="isUploading || !isOutputSizeValid"
                @click="handleInsertToDoc"
              >
                <Sparkles size="14.5" />
                <span>{{ isUploading ? '上传中…' : '插入文档' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.collage-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(10px, 2vw, 24px);
}

.collage-modal-container {
  width: min(1440px, 100%);
  height: min(900px, calc(100vh - 32px));
  height: min(900px, calc(100dvh - 32px));
  min-width: 0;
  min-height: 0;
  background: var(--bg-card, #FFFFFF);
  border-radius: 16px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color, #E2E8F0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.collage-header {
  min-height: 64px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle, #EDF1F7);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--brand-subtle, #EFF6FF);
  color: var(--brand-primary, #116ACC);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title-box {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main, #0F172A);
}

.header-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  background: #DCFCE7;
  color: #15803D;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-muted, #64748B);
  margin-top: 1px;
  max-width: min(76vw, 980px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted, #64748B);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close:hover {
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-main, #0F172A);
}

/* ── 3-Column Body ── */
.collage-body {
  flex: 1 1 0;
  display: grid;
  grid-template-columns: minmax(190px, 240px) minmax(0, 1fr) minmax(270px, 320px);
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  scrollbar-width: none;
}

.collage-body::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* ── Col 1: Source Panel ── */
.source-panel {
  min-width: 0;
  border-right: 1px solid var(--border-subtle, #EDF1F7);
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar, #F8FAFC);
  flex-shrink: 0;
}

.source-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 10px;
  gap: 6px;
  border-bottom: 1px solid var(--border-subtle, #EDF1F7);
}

.source-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-muted, #64748B);
  cursor: pointer;
  transition: all 0.15s ease;
}

.source-tab-btn.is-active {
  background: var(--bg-card, #FFFFFF);
  color: var(--brand-primary, #116ACC);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.source-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.source-empty-state {
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #64748B);
  text-align: center;
  padding: 20px;
}

.source-empty-state .empty-icon {
  margin-bottom: 8px;
  opacity: 0.45;
}

.source-empty-state p {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.source-empty-state small {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.8;
}

.image-grid-flow {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.source-image-card {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color, #E2E8F0);
  background: #E2E8F0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.source-image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.source-image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.source-image-card .card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 106, 204, 0.85);
  color: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.source-image-card:hover .card-overlay {
  opacity: 1;
}

.source-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.upload-dropzone {
  width: 100%;
  min-height: 84px;
  border: 1px dashed #B8C7D8;
  border-radius: 10px;
  padding: 10px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  text-align: left;
  background: var(--bg-card, #FFFFFF);
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.upload-dropzone:hover,
.upload-dropzone:focus-within {
  border-color: var(--brand-primary, #116ACC);
  background: var(--brand-subtle, #EFF6FF);
  outline: none;
}

.upload-drop-icon-box {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--brand-primary, #116ACC);
  background: var(--brand-subtle, #EFF6FF);
}

.upload-drop-icon {
  color: inherit;
}

.upload-drop-copy {
  min-width: 0;
}

.upload-drop-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main, #0F172A);
  margin: 0;
  line-height: 1.35;
}

.upload-drop-hint {
  display: block;
  font-size: 10px;
  color: var(--text-muted, #64748B);
  margin-top: 3px;
  line-height: 1.3;
}

.upload-select-btn {
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--border-color, #D8E1EC);
  border-radius: 7px;
  background: var(--bg-card, #FFFFFF);
  color: var(--brand-primary, #116ACC);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.upload-select-btn:hover {
  border-color: var(--brand-primary, #116ACC);
}

.ratio-select {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--border-color, #D8E1EC);
  border-radius: 8px;
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #0F172A);
  font: inherit;
  font-size: 12px;
  outline: none;
}

.ratio-select:focus {
  border-color: var(--brand-primary, #116ACC);
  box-shadow: 0 0 0 2px rgba(17, 106, 204, 0.12);
}

.dimension-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.dimension-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: var(--text-muted, #64748B);
  font-size: 11px;
  font-weight: 600;
}

.dimension-input-wrap {
  min-width: 0;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  border: 1px solid var(--border-color, #D8E1EC);
  border-radius: 7px;
  background: var(--bg-card, #FFFFFF);
  color: var(--text-muted, #64748B);
  font-size: 10px;
  font-weight: 500;
}

.dimension-input-wrap:focus-within {
  border-color: var(--brand-primary, #116ACC);
  box-shadow: 0 0 0 2px rgba(17, 106, 204, 0.12);
}

.dimension-input-wrap input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-main, #0F172A);
  font: inherit;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.dimension-input-wrap input::-webkit-inner-spin-button,
.dimension-input-wrap input::-webkit-outer-spin-button {
  margin: 0;
}

.dimension-error {
  color: #DC2626;
  font-size: 10.5px;
}

/* ── Col 2: Live Stage Panel ── */
.stage-panel {
  min-width: 0;
  background: #111720;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.2) 0%, transparent 80%),
    linear-gradient(rgba(148, 163, 184, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.075) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px, 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: clamp(12px, 2vw, 24px);
  overflow: hidden;
}

.stage-canvas-wrapper {
  width: 100%;
  height: 100%;
  min-height: 0;
  max-width: 100%;
  max-height: calc(100% - 50px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: crosshair;
}

.collage-main-canvas {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  touch-action: none;
}

.cell-action-bar {
  position: absolute;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 10;
}

.cell-label-pill {
  font-size: 12px;
  font-weight: 600;
  color: #93C5FD;
}

.cell-empty-hint {
  font-size: 11.5px;
  color: #94A3B8;
}

.cell-bar-sep {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.2);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-val {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  min-width: 38px;
  text-align: center;
}

.btn-tool {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-tool:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-tool.is-text {
  width: auto;
  padding: 0 8px;
  font-size: 11.5px;
  gap: 4px;
}

.btn-tool.is-danger:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #FCA5A5;
}

/* ── Col 3: Config Panel ── */
.config-panel {
  min-width: 0;
  border-left: 1px solid var(--border-subtle, #EDF1F7);
  display: flex;
  flex-direction: column;
  background: var(--bg-card, #FFFFFF);
  overflow-y: auto;
  padding: 16px;
  gap: 16px;
  overflow-x: hidden;
  scrollbar-width: none;
  overscroll-behavior: contain;
}

.config-panel::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.config-section {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-main, #0F172A);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.ratio-select-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ratio-card {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #E2E8F0);
  background: var(--bg-card, #FFFFFF);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ratio-card:hover {
  border-color: var(--brand-primary, #116ACC);
}

.ratio-card.is-selected {
  border-color: var(--brand-primary, #116ACC);
  background: var(--brand-subtle, #EFF6FF);
}

.ratio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ratio-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main, #0F172A);
}

.ratio-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 4px;
  background: #DBEAFE;
  color: #1E40AF;
}

.ratio-dim {
  font-size: 11px;
  color: var(--text-muted, #64748B);
  margin-top: 2px;
}

.layout-grid-select {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.layout-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.layout-count-caption {
  color: var(--text-muted, #64748B);
  font-size: 11px;
  white-space: nowrap;
}

.layout-count-tabs {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 3px;
  padding: 3px;
  border-radius: 8px;
  background: var(--bg-sidebar, #F1F5F9);
}

.layout-count-tab {
  height: 27px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted, #64748B);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}

.layout-count-tab:hover {
  color: var(--text-main, #0F172A);
}

.layout-count-tab.is-selected {
  background: var(--bg-card, #FFFFFF);
  color: var(--brand-primary, #116ACC);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.1);
}

.layout-btn {
  min-width: 0;
  min-height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 6px;
  border-radius: 7px;
  border: 1px solid var(--border-color, #E2E8F0);
  background: var(--bg-card, #FFFFFF);
  cursor: pointer;
  transition: all 0.15s ease;
}

.layout-btn:not(.is-selected):hover {
  border-color: #A9B8CA;
  background: #F8FAFC;
}

.layout-btn.is-selected {
  border-color: var(--brand-primary, #116ACC);
  background: var(--brand-subtle, #EFF6FF);
}

.layout-preview-box {
  width: min(100%, 68px);
  height: 40px;
  background: #F1F5F9;
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}

.layout-mini-cell {
  position: absolute;
  box-sizing: border-box;
  background: #94A3B8;
  border: 1px solid #F8FAFC;
}

.layout-btn.is-selected .layout-mini-cell {
  background: var(--brand-primary, #116ACC);
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 6px;
}

.slider-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--text-muted, #64748B);
}

.slider-val {
  font-weight: 600;
  color: var(--text-main, #0F172A);
  font-variant-numeric: tabular-nums;
}

.range-slider {
  width: 100%;
  accent-color: var(--brand-primary, #116ACC);
  cursor: pointer;
}

.color-swatches {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1.5px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.color-swatch-btn:hover {
  transform: scale(1.1);
}

.color-swatch-btn.is-selected {
  box-shadow: 0 0 0 2px var(--brand-primary, #116ACC);
}

.color-swatch-btn.is-checker {
  background-image: linear-gradient(45deg, #E2E8F0 25%, transparent 25%), linear-gradient(-45deg, #E2E8F0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E2E8F0 75%), linear-gradient(-45deg, transparent 75%, #E2E8F0 75%);
  background-size: 8px 8px;
}

/* ── Footer ── */
.collage-footer {
  min-height: 60px;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle, #EDF1F7);
  background: var(--bg-card, #FFFFFF);
  flex-shrink: 0;
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dim-tag {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-main, #0F172A);
}

.guide-hint {
  font-size: 11.5px;
  color: var(--text-muted, #64748B);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-footer-action {
  height: 38px;
  padding: 0 16px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-footer-action.is-secondary {
  border: 1px solid var(--border-color, #CBD5E1);
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #0F172A);
}

.btn-footer-action.is-secondary:hover {
  background: var(--bg-sidebar, #F8FAFC);
  border-color: var(--text-muted, #94A3B8);
}

.btn-footer-action.is-primary {
  border: none;
  background: var(--brand-primary, #116ACC);
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(17, 106, 204, 0.28);
}

.btn-footer-action.is-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-footer-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ── Responsive workspace ── */
@media (max-width: 1080px) {
  .collage-body {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 34%);
    grid-template-rows: minmax(128px, 24%) minmax(0, 1fr);
  }

  .source-panel {
    grid-column: 1 / -1;
    grid-row: 1;
    border-right: 0;
    border-bottom: 1px solid var(--border-subtle, #EDF1F7);
  }

  .source-tabs {
    padding: 6px 10px;
  }

  .source-list-scroll {
    padding: 8px 12px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .image-grid-flow {
    display: flex;
    width: max-content;
    gap: 8px;
  }

  .source-image-card {
    width: 112px;
    flex: 0 0 112px;
  }

  .source-empty-state {
    min-height: 0;
    flex-direction: row;
    justify-content: flex-start;
    gap: 8px;
    padding: 10px 4px;
    text-align: left;
  }

  .source-empty-state .empty-icon {
    width: 18px;
    margin: 0;
  }

  .source-empty-state small {
    margin: 0 0 0 4px;
  }

  .upload-dropzone {
    min-height: 76px;
    padding: 8px;
    max-width: 420px;
  }

  .stage-panel {
    grid-column: 1;
    grid-row: 2;
  }

  .config-panel {
    grid-column: 2;
    grid-row: 2;
    padding: 14px 12px;
  }

  .ratio-select-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ratio-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .collage-footer {
    padding: 8px 14px;
  }

  .guide-hint {
    display: none;
  }

  .footer-actions {
    gap: 6px;
  }

  .btn-footer-action {
    padding: 0 10px;
    font-size: 12px;
  }
}

@media (max-width: 720px) {
  .collage-backdrop {
    padding: 0;
  }

  .collage-modal-container {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    border: 0;
  }

  .collage-header {
    min-height: 58px;
    padding: 9px 12px;
    gap: 8px;
  }

  .header-left {
    gap: 9px;
  }

  .header-icon-box {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
  }

  .header-title {
    flex-wrap: wrap;
    gap: 4px 7px;
    font-size: 14px;
  }

  .header-badge {
    font-size: 10px;
  }

  .header-subtitle {
    max-width: calc(100vw - 92px);
    font-size: 10.5px;
  }

  .collage-body {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .source-panel {
    width: 100%;
    flex: 0 0 auto;
    border-bottom: 1px solid var(--border-subtle, #EDF1F7);
  }

  .source-tabs {
    padding: 6px 10px;
  }

  .source-list-scroll {
    flex: 0 0 auto;
    min-height: 94px;
    max-height: 154px;
    padding: 8px 10px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .image-grid-flow {
    display: flex;
    width: max-content;
    gap: 8px;
  }

  .source-image-card {
    width: 104px;
    flex: 0 0 104px;
    aspect-ratio: 4 / 3;
  }

  .source-empty-state {
    min-height: 76px;
    padding: 8px 4px;
  }

  .source-empty-state p {
    font-size: 12px;
  }

  .source-empty-state small {
    display: none;
  }

  .upload-dropzone {
    min-height: 76px;
    max-width: none;
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 8px;
    padding: 9px;
  }

  .stage-panel {
    flex: 0 0 auto;
    width: 100%;
    height: clamp(240px, 42vh, 390px);
    min-height: 240px;
    padding: 12px;
  }

  .stage-canvas-wrapper {
    max-height: calc(100% - 42px);
  }

  .collage-main-canvas {
    max-width: 100%;
    max-height: 100%;
  }

  .cell-action-bar {
    bottom: 7px;
    max-width: calc(100% - 18px);
    gap: 5px;
    padding: 5px 8px;
  }

  .cell-empty-hint {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .config-panel {
    width: 100%;
    flex: 0 0 auto;
    overflow: visible;
    padding: 14px 12px 18px;
    border-left: 0;
    border-top: 1px solid var(--border-subtle, #EDF1F7);
  }

  .ratio-select-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ratio-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .layout-grid-select {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .collage-footer {
    flex: 0 0 auto;
    min-height: auto;
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
    padding: 9px 12px max(10px, env(safe-area-inset-bottom));
  }

  .footer-meta {
    justify-content: space-between;
  }

  .dim-tag {
    font-size: 11px;
  }

  .footer-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .btn-footer-action {
    min-width: 0;
    height: 36px;
    justify-content: center;
    padding: 0 8px;
    font-size: 11.5px;
  }

  .btn-footer-action.is-primary {
    grid-column: 1 / -1;
  }
}

@media (max-width: 420px) {
  .header-subtitle,
  .header-badge {
    display: none;
  }

  .layout-grid-select {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .layout-count-tabs {
    gap: 2px;
    padding: 2px;
  }

  .layout-count-tab {
    height: 25px;
  }

  .layout-btn {
    min-height: 58px;
  }
}

@media (max-height: 620px) and (min-width: 721px) {
  .collage-modal-container {
    height: calc(100vh - 16px);
    height: calc(100dvh - 16px);
  }

  .collage-header {
    min-height: 54px;
  }

  .collage-footer {
    min-height: 52px;
  }

  .config-panel {
    padding-top: 10px;
    padding-bottom: 10px;
    gap: 12px;
  }
}

/* ── Transitions & Dark Mode ── */
.collage-modal-fade-enter-active,
.collage-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.collage-modal-fade-enter-from,
.collage-modal-fade-leave-to {
  opacity: 0;
}

html.dark .collage-modal-container {
  background: #111827;
  border-color: #374151;
}

html.dark .source-panel,
html.dark .config-panel,
html.dark .collage-header,
html.dark .collage-footer {
  background: #111827;
  border-color: #1F2937;
}

html.dark .source-tab-btn.is-active,
html.dark .ratio-card,
html.dark .layout-btn,
html.dark .upload-dropzone,
html.dark .ratio-select,
html.dark .dimension-input-wrap,
html.dark .upload-select-btn,
html.dark .btn-footer-action.is-secondary {
  background: #1F2937;
  border-color: #374151;
  color: #F9FAFB;
}

html.dark .ratio-card.is-selected,
html.dark .layout-btn.is-selected {
  border-color: #3B82F6;
  background: rgba(59, 130, 246, 0.15);
}

html.dark .layout-btn:not(.is-selected):hover {
  border-color: #64748B;
  background: #1F2937;
}

html.dark .layout-count-tabs {
  background: #1F2937;
}

html.dark .layout-count-tab.is-selected {
  background: #111827;
  color: #93C5FD;
}

html.dark .layout-preview-box {
  background: #0F172A;
  border-color: #374151;
}

html.dark .dimension-input-wrap input {
  color: #F9FAFB;
}

html.dark .upload-drop-icon-box {
  background: rgba(59, 130, 246, 0.15);
}

html.dark .layout-mini-cell {
  border-color: #1F2937;
}
</style>

