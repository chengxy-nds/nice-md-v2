/**
 * GitHub Repository Bidirectional Cloud Sync Engine
 * Stores readable Markdown files organized by group folders alongside structured metadata in .nicemd/.
 * Uses GitHub Git Data API (Trees & Commits) for atomic single-commit synchronization.
 */

import { builtInThemeIds } from './themePresets.js';
import {
  pruneTombstones,
  mergeAllTombstones,
  loadSyncTombstones as loadLocalTombstones,
  saveSyncTombstones as saveLocalTombstones,
  recordEntityTimestamps as recordKnownTimestamps,
  recordDeletedTombstone as recordGithubTombstone,
} from './syncTombstones.js';
import { injectCachedSecrets, blankSecretsForSave } from './secureCredentials.js';
import { logger } from './logger.js';

export { recordGithubTombstone };

const GITHUB_CONFIG_KEY = 'nicemd_github_sync_config_v1';
const GITHUB_LAST_SYNC_KEY = 'nicemd_github_last_sync_timestamp';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const META_DIR = '.nicemd';
const INLINE_TREE_CHAR_LIMIT = 1.5 * 1024 * 1024;

// In-memory blob content cache keyed by Git blob SHA to avoid redundant fetches across syncs.
const blobTextCache = new Map();
// Cached last known remote manifest snapshot per repository key so unmodified histories/themes skip re-uploads.
const repoSyncCache = new Map();

// Serialized write mutex queue so concurrent edits/deletes never cause Git 422 ref conflicts.
let syncTaskChain = Promise.resolve();

function enqueueGithubTask(taskFn) {
  const run = syncTaskChain.then(taskFn, taskFn);
  syncTaskChain = run.catch(() => {});
  return run;
}

// ── Config Helpers ──

export function normalizeRepoInput(value = '') {
  return String(value || '').trim();
}

export function parseGithubRepoField(ownerRaw = '', repoRaw = '') {
  let owner = String(ownerRaw || '').trim();
  let repo = String(repoRaw || '').trim();

  // Tolerate users pasting full GitHub URL into either field.
  const combined = repo.includes('github.com') ? repo : (owner.includes('github.com') ? owner : '');
  if (combined) {
    const match = combined.match(/github\.com[:/]([^/\s]+)\/([^/\s#?]+)/i);
    if (match) {
      owner = match[1];
      repo = match[2].replace(/\.git$/i, '');
    }
  } else if (repo.includes('/')) {
    const [maybeOwner, maybeRepo] = repo.split('/').filter(Boolean);
    if (!owner && maybeOwner && maybeRepo) {
      owner = maybeOwner;
      repo = maybeRepo.replace(/\.git$/i, '');
    }
  }

  return {
    owner: owner.replace(/^@/, '').trim(),
    repo: repo.replace(/\.git$/i, '').trim(),
  };
}

export function sanitizeBasePath(basePath = '') {
  if (!basePath || typeof basePath !== 'string') return '';
  const trimmed = basePath.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed || trimmed === '1' || trimmed === '0' || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'null') {
    return '';
  }
  return trimmed
    .split('/')
    .map(s => s.trim())
    .filter(s => s && s !== '.' && s !== '..' && s !== META_DIR)
    .join('/');
}

export function getGithubConfig() {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      injectCachedSecrets(parsed, 'github');
      return {
        __secured: parsed.__secured === true,
        enabled: Boolean(parsed.enabled),
        token: String(parsed.token || ''),
        owner: String(parsed.owner || ''),
        repo: String(parsed.repo || ''),
        branch: String(parsed.branch || ''),
        basePath: String(parsed.basePath || ''),
        autoSync: parsed.autoSync !== false,
        lastSyncTime: Number(parsed.lastSyncTime) || 0,
      };
    }
  } catch (e) {
    logger.warn('[GitHub Sync] Failed to load config:', e);
  }
  return {
    enabled: false,
    token: '',
    owner: '',
    repo: '',
    branch: '',
    basePath: '',
    autoSync: true,
    lastSyncTime: 0,
  };
}

export function hasGithubCredentials(config = null) {
  const cfg = config || getGithubConfig();
  const { owner, repo } = parseGithubRepoField(cfg.owner, cfg.repo);
  return Boolean(String(cfg.token || '').trim() && owner && repo);
}

export function saveGithubConfig(config) {
  try {
    const { owner, repo } = parseGithubRepoField(config.owner, config.repo);
    const normalized = {
      enabled: Boolean(config.enabled),
      token: String(config.token || '').trim(),
      owner,
      repo,
      branch: String(config.branch || '').trim(),
      basePath: sanitizeBasePath(config.basePath || ''),
      autoSync: config.autoSync !== false,
      lastSyncTime: Number(config.lastSyncTime) || getGithubLastSyncTime(),
      __secured: Boolean(config.__secured),
    };
    // Item 4: a __secured config is never persisted with its token in
    // plaintext again (blanked only when the encrypted envelope exists).
    const toPersist = { ...normalized };
    blankSecretsForSave(toPersist, 'github');
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(toPersist));
    window.dispatchEvent(new CustomEvent('nicemd-github-config-updated', { detail: normalized }));
  } catch (e) {
    logger.error('[GitHub Sync] Failed to save config:', e);
  }
}

export function isGithubSyncEnabled() {
  const cfg = getGithubConfig();
  return Boolean(cfg.enabled && hasGithubCredentials(cfg));
}

