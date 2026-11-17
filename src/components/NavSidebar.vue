<!-- 左侧导航栏：只有窄图标列，不再有宽栏。
     图标：首页 / 文档 / 模板中心 / 素材中心 / 设置 / 发布。
     点“文档”图标，文档列表面板挨着图标栏弹出。 -->
<template>
  <div class="nav-sidebar">
    <div class="nav-rail">
      <button type="button" class="nav-rail-btn" title="首页" aria-label="首页" @click="emit('go-home')">
        <House size="20" stroke-width="2" />
      </button>
      <!-- 文档：点一下，文档列表挨着图标栏弹出 -->
      <button
        type="button" class="nav-rail-btn" title="我的文档" aria-label="我的文档"
        :class="{ 'is-active': docsOpen }"
        @click="emit('toggle-docs')"
      >
        <FileText size="20" stroke-width="2" />
      </button>
      <button type="button" class="nav-rail-btn" title="模板中心" aria-label="模板中心" @click="emit('open-templates')">
        <LayoutTemplate size="20" stroke-width="2" />
      </button>
      <button type="button" class="nav-rail-btn" title="素材中心" aria-label="素材中心" @click="emit('open-materials')">
        <Image size="20" stroke-width="2" />
      </button>
    </div>
    <div class="nav-rail-bottom">
      <button type="button" class="nav-rail-btn" title="设置" aria-label="设置" @click="emit('open-settings')">
        <Settings size="20" stroke-width="2" />
      </button>
      <button type="button" class="nav-rail-btn" title="发布" aria-label="发布" @click="emit('open-launchpad')">
        <Rocket size="20" stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  House,
  FileText,
  LayoutTemplate,
  Image,
  Settings,
  Rocket
} from '@lucide/vue';

defineProps({
  currentView: { type: String, default: 'editor' },
  docsOpen: { type: Boolean, default: false }
});

const emit = defineEmits([
  'go-home', 'open-templates', 'open-materials',
  'open-settings', 'open-launchpad', 'toggle-docs'
]);
</script>

<style scoped>
.nav-sidebar {
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
}
.nav-rail-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--border-color, #E8EAED);
}
.nav-rail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--btn-radius, 8px);
  background: transparent;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s var(--ease-glide), color 0.15s var(--ease-glide);
}
.nav-rail-btn:hover {
  background: var(--sidebar-hover, #F2F4F7);
  color: var(--text-main);
}
.nav-rail-btn.is-active {
  background: var(--sidebar-selected, #F0F2F5);
  color: var(--text-main);
}
</style>
