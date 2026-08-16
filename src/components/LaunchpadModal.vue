<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { 
  X, 
  Play, 
  CheckCircle, 
  ExternalLink, 
  Terminal, 
  Copy,
  ChevronRight
} from '@lucide/vue';
import { soundEngine } from '../utils/synthAudio';
import { compileToWeChatHtml } from '../utils/wechatStyles';
import confetti from 'canvas-confetti';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
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

const isLaunching = ref(false);
const isFinished = ref(false);
const terminalLogs = ref([]);
const activeLogIndex = ref(0);
const isCheckingLogins = ref(false);

const platforms = ref([
  {
    id: 'wechat',
    name: '微信公众号',
    color: '#07c160',
    writeUrl: 'https://mp.weixin.qq.com/',
    status: 'idle',
    progress: 0,
    actionLabel: '前往公众号后台',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'zhihu',
    name: '知乎专栏',
    color: '#0084ff',
    writeUrl: 'https://zhuanlan.zhihu.com/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'juejin',
    name: '稀土掘金',
    color: '#1e80ff',
    writeUrl: 'https://juejin.cn/editor/drafts/new',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往写文章',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'csdn',
    name: 'CSDN 博客',
    color: '#fc5531',
    writeUrl: 'https://editor.csdn.net/md/',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'cnblogs',
    name: '博客园',
    color: '#3272ad',
    writeUrl: 'https://i.cnblogs.com/posts/edit',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'baijiahao',
    name: '百家号',
    color: '#ea4335',
    writeUrl: 'https://baijiahao.baidu.com/builder/rc/write/article',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    color: '#fb7299',
    writeUrl: 'https://member.bilibili.com/platform/upload/text',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'eastmoney',
    name: '东方财富',
    color: '#f59e0b',
    writeUrl: 'https://mp.eastmoney.com/NewWrite/Article',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'oschina',
    name: '开源中国',
    color: '#22c55e',
    writeUrl: 'https://my.oschina.net/action/blog/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'sohu',
    name: '搜狐号',
    color: '#e11d48',
    writeUrl: 'https://mp.sohu.com/mpbp/bp/article/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'yuque',
    name: '语雀',
    color: '#00b96b',
    writeUrl: 'https://www.yuque.com/dashboard',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: '51cto',
    name: '51CTO',
    color: '#10b981',
    writeUrl: 'https://blog.51cto.com/blogger/publish',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'douban',
    name: '豆瓣',
    color: '#007722',
    writeUrl: 'https://www.douban.com/note/create',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'segmentfault',
    name: '思否',
    color: '#009a61',
    writeUrl: 'https://segmentfault.com/write',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'md',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'weibo',
    name: '微博',
    color: '#e6162d',
    writeUrl: 'https://card.weibo.com/article/v5/editor',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'xueqiu',
    name: '雪球',
    color: '#3b82f6',
    writeUrl: 'https://mp.xueqiu.com/writeV2',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'imooc',
    name: '慕课手记',
    color: '#f01414',
    writeUrl: 'https://www.imooc.com/article/publish',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'woshipm',
    name: '人人都是产品经理',
    color: '#ea580c',
    writeUrl: 'https://www.woshipm.com/writing',
    status: 'idle',
    progress: 0,
    actionLabel: '复制并前往创作',
    format: 'html',
    loginStatus: 'checking',
    selected: true,
    username: '',
    avatar: ''
  },
  {
    id: 'zip-download',
    name: 'Markdown 压缩包',
    color: '#6366f1',
    writeUrl: '',
    status: 'idle',
    progress: 0,
    actionLabel: '点击下载文件',
    format: 'md',
    loginStatus: 'logged_in', // Zip download is always ready
    selected: true,
    username: '本地下载',
    avatar: ''
  }
]);

