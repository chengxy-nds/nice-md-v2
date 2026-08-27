<script setup>
import { ref, computed } from 'vue';
import { X, Check, Search, ChevronDown, Sparkles } from 'lucide-vue-next';
import {
  getMaterialTemplatesForKey,
  styleCategories,
  styleCategoryMap
} from '../utils/materialLibrary';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  elementKey: {
    type: String,
    default: 'h1'
  },
  currentMaterialId: {
    type: String,
    default: 'none'
  },
  currentPrefix: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select', 'close', 'open-customizer', 'update-prefix']);

const typeLabels = {
  body: '整体背景底纹',
  background: '整体背景底纹',
  h1: 'H1 一级标题',
  h2: 'H2 二级标题',
  h3: 'H3 三级标题',
  h4: 'H4 四级标题',
  h5: 'H5 五级标题',
  h6: 'H6 六级标题',
  blockquote: '引用 / 金句卡片',
  callouts: '提示 / 重点卡片',
  callout: '提示 / 重点卡片',
  p: '正文排版',
  hr: '分割线',
  ul: '无序列表',
  ol: '有序列表',
  li: '列表项',
  header_widget: '文章导读头卡',
  footer_widget: '文末三连/作者名片'
};

const titleText = computed(() => {
  return typeLabels[props.elementKey] || '素材模版';
});

// 1. Template list for the current element key
const rawList = computed(() => {
  return getMaterialTemplatesForKey(props.elementKey);
});

// 2. Search & Style Filter
const searchQuery = ref('');
const activeStyleFilter = ref('all');
const showColorFilterMenu = ref(false);

