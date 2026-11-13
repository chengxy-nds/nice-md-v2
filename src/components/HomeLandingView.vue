<script setup>
import { ref } from 'vue';
import { 
  Upload, 
  ArrowRight, 
  Zap, 
  Palette, 
  FileText, 
  Globe, 
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

const promptText = ref('');
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
  <div class="wandor-landing-wrapper">
    <!-- Product hero -->
    <section class="wandor-hero-viewport">
      <!-- Top navigation -->
      <header class="wandor-header-nav">
        <div class="wandor-brand-box" @click="emit('enter-editor')">
          <BrandLogo :size="36" />
          <span class="wandor-wordmark">EASY MD</span>
        </div>

        <nav class="wandor-nav-menu">
          <button class="nav-text-link" @click="scrollToChannels">支持渠道</button>
          <button class="nav-text-link" @click="emit('open-templates')">精选模板</button>
          <button class="nav-text-link" @click="emit('open-materials')">素材中心</button>
          <button class="nav-text-link" @click="emit('open-launchpad')">多平台分发</button>
        </nav>

        <div class="wandor-nav-actions">
          <button class="btn-wandor-cta" @click="emit('enter-editor')">
            进入工作台
          </button>
        </div>
      </header>

      <!-- Editorial headline and focused writing entry -->
      <div class="wandor-hero-body">
        <div class="hero-intro">
          <div class="hero-eyebrow">Markdown 创作与多平台发布</div>
          <h1 class="wandor-hero-title">写好一篇文章，<br /><span>从容发布到全网。</span></h1>
          <p class="wandor-hero-subtitle">
            专注写作、排版与发布。用熟悉的 Markdown 完成创作，再把内容带到你常用的平台。
          </p>
        </div>

        <div class="wandor-prompt-card">
          <div class="prompt-card-heading">
            <div>
              <strong>开始写作</strong>
              <span>写下主题或大纲，也可以导入已有文档</span>
            </div>
            <span class="prompt-format-label">Markdown</span>
          </div>
          <textarea
            v-model="promptText"
            class="wandor-card-input"
            rows="5"
            placeholder="写下你想表达的内容，或粘贴文章大纲……"
          ></textarea>

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
              <span>进入编辑器</span>
              <ArrowRight size="15" />
            </button>
          </div>
        </div>

        <div class="hero-platform-proof">
          <span class="proof-label">适配常用内容平台</span>
          <span class="proof-names">微信公众号 · 知乎 · 掘金 · CSDN · 更多</span>
          <button class="proof-link" @click="scrollToChannels">查看全部渠道</button>
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
        <span class="footer-wordmark">EASY MD</span>
        <span class="footer-copyright">© 2026 EASY MD Studio · 让优质内容自由流动</span>
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
  /* C. 首页挂载入场动画（见 style.css 的 nx-view-in 说明） */
  animation: nx-view-in var(--motion-slow) var(--ease-out) both;
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

/* ── Refined SaaS landing page ── */
.wandor-landing-wrapper {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f7f9fc;
  color: #172033;
}

html.dark .wandor-landing-wrapper {
  background: #11151c;
  color: #e8edf5;
}

.wandor-hero-viewport {
  min-height: min(800px, 100vh);
  padding: 0 32px 64px;
  justify-content: flex-start;
  background: #f7f9fc;
}

html.dark .wandor-hero-viewport {
  background: #11151c;
}

.wandor-header-nav {
  height: 76px;
  max-width: 1240px;
  padding: 0;
}

.wandor-brand-box {
  gap: 10px;
}

.wandor-wordmark,
.footer-wordmark {
  font-family: var(--font-sans, Inter, sans-serif);
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.04em;
  color: #172033;
}

html.dark .wandor-wordmark,
html.dark .footer-wordmark {
  color: #f1f5f9;
}

.wandor-nav-menu {
  gap: 28px;
}

.nav-text-link {
  padding: 8px 0;
  color: #526178;
  font-size: 13px;
  font-weight: 550;
  letter-spacing: 0;
}

.nav-text-link:hover {
  color: #1769d2;
  opacity: 1;
}

html.dark .nav-text-link {
  color: #c0c9d7;
}

.btn-wandor-cta,
.btn-card-submit-cta,
.hero-start-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #1769d2;
  border-radius: 7px;
  background: #1769d2;
  color: #fff;
  box-shadow: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.btn-wandor-cta {
  min-height: 38px;
  padding: 0 16px;
}

.btn-wandor-cta:hover,
.btn-card-submit-cta:hover,
.hero-start-button:hover {
  background: #1258b5;
  border-color: #1258b5;
  box-shadow: none;
  transform: translateY(-1px);
}

html.dark .btn-wandor-cta,
html.dark .btn-card-submit-cta,
html.dark .hero-start-button {
  background: #347fe5;
  border-color: #347fe5;
  color: #fff;
}

.wandor-hero-body {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(44px, 7vw, 96px);
  width: 100%;
  max-width: 1180px;
  padding: clamp(76px, 12vh, 120px) 0 48px;
  text-align: left;
}

.hero-copy {
  min-width: 0;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #1769d2;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.hero-eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1769d2;
}

.wandor-hero-title {
  margin: 0 0 18px;
  color: #172033;
  font-size: clamp(38px, 4.2vw, 58px);
  font-weight: 720;
  letter-spacing: -0.055em;
  line-height: 1.16;
}

.wandor-hero-title span {
  color: #1769d2;
}

html.dark .wandor-hero-title {
  color: #f1f5f9;
}

html.dark .wandor-hero-title span,
html.dark .hero-eyebrow {
  color: #70a9f5;
}

html.dark .hero-eyebrow-dot {
  background: #70a9f5;
}

.wandor-hero-subtitle {
  max-width: 490px;
  margin: 0 0 26px;
  color: #617089;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.75;
}

html.dark .wandor-hero-subtitle {
  color: #a4afc0;
}

.hero-primary-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-start-button {
  min-height: 44px;
  padding: 0 17px;
  cursor: pointer;
}

.hero-secondary-button {
  min-height: 40px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: #526178;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.hero-secondary-button:hover {
  color: #1769d2;
}

.hero-capabilities {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 34px;
  color: #8290a4;
  font-size: 11px;
  font-weight: 500;
}

.hero-capabilities i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #aab5c4;
}

