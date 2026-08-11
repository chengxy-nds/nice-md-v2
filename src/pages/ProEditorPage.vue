<script setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';
import {
  Sparkles,
  Image as LucideImage,
  MoreHorizontal,
  Plus,
  Home,
  FileText,
  LayoutTemplate,
  Bot,
  Send,
  BarChart3,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Share2,
  X,
  ChevronRight,
  Bell,
  Edit3,
  ArrowRight,
  Settings,
} from 'lucide-vue-next';
import SettingsModal from '../components/SettingsModal.vue';
import { isStorageEnabled, uploadToOSS } from '../utils/fileStorage';

// ── State ──
const activeMenu = ref('我的文章');
const activeTab = ref('预览');
const showAiModal = ref(false);
const showPublishConfirm = ref(false);
const showToast = ref(false);
const toastText = ref('');
const isScheduled = ref(true);
const scheduleTime = ref('2024-07-21 18:00');
const isOriginal = ref(true);
const loaded = ref(false);
const showSettings = ref(false);
const isUploadingImage = ref(false);

onMounted(() => { setTimeout(() => { loaded.value = true; }, 50); });

const articleTitle = ref('为什么大模型不设计成带有记忆的？');

const articleContent = ref(`# 为什么大模型不设计成带有记忆的？

## 先说结论

不是不想，而是不能。记忆这件事，远比我们想象的要复杂。

## 记忆带来的问题

- 隐私和安全问题
- 计算资源消耗巨大
- 容易产生偏见和幻觉
- 准以保证记忆的准确性

\`\`\`python
def memory_module(query, history):
    if not history:
        return "无记忆"
    return f"基于历史: {history} 回答 {query}"
\`\`\`

## 更好的解决方案

与其让大模型自己拥有记忆，不如让外部系统来管理记忆。`);

const recentArticles = ref([
  { id: 1, title: '为什么大模型不设计成带有记忆的？', time: '今天 14:30', active: true, color: '#FF6B4A' },
  { id: 2, title: 'RAG 系统实战经验总结', time: '今天 10:21', active: false, color: '#2563EB' },
  { id: 3, title: '微技术公众号的运营思路...', time: '昨天 16:45', active: false, color: '#8B5CF6' },
  { id: 4, title: '如何写出高质量的技术文章', time: '前天 09:18', active: false, color: '#10B981' },
]);

const platforms = ref([
  { id: 'wechat', name: '微信公众号', connected: true, checked: true, color: '#07C160', icon: '📱' },
  { id: 'zhihu', name: '知乎', connected: true, checked: true, color: '#0084FF', icon: '💡' },
  { id: 'juejin', name: '掘金', connected: true, checked: true, color: '#1E80FF', icon: '💎' },
  { id: 'csdn', name: 'CSDN', connected: false, checked: false, color: '#FC5531', icon: '🔷' },
  { id: 'medium', name: 'Medium', connected: false, checked: false, color: '#000000', icon: 'M' },
]);

const selectedCount = computed(() => platforms.value.filter(p => p.checked && p.connected).length);

const renderedHtml = computed(() => {
  try { return marked.parse(articleContent.value); }
  catch { return ''; }
});

const wordCount = computed(() => articleContent.value.length);

function toast(msg) {
  toastText.value = msg;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 2400);
}

function selectArticle(art) {
  recentArticles.value.forEach(a => (a.active = a.id === art.id));
  articleTitle.value = art.title;
}

function handleAiPolish(style) {
  showAiModal.value = false;
  toast(`已按「${style}」风格完成润色`);
}

function handlePublish() {
  const targets = platforms.value.filter(p => p.checked && p.connected);
  if (!targets.length) { toast('请至少选择一个已连接的发布平台'); return; }
  showPublishConfirm.value = true;
}

