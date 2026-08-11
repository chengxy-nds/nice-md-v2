export const themes = [
  {
    id: 'classic-indigo',
    name: '山海',
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
    // Paper texture for preview body (mdnice 山海 reference)
    previewTexture: {
      bgImage: 'linear-gradient(90deg, rgba(50, 0, 0, 0.03) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 12.16%)',
      bgSize: '20px 20px, 20px 20px'
    },
    typography: {
      h1: { variant: 'pill', size: '1.6em', weight: 700, align: 'center', bg: '#2775b6', color: '#ffffff', radius: '8px', padding: '10px 24px', letterSpacing: '-0.3px' },
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
  }
];

export function applyTheme(themeId) {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);
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

  const isH1Pill = typo.h1?.variant === 'pill';
  const h1Bg = typo.h1?.bg || (isH1Pill ? primary : undefined);
  const h1Color = h1Bg ? (typo.h1?.color || '#ffffff') : (typo.h1?.color && typo.h1.color !== '#ffffff' ? typo.h1.color : primary);

  return {
    body: { color: textMain, backgroundColor: bgPreview },
    h1: {
      fontSize: parseFontSize(typo.h1?.size, '26px'),
      color: h1Color,
      fontWeight: String(typo.h1?.weight || 700),
      backgroundColor: h1Bg,
      padding: typo.h1?.padding || (h1Bg ? '10px 24px' : undefined),
      borderRadius: typo.h1?.radius || (h1Bg ? '8px' : undefined),
      textAlign: typo.h1?.align || (h1Bg ? 'center' : undefined),
      display: h1Bg ? 'block' : undefined
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
