<script setup>
import { ref, computed } from 'vue';
import {
  Search,
  Check,
  ChevronLeft,
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
  Palette
} from '@lucide/vue';
import { materialCategories, materials } from '../utils/materialLibrary';
import { soundEngine } from '../utils/synthAudio';
import confetti from 'canvas-confetti';

const emit = defineEmits(['back-to-editor', 'insert-material', 'apply-background']);

const searchQuery = ref('');
const activeCategory = ref('all');
const copiedId = ref(null);

const categoryIcons = {
  all: Boxes,
  backgrounds: LayoutGrid,
  headings: Heading,
  quotes: Quote,
  callouts: AlertCircle,
  dividers: Minus,
  lists: ListOrdered,
  header_widgets: Sparkles,
  footer_widgets: UserCheck
};

const filteredMaterials = computed(() => {
  return materials.filter(m => {
    const matchesCat = activeCategory.value === 'all' || m.category === activeCategory.value;
    const q = searchQuery.value.trim().toLowerCase();
    const matchesQuery = !q ||
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });
});

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
    <!-- Header -->
    <header class="mc-header">
      <div class="mc-header-left">
        <button class="mc-back-btn" @click="emit('back-to-editor')">
          <ChevronLeft size="15" />
          <span>返回编辑器</span>
        </button>
        <span class="mc-divider"></span>
        <div class="mc-title-group">
          <h1 class="mc-title">素材中心</h1>
          <span class="mc-count">{{ filteredMaterials.length }} 款排版素材</span>
        </div>
      </div>

      <div class="mc-search-box">
        <Search size="14" class="mc-search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索背景底纹、标题、引用、提示框等素材..."
        />
        <button v-if="searchQuery" class="mc-clear-btn" @click="searchQuery = ''">
          <X size="13" />
        </button>
      </div>
    </header>

    <!-- Content Workspace -->
    <main class="mc-content">
      <!-- Category Tabs -->
      <nav class="mc-tabs">
        <button
          v-for="cat in materialCategories"
          :key="cat.id"
          class="mc-tab"
          :class="{ 'is-active': activeCategory === cat.id }"
          @click="activeCategory = cat.id; soundEngine.playClick();"
        >
          <component :is="categoryIcons[cat.id] || Boxes" size="14" />
          <span>{{ cat.name }}</span>
        </button>
      </nav>

      <!-- Materials Grid -->
      <div class="mc-grid">
        <div
          v-for="mat in filteredMaterials"
          :key="mat.id"
          class="mc-card"
        >
          <!-- Pure Material Live Render Area (纯粹展示素材样式，无任何多余文字描述与角标) -->
          <div class="mc-card-preview">
            <div class="mc-render-paper" v-html="mat.html"></div>
          </div>

          <!-- Elegant Frosted Glass Hover Overlay (鼠标划过时优雅浮现蒙版和操作按钮) -->
          <div class="mc-card-overlay">
            <div class="mc-overlay-actions" @click.stop>
              <!-- Category is backgrounds -->
              <template v-if="mat.category === 'backgrounds'">
                <button
                  class="mc-overlay-btn primary"
                  @click="handleApplyBackground(mat)"
                  title="套用为当前文章整体背景底纹"
                >
                  <Palette size="14" />
                  <span>套用为整体背景</span>
                </button>
                <button
                  class="mc-overlay-btn secondary"
                  @click="handleCopy(mat)"
                  title="复制素材 HTML"
                >
                  <Check v-if="copiedId === mat.id" size="14" />
                  <Copy v-else size="14" />
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
                  <Plus size="14" />
                  <span>插入编辑器</span>
                </button>
                <button
                  class="mc-overlay-btn secondary"
                  @click="handleCopy(mat)"
                  title="复制素材 HTML"
                >
                  <Check v-if="copiedId === mat.id" size="14" />
                  <Copy v-else size="14" />
                  <span>{{ copiedId === mat.id ? '已复制' : '复制' }}</span>
                </button>
              </template>
            </div>
          </div>
        </div>

        <div v-if="filteredMaterials.length === 0" class="mc-empty">
          <Boxes size="36" class="mc-empty-icon" />
          <p>暂无找到匹配的排版素材，换个关键字试试看</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.mc-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--bg-main, #fcfcfc);
  color: var(--text-main, #111827);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "PingFang SC", sans-serif;
  overflow: hidden;
}

