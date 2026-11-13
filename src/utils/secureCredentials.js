/**
 * Credential security layer (optimization item 4, non-destructive).
 *
 * Problem: GitHub PAT, OSS AK/SK and Neon/TiDB connection strings were
 * stored as plaintext JSON in localStorage, and Neon/TiDB drivers connect
 * directly from the browser. This module does NOT change any of that by
 * force — old plaintext configs keep working untouched.
 *
 * What it does:
 *  - New writes go through `prepareSecureSave()`: the secret is moved into
 *    an encrypted envelope (`nicemd_secure_<id>_v1`) and the persisted
 *    config only keeps a `__secured: true` marker with the secret blanked.
 *  - Storage modules blank the secret on ANY save of a `__secured`
 *    config (when the envelope exists), so no save path can accidentally
 *    re-persist the plaintext secret.
 *  - `unlockSecureCredentials()` decrypts all envelopes into an in-memory
 *    cache at app start; the sync getters inject the secret from that
 *    cache. Nothing is written to disk by unlocking.
 *  - `migrateLegacySecrets()` is an explicit user action: it moves a
 *    legacy plaintext secret into the envelope and rewrites the stored
 *    config blanked. It never deletes anything it cannot re-read.
 *
 * Honest limits (do not oversell this):
 *  - Web (AES-GCM via WebCrypto): the encryption key lives in the same
 *    browser storage, so this is protection against plaintext dumps,
 *    DevTools snooping and accidental leaks via exported settings — it is
 *    NOT protection against same-origin XSS (that is item 5's job).
 *  - Electron (safeStorage): real OS-level encryption (DPAPI / Keychain /
 *    libsecret) when `safeStorage.isEncryptionAvailable()` is true.
 *  - Network: TiDB already routes through the `/api/tidb-proxy` first
 *    (see tidbStorage.smartFetch); Neon has no proxy endpoint and still
 *    connects directly from the browser — the Settings UI warns about it.
 *    The server-default path (env vars on Vercel) keeps secrets 100%
 *    server-side; user-entered credentials in the web UI live in the
 *    browser by design and are only encrypted-at-rest by this layer.
 */

const ENVELOPE_PREFIX = 'nicemd_secure_';
const ENVELOPE_SUFFIX = '_v1';
const AES_KEY_STORAGE_KEY = 'nicemd_credential_key_v1';

// Provider registry. `secret` describes how the secret is carried inside
// the legacy config object stored under `legacyKey`.
export const SECURE_CREDENTIAL_PROVIDERS = {
  github: {
    label: 'GitHub',
    legacyKey: 'nicemd_github_sync_config_v1',
    event: 'nicemd-github-config-updated',
    secret: { kind: 'field', field: 'token' },
  },
  tidb: {
    label: 'TiDB Cloud',
    legacyKey: 'nicemd_tidb_sync_config_v1',
    event: 'nicemd-tidb-config-updated',
    secret: { kind: 'field', field: 'connectionString' },
  },
  neon: {
    label: 'Neon',
    legacyKey: 'nicemd_neon_sync_config_v1',
    event: 'nicemd-neon-config-updated',
    secret: { kind: 'field', field: 'connectionString' },
  },
  oss: {
    label: '阿里云 OSS 图床',
    legacyKey: 'nicemd_file_storage',
    event: null,
    // Top-level accessKey/secretKey (mirrored into providers['aliyun-oss']).
    // Other image-host providers' keys are NOT covered yet (follow-up).
    secret: { kind: 'oss-pair', fields: ['accessKey', 'secretKey'] },
  },
};

export const SECURE_CREDENTIAL_PROVIDER_IDS = Object.keys(SECURE_CREDENTIAL_PROVIDERS);

// ── Environment ─────────────────────────────────────────────────────────

export function isElectron() {
  return typeof window !== 'undefined' && Boolean(window.electronAPI && window.electronAPI.isElectron);
}

function hasWebCrypto() {
  return (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    globalThis.crypto.subtle &&
    typeof globalThis.crypto.subtle.encrypt === 'function'
  );
}

let secureStoreKindPromise = null;

/**
 * Where new secrets will be encrypted. Cached per page load.
 * 'electron' | 'aes-gcm' | 'unsupported' (falls back to legacy plaintext,
 * never breaks saving).
 */
export function getSecureStoreKind() {
  if (!secureStoreKindPromise) {
    secureStoreKindPromise = (async () => {
      if (isElectron() && typeof window.electronAPI.secureStorageAvailable === 'function') {
        try {
          if (await window.electronAPI.secureStorageAvailable()) return 'electron';
        } catch {
          // fall through to AES-GCM
        }
      }
      return hasWebCrypto() ? 'aes-gcm' : 'unsupported';
    })();
  }
  return secureStoreKindPromise;
}

// ── Envelope helpers ────────────────────────────────────────────────────

function envelopeKey(id) {
  return `${ENVELOPE_PREFIX}${id}${ENVELOPE_SUFFIX}`;
}

