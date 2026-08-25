<script setup>
import { ref } from 'vue';
import { 
  Upload, 
  ArrowRight, 
  Zap, 
  Palette, 
  FileText, 
  Globe, 
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send,
  Layers,
  Code,
  ShieldCheck
} from '@lucide/vue';
import BrandLogo from './BrandLogo.vue';

const emit = defineEmits([
  'enter-editor', 
  'open-templates', 
  'open-materials', 
  'open-launchpad',
  'import-file',
  'insert-sample'
]);

const promptText = ref("我今天想写一篇关于分布式高并发架构演进的技术干货，需要优雅的代码高亮排版，并一键同步分发至微信公众号、知乎和掘金....");
const fileInputRef = ref(null);

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    emit('import-file', file);
    emit('enter-editor');
  }
}

function handleStartCreate() {
  emit('enter-editor', promptText.value);
}

// 36 Supported Channels categorized for display
const channelCategories = [
  {
    name: '自媒体与主流专栏',
    channels: [
      { id: 'wechat', name: '微信公众号', icon: '/svg/微信.svg', tag: '格式免登无损复制', desc: 'CSS 全行内化，富文本与代码完美呈现' },
      { id: 'zhihu', name: '知乎专栏', icon: '/svg/知乎.svg', tag: 'KaTeX 公式 / 代码块', desc: '支持技术长文、问答与专栏原生渲染' },
      { id: 'toutiao', name: '今日头条', icon: '/svg/今日头条.svg', tag: '图文静默排版', desc: '全自动填装草稿箱与封面尺寸自适应' },
      { id: 'baijiahao', name: '百家号', icon: '/svg/百家号.svg', tag: '百度搜索加权', desc: '一键同步至百度创作平台与搜索收录' },
      { id: 'jianshu', name: '简书', icon: '/svg/简书.svg', tag: 'Markdown 原生', desc: '文青与开发者创作社区一键草稿发布' },
      { id: 'bilibili', name: '哔哩哔哩专栏', icon: '/svg/哔哩哔哩.svg', tag: '图文专栏', desc: 'B站优质长图文与技术专栏同步' },
      { id: 'weibo', name: '微博头条文章', icon: '/svg/微博.svg', tag: '长微博图文', desc: '全域社交触达与多图混排支持' },
      { id: 'douban', name: '豆瓣日记', icon: '/svg/豆瓣网.svg', tag: '书影音随笔', desc: '文艺深度内容与长文随笔沉淀' },
    ]
  },
  {
    name: '技术极客与开发者社区',
    channels: [
      { id: 'juejin', name: '稀土掘金', icon: '/svg/juejin.svg', tag: '掘金 Markdown 注入', desc: '前端/后端热门技术圈与小册专栏' },
      { id: 'csdn', name: 'CSDN 博客', icon: '/svg/csdn.svg', tag: '双模式编辑器填充', desc: '老牌技术博客自动装载与分类标签' },
      { id: 'cnblogs', name: '博客园', icon: '/svg/博客园.svg', tag: '极客园子', desc: '纯粹技术文章分享与独立博客沉淀' },
      { id: 'segmentfault', name: '思否 SegmentFault', icon: '/svg/思否.svg', tag: '问答与专栏', desc: '中国领先开发者技术社区' },
      { id: 'oschina', name: '开源中国', icon: '/svg/开源中国.svg', tag: '开源动态', desc: '开源社区、Gitee 与技术资讯' },
      { id: '51cto', name: '51CTO 博客', icon: '/svg/51.svg', tag: '企业 IT / 架构', desc: '系统运维与架构师聚集地' },
      { id: 'infoq', name: 'InfoQ 写作平台', icon: '/svg/infoq.svg', tag: '深度技术观察', desc: '前沿软件架构与技术峰会专栏' },
      { id: 'imooc', name: '慕课网手记', icon: '/svg/慕课网.svg', tag: '编程教程实战', desc: 'IT 职业技能实战教程输出' },
    ]
  },
  {
    name: '云厂商与前沿编程专区',
    channels: [
      { id: 'aliyun', name: '阿里云开发者', icon: '/svg/aliyun.svg', tag: '云原生实战', desc: '阿里云官方技术社区与算力专栏' },
      { id: 'tencentcloud', name: '腾讯云开发者', icon: '/svg/tencentcloud.svg', tag: '开发者专栏', desc: '腾讯技术生态输出与云上实战' },
      { id: 'yuque', name: '语雀知识库', icon: '/svg/语雀.svg', tag: '专业知识管理', desc: '阿里沉淀的企业级结构化知识库' },
      { id: 'nowcoder', name: '牛客网', icon: '/svg/nowcoder.svg', tag: '求职与技术面试', desc: '程序员笔试面试交流与经验贴' },
      { id: 'leetcode', name: '力扣 LeetCode', icon: '/svg/leetcode.svg', tag: '算法题解', desc: '刷题题解与算法思路高清呈现' },
      { id: 'learnku', name: 'LearnKu', icon: '/svg/learnku.svg', tag: '现代 Web 生态', desc: '高质量开发者生态技术圈' },
      { id: 'woshipm', name: '人人都是产品经理', icon: '/svg/woshipm.svg', tag: '产品 / 运营', desc: '互联网产品设计深度思考' },
      { id: 'xueqiu', name: '雪球财经', icon: '/svg/xueqiu.svg', tag: '投资研究笔记', desc: '聪明投资者社区与深度研报' },
    ]
  }
];

