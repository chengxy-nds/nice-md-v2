<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import {
  Upload,
  Download,
  X,
  ChevronUp,
  ChevronDown,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Undo2,
  Redo2,
  Search,
  Image,
  HelpCircle,
  Trash2,
  Link2,
  Link2Off,
  Eye,
  EyeOff,
  FileCode,
  FileText,
  Globe,
  Palette,
  Code2
} from '@lucide/vue';
import { soundEngine } from '../utils/synthAudio';
import { showConfirm } from '../utils/confirmDialog';
import mammoth from 'mammoth/mammoth.browser.js';
import { htmlToMarkdown } from '../utils/htmlToMarkdown';
import { isStorageEnabled, uploadToOSS } from '../utils/fileStorage';
import { defaultMarkdown } from '../utils/defaultMarkdown';
import {
  EditorView,
  lineNumbers as cmLineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching
} from '@codemirror/language';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { markdown } from '@codemirror/lang-markdown';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  docTitle: {
    type: String,
    default: '未命名文档'
  },
  scrollPercentage: {
    type: Number,
    default: 0
  },
  activePane: {
    type: String,
    default: ''
  },
  syncScrollEnabled: {
    type: Boolean,
    default: true
  },
  previewVisible: {
    type: Boolean,
    default: true
  },
  currentTheme: {
    type: String,
    default: 'classic-indigo'
  },
  themePresets: {
    type: Array,
    default: () => []
  },
  currentCodeTheme: {
    type: String,
    default: 'atom-one-dark'
  },
  codeThemes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'update:currentTheme', 'update:currentCodeTheme', 'import', 'scroll', 'focusActive', 'editor-click', 'toggleSyncScroll', 'togglePreview', 'export-md', 'export-html', 'export-word', 'export-pdf', 'export-pdf-raw', 'export-png']);

const showDocThemeMenu = ref(false);
const showCodeThemeMenu = ref(false);

const activeThemeObj = computed(() =>
  (props.themePresets || []).find(t => t.id === props.currentTheme) || (props.themePresets || [])[0]
);

const activeCodeThemeObj = computed(() =>
  (props.codeThemes || []).find(ct => ct.id === props.currentCodeTheme) || (props.codeThemes || [])[0]
);

const editorText = ref(props.modelValue);
const isDragOver = ref(false);
const jiggleActive = ref(false);
const isMuted = ref(soundEngine.getMuteState());
const editorFontSize = ref(localStorage.getItem('nicemd_font_size') || '14.5px');
const showLineNumbers = ref(localStorage.getItem('nicemd_line_numbers') !== 'false');

const loadPreferences = () => {
  isMuted.value = soundEngine.getMuteState();
  editorFontSize.value = localStorage.getItem('nicemd_font_size') || '14.5px';
  showLineNumbers.value = localStorage.getItem('nicemd_line_numbers') !== 'false';
  if (cmView) {
    cmView.destroy();
    cmView = null;
    nextTick(() => {
      initCodeMirror();
    });
  }
};



const isUrlImportOpen = ref(false);
const importUrl = ref('');
const isExtracting = ref(false);
const showImportMenu = ref(false);

const toggleUrlImport = () => {
  soundEngine.playClick();
  isUrlImportOpen.value = !isUrlImportOpen.value;
};

const startUrlExtraction = async () => {
  const url = importUrl.value.trim();
  if (!url) return;

  isExtracting.value = true;
  soundEngine.playClick();

  const fetchUrlViaExtension = (targetUrl) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('插件响应超时，请确认已安装并启用 NiceMD 极简发布助手插件'));
      }, 5000);

      const handler = (event) => {
        if (event.source !== window) return;
        if (!event.data || typeof event.data !== 'object') return;
        if (event.data.type === 'NICEMD_FETCH_URL_RESPONSE') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(event.data);
        }
      };
      window.addEventListener('message', handler);
      window.postMessage({ type: 'NICEMD_FETCH_URL', url: targetUrl }, '*');
    });
  };

  try {
    const res = await fetchUrlViaExtension(url);
    if (res.success && res.html) {
      const { extractArticleFromHtml } = await import('../utils/articleExtractor');
      const extracted = extractArticleFromHtml(res.html, res.finalUrl || url);

      editorText.value = extracted.markdown;
      emit('update:modelValue', extracted.markdown);

      isUrlImportOpen.value = false;
      importUrl.value = '';

      soundEngine.playChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      alert('提取失败: ' + (res.error || '无法获取网页内容'));
    }
  } catch (err) {
    alert(err.message);
  } finally {
    isExtracting.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  if (newVal !== editorText.value) {
    editorText.value = newVal || '';
    if (cmView && !isUpdatingFromCodeMirror) {
      const currentDoc = cmView.state.doc.toString();
      if (currentDoc !== newVal) {
        cmView.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: newVal || '' }
        });
      }
    }
  }
});

// Update value and emit event
const handleInput = (e) => {
  emit('update:modelValue', editorText.value);
};

// Play audio based on key pressed
const handleKeyDown = (e) => {
  if (e.key === ' ') {
    soundEngine.playClick('space');
  } else if (e.key === 'Backspace') {
    soundEngine.playClick('backspace');
  } else if (e.key === 'Enter') {
    soundEngine.playClick('space'); // Enter is solid
  } else if (e.key.length === 1) {
    soundEngine.playClick('default');
  }
};

const toggleMute = () => {
  isMuted.value = soundEngine.toggleMute();
};

// ── format insertion ──
const showFloatBar = ref(false);
const floatBarPos = ref({ top: 0, left: 0 });
const floatBarAbove = ref(true);
const showTablePicker = ref(false);
const tableRows = ref(1);
const tableCols = ref(1);
const tablePickerPos = ref({ top: 0, left: 0 });
const tablePickerTriggerRef = ref(null);

// Close the table picker whenever the float bar hides (deselect, click away, etc.)
watch(showFloatBar, (v) => {
  if (!v) showTablePicker.value = false;
});

function toggleTablePicker() {
  showTablePicker.value = !showTablePicker.value;
  if (showTablePicker.value && tablePickerTriggerRef.value) {
    const r = tablePickerTriggerRef.value.getBoundingClientRect();
    tablePickerPos.value = {
      top: r.bottom + 8,
      left: r.left + r.width / 2
    };
  }
}

function getLineStart(text, pos) {
  const before = text.lastIndexOf('\n', pos - 1);
  return before === -1 ? 0 : before + 1;
}

