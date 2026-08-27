<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Palette, X, Save, Sliders, Code2, RotateCcw, Check, Sparkles, Hash, FileType } from 'lucide-vue-next';
import { getThemeDefaultStyles, getThemeSavedStyles, isBuiltInTheme } from '../utils/themePresets';
import { allMaterialTemplatesMap, getMaterialTemplatesForKey, backgroundTemplates } from '../utils/materialLibrary';
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
  return ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'ul', 'ol', 'li', 'table', 'tables', 'header_widget', 'footer_widget'].includes(key);
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
  return ['h-135-part01-leaf', 'h-135-part02-peach', 'h-135-part03-purple', 'h-135-morandi-block', 'h-pill-duotone', 'h-yellow-shadow-cube'].includes(id);
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

const knownProps = ['color', 'backgroundColor', 'borderLeftColor', 'borderColor', 'textColor', 'headerBg', 'fontSize', 'fontWeight', 'lineHeight', 'margin', 'borderRadius', 'maxWidth', 'boxShadow', 'border', 'display', 'materialTemplateId', 'materialPrefix', 'codeThemeId', 'macStyle', 'showLang', 'letterSpacing', 'fontFamily', 'padding', 'backgroundTexture'];

function clearMaterial(key) {
  updateStyle(key, 'materialTemplateId', 'none');
  if (key === 'body') {
    updateStyle('body', 'backgroundTexture', 'clean');
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
      color: cleanColor(S.body.color, '#2b2b2b'),
      backgroundColor: S.body.backgroundColor,
      padding: S.body.padding || '5px',
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
      lineHeight: S.p.lineHeight
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
  if (S.table) css += addRule('table', { borderColor: S.table.borderColor, width: '100%' });
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
    const from = match.index;
    const line = cmView.state.doc.lineAt(from);
    
    // Position cursor at target line and scroll into view
    cmView.dispatch({
      selection: { anchor: from, head: from + match[0].length },
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
        <button class="close-btn" @click="close" title="关闭">
          <X size="15" />
        </button>
      </div>
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
              <Sparkles size="12" class="btn-sparkle-icon" />
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
                :value="getStyle('body').fontFamily || '-apple-system, BlinkMacSystemFont, \'PingFang SC\', \'Hiragino Sans GB\', \'Microsoft YaHei\', sans-serif'"
                @change="updateStyle('body', 'fontFamily', $event.target.value)"
                class="style-select full-width"
              >
                <option value="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif">山海 · 经典字体 (系统推荐)</option>
                <option value="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">现代黑体 (Inter)</option>
                <option value="'PingFang SC', 'Microsoft YaHei', sans-serif">微软雅黑 / 苹方</option>
                <option value="'Songti SC', 'SimSun', STSong, serif">典雅宋体 (Songti)</option>
                <option value="'Kaiti SC', 'KaiTi', STKaiti, serif">温润楷体 (KaiTi)</option>
                <option value="Georgia, 'Times New Roman', serif">优雅衬线 (Georgia)</option>
              </select>
            </div>

            <div class="body-setting-card">
              <span class="body-setting-title">文章内边距</span>
              <select
                :value="['0px', '5px', '8px', '10px', '12px', '16px', '20px', '24px'].includes(getStyle('body').padding || '5px') ? (getStyle('body').padding || '5px') : 'custom'"
                @change="(e) => { if (e.target.value !== 'custom') updateStyle('body', 'padding', e.target.value); }"
                class="style-select full-width"
              >
                <option value="0px">0px (贴边紧凑)</option>
                <option value="5px">5px (默认推荐)</option>
                <option value="8px">8px (微展边距)</option>
                <option value="10px">10px (适中标准)</option>
                <option value="12px">12px (舒适留白)</option>
                <option value="16px">16px (宽松透气)</option>
                <option value="20px">20px (开阔空间)</option>
                <option value="24px">24px (大刊留白)</option>
                <option value="custom">自定义输入...</option>
              </select>
              <input
                v-if="!['0px', '5px', '8px', '10px', '12px', '16px', '20px', '24px'].includes(getStyle('body').padding || '5px')"
                type="text"
                :value="getStyle('body').padding || '5px'"
                @input="updateStyle('body', 'padding', $event.target.value)"
                placeholder="如 5px / 10px 15px"
                class="value-input full-width"
                style="margin-top: 6px;"
              />
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
  padding: 0.75rem 0.875rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-sidebar);
  transition: background 0.3s ease, border-color 0.3s ease;
}

.customizer-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-main);
}

.icon-palette {
  color: var(--accent-color);
}

