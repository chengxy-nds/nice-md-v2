<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun, AlignmentType } from 'docx';
import {
  Menu, Sparkles, Search, Image, HelpCircle, Link, Upload, Trash2,
  Link2, Link2Off, Eye, EyeOff, Download, Undo2, Redo2, Palette, Code2,
  ChevronDown, FileCode, FileText, Globe, Wand2, LayoutGrid, Send, Settings, Check, X,
  Pencil
} from '@lucide/vue';
import { applyTheme, getThemeDefaultStyles, themes as themePresets } from './utils/themePresets';
import { codeThemes } from './utils/codeThemes';
import { htmlToMarkdown } from './utils/htmlToMarkdown';
import { soundEngine } from './utils/synthAudio';
import EditorPanel from './components/EditorPanel.vue';
import PreviewPanel from './components/PreviewPanel.vue';
import LaunchpadModal from './components/LaunchpadModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import Sidebar from './components/Sidebar.vue';
import IconBar from './components/IconBar.vue';
import { compileToWeChatHtml, cleanEmptyListItems } from './utils/wechatStyles';
import { marked } from 'marked';
import confetti from 'canvas-confetti';
import { defaultMarkdown } from './utils/defaultMarkdown';
import TemplateCenter from './components/TemplateCenter.vue';
import MaterialCenter from './components/MaterialCenter.vue';
import HomeLandingView from './components/HomeLandingView.vue';
import {
  loadDocuments, saveDocuments,
  loadGroups, saveGroups,
  loadActiveDocId, saveActiveDocId,
  loadSidebarVisible, saveSidebarVisible,
  generateId
} from './utils/docStorage';

// ── view & document state ──
const currentView = ref('editor'); // 'home' | 'editor' | 'templates' | 'materials'

function handleInsertMaterial(htmlSnippet) {
  let snippet = htmlSnippet ? htmlSnippet.trim() : '';
  if (snippet && !snippet.includes('data-material="true"')) {
    snippet = snippet.replace(/^<([a-zA-Z0-9]+)/, '<$1 data-material="true"');
  }
  if (!markdownContent.value) {
    markdownContent.value = snippet;
  } else {
    markdownContent.value = markdownContent.value.trim() + '\n\n' + snippet;
  }
  currentView.value = 'editor';
  soundEngine.playChime();
}

function handleApplyBackground(mat) {
  const normId = (mat.id || '').replace(/^bg-/, '').replace(/-classic$/, '').replace(/-none$/, '');
  const updatedStyles = JSON.parse(JSON.stringify(customStyles.value || {}));
  if (!updatedStyles.body) updatedStyles.body = {};
  updatedStyles.body.backgroundTexture = normId;
  updatedStyles.body.materialTemplateId = normId;
  customStyles.value = updatedStyles;
  currentView.value = 'editor';
  soundEngine.playChime();
}
const documents = ref([]);
const groups = ref([]);
const activeDocId = ref(null);
const sidebarVisible = ref(true);

const activeDocument = computed(() =>
  documents.value.find(d => d.id === activeDocId.value)
);

const markdownContent = computed({
  get: () => activeDocument.value?.content ?? '',
  set: (val) => {
    const doc = documents.value.find(d => d.id === activeDocId.value);
    if (doc) {
      doc.content = val;
      doc.updatedAt = Date.now();
      saveDocuments(documents.value);
    }
  }
});

const customStyles = computed({
  get: () => activeDocument.value?.customStyles ?? {},
  set: (val) => {
    const doc = documents.value.find(d => d.id === activeDocId.value);
    if (doc) {
      doc.customStyles = val;
      doc.updatedAt = Date.now();
      saveDocuments(documents.value);
    }
  }
});

// ── CRUD handlers ──
function handleSelectDoc(id) {
  soundEngine.playClick();
  activeDocId.value = id;
  saveActiveDocId(id);
}

function handleCreateDoc(groupId = null) {
  soundEngine.playClick();
  const id = generateId();
  const now = Date.now();
  documents.value.push({
    id, title: '未命名文档', content: '', groupId, createdAt: now, updatedAt: now,
    customStyles: {}
  });
  activeDocId.value = id;
  saveDocuments(documents.value);
  saveActiveDocId(id);
}

function handleApplyTemplate(template) {
  const content = typeof template === 'string' ? template : template.content;
  const title = (typeof template === 'object' && template.title) ? template.title : '已套用模板';
  const tmplCustomStyles = (typeof template === 'object' && template.customStyles) ? template.customStyles : {};

  if (!markdownContent.value || markdownContent.value.trim() === defaultMarkdown.trim()) {
    markdownContent.value = content;
    if (activeDocument.value) {
      activeDocument.value.title = title;
      activeDocument.value.customStyles = JSON.parse(JSON.stringify(tmplCustomStyles));
    }
  } else {
    const id = generateId();
    const now = Date.now();
    documents.value.push({
      id, title, content, groupId: null, createdAt: now, updatedAt: now,
      customStyles: JSON.parse(JSON.stringify(tmplCustomStyles))
    });
    activeDocId.value = id;
    saveDocuments(documents.value);
    saveActiveDocId(id);
  }

  currentView.value = 'editor';
}

function handleApplyTheme(theme) {
  soundEngine.playChime();
  const themeId = typeof theme === 'string' ? theme : theme.id;
  const customStylesObj = (typeof theme === 'object' && theme.customStyles)
    ? JSON.parse(JSON.stringify(theme.customStyles))
    : ((typeof theme === 'object' && theme.customCss) ? { customCss: theme.customCss } : {});

  // 1) Switch active theme
  currentTheme.value = themeId;
  applyTheme(themeId);
  localStorage.setItem('nicemd_theme', themeId);

  // 2) Apply theme & customStyles onto current active document
  if (!activeDocument.value) {
    handleCreateDoc();
  }
  if (activeDocument.value) {
    activeDocument.value.customStyles = customStylesObj;
    activeDocument.value.updatedAt = Date.now();
  }
  customStyles.value = customStylesObj;

  saveDocuments(documents.value);

  // 3) Switch back to editor
  currentView.value = 'editor';
}

function handleRenameDoc({ id, title }) {
  soundEngine.playClick();
  const doc = documents.value.find(d => d.id === id);
  if (doc) { doc.title = title; doc.updatedAt = Date.now(); }
  saveDocuments(documents.value);
}

// ── Toolbar document title inline rename ──
const isRenamingToolbarDoc = ref(false);
const toolbarDocRenameValue = ref('');
const toolbarDocInputRef = ref(null);

function startRenameToolbarDoc() {
  if (!activeDocument.value) return;
  toolbarDocRenameValue.value = activeDocument.value.title || '未命名文档';
  isRenamingToolbarDoc.value = true;
  nextTick(() => {
    toolbarDocInputRef.value?.focus();
    toolbarDocInputRef.value?.select();
  });
}

function confirmRenameToolbarDoc() {
  if (!isRenamingToolbarDoc.value) return;
  const trimmed = toolbarDocRenameValue.value.trim();
  if (trimmed && activeDocument.value) {
    handleRenameDoc({ id: activeDocument.value.id, title: trimmed });
  }
  isRenamingToolbarDoc.value = false;
}

function cancelRenameToolbarDoc() {
  isRenamingToolbarDoc.value = false;
}

function handleDeleteDoc(id) {
  soundEngine.playClick('backspace');
  const idx = documents.value.findIndex(d => d.id === id);
  if (idx === -1) return;
  documents.value.splice(idx, 1);
  if (activeDocId.value === id) {
    if (documents.value.length === 0) {
      handleCreateDoc(null);
    } else {
      activeDocId.value = documents.value[0].id;
      saveActiveDocId(activeDocId.value);
    }
  }
  saveDocuments(documents.value);
}

function handleCreateGroup(name) {
  soundEngine.playClick();
  const group = { id: generateId(), name, createdAt: Date.now() };
  groups.value.push(group);
  saveGroups(groups.value);
}

function handleRenameGroup({ id, name }) {
  soundEngine.playClick();
  const group = groups.value.find(g => g.id === id);
  if (group) group.name = name;
  saveGroups(groups.value);
}

function handleDeleteGroup(id) {
  soundEngine.playClick('backspace');
  groups.value = groups.value.filter(g => g.id !== id);
  documents.value.forEach(d => { if (d.groupId === id) d.groupId = null; });
  saveDocuments(documents.value);
  saveGroups(groups.value);
}

