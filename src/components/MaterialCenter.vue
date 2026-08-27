<script setup>
import { ref, computed } from 'vue';
import {
  Search,
  Check,
  ArrowLeft,
  X,
  Copy,
  Plus,
  Sparkles,
  Boxes,
  Heading,
  Quote,
  AlertCircle,
  Minus,
  ListOrdered,
  UserCheck,
  LayoutGrid,
  Palette,
  Code,
  Table,
  Filter,
  Tag,
  RotateCcw
} from 'lucide-vue-next';
import {
  materialCategories,
  styleCategories,
  styleCategoryMap,
  categoryNameMap,
  materials
} from '../utils/materialLibrary';
import { soundEngine } from '../utils/synthAudio';
import confetti from 'canvas-confetti';

const emit = defineEmits(['back-to-editor', 'insert-material', 'apply-background']);

const searchQuery = ref('');
const activeCategory = ref('all');
const activeStyle = ref('all');
const copiedId = ref(null);

const categoryIcons = {
  all: Boxes,
  backgrounds: LayoutGrid,
  headings: Heading,
  quotes: Quote,
  callouts: AlertCircle,
  lists: ListOrdered,
  tech_cards: Code,
  tables: Table,
  dividers: Minus,
  header_widgets: Sparkles,
  footer_widgets: UserCheck
};

const filteredMaterials = computed(() => {
  return materials.filter(m => {
    const matchesCat = activeCategory.value === 'all' || m.category === activeCategory.value;
    const matchesStyle = activeStyle.value === 'all' || m.styleCategory === activeStyle.value;
    const q = searchQuery.value.trim().toLowerCase();
    const matchesQuery = !q ||
      (m.title && m.title.toLowerCase().includes(q)) ||
      (m.tag && m.tag.toLowerCase().includes(q)) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCat && matchesStyle && matchesQuery;
  });
});

const isFiltered = computed(() => {
  return activeCategory.value !== 'all' || activeStyle.value !== 'all' || !!searchQuery.value.trim();
});

function resetFilters() {
  activeCategory.value = 'all';
  activeStyle.value = 'all';
  searchQuery.value = '';
  soundEngine.playClick();
}

function getStyleBadge(styleKey) {
  return styleCategoryMap[styleKey] || {
    name: '精选风格',
    color: '#475569',
    bg: '#f8fafc',
    border: '#e2e8f0'
  };
}

async function handleCopy(mat) {
  try {
    await navigator.clipboard.writeText(mat.html);
    soundEngine.playChime();
    copiedId.value = mat.id;
    setTimeout(() => {
      if (copiedId.value === mat.id) copiedId.value = null;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy HTML:', err);
  }
}

function handleInsert(mat) {
  soundEngine.playChime();
  confetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.6 }
  });
  emit('insert-material', mat.html);
}

function handleApplyBackground(mat) {
  soundEngine.playChime();
  confetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.6 }
  });
  emit('apply-background', mat);
}
</script>

