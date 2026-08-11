<script setup>
import { ref, computed } from 'vue';
import confetti from 'canvas-confetti';
import {
  Wand2,
  Sparkles,
  Image as ImageIcon,
  ImagePlus,
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
  Globe,
  Calendar,
  Sliders,
  Check,
  Zap,
  ChevronRight,
  RefreshCw,
  Feather,
  ShieldCheck,
  Copy,
  ThumbsUp,
  MessageSquare,
  Flame,
  Maximize2,
  Share2,
  X,
  Sparkle
} from 'lucide-vue-next';

// ── State Management ──
const activeMenu = ref('我的文章');
const activeTab = ref('预览'); // 预览 | 微信公众号 | 知乎 | 掘金 | 博客

// Articles state
const articleTitle = ref('为什么大模型不设计成带有记忆的？');
const articleContent = ref(`# 为什么大模型不设计成带有记忆的？

> 在生产环境的 LLM 架构设计中，“无状态（Stateless）”与“上下文窗口（Context Window）”的权衡一直是最核心的技术决策之一。

## 1. 为什么“记忆”不能直接硬编码在权重中？

很多人初学大模型时都有一个直觉疑问：*“为什么每次对话都要传回历史记录？不能让 Transformer 直接记在模型权重里吗？”*

从底层计算图来看，LLM 的**参数更新（Weight Update）**是一个成本极高的过程：

- **反向传播开销**：单次梯度更新需要万卡集群进行 All-Reduce 同步。
- **灾难性遗忘（Catastrophic Forgetting）**：增量微调（LoRA/SFT）极易破坏模型已有的通用推理能力。

因此，现代大模型架构选择将“记忆”解耦为**上下文（In-Context）**与**外部检索（RAG）**。

\`\`\`python
# 模拟 Transformer 内部 KV Cache 与上下文复用机制
import torch
import torch.nn.functional as F

def compute_kv_cache(q_tokens, kv_history, d_model=4096):
    """
    大模型通过 Context Window 模拟短期记忆
    KV Cache 避免重复计算历史 Token 的 Key/Value 向量
    """
    # Q: 当前输入 Token
    # K, V: 包含历史对话上下文的向量矩阵
    scores = torch.matmul(q_tokens, kv_history['K'].transpose(-1, -2)) / (d_model ** 0.5)
    attn_weights = F.softmax(scores, dim=-1)
    
    # 得到加权输出
    context_output = torch.matmul(attn_weights, kv_history['V'])
    return context_output
\`\`\`

## 2. 生产环境的“记忆”三级架构

工程实践中，我们通常采用三级存储模型来实现“伪长久记忆”：

1. **L1 缓存 (KV Cache)**: 存在于 GPU 显存，毫秒级响应，受限于 Context Length。
2. **L2 向量检索 (Vector DB)**: 基于 Milvus / Qdrant，做 Semantic Search 召回。
3. **L3 结构化图数据库 (GraphRAG)**: 存储实体与关系链，提供确定性事实依赖。

---

### 结论与展望

将大模型设计为**无状态计算引擎 + 外部有状态存储**，是兼顾扩展性、成本与确定性的最优工程解。`);

// Recent articles list
const recentArticles = ref([
  { id: 1, title: '为什么大模型不设计成带有记忆的？', time: '2 分钟前', active: true, tag: 'AI 架构' },
  { id: 2, title: 'TCP 连接池的工程陷阱与实战解构', time: '1 小时前', active: false, tag: '网络底层' },
  { id: 3, title: 'Rust 异步运行时性能调优指南', time: '昨天', active: false, tag: 'Rust' },
  { id: 4, title: '从零手写 Vite 级高频热更新模块', time: '3 天前', active: false, tag: '前端工程' },
]);

// Platforms configuration
const platforms = ref([
  { id: 'wechat', name: '微信公众号', status: '已连接', connected: true, checked: true, iconBg: '#07C160', count: '1.2w 关注' },
  { id: 'zhihu', name: '知乎', status: '已连接', connected: true, checked: true, iconBg: '#0084FF', count: '4.5w 赞同' },
  { id: 'juejin', name: '掘金', status: '已连接', connected: true, checked: true, iconBg: '#1E80FF', count: 'LV.6 创作者' },
  { id: 'csdn', name: 'CSDN', status: '未连接', connected: false, checked: false, iconBg: '#FC5531', count: '未绑定' },
  { id: 'medium', name: 'Medium', status: '已连接', connected: true, checked: false, iconBg: '#000000', count: 'Tech Publication' },
]);