function handleMoveDoc({ docId, groupId }) {
  const doc = documents.value.find(d => d.id === docId);
  if (doc) {
    doc.groupId = groupId || null;
    doc.updatedAt = Date.now();
    const idx = documents.value.findIndex(d => d.id === docId);
    if (idx !== -1) {
      const [moved] = documents.value.splice(idx, 1);
      documents.value.push(moved);
    }
    documents.value = [...documents.value];
    saveDocuments(documents.value);
  }
}

function handleReorderDocs({ docId, targetDocId, position }) {
  const srcIdx = documents.value.findIndex(d => d.id === docId);
  const targetDoc = documents.value.find(d => d.id === targetDocId);
  if (srcIdx === -1 || !targetDoc || docId === targetDocId) return;

  const [moved] = documents.value.splice(srcIdx, 1);
  moved.groupId = targetDoc.groupId || null;
  moved.updatedAt = Date.now();

  const tgtIdx = documents.value.findIndex(d => d.id === targetDocId);
  const insertIdx = position === 'after' ? tgtIdx + 1 : tgtIdx;
  documents.value.splice(insertIdx, 0, moved);
  documents.value = [...documents.value];
  saveDocuments(documents.value);
}

function handleReorderGroups({ groupId, targetGroupId }) {
  const srcIdx = groups.value.findIndex(g => g.id === groupId);
  const tgtIdx = groups.value.findIndex(g => g.id === targetGroupId);
  if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx) return;
  const [moved] = groups.value.splice(srcIdx, 1);
  const insertIdx = srcIdx < tgtIdx ? tgtIdx - 1 : tgtIdx;
  groups.value.splice(insertIdx, 0, moved);
  saveGroups(groups.value);
}

const currentTheme = ref(localStorage.getItem('nicemd_theme') || 'classic-indigo');
const currentCodeTheme = ref(localStorage.getItem('nicemd_code_theme') || 'mdnice-classic');

const activeThemeName = computed(() =>
  themePresets.find(t => t.id === currentTheme.value)?.name || '山海'
);
const editorPanelRef = ref(null);
const showImportMenu = ref(false);
const showExportMenu = ref(false);
const showDocThemeMenu = ref(false);
const showCodeThemeMenu = ref(false);

const activeThemeObj = computed(() =>
  themePresets.find(t => t.id === currentTheme.value) || themePresets[0]
);

const activeCodeThemeObj = computed(() =>
  codeThemes.find(ct => ct.id === currentCodeTheme.value) || codeThemes[0]
);

function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value;
}
function closeExportMenu() {
  showExportMenu.value = false;
}
function handleSaveTheme(styles) {
  const name = prompt('请输入主题名称：');
  if (!name) return;
  const id = 'custom-' + Date.now().toString(36);
  // Build CSS vars from the custom styles
  const vars = {};
  if (styles.body?.color) vars['--text-main'] = styles.body.color;
  if (styles.body?.backgroundColor) vars['--bg-preview'] = styles.body.backgroundColor;
  if (styles.body?.backgroundColor) vars['--bg-editor'] = styles.body.backgroundColor;
  if (styles.code?.backgroundColor) vars['--code-bg'] = styles.code.backgroundColor;
  if (styles.code?.color) vars['--code-text'] = styles.code.color;
  themePresets.push({
    id, name,
    icon: 'Palette',
    dark: false,
    styles: {
      '--bg-app': styles.body?.backgroundColor || '#fcfcfc',
      '--bg-editor': styles.body?.backgroundColor || '#ffffff',
      '--bg-preview': styles.body?.backgroundColor || '#fdfdfd',
      '--text-main': styles.body?.color || '#2b2b2b',
      '--text-muted': '#595959',
      '--border-color': '#e1e4e8',
      '--accent-color': '#2775b6',
      '--accent-hover': '#1e5d93',
      '--accent-bg': 'rgba(39, 117, 182, 0.05)',
      '--code-bg': styles.code?.backgroundColor || 'rgba(27,31,35,0.05)',
      '--code-text': styles.code?.color || '#bb2243',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    }
  });
  localStorage.setItem('nicemd_custom_themes', JSON.stringify(themePresets));
  soundEngine.playChime();
}

const isExtensionConnected = ref(false);

function handleCodeThemeSelect(id) {
  soundEngine.playClick();
  currentCodeTheme.value = id;
  showCodeThemeMenu.value = false;
  localStorage.setItem('nicemd_code_theme', id);
  const newStyles = JSON.parse(JSON.stringify(customStyles.value || {}));
  if (!newStyles.code) newStyles.code = {};
  newStyles.code.codeThemeId = id;
  customStyles.value = newStyles;
}

function handleCodeThemeChangeFromPreview(id) {
  currentCodeTheme.value = id;
  localStorage.setItem('nicemd_code_theme', id);
  const newStyles = JSON.parse(JSON.stringify(customStyles.value || {}));
  if (!newStyles.code) newStyles.code = {};
  newStyles.code.codeThemeId = id;
  customStyles.value = newStyles;
}

// Watch activeDocument to sync codeThemeId if stored in document
watch(activeDocument, (doc) => {
  if (doc?.customStyles?.code?.codeThemeId) {
    currentCodeTheme.value = doc.customStyles.code.codeThemeId;
  }
}, { immediate: true });

watch(currentCodeTheme, (newVal) => {
  localStorage.setItem('nicemd_code_theme', newVal);
});

const changeTheme = (themeId) => {
  soundEngine.playClick();
  currentTheme.value = themeId;
  applyTheme(themeId);
  localStorage.setItem('nicemd_theme', themeId);

  // Update active document's customStyles to match the new theme's default styles so preview updates immediately
  const newStyles = getThemeDefaultStyles(themeId) || {};
  if (activeDocument.value) {
    activeDocument.value.customStyles = newStyles;
    activeDocument.value.updatedAt = Date.now();
  }
  customStyles.value = newStyles;
  saveDocuments(documents.value);
};

const handleImport = ({ content, type, filename }) => {
  if (type === 'html') {
    markdownContent.value = htmlToMarkdown(content);
  } else {
    markdownContent.value = content;
  }
};

// ── export ──
function getExportTitle() {
  const m = markdownContent.value.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '未命名文档';
}

function downloadBlob(content, filename, mime) {
  let blob;
  if (content instanceof Blob) {
    blob = content;
  } else {
    // Prepend UTF-8 BOM (\uFEFF) for text files so Word, Excel, and text editors recognize UTF-8 encoding
    const needBOM = mime.includes('text') || mime.includes('msword') || mime.includes('markdown') || mime.includes('html');
    const textContent = needBOM ? '\uFEFF' + content : content;
    blob = new Blob([textContent], { type: mime });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Reuse compileToWeChatHtml for export — it produces inline-styled HTML with
// Mac-dot SVG headers, syntax highlighting, code shadows, and all theme styles.
function getStyledHtml() {
  if (!markdownContent.value) return '';
  const rawHtml = marked.parse(markdownContent.value);
  const cleaned = cleanEmptyListItems(rawHtml);
  const effectiveCodeTheme = customStyles.value?.code?.codeThemeId || currentCodeTheme.value || 'mdnice-classic';
  return compileToWeChatHtml(cleaned, currentTheme.value, effectiveCodeTheme, customStyles.value?.customCss || '', customStyles.value);
}

function exportMD() {
  soundEngine.playClick();
  downloadBlob(markdownContent.value, getExportTitle() + '.md', 'text/markdown;charset=utf-8');
}

function exportHTML() {
  soundEngine.playClick();
  const title = getExportTitle();
  const body = getStyledHtml();
  const full = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${title}</title></head>
<body style="max-width:700px;margin:40px auto;padding:20px;">
${body}
</body></html>`;
  downloadBlob(full, title + '.html', 'text/html;charset=utf-8');
}

// Pre-process images for Canvas / PDF export: convert to Base64 to bypass CORS & ensure auto-adapting width
async function prepareContainerImages(container) {
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(imgs.map(async (img) => {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;

    // Determine if the image is same-origin. Cross-origin images (e.g. OSS
    // buckets without CORS headers) can't be fetched directly — the browser
    // logs an uncatchable CORS error for the direct fetch, so we must skip it
    // and go straight to a CORS proxy.
    let isSameOrigin = false;
    try {
      isSameOrigin = !src.startsWith('http') ||
        new URL(src).origin === window.location.origin;
    } catch { isSameOrigin = false; }

    const attempts = isSameOrigin
      ? [src]
      : [
          `https://proxy.cors.sh/${src}`,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`,
          `https://corsproxy.io/?url=${encodeURIComponent(src)}`
        ];

    for (const url of attempts) {
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) continue;
        const blob = await response.blob();
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              img.setAttribute('src', reader.result);
            }
            resolve();
          };
          reader.onerror = resolve;
          reader.readAsDataURL(blob);
        });
        break; // converted successfully, stop trying
      } catch (e) {
        console.warn('[NiceMD] Image Base64 conversion attempt failed for:', url, e);
      }
    }
  }));

  await new Promise(r => setTimeout(r, 150));
}