// ── Image paste → OSS upload ──
async function handleEditorPaste(e) {
  if (!isStorageEnabled()) return;

  const items = e.clipboardData?.items;
  if (!items) return;

  let imageFile = null;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      imageFile = item.getAsFile();
      break;
    }
  }
  if (!imageFile) return;

  e.preventDefault();

  const textarea = e.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const placeholder = '![⏳ 正在上传图片...]()';
  const before = articleContent.value.slice(0, start);
  const after = articleContent.value.slice(end);
  articleContent.value = before + '\n' + placeholder + '\n' + after;

  isUploadingImage.value = true;

  try {
    const url = await uploadToOSS(imageFile, {});
    articleContent.value = articleContent.value.replace(
      placeholder,
      `![图片](${url})`,
    );
    toast('图片已上传到 OSS ✓');
  } catch (err) {
    articleContent.value = articleContent.value.replace('\n' + placeholder + '\n', '');
    toast('上传失败: ' + err.message);
  } finally {
    isUploadingImage.value = false;
  }
}
</script>

<template>
  <div class="app-shell" :class="{ loaded }">
    <!-- Toast -->
    <Transition name="toast-anim">
      <div v-if="showToast" class="toast-bar">{{ toastText }}</div>
    </Transition>

    <!-- ═══ TOP HEADER BAR ═══ -->
    <header class="top-bar">
      <!-- Left: macOS dots + Logo -->
      <div class="top-left">
        <div class="mac-dots">
          <span class="dot dot-r"></span>
          <span class="dot dot-y"></span>
          <span class="dot dot-g"></span>
        </div>
        <div class="logo-group">
          <span class="logo-text">十万个Why</span>
          <span class="logo-pro">Pro</span>
        </div>
      </div>

      <!-- Center: Toolbar -->
      <div class="toolbar-center">
        <button class="tool-btn accent" @click="showAiModal = true">
          <Sparkles :size="15" />
          <span>AI 润色</span>
        </button>
        <button class="tool-btn" @click="toast('智能排版已应用')">
          <Edit3 :size="15" />
          <span>智能排版</span>
        </button>
        <button class="tool-btn" @click="toast('插入图片')">
          <LucideImage :size="15" />
          <span>插入图片</span>
        </button>
        <button class="tool-btn" @click="toast('封面生成中...')">
          <LucideImage :size="15" />
          <span>生成封面</span>
        </button>
        <button class="tool-btn" @click="toast('更多工具')">
          <MoreHorizontal :size="15" />
          <span>更多工具</span>
        </button>
      </div>

      <!-- Right: Publish + User -->
      <div class="top-right">
        <button class="publish-btn" @click="handlePublish">
          <Send :size="14" />
          <span>发布</span>
        </button>
        <button class="icon-btn settings-gear-btn" @click="showSettings = true" title="设置">
          <Settings :size="16" />
        </button>
        <img
          class="user-avatar"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop"
          alt="avatar"
        />
        <span class="user-name">小富</span>
        <button class="icon-btn"><Bell :size="16" /></button>
      </div>
    </header>

    <!-- ═══ MAIN WORKSPACE ═══ -->
    <div class="workspace">

      <!-- ── LEFT SIDEBAR (260px) ── -->
      <aside class="sidebar">
        <nav class="nav-menu">
          <div
            v-for="item in [
              { name: '首页', icon: Home },
              { name: '我的文章', icon: FileText },
              { name: '模板中心', icon: LayoutTemplate },
              { name: 'AI 助手', icon: Bot },
              { name: '发布管理', icon: Send },
              { name: '数据分析', icon: BarChart3 },
            ]"
            :key="item.name"
            class="nav-item"
            :class="{ active: activeMenu === item.name }"
            @click="activeMenu = item.name"
          >
            <span v-if="activeMenu === item.name" class="nav-active-bar"></span>
            <component :is="item.icon" :size="16" class="nav-icon" />
            <span class="nav-label">{{ item.name }}</span>
          </div>
        </nav>

        <!-- Recent -->
        <div class="recent-block">
          <div class="recent-header">
            <span>最近编辑</span>
            <Plus :size="14" class="recent-plus" @click="toast('已创建新文档')" />
          </div>
          <div class="recent-list">
            <div
              v-for="art in recentArticles"
              :key="art.id"
              class="recent-card"
              :class="{ active: art.active }"
              @click="selectArticle(art)"
            >
              <div class="rc-thumb" :style="{ background: art.color }">
                <FileText :size="14" style="color:#fff" />
              </div>
              <div class="rc-info">
                <div class="rc-title">{{ art.title }}</div>
                <div class="rc-time">{{ art.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Card -->
        <div class="ai-card">
          <div class="ai-card-body">
            <div class="ai-card-title">AI 智能创作助手</div>
            <div class="ai-card-desc">帮你写得更好更快</div>
            <div class="ai-card-link">
              <span>立即体验</span>
              <ArrowRight :size="14" />
            </div>
          </div>
          <div class="ai-card-glow"></div>
        </div>
      </aside>

      <!-- ── CENTER DUAL PANE ── -->
      <section class="center-area">

        <!-- Title Bar (spans full center width) -->
        <div class="center-title-bar">
          <input v-model="articleTitle" class="title-input" placeholder="输入文章标题..." />
          <div class="title-bar-right">
            <span class="sync-indicator">
              <span class="sync-dot"></span>
              已保存 2 分钟前
            </span>
          </div>
        </div>

        <div class="dual-pane">
          <!-- Editor (55%) -->
          <div class="editor-pane">
            <div class="editor-scroll">
              <textarea
                v-model="articleContent"
                class="md-textarea"
                spellcheck="false"
                @paste="handleEditorPaste"
              ></textarea>
            </div>

            <!-- Floating AI Button -->
            <button class="ai-rewrite-fab" @click="showAiModal = true">
              <Sparkles :size="14" />
              <span>AI 改写</span>
            </button>

            <!-- Editor Footer -->
            <div class="editor-footer">
              <span>Markdown</span>
              <span class="footer-dot">·</span>
              <span>{{ wordCount }} 字</span>
            </div>
          </div>

          <!-- Preview (45%) -->
          <div class="preview-pane">
            <!-- Tabs -->
            <div class="preview-tabs">
              <button
                v-for="tab in ['预览', '微信公众号', '知乎', '掘金', '博客']"
                :key="tab"
                class="pv-tab"
                :class="{ active: activeTab === tab }"
                @click="activeTab = tab"
              >{{ tab }}</button>
            </div>

            <!-- Article Reader -->
            <div class="preview-scroll">
              <article class="reader-view">
                <h1 class="rv-title">{{ articleTitle }}</h1>
                <div class="rv-meta">
                  <img
                    class="rv-avatar"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop"
                    alt="author"
                  />
                  <div class="rv-meta-text">
                    <span class="rv-author">程序员小富</span>
                    <span class="rv-date">2024-07-21 10:30 北京</span>
                  </div>
                </div>
                <div class="rv-body" v-html="renderedHtml"></div>
              </article>
            </div>

            <!-- Preview Footer -->
            <div class="preview-footer">
              <span>字数统计: {{ wordCount }}</span>
              <span class="footer-dot">·</span>
              <span>预计阅读: 4 分钟</span>
              <span class="footer-dot">·</span>
              <span class="seo-ok">SEO 优化建议 ✓</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── RIGHT PUBLISH PANEL (280px) ── -->
      <aside class="publish-panel">
        <!-- Platforms -->
        <div class="pp-section">
          <div class="pp-header">
            <span class="pp-title">发布平台</span>
            <span class="pp-manage">管理</span>
          </div>
          <div class="pp-list">
            <div
              v-for="p in platforms"
              :key="p.id"
              class="pp-item"
            >
              <div class="pp-item-left">
                <span class="pp-icon" :style="{ background: p.color }">{{ p.icon }}</span>
                <span class="pp-name">{{ p.name }}</span>
              </div>
              <label v-if="p.connected" class="toggle">
                <input type="checkbox" v-model="p.checked" />
                <span class="toggle-track"></span>
              </label>
              <button v-else class="connect-btn">连接</button>
            </div>
          </div>
        </div>

        <div class="pp-divider"></div>

        <!-- Settings -->
        <div class="pp-section">
          <div class="pp-header">
            <span class="pp-title">发布设置</span>
          </div>

          <div class="pp-setting">
            <span class="pp-set-label">定时发布</span>
            <label class="toggle">
              <input type="checkbox" v-model="isScheduled" />
              <span class="toggle-track"></span>
            </label>
          </div>
          <Transition name="slide-fade">
            <div v-if="isScheduled" class="pp-time-row">
              <Calendar :size="14" class="pp-cal-icon" />
              <input v-model="scheduleTime" class="pp-time-input" />
            </div>
          </Transition>

          <div class="pp-setting">
            <span class="pp-set-label">原创声明</span>
            <label class="toggle">
              <input type="checkbox" v-model="isOriginal" />
              <span class="toggle-track"></span>
            </label>
          </div>

          <!-- Cover -->
          <div class="pp-cover-label">文章封面</div>
          <div class="pp-cover-img">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"
              alt="cover"
            />
          </div>
        </div>

        <!-- CTA -->
        <button class="cta-btn" @click="handlePublish">
          一键发布（{{ selectedCount }}）
          <ArrowRight :size="16" />
        </button>
      </aside>
    </div>

    <!-- ═══ AI MODAL ═══ -->
    <Transition name="modal-anim">
      <div v-if="showAiModal" class="modal-mask" @click.self="showAiModal = false">
        <div class="modal-card">
          <div class="modal-top">
            <h3>AI 润色</h3>
            <button class="modal-close" @click="showAiModal = false"><X :size="18" /></button>
          </div>
          <p class="modal-desc">选择一种风格来优化文章表达：</p>
          <div class="modal-grid">
            <button v-for="opt in [
              { label: '专业严谨', sub: '强化术语与逻辑深度' },
              { label: '轻量易读', sub: '适合公众号阅读' },
              { label: '知乎问答', sub: '直入主题硬核风格' },
              { label: '语法修正', sub: '修复错别字与标点' },
            ]" :key="opt.label" class="opt-btn" @click="handleAiPolish(opt.label)">
              <div class="opt-label">{{ opt.label }}</div>
              <div class="opt-sub">{{ opt.sub }}</div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ PUBLISH CONFIRM ═══ -->
    <Transition name="modal-anim">
      <div v-if="showPublishConfirm" class="modal-mask" @click.self="showPublishConfirm = false">
        <div class="confirm-card">
          <CheckCircle2 :size="48" class="confirm-icon" />
          <h3>发布成功</h3>
          <p>
            《{{ articleTitle }}》已分发至
            {{ platforms.filter(p => p.checked && p.connected).map(p => p.name).join('、') }}
          </p>
          <button class="confirm-btn" @click="showPublishConfirm = false">完成</button>
        </div>
      </div>
    </Transition>

    <!-- ── SETTINGS MODAL ── -->
    <SettingsModal :is-open="showSettings" @close="showSettings = false" />
  </div>
</template>

<style scoped>
/* ════════════════════════════════════════════════════════
   DESIGN TOKENS
   ════════════════════════════════════════════════════════ */
:root {
  --bg: #F5F5F5;
  --surface: #FFFFFF;
  --border: #EAEDF2;
  --text-1: #1A1D26;
  --text-2: #5C6370;
  --text-3: #9CA3AF;
  --accent: #FF6B4A;
  --accent-light: #FFF0EC;
  --blue: #2563EB;
  --blue-light: #EEF2FF;
  --purple: #8B5CF6;
  --green: #22C55E;
  --radius: 14px;
  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
}

/* ════════════════════════════════════════════════════════
   SHELL
   ════════════════════════════════════════════════════════ */
.app-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font);
  color: var(--text-1);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity .4s ease, transform .4s ease;
}
.app-shell.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* ── Toast ── */
.toast-bar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: var(--text-1);
  color: #FFF;
  padding: 8px 24px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 8px 28px rgba(0,0,0,.2);
  pointer-events: none;
}
.toast-anim-enter-active, .toast-anim-leave-active { transition: all .25s ease; }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }

