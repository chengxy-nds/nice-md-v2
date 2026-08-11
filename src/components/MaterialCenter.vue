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
  UserCheck
} from '@lucide/vue';
import { materialCategories, materials } from '../utils/materialLibrary';
import { soundEngine } from '../utils/synthAudio';
import confetti from 'canvas-confetti';

const emit = defineEmits(['back-to-editor', 'insert-material']);

const searchQuery = ref('');
const activeCategory = ref('all');
const copiedId = ref(null);

const categoryIcons = {
  all: Boxes,
  headings: Heading,
  quotes: Quote,
  callouts: AlertCircle,
  dividers: Minus,
  lists: ListOrdered,
  footer: UserCheck
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
          placeholder="搜索标题、引用、提示框等素材..."
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
          <!-- Material Live Render Box -->
          <div class="mc-card-preview">
            <div class="mc-render-paper" v-html="mat.html"></div>
          </div>

          <!-- Material Metadata -->
          <div class="mc-card-body">
            <div class="mc-card-info">
              <h3 class="mc-card-title">{{ mat.title }}</h3>
              <p class="mc-card-desc">{{ mat.description }}</p>

              <div class="mc-tags">
                <span v-for="t in mat.tags" :key="t" class="mc-tag-chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mc-card-actions">
              <button class="mc-btn-secondary" @click="handleCopy(mat)">
                <Check v-if="copiedId === mat.id" size="13" />
                <Copy v-else size="13" />
                <span>{{ copiedId === mat.id ? '已复制' : '复制 HTML' }}</span>
              </button>

              <button class="mc-btn-primary" @click="handleInsert(mat)">
                <Plus size="13" />
                <span>插入编辑器</span>
              </button>
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
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-main, #111827);
}

.mc-count {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
}

.mc-search-box {
  position: relative;
  width: 260px;
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
  padding: 6px 28px 6px 30px;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-main, #f9fafb);
  color: var(--text-main, #111827);
  font-size: 12px;
  outline: none;
}

.mc-search-box input:focus {
  border-color: var(--accent-color, #2563eb);
  background: #ffffff;
}

.mc-clear-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
}

/* Workspace */
.mc-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px 36px;
}

/* Category Tabs */
.mc-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  background: var(--border-color, #f3f4f6);
  margin-bottom: 24px;
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
  background: var(--bg-editor, #ffffff);
  border: 1px solid var(--border-color, #eaebed);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.mc-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

/* Live Render Box */
.mc-card-preview {
  min-height: 120px;
  background: var(--bg-main, #f8fafc);
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mc-render-paper {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

/* Card Body */
.mc-card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.mc-card-info {
  flex: 1;
  margin-bottom: 14px;
}

.mc-card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: var(--text-main, #111827);
}

.mc-card-desc {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  line-height: 1.5;
  margin: 0 0 10px 0;
}

.mc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mc-tag-chip {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-main, #f3f4f6);
  color: var(--text-muted, #4b5563);
}

/* Actions */
.mc-card-actions {
  display: flex;
  gap: 8px;
}

.mc-btn-secondary,
.mc-btn-primary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mc-btn-secondary {
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-editor, #ffffff);
  color: var(--text-main, #374151);
}

.mc-btn-secondary:hover {
  background: var(--bg-main, #f9fafb);
  border-color: #d1d5db;
}

.mc-btn-primary {
  border: none;
  background: var(--accent-color, #2563eb);
  color: #ffffff;
}

.mc-btn-primary:hover {
  opacity: 0.92;
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
