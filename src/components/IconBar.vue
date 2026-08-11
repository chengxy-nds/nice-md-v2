<script setup>
import { FileText, LayoutTemplate, Share2, Settings, Info, Sun } from '@lucide/vue';

defineProps({
  sidebarVisible: { type: Boolean, default: true },
  currentView: { type: String, default: 'editor' }
});

defineEmits(['toggle-tab']);
</script>

<template>
  <nav class="icon-bar select-none">
    <!-- Top icon group -->
    <div class="icon-bar-top">
      <!-- 1. 文档 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'editor' && sidebarVisible }"
        @click="$emit('toggle-tab', 'docs')"
        title="我的文档"
      >
        <FileText size="20" stroke-width="1.6" />
      </button>

      <!-- 2. 模板中心 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'templates' }"
        @click="$emit('toggle-tab', 'templates')"
        title="模板中心"
      >
        <LayoutTemplate size="20" stroke-width="1.6" />
      </button>

      <!-- 3. 素材中心 -->
      <button
        class="icon-btn"
        :class="{ 'is-active': currentView === 'materials' }"
        @click="$emit('toggle-tab', 'materials')"
        title="素材中心"
      >
        <Share2 size="20" stroke-width="1.6" />
      </button>

      <!-- 4. 设置 -->
      <button
        class="icon-btn"
        @click="$emit('toggle-tab', 'settings')"
        title="设置"
      >
        <Settings size="20" stroke-width="1.6" />
      </button>
    </div>

    <!-- Bottom icon group -->
    <div class="icon-bar-bottom">
      <button class="icon-btn icon-btn-subtle" @click="$emit('toggle-tab', 'info')" title="关于">
        <Info size="20" stroke-width="1.6" />
      </button>
      <button class="icon-btn icon-btn-subtle" @click="$emit('toggle-tab', 'theme')" title="外观">
        <Sun size="20" stroke-width="1.6" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.icon-bar {
  width: 56px;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-app);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 20px;
}

.icon-bar-top,
.icon-bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  background: transparent;
  color: #44403c;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.icon-btn.is-active {
  color: var(--text-main);
  background: var(--accent-bg);
}

.icon-btn-subtle {
  color: #57534e;
}

.icon-btn-subtle:hover {
  color: #1c1917;
  background: rgba(0, 0, 0, 0.04);
}
</style>