/* ════════════════════════════════════════════════════════
   TOP BAR
   ════════════════════════════════════════════════════════ */
.top-bar {
  height: 52px;
  flex-shrink: 0;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  user-select: none;
  -webkit-app-region: drag;
}

/* macOS dots */
.mac-dots {
  display: flex;
  gap: 7px;
  margin-right: 16px;
  -webkit-app-region: no-drag;
}
.dot {
  width: 12px; height: 12px;
  border-radius: 50%;
}
.dot-r { background: #FF5F57; }
.dot-y { background: #FEBC2E; }
.dot-g { background: #28C840; }

.top-left {
  display: flex;
  align-items: center;
  gap: 0;
  min-width: 200px;
}
.logo-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.logo-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -.3px;
}
.logo-pro {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--text-1);
  color: #FFF;
  letter-spacing: .4px;
}

/* Center Toolbar */
.toolbar-center {
  display: flex;
  align-items: center;
  gap: 2px;
  -webkit-app-region: no-drag;
}
.tool-btn {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: background .12s, color .12s;
  font-family: var(--font);
}
.tool-btn:hover { background: #F3F4F6; color: var(--text-1); }
.tool-btn.accent { color: var(--accent); font-weight: 600; }
.tool-btn.accent:hover { background: var(--accent-light); }

/* Right */
.top-right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
  justify-content: flex-end;
  -webkit-app-region: no-drag;
}
.publish-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: #FFF;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 107, 74, .3);
  transition: transform .12s, box-shadow .12s;
  font-family: var(--font);
}
.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255, 107, 74, .4);
}
.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
}
.icon-btn {
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.icon-btn:hover { color: var(--text-1); }

/* ════════════════════════════════════════════════════════
   WORKSPACE
   ════════════════════════════════════════════════════════ */
.workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ════════════════════════════════════════════════════════
   SIDEBAR
   ════════════════════════════════════════════════════════ */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.nav-item {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  position: relative;
  transition: background .1s, color .1s;
}
.nav-item:hover { background: #F5F6F8; color: var(--text-1); }
.nav-item.active {
  background: var(--blue-light);
  color: var(--blue);
  font-weight: 600;
}
.nav-active-bar {
  position: absolute;
  left: 0;
  top: 50%; transform: translateY(-50%);
  width: 3px; height: 18px;
  border-radius: 0 3px 3px 0;
  background: var(--blue);
}
.nav-icon { flex-shrink: 0; }

/* Recent */
.recent-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: .5px;
  padding: 0 4px;
  margin-bottom: 8px;
}
.recent-plus { cursor: pointer; color: var(--text-3); }
.recent-plus:hover { color: var(--text-1); }

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}
.recent-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .1s;
}
.recent-card:hover { background: #F5F6F8; }
.recent-card.active { background: var(--accent-light); }

.rc-thumb {
  width: 30px; height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rc-info { flex: 1; min-width: 0; }
.rc-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rc-time {
  font-size: 10px;
  color: var(--text-3);
  margin-top: 1px;
}

/* AI Card */
.ai-card {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFF0EC 0%, #FFDED4 100%);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.ai-card-body { position: relative; z-index: 1; }
.ai-card-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-1);
}
.ai-card-desc {
  font-size: 11px;
  color: var(--text-2);
  margin-top: 2px;
}
.ai-card-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
}
.ai-card-glow {
  position: absolute;
  bottom: -10px; right: -10px;
  width: 50px; height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,107,74,.4), transparent 70%);
  filter: blur(8px);
  animation: glow-pulse 3s ease-in-out infinite alternate;
}
@keyframes glow-pulse {
  0% { opacity: .5; transform: scale(.9); }
  100% { opacity: 1; transform: scale(1.3); }
}

