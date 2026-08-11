<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Palette, X, Save, Sliders, Code2, RotateCcw, Check } from 'lucide-vue-next';
import { getThemeDefaultStyles } from '../utils/themePresets';
import { EditorView, basicSetup } from 'codemirror';
import { css } from '@codemirror/lang-css';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  themeId: { type: String, default: 'classic-indigo' },
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:open', 'save-custom-styles', 'save-theme', 'close']);

// Tab Mode: 'form' (可视化配置) | 'code' (源码编辑)
const activeTab = ref('form');

const localStyles = ref({});
const rawCssText = ref('');
const saveToastVisible = ref(false);
const codemirrorContainerRef = ref(null);
let cmView = null;
let isUpdatingFromCodeMirror = false;

// Full list of all 28 Markdown syntax element definitions
const elements = [
  { key: 'body', label: '整体背景 / 文字 ( body )', icon: '◻' },
  { key: 'h1', label: '标题 H1 ( # )', icon: 'H1' },
  { key: 'h2', label: '标题 H2 ( ## )', icon: 'H2' },
  { key: 'h3', label: '标题 H3 ( ### )', icon: 'H3' },
  { key: 'h4', label: '标题 H4 ( #### )', icon: 'H4' },
  { key: 'h5', label: '标题 H5 ( ##### )', icon: 'H5' },
  { key: 'h6', label: '标题 H6 ( ###### )', icon: 'H6' },
  { key: 'p', label: '正文段落 ( p )', icon: 'P' },
  { key: 'strong', label: '加粗强调 ( **bold** )', icon: 'B' },
  { key: 'em', label: '斜体文本 ( *italic* )', icon: 'I' },
  { key: 'del', label: '删除线 ( ~~del~~ )', icon: '~' },
  { key: 'u', label: '下划线 ( <u>u</u> )', icon: 'U' },
  { key: 'mark', label: '高亮标记 ( ==mark== )', icon: 'M' },
  { key: 'kbd', label: '按键标签 ( <kbd>Ctrl</kbd> )', icon: 'K' },
  { key: 'sub', label: '下标 ( H<sub>2</sub>O )', icon: 'sub' },
  { key: 'sup', label: '上标 ( X<sup>2</sup> )', icon: 'sup' },
  { key: 'code', label: '行内代码 ( `code` )', icon: '<>' },
  { key: 'pre', label: '代码块包裹 ( pre )', icon: '▣' },
  { key: 'blockquote', label: '引用块 ( > quote )', icon: '❝' },
  { key: 'ul', label: '无序列表 ( - / * )', icon: '•' },
  { key: 'ol', label: '有序列表 ( 1. 2. )', icon: '1.' },
  { key: 'li', label: '列表项 ( li )', icon: '—' },
  { key: 'table', label: '表格容器 ( table )', icon: '田' },
  { key: 'th', label: '表头单元格 ( th )', icon: 'TH' },
  { key: 'td', label: '内容单元格 ( td )', icon: 'TD' },
  { key: 'hr', label: '分割线 ( --- )', icon: '―' },
  { key: 'a', label: '超链接 ( [link](url) )', icon: '🔗' },
  { key: 'img', label: '图片 ( ![img](url) )', icon: '🖼' }
];

// Merge theme base defaults with user document overrides
const effectiveStyles = computed(() => {
  const defaults = getThemeDefaultStyles(props.themeId);
  const userStyles = localStyles.value || {};
  const merged = {};

  // Ensure defaults exist for all elements
  const allKeys = elements.map(e => e.key);
  for (const k of allKeys) {
    merged[k] = { ...(defaults[k] || {}), ...(userStyles[k] || {}) };
  }
  return merged;
});

// Sync props.modelValue & themeId into localState
watch([() => props.modelValue, () => props.themeId], ([val, themeId]) => {
  localStyles.value = JSON.parse(JSON.stringify(val || {}));
  syncFormToCssText();
}, { immediate: true, deep: true });

function getStyle(category) {
  return effectiveStyles.value[category] || {};
}

const knownProps = ['color', 'backgroundColor', 'borderLeftColor', 'borderColor', 'textColor', 'headerBg', 'fontSize', 'fontWeight', 'lineHeight', 'margin', 'borderRadius', 'maxWidth', 'boxShadow', 'border', 'display'];

