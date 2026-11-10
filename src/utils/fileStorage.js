/**
 * File Storage Utility — Alibaba Cloud OSS Image Hosting (图床)
 *
 * Supports two tiers:
 * 1. User Custom OSS (Highest Priority): Configured in browser localStorage.
 *    Signs requests with HMAC-SHA1 via Web Crypto API — zero extra dependencies.
 * 2. Server Default OSS (Fallback): Hosted on Vercel with credentials in environment variables.
 *    Client requests short-lived signed upload policy from /api/oss-proxy to upload
 *    directly to OSS without leaking AccessKeySecret or passing image bytes through serverless.
 */

const STORAGE_KEY = 'nicemd_file_storage';

// ── Default config ──
const defaultConfig = {
  platform: 'aliyun-oss',
  enableStorage: true,
  accessKey: '',
  secretKey: '',
  endPoint: '',
  bucketName: '',
  domain: '',
  basePath: '',
};

let cachedServerDefaultStatus = null;

// ── Check Server Default OSS Status ──
export async function checkServerDefaultOssAvailable() {
  if (cachedServerDefaultStatus !== null) return cachedServerDefaultStatus;
  try {
    const res = await fetch('/api/oss-proxy', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      cachedServerDefaultStatus = {
        hasDefault: Boolean(data.hasDefault),
        bucket: data.bucket || '',
        endpoint: data.endpoint || '',
        domain: data.domain || ''
      };
      return cachedServerDefaultStatus;
    }
  } catch (e) {
    // ignore
  }
  cachedServerDefaultStatus = { hasDefault: false, bucket: '', endpoint: '', domain: '' };
  return cachedServerDefaultStatus;
}

export function getServerDefaultOssStatus() {
  return cachedServerDefaultStatus;
}

export async function initStorageDefaultIfAvailable() {
  return await checkServerDefaultOssAvailable();
}

// ── Config helpers ──
export function getStorageConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) };
  } catch (e) { /* corrupted data — fall through */ }
  return { ...defaultConfig };
}

export function saveStorageConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function hasCustomStorageConfig(config = null) {
  const cfg = config || getStorageConfig();
  const ak = (cfg.accessKey || '').trim();
  const sk = (cfg.secretKey || '').trim();
  const ep = (cfg.endPoint || '').trim();
  const bk = (cfg.bucketName || '').trim();
  return Boolean(ak && sk && ep && bk);
}

export function isStorageEnabled() {
  const config = getStorageConfig();
  if (hasCustomStorageConfig(config)) {
    return config.enableStorage !== false;
  }
  if (config.enableStorage === false && config._userDisabled) {
    return false;
  }
  return Boolean(cachedServerDefaultStatus?.hasDefault);
}

// ── Utilities ──
function pad2(n) { return String(n).padStart(2, '0'); }

function base64Encode(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
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

// ── OSS HMAC-SHA1 signing via Web Crypto API ──
async function hmacSha1Base64(keyStr, dataStr) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyStr),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(dataStr));
  const bytes = new Uint8Array(sig);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ── Generate a clean object path: basePath/yyyy/MM/uuid.ext ──
function generateObjectName(file, basePath = '') {
  const ext = ((file.name || 'image.png').split('.').pop() || 'png').toLowerCase();
  const now = new Date();
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const datePath = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${uuid}.${ext}`;
  const cleanBase = sanitizeBasePath(basePath);
  return cleanBase ? `${cleanBase}/${datePath}` : datePath;
}

// ── Build bucket endpoint host ──
function buildBucketHost(config) {
  let host = (config.endPoint || '').replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
  const bucket = (config.bucketName || '').trim();
  if (host.startsWith(`${bucket}.`)) {
    return host;
  }
  return `${bucket}.${host}`;
}

// ── Custom OSS Upload (Local Web Crypto Signing) ──
async function uploadToCustomOSS(file, rawConfig) {
  const config = {
    accessKey: (rawConfig.accessKey || '').trim(),
    secretKey: (rawConfig.secretKey || '').trim(),
    endPoint: (rawConfig.endPoint || '').trim(),
    bucketName: (rawConfig.bucketName || '').trim(),
    domain: (rawConfig.domain || '').trim(),
    basePath: (rawConfig.basePath || '').trim(),
  };

  const objectName = generateObjectName(file, config.basePath);
  const bucketHost = buildBucketHost(config);

  // Build policy (expires in 1 hour) in strict UTC ISO string
  const expiration = new Date(Date.now() + 3600 * 1000);
  const policyObj = {
    expiration: expiration.toISOString(),
    conditions: [
      { bucket: config.bucketName },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 100 * 1024 * 1024], // 100 MB max
    ],
  };
  const policyBase64 = base64Encode(JSON.stringify(policyObj));
  const signature = await hmacSha1Base64(config.secretKey, policyBase64);

  // Build FormData with correct order (file must be last)
  const formData = new FormData();
  formData.append('key', objectName);
  formData.append('policy', policyBase64);
  formData.append('OSSAccessKeyId', config.accessKey);
  formData.append('success_action_status', '200');
  formData.append('Signature', signature);
  formData.append('file', file);

  const uploadUrl = `https://${bucketHost}/`;

  let response;
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    console.error('[Custom OSS Upload Network Error]', networkErr);
    if (networkErr.message?.includes('Failed to fetch') || networkErr.name === 'TypeError') {
      throw new Error(
        '网络请求被阻止 (跨域 CORS)。请在阿里云 OSS 控制台配置跨域规则：\n' +
        '1. 来源 (Origin): *\n' +
        '2. 允许 Methods: POST, OPTIONS, GET, PUT\n' +
        '3. 允许 Headers: *\n' +
        '4. 暴露 Headers: ETag\n' +
        '（保存后约 30 秒生效）',
      );
    }
    throw networkErr;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('[Custom OSS Upload HTTP Error]', response.status, errorText);
    throw new Error(`图床上传失败 (${response.status}): ${errorText || response.statusText}`);
  }

  const cleanDomain = sanitizeDomain(config.domain, bucketHost);
  const fileUrl = `${cleanDomain}/${objectName}`;

  return fileUrl;
}

