import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import fs from 'node:fs'
import path from 'node:path'

function resolveLocalDefaultTidbConfig() {
  const env = { ...process.env, ...loadEnv('development', process.cwd(), '') };
  const envUrl = env.TIDB_DATABASE_URL || env.TIDB_URI || env.DATABASE_URL;
  if (!envUrl) return null;
  try {
    const parsed = new URL(envUrl);
    const user = decodeURIComponent(parsed.username || '');
    const pass = decodeURIComponent(parsed.password || '');
    const host = parsed.hostname;
    if (!host) return null;
    const db = (parsed.pathname || '').replace(/^\//, '');
    const httpHost = host.startsWith('http-') ? host : `http-${host}`;
    return {
      targetUrl: `https://${httpHost}/v1beta/sql`,
      authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'),
      database: db || 'easymd',
      host: httpHost
    };
  } catch {
    return null;
  }
}

function createTidbProxyMiddleware() {
  return async (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url === '/api/tidb-proxy') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'GET') {
        const defaultCfg = resolveLocalDefaultTidbConfig();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          hasDefault: Boolean(defaultCfg)
        }));
        return;
      }

      const rawTargetUrl = req.headers['x-tidb-target-url'];
      const useDefault = req.headers['x-tidb-use-default'] === '1' || rawTargetUrl === '__DEFAULT__' || !rawTargetUrl;

      let targetUrl = rawTargetUrl;
      let defaultAuth = null;
      let defaultDatabase = null;

      if (useDefault) {
        const defaultCfg = resolveLocalDefaultTidbConfig();
        if (!defaultCfg) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: '本地或服务端未配置 TIDB_DATABASE_URL 环境变量。请在 .env.local 或 Vercel 控制台配置环境变量，或在网页端填写自定义 TiDB 连接串。'
          }));
          return;
        }
        targetUrl = defaultCfg.targetUrl;
        defaultAuth = defaultCfg.authorization;
        defaultDatabase = defaultCfg.database;
      }

      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const bodyBuffer = Buffer.concat(chunks);
          const fetchHeaders = {};
          for (const [k, v] of Object.entries(req.headers)) {
            const lower = k.toLowerCase();
            if (
              lower.startsWith('tidb-') ||
              lower === 'authorization' ||
              lower === 'content-type' ||
              lower === 'accept-encoding' ||
              lower === 'user-agent' ||
              lower.startsWith('x-')
            ) {
              fetchHeaders[k] = v;
            }
          }

          if (defaultAuth) {
            fetchHeaders['authorization'] = defaultAuth;
          }
          if (defaultDatabase && !fetchHeaders['tidb-database']) {
            fetchHeaders['tidb-database'] = defaultDatabase;
          }

          const response = await fetch(targetUrl, {
            method: req.method || 'POST',
            headers: fetchHeaders,
            body: bodyBuffer.length > 0 ? bodyBuffer : undefined
          });

          res.statusCode = response.status;
          response.headers.forEach((v, k) => {
            const lower = k.toLowerCase();
            if (lower !== 'content-encoding' && lower !== 'content-length' && lower !== 'transfer-encoding') {
              res.setHeader(k, v);
            }
          });
          const data = await response.arrayBuffer();
          res.end(Buffer.from(data));
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: err.message || 'TiDB Proxy Gateway Error' }));
        }
      });
      return;
    }

    if (url === '/test' || url === '/test/' || url === '/test.html') {
      const testHtmlPath = path.resolve(__dirname, 'test/index.html');
      if (fs.existsSync(testHtmlPath)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(fs.readFileSync(testHtmlPath, 'utf-8'));
        return;
      }
    }
    next();
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    {
      name: 'auto-package-extension',
      handleHotUpdate({ file }) {
        if (file && (file.includes('/extension/') || file.includes('\\extension\\')) && !file.endsWith('.zip') && !file.endsWith('.crx')) {
          import('node:child_process').then(({ exec }) => {
            exec('node scripts/package-extension.cjs', (err, stdout) => {
              if (!err && stdout) {
                console.log('\n' + stdout.trim());
              }
            });
          });
        }
      }
    },
    {
      name: 'serve-test-demo',
      configureServer(server) {
        server.middlewares.use(createTidbProxyMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(createTidbProxyMiddleware());
      }
    }
  ],
  optimizeDeps: {
    entries: ['index.html', 'src/main.js'], // explicitly scan only these files for pre-bundling
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {
      ignored: ['**/Wechatsync/**', '**/dist/**', '**/dist_electron/**', '**/*.tmp/**']
    }
  }
})
