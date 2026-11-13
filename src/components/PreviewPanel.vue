<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import {
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Copy,
  Check,
  CircleCheck,
  Sparkles,
  Palette,
  Send
} from '@lucide/vue';
import {
  copyToWeChat,
  compileToWeChatHtml,
  stripOssProcessFromHtml,
  stripOssProcessFromMarkdown
} from '../utils/wechatStyles';
import { parseMarkdownWithDocToc } from '../utils/markdownToc';
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
  if (s.p?.letterSpacing) vars['--ct-p-spacing'] = s.p.letterSpacing;
  if (s.p?.textIndent) vars['--ct-p-indent'] = s.p.textIndent;
  if (s.p?.textAlign) vars['--ct-p-align'] = s.p.textAlign;
  if (s.p?.marginBottom) vars['--ct-p-margin-bottom'] = s.p.marginBottom;

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

// ── Right Bar Liquid Glider (Muse Motion) ──
const rightBarRef = ref(null);
const rightGliderRef = ref(null);
const rightPaletteBtnRef = ref(null);
let rightStretchTimer = null;

function moveRightGliderToEl(btn, stretch = true) {
  if (!btn || !rightGliderRef.value || !rightBarRef.value) return;
  const barRect = rightBarRef.value.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();

  const top = btnRect.top - barRect.top;
  const left = btnRect.left - barRect.left;

  const prevY = parseFloat(rightGliderRef.value.dataset.y || top);
  const dist = Math.abs(top - prevY);
  rightGliderRef.value.dataset.y = top;

  const stretchY = stretch ? 1 + Math.min(dist / 500, 0.16) : 1;

  rightGliderRef.value.style.width = `${btnRect.width}px`;
  rightGliderRef.value.style.height = `${btnRect.height}px`;
  rightGliderRef.value.style.transform = `translate(${left}px, ${top}px) scaleY(${stretchY})`;
  rightGliderRef.value.classList.add('is-visible');

  clearTimeout(rightStretchTimer);
  if (stretchY > 1.01) {
    rightStretchTimer = setTimeout(() => {
      if (rightGliderRef.value) {
        rightGliderRef.value.style.transform = `translate(${left}px, ${top}px) scaleY(1)`;
      }
    }, 380 * 0.55);
  }
}

function handleRightBarHover(e) {
  const target = e.currentTarget;
  if (target) {
    moveRightGliderToEl(target, true);
  }
}

function handleRightBarMouseLeave() {
  if (props.themePanelVisible && rightPaletteBtnRef.value) {
    moveRightGliderToEl(rightPaletteBtnRef.value, true);
  } else if (rightGliderRef.value) {
    rightGliderRef.value.classList.remove('is-visible');
  }
}

watch(() => props.themePanelVisible, async (visible) => {
  if (!visible) {
    document.querySelectorAll('.preview-active-target').forEach(el => el.classList.remove('preview-active-target'));
    if (rightGliderRef.value) rightGliderRef.value.classList.remove('is-visible');
  } else {
    await nextTick();
    if (rightPaletteBtnRef.value) {
      moveRightGliderToEl(rightPaletteBtnRef.value, true);
    }
  }
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
  const rawHtml = parseMarkdownWithDocToc(props.markdown || '');
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
  const rawHtml = parseMarkdownWithDocToc(props.markdown || '');
  const cleanHtml = stripOssProcessFromHtml(rawHtml);
  const cleanMarkdown = stripOssProcessFromMarkdown(props.markdown || '');
  const htmlBlob = new Blob([cleanHtml], { type: 'text/html' });
  const textBlob = new Blob([cleanMarkdown], { type: 'text/plain' });
  try {
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });
    await navigator.clipboard.write([item]);
    showToast('已复制知乎专栏排版');
  } catch (err) {
    console.error('[NiceMD] Zhihu copy failed, falling back to text copy:', err);
    await navigator.clipboard.writeText(cleanMarkdown);
    showToast('已复制 Markdown 源码 (备用)');
  }
};

// Copy Toutiao styled HTML
const handleCopyToutiao = async () => {
  soundEngine.playChime();
  const rawHtml = parseMarkdownWithDocToc(props.markdown || '');
  const cleanHtml = stripOssProcessFromHtml(rawHtml);
  const cleanMarkdown = stripOssProcessFromMarkdown(props.markdown || '');
  const htmlBlob = new Blob([cleanHtml], { type: 'text/html' });
  const textBlob = new Blob([cleanMarkdown], { type: 'text/plain' });
  try {
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });
    await navigator.clipboard.write([item]);
    showToast('已复制今日头条排版');
  } catch (err) {
    console.error('[NiceMD] Toutiao copy failed, falling back to text copy:', err);
    await navigator.clipboard.writeText(cleanMarkdown);
    showToast('已复制 Markdown 源码 (备用)');
  }
};