export function getGithubLastSyncTime() {
  try {
    const t = localStorage.getItem(GITHUB_LAST_SYNC_KEY);
    return t ? parseInt(t, 10) : 0;
  } catch {
    return 0;
  }
}

export function setGithubLastSyncTime(timestamp = Date.now()) {
  try {
    localStorage.setItem(GITHUB_LAST_SYNC_KEY, String(timestamp));
  } catch {}
}

// ── Encoding & Hashing Utilities ──

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUtf8(base64Str = '') {
  const cleaned = String(base64Str).replace(/\s+/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

async function computeContentSha256(text = '') {
  const bytes = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return bytesToHex(new Uint8Array(digest));
}

async function computeGitBlobSha(text = '') {
  const contentBytes = new TextEncoder().encode(String(text));
  const headerBytes = new TextEncoder().encode(`blob ${contentBytes.length}\0`);
  const combined = new Uint8Array(headerBytes.length + contentBytes.length);
  combined.set(headerBytes, 0);
  combined.set(contentBytes, headerBytes.length);
  const digest = await crypto.subtle.digest('SHA-1', combined);
  return bytesToHex(new Uint8Array(digest));
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  const runners = Array.from({ length: Math.min(limit, items.length) }, () => next());
  await Promise.all(runners);
  return results;
}

// ── GitHub REST Client ──

function buildRepoContext(rawConfig) {
  const cfg = rawConfig && typeof rawConfig === 'object' ? rawConfig : getGithubConfig();
  const token = String(cfg.token || '').trim();
  const { owner, repo } = parseGithubRepoField(cfg.owner, cfg.repo);
  const branch = String(cfg.branch || '').trim();
  const basePath = sanitizeBasePath(cfg.basePath || '');

  if (!token) throw new Error('请填写 GitHub Personal Access Token');
  if (!owner || !repo) throw new Error('请填写有效的 GitHub 仓库拥有者与仓库名称');

  return {
    token,
    owner,
    repo,
    branch,
    basePath,
    repoKey: `${owner}/${repo}/${branch || 'default'}/${basePath}`,
  };
}

function buildMetaPath(basePath, filename) {
  return basePath ? `${basePath}/${META_DIR}/${filename}` : `${META_DIR}/${filename}`;
}

async function githubRequest(ctx, endpointPath, options = {}) {
  const url = `${GITHUB_API_BASE}${endpointPath}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${ctx.token}`,
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch (networkErr) {
    throw new Error(`无法连接 GitHub API: ${networkErr?.message || '请检查网络连接'}`);
  }

  if (res.status === 204) return null;

  const text = await res.text().catch(() => '');
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = { message: text }; }
  }

  if (!res.ok) {
    const apiMsg = data?.message || res.statusText || '请求失败';
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (res.status === 401) {
      throw new Error(`401 GitHub Token 鉴权失败，请检查 Token 是否正确或已过期 (${apiMsg})`);
    }
    if (res.status === 403 && remaining === '0') {
      throw new Error('GitHub API 请求速率已达上限，请稍后再试');
    }
    if (res.status === 403) {
      throw new Error(`403 权限不足，请确认 Token 对仓库 ${ctx.owner}/${ctx.repo} 具有 Contents 读写权限 (${apiMsg})`);
    }
    const err = new Error(`GitHub API 错误 (${res.status}): ${apiMsg}`);
    err.status = res.status;
    err.apiMessage = apiMsg;
    throw err;
  }

  return data;
}

async function getRepoMetadata(ctx) {
  try {
    return await githubRequest(ctx, `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}`);
  } catch (err) {
    if (err.status === 404) {
      throw new Error(`找不到仓库 ${ctx.owner}/${ctx.repo}，请核对名称并确认 Token 有权限访问该仓库`);
    }
    throw err;
  }
}

async function getBranchHeadState(ctx, branch) {
  try {
    const refData = await githubRequest(
      ctx,
      `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/ref/heads/${branch.split('/').map(encodeURIComponent).join('/')}`
    );
    const commitSha = refData?.object?.sha;
    if (!commitSha) return { isEmpty: true, commitSha: null, treeSha: null, committedAt: 0 };

    const commitData = await githubRequest(
      ctx,
      `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/commits/${commitSha}`
    );
    const committedAt = commitData?.committer?.date ? Date.parse(commitData.committer.date) : Date.now();
    return {
      isEmpty: false,
      commitSha,
      treeSha: commitData?.tree?.sha,
      committedAt: Number.isFinite(committedAt) ? committedAt : Date.now(),
    };
  } catch (err) {
    // 409 Git Repository is empty OR 404 branch not created yet
    if (err.status === 409 || err.status === 404) {
      return { isEmpty: true, commitSha: null, treeSha: null, committedAt: 0, missingBranch: err.status === 404 };
    }
    throw err;
  }
}

async function getTreeEntries(ctx, treeSha) {
  const treeRes = await githubRequest(
    ctx,
    `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/trees/${treeSha}?recursive=1`
  );
  const items = Array.isArray(treeRes?.tree) ? treeRes.tree : [];
  return items.filter(item => item.type === 'blob');
}