// ── Server Default OSS Upload (/api/oss-proxy Signing) ──
async function uploadToServerDefaultOSS(file) {
  // 1. Request signed upload parameters from serverless proxy
  const signRes = await fetch('/api/oss-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sign-upload',
      filename: file.name || 'image.png',
      contentType: file.type || 'image/png'
    })
  });

  if (!signRes.ok) {
    const errJson = await signRes.json().catch(() => ({}));
    throw new Error(errJson.error || `服务端图床凭证获取失败 (${signRes.status})`);
  }

  const signData = await signRes.json();
  if (!signData.success || !signData.uploadUrl || !signData.formData) {
    throw new Error('服务端返回的图床签名数据无效');
  }

  // 2. Direct POST to Aliyun OSS bucket
  const formData = new FormData();
  Object.entries(signData.formData).forEach(([k, v]) => formData.append(k, v));
  formData.append('file', file);

  let response;
  try {
    response = await fetch(signData.uploadUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    console.error('[Default OSS Upload Network Error]', networkErr);
    if (networkErr.message?.includes('Failed to fetch') || networkErr.name === 'TypeError') {
      throw new Error(
        '网络请求被阻止 (跨域 CORS)。请在阿里云 OSS 控制台配置跨域规则：\n' +
        '1. 来源 (Origin): *\n' +
        '2. 允许 Methods: POST, OPTIONS, GET, PUT\n' +
        '3. 允许 Headers: *\n' +
        '4. 暴露 Headers: ETag\n' +
        '（保存后约 30 秒生效）',
      );
    }
    throw networkErr;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('[Default OSS Upload HTTP Error]', response.status, errorText);
    throw new Error(`默认图床上传失败 (${response.status}): ${errorText || response.statusText}`);
  }

  let fileUrl = signData.fileUrl;
  try {
    const urlObj = new URL(fileUrl);
    if (!urlObj.hostname || !urlObj.hostname.includes('.') || urlObj.hostname === '1' || urlObj.hostname === '0') {
      const uploadUrlObj = new URL(signData.uploadUrl);
      urlObj.host = uploadUrlObj.host;
      urlObj.protocol = uploadUrlObj.protocol;
      fileUrl = urlObj.toString();
    }
  } catch {
    // 保持原样
  }

  return fileUrl;
}

// ── Universal Entry Point (Custom first, then Server Default) ──
export async function uploadToOSS(file, options = {}) {
  const { overrideConfig = null, skipEnableCheck = false } = options;
  const currentConfig = overrideConfig || getStorageConfig();

  // 1. If custom credentials are provided, use custom upload (custom takes priority!)
  if (hasCustomStorageConfig(currentConfig)) {
    return await uploadToCustomOSS(file, currentConfig);
  }

  // 2. Otherwise check if server default is available
  if (!cachedServerDefaultStatus) {
    await checkServerDefaultOssAvailable();
  }

  if (cachedServerDefaultStatus?.hasDefault) {
    return await uploadToServerDefaultOSS(file);
  }

  // 3. Neither is available
  if (!skipEnableCheck) {
    throw new Error('图床未配置：本地未配置自定义阿里云 OSS，且服务器未设置默认图床环境变量。请在设置中配置 OSS 参数。');
  }

  throw new Error('图床配置不完整，请检查 AccessKey / SecretKey / EndPoint / Bucket 名称');
}

// ── Test OSS connectivity ──
export async function testOSSConnection(overrideConfig = null) {
  const testBlob = new Blob(['nice-md-connection-test'], { type: 'text/plain' });
  const testFile = new File([testBlob], 'nice-md-test.txt', { type: 'text/plain' });
  await uploadToOSS(testFile, {
    skipEnableCheck: true,
    overrideConfig,
  });
  return true;
}
