<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { 
  X, 
  Play, 
  CheckCircle,
  CheckCircle2,
  ExternalLink, 
  Copy,
  ChevronRight,
  Clock,
  RotateCw,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Send,
  ShieldCheck,
  FileText,
  Layers,
  Maximize2
} from '@lucide/vue';
import { soundEngine } from '../utils/synthAudio';
import { compileToWeChatHtml } from '../utils/wechatStyles';
import confetti from 'canvas-confetti';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  articleTitle: {
    type: String,
    default: ''
  },
  markdown: {
    type: String,
    default: ''
  },
  html: {
    type: String,
    default: ''
  },
  themeId: {
    type: String,
    default: 'classic-indigo'
  },
  codeThemeId: {
    type: String,
    default: 'mdnice-classic'
  }
});

const emit = defineEmits(['close']);

// ── State ──
const isLaunching = ref(false);
const isFinished = ref(false);
const isCheckingLogins = ref(false);
const isExtensionInstalled = ref(false);
const showManagementMenu = ref(false);

// Publishing settings state
const isScheduled = ref(false);
const scheduledTime = ref('');
const isOriginalDeclaration = ref(true);
const customCoverUrl = ref('');
const fileInputRef = ref(null);

// Preset beautiful sunset lake cover (from reference design)
const defaultCoverUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

// Auto-extract first image from markdown or fallback
const coverImage = computed(() => {
  if (customCoverUrl.value) return customCoverUrl.value;
  const match = props.markdown.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
  if (match && match[1]) return match[1];
  return defaultCoverUrl;
});

// Format scheduled time helper
const initScheduledTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 2);
  now.setMinutes(0);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  scheduledTime.value = `${year}-${month}-${date} ${hours}:${minutes}`;
};

const resetScheduledTime = () => {
  soundEngine.playClick();
  initScheduledTime();
};

const handleCoverUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    customCoverUrl.value = event.target.result;
    soundEngine.playChime();
  };
  reader.readAsDataURL(file);
};

const triggerCoverUpload = () => {
  soundEngine.playClick();
  fileInputRef.value?.click();
};

// ── Platforms ──
const platforms = ref([
  {
    id: 'wechat',
    name: '微信公众号',
    iconUrl: './svg/微信.svg',
    color: '#07c160',
    writeUrl: 'https://mp.weixin.qq.com/',
    status: 'idle',
    progress: 0,
    actionLabel: '前往公众号后台',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'zhihu',
    name: '知乎',
    iconUrl: './svg/知乎.svg',
    color: '#0084ff',
    writeUrl: 'https://zhuanlan.zhihu.com/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'juejin',
    name: '掘金',
    iconUrl: './svg/juejin.svg',
    color: '#1e80ff',
    writeUrl: 'https://juejin.cn/editor/drafts/new',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往写文章',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'csdn',
    name: 'CSDN',
    iconUrl: './svg/csdn.svg',
    color: '#fc5531',
    writeUrl: 'https://editor.csdn.net/md/',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'baijiahao',
    name: '百家号',
    iconUrl: './svg/百家号.svg',
    color: '#ea4335',
    writeUrl: 'https://baijiahao.baidu.com/builder/rc/write/article',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    iconUrl: './svg/哔哩哔哩.svg',
    color: '#fb7299',
    writeUrl: 'https://member.bilibili.com/platform/upload/text',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'cnblogs',
    name: '博客园',
    iconUrl: './svg/博客园.svg',
    color: '#3272ad',
    writeUrl: 'https://i.cnblogs.com/posts/edit',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'weibo',
    name: '微博头条',
    iconUrl: './svg/微博.svg',
    color: '#e6162d',
    writeUrl: 'https://card.weibo.com/article/v5/editor',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'yuque',
    name: '语雀',
    iconUrl: './svg/语雀.svg',
    color: '#00b96b',
    writeUrl: 'https://www.yuque.com/dashboard',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: true,
    username: '',
    avatar: ''
  },
  {
    id: 'jianshu',
    name: '简书',
    iconUrl: './svg/简书.svg',
    color: '#ea6f5a',
    writeUrl: 'https://www.jianshu.com/writer',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'segmentfault',
    name: '思否',
    iconUrl: './svg/思否.svg',
    color: '#00965e',
    writeUrl: 'https://segmentfault.com/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'oschina',
    name: '开源中国',
    iconUrl: './svg/开源中国.svg',
    color: '#21b354',
    writeUrl: 'https://my.oschina.net/u/new-blog',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'toutiao',
    name: '今日头条',
    iconUrl: './svg/今日头条.svg',
    color: '#f85959',
    writeUrl: 'https://mp.toutiao.com/profile_v4/graphic/publish',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'douban',
    name: '豆瓣网',
    iconUrl: './svg/豆瓣网.svg',
    color: '#007722',
    writeUrl: 'https://www.douban.com/note/create',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'imooc',
    name: '慕课网',
    iconUrl: './svg/慕课网.svg',
    color: '#f01414',
    writeUrl: 'https://www.imooc.com/article/publish',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'netease',
    name: '网易号',
    iconUrl: './svg/网易号.svg',
    color: '#e12d2d',
    writeUrl: 'https://mp.163.com/',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: '51cto',
    name: '51CTO',
    iconUrl: './svg/51.svg',
    color: '#d0021b',
    writeUrl: 'https://blog.51cto.com/',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    iconUrl: './svg/推特.svg',
    color: '#000000',
    writeUrl: 'https://x.com/compose/post',
    status: 'idle',
    progress: 0,
    actionLabel: '前往 X 发布',
    format: 'md',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'sohu',
    name: '搜狐号',
    iconUrl: '',
    color: '#e11d48',
    writeUrl: 'https://mp.sohu.com/mpbp/bp/article/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'xueqiu',
    name: '雪球',
    iconUrl: '',
    color: '#3b82f6',
    writeUrl: 'https://mp.xueqiu.com/writeV2',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'eastmoney',
    name: '东方财富',
    iconUrl: '',
    color: '#f59e0b',
    writeUrl: 'https://mp.eastmoney.com/NewWrite/Article',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'woshipm',
    name: '人人都是产品经理',
    iconUrl: '',
    color: '#ea580c',
    writeUrl: 'https://www.woshipm.com/writing',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'not_logged_in',
    selected: false,
    enabled: false,
    username: '',
    avatar: ''
  },
  {
    id: 'zip-download',
    name: 'Markdown 离线包',
    iconUrl: './svg/md.svg',
    color: '#6366f1',
    writeUrl: '',
    status: 'idle',
    progress: 0,
    actionLabel: '点击下载文件',
    format: 'md',
    loginStatus: 'logged_in',
    selected: false,
    enabled: true,
    username: '本地下载',
    avatar: ''
  }
]);

