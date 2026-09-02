import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import fs from 'node:fs'
import path from 'node:path'

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
        // TiDB Cloud Serverless CORS proxy
        server.middlewares.use(async (req, res, next) => {
          const url = (req.url || '').split('?')[0];
          if (url === '/api/tidb-proxy') {
            const targetUrl = req.headers['x-tidb-target-url'];
            if (!targetUrl) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing x-tidb-target-url header' }));
              return;
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
        });
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