<template>
  <div class="mc-root">
    <!-- Ambient subtle space light -->
    <div class="mc-glow mc-glow-a"></div>
    <div class="mc-glow mc-glow-b"></div>

    <!-- Header -->
    <header class="mc-header">
      <div class="mc-header-left">
        <button class="mc-back-btn" @click="emit('back-to-editor')">
          <ArrowLeft size="15" />
          <span>返回编辑器</span>
        </button>
        <span class="mc-divider"></span>
        <div class="mc-title-group">
          <span class="mc-title-badge">
            <Sparkles size="14" />
          </span>
          <h1 class="mc-title">素材中心</h1>
          <span class="mc-count">{{ filteredMaterials.length }} 款排版素材</span>
        </div>
      </div>

      <div class="mc-search-box">
        <Search size="14" class="mc-search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索素材名称、标签（如：清新、手账、国风、极客...）"
        />
        <button v-if="searchQuery" class="mc-clear-btn" @click="searchQuery = ''">
          <X size="13" />
        </button>
      </div>
    </header>

    <!-- Content Workspace -->
    <main class="mc-content">
      <!-- Filter Control Section -->
      <div class="mc-filter-panel">
        <!-- Element Type Filter Row -->
        <div class="mc-filter-row">
          <span class="mc-filter-label">
            <Boxes size="12" />
            <span>素材类型</span>
          </span>
          <nav class="mc-tabs">
            <button
              v-for="cat in materialCategories"
              :key="cat.id"
              class="mc-tab"
              :class="{ 'is-active': activeCategory === cat.id }"
              @click="activeCategory = cat.id; soundEngine.playClick();"
            >
              <component :is="categoryIcons[cat.id] || Boxes" size="12" />
              <span>{{ cat.name }}</span>
            </button>
          </nav>
        </div>

        <!-- Style Filter Row -->
        <div class="mc-filter-row">
          <span class="mc-filter-label">
            <Palette size="12" />
            <span>视觉风格</span>
          </span>
          <nav class="mc-tabs style-tabs">
            <button
              v-for="st in styleCategories"
              :key="st.id"
              class="mc-tab style-tab"
              :class="{ 'is-active': activeStyle === st.id }"
              @click="activeStyle = st.id; soundEngine.playClick();"
            >
              <span>{{ st.name }}</span>
            </button>
          </nav>
        </div>

        <!-- Active Filter Indicator Bar -->
        <div v-if="isFiltered" class="mc-active-filters">
          <span class="mc-filter-summary">
            <span>当前筛选：</span>
            <span v-if="activeCategory !== 'all'" class="mc-filter-chip">
              类型: {{ materialCategories.find(c => c.id === activeCategory)?.name }}
              <X size="10" @click="activeCategory = 'all'" />
            </span>
            <span v-if="activeStyle !== 'all'" class="mc-filter-chip">
              风格: {{ styleCategories.find(s => s.id === activeStyle)?.name }}
              <X size="10" @click="activeStyle = 'all'" />
            </span>
            <span v-if="searchQuery.trim()" class="mc-filter-chip">
              搜索: "{{ searchQuery }}"
              <X size="10" @click="searchQuery = ''" />
            </span>
          </span>
          <button class="mc-reset-btn" @click="resetFilters">
            <RotateCcw size="11" />
            <span>重置筛选</span>
          </button>
        </div>
      </div>

      <!-- Materials Grid -->
      <div class="mc-grid">
        <div
          v-for="mat in filteredMaterials"
          :key="mat.id"
          class="mc-card"
        >
          <!-- Card Header Bar with Badges -->
          <div class="mc-card-header">
            <div class="mc-card-badges">
              <!-- Style Badge -->
              <span
                class="mc-badge-style"
                :style="{
                  color: getStyleBadge(mat.styleCategory).color,
                  backgroundColor: getStyleBadge(mat.styleCategory).bg
                }"
              >
                {{ getStyleBadge(mat.styleCategory).name }}
              </span>

              <!-- Category Badge -->
              <span class="mc-badge-category">
                {{ categoryNameMap[mat.category] || mat.category }}
              </span>

              <!-- Specific Tag Badge -->
              <span
                v-if="mat.tag"
                class="mc-badge-tag"
                @click.stop="searchQuery = mat.tag"
                title="点击按此标签快速筛选"
              >
                {{ mat.tag }}
              </span>
            </div>

            <!-- Material Short ID / Copy icon -->
            <span class="mc-card-quick-id">#{{ mat.id }}</span>
          </div>

          <!-- Pure Material Live Render Area -->
          <div class="mc-card-preview">
            <div class="mc-render-paper" v-html="mat.html"></div>
          </div>

          <!-- Card Metadata Footer (Minimalist & Clean) -->
          <div class="mc-card-footer">
            <h4 class="mc-card-title" :title="mat.title">{{ mat.title }}</h4>
          </div>

          <!-- Elegant Frosted Glass Hover Overlay -->
          <div class="mc-card-overlay">
            <div class="mc-overlay-info">
              <div class="mc-overlay-title">{{ mat.title }}</div>
              <div class="mc-overlay-cat">
                {{ categoryNameMap[mat.category] }} · {{ getStyleBadge(mat.styleCategory).name }}
              </div>
            </div>
            <div class="mc-overlay-actions" @click.stop>
              <!-- Category is backgrounds -->
              <template v-if="mat.category === 'backgrounds'">
                <button
                  class="mc-overlay-btn primary"
                  @click="handleApplyBackground(mat)"
                  title="套用为当前文章整体背景底纹"
                >
                  <Palette size="13" />
                  <span>套用为整体背景</span>
                </button>
                <button
                  class="mc-overlay-btn secondary"
                  @click="handleCopy(mat)"
                  title="复制素材 HTML"
                >
                  <Check v-if="copiedId === mat.id" size="13" />
                  <Copy v-else size="13" />
                  <span>{{ copiedId === mat.id ? '已复制' : '复制' }}</span>
                </button>
              </template>

              <!-- Other categories: headings, quotes, callouts, dividers, lists, widgets, etc. -->
              <template v-else>
                <button
                  class="mc-overlay-btn primary"
                  @click="handleInsert(mat)"
                  title="插入到当前编辑器"
                >
                  <Plus size="13" />
                  <span>插入编辑器</span>
                </button>
                <button
                  class="mc-overlay-btn secondary"
                  @click="handleCopy(mat)"
                  title="复制素材 HTML"
                >
                  <Check v-if="copiedId === mat.id" size="13" />
                  <Copy v-else size="13" />
                  <span>{{ copiedId === mat.id ? '已复制' : '复制' }}</span>
                </button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="filteredMaterials.length === 0" class="mc-empty">
          <Boxes size="36" class="mc-empty-icon" />
          <p>暂无找到匹配的排版素材</p>
          <button class="mc-empty-reset-btn" @click="resetFilters">
            <RotateCcw size="13" />
            <span>清空筛选条件</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.mc-root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--bg-app, #F8F8F8);
  color: var(--text-main, #222222);
  font-family: var(--font-sans, 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif);
  overflow: hidden;
}

