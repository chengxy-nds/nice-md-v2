import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function resolveLocalDefaultOssConfig() {
  const env = { ...process.env, ...loadEnv('development', process.cwd(), '') };
  const ak = (env.OSS_ACCESS_KEY_ID || env.ALIYUN_OSS_ACCESS_KEY_ID || env.OSS_AK || '').trim();
  const sk = (env.OSS_ACCESS_KEY_SECRET || env.ALIYUN_OSS_ACCESS_KEY_SECRET || env.OSS_SK || '').trim();
  const bucket = (env.OSS_BUCKET || env.ALIYUN_OSS_BUCKET || env.OSS_BUCKET_NAME || '').trim();
  const endpoint = (env.OSS_ENDPOINT || env.ALIYUN_OSS_ENDPOINT || env.OSS_REGION || '').trim();
  const domain = (env.OSS_DOMAIN || env.ALIYUN_OSS_DOMAIN || '').trim();
  const basePath = (env.OSS_BASE_PATH || env.ALIYUN_OSS_BASE_PATH || '').trim();

  if (!ak || !sk || !bucket || !endpoint) {
    return null;
  }

  return { accessKeyId: ak, accessKeySecret: sk, bucket, endpoint, domain, basePath };
}

function createOssProxyMiddleware() {
  return async (req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url === '/api/oss-proxy') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      const ossConfig = resolveLocalDefaultOssConfig();

      if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          hasDefault: Boolean(ossConfig),
          bucket: ossConfig?.bucket || '',
          endpoint: ossConfig?.endpoint || '',
          domain: ossConfig?.domain || ''
        }));
        return;
      }

      if (req.method === 'POST') {
        if (!ossConfig) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: '本地或服务端未配置阿里云 OSS 环境变量 (OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET / OSS_ENDPOINT)。'
          }));
          return;
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const bodyStr = Buffer.concat(chunks).toString('utf8');
            const body = bodyStr ? JSON.parse(bodyStr) : {};
            const filename = body?.filename || 'image.png';

            const ext = (filename.split('.').pop() || 'png').toLowerCase();
            const now = new Date();
            const pad2 = n => String(n).padStart(2, '0');
            const uuid = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 16) : Math.random().toString(36).substring(2, 18);
            const datePath = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${uuid}.${ext}`;
            const rawBase = (ossConfig.basePath || '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
            const cleanBase = (rawBase === '1' || rawBase === '0' || rawBase.toLowerCase() === 'none' || rawBase.toLowerCase() === 'null') ? '' : rawBase;
            const objectName = cleanBase ? `${cleanBase}/${datePath}` : datePath;

            let bucketHost = (ossConfig.endpoint || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
            if (!bucketHost.startsWith(`${ossConfig.bucket}.`)) {
              bucketHost = `${ossConfig.bucket}.${bucketHost}`;
            }

            const expiration = new Date(Date.now() + 3600 * 1000);
            const policyObj = {
              expiration: expiration.toISOString(),
              conditions: [
                { bucket: ossConfig.bucket },
                ['starts-with', '$key', ''],
                ['content-length-range', 0, 100 * 1024 * 1024]
              ]
            };
            const policyBase64 = Buffer.from(JSON.stringify(policyObj)).toString('base64');
            const signature = crypto.createHmac('sha1', ossConfig.accessKeySecret).update(policyBase64).digest('base64');

            const rawDomain = (ossConfig.domain || '').trim();
            const isInvalidDomain = !rawDomain || rawDomain === '1' || rawDomain === '0' || !rawDomain.includes('.');
            const effectiveDomain = isInvalidDomain ? `https://${bucketHost}` : (rawDomain.startsWith('http://') || rawDomain.startsWith('https://') ? rawDomain : `https://${rawDomain}`).replace(/\/+$/, '');
            const fileUrl = `${effectiveDomain}/${objectName}`;
            const uploadUrl = `https://${bucketHost}/`;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              uploadUrl,
              fileUrl,
              formData: {
                key: objectName,
                policy: policyBase64,
                OSSAccessKeyId: ossConfig.accessKeyId,
                success_action_status: '200',
                Signature: signature
              }
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: '生成 OSS 上传凭证失败: ' + err.message }));
          }
        });
        return;
      }
    }
    next();
  };
}

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
        server.middlewares.use(createOssProxyMiddleware());
        server.middlewares.use(createTidbProxyMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(createOssProxyMiddleware());
        server.middlewares.use(createTidbProxyMiddleware());
      }
    }
  ],
  optimizeDeps: {
    entries: ['index.html', 'src/main.js'], // explicitly scan only these files for pre-bundling
  },
  build: {
    // Item 6: the baseline build emitted a single 4.7MB index chunk (gzip
    // 1.35MB) with no splitting at all. Name the big static vendors so the
    // browser can cache them separately from app code; dynamically imported
    // libs (mermaid/katex/docx/html2canvas/mammoth/cos-sdk) already split
    // into their own chunks via import() and are grouped here by name.
    // NOTE: Vite 8 uses Rolldown, so this lives under rolldownOptions.
    // base './' keeps dynamic chunk URLs relative, which also works under
    // Electron's file:// protocol.
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('codemirror') || id.includes('@lezer')) return 'vendor-codemirror';
          if (id.includes('highlight.js')) return 'vendor-hljs';
          if (id.includes('marked')) return 'vendor-markdown';
          // NOTE: mermaid, katex and their dependency trees (d3, cytoscape,
          // dagre, lodash, ...) are deliberately NOT grouped here, and
          // there is deliberately NO generic catch-all 'vendor' bucket.
          // They are loaded via dynamic import() only when a document
          // actually contains a diagram / math. Two attempts proved that
          // grouping them is counterproductive in Vite 8 / Rolldown: the
          // dynamic-import helper Rolldown generates landed inside the
          // grouped chunk, which turned the whole chunk into a static
          // dependency of the entry — first a 1.9MB vendor-mermaid chunk,
          // then a 3.3MB generic vendor chunk, both modulepreloaded on
          // every load. Without grouping, Rolldown keeps its own
          // fine-grained splitting (per-diagram-type chunks for mermaid)
          // and those chunks stay lazy.
          if (id.includes('docx') || id.includes('html2canvas') || id.includes('mammoth')) return 'vendor-export';
          if (id.includes('@neondatabase') || id.includes('@tidbcloud')) return 'vendor-cloud';
          // NOTE: cos-js-sdk is deliberately excluded from vendor-cloud:
          // it is only loaded via dynamic import() when the user uploads
          // to OSS, and grouping it with the statically-imported Neon/TiDB
          // drivers would make it eager too.
          if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue';
          return undefined;
        }
      }
    }
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