/* ════════════════════════════════════════════════════════
   CENTER AREA
   ════════════════════════════════════════════════════════ */
.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}
.center-title-bar {
  height: 44px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
.title-input {
  border: none;
  outline: none;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
  background: transparent;
  width: 50%;
  font-family: var(--font);
}
.title-input::placeholder { color: var(--text-3); }
.title-bar-right { display: flex; align-items: center; gap: 12px; }
.sync-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-3);
}
.sync-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px rgba(34,197,94,.5);
}

/* Dual Pane */
.dual-pane {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* Editor Pane */
.editor-pane {
  flex: 55;
  display: flex;
  flex-direction: column;
  position: relative;
  border-right: 1px solid var(--border);
  background: var(--surface);
}
.editor-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.md-textarea {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
  outline: none;
  resize: none;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-1);
  background: transparent;
}

/* AI Rewrite FAB */
.ai-rewrite-fab {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(139,92,246,.3);
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(10px);
  color: var(--purple);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(139,92,246,.15);
  transition: transform .15s, box-shadow .15s;
  font-family: var(--font);
}
.ai-rewrite-fab:hover {
  transform: translateY(-50%) translateY(-2px);
  box-shadow: 0 6px 20px rgba(139,92,246,.25);
}

/* Editor Footer */
.editor-footer {
  height: 32px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-3);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface);
}

