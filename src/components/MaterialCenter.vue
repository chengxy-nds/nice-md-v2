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
  Table
} from 'lucide-vue-next';
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
          <component :is="categoryIcons[cat.id] || Boxes" size="13" />
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
          <!-- Pure Material Live Render Area -->
          <div class="mc-card-preview">
            <div class="mc-render-paper" v-html="mat.html"></div>
          </div>

          <!-- Elegant Frosted Glass Hover Overlay -->
          <div class="mc-card-overlay">
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
          <p>暂无找到匹配的排版素材，换个关键字试试看</p>
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
  background: #f4f5f7;
  color: var(--text-main, #1e293b);
  font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Segoe UI', Roboto, sans-serif);
  overflow: hidden;
}

/* Ambient subtle space light */
.mc-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(3.75rem);
  pointer-events: none;
  z-index: 0;
}

.mc-glow-a {
  width: 22rem;
  height: 22rem;
  top: -6rem;
  right: 15%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(243, 244, 246, 0) 70%);
}

.mc-glow-b {
  width: 24rem;
  height: 24rem;
  bottom: -6rem;
  left: 10%;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.55) 0%, rgba(243, 244, 246, 0) 70%);
}

/* Header (高度 52px，比例紧凑精致) */
.mc-header {
  position: relative;
  z-index: 2;
  height: 3.25rem;
  padding: 0 1.25rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
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
  border-radius: 9999px;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #1e293b);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  user-select: none;
}

.mc-back-btn:hover {
  background: #f1f5f9;
  color: #000000;
  transform: translateX(-0.0625rem);
}

.mc-divider {
  width: 0.0625rem;
  height: 1.125rem;
  background: var(--border-color, #e2e8f0);
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
  border-radius: 0.375rem;
  color: #ffffff;
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.02) 70%), #2a2a2c;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.mc-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main, #1e293b);
  margin: 0;
  letter-spacing: -0.0125rem;
  line-height: 1.2;
}

.mc-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #16a34a;
  background: #edfdf2;
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(22, 163, 74, 0.06);
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
  border-radius: 9999px;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #1e293b);
  font-size: 0.75rem;
  font-weight: 500;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.mc-search-box input::placeholder {
  color: #94a3b8;
}

.mc-search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: #ffffff;
}

.mc-clear-btn {
  position: absolute;
  right: 0.5rem;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.mc-clear-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Content Area */
.mc-content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 0.875rem 1.25rem 2.5rem 1.25rem;
}

.mc-content::-webkit-scrollbar {
  width: 0.25rem;
}

.mc-content::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

/* Category Tabs (精致胶囊切换栏) */
.mc-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.mc-tabs::-webkit-scrollbar {
  display: none;
}

.mc-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  user-select: none;
}

.mc-tab:hover {
  color: #0f172a;
  background: rgba(241, 245, 249, 0.7);
}

.mc-tab.is-active {
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.02) 70%), #2a2a2c;
  border-color: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(42, 42, 44, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Grid */
.mc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
}

/* Card (12px 统一圆角，纯白卡片，平滑悬浮阴影) */
.mc-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 140px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.mc-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02);
  transform: translateY(-0.125rem);
}

/* Pure Material Preview Area */
.mc-card-preview {
  flex: 1;
  width: 100%;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: #ffffff;
}

.mc-render-paper {
  width: 100%;
  background: transparent;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: transform 0.25s ease;
}

.mc-card:hover .mc-render-paper {
  transform: scale(0.985);
}

/* Ultra-Refined Frosted Hover Overlay */
.mc-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  pointer-events: none;
  border-radius: 0.75rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

.mc-card:hover .mc-card-overlay {
  opacity: 1;
  pointer-events: auto;
}

.mc-overlay-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transform: translateY(0.25rem) scale(0.96);
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
  gap: 0.3125rem;
  height: 1.875rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  border: none;
  outline: none;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.mc-overlay-btn:active {
  transform: scale(0.96) !important;
}

/* Primary Capsule: Apple Space Gray / Titanium CTA */
.mc-overlay-btn.primary {
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.02) 60%, rgba(0, 0, 0, 0.15) 100%), #2a2a2c;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 2px 10px rgba(42, 42, 44, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35);
}

.mc-overlay-btn.primary:hover {
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.06) 60%, rgba(0, 0, 0, 0.08) 100%), #333336;
  border-color: rgba(255, 255, 255, 0.24);
  transform: translateY(-0.0625rem);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.12),
    0 4px 14px rgba(42, 42, 44, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}

/* Secondary Capsule: Clean Glass/White Pill */
.mc-overlay-btn.secondary {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.mc-overlay-btn.secondary:hover {
  background: #f8fafc;
  color: #000000;
  border-color: #cbd5e1;
  transform: translateY(-0.0625rem);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.mc-empty {
  grid-column: 1 / -1;
  padding: 3.75rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #94a3b8);
  font-size: 0.8125rem;
}

.mc-empty-icon {
  margin-bottom: 0.625rem;
  opacity: 0.4;
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
  background: var(--bg-card, #252526);
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

:global(html.dark) .mc-card-preview,
:global(html[data-color-mode="dark"]) .mc-card-preview {
  background: var(--bg-card, #1e1e1e);
}

:global(html.dark) .mc-card-overlay,
:global(html[data-color-mode="dark"]) .mc-card-overlay {
  background: rgba(18, 18, 22, 0.78);
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
