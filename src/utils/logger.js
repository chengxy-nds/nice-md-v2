/**
 * Unified logger (optimization item 10).
 *
 * All `console.*` calls in `src/` go through this module instead of
 * calling `console` directly, so production output is controlled in one
 * place. Rules:
 *  - `debug` / `info`: development only (`import.meta.env.DEV`).
 *  - `warn` / `error`: always emitted in dev; in production builds the
 *    underlying `console.*` calls are removed entirely by the bundler
 *    (vite.config.js: `build.esbuild.drop: ['console', 'debugger']`).
 *  - Never use `console.*` directly in `src/` — ESLint `no-console`
 *    enforces this (see eslint.config.js).
 *  - Server/desktop code outside `src/` (api/, electron/, scripts/) keeps
 *    plain `console` — it is not bundled by Vite and its output is useful.
 */

export const logger = {
  debug(...args) {
    if (import.meta.env.DEV) console.debug(...args);
  },
  info(...args) {
    if (import.meta.env.DEV) console.info(...args);
  },
  warn(...args) {
    console.warn(...args);
  },
  error(...args) {
    console.error(...args);
  },
};

export default logger;
