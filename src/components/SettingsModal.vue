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
  ChevronDown,
  GitBranch
} from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';
import { soundEngine } from '../utils/synthAudio';
import {
  EDITOR_FONT_OPTIONS,
  EDITOR_FONT_SIZE_STORAGE_KEY,
  EDITOR_FONT_FAMILY_STORAGE_KEY,
  EDITOR_SYNC_SCROLL_STORAGE_KEY,
  EDITOR_SETTINGS_UPDATED_EVENT,
  DEFAULT_EDITOR_FONT_SIZE,
  DEFAULT_EDITOR_FONT_SIZE_NUM,
  DEFAULT_EDITOR_FONT_FAMILY_KEY,
  MIN_EDITOR_FONT_SIZE,
  MAX_EDITOR_FONT_SIZE,
  formatEditorFontSizeNumber,
  normalizeEditorFontSize,
  ensureEditorFontLoaded,
  loadEditorPreferences,
  loadSyncScrollPreference
} from '../utils/editorPreferences';
import {
  getStorageConfig,
  saveStorageConfig,
  isStorageEnabled,
  hasCustomStorageConfig,
  hasStorageProviderConfig,
  checkServerDefaultOssAvailable,
  getServerDefaultOssStatus
} from '../utils/fileStorage';
import {
  getActiveCloudProvider,
  setActiveCloudProvider,
  isCloudSyncEnabled,
  disableAllCloudSync
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
import {
  getGithubConfig,
  saveGithubConfig,
  hasGithubCredentials,
  testGithubConnection,
  pushAllToGithub,
  pullFromGithub,
  syncGithubBidirectional,
  getGithubLastSyncTime
} from '../utils/githubStorage';
import { loadDocuments, saveDocuments, loadGroups, saveGroups } from '../utils/docStorage';
import { getAllDocSnapshots, saveAllDocSnapshots } from '../utils/docHistory';
import { loadCustomThemes, saveCustomThemes, mergeCustomThemes } from '../utils/themePresets';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialTab: {
    type: String,
    default: ''
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
  { id: 'aliyun-oss', name: '阿里云 OSS', subtitle: '对象存储' },
  { id: 'tencent-cos', name: '腾讯云 COS', subtitle: '对象存储' },
  { id: 'qiniu-kodo', name: '七牛云 Kodo', subtitle: '对象存储' },
  { id: 'upyun-uss', name: '又拍云 USS', subtitle: '云存储' },
  { id: 'huawei-obs', name: '华为云 OBS', subtitle: '对象存储' },
  { id: 'github', name: 'GitHub', subtitle: '代码仓库' },
  { id: 'custom-s3', name: '兼容 S3 的存储', subtitle: 'S3 API' },
];
const storageFieldDefinitions = {
  'aliyun-oss': [
    { key: 'accessKey', label: 'AccessKey ID', type: 'text', required: true, placeholder: '输入 AccessKey ID' },
    { key: 'secretKey', label: 'AccessKey Secret', type: 'secret', required: true, placeholder: '输入 AccessKey Secret' },
    { key: 'bucketName', label: 'Bucket 名称', type: 'text', required: true, placeholder: '例如：my-image-bucket' },
    { key: 'endPoint', label: '地域节点 Endpoint', type: 'text', required: true, placeholder: 'oss-cn-hangzhou.aliyuncs.com' },
    { key: 'domain', label: '访问域名', type: 'url', placeholder: 'Bucket 域名或 CDN 域名', help: '留空时使用 Bucket 默认访问域名' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
  ],
  'tencent-cos': [
    { key: 'secretId', label: 'SecretId', type: 'text', required: true, placeholder: '输入 SecretId' },
    { key: 'secretKey', label: 'SecretKey', type: 'secret', required: true, placeholder: '输入 SecretKey' },
    { key: 'bucketName', label: '存储桶名称', type: 'text', required: true, placeholder: 'bucket-appid' },
    { key: 'region', label: '存储桶地域', type: 'text', required: true, placeholder: '例如：ap-shanghai' },
    { key: 'domain', label: '访问域名', type: 'url', placeholder: 'COS 默认域名或 CDN 域名' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
  ],
  'qiniu-kodo': [
    { key: 'accessKey', label: 'AccessKey', type: 'text', required: true, placeholder: '输入 AccessKey' },
    { key: 'secretKey', label: 'SecretKey', type: 'secret', required: true, placeholder: '输入 SecretKey' },
    { key: 'bucketName', label: '空间名称', type: 'text', required: true, placeholder: '七牛云存储空间名称' },
    { key: 'region', label: '存储区域', type: 'select', required: true, options: [
      { value: 'z0', label: '华东（z0）' }, { value: 'z1', label: '华北（z1）' }, { value: 'z2', label: '华南（z2）' },
      { value: 'na0', label: '北美（na0）' }, { value: 'as0', label: '东南亚（as0）' },
    ] },
    { key: 'domain', label: '绑定域名', type: 'url', required: true, placeholder: 'https://image.example.com' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
  ],
  'upyun-uss': [
    { key: 'operator', label: '操作员', type: 'text', required: true, placeholder: '输入又拍云操作员名称' },
    { key: 'password', label: '操作员密码', type: 'secret', required: true, placeholder: '输入操作员密码' },
    { key: 'bucketName', label: '服务名称', type: 'text', required: true, placeholder: '又拍云存储服务名称' },
    { key: 'domain', label: '绑定域名', type: 'url', required: true, placeholder: 'https://image.example.com' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
  ],
  'huawei-obs': [
    { key: 'accessKey', label: 'Access Key ID', type: 'text', required: true, placeholder: '输入 Access Key ID' },
    { key: 'secretKey', label: 'Secret Access Key', type: 'secret', required: true, placeholder: '输入 Secret Access Key' },
    { key: 'bucketName', label: '桶名称', type: 'text', required: true, placeholder: '华为云 OBS 桶名称' },
    { key: 'endPoint', label: 'Endpoint', type: 'text', required: true, placeholder: 'obs.cn-north-4.myhuaweicloud.com' },
    { key: 'domain', label: '访问域名', type: 'url', placeholder: 'OBS 默认域名或 CDN 域名' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
  ],
  github: [
    { key: 'token', label: 'Fine-grained Token', type: 'secret', required: true, placeholder: '输入仓库内容写入权限的 Token' },
    { key: 'owner', label: '仓库所有者', type: 'text', required: true, placeholder: '用户名或组织名' },
    { key: 'repo', label: '仓库名称', type: 'text', required: true, placeholder: '公开仓库名称' },
    { key: 'branch', label: '分支', type: 'text', placeholder: '留空使用默认分支' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
    { key: 'domain', label: '图片访问域名', type: 'url', placeholder: '留空使用 GitHub 文件地址' },
  ],
  'custom-s3': [
    { key: 'accessKey', label: 'Access Key ID', type: 'text', required: true, placeholder: '输入 Access Key ID' },
    { key: 'secretKey', label: 'Secret Access Key', type: 'secret', required: true, placeholder: '输入 Secret Access Key' },
    { key: 'bucketName', label: 'Bucket 名称', type: 'text', required: true, placeholder: '输入 Bucket 名称' },
    { key: 'endPoint', label: 'S3 Endpoint', type: 'url', required: true, placeholder: 'https://s3.example.com' },
    { key: 'region', label: 'Region', type: 'text', placeholder: '默认 us-east-1' },
    { key: 'domain', label: '公开访问域名', type: 'url', placeholder: 'CDN 或 Bucket 公开域名' },
    { key: 'basePath', label: '存储路径', type: 'text', placeholder: '例如：images/articles' },
  ],
};
const serverOssStatus = ref(getServerDefaultOssStatus() || { hasDefault: false, bucket: '', endpoint: '', domain: '' });
const activeStorageProviderConfig = computed(() => {
  const providerId = storageConfig.value.platform || 'aliyun-oss';
  if (providerId === 'aliyun-oss') return storageConfig.value;
  const providers = storageConfig.value.providers || (storageConfig.value.providers = {});
  return providers[providerId] || (providers[providerId] = {});
});
const activeStorageFields = computed(() => storageFieldDefinitions[storageConfig.value.platform] || storageFieldDefinitions['aliyun-oss']);
const activeProviderMeta = computed(() => storageProviders.find(provider => provider.id === storageConfig.value.platform) || storageProviders[0]);
const isCustomOssConfigured = computed(() => storageConfig.value.platform === 'aliyun-oss' && hasCustomStorageConfig(storageConfig.value));
const activeProviderConfigured = computed(() => hasStorageProviderConfig(storageConfig.value));
const canAutoUpload = computed(() => activeProviderConfigured.value || (storageConfig.value.platform === 'aliyun-oss' && serverOssStatus.value.hasDefault));
const activeProviderNote = computed(() => ({
  'aliyun-oss': '必填：AccessKey ID、AccessKey Secret、Bucket、Endpoint。访问域名和存储路径可选；请为 Bucket 配置浏览器跨域规则。',
  'tencent-cos': 'Bucket 名称需包含 APPID（bucket-appid 格式）；请在 COS 控制台配置跨域规则并限制密钥权限。',
  'qiniu-kodo': '请配置存储区域和已绑定的公开域名，并在空间设置中允许当前站点跨域上传。',
  'upyun-uss': '使用操作员上传权限；请在服务或绑定域名上允许当前站点跨域请求。',
  'huawei-obs': 'Endpoint 填写桶所在区域的 OBS 域名；请配置桶跨域规则和公开读取方式。',
  github: '每张图片会在指定仓库创建一次提交。建议使用仅有 Contents 写入权限的 Fine-grained Token 和公开仓库。',
  'custom-s3': '请填写 S3 API Endpoint 和 Region，并在桶上配置允许 PUT 的跨域规则及图片公开读取。',
}[storageConfig.value.platform] || '请填写当前平台的上传配置信息。'));
const autoUploadEnabled = computed(() => canAutoUpload.value && storageConfig.value.enableStorage !== false);
const autoUploadStatusLabel = computed(() => {
  if (!canAutoUpload.value) return '待配置图床';
  return autoUploadEnabled.value ? '已启用' : '已关闭';
});
const storageTestResult = ref(''); // '', 'testing', 'success', 'error'
const storageTestMsg = ref('');
const showSecretKey = ref(false);

function setStorageProvider(providerId) {
  storageConfig.value.platform = providerId;
  storageTestResult.value = '';
  storageTestMsg.value = '';
  showSecretKey.value = false;
}

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
    if (storageConfig.value.platform === 'aliyun-oss' && !isCustomOssConfigured.value && serverOssStatus.value.hasDefault) {
      await testOSSConnection();
      storageTestResult.value = 'success';
    } else {
      if (!activeProviderConfigured.value) throw new Error('请先填写当前平台的必填配置');
      await testOSSConnection({ ...storageConfig.value });
    }
    storageTestResult.value = 'success';
    storageTestMsg.value = storageConfig.value.platform === 'github'
      ? '仓库可访问；实际上传还需要 Contents 写入权限。'
      : `${activeProviderMeta.value.name}连接成功。`;
    soundEngine.playChime();
  } catch (err) {
    storageTestResult.value = 'error';
    storageTestMsg.value = '连接失败: ' + err.message;
  }
}

function handleToggleAutoUpload(event) {
  if (!canAutoUpload.value) return;
  soundEngine.playClick();
  storageConfig.value.enableStorage = event.target.checked;
  saveStorageConfig({ ...storageConfig.value });
}

// ── Unified Cloud Sync Provider ('tidb' | 'neon' | 'github') ──
const cloudProvider = ref(getActiveCloudProvider());
const activeCloudProvider = ref(getActiveCloudProvider());
const isCloudSyncActive = ref(isCloudSyncEnabled());
let isLoadingCloudConfigs = false;

// ── TiDB Serverless MySQL Sync State ──
const tidbConfig = ref(getTidbConfig());
const tidbTestResult = ref(''); // '', 'testing', 'success', 'error'
const tidbTestMsg = ref('');
const tidbSyncResult = ref(''); // '', 'syncing', 'success', 'error'
const tidbSyncMsg = ref('');
const tidbDbInfo = ref(null);

// ── Neon Serverless Postgres Sync State ──
const neonConfig = ref(getNeonConfig());
const neonTestResult = ref('');
const neonTestMsg = ref('');
const neonSyncResult = ref('');
const neonSyncMsg = ref('');
const neonDbInfo = ref(null);

// ── GitHub Repository Sync State ──
const githubConfig = ref(getGithubConfig());
const githubTestResult = ref('');
const githubTestMsg = ref('');
const githubSyncResult = ref('');
const githubSyncMsg = ref('');
const githubRepoInfo = ref(null);

const CLOUD_PROVIDER_UI = {
  tidb: {
    label: 'TiDB Cloud',
    targetLabel: 'TiDB 云端',
    configRef: tidbConfig,
    saveConfig: saveTidbConfig,
    testResult: tidbTestResult,
    testMsg: tidbTestMsg,
    syncResult: tidbSyncResult,
    syncMsg: tidbSyncMsg,
    infoRef: tidbDbInfo,
    hasCredentials: () => Boolean(tidbConfig.value.connectionString.trim()),
    getCredentialArg: () => tidbConfig.value.connectionString,
    missingCredMsg: '请先填写自己的数据库连接地址。',
    testFn: (arg) => testTidbConnection(arg),
    pushFn: pushAllToTidb,
    pullFn: pullFromTidb,
    syncFn: syncTidbBidirectional,
    testSuccessMsg: '数据库连接正常。',
  },
  neon: {
    label: 'Neon Postgres',
    targetLabel: 'Neon 云端',
    configRef: neonConfig,
    saveConfig: saveNeonConfig,
    testResult: neonTestResult,
    testMsg: neonTestMsg,
    syncResult: neonSyncResult,
    syncMsg: neonSyncMsg,
    infoRef: neonDbInfo,
    hasCredentials: () => Boolean(neonConfig.value.connectionString.trim()),
    getCredentialArg: () => neonConfig.value.connectionString,
    missingCredMsg: '请先填写 Neon 数据库连接串。',
    testFn: (arg) => testNeonConnection(arg),
    pushFn: pushAllToNeon,
    pullFn: pullFromNeon,
    syncFn: syncNeonBidirectional,
    testSuccessMsg: '数据库连接正常。',
  },
  github: {
    label: 'GitHub 仓库',
    targetLabel: 'GitHub 仓库',
    configRef: githubConfig,
    saveConfig: saveGithubConfig,
    testResult: githubTestResult,
    testMsg: githubTestMsg,
    syncResult: githubSyncResult,
    syncMsg: githubSyncMsg,
    infoRef: githubRepoInfo,
    hasCredentials: () => hasGithubCredentials(githubConfig.value),
    getCredentialArg: () => ({ ...githubConfig.value }),
    missingCredMsg: '请先填写 GitHub Token、仓库拥有者与仓库名称。',
    testFn: (arg) => testGithubConnection(arg),
    pushFn: pushAllToGithub,
    pullFn: pullFromGithub,
    syncFn: syncGithubBidirectional,
    testSuccessMsg: 'GitHub 仓库连接正常。',
  },
};

function refreshCloudState() {
  activeCloudProvider.value = getActiveCloudProvider();
  isCloudSyncActive.value = isCloudSyncEnabled();
}

function setCloudProvider(p) {
  cloudProvider.value = p;
  soundEngine.playClick();
}

const isTidbActive = computed(() =>
  Boolean(isCloudSyncActive.value && activeCloudProvider.value === 'tidb' && tidbConfig.value.enabled && tidbConfig.value.connectionString.trim())
);

const isNeonActive = computed(() =>
  Boolean(isCloudSyncActive.value && activeCloudProvider.value === 'neon' && neonConfig.value.enabled && neonConfig.value.connectionString.trim())
);

const isGithubActive = computed(() =>
  Boolean(isCloudSyncActive.value && activeCloudProvider.value === 'github' && githubConfig.value.enabled && hasGithubCredentials(githubConfig.value))
);

const hasGithubConfigReady = computed(() => hasGithubCredentials(githubConfig.value));

const hasReusableImageGithub = computed(() => {
  const imgGh = storageConfig.value?.providers?.github;
  return Boolean(imgGh && String(imgGh.token || '').trim() && String(imgGh.owner || '').trim() && String(imgGh.repo || '').trim());
});

const currentCloudPanel = computed(() => {
  const id = cloudProvider.value;
  if (id === 'github') {
    return {
      id: 'github',
      active: isGithubActive.value,
      hasCred: hasGithubConfigReady.value,
      config: githubConfig.value,
      syncResult: githubSyncResult.value,
      syncMsg: githubSyncMsg.value,
      autoDesc: '停止编辑约 2 秒后同步到 GitHub 仓库。',
      inactiveDesc: !hasGithubConfigReady.value ? '请先填写 GitHub Token 与仓库信息。' : '启用后开始同步到 GitHub 仓库。',
      activeDesc: '文档与分组会同步到你的 GitHub 仓库。',
      pushDesc: '将本地全部文档与分组完整备份到仓库。',
      pullDesc: '从 GitHub 仓库拉取并还原文档与分组。',
    };
  }
  if (id === 'neon') {
    const hasCred = Boolean(neonConfig.value.connectionString.trim());
    return {
      id: 'neon',
      active: isNeonActive.value,
      hasCred,
      config: neonConfig.value,
      syncResult: neonSyncResult.value,
      syncMsg: neonSyncMsg.value,
      autoDesc: '停止编辑约 2 秒后保存到云端。',
      inactiveDesc: !hasCred ? '请先填写自己的数据库连接地址。' : '启用后开始同步到你的数据库。',
      activeDesc: '内容会同步到你的数据库。',
      pushDesc: '将此设备上的内容完整备份到云端。',
      pullDesc: '将云端内容恢复到此设备。',
    };
  }
  const hasCred = Boolean(tidbConfig.value.connectionString.trim());
  return {
    id: 'tidb',
    active: isTidbActive.value,
    hasCred,
    config: tidbConfig.value,
    syncResult: tidbSyncResult.value,
    syncMsg: tidbSyncMsg.value,
    autoDesc: '停止编辑约 2 秒后保存到云端。',
    inactiveDesc: !hasCred ? '请先填写自己的数据库连接地址。' : '启用后开始同步到你的数据库。',
    activeDesc: '内容会同步到你的数据库。',
    pushDesc: '将此设备上的内容完整备份到云端。',
    pullDesc: '将云端内容恢复到此设备。',
  };
});

function handleReuseImageGithubConfig() {
  const imgGh = storageConfig.value?.providers?.github || {};
  soundEngine.playClick();
  githubConfig.value.token = String(imgGh.token || '').trim();
  githubConfig.value.owner = String(imgGh.owner || '').trim();
  githubConfig.value.repo = String(imgGh.repo || '').trim();
  githubConfig.value.branch = String(imgGh.branch || '').trim();
  if (!githubConfig.value.basePath.trim()) {
    githubConfig.value.basePath = 'notes';
  }
  githubTestResult.value = '';
  githubTestMsg.value = '';
  githubRepoInfo.value = null;
}

function handleActivateProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta || !meta.hasCredentials()) return;
  soundEngine.playClick();
  isLoadingCloudConfigs = true;
  try {
    for (const [id, entry] of Object.entries(CLOUD_PROVIDER_UI)) {
      const enabled = id === p;
      entry.configRef.value.enabled = enabled;
      entry.saveConfig({ ...entry.configRef.value, enabled });
    }
    setActiveCloudProvider(p, true);
    activeCloudProvider.value = p;
    isCloudSyncActive.value = isCloudSyncEnabled();
    soundEngine.playChime();
  } finally {
    isLoadingCloudConfigs = false;
  }
}

function handleDeactivateProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta) return;
  soundEngine.playClick();
  isLoadingCloudConfigs = true;
  try {
    meta.configRef.value.enabled = false;
    meta.saveConfig({ ...meta.configRef.value, enabled: false });
    disableAllCloudSync();
    isCloudSyncActive.value = false;
  } finally {
    isLoadingCloudConfigs = false;
  }
}

function handleToggleCurrentProvider(p) {
  const activeMap = { tidb: isTidbActive.value, neon: isNeonActive.value, github: isGithubActive.value };
  if (activeMap[p]) {
    handleDeactivateProvider(p);
  } else {
    handleActivateProvider(p);
  }
}

function loadTidbConfig() { tidbConfig.value = getTidbConfig(); }
function loadNeonConfig() { neonConfig.value = getNeonConfig(); }
function loadGithubConfig() { githubConfig.value = getGithubConfig(); }

function setupProviderWatch(providerId) {
  const meta = CLOUD_PROVIDER_UI[providerId];
  watch(meta.configRef, (newVal) => {
    if (!newVal || isLoadingCloudConfigs) return;
    meta.saveConfig({ ...newVal });
    if (newVal.enabled) {
      isLoadingCloudConfigs = true;
      try {
        for (const [otherId, otherMeta] of Object.entries(CLOUD_PROVIDER_UI)) {
          if (otherId !== providerId && otherMeta.configRef.value.enabled) {
            otherMeta.configRef.value.enabled = false;
            otherMeta.saveConfig({ ...otherMeta.configRef.value, enabled: false });
          }
        }
        setActiveCloudProvider(providerId, true);
        activeCloudProvider.value = providerId;
      } finally {
        isLoadingCloudConfigs = false;
      }
    }
    isCloudSyncActive.value = isCloudSyncEnabled();
  }, { deep: true });
}

setupProviderWatch('tidb');
setupProviderWatch('neon');
setupProviderWatch('github');

async function handleTestCloudProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta) return;
  if (!meta.hasCredentials()) {
    meta.testResult.value = 'error';
    meta.testMsg.value = meta.missingCredMsg;
    return;
  }
  meta.testResult.value = 'testing';
  meta.testMsg.value = '';
  try {
    const info = await meta.testFn(meta.getCredentialArg());
    meta.infoRef.value = info;
    if (p === 'github' && info?.canPush === false) {
      meta.testResult.value = 'error';
      meta.testMsg.value = `已读取仓库 ${info.repoFullName}，但 Token 缺乏写入权限（需 Contents: Read and write）。`;
      return;
    }
    meta.testResult.value = 'success';
    meta.testMsg.value = p === 'github'
      ? `仓库 ${info.repoFullName} (${info.branch}${info.isEmptyRepo ? ' · 空仓库' : ''}) 连接成功。`
      : meta.testSuccessMsg;
    soundEngine.playChime();
  } catch (err) {
    meta.testResult.value = 'error';
    meta.testMsg.value = '连接失败: ' + (err.message || '请检查配置与网络');
  }
}

function handleClearCloudProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta) return;
  const activeMap = { tidb: isTidbActive.value, neon: isNeonActive.value, github: isGithubActive.value };
  if (activeMap[p]) handleDeactivateProvider(p);

  isLoadingCloudConfigs = true;
  try {
    if (p === 'github') {
      meta.configRef.value.token = '';
      meta.configRef.value.owner = '';
      meta.configRef.value.repo = '';
      meta.configRef.value.branch = '';
      meta.configRef.value.basePath = '';
    } else {
      meta.configRef.value.connectionString = '';
    }
    meta.configRef.value.enabled = false;
    meta.saveConfig({ ...meta.configRef.value });
  } finally {
    isLoadingCloudConfigs = false;
  }
  meta.testResult.value = '';
  meta.testMsg.value = '';
  meta.infoRef.value = null;
  isCloudSyncActive.value = isCloudSyncEnabled();
}

function applySyncedPayload(res) {
  saveDocuments(res.docs || []);
  saveGroups(res.groups || []);
  if (res.histories && res.histories.length > 0) {
    saveAllDocSnapshots(res.histories);
  }
  if (res.customThemes && res.customThemes.length > 0) {
    mergeCustomThemes(res.customThemes);
  }
  emit('sync-complete', {
    docs: res.docs || [],
    groups: res.groups || [],
    histories: res.histories || [],
    customThemes: res.customThemes || [],
  });
}