.customizer-header-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.header-reset-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card, #ffffff);
  color: var(--text-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.header-reset-btn:hover {
  background: var(--border-color);
  color: var(--text-main);
  border-color: var(--text-muted);
}

.reset-toast-tip {
  position: absolute;
  top: -1.75rem;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  animation: toastFade 0.2s ease;
}

@keyframes toastFade {
  from { opacity: 0; transform: translate(-50%, 4px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
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
  padding: 0.375rem 0.75rem;
  gap: 0.375rem;
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
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.75rem;
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
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.customizer-body::-webkit-scrollbar {
  width: 0.25rem;
}

.customizer-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 0.125rem;
}

.style-section {
  padding: 0.75rem 0.875rem;
  background: var(--bg-editor, #ffffff);
  border: 1px solid var(--border-color, #EDEDED);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
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
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-main, #18181B);
  margin-bottom: 0.625rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #EDEDED);
}

.section-icon {
  font-size: 0.6875rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  background: #F4F4F5;
  color: #18181B;
  text-align: center;
  min-width: 1.25rem;
}

.header-action-group {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reset-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #71717A);
  font-size: 0.6875rem;
  cursor: pointer;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: #F4F4F5;
  color: #18181B;
}

.style-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
}

.style-field {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.75rem;
  flex: 0 0 auto;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.color-picker {
  width: 1.375rem;
  height: 1.375rem;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 0.3125rem;
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
  width: 4.5rem;
  flex: none;
  border: 1px solid var(--border-color);
  border-radius: 0.3125rem;
  padding: 0.125rem 0.375rem;
  height: 1.5rem;
  font-size: 0.6875rem;
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
  width: 6.5rem;
  flex: none;
  border: 1px solid var(--border-color);
  border-radius: 0.3125rem;
  padding: 0.125rem 0.375rem;
  height: 1.5rem;
  font-size: 0.6875rem;
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
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.625rem;
  background: var(--bg-preview);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 0.6875rem;
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
  gap: 0.25rem;
}

.mac-dot {
  width: 0.4375rem;
  height: 0.4375rem;
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
  background: var(--bg-editor, #ffffff);
}

.css-source-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
}

.codemirror-editor-wrapper {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.codemirror-editor-wrapper :deep(.cm-editor) {
  height: 100%;
}

.css-anchors-rail {
  width: 74px;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-sidebar, #f7f8fa);
  border-left: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  z-index: 2;
}

.anchors-rail-header {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted, #8c8c8c);
  letter-spacing: 0.04em;
  padding: 8px 4px 6px;
  text-align: center;
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
  background: rgba(0, 0, 0, 0.02);
}

.rail-insert-material-btn {
  margin: 6px 5px 4px;
  padding: 4px 6px;
  border-radius: 5px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  color: #92400e;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.15);
  transition: all 0.15s ease;
}

.rail-insert-material-btn:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.25);
}

.anchors-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.anchors-list::-webkit-scrollbar {
  width: 3px;
}

.anchors-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}

.anchor-item-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  line-height: 1.15;
}

.anchor-item-btn:hover {
  background: rgba(39, 117, 182, 0.08);
  border-color: rgba(39, 117, 182, 0.2);
}

.anchor-item-btn.active {
  background: var(--accent-color, #2775b6);
  border-color: var(--accent-color, #2775b6);
}

.anchor-label {
  font-size: 11px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--text-main, #262626);
}

.anchor-item-btn.active .anchor-label {
  color: #ffffff;
}

.anchor-sub {
  font-size: 9px;
  color: var(--text-muted, #8c8c8c);
  margin-top: 1px;
  transform: scale(0.9);
  white-space: nowrap;
}

.anchor-item-btn.active .anchor-sub {
  color: rgba(255, 255, 255, 0.85);
}

.codemirror-editor-wrapper :deep(.cm-editor) {
  height: 100%;
}

/* Footer */
.customizer-footer {
  padding: 0.625rem 0.75rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-app);
  flex-shrink: 0;
}

.reset-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-editor);
  color: var(--text-muted);
  font-size: 0.75rem;
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
  gap: 0.3125rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--accent-color);
  border-radius: 0.375rem;
  background: var(--accent-color);
  color: #ffffff;
  font-size: 0.75rem;
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
  top: -1.75rem;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
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
  gap: 0.3125rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-editor);
  color: var(--text-main);
  font-size: 0.75rem;
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

.heading-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 3000;
}

.heading-modal-content {
  width: 100%;
  max-width: 51.25rem;
  max-height: 85vh;
  background: var(--glass-bg, rgba(255, 255, 255, 0.9));
  backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  -webkit-backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  border: 1.5px solid var(--glass-border, rgba(255, 255, 255, 0.85));
  border-radius: 1.5rem;
  box-shadow: 
    0 1.5rem 4rem rgba(0, 0, 0, 0.15),
    0 0.125rem 0.5rem rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
}

.heading-modal-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.25);
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--wandor-text, #1a1a1a);
  font-family: var(--font-sans);
}

.modal-close-icon {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: var(--wandor-muted, #767676);
  cursor: pointer;
  padding: 0.3125rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.modal-close-icon:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--wandor-text, #1a1a1a);
  transform: scale(1.06);
}

.replace-material-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  background: linear-gradient(135deg, #fb7fa6 0%, #ff784e 100%);
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
  box-shadow: 0 2px 6px rgba(251, 127, 166, 0.28);
}

.replace-material-btn:hover {
  opacity: 0.92;
  transform: translateY(-0.5px);
  box-shadow: 0 4px 10px rgba(255, 120, 78, 0.38);
  color: #ffffff;
}

.replace-material-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(251, 127, 166, 0.3);
}

