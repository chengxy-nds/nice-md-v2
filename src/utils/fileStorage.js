/** Browser-side upload adapters for supported image storage providers. */

import md5 from 'js-md5';
import { injectCachedSecrets, blankSecretsForSave } from './secureCredentials.js';
import { logger } from './logger.js';

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
  providers: {
    'aliyun-oss': {},
    'tencent-cos': {},
    'qiniu-kodo': { region: 'z0' },
    'upyun-uss': {},
    'huawei-obs': {},
    github: {},
    'custom-s3': { region: 'us-east-1' },
  },
};

const STORAGE_PROVIDERS = Object.keys(defaultConfig.providers);

const STORAGE_PROVIDER_LABELS = {
  'aliyun-oss': '阿里云 OSS',
  'tencent-cos': '腾讯云 COS',
  'qiniu-kodo': '七牛云 Kodo',
  'upyun-uss': '又拍云 USS',
  'huawei-obs': '华为云 OBS',
  github: 'GitHub',
  'custom-s3': '兼容 S3',
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
    if (saved) {
      const parsed = JSON.parse(saved);
      const providers = Object.fromEntries(STORAGE_PROVIDERS.map(id => [
        id,
        { ...(defaultConfig.providers[id] || {}), ...(parsed.providers?.[id] || {}) },
      ]));
      // Migrate the original flat OSS settings without losing existing credentials.
      providers['aliyun-oss'] = {
        accessKey: parsed.accessKey || '',
        secretKey: parsed.secretKey || '',
        endPoint: parsed.endPoint || '',
        bucketName: parsed.bucketName || '',
        domain: parsed.domain || '',
        basePath: parsed.basePath || '',
        ...(parsed.providers?.['aliyun-oss'] || {}),
      };
      // Item 4: a __secured config gets its OSS keys injected from the
      // session cache (populated by unlockSecureCredentials at startup).
      return injectCachedSecrets({ ...defaultConfig, ...parsed, providers }, 'oss');
    }
  } catch (e) { /* corrupted data — fall through */ }
  return {
    ...defaultConfig,
    providers: Object.fromEntries(STORAGE_PROVIDERS.map(id => [id, { ...defaultConfig.providers[id] }])),
  };
}

export function saveStorageConfig(config) {
  const normalized = {
    ...config,
    providers: Object.fromEntries(STORAGE_PROVIDERS.map(id => [
      id,
      { ...defaultConfig.providers[id], ...(config.providers?.[id] || {}) },
    ])),
  };
  normalized.providers['aliyun-oss'] = {
    accessKey: normalized.accessKey || '',
    secretKey: normalized.secretKey || '',
    endPoint: normalized.endPoint || '',
    bucketName: normalized.bucketName || '',
    domain: normalized.domain || '',
    basePath: normalized.basePath || '',
  };
  // Item 4: a __secured config is never persisted with its OSS keys in
  // plaintext again (blanked only when the encrypted envelope exists).
  blankSecretsForSave(normalized, 'oss');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export function getStorageProviderConfig(config = null, providerId = null) {
  const cfg = config || getStorageConfig();
  const id = providerId || cfg.platform || 'aliyun-oss';
  if (id === 'aliyun-oss') {
    return { ...(cfg.providers?.[id] || {}), ...cfg };
  }
  return { ...(cfg.providers?.[id] || {}) };
}

export function hasCustomStorageConfig(config = null) {
  const cfg = getStorageProviderConfig(config, 'aliyun-oss');
  const ak = (cfg.accessKey || '').trim();
  const sk = (cfg.secretKey || '').trim();
  const ep = (cfg.endPoint || '').trim();
  const bk = (cfg.bucketName || '').trim();
  return Boolean(ak && sk && ep && bk);
}

export function hasStorageProviderConfig(config = null, providerId = null) {
  const cfg = config || getStorageConfig();
  const id = providerId || cfg.platform || 'aliyun-oss';
  const provider = getStorageProviderConfig(cfg, id);
  const filled = (...keys) => keys.every(key => String(provider[key] || '').trim());
  switch (id) {
    case 'aliyun-oss': return hasCustomStorageConfig(cfg);
    case 'tencent-cos': return filled('secretId', 'secretKey', 'bucketName', 'region');
    case 'qiniu-kodo': return filled('accessKey', 'secretKey', 'bucketName', 'region', 'domain');
    case 'upyun-uss': return filled('operator', 'password', 'bucketName', 'domain');
    case 'huawei-obs': return filled('accessKey', 'secretKey', 'bucketName', 'endPoint');
    case 'github': return filled('token', 'owner', 'repo');
    case 'custom-s3': return filled('accessKey', 'secretKey', 'bucketName', 'endPoint');
    default: return false;
  }
}

export function isStorageEnabled() {
  const config = getStorageConfig();
  if (config.enableStorage === false) {
    return false;
  }
  if (hasStorageProviderConfig(config)) {
    return true;
  }
  return config.platform === 'aliyun-oss' && Boolean(cachedServerDefaultStatus?.hasDefault);
}

export function getActiveStorageSummary() {
  const config = getStorageConfig();
  const platform = config.platform || 'aliyun-oss';
  const usingServerDefault =
    !hasStorageProviderConfig(config) &&
    platform === 'aliyun-oss' &&
    Boolean(cachedServerDefaultStatus?.hasDefault);

  return {
    enabled: isStorageEnabled(),
    platform,
    label: usingServerDefault ? '默认云图床' : (STORAGE_PROVIDER_LABELS[platform] || '自定义图床'),
  };
}

// ── Utilities ──
function pad2(n) { return String(n).padStart(2, '0'); }

function base64Encode(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function toBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function toBase64Url(bytes) {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function digest(algorithm, value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return new Uint8Array(await crypto.subtle.digest(algorithm, bytes));
}

async function hmacBytes(algorithm, key, value) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: algorithm }, false, ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value)));
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
  return trimmed.split('/').filter(segment => segment && segment !== '.' && segment !== '..').join('/');
}