async function fetchBlobText(ctx, blobSha) {
  if (!blobSha) return '';
  if (blobTextCache.has(blobSha)) {
    return blobTextCache.get(blobSha);
  }
  const data = await githubRequest(
    ctx,
    `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/blobs/${blobSha}`
  );
  const text = data?.encoding === 'base64' ? base64ToUtf8(data.content || '') : String(data?.content || '');
  // Cap in-memory cache size to keep RAM tidy.
  if (blobTextCache.size > 1000) blobTextCache.clear();
  blobTextCache.set(blobSha, text);
  return text;
}

// ── Path Mapping Helpers (Group Folder / Readable Markdown Filename) ──

function sanitizePathSegment(rawName, fallback) {
  let cleaned = String(rawName || '')
    // Intentional: strip control characters (incl. NUL) from file/folder names.
    // eslint-disable-next-line no-control-regex
    .replace(/[/\\:*?"<>|\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .trim();

  if (!cleaned || cleaned === META_DIR || cleaned === '_trash') {
    cleaned = fallback;
  }
  if (cleaned.length > 80) {
    cleaned = cleaned.slice(0, 80).trim();
  }
  return cleaned || fallback;
}

function buildGroupFolderMap(groups = []) {
  const map = new Map();
  const usedFolders = new Set();
  const sorted = [...groups].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || String(a.id).localeCompare(String(b.id)));

  for (const g of sorted) {
    const base = sanitizePathSegment(g.name, '新建分组');
    let candidate = base;
    if (usedFolders.has(candidate.toLowerCase())) {
      candidate = `${base}-${String(g.id).slice(-4)}`;
    }
    usedFolders.add(candidate.toLowerCase());
    map.set(g.id, candidate);
  }
  return map;
}

function buildDocFilePathMap(docs = [], groups = [], basePath = '') {
  const groupFolderMap = buildGroupFolderMap(groups);
  const pathMap = new Map();
  const usedPaths = new Set();

  // Deterministic order ensures any two devices compute identical paths for duplicate titles.
  const activeDocs = [...docs]
    .filter(d => d && !d.isDeleted && !d.is_deleted)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || String(a.id).localeCompare(String(b.id)));

  for (const doc of activeDocs) {
    const folderName = doc.groupId && groupFolderMap.has(doc.groupId) ? groupFolderMap.get(doc.groupId) : '';
    const titlePart = sanitizePathSegment(doc.title, '无标题文档');
    const dirPrefix = [basePath, folderName].filter(Boolean).join('/');

    let filename = `${titlePart}.md`;
    let fullPath = dirPrefix ? `${dirPrefix}/${filename}` : filename;
    if (usedPaths.has(fullPath.toLowerCase())) {
      filename = `${titlePart}-${String(doc.id).slice(-5)}.md`;
      fullPath = dirPrefix ? `${dirPrefix}/${filename}` : filename;
    }
    usedPaths.add(fullPath.toLowerCase());
    pathMap.set(doc.id, fullPath);
  }

  return pathMap;
}

function isManagedMarkdownPath(filePath, basePath) {
  if (!filePath || !filePath.toLowerCase().endsWith('.md')) return false;
  if (basePath) {
    if (!filePath.startsWith(`${basePath}/`)) return false;
    const rel = filePath.slice(basePath.length + 1);
    return !rel.startsWith(`${META_DIR}/`);
  }
  return !filePath.startsWith(`${META_DIR}/`);
}

