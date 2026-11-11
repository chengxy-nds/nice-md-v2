export const EDITOR_FONT_SIZE_STORAGE_KEY = 'nicemd_font_size';
export const EDITOR_FONT_FAMILY_STORAGE_KEY = 'nicemd_editor_font_family';
export const EDITOR_SYNC_SCROLL_STORAGE_KEY = 'nicemd_sync_scroll';
export const EDITOR_SETTINGS_UPDATED_EVENT = 'nicemd-settings-updated';

export const DEFAULT_EDITOR_FONT_SIZE_NUM = 14;
export const DEFAULT_EDITOR_FONT_SIZE = `${DEFAULT_EDITOR_FONT_SIZE_NUM}px`;
export const MIN_EDITOR_FONT_SIZE = 10;
export const MAX_EDITOR_FONT_SIZE = 36;
export const DEFAULT_EDITOR_FONT_FAMILY_KEY = 'iawriter';

const DEFAULT_LINE_HEIGHT = '1.72';
const DEFAULT_LETTER_SPACING = 'normal';
const DEFAULT_FONT_FEATURE_SETTINGS = 'normal';

export const EDITOR_FONT_OPTIONS = [
  {
    value: 'iawriter',
    label: '极客等宽 · IBM Plex + 苹方/思源黑 (推荐)',
    fontFamily: '"IBM Plex Mono", "JetBrains Mono", "PingFang SC", "HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", monospace',
    lineHeight: '1.9',
    letterSpacing: '0.02em',
    fontFeatureSettings: DEFAULT_FONT_FEATURE_SETTINGS,
    stylesheets: [
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Noto+Sans+SC:wght@400;500&display=swap'
    ]
  },
  {
    value: 'system',
    label: '经典系统无衬线',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    lineHeight: DEFAULT_LINE_HEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
    fontFeatureSettings: DEFAULT_FONT_FEATURE_SETTINGS,
    stylesheets: []
  },
  {
    value: 'lxgw',
    label: '霞鹜文楷手写 · Lora + WenKai',
    fontFamily: '"Lora", "LXGW WenKai Screen", "LXGW WenKai", "Kaiti SC", STKaiti, KaiTi, serif',
    lineHeight: '1.95',
    letterSpacing: '0.03em',
    fontFeatureSettings: DEFAULT_FONT_FEATURE_SETTINGS,
    stylesheets: [
      'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap',
      'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.1.0/style.css'
    ]
  },
  {
    value: 'serif',
    label: '出版级衬线 · Newsreader + 思源宋体',
    fontFamily: '"Newsreader", "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, SimSun, serif',
    lineHeight: '2.0',
    letterSpacing: '0.025em',
    fontFeatureSettings: DEFAULT_FONT_FEATURE_SETTINGS,
    stylesheets: [
      'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Noto+Serif+SC:wght@400;600&display=swap'
    ]
  },
  {
    value: 'modern',
    label: '现代无衬线 · Inter + 苹方/鸿蒙',
    fontFamily: '"Inter", -apple-system, "PingFang SC", "HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
    lineHeight: '1.85',
    letterSpacing: '0.015em',
    fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
    stylesheets: [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500&display=swap'
    ]
  },
  {
    value: 'monospace',
    label: '编程等宽 · JetBrains Mono / Consolas',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Microsoft YaHei', monospace",
    lineHeight: DEFAULT_LINE_HEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
    fontFeatureSettings: DEFAULT_FONT_FEATURE_SETTINGS,
    stylesheets: []
  },
  {
    value: 'pingfang',
    label: '纯净黑体 · 苹方 / 微软雅黑',
    fontFamily: "'PingFang SC', 'Noto Sans SC', 'Source Han Sans SC', 'Microsoft YaHei', sans-serif",
    lineHeight: DEFAULT_LINE_HEIGHT,
    letterSpacing: DEFAULT_LETTER_SPACING,
    fontFeatureSettings: DEFAULT_FONT_FEATURE_SETTINGS,
    stylesheets: []
  }
];