function otherProps(category) {
  const style = getStyle(category);
  return Object.keys(style).filter(p => !knownProps.includes(p) && p !== 'icon');
}

const propLabels = {
  borderRadius: '圆角',
  borderWidth: '边框宽度',
  borderColor: '边框色',
  opacity: '不透明度',
  marginTop: '上边距',
  marginBottom: '下边距',
  boxShadow: '阴影',
  listStyleType: '列表标记类型'
};

function propLabel(prop) {
  return propLabels[prop] || prop.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function updateStyle(category, prop, value) {
  if (!localStyles.value) localStyles.value = {};
  if (!localStyles.value[category]) {
    localStyles.value[category] = {};
  }
  localStyles.value[category][prop] = value;
  syncFormToCssText(true);
  emitUpdate();
}

function resetCategory(category) {
  if (localStyles.value) {
    delete localStyles.value[category];
  }
  syncFormToCssText(true);
  emitUpdate();
}

function resetAll() {
  localStyles.value = {};
  rawCssText.value = generateCssFromStyles(getThemeDefaultStyles(props.themeId));
  emitUpdate();
}

function handleSave() {
  const payload = JSON.parse(JSON.stringify(localStyles.value));
  payload.customCss = rawCssText.value;
  emit('save-custom-styles', payload);
  saveToastVisible.value = true;
  setTimeout(() => {
    saveToastVisible.value = false;
  }, 1800);
}

function emitUpdate() {
  const payload = JSON.parse(JSON.stringify(localStyles.value));
  payload.customCss = rawCssText.value;
  emit('update:modelValue', payload);
}

// Convert all 28 Markdown syntax element styles into formatted CSS rules
function generateCssFromStyles(styles) {
  const S = styles || {};
  let css = `/* ============================================================ */\n`;
  css += `/* NiceMD 文章全量 Markdown 模版 CSS 规则 (标准 CSS 语法)          */\n`;
  css += `/* 支持 #nice、xiaofu 或 .markdown-body 等全局选择器            */\n`;
  css += `/* ============================================================ */\n\n`;

  const cleanColor = (c, fallback) => {
    if (!c || typeof c !== 'string') return fallback;
    const v = c.trim();
    if (v === 'xiaofu' || v === '#nice' || v.includes('markdown-body')) return fallback;
    return v;
  };

  const addRule = (selectors, propsMap) => {
    const lines = [];
    for (const [k, v] of Object.entries(propsMap)) {
      if (v !== undefined && v !== null && v !== '') {
        const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
        lines.push(`  ${cssKey}: ${v};`);
      }
    }
    if (lines.length) {
      return `${selectors} {\n${lines.join('\n')}\n}\n\n`;
    }
    return '';
  };

  if (S.body) css += addRule('#nice, xiaofu, .markdown-body', { color: cleanColor(S.body.color, '#2b2b2b'), backgroundColor: S.body.backgroundColor });
  if (S.h1) {
    const h1Color = cleanColor(S.h1.color, '#2775b6');
    css += addRule('#nice h1, xiaofu h1', {
      color: (h1Color === '#ffffff' && !S.h1.backgroundColor) ? '#2775b6' : h1Color,
      fontSize: S.h1.fontSize,
      fontWeight: S.h1.fontWeight,
      backgroundColor: S.h1.backgroundColor,
      padding: S.h1.padding,
      borderRadius: S.h1.borderRadius,
      textAlign: S.h1.textAlign,
      display: S.h1.display
    });
  }
  if (S.h2) css += addRule('#nice h2, xiaofu h2', { color: cleanColor(S.h2.color, '#2775b6'), fontSize: S.h2.fontSize, fontWeight: S.h2.fontWeight, borderLeft: S.h2.borderLeft, paddingLeft: S.h2.paddingLeft });
  if (S.h3) css += addRule('#nice h3, xiaofu h3', { color: cleanColor(S.h3.color, '#2b2b2b'), fontSize: S.h3.fontSize, fontWeight: S.h3.fontWeight });
  if (S.h4) css += addRule('#nice h4, xiaofu h4', { color: cleanColor(S.h4.color, '#2b2b2b'), fontSize: S.h4.fontSize, fontWeight: S.h4.fontWeight });
  if (S.h5) css += addRule('#nice h5, xiaofu h5', { color: cleanColor(S.h5.color, '#2b2b2b'), fontSize: S.h5.fontSize, fontWeight: S.h5.fontWeight });
  if (S.h6) css += addRule('#nice h6, xiaofu h6', { color: cleanColor(S.h6.color, '#2b2b2b'), fontSize: S.h6.fontSize, fontWeight: S.h6.fontWeight });

  if (S.p) css += addRule('#nice p, xiaofu p', { color: S.p.color, fontSize: S.p.fontSize, lineHeight: S.p.lineHeight });
  if (S.strong) css += addRule('#nice strong, xiaofu strong', { color: S.strong.color, fontWeight: S.strong.fontWeight });
  if (S.em) css += addRule('#nice em, xiaofu em', { color: S.em.color, fontStyle: S.em.fontStyle || 'italic' });
  if (S.del) css += addRule('#nice del, xiaofu del', { color: S.del.color, textDecoration: S.del.textDecoration || 'line-through' });
  if (S.u) css += addRule('#nice u, xiaofu u', { color: S.u.color, textDecoration: 'underline' });
  if (S.mark) css += addRule('#nice mark, xiaofu mark', { backgroundColor: S.mark.backgroundColor, color: S.mark.color, padding: '2px 5px', borderRadius: '3px' });
  if (S.kbd) css += addRule('#nice kbd, xiaofu kbd', { backgroundColor: S.kbd.backgroundColor, color: S.kbd.color, border: '1px solid ' + (S.kbd.borderColor || '#d1d5da'), padding: '2px 5px', borderRadius: '3px', fontSize: '12px' });
  if (S.sub) css += addRule('#nice sub, xiaofu sub', { fontSize: S.sub.fontSize || '11px', verticalAlign: 'sub' });
  if (S.sup) css += addRule('#nice sup, xiaofu sup', { fontSize: S.sup.fontSize || '11px', verticalAlign: 'super' });

  if (S.code) {
    css += addRule('#nice code, xiaofu code', {
      color: S.code.color,
      backgroundColor: S.code.backgroundColor,
      fontSize: S.code.fontSize,
      fontFamily: '"SF Mono", Consolas, Monaco, monospace',
      padding: '2px 5px',
      borderRadius: '4px'
    });
  }

  if (S.pre) css += addRule('#nice pre, xiaofu pre', { backgroundColor: S.pre.backgroundColor });
  if (S.blockquote) {
    css += addRule('#nice blockquote, xiaofu blockquote', {
      borderLeft: S.blockquote.borderLeftColor ? `4px solid ${S.blockquote.borderLeftColor}` : undefined,
      backgroundColor: S.blockquote.backgroundColor,
      color: S.blockquote.textColor
    });
  }

  if (S.ul) css += addRule('#nice ul, xiaofu ul', { listStyleType: S.ul.listStyleType || 'disc', paddingLeft: '18px' });
  if (S.ol) css += addRule('#nice ol, xiaofu ol', { listStyleType: S.ol.listStyleType || 'decimal', paddingLeft: '18px' });
  if (S.li) css += addRule('#nice li, xiaofu li', { color: S.li.color, fontSize: S.li.fontSize, lineHeight: S.li.lineHeight });

  if (S.table) css += addRule('#nice table, xiaofu table', { borderColor: S.table.borderColor, width: '100%' });
  if (S.th) css += addRule('#nice th, xiaofu th', { backgroundColor: S.th.backgroundColor, color: S.th.color, fontWeight: S.th.fontWeight });
  if (S.td) css += addRule('#nice td, xiaofu td', { borderColor: S.td.borderColor, color: S.td.color });

  if (S.hr) css += addRule('#nice hr, xiaofu hr', { borderTop: '1px solid ' + (S.hr.borderColor || '#eaeef2'), margin: '24px 0' });
  if (S.a) css += addRule('#nice a, xiaofu a', { color: S.a.color, textDecoration: S.a.textDecoration || 'none' });
  if (S.img) {
    css += addRule('#nice img, xiaofu img, .markdown-body img', {
      borderRadius: S.img.borderRadius,
      display: S.img.display || 'block',
      margin: S.img.margin || '0 auto',
      maxWidth: S.img.maxWidth || '100%',
      boxShadow: S.img.boxShadow || 'none',
      border: S.img.border || 'none'
    });
  }

  return css;
}

function syncFormToCssText(forceRegenerate = false) {
  if (activeTab.value === 'form' || forceRegenerate || !localStyles.value?.customCss) {
    rawCssText.value = generateCssFromStyles(effectiveStyles.value);
    if (!localStyles.value) localStyles.value = {};
    localStyles.value.customCss = rawCssText.value;
  } else {
    rawCssText.value = localStyles.value.customCss;
  }
}

// When user types in CSS Source Mode, update customCss and emit in real-time
function handleCssTextChange(val) {
  rawCssText.value = val;
  if (!localStyles.value) localStyles.value = {};
  localStyles.value.customCss = val;

  // Simple regex parser to update visual form pickers when CSS is edited directly
  const colorMatch = (selector, prop) => {
    const reg = new RegExp(`${selector}[^{]*?{[^}]*?${prop}:\\s*([^;\\n]+)`, 'i');
    const m = val.match(reg);
    if (!m) return null;
    const extracted = m[m.length - 1].trim();
    if (extracted === 'xiaofu' || extracted === '#nice' || extracted.includes('markdown-body')) {
      return null;
    }
    return extracted;
  };

  const updateMatchedProp = (cat, field, cssProp, sel) => {
    const found = colorMatch(sel, cssProp);
    if (found) {
      if (!localStyles.value[cat]) localStyles.value[cat] = {};
      localStyles.value[cat][field] = found;
    }
  };

  updateMatchedProp('h1', 'color', 'color', '(?:#nice|xiaofu|\\.markdown-body)\\s+h1');
  updateMatchedProp('h2', 'color', 'color', '(?:#nice|xiaofu|\\.markdown-body)\\s+h2');
  updateMatchedProp('h3', 'color', 'color', '(?:#nice|xiaofu|\\.markdown-body)\\s+h3');
  updateMatchedProp('p', 'color', 'color', '(?:#nice|xiaofu|\\.markdown-body)\\s+p');
  updateMatchedProp('code', 'color', 'color', '(?:#nice|xiaofu|\\.markdown-body)\\s+code');
  updateMatchedProp('code', 'backgroundColor', 'background-color', '(?:#nice|xiaofu|\\.markdown-body)\\s+code');
  updateMatchedProp('mark', 'backgroundColor', 'background-color', '(?:#nice|xiaofu|\\.markdown-body)\\s+mark');

  emitUpdate();
}

function initCodeMirror() {
  if (!codemirrorContainerRef.value || cmView) return;

  const customLightTheme = EditorView.theme({
    "&": {
      height: "100%",
      fontSize: "12px",
      fontFamily: '"SF Mono", Consolas, Monaco, "Liberation Mono", Menlo, monospace',
      backgroundColor: "#fdfdfd",
      color: "#24292e"
    },
    ".cm-content": {
      padding: "12px 0"
    },
    ".cm-gutters": {
      backgroundColor: "#f6f8fa",
      color: "#6e7781",
      borderRight: "1px solid #e1e4e8",
      paddingRight: "6px"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#eaeef2",
      color: "#24292e"
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(0, 0, 0, 0.03)"
    },
    ".cm-line": {
      lineHeight: "1.6"
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(39, 117, 182, 0.15) !important"
    },
    ".cm-tooltip-autocomplete": {
      backgroundColor: "#ffffff !important",
      border: "1px solid #e1e4e8 !important",
      borderRadius: "8px !important",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12) !important"
    },
    ".cm-tooltip-autocomplete > ul > li": {
      color: "#24292e",
      padding: "4px 8px"
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "#f0f6fc",
      color: "#0969da"
    }
  }, { dark: false });

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      isUpdatingFromCodeMirror = true;
      const text = update.state.doc.toString();
      handleCssTextChange(text);
      isUpdatingFromCodeMirror = false;
    }
  });

  cmView = new EditorView({
    doc: rawCssText.value || '',
    extensions: [
      basicSetup,
      css(),
      customLightTheme,
      keymap.of([indentWithTab]),
      updateListener
    ],
    parent: codemirrorContainerRef.value
  });
}

