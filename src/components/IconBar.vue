<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
/* P1-1: 图标语义修正（均已核对 @lucide/vue 存在）。
   Files → FileText（文档列表是单文档/写作为主）、Palette → LayoutTemplate
   （模板是版式不是调色板）、Boxes → Image（素材以图片为主）、
   CircleHelp → Rocket：该按钮实际触发 toggle-tab('launch')，打开的是
   启动台分发弹窗（App.vue:2177），不是帮助文档。 */
import { House, FileText, LayoutTemplate, Image, Settings, Rocket } from '@lucide/vue';
import BrandLogo from './BrandLogo.vue';

const props = defineProps({
  sidebarVisible: { type: Boolean, default: true },
  currentView: { type: String, default: 'editor' },
  // P1-1: 设置 / 启动台打开期间，滑块与激活态停在对应按钮上。
  settingsOpen: { type: Boolean, default: false },
  launchpadOpen: { type: Boolean, default: false }
});

defineEmits(['toggle-tab']);

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const helpShortcut = isMac ? '⌘/' : 'Ctrl+/';

// ── DOM References for Liquid Glider ──
const iconBarRef = ref(null);
const gliderRef = ref(null);
const brandBtnRef = ref(null);
const homeBtnRef = ref(null);
const docsBtnRef = ref(null);
const templatesBtnRef = ref(null);
const materialsBtnRef = ref(null);
const settingsBtnRef = ref(null);
const helpBtnRef = ref(null);

const GLIDE_DURATION = 380; // ms
let gliderRaf = 0;
let gliderRetractRaf = 0;
let gliderObserver = null;

/**
 * 液体滑块移动核心算法 (Muse Glider Motion)
 * 全栏仅保留唯一一块高亮层，通过 transform 滑动，带 380ms 弹性曲线与物理过冲。
 * 距离越远，纵向液体拉伸越明显 (scaleY)，落位后弹性回缩。
 *
 * P0-5: 原来每次 hover 都同步读两次 getBoundingClientRect 再写
 * style.width/height/transform，且拉伸回缩用单个全局 setTimeout，
 * 快速划过多个图标时会 clearTimeout 导致滑块卡在拉伸态。
 * 现在：① 读写合并进同一帧 rAF；② 滑块固定 38×38（所有按钮都
 * 是 38px），不再写 width/height，也不再过渡它们，只用 transform；
 * ③ 回缩用 rAF 时间戳循环，不再用单一定时器；④ ResizeObserver +
 * resize 监听，窗口缩放/字体加载后重定位。
 */
function applyGliderTransform(left, top, stretchY) {
  if (!gliderRef.value) return;
  gliderRef.value.style.transform = `translate(${left}px, ${top}px) scaleY(${stretchY})`;
  gliderRef.value.classList.add('is-visible');
}

function moveGliderToEl(btn, stretch = true) {
  if (!btn || !gliderRef.value || !iconBarRef.value) return;
  cancelAnimationFrame(gliderRaf);
  cancelAnimationFrame(gliderRetractRaf);
  gliderRaf = requestAnimationFrame(() => {
    if (!btn || !gliderRef.value || !iconBarRef.value) return;
    const barRect = iconBarRef.value.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const top = btnRect.top - barRect.top;
    const left = btnRect.left - barRect.left;

    const prevY = parseFloat(gliderRef.value.dataset.y || String(top));
    const dist = Math.abs(top - prevY);
    gliderRef.value.dataset.y = String(top);

    // 纵向物理拉伸计算（上限 1.16 倍）
    const stretchY = stretch ? 1 + Math.min(dist / 650, 0.16) : 1;
    applyGliderTransform(left, top, stretchY);

    if (stretchY > 1.01) {
      const start = performance.now();
      const tick = (now) => {
        if (!gliderRef.value) return;
        if (now - start >= GLIDE_DURATION * 0.55) {
          applyGliderTransform(left, top, 1);
          return;
        }
        gliderRetractRaf = requestAnimationFrame(tick);
      };
      gliderRetractRaf = requestAnimationFrame(tick);
    }
  });
}

function repositionGlider() {
  const activeBtn = getActiveButtonEl();
  if (activeBtn) {
    moveGliderToEl(activeBtn, false);
  } else if (gliderRef.value) {
    gliderRef.value.classList.remove('is-visible');
  }
}

