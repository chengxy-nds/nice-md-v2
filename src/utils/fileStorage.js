/**
 * File Storage Utility — Alibaba Cloud OSS Image Hosting (图床)
 *
 * Manages OSS config in localStorage and provides browser-based upload functions.
 * Uses OSS POST Object API (form upload) for best CORS compatibility.
 * Signs requests with HMAC-SHA1 via Web Crypto API — zero extra dependencies.
 */

const STORAGE_KEY = 'nicemd_file_storage';

// ── Default config ──
const defaultConfig = {
  platform: 'aliyun-oss',
  enableStorage: false,
  accessKey: '',
  secretKey: '',
  endPoint: '',
  bucketName: '',
  domain: '',
  basePath: '',
};

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

export function isStorageEnabled() {
  const config = getStorageConfig();
  return config.enableStorage && !!config.accessKey && !!config.secretKey && !!config.endPoint && !!config.bucketName;
}

// ── Utilities ──
function pad2(n) { return String(n).padStart(2, '0'); }

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}Z`;
}

function base64Encode(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
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
function generateObjectName(file) {
  const ext = ((file.name || 'image.png').split('.').pop() || 'png').toLowerCase();
  const now = new Date();
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${uuid}.${ext}`;
}

// ── Build bucket endpoint host ──
function buildBucketHost(config) {
  // Always use HTTPS for browser uploads (CORS requires it on most OSS regions)
  const host = config.endPoint.replace(/^https?:\/\//, '');
  return `${config.bucketName}.${host}`;
}

// ── POST Object upload (form-based, best CORS compatibility) ──
export async function uploadToOSS(file, options = {}) {
  const { skipEnableCheck = false, overrideConfig = null } = options;
  const config = overrideConfig || getStorageConfig();

  if (!skipEnableCheck && !config.enableStorage) {
    throw new Error('图床功能未启用，请在设置中开启');
  }
  if (!config.accessKey || !config.secretKey || !config.endPoint || !config.bucketName) {
    throw new Error('图床配置不完整，请检查 AccessKey / EndPoint / Bucket');
  }

  const objectName = generateObjectName(file);
  const bucketHost = buildBucketHost(config);

  // Build policy (expires in 1 hour)
  const expiration = new Date(Date.now() + 3600 * 1000);
  const policyObj = {
    expiration: toISODate(expiration),
    conditions: [
      { bucket: config.bucketName },
      ['starts-with', '$key', ''],
      ['content-length-range', 0, 50 * 1024 * 1024], // 50 MB max
    ],
  };
  const policyBase64 = base64Encode(JSON.stringify(policyObj));
  const signature = await hmacSha1Base64(config.secretKey, policyBase64);

  // Build FormData
  const formData = new FormData();
  formData.append('OSSAccessKeyId', config.accessKey);
  formData.append('policy', policyBase64);
  formData.append('Signature', signature);
  formData.append('key', objectName);
  formData.append('success_action_status', '200');
  formData.append('file', file);

  const uploadUrl = `https://${bucketHost}/`;

  let response;
  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    // Network error (CORS, DNS, etc.)
    if (networkErr.message?.includes('Failed to fetch') || networkErr.name === 'TypeError') {
      throw new Error(
        '网络请求被阻止。请检查：\n' +
        '1. 图床跨域设置 → 来源填 http://localhost:5173\n' +
        '2. 允许 Methods: POST, OPTIONS\n' +
        '3. 允许 Headers: *\n' +
        '4. 允许暴露 Headers: ETag\n' +
        '（配置后等 30 秒生效）',
      );
    }
    throw networkErr;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`图床上传失败 (${response.status}): ${errorText || response.statusText}`);
  }

  // Construct public URL from configured domain + basePath
  const domain = config.domain.replace(/\/$/, '');
  let basePath = (config.basePath || '').trim();
  if (basePath) {
    basePath = basePath.replace(/^\/+/, '').replace(/\/+$/, '');
  }
  return basePath
    ? `${domain}/${basePath}/${objectName}`
    : `${domain}/${objectName}`;
}

// ── Test OSS connectivity ──
export async function testOSSConnection(overrideConfig = null) {
  const testBlob = new Blob(['nice-md-connection-test'], { type: 'text/plain' });
  await uploadToOSS(new File([testBlob], 'nice-md-test.txt', { type: 'text/plain' }), {
    skipEnableCheck: true,
    overrideConfig,
  });
  return true;
}