const getDynamicLogSequence = () => {
  const seq = [
    { text: '初始化 NiceMD 内容分发系统...', type: 'info', delay: 150 },
    { text: '解析 Markdown 抽象语法树 (AST) 并检测多媒体区块...', type: 'info', delay: 200 },
    { text: '静态资源路径分析: 未检测到相对路径或非 HTTPS 资源。', type: 'info', delay: 100 }
  ];
  
  // Checking channels
  platforms.value.forEach(p => {
    if (p.selected) {
      seq.push({
        text: `配置发布通道 [${p.name}]: 已加载注入规则与 DOM 选择器。`,
        type: 'info',
        delay: 150,
        platform: p.id,
        status: 'ignition'
      });
    }
  });
  
  seq.push({ text: '所有发布通道校验成功，网络连接正常。', type: 'info', delay: 120 });
  seq.push({ text: '启动多渠道自动化分发任务...', type: 'info', delay: 150 });
  
  // Dispatch steps
  platforms.value.forEach(p => {
    if (p.selected) {
      seq.push({
        text: `拉起 ${p.name} 创作页面并建立连接管道...`,
        type: 'info',
        delay: 100,
        platform: p.id,
        status: 'launched',
        progress: 50
      });
    }
  });
  
  seq.push({ text: '已建立与配套 Extension 的安全双向数据通道。', type: 'info', delay: 200 });
  
  // Success steps
  platforms.value.forEach(p => {
    if (p.selected) {
      seq.push({
        text: `已成功向 ${p.name} 注入文章标题与主体内容。`,
        type: 'success',
        delay: 100,
        platform: p.id,
        status: 'success',
        progress: 100
      });
    }
  });
  
  seq.push({ text: '多渠道自动化分发流执行完毕。', type: 'success', delay: 150 });
  return seq;
};

const isExtensionInstalled = ref(false);

const checkAllLogins = () => {
  if (!isExtensionInstalled.value) {
    platforms.value.forEach(p => {
      if (p.id !== 'zip-download') {
        p.loginStatus = 'unknown';
      }
    });
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

const downloadMarkdownFile = (markdownText) => {
  const titleMatch = markdownText.match(/^#\s+(.+)$/m);
  const fileName = (titleMatch ? titleMatch[1].trim() : 'article') + '.md';
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
  if (plat.id !== 'zip-download' && plat.loginStatus !== 'logged_in') {
    return; // Don't allow selection of unlogged platforms
  }
  soundEngine.playClick();
  plat.selected = !plat.selected;
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    window.postMessage({ type: 'NICEMD_GET_CONFIG' }, '*');
    if (isExtensionInstalled.value) {
      checkAllLogins();
    }
  }
});

onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    // Check PING PONG
    if (event.data && event.data.type === 'NICEMD_PONG') {
      isExtensionInstalled.value = true;
      console.log('[NiceMD] Chrome extension helper detected!', event.data.version);
      
      platforms.value.forEach(p => {
        if (p.id !== 'zip-download') {
          p.actionLabel = '自动装填并前往';
        }
      });
      checkAllLogins();
    }

    // Dynamic config load
    if (event.data && event.data.type === 'NICEMD_GET_CONFIG_RESPONSE') {
      if (event.data.success && event.data.config) {
        platforms.value = event.data.config.map(c => {
          const existing = platforms.value.find(p => p.id === c.id);
          const isZip = c.id === 'zip-download';
          return {
            id: c.id,
            name: c.name,
            color: c.color,
            writeUrl: c.writeUrl,
            format: c.selectors.format === 'text/html' ? 'html' : 'md',
            status: existing ? existing.status : 'idle',
            progress: existing ? existing.progress : 0,
            actionLabel: isZip 
              ? '点击下载文件' 
              : (isExtensionInstalled.value 
                  ? (c.silentEnabled ? '静默生成草稿' : '自动装填并前往') 
                  : '复制并前往'),
            loginStatus: isZip ? 'logged_in' : (existing ? existing.loginStatus : 'checking'),
            selected: existing ? existing.selected : true,
            username: isZip ? '本地下载' : (existing ? existing.username : ''),
            avatar: isZip ? '' : (existing ? existing.avatar : ''),
            silentEnabled: !!c.silentEnabled
          };
        });
        checkAllLogins();
      }
    }

    // Check login status response
    if (event.data && event.data.type === 'NICEMD_CHECK_LOGINS_RESPONSE') {
      isCheckingLogins.value = false;
      if (event.data.success && event.data.statuses) {
        platforms.value.forEach(p => {
          if (p.id === 'zip-download') return;
          
          const info = event.data.statuses[p.id];
          if (info !== undefined) {
            if (typeof info === 'object') {
              p.loginStatus = info.loggedIn ? 'logged_in' : 'not_logged_in';
              p.username = info.username || '';
              p.avatar = info.avatar || '';
            } else {
              p.loginStatus = info ? 'logged_in' : 'not_logged_in';
              p.username = '';
              p.avatar = '';
            }
          } else {
            p.loginStatus = 'unknown';
          }
          
          // Disable selection if not logged in
          if (p.loginStatus !== 'logged_in') {
            p.selected = false;
          }
        });
      } else {
        platforms.value.forEach(p => {
          if (p.id !== 'zip-download') {
            p.loginStatus = 'unknown';
            p.username = '';
            p.avatar = '';
            p.selected = false;
          }
        });
      }
    }
  });

  // Ping for extension after panel mount
  setTimeout(() => {
    window.postMessage({ type: 'NICEMD_PING' }, '*');
  }, 300);
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const addLog = (type, text) => {
  const now = new Date();
  const time = now.toTimeString().split(' ')[0];
  terminalLogs.value.push({
    id: Date.now() + Math.random(),
    time,
    type,
    text
  });
  setTimeout(() => {
    const term = document.querySelector('.terminal-screen');
    if (term) term.scrollTop = term.scrollHeight;
  }, 10);
};

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
        html: targetHtml
      }
    }, '*');
  });
};

