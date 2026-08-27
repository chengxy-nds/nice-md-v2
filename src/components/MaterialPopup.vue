<script setup>
import { ref, computed } from 'vue';
import { Sparkles, X, Check, ExternalLink, Globe, Search } from 'lucide-vue-next';
import { getMaterialTemplatesForKey, styleCategoryMap } from '../utils/materialLibrary';

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

const typeLabels = {
  body: '整体背景底纹',
  h1: 'H1 一级标题',
  h2: 'H2 二级标题',
  h3: 'H3 三级标题',
  h4: 'H4 四级标题',
  h5: 'H5 五级标题',
  h6: 'H6 六级标题',
  blockquote: '引用 / 金句卡片',
  hr: '分割线',
  ul: '无序列表 (UL)',
  ol: '有序列表 (OL)',
  li: '列表项 (LI)',
  header_widget: '文章头部导读卡',
  footer_widget: '文末三连/作者名片'
};

const titleText = computed(() => {
  return typeLabels[props.elementKey] || '素材样式';
});

const templateList = computed(() => {
  return getMaterialTemplatesForKey(props.elementKey);
});

function getStyleBadge(cat) {
  return styleCategoryMap[cat] || { name: '通用素材', color: '#52525B', bg: '#F4F4F5' };
}

// Category filter
const activeCategory = ref('all');
const searchQuery = ref('');

const categories = [
  { id: 'all', label: '全部模版' },
  { id: '135hot', label: '热门精选', match: (t) => t.styleCategory === '135hot' || t.styleCategory === '热门hot' || t.tag?.includes('热门') || t.tag?.includes('精选') || t.tag?.includes('爆款') },
  { id: 'fresh', label: '清新活力', match: (t) => t.styleCategory === 'fresh' || t.tag?.includes('清新') || t.tag?.includes('薄荷') || t.tag?.includes('夏风') || t.tag?.includes('手账') || t.tag?.includes('便签') },
  { id: 'business', label: '商务科技', match: (t) => t.styleCategory === 'business' || t.tag?.includes('商务') || t.tag?.includes('双色') || t.tag?.includes('时间轴') || t.tag?.includes('彩卡') },
  { id: 'guofeng', label: '国风古韵', match: (t) => t.styleCategory === 'guofeng' || t.tag?.includes('国风') || t.tag?.includes('水墨') || t.tag?.includes('古风') || t.tag?.includes('宣纸') },
  { id: 'minimal', label: '极简大刊', match: (t) => t.styleCategory === 'minimal' || t.tag?.includes('极简') || t.tag?.includes('莫兰迪') || t.tag?.includes('大刊') || t.tag?.includes('杂志') || t.id === 'none' },
  { id: 'tech', label: '极客代码', match: (t) => t.styleCategory === 'tech' || t.tag?.includes('极客') || t.tag?.includes('代码') || t.tag?.includes('赛博') || t.tag?.includes('终端') }
];

