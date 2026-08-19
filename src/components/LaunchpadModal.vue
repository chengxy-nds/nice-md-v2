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

// Preset curated covers
const presetCovers = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
];

// Extract all images from markdown & html
const articleImages = computed(() => {
  const list = [];
  if (props.markdown) {
    const mdRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+|data:image\/[^\s\)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(props.markdown)) !== null) {
      if (match[1] && !list.includes(match[1])) {
        list.push(match[1]);
      }
    }
  }
  if (props.html) {
    const htmlRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = htmlRegex.exec(props.html)) !== null) {
      if (match[1] && !list.includes(match[1])) {
        list.push(match[1]);
      }
    }
  }
  return list;
});

// Auto-extract first image from markdown or fallback
const coverImage = computed(() => {
  if (customCoverUrl.value) return customCoverUrl.value;
  if (articleImages.value.length > 0) return articleImages.value[0];
  return presetCovers[0];
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

const showCoverSelectModal = ref(false);
const tempSelectedCover = ref('');
const activeCoverTab = ref('article'); // 'article' | 'upload' | 'preset'

const openCoverSelectModal = () => {
  soundEngine.playClick();
  tempSelectedCover.value = coverImage.value;
  activeCoverTab.value = 'article'; // 默认从文章图中选择
  showCoverPreviewModal.value = false; // 关闭大图预览
  showCoverSelectModal.value = true;
};

const selectCoverOption = (url) => {
  soundEngine.playClick();
  tempSelectedCover.value = url;
};

const confirmCoverSelection = () => {
  soundEngine.playChime();
  if (tempSelectedCover.value) {
    customCoverUrl.value = tempSelectedCover.value;
  }
  showCoverSelectModal.value = false;
  showCoverPreviewModal.value = false;
};

const triggerLocalFileUpload = () => {
  soundEngine.playClick();
  fileInputRef.value?.click();
};

const handleCoverUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    customCoverUrl.value = event.target.result;
    tempSelectedCover.value = event.target.result;
    soundEngine.playChime();
    showCoverSelectModal.value = false;
    showCoverPreviewModal.value = false;
  };
  reader.readAsDataURL(file);
};

const showCoverPreviewModal = ref(false);
const previewImageUrl = ref('');

const openImagePreview = (url) => {
  if (!url) return;
  soundEngine.playClick();
  previewImageUrl.value = url;
  showCoverPreviewModal.value = true;
};

const openCoverPreview = () => {
  openImagePreview(coverImage.value);
};

const triggerCoverUpload = () => {
  openCoverSelectModal();
};