function insertSnippet(snippet) {
  if (cmView) {
    const mainSel = cmView.state.selection.main;
    const textToInsert = `\n${snippet}\n`;
    cmView.dispatch({
      changes: { from: mainSel.from, to: mainSel.to, insert: textToInsert },
      selection: { anchor: mainSel.from + textToInsert.length }
    });
    cmView.focus();
  } else {
    rawCssText.value += `\n\n${snippet}`;
    handleCssTextChange(rawCssText.value);
  }
}

watch(activeTab, (tab) => {
  if (tab === 'code') {
    nextTick(() => {
      if (!cmView) {
        initCodeMirror();
      } else {
        const currentDoc = cmView.state.doc.toString();
        if (currentDoc !== rawCssText.value) {
          cmView.dispatch({
            changes: { from: 0, to: currentDoc.length, insert: rawCssText.value || '' }
          });
        }
      }
    });
  }
});

watch(rawCssText, (newVal) => {
  if (cmView && !isUpdatingFromCodeMirror) {
    const currentDoc = cmView.state.doc.toString();
    if (currentDoc !== newVal) {
      cmView.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: newVal || '' }
      });
    }
  }
});

onBeforeUnmount(() => {
  if (cmView) {
    cmView.destroy();
    cmView = null;
  }
});