function insertFormat(type) {
  soundEngine.playClick();
  if (cmView) {
    const range = cmView.state.selection.main;
    const sel = cmView.state.sliceDoc(range.from, range.to);

    const prefixLineCM = (prefix) => {
      const line = cmView.state.doc.lineAt(range.from);
      cmView.dispatch({
        changes: { from: line.from, to: line.from, insert: prefix }
      });
      cmView.focus();
    };

    if (type === 'h1') return prefixLineCM('# ');
    if (type === 'h2') return prefixLineCM('## ');
    if (type === 'h3') return prefixLineCM('### ');
    if (type === 'h4') return prefixLineCM('#### ');
    if (type === 'h5') return prefixLineCM('##### ');
    if (type === 'h6') return prefixLineCM('###### ');
    if (type === 'quote') return prefixLineCM('> ');
    if (type === 'ul') return prefixLineCM('- ');
    if (type === 'ol') return prefixLineCM('1. ');
    if (type === 'tasklist') return prefixLineCM('- [ ] ');
    if (type === 'hr') return insertBlock(null, 0, 0, '\n---\n');
    if (type === 'codeblock') return insertBlock(null, 0, 0, '\n```\n' + (sel || 'code') + '\n```\n');
    if (type === 'table') return insertBlock(null, 0, 0, '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n');

    const fmt = {
      bold: [`**${sel || '粗体文字'}**`, 2, 2],
      italic: [`*${sel || '斜体文字'}*`, 1, 1],
      strike: [`~~${sel || '删除文字'}~~`, 2, 2],
      code: ['`' + (sel || 'code') + '`', 1, 1],
      link: ['[' + (sel || '链接文字') + '](url)', 0, 0]
    };
    const f = fmt[type];
    if (f) {
      const [text, preLen, postLen] = f;
      cmView.dispatch({
        changes: { from: range.from, to: range.to, insert: text },
        selection: { anchor: sel ? range.from + text.length - postLen : range.from + preLen }
      });
      cmView.focus();
    }
    return;
  }

  const ta = textareaRef.value;
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const sel = ta.value.substring(start, end);
  const fmt = {
    bold: [`**${sel || '粗体文字'}**`, 2, 2],
    italic: [`*${sel || '斜体文字'}*`, 1, 1],
    strike: [`~~${sel || '删除文字'}~~`, 2, 2],
    code: ['`' + (sel || 'code') + '`', 1, 1],
    link: ['[' + (sel || '链接文字') + '](url)', 0, 0],
    h1: () => prefixLines(ta, '# '),
    h2: () => prefixLines(ta, '## '),
    h3: () => prefixLines(ta, '### '),
    quote: () => prefixLines(ta, '> '),
    ul: () => prefixLines(ta, '- '),
    ol: () => prefixLinesOL(ta),
    hr: () => insertBlock(ta, start, end, '\n---\n'),
    codeblock: () => insertBlock(ta, start, end, '\n```\n' + (sel || 'code') + '\n```\n'),
    table: () => insertBlock(ta, start, end, '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n'),
    tasklist: () => prefixLines(ta, '- [ ] '),
    h4: () => prefixLines(ta, '#### '),
    h5: () => prefixLines(ta, '##### '),
    h6: () => prefixLines(ta, '###### '),
  };
  const f = fmt[type];
  if (typeof f === 'function') { f(); return; }
  if (!f) return;
  const [text, preLen, postLen] = f;
  ta.setRangeText(text, start, end, 'end');
  editorText.value = ta.value;
  emit('update:modelValue', ta.value);
  ta.focus();
  if (sel) {
    ta.setSelectionRange(start + text.length - postLen - sel.length, start + text.length - postLen);
  }
}

function insertBlock(ta, start, end, text) {
  if (cmView) {
    const range = cmView.state.selection.main;
    cmView.dispatch({
      changes: { from: range.from, to: range.to, insert: text },
      selection: { anchor: range.from + text.length }
    });
    cmView.focus();
    return;
  }
  if (!ta) ta = textareaRef.value;
  if (!ta) return;
  if (start === undefined) start = ta.selectionStart;
  if (end === undefined) end = ta.selectionEnd;
  ta.setRangeText(text, start, end, 'end');
  editorText.value = ta.value;
  emit('update:modelValue', ta.value);
  ta.focus();
}

function insertTableAt(rows, cols) {
  soundEngine.playClick();
  const header = '| ' + Array.from({ length: cols }, (_, i) => `列${i + 1}`).join(' | ') + ' |';
  const sep = '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |';
  const body = Array.from({ length: rows - 1 }, () =>
    '| ' + Array.from({ length: cols }, () => '内容').join(' | ') + ' |'
  );
  const table = ['', header, sep, ...body, ''].join('\n');
  insertBlock(textareaRef.value, undefined, undefined, table);
  showFloatBar.value = false;
  showTablePicker.value = false;
}

function prefixLines(ta, prefix) {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const lineStart = getLineStart(ta.value, start);
  const before = ta.value.substring(0, lineStart);
  const selected = ta.value.substring(lineStart, end);
  const after = ta.value.substring(end);
  const prefixed = selected.split('\n').map(l => prefix + l).join('\n');
  ta.value = before + prefixed + after;
  editorText.value = ta.value;
  emit('update:modelValue', ta.value);
  ta.focus();
  ta.setSelectionRange(lineStart, lineStart + prefixed.length);
}

function prefixLinesOL(ta) {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const lineStart = getLineStart(ta.value, start);
  const before = ta.value.substring(0, lineStart);
  const selected = ta.value.substring(lineStart, end);
  const after = ta.value.substring(end);
  let i = 1;
  const prefixed = selected.split('\n').map(l => (i++) + '. ' + l).join('\n');
  ta.value = before + prefixed + after;
  editorText.value = ta.value;
  emit('update:modelValue', ta.value);
  ta.focus();
  ta.setSelectionRange(lineStart, lineStart + prefixed.length);
}

// Position the floating bar above (or below) the line containing `pos`.
function positionFloatBar(pos, clientEvent = null) {
  if (cmView) {
    const coords = cmView.coordsAtPos(pos);
    if (coords) {
      floatBarAbove.value = coords.top > 120;
      floatBarPos.value = {
        top: floatBarAbove.value ? coords.top : coords.bottom,
        left: Math.max(20, Math.min(window.innerWidth - 380, coords.left))
      };
      return;
    }
    if (clientEvent && clientEvent.clientY !== undefined) {
      floatBarAbove.value = clientEvent.clientY > 120;
      floatBarPos.value = {
        top: floatBarAbove.value ? clientEvent.clientY : clientEvent.clientY,
        left: Math.max(20, Math.min(window.innerWidth - 380, clientEvent.clientX))
      };
      return;
    }
  }

  const ta = textareaRef.value;
  if (!ta) {
    if (clientEvent && clientEvent.clientY !== undefined) {
      floatBarAbove.value = clientEvent.clientY > 120;
      floatBarPos.value = {
        top: floatBarAbove.value ? clientEvent.clientY : clientEvent.clientY,
        left: Math.max(20, Math.min(window.innerWidth - 380, clientEvent.clientX))
      };
    }
    return;
  }
  const rect = ta.getBoundingClientRect();
  const taStyle = getComputedStyle(ta);
  const lineH = parseFloat(taStyle.lineHeight) || 24;
  const padTop = parseFloat(taStyle.paddingTop) || 16;
  const textBefore = ta.value.substring(0, pos);
  const lineIdx = textBefore.split('\n').length - 1;
  const lineTop = rect.top + padTop + lineIdx * lineH - ta.scrollTop;
  const lineBottom = lineTop + lineH;
  // If not enough room above, flip the bar below the selection instead.
  floatBarAbove.value = lineTop > 120;
  floatBarPos.value = {
    top: floatBarAbove.value ? lineTop : lineBottom,
    left: Math.max(20, Math.min(window.innerWidth - 380, rect.left + 20))
  };
}