function getActiveButtonEl() {
  if (!iconBarRef.value) return null;
  // P1-1: 设置 / 启动台是瞬时操作，原来没有 is-active 态，鼠标移开
  // 滑块直接消失；现在打开期间算作激活态。
  if (props.settingsOpen) return settingsBtnRef.value;
  if (props.launchpadOpen) return helpBtnRef.value;
  if (props.currentView === 'home') return homeBtnRef.value;
  if (props.currentView === 'editor' && props.sidebarVisible) return docsBtnRef.value;
  if (props.currentView === 'templates') return templatesBtnRef.value;
  if (props.currentView === 'materials') return materialsBtnRef.value;
  return null;
}

function handleBarMouseLeave() {
  const activeBtn = getActiveButtonEl();
  if (activeBtn) {
    moveGliderToEl(activeBtn, true);
  } else {
    if (gliderRef.value) {
      gliderRef.value.classList.remove('is-visible');
    }
  }
}

function onButtonHover(e) {
  const target = e.currentTarget;
  if (target) {
    moveGliderToEl(target, true);
  }
}

watch([() => props.currentView, () => props.sidebarVisible, () => props.settingsOpen, () => props.launchpadOpen], async () => {
  await nextTick();
  const activeBtn = getActiveButtonEl();
  if (activeBtn) {
    moveGliderToEl(activeBtn, true);
  } else if (gliderRef.value) {
    gliderRef.value.classList.remove('is-visible');
  }
});

onMounted(() => {
  nextTick(() => {
    const activeBtn = getActiveButtonEl();
    if (activeBtn) {
      moveGliderToEl(activeBtn, false);
    }
  });
  // P0-5: 窗口缩放、字体加载、栏宽变化后滑块重定位。
  // 原来全文件没有任何 resize 监听，滑块会停在旧位置直到下次 hover。
  if (typeof ResizeObserver !== 'undefined' && iconBarRef.value) {
    gliderObserver = new ResizeObserver(() => repositionGlider());
    gliderObserver.observe(iconBarRef.value);
  }
  window.addEventListener('resize', repositionGlider);
});

onUnmounted(() => {
  cancelAnimationFrame(gliderRaf);
  cancelAnimationFrame(gliderRetractRaf);
  gliderObserver?.disconnect();
  gliderObserver = null;
  window.removeEventListener('resize', repositionGlider);
});
</script>

