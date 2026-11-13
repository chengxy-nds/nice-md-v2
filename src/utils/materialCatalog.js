/** WeChat material catalog (item 8).
 * The browseable material list shown by MaterialCenter: just the
 * `materials` array (~1900 lines). Imported only by the (lazily loaded)
 * MaterialCenter, so this data set no longer ships in the initial bundle.
 * The small category metadata lives in materialTemplates.js, because the
 * statically loaded MaterialPopup needs it too. Split out of the former
 * materialLibrary.js. */

import { buildTripleLikeFooter, buildQrFollowFooter, buildAuthorFooter, buildSocialMatrixFooter } from './materialBuilders';

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
    id: 'h-cyan-signpost-top',
    category: 'headings',
    tag: '指路标牌',
    styleCategory: 'fresh',
    title: '青绿指路牌TOP标牌',
    description: '青绿倾斜指路牌标牌 + TOP序号 + 极简黑字与星芒点缀',
    tags: ['路标', 'TOP', '箭头', '指路牌', '青绿', '爆款'],
    html: `<section style="margin: 28px 0 22px; clear: both; box-sizing: border-box; text-align: center;" data-material="true">
  <section style="display: inline-flex; align-items: flex-start; position: relative; max-width: 100%; vertical-align: bottom; margin: 0 auto; text-align: left;">
    <svg width="78" height="66" viewBox="0 0 78 66" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: top; flex-shrink: 0; margin-right: -35px; overflow: visible;">
      <rect x="23" y="24" width="7" height="40" fill="#FFFFFF" stroke="#000000" stroke-width="2.2" rx="0.5"/>
      <g transform="rotate(-6 27 15)">
        <path d="M 2 2 H 58 L 72 15 L 58 28 H 2 Z" fill="#00FFA6" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
        <text x="30" y="20.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="900" font-size="14.5" fill="#000000" text-anchor="middle" letter-spacing="0.5">TOP 1</text>
      </g>
    </svg><section style="display: inline-block; padding-top: 34px; padding-left: 0px; min-width: 0; word-break: break-word; text-align: left; line-height: 1.38;"><span style="display: inline; font-size: 19px; font-weight: 900; color: #000000; letter-spacing: 0.5px; line-height: 1.38; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;">以简为序享从容</span><svg viewBox="0 0 14 14" width="16" height="16" fill="#000000" style="margin-left: 4px; margin-bottom: 2px; vertical-align: baseline; display: inline-block;"><path d="M 6.5 0 Q 6.5 6.5 13 6.5 Q 6.5 6.5 6.5 13 Q 6.5 6.5 0 6.5 Q 6.5 6.5 6.5 0 Z"/></svg></section>
  </section>
</section>`
  },
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
    <section style="margin-bottom: 4px; line-height: 1;">
      <svg width="76" height="28" viewBox="0 0 76 28" fill="none" style="display: inline-block; vertical-align: bottom; margin-right: 4px; overflow: visible;"><g transform="rotate(-6 38 14)"><rect x="3" y="4" width="68" height="21" rx="4" fill="#f59e0b" fill-opacity="0.28"/><rect x="1" y="2" width="68" height="21" rx="4" fill="#facc15"/><text x="35" y="16.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="800" font-size="12.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">PART.01</text></g></svg><svg width="28" height="18" viewBox="0 0 28 18" fill="none" style="display: inline-block; vertical-align: bottom; margin-bottom: 2px;"><path d="M2 3 C10 0, 18 3, 24 13 M18 11 L24 13 L22 7" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;"><span style="font-size: 18px; font-weight: 800; color: #2e8b57; letter-spacing: 1px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">八月拾夏 静待秋风</span><svg width="100%" height="8" viewBox="0 0 140 8" preserveAspectRatio="none" fill="none" style="display: block; margin-top: 3px;"><path d="M0 2 Q 10 7, 20 2 T 40 2 T 60 2 T 80 2 T 100 2 T 120 2 T 140 2 M0 6 Q 10 11, 20 6 T 40 6 T 60 6 T 80 6 T 100 6 T 120 6 T 140 6" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/></svg></section>
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
    <section style="margin-bottom: 4px; line-height: 1;">
      <svg width="76" height="28" viewBox="0 0 76 28" fill="none" style="display: inline-block; vertical-align: bottom; margin-right: 4px; overflow: visible;"><g transform="rotate(-5 38 14)"><rect x="3" y="4" width="68" height="21" rx="4" fill="#e11d48" fill-opacity="0.25"/><rect x="1" y="2" width="68" height="21" rx="4" fill="#f43f5e"/><text x="35" y="16.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="800" font-size="12.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">PART.02</text></g></svg><span style="display: inline-block; vertical-align: bottom; font-size: 16px;">✨</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;"><span style="font-size: 18px; font-weight: 800; color: #be123c; letter-spacing: 0.8px; display: inline-block; word-break: break-word; border-bottom: 3px solid #fecdd3; padding-bottom: 4px;">关于生活中的温柔复苏</span></section>
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
    <section style="margin-bottom: 4px; line-height: 1;">
      <svg width="76" height="28" viewBox="0 0 76 28" fill="none" style="display: inline-block; vertical-align: bottom; margin-right: 4px; overflow: visible;"><g transform="rotate(-4 38 14)"><rect x="3" y="4" width="68" height="21" rx="4" fill="#8b5cf6" fill-opacity="0.25"/><rect x="1" y="2" width="68" height="21" rx="4" fill="#8b5cf6"/><text x="35" y="16.5" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-weight="800" font-size="12.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">PART.03</text></g></svg><span style="display: inline-block; vertical-align: bottom; font-size: 16px;">🌙</span>
    </section>
    <section style="display: inline-table; vertical-align: middle; max-width: 100%; line-height: 1.3;">
      <section style="display: table-row;">
        <section style="display: table-cell; vertical-align: middle; padding-right: 8px; word-break: break-word;"><span style="font-size: 18px; font-weight: 800; color: #5b21b6; letter-spacing: 0.8px; display: inline-block; word-break: break-word; border-bottom: 3px solid #ddd6fe; padding-bottom: 4px;">晚风拂过 枕着星河入梦</span></section>
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
  <section style="display: block; text-align: center; margin-bottom: 4px; line-height: 1;">
    <svg width="84" height="44" viewBox="0 0 84 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: bottom; overflow: visible;">
      <path d="M 7 26 C 23 18, 53 14, 77 20 C 78.5 21.5, 78 25, 76 28 L 73 33 C 51 27, 23 30, 7 38 C 5.5 37, 5 34, 5.5 31 Z" fill="#ffe600"/>
      <text x="42" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', Arial, sans-serif" font-weight="900" font-size="38" fill="#18181b" text-anchor="middle" letter-spacing="-1">01</text>
    </svg>
  </section>
  <section style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; word-break: break-word; text-align: center;">简单序号标题</section>
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
  <section style="display: inline-block; margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(45deg, #ffffff 0%, #fffde7 25%, #fef9c3 60%, #fde047 100%); line-height: 46px; text-align: center; margin: 0 auto; -webkit-box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2); box-shadow: 0 4px 12px rgba(253, 224, 71, 0.2);"><span style="font-size: 28px; font-weight: 900; color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial Black', sans-serif; letter-spacing: -0.5px; line-height: 46px; display: inline-block;">01</span></section>
  </section>
  <section style="display: block; text-align: center;"><span style="font-size: 16px; font-weight: 700; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">简单通用标题</span><svg width="96" height="12" viewBox="0 0 96 12" fill="none" style="display: block; margin: 1px auto 0; overflow: visible;"><path d="M 6 10 C 18 9, 30 5.5, 42 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/><path d="M 48 10 C 62 9, 76 5.5, 90 3" stroke="#facc15" stroke-width="3" stroke-linecap="round"/></svg></section>
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
  <section style="display: inline-flex; align-items: flex-start; justify-content: center; max-width: 100%;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: inline-block; flex-shrink: 0; margin-right: -14px; margin-top: -10px; overflow: visible;"><line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/></svg><section style="background-color: #004b97; background-image: linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px); background-size: 8px 8px; padding: 8px 26px; display: inline-block; box-sizing: border-box; box-shadow: 0 4px 14px rgba(0, 75, 151, 0.25);"><span style="color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 1.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">简单通用标题</span></section><svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: inline-block; flex-shrink: 0; align-self: flex-end; margin-left: -14px; margin-bottom: -10px; overflow: visible;"><line x1="2" y1="22" x2="22" y2="2" stroke="#004b97" stroke-width="2.5" stroke-linecap="round"/></svg></section>
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
  <section style="display: inline-block; background: #ffffff; border: 1.5px solid #18181b; border-radius: 8px; -webkit-box-shadow: 4px 4px 0px #fed7aa; box-shadow: 4px 4px 0px #fed7aa; padding: 5px 8px; max-width: 100%; box-sizing: border-box; text-align: center;">
    <section style="display: block; text-align: left; line-height: 1; height: 5px;"><svg width="19" height="5" viewBox="0 0 19 5" fill="none" style="display: block;"><circle cx="2.5" cy="2.5" r="2.2" fill="#f59e0b"/><circle cx="9.5" cy="2.5" r="2.2" fill="#f59e0b"/><circle cx="16.5" cy="2.5" r="2.2" fill="#f59e0b"/></svg></section>
    <section style="display: block; padding: 1px 20px; text-align: center;"><span style="font-size: 16.5px; font-weight: 800; color: #18181b; letter-spacing: 0.5px; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block; word-break: break-word;">教师节快乐呀</span></section>
    <section style="display: block; text-align: right; line-height: 1; height: 5px;"><svg width="5" height="5" viewBox="0 0 5 5" fill="none" style="display: inline-block; vertical-align: top;"><circle cx="2.5" cy="2.5" r="2.2" fill="#f59e0b"/></svg></section>
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
      <section style="display: table-cell; vertical-align: middle; width: 8px; line-height: 1;"><svg width="8" height="18" viewBox="0 0 8 18" fill="none" style="display: block;"><rect width="8" height="18" rx="2" fill="#d97706"/></svg></section>
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
  {
    id: 'h-editorial-roman',
    category: 'headings',
    tag: '杂志社论',
    styleCategory: 'minimal',
    title: '大刊社论·半透罗马序号大标题',
    description: '底置超大淡雅罗马序号 + 错落叠压加粗主标 + 极简纯黑下划线',
    tags: ['大刊', '社论', '罗马序号', '叠压', '极简'],
    html: `<section style="margin: 36px 0 22px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-block; text-align: left; max-width: 100%; box-sizing: border-box;">
    <section style="line-height: 1; margin-bottom: -17px; margin-left: -1px;">
      <svg width="88" height="46" viewBox="0 0 88 46" style="display: block; overflow: visible;">
        <text x="0" y="43" fill="#cbd5e1" font-family="Georgia, 'Times New Roman', 'Songti SC', serif" font-size="58" font-weight="900" letter-spacing="-1">01</text>
      </svg>
    </section>
    <section style="position: relative; z-index: 2; border-bottom: 2.5px solid #0f172a; padding: 0 2px 6px 6px; line-height: 1.35;">
      <span style="font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 19.5px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; line-height: 1.35; display: inline-block; text-shadow: -1.5px -1.5px 0 #ffffff, 1.5px -1.5px 0 #ffffff, -1.5px 1.5px 0 #ffffff, 1.5px 1.5px 0 #ffffff, 0 -2px 5px rgba(255,255,255,0.95);">大刊社论·半透罗马序号大标题</span>
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
    html: `<section style="margin: 20px 0 20px 8px; border-left: 2px solid #3b82f6;" data-material="true">
  <section style="display: flex; align-items: flex-start; margin-bottom: 16px;">
    <svg width="14" height="14" viewBox="0 0 14 14" style="margin-left: -8px; margin-top: 3px; margin-right: 12px; flex-shrink: 0; display: block;"><circle cx="7" cy="7" r="5" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/></svg>
    <section style="flex: 1; min-width: 0;">
      <section style="font-size: 14px; font-weight: 700; color: #1e293b; word-break: break-word;">阶段一：架构重构与模块解耦</section>
      <section style="font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-word;">清理历史冗余代码，统一接口定义规范</section>
    </section>
  </section>
  <section style="display: flex; align-items: flex-start;">
    <svg width="14" height="14" viewBox="0 0 14 14" style="margin-left: -8px; margin-top: 3px; margin-right: 12px; flex-shrink: 0; display: block;"><circle cx="7" cy="7" r="5" fill="#10b981" stroke="#ffffff" stroke-width="2"/></svg>
    <section style="flex: 1; min-width: 0;">
      <section style="font-size: 14px; font-weight: 700; color: #1e293b; word-break: break-word;">阶段二：性能调优与容量提升</section>
      <section style="font-size: 13px; color: #64748b; margin-top: 2px; word-break: break-word;">引入二级缓存机制，QPS 提升 300%</section>
    </section>
  </section>
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
    tag: '文末互动',
    styleCategory: 'minimal',
    title: '文末互动引导',
    description: '简洁的点赞、在看与分享提示，适合文章结尾',
    tags: ['互动三连', '点赞在看', '精选爆款'],
    html: buildTripleLikeFooter()
  },
  {
    id: 'f-135-qrcode-card',
    category: 'footer_widgets',
    tag: '二维码关注卡',
    styleCategory: 'minimal',
    title: '公众号二维码卡',
    description: '简洁的公众号关注引导与二维码替换位',
    tags: ['关注卡片', '二维码', '精选爆款'],
    html: buildQrFollowFooter()
  },
  {
    id: 'f-author-cta',
    category: 'footer_widgets',
    tag: '作者介绍',
    styleCategory: 'minimal',
    title: '作者简介卡',
    description: '作者简介与公众号关注入口，适合作为文章署名',
    tags: ['关注卡片', '作者介绍', 'CTA'],
    html: buildAuthorFooter()
  },
  {
    id: "h-oriental-seal",
    category: "headings",
    tag: "国风水墨",
    styleCategory: "guofeng",
    title: "国风朱砂·双印章雅宋标题",
    description: "朱砂方印章章次 + 雅致宋体字标 + 渐变金石横线与祥云暗纹",
    tags: ["国风", "水墨", "印章", "宋体", "文学"],
    html: "<section style=\"margin: 28px 0 18px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"display: inline-table; vertical-align: middle; border-bottom: 2px solid #b91c1c; padding-bottom: 6px;\">\n    <section style=\"display: table-row;\">\n      <section style=\"display: table-cell; vertical-align: middle;\">\n        <section style=\"background: #b91c1c; color: #ffffff; font-family: 'Songti SC', 'SimSun', serif; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(185, 28, 28, 0.25); letter-spacing: 2px; display: inline-block;\">壹·章</section>\n      </section>\n      <section style=\"display: table-cell; vertical-align: middle; padding-left: 10px;\">\n        <span style=\"font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 19px; font-weight: 800; color: #1c1917; letter-spacing: 2px;\">水墨流转·文气自华</span>\n      </section>\n      <section style=\"display: table-cell; vertical-align: middle; padding-left: 6px;\">\n        <span style=\"color: #b91c1c; font-size: 16px;\">❖</span>\n      </section>\n    </section>\n  </section>\n</section>"
  },
  {
    id: "h-cyber-terminal",
    category: "headings",
    tag: "赛博极客",
    styleCategory: "tech",
    title: "极客赛博·终端发光命令标题",
    description: "深黑终端底色 + 霓虹亮青光标 + 命令行提示符与状态标识",
    tags: ["极客", "终端", "代码", "赛博", "命令行"],
    html: "<section style=\"margin: 28px 0 18px; clear: both;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; background: #0f172a; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);\">\n    <span style=\"color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; font-weight: 700; margin-right: 8px;\">❯_ [SEC_01]</span>\n    <span style=\"color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;\">高并发链路与架构基建</span>\n    <svg width=\"8\" height=\"14\" viewBox=\"0 0 8 14\" style=\"display: inline-block; vertical-align: middle; margin-left: 8px; flex-shrink: 0;\"><rect width=\"8\" height=\"14\" fill=\"#38bdf8\" fill-opacity=\"0.85\"/></svg>\n  </section>\n</section>"
  },
  {
    id: "h-handdrawn-pin",
    category: "headings",
    tag: "手账便签",
    styleCategory: "fresh",
    title: "手账手绘·立体图钉便签标题",
    description: "倾斜手写黄色标签 + 3D 红色图钉 + 荧光马克笔底色",
    tags: ["手账", "便签", "图钉", "手绘", "活泼"],
    html: "<section style=\"margin: 28px 0 18px; clear: both; text-align: left;\" data-material=\"true\">\n  <section style=\"display: inline-block; background: #fef08a; padding: 7px 18px 7px 14px; border-radius: 4px; box-shadow: 2px 3px 6px rgba(0,0,0,0.08); border-left: 4px solid #eab308;\">\n    <span style=\"font-size: 16px; margin-right: 6px;\">📌</span>\n    <span style=\"font-family: 'PingFang SC', -apple-system, sans-serif; font-size: 16px; font-weight: 800; color: #713f12; letter-spacing: 0.5px;\">今日灵感清单与实操笔记</span>\n  </section>\n</section>"
  },
  {
    id: "h-pill-duotone",
    category: "headings",
    tag: "现代双色",
    styleCategory: "business",
    title: "现代双色·渐变胶囊药丸标题",
    description: "深蓝主序号胶囊 + 天蓝浅底扩展条 + 纯白反差对亮点",
    tags: ["双色", "胶囊", "药丸", "现代", "清爽"],
    html: "<section style=\"margin: 28px 0 18px; clear: both;\" data-material=\"true\">\n  <section style=\"display: inline-flex; align-items: center; background: #eff6ff; border-radius: 9999px; padding: 3px 16px 3px 4px; border: 1px solid #bfdbfe;\">\n    <span style=\"background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);\">STEP 01</span>\n    <span style=\"font-size: 15px; font-weight: 700; color: #1e3a8a; margin-left: 10px; letter-spacing: 0.2px;\">系统环境初始化与脚手架搭建</span>\n  </section>\n</section>"
  },
  {
    id: "q-terminal-log",
    category: "quotes",
    tag: "极客终端",
    styleCategory: "tech",
    title: "终端命令输出引用框",
    description: "macOS 红黄绿三色原生按钮 + 暗色磨砂背景 + 极客哲学金句",
    tags: ["极客", "终端", "macOS", "代码", "金句"],
    html: "<section style=\"margin: 24px 0; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 8px 24px rgba(0,0,0,0.15);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; padding: 10px 14px; background: #1e293b; border-bottom: 1px solid #334155;\">\n    <svg width=\"46\" height=\"12\" viewBox=\"0 0 46 12\" style=\"display: block; flex-shrink: 0;\"><circle cx=\"6\" cy=\"6\" r=\"5\" fill=\"#ef4444\"/><circle cx=\"22\" cy=\"6\" r=\"5\" fill=\"#f59e0b\"/><circle cx=\"38\" cy=\"6\" r=\"5\" fill=\"#10b981\"/></svg>\n    <span style=\"margin: 0 auto; color: #94a3b8; font-size: 11px; font-family: monospace;\">bash — 80x24</span>\n  </div>\n  <div style=\"padding: 16px 20px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13.5px; line-height: 1.7; color: #e2e8f0;\">\n    <p style=\"color: #38bdf8; margin: 0 0 6px 0;\">$ cat core_philosophy.txt</p>\n    <p style=\"margin: 0; color: #f1f5f9; font-style: italic;\">“软件工程的本质不是制造复杂，而是在极度混乱的现实世界中建立清晰的抽象与秩序。”</p>\n    <p style=\"color: #64748b; font-size: 12px; margin: 8px 0 0 0; text-align: right;\">— 《Clean Code 架构思考》</p>\n  </div>\n</section>"
  },
  {
    id: "q-ancient-scroll",
    category: "quotes",
    tag: "古风宣纸",
    styleCategory: "guofeng",
    title: "古风典籍·宣纸朱砂双线古卷引用",
    description: "宣纸米黄底色 + 典雅回纹边框 + 朱砂红篆刻印章 + 典雅竖排风韵",
    tags: ["古风", "宣纸", "水墨", "金句", "国风"],
    html: "<section style=\"margin: 24px 0; padding: 22px 24px; background: #faf7f0; border: 2px solid #e7dfd1; border-radius: 8px; box-shadow: inset 0 0 12px rgba(217, 201, 179, 0.25);\" data-material=\"true\">\n  <div style=\"border: 1px dashed #c4b5a0; padding: 16px 20px; text-align: center;\">\n    <p style=\"font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 15.5px; line-height: 1.85; color: #451a03; margin: 0; letter-spacing: 1.5px; font-weight: 500;\">\n      “博学之，审问之，慎思之，明辨之，笃行之。天下之事，闻之不若见之，见之不若知之，知之不若行之。”\n    </p>\n    <div style=\"margin-top: 12px; font-size: 12px; color: #b91c1c; font-weight: 700; letter-spacing: 2px;\">\n      【 儒林·礼记中庸 】\n    </div>\n  </div>\n</section>"
  },
  {
    id: "q-magazine-bigquote",
    category: "quotes",
    tag: "大刊金句",
    styleCategory: "minimal",
    title: "大刊双引号·巨型流光大字符金句",
    description: "左上角 72px 浅蓝半透立体大双引号 + 斜体精致社论观点排版",
    tags: ["大刊", "双引号", "名言", "杂志", "高级"],
    html: "<section style=\"margin: 28px 0; padding: 18px 28px 22px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 0 12px 12px 0; box-sizing: border-box;\" data-material=\"true\">\n  <section style=\"line-height: 1; margin-bottom: -24px; margin-left: -4px;\">\n    <svg width=\"42\" height=\"34\" viewBox=\"0 0 42 34\" style=\"display: block; overflow: visible;\"><text x=\"0\" y=\"36\" fill=\"#cbd5e1\" fill-opacity=\"0.65\" font-family=\"Georgia, serif\" font-size=\"60\" font-weight=\"900\">“</text></svg>\n  </section>\n  <p style=\"position: relative; z-index: 2; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', serif; font-size: 15.5px; font-weight: 600; line-height: 1.75; color: #1e293b; font-style: italic;\">\n    真正优秀的设计不是把所有东西堆砌完整，而是直到没有任何一件多余的东西可以再被拿走。\n  </p>\n  <div style=\"margin-top: 10px; text-align: right; font-size: 12.5px; color: #64748b; font-weight: 700;\">\n    — 安托万·德·圣-埃克苏佩里\n  </div>\n</section>"
  },
  {
    id: "q-highlighter-marker",
    category: "quotes",
    tag: "荧光涂抹",
    styleCategory: "fresh",
    title: "手绘荧光·胶带纸荧光笔涂抹金句",
    description: "荧光黄手绘高亮背景 + 倾斜半透胶带纸固定 + 亲和力手写便签感",
    tags: ["荧光笔", "胶带", "手绘", "便签", "金句"],
    html: "<section style=\"margin: 26px 0; padding: 20px 22px; background: #fffdf5; border: 1px solid #fef08a; border-radius: 6px; box-shadow: 2px 4px 12px rgba(234, 179, 8, 0.08); box-sizing: border-box;\" data-material=\"true\">\n  <section style=\"text-align: center; line-height: 1; margin-top: -28px; margin-bottom: 10px;\">\n    <svg width=\"68\" height=\"20\" viewBox=\"0 0 68 20\" style=\"display: inline-block; vertical-align: top; overflow: visible;\"><g transform=\"rotate(-1.5 34 10)\"><rect x=\"2\" y=\"2\" width=\"64\" height=\"16\" rx=\"2\" fill=\"#fde047\" fill-opacity=\"0.65\"/></g></svg>\n  </section>\n  <p style=\"margin: 0; font-size: 15px; line-height: 1.8; color: #713f12; font-weight: 600;\">\n    <span style=\"background: linear-gradient(180deg, transparent 60%, #fef08a 60%); padding: 0 4px;\">\n      保持对未知的好奇，把每一次挑战当成认知的升级。做长期有价值的事，时间会成为最坚固的盟友。\n    </span>\n  </p>\n</section>"
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
    html: "<section style=\"margin: 24px 0; padding: 18px 22px; background: #fef9c3; border-radius: 8px 0 8px 8px; border: 1px solid #fde047; box-shadow: 3px 5px 15px rgba(0,0,0,0.06); box-sizing: border-box;\" data-material=\"true\">\n  <section style=\"display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;\">\n    <span style=\"font-size: 14px; font-weight: 700; color: #854d0e;\">📝 备忘速记 / Quick Memo</span>\n    <svg width=\"22\" height=\"22\" viewBox=\"0 0 22 22\" style=\"margin-top: -19px; margin-right: -23px; flex-shrink: 0; display: block;\"><polygon points=\"0,0 22,22 0,22\" fill=\"#facc15\"/><polygon points=\"0,0 22,0 22,22\" fill=\"#ffffff\"/></svg>\n  </section>\n  <div style=\"font-size: 13.5px; color: #713f12; line-height: 1.65;\">\n    记得在文章结尾附上互动问答与投票组件，可大幅提升粉丝在公众号底部的留言互动率与在看转化。\n  </div>\n</section>"
  },
  {
    id: "c-metric-kpi-card",
    category: "callouts",
    tag: "数据看板",
    styleCategory: "business",
    title: "核心指标·大厂成果数据看板卡",
    description: "3 列核心业务指标大数字 + 增长百分比 + 结构化对比",
    tags: ["数据", "看板", "指标", "KPI", "增长"],
    html: "<section style=\"margin: 24px 0; padding: 18px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; gap: 10px; text-align: center; box-sizing: border-box;\" data-material=\"true\">\n  <section style=\"flex: 1; min-width: 0; padding: 10px 6px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">全网总阅读</div>\n    <div style=\"font-size: 19px; font-weight: 800; color: #2563eb; margin: 4px 0;\">120W+</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">↑ 35% 同比增长</div>\n  </section>\n  <section style=\"flex: 1; min-width: 0; padding: 10px 6px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">分发耗时</div>\n    <div style=\"font-size: 19px; font-weight: 800; color: #0f172a; margin: 4px 0;\">3.2s</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">⚡ 效率提升 10x</div>\n  </section>\n  <section style=\"flex: 1; min-width: 0; padding: 10px 6px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);\">\n    <div style=\"font-size: 11px; color: #64748b; font-weight: 600;\">粉丝留存率</div>\n    <div style=\"font-size: 19px; font-weight: 800; color: #7c3aed; margin: 4px 0;\">94.8%</div>\n    <div style=\"font-size: 10px; color: #16a34a; font-weight: 600;\">★ 行业顶尖</div>\n  </section>\n</section>"
  },
  {
    id: "l-timeline-milestone",
    category: "lists",
    tag: "时间轴",
    styleCategory: "business",
    title: "彩色时间轴·大事记里程碑流程",
    description: "纵向连线时间轴 + 彩色阶梯节点 + 卡片式事件演进",
    tags: ["时间轴", "里程碑", "步骤", "发展历程", "节点"],
    html: "<section style=\"margin: 26px 0; padding: 10px 4px 10px 10px;\" data-material=\"true\">\n  <section style=\"display: flex; align-items: flex-start; border-left: 2px dashed #93c5fd; padding-bottom: 20px;\">\n    <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" style=\"margin-left: -9px; margin-top: 1px; margin-right: 14px; flex-shrink: 0; display: block;\"><circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"#2563eb\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>\n    <section style=\"flex: 1; min-width: 0;\">\n      <div style=\"font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase;\">阶段一 · 需求洞察与立项</div>\n      <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">完成行业竞品深度调研与用户痛点画像建模，确定核心功能矩阵。</div>\n    </section>\n  </section>\n  <section style=\"display: flex; align-items: flex-start; border-left: 2px dashed #93c5fd; padding-bottom: 20px;\">\n    <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" style=\"margin-left: -9px; margin-top: 1px; margin-right: 14px; flex-shrink: 0; display: block;\"><circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"#0284c7\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>\n    <section style=\"flex: 1; min-width: 0;\">\n      <div style=\"font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase;\">阶段二 · 核心引擎敏捷迭代</div>\n      <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">搭建自研 AST 语法树解析器与微信专用富文本样式渲染引擎。</div>\n    </section>\n  </section>\n  <section style=\"display: flex; align-items: flex-start;\">\n    <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" style=\"margin-left: -7px; margin-top: 1px; margin-right: 14px; flex-shrink: 0; display: block;\"><circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"#16a34a\" stroke=\"#ffffff\" stroke-width=\"2\"/></svg>\n    <section style=\"flex: 1; min-width: 0;\">\n      <div style=\"font-size: 12px; font-weight: 800; color: #16a34a; text-transform: uppercase;\">阶段三 · 全网公测与商业化发布</div>\n      <div style=\"font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;\">接入微信公众号、知乎、掘金一键多渠道分发网关，服务 10w+ 创作者。</div>\n    </section>\n  </section>\n</section>"
  },
  {
    id: "l-task-checklist",
    category: "lists",
    tag: "任务清单",
    styleCategory: "fresh",
    title: "极简方格·任务待办清单",
    description: "Notion 风格方形复选框 + 已完成与未完成对照清单",
    tags: ["清单", "Checklist", "待办", "Notion", "任务"],
    html: "<section style=\"margin: 22px 0; padding: 18px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);\" data-material=\"true\">\n  <div style=\"font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;\">📋 发布前自查清单 (Pre-flight Checklist)</div>\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 8px;\">\n    <span style=\"width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0;\">✓</span>\n    <span style=\"font-size: 13.5px; color: #64748b; text-decoration: line-through;\">检查文章首图与封面比例是否为 2.35:1 官方规范</span>\n  </div>\n  <div style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 8px;\">\n    <span style=\"width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0;\">✓</span>\n    <span style=\"font-size: 13.5px; color: #64748b; text-decoration: line-through;\">校对代码块中关键字高亮与中英文空格规范</span>\n  </div>\n  <div style=\"display: flex; align-items: center; gap: 10px;\">\n    <svg width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" style=\"flex-shrink: 0; display: inline-block;\"><rect x=\"1\" y=\"1\" width=\"16\" height=\"16\" rx=\"4\" fill=\"none\" stroke=\"#cbd5e1\" stroke-width=\"2\"/></svg>\n    <span style=\"font-size: 13.5px; color: #1e293b; font-weight: 600;\">一键同步多平台分发并配置原创声明标签</span>\n  </div>\n</section>"
  },
  {
    id: "l-pros-cons-grid",
    category: "lists",
    tag: "红蓝对比",
    styleCategory: "minimal",
    title: "红蓝对比·优缺点左右卡",
    description: "左侧翠绿优势清单 vs 右侧珊瑚红劣势清单对比",
    tags: ["对比", "优缺点", "Pros", "Cons", "选型"],
    html: "<section style=\"margin: 24px 0; display: flex; gap: 12px; box-sizing: border-box;\" data-material=\"true\">\n  <section style=\"flex: 1; min-width: 0; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; box-sizing: border-box;\">\n    <div style=\"font-size: 13.5px; font-weight: 800; color: #166534; margin-bottom: 8px;\">✅ 核心优势 (Pros)</div>\n    <ul style=\"margin: 0; padding-left: 16px; font-size: 12.5px; color: #14532d; line-height: 1.7;\">\n      <li>毫秒级热重载排版渲染</li>\n      <li>全自动同步至微信公众号</li>\n      <li>支持自定义 CSS 深度定制</li>\n    </ul>\n  </section>\n  <section style=\"flex: 1; min-width: 0; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; box-sizing: border-box;\">\n    <div style=\"font-size: 13.5px; font-weight: 800; color: #991b1b; margin-bottom: 8px;\">⚠️ 潜在局限 (Cons)</div>\n    <ul style=\"margin: 0; padding-left: 16px; font-size: 12.5px; color: #7f1d1d; line-height: 1.7;\">\n      <li>需要一定 Markdown 语法基础</li>\n      <li>部分小众平台授权有效期受限</li>\n    </ul>\n  </section>\n</section>"
  },
  {
    id: "tech-macos-window",
    category: "tech_cards",
    tag: "系统终端",
    styleCategory: "tech",
    title: "系统终端·代码展示窗口",
    description: "macOS 经典红黄绿三色控制圆点 + 深曜石代码框",
    tags: ["代码", "macOS", "终端", "开发", "极客"],
    html: "<section style=\"margin: 24px 0; background: #1e1e24; border-radius: 10px; overflow: hidden; border: 1px solid #2d2d38; box-shadow: 0 8px 24px rgba(0,0,0,0.18);\" data-material=\"true\">\n  <div style=\"display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #26262e;\">\n    <svg width=\"46\" height=\"12\" viewBox=\"0 0 46 12\" style=\"display: block; flex-shrink: 0;\"><circle cx=\"6\" cy=\"6\" r=\"5\" fill=\"#ff5f56\"/><circle cx=\"22\" cy=\"6\" r=\"5\" fill=\"#ffbd2e\"/><circle cx=\"38\" cy=\"6\" r=\"5\" fill=\"#27c93f\"/></svg>\n    <span style=\"color: #94a3b8; font-size: 11px; font-family: monospace;\">ServerEngine.ts</span>\n    <span style=\"color: #64748b; font-size: 11px; font-family: monospace;\">TypeScript</span>\n  </div>\n  <pre style=\"margin: 0; padding: 16px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #f8fafc; overflow-x: auto; background: transparent;\"><code style=\"color:#f8fafc;\"><span style=\"color:#c678dd;\">export async function</span> <span style=\"color:#61afef;\">publishArticle</span>(doc: <span style=\"color:#e5c07b;\">ArticlePayload</span>) {\n  <span style=\"color:#5c6370;font-style:italic;\">// 一键并行分发至全渠道</span>\n  <span style=\"color:#c678dd;\">const</span> res = <span style=\"color:#c678dd;\">await</span> <span style=\"color:#e5c07b;\">Promise</span>.<span style=\"color:#61afef;\">all</span>([\n    <span style=\"color:#61afef;\">syncToWeChat</span>(doc),\n    <span style=\"color:#61afef;\">syncToZhihu</span>(doc)\n  ]);\n  <span style=\"color:#c678dd;\">return</span> { <span style=\"color:#e06c75;\">success</span>: <span style=\"color:#d19a66;\">true</span>, <span style=\"color:#e06c75;\">data</span>: res };\n}</code></pre>\n</section>"
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
  // ── 下划线精选素材 (Underlines / U 文本修饰) ──
  {
    id: "u-amber-cream",
    category: "underlines",
    tag: "暖阳微光",
    styleCategory: "fresh",
    title: "暖阳米黄·柔和荧光马克笔",
    description: "135爆款暖阳米黄微底衬，温润舒适，重点标注第一推荐",
    tags: ["下划线", "暖阳", "米黄", "马克笔", "低饱和", "重点"],
    html: `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(254, 240, 138, 0.75) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">暖阳米黄柔和划重点</u>`
  },
  {
    id: "u-sage-green",
    category: "underlines",
    tag: "莫兰迪绿",
    styleCategory: "fresh",
    title: "鼠尾草绿·低饱和清新微衬",
    description: "莫兰迪低饱和鼠尾草浅绿，护眼文艺，干货科普首选",
    tags: ["下划线", "鼠尾草绿", "莫兰迪", "清新", "护眼", "干货"],
    html: `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(209, 250, 229, 0.8) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">鼠尾草绿清新划重点</u>`
  },
  {
    id: "u-morandi-blue",
    category: "underlines",
    tag: "极简双轨",
    styleCategory: "tech",
    title: "雾霾灰蓝·极简双轨科技线",
    description: "莫兰迪雾霾灰蓝双层细线，克制严谨，科技与职场必备",
    tags: ["下划线", "双轨", "灰蓝", "莫兰迪", "科技", "极简"],
    html: `<u style="text-decoration: none; border-bottom: 3px double #64748b; padding-bottom: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">雾霾灰蓝双轨科技线</u>`
  },
  {
    id: "u-kraft-coffee",
    category: "underlines",
    tag: "复古暖咖",
    styleCategory: "minimal",
    title: "复古暖咖·牛皮纸质感微衬",
    description: "复古牛皮纸暖咖底衬 + 雅致细线，人文阅读与生活志质感",
    tags: ["下划线", "暖咖", "牛皮纸", "复古", "质感", "人文"],
    html: `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 60%, rgba(245, 230, 211, 0.9) 60%); border-bottom: 1.5px solid #a87d51; padding: 0 4px 2px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">复古暖咖牛皮纸微衬</u>`
  },
  {
    id: "u-slate-wavy",
    category: "underlines",
    tag: "手绘波浪",
    styleCategory: "minimal",
    title: "低调炭灰·手绘波浪细线",
    description: "壹伴同款低饱和炭灰手绘波浪线，不突兀，轻盈灵动",
    tags: ["下划线", "波浪", "炭灰", "手绘", "低饱和", "极简"],
    html: `<u style="text-decoration: underline wavy rgba(71, 85, 105, 0.75); text-underline-offset: 4px; text-decoration-thickness: 1.2px; color: inherit; font-weight: 600; display: inline;" data-material="true">低调炭灰手绘波浪强调</u>`
  },
  {
    id: "u-apricot-wavy",
    category: "underlines",
    tag: "温润暖杏",
    styleCategory: "fresh",
    title: "温润暖杏·柔和手绘波浪",
    description: "暖杏橙黄波浪细线，温暖亲切，小红书与情感文首选",
    tags: ["下划线", "暖杏", "波浪", "温暖", "小红书", "生活"],
    html: `<u style="text-decoration: underline wavy #f97316; text-underline-offset: 4px; text-decoration-thickness: 1.2px; color: inherit; font-weight: 600; display: inline;" data-material="true">温润暖杏柔和波浪强调</u>`
  },
  {
    id: "u-green-wavy",
    category: "underlines",
    tag: "翠绿大波浪",
    styleCategory: "fresh",
    title: "青翠生机·大波浪绿色细线",
    description: "135/壹伴爆款清新大波浪绿色细线，舒展灵动，护眼活泼",
    tags: ["下划线", "大波浪", "绿色", "细线", "清新", "手绘", "护眼"],
    html: `<u style="text-decoration: underline wavy #10b981; text-underline-offset: 5px; text-decoration-thickness: 1.5px; color: inherit; font-weight: 600; display: inline;" data-material="true">青翠生机大波浪绿色细线</u>`
  },
  {
    id: "u-editorial-minimal",
    category: "underlines",
    tag: "杂志大刊",
    styleCategory: "minimal",
    title: "大刊社论·1.5px精致沉静底线",
    description: "纽约客/GQ杂志社论风 1.5px 纯净炭黑悬浮细线，极简高端",
    tags: ["下划线", "大刊", "杂志", "极简", "沉静", "高端"],
    html: `<u style="text-decoration: none; border-bottom: 1.5px solid #1e293b; padding-bottom: 2px; color: inherit; font-weight: 700; display: inline;" data-material="true">大刊社论沉静极简底线</u>`
  },
  {
    id: "u-notion-pill",
    category: "underlines",
    tag: "Notion风",
    styleCategory: "minimal",
    title: "晨雾浅灰·Notion极简胶囊底衬",
    description: "Notion风格浅灰胶囊微衬 + 极细底边，结构清晰现代",
    tags: ["下划线", "Notion", "胶囊", "浅灰", "极简", "现代"],
    html: `<u style="text-decoration: none; background: rgba(241, 245, 249, 0.95); border-bottom: 2px solid #cbd5e1; padding: 2px 6px 3px; border-radius: 4px; color: #1e293b; font-weight: 600; display: inline;" data-material="true">Notion极简胶囊高亮</u>`
  },
  {
    id: "u-fine-dotted",
    category: "underlines",
    tag: "点阵印线",
    styleCategory: "minimal",
    title: "复古印品·细密微墨点阵线",
    description: "1.5px 极细点阵墨滴印线，细腻精致，极具书籍印刷质感",
    tags: ["下划线", "点阵", "印品", "虚线", "复古", "墨滴"],
    html: `<u style="text-decoration: none; border-bottom: 1.5px dotted #64748b; padding-bottom: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">复古书籍细密微墨点阵</u>`
  },
  {
    id: "u-indigo-silk",
    category: "underlines",
    tag: "国风雅致",
    styleCategory: "guofeng",
    title: "沉香藏青·国风雅致宋韵细线",
    description: "沉香藏青雅致细线 + 典雅宋体加粗，古雅沉稳，文化气息浓厚",
    tags: ["下划线", "国风", "藏青", "宋韵", "雅致", "水墨"],
    html: `<u style="text-decoration: none; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 2px; color: #1e3a8a; font-weight: 700; font-family: 'Songti SC', SimSun, serif; display: inline;" data-material="true">沉香藏青宋韵雅致下划线</u>`
  },
  {
    id: "u-terracotta-dash",
    category: "underlines",
    tag: "陶土大地",
    styleCategory: "minimal",
    title: "陶土赭石·手绘断点虚线",
    description: "低饱和陶土暖赭色断点虚线，大地色系，质朴温暖",
    tags: ["下划线", "陶土", "大地色", "虚线", "赭石", "质朴"],
    html: `<u style="text-decoration: none; border-bottom: 2px dashed #b45309; padding-bottom: 2px; color: #92400e; font-weight: 600; display: inline;" data-material="true">陶土暖赭手绘断点虚线</u>`
  },
  {
    id: "u-vintage-gold",
    category: "underlines",
    tag: "黑金轻奢",
    styleCategory: "business",
    title: "黑金工坊·暖琥珀双轨轻奢线",
    description: "暖琥珀双轨细线条，低调奢华，高端商业排版品质",
    tags: ["下划线", "黑金", "轻奢", "琥珀", "双轨", "高端"],
    html: `<u style="text-decoration: none; border-bottom: 3px double #b45309; padding-bottom: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">暖琥珀双轨轻奢下划线</u>`
  },
  {
    id: "u-ink-tint",
    category: "underlines",
    tag: "水墨清透",
    styleCategory: "guofeng",
    title: "水墨微澜·极简渐变水墨底托",
    description: "水墨微渐变柔和底衬 + 沉水青蓝底线，东方意境，文雅清透",
    tags: ["下划线", "水墨", "国风", "渐变", "意境", "文雅"],
    html: `<u style="text-decoration: none; background: linear-gradient(90deg, rgba(30, 41, 59, 0.08) 0%, rgba(30, 41, 59, 0.02) 100%); border-bottom: 2px solid #475569; padding: 2px 6px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">水墨微澜渐变水墨底托</u>`
  },
  {
    id: "u-ice-mist",
    category: "underlines",
    tag: "冰雾浅蓝",
    styleCategory: "tech",
    title: "极地冰雾·浅蓝半透微底衬",
    description: "极浅海盐冰蓝微底衬，现代科技冷静感，清新通透",
    tags: ["下划线", "浅蓝", "冰雾", "科技", "通透", "清新"],
    html: `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(186, 230, 253, 0.65) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">极地冰雾清透微底衬</u>`
  },
  {
    id: "u-blush-rose",
    category: "underlines",
    tag: "莫兰迪粉",
    styleCategory: "fresh",
    title: "莫兰迪粉·温柔晚风浅底衬",
    description: "莫兰迪低饱和灰粉微底衬，温柔治愈，美妆女性生活首选",
    tags: ["下划线", "莫兰迪", "灰粉", "温柔", "美妆", "女性"],
    html: `<u style="text-decoration: none; background: linear-gradient(180deg, transparent 58%, rgba(251, 207, 232, 0.65) 58%); padding: 0 4px 1px; border-radius: 2px; color: inherit; font-weight: 600; display: inline;" data-material="true">莫兰迪灰粉温柔微底衬</u>`
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
    id: "d-wave-marker-yellow",
    category: "dividers",
    tag: "荧光波浪",
    styleCategory: "fresh",
    title: "荧光手绘·暖黄波浪马克线",
    description: "明亮活泼的手绘马克笔双波浪线条，适合段落章节优雅过渡",
    tags: ["分割线", "荧光", "手绘", "波浪", "马克笔", "清新"],
    html: `<section style="margin: 28px auto; text-align: center; width: 100%; clear: both;" data-material="true">
  <svg width="220" height="14" viewBox="0 0 220 14" fill="none" style="display: block; margin: 0 auto; max-width: 100%; overflow: visible;">
    <path d="M 2 7 Q 15 1, 30 7 T 60 7 T 90 7 T 120 7 T 150 7 T 180 7 T 210 7 T 218 7" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
  </svg>
</section>`
  },
  {
    id: "d-cyber-neon-pulse",
    category: "dividers",
    tag: "赛博极客",
    styleCategory: "tech",
    title: "极客赛博·霓虹渐变脉冲光线",
    description: "双向渐变青蓝光轨 + 居中发光晶体命令符 ◈ [SYSTEM_BREAK] ◈",
    tags: ["分割线", "极客", "赛博", "霓虹", "脉冲", "科技"],
    html: `<section style="margin: 30px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1.5px; background: linear-gradient(90deg, transparent, #38bdf8);"></div>
  <span style="color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; font-weight: bold; letter-spacing: 1.5px;">◈ [SYSTEM_BREAK] ◈</span>
  <div style="flex: 1; height: 1.5px; background: linear-gradient(90deg, #38bdf8, transparent);"></div>
</section>`
  },
  {
    id: "d-guofeng-cloud-knot",
    category: "dividers",
    tag: "国风水墨",
    styleCategory: "guofeng",
    title: "国风水墨·朱砂双线祥云如意线",
    description: "朱砂红双重纤细平直线 + 居中古雅朱红 ❖ 祥云文气纹样",
    tags: ["分割线", "国风", "水墨", "朱砂", "古风", "祥云"],
    html: `<section style="margin: 30px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #b91c1c);"></div>
  <span style="color: #b91c1c; font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 13.5px; letter-spacing: 3px; font-weight: 600;">❖ 雲水流轉 ❖</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #b91c1c, transparent);"></div>
</section>`
  },
  {
    id: "d-editorial-double-rail",
    category: "dividers",
    tag: "杂志社论",
    styleCategory: "minimal",
    title: "大刊社论·纯黑双轨几何极简线",
    description: "经典大刊双轨线（3px 纯黑实线 + 1px 细线），充满呼吸感与留白",
    tags: ["分割线", "杂志", "社论", "极简", "双轨", "黑白"],
    html: `<section style="margin: 32px 0; width: 100%; clear: both;" data-material="true">
  <div style="height: 3px; background: #0a0a0a; margin-bottom: 3px; width: 100%;"></div>
  <div style="height: 1px; background: #0a0a0a; width: 100%;"></div>
</section>`
  },
  {
    id: "d-leaf-sprout-green",
    category: "dividers",
    tag: "小清新",
    styleCategory: "fresh",
    title: "清新草木·嫩绿晨露小树叶线",
    description: "双侧柔和浅绿渐变细线 + 居中清新绿植萌芽 🌱 🌿 🍃 呼吸点缀",
    tags: ["分割线", "草木", "绿叶", "清新", "自然", "萌芽"],
    html: `<section style="margin: 28px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #86efac);"></div>
  <span style="font-size: 16px; line-height: 1;">🌿 🌱 🍃</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #86efac, transparent);"></div>
</section>`
  },
  {
    id: "d-golden-gradient-lux",
    category: "dividers",
    tag: "黑金轻奢",
    styleCategory: "business",
    title: "极简黑金·鎏金微光四芒星线",
    description: "从透明向暖金辉光过渡的细腻渐变光束 + 居中精致四芒星 ✧",
    tags: ["分割线", "黑金", "轻奢", "四芒星", "金色", "渐变"],
    html: `<section style="margin: 32px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #f59e0b 50%, #d97706 100%);"></div>
  <span style="color: #d97706; font-size: 15px; font-weight: bold;">✧</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #d97706 0%, #f59e0b 50%, transparent 100%);"></div>
</section>`
  },
  {
    id: "d-stamp-ticket-tear",
    category: "dividers",
    tag: "手账便签",
    styleCategory: "fresh",
    title: "手账撕票·双孔锯齿撕裂虚线",
    description: "左右打孔圆角 + 细密票据撕裂虚线，手账与活动优惠感十足",
    tags: ["分割线", "手账", "撕票", "锯齿", "虚线", "优惠券"],
    html: `<section style="margin: 28px auto; width: 100%; display: flex; align-items: center; gap: 6px; clear: both;" data-material="true">
  <span style="width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; display: inline-block; flex-shrink: 0;"></span>
  <div style="flex: 1; border-top: 1.5px dashed #cbd5e1; height: 0;"></div>
  <span style="width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; display: inline-block; flex-shrink: 0;"></span>
</section>`
  },
  {
    id: "d-rhombus-morandi",
    category: "dividers",
    tag: "莫兰迪",
    styleCategory: "minimal",
    title: "莫兰迪·低饱和双菱形雅致微线",
    description: "低饱和度豆沙灰绿对称微细线 + 居中对称双实心菱形 ◆ ◆",
    tags: ["分割线", "莫兰迪", "菱形", "极简", "雅致", "高级感"],
    html: `<section style="margin: 28px auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; clear: both;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #a3b18a);"></div>
  <span style="color: #588157; font-size: 11px; letter-spacing: 2px;">◆ ◆</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #a3b18a, transparent);"></div>
</section>`
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
    tag: "多平台关注",
    styleCategory: "minimal",
    title: "多平台关注引导",
    description: "用简洁文字列出公众号、知乎、掘金与 GitHub",
    tags: ["文末", "关注", "社交矩阵", "微信", "知乎", "掘金"],
    html: buildSocialMatrixFooter()
  }
];
