<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { marked } from 'marked';
import {
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Copy,
  Check,
  CircleCheck,
  Sparkles,
  Palette
} from '@lucide/vue';
import { copyToWeChat, compileToWeChatHtml } from '../utils/wechatStyles';
import { soundEngine } from '../utils/synthAudio';
import ThemeCustomizer from './ThemeCustomizer.vue';
import ArticlePreview from './ArticlePreview.vue';
import confetti from 'canvas-confetti';

const props = defineProps({
  markdown: {
    type: String,
    default: ''
  },
  docTitle: {
    type: String,
    default: '未命名文档'
  },
  themeId: {
    type: String,
    default: 'classic-indigo'
  },
  codeThemeId: {
    type: String,
    default: 'atom-one-dark'
  },
  scrollPercentage: {
    type: Number,
    default: 0
  },
  activePane: {
    type: String,
    default: ''
  },
  previewVisible: {
    type: Boolean,
    default: true
  },
  customStyles: {
    type: Object,
    default: () => ({})
  },
  themePanelVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'update:codeThemeId',
  'scroll',
  'focusActive',
  'togglePreview',
  'open-launchpad',
  'update:customStyles',
  'save-theme',
  'save-custom-theme',
  'update:themePanelVisible'
]);

const activeCustomStyles = ref(JSON.parse(JSON.stringify(props.customStyles || {})));

watch(() => props.customStyles, (newVal) => {
  activeCustomStyles.value = JSON.parse(JSON.stringify(newVal || {}));
}, { deep: true, immediate: true });

function handleLiveStyleUpdate(val) {
  activeCustomStyles.value = val;
  if (val?.code?.codeThemeId && val.code.codeThemeId !== props.codeThemeId) {
    emit('update:codeThemeId', val.code.codeThemeId);
  }
  emit('update:customStyles', val);
}

function handleSaveCustomStyles(val) {
  activeCustomStyles.value = val;
  if (val?.code?.codeThemeId && val.code.codeThemeId !== props.codeThemeId) {
    emit('update:codeThemeId', val.code.codeThemeId);
  }
  emit('update:customStyles', val);
}

const customStyleVars = computed(() => {
  const s = activeCustomStyles.value || {};
  const vars = {};
  if (s.body?.color) vars['--ct-body-color'] = s.body.color;
  if (s.body?.backgroundColor) vars['--ct-body-bg'] = s.body.backgroundColor;

  if (s.h1?.color) vars['--ct-h1-color'] = s.h1.color;
  if (s.h1?.fontSize) vars['--ct-h1-size'] = s.h1.fontSize;
  if (s.h1?.fontWeight) vars['--ct-h1-weight'] = s.h1.fontWeight;

  if (s.h2?.color) vars['--ct-h2-color'] = s.h2.color;
  if (s.h2?.fontSize) vars['--ct-h2-size'] = s.h2.fontSize;
  if (s.h2?.fontWeight) vars['--ct-h2-weight'] = s.h2.fontWeight;

  if (s.h3?.color) vars['--ct-h3-color'] = s.h3.color;
  if (s.h3?.fontSize) vars['--ct-h3-size'] = s.h3.fontSize;
  if (s.h3?.fontWeight) vars['--ct-h3-weight'] = s.h3.fontWeight;

  if (s.h4?.color) vars['--ct-h4-color'] = s.h4.color;
  if (s.h4?.fontSize) vars['--ct-h4-size'] = s.h4.fontSize;
  if (s.h4?.fontWeight) vars['--ct-h4-weight'] = s.h4.fontWeight;

  if (s.h5?.color) vars['--ct-h5-color'] = s.h5.color;
  if (s.h5?.fontSize) vars['--ct-h5-size'] = s.h5.fontSize;
  if (s.h5?.fontWeight) vars['--ct-h5-weight'] = s.h5.fontWeight;

  if (s.h6?.color) vars['--ct-h6-color'] = s.h6.color;
  if (s.h6?.fontSize) vars['--ct-h6-size'] = s.h6.fontSize;
  if (s.h6?.fontWeight) vars['--ct-h6-weight'] = s.h6.fontWeight;

  if (s.p?.color) vars['--ct-p-color'] = s.p.color;
  if (s.p?.fontSize) vars['--ct-p-size'] = s.p.fontSize;
  if (s.p?.lineHeight) vars['--ct-p-lineheight'] = s.p.lineHeight;

  if (s.blockquote?.borderLeftColor) vars['--ct-bq-border'] = s.blockquote.borderLeftColor;
  if (s.blockquote?.backgroundColor) vars['--ct-bq-bg'] = s.blockquote.backgroundColor;
  if (s.blockquote?.textColor) vars['--ct-bq-text'] = s.blockquote.textColor;

  if (s.code?.backgroundColor) vars['--ct-code-bg'] = s.code.backgroundColor;
  if (s.code?.color) vars['--ct-code-color'] = s.code.color;
  if (s.code?.fontSize) vars['--ct-code-size'] = s.code.fontSize;

  if (s.pre?.backgroundColor) vars['--ct-pre-bg'] = s.pre.backgroundColor;

  if (s.strong?.color) vars['--ct-strong-color'] = s.strong.color;
  if (s.strong?.fontWeight) vars['--ct-strong-weight'] = s.strong.fontWeight;

  if (s.img?.borderRadius) vars['--ct-img-radius'] = s.img.borderRadius;
  return vars;
});

