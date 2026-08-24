<script setup>
import { House, Files, Palette, Boxes, Settings, CircleHelp } from '@lucide/vue';

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
      <!-- 0. 官方首页 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'home' }"
        @click="$emit('toggle-tab', 'home')"
        title="官方首页"
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
  width: 56px;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-sidebar, #f0f0ee);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 16px;
  z-index: 10;
  box-sizing: border-box;
  border-right: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  transition: background 0.3s ease, border-color 0.3s ease;
}

.icon-bar-top,
.icon-bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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
  border-radius: 8px;
  transition: background-color 0.15s ease, color 0.15s ease;
  position: relative;
}

.icon-btn:hover {
  color: var(--text-main, #0f172a);
  background: #ebebeb;
}

html.dark .icon-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
}

.icon-btn:active {
  transform: scale(0.96);
}

.icon-btn.is-active {
  color: var(--accent-color, #4f46e5);
  background: rgba(99, 102, 241, 0.08);
  border-radius: 8px;
  box-shadow: none;
}

html.dark .icon-btn.is-active {
  color: var(--accent-color, #818cf8);
  background: rgba(99, 102, 241, 0.16);
  box-shadow: none;
}

.icon-btn-subtle {
  color: var(--text-muted, #94a3b8);
}

.icon-btn-subtle:hover {
  color: var(--text-main, #0f172a);
  background: #ebebeb;
}

html.dark .icon-btn-subtle:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
}
</style>