// Copy raw Markdown source
const handleCopyMarkdownText = async () => {
  soundEngine.playChime();
  try {
    const cleanMarkdown = stripOssProcessFromMarkdown(props.markdown || '');
    await navigator.clipboard.writeText(cleanMarkdown);
    showToast('已复制 Markdown 源码');
  } catch (err) {
    console.error('[NiceMD] Markdown text copy failed:', err);
    showToast('复制失败');
  }
};

const POPOUT_VIEWPORT_PADDING = 8;
const POPOUT_TRIGGER_GAP = 8;

const copyTriggerRef = ref(null);
const copyPopoutRef = ref(null);
const showCopyMenu = ref(false);
const isCopyMenuPinned = ref(false);
const copyPopoutStyle = ref({});
let copyHoverCloseTimer = null;

const copyPlatformItems = [
  { key: 'wechat', label: '微信公众号', icon: '/svg/微信.svg', boxClass: 'wechat-bg', action: handleCopyWeChat },
  { key: 'zhihu', label: '知乎专栏', icon: '/svg/知乎.svg', boxClass: 'zhihu-bg', action: handleCopyZhihu },
  { key: 'toutiao', label: '今日头条', icon: '/svg/今日头条.svg', boxClass: 'toutiao-bg', action: handleCopyToutiao }
];

const clearCopyHoverTimer = () => {
  if (copyHoverCloseTimer) {
    clearTimeout(copyHoverCloseTimer);
    copyHoverCloseTimer = null;
  }
};

const handleCopyOutsidePointerDown = (e) => {
  if (!showCopyMenu.value) return;
  const target = e.target;
  if (copyTriggerRef.value?.contains(target) || copyPopoutRef.value?.contains(target)) {
    return;
  }
  closeCopyMenu();
};

const handleCopyKeyDown = (e) => {
  if (e.key === 'Escape' && showCopyMenu.value) {
    closeCopyMenu();
  }
};

const attachCopyMenuListeners = () => {
  window.addEventListener('mousedown', handleCopyOutsidePointerDown, true);
  window.addEventListener('keydown', handleCopyKeyDown);
  window.addEventListener('resize', closeCopyMenu);
};

const detachCopyMenuListeners = () => {
  window.removeEventListener('mousedown', handleCopyOutsidePointerDown, true);
  window.removeEventListener('keydown', handleCopyKeyDown);
  window.removeEventListener('resize', closeCopyMenu);
};

const updateCopyPopoutPosition = async () => {
  copyPopoutStyle.value = { top: '-9999px', left: '-9999px', visibility: 'hidden' };
  await nextTick();
  if (!showCopyMenu.value || !copyTriggerRef.value || !copyPopoutRef.value) return;

  const anchorRect = copyTriggerRef.value.getBoundingClientRect();
  const panelRect = copyPopoutRef.value.getBoundingClientRect();
  const maxTop = Math.max(POPOUT_VIEWPORT_PADDING, window.innerHeight - panelRect.height - POPOUT_VIEWPORT_PADDING);
  const top = Math.min(Math.max(anchorRect.top, POPOUT_VIEWPORT_PADDING), maxTop);
  const left = Math.max(POPOUT_VIEWPORT_PADDING, anchorRect.left - panelRect.width - POPOUT_TRIGGER_GAP);

  copyPopoutStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    visibility: 'visible'
  };
};

const openCopyMenu = ({ pinned = false } = {}) => {
  clearCopyHoverTimer();
  if (pinned) isCopyMenuPinned.value = true;
  if (!showCopyMenu.value) {
    showCopyMenu.value = true;
    attachCopyMenuListeners();
    updateCopyPopoutPosition();
  }
};

const closeCopyMenu = () => {
  clearCopyHoverTimer();
  isCopyMenuPinned.value = false;
  if (showCopyMenu.value) {
    showCopyMenu.value = false;
    detachCopyMenuListeners();
  }
};

