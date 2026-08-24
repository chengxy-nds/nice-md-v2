// Note: window.setImmediate polyfill now lives in index.html as a synchronous
// classic script, so it runs BEFORE the ES module bundle is evaluated.
// (See the comment in index.html for why ordering matters for mammoth/bluebird.)
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { injectThemeTypographyCss } from './utils/themeTypography'
import { initGlobalTooltip } from './utils/globalTooltip'

marked.use({
  renderer: {
    code(arg1, arg2) {
      let text = '';
      let lang = '';
      if (typeof arg1 === 'object' && arg1 !== null) {
        text = arg1.text || '';
        lang = arg1.lang || '';
      } else {
        text = arg1 || '';
        lang = arg2 || '';
      }
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre data-lang="${language}"><code class="hljs language-${language}">${highlighted}</code></pre>`;
    }
  }
});

// Inject per-theme markdown typography at the END of <head> so the
// non-scoped [data-theme="..."] rules override the components' scoped
// :deep() defaults (equal specificity → later source order wins).
injectThemeTypographyCss();

// Initialize sleek universal dark tooltip
initGlobalTooltip();

createApp(App).mount('#app')
