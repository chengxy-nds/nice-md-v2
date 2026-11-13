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
  Underline,
  RotateCcw,
  Eye
} from '@lucide/vue';
import {
  materialCategories,
  styleCategories,
  styleCategoryMap,
  categoryNameMap,
  materials
} from '../utils/materialLibrary';
import { soundEngine } from '../utils/synthAudio';
import { fireConfetti } from '../utils/celebrate';

const emit = defineEmits(['back-to-editor', 'insert-material', 'apply-background']);

const searchQuery = ref('');
const activeCategory = ref('all');
const activeStyle = ref('all');
const copiedId = ref(null);
const selectedPreview = ref(null);

const categoryIcons = {
  all: Boxes,
  backgrounds: LayoutGrid,
  headings: Heading,
  quotes: Quote,
  callouts: AlertCircle,
  lists: ListOrdered,
  tech_cards: Code,
  tables: Table,
  underlines: Underline,
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

function openPreview(mat) {
  selectedPreview.value = mat;
}

function closePreview() {
  selectedPreview.value = null;
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
  void fireConfetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.6 }
  });
  emit('insert-material', mat.html);
}

function handleApplyBackground(mat) {
  soundEngine.playChime();
  void fireConfetti({
    particleCount: 60,
    spread: 50,
    origin: { y: 0.6 }
  });
  emit('apply-background', mat);
}
</script>