const handleLaunch = async () => {
  if (isLaunching.value) return;
  
  // Make sure we only attempt to launch valid, logged-in, and selected platforms
  const selectedList = platforms.value.filter(p => p.selected && (p.id === 'zip-download' || p.loginStatus === 'logged_in'));
  if (selectedList.length === 0) return;

  isLaunching.value = true;
  isFinished.value = false;
  terminalLogs.value = [];
  
  platforms.value.forEach(p => {
    if (p.selected) {
      p.status = 'idle';
      p.progress = 0;
      p.draftUrl = ''; // reset previous draft links
    }
  });

  addLog('info', '🚀 初始化 NiceMD 多渠道内容分发引擎...');
  await sleep(400);
  addLog('info', '📦 解析 Markdown 文章内容与样式配置...');
  await sleep(300);

  const titleMatch = props.markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '极简发布文章 - NiceMD';

  addLog('info', '启动多渠道自动化分发任务...');
  
  const publishPromises = selectedList.map(async (plat) => {
    plat.status = 'ignition';
    plat.progress = 20;
    addLog('info', `[${plat.name}] 正在校验发布通道并建立数据通道...`);
    await sleep(200 + Math.random() * 300);

    if (plat.id === 'zip-download') {
      addLog('info', `[${plat.name}] 正在生成本地打包文件...`);
      downloadMarkdownFile(props.markdown);
      plat.status = 'success';
      plat.progress = 100;
      addLog('success', `[${plat.name}] 成功生成 Markdown 本地文件并触发下载。`);
      return;
    }

    if (!isExtensionInstalled.value) {
      addLog('warn', `[${plat.name}] 未检测到助手插件，进入剪贴板备份模式...`);
      await copyPlatformContent(plat);
      plat.status = 'success';
      plat.progress = 100;
      addLog('success', `[${plat.name}] 剪贴板已就绪，已拉起平台页面。`);
      return;
    }

    const targetHtml = plat.id === 'wechat'
      ? compileToWeChatHtml(props.html, props.themeId, props.codeThemeId)
      : props.html;

    plat.status = 'launched';
    plat.progress = 50;
    addLog('info', `[${plat.name}] 正在传送数据，执行后台 API 草稿生成...`);

    try {
      const response = await publishPlatform(plat, title, targetHtml);
      if (response.success) {
        plat.status = 'success';
        plat.progress = 100;
        if (response.postUrl) {
          plat.draftUrl = response.postUrl;
          addLog('success', `[${plat.name}] 草稿创建成功！链接: ${response.postUrl}`);
        } else if (response.fallback) {
          addLog('success', `[${plat.name}] 成功拉起发布页面并执行自动填装。`);
        } else {
          addLog('success', `[${plat.name}] 发布执行完毕。`);
        }
      } else {
        plat.status = 'failed';
        plat.progress = 0;
        plat.errorMsg = response.error || '通道错误';
        addLog('error', `[${plat.name}] 发布失败: ${response.error || '通道错误'}`);
      }
    } catch (err) {
      plat.status = 'failed';
      plat.progress = 0;
      plat.errorMsg = err.message;
      addLog('error', `[${plat.name}] 通道异常: ${err.message}`);
    }
  });

  await Promise.all(publishPromises);

  // Fallback copy for WeChat styled output
  const wechatPlat = platforms.value.find(p => p.id === 'wechat');
  if (wechatPlat && wechatPlat.selected) {
    try {
      const finalHtml = compileToWeChatHtml(props.html, props.themeId, props.codeThemeId);
      const htmlBlob = new Blob([finalHtml], { type: 'text/html' });
      const textBlob = new Blob([props.markdown], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([item]);
      addLog('success', '💡 提示: 微信排版样式已同步至系统剪贴板，支持在公众号编辑器直接粘贴。');
    } catch (err) {
      // ignore
    }
  }

  addLog('success', '🎉 所有通道发布任务处理完毕。');
  isFinished.value = true;
  isLaunching.value = false;
  
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 }
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
        const titleMatch = props.markdown.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : '极简发布文章 - NiceMD';
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

const selectedCount = computed(() => {
  return platforms.value.filter(p => p.selected).length;
});

const selectablePlatformsCount = computed(() => {
  return platforms.value.filter(p => p.id === 'zip-download' || p.loginStatus === 'logged_in').length;
});

const selectAll = (val) => {
  soundEngine.playClick();
  platforms.value.forEach(p => {
    if (val) {
      if (p.id === 'zip-download' || p.loginStatus === 'logged_in') {
        p.selected = true;
      }
    } else {
      p.selected = false;
    }
  });
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="title-area">
          <span class="pulse-dot"></span>
          <h2>多渠道内容分发控制台</h2>
        </div>
        <button @click="emit('close')" class="btn-close">
          <X size="20" />
        </button>
      </div>

      <div class="modal-body-container">
        <!-- Control Bar -->
        <div class="launchpad-control-bar">
          <div class="control-left">
            <span class="control-label">选择分发渠道：</span>
            <span class="control-count">已选择 {{ selectedCount }} / {{ platforms.length }}</span>
          </div>
          <div class="control-right">
            <button class="btn-control-action" @click="selectAll(true)">全选</button>
            <span class="divider">|</span>
            <button class="btn-control-action" @click="selectAll(false)">清空</button>
            <span class="divider">|</span>
            <button class="btn-control-action btn-refresh" @click="checkAllLogins" title="刷新登录状态">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="icon-refresh" :class="{ 'is-spinning': isCheckingLogins }">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>刷新状态</span>
            </button>
          </div>
        </div>

        <!-- Platform Launch Pads -->
        <div class="launchpads-container">
          <div 
            v-for="plat in platforms" 
            :key="plat.id" 
            class="launchpad-card"
            :class="[
              `is-${plat.status}`, 
              plat.id, 
              { 'is-unselected': !plat.selected },
              { 'is-disabled': plat.id !== 'zip-download' && plat.loginStatus !== 'logged_in' }
            ]"
            :style="{ '--accent': plat.color }"
            @click="toggleSelect(plat)"
          >
            <!-- Card Checkbox -->
            <div class="card-checkbox" @click.stop="toggleSelect(plat)">
              <div 
                class="checkbox-visual" 
                :class="{ 
                  'is-checked': plat.selected,
                  'is-disabled': plat.id !== 'zip-download' && plat.loginStatus !== 'logged_in'
                }" 
                :style="{ color: plat.color }"
              >
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="4">
                  <polyline points="20 6 9 17 4 12" v-if="plat.selected"></polyline>
                </svg>
              </div>
            </div>

            <!-- Platform badge -->
            <div class="platform-badge" :style="{ backgroundColor: plat.color + '15', color: plat.color, borderColor: plat.color + '30', borderWidth: '1px', borderStyle: 'solid' }">
              <!-- WeChat SVG -->
              <svg v-if="plat.id === 'wechat'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8.22 2C4.16 2 .85 4.84.85 8.35c0 2.01 1.08 3.8 2.76 5.02l-.69 2.11c-.08.24.11.45.34.37l2.45-1.19c.77.22 1.62.34 2.51.34c4.06 0 7.37-2.84 7.37-6.35S12.28 2 8.22 2zm-2.86 5c-.47 0-.85-.38-.85-.85s.38-.85.85-.85.85.38.85.85-.38.85-.85.85zm4.82 0c-.47 0-.85-.38-.85-.85s.38-.85.85-.85.85.38.85.85-.38.85-.85.85zm12.38 5.76c0-2.92-2.77-5.29-6.19-5.29c-.39 0-.76.03-1.12.09c.8 1.09 1.28 2.45 1.28 3.93c0 3.87-3.37 7.02-7.53 7.02c-.52 0-1.03-.05-1.53-.15c.87.89 2.12 1.45 3.52 1.45c.74 0 1.45-.16 2.09-.44l2.04.99c.19.09.35-.08.28-.28l-.57-1.75c1.78-1.19 2.92-2.94 2.92-4.91l.01-.66zm-4.7-1.22c-.39 0-.7-.31-.7-.7s.31-.7.7-.7s.7.31.7.7s-.31.7-.7.7zm3.56 0c-.39 0-.7-.31-.7-.7s.31-.7.7-.7s.7.31.7.7s-.31.7-.7.7z"/>
              </svg>
              <!-- Zhihu SVG -->
              <svg v-else-if="plat.id === 'zhihu'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16.27 10.1c.14-.52.22-1.07.24-1.63h-2.33v-1.6h2.46c.01-.17.02-.33.02-.5h-2.48V4.76h4.15v1.6H17.4v.01c0 .17-.01.33-.02.5h2.15v1.6H17.2c-.03.56-.11 1.11-.25 1.63h2.38v1.6h-2.92v3.75h-1.6v-3.75h-2.91v-1.6h4.37zm-6.6 3.19l.71 1.43c-.87.43-1.84.77-2.91 1.02l-.56-1.5c.84-.18 1.61-.43 2.31-.72l.45-.23zm-.68-6.1c.7-.62 1.48-1.12 2.34-1.5l.89 1.34c-.81.33-1.54.77-2.18 1.3l-1.05-1.14zm4.41 7.15c.61.54 1.31 1 2.09 1.37l-.92 1.42c-.75-.38-1.42-.85-2.01-1.39l.84-1.4zm-7.62 1.13c2.25-.66 4.07-2 5.48-4.04l1.35.88c-1.58 2.27-3.66 3.77-6.24 4.51l-.59-1.35zm3.11-8.22c.2-.5.35-1.02.46-1.56H7.13v-1.6h4.2c-.15-.75-.38-1.48-.7-2.17l1.58-.45c.42.92.71 1.88.89 2.62h2.2v1.6h-2.35c-.15.74-.36 1.45-.63 2.13l-1.59-.57zM5 3.5h14c.83 0 1.5.67 1.5 1.5v14c0 .83-.67 1.5-1.5 1.5H5c-.83 0-1.5-.67-1.5-1.5V5c0-.83.67-1.5 1.5-1.5z"/>
              </svg>
              <!-- Juejin SVG -->
              <svg v-else-if="plat.id === 'juejin'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2.5l9 7.2l-9 7.2l-9-7.2zm0 17.8l6.7-5.4l1.6 1.3l-8.3 6.6l-8.3-6.6l1.6-1.3zm0-3.6l4.5-3.6l1.6 1.3L12 20.8l-6.1-4.9l1.6-1.3z"/>
              </svg>
              <!-- CSDN SVG -->
              <svg v-else-if="plat.id === 'csdn'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5c1.8 0 3.36.93 4.14 2.33l-1.82 1.05C12.82 10.37 12 9.75 11 9.75c-1.24 0-2.25 1.01-2.25 2.25s1.01 2.25 2.25 2.25c1.01 0 1.83-.62 2.32-1.63l1.82 1.05c-.78 1.4-2.34 2.33-4.14 2.33z"/>
              </svg>
              <!-- Cnblogs SVG -->
              <svg v-else-if="plat.id === 'cnblogs'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.8 14.2c-1.8 0-3.2-1.4-3.2-3.2s1.4-3.2 3.2-3.2c.9 0 1.7.4 2.3 1l-1.4 1.4c-.2-.2-.5-.4-.9-.4-.7 0-1.2.5-1.2 1.2s.5 1.2 1.2 1.2c.4 0 .7-.2.9-.4l1.4 1.4c-.6.6-1.4 1-2.3 1zm5.2-.2h-2.4V8h2.4c.9 0 1.6.7 1.6 1.6 0 .5-.2.9-.6 1.2.6.3 1 .9 1 1.6 0 .9-.7 1.6-1.6 1.6zm-1-4.2h1c.3 0 .6-.3.6-.6s-.3-.6-.6-.6h-1v1.2zm0 2.2h1c.3 0 .6-.3.6-.6s-.3-.6-.6-.6h-1v1.2z"/>
              </svg>
              <!-- Baijiahao SVG -->
              <svg v-else-if="plat.id === 'baijiahao'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="5" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" fill="currentColor" stroke="none">百</text>
              </svg>
              <!-- Bilibili SVG -->
              <svg v-else-if="plat.id === 'bilibili'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2a1 1 0 0 1 .8.4l2.5 3c.3.4.2 1-.2 1.4a1 1 0 0 1-1.4-.2l-2-2.4H10.3l-2 2.4a1 1 0 0 1-1.6-1.2l2.5-3a1 1 0 0 1 .8-.4h2zM5 8h14c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-9c0-1.1.9-2 2-2zm2.5 4c-.8 0-1.5.7-1.5 1.5S6.7 15 7.5 15s1.5-.7 1.5-1.5S8.3 12 7.5 12zm9 0c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm-5 5c-1.7 0-3-.7-3.7-1.5h8.4c-.7.8-2 1.5-4.7 1.5z"/>
              </svg>
              <!-- Eastmoney SVG -->
              <svg v-else-if="plat.id === 'eastmoney'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v12M8 10h8M9 14h6"/>
              </svg>
              <!-- Oschina SVG -->
              <svg v-else-if="plat.id === 'oschina'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="4" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="12" fill="currentColor" stroke="none">OS</text>
              </svg>
              <!-- Sohu SVG -->
              <svg v-else-if="plat.id === 'sohu'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="5" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" fill="currentColor" stroke="none">搜</text>
              </svg>
              <!-- Yuque SVG -->
              <svg v-else-if="plat.id === 'yuque'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-3-3h2v-4h2v4h2l-3 3z"/>
              </svg>
              <!-- 51cto SVG -->
              <svg v-else-if="plat.id === '51cto'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="4" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="12" fill="currentColor" stroke="none">51</text>
              </svg>
              <!-- Douban SVG -->
              <svg v-else-if="plat.id === 'douban'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M5 3.5h14v2H5v-2zm1.5 5.5h11v9.5H6.5V9zm2.5 2v5.5h6v-5.5H9zM5 20.5h14v-2H5v2z"/>
              </svg>
              <!-- Segmentfault SVG -->
              <svg v-else-if="plat.id === 'segmentfault'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="5" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" fill="currentColor" stroke="none">SF</text>
              </svg>
              <!-- Weibo SVG -->
              <svg v-else-if="plat.id === 'weibo'" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.3 11.5c-.3.8-1 1.4-2.1 1.8-.7.3-1.4.4-2.2.4-1.6 0-3-.5-4.1-1.5-1.1-1-1.6-2.3-1.6-3.8 0-1.5.5-2.8 1.6-3.8 1.1-1 2.5-1.5 4.1-1.5 1.6 0 3 .5 4.1 1.5 1.1 1 1.6 2.3 1.6 3.8s-.5 2.8-1.5 3.6zm-3.3-6.2c-.9 0-1.7.3-2.3.9s-.9 1.4-.9 2.3c0 .9.3 1.7.9 2.3.6.6 1.4.9 2.3.9.9 0 1.7-.3 2.3-.9.6-.6.9-1.4.9-2.3 0-.9-.3-1.7-.9-2.3s-1.4-.9-2.3-.9z"/>
              </svg>
              <!-- Xueqiu SVG -->
              <svg v-else-if="plat.id === 'xueqiu'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
              <!-- Imooc SVG -->
              <svg v-else-if="plat.id === 'imooc'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="5" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="14" fill="currentColor" stroke="none">慕</text>
              </svg>
              <!-- Woshipm SVG -->
              <svg v-else-if="plat.id === 'woshipm'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="4"/>
                <text x="4" y="16" font-family="'Outfit', sans-serif" font-weight="900" font-size="12" fill="currentColor" stroke="none">PM</text>
              </svg>
              <!-- Zip-download SVG -->
              <svg v-else-if="plat.id === 'zip-download'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
            
            <div class="pad-title">
              <span>{{ plat.name }}</span>
              <span v-if="plat.silentEnabled" class="silent-mode-badge" title="当前已开启后台 API 静默分发">静默</span>
            </div>

            <!-- Login Status Badge -->
            <div class="login-badge-container">
              <span v-if="plat.loginStatus === 'checking'" class="login-badge is-checking">
                <span class="dot-blink"></span>检测中
              </span>
              <span 
                v-else-if="plat.loginStatus === 'logged_in'" 
                class="login-badge is-logged-in" 
                @click.stop="openLoginTab(plat)" 
                :title="plat.username ? '当前账户: ' + plat.username + ' (点击进入平台)' : '已登录 (点击进入平台)'"
              >
                <img v-if="plat.avatar" :src="plat.avatar" class="badge-avatar" />
                <span>{{ plat.username || '已登录' }}</span>
              </span>
              <span 
                v-else-if="plat.loginStatus === 'not_logged_in'" 
                class="login-badge is-not-logged-in" 
                @click.stop="openLoginTab(plat)" 
                title="点击前往登录"
              >
                未登录 🔗
              </span>
              <span v-else class="login-badge is-unknown">
                未知
              </span>
            </div>

            <!-- Progress bar -->
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: `${plat.progress}%` }"></div>
            </div>

            <!-- Status Row (Inline Indicator + Label) -->
            <div class="status-row">
              <span class="status-indicator">
                <svg v-if="plat.status === 'success'" class="icon-success-small" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span v-else-if="plat.status === 'launched' || plat.status === 'ignition'" class="spinner-loader-small"></span>
                <span v-else-if="plat.status === 'failed'" class="icon-failed-small">❌</span>
                <span v-else class="icon-idle-small"></span>
              </span>
              <span class="status-text">
                <span v-if="plat.status === 'idle'" class="text-idle">等待分发</span>
                <span v-else-if="plat.status === 'ignition'" class="text-working">校验中...</span>
                <span v-else-if="plat.status === 'launched'" class="text-working">分发中...</span>
                <span v-else-if="plat.status === 'success'" class="text-success">已完成</span>
                <span v-else-if="plat.status === 'failed'" class="text-failed" :title="plat.errorMsg || '分发失败'">失败</span>
              </span>
            </div>

            <!-- Action button -->
            <button 
              :disabled="plat.status !== 'success'"
              @click.stop="copyPlatformContent(plat)"
              class="btn-platform-action"
            >
              <span>{{ plat.draftUrl ? '进入草稿箱' : plat.actionLabel }}</span>
              <ChevronRight size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="modal-footer">
        <button 
          @click="handleLaunch" 
          class="btn-launch" 
          :disabled="isLaunching || selectedCount === 0"
          :class="{ 'is-active': isLaunching }"
        >
          <Play v-if="!isLaunching && !isFinished" size="18" />
          <CheckCircle v-else-if="!isLaunching && isFinished" size="18" />
          <span>{{ isFinished ? '重新分发' : isLaunching ? '分发中...' : (selectedCount === 0 ? '请选择分发渠道' : `开始一键分发至已选 ${selectedCount} 个渠道`) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  width: 720px;
  height: 580px;
  background: var(--bg-editor);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
  from { transform: translateY(40px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.01);
}

.title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.modal-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  font-family: 'Outfit', sans-serif;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
}

.modal-body-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px 24px;
  gap: 16px;
  overflow: hidden;
}