// Show floating bar on text selection
function onTextSelect(e = null) {
  if (cmView) {
    const sel = cmView.state.selection.main;
    if (sel.empty) {
      showFloatBar.value = false;
      return;
    }
    positionFloatBar(sel.from, e);
    showFloatBar.value = true;
    return;
  }

  const ta = textareaRef.value;
  if (!ta) return;
  const s = ta.selectionStart, endIdx = ta.selectionEnd;
  if (s === endIdx) { showFloatBar.value = false; return; }
  positionFloatBar(s, e);
  showFloatBar.value = true;
}

// Right-click: suppress the browser context menu and show our toolbar.
function onContextMenu(e = null) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  if (cmView) {
    const sel = cmView.state.selection.main;
    const pos = sel.from;
    positionFloatBar(pos, e);
    showFloatBar.value = true;
    return;
  }

  const ta = textareaRef.value;
  if (!ta) {
    if (e && e.clientY !== undefined) {
      positionFloatBar(0, e);
      showFloatBar.value = true;
    }
    return;
  }
  const s = ta.selectionStart;
  positionFloatBar(s, e);
  showFloatBar.value = true;
}

// ── undo / redo ──
function handleUndo() {
  soundEngine.playClick();
  document.execCommand('undo');
  textareaRef.value?.focus();
}
function handleRedo() {
  soundEngine.playClick();
  document.execCommand('redo');
  textareaRef.value?.focus();
}

// ── export dropdown ──
const showExportMenu = ref(false);

// ── find / replace ──
const showFindReplace = ref(false);
const findText = ref('');
const replaceText = ref('');
const showReplaceInput = ref(false);
const findCaseSensitive = ref(false);
const findMatchCount = ref(0);
const findCurrentIndex = ref(0);

const findMatches = computed(() => {
  if (!findText.value) return [];
  const text = cmView ? cmView.state.doc.toString() : (textareaRef.value?.value || editorText.value || '');
  const search = findText.value;
  if (!search) return [];
  const flags = findCaseSensitive.value ? 'g' : 'gi';
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let re;
  try {
    re = new RegExp(escaped, flags);
  } catch {
    return [];
  }
  const matches = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push({ start: m.index, end: m.index + search.length });
    if (matches.length > 999) break;
  }
  return matches;
});

function updateFindStats() {
  findMatchCount.value = findMatches.value.length;
  if (findMatchCount.value === 0) {
    findCurrentIndex.value = 0;
    return;
  }
  let pos = 0;
  if (cmView) {
    pos = cmView.state.selection.main.from;
  } else if (textareaRef.value) {
    pos = textareaRef.value.selectionStart || 0;
  }
  let idx = findMatches.value.findIndex(m => m.start >= pos);
  if (idx === -1) idx = 0;
  findCurrentIndex.value = idx + 1;
}

function openFindReplace() {
  soundEngine.playClick();
  showFindReplace.value = !showFindReplace.value;
  if (showFindReplace.value) {
    findText.value = '';
    replaceText.value = '';
    showReplaceInput.value = false;
    findCaseSensitive.value = false;
    nextTick(() => findInputRef.value?.focus());
  }
}

function doFind(forward = true) {
  if (!findText.value) return;
  const matches = findMatches.value;
  if (matches.length === 0) {
    findMatchCount.value = 0;
    findCurrentIndex.value = 0;
    return;
  }

  let currentPos = -1;
  if (cmView) {
    currentPos = cmView.state.selection.main.from;
  } else if (textareaRef.value) {
    currentPos = textareaRef.value.selectionStart || 0;
  }

  let idx;
  if (forward) {
    idx = matches.findIndex(m => m.start > currentPos);
    if (idx === -1) idx = 0; // wrap around
  } else {
    const reversed = [...matches].reverse();
    idx = reversed.findIndex(m => m.start < currentPos);
    if (idx === -1) idx = 0; // wrap around
    const target = reversed[idx];
    idx = matches.indexOf(target);
  }

  const m = matches[idx];
  findCurrentIndex.value = idx + 1;
  findMatchCount.value = matches.length;

  if (cmView) {
    cmView.dispatch({
      selection: { anchor: m.start, head: m.end },
      scrollIntoView: true
    });
    setTimeout(() => {
      if (!cmView) return;
      const coords = cmView.coordsAtPos(m.start);
      const scrollEl = cmView.scrollDOM || cmContainerRef.value?.querySelector('.cm-scroller');
      if (coords && scrollEl) {
        const scrollRect = scrollEl.getBoundingClientRect();
        if (coords.top < scrollRect.top || coords.bottom > scrollRect.bottom) {
          const delta = coords.top - scrollRect.top - (scrollRect.height / 3);
          scrollEl.scrollTop += delta;
        }
      }
    }, 20);
    cmView.focus();
  } else if (textareaRef.value) {
    const ta = textareaRef.value;
    ta.setSelectionRange(m.start, m.end);
    ta.focus();
    const lineIdx = ta.value.substring(0, m.start).split('\n').length - 1;
    const lineH = 24;
    const targetScroll = lineIdx * lineH - ta.clientHeight / 2;
    ta.scrollTop = Math.max(0, targetScroll);
  }
}

function doFindPrev() { doFind(false); }
function doFindNext() { doFind(true); }

function doReplace() {
  if (!findText.value) return;
  if (cmView) {
    const sel = cmView.state.selection.main;
    const currentSelectedText = cmView.state.doc.sliceString(sel.from, sel.to);
    const flags = findCaseSensitive.value ? '' : 'i';
    const escaped = findText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('^' + escaped + '$', flags).test(currentSelectedText)) {
      cmView.dispatch({
        changes: { from: sel.from, to: sel.to, insert: replaceText.value },
        selection: { anchor: sel.from, head: sel.from + replaceText.value.length },
        scrollIntoView: true
      });
      editorText.value = cmView.state.doc.toString();
      emit('update:modelValue', editorText.value);
    }
  } else if (textareaRef.value) {
    const ta = textareaRef.value;
    const start = ta.selectionStart;
    const sel = ta.value.substring(start, ta.selectionEnd);
    const flags = findCaseSensitive.value ? '' : 'i';
    const escaped = findText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('^' + escaped + '$', flags).test(sel)) {
      document.execCommand('insertText', false, replaceText.value);
      editorText.value = ta.value;
      emit('update:modelValue', ta.value);
    }
  }
  nextTick(() => {
    updateFindStats();
    doFindNext();
  });
}