function close() {
  emit('close');
}

const customizerBodyRef = ref(null);
const highlightedKey = ref('');

function scrollToSection(key) {
  activeTab.value = 'form';
  if (!customizerBodyRef.value) return;
  const el = customizerBodyRef.value.querySelector(`[data-section="${key}"]`);
  if (el) {
    const container = customizerBodyRef.value;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Calculate exact scroll top needed to center the section in the drawer viewport
    const relativeTop = elRect.top - containerRect.top + container.scrollTop;
    const targetScrollTop = relativeTop - (container.clientHeight / 2) + (el.clientHeight / 2);

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth'
    });

    highlightedKey.value = key;
    setTimeout(() => {
      if (highlightedKey.value === key) {
        highlightedKey.value = '';
      }
    }, 1500);
  }
}

defineExpose({ scrollToSection });

const cssLineCount = computed(() => {
  return (rawCssText.value || '').split('\n').length;
});
</script>

<template>
  <aside class="theme-customizer-panel">
    <!-- Header -->
    <div class="customizer-header">
      <div class="customizer-header-left">
        <Palette size="16" class="icon-palette" />
        <span class="header-title">主题编辑</span>
      </div>
      <button class="close-btn" @click="close" title="关闭">
        <X size="15" />
      </button>
    </div>

    <!-- Mode Switcher Tabs -->
    <div class="customizer-mode-bar">
      <button
        class="mode-tab-btn"
        :class="{ 'is-active': activeTab === 'form' }"
        @click="activeTab = 'form'"
      >
        <Sliders size="13" />
        <span>可视化配置</span>
      </button>
      <button
        class="mode-tab-btn"
        :class="{ 'is-active': activeTab === 'code' }"
        @click="activeTab = 'code'"
      >
        <Code2 size="13" />
        <span>源码编辑 (CSS)</span>
      </button>
    </div>

    <!-- Mode 1: Form View (可视化配置) -->
    <div v-show="activeTab === 'form'" class="customizer-body" ref="customizerBodyRef">
      <div
        v-for="el in elements"
        :key="el.key"
        class="style-section"
        :class="{ 'is-highlighted': highlightedKey === el.key }"
        :data-section="el.key"
      >
        <div class="section-label">
          <span class="section-icon">{{ el.icon }}</span>
          <span>{{ el.label }}</span>
          <button
            v-if="localStyles[el.key]"
            class="reset-btn"
            @click="resetCategory(el.key)"
            title="恢复默认"
          >重置</button>
        </div>
        <div class="style-controls">
          <!-- Color (文字色) -->
          <label class="style-field" v-if="getStyle(el.key).color !== undefined">
            <span class="field-label">文字色</span>
            <div class="color-row">
              <input
                type="color"
                :value="getStyle(el.key).color"
                @input="updateStyle(el.key, 'color', $event.target.value)"
                class="color-picker"
              />
              <input
                type="text"
                :value="getStyle(el.key).color"
                @input="updateStyle(el.key, 'color', $event.target.value)"
                class="value-input"
              />
            </div>
          </label>

          <!-- Background -->
          <label class="style-field" v-if="getStyle(el.key).backgroundColor !== undefined">
            <span class="field-label">背景色</span>
            <div class="color-row">
              <input
                type="color"
                :value="getStyle(el.key).backgroundColor"
                @input="updateStyle(el.key, 'backgroundColor', $event.target.value)"
                class="color-picker"
              />
              <input
                type="text"
                :value="getStyle(el.key).backgroundColor"
                @input="updateStyle(el.key, 'backgroundColor', $event.target.value)"
                class="value-input"
              />
            </div>
          </label>

          <!-- Border color -->
          <label class="style-field" v-if="getStyle(el.key).borderLeftColor !== undefined || getStyle(el.key).borderColor !== undefined">
            <span class="field-label">边框色</span>
            <div class="color-row">
              <input
                type="color"
                :value="getStyle(el.key).borderLeftColor || getStyle(el.key).borderColor"
                @input="updateStyle(el.key, getStyle(el.key).borderLeftColor ? 'borderLeftColor' : 'borderColor', $event.target.value)"
                class="color-picker"
              />
              <input
                type="text"
                :value="getStyle(el.key).borderLeftColor || getStyle(el.key).borderColor"
                @input="updateStyle(el.key, getStyle(el.key).borderLeftColor ? 'borderLeftColor' : 'borderColor', $event.target.value)"
                class="value-input"
              />
            </div>
          </label>

          <!-- Table Header / Accent Background -->
          <label class="style-field" v-if="getStyle(el.key).headerBg !== undefined">
            <span class="field-label">表头背景色</span>
            <div class="color-row">
              <input
                type="color"
                :value="getStyle(el.key).headerBg"
                @input="updateStyle(el.key, 'headerBg', $event.target.value)"
                class="color-picker"
              />
              <input
                type="text"
                :value="getStyle(el.key).headerBg"
                @input="updateStyle(el.key, 'headerBg', $event.target.value)"
                class="value-input"
              />
            </div>
          </label>

          <!-- Blockquote text color -->
          <label class="style-field" v-if="getStyle(el.key).textColor !== undefined">
            <span class="field-label">引用文字色</span>
            <div class="color-row">
              <input
                type="color"
                :value="getStyle(el.key).textColor"
                @input="updateStyle(el.key, 'textColor', $event.target.value)"
                class="color-picker"
              />
              <input
                type="text"
                :value="getStyle(el.key).textColor"
                @input="updateStyle(el.key, 'textColor', $event.target.value)"
                class="value-input"
              />
            </div>
          </label>

          <!-- Font size -->
          <label class="style-field" v-if="getStyle(el.key).fontSize !== undefined">
            <span class="field-label">字号</span>
            <select
              :value="getStyle(el.key).fontSize"
              @change="updateStyle(el.key, 'fontSize', $event.target.value)"
              class="style-select"
            >
              <option v-if="getStyle(el.key).fontSize && !['11px','12px','13px','14px','15px','16px','18px','20px','22px','24px','26px','28px','32px'].includes(getStyle(el.key).fontSize)" :value="getStyle(el.key).fontSize">
                {{ getStyle(el.key).fontSize }}
              </option>
              <option value="11px">11px</option>
              <option value="12px">12px</option>
              <option value="13px">13px</option>
              <option value="14px">14px</option>
              <option value="15px">15px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="22px">22px</option>
              <option value="24px">24px</option>
              <option value="26px">26px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>
          </label>

          <!-- Font weight -->
          <label class="style-field" v-if="getStyle(el.key).fontWeight !== undefined">
            <span class="field-label">字重</span>
            <select
              :value="getStyle(el.key).fontWeight"
              @change="updateStyle(el.key, 'fontWeight', $event.target.value)"
              class="style-select"
            >
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </label>

          <!-- Line height -->
          <label class="style-field" v-if="getStyle(el.key).lineHeight !== undefined">
            <span class="field-label">行高</span>
            <select
              :value="getStyle(el.key).lineHeight"
              @change="updateStyle(el.key, 'lineHeight', $event.target.value)"
              class="style-select"
            >
              <option value="1.4">1.4</option>
              <option value="1.6">1.6</option>
              <option value="1.8">1.8</option>
              <option value="2.0">2.0</option>
            </select>
          </label>

          <!-- Image controls (for img element) -->
          <template v-if="el.key === 'img'">
            <!-- Image alignment -->
            <label class="style-field">
              <span class="field-label">对齐方式</span>
              <select
                :value="getStyle('img').margin || '0 auto'"
                @change="updateStyle('img', 'margin', $event.target.value)"
                class="style-select"
              >
                <option value="0 auto">居中对齐</option>
                <option value="0 auto 0 0">左对齐</option>
                <option value="0 0 0 auto">右对齐</option>
              </select>
            </label>

            <!-- Image border radius -->
            <label class="style-field">
              <span class="field-label">圆角</span>
              <select
                :value="getStyle('img').borderRadius || '8px'"
                @change="updateStyle('img', 'borderRadius', $event.target.value)"
                class="style-select"
              >
                <option value="0px">直角 (0px)</option>
                <option value="4px">小圆角 (4px)</option>
                <option value="8px">标准圆角 (8px)</option>
                <option value="12px">大圆角 (12px)</option>
                <option value="16px">特大圆角 (16px)</option>
                <option value="50%">圆形 (50%)</option>
              </select>
            </label>

            <!-- Image max width -->
            <label class="style-field">
              <span class="field-label">最大宽度</span>
              <select
                :value="getStyle('img').maxWidth || '100%'"
                @change="updateStyle('img', 'maxWidth', $event.target.value)"
                class="style-select"
              >
                <option value="100%">100% (全宽)</option>
                <option value="90%">90% (居中缩进)</option>
                <option value="80%">80% (标准缩进)</option>
                <option value="70%">70% (70% 宽)</option>
                <option value="50%">50% (半宽)</option>
              </select>
            </label>

            <!-- Image box shadow -->
            <label class="style-field">
              <span class="field-label">悬浮阴影</span>
              <select
                :value="getStyle('img').boxShadow || 'none'"
                @change="updateStyle('img', 'boxShadow', $event.target.value)"
                class="style-select"
              >
                <option value="none">无阴影</option>
                <option value="0 4px 12px rgba(0,0,0,0.08)">柔和浅阴影</option>
                <option value="0 8px 24px rgba(0,0,0,0.15)">立体卡片阴影</option>
                <option value="0 12px 32px rgba(0,0,0,0.22)">悬浮高光阴影</option>
                <option value="0 0 0 1px rgba(0,0,0,0.08)">细线边框阴影</option>
              </select>
            </label>

            <!-- Image border -->
            <label class="style-field">
              <span class="field-label">相框边框</span>
              <select
                :value="getStyle('img').border || 'none'"
                @change="updateStyle('img', 'border', $event.target.value)"
                class="style-select"
              >
                <option value="none">无边框</option>
                <option value="1px solid #e1e4e8">细灰框 (1px)</option>
                <option value="2px solid var(--accent-color, #2775b6)">主题调性框 (2px)</option>
                <option value="4px solid #ffffff">拍立得白框 (4px)</option>
                <option value="2px dashed #cccccc">复古虚线框 (2px)</option>
              </select>
            </label>
          </template>

          <!-- Generic custom properties -->
          <label
            v-for="prop in otherProps(el.key)"
            :key="prop"
            class="style-field"
          >
            <span class="field-label">{{ propLabel(prop) }}</span>
            <div class="color-row">
              <input
                type="text"
                :value="getStyle(el.key)[prop]"
                @input="updateStyle(el.key, prop, $event.target.value)"
                class="value-input"
              />
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Mode 2: CSS Source Code Editor (源码编辑) -->
    <div v-show="activeTab === 'code'" class="css-source-container">
      <div class="css-toolbar">
        <span class="css-hint">支持 CSS 规则与属性智能联想提示 (#nice, xiaofu)</span>
        <div class="quick-snippets">
          <button class="snippet-btn" @click="insertSnippet('#nice h1, xiaofu h1 { color: #2775b6; font-size: 28px; }')">+ H1 标题</button>
          <button class="snippet-btn" @click="insertSnippet('#nice img, xiaofu img { border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }')">+ 图片卡片</button>
          <button class="snippet-btn" @click="insertSnippet('#nice mark, xiaofu mark { background-color: #fff566; color: #000; }')">+ 高亮 mark</button>
          <button class="snippet-btn" @click="insertSnippet('#nice blockquote, xiaofu blockquote { border-left: 4px solid #2775b6; }')">+ 引用块</button>
        </div>
      </div>
      <div class="codemirror-editor-wrapper" ref="codemirrorContainerRef"></div>
    </div>

    <!-- Footer -->
    <div class="customizer-footer">
      <button class="reset-all-btn" @click="resetAll" title="还原为当前主题默认设置">
        <RotateCcw size="13" />
        <span>还原</span>
      </button>
      <button class="save-styles-btn" @click="handleSave" title="保存当前样式改动到文档">
        <Save size="13" />
        <span>保存</span>
        <span v-if="saveToastVisible" class="save-toast-tip">已保存</span>
      </button>
      <button class="save-theme-btn" @click="emit('save-theme', localStyles)" title="另存为新的预设主题">
        <Palette size="13" />
        <span>另存为主题</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.theme-customizer-panel {
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  background: var(--bg-editor);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;
}

.customizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-app);
}