// ── Platforms ──
const platforms = ref([
  {
    id: 'wechat',
    name: '微信公众号',
    category: 'media',
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
    category: 'tech',
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
    category: 'tech',
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
    category: 'tech',
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
    category: 'media',
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
    category: 'media',
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
    category: 'tech',
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
    category: 'media',
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
    category: 'tech',
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
    category: 'media',
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
    category: 'tech',
    iconUrl: './svg/思否.svg',
    color: '#00965e',
    writeUrl: 'https://segmentfault.com/write',
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
    id: 'oschina',
    name: '开源中国',
    category: 'tech',
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
    category: 'media',
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
    category: 'media',
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
    category: 'tech',
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
    category: 'media',
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
    category: 'tech',
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
    category: 'media',
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
    category: 'media',
    iconUrl: './svg/搜狐.svg',
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
    category: 'media',
    iconUrl: './svg/雪球.svg',
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
    category: 'media',
    iconUrl: './svg/东方财富网.svg',
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
    category: 'media',
    iconUrl: './svg/人人都是产品经理.svg',
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
    id: 'infoq',
    name: 'InfoQ',
    category: 'tech',
    iconUrl: './svg/infoq.svg',
    color: '#0066cc',
    writeUrl: 'https://xie.infoq.cn/article/draft/new',
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
    id: 'learnku',
    name: 'LearnKu',
    category: 'tech',
    iconUrl: './svg/learnku.svg',
    color: '#00c875',
    writeUrl: 'https://learnku.com/articles/create',
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
    id: 'tencentcloud',
    name: '腾讯云开发者',
    category: 'tech',
    iconUrl: './svg/腾讯云.svg',
    color: '#0052d9',
    writeUrl: 'https://cloud.tencent.com/developer/article/write',
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
    id: 'nowcoder',
    name: '牛客网',
    category: 'tech',
    iconUrl: './svg/牛客网.svg',
    color: '#00db99',
    writeUrl: 'https://www.nowcoder.com/discuss/post/write',
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
    id: 'aliyun',
    name: '阿里云开发者',
    category: 'tech',
    iconUrl: './svg/aliyun.svg',
    color: '#ff5500',
    writeUrl: 'https://developer.aliyun.com/article/new',
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
    id: 'leetcode',
    name: '力扣 (LeetCode)',
    category: 'tech',
    iconUrl: './svg/leetcode.svg',
    color: '#ffa116',
    writeUrl: 'https://leetcode.cn/circle/discuss/create/',
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
    id: 'zip-download',
    name: 'Markdown 离线包',
    category: 'tool',
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

// ── Visible Filtered Platforms (Sorted: Logged-in platforms first, Unlogged-in platforms below) ──
const visiblePlatforms = computed(() => {
  const filtered = platforms.value.filter(p => p.enabled !== false);
  return [...filtered].sort((a, b) => {
    const aLogged = a.loginStatus === 'logged_in' || a.id === 'zip-download';
    const bLogged = b.loginStatus === 'logged_in' || b.id === 'zip-download';
    if (aLogged && !bLogged) return -1;
    if (!aLogged && bLogged) return 1;
    return 0;
  });
});

const handlePlatformRowClick = (plat) => {
  if (plat.loginStatus === 'logged_in' || plat.id === 'zip-download') {
    toggleSelect(plat);
  } else {
    openLoginTab(plat);
  }
};

const loggedInCount = computed(() => {
  return visiblePlatforms.value.filter(p => p.loginStatus === 'logged_in' || p.id === 'zip-download').length;
});

// ── Platform Display Management ──
const showPlatformManageModal = ref(false);
const manageTab = ref('all'); // 'all' | 'tech' | 'media'
const SAVED_ENABLED_KEY = 'nicemd_enabled_platforms_v2';

const techPlatforms = computed(() => {
  return platforms.value
    .filter(p => p.category === 'tech')
    .slice()
    .sort((a, b) => {
      const aLogged = (a.loginStatus === 'logged_in' || a.id === 'zip-download') ? 1 : 0;
      const bLogged = (b.loginStatus === 'logged_in' || b.id === 'zip-download') ? 1 : 0;
      return bLogged - aLogged;
    });
});

const mediaPlatforms = computed(() => {
  return platforms.value
    .filter(p => p.category === 'media' || p.category === 'tool')
    .slice()
    .sort((a, b) => {
      const aLogged = (a.loginStatus === 'logged_in' || a.id === 'zip-download') ? 1 : 0;
      const bLogged = (b.loginStatus === 'logged_in' || b.id === 'zip-download') ? 1 : 0;
      return bLogged - aLogged;
    });
});

const techEnabledCount = computed(() => {
  return techPlatforms.value.filter(p => p.enabled !== false && (p.loginStatus === 'logged_in' || p.id === 'zip-download')).length;
});

const mediaEnabledCount = computed(() => {
  return mediaPlatforms.value.filter(p => p.enabled !== false && (p.loginStatus === 'logged_in' || p.id === 'zip-download')).length;
});

const togglePlatformEnabled = (plat) => {
  soundEngine.playClick();
  if (plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download') {
    openLoginTab(plat);
    return;
  }
  plat.enabled = !plat.enabled;
  saveEnabledPlatforms();
};

const toggleCategoryPlatforms = (category, enable) => {
  soundEngine.playClick();
  platforms.value.forEach(p => {
    const isMatch = (category === 'tech' && p.category === 'tech') ||
                    (category === 'media' && (p.category === 'media' || p.category === 'tool'));
    if (isMatch) {
      if (enable) {
        if (p.loginStatus === 'logged_in' || p.id === 'zip-download') {
          p.enabled = true;
        }
      } else {
        p.enabled = false;
      }
    }
  });
  saveEnabledPlatforms();
};

const toggleAllPlatforms = (enableAll) => {
  soundEngine.playClick();
  platforms.value.forEach(p => {
    if (enableAll) {
      if (p.loginStatus === 'logged_in' || p.id === 'zip-download') {
        p.enabled = true;
      }
    } else {
      p.enabled = false;
    }
  });
  saveEnabledPlatforms();
};

const resetDefaultPlatforms = () => {
  soundEngine.playClick();
  const defaultEnabledIds = [
    'wechat', 'zhihu', 'juejin', 'csdn', 'baijiahao', 'bilibili', 'cnblogs', 
    'weibo', 'yuque', 'segmentfault', 'infoq', 'learnku', 'tencentcloud', 
    'nowcoder', 'aliyun', 'leetcode', 'zip-download'
  ];
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

// ── Platform Logins Cache (30 Minutes TTL) ──
const SAVED_LOGINS_CACHE_KEY = 'nicemd_platform_logins_cache_v2';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const applyStatusesToPlatforms = (statuses) => {
  if (!statuses) return;
  platforms.value.forEach(p => {
    if (p.id === 'zip-download') return;
    
    const info = statuses[p.id];
    if (info !== undefined) {
      if (typeof info === 'object') {
        p.loginStatus = info.loggedIn ? 'logged_in' : 'not_logged_in';
        p.userId = info.userId || '';
        p.username = info.username || (info.loggedIn ? '已登录' : '');
        p.avatar = info.avatar || '';
      } else {
        p.loginStatus = info ? 'logged_in' : 'not_logged_in';
        p.userId = '';
        p.username = info ? '已登录' : '';
        p.avatar = '';
      }
    }
    
    if (p.loginStatus === 'logged_in') {
      p.selected = true; // 默认自动勾选已登录平台
    } else {
      p.selected = false;
    }
  });
};

const loadCachedLogins = () => {
  try {
    const raw = localStorage.getItem(SAVED_LOGINS_CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      if (cache && cache.statuses) {
        applyStatusesToPlatforms(cache.statuses);
        const lastChecked = cache.lastChecked || 0;
        const isFresh = (Date.now() - lastChecked) < CACHE_DURATION;
        return { hasCache: true, lastChecked, isFresh };
      }
    }
  } catch (e) {
    console.warn('Failed to load cached logins', e);
  }
  return { hasCache: false, lastChecked: 0, isFresh: false };
};

const saveLoginsToCache = (statuses) => {
  try {
    const data = {
      lastChecked: Date.now(),
      statuses
    };
    localStorage.setItem(SAVED_LOGINS_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save logins cache', e);
  }
};

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
    checkAllLogins(false);
  }
});

const checkAllLogins = (force = false) => {
  resetPlatformSyncStatuses();
  if (!isExtensionInstalled.value) {
    return;
  }

  // 30-minute cache validation
  if (!force) {
    const cacheInfo = loadCachedLogins();
    if (cacheInfo.isFresh) {
      const minsAgo = Math.round((Date.now() - cacheInfo.lastChecked) / 60000);
      console.log(`[NiceMD] 登录状态在 30 分钟有效期内（上次更新于 ${minsAgo} 分钟前），跳过后台重复检测。`);
      return;
    }
  }
  
  if (force) {
    soundEngine.playClick?.();
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

// ── Resolve Channel User Profile / Home URL ──
const getUserHomeUrl = (plat) => {
  if (!plat) return '';
  const id = plat.id;
  const uid = plat.userId || '';

  switch (id) {
    case 'zhihu':
      return uid ? `https://www.zhihu.com/people/${uid}` : 'https://www.zhihu.com/creator';
    case 'juejin':
      return uid ? `https://juejin.cn/user/${uid}` : 'https://juejin.cn/creator/home';
    case 'cnblogs':
      return uid ? `https://home.cnblogs.com/u/${uid}/` : 'https://home.cnblogs.com/';
    case 'csdn':
      return uid ? `https://blog.csdn.net/${uid}` : 'https://mp.csdn.net/';
    case 'learnku':
      return uid ? `https://learnku.com/users/${uid}` : 'https://learnku.com/';
    case 'segmentfault':
      return uid ? `https://segmentfault.com/u/${uid}` : 'https://segmentfault.com/user/settings';
    case 'imooc':
      return uid ? `https://www.imooc.com/u/${uid}` : 'https://www.imooc.com/u/index/allcourses';
    case 'nowcoder':
      return uid ? `https://www.nowcoder.com/profile/${uid}` : 'https://www.nowcoder.com/';
    case 'leetcode':
      return uid ? `https://leetcode.cn/u/${uid}` : 'https://leetcode.cn/circle/discuss/create/';
    case 'bilibili':
      return uid ? `https://space.bilibili.com/${uid}` : 'https://member.bilibili.com/platform/home';
    case 'oschina':
      return uid ? `https://my.oschina.net/u/${uid}` : 'https://my.oschina.net/';
    case 'weibo':
      return uid ? `https://weibo.com/u/${uid}` : 'https://weibo.com/';
    case '51cto':
      return uid ? (uid.startsWith('u_') ? `https://blog.51cto.com/${uid}` : `https://blog.51cto.com/u_${uid}`) : 'https://blog.51cto.com/';
    case 'yuque':
      return 'https://www.yuque.com/dashboard';
    case 'wechat':
    case 'weixin':
      return 'https://mp.weixin.qq.com/';
    case 'baijiahao':
      return 'https://baijiahao.baidu.com/builder/rc/home';
    case 'xueqiu':
      return uid ? `https://xueqiu.com/u/${uid}` : 'https://xueqiu.com/';
    case 'woshipm':
      return uid ? `https://www.woshipm.com/u/${uid}` : 'https://www.woshipm.com/';
    case 'douban':
      return uid ? `https://www.douban.com/people/${uid}/` : 'https://www.douban.com/';
    case 'infoq':
      return 'https://xie.infoq.cn/';
    case 'tencentcloud':
      return uid ? `https://cloud.tencent.com/developer/user/${uid}` : 'https://cloud.tencent.com/developer';
    case 'aliyun':
      return 'https://developer.aliyun.com/creator';
    case 'toutiao':
      return 'https://mp.toutiao.com/profile_v4/index';
    case 'netease':
      return 'https://mp.163.com/';
    case 'jianshu':
      return 'https://www.jianshu.com/';
    default:
      return plat.writeUrl || '';
  }
};

const openUserHome = (plat, event) => {
  if (event) {
    event.stopPropagation();
  }
  if (!plat || plat.id === 'zip-download') return;
  soundEngine.playClick();
  const url = getUserHomeUrl(plat);
  if (!url) return;
  if (isExtensionInstalled.value) {
    window.postMessage({ type: 'NICEMD_OPEN_TAB', url }, '*');
  } else {
    window.open(url, '_blank');
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
      checkAllLogins(false);
    }
  }
});

onMounted(() => {
  initScheduledTime();
  loadSavedEnabledPlatforms();
  loadOpenDraftsPref();
  loadCachedLogins(); // 立即载入本地 30 分钟缓存状态，页面打开 0 秒即时呈现

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'NICEMD_PONG') {
      isExtensionInstalled.value = true;
      checkAllLogins(false);
    }

    if (event.data && event.data.type === 'NICEMD_GET_CONFIG_RESPONSE') {
      if (event.data.success && event.data.config) {
        checkAllLogins(false);
      }
    }

    if (event.data && event.data.type === 'NICEMD_CHECK_LOGINS_RESPONSE') {
      isCheckingLogins.value = false;
      if (event.data.success && event.data.statuses) {
        saveLoginsToCache(event.data.statuses);
        applyStatusesToPlatforms(event.data.statuses);
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
                <span class="count-pill">{{ selectedCount }}/{{ loggedInCount }}</span>
                <span class="count-label">已选择</span>
              </div>
            </div>
            
            <!-- Direct Actions Toolbar -->
            <div class="header-actions-group">
              <button 
                class="btn-action-tool btn-select-toggle" 
                @click="toggleSelectAll"
                title="一键全选或取消全选所有已登录渠道"
              >
                <span>{{ isAllSelected ? '取消全选' : '全选' }}</span>
              </button>

              <button 
                class="btn-action-tool btn-batch-manage" 
                @click="showPlatformManageModal = true"
                title="管理要在控制台展示的平台渠道"
              >
                <Layers size="13" />
                <span>渠道管理</span>
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
                { 'is-logged-in': plat.loginStatus === 'logged_in' || plat.id === 'zip-download' },
                { 'is-unlogged': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download' }
              ]"
              @click="handlePlatformRowClick(plat)"
            >
              <!-- Left: Checkbox Selector (Active for logged in, Disabled placeholder for unlogged in) -->
              <div 
                v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'"
                class="row-select-checkbox"
                :class="{ 'is-checked': plat.selected }"
                @click.stop="toggleSelect(plat)"
                title="勾选/取消勾选分发渠道"
              >
                <Check v-if="plat.selected" size="12" class="check-svg" />
              </div>
              <div 
                v-else
                class="row-select-checkbox is-disabled"
                @click.stop="openLoginTab(plat)"
                title="未登录平台不可勾选，点击前往登录"
              ></div>

              <!-- Brand Icon with Online Green Dot Indicator -->
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
                <!-- Online Green Dot on Icon Corner (Only for logged in) -->
                <span v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" class="icon-online-dot"></span>
              </div>

              <!-- Center: Name & Sub -->
              <div class="platform-meta" :class="{ 'is-unlogged-meta': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download' }">
                <span class="platform-name">{{ plat.name }}</span>
                <span 
                  v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" 
                  class="platform-sub"
                  :class="{ 'is-clickable-user': plat.id !== 'zip-download' }"
                  @click.stop="openUserHome(plat, $event)"
                  :title="plat.id === 'zip-download' ? '' : '点击前往该平台个人主页'"
                >
                  {{ plat.username || '已登录' }}
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
                <!-- Logged in state: Clean '已登录' Pill (Image 1) -->
                <span 
                  v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" 
                  class="badge-logged-in-clean"
                  :class="{ 'is-selected-badge': plat.selected }"
                >
                  {{ plat.selected ? '已选择' : '已登录' }}
                </span>

                <!-- Checking state -->
                <span v-else-if="plat.loginStatus === 'checking'" class="badge-checking">检测中</span>

                <!-- Unlogged in state: Text '去登录' (Image 2) -->
                <span 
                  v-else 
                  class="text-go-login"
                >
                  去登录
                </span>

                <ChevronRight size="15" class="row-chevron-arrow" />
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
            <!-- Row 1: 定时发布 (暂隐藏) -->
            <!--
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
            -->

            <!-- Row 2: 原创声明 (暂隐藏) -->
            <!--
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
            -->

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

              <!-- Cover Image Preview Frame (点击查看大图预览) -->
              <div class="cover-preview-box" @click="openCoverPreview" title="点击查看大图预览">
                <img :src="coverImage" alt="Article Cover" class="cover-img" />
                <div class="cover-expand-btn" @click.stop="openCoverPreview" title="预览封面大图">
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
            {{ isFinished ? '重新发布' : isLaunching ? `正在执行分发 (${selectedCount} 个渠道)...` : (selectedCount > 0 ? `一键发布 (${selectedCount} 个渠道)` : '请勾选需要分发的渠道') }}
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

    <!-- Platform Management Modal (左侧分类导航 + 右侧卡片网格的宽屏自适应弹窗) -->
    <div 
      v-if="showPlatformManageModal" 
      class="manage-modal-backdrop" 
      @click.self="showPlatformManageModal = false"
    >
      <div class="manage-modal-card">
        <div class="manage-modal-header">
          <div class="manage-header-titles">
            <div class="manage-title-row">
              <h3 class="manage-modal-title">发布平台展示管理</h3>
              <button 
                class="btn-manage-refresh" 
                @click="checkAllLogins(true)" 
                :disabled="isCheckingLogins" 
                title="重新检测各平台登录状态"
              >
                <RotateCw size="11" :class="{ 'spin-anim': isCheckingLogins }" />
                <span>刷新状态</span>
              </button>
            </div>
            <p class="manage-modal-subtitle">自定义在右侧发布面板中展示的平台，未登录渠道可在登录后开启展示</p>
          </div>
          <button class="manage-modal-close" @click="showPlatformManageModal = false" title="关闭">
            <X size="18" />
          </button>
        </div>

        <!-- Main Body: Two Column (Left Sidebar + Right Platform Grid) -->
        <div class="manage-modal-body-layout">
          <!-- Left: Categories Navigation Sidebar -->
          <aside class="manage-sidebar-left">
            <div class="manage-sidebar-label">平台分类</div>
            <button 
              class="manage-side-nav-btn" 
              :class="{ active: manageTab === 'all' }"
              @click="manageTab = 'all'"
            >
              <span class="nav-btn-name">全部平台</span>
              <span class="nav-btn-counter">{{ platforms.length }}</span>
            </button>
            <button 
              class="manage-side-nav-btn" 
              :class="{ active: manageTab === 'tech' }"
              @click="manageTab = 'tech'"
            >
              <span class="nav-btn-name">技术社区</span>
              <span class="nav-btn-counter" :class="{ 'has-active': techEnabledCount > 0 }">{{ techEnabledCount }}/{{ techPlatforms.length }}</span>
            </button>
            <button 
              class="manage-side-nav-btn" 
              :class="{ active: manageTab === 'media' }"
              @click="manageTab = 'media'"
            >
              <span class="nav-btn-name">媒体平台</span>
              <span class="nav-btn-counter" :class="{ 'has-active': mediaEnabledCount > 0 }">{{ mediaEnabledCount }}/{{ mediaPlatforms.length }}</span>
            </button>
          </aside>

          <!-- Right: Scrollable Content Grid -->
          <div class="manage-content-right">
            <!-- Section 1: 技术社区与开发者平台 -->
            <div v-if="manageTab === 'all' || manageTab === 'tech'" class="manage-category-group">
              <div class="manage-category-header">
                <div class="manage-category-title-wrap">
                  <span class="manage-category-name">技术社区与开发者平台</span>
                  <span class="manage-category-count">{{ techEnabledCount }} / {{ techPlatforms.length }} 已开启</span>
                </div>
                <div class="manage-category-actions">
                  <button class="btn-group-toggle" @click="toggleCategoryPlatforms('tech', true)">本组全选</button>
                  <button class="btn-group-toggle" @click="toggleCategoryPlatforms('tech', false)">本组取消</button>
                </div>
              </div>

              <div class="manage-platforms-grid">
                <div 
                  v-for="plat in techPlatforms" 
                  :key="plat.id"
                  class="manage-platform-item"
                  :class="{ 
                    'is-enabled': plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download'),
                    'is-unlogged-manage': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download'
                  }"
                  @click="togglePlatformEnabled(plat)"
                  :title="plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download' ? '未登录渠道暂不支持展示，点击前往登录' : (plat.enabled !== false ? '点击取消展示' : '点击开启展示')"
                >
                  <div class="manage-item-checkbox">
                    <input 
                      type="checkbox" 
                      :checked="plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download')" 
                      :disabled="plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download'"
                      @click.stop="togglePlatformEnabled(plat)" 
                    />
                  </div>
                  <div class="manage-item-icon">
                    <img v-if="plat.iconUrl" :src="plat.iconUrl" :alt="plat.name" />
                    <span v-else class="fallback-icon-letter">{{ plat.name.charAt(0) }}</span>
                  </div>
                  <div class="manage-item-info">
                    <span class="manage-item-name">{{ plat.name }}</span>
                    <span 
                      v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" 
                      class="manage-item-tag is-logged-tag is-clickable-user"
                      @click.stop="openUserHome(plat, $event)"
                      :title="plat.id === 'zip-download' ? '' : '点击前往该平台个人主页'"
                    >
                      {{ plat.username || (plat.id === 'zip-download' ? '离线导出' : '已登录') }}
                    </span>
                    <span v-else class="manage-item-tag is-unlogged-tag">
                      去登录 >
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: 媒体平台与自媒体 -->
            <div v-if="manageTab === 'all' || manageTab === 'media'" class="manage-category-group">
              <div class="manage-category-header">
                <div class="manage-category-title-wrap">
                  <span class="manage-category-name">媒体平台与自媒体渠道</span>
                  <span class="manage-category-count">{{ mediaEnabledCount }} / {{ mediaPlatforms.length }} 已开启</span>
                </div>
                <div class="manage-category-actions">
                  <button class="btn-group-toggle" @click="toggleCategoryPlatforms('media', true)">本组全选</button>
                  <button class="btn-group-toggle" @click="toggleCategoryPlatforms('media', false)">本组取消</button>
                </div>
              </div>

              <div class="manage-platforms-grid">
                <div 
                  v-for="plat in mediaPlatforms" 
                  :key="plat.id"
                  class="manage-platform-item"
                  :class="{ 
                    'is-enabled': plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download'),
                    'is-unlogged-manage': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download'
                  }"
                  @click="togglePlatformEnabled(plat)"
                  :title="plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download' ? '未登录渠道暂不支持展示，点击前往登录' : (plat.enabled !== false ? '点击取消展示' : '点击开启展示')"
                >
                  <div class="manage-item-checkbox">
                    <input 
                      type="checkbox" 
                      :checked="plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download')" 
                      :disabled="plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download'"
                      @click.stop="togglePlatformEnabled(plat)" 
                    />
                  </div>
                  <div class="manage-item-icon">
                    <img v-if="plat.iconUrl" :src="plat.iconUrl" :alt="plat.name" />
                    <span v-else class="fallback-icon-letter">{{ plat.name.charAt(0) }}</span>
                  </div>
                  <div class="manage-item-info">
                    <span class="manage-item-name">{{ plat.name }}</span>
                    <span 
                      v-if="plat.loginStatus === 'logged_in' || plat.id === 'zip-download'" 
                      class="manage-item-tag is-logged-tag is-clickable-user"
                      @click.stop="openUserHome(plat, $event)"
                      :title="plat.id === 'zip-download' ? '' : '点击前往该平台个人主页'"
                    >
                      {{ plat.username || (plat.id === 'zip-download' ? '离线导出' : '已登录') }}
                    </span>
                    <span v-else class="manage-item-tag is-unlogged-tag">
                      去登录 >
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="manage-modal-footer">
          <div class="manage-footer-left">
            <button class="btn-manage-action" @click="toggleAllPlatforms(true)">全选显示</button>
            <button class="btn-manage-action" @click="toggleAllPlatforms(false)">取消全选</button>
          </div>
          <div class="manage-footer-right">
            <button class="btn-manage-done" @click="showPlatformManageModal = false">
              完成保存 (已开启 {{ visiblePlatforms.length }} 个)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cover Fullscreen Immersive Lightbox Modal (沉浸式悬浮大图预览) -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div 
          v-if="showCoverPreviewModal" 
          class="cover-lightbox-backdrop" 
          @click="showCoverPreviewModal = false"
        >
          <!-- Floating Top Controls Bar (Frosted Glass Pill) -->
          <div class="lightbox-floating-controls" @click.stop>
            <span class="lightbox-badge">封面大图预览</span>
            <div class="lightbox-btn-group">
              <button class="lightbox-tool-btn" @click="triggerCoverUpload" title="更换新封面">
                <Upload size="13" />
                <span>更换封面</span>
              </button>
              <button class="lightbox-close-circle" @click="showCoverPreviewModal = false" title="关闭预览 (ESC)">
                <X size="15" />
              </button>
            </div>
          </div>

          <!-- Centered Floating Image Container -->
          <div class="lightbox-image-container" @click.stop>
            <img :src="previewImageUrl || coverImage" alt="Full Cover Preview" class="lightbox-floating-img" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cover Image Selection Modal (文章插图库 + 本地上传 + 预设库) -->
    <Teleport to="body">
      <div 
        v-if="showCoverSelectModal" 
        class="cover-picker-backdrop" 
        @click.self="showCoverSelectModal = false"
      >
        <div class="cover-picker-card">
          <div class="cover-picker-header">
            <div class="picker-header-titles">
              <h3 class="picker-modal-title">更换文章封面</h3>
              <p class="picker-modal-subtitle">从文章正文插图中选取，或从本地上传自定义封面</p>
            </div>
            <button class="picker-modal-close" @click="showCoverSelectModal = false" title="关闭">
              <X size="18" />
            </button>
          </div>

          <div class="cover-picker-body">
            <!-- Source 1: 本地上传卡片 -->
            <div class="picker-section">
              <div class="picker-section-label">
                <Upload size="13" />
                <span>本地上传</span>
              </div>
              <div class="picker-upload-box" @click="triggerLocalFileUpload">
                <div class="picker-upload-icon-circle">
                  <Upload size="18" />
                </div>
                <div class="picker-upload-info">
                  <span class="picker-upload-title">点击上传本地封面图片</span>
                  <span class="picker-upload-desc">支持 JPG、PNG、WebP、GIF 格式</span>
                </div>
              </div>
            </div>

            <!-- Source 2: 文章正文插图 -->
            <div class="picker-section">
              <div class="picker-section-label">
                <ImageIcon size="13" />
                <span>从文章插图中选择 ({{ articleImages.length }} 张)</span>
              </div>
              
              <div v-if="articleImages.length > 0" class="picker-images-grid">
                <div 
                  v-for="(imgUrl, idx) in articleImages" 
                  :key="'article-img-' + idx"
                  class="picker-img-item"
                  :class="{ 'is-active': tempSelectedCover === imgUrl }"
                  @click="selectCoverOption(imgUrl)"
                  @dblclick="openImagePreview(imgUrl)"
                >
                  <img :src="imgUrl" alt="Article image" class="picker-thumb" />
                  <div class="picker-active-badge" v-if="tempSelectedCover === imgUrl">
                    <Check size="13" class="check-svg" />
                  </div>
                  <!-- Hover Zoom Preview Action Button -->
                  <div 
                    class="picker-thumb-preview-btn" 
                    @click.stop="openImagePreview(imgUrl)" 
                    title="点击预览大图"
                  >
                    <Maximize2 size="11" />
                  </div>
                </div>
              </div>
              <div v-else class="picker-empty-notice">
                <span>正文中暂未检测到图片，可直接上传本地图片</span>
              </div>
            </div>

            <!-- Source 3: 推荐精选封面 -->
            <div class="picker-section">
              <div class="picker-section-label">
                <Sparkles size="13" />
                <span>推荐精选封面</span>
              </div>
              <div class="picker-images-grid">
                <div 
                  v-for="(presetUrl, idx) in presetCovers" 
                  :key="'preset-img-' + idx"
                  class="picker-img-item"
                  :class="{ 'is-active': tempSelectedCover === presetUrl }"
                  @click="selectCoverOption(presetUrl)"
                  @dblclick="openImagePreview(presetUrl)"
                >
                  <img :src="presetUrl" alt="Preset cover" class="picker-thumb" />
                  <div class="picker-active-badge" v-if="tempSelectedCover === presetUrl">
                    <Check size="13" class="check-svg" />
                  </div>
                  <!-- Hover Zoom Preview Action Button -->
                  <div 
                    class="picker-thumb-preview-btn" 
                    @click.stop="openImagePreview(presetUrl)" 
                    title="点击预览大图"
                  >
                    <Maximize2 size="11" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cover-picker-footer">
            <button class="btn-picker-cancel" @click="showCoverSelectModal = false">取消</button>
            <button class="btn-picker-confirm" @click="confirmCoverSelection">确认使用选中封面</button>
          </div>
        </div>
      </div>
    </Teleport>
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
  background: #fff8f5;
  border: 1px solid rgba(255, 94, 54, 0.08);
  color: #ff5e36;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.125rem 0.375rem rgba(255, 94, 54, 0.04);
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

.btn-action-tool.btn-select-toggle {
  background: #eff6ff;
  border: 0.0625rem solid #dbeafe;
  font-size: 0.71875rem;
  font-weight: 600;
  color: #2563eb;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.3125rem 0.625rem;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.btn-action-tool.btn-select-toggle:hover {
  background: #dbeafe;
  color: #1d4ed8;
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
  padding: 0.625rem 0.5rem;
  gap: 0.625rem;
  border-bottom: 0.0625rem solid #f8fafc;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 0.75rem;
  background: #ffffff;
  border: 0.0625rem solid transparent;
}

.platform-row-item:last-child {
  border-bottom: none;
}

.platform-row-item:hover {
  background: rgba(241, 245, 249, 0.65);
}

.platform-row-item.is-selected {
  background: #f8fbff;
}

/* Row Select Checkbox */
.row-select-checkbox {
  width: 1.0625rem;
  height: 1.0625rem;
  border-radius: 0.3125rem;
  border: 0.09375rem solid #cbd5e1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.row-select-checkbox:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.row-select-checkbox.is-checked {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 0.125rem 0.375rem rgba(37, 99, 235, 0.3);
}

.row-select-checkbox.is-disabled {
  background: #f8fafc;
  border-color: #e2e8f0;
  cursor: pointer;
  opacity: 0.8;
}

.row-select-checkbox.is-disabled:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.check-svg {
  color: #ffffff;
  stroke-width: 3.2;
}

/* Unlogged-in row (Image 2 style: Clean white & simple) */
.platform-row-item.is-unlogged {
  background: #ffffff;
}

.platform-row-item.is-unlogged:hover {
  background: #f8fafc;
}

.platform-row-item.is-unlogged .platform-name {
  font-weight: 500;
  color: #475569;
}

.platform-row-item.is-unlogged:hover .platform-name {
  color: #1e293b;
}

.platform-row-item.is-unlogged:hover .text-go-login {
  color: #2563eb;
}

.platform-row-item.is-unlogged:hover .row-chevron-arrow {
  color: #2563eb;
  transform: translateX(0.125rem);
}

.is-unlogged-meta {
  justify-content: center;
}

/* Icon with Corner Online Indicator (Clean & Compact 26px) */
.platform-icon-wrapper {
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 0.4375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  background: transparent !important;
  box-shadow: none !important;
}

.platform-icon-img {
  width: 100%;
  height: 100%;
  border-radius: 0.4375rem;
  object-fit: contain;
  display: block;
}

.icon-online-dot {
  position: absolute;
  top: -0.0625rem;
  right: -0.0625rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: #22c55e;
  border: 0.0625rem solid #ffffff;
  box-shadow: 0 0.0625rem 0.125rem rgba(34, 197, 94, 0.4);
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
  transition: color 0.18s ease;
}

.platform-sub {
  font-size: 0.75rem;
  color: #8da0b6;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.platform-sub.is-clickable-user {
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-block;
  max-width: 100%;
}

.platform-sub.is-clickable-user:hover {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
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
  gap: 0.375rem;
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
  transition: all 0.18s ease;
}

.badge-logged-in-clean.is-selected-badge {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
  font-weight: 600;
}

.text-go-login {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 400;
  white-space: nowrap;
  user-select: none;
  transition: color 0.18s ease;
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
  transition: all 0.2s ease;
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
  height: 12.5rem;
  border-radius: 0.5rem;
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
  padding: 0.875rem 1.25rem 1.25rem 1.25rem;
  background: transparent;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.625rem;
}

.btn-gradient-launch {
  flex: 4;
  min-width: 0;
  height: 2.875rem;
  border-radius: 0.875rem;
  border: none;
  background: linear-gradient(135deg, #ff5e36 0%, #ff784e 100%);
  box-shadow: 0 0.5rem 1.5rem rgba(255, 94, 54, 0.32);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0 0.75rem;
  white-space: nowrap;
}

.launch-btn-text {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.0125rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.launch-arrow {
  font-size: 1rem;
  font-weight: 700;
  transition: transform 0.2s ease;
  flex-shrink: 0;
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
  flex-shrink: 0;
}

/* Open Drafts Option Beside Launch Button */
.open-drafts-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  margin-top: 0;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem 0.25rem;
  border-radius: 0.625rem;
  transition: all 0.18s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.open-drafts-option:hover .open-drafts-label {
  color: #ff5e36;
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
  width: min(58rem, 95vw);
  max-width: 95vw;
  height: min(38rem, 86vh);
  max-height: 86vh;
  background: #ffffff;
  border-radius: 1.125rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popInCard 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popInCard {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.manage-modal-header {
  padding: 1rem 1.375rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  flex-shrink: 0;
}

.manage-header-titles {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
}

.manage-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.manage-modal-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', Roboto, sans-serif;
}

.btn-manage-refresh {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #475569;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.21875rem 0.5625rem;
  border-radius: 0.375rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  margin-left: 0.375rem;
}

.btn-manage-refresh:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
  border-color: #cbd5e1;
}

.btn-manage-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.manage-modal-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.manage-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  width: 2rem;
  height: 2rem;
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

/* Two-Column Body Layout */
.manage-modal-body-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #f8fafc;
}

/* Left Sidebar Categories Navigation */
.manage-sidebar-left {
  width: 12rem;
  flex-shrink: 0;
  background: #f8fafc;
  border-right: 1px solid #eef2f6;
  padding: 0.875rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow-y: auto;
}

.manage-sidebar-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem 0.375rem 0.5rem;
}

.manage-side-nav-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5625rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.manage-side-nav-btn .nav-btn-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.manage-side-nav-btn .nav-btn-counter {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.125rem 0.5rem;
  border-radius: 0.625rem;
  transition: all 0.15s ease;
}

.manage-side-nav-btn:hover {
  background: #ffffff;
  border-color: #e2e8f0;
}

.manage-side-nav-btn:hover .nav-btn-name {
  color: #0f172a;
}

.manage-side-nav-btn.active {
  background: #ffffff;
  border-color: #dbeafe;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
}

.manage-side-nav-btn.active .nav-btn-name {
  color: #2563eb;
  font-weight: 700;
}

.manage-side-nav-btn.active .nav-btn-counter {
  background: #eff6ff;
  color: #2563eb;
}

.manage-side-nav-btn .nav-btn-counter.has-active {
  color: #16a34a;
  background: #f0fdf4;
}

/* Right Content Area */
.manage-content-right {
  flex: 1;
  min-width: 0;
  padding: 1.125rem 1.375rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
  background: #ffffff;
}

/* Category Group Block */
.manage-category-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.manage-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.4375rem;
  border-bottom: 1px dashed #e2e8f0;
}

.manage-category-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.manage-category-name {
  font-size: 0.84375rem;
  font-weight: 700;
  color: #1e293b;
}

.manage-category-count {
  font-size: 0.6875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.0625rem 0.5rem;
  border-radius: 0.625rem;
  font-weight: 500;
}

.manage-category-actions {
  display: flex;
  gap: 0.375rem;
}

.btn-group-toggle {
  background: transparent;
  border: 1px solid #e2e8f0;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #64748b;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-group-toggle:hover {
  background: #f8fafc;
  color: #2563eb;
  border-color: #bfdbfe;
}

.manage-platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 0.625rem;
}

.manage-platform-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5625rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.manage-platform-item:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.manage-platform-item.is-enabled {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.08);
}

