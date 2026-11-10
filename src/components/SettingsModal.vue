<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import {
  X,
  Settings,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  Info,
  Sliders,
  Globe,
  Code,
  Volume2,
  VolumeX,
  Type,
  HardDrive,
  Eye,
  EyeOff,
  Wifi,
  UploadCloud,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderDown,
  FolderUp,
  Zap,
  Check,
  ChevronDown
} from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';
import { soundEngine } from '../utils/synthAudio';
import {
  getStorageConfig,
  saveStorageConfig,
  isStorageEnabled,
  hasCustomStorageConfig,
  checkServerDefaultOssAvailable,
  getServerDefaultOssStatus
} from '../utils/fileStorage';
import {
  getActiveCloudProvider,
  setActiveCloudProvider,
  isCloudSyncEnabled
} from '../utils/cloudSync';
import {
  getTidbConfig,
  saveTidbConfig,
  testTidbConnection,
  pushAllToTidb,
  pullFromTidb,
  syncTidbBidirectional,
  getTidbLastSyncTime
} from '../utils/tidbStorage';
import {
  getNeonConfig,
  saveNeonConfig,
  testNeonConnection,
  pushAllToNeon,
  pullFromNeon,
  syncNeonBidirectional,
  getLastSyncTime
} from '../utils/neonStorage';
import { loadDocuments, saveDocuments, loadGroups, saveGroups } from '../utils/docStorage';
import { getAllDocSnapshots, saveAllDocSnapshots } from '../utils/docHistory';
import { loadCustomThemes, saveCustomThemes, mergeCustomThemes } from '../utils/themePresets';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'sync-complete']);