const injectedCustomCss = computed(() => {
  const css = activeCustomStyles.value?.customCss || '';
  if (!css || typeof css !== 'string') return '';

  // 1. Strip all CSS comments first so comments never pollute or corrupt selectors
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. Strip prefix aliases (#easymd, #nice, xiaofu, .markdown-body, .wechat-body)
  const cleaned = noComments.replace(/(?:#(?:easymd|nice)|xiaofu|\.markdown-body|\.wechat-body)\s*/g, ' ').trim();
  if (!cleaned) return '';

  // Universal isolation selector: strictly exclude material blocks and ANY descendants inside them
  const NOT_MAT = ':not([data-material="true"]):not([data-material="true"] *):not([data-material]):not([data-material] *):not(.material-block):not(.material-block *)';

  // Map selectors so they ONLY apply inside preview-body or wechat-body (never leaking to the editor)
  return cleaned.replace(/([^{}]+)\{([^}]+)\}/g, (m, selector, body) => {
    const rawSelectors = selector.split(',');
    const mapped = rawSelectors.map(s => {
      const tag = s.trim();
      if (!tag || tag === 'body' || tag === '#easymd' || tag === '#nice' || tag === '.markdown-body' || tag === ':scope') {
        return `.preview-body${NOT_MAT}, .wechat-body${NOT_MAT}, .tc-rendered-paper${NOT_MAT}`;
      }
      if (tag.startsWith('.')) {
        return `.preview-body ${tag}${NOT_MAT}, .wechat-body ${tag}${NOT_MAT}, .tc-rendered-paper ${tag}${NOT_MAT}`;
      }
      if (/^h[1-6]$/i.test(tag)) {
        const h = tag.toLowerCase();
        return `.preview-body ${h}${NOT_MAT}, .preview-body [data-heading="${h}"]${NOT_MAT}, .preview-body [data-heading="${h}"] > .content${NOT_MAT}, .wechat-body ${h}${NOT_MAT}, .wechat-body [data-heading="${h}"]${NOT_MAT}, .wechat-body [data-heading="${h}"] > .content${NOT_MAT}, .phone-screen-scroll ${h}${NOT_MAT}, .phone-screen-scroll [data-heading="${h}"]${NOT_MAT}, .tc-rendered-paper ${h}${NOT_MAT}, .tc-rendered-paper [data-heading="${h}"]${NOT_MAT}`;
      }
      if (tag === 'blockquote') {
        return `.preview-body blockquote${NOT_MAT}, .wechat-body blockquote${NOT_MAT}, .phone-screen-scroll blockquote${NOT_MAT}, .tc-rendered-paper blockquote${NOT_MAT}`;
      }
      if (tag === 'hr') {
        return `.preview-body hr${NOT_MAT}, .wechat-body hr${NOT_MAT}, .phone-screen-scroll hr${NOT_MAT}, .tc-rendered-paper hr${NOT_MAT}`;
      }
      if (tag === 'p') {
        return `.preview-body p${NOT_MAT}, .wechat-body p${NOT_MAT}, .phone-screen-scroll p${NOT_MAT}, .tc-rendered-paper p${NOT_MAT}`;
      }
      if (tag === 'code') {
        return `.preview-body code${NOT_MAT}:not([data-code-block="true"]):not(.code-snippet__fix), .preview-body span[data-tag="code"]${NOT_MAT}, .wechat-body code${NOT_MAT}:not([data-code-block="true"]):not(.code-snippet__fix)`;
      }
      if (tag === 'pre') {
        return `.preview-body pre${NOT_MAT}:not([data-code-block="true"]), .wechat-body pre${NOT_MAT}:not([data-code-block="true"])`;
      }
      if (tag === 'table' || tag === 'th' || tag === 'td') {
        return `.preview-body ${tag}${NOT_MAT}, .wechat-body ${tag}${NOT_MAT}, .tc-rendered-paper ${tag}${NOT_MAT}`;
      }
      if (tag === 'ul' || tag === 'ol' || tag === 'li') {
        return `.preview-body ${tag}${NOT_MAT}, .wechat-body ${tag}${NOT_MAT}, .tc-rendered-paper ${tag}${NOT_MAT}`;
      }
      if (tag === 'img') {
        return `.preview-body img${NOT_MAT}, .wechat-body img${NOT_MAT}, .tc-rendered-paper img${NOT_MAT}`;
      }
      return `.preview-body ${tag}${NOT_MAT}, .wechat-body ${tag}${NOT_MAT}, .phone-screen-scroll ${tag}${NOT_MAT}, .tc-rendered-paper ${tag}${NOT_MAT}`;
    }).filter(Boolean);

    // Append !important to declarations so custom CSS overrides base inline styles while preserving materials
    const importantBody = body.split(';')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.includes('!important')) return trimmed;
        return `${trimmed} !important`;
      })
      .filter(Boolean)
      .join('; ');

    return `${mapped.join(', ')} {\n${importantBody}\n}`;
  });
});