const filteredList = computed(() => {
  let list = templateList.value || [];
  if (activeCategory.value !== 'all') {
    const cat = categories.find(c => c.id === activeCategory.value);
    if (cat?.match) {
      list = list.filter(t => t.id === 'none' || cat.match(t));
    }
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(t => (t.name || '').toLowerCase().includes(q) || (t.tag || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
  }
  return list;
});

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
    <div v-if="visible" class="material-popup-mask" @click.self="emit('close')">
      <div class="material-popup-modal">
        <!-- Header -->
        <div class="popup-header">
          <div class="header-title-group">
            <div class="header-icon">
              <Sparkles size="14" />
            </div>
            <div>
              <div class="popup-title-row">
                <span class="popup-title">选择 {{ titleText }} 素材模版</span>
                <span class="global-scope-pill" title="选定后将统一自动应用至全篇所有此标签元素">
                  <Globe size="11" />
                  <span>全局统一应用</span>
                </span>
              </div>
            </div>
          </div>

          <div class="header-right-tools">
            <!-- Inline prefix config if applicable -->
            <div v-if="hasPrefixOption(props.currentMaterialId)" class="inline-prefix-box">
              <span class="prefix-label">标牌前缀:</span>
              <input
                type="text"
                :value="props.currentPrefix || (props.elementKey === 'h1' ? 'PART' : 'SECTION')"
                @input="handlePrefixChange"
                placeholder="PART"
                class="prefix-input"
              />
            </div>

            <div class="search-input-wrap">
              <Search size="13" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索模版名称..."
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
                <X size="11" />
              </button>
            </div>

            <button class="modal-close-btn" @click="emit('close')" title="关闭 (Esc)">
              <X size="14" />
            </button>
          </div>
        </div>

        <!-- Category Filter Bar (Flat Tabs) -->
        <div class="popup-filter-bar">
          <div class="filter-tabs">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="filter-tab-btn"
              :class="{ 'is-active': activeCategory === cat.id }"
              @click="activeCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <!-- Materials Grid (Identical cards to Material Center) -->
        <div class="popup-grid-container">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="mc-card"
            :class="{ 'is-selected-card': (props.currentMaterialId || 'none') === item.id }"
            @click="handleSelect(item.id)"
          >
            <!-- Card Header Bar with Badges -->
            <div class="mc-card-header">
              <div class="mc-card-badges">
                <!-- Style Badge -->
                <span
                  v-if="item.styleCategory"
                  class="mc-badge-style"
                  :style="{
                    color: getStyleBadge(item.styleCategory).color,
                    backgroundColor: getStyleBadge(item.styleCategory).bg
                  }"
                >
                  {{ getStyleBadge(item.styleCategory).name }}
                </span>

                <!-- Category/Tag Badge -->
                <span class="mc-badge-category">
                  {{ item.tag || (item.id === 'none' ? '默认' : '精选') }}
                </span>
              </div>

              <!-- Selected indicator or ID -->
              <span v-if="(props.currentMaterialId || 'none') === item.id" class="mc-selected-pill">
                <Check size="11" />
                <span>已选用</span>
              </span>
              <span v-else class="mc-card-quick-id">#{{ item.id }}</span>
            </div>

            <!-- Material Live Render Area -->
            <div class="mc-card-preview">
              <div class="mc-render-paper" v-html="item.previewHtml"></div>
            </div>

            <!-- Card Metadata Footer -->
            <div class="mc-card-footer">
              <h4 class="mc-card-title" :title="item.name">{{ item.name }}</h4>
            </div>

            <!-- Sleek Dark Frosted Glass Hover Overlay (same as MaterialCenter.vue) -->
            <div class="mc-card-overlay">
              <div class="mc-overlay-info">
                <div class="mc-overlay-title">{{ item.name }}</div>
                <div class="mc-overlay-cat">
                  {{ getStyleBadge(item.styleCategory).name }} · {{ item.tag || '素材模版' }}
                </div>
              </div>
              <div class="mc-overlay-actions">
                <button
                  class="mc-overlay-btn primary"
                  @click.stop="handleSelect(item.id)"
                >
                  <Check v-if="(props.currentMaterialId || 'none') === item.id" size="12" />
                  <span>{{ (props.currentMaterialId || 'none') === item.id ? '当前已选用' : '选用此模版' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.material-popup-mask {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  animation: modalFadeIn 0.15s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.material-popup-modal {
  position: relative;
  width: 880px;
  max-width: 95vw;
  max-height: 85vh;
  background: var(--bg-app, #F8F8F8);
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans, 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif);
}

.popup-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  height: 3.25rem;
  border-bottom: 1px solid var(--border-color, #EDEDED);
  background: #ffffff;
  gap: 0.75rem;
  flex-shrink: 0;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.header-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  background: #3d3939;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.popup-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.popup-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main, #18181B);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.global-scope-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: #16a34a;
  background: #edfdf2;
  padding: 0.0625rem 0.4375rem;
  border-radius: 3px;
  line-height: 1;
}

/* Category Filter Bar (Flat Tabs) */
.popup-filter-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color, #EDEDED);
  gap: 0.75rem;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem;
  background: #F4F4F5;
  border-radius: 6px;
  overflow-x: auto;
}

.filter-tab-btn {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #71717A;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  user-select: none;
}

.filter-tab-btn:hover {
  color: #18181B;
  background: #E4E4E7;
}

.filter-tab-btn.is-active {
  background: var(--btn-primary-bg, #3d3939);
  color: #ffffff;
  font-weight: 600;
}

.header-right-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 150px;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  color: #A1A1AA;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 2rem;
  padding-left: 1.75rem;
  padding-right: 1.5rem;
  font-size: 0.75rem;
  border: 1px solid var(--border-color, #EDEDED);
  border-radius: 6px;
  background: #ffffff;
  color: #18181B;
  outline: none;
  transition: all 0.15s ease;
}

.search-input:focus {
  border-color: #3d3939;
  width: 175px;
}

.clear-search-btn {
  position: absolute;
  right: 0.375rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #F4F4F5;
  border: none;
  color: #71717A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inline-prefix-box {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #F4F4F5;
  padding: 0.1875rem 0.5rem;
  border-radius: 6px;
}

.prefix-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #52525B;
}

.prefix-input {
  width: 3.5rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  border: 1px solid #D4D4D8;
  border-radius: 4px;
  color: #18181B;
  outline: none;
  background: #ffffff;
}

.modal-close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  background: #ffffff;
  color: #71717A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: #F4F4F5;
  color: #09090B;
}

/* Materials Grid Container */
.popup-grid-container {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0.875rem 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
  background: var(--bg-app, #F8F8F8);
}

.popup-grid-container::-webkit-scrollbar {
  width: 0.25rem;
}

.popup-grid-container::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

/* ── Material Card (Exact same structure as MaterialCenter.vue) ── */
.mc-card {
  position: relative;
  background: #ffffff;
  border: 1px solid var(--border-color, #EDEDED);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 150px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.mc-card:hover {
  border-color: #3d3939;
  transform: translateY(-1px);
}

.mc-card.is-selected-card {
  border-color: #ff5e36;
  box-shadow: 0 0 0 1px #ff5e36, 0 4px 14px rgba(255, 94, 54, 0.28);
}

.mc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4375rem 0.625rem;
  background: #FAFAFA;
  border-bottom: 1px solid #EDEDED;
}

.mc-card-badges {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  flex-wrap: wrap;
}

.mc-badge-style {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.4375rem;
  border-radius: 3px;
  border: none;
  letter-spacing: 0.01em;
}

.mc-badge-category {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.125rem 0.4375rem;
  border-radius: 3px;
  background: #F4F4F5;
  color: #52525B;
  border: none;
}

.mc-card-quick-id {
  font-size: 0.625rem;
  font-family: monospace;
  color: #A1A1AA;
}

.mc-selected-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: #ffffff;
  background: #ff5e36;
  padding: 0.0625rem 0.375rem;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(255, 94, 54, 0.25);
}

/* Material Preview Area */
.mc-card-preview {
  flex: 1;
  width: 100%;
  padding: 0.875rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #ffffff;
}

.mc-render-paper {
  width: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Card Metadata Footer */
.mc-card-footer {
  padding: 0.4375rem 0.625rem;
  background: #ffffff;
  border-top: 1px solid #F4F4F5;
}

.mc-card-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #18181B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sleek Dark Frosted Hover Overlay */
.mc-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(24, 24, 27, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  pointer-events: none;
  border-radius: 6px;
  transition: opacity 0.18s ease;
  z-index: 10;
}

.mc-card:hover .mc-card-overlay {
  opacity: 1;
  pointer-events: auto;
}

.mc-overlay-info {
  text-align: center;
  margin-bottom: 0.625rem;
}

.mc-overlay-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 0.125rem;
}

.mc-overlay-cat {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
}

.mc-overlay-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mc-overlay-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  height: 2rem;
  padding: 0 0.875rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  transition: all 0.15s ease;
  user-select: none;
}

.mc-overlay-btn.primary {
  background: #FFFFFF;
  color: #18181B;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mc-overlay-btn.primary:hover {
  background: #F4F4F5;
  color: #000000;
}

/* ── Dark Mode ── */
:global(html.dark) .material-popup-modal,
:global(html[data-color-mode="dark"]) .material-popup-modal {
  background: var(--bg-card, #1e1e1e);
}

:global(html.dark) .popup-header,
:global(html[data-color-mode="dark"]) .popup-header {
  background: var(--bg-card, #1e1e1e);
  border-bottom-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .popup-filter-bar,
:global(html[data-color-mode="dark"]) .popup-filter-bar {
  background: var(--bg-card, #1e1e1e);
  border-bottom-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-card,
:global(html[data-color-mode="dark"]) .mc-card {
  background: var(--bg-card, #252526);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-card-header,
:global(html[data-color-mode="dark"]) .mc-card-header {
  background: #18181b;
  border-bottom-color: #27272a;
}
</style>