// Default fallback config in case extension is disconnected
const defaultFallbackConfig = [
  {
    id: 'wechat',
    name: '微信公众号',
    color: '#07c160',
    writeUrl: 'https://mp.weixin.qq.com/',
    matchHosts: ['mp.weixin.qq.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-editor__input .ProseMirror, .title-editor__input [contenteditable="true"], #title, #js_title, #js_article_title',
      editor: '.rich_media_content .ProseMirror, .rich_media_content [contenteditable="true"], body.view, body[contenteditable="true"]',
      format: 'text/html'
    }
  },
  {
    id: 'zhihu',
    name: '知乎专栏',
    color: '#0084ff',
    writeUrl: 'https://zhuanlan.zhihu.com/write',
    matchHosts: ['zhuanlan.zhihu.com'],
    selectors: {
      title: 'textarea.WriteIndex-titleInput, [placeholder*="请输入标题"]',
      editor: '.public-DraftEditor-content, .DraftEditor-root [contenteditable="true"], [role="textbox"]',
      format: 'text/plain'
    }
  },
  {
    id: 'juejin',
    name: '稀土掘金',
    color: '#1e80ff',
    writeUrl: 'https://juejin.cn/editor/drafts/new',
    matchHosts: ['juejin.cn'],
    silentEnabled: true,
    selectors: {
      title: 'input.title-input, [placeholder*="文章标题"]',
      editor: '.cm-content, .bytemd-editor [contenteditable="true"], .cm-editor [contenteditable="true"], .bytemd-editor textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'csdn',
    name: 'CSDN 博客',
    color: '#fc5531',
    writeUrl: 'https://editor.csdn.net/md/',
    matchHosts: ['editor.csdn.net'],
    silentEnabled: true,
    selectors: {
      title: 'input.article-bar__title, #txtTitle, [placeholder*="标题"]',
      editor: 'body.cke_editable, .cke_editable, .CodeMirror textarea, .cm-content, .ck-editor__editable, .ck-content, .editor__inner, .editor textarea, #editor textarea, .editor [contenteditable="true"], .markdown-editor-content textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'cnblogs',
    name: '博客园',
    color: '#3272ad',
    writeUrl: 'https://i.cnblogs.com/posts/edit',
    matchHosts: ['i.cnblogs.com'],
    silentEnabled: true,
    selectors: {
      title: '#txt-title, [placeholder*="标题"], .post-title-input',
      editor: '#Editor_Edit_EditorBody, .editor-textarea, textarea, .cm-content, #editor-content',
      format: 'text/plain'
    }
  },
  {
    id: 'baijiahao',
    name: '百家号',
    color: '#ea4335',
    writeUrl: 'https://baijiahao.baidu.com/builder/rc/write/article',
    matchHosts: ['baijiahao.baidu.com'],
    selectors: {
      title: '.editor-title input, [placeholder*="文章标题"], #title-input',
      editor: '.ProseMirror, [contenteditable="true"], .ueditor-content',
      format: 'text/html'
    }
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    color: '#fb7299',
    writeUrl: 'https://member.bilibili.com/platform/upload/text',
    matchHosts: ['member.bilibili.com'],
    silentEnabled: true,
    selectors: {
      title: '.title-input, input[placeholder*="请输入标题"]',
      editor: '.ProseMirror, [contenteditable="true"], .editor-content',
      format: 'text/plain'
    }
  },
  {
    id: 'eastmoney',
    name: '东方财富',
    color: '#f59e0b',
    writeUrl: 'https://mp.eastmoney.com/NewWrite/Article',
    matchHosts: ['mp.eastmoney.com'],
    selectors: {
      title: '.title-input, [placeholder*="标题"], #txtTitle',
      editor: '[contenteditable="true"], .editor-content, textarea',
      format: 'text/html'
    }
  },
  {
    id: 'oschina',
    name: '开源中国',
    color: '#22c55e',
    writeUrl: 'https://my.oschina.net/action/blog/write',
    matchHosts: ['my.oschina.net'],
    silentEnabled: true,
    selectors: {
      title: '[placeholder*="标题"], .title-input, #title',
      editor: '.ProseMirror, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'sohu',
    name: '搜狐号',
    color: '#e11d48',
    writeUrl: 'https://mp.sohu.com/mpbp/bp/article/write',
    matchHosts: ['mp.sohu.com'],
    selectors: {
      title: '.title-input, [placeholder*="标题"], input',
      editor: '.ProseMirror, [contenteditable="true"], .editor',
      format: 'text/html'
    }
  },
  {
    id: 'yuque',
    name: '语雀',
    color: '#00b96b',
    writeUrl: 'https://www.yuque.com/dashboard',
    matchHosts: ['yuque.com'],
    silentEnabled: true,
    selectors: {
      title: '[placeholder*="标题"], .title-input, .ne-title-editor',
      editor: '.ne-engine, [contenteditable="true"]',
      format: 'text/plain'
    }
  },
  {
    id: '51cto',
    name: '51CTO',
    color: '#10b981',
    writeUrl: 'https://blog.51cto.com/blogger/publish',
    matchHosts: ['blog.51cto.com'],
    selectors: {
      title: '#title, [placeholder*="标题"], .title-input',
      editor: '[contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'douban',
    name: '豆瓣',
    color: '#007722',
    writeUrl: 'https://www.douban.com/note/create',
    matchHosts: ['douban.com'],
    selectors: {
      title: '#note_title, [placeholder*="题目"], input',
      editor: '#note_text, textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'segmentfault',
    name: '思否',
    color: '#009a61',
    writeUrl: 'https://segmentfault.com/write',
    matchHosts: ['segmentfault.com'],
    selectors: {
      title: '[placeholder*="标题"], #title, .title-input',
      editor: '.cm-content, [contenteditable="true"], textarea',
      format: 'text/plain'
    }
  },
  {
    id: 'weibo',
    name: '微博',
    color: '#e6162d',
    writeUrl: 'https://card.weibo.com/article/v5/editor',
    matchHosts: ['weibo.com', 'card.weibo.com'],
    selectors: {
      title: '.title-input, [placeholder*="标题"], input',
      editor: '.editor-content, [contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'xueqiu',
    name: '雪球',
    color: '#3b82f6',
    writeUrl: 'https://mp.xueqiu.com/writeV2',
    matchHosts: ['xueqiu.com', 'mp.xueqiu.com'],
    selectors: {
      title: '.write-title, [placeholder*="标题"], input',
      editor: '.editor-body, [contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'imooc',
    name: '慕课手记',
    color: '#f01414',
    writeUrl: 'https://www.imooc.com/article/publish',
    matchHosts: ['imooc.com', 'www.imooc.com'],
    selectors: {
      title: '.js-title, [placeholder*="标题"], input',
      editor: '[contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'woshipm',
    name: '人人都是产品经理',
    color: '#ea580c',
    writeUrl: 'https://www.woshipm.com/writing',
    matchHosts: ['woshipm.com', 'www.woshipm.com'],
    selectors: {
      title: '#post_title, [placeholder*="标题"], input',
      editor: '[contenteditable="true"], textarea',
      format: 'text/html'
    }
  },
  {
    id: 'zip-download',
    name: 'Markdown 压缩包',
    color: '#6366f1',
    writeUrl: '',
    matchHosts: [],
    silentEnabled: true,
    selectors: {
      title: '',
      editor: '',
      format: 'text/plain'
    }
  }
];

const isExtensionConnected = ref(false);
const platforms = ref(JSON.parse(JSON.stringify(defaultFallbackConfig)));
const saveStatus = ref(''); // '', 'saving', 'success', 'error'

// ── File Storage (图床) state ──
const storageConfig = ref(getStorageConfig());
const storageProviders = [
  { id: 'aliyun-oss', name: '阿里云 OSS', detail: '对象存储服务', available: true },
  { id: 'tencent-cos', name: '腾讯云 COS', detail: '暂未接入', available: false },
  { id: 'qiniu-kodo', name: '七牛云 Kodo', detail: '暂未接入', available: false },
  { id: 'upyun-uss', name: '又拍云 USS', detail: '暂未接入', available: false },
  { id: 'huawei-obs', name: '华为云 OBS', detail: '暂未接入', available: false },
  { id: 'github', name: 'GitHub', detail: '暂未接入', available: false },
  { id: 'custom-s3', name: '兼容 S3 的存储', detail: '暂未接入', available: false },
];
const serverOssStatus = ref(getServerDefaultOssStatus() || { hasDefault: false, bucket: '', endpoint: '', domain: '' });
const isCustomOssConfigured = computed(() => hasCustomStorageConfig(storageConfig.value));
const storageTestResult = ref(''); // '', 'testing', 'success', 'error'
const storageTestMsg = ref('');

function loadStorageConfig() {
  storageConfig.value = getStorageConfig();
  checkServerDefaultOssAvailable().then(status => {
    if (status) serverOssStatus.value = status;
  }).catch(() => {});
}

async function handleTestConnection() {
  storageTestResult.value = 'testing';
  storageTestMsg.value = '';
  try {
    const { testOSSConnection } = await import('../utils/fileStorage');
    // If user entered custom configuration, test custom; otherwise test server default
    if (isCustomOssConfigured.value) {
      await testOSSConnection({ ...storageConfig.value });
      storageTestResult.value = 'success';
      storageTestMsg.value = '连接成功！自定义阿里云 OSS 图床配置正确。';
    } else if (serverOssStatus.value.hasDefault) {
      await testOSSConnection();
      storageTestResult.value = 'success';
      storageTestMsg.value = `连接成功！已连通服务器默认托管 OSS 图床 (Bucket: ${serverOssStatus.value.bucket || '默认'})。`;
    } else {
      throw new Error('未配置自定义图床参数，且服务器未检测到默认 OSS 环境变量');
    }
    soundEngine.playChime();
  } catch (err) {
    storageTestResult.value = 'error';
    storageTestMsg.value = '连接失败: ' + err.message;
  }
}

function handleToggleAutoUpload() {
  soundEngine.playClick();
  saveStorageConfig({ ...storageConfig.value });
}

function handleStorageSave() {
  soundEngine.playClick();
  // Other entries are shown as unavailable until their upload adapters exist.
  storageConfig.value.platform = 'aliyun-oss';
  saveStorageConfig({ ...storageConfig.value });
  saveStatus.value = 'success';
  setTimeout(() => { saveStatus.value = ''; }, 2000);
}

// ── Unified Cloud Sync Provider ('tidb' | 'neon') ──
const cloudProvider = ref(getActiveCloudProvider());
const activeCloudProvider = ref(getActiveCloudProvider());
const isCloudSyncActive = ref(isCloudSyncEnabled());

// ── TiDB Serverless MySQL Sync State ──
const tidbConfig = ref(getTidbConfig());
const tidbTestResult = ref(''); // '', 'testing', 'success', 'error'
const tidbTestMsg = ref('');
const tidbSyncResult = ref(''); // '', 'syncing', 'success', 'error'
const tidbSyncMsg = ref('');
const tidbSaveStatus = ref('');
const showTidbKey = ref(false);
const tidbDbInfo = ref(null);

// ── Neon Serverless Postgres Sync State ──
const neonConfig = ref(getNeonConfig());
const neonTestResult = ref(''); // '', 'testing', 'success', 'error'
const neonTestMsg = ref('');
const neonSyncResult = ref(''); // '', 'syncing', 'success', 'error'
const neonSyncMsg = ref('');
const neonSaveStatus = ref('');
const showNeonKey = ref(false);
const neonDbInfo = ref(null);

function refreshCloudState() {
  activeCloudProvider.value = getActiveCloudProvider();
  isCloudSyncActive.value = isCloudSyncEnabled();
}

function setCloudProvider(p) {
  cloudProvider.value = p;
  soundEngine.playClick();
}

const isTidbActive = computed(() => {
  return Boolean(isCloudSyncActive.value && activeCloudProvider.value === 'tidb' && tidbConfig.value.enabled && tidbConfig.value.connectionString.trim());
});

const isNeonActive = computed(() => {
  return Boolean(isCloudSyncActive.value && activeCloudProvider.value === 'neon' && neonConfig.value.enabled);
});

function handleActivateProvider(p) {
  if (p === 'tidb' && !tidbConfig.value.connectionString.trim()) return;
  soundEngine.playClick();
  if (p === 'tidb') {
    tidbConfig.value.enabled = true;
    neonConfig.value.enabled = false;
    saveTidbConfig({ ...tidbConfig.value, enabled: true });
    saveNeonConfig({ ...neonConfig.value, enabled: false });
    setActiveCloudProvider('tidb', true);
    activeCloudProvider.value = 'tidb';
  } else if (p === 'neon') {
    neonConfig.value.enabled = true;
    tidbConfig.value.enabled = false;
    saveNeonConfig({ ...neonConfig.value, enabled: true });
    saveTidbConfig({ ...tidbConfig.value, enabled: false });
    setActiveCloudProvider('neon', true);
    activeCloudProvider.value = 'neon';
  }
  isCloudSyncActive.value = isCloudSyncEnabled();
  soundEngine.playChime();
}

function handleDeactivateProvider(p) {
  soundEngine.playClick();
  if (p === 'tidb') {
    tidbConfig.value.enabled = false;
    saveTidbConfig({ ...tidbConfig.value, enabled: false });
  } else if (p === 'neon') {
    neonConfig.value.enabled = false;
    saveNeonConfig({ ...neonConfig.value, enabled: false });
  }
  disableAllCloudSync();
  isCloudSyncActive.value = false;
}

function handleToggleCurrentProvider(p) {
  const isActive = (p === 'tidb' ? isTidbActive.value : isNeonActive.value);
  if (isActive) {
    handleDeactivateProvider(p);
  } else {
    handleActivateProvider(p);
  }
}

function loadTidbConfig() {
  tidbConfig.value = getTidbConfig();
}

function loadNeonConfig() {
  neonConfig.value = getNeonConfig();
}
const loadNeonState = loadNeonConfig;

watch(tidbConfig, (newVal) => {
  if (newVal) {
    saveTidbConfig({ ...newVal });
    if (newVal.enabled && neonConfig.value.enabled) {
      neonConfig.value.enabled = false;
      saveNeonConfig({ ...neonConfig.value, enabled: false });
      setActiveCloudProvider('tidb', true);
      activeCloudProvider.value = 'tidb';
    }
    isCloudSyncActive.value = isCloudSyncEnabled();
  }
}, { deep: true });

watch(neonConfig, (newVal) => {
  if (newVal) {
    saveNeonConfig({ ...newVal });
    if (newVal.enabled && tidbConfig.value.enabled) {
      tidbConfig.value.enabled = false;
      saveTidbConfig({ ...tidbConfig.value, enabled: false });
      setActiveCloudProvider('neon', true);
      activeCloudProvider.value = 'neon';
    }
    isCloudSyncActive.value = isCloudSyncEnabled();
  }
}, { deep: true });

async function handleTestTidb() {
  if (!tidbConfig.value.connectionString.trim()) {
    tidbTestResult.value = 'error';
    tidbTestMsg.value = '请先填写自己的数据库连接地址。';
    return;
  }
  tidbTestResult.value = 'testing';
  tidbTestMsg.value = '';
  try {
    const info = await testTidbConnection(tidbConfig.value.connectionString);
    tidbTestResult.value = 'success';
    tidbTestMsg.value = '数据库连接正常。';
    tidbDbInfo.value = info;
    soundEngine.playChime();
  } catch (err) {
    tidbTestResult.value = 'error';
    tidbTestMsg.value = '连接失败: ' + (err.message || '请检查 TiDB 连接串与网络');
  }
}

function handleSaveTidb() {
  soundEngine.playClick();
  saveTidbConfig({ ...tidbConfig.value });
  tidbSaveStatus.value = 'success';
  soundEngine.playChime();
  setTimeout(() => { tidbSaveStatus.value = ''; }, 2000);
}

function handleClearTidbConnection() {
  if (isTidbActive.value) handleDeactivateProvider('tidb');
  tidbConfig.value.connectionString = '';
  tidbConfig.value.enabled = false;
  saveTidbConfig({ ...tidbConfig.value });
  tidbTestResult.value = '';
  tidbTestMsg.value = '';
  tidbDbInfo.value = null;
  isCloudSyncActive.value = isCloudSyncEnabled();
}

async function handlePushToTidb() {
  if (!tidbConfig.value.connectionString.trim()) return;
  const ok = await showConfirm({
    title: '全量备份到 TiDB 云端',
    message: '确认将本地全部文档、分组、历史版本和自定义主题完整备份至 TiDB Cloud 吗？云端已有记录将被更新。',
    confirmText: '开始备份'
  });
  if (!ok) return;

  tidbSyncResult.value = 'syncing';
  tidbSyncMsg.value = '正在上传数据至 TiDB 云端...';
  try {
    const localDocs = loadDocuments();
    const localGroups = loadGroups();
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();
    const res = await pushAllToTidb(
      tidbConfig.value.connectionString,
      localDocs,
      localGroups,
      localHistories,
      localThemes
    );
    tidbSyncResult.value = 'success';
    tidbSyncMsg.value = `备份完成！成功上传 ${res.pushedDocs} 篇文档，${res.pushedGroups} 个分组，${res.pushedHistories} 个历史版本，${res.pushedThemes} 个自定义主题。`;
    soundEngine.playChime();
    emit('sync-complete', {
      docs: localDocs,
      groups: localGroups,
      histories: localHistories,
      customThemes: localThemes
    });
  } catch (err) {
    tidbSyncResult.value = 'error';
    tidbSyncMsg.value = '备份失败: ' + (err.message || '网络连接超时');
  }
}

async function handlePullFromTidb() {
  if (!tidbConfig.value.connectionString.trim()) return;
  const ok = await showConfirm({
    title: '从 TiDB 云端还原数据',
    message: '⚠️ 此操作将从 TiDB Cloud 拉取所有云端文档、分组、历史版本及自定义主题并合并更新本地，确定继续吗？',
    confirmText: '立即拉取',
    danger: true
  });
  if (!ok) return;

  tidbSyncResult.value = 'syncing';
  tidbSyncMsg.value = '正在从 TiDB 云端下载最新数据...';
  try {
    const { docs, groups, histories, customThemes } = await pullFromTidb(tidbConfig.value.connectionString);
    saveDocuments(docs);
    saveGroups(groups);
    if (histories && histories.length > 0) {
      saveAllDocSnapshots(histories);
    }
    if (customThemes && customThemes.length > 0) {
      mergeCustomThemes(customThemes);
    }
    tidbSyncResult.value = 'success';
    tidbSyncMsg.value = `还原成功！共恢复 ${docs.length} 篇文档，${groups.length} 个分组，${histories.length} 个历史版本，${customThemes.length} 个自定义主题。`;
    soundEngine.playChime();
    emit('sync-complete', { docs, groups, histories, customThemes });
  } catch (err) {
    tidbSyncResult.value = 'error';
    tidbSyncMsg.value = '拉取失败: ' + (err.message || '网络连接超时');
  }
}

async function handleTwoWaySyncTidb() {
  if (!tidbConfig.value.connectionString.trim()) return;
  tidbSyncResult.value = 'syncing';
  tidbSyncMsg.value = '正在执行 TiDB 双向时间戳增量同步...';
  try {
    const localDocs = loadDocuments();
    const localGroups = loadGroups();
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();
    const res = await syncTidbBidirectional(
      tidbConfig.value.connectionString,
      localDocs,
      localGroups,
      localHistories,
      localThemes
    );
    saveDocuments(res.docs);
    saveGroups(res.groups);
    if (res.histories && res.histories.length > 0) {
      saveAllDocSnapshots(res.histories);
    }
    if (res.customThemes && res.customThemes.length > 0) {
      mergeCustomThemes(res.customThemes);
    }
    tidbSyncResult.value = 'success';
    tidbSyncMsg.value = `同步成功！合并后文档: ${res.docs.length} 篇，分组: ${res.groups.length} 个，历史版本: ${res.histories.length} 个，自定义主题: ${res.customThemes.length} 个。`;
    soundEngine.playChime();
    emit('sync-complete', {
      docs: res.docs,
      groups: res.groups,
      histories: res.histories,
      customThemes: res.customThemes
    });
  } catch (err) {
    tidbSyncResult.value = 'error';
    tidbSyncMsg.value = '同步失败: ' + (err.message || '网络错误');
  }
}

async function handleTestNeon() {
  neonTestResult.value = 'testing';
  neonTestMsg.value = '';
  try {
    const info = await testNeonConnection(neonConfig.value.connectionString);
    neonTestResult.value = 'success';
    neonTestMsg.value = '数据库连接正常。';
    neonDbInfo.value = info;
    soundEngine.playChime();
  } catch (err) {
    neonTestResult.value = 'error';
    neonTestMsg.value = '连接失败: ' + (err.message || '请检查数据库连接串与网络');
  }
}

function handleSaveNeon() {
  soundEngine.playClick();
  saveNeonConfig({ ...neonConfig.value });
  neonSaveStatus.value = 'success';
  soundEngine.playChime();
  setTimeout(() => { neonSaveStatus.value = ''; }, 2000);
}

function handleClearNeonConnection() {
  if (isNeonActive.value) handleDeactivateProvider('neon');
  neonConfig.value.connectionString = '';
  neonConfig.value.enabled = false;
  saveNeonConfig({ ...neonConfig.value });
  neonTestResult.value = '';
  neonTestMsg.value = '';
  neonDbInfo.value = null;
  isCloudSyncActive.value = isCloudSyncEnabled();
}

async function handlePushToNeon() {
  if (!neonConfig.value.connectionString) {
    neonSyncResult.value = 'error';
    neonSyncMsg.value = '请先填写 Neon 数据库连接串';
    return;
  }
  const ok = await showConfirm({
    title: '全量备份到云端',
    message: '确认将本地全部文档、分组、历史版本和自定义主题完整备份至 Neon 云数据库吗？云端已有记录将被更新。',
    confirmText: '开始备份'
  });
  if (!ok) return;

  neonSyncResult.value = 'syncing';
  neonSyncMsg.value = '正在上传数据至 Neon 云端...';
  try {
    const localDocs = loadDocuments();
    const localGroups = loadGroups();
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();
    const res = await pushAllToNeon(
      neonConfig.value.connectionString,
      localDocs,
      localGroups,
      localHistories,
      localThemes
    );
    neonSyncResult.value = 'success';
    neonSyncMsg.value = `备份完成！成功上传 ${res.pushedDocs} 篇文档，${res.pushedGroups} 个分组，${res.pushedHistories} 个历史版本，${res.pushedThemes} 个自定义主题。`;
    soundEngine.playChime();
    emit('sync-complete', {
      docs: localDocs,
      groups: localGroups,
      histories: localHistories,
      customThemes: localThemes
    });
  } catch (err) {
    neonSyncResult.value = 'error';
    neonSyncMsg.value = '备份失败: ' + (err.message || '网络连接超时');
  }
}

async function handlePullFromNeon() {
  if (!neonConfig.value.connectionString) {
    neonSyncResult.value = 'error';
    neonSyncMsg.value = '请先填写 Neon 数据库连接串';
    return;
  }
  const ok = await showConfirm({
    title: '从云端还原数据',
    message: '⚠️ 此操作将从 Neon 数据库拉取所有云端文档、分组、历史版本及自定义主题并合并更新本地，确定继续吗？',
    confirmText: '立即拉取',
    danger: true
  });
  if (!ok) return;

  neonSyncResult.value = 'syncing';
  neonSyncMsg.value = '正在从 Neon 云端下载最新数据...';
  try {
    const { docs, groups, histories, customThemes } = await pullFromNeon(neonConfig.value.connectionString);
    saveDocuments(docs);
    saveGroups(groups);
    if (histories && histories.length > 0) {
      saveAllDocSnapshots(histories);
    }
    if (customThemes && customThemes.length > 0) {
      mergeCustomThemes(customThemes);
    }
    neonSyncResult.value = 'success';
    neonSyncMsg.value = `还原成功！共恢复 ${docs.length} 篇文档，${groups.length} 个分组，${histories.length} 个历史版本，${customThemes.length} 个自定义主题。`;
    soundEngine.playChime();
    emit('sync-complete', { docs, groups, histories, customThemes });
  } catch (err) {
    neonSyncResult.value = 'error';
    neonSyncMsg.value = '拉取失败: ' + (err.message || '网络连接超时');
  }
}

async function handleTwoWaySyncNeon() {
  if (!neonConfig.value.connectionString) {
    neonSyncResult.value = 'error';
    neonSyncMsg.value = '请先填写 Neon 数据库连接串';
    return;
  }

  neonSyncResult.value = 'syncing';
  neonSyncMsg.value = '正在执行双向时间戳增量同步...';
  try {
    const localDocs = loadDocuments();
    const localGroups = loadGroups();
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();
    const res = await syncNeonBidirectional(
      neonConfig.value.connectionString,
      localDocs,
      localGroups,
      localHistories,
      localThemes
    );
    saveDocuments(res.docs);
    saveGroups(res.groups);
    if (res.histories && res.histories.length > 0) {
      saveAllDocSnapshots(res.histories);
    }
    if (res.customThemes && res.customThemes.length > 0) {
      mergeCustomThemes(res.customThemes);
    }
    neonSyncResult.value = 'success';
    neonSyncMsg.value = `同步成功！文档: ${res.stats.totalDocs} 篇，分组: ${res.stats.totalGroups} 个，历史版本: ${res.stats.totalHistories} 个，自定义主题: ${res.stats.totalThemes} 个。`;
    soundEngine.playChime();
    emit('sync-complete', {
      docs: res.docs,
      groups: res.groups,
      histories: res.histories,
      customThemes: res.customThemes
    });
  } catch (err) {
    neonSyncResult.value = 'error';
    neonSyncMsg.value = '同步失败: ' + (err.message || '网络错误');
  }
}

const loadConfigFromExtension = () => {
  if (!props.isOpen) return;
  
  window.postMessage({ type: 'NICEMD_GET_CONFIG' }, '*');
};

onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    // Config retrieved
    if (event.data && event.data.type === 'NICEMD_GET_CONFIG_RESPONSE') {
      isExtensionConnected.value = event.data.success;
      if (event.data.success && event.data.config) {
        // Deep clone configs
        platforms.value = JSON.parse(JSON.stringify(event.data.config));
      } else {
        platforms.value = JSON.parse(JSON.stringify(defaultFallbackConfig));
      }
    }
    
    // Config saved
    if (event.data && event.data.type === 'NICEMD_SAVE_CONFIG_RESPONSE') {
      if (event.data.success) {
        saveStatus.value = 'success';
        soundEngine.playChime();
        setTimeout(() => {
          saveStatus.value = '';
        }, 2000);
      } else {
        saveStatus.value = 'error';
      }
    }
    
    // Ping/Pong to check connection
    if (event.data && event.data.type === 'NICEMD_PONG') {
      isExtensionConnected.value = true;
    }
  });
  
  // Initial load request
  setTimeout(loadConfigFromExtension, 200);
});

// ── general settings state ──
const soundMuted = ref(soundEngine.getMuteState());
const syncScroll = ref(localStorage.getItem('nicemd_sync_scroll') !== 'false');
const editorFontSize = ref(localStorage.getItem('nicemd_font_size') || '14.5px');
const lineNumbers = ref(localStorage.getItem('nicemd_line_numbers') !== 'false');

watch(soundMuted, (val) => {
  if (val !== soundEngine.getMuteState()) {
    soundEngine.toggleMute();
  }
  localStorage.setItem('nicemd_sound_muted', val.toString());
  window.dispatchEvent(new CustomEvent('nicemd-settings-updated'));
});

watch(syncScroll, (val) => {
  localStorage.setItem('nicemd_sync_scroll', val.toString());
  window.dispatchEvent(new CustomEvent('nicemd-settings-updated'));
});

watch(editorFontSize, (val) => {
  localStorage.setItem('nicemd_font_size', val);
  window.dispatchEvent(new CustomEvent('nicemd-settings-updated'));
});

watch(lineNumbers, (val) => {
  localStorage.setItem('nicemd_line_numbers', val.toString());
  window.dispatchEvent(new CustomEvent('nicemd-settings-updated'));
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadConfigFromExtension();
    loadStorageConfig();
    loadTidbConfig();
    loadNeonConfig();
    refreshCloudState();
    cloudProvider.value = getActiveCloudProvider();
    tidbTestResult.value = '';
    tidbTestMsg.value = '';
    tidbSyncResult.value = '';
    tidbSyncMsg.value = '';
    neonTestResult.value = '';
    neonTestMsg.value = '';
    neonSyncResult.value = '';
    neonSyncMsg.value = '';
    storageTestResult.value = '';
    storageTestMsg.value = '';
    soundMuted.value = soundEngine.getMuteState();
    syncScroll.value = localStorage.getItem('nicemd_sync_scroll') !== 'false';
    editorFontSize.value = localStorage.getItem('nicemd_font_size') || '14.5px';
    lineNumbers.value = localStorage.getItem('nicemd_line_numbers') !== 'false';
  }
});

const activeTab = ref('general');

const selectPlatform = (id) => {
  soundEngine.playClick();
  activeTab.value = id;
};

const handleSave = () => {
  soundEngine.playClick();
  saveStatus.value = 'saving';
  
  if (storageConfig.value) {
    storageConfig.value.platform = 'aliyun-oss';
    saveStorageConfig({ ...storageConfig.value });
  }
  if (tidbConfig.value) saveTidbConfig({ ...tidbConfig.value });
  if (neonConfig.value) saveNeonConfig({ ...neonConfig.value });

  if (isExtensionConnected.value) {
    // Send to extension via message bridge
    window.postMessage({
      type: 'NICEMD_SAVE_CONFIG',
      config: JSON.parse(JSON.stringify(platforms.value))
    }, '*');
  } else {
    // Mock save locally if extension is not present
    setTimeout(() => {
      saveStatus.value = 'success';
      setTimeout(() => { saveStatus.value = ''; }, 2000);
    }, 800);
  }
};

const handleReset = async () => {
  soundEngine.playClick('backspace');
  if (activeTab.value === 'general') {
    const ok = await showConfirm({
      title: '恢复默认通用设置',
      message: '确认恢复系统通用偏好设置为默认值吗？',
      confirmText: '恢复默认',
      danger: true
    });
    if (ok) {
      soundMuted.value = false;
      syncScroll.value = true;
      editorFontSize.value = '14.5px';
      lineNumbers.value = true;
    }
    return;
  }
  if (activeTab.value === 'storage') {
    const ok = await showConfirm({
      title: '恢复默认图床设置',
      message: '确认清空自定义图床配置并恢复默认吗？',
      confirmText: '恢复默认',
      danger: true
    });
    if (ok) {
      storageConfig.value = {
        platform: 'aliyun-oss',
        domain: '',
        bucketName: '',
        accessKey: '',
        secretKey: '',
        endPoint: '',
        basePath: '',
        enableStorage: true
      };
      saveStorageConfig({ ...storageConfig.value });
      storageTestResult.value = '';
      storageTestMsg.value = '';
    }
    return;
  }
  const ok = await showConfirm({
    title: '恢复默认配置',
    message: '确认恢复默认平台选择器配置吗？所有自定义修改都将被覆盖。',
    confirmText: '恢复默认',
    danger: true
  });
  if (ok) {
    platforms.value = JSON.parse(JSON.stringify(defaultFallbackConfig));
    if (!platforms.value.some(p => p.id === activeTab.value)) {
      activeTab.value = platforms.value[0]?.id || 'wechat';
    }
  }
};

const addCustomPlatform = () => {
  soundEngine.playClick();
  const id = 'custom_' + Date.now().toString(36);
  const newPlat = {
    id,
    name: '自建平台',
    color: '#a855f7',
    writeUrl: 'https://example.com/write',
    matchHosts: ['example.com'],
    selectors: {
      title: 'input.title, [placeholder*="标题"]',
      editor: '[contenteditable="true"], textarea',
      format: 'text/plain'
    }
  };
  
  platforms.value.push(newPlat);
  activeTab.value = id;
};

const deletePlatform = async (id) => {
  soundEngine.playClick('backspace');
  const ok = await showConfirm({
    title: '删除平台',
    message: '确定删除此平台吗？此操作无法撤销。',
    confirmText: '删除',
    danger: true
  });
  if (ok) {
    const idx = platforms.value.findIndex(p => p.id === id);
    if (idx !== -1) {
      platforms.value.splice(idx, 1);
      if (activeTab.value === id) {
        activeTab.value = platforms.value[0]?.id || '';
      }
    }
  }
};

const getActivePlatform = () => {
  return platforms.value.find(p => p.id === activeTab.value) || null;
};

// Cached computed for template bindings — avoids repeated O(n) find() calls
const activePlatform = computed(() => getActivePlatform());

const supportsSilent = (id) => {
  return ['wechat', 'weixin', 'juejin', 'csdn', 'cnblogs', 'bilibili', 'oschina', 'yuque'].includes(id);
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card settings-card">
      <div class="modal-header">
        <div class="title-area">
          <Settings class="settings-gear" size="18" />
          <h2>多平台填装配置中心</h2>
        </div>
        <button @click="emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body settings-body-container">
        <!-- Sidebar Platform List -->
        <div class="settings-sidebar">
          <div class="sidebar-title">系统与平台设置</div>
          <div class="platform-list">
            <!-- General Settings Tab -->
            <button
              class="platform-tab-btn general-tab-btn"
              :class="{ 'is-active': activeTab === 'general' }"
              @click="selectPlatform('general')"
            >
              <Sliders size="14" class="general-indicator-icon" />
              <span class="tab-label">系统通用设置</span>
            </button>

            <!-- 图床设置 Tab -->
            <button
              class="platform-tab-btn storage-tab-btn"
              :class="{ 'is-active': activeTab === 'storage' }"
              @click="selectPlatform('storage')"
            >
              <UploadCloud size="14" class="storage-indicator-icon" />
              <span class="tab-label">图床设置</span>
            </button>

            <!-- 云端数据库同步 Tab (TiDB & Neon) -->
            <button
              class="platform-tab-btn cloud-tab-btn"
              :class="{ 'is-active': activeTab === 'cloud' || activeTab === 'neon' }"
              @click="selectPlatform('cloud')"
            >
              <Database size="14" class="cloud-indicator-icon" />
              <span class="tab-label">云端数据库同步</span>
              <span v-if="isCloudSyncEnabled()" class="cloud-active-dot" title="云端同步已开启"></span>
            </button>

            <div class="sidebar-divider"></div>
            
            <button
              v-for="plat in platforms"
              :key="plat.id"
              class="platform-tab-btn"
              :class="{ 'is-active': activeTab === plat.id }"
              @click="selectPlatform(plat.id)"
            >
              <span class="color-indicator" :style="{ backgroundColor: plat.color }"></span>
              <span class="tab-label">{{ plat.name }}</span>
              <span class="tab-sublabel">{{ plat.id }}</span>
            </button>
          </div>
          
          <button @click="addCustomPlatform" class="btn-add-platform">
            <Plus size="14" />
            <span>自建平台通道</span>
          </button>
        </div>

        <!-- Main Form Panel -->
        <!-- General Settings View -->
        <div class="settings-main-form" v-if="activeTab === 'general'">
          <div class="form-section-header">
            <h3>系统通用偏好设置</h3>
          </div>

          <div class="form-grid">
            <!-- Typist Sound Toggle -->
            <div class="form-group span-2">
              <label>打字输入音效</label>
              <div class="sound-control-wrapper">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="soundMuted" :true-value="false" :false-value="true" />
                  <span class="checkbox-label-text">启用机械键盘打字反馈声效</span>
                </label>
                <div class="sound-status-icon">
                  <Volume2 v-if="!soundMuted" size="18" class="text-accent" />
                  <VolumeX v-else size="18" class="text-muted" />
                </div>
              </div>
              <small class="help-text">在编辑器中输入文字时，实时合成机械键盘敲击的清脆声响，为您提供沉浸式写作体验。</small>
            </div>

            <!-- Sync Scroll Toggle -->
            <div class="form-group span-2">
              <label>编辑器与预览同步滚动</label>
              <label class="checkbox-container">
                <input type="checkbox" v-model="syncScroll" />
                <span class="checkbox-label-text">开启同步滚动</span>
              </label>
              <small class="help-text">当滚动编辑区域时，预览区域会自动按百分比进行平滑同步滚动。</small>
            </div>

            <!-- Font Size -->
            <div class="form-group">
              <label>编辑器字体大小</label>
              <div class="input-with-icon">
                <Type class="input-icon" size="14" />
                <select v-model="editorFontSize" class="format-select">
                  <option value="12px">12 px (小)</option>
                  <option value="13.5px">13.5 px (小默认)</option>
                  <option value="14.5px">14.5 px (默认)</option>
                  <option value="16px">16 px (大)</option>
                  <option value="18px">18 px (超大)</option>
                  <option value="20px">20 px (极致)</option>
                </select>
              </div>
            </div>

            <!-- Line Numbers Toggle -->
            <div class="form-group">
              <label>显示行号</label>
              <label class="checkbox-container">
                <input type="checkbox" v-model="lineNumbers" />
                <span class="checkbox-label-text">在编辑器左侧显示行号</span>
              </label>
            </div>
          </div>
        </div>

        <!-- File Storage (图床) Settings -->
        <div class="settings-main-form storage-main-form" v-else-if="activeTab === 'storage'">
          <!-- 全局独立控制：剪贴板图片自动上传（脱离具体存储平台单独设计） -->
          <div class="storage-global-banner">
            <div class="storage-global-info">
              <div class="storage-global-title-row">
                <span class="storage-global-title">剪贴板图片自动上传</span>
                <span class="storage-global-badge" :class="storageConfig.enableStorage !== false ? 'is-active' : ''">
                  {{ storageConfig.enableStorage !== false ? '已启用' : '已关闭' }}
                </span>
              </div>
              <div class="storage-global-desc">在编辑器中粘贴图片时自动上传至图床并插入 Markdown 图片链接</div>
            </div>
            <label class="modern-switch" title="切换剪贴板自动上传">
              <input type="checkbox" v-model="storageConfig.enableStorage" @change="handleToggleAutoUpload" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="storage-layout">
            <!-- 存储平台导航：变窄并贴左侧 -->
            <nav class="storage-provider-nav" aria-label="图床平台">
              <div class="storage-provider-heading">存储平台</div>
              <button
                v-for="provider in storageProviders"
                :key="provider.id"
                type="button"
                class="storage-provider-option"
                :class="{ 'is-selected': provider.id === 'aliyun-oss', 'is-unavailable': !provider.available }"
                :disabled="!provider.available"
                :aria-current="provider.id === 'aliyun-oss' ? 'page' : undefined"
              >
                <HardDrive size="15" />
                <span class="storage-provider-copy">
                  <strong>{{ provider.name }}</strong>
                  <small>{{ provider.detail }}</small>
                </span>
                <Check v-if="provider.id === 'aliyun-oss'" size="14" class="storage-provider-check" />
              </button>
              <p class="storage-provider-note">其他平台接入后可在此配置。</p>
            </nav>

            <!-- 存储平台详细配置（纵向单列布局，一行一个输入项） -->
            <section class="storage-config-panel">
              <div class="storage-fields">
                <div class="form-group">
                  <label>访问域名</label>
                  <div class="input-with-icon"><Globe class="input-icon" size="14" /><input type="text" v-model="storageConfig.domain" placeholder="https://图片域名或 CDN 域名" /></div>
                  <small class="help-text">用于生成图片链接，可填写 Bucket 域名或 CDN 域名</small>
                </div>
                <div class="form-group">
                  <label>Bucket 名称</label>
                  <div class="input-with-icon"><HardDrive class="input-icon" size="14" /><input type="text" v-model="storageConfig.bucketName" placeholder="例如：my-image-bucket" /></div>
                </div>
                <div class="form-group">
                  <label>AccessKey ID</label>
                  <div class="input-with-icon"><input type="text" v-model="storageConfig.accessKey" placeholder="输入 AccessKey ID" style="padding-left:12px;" /></div>
                </div>
                <div class="form-group">
                  <label>AccessKey Secret</label>
                  <div class="input-with-icon"><input type="text" v-model="storageConfig.secretKey" placeholder="输入 AccessKey Secret" style="padding-left:12px;" /></div>
                </div>
                <div class="form-group">
                  <label>地域节点 Endpoint</label>
                  <div class="input-with-icon"><Globe class="input-icon" size="14" /><input type="text" v-model="storageConfig.endPoint" placeholder="oss-cn-hangzhou.aliyuncs.com" /></div>
                </div>
                <div class="form-group">
                  <label>存储路径 <span class="storage-optional">可选</span></label>
                  <div class="input-with-icon"><UploadCloud class="input-icon" size="14" /><input type="text" v-model="storageConfig.basePath" placeholder="例如：images/articles" /></div>
                </div>
              </div>

              <div class="storage-actions">
                <button @click="handleTestConnection" class="btn-test-connection" :class="storageTestResult" :disabled="storageTestResult === 'testing'">
                  <Wifi v-if="storageTestResult !== 'testing'" size="14" />
                  <span v-if="storageTestResult === ''">测试连接</span>
                  <span v-else-if="storageTestResult === 'testing'">测试中...</span>
                  <span v-else-if="storageTestResult === 'success'">连接成功</span>
                  <span v-else-if="storageTestResult === 'error'">连接失败</span>
                </button>
              </div>
              <div v-if="storageTestMsg" class="test-result-msg storage-test-result" :class="storageTestResult">{{ storageTestMsg }}</div>
            </section>
          </div>
        </div>

        <!-- Cloud Database Sync View (TiDB & Neon) -->
        <div class="settings-main-form cloud-sync-container" v-else-if="activeTab === 'cloud' || activeTab === 'neon'">
          
          <!-- 1. Top Channel Segmented Navigation -->
          <div class="cloud-header-box">
            <div class="cloud-nav-segmented">
              <button 
                type="button"
                class="cloud-nav-tab"
                :class="{ 'is-active': cloudProvider === 'tidb' }"
                @click="setCloudProvider('tidb')"
              >
                <div class="tab-icon-wrap tidb-color">
                  <Zap size="15" />
                </div>
                <div class="tab-text-wrap">
                  <span class="tab-name">TiDB Cloud</span>
                    <span class="tab-sub">MySQL</span>
                </div>
              </button>

              <button 
                type="button"
                class="cloud-nav-tab"
                :class="{ 'is-active': cloudProvider === 'neon' }"
                @click="setCloudProvider('neon')"
              >
                <div class="tab-icon-wrap neon-color">
                  <Database size="15" />
                </div>
                <div class="tab-text-wrap">
                  <span class="tab-name">Neon Postgres</span>
                    <span class="tab-sub">PostgreSQL</span>
                </div>
              </button>
            </div>
          </div>

          <!-- ─────────── TiDB Cloud Panel ─────────── -->
          <div v-if="cloudProvider === 'tidb'" class="cloud-body-section">
            
            <div class="cloud-switch-card">
              <div class="cloud-sync-state-row">
                <div class="switch-card-info">
                  <div class="switch-title">云端同步 <span class="sync-state-label" :class="{ 'is-active': isTidbActive }">{{ isTidbActive ? '已启用' : (tidbConfig.connectionString.trim() ? '未启用' : '待配置') }}</span></div>
                  <div class="switch-desc">{{ !tidbConfig.connectionString.trim() ? '请先填写自己的数据库连接地址。' : (isTidbActive ? '内容会同步到你的数据库。' : '启用后开始同步到你的数据库。') }}</div>
                </div>
                <button type="button" class="sync-state-button" :class="{ 'is-active': isTidbActive }" :disabled="!isTidbActive && !tidbConfig.connectionString.trim()" @click="handleToggleCurrentProvider('tidb')">
                  {{ isTidbActive ? '停用' : (tidbConfig.connectionString.trim() ? '启用同步' : '待配置') }}
                </button>
              </div>
              <div class="sync-settings-divider"></div>
              <div class="cloud-sync-auto-row">
                <div class="switch-card-info">
                  <div class="switch-title">编辑后自动同步</div>
                  <div class="switch-desc">停止编辑约 2 秒后保存到云端。</div>
                </div>
                <label class="modern-switch">
                  <input type="checkbox" v-model="tidbConfig.autoSync" :disabled="!isTidbActive" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <!-- Connection URI Configuration Card -->
            <div class="cloud-config-card">
              <div class="config-card-header">
                <div class="header-title-wrap">
                  <Database size="14" class="text-accent" />
                  <span class="config-title">数据库连接</span>
                </div>
                <div class="connection-header-actions">
                  <button
                    @click="handleTestTidb"
                    class="btn-cloud-test connection-test-btn"
                    :class="tidbTestResult"
                    :disabled="tidbTestResult === 'testing' || !tidbConfig.connectionString.trim()"
                  >
                    <RefreshCw v-if="tidbTestResult === 'testing'" size="13" class="animate-spin" />
                    <Wifi v-else size="13" />
                    <span>{{ tidbTestResult === 'testing' ? '测试中' : tidbTestResult === 'success' ? '已连接' : tidbTestResult === 'error' ? '重试' : '测试连接' }}</span>
                  </button>
                  <button v-if="tidbConfig.connectionString" type="button" class="connection-clear-btn" @click="handleClearTidbConnection">
                    清空
                  </button>
                </div>
              </div>

              <div class="modern-input-group">
                <span class="input-prefix-icon"><Database size="14" /></span>
                <input
                  type="text"
                  v-model="tidbConfig.connectionString"
                  placeholder="填写你自己的 MySQL 数据库连接地址"
                  class="modern-code-input"
                  spellcheck="false"
                  autocomplete="off"
                />
              </div>
              
              <div class="config-helper-row">
                <span class="helper-syntax">
                  <template v-if="!tidbConfig.connectionString">
                    连接地址仅保存在此设备；请填写自己的数据库后再启用同步。
                  </template>
                  <template v-else>
                    已配置个人数据库连接。
                  </template>
                </span>
                <span class="helper-info" v-if="tidbConfig.connectionString">从 TiDB Cloud 控制台复制连接地址。</span>
              </div>
              <div v-if="tidbTestMsg" class="connection-test-result" :class="tidbTestResult">
                <span>{{ tidbTestMsg }}</span>
                <div v-if="tidbDbInfo" class="metrics-chips">
                  <span class="metric-chip">{{ tidbDbInfo.docCount }} 篇文档</span>
                  <span class="metric-chip">{{ tidbDbInfo.groupCount }} 个分组</span>
                  <span class="metric-chip">{{ tidbDbInfo.historyCount }} 个历史版本</span>
                  <span class="metric-chip">{{ tidbDbInfo.themeCount }} 个主题</span>
                </div>
              </div>
            </div>

            <!-- Cloud Data Operations Section -->
            <details class="cloud-ops-box">
              <summary class="ops-header">
                <Cloud size="15" class="text-primary" />
                <span class="ops-title">更多数据操作</span>
                <ChevronDown size="15" class="ops-chevron" />
              </summary>

              <div class="ops-cards-grid">
                <!-- 1. Bidirectional Sync -->
                <div class="ops-card card-sync">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-blue">
                      <RefreshCw size="16" />
                    </div>
                    <div class="ops-card-title">双向同步</div>
                  </div>
                  <p class="ops-card-desc">合并本地和云端的最新内容。</p>
                  <button 
                    @click="handleTwoWaySyncTidb" 
                    class="ops-action-btn btn-blue"
                    :disabled="tidbSyncResult === 'syncing' || !tidbConfig.connectionString.trim()"
                  >
                    <RefreshCw size="13" :class="{ 'animate-spin': tidbSyncResult === 'syncing' }" />
                    <span>立即同步</span>
                  </button>
                </div>

                <!-- 2. Push Backup -->
                <div class="ops-card card-push">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-green">
                      <FolderUp size="16" />
                    </div>
                    <div class="ops-card-title">备份到云端</div>
                  </div>
                  <p class="ops-card-desc">将此设备上的内容完整备份到云端。</p>
                  <button 
                    @click="handlePushToTidb" 
                    class="ops-action-btn btn-green"
                    :disabled="tidbSyncResult === 'syncing' || !tidbConfig.connectionString.trim()"
                  >
                    <FolderUp size="13" />
                    <span>开始备份</span>
                  </button>
                </div>

                <!-- 3. Pull Restore -->
                <div class="ops-card card-pull">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-purple">
                      <FolderDown size="16" />
                    </div>
                    <div class="ops-card-title">从云端恢复</div>
                  </div>
                  <p class="ops-card-desc">将云端内容恢复到此设备。</p>
                  <button 
                    @click="handlePullFromTidb" 
                    class="ops-action-btn btn-purple"
                    :disabled="tidbSyncResult === 'syncing' || !tidbConfig.connectionString.trim()"
                  >
                    <FolderDown size="13" />
                    <span>恢复数据</span>
                  </button>
                </div>
              </div>

              <!-- Sync Result Toast -->
              <div v-if="tidbSyncMsg" class="cloud-result-banner mt-3" :class="tidbSyncResult">
                {{ tidbSyncMsg }}
              </div>
            </details>

          </div>

          <!-- ─────────── Neon Postgres Panel ─────────── -->
          <div v-else class="cloud-body-section">
            
            <div class="cloud-switch-card">
              <div class="cloud-sync-state-row">
                <div class="switch-card-info">
                  <div class="switch-title">云端同步 <span class="sync-state-label" :class="{ 'is-active': isNeonActive }">{{ isNeonActive ? '已启用' : '未启用' }}</span></div>
                  <div class="switch-desc">{{ isNeonActive ? '内容会同步到云端。' : '启用后开始同步到云端。' }}</div>
                </div>
                <button type="button" class="sync-state-button" :class="{ 'is-active': isNeonActive }" @click="handleToggleCurrentProvider('neon')">
                  {{ isNeonActive ? '停用' : '启用同步' }}
                </button>
              </div>
              <div class="sync-settings-divider"></div>
              <div class="cloud-sync-auto-row">
                <div class="switch-card-info">
                  <div class="switch-title">编辑后自动同步</div>
                  <div class="switch-desc">停止编辑约 2 秒后保存到云端。</div>
                </div>
                <label class="modern-switch">
                  <input type="checkbox" v-model="neonConfig.autoSync" :disabled="!isNeonActive" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <!-- Connection URI Configuration Card -->
            <div class="cloud-config-card">
              <div class="config-card-header">
                <div class="header-title-wrap">
                  <Database size="14" class="text-accent" />
                  <span class="config-title">数据库连接</span>
                </div>
                <div class="connection-header-actions">
                  <button
                    @click="handleTestNeon"
                    class="btn-cloud-test connection-test-btn"
                    :class="neonTestResult"
                    :disabled="neonTestResult === 'testing' || !neonConfig.connectionString.trim()"
                  >
                    <RefreshCw v-if="neonTestResult === 'testing'" size="13" class="animate-spin" />
                    <Wifi v-else size="13" />
                    <span>{{ neonTestResult === 'testing' ? '测试中' : neonTestResult === 'success' ? '已连接' : neonTestResult === 'error' ? '重试' : '测试连接' }}</span>
                  </button>
                  <button v-if="neonConfig.connectionString" type="button" class="connection-clear-btn" @click="handleClearNeonConnection">
                    清空
                  </button>
                </div>
              </div>

              <div class="modern-input-group">
                <span class="input-prefix-icon"><Database size="14" /></span>
                <input
                  type="text"
                  v-model="neonConfig.connectionString"
                  placeholder="粘贴 Neon 提供的 PostgreSQL 连接地址"
                  class="modern-code-input"
                  spellcheck="false"
                  autocomplete="off"
                />
              </div>
              
              <div class="config-helper-row">
                <span class="helper-syntax">连接地址仅保存在此设备。</span>
                <span class="helper-info">可从 Neon 控制台复制数据库连接地址。</span>
              </div>
              <div v-if="neonTestMsg" class="connection-test-result" :class="neonTestResult">
                <span>{{ neonTestMsg }}</span>
                <div v-if="neonDbInfo" class="metrics-chips">
                  <span class="metric-chip">{{ neonDbInfo.docCount }} 篇文档</span>
                  <span class="metric-chip">{{ neonDbInfo.groupCount }} 个分组</span>
                  <span class="metric-chip">{{ neonDbInfo.historyCount }} 个历史版本</span>
                  <span class="metric-chip">{{ neonDbInfo.themeCount }} 个主题</span>
                </div>
              </div>
            </div>

            <!-- Cloud Data Operations Section -->
            <details class="cloud-ops-box">
              <summary class="ops-header">
                <Cloud size="15" class="text-primary" />
                <span class="ops-title">更多数据操作</span>
                <ChevronDown size="15" class="ops-chevron" />
              </summary>

              <div class="ops-cards-grid">
                <!-- 1. Bidirectional Sync -->
                <div class="ops-card card-sync">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-blue">
                      <RefreshCw size="16" />
                    </div>
                    <div class="ops-card-title">双向同步</div>
                  </div>
                  <p class="ops-card-desc">合并本地和云端的最新内容。</p>
                  <button 
                    @click="handleTwoWaySyncNeon" 
                    class="ops-action-btn btn-blue"
                    :disabled="neonSyncResult === 'syncing' || !neonConfig.connectionString"
                  >
                    <RefreshCw size="13" :class="{ 'animate-spin': neonSyncResult === 'syncing' }" />
                    <span>立即同步</span>
                  </button>
                </div>

                <!-- 2. Push Backup -->
                <div class="ops-card card-push">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-green">
                      <FolderUp size="16" />
                    </div>
                    <div class="ops-card-title">备份到云端</div>
                  </div>
                  <p class="ops-card-desc">将此设备上的内容完整备份到云端。</p>
                  <button 
                    @click="handlePushToNeon" 
                    class="ops-action-btn btn-green"
                    :disabled="neonSyncResult === 'syncing' || !neonConfig.connectionString"
                  >
                    <FolderUp size="13" />
                    <span>开始备份</span>
                  </button>
                </div>

                <!-- 3. Pull Restore -->
                <div class="ops-card card-pull">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-purple">
                      <FolderDown size="16" />
                    </div>
                    <div class="ops-card-title">从云端恢复</div>
                  </div>
                  <p class="ops-card-desc">将云端内容恢复到此设备。</p>
                  <button 
                    @click="handlePullFromNeon" 
                    class="ops-action-btn btn-purple"
                    :disabled="neonSyncResult === 'syncing' || !neonConfig.connectionString"
                  >
                    <FolderDown size="13" />
                    <span>恢复数据</span>
                  </button>
                </div>
              </div>

              <!-- Sync Result Toast -->
              <div v-if="neonSyncMsg" class="cloud-result-banner mt-3" :class="neonSyncResult">
                {{ neonSyncMsg }}
              </div>
            </details>

          </div>
        </div>

        <!-- Platform Config View -->
        <div class="settings-main-form" v-else-if="activePlatform">
          <div class="form-section-header">
            <h3>配置详情: {{ activePlatform.name }}</h3>
            <button 
              v-if="activePlatform.id.startsWith('custom_')" 
              @click="deletePlatform(activePlatform.id)"
              class="btn-delete-plat"
              title="删除自建平台"
            >
              <Trash2 size="14" />
              <span>删除</span>
            </button>
          </div>

          <div class="form-grid">
            <!-- Platform Display Name -->
            <div class="form-group">
              <label>平台展示名称</label>
              <div class="input-with-icon">
                <Sliders class="input-icon" size="14" />
                <input type="text" v-model="activePlatform.name" placeholder="例如：掘金专栏" />
              </div>
            </div>

            <!-- Platform Accent Color -->
            <div class="form-group">
              <label>品牌标识色</label>
              <div class="color-picker-group">
                <input type="color" v-model="activePlatform.color" class="color-input-picker" />
                <input type="text" v-model="activePlatform.color" placeholder="#ffffff" class="color-text-input" />
              </div>
            </div>

            <!-- Launch URL -->
            <div class="form-group span-2">
              <label>编辑器创作页面</label>
              <div class="input-with-icon">
                <Globe class="input-icon" size="14" />
                <input type="text" v-model="activePlatform.writeUrl" placeholder="https://..." />
              </div>
              <small class="help-text">点击一键发布时，浏览器插件会自动在新标签页中打开此 URL</small>
            </div>

            <!-- Target Match Hosts -->
            <div class="form-group span-2">
              <label>注入域名白名单</label>
              <div class="input-with-icon">
                <Globe class="input-icon" size="14" />
                <input 
                  type="text" 
                  :value="activePlatform.matchHosts.join(', ')" 
                  @input="e => activePlatform.matchHosts = e.target.value.split(',').map(s => s.trim()).filter(Boolean)"
                  placeholder="juejin.cn, editor.csdn.net" 
                />
              </div>
              <small class="help-text">匹配这些域名的网页打开时，插件才会自动运行内容填装逻辑（逗号分隔）</small>
            </div>

            <!-- Title Selector -->
            <div class="form-group span-2">
              <label>文章标题 DOM 选择器</label>
              <div class="input-with-icon">
                <Code class="input-icon" size="14" />
                <input type="text" v-model="activePlatform.selectors.title" placeholder="input#title, .title-input" />
              </div>
              <small class="help-text">CSS 选择器，用于精确定位标题输入框，可使用逗号指定备选选择器</small>
            </div>

            <!-- Editor Selector -->
            <div class="form-group span-2">
              <label>编辑器主体 DOM 选择器</label>
              <div class="input-with-icon">
                <Code class="input-icon" size="14" />
                <input type="text" v-model="activePlatform.selectors.editor" placeholder=".public-DraftEditor-content, textarea" />
              </div>
              <small class="help-text">用于匹配富文本或 Markdown 编辑框的主编辑区域</small>
            </div>

            <!-- Inject Format -->
            <div class="form-group">
              <label>填装格式</label>
              <select v-model="activePlatform.selectors.format" class="format-select">
                <option value="text/plain">纯文本 / Markdown (Paste text/plain)</option>
                <option value="text/html">富文本 / HTML (Paste text/html)</option>
              </select>
            </div>

            <!-- Silent Publish Toggle -->
            <div class="form-group span-2" v-if="supportsSilent(activePlatform.id)">
              <label>分发静默设置</label>
              <label class="checkbox-container">
                <input type="checkbox" v-model="activePlatform.silentEnabled" />
                <span class="checkbox-label-text">开启后台 API 静默分发（无需弹出浏览器页签）</span>
              </label>
              <small class="help-text">
                开启后，EasyMD 将直接通过后台 API 默默创建草稿并返回编辑链接，完全不在浏览器中打开任何新窗口。如果关闭，则使用原来的方式：在新标签页拉起页面并模拟手动填装。
              </small>
            </div>
          </div>
        </div>

        <div class="settings-main-form empty-form-state" v-else>
          <Info size="24" />
          <p>请在左侧选择或添加一个发布平台进行配置</p>
        </div>
      </div>

      <div class="modal-footer">
        <div class="connection-status">
          <span class="status-dot" :class="{ 'is-connected': isExtensionConnected }"></span>
          <span>插件连接状态：{{ isExtensionConnected ? '已建立安全信道' : '离线 (本地模拟模式)' }}</span>
        </div>
        
        <div class="footer-actions">
          <button @click="handleReset" class="btn-secondary-action">
            <RotateCcw size="14" />
            <span>恢复默认</span>
          </button>
          
          <button @click="handleSave" class="btn-save-settings" :class="saveStatus">
            <Save v-if="saveStatus !== 'success'" size="14" />
            <span v-if="saveStatus === ''">保存配置</span>
            <span v-else-if="saveStatus === 'saving'">保存中...</span>
            <span v-else-if="saveStatus === 'success'">{{ activeTab === 'storage' ? '图床配置已保存 ✨' : (isExtensionConnected ? '配置已同步到插件 ✨' : '配置已保存 ✨') }}</span>
            <span v-else-if="saveStatus === 'error'">保存失败</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<style scoped>
/* Figma UI Kit Modal Overlay & Card */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Vue <Transition name="modal"> classes */
.modal-enter-active {
  transition: opacity 0.2s ease;
}
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* UI Kit Modal Card */
.modal-card {
  background: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 12px;
  box-shadow: 
    0 20px 40px rgba(19, 10, 46, 0.12),
    0 1px 4px rgba(19, 10, 46, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--font-sans);
}
/* Card slides up inside the fading overlay */
.modal-enter-active .modal-card {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}
.modal-leave-active .modal-card {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.modal-enter-from .modal-card {
  transform: translateY(12px) scale(0.97);
  opacity: 0;
}
.modal-leave-to .modal-card {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}

.modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color, #E2E8F0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card, #FFFFFF);
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-area h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--text-main, #1F2937);
  letter-spacing: -0.01em;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted, #6B7280);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-close:hover {
  background: var(--bg-capsule, #F3F4F6);
  color: var(--text-main, #1F2937);
}

.btn-close:active {
  transform: scale(0.95);
}

.settings-card {
  width: 840px;
  max-width: 95vw;
  height: 640px;
  max-height: 90vh;
}

.settings-gear {
  animation: rotate 12s linear infinite;
  color: var(--accent-color);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.settings-body-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 0 !important;
}

.settings-sidebar {
  width: 220px;
  border-right: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.01);
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.platform-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.platform-tab-btn {
  background: transparent;
  border: 1px solid transparent;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.platform-tab-btn:hover {
  background: rgba(0, 0, 0, 0.03);
}

.platform-tab-btn.is-active {
  background: var(--bg-editor);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.color-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tab-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-sublabel {
  font-size: 9px;
  font-family: monospace;
  color: var(--text-muted);
  margin-left: auto;
  background: rgba(0,0,0,0.04);
  padding: 1px 4px;
  border-radius: 4px;
}

.btn-add-platform {
  background: transparent;
  border: 1px dashed var(--border-color);
  color: var(--text-main);
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.btn-add-platform:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: var(--accent-bg);
}

.settings-main-form {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--bg-editor);
}

.empty-form-state {
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 12px;
}

.form-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.form-section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.btn-delete-plat {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #ef4444;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.btn-delete-plat:hover {
  background: #ef4444;
  color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}

.span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
}

.input-with-icon input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.input-with-icon input:focus {
  border-color: var(--accent-color);
}

.help-text {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
}

.color-picker-group {
  display: flex;
  gap: 8px;
}

.color-input-picker {
  width: 36px;
  height: 34px;
  padding: 2px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  font-family: monospace;
}

.color-text-input:focus {
  border-color: var(--accent-color);
}

.input-with-icon select {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  height: 38px;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.input-with-icon select:focus {
  border-color: var(--accent-color);
}

.format-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color, #E2E8F0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-sidebar, #F8FAFC);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted, #6B7280);
  font-family: var(--font-sans);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

.status-dot.is-connected {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary-action {
  background: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-color, #E2E8F0);
  color: var(--text-main, #374151);
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s ease;
}

.btn-secondary-action:hover {
  background: var(--bg-capsule, #F3F4F6);
  border-color: var(--border-strong, #CBD5E1);
  color: var(--text-main, #1F2937);
}

.btn-secondary-action:active {
  transform: scale(0.98);
}

.btn-save-settings {
  background: var(--brand-primary, #116ACC);
  border: none;
  color: #ffffff;
  padding: 7px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: var(--font-sans);
  box-shadow: 0 1px 2px rgba(17, 106, 204, 0.18);
  transition: all 0.15s ease;
}

.btn-save-settings:hover {
  background: var(--brand-primary-hover, #0C4A8F);
  box-shadow: 0 4px 12px rgba(17, 106, 204, 0.28);
}

.btn-save-settings:active {
  transform: scale(0.98);
}

.btn-save-settings.success {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  height: 38px;
  box-sizing: border-box;
  margin: 0;
}

.checkbox-container input {
  cursor: pointer;
  accent-color: var(--accent-color);
  width: 16px;
  height: 16px;
  margin: 0;
}

.checkbox-label-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

.sidebar-divider {
  height: 1px;
  background: var(--border-color);
  margin: 10px 4px;
}

.general-tab-btn {
  color: var(--accent-color);
}

.general-indicator-icon {
  color: var(--accent-coral);
}

.sound-control-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sound-status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.text-accent {
  color: var(--accent-coral) !important;
}

.text-muted {
  color: var(--text-muted) !important;
}

/* ── File Storage (图床) Styles ── */
.storage-tab-btn {
  color: #8b5cf6;
}

.storage-indicator-icon {
  color: #8b5cf6;
}

/* ── File Storage (图床) 专属样式 ── */
.storage-main-form {
  padding: 20px 24px 24px 16px;
  gap: 14px;
}

/* 全局独立控制：剪贴板图片自动上传 */
.storage-global-banner {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 13px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.storage-global-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.storage-global-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.storage-global-title {
  color: var(--text-main);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.01em;
}

.storage-global-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--bg-app);
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.storage-global-badge.is-active {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.storage-global-desc {
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
}

/* 存储布局：存储平台窄列贴左，右侧表单展开 */
.storage-layout {
  display: grid;
  grid-template-columns: 142px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.storage-provider-nav,
.storage-config-panel {
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
}

.storage-provider-nav {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.storage-provider-heading {
  padding: 4px 6px 6px;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
}

.storage-provider-option {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-main);
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.storage-provider-option:hover:not(:disabled) {
  background: var(--bg-app);
}

.storage-provider-option.is-selected {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1769c2;
}

.storage-provider-option.is-unavailable {
  opacity: 0.5;
  cursor: not-allowed;
}

.storage-provider-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.storage-provider-copy strong {
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.storage-provider-copy small {
  color: var(--text-muted);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.storage-provider-check {
  flex: none;
  color: #1769c2;
}

.storage-provider-note {
  margin: 6px 6px 2px;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.35;
}

.storage-config-panel {
  padding: 18px 20px;
}

.storage-fields {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.storage-optional {
  margin-left: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 400;
}

.storage-test-result {
  margin-top: 12px;
}

.secret-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.secret-input {
  width: 100%;
  padding: 8px 36px 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-app);
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s ease;
}

.secret-input:focus {
  border-color: var(--accent-color);
}

.secret-toggle-btn {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.secret-toggle-btn:hover {
  color: var(--text-main);
}

.storage-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 15px;
}

.btn-test-connection {
  background: transparent;
  border: 1px solid #8b5cf6;
  color: #8b5cf6;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
  font-family: inherit;
}

.btn-test-connection:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.08);
  transform: translateY(-1px);
}

.btn-test-connection:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-test-connection.success {
  background: #ecfdf5;
  border-color: #10b981;
  color: #059669;
}

.btn-test-connection.error {
  background: #fef2f2;
  border-color: #ef4444;
  color: #dc2626;
}

.btn-save-storage {
  background: var(--accent-color);
  border: 1px solid var(--border-color);
  color: #1e1e1e;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: inherit;
}

.btn-save-storage:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-save-storage.is-saved {
  background: #10b981 !important;
  color: #ffffff !important;
  border-color: #059669 !important;
}

.test-result-msg {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.test-result-msg.success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #10b98133;
}

.test-result-msg.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #ef444433;
}

/* ── Modern Cloud Database Sync Dashboard Styles ── */
.cloud-sync-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeIn 0.25s ease-out;
}

/* 1. Header Box & Segmented Channel Tabs */
.cloud-header-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cloud-nav-segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: transparent;
  padding: 0;
  border-radius: 12px;
}

.cloud-nav-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 11px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
  position: relative;
  font-family: inherit;
}

.cloud-nav-tab:hover {
  background: var(--bg-app);
  border-color: rgba(59, 130, 246, 0.24);
}

.cloud-nav-tab.is-active {
  background: rgba(59, 130, 246, 0.035);
  border-color: rgba(59, 130, 246, 0.38);
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.tab-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.tab-icon-wrap.tidb-color {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}

.tab-icon-wrap.neon-color {
  background: rgba(0, 229, 153, 0.12);
  color: #00e599;
}

.cloud-nav-tab.is-active .tab-icon-wrap.tidb-color {
  background: #f97316;
  color: #ffffff;
}

.cloud-nav-tab.is-active .tab-icon-wrap.neon-color {
  background: #00e599;
  color: #0f172a;
}

.tab-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.tab-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.tab-sub {
  font-size: 10.5px;
  color: var(--text-muted);
  font-weight: 500;
}

.tab-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-app);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  opacity: 0.5;
}

.tab-status-pill.is-active {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.tab-status-pill.is-active .pill-dot {
  background: #10b981;
  opacity: 1;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
  animation: pulse-dot 2s infinite ease-in-out;
}

.tab-status-pill.is-ready {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
}

.tab-status-pill.is-ready .pill-dot {
  background: #3b82f6;
  opacity: 0.9;
}

/* 2. Cloud Body Section */
.cloud-body-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 3. Provider Hero Card */
.provider-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.provider-hero-card.hero-active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.09) 0%, rgba(16, 185, 129, 0.02) 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.08);
}

.provider-hero-card.hero-standby {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.hero-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.hero-avatar.tidb-gradient {
  background: linear-gradient(135deg, #ff7849 0%, #ff4d4f 100%);
  color: #ffffff;
}

.hero-avatar.neon-gradient {
  background: linear-gradient(135deg, #00e599 0%, #059669 100%);
  color: #0f172a;
}

.hero-content {
  flex: 1;
  min-width: 0;
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.hero-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.hero-state-badge {
  font-size: 10.5px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
}

.hero-state-badge.badge-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.hero-state-badge.badge-standby {
  background: var(--bg-app);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.hero-desc {
  font-size: 11.5px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.hero-right {
  flex-shrink: 0;
}

.hero-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  border: 1px solid transparent;
}

.hero-toggle-btn.btn-active-switch {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.35);
}

.hero-toggle-btn.btn-active-switch:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
}

.hero-toggle-btn.btn-activate-switch {
  background: var(--accent-color);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.hero-toggle-btn.btn-activate-switch:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* 4. Connection Config Card */
.cloud-config-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.connection-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.connection-test-btn {
  flex: 0 0 auto;
  width: auto;
  min-width: 0;
  padding: 5px 9px;
  font-size: 11px;
}

.connection-header-actions .connection-test-btn {
  flex: 0 0 auto;
  width: auto;
}

.connection-clear-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid var(--border-color);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-muted);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.connection-clear-btn:hover {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
}

.connection-test-result {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 7px;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.4;
}

.connection-test-result.success {
  color: #059669;
}

.connection-test-result.error {
  color: #dc2626;
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.config-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main);
}

.text-accent {
  color: var(--accent-color);
}

.btn-quick-fill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #3b82f6;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-quick-fill:hover {
  background: rgba(59, 130, 246, 0.16);
  border-color: #3b82f6;
}

.modern-input-group {
  display: flex;
  align-items: center;
  background: var(--bg-app);
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  padding: 0 8px;
  transition: all 0.2s ease;
}

.modern-input-group:focus-within {
  border-color: #3b82f6;
  background: var(--bg-card);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.input-prefix-icon {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  margin-right: 6px;
  flex-shrink: 0;
}

.modern-code-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.15px;
  color: var(--text-main);
  padding: 8px 0;
}

.input-suffix-action {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.input-suffix-action:hover {
  color: var(--text-main);
}

.config-helper-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}

.helper-syntax code {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  padding: 1px 4px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  font-size: 10.5px;
  color: var(--text-main);
}

.helper-info {
  opacity: 0.85;
}

/* 5. Switch Row */
.cloud-switch-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cloud-sync-state-row,
.cloud-sync-auto-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sync-state-label {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--bg-app);
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
  vertical-align: 1px;
}

.sync-state-label.is-active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.sync-state-button {
  flex: 0 0 auto;
  min-width: 76px;
  padding: 6px 12px;
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  background: var(--accent-color);
  color: #fff;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.sync-state-button.is-active {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.sync-state-button.is-active:hover {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.sync-state-button:disabled {
  border-color: var(--border-color);
  background: var(--bg-app);
  color: var(--text-muted);
  cursor: not-allowed;
}

.sync-settings-divider {
  height: 1px;
  background: var(--border-color);
}

.cloud-sync-auto-row .switch-title {
  font-size: 12px;
}

.cloud-sync-auto-row .switch-desc {
  font-size: 11px;
}

.switch-card-info {
  flex: 1;
}

.switch-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 2px;
}

.switch-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.35;
}

/* Modern Switch */
.modern-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.modern-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border-color);
  transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.modern-switch input:checked + .slider {
  background-color: #10b981;
}

.modern-switch input:focus + .slider {
  box-shadow: 0 0 1px #10b981;
}

.modern-switch input:checked + .slider:before {
  transform: translateX(18px);
}

.modern-switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cloud-test {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-cloud-test:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.btn-cloud-test.success {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}

.btn-cloud-test.error {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.btn-cloud-test:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cloud-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: var(--accent-color);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-cloud-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.btn-cloud-save.is-saved {
  background: #10b981;
}

/* 7. Result Banner & Stat Badges */
.cloud-result-banner {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 11.5px;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cloud-result-banner.success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.cloud-result-banner.error {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.cloud-result-banner.syncing,
.cloud-result-banner.testing {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.metrics-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.metric-chip {
  font-size: 10.5px;
  font-weight: 600;
  background: var(--bg-card);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 2px 7px;
  border-radius: 6px;
  color: #065f46;
}

/* 8. Cloud Ops Section & Cards */
.cloud-ops-box {
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ops-header {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
  cursor: pointer;
  list-style: none;
}

.ops-header::-webkit-details-marker {
  display: none;
}

.ops-header:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.55);
  outline-offset: 3px;
  border-radius: 4px;
}

.ops-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-main);
}

.ops-chevron {
  margin-left: auto;
  color: var(--text-muted);
  transition: transform 0.18s ease;
}

.cloud-ops-box[open] .ops-chevron {
  transform: rotate(180deg);
}

.text-primary {
  color: #3b82f6;
}

.ops-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.ops-card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 10px;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.ops-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.ops-card.card-sync:hover {
  border-color: rgba(59, 130, 246, 0.4);
}

.ops-card.card-push:hover {
  border-color: rgba(16, 185, 129, 0.4);
}

.ops-card.card-pull:hover {
  border-color: rgba(139, 92, 246, 0.4);
}

.ops-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.ops-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ops-icon-wrap.icon-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}

.ops-icon-wrap.icon-green {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.ops-icon-wrap.icon-purple {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}

.ops-card-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.ops-card-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.35;
  margin: 0 0 10px 0;
  flex: 1;
  min-height: 30px;
}

.ops-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #ffffff;
}

.ops-action-btn.btn-blue {
  background: #3b82f6;
}
.ops-action-btn.btn-blue:hover:not(:disabled) {
  background: #2563eb;
}

.ops-action-btn.btn-green {
  background: #10b981;
}
.ops-action-btn.btn-green:hover:not(:disabled) {
  background: #059669;
}

.ops-action-btn.btn-purple {
  background: #8b5cf6;
}
.ops-action-btn.btn-purple:hover:not(:disabled) {
  background: #7c3aed;
}

.ops-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mt-3 {
  margin-top: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

@media (max-width: 900px) {
  .sync-action-grid {
    grid-template-columns: 1fr;
  }
  .storage-layout {
    grid-template-columns: 130px minmax(0, 1fr);
    gap: 10px;
  }
}

/* Settings Modal Responsiveness */
@media (max-width: 768px) {
  .settings-card {
    width: 95vw !important;
    height: 85vh !important;
  }
  
  .settings-body-container {
    flex-direction: column !important;
    overflow-y: auto !important;
  }
  
  .settings-sidebar {
    width: 100% !important;
    border-right: none !important;
    border-bottom: 1px solid var(--border-color) !important;
    padding: 12px !important;
  }
  
  .platform-list {
    flex-direction: row !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding-bottom: 8px !important;
    gap: 8px !important;
  }
  
  .sidebar-divider {
    width: 1px !important;
    height: 24px !important;
    background: var(--border-color) !important;
    margin: auto 4px !important;
  }
  
  .platform-tab-btn {
    padding: 6px 12px !important;
    white-space: nowrap !important;
  }
  
  .tab-sublabel {
    display: none !important;
  }
  
  .btn-add-platform {
    width: auto !important;
    align-self: flex-start !important;
  }
  
  .settings-main-form {
    padding: 16px !important;
  }

  .storage-layout {
    grid-template-columns: 1fr;
  }

  .storage-provider-nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
  }

  .storage-provider-heading,
  .storage-provider-note {
    grid-column: 1 / -1;
  }

  .storage-provider-option { min-width: 0; }

  .storage-config-panel { padding: 13px; }

  .storage-actions { flex-wrap: wrap; }
  
  .form-grid {
    grid-template-columns: 1fr !important;
  }
  
  .span-2 {
    grid-column: span 1 !important;
  }
  
  .modal-footer {
    flex-direction: column !important;
    gap: 12px !important;
    padding: 12px 16px !important;
    align-items: stretch !important;
  }
  
  .footer-actions {
    justify-content: space-between !important;
  }
}
</style>