function doReplaceAll() {
  if (!findText.value) return;
  const search = findText.value;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flags = findCaseSensitive.value ? 'g' : 'gi';

  if (cmView) {
    const docStr = cmView.state.doc.toString();
    const newDocStr = docStr.replace(new RegExp(escaped, flags), replaceText.value);
    cmView.dispatch({
      changes: { from: 0, to: docStr.length, insert: newDocStr }
    });
    editorText.value = newDocStr;
    emit('update:modelValue', newDocStr);
    updateFindStats();
  } else if (textareaRef.value) {
    const ta = textareaRef.value;
    const before = ta.value;
    ta.value = before.replace(new RegExp(escaped, flags), replaceText.value);
    editorText.value = ta.value;
    emit('update:modelValue', ta.value);
    updateFindStats();
  }
}

function closeFindReplace() {
  showFindReplace.value = false;
  findText.value = '';
  replaceText.value = '';
  showReplaceInput.value = false;
}

function onFindKeydown(e) {
  if (e.key === 'Escape') {
    closeFindReplace();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (e.shiftKey) doFindPrev();
    else doFindNext();
  }
}

function onFindInput() {
  updateFindStats();
  if (findText.value) {
    doFind(true);
  }
}

const findInputRef = ref(null);

// Watch findText changes to update stats
watch(findText, () => {
  if (showFindReplace.value) updateFindStats();
});
watch(findCaseSensitive, () => {
  if (showFindReplace.value) updateFindStats();
});

// ── Unified Image Insertion Engine (OSS auto-detection & Direct Upload) ──
function insertTextAtCursor(text) {
  const insertion = '\n' + text + '\n';
  if (cmView) {
    const range = cmView.state.selection.main;
    cmView.dispatch({
      changes: { from: range.from, to: range.to, insert: insertion },
      selection: { anchor: range.from + insertion.length }
    });
    cmView.focus();
  } else if (textareaRef.value) {
    const ta = textareaRef.value;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    ta.setRangeText(insertion, start, end, 'end');
    editorText.value = ta.value;
    emit('update:modelValue', ta.value);
  } else {
    editorText.value += insertion;
    emit('update:modelValue', editorText.value);
  }
}

function replaceEditorText(target, replacement) {
  if (cmView) {
    const docStr = cmView.state.doc.toString();
    const idx = docStr.indexOf(target);
    if (idx !== -1) {
      cmView.dispatch({
        changes: { from: idx, to: idx + target.length, insert: replacement }
      });
    }
  } else if (textareaRef.value) {
    const ta = textareaRef.value;
    ta.value = ta.value.replace(target, replacement);
    editorText.value = ta.value;
    emit('update:modelValue', ta.value);
  } else {
    editorText.value = editorText.value.replace(target, replacement);
    emit('update:modelValue', editorText.value);
  }
}

async function processImageInsertion(file) {
  if (!file || !file.type?.startsWith('image/')) return;
  const alt = file.name ? file.name.replace(/\.[^.]+$/, '') : 'image';

  // 1. Auto-detect if OSS cloud storage is configured
  if (isStorageEnabled()) {
    const placeholder = `![⏳ 正在上传云端图片 (${alt})...](${Date.now()})`;
    insertTextAtCursor(placeholder);

    try {
      // Direct upload to OSS
      const url = await uploadToOSS(file);
      replaceEditorText(placeholder, `![${alt}](${url})`);
      soundEngine.playChime();
    } catch (err) {
      console.error('[OSS Upload Failed]', err);
      // Fallback: convert to base64 so user's image is not lost
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        replaceEditorText(placeholder, `![${alt}](${dataUrl})`);
      };
      reader.readAsDataURL(file);
      // Notify user with clear error cause
      alert('【OSS 图床上传提示】\n图片未能成功上传到 OSS (' + err.message + ')\n已为您自动转为本地图片插入。');
    }
  } else {
    // 2. OSS is not configured -> Convert to base64 data URL
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      insertTextAtCursor(`![${alt}](${dataUrl})`);
      soundEngine.playClick();
    };
    reader.readAsDataURL(file);
  }
}

// ── Toolbar image upload button ──
function handleImageUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundEngine.playClick();
    await processImageInsertion(file);
  };
  input.click();
}

// ── Clipboard Paste Event Handler ──
async function handleEditorPaste(e) {
  const clipboardData = e.clipboardData;
  if (!clipboardData) return;

  const items = clipboardData.items;
  const files = clipboardData.files;
  let imageFile = null;

  if (files && files.length > 0) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        imageFile = file;
        break;
      }
    }
  }
  if (!imageFile && items && items.length > 0) {
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        imageFile = item.getAsFile();
        break;
      }
    }
  }

  if (imageFile) {
    e.preventDefault();
    await processImageInsertion(imageFile);
  }
}

// ── Drag & Drop Event Handler ──
async function handleEditorDrop(e) {
  const dataTransfer = e.dataTransfer;
  if (!dataTransfer) return;

  const files = dataTransfer.files;
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        await processImageInsertion(file);
        return;
      }
    }
  }
}

function scrollToTop() {
  soundEngine.playClick();
  if (cmView && cmView.scrollDOM) {
    cmView.scrollDOM.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (textareaRef.value) {
    textareaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (lineGutterRef.value) {
    lineGutterRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
  emit('focusActive', 'editor');
  emit('scroll', 0);
}

function scrollToBottom() {
  soundEngine.playClick();
  if (cmView && cmView.scrollDOM) {
    cmView.scrollDOM.scrollTo({ top: cmView.scrollDOM.scrollHeight, behavior: 'smooth' });
  }
  if (textareaRef.value) {
    textareaRef.value.scrollTo({ top: textareaRef.value.scrollHeight, behavior: 'smooth' });
  }
  if (lineGutterRef.value) {
    lineGutterRef.value.scrollTo({ top: lineGutterRef.value.scrollHeight, behavior: 'smooth' });
  }
  emit('focusActive', 'editor');
  emit('scroll', 1);
}

const clearContent = async () => {
  const ok = await showConfirm({
    title: '清空编辑器',
    message: '确定要清空当前文档的全部内容吗？',
    confirmText: '清空',
    danger: true
  });
  if (ok) {
    editorText.value = '';
    emit('update:modelValue', '');
    soundEngine.playClick('backspace');
  }
};

// Compute line numbers
const lineNumbers = computed(() => {
  const lines = editorText.value.split('\n').length;
  return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);
});

// Handle Drag & Drop
const onDragOver = (e) => {
  e.preventDefault();
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = async (e) => {
  e.preventDefault();
  isDragOver.value = false;
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    await processFile(files[0]);
  }
};

// Handle File Input Selection
const triggerFileInput = (accept = '.md,.markdown,.txt,.docx,.doc,.html,.htm') => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };
  input.click();
};