.wandor-prompt-card {
  width: 100%;
  padding: 20px;
  gap: 14px;
  border: 1px solid #dfe6ef;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(20, 38, 66, 0.07);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.wandor-prompt-card:hover {
  transform: none;
  border-color: #cbd8e8;
  box-shadow: 0 14px 36px rgba(20, 38, 66, 0.09);
}

html.dark .wandor-prompt-card {
  border-color: #303a49;
  background: #1a202a;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
}

.prompt-card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.prompt-card-heading > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prompt-card-heading strong {
  color: #172033;
  font-size: 14px;
  font-weight: 650;
}

.prompt-card-heading span:not(.prompt-format-label) {
  color: #8290a4;
  font-size: 11px;
}

html.dark .prompt-card-heading strong {
  color: #e8edf5;
}

.prompt-format-label {
  padding: 4px 7px;
  border: 1px solid #e5eaf1;
  border-radius: 5px;
  color: #6d7b90;
  font-size: 10px;
  font-weight: 600;
}

.wandor-card-input {
  min-height: 142px;
  padding: 12px;
  border: 1px solid #e3e9f1;
  border-radius: 8px;
  background: #f9fafc;
  color: #28364a;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.65;
}

.wandor-card-input::placeholder {
  color: #9aa6b7;
}

.wandor-card-input:focus {
  border-color: #8cb6ed;
  box-shadow: 0 0 0 3px rgba(23, 105, 210, 0.1);
}

html.dark .wandor-card-input {
  border-color: #354052;
  background: #141922;
  color: #e8edf5;
}

.wandor-card-footer {
  padding-top: 0;
}

.card-footer-left {
  gap: 8px;
}

.btn-card-upload-icon,
.btn-card-sample-pill {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid #dfe6ef;
  border-radius: 6px;
  background: #fff;
  color: #526178;
  box-shadow: none;
  font-size: 12px;
  font-weight: 550;
}

.btn-card-upload-icon:hover,
.btn-card-sample-pill:hover {
  transform: none;
  border-color: #b8c9df;
  background: #f8fafc;
  color: #1769d2;
}

html.dark .btn-card-upload-icon,
html.dark .btn-card-sample-pill {
  border-color: #354052;
  background: #202733;
  color: #c1cbd8;
}

.btn-card-submit-cta {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  cursor: pointer;
}

.wandor-section {
  max-width: 1240px;
  padding: 76px 32px 32px;
}

.section-header-box {
  margin-bottom: 28px;
}

.section-pretitle {
  color: #1769d2;
  font-size: 10px;
  letter-spacing: 0.1em;
}

.section-main-title {
  color: #172033;
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 680;
  letter-spacing: -0.04em;
}