/* Ambient subtle space light */
.mc-glow {
  display: none;
}

/* Header (高度 48px，扁平紧凑) */
.mc-header {
  position: relative;
  z-index: 2;
  height: 3.25rem;
  padding: 0 1.25rem;
  background: var(--bg-card, #FFFFFF);
  border-bottom: 1px solid var(--border-color, #EDEDED);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.mc-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mc-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding: 0 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #222222);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.mc-back-btn:hover {
  background: #F4F4F5;
  color: #000000;
}

.mc-divider {
  width: 1px;
  height: 1.125rem;
  background: var(--border-color, #EDEDED);
}

.mc-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mc-title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  color: #ffffff;
  background: #3d3939;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mc-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main, #222222);
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.mc-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #16a34a;
  background: #edfdf2;
  padding: 0.0625rem 0.4375rem;
  border-radius: 4px;
}

.mc-search-box {
  position: relative;
  width: 17.5rem;
  height: 2rem;
  display: flex;
  align-items: center;
}

.mc-search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
  transition: color 0.2s ease;
}

.mc-search-box input {
  width: 100%;
  height: 100%;
  padding: 0 1.875rem 0 2rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #222222);
  font-size: 0.75rem;
  font-weight: 500;
  outline: none;
  transition: all 0.15s ease;
}

.mc-search-box input::placeholder {
  color: #A1A1AA;
}

.mc-search-box input:focus {
  border-color: #3d3939;
  background: #ffffff;
}

.mc-clear-btn {
  position: absolute;
  right: 0.5rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: #F4F4F5;
  border: none;
  color: var(--text-muted, #71717A);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.mc-clear-btn:hover {
  background: #E4E4E7;
  color: #09090B;
}

/* Content Area */
.mc-content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 2.5rem 1.25rem;
}

.mc-content::-webkit-scrollbar {
  width: 0.25rem;
}

.mc-content::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

/* Filter Control Panel (扁平化无厚重感) */
.mc-filter-panel {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-color, #EDEDED);
  border-radius: 6px;
}

.mc-filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow-x: auto;
}