const activeThemeStyles = computed(() => {
  const theme = themes.find(t => t.id === props.themeId) || themes[0];
  return theme.styles;
});

const codeThemeStyles = computed(() => getCodeThemeStyles(props.codeThemeId));
const themeCustomizerRef = ref(null);

async function handleElementClick(sectionName) {
  const targetKey = (sectionName === 'pre' || sectionName === 'code') ? 'code' : ((sectionName === 'th' || sectionName === 'td' || sectionName === 'thead' || sectionName === 'tbody' || sectionName === 'tr' || sectionName === 'tables') ? 'table' : sectionName);
  if (!props.themePanelVisible) {
    emit('update:themePanelVisible', true);
  }
  await nextTick();
  setTimeout(() => {
    themeCustomizerRef.value?.scrollToSection(targetKey);
  }, 60);
}

const isWeChatMode = ref(localStorage.getItem('nicemd_wechat_mode') === 'true');
const copySuccess = ref(false);

watch(isWeChatMode, (newVal) => {
  localStorage.setItem('nicemd_wechat_mode', newVal.toString());
});

const toastList = ref([]);
let toastCounter = 0;

const getToastStyle = (index) => {
  const offset = toastList.value.length - 1 - index;
  if (offset === 0) {
    return {
      transform: 'translateY(0) scale(1)',
      zIndex: 100,
      opacity: 1,
    };
  } else if (offset === 1) {
    return {
      transform: 'translateY(-10px) scale(0.95)',
      zIndex: 90,
      opacity: 0.88,
    };
  } else if (offset === 2) {
    return {
      transform: 'translateY(-19px) scale(0.90)',
      zIndex: 80,
      opacity: 0.65,
    };
  } else {
    return {
      transform: 'translateY(-27px) scale(0.85)',
      zIndex: 70,
      opacity: 0,
    };
  }
};

const showToast = (msg) => {
  const id = ++toastCounter;
  toastList.value.push({ id, msg });
  if (toastList.value.length > 4) {
    toastList.value.shift();
  }
  
  // Confetti effect for premium feel!
  confetti({
    particleCount: 45,
    spread: 35,
    origin: { y: 0.85 },
    colors: ['#5f6caf', '#88c0d0', '#ffde47', '#7fa87f']
  });

  setTimeout(() => {
    toastList.value = toastList.value.filter(t => t.id !== id);
  }, 2600);
};

// Copy WeChat styled HTML — 100% clean WeChat MP Editor generator
const handleCopyWeChat = async () => {
  soundEngine.playChime();
  const rawHtml = marked.parse(props.markdown || '');
  const previewDom = document.querySelector('.article-preview-container') || document.querySelector('.markdown-body') || document.querySelector('#preview-content');
  const targetCodeTheme = activeCustomStyles.value?.code?.codeThemeId || props.codeThemeId || 'mdnice-classic';
  const success = await copyToWeChat(
    rawHtml,
    props.markdown,
    props.themeId,
    targetCodeTheme,
    activeCustomStyles.value?.customCss || '',
    activeCustomStyles.value,
    previewDom
  );
  if (success) {
    showToast('已复制微信公众号排版');
  }
};