<template>
  <div class="mc-root" @keydown.esc.window="closePreview">
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
          <span class="mc-count">{{ filteredMaterials.length }} 个素材</span>
        </div>
      </div>

      <div class="mc-search-box">
        <Search size="14" class="mc-search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索素材名称或标签"
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
          <span class="mc-filter-label">素材类型</span>
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
          <span class="mc-filter-label">视觉风格</span>
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
          <!-- Live render is also the entry point to a larger preview. -->
          <div
            class="mc-card-preview"
            role="button"
            tabindex="0"
            :aria-label="`预览素材：${mat.title}`"
            @click="openPreview(mat)"
            @keydown.enter.prevent="openPreview(mat)"
            @keydown.space.prevent="openPreview(mat)"
          >
            <div class="mc-render-stage">
              <div class="mc-render-paper" v-html="mat.html"></div>
            </div>
            <span class="mc-preview-trigger" aria-hidden="true">
              <Eye size="13" />
              <span>预览</span>
            </span>
          </div>

          <!-- One quiet metadata line replaces the stack of badges. -->
          <div class="mc-card-footer">
            <div class="mc-card-meta">
              <h4 class="mc-card-title" :title="mat.title" data-tooltip-truncated="true">{{ mat.title }}</h4>
              <p class="mc-card-kind">
                <span>{{ categoryNameMap[mat.category] || mat.category }}</span>
                <span v-if="styleCategoryMap[mat.styleCategory]">· {{ styleCategoryMap[mat.styleCategory].name }}</span>
              </p>
            </div>
            <div class="mc-card-actions" @click.stop>
              <button
                class="mc-card-action"
                :aria-label="mat.category === 'backgrounds' ? '应用背景素材' : '插入到编辑器'"
                :title="mat.category === 'backgrounds' ? '应用为文章背景' : '插入到编辑器'"
                @click="mat.category === 'backgrounds' ? handleApplyBackground(mat) : handleInsert(mat)"
              >
                <Palette v-if="mat.category === 'backgrounds'" size="14" />
                <Plus v-else size="15" />
              </button>
              <button
                class="mc-card-action"
                :aria-label="copiedId === mat.id ? '已复制素材' : '复制素材 HTML'"
                :title="copiedId === mat.id ? '已复制' : '复制素材 HTML'"
                @click="handleCopy(mat)"
              >
                <Check v-if="copiedId === mat.id" size="14" />
                <Copy v-else size="14" />
              </button>
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

    <Teleport to="body">
      <div
        v-if="selectedPreview"
        class="mc-preview-modal-backdrop"
        role="presentation"
        @click.self="closePreview"
      >
        <section
          class="mc-preview-modal"
          :class="{
            'is-wide': ['backgrounds', 'callouts', 'lists', 'tech_cards', 'tables'].includes(selectedPreview.category),
            'is-compact': ['headings', 'underlines', 'dividers', 'footer_widgets'].includes(selectedPreview.category)
          }"
          role="dialog"
          aria-modal="true"
          :aria-label="`素材预览：${selectedPreview.title}`"
        >
          <header class="mc-preview-modal-header">
            <div class="mc-preview-modal-heading">
              <h2>{{ selectedPreview.title }}</h2>
              <p>
                {{ categoryNameMap[selectedPreview.category] || selectedPreview.category }}
                <span v-if="styleCategoryMap[selectedPreview.styleCategory]">· {{ styleCategoryMap[selectedPreview.styleCategory].name }}</span>
              </p>
            </div>
            <button class="mc-preview-modal-close" aria-label="关闭预览" title="关闭预览" @click="closePreview">
              <X size="17" />
            </button>
          </header>
          <div class="mc-preview-modal-content">
            <div class="mc-preview-modal-render" v-html="selectedPreview.html"></div>
          </div>
          <footer class="mc-preview-modal-footer">
            <button
              class="mc-modal-secondary"
              :class="{ 'is-copied': copiedId === selectedPreview.id }"
              @click="handleCopy(selectedPreview)"
            >
              <Check v-if="copiedId === selectedPreview.id" size="14" />
              <Copy v-else size="14" />
              {{ copiedId === selectedPreview.id ? '已复制' : '复制 HTML' }}
            </button>
            <button
              class="mc-modal-primary"
              @click="selectedPreview.category === 'backgrounds' ? handleApplyBackground(selectedPreview) : handleInsert(selectedPreview)"
            >
              <Palette v-if="selectedPreview.category === 'backgrounds'" size="14" />
              <Plus v-else size="14" />
              {{ selectedPreview.category === 'backgrounds' ? '应用背景' : '插入编辑器' }}
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
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
  height: 3.75rem;
  padding: 0 1.5rem;
  background: var(--bg-card, #FFFFFF);
  border-bottom: 1px solid var(--border-color, #EDEDED);
  display: flex;
  align-items: flex-start;
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
  height: 2.125rem;
  padding: 0 0.625rem 0 0;
  border-radius: 5px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.mc-back-btn:hover {
  background: #f5f7fa;
  color: #1e293b;
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
  width: 1.25rem;
  height: 1.5rem;
  border-radius: 0;
  color: #52657f;
  background: transparent;
  border: 0;
}

.mc-title {
  font-size: 1rem;
  font-weight: 650;
  color: var(--text-main, #222222);
  margin: 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.mc-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: #718096;
  background: transparent;
  padding: 0 0.25rem;
}

.mc-search-box {
  position: relative;
  width: clamp(16rem, 23vw, 22rem);
  height: 2.25rem;
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
  border: 1px solid #dce3ec;
  background: #f8fafc;
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
  border-color: #8ab4e8;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 112, 204, 0.08);
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
  padding: 1.125rem 1.5rem 2.5rem;
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
  gap: 0;
  margin-bottom: 1.125rem;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
}

.mc-filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  overflow-x: auto;
  min-width: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mc-filter-row + .mc-filter-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e8edf3;
}

.mc-filter-row::-webkit-scrollbar {
  display: none;
}

.mc-filter-label {
  display: inline-flex;
  align-items: center;
  gap: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #718096;
  min-width: 4rem;
  flex-shrink: 0;
  user-select: none;
}

/* Category Tabs (扁平微圆角切换标签) */
.mc-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  background: transparent;
  border-radius: 0;
  width: auto;
  max-width: calc(100% - 5rem);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mc-tabs::-webkit-scrollbar {
  display: none;
}

.mc-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.4375rem 0.625rem;
  border-radius: 5px;
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
  color: #1f2937;
  background: #f1f5f9;
}

.mc-tab.is-active {
  background: #eaf2fc;
  color: #1769bd;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.125rem;
}

/* Compact cards: the rendered material leads, with actions kept in one calm footer. */
.mc-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
  cursor: default;
  transition: border-color 0.16s ease;
}

