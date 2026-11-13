export const config = {
  runtime: 'edge',
};

/**
 * Universal TiDB Cloud Serverless CORS Proxy for Vercel
 * Supports both Vercel Edge Runtime and Node.js Serverless runtime.
 * Supports:
 * 1. Default Vercel Database: Reads TIDB_DATABASE_URL from server environment variables.
 * 2. Custom User Database: Securely proxies to user's *.tidbcloud.com host.
 */
export default async function handler(req, res) {
  if (res && (typeof res.setHeader === 'function' || typeof res.status === 'function')) {
    return handleNode(req, res);
  }
  return handleEdge(req);
}

import { resolveTidbConfig, isTidbCloudHost, isAllowedProxyHeader } from './lib/proxy-shared.js';

function resolveDefaultTidbConfig() {
  return resolveTidbConfig(process.env.TIDB_DATABASE_URL || process.env.TIDB_URI || process.env.DATABASE_URL);
}

/**
 * Vercel Edge Runtime Handler
 */
async function handleEdge(req) {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Health & Status Check (GET)
  if (req.method === 'GET') {
    const defaultCfg = resolveDefaultTidbConfig();
    return new Response(
      JSON.stringify({
        status: 'ok',
        hasDefault: Boolean(defaultCfg)
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // 3. Extract target URL & handle default Vercel database fallback
  const rawTargetUrl = req.headers.get('x-tidb-target-url');
  const useDefault = req.headers.get('x-tidb-use-default') === '1' || rawTargetUrl === '__DEFAULT__' || !rawTargetUrl;

  let targetUrl = rawTargetUrl;
  let defaultAuth = null;
  let defaultDatabase = null;

  if (useDefault) {
    const defaultCfg = resolveDefaultTidbConfig();
    if (!defaultCfg) {
      return new Response(
        JSON.stringify({
          error: 'Vercel 服务端未配置 TIDB_DATABASE_URL 环境变量。请在 Vercel 控制台配置环境变量，或在网页端填写自定义 TiDB 连接串。'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    targetUrl = defaultCfg.targetUrl;
    defaultAuth = defaultCfg.authorization;
    defaultDatabase = defaultCfg.database;
  }

  // 4. Security validation: only proxy to tidbcloud.com (shared helper)
  try {
    new URL(targetUrl);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid target URL format' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
  if (!isTidbCloudHost(targetUrl)) {
    return new Response(
      JSON.stringify({ error: 'Target URL host must be *.tidbcloud.com' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // 5. Forward headers
  const fetchHeaders = new Headers();
  for (const [k, v] of req.headers.entries()) {
    const lower = k.toLowerCase();
    if (isAllowedProxyHeader(lower)) {
      fetchHeaders.set(k, v);
    }
  }

  if (defaultAuth) {
    fetchHeaders.set('authorization', defaultAuth);
  }
  if (defaultDatabase && !fetchHeaders.has('tidb-database')) {
    fetchHeaders.set('tidb-database', defaultDatabase);
  }

  // 6. Read body
  let bodyBuffer = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const rawBody = await req.arrayBuffer();
    if (rawBody && rawBody.byteLength > 0) {
      bodyBuffer = rawBody;
    }
  }

  // 7. Proxy request to TiDB Cloud
  try {
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method || 'POST',
      headers: fetchHeaders,
      body: bodyBuffer,
    });

    const resHeaders = new Headers(upstreamResponse.headers);
    resHeaders.set('Access-Control-Allow-Origin', '*');
    resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    resHeaders.set('Access-Control-Allow-Headers', '*');
    resHeaders.delete('content-encoding');
    resHeaders.delete('content-length');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        message: err.message || 'TiDB Proxy Gateway Error',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Node.js Serverless Handler (Fallback)
 */
async function handleNode(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const defaultCfg = resolveDefaultTidbConfig();
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
    const defaultCfg = resolveDefaultTidbConfig();
    if (!defaultCfg) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Vercel 服务端未配置 TIDB_DATABASE_URL 环境变量。请在 Vercel 控制台配置环境变量，或在网页端填写自定义 TiDB 连接串。'
      }));
      return;
    }
    targetUrl = defaultCfg.targetUrl;
    defaultAuth = defaultCfg.authorization;
    defaultDatabase = defaultCfg.database;
  }

  try {
    new URL(targetUrl);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid target URL format' }));
    return;
  }
  if (!isTidbCloudHost(targetUrl)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Target URL host must be *.tidbcloud.com' }));
    return;
  }

  let bodyBuffer = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body) {
      bodyBuffer = typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? req.body
        : JSON.stringify(req.body);
    } else {
      const chunks = [];
      try {
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        if (chunks.length > 0) {
          bodyBuffer = Buffer.concat(chunks);
        }
      } catch {
        // Stream read error or already consumed
      }
    }
  }

  try {
    const fetchHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) {
      const lower = k.toLowerCase();
      if (isAllowedProxyHeader(lower)) {
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
      body: bodyBuffer,
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
}
