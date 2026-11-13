// Shared highlight.js setup (item 3): the full `highlight.js` bundle ships
// ~190 languages and was imported in two places (main.js and
// markdownExtensions.js). Only the languages actually used in articles are
// registered here; anything else falls back to plaintext (main.js) or to
// highlightAuto over the registered subset (markdownExtensions.js).
// Add a language here (one import + one entry) if a new fence language
// needs real highlighting.
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import markdown from 'highlight.js/lib/languages/markdown';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import yaml from 'highlight.js/lib/languages/yaml';
import diff from 'highlight.js/lib/languages/diff';
import ini from 'highlight.js/lib/languages/ini';
import plaintext from 'highlight.js/lib/languages/plaintext';

const LANGUAGES = {
  javascript, typescript, xml, css, json, bash, shell, markdown,
  java, python, sql, c, cpp, csharp, go, rust, php, ruby, yaml,
  diff, ini, plaintext,
};
for (const [name, def] of Object.entries(LANGUAGES)) {
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, def);
}
// Common fence aliases (```html, ```js, ```sh, ...) map onto the above.
hljs.registerAliases(['html', 'xhtml', 'rss', 'atom', 'svg'], { languageName: 'xml' });
hljs.registerAliases(['js', 'jsx', 'mjs', 'cjs'], { languageName: 'javascript' });
hljs.registerAliases(['ts', 'tsx', 'mts', 'cts'], { languageName: 'typescript' });
hljs.registerAliases(['py', 'py3'], { languageName: 'python' });
hljs.registerAliases(['sh', 'zsh'], { languageName: 'bash' });
hljs.registerAliases(['yml'], { languageName: 'yaml' });
hljs.registerAliases(['c++', 'h++', 'cc', 'hh', 'hpp'], { languageName: 'cpp' });
hljs.registerAliases(['c#', 'cs'], { languageName: 'csharp' });

export default hljs;
