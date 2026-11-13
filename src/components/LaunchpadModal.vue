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
import { fireConfetti } from '../utils/celebrate';
import BrandLogo from './BrandLogo.vue';

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
const showExtensionTip = ref(false);

// Publishing settings state
const isScheduled = ref(false);
const scheduledTime = ref('');
const isOriginalDeclaration = ref(true);
const customCoverUrl = ref('');
const hasNoCover = ref(false);
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
  if (hasNoCover.value) return '';
  if (customCoverUrl.value) return customCoverUrl.value;
  if (articleImages.value.length > 0) return articleImages.value[0];
  return '';
});

const handleCoverError = () => {
  hasNoCover.value = true;
  customCoverUrl.value = '';
};

const handleRemoveCover = () => {
  soundEngine.playClick('backspace');
  hasNoCover.value = true;
  customCoverUrl.value = '';
};

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
  tempSelectedCover.value = coverImage.value || (articleImages.value[0] || presetCovers[0]);
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
    hasNoCover.value = false;
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
    hasNoCover.value = false;
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
    id: 'xiaohongshu',
    name: '小红书',
    category: 'media',
    iconUrl: './svg/小红书.svg',
    color: '#ff2442',
    writeUrl: 'https://creator.xiaohongshu.com/publish/publish?source=official',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往发布',
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

watch(showPlatformManageModal, (newVal) => {
  if (newVal && isExtensionInstalled.value) {
    checkAllLogins(true);
  }
});

const handleManualRefresh = () => {
  checkAllLogins(true);
};