.mc-filter-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #52525B;
  min-width: 4.5rem;
  flex-shrink: 0;
  user-select: none;
}

/* Category Tabs (扁平微圆角切换标签) */
.mc-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem;
  background: #F4F4F5;
  border-radius: 6px;
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
}

.mc-tabs::-webkit-scrollbar {
  display: none;
}

.mc-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.3125rem 0.625rem;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #71717A;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.mc-tab:hover {
  color: #18181B;
  background: #E4E4E7;
}

.mc-tab.is-active {
  background: var(--btn-primary-bg, #3d3939);
  color: #ffffff;
  font-weight: 600;
}

.mc-tab-emoji {
  font-size: 0.8125rem;
  line-height: 1;
}

/* Active Filter Summary Bar */
.mc-active-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px dashed #EDEDED;
  font-size: 0.75rem;
}

.mc-filter-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  color: #71717A;
  font-size: 0.6875rem;
}

.mc-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #F4F4F5;
  color: #18181B;
  border: 1px solid #E4E4E7;
  padding: 0.125rem 0.4375rem;
  border-radius: 4px;
  font-weight: 500;
}

.mc-filter-chip svg {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.mc-filter-chip svg:hover {
  opacity: 1;
  color: #ef4444;
}

.mc-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 1px solid #E4E4E7;
  color: #71717A;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.1875rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.mc-reset-btn:hover {
  background: #FEE2E2;
  color: #B91C1C;
  border-color: #FCA5A5;
}

/* Grid */
.mc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