// ── OSS HMAC-SHA1 signing via Web Crypto API ──
async function hmacSha1Base64(keyStr, dataStr) {
  return toBase64(await hmacBytes('SHA-1', keyStr, dataStr));
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
    logger.error('[Custom OSS Upload Network Error]', networkErr);
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
    logger.error('[Custom OSS Upload HTTP Error]', response.status, errorText);
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
    logger.error('[Default OSS Upload Network Error]', networkErr);
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
    logger.error('[Default OSS Upload HTTP Error]', response.status, errorText);
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

function responseError(label, response, body) {
  return new Error(`${label}失败 (${response.status})${body ? `: ${body.slice(0, 500)}` : ''}`);
}

function buildPublicUrl(domain, fallbackHost, objectName) {
  const fallbackDomain = /^https?:\/\//i.test(fallbackHost || '')
    ? fallbackHost.replace(/\/+$/, '')
    : `https://${fallbackHost}`;
  const cleanDomain = domain?.trim() ? sanitizeDomain(domain, fallbackHost) : fallbackDomain;
  return `${cleanDomain}/${objectName.split('/').map(segment => encodeURIComponent(segment)).join('/')}`;
}

async function uploadToTencentCOS(file, config) {
  const module = await import('cos-js-sdk-v5');
  const COS = module.default || module;
  const cos = new COS({ SecretId: config.secretId.trim(), SecretKey: config.secretKey.trim() });
  const objectName = generateObjectName(file, config.basePath);
  await new Promise((resolve, reject) => {
    cos.putObject({
      Bucket: config.bucketName.trim(),
      Region: config.region.trim(),
      Key: objectName,
      Body: file,
      ContentType: file.type || 'application/octet-stream',
    }, (error, data) => error ? reject(error) : resolve(data));
  });
  const fallbackHost = `${config.bucketName.trim()}.cos.${config.region.trim()}.myqcloud.com`;
  return buildPublicUrl(config.domain, fallbackHost, objectName);
}

async function uploadToQiniu(file, config) {
  const objectName = generateObjectName(file, config.basePath);
  const policy = {
    scope: `${config.bucketName.trim()}:${objectName}`,
    deadline: Math.floor(Date.now() / 1000) + 3600,
    returnBody: '{"key":"$(key)"}',
  };
  const encodedPolicy = toBase64Url(new TextEncoder().encode(JSON.stringify(policy)));
  const signature = toBase64Url(await hmacBytes('SHA-1', config.secretKey.trim(), encodedPolicy));
  const token = `${config.accessKey.trim()}:${signature}:${encodedPolicy}`;
  const uploadHosts = {
    z0: 'https://upload.qiniup.com',
    z1: 'https://up-z1.qiniup.com',
    z2: 'https://up-z2.qiniup.com',
    na0: 'https://up-na0.qiniup.com',
    as0: 'https://up-as0.qiniup.com',
  };
  const body = new FormData();
  body.append('token', token);
  body.append('key', objectName);
  body.append('file', file, file.name || 'image');
  const response = await fetch(uploadHosts[config.region] || uploadHosts.z0, { method: 'POST', body });
  if (!response.ok) throw responseError('七牛云上传', response, await response.text().catch(() => ''));
  return buildPublicUrl(config.domain, 'upload.qiniup.com', objectName);
}

async function uploadToUpyun(file, config) {
  const bucket = config.bucketName.trim();
  const objectName = generateObjectName(file, config.basePath);
  const saveKey = `/${objectName}`;
  const date = new Date().toUTCString();
  const policy = toBase64(new TextEncoder().encode(JSON.stringify({
    bucket,
    'save-key': saveKey,
    expiration: String(Math.floor(Date.now() / 1000) + 1800),
    date,
    'content-type': file.type || 'application/octet-stream',
  })));
  const passwordMd5 = Uint8Array.from(md5.array(config.password));
  const signature = toBase64(await hmacBytes('SHA-1', passwordMd5, `POST&/${bucket}&${date}&${policy}&`));
  const body = new FormData();
  body.append('policy', policy);
  body.append('authorization', `UPYUN ${config.operator.trim()}:${signature}`);
  body.append('file', file, file.name || 'image');
  const response = await fetch(`https://v0.api.upyun.com/${encodeURIComponent(bucket)}`, { method: 'POST', body });
  if (!response.ok) throw responseError('又拍云上传', response, await response.text().catch(() => ''));
  return buildPublicUrl(config.domain, 'v0.api.upyun.com', objectName);
}

async function uploadToHuaweiOBS(file, config) {
  const bucket = config.bucketName.trim();
  const endpoint = config.endPoint.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  const objectName = generateObjectName(file, config.basePath);
  const policyJson = JSON.stringify({
    expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    conditions: [
      { bucket },
      ['eq', '$key', objectName],
      ['content-length-range', 0, 100 * 1024 * 1024],
    ],
  });
  const policy = base64Encode(policyJson);
  const signature = await hmacSha1Base64(config.secretKey.trim(), policy);
  const body = new FormData();
  body.append('key', objectName);
  body.append('AccessKeyId', config.accessKey.trim());
  body.append('policy', policy);
  body.append('signature', signature);
  body.append('content-type', file.type || 'application/octet-stream');
  body.append('file', file, file.name || 'image');
  const response = await fetch(`https://${bucket}.${endpoint}/`, { method: 'POST', body });
  if (!response.ok) throw responseError('华为云 OBS 上传', response, await response.text().catch(() => ''));
  return buildPublicUrl(config.domain, `${bucket}.${endpoint}`, objectName);
}

function awsEncode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function uploadToS3Compatible(file, config) {
  const endpoint = new URL(config.endPoint.trim());
  if (!['http:', 'https:'].includes(endpoint.protocol)) throw new Error('S3 Endpoint 必须以 http:// 或 https:// 开头');
  const objectName = generateObjectName(file, config.basePath);
  const path = `${endpoint.pathname.replace(/\/$/, '')}/${awsEncode(config.bucketName.trim())}/${objectName.split('/').map(awsEncode).join('/')}`.replace(/^$/, '/');
  const url = new URL(endpoint.origin);
  url.pathname = path.startsWith('/') ? path : `/${path}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = (config.region || 'us-east-1').trim();
  const payloadHash = bytesToHex(await digest('SHA-256', new Uint8Array(await file.arrayBuffer())));
  const contentType = file.type || 'application/octet-stream';
  const canonicalHeaders = `content-type:${contentType.trim()}\nhost:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = ['PUT', url.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${bytesToHex(await digest('SHA-256', canonicalRequest))}`;
  const dateKey = await hmacBytes('SHA-256', `AWS4${config.secretKey.trim()}`, dateStamp);
  const regionKey = await hmacBytes('SHA-256', dateKey, region);
  const serviceKey = await hmacBytes('SHA-256', regionKey, 's3');
  const signingKey = await hmacBytes('SHA-256', serviceKey, 'aws4_request');
  const signature = bytesToHex(await hmacBytes('SHA-256', signingKey, stringToSign));
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKey.trim()}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body: file,
  });
  if (!response.ok) throw responseError('S3 上传', response, await response.text().catch(() => ''));
  const encodedObjectPath = objectName.split('/').map(awsEncode).join('/');
  const objectPrefix = url.pathname.slice(0, Math.max(0, url.pathname.length - encodedObjectPath.length));
  return buildPublicUrl(config.domain, `${url.origin}${objectPrefix}`, objectName);
}

function arrayBufferToBase64(buffer) {
  return toBase64(new Uint8Array(buffer));
}

async function uploadToGitHub(file, config) {
  if (file.size > 100 * 1024 * 1024) throw new Error('GitHub Contents API 单文件最大支持 100 MB');
  const objectName = generateObjectName(file, config.basePath);
  const path = objectName.split('/').map(awsEncode).join('/');
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(config.owner.trim())}/${encodeURIComponent(config.repo.trim())}/contents/${path}`;
  const body = {
    message: `Upload image ${objectName}`,
    content: arrayBufferToBase64(await file.arrayBuffer()),
  };
  if (config.branch?.trim()) body.branch = config.branch.trim();
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token.trim()}`,
      'X-GitHub-Api-Version': '2026-03-10',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw responseError('GitHub 上传', response, data.message || '请检查仓库、分支和 Contents 写入权限');
  if (config.domain?.trim()) return buildPublicUrl(config.domain, '', objectName);
  const branch = config.branch?.trim() || (await getGitHubRepository(config)).default_branch;
  const branchPath = String(branch || 'main').split('/').map(awsEncode).join('/');
  return `https://raw.githubusercontent.com/${encodeURIComponent(config.owner.trim())}/${encodeURIComponent(config.repo.trim())}/${branchPath}/${path}`;
}

async function getGitHubRepository(config) {
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(config.owner.trim())}/${encodeURIComponent(config.repo.trim())}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token.trim()}`,
      'X-GitHub-Api-Version': '2026-03-10',
    },
  });
  if (!response.ok) throw responseError('GitHub 连接测试', response, await response.text().catch(() => ''));
  return response.json();
}

async function testGitHubConnection(config) {
  await getGitHubRepository(config);
  return true;
}

// ── Provider dispatch ──
export async function uploadToOSS(file, options = {}) {
  const { overrideConfig = null, skipEnableCheck = false } = options;
  const currentConfig = overrideConfig || getStorageConfig();
  const platform = currentConfig.platform || 'aliyun-oss';
  const providerConfig = getStorageProviderConfig(currentConfig, platform);
  if (hasStorageProviderConfig(currentConfig, platform)) {
    try {
      switch (platform) {
        case 'aliyun-oss': return await uploadToCustomOSS(file, providerConfig);
        case 'tencent-cos': return await uploadToTencentCOS(file, providerConfig);
        case 'qiniu-kodo': return await uploadToQiniu(file, providerConfig);
        case 'upyun-uss': return await uploadToUpyun(file, providerConfig);
        case 'huawei-obs': return await uploadToHuaweiOBS(file, providerConfig);
        case 'github': return await uploadToGitHub(file, providerConfig);
        case 'custom-s3': return await uploadToS3Compatible(file, providerConfig);
        default: break;
      }
    } catch (error) {
      if (error instanceof TypeError && /fetch|network/i.test(error.message || '')) {
        throw new Error('浏览器未能访问存储服务，请检查网络和该存储桶的 CORS 跨域规则。');
      }
      throw error;
    }
  }

  if (platform === 'aliyun-oss') {
    if (!cachedServerDefaultStatus) await checkServerDefaultOssAvailable();
    if (cachedServerDefaultStatus?.hasDefault) return uploadToServerDefaultOSS(file);
  }

  const message = `图床配置不完整，请检查 ${platform} 平台所需字段。`;
  if (!skipEnableCheck) throw new Error(message);
  throw new Error(message);
}

// Test GitHub access without creating an unwanted commit; other providers use a small test upload.
export async function testOSSConnection(overrideConfig = null) {
  const config = overrideConfig || getStorageConfig();
  const platform = config.platform || 'aliyun-oss';
  const providerConfig = getStorageProviderConfig(config, platform);
  if (platform === 'github') return testGitHubConnection(providerConfig);
  const testBlob = new Blob(['nice-md-connection-test'], { type: 'text/plain' });
  const testFile = new File([testBlob], 'nice-md-test.txt', { type: 'text/plain' });
  await uploadToOSS(testFile, {
    skipEnableCheck: true,
    overrideConfig: { ...config, platform },
  });
  return true;
}
