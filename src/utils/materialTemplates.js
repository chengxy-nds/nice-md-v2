/** WeChat style templates (item 8).
 * Heading / quote / callout / underline / divider / list / table /
 * widget / background templates plus the lookup maps, used by the
 * WeChat compiler (wechatStyles.js) and the theme customizer.
 * Also holds the small category metadata (materialCategories etc.),
 * which the statically loaded MaterialPopup needs as well.
 * Split out of the former materialLibrary.js. */

import { buildTripleLikeFooter, buildQrFollowFooter, buildAuthorFooter, buildSocialMatrixFooter } from './materialBuilders';

export const materialCategories = [
  { id: 'all', name: '全部素材' },
  { id: 'backgrounds', name: '背景底纹' },
  { id: 'headings', name: '标题/序号' },
  { id: 'quotes', name: '金句/引用' },
  { id: 'callouts', name: '提示/卡片' },
  { id: 'lists', name: '步骤/列表' },
  { id: 'tech_cards', name: '代码/极客' },
  { id: 'tables', name: '表格/对比' },
  { id: 'underlines', name: '下划线' },
  { id: 'dividers', name: '分割线' },
  { id: 'header_widgets', name: '顶部导读' },
  { id: 'footer_widgets', name: '文末组件' }
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
  'underlines': '下划线',
  'dividers': '分割线',
  'header_widgets': '顶部导读',
  'footer_widgets': '文末组件'
};


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
    id: 'h-cyan-signpost-top',
    name: '青绿指路牌TOP标牌',
    description: '青绿倾斜指路牌标牌 + TOP序号 + 极简黑字与星芒点缀',
    tag: '路标标牌',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: true,
    defaultPrefix: 'TOP',
    previewHtml: `<div style="display:flex;justify-content:center;align-items:flex-start;gap:0px;width:100%;text-align:center;"><svg width="48" height="40" viewBox="0 0 78 66" fill="none" style="display:inline-block;vertical-align:top;flex-shrink:0;margin-right:-21px;overflow:visible;"><rect x="23" y="24" width="7" height="40" fill="#FFFFFF" stroke="#000000" stroke-width="2.2" rx="0.5"/><g transform="rotate(-6 27 15)"><path d="M 2 2 H 58 L 72 15 L 58 28 H 2 Z" fill="#00FFA6" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/><text x="30" y="20.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="900" font-size="14.5" fill="#000000" text-anchor="middle">TOP 1</text></g></svg><div style="display:inline-block;padding-top:20px;padding-left:0px;text-align:left;line-height:1.35;"><span style="font-size:14px;font-weight:900;color:#000;">以简为序享从容</span><svg viewBox="0 0 14 14" width="12" height="12" fill="#000000" style="margin-left:3px;margin-bottom:1px;vertical-align:baseline;display:inline-block;"><path d="M 6.5 0 Q 6.5 6.5 13 6.5 Q 6.5 6.5 6.5 13 Q 6.5 6.5 0 6.5 Q 6.5 6.5 6.5 0 Z"/></svg></div></div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'TOP';
      const num = index !== undefined ? index : 1;
      const cleanTitle = (title || '').trim();
      return `<section style="margin: 28px 0 22px; clear: both; box-sizing: border-box; text-align: center;" data-material="true">
  <section style="display: inline-flex; align-items: flex-start; position: relative; max-width: 100%; vertical-align: bottom; margin: 0 auto; text-align: left;">
    <svg width="78" height="66" viewBox="0 0 78 66" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: top; flex-shrink: 0; margin-right: -35px; overflow: visible;">
      <rect x="23" y="24" width="7" height="40" fill="#FFFFFF" stroke="#000000" stroke-width="2.2" rx="0.5"/>
      <g transform="rotate(-6 27 15)">
        <path d="M 2 2 H 58 L 72 15 L 58 28 H 2 Z" fill="#00FFA6" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
        <text x="30" y="20.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="900" font-size="14.5" fill="#000000" text-anchor="middle" letter-spacing="0.5">${prefix} ${num}</text>
      </g>
    </svg><section style="display: inline-block; padding-top: 34px; padding-left: 0px; min-width: 0; word-break: break-word; text-align: left; line-height: 1.38;"><span style="display: inline; font-size: 19px; font-weight: 900; color: #000000; letter-spacing: 0.5px; line-height: 1.38; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;">${cleanTitle}</span><svg viewBox="0 0 14 14" width="16" height="16" fill="#000000" style="margin-left: 4px; margin-bottom: 2px; vertical-align: baseline; display: inline-block;"><path d="M 6.5 0 Q 6.5 6.5 13 6.5 Q 6.5 6.5 6.5 13 Q 6.5 6.5 0 6.5 Q 6.5 6.5 6.5 0 Z"/></svg></section>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-yellow-marker-num',
    name: '亮黄荧光简单序号标题',
    description: '居中大号加粗序号 + 倾斜黄色荧光笔划线 + 居中标题',
    tag: '荧光序号',
    styleCategory: 'fresh',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="text-align: center; margin: 4px 0;"><div style="line-height: 1; margin-bottom: 2px;"><svg width="64" height="32" viewBox="0 0 84 44" fill="none" style="display: inline-block; vertical-align: middle; overflow: visible;"><path d="M 7 24 C 23 16, 53 12, 77 18 C 78.5 19.5, 78 23, 76 26 L 73 31 C 51 25, 23 28, 7 36 C 5.5 35, 5 32, 5.5 29 Z" fill="#ffe600"/><text x="42" y="34" text-anchor="middle" fill="#18181b" font-size="34" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif" letter-spacing="-1">01</text></svg></div><div style="font-size: 14px; font-weight: 700; color: #18181b; letter-spacing: 0.5px;">简单序号标题</div></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 28px 0 20px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: block; text-align: center; margin-bottom: 4px; line-height: 1;">
    <svg width="84" height="44" viewBox="0 0 84 44" fill="none" style="display: inline-block; vertical-align: middle; overflow: visible;">
      <path d="M 7 24 C 23 16, 53 12, 77 18 C 78.5 19.5, 78 23, 76 26 L 73 31 C 51 25, 23 28, 7 36 C 5.5 35, 5 32, 5.5 29 Z" fill="#ffe600"/>
      <text x="42" y="35" text-anchor="middle" fill="#18181b" font-size="38" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif" letter-spacing="-1">${indexPadded}</text>
    </svg>
  </section>
  <section style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; word-break: break-word; text-align: center;">${cleanTitle}</section>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(45deg, #ffffff 0%, #fffde7 25%, #fef9c3 60%, #fde047 100%); line-height: 46px; text-align: center; margin: 0 auto; -webkit-box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2); box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2);"><span style="font-size: 28px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -0.5px; line-height: 46px; display: inline-block;">${indexPadded}</span></section>
  </section>
  <section style="display: block; text-align: center;">
    <span style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">${cleanTitle}</span>
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
    previewHtml: `<div style="text-align: center; margin: 4px 0;"><div style="display: inline-flex; align-items: flex-start;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin-right: -11px; margin-top: -7px; position: relative; z-index: 2; flex-shrink: 0;"><line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/></svg><div style="background-color: #004b97; background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px); background-size: 6px 6px; padding: 5px 18px; color: #ffffff; font-size: 13.5px; font-weight: 800; letter-spacing: 1px; display: inline-block;">简单通用标题</div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="align-self: flex-end; margin-left: -11px; margin-bottom: -7px; position: relative; z-index: 2; flex-shrink: 0;"><line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/></svg></div></div>`,
    render: (title) => {
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 28px 0 20px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-flex; align-items: flex-start; max-width: 100%; box-sizing: border-box;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="margin-right: -14px; margin-top: -10px; position: relative; z-index: 2; flex-shrink: 0; display: inline-block;">
      <line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    <section style="background-color: #004b97; background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px); background-size: 8px 8px; padding: 8px 26px; display: inline-block; position: relative; z-index: 1; box-sizing: border-box; box-shadow: 0 4px 14px rgba(0, 75, 151, 0.25);">
      <span style="color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 1.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">${cleanTitle}</span>
    </section>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="align-self: flex-end; margin-left: -14px; margin-bottom: -10px; position: relative; z-index: 2; flex-shrink: 0; display: inline-block;">
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 26px 0 18px; text-align: left; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 36px; padding-right: 12px; line-height: 1;">
        <section style="background: #f4be47; border: 1.5px solid #18181b; -webkit-box-shadow: 3px 3px 0px #2d2d2d; box-shadow: 3px 3px 0px #2d2d2d; width: 30px; height: 30px; line-height: 27px; text-align: center; box-sizing: border-box;">
          <span style="font-size: 16px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; display: block; line-height: 27px;">${indexPadded}</span>
        </section>
      </section>
      <section style="display: table-cell; vertical-align: middle; text-align: left;">
        <span style="font-size: 18px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.25; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: block; word-break: break-word;">${cleanTitle}</span>
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
    previewHtml: `<div style="display:inline-block;background:#fff;border:1.5px solid #18181b;border-radius:6px;box-shadow:3px 3px 0px #fed7aa;padding:3px 8px;text-align:center;"><div style="text-align:left;line-height:1;margin-bottom:1px;"><svg width="16" height="4" viewBox="0 0 20 5" style="display:block;"><circle cx="2.5" cy="2.5" r="2" fill="#f59e0b"/><circle cx="9.5" cy="2.5" r="2" fill="#f59e0b"/><circle cx="16.5" cy="2.5" r="2" fill="#f59e0b"/></svg></div><div style="padding:0 10px;font-size:13px;font-weight:800;color:#18181b;">教师节快乐呀</div><div style="text-align:right;line-height:1;margin-top:1px;"><svg width="4" height="4" viewBox="0 0 5 5" style="display:inline-block;"><circle cx="2.5" cy="2.5" r="2.2" fill="#f59e0b"/></svg></div></div>`,
    render: (title) => {
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 26px 0 18px; text-align: center; clear: both; box-sizing: border-box;" data-material="true">
  <section style="display: inline-block; background: #ffffff; border: 1.5px solid #18181b; border-radius: 8px; -webkit-box-shadow: 4px 4px 0px #fed7aa; box-shadow: 4px 4px 0px #fed7aa; padding: 5px 10px; max-width: 100%; box-sizing: border-box; text-align: center;">
    <section style="text-align: left; line-height: 1; margin-bottom: 1px;">
      <svg width="20" height="5" viewBox="0 0 20 5" style="display: block;"><circle cx="2.5" cy="2.5" r="2.2" fill="#f59e0b"/><circle cx="10" cy="2.5" r="2.2" fill="#f59e0b"/><circle cx="17.5" cy="2.5" r="2.2" fill="#f59e0b"/></svg>
    </section>
    <section style="padding: 1px 18px;">
      <span style="font-size: 16.5px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">${cleanTitle}</span>
    </section>
    <section style="text-align: right; line-height: 1; margin-top: 1px;">
      <svg width="5" height="5" viewBox="0 0 5 5" style="display: inline-block; vertical-align: top;"><circle cx="2.5" cy="2.5" r="2.2" fill="#f59e0b"/></svg>
    </section>
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
      const badgeText = `${prefix}.${indexPadded}`;
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 4px; line-height: 1;">
      <svg width="82" height="30" viewBox="0 0 82 30" style="display: inline-block; vertical-align: bottom; margin-right: 4px; overflow: visible;">
        <g transform="rotate(-6 41 15)">
          <rect x="4" y="4" width="74" height="22" rx="4" fill="#f59e0b" fill-opacity="0.28"/>
          <rect x="2" y="2" width="74" height="22" rx="4" fill="#facc15"/>
          <text x="39" y="17.5" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif" letter-spacing="0.5">${badgeText}</text>
        </g>
      </svg><svg width="28" height="18" viewBox="0 0 28 18" fill="none" style="display: inline-block; vertical-align: bottom; margin-bottom: 2px;">
        <path d="M2 3 C10 0, 18 3, 24 13 M18 11 L24 13 L22 7" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #2e8b57; letter-spacing: 1px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">${cleanTitle}</span>
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
      const badgeText = `${prefix}.${indexPadded}`;
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 4px; line-height: 1;">
      <svg width="82" height="30" viewBox="0 0 82 30" style="display: inline-block; vertical-align: bottom; margin-right: 4px; overflow: visible;">
        <g transform="rotate(-5 41 15)">
          <rect x="4" y="4" width="74" height="22" rx="4" fill="#e11d48" fill-opacity="0.25"/>
          <rect x="2" y="2" width="74" height="22" rx="4" fill="#f43f5e"/>
          <text x="39" y="17.5" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif" letter-spacing="0.5">${badgeText}</text>
        </g>
      </svg><span style="display: inline-block; vertical-align: bottom; font-size: 16px; margin-bottom: 2px;">✨</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #be123c; letter-spacing: 0.8px; display: inline-block; word-break: break-word; border-bottom: 3px solid #fecdd3; padding-bottom: 4px;">${cleanTitle}</span>
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
      const badgeText = `${prefix}.${indexPadded}`;
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: center;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="margin-bottom: 4px; line-height: 1;">
      <svg width="82" height="30" viewBox="0 0 82 30" style="display: inline-block; vertical-align: bottom; margin-right: 4px; overflow: visible;">
        <g transform="rotate(-4 41 15)">
          <rect x="4" y="4" width="74" height="22" rx="4" fill="#8b5cf6" fill-opacity="0.25"/>
          <rect x="2" y="2" width="74" height="22" rx="4" fill="#8b5cf6"/>
          <text x="39" y="17.5" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Arial Black', sans-serif" letter-spacing="0.5">${badgeText}</text>
        </g>
      </svg><span style="display: inline-block; vertical-align: bottom; font-size: 16px; margin-bottom: 2px;">🌙</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;">
          <span style="font-size: 18px; font-weight: 800; color: #5b21b6; letter-spacing: 0.8px; display: inline-block; word-break: break-word; border-bottom: 3px solid #ddd6fe; padding-bottom: 4px;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 34px; line-height: 1;">
        <section style="background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 800; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; -webkit-box-shadow: 0 4px 10px rgba(37,99,235,0.3); box-shadow: 0 4px 10px rgba(37,99,235,0.3);">${indexPadded}</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 12px;">
        <span style="font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px; line-height: 1.4; word-break: break-word; display: block;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; background: #fef08a; padding: 8px 16px 8px 12px; border-radius: 6px; -webkit-box-shadow: 3px 3px 0px #f59e0b; box-shadow: 3px 3px 0px #f59e0b; max-width: 100%; box-sizing: border-box; text-align: left;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 8px; line-height: 1;">
        <svg width="8" height="18" viewBox="0 0 8 18" style="display: block;"><rect width="8" height="18" rx="2" fill="#d97706"/></svg>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 16px; font-weight: 800; color: #78350f; line-height: 1.4; word-break: break-word; display: block;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 36px; line-height: 1;">
        <section style="background: #10b981; color: #ffffff; font-weight: bold; font-size: 16px; width: 36px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; -webkit-box-shadow: 3px 3px 0px #047857; box-shadow: 3px 3px 0px #047857;">${indexPadded}</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 10px;">
        <span style="font-size: 17px; font-weight: bold; color: #064e3b; letter-spacing: 0.5px; line-height: 1.4; word-break: break-word; display: block;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 22px 0 14px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-radius: 6px; overflow: hidden; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; background: #a3b18a; color: #ffffff; font-weight: bold; font-size: 13px; padding: 8px 12px; letter-spacing: 0.5px; white-space: nowrap;">${prefix}</section>
      <section style="display: table-cell; vertical-align: middle; background: #dad7cd; color: #3a5a40; font-weight: bold; font-size: 15px; padding: 8px 16px; word-break: break-word; line-height: 1.4;">${cleanTitle}</section>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 26px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-block; padding: 6px 24px; border-top: 2px solid #991b1b; border-bottom: 2px solid #991b1b; background: #fff5f5; max-width: 100%; box-sizing: border-box; word-break: break-word;">
    <span style="font-family: 'SimSun', 'Songti SC', serif; font-size: 17px; font-weight: bold; color: #991b1b; letter-spacing: 2px; line-height: 1.4;">❖ ${cleanTitle} ❖</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 22px 0 14px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-block; padding: 8px 16px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0; text-align: left; max-width: 100%; box-sizing: border-box; word-break: break-word;">
    <span style="font-size: 16px; font-weight: bold; color: #065f46; line-height: 1.4;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 24px 0 16px; text-align: center; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; background: #0f172a; padding: 10px 18px; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; line-height: 1.4; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 22px; line-height: 1;">
        <span style="color: #f59e0b; font-size: 18px; display: block;">⚡</span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 16px; font-weight: bold; color: #f8fafc; letter-spacing: 0.5px; word-break: break-word; display: block;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 18px 0 10px; text-align: left; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; max-width: 100%;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; line-height: 1;">
        <span style="background: #2563eb; color: #ffffff; font-size: 12px; font-weight: 700; padding: 2px 7px; border-radius: 4px; display: inline-block;">${indexPadded}</span>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 8px;">
        <span style="font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.4; display: block;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 18px 0 10px; text-align: left; clear: both;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-bottom: 2px solid #86efac; padding-bottom: 2px;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle; width: 22px; font-size: 15px;">🌱</section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 4px;">
        <span style="font-size: 15px; font-weight: 700; color: #15803d; display: block;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 28px 0 18px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-table; vertical-align: middle; border-bottom: 2px solid #b91c1c; padding-bottom: 6px;">
    <section style="display: table-row;">
      <section style="display: table-cell; vertical-align: middle;">
        <section style="background: #b91c1c; color: #ffffff; font-family: 'Songti SC', 'SimSun', serif; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(185, 28, 28, 0.25); letter-spacing: 2px; display: inline-block;">${numLabel}·章</section>
      </section>
      <section style="display: table-cell; vertical-align: middle; padding-left: 10px;">
        <span style="font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 19px; font-weight: 800; color: #1c1917; letter-spacing: 2px;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 28px 0 18px; clear: both;" data-material="true">
  <section style="display: inline-flex; align-items: center; background: #0f172a; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
    <span style="color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; font-weight: 700; margin-right: 8px;">❯_ [SEC_${indexPadded}]</span>
    <span style="color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">${cleanTitle}</span>
    <svg width="8" height="14" viewBox="0 0 8 14" style="display: inline-block; vertical-align: middle; margin-left: 8px; flex-shrink: 0;"><rect width="8" height="14" fill="#38bdf8" fill-opacity="0.85"/></svg>
  </section>
</section>`;
    }
  },
  {
    id: 'h-editorial-roman',
    name: '大刊社论·半透罗马序号大标题',
    description: '底置超大淡雅罗马序号 + 错落叠压加粗主标 + 极简纯黑下划线',
    tag: '杂志社论',
    styleCategory: 'minimal',
    hasAutoNumber: true,
    hasCustomPrefix: false,
    previewHtml: `<div style="display:inline-block;position:relative;text-align:left;"><div style="line-height:1;margin-bottom:-11px;margin-left:-1px;"><svg width="54" height="28" viewBox="0 0 88 46" style="display:block;overflow:visible;"><text x="0" y="43" fill="#cbd5e1" font-family="Georgia,'Times New Roman',serif" font-size="58" font-weight="900" letter-spacing="-1">01</text></svg></div><div style="position:relative;z-index:2;border-bottom:2px solid #0f172a;padding:0 2px 3px 4px;"><span style="font-size:13.5px;font-weight:900;color:#0f172a;text-shadow:-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff;">范式转移与核心增长飞轮</span></div></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 36px 0 22px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-block; position: relative; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="line-height: 1; margin-bottom: -17px; margin-left: -1px;">
      <svg width="88" height="46" viewBox="0 0 88 46" style="display: block; overflow: visible;">
        <text x="0" y="43" fill="#cbd5e1" font-family="Georgia, 'Times New Roman', 'Songti SC', serif" font-size="58" font-weight="900" letter-spacing="-1">${indexPadded}</text>
      </svg>
    </section>
    <section style="position: relative; z-index: 2; border-bottom: 2.5px solid #0f172a; padding: 0 2px 6px 6px; line-height: 1.35;">
      <span style="font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 19.5px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; line-height: 1.35; display: inline-block; text-shadow: -1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 -2px 5px rgba(255,255,255,0.95);">${cleanTitle}</span>
    </section>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 28px 0 18px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-block; background: #fef08a; padding: 7px 18px 7px 14px; border-radius: 4px; box-shadow: 2px 3px 6px rgba(0,0,0,0.08); border-left: 4px solid #eab308;">
    <span style="font-size: 16px; margin-right: 6px;">📌</span>
    <span style="font-family: 'PingFang SC', -apple-system, sans-serif; font-size: 16px; font-weight: 800; color: #713f12; letter-spacing: 0.5px;">${cleanTitle}</span>
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
      const cleanTitle = String(title || '').trim();
      return `<section style="margin: 28px 0 18px; clear: both;" data-material="true">
  <section style="display: inline-flex; align-items: center; background: #eff6ff; border-radius: 9999px; padding: 3px 16px 3px 4px; border: 1px solid #bfdbfe;">
    <span style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);">${prefix} ${indexPadded}</span>
    <span style="font-size: 15px; font-weight: 700; color: #1e3a8a; margin-left: 10px; letter-spacing: 0.2px;">${cleanTitle}</span>
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
    render: (content) => `<section style="margin: 28px 0; padding: 18px 28px 22px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 0 12px 12px 0; box-sizing: border-box;" data-material="true">
  <section style="line-height: 1; margin-bottom: -24px; margin-left: -4px;">
    <svg width="42" height="34" viewBox="0 0 42 34" style="display: block; overflow: visible;"><text x="0" y="36" fill="#cbd5e1" fill-opacity="0.65" font-family="Georgia, serif" font-size="60" font-weight="900">“</text></svg>
  </section>
  <p style="position: relative; z-index: 2; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', serif; font-size: 15.5px; font-weight: 600; line-height: 1.75; color: #1e293b; font-style: italic;">
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
    render: (content) => `<section style="margin: 26px 0; padding: 20px 22px; background: #fffdf5; border: 1px solid #fef08a; border-radius: 6px; box-shadow: 2px 4px 12px rgba(234, 179, 8, 0.08); box-sizing: border-box;" data-material="true">
  <section style="text-align: center; line-height: 1; margin-top: -28px; margin-bottom: 10px;">
    <svg width="68" height="20" viewBox="0 0 68 20" style="display: inline-block; vertical-align: top; overflow: visible;"><g transform="rotate(-1.5 34 10)"><rect x="2" y="2" width="64" height="16" rx="2" fill="#fde047" fill-opacity="0.65"/></g></svg>
  </section>
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

// ── 下划线/重点标记模版（Underlines / U / INS 文本修饰模版）──
// 甄选 135编辑器 / 壹伴 / 顶级公众号的高质感、低饱和、极简耐看排版设计
export const underlineTemplates = [
  {
    id: 'none',
    name: '默认原生下划线',
    shortName: '默认下划线',
    description: '使用当前主题预设的基础下划线样式',
    tag: '默认',
    styleCategory: 'all',
    previewHtml: `<span style="text-decoration: underline; text-underline-offset: 3px; color: inherit; font-size: 13px;">默认下划线样式</span>`,
    render: () => null
  },
  {
    id: 'u-amber-cream',
    name: '暖阳米黄·柔和荧光马克笔',
    shortName: '暖阳米黄',
    description: '135爆款暖阳米黄微底衬，温润舒适，重点标注第一推荐',
    tag: '暖阳微光',
    styleCategory: 'fresh',
    previewHtml: `<span style="background: linear-gradient(180deg, transparent 58%, rgba(254, 240, 138, 0.75) 58%); padding: 0 4px 1px; border-radius: 2px; font-weight: 600; color: inherit;">暖阳米黄划线</span>`,
    render: (text) => `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(254, 240, 138, 0.75) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-sage-green',
    name: '鼠尾草绿·低饱和清新微衬',
    shortName: '鼠尾草绿',
    description: '莫兰迪低饱和鼠尾草浅绿，护眼文艺，干货科普首选',
    tag: '莫兰迪绿',
    styleCategory: 'fresh',
    previewHtml: `<span style="background: linear-gradient(180deg, transparent 58%, rgba(209, 250, 229, 0.8) 58%); padding: 0 4px 1px; border-radius: 2px; font-weight: 600; color: inherit;">鼠尾草绿划线</span>`,
    render: (text) => `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(209, 250, 229, 0.8) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-morandi-blue',
    name: '雾霾灰蓝·极简双轨科技线',
    shortName: '雾霾灰蓝',
    description: '莫兰迪雾霾灰蓝双层细线，克制严谨，科技与职场必备',
    tag: '极简双轨',
    styleCategory: 'tech',
    previewHtml: `<span style="border-bottom: 3px double #64748b; padding-bottom: 2px; color: inherit; font-weight: 600;">雾霾灰蓝双轨</span>`,
    render: (text) => `<u style="text-decoration: none; border-bottom: 3px double #64748b; padding-bottom: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-kraft-coffee',
    name: '复古暖咖·牛皮纸质感微衬',
    shortName: '复古暖咖',
    description: '复古牛皮纸暖咖底衬 + 雅致细线，人文阅读与生活志质感',
    tag: '复古暖咖',
    styleCategory: 'minimal',
    previewHtml: `<span style="background: linear-gradient(180deg, transparent 60%, rgba(245, 230, 211, 0.9) 60%); border-bottom: 1.5px solid #a87d51; padding: 0 4px 2px; border-radius: 2px; font-weight: 600; color: inherit;">复古暖咖微衬</span>`,
    render: (text) => `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 60%, rgba(245, 230, 211, 0.9) 60%); border-bottom: 1.5px solid #a87d51; padding: 0 4px 2px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-slate-wavy',
    name: '低调炭灰·手绘波浪细线',
    shortName: '炭灰波浪',
    description: '壹伴同款低饱和炭灰手绘波浪线，不突兀，轻盈灵动',
    tag: '手绘波浪',
    styleCategory: 'minimal',
    previewHtml: `<span style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='4' viewBox='0 0 10 4'%3E%3Cpath d='M0 2.5 Q 2.5 0.5, 5 2.5 T 10 2.5' fill='none' stroke='%23475569' stroke-opacity='0.75' stroke-width='1.3'/%3E%3C/svg%3E&quot;); background-repeat: repeat-x; background-position: 0 100%; background-size: 10px 4px; padding-bottom: 4px; font-weight: 600; color: inherit;">炭灰手绘波浪</span>`,
    render: (text) => `<u style="text-decoration: none; background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='4' viewBox='0 0 10 4'%3E%3Cpath d='M0 2.5 Q 2.5 0.5, 5 2.5 T 10 2.5' fill='none' stroke='%23475569' stroke-opacity='0.75' stroke-width='1.3'/%3E%3C/svg%3E&quot;); background-repeat: repeat-x; background-position: 0 100%; background-size: 10px 4px; padding-bottom: 4px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-apricot-wavy',
    name: '温润暖杏·柔和手绘波浪',
    shortName: '暖杏波浪',
    description: '暖杏橙黄波浪细线，温暖亲切，小红书与情感文首选',
    tag: '温润暖杏',
    styleCategory: 'fresh',
    previewHtml: `<span style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='4' viewBox='0 0 10 4'%3E%3Cpath d='M0 2.5 Q 2.5 0.5, 5 2.5 T 10 2.5' fill='none' stroke='%23f97316' stroke-width='1.3'/%3E%3C/svg%3E&quot;); background-repeat: repeat-x; background-position: 0 100%; background-size: 10px 4px; padding-bottom: 4px; font-weight: 600; color: inherit;">暖杏手绘波浪</span>`,
    render: (text) => `<u style="text-decoration: none; background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='4' viewBox='0 0 10 4'%3E%3Cpath d='M0 2.5 Q 2.5 0.5, 5 2.5 T 10 2.5' fill='none' stroke='%23f97316' stroke-width='1.3'/%3E%3C/svg%3E&quot;); background-repeat: repeat-x; background-position: 0 100%; background-size: 10px 4px; padding-bottom: 4px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-green-wavy',
    name: '青翠生机·大波浪绿色细线',
    shortName: '翠绿大波浪',
    description: '135/壹伴爆款清新大波浪绿色细线，舒展灵动，护眼活泼',
    tag: '翠绿大波浪',
    styleCategory: 'fresh',
    previewHtml: `<span style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='5' viewBox='0 0 12 5'%3E%3Cpath d='M0 3 Q 3 0.5, 6 3 T 12 3' fill='none' stroke='%2310b981' stroke-width='1.5'/%3E%3C/svg%3E&quot;); background-repeat: repeat-x; background-position: 0 100%; background-size: 12px 5px; padding-bottom: 5px; font-weight: 600; color: inherit;">翠绿大波浪细线</span>`,
    render: (text) => `<u style="text-decoration: none; background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='5' viewBox='0 0 12 5'%3E%3Cpath d='M0 3 Q 3 0.5, 6 3 T 12 3' fill='none' stroke='%2310b981' stroke-width='1.5'/%3E%3C/svg%3E&quot;); background-repeat: repeat-x; background-position: 0 100%; background-size: 12px 5px; padding-bottom: 5px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-editorial-minimal',
    name: '大刊社论·1.5px精致沉静底线',
    shortName: '大刊细线',
    description: '纽约客/GQ杂志社论风 1.5px 纯净炭黑悬浮细线，极简高端',
    tag: '杂志大刊',
    styleCategory: 'minimal',
    previewHtml: `<span style="border-bottom: 1.5px solid #1e293b; padding-bottom: 2px; font-weight: 700; color: inherit;">大刊社论底线</span>`,
    render: (text) => `<u style="text-decoration: none; border-bottom: 1.5px solid #1e293b; padding-bottom: 2px; color: inherit; font-weight: 700; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-notion-pill',
    name: '晨雾浅灰·Notion极简胶囊底衬',
    shortName: 'Notion胶囊',
    description: 'Notion风格浅灰胶囊微衬 + 极细底边，结构清晰现代',
    tag: 'Notion风',
    styleCategory: 'minimal',
    previewHtml: `<span style="background: rgba(241, 245, 249, 0.95); border-bottom: 2px solid #cbd5e1; padding: 2px 6px 3px; border-radius: 4px; font-weight: 600; color: #1e293b;">Notion极简胶囊</span>`,
    render: (text) => `<u style="text-decoration: none; background: rgba(241, 245, 249, 0.95); border-bottom: 2px solid #cbd5e1; padding: 2px 6px 3px; border-radius: 4px; color: #1e293b; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-fine-dotted',
    name: '复古印品·细密微墨点阵线',
    shortName: '细密点阵',
    description: '1.5px 极细点阵墨滴印线，细腻精致，极具书籍印刷质感',
    tag: '点阵印线',
    styleCategory: 'minimal',
    previewHtml: `<span style="border-bottom: 1.5px dotted #64748b; padding-bottom: 2px; font-weight: 600; color: inherit;">复古点阵印线</span>`,
    render: (text) => `<u style="text-decoration: none; border-bottom: 1.5px dotted #64748b; padding-bottom: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-indigo-silk',
    name: '沉香藏青·国风雅致宋韵细线',
    shortName: '藏青宋韵',
    description: '沉香藏青雅致细线 + 典雅宋体加粗，古雅沉稳，文化气息浓厚',
    tag: '国风雅致',
    styleCategory: 'guofeng',
    previewHtml: `<span style="border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; font-family: serif; font-weight: 700; color: #1e3a8a;">沉香藏青宋韵</span>`,
    render: (text) => `<u style="text-decoration: none; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; color: #1e3a8a; font-weight: 700; font-family: 'Songti SC', SimSun, serif; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-terracotta-dash',
    name: '陶土赭石·手绘断点虚线',
    shortName: '陶土虚线',
    description: '低饱和陶土暖赭色断点虚线，大地色系，质朴温暖',
    tag: '陶土大地',
    styleCategory: 'minimal',
    previewHtml: `<span style="border-bottom: 2px dashed #b45309; padding-bottom: 2px; font-weight: 600; color: #92400e;">陶土手绘虚线</span>`,
    render: (text) => `<u style="text-decoration: none; border-bottom: 2px dashed #b45309; padding-bottom: 2px; color: #92400e; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-vintage-gold',
    name: '黑金工坊·暖琥珀双轨轻奢线',
    shortName: '暖琥珀线',
    description: '暖琥珀双轨细线条，低调奢华，高端商业排版品质',
    tag: '黑金轻奢',
    styleCategory: 'business',
    previewHtml: `<span style="border-bottom: 3px double #b45309; padding-bottom: 2px; font-weight: 600; color: inherit;">暖琥珀双轨线</span>`,
    render: (text) => `<u style="text-decoration: none; border-bottom: 3px double #b45309; padding-bottom: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-ink-tint',
    name: '水墨微澜·极简渐变水墨底托',
    shortName: '水墨微澜',
    description: '水墨微渐变柔和底衬 + 沉水青蓝底线，东方意境，文雅清透',
    tag: '水墨清透',
    styleCategory: 'guofeng',
    previewHtml: `<span style="background: linear-gradient(90deg, rgba(30, 41, 59, 0.08) 0%, rgba(30, 41, 59, 0.02) 100%); border-bottom: 2px solid #475569; padding: 2px 6px; border-radius: 2px; font-weight: 600; color: inherit;">水墨渐变微托</span>`,
    render: (text) => `<u style="text-decoration: none; background: linear-gradient(90deg, rgba(30, 41, 59, 0.08) 0%, rgba(30, 41, 59, 0.02) 100%); border-bottom: 2px solid #475569; padding: 2px 6px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-ice-mist',
    name: '极地冰雾·浅蓝半透微底衬',
    shortName: '极地冰雾',
    description: '极浅海盐冰蓝微底衬，现代科技冷静感，清新通透',
    tag: '冰雾浅蓝',
    styleCategory: 'tech',
    previewHtml: `<span style="background: linear-gradient(180deg, transparent 58%, rgba(186, 230, 253, 0.65) 58%); padding: 0 4px 1px; border-radius: 2px; font-weight: 600; color: inherit;">极地冰雾微衬</span>`,
    render: (text) => `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(186, 230, 253, 0.65) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
  },
  {
    id: 'u-blush-rose',
    name: '莫兰迪粉·温柔晚风浅底衬',
    shortName: '莫兰迪粉',
    description: '莫兰迪低饱和灰粉微底衬，温柔治愈，美妆女性生活首选',
    tag: '莫兰迪粉',
    styleCategory: 'fresh',
    previewHtml: `<span style="background: linear-gradient(180deg, transparent 58%, rgba(251, 207, 232, 0.65) 58%); padding: 0 4px 1px; border-radius: 2px; font-weight: 600; color: inherit;">莫兰迪灰粉</span>`,
    render: (text) => `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(251, 207, 232, 0.65) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">${text}</u>`
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
  },
  {
    id: 'd-wave-marker-yellow',
    name: '荧光手绘·暖黄波浪马克线',
    description: '明亮活泼的手绘马克笔双波浪线条，适合段落章节优雅过渡',
    tag: '荧光波浪',
    styleCategory: 'fresh',
    previewHtml: `<div style="text-align: center; color: #facc15; font-size: 14px;">〰〰〰〰〰〰</div>`,
    render: () => `<section style="margin: 28px auto; text-align: center; width: 100%; clear: both;" data-material="true">
  <svg width="220" height="14" viewBox="0 0 220 14" fill="none" style="display: block; margin: 0 auto; max-width: 100%; overflow: visible;">
    <path d="M 2 7 Q 15 1, 30 7 T 60 7 T 90 7 T 120 7 T 150 7 T 180 7 T 210 7 T 218 7" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  </svg>
</section>`
  },
  {
    id: 'd-cyber-neon-pulse',
    name: '极客赛博·霓虹渐变脉冲光线',
    description: '双向渐变青蓝光轨 + 居中发光晶体命令符 ◈ [SYSTEM_BREAK] ◈',
    tag: '赛博极客',
    styleCategory: 'tech',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#38bdf8;font-family:monospace;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#38bdf8);"></div><span>◈ [BREAK] ◈</span><div style="flex:1;height:1px;background:linear-gradient(90deg,#38bdf8,transparent);"></div></div>`,
    render: () => `<section style="margin: 30px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1.5px; background: linear-gradient(90deg, transparent, #38bdf8);"></div>
  <span style="color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">◈ [SYSTEM_BREAK] ◈</span>
  <div style="flex: 1; height: 1.5px; background: linear-gradient(90deg, #38bdf8, transparent);"></div>
</section>`
  },
  {
    id: 'd-guofeng-cloud-knot',
    name: '国风水墨·朱砂双线祥云如意线',
    description: '朱砂红双重纤细平直线 + 居中古雅朱红 ❖ 祥云文气纹样',
    tag: '国风水墨',
    styleCategory: 'guofeng',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#b91c1c;font-family:serif;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#b91c1c);"></div><span>❖ 雲水流轉 ❖</span><div style="flex:1;height:1px;background:linear-gradient(90deg,#b91c1c,transparent);"></div></div>`,
    render: () => `<section style="margin: 30px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #b91c1c);"></div>
  <span style="color: #b91c1c; font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 13.5px; letter-spacing: 3px; font-weight: 600;">❖ 雲水流轉 ❖</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #b91c1c, transparent);"></div>
</section>`
  },
  {
    id: 'd-editorial-double-rail',
    name: '大刊社论·纯黑双轨几何极简线',
    description: '经典大刊双轨线（3px 纯黑实线 + 1px 细线），充满呼吸感与留白',
    tag: '杂志社论',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding:4px 0;"><div style="height:2.5px;background:#0a0a0a;margin-bottom:2px;"></div><div style="height:1px;background:#0a0a0a;"></div></div>`,
    render: () => `<section style="margin: 32px 0; width: 100%; clear: both;" data-material="true">
  <div style="height: 3px; background: #0a0a0a; margin-bottom: 3px; width: 100%;"></div>
  <div style="height: 1px; background: #0a0a0a; width: 100%;"></div>
</section>`
  },
  {
    id: 'd-leaf-sprout-green',
    name: '清新草木·嫩绿晨露小树叶线',
    description: '双侧柔和浅绿渐变细线 + 居中清新绿植萌芽 🌱 🌿 🍃 呼吸点缀',
    tag: '小清新',
    styleCategory: 'fresh',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#86efac);"></div><span style="font-size:12px;">🌿 🌱 🍃</span><div style="flex:1;height:1px;background:linear-gradient(90deg,#86efac,transparent);"></div></div>`,
    render: () => `<section style="margin: 28px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #86efac);"></div>
  <span style="font-size: 16px; line-height: 1;">🌿 🌱 🍃</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #86efac, transparent);"></div>
</section>`
  },
  {
    id: 'd-golden-gradient-lux',
    name: '极简黑金·鎏金微光四芒星线',
    description: '从透明向暖金辉光过渡的细腻渐变光束 + 居中精致四芒星 ✧',
    tag: '黑金轻奢',
    styleCategory: 'business',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;color:#d97706;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#f59e0b);"></div><span style="font-size:13px;">✧</span><div style="flex:1;height:1px;background:linear-gradient(90deg,#f59e0b,transparent);"></div></div>`,
    render: () => `<section style="margin: 32px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #f59e0b 50%, #d97706 100%);"></div>
  <span style="color: #d97706; font-size: 15px; font-weight: bold;">✧</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, transparent 100%);"></div>
</section>`
  },
  {
    id: 'd-stamp-ticket-tear',
    name: '手账撕票·双孔锯齿撕裂虚线',
    description: '左右打孔圆角 + 细密票据撕裂虚线，手账与活动优惠感十足',
    tag: '手账便签',
    styleCategory: 'fresh',
    previewHtml: `<div style="display:flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;border-radius:50%;background:#cbd5e1;"></span><div style="flex:1;border-top:1.5px dashed #cbd5e1;"></div><span style="width:6px;height:6px;border-radius:50%;background:#cbd5e1;"></span></div>`,
    render: () => `<section style="margin: 28px auto; width: 100%; display: flex; align-items: center; gap: 6px; clear: both;" data-material="true">
  <svg width="8" height="8" viewBox="0 0 8 8" style="display: block; flex-shrink: 0;"><circle cx="4" cy="4" r="4" fill="#cbd5e1"/></svg>
  <section style="flex: 1; border-top: 1.5px dashed #cbd5e1; height: 0;"></section>
  <svg width="8" height="8" viewBox="0 0 8 8" style="display: block; flex-shrink: 0;"><circle cx="4" cy="4" r="4" fill="#cbd5e1"/></svg>
</section>`
  },
  {
    id: 'd-rhombus-morandi',
    name: '莫兰迪·低饱和双菱形雅致微线',
    description: '低饱和度豆沙灰绿对称微细线 + 居中对称双实心菱形 ◆ ◆',
    tag: '莫兰迪',
    styleCategory: 'minimal',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;color:#588157;"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#a3b18a);"></div><span style="font-size:10px;">◆ ◆</span><div style="flex:1;height:1px;background:linear-gradient(90deg,#a3b18a,transparent);"></div></div>`,
    render: () => `<section style="margin: 28px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #a3b18a);"></div>
  <span style="color: #588157; font-size: 11px; letter-spacing: 2px;">◆ ◆</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #a3b18a, transparent);"></div>
</section>`
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
    render: (itemHtml, index) => `<li style="list-style: none; margin: 0 0 0 8px; padding-bottom: 12px; border-left: 2px solid #3b82f6; display: flex; align-items: flex-start;" data-material="true">
  <svg width="14" height="14" viewBox="0 0 14 14" style="margin-left: -8px; margin-top: 4px; margin-right: 12px; flex-shrink: 0; display: block;"><circle cx="7" cy="7" r="5" fill="#2563eb" stroke="#ffffff" stroke-width="2"/></svg>
  <section style="flex: 1; min-width: 0; font-size: 14.5px; color: #1e293b; line-height: 1.7; word-break: break-word;">${itemHtml}</section>
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
    <svg width="46" height="12" viewBox="0 0 46 12" style="display: block; flex-shrink: 0;"><circle cx="6" cy="6" r="5" fill="#ef4444"/><circle cx="22" cy="6" r="5" fill="#f59e0b"/><circle cx="38" cy="6" r="5" fill="#10b981"/></svg>
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
    name: '文末互动引导',
    description: '简洁的点赞、在看与分享提示，适合文章结尾',
    tag: '文末互动',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;text-align:center;color:#334155;">点赞支持　·　在看　·　转发分享</div>`,
    render: (options = {}) => {
      const tip = options.tip || '如果这篇内容对你有帮助';
      return buildTripleLikeFooter(tip);
    }
  },
  {
    id: 'f-135-qrcode-card',
    name: '公众号二维码卡',
    description: '简洁的公众号关注引导与二维码替换位',
    tag: '二维码关注卡',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;color:#334155;">扫码关注公众号　　二维码</div>`,
    render: (options = {}) => {
      const title = options.title || '扫码关注公众号';
      const subTitle = options.subTitle || '每周更新实用内容与深度复盘';
      return buildQrFollowFooter(title, subTitle);
    }
  },
  {
    id: 'fw-social-matrix',
    name: '多平台关注引导',
    description: '用简洁文字列出公众号、知乎、掘金与 GitHub',
    tag: '多平台关注',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding:6px;border-top:1px solid #dbe3ec;border-bottom:1px solid #dbe3ec;font-size:11px;text-align:center;color:#334155;">微信公众号　·　知乎　·　掘金　·　GitHub</div>`,
    render: () => buildSocialMatrixFooter()
  },
  {
    id: 'f-author-cta',
    name: '作者简介卡',
    description: '作者简介与公众号关注入口，适合作为文章署名',
    tag: '作者名片',
    styleCategory: 'minimal',
    previewHtml: `<div style="padding:6px;background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;font-size:11px;color:#334155;">作者专栏　程序员小富　关注公众号 →</div>`,
    render: (options = {}) => {
      const author = options.author || '程序员小富';
      const desc = options.desc || '专注分享后端架构、实用工具与创作经验。';
      return buildAuthorFooter(author, desc);
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
  const resolvedId = !normId || normId === 'clean' ? 'none' : normId;
  const t = backgroundTemplates.find(b => b.id === resolvedId || b.id === textureId) || backgroundTemplates[0];
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
export const underlineTemplatesMap = underlineTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
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
  ...underlineTemplatesMap,
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
  if (key === 'u' || key === 'underline' || key === 'underlines') {
    return underlineTemplates;
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
