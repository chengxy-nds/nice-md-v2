<!-- 左侧导航栏：只放导航，不放文档和文件夹。
     宽栏：logo + 新建文档 + 导航（首页 / 模板中心 / 素材中心）+ 底部设置/发布。
     窄栏：图标列（首页 / 文档 / 模板中心 / 素材中心 / 设置 / 发布），底部展开按钮。
     文档列表是另一块面板（Sidebar.vue），点“文档”图标或展开/收窄按钮时挨着导航栏弹出。 -->
<template>
  <div class="nav-sidebar" :class="{ 'is-wide': wide, 'is-narrow': !wide }">
    <!-- ── 宽栏 ── -->
    <template v-if="wide">
      <div class="nav-brand">
        <BrandLogo :size="28" />
        <span class="nav-brand-name">EasyMD</span>
      </div>
      <button type="button" class="nav-create-btn" title="新建文档" aria-label="新建文档" @click="emit('create-doc', null)">
        <Plus size="18" stroke-width="3" />
        <span>新建文档</span>
      </button>
      <nav class="nav-list" aria-label="主导航">
        <button
          type="button" class="nav-item"
          :class="{ 'is-active': currentView === 'home' }"
          @click="emit('go-home')"
        >
          <House size="18" stroke-width="2" />
          <span>首页</span>
        </button>
        <button
          type="button" class="nav-item"
          :class="{ 'is-active': currentView === 'templates' }"
          @click="emit('open-templates')"
        >
          <LayoutTemplate size="18" stroke-width="2" />
          <span>模板中心</span>
        </button>
        <button
          type="button" class="nav-item"
          :class="{ 'is-active': currentView === 'materials' }"
          @click="emit('open-materials')"
        >
          <Image size="18" stroke-width="2" />
          <span>素材中心</span>
        </button>
      </nav>
      <div class="nav-spacer"></div>
      <div class="nav-footer">
        <button type="button" class="nav-item" @click="emit('open-settings')">
          <Settings size="18" stroke-width="2" />
          <span>设置</span>
        </button>
        <button type="button" class="nav-item" @click="emit('open-launchpad')">
          <Rocket size="18" stroke-width="2" />
          <span>发布</span>
        </button>
        <!-- 收窄：宽栏 → 窄图标栏，同时文档区域挨着图标栏弹出 -->
        <button type="button" class="nav-item nav-collapse-btn" title="收窄侧边栏" aria-label="收窄侧边栏" @click="emit('toggle-wide')">
          <PanelLeftClose size="18" stroke-width="2" />
          <span>收窄</span>
        </button>
      </div>
    </template>

    <!-- ── 窄栏：图标列 ── -->
    <template v-else>
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
        <!-- 展开：窄栏 → 宽栏 -->
        <button type="button" class="nav-rail-btn" title="展开宽侧边栏" aria-label="展开宽侧边栏" @click="emit('toggle-wide')">
          <PanelLeftOpen size="20" stroke-width="2" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import {
  Plus,
  House,
  FileText,
  LayoutTemplate,
  Image,
  Settings,
  Rocket,
  PanelLeftClose,
  PanelLeftOpen
} from '@lucide/vue';
import BrandLogo from './BrandLogo.vue';

defineProps({
  currentView: { type: String, default: 'editor' },
  wide: { type: Boolean, default: true },
  docsOpen: { type: Boolean, default: false }
});

const emit = defineEmits([
  'go-home', 'open-templates', 'open-materials',
  'open-settings', 'open-launchpad', 'create-doc',
  'toggle-wide', 'toggle-docs'
]);
</script>

<style scoped>
.nav-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  flex-shrink: 0;
}
.nav-sidebar.is-wide {
  width: clamp(17rem, 20vw, 24rem);
  min-width: 13.75rem;
  padding: 10px 12px;
  border-right: 1px solid #e7edf5;
}
.nav-sidebar.is-narrow {
  width: 56px;
  min-width: 56px;
  align-items: center;
  padding: 10px 0;
  border-right: 1px solid #e7edf5;
}

/* ── 宽栏 ── */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 0;
  flex-shrink: 0;
}
.nav-brand-name {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-main);
}
.nav-create-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  width: 100%;
  height: 44px;
  margin: 12px 0 8px;
  padding-left: 20px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(90deg, #4CD7E9 0%, #76E3F5 50%, #6DE0F1 100%);
  color: #0E0E11;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: none;
  flex-shrink: 0;
}
.nav-create-btn:hover {
  background: linear-gradient(90deg, #19CBE0 0%, #1ECDE2 50%, #24D0E5 100%);
}
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 4px 0 8px;
  flex-shrink: 0;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: var(--btn-radius, 8px);
  background: transparent;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s var(--ease-glide);
}
.nav-item:hover {
  background: var(--sidebar-hover, #F2F4F7);
}
.nav-item.is-active {
  background: var(--sidebar-selected, #F0F2F5);
  font-weight: 600;
}
.nav-item svg {
  flex-shrink: 0;
  color: var(--text-secondary, #64748b);
}
.nav-item.is-active svg {
  color: var(--text-main);
}
.nav-spacer {
  flex: 1;
}
.nav-footer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color, #E8EAED);
  flex-shrink: 0;
}

/* ── 窄栏图标列 ── */
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