// ── Visible Filtered Platforms ──
const visiblePlatforms = computed(() => {
  return platforms.value.filter(p => p.enabled !== false);
});

const loggedInCount = computed(() => {
  return visiblePlatforms.value.filter(p => p.loginStatus === 'logged_in' || p.id === 'zip-download').length;
});

// ── Platform Display Management ──
const showPlatformManageModal = ref(false);
const SAVED_ENABLED_KEY = 'nicemd_enabled_platforms_v2';

const togglePlatformEnabled = (plat) => {
  soundEngine.playClick();
  plat.enabled = !plat.enabled;
  saveEnabledPlatforms();
};

const toggleAllPlatforms = (enableAll) => {
  soundEngine.playClick();
  platforms.value.forEach(p => {
    p.enabled = enableAll;
  });
  saveEnabledPlatforms();
};

const resetDefaultPlatforms = () => {
  soundEngine.playClick();
  const defaultEnabledIds = ['wechat', 'zhihu', 'juejin', 'csdn', 'baijiahao', 'bilibili', 'cnblogs', 'weibo', 'yuque', 'zip-download'];
  platforms.value.forEach(p => {
    p.enabled = defaultEnabledIds.includes(p.id);
  });
  saveEnabledPlatforms();
};

const loadSavedEnabledPlatforms = () => {
  try {
    const raw = localStorage.getItem(SAVED_ENABLED_KEY);
    if (raw) {
      const enabledMap = JSON.parse(raw);
      platforms.value.forEach(p => {
        if (enabledMap[p.id] !== undefined) {
          p.enabled = enabledMap[p.id];
        }
      });
    } else {
      resetDefaultPlatforms();
    }
  } catch (e) {
    console.error('Failed to load saved platforms', e);
  }
};

const saveEnabledPlatforms = () => {
  try {
    const enabledMap = {};
    platforms.value.forEach(p => {
      enabledMap[p.id] = p.enabled !== false;
    });
    localStorage.setItem(SAVED_ENABLED_KEY, JSON.stringify(enabledMap));
  } catch (e) {
    console.error('Failed to save platforms', e);
  }
};

// ── Open Drafts Automatically After Sync ──
const SAVED_OPEN_DRAFTS_KEY = 'nicemd_open_drafts_after_sync';
const isOpenDraftsAfterSync = ref(false);

const loadOpenDraftsPref = () => {
  try {
    const saved = localStorage.getItem(SAVED_OPEN_DRAFTS_KEY);
    if (saved !== null) {
      isOpenDraftsAfterSync.value = JSON.parse(saved);
    }
  } catch (e) {}
};

watch(isOpenDraftsAfterSync, (val) => {
  try {
    localStorage.setItem(SAVED_OPEN_DRAFTS_KEY, JSON.stringify(val));
  } catch (e) {}
});

const resetPlatformSyncStatuses = () => {
  platforms.value.forEach(p => {
    p.status = 'idle';
    p.progress = 0;
    p.syncMessage = '';
  });
  isFinished.value = false;
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetPlatformSyncStatuses();
    checkAllLogins();
  }
});

const checkAllLogins = () => {
  resetPlatformSyncStatuses();
  if (!isExtensionInstalled.value) {
    return;
  }
  
  isCheckingLogins.value = true;
  platforms.value.forEach(p => {
    if (p.id !== 'zip-download') {
      p.loginStatus = 'checking';
    }
  });
  
  const payloadPlatforms = platforms.value
    .filter(p => p.id !== 'zip-download')
    .map(p => ({ id: p.id, writeUrl: p.writeUrl }));
  window.postMessage({ type: 'NICEMD_CHECK_LOGINS', platforms: payloadPlatforms }, '*');
};

