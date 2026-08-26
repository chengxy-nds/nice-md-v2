<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  Search,
  Check,
  X,
  Palette,
  Sparkles,
  ArrowLeft,
  Smartphone,
  Monitor
} from '@lucide/vue';
import { themes } from '../utils/themePresets';
import { defaultMarkdown } from '../utils/defaultMarkdown';
import { soundEngine } from '../utils/synthAudio';
import ArticlePreview from './ArticlePreview.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';

const emit = defineEmits(['apply-theme', 'back-to-editor', 'save-theme', 'save-custom-theme']);

const searchQuery = ref('');
const selectedTheme = ref(null);
const showThemePanel = ref(false);
const selectedCustomStyles = ref({});
const isWeChatMode = ref(false);
const themeCustomizerRef = ref(null);

// 主题强调色 + 背景色 → 一个渐变圆点,作为列表项色卡。
function themeDot(theme) {
  const accent = theme.styles['--accent-color'] || '#2775b6';
  const bg = theme.styles['--bg-preview'] || '#ffffff';
  const isDark = theme.dark;
  return {
    background: isDark
      ? `linear-gradient(135deg, ${bg} 0%, ${accent} 130%)`
      : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`
  };
}

// 主题画廊:把内置主题转成卡片数据,附上描述文案。
const themeGallery = computed(() => {
  const descriptions = {
    'classic-indigo': '经典山海主题,米白纸面 + 藏蓝强调,适合公众号深度长文。',
    'mountain-warm': '暖沙米黄纸面 + 暖棕强调,温润耐读,适合随笔与生活分享。',
    'mountain-forest': '米白纸面 + 墨绿强调,自然清爽,适合生活与自然主题内容。',
    'typora-github': 'GitHub 阅读风,纯白纸面 + 蓝绿强调,代码与表格排版清晰。',
    'typora-nord': 'Nord 冷色系,浅灰蓝纸面 + 青蓝强调,冷静克制适合长文档。',
    'typora-vue': 'Vue 风,纯白纸面 + 清新绿色强调,轻快现代适合技术分享。',
    'typora-dark': '深色护眼风,暗色纸面 + 柔和高亮,适合夜间长时间写作。'
  };
  const tags = {
    'classic-indigo': '默认 · 经典',
    'mountain-warm': '山海变体 · 暖',
    'mountain-forest': '山海变体 · 绿',
    'typora-github': 'Typora · 浅色',
    'typora-nord': 'Typora · 冷蓝',
    'typora-vue': 'Typora · 绿',
    'typora-dark': 'Typora · 深色'
  };
  return themes.map(t => ({
    ...t,
    description: descriptions[t.id] || t.description || '',
    tag: tags[t.id] || t.tag || '主题',
    sample: t.sample || defaultMarkdown
  }));
});

const filteredThemes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return themeGallery.value;
  return themeGallery.value.filter(t =>
    (t.name || '').toLowerCase().includes(q) ||
    (t.description || '').toLowerCase().includes(q) ||
    (t.tag || '').toLowerCase().includes(q)
  );
});

watch(filteredThemes, (list) => {
  if (!list.length) { selectedTheme.value = null; return; }
  const stillThere = list.some(t => selectedTheme.value && t.id === selectedTheme.value.id);
  if (!selectedTheme.value || !stillThere) {
    selectedTheme.value = list[0];
  }
}, { immediate: true });

watch(selectedTheme, (newTheme) => {
  if (newTheme) {
    selectedCustomStyles.value = JSON.parse(JSON.stringify(newTheme.customStyles || {}));
  } else {
    selectedCustomStyles.value = {};
  }
}, { immediate: true });

function handleSelect(theme) {
  soundEngine.playClick();
  selectedTheme.value = theme;
}

function handleApply(theme) {
  soundEngine.playChime();
  const themeToApply = {
    ...theme,
    customStyles: JSON.parse(JSON.stringify(selectedCustomStyles.value))
  };
  emit('apply-theme', themeToApply);
}

function handleLiveStyleUpdate(val) {
  selectedCustomStyles.value = val;
  if (selectedTheme.value) {
    selectedTheme.value.customStyles = val;
  }
}

function handleSaveCustomStyles(val) {
  selectedCustomStyles.value = val;
  if (selectedTheme.value) {
    selectedTheme.value.customStyles = val;
  }
}

async function handleElementClick(sectionName) {
  showThemePanel.value = true;
  await nextTick();
  themeCustomizerRef.value?.scrollToSection(sectionName);
}
</script>

<template>
  <div class="tc-root">
    <!-- Ambient backdrop glow -->
    <div class="tc-glow tc-glow-a"></div>
    <div class="tc-glow tc-glow-b"></div>

    <!-- Top Header -->
    <header class="tc-header">
      <div class="tc-header-left">
        <button class="tc-back-btn" @click="emit('back-to-editor')">
          <ArrowLeft size="15" />
          <span>返回编辑器</span>
        </button>
        <span class="tc-divider"></span>
        <div class="tc-title-group">
          <span class="tc-title-badge">
            <Sparkles size="14" />
          </span>
          <h1 class="tc-title">主题画廊</h1>
          <span class="tc-count">{{ filteredThemes.length }} 款主题</span>
        </div>
      </div>

      <div class="tc-search-box">
        <Search size="14" class="tc-search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索主题名或风格..."
        />
        <button v-if="searchQuery" class="tc-clear-btn" @click="searchQuery = ''">
          <X size="13" />
        </button>
      </div>
    </header>

    <!-- Two-pane Workspace: left = theme list, right = live preview & drawer -->
    <main class="tc-content">
      <!-- Left: compact theme list -->
      <aside class="tc-sidebar">
        <div
          v-for="theme in filteredThemes"
          :key="theme.id"
          class="tc-list-item"
          :class="{ 'is-active': selectedTheme && selectedTheme.id === theme.id }"
          @click="handleSelect(theme)"
        >
          <span class="tc-list-dot" :style="themeDot(theme)"></span>
          <div class="tc-list-info">
            <div class="tc-list-title-row">
              <span class="tc-list-name">{{ theme.name }}</span>
              <span class="tc-tag">{{ theme.tag }}</span>
            </div>
            <p class="tc-list-desc">{{ theme.description }}</p>
          </div>
          <Check v-if="selectedTheme && selectedTheme.id === theme.id" size="15" class="tc-list-check" />
        </div>

        <div v-if="filteredThemes.length === 0" class="tc-empty">
          <Search size="30" class="tc-empty-icon" />
          <p>暂无匹配的主题</p>
        </div>
      </aside>

      <!-- Right: live preview of the selected theme + customizer drawer -->
      <section class="tc-preview-pane">
        <div v-if="selectedTheme" class="tc-preview-header">
          <div class="tc-preview-title">
            <span class="tc-title-badge tc-title-badge-sm">
              <Palette size="13" />
            </span>
            <span class="tc-preview-name">{{ selectedTheme.name }}</span>
            <span class="tc-tag">{{ selectedTheme.tag }}</span>
          </div>

          <div class="tc-header-actions">
            <!-- Mode toggle -->
            <button
              class="tc-btn-icon"
              :class="{ 'is-active': isWeChatMode }"
              @click="isWeChatMode = !isWeChatMode"
              :title="isWeChatMode ? '切换到标准预览' : '切换到微信真机框'"
            >
              <Smartphone v-if="!isWeChatMode" size="15" />
              <Monitor v-else size="15" />
            </button>

            <!-- Edit Theme button -->
            <button
              class="tc-btn-secondary"
              :class="{ 'is-active': showThemePanel }"
              @click="showThemePanel = !showThemePanel"
            >
              <Palette size="13" />
              <span>{{ showThemePanel ? '关闭编辑' : '自定义主题' }}</span>
            </button>

            <!-- Apply Theme button -->
            <button class="tc-btn-primary tc-apply-btn" @click="handleApply(selectedTheme)">
              <Check size="13" />
              <span>套用此主题</span>
            </button>
          </div>
        </div>

        <div v-if="selectedTheme" class="tc-preview-body-container">
          <div class="tc-preview-wrap">
            <ArticlePreview
              :markdown="selectedTheme.sample || defaultMarkdown"
              :docTitle="selectedTheme.name || '主题预览'"
              :themeId="selectedTheme.id"
              codeThemeId="atom-one-dark"
              :customStyles="selectedCustomStyles"
              :isWeChatMode="isWeChatMode"
              @element-click="handleElementClick"
            />
          </div>

          <!-- Theme Customizer Drawer in Template Center -->
          <div v-if="showThemePanel" class="tc-drawer-wrap">
            <ThemeCustomizer
              ref="themeCustomizerRef"
              :modelValue="selectedCustomStyles"
              :themeId="selectedTheme.id"
              :open="true"
              @update:modelValue="handleLiveStyleUpdate"
              @save-custom-styles="handleSaveCustomStyles"
              @save-theme="v => emit('save-theme', v)"
              @save-custom-theme="v => emit('save-custom-theme', v)"
              @close="showThemePanel = false"
            />
          </div>
        </div>

        <div v-else class="tc-empty">
          <Palette size="36" class="tc-empty-icon" />
          <p>请从左侧选择一个主题</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ── 面向 C 端的高质感主题画廊 / 模版中心 ── */

.tc-root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f4f5f7;
  color: var(--text-main, #1e293b);
  font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', 'Segoe UI', Roboto, sans-serif);
}

/* Ambient subtle space light */
.tc-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(3.75rem);
  pointer-events: none;
  z-index: 0;
}

.tc-glow-a {
  width: 22rem;
  height: 22rem;
  top: -6rem;
  right: 15%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(243, 244, 246, 0) 70%);
}

.tc-glow-b {
  width: 24rem;
  height: 24rem;
  bottom: -6rem;
  left: 10%;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.55) 0%, rgba(243, 244, 246, 0) 70%);
}

/* ── Header (高度 52px，比例紧凑精致) ── */
.tc-header {
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

.tc-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tc-back-btn {
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

.tc-back-btn:hover {
  background: #f1f5f9;
  color: #000000;
  transform: translateX(-0.0625rem);
}

.tc-divider {
  width: 0.0625rem;
  height: 1.125rem;
  background: var(--border-color, #e2e8f0);
}

.tc-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tc-title-badge {
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

.tc-title-badge-sm {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
}

.tc-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main, #1e293b);
  letter-spacing: -0.0125rem;
  line-height: 1.2;
}

.tc-count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #16a34a;
  background: #edfdf2;
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(22, 163, 74, 0.06);
}

.tc-search-box {
  position: relative;
  width: 15rem;
  height: 2rem;
  display: flex;
  align-items: center;
}

.tc-search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
  transition: color 0.2s ease;
}

.tc-search-box input {
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

.tc-search-box input::placeholder {
  color: #94a3b8;
}

.tc-search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  background: #ffffff;
}

.tc-clear-btn {
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

.tc-clear-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* ── Workspace / Two-pane (紧凑贴合的专业工坊布局) ── */
.tc-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem 1rem 1rem;
  overflow: hidden;
  min-height: 0;
}

.tc-sidebar {
  width: 17.5rem;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.tc-sidebar::-webkit-scrollbar {
  width: 0.25rem;
}

.tc-sidebar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

/* ── List item (左侧列表项紧凑度与精细圆角) ── */
.tc-list-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.18s ease;
  user-select: none;
}

.tc-list-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.tc-list-item.is-active {
  background: #f0f7ff;
  border-color: #bfdbfe;
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.08);
}

/* Theme color dot */
.tc-list-dot {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.85);
}

/* List info */
.tc-list-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
}

.tc-list-title-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.tc-list-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.0125rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-tag {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  color: #64748b;
  background: #f1f5f9;
  white-space: nowrap;
  flex-shrink: 0;
}

.tc-list-item.is-active .tc-tag {
  color: #16a34a;
  background: #edfdf2;
}

.tc-list-desc {
  font-size: 0.6875rem;
  color: #94a3b8;
  line-height: 1.35;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.tc-list-check {
  color: #2a2a2c;
  flex-shrink: 0;
}

/* ── Right preview pane (统一 12px 圆角与纯白卡片) ── */
.tc-preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.tc-preview-header {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  flex-shrink: 0;
  z-index: 2;
}

.tc-preview-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.tc-preview-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  letter-spacing: -0.0125rem;
}

.tc-header-actions {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
}

.tc-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-card, #ffffff);
  color: var(--text-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.tc-btn-icon:hover {
  background: #f1f5f9;
  color: #000000;
}

.tc-btn-icon.is-active {
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.02) 70%), #2a2a2c;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 2px 6px rgba(42, 42, 44, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tc-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  height: 1.875rem;
  padding: 0 0.6875rem;
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

.tc-btn-secondary:hover {
  background: #f1f5f9;
  color: #000000;
}

.tc-btn-secondary.is-active {
  background: #f1f5f9;
  color: #000000;
  border-color: #cbd5e1;
}

.tc-btn-primary.tc-apply-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  height: 1.875rem;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.02) 60%, rgba(0, 0, 0, 0.15) 100%), #2a2a2c;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 2px 10px rgba(42, 42, 44, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.tc-btn-primary.tc-apply-btn:hover {
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.06) 60%, rgba(0, 0, 0, 0.08) 100%), #333336;
  border-color: rgba(255, 255, 255, 0.24);
  transform: translateY(-0.0625rem);
  box-shadow: 
    0 2px 6px rgba(0, 0, 0, 0.12),
    0 4px 14px rgba(42, 42, 44, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}

.tc-btn-primary.tc-apply-btn:active {
  transform: translateY(0) scale(0.98);
}

.tc-preview-body-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.tc-preview-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  position: relative;
  background: var(--bg-preview, #ffffff);
}

.tc-drawer-wrap {
  width: 20.5rem;
  flex-shrink: 0;
  border-left: 1px solid #e2e8f0;
  background: var(--bg-card, #ffffff);
  height: 100%;
  overflow: hidden;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.03);
}

.tc-empty {
  padding: 3.75rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #94a3b8);
  font-size: 0.8125rem;
}

.tc-empty-icon {
  margin-bottom: 0.625rem;
  opacity: 0.4;
}

/* ── Dark Mode (深色模式同步调整) ── */
:global(html.dark) .tc-root,
:global(html[data-color-mode="dark"]) .tc-root {
  background: var(--bg-app, #18181c);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .tc-header,
:global(html[data-color-mode="dark"]) .tc-header {
  background: var(--bg-card, #1e1e1e);
  border-bottom-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .tc-title-badge,
:global(html[data-color-mode="dark"]) .tc-title-badge {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .tc-back-btn,
:global(html[data-color-mode="dark"]) .tc-back-btn {
  background: var(--bg-toolbar, #2d2d2d);
  border-color: var(--border-color, #37373d);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .tc-back-btn:hover,
:global(html[data-color-mode="dark"]) .tc-back-btn:hover {
  background: var(--bg-capsule-btn-hover, #37373d);
  color: #ffffff;
}

:global(html.dark) .tc-search-box input,
:global(html[data-color-mode="dark"]) .tc-search-box input {
  background: var(--bg-card, #252526);
  border-color: var(--border-color, #37373d);
  color: var(--text-main, #cccccc);
}

:global(html.dark) .tc-sidebar,
:global(html[data-color-mode="dark"]) .tc-sidebar {
  background: var(--bg-card, #1e1e1e);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .tc-list-item:hover,
:global(html[data-color-mode="dark"]) .tc-list-item:hover {
  background: var(--bg-capsule-btn-hover, #2d2d2d);
}

:global(html.dark) .tc-list-item.is-active,
:global(html[data-color-mode="dark"]) .tc-list-item.is-active {
  background: rgba(55, 148, 255, 0.1);
  border-color: rgba(55, 148, 255, 0.3);
}

:global(html.dark) .tc-list-name,
:global(html[data-color-mode="dark"]) .tc-list-name {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .tc-preview-pane,
:global(html[data-color-mode="dark"]) .tc-preview-pane {
  background: var(--bg-card, #1e1e1e);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .tc-preview-header,
:global(html[data-color-mode="dark"]) .tc-preview-header {
  background: var(--bg-card, #1e1e1e);
  border-bottom-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .tc-preview-name,
:global(html[data-color-mode="dark"]) .tc-preview-name {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .tc-btn-icon,
:global(html[data-color-mode="dark"]) .tc-btn-icon {
  background: var(--bg-toolbar, #2d2d2d);
  border-color: var(--border-color, #37373d);
  color: var(--text-muted, #969696);
}

:global(html.dark) .tc-btn-icon:hover,
:global(html[data-color-mode="dark"]) .tc-btn-icon:hover {
  background: var(--bg-capsule-btn-hover, #37373d);
  color: #ffffff;
}

:global(html.dark) .tc-btn-icon.is-active,
:global(html[data-color-mode="dark"]) .tc-btn-icon.is-active {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .tc-btn-secondary,
:global(html[data-color-mode="dark"]) .tc-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

:global(html.dark) .tc-btn-primary.tc-apply-btn,
:global(html[data-color-mode="dark"]) .tc-btn-primary.tc-apply-btn {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .tc-list-check,
:global(html[data-color-mode="dark"]) .tc-list-check {
  color: #ffffff;
}

:global(html.dark) .tc-drawer-wrap,
:global(html[data-color-mode="dark"]) .tc-drawer-wrap {
  background: var(--bg-card, #1e1e1e);
  border-left-color: var(--border-color, #2d2d2d);
}

/* ── Rendered document (Typora-like, CSS var driven) ── */
.tc-rendered-paper {
  padding: 32px 38px;
  background: var(--bg-preview, #ffffff);
  border-radius: 11px;
  font-size: 14.5px;
  line-height: 1.8;
  color: var(--text-main, #2b2b2b);
}

.tc-rendered-paper :deep(h1) {
  font-size: 1.55em;
  font-weight: 800;
  color: var(--accent-color, var(--text-main, #2b2b2b));
  border-bottom: 1px solid var(--border-color, #e1e4e8);
  padding-bottom: 0.3em;
  margin-top: 0.3em;
  margin-bottom: 0.7em;
  letter-spacing: -0.3px;
}

.tc-rendered-paper :deep(h2) {
  font-size: 1.32em;
  font-weight: 700;
  color: var(--accent-color, var(--text-main, #2b2b2b));
  margin-top: 1em;
  margin-bottom: 0.55em;
  letter-spacing: -0.2px;
}

.tc-rendered-paper :deep(h3) {
  font-size: 1.15em;
  font-weight: 700;
  color: var(--text-main, #2b2b2b);
  margin-top: 0.9em;
  margin-bottom: 0.5em;
}

.tc-rendered-paper :deep(p) {
  margin: 0 0 0.75em 0;
}

.tc-rendered-paper :deep(strong) {
  color: var(--accent-color, var(--text-main, #2b2b2b));
  font-weight: 700;
}

.tc-rendered-paper :deep(blockquote) {
  margin: 0 0 0.9em 0;
  padding: 0.55em 1em;
  border-left: 3px solid var(--accent-color, #2775b6);
  background: var(--accent-bg, rgba(39,117,182,0.06));
  color: var(--text-muted, #595959);
  border-radius: 0 6px 6px 0;
}

.tc-rendered-paper :deep(blockquote p) {
  margin: 0;
}

.tc-rendered-paper :deep(ul), .tc-rendered-paper :deep(ol) {
  margin: 0 0 0.8em 0;
  padding-left: 1.5em;
}

.tc-rendered-paper :deep(li) {
  margin-bottom: 0.3em;
}

.tc-rendered-paper :deep(code) {
  font-family: "SF Mono", Consolas, Monaco, monospace;
  font-size: 0.85em;
  background: var(--code-bg, rgba(27,31,35,0.06));
  color: var(--code-text, #bb2243);
  padding: 2px 6px;
  border-radius: 4px;
}

.tc-rendered-paper :deep(pre) {
  background: var(--code-bg, #f6f8fa);
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 0.9em 0;
}

.tc-rendered-paper :deep(pre code) {
  background: transparent;
  color: var(--text-main, #333);
  padding: 0;
}

.tc-rendered-paper :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0.9em;
}

.tc-rendered-paper :deep(th), .tc-rendered-paper :deep(td) {
  border: 1px solid var(--border-color, #e1e4e8);
  padding: 7px 12px;
}

.tc-rendered-paper :deep(th) {
  background: var(--accent-bg, rgba(39,117,182,0.06));
  font-weight: 600;
}

.tc-rendered-paper :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.tc-rendered-paper :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color, #e1e4e8);
  margin: 1.3em 0;
}
</style>