// ── real .docx (native OOXML, fully editable) export using the `docx` library ──
// html-docx-js-typescript embeds HTML as an altChunk blob, which Word treats as
// non-editable embedded content. Here we parse the markdown into native Word
// paragraphs / tables / runs so every line is real, editable text.

function mdTextToRuns(text) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|~~[^~]+~~)/g);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith('~~') && part.endsWith('~~')) {
      runs.push(new TextRun({ text: part.slice(2, -2), strike: true }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Consolas' }));
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else {
      runs.push(new TextRun({ text: part }));
    }
  }
  if (!runs.length) runs.push(new TextRun({ text }));
  return runs;
}

async function fetchImageBytes(src) {
  const urls = [
    src,
    `https://proxy.cors.sh/${src}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(src)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(src)}`
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength) return buf;
    } catch { /* try next */ }
  }
  return null;
}

async function mdToDocxWithImages(tokens) {
  // Collect images in order of appearance, then fetch each and build ImageRuns.
  const imgList = [];
  (function collect(items) {
    for (const t of items) {
      if (t.type === 'image' && t.href) {
        imgList.push({ href: t.href, alt: t.text || '' });
      } else if (t.type === 'paragraph' && t.tokens && Array.isArray(t.tokens)) {
        collect(t.tokens);
      }
    }
  })(tokens);

  const MAX_W = 520;
  const prepared = await Promise.all(imgList.map(async (img) => {
    const bytes = await fetchImageBytes(img.href);
    if (!bytes) return null;
    const blob = new Blob([bytes]);
    const bitmap = await createImageBitmap(blob);
    const naturalW = bitmap.width;
    const naturalH = bitmap.height;
    const w = Math.min(naturalW, MAX_W);
    const h = naturalH ? Math.round((w / naturalW) * naturalH) : w;
    return { bytes, w, h, type: blob.type || 'image/png' };
  }));

  let imgIdx = 0;
  const getImg = () => prepared[imgIdx++];

  // Build an ImageRun (or fallback text) for an image token.
  const imgParagraph = (tk) => {
    const p = getImg();
    if (p) {
      return new Paragraph({
        children: [new ImageRun({
          data: p.bytes,
          transformation: { width: p.w, height: p.h },
          type: p.type
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 }
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: `[图片: ${tk.text || tk.href || ''}]`, color: '888888' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 }
    });
  };

  // Split a paragraph token into runs, inlining images in place.
  const paragraphWithImages = (t) => {
    const hasImg = t.tokens && t.tokens.some(tk => tk.type === 'image');
    if (!hasImg) {
      return [new Paragraph({
        children: mdTextToRuns(t.text),
        spacing: { after: 120, line: 360 }
      })];
    }
    const runs = [];
    for (const tk of t.tokens) {
      if (tk.type === 'image') {
        const p = getImg();
        if (p) {
          runs.push(new ImageRun({
            data: p.bytes,
            transformation: { width: p.w, height: p.h },
            type: p.type
          }));
        } else {
          runs.push(new TextRun({ text: `[图片]`, color: '888888' }));
        }
      } else {
        runs.push(...mdTextToRuns(tk.raw || tk.text || ''));
      }
    }
    return [new Paragraph({
      children: runs,
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 }
    })];
  };

  const out = [];
  (function walk(items) {
    for (const t of items) {
      switch (t.type) {
        case 'image':
          out.push(imgParagraph(t));
          break;
        case 'paragraph':
          out.push(...paragraphWithImages(t));
          break;
        case 'heading': {
          const depth = Math.min(t.depth || 1, 6);
          const headingMap = {
            1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3,
            4: HeadingLevel.HEADING_4, 5: HeadingLevel.HEADING_5, 6: HeadingLevel.HEADING_6
          };
          out.push(new Paragraph({
            children: mdTextToRuns(t.text),
            heading: headingMap[depth],
            spacing: { before: 240, after: 120 }
          }));
          break;
        }
        case 'blockquote':
          out.push(new Paragraph({
            children: mdTextToRuns(t.text),
            indent: { left: 400 },
            border: { left: { style: 'single', size: 12, color: '999999' } },
            spacing: { after: 120 }
          }));
          break;
        case 'list': {
          (t.items || []).forEach((item, i) => {
            const itemText = item.text || '';
            out.push(new Paragraph({
              children: mdTextToRuns(itemText),
              numbering: t.ordered ? { reference: 'ordered-list', level: 0 } : undefined,
              bullet: t.ordered ? undefined : { level: 0 },
              spacing: { after: 60 }
            }));
          });
          break;
        }
        case 'code': {
          const lines = (t.text || '').split('\n');
          out.push(new Paragraph({
            children: lines.map((l, i) => new TextRun({
              text: l + (i < lines.length - 1 ? '\n' : ''),
              font: 'Consolas',
              size: 18,
              shading: { type: 'clear', color: 'auto', fill: 'F5F5F5' }
            })),
            indent: { left: 300 },
            spacing: { after: 120 }
          }));
          break;
        }
        case 'table': {
          const headerRow = t.header || [];
          const rows = t.rows || [];
          const makeRow = (cells, isHeader) => new TableRow({
            children: cells.map((cell) => new TableCell({
              children: [new Paragraph({
                children: mdTextToRuns(cell.text || ''),
                spacing: { after: 0 }
              })],
              shading: isHeader ? { type: 'clear', fill: 'EDEDED' } : undefined
            }))
          });
          const tableRows = [];
          if (headerRow.length) tableRows.push(makeRow(headerRow, true));
          rows.forEach(r => tableRows.push(makeRow(r, false)));
          if (tableRows.length) {
            out.push(new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows
            }));
          }
          break;
        }
        case 'space':
          out.push(new Paragraph({ children: [] }));
          break;
        default:
          break;
      }
    }
  })(tokens);

  return out;
}

async function exportWord() {
  soundEngine.playClick();
  const title = getExportTitle();
  try {
    const tokens = marked.lexer(markdownContent.value || '');
    const children = await mdToDocxWithImages(tokens);

    const doc = new Document({
      creator: 'NiceMD',
      title,
      styles: {
        default: {
          document: {
            run: { font: 'PingFang SC', size: 24, color: '333333' }
          }
        }
      },
      numbering: {
        config: [{
          reference: 'ordered-list',
          levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: 'left' }]
        }]
      },
      sections: [{ properties: {}, children }]
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, title + '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  } catch (err) {
    console.error('[NiceMD] docx export failed:', err);
    alert('导出 Word 失败：' + (err.message || '未知错误'));
  }
}

// ── PNG long-image export (Web desktop width 750px) ──
async function exportPNG() {
  soundEngine.playClick();
  if (!markdownContent.value) return;
  const title = getExportTitle();

  let host = null;
  try {
    const styledHtml = getStyledHtml();
    host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:750px;z-index:-9999;opacity:0.01;pointer-events:none;background:#ffffff;';
    const inner = document.createElement('div');
    inner.style.cssText = 'width:750px;padding:32px 40px;box-sizing:border-box;background:#ffffff;color:#2e3440;font-size:15px;line-height:1.8;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;';
    inner.innerHTML = styledHtml;
    host.appendChild(inner);
    document.body.appendChild(host);

    await prepareContainerImages(inner);

    const canvas = await html2canvas(inner, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 750
    });

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, title + '.png', 'image/png');
    }, 'image/png');
  } catch (err) {
    console.error('[NiceMD] html2canvas Web PNG export failed:', err);
  } finally {
    if (host && host.parentNode) {
      document.body.removeChild(host);
    }
  }
}