/* Preview Pane */
.preview-pane {
  flex: 45;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #FAFAFA;
}

/* Preview Tabs */
.preview-tabs {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface);
}
.pv-tab {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  cursor: pointer;
  font-family: var(--font);
  transition: background .1s, color .1s;
}
.pv-tab:hover { background: #F3F4F6; color: var(--text-1); }
.pv-tab.active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 600;
}

/* Preview Scroll */
.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
}

/* Reader View */
.reader-view {
  max-width: 560px;
}
.rv-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-1);
  line-height: 1.35;
  margin: 0 0 16px 0;
}
.rv-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.rv-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.rv-meta-text {
  display: flex;
  flex-direction: column;
}
.rv-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
}
.rv-date {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 1px;
}

/* Rendered Markdown in Preview */
.rv-body :deep(h1) {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-1);
  margin: 24px 0 12px;
  line-height: 1.3;
}
.rv-body :deep(h2) {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--accent);
  display: inline-block;
}
.rv-body :deep(h3) {
  font-size: 15px;
  font-weight: 700;
  margin: 16px 0 8px;
}
.rv-body :deep(p) {
  font-size: 14px;
  line-height: 1.75;
  color: #374151;
  margin-bottom: 12px;
}
.rv-body :deep(blockquote) {
  border-left: 3px solid var(--accent);
  padding: 10px 14px;
  margin: 14px 0;
  background: #FFF8F6;
  border-radius: 0 8px 8px 0;
  font-size: 13.5px;
  color: var(--text-2);
}
.rv-body :deep(ul), .rv-body :deep(ol) {
  padding-left: 20px;
  margin: 10px 0;
}
.rv-body :deep(li) {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
  margin-bottom: 4px;
}
.rv-body :deep(pre) {
  background: #1E293B;
  border-radius: 10px;
  padding: 16px;
  overflow-x: auto;
  margin: 14px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,.08);
}
.rv-body :deep(code) {
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.6;
}
.rv-body :deep(pre code) {
  color: #E2E8F0;
}
.rv-body :deep(:not(pre) > code) {
  background: #FFF0EC;
  color: var(--accent);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 13px;
}
.rv-body :deep(strong) {
  font-weight: 700;
  color: var(--text-1);
}
.rv-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 20px 0;
}