const openLoginTab = (platform) => {
  if (!platform.writeUrl) return;
  soundEngine.playClick();
  if (isExtensionInstalled.value) {
    window.postMessage({ type: 'NICEMD_OPEN_TAB', url: platform.writeUrl }, '*');
  } else {
    window.open(platform.writeUrl, '_blank');
  }
};

const getPublishTitle = () => {
  if (props.articleTitle && props.articleTitle.trim()) {
    return props.articleTitle.trim();
  }
  const titleMatch = props.markdown.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : '未命名文章';
};

const downloadMarkdownFile = (markdownText) => {
  const fileName = getPublishTitle() + '.md';
  const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const toggleSelect = (plat) => {
  soundEngine.playClick();
  if (plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download') {
    openLoginTab(plat);
    return;
  }
  plat.selected = !plat.selected;
};

const selectedCount = computed(() => {
  return visiblePlatforms.value.filter(p => p.selected).length;
});

const selectAll = (val) => {
  soundEngine.playClick();
  visiblePlatforms.value.forEach(p => {
    if (val) {
      if (p.id === 'zip-download' || p.loginStatus === 'logged_in') {
        p.selected = true;
      }
    } else {
      p.selected = false;
    }
  });
};

const isAllSelected = computed(() => {
  const selectable = visiblePlatforms.value.filter(p => p.id === 'zip-download' || p.loginStatus === 'logged_in');
  return selectable.length > 0 && selectable.every(p => p.selected);
});

const toggleSelectAll = () => {
  selectAll(!isAllSelected.value);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const publishPlatform = (plat, title, targetHtml) => {
  return new Promise((resolve) => {
    const handler = (event) => {
      if (event.source !== window) return;
      if (event.data && event.data.type === 'NICEMD_PUBLISH_RESPONSE' && event.data.platform === plat.id) {
        window.removeEventListener('message', handler);
        resolve(event.data);
      }
    };
    window.addEventListener('message', handler);
    window.postMessage({
      type: 'NICEMD_PUBLISH',
      payload: {
        platform: plat.id,
        title,
        markdown: props.markdown,
        html: targetHtml,
        scheduled: isScheduled.value ? scheduledTime.value : null,
        isOriginal: isOriginalDeclaration.value,
        cover: coverImage.value
      }
    }, '*');
  });
};

const countArticleImages = (markdown, html) => {
  const mdMatches = (markdown || '').match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g) || [];
  const htmlMatches = (html || '').match(/<img[^>]+src="([^"]+)"/gi) || [];
  const uniqueImages = new Set();
  mdMatches.forEach(m => {
    const srcMatch = m.match(/\((https?:\/\/[^\s\)]+)\)/);
    if (srcMatch && !srcMatch[1].startsWith('data:')) uniqueImages.add(srcMatch[1]);
  });
  htmlMatches.forEach(m => {
    const srcMatch = m.match(/src="([^"]+)"/i);
    if (srcMatch && !srcMatch[1].startsWith('data:')) uniqueImages.add(srcMatch[1]);
  });
  return uniqueImages.size;
};

const handleLaunch = async () => {
  if (isLaunching.value) return;
  
  const selectedList = visiblePlatforms.value.filter(p => p.selected && (p.id === 'zip-download' || p.loginStatus === 'logged_in'));
  if (selectedList.length === 0) return;

  soundEngine.playClick();
  isLaunching.value = true;
  isFinished.value = false;
  
  const imgCount = countArticleImages(props.markdown, props.html);

  selectedList.forEach(p => {
    p.status = 'idle';
    p.progress = 0;
    p.syncMessage = '';
    p.draftUrl = '';
  });

  const title = getPublishTitle();

  const publishPromises = selectedList.map(async (plat) => {
    plat.status = 'ignition';
    plat.progress = 15;
    plat.syncMessage = '准备同步...';
    await sleep(200 + Math.random() * 150);

    if (plat.id === 'zip-download') {
      plat.syncMessage = '正在导出...';
      downloadMarkdownFile(props.markdown);
      plat.status = 'success';
      plat.progress = 100;
      plat.syncMessage = '导出成功';
      return;
    }

    if (!isExtensionInstalled.value) {
      await copyPlatformContent(plat);
      plat.status = 'success';
      plat.progress = 100;
      plat.syncMessage = '已复制内容';
      return;
    }

    const targetHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId);

    // Dynamic Image Conversion Steps if images exist
    if (imgCount > 0) {
      for (let i = 1; i <= imgCount; i++) {
        plat.status = 'launched';
        plat.progress = 15 + Math.round((i / imgCount) * 50);
        plat.syncMessage = `图片转换 (${i}/${imgCount})`;
        await sleep(180 + Math.random() * 120);
      }
    } else {
      plat.status = 'launched';
      plat.progress = 55;
      plat.syncMessage = '正在分发...';
      await sleep(180);
    }

    plat.progress = 75;
    plat.syncMessage = '保存草稿中...';

    try {
      const response = await publishPlatform(plat, title, targetHtml);
      if (response.success) {
        plat.status = 'success';
        plat.progress = 100;
        plat.syncMessage = '同步成功 100%';
        if (response.postUrl) {
          plat.draftUrl = response.postUrl;
          if (isOpenDraftsAfterSync.value) {
            window.open(response.postUrl, '_blank');
          }
        }
      } else {
        plat.status = 'failed';
        plat.progress = 0;
        plat.syncMessage = response.error || '通道错误';
        plat.errorMsg = response.error || '通道错误';
      }
    } catch (err) {
      plat.status = 'failed';
      plat.progress = 0;
      plat.syncMessage = err.message || '发布失败';
      plat.errorMsg = err.message;
    }
  });

  await Promise.all(publishPromises);

  // Write fully styled HTML & Markdown to clipboard for instant pasting anywhere
  try {
    const finalHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId);
    const htmlBlob = new Blob([finalHtml], { type: 'text/html' });
    const textBlob = new Blob([props.markdown], { type: 'text/plain' });
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    });
    await navigator.clipboard.write([item]);
  } catch (err) {
    // ignore
  }

  isFinished.value = true;
  isLaunching.value = false;
  soundEngine.playChime();
  
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { x: 0.8, y: 0.6 }
  });
};