const selectedCategoryIndex = ref(0);

function scrollToChannels() {
  const el = document.getElementById('supported-channels-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
</script>

<template>
  <div class="wandor-landing-wrapper select-none">
    <!-- Hero Full-Viewport Section -->
    <section class="wandor-hero-viewport">
      <!-- Ambient Panoramic Background Layer -->
      <div class="wandor-bg-canvas">
        <video
          class="wandor-bg-video"
          src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
          autoplay
          muted
          loop
          playsinline
        ></video>
        
        <!-- Bottom Panorama Vector Landscape Art Layer -->
        <div class="wandor-landscape-illustration"></div>
        <!-- Top-to-bottom clean fade gradient -->
        <div class="wandor-top-gradient-mask"></div>
      </div>

      <!-- Top Navigation Bar (Wandor Visual Style) -->
      <header class="wandor-header-nav">
        <!-- Brand Wordmark with Light/Dark Adaptive Vector Logo -->
        <div class="wandor-brand-box" @click="emit('enter-editor')">
          <BrandLogo :size="36" />
          <span class="wandor-wordmark">easymd</span>
        </div>

        <!-- Center Nav Links (Tailored to NiceMD) -->
        <nav class="wandor-nav-menu">
          <button class="nav-text-link" @click="scrollToChannels">支持渠道</button>
          <button class="nav-text-link" @click="emit('open-templates')">精选模板</button>
          <button class="nav-text-link" @click="emit('open-materials')">素材中心</button>
          <button class="nav-text-link" @click="emit('open-launchpad')">多平台分发</button>
        </nav>

        <!-- Right Action Button -->
        <div class="wandor-nav-actions">
          <button class="btn-wandor-cta" @click="emit('enter-editor')">
            进入工作台
          </button>
        </div>
      </header>

      <!-- Hero Main Content Center -->
      <div class="wandor-hero-body">
        <!-- Giant Display Headline -->
        <h1 class="wandor-hero-title">
          一文排版，触达全网每一个角落
        </h1>

        <!-- 2-Line Clean Subtitle -->
        <p class="wandor-hero-subtitle">
          专为内容创作者与技术博主打造的极简 Markdown 排版与全渠道分发神器。<br />
          输入灵感大纲或导入文档，一键无损同步至微信、知乎、掘金等 30+ 核心平台。
        </p>

        <!-- Frosted Liquid Glass Prompt Card (Wandor Visual Style) -->
        <div class="wandor-prompt-card">
          <!-- Textarea / Editable Prompt -->
          <textarea
            v-model="promptText"
            class="wandor-card-input"
            rows="3"
            placeholder="输入今天想要创作的内容主题或文章大纲，直接开启全网排版与分发..."
          ></textarea>

          <!-- Bottom Card Controls Row -->
          <div class="wandor-card-footer">
            <div class="card-footer-left">
              <input
                ref="fileInputRef"
                type="file"
                accept=".md,.markdown,.docx,.txt"
                class="hidden-file-input"
                @change="handleFileChange"
              />
              <button
                class="btn-card-upload-icon"
                @click="triggerFileUpload"
                title="导入 Markdown / Word / TXT 文档"
              >
                <Upload size="17" stroke-width="2.2" />
                <span class="upload-text">导入文档</span>
              </button>
              <button
                class="btn-card-sample-pill"
                @click="emit('insert-sample'); emit('enter-editor');"
                title="载入精选示例文档"
              >
                <span>示例文档</span>
              </button>
            </div>

            <button class="btn-card-submit-cta" @click="handleStartCreate">
              <span>立即开启创作</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Supported Channels Section (30+ 渠道全景矩阵) -->
    <section id="supported-channels-section" class="wandor-section channels-section-wrap">
      <div class="section-header-box">
        <span class="section-pretitle">SUPPORTED PLATFORMS</span>
        <h2 class="section-main-title">覆盖全网主流生态，一处编写全网闪耀</h2>
        <p class="section-subtext">支持浏览器原生注入、静默草稿同步与一键无损富文本复制</p>
      </div>

      <!-- Categories Segmented Control -->
      <div class="channels-tab-bar">
        <button
          v-for="(cat, idx) in channelCategories"
          :key="cat.name"
          class="channel-tab-item"
          :class="{ 'is-active': selectedCategoryIndex === idx }"
          @click="selectedCategoryIndex = idx"
        >
          <span>{{ cat.name }}</span>
          <span class="tab-badge">{{ cat.channels.length }}</span>
        </button>
      </div>

      <!-- Channels Grid Cards -->
      <div class="channels-card-grid">
        <div
          v-for="c in channelCategories[selectedCategoryIndex].channels"
          :key="c.id"
          class="channel-item-card"
          @click="emit('open-launchpad')"
        >
          <div class="channel-logo-wrap">
            <img :src="c.icon" :alt="c.name" class="channel-logo-img" />
          </div>
          <div class="channel-detail-col">
            <div class="channel-title-row">
              <span class="channel-name">{{ c.name }}</span>
              <span class="channel-feature-tag">{{ c.tag }}</span>
            </div>
            <p class="channel-desc">{{ c.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Features Trio Section -->
    <section class="wandor-section features-section-wrap">
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-pill icon-blue">
            <Zap size="20" />
          </div>
          <h3 class="feature-name">CSS 行内无损排版</h3>
          <p class="feature-detail">
            全自动将现代 CSS 转换为微信公众号及各大平台严格兼容的行内样式，完美呈现 Mac 代码高亮、数学公式与精美列表。
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-pill icon-terracotta">
            <Globe size="20" />
          </div>
          <h3 class="feature-name">全网多渠道自动化分发</h3>
          <p class="feature-detail">
            一键将文章同步至知乎、掘金、CSDN、头条等 30+ 渠道草稿箱，标题、封面与正文全自动装载，无需反复粘贴。
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-pill icon-purple">
            <Palette size="20" />
          </div>
          <h3 class="feature-name">深度主题与素材定制</h3>
          <p class="feature-detail">
            内置 20+ 精选排版主题与 50+ 视觉模块组件库，支持实时 CSS 联想编辑与沉淀，打造极具辨识度的个人专栏风格。
          </p>
        </div>
      </div>
    </section>

    <!-- Minimalist Wandor Footer -->
    <footer class="wandor-footer">
      <div class="footer-brand-side">
        <BrandLogo :size="24" />
        <span class="footer-wordmark">easymd</span>
        <span class="footer-copyright">© 2026 EasyMD Studio · 让优质内容自由流动</span>
      </div>
      <div class="footer-links-side">
        <button class="footer-link" @click="emit('enter-editor')">排版工作台</button>
        <button class="footer-link" @click="emit('open-launchpad')">多渠道分发</button>
        <button class="footer-link" @click="emit('open-templates')">精选模板</button>
        <button class="footer-link" @click="emit('open-materials')">素材中心</button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.wandor-landing-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #fdfbf7;
  color: var(--wandor-text, #1a1a1a);
  font-family: var(--font-sans, 'Geist', -apple-system, BlinkMacSystemFont, sans-serif);
  box-sizing: border-box;
}

html.dark .wandor-landing-wrapper {
  background-color: #0a0a0a;
  color: #fafafa;
}

/* ── Hero Full Viewport ── */
.wandor-hero-viewport {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding-bottom: 2.5rem;
}

/* ── Ambient Background Canvas ── */
.wandor-bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.wandor-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.45;
  filter: saturate(110%);
}

html.dark .wandor-bg-video {
  opacity: 0.2;
}

/* Bottom Vector Landscape Art */
.wandor-landscape-illustration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48%;
  background: 
    radial-gradient(ellipse 90% 70% at 50% 100%, rgba(210, 180, 140, 0.22) 0%, rgba(253, 251, 247, 0) 75%),
    linear-gradient(180deg, rgba(253, 251, 247, 0) 0%, rgba(245, 235, 224, 0.4) 100%);
  pointer-events: none;
}

html.dark .wandor-landscape-illustration {
  background: 
    radial-gradient(ellipse 90% 70% at 50% 100%, rgba(144, 88, 49, 0.15) 0%, rgba(10, 10, 10, 0) 75%),
    linear-gradient(180deg, rgba(10, 10, 10, 0) 0%, rgba(20, 20, 24, 0.6) 100%);
}

/* Top Gradient Overlay */
.wandor-top-gradient-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    #fdfbf7 0%,
    rgba(253, 251, 247, 0.92) 20%,
    rgba(253, 251, 247, 0.45) 50%,
    rgba(253, 251, 247, 0.9) 100%
  );
  pointer-events: none;
}