function deterministicExternalDocId(relativePath) {
  // Pure JS FNV-1a + length hash for synchronous deterministic ID of externally created .md files.
  let h1 = 0x811c9dc5;
  for (let i = 0; i < relativePath.length; i++) {
    h1 ^= relativePath.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return `gh-${(h1 >>> 0).toString(36)}-${relativePath.length.toString(36)}`;
}

// ── Snapshot Reader (Pull from GitHub) ──

async function readRemoteState(ctx) {
  const repoInfo = await getRepoMetadata(ctx);
  if (repoInfo.permissions && repoInfo.permissions.push === false) {
    // Allow read operations, record permission flag for testConnection and write errors.
  }

  const targetBranch = ctx.branch || repoInfo.default_branch || 'main';
  const headState = await getBranchHeadState(ctx, targetBranch);

  if (headState.isEmpty) {
    return {
      repoInfo,
      branch: targetBranch,
      isEmpty: true,
      commitSha: null,
      committedAt: 0,
      treeMap: new Map(),
      manifest: null,
      docs: [],
      groups: [],
      histories: [],
      customThemes: [],
      tombstones: { docs: {}, groups: {}, histories: {}, clearedHistoryDocs: {}, themes: {} },
      hasExternalChanges: false,
    };
  }

  const treeBlobs = await getTreeEntries(ctx, headState.treeSha);
  const treeMap = new Map(treeBlobs.map(item => [item.path, item]));

  const manifestPath = buildMetaPath(ctx.basePath, 'manifest.json');
  const historiesPath = buildMetaPath(ctx.basePath, 'histories.json');
  const themesPath = buildMetaPath(ctx.basePath, 'custom-themes.json');
  const trashPath = buildMetaPath(ctx.basePath, 'trash-docs.json');

  // Read metadata JSONs in parallel if present
  const [manifestText, historiesText, themesText, trashText] = await Promise.all([
    treeMap.has(manifestPath) ? fetchBlobText(ctx, treeMap.get(manifestPath).sha) : Promise.resolve(null),
    treeMap.has(historiesPath) ? fetchBlobText(ctx, treeMap.get(historiesPath).sha) : Promise.resolve(null),
    treeMap.has(themesPath) ? fetchBlobText(ctx, treeMap.get(themesPath).sha) : Promise.resolve(null),
    treeMap.has(trashPath) ? fetchBlobText(ctx, treeMap.get(trashPath).sha) : Promise.resolve(null),
  ]);

  let manifest = null;
  if (manifestText) {
    try { manifest = JSON.parse(manifestText); } catch {}
  }

  let histories = [];
  if (historiesText) {
    try {
      const parsed = JSON.parse(historiesText);
      if (Array.isArray(parsed)) histories = parsed;
    } catch {}
  }

  let customThemes = [];
  if (themesText) {
    try {
      const parsed = JSON.parse(themesText);
      if (Array.isArray(parsed)) {
        customThemes = parsed.filter(t => t && t.id && !builtInThemeIds.has(t.id));
      }
    } catch {}
  }

  let trashDocs = [];
  if (trashText) {
    try {
      const parsed = JSON.parse(trashText);
      if (Array.isArray(parsed)) trashDocs = parsed;
    } catch {}
  }

  const groups = Array.isArray(manifest?.groups) ? manifest.groups.map(g => ({
    id: g.id,
    name: g.name || '新建分组',
    collapsed: Boolean(g.collapsed),
    sortOrder: Number(g.sortOrder) || 0,
    createdAt: Number(g.createdAt) || Date.now(),
    updatedAt: Number(g.updatedAt) || Date.now(),
  })) : [];

  const manifestDocs = Array.isArray(manifest?.documents) ? manifest.documents : [];
  const trashContentMap = new Map(trashDocs.map(td => [td.id, td]));
  const indexedPaths = new Set();
  const docsToFetch = [];

  for (const meta of manifestDocs) {
    if (!meta || !meta.id) continue;
    if (meta.isDeleted) continue;
    if (meta.filePath && treeMap.has(meta.filePath)) {
      indexedPaths.add(meta.filePath);
      docsToFetch.push({ meta, treeEntry: treeMap.get(meta.filePath) });
    }
  }

  // Also detect externally added .md files in GitHub repo under basePath
  const externalMdEntries = [];
  for (const [path, entry] of treeMap.entries()) {
    if (isManagedMarkdownPath(path, ctx.basePath) && !indexedPaths.has(path)) {
      externalMdEntries.push({ path, entry });
    }
  }

  const fetchedIndexed = await mapWithConcurrency(docsToFetch, 6, async ({ meta, treeEntry }) => {
    const markdown = await fetchBlobText(ctx, treeEntry.sha);
    const actualHash = await computeContentSha256(markdown);
    const externallyEdited = Boolean(meta.blobSha && treeEntry.sha !== meta.blobSha && actualHash !== meta.contentHash);
    return {
      meta,
      markdown,
      actualHash,
      actualBlobSha: treeEntry.sha,
      externallyEdited,
    };
  });

  const fetchedExternal = await mapWithConcurrency(externalMdEntries, 6, async ({ path, entry }) => {
    const markdown = await fetchBlobText(ctx, entry.sha);
    const actualHash = await computeContentSha256(markdown);
    return { path, sha: entry.sha, markdown, actualHash };
  });

  let hasExternalChanges = fetchedExternal.length > 0;
  const docs = [];

  for (const item of fetchedIndexed) {
    const { meta, markdown, externallyEdited } = item;
    if (externallyEdited) hasExternalChanges = true;
    const effectiveUpdatedAt = externallyEdited
      ? Math.max(Number(meta.updatedAt) || 0, headState.committedAt || Date.now())
      : (Number(meta.updatedAt) || Date.now());

    docs.push({
      id: meta.id,
      title: meta.title || '无标题文档',
      content: markdown,
      markdown,
      groupId: meta.groupId || null,
      themeId: meta.themeId || 'default',
      codeThemeId: meta.codeThemeId || 'atom-one-dark',
      fontSize: meta.fontSize || '16px',
      customStyles: meta.customStyles || {},
      isFavorite: Boolean(meta.isFavorite),
      isDeleted: false,
      sortOrder: Number(meta.sortOrder) || 0,
      createdAt: Number(meta.createdAt) || Date.now(),
      updatedAt: effectiveUpdatedAt,
    });
  }

  // Merge trash documents
  for (const meta of manifestDocs) {
    if (!meta || !meta.id || !meta.isDeleted) continue;
    const trashBody = trashContentMap.get(meta.id);
    const md = trashBody?.markdown ?? trashBody?.content ?? '';
    docs.push({
      id: meta.id,
      title: meta.title || '无标题文档',
      content: md,
      markdown: md,
      groupId: meta.groupId || null,
      themeId: meta.themeId || 'default',
      codeThemeId: meta.codeThemeId || 'atom-one-dark',
      fontSize: meta.fontSize || '16px',
      customStyles: meta.customStyles || {},
      isFavorite: Boolean(meta.isFavorite),
      isDeleted: true,
      sortOrder: Number(meta.sortOrder) || 0,
      createdAt: Number(meta.createdAt) || Date.now(),
      updatedAt: Number(meta.updatedAt) || Date.now(),
    });
  }

  // Import externally created .md files (e.g. added via GitHub web UI or git push)
  const groupNameToId = new Map(groups.map(g => [sanitizePathSegment(g.name, '新建分组').toLowerCase(), g.id]));
  for (const ext of fetchedExternal) {
    const rel = ctx.basePath ? ext.path.slice(ctx.basePath.length + 1) : ext.path;
    const parts = rel.split('/');
    const filename = parts.pop() || '未命名文档.md';
    const rawTitle = filename.replace(/\.md$/i, '') || '未命名文档';
    const folderName = parts.join(' / ').trim();

    let groupId = null;
    if (folderName) {
      const folderKey = sanitizePathSegment(parts[0], '新建分组').toLowerCase();
      if (groupNameToId.has(folderKey)) {
        groupId = groupNameToId.get(folderKey);
      } else {
        const newGroupId = `gh-grp-${deterministicExternalDocId(parts[0])}`;
        const nowTs = headState.committedAt || Date.now();
        const newGroup = {
          id: newGroupId,
          name: parts[0],
          collapsed: false,
          sortOrder: groups.length,
          createdAt: nowTs,
          updatedAt: nowTs,
        };
        groups.push(newGroup);
        groupNameToId.set(folderKey, newGroupId);
        groupId = newGroupId;
      }
    }

    const nowTs = headState.committedAt || Date.now();
    docs.push({
      id: deterministicExternalDocId(rel),
      title: rawTitle,
      content: ext.markdown,
      markdown: ext.markdown,
      groupId,
      themeId: 'default',
      codeThemeId: 'atom-one-dark',
      fontSize: '16px',
      customStyles: {},
      isFavorite: false,
      isDeleted: false,
      sortOrder: docs.length,
      createdAt: nowTs,
      updatedAt: nowTs,
    });
  }

  return {
    repoInfo,
    branch: targetBranch,
    isEmpty: false,
    commitSha: headState.commitSha,
    treeSha: headState.treeSha,
    committedAt: headState.committedAt,
    treeMap,
    manifest,
    docs,
    groups,
    histories,
    customThemes: customThemes.map(t => ({ ...t, isCustom: true, builtIn: false })),
    tombstones: pruneTombstones(manifest?.tombstones || {}),
    hasExternalChanges,
  };
}

// ── Snapshot Writer (Atomic Commit via Git Trees API) ──

async function buildDesiredRepoFiles(ctx, docs = [], groups = [], histories = [], customThemes = [], tombstones = {}, remoteState = null) {
  const filePathMap = buildDocFilePathMap(docs, groups, ctx.basePath);
  const desiredFiles = new Map(); // path -> string content

  const manifestDocs = [];
  const trashDocs = [];

  for (const d of docs) {
    if (!d || !d.id) continue;
    const isDel = Boolean(d.isDeleted || d.is_deleted);
    const md = String(d.content ?? d.markdown ?? '');
    const contentHash = await computeContentSha256(md);

    if (isDel) {
      manifestDocs.push({
        id: d.id,
        title: d.title || '无标题文档',
        groupId: d.groupId || null,
        themeId: d.themeId || 'default',
        codeThemeId: d.codeThemeId || 'atom-one-dark',
        fontSize: d.fontSize || '16px',
        customStyles: d.customStyles || {},
        isFavorite: Boolean(d.isFavorite),
        isDeleted: true,
        sortOrder: Number(d.sortOrder) || 0,
        createdAt: Number(d.createdAt) || Date.now(),
        updatedAt: Number(d.updatedAt) || Date.now(),
        filePath: null,
        contentHash,
        blobSha: null,
      });
      trashDocs.push({ id: d.id, markdown: md });
    } else {
      const filePath = filePathMap.get(d.id);
      const blobSha = await computeGitBlobSha(md);
      desiredFiles.set(filePath, md);
      manifestDocs.push({
        id: d.id,
        title: d.title || '无标题文档',
        groupId: d.groupId || null,
        themeId: d.themeId || 'default',
        codeThemeId: d.codeThemeId || 'atom-one-dark',
        fontSize: d.fontSize || '16px',
        customStyles: d.customStyles || {},
        isFavorite: Boolean(d.isFavorite),
        isDeleted: false,
        sortOrder: Number(d.sortOrder) || 0,
        createdAt: Number(d.createdAt) || Date.now(),
        updatedAt: Number(d.updatedAt) || Date.now(),
        filePath,
        contentHash,
        blobSha,
      });
    }
  }

  const normalizedGroups = (groups || []).filter(Boolean).map((g, idx) => ({
    id: g.id,
    name: g.name || '新建分组',
    collapsed: Boolean(g.collapsed),
    sortOrder: Number(g.sortOrder ?? idx),
    createdAt: Number(g.createdAt) || Date.now(),
    updatedAt: Number(g.updatedAt) || Date.now(),
  }));

  const normalizedThemes = (customThemes || [])
    .filter(t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || String(t.id).startsWith('custom-')))
    .map(t => ({
      id: t.id,
      name: t.name || '自定义主题',
      icon: t.icon || 'Palette',
      dark: Boolean(t.dark),
      description: t.description || '用户自定义主题',
      tag: t.tag || '我的主题',
      isCustom: true,
      builtIn: false,
      customStyles: t.customStyles || {},
      styles: t.styles || {},
      customCss: t.customCss || '',
      createdAt: Number(t.createdAt) || Date.now(),
      updatedAt: Number(t.updatedAt) || Date.now(),
    }));

  const normalizedHistories = (histories || []).filter(h => h && h.id && h.docId).map(h => ({
    id: h.id,
    docId: h.docId,
    title: h.title || '',
    name: h.name || (h.type === 'manual' ? '手动快照' : '自动保存'),
    type: h.type || 'auto',
    content: h.content || '',
    customStyles: h.customStyles || null,
    charCount: Number(h.charCount) || 0,
    wordCount: Number(h.wordCount) || 0,
    lineCount: Number(h.lineCount) || 0,
    createdAt: Number(h.createdAt) || Date.now(),
    updatedAt: Number(h.updatedAt || h.createdAt) || Date.now(),
  }));

  const manifestObj = {
    schemaVersion: 1,
    groups: normalizedGroups,
    documents: manifestDocs,
    tombstones: pruneTombstones(tombstones),
  };

  desiredFiles.set(buildMetaPath(ctx.basePath, 'manifest.json'), JSON.stringify(manifestObj, null, 2));
  desiredFiles.set(buildMetaPath(ctx.basePath, 'histories.json'), JSON.stringify(normalizedHistories));
  desiredFiles.set(buildMetaPath(ctx.basePath, 'custom-themes.json'), JSON.stringify(normalizedThemes));
  if (trashDocs.length > 0) {
    desiredFiles.set(buildMetaPath(ctx.basePath, 'trash-docs.json'), JSON.stringify(trashDocs));
  }

  // Only delete stale .md files previously managed by NiceMD (never touch unrelated files in the repo).
  const pathsToDelete = new Set();
  const prevIndexed = Array.isArray(remoteState?.manifest?.documents) ? remoteState.manifest.documents : [];
  for (const prevDoc of prevIndexed) {
    if (prevDoc?.filePath && !desiredFiles.has(prevDoc.filePath)) {
      if (remoteState?.treeMap?.has(prevDoc.filePath)) {
        pathsToDelete.add(prevDoc.filePath);
      }
    }
  }
  const trashPath = buildMetaPath(ctx.basePath, 'trash-docs.json');
  if (trashDocs.length === 0 && remoteState?.treeMap?.has(trashPath)) {
    pathsToDelete.add(trashPath);
  }

  return { desiredFiles, pathsToDelete };
}