.mc-card:hover {
  border-color: #b8cbe2;
}

.mc-card:focus-within {
  border-color: #8ab4e8;
  outline: 2px solid rgba(37, 112, 204, 0.12);
  outline-offset: 1px;
}

/* Live preview */
.mc-card-preview {
  position: relative;
  flex: 0 0 11rem;
  width: 100%;
  height: 11rem;
  padding: 0;
  box-sizing: border-box;
  background: #ffffff;
  overflow: hidden;
  cursor: zoom-in;
  outline: none;
}

.mc-card-preview::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(15, 23, 42, 0.5);
  opacity: 0;
  transition: opacity 0.16s ease;
  pointer-events: none;
}

.mc-card-preview:focus-visible {
  box-shadow: inset 0 0 0 2px #75a7dc;
}

.mc-preview-trigger {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 2.25rem;
  padding: 0 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 5px;
  background: #ffffff;
  color: #1e293b;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  transform: translate(-50%, calc(-50% + 4px));
  transition: opacity 0.16s ease, transform 0.16s ease, background 0.15s ease;
  pointer-events: none;
}

.mc-card-preview:hover::before,
.mc-card-preview:focus-visible::before {
  opacity: 1;
}

.mc-card-preview:hover .mc-preview-trigger,
.mc-card-preview:focus-visible .mc-preview-trigger {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.mc-preview-trigger:hover {
  background: #f1f6fc;
}

.mc-render-paper {
  position: relative;
  z-index: 0;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0.75rem 0.875rem;
  border: 1px solid #e4e9f0;
  border-radius: 2px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.035);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  isolation: isolate;
}

.mc-render-stage {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0.75rem 0.875rem;
  box-sizing: border-box;
  background: #f3f5f8;
}

.mc-render-paper :deep([data-material="true"]) {
  flex: 0 0 auto;
  max-width: 100%;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  box-sizing: border-box;
  overflow: hidden !important;
}

.mc-render-paper::after {
  content: '';
  position: absolute;
  z-index: 1;
  inset: auto 0 0;
  height: 1rem;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff 85%);
}

.mc-render-paper :deep(table) {
  width: 100% !important;
  max-width: 100%;
  table-layout: fixed;
}

.mc-render-paper :deep(tbody tr:nth-child(n + 3)) {
  display: none;
}

.mc-render-paper :deep(th),
.mc-render-paper :deep(td) {
  padding: 0.375rem 0.5rem !important;
  font-size: 0.75rem !important;
  line-height: 1.35 !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.mc-render-paper :deep(img),
.mc-render-paper :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mc-render-paper :deep(pre) {
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* Title and actions share one footer row. */
.mc-card-footer {
  min-height: 3.75rem;
  padding: 0.5625rem 0.625rem 0.5625rem 0.75rem;
  background: #ffffff;
  border-top: 1px solid #edf1f5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.mc-card-meta {
  flex: 1;
  min-width: 0;
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

.mc-card-kind {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0.1875rem 0 0;
  font-size: 0.6875rem;
  color: #7b8797;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mc-card-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.1875rem;
}

.mc-card-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #718096;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.mc-card-action:hover,
.mc-card-action:focus-visible {
  color: #1769bd;
  background: #f1f6fc;
  border-color: #d7e5f4;
  outline: none;
}

.mc-preview-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.46);
  backdrop-filter: blur(2px);
}

.mc-preview-modal {
  width: min(40rem, 100%);
  max-height: min(44rem, calc(100vh - 3rem));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dce3ec;
  border-radius: 7px;
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.16);
}

.mc-preview-modal.is-wide {
  width: min(58rem, 100%);
}

.mc-preview-modal.is-compact {
  width: min(34rem, 100%);
}

.mc-preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem 0.875rem 1.25rem;
  border-bottom: 1px solid #e8edf3;
}