html.dark .wandor-top-gradient-mask {
  background: linear-gradient(
    180deg,
    #0a0a0a 0%,
    rgba(10, 10, 10, 0.92) 20%,
    rgba(10, 10, 10, 0.45) 50%,
    rgba(10, 10, 10, 0.92) 100%
  );
}

/* ── Wandor Top Navigation Bar ── */
.wandor-header-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 3.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .wandor-header-nav {
    padding: 1.25rem 1.25rem;
  }
}

.wandor-brand-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.brand-logo-wrapper {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 9px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.wandor-brand-box:hover .brand-logo-img {
  transform: scale(1.08) rotate(-2deg);
}

.logo-light {
  display: block;
}
.logo-dark {
  display: none;
}

html.dark .logo-light {
  display: none;
}
html.dark .logo-dark {
  display: block;
}

.wandor-wordmark {
  font-family: 'Special Elite', serif;
  font-size: 2rem;
  font-weight: 700;
  color: #0a0a0a;
  letter-spacing: -0.04em;
  line-height: 1;
}

html.dark .wandor-wordmark {
  color: #ffffff;
}

.wandor-nav-menu {
  display: flex;
  align-items: center;
  gap: 2.25rem;
}

@media (max-width: 960px) {
  .wandor-nav-menu {
    display: none;
  }
}

.nav-text-link {
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.18s ease;
  letter-spacing: 0.02em;
}

.nav-text-link:hover {
  opacity: 0.55;
}

html.dark .nav-text-link {
  color: #e5e7eb;
}

.wandor-nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-wandor-cta {
  background: #0a0a0a;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 0.65rem 1.4rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-wandor-cta:hover {
  background: #262626;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
}

.btn-wandor-cta:active {
  transform: scale(0.96);
}

html.dark .btn-wandor-cta {
  background: #ffffff;
  color: #0a0a0a;
}

/* ── Hero Center Content ── */
.wandor-hero-body {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem 1.5rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.wandor-hero-title {
  font-family: var(--font-sans);
  font-size: clamp(2.5rem, 5.5vw, 4.25rem);
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin: 0 0 1.25rem 0;
}

html.dark .wandor-hero-title {
  color: #ffffff;
}

.wandor-hero-subtitle {
  font-family: var(--font-sans);
  font-size: clamp(1rem, 1.3vw, 1.2rem);
  font-weight: 500;
  color: #64748b;
  line-height: 1.65;
  max-width: 44rem;
  margin: 0 0 2.5rem 0;
}

html.dark .wandor-hero-subtitle {
  color: #94a3b8;
}

/* ── Frosted Liquid Glass Prompt Card ── */
.wandor-prompt-card {
  position: relative;
  width: min(44rem, 92vw);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 2px solid rgba(255, 255, 255, 0.95);
  border-radius: 2.75rem; /* ~44px */
  box-shadow: 
    0 1.25rem 3.5rem rgba(0, 0, 0, 0.07),
    0 0.125rem 0.5rem rgba(0, 0, 0, 0.03),
    inset 0 1px 0 #ffffff;
  padding: 1.75rem 2rem 1.375rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  box-sizing: border-box;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

html.dark .wandor-prompt-card {
  background: rgba(20, 20, 25, 0.72);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 1.25rem 3.5rem rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.wandor-prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 1.75rem 4.5rem rgba(0, 0, 0, 0.1),
    0 0.25rem 0.75rem rgba(0, 0, 0, 0.04);
}

.wandor-card-input {
  width: 100%;
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 1.125rem;
  font-weight: 500;
  color: #905831; /* Wandor terracotta accent */
  line-height: 1.6;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

html.dark .wandor-card-input {
  color: #fbbf24;
}

.wandor-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
}

.card-footer-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.hidden-file-input {
  display: none;
}

/* Upload Button */
.btn-card-upload-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #1a1a1a;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

html.dark .btn-card-upload-icon {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.btn-card-upload-icon:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

html.dark .btn-card-upload-icon:hover {
  background: rgba(255, 255, 255, 0.18);
}

.btn-card-sample-pill {
  padding: 0.5rem 0.875rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: #64748b;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-card-sample-pill:hover {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
}

html.dark .btn-card-sample-pill {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #94a3b8;
}

/* Submit CTA Button */
.btn-card-submit-cta {
  background: #0a0a0a;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.625rem;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.btn-card-submit-cta:hover {
  background: #262626;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
}

.btn-card-submit-cta:active {
  transform: scale(0.96);
}

html.dark .btn-card-submit-cta {
  background: #ffffff;
  color: #0a0a0a;
}

/* ── Supported Channels Section ── */
.wandor-section {
  position: relative;
  z-index: 5;
  max-width: 1280px;
  margin: 0 auto;
  padding: 5rem 2rem 2rem;
  box-sizing: border-box;
}

.section-header-box {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-pretitle {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #905831;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 0.5rem;
}

html.dark .section-pretitle {
  color: #fbbf24;
}

.section-main-title {
  font-family: var(--font-sans);
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.03em;
  margin: 0 0 0.625rem 0;
}

html.dark .section-main-title {
  color: #ffffff;
}

.section-subtext {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

/* Category Tab Pills */
.channels-tab-bar {
  display: flex;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: 2rem;
}

.channel-tab-item {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 0.5625rem 1.25rem;
  border-radius: 9999px;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  gap: 0.4375rem;
}

.channel-tab-item.is-active {
  background: #ffffff;
  color: #0a0a0a;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.08);
}

html.dark .channel-tab-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

html.dark .channel-tab-item.is-active {
  background: #262628;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

.tab-badge {
  font-size: 0.6875rem;
  opacity: 0.75;
}

/* Channels Grid */
.channels-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.125rem;
  width: 100%;
}

@media (max-width: 1080px) {
  .channels-card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .channels-card-grid {
    grid-template-columns: 1fr;
  }
}

.channel-item-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 1.375rem;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  padding: 1.125rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

html.dark .channel-item-card {
  background: rgba(25, 25, 30, 0.65);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
}

.channel-item-card:hover {
  transform: translateY(-3px) scale(1.01);
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
  border-color: rgba(144, 88, 49, 0.35);
}

html.dark .channel-item-card:hover {
  background: rgba(35, 35, 42, 0.95);
  border-color: rgba(255, 255, 255, 0.25);
}

.channel-logo-wrap {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

html.dark .channel-logo-wrap {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.channel-logo-img {
  width: 1.625rem;
  height: 1.625rem;
  object-fit: contain;
}

.channel-detail-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
}

.channel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
}

.channel-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html.dark .channel-name {
  color: #ffffff;
}

.channel-feature-tag {
  font-size: 0.625rem;
  font-weight: 700;
  color: #905831;
  background: rgba(144, 88, 49, 0.08);
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  white-space: nowrap;
}

html.dark .channel-feature-tag {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
}

.channel-desc {
  font-size: 0.71875rem;
  color: #64748b;
  line-height: 1.35;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Core Features Trio ── */
.features-section-wrap {
  padding: 4rem 2rem 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 860px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 1.75rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
}

html.dark .feature-card {
  background: rgba(25, 25, 30, 0.65);
  border-color: rgba(255, 255, 255, 0.1);
}

.feature-icon-pill {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.icon-blue {
  background: #eff6ff;
  color: #2563eb;
}

.icon-terracotta {
  background: #fff7ed;
  color: #ea580c;
}

.icon-purple {
  background: #faf5ff;
  color: #9333ea;
}

html.dark .icon-blue {
  background: rgba(37, 99, 235, 0.18);
  color: #60a5fa;
}

html.dark .icon-terracotta {
  background: rgba(234, 88, 12, 0.18);
  color: #fb923c;
}

html.dark .icon-purple {
  background: rgba(147, 51, 234, 0.18);
  color: #c084fc;
}

.feature-name {
  font-size: 1.1875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

html.dark .feature-name {
  color: #ffffff;
}

.feature-detail {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* ── Minimal Wandor Footer ── */
.wandor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3.5rem 3.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

html.dark .wandor-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .wandor-footer {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem 1.5rem 2rem;
    text-align: center;
  }
}

.footer-brand-side {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo-wrapper {
  position: relative;
  width: 1.625rem;
  height: 1.625rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.footer-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.375rem;
}

.footer-wordmark {
  font-family: 'Special Elite', serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: #0a0a0a;
}

html.dark .footer-wordmark {
  color: #ffffff;
}

.footer-copyright {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: 0.5rem;
}

.footer-links-side {
  display: flex;
  gap: 1.5rem;
}

.footer-link {
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: #0a0a0a;
}

html.dark .footer-link:hover {
  color: #ffffff;
}
</style>