async function createBlobOnGithub(ctx, textContent) {
  const bytes = new TextEncoder().encode(textContent);
  const res = await githubRequest(
    ctx,
    `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/blobs`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: bytesToBase64(bytes),
        encoding: 'base64',
      }),
    }
  );
  blobTextCache.set(res.sha, textContent);
  return res.sha;
}

async function commitDesiredFiles(ctx, remoteState, desiredFiles, pathsToDelete, commitMessage) {
  if (remoteState.repoInfo?.permissions?.push === false) {
    throw new Error(`Token 对仓库 ${ctx.owner}/${ctx.repo} 仅有只读权限，请在 GitHub 赋予 Contents: Read and write 写入权限`);
  }

  const branch = remoteState.branch;
  let currentCommitSha = remoteState.commitSha;
  let currentTreeSha = remoteState.treeSha;
  const existingTreeMap = new Map(remoteState.treeMap || []);

  // Initialize brand new empty repository or missing target branch with manifest.json first.
  if (remoteState.isEmpty) {
    if (remoteState.missingBranch && !remoteState.repoInfo.size) {
      // Truly empty repository (size 0): Contents API PUT bootstraps default branch.
    }
    const manifestPath = buildMetaPath(ctx.basePath, 'manifest.json');
    const bootstrapContent = desiredFiles.get(manifestPath) || JSON.stringify({ schemaVersion: 1, groups: [], documents: [] }, null, 2);
    const bootstrapBytes = new TextEncoder().encode(bootstrapContent);

    await githubRequest(
      ctx,
      `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/contents/${manifestPath.split('/').map(encodeURIComponent).join('/')}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'chore: initialize EasyMD sync metadata',
          content: bytesToBase64(bootstrapBytes),
          branch: ctx.branch || undefined,
        }),
      }
    );

    const freshHead = await getBranchHeadState(ctx, branch);
    currentCommitSha = freshHead.commitSha;
    currentTreeSha = freshHead.treeSha;
    const entries = await getTreeEntries(ctx, currentTreeSha);
    entries.forEach(item => existingTreeMap.set(item.path, item));
  }

  // Compute exact incremental diff against current Git tree blobs via Git Blob SHA-1.
  const filesToWrite = [];
  let estimatedInlineChars = 0;

  for (const [filePath, content] of desiredFiles.entries()) {
    const localBlobSha = await computeGitBlobSha(content);
    const existingEntry = existingTreeMap.get(filePath);
    if (existingEntry && existingEntry.sha === localBlobSha) {
      // Cache text under its exact blob SHA for instant reads later.
      blobTextCache.set(localBlobSha, content);
      continue;
    }
    estimatedInlineChars += content.length + filePath.length;
    filesToWrite.push({ filePath, content, localBlobSha });
  }

  const deletions = Array.from(pathsToDelete).filter(p => existingTreeMap.has(p));

  if (filesToWrite.length === 0 && deletions.length === 0) {
    return { committed: false, commitSha: currentCommitSha };
  }

  // Use inline content for normal payloads; switch to explicit blob creation for very large batches.
  let treeEntries = [];
  if (estimatedInlineChars <= INLINE_TREE_CHAR_LIMIT) {
    treeEntries = filesToWrite.map(f => ({
      path: f.filePath,
      mode: '100644',
      type: 'blob',
      content: f.content,
    }));
  } else {
    const createdBlobs = await mapWithConcurrency(filesToWrite, 4, async (f) => {
      const sha = await createBlobOnGithub(ctx, f.content);
      return { path: f.filePath, mode: '100644', type: 'blob', sha };
    });
    treeEntries.push(...createdBlobs);
  }

  for (const delPath of deletions) {
    treeEntries.push({
      path: delPath,
      mode: '100644',
      type: 'blob',
      sha: null,
    });
  }

  const newTree = await githubRequest(
    ctx,
    `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/trees`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_tree: currentTreeSha,
        tree: treeEntries,
      }),
    }
  );

  const newCommit = await githubRequest(
    ctx,
    `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/commits`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: commitMessage,
        tree: newTree.sha,
        parents: [currentCommitSha],
      }),
    }
  );

  await githubRequest(
    ctx,
    `/repos/${encodeURIComponent(ctx.owner)}/${encodeURIComponent(ctx.repo)}/git/refs/heads/${branch.split('/').map(encodeURIComponent).join('/')}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sha: newCommit.sha,
        force: false,
      }),
    }
  );

  for (const f of filesToWrite) {
    blobTextCache.set(f.localBlobSha, f.content);
  }

  return { committed: true, commitSha: newCommit.sha, filesChanged: filesToWrite.length + deletions.length };
}