async function handlePushCloudProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta || !meta.hasCredentials()) {
    if (meta) {
      meta.syncResult.value = 'error';
      meta.syncMsg.value = meta.missingCredMsg;
    }
    return;
  }

  const ok = await showConfirm({
    title: `全量备份到 ${meta.targetLabel}`,
    message: `确认将本地全部文档、分组、历史版本和自定义主题完整备份至 ${meta.label} 吗？云端已有记录将被更新。`,
    confirmText: '开始备份',
  });
  if (!ok) return;

  meta.syncResult.value = 'syncing';
  meta.syncMsg.value = `正在上传数据至 ${meta.targetLabel}...`;
  try {
    const localDocs = loadDocuments();
    const localGroups = loadGroups();
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();
    const res = await meta.pushFn(
      meta.getCredentialArg(),
      localDocs,
      localGroups,
      localHistories,
      localThemes
    );
    meta.syncResult.value = 'success';
    meta.syncMsg.value = `备份完成！成功上传 ${res.pushedDocs} 篇文档，${res.pushedGroups} 个分组，${res.pushedHistories} 个历史版本，${res.pushedThemes} 个自定义主题。`;
    soundEngine.playChime();
    emit('sync-complete', {
      docs: localDocs,
      groups: localGroups,
      histories: localHistories,
      customThemes: localThemes,
    });
  } catch (err) {
    meta.syncResult.value = 'error';
    meta.syncMsg.value = '备份失败: ' + (err.message || '网络连接超时');
  }
}

