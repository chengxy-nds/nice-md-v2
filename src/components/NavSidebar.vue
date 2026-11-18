<!-- 左侧导航栏：只有窄图标列，不再有宽栏。
     顶部是放大的 logo（BrandLogo 32px），点一下回首页。
     滑过有效果：灰色圆片跟右侧栏一样，只在滑过时出现，
     滑到哪个图标就到哪个图标后面，鼠标离开就消失；每个图标
     本身还有自己的微动效（跟右侧栏的图标微动效一个做法），
     每个图标滑过还出文字提示。 -->
<template>
  <div class="nav-sidebar" ref="railRef" @mouseleave="handleRailMouseLeave">
    <div ref="gliderRef" class="nav-glider"></div>

    <!-- Brand Logo：放大到 32px，点一下回首页 -->
    <div
      class="nav-brand nav-target"
      data-key="brand"
      @click="emit('go-home')"
      @mouseenter="onButtonHover"
      @focus="onButtonHover"
      role="button"
      tabindex="0"
      aria-label="EasyMD"
    >
      <div class="brand-inner">
        <BrandLogo :size="32" />
      </div>
    </div>

    <span class="nav-divider"></span>

    <div class="nav-rail">
      <button
        type="button" class="nav-rail-btn nav-target" data-key="home"
        :class="{ 'is-active': currentView === 'home' }"
        aria-label="首页"
        @click="emit('go-home')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-home"><House size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">首页</span></div>
      </button>
      <!-- 文档：点一下，文档列表挨着图标栏弹出 -->
      <button
        type="button" class="nav-rail-btn nav-target" data-key="docs"
        :class="{ 'is-active': currentView === 'editor' && docsOpen }"
        aria-label="我的文档"
        @click="emit('toggle-docs')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-docs"><FileText size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">我的文档</span>
          <span class="nav-tooltip-shortcut">{{ currentView === 'editor' ? (docsOpen ? '点击收起' : '点击展开') : '回到编辑' }}</span>
        </div>
      </button>
      <button
        type="button" class="nav-rail-btn nav-target" data-key="templates"
        :class="{ 'is-active': currentView === 'templates' }"
        aria-label="模板中心"
        @click="emit('open-templates')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-templates"><LayoutTemplate size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">模板中心</span></div>
      </button>
      <button
        type="button" class="nav-rail-btn nav-target" data-key="materials"
        :class="{ 'is-active': currentView === 'materials' }"
        aria-label="素材中心"
        @click="emit('open-materials')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-materials"><Image size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">素材中心</span></div>
      </button>
    </div>
    <div class="nav-rail-bottom">
      <button
        type="button" class="nav-rail-btn nav-target" data-key="settings"
        aria-label="设置"
        @click="emit('open-settings')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-settings"><Settings size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">设置</span></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import {
  House,
  FileText,
  LayoutTemplate,
  Image,
  Settings
} from '@lucide/vue';
import BrandLogo from './BrandLogo.vue';

defineProps({
  currentView: { type: String, default: 'editor' },
  docsOpen: { type: Boolean, default: false }
});

const emit = defineEmits([
  'go-home', 'open-templates', 'open-materials',
  'open-settings', 'toggle-docs'
]);

/* ── 液体滑块：与右侧栏（PreviewPanel 的 right-glider）100% 同步算法：
      实色圆片（#ECEFF2）+ 距离自适应 scaleY 纵向拉伸 + 210ms 弹性回缩，
      彻底消除径向渐变拉伸发虚的问题，丝滑度与右侧栏完全一致。 ── */
const railRef = ref(null);
const gliderRef = ref(null);
let stretchTimer = null;

function moveGliderToEl(btn, stretch = true) {
  if (!btn || !gliderRef.value || !railRef.value) return;
  const barRect = railRef.value.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  const top = btnRect.top - barRect.top;
  const left = btnRect.left - barRect.left;

  const prevY = parseFloat(gliderRef.value.dataset.y || String(top));
  const dist = Math.abs(top - prevY);
  gliderRef.value.dataset.y = String(top);

  const stretchY = stretch ? 1 + Math.min(dist / 500, 0.16) : 1;

  gliderRef.value.style.width = `${btnRect.width}px`;
  gliderRef.value.style.height = `${btnRect.height}px`;
  gliderRef.value.style.transform = `translate(${left}px, ${top}px) scaleY(${stretchY})`;
  gliderRef.value.classList.add('is-visible');

  clearTimeout(stretchTimer);
  if (stretchY > 1.01) {
    stretchTimer = setTimeout(() => {
      if (gliderRef.value) {
        gliderRef.value.style.transform = `translate(${left}px, ${top}px) scaleY(1)`;
      }
    }, 380 * 0.55);
  }
}

function onButtonHover(e) {
  const target = e.currentTarget;
  if (target) {
    moveGliderToEl(target, true);
  }
}

function handleRailMouseLeave() {
  clearTimeout(stretchTimer);
  if (gliderRef.value) {
    gliderRef.value.classList.remove('is-visible');
  }
}

onUnmounted(() => {
  clearTimeout(stretchTimer);
});

</script>

