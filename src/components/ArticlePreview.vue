<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { marked } from 'marked';
import renderMathInElement from 'katex/dist/contrib/auto-render.js';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';
import hljs from 'highlight.js';
import { compileToWeChatHtml, cleanEmptyListItems } from '../utils/wechatStyles';
import { themes } from '../utils/themePresets';
import { getCodeThemeStyles } from '../utils/codeThemes';
import { defaultMarkdown } from '../utils/defaultMarkdown';
import MaterialPopup from './MaterialPopup.vue';

marked.setOptions({
  gfm: true,
  breaks: true
});

marked.use({
  renderer: {
    code(arg1, arg2) {
      let code = '';
      let lang = '';
      if (typeof arg1 === 'object' && arg1 !== null) {
        code = arg1.text || '';
        lang = arg1.lang || '';
      } else {
        code = arg1 || '';
        lang = arg2 || '';
      }
      if (lang === 'mermaid') {
        const escapedCode = encodeURIComponent(code);
        return `<div class="mermaid" data-original-code="${escapedCode}">${code}</div>`;
      }
      
      let highlighted = '';
      if (lang && hljs.getLanguage(lang)) {
        try {
          highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        } catch (e) {
          try {
            highlighted = hljs.highlightAuto(code).value;
          } catch (err) {
            highlighted = code;
          }
        }
      } else {
        try {
          highlighted = hljs.highlightAuto(code).value;
        } catch (e) {
          highlighted = code;
        }
      }

      return `<pre class="custom" data-lang="${lang || ''}"><code class="hljs language-${lang || 'text'}">${highlighted}</code></pre>`;
    }
  },
  extensions: [
    {
      name: 'blockMath',
      level: 'block',
      start(src) { return src.indexOf('$$'); },
      tokenizer(src) {
        const match = src.match(/^\$\$\n?([\s\S]+?)\n?\$\$/);
        if (match) {
          return {
            type: 'blockMath',
            raw: match[0],
            text: match[1]
          };
        }
      },
      renderer(token) {
        return `<div class="math-block">$$${token.text}$$</div>`;
      }
    },
    {
      name: 'inlineMath',
      level: 'inline',
      start(src) { return src.indexOf('$'); },
      tokenizer(src) {
        const match = src.match(/^\$([^$\n]+?)\$/);
        if (match) {
          return {
            type: 'inlineMath',
            raw: match[0],
            text: match[1]
          };
        }
      },
      renderer(token) {
        return `<span class="math-inline">$${token.text}$</span>`;
      }
    }
  ]
});

const props = defineProps({
  markdown: {
    type: String,
    default: defaultMarkdown
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
    default: 'mdnice-classic'
  },
  customStyles: {
    type: Object,
    default: () => ({})
  },
  isWeChatMode: {
    type: Boolean,
    default: false
  },
  scrollPercentage: {
    type: Number,
    default: 0
  },
  activePane: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['element-click', 'scroll', 'focusActive', 'update:customStyles', 'open-customizer']);

const previewContainerRef = ref(null);
const wechatFrameRef = ref(null);

// Material Replacement Popup state
const materialPopupVisible = ref(false);
const currentPopupKey = ref('h1');
const currentPopupPos = ref({ x: 0, y: 0 });

const materialSupportedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'ul', 'ol', 'li'];

function handlePopupSelect({ key, templateId }) {
  const newStyles = JSON.parse(JSON.stringify(props.customStyles || {}));
  if (!newStyles[key]) newStyles[key] = {};
  newStyles[key].materialTemplateId = templateId;
  emit('update:customStyles', newStyles);
  materialPopupVisible.value = false;
}

function handlePopupPrefixUpdate({ key, prefix }) {
  const newStyles = JSON.parse(JSON.stringify(props.customStyles || {}));
  if (!newStyles[key]) newStyles[key] = {};
  newStyles[key].materialPrefix = prefix;
  emit('update:customStyles', newStyles);
}

function handlePopupOpenCustomizer(key) {
  materialPopupVisible.value = false;
  emit('open-customizer', key);
}

const activeCustomStyles = computed(() => props.customStyles || {});

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
  if (s.code?.lineHeight) vars['--ct-code-lineheight'] = s.code.lineHeight;
  if (s.code?.letterSpacing) vars['--ct-code-spacing'] = s.code.letterSpacing;
  if (s.code?.fontFamily) vars['--ct-code-font'] = s.code.fontFamily;

  if (s.pre?.backgroundColor) vars['--ct-pre-bg'] = s.pre.backgroundColor;

  if (s.strong?.color) vars['--ct-strong-color'] = s.strong.color;
  if (s.strong?.fontWeight) vars['--ct-strong-weight'] = s.strong.fontWeight;

  if (s.img?.borderRadius) vars['--ct-img-radius'] = s.img.borderRadius;
  return vars;
});