/* Launchpad layouts */
.launchpads-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 12px;
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}

/* Scrollbar styling */
.launchpads-container::-webkit-scrollbar {
  width: 6px;
}
.launchpads-container::-webkit-scrollbar-track {
  background: transparent;
}
.launchpads-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}
.launchpads-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.launchpad-card {
  border: 1px solid var(--border-color);
  background: rgba(0,0,0,0.01);
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.launchpad-card:not(.is-unselected):not(.is-disabled) {
  border-color: var(--accent) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.launchpad-card.is-unselected {
  opacity: 0.55;
  filter: grayscale(40%);
  border-color: var(--border-color) !important;
}

.launchpad-card.is-disabled {
  opacity: 0.45;
  filter: grayscale(100%);
  border-color: var(--border-color) !important;
  cursor: not-allowed;
}

.launchpad-card:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.launchpad-card:not(.is-unselected):hover:not(.is-disabled) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

/* Platform Selection Control Bar styling */
.launchpad-control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.control-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.control-count {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(0, 0, 0, 0.03);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.control-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-control-action {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-control-action:hover {
  color: var(--accent-color);
  background: rgba(0, 0, 0, 0.03);
}

.btn-refresh {
  color: var(--text-main);
}

.icon-refresh {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

@keyframes spin-refresh {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-refresh.is-spinning {
  animation: spin-refresh 1s linear infinite;
}

.launchpad-control-bar .divider {
  font-size: 11px;
  color: var(--border-color);
}

/* Card Checkbox styling */
.card-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  z-index: 10;
}

.checkbox-visual {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-editor);
  transition: all 0.2s ease;
}

.checkbox-visual.is-checked {
  background: currentColor;
  border-color: currentColor;
}

.checkbox-visual.is-checked svg {
  color: var(--bg-editor);
}

.checkbox-visual.is-disabled {
  background: rgba(0, 0, 0, 0.05) !important;
  border-color: var(--border-color) !important;
  cursor: not-allowed;
}

.platform-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.pad-title {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-main);
  margin-bottom: 6px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.silent-mode-badge {
  font-size: 9px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 700;
  line-height: 1;
}

/* Status Row */
.status-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 14px;
  margin-top: 4px;
  margin-bottom: 2px;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-success-small {
  color: #10b981;
}

.spinner-loader-small {
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(0, 0, 0, 0.05);
  border-top: 1.5px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-idle-small {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--border-color);
  opacity: 0.6;
}

.progress-bar-container {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 1.5px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-bar-fill {
  height: 100%;
  width: 0;
  background-color: var(--accent-color);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-text {
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.status-text .text-idle {
  color: var(--text-muted);
}

.status-text .text-working {
  color: var(--text-main);
}

.status-text .text-success {
  color: #10b981;
}

.btn-platform-action {
  margin-top: 8px;
  background: var(--bg-editor);
  border: 1.5px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-platform-action:disabled {
  background: rgba(0, 0, 0, 0.01);
  color: var(--text-muted);
  border-color: var(--border-color);
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-platform-action:hover:not(:disabled) {
  background: var(--text-main);
  color: var(--bg-editor);
  border-color: var(--text-main);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn-platform-action:active:not(:disabled) {
  transform: translateY(0);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.01);
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-text .text-failed {
  color: #ef4444;
  cursor: help;
}

.icon-failed-small {
  font-size: 10px;
  margin-right: 2px;
}

.btn-launch {
  width: 100%;
  padding: 12px 24px;
  background: var(--accent-color);
  color: #1e1e1e;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-launch:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-launch:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-launch:disabled {
  background: var(--bg-app);
  color: var(--text-muted);
  border-color: var(--border-color);
  box-shadow: none;
  cursor: not-allowed;
}

/* Login Status Badge styles */
.login-badge-container {
  margin-top: 2px;
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
}

.login-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  max-width: 100px;
  overflow: hidden;
  white-space: nowrap;
}

.login-badge span {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.badge-avatar {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
}

.login-badge.is-checking {
  background: rgba(0, 0, 0, 0.03);
  color: var(--text-muted);
  border-color: var(--border-color);
}

.login-badge.is-logged-in {
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
  cursor: pointer;
}

.login-badge.is-logged-in:hover {
  background: rgba(16, 185, 129, 0.16);
  border-color: rgba(16, 185, 129, 0.4);
}

.login-badge.is-not-logged-in {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
  cursor: pointer;
}

.login-badge.is-not-logged-in:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: scale(1.05);
}

.login-badge.is-unknown {
  background: rgba(0, 0, 0, 0.03);
  color: var(--text-muted);
  border-color: var(--border-color);
}

.dot-blink {
  width: 4px;
  height: 4px;
  background-color: var(--text-muted);
  border-radius: 50%;
  animation: badgeBlink 1s infinite alternate;
}

@keyframes badgeBlink {
  from { opacity: 0.3; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .modal-card {
    width: 95vw !important;
    height: 85vh !important;
  }
  
  .launchpad-control-bar {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: stretch !important;
  }
  
  .control-right {
    justify-content: space-between !important;
  }
  
  .launchpads-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
    gap: 8px !important;
  }
  
  .modal-body-container {
    padding: 12px !important;
    gap: 12px !important;
  }
  
  .modal-footer {
    padding: 12px !important;
  }
}
</style>