<template>
  <nav
    class="icon-bar select-none"
    ref="iconBarRef"
    data-no-tooltip
    @mouseleave="handleBarMouseLeave"
  >
    <!-- ★ 液体滑块：全栏唯一高亮，在图标之间流畅穿梭与拉伸 ★ -->
    <span class="nav-glider" ref="gliderRef" aria-hidden="true"></span>

    <!-- Top Main Navigation Group -->
    <div class="icon-bar-top">
      <!-- 0. Brand Logo -->
      <div
        ref="brandBtnRef"
        class="icon-bar-brand nav-target"
        data-key="brand"
        @click="$emit('toggle-tab', 'home')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        role="button"
        tabindex="0"
        aria-label="墨滴 NiceMD"
      >
        <div class="brand-inner">
          <BrandLogo :size="26" />
        </div>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">墨滴 NiceMD</span>
        </div>
      </div>

      <span class="icon-bar-divider"></span>

      <!-- 1. 官方首页 -->
      <button
        ref="homeBtnRef"
        class="icon-btn nav-target"
        data-key="home"
        :class="{ 'is-active': currentView === 'home' }"
        @click="$emit('toggle-tab', 'home')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        aria-label="官方首页"
      >
        <span class="nav-glyph ic-house">
          <!-- P1-1: stroke-width 统一 2，激活态只改颜色不改粗细，避免描边跳变。 -->
          <House size="20" stroke-width="2" />
        </span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">官方首页</span>
        </div>
      </button>

      <!-- 2. 我的文档 -->
      <button
        ref="docsBtnRef"
        class="icon-btn nav-target"
        data-key="docs"
        :class="{ 'is-active': currentView === 'editor' && sidebarVisible }"
        @click="$emit('toggle-tab', 'docs')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        aria-label="我的文档"
      >
        <span class="nav-glyph ic-files">
          <FileText size="20" stroke-width="2" />
        </span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">我的文档</span>
          <span class="nav-tooltip-shortcut">{{ currentView === 'editor' && sidebarVisible ? '点击收起' : '点击展开' }}</span>
        </div>
      </button>

      <!-- 3. 模板中心 -->
      <button
        ref="templatesBtnRef"
        class="icon-btn nav-target"
        data-key="templates"
        :class="{ 'is-active': currentView === 'templates' }"
        @click="$emit('toggle-tab', 'templates')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        aria-label="模板中心"
      >
        <span class="nav-glyph ic-palette">
          <LayoutTemplate size="20" stroke-width="2" />
        </span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">模板中心</span>
        </div>
      </button>

      <!-- 4. 素材中心 -->
      <button
        ref="materialsBtnRef"
        class="icon-btn nav-target"
        data-key="materials"
        :class="{ 'is-active': currentView === 'materials' }"
        @click="$emit('toggle-tab', 'materials')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        aria-label="素材中心"
      >
        <span class="nav-glyph ic-boxes">
          <Image size="20" stroke-width="2" />
        </span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">素材中心</span>
        </div>
      </button>
    </div>

    <!-- Bottom Utility & Settings Group -->
    <div class="icon-bar-bottom">
      <span class="icon-bar-divider"></span>

      <!-- 5. 偏好设置 -->
      <button
        ref="settingsBtnRef"
        class="icon-btn nav-target"
        data-key="settings"
        :class="{ 'is-active': settingsOpen }"
        @click="$emit('toggle-tab', 'settings')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        aria-label="偏好设置"
      >
        <span class="nav-glyph ic-settings">
          <Settings size="20" stroke-width="2" />
        </span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">偏好设置</span>
        </div>
      </button>

      <!-- 6. 启动台：实际打开多渠道分发启动台（LaunchpadModal），
           不是帮助文档，所以图标用 Rocket，文案同步改掉。 -->
      <button
        ref="helpBtnRef"
        class="icon-btn icon-btn-subtle nav-target"
        data-key="help"
        :class="{ 'is-active': launchpadOpen }"
        @click="$emit('toggle-tab', 'launch')"
        @mouseenter="onButtonHover"
        @focus="onButtonHover"
        data-no-tooltip
        aria-label="启动台"
      >
        <span class="nav-glyph ic-help">
          <Rocket size="20" stroke-width="2" />
        </span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">启动台</span>
          <span class="nav-tooltip-shortcut">{{ helpShortcut }}</span>
        </div>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.icon-bar {
  width: 54px;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-card, #FFFFFF);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 14px;
  z-index: 100;
  box-sizing: border-box;
  border-right: 1px solid var(--border-subtle, #EDEDF0);
  transition: background 0.2s var(--ease-glide), border-color 0.2s var(--ease-glide);
  position: relative;
}

html.dark .icon-bar {
  background: var(--bg-rail, #18181B);
  border-right-color: var(--border-subtle, #27272A);
}

.icon-bar-top,
.icon-bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  position: relative;
  z-index: 2;
}

/* ── ★ 液体滑块 (Liquid Glider) ── */
.nav-glider {
  position: absolute;
  top: 0;
  left: 0;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #ECEFF2;
  opacity: 0;
  pointer-events: none;
  z-index: 1; /* 处于按钮下方，背景之上 */
  /* P0-5: 只过渡 transform + opacity。原来 width/height/border-radius
     也参与过渡，且 JS 每 hover 一次就写 width/height，布局属性与
     380ms 的 transform 不同步。所有按钮都是 38×38，滑块尺寸固定即可。 */
  transition: transform 380ms var(--ease-glide),
              opacity 0.2s var(--ease-out);
  will-change: transform;
}

.nav-glider.is-visible {
  opacity: 1;
}

html.dark .nav-glider {
  background: rgba(255, 255, 255, 0.12);
}

/* ── Brand Logo Item ── */
.icon-bar-brand {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  outline: none;
  z-index: 2;
  transition: transform 0.12s var(--ease-glide);
  -webkit-tap-highlight-color: transparent;
}

.icon-bar-brand:active {
  transform: scale(0.93);
}

.brand-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

/* Logo 果冻弹动微交互 */
@keyframes brandSquash {
  0% { transform: scale(1, 1); }
  30% { transform: scale(1.12, 0.88); }
  55% { transform: scale(0.94, 1.06); }
  75% { transform: scale(1.03, 0.98); }
  100% { transform: scale(1, 1); }
}

.icon-bar-brand:hover .brand-inner {
  animation: brandSquash 0.55s var(--ease-out);
}

/* ── Divider ── */
.icon-bar-divider {
  width: 22px;
  height: 1px;
  background: var(--border-color, #E2E8F0);
  margin: 2px 0;
  opacity: 0.8;
  border-radius: 1px;
}

html.dark .icon-bar-divider {
  background: rgba(255, 255, 255, 0.12);
}

/* ── Nav Icon Buttons ── */
.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none !important;
  background: transparent !important; /* 由底部的 nav-glider 统一供给背景高亮 */
  box-shadow: none !important;
  color: var(--text-muted, #555770);
  cursor: pointer;
  border-radius: 50% !important;
  padding: 0;
  outline: none !important;
  z-index: 2;
  transition: color 0.2s var(--ease-glide), transform 0.12s var(--ease-glide);
  -webkit-tap-highlight-color: transparent;
}

.icon-btn:hover,
.icon-btn:focus,
.icon-btn:focus-visible {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  color: var(--text-main, #0F172A);
}

html.dark .icon-btn {
  color: var(--text-muted, #9CA3AF);
}

html.dark .icon-btn:hover,
html.dark .icon-btn:focus,
html.dark .icon-btn:focus-visible {
  color: #FFFFFF;
}

/* 按下回弹 (Press Feedback matching demo) */
.icon-btn:active {
  transform: scale(0.93);
}

.icon-btn.is-active {
  color: var(--text-main, #0F172A);
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

html.dark .icon-btn.is-active {
  color: #FFFFFF;
}

.icon-btn-subtle {
  color: var(--text-subtle, #71717A);
}

/* ── 图标内部专属微动效 (Icon Micro-motions) ── */
.nav-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  border-radius: 50% !important;
  will-change: transform;
}

/* 1. 首页 (House) - 屋顶轻微弹跳 */
@keyframes houseBounce {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  30% { transform: translateY(-3.2px) scale(0.94, 1.08); }
  60% { transform: translateY(1px) scale(1.06, 0.94); }
  80% { transform: translateY(-0.8px) scale(1, 1); }
}

.icon-btn:hover .ic-house {
  animation: houseBounce 0.6s var(--ease-out);
}

/* 2. 文档 (FileText) - 书页 3D 翻动效果 */
@keyframes docPageFlip {
  0% { transform: perspective(120px) rotateY(0deg); }
  40% { transform: perspective(120px) rotateY(-32deg) skewY(-4deg); }
  70% { transform: perspective(120px) rotateY(10deg); }
  100% { transform: perspective(120px) rotateY(0deg); }
}

.icon-btn:hover .ic-files {
  animation: docPageFlip 0.7s var(--ease-out);
  transform-origin: left center;
}

/* 3. 模板中心 (LayoutTemplate) - 版式摇摆与微晃 */
@keyframes paletteSwing {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-14deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}

.icon-btn:hover .ic-palette {
  animation: paletteSwing 0.75s ease-in-out;
  transform-origin: 50% 15%;
}

/* 4. 素材中心 (Image) - 依次蹦跳 (Hop) */
@keyframes boxHop {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  30% { transform: translateY(-3.5px) scale(0.92, 1.08); }
  55% { transform: translateY(0) scale(1.08, 0.9); }
  75% { transform: translateY(-1.2px) scale(1, 1); }
}

.icon-btn:hover .ic-boxes {
  animation: boxHop 0.65s var(--ease-out);
}

/* 5. 偏好设置 (Settings) - 齿轮 90° 弹簧旋转 */
.ic-settings {
  transition: transform 0.5s var(--ease-spring);
  transform-origin: center;
}

.icon-btn:hover .ic-settings {
  transform: rotate(90deg);
}

/* 6. 启动台 (Rocket) - 微弹动 */
@keyframes helpHop {
  0%, 100% { transform: rotate(0deg) scale(1); }
  30% { transform: rotate(-14deg) scale(1.18); }
  60% { transform: rotate(9deg) scale(1.04); }
  80% { transform: rotate(-3deg) scale(1.08); }
}

.icon-btn:hover .ic-help {
  animation: helpHop 0.6s var(--ease-out);
  transform-origin: center;
}

/* ── ★ Tooltip 弹簧弹出 (Spring Tooltip) ── */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%) translateX(-8px) scale(0.92);
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #1F2937);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.35;
  padding: 8px 13px;
  border-radius: 9px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border-subtle, #EDEDF0);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s var(--ease-glide) 60ms, transform 0.3s var(--ease-spring) 60ms;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-target:hover .nav-tooltip,
.nav-target:focus-visible .nav-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}

html.dark .nav-tooltip {
  background: #242429;
  border-color: rgba(255, 255, 255, 0.12);
  color: #F3F4F6;
  box-shadow: 0 8px 24px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3);
}

.nav-tooltip-label {
  font-weight: 500;
}

.nav-tooltip-shortcut {
  font-family: var(--font-mono, monospace);
  font-size: 11.5px;
  font-weight: 400;
  color: #6B7280;
  letter-spacing: -0.2px;
}

html.dark .nav-tooltip-shortcut {
  color: #9CA3AF;
}

@media (prefers-reduced-motion: reduce) {
  .nav-glider {
    transition: opacity 0.01ms !important;
  }
  .nav-glyph,
  .brand-inner {
    animation: none !important;
    transition: none !important;
  }
}
</style>