const injectedCustomCss = computed(() => {
  const css = activeCustomStyles.value?.customCss || '';
  if (!css || typeof css !== 'string') return '';

  // Strip prefix aliases (#nice, xiaofu, .markdown-body, .wechat-body)
  const cleaned = css.replace(/(?:#nice|xiaofu|\.markdown-body|\.wechat-body)\s+/g, ' ').trim();
  if (!cleaned) return '';

  // Map selectors so they ONLY apply inside preview-body or wechat-body (never leaking to the editor)
  return cleaned.replace(/([^{}]+)\{([^}]+)\}/g, (m, selector, body) => {
    const selectors = selector.split(',').map(s => {
      const tag = s.trim();
      if (!tag) return '';
      if (tag.startsWith('.')) return `.preview-body ${tag}, .wechat-body ${tag}, .tc-rendered-paper ${tag}`;
      if (/^h[1-6]$/i.test(tag)) {
        const h = tag.toLowerCase();
        return `.preview-body ${h}, .preview-body [data-heading="${h}"]:not([data-material="true"]), .preview-body [data-heading="${h}"]:not([data-material="true"]) *, .wechat-body ${h}, .wechat-body [data-heading="${h}"]:not([data-material="true"]), .wechat-body [data-heading="${h}"]:not([data-material="true"]) *, .phone-screen-scroll ${h}, .phone-screen-scroll [data-heading="${h}"]:not([data-material="true"]) *, .tc-rendered-paper ${h}`;
      }
      if (tag === 'blockquote') {
        return `.preview-body blockquote:not([data-material="true"]), .wechat-body blockquote:not([data-material="true"]), .phone-screen-scroll blockquote:not([data-material="true"]), .tc-rendered-paper blockquote:not([data-material="true"])`;
      }
      if (tag === 'hr') {
        return `.preview-body hr:not([data-material="true"]), .wechat-body hr:not([data-material="true"]), .phone-screen-scroll hr:not([data-material="true"]), .tc-rendered-paper hr:not([data-material="true"])`;
      }
      return `.preview-body ${tag}, .preview-body .markdown-body ${tag}, .wechat-body ${tag}, .phone-screen-scroll ${tag}, .tc-rendered-paper ${tag}`;
    }).filter(Boolean);

    // Append !important to declarations so custom CSS overrides inline styles on rendered elements
    const importantBody = body.split(';')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.includes('!important')) return trimmed;
        return `${trimmed} !important`;
      })
      .filter(Boolean)
      .join('; ');

    return `${selectors.join(', ')} {\n${importantBody}\n}`;
  });
});

const activeThemeStyles = computed(() => {
  const theme = themes.find(t => t.id === props.themeId) || themes[0];
  return theme.styles;
});

const effectiveCodeThemeId = computed(() => {
  return props.customStyles?.code?.codeThemeId || props.codeThemeId || 'mdnice-classic';
});

const codeThemeStyles = computed(() => getCodeThemeStyles(effectiveCodeThemeId.value));

const compiledHtml = computed(() => {
  if (!props.markdown) return '';
  const rawHtml = marked.parse(props.markdown);
  return cleanEmptyListItems(rawHtml);
});

const wechatStyledHtml = computed(() => {
  if (!props.markdown) return '';
  return compileToWeChatHtml(
    compiledHtml.value,
    props.themeId,
    effectiveCodeThemeId.value,
    activeCustomStyles.value?.customCss || '',
    activeCustomStyles.value
  );
});

watch(() => props.isWeChatMode, () => {
  nextTick(() => {
    const el = getScrollableElement();
    if (el) {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        el.scrollTop = props.scrollPercentage * maxScroll;
      }
    }
  });
});