// ── Public Sync API (Aligned with TiDB / Neon Storage Modules) ──

/**
 * Verify GitHub token, repository existence, push permission, and count synced entities.
 */
export async function testGithubConnection(config) {
  const ctx = buildRepoContext(config);
  const state = await readRemoteState(ctx);
  const activeDocs = state.docs.filter(d => !d.isDeleted);

  return {
    ok: true,
    repoFullName: state.repoInfo.full_name,
    isPrivate: Boolean(state.repoInfo.private),
    branch: state.branch,
    canPush: state.repoInfo.permissions ? Boolean(state.repoInfo.permissions.push) : true,
    isEmptyRepo: state.isEmpty,
    docCount: activeDocs.length,
    groupCount: state.groups.length,
    historyCount: state.histories.length,
    themeCount: state.customThemes.length,
  };
}

/**
 * Pull all documents, groups, histories & custom themes from GitHub repository.
 */
export async function pullFromGithub(config) {
  const ctx = buildRepoContext(config || getGithubConfig());
  const state = await readRemoteState(ctx);
  repoSyncCache.set(ctx.repoKey, state.commitSha);
  recordKnownTimestamps(state.docs, state.groups, state.histories, state.customThemes);
  setGithubLastSyncTime();
  return {
    docs: state.docs,
    groups: state.groups,
    histories: state.histories,
    customThemes: state.customThemes,
  };
}

