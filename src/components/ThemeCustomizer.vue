<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Palette, X, Save, Sliders, Code2, RotateCcw, Check, Sparkles, Hash, FileType } from 'lucide-vue-next';
import { getThemeDefaultStyles } from '../utils/themePresets';
import { allMaterialTemplatesMap, getMaterialTemplatesForKey, backgroundTemplates } from '../utils/materialLibrary';
import { codeThemes } from '../utils/codeThemes';
import { EditorView, basicSetup } from 'codemirror';
import { css } from '@codemirror/lang-css';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  themeId: { type: String, default: 'classic-indigo' },
  codeThemeId: { type: String, default: 'atom-one-dark' },
  open: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:codeThemeId', 'update:open', 'save-custom-styles', 'save-theme', 'close']);

// Tab Mode: 'form' (可视化配置) | 'code' (源码编辑)
const activeTab = ref('form');

const localStyles = ref({});
const rawCssText = ref('');
const saveToastVisible = ref(false);
const codemirrorContainerRef = ref(null);
let cmView = null;
let isUpdatingFromCodeMirror = false;

// Material Template Replacement Modal state & helpers
const materialModalOpen = ref(false);
const currentModalKey = ref('h1');

function hasMaterialSupport(key) {
  return ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'ul', 'ol', 'li', 'header_widget', 'footer_widget'].includes(key);
}

function getMaterialTypeLabel(key) {
  const map = {
    body: '整体背景底纹',
    h1: 'H1 一级标题',
    h2: 'H2 二级标题',
    h3: 'H3 三级标题',
    h4: 'H4 四级标题',
    h5: 'H5 五级标题',
    h6: 'H6 六级标题',
    blockquote: '引用 / 引入',
    hr: '分割线',
    ul: '无序列表 (UL)',
    ol: '有序列表 (OL)',
    li: '列表项 (LI)',
    header_widget: '文章头部导读挂件',
    footer_widget: '文末三连/作者名片'
  };
  return map[key] || '素材';
}

function openMaterialModal(key) {
  currentModalKey.value = key;
  materialModalOpen.value = true;
}

function selectMaterialTemplate(templateId) {
  const key = currentModalKey.value;
  if (key === 'header_widget') {
    updateGlobalWidget('headerWidgetId', templateId);
  } else if (key === 'footer_widget') {
    updateGlobalWidget('footerWidgetId', templateId);
  } else if (key === 'body') {
    updateStyle('body', 'backgroundTexture', templateId);
    updateStyle('body', 'materialTemplateId', templateId);
  } else {
    updateStyle(key, 'materialTemplateId', templateId);
  }
  materialModalOpen.value = false;
}

function updateGlobalWidget(prop, value) {
  if (!localStyles.value) localStyles.value = {};
  if (!localStyles.value.globalWidgets) {
    localStyles.value.globalWidgets = {};
  }
  localStyles.value.globalWidgets[prop] = value;
  emitUpdate();
}

function getMaterialTemplateName(id) {
  const t = allMaterialTemplatesMap[id];
  return t ? t.name : '经典素材';
}

function hasPrefixOption(id) {
  return ['h-135-part01-leaf', 'h-135-part02-peach', 'h-135-part03-purple', 'h-135-morandi-block'].includes(id);
}

// Full list of all 27 Markdown syntax element definitions
const elements = [
  { key: 'body', label: '整体背景 / 文字 ( body )', icon: '◻' },
  { key: 'h1', label: '标题 H1 ( # )', icon: 'H1' },
  { key: 'h2', label: '标题 H2 ( ## )', icon: 'H2' },
  { key: 'h3', label: '标题 H3 ( ### )', icon: 'H3' },
  { key: 'h4', label: '标题 H4 ( #### )', icon: 'H4' },
  { key: 'h5', label: '标题 H5 ( ##### )', icon: 'H5' },
  { key: 'h6', label: '标题 H6 ( ###### )', icon: 'H6' },
  { key: 'code', label: '代码块设置 ( code / pre )', icon: '</>' },
  { key: 'p', label: '正文段落 ( p )', icon: 'P' },
  { key: 'strong', label: '加粗强调 ( **bold** )', icon: 'B' },
  { key: 'em', label: '斜体文本 ( *italic* )', icon: 'I' },
  { key: 'del', label: '删除线 ( ~~del~~ )', icon: '~' },
  { key: 'u', label: '下划线 ( <u>u</u> )', icon: 'U' },
  { key: 'mark', label: '高亮标记 ( ==mark== )', icon: 'M' },
  { key: 'kbd', label: '按键标签 ( <kbd>Ctrl</kbd> )', icon: 'K' },
  { key: 'sub', label: '下标 ( H<sub>2</sub>O )', icon: 'sub' },
  { key: 'sup', label: '上标 ( X<sup>2</sup> )', icon: 'sup' },
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
  const allKeys = [...elements.map(e => e.key), 'pre'];
  for (const k of allKeys) {
    merged[k] = { ...(defaults[k] || {}), ...(userStyles[k] || {}) };
  }
  return merged;
});

// Sync props.modelValue, themeId & codeThemeId into localState
watch([() => props.modelValue, () => props.themeId, () => props.codeThemeId], ([val, themeId, codeThemeId]) => {
  localStyles.value = JSON.parse(JSON.stringify(val || {}));
  if (codeThemeId) {
    if (!localStyles.value.code) localStyles.value.code = {};
    if (!localStyles.value.code.codeThemeId) {
      localStyles.value.code.codeThemeId = codeThemeId;
    }
  }
  syncFormToCssText();
}, { immediate: true, deep: true });

watch(() => props.codeThemeId, (newCodeThemeId) => {
  if (newCodeThemeId) {
    if (!localStyles.value) localStyles.value = {};
    if (!localStyles.value.code) localStyles.value.code = {};
    if (localStyles.value.code.codeThemeId !== newCodeThemeId) {
      localStyles.value.code.codeThemeId = newCodeThemeId;
      syncFormToCssText(true);
      emitUpdate();
    }
  }
});

