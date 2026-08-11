/**
 * WeChat Preset Styling Material Library
 * Contains rich HTML & Markdown inline styled materials for WeChat publishing inspired by 135 Editor, Xiumi, Yiban, and NewRank.
 */

export const materialCategories = [
  { id: 'all', name: '全部素材' },
  { id: 'headings', name: '标题/序号' },
  { id: 'quotes', name: '金句/引用' },
  { id: 'callouts', name: '提示/卡片' },
  { id: 'dividers', name: '分割线' },
  { id: 'lists', name: '步骤/时间轴' },
  { id: 'footer', name: '关注/引导' }
];

export const materials = [
  // ── 标题样式 ──
  {
    id: 'h-135-bubble-01',
    category: 'headings',
    title: '135双重气泡块序号标题',
    description: '135编辑器热门爆款：实心与淡色双层圆圈序号，搭配加粗标题，适合多章节论述。',
    tags: ['135热选', '序号标题', '蓝色'],
    html: `<section style="margin: 28px 0 16px; display: flex; align-items: center;">
  <span style="display: inline-flex; align-items: center; justify-content: center; background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 800; width: 34px; height: 34px; border-radius: 50%; margin-right: 10px; box-shadow: 0 4px 10px rgba(37,99,235,0.3); flex-shrink: 0;">01</span>
  <span style="font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px;">避免用战术上的勤奋，掩盖战略上的懒惰</span>
</section>`
  },
  {
    id: 'h-135-yellow-3d',
    category: 'headings',
    title: '135经典立体明黄浮雕标题',
    description: '黄色立体沉底图层 + 左倾小方块，高对比强吸睛，公众号头条常用。',
    tags: ['135热选', '明黄', '立体风'],
    html: `<section style="margin: 28px 0 16px; display: inline-block;">
  <div style="background: #fef08a; padding: 6px 16px 6px 12px; border-radius: 6px; box-shadow: 3px 3px 0px #f59e0b; display: inline-flex; align-items: center; gap: 8px;">
    <span style="width: 8px; height: 18px; background: #d97706; border-radius: 2px;"></span>
    <span style="font-size: 16px; font-weight: 800; color: #78350f;">打造高转化率的爆款文章结构</span>
  </div>
</section>`
  },
  {
    id: 'h-135-morandi-block',
    category: 'headings',
    title: '135莫兰迪双色拼接标题',
    description: '低饱和度莫兰迪色系拼接，高级沉稳，适合文化随笔与生活方式类。',
    tags: ['莫兰迪', '高级感', '拼接'],
    html: `<section style="margin: 26px 0 16px; display: flex; align-items: stretch; border-radius: 6px; overflow: hidden; max-width: max-content;">
  <span style="background: #a3b18a; color: #ffffff; font-weight: 800; font-size: 14px; padding: 6px 12px; display: flex; align-items: center;">SECTION</span>
  <span style="background: #dad7cd; color: #3a5a40; font-weight: 700; font-size: 15px; padding: 6px 16px; display: flex; align-items: center;">在平淡生活中发现闪光日常</span>
</section>`
  },
  {
    id: 'h-135-guofeng-cloud',
    category: 'headings',
    title: '135国风古韵红木印章标题',
    description: '浓郁中国风红木底纹 + 居中宋体，适合传统文化、文旅与古风美文。',
    tags: ['国风', '朱红', '宋体'],
    html: `<section style="margin: 30px 0 18px; text-align: center;">
  <div style="display: inline-block; padding: 6px 24px; border-top: 2px solid #991b1b; border-bottom: 2px solid #991b1b; background: #fff5f5;">
    <span style="font-family: 'SimSun', 'Songti SC', serif; font-size: 17px; font-weight: 700; color: #991b1b; letter-spacing: 2px;">❖ 闲情记趣 · 岁时节气 ❖</span>
  </div>
</section>`
  },
  {
    id: 'h-bar-emerald',
    category: 'headings',
    title: '135极简翡翠绿包边标题',
    description: '带有柔和绿底色与左边框修饰，清新耐看，适合生活与技术感文章。',
    tags: ['包边标题', '绿色', '极简'],
    html: `<section style="margin: 24px 0 14px; padding: 7px 14px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0;">
  <span style="font-size: 16.5px; font-weight: 700; color: #065f46;">构建持续交付的自动化 SOP</span>
</section>`
  },
  {
    id: 'h-center-line',
    category: 'headings',
    title: '经典双划线居中总结标题',
    description: '带有左右虚线/实线装饰的居中标题，适合章节分隔或总结。',
    tags: ['居中标题', '修饰线', '总结'],
    html: `<section style="text-align: center; margin: 30px 0 16px;">
  <span style="color: #cbd5e1; margin: 0 12px;">───</span>
  <span style="font-size: 16px; font-weight: 700; color: #0f172a; padding: 4px 14px; background: #f1f5f9; border-radius: 20px;">核心视角与复盘</span>
  <span style="color: #cbd5e1; margin: 0 12px;">───</span>
</section>`
  },
  {
    id: 'h-135-tech-cyber',
    category: 'headings',
    title: '135赛博黑金科技感标题',
    description: '黑底金边科技光感标题，适合数码测评、AI 科技与前沿趋势。',
    tags: ['黑金', '科技感', '数码'],
    html: `<section style="margin: 28px 0 16px; background: #0f172a; padding: 10px 18px; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; display: flex; align-items: center; gap: 10px;">
  <span style="color: #f59e0b; font-size: 18px;">⚡</span>
  <span style="font-size: 16px; font-weight: 700; color: #f8fafc; letter-spacing: 0.5px;">GenAI 大模型在业务落地的痛点剖析</span>
</section>`
  },

  // ── 引用/金句 ──
  {
    id: 'q-135-big-quote',
    category: 'quotes',
    title: '135经典大型对话双引号框',
    description: '包含优雅的放大双引号与微阴影圆角边框，适合名言或观点金句。',
    tags: ['135金句', '双引号', '名言'],
    html: `<blockquote style="margin: 22px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative;">
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-right: 4px;">“</span>
  能力增长并不是斜率不变的直线，而是呈现指数级上升的复利曲线。认准方向并持续做对的事，时间会给努力的人最好的答复。
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-left: 4px;">”</span>
</blockquote>`
  },
  {
    id: 'q-135-paper-fold',
    category: 'quotes',
    title: '135便签折角贴纸引用框',
    description: '带有淡黄便签感与贴纸效果，亲切随和，适合情感、生活与读书笔记。',
    tags: ['便签', '温暖', '随笔'],
    html: `<blockquote style="margin: 22px 0; padding: 16px 20px; background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #854d0e; font-size: 14px; line-height: 1.8;">
  📖 <strong>读书札记：</strong> “生活原本沉闷，但跑起来就有风。” 把精力放在值得的人与事上，不盲从、不慌张。
</blockquote>`
  },
  {
    id: 'q-gradient-bar',
    category: 'quotes',
    title: '135渐变侧条优雅导读',
    description: '左侧采用高质感 Blue-Indigo 渐变粗边条，文字柔和清晰。',
    tags: ['渐变边条', '高颜值', '经典'],
    html: `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75;">
  <strong>💡 导读摘要：</strong> 真正的高手，都在用“杠杆思维”做选择，而不是在低水平的重复劳动中自我感动。
</blockquote>`
  },
  {
    id: 'q-dark-slate',
    category: 'quotes',
    title: '135深灰极简黑金修饰框',
    description: '深色纸面感引用框，极简而有高级感，适合极简阅读风格。',
    tags: ['极简', '暗色', '冷峻'],
    html: `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
  📌 <strong>架构法则：</strong> 不要为了设计而设计。好的架构是在业务交付速度与系统可维护性之间找到最佳平衡点。
</blockquote>`
  },

  // ── 提示/警示框 ──
  {
    id: 'c-135-orange-fire',
    category: 'callouts',
    title: '135爆款橙色热度关注框',
    description: '橙色高光底色 + 🔥 热度图标，非常适合活动推荐与热点分析。',
    tags: ['135热选', '橙色', '爆款'],
    html: `<section style="margin: 20px 0; padding: 16px 20px; background: #fff7ed; border: 1px solid #ffedd5; border-left: 5px solid #f97316; border-radius: 8px; color: #c2410c; font-size: 14px; line-height: 1.75;">
  <strong style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-size: 15px; color: #ea580c;">
    🔥 核心热点干货：
  </strong>
  文末附完整可导出的 PDF 讲义与配套源码下载链接，欢迎收藏分享！
</section>`
  },
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
    title: '✅ 绿色 Success 推荐方案卡片',
    description: '淡绿背景 + ✅ 图标，用于展示成功落地效果或官方推荐。',
    tags: ['成功卡片', '绿色', 'Success'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">✅ 推荐方案：</strong>
  推荐采用同城双活 + 异地多活部署架构，确保单机房故障时服务零中断。
</section>`
  },
  {
    id: 'c-135-faq-card',
    category: 'callouts',
    title: '135问答 Q&A 对话卡片',
    description: '清晰的问答双色区分，适合 FAQ 答疑或客户咨询整理。',
    tags: ['Q&A', '问答', 'FAQ'],
    html: `<section style="margin: 20px 0; padding: 16px; background: #f1f5f9; border-radius: 10px;">
  <div style="font-weight: 700; color: #2563eb; margin-bottom: 6px; font-size: 14.5px;">Q: 这套排版主题支持直接复制到微信公众号后台吗？</div>
  <div style="color: #334155; font-size: 14px; line-height: 1.7;">A: 完全支持！点击右上角“一键复制”后，在公众号编辑器中按下 Ctrl+V (Cmd+V) 即可精准贴入，100% 保持排版无缝对齐。</div>
</section>`
  },

  // ── 分割线 ──
  {
    id: 'd-135-scissors',
    category: 'dividers',
    title: '135剪刀裁剪虚线分割线',
    description: '趣味剪刀图标 + 虚线切割，适合优惠券、活动通知与段落分割。',
    tags: ['剪刀', '裁剪', '趣味'],
    html: `<section style="display: flex; align-items: center; margin: 30px 0; color: #94a3b8; font-size: 14px;">
  <span style="margin-right: 8px;">✂️</span>
  <div style="flex: 1; border-top: 2px dashed #cbd5e1;"></div>
</section>`
  },
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

  // ── 列表/步骤 ──
  {
    id: 'l-135-timeline',
    category: 'lists',
    title: '135纵向里程碑时间轴',
    description: '带有连接线与圆点标记的纵向流程卡片，非常适合发展历程或步骤复盘。',
    tags: ['时间轴', '里程碑', '流程'],
    html: `<section style="margin: 22px 0; padding-left: 8px; border-left: 2px solid #3b82f6;">
  <div style="position: relative; padding-left: 18px; margin-bottom: 16px;">
    <div style="position: absolute; left: -24px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; border: 2px solid #ffffff;"></div>
    <div style="font-size: 14px; font-weight: 700; color: #1e293b;">阶段一：架构重构与模块解耦</div>
    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">清理历史冗余代码，统一接口定义规范</div>
  </div>
  <div style="position: relative; padding-left: 18px;">
    <div style="position: absolute; left: -24px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #ffffff;"></div>
    <div style="font-size: 14px; font-weight: 700; color: #1e293b;">阶段二：性能调优与容量提升</div>
    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">引入二级缓存机制，QPS 提升 300%</div>
  </div>
</section>`
  },
  {
    id: 'l-step-numbers',
    category: 'lists',
    title: '彩色数字圆圈步骤列表',
    description: '优雅的数字序号引导，适合流程或教程说明。',
    tags: ['步骤列表', '数字', '教程'],
    html: `<section style="margin: 20px 0;">
  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
    <span style="background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">1</span>
    <div style="font-size: 14.5px; color: #334155; line-height: 1.7;"><strong>第一步：导入/撰写 Markdown 内容</strong></div>
  </div>
  <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
    <span style="background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; flex-shrink: 0; margin-top: 2px;">2</span>
    <div style="font-size: 14.5px; color: #334155; line-height: 1.7;"><strong>第二步：选择排版主题与代码高亮</strong></div>
  </div>
</section>`
  },

  // ── 关注/引导卡片 ──
  {
    id: 'f-135-triple-like',
    category: 'footer',
    title: '135爆款文末三连交互卡片',
    description: '包含“点赞 · 在看 · 分享”互动提醒，极大提升微信公众号互动转化率。',
    tags: ['互动三连', '点赞在看', '135爆款'],
    html: `<section style="margin: 36px 0 20px; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;">
  <p style="font-size: 14.5px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">如果这篇文章对你有启发，欢迎转发分享！</p>
  <div style="display: flex; justify-content: center; gap: 20px; color: #475569; font-size: 13px; font-weight: 600;">
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">👍 点赞</span>
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">👀 在看</span>
    <span style="background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">🚀 分享</span>
  </div>
</section>`
  },
  {
    id: 'f-author-cta',
    category: 'footer',
    title: '壹伴极简作者名片与关注卡片',
    description: '包含作者介绍、关注引导与高质感圆角边框，适合文章末尾收尾。',
    tags: ['关注卡片', '作者介绍', 'CTA'],
    html: `<section style="margin: 36px 0 20px; padding: 22px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.03); text-align: center;">
  <p style="font-size: 16.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">✍️ 程序员小富</p>
  <p style="font-size: 13.5px; color: #64748b; margin-bottom: 14px; line-height: 1.6;">专注分享后端高并发架构、前端高颜值排版与职场成长思考</p>
  <span style="display: inline-block; padding: 8px 22px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">欢迎关注本公众号 · 获取精选深度干货</span>
</section>`
  }
];
