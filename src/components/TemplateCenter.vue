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
import { themes, getThemeSavedStyles, isBuiltInTheme } from '../utils/themePresets';
import { soundEngine } from '../utils/synthAudio';
import ArticlePreview from './ArticlePreview.vue';
import ThemeCustomizer from './ThemeCustomizer.vue';

const props = defineProps({
  currentTheme: {
    type: String,
    default: 'classic-indigo'
  }
});

const emit = defineEmits(['apply-theme', 'back-to-editor', 'save-theme', 'save-custom-theme']);

const searchQuery = ref('');
const selectedTheme = ref(null);
const showThemePanel = ref(false);
const selectedCustomStyles = ref({});
const isWeChatMode = ref(false);
const themeCustomizerRef = ref(null);
const themePreviewMarkdown = [
  '# 好的排版，让内容更好读',
  '把复杂的信息整理成清晰的层次，让读者更快抓住重点。好的主题会在标题、正文和强调内容之间建立稳定的节奏。',
  '',
  '## 先说结论，再展开说明',
  '使用 **明确的标题** 划分内容，用短段落保持阅读轻松。重要信息可以适度强调，避免整页都在争夺注意力。',
  '',
  '> 清楚的结构，让读者把注意力留给内容。',
  '',
  '### 用少量层级组织信息',
  '- 标题说明接下来的内容',
  '- 引用突出关键观点',
  '- 代码和表格承载细节',
  '',
  '```js',
  'const readingTime = 5;',
  'console.log(`约 ${readingTime} 分钟读完`);',
  '```',
  '',
  '| 内容 | 作用 |',
  '| --- | --- |',
  '| 标题 | 建立结构 |',
  '| 强调 | 标记重点 |'
].join('\n');

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
    sample: t.sample || themePreviewMarkdown
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

const themeGroups = computed(() => [
  {
    id: 'built-in',
    name: '内置主题',
    themes: filteredThemes.value.filter(theme => isBuiltInTheme(theme.id))
  },
  {
    id: 'custom',
    name: '我的主题',
    themes: filteredThemes.value.filter(theme => !isBuiltInTheme(theme.id))
  }
].filter(group => group.themes.length));

const isAppliedTheme = computed(() => selectedTheme.value?.id === props.currentTheme);

watch(filteredThemes, (list) => {
  if (!list.length) { selectedTheme.value = null; return; }
  const stillThere = list.some(t => selectedTheme.value && t.id === selectedTheme.value.id);
  if (!selectedTheme.value || !stillThere) {
    selectedTheme.value = list.find(theme => theme.id === props.currentTheme) || list[0];
  }
}, { immediate: true });

watch(() => props.currentTheme, (themeId) => {
  if (searchQuery.value.trim()) return;
  const appliedTheme = themeGallery.value.find(theme => theme.id === themeId);
  if (appliedTheme) selectedTheme.value = appliedTheme;
});

watch(selectedTheme, (newTheme) => {
  if (newTheme) {
    selectedCustomStyles.value = getThemeSavedStyles(newTheme.id);
  } else {
    selectedCustomStyles.value = {};
  }
}, { immediate: true });

function handleSelect(theme) {
  soundEngine.playClick();
  selectedTheme.value = theme;
}

function handleApply(theme) {
  if (!theme || theme.id === props.currentTheme) return;
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
  const targetKey = (sectionName === 'pre' || sectionName === 'code') ? 'code' : ((sectionName === 'th' || sectionName === 'td' || sectionName === 'thead' || sectionName === 'tbody' || sectionName === 'tr' || sectionName === 'tables') ? 'table' : sectionName);
  showThemePanel.value = true;
  await nextTick();
  themeCustomizerRef.value?.scrollToSection(targetKey);
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
          <span class="tc-count">{{ filteredThemes.length }} 个主题</span>
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
        <section v-for="group in themeGroups" :key="group.id" class="tc-list-section">
          <header class="tc-list-section-header">
            <span>{{ group.name }}</span>
            <span class="tc-list-section-count">{{ group.themes.length }}</span>
          </header>
          <div
            v-for="theme in group.themes"
            :key="theme.id"
            class="tc-list-item"
            :class="{
              'is-active': selectedTheme && selectedTheme.id === theme.id,
              'is-applied': props.currentTheme === theme.id
            }"
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
            <span v-if="props.currentTheme === theme.id" class="tc-list-state is-applied">当前使用</span>
            <span v-else-if="selectedTheme && selectedTheme.id === theme.id" class="tc-list-state">预览中</span>
          </div>
        </section>

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
            <span class="tc-preview-state" :class="{ 'is-applied': isAppliedTheme }">
              {{ isAppliedTheme ? '当前使用' : '正在预览' }}
            </span>
          </div>

          <div class="tc-header-actions">
            <!-- Mode toggle -->
            <button
              class="tc-btn-icon"
              :class="{ 'is-active': isWeChatMode }"
              @click="isWeChatMode = !isWeChatMode"
              :title="isWeChatMode ? '切换到桌面预览' : '切换到手机预览'"
              :aria-label="isWeChatMode ? '切换到桌面预览' : '切换到手机预览'"
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
              <span>{{ showThemePanel ? '关闭设置' : '编辑样式' }}</span>
            </button>

            <!-- Apply Theme button -->
            <button v-if="!isAppliedTheme" class="tc-btn-primary tc-apply-btn" @click="handleApply(selectedTheme)">
              <Check size="13" />
              <span>应用主题</span>
            </button>
          </div>
        </div>

        <div v-if="selectedTheme" class="tc-preview-body-container">
          <div class="tc-preview-wrap">
            <ArticlePreview
              :markdown="selectedTheme.sample || themePreviewMarkdown"
              docTitle="主题效果预览"
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
.tc-root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--bg-app, #F8F8F8);
  color: var(--text-main, #222222);
  font-family: var(--font-sans, 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif);
}