/* Header */
.mc-header {
  height: 52px;
  padding: 0 24px;
  background: var(--bg-editor, #ffffff);
  border-bottom: 1px solid var(--border-color, #eaebed);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.mc-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mc-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-main, #f9fafb);
  color: var(--text-main, #374151);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mc-back-btn:hover {
  background: var(--accent-bg, #eff6ff);
  color: var(--accent-color, #2563eb);
  border-color: var(--accent-color, #2563eb);
}

.mc-divider {
  width: 1px;
  height: 18px;
  background: var(--border-color, #e5e7eb);
}

.mc-title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.mc-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main, #111827);
  margin: 0;
  letter-spacing: -0.2px;
}

.mc-count {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
}

.mc-search-box {
  position: relative;
  width: 280px;
  display: flex;
  align-items: center;
}

.mc-search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted, #9ca3af);
  pointer-events: none;
}

.mc-search-box input {
  width: 100%;
  height: 32px;
  padding: 0 28px 0 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-preview, #f9fafb);
  color: var(--text-main, #111827);
  font-size: 12px;
  outline: none;
  transition: all 0.15s ease;
}

.mc-search-box input:focus {
  border-color: var(--accent-color, #2563eb);
  background: var(--bg-editor, #ffffff);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.mc-clear-btn {
  position: absolute;
  right: 8px;
  padding: 2px;
  border: none;
  background: transparent;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  border-radius: 4px;
}

.mc-clear-btn:hover {
  color: var(--text-main, #374151);
}

/* Content Area */
.mc-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 40px;
}

.mc-content::-webkit-scrollbar {
  width: 6px;
}

.mc-content::-webkit-scrollbar-thumb {
  background: var(--border-color, #e5e7eb);
  border-radius: 3px;
}

/* Category Tabs */
.mc-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--bg-preview, #f1f5f9);
  border-radius: 10px;
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
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-muted, #6b7280);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.mc-tab:hover {
  color: var(--text-main, #111827);
}

.mc-tab.is-active {
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #111827);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* Grid */
.mc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* Card */
.mc-card {
  position: relative;
  background: var(--bg-editor, #ffffff);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 140px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.mc-card:hover {
  border-color: var(--accent-color, #6366f1);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

html.dark .mc-card {
  border-color: rgba(255, 255, 255, 0.08);
}

html.dark .mc-card:hover {
  border-color: var(--accent-color, #818cf8);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

/* Pure Material Preview Area */
.mc-card-preview {
  flex: 1;
  width: 100%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: var(--bg-editor, #ffffff);
}

.mc-render-paper {
  width: 100%;
  background: transparent;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.25s ease;
}

.mc-card:hover .mc-render-paper {
  transform: scale(0.98);
}

/* Ultra-Refined Frosted Hover Overlay */
.mc-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  pointer-events: none;
  border-radius: 11px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

html.dark .mc-card-overlay,
[data-color-mode="dark"] .mc-card-overlay {
  background: rgba(18, 18, 22, 0.75);
}

.mc-card:hover .mc-card-overlay {
  opacity: 1;
  pointer-events: auto;
}

.mc-overlay-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transform: translateY(4px) scale(0.96);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.mc-card:hover .mc-overlay-actions {
  transform: translateY(0) scale(1);
}

/* Tactile Floating Capsule Buttons */
.mc-overlay-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.875rem;
  border-radius: 20px;
  font-size: 0.78125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  cursor: pointer;
  border: none;
  outline: none;
  white-space: nowrap;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.mc-overlay-btn:active {
  transform: scale(0.95) !important;
}

/* Primary Capsule: Brand Purple */
.mc-overlay-btn.primary {
  background: var(--accent-color, #6366f1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
}

.mc-overlay-btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45);
}

/* Secondary Capsule: Clean Glass/White Pill */
.mc-overlay-btn.secondary {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  color: #1e293b;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mc-overlay-btn.secondary:hover {
  background: #ffffff;
  color: #0f172a;
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

html.dark .mc-overlay-btn.secondary,
[data-color-mode="dark"] .mc-overlay-btn.secondary {
  background: rgba(39, 39, 42, 0.9);
  border-color: rgba(255, 255, 255, 0.12);
  color: #f4f4f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

html.dark .mc-overlay-btn.secondary:hover,
[data-color-mode="dark"] .mc-overlay-btn.secondary:hover {
  background: rgba(63, 63, 70, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.mc-empty {
  grid-column: 1 / -1;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #9ca3af);
}

.mc-empty-icon {
  margin-bottom: 10px;
  opacity: 0.5;
}
</style>
