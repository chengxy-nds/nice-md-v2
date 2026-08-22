/**
 * WeChat Rich Material Library
 * Includes templates for:
 * 1. Headings (H1-H6)
 * 2. Blockquotes / Callouts
 * 3. Dividers (HR)
 * 4. Lists (UL / OL / Step numbers / Checklists)
 * 5. Tables (Modern WeChat table styles)
 * 6. Header Widgets (文章头部导读 / 关注头卡)
 * 7. Footer Widgets (文末三连 / 往期推荐 / 二维码关注卡片)
 */

export const materialCategories = [
  { id: 'all', name: '全部素材' },
  { id: 'backgrounds', name: '背景底纹' },
  { id: 'headings', name: '标题/序号' },
  { id: 'quotes', name: '金句/引用' },
  { id: 'callouts', name: '提示/卡片' },
  { id: 'dividers', name: '分割线' },
  { id: 'lists', name: '步骤/列表' },
  { id: 'header_widgets', name: '顶部导读' },
  { id: 'footer_widgets', name: '文末三连' }
];

export const materials = [
  // ── 背景底纹精选素材 ──
  {
    id: 'bg-grid-classic',
    category: 'backgrounds',
    tag: '推荐',
    title: '经典淡雅网格 (Classic Grid)',
    description: '20px 经典淡雅网格质感',
    tags: ['经典网格', '山海风', '底纹'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #ffffff; background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.045) 0%, rgba(255, 255, 255, 0) 12.16%); background-size: 20px 20px, 20px 20px; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; margin-bottom: 6px;">深入理解现代响应式设计架构</div>
  <div style="font-size: 13.5px; color: #475569; line-height: 1.7;">在极简排版中，呼吸感与节奏感是决定读者停留时长的核心要素。</div>
</section>`
  },
  {
    id: 'bg-dot-matrix',
    category: 'backgrounds',
    tag: '爆款',
    title: '波点矩阵底纹 (Dot Matrix)',
    description: '18px 规整波点矩阵',
    tags: ['波点矩阵', '现代设计', '科技感'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #ffffff; background-image: radial-gradient(rgba(0, 0, 0, 0.09) 1.5px, transparent 1.5px); background-size: 18px 18px; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #6d28d9; letter-spacing: 0.5px; margin-bottom: 6px;">打造高并发系统的演进法则</div>
  <div style="font-size: 13.5px; color: #334155; line-height: 1.7;">通过点阵网格构建理性的秩序美学，适合科技测评与架构复盘。</div>
</section>`
  },
  {
    id: 'bg-grid-dense',
    category: 'backgrounds',
    tag: '极客',
    title: '密集坐标纸底纹 (Micro Grid)',
    description: '10px 紧凑坐标微格',
    tags: ['坐标纸', '工程', '严谨'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #ffffff; background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px); background-size: 10px 10px, 10px 10px; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #047857; letter-spacing: 0.5px; margin-bottom: 6px;">硬核算法与底层数据结构</div>
  <div style="font-size: 13.5px; color: #334155; line-height: 1.7;">严谨的工程坐标方格纸纹理，赋予技术长文出版级沉浸感。</div>
</section>`
  },
  {
    id: 'bg-stripes-diag',
    category: 'backgrounds',
    tag: '质感',
    title: '极简斜线纹理 (Diagonal Lines)',
    description: '45° 细腻微斜纹',
    tags: ['斜纹', '纸质感', '高级'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #ffffff; background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.025) 0px, rgba(0, 0, 0, 0.025) 1px, transparent 1px, transparent 10px); border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #b45309; letter-spacing: 0.5px; margin-bottom: 6px;">关于质感生活的美学随笔</div>
  <div style="font-size: 13.5px; color: #334155; line-height: 1.7;">45° 细腻微斜纹肌理，营造纸质特种纸触感。</div>
</section>`
  },
  {
    id: 'bg-paper-lines',
    category: 'backgrounds',
    tag: '文艺',
    title: '信笺横格本 (Ruled Paper)',
    description: '28px 笔记本信笺横线',
    tags: ['信笺', '横格', '手账'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #fefcf8; background-image: repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(0, 0, 0, 0.05) 28px); background-size: 100% 28px; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #7c2d12; letter-spacing: 0.5px; margin-bottom: 4px; line-height: 28px;">见字如面 · 岁月静好</div>
  <div style="font-size: 13.5px; color: #451a03; line-height: 28px;">笔记本信笺横线，记录生活闪光时刻。</div>
</section>`
  },
  {
    id: 'bg-blueprint',
    category: 'backgrounds',
    tag: '科技',
    title: '蓝调科技方阵 (Blueprint)',
    description: '24px 科技蓝图方阵网格',
    tags: ['蓝图', '科技', '蓝调'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #f8fafc; background-image: linear-gradient(rgba(37, 99, 235, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.07) 1px, transparent 1px); background-size: 24px 24px, 24px 24px; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #1d4ed8; letter-spacing: 0.5px; margin-bottom: 6px;">Next-Gen AI 生产力指南</div>
  <div style="font-size: 13.5px; color: #1e3a8a; line-height: 1.7;">蓝调科技工程方格网，科技感与现代感兼备。</div>
</section>`
  },
  {
    id: 'bg-cross',
    category: 'backgrounds',
    tag: '高级',
    title: '微十字星位矩阵 (Cross Grid)',
    description: '24px 交叉十字星位矩阵',
    tags: ['十字', '矩阵', '留白'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #ffffff; background-image: radial-gradient(rgba(0, 0, 0, 0.07) 2px, transparent 2px), radial-gradient(rgba(0, 0, 0, 0.07) 2px, transparent 2px); background-position: 0 0, 12px 12px; background-size: 24px 24px; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #334155; letter-spacing: 0.5px; margin-bottom: 6px;">极简留白与视觉张力</div>
  <div style="font-size: 13.5px; color: #475569; line-height: 1.7;">微十字星位阵列，赋予版面极高的呼吸感与纯净度。</div>
</section>`
  },
  {
    id: 'bg-clean-none',
    category: 'backgrounds',
    tag: '纯色',
    title: '极简纯色 (无底纹)',
    description: '纯色背景无叠加纹理',
    tags: ['纯色', '极简', '纯净'],
    html: `<section style="margin: 0; padding: 24px 20px; min-height: 100px; background-color: #ffffff; border-radius: 8px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; margin-bottom: 6px;">纯粹质感 · 极简阅读</div>
  <div style="font-size: 13.5px; color: #334155; line-height: 1.7;">无底纹干扰，还原最干净纯粹的文字排版力量。</div>
</section>`
  },
  // ── 135 爆款精选 ──
  {
    id: 'h-135-part01-leaf',
    category: 'headings',
    tag: '135爆款',
    title: '135 PART.01 黄绿夏风标题',
    description: '倾斜 PART.01 标牌 + 弧形手绘箭头 + 绿叶波浪划线标题',
    tags: ['135爆款', 'PART.01', '绿叶'],
    html: `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 6px; line-height: 1;">
      <section style="display: inline-block; vertical-align: bottom; background: #facc15; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-6deg); transform: rotate(-6deg); -webkit-box-shadow: 2px 2px 0px rgba(245,158,11,0.25); box-shadow: 2px 2px 0px rgba(245,158,11,0.25); letter-spacing: 0.5px; font-family: -apple-system, sans-serif; margin-right: 6px;">
        PART.01
      </section>
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none" style="display: inline-block; vertical-align: bottom; margin-bottom: 1px;">
        <path d="M2 3 C10 0, 18 3, 24 13 M18 11 L24 13 L22 7" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #2e8b57; letter-spacing: 1px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
            八月拾夏 静待秋风
          </span>
          <svg width="100%" height="8" viewBox="0 0 140 8" preserveAspectRatio="none" fill="none" style="display: block; margin-top: 3px;">
            <path d="M0 2 Q 10 7, 20 2 T 40 2 T 60 2 T 80 2 T 100 2 T 120 2 T 140 2 M0 6 Q 10 11, 20 6 T 40 6 T 60 6 T 80 6 T 100 6 T 120 6 T 140 6" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </section>
        <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 20px; line-height: 1;">🌿</section>
      </section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-135-part02-peach',
    category: 'headings',
    tag: '135热选',
    title: '135 PART.02 蜜桃浪漫标题',
    description: '倾斜粉红标牌 + 手绘心形小弧线 + 甜美粉色下划线',
    tags: ['135爆款', 'PART.02', '蜜桃粉'],
    html: `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 6px; line-height: 1;">
      <section style="display: inline-block; vertical-align: bottom; background: #f43f5e; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-5deg); transform: rotate(-5deg); -webkit-box-shadow: 2px 2px 0px rgba(225,29,72,0.25); box-shadow: 2px 2px 0px rgba(225,29,72,0.25); margin-right: 6px;">
        PART.02
      </section>
      <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">✨</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #be123c; letter-spacing: 0.8px; display: inline-block; word-break: break-word;">
            关于生活中的温柔复苏
          </span>
          <section style="height: 3px; background: #fecdd3; border-radius: 2px; margin-top: 4px;"></section>
        </section>
        <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 20px; line-height: 1;">🍑</section>
      </section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-135-part03-purple',
    category: 'headings',
    tag: '135热选',
    title: '135 PART.03 香草薰衣草紫标题',
    description: '倾斜紫色标牌 + 优雅星光点缀 + 紫色粗划线',
    tags: ['135爆款', 'PART.03', '香草紫'],
    html: `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 6px; line-height: 1;">
      <section style="display: inline-block; vertical-align: bottom; background: #8b5cf6; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-4deg); transform: rotate(-4deg); -webkit-box-shadow: 2px 2px 0px rgba(139,92,246,0.25); box-shadow: 2px 2px 0px rgba(139,92,246,0.25); margin-right: 6px;">
        PART.03
      </section>
      <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">🌙</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #5b21b6; letter-spacing: 0.8px; display: inline-block; word-break: break-word;">
            晚风拂过 枕着星河入梦
          </span>
          <section style="height: 3px; background: #ddd6fe; border-radius: 2px; margin-top: 4px;"></section>
        </section>
        <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 20px; line-height: 1;">🍇</section>
      </section>
    </section>
  </section>
</section>`
  },

  // ── 标题/序号素材 ──
  {
    id: 'h-135-bubble-01',
    category: 'headings',
    tag: '135爆款',
    title: '135双重气泡块序号标题',
    description: '实心与淡色双层圆圈序号，搭配加粗标题',
    tags: ['135热选', '序号标题', '蓝色'],
    html: `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 34px; line-height: 1;">
        <section style="background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 800; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; -webkit-box-shadow: 0 4px 10px rgba(37,99,235,0.3); box-shadow: 0 4px 10px rgba(37,99,235,0.3);">01</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 12px;">
        <span style="font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px; line-height: 1.4; word-break: break-word; display: block;">避免用战术上的勤奋，掩盖战略上的懒惰</span>
      </section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-135-yellow-3d',
    category: 'headings',
    tag: '135精选',
    title: '135经典立体明黄浮雕标题',
    description: '黄色立体沉底图层 + 左倾小方块，高对比强吸睛',
    tags: ['135热选', '明黄', '立体风'],
    html: `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; background: #fef08a; padding: 8px 16px 8px 12px; border-radius: 6px; -webkit-box-shadow: 3px 3px 0px #f59e0b; box-shadow: 3px 3px 0px #f59e0b; max-width: 100%; box-sizing: border-box; text-align: left;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 8px; line-height: 1;">
        <span style="width: 8px; height: 18px; background: #d97706; border-radius: 2px; display: block;"></span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 16px; font-weight: 800; color: #78350f; line-height: 1.4; word-break: break-word; display: block;">打造高转化率的爆款文章结构</span>
      </section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-135-3d-mint-num',
    category: 'headings',
    tag: '135热选',
    title: '135薄荷绿立体 02 序号标题',
    description: '薄荷绿圆角方块 + 侧阴影，清新爽朗适合教程结构',
    tags: ['135热选', '薄荷绿', '序号'],
    html: `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 36px; line-height: 1;">
        <section style="background: #10b981; color: #ffffff; font-weight: bold; font-size: 16px; width: 36px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; -webkit-box-shadow: 3px 3px 0px #047857; box-shadow: 3px 3px 0px #047857;">02</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 10px;">
        <span style="font-size: 17px; font-weight: bold; color: #064e3b; letter-spacing: 0.5px; line-height: 1.4; word-break: break-word; display: block;">突破认知瓶颈</span>
      </section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-135-morandi-block',
    category: 'headings',
    tag: '莫兰迪',
    title: '135莫兰迪双色拼接标题',
    description: '低饱和度莫兰迪色系拼接，高级沉稳，适合文化随笔',
    tags: ['莫兰迪', '高级感', '拼接'],
    html: `<section style="margin: 22px 0 14px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-radius: 6px; overflow: hidden; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; background: #a3b18a; color: #ffffff; font-weight: bold; font-size: 13px; padding: 8px 12px; letter-spacing: 0.5px; white-space: nowrap;">SECTION</section>
      <section style="display: table-cell; vertical-align: middle; background: #dad7cd; color: #3a5a40; font-weight: bold; font-size: 15px; padding: 8px 16px; word-break: break-word; line-height: 1.4;">发现闪光日常</section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-135-guofeng-cloud',
    category: 'headings',
    tag: '国风',
    title: '135国风古韵红木印章标题',
    description: '浓郁中国风红木底纹 + 居中宋体，适合传统文化',
    tags: ['国风', '朱红', '宋体'],
    html: `<section style="margin: 26px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-block; padding: 6px 24px; border-top: 2px solid #991b1b; border-bottom: 2px solid #991b1b; background: #fff5f5; max-width: 100%; box-sizing: border-box; word-break: break-word;">
    <span style="font-family: 'SimSun', 'Songti SC', serif; font-size: 17px; font-weight: bold; color: #991b1b; letter-spacing: 2px; line-height: 1.4;">❖ 闲情记趣 · 岁时节气 ❖</span>
  </section>
</section>`
  },
  {
    id: 'h-bar-emerald',
    category: 'headings',
    tag: '极简',
    title: '135极简翡翠绿包边标题',
    description: '带有柔和绿底色与左边框修饰，清新耐看',
    tags: ['包边标题', '绿色', '极简'],
    html: `<section style="margin: 22px 0 14px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-block; padding: 8px 16px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0; text-align: left; max-width: 100%; box-sizing: border-box; word-break: break-word;">
    <span style="font-size: 16px; font-weight: bold; color: #065f46; line-height: 1.4;">构建持续交付 SOP</span>
  </section>
</section>`
  },
  {
    id: 'h-135-tech-cyber',
    category: 'headings',
    tag: '科技感',
    title: '135赛博黑金科技感标题',
    description: '黑底金边科技光感标题，适合数码测评与 AI 前沿',
    tags: ['黑金', '科技感', '数码'],
    html: `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; background: #0f172a; padding: 10px 18px; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; line-height: 1.4; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 22px; line-height: 1;">
        <span style="color: #f59e0b; font-size: 18px; display: block;">⚡</span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 16px; font-weight: bold; color: #f8fafc; letter-spacing: 0.5px; word-break: break-word; display: block;">GenAI 业务落地痛点</span>
      </section>
    </section>
  </section>
</section>`
  },

  // ── 引用/金句素材 ──
  {
    id: 'q-135-big-quote',
    category: 'quotes',
    tag: '135热选',
    title: '135经典大型对话双引号框',
    description: '包含优雅的放大双引号与微阴影圆角边框',
    tags: ['135金句', '双引号', '名言'],
    html: `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative; word-break: break-word;" data-material="true">
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-right: 4px;">“</span>
  能力增长并不是斜率不变的直线，而是呈现指数级上升的复利曲线。认准方向并持续做对的事，时间会给努力的人最好的答复。
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-left: 4px;">”</span>
</blockquote>`
  },
  {
    id: 'q-135-speech-bubble',
    category: 'quotes',
    tag: '135爆款',
    title: '135极简对话气泡金句框',
    description: '带底部对话小尖角与蓝色圆点修饰的爆款气泡引用框',
    tags: ['135爆款', '气泡框', '对话'],
    html: `<div style="margin: 22px 0;" data-material="true">
  <section style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; color: #1e40af; font-size: 14.5px; line-height: 1.8; position: relative; word-break: break-word;">
    <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #1d4ed8;">💬 深度洞察：</strong>
    把时间浪费在值得的事情上，把精力投注给懂你的人。不慌不忙，静待花开。
  </section>
</div>`
  },
  {
    id: 'q-135-paper-fold',
    category: 'quotes',
    tag: '便签风',
    title: '135便签折角贴纸引用框',
    description: '带有淡黄便签感与贴纸效果，亲切随和',
    tags: ['便签', '温暖', '随笔'],
    html: `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #854d0e; font-size: 14px; line-height: 1.8; word-break: break-word;" data-material="true">
  📖 <strong>读书札记：</strong> “生活原本沉闷，但跑起来就有风。” 把精力放在值得的人与事上，不盲从、不慌张。
</blockquote>`
  },
  {
    id: 'q-gradient-bar',
    category: 'quotes',
    tag: '推荐',
    title: '135渐变侧条优雅导读',
    description: '左侧采用高质感 Blue-Indigo 渐变粗边条',
    tags: ['渐变边条', '高颜值', '经典'],
    html: `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75; word-break: break-word;" data-material="true">
  <strong>💡 导读摘要：</strong> 真正的高手，都在用“杠杆思维”做选择，而不是在低水平的重复劳动中自我感动。
</blockquote>`
  },
  {
    id: 'q-dark-slate',
    category: 'quotes',
    tag: '高级感',
    title: '135深灰极简黑金修饰框',
    description: '深色纸面感引用框，极简而有高级感',
    tags: ['极简', '暗色', '冷峻'],
    html: `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15); word-break: break-word;" data-material="true">
  📌 <strong>架构法则：</strong> 不要为了设计而设计。好的架构是在业务交付速度与系统可维护性之间找到最佳平衡点。
</blockquote>`
  },

  // ── 提示/卡片素材 ──
  {
    id: 'c-135-orange-fire',
    category: 'callouts',
    tag: '135爆款',
    title: '135爆款橙色热度关注框',
    description: '橙色高光底色 + 🔥 热度图标',
    tags: ['135热选', '橙色', '爆款'],
    html: `<section style="margin: 20px 0; padding: 16px 20px; background: #fff7ed; border: 1px solid #ffedd5; border-left: 5px solid #f97316; border-radius: 8px; color: #c2410c; font-size: 14px; line-height: 1.75; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #ea580c;">
    🔥 核心热点干货：
  </strong>
  文末附完整可导出的 PDF 讲义与配套源码下载链接，欢迎收藏分享！
</section>`
  },
  {
    id: 'c-135-keypoints-cards',
    category: 'callouts',
    tag: '135热选',
    title: '135三要点小色块组合卡片',
    description: '包含 3 个带柔和彩色底块的小干货总结，清晰有条理',
    tags: ['要点总结', '彩色色块', '卡片'],
    html: `<section style="margin: 22px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true">
  <div style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 12px; word-break: break-word;">
    🎯 本章核心避坑指南
  </div>
  <div>
    <div style="background: #fef2f2; border-radius: 6px; padding: 8px 12px; color: #991b1b; font-size: 13.5px; margin-bottom: 8px; word-break: break-word;">
      📍 <strong>一忌：</strong> 盲目追求全量微服务，增加运维成本。
    </div>
    <div style="background: #fefce8; border-radius: 6px; padding: 8px 12px; color: #854d0e; font-size: 13.5px; margin-bottom: 8px; word-break: break-word;">
      📍 <strong>二忌：</strong> 缺少统一的高可用监控与链路追踪。
    </div>
    <div style="background: #ecfdf5; border-radius: 6px; padding: 8px 12px; color: #065f46; font-size: 13.5px; word-break: break-word;">
      📍 <strong>三宜：</strong> 保持演进式架构，随业务体量按需拆分。
    </div>
  </div>
</section>`
  },
  {
    id: 'c-note-blue',
    category: 'callouts',
    tag: '提示',
    title: '💡 蓝色 Note 提示卡片',
    description: '柔和浅蓝背景 + 💡 图标 header',
    tags: ['提示卡片', '蓝色', 'Note'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">💡 温馨提示：</strong>
  在日常工作中，尽量把重复性任务沉淀为标准 SOP 或脚本工具，从而释放精力投入核心思考。
</section>`
  },
  {
    id: 'c-warning-red',
    category: 'callouts',
    tag: '警告',
    title: '⚠️ 红色 Warning 警告卡片',
    description: '淡红背景 + ⚠️ 图标，用于醒目标注注意事项',
    tags: ['警告卡片', '红色', 'Warning'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">⚠️ 注意事项：</strong>
  切勿直接在主线程中执行耗时的 I/O 操作，否则会导致 UI 卡顿与界面无响应。
</section>`
  },
  {
    id: 'c-success-green',
    category: 'callouts',
    tag: '推荐',
    title: '✅ 绿色 Success 推荐方案卡片',
    description: '淡绿背景 + ✅ 图标',
    tags: ['成功卡片', '绿色', 'Success'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">✅ 推荐方案：</strong>
  推荐采用同城双活 + 异地多活部署架构，确保单机房故障时服务零中断。
</section>`
  },

  // ── 分割线素材 ──
  {
    id: 'd-135-scissors',
    category: 'dividers',
    tag: '135爆款',
    title: '135剪刀裁剪虚线分割线',
    description: '趣味剪刀图标 + 虚线切割',
    tags: ['剪刀', '裁剪', '趣味'],
    html: `<section data-material="true" style="margin: 26px auto; color: #94a3b8; font-size: 14px; line-height: 1; display: flex; align-items: center; width: 100%; box-sizing: border-box;">
  <span style="flex-shrink: 0; margin-right: 8px;">✂️</span>
  <section style="flex: 1; border-top: 2px dashed #cbd5e1; height: 0;"></section>
</section>`
  },
  {
    id: 'd-135-double-wave',
    category: 'dividers',
    tag: '135热选',
    title: '135暖黄浪漫浪花分割线',
    description: '优雅手绘双重浪花线条，带渐变过渡',
    tags: ['波浪', '暖黄', '优雅'],
    html: `<section data-material="true" style="text-align: center; margin: 26px auto; width: 100%; display: block; clear: both;">
  <svg width="200" height="12" viewBox="0 0 200 12" fill="none" style="display: inline-block; margin: 0 auto; max-width: 100%;">
    <path d="M0 6 Q 15 0, 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 200 6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  </svg>
</section>`
  },
  {
    id: 'd-dots',
    category: 'dividers',
    tag: '极简',
    title: '三点星光居中分割线',
    description: '居中修饰三个优雅圆点',
    tags: ['点状', '居中', '优雅'],
    html: `<section data-material="true" style="text-align: center; margin: 26px auto; color: #cbd5e1; font-size: 18px; letter-spacing: 12px; width: 100%; clear: both;">• • •</section>`
  },
  {
    id: 'd-dashed-blue',
    category: 'dividers',
    tag: '蓝色',
    title: '蓝色淡雅虚线分割线',
    description: '轻盈的虚线分割线',
    tags: ['虚线', '蓝色', '淡雅'],
    html: `<section data-material="true" style="margin: 26px auto; width: 100%; text-align: center; clear: both;"><hr style="border: none; border-top: 2px dashed #93c5fd; margin: 0 auto; width: 100%;" /></section>`
  },

  // ── 步骤/列表素材 ──
  {
    id: 'l-135-timeline',
    category: 'lists',
    tag: '里程碑',
    title: '135纵向里程碑时间轴',
    description: '带有连接线与圆点标记的纵向流程卡片',
    tags: ['时间轴', '里程碑', '流程'],
    html: `<section style="margin: 20px 0; padding-left: 8px; border-left: 2px solid #3b82f6;" data-material="true">
  <div style="position: relative; padding-left: 18px; margin-bottom: 16px;">
    <div style="position: absolute; left: -24px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; border: 2px solid #ffffff;"></div>
    <div style="font-size: 14px; font-weight: 700; color: #1e293b; word-break: break-word;">阶段一：架构重构与模块解耦</div>
    <div style="font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-word;">清理历史冗余代码，统一接口定义规范</div>
  </div>
  <div style="position: relative; padding-left: 18px;">
    <div style="position: absolute; left: -24px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #ffffff;"></div>
    <div style="font-size: 14px; font-weight: 700; color: #1e293b; word-break: break-word;">阶段二：性能调优与容量提升</div>
    <div style="font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-word;">引入二级缓存机制，QPS 提升 300%</div>
  </div>
</section>`
  },
  {
    id: 'l-step-numbers',
    category: 'lists',
    tag: '步骤',
    title: '彩色数字圆圈步骤列表',
    description: '优雅的数字序号引导',
    tags: ['步骤列表', '数字', '教程'],
    html: `<section style="margin: 20px 0;" data-material="true">
  <div style="margin-bottom: 12px; line-height: 1.7; display: flex; align-items: flex-start;">
    <span style="flex-shrink: 0; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; margin-top: 2px;">1</span><div style="flex: 1; font-size: 14.5px; color: #334155; word-break: break-word;"><strong>第一步：导入/撰写 Markdown 内容</strong></div>
  </div>
  <div style="margin-bottom: 12px; line-height: 1.7; display: flex; align-items: flex-start;">
    <span style="flex-shrink: 0; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; margin-top: 2px;">2</span><div style="flex: 1; font-size: 14.5px; color: #334155; word-break: break-word;"><strong>第二步：选择排版主题与代码高亮</strong></div>
  </div>
</section>`
  },

  // ── 顶部导读/关注头卡素材 ──
  {
    id: 'hdr-135-guide-card',
    category: 'header_widgets',
    tag: '135爆款',
    title: '135爆款文章导读与作者头卡',
    description: '包含发刊词、阅读时长与关注按钮的精致头部挂件',
    tags: ['头部导读', '关注头卡', '135爆款'],
    html: `<section style="margin: 0 0 24px 0; padding: 18px 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; box-sizing: border-box;" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;">独家专栏</span>
      <span style="font-size: 13px; font-weight: 700; color: #166534;">深度复盘 · 值得精读</span>
    </div>
    <span style="font-size: 12px; color: #15803d; background: #ffffff; padding: 2px 8px; border-radius: 12px; border: 1px solid #86efac;">⏱️ 预计精读 5 分钟</span>
  </div>
  <p style="font-size: 13.5px; line-height: 1.7; color: #14532d; margin: 0; word-break: break-word;">
    💡 <strong>导读摘要：</strong> 本文系统梳理了从底层原理到工程落地的完整方法论，建议收藏后反复研读与实操实践。
  </p>
</section>`
  },
  {
    id: 'hdr-simple-indigo',
    category: 'header_widgets',
    tag: '商务极简',
    title: '青黛极简文章导读栏',
    description: '蓝调商务极简导读，带阅读建议与专题标识',
    tags: ['极简导读', '商务', '青黛'],
    html: `<section style="margin: 0 0 22px 0; padding: 14px 18px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; box-sizing: border-box;" data-material="true">
  <div style="font-size: 14px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
    <span>📌</span> <span>阅读指引 / Reading Guide</span>
  </div>
  <div style="font-size: 13px; color: #475569; line-height: 1.6;">
    本文已同步收录至全网知识库合集，点击右上角关注公众号不错过每周硬核干货。
  </div>
</section>`
  },

  // ── 关注/文末三连卡片素材 ──
  {
    id: 'f-135-triple-like',
    category: 'footer_widgets',
    tag: '135爆款',
    title: '135爆款文末三连交互卡片',
    description: '包含“点赞 · 在看 · 分享”互动提醒',
    tags: ['互动三连', '点赞在看', '135爆款'],
    html: `<section style="margin: 28px 0 16px; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;" data-material="true">
  <p style="font-size: 14.5px; font-weight: 700; color: #1e293b; margin-bottom: 12px; word-break: break-word;">如果这篇文章对你有启发，欢迎转发分享！</p>
  <div style="text-align: center; color: #475569; font-size: 13px; font-weight: 600; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">👍 点赞</span>
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">👀 在看</span>
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">🚀 分享</span>
  </div>
</section>`
  },
  {
    id: 'f-135-qrcode-card',
    category: 'footer_widgets',
    tag: '135爆款',
    title: '135经典二维码关注引导卡片',
    description: '高转化微信公众号二维码关注框，带有扫码提示手势',
    tags: ['关注卡片', '二维码', '135爆款'],
    html: `<section style="margin: 28px 0 16px; padding: 22px; background: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 16px; text-align: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #6b21a8; margin-bottom: 4px;">👇 长按识别二维码 · 关注公众号</div>
  <p style="font-size: 13px; color: #7e22ce; margin-bottom: 14px;">每周日晚 20:00 准时推送独家深度复盘</p>
  <div style="display: inline-block; padding: 10px; background: #ffffff; border-radius: 12px; -webkit-box-shadow: 0 4px 12px rgba(107,33,168,0.08); box-shadow: 0 4px 12px rgba(107,33,168,0.08);">
    <div style="width: 110px; height: 110px; line-height: 110px; text-align: center; background: #f3e8ff; border: 2px dashed #c084fc; border-radius: 8px; color: #9333ea; font-size: 12px; font-weight: 600;">
      [ 二维码区域 ]
    </div>
  </div>
</section>`
  },
  {
    id: 'f-author-cta',
    category: 'footer_widgets',
    tag: '名片',
    title: '壹伴极简作者名片与关注卡片',
    description: '包含作者介绍、关注引导与高质感圆角边框',
    tags: ['关注卡片', '作者介绍', 'CTA'],
    html: `<section style="margin: 28px 0 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.03); text-align: center;" data-material="true">
  <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">✍️ 程序员小富</p>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.5;">专注分享后端高并发架构、前端高颜值排版与职场成长思考</p>
  <span style="display: inline-block; padding: 8px 22px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">欢迎关注本公众号 · 获取精选深度干货</span>
</section>`
  }
];

// ── 标题模版定义（H1 / H2 / H3 / H4 / H5 / H6）──
export const headingTemplates = [
  {
    id: 'none',
    name: '默认主题样式',
    description: '使用当前主题预设的标题 CSS 渲染，不使用固定素材图块',
    tag: '默认',
    styleCategory: 'all',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="font-size: 15px; font-weight: bold; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">默认主题标题</div>`,
    render: () => null
  },
  {
    id: 'h-135-part01-leaf',
    name: '135 PART.01 黄绿夏风标牌',
    description: '倾斜 PART.01 标牌 + 弧形手绘箭头 + 绿叶波浪划线标题',
    tag: '135爆款',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: true,
    previewHtml: `<div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:2px;"><div style="background:#facc15;color:#fff;font-weight:800;font-size:10px;padding:1px 6px;border-radius:3px;transform:rotate(-6deg);">PART.01</div></div><div style="font-size:13px;font-weight:800;color:#2e8b57;">八月拾夏 静待秋风 🌿</div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'PART';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 6px; line-height: 1;">
      <section style="display: inline-block; vertical-align: bottom; background: #facc15; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-6deg); transform: rotate(-6deg); -webkit-box-shadow: 2px 2px 0px rgba(245,158,11,0.25); box-shadow: 2px 2px 0px rgba(245,158,11,0.25); letter-spacing: 0.5px; font-family: -apple-system, sans-serif; margin-right: 6px;">
        ${prefix}.${indexPadded}
      </section>
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none" style="display: inline-block; vertical-align: bottom; margin-bottom: 1px;">
        <path d="M2 3 C10 0, 18 3, 24 13 M18 11 L24 13 L22 7" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #2e8b57; letter-spacing: 1px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
            ${title}
          </span>
          <svg width="100%" height="8" viewBox="0 0 140 8" preserveAspectRatio="none" fill="none" style="display: block; margin-top: 3px;">
            <path d="M0 2 Q 10 7, 20 2 T 40 2 T 60 2 T 80 2 T 100 2 T 120 2 T 140 2 M0 6 Q 10 11, 20 6 T 40 6 T 60 6 T 80 6 T 100 6 T 120 6 T 140 6" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </section>
        <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 20px; line-height: 1;">🌿</section>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-part02-peach',
    name: '135 PART.02 蜜桃浪漫',
    description: '倾斜粉红标牌 + 甜美蜜桃与粉色下划线',
    tag: '135热选',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: true,
    previewHtml: `<div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:2px;"><div style="background:#f43f5e;color:#fff;font-weight:800;font-size:10px;padding:1px 6px;border-radius:3px;transform:rotate(-5deg);">PART.02</div></div><div style="font-size:13px;font-weight:800;color:#be123c;">关于生活中的温柔 🍑</div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'PART';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 6px; line-height: 1;">
      <section style="display: inline-block; vertical-align: bottom; background: #f43f5e; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-5deg); transform: rotate(-5deg); -webkit-box-shadow: 2px 2px 0px rgba(225,29,72,0.25); box-shadow: 2px 2px 0px rgba(225,29,72,0.25); margin-right: 6px;">
        ${prefix}.${indexPadded}
      </section>
      <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">✨</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #be123c; letter-spacing: 0.8px; display: inline-block; word-break: break-word;">
            ${title}
          </span>
          <section style="height: 3px; background: #fecdd3; border-radius: 2px; margin-top: 4px;"></section>
        </section>
        <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 20px; line-height: 1;">🍑</section>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-part03-purple',
    name: '135 PART.03 香草薰衣草紫',
    description: '倾斜紫色标牌 + 优雅星月点缀 + 香草紫下划线',
    tag: '135热选',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: true,
    previewHtml: `<div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:2px;"><div style="background:#8b5cf6;color:#fff;font-weight:800;font-size:10px;padding:1px 6px;border-radius:3px;transform:rotate(-4deg);">PART.03</div></div><div style="font-size:13px;font-weight:800;color:#5b21b6;">枕着星河入梦 🌙</div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'PART';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 6px; line-height: 1;">
      <section style="display: inline-block; vertical-align: bottom; background: #8b5cf6; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-4deg); transform: rotate(-4deg); -webkit-box-shadow: 2px 2px 0px rgba(139,92,246,0.25); box-shadow: 2px 2px 0px rgba(139,92,246,0.25); margin-right: 6px;">
        ${prefix}.${indexPadded}
      </section>
      <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">🌙</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #5b21b6; letter-spacing: 0.8px; display: inline-block; word-break: break-word;">
            ${title}
          </span>
          <section style="height: 3px; background: #ddd6fe; border-radius: 2px; margin-top: 4px;"></section>
        </section>
        <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 20px; line-height: 1;">🍇</section>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-bubble-01',
    name: '135 气泡圆圈序号标题',
    description: '实心蓝色圆圈数字 01, 02 + 悬浮阴影标题',
    tag: '135爆款',
    styleCategory: 'business',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;"><span style="background:#2563eb;color:#fff;font-size:11px;font-weight:800;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">01</span><span style="font-size:13px;font-weight:700;color:#1e293b;">战略思维与底层认知</span></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 34px; line-height: 1;">
        <section style="background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 800; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; -webkit-box-shadow: 0 4px 10px rgba(37,99,235,0.3); box-shadow: 0 4px 10px rgba(37,99,235,0.3);">${indexPadded}</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 12px;">
        <span style="font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px; line-height: 1.4; word-break: break-word; display: block;">${title}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-yellow-3d',
    name: '135 经典立体明黄浮雕',
    description: '黄色立体沉底图层 + 左侧亮黄方块',
    tag: '135爆款',
    styleCategory: 'fresh',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="background:#fef08a;padding:4px 8px;border-radius:4px;box-shadow:2px 2px 0 #f59e0b;font-size:12px;font-weight:800;color:#78350f;">打造高转化率结构</div>`,
    render: (title) => {
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; background: #fef08a; padding: 8px 16px 8px 12px; border-radius: 6px; -webkit-box-shadow: 3px 3px 0px #f59e0b; box-shadow: 3px 3px 0px #f59e0b; max-width: 100%; box-sizing: border-box; text-align: left;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 8px; line-height: 1;">
        <span style="width: 8px; height: 18px; background: #d97706; border-radius: 2px; display: block;"></span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 16px; font-weight: 800; color: #78350f; line-height: 1.4; word-break: break-word; display: block;">${title}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-3d-mint-num',
    name: '135 薄荷绿立体 02 序号',
    description: '薄荷绿圆角方块 + 侧阴影 01, 02 序号块',
    tag: '135热选',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;"><div style="background:#10b981;color:#fff;font-size:10px;font-weight:bold;padding:2px 5px;border-radius:4px;box-shadow:2px 2px 0 #047857;">02</div><span style="font-size:12px;font-weight:bold;color:#064e3b;">突破认知瓶颈</span></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 36px; line-height: 1;">
        <section style="background: #10b981; color: #ffffff; font-weight: bold; font-size: 16px; width: 36px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; -webkit-box-shadow: 3px 3px 0px #047857; box-shadow: 3px 3px 0px #047857;">${indexPadded}</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 10px;">
        <span style="font-size: 17px; font-weight: bold; color: #064e3b; letter-spacing: 0.5px; line-height: 1.4; word-break: break-word; display: block;">${title}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-morandi-block',
    name: '135 莫兰迪双色拼接',
    description: '低饱和度莫兰迪色系拼接，高级沉稳',
    tag: '莫兰迪',
    styleCategory: 'minimal',
    hasAutoNumber: false,
    hasCustomPrefix: true,
    previewHtml: `<div style="display:inline-flex;border-radius:4px;overflow:hidden;font-size:11px;"><span style="background:#a3b18a;color:#fff;padding:2px 5px;font-weight:bold;">SECTION</span><span style="background:#dad7cd;color:#3a5a40;padding:2px 6px;font-weight:bold;">发现闪光日常</span></div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'SECTION';
      return `<section style="margin: 22px 0 14px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-radius: 6px; overflow: hidden; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; background: #a3b18a; color: #ffffff; font-weight: bold; font-size: 13px; padding: 8px 12px; letter-spacing: 0.5px; white-space: nowrap;">${prefix}</section>
      <section style="display: table-cell; vertical-align: middle; background: #dad7cd; color: #3a5a40; font-weight: bold; font-size: 15px; padding: 8px 16px; word-break: break-word; line-height: 1.4;">${title}</section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-guofeng-cloud',
    name: '135 国风古韵红木印章',
    description: '浓郁中国风红木上下边框 + ❖ 符号',
    tag: '国风',
    styleCategory: 'guofeng',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="padding:2px 8px;border-top:1px solid #991b1b;border-bottom:1px solid #991b1b;color:#991b1b;font-size:11px;font-weight:bold;text-align:center;">❖ 岁时节气 ❖</div>`,
    render: (title) => {
      return `<section style="margin: 26px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-block; padding: 6px 24px; border-top: 2px solid #991b1b; border-bottom: 2px solid #991b1b; background: #fff5f5; max-width: 100%; box-sizing: border-box; word-break: break-word;">
    <span style="font-family: 'SimSun', 'Songti SC', serif; font-size: 17px; font-weight: bold; color: #991b1b; letter-spacing: 2px; line-height: 1.4;">❖ ${title} ❖</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-bar-emerald',
    name: '135 极简翡翠绿包边',
    description: '带有柔和绿底色与 4px 左侧修饰条',
    tag: '极简',
    styleCategory: 'minimal',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="padding:3px 8px;border-left:3px solid #10b981;background:#ecfdf5;font-size:12px;font-weight:bold;color:#065f46;">构建持续交付 SOP</div>`,
    render: (title) => {
      return `<section style="margin: 22px 0 14px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-block; padding: 8px 16px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0; text-align: left; max-width: 100%; box-sizing: border-box; word-break: break-word;">
    <span style="font-size: 16px; font-weight: bold; color: #065f46; line-height: 1.4;">${title}</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-tech-cyber',
    name: '135 赛博黑金科技感',
    description: '黑底金边科技光感标题，带琥珀闪电图标',
    tag: '科技感',
    styleCategory: 'tech',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="background:#0f172a;padding:3px 8px;border-left:3px solid #f59e0b;color:#f8fafc;font-size:11px;font-weight:bold;">⚡ GenAI 业务落地痛点</div>`,
    render: (title) => {
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; background: #0f172a; padding: 10px 18px; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; line-height: 1.4; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 22px; line-height: 1;">
        <span style="color: #f59e0b; font-size: 18px; display: block;">⚡</span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 16px; font-weight: bold; color: #f8fafc; letter-spacing: 0.5px; word-break: break-word; display: block;">${title}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  // 新增小标牌微素材（特别适合 H3 / H4 / H5 / H6）
  {
    id: 'h-micro-badge-indigo',
    name: '极简青黛序号微标牌',
    description: '轻量级小标题标牌，自带 01/02 微型数字标签',
    tag: '小标题精选',
    styleCategory: 'business',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="display:flex;align-items:center;gap:4px;"><span style="background:#2563eb;color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px;">01</span><span style="font-size:12px;font-weight:bold;color:#1e293b;">核心实现方案</span></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 18px 0 10px; text-align: left; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; max-width: 100%;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; line-height: 1;">
        <span style="background: #2563eb; color: #ffffff; font-size: 12px; font-weight: 700; padding: 2px 7px; border-radius: 4px; display: inline-block;">${indexPadded}</span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.4; display: block;">${title}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-micro-leaf',
    name: '清新草木小标题',
    description: '小巧绿叶图标修饰的清新小标题',
    tag: '小清新',
    styleCategory: 'fresh',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="font-size:12px;font-weight:bold;color:#15803d;display:flex;align-items:center;gap:4px;"><span>🌱</span><span>关键设计原则</span></div>`,
    render: (title) => {
      return `<section style="margin: 18px 0 10px; text-align: left; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-bottom: 2px solid #86efac; padding-bottom: 2px;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 22px; font-size: 15px;">🌱</section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 4px;">
        <span style="font-size: 15px; font-weight: 700; color: #15803d; display: block;">${title}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  }
];

export const headingTemplatesMap = headingTemplates.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});

// ── 引用金句模版 ──
export const quoteTemplates = [
  {
    id: 'none',
    name: '默认主题引用样式',
    description: '使用当前主题预设的引用 CSS 渲染',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<div style="padding: 8px 12px; background: #f1f5f9; border-left: 4px solid #3b82f6; font-size: 12px; color: #334155;">默认引用块 preview...</div>`,
    render: () => null
  },
  {
    id: 'q-135-big-quote',
    name: '135 经典大型对话双引号框',
    description: '包含优雅的放大双引号与微阴影圆角边框',
    tag: '135热选',
    styleCategory: 'business',
    previewHtml: `<div style="padding: 10px 14px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 12px; color: #334155;"><span style="font-size: 18px; color: #2563eb; font-family: Georgia;">“</span> 经典名言与深度引语 <span style="font-size: 18px; color: #2563eb; font-family: Georgia;">”</span></div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative;" data-material="true">
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-right: 4px;">“</span>${content}<span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-left: 4px;">”</span>
</blockquote>`
  },
  {
    id: 'q-135-speech-bubble',
    name: '135 极简对话气泡框',
    description: '对话气泡底色 + 💬 深度洞察图标',
    tag: '135爆款',
    styleCategory: 'fresh',
    previewHtml: `<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #1e40af;">💬 深度洞察：把时间浪费在值得的事情上</div>`,
    render: (content) => `<section style="margin: 22px 0; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; color: #1e40af; font-size: 14.5px; line-height: 1.8;" data-material="true">
  <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #1d4ed8;">💬 深度洞察：</strong>${content}
</section>`
  },
  {
    id: 'q-135-paper-fold',
    name: '135 便签折角贴纸引用框',
    description: '暖黄便签底色 + 5px 亮黄左边框',
    tag: '便签风',
    styleCategory: 'fresh',
    previewHtml: `<div style="padding: 8px 12px; background: #fefce8; border-left: 4px solid #eab308; font-size: 12px; color: #854d0e;">📖 读书札记：生活原本沉闷，但跑起来就有风</div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #854d0e; font-size: 14px; line-height: 1.8;" data-material="true">
  📖 <strong>读书札记：</strong>${content}
</blockquote>`
  },
  {
    id: 'q-gradient-bar',
    name: '135 渐变蓝条优雅导读',
    description: '左侧采用 5px 蓝紫渐变条与浅灰卡片',
    tag: '推荐',
    styleCategory: 'business',
    previewHtml: `<div style="padding: 8px 12px; background: #f1f5f9; border-left: 4px solid #3b82f6; font-size: 12px; color: #475569;">💡 导读摘要：用杠杆思维做选择</div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75;" data-material="true">
  <strong>💡 导读摘要：</strong>${content}
</blockquote>`
  },
  {
    id: 'q-dark-slate',
    name: '135 深灰极简黑金框',
    description: '深色质感引用框，高级沉稳',
    tag: '高级感',
    styleCategory: 'tech',
    previewHtml: `<div style="padding: 8px 12px; background: #0f172a; border-radius: 6px; font-size: 12px; color: #f8fafc;">📌 架构法则：不要为了设计而设计</div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15);" data-material="true">
  📌 <strong>核心要点：</strong>${content}
</blockquote>`
  },
  {
    id: 'c-135-orange-fire',
    name: '135 橙色热度关注框',
    description: '橙色高光底色 + 🔥 热度图标',
    tag: '135爆款',
    styleCategory: 'fresh',
    previewHtml: `<div style="padding: 8px 12px; background: #fff7ed; border-left: 4px solid #f97316; font-size: 12px; color: #c2410c;">🔥 核心干货要点...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 16px 20px; background: #fff7ed; border: 1px solid #ffedd5; border-left: 5px solid #f97316; border-radius: 8px; color: #c2410c; font-size: 14px; line-height: 1.75;" data-material="true">
  <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #ea580c;">🔥 核心干货：</strong>${content}
</section>`
  },
  {
    id: 'c-note-blue',
    name: '💡 蓝色 Note 提示卡片',
    description: '柔和浅蓝背景 + 💡 图标 header',
    tag: '提示',
    styleCategory: 'business',
    previewHtml: `<div style="padding: 8px 12px; background: #eff6ff; border-left: 4px solid #3b82f6; font-size: 12px; color: #1e40af;">💡 温馨提示...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">💡 温馨提示：</strong>${content}
</section>`
  },
  {
    id: 'c-warning-red',
    name: '⚠️ 红色 Warning 警告卡片',
    description: '淡红背景 + ⚠️ 图标',
    tag: '警告',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding: 8px 12px; background: #fef2f2; border-left: 4px solid #ef4444; font-size: 12px; color: #991b1b;">⚠️ 注意事项...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">⚠️ 注意事项：</strong>${content}
</section>`
  },
  {
    id: 'c-success-green',
    name: '✅ 绿色 Success 推荐卡片',
    description: '淡绿背景 + ✅ 图标',
    tag: '推荐',
    styleCategory: 'fresh',
    previewHtml: `<div style="padding: 8px 12px; background: #ecfdf5; border-left: 4px solid #10b981; font-size: 12px; color: #065f46;">✅ 推荐方案...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">✅ 推荐方案：</strong>${content}
</section>`
  }
];

// ── 分割线模版 ──
export const dividerTemplates = [
  {
    id: 'none',
    name: '默认主题分割线',
    description: '使用当前主题预设的分割线样式',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<div style="border-top: 1px solid #cbd5e1; margin: 8px 0;"></div>`,
    render: () => null
  },
  {
    id: 'd-135-scissors',
    name: '135 剪刀裁剪虚线分割线',
    description: '趣味剪刀图标 + 虚线切割',
    tag: '135爆款',
    styleCategory: 'fresh',
    previewHtml: `<div style="color: #94a3b8; font-size: 12px;">✂️ ------------------</div>`,
    render: () => `<section data-material="true" style="margin: 26px auto; color: #94a3b8; font-size: 14px; line-height: 1; display: table; width: 100%; box-sizing: border-box;">
  <section style="display: table-row;">
    <section style="display: table-cell; vertical-align: middle; width: 24px; padding-right: 8px;">✂️</section>
    <section style="display: table-cell; vertical-align: middle; border-top: 2px dashed #cbd5e1; height: 0; width: 100%;"></section>
  </section>
</section>`
  },
  {
    id: 'd-135-double-wave',
    name: '135 暖黄浪漫浪花分割线',
    description: '优雅手绘双重浪花线条',
    tag: '135热选',
    styleCategory: 'fresh',
    previewHtml: `<div style="text-align: center; color: #f59e0b; font-size: 12px;">〰〰〰〰〰</div>`,
    render: () => `<section data-material="true" style="text-align: center; margin: 26px auto; width: 100%; display: block; clear: both;">
  <svg width="200" height="12" viewBox="0 0 200 12" fill="none" style="display: inline-block; margin: 0 auto; max-width: 100%;">
    <path d="M0 6 Q 15 0, 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 200 6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  </svg>
</section>`
  },
  {
    id: 'd-dots',
    name: '三点星光居中分割线',
    description: '居中修饰三个优雅圆点',
    tag: '极简',
    styleCategory: 'minimal',
    previewHtml: `<div style="text-align: center; color: #cbd5e1; font-size: 14px;">• • •</div>`,
    render: () => `<section data-material="true" style="text-align: center; margin: 26px auto; color: #cbd5e1; font-size: 18px; letter-spacing: 12px; width: 100%; clear: both;">• • •</section>`
  },
  {
    id: 'd-dashed-blue',
    name: '蓝色淡雅虚线分割线',
    description: '轻盈的蓝色虚线',
    tag: '蓝色',
    styleCategory: 'business',
    previewHtml: `<div style="border-top: 2px dashed #93c5fd; margin: 8px 0;"></div>`,
    render: () => `<section data-material="true" style="margin: 26px auto; width: 100%; text-align: center; clear: both;"><hr style="border: none; border-top: 2px dashed #93c5fd; margin: 0 auto; width: 100%;" /></section>`
  }
];

// ── 列表模版（UL / OL / LI）──
export const listTemplates = [
  {
    id: 'none',
    name: '默认主题列表',
    description: '使用当前主题的原生列表符号与样式',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<div style="font-size:12px;color:#334155;">• 第一项清单内容<br/>• 第二项清单内容</div>`,
    render: () => null
  },
  {
    id: 'list-badge-step',
    name: '彩色徽章数字序号列表',
    description: '将有序列表项转化为圆形彩色数字徽章卡片',
    tag: '热门推荐',
    styleCategory: 'business',
    hasAutoNumber: true,
    previewHtml: `<div style="font-size:12px;display:flex;flex-direction:column;gap:3px;"><div style="display:flex;gap:4px;"><span style="background:#2563eb;color:#fff;border-radius:50%;width:14px;height:14px;font-size:9px;display:inline-flex;align-items:center;justify-content:center;">1</span><span>第一步方案</span></div><div style="display:flex;gap:4px;"><span style="background:#2563eb;color:#fff;border-radius:50%;width:14px;height:14px;font-size:9px;display:inline-flex;align-items:center;justify-content:center;">2</span><span>第二步实施</span></div></div>`,
    render: (itemHtml, index) => {
      return `<li style="list-style: none; margin-bottom: 10px; display: table; width: 100%;" data-material="true">
  <section style="display: table-row;">
    <section style="display: table-cell; vertical-align: top; width: 32px; line-height: 1;">
      <span style="background: #2563eb; color: #ffffff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; display: inline-block;">${index}</span>
    </section>
    <section style="display: table-cell; vertical-align: top; font-size: 15px; line-height: 1.7; color: #334155; word-break: break-word;">${itemHtml}</section>
  </section>
</li>`;
    }
  },
  {
    id: 'list-leaf-bullet',
    name: '清新绿叶清单列表',
    description: '将无序列表圆点转化为清新小绿叶 🌱 图标',
    tag: '小清新',
    styleCategory: 'fresh',
    previewHtml: `<div style="font-size:12px;color:#15803d;">🌱 核心要点清单一<br/>🌱 核心要点清单二</div>`,
    render: (itemHtml) => {
      return `<li style="list-style: none; margin-bottom: 10px; display: table; width: 100%;" data-material="true">
  <section style="display: table-row;">
    <section style="display: table-cell; vertical-align: top; width: 24px; font-size: 16px; line-height: 1.6;">🌱</section>
    <section style="display: table-cell; vertical-align: top; font-size: 15px; line-height: 1.7; color: #2b2b2b; word-break: break-word;">${itemHtml}</section>
  </section>
</li>`;
    }
  },
  {
    id: 'list-check-card',
    name: '对勾清单卡片',
    description: '带绿色小对勾 ✅ 与微底色的 Checklist 列表',
    tag: 'Checklist',
    styleCategory: 'fresh',
    previewHtml: `<div style="font-size:12px;color:#065f46;background:#ecfdf5;padding:3px 6px;border-radius:4px;">✅ 已完成测试项</div>`,
    render: (itemHtml) => {
      return `<li style="list-style: none; margin-bottom: 8px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 0 6px 6px 0; display: table; width: 100%; box-sizing: border-box;" data-material="true">
  <section style="display: table-row;">
    <section style="display: table-cell; vertical-align: middle; width: 24px; font-size: 14px; line-height: 1;">✅</section>
    <section style="display: table-cell; vertical-align: middle; font-size: 14.5px; color: #334155; word-break: break-word;">${itemHtml}</section>
  </section>
</li>`;
    }
  }
];

// ── 文章全局头尾挂件模版 ──
export const headerWidgetTemplates = [
  {
    id: 'none',
    name: '无顶部导读',
    description: '文章最上方不插入导读卡片',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<div style="color:#94a3b8;font-size:12px;text-align:center;padding:6px;">不添加顶部导读挂件</div>`,
    render: () => ''
  },
  {
    id: 'hdr-135-guide-card',
    name: '135 爆款绿色文章导读卡',
    description: '包含发刊词、阅读时长标签与精读摘要',
    tag: '135爆款',
    styleCategory: 'fresh',
    previewHtml: `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:6px;font-size:11px;color:#166534;"><strong>独家专栏</strong> · ⏱️ 预计精读 5 分钟</div>`,
    render: (options = {}) => {
      const summary = options.summary || '本文系统梳理了从底层逻辑到实操落地的完整方法论，建议收藏后反复研读与实践。';
      const readTime = options.readTime || '5 分钟';
      return `<section style="margin: 0 0 24px 0; padding: 18px 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; box-sizing: border-box;" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;">独家专栏</span>
      <span style="font-size: 13px; font-weight: 700; color: #166534;">深度复盘 · 值得精读</span>
    </div>
    <span style="font-size: 12px; color: #15803d; background: #ffffff; padding: 2px 8px; border-radius: 12px; border: 1px solid #86efac;">⏱️ 预计精读 ${readTime}</span>
  </div>
  <p style="font-size: 13.5px; line-height: 1.7; color: #14532d; margin: 0; word-break: break-word;">
    💡 <strong>导读摘要：</strong> ${summary}
  </p>
</section>`;
    }
  },
  {
    id: 'hdr-simple-indigo',
    name: '青黛极简商务导读栏',
    description: '蓝调商务极简导读，带阅读指引与全网知识库标识',
    tag: '商务极简',
    styleCategory: 'business',
    previewHtml: `<div style="background:#eff6ff;border-left:3px solid #2563eb;padding:6px;font-size:11px;color:#1e40af;">📌 <strong>阅读指引</strong>：硬核干货合集</div>`,
    render: (options = {}) => {
      const guideText = options.guideText || '本文已同步收录至全网知识库合集，点击右上角关注公众号不错过每周硬核干货。';
      return `<section style="margin: 0 0 22px 0; padding: 14px 18px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; box-sizing: border-box;" data-material="true">
  <div style="font-size: 14px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
    <span>📌</span> <span>阅读指引 / Reading Guide</span>
  </div>
  <div style="font-size: 13px; color: #475569; line-height: 1.6;">
    ${guideText}
  </div>
</section>`;
    }
  }
];

export const footerWidgetTemplates = [
  {
    id: 'none',
    name: '无文末挂件',
    description: '文章最下方不插入额外挂件',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<div style="color:#94a3b8;font-size:12px;text-align:center;padding:6px;">不添加文末挂件</div>`,
    render: () => ''
  },
  {
    id: 'f-135-triple-like',
    name: '135 爆款文末三连交互卡片',
    description: '包含“👍 点赞 · 👀 在看 · 🚀 分享”互动按钮',
    tag: '135爆款',
    styleCategory: 'business',
    previewHtml: `<div style="background:#f8fafc;border:1px dashed #cbd5e1;border-radius:6px;padding:6px;font-size:11px;text-align:center;color:#334155;">👍 点赞 · 👀 在看 · 🚀 分享</div>`,
    render: (options = {}) => {
      const tip = options.tip || '如果这篇文章对你有启发，欢迎转发分享！';
      return `<section style="margin: 32px 0 16px; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;" data-material="true">
  <p style="font-size: 14.5px; font-weight: 700; color: #1e293b; margin-bottom: 12px; word-break: break-word;">${tip}</p>
  <div style="text-align: center; color: #475569; font-size: 13px; font-weight: 600; display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">👍 点赞</span>
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">👀 在看</span>
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">🚀 分享</span>
  </div>
</section>`;
    }
  },
  {
    id: 'f-135-qrcode-card',
    name: '135 经典二维码关注引导卡片',
    description: '高转化微信公众号二维码关注框，带有扫码提示手势',
    tag: '135爆款',
    styleCategory: 'fresh',
    previewHtml: `<div style="background:#faf5ff;border:1px dashed #d8b4fe;border-radius:6px;padding:6px;font-size:11px;text-align:center;color:#6b21a8;">👇 长按识别二维码 · 关注公众号</div>`,
    render: (options = {}) => {
      const title = options.title || '👇 长按识别二维码 · 关注公众号';
      const subTitle = options.subTitle || '每周日晚 20:00 准时推送独家深度复盘';
      return `<section style="margin: 32px 0 16px; padding: 22px; background: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 16px; text-align: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #6b21a8; margin-bottom: 4px;">${title}</div>
  <p style="font-size: 13px; color: #7e22ce; margin-bottom: 14px;">${subTitle}</p>
  <div style="display: inline-block; padding: 10px; background: #ffffff; border-radius: 12px; -webkit-box-shadow: 0 4px 12px rgba(107,33,168,0.08); box-shadow: 0 4px 12px rgba(107,33,168,0.08);">
    <div style="width: 110px; height: 110px; line-height: 110px; text-align: center; background: #f3e8ff; border: 2px dashed #c084fc; border-radius: 8px; color: #9333ea; font-size: 12px; font-weight: 600;">
      [ 二维码区域 ]
    </div>
  </div>
</section>`;
    }
  },
  {
    id: 'f-author-cta',
    name: '壹伴极简作者名片',
    description: '包含作者介绍、关注引导与高质感圆角边框',
    tag: '作者名片',
    styleCategory: 'business',
    previewHtml: `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;text-align:center;color:#0f172a;">✍️ 作者名片与关注引导</div>`,
    render: (options = {}) => {
      const author = options.author || '✍️ 程序员小富';
      const desc = options.desc || '专注分享后端高并发架构、前端高颜值排版与职场成长思考';
      return `<section style="margin: 32px 0 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.03); text-align: center;" data-material="true">
  <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${author}</p>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.5;">${desc}</p>
  <span style="display: inline-block; padding: 8px 22px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">欢迎关注本公众号 · 获取精选深度干货</span>
</section>`;
    }
  }
];

// ── 背景底纹模版定义（Body Background Textures）──
export const backgroundTemplates = [
  {
    id: 'none',
    name: '极简纯色 (无底纹)',
    description: '纯色背景，不叠加任何几何纹理，极简通透',
    tag: '极简',
    styleCategory: 'clean',
    bgImage: 'none',
    bgSize: 'auto',
    bgPosition: '0 0',
    previewHtml: `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#64748b;font-weight:600;">◻ 纯净单色背景</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#ffffff';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#334155;">极简纯色排版内容区域</p></section>`;
    }
  },
  {
    id: 'grid',
    name: '经典淡雅网格 (20px)',
    description: '20px 经典淡雅山海网格质感，清新耐看，公众号标配',
    tag: '推荐',
    styleCategory: 'grid',
    bgImage: 'linear-gradient(90deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.045) 0%, rgba(255, 255, 255, 0) 12.16%)',
    bgSize: '20px 20px, 20px 20px',
    bgPosition: '0 0, 0 0',
    previewHtml: `<div style="background-color:#ffffff;background-image:linear-gradient(90deg, rgba(50,0,0,0.04) 0%, rgba(255,255,255,0) 12%), linear-gradient(360deg, rgba(50,0,0,0.05) 0%, rgba(255,255,255,0) 12%);background-size:14px 14px;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#2563eb;font-weight:700;">📐 20px 经典网格</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#ffffff';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.045) 0%, rgba(255, 255, 255, 0) 12.16%); background-size: 20px 20px, 20px 20px; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#1e293b;">经典淡雅网格内容区域</p></section>`;
    }
  },
  {
    id: 'dots',
    name: '波点矩阵 (Dot Matrix)',
    description: '18px 规整波点矩阵，现代设计风，适合科技与职场干货',
    tag: '爆款',
    styleCategory: 'dots',
    bgImage: 'radial-gradient(rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)',
    bgSize: '18px 18px',
    bgPosition: '0 0',
    previewHtml: `<div style="background-color:#ffffff;background-image:radial-gradient(rgba(0,0,0,0.1) 1.5px, transparent 1.5px);background-size:12px 12px;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#7c3aed;font-weight:700;">✨ 波点矩阵 Dot Matrix</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#ffffff';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: radial-gradient(rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px); background-size: 18px 18px; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#1e293b;">波点矩阵排版内容区域</p></section>`;
    }
  },
  {
    id: 'grid-dense',
    name: '密集坐标纸 (10px Grid)',
    description: '10px 紧凑坐标微格，严谨专业，适合开发架构与复盘',
    tag: '极客',
    styleCategory: 'grid',
    bgImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px)',
    bgSize: '10px 10px, 10px 10px',
    bgPosition: '0 0, 0 0',
    previewHtml: `<div style="background-color:#ffffff;background-image:linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.04) 1px, transparent 1px);background-size:7px 7px;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#059669;font-weight:700;">📊 10px 坐标方格纸</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#ffffff';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px); background-size: 10px 10px, 10px 10px; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#0f172a;">密集坐标格内容区域</p></section>`;
    }
  },
  {
    id: 'stripes-diag',
    name: '极简斜线纹理 (45°)',
    description: '45° 细腻微斜纹，打破平面单调，提供微触感纸张纹理',
    tag: '质感',
    styleCategory: 'texture',
    bgImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.02) 0px, rgba(0, 0, 0, 0.02) 1px, transparent 1px, transparent 10px)',
    bgSize: 'auto',
    bgPosition: '0 0',
    previewHtml: `<div style="background-color:#ffffff;background-image:repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px);border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#d97706;font-weight:700;">📐 45° 极简斜纹</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#ffffff';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.02) 0px, rgba(0, 0, 0, 0.02) 1px, transparent 1px, transparent 10px); border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#334155;">优雅斜纹排版内容区域</p></section>`;
    }
  },
  {
    id: 'paper-lines',
    name: '信笺横格本 (Ruled)',
    description: '28px 模拟笔记本信笺横线，温润亲和，适合散文随笔',
    tag: '文艺',
    styleCategory: 'texture',
    bgImage: 'repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(0, 0, 0, 0.045) 28px)',
    bgSize: '100% 28px',
    bgPosition: '0 0',
    previewHtml: `<div style="background-color:#ffffff;background-image:repeating-linear-gradient(180deg, transparent 0, transparent 14px, rgba(0,0,0,0.06) 15px);background-size:100% 15px;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#9a3412;font-weight:700;">📝 信笺笔记本横格</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#fefcf8';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(0, 0, 0, 0.045) 28px); background-size: 100% 28px; border: 1px solid #fed7aa; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#7c2d12;">信笺横格排版内容区域</p></section>`;
    }
  },
  {
    id: 'blueprint',
    name: '科技蓝图方格 (Blueprint)',
    description: '24px 科技蓝图方阵网格，专为数码测评与 AI 前沿打造',
    tag: '科技',
    styleCategory: 'tech',
    bgImage: 'linear-gradient(rgba(37, 99, 235, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.06) 1px, transparent 1px)',
    bgSize: '24px 24px, 24px 24px',
    bgPosition: '0 0, 0 0',
    previewHtml: `<div style="background-color:#ffffff;background-image:linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px);background-size:14px 14px;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#1d4ed8;font-weight:700;">⚡ 蓝调科技方格网</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#f8fafc';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: linear-gradient(rgba(37, 99, 235, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.06) 1px, transparent 1px); background-size: 24px 24px; border: 1px solid #bfdbfe; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#1e3a8a;">科技蓝图方阵排版内容区域</p></section>`;
    }
  },
  {
    id: 'cross',
    name: '微十字星位矩阵 (Cross Grid)',
    description: '24px 交叉十字星位矩阵，轻盈疏朗，提供高级留白感',
    tag: '高级',
    styleCategory: 'texture',
    bgImage: 'radial-gradient(rgba(0, 0, 0, 0.06) 2px, transparent 2px), radial-gradient(rgba(0, 0, 0, 0.06) 2px, transparent 2px)',
    bgSize: '24px 24px',
    bgPosition: '0 0, 12px 12px',
    previewHtml: `<div style="background-color:#ffffff;background-image:radial-gradient(rgba(0,0,0,0.08) 2px, transparent 2px), radial-gradient(rgba(0,0,0,0.08) 2px, transparent 2px);background-position:0 0, 7px 7px;background-size:14px 14px;border:1px solid #e2e8f0;border-radius:6px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#334155;font-weight:700;">➕ 微十字星位矩阵</div>`,
    render: (options = {}) => {
      const bg = options.backgroundColor || '#ffffff';
      return `<section style="margin: 20px 0; padding: 22px 20px; background-color: ${bg}; background-image: radial-gradient(rgba(0, 0, 0, 0.06) 2px, transparent 2px), radial-gradient(rgba(0, 0, 0, 0.06) 2px, transparent 2px); background-position: 0 0, 12px 12px; background-size: 24px 24px; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true"><p style="margin:0;font-size:14px;color:#334155;">微十字矩阵排版内容区域</p></section>`;
    }
  }
];