/* Ambient subtle space light */
.tc-glow {
  display: none;
}

/* ── Header (高度 48px，扁平紧凑) ── */
.tc-header {
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

.tc-back-btn:hover {
  background: #F4F4F5;
  color: #000000;
}

.tc-divider {
  width: 1px;
  height: 1.125rem;
  background: var(--border-color, #EDEDED);
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
  width: 1.375rem;
  height: 1.5rem;
  border-radius: 0;
  color: #536982;
  background: transparent;
  border: 0;
}

.tc-title-badge-sm {
  width: 1.25rem;
  height: 1.5rem;
  border-radius: 0;
}

.tc-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main, #222222);
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.tc-count {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #718096;
  background: transparent;
  padding: 0 0.125rem;
}

.tc-search-box {
  position: relative;
  width: clamp(15rem, 22vw, 20rem);
  height: 2.125rem;
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
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  background: #f8fafc;
  color: var(--text-main, #222222);
  font-size: 0.75rem;
  font-weight: 500;
  outline: none;
  transition: all 0.15s ease;
}

.tc-search-box input::placeholder {
  color: #A1A1AA;
}

.tc-search-box input:focus {
  border-color: #8ab4e8;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(39, 117, 182, 0.09);
}

.tc-clear-btn {
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

.tc-clear-btn:hover {
  background: #E4E4E7;
  color: #09090B;
}

/* ── Workspace / Two-pane (扁平克制布局) ── */
.tc-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  gap: 0.875rem;
  padding: 0.875rem 1rem 1rem;
  overflow: hidden;
  min-height: 0;
}

.tc-sidebar {
  width: 17rem;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.625rem;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #EDEDED);
  border-radius: 6px;
}

.tc-sidebar::-webkit-scrollbar {
  width: 0.25rem;
}

.tc-sidebar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

.tc-list-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tc-list-section-header {
  min-height: 1.75rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7a8798;
  font-size: 0.6875rem;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.tc-list-section-count {
  min-width: 1.25rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f1f4f8;
  color: #728198;
  font-size: 0.625rem;
  font-weight: 600;
}

/* ── List item (左侧列表项 4px 微圆角与扁平选中态) ── */
.tc-list-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  user-select: none;
}

.tc-list-item:hover {
  background: #f7f9fc;
}

.tc-list-item.is-active {
  background: #eef5fd;
  border-color: #d5e4f5;
}

.tc-list-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 2px;
  border-radius: 2px;
  background: #2775b6;
}

/* Theme color dot */
.tc-list-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* List info */
.tc-list-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.tc-list-title-row {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  min-width: 0;
}

.tc-list-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #18181B;
  letter-spacing: -0.01em;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-tag {
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.0625rem 0.375rem;
  border-radius: 3px;
  color: #71717A;
  background: #F4F4F5;
  white-space: nowrap;
  flex-shrink: 0;
}

.tc-list-item.is-active .tc-tag {
  color: #55718e;
  background: #e1ebf6;
}

.tc-list-desc {
  font-size: 0.6875rem;
  color: #78879a;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
}

.tc-list-state {
  flex-shrink: 0;
  padding: 0.1875rem 0.3125rem;
  border-radius: 3px;
  background: #e7f0fb;
  color: #3f6f9f;
  font-size: 0.625rem;
  font-weight: 600;
}

.tc-list-state.is-applied {
  background: #edf1f5;
  color: #64748b;
}

.tc-preview-state {
  flex-shrink: 0;
  padding: 0.1875rem 0.375rem;
  border-radius: 3px;
  background: #eaf2fc;
  color: #376fAA;
  font-size: 0.6875rem;
  font-weight: 600;
}

.tc-preview-state.is-applied {
  background: #edf1f5;
  color: #64748b;
}

.tc-list-check {
  color: #3d3939;
  flex-shrink: 0;
}

/* ── Right preview pane (6px 扁平圆角与 1px 细边框) ── */
.tc-preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid var(--border-color, #EDEDED);
  overflow: hidden;
}

.tc-preview-header {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid #EDEDED;
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
  font-weight: 600;
  color: var(--text-main, #18181B);
  letter-spacing: -0.01em;
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
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  background: var(--bg-card, #ffffff);
  color: var(--text-muted, #71717A);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tc-btn-icon:hover {
  background: #F4F4F5;
  color: #000000;
}

.tc-btn-icon.is-active {
  background: #3d3939;
  color: #ffffff;
  border-color: #3d3939;
}

.tc-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  height: 2rem;
  padding: 0 0.6875rem;
  border-radius: 6px;
  border: 1px solid var(--border-color, #EDEDED);
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #18181B);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.tc-btn-secondary:hover {
  background: #F4F4F5;
}

.tc-btn-secondary.is-active {
  background: #F4F4F5;
  border-color: #CBD5E1;
}

.tc-btn-primary.tc-apply-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  height: 2rem;
  padding: 0 0.875rem;
  border-radius: 6px;
  border: 1px solid var(--btn-primary-border);
  background: var(--btn-primary-bg, #3d3939);
  color: var(--btn-primary-text, #ffffff);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.tc-btn-primary.tc-apply-btn:hover {
  background: var(--btn-primary-hover, #2b2727);
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
  background: #f2f5f8;
}

.tc-preview-wrap :deep(.preview-body:not(.is-wechat-wrapper)) {
  background: #f2f5f8 !important;
}

.tc-preview-wrap :deep(.standard-screen-scroll) {
  width: min(calc(100% - 3rem), 880px);
  margin: 1.5rem auto;
  background: var(--bg-preview, #ffffff);
  border: 1px solid var(--border-color, #e1e4e8);
  box-sizing: border-box;
}

.tc-drawer-wrap {
  width: 20.5rem;
  flex-shrink: 0;
  border-left: 1px solid #EDEDED;
  background: var(--bg-card, #ffffff);
  height: 100%;
  overflow: hidden;
}

.tc-empty {
  padding: 3.75rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #71717A);
  font-size: 0.8125rem;
}

.tc-empty-icon {
  margin-bottom: 0.625rem;
  opacity: 0.4;
}

@media (max-width: 900px) {
  .tc-sidebar {
    width: 15rem;
  }

  .tc-preview-header {
    padding: 0 0.75rem;
  }

  .tc-header-actions {
    gap: 0.3125rem;
  }
}

@media (max-width: 760px) {
  .tc-header {
    height: auto;
    min-height: 3.5rem;
    padding: 0.5rem 0.875rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tc-header-left {
    min-width: 0;
  }

  .tc-search-box {
    width: 100%;
  }

  .tc-content {
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem 0.75rem;
    overflow-y: auto;
  }

  .tc-sidebar {
    width: 100%;
    max-height: 14rem;
    flex: 0 0 auto;
    padding: 0.5rem;
  }

  .tc-list-desc {
    -webkit-line-clamp: 1;
  }

  .tc-preview-pane {
    min-height: 60vh;
    flex: 1 0 60vh;
  }

  .tc-preview-header {
    height: auto;
    min-height: 3rem;
    padding: 0.5rem 0.625rem;
    flex-wrap: wrap;
  }

  .tc-preview-title {
    flex: 1 1 auto;
  }

  .tc-header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .tc-preview-wrap :deep(.standard-screen-scroll) {
    width: calc(100% - 1.25rem);
    margin: 0.625rem auto;
  }

  .tc-drawer-wrap {
    position: absolute;
    inset: 0 0 0 auto;
    z-index: 5;
    width: min(100%, 22rem);
    box-shadow: -8px 0 24px rgba(15, 23, 42, 0.12);
  }
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
  background: transparent;
  color: #9db3cc;
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

:global(html.dark) .tc-list-section-header,
:global(html[data-color-mode="dark"]) .tc-list-section-header {
  color: #9aa8ba;
}

:global(html.dark) .tc-list-section-count,
:global(html[data-color-mode="dark"]) .tc-list-section-count {
  background: #2b3037;
  color: #aab7c8;
}

:global(html.dark) .tc-list-name,
:global(html[data-color-mode="dark"]) .tc-list-name {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .tc-list-desc,
:global(html[data-color-mode="dark"]) .tc-list-desc {
  color: #9aa8ba;
}

:global(html.dark) .tc-list-state,
:global(html[data-color-mode="dark"]) .tc-list-state {
  background: #22364a;
  color: #a8cff5;
}

:global(html.dark) .tc-list-state.is-applied,
:global(html[data-color-mode="dark"]) .tc-list-state.is-applied,
:global(html.dark) .tc-preview-state.is-applied,
:global(html[data-color-mode="dark"]) .tc-preview-state.is-applied {
  background: #2b3037;
  color: #b2bdca;
}

:global(html.dark) .tc-preview-state,
:global(html[data-color-mode="dark"]) .tc-preview-state {
  background: #22364a;
  color: #a8cff5;
}

:global(html.dark) .tc-count,
:global(html[data-color-mode="dark"]) .tc-count {
  color: #9aa8ba;
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

:global(html.dark) .tc-preview-wrap,
:global(html[data-color-mode="dark"]) .tc-preview-wrap {
  background: #171a1e;
}

:global(html.dark) .tc-preview-wrap :deep(.preview-body:not(.is-wechat-wrapper)),
:global(html[data-color-mode="dark"]) .tc-preview-wrap :deep(.preview-body:not(.is-wechat-wrapper)) {
  background: #171a1e !important;
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
