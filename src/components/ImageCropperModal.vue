<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  X,
  Crop,
  RotateCw,
  FlipHorizontal,
  RotateCcw,
  Download,
  Copy,
  Sparkles,
  Check,
  Plus
} from 'lucide-vue-next';
import {
  CROP_RATIO_PRESETS,
  getOrientedDimensions,
  cropImageToCanvas,
  canvasToBlob,
  downloadCanvas
} from '../utils/imageCropper';
import { writeImageBlobToClipboard } from '../utils/clipboard';
import { isStorageEnabled, uploadToOSS } from '../utils/fileStorage';
import { soundEngine } from '../utils/synthAudio';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  altText: { type: String, default: '' },
  canReplace: { type: Boolean, default: true }
});

const emit = defineEmits(['close', 'replace', 'insert', 'toast']);

// ── Image State ──
const imageElement = ref(null);
const imageLoaded = ref(false);
const imageLoadError = ref(false);
const naturalWidth = ref(0);
const naturalHeight = ref(0);

// ── Transform State ──
const rotation = ref(0); // 0, 90, 180, 270
const flipH = ref(false);
const selectedRatio = ref('free'); // 'free' | '1:1' | '2.35:1' | ...

// ── Crop Box (Normalized 0..1 relative to oriented image) ──
const cropBox = ref({ x: 0, y: 0, width: 1, height: 1 });

// ── DOM References ──
const stageWrapperRef = ref(null);
const displayedImageRef = ref(null);
const displayedRect = ref({ left: 0, top: 0, width: 0, height: 0 });

const isExporting = ref(false);
const isUploading = ref(false);

const activeRatioObj = computed(() => {
  return CROP_RATIO_PRESETS.find(p => p.id === selectedRatio.value) || CROP_RATIO_PRESETS[0];
});

const orientedDimensions = computed(() => {
  if (!naturalWidth.value || !naturalHeight.value) return { width: 0, height: 0 };
  return getOrientedDimensions(naturalWidth.value, naturalHeight.value, rotation.value);
});

// Calculate actual pixel dimensions of current crop box in natural image pixels
const cropPixelDimensions = computed(() => {
  const ow = orientedDimensions.value.width;
  const oh = orientedDimensions.value.height;
  if (!ow || !oh) return { width: 0, height: 0 };
  return {
    width: Math.round(cropBox.value.width * ow),
    height: Math.round(cropBox.value.height * oh)
  };
});