const scheduleCloseCopyMenu = () => {
  if (isCopyMenuPinned.value) return;
  clearCopyHoverTimer();
  copyHoverCloseTimer = setTimeout(() => {
    closeCopyMenu();
  }, 140);
};

const toggleCopyMenu = () => {
  if (showCopyMenu.value && isCopyMenuPinned.value) {
    closeCopyMenu();
    return;
  }
  openCopyMenu({ pinned: true });
};

const handleSelectCopyAction = (actionFn) => {
  closeCopyMenu();
  actionFn();
};

onUnmounted(() => {
  clearCopyHoverTimer();
  detachCopyMenuListeners();
});
</script>

<template>
  <div 
    class="preview-panel" 
    @mouseenter="emit('focusActive', 'preview')"
  >
    <!-- Left Area: Main Preview header and body -->
    <div class="preview-main-content" :class="{ 'is-collapsed': !previewVisible }">
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
    <Transition name="theme-slide">
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
    </Transition>

    <!-- Preview tools (Right Sidebar with Muse Glider & Micro-interactions) -->
    <aside
      class="preview-right-bar"
      ref="rightBarRef"
      :class="{ 'is-standalone': !previewVisible }"
      data-no-tooltip="true"
      @mouseleave="handleRightBarMouseLeave"
    >
      <!-- ★ 右侧栏液体滑块 ★ -->
      <span class="right-glider" ref="rightGliderRef" aria-hidden="true"></span>

      <div class="bar-top">
        <button
          class="bar-publish-btn right-nav-target"
          @click="$emit('open-launchpad')"
          @mouseenter="handleRightBarHover"
          @focus="handleRightBarHover"
          data-no-tooltip="true"
          aria-label="发布文章"
        >
          <span class="right-btn-icon ic-plane">
            <Send size="18" stroke-width="1.8" class="bar-publish-icon" />
          </span>
          <div class="right-tooltip" role="tooltip">
            <span class="right-tooltip-label">发布与多渠道分发</span>
          </div>
        </button>

        <div
          ref="copyTriggerRef"
          class="slider-trigger-container"
          data-no-tooltip="true"
          @mouseenter="openCopyMenu()"
          @mouseleave="scheduleCloseCopyMenu"
        >
          <button
            class="bar-action-btn copy-main-btn right-nav-target"
            :class="{ 'is-active': showCopyMenu }"
            data-no-tooltip="true"
            aria-label="复制排版内容"
            aria-haspopup="menu"
            :aria-expanded="showCopyMenu"
            @mouseenter="handleRightBarHover"
            @focus="handleRightBarHover"
            @click.stop="toggleCopyMenu"
          >
            <span class="right-btn-icon ic-copy">
              <Copy size="18" stroke-width="1.7" />
            </span>
            <div class="right-tooltip" role="tooltip">
              <span class="right-tooltip-label">复制排版内容</span>
              <span class="right-tooltip-shortcut">一键格式化</span>
            </div>
          </button>
        </div>

        <span class="bar-divider"></span>

        <button
          type="button"
          class="bar-action-btn preview-mode-toggle-btn right-nav-target"
          :class="{ 'is-active': isWeChatMode, 'is-current-mode': !isWeChatMode }"
          :aria-pressed="isWeChatMode"
          :aria-label="isWeChatMode ? '切换为电脑预览' : '切换为手机模拟预览'"
          data-no-tooltip="true"
          @mouseenter="handleRightBarHover"
          @focus="handleRightBarHover"
          @click="isWeChatMode = !isWeChatMode"
        >
          <span class="right-btn-icon ic-device">
            <Transition name="mode-icon-swap" mode="out-in">
              <Smartphone v-if="isWeChatMode" key="mobile" size="18" stroke-width="1.7" />
              <Monitor v-else key="desktop" size="18" stroke-width="1.7" />
            </Transition>
          </span>
          <div class="right-tooltip" role="tooltip">
            <span class="right-tooltip-label">{{ isWeChatMode ? '切换为电脑预览' : '切换为手机模拟预览' }}</span>
          </div>
        </button>

        <button
          class="bar-action-btn right-nav-target"
          :class="{ 'is-active': previewVisible }"
          :aria-pressed="previewVisible"
          data-no-tooltip="true"
          @mouseenter="handleRightBarHover"
          @focus="handleRightBarHover"
          @click="$emit('togglePreview')"
          :aria-label="previewVisible ? '隐藏预览区' : '显示预览区'"
        >
          <span class="right-btn-icon ic-eye">
            <Eye v-if="previewVisible" size="18" stroke-width="1.7" />
            <EyeOff v-else size="18" stroke-width="1.7" />
          </span>
          <div class="right-tooltip" role="tooltip">
            <span class="right-tooltip-label">{{ previewVisible ? '隐藏预览区' : '显示预览区' }}</span>
          </div>
        </button>
      </div>

      <div class="bar-bottom">
        <button
          ref="rightPaletteBtnRef"
          class="bar-action-btn right-nav-target"
          :class="{ 'is-active': themePanelVisible }"
          :aria-pressed="themePanelVisible"
          data-no-tooltip="true"
          @mouseenter="handleRightBarHover"
          @focus="handleRightBarHover"
          @click="$emit('update:themePanelVisible', !themePanelVisible)"
          aria-label="自定义主题"
        >
          <span class="right-btn-icon ic-theme">
            <Palette size="18" stroke-width="1.7" />
          </span>
          <div class="right-tooltip" role="tooltip">
            <span class="right-tooltip-label">自定义主题与排版</span>
          </div>
        </button>
      </div>
    </aside>

    <Teleport to="body">
      <div
        v-if="showCopyMenu"
        ref="copyPopoutRef"
        class="copy-popout-panel"
        :style="copyPopoutStyle"
        role="menu"
        @mouseenter="clearCopyHoverTimer"
        @mouseleave="scheduleCloseCopyMenu"
      >
        <div class="popout-header">
          <span class="popout-title">一键复制排版</span>
        </div>
        <div class="popout-items">
          <button
            v-for="item in copyPlatformItems"
            :key="item.key"
            class="popout-item"
            role="menuitem"
            @click="handleSelectCopyAction(item.action)"
          >
            <div class="popout-icon-box" :class="item.boxClass">
              <img :src="item.icon" class="popout-brand-icon" :alt="item.label" />
            </div>
            <span class="popout-item-name">{{ item.label }}</span>
          </button>

          <div class="popout-divider"></div>

          <button class="popout-item" role="menuitem" @click="handleSelectCopyAction(handleCopyMarkdownText)">
            <div class="popout-icon-box md-bg">
              <img src="/svg/md.svg" class="popout-brand-icon" alt="Markdown" />
            </div>
            <span class="popout-item-name">Markdown 源码</span>
          </button>
        </div>
      </div>

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
  opacity: 1;
  transform: translateX(0);
  transition: background 0.3s ease, opacity 0.3s ease, transform 0.46s cubic-bezier(0.22, 1, 0.36, 1);
}