html.dark .section-main-title {
  color: #eef2f7;
}

.section-subtext {
  color: #718096;
  font-size: 14px;
}

.channels-tab-bar {
  justify-content: flex-start;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.channel-tab-item {
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 1px solid #e1e7ef;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
}

.channel-tab-item.is-active {
  border-color: #b9d2f2;
  background: #edf5ff;
  color: #145cb5;
  box-shadow: none;
}

html.dark .channel-tab-item.is-active {
  border-color: #365b8c;
  background: #1c2b3e;
  color: #9bc5ff;
}

.channels-card-grid {
  gap: 10px;
}

.channel-item-card {
  min-width: 0;
  padding: 14px;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: #fff;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

html.dark .channel-item-card {
  border-color: #2b3544;
  background: #171d26;
  box-shadow: none;
}

.channel-item-card:hover {
  transform: none;
  border-color: #b8cce5;
  background: #fff;
  box-shadow: none;
}

html.dark .channel-item-card:hover {
  border-color: #486587;
  background: #1b2430;
}

.channel-logo-wrap {
  width: 38px;
  height: 38px;
  border-radius: 7px;
  border: 1px solid #e8edf3;
  box-shadow: none;
}

.channel-title-row {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.channel-name {
  font-size: 13px;
  font-weight: 620;
}

.channel-feature-tag {
  color: #60738d;
  background: #f1f4f8;
  font-size: 9px;
  font-weight: 550;
}

html.dark .channel-feature-tag {
  color: #aab8cb;
  background: #273140;
}

.channel-desc {
  font-size: 11px;
  color: #718096;
}

.features-section-wrap {
  padding-top: 48px;
  padding-bottom: 76px;
}

.features-grid {
  gap: 0;
  border-top: 1px solid #e1e7ef;
  border-bottom: 1px solid #e1e7ef;
}

.feature-card {
  gap: 10px;
  padding: 24px;
  border: 0;
  border-right: 1px solid #e1e7ef;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.feature-card:last-child {
  border-right: 0;
}

html.dark .feature-card {
  border-color: #2b3544;
  background: transparent;
}

.feature-icon-pill {
  width: 34px;
  height: 34px;
  margin-bottom: 4px;
  border-radius: 7px;
  background: #edf5ff;
  color: #1769d2;
}

.icon-terracotta,
.icon-purple {
  background: #edf5ff;
  color: #1769d2;
}

html.dark .icon-blue,
html.dark .icon-terracotta,
html.dark .icon-purple {
  background: #1c2b3e;
  color: #8abaff;
}

.feature-name {
  color: #172033;
  font-size: 15px;
  font-weight: 650;
}

html.dark .feature-name {
  color: #e8edf5;
}

.feature-detail {
  color: #718096;
  font-size: 12px;
  line-height: 1.65;
}

.wandor-footer {
  max-width: 1240px;
  padding: 22px 32px 26px;
  border-top-color: #e1e7ef;
}

.footer-wordmark {
  font-size: 16px;
}

.footer-copyright {
  color: #8793a5;
}

.footer-links-side {
  gap: 18px;
}

.footer-link {
  color: #65748a;
  font-weight: 500;
}

.footer-link:hover {
  color: #1769d2;
}

@media (max-width: 960px) {
  .wandor-hero-viewport {
    min-height: auto;
    padding: 0 24px 64px;
  }

  .wandor-header-nav {
    height: 68px;
  }

  .wandor-hero-body {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
    gap: 32px;
    padding: 74px 0 24px;
  }

  .wandor-hero-title {
    font-size: clamp(36px, 5.2vw, 48px);
  }

  .wandor-card-input {
    min-height: 120px;
  }
}

@media (max-width: 720px) {
  .wandor-hero-viewport {
    padding: 0 18px 48px;
  }

  .wandor-header-nav {
    height: 64px;
  }

  .wandor-brand-box {
    gap: 8px;
  }

  .wandor-wordmark {
    font-size: 18px;
  }

  .btn-wandor-cta {
    min-height: 34px;
    padding: 0 11px;
    font-size: 11px;
  }

  .wandor-hero-body {
    grid-template-columns: minmax(0, 1fr);
    gap: 30px;
    padding: 62px 0 0;
  }

  .wandor-hero-title {
    margin-bottom: 14px;
    font-size: clamp(36px, 10vw, 48px);
  }

  .wandor-hero-subtitle {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .hero-capabilities {
    margin-top: 22px;
    gap: 8px;
    font-size: 10px;
  }

  .wandor-prompt-card {
    padding: 15px;
  }

  .wandor-card-input {
    min-height: 112px;
    font-size: 13px;
  }

  .btn-card-upload-icon .upload-text {
    display: none;
  }

  .wandor-section {
    padding: 54px 18px 24px;
  }

  .section-header-box {
    text-align: left;
  }

  .section-main-title {
    font-size: 25px;
    line-height: 1.3;
  }

  .channels-tab-bar {
    justify-content: flex-start;
  }

  .features-section-wrap {
    padding-top: 24px;
    padding-bottom: 50px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 18px 0;
    border-right: 0;
    border-bottom: 1px solid #e1e7ef;
  }

  .feature-card:last-child {
    border-bottom: 0;
  }

  .wandor-footer {
    align-items: flex-start;
    padding: 20px 18px 24px;
    text-align: left;
  }

  .footer-brand-side {
    flex-wrap: wrap;
    gap: 8px;
  }

  .footer-copyright {
    flex-basis: 100%;
    margin-left: 0;
  }

  .footer-links-side {
    flex-wrap: wrap;
    gap: 8px 14px;
  }
}

/* ── Editorial home composition ── */
.wandor-landing-wrapper {
  background: #fbfbfa;
  color: #182233;
}

html.dark .wandor-landing-wrapper {
  background: #11151b;
  color: #edf1f6;
}

.wandor-hero-viewport {
  min-height: min(820px, 100vh);
  padding: 0 32px 48px;
  background: #fbfbfa;
}

html.dark .wandor-hero-viewport {
  background: #11151b;
}

.wandor-header-nav {
  width: min(100%, 1160px);
  height: 72px;
  padding: 0;
  border-bottom: 1px solid #e9ebee;
}

html.dark .wandor-header-nav {
  border-bottom-color: #28303a;
}

.wandor-brand-box {
  gap: 9px;
}

.wandor-brand-box :deep(*) {
  cursor: pointer;
}

.wandor-wordmark {
  color: #182233;
  font-family: var(--font-sans, Inter, system-ui, sans-serif);
  font-size: 18px;
  font-weight: 720;
  letter-spacing: -0.045em;
}

html.dark .wandor-wordmark {
  color: #f4f6f9;
}

.wandor-nav-menu {
  gap: 25px;
}

.nav-text-link {
  padding: 8px 0;
  color: #596779;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
}

.nav-text-link:hover {
  color: #1769d2;
  opacity: 1;
}

html.dark .nav-text-link {
  color: #bac4d1;
}

.btn-wandor-cta,
.btn-card-submit-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #1769d2;
  border-radius: 7px;
  background: #1769d2;
  color: #fff;
  box-shadow: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.btn-wandor-cta {
  min-height: 37px;
  padding: 0 15px;
}

.btn-wandor-cta:hover,
.btn-card-submit-cta:hover {
  transform: none;
  border-color: #0c58b5;
  background: #0c58b5;
  box-shadow: none;
}

html.dark .btn-wandor-cta,
html.dark .btn-card-submit-cta {
  border-color: #347fe5;
  background: #347fe5;
  color: #fff;
}

.wandor-hero-body {
  display: flex;
  width: min(100%, 900px);
  padding: clamp(72px, 10vh, 104px) 0 0;
  flex-direction: column;
  align-items: center;
  gap: 0;
  text-align: center;
}

.hero-intro {
  width: min(100%, 780px);
  margin-bottom: 32px;
}

.hero-eyebrow {
  margin: 0 0 18px;
  color: #667487;
  font-size: 13px;
  font-weight: 550;
  letter-spacing: 0.01em;
}

.hero-eyebrow-dot {
  display: none;
}

.wandor-hero-title {
  margin: 0 0 17px;
  color: #172033;
  font-size: clamp(42px, 5.1vw, 60px);
  font-weight: 690;
  letter-spacing: -0.055em;
  line-height: 1.2;
}

.wandor-hero-title span {
  color: #1769d2;
}

html.dark .wandor-hero-title {
  color: #f2f4f7;
}

html.dark .wandor-hero-title span {
  color: #7db1fa;
}

.wandor-hero-subtitle {
  max-width: 620px;
  margin: 0 auto;
  color: #667487;
  font-size: 15px;
  line-height: 1.8;
}

html.dark .hero-eyebrow,
html.dark .wandor-hero-subtitle {
  color: #aab5c3;
}

.wandor-prompt-card {
  width: min(100%, 760px);
  padding: 16px;
  gap: 12px;
  border: 1px solid #dfe4ea;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(25, 40, 60, 0.035);
  text-align: left;
}

.wandor-prompt-card:hover {
  border-color: #d2dbe6;
  box-shadow: 0 3px 12px rgba(25, 40, 60, 0.035);
}

html.dark .wandor-prompt-card {
  border-color: #303a47;
  background: #171d25;
  box-shadow: none;
}

.prompt-card-heading {
  min-height: 31px;
}

.prompt-card-heading > div {
  gap: 3px;
}

.prompt-card-heading strong {
  color: #202b3b;
  font-size: 14px;
  font-weight: 620;
}

.prompt-card-heading span:not(.prompt-format-label) {
  color: #7a8797;
  font-size: 12px;
}

html.dark .prompt-card-heading strong {
  color: #edf1f6;
}

html.dark .prompt-card-heading span:not(.prompt-format-label) {
  color: #9aa6b5;
}

.prompt-format-label {
  padding: 4px 7px;
  border: 1px solid #e6e9ee;
  border-radius: 4px;
  color: #758196;
  font-size: 10px;
  font-weight: 550;
}

.wandor-card-input {
  min-height: 124px;
  padding: 12px 13px;
  border: 1px solid #e6e9ee;
  border-radius: 6px;
  background: #fcfcfb;
  color: #263345;
  font-size: 14px;
  line-height: 1.65;
}

.wandor-card-input:focus {
  border-color: #8fb8eb;
  box-shadow: 0 0 0 2px rgba(23, 105, 210, 0.09);
}

.wandor-card-input::placeholder {
  color: #9aa5b4;
}

html.dark .wandor-card-input {
  border-color: #303a47;
  background: #12171e;
  color: #e9edf2;
}

.wandor-card-footer {
  padding-top: 1px;
}

.card-footer-left {
  gap: 7px;
}

.btn-card-upload-icon,
.btn-card-sample-pill {
  min-height: 34px;
  padding: 0 10px;
  border: 1px solid #e1e5eb;
  border-radius: 6px;
  background: #fff;
  color: #536174;
  box-shadow: none;
  font-size: 12px;
  font-weight: 520;
}

.btn-card-upload-icon:hover,
.btn-card-sample-pill:hover {
  transform: none;
  border-color: #c9d4e1;
  background: #f8fafc;
  color: #1769d2;
}

html.dark .btn-card-upload-icon,
html.dark .btn-card-sample-pill {
  border-color: #34404f;
  background: #1c242e;
  color: #c2ccd8;
}

.btn-card-submit-cta {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  cursor: pointer;
}

.hero-platform-proof {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 9px 13px;
  margin-top: 23px;
  color: #798596;
  font-size: 12px;
  line-height: 1.5;
}

.proof-label {
  color: #667487;
  font-weight: 550;
}

.proof-names {
  color: #8a95a3;
}

.proof-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #1769d2;
  font: inherit;
  font-size: 12px;
  font-weight: 550;
  cursor: pointer;
}

.proof-link:hover {
  color: #0c58b5;
}

html.dark .proof-label,
html.dark .proof-names {
  color: #9aa6b5;
}

.wandor-section {
  padding-top: 64px;
}

.section-pretitle {
  color: #1769d2;
}

.channel-item-card {
  cursor: pointer;
}

@media (max-width: 960px) {
  .wandor-hero-viewport {
    min-height: auto;
    padding: 0 24px 56px;
  }

  .wandor-hero-body {
    width: min(100%, 820px);
    padding-top: clamp(64px, 9vh, 88px);
  }
}

@media (max-width: 720px) {
  .wandor-hero-viewport {
    padding: 0 18px 42px;
  }

  .wandor-header-nav {
    height: 64px;
  }

  .wandor-hero-body {
    padding-top: 58px;
  }

  .hero-intro {
    margin-bottom: 25px;
  }

  .hero-eyebrow {
    margin-bottom: 14px;
    font-size: 12px;
  }

  .wandor-hero-title {
    font-size: clamp(34px, 9vw, 46px);
    line-height: 1.24;
  }

  .wandor-hero-subtitle {
    max-width: 460px;
    font-size: 14px;
    line-height: 1.7;
  }

  .wandor-prompt-card {
    padding: 13px;
  }

  .wandor-card-input {
    min-height: 112px;
    font-size: 13px;
  }

  .hero-platform-proof {
    gap: 5px 9px;
    margin-top: 18px;
    font-size: 11px;
  }

  .proof-link {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-wandor-cta,
  .btn-card-submit-cta,
  .nav-text-link {
    transition: none;
  }
}
</style>