// Publish settings
const isScheduled = ref(false);
const scheduleTime = ref('2026-08-05 18:00');
const isOriginal = ref(true);
const selectedCover = ref('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop');

// Selected platforms count for giant CTA
const selectedPlatformCount = computed(() => {
  return platforms.value.filter(p => p.checked && p.connected).length;
});

// AI Modal & Notifications
const showAiModal = ref(false);
const isAiGenerating = ref(false);
const showPublishModal = ref(false);
const publishStatusMessage = ref('');
const showToast = ref(false);
const toastText = ref('');

function triggerToast(text) {
  toastText.value = text;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
}

// AI Polish Action
function handleAiPolish(promptType) {
  isAiGenerating.value = true;
  setTimeout(() => {
    isAiGenerating.value = false;
    showAiModal.value = false;
    triggerToast(`✨ AI 已根据【${promptType}】成功润色文章！`);
  }, 1200);
}

// Publish Action
function handlePublish() {
  const activePlatforms = platforms.value.filter(p => p.checked && p.connected).map(p => p.name);
  if (activePlatforms.length === 0) {
    triggerToast('请至少选择一个已连接的发布平台！');
    return;
  }
  
  // Confetti effect
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  publishStatusMessage.value = `成功将文章《${articleTitle.value}》一键发布至 ${activePlatforms.join('、')}！`;
  showPublishModal.value = true;
}

// Switch article selection
function selectArticle(art) {
  recentArticles.value.forEach(a => a.active = (a.id === art.id));
  articleTitle.value = art.title;
  triggerToast(`已切换至文档：《${art.title}》`);
}