.preview-main-content.is-collapsed {
  opacity: 0;
  transform: translateX(12px);
  pointer-events: none;
}

.theme-sidebar-wrapper {
  width: clamp(16.5rem, 20vw, 26rem);
  max-width: 46%;
  min-width: 0;
  flex: 0 1 auto;
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

/* 抽屉平滑滑入动效 (Muse Ease Glide Drawer) */
.theme-slide-enter-active,
.theme-slide-leave-active {
  transition: transform 0.42s var(--ease-glide), opacity 0.3s ease;
}

.theme-slide-enter-from,
.theme-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
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
  font-family: var(--font-heading);
}

.preview-header-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-sans);
}

/* ── 右侧侧边栏 (Right Navigation Bar with Muse Glider) ── */
.preview-right-bar {
  width: 50px;
  flex-shrink: 0;
  background: var(--bg-card, #FFFFFF);
  border-left: 1px solid var(--border-subtle, #EDEDF0);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 14px;
  box-sizing: border-box;
  z-index: 70;
  position: relative;
  transition: background 0.25s ease, border-color 0.25s ease;
}

html.dark .preview-right-bar {
  background: var(--bg-rail, #18181B);
  border-left-color: var(--border-subtle, #27272A);
}

.bar-top,
.bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  position: relative;
  z-index: 2;
}

/* ★ 右侧栏液体滑块 (Right Liquid Glider) ★ */
.right-glider {
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #ECEFF2;
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  transition: transform 380ms var(--ease-glide),
              width 300ms var(--ease-glide),
              height 300ms var(--ease-glide),
              border-radius 300ms var(--ease-glide),
              opacity 200ms ease;
  will-change: transform;
}

.right-glider.is-visible {
  opacity: 1;
}

html.dark .right-glider {
  background: rgba(255, 255, 255, 0.12);
}

.mode-icon-swap-enter-active,
.mode-icon-swap-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.mode-icon-swap-enter-from,
.mode-icon-swap-leave-to {
  opacity: 0;
  transform: scale(0.86);
}

.bar-divider {
  width: 22px;
  height: 1px;
  flex: none;
  background: var(--border-color, #E2E8F0);
  margin: 2px 0;
  opacity: 0.8;
  border-radius: 1px;
}

html.dark .bar-divider {
  background: rgba(255, 255, 255, 0.12);
}

/* 按钮通用原型（圆形几何、透明底、滑块供给背景） */
.bar-publish-btn,
.bar-action-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted, #555770);
  cursor: pointer;
  padding: 0;
  z-index: 2;
  outline: none;
  transition: color 0.2s ease, transform 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.bar-publish-btn {
  color: var(--brand-primary, #116ACC);
}

.bar-publish-btn:hover,
.bar-action-btn:hover {
  color: var(--text-main, #0F172A);
}

html.dark .bar-publish-btn:hover,
html.dark .bar-action-btn:hover {
  color: #FFFFFF;
}

/* 按下回弹 (Press Bounce) */
.bar-publish-btn:active,
.bar-action-btn:active {
  transform: scale(0.93);
}

.bar-action-btn.is-active {
  color: var(--text-main, #0F172A);
}

html.dark .bar-action-btn.is-active {
  color: #FFFFFF;
}

/* ── 右侧图标微动效 (Icon Micro-motions) ── */
.right-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  will-change: transform;
}

/* 发布图标：纸飞机航行起飞 */
@keyframes planeFly {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  35% { transform: translate(3px, -3px) rotate(-14deg); }
  70% { transform: translate(-1px, 1px) rotate(4deg); }
}

.bar-publish-btn:hover .ic-plane {
  animation: planeFly 0.65s var(--ease-out);
}

/* 复制图标：副本轻弹 */
@keyframes copyBounce {
  0%, 100% { transform: scale(1, 1); }
  35% { transform: scale(1.18, 0.88); }
  65% { transform: scale(0.95, 1.06); }
  85% { transform: scale(1.04, 0.98); }
}

.bar-action-btn:hover .ic-copy {
  animation: copyBounce 0.55s var(--ease-out);
}

/* 手机/电脑图标：3D 微侧向翻动 */
@keyframes deviceWiggle {
  0%, 100% { transform: rotate(0deg) scale(1, 1); }
  30% { transform: rotate(-12deg) scale(1.12); }
  60% { transform: rotate(10deg) scale(1.04); }
}

.bar-action-btn:hover .ic-device {
  animation: deviceWiggle 0.6s var(--ease-out);
}

/* 预览显隐图标：眨眼动效 */
@keyframes eyeWink {
  0%, 86%, 100% { transform: scaleY(1); }
  92% { transform: scaleY(0.12); }
}

.bar-action-btn:hover .ic-eye {
  animation: eyeWink 1.8s ease-in-out infinite;
}

/* 主题调色板：画板轻微摇摆 */
@keyframes paletteWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-14deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}

.bar-action-btn:hover .ic-theme {
  animation: paletteWiggle 0.75s ease-in-out;
  transform-origin: 50% 15%;
}

/* ── ★ 右侧 Tooltip 弹簧弹出 (Spring Tooltip pointing Left) ── */
.right-tooltip {
  position: absolute;
  right: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%) translateX(8px) scale(0.92);
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #1F2937);
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.35;
  padding: 8px 13px;
  border-radius: 9px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border-subtle, #EDEDF0);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease 60ms, transform 0.3s var(--ease-spring) 60ms;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 8px;
}

.right-nav-target:hover .right-tooltip,
.right-nav-target:focus-visible .right-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0) scale(1);
}

html.dark .right-tooltip {
  background: #242429;
  border-color: rgba(255, 255, 255, 0.12);
  color: #F3F4F6;
  box-shadow: 0 8px 24px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3);
}

.right-tooltip-label {
  font-weight: 500;
}

.right-tooltip-shortcut {
  font-family: var(--font-mono, monospace);
  font-size: 11.5px;
  font-weight: 400;
  color: #6B7280;
  letter-spacing: -0.2px;
}

html.dark .right-tooltip-shortcut {
  color: #9CA3AF;
}

.slider-trigger-container {
  position: relative;
}

.copy-popout-panel {
  position: fixed;
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
  z-index: 9999;
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
  margin-top: 0;
  margin-bottom: var(--ct-p-margin-bottom, 16px);
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
