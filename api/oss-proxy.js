export const config = {
  runtime: 'edge',
};

/**
 * Universal Alibaba Cloud OSS Proxy & Signing Handler for Vercel
 * Supports both Vercel Edge Runtime and Node.js Serverless runtime.
 * 
 * Features:
 * 1. GET: Health check & check if server-side default OSS is configured (no secrets leaked).
 * 2. POST (action: 'sign-upload'): Generates short-lived signed POST Object policy & signature
 *    so the browser can upload directly to OSS with zero secret leakage and no Vercel payload limits.
 */
export default async function handler(req, res) {
  if (res && (typeof res.setHeader === 'function' || typeof res.status === 'function')) {
    return handleNode(req, res);
  }
  return handleEdge(req);
}

function resolveServerOssConfig() {
  const ak = (process.env.OSS_ACCESS_KEY_ID || process.env.ALIYUN_OSS_ACCESS_KEY_ID || process.env.OSS_AK || '').trim();
  const sk = (process.env.OSS_ACCESS_KEY_SECRET || process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || process.env.OSS_SK || '').trim();
  const bucket = (process.env.OSS_BUCKET || process.env.ALIYUN_OSS_BUCKET || process.env.OSS_BUCKET_NAME || '').trim();
  const endpoint = (process.env.OSS_ENDPOINT || process.env.ALIYUN_OSS_ENDPOINT || process.env.OSS_REGION || '').trim();
  const domain = (process.env.OSS_DOMAIN || process.env.ALIYUN_OSS_DOMAIN || '').trim();
  const basePath = (process.env.OSS_BASE_PATH || process.env.ALIYUN_OSS_BASE_PATH || '').trim();

  if (!ak || !sk || !bucket || !endpoint) {
    return null;
  }

  return {
    accessKeyId: ak,
    accessKeySecret: sk,
    bucket,
    endpoint,
    domain,
    basePath
  };
}

function pad2(n) { return String(n).padStart(2, '0'); }

function generateObjectName(filename, basePath = '') {
  const ext = ((filename || 'image.png').split('.').pop() || 'png').toLowerCase();
  const now = new Date();
  const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    : Math.random().toString(36).substring(2, 18);
  const datePath = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${uuid}.${ext}`;
  const cleanBase = basePath.replace(/^\/+/, '').replace(/\/+$/, '');
  return cleanBase ? `${cleanBase}/${datePath}` : datePath;
}

function buildBucketHost(bucket, endpoint) {
  let host = (endpoint || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
  if (host.startsWith(`${bucket}.`)) {
    return host;
  }
  return `${bucket}.${host}`;
}

function base64Encode(str) {
  if (typeof btoa !== 'undefined') {
    return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  }
  return Buffer.from(str).toString('base64');
}

async function hmacSha1Base64(keyStr, dataStr) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keyStr),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(dataStr));
    const bytes = new Uint8Array(sig);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }

  // Node fallback if Web Crypto is unavailable
  const nodeCrypto = await import('crypto');
  return nodeCrypto.createHmac('sha1', keyStr).update(dataStr).digest('base64');
}

async function generateSignedUploadParams(ossConfig, filename = 'image.png') {
  const objectName = generateObjectName(filename, ossConfig.basePath);
  const bucketHost = buildBucketHost(ossConfig.bucket, ossConfig.endpoint);

  // Policy valid for 1 hour
  const expiration = new Date(Date.now() + 3600 * 1000);
  const policyObj = {
    expiration: expiration.toISOString(),
    conditions: [
      { bucket: ossConfig.bucket },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 100 * 1024 * 1024] // 100MB limit
    ]
  };

  const policyBase64 = base64Encode(JSON.stringify(policyObj));
  const signature = await hmacSha1Base64(ossConfig.accessKeySecret, policyBase64);

  const rawDomain = ossConfig.domain || `https://${bucketHost}`;
  const cleanDomain = (rawDomain.startsWith('http://') || rawDomain.startsWith('https://')
    ? rawDomain
    : `https://${rawDomain}`).replace(/\/+$/, '');

  const fileUrl = `${cleanDomain}/${objectName}`;
  const uploadUrl = `https://${bucketHost}/`;

  return {
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
  };
}

/**
 * Vercel Edge Runtime Handler
 */
async function handleEdge(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method === 'GET') {
    const ossConfig = resolveServerOssConfig();
    return new Response(
      JSON.stringify({
        status: 'ok',
        hasDefault: Boolean(ossConfig),
        bucket: ossConfig?.bucket || '',
        endpoint: ossConfig?.endpoint || '',
        domain: ossConfig?.domain || ''
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

  if (req.method === 'POST') {
    const ossConfig = resolveServerOssConfig();
    if (!ossConfig) {
      return new Response(
        JSON.stringify({
          error: 'Vercel 服务端未配置阿里云 OSS 环境变量 (OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET / OSS_ENDPOINT)。'
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

    try {
      const body = await req.json().catch(() => ({}));
      const filename = body?.filename || 'image.png';
      const uploadParams = await generateSignedUploadParams(ossConfig, filename);
      return new Response(
        JSON.stringify(uploadParams),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: '生成 OSS 上传凭证失败: ' + err.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}

/**
 * Node.js Serverless Handler (Fallback)
 */
async function handleNode(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const ossConfig = resolveServerOssConfig();
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
    const ossConfig = resolveServerOssConfig();
    if (!ossConfig) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Vercel 服务端未配置阿里云 OSS 环境变量 (OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET / OSS_ENDPOINT)。'
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
        const uploadParams = await generateSignedUploadParams(ossConfig, filename);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(uploadParams));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: '生成 OSS 上传凭证失败: ' + err.message }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
}