async function handlePullCloudProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta || !meta.hasCredentials()) {
    if (meta) {
      meta.syncResult.value = 'error';
      meta.syncMsg.value = meta.missingCredMsg;
    }
    return;
  }

  const ok = await showConfirm({
    title: `从 ${meta.targetLabel} 还原数据`,
    message: `⚠️ 此操作将从 ${meta.label} 拉取所有云端文档、分组、历史版本及自定义主题并更新本地，确定继续吗？`,
    confirmText: '立即拉取',
    danger: true,
  });
  if (!ok) return;

  meta.syncResult.value = 'syncing';
  meta.syncMsg.value = `正在从 ${meta.targetLabel} 下载最新数据...`;
  try {
    const res = await meta.pullFn(meta.getCredentialArg());
    applySyncedPayload(res);
    meta.syncResult.value = 'success';
    meta.syncMsg.value = `还原成功！共恢复 ${res.docs.length} 篇文档，${res.groups.length} 个分组，${res.histories.length} 个历史版本，${res.customThemes.length} 个自定义主题。`;
    soundEngine.playChime();
  } catch (err) {
    meta.syncResult.value = 'error';
    meta.syncMsg.value = '拉取失败: ' + (err.message || '网络连接超时');
  }
}

async function handleTwoWaySyncProvider(p) {
  const meta = CLOUD_PROVIDER_UI[p];
  if (!meta || !meta.hasCredentials()) {
    if (meta) {
      meta.syncResult.value = 'error';
      meta.syncMsg.value = meta.missingCredMsg;
    }
    return;
  }

  meta.syncResult.value = 'syncing';
  meta.syncMsg.value = `正在执行 ${meta.label} 双向增量同步...`;
  try {
    const localDocs = loadDocuments();
    const localGroups = loadGroups();
    const localHistories = getAllDocSnapshots();
    const localThemes = loadCustomThemes();
    const res = await meta.syncFn(
      meta.getCredentialArg(),
      localDocs,
      localGroups,
      localHistories,
      localThemes
    );
    applySyncedPayload(res);
    meta.syncResult.value = 'success';
    meta.syncMsg.value = `同步成功！合并后文档: ${res.docs.length} 篇，分组: ${res.groups.length} 个，历史版本: ${res.histories.length} 个，自定义主题: ${res.customThemes.length} 个。`;
    soundEngine.playChime();
  } catch (err) {
    meta.syncResult.value = 'error';
    meta.syncMsg.value = '同步失败: ' + (err.message || '网络错误');
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
const initialEditorPrefs = loadEditorPreferences();
const soundMuted = ref(soundEngine.getMuteState());
const syncScroll = ref(loadSyncScrollPreference());
const editorFontFamily = ref(initialEditorPrefs.fontFamilyKey);
const editorFontSize = ref(initialEditorPrefs.fontSize);
const editorFontSizeInput = ref(String(initialEditorPrefs.fontSizeNumber));
const lineNumbers = ref(localStorage.getItem('nicemd_line_numbers') !== 'false');

const emitSettingsUpdated = () => {
  window.dispatchEvent(new CustomEvent(EDITOR_SETTINGS_UPDATED_EVENT));
};

const handleFontSizeInput = (event) => {
  const raw = event?.target?.value ?? editorFontSizeInput.value;
  editorFontSizeInput.value = raw;
  const parsed = parseFloat(String(raw).trim());
  if (Number.isFinite(parsed) && parsed >= MIN_EDITOR_FONT_SIZE && parsed <= MAX_EDITOR_FONT_SIZE) {
    editorFontSize.value = normalizeEditorFontSize(parsed);
  }
};

const commitFontSizeInput = (event) => {
  const rawText = String(editorFontSizeInput.value ?? '').trim();
  const parsed = parseFloat(rawText);
  if (!rawText || !Number.isFinite(parsed)) {
    editorFontSizeInput.value = formatEditorFontSizeNumber(editorFontSize.value);
  } else {
    const normalized = normalizeEditorFontSize(parsed);
    editorFontSize.value = normalized;
    editorFontSizeInput.value = formatEditorFontSizeNumber(normalized);
  }
  if (event?.target && event.target.value !== editorFontSizeInput.value) {
    event.target.value = editorFontSizeInput.value;
  }
};

watch(soundMuted, (val) => {
  if (val !== soundEngine.getMuteState()) {
    soundEngine.toggleMute();
  }
  localStorage.setItem('nicemd_sound_muted', val.toString());
  emitSettingsUpdated();
});

watch(syncScroll, (val) => {
  localStorage.setItem(EDITOR_SYNC_SCROLL_STORAGE_KEY, val.toString());
  emitSettingsUpdated();
});

watch(editorFontFamily, (val) => {
  ensureEditorFontLoaded(val);
  localStorage.setItem(EDITOR_FONT_FAMILY_STORAGE_KEY, val);
  emitSettingsUpdated();
});

watch(editorFontSize, (val) => {
  localStorage.setItem(EDITOR_FONT_SIZE_STORAGE_KEY, val);
  emitSettingsUpdated();
});

watch(lineNumbers, (val) => {
  localStorage.setItem('nicemd_line_numbers', val.toString());
  emitSettingsUpdated();
});

const activeTab = ref('general');

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialTab) {
      activeTab.value = props.initialTab;
    }
    loadConfigFromExtension();
    loadStorageConfig();
    isLoadingCloudConfigs = true;
    try {
      loadTidbConfig();
      loadNeonConfig();
      loadGithubConfig();
    } finally {
      isLoadingCloudConfigs = false;
    }
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
    githubTestResult.value = '';
    githubTestMsg.value = '';
    githubSyncResult.value = '';
    githubSyncMsg.value = '';
    storageTestResult.value = '';
    storageTestMsg.value = '';
    soundMuted.value = soundEngine.getMuteState();
    syncScroll.value = loadSyncScrollPreference();
    const editorPrefs = loadEditorPreferences();
    editorFontFamily.value = editorPrefs.fontFamilyKey;
    editorFontSize.value = editorPrefs.fontSize;
    editorFontSizeInput.value = String(editorPrefs.fontSizeNumber);
    lineNumbers.value = localStorage.getItem('nicemd_line_numbers') !== 'false';
  } else {
    commitFontSizeInput();
  }
});