const copyPlatformContent = async (platform) => {
  try {
    if (platform.id === 'zip-download') {
      downloadMarkdownFile(props.markdown);
      return;
    }

    if (platform.draftUrl) {
      soundEngine.playClick();
      window.open(platform.draftUrl, '_blank');
      return;
    }
    
    if (platform.format === 'html') {
      const finalHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId);
      const htmlBlob = new Blob([finalHtml], { type: 'text/html' });
      const textBlob = new Blob([props.markdown], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([item]);
      window.open(platform.writeUrl, '_blank');
    } else {
      if (isExtensionInstalled.value) {
        const title = getPublishTitle();
        window.postMessage({
          type: 'NICEMD_PUBLISH',
          payload: {
            platform: platform.id,
            title,
            markdown: props.markdown,
            html: props.html
          }
        }, '*');
      } else {
        await navigator.clipboard.writeText(props.markdown);
        window.open(platform.writeUrl, '_blank');
      }
    }
  } catch (e) {
    console.error(e);
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    initScheduledTime();
    window.postMessage({ type: 'NICEMD_GET_CONFIG' }, '*');
    if (isExtensionInstalled.value) {
      checkAllLogins();
    }
  }
});

onMounted(() => {
  initScheduledTime();
  loadSavedEnabledPlatforms();
  loadOpenDraftsPref();
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'NICEMD_PONG') {
      isExtensionInstalled.value = true;
      checkAllLogins();
    }

    if (event.data && event.data.type === 'NICEMD_GET_CONFIG_RESPONSE') {
      if (event.data.success && event.data.config) {
        checkAllLogins();
      }
    }

    if (event.data && event.data.type === 'NICEMD_CHECK_LOGINS_RESPONSE') {
      isCheckingLogins.value = false;
      if (event.data.success && event.data.statuses) {
        platforms.value.forEach(p => {
          if (p.id === 'zip-download') return;
          
          const info = event.data.statuses[p.id];
          if (info !== undefined) {
            if (typeof info === 'object') {
              p.loginStatus = info.loggedIn ? 'logged_in' : 'not_logged_in';
              p.username = info.username || (info.loggedIn ? '已登录' : '');
              p.avatar = info.avatar || '';
            } else {
              p.loginStatus = info ? 'logged_in' : 'not_logged_in';
              p.username = info ? '已登录' : '';
              p.avatar = '';
            }
          }
          
          if (p.loginStatus === 'logged_in') {
            p.selected = true; // 默认自动勾选已登录平台，点亮发布按钮
          } else {
            p.selected = false;
          }
        });
      }
    }
  });

  setTimeout(() => {
    window.postMessage({ type: 'NICEMD_PING' }, '*');
  }, 300);
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <aside class="right-drawer-panel">
      <!-- Background Ambient Sparkle Spheres -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>

      <!-- Drawer Header Bar (Paper Airplane + Titles + Close Button) -->
      <div class="drawer-top-bar">
        <div class="brand-header-left">
          <div class="brand-icon-badge">
            <Send size="18" class="plane-icon" />
          </div>
          <div class="brand-title-wrap">
            <h2 class="brand-title-cn">多渠道内容分发</h2>
            <p class="brand-subtitle-cn">一键发布到多个平台</p>
          </div>
        </div>
        <button @click="emit('close')" class="btn-drawer-close" title="关闭面板">
          <X size="16" />
        </button>
      </div>

      <!-- Drawer Scrollable Content -->
      <div class="drawer-content-scroll">
        <!-- Section 1: 发布平台 -->
        <section class="drawer-section">
          <div class="drawer-section-header">
            <div class="section-title-left">
              <h3 class="drawer-section-title">发布平台</h3>
              <div class="login-count-tag">
                <span class="count-pill">{{ loggedInCount }}/{{ visiblePlatforms.length }}</span>
                <span class="count-label">已登录</span>
              </div>
            </div>
            
            <!-- Direct Actions Toolbar -->
            <div class="header-actions-group">
              <button 
                class="btn-action-tool btn-batch-manage" 
                @click="showPlatformManageModal = true"
                title="批量管理要在控制台展示的平台"
              >
                <Layers size="13" />
                <span>批量管理</span>
              </button>
              
              <button 
                class="btn-action-dark btn-refresh-status" 
                @click="checkAllLogins" 
                :disabled="isCheckingLogins" 
                title="刷新各平台登录状态"
              >
                <RotateCw size="12" :class="{ 'spin-anim': isCheckingLogins }" />
                <span>刷新状态</span>
              </button>
            </div>
          </div>

          <!-- Platforms Card Container -->
          <div class="platforms-card-box">
            <div 
              v-for="plat in visiblePlatforms" 
              :key="plat.id"
              class="platform-row-item"
              :class="[
                { 'is-selected': plat.selected },
                { 'is-not-connected': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download' }
              ]"
              @click="toggleSelect(plat)"
            >
              <!-- Left: Brand Icon with Online Green Dot Indicator -->
              <div class="platform-icon-wrapper" :style="{ backgroundColor: plat.iconUrl ? 'transparent' : plat.color }">
                <img 
                  v-if="plat.iconUrl" 
                  :src="plat.iconUrl" 
                  :alt="plat.name" 
                  class="platform-icon-img" 
                />
                <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <!-- Online Green Dot on Icon Corner -->
                <span v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" class="icon-online-dot"></span>
              </div>

              <!-- Center: Name & Sub -->
              <div class="platform-meta">
                <span class="platform-name">{{ plat.name }}</span>
                <span class="platform-sub">
                  {{ plat.username || (plat.loginStatus === 'logged_in' ? '已登录' : (plat.loginStatus === 'checking' ? '检测状态中...' : '未登录')) }}
                </span>
              </div>

              <!-- Middle: Dynamic Channel & Image Conversion Progress (Only when active/syncing) -->
              <div class="platform-sync-center" v-if="plat.status && plat.status !== 'idle'">
                <div class="sync-stage-pill" :class="`is-stage-${plat.status}`">
                  <div v-if="plat.status === 'ignition' || plat.status === 'launched'" class="sync-spinner-ring"></div>
                  <CheckCircle2 v-else-if="plat.status === 'success'" size="13" class="sync-check-icon" />
                  <span v-else-if="plat.status === 'failed'" class="sync-fail-icon">✕</span>
                  <span class="sync-stage-label" :title="plat.syncMessage">{{ plat.syncMessage || (plat.status === 'success' ? '同步成功 100%' : '正在同步...') }}</span>
                </div>
              </div>

              <!-- Right: Status Badge & Chevron Arrow -->
              <div class="platform-action-wrap">
                <!-- Logged in state: Clean '已登录' Pill -->
                <span 
                  v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" 
                  class="badge-logged-in-clean"
                >
                  已登录
                </span>

                <!-- Not logged in state: '登录' Button -->
                <button 
                  v-else-if="plat.loginStatus !== 'checking'" 
                  class="btn-action-login"
                  @click.stop="openLoginTab(plat)"
                  title="点击打开平台并登录"
                >
                  <span>登录</span>
                </button>

                <span v-else class="badge-checking">检测中</span>

                <ChevronRight size="16" class="row-chevron-arrow" />
              </div>
            </div>
          </div>
        </section>

        <!-- Section 2: 发布设置 -->
        <section class="drawer-section">
          <div class="drawer-section-header">
            <h3 class="drawer-section-title">发布设置</h3>
          </div>

          <!-- Settings Box -->
          <div class="settings-card-box">
            <!-- Row 1: 定时发布 -->
            <div class="setting-item-block">
              <div class="setting-item-main">
                <div class="setting-icon-badge is-clock">
                  <Clock size="16" />
                </div>
                <div class="setting-text-meta">
                  <span class="setting-title">定时发布</span>
                  <span class="setting-desc">可设置未来时间自动发布</span>
                </div>
                <label class="ios-switch">
                  <input type="checkbox" v-model="isScheduled" />
                  <span class="slider"></span>
                </label>
              </div>

              <!-- Expandable Time Picker Row -->
              <div v-if="isScheduled" class="datetime-picker-row">
                <div class="datetime-input-wrap">
                  <Clock size="13" class="time-icon" />
                  <input 
                    type="text" 
                    v-model="scheduledTime" 
                    class="time-input" 
                    placeholder="2024-07-21 18:00"
                  />
                </div>
                <button class="btn-time-refresh" @click="resetScheduledTime" title="重设为当前后2小时">
                  <RotateCw size="13" />
                </button>
              </div>
            </div>

            <div class="settings-divider"></div>

            <!-- Row 2: 原创声明 -->
            <div class="setting-item-block">
              <div class="setting-item-main">
                <div class="setting-icon-badge is-shield">
                  <ShieldCheck size="16" />
                </div>
                <div class="setting-text-meta">
                  <span class="setting-title">原创声明</span>
                  <span class="setting-desc">声明此内容为原创文章</span>
                </div>
                <label class="ios-switch">
                  <input type="checkbox" v-model="isOriginalDeclaration" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div class="settings-divider"></div>

            <!-- Row 3: 文章封面 -->
            <div class="setting-item-block is-cover-block">
              <div class="setting-item-main">
                <div class="setting-icon-badge is-file">
                  <FileText size="16" />
                </div>
                <div class="setting-text-meta">
                  <span class="setting-title">文章封面</span>
                  <span class="setting-desc">为你的文章选择一个吸引人的封面</span>
                </div>
                <button class="btn-link-change-cover" @click="triggerCoverUpload">
                  <span>更换封面</span>
                  <ChevronRight size="13" />
                </button>
              </div>

              <!-- Hidden File Input for Custom Cover Upload -->
              <input 
                type="file" 
                ref="fileInputRef" 
                accept="image/*" 
                class="hidden-file-input" 
                @change="handleCoverUpload"
              />

              <!-- Cover Image Preview Frame -->
              <div class="cover-preview-box" @click="triggerCoverUpload">
                <img :src="coverImage" alt="Article Cover" class="cover-img" />
                <div class="cover-expand-btn" title="查看或更换封面">
                  <Maximize2 size="13" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Drawer Footer Launch Action Button -->
      <div class="drawer-footer">
        <button 
          class="btn-gradient-launch"
          :disabled="isLaunching || selectedCount === 0"
          :class="{ 'is-launching': isLaunching }"
          @click="handleLaunch"
        >
          <span v-if="isLaunching" class="spinner-dot"></span>
          <span class="launch-btn-text">
            {{ isFinished ? '重新发布' : isLaunching ? '正在执行分发...' : '重新发布' }}
          </span>
          <span class="launch-arrow">→</span>
        </button>

        <!-- Option: 发布后打开草稿 (Orange Round Ring Radio) -->
        <div 
          class="open-drafts-option" 
          @click="isOpenDraftsAfterSync = !isOpenDraftsAfterSync"
          title="勾选后，发布成功的平台将自动在浏览器中打开草稿页面"
        >
          <div class="orange-ring-radio" :class="{ 'is-checked': isOpenDraftsAfterSync }">
            <div class="ring-inner" v-if="isOpenDraftsAfterSync"></div>
          </div>
          <span class="open-drafts-label">发布后打开草稿</span>
        </div>
      </div>
    </aside>

    <!-- Platform Management Modal (点击管理弹出的平台配置浮层) -->
    <div 
      v-if="showPlatformManageModal" 
      class="manage-modal-backdrop" 
      @click.self="showPlatformManageModal = false"
    >
      <div class="manage-modal-card">
        <div class="manage-modal-header">
          <div class="manage-header-titles">
            <h3 class="manage-modal-title">⚙️ 发布平台展示管理</h3>
            <p class="manage-modal-subtitle">勾选需要在控制台展示的平台，未勾选的平台将自动隐藏</p>
          </div>
          <button class="manage-modal-close" @click="showPlatformManageModal = false" title="关闭">
            <X size="18" />
          </button>
        </div>

        <div class="manage-modal-body">
          <div class="manage-platforms-grid">
            <div 
              v-for="plat in platforms" 
              :key="plat.id"
              class="manage-platform-item"
              :class="{ 'is-enabled': plat.enabled !== false }"
              @click="togglePlatformEnabled(plat)"
            >
              <div class="manage-item-checkbox">
                <input 
                  type="checkbox" 
                  :checked="plat.enabled !== false" 
                  @click.stop="togglePlatformEnabled(plat)" 
                />
              </div>
              <div class="manage-item-icon">
                <img v-if="plat.iconUrl" :src="plat.iconUrl" :alt="plat.name" />
                <span v-else class="fallback-icon-letter">{{ plat.name.charAt(0) }}</span>
              </div>
              <div class="manage-item-info">
                <span class="manage-item-name">{{ plat.name }}</span>
                <span class="manage-item-tag">{{ plat.format === 'html' ? '富文本' : 'Markdown' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="manage-modal-footer">
          <div class="manage-footer-left">
            <button class="btn-manage-action" @click="toggleAllPlatforms(true)">全选显示</button>
            <button class="btn-manage-action" @click="toggleAllPlatforms(false)">取消全选</button>
            <button class="btn-manage-action" @click="resetDefaultPlatforms">恢复默认</button>
          </div>
          <div class="manage-footer-right">
            <button class="btn-manage-done" @click="showPlatformManageModal = false">
              完成 (已开启 {{ visiblePlatforms.length }} 个)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: flex-end;
  z-index: 2000;
  animation: fadeInOverlay 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Right Side Drawer Panel */
/* Right Side Drawer Panel */
.right-drawer-panel {
  width: min(28.75rem, 95vw);
  max-width: 95vw;
  height: 100vh;
  max-height: 100vh;
  background: #f8faff;
  box-shadow: -0.9375rem 0 3.125rem rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: slideDrawer 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

@keyframes slideDrawer {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Ambient glow blobs */
.ambient-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(3.125rem);
  opacity: 0.65;
  z-index: 0;
}

.glow-1 {
  width: 15rem;
  height: 15rem;
  top: -2.5rem;
  right: -1.875rem;
  background: radial-gradient(circle, rgba(254, 215, 226, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
}

.glow-2 {
  width: 17.5rem;
  height: 17.5rem;
  bottom: 10%;
  right: -1.25rem;
  background: radial-gradient(circle, rgba(238, 242, 255, 0.85) 0%, rgba(255, 255, 255, 0) 70%);
}

/* Top bar (Paper Airplane Badge + Titles + Close Button) */
.drawer-top-bar {
  padding: 1.25rem 1.375rem 0.875rem 1.375rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.brand-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon-badge {
  width: 2.375rem;
  height: 2.375rem;
  border-radius: 0.75rem;
  background: #fff1eb;
  color: #ff5e36;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.125rem 0.5rem rgba(255, 94, 54, 0.15);
}

.plane-icon {
  transform: rotate(-10deg) translate(0.0625rem, -0.0625rem);
}

.brand-title-wrap {
  display: flex;
  flex-direction: column;
}

.brand-title-cn {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.0125rem;
  line-height: 1.2;
  margin: 0;
}

.brand-subtitle-cn {
  font-size: 0.71875rem;
  color: #94a3b8;
  margin: 0.1875rem 0 0 0;
  font-weight: 400;
}

.btn-drawer-close {
  background: #ffffff;
  border: 0.0625rem solid #f1f5f9;
  color: #64748b;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.btn-drawer-close:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: scale(1.06);
}

/* Scrollable Content */
.drawer-content-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.375rem 1.125rem 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  position: relative;
  z-index: 1;
}

.drawer-content-scroll::-webkit-scrollbar {
  width: 0.25rem;
}

.drawer-content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-content-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

/* Sections */
.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.drawer-section-header {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  padding: 0 0.125rem !important;
  box-sizing: border-box !important;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drawer-section-title {
  font-size: 0.9375rem !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, sans-serif !important;
  letter-spacing: -0.0125rem !important;
  margin: 0 !important;
  text-align: left !important;
}

.login-count-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.count-pill {
  background: #edfdf2;
  color: #16a34a;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.09375rem 0.375rem;
  border-radius: 0.25rem;
}

.count-label {
  color: #94a3b8;
  font-size: 0.71875rem;
}

/* Header Actions Toolbar */
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-action-tool.btn-batch-manage {
  background: #f8fafc;
  border: 0.0625rem solid #f1f5f9;
  font-size: 0.71875rem;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.3125rem 0.6875rem;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.btn-action-tool.btn-batch-manage:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-action-dark.btn-refresh-status {
  background: #1e293b;
  border: none;
  font-size: 0.71875rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.3125rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0.125rem 0.375rem rgba(30, 41, 59, 0.25);
  user-select: none;
}

.btn-action-dark.btn-refresh-status:hover:not(:disabled) {
  background: #0f172a;
  transform: translateY(-0.0625rem);
}

.btn-action-dark.btn-refresh-status:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Platforms Card Box */
.platforms-card-box {
  background: #ffffff;
  border-radius: 0.875rem;
  padding: 0.375rem 0.875rem;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.03);
  border: 0.0625rem solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.platform-row-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0.375rem;
  gap: 0.75rem;
  border-bottom: 0.0625rem solid #f8fafc;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 0.625rem;
}

.platform-row-item:last-child {
  border-bottom: none;
}

.platform-row-item:hover {
  background: rgba(241, 245, 249, 0.55);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Icon with Corner Online Indicator */
.platform-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.06);
}

.platform-icon-img {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  object-fit: contain;
  display: block;
}

.icon-online-dot {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: 50%;
  background: #22c55e;
  border: 0.125rem solid #ffffff;
  box-shadow: 0 0.0625rem 0.25rem rgba(34, 197, 94, 0.4);
  z-index: 2;
}

/* Meta */
.platform-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.platform-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.0125rem;
}

.platform-sub {
  font-size: 0.78125rem;
  color: #8da0b6;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dynamic Sync Center */
.platform-sync-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
}

.sync-stage-pill {
  background: #eefbf3;
  border: 0.0625rem solid #dcfce7;
  color: #16a34a;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  padding: 0.25rem 0.6875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  white-space: nowrap;
  box-shadow: 0 0.0625rem 0.25rem rgba(22, 163, 74, 0.06);
}

.sync-stage-pill.is-stage-failed {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
  box-shadow: none;
}

.sync-spinner-ring {
  width: 0.625rem;
  height: 0.625rem;
  border: 0.09375rem solid #bbf7d0;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

.sync-check-icon {
  color: #16a34a;
  flex-shrink: 0;
}

.sync-fail-icon {
  font-size: 0.6875rem;
  font-weight: 800;
  color: #dc2626;
}

/* Action wrap & Badges */
.platform-action-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.badge-logged-in-clean {
  background: #f0fdf4;
  border: 0.0625rem solid #dcfce7;
  color: #16a34a;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  white-space: nowrap;
  user-select: none;
}

.btn-action-login {
  background: #fff7ed;
  border: 0.0625rem solid #ffedd5;
  color: #ea580c;
  font-size: 0.71875rem;
  font-weight: 600;
  padding: 0.21875rem 0.625rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-action-login:hover {
  background: #ffedd5;
  transform: translateY(-0.0625rem);
}

.badge-checking {
  background: #eff6ff;
  border: 0.0625rem solid #dbeafe;
  color: #2563eb;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.row-chevron-arrow {
  color: #94a3b8;
  margin-left: 0.1875rem;
  transition: transform 0.2s ease;
}

/* Settings Card Box */
.settings-card-box {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.03);
  border: 0.0625rem solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.setting-item-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-icon-badge {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-icon-badge.is-clock {
  background: #fef7ee;
  color: #f59e0b;
}

.setting-icon-badge.is-shield {
  background: #eff6ff;
  color: #3b82f6;
}

.setting-icon-badge.is-file {
  background: #f1f5f9;
  color: #64748b;
}

.setting-text-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.setting-title {
  font-size: 0.84375rem;
  font-weight: 600;
  color: #1e293b;
}

.setting-desc {
  font-size: 0.6875rem;
  color: #94a3b8;
}

.btn-link-change-cover {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.125rem;
  cursor: pointer;
}

.btn-link-change-cover:hover {
  color: #1e293b;
}

.settings-divider {
  height: 0.0625rem;
  background: #f8fafc;
  margin: 0 -0.25rem;
}

/* iOS Style Switch */
.ios-switch {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 1.375rem;
}

.ios-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: .3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 1.375rem;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1.125rem;
  width: 1.125rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background-color: white;
  transition: .3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 50%;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.15);
}

input:checked + .slider {
  background-color: #ff5e36;
}

input:checked + .slider:before {
  transform: translateX(1.125rem);
}

/* DateTime input row */
.datetime-picker-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #f8fafc;
  border-radius: 0.625rem;
  padding: 0.375rem 0.625rem;
  border: 0.0625rem solid #f1f5f9;
  animation: fadeInDown 0.2s ease;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-0.25rem); }
  to { opacity: 1; transform: translateY(0); }
}

.datetime-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex: 1;
}

.time-icon {
  color: #94a3b8;
}

.time-input {
  border: none;
  background: transparent;
  font-size: 0.71875rem;
  font-weight: 600;
  color: #334155;
  width: 100%;
  font-family: 'Outfit', -apple-system, sans-serif;
  outline: none;
}

.btn-time-refresh {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-time-refresh:hover {
  color: #ff6036;
  transform: rotate(45deg);
}

/* Cover Image Frame with bottom-right expand icon */
.hidden-file-input {
  display: none;
}

.cover-preview-box {
  width: 100%;
  height: 6.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 0.0625rem solid #f1f5f9;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.04);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-preview-box:hover .cover-img {
  transform: scale(1.03);
}

.cover-expand-btn {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(0.25rem);
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s ease;
}

.cover-preview-box:hover .cover-expand-btn {
  background: #ffffff;
  color: #0f172a;
}

/* Drawer Footer */
.drawer-footer {
  padding: 1rem 1.25rem 1.5rem 1.25rem;
  background: transparent;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.btn-gradient-launch {
  width: 100%;
  height: 2.875rem;
  border-radius: 1rem;
  border: none;
  background: linear-gradient(135deg, #ff5e36 0%, #ff784e 100%);
  box-shadow: 0 0.5rem 1.5rem rgba(255, 94, 54, 0.32);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.launch-btn-text {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.0125rem;
}

.launch-arrow {
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.btn-gradient-launch:hover:not(:disabled) {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.75rem 1.75rem rgba(255, 94, 54, 0.42);
}

.btn-gradient-launch:hover:not(:disabled) .launch-arrow {
  transform: translateX(0.1875rem);
}

.btn-gradient-launch:active:not(:disabled) {
  transform: translateY(0.0625rem);
}

.btn-gradient-launch:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.8;
}

.spinner-dot {
  width: 0.875rem;
  height: 0.875rem;
  border: 0.125rem solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Open Drafts Option Under Launch Button */
.open-drafts-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4375rem;
  margin-top: 0.75rem;
  cursor: pointer;
  user-select: none;
  padding: 0.1875rem 0.375rem;
  border-radius: 0.375rem;
  transition: all 0.18s ease;
}

.open-drafts-option:hover .open-drafts-label {
  color: #1e293b;
}

.orange-ring-radio {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  border: 0.09375rem solid #ff5e36;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.orange-ring-radio.is-checked .ring-inner {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: #ff5e36;
}

.open-drafts-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: -0.00625rem;
  transition: color 0.18s ease;
}

/* Platform Management Modal (Backdrop & Card) */
.manage-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
  animation: fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInModal {
  from { opacity: 0; }
  to { opacity: 1; }
}

.manage-modal-card {
  width: 520px;
  max-width: 95vw;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popInCard 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popInCard {
  from { opacity: 0; transform: scale(0.94) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.manage-modal-header {
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fafbfc;
}

.manage-header-titles {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.manage-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, sans-serif;
}

.manage-modal-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.manage-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.manage-modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.manage-modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(85vh - 140px);
}

.manage-platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.manage-platform-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.manage-platform-item:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.manage-platform-item.is-enabled {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.manage-item-checkbox {
  display: flex;
  align-items: center;
}

.manage-item-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
  border-radius: 4px;
}

.manage-item-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.manage-item-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fallback-icon-letter {
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
}

.manage-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.manage-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manage-item-tag {
  font-size: 10px;
  color: #94a3b8;
}

.manage-modal-footer {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  gap: 12px;
}

.manage-footer-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-manage-action {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-manage-action:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-manage-done {
  background: #2563eb;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 18px;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);
  transition: all 0.2s ease;
}

.btn-manage-done:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.38);
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .right-drawer-panel {
    width: 100vw !important;
    max-width: 100vw !important;
  }
}
</style>
