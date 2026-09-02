<script setup>
import { ref, computed, watch, nextTick } from 'vue';
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
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
});

const emit = defineEmits(['select', 'close', 'open-customizer', 'update-prefix']);

const streamContainerRef = ref(null);

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
  u: '下划线文本修饰 ( <u>...</u> )',
  hr: '分割线',
  ul: '无序列表',
  ol: '有序列表',
  li: '列表项',
  table: '表格 / 数据对照',
  tables: '表格 / 数据对照',
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

function scrollToSelected(behavior = 'instant') {
  nextTick(() => {
    if (!streamContainerRef.value) return;
    const targetId = props.currentMaterialId || 'none';
    const targetEl = streamContainerRef.value.querySelector(`[data-item-id="${targetId}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ block: 'center', inline: 'nearest', behavior });
    }
  });
}

watch(
  () => [props.visible, props.elementKey, props.currentMaterialId],
  ([newVisible]) => {
    if (newVisible) {
      scrollToSelected('instant');
      setTimeout(() => {
        scrollToSelected('instant');
      }, 60);
    }
  },
  { immediate: true }
);

function getRenderHtml(item) {
  if (item.id === 'none') {
    const label = typeLabels[props.elementKey] || '样式';
    if (['body', 'background'].includes(props.elementKey)) {
      return `<div style="min-height: 140px; padding: 24px 20px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; text-align: center; box-sizing: border-box;">
        <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">◻ 极简纯色 (默认无底纹)</div>
        <div style="font-size: 12.5px; color: #64748b;">保持纯白纸面质感，适合极简阅读风格</div>
      </div>`;
    }
    return `<div style="text-align: center; color: #64748b; font-size: 14px; font-weight: 700; border-bottom: 2px solid #2563eb; padding-bottom: 4px; display: inline-block;">默认主题${label}</div>`;
  }

  // Dedicated Rich Immersive Canvas for Background Textures
  if (props.elementKey === 'body' || props.elementKey === 'background') {
    const bgImg = item.bgImage || 'none';
    const bgSize = item.bgSize || 'auto';
    const bgPos = item.bgPosition || '0 0';
    return `<div style="min-height: 150px; padding: 22px 20px; background-color: #ffffff; background-image: ${bgImg}; background-size: ${bgSize}; background-position: ${bgPos}; background-repeat: repeat; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="font-size: 14.5px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
          <span>🎨</span>
          <span>${item.name}</span>
        </div>
        <span style="font-size: 11px; font-weight: 600; color: #116ACC; background: rgba(17,106,204,0.08); padding: 2px 8px; border-radius: 9999px;">${item.tag || '底纹'}</span>
      </div>
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.8; font-weight: 400;">
        ${item.description || '细腻排版背景肌理，为整篇公众号长文营造沉浸式纸张呼吸感与层次美学。'}
      </p>
    </div>`;
  }

  if (props.elementKey === 'u' || props.elementKey === 'underlines') {
    if (typeof item.render === 'function') {
      const underlined = item.render('划重点核心语句');
      return `<div style="padding: 12px 16px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; font-size: 14px; color: #27272a; line-height: 1.8;">
        <div style="font-size: 12px; font-weight: 700; color: #71717a; margin-bottom: 4px;">🏷️ ${item.name}</div>
        <span>示例文本：在微信排版中对 ${underlined} 进行醒目修饰。</span>
      </div>`;
    }
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
  return ['h-cyan-signpost-top', 'h-135-part01-leaf', 'h-135-part02-peach', 'h-135-part03-purple', 'h-135-morandi-block', 'h-pill-duotone', 'h-yellow-shadow-cube'].includes(id);
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
        <div
          ref="streamContainerRef"
          class="drawer-materials-stream"
          :class="{
            'is-table-stream': ['table', 'tables'].includes(props.elementKey),
            'is-bg-stream': ['body', 'background'].includes(props.elementKey)
          }"
        >
          <div
            v-for="item in displayedList"
            :key="item.id"
            class="stream-material-row"
            :class="{ 'is-selected': (props.currentMaterialId || 'none') === item.id }"
            :data-item-id="item.id"
            @click="handleSelect(item.id)"
          >
            <!-- Selected Badge on Top Right -->
            <span v-if="(props.currentMaterialId || 'none') === item.id" class="row-selected-pill">
              <Check size="10" />
              <span>已选用</span>
            </span>

            <!-- High-Fidelity Material Canvas -->
            <div class="stream-material-canvas" v-html="getRenderHtml(item)"></div>

            <!-- Bottom-Right "应用此样式" Action Button on Hover (Only for non-selected items) -->
            <div v-if="(props.currentMaterialId || 'none') !== item.id" class="stream-apply-btn-wrap">
              <button class="stream-apply-btn" type="button" @click.stop="handleSelect(item.id)">
                应用此样式
              </button>
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
  width: 32rem;
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
  width: 100%;
  height: auto;
  min-height: auto;
  background: #ffffff;
  border-bottom: 1px solid #EDEDED;
  border-left: 3px solid transparent;
  padding: 1.5rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s ease, border-left-color 0.15s ease;
  display: block;
  box-sizing: border-box;
  overflow: visible;
}

.drawer-materials-stream.is-table-stream .stream-material-row {
  height: auto;
  min-height: auto;
  padding: 1.75rem 1.25rem;
}

.drawer-materials-stream.is-bg-stream .stream-material-row {
  height: auto;
  min-height: auto;
  padding: 1.25rem 1.25rem;
}

.stream-material-row:hover {
  background: #FAFAFA;
}

.stream-material-row.is-selected {
  background: rgba(17, 106, 204, 0.04);
  border-left-color: var(--brand-primary, #116ACC);
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
  background: var(--brand-primary, #116ACC);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(17, 106, 204, 0.3);
  z-index: 5;
}

.stream-material-canvas {
  width: 100%;
  max-width: 100%;
  height: auto;
  box-sizing: border-box;
  background: transparent;
  display: block;
  overflow-x: auto;
  overflow-y: visible;
}

/* Neutralize excessive outer margins in material previews so every item renders uniformly centered */
.stream-material-canvas :deep(section),
.stream-material-canvas :deep(div),
.stream-material-canvas :deep(blockquote),
.stream-material-canvas :deep(p),
.stream-material-canvas :deep(hr),
.stream-material-canvas :deep(ul),
.stream-material-canvas :deep(ol),
.stream-material-canvas :deep(table) {
  height: auto !important;
  max-height: none !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  box-sizing: border-box !important;
}

.stream-material-canvas :deep(table) {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
}

/* Bottom-Right "应用此样式" Action Button on Hover */
.stream-apply-btn-wrap {
  position: absolute;
  right: 12px;
  bottom: 8px;
  opacity: 0;
  transform: translateY(3px);
  transition: opacity 0.16s ease, transform 0.16s ease;
  pointer-events: none;
  z-index: 10;
}

.stream-material-row:hover .stream-apply-btn-wrap {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.stream-apply-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 9px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #ffffff;
  background: #18181B;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
  line-height: 1;
}

.stream-apply-btn:hover {
  background: #ff5e36;
  border-color: #ff5e36;
  box-shadow: 0 3px 8px rgba(255, 94, 54, 0.35);
  transform: scale(1.02);
}

.stream-material-row.is-selected .stream-apply-btn {
  background: #ff5e36;
  border-color: #ff5e36;
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

:global(html.dark) .drawer-materials-stream.is-table-stream .stream-material-row,
:global(html[data-color-mode="dark"]) .drawer-materials-stream.is-table-stream .stream-material-row {
  border-bottom-color: #121214;
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

:global(html.dark) .stream-apply-btn,
:global(html[data-color-mode="dark"]) .stream-apply-btn {
  background: #27272a;
  color: #f4f4f5;
  border-color: rgba(255, 255, 255, 0.15);
}

:global(html.dark) .stream-apply-btn:hover,
:global(html[data-color-mode="dark"]) .stream-apply-btn:hover {
  background: #ff5e36;
  border-color: #ff5e36;
  color: #ffffff;
}
</style>