/* Preview Footer */
.preview-footer {
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-3);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface);
}
.seo-ok { color: var(--green); font-weight: 600; }
.footer-dot { color: var(--text-3); }

/* ════════════════════════════════════════════════════════
   RIGHT PUBLISH PANEL
   ════════════════════════════════════════════════════════ */
.publish-panel {
  width: 260px;
  flex-shrink: 0;
  background: var(--surface);
  border-left: 1px solid var(--border);
  padding: 14px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.pp-section { }
.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.pp-title { font-size: 13px; font-weight: 700; color: var(--text-1); }
.pp-manage { font-size: 11px; color: var(--text-3); cursor: pointer; }
.pp-manage:hover { color: var(--blue); }

.pp-list { display: flex; flex-direction: column; gap: 8px; }
.pp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pp-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pp-icon {
  width: 24px; height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #FFF;
}
.pp-name { font-size: 13px; font-weight: 500; color: var(--text-1); }

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 36px; height: 20px;
}
.toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-track {
  position: absolute;
  inset: 0;
  background: #D1D5DB;
  border-radius: 20px;
  cursor: pointer;
  transition: background .2s;
}
.toggle-track::before {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  left: 2px; top: 2px;
  background: #FFF;
  border-radius: 50%;
  transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}
.toggle input:checked + .toggle-track { background: var(--accent); }
.toggle input:checked + .toggle-track::before { transform: translateX(16px); }