const selectPlatform = (id) => {
  soundEngine.playClick();
  activeTab.value = id;
};

const openPlatformManagement = () => {
  const currentIsPlatform = platforms.value.some(platform => platform.id === activeTab.value);
  selectPlatform(currentIsPlatform ? activeTab.value : (platforms.value[0]?.id || 'wechat'));
};

const handleSave = () => {
  soundEngine.playClick();
  commitFontSizeInput();
  saveStatus.value = 'saving';
  
  if (storageConfig.value) {
    saveStorageConfig({ ...storageConfig.value });
  }
  if (tidbConfig.value) saveTidbConfig({ ...tidbConfig.value });
  if (neonConfig.value) saveNeonConfig({ ...neonConfig.value });
  if (githubConfig.value) saveGithubConfig({ ...githubConfig.value });

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
      editorFontFamily.value = DEFAULT_EDITOR_FONT_FAMILY_KEY;
      editorFontSize.value = DEFAULT_EDITOR_FONT_SIZE;
      editorFontSizeInput.value = String(DEFAULT_EDITOR_FONT_SIZE_NUM);
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
          <h2>配置中心</h2>
        </div>
        <button @click="emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body settings-body-container">
        <!-- Main settings navigation -->
        <div class="settings-sidebar">
          <div class="sidebar-title">系统设置</div>
          <div class="platform-list">
            <!-- General Settings Tab -->
            <button
              class="platform-tab-btn general-tab-btn"
              :class="{ 'is-active': activeTab === 'general' }"
              @click="selectPlatform('general')"
            >
              <Sliders size="14" class="general-indicator-icon" />
              <span class="tab-label">通用设置</span>
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

            <!-- 云端同步 Tab (TiDB & Neon & GitHub) -->
            <button
              class="platform-tab-btn cloud-tab-btn"
              :class="{ 'is-active': activeTab === 'cloud' || activeTab === 'neon' }"
              @click="selectPlatform('cloud')"
            >
              <Cloud size="14" class="cloud-indicator-icon" />
              <span class="tab-label">云端同步</span>
              <span v-if="isCloudSyncEnabled()" class="cloud-active-dot" title="云端同步已开启"></span>
            </button>

            <div class="sidebar-divider"></div>
            <div class="sidebar-title platform-management-title">发布平台</div>
            <button
              class="platform-tab-btn platform-management-btn"
              :class="{ 'is-active': !!activePlatform }"
              @click="openPlatformManagement"
            >
              <Globe size="14" />
              <span class="tab-label">平台管理</span>
            </button>

          </div>
        </div>

        <!-- Main Form Panel -->
        <!-- General Settings View -->
        <div class="settings-main-form general-settings-form" v-if="activeTab === 'general'">
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

            <!-- Editor Font Family -->
            <div class="form-group">
              <label for="general-editor-font-family">编辑区字体</label>
              <div class="input-with-icon">
                <Type class="input-icon" size="14" />
                <select id="general-editor-font-family" v-model="editorFontFamily" class="format-select">
                  <option
                    v-for="opt in EDITOR_FONT_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <small class="help-text">选择编辑器正文显示的字体风格，修改后即时生效。</small>
            </div>

            <!-- Font Size -->
            <div class="form-group">
              <label for="general-editor-font-size">编辑器字体大小</label>
              <div class="input-with-icon input-with-unit">
                <Sliders class="input-icon" size="14" />
                <input
                  id="general-editor-font-size"
                  type="number"
                  :value="editorFontSizeInput"
                  :min="MIN_EDITOR_FONT_SIZE"
                  :max="MAX_EDITOR_FONT_SIZE"
                  step="0.5"
                  :placeholder="String(DEFAULT_EDITOR_FONT_SIZE_NUM)"
                  @input="handleFontSizeInput"
                  @blur="commitFontSizeInput"
                  @keydown.enter="commitFontSizeInput"
                />
                <span class="input-unit-suffix">px</span>
              </div>
              <small class="help-text">支持 {{ MIN_EDITOR_FONT_SIZE }} - {{ MAX_EDITOR_FONT_SIZE }} px，可自由输入小数字号（默认 {{ DEFAULT_EDITOR_FONT_SIZE_NUM }}，如 14.5）。</small>
            </div>

            <!-- Line Numbers Toggle -->
            <div class="form-group span-2">
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
          <!-- 全局自动上传控制 -->
          <div class="storage-global-banner">
            <div class="storage-global-info">
              <div class="storage-global-title-row">
                <span class="storage-global-title">剪贴板图片自动上传</span>
                <span class="storage-global-badge" :class="autoUploadEnabled ? 'is-active' : ''">
                  {{ autoUploadStatusLabel }}
                </span>
              </div>
              <div class="storage-global-desc">
                {{ canAutoUpload
                  ? (autoUploadEnabled ? '全局设置：在编辑器粘贴图片时自动上传并插入 Markdown 图片链接' : '全局设置：关闭后，粘贴的图片不会自动上传')
                  : '全局开关，与下方存储平台无关。填写完整配置后即可开启' }}
              </div>
            </div>
            <label class="modern-switch" :class="{ 'is-disabled': !canAutoUpload }" :title="canAutoUpload ? '切换剪贴板自动上传' : '请先完成图床配置'">
              <input type="checkbox" :checked="autoUploadEnabled" :disabled="!canAutoUpload" @change="handleToggleAutoUpload" />
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
                :class="{ 'is-selected': provider.id === storageConfig.platform }"
                :aria-current="provider.id === storageConfig.platform ? 'page' : undefined"
                @click="setStorageProvider(provider.id)"
              >
                <span class="storage-provider-copy">
                  <strong>{{ provider.name }}</strong>
                  <small>{{ provider.subtitle }}</small>
                </span>
                <Check v-if="provider.id === storageConfig.platform" size="14" class="storage-provider-check" />
              </button>
            </nav>

            <section class="storage-config-panel">
              <p class="storage-required-note">{{ activeProviderNote }}</p>
              <div class="storage-fields">
                <div class="form-group" v-for="field in activeStorageFields" :key="`${storageConfig.platform}-${field.key}`">
                  <label>
                    {{ field.label }}
                    <span v-if="field.required" class="storage-required">必填</span>
                    <span v-else class="storage-optional">可选</span>
                  </label>
                  <div v-if="field.type === 'select'" class="input-with-icon">
                    <select v-model="activeStorageProviderConfig[field.key]">
                      <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                  </div>
                  <div v-else class="input-with-icon" :class="{ 'storage-secret-wrap': field.type === 'secret' }">
                    <input
                      :type="field.type === 'secret' ? (showSecretKey ? 'text' : 'password') : (field.type === 'url' ? 'url' : 'text')"
                      v-model="activeStorageProviderConfig[field.key]"
                      :placeholder="field.placeholder || ''"
                      :autocomplete="field.type === 'secret' ? 'new-password' : 'off'"
                    />
                    <button v-if="field.type === 'secret'" type="button" class="secret-toggle-btn" @click="showSecretKey = !showSecretKey" :aria-label="showSecretKey ? '隐藏密钥' : '显示密钥'">
                      <Eye v-if="!showSecretKey" size="14" /><EyeOff v-else size="14" />
                    </button>
                  </div>
                  <small v-if="field.help" class="help-text">{{ field.help }}</small>
                </div>
              </div>

              <div class="storage-actions">
                <button @click="handleTestConnection" class="btn-test-connection" :class="storageTestResult" :disabled="storageTestResult === 'testing' || !canAutoUpload">
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

        <!-- Cloud Sync View (TiDB & Neon & GitHub) -->
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

              <button 
                type="button"
                class="cloud-nav-tab"
                :class="{ 'is-active': cloudProvider === 'github' }"
                @click="setCloudProvider('github')"
              >
                <div class="tab-icon-wrap github-color">
                  <GitBranch size="15" />
                </div>
                <div class="tab-text-wrap">
                  <span class="tab-name">GitHub</span>
                  <span class="tab-sub">代码仓库</span>
                </div>
              </button>
            </div>
          </div>

          <div class="cloud-body-section">
            <!-- 2. Shared Sync Toggle & Auto-Sync Card -->
            <div class="cloud-switch-card">
              <div class="cloud-sync-state-row">
                <div class="switch-card-info">
                  <div class="switch-title">
                    云端同步
                    <span class="sync-state-label" :class="{ 'is-active': currentCloudPanel.active }">
                      {{ currentCloudPanel.active ? '已启用' : (currentCloudPanel.hasCred ? '未启用' : '待配置') }}
                    </span>
                  </div>
                  <div class="switch-desc">
                    {{ currentCloudPanel.active ? currentCloudPanel.activeDesc : currentCloudPanel.inactiveDesc }}
                  </div>
                </div>
                <button
                  type="button"
                  class="sync-state-button"
                  :class="{ 'is-active': currentCloudPanel.active }"
                  :disabled="!currentCloudPanel.active && !currentCloudPanel.hasCred"
                  @click="handleToggleCurrentProvider(cloudProvider)"
                >
                  {{ currentCloudPanel.active ? '停用' : (currentCloudPanel.hasCred ? '启用同步' : '待配置') }}
                </button>
              </div>
              <div class="sync-settings-divider"></div>
              <div class="cloud-sync-auto-row">
                <div class="switch-card-info">
                  <div class="switch-title">编辑后自动同步</div>
                  <div class="switch-desc">{{ currentCloudPanel.autoDesc }}</div>
                </div>
                <label class="modern-switch">
                  <input type="checkbox" v-model="currentCloudPanel.config.autoSync" :disabled="!currentCloudPanel.active" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <!-- 3A. TiDB Cloud Connection Card -->
            <div v-if="cloudProvider === 'tidb'" class="cloud-config-card">
              <div class="config-card-header">
                <div class="header-title-wrap">
                  <Database size="14" class="text-accent" />
                  <span class="config-title">数据库连接</span>
                </div>
                <div class="connection-header-actions">
                  <button
                    @click="handleTestCloudProvider('tidb')"
                    class="btn-cloud-test connection-test-btn"
                    :class="tidbTestResult"
                    :disabled="tidbTestResult === 'testing' || !tidbConfig.connectionString.trim()"
                  >
                    <RefreshCw v-if="tidbTestResult === 'testing'" size="13" class="animate-spin" />
                    <Wifi v-else size="13" />
                    <span>{{ tidbTestResult === 'testing' ? '测试中' : tidbTestResult === 'success' ? '已连接' : tidbTestResult === 'error' ? '重试' : '测试连接' }}</span>
                  </button>
                  <button v-if="tidbConfig.connectionString" type="button" class="connection-clear-btn" @click="handleClearCloudProvider('tidb')">
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

            <!-- 3B. Neon Postgres Connection Card -->
            <div v-else-if="cloudProvider === 'neon'" class="cloud-config-card">
              <div class="config-card-header">
                <div class="header-title-wrap">
                  <Database size="14" class="text-accent" />
                  <span class="config-title">数据库连接</span>
                </div>
                <div class="connection-header-actions">
                  <button
                    @click="handleTestCloudProvider('neon')"
                    class="btn-cloud-test connection-test-btn"
                    :class="neonTestResult"
                    :disabled="neonTestResult === 'testing' || !neonConfig.connectionString.trim()"
                  >
                    <RefreshCw v-if="neonTestResult === 'testing'" size="13" class="animate-spin" />
                    <Wifi v-else size="13" />
                    <span>{{ neonTestResult === 'testing' ? '测试中' : neonTestResult === 'success' ? '已连接' : neonTestResult === 'error' ? '重试' : '测试连接' }}</span>
                  </button>
                  <button v-if="neonConfig.connectionString" type="button" class="connection-clear-btn" @click="handleClearCloudProvider('neon')">
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

            <!-- 3C. GitHub Repository Connection Card -->
            <div v-else class="cloud-config-card">
              <div class="config-card-header">
                <div class="header-title-wrap">
                  <GitBranch size="14" class="text-accent" />
                  <span class="config-title">GitHub 仓库连接</span>
                </div>
                <div class="connection-header-actions">
                  <button
                    v-if="hasReusableImageGithub && !hasGithubConfigReady"
                    type="button"
                    class="btn-quick-fill"
                    @click="handleReuseImageGithubConfig"
                    title="填入图床设置中的 GitHub Token 与仓库信息"
                  >
                    <span>复用图床配置</span>
                  </button>
                  <button
                    @click="handleTestCloudProvider('github')"
                    class="btn-cloud-test connection-test-btn"
                    :class="githubTestResult"
                    :disabled="githubTestResult === 'testing' || !hasGithubConfigReady"
                  >
                    <RefreshCw v-if="githubTestResult === 'testing'" size="13" class="animate-spin" />
                    <Wifi v-else size="13" />
                    <span>{{ githubTestResult === 'testing' ? '测试中' : githubTestResult === 'success' ? '已连接' : githubTestResult === 'error' ? '重试' : '测试连接' }}</span>
                  </button>
                  <button
                    v-if="githubConfig.token || githubConfig.owner || githubConfig.repo"
                    type="button"
                    class="connection-clear-btn"
                    @click="handleClearCloudProvider('github')"
                  >
                    清空
                  </button>
                </div>
              </div>

              <div class="github-config-fields">
                <div class="github-field-item">
                  <label class="github-field-label">GitHub Token (PAT)</label>
                  <div class="modern-input-group">
                    <input
                      type="text"
                      v-model="githubConfig.token"
                      placeholder="填写具备仓库 Contents 读写权限的 Token (github_pat_... 或 ghp_...)"
                      class="modern-code-input"
                      spellcheck="false"
                      autocomplete="off"
                    />
                  </div>
                </div>

                <div class="github-fields-grid">
                  <div class="github-field-item">
                    <label class="github-field-label">仓库拥有者 (Owner)</label>
                    <div class="modern-input-group">
                      <input
                        type="text"
                        v-model="githubConfig.owner"
                        placeholder="用户名或组织名，如 octocat"
                        class="modern-code-input"
                        spellcheck="false"
                        autocomplete="off"
                      />
                    </div>
                  </div>
                  <div class="github-field-item">
                    <label class="github-field-label">仓库名称 (Repo)</label>
                    <div class="modern-input-group">
                      <input
                        type="text"
                        v-model="githubConfig.repo"
                        placeholder="如 my-markdown-notes"
                        class="modern-code-input"
                        spellcheck="false"
                        autocomplete="off"
                      />
                    </div>
                  </div>
                </div>

                <div class="github-fields-grid">
                  <div class="github-field-item">
                    <label class="github-field-label">分支名称 <span class="storage-optional">可选</span></label>
                    <div class="modern-input-group">
                      <input
                        type="text"
                        v-model="githubConfig.branch"
                        placeholder="留空自动使用仓库默认分支"
                        class="modern-code-input"
                        spellcheck="false"
                        autocomplete="off"
                      />
                    </div>
                  </div>
                  <div class="github-field-item">
                    <label class="github-field-label">同步目录 <span class="storage-optional">可选</span></label>
                    <div class="modern-input-group">
                      <input
                        type="text"
                        v-model="githubConfig.basePath"
                        placeholder="例如 notes（留空存放在根目录）"
                        class="modern-code-input"
                        spellcheck="false"
                        autocomplete="off"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="config-helper-row">
                <span class="helper-syntax">凭证仅保存在当前设备；文档按分组目录以可读 .md 文件直接提交到仓库。</span>
              </div>
              <div v-if="githubTestMsg" class="connection-test-result" :class="githubTestResult">
                <span>{{ githubTestMsg }}</span>
                <div v-if="githubRepoInfo" class="metrics-chips">
                  <span class="metric-chip">{{ githubRepoInfo.docCount }} 篇文档</span>
                  <span class="metric-chip">{{ githubRepoInfo.groupCount }} 个分组</span>
                  <span class="metric-chip">{{ githubRepoInfo.historyCount }} 个历史版本</span>
                  <span class="metric-chip">{{ githubRepoInfo.themeCount }} 个主题</span>
                  <span class="metric-chip">{{ githubRepoInfo.isPrivate ? '私有仓库' : '公开仓库' }}</span>
                </div>
              </div>
            </div>

            <!-- 4. Shared Cloud Data Operations Section -->
            <details class="cloud-ops-box" :open="cloudProvider === 'github'">
              <summary class="ops-header">
                <Cloud size="15" class="text-primary" />
                <span class="ops-title">{{ cloudProvider === 'github' ? '仓库推送与拉取操作' : '更多数据操作' }}</span>
                <ChevronDown size="15" class="ops-chevron" />
              </summary>

              <div class="ops-cards-grid">
                <div class="ops-card card-sync">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-blue">
                      <RefreshCw size="16" />
                    </div>
                    <div class="ops-card-title">双向同步</div>
                  </div>
                  <p class="ops-card-desc">合并本地和云端的最新内容。</p>
                  <button
                    @click="handleTwoWaySyncProvider(cloudProvider)"
                    class="ops-action-btn btn-blue"
                    :disabled="currentCloudPanel.syncResult === 'syncing' || !currentCloudPanel.hasCred"
                  >
                    <RefreshCw size="13" :class="{ 'animate-spin': currentCloudPanel.syncResult === 'syncing' }" />
                    <span>立即同步</span>
                  </button>
                </div>

                <div class="ops-card card-push">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-green">
                      <FolderUp size="16" />
                    </div>
                    <div class="ops-card-title">{{ cloudProvider === 'github' ? '推送到仓库' : '备份到云端' }}</div>
                  </div>
                  <p class="ops-card-desc">{{ currentCloudPanel.pushDesc }}</p>
                  <button
                    @click="handlePushCloudProvider(cloudProvider)"
                    class="ops-action-btn btn-green"
                    :disabled="currentCloudPanel.syncResult === 'syncing' || !currentCloudPanel.hasCred"
                  >
                    <FolderUp size="13" />
                    <span>{{ cloudProvider === 'github' ? '立即推送' : '开始备份' }}</span>
                  </button>
                </div>

                <div class="ops-card card-pull">
                  <div class="ops-card-top">
                    <div class="ops-icon-wrap icon-purple">
                      <FolderDown size="16" />
                    </div>
                    <div class="ops-card-title">{{ cloudProvider === 'github' ? '从仓库拉取' : '从云端恢复' }}</div>
                  </div>
                  <p class="ops-card-desc">{{ currentCloudPanel.pullDesc }}</p>
                  <button
                    @click="handlePullCloudProvider(cloudProvider)"
                    class="ops-action-btn btn-purple"
                    :disabled="currentCloudPanel.syncResult === 'syncing' || !currentCloudPanel.hasCred"
                  >
                    <FolderDown size="13" />
                    <span>{{ cloudProvider === 'github' ? '拉取还原' : '恢复数据' }}</span>
                  </button>
                </div>
              </div>

              <div v-if="currentCloudPanel.syncMsg" class="cloud-result-banner mt-3" :class="currentCloudPanel.syncResult">
                {{ currentCloudPanel.syncMsg }}
              </div>
            </details>
          </div>
        </div>

        <!-- Platform Config View -->
        <div class="settings-main-form publishing-settings-main" v-else-if="activePlatform">
          <div class="publishing-settings-layout">
            <div class="publishing-platform-nav" aria-label="发布平台列表">
              <div class="publishing-platform-heading">平台列表</div>
            <button
              v-for="plat in platforms"
              :key="plat.id"
              class="publishing-platform-tab"
              :class="{ 'is-active': activeTab === plat.id }"
              @click="selectPlatform(plat.id)"
            >
              <span class="color-indicator" :style="{ backgroundColor: plat.color }"></span>
              <span class="tab-label">{{ plat.name }}</span>
            </button>
            <button @click="addCustomPlatform" class="btn-add-platform">
              <Plus size="14" />
              <span>自建平台通道</span>
            </button>
          </div>
          <div class="publishing-config-form">
          <div v-if="activePlatform.id.startsWith('custom_')" class="publishing-config-actions">
            <button 
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
            <span v-else-if="saveStatus === 'success'">{{ activeTab === 'storage' ? '图床配置已保存 ✨' : (activeTab === 'cloud' || activeTab === 'neon') ? '云端配置已保存 ✨' : (isExtensionConnected ? '配置已同步到插件 ✨' : '配置已保存 ✨') }}</span>
            <span v-else-if="saveStatus === 'error'">保存失败</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<style scoped src="./SettingsModal.css"></style>