// Copy Zhihu styled HTML
const handleCopyZhihu = async () => {
  soundEngine.playChime();
  const rawHtml = marked.parse(props.markdown || '');
  const htmlBlob = new Blob([rawHtml], { type: 'text/html' });
  const textBlob = new Blob([props.markdown || ''], { type: 'text/plain' });
  try {
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });
    await navigator.clipboard.write([item]);
    showToast('已复制知乎专栏排版');
  } catch (err) {
    console.error('[NiceMD] Zhihu copy failed, falling back to text copy:', err);
    await navigator.clipboard.writeText(props.markdown || '');
    showToast('已复制 Markdown 源码 (备用)');
  }
};

// Copy Toutiao styled HTML
const handleCopyToutiao = async () => {
  soundEngine.playChime();
  const rawHtml = marked.parse(props.markdown || '');
  const htmlBlob = new Blob([rawHtml], { type: 'text/html' });
  const textBlob = new Blob([props.markdown || ''], { type: 'text/plain' });
  try {
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });
    await navigator.clipboard.write([item]);
    showToast('已复制今日头条排版');
  } catch (err) {
    console.error('[NiceMD] Toutiao copy failed, falling back to text copy:', err);
    await navigator.clipboard.writeText(props.markdown || '');
    showToast('已复制 Markdown 源码 (备用)');
  }
};

// Copy raw Markdown source
const handleCopyMarkdownText = async () => {
  soundEngine.playChime();
  try {
    await navigator.clipboard.writeText(props.markdown || '');
    showToast('已复制 Markdown 源码');
  } catch (err) {
    console.error('[NiceMD] Markdown text copy failed:', err);
    showToast('复制失败');
  }
};
</script>

<template>
  <div 
    class="preview-panel" 
    @mouseenter="emit('focusActive', 'preview')"
  >
    <!-- Left Area: Main Preview header and body -->
    <div class="preview-main-content" v-show="previewVisible">
      <ArticlePreview
        :markdown="props.markdown"
        :docTitle="props.docTitle"
        :themeId="props.themeId"
        :codeThemeId="props.codeThemeId"
        :customStyles="activeCustomStyles"
        :isWeChatMode="isWeChatMode"
        :scrollPercentage="props.scrollPercentage"
        :activePane="props.activePane"
        @element-click="handleElementClick"
        @update:customStyles="handleLiveStyleUpdate"
        @open-customizer="handleElementClick"
        @scroll="p => emit('scroll', p)"
        @focusActive="p => emit('focusActive', p)"
      />
    </div>

    <!-- Theme Customizer Panel (between preview and slider) -->
    <div v-if="themePanelVisible" class="theme-sidebar-wrapper">
      <ThemeCustomizer
        ref="themeCustomizerRef"
        :modelValue="activeCustomStyles"
        :themeId="props.themeId"
        :codeThemeId="props.codeThemeId"
        :open="true"
        @update:modelValue="handleLiveStyleUpdate"
        @update:codeThemeId="val => emit('update:codeThemeId', val)"
        @save-custom-styles="handleSaveCustomStyles"
        @save-theme="v => emit('save-theme', v)"
        @save-custom-theme="v => emit('save-custom-theme', v)"
        @close="$emit('update:themePanelVisible', false)"
      />
    </div>

    <!-- Right Area: Icon Slider / Sidebar (56px wide, matching left sidebar) -->
    <aside class="preview-right-bar" :class="{ 'is-standalone': !previewVisible }">
      <div class="bar-top">
        <!-- 1. Mode Switcher: Web / Mobile (默认电脑模式并保持选中背景) -->
        <button
          class="bar-action-btn is-active"
          @click="isWeChatMode = !isWeChatMode"
          :title="isWeChatMode ? '当前为手机模拟，点击切换为网页标准预览' : '当前为电脑网页预览，点击切换为手机模拟预览'"
        >
          <Smartphone v-if="isWeChatMode" size="20" stroke-width="1.6" />
          <Monitor v-else size="20" stroke-width="1.6" />
        </button>

        <!-- 2. Preview toggle (默认展示预览时保持选中状态) -->
        <button
          class="bar-action-btn"
          :class="{ 'is-active': previewVisible }"
          @click="$emit('togglePreview')"
          :title="previewVisible ? '隐藏预览区（仅编辑）' : '恢复双栏布局'"
        >
          <Eye v-if="previewVisible" size="20" stroke-width="1.6" />
          <EyeOff v-else size="20" stroke-width="1.6" />
        </button>

        <!-- 3. Copy Options with hover popout (no tooltip to avoid overlay clutter) -->
        <div class="slider-trigger-container" data-no-tooltip="true">
          <button
            class="bar-action-btn copy-main-btn"
            data-no-tooltip="true"
            aria-label="一键复制"
          >
            <Copy size="19" stroke-width="1.7" />
          </button>

          <div class="copy-popout-panel">
            <div class="popout-header">
              <span class="popout-title">一键复制排版</span>
            </div>
            <div class="popout-items">
              <button class="popout-item" @click="handleCopyWeChat">
                <div class="popout-icon-box wechat-bg">
                  <img src="/svg/微信.svg" class="popout-brand-icon" alt="微信" />
                </div>
                <span class="popout-item-name">微信公众号</span>
              </button>

              <button class="popout-item" @click="handleCopyZhihu">
                <div class="popout-icon-box zhihu-bg">
                  <img src="/svg/知乎.svg" class="popout-brand-icon" alt="知乎" />
                </div>
                <span class="popout-item-name">知乎专栏</span>
              </button>

              <button class="popout-item" @click="handleCopyToutiao">
                <div class="popout-icon-box toutiao-bg">
                  <img src="/svg/今日头条.svg" class="popout-brand-icon" alt="今日头条" />
                </div>
                <span class="popout-item-name">今日头条</span>
              </button>

              <div class="popout-divider"></div>

              <button class="popout-item" @click="handleCopyMarkdownText">
                <div class="popout-icon-box md-bg">
                  <img src="/svg/md.svg" class="popout-brand-icon" alt="Markdown" />
                </div>
                <span class="popout-item-name">Markdown 源码</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Theme Customizer button -->
      <div class="bar-bottom">
        <button
          class="bar-action-btn"
          :class="{ 'is-active': themePanelVisible }"
          @click="$emit('update:themePanelVisible', !themePanelVisible)"
          title="自定义主题"
        >
          <Palette size="20" stroke-width="1.6" />
        </button>
      </div>
    </aside>

    <Teleport to="body">
      <div class="toast-deck-container">
        <TransitionGroup name="toast-deck">
          <div 
            v-for="(toast, index) in toastList" 
            :key="toast.id" 
            class="toast-deck-card"
            :style="getToastStyle(index)"
          >
            <CircleCheck size="16" :stroke-width="2" class="toast-check-icon" />
            <span class="toast-text">{{ toast.msg }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: row;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  background: transparent;
  overflow: hidden;
}

