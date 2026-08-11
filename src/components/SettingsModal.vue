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
} from '@lucide/vue';
import { showConfirm } from '../utils/confirmDialog';
import { soundEngine } from '../utils/synthAudio';
import { getStorageConfig, saveStorageConfig, isStorageEnabled } from '../utils/fileStorage';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

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
const storageTestResult = ref(''); // '', 'testing', 'success', 'error'
const storageTestMsg = ref('');
const showSecretKey = ref(false);

function loadStorageConfig() {
  storageConfig.value = getStorageConfig();
}

async function handleTestConnection() {
  storageTestResult.value = 'testing';
  storageTestMsg.value = '';
  try {
    const { testOSSConnection } = await import('../utils/fileStorage');
    // Pass current form values so user doesn't need to save first
    await testOSSConnection({ ...storageConfig.value });
    storageTestResult.value = 'success';
    storageTestMsg.value = '连接成功！图床配置正确。';
    soundEngine.playChime();
  } catch (err) {
    storageTestResult.value = 'error';
    storageTestMsg.value = '连接失败: ' + err.message;
  }
}

function handleStorageSave() {
  soundEngine.playClick();
  saveStorageConfig({ ...storageConfig.value });
  saveStatus.value = 'success';
  setTimeout(() => { saveStatus.value = ''; }, 2000);
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
              <label class="checkbox-container" style="margin-top: 10px;">
                <input type="checkbox" v-model="lineNumbers" />
                <span class="checkbox-label-text">在编辑器左侧显示行号</span>
              </label>
            </div>
          </div>
        </div>

        <!-- File Storage (图床) Settings -->
        <div class="settings-main-form" v-else-if="activeTab === 'storage'">
          <div class="form-section-header">
            <h3>图床配置</h3>
          </div>
          <p class="storage-desc">配置图床后，在编辑器中粘贴图片即可自动上传并插入 Markdown 图片链接。</p>

          <div class="form-grid">
            <!-- Enable Toggle -->
            <div class="form-group span-2">
              <label>启用图床</label>
              <label class="checkbox-container">
                <input type="checkbox" v-model="storageConfig.enableStorage" />
                <span class="checkbox-label-text">开启剪贴板图片自动上传</span>
              </label>
              <small class="help-text">开启后，在编辑器中粘贴截图或图片将自动上传至图床并返回链接。</small>
            </div>

            <!-- Platform -->
            <div class="form-group">
              <label>存储平台</label>
              <div class="input-with-icon">
                <HardDrive class="input-icon" size="14" />
                <select v-model="storageConfig.platform" class="format-select" style="width:100%;padding-left:34px;">
                  <option value="aliyun-oss">阿里云 OSS</option>
                  <option value="tencent-cos">腾讯云 COS</option>
                  <option value="qiniu-kodo">七牛云 Kodo</option>
                  <option value="upyun-uss">又拍云 USS</option>
                  <option value="huawei-obs">华为云 OBS</option>
                  <option value="github">GitHub</option>
                  <option value="custom-s3">自定义 S3</option>
                </select>
              </div>
            </div>

            <!-- Domain -->
            <div class="form-group">
              <label>访问域名</label>
              <div class="input-with-icon">
                <Globe class="input-icon" size="14" />
                <input type="text" v-model="storageConfig.domain" placeholder="https://your-domain.com 或 CDN 加速域名" />
              </div>
              <small class="help-text">上传后生成的图片 URL 前缀，通常为 CDN 或 Bucket 域名</small>
            </div>

            <!-- Access Key -->
            <div class="form-group">
              <label>Access Key</label>
              <div class="input-with-icon">
                <input type="text" v-model="storageConfig.accessKey" placeholder="LTAIsFh65Dp3aqv9" style="padding-left:12px;" />
              </div>
            </div>

            <!-- Secret Key -->
            <div class="form-group">
              <label>Secret Key</label>
              <div class="input-with-icon secret-input-wrap">
                <input
                  :type="showSecretKey ? 'text' : 'password'"
                  v-model="storageConfig.secretKey"
                  placeholder="输入 Secret Key"
                  class="secret-input"
                />
                <button class="secret-toggle-btn" @click="showSecretKey = !showSecretKey" type="button">
                  <Eye v-if="!showSecretKey" size="14" />
                  <EyeOff v-else size="14" />
                </button>
              </div>
            </div>

            <!-- EndPoint -->
            <div class="form-group">
              <label>EndPoint</label>
              <div class="input-with-icon">
                <Globe class="input-icon" size="14" />
                <input type="text" v-model="storageConfig.endPoint" placeholder="oss-cn-beijing.aliyuncs.com" />
              </div>
              <small class="help-text">存储服务地域节点，如 oss-cn-beijing.aliyuncs.com</small>
            </div>

            <!-- Bucket Name -->
            <div class="form-group">
              <label>Bucket 名称</label>
              <div class="input-with-icon">
                <HardDrive class="input-icon" size="14" />
                <input type="text" v-model="storageConfig.bucketName" placeholder="firebook" />
              </div>
            </div>

            <!-- Base Path -->
            <div class="form-group">
              <label>文件路径前缀 (Base Path)</label>
              <div class="input-with-icon">
                <UploadCloud class="input-icon" size="14" />
                <input type="text" v-model="storageConfig.basePath" placeholder="blog/images（可选）" />
              </div>
              <small class="help-text">上传后的文件将保存在此目录下，如 blog/images</small>
            </div>

            <!-- Action Buttons -->
            <div class="form-group span-2 storage-actions">
              <button @click="handleTestConnection" class="btn-test-connection" :class="storageTestResult" :disabled="storageTestResult === 'testing'">
                <Wifi v-if="storageTestResult !== 'testing'" size="14" />
                <span v-if="storageTestResult === ''">测试连接</span>
                <span v-else-if="storageTestResult === 'testing'">测试中...</span>
                <span v-else-if="storageTestResult === 'success'">✓ 连接成功</span>
                <span v-else-if="storageTestResult === 'error'">✗ 连接失败</span>
              </button>
              <button @click="handleStorageSave" class="btn-save-storage">
                <Save size="14" />
                <span>保存图床配置</span>
              </button>
            </div>

            <!-- Test result message -->
            <div v-if="storageTestMsg" class="form-group span-2">
              <div class="test-result-msg" :class="storageTestResult">{{ storageTestMsg }}</div>
            </div>
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
                开启后，NiceMD 将直接通过后台 API 默默创建草稿并返回编辑链接，完全不在浏览器中打开任何新窗口。如果关闭，则使用原来的方式：在新标签页拉起页面并模拟手动填装。
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
            <span v-else-if="saveStatus === 'success'">配置已同步到插件 ✨</span>
            <span v-else-if="saveStatus === 'error'">同步失败</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
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

.modal-card {
  background: var(--bg-editor);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* Card slides up inside the fading overlay */
.modal-enter-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.25s ease;
}
.modal-leave-active .modal-card {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.modal-enter-from .modal-card {
  transform: translateY(24px);
  opacity: 0;
}
.modal-leave-to .modal-card {
  transform: translateY(12px);
  opacity: 0;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.01);
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-area h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.btn-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
}

.settings-card {
  width: 820px;
  max-width: 95vw;
  height: 620px;
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
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.01);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #88888e;
}

.status-dot.is-connected {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary-action {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.btn-secondary-action:hover {
  background: rgba(0,0,0,0.03);
  color: var(--text-main);
}

.btn-save-settings {
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
}

.btn-save-settings:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-save-settings:active {
  transform: translateY(1px);
}

.btn-save-settings.success {
  background: #10b981;
  color: white;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 10px 12px;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 4px;
}

.checkbox-container input {
  cursor: pointer;
  accent-color: var(--accent-color);
  width: 16px;
  height: 16px;
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

.storage-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: -12px;
  margin-bottom: 12px;
  line-height: 1.5;
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
  margin-top: 6px;
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
