<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Palette, FileText, X, Save, Sliders, Code2, RotateCcw, Check, Sparkles, Hash, FileType } from '@lucide/vue';
import { getThemeDefaultStyles, getThemeSavedStyles, isBuiltInTheme } from '../utils/themePresets';
import { allMaterialTemplatesMap, getMaterialTemplatesForKey, backgroundTemplates, underlineTemplates } from '../utils/materialTemplates';
import MaterialPopup from './MaterialPopup.vue';
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

const emit = defineEmits(['update:modelValue', 'update:codeThemeId', 'update:open', 'save-custom-styles', 'save-theme', 'save-custom-theme', 'close']);

const isCustomTheme = computed(() => !isBuiltInTheme(props.themeId));

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
  return ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'u', 'ul', 'ol', 'li', 'table', 'tables', 'header_widget', 'footer_widget'].includes(key);
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
    u: '下划线文本修饰',
    hr: '分割线',
    ul: '无序列表 (UL)',
    ol: '有序列表 (OL)',
    li: '列表项 (LI)',
    table: '表格 / 数据对照',
    tables: '表格 / 数据对照',
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
  } else if (key === 'table' || key === 'tables') {
    if (!localStyles.value) localStyles.value = {};
    if (!localStyles.value.table) localStyles.value.table = {};
    if (!localStyles.value.th) localStyles.value.th = {};
    if (!localStyles.value.td) localStyles.value.td = {};

    localStyles.value.table.materialTemplateId = templateId;
    const tablePresets = getTableMaterialPresets(templateId);
    if (tablePresets) {
      localStyles.value.table.materialTitle = tablePresets.materialTitle;
      localStyles.value.table.borderColor = tablePresets.borderColor;
      localStyles.value.th.backgroundColor = tablePresets.thBg;
      localStyles.value.th.color = tablePresets.thColor;
      localStyles.value.th.fontWeight = tablePresets.thFontWeight;
      localStyles.value.td.color = tablePresets.tdColor;
      localStyles.value.td.borderColor = tablePresets.borderColor;
    }
    emitUpdate();
  } else if (key === 'blockquote') {
    updateStyle('blockquote', 'materialTemplateId', templateId);
    const bqPresets = {
      'quote-cyberpunk-neon': { backgroundColor: '#0f172a', borderLeftColor: '#00f0ff', color: '#e2e8f0' },
      'quote-fresh-green': { backgroundColor: '#f0fdf4', borderLeftColor: '#16a34a', color: '#15803d' },
      'quote-morandi-card': { backgroundColor: '#f4ede4', borderLeftColor: '#b89f88', color: '#4a3b32' },
      'quote-amber-sunset': { backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b', color: '#78350f' },
      'quote-purple-dream': { backgroundColor: '#faf5ff', borderLeftColor: '#a855f7', color: '#581c87' },
      'quote-glass-modern': { backgroundColor: '#f8fafc', borderLeftColor: '#3b82f6', color: '#334155' },
      'quote-minimal-gray': { backgroundColor: '#f9fafb', borderLeftColor: '#6b7280', color: '#374151' }
    }[templateId];
    if (bqPresets) {
      if (bqPresets.backgroundColor) updateStyle('blockquote', 'backgroundColor', bqPresets.backgroundColor);
      if (bqPresets.borderLeftColor) updateStyle('blockquote', 'borderLeftColor', bqPresets.borderLeftColor);
      if (bqPresets.color) updateStyle('blockquote', 'color', bqPresets.color);
    }
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
  return ['h-cyan-signpost-top', 'h-135-part01-leaf', 'h-135-part02-peach', 'h-135-part03-purple', 'h-135-morandi-block', 'h-pill-duotone', 'h-yellow-shadow-cube'].includes(id);
}

function hasTableTitleOption(id) {
  return [
    'tbl-handdrawn-planner-card',
    'tbl-retro-window-size',
    'tbl-terminal-dark-metrics',
    'tbl-apricot-star-card',
    'tbl-macaron-faq-qa',
    'tbl-redbook-checkin-routine'
  ].includes(id);
}

function getDefaultTableTitle(id) {
  const map = {
    'tbl-handdrawn-planner-card': '✨ 本周打卡清单计划表 ✨',
    'tbl-retro-window-size': '品牌尺码参照表',
    'tbl-terminal-dark-metrics': 'cluster_metrics.log',
    'tbl-apricot-star-card': '⭐ 超详细的考研全程攻略 ⭐',
    'tbl-macaron-faq-qa': '💡 常见核心疑问速查指南 (FAQ)',
    'tbl-redbook-checkin-routine': '🥗 超自律 7 天掉秤食谱打卡 💖'
  };
  return map[id] || '表格标题';
}

function getTableMaterialPresets(id) {
  const map = {
    'tbl-slate-movie-rank': {
      thBg: '#f0f4f6',
      thColor: '#475569',
      thFontWeight: 'bold',
      tdColor: '#334155',
      borderColor: '#ffffff',
      materialTitle: ''
    },
    'tbl-apricot-star-card': {
      thBg: '#faece1',
      thColor: '#1c1917',
      thFontWeight: '800',
      tdColor: '#1c1917',
      borderColor: '#292524',
      materialTitle: '⭐ 超详细的考研全程攻略 ⭐'
    },
    'tbl-retro-window-size': {
      thBg: '#181818',
      thColor: '#ffffff',
      thFontWeight: '800',
      tdColor: '#1a1a1a',
      borderColor: '#1a1a1a',
      materialTitle: '品牌尺码参照表'
    },
    'tbl-morandi-blush-size': {
      thBg: '#ebe0e0',
      thColor: '#4a3838',
      thFontWeight: 'bold',
      tdColor: '#5c4848',
      borderColor: '#ffffff',
      materialTitle: ''
    },
    'tbl-milktea-apricot-schedule': {
      thBg: '#f3ece5',
      thColor: '#4a3a30',
      thFontWeight: 'bold',
      tdColor: '#5c4a3e',
      borderColor: '#ffffff',
      materialTitle: ''
    },
    'tbl-amber-schedule': {
      thBg: '#fbf0e4',
      thColor: '#633806',
      thFontWeight: 'bold',
      tdColor: '#633806',
      borderColor: '#ffffff',
      materialTitle: ''
    },
    'tbl-modern-striped': {
      thBg: '#f1f5f9',
      thColor: '#334155',
      thFontWeight: 'bold',
      tdColor: '#475569',
      borderColor: '#f1f5f9',
      materialTitle: ''
    },
    'tbl-tier-comparison': {
      thBg: '#2563eb',
      thColor: '#ffffff',
      thFontWeight: 'bold',
      tdColor: '#334155',
      borderColor: '#e2e8f0',
      materialTitle: ''
    },
    'tbl-business-blue-compare': {
      thBg: '#1e3a8a',
      thColor: '#ffffff',
      thFontWeight: 'bold',
      tdColor: '#1e293b',
      borderColor: '#cbd5e1',
      materialTitle: ''
    },
    'tbl-terminal-dark-metrics': {
      thBg: '#0f172a',
      thColor: '#38bdf8',
      thFontWeight: 'bold',
      tdColor: '#cbd5e1',
      borderColor: '#1e293b',
      materialTitle: 'cluster_metrics.log'
    },
    'tbl-matcha-green-progress': {
      thBg: '#ecfdf5',
      thColor: '#065f46',
      thFontWeight: 'bold',
      tdColor: '#047857',
      borderColor: '#a7f3d0',
      materialTitle: ''
    },
    'tbl-guofeng-crimson-classic': {
      thBg: '#7f1d1d',
      thColor: '#fef08a',
      thFontWeight: 'bold',
      tdColor: '#7f1d1d',
      borderColor: '#b91c1c',
      materialTitle: ''
    },
    'tbl-handdrawn-planner-card': {
      thBg: '#fffbeb',
      thColor: '#18181b',
      thFontWeight: '800',
      tdColor: '#18181b',
      borderColor: '#18181b',
      materialTitle: '✨ 本周打卡清单计划表 ✨'
    },
    'tbl-minimal-luxury-clean': {
      thBg: '#fafafa',
      thColor: '#18181b',
      thFontWeight: 'bold',
      tdColor: '#3f3f46',
      borderColor: '#f4f4f5',
      materialTitle: ''
    },
    'tbl-aurora-gradient-eval': {
      thBg: '#090d16',
      thColor: '#f8fafc',
      thFontWeight: 'bold',
      tdColor: '#cbd5e1',
      borderColor: '#1e293b',
      materialTitle: ''
    },
    'tbl-macaron-faq-qa': {
      thBg: '#fef3c7',
      thColor: '#92400e',
      thFontWeight: '800',
      tdColor: '#1e293b',
      borderColor: '#fde68a',
      materialTitle: '💡 常见核心疑问速查指南 (FAQ)'
    },
    'tbl-redbook-checkin-routine': {
      thBg: '#ffe4e6',
      thColor: '#881337',
      thFontWeight: '800',
      tdColor: '#881337',
      borderColor: '#fb7185',
      materialTitle: '🥗 超自律 7 天掉秤食谱打卡 💖'
    }
  };
  return map[id] || null;
}

// Full list of all 27 Markdown syntax element definitions
const elements = [
  { key: 'body', label: '整体背景 ( body )', icon: '◻' },
  { key: 'p', label: '正文段落 ( p )', icon: 'P' },
  { key: 'h1', label: '标题 H1 ( # )', icon: 'H1' },
  { key: 'h2', label: '标题 H2 ( ## )', icon: 'H2' },
  { key: 'h3', label: '标题 H3 ( ### )', icon: 'H3' },
  { key: 'h4', label: '标题 H4 ( #### )', icon: 'H4' },
  { key: 'h5', label: '标题 H5 ( ##### )', icon: 'H5' },
  { key: 'h6', label: '标题 H6 ( ###### )', icon: 'H6' },
  { key: 'code', label: '代码块设置 ( code / pre )', icon: '</>' },
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
  { key: 'table', label: '表格样式设置 ( table / th / td )', icon: '田' },
  { key: 'hr', label: '分割线 ( --- )', icon: '―' },
  { key: 'a', label: '超链接 ( [link](url) )', icon: '↗' },
  { key: 'img', label: '图片 ( ![img](url) )', icon: '▧' }
];

// Merge theme base defaults with material template defaults and user document overrides
const effectiveStyles = computed(() => {
  const defaults = getThemeDefaultStyles(props.themeId);
  const userStyles = localStyles.value || {};
  const merged = {};

  // If table has a material template active, blend in the material's preset signature colors
  const tblMatId = userStyles.table?.materialTemplateId || defaults.table?.materialTemplateId;
  let tableMaterialDefaults = {};
  if (tblMatId && tblMatId !== 'none') {
    const p = getTableMaterialPresets(tblMatId);
    if (p) {
      tableMaterialDefaults = {
        th: { backgroundColor: p.thBg, color: p.thColor, fontWeight: p.thFontWeight },
        td: { color: p.tdColor, borderColor: p.borderColor },
        table: { borderColor: p.borderColor, materialTitle: p.materialTitle }
      };
    }
  }

  // If blockquote has a material template active, blend in its signature colors
  const bqMatId = userStyles.blockquote?.materialTemplateId || defaults.blockquote?.materialTemplateId;
  let bqMaterialDefaults = {};
  if (bqMatId && bqMatId !== 'none') {
    const bqMap = {
      'quote-cyberpunk-neon': { backgroundColor: '#0f172a', borderLeftColor: '#00f0ff', textColor: '#e2e8f0' },
      'quote-fresh-green': { backgroundColor: '#f0fdf4', borderLeftColor: '#16a34a', textColor: '#15803d' },
      'quote-morandi-card': { backgroundColor: '#f4ede4', borderLeftColor: '#b89f88', textColor: '#4a3b32' },
      'quote-amber-sunset': { backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b', textColor: '#78350f' },
      'quote-purple-dream': { backgroundColor: '#faf5ff', borderLeftColor: '#a855f7', textColor: '#581c87' },
      'quote-glass-modern': { backgroundColor: '#f8fafc', borderLeftColor: '#3b82f6', textColor: '#334155' },
      'quote-minimal-gray': { backgroundColor: '#f9fafb', borderLeftColor: '#6b7280', textColor: '#374151' }
    };
    if (bqMap[bqMatId]) {
      bqMaterialDefaults = { blockquote: bqMap[bqMatId] };
    }
  }

  // Ensure defaults exist for all elements
  const allKeys = [...elements.map(e => e.key), 'pre', 'th', 'td'];
  for (const k of allKeys) {
    merged[k] = {
      ...(defaults[k] || {}),
      ...(tableMaterialDefaults[k] || {}),
      ...(bqMaterialDefaults[k] || {}),
      ...(userStyles[k] || {})
    };
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

function hasEditableControls(category) {
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'table', 'img'].includes(category)) return true;
  const style = getStyle(category);
  const editableProps = [
    'color', 'backgroundColor', 'borderLeftColor', 'borderColor', 'headerBg',
    'textColor', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign',
    'paddingLeft', 'borderLeft', 'margin'
  ];
  return editableProps.some(prop => style[prop] !== undefined) || otherProps(category).length > 0;
}

const visibleElements = computed(() =>
  elements.filter(el => hasMaterialSupport(el.key) || hasEditableControls(el.key))
);

const knownProps = ['color', 'backgroundColor', 'borderLeftColor', 'borderColor', 'textColor', 'headerBg', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'paddingLeft', 'borderLeft', 'margin', 'borderRadius', 'maxWidth', 'boxShadow', 'border', 'display', 'materialTemplateId', 'materialPrefix', 'materialTitle', 'codeThemeId', 'macStyle', 'showLang', 'letterSpacing', 'fontFamily', 'padding', 'backgroundTexture'];

function clearMaterial(key) {
  updateStyle(key, 'materialTemplateId', 'none');
  if (key === 'body') {
    updateStyle('body', 'backgroundTexture', 'clean');
  }
  if (key === 'table' || key === 'tables') {
    if (localStyles.value) {
      if (localStyles.value.table) {
        localStyles.value.table.materialTitle = '';
        delete localStyles.value.table.borderColor;
        delete localStyles.value.table.headerBg;
      }
      delete localStyles.value.th;
      delete localStyles.value.td;
    }
    syncFormToCssText(true);
    emitUpdate();
  }
}

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
  listStyleType: '列表标记类型',
  textAlign: '对齐方式',
  paddingLeft: '左内边距',
  borderLeft: '左边框',
  borderBottom: '底边框',
  paddingBottom: '底内边距',
  textIndent: '首行缩进'
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
    if (category === 'table') {
      delete localStyles.value.th;
      delete localStyles.value.td;
    }
  }
  syncFormToCssText(true);
  emitUpdate();
}

function resetAll() {
  handleResetToThemeDefault();
}

const resetToastVisible = ref(false);
const resetToastMsg = ref('已恢复默认');

function handleResetToThemeDefault() {
  if (isCustomTheme.value) {
    // User custom theme -> Restore to last saved state
    const saved = getThemeSavedStyles(props.themeId);
    localStyles.value = JSON.parse(JSON.stringify(saved || {}));
    rawCssText.value = localStyles.value.customCss || generateCssFromStyles(localStyles.value);
    if (!localStyles.value.customCss) localStyles.value.customCss = rawCssText.value;
    if (cmView) {
      cmView.dispatch({
        changes: { from: 0, to: cmView.state.doc.length, insert: rawCssText.value }
      });
    }
    emitUpdate();
    resetToastMsg.value = '已恢复至保存状态';
    resetToastVisible.value = true;
    setTimeout(() => {
      resetToastVisible.value = false;
    }, 2000);
  } else {
    // Built-in theme -> Reset to official preset pure styles
    localStyles.value = {};
    const defaults = getThemeDefaultStyles(props.themeId);
    rawCssText.value = generateCssFromStyles(defaults);
    if (!localStyles.value) localStyles.value = {};
    localStyles.value.customCss = rawCssText.value;
    if (cmView) {
      cmView.dispatch({
        changes: { from: 0, to: cmView.state.doc.length, insert: rawCssText.value }
      });
    }
    emitUpdate();
    resetToastMsg.value = '已恢复系统默认';
    resetToastVisible.value = true;
    setTimeout(() => {
      resetToastVisible.value = false;
    }, 2000);
  }
}

function handleSaveCustomTheme() {
  const merged = JSON.parse(JSON.stringify(effectiveStyles.value || {}));
  const local = JSON.parse(JSON.stringify(localStyles.value || {}));
  for (const k of Object.keys(local)) {
    if (typeof local[k] === 'object' && local[k] !== null) {
      merged[k] = { ...(merged[k] || {}), ...local[k] };
    } else {
      merged[k] = local[k];
    }
  }
  merged.customCss = rawCssText.value || local.customCss || '';
  if (local.globalWidgets) {
    merged.globalWidgets = local.globalWidgets;
  }
  emit('save-custom-theme', {
    themeId: props.themeId,
    styles: merged,
    css: rawCssText.value
  });
  saveToastVisible.value = true;
  setTimeout(() => {
    saveToastVisible.value = false;
  }, 1800);
}

function handleSaveThemeAs() {
  const merged = JSON.parse(JSON.stringify(effectiveStyles.value || {}));
  const local = JSON.parse(JSON.stringify(localStyles.value || {}));
  for (const k of Object.keys(local)) {
    if (typeof local[k] === 'object' && local[k] !== null) {
      merged[k] = { ...(merged[k] || {}), ...local[k] };
    } else {
      merged[k] = local[k];
    }
  }
  merged.customCss = rawCssText.value || local.customCss || '';
  if (local.globalWidgets) {
    merged.globalWidgets = local.globalWidgets;
  }
  emit('save-theme', merged);
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

// Safely merges visual form changes into existing raw CSS, preserving user's custom CSS rules & unsupported properties
function mergeIncrementalCss(existingCss, styles) {
  if (!existingCss || typeof existingCss !== 'string' || !existingCss.trim()) {
    return generateCssFromStyles(styles);
  }

  let updatedCss = existingCss;
  const S = styles || {};

  const updateRuleBlock = (tagPattern, newProps, meta = {}) => {
    const reg = new RegExp(`((?:^|\\n|,)\\s*(?:#(?:easymd|nice)|xiaofu|\\.markdown-body)?\\s*${tagPattern}[^{]*?\\{)([^}]+)(\\})`, 'i');
    const match = updatedCss.match(reg);
    if (match) {
      const prefix = match[1];
      let body = match[2];
      const suffix = match[3];

      if (meta.material !== undefined) {
        body = body.replace(/\/\*\s*@material:[^*]+\*\/\s*\n?/gi, '');
        if (meta.material && meta.material !== 'none') {
          body = `\n  /* @material: ${meta.material} */` + body;
        }
      }
      if (meta.prefix !== undefined) {
        body = body.replace(/\/\*\s*@prefix:[^*]+\*\/\s*\n?/gi, '');
        if (meta.prefix) {
          body = `\n  /* @prefix: ${meta.prefix} */` + body;
        }
      }
      if (meta.title !== undefined) {
        body = body.replace(/\/\*\s*@title:[^*]+\*\/\s*\n?/gi, '');
        if (meta.title) {
          body = `\n  /* @title: ${meta.title} */` + body;
        }
      }

      for (const [k, v] of Object.entries(newProps)) {
        if (v !== undefined && v !== null && v !== '') {
          const cssProp = k.replace(/([A-Z])/g, '-$1').toLowerCase();
          const propReg = new RegExp(`(^|;\\s*|\\n\\s*)${cssProp}\\s*:[^;\\n]+;?`, 'i');
          if (propReg.test(body)) {
            body = body.replace(propReg, `$1${cssProp}: ${v};`);
          } else {
            body += `\n  ${cssProp}: ${v};`;
          }
        }
      }

      updatedCss = updatedCss.replace(match[0], `${prefix}${body}${suffix}`);
    }
  };

  if (S.body) {
    updateRuleBlock('(?:#(?:easymd|nice)|body|\\.markdown-body)', {
      color: S.body.color,
      backgroundColor: S.body.backgroundColor,
      padding: S.body.padding,
      fontSize: S.body.fontSize,
      lineHeight: S.body.lineHeight,
      letterSpacing: S.body.letterSpacing,
      fontFamily: S.body.fontFamily
    }, {
      material: S.body.backgroundTexture || S.body.materialTemplateId
    });
  }

  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(h => {
    if (S[h]) {
      updateRuleBlock(h, {
        color: S[h].color,
        fontSize: S[h].fontSize,
        fontWeight: S[h].fontWeight,
        backgroundColor: S[h].backgroundColor,
        padding: S[h].padding,
        borderRadius: S[h].borderRadius,
        borderLeft: S[h].borderLeft,
        paddingLeft: S[h].paddingLeft,
        textAlign: S[h].textAlign,
        display: S[h].display
      }, {
        material: S[h].materialTemplateId,
        prefix: S[h].materialPrefix
      });
    }
  });

  if (S.p) {
    updateRuleBlock('p', {
      color: S.p.color,
      fontSize: S.p.fontSize,
      lineHeight: S.p.lineHeight
    });
  }

  if (S.blockquote) {
    updateRuleBlock('blockquote', {
      borderLeft: S.blockquote.borderLeftColor ? `4px solid ${S.blockquote.borderLeftColor}` : undefined,
      backgroundColor: S.blockquote.backgroundColor,
      color: S.blockquote.textColor
    }, {
      material: S.blockquote.materialTemplateId
    });
  }

  if (S.table) {
    updateRuleBlock('table', {
      borderColor: S.table.borderColor
    }, {
      material: S.table.materialTemplateId,
      title: S.table.materialTitle
    });
  }

  if (S.th) {
    updateRuleBlock('th', {
      backgroundColor: S.th.backgroundColor,
      color: S.th.color,
      fontWeight: S.th.fontWeight
    });
  }

  if (S.td) {
    updateRuleBlock('td', {
      borderColor: S.td.borderColor,
      color: S.td.color
    });
  }

  if (S.hr) {
    updateRuleBlock('hr', {
      borderTop: S.hr.borderColor ? `1px solid ${S.hr.borderColor}` : undefined
    }, {
      material: S.hr.materialTemplateId
    });
  }

  return updatedCss;
}

// Convert all Markdown syntax element styles and material directives into standard CSS
function generateCssFromStyles(styles) {
  const S = styles || {};
  let css = `/* ============================================================ */\n`;
  css += `/* EasyMD 文章全量 Markdown 模版 CSS 规则 (标准 CSS 语法)          */\n`;
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

  // Body (Global container #easymd)
  if (S.body) {
    const bgTexture = S.body.backgroundTexture || S.body.materialTemplateId;
    const meta = (bgTexture && bgTexture !== 'none') ? { material: bgTexture } : {};
    css += addRule('#easymd', {
      color: cleanColor(S.p?.color || S.body?.color, '#2b2b2b'),
      backgroundColor: S.body.backgroundColor,
      padding: S.body.padding || '5px',
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
      css += addRule(h, {
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
    css += addRule('p', {
      color: S.p.color,
      fontSize: S.p.fontSize,
      lineHeight: S.p.lineHeight,
      letterSpacing: S.p.letterSpacing,
      textIndent: S.p.textIndent,
      textAlign: S.p.textAlign,
      marginBottom: S.p.marginBottom
    });
  }

  // Blockquote
  if (S.blockquote) {
    const matId = S.blockquote.materialTemplateId || 'none';
    const meta = matId && matId !== 'none' ? { material: matId } : {};
    css += addRule('blockquote', {
      borderLeft: S.blockquote.borderLeftColor ? `4px solid ${S.blockquote.borderLeftColor}` : undefined,
      backgroundColor: S.blockquote.backgroundColor,
      color: S.blockquote.textColor
    }, meta);
  }

  // HR
  if (S.hr) {
    const matId = S.hr.materialTemplateId || 'none';
    const meta = matId && matId !== 'none' ? { material: matId } : {};
    css += addRule('hr', {
      borderTop: '1px solid ' + (S.hr.borderColor || '#eaeef2'),
      margin: '24px 0'
    }, meta);
  }

  // List (UL, OL, LI)
  if (S.ul || S.ol || S.li) {
    const listMatId = S.li?.materialTemplateId || S.ul?.materialTemplateId || S.ol?.materialTemplateId || 'none';
    const meta = listMatId && listMatId !== 'none' ? { material: listMatId } : {};
    if (S.ul) css += addRule('ul', { listStyleType: S.ul.listStyleType || 'disc', paddingLeft: '18px' }, meta);
    if (S.ol) css += addRule('ol', { listStyleType: S.ol.listStyleType || 'decimal', paddingLeft: '18px' });
    if (S.li) css += addRule('li', { color: S.li.color, fontSize: S.li.fontSize, lineHeight: S.li.lineHeight });
  }

  // Inline styling
  if (S.strong) css += addRule('strong', { color: S.strong.color, fontWeight: S.strong.fontWeight });
  if (S.em) css += addRule('em', { color: S.em.color, fontStyle: S.em.fontStyle || 'italic' });
  if (S.del) css += addRule('del', { color: S.del.color, textDecoration: S.del.textDecoration || 'line-through' });
  if (S.u) css += addRule('u', { color: S.u.color, textDecoration: 'underline' });
  if (S.mark) css += addRule('mark', { backgroundColor: S.mark.backgroundColor, color: S.mark.color, padding: '2px 5px', borderRadius: '3px' });
  if (S.kbd) css += addRule('kbd', { backgroundColor: S.kbd.backgroundColor, color: S.kbd.color, border: '1px solid ' + (S.kbd.borderColor || '#d1d5da'), padding: '2px 5px', borderRadius: '3px', fontSize: '12px' });
  if (S.sub) css += addRule('sub', { fontSize: S.sub.fontSize || '11px', verticalAlign: 'sub' });
  if (S.sup) css += addRule('sup', { fontSize: S.sup.fontSize || '11px', verticalAlign: 'super' });

  // Code blocks & Inline code
  if (S.code || S.pre) {
    css += addRule('pre', {
      fontSize: S.code?.fontSize || S.pre?.fontSize || '13px',
      lineHeight: S.code?.lineHeight || S.pre?.lineHeight || '1.6',
      letterSpacing: S.code?.letterSpacing || S.pre?.letterSpacing || '0px',
      fontFamily: S.code?.fontFamily || S.pre?.fontFamily || '"SF Mono", Consolas, Monaco, monospace'
    });
    css += addRule('code', {
      color: S.code?.color || '#bb2243',
      backgroundColor: S.code?.backgroundColor || 'rgba(27, 31, 35, 0.05)',
      fontSize: S.code?.fontSize || '13px',
      fontFamily: S.code?.fontFamily || '"SF Mono", Consolas, Monaco, monospace',
      padding: '2px 5px',
      borderRadius: '4px'
    });
  }

  // Table
  if (S.table) {
    const matId = S.table.materialTemplateId || 'none';
    const meta = {};
    if (matId && matId !== 'none') {
      meta.material = matId;
      if (S.table.materialTitle) meta.title = S.table.materialTitle;
    }
    css += addRule('table', { borderColor: S.table.borderColor, width: '100%' }, meta);
  }
  if (S.th) css += addRule('th', { backgroundColor: S.th.backgroundColor, color: S.th.color, fontWeight: S.th.fontWeight });
  if (S.td) css += addRule('td', { borderColor: S.td.borderColor, color: S.td.color });

  // Links & Images
  if (S.a) css += addRule('a', { color: S.a.color, textDecoration: S.a.textDecoration || 'none' });
  if (S.img) {
    css += addRule('img', {
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
  if (forceRegenerate || !localStyles.value?.customCss) {
    rawCssText.value = generateCssFromStyles(effectiveStyles.value);
  } else if (activeTab.value === 'form') {
    rawCssText.value = mergeIncrementalCss(localStyles.value.customCss, effectiveStyles.value);
  } else {
    rawCssText.value = localStyles.value.customCss;
  }
  if (!localStyles.value) localStyles.value = {};
  localStyles.value.customCss = rawCssText.value;

  if (cmView && !isUpdatingFromCodeMirror) {
    const curDoc = cmView.state.doc.toString();
    if (curDoc !== rawCssText.value) {
      cmView.dispatch({
        changes: { from: 0, to: curDoc.length, insert: rawCssText.value }
      });
    }
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
    const reg = new RegExp(`(?:^|\\n|,)\\s*(?:#(?:easymd|nice)|xiaofu|\\.markdown-body)?\\s*${tagPattern}[^{]*?\\{([^}]+)\\}`, 'i');
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
  const tagsWithMaterial = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'ul', 'ol', 'li', 'table'];
  tagsWithMaterial.forEach(tag => {
    const block = extractBlock(tag);
    if (!localStyles.value[tag]) localStyles.value[tag] = {};
    
    // Material ID: if @material is specified, apply it only if it belongs to this tag's category
    const matId = getMetaFromBlock(block, 'material');
    if (matId && matId !== 'none') {
      const validTemplates = getMaterialTemplatesForKey(tag);
      if (validTemplates.some(t => t.id === matId)) {
        localStyles.value[tag].materialTemplateId = matId;
      } else {
        localStyles.value[tag].materialTemplateId = 'none';
      }
    } else if (block) {
      localStyles.value[tag].materialTemplateId = 'none';
    }

    const prefix = getMetaFromBlock(block, 'prefix');
    if (prefix) {
      localStyles.value[tag].materialPrefix = prefix;
    }

    const matTitle = getMetaFromBlock(block, 'title');
    if (matTitle) {
      localStyles.value[tag].materialTitle = matTitle;
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

  // Body block parsing (#easymd, #nice, body, .markdown-body)
  const bodyBlock = extractBlock('(?:#(?:easymd|nice)|body|\\.markdown-body)');
  if (bodyBlock) {
    if (!localStyles.value.body) localStyles.value.body = {};
    const color = getPropFromBlock(bodyBlock, 'color');
    if (color) localStyles.value.body.color = color;
    const bg = getPropFromBlock(bodyBlock, 'background-color') || getPropFromBlock(bodyBlock, 'background');
    if (bg) localStyles.value.body.backgroundColor = bg;
    const pad = getPropFromBlock(bodyBlock, 'padding');
    if (pad) localStyles.value.body.padding = pad;
    const matId = getMetaFromBlock(bodyBlock, 'material');
    if (matId) {
      localStyles.value.body.backgroundTexture = matId;
      localStyles.value.body.materialTemplateId = matId;
    } else {
      localStyles.value.body.backgroundTexture = 'clean';
      localStyles.value.body.materialTemplateId = 'none';
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
      padding: "8px 0"
    },
    ".cm-gutters": {
      backgroundColor: "#f8fafc",
      color: "#94a3b8",
      borderRight: "1px solid #edf1f5",
      paddingRight: "3px"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(39, 117, 182, 0.08)",
      color: "#2775b6"
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(39, 117, 182, 0.055)"
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

  let debounceTimer = null;
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        isUpdatingFromCodeMirror = true;
        const text = update.state.doc.toString();
        handleCssTextChange(text);
        isUpdatingFromCodeMirror = false;
      }, 80);
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

// ── CSS Source Mode Anchors Navigation ──
const activeCssAnchor = ref('');

const cssAnchors = [
  { key: 'root', label: '#easymd', sub: '全局正文', regex: /(?:^|\n)\s*#(?:easymd|nice)\s*\{/i, template: '#easymd {\n  font-size: 16px;\n  color: #3f3f3f;\n}' },
  { key: 'h1', label: 'H1', sub: '一级标题', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?h1\b/i, template: 'h1 {\n  font-size: 24px;\n  font-weight: bold;\n  color: #2775b6;\n}' },
  { key: 'h2', label: 'H2', sub: '二级标题', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?h2\b/i, template: 'h2 {\n  font-size: 20px;\n  font-weight: bold;\n  color: #2775b6;\n}' },
  { key: 'h3', label: 'H3', sub: '三级标题', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?h3\b/i, template: 'h3 {\n  font-size: 17px;\n  font-weight: bold;\n  color: #2775b6;\n}' },
  { key: 'h4', label: 'H4', sub: '四级标题', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?h4\b/i, template: 'h4 {\n  font-size: 15px;\n  font-weight: bold;\n  color: #2b2b2b;\n}' },
  { key: 'p', label: 'P', sub: '正文段落', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?p\b/i, template: 'p {\n  font-size: 15px;\n  line-height: 1.8;\n  color: #3f3f3f;\n}' },
  { key: 'blockquote', label: 'Quote', sub: '引用块', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?blockquote\b/i, template: 'blockquote {\n  border-left: 4px solid #2775b6;\n  background-color: #f8f9fa;\n  padding: 10px 14px;\n}' },
  { key: 'code', label: 'Code', sub: '代码块', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?(?:pre|code)\b/i, template: 'pre {\n  background-color: #282c34;\n  color: #abb2bf;\n  border-radius: 8px;\n}' },
  { key: 'inlineCode', label: '`Code`', sub: '行内代码', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?code\s*\{/i, template: 'code {\n  background-color: rgba(27, 31, 35, 0.05);\n  color: #d14;\n  padding: 2px 4px;\n}' },
  { key: 'table', label: 'Table', sub: '数据表格', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?table\b/i, template: 'table {\n  width: 100%;\n  border-collapse: collapse;\n}' },
  { key: 'img', label: 'Img', sub: '文章配图', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?img\b/i, template: 'img {\n  border-radius: 8px;\n  max-width: 100%;\n}' },
  { key: 'list', label: 'List', sub: '有序无序', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?(?:ul|ol|li)\b/i, template: 'ul, ol {\n  padding-left: 20px;\n}' },
  { key: 'hr', label: 'HR', sub: '分割线', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?hr\b/i, template: 'hr {\n  border: none;\n  border-top: 1px solid #e1e4e8;\n  margin: 24px 0;\n}' },
  { key: 'strong', label: 'Bold', sub: '文本加粗', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?strong\b/i, template: 'strong {\n  font-weight: bold;\n  color: #2775b6;\n}' },
  { key: 'mark', label: 'Mark', sub: '高亮标记', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?mark\b/i, template: 'mark {\n  background-color: #fff566;\n  color: #000;\n}' },
  { key: 'a', label: 'Link', sub: '超链接', regex: /(?:^|\n|,)\s*(?:#(?:easymd|nice)\s+|xiaofu\s+|\.markdown-body\s+)?a\b/i, template: 'a {\n  color: #2775b6;\n  text-decoration: none;\n}' }
];

function scrollToCssAnchor(anchor) {
  activeCssAnchor.value = anchor.key;
  if (!cmView) return;

  const docText = cmView.state.doc.toString();
  const match = docText.match(anchor.regex);

  if (match && typeof match.index === 'number') {
    const leadingOffset = Math.max(0, match[0].search(/\S/));
    const from = match.index + leadingOffset;
    const line = cmView.state.doc.lineAt(from);
    
    // Move the caret to the matching line without selecting the selector text.
    cmView.dispatch({
      selection: { anchor: from },
      effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      scrollIntoView: true
    });
    cmView.focus();
  } else {
    // If not found, append starter rule and focus
    const textToInsert = `\n\n${anchor.template}\n`;
    const docLength = cmView.state.doc.length;
    cmView.dispatch({
      changes: { from: docLength, to: docLength, insert: textToInsert },
      selection: { anchor: docLength + textToInsert.length - 2 },
      effects: EditorView.scrollIntoView(docLength, { y: 'center' }),
      scrollIntoView: true
    });
    cmView.focus();
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
  const targetKey = (key === 'pre' || key === 'code') ? 'code' : ((key === 'th' || key === 'td' || key === 'thead' || key === 'tbody' || key === 'tr' || key === 'tables') ? 'table' : key);
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
      <div class="customizer-header-right">
        <button
          class="header-reset-btn"
          @click="handleResetToThemeDefault"
          :title="isCustomTheme ? '恢复为上次保存时的样式状态' : '清空自定义覆盖，恢复为当前预设主题初始样式'"
        >
          <RotateCcw size="12" />
          <span>{{ isCustomTheme ? '恢复未保存' : '恢复默认' }}</span>
          <span v-if="resetToastVisible" class="reset-toast-tip">{{ resetToastMsg }}</span>
        </button>
        <button class="close-btn" @click="close">
          <X size="15" />
        </button>
      </div>
    </div>

    <!-- Mode Switcher Tabs -->
    <div class="customizer-mode-bar" role="tablist" aria-label="主题编辑模式">
      <button
        role="tab"
        class="mode-tab-btn"
        :class="{ 'is-active': activeTab === 'form' }"
        :aria-selected="activeTab === 'form'"
        @click="activeTab = 'form'"
      >
        <Sliders size="13" />
        <span>可视化配置</span>
      </button>
      <button
        role="tab"
        class="mode-tab-btn"
        :class="{ 'is-active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
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
          <span class="section-icon section-icon-component"><FileText size="13" /></span>
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
        v-for="el in visibleElements"
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
              <span class="active-dot"></span>
              <span class="banner-tag">已应用素材:</span>
              <span class="banner-name">{{ getMaterialTemplateName(getStyle(el.key).materialTemplateId) }}</span>
            </div>
            <button
              class="clear-material-btn"
              @click="clearMaterial(el.key)"
              title="清除素材，恢复默认 CSS 样式"
            >
              <X size="11" />
              <span>清除</span>
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
          <div v-if="hasTableTitleOption(getStyle(el.key).materialTemplateId)" class="material-prefix-row">
            <span class="prefix-label">表头文案:</span>
            <input
              type="text"
              :value="getStyle(el.key).materialTitle !== undefined ? getStyle(el.key).materialTitle : getDefaultTableTitle(getStyle(el.key).materialTemplateId)"
              @input="updateStyle(el.key, 'materialTitle', $event.target.value)"
              :placeholder="getDefaultTableTitle(getStyle(el.key).materialTemplateId)"
              class="prefix-input-field"
            />
          </div>
        </div>
        <!-- Dedicated Body Customizer Section (整体背景 / 容器内边距 / 字体) -->
        <div v-if="el.key === 'body'" class="body-customizer-panel">
          <!-- 1. Background Color -->
          <div class="body-setting-card is-row">
            <span class="body-setting-title">背景底色</span>
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
                class="value-input"
              />
            </div>
          </div>

          <!-- 2. Inner Padding & Font Family in 1 Row -->
          <div class="body-row-two-col">
            <div class="body-setting-card is-row">
              <span class="body-setting-title">内边距</span>
              <input
                type="text"
                :value="getStyle('body').padding || '5px'"
                @input="updateStyle('body', 'padding', $event.target.value)"
                placeholder="5px"
                class="value-input"
              />
            </div>

            <div class="body-setting-card is-row">
              <span class="body-setting-title">字体</span>
              <select
                :value="getStyle('body').fontFamily || '-apple-system, BlinkMacSystemFont, \'PingFang SC\', \'Hiragino Sans GB\', \'Microsoft YaHei\', sans-serif'"
                @change="updateStyle('body', 'fontFamily', $event.target.value)"
                class="style-select"
              >
                <option value="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif">山海经典</option>
                <option value="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">现代黑体</option>
                <option value="'PingFang SC', 'Microsoft YaHei', sans-serif">微软雅黑</option>
                <option value="'Songti SC', 'SimSun', STSong, serif">典雅宋体</option>
                <option value="'Kaiti SC', 'KaiTi', STKaiti, serif">温润楷体</option>
                <option value="Georgia, 'Times New Roman', serif">优雅衬线</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Dedicated Paragraph Customizer (正文段落) -->
        <div v-else-if="el.key === 'p'" class="body-customizer-panel">
          <!-- 1. Paragraph Colors & Alignment -->
          <div class="body-row-two-col">
            <div class="body-setting-card is-row">
              <span class="body-setting-title">正文字色</span>
              <div class="color-row">
                <input
                  type="color"
                  :value="getStyle('p').color || getStyle('body').color || '#2b2b2b'"
                  @input="updateStyle('p', 'color', $event.target.value)"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="getStyle('p').color || getStyle('body').color || '#2b2b2b'"
                  @input="updateStyle('p', 'color', $event.target.value)"
                  class="value-input"
                />
              </div>
            </div>

            <div class="body-setting-card is-row">
              <span class="body-setting-title">文本对齐</span>
              <select
                :value="getStyle('p').textAlign || 'left'"
                @change="updateStyle('p', 'textAlign', $event.target.value)"
                class="style-select"
                style="width: 6.5rem;"
              >
                <option value="left">左对齐</option>
                <option value="justify">两端对齐</option>
                <option value="center">居中对齐</option>
              </select>
            </div>
          </div>

          <!-- 2. Typography Hierarchy (字号、行高、字间距、首行缩进 - 紧凑行内输入框) -->
          <div class="body-row-two-col">
            <div class="body-setting-card is-row">
              <span class="body-setting-title">正文字号</span>
              <input
                type="text"
                :value="getStyle('p').fontSize || '16px'"
                @input="updateStyle('p', 'fontSize', $event.target.value)"
                placeholder="16px"
                class="value-input"
              />
            </div>

            <div class="body-setting-card is-row">
              <span class="body-setting-title">行高倍数</span>
              <input
                type="text"
                :value="getStyle('p').lineHeight || '1.8'"
                @input="updateStyle('p', 'lineHeight', $event.target.value)"
                placeholder="1.8"
                class="value-input"
              />
            </div>

            <div class="body-setting-card is-row">
              <span class="body-setting-title">字间距</span>
              <input
                type="text"
                :value="getStyle('p').letterSpacing || '0.05em'"
                @input="updateStyle('p', 'letterSpacing', $event.target.value)"
                placeholder="0.05em"
                class="value-input"
              />
            </div>

            <div class="body-setting-card is-row">
              <span class="body-setting-title">首行缩进</span>
              <input
                type="text"
                :value="getStyle('p').textIndent || '0'"
                @input="updateStyle('p', 'textIndent', $event.target.value)"
                placeholder="0"
                class="value-input"
              />
            </div>
          </div>
        </div>

        <div
          v-else
          class="style-controls"
          :class="{
            'table-style-controls': el.key === 'table',
            'heading-style-controls': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(el.key)
          }"
        >
          <!-- 1. Dedicated Code Block Customizer (只支持代码主题、Mac风格、字号、行高、字间距、字体族、行内代码配色) -->
          <template v-if="el.key === 'code' || el.key === 'pre'">
            <!-- Code Theme Selector -->
            <label class="style-field">
                <span class="field-label">高亮主题</span>
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
            <label class="style-field style-field-wide">
              <span class="field-label">Mac 顶栏</span>
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
                  <span>{{ (localStyles.code?.macStyle !== false) ? '启用' : '关闭' }}</span>
                </button>
              </div>
            </label>

            <!-- Language Badge Toggle -->
            <label class="style-field style-field-wide">
              <span class="field-label">语言标签</span>
              <div class="mac-style-toggle-row">
                <button
                  type="button"
                  class="mac-toggle-btn"
                  :class="{ 'is-active': localStyles.code?.showLang === true }"
                  @click="updateStyle('code', 'showLang', !(localStyles.code?.showLang === true))"
                >
                  <span style="font-size: 11px; font-weight: 700; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 3px; margin-right: 8px;">JS</span>
                  <span>{{ (localStyles.code?.showLang === true) ? '显示语言标签' : '隐藏语言标签' }}</span>
                </button>
              </div>
            </label>

            <!-- Code Font Size -->
            <label class="style-field">
              <span class="field-label">字号</span>
              <input
                type="text"
                :value="getStyle('code').fontSize || '13px'"
                @input="updateStyle('code', 'fontSize', $event.target.value)"
                class="value-input"
                placeholder="13px"
              />
            </label>

            <!-- Code Line Height -->
            <label class="style-field">
              <span class="field-label">行高</span>
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
              <span class="field-label">字距</span>
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
              <span class="field-label">字体</span>
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
              <span class="field-label">行内字色</span>
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
              <span class="field-label">行内底色</span>
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

          <!-- 2. Dedicated Unified Table Customizer (合并表格 table / th / td 统一设置) -->
          <template v-else-if="el.key === 'table'">
            <div class="table-customizer-grid">
              <!-- Subsection 1: 表头样式 (th) -->
              <div class="table-sub-group">
                <span class="table-sub-title">表头样式 ( th )</span>
                <div class="table-sub-fields">
                  <label class="style-field">
                    <span class="field-label">表头背景</span>
                    <div class="color-row">
                      <input
                        type="color"
                        :value="getStyle('th').backgroundColor || getStyle('table').headerBg || '#f8fafc'"
                        @input="e => { updateStyle('th', 'backgroundColor', e.target.value); updateStyle('table', 'headerBg', e.target.value); }"
                        class="color-picker"
                      />
                      <input
                        type="text"
                        :value="getStyle('th').backgroundColor || getStyle('table').headerBg || '#f8fafc'"
                        @input="e => { updateStyle('th', 'backgroundColor', e.target.value); updateStyle('table', 'headerBg', e.target.value); }"
                        class="value-input"
                      />
                    </div>
                  </label>

                  <label class="style-field">
                    <span class="field-label">表头文字</span>
                    <div class="color-row">
                      <input
                        type="color"
                        :value="getStyle('th').color || '#18181b'"
                        @input="updateStyle('th', 'color', $event.target.value)"
                        class="color-picker"
                      />
                      <input
                        type="text"
                        :value="getStyle('th').color || '#18181b'"
                        @input="updateStyle('th', 'color', $event.target.value)"
                        class="value-input"
                      />
                    </div>
                  </label>

                  <label class="style-field">
                    <span class="field-label">表头字重</span>
                    <input
                      type="text"
                      :value="getStyle('th').fontWeight || '700'"
                      @input="updateStyle('th', 'fontWeight', $event.target.value)"
                      class="value-input"
                      placeholder="700 / bold"
                    />
                  </label>
                </div>
              </div>

              <!-- Subsection 2: 内容单元格 (td) 与边框 -->
              <div class="table-sub-group">
                <span class="table-sub-title">内容单元格与边框 ( td / table )</span>
                <div class="table-sub-fields">
                  <label class="style-field">
                    <span class="field-label">单元格文字</span>
                    <div class="color-row">
                      <input
                        type="color"
                        :value="getStyle('td').color || '#27272a'"
                        @input="updateStyle('td', 'color', $event.target.value)"
                        class="color-picker"
                      />
                      <input
                        type="text"
                        :value="getStyle('td').color || '#27272a'"
                        @input="updateStyle('td', 'color', $event.target.value)"
                        class="value-input"
                      />
                    </div>
                  </label>

                  <label class="style-field">
                    <span class="field-label">网格边框色</span>
                    <div class="color-row">
                      <input
                        type="color"
                        :value="getStyle('td').borderColor || getStyle('table').borderColor || '#e4e4e7'"
                        @input="e => { updateStyle('td', 'borderColor', e.target.value); updateStyle('table', 'borderColor', e.target.value); }"
                        class="color-picker"
                      />
                      <input
                        type="text"
                        :value="getStyle('td').borderColor || getStyle('table').borderColor || '#e4e4e7'"
                        @input="e => { updateStyle('td', 'borderColor', e.target.value); updateStyle('table', 'borderColor', e.target.value); }"
                        class="value-input"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </template>

          <!-- 3. Standard Element Controls (For other elements including u, strong, blockquote, etc.) -->
          <template v-else>
            <!-- Color (文字色) -->
            <label class="style-field" v-if="getStyle(el.key).color !== undefined || /^h[1-6]$/.test(el.key)">
              <span class="field-label">文字色</span>
              <div class="color-row">
                <input
                  type="color"
                  :value="getStyle(el.key).color || '#2775b6'"
                  @input="updateStyle(el.key, 'color', $event.target.value)"
                  class="color-picker"
                />
                <input
                  type="text"
                  :value="getStyle(el.key).color || '#2775b6'"
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
            <label class="style-field" v-if="getStyle(el.key).fontSize !== undefined || /^h[1-6]$/.test(el.key)">
              <span class="field-label">字号</span>
              <input
                type="text"
                :value="getStyle(el.key).fontSize || (el.key === 'h1' ? '22px' : el.key === 'h2' ? '18px' : el.key === 'h3' ? '16px' : el.key === 'h4' ? '15px' : '14px')"
                @input="updateStyle(el.key, 'fontSize', $event.target.value)"
                class="value-input"
                :placeholder="el.key === 'h1' ? '22px' : el.key === 'h2' ? '18px' : el.key === 'h3' ? '16px' : el.key === 'h4' ? '15px' : '14px'"
              />
            </label>

            <!-- Font weight -->
            <label class="style-field" v-if="getStyle(el.key).fontWeight !== undefined || /^h[1-6]$/.test(el.key)">
              <span class="field-label">字重</span>
              <input
                type="text"
                :value="getStyle(el.key).fontWeight || '700'"
                @input="updateStyle(el.key, 'fontWeight', $event.target.value)"
                class="value-input"
                placeholder="700 / bold"
              />
            </label>

            <!-- Line height -->
            <label class="style-field" v-if="getStyle(el.key).lineHeight !== undefined || /^h[1-6]$/.test(el.key)">
              <span class="field-label">行高</span>
              <select
                :value="getStyle(el.key).lineHeight || '1.6'"
                @change="updateStyle(el.key, 'lineHeight', $event.target.value)"
                class="style-select"
              >
                <option value="1.4">1.4</option>
                <option value="1.6">1.6</option>
                <option value="1.8">1.8</option>
                <option value="2.0">2.0</option>
              </select>
            </label>

            <!-- Text alignment (for headings or elements with textAlign) -->
            <label class="style-field" v-if="getStyle(el.key).textAlign !== undefined || /^h[1-6]$/.test(el.key)">
              <span class="field-label">对齐方式</span>
              <select
                :value="getStyle(el.key).textAlign || 'left'"
                @change="updateStyle(el.key, 'textAlign', $event.target.value)"
                class="style-select"
              >
                <option value="left">左对齐</option>
                <option value="center">居中对齐</option>
                <option value="right">右对齐</option>
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
      <div class="css-source-body">
        <div class="codemirror-editor-wrapper" ref="codemirrorContainerRef"></div>

        <!-- Right Side Quick Anchor Navigation Rail -->
        <aside class="css-anchors-rail">
          <div class="anchors-rail-header">快速锚点</div>
          <button class="rail-insert-material-btn" @click="openMaterialModal(activeCssAnchor || 'h1')" title="打开素材模版库快速选用">
            <Sparkles size="11" />
            <span>素材库</span>
          </button>
          <div class="anchors-list">
            <button
              v-for="anchor in cssAnchors"
              :key="anchor.key"
              class="anchor-item-btn"
              :class="{ active: activeCssAnchor === anchor.key }"
              :title="`${anchor.label} (${anchor.sub})`"
              @click="scrollToCssAnchor(anchor)"
            >
              <span class="anchor-label">{{ anchor.label }}</span>
              <span class="anchor-sub">{{ anchor.sub }}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>

    <!-- Footer -->
    <div class="customizer-footer">
      <button
        class="reset-all-btn"
        @click="resetAll"
        :title="isCustomTheme ? '恢复为上次保存时的样式状态' : '还原为当前预设主题默认纯净设置'"
      >
        <RotateCcw size="13" />
        <span>{{ isCustomTheme ? '恢复未保存' : '恢复默认' }}</span>
      </button>

      <!-- If built-in system theme: ONLY allow "另存为主题" -->
      <button
        v-if="!isCustomTheme"
        class="save-theme-btn"
        @click="handleSaveThemeAs"
        title="将当前自定义样式另存为新的主题预设"
      >
        <Palette size="13" />
        <span>另存为主题</span>
      </button>

      <!-- If user's custom theme: ONLY allow "保存主题" -->
      <button
        v-else
        class="save-styles-btn is-save-theme"
        @click="handleSaveCustomTheme"
        title="保存改动到当前自定义主题"
      >
        <Save size="13" />
        <span>保存主题</span>
        <span v-if="saveToastVisible" class="save-toast-tip">已保存</span>
      </button>
    </div>
  </aside>

  <!-- Material Template Picker Modal (Unified with Material Center) -->
  <MaterialPopup
    :visible="materialModalOpen"
    :element-key="currentModalKey"
    :current-material-id="currentModalKey === 'header_widget' ? (localStyles?.globalWidgets?.headerWidgetId || 'none') : (currentModalKey === 'footer_widget' ? (localStyles?.globalWidgets?.footerWidgetId || 'none') : (currentModalKey === 'body' ? (localStyles?.body?.materialTemplateId || localStyles?.body?.backgroundTexture || 'none') : (localStyles?.[currentModalKey]?.materialTemplateId || 'none')))"
    @select="({ templateId }) => selectMaterialTemplate(templateId)"
    @close="materialModalOpen = false"
  />
</template>

<style scoped src="./ThemeCustomizer.css"></style>