/**
 * Full Push: Backup all local documents, groups, histories & custom themes to GitHub repository.
 */
export function pushAllToGithub(
  config,
  localDocs = [],
  localGroups = [],
  localHistories = [],
  localCustomThemes = []
) {
  return enqueueGithubTask(async () => {
    const ctx = buildRepoContext(config || getGithubConfig());
    const remoteState = await readRemoteState(ctx);
    const tombstones = mergeAllTombstones(loadLocalTombstones(), remoteState.tombstones);

    const validThemes = (localCustomThemes || []).filter(
      t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || String(t.id).startsWith('custom-'))
    );

    const { desiredFiles, pathsToDelete } = await buildDesiredRepoFiles(
      ctx,
      localDocs,
      localGroups,
      localHistories,
      validThemes,
      tombstones,
      remoteState
    );

    const activeCount = localDocs.filter(d => !d.isDeleted && !d.is_deleted).length;
    const commitMsg = `backup: 同步备份 ${activeCount} 篇文档与 ${localGroups.length} 个分组`;

    let commitRes;
    try {
      commitRes = await commitDesiredFiles(ctx, remoteState, desiredFiles, pathsToDelete, commitMsg);
    } catch (err) {
      if (err.status === 409 || err.status === 422) {
        const refreshed = await readRemoteState(ctx);
        const retryBuilt = await buildDesiredRepoFiles(
          ctx,
          localDocs,
          localGroups,
          localHistories,
          validThemes,
          mergeAllTombstones(loadLocalTombstones(), refreshed.tombstones),
          refreshed
        );
        commitRes = await commitDesiredFiles(ctx, refreshed, retryBuilt.desiredFiles, retryBuilt.pathsToDelete, commitMsg);
      } else {
        throw err;
      }
    }

    if (commitRes.commitSha) repoSyncCache.set(ctx.repoKey, commitRes.commitSha);
    recordKnownTimestamps(localDocs, localGroups, localHistories, validThemes);
    saveLocalTombstones(tombstones);
    setGithubLastSyncTime();

    return {
      pushedDocs: localDocs.length,
      pushedGroups: localGroups.length,
      pushedHistories: localHistories.length,
      pushedThemes: validThemes.length,
      committed: commitRes.committed,
    };
  });
}