.manage-platform-item.is-enabled:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.15);
}

.manage-platform-item.is-unlogged-manage {
  background: #f8fafc;
  border-color: #f1f5f9;
  opacity: 0.68;
}

.manage-platform-item.is-unlogged-manage:hover {
  opacity: 1;
  border-color: #cbd5e1;
  background: #ffffff;
}

.manage-item-checkbox {
  display: flex;
  align-items: center;
}

.manage-item-checkbox input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: #2563eb;
  cursor: pointer;
  border-radius: 0.25rem;
}

.manage-item-checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.manage-item-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.manage-item-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fallback-icon-letter {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2563eb;
}

.manage-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.0625rem;
  flex: 1;
  min-width: 0;
}

.manage-item-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manage-item-tag {
  font-size: 0.65625rem;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.manage-item-tag.is-logged-tag {
  color: #16a34a;
  font-weight: 600;
}

.manage-item-tag.is-logged-tag.is-clickable-user {
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-block;
  max-width: 100%;
}

.manage-item-tag.is-logged-tag.is-clickable-user:hover {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.manage-item-tag.is-unlogged-tag {
  color: #94a3b8;
  font-weight: 500;
  transition: color 0.15s ease;
}

.manage-platform-item.is-unlogged-manage:hover .manage-item-tag.is-unlogged-tag {
  color: #2563eb;
  font-weight: 600;
}

.manage-modal-footer {
  padding: 0.875rem 1.375rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  gap: 0.75rem;
  flex-shrink: 0;
}

.manage-footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-manage-action {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-manage-action:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.btn-manage-done {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 0.625rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.32);
  transition: all 0.2s ease;
}

.btn-manage-done:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.42);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .manage-modal-card {
    width: 96vw !important;
    max-height: 92vh !important;
    height: 92vh !important;
  }
  .manage-modal-body-layout {
    flex-direction: column !important;
  }
  .manage-sidebar-left {
    width: 100% !important;
    border-right: none !important;
    border-bottom: 1px solid #eef2f6 !important;
    flex-direction: row !important;
    overflow-x: auto !important;
    padding: 0.5rem 0.75rem !important;
    gap: 0.5rem !important;
  }
  .manage-sidebar-label {
    display: none !important;
  }
  .manage-side-nav-btn {
    width: auto !important;
    flex-shrink: 0 !important;
  }
  .manage-platforms-grid {
    grid-template-columns: 1fr !important;
  }
  .manage-modal-footer {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .manage-footer-left {
    justify-content: center !important;
  }
  .btn-manage-done {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .right-drawer-panel {
    width: 100vw !important;
    max-width: 100vw !important;
  }
}

/* Modern Immersive Lightbox Preview */
.cover-lightbox-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 29, 0.86);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 2rem;
  cursor: zoom-out;
}

