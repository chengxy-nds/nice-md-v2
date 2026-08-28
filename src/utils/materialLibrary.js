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

export const styleCategories = [
  { id: 'all', name: '全部风格' },
  { id: 'fresh', name: '清新活力' },
  { id: 'business', name: '商务科技' },
  { id: 'guofeng', name: '国风古韵' },
  { id: 'minimal', name: '极简大刊' },
  { id: 'tech', name: '极客代码' }
];

export const styleCategoryMap = {
  'fresh': { name: '清新活力', color: '#16a34a', bg: '#f0fdf4', border: '#dcfce7' },
  'business': { name: '商务科技', color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' },
  'guofeng': { name: '国风古韵', color: '#b91c1c', bg: '#fef2f2', border: '#fee2e2' },
  'minimal': { name: '极简大刊', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' },
  'tech': { name: '极客代码', color: '#0284c7', bg: '#f0f9ff', border: '#e0f2fe' }
};

export const categoryNameMap = {
  'backgrounds': '背景底纹',
  'headings': '标题/序号',
  'quotes': '金句/引用',
  'callouts': '提示/卡片',
  'lists': '步骤/列表',
  'tech_cards': '代码/极客',
  'tables': '表格/对比',
  'dividers': '分割线',
  'header_widgets': '顶部导读',
  'footer_widgets': '文末三连'
};

export const materials = [
  // ── 背景底纹精选素材 (纯底纹展示) ──
  {
    id: 'bg-grid-classic',
    category: 'backgrounds',
    tag: '经典网格',
    styleCategory: 'minimal',
    title: '经典淡雅网格',
    description: '20px 经典淡雅网格质感',
    tags: ['经典网格', '山海风', '底纹'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: linear-gradient(90deg, rgba(50, 0, 0, 0.04) 0%, rgba(255, 255, 255, 0) 11.49%), linear-gradient(360deg, rgba(50, 0, 0, 0.045) 0%, rgba(255, 255, 255, 0) 12.16%); background-size: 20px 20px, 20px 20px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-dot-matrix',
    category: 'backgrounds',
    tag: '波点矩阵',
    styleCategory: 'business',
    title: '波点矩阵底纹',
    description: '18px 规整波点矩阵',
    tags: ['波点矩阵', '现代设计', '科技感'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: radial-gradient(rgba(0, 0, 0, 0.12) 1.5px, transparent 1.5px); background-size: 18px 18px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-grid-dense',
    category: 'backgrounds',
    tag: '坐标纸',
    styleCategory: 'tech',
    title: '密集坐标纸底纹',
    description: '10px 紧凑坐标微格',
    tags: ['坐标纸', '工程', '严谨'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px); background-size: 10px 10px, 10px 10px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-stripes-diag',
    category: 'backgrounds',
    tag: '极简斜纹',
    styleCategory: 'minimal',
    title: '极简斜线纹理',
    description: '45° 细腻微斜纹',
    tags: ['斜纹', '纸质感', '高级'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.035) 0px, rgba(0, 0, 0, 0.035) 1px, transparent 1px, transparent 10px); border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-paper-lines',
    category: 'backgrounds',
    tag: '信笺横格',
    styleCategory: 'fresh',
    title: '信笺横格本',
    description: '28px 笔记本信笺横线',
    tags: ['信笺', '横格', '手账'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #fefcf8; background-image: repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(0, 0, 0, 0.07) 28px); background-size: 100% 28px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-blueprint',
    category: 'backgrounds',
    tag: '蓝调科技',
    styleCategory: 'tech',
    title: '蓝调科技方阵',
    description: '24px 科技蓝图方阵网格',
    tags: ['蓝图', '科技', '蓝调'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #f8fafc; background-image: linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px); background-size: 24px 24px, 24px 24px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-cross',
    category: 'backgrounds',
    tag: '星位矩阵',
    styleCategory: 'minimal',
    title: '微十字星位矩阵',
    description: '24px 交叉十字星位矩阵',
    tags: ['十字', '矩阵', '留白'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; background-image: radial-gradient(rgba(0, 0, 0, 0.1) 2px, transparent 2px), radial-gradient(rgba(0, 0, 0, 0.1) 2px, transparent 2px); background-position: 0 0, 12px 12px; background-size: 24px 24px; border-radius: 8px; box-sizing: border-box;" data-material="true"></section>`
  },
  {
    id: 'bg-clean-none',
    category: 'backgrounds',
    tag: '极简纯色',
    styleCategory: 'minimal',
    title: '极简纯色',
    description: '纯色背景无叠加纹理',
    tags: ['纯色', '极简', '纯净'],
    html: `<section style="margin: 0; width: 100%; height: 100%; min-height: 100px; background-color: #ffffff; border-radius: 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(0, 0, 0, 0.08);" data-material="true"></section>`
  },
  // ── 135 爆款精选 ──
  {
    id: 'h-135-part01-leaf',
    category: 'headings',
    tag: '夏风绿叶',
    styleCategory: 'fresh',
    title: '黄绿夏风标题',
    description: '倾斜 PART.01 标牌 + 弧形手绘箭头 + 绿叶波浪划线标题',
    tags: ['夏风', 'PART.01', '绿叶'],
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
    tag: '蜜桃浪漫',
    styleCategory: 'fresh',
    title: '蜜桃浪漫标题',
    description: '倾斜粉红标牌 + 手绘心形小弧线 + 甜美粉色下划线',
    tags: ['蜜桃', 'PART.02', '浪漫'],
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
    tag: '薰衣草紫',
    styleCategory: 'fresh',
    title: '薰衣草紫标题',
    description: '倾斜紫色标牌 + 优雅星光点缀 + 紫色粗划线',
    tags: ['香草紫', 'PART.03', '星空'],
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
    id: 'h-135-yellow-marker-num',
    category: 'headings',
    tag: '荧光序号',
    styleCategory: 'fresh',
    title: '亮黄荧光简单序号标题',
    description: '居中大号加粗序号 + 倾斜黄色荧光笔划线 + 居中标题',
    tags: ['简单序号', '大号数字', '荧光黄', '居中标题'],
    html: `<section style="margin: 28px 0 20px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; margin-bottom: 6px; line-height: 1;">
    <svg width="74" height="28" viewBox="0 0 74 28" fill="none" style="position: absolute; left: 50%; top: 50%; margin-left: -37px; margin-top: -14px; z-index: 1; pointer-events: none;">
      <path d="M 2 16 C 18 8, 48 4, 72 10 C 73.5 11.5, 73 15, 71 18 L 68 23 C 46 17, 18 20, 2 28 C 0.5 27, 0 24, 0.5 21 Z" fill="#ffe600"/>
    </svg>
    <section style="position: relative; z-index: 2; font-size: 38px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -1px; line-height: 1; display: inline-block; padding: 0 6px;">
      01
    </section>
  </section>
  <section style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; word-break: break-word; text-align: center;">
    简单序号标题
  </section>
</section>`
  },
  {
    id: 'h-135-yellow-sun-wave',
    category: 'headings',
    tag: '月影暖黄',
    styleCategory: 'fresh',
    title: '月影暖黄双斜线标题',
    description: '斜向渐变圆形序号 + 居中标题 + 底部两条手绘黄色斜线',
    tags: ['简单通用', '渐变序号', '双斜线', '暖黄', '居中'],
    html: `<section style="margin: 24px 0 16px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(45deg, #ffffff 0%, #fffde7 25%, #fef9c3 60%, #fde047 100%); line-height: 46px; text-align: center; margin: 0 auto; -webkit-box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2); box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2);">
      <span style="font-size: 28px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -0.5px; line-height: 46px; display: inline-block;">
        01
      </span>
    </section>
  </section>
  <section style="display: block; text-align: center;">
    <span style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
      简单通用标题
    </span>
    <svg width="96" height="12" viewBox="0 0 96 12" fill="none" style="display: block; margin: 1px auto 0; overflow: visible;">
      <path d="M 6 10 C 18 9, 30 5.5, 42 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <path d="M 48 10 C 62 9, 76 5.5, 90 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
    </svg>
  </section>
</section>`
  },
  {
    id: 'h-135-blueprint-grid',
    category: 'headings',
    tag: '蓝图网格',
    styleCategory: 'tech',
    title: '蓝图坐标网格标牌',
    description: '工科蓝图网格底板 + 对角裁切斜线 + 纯白加粗标题',
    tags: ['蓝图', '网格', '科技', '深蓝', '裁切线', '标牌'],
    html: `<section style="margin: 28px 0 20px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; max-width: 100%;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position: absolute; left: -10px; top: -10px; z-index: 2; pointer-events: none;">
      <line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <section style="background-color: #004b97; background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px); background-size: 8px 8px; padding: 8px 26px; display: inline-block; position: relative; z-index: 1; box-sizing: border-box; box-shadow: 0 4px 14px rgba(0, 75, 151, 0.25);">
      <span style="color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 1.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
        简单通用标题
      </span>
    </section>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position: absolute; right: -10px; bottom: -10px; z-index: 2; pointer-events: none;">
      <line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  </section>
</section>`
  },
  {
    id: 'h-yellow-shadow-cube',
    category: 'headings',
    tag: '明黄立体',
    styleCategory: 'fresh',
    title: '明黄立体方块双语标题',
    description: '明黄立体黑边方块序号 + 简约加粗主标题 + 英文副标题',
    tags: ['简约标题', '立体方块', '明黄', '黑边', '双语', '英文副标'],
    html: `<section style="margin: 26px 0 18px; text-align: left; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 36px; padding-right: 12px; line-height: 1;">
        <section style="background: #f4be47; border: 1.5px solid #18181b; -webkit-box-shadow: 3px 3px 0px #2d2d2d; box-shadow: 3px 3px 0px #2d2d2d; width: 30px; height: 30px; line-height: 27px; text-align: center; box-sizing: border-box;">
          <span style="font-size: 16px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; display: block; line-height: 27px;">01</span>
        </section>
      </section>
      <section style="display: table-cell; vertical-align: middle; text-align: left;">
        <span style="font-size: 18px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.25; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: block; word-break: break-word;">简约标题</span>
        <span style="font-size: 10.5px; font-weight: 800; color: #a1a1aa; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.2; display: block; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; margin-top: 2px;">SIMPLE TITLE</span>
      </section>
    </section>
  </section>
</section>`
  },
  {
    id: 'h-dots-apricot-box',
    category: 'headings',
    tag: '手账便签',
    styleCategory: 'fresh',
    title: '暖杏波点手账便签卡',
    description: '黑线圆角白卡 + 暖杏三点星标 + 暖杏立体侧影',
    tags: ['手账便签', '圆角卡片', '暖杏', '波点', '节日祝福', '清新'],
    html: `<section style="margin: 26px 0 18px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; background: #ffffff; border: 1.5px solid #18181b; border-radius: 8px; -webkit-box-shadow: 4px 4px 0px #fed7aa; box-shadow: 4px 4px 0px #fed7aa; padding: 10px 28px; max-width: 100%; box-sizing: border-box; text-align: center;">
    <span style="position: absolute; top: 6px; left: 8px; display: inline-flex; gap: 3px; line-height: 1;">
      <span style="width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
    </span>
    <span style="font-size: 16.5px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
      教师节快乐呀
    </span>
    <span style="position: absolute; bottom: 6px; right: 8px; width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block; line-height: 1;"></span>
  </section>
</section>`
  },
  {
    id: 'h-135-bubble-01',
    category: 'headings',
    tag: '气泡序号',
    styleCategory: 'business',
    title: '双重气泡序号标题',
    description: '实心与淡色双层圆圈序号，搭配加粗标题',
    tags: ['气泡序号', '序号标题', '蓝色'],
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
    tag: '明黄浮雕',
    styleCategory: 'fresh',
    title: '经典立体明黄浮雕标题',
    description: '黄色立体沉底图层 + 左倾小方块，高对比强吸睛',
    tags: ['明黄', '立体风', '浮雕'],
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
    tag: '薄荷绿立体',
    styleCategory: 'fresh',
    title: '薄荷绿立体 02 序号标题',
    description: '薄荷绿圆角方块 + 侧阴影，清新爽朗适合教程结构',
    tags: ['薄荷绿', '序号', '立体'],
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
    title: '莫兰迪双色拼接标题',
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
    title: '国风古韵红木印章标题',
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
    title: '极简翡翠绿包边标题',
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
    title: '赛博黑金科技感标题',
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
    tag: '双引号金句',
    styleCategory: 'business',
    title: '经典大型对话双引号框',
    description: '包含优雅的放大双引号与微阴影圆角边框',
    tags: ['经典金句', '双引号', '名言'],
    html: `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative; word-break: break-word;" data-material="true">
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-right: 4px;">“</span>
  能力增长并不是斜率不变的直线，而是呈现指数级上升的复利曲线。认准方向并持续做对的事，时间会给努力的人最好的答复。
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-left: 4px;">”</span>
</blockquote>`
  },
  {
    id: 'q-135-speech-bubble',
    category: 'quotes',
    tag: '对话气泡',
    styleCategory: 'fresh',
    title: '极简对话气泡金句框',
    description: '带底部对话小尖角与蓝色圆点修饰的气泡引用框',
    tags: ['对话气泡', '气泡框', '金句'],
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
    title: '便签折角贴纸引用框',
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
    title: '渐变侧条优雅导读',
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
    title: '深灰极简黑金修饰框',
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
    tag: '暖橙提示卡',
    styleCategory: 'business',
    title: '暖橙热度要点框',
    description: '橙色高光底色 + 🔥 热度图标',
    tags: ['暖橙', '提示卡片', '干货'],
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
    tag: '要点组合卡',
    styleCategory: 'business',
    title: '三要点小色块组合卡片',
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
    title: '蓝色提示卡片',
    description: '柔和浅蓝背景，适合要点提示',
    tags: ['提示卡片', '蓝色', 'Note'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">温馨提示：</strong>
  在日常工作中，尽量把重复性任务沉淀为标准 SOP 或脚本工具，从而释放精力投入核心思考。
</section>`
  },
  {
    id: 'c-warning-red',
    category: 'callouts',
    tag: '警告',
    styleCategory: 'minimal',
    title: '红色警告卡片',
    description: '淡红背景，用于醒目标注注意事项',
    tags: ['警告卡片', '红色', 'Warning'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">注意事项：</strong>
  切勿直接在主线程中执行耗时的 I/O 操作，否则会导致 UI 卡顿与界面无响应。
</section>`
  },
  {
    id: 'c-success-green',
    category: 'callouts',
    tag: '推荐',
    styleCategory: 'fresh',
    title: '绿色推荐方案卡片',
    description: '淡绿背景，用于最佳实践推荐',
    tags: ['成功卡片', '绿色', 'Success'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7; word-break: break-word;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">推荐方案：</strong>
  推荐采用同城双活 + 异地多活部署架构，确保单机房故障时服务零中断。
</section>`
  },

  // ── 分割线素材 ──
  {
    id: 'd-135-scissors',
    category: 'dividers',
    tag: '剪刀裁剪线',
    styleCategory: 'minimal',
    title: '剪刀裁剪虚线分割线',
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
    tag: '浪漫浪花线',
    styleCategory: 'fresh',
    title: '暖黄浪漫浪花分割线',
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
    styleCategory: 'business',
    title: '纵向里程碑时间轴',
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
    tag: '绿色导读卡',
    styleCategory: 'fresh',
    title: '爆款文章导读与作者头卡',
    description: '包含发刊词、阅读时长与关注按钮的精致头部挂件',
    tags: ['头部导读', '关注头卡', '精选爆款'],
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
    tag: '互动三连卡',
    styleCategory: 'fresh',
    title: '爆款文末三连交互卡片',
    description: '包含“点赞 · 在看 · 分享”互动提醒',
    tags: ['互动三连', '点赞在看', '精选爆款'],
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
    tag: '二维码关注卡',
    styleCategory: 'business',
    title: '经典二维码关注引导卡片',
    description: '高转化微信公众号二维码关注框，带有扫码提示手势',
    tags: ['关注卡片', '二维码', '精选爆款'],
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
    tags: ["国风", "水墨", "印章", "宋体", "文学"],
    html: "<section style=\"margin: 28px 0 18px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"display: inline-table; vertical-align: middle; border-bottom: 2px solid #b91c1c; padding-bottom: 6px;\">\n    <section style=\"display: table-row;\">\n      <section style=\"display: table-cell; vertical-align: middle;\">\n        <section style=\"background: #b91c1c; color: #ffffff; font-family: 'Songti SC', 'SimSun', serif; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(185, 28, 28, 0.25); letter-spacing: 2px; display: inline-block;\">\n          壹·章\n        </section>\n      </section>\n      <section style=\"display: table-cell; vertical-align: middle; padding-left: 10px;\">\n        <span style=\"font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 19px; font-weight: 800; color: #1c1917; letter-spacing: 2px;\">\n          水墨流转·文气自华\n        </span>\n      </section>\n      <section style=\"display: table-cell; vertical-align: middle; padding-left: 6px;\">\n        <span style=\"color: #b91c1c; font-size: 16px;\">❖</span>\n      </section>\n    </section>\n  </section>\n</section>"
  },
  {
    id: "h-cyber-terminal",
    category: "headings",
    tag: "赛博极客",
    styleCategory: "tech",
    title: "极客赛博·终端发光命令标题",
    description: "深黑终端底色 + 霓虹亮青光标 + 命令行提示符与状态标识",
    tags: ["极客", "终端", "代码", "赛博", "命令行"],
    html: "<section style=\"margin: 28px 0 18px; clear: both;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; background: #0f172a; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);\">\n    <span style=\"color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; font-weight: 700; margin-right: 8px;\">❯_ [SEC_01]</span>\n    <span style=\"color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;\">高并发链路与架构基建</span>\n    <span style=\"display: inline-block; width: 8px; height: 14px; background: #38bdf8; margin-left: 8px; opacity: 0.85;\"></span>\n  </section>\n</section>"
  },
  {
    id: "h-editorial-roman",
    category: "headings",
    tag: "杂志社论",
    styleCategory: "minimal",
    title: "大刊社论·半透罗马序号大标题",
    description: "底置超大浅灰罗马序号 + 精致无衬线加粗主标 + 极简纯黑下划线",
    tags: ["杂志", "社论", "罗马数字", "大刊", "极简"],
    html: "<section style=\"margin: 32px 0 20px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"line-height: 0.7; margin-bottom: -18px;\">\n    <span style=\"font-family: 'Times New Roman', Georgia, serif; font-size: 46px; font-weight: 900; color: #e5e7eb; letter-spacing: 1px; line-height: 0.7; display: inline-block;\">\n      01.\n    </span>\n  </section>\n  <section style=\"margin: 0; padding: 0; line-height: 1.4;\">\n    <span style=\"display: inline-block; border-bottom: 2.5px solid #0a0a0a; padding-bottom: 5px; line-height: 1.4;\">\n      <span style=\"font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 19px; font-weight: 800; color: #0a0a0a; letter-spacing: 0.2px; line-height: 1.4; display: inline-block;\">\n        范式转移与核心增长飞轮\n      </span>\n    </span>\n  </section>\n</section>"
  },
  {
    id: "h-handdrawn-pin",
    category: "headings",
    tag: "手账便签",
    styleCategory: "fresh",
    title: "手账手绘·立体图钉便签标题",
    description: "倾斜手写黄色标签 + 3D 红色图钉 + 荧光马克笔底色",
    tags: ["手账", "便签", "图钉", "手绘", "活泼"],
    html: "<section style=\"margin: 28px 0 18px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"display: inline-block; background: #fef08a; padding: 7px 18px 7px 14px; border-radius: 4px; box-shadow: 2px 3px 6px rgba(0,0,0,0.08); border-left: 4px solid #eab308;\">\n    <span style=\"font-size: 16px; margin-right: 6px;\">📌</span>\n    <span style=\"font-family: 'PingFang SC', -apple-system, sans-serif; font-size: 16px; font-weight: 800; color: #713f12; letter-spacing: 0.5px;\">\n      今日灵感清单与实操笔记\n    </span>\n  </section>\n</section>"
  },
  {
    id: "h-pill-duotone",
    category: "headings",
    tag: "现代双色",
    styleCategory: "business",
    title: "现代双色·渐变胶囊药丸标题",
    description: "深蓝主序号胶囊 + 天蓝浅底扩展条 + 纯白反差对亮点",
    tags: ["双色", "胶囊", "药丸", "现代", "清爽"],
    html: "<section style=\"margin: 28px 0 18px; clear: both;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; background: #eff6ff; border-radius: 9999px; padding: 3px 16px 3px 4px; border: 1px solid #bfdbfe;\">\n    <span style=\"background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);\">\n      STEP 01\n    </span>\n    <span style=\"font-size: 15px; font-weight: 700; color: #1e3a8a; margin-left: 10px; letter-spacing: 0.2px;\">\n      系统环境初始化与脚手架搭建\n    </span>\n  </section>\n</section>"
  },
  {
    id: "q-terminal-log",
    category: "quotes",
    tag: "极客终端",
    styleCategory: "tech",
    title: "终端命令输出引用框",
    description: "macOS 红黄绿三色原生按钮 + 暗色磨砂背景 + 极客哲学金句",
    tags: ["极客", "终端", "macOS", "代码", "金句"],
    html: "<section style=\"margin: 24px 0; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 8px 24px rgba(0,0,0,0.15);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155;\">\n    <div style=\"display: flex; gap: 6px;\">\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;\"></span>\n    </div>\n    <span style=\"margin: 0 auto; color: #94a3b8; font-size: 11px; font-family: monospace;\">bash — 80x24</span>\n  </div>\n  <div style=\"padding: 16px 20px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13.5px; line-height: 1.7; color: #e2e8f0;\">\n    <p style=\"color: #38bdf8; margin: 0 0 6px 0;\">$ cat core_philosophy.txt</p>\n    <p style=\"margin: 0; color: #f1f5f9; font-style: italic;\">“软件工程的本质不是制造复杂，而是在极度混乱的现实世界中建立清晰的抽象与秩序。”</p>\n    <p style=\"color: #64748b; font-size: 12px; margin: 8px 0 0 0; text-align: right;\">— 《Clean Code 架构思考》</p>\n  </div>\n</section>"
  },
  {
    id: "q-ancient-scroll",
    category: "quotes",
    tag: "古风宣纸",
    styleCategory: "guofeng",
    title: "古风典籍·宣纸朱砂双线古卷引用",
    description: "宣纸米黄底色 + 典雅回纹边框 + 朱砂红篆刻印章 + 典雅竖排风韵",
    tags: ["古风", "宣纸", "水墨", "金句", "国风"],
    html: "<section style=\"margin: 24px 0; padding: 22px 24px; background: #faf7f0; border: 2px solid #e7dfd1; border-radius: 8px; position: relative; box-shadow: inset 0 0 12px rgba(217, 201, 179, 0.25);\" data-material=\"true\">\n  <div style=\"border: 1px dashed #c4b5a0; padding: 16px 20px; text-align: center;\">\n    <p style=\"font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 15.5px; line-height: 1.85; color: #451a03; margin: 0; letter-spacing: 1.5px; font-weight: 500;\">\n      “博学之，审问之，慎思之，明辨之，笃行之。天下之事，闻之不若见之，见之不若知之，知之不若行之。”\n    </p>\n    <div style=\"margin-top: 12px; font-size: 12px; color: #b91c1c; font-weight: 700; letter-spacing: 2px;\">\n      【 儒林·礼记中庸 】\n    </div>\n  </div>\n</section>"
  },
  {
    id: "q-magazine-bigquote",
    category: "quotes",
    tag: "大刊金句",
    styleCategory: "minimal",
    title: "大刊双引号·巨型流光大字符金句",
    description: "左上角 72px 浅蓝半透立体大双引号 + 斜体精致社论观点排版",
    tags: ["大刊", "双引号", "名言", "杂志", "高级"],
    html: "<section style=\"margin: 28px 0; padding: 24px 28px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 0 12px 12px 0; position: relative;\" data-material=\"true\">\n  <section style=\"font-family: Georgia, serif; font-size: 64px; color: #cbd5e1; position: absolute; top: -12px; left: 14px; line-height: 1; opacity: 0.6;\">\n    “\n  </section>\n  <p style=\"position: relative; z-index: 1; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', serif; font-size: 15.5px; font-weight: 600; line-height: 1.75; color: #1e293b; font-style: italic;\">\n    真正优秀的设计不是把所有东西堆砌完整，而是直到没有任何一件多余的东西可以再被拿走。\n  </p>\n  <div style=\"margin-top: 10px; text-align: right; font-size: 12.5px; color: #64748b; font-weight: 700;\">\n    — 安托万·德·圣-埃克苏佩里\n  </div>\n</section>"
  },
  {
    id: "q-highlighter-marker",
    category: "quotes",
    tag: "荧光涂抹",
    styleCategory: "fresh",
    title: "手绘荧光·胶带纸荧光笔涂抹金句",
    description: "荧光黄手绘高亮背景 + 倾斜半透胶带纸固定 + 亲和力手写便签感",
    tags: ["荧光笔", "胶带", "手绘", "便签", "金句"],
    html: "<section style=\"margin: 26px 0; padding: 20px 22px; background: #fffdf5; border: 1px solid #fef08a; border-radius: 6px; position: relative; box-shadow: 2px 4px 12px rgba(234, 179, 8, 0.08);\" data-material=\"true\">\n  <div style=\"width: 60px; height: 16px; background: rgba(253, 224, 71, 0.6); position: absolute; top: -8px; left: 50%; transform: translateX(-50%) rotate(-1deg); border-radius: 2px;\"></div>\n  <p style=\"margin: 0; font-size: 15px; line-height: 1.8; color: #713f12; font-weight: 600;\">\n    <span style=\"background: linear-gradient(180deg, transparent 60%, #fef08a 60%); padding: 0 4px;\">\n      保持对未知的好奇，把每一次挑战当成认知的升级。做长期有价值的事，时间会成为最坚固的盟友。\n    </span>\n  </p>\n</section>"
  },
  {
    id: "c-notion-info",
    category: "callouts",
    tag: "极简彩卡",
    styleCategory: "business",
    title: "极简彩卡·天蓝信息提示盒",
    description: "极简浅蓝底色 + 圆形信息图标 + 柔和灰蓝正文",
    tags: ["Notion", "Info", "信息", "提示", "蓝调"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">ℹ️</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 2px;\">核心信息提示 (Note)</div>\n    <div style=\"font-size: 13.5px; color: #1e3a8a; line-height: 1.6;\">\n      系统默认在每周一凌晨 03:00 自动进行冷数据归档与索引重建，期间只读操作不受任何影响。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-notion-tip",
    category: "callouts",
    tag: "极简彩卡",
    styleCategory: "fresh",
    title: "极简彩卡·薄荷绿技巧小贴士",
    description: "清爽薄荷绿底色 + 灯泡技巧图标 + 实操效率建议",
    tags: ["Notion", "Tip", "技巧", "小贴士", "绿色"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">💡</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 2px;\">效率提升技巧 (Pro Tip)</div>\n    <div style=\"font-size: 13.5px; color: #14532d; line-height: 1.6;\">\n      使用快捷键 <code style=\"background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;\">Cmd + K</code> 可以快速调出全局多渠道一键发布控制台。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-notion-warning",
    category: "callouts",
    tag: "极简彩卡",
    styleCategory: 'business',
    title: "极简彩卡·暖橙警示避坑指南",
    description: "暖橙警示底色 + 叹号三角图标 + 避坑注意要点",
    tags: ["Notion", "Warning", "警告", "避坑", "橙色"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">⚠️</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #9a3412; margin-bottom: 2px;\">重点注意要点 (Warning)</div>\n    <div style=\"font-size: 13.5px; color: #7c2d12; line-height: 1.6;\">\n      在修改核心生产环境配置前，务必先在测试环境完整执行压力测试并备份全量数据库快照。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-notion-danger",
    category: "callouts",
    tag: "极简彩卡",
    styleCategory: "minimal",
    title: "极简彩卡·绯红高危操作箱",
    description: "绯红警戒底色 + 禁止手势图标 + 高危红线警示",
    tags: ["Notion", "Danger", "危险", "红线", "禁止"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;\" data-material=\"true\">\n  <span style=\"font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;\">🛑</span>\n  <div style=\"flex: 1; min-width: 0;\">\n    <div style=\"font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 2px;\">高危红线警示 (Danger)</div>\n    <div style=\"font-size: 13.5px; color: #7f1d1d; line-height: 1.6;\">\n      严禁在未经脱敏的代码仓库中硬编码生产 API Key、密码与私钥，违者将触发安全审计封禁。\n    </div>\n  </div>\n</section>"
  },
  {
    id: "c-folded-memo",
    category: "callouts",
    tag: "立体便签",
    styleCategory: "fresh",
    title: "立体·右上折角便签贴",
    description: "右上角立体折角阴影 + 浅鹅黄温馨底色 + 纸张微浮动质感",
    tags: ["便签", "折角", "3D", "手账", "卡片"],
    html: "<section style=\"margin: 24px 0; padding: 18px 22px; background: #fef9c3; border-radius: 8px 0 8px 8px; border: 1px solid #fde047; position: relative; box-shadow: 3px 5px 15px rgba(0,0,0,0.06);\" data-material=\"true\">\n  <div style=\"position: absolute; top: -1px; right: -1px; width: 0; height: 0; border-style: solid; border-width: 0 20px 20px 0; border-color: transparent #facc15 transparent transparent; box-shadow: -1px 1px 3px rgba(0,0,0,0.12);\"></div>\n  <div style=\"font-size: 14px; font-weight: 700; color: #854d0e; margin-bottom: 4px;\">📝 备忘速记 / Quick Memo</div>\n  <div style=\"font-size: 13.5px; color: #713f12; line-height: 1.65;\">\n    记得在文章结尾附上互动问答与投票组件，可大幅提升粉丝在公众号底部的留言互动率与在看转化。\n  </div>\n</section>"
  },
  {
    id: "c-metric-kpi-card",
    category: "callouts",
    tag: "数据看板",
    styleCategory: "business",
    title: "核心指标·大厂成果数据看板卡",
    description: "3 列核心业务指标大数字 + 增长百分比 + 结构化对比",
    tags: ["数据", "看板", "指标", "KPI", "增长"],
    html: "<section style=\"margin: 24px 0; padding: 18px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;\" data-material=\"true\">\n  <div style=\"padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">全网总阅读</div>\n    <div style=\"font-size: 20px; font-weight: 800; color: #2563eb; margin: 4px 0;\">120W+</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">↑ 35% 同比增长</div>\n  </div>\n  <div style=\"padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">分发耗时</div>\n    <div style=\"font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0;\">3.2s</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">⚡ 效率提升 10x</div>\n  </div>\n  <div style=\"padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">粉丝留存率</div>\n    <div style=\"font-size: 20px; font-weight: 800; color: #7c3aed; margin: 4px 0;\">94.8%</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">★ 行业顶尖</div>\n  </div>\n</section>"
  },
  {
    id: "l-timeline-milestone",
    category: "lists",
    tag: "时间轴",
    styleCategory: "business",
    title: "彩色时间轴·大事记里程碑流程",
    description: "纵向连线时间轴 + 彩色阶梯节点 + 卡片式事件演进",
    tags: ["时间轴", "里程碑", "步骤", "发展历程", "节点"],
    html: "<section style=\"margin: 26px 0; padding: 10px 4px;\" data-material=\"true\">\n  <div style=\"position: relative; padding-left: 24px; border-left: 2px dashed #93c5fd; margin-bottom: 20px;\">\n    <span style=\"position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #93c5fd;\"></span>\n    <div style=\"font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase;\">阶段一 · 需求洞察与立项</div>\n    <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">完成行业竞品深度调研与用户痛点画像建模，确定核心功能矩阵。</div>\n  </div>\n  <div style=\"position: relative; padding-left: 24px; border-left: 2px dashed #93c5fd; margin-bottom: 20px;\">\n    <span style=\"position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #7dd3fc;\"></span>\n    <div style=\"font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase;\">阶段二 · 核心引擎敏捷迭代</div>\n    <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">搭建自研 AST 语法树解析器与微信专用富文本样式渲染引擎。</div>\n  </div>\n  <div style=\"position: relative; padding-left: 24px;\">\n    <span style=\"position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #16a34a; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #86efac;\"></span>\n    <div style=\"font-size: 12px; font-weight: 800; color: #16a34a; text-transform: uppercase;\">阶段三 · 全网公测与商业化发布</div>\n    <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">接入微信公众号、知乎、掘金一键多渠道分发网关，服务 10w+ 创作者。</div>\n  </div>\n</section>"
  },
  {
    id: "l-task-checklist",
    category: "lists",
    tag: "任务清单",
    styleCategory: "fresh",
    title: "极简方格·任务待办清单",
    description: "Notion 风格方形复选框 + 已完成与未完成对照清单",
    tags: ["清单", "Checklist", "待办", "Notion", "任务"],
    html: "<section style=\"margin: 22px 0; padding: 18px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);\" data-material=\"true\">\n  <div style=\"font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;\">📋 发布前自查清单 (Pre-flight Checklist)</div>\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 8px;\">\n    <span style=\"width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;\">✓</span>\n    <span style=\"font-size: 13.5px; color: #64748b; text-decoration: line-through;\">检查文章首图与封面比例是否为 2.35:1 官方规范</span>\n  </div>\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 8px;\">\n    <span style=\"width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;\">✓</span>\n    <span style=\"font-size: 13.5px; color: #64748b; text-decoration: line-through;\">校对代码块中关键字高亮与中英文空格规范</span>\n  </div>\n  <div style=\"display: flex; align-items: center; gap: 10px;\">\n    <span style=\"width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; display: inline-block;\"></span>\n    <span style=\"font-size: 13.5px; color: #1e293b; font-weight: 600;\">一键同步多平台分发并配置原创声明标签</span>\n  </div>\n</section>"
  },
  {
    id: "l-pros-cons-grid",
    category: "lists",
    tag: "红蓝对比",
    styleCategory: "minimal",
    title: "红蓝对比·优缺点左右卡",
    description: "左侧翠绿优势清单 vs 右侧珊瑚红劣势清单对比",
    tags: ["对比", "优缺点", "Pros", "Cons", "选型"],
    html: "<section style=\"margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;\" data-material=\"true\">\n  <div style=\"padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;\">\n    <div style=\"font-size: 13.5px; font-weight: 800; color: #166534; margin-bottom: 8px;\">✅ 核心优势 (Pros)</div>\n    <ul style=\"margin: 0; padding-left: 16px; font-size: 12.5px; color: #14532d; line-height: 1.7;\">\n      <li>毫秒级热重载排版渲染</li>\n      <li>全自动同步至微信公众号</li>\n      <li>支持自定义 CSS 深度定制</li>\n    </ul>\n  </div>\n  <div style=\"padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;\">\n    <div style=\"font-size: 13.5px; font-weight: 800; color: #991b1b; margin-bottom: 8px;\">⚠️ 潜在局限 (Cons)</div>\n    <ul style=\"margin: 0; padding-left: 16px; font-size: 12.5px; color: #7f1d1d; line-height: 1.7;\">\n      <li>需要一定 Markdown 语法基础</li>\n      <li>部分小众平台授权有效期受限</li>\n    </ul>\n  </div>\n</section>"
  },
  {
    id: "tech-macos-window",
    category: "tech_cards",
    tag: "系统终端",
    styleCategory: "tech",
    title: "系统终端·代码展示窗口",
    description: "macOS 经典红黄绿三色控制圆点 + 深曜石代码框",
    tags: ["代码", "macOS", "终端", "开发", "极客"],
    html: "<section style=\"margin: 24px 0; background: #1e1e24; border-radius: 10px; overflow: hidden; border: 1px solid #2d2d38; box-shadow: 0 8px 24px rgba(0,0,0,0.18);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #26262e;\">\n    <div style=\"display: flex; gap: 6px;\">\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; display: inline-block;\"></span>\n      <span style=\"width: 10px; height: 10px; border-radius: 50%; background: #27c93f; display: inline-block;\"></span>\n    </div>\n    <span style=\"color: #94a3b8; font-size: 11px; font-family: monospace;\">ServerEngine.ts</span>\n    <span style=\"color: #64748b; font-size: 11px; font-family: monospace;\">TypeScript</span>\n  </div>\n  <pre style=\"margin: 0; padding: 16px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #f8fafc; overflow-x: auto; background: transparent;\"><code style=\"color:#f8fafc;\"><span style=\"color:#c678dd;\">export async function</span> <span style=\"color:#61afef;\">publishArticle</span>(doc: <span style=\"color:#e5c07b;\">ArticlePayload</span>) {\n  <span style=\"color:#5c6370;font-style:italic;\">// 一键并行分发至全渠道</span>\n  <span style=\"color:#c678dd;\">const</span> res = <span style=\"color:#c678dd;\">await</span> <span style=\"color:#e5c07b;\">Promise</span>.<span style=\"color:#61afef;\">all</span>([\n    <span style=\"color:#61afef;\">syncToWeChat</span>(doc),\n    <span style=\"color:#61afef;\">syncToZhihu</span>(doc)\n  ]);\n  <span style=\"color:#c678dd;\">return</span> { <span style=\"color:#e06c75;\">success</span>: <span style=\"color:#d19a66;\">true</span>, <span style=\"color:#e06c75;\">data</span>: res };\n}</code></pre>\n</section>"
  },
  {
    id: "tech-api-endpoint",
    category: "tech_cards",
    tag: "接口文档",
    styleCategory: "tech",
    title: "接口路由与参数规范卡",
    description: "POST 翠绿药丸徽章 + 请求路径 + 参数结构表",
    tags: ["API", "RESTful", "接口", "后端", "架构"],
    html: "<section style=\"margin: 22px 0; padding: 16px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 10px;\">\n    <span style=\"background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; font-family: monospace;\">POST</span>\n    <code style=\"font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #0f172a;\">/api/v2/articles/sync</code>\n  </div>\n  <div style=\"font-size: 12.5px; color: #64748b; margin-bottom: 8px;\">支持传入 Markdown 原文并指定目标分发平台列表与授权令牌。</div>\n  <div style=\"background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px; color: #334155;\">\n    Content-Type: application/json; charset=utf-8\n  </div>\n</section>"
  },
  {
    id: "tech-kbd-shortcuts",
    category: "tech_cards",
    tag: "快捷键",
    styleCategory: "tech",
    title: "立体按键·键盘快捷键组合展示栏",
    description: "拟物立体质感 KBD 键盘按键 + 功能快捷操作说明",
    tags: ["快捷键", "KBD", "键盘", "效率", "工具"],
    html: "<section style=\"margin: 20px 0; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;\" data-material=\"true\">\n  <span style=\"font-size: 13.5px; font-weight: 700; color: #1e293b;\">⚡ 全屏专注排版模式</span>\n  <div style=\"display: flex; align-items: center; gap: 4px;\">\n    <kbd style=\"display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\">Ctrl</kbd>\n    <span style=\"color: #94a3b8; font-weight: 700;\">+</span>\n    <kbd style=\"display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\">Shift</kbd>\n    <span style=\"color: #94a3b8; font-weight: 700;\">+</span>\n    <kbd style=\"display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);\">F</kbd>\n  </div>\n</section>"
  },
  {
    id: "tbl-slate-movie-rank",
    category: "tables",
    tag: "雾霾蓝排行",
    styleCategory: "business",
    title: "雾霾蓝·首列高光电影排行表格",
    description: "首列雾霾蓝高亮序号 + 柔和灰蓝表头 + 纯白格线规整排布",
    tags: ["表格", "排行", "电影", "雾霾蓝", "数据", "Top"],
    html: `<section style="margin: 24px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 14px; text-align: center; box-sizing: border-box; margin: 0;">
    <thead>
      <tr style="background-color: #f0f4f6; color: #475569;">
        <th style="background-color: #8da5b4; color: #ffffff; font-weight: 700; border: 1.5px solid #ffffff; padding: 11px 14px; text-align: center; width: 55px;">#</th>
        <th style="background-color: #f0f4f6; color: #475569; font-weight: 700; border: 1.5px solid #ffffff; padding: 11px 16px; text-align: center;">Top 8 Movies</th>
        <th style="background-color: #f0f4f6; color: #475569; font-weight: 700; border: 1.5px solid #ffffff; padding: 11px 16px; text-align: center; width: 85px;">Year</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f8fafc;">
        <td style="background-color: #8da5b4; color: #ffffff; font-weight: 800; border: 1.5px solid #ffffff; padding: 10px 14px; text-align: center;">1</td>
        <td style="background-color: #f8fafc; color: #334155; font-weight: 600; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">The Shawshank Redemption</td>
        <td style="background-color: #f8fafc; color: #475569; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">1994</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="background-color: #8da5b4; color: #ffffff; font-weight: 800; border: 1.5px solid #ffffff; padding: 10px 14px; text-align: center;">2</td>
        <td style="background-color: #ffffff; color: #334155; font-weight: 600; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">The Godfather</td>
        <td style="background-color: #ffffff; color: #475569; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">1998</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="background-color: #8da5b4; color: #ffffff; font-weight: 800; border: 1.5px solid #ffffff; padding: 10px 14px; text-align: center;">3</td>
        <td style="background-color: #f8fafc; color: #334155; font-weight: 600; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">The Godfather: Part II</td>
        <td style="background-color: #f8fafc; color: #475569; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">1974</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-apricot-star-card",
    category: "tables",
    tag: "暖杏卡片",
    styleCategory: "fresh",
    title: "暖杏星标·圆角备考复习攻略卡",
    description: "暖杏星标圆角卡片 + 粗黑外边框 + 双列圆点空心清单",
    tags: ["表格", "备考", "攻略", "清单", "暖杏", "卡片"],
    html: `<section style="margin: 24px 0; border: 1.5px solid #292524; border-radius: 14px; overflow: hidden; background: #ffffff; clear: both;" data-material="true">
  <div style="background-color: #faece1; padding: 11px 16px; border-bottom: 1.5px solid #292524; text-align: center; font-size: 15.5px; font-weight: 800; color: #1c1917; letter-spacing: 0.5px;">
    ⭐ 超详细的考研全程攻略 ⭐
  </div>
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14.5px; text-align: left; margin: 0; box-sizing: border-box;">
    <tbody>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600; width: 50%;">○ 整体时间规划</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600; width: 50%;">○ 整体时间规划</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 国内考研环境</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 国内考研环境</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考研基础知识</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考研基础知识</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 各学科具体备考方法</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 各学科具体备考方法</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考前注意事项</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考前注意事项</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-retro-window-size",
    category: "tables",
    tag: "黑金尺码",
    styleCategory: "tech",
    title: "复古窗口·黑金对照尺码参照表",
    description: "顶部复古窗口控制按钮 + 纯黑高对比表头 + 纯黑网格尺码表",
    tags: ["表格", "尺码", "复古", "黑金", "对照", "服装"],
    html: `<section style="margin: 24px 0; border: 2px solid #1a1a1a; background: #ffffff; overflow: hidden; clear: both;" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: #ffffff; border-bottom: 2px solid #1a1a1a; font-size: 14.5px; font-weight: 800; color: #1a1a1a;">
    <span style="visibility: hidden; font-size: 11px;">_ □ ✕</span>
    <span style="letter-spacing: 1px;">品牌尺码参照表</span>
    <span style="font-family: monospace; font-size: 13px; font-weight: bold; letter-spacing: 2px;">_ □ ✕</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #181818; color: #ffffff;">
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">尺寸</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">前长</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">后长</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">胸围</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">腰围</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">袖长</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">S</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">52</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">56</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">120</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">62</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">40</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">M</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">53</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">124</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">68</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">43</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">L</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">54</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">58</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">127</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">104</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">XL</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">54</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">58</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">128</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">104</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">XXL</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">54</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">58</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">128</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">104</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-morandi-blush-size",
    category: "tables",
    tag: "莫兰迪藕粉",
    styleCategory: "minimal",
    title: "莫兰迪藕粉·虚线分割优雅尺码表",
    description: "藕粉柔和圆角表头 + 棕褐优雅文字 + 柔美横向虚线分割",
    tags: ["表格", "尺码", "莫兰迪", "藕粉", "虚线", "优雅"],
    html: `<section style="margin: 24px 0; border: 1.5px solid #5a4848; border-radius: 12px; overflow: hidden; background: #ffffff; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #ebe0e0; color: #4a3838;">
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">尺寸</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">腰围</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">臀围</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">裤长</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">脚围</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">S(165/74A)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">78</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">95</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">88</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">30</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">M(170/76A)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">81</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">98</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">90</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">31</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">L(175/80)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">84</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">101</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">92</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">32</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">XL(175/84A)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">88</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">101</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">94</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">33</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; padding: 10px 12px; font-weight: 600; color: #4a3838;">XXL(180/92A)</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">92</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">107</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">96</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">34</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-milktea-apricot-schedule",
    category: "tables",
    tag: "奶茶日程",
    styleCategory: "fresh",
    title: "雅致奶茶杏·粗黑框双列考试日程表",
    description: "暖奶奶茶杏色表头 + 浓郁粗黑外框与实线单元格 + 双列排期表",
    tags: ["表格", "日程", "考试", "排期", "奶茶", "双列"],
    html: `<section style="margin: 24px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: 2px solid #231f20; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 14.5px; text-align: center; box-sizing: border-box; margin: 0;">
    <thead>
      <tr style="background-color: #faeee6; color: #231f20;">
        <th style="border: 2px solid #231f20; padding: 12px 16px; font-weight: 800; letter-spacing: 0.5px; width: 45%;">考试名称</th>
        <th style="border: 2px solid #231f20; padding: 12px 16px; font-weight: 800; letter-spacing: 0.5px; width: 55%;">考试时间</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">托福（TOEFL）</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">1月4，5，11，12日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">专业英语八级</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">3月21日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">计算机等级</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">3月28-30日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">中小学教师资格证考试</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">10月31日</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-amber-schedule",
    category: "tables",
    tag: "亮黄日程",
    styleCategory: "fresh",
    title: "暖杏亮黄日程对照表",
    description: "亮黄加粗表头 + 暖杏白相间交替行 + 纯黑网格边框",
    tags: ["表格", "日程", "考试", "对比", "亮黄", "排期"],
    html: `<section style="margin: 24px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #18181b; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 14.5px; text-align: center; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #f59e0b; color: #18181b;">
        <th style="border: 1px solid #18181b; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px; width: 45%;">考试名称</th>
        <th style="border: 1px solid #18181b; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px; width: 55%;">考试时间</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #f7f4ed; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #f7f4ed; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #f7f4ed; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-modern-striped",
    category: "tables",
    tag: "斑马表格",
    styleCategory: "minimal",
    title: "现代无界·斑马交替行数据明细表",
    description: "深曜石表头 + 浅灰交替底色 + 优雅圆角外框",
    tags: ["表格", "斑马纹", "数据", "对比", "现代"],
    html: "<section style=\"margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px;\" data-material=\"true\">\n  <table style=\"width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; font-family: sans-serif;\">\n    <thead>\n      <tr style=\"background: #0f172a; color: #ffffff;\">\n        <th style=\"padding: 12px 16px; font-weight: 700;\">功能维度</th>\n        <th style=\"padding: 12px 16px; font-weight: 700;\">传统排版器</th>\n        <th style=\"padding: 12px 16px; font-weight: 700; color: #38bdf8;\">EasyMD 智能引擎</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"background: #ffffff; border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 16px; font-weight: 600; color: #334155;\">多平台同步</td>\n        <td style=\"padding: 10px 16px; color: #64748b;\">手动逐个复制粘贴</td>\n        <td style=\"padding: 10px 16px; color: #16a34a; font-weight: 700;\">✓ 1秒一键全网分发</td>\n      </tr>\n      <tr style=\"background: #f8fafc; border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 16px; font-weight: 600; color: #334155;\">代码高亮</td>\n        <td style=\"padding: 10px 16px; color: #64748b;\">格式错乱/丢失行号</td>\n        <td style=\"padding: 10px 16px; color: #16a34a; font-weight: 700;\">✓ 完美微信原生兼容</td>\n      </tr>\n      <tr style=\"background: #ffffff;\">\n        <td style=\"padding: 10px 16px; font-weight: 600; color: #334155;\">素材生态</td>\n        <td style=\"padding: 10px 16px; color: #64748b;\">千篇一律老旧模版</td>\n        <td style=\"padding: 10px 16px; color: #16a34a; font-weight: 700;\">✓ 50+ 顶级设计组件</td>\n      </tr>\n    </tbody>\n  </table>\n</section>"
  },
  {
    id: "tbl-tier-comparison",
    category: "tables",
    tag: "方案对比",
    styleCategory: "business",
    title: "版本矩阵·免费与专业版对比",
    description: "结构化方案功能点对勾比对卡片",
    tags: ["版本对比", "功能矩阵", "方案", "表格"],
    html: "<section style=\"margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);\" data-material=\"true\">\n  <table style=\"width: 100%; border-collapse: collapse; text-align: center; font-size: 13px;\">\n    <thead>\n      <tr style=\"background: #f8fafc; border-bottom: 2px solid #e2e8f0;\">\n        <th style=\"padding: 14px; text-align: left; color: #0f172a; font-weight: 700;\">权益特性</th>\n        <th style=\"padding: 14px; color: #64748b; font-weight: 600;\">免费开源版</th>\n        <th style=\"padding: 14px; background: #eff6ff; color: #2563eb; font-weight: 800;\">PRO 专业版 👑</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 14px; text-align: left; color: #334155;\">实时双栏排版与导出</td>\n        <td style=\"padding: 10px 14px; color: #16a34a;\">✓ 无限次</td>\n        <td style=\"padding: 10px 14px; background: #eff6ff; color: #16a34a; font-weight: 700;\">✓ 无限次</td>\n      </tr>\n      <tr style=\"border-bottom: 1px solid #f1f5f9;\">\n        <td style=\"padding: 10px 14px; text-align: left; color: #334155;\">AI 智能润色与结构重构</td>\n        <td style=\"padding: 10px 14px; color: #94a3b8;\">每日 5 次</td>\n        <td style=\"padding: 10px 14px; background: #eff6ff; color: #2563eb; font-weight: 700;\">极速无限调用</td>\n      </tr>\n      <tr>\n        <td style=\"padding: 10px 14px; text-align: left; color: #334155;\">多渠道一键分发平台数</td>\n        <td style=\"padding: 10px 14px; color: #64748b;\">3 个主流渠道</td>\n        <td style=\"padding: 10px 14px; background: #eff6ff; color: #2563eb; font-weight: 700;\">全网 10+ 矩阵</td>\n      </tr>\n    </tbody>\n  </table>\n</section>"
  },
  {
    id: "tbl-business-blue-compare",
    category: "tables",
    tag: "商务深蓝",
    styleCategory: "business",
    title: "深蓝智见·多维度功能方案比对表",
    description: "经典深蓝商务表头 + 推荐列高亮背景 + 优雅清爽边框",
    tags: ["表格", "商务", "对比", "矩阵", "深蓝", "权益"],
    html: `<section style="margin: 24px 0; overflow-x: auto; border: 1.5px solid #bfdbfe; border-radius: 12px; box-shadow: 0 4px 16px rgba(37,99,235,0.06); clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13.5px; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #1e3a8a; color: #ffffff;">
        <th style="padding: 13px 16px; text-align: left; font-weight: 700; color: #ffffff;">服务维度</th>
        <th style="padding: 13px 16px; font-weight: 700; color: #93c5fd;">基础版</th>
        <th style="padding: 13px 16px; font-weight: 800; color: #ffffff; background: #2563eb;">旗舰企业版 👑</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; border-bottom: 1px solid #eff6ff;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">云端多端同步</td>
        <td style="padding: 11px 16px; color: #64748b;">单设备</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 全终端实时互联</td>
      </tr>
      <tr style="background-color: #f8fafc; border-bottom: 1px solid #eff6ff;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">AI 智能润色排版</td>
        <td style="padding: 11px 16px; color: #94a3b8;">每天 10 次</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 极速无限制生成</td>
      </tr>
      <tr style="background-color: #ffffff; border-bottom: 1px solid #eff6ff;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">全网平台一键分发</td>
        <td style="padding: 11px 16px; color: #94a3b8;">✕ 不支持</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 8+ 媒体矩阵分发</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">专属客户经理支持</td>
        <td style="padding: 11px 16px; color: #94a3b8;">✕ 社区答疑</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 7×24h 绿色通道</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-terminal-dark-metrics",
    category: "tables",
    tag: "代码终端",
    styleCategory: "tech",
    title: "极客终端·代码监控指标表",
    description: "Mac 控制台红黄绿控制栏 + 纯黑暗底 + 荧光绿数据监控",
    tags: ["表格", "极客", "代码", "终端", "监控", "指标"],
    html: `<section style="margin: 24px 0; border: 1.5px solid #334155; border-radius: 10px; overflow: hidden; background: #0f172a; clear: both;" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; background: #1e293b; border-bottom: 1px solid #334155;">
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
    </div>
    <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">cluster_metrics.log</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; text-align: left; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background: #0f172a; color: #38bdf8; border-bottom: 1.5px solid #334155;">
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">NODE_ID</th>
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">CPU_USAGE</th>
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">MEM_FREE</th>
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">STATUS</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #1e293b; background: #0f172a;">
        <td style="padding: 9px 14px; color: #f8fafc;">k8s-node-01</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">14.2%</td>
        <td style="padding: 9px 14px; color: #f8fafc;">24.8 GB</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">HEALTHY</td>
      </tr>
      <tr style="border-bottom: 1px solid #1e293b; background: #131d33;">
        <td style="padding: 9px 14px; color: #f8fafc;">k8s-node-02</td>
        <td style="padding: 9px 14px; color: #f59e0b; font-weight: 700;">72.5%</td>
        <td style="padding: 9px 14px; color: #f8fafc;">8.4 GB</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">HEALTHY</td>
      </tr>
      <tr style="background: #0f172a;">
        <td style="padding: 9px 14px; color: #f8fafc;">k8s-node-03</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">28.1%</td>
        <td style="padding: 9px 14px; color: #f8fafc;">19.2 GB</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">HEALTHY</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-matcha-green-progress",
    category: "tables",
    tag: "抹茶清风",
    styleCategory: "fresh",
    title: "抹茶清风·清新周计划进度表",
    description: "自然抹茶绿表头 + 浅绿相间行 + 进度指标高亮",
    tags: ["表格", "抹茶", "计划", "进度", "清新", "周报"],
    html: `<section style="margin: 24px 0; overflow-x: auto; border: 1.5px solid #bbf7d0; border-radius: 12px; overflow: hidden; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #2d6a4f; color: #ffffff;">
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; width: 25%;">周阶段</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; width: 50%;">关键执行任务</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; width: 25%;">达成指标</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f4fbf7; border-bottom: 1px solid #dcfce7;">
        <td style="padding: 10px 14px; font-weight: 700; color: #1e392a;">第一阶段</td>
        <td style="padding: 10px 14px; text-align: left; color: #2d4a3e; font-weight: 600;">🌿 完成核心业务原型与用户调研</td>
        <td style="padding: 10px 14px; color: #15803d; font-weight: 800;">100% 已交付</td>
      </tr>
      <tr style="background-color: #ffffff; border-bottom: 1px solid #dcfce7;">
        <td style="padding: 10px 14px; font-weight: 700; color: #1e392a;">第二阶段</td>
        <td style="padding: 10px 14px; text-align: left; color: #2d4a3e; font-weight: 600;">🌿 微信公众号排版引擎深度重构</td>
        <td style="padding: 10px 14px; color: #15803d; font-weight: 800;">进行中 85%</td>
      </tr>
      <tr style="background-color: #f4fbf7;">
        <td style="padding: 10px 14px; font-weight: 700; color: #1e392a;">第三阶段</td>
        <td style="padding: 10px 14px; text-align: left; color: #2d4a3e; font-weight: 600;">🌿 全网媒体矩阵自动化同步发布</td>
        <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">待开启</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-guofeng-crimson-classic",
    category: "tables",
    tag: "朱砂古韵",
    styleCategory: "guofeng",
    title: "朱砂古韵·国风典籍文史对照表",
    description: "朱砂红双重外框 + 经典宋体排版 + 典籍名句双栏对照",
    tags: ["表格", "国风", "古风", "文史", "典籍", "朱砂"],
    html: `<section style="margin: 24px 0; border: 2px solid #991b1b; padding: 3px; background: #faf7f2; clear: both;" data-material="true">
  <div style="border: 1px solid #b91c1c; padding: 2px;">
    <table style="width: 100%; border-collapse: collapse; font-family: 'Songti SC', SimSun, 'Source Han Serif SC', serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
      <thead>
        <tr style="background-color: #991b1b; color: #ffffff;">
          <th style="border: 1px solid #7f1d1d; padding: 10px 12px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">典籍名录</th>
          <th style="border: 1px solid #7f1d1d; padding: 10px 12px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">朝代作者</th>
          <th style="border: 1px solid #7f1d1d; padding: 10px 12px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">传世名句摘录</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #ffffff;">
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; font-weight: 800; color: #991b1b;">《道德经》</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #451a03; font-weight: 700;">春秋·老子</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #292524; font-style: italic;">“上善若水，水善利万物而不争。”</td>
        </tr>
        <tr style="background-color: #faf7f2;">
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; font-weight: 800; color: #991b1b;">《南华经》</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #451a03; font-weight: 700;">战国·庄周</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #292524; font-style: italic;">“北冥有鱼，其名为鲲，鲲之大不知其几千里也。”</td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; font-weight: 800; color: #991b1b;">《世说新语》</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #451a03; font-weight: 700;">南朝·刘义庆</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #292524; font-style: italic;">“未若柳絮因风起。”</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>`
  },
  {
    id: "tbl-handdrawn-planner-card",
    category: "tables",
    tag: "暖黄手账",
    styleCategory: "fresh",
    title: "暖黄手账·萌趣打卡习惯自律表",
    description: "明黄手账表头 + 粗黑实体外框 + 星标对勾打卡进度",
    tags: ["表格", "手账", "打卡", "习惯", "自律", "日程"],
    html: `<section style="margin: 24px 0; border: 2px solid #18181b; border-radius: 12px; background: #ffffff; box-shadow: 4px 4px 0px #fed7aa; overflow: hidden; clear: both;" data-material="true">
  <div style="background-color: #fef08a; padding: 10px 16px; border-bottom: 2px solid #18181b; display: flex; align-items: center; justify-content: space-between;">
    <span style="font-size: 14.5px; font-weight: 900; color: #18181b; letter-spacing: 0.5px;">✨ 本周打卡清单计划表 ✨</span>
    <span style="font-size: 12px; font-weight: 800; background: #ffffff; border: 1.5px solid #18181b; padding: 2px 8px; border-radius: 6px;">DAY 1-7</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #fffbeb; color: #18181b; border-bottom: 1.5px solid #18181b;">
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">自律习惯</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周一</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周二</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周三</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周四</th>
        <th style="padding: 9px 8px; font-weight: 800;">周五</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1.5px solid #18181b;">
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 700; color: #18181b;">早起阅读 30min</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
      </tr>
      <tr style="border-bottom: 1.5px solid #18181b; background: #fffdf5;">
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 700; color: #18181b;">有氧慢跑 5km</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #d4d4d8;">—</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
        <td style="padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
      </tr>
      <tr>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 700; color: #18181b;">深度复盘输出</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-minimal-luxury-clean",
    category: "tables",
    tag: "大刊极简",
    styleCategory: "minimal",
    title: "极简大刊·轻奢高阶无纵线数据表",
    description: "杂志大刊上下双横线 + 宽裕呼吸留白 + 极简数据排版",
    tags: ["表格", "极简", "轻奢", "数据", "无纵线", "大刊"],
    html: `<section style="margin: 28px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: left; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="border-bottom: 1px solid #0f172a; color: #0f172a;">
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px;">METRICS 指标</th>
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px; text-align: center;">2024 Q3</th>
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px; text-align: center;">2024 Q4</th>
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px; text-align: right;">YoY 同比</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 16px; font-weight: 600; color: #1e293b;">月活跃创作用户数 (MAU)</td>
        <td style="padding: 11px 16px; text-align: center; color: #475569;">1,240,000</td>
        <td style="padding: 11px 16px; text-align: center; color: #0f172a; font-weight: 700;">2,850,000</td>
        <td style="padding: 11px 16px; text-align: right; color: #16a34a; font-weight: 800;">+129.8%</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 16px; font-weight: 600; color: #1e293b;">文章排版渲染效率提升</td>
        <td style="padding: 11px 16px; text-align: center; color: #475569;">3.2x</td>
        <td style="padding: 11px 16px; text-align: center; color: #0f172a; font-weight: 700;">12.5x</td>
        <td style="padding: 11px 16px; text-align: right; color: #16a34a; font-weight: 800;">+290.6%</td>
      </tr>
      <tr>
        <td style="padding: 11px 16px; font-weight: 600; color: #1e293b;">用户净推荐值 (NPS)</td>
        <td style="padding: 11px 16px; text-align: center; color: #475569;">78.2</td>
        <td style="padding: 11px 16px; text-align: center; color: #0f172a; font-weight: 700;">94.6</td>
        <td style="padding: 11px 16px; text-align: right; color: #16a34a; font-weight: 800;">+20.9%</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-aurora-gradient-eval",
    category: "tables",
    tag: "极光渐变",
    styleCategory: "business",
    title: "极光渐变·科技产品多维测评打分表",
    description: "蓝紫极光渐变表头 + 星级打分比对 + 专属推荐列高亮",
    tags: ["表格", "渐变", "测评", "打分", "对比", "科技"],
    html: `<section style="margin: 24px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(99,102,241,0.12); border: 1px solid #e0e7ff; background: #ffffff; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 13.5px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff;">
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; text-align: left;">评测维度</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff;">竞品 A</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff;">竞品 B</th>
        <th style="padding: 12px 14px; font-weight: 800; color: #fde047; background: rgba(0,0,0,0.15);">EasyMD ✨</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 14px; text-align: left; font-weight: 600; color: #334155;">微信复制排版保真度</td>
        <td style="padding: 10px 14px; color: #f59e0b;">★★★☆☆</td>
        <td style="padding: 10px 14px; color: #f59e0b;">★★★★☆</td>
        <td style="padding: 10px 14px; color: #4f46e5; font-weight: 800; background: #f5f3ff;">★★★★★ (100%)</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9; background: #faf5ff;">
        <td style="padding: 10px 14px; text-align: left; font-weight: 600; color: #334155;">多平台一键全网分发</td>
        <td style="padding: 10px 14px; color: #94a3b8;">✕ 需手动</td>
        <td style="padding: 10px 14px; color: #94a3b8;">✕ 需手动</td>
        <td style="padding: 10px 14px; color: #16a34a; font-weight: 800; background: #f5f3ff;">✓ 全自动分发</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; text-align: left; font-weight: 600; color: #334155;">高质量原生设计素材库</td>
        <td style="padding: 10px 14px; color: #64748b;">老旧模板</td>
        <td style="padding: 10px 14px; color: #64748b;">基础样式</td>
        <td style="padding: 10px 14px; color: #4f46e5; font-weight: 800; background: #f5f3ff;">60+ 精雕设计</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-macaron-faq-qa",
    category: "tables",
    tag: "马卡龙问答",
    styleCategory: "fresh",
    title: "马卡龙双色·Q&A 常见问答速查表",
    description: "马卡龙清新配色 + 问答 Q&A 左右分栏 + 圆角卡片外框",
    tags: ["表格", "问答", "FAQ", "马卡龙", "卡片", "帮助"],
    html: `<section style="margin: 24px 0; border: 1.5px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff; clear: both;" data-material="true">
  <div style="background: #e0f2fe; padding: 10px 16px; border-bottom: 1.5px solid #cbd5e1; font-weight: 800; font-size: 14.5px; color: #0369a1; text-align: center;">
    💡 常见核心疑问速查指南 (FAQ)
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 13.5px; text-align: left; margin: 0; box-sizing: border-box;">
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 14px; background: #fef2f2; color: #be123c; font-weight: 800; width: 28%;">Q: 复制进微信格式会乱吗？</td>
        <td style="padding: 11px 14px; background: #ffffff; color: #334155; line-height: 1.6;">A: 绝对不会！我们经过严苛的内联 CSS 编译，100% 还原微信原生排版。</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 14px; background: #fef9c3; color: #854d0e; font-weight: 800;">Q: 支持哪些代码高亮主题？</td>
        <td style="padding: 11px 14px; background: #ffffff; color: #334155; line-height: 1.6;">A: 内置 Atom One Dark、GitHub Light、Monokai、VS Code 等 10+ 款主流代码配色。</td>
      </tr>
      <tr>
        <td style="padding: 11px 14px; background: #f0fdf4; color: #166534; font-weight: 800;">Q: 数据会上传到云端服务器吗？</td>
        <td style="padding: 11px 14px; background: #ffffff; color: #334155; line-height: 1.6;">A: 所有文章与个人设置默认均存储在浏览器本地，安全隐私零泄露。</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "tbl-redbook-checkin-routine",
    category: "tables",
    tag: "红薯打卡",
    styleCategory: "fresh",
    title: "小红书爆款·减脂打卡食谱日程表",
    description: "珊瑚粉渐变表头 + 每日三餐饮食计划 + 热量卡路里预估",
    tags: ["表格", "小红书", "食谱", "打卡", "减脂", "日程"],
    html: `<section style="margin: 24px 0; border: 1.5px solid #fda4af; border-radius: 14px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 14px rgba(244,63,94,0.08); clear: both;" data-material="true">
  <div style="background: linear-gradient(135deg, #fb7185, #f43f5e); padding: 10px 16px; text-align: center; color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">
    🥗 超自律 7 天掉秤食谱打卡 💖
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 13.5px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background: #fff1f2; color: #9f1239; border-bottom: 1px solid #fecdd3;">
        <th style="padding: 10px 12px; font-weight: 800;">时间</th>
        <th style="padding: 10px 12px; font-weight: 800;">推荐食谱内容</th>
        <th style="padding: 10px 12px; font-weight: 800;">热量预估</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #fff1f2;">
        <td style="padding: 10px 12px; font-weight: 700; color: #e11d48; background: #fff5f5;">早餐 08:00</td>
        <td style="padding: 10px 12px; text-align: left; color: #4c0519; font-weight: 600;">☕ 黑咖啡 + 水煮蛋 1 颗 + 全麦面包 1 片</td>
        <td style="padding: 10px 12px; color: #e11d48; font-weight: 800;">~220 kcal</td>
      </tr>
      <tr style="border-bottom: 1px solid #fff1f2; background: #fffbfb;">
        <td style="padding: 10px 12px; font-weight: 700; color: #e11d48; background: #fff5f5;">午餐 12:30</td>
        <td style="padding: 10px 12px; text-align: left; color: #4c0519; font-weight: 600;">🥑 杂粮饭半碗 + 香煎鸡胸肉 150g + 水煮西兰花</td>
        <td style="padding: 10px 12px; color: #e11d48; font-weight: 800;">~450 kcal</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; font-weight: 700; color: #e11d48; background: #fff5f5;">晚餐 18:00</td>
        <td style="padding: 10px 12px; text-align: left; color: #4c0519; font-weight: 600;">🥣 无糖酸奶 1 盒 + 蓝莓/小番茄一把</td>
        <td style="padding: 10px 12px; color: #e11d48; font-weight: 800;">~180 kcal</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: "d-sparkle-diamond",
    category: "dividers",
    tag: "星芒分割",
    styleCategory: "minimal",
    title: "星芒闪耀·双侧流光居中微光分割线",
    description: "居中 ✨ 闪光星芒 + 双侧渐变流光细线",
    tags: ["分割线", "星芒", "极简", "装饰", "优雅"],
    html: "<section style=\"margin: 28px 0; text-align: center; display: flex; align-items: center; justify-content: center; gap: 14px;\" data-material=\"true\">\n  <div style=\"flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #cbd5e1);\"></div>\n  <span style=\"font-size: 14px; color: #64748b; transform: scale(1.2);\">✦ ✦ ✦</span>\n  <div style=\"flex: 1; height: 1px; background: linear-gradient(90deg, #cbd5e1, transparent);\"></div>\n</section>"
  },
  {
    id: "d-scissors-coupon",
    category: "dividers",
    tag: "虚线剪刀",
    styleCategory: 'minimal',
    title: "虚线剪刀·优惠券裁切打孔分割线",
    description: "✂️ 经典裁切剪刀 + 细密打孔虚线",
    tags: ["分割线", "剪刀", "打孔", "虚线", "活动"],
    html: "<section style=\"margin: 28px 0; display: flex; align-items: center; gap: 8px; color: #94a3b8;\" data-material=\"true\">\n  <span style=\"font-size: 16px; transform: rotate(-90deg);\">✂️</span>\n  <div style=\"flex: 1; border-top: 1.5px dashed #cbd5e1; height: 0;\"></div>\n</section>"
  },
  {
    id: "hw-tldr-summary",
    category: "header_widgets",
    tag: "要点导读",
    styleCategory: "business",
    title: "观点精粹·30秒核心要点速览",
    description: "高亮总结卡片，帮助读者30秒抓住全文核心精髓",
    tags: ["导读", "TLDR", "摘要", "要点", "开头"],
    html: "<section style=\"margin: 0 0 24px 0; padding: 18px 20px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;\">\n    <div style=\"font-size: 14px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;\">\n      <span>⚡</span> <span>TL;DR · 30秒核心要点</span>\n    </div>\n    <span style=\"font-size: 11px; color: #64748b; background: #e2e8f0; padding: 2px 8px; border-radius: 9999px;\">精读约 5 分钟</span>\n  </div>\n  <ul style=\"margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.75;\">\n    <li><strong>痛点所在：</strong> 传统内容跨平台排版耗时长、格式易崩塌。</li>\n    <li><strong>解决方案：</strong> 采用 AST 抽象语法树与专属 CSS 隔离渲染引擎。</li>\n    <li><strong>落地效果：</strong> 全网矩阵同步发布效率提升 10 倍以上。</li>\n  </ul>\n</section>"
  },
  {
    id: "fw-social-matrix",
    category: "footer_widgets",
    tag: "社交矩阵",
    styleCategory: "business",
    title: "全网矩阵·微信/掘金/知乎多平台一键关注",
    description: "极具品质的多社交平台彩色徽标阵列与订阅引导",
    tags: ["文末", "关注", "社交矩阵", "微信", "知乎", "掘金"],
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
    id: 'h-135-yellow-marker-num',
    name: '亮黄荧光简单序号标题',
    description: '居中大号加粗序号 + 倾斜黄色荧光笔划线 + 居中标题',
    tag: '荧光序号',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="text-align: center; margin: 4px 0;"><div style="display: inline-block; position: relative; line-height: 1; margin-bottom: 4px;"><svg width="52" height="20" viewBox="0 0 74 28" fill="none" style="position: absolute; left: 50%; top: 50%; margin-left: -26px; margin-top: -10px; z-index: 1; pointer-events: none;"><path d="M 2 16 C 18 8, 48 4, 72 10 C 73.5 11.5, 73 15, 71 18 L 68 23 C 46 17, 18 20, 2 28 C 0.5 27, 0 24, 0.5 21 Z" fill="#ffe600"/></svg><span style="position: relative; z-index: 2; font-size: 26px; font-weight: 900; color: #18181b; font-family: -apple-system, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -1px; line-height: 1; display: inline-block; padding: 0 2px;">01</span></div><div style="font-size: 14px; font-weight: 700; color: #18181b; letter-spacing: 0.5px;">简单序号标题</div></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 28px 0 20px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; margin-bottom: 6px; line-height: 1;">
    <svg width="74" height="28" viewBox="0 0 74 28" fill="none" style="position: absolute; left: 50%; top: 50%; margin-left: -37px; margin-top: -14px; z-index: 1; pointer-events: none;">
      <path d="M 2 16 C 18 8, 48 4, 72 10 C 73.5 11.5, 73 15, 71 18 L 68 23 C 46 17, 18 20, 2 28 C 0.5 27, 0 24, 0.5 21 Z" fill="#ffe600"/>
    </svg>
    <section style="position: relative; z-index: 2; font-size: 38px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -1px; line-height: 1; display: inline-block; padding: 0 6px;">
      ${indexPadded}
    </section>
  </section>
  <section style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; word-break: break-word; text-align: center;">
    ${title}
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-yellow-sun-wave',
    name: '月影暖黄双斜线标题',
    description: '斜向渐变圆形序号 + 居中标题 + 底部两条手绘黄色斜线',
    tag: '月影暖黄',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="text-align: center; margin: 2px 0;"><div style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(45deg, #ffffff 0%, #fffde7 25%, #fef9c3 60%, #fde047 100%); line-height: 30px; text-align: center; margin-bottom: 2px;"><span style="font-size: 17px; font-weight: 900; color: #18181b; line-height: 30px;">01</span></div><div style="font-size: 13px; font-weight: 700; color: #18181b;">简单通用标题</div><svg width="70" height="9" viewBox="0 0 96 12" fill="none" style="display: block; margin: 1px auto 0; overflow: visible;"><path d="M 6 10 C 18 9, 30 5.5, 42 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/><path d="M 48 10 C 62 9, 76 5.5, 90 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/></svg></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(45deg, #ffffff 0%, #fffde7 25%, #fef9c3 60%, #fde047 100%); line-height: 46px; text-align: center; margin: 0 auto; -webkit-box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2); box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2);">
      <span style="font-size: 28px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -0.5px; line-height: 46px; display: inline-block;">
        ${indexPadded}
      </span>
    </section>
  </section>
  <section style="display: block; text-align: center;">
    <span style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
      ${title}
    </span>
    <svg width="96" height="12" viewBox="0 0 96 12" fill="none" style="display: block; margin: 1px auto 0; overflow: visible;">
      <path d="M 6 10 C 18 9, 30 5.5, 42 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <path d="M 48 10 C 62 9, 76 5.5, 90 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
    </svg>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-blueprint-grid',
    name: '蓝图坐标网格标牌',
    description: '工科蓝图网格底板 + 对角裁切斜线 + 纯白加粗标题',
    tag: '蓝图网格',
    styleCategory: 'tech',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="text-align: center; margin: 4px 0;"><div style="display: inline-block; position: relative;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="position: absolute; left: -7px; top: -7px; z-index: 2; pointer-events: none;"><line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/></svg><div style="background-color: #004b97; background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px); background-size: 6px 6px; padding: 5px 18px; color: #ffffff; font-size: 13.5px; font-weight: 800; letter-spacing: 1px; display: inline-block;">简单通用标题</div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="position: absolute; right: -7px; bottom: -7px; z-index: 2; pointer-events: none;"><line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/></svg></div></div>`,
    render: (title) => {
      return `<section style="margin: 28px 0 20px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; max-width: 100%;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position: absolute; left: -10px; top: -10px; z-index: 2; pointer-events: none;">
      <line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <section style="background-color: #004b97; background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px); background-size: 8px 8px; padding: 8px 26px; display: inline-block; position: relative; z-index: 1; box-sizing: border-box; box-shadow: 0 4px 14px rgba(0, 75, 151, 0.25);">
      <span style="color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 1.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
        ${title}
      </span>
    </section>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="position: absolute; right: -10px; bottom: -10px; z-index: 2; pointer-events: none;">
      <line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  </section>
</section>`;
    }
  },
  {
    id: 'h-yellow-shadow-cube',
    name: '明黄立体方块双语标题',
    description: '明黄立体黑边方块序号 + 简约加粗主标题 + 英文副标题',
    tag: '明黄立体',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: true,
    previewHtml: `<div style="display:inline-flex;align-items:center;gap:10px;"><div style="background:#f4be47;border:1.5px solid #18181b;box-shadow:2.5px 2.5px 0px #2d2d2d;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#18181b;flex-shrink:0;">01</div><div style="display:flex;flex-direction:column;text-align:left;"><span style="font-size:14px;font-weight:800;color:#18181b;line-height:1.2;">简约标题</span><span style="font-size:9px;font-weight:800;color:#a1a1aa;letter-spacing:1px;line-height:1.2;margin-top:1px;">SIMPLE TITLE</span></div></div>`,
    render: (title, index, options = {}) => {
      const subTitle = options.prefix || options.subtitle || 'SIMPLE TITLE';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 26px 0 18px; text-align: left; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 36px; padding-right: 12px; line-height: 1;">
        <section style="background: #f4be47; border: 1.5px solid #18181b; -webkit-box-shadow: 3px 3px 0px #2d2d2d; box-shadow: 3px 3px 0px #2d2d2d; width: 30px; height: 30px; line-height: 27px; text-align: center; box-sizing: border-box;">
          <span style="font-size: 16px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; display: block; line-height: 27px;">${indexPadded}</span>
        </section>
      </section>
      <section style="display: table-cell; vertical-align: middle; text-align: left;">
        <span style="font-size: 18px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.25; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: block; word-break: break-word;">${title}</span>
        <span style="font-size: 10.5px; font-weight: 800; color: #a1a1aa; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.2; display: block; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; margin-top: 2px;">${subTitle}</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-dots-apricot-box',
    name: '暖杏波点手账便签卡',
    description: '黑线圆角白卡 + 暖杏三点星标 + 暖杏立体侧影',
    tag: '手账便签',
    styleCategory: 'fresh',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="display:inline-block;position:relative;background:#fff;border:1.5px solid #18181b;border-radius:6px;box-shadow:3px 3px 0px #fed7aa;padding:6px 20px;text-align:center;"><span style="position:absolute;top:3px;left:6px;display:flex;gap:2.5px;"><span style="width:3px;height:3px;border-radius:50%;background:#f59e0b;display:inline-block;"></span><span style="width:3px;height:3px;border-radius:50%;background:#f59e0b;display:inline-block;"></span><span style="width:3px;height:3px;border-radius:50%;background:#f59e0b;display:inline-block;"></span></span><span style="font-size:13px;font-weight:800;color:#18181b;">教师节快乐呀</span><span style="position:absolute;bottom:4px;right:6px;width:3.5px;height:3.5px;border-radius:50%;background:#f59e0b;display:inline-block;"></span></div>`,
    render: (title) => {
      return `<section style="margin: 26px 0 18px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; position: relative; background: #ffffff; border: 1.5px solid #18181b; border-radius: 8px; -webkit-box-shadow: 4px 4px 0px #fed7aa; box-shadow: 4px 4px 0px #fed7aa; padding: 10px 28px; max-width: 100%; box-sizing: border-box; text-align: center;">
    <span style="position: absolute; top: 6px; left: 8px; display: inline-flex; gap: 3px; line-height: 1;">
      <span style="width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
    </span>
    <span style="font-size: 16.5px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">
      ${title}
    </span>
    <span style="position: absolute; bottom: 6px; right: 8px; width: 4.5px; height: 4.5px; border-radius: 50%; background: #f59e0b; display: inline-block; line-height: 1;"></span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-part01-leaf',
    name: '黄绿夏风标牌',
    description: '倾斜 PART.01 标牌 + 弧形手绘箭头 + 绿叶波浪划线标题',
    tag: '夏风绿叶',
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
    name: '蜜桃浪漫标牌',
    description: '倾斜粉红标牌 + 甜美蜜桃与粉色下划线',
    tag: '蜜桃粉',
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
    name: '薰衣草紫标牌',
    description: '倾斜紫色标牌 + 优雅星月点缀 + 香草紫下划线',
    tag: '薰衣草紫',
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
    name: '气泡圆圈序号标题',
    description: '实心蓝色圆圈数字 01, 02 + 悬浮阴影标题',
    tag: '气泡序号',
    styleCategory: 'fresh',
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
    name: '经典立体明黄浮雕',
    description: '黄色立体沉底图层 + 左侧亮黄方块',
    tag: '精选推荐',
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
    name: '薄荷绿立体序号',
    description: '薄荷绿圆角方块 + 侧阴影 01, 02 序号块',
    tag: '薄荷绿立体',
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
    name: '莫兰迪双色拼接',
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
    name: '国风古韵红木印章',
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
    name: '极简翡翠绿包边',
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
    name: '赛博黑金科技感',
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
  },
  {
    id: 'h-oriental-seal',
    name: '国风朱砂·双印章雅宋标题',
    description: '古典朱砂印章 + 雅宋衬线字体 + 双红线收口 + ❖ 吉祥符',
    tag: '国风水墨',
    styleCategory: 'guofeng',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="display:inline-flex;align-items:center;gap:6px;border-bottom:2px solid #b91c1c;padding-bottom:2px;"><span style="background:#b91c1c;color:#fff;font-size:10px;padding:1px 5px;border-radius:2px;font-family:serif;">壹·章</span><span style="font-size:13px;font-weight:800;color:#1c1917;font-family:serif;">水墨流转·文气自华</span><span style="color:#b91c1c;font-size:11px;">❖</span></div>`,
    render: (title, index) => {
      const numMap = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
      const numLabel = numMap[index] || String(index);
      return `<section style="margin: 28px 0 18px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-bottom: 2px solid #b91c1c; padding-bottom: 6px;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle;">
        <section style="background: #b91c1c; color: #ffffff; font-family: 'Songti SC', 'SimSun', serif; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(185, 28, 28, 0.25); letter-spacing: 2px; display: inline-block;">
          ${numLabel}·章
        </section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 10px;">
        <span style="font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 19px; font-weight: 800; color: #1c1917; letter-spacing: 2px;">
          ${title}
        </span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 6px;">
        <span style="color: #b91c1c; font-size: 16px;">❖</span>
      </section>
    </section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-cyber-terminal',
    name: '极客赛博·终端发光命令标题',
    description: '深黑终端底色 + 霓虹亮青光标 + 命令行提示符 ❯_ [SEC_01]',
    tag: '赛博极客',
    styleCategory: 'tech',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="background:#0f172a;padding:4px 10px;border-radius:6px;border:1px solid rgba(56,189,248,0.4);display:inline-flex;align-items:center;gap:6px;"><span style="color:#38bdf8;font-family:monospace;font-size:10px;font-weight:700;">❯_ [SEC_01]</span><span style="color:#f8fafc;font-size:12px;font-weight:700;">高并发链路与架构基建</span></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 28px 0 18px; clear: both;" data-material="true">
  <section style="display: inline-flex; align-items: center; background: #0f172a; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
    <span style="color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; font-weight: 700; margin-right: 8px;">❯_ [SEC_${indexPadded}]</span>
    <span style="color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">${title}</span>
    <span style="display: inline-block; width: 8px; height: 14px; background: #38bdf8; margin-left: 8px; opacity: 0.85;"></span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-editorial-roman',
    name: '大刊社论·半透罗马序号大标题',
    description: '底置超大浅灰罗马序号 + 精致无衬线加粗主标 + 极简纯黑下划线',
    tag: '杂志社论',
    styleCategory: 'minimal',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="position:relative;padding:4px 0;"><div style="font-size:24px;font-weight:900;color:rgba(0,0,0,0.08);line-height:1;margin-bottom:-10px;font-family:serif;">01.</div><div style="border-bottom:2px solid #0a0a0a;display:inline-block;padding-bottom:2px;font-size:13px;font-weight:800;color:#0a0a0a;">范式转移与核心增长飞轮</div></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 32px 0 20px; clear: both; text-align: left;" data-material="true">
  <section style="line-height: 0.7; margin-bottom: -18px;">
    <span style="font-family: 'Times New Roman', Georgia, serif; font-size: 46px; font-weight: 900; color: #e5e7eb; letter-spacing: 1px; line-height: 0.7; display: inline-block;">
      ${indexPadded}.
    </span>
  </section>
  <section style="margin: 0; padding: 0; line-height: 1.4;">
    <span style="display: inline-block; border-bottom: 2.5px solid #0a0a0a; padding-bottom: 5px; line-height: 1.4;">
      <span style="font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 19px; font-weight: 800; color: #0a0a0a; letter-spacing: 0.2px; line-height: 1.4; display: inline-block;">
        ${title}
      </span>
    </span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-handdrawn-pin',
    name: '手账手绘·立体图钉便签标题',
    description: '倾斜手写黄色标签 + 3D 红色图钉 + 荧光马克笔底色',
    tag: '手账便签',
    styleCategory: 'fresh',
    hasAutoNumber: false,
    hasCustomPrefix: false,
    previewHtml: `<div style="background:#fef08a;padding:4px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:4px;border-left:3px solid #eab308;box-shadow:1px 2px 4px rgba(0,0,0,0.08);"><span>📌</span><span style="font-size:12px;font-weight:bold;color:#713f12;">今日灵感清单与实操笔记</span></div>`,
    render: (title) => {
      return `<section style="margin: 28px 0 18px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-block; background: #fef08a; padding: 7px 18px 7px 14px; border-radius: 4px; box-shadow: 2px 3px 6px rgba(0,0,0,0.08); border-left: 4px solid #eab308;">
    <span style="font-size: 16px; margin-right: 6px;">📌</span>
    <span style="font-family: 'PingFang SC', -apple-system, sans-serif; font-size: 16px; font-weight: 800; color: #713f12; letter-spacing: 0.5px;">
      ${title}
    </span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-pill-duotone',
    name: '现代双色·渐变胶囊药丸标题',
    description: '深蓝主序号胶囊 + 天蓝浅底扩展条 + 纯白反差对亮点',
    tag: '现代双色',
    styleCategory: 'business',
    hasAutoNumber: true,
    hasCustomPrefix: true,
    previewHtml: `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:9999px;padding:2px 8px 2px 2px;display:inline-flex;align-items:center;gap:6px;"><span style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:9px;font-weight:bold;padding:2px 6px;border-radius:9999px;">STEP 01</span><span style="font-size:12px;font-weight:bold;color:#1e3a8a;">系统环境初始化</span></div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'STEP';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 28px 0 18px; clear: both;" data-material="true">
  <section style="display: inline-flex; align-items: center; background: #eff6ff; border-radius: 9999px; padding: 3px 16px 3px 4px; border: 1px solid #bfdbfe;">
    <span style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);">
      ${prefix} ${indexPadded}
    </span>
    <span style="font-size: 15px; font-weight: 700; color: #1e3a8a; margin-left: 10px; letter-spacing: 0.2px;">
      ${title}
    </span>
  </section>
</section>`;
    }
  }
];



// ── 引用金句模版（严格对应素材中心「金句/引用」）──
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
    name: '经典大型对话双引号框',
    description: '包含优雅的放大双引号与微阴影圆角边框',
    tag: '双引号金句',
    styleCategory: 'business',
    previewHtml: `<blockquote style="margin: 0; padding: 12px 14px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; color: #334155; font-size: 12px; line-height: 1.6; position: relative;"><span style="font-size: 20px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -4px; margin-right: 2px;">“</span>能力增长并不是斜率不变的直线，而是呈现指数级上升的复利曲线。<span style="font-size: 20px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -4px; margin-left: 2px;">”</span></blockquote>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative; word-break: break-word;" data-material="true">
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-right: 4px;">“</span>${content}<span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-left: 4px;">”</span>
</blockquote>`
  },
  {
    id: 'q-135-speech-bubble',
    name: '极简对话气泡金句框',
    description: '带底部对话小尖角与蓝色圆点修饰的爆款气泡引用框',
    tag: '对话气泡',
    styleCategory: 'fresh',
    previewHtml: `<div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; color: #1e40af; font-size: 12px; line-height: 1.6;"><strong style="display: block; margin-bottom: 3px; font-size: 12.5px; color: #1d4ed8;">💬 深度洞察：</strong>把时间浪费在值得的事情上，把精力投注给懂你的人。</div>`,
    render: (content) => `<div style="margin: 22px 0;" data-material="true">
  <section style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; color: #1e40af; font-size: 14.5px; line-height: 1.8; position: relative; word-break: break-word;" data-material="true">
    <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #1d4ed8;">💬 深度洞察：</strong>${content}
  </section>
</div>`
  },
  {
    id: 'q-135-paper-fold',
    name: '便签折角贴纸引用框',
    description: '带有淡黄便签感与贴纸效果，亲切随和',
    tag: '便签风',
    styleCategory: 'fresh',
    previewHtml: `<blockquote style="margin: 0; padding: 10px 12px; background: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #eab308; border-radius: 6px; color: #854d0e; font-size: 12px; line-height: 1.6;">📖 <strong>读书札记：</strong>“生活原本沉闷，但跑起来就有风。”</blockquote>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #854d0e; font-size: 14px; line-height: 1.8; word-break: break-word;" data-material="true">
  📖 <strong>读书札记：</strong> “生活原本沉闷，但跑起来就有风。” ${content}
</blockquote>`
  },
  {
    id: 'q-gradient-bar',
    name: '渐变侧条优雅导读',
    description: '左侧采用高质感 Blue-Indigo 渐变粗边条',
    tag: '推荐',
    styleCategory: 'business',
    previewHtml: `<blockquote style="margin: 0; padding: 10px 12px; background: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; color: #475569; font-size: 12px; line-height: 1.6;"><strong>💡 导读摘要：</strong>真正的高手，都在用“杠杆思维”做选择。</blockquote>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75;" data-material="true">
  <strong>💡 导读摘要：</strong> ${content}
</blockquote>`
  },
  {
    id: 'q-dark-slate',
    name: '深灰极简黑金修饰框',
    description: '深色纸面感引用框，极简而有高级感',
    tag: '高级感',
    styleCategory: 'tech',
    previewHtml: `<blockquote style="margin: 0; padding: 10px 12px; background: #0f172a; border-radius: 6px; color: #f8fafc; font-size: 12px; line-height: 1.6; box-shadow: 0 2px 8px rgba(15,23,42,0.15);">📌 <strong>架构法则：</strong>不要为了设计而设计，在交付与可维护之间平衡。</blockquote>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15); word-break: break-word;" data-material="true">
  📌 <strong>架构法则：</strong> ${content}
</blockquote>`
  },
  {
    id: 'q-terminal-log',
    name: '终端命令输出引用框',
    description: 'macOS 红黄绿三色原生按钮 + 暗色磨砂背景 + 极客哲学金句',
    tag: '极客终端',
    styleCategory: 'tech',
    previewHtml: `<div style="background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #1e293b;"><div style="display: flex; align-items: center; padding: 4px 8px; background: #1e293b;"><div style="display: flex; gap: 4px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: #ef4444; display: inline-block;"></span><span style="width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span><span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span></div><span style="margin: 0 auto; color: #94a3b8; font-size: 9px; font-family: monospace;">bash — 80x24</span></div><div style="padding: 8px 10px; font-family: monospace; font-size: 11px; color: #e2e8f0;"><p style="color: #38bdf8; margin: 0 0 2px 0;">$ cat core_philosophy.txt</p><p style="margin: 0; color: #f1f5f9; font-style: italic;">“软件工程的本质是控制复杂度...”</p></div></div>`,
    render: (content) => `<section style="margin: 24px 0; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" data-material="true">
  <div style="display: flex; align-items: center; padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155;">
    <div style="display: flex; gap: 6px;">
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
    </div>
    <span style="margin: 0 auto; color: #94a3b8; font-size: 11px; font-family: monospace;">bash — 80x24</span>
  </div>
  <div style="padding: 16px 20px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13.5px; line-height: 1.7; color: #e2e8f0;">
    <p style="color: #38bdf8; margin: 0 0 6px 0;">$ cat core_philosophy.txt</p>
    <p style="margin: 0; color: #f1f5f9; font-style: italic;">“${content}”</p>
  </div>
</section>`
  },
  {
    id: 'q-ancient-scroll',
    name: '古风典籍·宣纸朱砂双线古卷引用',
    description: '宣纸米黄底色 + 典雅回纹边框 + 朱砂红篆刻印章 + 典雅竖排风韵',
    tag: '古风宣纸',
    styleCategory: 'guofeng',
    previewHtml: `<div style="background: #faf7f0; border: 1.5px solid #e7dfd1; border-radius: 4px; padding: 8px 10px; text-align: center;"><div style="border: 1px dashed #c4b5a0; padding: 6px 8px;"><p style="font-family: serif; font-size: 11px; color: #451a03; margin: 0;">“博学之，审问之，慎思之，明辨之，笃行之。”</p><div style="font-size: 9px; color: #b91c1c; font-weight: 700; margin-top: 4px;">【 儒林·礼记中庸 】</div></div></div>`,
    render: (content) => `<section style="margin: 24px 0; padding: 22px 24px; background: #faf7f0; border: 2px solid #e7dfd1; border-radius: 8px; position: relative; box-shadow: inset 0 0 12px rgba(217, 201, 179, 0.25);" data-material="true">
  <div style="border: 1px dashed #c4b5a0; padding: 16px 20px; text-align: center;">
    <p style="font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 15.5px; line-height: 1.85; color: #451a03; margin: 0; letter-spacing: 1.5px; font-weight: 500;">
      “${content}”
    </p>
    <div style="margin-top: 12px; font-size: 12px; color: #b91c1c; font-weight: 700; letter-spacing: 2px;">
      【 经典·典籍引语 】
    </div>
  </div>
</section>`
  },
  {
    id: 'q-magazine-bigquote',
    name: '大刊双引号·巨型流光大字符金句',
    description: '底置超大淡青渐变双引号 + 高级极简无界留白 + 优雅黑体排印',
    tag: '大刊金句',
    styleCategory: 'minimal',
    previewHtml: `<blockquote style="margin: 0; position: relative; padding: 12px 14px; background: #f8fafc; border-left: 3px solid #0f172a; border-radius: 0 8px 8px 0; overflow: hidden;"><span style="position: absolute; top: -8px; left: 6px; font-family: Georgia, serif; font-size: 40px; font-weight: 900; color: rgba(15, 23, 42, 0.1); line-height: 1; user-select: none;">“</span><p style="margin: 0; position: relative; z-index: 1; font-size: 11.5px; font-weight: 600; line-height: 1.6; color: #1e293b;">真正优秀的设计不是把所有东西堆砌完整，而是直到没有多余的东西可以拿走。</p></blockquote>`,
    render: (content) => `<section style="margin: 28px 0; padding: 24px 28px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 0 12px 12px 0; position: relative;" data-material="true">
  <section style="font-family: Georgia, serif; font-size: 64px; color: #cbd5e1; position: absolute; top: -12px; left: 14px; line-height: 1; opacity: 0.6;">“</section>
  <p style="position: relative; z-index: 1; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', serif; font-size: 15.5px; font-weight: 600; line-height: 1.75; color: #1e293b; font-style: italic;">
    ${content}
  </p>
</section>`
  },
  {
    id: 'q-highlighter-marker',
    name: '手绘荧光·胶带纸荧光笔涂抹金句',
    description: '顶部磨砂半透撕裂胶带 + 荧光马克笔高亮涂抹划线',
    tag: '荧光涂抹',
    styleCategory: 'fresh',
    previewHtml: `<div style="position: relative; background: #fffdf5; border: 1px solid #fef08a; border-radius: 4px; padding: 10px 12px;"><div style="width: 44px; height: 12px; background: rgba(253, 224, 71, 0.6); position: absolute; top: -6px; left: 50%; transform: translateX(-50%) rotate(-1deg); border-radius: 2px;"></div><p style="margin: 0; font-size: 11.5px; line-height: 1.6; color: #713f12; font-weight: 600;"><span style="background: linear-gradient(180deg, transparent 60%, #fef08a 60%); padding: 0 3px;">保持对未知的好奇，把每一次挑战当成认知的升级。</span></p></div>`,
    render: (content) => `<section style="margin: 26px 0; padding: 20px 22px; background: #fffdf5; border: 1px solid #fef08a; border-radius: 6px; position: relative; box-shadow: 2px 4px 12px rgba(234, 179, 8, 0.08);" data-material="true">
  <div style="width: 60px; height: 16px; background: rgba(253, 224, 71, 0.6); position: absolute; top: -8px; left: 50%; transform: translateX(-50%) rotate(-1deg); border-radius: 2px;"></div>
  <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #713f12; font-weight: 600;">
    <span style="background: linear-gradient(180deg, transparent 60%, #fef08a 60%); padding: 0 4px;">
      ${content}
    </span>
  </p>
</section>`
  }
];

// ── 提示卡片模版（对应素材中心「提示/卡片」）──
export const calloutTemplates = [
  {
    id: 'c-135-orange-fire',
    name: '爆款橙色热度关注框',
    description: '橙色高光底色 + 🔥 热度图标',
    tag: '暖橙提示卡',
    styleCategory: 'business',
    previewHtml: `<div style="padding: 8px 12px; background: #fff7ed; border-left: 4px solid #f97316; font-size: 12px; color: #c2410c;">🔥 核心干货要点...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 16px 20px; background: #fff7ed; border: 1px solid #ffedd5; border-left: 5px solid #f97316; border-radius: 8px; color: #c2410c; font-size: 14px; line-height: 1.75;" data-material="true">
  <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #ea580c;">🔥 核心干货：</strong>${content}
</section>`
  },
  {
    id: 'c-135-keypoints-cards',
    name: '三要点小色块组合卡片',
    description: '包含 3 个带柔和彩色底块的小干货总结，清晰有条理',
    tag: '要点组合卡',
    styleCategory: 'business',
    previewHtml: `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 11px;"><div style="font-weight: 700; margin-bottom: 4px;">🎯 核心避坑指南</div><div style="background: #fef2f2; padding: 4px 6px; border-radius: 3px; color: #991b1b; margin-bottom: 3px;">📍 一忌：盲目微服务</div><div style="background: #ecfdf5; padding: 4px 6px; border-radius: 3px; color: #065f46;">📍 二宜：演进式拆分</div></div>`,
    render: (content) => `<section style="margin: 22px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true">
  <div style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 12px; word-break: break-word;">🎯 本章核心指南</div>
  <div style="background: #eff6ff; border-radius: 6px; padding: 10px 14px; color: #1e40af; font-size: 14px;">${content}</div>
</section>`
  },
  {
    id: 'c-notion-info',
    name: '极简彩卡·天蓝信息提示盒',
    description: '极简柔和天蓝浅底 + ℹ️ 极简小图标',
    tag: '极简彩卡',
    styleCategory: 'business',
    previewHtml: `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:8px 10px;font-size:11.5px;color:#1e40af;"><div style="font-weight:700;margin-bottom:2px;">ℹ️ 核心信息提示</div><div style="color:#1e3a8a;font-size:11px;">系统默认在每周一自动进行冷数据归档...</div></div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">ℹ️</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 2px;">核心信息提示 (Note)</div>
    <div style="font-size: 13.5px; color: #1e3a8a; line-height: 1.6;">${content}</div>
  </div>
</section>`
  },
  {
    id: 'c-notion-tip',
    name: '极简彩卡·薄荷绿技巧小贴士',
    description: '薄荷浅绿底色 + 💡 贴士图标',
    tag: '极简彩卡',
    styleCategory: 'fresh',
    previewHtml: `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 10px;font-size:11.5px;color:#166534;"><div style="font-weight:700;margin-bottom:2px;">💡 效率提升技巧</div><div style="color:#14532d;font-size:11px;">使用快捷键 Cmd + K 快速调出控制台...</div></div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">💡</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 2px;">效率提升技巧 (Pro Tip)</div>
    <div style="font-size: 13.5px; color: #14532d; line-height: 1.6;">${content}</div>
  </div>
</section>`
  },
  {
    id: 'c-notion-warning',
    name: '极简彩卡·暖橙警示避坑指南',
    description: '暖橙浅底 + ⚠️ 避坑小图标',
    tag: '极简彩卡',
    styleCategory: 'business',
    previewHtml: `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:8px 10px;font-size:11.5px;color:#9a3412;"><div style="font-weight:700;margin-bottom:2px;">⚠️ 重点注意要点</div><div style="color:#7c2d12;font-size:11px;">修改核心生产配置前务必在测试环境演练...</div></div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">⚠️</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #9a3412; margin-bottom: 2px;">重点注意要点 (Warning)</div>
    <div style="font-size: 13.5px; color: #7c2d12; line-height: 1.6;">${content}</div>
  </div>
</section>`
  },
  {
    id: 'c-note-blue',
    name: '蓝色提示卡片',
    description: '柔和浅蓝背景，适合要点提示',
    tag: '提示',
    styleCategory: 'business',
    previewHtml: `<div style="padding: 8px 12px; background: #eff6ff; border-left: 4px solid #3b82f6; font-size: 12px; color: #1e40af;">温馨提示...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">温馨提示：</strong>${content}
</section>`
  },
  {
    id: 'c-warning-red',
    name: '红色警告卡片',
    description: '淡红背景，用于醒目标注注意事项',
    tag: '警告',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding: 8px 12px; background: #fef2f2; border-left: 4px solid #ef4444; font-size: 12px; color: #991b1b;">注意事项...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">注意事项：</strong>${content}
</section>`
  },
  {
    id: 'c-success-green',
    name: '绿色推荐方案卡片',
    description: '淡绿背景，用于最佳实践推荐',
    tag: '推荐',
    styleCategory: 'fresh',
    previewHtml: `<div style="padding: 8px 12px; background: #ecfdf5; border-left: 4px solid #10b981; font-size: 12px; color: #065f46;">推荐方案...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7;" data-material="true">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">推荐方案：</strong>${content}
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
    name: '剪刀裁剪虚线分割线',
    description: '趣味剪刀图标 + 虚线切割',
    tag: '剪刀裁剪线',
    styleCategory: 'minimal',
    previewHtml: `<div style="color: #94a3b8; font-size: 12px;">✂️ ------------------</div>`,
    render: () => `<section data-material="true" style="margin: 26px auto; color: #94a3b8; font-size: 14px; line-height: 1; display: table; width: 100%; box-sizing: border-box;">
  <section style="display: table-row;">
    <section style="display: table-cell; vertical-align: middle; width: 24px; padding-right: 8px;">✂️</section>
    <section style="display: table-cell; vertical-align: middle; border-top: 2px dashed #cbd5e1; height: 0; width: 100%;"></section>
  </section>
</section>`
  },
  {
    id: 'd-scissors-coupon',
    name: '虚线剪刀·优惠券裁切打孔分割线',
    description: '左右打孔圆弧 + 粗虚线 + 旋转剪刀图标',
    tag: '虚线剪刀',
    styleCategory: 'minimal',
    previewHtml: `<div style="display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 12px;">✂️ ------------------</div>`,
    render: () => `<section style="margin: 26px auto; width: 100%; display: table; box-sizing: border-box; clear: both;" data-material="true">
  <section style="display: table-row;">
    <section style="display: table-cell; vertical-align: middle; width: 24px; padding-right: 8px; font-size: 16px; line-height: 1;">✂️</section>
    <section style="display: table-cell; vertical-align: middle; border-top: 1.5px dashed #cbd5e1; height: 0; width: 100%;"></section>
  </section>
</section>`
  },
  {
    id: 'd-135-double-wave',
    name: '暖黄浪漫浪花分割线',
    description: '优雅手绘双重浪花线条',
    tag: '浪漫浪花线',
    styleCategory: 'fresh',
    previewHtml: `<div style="text-align: center; color: #f59e0b; font-size: 12px;">〰〰〰〰〰</div>`,
    render: () => `<section data-material="true" style="text-align: center; margin: 26px auto; width: 100%; display: block; clear: both;">
  <svg width="200" height="12" viewBox="0 0 200 12" fill="none" style="display: inline-block; margin: 0 auto; max-width: 100%;">
    <path d="M0 6 Q 15 0, 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 200 6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  </svg>
</section>`
  },
  {
    id: 'd-sparkle-diamond',
    name: '星芒闪耀·双侧流光居中微光分割线',
    description: '两端淡出渐变线条 + 居中璀璨 ✦ 菱形星芒',
    tag: '星芒分割',
    styleCategory: 'minimal',
    previewHtml: `<div style="text-align: center; color: #64748b; font-size: 12px;">─── ✦ ───</div>`,
    render: () => `<section style="margin: 32px 0; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #cbd5e1);"></div>
  <span style="color: #64748b; font-size: 14px;">✦</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #cbd5e1, transparent);"></div>
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
    tag: '数字徽章',
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
    id: 'l-timeline-milestone',
    name: '彩色时间轴·大事记里程碑流程',
    description: '纵向连接轴线 + 渐变圆形节点 + 阴影卡片列表',
    tag: '时间轴',
    styleCategory: 'business',
    hasAutoNumber: true,
    previewHtml: `<div style="border-left:2px solid #3b82f6;padding-left:8px;font-size:12px;color:#1e40af;">● 节点一：方案评审<br/>● 节点二：开发上线</div>`,
    render: (itemHtml, index) => `<li style="list-style: none; margin-bottom: 12px; padding-left: 20px; border-left: 2px solid #3b82f6; position: relative;" data-material="true">
  <span style="position: absolute; left: -7px; top: 3px; width: 12px; height: 12px; border-radius: 50%; background: #2563eb; border: 2px solid #ffffff; box-shadow: 0 0 0 2px #3b82f6;"></span>
  <div style="font-size: 14.5px; color: #1e293b; line-height: 1.7;">${itemHtml}</div>
</li>`
  },
  {
    id: 'l-task-checklist',
    name: '极简方格·任务待办清单',
    description: '柔和浅绿勾选小方盒 + 划掉完成效果',
    tag: '任务清单',
    styleCategory: 'fresh',
    previewHtml: `<div style="font-size:12px;color:#15803d;">☑️ 核心指标已对齐<br/>☑️ 生产环境已部署</div>`,
    render: (itemHtml) => `<li style="list-style: none; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;" data-material="true">
  <span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 3px; background: #16a34a; color: #ffffff; font-size: 11px; font-weight: bold; margin-top: 3px; flex-shrink: 0;">✓</span>
  <span style="font-size: 14.5px; color: #334155; line-height: 1.7;">${itemHtml}</span>
</li>`
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
    tag: '待办清单',
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

// ── 表格模版 ──
export const tableTemplates = [
  {
    id: 'none',
    name: '默认主题表格',
    description: '使用当前主题预设的表格样式渲染',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px; font-size: 11px; text-align: center;">默认表格样式</div>`,
    render: () => null
  },
  {
    id: 'tbl-slate-movie-rank',
    name: '雾霾蓝·首列高光电影排行表格',
    description: '首列雾霾蓝高亮序号 + 柔和灰蓝表头 + 纯白格线规整排布',
    tag: '雾霾蓝排行',
    styleCategory: 'business',
    previewHtml: `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;"><thead><tr style="background:#edf2f4;color:#475569;"><th style="background:#8ea6b4;color:#fff;padding:3px 4px;border:1px solid #fff;">#</th><th style="padding:3px 4px;border:1px solid #fff;">Top 8 Movies</th><th style="padding:3px 4px;border:1px solid #fff;">Year</th></tr></thead><tbody><tr><td style="background:#8ea6b4;color:#fff;border:1px solid #fff;">1</td><td style="background:#f4f6f8;color:#475569;border:1px solid #fff;">The Shawshank Redemption</td><td style="background:#f4f6f8;color:#475569;border:1px solid #fff;">1994</td></tr><tr><td style="background:#8ea6b4;color:#fff;border:1px solid #fff;">2</td><td style="background:#fff;color:#475569;border:1px solid #fff;">The Godfather</td><td style="background:#fff;color:#475569;border:1px solid #fff;">1998</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 14px; text-align: center; box-sizing: border-box; margin: 0;">
    <thead>
      <tr style="background-color: #f0f4f6; color: #475569;">
        <th style="background-color: #8da5b4; color: #ffffff; font-weight: 700; border: 1.5px solid #ffffff; padding: 11px 14px; text-align: center; width: 55px;">#</th>
        <th style="background-color: #f0f4f6; color: #475569; font-weight: 700; border: 1.5px solid #ffffff; padding: 11px 16px; text-align: center;">Top 8 Movies</th>
        <th style="background-color: #f0f4f6; color: #475569; font-weight: 700; border: 1.5px solid #ffffff; padding: 11px 16px; text-align: center; width: 85px;">Year</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f8fafc;">
        <td style="background-color: #8da5b4; color: #ffffff; font-weight: 800; border: 1.5px solid #ffffff; padding: 10px 14px; text-align: center;">1</td>
        <td style="background-color: #f8fafc; color: #334155; font-weight: 600; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">The Shawshank Redemption</td>
        <td style="background-color: #f8fafc; color: #475569; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">1994</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="background-color: #8da5b4; color: #ffffff; font-weight: 800; border: 1.5px solid #ffffff; padding: 10px 14px; text-align: center;">2</td>
        <td style="background-color: #ffffff; color: #334155; font-weight: 600; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">The Godfather</td>
        <td style="background-color: #ffffff; color: #475569; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">1998</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="background-color: #8da5b4; color: #ffffff; font-weight: 800; border: 1.5px solid #ffffff; padding: 10px 14px; text-align: center;">3</td>
        <td style="background-color: #f8fafc; color: #334155; font-weight: 600; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">The Godfather: Part II</td>
        <td style="background-color: #f8fafc; color: #475569; border: 1.5px solid #ffffff; padding: 10px 16px; text-align: center;">1974</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-apricot-star-card',
    name: '暖杏星标·圆角备考复习攻略卡',
    description: '暖杏星标圆角卡片 + 粗黑外边框 + 双列圆点空心清单',
    tag: '暖杏卡片',
    styleCategory: 'fresh',
    previewHtml: `<div style="border:1.5px solid #292524;border-radius:8px;overflow:hidden;font-size:10px;"><div style="background:#faece1;padding:3px;text-align:center;font-weight:bold;color:#1c1917;border-bottom:1px solid #292524;">⭐ 考研全程攻略 ⭐</div><div style="padding:4px;display:flex;justify-content:space-between;color:#1c1917;"><span>○ 时间规划</span><span>○ 基础知识</span></div></div>`,
    render: () => `<section style="margin: 24px 0; border: 1.5px solid #292524; border-radius: 14px; overflow: hidden; background: #ffffff; clear: both;" data-material="true">
  <div style="background-color: #faece1; padding: 11px 16px; border-bottom: 1.5px solid #292524; text-align: center; font-size: 15.5px; font-weight: 800; color: #1c1917; letter-spacing: 0.5px;">
    ⭐ 超详细的考研全程攻略 ⭐
  </div>
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14.5px; text-align: left; margin: 0; box-sizing: border-box;">
    <tbody>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600; width: 50%;">○ 整体时间规划</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600; width: 50%;">○ 整体时间规划</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 国内考研环境</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 国内考研环境</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考研基础知识</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考研基础知识</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 各学科具体备考方法</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 各学科具体备考方法</td>
      </tr>
      <tr>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考前注意事项</td>
        <td style="padding: 10px 16px; border: none; color: #1c1917; font-weight: 600;">○ 考前注意事项</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-retro-window-size',
    name: '复古窗口·黑金对照尺码参照表',
    description: '顶部复古窗口控制按钮 + 纯黑高对比表头 + 纯黑网格尺码表',
    tag: '黑金尺码',
    styleCategory: 'tech',
    previewHtml: `<div style="border:1.5px solid #1a1a1a;font-size:10px;text-align:center;"><div style="display:flex;justify-content:space-between;padding:2px 4px;border-bottom:1px solid #1a1a1a;font-weight:bold;"><span></span><span>尺码对照表</span><span>_ □ ✕</span></div><table style="width:100%;border-collapse:collapse;"><tr style="background:#181818;color:#fff;"><th style="padding:2px;border:1px solid #1a1a1a;">尺寸</th><th style="padding:2px;border:1px solid #1a1a1a;">胸围</th><th style="padding:2px;border:1px solid #1a1a1a;">衣长</th></tr><tr style="background:#fff;"><td style="padding:2px;border:1px solid #1a1a1a;font-weight:bold;">S</td><td style="padding:2px;border:1px solid #1a1a1a;">120</td><td style="padding:2px;border:1px solid #1a1a1a;">52</td></tr></table></div>`,
    render: () => `<section style="margin: 24px 0; border: 2px solid #1a1a1a; background: #ffffff; overflow: hidden; clear: both;" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: #ffffff; border-bottom: 2px solid #1a1a1a; font-size: 14.5px; font-weight: 800; color: #1a1a1a;">
    <span style="visibility: hidden; font-size: 11px;">_ □ ✕</span>
    <span style="letter-spacing: 1px;">品牌尺码参照表</span>
    <span style="font-family: monospace; font-size: 13px; font-weight: bold; letter-spacing: 2px;">_ □ ✕</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #181818; color: #ffffff;">
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">尺寸</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">前长</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">后长</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">胸围</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">腰围</th>
        <th style="border: 1.5px solid #1a1a1a; padding: 10px 8px; font-weight: 800; color: #ffffff; text-align: center;">袖长</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">S</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">52</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">56</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">120</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">62</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">40</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">M</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">53</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">124</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">68</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">43</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">L</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">54</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">58</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">127</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">104</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">XL</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">54</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">58</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">128</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">104</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">XXL</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">54</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">58</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">128</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">104</td>
        <td style="border: 1.5px solid #1a1a1a; padding: 9px 8px; font-weight: 700; color: #1a1a1a;">51</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-morandi-blush-size',
    name: '莫兰迪藕粉·虚线分割优雅尺码表',
    description: '藕粉柔和圆角表头 + 棕褐优雅文字 + 柔美横向虚线分割',
    tag: '莫兰迪藕粉',
    styleCategory: 'minimal',
    previewHtml: `<div style="border:1.5px solid #5a4848;border-radius:6px;overflow:hidden;font-size:10px;"><table style="width:100%;border-collapse:collapse;text-align:center;"><tr style="background:#ebe0e0;color:#4a3838;"><th style="padding:2px;border-bottom:1px solid #5a4848;">尺寸</th><th style="padding:2px;border-bottom:1px solid #5a4848;">腰围</th><th style="padding:2px;border-bottom:1px solid #5a4848;">裤长</th></tr><tr><td style="padding:2px;border-bottom:1px dashed #d9c5c5;color:#4a3838;font-weight:bold;">S</td><td style="padding:2px;border-bottom:1px dashed #d9c5c5;color:#4a3838;">78</td><td style="padding:2px;border-bottom:1px dashed #d9c5c5;color:#4a3838;">88</td></tr></table></div>`,
    render: () => `<section style="margin: 24px 0; border: 1.5px solid #5a4848; border-radius: 12px; overflow: hidden; background: #ffffff; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: none; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #ebe0e0; color: #4a3838;">
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">尺寸</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">腰围</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">臀围</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">裤长</th>
        <th style="border: none; border-bottom: 1.5px solid #5a4848; padding: 11px 12px; font-weight: 700; color: #4a3838; text-align: center; font-size: 15px;">脚围</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">S(165/74A)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">78</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">95</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">88</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">30</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">M(170/76A)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">81</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">98</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">90</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">31</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">L(175/80)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">84</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">101</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">92</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">32</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; font-weight: 600; color: #4a3838;">XL(175/84A)</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">88</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">101</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">94</td>
        <td style="border: none; border-bottom: 1px dashed #d9c5c5; padding: 10px 12px; color: #4a3838;">33</td>
      </tr>
      <tr style="background-color: #ffffff;">
        <td style="border: none; padding: 10px 12px; font-weight: 600; color: #4a3838;">XXL(180/92A)</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">92</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">107</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">96</td>
        <td style="border: none; padding: 10px 12px; color: #4a3838;">34</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-milktea-apricot-schedule',
    name: '雅致奶茶杏·粗黑框双列考试日程表',
    description: '暖奶奶茶杏色表头 + 浓郁粗黑外框与实线单元格 + 双列排期表',
    tag: '奶茶日程',
    styleCategory: 'fresh',
    previewHtml: `<table style="width:100%;border-collapse:collapse;border:1.5px solid #231f20;font-size:10px;text-align:center;"><thead><tr style="background:#faeee6;color:#231f20;"><th style="border:1px solid #231f20;padding:2px 4px;font-weight:bold;">考试名称</th><th style="border:1px solid #231f20;padding:2px 4px;font-weight:bold;">考试时间</th></tr></thead><tbody><tr style="background:#fff;"><td style="border:1px solid #231f20;padding:2px 4px;font-weight:bold;">GRE</td><td style="border:1px solid #231f20;padding:2px 4px;">1月10日</td></tr><tr style="background:#fff;"><td style="border:1px solid #231f20;padding:2px 4px;font-weight:bold;">雅思</td><td style="border:1px solid #231f20;padding:2px 4px;">1月4, 11日</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: 2px solid #231f20; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 14.5px; text-align: center; box-sizing: border-box; margin: 0;">
    <thead>
      <tr style="background-color: #faeee6; color: #231f20;">
        <th style="border: 2px solid #231f20; padding: 12px 16px; font-weight: 800; letter-spacing: 0.5px; width: 45%;">考试名称</th>
        <th style="border: 2px solid #231f20; padding: 12px 16px; font-weight: 800; letter-spacing: 0.5px; width: 55%;">考试时间</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">托福（TOEFL）</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">1月4，5，11，12日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">专业英语八级</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">3月21日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">计算机等级</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">3月28-30日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #231f20;">
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px;">中小学教师资格证考试</td>
        <td style="border: 2px solid #231f20; padding: 11px 16px; font-weight: 800;">10月31日</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-amber-schedule',
    name: '暖杏亮黄日程对照表',
    description: '亮黄加粗表头 + 暖杏白相间交替行 + 纯黑网格边框',
    tag: '亮黄日程',
    styleCategory: 'fresh',
    previewHtml: `<table style="width:100%;border-collapse:collapse;border:1px solid #18181b;font-size:10px;text-align:center;"><thead><tr style="background:#f59e0b;color:#18181b;"><th style="border:1px solid #18181b;padding:2px 4px;font-weight:bold;">考试名称</th><th style="border:1px solid #18181b;padding:2px 4px;font-weight:bold;">考试时间</th></tr></thead><tbody><tr style="background:#fff;"><td style="border:1px solid #18181b;padding:2px 4px;font-weight:bold;">GRE</td><td style="border:1px solid #18181b;padding:2px 4px;">1月10日</td></tr><tr style="background:#f7f4ed;"><td style="border:1px solid #18181b;padding:2px 4px;font-weight:bold;">雅思</td><td style="border:1px solid #18181b;padding:2px 4px;">1月4, 11日</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #18181b; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 14.5px; text-align: center; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #f59e0b; color: #18181b;">
        <th style="border: 1px solid #18181b; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px; width: 45%;">考试名称</th>
        <th style="border: 1px solid #18181b; padding: 11px 16px; font-weight: 800; letter-spacing: 0.5px; width: 55%;">考试时间</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #f7f4ed; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #f7f4ed; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
      <tr style="background-color: #ffffff; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">GRE</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月10日</td>
      </tr>
      <tr style="background-color: #f7f4ed; color: #18181b;">
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800; letter-spacing: 0.5px;">雅思（IELTS）</td>
        <td style="border: 1px solid #18181b; padding: 10px 16px; font-weight: 800;">1月4，11，16，18日</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-modern-striped',
    name: '现代无界·斑马交替行数据明细表',
    description: '深曜石表头 + 浅灰交替底色 + 优雅圆角外框',
    tag: '斑马表格',
    styleCategory: 'minimal',
    previewHtml: `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:left;"><thead><tr style="background:#0f172a;color:#fff;"><th style="padding:3px;">功能维度</th><th style="padding:3px;">传统</th><th style="padding:3px;color:#38bdf8;">EasyMD</th></tr></thead><tbody><tr style="background:#fff;"><td style="padding:2px;">同步</td><td>手动</td><td style="color:#16a34a;">✓ 极速</td></tr><tr style="background:#f8fafc;"><td style="padding:2px;">高亮</td><td>错乱</td><td style="color:#16a34a;">✓ 原生</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; font-family: sans-serif;">
    <thead>
      <tr style="background: #0f172a; color: #ffffff;">
        <th style="padding: 12px 16px; font-weight: 700;">功能维度</th>
        <th style="padding: 12px 16px; font-weight: 700;">传统排版器</th>
        <th style="padding: 12px 16px; font-weight: 700; color: #38bdf8;">EasyMD 智能引擎</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 16px; font-weight: 600; color: #334155;">多平台同步</td>
        <td style="padding: 10px 16px; color: #64748b;">手动逐个复制粘贴</td>
        <td style="padding: 10px 16px; color: #16a34a; font-weight: 700;">✓ 1秒一键全网分发</td>
      </tr>
      <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 16px; font-weight: 600; color: #334155;">代码高亮</td>
        <td style="padding: 10px 16px; color: #64748b;">格式错乱/丢失行号</td>
        <td style="padding: 10px 16px; color: #16a34a; font-weight: 700;">✓ 完美微信原生兼容</td>
      </tr>
      <tr style="background: #ffffff;">
        <td style="padding: 10px 16px; font-weight: 600; color: #334155;">素材生态</td>
        <td style="padding: 10px 16px; color: #64748b;">千篇一律老旧模版</td>
        <td style="padding: 10px 16px; color: #16a34a; font-weight: 700;">✓ 50+ 顶级设计组件</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-tier-comparison',
    name: '版本矩阵·免费与专业版对比',
    description: '结构化方案功能点对勾比对卡片',
    tag: '方案对比',
    styleCategory: 'business',
    previewHtml: `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;"><thead><tr style="background:#f8fafc;"><th style="padding:3px;">权益</th><th style="padding:3px;">免费</th><th style="padding:3px;background:#eff6ff;color:#2563eb;">PRO 👑</th></tr></thead><tbody><tr><td style="padding:2px;">导出</td><td style="color:#16a34a;">✓</td><td style="background:#eff6ff;color:#16a34a;">✓</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);" data-material="true">
  <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13.5px;">
    <thead>
      <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
        <th style="padding: 14px; text-align: left; color: #0f172a; font-weight: 700;">权益特性</th>
        <th style="padding: 14px; color: #64748b; font-weight: 600;">免费开源版</th>
        <th style="padding: 14px; background: #eff6ff; color: #2563eb; font-weight: 800;">PRO 专业版 👑</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 14px; text-align: left; color: #334155;">实时双栏排版与导出</td>
        <td style="padding: 10px 14px; color: #16a34a;">✓ 无限次</td>
        <td style="padding: 10px 14px; background: #eff6ff; color: #16a34a; font-weight: 700;">✓ 无限次</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 14px; text-align: left; color: #334155;">AI 智能润色与结构重构</td>
        <td style="padding: 10px 14px; color: #94a3b8;">每日 5 次</td>
        <td style="padding: 10px 14px; background: #eff6ff; color: #2563eb; font-weight: 700;">极速无限调用</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; text-align: left; color: #334155;">多渠道一键分发平台数</td>
        <td style="padding: 10px 14px; color: #64748b;">3 个主流渠道</td>
        <td style="padding: 10px 14px; background: #eff6ff; color: #2563eb; font-weight: 700;">全网 10+ 矩阵</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-business-blue-compare',
    name: '深蓝智见·多维度功能方案比对表',
    description: '经典深蓝商务表头 + 推荐列高亮背景 + 优雅清爽边框',
    tag: '商务深蓝',
    styleCategory: 'business',
    previewHtml: `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;"><thead><tr style="background:#1e3a8a;color:#fff;"><th style="padding:2px 4px;text-align:left;">服务</th><th style="padding:2px 4px;">基础</th><th style="padding:2px 4px;background:#2563eb;">企业版👑</th></tr></thead><tbody><tr><td style="padding:2px 4px;text-align:left;">同步</td><td>单端</td><td style="background:#eff6ff;color:#2563eb;font-weight:bold;">✓ 实时</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; border: 1.5px solid #bfdbfe; border-radius: 12px; box-shadow: 0 4px 16px rgba(37,99,235,0.06); clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13.5px; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #1e3a8a; color: #ffffff;">
        <th style="padding: 13px 16px; text-align: left; font-weight: 700; color: #ffffff;">服务维度</th>
        <th style="padding: 13px 16px; font-weight: 700; color: #93c5fd;">基础版</th>
        <th style="padding: 13px 16px; font-weight: 800; color: #ffffff; background: #2563eb;">旗舰企业版 👑</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffffff; border-bottom: 1px solid #eff6ff;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">云端多端同步</td>
        <td style="padding: 11px 16px; color: #64748b;">单设备</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 全终端实时互联</td>
      </tr>
      <tr style="background-color: #f8fafc; border-bottom: 1px solid #eff6ff;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">AI 智能润色排版</td>
        <td style="padding: 11px 16px; color: #94a3b8;">每天 10 次</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 极速无限制生成</td>
      </tr>
      <tr style="background-color: #ffffff; border-bottom: 1px solid #eff6ff;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">全网平台一键分发</td>
        <td style="padding: 11px 16px; color: #94a3b8;">✕ 不支持</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 8+ 媒体矩阵分发</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 11px 16px; text-align: left; font-weight: 600; color: #1e293b;">专属客户经理支持</td>
        <td style="padding: 11px 16px; color: #94a3b8;">✕ 社区答疑</td>
        <td style="padding: 11px 16px; background: #eff6ff; color: #2563eb; font-weight: 700;">✓ 7×24h 绿色通道</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-terminal-dark-metrics',
    name: '极客终端·代码监控指标表',
    description: 'Mac 控制台红黄绿控制栏 + 纯黑暗底 + 荧光绿数据监控',
    tag: '代码终端',
    styleCategory: 'tech',
    previewHtml: `<div style="background:#0f172a;border:1px solid #334155;border-radius:6px;overflow:hidden;font-size:10px;"><div style="background:#1e293b;padding:2px 4px;display:flex;gap:3px;"><span style="width:5px;height:5px;border-radius:50%;background:#ef4444;"></span><span style="width:5px;height:5px;border-radius:50%;background:#f59e0b;"></span><span style="width:5px;height:5px;border-radius:50%;background:#10b981;"></span></div><div style="padding:3px;color:#38bdf8;font-family:monospace;">NODE_01: 14.2% CPU</div></div>`,
    render: () => `<section style="margin: 24px 0; border: 1.5px solid #334155; border-radius: 10px; overflow: hidden; background: #0f172a; clear: both;" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; background: #1e293b; border-bottom: 1px solid #334155;">
    <div style="display: flex; align-items: center; gap: 6px;">
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
    </div>
    <span style="font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: 700;">cluster_metrics.log</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; text-align: left; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background: #0f172a; color: #38bdf8; border-bottom: 1.5px solid #334155;">
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">NODE_ID</th>
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">CPU_USAGE</th>
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">MEM_FREE</th>
        <th style="padding: 10px 14px; font-weight: 700; color: #38bdf8;">STATUS</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #1e293b; background: #0f172a;">
        <td style="padding: 9px 14px; color: #f8fafc;">k8s-node-01</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">14.2%</td>
        <td style="padding: 9px 14px; color: #f8fafc;">24.8 GB</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">HEALTHY</td>
      </tr>
      <tr style="border-bottom: 1px solid #1e293b; background: #131d33;">
        <td style="padding: 9px 14px; color: #f8fafc;">k8s-node-02</td>
        <td style="padding: 9px 14px; color: #f59e0b; font-weight: 700;">72.5%</td>
        <td style="padding: 9px 14px; color: #f8fafc;">8.4 GB</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">HEALTHY</td>
      </tr>
      <tr style="background: #0f172a;">
        <td style="padding: 9px 14px; color: #f8fafc;">k8s-node-03</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">28.1%</td>
        <td style="padding: 9px 14px; color: #f8fafc;">19.2 GB</td>
        <td style="padding: 9px 14px; color: #10b981; font-weight: 700;">HEALTHY</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-matcha-green-progress',
    name: '抹茶清风·清新周计划进度表',
    description: '自然抹茶绿表头 + 浅绿相间行 + 进度指标高亮',
    tag: '抹茶清风',
    styleCategory: 'fresh',
    previewHtml: `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;"><thead><tr style="background:#2d6a4f;color:#fff;"><th style="padding:2px 4px;">周阶段</th><th style="padding:2px 4px;">任务</th><th style="padding:2px 4px;">进度</th></tr></thead><tbody><tr style="background:#f4fbf7;"><td style="padding:2px 4px;font-weight:bold;">第1阶段</td><td style="text-align:left;">🌿 原型调研</td><td style="color:#15803d;font-weight:bold;">100%</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; overflow-x: auto; border: 1.5px solid #bbf7d0; border-radius: 12px; overflow: hidden; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #2d6a4f; color: #ffffff;">
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; width: 25%;">周阶段</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; width: 50%;">关键执行任务</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; width: 25%;">达成指标</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #f4fbf7; border-bottom: 1px solid #dcfce7;">
        <td style="padding: 10px 14px; font-weight: 700; color: #1e392a;">第一阶段</td>
        <td style="padding: 10px 14px; text-align: left; color: #2d4a3e; font-weight: 600;">🌿 完成核心业务原型与用户调研</td>
        <td style="padding: 10px 14px; color: #15803d; font-weight: 800;">100% 已交付</td>
      </tr>
      <tr style="background-color: #ffffff; border-bottom: 1px solid #dcfce7;">
        <td style="padding: 10px 14px; font-weight: 700; color: #1e392a;">第二阶段</td>
        <td style="padding: 10px 14px; text-align: left; color: #2d4a3e; font-weight: 600;">🌿 微信公众号排版引擎深度重构</td>
        <td style="padding: 10px 14px; color: #15803d; font-weight: 800;">进行中 85%</td>
      </tr>
      <tr style="background-color: #f4fbf7;">
        <td style="padding: 10px 14px; font-weight: 700; color: #1e392a;">第三阶段</td>
        <td style="padding: 10px 14px; text-align: left; color: #2d4a3e; font-weight: 600;">🌿 全网媒体矩阵自动化同步发布</td>
        <td style="padding: 10px 14px; color: #64748b; font-weight: 600;">待开启</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-guofeng-crimson-classic',
    name: '朱砂古韵·国风典籍文史对照表',
    description: '朱砂红双重外框 + 经典宋体排版 + 典籍名句双栏对照',
    tag: '朱砂古韵',
    styleCategory: 'guofeng',
    previewHtml: `<div style="border:1.5px solid #991b1b;padding:2px;font-size:10px;"><table style="width:100%;border-collapse:collapse;text-align:center;"><tr style="background:#991b1b;color:#fff;"><th style="padding:2px;">典籍</th><th style="padding:2px;">作者</th><th style="padding:2px;">名句</th></tr><tr><td style="color:#991b1b;font-weight:bold;">《道德经》</td><td>老子</td><td style="font-style:italic;">上善若水</td></tr></table></div>`,
    render: () => `<section style="margin: 24px 0; border: 2px solid #991b1b; padding: 3px; background: #faf7f2; clear: both;" data-material="true">
  <div style="border: 1px solid #b91c1c; padding: 2px;">
    <table style="width: 100%; border-collapse: collapse; font-family: 'Songti SC', SimSun, 'Source Han Serif SC', serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
      <thead>
        <tr style="background-color: #991b1b; color: #ffffff;">
          <th style="border: 1px solid #7f1d1d; padding: 10px 12px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">典籍名录</th>
          <th style="border: 1px solid #7f1d1d; padding: 10px 12px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">朝代作者</th>
          <th style="border: 1px solid #7f1d1d; padding: 10px 12px; font-weight: 800; color: #ffffff; letter-spacing: 2px;">传世名句摘录</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #ffffff;">
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; font-weight: 800; color: #991b1b;">《道德经》</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #451a03; font-weight: 700;">春秋·老子</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #292524; font-style: italic;">“上善若水，水善利万物而不争。”</td>
        </tr>
        <tr style="background-color: #faf7f2;">
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; font-weight: 800; color: #991b1b;">《南华经》</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #451a03; font-weight: 700;">战国·庄周</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #292524; font-style: italic;">“北冥有鱼，其名为鲲，鲲之大不知其几千里也。”</td>
        </tr>
        <tr style="background-color: #ffffff;">
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; font-weight: 800; color: #991b1b;">《世说新语》</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #451a03; font-weight: 700;">南朝·刘义庆</td>
          <td style="border: 1px solid #e7dfd5; padding: 10px 12px; color: #292524; font-style: italic;">“未若柳絮因风起。”</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>`
  },
  {
    id: 'tbl-handdrawn-planner-card',
    name: '暖黄手账·萌趣打卡习惯自律表',
    description: '明黄手账表头 + 粗黑实体外框 + 星标对勾打卡进度',
    tag: '暖黄手账',
    styleCategory: 'fresh',
    previewHtml: `<div style="border:1.5px solid #18181b;box-shadow:2px 2px 0 #fed7aa;border-radius:6px;overflow:hidden;font-size:10px;"><div style="background:#fef08a;padding:2px 4px;font-weight:bold;color:#18181b;text-align:center;">✨ 打卡计划表 ✨</div><table style="width:100%;border-collapse:collapse;text-align:center;"><tr><td style="padding:2px;font-weight:bold;">阅读</td><td style="color:#f59e0b;font-weight:bold;">★</td><td style="color:#f59e0b;font-weight:bold;">★</td></tr></table></div>`,
    render: () => `<section style="margin: 24px 0; border: 2px solid #18181b; border-radius: 12px; background: #ffffff; box-shadow: 4px 4px 0px #fed7aa; overflow: hidden; clear: both;" data-material="true">
  <div style="background-color: #fef08a; padding: 10px 16px; border-bottom: 2px solid #18181b; display: flex; align-items: center; justify-content: space-between;">
    <span style="font-size: 14.5px; font-weight: 900; color: #18181b; letter-spacing: 0.5px;">✨ 本周打卡清单计划表 ✨</span>
    <span style="font-size: 12px; font-weight: 800; background: #ffffff; border: 1.5px solid #18181b; padding: 2px 8px; border-radius: 6px;">DAY 1-7</span>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background-color: #fffbeb; color: #18181b; border-bottom: 1.5px solid #18181b;">
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">自律习惯</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周一</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周二</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周三</th>
        <th style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 800;">周四</th>
        <th style="padding: 9px 8px; font-weight: 800;">周五</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1.5px solid #18181b;">
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 700; color: #18181b;">早起阅读 30min</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
        <td style="padding: 9px 8px; color: #f59e0b; font-weight: 800;">★</td>
      </tr>
      <tr style="border-bottom: 1.5px solid #18181b; background: #fffdf5;">
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 700; color: #18181b;">有氧慢跑 5km</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #d4d4d8;">—</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
        <td style="padding: 9px 8px; color: #10b981; font-weight: 800;">✓</td>
      </tr>
      <tr>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; font-weight: 700; color: #18181b;">深度复盘输出</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="border-right: 1.5px solid #18181b; padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
        <td style="padding: 9px 8px; color: #3b82f6; font-weight: 800;">●</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-minimal-luxury-clean',
    name: '极简大刊·轻奢高阶无纵线数据表',
    description: '杂志大刊上下双横线 + 宽裕呼吸留白 + 极简数据排版',
    tag: '大刊极简',
    styleCategory: 'minimal',
    previewHtml: `<table style="width:100%;border-collapse:collapse;border-top:1.5px solid #0f172a;border-bottom:1.5px solid #0f172a;font-size:10px;"><thead><tr style="border-bottom:1px solid #0f172a;"><th style="padding:2px 4px;text-align:left;">指标</th><th style="padding:2px 4px;">Q3</th><th style="padding:2px 4px;text-align:right;">同比</th></tr></thead><tbody><tr><td style="padding:2px 4px;">MAU</td><td style="text-align:center;">124w</td><td style="text-align:right;color:#16a34a;font-weight:bold;">+129%</td></tr></tbody></table>`,
    render: () => `<section style="margin: 28px 0; overflow-x: auto; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 14px; text-align: left; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="border-bottom: 1px solid #0f172a; color: #0f172a;">
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px;">METRICS 指标</th>
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px; text-align: center;">2024 Q3</th>
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px; text-align: center;">2024 Q4</th>
        <th style="padding: 12px 16px; font-weight: 800; letter-spacing: 1px; text-align: right;">YoY 同比</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 16px; font-weight: 600; color: #1e293b;">月活跃创作用户数 (MAU)</td>
        <td style="padding: 11px 16px; text-align: center; color: #475569;">1,240,000</td>
        <td style="padding: 11px 16px; text-align: center; color: #0f172a; font-weight: 700;">2,850,000</td>
        <td style="padding: 11px 16px; text-align: right; color: #16a34a; font-weight: 800;">+129.8%</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 16px; font-weight: 600; color: #1e293b;">文章排版渲染效率提升</td>
        <td style="padding: 11px 16px; text-align: center; color: #475569;">3.2x</td>
        <td style="padding: 11px 16px; text-align: center; color: #0f172a; font-weight: 700;">12.5x</td>
        <td style="padding: 11px 16px; text-align: right; color: #16a34a; font-weight: 800;">+290.6%</td>
      </tr>
      <tr>
        <td style="padding: 11px 16px; font-weight: 600; color: #1e293b;">用户净推荐值 (NPS)</td>
        <td style="padding: 11px 16px; text-align: center; color: #475569;">78.2</td>
        <td style="padding: 11px 16px; text-align: center; color: #0f172a; font-weight: 700;">94.6</td>
        <td style="padding: 11px 16px; text-align: right; color: #16a34a; font-weight: 800;">+20.9%</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-aurora-gradient-eval',
    name: '极光渐变·科技产品多维测评打分表',
    description: '蓝紫极光渐变表头 + 星级打分比对 + 专属推荐列高亮',
    tag: '极光渐变',
    styleCategory: 'business',
    previewHtml: `<table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;"><thead><tr style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;"><th style="padding:2px 4px;text-align:left;">维度</th><th style="padding:2px 4px;">竞品</th><th style="padding:2px 4px;color:#fde047;">EasyMD</th></tr></thead><tbody><tr><td style="padding:2px 4px;text-align:left;">保真度</td><td style="color:#f59e0b;">★★★</td><td style="color:#4f46e5;font-weight:bold;background:#f5f3ff;">★★★★★</td></tr></tbody></table>`,
    render: () => `<section style="margin: 24px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(99,102,241,0.12); border: 1px solid #e0e7ff; background: #ffffff; clear: both;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 13.5px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff;">
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff; text-align: left;">评测维度</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff;">竞品 A</th>
        <th style="padding: 12px 14px; font-weight: 700; color: #ffffff;">竞品 B</th>
        <th style="padding: 12px 14px; font-weight: 800; color: #fde047; background: rgba(0,0,0,0.15);">EasyMD ✨</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 14px; text-align: left; font-weight: 600; color: #334155;">微信复制排版保真度</td>
        <td style="padding: 10px 14px; color: #f59e0b;">★★★☆☆</td>
        <td style="padding: 10px 14px; color: #f59e0b;">★★★★☆</td>
        <td style="padding: 10px 14px; color: #4f46e5; font-weight: 800; background: #f5f3ff;">★★★★★ (100%)</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9; background: #faf5ff;">
        <td style="padding: 10px 14px; text-align: left; font-weight: 600; color: #334155;">多平台一键全网分发</td>
        <td style="padding: 10px 14px; color: #94a3b8;">✕ 需手动</td>
        <td style="padding: 10px 14px; color: #94a3b8;">✕ 需手动</td>
        <td style="padding: 10px 14px; color: #16a34a; font-weight: 800; background: #f5f3ff;">✓ 全自动分发</td>
      </tr>
      <tr>
        <td style="padding: 10px 14px; text-align: left; font-weight: 600; color: #334155;">高质量原生设计素材库</td>
        <td style="padding: 10px 14px; color: #64748b;">老旧模板</td>
        <td style="padding: 10px 14px; color: #64748b;">基础样式</td>
        <td style="padding: 10px 14px; color: #4f46e5; font-weight: 800; background: #f5f3ff;">60+ 精雕设计</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-macaron-faq-qa',
    name: '马卡龙双色·Q&A 常见问答速查表',
    description: '马卡龙清新配色 + 问答 Q&A 左右分栏 + 圆角卡片外框',
    tag: '马卡龙问答',
    styleCategory: 'fresh',
    previewHtml: `<div style="border:1.5px solid #cbd5e1;border-radius:6px;overflow:hidden;font-size:10px;"><div style="background:#e0f2fe;padding:2px 4px;font-weight:bold;color:#0369a1;text-align:center;">💡 FAQ 指南</div><table style="width:100%;border-collapse:collapse;"><tr style="background:#fef2f2;"><td style="padding:2px;color:#be123c;font-weight:bold;width:30%;">Q: 格式会乱吗？</td><td style="padding:2px;background:#fff;">A: 100% 还原微信原生。</td></tr></table></div>`,
    render: () => `<section style="margin: 24px 0; border: 1.5px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff; clear: both;" data-material="true">
  <div style="background: #e0f2fe; padding: 10px 16px; border-bottom: 1.5px solid #cbd5e1; font-weight: 800; font-size: 14.5px; color: #0369a1; text-align: center;">
    💡 常见核心疑问速查指南 (FAQ)
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 13.5px; text-align: left; margin: 0; box-sizing: border-box;">
    <tbody>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 14px; background: #fef2f2; color: #be123c; font-weight: 800; width: 28%;">Q: 复制进微信格式会乱吗？</td>
        <td style="padding: 11px 14px; background: #ffffff; color: #334155; line-height: 1.6;">A: 绝对不会！我们经过严苛的内联 CSS 编译，100% 还原微信原生排版。</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 11px 14px; background: #fef9c3; color: #854d0e; font-weight: 800;">Q: 支持哪些代码高亮主题？</td>
        <td style="padding: 11px 14px; background: #ffffff; color: #334155; line-height: 1.6;">A: 内置 Atom One Dark、GitHub Light、Monokai、VS Code 等 10+ 款主流代码配色。</td>
      </tr>
      <tr>
        <td style="padding: 11px 14px; background: #f0fdf4; color: #166534; font-weight: 800;">Q: 数据会上传到云端服务器吗？</td>
        <td style="padding: 11px 14px; background: #ffffff; color: #334155; line-height: 1.6;">A: 所有文章与个人设置默认均存储在浏览器本地，安全隐私零泄露。</td>
      </tr>
    </tbody>
  </table>
</section>`
  },
  {
    id: 'tbl-redbook-checkin-routine',
    name: '小红书爆款·减脂打卡食谱日程表',
    description: '珊瑚粉渐变表头 + 每日三餐饮食计划 + 热量卡路里预估',
    tag: '红薯打卡',
    styleCategory: 'fresh',
    previewHtml: `<div style="border:1.5px solid #fda4af;border-radius:6px;overflow:hidden;font-size:10px;"><div style="background:linear-gradient(135deg,#fb7185,#f43f5e);color:#fff;padding:2px 4px;font-weight:bold;text-align:center;">🥗 掉秤食谱打卡 💖</div><table style="width:100%;border-collapse:collapse;text-align:center;"><tr style="background:#fff1f2;color:#9f1239;"><th style="padding:2px;">时间</th><th style="padding:2px;">食谱</th><th style="padding:2px;">热量</th></tr><tr><td style="color:#e11d48;font-weight:bold;">早餐</td><td>水煮蛋+面包</td><td style="color:#e11d48;">~220kcal</td></tr></table></div>`,
    render: () => `<section style="margin: 24px 0; border: 1.5px solid #fda4af; border-radius: 14px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 14px rgba(244,63,94,0.08); clear: both;" data-material="true">
  <div style="background: linear-gradient(135deg, #fb7185, #f43f5e); padding: 10px 16px; text-align: center; color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">
    🥗 超自律 7 天掉秤食谱打卡 💖
  </div>
  <table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; font-size: 13.5px; text-align: center; margin: 0; box-sizing: border-box;">
    <thead>
      <tr style="background: #fff1f2; color: #9f1239; border-bottom: 1px solid #fecdd3;">
        <th style="padding: 10px 12px; font-weight: 800;">时间</th>
        <th style="padding: 10px 12px; font-weight: 800;">推荐食谱内容</th>
        <th style="padding: 10px 12px; font-weight: 800;">热量预估</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #fff1f2;">
        <td style="padding: 10px 12px; font-weight: 700; color: #e11d48; background: #fff5f5;">早餐 08:00</td>
        <td style="padding: 10px 12px; text-align: left; color: #4c0519; font-weight: 600;">☕ 黑咖啡 + 水煮蛋 1 颗 + 全麦面包 1 片</td>
        <td style="padding: 10px 12px; color: #e11d48; font-weight: 800;">~220 kcal</td>
      </tr>
      <tr style="border-bottom: 1px solid #fff1f2; background: #fffbfb;">
        <td style="padding: 10px 12px; font-weight: 700; color: #e11d48; background: #fff5f5;">午餐 12:30</td>
        <td style="padding: 10px 12px; text-align: left; color: #4c0519; font-weight: 600;">🥑 杂粮饭半碗 + 香煎鸡胸肉 150g + 水煮西兰花</td>
        <td style="padding: 10px 12px; color: #e11d48; font-weight: 800;">~450 kcal</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; font-weight: 700; color: #e11d48; background: #fff5f5;">晚餐 18:00</td>
        <td style="padding: 10px 12px; text-align: left; color: #4c0519; font-weight: 600;">🥣 无糖酸奶 1 盒 + 蓝莓/小番茄一把</td>
        <td style="padding: 10px 12px; color: #e11d48; font-weight: 800;">~180 kcal</td>
      </tr>
    </tbody>
  </table>
</section>`
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
    name: '精选绿色文章导读卡',
    description: '包含发刊词、阅读时长标签与精读摘要',
    tag: '绿色导读卡',
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
    id: 'hw-tldr-summary',
    name: '观点精粹·30秒核心要点速览',
    description: '高亮总结卡片，帮助读者30秒抓住全文核心精髓',
    tag: '要点导读',
    styleCategory: 'business',
    previewHtml: `<div style="background:#f8fafc;border-left:3px solid #3b82f6;padding:6px;font-size:11px;color:#1e3a8a;">⚡ <strong>TL;DR · 30秒核心要点</strong></div>`,
    render: (options = {}) => {
      const summary = options.summary || '采用 AST 抽象语法树与专属 CSS 隔离渲染引擎，全网矩阵同步发布效率提升 10 倍以上。';
      return `<section style="margin: 0 0 24px 0; padding: 18px 20px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);" data-material="true">
  <div style="font-size: 14px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
    <span>⚡</span> <span>TL;DR · 30秒核心要点</span>
  </div>
  <p style="margin: 0; font-size: 13.5px; color: #334155; line-height: 1.75;">
    ${summary}
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
    name: '精选文末三连交互卡片',
    description: '包含“👍 点赞 · 👀 在看 · 🚀 分享”互动按钮',
    tag: '互动三连卡',
    styleCategory: 'fresh',
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
    name: '经典二维码关注引导卡片',
    description: '高转化微信公众号二维码关注框，带有扫码提示手势',
    tag: '二维码关注卡',
    styleCategory: 'business',
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
    id: 'fw-social-matrix',
    name: '全网矩阵·微信/掘金/知乎多平台一键关注',
    description: '极具品质的多社交平台彩色徽标阵列与订阅引导',
    tag: '社交矩阵',
    styleCategory: 'business',
    previewHtml: `<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;text-align:center;color:#0f172a;">🚀 关注全网技术专栏</div>`,
    render: () => `<section style="margin: 32px 0 16px; padding: 22px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.04); text-align: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">🚀 与 100,000+ 创作者共同成长</div>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">欢迎在各大技术社区关注我的专栏，获取每周独家干货更新</p>
  <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
    <span style="background: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bbf7d0;">💚 微信公众号</span>
    <span style="background: #eff6ff; color: #1e40af; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bfdbfe;">💙 知乎专栏</span>
    <span style="background: #fff7ed; color: #c2410c; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #fed7aa;">🧡 稀土掘金</span>
    <span style="background: #f8fafc; color: #0f172a; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #cbd5e1;">🖤 GitHub 开源</span>
  </div>
</section>`
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
    name: '极简纯色',
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
    name: '经典淡雅网格',
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
    name: '波点矩阵',
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
    name: '密集坐标纸',
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
    name: '极简斜线纹理',
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
    name: '信笺横格本',
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
    name: '科技蓝图方格',
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
    name: '微十字星位矩阵',
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

export const headingTemplatesMap = headingTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const quoteTemplatesMap = quoteTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const calloutTemplatesMap = calloutTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const dividerTemplatesMap = dividerTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const listTemplatesMap = listTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const tableTemplatesMap = tableTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const headerWidgetTemplatesMap = headerWidgetTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const footerWidgetTemplatesMap = footerWidgetTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
export const backgroundTemplatesMap = backgroundTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});

export const allMaterialTemplatesMap = {
  ...headingTemplatesMap,
  ...quoteTemplatesMap,
  ...calloutTemplatesMap,
  ...dividerTemplatesMap,
  ...listTemplatesMap,
  ...tableTemplatesMap,
  ...headerWidgetTemplatesMap,
  ...footerWidgetTemplatesMap,
  ...backgroundTemplatesMap
};

export function getMaterialTemplatesForKey(key) {
  if (key === 'body' || key === 'background') {
    return backgroundTemplates;
  }
  if (key === 'blockquote') {
    return quoteTemplates;
  }
  if (key === 'callout') {
    return calloutTemplates;
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
  if (['table', 'tables'].includes(key)) {
    return tableTemplates;
  }
  if (key === 'header_widget') {
    return headerWidgetTemplates;
  }
  if (key === 'footer_widget') {
    return footerWidgetTemplates;
  }
  return [];
}