function getStyle(category) {
  return effectiveStyles.value[category] || {};
}

const knownProps = ['color', 'backgroundColor', 'borderLeftColor', 'borderColor', 'textColor', 'headerBg', 'fontSize', 'fontWeight', 'lineHeight', 'margin', 'borderRadius', 'maxWidth', 'boxShadow', 'border', 'display', 'materialTemplateId', 'materialPrefix', 'codeThemeId', 'macStyle', 'showLang', 'letterSpacing', 'fontFamily'];

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

// Convert all Markdown syntax element styles and material directives into standard CSS
function generateCssFromStyles(styles) {
  const S = styles || {};
  let css = `/* ============================================================ */\n`;
  css += `/* NiceMD 文章全量 Markdown 模版 CSS 规则 (标准 CSS 语法)          */\n`;
  css += `/* 支持 #nice、xiaofu 或 .markdown-body 等全局选择器            */\n`;
  css += `/* ============================================================ */\n\n`;

  // Global widgets & Code themes directives
  const gWidgets = localStyles.value?.globalWidgets || {};
  if (gWidgets.headerWidgetId && gWidgets.headerWidgetId !== 'none') {
    css += `/* @header_widget: ${gWidgets.headerWidgetId} */\n`;
  }
  if (gWidgets.footerWidgetId && gWidgets.footerWidgetId !== 'none') {
    css += `/* @footer_widget: ${gWidgets.footerWidgetId} */\n`;
  }
  const codeThemeVal = S.code?.codeThemeId || localStyles.value?.code?.codeThemeId || props.codeThemeId || 'atom-one-dark';
  const codeMacStyleVal = (S.code?.macStyle !== false && localStyles.value?.code?.macStyle !== false);
  const codeShowLangVal = (S.code?.showLang === true || localStyles.value?.code?.showLang === true);
  css += `/* @code_theme: ${codeThemeVal} */\n`;
  css += `/* @code_mac_style: ${codeMacStyleVal} */\n`;
  css += `/* @code_show_lang: ${codeShowLangVal} */\n\n`;

  const cleanColor = (c, fallback) => {
    if (!c || typeof c !== 'string') return fallback;
    const v = c.trim();
    if (v === 'xiaofu' || v === '#nice' || v.includes('markdown-body')) return fallback;
    return v;
  };

  const addRule = (selectors, propsMap, meta = {}) => {
    const lines = [];
    if (meta.material && meta.material !== 'none') {
      lines.push(`  /* @material: ${meta.material} */`);
    }
    if (meta.prefix) {
      lines.push(`  /* @prefix: ${meta.prefix} */`);
    }
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

  // Body
  if (S.body) {
    const bgTexture = S.body.backgroundTexture || S.body.materialTemplateId;
    const meta = (bgTexture && bgTexture !== 'none') ? { material: bgTexture } : {};
    css += addRule('#nice, xiaofu, .markdown-body', {
      color: cleanColor(S.body.color, '#2b2b2b'),
      backgroundColor: S.body.backgroundColor,
      fontSize: S.body.fontSize,
      lineHeight: S.body.lineHeight,
      letterSpacing: S.body.letterSpacing,
      fontFamily: S.body.fontFamily
    }, meta);
  }

  // Headings H1 ~ H6
  const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  headings.forEach(h => {
    if (S[h]) {
      const matId = S[h].materialTemplateId || 'none';
      const meta = {};
      if (matId && matId !== 'none') {
        meta.material = matId;
        if (S[h].materialPrefix) meta.prefix = S[h].materialPrefix;
      }
      const hColor = cleanColor(S[h].color, '#2775b6');
      css += addRule(`#nice ${h}, xiaofu ${h}, .markdown-body ${h}`, {
        color: (hColor === '#ffffff' && !S[h].backgroundColor) ? '#2775b6' : hColor,
        fontSize: S[h].fontSize,
        fontWeight: S[h].fontWeight,
        backgroundColor: S[h].backgroundColor,
        padding: S[h].padding,
        borderRadius: S[h].borderRadius,
        borderLeft: S[h].borderLeft,
        paddingLeft: S[h].paddingLeft,
        textAlign: S[h].textAlign,
        display: S[h].display
      }, meta);
    }
  });

  // Paragraph
  if (S.p) {
    css += addRule('#nice p, xiaofu p, .markdown-body p', {
      color: S.p.color,
      fontSize: S.p.fontSize,
      lineHeight: S.p.lineHeight
    });
  }

  // Blockquote
  if (S.blockquote) {
    const matId = S.blockquote.materialTemplateId || 'none';
    const meta = matId && matId !== 'none' ? { material: matId } : {};
    css += addRule('#nice blockquote, xiaofu blockquote, .markdown-body blockquote', {
      borderLeft: S.blockquote.borderLeftColor ? `4px solid ${S.blockquote.borderLeftColor}` : undefined,
      backgroundColor: S.blockquote.backgroundColor,
      color: S.blockquote.textColor
    }, meta);
  }

  // HR
  if (S.hr) {
    const matId = S.hr.materialTemplateId || 'none';
    const meta = matId && matId !== 'none' ? { material: matId } : {};
    css += addRule('#nice hr, xiaofu hr, .markdown-body hr', {
      borderTop: '1px solid ' + (S.hr.borderColor || '#eaeef2'),
      margin: '24px 0'
    }, meta);
  }

  // List (UL, OL, LI)
  if (S.ul || S.ol || S.li) {
    const listMatId = S.li?.materialTemplateId || S.ul?.materialTemplateId || S.ol?.materialTemplateId || 'none';
    const meta = listMatId && listMatId !== 'none' ? { material: listMatId } : {};
    if (S.ul) css += addRule('#nice ul, xiaofu ul, .markdown-body ul', { listStyleType: S.ul.listStyleType || 'disc', paddingLeft: '18px' }, meta);
    if (S.ol) css += addRule('#nice ol, xiaofu ol, .markdown-body ol', { listStyleType: S.ol.listStyleType || 'decimal', paddingLeft: '18px' });
    if (S.li) css += addRule('#nice li, xiaofu li, .markdown-body li', { color: S.li.color, fontSize: S.li.fontSize, lineHeight: S.li.lineHeight });
  }

  // Inline styling
  if (S.strong) css += addRule('#nice strong, xiaofu strong, .markdown-body strong', { color: S.strong.color, fontWeight: S.strong.fontWeight });
  if (S.em) css += addRule('#nice em, xiaofu em, .markdown-body em', { color: S.em.color, fontStyle: S.em.fontStyle || 'italic' });
  if (S.del) css += addRule('#nice del, xiaofu del, .markdown-body del', { color: S.del.color, textDecoration: S.del.textDecoration || 'line-through' });
  if (S.u) css += addRule('#nice u, xiaofu u, .markdown-body u', { color: S.u.color, textDecoration: 'underline' });
  if (S.mark) css += addRule('#nice mark, xiaofu mark, .markdown-body mark', { backgroundColor: S.mark.backgroundColor, color: S.mark.color, padding: '2px 5px', borderRadius: '3px' });
  if (S.kbd) css += addRule('#nice kbd, xiaofu kbd, .markdown-body kbd', { backgroundColor: S.kbd.backgroundColor, color: S.kbd.color, border: '1px solid ' + (S.kbd.borderColor || '#d1d5da'), padding: '2px 5px', borderRadius: '3px', fontSize: '12px' });
  if (S.sub) css += addRule('#nice sub, xiaofu sub, .markdown-body sub', { fontSize: S.sub.fontSize || '11px', verticalAlign: 'sub' });
  if (S.sup) css += addRule('#nice sup, xiaofu sup, .markdown-body sup', { fontSize: S.sup.fontSize || '11px', verticalAlign: 'super' });

  // Code blocks & Inline code
  if (S.code || S.pre) {
    css += addRule('#nice pre, xiaofu pre, .markdown-body pre', {
      fontSize: S.code?.fontSize || S.pre?.fontSize || '13px',
      lineHeight: S.code?.lineHeight || S.pre?.lineHeight || '1.6',
      letterSpacing: S.code?.letterSpacing || S.pre?.letterSpacing || '0px',
      fontFamily: S.code?.fontFamily || S.pre?.fontFamily || '"SF Mono", Consolas, Monaco, monospace'
    });
    css += addRule('#nice :not(pre) > code, xiaofu :not(pre) > code, .markdown-body :not(pre) > code', {
      color: S.code?.color || '#bb2243',
      backgroundColor: S.code?.backgroundColor || 'rgba(27, 31, 35, 0.05)',
      fontSize: S.code?.fontSize || '13px',
      fontFamily: S.code?.fontFamily || '"SF Mono", Consolas, Monaco, monospace',
      padding: '2px 5px',
      borderRadius: '4px'
    });
  }

  // Table
  if (S.table) css += addRule('#nice table, xiaofu table, .markdown-body table', { borderColor: S.table.borderColor, width: '100%' });
  if (S.th) css += addRule('#nice th, xiaofu th, .markdown-body th', { backgroundColor: S.th.backgroundColor, color: S.th.color, fontWeight: S.th.fontWeight });
  if (S.td) css += addRule('#nice td, xiaofu td, .markdown-body td', { borderColor: S.td.borderColor, color: S.td.color });

  // Links & Images
  if (S.a) css += addRule('#nice a, xiaofu a, .markdown-body a', { color: S.a.color, textDecoration: S.a.textDecoration || 'none' });
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

// When user types in CSS Source Mode, update customCss and sync back to visual state
function handleCssTextChange(val) {
  rawCssText.value = val;
  if (!localStyles.value) localStyles.value = {};
  localStyles.value.customCss = val;

  // 1. Parse Global Widgets
  const hwMatch = val.match(/@header_widget:\s*([a-zA-Z0-9_-]+)/i);
  if (!localStyles.value.globalWidgets) localStyles.value.globalWidgets = {};
  localStyles.value.globalWidgets.headerWidgetId = hwMatch ? hwMatch[1].trim() : 'none';

  const fwMatch = val.match(/@footer_widget:\s*([a-zA-Z0-9_-]+)/i);
  localStyles.value.globalWidgets.footerWidgetId = fwMatch ? fwMatch[1].trim() : 'none';

  // 2. Parse Code Theme & Mac Style
  const ctMatch = val.match(/@code_theme:\s*([a-zA-Z0-9_-]+)/i);
  if (ctMatch) {
    if (!localStyles.value.code) localStyles.value.code = {};
    localStyles.value.code.codeThemeId = ctMatch[1].trim();
    emit('update:codeThemeId', ctMatch[1].trim());
  }
  const macMatch = val.match(/@code_mac_style:\s*(true|false)/i);
  if (macMatch) {
    if (!localStyles.value.code) localStyles.value.code = {};
    localStyles.value.code.macStyle = macMatch[1].toLowerCase() === 'true';
  }
  const showLangMatch = val.match(/@code_show_lang:\s*(true|false)/i);
  if (showLangMatch) {
    if (!localStyles.value.code) localStyles.value.code = {};
    localStyles.value.code.showLang = showLangMatch[1].toLowerCase() === 'true';
  }

  // 3. Helper to extract CSS rule block and properties
  const extractBlock = (tagPattern) => {
    const reg = new RegExp(`(?:#nice|xiaofu|\\.markdown-body)?\\s*${tagPattern}[^{]*?\\{([^}]+)\\}`, 'i');
    const m = val.match(reg);
    return m ? m[1] : '';
  };

  const getPropFromBlock = (block, prop) => {
    const reg = new RegExp(`(?:^|[;\\s])${prop}:\\s*([^;\\n]+)`, 'i');
    const m = block.match(reg);
    return m ? m[1].trim() : null;
  };

  const getMetaFromBlock = (block, metaKey) => {
    const reg = new RegExp(`@${metaKey}:\\s*([^\\s*;]+)`, 'i');
    const m = block.match(reg);
    return m ? m[1].trim() : null;
  };

  // 4. Update tags with material template support & CSS properties
  const tagsWithMaterial = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'ul', 'ol', 'li'];
  tagsWithMaterial.forEach(tag => {
    const block = extractBlock(tag);
    if (!localStyles.value[tag]) localStyles.value[tag] = {};
    
    // Material ID: if @material is specified, apply it; if block exists and @material is removed or 'none', clear material
    const matId = getMetaFromBlock(block, 'material');
    if (matId) {
      localStyles.value[tag].materialTemplateId = matId;
    } else if (block) {
      localStyles.value[tag].materialTemplateId = 'none';
    }

    const prefix = getMetaFromBlock(block, 'prefix');
    if (prefix) {
      localStyles.value[tag].materialPrefix = prefix;
    }

    if (block) {
      const color = getPropFromBlock(block, 'color');
      if (color) localStyles.value[tag].color = color;

      const bg = getPropFromBlock(block, 'background-color') || getPropFromBlock(block, 'background');
      if (bg) localStyles.value[tag].backgroundColor = bg;

      const fs = getPropFromBlock(block, 'font-size');
      if (fs) localStyles.value[tag].fontSize = fs;

      const fw = getPropFromBlock(block, 'font-weight');
      if (fw) localStyles.value[tag].fontWeight = fw;

      const lh = getPropFromBlock(block, 'line-height');
      if (lh) localStyles.value[tag].lineHeight = lh;

      const ls = getPropFromBlock(block, 'letter-spacing');
      if (ls) localStyles.value[tag].letterSpacing = ls;
    }
  });

  // Body block parsing
  const bodyBlock = extractBlock('(?:#nice|xiaofu|\\.markdown-body)?');
  if (bodyBlock) {
    if (!localStyles.value.body) localStyles.value.body = {};
    const color = getPropFromBlock(bodyBlock, 'color');
    if (color) localStyles.value.body.color = color;
    const bg = getPropFromBlock(bodyBlock, 'background-color') || getPropFromBlock(bodyBlock, 'background');
    if (bg) localStyles.value.body.backgroundColor = bg;
    const matId = getMetaFromBlock(bodyBlock, 'material');
    if (matId) {
      localStyles.value.body.backgroundTexture = matId;
      localStyles.value.body.materialTemplateId = matId;
    }
    const fs = getPropFromBlock(bodyBlock, 'font-size');
    if (fs) localStyles.value.body.fontSize = fs;
    const lh = getPropFromBlock(bodyBlock, 'line-height');
    if (lh) localStyles.value.body.lineHeight = lh;
    const ls = getPropFromBlock(bodyBlock, 'letter-spacing');
    if (ls) localStyles.value.body.letterSpacing = ls;
    const ff = getPropFromBlock(bodyBlock, 'font-family');
    if (ff) localStyles.value.body.fontFamily = ff;
  }

  // Paragraph, Code, & Other Tags
  const otherTags = ['p', 'strong', 'em', 'del', 'u', 'mark', 'kbd', 'code', 'pre', 'img', 'table', 'th', 'td', 'a'];
  otherTags.forEach(tag => {
    const block = extractBlock(tag);
    if (block) {
      if (!localStyles.value[tag]) localStyles.value[tag] = {};
      const color = getPropFromBlock(block, 'color');
      if (color) localStyles.value[tag].color = color;
      const bg = getPropFromBlock(block, 'background-color') || getPropFromBlock(block, 'background');
      if (bg) localStyles.value[tag].backgroundColor = bg;
      const fs = getPropFromBlock(block, 'font-size');
      if (fs) localStyles.value[tag].fontSize = fs;
      const fw = getPropFromBlock(block, 'font-weight');
      if (fw) localStyles.value[tag].fontWeight = fw;
      const lh = getPropFromBlock(block, 'line-height');
      if (lh) localStyles.value[tag].lineHeight = lh;
      const ls = getPropFromBlock(block, 'letter-spacing');
      if (ls) localStyles.value[tag].letterSpacing = ls;
      const ff = getPropFromBlock(block, 'font-family');
      if (ff) localStyles.value[tag].fontFamily = ff;
      const br = getPropFromBlock(block, 'border-radius');
      if (br) localStyles.value[tag].borderRadius = br;
      const m = getPropFromBlock(block, 'margin');
      if (m) localStyles.value[tag].margin = m;
    }
  });

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
  const targetKey = (key === 'pre' || key === 'code') ? 'code' : key;
  activeTab.value = 'form';

  const doScroll = () => {
    if (!customizerBodyRef.value) return false;
    const el = customizerBodyRef.value.querySelector(`[data-section="${targetKey}"]`);
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

      highlightedKey.value = targetKey;
      setTimeout(() => {
        if (highlightedKey.value === targetKey) {
          highlightedKey.value = '';
        }
      }, 2000);
      return true;
    }
    return false;
  };

  nextTick(() => {
    if (!doScroll()) {
      setTimeout(doScroll, 100);
    }
  });
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
      <!-- 0. Global Header & Footer Widgets Card (文章头尾挂件预设) -->
      <div class="style-section global-widgets-card" data-section="global-widgets">
        <div class="section-label">
          <span class="section-icon">🎴</span>
          <span class="section-title-text">文章头尾挂件 (全局预设)</span>
          <div class="header-action-group">
            <span class="global-badge">自动注入头尾</span>
          </div>
        </div>
        <p class="global-widget-subtext">
          在此设置文章开头导读卡与文末三连/作者名片，复制至微信公众号或预览时将自动拼装于文章最前与最后。
        </p>

        <!-- Header Widget Picker -->
        <div class="widget-row-box">
          <div class="widget-row-header">
            <div class="widget-title">
              <Sparkles class="w-3.5 h-3.5 text-emerald-500 inline" />
              <span>文章头部引导关注 / 导读卡片</span>
            </div>
            <button class="widget-choose-btn" @click="openMaterialModal('header_widget')">
              {{ localStyles?.globalWidgets?.headerWidgetId && localStyles?.globalWidgets?.headerWidgetId !== 'none' ? '更换模版' : '选择素材' }}
            </button>
          </div>
          <div v-if="localStyles?.globalWidgets?.headerWidgetId && localStyles?.globalWidgets?.headerWidgetId !== 'none'" class="active-widget-banner">
            <span class="widget-active-name">{{ getMaterialTemplateName(localStyles.globalWidgets.headerWidgetId) }}</span>
            <button class="clear-widget-btn" @click="updateGlobalWidget('headerWidgetId', 'none')">
              <X class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Footer Widget Picker -->
        <div class="widget-row-box">
          <div class="widget-row-header">
            <div class="widget-title">
              <Sparkles class="w-3.5 h-3.5 text-amber-500 inline" />
              <span>文末三连 / 作者名片 / 二维码关注</span>
            </div>
            <button class="widget-choose-btn" @click="openMaterialModal('footer_widget')">
              {{ localStyles?.globalWidgets?.footerWidgetId && localStyles?.globalWidgets?.footerWidgetId !== 'none' ? '更换模版' : '选择素材' }}
            </button>
          </div>
          <div v-if="localStyles?.globalWidgets?.footerWidgetId && localStyles?.globalWidgets?.footerWidgetId !== 'none'" class="active-widget-banner">
            <span class="widget-active-name">{{ getMaterialTemplateName(localStyles.globalWidgets.footerWidgetId) }}</span>
            <button class="clear-widget-btn" @click="updateGlobalWidget('footerWidgetId', 'none')">
              <X class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-for="el in elements"
        :key="el.key"
        class="style-section"
        :class="{ 'is-highlighted': highlightedKey === el.key }"
        :data-section="el.key"
      >
        <div class="section-label">
          <span class="section-icon">{{ el.icon }}</span>
          <span class="section-title-text">{{ el.label }}</span>
          <div class="header-action-group">
            <button
              v-if="hasMaterialSupport(el.key)"
              class="replace-material-btn"
              @click="openMaterialModal(el.key)"
              :title="`选择${getMaterialTypeLabel(el.key)}素材模版`"
            >
              <Sparkles class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>素材替换</span>
            </button>
            <button
              v-if="localStyles[el.key]"
              class="reset-btn"
              @click="resetCategory(el.key)"
              title="恢复默认"
            >重置</button>
          </div>
        </div>

        <!-- Active Material Banner -->
        <div
          v-if="hasMaterialSupport(el.key) && getStyle(el.key).materialTemplateId && getStyle(el.key).materialTemplateId !== 'none'"
          class="active-material-banner"
        >
          <div class="active-material-header">
            <div class="active-material-title">
              <Sparkles class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span class="banner-tag">素材模版已生效:</span>
              <span class="banner-name">{{ getMaterialTemplateName(getStyle(el.key).materialTemplateId) }}</span>
            </div>
            <button
              class="clear-material-btn"
              @click="updateStyle(el.key, 'materialTemplateId', 'none')"
              title="清除素材，恢复默认 CSS 样式"
            >
              <X class="w-3.5 h-3.5" />
              <span>清除素材</span>
            </button>
          </div>
          <div v-if="hasPrefixOption(getStyle(el.key).materialTemplateId)" class="material-prefix-row">
            <span class="prefix-label">标牌前缀:</span>
            <input
              type="text"
              :value="getStyle(el.key).materialPrefix || (el.key === 'h1' ? 'PART' : 'SECTION')"
              @input="updateStyle(el.key, 'materialPrefix', $event.target.value)"
              placeholder="如 PART / SECTION / 第"
              class="prefix-input-field"
            />
          </div>
        </div>
        <!-- Dedicated Body Customizer Section (整体背景 / 文字色 / 底纹纹理 / 字体排版) -->
        <div v-if="el.key === 'body'" class="body-customizer-panel">
          <!-- 1. Color Settings (文字色 & 背景色) -->
          <div class="body-row-two-col">
            <div class="body-setting-card">
              <span class="body-setting-title">全局正文字色</span>
              <div class="color-row">
                <input
                  type="color"
                  :value="getStyle('body').color || '#2D3139'"
                  @input="updateStyle('body', 'color', $event.target.value)"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="getStyle('body').color || '#2D3139'"
                  @input="updateStyle('body', 'color', $event.target.value)"
                  class="value-input full-width"
                />
              </div>
            </div>

            <div class="body-setting-card">
              <span class="body-setting-title">文章背景底色</span>
              <div class="color-row">
                <input
                  type="color"
                  :value="getStyle('body').backgroundColor || '#ffffff'"
                  @input="updateStyle('body', 'backgroundColor', $event.target.value)"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="getStyle('body').backgroundColor || '#ffffff'"
                  @input="updateStyle('body', 'backgroundColor', $event.target.value)"
                  class="value-input full-width"
                />
              </div>
            </div>
          </div>

          <!-- 2. Background Texture / Pattern Selector (背景底纹) -->
          <div class="body-texture-box">
            <div class="body-texture-header">
              <div class="body-texture-title-group">
                <span class="body-setting-title">背景底纹样式</span>
                <span class="body-setting-sub">选择整篇排版的背景肌理</span>
              </div>
              <button
                type="button"
                class="mini-material-btn"
                @click="openMaterialModal('body')"
                title="在素材中心挑选更多底纹"
              >
                <Sparkles class="w-3 h-3 text-amber-500 inline" />
                <span>素材库挑选</span>
              </button>
            </div>

            <!-- 8 Texture Pill Selection Grid -->
            <div class="body-texture-grid">
              <button
                type="button"
                v-for="bgTpl in backgroundTemplates"
                :key="bgTpl.id"
                class="body-texture-card"
                :class="{ 'is-active': (getStyle('body').backgroundTexture || getStyle('body').materialTemplateId || 'grid') === bgTpl.id }"
                @click="updateStyle('body', 'backgroundTexture', bgTpl.id); updateStyle('body', 'materialTemplateId', bgTpl.id);"
                :title="bgTpl.description"
              >
                <span class="body-texture-swatch" :style="{ backgroundImage: bgTpl.bgImage, backgroundSize: bgTpl.bgSize, backgroundPosition: bgTpl.bgPosition || '0 0' }"></span>
                <span class="body-texture-label">{{ bgTpl.name.split(' ')[0] }}</span>
              </button>
            </div>
          </div>

          <!-- 3. Typography & Spacing (字号、行高、字间距、字体族) -->
          <div class="body-row-two-col">
            <div class="body-setting-card">
              <span class="body-setting-title">默认字号</span>
              <select
                :value="getStyle('body').fontSize || '16px'"
                @change="updateStyle('body', 'fontSize', $event.target.value)"
                class="style-select full-width"
              >
                <option value="14px">14px (精致小字)</option>
                <option value="15px">15px (紧凑舒适)</option>
                <option value="16px">16px (标准推荐)</option>
                <option value="17px">17px (宽松舒展)</option>
                <option value="18px">18px (清晰大字)</option>
              </select>
            </div>

            <div class="body-setting-card">
              <span class="body-setting-title">行高倍数</span>
              <select
                :value="getStyle('body').lineHeight || '1.8'"
                @change="updateStyle('body', 'lineHeight', $event.target.value)"
                class="style-select full-width"
              >
                <option value="1.5">1.5 (紧凑)</option>
                <option value="1.6">1.6 (适中)</option>
                <option value="1.75">1.75 (舒适推荐)</option>
                <option value="1.8">1.8 (标准推荐)</option>
                <option value="2.0">2.0 (宽松透气)</option>
                <option value="2.2">2.2 (大幅留白)</option>
              </select>
            </div>

            <div class="body-setting-card">
              <span class="body-setting-title">字间距</span>
              <select
                :value="getStyle('body').letterSpacing || '0.05em'"
                @change="updateStyle('body', 'letterSpacing', $event.target.value)"
                class="style-select full-width"
              >
                <option value="0px">0px (紧密)</option>
                <option value="0.03em">0.03em (微展)</option>
                <option value="0.05em">0.05em (标准推荐)</option>
                <option value="0.08em">0.08em (开阔)</option>
                <option value="0.1em">0.1em (优雅呼吸)</option>
              </select>
            </div>

            <div class="body-setting-card">
              <span class="body-setting-title">字体族</span>
              <select
                :value="getStyle('body').fontFamily || 'sans-serif'"
                @change="updateStyle('body', 'fontFamily', $event.target.value)"
                class="style-select full-width"
              >
                <option value="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">现代黑体 (Inter)</option>
                <option value="'PingFang SC', 'Microsoft YaHei', sans-serif">微软雅黑 / 苹方</option>
                <option value="'Songti SC', 'SimSun', STSong, serif">典雅宋体 (Songti)</option>
                <option value="'Kaiti SC', 'KaiTi', STKaiti, serif">温润楷体 (KaiTi)</option>
              </select>
            </div>
          </div>
        </div>

        <div v-else class="style-controls">
          <!-- 1. Dedicated Code Block Customizer (只支持代码主题、Mac风格、字号、行高、字间距、字体族、行内代码配色) -->
          <template v-if="el.key === 'code' || el.key === 'pre'">
            <!-- Code Theme Selector -->
            <label class="style-field">
              <span class="field-label">代码高亮主题</span>
              <select
                :value="localStyles.code?.codeThemeId || props.codeThemeId || 'mdnice-classic'"
                @change="e => { updateStyle('code', 'codeThemeId', e.target.value); emit('update:codeThemeId', e.target.value); }"
                class="style-select"
              >
                <option v-for="ct in codeThemes" :key="ct.id" :value="ct.id">
                  {{ ct.name }}
                </option>
              </select>
            </label>

            <!-- Mac Style Terminal Dots Toggle -->
            <label class="style-field">
              <span class="field-label">Mac 顶栏风格</span>
              <div class="mac-style-toggle-row">
                <button
                  type="button"
                  class="mac-toggle-btn"
                  :class="{ 'is-active': localStyles.code?.macStyle !== false }"
                  @click="updateStyle('code', 'macStyle', !(localStyles.code?.macStyle !== false))"
                >
                  <span class="mac-dots-preview">
                    <span class="mac-dot red"></span>
                    <span class="mac-dot yellow"></span>
                    <span class="mac-dot green"></span>
                  </span>
                  <span>{{ (localStyles.code?.macStyle !== false) ? '已启用 Mac 终端顶栏' : '已关闭 (简约代码块)' }}</span>
                </button>
              </div>
            </label>

            <!-- Language Badge Toggle -->
            <label class="style-field">
              <span class="field-label">代码语言标识</span>
              <div class="mac-style-toggle-row">
                <button
                  type="button"
                  class="mac-toggle-btn"
                  :class="{ 'is-active': localStyles.code?.showLang === true }"
                  @click="updateStyle('code', 'showLang', !(localStyles.code?.showLang === true))"
                >
                  <span style="font-size: 11px; font-weight: 700; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 3px; margin-right: 8px;">JS</span>
                  <span>{{ (localStyles.code?.showLang === true) ? '已显示语言标识 (右上角)' : '已隐藏语言标识 (默认纯净)' }}</span>
                </button>
              </div>
            </label>

            <!-- Code Font Size -->
            <label class="style-field">
              <span class="field-label">代码字号</span>
              <select
                :value="getStyle('code').fontSize || '13px'"
                @change="updateStyle('code', 'fontSize', $event.target.value)"
                class="style-select"
              >
                <option value="11px">11px (紧凑)</option>
                <option value="12px">12px</option>
                <option value="12.5px">12.5px</option>
                <option value="13px">13px (推荐)</option>
                <option value="14px">14px</option>
                <option value="15px">15px</option>
                <option value="16px">16px (醒目)</option>
              </select>
            </label>

            <!-- Code Line Height -->
            <label class="style-field">
              <span class="field-label">代码行高</span>
              <select
                :value="getStyle('code').lineHeight || '1.6'"
                @change="updateStyle('code', 'lineHeight', $event.target.value)"
                class="style-select"
              >
                <option value="1.4">1.4 (紧凑)</option>
                <option value="1.6">1.6 (标准推荐)</option>
                <option value="1.8">1.8 (宽松)</option>
                <option value="2.0">2.0</option>
                <option value="24px">24px</option>
                <option value="26px">26px</option>
                <option value="28px">28px</option>
              </select>
            </label>

            <!-- Code Letter Spacing -->
            <label class="style-field">
              <span class="field-label">字间距</span>
              <select
                :value="getStyle('code').letterSpacing || '0px'"
                @change="updateStyle('code', 'letterSpacing', $event.target.value)"
                class="style-select"
              >
                <option value="0px">0px (标准)</option>
                <option value="0.5px">0.5px (微宽)</option>
                <option value="1px">1.0px (宽松)</option>
                <option value="1.5px">1.5px</option>
              </select>
            </label>

            <!-- Code Font Family -->
            <label class="style-field">
              <span class="field-label">字体族</span>
              <select
                :value="getStyle('code').fontFamily || '&quot;SF Mono&quot;, Consolas, Monaco, monospace'"
                @change="updateStyle('code', 'fontFamily', $event.target.value)"
                class="style-select"
              >
                <option value="&quot;SF Mono&quot;, Consolas, Monaco, monospace">SF Mono (苹果风格)</option>
                <option value="&quot;Fira Code&quot;, Menlo, monospace">Fira Code (编程连字)</option>
                <option value="&quot;JetBrains Mono&quot;, monospace">JetBrains Mono (极客字体)</option>
                <option value="Consolas, Monaco, monospace">Consolas (经典 Windows)</option>
              </select>
            </label>

            <!-- Inline Code Colors -->
            <label class="style-field">
              <span class="field-label">行内代码文字色</span>
              <div class="color-row">
                <input
                  type="color"
                  :value="getStyle('code').color || '#bb2243'"
                  @input="updateStyle('code', 'color', $event.target.value)"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="getStyle('code').color || '#bb2243'"
                  @input="updateStyle('code', 'color', $event.target.value)"
                  class="value-input"
                />
              </div>
            </label>

            <label class="style-field">
              <span class="field-label">行内代码背景色</span>
              <div class="color-row">
                <input
                  type="color"
                  :value="getStyle('code').backgroundColor || '#f5f7fa'"
                  @input="updateStyle('code', 'backgroundColor', $event.target.value)"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="getStyle('code').backgroundColor || 'rgba(27, 31, 35, 0.05)'"
                  @input="updateStyle('code', 'backgroundColor', $event.target.value)"
                  class="value-input"
                />
              </div>
            </label>
          </template>

          <!-- 2. Standard Element Controls (For other elements) -->
          <template v-else>
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
          </template>
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

  <!-- Material Template Picker Modal -->
  <Teleport to="body">
    <div v-if="materialModalOpen" class="heading-modal-overlay" @click.self="materialModalOpen = false">
      <div class="heading-modal-content">
        <div class="heading-modal-header">
          <div class="modal-title-box">
            <Sparkles class="w-5 h-5 text-amber-500" />
            <h3>选择 {{ getMaterialTypeLabel(currentModalKey) }} 素材模版</h3>
          </div>
          <button class="modal-close-icon" @click="materialModalOpen = false">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="heading-materials-grid">
          <div
            v-for="item in getMaterialTemplatesForKey(currentModalKey)"
            :key="item.id"
            class="heading-material-card"
            :class="{ 'is-selected': (currentModalKey === 'header_widget' ? (localStyles?.globalWidgets?.headerWidgetId || 'none') : (currentModalKey === 'footer_widget' ? (localStyles?.globalWidgets?.footerWidgetId || 'none') : (getStyle(currentModalKey).materialTemplateId || 'none'))) === item.id }"
            @click="selectMaterialTemplate(item.id)"
          >
            <div class="card-top">
              <span class="card-name">{{ item.name }}</span>
              <span v-if="(currentModalKey === 'header_widget' ? (localStyles?.globalWidgets?.headerWidgetId || 'none') : (currentModalKey === 'footer_widget' ? (localStyles?.globalWidgets?.footerWidgetId || 'none') : (getStyle(currentModalKey).materialTemplateId || 'none'))) === item.id" class="tag-badge is-active">
                <Check class="w-3 h-3 inline mr-0.5" /> 已选用
              </span>
              <span v-else class="tag-badge" :class="{ 'is-none': item.id === 'none' }">{{ item.tag }}</span>
            </div>
            <div class="card-preview-area" v-html="item.previewHtml"></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.theme-customizer-panel {
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  box-sizing: border-box;
  transition: background 0.3s ease;
}

.customizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-sidebar);
  transition: background 0.3s ease, border-color 0.3s ease;
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
  background: var(--bg-sidebar);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  transition: background 0.3s ease, border-color 0.3s ease;
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