// Render KaTeX math formulas and Mermaid charts dynamically
const renderMathAndCharts = async () => {
  await nextTick();
  if (!previewContainerRef.value) return;

  // 1. Render KaTeX Math
  try {
    renderMathInElement(previewContainerRef.value, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  } catch (err) {
    console.warn('[ArticlePreview] KaTeX render error:', err);
  }

  // 2. Render Mermaid diagrams
  try {
    if (previewContainerRef.value) {
      const mermaidNodes = previewContainerRef.value.querySelectorAll('.mermaid');
      if (mermaidNodes.length > 0) {
        const validNodes = [];
        mermaidNodes.forEach((node) => {
          if (!node || !node.isConnected) return;
          // Skip elements that are completely hidden or detached
          if (node.offsetWidth === 0 && node.offsetHeight === 0 && node.offsetParent === null) {
            return;
          }
          const originalCode = node.getAttribute('data-original-code');
          if (originalCode) {
            node.textContent = decodeURIComponent(originalCode);
          }
          node.removeAttribute('data-processed');
          if (node.textContent && node.textContent.trim()) {
            validNodes.push(node);
          }
        });

        if (validNodes.length > 0) {
          await mermaid.run({ nodes: validNodes }).catch((err) => {
            console.warn('[ArticlePreview] Mermaid run handled:', err);
          });
        }
      }
    }
  } catch (err) {
    console.warn('[ArticlePreview] Mermaid render error:', err);
  }
};

watch([() => props.markdown, () => props.themeId, () => props.codeThemeId, () => props.customStyles], () => {
  renderMathAndCharts();
}, { immediate: true, deep: true });

watch(() => props.isWeChatMode, () => {
  nextTick(() => {
    renderMathAndCharts();
    const el = getScrollableElement();
    if (el) {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        el.scrollTop = props.scrollPercentage * maxScroll;
      }
    }
  });
});

onMounted(() => {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });
  } catch (err) {
    console.error('[ArticlePreview] Mermaid init error:', err);
  }
  renderMathAndCharts();
});

const getScrollableElement = () => {
  if (props.isWeChatMode && wechatFrameRef.value) {
    return wechatFrameRef.value;
  }
  return previewContainerRef.value;
};

const handleScroll = () => {
  const el = getScrollableElement();
  if (el && props.activePane === 'preview') {
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      const percentage = el.scrollTop / scrollHeight;
      emit('scroll', percentage);
    }
  }
};

watch(() => props.scrollPercentage, (percentage) => {
  if (props.activePane !== 'preview') {
    const el = getScrollableElement();
    if (el) {
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTop = percentage * maxScroll;
    }
  }
});

function handlePreviewElementClick(e) {
  const target = e.target;
  if (!target || !target.closest) return;
  // Only trigger for clicks inside rendered content
  if (!target.closest('.preview-body') && !target.closest('.wechat-phone-frame') && !target.closest('.tc-rendered-paper')) return;

  // 1. Check pre / code block / hljs first
  if (target.closest('pre, code, .hljs')) {
    emit('element-click', 'code');
    return;
  }

  // 2. Check innermost inline tags FIRST
  const inlinePriorityTags = [
    ['mark', 'mark', '[data-tag="mark"]'],
    ['kbd', 'kbd', '[data-tag="kbd"]'],
    ['code', 'code', '[data-tag="code"]'],
    ['del', 'del', 's, strike, [data-tag="del"], [data-tag="s"], [data-tag="strike"]'],
    ['u', 'u', 'ins, [data-tag="u"], [data-tag="ins"]'],
    ['strong', 'strong', 'b'],
    ['em', 'em', 'i'],
    ['sub', 'sub', '[data-tag="sub"]'],
    ['sup', 'sup', '[data-tag="sup"]'],
    ['a', 'a', 'a'],
    ['img', 'img', 'img']
  ];

  for (const [tag, section, extraSelector] of inlinePriorityTags) {
    const sel = `${tag}, ${extraSelector}`;
    if (target.closest(sel)) {
      emit('element-click', section);
      return;
    }
  }

  // 3. Check block containers second
  const blockTags = [
    ['h1', 'h1', '[data-heading="h1"]'],
    ['h2', 'h2', '[data-heading="h2"]'],
    ['h3', 'h3', '[data-heading="h3"]'],
    ['h4', 'h4', '[data-heading="h4"]'],
    ['h5', 'h5', '[data-heading="h5"]'],
    ['h6', 'h6', '[data-heading="h6"]'],
    ['blockquote', 'blockquote', 'blockquote'],
    ['table', 'table', 'th, td'],
    ['li', 'li', 'ul, ol, li'],
    ['hr', 'hr', 'hr'],
    ['p', 'p', 'p']
  ];

  for (const [tag, section, extraSelector] of blockTags) {
    const sel = `${tag}, ${extraSelector}`;
    if (target.closest(sel)) {
      if (materialSupportedTags.includes(section)) {
        currentPopupKey.value = section;
        currentPopupPos.value = { x: e.clientX, y: e.clientY };
        materialPopupVisible.value = true;
      } else {
        emit('element-click', section);
      }
      return;
    }
  }

  // 4. Fallback for font / inline text
  if (target.closest('font, [color], [data-tag="font"], span')) {
    const parentHeading = target.closest('[data-heading], h1, h2, h3, h4, h5, h6');
    if (parentHeading) {
      const headingTag = parentHeading.getAttribute('data-heading') || parentHeading.tagName.toLowerCase();
      if (materialSupportedTags.includes(headingTag)) {
        currentPopupKey.value = headingTag;
        currentPopupPos.value = { x: e.clientX, y: e.clientY };
        materialPopupVisible.value = true;
      } else {
        emit('element-click', headingTag);
      }
      return;
    }
    const parentBlock = target.closest('li') ? 'li' : (target.closest('blockquote') ? 'blockquote' : (target.closest('p') ? 'p' : 'body'));
    if (materialSupportedTags.includes(parentBlock)) {
      currentPopupKey.value = parentBlock;
      currentPopupPos.value = { x: e.clientX, y: e.clientY };
      materialPopupVisible.value = true;
    } else {
      emit('element-click', parentBlock);
    }
    return;
  }

  emit('element-click', 'body');
}
</script>