// Process File (Word, TXT, MD, HTML)
const processFile = async (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  
  // Satisfying drop animation & chime
  jiggleActive.value = true;
  soundEngine.playChime();
  setTimeout(() => {
    jiggleActive.value = false;
  }, 800);

  try {
    if (extension === 'docx' || extension === 'doc') {
      // Word .docx / .doc import using mammoth browser bundle + JSZip fallback
      const arrayBuffer = await file.arrayBuffer();
      const m = mammoth.default || mammoth;

      let markdown = '';
      
      // 1. Try convertToMarkdown
      if (typeof m?.convertToMarkdown === 'function') {
        try {
          const res = await m.convertToMarkdown({ arrayBuffer });
          if (res && res.value && res.value.trim()) {
            markdown = res.value.trim();
          }
        } catch (e) {
          console.warn('[NiceMD] mammoth convertToMarkdown error:', e);
        }
      }

      // 2. Try convertToHtml -> htmlToMarkdown
      if (!markdown && typeof m?.convertToHtml === 'function') {
        try {
          const res = await m.convertToHtml({ arrayBuffer });
          if (res && res.value && res.value.trim()) {
            markdown = htmlToMarkdown(res.value);
          }
        } catch (e) {
          console.warn('[NiceMD] mammoth convertToHtml error:', e);
        }
      }

      // 3. Try extractRawText
      if (!markdown && typeof m?.extractRawText === 'function') {
        try {
          const res = await m.extractRawText({ arrayBuffer });
          if (res && res.value && res.value.trim()) {
            markdown = res.value.trim();
          }
        } catch (e) {
          console.warn('[NiceMD] mammoth extractRawText error:', e);
        }
      }

      if (!markdown) {
        throw new Error('无法从 Word 文件解析文本内容。');
      }

      emit('import', { content: markdown, type: 'md', filename: file.name });
    } else if (extension === 'html' || extension === 'htm') {
      // HTML import -> convert to Markdown
      const text = await file.text();
      const markdown = htmlToMarkdown(text);
      emit('import', { content: markdown, type: 'md', filename: file.name });
    } else {
      // Markdown (.md, .markdown) or TXT (.txt) import
      const text = await file.text();
      emit('import', { content: text, type: 'md', filename: file.name });
    }
  } catch (err) {
    console.error('[NiceMD] Process file failed:', err);
    if (extension === 'docx' || extension === 'doc') {
      alert(`导入失败: ${err.message || '格式解析异常'}`);
    } else {
      try {
        const text = await file.text();
        emit('import', { content: text, type: 'md', filename: file.name });
      } catch (fallbackErr) {
        console.error('[NiceMD] Fallback text read failed:', fallbackErr);
      }
    }
  }
};

// Synchronized scrolling
const textareaRef = ref(null);
const lineGutterRef = ref(null);

const handleScroll = () => {
  if (textareaRef.value) {
    if (lineGutterRef.value) {
      lineGutterRef.value.scrollTop = textareaRef.value.scrollTop;
    }
    if (props.activePane === 'editor') {
      const scrollHeight = textareaRef.value.scrollHeight - textareaRef.value.clientHeight;
      if (scrollHeight > 0) {
        const percentage = textareaRef.value.scrollTop / scrollHeight;
        emit('scroll', percentage);
      }
    }
  }
};

watch(() => props.scrollPercentage, (percentage) => {
  if (props.activePane !== 'editor' && textareaRef.value) {
    const maxScroll = textareaRef.value.scrollHeight - textareaRef.value.clientHeight;
    textareaRef.value.scrollTop = percentage * maxScroll;
    if (lineGutterRef.value) {
      lineGutterRef.value.scrollTop = textareaRef.value.scrollTop;
    }
  }
});

// Initial template sample
const insertSample = () => {
  editorText.value = defaultMarkdown;
  emit('update:modelValue', defaultMarkdown);
  soundEngine.playChime();
};

// ── CodeMirror 6 Markdown Syntax Highlighting ──
const isSyntaxHighlightActive = ref(true);
const cmContainerRef = ref(null);
let cmView = null;
let isUpdatingFromCodeMirror = false;

function initCodeMirror() {
  if (!cmContainerRef.value || cmView) return;

  const customMarkdownTheme = EditorView.theme({
    "&": {
      height: "100%",
      fontSize: editorFontSize.value || "14.5px",
      fontFamily: "'JetBrains Mono', Consolas, Monaco, 'Andale Mono', monospace",
      backgroundColor: "transparent",
      color: "var(--text-main)",
      caretColor: "var(--accent-color)"
    },
    ".cm-content": {
      padding: "16px",
      lineHeight: "24px",
      caretColor: "var(--accent-color)"
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--accent-color)"
    },
    ".cm-gutters": {
      display: showLineNumbers.value ? "flex" : "none",
      backgroundColor: "transparent",
      borderRight: "1px solid var(--border-color, #EDEDED)",
      color: "var(--text-muted, #9ca3af)",
      minWidth: "40px"
    },
    ".cm-lineNumbers": {
      minWidth: "40px",
      display: "flex",
      flexDirection: "column"
    },
    ".cm-lineNumbers .cm-gutterElement": {
      padding: "0 4px",
      minWidth: "38px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      fontSize: "11px",
      fontFamily: "'JetBrains Mono', Consolas, monospace",
      color: "var(--text-muted, #9ca3af)",
      opacity: "0.55",
      boxSizing: "border-box"
    },
    ".cm-visual-line-numbers": {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%"
    },
    ".cm-visual-line-number": {
      flex: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: "24px",
      minHeight: "24px",
      textAlign: "center"
    },
    ".cm-activeLine": {
      backgroundColor: "transparent"
    },
    ".cm-line": {
      padding: "0",
      lineHeight: "24px"
    },
    /* Pure Minimal Markdown Syntax Styling inside editor */
    ".cm-header": {
      color: "var(--accent-color)",
      fontWeight: "700"
    },
    ".cm-strong": {
      fontWeight: "700",
      color: "var(--text-main)"
    },
    ".cm-emphasis": {
      fontStyle: "italic"
    },
    ".cm-strikethrough": {
      textDecoration: "line-through",
      opacity: "0.7"
    },
    ".cm-quote": {
      color: "var(--text-muted)",
      fontStyle: "italic"
    },
    ".cm-inline-code": {
      backgroundColor: "var(--accent-bg)",
      color: "var(--code-text, #ff7a59)",
      padding: "1px 5px",
      borderRadius: "4px"
    },
    ".cm-link": {
      color: "var(--accent-color)",
      textDecoration: "underline"
    },
    ".cm-url": {
      opacity: "0.6"
    },
    /* Warm Yellow-Orange Search & Selection Match Highlighting */
    ".cm-selectionMatch": {
      backgroundColor: "rgba(245, 158, 11, 0.35) !important",
      borderRadius: "2px",
      outline: "1px solid rgba(245, 158, 11, 0.6)"
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(251, 191, 36, 0.45) !important",
      borderRadius: "2px",
      outline: "1px solid rgba(245, 158, 11, 0.55)"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#f59e0b !important",
      color: "#1c1917 !important",
      fontWeight: "700",
      borderRadius: "2px",
      outline: "2px solid #d97706"
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "rgba(245, 158, 11, 0.3) !important"
    }
  });

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      isUpdatingFromCodeMirror = true;
      const text = update.state.doc.toString();
      editorText.value = text;
      emit('update:modelValue', text);
      isUpdatingFromCodeMirror = false;
    }
  });

  cmView = new EditorView({
    doc: editorText.value || '',
    extensions: [
      cmLineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      markdown(),
      EditorView.lineWrapping,
      customMarkdownTheme,
      EditorView.domEventHandlers({
        focus: () => {
          emit('focusActive', 'editor');
          emit('editor-click');
        },
        click: (e) => {
          emit('focusActive', 'editor');
          emit('editor-click');
          if (cmView && cmView.state.selection.main.empty) {
            showFloatBar.value = false;
          }
        },
        mouseup: (e) => {
          setTimeout(() => {
            onTextSelect(e);
          }, 10);
        },
        keyup: (e) => {
          onTextSelect(e);
        },
        contextmenu: (e) => {
          onContextMenu(e);
          return true;
        },
        paste: (e) => {
          handleEditorPaste(e);
        },
        drop: (e) => {
          handleEditorDrop(e);
        }
      }),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
        indentWithTab
      ]),
      updateListener
    ],
    parent: cmContainerRef.value
  });

  // Handle CodeMirror scroll for sync preview
  if (cmView && cmView.scrollDOM) {
    cmView.scrollDOM.addEventListener('scroll', () => {
      if (props.activePane === 'editor' && cmView.scrollDOM) {
        const scrollHeight = cmView.scrollDOM.scrollHeight - cmView.scrollDOM.clientHeight;
        if (scrollHeight > 0) {
          const percentage = cmView.scrollDOM.scrollTop / scrollHeight;
          emit('scroll', percentage);
        }
      }
    });
  }
}

