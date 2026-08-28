<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
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

const materialSupportedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'ul', 'ol', 'li', 'table', 'tables'];

function handlePopupSelect({ key, templateId }) {
  const newStyles = JSON.parse(JSON.stringify(props.customStyles || {}));
  if (!newStyles[key]) newStyles[key] = {};
  newStyles[key].materialTemplateId = templateId;
  emit('update:customStyles', newStyles);
  materialPopupVisible.value = false;
  clearActivePreviewTarget();
}

function handlePopupPrefixUpdate({ key, prefix }) {
  const newStyles = JSON.parse(JSON.stringify(props.customStyles || {}));
  if (!newStyles[key]) newStyles[key] = {};
  newStyles[key].materialPrefix = prefix;
  emit('update:customStyles', newStyles);
}

function handlePopupOpenCustomizer(key) {
  materialPopupVisible.value = false;
  clearActivePreviewTarget();
  emit('open-customizer', key);
}

const activeCustomStyles = computed(() => props.customStyles || {});

const customStyleVars = computed(() => {
  const s = activeCustomStyles.value || {};
  const vars = {};
  if (s.body?.color) {
    vars['--ct-body-color'] = s.body.color;
    if (!s.p?.color) vars['--ct-p-color'] = s.body.color;
    if (!s.li?.color) vars['--ct-li-color'] = s.body.color;
  }
  if (s.body?.backgroundColor) vars['--ct-body-bg'] = s.body.backgroundColor;
  if (s.body?.padding) vars['--ct-body-padding'] = s.body.padding;
  if (s.body?.fontSize) vars['--ct-body-size'] = s.body.fontSize;
  if (s.body?.lineHeight) vars['--ct-body-lineheight'] = s.body.lineHeight;
  if (s.body?.letterSpacing) vars['--ct-body-spacing'] = s.body.letterSpacing;
  if (s.body?.fontFamily) vars['--ct-body-font'] = s.body.fontFamily;

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

  if (s.li?.color) vars['--ct-li-color'] = s.li.color;

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
        return `.preview-body${NOT_MAT}, .wechat-body${NOT_MAT}, .wechat-body > section:first-child${NOT_MAT}, .tc-rendered-paper${NOT_MAT}`;
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
  const s = { ...(theme.styles || {}) };
  delete s['--bg-app'];
  delete s['--bg-editor'];
  delete s['--bg-preview'];
  delete s['--bg-card'];
  delete s['--bg-header'];
  delete s['--bg-sidebar'];
  delete s['--bg-toolbar'];
  delete s['--border-color'];
  delete s['--text-main'];
  delete s['--text-muted'];
  delete s['--shadow-sm'];
  delete s['--shadow-md'];
  return s;
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

let activeTargetTimer = null;

function clearActivePreviewTarget() {
  if (activeTargetTimer) {
    clearTimeout(activeTargetTimer);
    activeTargetTimer = null;
  }
  const activeEls = document.querySelectorAll('.preview-active-target');
  activeEls.forEach(el => el.classList.remove('preview-active-target'));
}

function setActivePreviewTarget(el) {
  clearActivePreviewTarget();
  if (!el) return;
  el.classList.add('preview-active-target');
  // Auto clear focus outline after 2.5s so it never stays stuck
  activeTargetTimer = setTimeout(() => {
    clearActivePreviewTarget();
  }, 2500);
}

function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    materialPopupVisible.value = false;
    clearActivePreviewTarget();
  }
}

function handleGlobalClick(e) {
  if (!e.target || !e.target.closest) return;
  // If click was outside preview container, popup and theme customizer, clear target
  if (!e.target.closest('.preview-body') && !e.target.closest('.material-popup-container') && !e.target.closest('.theme-sidebar-wrapper') && !e.target.closest('.material-popup-mask')) {
    clearActivePreviewTarget();
  }
}