.preview-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: var(--bg-preview);
  transition: background 0.3s ease;
}

.theme-sidebar-wrapper {
  width: clamp(18.5rem, 23vw, 25rem);
  flex-shrink: 0;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border-color);
  box-shadow: var(--shadow-sidebar-right);
  box-sizing: border-box;
  z-index: 6;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  height: 48px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

.preview-header-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  font-family: 'Outfit', sans-serif;
}

.preview-header-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: 'Outfit', sans-serif;
}

/* Right-side slider / bar styling — independent, pinned to the right edge, matching left sidebar */
.preview-right-bar {
  width: 56px;
  flex-shrink: 0;
  background: var(--bg-sidebar, #f0f0ee);
  border-left: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 16px;
  box-sizing: border-box;
  z-index: 7;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.bar-top,
.bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.bar-action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  padding: 0;
}

.bar-action-btn:hover {
  color: var(--text-main, #0f172a);
  background: #ebebeb;
}

html.dark .bar-action-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
}

.bar-action-btn:active {
  transform: scale(0.96);
}

.bar-action-btn.is-active {
  color: var(--wandor-dark, #0a0a0a);
  background: rgba(0, 0, 0, 0.07);
  border-radius: 8px;
  box-shadow: none;
}

html.dark .bar-action-btn.is-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: none;
}

.slider-trigger-container {
  position: relative;
}

.copy-popout-panel {
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) translateX(-4px);
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-radius: 10px;
  box-shadow: 
    0 10px 28px rgba(0, 0, 0, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 156px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 100;
  font-family: var(--font-sans);
}

/* Invisible bridge so moving cursor between button and panel doesn't flicker/close */
.copy-popout-panel::after {
  content: '';
  position: absolute;
  right: -12px;
  top: 0;
  width: 12px;
  height: 100%;
}

/* Trigger display on hover */
.slider-trigger-container:hover .copy-popout-panel {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(-50%) translateX(0);
}

.popout-header {
  padding: 5px 6px 5px;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  margin-bottom: 2px;
}

.popout-title {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted, #71717a);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.popout-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.popout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-main, #18181b);
  padding: 6px 7px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.14s ease;
  width: 100%;
  box-sizing: border-box;
}

.popout-item:hover {
  background: var(--bg-capsule, #f4f4f5);
}

html.dark .popout-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.popout-icon-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-app, #fafafa);
  transition: transform 0.14s ease;
}

.popout-item:hover .popout-icon-box {
  transform: scale(1.08);
}

.popout-brand-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
}