watch(isSyntaxHighlightActive, (active) => {
  if (active) {
    nextTick(() => {
      initCodeMirror();
    });
  } else if (cmView) {
    cmView.destroy();
    cmView = null;
  }
});



function handleGlobalPointerDown(e) {
  if (!showFloatBar.value) return;
  const target = e.target;
  if (target && (target.closest('.float-format-bar') || target.closest('.table-picker'))) {
    return;
  }
  showFloatBar.value = false;
  showTablePicker.value = false;
}

onMounted(() => {
  window.addEventListener('nicemd-settings-updated', loadPreferences);
  document.addEventListener('pointerdown', handleGlobalPointerDown);
  if (!editorText.value) {
    insertSample();
  }
  if (isSyntaxHighlightActive.value) {
    nextTick(() => {
      initCodeMirror();
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('nicemd-settings-updated', loadPreferences);
  document.removeEventListener('pointerdown', handleGlobalPointerDown);
  if (cmView) {
    cmView.destroy();
    cmView = null;
  }
});

defineExpose({ handleUndo, handleRedo, openFindReplace, closeFindReplace, handleImageUpload, insertSample, toggleUrlImport, triggerFileInput, clearContent })
</script>

<template>
  <div 
    class="editor-panel" 
    :class="{ 'is-jiggle': jiggleActive }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="emit('editor-click'); emit('focusActive', 'editor')"
    @mouseenter="emit('focusActive', 'editor')"
  >
    <div class="editor-body">
      <!-- Fallback Line number gutter for standard textarea mode -->
      <div class="line-gutter" ref="lineGutterRef" v-if="!isSyntaxHighlightActive && showLineNumbers">
        <div
          v-for="num in lineNumbers"
          :key="num"
          class="line-number"
        >
          {{ num }}
        </div>
      </div>

      <div class="editor-input-area" :style="{ fontSize: editorFontSize }" @drop="handleEditorDrop" @dragover.prevent>
        <div v-show="isSyntaxHighlightActive" ref="cmContainerRef" class="codemirror-markdown-editor"></div>
        <textarea
          v-show="!isSyntaxHighlightActive"
          ref="textareaRef"
          v-model="editorText"
          @input="handleInput"
          @keydown="handleKeyDown"
          @scroll="handleScroll"
          @mouseup="onTextSelect"
          @keyup="onTextSelect"
          @contextmenu.prevent="onContextMenu"
          @paste="handleEditorPaste"
          @drop="handleEditorDrop"
          @focus="emit('editor-click'); emit('focusActive', 'editor')"
          @click="emit('editor-click'); emit('focusActive', 'editor')"
          placeholder="在这里输入 Markdown 内容，或者直接将 .md / .html 文件拖拽进这里..."
          spellcheck="false"
        ></textarea>
      </div>

      <!-- Floating format bar on text selection -->
      <div
        v-if="showFloatBar"
        class="float-format-bar"
        :class="{ 'is-below': !floatBarAbove }"
        :style="{ top: floatBarPos.top + 'px', left: floatBarPos.left + 'px' }"
        @mousedown.prevent
      >
        <button @click="insertFormat('bold'); showFloatBar = false" title="粗体"><Bold size="14" /></button>
        <button @click="insertFormat('italic'); showFloatBar = false" title="斜体"><Italic size="14" /></button>
        <button @click="insertFormat('strike'); showFloatBar = false" title="删除线"><Strikethrough size="14" /></button>
        <button @click="insertFormat('code'); showFloatBar = false" title="行内代码"><Code size="14" /></button>
        <button @click="insertFormat('link'); showFloatBar = false" title="链接"><Link size="14" /></button>
        <span class="float-sep"></span>
        <button @click="insertFormat('h1'); showFloatBar = false" title="H1">H1</button>
        <button @click="insertFormat('h2'); showFloatBar = false" title="H2">H2</button>
        <button @click="insertFormat('h3'); showFloatBar = false" title="H3">H3</button>
        <button @click="insertFormat('quote'); showFloatBar = false" title="引用">❝</button>
        <button @click="insertFormat('ul'); showFloatBar = false" title="无序列表">•≡</button>
        <button @click="insertFormat('ol'); showFloatBar = false" title="有序列表">1.</button>
        <button @click="insertFormat('tasklist'); showFloatBar = false" title="任务清单">☑</button>
        <span class="float-sep"></span>
        <button @click="insertFormat('codeblock'); showFloatBar = false" title="代码块">{ }</button>
        <button ref="tablePickerTriggerRef" @click="toggleTablePicker" title="表格">⊞</button>
        <button @click="insertFormat('hr'); showFloatBar = false" title="分隔线">—</button>
      </div>

      <!-- Table size picker (fixed-positioned so it's not clipped by the bar's overflow) -->
      <div
        v-if="showTablePicker"
        class="table-picker"
        :style="{ top: tablePickerPos.top + 'px', left: tablePickerPos.left + 'px' }"
        @mousedown.prevent
      >
        <div class="table-picker-grid">
          <div
            v-for="r in 8"
            :key="'r' + r"
            class="table-picker-row"
          >
            <div
              v-for="c in 8"
              :key="'c' + c"
              class="table-picker-cell"
              :class="{ 'is-selected': r <= tableRows && c <= tableCols }"
              @mouseenter="tableRows = r; tableCols = c"
              @click="insertTableAt(r, c)"
            ></div>
          </div>
        </div>
        <div class="table-picker-label">{{ tableRows }} 行 × {{ tableCols }} 列</div>
      </div>

      <!-- Scroll quick-jump buttons -->
      <div class="scroll-quick-btns">
        <button @click="scrollToTop" class="scroll-quick-btn" title="回到顶部"><ChevronUp size="16" /></button>
        <button @click="scrollToBottom" class="scroll-quick-btn" title="去到底部"><ChevronDown size="16" /></button>
      </div>

      <!-- Dropzone Overlay -->
      <div 
        class="drag-overlay" 
        :class="{ 'is-active': isDragOver }"
      >
        <div class="drag-message">
          <Upload size="48" class="upload-icon" />
          <h3>把文档扔到这里！</h3>
          <p>支持拖入 .md 或 .html 文件，我们将智能解析</p>
        </div>
      </div>

      <!-- URL Import Popover -->
      <div v-if="isUrlImportOpen" class="url-import-popover">
        <div class="popover-header">
          <h4>从 URL 提取文章</h4>
          <button @click="isUrlImportOpen = false" class="btn-close-popover">
            <X size="14" />
          </button>
        </div>
        <div class="popover-body">
          <input 
            v-model="importUrl" 
            type="text" 
            placeholder="粘贴微信、掘金、CSDN、知乎等文章链接..."
            @keyup.enter="startUrlExtraction"
            :disabled="isExtracting"
          />
          <button 
            @click="startUrlExtraction" 
            class="btn-submit-url"
            :disabled="isExtracting || !importUrl.trim()"
          >
            <span v-if="isExtracting">正在提取...</span>
            <span v-else>立即提取</span>
          </button>
        </div>
      </div>
      <!-- Inline Find Bar -->
      <div v-if="showFindReplace" class="find-bar">
        <div class="find-bar-row">
          <div class="find-input-wrap">
            <Search size="13" class="find-input-icon" />
            <input
              ref="findInputRef"
              v-model="findText"
              type="text"
              placeholder="查找..."
              class="find-input"
              @keydown="onFindKeydown"
              @input="onFindInput"
            />
            <span v-if="findText" class="find-count">{{ findCurrentIndex }}/{{ findMatchCount }}</span>
          </div>
          <button @click="doFindPrev" class="find-nav-btn" title="上一个"><ChevronUp size="13" /></button>
          <button @click="doFindNext" class="find-nav-btn" title="下一个"><ChevronDown size="13" /></button>
          <button
            @click="findCaseSensitive = !findCaseSensitive"
            class="find-opt-btn"
            :class="{ 'is-active': findCaseSensitive }"
            title="区分大小写"
          >Aa</button>
          <button
            @click="showReplaceInput = !showReplaceInput"
            class="find-opt-btn"
            :class="{ 'is-active': showReplaceInput }"
            title="替换"
          >
            <span style="font-size:11px;line-height:1;">ab→</span>
          </button>
          <button @click="closeFindReplace" class="find-close-btn" title="关闭"><X size="13" /></button>
        </div>
        <div v-if="showReplaceInput" class="find-bar-row">
          <div class="find-input-wrap">
            <span class="find-input-icon" style="font-size:10px;">→</span>
            <input
              v-model="replaceText"
              type="text"
              placeholder="替换为..."
              class="find-input"
              @keydown="onFindKeydown"
            />
          </div>
          <button @click="doReplace" class="find-action-btn" title="替换当前">替换</button>
          <button @click="doReplaceAll" class="find-action-btn" title="全部替换">全部</button>
        </div>
      </div>
    </div>

        <div class="editor-footer">
          <span>{{ editorText.split(/\s+/).filter(Boolean).length }} 单词</span>
          <span>{{ editorText.length }} 字符</span>
          <span>{{ lineNumbers.length }} 行</span>
        </div>
  </div>
</template>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: var(--bg-editor);
  position: relative;
  overflow: hidden;
}

.header-actions {
  display: flex; gap: 4px; align-items: center; width: 100%;
}

.btn-icon {
  background: transparent; border: none; color: var(--text-muted);
  border-radius: 6px; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s ease;
}
.btn-icon:hover { color: var(--accent-color); background: var(--accent-bg); }
.btn-icon.is-active { color: var(--accent-color); background: var(--accent-bg); }
.btn-danger:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

.toolbar-sep { width: 1px; height: 16px; background: var(--border-color); margin: 0 4px; }
.toolbar-spacer { flex: 1; }

/* Jiggle Animation on file import */
@keyframes jiggle {
  0% { transform: scale(1); }
  25% { transform: scale(0.97) rotate(-1deg); }
  50% { transform: scale(1.02) rotate(1deg); }
  75% { transform: scale(0.99) rotate(-0.5deg); }
  100% { transform: scale(1) rotate(0); }
}

.is-jiggle {
  animation: jiggle 0.6s ease;
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.editor-body {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-input-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}



.line-gutter {
  padding: 16px 0;
  width: 40px;
  background: transparent;
  border-right: 1px solid var(--border-color);
  text-align: center;
  user-select: none;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  opacity: 0.55;
  overflow-y: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
}

.line-number {
  height: 24px;
  line-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
}

textarea {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  margin: 0; padding: 16px; box-sizing: border-box;
  font-family: 'JetBrains Mono', Consolas, Monaco, "Andale Mono", monospace;
  font-size: inherit; font-weight: 400; letter-spacing: -0.01em;
  line-height: 24px; white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word;
  tab-size: 2; -moz-tab-size: 2;
  border: none; outline: none; overflow-y: scroll;
  background: var(--bg-editor);
  color: var(--text-main);
  caret-color: var(--accent-color);
  resize: none;
}

textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.6;
}

.codemirror-markdown-editor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-editor);
  overflow: hidden;
}