.customizer-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

.icon-palette {
  color: var(--accent-color);
}

.header-title {
  letter-spacing: -0.2px;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

/* Mode Switcher Bar */
.customizer-mode-bar {
  display: flex;
  padding: 6px 12px;
  gap: 6px;
  background: var(--bg-app);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.mode-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-tab-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

.mode-tab-btn.is-active {
  background: var(--bg-editor);
  color: var(--accent-color);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
  font-weight: 700;
}

/* Form View */
.customizer-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.customizer-body::-webkit-scrollbar {
  width: 4px;
}

.customizer-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.style-section {
  padding: 12px 14px;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.style-section.is-highlighted {
  animation: section-pulse 1.5s ease;
}

@keyframes section-pulse {
  0% {
    background-color: var(--accent-bg);
    border-color: var(--accent-color);
    box-shadow: inset 3px 0 0 var(--accent-color);
  }
  50% {
    background-color: rgba(39, 117, 182, 0.18);
    border-color: var(--accent-color);
    box-shadow: inset 4px 0 0 var(--accent-color);
  }
  100% {
    background-color: var(--bg-editor);
    border-color: var(--border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  }
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-color);
}

.section-icon {
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent-color);
  text-align: center;
  min-width: 20px;
}

.reset-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.style-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.style-field {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  flex: 0 0 auto;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-picker {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
  background: none;
  flex-shrink: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

.value-input {
  width: 72px;
  flex: none;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 2px 6px;
  height: 24px;
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--text-main);
  background: var(--bg-preview);
  outline: none;
  text-align: center;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.value-input:focus {
  border-color: var(--accent-color);
}

.style-select {
  width: 105px;
  flex: none;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 2px 6px;
  height: 24px;
  font-size: 11px;
  color: var(--text-main);
  background: var(--bg-preview);
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.style-select:focus {
  border-color: var(--accent-color);
}

/* CSS Source Code Mode */
.css-source-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fdfdfd;
}

.css-toolbar {
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.css-hint {
  font-size: 11px;
  color: #656d76;
  font-weight: 500;
}

.quick-snippets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.snippet-btn {
  background: #ffffff;
  border: 1px solid #d0d7de;
  color: #24292e;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.snippet-btn:hover {
  background: #f3f4f6;
  color: var(--accent-color, #2775b6);
  border-color: var(--accent-color, #2775b6);
}

.codemirror-editor-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.codemirror-editor-wrapper :deep(.cm-editor) {
  height: 100%;
}

/* Footer */
.customizer-footer {
  padding: 10px 12px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-app);
  flex-shrink: 0;
}

.reset-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-editor);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.reset-all-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
}

.save-styles-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  background: var(--accent-color);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.save-styles-btn:hover {
  opacity: 0.92;
  box-shadow: 0 2px 8px rgba(39, 117, 182, 0.3);
}

.save-toast-tip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  pointer-events: none;
  animation: fadeInOut 0.2s ease;
}

@keyframes fadeInOut {
  from { opacity: 0; transform: translate(-50%, 4px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.save-theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-editor);
  color: var(--text-main);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.save-theme-btn:hover {
  background: var(--border-color);
  border-color: var(--text-muted);
}
</style>