<template>
  <div
    class="article-preview-wrapper"
    :style="customStyleVars"
    @mouseenter="emit('focusActive', 'preview')"
    @click="handlePreviewElementClick"
  >
    <component is="style" v-if="injectedCustomCss">{{ injectedCustomCss }}</component>

    <div
      ref="previewContainerRef"
      class="preview-body"
      :class="{ 'is-wechat-wrapper': props.isWeChatMode }"
      :style="activeThemeStyles"
      :data-theme="props.themeId"
      @scroll="handleScroll"
    >
      <div
        class="preview-content-frame"
        :class="{ 'wechat-phone-frame': props.isWeChatMode }"
      >
        <div v-if="props.isWeChatMode" class="phone-dynamic-island"></div>
        <div v-if="props.isWeChatMode" class="phone-status-bar">
          <span class="phone-time">09:41</span>
          <div class="phone-icons">
            <span class="wifi">📶</span>
            <span class="battery">🔋</span>
          </div>
        </div>
        <div
          ref="wechatFrameRef"
          :class="{ 'phone-screen-scroll': props.isWeChatMode, 'standard-screen-scroll': !props.isWeChatMode }"
          @scroll="handleScroll"
        >
          <div v-if="props.isWeChatMode" class="phone-article-header">
            <div class="phone-title">{{ docTitle }}</div>
            <div class="phone-meta">
              <span class="phone-author">NiceMD 作者</span>
              <span class="phone-date">刚刚</span>
              <span class="phone-account">极简发布平台</span>
            </div>
          </div>

          <!-- Single persistent content element for v-html to prevent Vue VNode unmount errors -->
          <div
            class="markdown-body wechat-body"
            :style="codeThemeStyles"
            v-html="wechatStyledHtml"
          ></div>

          <div v-if="props.isWeChatMode" class="phone-article-footer">
            <span class="read-more">阅读原文</span>
            <span class="read-count">阅读 100k+</span>
          </div>
        </div>
        <div v-if="props.isWeChatMode" class="phone-home-indicator"></div>
      </div>
    </div>

    <!-- Click-to-Replace Material Popup -->
    <MaterialPopup
      :visible="materialPopupVisible"
      :elementKey="currentPopupKey"
      :currentMaterialId="props.customStyles?.[currentPopupKey]?.materialTemplateId || 'none'"
      :currentPrefix="props.customStyles?.[currentPopupKey]?.materialPrefix || ''"
      :position="currentPopupPos"
      @select="handlePopupSelect"
      @update-prefix="handlePopupPrefixUpdate"
      @open-customizer="handlePopupOpenCustomizer"
      @close="materialPopupVisible = false"
    />
  </div>
</template>

<style scoped>
.article-preview-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.preview-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  padding: 0;
  background-color: var(--bg-editor);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.preview-body::-webkit-scrollbar {
  width: 6px;
}
.preview-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
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
  max-width: 750px;
  margin: 0 auto;
  box-sizing: border-box;
  color: var(--ct-body-color, var(--text-main));
  background: transparent;
  line-height: 1.8;
  font-size: 16px;
  padding: 24px 28px;
  border-radius: 0;
  border: none;
  box-shadow: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-body :deep(> :first-child),