.codemirror-markdown-editor :deep(.cm-editor) {
  height: 100%;
}

.codemirror-markdown-editor :deep(.cm-scroller) {
  overflow: auto;
}

/* Drag overlay styling */
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-editor);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px dashed var(--accent-color);
  border-radius: 12px;
  transform: scale(0.95);
}

.drag-overlay.is-active {
  opacity: 0.95;
  pointer-events: auto;
  transform: scale(1);
}

.drag-message {
  text-align: center;
  color: var(--text-main);
}

.upload-icon {
  color: var(--accent-color);
  animation: bounce 1.5s infinite;
  margin-bottom: 16px;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.drag-message h3 {
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
}

.drag-message p {
  color: var(--text-muted);
  font-size: 14px;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.01);
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Inline Find Bar (Responsive & Compact rem sizing) ── */
.find-bar {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  z-index: 50;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  box-shadow: 0 0.1875rem 0.75rem rgba(0, 0, 0, 0.08);
  padding: 0.25rem 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: min(18.5rem, calc(100vw - 2.5rem));
}

.find-bar-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.find-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.find-input-icon {
  position: absolute;
  left: 0.4375rem;
  color: var(--text-muted);
  pointer-events: none;
}

.find-input {
  width: 100%;
  padding: 0.125rem 3rem 0.125rem 1.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-family: inherit;
  background: var(--bg-app);
  color: var(--text-main);
  outline: none;
  height: 1.625rem;
  box-sizing: border-box;
}

.find-input:focus {
  border-color: var(--accent-color);
}

.find-count {
  position: absolute;
  right: 0.4375rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.find-nav-btn,
.find-opt-btn,
.find-close-btn,
.find-action-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.625rem;
  width: 1.625rem;
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.find-nav-btn:hover,
.find-opt-btn:hover,
.find-close-btn:hover {
  background: var(--accent-bg);
  color: var(--text-main);
}

.find-opt-btn.is-active {
  background: var(--accent-color);
  color: #fff;
}

.find-action-btn {
  width: auto;
  padding: 0 0.5rem;
  font-size: 0.6875rem;
  border: 1px solid var(--border-color);
}

.find-action-btn:hover {
  background: var(--accent-bg);
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.find-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

@media (max-width: 480px) {
  .find-bar {
    left: 0.25rem;
    right: 0.25rem;
    min-width: 0;
    padding: 0.25rem;
  }
  .find-bar-row {
    gap: 0.125rem;
  }
  .find-input {
    padding: 0.125rem 2.5rem 0.125rem 1.375rem;
    height: 1.5rem;
    font-size: 0.6875rem;
  }
  .find-nav-btn,
  .find-opt-btn,
  .find-close-btn {
    width: 1.5rem;
    height: 1.5rem;
  }
  .find-action-btn {
    height: 1.5rem;
    padding: 0 0.375rem;
    font-size: 0.65rem;
  }
}

/* URL Import Popover styles */
.url-import-popover {
  position: absolute;
  top: 56px;
  right: 16px;
  width: 320px;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  border-radius: 8px;
  z-index: 100;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popover-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-close-popover {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 2px;
}

.btn-close-popover:hover {
  color: var(--text-main);
}

.popover-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.popover-body input {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  background: var(--bg-app);
  color: var(--text-main);
  outline: none;
  font-family: inherit;
}

.popover-body input:focus {
  border-color: var(--accent-color);
}

.btn-submit-url {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: 1px solid var(--btn-primary-border);
  padding: 8px 14px;
  border-radius: var(--btn-primary-radius, 9999px);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--btn-primary-shadow);
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
}

.btn-submit-url:hover:not(:disabled) {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--btn-primary-hover-shadow);
}

.btn-submit-url:active:not(:disabled) {
  background: var(--btn-primary-active);
  transform: translateY(0);
}

.btn-submit-url:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

html.dark .btn-submit-url {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border-color: var(--btn-primary-border);
}

html.dark .btn-submit-url:hover:not(:disabled) {
  background: var(--btn-primary-hover);
}

html.dark .btn-submit-url:hover:not(:disabled) {
  background: var(--btn-primary-hover, #f4f4f5);
}

/* Floating format bar on selection */
.float-format-bar {
  position: fixed;
  display: flex; align-items: center; gap: 2px;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 4px 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 9999;
  /* Lift fully above the selected line with a small gap */
  transform: translateY(calc(-100% - 10px));
  max-width: 92vw;
  flex-wrap: nowrap;
  overflow-x: auto;
}

/* When there's no room above the selection, show below it instead */
.float-format-bar.is-below {
  transform: translateY(10px);
}
.float-format-bar button {
  background: transparent; border: none; color: var(--text-muted);
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 11px; font-weight: 700;
  transition: all 0.12s ease;
}
.float-format-bar button:hover { background: var(--accent-bg); color: var(--accent-color); }
.float-sep { width: 1px; height: 16px; background: var(--border-color); margin: 0 3px; }

/* Table size picker popover */
.table-picker {
  position: fixed;
  transform: translateX(-50%);
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  padding: 10px;
  z-index: 10000;
}

.table-picker-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-picker-row {
  display: flex;
  gap: 2px;
}

.table-picker-cell {
  width: 14px;
  height: 14px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.08s ease;
}

.table-picker-cell:hover,
.table-picker-cell.is-selected {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

.table-picker-label {
  margin-top: 8px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

@media (max-width: 480px) {
  .float-format-bar {
    padding: 3px 4px;
    border-radius: 8px;
  }
  .float-format-bar button {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
  .float-sep {
    height: 14px;
    margin: 0 2px;
  }
}

/* Floating quick-scroll buttons */
.scroll-quick-btns {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.scroll-quick-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-editor);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: all 0.15s ease;
}

.scroll-quick-btn:hover {
  opacity: 1;
  color: var(--accent-color);
  border-color: var(--accent-color);
}

@media (max-width: 640px) {
  .editor-header {
    padding: 4px 6px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .header-actions {
    flex-wrap: nowrap;
    gap: 1px;
  }
  .btn-icon {
    width: 26px;
    height: 26px;
  }
  .toolbar-sep {
    margin: 0 2px;
  }
}

/* Export dropdown in toolbar */
.export-trigger-container {
  position: relative;
}
.header-popout-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 200;
  min-width: 140px;
}
.btn-toolbar-dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-toolbar-dropdown:hover,
.btn-toolbar-dropdown.is-active {
  background: var(--accent-bg);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.popout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.12s ease;
}
.popout-item:hover {
  background: var(--accent-bg);
}
.popout-item.is-active {
  background: var(--accent-bg);
  color: var(--accent-color);
  font-weight: 600;
}

/* CodeMirror Search & Selection Match Warm Yellow-Orange Highlighting */
:deep(.cm-selectionMatch) {
  background-color: rgba(245, 158, 11, 0.35) !important;
  border-radius: 2px;
  outline: 1px solid rgba(245, 158, 11, 0.6) !important;
}

:deep(.cm-searchMatch) {
  background-color: rgba(251, 191, 36, 0.45) !important;
  border-radius: 2px;
  outline: 1px solid rgba(245, 158, 11, 0.55) !important;
}

:deep(.cm-searchMatch.cm-searchMatch-selected) {
  background-color: #f59e0b !important;
  color: #1c1917 !important;
  font-weight: 700 !important;
  border-radius: 2px;
  outline: 2px solid #d97706 !important;
}

:deep(.cm-selectionBackground) {
  background-color: rgba(245, 158, 11, 0.3) !important;
}
</style>
