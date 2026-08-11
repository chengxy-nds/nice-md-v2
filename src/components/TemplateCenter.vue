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

const emit = defineEmits(['apply-theme', 'back-to-editor', 'save-theme']);

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
/* ── 面向 C 端的高质感主题画廊 ── */

.tc-root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--bg-preview, #f4f5f7);
  color: var(--text-main, #2b2b2b);
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
}

/* Ambient glow blobs for depth */
.tc-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}
.tc-glow-a {
  width: 380px; height: 380px;
  top: -140px; right: 10%;
  background: radial-gradient(circle, rgba(39,117,182,0.22), transparent 70%);
}
.tc-glow-b {
  width: 320px; height: 320px;
  bottom: -120px; left: 5%;
  background: radial-gradient(circle, rgba(39,117,182,0.14), transparent 70%);
}

/* ── Header ── */
.tc-header {
  position: relative;
  z-index: 1;
  height: 56px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.tc-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tc-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  color: var(--text-muted, #595959);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.tc-back-btn:hover {
  color: var(--accent-color, #2775b6);
  border-color: rgba(39,117,182,0.35);
  background: var(--accent-bg, rgba(39,117,182,0.06));
  transform: translateX(-1px);
}

.tc-divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
}

.tc-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tc-title-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--accent-color, #2775b6), var(--accent-hover, #1e5d93));
  box-shadow: 0 4px 10px rgba(39,117,182,0.3);
}

.tc-title-badge-sm {
  width: 24px;
  height: 24px;
  border-radius: 7px;
}

.tc-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: var(--text-main, #2b2b2b);
  letter-spacing: -0.2px;
}

.tc-count {
  font-size: 12px;
  color: var(--text-muted, #595959);
  background: rgba(0, 0, 0, 0.04);
  padding: 2px 9px;
  border-radius: 20px;
}

.tc-search-box {
  position: relative;
  width: 260px;
  display: flex;
  align-items: center;
}

.tc-search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted, #595959);
  pointer-events: none;
  transition: color 0.2s ease;
}

.tc-search-box input {
  width: 100%;
  padding: 8px 32px 8px 34px;
  border-radius: 11px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  color: var(--text-main, #2b2b2b);
  font-size: 12.5px;
  outline: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}

.tc-search-box input::placeholder {
  color: #a0a6af;
}

.tc-search-box input:focus {
  border-color: rgba(39,117,182,0.4);
  box-shadow: 0 0 0 3px rgba(39,117,182,0.12);
}

.tc-search-box input:focus + .tc-search-icon,
.tc-search-box:focus-within .tc-search-icon {
  color: var(--accent-color, #2775b6);
}

.tc-clear-btn {
  position: absolute;
  right: 9px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  border: none;
  color: var(--text-muted, #595959);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.tc-clear-btn:hover {
  background: rgba(0, 0, 0, 0.12);
  color: var(--text-main, #2b2b2b);
}

/* ── Workspace / Two-pane ── */
.tc-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 22px 28px 28px;
  overflow: hidden;
}

.tc-sidebar {
  width: 288px;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.12) transparent;
}

/* ── Compact list item ── */
.tc-list-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 11px;
  cursor: pointer;
  transition: background 0.18s ease;
}

.tc-list-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.tc-list-item.is-active {
  background: var(--accent-bg, rgba(39,117,182,0.07));
}

.tc-list-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 2px;
  background: var(--accent-color, #2775b6);
}

/* Theme color dot */
.tc-list-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.25);
}

/* List info */
.tc-list-info {
  flex: 1;
  min-width: 0;
}

.tc-list-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 3px;
}

.tc-list-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main, #2b2b2b);
  letter-spacing: -0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 20px;
  color: var(--accent-color, #2775b6);
  background: var(--accent-bg, rgba(39,117,182,0.08));
  white-space: nowrap;
  flex-shrink: 0;
}

.tc-list-desc {
  font-size: 11px;
  color: var(--text-muted, #595959);
  line-height: 1.4;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-list-check {
  color: var(--accent-color, #2775b6);
  flex-shrink: 0;
}

/* ── Right preview pane ── */
.tc-preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
  overflow: hidden;
}

.tc-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.tc-preview-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.tc-preview-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main, #2b2b2b);
  letter-spacing: -0.1px;
}

.tc-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tc-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  color: var(--text-muted, #595959);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tc-btn-icon:hover {
  color: var(--accent-color, #2775b6);
  border-color: rgba(39, 117, 182, 0.3);
}

.tc-btn-icon.is-active {
  background: var(--accent-bg, rgba(39, 117, 182, 0.1));
  color: var(--accent-color, #2775b6);
  border-color: rgba(39, 117, 182, 0.4);
}

.tc-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 9px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #ffffff;
  color: var(--text-main, #2b2b2b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tc-btn-secondary:hover {
  border-color: var(--accent-color, #2775b6);
  color: var(--accent-color, #2775b6);
  background: var(--accent-bg, rgba(39, 117, 182, 0.05));
}

.tc-btn-secondary.is-active {
  border-color: var(--accent-color, #2775b6);
  background: var(--accent-bg, rgba(39, 117, 182, 0.1));
  color: var(--accent-color, #2775b6);
}

.tc-preview-body-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
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
  width: 330px;
  flex-shrink: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--bg-editor, #ffffff);
  height: 100%;
  overflow: hidden;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.04);
}

.tc-preview-stage {
  max-width: 680px;
  margin: 0 auto;
  border-radius: 14px;
  background: var(--bg-preview, #ffffff);
  padding: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

/* ── Buttons ── */
.tc-btn-secondary,
.tc-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.tc-btn-primary {
  border: none;
  background: linear-gradient(135deg, var(--accent-color, #2775b6), var(--accent-hover, #1e5d93));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(39,117,182,0.28);
}

.tc-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(39,117,182,0.36);
}

.tc-btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(39,117,182,0.24);
}

.tc-empty {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #595959);
}

.tc-empty-icon {
  margin-bottom: 10px;
  opacity: 0.4;
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
