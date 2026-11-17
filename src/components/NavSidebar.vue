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
      title="EasyMD"
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
        title="首页" aria-label="首页"
        @click="emit('go-home')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-home"><House size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">首页</span></div>
      </button>
      <!-- 文档：点一下，文档列表挨着图标栏弹出 -->
      <button
        type="button" class="nav-rail-btn nav-target" data-key="docs"
        :class="{ 'is-active': docsOpen }"
        title="我的文档" aria-label="我的文档"
        @click="emit('toggle-docs')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-docs"><FileText size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip">
          <span class="nav-tooltip-label">我的文档</span>
          <span class="nav-tooltip-shortcut">{{ docsOpen ? '点击收起' : '点击展开' }}</span>
        </div>
      </button>
      <button
        type="button" class="nav-rail-btn nav-target" data-key="templates"
        :class="{ 'is-active': currentView === 'templates' }"
        title="模板中心" aria-label="模板中心"
        @click="emit('open-templates')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-templates"><LayoutTemplate size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">模板中心</span></div>
      </button>
      <button
        type="button" class="nav-rail-btn nav-target" data-key="materials"
        :class="{ 'is-active': currentView === 'materials' }"
        title="素材中心" aria-label="素材中心"
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
        title="设置" aria-label="设置"
        @click="emit('open-settings')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-settings"><Settings size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">设置</span></div>
      </button>
      <button
        type="button" class="nav-rail-btn nav-target" data-key="launch"
        title="发布" aria-label="发布"
        @click="emit('open-launchpad')"
        @mouseenter="onButtonHover" @focus="onButtonHover"
      >
        <span class="nav-btn-icon ic-launch"><Rocket size="20" stroke-width="2" /></span>
        <div class="nav-tooltip" role="tooltip"><span class="nav-tooltip-label">发布</span></div>
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
  Settings,
  Rocket
} from '@lucide/vue';
import BrandLogo from './BrandLogo.vue';

defineProps({
  currentView: { type: String, default: 'editor' },
  docsOpen: { type: Boolean, default: false }
});

const emit = defineEmits([
  'go-home', 'open-templates', 'open-materials',
  'open-settings', 'open-launchpad', 'toggle-docs'
]);

/* ── 液体滑块，和右侧栏（PreviewPanel 的 right-glider）同一个做法：
      灰色圆片只在滑过时出现，滑到哪个图标就到哪个图标后面，
      距离越远纵向拉得越明显，落位后回缩；鼠标离开整栏就消失，
      不常驻在当前选中的图标上。定位是同步算的，不包 rAF，
      滑过立刻就有反应。 ── */
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

  // 纵向物理拉伸（上限 1.16 倍）
  const stretchY = stretch ? 1 + Math.min(dist / 500, 0.16) : 1;

  // 圆片尺寸跟着按钮走，保证正好盖住图标。
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
  width: 56px;
  min-width: 56px;
  height: 100%;
  padding: 10px 0;
  background: #fff;
  border-right: 1px solid #e7edf5;
  flex-shrink: 0;
}
.nav-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
}
.nav-rail-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--border-color, #E8EAED);
  position: relative;
  z-index: 2;
}

/* ── 液体滑块：灰色圆片，只在滑过时出现，滑到滑过的图标后面 ──
      圆片是柔和的径向渐变，边缘晕开（像 muse 官网侧边栏那种
      柔和的圆底），不是生硬的实色块。 */
.nav-glider {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: radial-gradient(circle, #ECEFF2 0%, #ECEFF2 62%, rgba(236, 239, 242, 0) 100%);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  /* 位置全由 JS 的 translate 决定（和右侧栏一样）；不要在这里写 left，
     否则 translate 的 left 会再叠加一次，圆片就偏到图标右边去了。 */
  transition: transform 380ms var(--ease-glide),
              width 300ms var(--ease-glide),
              height 300ms var(--ease-glide),
              border-radius 300ms var(--ease-glide),
              opacity 0.2s var(--ease-out);
  will-change: transform;
}
.nav-glider.is-visible {
  opacity: 1;
}
html.dark .nav-glider {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.12) 62%, rgba(255, 255, 255, 0) 100%);
}

/* ── Logo：32px，滑过有果冻弹动 ── */
.nav-brand {
  position: relative;
  width: 40px;
  height: 40px;
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
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.12s;
  z-index: 2;
}
.nav-rail-btn:hover {
  color: var(--text-main);
}
/* 按下回弹（和右侧栏一样） */
.nav-rail-btn:active {
  transform: scale(0.93);
}
.nav-rail-btn.is-active {
  color: var(--text-main);
}

/* ── 左侧图标微动效（muse 官网侧边栏的感觉）：滑过时图标自己
      倾斜一下，松开鼠标再平滑转回来；不是播一次就完的动画，
      而是跟着悬停状态走的。 ── */
.nav-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
  transition: transform 0.3s var(--ease-out);
}

/* 首页房子：往左歪一点 */
.nav-rail-btn:hover .ic-home {
  transform: rotate(-10deg) scale(1.08);
}
/* 我的文档：往右歪一点 */
.nav-rail-btn:hover .ic-docs {
  transform: rotate(9deg) scale(1.08);
}
/* 模板中心：往左歪一点 */
.nav-rail-btn:hover .ic-templates {
  transform: rotate(-8deg) scale(1.08);
}
/* 素材中心：往右歪一点 */
.nav-rail-btn:hover .ic-materials {
  transform: rotate(11deg) scale(1.08);
}
/* 设置齿轮：转一下 */
.nav-rail-btn:hover .ic-settings {
  transform: rotate(90deg);
}
/* 发布火箭：往上飞一点 */
.nav-rail-btn:hover .ic-launch {
  transform: rotate(-14deg) translate(1px, -2px) scale(1.08);
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
</style>