function readEnvelope(id) {
  try {
    const raw = localStorage.getItem(envelopeKey(id));
    if (!raw) return null;
    const env = JSON.parse(raw);
    if (env && env.v === 1 && typeof env.data === 'string' && (env.store === 'electron' || env.store === 'aes-gcm')) {
      return env;
    }
  } catch {
    // corrupted envelope — treat as absent, never throw on read
  }
  return null;
}

export function hasSecureSecret(id) {
  return readEnvelope(id) !== null;
}

function b64encode(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function b64decode(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── AES-GCM (web) ───────────────────────────────────────────────────────

let aesKeyPromise = null;

async function getAesKey() {
  if (!aesKeyPromise) {
    aesKeyPromise = (async () => {
      const stored = localStorage.getItem(AES_KEY_STORAGE_KEY);
      if (stored) {
        try {
          return await crypto.subtle.importKey('jwk', JSON.parse(stored), { name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
          ]);
        } catch {
          // corrupted key — generate a fresh one below
        }
      }
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      try {
        localStorage.setItem(AES_KEY_STORAGE_KEY, JSON.stringify(await crypto.subtle.exportKey('jwk', key)));
      } catch {
        // storage full/blocked — key still usable for this session
      }
      return key;
    })();
  }
  return aesKeyPromise;
}

async function aesEncrypt(plain) {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  return b64encode(packed);
}

async function aesDecrypt(data) {
  const packed = b64decode(data);
  const iv = packed.slice(0, 12);
  const cipher = packed.slice(12);
  const key = await getAesKey();
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

// ── Envelope encrypt / decrypt ──────────────────────────────────────────

export async function encryptSecret(plain) {
  const kind = await getSecureStoreKind();
  if (kind === 'electron') {
    const res = await window.electronAPI.secureEncrypt(String(plain));
    if (!res || !res.success) throw new Error((res && res.error) || 'Electron safeStorage encrypt failed');
    return { v: 1, store: 'electron', data: res.data };
  }
  if (kind === 'aes-gcm') {
    return { v: 1, store: 'aes-gcm', data: await aesEncrypt(String(plain)) };
  }
  throw new Error('No secure credential storage available in this environment');
}

export async function decryptSecret(envelope) {
  if (!envelope || envelope.v !== 1) throw new Error('Unsupported credential envelope');
  if (envelope.store === 'electron') {
    const res = await window.electronAPI.secureDecrypt(envelope.data);
    if (!res || !res.success) throw new Error((res && res.error) || 'Electron safeStorage decrypt failed');
    return String(res.data || '');
  }
  if (envelope.store === 'aes-gcm') {
    return await aesDecrypt(envelope.data);
  }
  throw new Error('Unsupported credential envelope store: ' + envelope.store);
}

// ── In-memory cache (session only, never persisted) ─────────────────────

const secretCache = new Map(); // id -> string (raw secret, or JSON for objects)

export function getCachedSecret(id) {
  return secretCache.has(id) ? secretCache.get(id) : null;
}

export async function storeSecret(id, value) {
  const plain = typeof value === 'string' ? value : JSON.stringify(value);
  const envelope = await encryptSecret(plain);
  localStorage.setItem(envelopeKey(id), JSON.stringify(envelope));
  secretCache.set(id, plain);
  return envelope;
}

export async function loadSecret(id) {
  if (secretCache.has(id)) return secretCache.get(id);
  const env = readEnvelope(id);
  if (!env) return null;
  const plain = await decryptSecret(env);
  secretCache.set(id, plain);
  return plain;
}

export function clearSecureSecret(id) {
  secretCache.delete(id);
  try {
    localStorage.removeItem(envelopeKey(id));
  } catch {
    // ignore
  }
}

/**
 * Decrypt every stored envelope into the session cache. Call once at app
 * start (before any sync init) and when the Settings modal opens.
 * Never throws; returns per-provider success flags.
 */
export async function unlockSecureCredentials() {
  const result = {};
  for (const id of SECURE_CREDENTIAL_PROVIDER_IDS) {
    if (!hasSecureSecret(id)) {
      result[id] = false;
      continue;
    }
    try {
      await loadSecret(id);
      result[id] = true;
    } catch (e) {
      console.warn(`[SecureCredentials] Failed to unlock ${id}:`, e);
      result[id] = false;
    }
  }
  return result;
}

// ── Config integration (sync-safe) ──────────────────────────────────────

/** Read the secret value out of a parsed legacy config object. */
export function readSecretFromConfig(id, config) {
  const meta = SECURE_CREDENTIAL_PROVIDERS[id];
  if (!meta || !config) return '';
  if (meta.secret.kind === 'field') return String(config[meta.secret.field] || '');
  if (meta.secret.kind === 'oss-pair') {
    const ak = String(config.accessKey || config.providers?.['aliyun-oss']?.accessKey || '');
    const sk = String(config.secretKey || config.providers?.['aliyun-oss']?.secretKey || '');
    return ak || sk ? JSON.stringify({ accessKey: ak, secretKey: sk }) : '';
  }
  return '';
}

/**
 * Sync getter hook: if the config is marked `__secured`, fill its secret
 * field(s) from the in-memory cache (populated by unlockSecureCredentials).
 * No-op when the cache is empty — callers then see a blank secret, exactly
 * as if no credential were configured, until unlock runs.
 */
export function injectCachedSecrets(config, id) {
  if (!config || config.__secured !== true) return config;
  const cached = getCachedSecret(id);
  if (cached === null) return config;
  const meta = SECURE_CREDENTIAL_PROVIDERS[id];
  if (!meta) return config;
  if (meta.secret.kind === 'field') {
    config[meta.secret.field] = cached;
  } else if (meta.secret.kind === 'oss-pair') {
    try {
      const pair = JSON.parse(cached);
      config.accessKey = pair.accessKey || '';
      config.secretKey = pair.secretKey || '';
      if (config.providers && config.providers['aliyun-oss']) {
        config.providers['aliyun-oss'].accessKey = pair.accessKey || '';
        config.providers['aliyun-oss'].secretKey = pair.secretKey || '';
      }
    } catch {
      // ignore corrupt cache entry
    }
  }
  return config;
}

/**
 * Sync saver hook: a `__secured` config must never be persisted with its
 * secret in plaintext again. Blank the secret field(s) — but ONLY when the
 * envelope exists, so a missing/corrupt envelope can never destroy the
 * only copy of a credential (fail-open, legacy plaintext preserved).
 */
export function blankSecretsForSave(config, id) {
  if (!config || config.__secured !== true || !hasSecureSecret(id)) return config;
  const meta = SECURE_CREDENTIAL_PROVIDERS[id];
  if (!meta) return config;
  if (meta.secret.kind === 'field') {
    config[meta.secret.field] = '';
  } else if (meta.secret.kind === 'oss-pair') {
    config.accessKey = '';
    config.secretKey = '';
    if (config.providers && config.providers['aliyun-oss']) {
      config.providers['aliyun-oss'].accessKey = '';
      config.providers['aliyun-oss'].secretKey = '';
    }
  }
  return config;
}

/**
 * Async save path for Settings UI: move the secret in `config` into the
 * encrypted envelope and return the config to persist (secret blanked,
 * `__secured: true`). If the config carries no secret, it is returned
 * unchanged (unless it was already secured, in which case the marker is
 * kept so the sync saver hook keeps blanking it).
 */
export async function prepareSecureSave(id, config) {
  if (!config) return config;
  const meta = SECURE_CREDENTIAL_PROVIDERS[id];
  if (!meta) return config;
  const secret = readSecretFromConfig(id, config);
  if (secret) {
    try {
      await storeSecret(id, secret);
      return { ...config, __secured: true };
    } catch (e) {
      console.warn(`[SecureCredentials] Could not encrypt ${id}, keeping legacy save:`, e);
      return config;
    }
  }
  return config;
}

// ── Status & migration ──────────────────────────────────────────────────

function readLegacyConfigRaw(id) {
  try {
    const raw = localStorage.getItem(SECURE_CREDENTIAL_PROVIDERS[id].legacyKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Sync status snapshot for the Settings UI. `legacyPlaintext` means the
 * secret is still sitting in the old plaintext config key.
 */
export function getCredentialSecurityStatus() {
  return SECURE_CREDENTIAL_PROVIDER_IDS.map((id) => {
    const meta = SECURE_CREDENTIAL_PROVIDERS[id];
    const legacy = readLegacyConfigRaw(id);
    const legacySecret = legacy ? readSecretFromConfig(id, legacy) : '';
    return {
      id,
      label: meta.label,
      secured: hasSecureSecret(id),
      legacyPlaintext: Boolean(legacySecret && legacySecret.trim()),
      configured: Boolean(legacySecret && legacySecret.trim()) || hasSecureSecret(id),
    };
  });
}

/**
 * Explicit user-triggered migration: move each legacy plaintext secret
 * into the encrypted envelope, then rewrite the stored config with the
 * secret blanked and `__secured: true`. A provider is only rewritten
 * after its secret was successfully encrypted and stored — a failure
 * leaves the plaintext untouched. Returns per-provider results.
 */
export async function migrateLegacySecrets() {
  const results = [];
  for (const id of SECURE_CREDENTIAL_PROVIDER_IDS) {
    const meta = SECURE_CREDENTIAL_PROVIDERS[id];
    const legacy = readLegacyConfigRaw(id);
    const secret = legacy ? readSecretFromConfig(id, legacy) : '';
    if (!secret || !secret.trim()) {
      results.push({ id, label: meta.label, migrated: false, reason: hasSecureSecret(id) ? 'already-secured' : 'not-configured' });
      continue;
    }
    try {
      await storeSecret(id, secret);
      const next = { ...legacy, __secured: true };
      blankSecretsForSave(next, id);
      localStorage.setItem(meta.legacyKey, JSON.stringify(next));
      // Notify listeners (Sidebar / cloudSync re-read via getters). A
      // listener failure must never report the migration itself as failed.
      try {
        if (meta.event && typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent(meta.event, { detail: next }));
        }
      } catch {
        // ignore
      }
      results.push({ id, label: meta.label, migrated: true });
    } catch (e) {
      results.push({ id, label: meta.label, migrated: false, reason: 'encrypt-failed', error: e.message });
    }
  }
  return results;
}