/* Mac Style Toggle */
.mac-style-toggle-row {
  display: flex;
  width: 100%;
}

.mac-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  background: var(--bg-preview);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.mac-toggle-btn:hover {
  border-color: var(--accent-color);
  color: var(--text-main);
}

.mac-toggle-btn.is-active {
  background: rgba(39, 117, 182, 0.08);
  border-color: var(--accent-color);
  color: var(--accent-color);
  font-weight: 600;
}

.mac-dots-preview {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.mac-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.mac-dot.red { background-color: #ff5f56; }
.mac-dot.yellow { background-color: #ffbd2e; }
.mac-dot.green { background-color: #27c93f; }

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

/* Material Replacement Action & Banners */
.header-action-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.replace-material-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 4px;
  color: #d97706;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.replace-material-btn:hover {
  background: rgba(245, 158, 11, 0.22);
  border-color: #f59e0b;
  color: #b45309;
}

.active-material-banner {
  margin: 8px 0 12px;
  padding: 8px 10px;
  background: #fffbeb;
  border: 1px dashed #fcd34d;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.dark) .active-material-banner,
.active-material-banner:where(.dark *) {
  background: #271e05;
  border-color: #78350f;
}

.active-material-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.active-material-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
}

.banner-tag {
  color: #92400e;
  font-weight: 700;
}

.banner-name {
  color: #d97706;
  font-weight: 800;
}

.clear-material-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: #ffffff;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  color: #b45309;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.clear-material-btn:hover {
  background: #fef3c7;
  color: #78350f;
}

.material-prefix-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #78350f;
}

.prefix-input-field {
  padding: 2px 6px;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  font-size: 11px;
  background: #ffffff;
  color: #0f172a;
  width: 100px;
}

/* Modal Overlay & Card Grid */
.heading-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.heading-modal-content {
  width: 100%;
  max-width: 820px;
  max-height: 85vh;
  background: var(--bg-editor, #ffffff);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color, #e2e8f0);
}

.heading-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-app, #f8fafc);
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-main, #0f172a);
}

.modal-close-icon {
  background: transparent;
  border: none;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}

.modal-close-icon:hover {
  background: var(--border-color, #f1f5f9);
  color: var(--text-main, #0f172a);
}

.heading-modal-subtext {
  padding: 10px 20px;
  background: var(--bg-editor, #ffffff);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  font-size: 12.5px;
  color: var(--text-muted, #64748b);
  line-height: 1.5;
}

.heading-materials-grid {
  padding: 18px 20px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.heading-material-card {
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 12px;
  background: var(--bg-editor, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.heading-material-card:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37,99,235,0.12);
  transform: translateY(-1px);
}

.heading-material-card.is-selected {
  border-color: #f59e0b;
  background: #fffdf5;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.25);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-badge {
  background: #eff6ff;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.tag-badge.is-none {
  background: #f1f5f9;
  color: #64748b;
}

.card-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-preview-area {
  padding: 8px 10px;
  background: var(--bg-app, #f8fafc);
  border-radius: 6px;
  min-height: 52px;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color, #e2e8f0);
}

.card-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.card-desc {
  font-size: 11px;
  color: var(--text-muted, #64748b);
  line-height: 1.35;
  margin: 0;
}

.apply-btn {
  width: 100%;
  padding: 6px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid var(--border-color, #cbd5e1);
  background: var(--bg-app, #f8fafc);
  color: var(--text-main, #334155);
  cursor: pointer;
  transition: all 0.15s ease;
}

.heading-material-card:hover .apply-btn {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.apply-btn.active {
  background: #f59e0b !important;
  border-color: #f59e0b !important;
  color: #ffffff !important;
}

/* Global Widgets Card & Feature Guide Styles */
.global-widgets-card {
  background: #f0fdf4 !important;
  border: 1px solid #bbf7d0 !important;
}

.global-badge {
  font-size: 10px;
  font-weight: 700;
  color: #15803d;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 4px;
}

.global-widget-subtext {
  font-size: 11.5px;
  color: #166534;
  line-height: 1.4;
  margin: 0 0 10px 0;
}

.widget-row-box {
  background: #ffffff;
  border: 1px solid #dcfce7;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}

.widget-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.widget-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 5px;
}

.widget-choose-btn {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #86efac;
  padding: 3px 8px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.widget-choose-btn:hover {
  background: #dcfce7;
}

.active-widget-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 4px 8px;
  border-radius: 6px;
  margin-top: 6px;
}

.widget-active-name {
  font-size: 11.5px;
  font-weight: 700;
  color: #065f46;
}

.clear-widget-btn {
  background: transparent;
  border: none;
  color: #059669;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

.modal-feature-guide {
  display: flex;
  gap: 12px;
  padding: 8px 20px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  flex-wrap: wrap;
}

.guide-tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.guide-chip {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.num-chip {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.prefix-chip {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.guide-chip-desc {
  font-size: 11px;
  color: var(--text-muted, #64748b);
}

.card-badges-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.visual-guide-tag {
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
}

.num-tag {
  background: #dbeafe;
  color: #1e40af;
}

.prefix-tag {
  background: #fef3c7;
  color: #92400e;
}

/* Dedicated Body Customizer Panel */
.body-customizer-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.body-row-two-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
}

.body-setting-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-preview, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 8px 10px;
  box-sizing: border-box;
}

.body-setting-title {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-main, #334155);
}

.body-setting-sub {
  font-size: 10.5px;
  color: var(--text-muted, #94a3b8);
}

.value-input.full-width,
.style-select.full-width {
  width: 100%;
  flex: 1;
}

.body-texture-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-preview, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
}

.body-texture-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.body-texture-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-material-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--accent-bg, #eff6ff);
  color: var(--accent-color, #2563eb);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mini-material-btn:hover {
  background: var(--accent-color, #2563eb);
  color: #ffffff;
}

.body-texture-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.body-texture-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  user-select: none;
  box-sizing: border-box;
}

.body-texture-card:hover {
  border-color: var(--accent-color, #2563eb);
  background: var(--accent-bg, #eff6ff);
}

.body-texture-card.is-active {
  border-color: var(--accent-color, #2563eb);
  background: var(--accent-bg, #eff6ff);
  box-shadow: 0 0 0 1.5px var(--accent-color, #2563eb);
}

.body-texture-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  flex-shrink: 0;
  display: inline-block;
}

.body-texture-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-main, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