<style scoped>
.nav-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 54px;
  min-width: 54px;
  height: 100%;
  padding: 12px 0 14px;
  background: var(--bg-rail, #FAFAFC);
  border-right: 1px solid var(--border-subtle, #ECEEF3);
  flex-shrink: 0;
  z-index: 70;
}
html.dark .nav-sidebar {
  background: var(--bg-rail, #18181B);
  border-right-color: var(--border-subtle, #27272A);
}
.nav-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}
.nav-rail-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle, #EDEDF0);
  position: relative;
  z-index: 2;
}
html.dark .nav-rail-bottom {
  border-top-color: rgba(255, 255, 255, 0.1);
}

/* ★ 左侧栏液体滑块 (与右侧栏 .right-glider 完全一致的实色圆片 + 弹性过渡) ★ */
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
  z-index: 1;
  transition: transform 380ms var(--ease-glide),
              width 300ms var(--ease-glide),
              height 300ms var(--ease-glide),
              border-radius 300ms var(--ease-glide),
              opacity 200ms ease;
  will-change: transform;
}
.nav-glider.is-visible {
  opacity: 1;
}
html.dark .nav-glider {
  background: rgba(255, 255, 255, 0.12);
}

/* ── Logo：32px，滑过有果冻弹动 ── */
.nav-brand {
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
  flex-shrink: 0;
}
.nav-brand:active {
  transform: scale(0.93);
}
.brand-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}
@keyframes brandSquash {
  0% { transform: scale(1, 1); }
  30% { transform: scale(1.12, 0.88); }
  55% { transform: scale(0.94, 1.06); }
  75% { transform: scale(1.03, 0.98); }
  100% { transform: scale(1, 1); }
}
.nav-brand:hover .brand-inner {
  animation: brandSquash 0.55s var(--ease-out);
}

.nav-divider {
  width: 22px;
  height: 1px;
  background: var(--border-color, #E2E8F0);
  margin: 8px 0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.nav-rail-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted, #555770);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s ease, background 0.2s ease, transform 0.12s;
  z-index: 2;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.nav-rail-btn:hover {
  color: var(--text-main, #0F172A);
}
html.dark .nav-rail-btn:hover {
  color: #FFFFFF;
}
/* 按下回弹（和右侧栏一样） */
.nav-rail-btn:active {
  transform: scale(0.93);
}
.nav-rail-btn.is-active {
  color: var(--text-main, #0F172A);
  background: rgba(15, 23, 42, 0.055);
}
html.dark .nav-rail-btn.is-active {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.09);
}

/* ── 左侧图标微动效（和右侧栏一个做法）：滑过时图标自己动一下，
      播一次就完，带过冲回稳的晃动才显得好玩自然；不是定住一个
      倾斜角的 transition——定住不动又硬又容易抖。 ── */
.nav-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  will-change: transform;
}

/* 首页房子：蹦一下，带挤压回弹 */
@keyframes homeHop {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  35% { transform: translateY(-3px) scale(1.08, 0.92); }
  65% { transform: translateY(0) scale(0.96, 1.05); }
  85% { transform: translateY(-1px) scale(1.03, 0.98); }
}
.nav-rail-btn:hover .ic-home {
  animation: homeHop 0.55s var(--ease-out);
}

/* 我的文档：纸页左右晃一下再稳住 */
@keyframes docWiggle {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-12deg); }
  60% { transform: rotate(9deg); }
}
.nav-rail-btn:hover .ic-docs {
  animation: docWiggle 0.6s var(--ease-out);
}

/* 模板中心：版式左右晃 */
@keyframes templateWiggle {
  0%, 100% { transform: rotate(0deg) scale(1, 1); }
  30% { transform: rotate(-10deg) scale(1.08); }
  60% { transform: rotate(8deg) scale(1.03); }
}
.nav-rail-btn:hover .ic-templates {
  animation: templateWiggle 0.6s var(--ease-out);
}

/* 素材中心：照片翘一下 */
@keyframes imageWiggle {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  35% { transform: rotate(-14deg) translateY(-2px); }
  70% { transform: rotate(7deg) translateY(0); }
}
.nav-rail-btn:hover .ic-materials {
  animation: imageWiggle 0.6s var(--ease-out);
}

/* 设置齿轮：转一下，带一点过冲回稳 */
@keyframes gearSpin {
  0% { transform: rotate(0deg); }
  60% { transform: rotate(100deg); }
  100% { transform: rotate(90deg); }
}
.nav-rail-btn:hover .ic-settings {
  animation: gearSpin 0.6s var(--ease-out);
}

/* ── 文字提示：滑过图标，右边浮出名字 ── */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%) translateX(-8px) scale(0.92);
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #1F2937);
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
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-target:hover .nav-tooltip,
.nav-target:focus-visible .nav-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}
.nav-tooltip-shortcut {
  font-size: 11.5px;
  color: var(--text-secondary, #64748b);
  font-weight: 400;
}
html.dark .nav-tooltip {
  background: #242429;
  border-color: rgba(255, 255, 255, 0.12);
  color: #F3F4F6;
  box-shadow: 0 8px 24px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3);
}
html.dark .nav-tooltip-shortcut {
  color: #9CA3AF;
}
</style>