.mc-preview-modal-heading {
  min-width: 0;
}

.mc-preview-modal-heading h2 {
  margin: 0;
  overflow: hidden;
  color: #1e293b;
  font-size: 0.9375rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mc-preview-modal-heading p {
  margin: 0.25rem 0 0;
  color: #718096;
  font-size: 0.75rem;
}

.mc-preview-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #718096;
  cursor: pointer;
}

.mc-preview-modal-close:hover {
  background: #f3f6f9;
  color: #334155;
}

.mc-preview-modal-content {
  flex: 0 1 auto;
  min-height: 0;
  max-height: min(66vh, 36rem);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: #f5f7fa;
}

.mc-preview-modal-render {
  width: 100%;
  min-height: 9rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e4e9ef;
  border-radius: 4px;
  box-sizing: border-box;
}

.mc-preview-modal.is-compact .mc-preview-modal-content {
  padding: 1.25rem 1.5rem;
  background: #ffffff;
}

.mc-preview-modal.is-compact .mc-preview-modal-render {
  min-height: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.mc-preview-modal.is-compact .mc-preview-modal-render :deep([data-material="true"]) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.mc-preview-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e8edf3;
  background: #ffffff;
}

.mc-modal-primary,
.mc-modal-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 2.125rem;
  padding: 0 0.75rem;
  border: 1px solid #dce3ec;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.mc-modal-secondary {
  background: #ffffff;
  color: #52657f;
}

.mc-modal-secondary:hover,
.mc-modal-secondary.is-copied {
  background: #f5f8fc;
  color: #1769bd;
}

.mc-modal-primary {
  border-color: #1769bd;
  background: #1769bd;
  color: #ffffff;
}

