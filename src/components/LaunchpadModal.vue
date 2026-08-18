<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { 
  X, 
  Play, 
  CheckCircle, 
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
  SlidersHorizontal
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

const checkAllLogins = () => {
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

const handleLaunch = async () => {
  if (isLaunching.value) return;
  
  const selectedList = visiblePlatforms.value.filter(p => p.selected && (p.id === 'zip-download' || p.loginStatus === 'logged_in'));
  if (selectedList.length === 0) return;

  soundEngine.playClick();
  isLaunching.value = true;
  isFinished.value = false;
  
  selectedList.forEach(p => {
    p.status = 'idle';
    p.progress = 0;
    p.draftUrl = '';
  });

  const title = getPublishTitle();

  const publishPromises = selectedList.map(async (plat) => {
    plat.status = 'ignition';
    plat.progress = 25;
    await sleep(250 + Math.random() * 200);

    if (plat.id === 'zip-download') {
      downloadMarkdownFile(props.markdown);
      plat.status = 'success';
      plat.progress = 100;
      return;
    }

    if (!isExtensionInstalled.value) {
      await copyPlatformContent(plat);
      plat.status = 'success';
      plat.progress = 100;
      return;
    }

    const targetHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId);

    plat.status = 'launched';
    plat.progress = 65;

    try {
      const response = await publishPlatform(plat, title, targetHtml);
      if (response.success) {
        plat.status = 'success';
        plat.progress = 100;
        if (response.postUrl) {
          plat.draftUrl = response.postUrl;
          if (isOpenDraftsAfterSync.value) {
            window.open(response.postUrl, '_blank');
          }
        }
      } else {
        plat.status = 'failed';
        plat.progress = 0;
        plat.errorMsg = response.error || '通道错误';
      }
    } catch (err) {
      plat.status = 'failed';
      plat.progress = 0;
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
              p.username = info.username || (info.loggedIn ? '已连接' : '');
              p.avatar = info.avatar || '';
            } else {
              p.loginStatus = info ? 'logged_in' : 'not_logged_in';
              p.username = info ? '已连接' : '';
              p.avatar = '';
            }
          }
          
          if (p.loginStatus !== 'logged_in') {
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

      <!-- Drawer Header Bar -->
      <div class="drawer-top-bar">
        <div class="sparkle-title">
          <span class="sparkle-icon">✨</span>
          <span class="brand-title-cn">多渠道内容分发</span>
        </div>
        <button @click="emit('close')" class="btn-drawer-close" title="关闭面板">
          <X size="18" />
        </button>
      </div>

      <!-- Drawer Scrollable Content -->
      <div class="drawer-content-scroll">
        <!-- Section 1: 发布平台 -->
        <section class="drawer-section">
          <div class="drawer-section-header">
            <h3 class="drawer-section-title">发布平台</h3>
            
            <!-- Direct Actions Toolbar -->
            <div class="header-actions-group">
              <!-- Smart Toggle Select All / Deselect All Button -->
              <button 
                class="btn-action-tool btn-toggle-select" 
                :class="{ 'is-active': isAllSelected }"
                @click="toggleSelectAll" 
                :title="isAllSelected ? '取消全选所有平台' : '全选所有已连接平台'"
              >
                <X v-if="isAllSelected" size="12" />
                <Check v-else size="12" />
                <span>{{ isAllSelected ? '取消全选' : '全选' }}</span>
              </button>
              
              <button 
                class="btn-action-tool" 
                @click="checkAllLogins" 
                :disabled="isCheckingLogins" 
                title="刷新各平台登录状态"
              >
                <RefreshCw size="12" :class="{ 'spin-anim': isCheckingLogins }" />
                <span>刷新</span>
              </button>

              <button 
                class="btn-manage-trigger" 
                @click="showPlatformManageModal = true"
                title="选择/管理要在控制台展示的平台"
              >
                <SlidersHorizontal size="12" />
                <span>管理</span>
              </button>
            </div>
          </div>

          <!-- Platforms Card Container (Only Visible Platforms) -->
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
              <!-- Left: Brand Icon (使用用户下载的 public/svg 中的真实图标) -->
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
              </div>

              <!-- Center: Name & Status info -->
              <div class="platform-meta">
                <span class="platform-name">{{ plat.name }}</span>
                <span class="platform-sub">
                  <span v-if="plat.loginStatus === 'logged_in'" class="sub-status is-connected">
                    {{ plat.username || '已连接' }}
                  </span>
                  <span v-else-if="plat.loginStatus === 'checking'" class="sub-status is-checking">
                    检测状态中...
                  </span>
                  <span v-else class="sub-status is-disconnected">
                    未连接
                  </span>
                </span>
              </div>

              <!-- Right: Status Badge / Action Button -->
              <div class="platform-action-wrap">
                <!-- Logged in state: Soft Green '已连接' Pill -->
                <div 
                  v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" 
                  class="pill-tag is-connected-pill"
                  :class="{ 'is-active-selection': plat.selected }"
                >
                  <span class="pill-text">已连接</span>
                  <div class="pill-check-circle" :class="{ 'is-checked': plat.selected }">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3.5">
                      <polyline points="20 6 9 17 4 12" v-if="plat.selected"></polyline>
                    </svg>
                  </div>
                </div>

                <!-- Not logged in state: Soft Peach '连接' Action Button -->
                <button 
                  v-else 
                  class="pill-btn-connect"
                  @click.stop="openLoginTab(plat)"
                  title="点击打开平台并连接登录"
                >
                  <span>连接</span>
                </button>
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
            <div class="setting-item-row">
              <span class="setting-label">定时发布</span>
              <label class="ios-switch">
                <input type="checkbox" v-model="isScheduled" />
                <span class="slider"></span>
              </label>
            </div>

            <!-- Expandable Time Picker Row -->
            <div v-if="isScheduled" class="datetime-picker-row">
              <div class="datetime-input-wrap">
                <Clock size="14" class="time-icon" />
                <input 
                  type="text" 
                  v-model="scheduledTime" 
                  class="time-input" 
                  placeholder="2024-07-21 18:00"
                />
              </div>
              <button class="btn-time-refresh" @click="resetScheduledTime" title="重设为当前后2小时">
                <RotateCw size="14" />
              </button>
            </div>

            <!-- Row 2: 原创声明 -->
            <div class="setting-item-row">
              <span class="setting-label">原创声明</span>
              <label class="ios-switch">
                <input type="checkbox" v-model="isOriginalDeclaration" />
                <span class="slider"></span>
              </label>
            </div>

            <!-- Row 3: 文章封面 -->
            <div class="cover-setting-wrap">
              <div class="cover-header">
                <span class="setting-label">文章封面</span>
                <button class="btn-change-cover" @click="triggerCoverUpload">
                  <ImageIcon size="12" />
                  <span>更换封面</span>
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
                <div class="cover-overlay-hint">
                  <Upload size="18" />
                  <span>点击上传自定义封面</span>
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
            {{ isFinished ? '重新发布' : isLaunching ? '正在执行分发...' : `一键发布 (${selectedCount})` }}
          </span>
          <span class="launch-arrow">→</span>
        </button>

        <!-- Option: 是否同步打开草稿 (Sleek Round Dot Radio Option) -->
        <div 
          class="open-drafts-option" 
          @click="isOpenDraftsAfterSync = !isOpenDraftsAfterSync"
          title="勾选后，发布成功的平台将自动在浏览器中打开草稿页面"
        >
          <div class="dot-radio-wrapper" :class="{ 'is-checked': isOpenDraftsAfterSync }">
            <div class="dot-inner"></div>
          </div>
          <span class="open-drafts-label">是否同步打开草稿</span>
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
.right-drawer-panel {
  width: 380px;
  max-width: 92vw;
  height: 100vh;
  background: #f8faff;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.12);
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
  filter: blur(50px);
  opacity: 0.65;
  z-index: 0;
}

.glow-1 {
  width: 220px;
  height: 220px;
  top: -40px;
  right: -30px;
  background: radial-gradient(circle, rgba(254, 215, 226, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
}

.glow-2 {
  width: 260px;
  height: 260px;
  top: 36%;
  left: 20%;
  background: radial-gradient(circle, rgba(255, 237, 213, 0.6) 0%, rgba(255, 255, 255, 0) 70%);
}

/* Top bar */
.drawer-top-bar {
  padding: 18px 20px 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.sparkle-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sparkle-icon {
  font-size: 16px;
}

.brand-title-cn {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0.3px;
}

.btn-drawer-close {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
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
  overflow-y: auto;
  padding: 8px 18px 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.drawer-content-scroll::-webkit-scrollbar {
  width: 5px;
}

.drawer-content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-content-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 4px;
}

/* Sections */
.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-section-header {
  display: flex !important;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  padding: 0 4px !important;
  box-sizing: border-box !important;
}

.drawer-section-title {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, sans-serif !important;
  letter-spacing: -0.2px !important;
  margin: 0 !important;
  text-align: left !important;
}

/* Header Actions Toolbar */
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-action-tool {
  background: #f1f5f9;
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3.5px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 7px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.btn-action-tool:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
  border-color: rgba(0, 0, 0, 0.08);
}

.btn-action-tool.btn-toggle-select.is-active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.btn-action-tool.btn-toggle-select.is-active:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-action-tool:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-manage-trigger {
  background: rgba(37, 99, 235, 0.08);
  border: 1px solid rgba(37, 99, 235, 0.16);
  font-size: 11.5px;
  font-weight: 600;
  color: #2563eb;
  display: flex;
  align-items: center;
  gap: 3.5px;
  cursor: pointer;
  padding: 4px 9px;
  border-radius: 7px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.btn-manage-trigger:hover {
  background: rgba(37, 99, 235, 0.16);
  color: #1d4ed8;
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
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
  border-radius: 20px;
  padding: 6px 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
}

.platform-row-item {
  display: flex;
  align-items: center;
  padding: 11px 4px;
  gap: 12px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 12px;
}

.platform-row-item:last-child {
  border-bottom: none;
}

.platform-row-item:hover {
  background: rgba(241, 245, 249, 0.5);
  padding-left: 8px;
  padding-right: 8px;
}

/* Icon */
.platform-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.platform-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Meta */
.platform-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.platform-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.platform-sub {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.sub-status.is-connected {
  color: #94a3b8;
}

.sub-status.is-disconnected {
  color: #cbd5e1;
}

.sub-status.is-checking {
  color: #3b82f6;
}

/* Action wrap */
.platform-action-wrap {
  display: flex;
  align-items: center;
}

/* Soft Green '已连接' Pill */
.pill-tag.is-connected-pill {
  background: #edfdf2;
  border: 1px solid #d1fae5;
  border-radius: 20px;
  padding: 4px 10px 4px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.pill-text {
  font-size: 12px;
  font-weight: 600;
  color: #22c55e;
}

.pill-check-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22c55e;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pill-check-circle:not(.is-checked) {
  background: #cbd5e1;
  opacity: 0.5;
}

.is-selected .pill-tag.is-connected-pill {
  background: #dcfce7;
  border-color: #86efac;
}

/* Soft Peach '连接' Button */
.pill-btn-connect {
  background: #fff7ed;
  border: 1px solid #ffedd5;
  color: #f97316;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn-connect:hover {
  background: #ffedd5;
  transform: scale(1.05);
}

/* Settings Card Box */
.settings-card-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* iOS Style Switch */
.ios-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
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
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

input:checked + .slider {
  background-color: #ff6036;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* DateTime input row */
.datetime-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid #f1f5f9;
  animation: fadeInDown 0.2s ease;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.datetime-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.time-icon {
  color: #94a3b8;
}

.time-input {
  border: none;
  background: transparent;
  font-size: 13px;
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
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-time-refresh:hover {
  color: #ff6036;
  transform: rotate(45deg);
}

/* Cover Image Section */
.cover-setting-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-change-cover {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.btn-change-cover:hover {
  text-decoration: underline;
}

.hidden-file-input {
  display: none;
}

.cover-preview-box {
  width: 100%;
  height: 108px;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-preview-box:hover .cover-img {
  transform: scale(1.04);
}

.cover-overlay-hint {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cover-preview-box:hover .cover-overlay-hint {
  opacity: 1;
}

/* Drawer Footer */
.drawer-footer {
  padding: 16px 20px 24px 20px;
  background: rgba(248, 250, 255, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 2;
}

.btn-gradient-launch {
  width: 100%;
  height: 48px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #ff5e36 0%, #ff8c58 100%);
  box-shadow: 0 8px 24px rgba(255, 94, 54, 0.35);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.launch-btn-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.launch-arrow {
  font-size: 16px;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.btn-gradient-launch:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(255, 94, 54, 0.45);
}

.btn-gradient-launch:hover:not(:disabled) .launch-arrow {
  transform: translateX(3px);
}

.btn-gradient-launch:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-gradient-launch:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.8;
}

.spinner-dot {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Open Drafts Option Under Launch Button */
.open-drafts-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 10px;
  cursor: pointer;
  user-select: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.18s ease;
}

.open-drafts-option:hover .open-drafts-label {
  color: #1e293b;
}

.open-drafts-option:hover .dot-radio-wrapper:not(.is-checked) {
  border-color: #94a3b8;
}

.dot-radio-wrapper {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.dot-radio-wrapper.is-checked {
  border-color: #2563eb;
  background: #eff6ff;
}

.dot-radio-wrapper.is-checked .dot-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
  box-shadow: 0 0 4px rgba(37, 99, 235, 0.4);
}

.open-drafts-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: -0.1px;
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
