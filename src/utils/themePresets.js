export const themes = [
  {
    id: 'classic-indigo',
    name: '山海 · 经典',
    icon: 'BookOpen',
    dark: false,
    description: '经典山海主题,米白纸面 + 藏蓝强调,适合公众号深度长文。',
    tag: '默认 · 经典',
    styles: {
      '--bg-app': '#fcfcfc',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#fdfdfd',
      '--text-main': '#2b2b2b',
      '--text-muted': '#595959',
      '--border-color': '#e1e4e8',
      '--accent-color': '#2775b6',
      '--accent-hover': '#1e5d93',
      '--accent-bg': 'rgba(39, 117, 182, 0.05)',
      '--code-bg': 'rgba(27, 31, 35, 0.05)',
      '--code-text': '#bb2243',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    },
    previewTexture: {
      bgImage: 'linear-gradient(90deg, rgba(39, 117, 182, 0.015) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(39, 117, 182, 0.02) 0%, rgba(255, 255, 255, 0) 12.16%)',
      bgSize: '20px 20px, 20px 20px'
    },
    typography: {
      h1: { variant: 'pill', size: '1.25em', weight: 700, align: 'center', bg: '#2775b6', color: '#ffffff', radius: '9999px', padding: '6px 24px', letterSpacing: '0.02em', marginTop: '1.6em', marginBottom: '1.2em' },
      h2: { variant: 'bar', size: '1.35em', weight: 700, borderColor: '#2775b6', padding: '0.3em 0.6em', letterSpacing: '-0.2px' },
      h3: { variant: 'icon', size: '18px', weight: 700, color: '#2b2b2b', iconUrl: 'https://files.mdnice.com/mountain_2.png', iconSize: '30px', iconMarginBottom: '8px', textMarginTop: '30px', lineHeight: '2.4em', marginTop: '15px', marginBottom: '15px', letterSpacing: '0em' },
      p: { size: '16px', lineHeight: 2, letterSpacing: '0.08em', color: '#0d0d0d' },
      strong: { color: '#2775b6', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#2775b6', bg: 'var(--accent-bg)', radius: '0 8px 8px 0', padding: '14px 22px' },
      code: { bg: 'var(--code-bg)', color: 'var(--code-text)', radius: '4px', padding: '2px 4px', size: '0.9em' },
      a: { color: '#2775b6' },
      table: { headerBg: 'var(--accent-bg)', borderColor: 'var(--border-color)', radius: '8px' },
      hr: { variant: 'solid', color: 'var(--border-color)' }
    }
  },
  {
    id: 'mountain-warm',
    name: '山海 · 暖沙',
    icon: 'Sun',
    dark: false,
    description: '暖沙米黄纸面 + 暖棕强调,温润耐读,适合随笔与生活分享。',
    tag: '温润 · 暖棕',
    styles: {
      '--bg-app': '#fdfbf7',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#fefcf8',
      '--text-main': '#3d3229',
      '--text-muted': '#786858',
      '--border-color': '#eae3d9',
      '--accent-color': '#965829',
      '--accent-hover': '#7a451e',
      '--accent-bg': 'rgba(150, 88, 41, 0.06)',
      '--code-bg': 'rgba(150, 88, 41, 0.08)',
      '--code-text': '#965829',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    },
    typography: {
      h1: { variant: 'pill', size: '1.25em', weight: 700, align: 'center', bg: '#965829', color: '#ffffff', radius: '9999px', padding: '6px 24px', marginTop: '1.6em', marginBottom: '1.2em' },
      h2: { variant: 'bar', size: '1.35em', weight: 700, borderColor: '#965829', padding: '0.3em 0.6em' },
      h3: { variant: 'simple', size: '18px', weight: 700, color: '#965829' },
      p: { size: '16px', lineHeight: 2, color: '#3d3229' },
      strong: { color: '#965829', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#965829', bg: 'var(--accent-bg)', radius: '0 8px 8px 0', padding: '14px 22px' }
    }
  },
  {
    id: 'mountain-forest',
    name: '山海 · 墨绿',
    icon: 'Feather',
    dark: false,
    description: '米白纸面 + 墨绿强调,自然清爽,适合生活与自然主题内容。',
    tag: '自然 · 墨绿',
    styles: {
      '--bg-app': '#f7fbf9',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#fbfdfc',
      '--text-main': '#1b382b',
      '--text-muted': '#4d6e5f',
      '--border-color': '#d9e8e0',
      '--accent-color': '#0d6848',
      '--accent-hover': '#094d35',
      '--accent-bg': 'rgba(13, 104, 72, 0.06)',
      '--code-bg': 'rgba(13, 104, 72, 0.08)',
      '--code-text': '#0d6848',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    },
    typography: {
      h1: { variant: 'pill', size: '1.25em', weight: 700, align: 'center', bg: '#0d6848', color: '#ffffff', radius: '9999px', padding: '6px 24px', marginTop: '1.6em', marginBottom: '1.2em' },
      h2: { variant: 'bar', size: '1.35em', weight: 700, borderColor: '#0d6848', padding: '0.3em 0.6em' },
      h3: { variant: 'simple', size: '18px', weight: 700, color: '#0d6848' },
      p: { size: '16px', lineHeight: 2, color: '#1b382b' },
      strong: { color: '#0d6848', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#0d6848', bg: 'var(--accent-bg)', radius: '0 8px 8px 0', padding: '14px 22px' }
    }
  },
  {
    id: '135-morandi',
    name: '莫兰迪 · 雅致',
    icon: 'Sparkles',
    dark: false,
    description: '低饱和度雅致色彩，高级内敛，适合情感、生活美学与文艺短文。',
    tag: '精选 · 莫兰迪',
    styles: {
      '--bg-app': '#f8f8f6',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#fafafa',
      '--text-main': '#3a3a3a',
      '--text-muted': '#777777',
      '--border-color': '#e2e2de',
      '--accent-color': '#8a9a86',
      '--accent-hover': '#6f7e6b',
      '--accent-bg': 'rgba(138, 154, 134, 0.08)',
      '--code-bg': 'rgba(138, 154, 134, 0.1)',
      '--code-text': '#52634f',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    },
    typography: {
      h1: { variant: 'pill', size: '1.2em', weight: 700, align: 'center', bg: '#8a9a86', color: '#ffffff', radius: '9999px', padding: '6px 22px', marginTop: '1.6em', marginBottom: '1.2em' },
      h2: { variant: 'bar', size: '1.3em', weight: 700, borderColor: '#8a9a86', padding: '0.3em 0.6em' },
      h3: { variant: 'simple', size: '17px', weight: 700, color: '#6f7e6b' },
      p: { size: '15.5px', lineHeight: 1.9, color: '#3a3a3a' },
      strong: { color: '#6f7e6b', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#8a9a86', bg: 'var(--accent-bg)', radius: '0 6px 6px 0', padding: '12px 18px' }
    }
  },
  {
    id: '135-guofeng',
    name: '国风古韵 · 朱砂',
    icon: 'Compass',
    dark: false,
    description: '国风朱红与水墨古韵，浓郁文人气息，适合诗词古风与文旅故事。',
    tag: '精选 · 国风',
    styles: {
      '--bg-app': '#fcf8f2',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#fdfbf7',
      '--text-main': '#2d2621',
      '--text-muted': '#6b5e54',
      '--border-color': '#ebdcd0',
      '--accent-color': '#a62b2b',
      '--accent-hover': '#821d1d',
      '--accent-bg': 'rgba(166, 43, 43, 0.06)',
      '--code-bg': 'rgba(166, 43, 43, 0.08)',
      '--code-text': '#a62b2b',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.02)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.04)'
    },
    typography: {
      h1: { variant: 'pill', size: '1.2em', weight: 700, align: 'center', bg: '#a62b2b', color: '#ffffff', radius: '9999px', padding: '6px 22px', marginTop: '1.6em', marginBottom: '1.2em' },
      h2: { variant: 'bar', size: '1.3em', weight: 700, borderColor: '#a62b2b', padding: '0.3em 0.6em' },
      h3: { variant: 'simple', size: '17px', weight: 700, color: '#a62b2b' },
      p: { size: '16px', lineHeight: 2, color: '#2d2621' },
      strong: { color: '#a62b2b', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#a62b2b', bg: 'var(--accent-bg)', radius: '0 6px 6px 0', padding: '12px 18px' }
    }
  },
  {
    id: 'typora-github',
    name: 'Typora · GitHub',
    icon: 'Code',
    dark: false,
    description: 'GitHub 经典极简风,纯白纸面 + 蓝绿强调,代码与表格排版清晰。',
    tag: 'Typora · 浅色',
    styles: {
      '--bg-app': '#f6f8fa',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#ffffff',
      '--text-main': '#24292e',
      '--text-muted': '#586069',
      '--border-color': '#e1e4e8',
      '--accent-color': '#0366d6',
      '--accent-hover': '#0056b3',
      '--accent-bg': 'rgba(3, 102, 214, 0.05)',
      '--code-bg': 'rgba(27, 31, 35, 0.05)',
      '--code-text': '#d73a49',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.05)',
      '--shadow-md': '0 4px 12px rgba(0,0,0,0.08)'
    },
    typography: {
      h1: { variant: 'simple', size: '1.6em', weight: 700, color: '#24292e' },
      h2: { variant: 'simple', size: '1.35em', weight: 700, color: '#24292e' },
      h3: { variant: 'simple', size: '18px', weight: 600, color: '#24292e' },
      p: { size: '15px', lineHeight: 1.7, color: '#24292e' },
      strong: { color: '#0366d6', weight: 600 },
      blockquote: { variant: 'bar', borderColor: '#dfe2e5', bg: '#f6f8fa', radius: '0 4px 4px 0', padding: '10px 16px' }
    }
  },
  {
    id: 'typora-vue',
    name: 'Typora · Vue 翠绿',
    icon: 'Layers',
    dark: false,
    description: 'Vue 官方文档风,纯白纸面 + 清新翠绿强调,轻快现代适合技术分享。',
    tag: 'Typora · 绿',
    styles: {
      '--bg-app': '#f4f9f6',
      '--bg-editor': '#ffffff',
      '--bg-preview': '#ffffff',
      '--text-main': '#2c3e50',
      '--text-muted': '#6a8bad',
      '--border-color': '#eaecef',
      '--accent-color': '#42b983',
      '--accent-hover': '#33a06f',
      '--accent-bg': 'rgba(66, 185, 131, 0.08)',
      '--code-bg': '#f8f8f8',
      '--code-text': '#e96900',
      '--shadow-sm': '0 1px 3px rgba(0,0,0,0.05)',
      '--shadow-md': '0 4px 12px rgba(0,0,0,0.08)'
    },
    typography: {
      h1: { variant: 'simple', size: '1.6em', weight: 700, color: '#2c3e50' },
      h2: { variant: 'bar', size: '1.35em', weight: 700, borderColor: '#42b983', padding: '0.2em 0.5em' },
      h3: { variant: 'simple', size: '18px', weight: 600, color: '#2c3e50' },
      p: { size: '15px', lineHeight: 1.75, color: '#2c3e50' },
      strong: { color: '#42b983', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#42b983', bg: 'var(--accent-bg)', radius: '0 4px 4px 0', padding: '10px 16px' }
    }
  },
  {
    id: 'typora-dark',
    name: 'Typora · 深色夜间',
    icon: 'Moon',
    dark: true,
    description: '深色护眼风,暗色纸面 + 柔和高亮,适合夜间长时间写作与炫酷技术贴。',
    tag: 'Typora · 深色',
    styles: {
      '--bg-app': '#181a1f',
      '--bg-editor': '#21252b',
      '--bg-preview': '#21252b',
      '--text-main': '#abb2bf',
      '--text-muted': '#5c6370',
      '--border-color': '#3e4451',
      '--accent-color': '#61afef',
      '--accent-hover': '#4fa0e0',
      '--accent-bg': 'rgba(97, 175, 239, 0.1)',
      '--code-bg': '#282c34',
      '--code-text': '#e06c75',
      '--shadow-sm': '0 2px 8px rgba(0,0,0,0.2)',
      '--shadow-md': '0 8px 24px rgba(0,0,0,0.3)'
    },
    typography: {
      h1: { variant: 'pill', size: '1.6em', weight: 700, align: 'center', bg: '#61afef', color: '#181a1f', radius: '6px', padding: '8px 20px' },
      h2: { variant: 'bar', size: '1.35em', weight: 700, borderColor: '#61afef', padding: '0.3em 0.6em' },
      h3: { variant: 'simple', size: '18px', weight: 600, color: '#61afef' },
      p: { size: '15px', lineHeight: 1.8, color: '#abb2bf' },
      strong: { color: '#61afef', weight: 700 },
      blockquote: { variant: 'bar', borderColor: '#61afef', bg: 'rgba(97, 175, 239, 0.1)', radius: '0 6px 6px 0', padding: '12px 18px' }
    }
  }
];

// Load any saved custom themes on initialization
try {
  if (typeof localStorage !== 'undefined') {
    const savedCustomThemes = JSON.parse(localStorage.getItem('nicemd_custom_themes') || '[]');
    if (Array.isArray(savedCustomThemes)) {
      const existingIds = new Set(themes.map(t => t.id));
      savedCustomThemes.forEach(t => {
        if (t && t.id && !existingIds.has(t.id)) {
          themes.push(t);
          existingIds.add(t.id);
        }
      });
    }
  }
} catch (e) {
  console.warn('[NiceMD] Failed to load custom themes from localStorage:', e);
}

export const builtInThemeIds = new Set([
  'classic-indigo',
  'mountain-warm',
  'mountain-forest',
  'mountain-tea',
  'mountain-red',
  'github-clean',
  'vue-emerald',
  'nordic-ice'
]);

export function isBuiltInTheme(themeId) {
  return builtInThemeIds.has(themeId);
}

export function getThemeSavedStyles(themeId = 'classic-indigo') {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  if (!isBuiltInTheme(themeId) && theme?.customStyles) {
    return JSON.parse(JSON.stringify(theme.customStyles));
  }
  return getThemeDefaultStyles(themeId);
}

export function applyTheme(themeId) {
  const root = document.documentElement;
  root.setAttribute('data-article-theme', themeId);
}

function parseFontSize(val, fallback) {
  if (!val) return fallback;
  if (val === '1.6em') return '26px';
  if (val === '1.35em') return '22px';
  if (typeof val === 'string' && val.endsWith('em')) {
    const num = parseFloat(val);
    if (!isNaN(num)) return Math.round(num * 16) + 'px';
  }
  return val;
}

export function getThemeDefaultStyles(themeId = 'classic-indigo') {
  const theme = themes.find(t => t.id === themeId) || themes[0];
  if (!isBuiltInTheme(themeId) && theme?.customStyles) {
    return JSON.parse(JSON.stringify(theme.customStyles));
  }
  const styles = theme.styles || {};
  const typo = theme.typography || {};

  const primary = styles['--accent-color'] || '#2775b6';
  const textMain = styles['--text-main'] || '#2b2b2b';
  const textMuted = styles['--text-muted'] || '#595959';
  const bgPreview = styles['--bg-preview'] || '#ffffff';
  const accentBg = styles['--accent-bg'] || 'rgba(39, 117, 182, 0.05)';
  const codeBg = styles['--code-bg'] || 'rgba(27, 31, 35, 0.05)';
  const codeText = styles['--code-text'] || '#bb2243';
  const borderColor = styles['--border-color'] || '#eaeef2';

  return {
    body: { color: textMain, backgroundColor: bgPreview },
    h1: {
      fontSize: parseFontSize(typo.h1?.size, '24px'),
      color: typo.h1?.color && typo.h1.color !== '#ffffff' ? typo.h1.color : primary,
      fontWeight: String(typo.h1?.weight || 700),
      backgroundColor: undefined,
      padding: undefined,
      borderRadius: undefined,
      textAlign: undefined,
      display: undefined
    },
    h2: { fontSize: parseFontSize(typo.h2?.size, '22px'), color: typo.h2?.borderColor || primary, fontWeight: String(typo.h2?.weight || 700) },
    h3: { fontSize: parseFontSize(typo.h3?.size, '18px'), color: typo.h3?.color || textMain, fontWeight: String(typo.h3?.weight || 700) },
    h4: { fontSize: parseFontSize(typo.h4?.size, '16px'), color: textMain, fontWeight: '700' },
    h5: { fontSize: '15px', color: textMain, fontWeight: '700' },
    h6: { fontSize: '14px', color: textMuted, fontWeight: '700' },
    p: { fontSize: parseFontSize(typo.p?.size, '16px'), color: typo.p?.color || textMain, lineHeight: String(typo.p?.lineHeight || 1.8) },
    strong: { color: typo.strong?.color || primary, fontWeight: String(typo.strong?.weight || 700) },
    em: { color: primary, fontStyle: 'italic' },
    del: { color: textMuted, textDecoration: 'line-through' },
    u: { color: textMain, textDecoration: 'underline' },
    mark: { backgroundColor: '#fff566', color: '#000000' },
    kbd: { backgroundColor: '#fafbfc', color: '#24292e', borderColor: '#d1d5da' },
    sub: { fontSize: '11px' },
    sup: { fontSize: '11px' },
    code: { backgroundColor: codeBg, color: codeText, fontSize: typo.code?.size || '14px' },
    pre: { backgroundColor: '#282c34' },
    blockquote: { borderLeftColor: primary, backgroundColor: accentBg, textColor: textMuted },
    ul: { listStyleType: 'disc' },
    ol: { listStyleType: 'decimal' },
    li: { color: textMain, fontSize: '15px', lineHeight: '1.8' },
    table: { borderColor: borderColor, headerBg: accentBg },
    th: { backgroundColor: accentBg, color: textMain, fontWeight: '700' },
    td: { borderColor: borderColor, color: textMain },
    hr: { borderColor: borderColor },
    a: { color: primary, textDecoration: 'none' },
    img: { borderRadius: '8px', display: 'block', margin: '0 auto', maxWidth: '100%', boxShadow: 'none', border: 'none' }
  };
}