// ── PDF export using html2pdf.js ──
function printViaIframe(bodyHtml, title) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 15mm; }
    }
    body {
      max-width: 750px;
      margin: 20px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #2e3440;
      background: #fff;
    }
    img { max-width: 100%; height: auto; }
    pre, code { font-family: "Fira Code", Consolas, Monaco, monospace; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

async function exportPDF(options = {}) {
  const { raw = false } = options;
  soundEngine.playClick();
  if (!markdownContent.value) return;
  const title = getExportTitle();

  let styledHtml = '';
  if (raw) {
    // Pure raw markdown HTML without WeChat preset theme styles or colors
    const rawHtml = marked.parse(markdownContent.value);
    styledHtml = cleanEmptyListItems(rawHtml);
  } else {
    styledHtml = getStyledHtml();
  }

  const exportFilename = raw ? `${title}_无主题.pdf` : `${title}.pdf`;

  // Force Web mode container (750px desktop web width)
  let host = null;
  try {
    host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:750px;z-index:-9999;opacity:0.01;pointer-events:none;background:#ffffff;';
    const inner = document.createElement('div');
    
    if (raw) {
      inner.style.cssText = 'width:750px;padding:36px 48px;box-sizing:border-box;background:#ffffff;color:#24292f;font-size:15px;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Helvetica,Arial,sans-serif;';
    } else {
      inner.style.cssText = 'width:750px;padding:32px 40px;box-sizing:border-box;background:#ffffff;color:#2e3440;font-size:15px;line-height:1.8;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;';
    }
    inner.innerHTML = styledHtml;

    // Prepend plain GitHub-like unstyled document CSS if raw mode
    if (raw) {
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        h1, h2, h3, h4, h5, h6 { font-family: inherit; font-weight: 600; color: #1f2328; margin-top: 1.5em; margin-bottom: 0.6em; line-height: 1.25; }
        h1 { font-size: 2em; border-bottom: 1px solid #d8dee4; padding-bottom: 0.3em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #d8dee4; padding-bottom: 0.3em; }
        h3 { font-size: 1.25em; }
        p { margin-top: 0; margin-bottom: 1em; }
        blockquote { padding: 0.5em 1em; color: #656d76; border-left: 0.25em solid #d0d7de; margin: 0 0 1em 0; background: #f6f8fa; border-radius: 0 4px 4px 0; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; font-family: Consolas, "Liberation Mono", Menlo, monospace; font-size: 13px; line-height: 1.45; }
        code { font-family: Consolas, "Liberation Mono", Menlo, monospace; font-size: 85%; background: rgba(175,184,193,0.2); padding: 0.2em 0.4em; border-radius: 6px; }
        pre code { background: transparent; padding: 0; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #d0d7de; padding: 8px 12px; }
        th { background: #f6f8fa; font-weight: 600; }
        ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 1em; }
        img { max-width: 100%; height: auto; }
      `;
      inner.insertBefore(styleTag, inner.firstChild);
    }

    host.appendChild(inner);
    document.body.appendChild(host);

    await prepareContainerImages(inner);

    if (typeof html2pdf === 'function') {
      const opt = {
        margin:       [12, 12, 12, 12],
        filename:     exportFilename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 750 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'] }
      };
      await html2pdf().set(opt).from(inner).save();
      return;
    }
  } catch (err) {
    console.warn('[NiceMD] html2pdf Web export failed, falling back to iframe print:', err);
  } finally {
    if (host && host.parentNode) {
      document.body.removeChild(host);
    }
  }

  printViaIframe(styledHtml, title);
}

const openLaunchpad = () => {
  soundEngine.playChime();
  isLaunchpadOpen.value = true;
};

const closeLaunchpad = () => {
  soundEngine.playClick('backspace');
  isLaunchpadOpen.value = false;
};

const openSettings = () => {
  soundEngine.playChime();
  isSettingsOpen.value = true;
};

// ── Header Capsule Toolbar State & Actions ──
const showMoreTools = ref(false);
const showAiModal = ref(false);
const appToastText = ref('');
let appToastTimer = null;

const triggerAppToast = (msg) => {
  appToastText.value = msg;
  clearTimeout(appToastTimer);
  appToastTimer = setTimeout(() => {
    appToastText.value = '';
  }, 2500);
};

const handleAiPolish = () => {
  soundEngine.playChime();
  showAiModal.value = true;
};

const applyAiPolishPreset = (presetName) => {
  showAiModal.value = false;
  soundEngine.playChime();
  triggerAppToast(`✨ AI 智能润色【${presetName}】已就绪！`);
};

// 智能排版 (中英文空格规范化、格式修剪、空行规整)
const handleAutoFormat = () => {
  if (!markdownContent.value) {
    triggerAppToast('当前编辑器内容为空');
    return;
  }
  soundEngine.playChime();
  let text = markdownContent.value;
  // 1. 中英文与数字之间添加标准空格 (Pangu style spacing)
  text = text.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
  text = text.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
  // 2. 规范标题前后空格 (#标题 -> # 标题)
  text = text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');
  // 3. 规范无序列表符
  text = text.replace(/^([ \t]*)\*([ \t]+)/gm, '$1- $2');
  // 4. 清理多余空行 (最多连续保留两行)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  markdownContent.value = text;
  triggerAppToast('✨ 智能排版与中英文规范已自动优化！');
};

const handleCoverGenerate = () => {
  soundEngine.playChime();
  isLaunchpadOpen.value = true;
};

// Renders html content helper for Launchpad
const getCompiledHtml = () => {
  if (!markdownContent.value) return '';
  const rawHtml = marked.parse(markdownContent.value);
  return cleanEmptyListItems(rawHtml);
};

const activeScrollPane = ref('editor');
const scrollPercentage = ref(0);
const syncScrollEnabled = ref(true);

function toggleSyncScroll() {
  syncScrollEnabled.value = !syncScrollEnabled.value;
}

// Modal & panel state
const isSettingsOpen = ref(false);
const isLaunchpadOpen = ref(false);
const showThemePanel = ref(false);

// Mobile layout views state
const mobileActiveView = ref('editor'); // 'editor' or 'preview'
const mobileSidebarOpen = ref(false);

const previewVisible = ref(localStorage.getItem('nicemd_preview_visible') !== 'false');
const togglePreview = () => {
  soundEngine.playClick();
  previewVisible.value = !previewVisible.value;
  localStorage.setItem('nicemd_preview_visible', previewVisible.value.toString());
};

const toggleMobileSidebar = () => {
  soundEngine.playClick();
  mobileSidebarOpen.value = !mobileSidebarOpen.value;
};

const sidebarRef = ref(null);

const handleScroll = (percentage) => {
  if (!syncScrollEnabled.value) return;
  scrollPercentage.value = percentage;
};

const handleFocusActive = (pane) => {
  activeScrollPane.value = pane;
  if (pane === 'editor') {
    sidebarRef.value?.expandActiveGroup();
  }
};

const handleEditorClick = () => {
  sidebarRef.value?.expandActiveGroup();
};

onMounted(() => {
  // 1. Load persisted state
  documents.value = loadDocuments();
  groups.value = loadGroups();
  sidebarVisible.value = loadSidebarVisible();

  // 1.5 Sanitize legacy auto-generated h1 background from document customStyles
  let docModified = false;
  documents.value.forEach(doc => {
    if (doc.customStyles?.h1) {
      if (doc.customStyles.h1.display === 'block' || doc.customStyles.h1.padding === '10px 24px' || (doc.customStyles.h1.backgroundColor && doc.customStyles.h1.color === '#ffffff')) {
        delete doc.customStyles.h1.backgroundColor;
        delete doc.customStyles.h1.display;
        delete doc.customStyles.h1.padding;
        delete doc.customStyles.h1.borderRadius;
        delete doc.customStyles.h1.textAlign;
        if (doc.customStyles.h1.color === '#ffffff') {
          doc.customStyles.h1.color = '#2775b6';
        }
        docModified = true;
      }
    }
    if (doc.customStyles?.customCss && /#nice h1[^{]*\{[^}]*background-color:[^}]*\}/i.test(doc.customStyles.customCss)) {
      doc.customStyles.customCss = doc.customStyles.customCss.replace(/#nice h1[^{]*\{[^}]*background-color:[^}]*\}/gi, '');
      docModified = true;
    }
  });
  if (docModified) {
    saveDocuments(documents.value);
  }

  // 2. First-time migration: seed default document
  if (documents.value.length === 0) {
    const id = generateId();
    const now = Date.now();
    documents.value = [{
      id, title: '欢迎文档', content: defaultMarkdown,
	      groupId: null, createdAt: now, updatedAt: now,
	      customStyles: {}
	    }];
    saveDocuments(documents.value);
  }

  // 3. Set active document
  const savedActiveId = loadActiveDocId();
  activeDocId.value = documents.value.some(d => d.id === savedActiveId)
    ? savedActiveId
    : documents.value[0].id;

  // 4. Apply theme
  applyTheme(currentTheme.value);
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-color-mode', 'light');
  try { localStorage.removeItem('nicemd_color_mode'); } catch (e) {}

  // 5. Load custom themes from localStorage (append, never replace built-ins)
  try {
    const saved = JSON.parse(localStorage.getItem('nicemd_custom_themes'));
    if (saved && Array.isArray(saved)) {
      const knownIds = new Set(themePresets.map(t => t.id));
      saved.forEach(t => {
        if (t && t.id && !knownIds.has(t.id)) {
          themePresets.push(t);
          knownIds.add(t.id);
        }
      });
    }
  } catch {}

  // 6. Listen to messages from Chrome Assistant Extension
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (!event.data || typeof event.data !== 'object') return;

    // Connection established (PONG)
    if (event.data && event.data.type === 'NICEMD_PONG') {
      console.log('[NiceMD App] Assistant Extension connection active.');
      isExtensionConnected.value = true;
      window.postMessage({ type: 'NICEMD_GET_PENDING_IMPORT' }, '*');
    }

    // Pending import article retrieved
    if (event.data && event.data.type === 'NICEMD_GET_PENDING_IMPORT_RESPONSE') {
      if (event.data.success && event.data.article) {
        const article = event.data.article;
        console.log('[NiceMD App] Loaded pending import article:', article.title);

        markdownContent.value = article.markdown;

        soundEngine.playChime();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    // Background notification that a new article has been imported
    if (event.data && event.data.type === 'NICEMD_IMPORT_NOTIFICATION') {
      console.log('[NiceMD App] Received background import trigger.');
      window.postMessage({ type: 'NICEMD_GET_PENDING_IMPORT' }, '*');
    }
  });

  // 6. Ping helper extension to check if it's loaded
  setTimeout(() => {
    window.postMessage({ type: 'NICEMD_PING' }, '*');
  }, 1000);
});

// ── auto-save watchers ──
let docSaveTimer = null;
watch(markdownContent, () => {
  clearTimeout(docSaveTimer);
  docSaveTimer = setTimeout(() => {
    saveDocuments(documents.value);
  }, 800);
});

watch(sidebarVisible, (val) => {
  saveSidebarVisible(val);
});

watch(customStyles, () => {
  clearTimeout(docSaveTimer);
  docSaveTimer = setTimeout(() => {
    saveDocuments(documents.value);
  }, 800);
}, { deep: true });
</script>

<template>
  <div class="app-container" :class="{ 'is-standalone-home': currentView === 'home' }" data-color-mode="light">
    <!-- 0. 官方独立全屏首页 (Wandor Liquid Glass Full Viewport Landing Page) -->
    <HomeLandingView
      v-if="currentView === 'home'"
      @enter-editor="(prompt) => {
        if (prompt && typeof prompt === 'string') {
          markdownContent = '# 创作草稿\n\n' + prompt;
        }
        currentView = 'editor';
      }"
      @open-templates="currentView = 'templates'"
      @open-materials="currentView = 'materials'"
      @open-launchpad="isLaunchpadOpen = true"
      @insert-sample="editorPanelRef?.insertSample(); currentView = 'editor';"
      @import-file="(file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          markdownContent = e.target.result || '';
          currentView = 'editor';
        };
        reader.readAsText(file);
      }"
    />

    <!-- 工作台模式（含顶部 Header + 左侧 IconBar + 编辑排版双栏） -->
    <template v-else>
      <!-- Header spanning top full width -->
      <header class="app-header">
        <div class="header-left">
          <div class="brand-logo" @click="currentView = 'home'" style="cursor: pointer;" title="返回官方首页">
            <div class="logo-icon-box">
              <Sparkles size="15" class="brand-icon" />
            </div>
            <span class="brand-name">NiceMD</span>
            <span class="brand-pro-tag">Pro</span>
          </div>
          <button class="btn-menu-toggle" @click="toggleMobileSidebar" title="文档列表">
            <Menu size="18" />
          </button>
        </div>

        <!-- Center Floating Pill Toolbar (AI 润色 / 智能排版 / 插入图片 / 生成封面 / 更多工具) -->
        <div class="header-center">
          <div class="header-capsule-bar">
            <button class="capsule-btn is-ai" @click="handleAiPolish" title="AI 智能润色与优化">
              <Sparkles size="14" class="capsule-icon ai-sparkle-icon" />
              <span>AI 润色</span>
            </button>
            <button class="capsule-btn" @click="handleAutoFormat" title="智能中英文排版与规范">
              <Wand2 size="14" class="capsule-icon" />
              <span>智能排版</span>
            </button>
            <button class="capsule-btn" @click="editorPanelRef?.handleImageUpload()" title="插入图片">
              <Image size="14" class="capsule-icon" />
              <span>插入图片</span>
            </button>
            <button class="capsule-btn" @click="handleCoverGenerate" title="生成与更换文章封面">
              <Palette size="14" class="capsule-icon" />
              <span>生成封面</span>
            </button>

            <!-- More Tools Dropdown -->
            <div class="capsule-dropdown-wrapper">
              <button class="capsule-btn" :class="{ 'is-active': showMoreTools }" @click="showMoreTools = !showMoreTools" title="更多常用工具">
                <LayoutGrid size="14" class="capsule-icon" />
                <span>更多工具</span>
              </button>
              <div class="header-popout-panel capsule-popout" v-if="showMoreTools" @mouseleave="showMoreTools = false">
                <button class="popout-item" @click="editorPanelRef?.openFindReplace(); showMoreTools = false">
                  <Search size="14" />
                  <span>查找与替换</span>
                </button>
                <button class="popout-item" @click="editorPanelRef?.toggleUrlImport(); showMoreTools = false">
                  <Link size="14" />
                  <span>URL 文章抓取导入</span>
                </button>
                <button class="popout-item" @click="editorPanelRef?.insertSample(); showMoreTools = false">
                  <HelpCircle size="14" />
                  <span>插入示例模板</span>
                </button>
                <button class="popout-item" @click="editorPanelRef?.clearContent(); showMoreTools = false">
                  <Trash2 size="14" />
                  <span>清空编辑器内容</span>
                </button>
                <button class="popout-item" @click="openSettings(); showMoreTools = false">
                  <Settings size="14" />
                  <span>系统偏好设置</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Publish Button moved next to the capsule bar -->
          <button class="btn-header-publish" @click="openLaunchpad" title="一键多渠道分发发布">
            <Send size="13" class="publish-send-icon" />
            <span>发布</span>
          </button>

          <!-- Segmented View Switcher on Mobile/Tablet -->
          <div class="mobile-view-tabs">
            <button 
              class="tab-view-btn" 
              :class="{ 'is-active': mobileActiveView === 'editor' }" 
              @click="mobileActiveView = 'editor'"
            >
              编辑
            </button>
            <button 
              class="tab-view-btn" 
              :class="{ 'is-active': mobileActiveView === 'preview' }" 
              @click="mobileActiveView = 'preview'"
            >
              预览
            </button>
          </div>
        </div>

        <!-- Right Header Area -->
        <div class="header-right"></div>
      </header>

      <!-- App Body: Left IconBar + Main Content -->
      <div class="app-body">
        <div class="app-left">
          <IconBar
            :sidebarVisible="sidebarVisible"
            :currentView="currentView"
            @toggle-tab="(tab) => {
              if (tab === 'home') { currentView = 'home'; }
              if (tab === 'docs') {
                if (currentView !== 'editor') currentView = 'editor';
                else sidebarVisible = !sidebarVisible;
              }
              if (tab === 'templates') { currentView = 'templates'; }
              if (tab === 'materials') { currentView = 'materials'; }
              if (tab === 'settings') isSettingsOpen = true;
              if (tab === 'launch') isLaunchpadOpen = true;
              if (tab === 'theme') toggleColorMode();
            }"
          />
        </div>

        <main class="app-main">
          <!-- Sidebar Backdrop on Mobile -->
          <div v-if="mobileSidebarOpen" class="sidebar-backdrop" @click="mobileSidebarOpen = false"></div>

          <Sidebar
            ref="sidebarRef"
            :class="{ 'mobile-drawer-open': mobileSidebarOpen }"
            v-if="(sidebarVisible || mobileSidebarOpen) && currentView === 'editor'"
            :documents="documents"
            :groups="groups"
            :activeDocId="activeDocId"
            :currentView="currentView"
            @select-doc="(id) => { handleSelectDoc(id); currentView = 'editor'; mobileSidebarOpen = false; }"
            @create-doc="(groupId) => { handleCreateDoc(groupId); currentView = 'editor'; }"
            @open-templates="currentView = 'templates'"
            @open-materials="currentView = 'materials'"
            @rename-doc="handleRenameDoc"
            @delete-doc="handleDeleteDoc"
            @create-group="handleCreateGroup"
            @rename-group="handleRenameGroup"
            @delete-group="handleDeleteGroup"
            @move-doc="handleMoveDoc"
            @reorder-docs="handleReorderDocs"
            @reorder-groups="handleReorderGroups"
          />

          <!-- 1. 模板中心 -->
          <TemplateCenter
            v-if="currentView === 'templates'"
            @apply-theme="handleApplyTheme"
            @back-to-editor="currentView = 'editor'"
          />

          <!-- 2. 素材中心 -->
          <MaterialCenter
            v-else-if="currentView === 'materials'"
            @insert-material="handleInsertMaterial"
            @apply-background="handleApplyBackground"
            @back-to-editor="currentView = 'editor'"
          />

          <!-- 3. 编辑与排版双栏工作台 -->
          <div v-else class="workspace-grid" :class="[`active-view-${mobileActiveView}`, { 'preview-hidden': !previewVisible, 'theme-panel-open': showThemePanel }]">
          <!-- Top Toolbar: editor-header spanning 100% width across the top of both columns -->
          <div class="editor-header workspace-toolbar">
            <div class="header-actions">
              <!-- Current Active Document Title with Double-Click Inline Rename -->
              <div
                class="toolbar-doc-title-box"
                :class="{ 'is-editing': isRenamingToolbarDoc }"
                title="双击重命名文档"
                @dblclick.stop="startRenameToolbarDoc"
              >
                <FileText size="14" class="toolbar-doc-icon" />
                <span
                  v-if="!isRenamingToolbarDoc"
                  class="toolbar-doc-name"
                >
                  {{ activeDocument?.title || '未命名文档' }}
                </span>
                <Pencil v-if="!isRenamingToolbarDoc" size="11" class="toolbar-doc-edit-hint" />
                <input
                  v-else
                  ref="toolbarDocInputRef"
                  v-model="toolbarDocRenameValue"
                  class="toolbar-doc-input"
                  placeholder="输入文档名称"
                  @blur="confirmRenameToolbarDoc"
                  @keyup.enter="confirmRenameToolbarDoc"
                  @keyup.escape="cancelRenameToolbarDoc"
                  @click.stop
                />
              </div>

              <span class="toolbar-sep"></span>

              <button @click="editorPanelRef?.openFindReplace()" class="btn-icon" title="查找替换"><Search size="15" /></button>
              <button @click="editorPanelRef?.handleImageUpload()" class="btn-icon" title="图片"><Image size="15" /></button>
              <span class="toolbar-sep"></span>
              <button @click="editorPanelRef?.insertSample()" class="btn-icon" title="模板"><HelpCircle size="15" /></button>
              <button @click="editorPanelRef?.toggleUrlImport()" class="btn-icon" title="URL 导入"><Link size="15" /></button>
              <div class="export-trigger-container">
                <button @click="showImportMenu = !showImportMenu" class="btn-icon" :class="{ 'is-active': showImportMenu }" title="导入文件"><Upload size="15" /></button>
                <div class="header-popout-panel" v-if="showImportMenu" @mouseleave="showImportMenu = false">
                  <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.md,.markdown'); showImportMenu = false"><FileCode size="14" /><span>Markdown (.md)</span></button>
                  <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.docx,.doc'); showImportMenu = false"><FileText size="14" /><span>Word (.docx)</span></button>
                  <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.html,.htm'); showImportMenu = false"><Globe size="14" /><span>HTML (.html)</span></button>
                  <button class="popout-item" @click="editorPanelRef?.triggerFileInput('.txt'); showImportMenu = false"><FileCode size="14" /><span>纯文本 (.txt)</span></button>
                </div>
              </div>
              <button @click="editorPanelRef?.clearContent()" class="btn-icon btn-danger" title="清空"><Trash2 size="15" /></button>
              <span class="toolbar-sep"></span>

              <!-- Export Trigger -->
              <div class="export-trigger-container">
                <button class="btn-icon" @click="showExportMenu = !showExportMenu" title="导出"><Download size="15" /></button>
                <div class="header-popout-panel" v-if="showExportMenu" @mouseleave="showExportMenu = false">
                  <button class="popout-item" @click="exportMD(); showExportMenu = false"><FileCode size="14" /><span>Markdown</span></button>
                  <button class="popout-item" @click="exportHTML(); showExportMenu = false"><Globe size="14" /><span>HTML</span></button>
                  <button class="popout-item" @click="exportWord(); showExportMenu = false"><FileText size="14" /><span>Word (.docx)</span></button>
                  <button class="popout-item" @click="exportPDF(); showExportMenu = false"><Download size="14" /><span>PDF</span></button>
                  <button class="popout-item" @click="exportPDF({ raw: true }); showExportMenu = false"><Download size="14" /><span>PDF (无主题)</span></button>
                  <button class="popout-item" @click="exportPNG(); showExportMenu = false"><Image size="14" /><span>PNG 长图</span></button>
                </div>
              </div>
              <button @click="editorPanelRef?.handleUndo()" class="btn-icon" title="撤销"><Undo2 size="15" /></button>
              <button @click="editorPanelRef?.handleRedo()" class="btn-icon" title="重做"><Redo2 size="15" /></button>

              <span class="toolbar-sep"></span>
              <button @click="toggleSyncScroll" class="btn-icon" :class="{ 'is-active': syncScrollEnabled }" title="同步滚动"><Link2 v-if="syncScrollEnabled" size="15" /><Link2Off v-else size="15" /></button>
              <button @click="togglePreview" class="btn-icon" :class="{ 'is-active': previewVisible }" title="预览"><Eye v-if="previewVisible" size="15" /><EyeOff v-else size="15" /></button>

              <!-- Spacer pushing Theme & Code style dropdowns to the far right -->
              <span class="toolbar-spacer"></span>

              <!-- Document Theme Dropdown -->
              <div class="export-trigger-container">
                <button
                  class="btn-toolbar-dropdown"
                  :class="{ 'is-active': showDocThemeMenu }"
                  @click="showDocThemeMenu = !showDocThemeMenu; showCodeThemeMenu = false"
                  title="排版主题"
                >
                  <Palette size="13" />
                  <span>{{ activeThemeObj?.name || '山海' }}</span>
                  <ChevronDown size="11" />
                </button>
                <div class="header-popout-panel" v-if="showDocThemeMenu" @mouseleave="showDocThemeMenu = false">
                  <button
                    v-for="t in themePresets"
                    :key="t.id"
                    class="popout-item"
                    :class="{ 'is-active': t.id === currentTheme }"
                    @click="changeTheme(t.id); showDocThemeMenu = false"
                  >
                    <span>{{ t.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Code Theme Dropdown -->
              <div class="export-trigger-container">
                <button
                  class="btn-toolbar-dropdown"
                  :class="{ 'is-active': showCodeThemeMenu }"
                  @click="showCodeThemeMenu = !showCodeThemeMenu; showDocThemeMenu = false"
                  title="代码高亮主题"
                >
                  <Code2 size="13" />
                  <span>代码: {{ activeCodeThemeObj?.name || 'Atom One Dark' }}</span>
                  <ChevronDown size="11" />
                </button>
                <div class="header-popout-panel" v-if="showCodeThemeMenu" @mouseleave="showCodeThemeMenu = false">
                  <button
                    v-for="ct in codeThemes"
                    :key="ct.id"
                    class="popout-item"
                    :class="{ 'is-active': ct.id === currentCodeTheme }"
                    @click="handleCodeThemeSelect(ct.id)"
                  >
                    <span>{{ ct.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Split Workspace Columns below Toolbar -->
          <div class="workspace-columns">
            <div class="workspace-column editor-column" @click="handleEditorClick">
              <EditorPanel
                ref="editorPanelRef"
                v-model="markdownContent"
                :docTitle="activeDocument?.title ?? '未命名文档'"
                :scrollPercentage="scrollPercentage"
                :activePane="activeScrollPane"
                :syncScrollEnabled="syncScrollEnabled"
                :previewVisible="previewVisible"
                @import="handleImport"
                @scroll="handleScroll"
                @focusActive="handleFocusActive"
                @editor-click="handleEditorClick"
                @toggleSyncScroll="toggleSyncScroll"
                @togglePreview="togglePreview"
              />
            </div>
            <div class="workspace-column preview-column">
              <PreviewPanel
                :markdown="markdownContent"
                :docTitle="activeDocument?.title ?? '未命名文档'"
                :themeId="currentTheme"
                :scrollPercentage="scrollPercentage"
                :activePane="activeScrollPane"
                :previewVisible="previewVisible"
                :customStyles="customStyles"
                :themePanelVisible="showThemePanel"
                @update:customStyles="customStyles = $event"
                @save-theme="handleSaveTheme"
                @update:themePanelVisible="showThemePanel = $event"
                :codeThemeId="currentCodeTheme"
                @update:codeThemeId="handleCodeThemeChangeFromPreview"
                @scroll="handleScroll"
                @focusActive="handleFocusActive"
                @togglePreview="togglePreview"
                @open-launchpad="openLaunchpad"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>

    <!-- Launchpad Modal -->
    <LaunchpadModal
      :isOpen="isLaunchpadOpen"
      :articleTitle="activeDocument?.title || ''"
      :markdown="markdownContent"
      :html="getCompiledHtml()"
      :themeId="currentTheme"
      :codeThemeId="currentCodeTheme"
      @close="closeLaunchpad"
    />

    <!-- Settings Modal -->
    <SettingsModal
      :isOpen="isSettingsOpen"
      @close="isSettingsOpen = false"
    />

    <!-- Global Confirm Dialog -->
    <ConfirmDialog />

    <!-- AI Polish Interactive Modal -->
    <Teleport to="body">
      <div v-if="showAiModal" class="ai-polish-modal-backdrop" @click="showAiModal = false">
        <div class="ai-polish-card" @click.stop>
          <div class="ai-polish-header">
            <div class="ai-header-title-wrap">
              <div class="ai-header-icon-box">
                <Sparkles size="16" />
              </div>
              <div>
                <h3 class="ai-modal-title">AI 智能创作与润色</h3>
                <p class="ai-modal-sub">深度调优文章行文质感、逻辑结构与传播吸引力</p>
              </div>
            </div>
            <button class="ai-modal-close-btn" @click="showAiModal = false">
              <X size="16" />
            </button>
          </div>

          <div class="ai-presets-grid">
            <div class="ai-preset-item" @click="applyAiPolishPreset('文学与优雅润色')">
              <div class="ai-preset-emoji">✨</div>
              <div class="ai-preset-text">
                <div class="ai-preset-name">文学与优雅润色</div>
                <div class="ai-preset-desc">辞藻华丽升华，通顺优美，适合散文与深度好文</div>
              </div>
            </div>

            <div class="ai-preset-item" @click="applyAiPolishPreset('技术严谨与精炼')">
              <div class="ai-preset-emoji">⚡</div>
              <div class="ai-preset-text">
                <div class="ai-preset-name">技术严谨与精炼</div>
                <div class="ai-preset-desc">去芜存菁，结构紧凑，适合技术干货与架构分享</div>
              </div>
            </div>

            <div class="ai-preset-item" @click="applyAiPolishPreset('错别字与语病纠正')">
              <div class="ai-preset-emoji">🔍</div>
              <div class="ai-preset-text">
                <div class="ai-preset-name">错别字与语病纠正</div>
                <div class="ai-preset-desc">一键校对全文错别字、标点与语病，保持原意</div>
              </div>
            </div>

            <div class="ai-preset-item" @click="applyAiPolishPreset('生成 5 个爆款标题')">
              <div class="ai-preset-emoji">🔥</div>
              <div class="ai-preset-text">
                <div class="ai-preset-name">生成 5 个爆款标题</div>
                <div class="ai-preset-desc">结合微信公众号与知乎高赞逻辑，提高打开率</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Global App Floating Toast -->
    <Transition name="toast-fade">
      <div v-if="appToastText" class="app-floating-toast">
        <Sparkles size="14" class="toast-sparkle" />
        <span>{{ appToastText }}</span>
      </div>
    </Transition>
  </div>
</template>

<style>
/* ── Root layout: left (iconbar + sidebar) | right (header + main) ── */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: all 0.3s ease;
  overflow: hidden;
}

.app-container.is-standalone-home {
  height: 100vh;
  width: 100vw;
  display: block;
  overflow: hidden;
  background: #ffffff;
}

html.dark .app-container.is-standalone-home {
  background: #0a0a0a;
}

.app-header {
  height: 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-header);
  z-index: 10;
  flex-shrink: 0;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.logo-icon-box {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
}

.brand-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.brand-pro-tag {
  font-size: 11px;
  font-weight: 600;
  background: var(--accent-bg);
  color: var(--accent-color);
  border: 1px solid var(--border-color);
  padding: 2px 7px;
  border-radius: 6px;
  line-height: 1;
}

/* Center Floating Capsule Toolbar */
.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  position: relative;
}

.header-capsule-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-capsule);
  border-radius: 9999px;
  padding: 6px;
  box-shadow: var(--shadow-capsule);
  position: relative;
  user-select: none;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.capsule-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: none;
  background: transparent;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.capsule-btn:hover {
  background: var(--bg-capsule-btn-hover);
  color: var(--text-main);
}

.capsule-btn.is-ai {
  color: var(--accent-coral, #ff7a59);
  font-weight: 600;
}

.capsule-btn.is-ai:hover {
  background: rgba(255, 122, 89, 0.12);
  color: var(--accent-coral, #ff7a59);
}

.capsule-btn.is-ai .ai-sparkle-icon {
  color: var(--accent-coral, #ff7a59);
}

.capsule-btn .capsule-icon {
  flex-shrink: 0;
}

.capsule-dropdown-wrapper {
  position: relative;
}

.capsule-popout {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 170px;
  background: var(--bg-popover);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: var(--shadow-popover);
  padding: 6px;
  z-index: 1000;
  transition: background 0.3s ease, border-color 0.3s ease;
}

/* Right Header Area (placeholder for symmetry) */
.header-right {
  display: flex;
  align-items: center;
  min-width: 140px;
}

.btn-header-publish {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  border: none;
  border-radius: 9999px;
  background: linear-gradient(135deg, #ff6b4a 0%, #ff4b2b 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(255, 94, 54, 0.28);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  white-space: nowrap;
}

.btn-header-publish:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(255, 94, 54, 0.38);
  filter: brightness(1.05);
}

.btn-header-publish:active {
  transform: translateY(0);
}

.publish-send-icon {
  transform: rotate(-15deg);
}

/* AI Polish Modal Popup */
.ai-polish-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease;
}

.ai-polish-card {
  width: 500px;
  max-width: 90vw;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-modal);
  border: 1px solid var(--border-color);
  overflow: hidden;
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-polish-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
}

.ai-header-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-header-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 94, 54, 0.12);
  color: var(--accent-coral, #ff5e36);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.ai-modal-sub {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: var(--text-muted);
}

.ai-modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.ai-modal-close-btn:hover {
  background: var(--bg-capsule-btn-hover);
  color: var(--text-main);
}

.ai-presets-grid {
  padding: 16px 20px 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.ai-preset-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-app);
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-preset-item:hover {
  border-color: var(--accent-coral, #ff5e36);
  background: var(--bg-capsule-btn-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 94, 54, 0.12);
}

.ai-preset-emoji {
  font-size: 20px;
  flex-shrink: 0;
}

.ai-preset-text {
  flex: 1;
}

.ai-preset-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.ai-preset-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Floating Toast */
.app-floating-toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(12px);
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  z-index: 99999;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-sparkle {
  color: #fbbf24;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.app-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
}

.app-left {
  display: flex;
  flex-shrink: 0;
  height: 100%;
  min-width: 44px;
  background: var(--bg-app);
  border-right: 1px solid var(--border-color);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  color: var(--accent-color);
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.version-tag {
  font-size: 10px;
  font-weight: 700;
  background: var(--accent-bg);
  color: var(--accent-color);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 4px;
}

.header-selects {
  display: flex;
  gap: 8px;
}

.header-left-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-header-action {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
  min-width: 40px;
}

.btn-header-action span {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.02em;
}

.btn-header-action:hover {
  background: var(--accent-bg);
  color: var(--accent-color);
}

.btn-header-action.btn-danger {
  color: #ef4444;
}

.btn-header-action.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.btn-header-action.is-active {
  background: var(--accent-bg);
  color: var(--accent-color);
}

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
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 170px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
}

.export-trigger-container:hover .header-popout-panel {
  opacity: 1;
  visibility: visible;
}

.header-popout-panel .popout-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-main);
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
}

.header-popout-panel .popout-item:hover {
  background: var(--accent-bg);
  color: var(--accent-color);
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  display: inline-block;
}

.theme-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-color);
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--accent-bg);
  border: 1px solid var(--border-color);
  font-family: 'Outfit', sans-serif;
  display: inline-flex;
  align-items: center;
}

.header-select {
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 32px 6px 12px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234c566a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease;
}

.header-select:hover {
  border-color: var(--accent-color);
}

.export-dropdown {
  position: relative;
}

.export-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--bg-editor);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 100;
  min-width: 180px;
  animation: fadeIn 0.15s ease;
}

.export-menu button {
  background: transparent;
  border: none;
  color: var(--text-main);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
  font-family: 'Outfit', sans-serif;
}

.export-menu button:hover {
  background: var(--accent-bg);
  color: var(--accent-color);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-secondary-settings {
  background: var(--bg-editor);
  color: var(--text-main);
  border: 2px solid var(--border-color);
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-secondary-settings:hover {
  background: var(--border-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  color: var(--accent-color);
}

.btn-secondary-settings:active {
  transform: translateY(1px);
}

.app-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  gap: 0;
}

.workspace-grid {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  padding: 0;
  box-sizing: border-box;
}

.workspace-toolbar {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-toolbar);
  box-shadow: var(--shadow-toolbar);
  flex-shrink: 0;
  width: 100%;
  z-index: 10;
  box-sizing: border-box;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.header-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  width: 100%;
}

.toolbar-doc-title-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  max-width: 260px;
  min-width: 0;
  width: auto;
  flex-shrink: 0;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
}

.toolbar-doc-title-box:hover:not(.is-editing) {
  background: rgba(0, 0, 0, 0.04);
}

[data-color-mode="dark"] .toolbar-doc-title-box:hover:not(.is-editing) {
  background: rgba(255, 255, 255, 0.07);
}

.toolbar-doc-icon {
  color: var(--accent-color);
  opacity: 0.85;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.toolbar-doc-title-box:hover:not(.is-editing) .toolbar-doc-icon {
  opacity: 1;
  transform: scale(1.08);
}

.toolbar-doc-name {
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.toolbar-doc-edit-hint {
  color: var(--text-muted);
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: -2px;
}

.toolbar-doc-title-box:hover:not(.is-editing) .toolbar-doc-edit-hint {
  opacity: 0.55;
  transform: scale(1);
}

.toolbar-doc-title-box.is-editing {
  background: var(--bg-card);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(91, 108, 143, 0.15);
  padding: 2px 8px;
}

.toolbar-doc-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  background: transparent;
  border: none;
  padding: 1px 2px;
  outline: none;
  font-family: inherit;
}

.toolbar-sep {
  width: 1px;
  height: 16px;
  background: var(--border-color);
  display: inline-block;
  margin: 0 2px;
}

.toolbar-spacer {
  flex: 1;
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--text-muted);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  color: var(--accent-color);
  background: var(--accent-bg);
}

.btn-icon.is-active {
  color: var(--accent-color);
  background: var(--accent-bg);
}

.btn-icon.btn-danger {
  color: #ef4444;
}

.btn-icon.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.export-trigger-container {
  position: relative;
}

.header-popout-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.375rem;
  background: var(--glass-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  -webkit-backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  border: 1.5px solid var(--glass-border, rgba(255, 255, 255, 0.8));
  border-radius: 0.875rem;
  box-shadow: 
    0 1rem 2.5rem rgba(0, 0, 0, 0.1),
    0 0.125rem 0.5rem rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 200;
  min-width: 9.5rem;
  font-family: var(--font-sans);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.popout-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  border: none;
  background: transparent;
  color: var(--wandor-text, #1a1a1a);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.12s ease;
  width: 100%;
  text-align: left;
  font-family: var(--font-sans);
}

.popout-item:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--accent-color);
}

html.dark .popout-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.popout-item.is-active {
  background: rgba(0, 0, 0, 0.06);
  color: var(--accent-color);
  font-weight: 600;
}

html.dark .popout-item.is-active {
  background: rgba(255, 255, 255, 0.1);
}

.btn-toolbar-dropdown {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--wandor-text, #1a1a1a);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: var(--font-sans);
}

.btn-toolbar-dropdown:hover,
.btn-toolbar-dropdown.is-active {
  background: var(--accent-bg);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.workspace-columns {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
  height: calc(100% - 42px);
  width: 100%;
  overflow: hidden;
}

/* Ambient glow backdrop for the floating workspace cards */
.workspace-grid::before,
.workspace-grid::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
}
.workspace-grid::before {
  width: 340px; height: 340px;
  top: -120px; right: 12%;
  background: radial-gradient(circle, rgba(39,117,182,0.16), transparent 70%);
}
.workspace-grid::after {
  width: 300px; height: 300px;
  bottom: -110px; left: 8%;
  background: radial-gradient(circle, rgba(39,117,182,0.10), transparent 70%);
}

.workspace-column {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
}

.workspace-column.editor-column {
  border-right: 1px solid var(--border-color);
}

.workspace-grid.preview-hidden .workspace-columns {
  grid-template-columns: 1fr auto;
}

.workspace-grid.preview-hidden .workspace-column.editor-column {
  border-right: none;
}

.workspace-grid.theme-panel-open:not(.preview-hidden) .workspace-columns {
  grid-template-columns: calc(50% - 12rem) calc(50% + 12rem);
}

.workspace-grid.theme-panel-open.preview-hidden .workspace-columns {
  grid-template-columns: 1fr auto;
}

.workspace-grid.theme-panel-open .preview-column {
  min-width: 0;
}

/* Mobile menu and view tabs */
.btn-menu-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-main);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-menu-toggle:hover {
  background: var(--border-color);
}

.mobile-view-tabs {
  display: none;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  padding: 2px;
  border-radius: 8px;
  gap: 2px;
}

.tab-view-btn {
  background: transparent;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-view-btn.is-active {
  background: var(--bg-editor);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
}

.btn-header-settings {
  display: none;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 99;
}

.btn-menu-toggle {
  display: none;
}

.mobile-view-tabs {
  display: none;
}

@media (max-width: 960px) {
  .app-left {
    display: none;
  }
  
  .header-capsule-bar,
  .btn-header-publish {
    display: none;
  }
  
  .btn-menu-toggle {
    display: flex;
  }
  
  .btn-header-settings {
    display: flex;
  }
  
  .mobile-view-tabs {
    display: flex;
  }
  
  .app-header {
    padding: 0 12px;
    height: 4rem;
  }
  
  .header-selects {
    display: none;
  }
  
  /* Sidebar as floating mobile drawer */
  .sidebar-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: 280px !important;
    height: 100% !important;
    z-index: 100 !important;
    background: var(--bg-editor) !important;
    box-shadow: var(--shadow-lg) !important;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  
  .sidebar-container.mobile-drawer-open {
    transform: translateX(0);
  }
  
  .workspace-grid {
    grid-template-columns: 1fr !important;
    height: 100% !important;
  }
  
  .workspace-column {
    height: 100% !important;
  }
  
  /* Segmented switcher logic */
  .workspace-grid.active-view-editor .preview-column {
    display: none !important;
  }
  
  .workspace-grid.active-view-preview .editor-column {
    display: none !important;
  }

}
</style>
