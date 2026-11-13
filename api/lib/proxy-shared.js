// Shared OSS / TiDB proxy logic (item 9).
//
// This module is the single implementation of the proxy helpers that used
// to exist in three places with drift:
//   - api/oss-proxy.js + api/tidb-proxy.js (Vercel Edge, Web Standard APIs)
//   - vite.config.js inline createOssProxyMiddleware / createTidbProxyMiddleware
//     (dev server, Node APIs — Node `crypto` HMAC, Buffer base64)
//
// It uses only Web Standard APIs (TextEncoder, crypto.subtle, btoa, URL),
// so the exact same code runs in Vercel Edge, in the Vite dev server
// (Node 18+ provides all of these as globals), and in any other
// standards-compliant runtime. Callers only differ in how they read the
// environment (process.env on Vercel, loadEnv() in Vite) and in how they
// shape HTTP responses — the crypto, naming and validation logic is shared.
//
// Behaviour notes (verified against both previous implementations):
// - OSS policy: 1h expiry, bucket condition, `starts-with $key ''`,
//   100MB content-length range; HMAC-SHA1 signature over the base64 policy.
// - TiDB: the connection URL is parsed into an https `http-<host>` target
//   with Basic auth; the hostname allowlist (*.tidbcloud.com) that only
//   the production proxy enforced is now enforced in dev too.
function pad2(n) {
  return String(n).padStart(2, '0');
}

export function resolveOssConfig(env) {
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

export function sanitizeDomain(domain, fallbackHost) {
  if (!domain || typeof domain !== 'string') return `https://${fallbackHost}`;
  const trimmed = domain.trim();
  if (!trimmed || trimmed === '1' || trimmed === '0' || !trimmed.includes('.')) {
    return `https://${fallbackHost}`;
  }
  const withProto = (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
    ? trimmed
    : `https://${trimmed}`;
  return withProto.replace(/\/+$/, '');
}

export function sanitizeBasePath(basePath) {
  if (!basePath || typeof basePath !== 'string') return '';
  const trimmed = basePath.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (trimmed === '1' || trimmed === '0' || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'null') {
    return '';
  }
  return trimmed;
}

export function generateObjectName(filename, basePath = '') {
  const ext = ((filename || 'image.png').split('.').pop() || 'png').toLowerCase();
  const now = new Date();
  const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    : Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const datePath = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${uuid}.${ext}`;
  const cleanBase = sanitizeBasePath(basePath);
  return cleanBase ? `${cleanBase}/${datePath}` : datePath;
}

export function buildBucketHost(bucket, endpoint) {
  let host = (endpoint || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
  if (host.startsWith(`${bucket}.`)) {
    return host;
  }
  return `${bucket}.${host}`;
}

export function base64Encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64EncodeBasicAuth(user, pass) {
  return base64Encode(`${user}:${pass}`);
}

export async function hmacSha1Base64(keyStr, dataStr) {
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
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function generateSignedUploadParams(ossConfig, filename = 'image.png') {
  const objectName = generateObjectName(filename, ossConfig.basePath);
  const bucketHost = buildBucketHost(ossConfig.bucket, ossConfig.endpoint);

  // Policy valid for 1 hour
  const expiration = new Date(Date.now() + 3600 * 1000);
  const policyObj = {
    expiration: expiration.toISOString(),
    conditions: [
      { bucket: ossConfig.bucket },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 100 * 1024 * 1024], // 100MB limit
    ],
  };

  const policyBase64 = base64Encode(JSON.stringify(policyObj));
  const signature = await hmacSha1Base64(ossConfig.accessKeySecret, policyBase64);

  const cleanDomain = sanitizeDomain(ossConfig.domain, bucketHost);
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
      Signature: signature,
    },
  };
}

export function resolveTidbConfig(envUrl) {
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
      authorization: `Basic ${base64EncodeBasicAuth(user, pass)}`,
      database: db || 'easymd',
      host: httpHost,
    };
  } catch {
    return null;
  }
}

// The production proxy only ever forwards to TiDB Cloud hosts. The dev
// server previously skipped this check — enforce it everywhere.
export function isTidbCloudHost(url) {
  try {
    return new URL(url).hostname.endsWith('.tidbcloud.com');
  } catch {
    return false;
  }
}

// Headers a proxy request is allowed to forward upstream.
export function isAllowedProxyHeader(name) {
  const lower = String(name || '').toLowerCase();
  return (
    lower.startsWith('tidb-') ||
    lower === 'authorization' ||
    lower === 'content-type' ||
    lower === 'accept-encoding' ||
    lower === 'user-agent' ||
    lower.startsWith('x-')
  );
}
