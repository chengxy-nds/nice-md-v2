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
  { id: 'lists', name: '步骤/列表' },
  { id: 'tech_cards', name: '代码/极客' },
  { id: 'tables', name: '表格/对比' },
  { id: 'dividers', name: '分割线' },
  { id: 'header_widgets', name: '顶部导读' },
  { id: 'footer_widgets', name: '文末三连' }
];

export const materials = [
  // ── 背景底纹精选素材 (纯底纹展示) ──
  {
    id: 'bg-grid-classic',
    category: 'backgrounds',
    tag: '经典网格',
    styleCategory: 'minimal',
    title: '经典淡雅网格 (Classic Grid)',
    description: '20px 经典淡雅网格质感',
    tags: ['经典网格', '山海风', '底纹'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.045) 0%, rgba(255, 255, 255, 0) 12.16%); background-size: 20px 20px, 20px 20px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-dot-matrix',
    category: 'backgrounds',
    tag: '波点矩阵',
    styleCategory: 'business',
    title: '波点矩阵底纹 (Dot Matrix)',
    description: '18px 规整波点矩阵',
    tags: ['波点矩阵', '现代设计', '科技感'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: radial-gradient(rgba(0, 0, 0, 0.12) 1.5px, transparent 1.5px); background-size: 18px 18px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-grid-dense',
    category: 'backgrounds',
    tag: '坐标纸',
    styleCategory: 'tech',
    title: '密集坐标纸底纹 (Micro Grid)',
    description: '10px 紧凑坐标微格',
    tags: ['坐标纸', '工程', '严谨'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px); background-size: 10px 10px, 10px 10px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-stripes-diag',
    category: 'backgrounds',
    tag: '极简斜纹',
    styleCategory: 'minimal',
    title: '极简斜线纹理 (Diagonal Lines)',
    description: '45° 细腻微斜纹',
    tags: ['斜纹', '纸质感', '高级'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.035) 0px, rgba(0, 0, 0, 0.035) 1px, transparent 1px, transparent 10px); border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-paper-lines',
    category: 'backgrounds',
    tag: '信笺横格',
    styleCategory: 'fresh',
    title: '信笺横格本 (Ruled Paper)',
    description: '28px 笔记本信笺横线',
    tags: ['信笺', '横格', '手账'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #fefcf8; background-image: repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(0, 0, 0, 0.07) 28px); background-size: 100% 28px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-blueprint',
    category: 'backgrounds',
    tag: '蓝调科技',
    styleCategory: 'tech',
    title: '蓝调科技方阵 (Blueprint)',
    description: '24px 科技蓝图方阵网格',
    tags: ['蓝图', '科技', '蓝调'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #f8fafc; background-image: linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px); background-size: 24px 24px, 24px 24px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-cross',
    category: 'backgrounds',
    tag: '星位矩阵',
    styleCategory: 'minimal',
    title: '微十字星位矩阵 (Cross Grid)',
    description: '24px 交叉十字星位矩阵',
    tags: ['十字', '矩阵', '留白'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: radial-gradient(rgba(0, 0, 0, 0.1) 2px, transparent 2px), radial-gradient(rgba(0, 0, 0, 0.1) 2px, transparent 2px); background-position: 0 0, 12px 12px; background-size: 24px 24px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-clean-none',
    category: 'backgrounds',
    tag: '极简纯色',
    styleCategory: 'minimal',
    title: '极简纯色 (无底纹)',
    description: '纯色背景无叠加纹理',
    tags: ['纯色', '极简', '纯净'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; border-radius: 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(0, 0, 0, 0.08);" data-material="true"></section>`
  },
  // ── 135 爆款精选 ──
  {
    id: 'h-135-part01-leaf',
    category: 'headings',
    tag: '135爆款',
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: 'minimal',
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
    styleCategory: 'guofeng',
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
    styleCategory: 'fresh',
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
    styleCategory: 'tech',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: 'fresh',
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
    styleCategory: 'business',
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
    styleCategory: 'tech',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: 'business',
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
    styleCategory: 'minimal',
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
    styleCategory: 'fresh',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: 'minimal',
    title: '三点星光居中分割线',
    description: '居中修饰三个优雅圆点',
    tags: ['点状', '居中', '优雅'],
    html: `<section data-material="true" style="text-align: center; margin: 26px auto; color: #cbd5e1; font-size: 18px; letter-spacing: 12px; width: 100%; clear: both;">• • •</section>`
  },
  {
    id: 'd-dashed-blue',
    category: 'dividers',
    tag: '蓝色',
    styleCategory: 'business',
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
    styleCategory: '135hot',
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
    styleCategory: 'business',
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
    styleCategory: '135hot',
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
    styleCategory: 'business',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: 'business',
    title: '壹伴极简作者名片与关注卡片',
    description: '包含作者介绍、关注引导与高质感圆角边框',
    tags: ['关注卡片', '作者介绍', 'CTA'],
    html: `<section style="margin: 28px 0 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.03); text-align: center;" data-material="true">
  <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">✍️ 程序员小富</p>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.5;">专注分享后端高并发架构、前端高颜值排版与职场成长思考</p>
  <span style="display: inline-block; padding: 8px 22px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">欢迎关注本公众号 · 获取精选深度干货</span>
</section>`
  },
  {
    id: "h-oriental-seal",
    category: "headings",
    tag: "国风水墨",
    styleCategory: "guofeng",
    title: "国风朱砂·双印章雅宋标题",
    description: "朱砂方印章章次 + 雅致宋体字标 + 渐变金石横线与祥云暗纹",
    tags: ["国风","水墨","印章","宋体","文学"],
    html: "<section style=\"margin: 28px 0 18px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; gap: 10px; border-bottom: 2px solid #b91c1c; padding-bottom: 6px; position: relative;\">\n    <section style=\"background: #b91c1c; color: #ffffff; font-family: 'Songti SC', 'SimSun', serif; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(185, 28, 28, 0.25); letter-spacing: 2px;\">\n      壹·章\n    </section>\n    <span style=\"font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 19px; font-weight: 800; color: #1c1917; letter-spacing: 2px;\">\n      水墨流转·文气自华\n    </span>\n    <span style=\"color: #b91c1c; font-size: 16px; margin-left: 2px;\">❖</span>\n  </section>\n</section>"
  },
  {
    id: "h-cyber-terminal",
    category: "headings",
    tag: "赛博极客",
    styleCategory: "tech",
    title: "极客赛博·终端发光命令标题",
    description: "深黑终端底色 + 霓虹亮青光标 + 命令行提示符与状态标识",
    tags: ["极客","终端","代码","赛博","命令行"],
    html: "<section style=\"margin: 28px 0 18px; clear: both;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; background: #0f172a; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);\">\n    <span style=\"color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; font-weight: 700; margin-right: 8px;\">❯_ [SEC_01]</span>\n    <span style=\"color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;\">高并发链路与架构基建</span>\n    <span style=\"display: inline-block; width: 8px; height: 14px; background: #38bdf8; margin-left: 8px; opacity: 0.85;\"></span>\n  </section>\n</section>"
  },
  {
    id: "h-editorial-roman",
    category: "headings",
    tag: "杂志社论",
    styleCategory: "minimal",
    title: "大刊社论·半透罗马序号大标题",
    description: "底置超大浅灰罗马序号 + 精致无衬线加粗主标 + 极简纯黑下划线",
    tags: ["杂志","社论","罗马数字","大刊","极简"],
    html: "<section style=\"margin: 32px 0 20px; clear: both; position: relative;\" data-material=\"true\">\n  <div style=\"font-family: 'Times New Roman', serif; font-size: 46px; font-weight: 900; color: rgba(0, 0, 0, 0.07); line-height: 1; margin-bottom: -18px; user-select: none;\">\n    01.\n  </div>\n  <div style=\"display: inline-block; border-bottom: 2.5px solid #0a0a0a; padding-bottom: 5px;\">\n    <h3 style=\"margin: 0; font-family: 'Outfit', 'PingFang SC', sans-serif; font-size: 20px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.02em;\">\n      范式转移与核心增长飞轮\n    </h3>\n  </div>\n</section>"
  },
  {
    id: "h-handdrawn-pin",
    category: "headings",
    tag: "手账便签",
    styleCategory: "fresh",
    title: "手账手绘·立体图钉便签标题",
    description: "倾斜手写黄色标签 + 3D 红色图钉 + 荧光马克笔底色",
    tags: ["手账","便签","图钉","手绘","活泼"],
    html: "<section style=\"margin: 28px 0 18px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"display: inline-block; position: relative; background: #fef08a; padding: 7px 18px 7px 14px; border-radius: 4px; transform: rotate(-1.5deg); box-shadow: 2px 3px 6px rgba(0,0,0,0.08); border-left: 4px solid #eab308;\">\n    <span style=\"position: absolute; top: -10px; left: 10px; font-size: 16px;\">📌</span>\n    <span style=\"font-family: 'PingFang SC', sans-serif; font-size: 16px; font-weight: 800; color: #713f12; margin-left: 14px; letter-spacing: 0.5px;\">\n      今日灵感清单与实操笔记\n    </span>\n  </section>\n</section>"
  },
  {
    id: "h-pill-duotone",
    category: "headings",
    tag: "现代双色",
    styleCategory: "business",
    title: "现代双色·渐变胶囊药丸标题",
    description: "深蓝主序号胶囊 + 天蓝浅底扩展条 + 纯白反差对亮点",
    tags: ["双色","胶囊","药丸","现代","清爽"],
    html: "<section style=\"margin: 28px 0 18px; clear: both;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; background: #eff6ff; border-radius: 9999px; padding: 3px 16px 3px 4px; border: 1px solid #bfdbfe;\">\n    <span style=\"background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);\">\n      STEP 01\n    </span>\n    <span style=\"font-size: 15px; font-weight: 700; color: #1e3a8a; margin-left: 10px; letter-spacing: 0.2px;\">\n      系统环境初始化与脚手架搭建\n    </span>\n  </section>\n</section>"
  },
  {
    id: "q-terminal-log",
    category: "quotes",
    tag: "极客终端",
    styleCategory: "tech",
    title: "极客 Mac 终端·命令输出引用框",
    description: "macOS 红黄绿三色原生按钮 + 暗色磨砂背景 + 极客哲学金句",
    tags: ["极客","终端","macOS","代码","金句"],
    html: "<section style=\"margin: 24px 0; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 8px 24px rgba(0,0,0,0.15);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155;\">\n    <div style=\"display: flex; gap: 6px;\">\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;\"></span>\n    </div>\n    <span style=\"margin: 0 auto; color: #94a3b8; font-size: 11px; font-family: monospace;\">bash — 80x24</span>\n  </div>\n  <div style=\"padding: 16px 20px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13.5px; line-height: 1.7; color: #e2e8f0;\">\n    <p style=\"color: #38bdf8; margin: 0 0 6px 0;\">$ cat core_philosophy.txt</p>\n    <p style=\"margin: 0; color: #f1f5f9; font-style: italic;\">“软件工程的本质不是制造复杂，而是在极度混乱的现实世界中建立清晰的抽象与秩序。”</p>\n    <p style=\"color: #64748b; font-size: 12px; margin: 8px 0 0 0; text-align: right;\">— 《Clean Code 架构思考》</p>\n  </div>\n</section>"
  },
  {
    id: "q-ancient-scroll",
    category: "quotes",
    tag: "古风宣纸",
    styleCategory: "guofeng",
    title: "古风典籍·宣纸朱砂双线古卷引用",
    description: "宣纸米黄底色 + 典雅回纹边框 + 朱砂红篆刻印章 + 典雅竖排风韵",
    tags: ["古风","宣纸","水墨","金句","国风"],
    html: "<section style=\"margin: 24px 0; padding: 22px 24px; background: #faf7f0; border: 2px solid #e7dfd1; border-radius: 8px; position: relative; box-shadow: inset 0 0 12px rgba(217, 201, 179, 0.25);\" data-material=\"true\">\n  <div style=\"border: 1px dashed #c4b5a0; padding: 16px 20px; text-align: center;\">\n    <p style=\"font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 15.5px; line-height: 1.85; color: #451a03; margin: 0; letter-spacing: 1.5px; font-weight: 500;\">\n      “博学之，审问之，慎思之，明辨之，笃行之。天下之事，闻之不若见之，见之不若知之，知之不若行之。”\n    </p>\n    <div style=\"margin-top: 12px; font-size: 12px; color: #b91c1c; font-weight: 700; letter-spacing: 2px;\">\n      【 儒林·礼记中庸 】\n    </div>\n  </div>\n</section>"
  },
  {
    id: "q-magazine-bigquote",
    category: "quotes",
    tag: "大刊金句",
    styleCategory: "minimal",
    title: "大刊双引号·巨型流光大字符金句",
    description: "左上角 72px 浅蓝半透立体大双引号 + 斜体精致社论观点排版",
    tags: ["大刊","双引号","名言","杂志","高级"],
    html: "<section style=\"margin: 28px 0; padding: 24px 28px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 0 12px 12px 0; position: relative;\" data-material=\"true\">\n  <div style=\"font-family: Georgia, serif; font-size: 72px; color: rgba(15, 23, 42, 0.12); position: absolute; top: -10px; left: 16px; line-height: 1; user-select: none;\">\n    “\n  </div>\n  <p style=\"position: relative; z-index: 1; margin: 0; font-family: 'Georgia', 'Songti SC', serif; font-size: 16px; font-weight: 600; line-height: 1.75; color: #1e293b; font-style: italic;\">\n    真正优秀的设计不是把所有东西堆砌完整，而是直到没有任何一件多余的东西可以再被拿走。\n  </p>\n  <div style=\"margin-top: 10px; text-align: right; font-size: 12.5px; color: #64748b; font-weight: 700;\">\n    — 安托万·德·圣-埃克苏佩里\n  </div>\n</section>"
  },
  {
    id: "q-highlighter-marker",
    category: "quotes",
    tag: "荧光涂抹",
    styleCategory: "fresh",
    title: "手绘荧光·胶带纸荧光笔涂抹金句",
    description: "荧光黄手绘高亮背景 + 倾斜半透胶带纸固定 + 亲和力手写便签感",
    tags: ["荧光笔","胶带","手绘","便签","金句"],
    html: "<section style=\"margin: 26px 0; padding: 20px 22px; background: #fffdf5; border: 1px solid #fef08a; border-radius: 6px; position: relative; box-shadow: 2px 4px 12px rgba(234, 179, 8, 0.08);\" data-material=\"true\">\n  <div style=\"width: 60px; height: 16px; background: rgba(253, 224, 71, 0.6); position: absolute; top: -8px; left: 50%; transform: translateX(-50%) rotate(-1deg); border-radius: 2px;\"></div>\n  <p style=\"margin: 0; font-size: 15px; line-height: 1.8; color: #713f12; font-weight: 600;\">\n    <span style=\"background: linear-gradient(180deg, transparent 60%, #fef08a 60%); padding: 0 4px;\">\n      保持对未知的好奇，把每一次挑战当成认知的升级。做长期有价值的事，时间会成为最坚固的盟友。\n    </span>\n  </p>\n</section>"
  },
  {
    id: "c-notion-info",
    category: "callouts",
    tag: "Notion彩卡",
    styleCategory: "business",
    title: "Notion 极简彩卡·天蓝信息提示盒",
    description: "极简浅蓝底色 + 圆形信息图标 + 柔和灰蓝正文",
    tags: ["Notion","Info","信息","提示","蓝调"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">ℹ️</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 2px;\">核心信息提示 (Note)</div>\n    <div style=\"font-size: 13.5px; color: #1e3a8a; line-height: 1.6;\">\n      系统默认在每周一凌晨 03:00 自动进行冷数据归档与索引重建，期间只读操作不受任何影响。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-notion-tip",
    category: "callouts",
    tag: "Notion彩卡",
    styleCategory: "fresh",
    title: "Notion 极简彩卡·薄荷绿技巧小贴士",
    description: "清爽薄荷绿底色 + 灯泡技巧图标 + 实操效率建议",
    tags: ["Notion","Tip","技巧","小贴士","绿色"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">💡</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 2px;\">效率提升技巧 (Pro Tip)</div>\n    <div style=\"font-size: 13.5px; color: #14532d; line-height: 1.6;\">\n      使用快捷键 <code style=\"background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;\">Cmd + K</code> 可以快速调出全局多渠道一键发布控制台。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-notion-warning",
    category: "callouts",
    tag: "Notion彩卡",
    styleCategory: "135hot",
    title: "Notion 极简彩卡·暖橙警示避坑指南",
    description: "暖橙警示底色 + 叹号三角图标 + 避坑注意要点",
    tags: ["Notion","Warning","警告","避坑","橙色"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">⚠️</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #9a3412; margin-bottom: 2px;\">重点注意要点 (Warning)</div>\n    <div style=\"font-size: 13.5px; color: #7c2d12; line-height: 1.6;\">\n      在修改核心生产环境配置前，务必先在测试环境完整执行压力测试并备份全量数据库快照。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-notion-danger",
    category: "callouts",
    tag: "Notion彩卡",
    styleCategory: "minimal",
    title: "Notion 极简彩卡·绯红高危禁止操作箱",
    description: "绯红警戒底色 + 禁止手势图标 + 高危红线警示",
    tags: ["Notion","Danger","危险","红线","禁止"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">🛑</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 2px;\">高危红线警示 (Danger)</div>\n    <div style=\"font-size: 13.5px; color: #7f1d1d; line-height: 1.6;\">\n      严禁在未经脱敏的代码仓库中硬编码生产 API Key、密码与私钥，违者将触发安全审计封禁。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-folded-memo",
    category: "callouts",
    tag: "立体便签",
    styleCategory: "fresh",
    title: "3D 立体·右上折角便签贴",
    description: "右上角立体折角阴影 + 浅鹅黄温馨底色 + 纸张微浮动质感",
    tags: ["便签","折角","3D","手账","卡片"],
    html: "<section style=\"margin: 24px 0; padding: 18px 22px; background: #fef9c3; border-radius: 8px 0 8px 8px; border: 1px solid #fde047; position: relative; box-shadow: 3px 5px 15px rgba(0,0,0,0.06);\" data-material=\"true\">\n  <div style=\"position: absolute; top: -1px; right: -1px; width: 0; height: 0; border-style: solid; border-width: 0 20px 20px 0; border-color: transparent #facc15 transparent transparent; box-shadow: -1px 1px 3px rgba(0,0,0,0.12);\"></div>\n  <div style=\"font-size: 14px; font-weight: 700; color: #854d0e; margin-bottom: 4px;\">📝 备忘速记 / Quick Memo</div>\n  <div style=\"font-size: 13.5px; color: #713f12; line-height: 1.65;\">\n    记得在文章结尾附上互动问答与投票组件，可大幅提升粉丝在公众号底部的留言互动率与在看转化。\n  </div>\n</section>"
  },
  {
    id: "c-metric-kpi-card",
    category: "callouts",
    tag: "数据看板",
    styleCategory: "business",
    title: "核心指标·大厂成果数据看板卡",
    description: "3 列核心业务指标大数字 + 增长百分比 + 结构化对比",
    tags: ["数据","看板","指标","KPI","增长"],
    html: "<section style=\"margin: 24px 0; padding: 18px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;\" data-material=\"true\">\n  <div style=\"padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">全网总阅读</div>\n    <div style=\"font-size: 20px; font-weight: 800; color: #2563eb; margin: 4px 0;\">120W+</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">↑ 35% 同比增长</div>\n  </div>\n  <div style=\"padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">分发耗时</div>\n    <div style=\"font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0;\">3.2s</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">⚡ 效率提升 10x</div>\n  </div>\n  <div style=\"padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">粉丝留存率</div>\n    <div style=\"font-size: 20px; font-weight: 800; color: #7c3aed; margin: 4px 0;\">94.8%</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">★ 行业顶尖</div>\n  </div>\n</section>"
  },
  {
    id: "l-timeline-milestone",
    category: "lists",
    tag: "时间轴",
    styleCategory: "business",
    title: "彩色时间轴·大事记里程碑流程",
    description: "纵向连线时间轴 + 彩色阶梯节点 + 卡片式事件演进",
    tags: ["时间轴","里程碑","步骤","发展历程","节点"],
    html: "<section style=\"margin: 26px 0; padding: 10px 4px;\" data-material=\"true\">\n  <div style=\"position: relative; padding-left: 24px; border-left: 2px dashed #93c5fd; margin-bottom: 20px;\">\n    <span style=\"position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #93c5fd;\"></span>\n    <div style=\"font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase;\">阶段一 · 需求洞察与立项</div>\n    <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">完成行业竞品深度调研与用户痛点画像建模，确定核心功能矩阵。</div>\n  </div>\n  <div style=\"position: relative; padding-left: 24px; border-left: 2px dashed #93c5fd; margin-bottom: 20px;\">\n    <span style=\"position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #7dd3fc;\"></span>\n    <div style=\"font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase;\">阶段二 · 核心引擎敏捷迭代</div>\n    <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">搭建自研 AST 语法树解析器与微信专用富文本样式渲染引擎。</div>\n  </div>\n  <div style=\"position: relative; padding-left: 24px;\">\n    <span style=\"position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #16a34a; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #86efac;\"></span>\n    <div style=\"font-size: 12px; font-weight: 800; color: #16a34a; text-transform: uppercase;\">阶段三 · 全网公测与商业化发布</div>\n    <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">接入微信公众号、知乎、掘金一键多渠道分发网关，服务 10w+ 创作者。</div>\n  </div>\n</section>"
  },
  {
    id: "l-task-checklist",
    category: "lists",
    tag: "任务清单",
    styleCategory: "fresh",
    title: "极简方格·任务清单待办 Checklist",
    description: "Notion 风格方形复选框 + 已完成与未完成对照清单",
    tags: ["清单","Checklist","待办","Notion","任务"],
    html: "<section style=\"margin: 22px 0; padding: 18px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);\" data-material=\"true\">\n  <div style=\"font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;\">📋 发布前自查清单 (Pre-flight Checklist)</div>\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 8px;\">\n    <span style=\"width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;\">✓</span>\n    <span style=\"font-size: 13.5px; color: #64748b; text-decoration: line-through;\">检查文章首图与封面比例是否为 2.35:1 官方规范</span>\n  </div>\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 8px;\">\n    <span style=\"width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;\">✓</span>\n    <span style=\"font-size: 13.5px; color: #64748b; text-decoration: line-through;\">校对代码块中关键字高亮与中英文空格规范</span>\n  </div>\n  <div style=\"display: flex; align-items: center; gap: 10px;\">\n    <span style=\"width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; display: inline-block;\"></span>\n    <span style=\"font-size: 13.5px; color: #1e293b; font-weight: 600;\">一键同步多平台分发并配置原创声明标签</span>\n  </div>\n</section>"
  },
  {
    id: "l-pros-cons-grid",
    category: "lists",
    tag: "红蓝对比",
    styleCategory: "minimal",
    title: "红蓝对比·优缺点 Pros & Cons 左右卡",
    description: "左侧翠绿优势清单 vs 右侧珊瑚红劣势清单对比",
    tags: ["对比","优缺点","Pros","Cons","选型"],
    html: "<section style=\"margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;\" data-material=\"true\">\n  <div style=\"padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;\">\n    <div style=\"font-size: 13.5px; font-weight: 800; color: #166534; margin-bottom: 8px;\">✅ 核心优势 (Pros)</div>\n    <ul style=\"margin: 0; padding-left: 16px; font-size: 12.5px; color: #14532d; line-height: 1.7;\">\n      <li>毫秒级热重载排版渲染</li>\n      <li>全自动同步至微信公众号</li>\n      <li>支持自定义 CSS 深度定制</li>\n    </ul>\n  </div>\n  <div style=\"padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;\">\n    <div style=\"font-size: 13.5px; font-weight: 800; color: #991b1b; margin-bottom: 8px;\">⚠️ 潜在局限 (Cons)</div>\n    <ul style=\"margin: 0; padding-left: 16px; font-size: 12.5px; color: #7f1d1d; line-height: 1.7;\">\n      <li>需要一定 Markdown 语法基础</li>\n      <li>部分小众平台授权有效期受限</li>\n    </ul>\n  </div>\n</section>"
  },
  {
    id: "tech-macos-window",
    category: "tech_cards",
    tag: "macOS代码",
    styleCategory: "tech",
    title: "macOS 原生终端·代码展示窗口",
    description: "macOS 经典红黄绿三色控制圆点 + 深曜石代码框",
    tags: ["代码","macOS","终端","开发","极客"],
    html: "<section style=\"margin: 24px 0; background: #1e1e24; border-radius: 10px; overflow: hidden; border: 1px solid #2d2d38; box-shadow: 0 8px 24px rgba(0,0,0,0.18);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #26262e;\">\n    <div style=\"display: flex; gap: 6px;\">\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #27c93f; display: inline-block;\"></span>\n    </div>\n    <span style=\"color: #94a3b8; font-size: 11px; font-family: monospace;\">ServerEngine.ts</span>\n    <span style=\"color: #64748b; font-size: 11px; font-family: monospace;\">TypeScript</span>\n  </div>\n  <pre style=\"margin: 0; padding: 16px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #f8fafc; overflow-x: auto; background: transparent;\"><code style=\"color:#f8fafc;\"><span style=\"color:#c678dd;\">export async function</span> <span style=\"color:#61afef;\">publishArticle</span>(doc: <span style=\"color:#e5c07b;\">ArticlePayload</span>) {\n  <span style=\"color:#5c6370;font-style:italic;\">// 一键并行分发至全渠道</span>\n  <span style=\"color:#c678dd;\">const</span> res = <span style=\"color:#c678dd;\">await</span> <span style=\"color:#e5c07b;\">Promise</span>.<span style=\"color:#61afef;\">all</span>([\n    <span style=\"color:#61afef;\">syncToWeChat</span>(doc),\n    <span style=\"color:#61afef;\">syncToZhihu</span>(doc)\n  ]);\n  <span style=\"color:#c678dd;\">return</span> { <span style=\"color:#e06c75;\">success</span>: <span style=\"color:#d19a66;\">true</span>, <span style=\"color:#e06c75;\">data</span>: res };\n}</code></pre>\n</section>"
  },
  {
    id: "tech-api-endpoint",
    category: "tech_cards",
    tag: "API文档",
    styleCategory: "tech",
    title: "RESTful API·接口路由与参数规范卡",
    description: "POST 翠绿药丸徽章 + 请求路径 + 参数结构表",
    tags: ["API","RESTful","接口","后端","架构"],
    html: "<section style=\"margin: 22px 0; padding: 16px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 10px;\">\n    <span style=\"background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; font-family: monospace;\">POST</span>\n    <code style=\"font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #0f172a;\">/api/v2/articles/sync</code>\n  </div>\n  <div style=\"font-size: 12.5px; color: #64748b; margin-bottom: 8px;\">支持传入 Markdown 原文并指定目标分发平台列表与授权令牌。</div>\n  <div style=\"background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px; color: #334155;\">\n    Content-Type: application/json; charset=utf-8\n  </div>\n</section>"
  },
  {
    id: "tech-kbd-shortcuts",
    category: "tech_cards",
    tag: "快捷键",
    styleCategory: "tech",
    title: "立体按键·键盘快捷键组合展示栏",
    description: "拟物立体质感 KBD 键盘按键 + 功能快捷操作说明",
    tags: ["快捷键","KBD","键盘","效率","工具"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;\" data-material=\"true\">\n  <span style=\"font-size: 13.5px; font-weight: 700; color: #1e293b;\">⚡ 全屏专注排版模式</span>\n  <div style=\"display: flex; align-items: center; gap: 4px;\">\n    <kbd style=\"display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\">Ctrl</kbd>\n    <span style=\"color: #94a3b8; font-weight: 700;\">+</span>\n    <kbd style=\"display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\">Shift</kbd>\n    <span style=\"color: #94a3b8; font-weight: 700;\">+</span>\n    <kbd style=\"display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\">F</kbd>\n  </div>\n</section>"
  },
  {
    id: "tbl-modern-striped",
    category: "tables",
    tag: "斑马表格",
    styleCategory: "minimal",
    title: "现代无界·斑马交替行数据明细表",
    description: "深曜石表头 + 浅灰交替底色 + 优雅圆角外框",
    tags: ["表格","斑马纹","数据","对比","现代"],
    html: "<section style=\"margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px;\" data-material=\"true\">\n  <table style=\"width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; font-family: sans-serif;\">\n    <thead>\n      <tr style=\"background: #0f172a; color: #ffffff;\">\n        <th style=\"padding: 12px 16px; font-weight: 700;\">功能维度</th>\n        <th style=\"padding: 12px 16px; font-weight: 700;\">传统排版器</th>\n        <th style=\"padding: 12px 16px; font-weight: 700; color: #38bdf8;\">EasyMD 智能引擎</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"background: #ffffff; border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 16px; font-weight: 600; color: #334155;\">多平台同步</td>\n        <td style=\"padding: 10px 16px; color: #64748b;\">手动逐个复制粘贴</td>\n        <td style=\"padding: 10px 16px; color: #16a34a; font-weight: 700;\">✓ 1秒一键全网分发</td>\n      </tr>\n      <tr style=\"background: #f8fafc; border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 16px; font-weight: 600; color: #334155;\">代码高亮</td>\n        <td style=\"padding: 10px 16px; color: #64748b;\">格式错乱/丢失行号</td>\n        <td style=\"padding: 10px 16px; color: #16a34a; font-weight: 700;\">✓ 完美微信原生兼容</td>\n      </tr>\n      <tr style=\"background: #ffffff;\">\n        <td style=\"padding: 10px 16px; font-weight: 600; color: #334155;\">素材生态</td>\n        <td style=\"padding: 10px 16px; color: #64748b;\">千篇一律老旧模版</td>\n        <td style=\"padding: 10px 16px; color: #16a34a; font-weight: 700;\">✓ 50+ 顶级设计组件</td>\n      </tr>\n    </tbody>\n  </table>\n</section>"
  },
  {
    id: "tbl-tier-comparison",
    category: "tables",
    tag: "方案对比",
    styleCategory: "business",
    title: "版本矩阵·免费版 vs 专业版特性对比",
    description: "结构化方案功能点对勾比对卡片",
    tags: ["版本对比","功能矩阵","方案","表格"],
    html: "<section style=\"margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);\" data-material=\"true\">\n  <table style=\"width: 100%; border-collapse: collapse; text-align: center; font-size: 13px;\">\n    <thead>\n      <tr style=\"background: #f8fafc; border-bottom: 2px solid #e2e8f0;\">\n        <th style=\"padding: 14px; text-align: left; color: #0f172a; font-weight: 700;\">权益特性</th>\n        <th style=\"padding: 14px; color: #64748b; font-weight: 600;\">免费开源版</th>\n        <th style=\"padding: 14px; background: #eff6ff; color: #2563eb; font-weight: 800;\">PRO 专业版 👑</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 14px; text-align: left; color: #334155;\">实时双栏排版与导出</td>\n        <td style=\"padding: 10px 14px; color: #16a34a;\">✓ 无限次</td>\n        <td style=\"padding: 10px 14px; background: #eff6ff; color: #16a34a; font-weight: 700;\">✓ 无限次</td>\n      </tr>\n      <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 14px; text-align: left; color: #334155;\">AI 智能润色与结构重构</td>\n        <td style=\"padding: 10px 14px; color: #94a3b8;\">每日 5 次</td>\n        <td style=\"padding: 10px 14px; background: #eff6ff; color: #2563eb; font-weight: 700;\">极速无限调用</td>\n      </tr>\n      <tr>\n        <td style=\"padding: 10px 14px; text-align: left; color: #334155;\">多渠道一键分发平台数</td>\n        <td style=\"padding: 10px 14px; color: #64748b;\">3 个主流渠道</td>\n        <td style=\"padding: 10px 14px; background: #eff6ff; color: #2563eb; font-weight: 700;\">全网 10+ 矩阵</td>\n      </tr>\n    </tbody>\n  </table>\n</section>"
  },
  {
    id: "d-sparkle-diamond",
    category: "dividers",
    tag: "星芒分割",
    styleCategory: "minimal",
    title: "星芒闪耀·双侧流光居中微光分割线",
    description: "居中 ✨ 闪光星芒 + 双侧渐变流光细线",
    tags: ["分割线","星芒","极简","装饰","优雅"],
    html: "<section style=\"margin: 28px 0; text-align: center; display: flex; align-items: center; justify-content: center; gap: 14px;\" data-material=\"true\">\n  <div style=\"flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #cbd5e1);\"></div>\n  <span style=\"font-size: 14px; color: #64748b; transform: scale(1.2);\">✦ ✦ ✦</span>\n  <div style=\"flex: 1; height: 1px; background: linear-gradient(90deg, #cbd5e1, transparent);\"></div>\n</section>"
  },
  {
    id: "d-scissors-coupon",
    category: "dividers",
    tag: "虚线剪刀",
    styleCategory: "135hot",
    title: "虚线剪刀·优惠券裁切打孔分割线",
    description: "✂️ 经典裁切剪刀 + 细密打孔虚线",
    tags: ["分割线","剪刀","打孔","虚线","活动"],
    html: "<section style=\"margin: 28px 0; display: flex; align-items: center; gap: 8px; color: #94a3b8;\" data-material=\"true\">\n  <span style=\"font-size: 16px; transform: rotate(-90deg);\">✂️</span>\n  <div style=\"flex: 1; border-top: 1.5px dashed #cbd5e1; height: 0;\"></div>\n</section>"
  },
  {
    id: "hw-tldr-summary",
    category: "header_widgets",
    tag: "TL;DR导读",
    styleCategory: "business",
    title: "观点精粹·TL;DR 30秒核心要点速览",
    description: "高亮总结卡片，帮助读者30秒抓住全文核心精髓",
    tags: ["导读","TLDR","摘要","要点","开头"],
    html: "<section style=\"margin: 0 0 24px 0; padding: 18px 20px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;\">\n    <div style=\"font-size: 14px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;\">\n      <span>⚡</span> <span>TL;DR · 30秒核心要点</span>\n    </div>\n    <span style=\"font-size: 11px; color: #64748b; background: #e2e8f0; padding: 2px 8px; border-radius: 9999px;\">精读约 5 分钟</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.75;\">\n    <li><strong>痛点所在：</strong> 传统内容跨平台排版耗时长、格式易崩塌。</li>\n    <li><strong>解决方案：</strong> 采用 AST 抽象语法树与专属 CSS 隔离渲染引擎。</li>\n    <li><strong>落地效果：</strong> 全网矩阵同步发布效率提升 10 倍以上。</li>\n  </ul>\n</section>"
  },
  {
    id: "fw-social-matrix",
    category: "footer_widgets",
    tag: "社交矩阵",
    styleCategory: "business",
    title: "全网矩阵·微信/掘金/知乎多平台一键关注",
    description: "极具品质的多社交平台彩色徽标阵列与订阅引导",
    tags: ["文末","关注","社交矩阵","微信","知乎","掘金"],
    html: "<section style=\"margin: 32px 0 16px; padding: 22px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.04); text-align: center;\" data-material=\"true\">\n  <div style=\"font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px;\">🚀 与 100,000+ 创作者共同成长</div>\n  <p style=\"font-size: 13px; color: #64748b; margin-bottom: 16px;\">欢迎在各大技术社区关注我的专栏，获取每周独家干货更新</p>\n  <div style=\"display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;\">\n    <span style=\"background: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bbf7d0;\">💚 微信公众号</span>\n    <span style=\"background: #eff6ff; color: #1e40af; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bfdbfe;\">💙 知乎专栏</span>\n    <span style=\"background: #fff7ed; color: #c2410c; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #fed7aa;\">🧡 稀土掘金</span>\n    <span style=\"background: #f8fafc; color: #0f172a; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #cbd5e1;\">🖤 GitHub 开源</span>\n  </div>\n</section>"
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: '135hot',
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
    styleCategory: 'minimal',
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
    styleCategory: 'minimal',
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
    styleCategory: 'business',
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
    styleCategory: 'tech',
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
    styleCategory: 'minimal',
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
    styleCategory: 'fresh',
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
    styleCategory: 'minimal',
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