function getDefaultEditorFontOption() {
  return EDITOR_FONT_OPTIONS.find(opt => opt.value === DEFAULT_EDITOR_FONT_FAMILY_KEY) || EDITOR_FONT_OPTIONS[0];
}

export function clampEditorFontSizeNumber(num) {
  if (!Number.isFinite(num)) return DEFAULT_EDITOR_FONT_SIZE_NUM;
  const clamped = Math.min(MAX_EDITOR_FONT_SIZE, Math.max(MIN_EDITOR_FONT_SIZE, num));
  return Number(clamped.toFixed(2));
}

export function parseEditorFontSizeNumber(raw) {
  if (typeof raw === 'number') {
    return clampEditorFontSizeNumber(raw);
  }
  const parsed = parseFloat(String(raw ?? '').trim());
  return clampEditorFontSizeNumber(parsed);
}

export function formatEditorFontSizeNumber(raw) {
  return String(parseEditorFontSizeNumber(raw));
}

export function normalizeEditorFontSize(raw) {
  return `${formatEditorFontSizeNumber(raw)}px`;
}

export function resolveEditorFontOption(raw) {
  const key = typeof raw === 'string' ? raw.trim() : '';
  return EDITOR_FONT_OPTIONS.find(opt => opt.value === key) || getDefaultEditorFontOption();
}

export function resolveEditorFontFamilyKey(raw) {
  const key = typeof raw === 'string' ? raw.trim() : '';
  if (!key) return DEFAULT_EDITOR_FONT_FAMILY_KEY;
  return EDITOR_FONT_OPTIONS.some(opt => opt.value === key)
    ? key
    : DEFAULT_EDITOR_FONT_FAMILY_KEY;
}

export function resolveEditorFontFamily(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  const matched = EDITOR_FONT_OPTIONS.find(opt => opt.value === value);
  if (matched) return matched.fontFamily;
  if (value) return value;
  return getDefaultEditorFontOption().fontFamily;
}

export function ensureEditorFontLoaded(fontOptionOrKey) {
  if (typeof document === 'undefined' || !document.head) return;
  const option = typeof fontOptionOrKey === 'string'
    ? resolveEditorFontOption(fontOptionOrKey)
    : (fontOptionOrKey || getDefaultEditorFontOption());
  const sheets = option?.stylesheets || [];
  for (const href of sheets) {
    if (!href) continue;
    const escapedHref = href.replace(/"/g, '\\"');
    if (document.head.querySelector(`link[rel="stylesheet"][href="${escapedHref}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.nicemdEditorFont = option.value;
    document.head.appendChild(link);
  }
}

export function loadEditorPreferences() {
  let rawSize = null;
  let rawFamily = null;
  try {
    rawSize = localStorage.getItem(EDITOR_FONT_SIZE_STORAGE_KEY);
    rawFamily = localStorage.getItem(EDITOR_FONT_FAMILY_STORAGE_KEY);
  } catch {
    // Ignore storage read errors in restricted environments
  }

  const fontSizeNumber = rawSize ? parseEditorFontSizeNumber(rawSize) : DEFAULT_EDITOR_FONT_SIZE_NUM;
  const fontSize = `${fontSizeNumber}px`;
  const fontFamilyKey = resolveEditorFontFamilyKey(rawFamily);
  const option = resolveEditorFontOption(fontFamilyKey);
  const rawOrKey = rawFamily && rawFamily.trim() ? rawFamily.trim() : fontFamilyKey;

  ensureEditorFontLoaded(option);

  return {
    fontSize,
    fontSizeNumber,
    fontFamilyKey,
    fontFamily: resolveEditorFontFamily(rawOrKey),
    lineHeight: option.lineHeight || DEFAULT_LINE_HEIGHT,
    letterSpacing: option.letterSpacing || DEFAULT_LETTER_SPACING,
    fontFeatureSettings: option.fontFeatureSettings || DEFAULT_FONT_FEATURE_SETTINGS
  };
}

export function loadSyncScrollPreference() {
  try {
    return localStorage.getItem(EDITOR_SYNC_SCROLL_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}
