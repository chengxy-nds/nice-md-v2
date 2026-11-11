<script setup>
import { House, Files, Palette, Boxes, Settings, CircleHelp } from '@lucide/vue';
import BrandLogo from './BrandLogo.vue';

defineProps({
  sidebarVisible: { type: Boolean, default: true },
  currentView: { type: String, default: 'editor' }
});

defineEmits(['toggle-tab']);
</script>

<template>
  <nav class="icon-bar select-none">
    <!-- Top Main Navigation Group -->
    <div class="icon-bar-top">
      <div
        class="icon-bar-brand"
        @click="$emit('toggle-tab', 'home')"
      >
        <BrandLogo :size="28" />
      </div>

      <span class="icon-bar-divider"></span>

      <!-- 0. 官方首页 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'home' }"
        @click="$emit('toggle-tab', 'home')"
      >
        <House size="19" :stroke-width="currentView === 'home' ? 2 : 1.7" />
      </button>

      <!-- 1. 我的文档 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'editor' && sidebarVisible }"
        @click="$emit('toggle-tab', 'docs')"
        title="我的文档"
      >
        <Files size="19" :stroke-width="currentView === 'editor' && sidebarVisible ? 2 : 1.7" />
      </button>

      <!-- 2. 模板中心 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'templates' }"
        @click="$emit('toggle-tab', 'templates')"
        title="模板中心"
      >
        <Palette size="19" :stroke-width="currentView === 'templates' ? 2 : 1.7" />
      </button>

      <!-- 3. 素材中心 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'materials' }"
        @click="$emit('toggle-tab', 'materials')"
        title="素材中心"
      >
        <Boxes size="19" :stroke-width="currentView === 'materials' ? 2 : 1.7" />
      </button>
    </div>

    <!-- Bottom Utility & Settings Group -->
    <div class="icon-bar-bottom">
      <!-- 4. 偏好设置 -->
      <button
        class="icon-btn"
        @click="$emit('toggle-tab', 'settings')"
        title="偏好设置"
      >
        <Settings size="19" stroke-width="1.7" />
      </button>

      <!-- 5. 快速启动与帮助 -->
      <button
        class="icon-btn icon-btn-subtle"
        @click="$emit('toggle-tab', 'launch')"
        title="快捷键与帮助"
      >
        <CircleHelp size="19" stroke-width="1.7" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.icon-bar {
  width: 50px;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-rail, #EEF2F6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 12px;
  z-index: 10;
  box-sizing: border-box;
  border-right: 1px solid var(--border-subtle, #EDF1F7);
  transition: background 0.3s ease, border-color 0.3s ease;
}

.icon-bar-brand {
  width: 36px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  cursor: pointer;
}

.icon-bar-divider {
  width: 20px;
  height: 1px;
  background: var(--border-color, #E2E8F0);
  margin: 1px 0;
  opacity: 0.75;
}

html.dark .icon-bar-divider {
  background: rgba(255, 255, 255, 0.12);
}

.icon-bar-top,
.icon-bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  border-radius: 9px;
  transition: all 0.15s ease;
  position: relative;
}

.icon-btn:hover {
  color: var(--text-main, #0f172a);
  background: rgba(15, 23, 42, 0.05);
}

html.dark .icon-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
}

.icon-btn:active {
  transform: scale(0.96);
}

.icon-btn.is-active {
  color: var(--brand-primary, #116ACC);
  background: rgba(17, 106, 204, 0.09);
  border-radius: 9px;
  box-shadow: none;
}

html.dark .icon-btn.is-active {
  color: #93c5fd;
  background: rgba(96, 165, 250, 0.15);
}

.icon-btn-subtle {
  color: var(--text-muted, #94a3b8);
}

.icon-btn-subtle:hover {
  color: var(--text-main, #0f172a);
  background: rgba(15, 23, 42, 0.05);
}

html.dark .icon-btn-subtle:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
}
</style>