function reconcileEntities(
  localItems = [],
  cloudItems = [],
  localTombstoneBucket = {},
  cloudTombstoneBucket = {},
  getTs = item => item.updatedAt || 0,
  isClearedFn = null
) {
  const localMap = new Map(localItems.filter(Boolean).map(item => [item.id, item]));
  const cloudMap = new Map(cloudItems.filter(Boolean).map(item => [item.id, item]));
  const merged = [];
  let hasUploadNeed = false;
  const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);

  for (const id of allIds) {
    const local = localMap.get(id);
    const cloud = cloudMap.get(id);
    const localDeletedAt = Number(localTombstoneBucket[id]) || 0;
    const cloudDeletedAt = Number(cloudTombstoneBucket[id]) || 0;

    if (local && cloud) {
      const localTs = Number(getTs(local)) || 0;
      const cloudTs = Number(getTs(cloud)) || 0;
      if (localTs >= cloudTs) {
        merged.push(local);
        if (localTs > cloudTs) hasUploadNeed = true;
      } else {
        merged.push(cloud);
      }
    } else if (local && !cloud) {
      const localTs = Number(getTs(local)) || 0;
      if (cloudDeletedAt > localTs || (isClearedFn && isClearedFn(local, localTs, 'cloud'))) {
        // Permanently deleted on another device more recently; remove locally.
        continue;
      }
      merged.push(local);
      hasUploadNeed = true;
    } else if (!local && cloud) {
      const cloudTs = Number(getTs(cloud)) || 0;
      if (localDeletedAt >= cloudTs || (isClearedFn && isClearedFn(cloud, cloudTs, 'local'))) {
        // Deleted locally; propagate tombstone rather than resurrecting.
        hasUploadNeed = true;
        continue;
      }
      merged.push(cloud);
    }
  }

  return { merged, hasUploadNeed };
}

/**
 * Intelligent Two-Way Incremental Sync with GitHub Repository.
 */
export function syncGithubBidirectional(
  config,
  localDocs = [],
  localGroups = [],
  localHistories = [],
  localCustomThemes = []
) {
  return enqueueGithubTask(async () => {
    const ctx = buildRepoContext(config || getGithubConfig());
    const executeSyncAttempt = async () => {
      const remoteState = await readRemoteState(ctx);
      const localTombstones = loadLocalTombstones();
      const mergedTombstones = mergeAllTombstones(localTombstones, remoteState.tombstones);

      const validLocalThemes = (localCustomThemes || []).filter(
        t => t && t.id && !builtInThemeIds.has(t.id) && (t.isCustom || String(t.id).startsWith('custom-'))
      );

      const groupRes = reconcileEntities(localGroups, remoteState.groups, localTombstones.groups, remoteState.tombstones.groups);
      const docRes = reconcileEntities(localDocs, remoteState.docs, localTombstones.docs, remoteState.tombstones.docs);
      const historyRes = reconcileEntities(
        localHistories,
        remoteState.histories,
        localTombstones.histories,
        remoteState.tombstones.histories,
        item => item.updatedAt || item.createdAt || 0,
        (item, ts, deletedSide) => {
          const clearedBucket = deletedSide === 'cloud'
            ? remoteState.tombstones.clearedHistoryDocs
            : localTombstones.clearedHistoryDocs;
          const clearedAt = Number(clearedBucket?.[item.docId]) || 0;
          return deletedSide === 'cloud' ? clearedAt > ts : clearedAt >= ts;
        }
      );
      const themeRes = reconcileEntities(validLocalThemes, remoteState.customThemes, localTombstones.themes, remoteState.tombstones.themes);

      const mergedGroups = groupRes.merged;
      const mergedDocs = docRes.merged;
      const mergedHistories = historyRes.merged;
      const mergedThemes = themeRes.merged;

      const needsCommit =
        remoteState.isEmpty ||
        remoteState.hasExternalChanges ||
        groupRes.hasUploadNeed ||
        docRes.hasUploadNeed ||
        historyRes.hasUploadNeed ||
        themeRes.hasUploadNeed;

      if (needsCommit) {
        const { desiredFiles, pathsToDelete } = await buildDesiredRepoFiles(
          ctx,
          mergedDocs,
          mergedGroups,
          mergedHistories,
          mergedThemes,
          mergedTombstones,
          remoteState
        );

        const activeCount = mergedDocs.filter(d => !d.isDeleted && !d.is_deleted).length;
        const commitMsg = `sync: 双向同步 ${activeCount} 篇文档与 ${mergedGroups.length} 个分组`;
        const commitRes = await commitDesiredFiles(ctx, remoteState, desiredFiles, pathsToDelete, commitMsg);
        if (commitRes.commitSha) repoSyncCache.set(ctx.repoKey, commitRes.commitSha);
      } else if (remoteState.commitSha) {
        repoSyncCache.set(ctx.repoKey, remoteState.commitSha);
      }

      saveLocalTombstones(mergedTombstones);
      recordKnownTimestamps(mergedDocs, mergedGroups, mergedHistories, mergedThemes);
      setGithubLastSyncTime();

      return {
        docs: mergedDocs,
        groups: mergedGroups,
        histories: mergedHistories,
        customThemes: mergedThemes,
        stats: {
          totalDocs: mergedDocs.length,
          totalGroups: mergedGroups.length,
          totalHistories: mergedHistories.length,
          totalThemes: mergedThemes.length,
        },
      };
    };

    try {
      return await executeSyncAttempt();
    } catch (err) {
      if (err.status === 409 || err.status === 422) {
        return await executeSyncAttempt();
      }
      throw err;
    }
  });
}

// Notify App coordinator to schedule debounced bidirectional sync (avoids per-keystroke commit spam).
export function scheduleGithubRealtimeSync() {
  if (!isGithubSyncEnabled()) return;
  const cfg = getGithubConfig();
  if (!cfg.autoSync) return;
  window.dispatchEvent(new CustomEvent('nicemd-request-auto-sync'));
}