.connect-btn {
  font-size: 11px;
  font-weight: 600;
  color: var(--blue);
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 8px;
  cursor: pointer;
}
.connect-btn:hover { background: var(--blue-light); }

.pp-divider {
  height: 1px;
  background: var(--border);
  margin: 14px 0;
}

.pp-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.pp-set-label { font-size: 13px; font-weight: 500; color: var(--text-1); }

.pp-time-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.pp-cal-icon { color: var(--text-3); flex-shrink: 0; }
.pp-time-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-1);
  width: 100%;
  font-family: var(--font);
}

.pp-cover-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
  margin-bottom: 8px;
}
.pp-cover-img {
  border-radius: 10px;
  overflow: hidden;
  height: 100px;
  margin-bottom: 12px;
}
.pp-cover-img img {
  width: 100%; height: 100%;
  object-fit: cover;
}

/* CTA */
.cta-btn {
  margin-top: auto;
  height: 48px;
  width: 100%;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF6B4A 0%, #FF4D4D 100%);
  color: #FFF;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255,107,74,.3);
  transition: transform .15s, box-shadow .15s;
  font-family: var(--font);
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(255,107,74,.4);
}

/* ════════════════════════════════════════════════════════
   MODALS
   ════════════════════════════════════════════════════════ */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0,0,0,.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  width: 440px;
  background: #FFF;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,.15);
}
.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.modal-top h3 { font-size: 17px; font-weight: 700; margin: 0; }
.modal-close {
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  padding: 2px;
}
.modal-desc {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 14px;
}
.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.opt-btn {
  padding: 14px;
  border-radius: 12px;
  background: #F9FAFB;
  border: 1px solid var(--border);
  text-align: left;
  cursor: pointer;
  transition: border-color .12s, box-shadow .12s, transform .12s;
  font-family: var(--font);
}
.opt-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 14px rgba(255,107,74,.1);
  transform: translateY(-2px);
}
.opt-label { font-size: 13px; font-weight: 700; color: var(--text-1); }
.opt-sub { font-size: 11px; color: var(--text-3); margin-top: 3px; }

/* Confirm */
.confirm-card {
  width: 380px;
  background: #FFF;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,.15);
}
.confirm-icon { color: var(--green); margin-bottom: 12px; }
.confirm-card h3 { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
.confirm-card p { font-size: 13px; color: var(--text-2); line-height: 1.5; margin-bottom: 20px; }
.confirm-btn {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: #FFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font);
}

/* Transitions */
.modal-anim-enter-active, .modal-anim-leave-active { transition: all .2s ease; }
.modal-anim-enter-from, .modal-anim-leave-to { opacity: 0; }
.modal-anim-enter-from .modal-card,
.modal-anim-enter-from .confirm-card { transform: scale(.96); }

.slide-fade-enter-active, .slide-fade-leave-active { transition: all .2s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; max-height: 0; }

/* Settings gear button */
.settings-gear-btn {
  margin-right: 4px;
}
</style>