const displayedList = computed(() => {
  let list = rawList.value || [];
  if (activeStyleFilter.value !== 'all') {
    list = list.filter(t => t.id === 'none' || t.styleCategory === activeStyleFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(t => (t.name || '').toLowerCase().includes(q) || (t.tag || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
  }
  return list;
});

function getRenderHtml(item) {
  if (item.id === 'none') {
    return `<div style="text-align: center; color: #64748b; font-size: 15px; font-weight: 700; border-bottom: 2px solid #2563eb; padding-bottom: 4px; display: inline-block;">默认主题标题样式</div>`;
  }
  if (item.html) return item.html;
  if (typeof item.render === 'function') {
    const sampleText = item.name || '捕捉秋碎片 珍藏限定小浪漫';
    const rendered = item.render(sampleText, 1, { prefix: props.currentPrefix || 'PART' });
    if (rendered) return rendered;
  }
  return item.previewHtml || '';
}

function handleSelect(templateId) {
  emit('select', { key: props.elementKey, templateId });
}

function handlePrefixChange(e) {
  emit('update-prefix', { key: props.elementKey, prefix: e.target.value });
}

function hasPrefixOption(id) {
  return ['h-135-part01-leaf', 'h-135-part02-peach', 'h-135-part03-purple', 'h-135-morandi-block', 'h-pill-duotone'].includes(id);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="material-popup-wrapper">
      <!-- Translucent Backdrop (click to close) -->
      <div class="material-popup-backdrop" @click="emit('close')"></div>

      <!-- Right Drawer Popup Panel -->
      <aside class="material-right-drawer" @click.stop>
        <!-- 1. Header with Focused Title & Close -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <span class="drawer-active-tab-title">{{ titleText }}</span>
          </div>
          <button class="drawer-close-btn" @click="emit('close')" title="关闭 (Esc)">
            <X size="15" />
          </button>
        </div>

        <!-- 2. Search & Color Palette Filter Bar -->
        <div class="drawer-search-bar">
          <div class="search-input-wrap">
            <Search size="14" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="输入样式关键词搜索"
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
              <X size="11" />
            </button>
          </div>

          <!-- Color Palette Dropdown Trigger -->
          <div class="color-filter-wrap">
            <button
              class="color-filter-btn"
              :class="{ 'is-active': activeStyleFilter !== 'all' }"
              @click="showColorFilterMenu = !showColorFilterMenu"
              title="按色系风格筛选"
            >
              <span class="color-wheel-icon"></span>
              <ChevronDown size="11" class="chevron-icon" />
            </button>

            <!-- Dropdown Menu -->
            <div v-if="showColorFilterMenu" class="color-filter-dropdown" @click.stop>
              <button
                class="color-filter-opt"
                :class="{ 'is-selected': activeStyleFilter === 'all' }"
                @click="activeStyleFilter = 'all'; showColorFilterMenu = false;"
              >
                <span class="opt-color-dot all"></span>
                <span>全部风格</span>
              </button>
              <button
                v-for="st in styleCategories.filter(s => s.id !== 'all')"
                :key="st.id"
                class="color-filter-opt"
                :class="{ 'is-selected': activeStyleFilter === st.id }"
                @click="activeStyleFilter = st.id; showColorFilterMenu = false;"
              >
                <span
                  class="opt-color-dot"
                  :style="{ backgroundColor: styleCategoryMap[st.id]?.color || '#94a3b8' }"
                ></span>
                <span>{{ st.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Inline Prefix Configuration if applicable -->
        <div v-if="hasPrefixOption(props.currentMaterialId)" class="drawer-prefix-bar">
          <span class="prefix-label">标牌前缀:</span>
          <input
            type="text"
            :value="props.currentPrefix || (props.elementKey === 'h1' ? 'PART' : 'SECTION')"
            @input="handlePrefixChange"
            placeholder="如 PART / SECTION"
            class="prefix-input"
          />
        </div>

        <!-- 4. Pure Clean Material Showcase Stream (Highlighting Material Visuals) -->
        <div class="drawer-materials-stream">
          <div
            v-for="item in displayedList"
            :key="item.id"
            class="stream-material-row"
            :class="{ 'is-selected': (props.currentMaterialId || 'none') === item.id }"
            @click="handleSelect(item.id)"
          >
            <!-- VIP / Selected Badge on Top Right -->
            <span v-if="(props.currentMaterialId || 'none') === item.id" class="row-selected-pill">
              <Check size="10" />
              <span>已选用</span>
            </span>
            <span v-else class="row-vip-badge">VIP</span>

            <!-- High-Fidelity Material Canvas -->
            <div class="stream-material-canvas" v-html="getRenderHtml(item)"></div>

            <!-- Sleek Frosted Glass Action Overlay on Hover -->
            <div class="stream-hover-overlay">
              <span class="stream-use-btn">
                {{ (props.currentMaterialId || 'none') === item.id ? '当前已选用' : '选用此样式' }}
              </span>
            </div>
          </div>

          <div v-if="displayedList.length === 0" class="drawer-empty-state">
            <p>未找到匹配的 {{ titleText }} 素材</p>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.material-popup-wrapper {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999990;
  pointer-events: auto;
}

.material-popup-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  animation: fadeIn 0.18s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Right Drawer Popup Panel (Pure Clean Aesthetic) ── */
.material-right-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 95vw;
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 999999;
  font-family: var(--font-sans, 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif);
  animation: slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* 1. Drawer Header */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 0.875rem 0 1.25rem;
  border-bottom: 1px solid #EDEDED;
  background: #ffffff;
  flex-shrink: 0;
}

.drawer-title-group {
  display: flex;
  align-items: center;
  height: 100%;
}

.drawer-active-tab-title {
  position: relative;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #18181B;
  height: 100%;
  display: flex;
  align-items: center;
}

.drawer-active-tab-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2.5px;
  background: #18181B;
  border-radius: 2px;
}

.drawer-close-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #71717A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.drawer-close-btn:hover {
  background: #F4F4F5;
  color: #18181B;
}

/* 2. Search & Color Filter Bar */
.drawer-search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid #F4F4F5;
  background: #ffffff;
  flex-shrink: 0;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #A1A1AA;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 32px;
  padding: 0 1.75rem 0 2.25rem;
  font-size: 0.78125rem;
  background: #F4F4F5;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #18181B;
  outline: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.search-input:focus {
  background: #ffffff;
  border-color: #D4D4D8;
}

.clear-search-btn {
  position: absolute;
  right: 0.375rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #71717A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Color Wheel Filter Button */
.color-filter-wrap {
  position: relative;
}

.color-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 32px;
  padding: 0 0.5rem;
  background: #F4F4F5;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #71717A;
}

.color-filter-btn:hover,
.color-filter-btn.is-active {
  background: #E4E4E7;
  color: #18181B;
}

.color-wheel-icon {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: conic-gradient(
    #ff0000 0deg,
    #ff8800 60deg,
    #ffff00 120deg,
    #00ff00 180deg,
    #00ffff 240deg,
    #0000ff 300deg,
    #ff0000 360deg
  );
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: inline-block;
}

.chevron-icon {
  color: #71717A;
}

.color-filter-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 120px;
  background: #ffffff;
  border: 1px solid #EDEDED;
  border-radius: 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  padding: 0.25rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.color-filter-opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #3F3F46;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.12s ease;
}

.color-filter-opt:hover {
  background: #F4F4F5;
  color: #18181B;
}

.color-filter-opt.is-selected {
  background: #FFF7ED;
  color: #EA580C;
  font-weight: 600;
}

.opt-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.opt-color-dot.all {
  background: #71717A;
}

/* 3. Prefix Bar */
.drawer-prefix-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEDED;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.prefix-label {
  font-weight: 600;
  color: #52525B;
}

.prefix-input {
  flex: 1;
  height: 24px;
  padding: 0 0.375rem;
  font-size: 0.75rem;
  border: 1px solid #D4D4D8;
  border-radius: 4px;
  background: #ffffff;
  outline: none;
}

/* 4. Pure Clean Material Showcase Stream (135 Editor Style) */
.drawer-materials-stream {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.drawer-materials-stream::-webkit-scrollbar {
  width: 0.25rem;
}

.drawer-materials-stream::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

.stream-material-row {
  position: relative;
  background: #ffffff;
  border-bottom: 1px solid #F0F0F0;
  padding: 1.75rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.stream-material-row:hover {
  background: #FAFAFA;
}

.stream-material-row.is-selected {
  background: #FFFBF9;
  border-left: 3px solid #ff5e36;
}

/* VIP badge */
.row-vip-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 0.625rem;
  font-weight: 700;
  color: #D97706;
  background: #FEF3C7;
  padding: 0.0625rem 0.375rem;
  border-radius: 3px;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

/* Selected Pill */
.row-selected-pill {
  position: absolute;
  top: 8px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  font-size: 0.625rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #ff5e36 0%, #ea580c 100%);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(255, 94, 54, 0.3);
  z-index: 5;
}

.stream-material-canvas {
  width: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Sleek Hover Overlay */
.stream-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(24, 24, 27, 0.5);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 10;
}

.stream-material-row:hover .stream-hover-overlay {
  opacity: 1;
}

.stream-use-btn {
  font-size: 0.75rem;
  font-weight: 600;
  color: #18181B;
  background: #ffffff;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
}

.stream-material-row:hover .stream-use-btn:hover {
  background: #F4F4F5;
}

.drawer-empty-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #A1A1AA;
  font-size: 0.8125rem;
}

/* ── Dark Mode ── */
:global(html.dark) .material-right-drawer,
:global(html[data-color-mode="dark"]) .material-right-drawer {
  background: #18181b;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.35);
}

:global(html.dark) .drawer-header,
:global(html[data-color-mode="dark"]) .drawer-header {
  background: #1e1e1e;
  border-bottom-color: #2d2d2d;
}

:global(html.dark) .drawer-active-tab-title,
:global(html[data-color-mode="dark"]) .drawer-active-tab-title {
  color: #ffffff;
}

:global(html.dark) .drawer-active-tab-title::after,
:global(html[data-color-mode="dark"]) .drawer-active-tab-title::after {
  background: #ffffff;
}

:global(html.dark) .drawer-search-bar,
:global(html[data-color-mode="dark"]) .drawer-search-bar {
  background: #1e1e1e;
  border-bottom-color: #2d2d2d;
}

:global(html.dark) .search-input,
:global(html[data-color-mode="dark"]) .search-input {
  background: #252526;
  color: #ffffff;
}

:global(html.dark) .color-filter-btn,
:global(html[data-color-mode="dark"]) .color-filter-btn {
  background: #252526;
  color: #a1a1aa;
}

:global(html.dark) .color-filter-dropdown,
:global(html[data-color-mode="dark"]) .color-filter-dropdown {
  background: #252526;
  border-color: #333333;
}

:global(html.dark) .color-filter-opt,
:global(html[data-color-mode="dark"]) .color-filter-opt {
  color: #d4d4d8;
}

:global(html.dark) .color-filter-opt:hover,
:global(html[data-color-mode="dark"]) .color-filter-opt:hover {
  background: #2d2d2d;
  color: #ffffff;
}

:global(html.dark) .drawer-materials-stream,
:global(html[data-color-mode="dark"]) .drawer-materials-stream {
  background: #18181b;
}

:global(html.dark) .stream-material-row,
:global(html[data-color-mode="dark"]) .stream-material-row {
  background: #18181b;
  border-bottom-color: #27272a;
}

:global(html.dark) .stream-material-row:hover,
:global(html[data-color-mode="dark"]) .stream-material-row:hover {
  background: #202023;
}

:global(html.dark) .stream-material-row.is-selected,
:global(html[data-color-mode="dark"]) .stream-material-row.is-selected {
  background: #2b201a;
  border-left-color: #ff5e36;
}
</style>
