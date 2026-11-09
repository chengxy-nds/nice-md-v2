export const config = {
  runtime: 'edge',
};

/**
 * Universal TiDB Cloud Serverless CORS Proxy for Vercel
 * Supports both Vercel Edge Runtime and Node.js Serverless runtime
 */
export default async function handler(req, res) {
  // If executed in Node.js serverless environment (res object present)
  if (res && (typeof res.setHeader === 'function' || typeof res.status === 'function')) {
    return handleNode(req, res);
  }
  // Standard Web API / Vercel Edge Runtime
  return handleEdge(req);
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

  // 2. Extract target URL
  const targetUrl = req.headers.get('x-tidb-target-url');
  if (!targetUrl) {
    return new Response(
      JSON.stringify({ error: 'Missing x-tidb-target-url header' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // 3. Security validation: only proxy to tidbcloud.com
  try {
    const parsed = new URL(targetUrl);
    if (!parsed.hostname.endsWith('.tidbcloud.com')) {
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

  // 4. Forward headers
  const fetchHeaders = new Headers();
  for (const [k, v] of req.headers.entries()) {
    const lower = k.toLowerCase();
    if (
      lower.startsWith('tidb-') ||
      lower === 'authorization' ||
      lower === 'content-type' ||
      lower === 'accept-encoding' ||
      lower === 'user-agent' ||
      lower.startsWith('x-')
    ) {
      fetchHeaders.set(k, v);
    }
  }

  // 5. Read body
  let bodyBuffer = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const rawBody = await req.arrayBuffer();
    if (rawBody && rawBody.byteLength > 0) {
      bodyBuffer = rawBody;
    }
  }

  // 6. Proxy request
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

  const targetUrl = req.headers['x-tidb-target-url'];
  if (!targetUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing x-tidb-target-url header' }));
    return;
  }

  try {
    const parsed = new URL(targetUrl);
    if (!parsed.hostname.endsWith('.tidbcloud.com')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Target URL host must be *.tidbcloud.com' }));
      return;
    }
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid target URL format' }));
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
        body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
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
}