// ── Initialize & Load Image ──
function initImage(src) {
  if (!src) return;
  imageLoaded.value = false;
  imageLoadError.value = false;

  const img = new window.Image();
  if (!src.startsWith('data:') && !src.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.onload = () => {
    imageElement.value = img;
    naturalWidth.value = img.naturalWidth;
    naturalHeight.value = img.naturalHeight;
    imageLoaded.value = true;
    resetCropBox();
    nextTick(updateDisplayedGeometry);
  };
  img.onerror = () => {
    // Retry without anonymous if server doesn't send CORS headers
    if (img.crossOrigin) {
      const fallback = new window.Image();
      fallback.onload = () => {
        imageElement.value = fallback;
        naturalWidth.value = fallback.naturalWidth;
        naturalHeight.value = fallback.naturalHeight;
        imageLoaded.value = true;
        resetCropBox();
        nextTick(updateDisplayedGeometry);
      };
      fallback.onerror = () => {
        imageLoadError.value = true;
      };
      fallback.src = src;
    } else {
      imageLoadError.value = true;
    }
  };
  img.src = src;
}

// ── Reset Crop Box based on Ratio ──
function resetCropBox() {
  const targetRatio = activeRatioObj.value.ratio;
  if (!targetRatio) {
    // Free aspect ratio: initial 90% centered box
    cropBox.value = { x: 0.05, y: 0.05, width: 0.9, height: 0.9 };
    return;
  }

  const ow = orientedDimensions.value.width;
  const oh = orientedDimensions.value.height;
  if (!ow || !oh) return;

  const imageAspect = ow / oh;
  let w, h;

  if (targetRatio > imageAspect) {
    w = 0.92;
    h = (w * ow) / targetRatio / oh;
  } else {
    h = 0.92;
    w = (h * oh * targetRatio) / ow;
  }

  w = Math.min(1, Math.max(0.1, w));
  h = Math.min(1, Math.max(0.1, h));

  cropBox.value = {
    x: (1 - w) / 2,
    y: (1 - h) / 2,
    width: w,
    height: h
  };
}

// ── Update Displayed Image Rect for Coordinate Mapping ──
function updateDisplayedGeometry() {
  if (!displayedImageRef.value || !stageWrapperRef.value) return;
  const rect = displayedImageRef.value.getBoundingClientRect();
  const wrapperRect = stageWrapperRef.value.getBoundingClientRect();
  displayedRect.value = {
    left: rect.left - wrapperRect.left,
    top: rect.top - wrapperRect.top,
    width: rect.width,
    height: rect.height
  };
}

// ── Rotate & Flip ──
function rotateClockwise() {
  soundEngine.playClick();
  rotation.value = (rotation.value + 90) % 360;
  resetCropBox();
  nextTick(updateDisplayedGeometry);
}

function toggleFlipHorizontal() {
  soundEngine.playClick();
  flipH.value = !flipH.value;
}

function resetAll() {
  soundEngine.playClick();
  rotation.value = 0;
  flipH.value = false;
  selectedRatio.value = 'free';
  resetCropBox();
  nextTick(updateDisplayedGeometry);
}

function handleRatioSelect(ratioId) {
  soundEngine.playClick();
  selectedRatio.value = ratioId;
  resetCropBox();
}

// ── Crop Box Dragging & Resizing ──
let dragAction = null; // 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w'
let dragStartMouse = { x: 0, y: 0 };
let dragStartBox = { x: 0, y: 0, width: 1, height: 1 };

function startDrag(action, e) {
  e.preventDefault();
  e.stopPropagation();
  dragAction = action;
  dragStartMouse = { x: e.clientX, y: e.clientY };
  dragStartBox = { ...cropBox.value };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
  if (!dragAction || !displayedRect.value.width || !displayedRect.value.height) return;

  const dx = (e.clientX - dragStartMouse.x) / displayedRect.value.width;
  const dy = (e.clientY - dragStartMouse.y) / displayedRect.value.height;
  const ratio = activeRatioObj.value.ratio;
  const ow = orientedDimensions.value.width;
  const oh = orientedDimensions.value.height;
  const aspectMultiplier = ow / oh;

  let { x, y, width, height } = { ...dragStartBox };

  if (dragAction === 'move') {
    x = Math.max(0, Math.min(1 - width, dragStartBox.x + dx));
    y = Math.max(0, Math.min(1 - height, dragStartBox.y + dy));
  } else {
    // Handle edge and corner resizing
    if (dragAction.includes('e')) {
      width = Math.max(0.08, Math.min(1 - dragStartBox.x, dragStartBox.width + dx));
      if (ratio) height = Math.max(0.08, (width * aspectMultiplier) / ratio);
    }
    if (dragAction.includes('s')) {
      height = Math.max(0.08, Math.min(1 - dragStartBox.y, dragStartBox.height + dy));
      if (ratio) width = Math.max(0.08, (height * ratio) / aspectMultiplier);
    }
    if (dragAction.includes('w')) {
      const maxW = dragStartBox.x + dragStartBox.width;
      const targetW = Math.max(0.08, Math.min(maxW, dragStartBox.width - dx));
      x = maxW - targetW;
      width = targetW;
      if (ratio) height = Math.max(0.08, (width * aspectMultiplier) / ratio);
    }
    if (dragAction.includes('n')) {
      const maxH = dragStartBox.y + dragStartBox.height;
      const targetH = Math.max(0.08, Math.min(maxH, dragStartBox.height - dy));
      y = maxH - targetH;
      height = targetH;
      if (ratio) width = Math.max(0.08, (height * ratio) / aspectMultiplier);
    }

    // Boundary constraints
    if (x + width > 1) width = 1 - x;
    if (y + height > 1) height = 1 - y;
  }

  cropBox.value = { x, y, width, height };
}

function onMouseUp() {
  dragAction = null;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

// ── Export Canvas Generation ──
function getRenderedCanvas() {
  if (!imageElement.value) return null;
  const ow = orientedDimensions.value.width;
  const oh = orientedDimensions.value.height;

  const naturalCropBox = {
    x: Math.round(cropBox.value.x * ow),
    y: Math.round(cropBox.value.y * oh),
    width: Math.round(cropBox.value.width * ow),
    height: Math.round(cropBox.value.height * oh)
  };

  return cropImageToCanvas(imageElement.value, naturalCropBox, {
    rotation: rotation.value,
    flipH: flipH.value
  });
}

// ── Action Handlers ──
async function handleCopy() {
  const canvas = getRenderedCanvas();
  if (!canvas) return;
  isExporting.value = true;
  try {
    const blob = await canvasToBlob(canvas);
    await writeImageBlobToClipboard(blob);
    soundEngine.playChime();
    emit('toast', '已成功复制裁剪图片到剪贴板！');
  } catch (err) {
    console.error('[Cropper] Copy failed:', err);
    emit('toast', '复制失败，请尝试直接下载保存');
  } finally {
    isExporting.value = false;
  }
}

function handleDownload() {
  const canvas = getRenderedCanvas();
  if (!canvas) return;
  soundEngine.playChime();
  const filename = `cropped-${Date.now()}.png`;
  downloadCanvas(canvas, filename);
  emit('toast', `裁剪图片已下载为 ${filename}`);
}

async function handleReplaceOriginal() {
  const canvas = getRenderedCanvas();
  if (!canvas) return;
  isUploading.value = true;
  try {
    const blob = await canvasToBlob(canvas);
    let finalUrl = '';

    if (isStorageEnabled()) {
      const file = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
      finalUrl = await uploadToOSS(file);
    } else {
      finalUrl = canvas.toDataURL('image/png', 0.96);
    }

    soundEngine.playChime();
    emit('replace', {
      originalUrl: props.imageUrl,
      newUrl: finalUrl,
      alt: props.altText || '裁剪图片'
    });
    emit('toast', '已成功替换正文中的原图！');
    emit('close');
  } catch (err) {
    console.error('[Cropper] Replace failed:', err);
    emit('toast', '替换图片失败: ' + err.message);
  } finally {
    isUploading.value = false;
  }
}

async function handleInsertNew() {
  const canvas = getRenderedCanvas();
  if (!canvas) return;
  isUploading.value = true;
  try {
    const blob = await canvasToBlob(canvas);
    let finalUrl = '';

    if (isStorageEnabled()) {
      const file = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
      finalUrl = await uploadToOSS(file);
    } else {
      finalUrl = canvas.toDataURL('image/png', 0.96);
    }

    const mdSnippet = `![${props.altText || '裁剪图片'}](${finalUrl})`;
    soundEngine.playChime();
    emit('insert', {
      newUrl: finalUrl,
      markdownSnippet: mdSnippet
    });
    emit('toast', '已将裁剪图片插入当前文档');
    emit('close');
  } catch (err) {
    console.error('[Cropper] Insert failed:', err);
    emit('toast', '插入图片失败: ' + err.message);
  } finally {
    isUploading.value = false;
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
}

// ── Watchers & Lifecycle ──
watch(() => props.isOpen, (open) => {
  if (open) {
    rotation.value = 0;
    flipH.value = false;
    selectedRatio.value = 'free';
    initImage(props.imageUrl);
  }
});

watch(() => props.imageUrl, (newUrl) => {
  if (props.isOpen && newUrl) {
    initImage(newUrl);
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', updateDisplayedGeometry);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', updateDisplayedGeometry);
  onMouseUp();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="cropper-modal-fade">
      <div v-if="isOpen" class="cropper-backdrop" @click.self="$emit('close')">
        <div class="cropper-modal-container">
          <!-- ── Header ── -->
          <div class="cropper-header">
            <div class="header-left">
              <div class="header-icon-box">
                <Crop size="19" class="header-icon" />
              </div>
              <div class="header-title-box">
                <div class="header-title">
                  <span>图片精细裁剪与微调</span>
                  <span class="header-badge">{{ cropPixelDimensions.width }} × {{ cropPixelDimensions.height }} px</span>
                </div>
                <div class="header-subtitle">
                  支持自由框选或标准长宽比，可拖拽四角精确取景，支持原地替换文档原图
                </div>
              </div>
            </div>
            <button class="btn-close" @click="$emit('close')" aria-label="关闭裁剪窗口">
              <X size="18" />
            </button>
          </div>

          <!-- ── Toolbar Controls ── -->
          <div class="cropper-toolbar">
            <!-- Ratio Presets -->
            <div class="ratio-pills">
              <button
                v-for="r in CROP_RATIO_PRESETS"
                :key="r.id"
                class="ratio-pill-btn"
                :class="{ 'is-active': selectedRatio === r.id }"
                @click="handleRatioSelect(r.id)"
              >
                {{ r.label }}
              </button>
            </div>

            <span class="toolbar-sep"></span>

            <!-- Rotation & Flip Actions -->
            <div class="transform-actions">
              <button class="btn-transform" @click="rotateClockwise" title="顺时针旋转 90°">
                <RotateCw size="14" />
                <span>旋转 90°</span>
              </button>
              <button class="btn-transform" :class="{ 'is-active': flipH }" @click="toggleFlipHorizontal" title="水平翻转">
                <FlipHorizontal size="14" />
                <span>水平翻转</span>
              </button>
              <button class="btn-transform" @click="resetAll" title="重置全部变换与裁剪框">
                <RotateCcw size="14" />
                <span>重置</span>
              </button>
            </div>
          </div>

          <!-- ── Interactive Cropping Stage ── -->
          <div class="cropper-stage" ref="stageWrapperRef">
            <div v-if="!imageLoaded && !imageLoadError" class="cropper-loading">
              <div class="loading-spinner"></div>
              <span>正在加载原始图片...</span>
            </div>

            <div v-else-if="imageLoadError" class="cropper-error">
              <span>图片无法加载或受跨域保护，请尝试下载原图后上传</span>
            </div>

            <div v-else class="stage-image-container">
              <!-- Oriented Image Display -->
              <img
                ref="displayedImageRef"
                :src="imageUrl"
                alt="裁剪预览"
                class="stage-img"
                :style="{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  maxHeight: rotation % 180 === 90 ? 'min(440px, 55vh)' : 'min(480px, 60vh)',
                  maxWidth: rotation % 180 === 90 ? 'min(480px, 60vh)' : 'min(760px, 70vw)'
                }"
                @load="nextTick(updateDisplayedGeometry)"
              />

              <!-- Overlay Mask & Crop Box -->
              <div
                v-if="displayedRect.width > 0"
                class="crop-overlay-layer"
                :style="{
                  left: `${displayedRect.left}px`,
                  top: `${displayedRect.top}px`,
                  width: `${displayedRect.width}px`,
                  height: `${displayedRect.height}px`
                }"
              >
                <!-- Darkened Surroundings -->
                <div class="mask-box mask-top" :style="{ height: `${cropBox.y * 100}%` }"></div>
                <div
                  class="mask-box mask-bottom"
                  :style="{ top: `${(cropBox.y + cropBox.height) * 100}%`, height: `${(1 - (cropBox.y + cropBox.height)) * 100}%` }"
                ></div>
                <div
                  class="mask-box mask-left"
                  :style="{
                    top: `${cropBox.y * 100}%`,
                    height: `${cropBox.height * 100}%`,
                    width: `${cropBox.x * 100}%`
                  }"
                ></div>
                <div
                  class="mask-box mask-right"
                  :style="{
                    top: `${cropBox.y * 100}%`,
                    height: `${cropBox.height * 100}%`,
                    left: `${(cropBox.x + cropBox.width) * 100}%`,
                    width: `${(1 - (cropBox.x + cropBox.width)) * 100}%`
                  }"
                ></div>

                <!-- Active Crop Box (Draggable) -->
                <div
                  class="interactive-crop-box"
                  :style="{
                    left: `${cropBox.x * 100}%`,
                    top: `${cropBox.y * 100}%`,
                    width: `${cropBox.width * 100}%`,
                    height: `${cropBox.height * 100}%`
                  }"
                  @mousedown="startDrag('move', $event)"
                >
                  <!-- Rule of Thirds Grid Lines -->
                  <div class="grid-line line-h1"></div>
                  <div class="grid-line line-h2"></div>
                  <div class="grid-line line-v1"></div>
                  <div class="grid-line line-v2"></div>

                  <!-- 8 Anchor Drag Handles -->
                  <div class="crop-handle handle-nw" @mousedown="startDrag('nw', $event)"></div>
                  <div class="crop-handle handle-n" @mousedown="startDrag('n', $event)"></div>
                  <div class="crop-handle handle-ne" @mousedown="startDrag('ne', $event)"></div>
                  <div class="crop-handle handle-e" @mousedown="startDrag('e', $event)"></div>
                  <div class="crop-handle handle-se" @mousedown="startDrag('se', $event)"></div>
                  <div class="crop-handle handle-s" @mousedown="startDrag('s', $event)"></div>
                  <div class="crop-handle handle-sw" @mousedown="startDrag('sw', $event)"></div>
                  <div class="crop-handle handle-w" @mousedown="startDrag('w', $event)"></div>

                  <!-- Floating Size Tooltip Badge -->
                  <div class="crop-size-badge">
                    {{ cropPixelDimensions.width }} × {{ cropPixelDimensions.height }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Footer Action Bar ── -->
          <div class="cropper-footer">
            <div class="footer-meta">
              <span class="meta-label">原图尺寸:</span>
              <span class="meta-val">{{ naturalWidth }} × {{ naturalHeight }} px</span>
              <span class="meta-sep">/</span>
              <span class="meta-label">裁剪后:</span>
              <span class="meta-val is-highlight">{{ cropPixelDimensions.width }} × {{ cropPixelDimensions.height }} px</span>
            </div>

            <div class="footer-actions">
              <button class="btn-footer-secondary" @click="handleDownload" title="保存裁剪后的高清 PNG 到本地">
                <Download size="14" />
                <span>下载图片</span>
              </button>

              <button class="btn-footer-secondary" :disabled="isExporting" @click="handleCopy" title="直接复制到剪贴板，支持在富文本中粘贴">
                <Copy size="14" />
                <span>{{ isExporting ? '处理中...' : '复制剪贴板' }}</span>
              </button>

              <button class="btn-footer-secondary" :disabled="isUploading" @click="handleInsertNew" title="作为一张全新图片插入到文档当前光标处">
                <Plus size="14" />
                <span>作为新图插入</span>
              </button>

              <button
                v-if="canReplace"
                class="btn-footer-primary"
                :disabled="isUploading"
                @click="handleReplaceOriginal"
                title="在当前文档中直接替换此图片链接，文章立即更新"
              >
                <Sparkles size="14.5" />
                <span>{{ isUploading ? '正在上传云端...' : '替换正文原图' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cropper-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.cropper-modal-container {
  width: min(1040px, 94vw);
  height: min(760px, 92vh);
  background: var(--bg-card, #FFFFFF);
  border-radius: 16px;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-color, #E2E8F0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.cropper-header {
  height: 60px;
  padding: 0 20px;
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
}

.header-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--brand-subtle, #EFF6FF);
  color: var(--brand-primary, #116ACC);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title-box {
  display: flex;
  flex-direction: column;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--text-main, #0F172A);
}

.header-badge {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 1px 7px;
  border-radius: 999px;
  background: #DBEAFE;
  color: #1E40AF;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-muted, #64748B);
  margin-top: 1px;
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

/* ── Toolbar ── */
.cropper-toolbar {
  height: 48px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle, #EDF1F7);
  background: var(--bg-sidebar, #F8FAFC);
  flex-shrink: 0;
}

.ratio-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
}

.ratio-pill-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted, #64748B);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.ratio-pill-btn:hover {
  background: rgba(15, 23, 42, 0.05);
  color: var(--text-main, #0F172A);
}

.ratio-pill-btn.is-active {
  background: var(--bg-card, #FFFFFF);
  border-color: var(--brand-primary, #116ACC);
  color: var(--brand-primary, #116ACC);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--border-color, #E2E8F0);
  margin: 0 8px;
}

.transform-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-transform {
  height: 28px;
  padding: 0 9px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #E2E8F0);
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #0F172A);
  font-size: 11.5px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-transform:hover {
  border-color: var(--brand-primary, #116ACC);
  color: var(--brand-primary, #116ACC);
}

.btn-transform.is-active {
  background: var(--brand-subtle, #EFF6FF);
  border-color: var(--brand-primary, #116ACC);
  color: var(--brand-primary, #116ACC);
}

/* ── Cropper Stage ── */
.cropper-stage {
  flex: 1;
  background: #0B0F17;
  background-image:
    radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 0%, transparent 85%),
    linear-gradient(#1E293B 1px, transparent 1px),
    linear-gradient(90deg, #1E293B 1px, transparent 1px);
  background-size: 100% 100%, 20px 20px, 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.stage-image-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.stage-img {
  display: block;
  object-fit: contain;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

/* ── Overlay & Crop Box ── */
.crop-overlay-layer {
  position: absolute;
  overflow: hidden;
  pointer-events: none;
}

.mask-box {
  position: absolute;
  background: rgba(0, 0, 0, 0.62);
  pointer-events: none;
}
.mask-top { top: 0; left: 0; width: 100%; }
.mask-bottom { left: 0; width: 100%; }
.mask-left { left: 0; }
.mask-right { }

.interactive-crop-box {
  position: absolute;
  box-sizing: border-box;
  border: 1.5px solid #3B82F6;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 20px rgba(59, 130, 246, 0.35);
  cursor: move;
  pointer-events: auto;
}

/* Rule of Thirds Grid Lines */
.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}
.line-h1 { top: 33.33%; left: 0; width: 100%; height: 1px; }
.line-h2 { top: 66.66%; left: 0; width: 100%; height: 1px; }
.line-v1 { left: 33.33%; top: 0; width: 1px; height: 100%; }
.line-v2 { left: 66.66%; top: 0; width: 1px; height: 100%; }

/* 8 Resize Handles */
.crop-handle {
  position: absolute;
  box-sizing: border-box;
  background: #FFFFFF;
  border: 2px solid #2563EB;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.handle-nw { top: -6px; left: -6px; width: 12px; height: 12px; cursor: nwse-resize; }
.handle-ne { top: -6px; right: -6px; width: 12px; height: 12px; cursor: nesw-resize; }
.handle-se { bottom: -6px; right: -6px; width: 12px; height: 12px; cursor: nwse-resize; }
.handle-sw { bottom: -6px; left: -6px; width: 12px; height: 12px; cursor: nesw-resize; }

.handle-n { top: -4px; left: calc(50% - 10px); width: 20px; height: 8px; border-radius: 4px; cursor: ns-resize; }
.handle-s { bottom: -4px; left: calc(50% - 10px); width: 20px; height: 8px; border-radius: 4px; cursor: ns-resize; }
.handle-w { left: -4px; top: calc(50% - 10px); width: 8px; height: 20px; border-radius: 4px; cursor: ew-resize; }
.handle-e { right: -4px; top: calc(50% - 10px); width: 8px; height: 20px; border-radius: 4px; cursor: ew-resize; }

.crop-size-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.85);
  color: #FFFFFF;
  font-size: 10.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.cropper-loading, .cropper-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #94A3B8;
  font-size: 13px;
}
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer ── */
.cropper-footer {
  height: 56px;
  padding: 0 20px;
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
  gap: 6px;
  font-size: 12px;
}
.meta-label { color: var(--text-muted, #64748B); }
.meta-val {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-main, #0F172A);
}
.meta-val.is-highlight { color: var(--brand-primary, #116ACC); }
.meta-sep { color: var(--border-color, #CBD5E1); margin: 0 2px; }

.footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-footer-secondary {
  height: 36px;
  padding: 0 13px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  border: 1px solid var(--border-color, #CBD5E1);
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #0F172A);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-footer-secondary:hover {
  background: var(--bg-sidebar, #F8FAFC);
  border-color: var(--text-muted, #94A3B8);
}

.btn-footer-primary {
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  background: var(--brand-primary, #116ACC);
  color: #FFFFFF;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(17, 106, 204, 0.28);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-footer-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-footer-primary:disabled, .btn-footer-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ── Transitions & Dark Mode ── */
.cropper-modal-fade-enter-active,
.cropper-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cropper-modal-fade-enter-from,
.cropper-modal-fade-leave-to {
  opacity: 0;
}

html.dark .cropper-modal-container {
  background: #111827;
  border-color: #374151;
}

html.dark .cropper-header,
html.dark .cropper-toolbar,
html.dark .cropper-footer {
  background: #111827;
  border-color: #1F2937;
}

html.dark .ratio-pill-btn.is-active,
html.dark .btn-transform,
html.dark .btn-footer-secondary {
  background: #1F2937;
  border-color: #374151;
  color: #F9FAFB;
}
</style>