/* Card (6px 扁平克制圆角，1px 精准细边框) */
.mc-card {
  position: relative;
  background: #ffffff;
  border: 1px solid var(--border-color, #EDEDED);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 155px;
  cursor: pointer;
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.mc-card:hover {
  border-color: #3d3939;
  transform: translateY(-1px);
}

/* Card Header with Badges */
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

.mc-badge-tag {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.125rem 0.4375rem;
  border-radius: 3px;
  background: #F4F4F5;
  color: #27272A;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.mc-badge-tag:hover {
  background: #E4E4E7;
  color: #09090B;
}

.mc-card-quick-id {
  font-size: 0.625rem;
  font-family: monospace;
  color: #A1A1AA;
}

/* Pure Material Preview Area */
.mc-card-preview {
  flex: 1;
  width: 100%;
  padding: 1rem 0.75rem;
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
  padding: 0.5rem 0.625rem;
  background: #ffffff;
  border-top: 1px solid #EDEDED;
}

.mc-card-title-row {
  margin-bottom: 0.125rem;
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

.mc-card-desc {
  margin: 0 0 0.3125rem 0;
  font-size: 0.6875rem;
  color: #71717A;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mc-card-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.mc-tag-pill {
  font-size: 0.625rem;
  color: #71717A;
  background: #F4F4F5;
  border: 1px solid #E4E4E7;
  padding: 0 0.25rem;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}

.mc-tag-pill:hover {
  background: #EFF6FF;
  color: #2563EB;
  border-color: #BFDBFE;
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
  margin-bottom: 0.75rem;
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

/* Flat Overlay Buttons */
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

/* Primary Button on Dark Overlay */
.mc-overlay-btn.primary {
  background: #FFFFFF;
  color: #18181B;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mc-overlay-btn.primary:hover {
  background: #F4F4F5;
  color: #000000;
}

/* Secondary Button on Dark Overlay */
.mc-overlay-btn.secondary {
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
}

.mc-overlay-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
}

.mc-empty {
  grid-column: 1 / -1;
  padding: 3.75rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #71717A);
  font-size: 0.8125rem;
}

.mc-empty-icon {
  margin-bottom: 0.625rem;
  opacity: 0.4;
}

.mc-empty-reset-btn {
  margin-top: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  border: 1px solid #EDEDED;
  background: #ffffff;
  color: #18181B;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.mc-empty-reset-btn:hover {
  background: #F4F4F5;
}

/* ── Dark Mode (深色模式全面适配) ── */
:global(html.dark) .mc-root,
:global(html[data-color-mode="dark"]) .mc-root {
  background: var(--bg-app, #18181c);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .mc-header,
:global(html[data-color-mode="dark"]) .mc-header {
  background: var(--bg-card, #1e1e1e);
  border-bottom-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-filter-panel,
:global(html[data-color-mode="dark"]) .mc-filter-panel {
  background: var(--bg-card, #252526);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-filter-label,
:global(html[data-color-mode="dark"]) .mc-filter-label {
  color: #94a3b8;
}

:global(html.dark) .mc-title-badge,
:global(html[data-color-mode="dark"]) .mc-title-badge {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .mc-title,
:global(html[data-color-mode="dark"]) .mc-title {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .mc-back-btn,
:global(html[data-color-mode="dark"]) .mc-back-btn {
  background: var(--bg-toolbar, #2d2d2d);
  border-color: var(--border-color, #37373d);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .mc-back-btn:hover,
:global(html[data-color-mode="dark"]) .mc-back-btn:hover {
  background: var(--bg-capsule-btn-hover, #37373d);
  color: #ffffff;
}

:global(html.dark) .mc-search-box input,
:global(html[data-color-mode="dark"]) .mc-search-box input {
  background: var(--bg-card, #252526);
  border-color: var(--border-color, #37373d);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .mc-tabs,
:global(html[data-color-mode="dark"]) .mc-tabs {
  background: var(--bg-toolbar, #1e1e1e);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-tab,
:global(html[data-color-mode="dark"]) .mc-tab {
  color: #94a3b8;
}

:global(html.dark) .mc-tab:hover,
:global(html[data-color-mode="dark"]) .mc-tab:hover {
  background: #2d2d2d;
  color: #ffffff;
}

:global(html.dark) .mc-tab.is-active,
:global(html[data-color-mode="dark"]) .mc-tab.is-active {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .mc-card,
:global(html[data-color-mode="dark"]) .mc-card {
  background: var(--bg-card, #1e1e1e);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-card-header,
:global(html[data-color-mode="dark"]) .mc-card-header {
  background: #252526;
  border-bottom-color: #2d2d2d;
}

:global(html.dark) .mc-card-footer,
:global(html[data-color-mode="dark"]) .mc-card-footer {
  background: #1e1e1e;
  border-top-color: #2d2d2d;
}

:global(html.dark) .mc-card-title,
:global(html[data-color-mode="dark"]) .mc-card-title {
  color: #f1f5f9;
}

:global(html.dark) .mc-badge-category,
:global(html[data-color-mode="dark"]) .mc-badge-category {
  background: #2d2d2d;
  color: #94a3b8;
  border-color: #37373d;
}

:global(html.dark) .mc-badge-tag,
:global(html[data-color-mode="dark"]) .mc-badge-tag {
  background: #2d2d2d;
  color: #e2e8f0;
  border-color: #37373d;
}

:global(html.dark) .mc-tag-pill,
:global(html[data-color-mode="dark"]) .mc-tag-pill {
  background: #252526;
  color: #94a3b8;
  border-color: #2d2d2d;
}

:global(html.dark) .mc-card-preview,
:global(html[data-color-mode="dark"]) .mc-card-preview {
  background: var(--bg-card, #1e1e1e);
}

:global(html.dark) .mc-card-overlay,
:global(html[data-color-mode="dark"]) .mc-card-overlay {
  background: rgba(18, 18, 22, 0.88);
}

:global(html.dark) .mc-overlay-title,
:global(html[data-color-mode="dark"]) .mc-overlay-title {
  color: #ffffff;
}

:global(html.dark) .mc-overlay-btn.primary,
:global(html[data-color-mode="dark"]) .mc-overlay-btn.primary {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .mc-overlay-btn.secondary,
:global(html[data-color-mode="dark"]) .mc-overlay-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}
</style>