.replace-material-btn .btn-sparkle-icon {
  color: #ffffff;
}

.active-material-banner {
  margin: 6px 0 10px;
  padding: 6px 10px;
  background: #FAFAFA;
  border: 1px solid #EDEDED;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.dark) .active-material-banner,
.active-material-banner:where(.dark *) {
  background: #252526;
  border-color: #333333;
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
  gap: 6px;
  font-size: 11.5px;
  min-width: 0;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
  flex-shrink: 0;
}

.banner-tag {
  color: #71717A;
  font-weight: 500;
  font-size: 11px;
  white-space: nowrap;
}

.banner-name {
  color: #18181B;
  font-weight: 600;
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.dark) .banner-name,
.banner-name:where(.dark *) {
  color: #EDEDED;
}

.clear-material-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  background: #FFFFFF;
  border: 1px solid #EDEDED;
  border-radius: 3px;
  color: #71717A;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.clear-material-btn:hover {
  background: #FEE2E2;
  border-color: #FECACA;
  color: #DC2626;
}

:deep(.dark) .clear-material-btn,
.clear-material-btn:where(.dark *) {
  background: #1e1e1e;
  border-color: #333333;
  color: #a1a1aa;
}

:deep(.dark) .clear-material-btn:hover,
.clear-material-btn:hover:where(.dark *) {
  background: #450a0a;
  border-color: #7f1d1d;
  color: #f87171;
}

.material-prefix-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #71717A;
  padding-top: 4px;
  border-top: 1px solid #EDEDED;
}

:deep(.dark) .material-prefix-row,
.material-prefix-row:where(.dark *) {
  border-color: #333333;
}

.prefix-label {
  font-size: 11px;
  color: #71717A;
  font-weight: 500;
}

.prefix-input-field {
  height: 22px;
  padding: 0 6px;
  border: 1px solid #EDEDED;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  background: #FFFFFF;
  color: #18181B;
  width: 80px;
  outline: none;
}

:deep(.dark) .prefix-input-field,
.prefix-input-field:where(.dark *) {
  background: #1e1e1e;
  border-color: #333333;
  color: #EDEDED;
}

.prefix-input-field:focus {
  border-color: #3d3939;
}

/* Global Widgets Card & Feature Guide Styles */
.global-widgets-card {
  background: #FAFAFA !important;
  border: 1px solid #EDEDED !important;
  border-radius: 6px !important;
}

.global-badge {
  font-size: 0.625rem;
  font-weight: 600;
  color: #3d3939;
  background: #F4F4F5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
}

.global-widget-subtext {
  font-size: 0.72rem;
  color: #71717A;
  line-height: 1.4;
  margin: 0 0 0.625rem 0;
}

.widget-row-box {
  background: #ffffff;
  border: 1px solid #EDEDED;
  border-radius: 4px;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.5rem;
}

.widget-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
}

.widget-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #18181B;
  display: flex;
  align-items: center;
  gap: 0.3125rem;
}

.widget-choose-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #3d3939;
  background: #F4F4F5;
  border: 1px solid #EDEDED;
  padding: 0.1875rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.widget-choose-btn:hover {
  background: #3d3939;
  border-color: #3d3939;
  color: #FFFFFF;
}

.active-widget-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FAFAFA;
  border: 1px solid #EDEDED;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 6px;
}

.widget-active-name {
  font-size: 11.5px;
  font-weight: 600;
  color: #18181B;
}

.clear-widget-btn {
  background: #FFFFFF;
  border: 1px solid #EDEDED;
  border-radius: 3px;
  color: #71717A;
  cursor: pointer;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10.5px;
  transition: all 0.15s ease;
}

.clear-widget-btn:hover {
  background: #FEE2E2;
  border-color: #FECACA;
  color: #DC2626;
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
  gap: 0.625rem;
  width: 100%;
  box-sizing: border-box;
}

.body-row-two-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
  width: 100%;
}

.body-setting-card {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  background: var(--bg-preview, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.5rem;
  padding: 0.5rem 0.625rem;
  box-sizing: border-box;
}

.body-setting-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-main, #334155);
}

.body-setting-sub {
  font-size: 0.65rem;
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
  gap: 0.5rem;
  background: var(--bg-preview, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.5rem;
  padding: 0.625rem;
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
  gap: 0.125rem;
}

.mini-material-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: var(--accent-bg, #eff6ff);
  color: var(--accent-color, #2563eb);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.25rem;
  font-size: 0.6875rem;
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
  gap: 0.375rem;
}

.body-texture-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 0.375rem;
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
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #ffffff;
  flex-shrink: 0;
  display: inline-block;
}

.body-texture-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-main, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.dark) .rail-insert-material-btn,
.rail-insert-material-btn:where(.dark *) {
  background: #382504;
  border-color: #b45309;
  color: #fbbf24;
}

:deep(.dark) .header-reset-btn,
.header-reset-btn:where(.dark *) {
  background: #262626;
  border-color: #404040;
  color: #a3a3a3;
}
</style>