.mc-modal-primary:hover {
  border-color: #12599f;
  background: #12599f;
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

@media (max-width: 760px) {
  .mc-header {
    height: auto;
    min-height: 3.5rem;
    padding: 0.625rem 0.875rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .mc-header-left {
    min-width: 0;
  }

  .mc-search-box {
    width: 100%;
    height: 2.25rem;
  }

  .mc-content {
    padding: 0.875rem 0.875rem 2rem;
  }

  .mc-filter-row {
    gap: 0.5rem;
  }

  .mc-filter-label {
    min-width: 3.5rem;
  }

  .mc-tabs {
    max-width: calc(100% - 4rem);
  }
}

@media (max-width: 1440px) {
  .mc-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1080px) {
  .mc-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .mc-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .mc-preview-modal-backdrop {
    padding: 0.75rem;
  }

  .mc-preview-modal {
    max-height: calc(100vh - 1.5rem);
  }

  .mc-preview-modal-content {
    padding: 1rem;
    max-height: 65vh;
  }

  .mc-preview-modal.is-compact .mc-preview-modal-content {
    padding: 1rem;
  }

  .mc-preview-modal-render {
    padding: 1rem;
  }
}

@media (hover: none) {
  .mc-card-preview::before {
    display: none;
  }

  .mc-preview-trigger {
    top: 0.625rem;
    left: auto;
    right: 0.625rem;
    min-height: 1.75rem;
    padding: 0 0.5625rem;
    opacity: 1;
    transform: none;
  }
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
  background: transparent;
  border-color: transparent;
}

:global(html.dark) .mc-filter-label,
:global(html[data-color-mode="dark"]) .mc-filter-label {
  color: #94a3b8;
}

:global(html.dark) .mc-title-badge,
:global(html[data-color-mode="dark"]) .mc-title-badge {
  background: transparent;
  color: #a9bfd8;
}

:global(html.dark) .mc-title,
:global(html[data-color-mode="dark"]) .mc-title {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .mc-back-btn,
:global(html[data-color-mode="dark"]) .mc-back-btn {
  background: transparent;
  border-color: transparent;
  color: #aab7c8;
}

:global(html.dark) .mc-back-btn:hover,
:global(html[data-color-mode="dark"]) .mc-back-btn:hover {
  background: #292c31;
  color: #ffffff;
}

:global(html.dark) .mc-search-box input,
:global(html[data-color-mode="dark"]) .mc-search-box input {
  background: #23262b;
  border-color: var(--border-color, #37373d);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .mc-count,
:global(html[data-color-mode="dark"]) .mc-count {
  color: #9aa8ba;
}

:global(html.dark) .mc-filter-row + .mc-filter-row,
:global(html[data-color-mode="dark"]) .mc-filter-row + .mc-filter-row {
  border-top-color: #30343a;
}

:global(html.dark) .mc-tabs,
:global(html[data-color-mode="dark"]) .mc-tabs {
  background: transparent;
  border-color: transparent;
}

:global(html.dark) .mc-tab,
:global(html[data-color-mode="dark"]) .mc-tab {
  color: #94a3b8;
}

:global(html.dark) .mc-tab:hover,
:global(html[data-color-mode="dark"]) .mc-tab:hover {
  background: #2a2f36;
  color: #ffffff;
}

:global(html.dark) .mc-tab.is-active,
:global(html[data-color-mode="dark"]) .mc-tab.is-active {
  background: #203953;
  color: #9bcaff;
}

:global(html.dark) .mc-card,
:global(html[data-color-mode="dark"]) .mc-card {
  background: var(--bg-card, #1e1e1e);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .mc-card:hover,
:global(html[data-color-mode="dark"]) .mc-card:hover {
  border-color: #4f6b8b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:global(html.dark) .mc-card-footer,
:global(html[data-color-mode="dark"]) .mc-card-footer {
  background: #1e1e1e;
  border-top-color: #30343a;
}

:global(html.dark) .mc-card-title,
:global(html[data-color-mode="dark"]) .mc-card-title {
  color: #f1f5f9;
}

:global(html.dark) .mc-card-kind,
:global(html[data-color-mode="dark"]) .mc-card-kind {
  color: #9aa8ba;
}

:global(html.dark) .mc-card-preview,
:global(html[data-color-mode="dark"]) .mc-card-preview {
  background: var(--bg-card, #1e1e1e);
}

:global(html.dark) .mc-preview-trigger,
:global(html[data-color-mode="dark"]) .mc-preview-trigger {
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.72);
  color: #1e293b;
}

:global(html.dark) .mc-card-action,
:global(html[data-color-mode="dark"]) .mc-card-action {
  color: #aab7c8;
}

:global(html.dark) .mc-card-action:hover,
:global(html[data-color-mode="dark"]) .mc-card-action:hover {
  background: #203953;
  border-color: #344c66;
  color: #9bcaff;
}

:global(html.dark) .mc-preview-modal,
:global(html[data-color-mode="dark"]) .mc-preview-modal {
  background: #1e1e1e;
  border-color: #37373d;
  color: #d7dde6;
}

:global(html.dark) .mc-preview-modal-header,
:global(html[data-color-mode="dark"]) .mc-preview-modal-header,
:global(html.dark) .mc-preview-modal-footer,
:global(html[data-color-mode="dark"]) .mc-preview-modal-footer {
  border-color: #37373d;
  background: #1e1e1e;
}

:global(html.dark) .mc-preview-modal-heading h2,
:global(html[data-color-mode="dark"]) .mc-preview-modal-heading h2 {
  color: #f1f5f9;
}

:global(html.dark) .mc-preview-modal-heading p,
:global(html[data-color-mode="dark"]) .mc-preview-modal-heading p {
  color: #9aa8ba;
}

:global(html.dark) .mc-preview-modal-content,
:global(html[data-color-mode="dark"]) .mc-preview-modal-content {
  background: #171a1e;
}

:global(html.dark) .mc-preview-modal-render,
:global(html[data-color-mode="dark"]) .mc-preview-modal-render {
  background: #1e1e1e;
  border-color: #37373d;
}

:global(html.dark) .mc-modal-secondary,
:global(html[data-color-mode="dark"]) .mc-modal-secondary {
  background: #252a31;
  border-color: #3a414b;
  color: #c1ccda;
}
</style>