export function getBackgroundPatternStyle(textureId) {
  const normId = (textureId || '').replace(/^bg-/, '').replace(/-classic$/, '').replace(/-none$/, '');
  const t = backgroundTemplates.find(b => b.id === normId || b.id === textureId) || backgroundTemplates.find(b => b.id === 'grid') || backgroundTemplates[1];
  return {
    backgroundImage: t.bgImage || 'none',
    backgroundSize: t.bgSize || 'auto',
    backgroundPosition: t.bgPosition || '0 0',
    backgroundRepeat: 'repeat'
  };
}

export const allMaterialTemplatesMap = {
  ...headingTemplatesMap,
  ...quoteTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
  ...dividerTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
  ...listTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
  ...headerWidgetTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
  ...footerWidgetTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
  ...backgroundTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {})
};

export function getMaterialTemplatesForKey(key) {
  if (key === 'body' || key === 'background') {
    return backgroundTemplates;
  }
  if (key === 'blockquote') {
    return quoteTemplates;
  }
  if (key === 'hr') {
    return dividerTemplates;
  }
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(key)) {
    return headingTemplates;
  }
  if (['ul', 'ol', 'li'].includes(key)) {
    return listTemplates;
  }
  if (key === 'header_widget') {
    return headerWidgetTemplates;
  }
  if (key === 'footer_widget') {
    return footerWidgetTemplates;
  }
  return [];
}