watch(materialPopupVisible, (val) => {
  if (!val) {
    clearActivePreviewTarget();
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('click', handleGlobalClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  document.removeEventListener('click', handleGlobalClick);
  if (activeTargetTimer) {
    clearTimeout(activeTargetTimer);
    activeTargetTimer = null;
  }
});

function handlePreviewElementClick(e) {
  const target = e.target;
  if (!target || !target.closest) return;
  // Only trigger for clicks inside rendered content
  if (!target.closest('.preview-body') && !target.closest('.wechat-phone-frame') && !target.closest('.tc-rendered-paper')) return;

  clearActivePreviewTarget();

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
    const matchedEl = target.closest(sel);
    if (matchedEl) {
      setActivePreviewTarget(matchedEl);
      emit('element-click', section);
      return;
    }
  }

  // Helper to determine if an element already has a custom material template applied
  const hasAppliedMaterial = (key) => {
    const normKey = (key === 'tables' || key === 'th' || key === 'td' || key === 'thead' || key === 'tbody' || key === 'tr') ? 'table' : key;
    const matId = props.customStyles?.[normKey]?.materialTemplateId || props.customStyles?.[key]?.materialTemplateId;
    return Boolean(matId && matId !== 'none' && matId !== 'clean');
  };

  // 3. Check block containers second
  const blockTags = [
    ['h1', 'h1', '[data-heading="h1"], [data-tag="h1"]'],
    ['h2', 'h2', '[data-heading="h2"], [data-tag="h2"]'],
    ['h3', 'h3', '[data-heading="h3"], [data-tag="h3"]'],
    ['h4', 'h4', '[data-heading="h4"], [data-tag="h4"]'],
    ['h5', 'h5', '[data-heading="h5"], [data-tag="h5"]'],
    ['h6', 'h6', '[data-heading="h6"], [data-tag="h6"]'],
    ['blockquote', 'blockquote', 'blockquote, [data-tag="blockquote"]'],
    ['table', 'table', 'th, td, thead, tbody, tfoot, tr, [data-tag="table"], [data-table-material], .table-container'],
    ['li', 'li', 'ul, ol, li, [data-tag="li"]'],
    ['hr', 'hr', 'hr, [data-tag="hr"]'],
    ['p', 'p', 'p, [data-tag="p"]']
  ];

  for (const [tag, section, extraSelector] of blockTags) {
    const sel = `${tag}, ${extraSelector}`;
    const matchedEl = target.closest(sel);
    if (matchedEl) {
      setActivePreviewTarget(matchedEl);
      if (hasAppliedMaterial(section)) {
        // If material has already been replaced/applied, open Theme Customizer and anchor to it
        emit('element-click', section);
        emit('open-customizer', section);
      } else if (materialSupportedTags.includes(section)) {
        // If no material is applied yet, pop up the Material Selector popup
        currentPopupKey.value = section;
        currentPopupPos.value = { x: e.clientX, y: e.clientY };
        materialPopupVisible.value = true;
      } else {
        emit('element-click', section);
        emit('open-customizer', section);
      }
      return;
    }
  }

  // 4. Fallback for font / inline text
  if (target.closest('font, [color], [data-tag="font"], span, div, section')) {
    const parentHeading = target.closest('[data-heading], [data-tag="h1"], [data-tag="h2"], [data-tag="h3"], [data-tag="h4"], [data-tag="h5"], [data-tag="h6"], h1, h2, h3, h4, h5, h6');
    if (parentHeading) {
      setActivePreviewTarget(parentHeading);
      const headingTag = parentHeading.getAttribute('data-heading') || parentHeading.getAttribute('data-tag') || parentHeading.tagName.toLowerCase();
      if (hasAppliedMaterial(headingTag)) {
        emit('element-click', headingTag);
        emit('open-customizer', headingTag);
      } else if (materialSupportedTags.includes(headingTag)) {
        currentPopupKey.value = headingTag;
        currentPopupPos.value = { x: e.clientX, y: e.clientY };
        materialPopupVisible.value = true;
      } else {
        emit('element-click', headingTag);
        emit('open-customizer', headingTag);
      }
      return;
    }
    const parentTable = target.closest('table, th, td, thead, tbody, tfoot, tr, [data-tag="table"], [data-table-material], .table-container');
    if (parentTable) {
      setActivePreviewTarget(parentTable);
      if (hasAppliedMaterial('table')) {
        emit('element-click', 'table');
        emit('open-customizer', 'table');
      } else if (materialSupportedTags.includes('table')) {
        currentPopupKey.value = 'table';
        currentPopupPos.value = { x: e.clientX, y: e.clientY };
        materialPopupVisible.value = true;
      } else {
        emit('element-click', 'table');
        emit('open-customizer', 'table');
      }
      return;
    }
    const parentBlock = target.closest('li, [data-tag="li"]') ? target.closest('li, [data-tag="li"]') : (target.closest('blockquote, [data-tag="blockquote"]') ? target.closest('blockquote, [data-tag="blockquote"]') : (target.closest('p, [data-tag="p"]') ? target.closest('p, [data-tag="p"]') : null));
    if (parentBlock) {
      setActivePreviewTarget(parentBlock);
      const blockKey = parentBlock.getAttribute('data-tag') || parentBlock.tagName.toLowerCase();
      if (hasAppliedMaterial(blockKey)) {
        emit('element-click', blockKey);
        emit('open-customizer', blockKey);
      } else if (materialSupportedTags.includes(blockKey)) {
        currentPopupKey.value = blockKey;
        currentPopupPos.value = { x: e.clientX, y: e.clientY };
        materialPopupVisible.value = true;
      } else {
        emit('element-click', blockKey);
        emit('open-customizer', blockKey);
      }
      return;
    }
  }

  emit('element-click', 'body');
}

function handlePopupClose() {
  materialPopupVisible.value = false;
  clearActivePreviewTarget();
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
            v-if="wechatStyledHtml"
            class="markdown-body wechat-body"
            :style="codeThemeStyles"
            v-html="wechatStyledHtml"
          ></div>
          <div
            v-else-if="props.isWeChatMode"
            class="phone-empty-placeholder"
          >
            <div class="phone-empty-icon">📝</div>
            <div class="phone-empty-title">暂无文章内容</div>
            <div class="phone-empty-sub">在左侧输入 Markdown 内容即可在此实时预览微信手机排版效果</div>
          </div>
          <div
            v-else
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
      @close="handlePopupClose"
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
  scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
  padding: 0;
  background-color: var(--bg-preview);
  color: var(--text-main);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.preview-body::-webkit-scrollbar {
  width: 4px;
}
.preview-body::-webkit-scrollbar-track {
  background: transparent;
}
.preview-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}
.preview-body:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.25);
}