// Simple Markdown Renderer for Preview
const renderedPreviewHtml = computed(() => {
  let raw = articleContent.value;
  // Replace titles
  raw = raw.replace(/^# (.*$)/gim, '<h1 class="pv-h1">$1</h1>');
  raw = raw.replace(/^## (.*$)/gim, '<h2 class="pv-h2">$1</h2>');
  raw = raw.replace(/^### (.*$)/gim, '<h3 class="pv-h3">$1</h3>');
  // Blockquotes
  raw = raw.replace(/^> (.*$)/gim, '<blockquote class="pv-quote"><div class="pv-quote-icon">💡</div><div>$1</div></blockquote>');
  // Code block
  raw = raw.replace(/```python([\s\S]*?)```/gim, (match, p1) => {
    return `<div class="pv-code-box">
      <div class="pv-code-header">
        <div class="pv-mac-dots"><span></span><span></span><span></span></div>
        <span class="pv-code-lang">Python • 3.12</span>
        <span class="pv-code-copy">复制</span>
      </div>
      <pre><code>${escapeHtml(p1.trim())}</code></pre>
    </div>`;
  });
  // Lists
  raw = raw.replace(/^- (.*$)/gim, '<li class="pv-li">$1</li>');
  raw = raw.replace(/(<li class="pv-li">.*<\/li>)/gim, '<ul class="pv-ul">$1</ul>');
  // Bold & Italic
  raw = raw.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  raw = raw.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  // Paragraphs
  const paragraphs = raw.split('\n\n').map(p => {
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<div') || p.startsWith('<ul')) return p;
    return `<p class="pv-p">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return paragraphs;
});

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
</script>

<template>
  <div class="saas-app-root">
    <!-- background subtle glow gradients -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- Toast Floating Alert -->
    <Transition name="fade-slide">
      <div v-if="showToast" class="floating-toast">
        <Sparkles class="toast-icon" />
        <span>{{ toastText }}</span>
      </div>
    </Transition>

    <!-- TOP FLOATING HEADER (72px) -->
    <header class="floating-header">
      <!-- Logo Area -->
      <div class="header-logo-group">
        <div class="logo-mark">
          <Sparkle class="logo-sparkle" />
        </div>
        <div class="logo-text">
          <span class="brand-name">十万个Why</span>
          <span class="pro-tag">Pro</span>
        </div>
      </div>

      <!-- Center Toolbar -->
      <div class="header-toolbar">
        <button class="tb-btn highlight" @click="showAiModal = true">
          <Wand2 class="tb-icon text-indigo" />
          <span>AI润色</span>
        </button>
        <button class="tb-btn" @click="triggerToast('已应用自动智能排版（符合排版规范）')">
          <Sparkles class="tb-icon text-blue" />
          <span>智能排版</span>
        </button>
        <button class="tb-btn" @click="triggerToast('已准备插入 Markdown 图片')">
          <ImageIcon class="tb-icon text-emerald" />
          <span>插入图片</span>
        </button>
        <button class="tb-btn" @click="triggerToast('AI 正在为您实时生成专属技术封面...')">
          <ImagePlus class="tb-icon text-purple" />
          <span>生成封面</span>
        </button>
        <div class="tb-divider"></div>
        <button class="tb-btn icon-only" @click="triggerToast('更多格式与调试工具')">
          <MoreHorizontal class="tb-icon" />
        </button>
      </div>

      <!-- Right User Controls -->
      <div class="header-user-actions">
        <div class="cloud-sync-badge">
          <span class="sync-dot"></span>
          <span>云端实时已同步</span>
        </div>
        <div class="user-avatar">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="User Avatar" />
        </div>
      </div>
    </header>

    <!-- MAIN WORKING AREA (100vh minus header spacing) -->
    <main class="app-workspace">
      
      <!-- 1. LEFT SIDEBAR (260px) - Apple Finder Glassmorphism Style -->
      <aside class="finder-sidebar">
        <!-- New Article Button -->
        <button class="new-article-btn" @click="triggerToast('已新建空白创作文档')">
          <Plus class="btn-plus-icon" />
          <span>+ 新建文章</span>
        </button>

        <!-- Main Navigation Menu -->
        <nav class="sidebar-nav">
          <div
            v-for="item in [
              { name: '首页', icon: Home },
              { name: '我的文章', icon: FileText },
              { name: '模板中心', icon: LayoutTemplate },
              { name: 'AI助手', icon: Bot },
              { name: '发布管理', icon: Send },
              { name: '数据分析', icon: BarChart3 }
            ]"
            :key="item.name"
            class="nav-item"
            :class="{ active: activeMenu === item.name }"
            @click="activeMenu = item.name"
          >
            <div class="nav-indicator" v-if="activeMenu === item.name"></div>
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-label">{{ item.name }}</span>
          </div>
        </nav>

        <!-- Recent Articles List -->
        <div class="recent-section">
          <div class="section-title">
            <span>最近编辑</span>
            <Clock class="title-icon" />
          </div>
          <div class="recent-list">
            <div
              v-for="art in recentArticles"
              :key="art.id"
              class="recent-card"
              :class="{ active: art.active }"
              @click="selectArticle(art)"
            >
              <div class="card-thumb">
                <FileText class="thumb-icon" />
              </div>
              <div class="card-info">
                <div class="card-title">{{ art.title }}</div>
                <div class="card-meta">
                  <span class="card-time">{{ art.time }}</span>
                  <span class="card-tag">{{ art.tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom AI Assistant Promo Card -->
        <div class="ai-promo-card">
          <div class="ai-orb"></div>
          <div class="ai-card-content">
            <div class="ai-badge">
              <Zap class="zap-icon" />
              <span>GPT-5 Pro Engine</span>
            </div>
            <h4 class="ai-card-title">AI 智能创作助手</h4>
            <p class="ai-card-desc">帮你写出更好的技术文章与深度解构</p>
          </div>
        </div>
      </aside>

      <!-- 2. CENTER WORKSPACE (Dual Panel: 55% Editor + 45% Live Preview) -->
      <section class="editor-workspace-container">
        
        <!-- Left: Markdown Editor (55%) -->
        <div class="editor-pane">
          <!-- Editor Header / Title bar -->
          <div class="editor-header">
            <input
              v-model="articleTitle"
              type="text"
              class="article-title-input"
              placeholder="输入文章标题..."
            />
            <div class="editor-word-count">
              <span>{{ articleContent.length }} 字</span>
              <span class="dot">•</span>
              <span>预计阅读 8 分钟</span>
            </div>
          </div>

          <!-- Markdown Content Area -->
          <div class="editor-body">
            <textarea
              v-model="articleContent"
              class="markdown-textarea"
              placeholder="开始你的创作..."
              spellcheck="false"
            ></textarea>

            <!-- Floating AI Rewrite Glass Button -->
            <button class="floating-ai-rewrite-btn" @click="showAiModal = true">
              <Sparkles class="sparkle-glow-icon" />
              <span>✨ AI 改写与提炼</span>
            </button>
          </div>
        </div>

        <!-- Right: Live Preview Panel (45%) -->
        <div class="preview-pane">
          <!-- Preview Header Tabs -->
          <div class="preview-header-tabs">
            <div
              v-for="tab in ['预览', '微信公众号', '知乎', '掘金', '博客']"
              :key="tab"
              class="preview-tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              <span>{{ tab }}</span>
            </div>
          </div>

          <!-- Real Reader View Simulator -->
          <div class="preview-scroll-container">
            <div class="reader-article-card" :class="`theme-${activeTab}`">
              <!-- Platform Specific Header -->
              <div class="reader-meta-header">
                <h1 class="reader-title">{{ articleTitle }}</h1>
                <div class="reader-author-bar">
                  <div class="author-avatar-wrap">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="Author" />
                    <span class="verified-badge">✓</span>
                  </div>
                  <div class="author-meta-info">
                    <div class="author-name-row">
                      <span class="author-name">小富 Code</span>
                      <span class="platform-badge" v-if="activeTab === '微信公众号'">公众号主理人</span>
                      <span class="platform-badge zhihu-badge" v-else-if="activeTab === '知乎'">知乎优秀答主</span>
                      <span class="platform-badge juejin-badge" v-else-if="activeTab === '掘金'">掘金 LV.6</span>
                    </div>
                    <div class="publish-time-line">
                      <span>2026-08-05 10:00</span>
                      <span>•</span>
                      <span>资深 AI 架构师</span>
                      <span>•</span>
                      <span class="original-pill">原创保护</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Article Body Content -->
              <div class="reader-body" v-html="renderedPreviewHtml"></div>

              <!-- Reader Footer Actions -->
              <div class="reader-footer-bar">
                <button class="rf-btn"><ThumbsUp class="rf-icon" /> <span>2,480</span></button>
                <button class="rf-btn"><MessageSquare class="rf-icon" /> <span>312 讨论</span></button>
                <button class="rf-btn"><Share2 class="rf-icon" /> <span>分享</span></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. FAR-RIGHT PUBLISH PANEL (300px) -->
      <aside class="publish-panel">
        <div class="publish-panel-inner">
          <div class="panel-section-title">
            <Send class="title-send-icon" />
            <span>发布平台</span>
          </div>

          <!-- Platforms List -->
          <div class="platform-list">
            <div
              v-for="plat in platforms"
              :key="plat.id"
              class="platform-item"
              :class="{ disabled: !plat.connected }"
            >
              <div class="platform-left">
                <div class="platform-icon" :style="{ backgroundColor: plat.iconBg }">
                  <span>{{ plat.name[0] }}</span>
                </div>
                <div class="platform-details">
                  <div class="platform-name">{{ plat.name }}</div>
                  <div class="platform-status">
                    <span class="status-dot" :class="{ connected: plat.connected }"></span>
                    <span class="status-text">{{ plat.status }}</span>
                  </div>
                </div>
              </div>

              <div class="platform-right">
                <label class="switch-toggle" v-if="plat.connected">
                  <input type="checkbox" v-model="plat.checked" />
                  <span class="slider"></span>
                </label>
                <button v-else class="connect-link-btn" @click="plat.connected = true; plat.status = '已连接'; plat.checked = true; triggerToast(`已成功授权连接 ${plat.name}！`)">
                  授权
                </button>
              </div>
            </div>
          </div>

          <div class="panel-divider"></div>

          <!-- Publish Settings -->
          <div class="panel-section-title">
            <Sliders class="title-send-icon" />
            <span>发布设置</span>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">定时发布</div>
              <div class="setting-sub">在指定高流量时段自动群发</div>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" v-model="isScheduled" />
              <span class="slider"></span>
            </label>
          </div>

          <Transition name="fade">
            <div v-if="isScheduled" class="time-picker-box">
              <Calendar class="cal-icon" />
              <input type="text" v-model="scheduleTime" class="time-input" />
            </div>
          </Transition>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">原创声明</div>
              <div class="setting-sub">开启全网首发首创版权保护</div>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" v-model="isOriginal" />
              <span class="slider"></span>
            </label>
          </div>

          <!-- Cover Image Picker -->
          <div class="cover-picker-box">
            <div class="cover-header">
              <span class="cover-title">文章封面</span>
              <button class="re-gen-btn" @click="selectedCover = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop'; triggerToast('AI 已重新合成全新极简科技封面')">
                <RefreshCw class="spin-icon" /> AI重构
              </button>
            </div>
            <div class="cover-preview-img">
              <img :src="selectedCover" alt="Cover" />
              <div class="cover-overlay">
                <Sparkles class="overlay-sparkle" />
                <span>AI 智能匹配画风</span>
              </div>
            </div>
          </div>

          <!-- Giant Coral CTA Button (52px) -->
          <button class="giant-publish-cta" @click="handlePublish">
            <Send class="cta-send-icon" />
            <span>一键发布 ({{ selectedPlatformCount }})</span>
          </button>
        </div>
      </aside>
    </main>

    <!-- AI POLISH MODAL POPUP -->
    <Transition name="modal-fade">
      <div v-if="showAiModal" class="modal-backdrop" @click.self="showAiModal = false">
        <div class="ai-modal-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <Wand2 class="modal-wand-icon" />
              <h3>AI 深度润色与排版调优</h3>
            </div>
            <button class="close-btn" @click="showAiModal = false"><X /></button>
          </div>
          
          <div class="modal-body">
            <p class="modal-desc">选定你需要优化调整的目标表达风格：</p>
            <div class="ai-preset-grid">
              <button class="preset-card" @click="handleAiPolish('更专业严谨')">
                <ShieldCheck class="preset-icon text-indigo" />
                <div class="preset-name">更专业严谨</div>
                <div class="preset-sub">强化架构术语与逻辑深度</div>
              </button>
              <button class="preset-card" @click="handleAiPolish('公众号轻量风')">
                <Feather class="preset-icon text-emerald" />
                <div class="preset-name">公众号轻量风</div>
                <div class="preset-sub">增加留白与通俗类比句</div>
              </button>
              <button class="preset-card" @click="handleAiPolish('知乎硬核问答')">
                <Zap class="preset-icon text-blue" />
                <div class="preset-name">知乎硬核问答</div>
                <div class="preset-sub">直入主题+对比图表句表述</div>
              </button>
              <button class="preset-card" @click="handleAiPolish('一键语法纠错')">
                <CheckCircle2 class="preset-icon text-purple" />
                <div class="preset-name">一键语法纠错</div>
                <div class="preset-sub">修复错别字与标点规范</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- PUBLISH SUCCESS MODAL -->
    <Transition name="modal-fade">
      <div v-if="showPublishModal" class="modal-backdrop" @click.self="showPublishModal = false">
        <div class="success-modal-card">
          <div class="success-icon-badge">
            <CheckCircle2 class="success-check-icon" />
          </div>
          <h3>多平台内容分发成功！</h3>
          <p class="success-msg">{{ publishStatusMessage }}</p>
          <div class="success-actions">
            <button class="success-confirm-btn" @click="showPublishModal = false">完成分发</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── DESIGN SYSTEM & HIGH-END SAAS STYLES ── */
.saas-app-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #FAFAFA;
  background-image: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.04) 0px, transparent 50%),
                    radial-gradient(at 100% 100%, rgba(238, 242, 255, 0.5) 0px, transparent 50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1E293B;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

/* Background Animated Orbs */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}
.bg-glow-1 {
  width: 450px;
  height: 450px;
  top: -100px;
  left: 20%;
  background: rgba(99, 102, 241, 0.06);
}
.bg-glow-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  right: 15%;
  background: rgba(255, 122, 89, 0.05);
}

/* Floating Toast */
.floating-toast {
  position: fixed;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: rgba(15, 23, 42, 0.9);
  color: #FFFFFF;
  padding: 10px 22px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.toast-icon {
  width: 18px;
  height: 18px;
  color: #FF7A59;
}

/* ── HEADER (72px) ── */
.floating-header {
  height: 72px;
  margin: 12px 16px 0 16px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  flex-shrink: 0;
}

.header-logo-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}
.logo-sparkle {
  width: 20px;
  height: 20px;
}
.logo-text {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.4px;
}
.pro-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2563EB, #8B5CF6);
  color: #FFFFFF;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Header Toolbar */
.header-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(241, 245, 249, 0.6);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid rgba(203, 213, 225, 0.4);
}
.tb-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tb-btn:hover {
  background: #FFFFFF;
  color: #0F172A;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}
.tb-btn.highlight {
  background: #FFFFFF;
  color: #2563EB;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.1);
}
.tb-btn.icon-only {
  padding: 0 10px;
}
.tb-icon {
  width: 17px;
  height: 17px;
}
.text-indigo { color: #6366F1; }
.text-blue { color: #2563EB; }
.text-emerald { color: #10B981; }
.text-purple { color: #8B5CF6; }
.tb-divider {
  width: 1px;
  height: 20px;
  background: #CBD5E1;
  margin: 0 2px;
}

/* User Actions */
.header-user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.cloud-sync-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
  background: rgba(241, 245, 249, 0.8);
  padding: 6px 12px;
  border-radius: 99px;
  border: 1px solid #E2E8F0;
}
.sync-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22C55E;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}
.user-avatar img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

/* ── WORKSPACE LAYOUT ── */
.app-workspace {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: hidden;
  height: calc(100vh - 84px);
}

/* ── 1. SIDEBAR (260px) ── */
.finder-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
}

.new-article-btn {
  height: 48px;
  width: 100%;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #4F46E5 0%, #2563EB 100%);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22);
  transition: all 0.2s ease;
}
.new-article-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.32);
}
.btn-plus-icon {
  width: 18px;
  height: 18px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  height: 42px;
  border-radius: 12px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}
.nav-item:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #1E293B;
}
.nav-item.active {
  background: #F2F5FF;
  color: #2864FF;
  font-weight: 600;
}
.nav-indicator {
  position: absolute;
  left: 0;
  width: 4px;
  height: 20px;
  border-radius: 0 4px 4px 0;
  background: #2864FF;
}
.nav-icon {
  width: 18px;
  height: 18px;
}

/* Recent Section */
.recent-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 4px;
}
.title-icon {
  width: 14px;
  height: 14px;
}
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 2px;
}
.recent-card {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.recent-card:hover {
  background: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  border-color: #CBD5E1;
}
.recent-card.active {
  background: #FFFFFF;
  border-color: #BFDBFE;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.08);
}
.card-thumb {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #EFF6FF;
  color: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.thumb-icon {
  width: 16px;
  height: 16px;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: 11px;
  color: #94A3B8;
}
.card-tag {
  background: #F1F5F9;
  padding: 1px 6px;
  border-radius: 4px;
  color: #64748B;
}

/* AI Assistant Promo Card */
.ai-promo-card {
  position: relative;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 100%);
  border: 1px solid rgba(196, 181, 253, 0.5);
  overflow: hidden;
}
.ai-orb {
  position: absolute;
  bottom: -15px;
  right: -15px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(99, 102, 241, 0) 70%);
  filter: blur(10px);
  animation: pulse-glow 3s infinite alternate;
}
@keyframes pulse-glow {
  0% { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.2); opacity: 1; }
}
.ai-card-content {
  position: relative;
  z-index: 1;
}
.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #7C3AED;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 99px;
  margin-bottom: 6px;
}
.zap-icon { width: 12px; height: 12px; }
.ai-card-title {
  font-size: 13px;
  font-weight: 700;
  color: #1E1B4B;
  margin: 0;
}
.ai-card-desc {
  font-size: 11px;
  color: #6B7280;
  margin-top: 2px;
  line-height: 1.4;
}

/* ── 2. CENTER DUAL WORKSPACE (55% Editor + 45% Live Preview) ── */
.editor-workspace-container {
  flex: 1;
  display: flex;
  gap: 16px;
  min-width: 0;
}

/* Editor Pane (55%) */
.editor-pane {
  flex: 55;
  background: #FFFFFF;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.editor-header {
  padding: 20px 24px 12px 24px;
  border-bottom: 1px solid #F1F5F9;
}
.article-title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  background: transparent;
  font-family: inherit;
}
.article-title-input::placeholder { color: #CBD5E1; }
.editor-word-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94A3B8;
  margin-top: 6px;
}

.editor-body {
  flex: 1;
  padding: 20px 24px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.markdown-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'JetBrains Mono', 'Inter', monospace;
  font-size: 15px;
  line-height: 1.75;
  color: #334155;
  background: transparent;
}

/* Floating AI Rewrite Button */
.floating-ai-rewrite-btn {
  position: absolute;
  bottom: 24px;
  right: 28px;
  padding: 10px 18px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(147, 197, 253, 0.8);
  color: #2563EB;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.floating-ai-rewrite-btn:hover {
  transform: translateY(-2px) scale(1.03);
  background: #FFFFFF;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.25);
}
.sparkle-glow-icon {
  width: 16px;
  height: 16px;
  color: #8B5CF6;
  animation: spin-slow 8s linear infinite;
}
@keyframes spin-slow { 100% { transform: rotate(360deg); } }

/* Preview Pane (45%) */
.preview-pane {
  flex: 45;
  background: #FAFAFA;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
}
.preview-header-tabs {
  height: 52px;
  padding: 0 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.preview-tab {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 0.15s ease;
}
.preview-tab:hover {
  background: #F1F5F9;
  color: #1E293B;
}
.preview-tab.active {
  background: #EFF6FF;
  color: #2563EB;
  font-weight: 600;
}

.preview-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
}
.reader-article-card {
  width: 100%;
  max-width: 580px;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}

.reader-title {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.4;
  margin-bottom: 16px;
}

.reader-author-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F1F5F9;
}
.author-avatar-wrap {
  position: relative;
}
.author-avatar-wrap img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}
.verified-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #2563EB;
  color: #FFFFFF;
  font-size: 9px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #FFFFFF;
}
.author-meta-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.author-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-name {
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
}
.platform-badge {
  font-size: 10px;
  font-weight: 600;
  background: #DCFCE7;
  color: #15803D;
  padding: 1px 6px;
  border-radius: 4px;
}
.zhihu-badge { background: #E0F2FE; color: #0369A1; }
.juejin-badge { background: #DBEAFE; color: #1E40AF; }

.publish-time-line {
  font-size: 12px;
  color: #94A3B8;
  display: flex;
  align-items: center;
  gap: 6px;
}
.original-pill {
  color: #FF7A59;
  font-weight: 600;
}

/* Rendered Preview Markdown Styling */
.reader-body :deep(.pv-h1) {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
  margin: 20px 0 12px 0;
}
.reader-body :deep(.pv-h2) {
  font-size: 17px;
  font-weight: 700;
  color: #1E293B;
  margin: 18px 0 10px 0;
  border-left: 3px solid #2563EB;
  padding-left: 10px;
}
.reader-body :deep(.pv-p) {
  font-size: 14.5px;
  line-height: 1.75;
  color: #334155;
  margin-bottom: 14px;
}
.reader-body :deep(.pv-quote) {
  background: #F8FAFC;
  border-left: 4px solid #8B5CF6;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  margin: 16px 0;
  display: flex;
  gap: 10px;
}
.reader-body :deep(.pv-code-box) {
  background: #1E293B;
  border-radius: 12px;
  margin: 16px 0;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.reader-body :deep(.pv-code-header) {
  padding: 8px 14px;
  background: #0F172A;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.reader-body :deep(.pv-mac-dots) {
  display: flex;
  gap: 6px;
}
.reader-body :deep(.pv-mac-dots span) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.reader-body :deep(.pv-mac-dots span:nth-child(1)) { background: #EF4444; }
.reader-body :deep(.pv-mac-dots span:nth-child(2)) { background: #F59E0B; }
.reader-body :deep(.pv-mac-dots span:nth-child(3)) { background: #10B981; }
.reader-body :deep(.pv-code-lang) { font-size: 11px; color: #94A3B8; font-family: monospace; }
.reader-body :deep(.pv-code-copy) { font-size: 11px; color: #64748B; cursor: pointer; }
.reader-body :deep(pre) {
  padding: 14px;
  color: #F8FAFC;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.reader-footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #F1F5F9;
}
.rf-btn {
  background: transparent;
  border: none;
  color: #64748B;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
}
.rf-btn:hover { background: #F1F5F9; color: #2563EB; }
.rf-icon { width: 16px; height: 16px; }

/* ── 3. FAR-RIGHT PUBLISH PANEL (300px) ── */
.publish-panel {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 18px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
}
.publish-panel-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
.panel-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
}
.title-send-icon { width: 16px; height: 16px; color: #2563EB; }

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.platform-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
.platform-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.platform-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.platform-name {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
}
.platform-status {
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #CBD5E1;
}
.status-dot.connected {
  background: #22C55E;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}
.status-text {
  font-size: 11px;
  color: #94A3B8;
}

.connect-link-btn {
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #CBD5E1;
  background: #FFFFFF;
  color: #2563EB;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

/* Switch Toggle Styling */
.switch-toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}
.switch-toggle input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #CBD5E1;
  transition: .2s;
  border-radius: 20px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px; width: 16px;
  left: 2px; bottom: 2px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}
input:checked + .slider { background-color: #2563EB; }
input:checked + .slider:before { transform: translateX(16px); }

.panel-divider {
  height: 1px;
  background: #E2E8F0;
  margin: 2px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.setting-label {
  font-size: 13px;
  font-weight: 600;
  color: #1E293B;
}
.setting-sub {
  font-size: 11px;
  color: #94A3B8;
}

.time-picker-box {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cal-icon { width: 16px; height: 16px; color: #2563EB; }
.time-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  font-weight: 600;
  color: #1E40AF;
  width: 100%;
}

/* Cover Picker Box */
.cover-picker-box {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cover-title { font-size: 12px; font-weight: 600; color: #475569; }
.re-gen-btn {
  background: transparent;
  border: none;
  color: #2563EB;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.spin-icon { width: 12px; height: 12px; }

.cover-preview-img {
  position: relative;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
}
.cover-preview-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: 8px;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 500;
  gap: 4px;
}
.overlay-sparkle { width: 12px; height: 12px; color: #FF7A59; }

/* Giant Coral CTA Button (52px) */
.giant-publish-cta {
  margin-top: auto;
  height: 52px;
  width: 100%;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #FF7A59 0%, #FF5252 100%);
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(255, 122, 89, 0.35);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.giant-publish-cta:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 14px 30px rgba(255, 122, 89, 0.45);
}
.cta-send-icon { width: 20px; height: 20px; }

/* ── MODALS ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-modal-card {
  width: 480px;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid #E2E8F0;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-wand-icon { width: 22px; height: 22px; color: #6366F1; }
.modal-title-group h3 { font-size: 18px; font-weight: 700; color: #0F172A; margin: 0; }
.close-btn { background: transparent; border: none; color: #94A3B8; cursor: pointer; }

.modal-desc { font-size: 13px; color: #64748B; margin-bottom: 16px; }
.ai-preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.preset-card {
  padding: 14px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.preset-card:hover {
  background: #FFFFFF;
  border-color: #6366F1;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}
.preset-icon { width: 20px; height: 20px; margin-bottom: 8px; }
.preset-name { font-size: 14px; font-weight: 700; color: #0F172A; }
.preset-sub { font-size: 11px; color: #94A3B8; margin-top: 2px; }

/* Success Modal */
.success-modal-card {
  width: 400px;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}
.success-icon-badge {
  width: 60px; height: 60px;
  border-radius: 50%;
  background: #DCFCE7;
  color: #22C55E;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px auto;
}
.success-check-icon { width: 32px; height: 32px; }
.success-modal-card h3 { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
.success-msg { font-size: 14px; color: #64748B; line-height: 1.5; margin-bottom: 24px; }
.success-confirm-btn {
  width: 100%; height: 46px; border-radius: 12px;
  background: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 15px;
  border: none; cursor: pointer;
}

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translate(-50%, -20px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