.popout-item-name {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-main, #18181b);
  line-height: 1;
  white-space: nowrap;
}

.popout-divider {
  height: 1px;
  background: var(--border-color, rgba(0, 0, 0, 0.06));
  margin: 3px 4px;
}

/* Card Deck 3D Layered Notifications matching Screenshot */
.toast-deck-container {
  position: fixed;
  right: 28px;
  bottom: 28px;
  width: auto;
  min-width: 220px;
  height: 42px;
  z-index: 999999;
  pointer-events: none;
}

.toast-deck-card {
  position: absolute;
  right: 0;
  bottom: 0;
  background: var(--bg-card, #ffffff);
  color: var(--text-main, #18181b);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-radius: 8px;
  box-shadow: 
    0 8px 24px -2px rgba(0, 0, 0, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 9px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  user-select: none;
  transform-origin: center bottom;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.35s ease;
  white-space: nowrap;
}

html.dark .toast-deck-card {
  background: #22252a;
  border-color: rgba(255, 255, 255, 0.12);
  color: #f3f4f6;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.toast-check-icon {
  color: #10b981;
  flex-shrink: 0;
}

.toast-text {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
}

/* Toast Deck Vue Transitions */
.toast-deck-enter-active,
.toast-deck-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-deck-enter-from {
  opacity: 0 !important;
  transform: translateY(24px) scale(0.9) !important;
}

.toast-deck-leave-to {
  opacity: 0 !important;
  transform: translateY(12px) scale(0.92) !important;
}
.preview-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0;
  background-color: var(--bg-editor);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.preview-body::-webkit-scrollbar {
  display: none;
}
/* Standard Markdown Styles */
.preview-body:not(.is-wechat-wrapper) {
  display: block;
  padding: 0;
  background-color: var(--bg-editor);
  background-image: none;
}

.markdown-body {
  width: 100%;
  max-width: 100%;
  color: var(--ct-body-color, var(--text-main));
  background: transparent;
  line-height: 1.8;
  font-size: 16px;
  padding: 0px 24px;
  border-radius: 0;
  border: none;
  box-shadow: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-body :deep(h1) {
  color: var(--ct-h1-color, var(--text-main));
  font-size: var(--ct-h1-size, 1.9em);
  font-weight: var(--ct-h1-weight, 800);
  margin-top: 0.4em;
  margin-bottom: 0.8em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: -0.4px;
}

.markdown-body :deep(h2) {
  color: var(--ct-h2-color, var(--text-main));
  font-size: var(--ct-h2-size, 1.5em);
  font-weight: var(--ct-h2-weight, 700);
  margin-top: 1.4em;
  margin-bottom: 0.7em;
  padding-bottom: 0.2em;
  letter-spacing: -0.3px;
}

.markdown-body :deep(h3) {
  color: var(--ct-h3-color, var(--text-main));
  font-size: var(--ct-h3-size, 1.2em);
  font-weight: var(--ct-h3-weight, 700);
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}

.markdown-body :deep(p) {
  color: var(--ct-p-color, var(--text-main));
  font-size: var(--ct-p-size, 16px);
  line-height: var(--ct-p-lineheight, 1.9);
  margin-bottom: 0;
  padding-top: 8px;
  padding-bottom: 8px;
}

.markdown-body :deep(blockquote) {
  padding: 14px 22px;
  margin: 0 0 1.3em 0;
  border-left: 4px solid var(--ct-bq-border, var(--accent-color));
  background: var(--ct-bq-bg, var(--accent-bg));
  border-radius: 0 8px 8px 0;
}

.markdown-body :deep(blockquote p) {
  color: var(--ct-bq-text, var(--text-muted));
  margin-bottom: 0;
}

.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 24px;
  margin-bottom: 1.2em;
}

.markdown-body :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-body :deep(:not(pre) > code) {
  font-family: "SF Mono", Consolas, Monaco, monospace;
  font-size: var(--ct-code-size, 0.88em);
  background: var(--ct-code-bg, var(--code-bg));
  color: var(--ct-code-color, var(--code-text));
  padding: 2px 7px;
  border-radius: 5px;
}

.markdown-body :deep(pre) {
  position: relative;
  background-color: var(--ct-pre-bg, var(--hljs-bg, #282c34));
  color: var(--hljs-text, #abb2bf);
  padding: 16px 16px 16px 16px;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 6px 18px;
  text-align: left;
  overflow-x: auto !important;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  margin-bottom: 1.2em;
}

.markdown-body :deep(pre::-webkit-scrollbar) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.markdown-body :deep(pre)::after {
  content: attr(data-lang);
  position: absolute;
  top: 7px;
  right: 16px;
  color: var(--hljs-mac-text, #5c6370);
  font-family: var(--font-heading), sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.markdown-body :deep(pre code) {
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 13px !important;
  display: -webkit-box !important;
  min-width: 100%;
  white-space: pre;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1.2em;
}

.markdown-body :deep(th), .markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
}

.markdown-body :deep(th) {
  background: var(--accent-bg);
}

.markdown-body :deep(strong),
.markdown-body :deep(b) {
  color: var(--ct-strong-color, var(--accent-color));
  font-weight: var(--ct-strong-weight, 700);
  background: transparent;
  border: none;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--ct-img-radius, 8px);
  margin: 16px 0;
}

/* WeChat Simulated Phone Frame */
.preview-body.is-wechat-wrapper {
  background: rgba(0, 0, 0, 0.04);
  padding: 1.875rem 1.25rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  min-height: 100%;
}

.wechat-phone-frame {
  display: flex;
  flex-direction: column;
  width: 23.5rem;
  max-width: 100%;
  height: 46.5rem;
  min-height: 44rem;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 2.5rem;
  border: 0.625rem solid #1c1c1e;
  box-shadow: 0 1.25rem 2.5rem rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08);
  font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", sans-serif;
  color: #3f3f3f;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  margin: auto 0;
}

.phone-screen-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  flex-direction: column;
}

.phone-screen-scroll::-webkit-scrollbar {
  display: none;
}

.phone-dynamic-island {
  width: 5rem;
  height: 1.125rem;
  background: #000000;
  border-radius: 0.75rem;
  position: absolute;
  top: 0.375rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1.5rem 0.25rem 1.5rem;
  background: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid #f2f2f2;
}

.phone-home-indicator {
  width: 7.5rem;
  height: 0.25rem;
  background: #000000;
  border-radius: 0.125rem;
  margin: 0.625rem auto 0.375rem auto;
  flex-shrink: 0;
  opacity: 0.25;
}

.phone-article-header {
  padding: 20px 20px 10px 20px;
  background: #ffffff;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.phone-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 10px;
  color: #000;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  word-break: break-all;
  overflow-wrap: anywhere;
  word-wrap: break-word;
  white-space: normal;
}

.phone-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.phone-author {
  color: #576b95;
  font-weight: 600;
}

.phone-account {
  color: #576b95;
}

.wechat-body {
  padding: 10px 20px 20px 20px;
  color: var(--ct-body-color, #3f3f3f);
  font-size: 15px;
  line-height: 1.75;
  letter-spacing: 0.05em;
  background: var(--ct-body-bg, #ffffff);
  text-align: justify;
}

.wechat-body :deep(h1) {
  color: var(--ct-h1-color, #000);
  font-size: var(--ct-h1-size, 22px);
  font-weight: var(--ct-h1-weight, bold);
  margin-top: 30px;
  margin-bottom: 20px;
  text-align: center;
  padding-bottom: 8px;
}

.wechat-body :deep(h2) {
  color: var(--ct-h2-color, #000);
  font-size: var(--ct-h2-size, 18px);
  font-weight: var(--ct-h2-weight, bold);
  margin-top: 26px;
  margin-bottom: 16px;
  padding-left: 10px;
}

.wechat-body :deep(h3) {
  color: var(--ct-h3-color, #000);
  font-size: var(--ct-h3-size, 16px);
  font-weight: var(--ct-h3-weight, bold);
  margin-top: 22px;
  margin-bottom: 12px;
}

.wechat-body :deep(h4:not([data-material="true"])), .wechat-body :deep([data-heading="h4"]:not([data-material="true"])) {
  color: var(--ct-h4-color, inherit);
  font-size: var(--ct-h4-size, 15px);
  font-weight: var(--ct-h4-weight, bold);
  margin-top: 18px;
  margin-bottom: 8px;
}

.wechat-body :deep(h5:not([data-material="true"])), .wechat-body :deep([data-heading="h5"]:not([data-material="true"])) {
  color: var(--ct-h5-color, inherit);
  font-size: var(--ct-h5-size, 14px);
  font-weight: var(--ct-h5-weight, bold);
  margin-top: 14px;
  margin-bottom: 6px;
}

.wechat-body :deep(h6:not([data-material="true"])), .wechat-body :deep([data-heading="h6"]:not([data-material="true"])) {
  color: var(--ct-h6-color, inherit);
  font-size: var(--ct-h6-size, 13px);
  font-weight: var(--ct-h6-weight, bold);
  margin-top: 14px;
  margin-bottom: 6px;
}

.wechat-body :deep(p) {
  color: var(--ct-p-color, #3f3f3f);
  font-size: var(--ct-p-size, 15px);
  line-height: var(--ct-p-lineheight, 1.75);
  margin-bottom: 1.5em;
}

.wechat-body :deep(blockquote) {
  padding: 12px 18px;
  margin: 0 0 1.5em 0;
  border-left: 4px solid var(--ct-bq-border, #576b95);
  background: var(--ct-bq-bg, transparent);
  border-radius: 4px;
  font-size: 14px;
}

.wechat-body :deep(blockquote p) {
  margin-bottom: 0;
  color: var(--ct-bq-text, #7f7f7f);
}

.wechat-body :deep(strong),
.wechat-body :deep(b) {
  color: var(--ct-strong-color, inherit);
  font-weight: var(--ct-strong-weight, 700);
}

.wechat-body :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
  border-radius: var(--ct-img-radius, 8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.wechat-body :deep(section[data-role="image-container"]) {
  margin: 20px 0;
  text-align: center;
}

.wechat-body :deep(ul), .wechat-body :deep(ol) {
  padding-left: 20px;
  margin-bottom: 1.5em;
}

.wechat-body :deep(li) {
  margin-bottom: 0.5em;
}

.wechat-body :deep(code) {
  font-family: monospace;
  font-size: var(--ct-code-size, 13px);
  background: var(--ct-code-bg, #f5f6fa);
  color: var(--ct-code-color, #ff502c);
  padding: 2px 6px;
  border-radius: 3px;
}

.wechat-body :deep(pre) {
  background: var(--ct-pre-bg, #282c34);
  padding: 8px 14px 14px 14px;
  /* border-radius: 0 0 5px 5px; */
  /* box-shadow: rgba(0, 0, 0, 0.55) 0px 2px 10px; */
  text-align: left;
  overflow-x: auto !important;
  margin: 0;
  white-space: pre !important;
  word-break: normal !important;
  word-wrap: normal !important;
}

.wechat-body :deep(pre code) {
  background: transparent;
  color: #abb2bf;
  padding: 0;
  border-radius: 0;
  font-size: 13px;
  display: -webkit-box !important;
  min-width: 100%;
  white-space: pre !important;
  word-break: normal !important;
  word-wrap: normal !important;
}

.phone-article-footer {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  border-top: 1px solid #f2f2f2;
  background: #ffffff;
}

.read-more {
  color: #576b95;
}

.math-block {
  text-align: center;
  margin: 1.2em 0;
  overflow-x: auto;
}
.math-inline {
  display: inline-block;
  vertical-align: middle;
  margin: 0 2px;
  white-space: nowrap;
}
.markdown-body :deep(.katex) {
  display: inline-block;
  vertical-align: middle;
  color: var(--accent-color, #2775b6);
}
.markdown-body :deep(.katex-display) {
  display: block;
  margin: 1.2em 0;
  text-align: center;
}
.markdown-body :deep(.math-inline-img),
.wechat-body :deep(.math-inline-img) {
  display: inline-block !important;
  vertical-align: middle !important;
  margin: 0 4px !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
.markdown-body :deep(.math-block-img),
.wechat-body :deep(.math-block-img) {
  display: block !important;
  margin: 16px auto !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
.mermaid {
  display: flex;
  justify-content: center;
  margin: 1.5em 0;
  width: 100%;
}

.offscreen-pane {
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  height: 0 !important;
  overflow: hidden !important;
}

/* ── ultra-thin blended code-block scrollbar ── */
.markdown-body :deep(pre)::-webkit-scrollbar,
.wechat-body :deep(pre)::-webkit-scrollbar {
  height: 4px;
}
.markdown-body :deep(pre)::-webkit-scrollbar-track,
.wechat-body :deep(pre)::-webkit-scrollbar-track {
  background: transparent;
}
.markdown-body :deep(pre)::-webkit-scrollbar-thumb,
.wechat-body :deep(pre)::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
}
.markdown-body :deep(pre):hover::-webkit-scrollbar-thumb,
.wechat-body :deep(pre):hover::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
}
</style>