/* Standard Markdown Styles */
.preview-body:not(.is-wechat-wrapper) {
  display: block;
  padding: 0;
  background-color: var(--bg-preview);
  background-image: none;
}

.markdown-body {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  box-sizing: border-box;
  color: var(--ct-body-color, var(--text-main));
  background: transparent;
  line-height: var(--ct-body-lineheight, 1.8);
  font-size: var(--ct-body-size, 16px);
  letter-spacing: var(--ct-body-spacing, 0.05em);
  font-family: var(--ct-body-font, inherit);
  padding: 24px 28px;
  border-radius: 0;
  border: none;
  box-shadow: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Deep dark mode support for standard preview surface */
:global(html.dark) .preview-body:not(.is-wechat-wrapper) .markdown-body > section:first-child,
:global(html[data-color-mode="dark"]) .preview-body:not(.is-wechat-wrapper) .markdown-body > section:first-child {
  background-color: transparent !important;
  background-image: none !important;
  color: var(--text-main) !important;
}

:global(html.dark) .preview-body:not(.is-wechat-wrapper) .markdown-body p:not([data-material="true"]):not([data-material="true"] *):not(.material-block):not(.material-block *),
:global(html[data-color-mode="dark"]) .preview-body:not(.is-wechat-wrapper) .markdown-body p:not([data-material="true"]):not([data-material="true"] *):not(.material-block):not(.material-block *) {
  color: var(--text-main) !important;
}

:global(html.dark) .preview-body:not(.is-wechat-wrapper) .markdown-body li:not([data-material="true"]):not([data-material="true"] *):not(.material-block):not(.material-block *),
:global(html[data-color-mode="dark"]) .preview-body:not(.is-wechat-wrapper) .markdown-body li:not([data-material="true"]):not([data-material="true"] *):not(.material-block):not(.material-block *) {
  color: var(--text-main) !important;
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
  color: var(--ct-p-color, var(--ct-body-color, var(--text-main)));
  font-size: var(--ct-p-size, var(--ct-body-size, 16px));
  line-height: var(--ct-p-lineheight, var(--ct-body-lineheight, 1.9));
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
  color: var(--ct-li-color, var(--ct-body-color, var(--text-main)));
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
  padding: 24px 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  min-height: 100%;
}

:global(html.dark) .preview-body.is-wechat-wrapper,
:global(html[data-color-mode="dark"]) .preview-body.is-wechat-wrapper {
  background: rgba(0, 0, 0, 0.25);
}

.preview-content-frame.wechat-phone-frame {
  display: flex;
  flex-direction: column;
  width: 375px;
  height: 780px;
  min-height: 780px;
  background: #ffffff;
  border-radius: 2.75rem;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);
  border: 4px solid #1e293b;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
  margin: 12px auto 24px;
  box-sizing: border-box;
}

:global(html.dark) .preview-content-frame.wechat-phone-frame,
:global(html[data-color-mode="dark"]) .preview-content-frame.wechat-phone-frame {
  border-color: #334155;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
}

.standard-screen-scroll {
  width: 100%;
}

.phone-dynamic-island {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 88px;
  height: 20px;
  background: #000000;
  border-radius: 10px;
  z-index: 20;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #000000;
  background: #ffffff;
  flex-shrink: 0;
  user-select: none;
}

.phone-screen-scroll {
  flex: 1;
  min-height: 0;
  padding: 0.75rem 1rem 1.5rem;
  overflow-y: auto;
  scrollbar-width: thin;
  display: flex;
  flex-direction: column;
}

.phone-article-header {
  margin-bottom: 0.75rem !important;
  border-bottom: 1px solid #f1f5f9 !important;
  padding-bottom: 0.5rem !important;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  flex-shrink: 0;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

.wechat-body {
  width: 100%;
  flex: 1;
}

.phone-empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 240px;
  padding: 32px 16px;
  text-align: center;
  color: #94a3b8;
  gap: 8px;
  user-select: none;
}

.phone-empty-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.phone-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.phone-empty-sub {
  font-size: 12px;
  line-height: 1.6;
  max-width: 240px;
  color: #94a3b8;
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
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  word-break: break-all !important;
  overflow-wrap: anywhere !important;
  word-wrap: break-word !important;
  white-space: normal !important;
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
  flex-shrink: 0;
}

.phone-home-indicator {
  height: 1.25rem;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.phone-home-indicator::after {
  content: '';
  width: 7.5rem;
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
