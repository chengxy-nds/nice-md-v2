/**
 * WeChat Preset Styling Material Library
 * Contains rich HTML & Markdown inline styled materials for WeChat publishing.
 */

export const materialCategories = [
  { id: 'all', name: '全部素材' },
  { id: 'headings', name: '标题样式' },
  { id: 'quotes', name: '引用/金句' },
  { id: 'callouts', name: '提示/警示框' },
  { id: 'dividers', name: '分割线' },
  { id: 'lists', name: '列表/步骤' },
  { id: 'footer', name: '关注/引导卡片' }
];

export const materials = [
  // ── 标题样式 ──
  {
    id: 'h-yiban-01',
    category: 'headings',
    title: '壹伴 01 大字圆圈序号标题',
    description: '经典实心色块数字圆圈 + 粗体标题，适合多步骤或论点拆解。',
    tags: ['壹伴风', '序号标题', '蓝色'],
    html: `<section style="margin: 28px 0 16px; display: flex; align-items: center;">
  <span style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 800; width: 32px; height: 32px; line-height: 32px; text-align: center; border-radius: 50%; margin-right: 10px; box-shadow: 0 4px 10px rgba(37,99,235,0.3); flex-shrink: 0;">01</span>
  <span style="font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px;">避免用战术上的勤奋，掩盖战略上的懒惰</span>
</section>`
  },
  {
    id: 'h-bar-emerald',
    category: 'headings',
    title: '极简翡翠绿包边标题',
    description: '带有柔和绿底色与左边框修饰，清新耐看，适合生活与技术感文章。',
    tags: ['包边标题', '绿色', '极简'],
    html: `<section style="margin: 24px 0 14px; padding: 7px 14px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0;">
  <span style="font-size: 16.5px; font-weight: 700; color: #065f46;">构建持续交付的自动化 SOP</span>
</section>`
  },
  {
    id: 'h-center-line',
    category: 'headings',
    title: '经典双划线居中标题',
    description: '带有左右虚线/实线装饰的居中标题，适合章节分隔或总结。',
    tags: ['居中标题', '修饰线', '总结'],
    html: `<section style="text-align: center; margin: 30px 0 16px;">
  <span style="color: #cbd5e1; margin: 0 12px;">───</span>
  <span style="font-size: 16px; font-weight: 700; color: #0f172a; padding: 4px 14px; background: #f1f5f9; border-radius: 20px;">核心视角与复盘</span>
  <span style="color: #cbd5e1; margin: 0 12px;">───</span>
</section>`
  },
  {
    id: 'h-pill-purple',
    category: 'headings',
    title: '紫色高亮胶囊徽章标题',
    description: '全包合圆角高亮底色标题，非常显眼，适合重要章节强调。',
    tags: ['胶囊标题', '紫色', '醒目'],
    html: `<section style="margin: 28px 0 16px; text-align: center;">
  <span style="display: inline-block; padding: 6px 20px; background: #7c3aed; color: #ffffff; font-size: 16px; font-weight: 700; border-radius: 30px; box-shadow: 0 4px 12px rgba(124,58,237,0.25);">
    🚀 阶段二：系统高性能改造与调优
  </span>
</section>`
  },
  {
    id: 'h-double-border',
    category: 'headings',
    title: '双重深色边框衬底标题',
    description: '沉稳黑灰底线标题，适合技术架构与严肃职场报告。',
    tags: ['技术风', '黑灰', '沉稳'],
    html: `<section style="margin: 26px 0 14px; padding-bottom: 6px; border-bottom: 2px solid #1e293b;">
  <span style="font-size: 18px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: -2px; display: inline-block;">
    1. 分布式锁与最终一致性设计
  </span>
</section>`
  },

  // ── 引用/金句 ──
  {
    id: 'q-golden-quote',
    category: 'quotes',
    title: '壹伴金句双引号高亮框',
    description: '包含优雅的双引号符号与微阴影圆角边框，适合名言或观点金句。',
    tags: ['金句框', '引号', '名言'],
    html: `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8;">
  <span style="font-size: 26px; color: #2563eb; font-family: Georgia, serif; line-height: 1;">“</span>
  能力增长并不是斜率不变的直线，而是呈现指数级上升的复利曲线。认准方向并持续做对的事，时间会给努力的人最好的答复。
  <span style="font-size: 26px; color: #2563eb; font-family: Georgia, serif; line-height: 1;">”</span>
</blockquote>`
  },
  {
    id: 'q-gradient-bar',
    category: 'quotes',
    title: '渐变侧条优雅引用',
    description: '左侧采用高质感 Blue-Indigo 渐变粗边条，文字柔和清晰。',
    tags: ['渐变边条', '高颜值', '经典'],
    html: `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75;">
  <strong>💡 导读摘要：</strong> 真正的高手，都在用“杠杆思维”做选择，而不是在低水平的重复劳动中自我感动。
</blockquote>`
  },
  {
    id: 'q-dark-slate',
    category: 'quotes',
    title: '深灰极简修饰框',
    description: '深色纸面感引用框，极简而有高级感，适合极简阅读风格。',
    tags: ['极简', '暗色', '冷峻'],
    html: `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
  📌 <strong>架构法则：</strong> 不要为了设计而设计。好的架构是在业务交付速度与系统可维护性之间找到最佳平衡点。
</blockquote>`
  },

  // ── 提示/警示框 ──
  {
    id: 'c-note-blue',
    category: 'callouts',
    title: '💡 蓝色 Note 提示卡片',
    description: '柔和浅蓝背景 + 💡 图标 header，用于提示补充说明或技巧。',
    tags: ['提示卡片', '蓝色', 'Note'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">💡 温馨提示：</strong>
  在日常工作中，尽量把重复性任务沉淀为标准 SOP 或脚本工具，从而释放精力投入核心思考。
</section>`
  },
  {
    id: 'c-warning-red',
    category: 'callouts',
    title: '⚠️ 红色 Warning 警告卡片',
    description: '淡红背景 + ⚠️ 图标，用于醒目标注注意事项或易错踩坑点。',
    tags: ['警告卡片', '红色', 'Warning'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">⚠️ 注意事项：</strong>
  切勿直接在主线程中执行耗时的 I/O 操作，否则会导致 UI 卡顿与界面无响应。
</section>`
  },
  {
    id: 'c-success-green',
    category: 'callouts',
    title: '✅ 绿色 Success 成功/推荐卡片',
    description: '淡绿背景 + ✅ 图标，用于展示成功落地效果或官方推荐。',
    tags: ['成功卡片', '绿色', 'Success'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">✅ 推荐方案：</strong>
  推荐采用同城双活 + 异地多活部署架构，确保单机房故障时服务零中断。
</section>`
  },
  {
    id: 'c-important-purple',
    category: 'callouts',
    title: '📌 紫色 Important 核心要点卡片',
    description: '浅紫背景 + 📌 图标，适合重点复习或核心结论输出。',
    tags: ['要点卡片', '紫色', 'Important'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #f3e8ff; border-left: 4px solid #a855f7; border-radius: 0 8px 8px 0; color: #6b21a8; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">📌 核心结论：</strong>
  三级缓存的核心痛点是为了延迟生成 AOP 代理对象，而不是解决普通的循环依赖。
</section>`
  },

  // ── 分割线 ──
  {
    id: 'd-dots',
    category: 'dividers',
    title: '三点星光居中分割线',
    description: '居中修饰三个优雅圆点，适合段落与大章节切分。',
    tags: ['点状', '居中', '优雅'],
    html: `<div style="text-align: center; margin: 30px 0; color: #cbd5e1; font-size: 18px; letter-spacing: 12px;">• • •</div>`
  },
  {
    id: 'd-dashed-blue',
    category: 'dividers',
    title: '蓝色淡雅虚线分割线',
    description: '轻盈的虚线分割线，给文章留出呼吸空间。',
    tags: ['虚线', '蓝色', '淡雅'],
    html: `<hr style="border: none; border-top: 2px dashed #93c5fd; margin: 28px 0;" />`
  },
  {
    id: 'd-text-divider',
    category: 'dividers',
    title: '文字居中分割线',
    description: '包含两端线段与居中英文字符的分割栏。',
    tags: ['文字分割线', '居中'],
    html: `<section style="display: flex; align-items: center; margin: 32px 0; color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
  <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
  <span style="padding: 0 16px;">END OF SECTION</span>
  <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
</section>`
  },

  // ── 列表/步骤 ──
  {
    id: 'l-step-numbers',
    category: 'lists',
    title: '彩色数字圆圈步骤列表',
    description: '优雅的数字序号引导，适合流程或教程说明。',
    tags: ['步骤列表', '数字', '教程'],
    html: `<section style="margin: 20px 0;">
  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
    <span style="background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">1</span>
    <div style="font-size: 14.5px; color: #334155; line-height: 1.7;"><strong>第一步：导入/撰写 Markdown 内容</strong>（支持拖拽 Word/PDF 自动转换）</div>
  </div>
  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
    <span style="background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">2</span>
    <div style="font-size: 14.5px; color: #334155; line-height: 1.7;"><strong>第二步：选择排版主题与代码高亮</strong>（实时双栏对照预览）</div>
  </div>
  <div style="display: flex; align-items: flex-start;">
    <span style="background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">3</span>
    <div style="font-size: 14.5px; color: #334155; line-height: 1.7;"><strong>第三步：一键同步至微信草稿箱</strong>（或导出 Word / PDF / PNG 长图）</div>
  </div>
</section>`
  },

  // ── 关注/引导卡片 ──
  {
    id: 'f-author-cta',
    category: 'footer',
    title: '壹伴极简作者名片与关注卡片',
    description: '包含作者介绍、关注引导与高质感圆角边框，适合文章末尾收尾。',
    tags: ['关注卡片', '作者介绍', 'CTA'],
    html: `<section style="margin: 40px 0 20px; padding: 22px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.03); text-align: center;">
  <p style="font-size: 16.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">✍️ 程序员小富</p>
  <p style="font-size: 13.5px; color: #64748b; margin-bottom: 14px; line-height: 1.6;">专注分享后端高并发架构、前端高颜值排版与职场成长思考</p>
  <span style="display: inline-block; padding: 8px 22px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">欢迎关注本公众号 · 获取精选深度干货</span>
</section>`
  }
];