/* Floating Top Controls */
.lightbox-floating-controls {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.4375rem 0.625rem 0.4375rem 1.125rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  z-index: 10;
  cursor: default;
}

.lightbox-badge {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.02em;
}

.lightbox-btn-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lightbox-tool-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3125rem 0.8125rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.lightbox-tool-btn:hover {
  background: #ff5e36;
  border-color: #ff5e36;
  box-shadow: 0 4px 14px rgba(255, 94, 54, 0.45);
  transform: translateY(-1px);
}

.lightbox-close-circle {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.lightbox-close-circle:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: rotate(90deg);
}

/* Centered Image Container */
.lightbox-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 90vw;
  max-height: 82vh;
  cursor: default;
}

.lightbox-floating-img {
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 0.875rem;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12);
  animation: zoomInImage 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomInImage {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

/* Lightbox Vue Transition */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.22s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

/* Cover Image Picker Modal */
.cover-picker-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.25rem;
  animation: fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.cover-picker-card {
  width: min(44rem, 92vw);
  max-width: 92vw;
  max-height: 86vh;
  background: #ffffff;
  border-radius: 1.125rem;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popInCard 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.cover-picker-header {
  padding: 1rem 1.375rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  flex-shrink: 0;
}

.picker-header-titles {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.picker-modal-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.picker-modal-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.picker-modal-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.picker-modal-close:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.cover-picker-body {
  padding: 1.25rem 1.375rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.picker-section-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #334155;
}

.picker-upload-box {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.125rem;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.picker-upload-box:hover {
  background: #fff8f5;
  border-color: #ff5e36;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 94, 54, 0.08);
}

.picker-upload-icon-circle {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #ff5e36;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.picker-upload-box:hover .picker-upload-icon-circle {
  background: #ff5e36;
  color: #ffffff;
  border-color: #ff5e36;
}

.picker-upload-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.picker-upload-title {
  font-size: 0.84375rem;
  font-weight: 600;
  color: #0f172a;
}

.picker-upload-desc {
  font-size: 0.71875rem;
  color: #64748b;
}

.picker-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: 0.625rem;
}

.picker-img-item {
  position: relative;
  height: 5.25rem;
  border-radius: 0.625rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  background: #f1f5f9;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.picker-img-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.picker-img-item.is-active {
  border-color: #ff5e36;
  box-shadow: 0 4px 14px rgba(255, 94, 54, 0.28);
}

.picker-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.picker-img-item:hover .picker-thumb {
  transform: scale(1.05);
}

.picker-active-badge {
  position: absolute;
  top: 0.3125rem;
  right: 0.3125rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #ff5e36;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  animation: popBadge 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 3;
}

.picker-thumb-preview-btn {
  position: absolute;
  bottom: 0.3125rem;
  right: 0.3125rem;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 0.375rem;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(4px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.85);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.picker-img-item:hover .picker-thumb-preview-btn {
  opacity: 1;
  transform: scale(1);
}

.picker-thumb-preview-btn:hover {
  background: #ff5e36;
  transform: scale(1.12);
}

@keyframes popBadge {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.picker-empty-notice {
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 0.625rem;
  text-align: center;
  font-size: 0.78125rem;
  color: #94a3b8;
}

.cover-picker-footer {
  padding: 0.875rem 1.375rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  background: #fafbfc;
  flex-shrink: 0;
}

.btn-picker-cancel {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.4375rem 1.125rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-picker-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-picker-confirm {
  background: linear-gradient(135deg, #ff5e36 0%, #ff784e 100%);
  color: #ffffff;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.4375rem 1.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 94, 54, 0.3);
  transition: all 0.2s ease;
}

.btn-picker-confirm:hover {
  box-shadow: 0 6px 18px rgba(255, 94, 54, 0.42);
  transform: translateY(-1px);
}
</style>