.markdown-body :deep(#nice > :first-child) {
  margin-top: 0 !important;
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

.markdown-body :deep(pre.custom),
.markdown-body :deep(pre) {
  margin: 0;
  padding: 0;
  text-align: left;
}

.markdown-body :deep(.code-snippet__fix) {
  margin-top: 16px !important;
  margin-bottom: 16px !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.markdown-body :deep(.code-snippet__fix pre) {
  margin: 0 !important;
  overflow-x: auto !important;
  scrollbar-width: thin;
}

/* Syntax Highlighting Tokens in Preview */
.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag) {
  color: var(--hljs-keyword, #c678dd);
  font-weight: 600;
}

.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-regexp),
.markdown-body :deep(.hljs-addition),
.markdown-body :deep(.hljs-attribute),
.markdown-body :deep(.hljs-template-variable) {
  color: var(--hljs-string, #98c379);
}

.markdown-body :deep(.hljs-number),
.markdown-body :deep(.hljs-literal) {
  color: var(--hljs-number, #d19a66);
}

.markdown-body :deep(.hljs-type),
.markdown-body :deep(.hljs-built_in),
.markdown-body :deep(.hljs-class) {
  color: var(--hljs-type, #e5c07b);
}

.markdown-body :deep(.hljs-title),
.markdown-body :deep(.hljs-function),
.markdown-body :deep(.hljs-section) {
  color: var(--hljs-title, #61afef);
  font-weight: 500;
}

.markdown-body :deep(.hljs-attr),
.markdown-body :deep(.hljs-variable),
.markdown-body :deep(.hljs-property) {
  color: var(--hljs-attr, #d19a66);
}

.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote) {
  color: var(--hljs-comment, #7f848e);
  font-style: italic;
}

.markdown-body :deep(.hljs-meta),
.markdown-body :deep(.hljs-operator),
.markdown-body :deep(.hljs-symbol) {
  color: var(--hljs-meta, #56b6c2);
}

.markdown-body :deep(.hljs-params),
.markdown-body :deep(.hljs-subst),
.markdown-body :deep(.hljs-tag) {
  color: var(--hljs-text, #abb2bf);
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

.markdown-body :deep(img),
.wechat-body :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
  border-radius: var(--ct-img-radius, 8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.markdown-body :deep(section[data-role="image-container"]),
.wechat-body :deep(section[data-role="image-container"]) {
  margin: 20px 0;
  text-align: center;
}

/* Preview Content Frame */
.preview-content-frame {
  width: 100%;
  transition: width 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
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

.preview-content-frame.wechat-phone-frame {
  display: flex;
  flex-direction: column;
  width: 23.5rem;
  background: #ffffff;
  border-radius: 2.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 4px solid #1e293b;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  margin: 0 auto;
}

.standard-screen-scroll {
  width: 100%;
}

.phone-dynamic-island {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 5rem;
  height: 1.125rem;
  background: #000000;
  border-radius: 1rem;
  z-index: 20;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #000000;
  background: #ffffff;
}

.phone-screen-scroll {
  padding: 1rem 1rem 2rem;
  max-height: 40rem;
  overflow-y: auto;
  scrollbar-width: thin;
}

.phone-article-header {
  margin-bottom: 0.5rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  padding-bottom: 0.5rem !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.wechat-body {
  width: 100%;
}

.wechat-phone-frame .markdown-body {
  padding: 0 !important;
}

.wechat-body :deep(#nice) {
  padding-top: 0 !important;
}

.wechat-body :deep(#nice > :first-child),
.wechat-body :deep(#nice > section:first-child) {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.phone-title {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  line-height: 1.35 !important;
  margin: 0 0 0.5rem 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  text-align: left !important;
}

.phone-meta {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  font-size: 0.75rem !important;
  color: #64748b !important;
  background: transparent !important;
}

.phone-author {
  color: #576b95 !important;
  font-weight: 600 !important;
}

.phone-article-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #94a3b8;
}

.phone-home-indicator {
  height: 1rem;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-home-indicator::after {
  content: '';
  width: 8rem;
  height: 0.25rem;
  background: #cbd5e1;
  border-radius: 0.125rem;
}

/* Math & Mermaid styling */
.math-block {
  margin: 1.2em 0;
  text-align: center;
  overflow-x: auto;
}
.math-inline {
  display: inline-block;
  vertical-align: middle;
  margin: 0 2px;
  white-space: nowrap;
}
.markdown-body :deep(.katex),
.wechat-body :deep(.katex) {
  display: inline-block;
  vertical-align: middle;
  color: var(--accent-color, #2775b6);
}
.markdown-body :deep(.katex-display),
.wechat-body :deep(.katex-display) {
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

/* ultra-thin code-block scrollbar */
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
