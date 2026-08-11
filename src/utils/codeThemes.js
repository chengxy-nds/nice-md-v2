export const codeThemes = [
  {
    id: 'atom-one-dark',
    name: 'Atom Dark',
    dark: true,
    styles: {
      bg: '#282c34',
      text: '#abb2bf',
      keyword: '#c678dd',
      string: '#98c379',
      number: '#d19a66',
      literal: '#56b6c2',
      type: '#e5c07b',
      title: '#61afef',
      attr: '#d19a66',
      comment: '#7f848e',
      meta: '#61afef',
      operator: '#56b6c2',
      property: '#abb2bf',
      variable: '#e06c75',
      macBg: '#282c34',
      macText: '#5c6370'
    }
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    dark: false,
    styles: {
      bg: '#f6f8fa',
      text: '#24292f',
      keyword: '#cf222e',
      string: '#0a3069',
      number: '#0550ae',
      literal: '#0550ae',
      type: '#953800',
      title: '#8250df',
      attr: '#116329',
      comment: '#6e7781',
      meta: '#8250df',
      operator: '#0550ae',
      property: '#24292f',
      variable: '#953800',
      macBg: '#eaeef2',
      macText: '#57606a'
    }
  },
  {
    id: 'monokai',
    name: 'Monokai',
    dark: true,
    styles: {
      bg: '#272822',
      text: '#f8f8f2',
      keyword: '#f92672',
      string: '#e6db74',
      number: '#ae81ff',
      literal: '#ae81ff',
      type: '#66d9ef',
      title: '#a6e22e',
      attr: '#fd971f',
      comment: '#75715e',
      meta: '#a6e22e',
      operator: '#f92672',
      property: '#f8f8f2',
      variable: '#fd971f',
      macBg: '#1e1f1c',
      macText: '#74705d'
    }
  },
  {
    id: 'vs-code-dark',
    name: 'VS Code Dark',
    dark: true,
    styles: {
      bg: '#1e1e1e',
      text: '#d4d4d4',
      keyword: '#569cd6',
      string: '#ce9178',
      number: '#b5cea8',
      literal: '#569cd6',
      type: '#4ec9b0',
      title: '#dcdcaa',
      attr: '#9cdcfe',
      comment: '#6a9955',
      meta: '#569cd6',
      operator: '#d4d4d4',
      property: '#d4d4d4',
      variable: '#9cdcfe',
      macBg: '#252526',
      macText: '#858585'
    }
  },
  {
    id: 'xcode-light',
    name: 'Xcode Light',
    dark: false,
    styles: {
      bg: '#ffffff',
      text: '#000000',
      keyword: '#9b2393',
      string: '#c41a16',
      number: '#1c00cf',
      literal: '#1c00cf',
      type: '#3f6e74',
      title: '#326d74',
      attr: '#5c2699',
      comment: '#007400',
      meta: '#643820',
      operator: '#000000',
      property: '#000000',
      variable: '#5c2699',
      macBg: '#f3f3f3',
      macText: '#999999'
    }
  }
];

export function getCodeThemeStyles(themeId) {
  const theme = codeThemes.find(t => t.id === themeId) || codeThemes[0];
  const cssVariables = {};
  Object.entries(theme.styles).forEach(([key, value]) => {
    const cssKey = `--hljs-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;
    cssVariables[cssKey] = value;
  });
  return cssVariables;
}