const checkAllLogins = (force = false) => {
  resetPlatformSyncStatuses();

  if (force) {
    soundEngine.playClick?.();
    isCheckingLogins.value = true;
  }

  if (!isExtensionInstalled.value) {
    platforms.value.forEach(p => {
      if (p.id !== 'zip-download') {
        p.loginStatus = 'checking';
      }
    });

    setTimeout(() => {
      if (!isExtensionInstalled.value) {
        isCheckingLogins.value = false;
        platforms.value.forEach(p => {
          if (p.id !== 'zip-download') {
            p.loginStatus = 'not_logged_in';
          }
        });
        if (force) {
          showExtensionTip.value = true;
        }
      }
    }, 800);
    return;
  }

  // Cache instant render
  const cacheInfo = loadCachedLogins();
  
  if (force) {
    isCheckingLogins.value = true;
    platforms.value.forEach(p => {
      if (p.id !== 'zip-download') {
        p.loginStatus = 'checking';
      }
    });
  } else {
    // Background silent revalidation (does not disturb UI with spinners if cache exists)
    if (!cacheInfo.hasCache) {
      isCheckingLogins.value = true;
      platforms.value.forEach(p => {
        if (p.id !== 'zip-download') {
          p.loginStatus = 'checking';
        }
      });
    }
  }
  
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
    case 'xiaohongshu':
    case 'xhs':
      return uid ? `https://www.xiaohongshu.com/user/profile/${uid}` : 'https://creator.xiaohongshu.com/';
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
  return (props.articleTitle && props.articleTitle.trim()) ? props.articleTitle.trim() : '未命名文档';
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

    const targetHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId, '', null, null, { isExport: true });

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
    const finalHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId, '', null, null, { isExport: true });
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
  
  void fireConfetti({
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
      const finalHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId, '', null, null, { isExport: true });
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
    }

    if (event.data && event.data.type === 'NICEMD_GET_CONFIG_RESPONSE') {
      // Configuration retrieved
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
      <!-- Drawer header -->
      <div class="drawer-top-bar">
        <div class="brand-header-left">
          <BrandLogo :size="36" />
          <div class="brand-title-wrap">
            <h2 class="brand-title-cn">多渠道内容分发</h2>
            <p class="brand-subtitle-cn">一键发布到多个平台</p>
          </div>
        </div>
        <button @click="emit('close')" class="btn-drawer-close">
          <X size="16" />
        </button>
      </div>

      <!-- Drawer Scrollable Content -->
      <div class="drawer-content-scroll">
        <!-- Section 0: 当前待发布文章展示 -->
        <div class="current-doc-banner">
          <div class="current-doc-badge">
            <FileText size="13" class="doc-icon" />
            <span class="doc-badge-label">当前待发布文章</span>
          </div>
          <h3 class="current-doc-title" :title="getPublishTitle()" data-tooltip-truncated="true">
            {{ getPublishTitle() }}
          </h3>
          <div class="current-doc-meta">
            <span class="doc-meta-item">{{ (markdown || '').length }} 字符</span>
            <span class="doc-meta-dot">·</span>
            <span class="doc-meta-item">{{ countArticleImages(markdown, html) }} 张图片</span>
            <span class="doc-meta-dot">·</span>
            <span class="doc-meta-item">实时同步编辑区文档</span>
          </div>
        </div>

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
                @click="handleManualRefresh" 
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
                  <span class="sync-stage-label" :title="plat.syncMessage" data-tooltip-truncated="true">{{ plat.syncMessage || (plat.status === 'success' ? '同步成功 100%' : '正在同步...') }}</span>
                </div>
              </div>

              <!-- Right: Status Badge & Chevron Arrow -->
              <div class="platform-action-wrap">
                <!-- Login state; selection is communicated by the checkbox and row -->
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
                <div class="cover-header-actions">
                  <button 
                    v-if="coverImage" 
                    class="btn-link-remove-cover" 
                    @click="handleRemoveCover" 
                    title="去掉封面（不设置封面）"
                  >
                    <span>不设置封面</span>
                  </button>
                  <button class="btn-link-change-cover" @click="triggerCoverUpload">
                    <span>{{ coverImage ? '更换封面' : '添加封面' }}</span>
                    <ChevronRight size="13" />
                  </button>
                </div>
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
              <div v-if="coverImage" class="cover-preview-box" @click="openCoverPreview" title="点击查看大图预览">
                <img :src="coverImage" alt="Article Cover" class="cover-img" @error="handleCoverError" />
                <div class="cover-expand-btn" @click.stop="openCoverPreview" title="预览封面大图">
                  <Maximize2 size="13" />
                </div>
              </div>

              <!-- Empty Cover State -->
              <div v-else class="cover-empty-placeholder" @click="triggerCoverUpload" title="点击添加封面">
                <ImageIcon size="18" class="empty-cover-icon" />
                <span class="empty-cover-text">未设置封面，点击添加</span>
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
        <!-- Background Ambient Sparkle Spheres -->
        <div class="ambient-glow glow-1"></div>
        <div class="ambient-glow glow-2"></div>

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
                <RotateCw size="12" :class="{ 'spin-anim': isCheckingLogins }" />
                <span>刷新状态</span>
              </button>
            </div>
            <p class="manage-modal-subtitle">自定义在右侧发布面板中展示的平台，未登录渠道可在登录后开启展示</p>
          </div>
          <button class="manage-modal-close" @click="showPlatformManageModal = false">
            <X size="16" />
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
                    <div 
                      class="row-select-checkbox" 
                      :class="{ 
                        'is-checked': plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download'),
                        'is-disabled': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download'
                      }"
                    >
                      <Check 
                        v-if="plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download')" 
                        size="9" 
                        class="check-svg" 
                      />
                    </div>
                  </div>
                  <div class="manage-item-icon">
                    <img v-if="plat.iconUrl" :src="plat.iconUrl" :alt="plat.name" />
                    <span v-else class="fallback-icon-letter">{{ plat.name.charAt(0) }}</span>
                    <span v-if="plat.loginStatus === 'logged_in'" class="icon-online-dot"></span>
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
                    <div 
                      class="row-select-checkbox" 
                      :class="{ 
                        'is-checked': plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download'),
                        'is-disabled': plat.loginStatus !== 'logged_in' && plat.id !== 'zip-download'
                      }"
                    >
                      <Check 
                        v-if="plat.enabled !== false && (plat.loginStatus === 'logged_in' || plat.id === 'zip-download')" 
                        size="9" 
                        class="check-svg" 
                      />
                    </div>
                  </div>
                  <div class="manage-item-icon">
                    <img v-if="plat.iconUrl" :src="plat.iconUrl" :alt="plat.name" />
                    <span v-else class="fallback-icon-letter">{{ plat.name.charAt(0) }}</span>
                    <span v-if="plat.loginStatus === 'logged_in'" class="icon-online-dot"></span>
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
              <button class="lightbox-close-circle" @click="showCoverPreviewModal = false">
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
            <button class="picker-modal-close" @click="showCoverSelectModal = false">
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

<style scoped src="./LaunchpadModal.css"></style>
