/**
 * WeChat Preset Styling Material Library
 * Inspired by 135 Editor, Xiumi, Yiban, and NewRank.
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
  // ── 135 爆款精选 (图二同款及延伸) ──
  {
    id: 'h-135-part01-leaf',
    category: 'headings',
    tag: '135爆款',
    title: '135 PART.01 黄绿夏风标题',
    description: '图二同款：倾斜 PART.01 标牌 + 弧形手绘箭头 + 绿叶波浪划线标题',
    tags: ['135爆款', 'PART.01', '绿叶'],
    html: `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: left;">
  <section style="margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; vertical-align: bottom; background: #facc15; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-6deg); transform: rotate(-6deg); -webkit-box-shadow: 2px 2px 0px rgba(245,158,11,0.25); box-shadow: 2px 2px 0px rgba(245,158,11,0.25); letter-spacing: 0.5px; font-family: -apple-system, sans-serif; margin-right: 6px;">
      PART.01
    </section>
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none" style="display: inline-block; vertical-align: bottom; margin-bottom: 1px;">
      <path d="M2 3 C10 0, 18 3, 24 13 M18 11 L24 13 L22 7" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </section>
  <section style="line-height: 1.2;">
    <section style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <span style="font-size: 18px; font-weight: bold; color: #2e8b57; letter-spacing: 1px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block;">
        八月拾夏 静待秋风
      </span>
      <svg width="100%" height="8" viewBox="0 0 140 8" fill="none" style="display: block; margin-top: 3px;">
        <path d="M0 2 Q 10 7, 20 2 T 40 2 T 60 2 T 80 2 T 100 2 T 120 2 T 140 2 M0 6 Q 10 11, 20 6 T 40 6 T 60 6 T 80 6 T 100 6 T 120 6 T 140 6" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </section>
    <span style="display: inline-block; vertical-align: middle; font-size: 20px; line-height: 1;">🌿</span>
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
    html: `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: left;">
  <section style="margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; vertical-align: bottom; background: #f43f5e; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-5deg); transform: rotate(-5deg); -webkit-box-shadow: 2px 2px 0px rgba(225,29,72,0.25); box-shadow: 2px 2px 0px rgba(225,29,72,0.25); margin-right: 6px;">
      PART.02
    </section>
    <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">✨</span>
  </section>
  <section style="line-height: 1.2;">
    <section style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <span style="font-size: 18px; font-weight: bold; color: #be123c; letter-spacing: 0.8px; display: inline-block;">
        关于生活中的温柔复苏
      </span>
      <section style="height: 3px; background: #fecdd3; border-radius: 2px; margin-top: 4px;"></section>
    </section>
    <span style="display: inline-block; vertical-align: middle; font-size: 20px; line-height: 1;">🍑</span>
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
    html: `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: left;">
  <section style="margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; vertical-align: bottom; background: #8b5cf6; color: #ffffff; font-weight: bold; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-4deg); transform: rotate(-4deg); -webkit-box-shadow: 2px 2px 0px rgba(139,92,246,0.25); box-shadow: 2px 2px 0px rgba(139,92,246,0.25); margin-right: 6px;">
      PART.03
    </section>
    <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">🌙</span>
  </section>
  <section style="line-height: 1.2;">
    <section style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <span style="font-size: 18px; font-weight: bold; color: #5b21b6; letter-spacing: 0.8px; display: inline-block;">
        晚风拂过 枕着星河入梦
      </span>
      <section style="height: 3px; background: #ddd6fe; border-radius: 2px; margin-top: 4px;"></section>
    </section>
    <span style="display: inline-block; vertical-align: middle; font-size: 20px; line-height: 1;">🍇</span>
  </section>
</section>`
  },

  // ── 标题/序号素材 ──
  {
    id: 'h-135-bubble-01',
    category: 'headings',
    tag: '135爆款',
    title: '135双重气泡块序号标题',
    description: '135编辑器热门爆款：实心与淡色双层圆圈序号，搭配加粗标题',
    tags: ['135热选', '序号标题', '蓝色'],
    html: `<section style="margin: 24px 0 16px; clear: both; line-height: 1.4;">
  <section style="display: inline-block; vertical-align: middle; background: #2563eb; color: #ffffff; font-size: 15px; font-weight: bold; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; margin-right: 12px; -webkit-box-shadow: 0 4px 10px rgba(37,99,235,0.3); box-shadow: 0 4px 10px rgba(37,99,235,0.3);">01</section>
  <span style="display: inline-block; vertical-align: middle; font-size: 17px; font-weight: bold; color: #1e293b; letter-spacing: 0.5px;">避免用战术上的勤奋，掩盖战略上的懒惰</span>
</section>`
  },
  {
    id: 'h-135-yellow-3d',
    category: 'headings',
    tag: '135精选',
    title: '135经典立体明黄浮雕标题',
    description: '黄色立体沉底图层 + 左倾小方块，高对比强吸睛',
    tags: ['135热选', '明黄', '立体风'],
    html: `<section style="margin: 24px 0 16px; display: block; clear: both;">
  <section style="background: #fef08a; padding: 6px 16px 6px 12px; border-radius: 6px; -webkit-box-shadow: 3px 3px 0px #f59e0b; box-shadow: 3px 3px 0px #f59e0b; display: inline-block; line-height: 1.4;">
    <span style="display: inline-block; vertical-align: middle; width: 8px; height: 18px; background: #d97706; border-radius: 2px; margin-right: 8px;"></span>
    <span style="display: inline-block; vertical-align: middle; font-size: 16px; font-weight: bold; color: #78350f;">打造高转化率的爆款文章结构</span>
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
    html: `<section style="margin: 24px 0 16px; clear: both; line-height: 1.4;">
  <section style="display: inline-block; vertical-align: middle; background: #10b981; color: #ffffff; font-weight: bold; font-size: 16px; width: 36px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; -webkit-box-shadow: 3px 3px 0px #047857; box-shadow: 3px 3px 0px #047857; margin-right: 10px;">
    02
  </section>
  <span style="display: inline-block; vertical-align: middle; font-size: 17px; font-weight: bold; color: #064e3b; letter-spacing: 0.5px;">
    突破认知瓶颈，实现底层能力复利
  </span>
</section>`
  },
  {
    id: 'h-135-morandi-block',
    category: 'headings',
    tag: '莫兰迪',
    title: '135莫兰迪双色拼接标题',
    description: '低饱和度莫兰迪色系拼接，高级沉稳，适合文化随笔',
    tags: ['莫兰迪', '高级感', '拼接'],
    html: `<section style="margin: 22px 0 14px; display: inline-block; border-radius: 6px; overflow: hidden; clear: both; line-height: 1;">
  <span style="display: inline-block; vertical-align: middle; background: #a3b18a; color: #ffffff; font-weight: bold; font-size: 13px; padding: 8px 12px; letter-spacing: 0.5px;">SECTION</span><span style="display: inline-block; vertical-align: middle; background: #dad7cd; color: #3a5a40; font-weight: bold; font-size: 15px; padding: 8px 16px;">在平淡生活中发现闪光日常</span>
</section>`
  },
  {
    id: 'h-135-guofeng-cloud',
    category: 'headings',
    tag: '国风',
    title: '135国风古韵红木印章标题',
    description: '浓郁中国风红木底纹 + 居中宋体，适合传统文化',
    tags: ['国风', '朱红', '宋体'],
    html: `<section style="margin: 26px 0 16px; text-align: center; clear: both;">
  <section style="display: inline-block; padding: 6px 24px; border-top: 2px solid #991b1b; border-bottom: 2px solid #991b1b; background: #fff5f5;">
    <span style="font-family: 'SimSun', 'Songti SC', serif; font-size: 17px; font-weight: bold; color: #991b1b; letter-spacing: 2px;">❖ 闲情记趣 · 岁时节气 ❖</span>
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
    html: `<section style="margin: 22px 0 14px; padding: 8px 16px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0; clear: both;">
  <span style="font-size: 16px; font-weight: bold; color: #065f46;">构建持续交付的自动化 SOP</span>
</section>`
  },
  {
    id: 'h-135-tech-cyber',
    category: 'headings',
    tag: '科技感',
    title: '135赛博黑金科技感标题',
    description: '黑底金边科技光感标题，适合数码测评与 AI 前沿',
    tags: ['黑金', '科技感', '数码'],
    html: `<section style="margin: 24px 0 16px; background: #0f172a; padding: 10px 18px; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; clear: both; line-height: 1.4;">
  <span style="display: inline-block; vertical-align: middle; color: #f59e0b; font-size: 18px; margin-right: 8px;">⚡</span>
  <span style="display: inline-block; vertical-align: middle; font-size: 16px; font-weight: bold; color: #f8fafc; letter-spacing: 0.5px;">GenAI 大模型在业务落地的痛点剖析</span>
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
    html: `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative;">
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
    html: `<div style="margin: 22px 0;">
  <section style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; color: #1e40af; font-size: 14.5px; line-height: 1.8; position: relative;">
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
    html: `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #854d0e; font-size: 14px; line-height: 1.8;">
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
    html: `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75;">
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
    html: `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
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
    html: `<section style="margin: 20px 0; padding: 16px 20px; background: #fff7ed; border: 1px solid #ffedd5; border-left: 5px solid #f97316; border-radius: 8px; color: #c2410c; font-size: 14px; line-height: 1.75;">
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
    html: `<section style="margin: 22px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
  <div style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
    🎯 本章核心避坑指南
  </div>
  <div>
    <div style="background: #fef2f2; border-radius: 6px; padding: 8px 12px; color: #991b1b; font-size: 13.5px; margin-bottom: 8px;">
      📍 <strong>一忌：</strong> 盲目追求全量微服务，增加运维成本。
    </div>
    <div style="background: #fefce8; border-radius: 6px; padding: 8px 12px; color: #854d0e; font-size: 13.5px; margin-bottom: 8px;">
      📍 <strong>二忌：</strong> 缺少统一的高可用监控与链路追踪。
    </div>
    <div style="background: #ecfdf5; border-radius: 6px; padding: 8px 12px; color: #065f46; font-size: 13.5px;">
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
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7;">
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
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7;">
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
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">✅ 推荐方案：</strong>
  推荐采用同城双活 + 异地多活部署架构，确保单机房故障时服务零中断。
</section>`
  },
  {
    id: 'c-135-faq-card',
    category: 'callouts',
    tag: 'Q&A',
    title: '135问答 Q&A 对话卡片',
    description: '清晰的问答双色区分，适合 FAQ 答疑',
    tags: ['Q&A', '问答', 'FAQ'],
    html: `<section style="margin: 20px 0; padding: 16px; background: #f1f5f9; border-radius: 10px;">
  <div style="font-weight: 700; color: #2563eb; margin-bottom: 6px; font-size: 14.5px;">Q: 这套排版主题支持直接复制到微信公众号后台吗？</div>
  <div style="color: #334155; font-size: 14px; line-height: 1.7;">A: 完全支持！点击右上角“一键复制”后，在公众号编辑器中按下 Ctrl+V (Cmd+V) 即可精准贴入，100% 保持排版无缝对齐。</div>
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
    html: `<section style="margin: 26px 0; color: #94a3b8; font-size: 14px; line-height: 1;">
  <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">✂️</span>
  <section style="display: inline-block; vertical-align: middle; width: calc(100% - 30px); border-top: 2px dashed #cbd5e1; height: 0;"></section>
</section>`
  },
  {
    id: 'd-135-double-wave',
    category: 'dividers',
    tag: '135热选',
    title: '135暖黄浪漫浪花分割线',
    description: '优雅手绘双重浪花线条，带渐变过渡',
    tags: ['波浪', '暖黄', '优雅'],
    html: `<div style="text-align: center; margin: 26px 0;">
  <svg width="200" height="12" viewBox="0 0 200 12" fill="none">
    <path d="M0 6 Q 15 0, 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 200 6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>`
  },
  {
    id: 'd-dots',
    category: 'dividers',
    tag: '极简',
    title: '三点星光居中分割线',
    description: '居中修饰三个优雅圆点',
    tags: ['点状', '居中', '优雅'],
    html: `<div style="text-align: center; margin: 26px 0; color: #cbd5e1; font-size: 18px; letter-spacing: 12px;">• • •</div>`
  },
  {
    id: 'd-dashed-blue',
    category: 'dividers',
    tag: '蓝色',
    title: '蓝色淡雅虚线分割线',
    description: '轻盈的虚线分割线',
    tags: ['虚线', '蓝色', '淡雅'],
    html: `<hr style="border: none; border-top: 2px dashed #93c5fd; margin: 26px 0;" />`
  },

  // ── 步骤/时间轴素材 ──
  {
    id: 'l-135-timeline',
    category: 'lists',
    tag: '里程碑',
    title: '135纵向里程碑时间轴',
    description: '带有连接线与圆点标记的纵向流程卡片',
    tags: ['时间轴', '里程碑', '流程'],
    html: `<section style="margin: 20px 0; padding-left: 8px; border-left: 2px solid #3b82f6;">
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
    tag: '步骤',
    title: '彩色数字圆圈步骤列表',
    description: '优雅的数字序号引导',
    tags: ['步骤列表', '数字', '教程'],
    html: `<section style="margin: 20px 0;">
  <div style="margin-bottom: 12px; line-height: 1.7;">
    <span style="display: inline-block; vertical-align: top; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; margin-top: 2px;">1</span><div style="display: inline-block; vertical-align: top; font-size: 14.5px; color: #334155; width: calc(100% - 36px);"><strong>第一步：导入/撰写 Markdown 内容</strong></div>
  </div>
  <div style="margin-bottom: 12px; line-height: 1.7;">
    <span style="display: inline-block; vertical-align: top; background: #2563eb; color: #fff; font-size: 12px; font-weight: 700; width: 22px; height: 22px; line-height: 22px; text-align: center; border-radius: 50%; margin-right: 10px; margin-top: 2px;">2</span><div style="display: inline-block; vertical-align: top; font-size: 14.5px; color: #334155; width: calc(100% - 36px);"><strong>第二步：选择排版主题与代码高亮</strong></div>
  </div>
</section>`
  },

  // ── 关注/引导卡片素材 ──
  {
    id: 'f-135-triple-like',
    category: 'footer',
    tag: '135爆款',
    title: '135爆款文末三连交互卡片',
    description: '包含“点赞 · 在看 · 分享”互动提醒',
    tags: ['互动三连', '点赞在看', '135爆款'],
    html: `<section style="margin: 28px 0 16px; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center;">
  <p style="font-size: 14.5px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">如果这篇文章对你有启发，欢迎转发分享！</p>
  <div style="text-align: center; color: #475569; font-size: 13px; font-weight: 600;">
    <span style="display: inline-block; background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03); margin: 0 6px;">👍 点赞</span>
    <span style="display: inline-block; background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03); margin: 0 6px;">👀 在看</span>
    <span style="display: inline-block; background: #ffffff; padding: 6px 14px; border-radius: 20px; border: 1px solid #e2e8f0; -webkit-box-shadow: 0 2px 6px rgba(0,0,0,0.03); box-shadow: 0 2px 6px rgba(0,0,0,0.03); margin: 0 6px;">🚀 分享</span>
  </div>
</section>`
  },
  {
    id: 'f-135-qrcode-card',
    category: 'footer',
    tag: '135爆款',
    title: '135经典二维码关注引导卡片',
    description: '高转化微信公众号二维码关注框，带有扫码提示手势',
    tags: ['关注卡片', '二维码', '135爆款'],
    html: `<section style="margin: 28px 0 16px; padding: 22px; background: #faf5ff; border: 1px dashed #d8b4fe; border-radius: 16px; text-align: center;">
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
    category: 'footer',
    tag: '名片',
    title: '壹伴极简作者名片与关注卡片',
    description: '包含作者介绍、关注引导与高质感圆角边框',
    tags: ['关注卡片', '作者介绍', 'CTA'],
    html: `<section style="margin: 28px 0 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.03); text-align: center;">
  <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">✍️ 程序员小富</p>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.5;">专注分享后端高并发架构、前端高颜值排版与职场成长思考</p>
  <span style="display: inline-block; padding: 8px 22px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">欢迎关注本公众号 · 获取精选深度干货</span>
</section>`
  }
];

export const headingTemplates = [
  {
    id: 'none',
    name: '默认主题样式',
    description: '使用当前主题预设的标题 CSS 渲染，不使用固定素材图块',
    tag: '默认',
    previewHtml: `<div style="font-size: 15px; font-weight: bold; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">默认主题标题</div>`,
    render: () => null
  },
  {
    id: 'h-135-part01-leaf',
    name: '135 PART.01 黄绿夏风标牌',
    description: '倾斜 PART.01 标牌 + 弧形手绘箭头 + 绿叶波浪划线标题',
    tag: '135爆款',
    previewHtml: `<div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:2px;"><div style="background:#facc15;color:#fff;font-weight:800;font-size:10px;padding:1px 6px;border-radius:3px;transform:rotate(-6deg);">PART.01</div></div><div style="font-size:13px;font-weight:800;color:#2e8b57;">八月拾夏 静待秋风 🌿</div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'PART';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: left;">
  <section style="margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; vertical-align: bottom; background: #facc15; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-6deg); transform: rotate(-6deg); -webkit-box-shadow: 2px 2px 0px rgba(245,158,11,0.25); box-shadow: 2px 2px 0px rgba(245,158,11,0.25); letter-spacing: 0.5px; font-family: -apple-system, sans-serif; margin-right: 6px;">
      ${prefix}.${indexPadded}
    </section>
    <svg width="28" height="18" viewBox="0 0 28 18" fill="none" style="display: inline-block; vertical-align: bottom; margin-bottom: 1px;">
      <path d="M2 3 C10 0, 18 3, 24 13 M18 11 L24 13 L22 7" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </section>
  <section style="line-height: 1.2;">
    <section style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <span style="font-size: 18px; font-weight: 800; color: #2e8b57; letter-spacing: 1px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: inline-block;">
        ${title}
      </span>
      <svg width="100%" height="8" viewBox="0 0 140 8" fill="none" style="display: block; margin-top: 3px;">
        <path d="M0 2 Q 10 7, 20 2 T 40 2 T 60 2 T 80 2 T 100 2 T 120 2 T 140 2 M0 6 Q 10 11, 20 6 T 40 6 T 60 6 T 80 6 T 100 6 T 120 6 T 140 6" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </section>
    <span style="display: inline-block; vertical-align: middle; font-size: 20px; line-height: 1;">🌿</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-part02-peach',
    name: '135 PART.02 蜜桃浪漫',
    description: '倾斜粉红标牌 + 甜美蜜桃与粉色下划线',
    tag: '135热选',
    previewHtml: `<div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:2px;"><div style="background:#f43f5e;color:#fff;font-weight:800;font-size:10px;padding:1px 6px;border-radius:3px;transform:rotate(-5deg);">PART.02</div></div><div style="font-size:13px;font-weight:800;color:#be123c;">关于生活中的温柔 🍑</div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'PART';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: left;">
  <section style="margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; vertical-align: bottom; background: #f43f5e; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-5deg); transform: rotate(-5deg); -webkit-box-shadow: 2px 2px 0px rgba(225,29,72,0.25); box-shadow: 2px 2px 0px rgba(225,29,72,0.25); margin-right: 6px;">
      ${prefix}.${indexPadded}
    </section>
    <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">✨</span>
  </section>
  <section style="line-height: 1.2;">
    <section style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <span style="font-size: 18px; font-weight: 800; color: #be123c; letter-spacing: 0.8px; display: inline-block;">
        ${title}
      </span>
      <section style="height: 3px; background: #fecdd3; border-radius: 2px; margin-top: 4px;"></section>
    </section>
    <span style="display: inline-block; vertical-align: middle; font-size: 20px; line-height: 1;">🍑</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-part03-purple',
    name: '135 PART.03 香草薰衣草紫',
    description: '倾斜紫色标牌 + 优雅星月点缀 + 香草紫下划线',
    tag: '135热选',
    previewHtml: `<div style="display:flex;align-items:flex-end;gap:4px;margin-bottom:2px;"><div style="background:#8b5cf6;color:#fff;font-weight:800;font-size:10px;padding:1px 6px;border-radius:3px;transform:rotate(-4deg);">PART.03</div></div><div style="font-size:13px;font-weight:800;color:#5b21b6;">枕着星河入梦 🌙</div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'PART';
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; padding: 10px 4px; clear: both; text-align: left;">
  <section style="margin-bottom: 6px; line-height: 1;">
    <section style="display: inline-block; vertical-align: bottom; background: #8b5cf6; color: #ffffff; font-weight: 800; font-size: 13px; padding: 4px 10px; border-radius: 4px; -webkit-transform: rotate(-4deg); transform: rotate(-4deg); -webkit-box-shadow: 2px 2px 0px rgba(139,92,246,0.25); box-shadow: 2px 2px 0px rgba(139,92,246,0.25); margin-right: 6px;">
      ${prefix}.${indexPadded}
    </section>
    <span style="display: inline-block; vertical-align: bottom; font-size: 16px;">🌙</span>
  </section>
  <section style="line-height: 1.2;">
    <section style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <span style="font-size: 18px; font-weight: 800; color: #5b21b6; letter-spacing: 0.8px; display: inline-block;">
        ${title}
      </span>
      <section style="height: 3px; background: #ddd6fe; border-radius: 2px; margin-top: 4px;"></section>
    </section>
    <span style="display: inline-block; vertical-align: middle; font-size: 20px; line-height: 1;">🍇</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-bubble-01',
    name: '135 气泡圆圈序号标题',
    description: '实心蓝色圆圈数字 01, 02 + 悬浮阴影标题',
    tag: '135爆款',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;"><span style="background:#2563eb;color:#fff;font-size:11px;font-weight:800;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">01</span><span style="font-size:13px;font-weight:700;color:#1e293b;">战略思维与底层认知</span></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; clear: both; line-height: 1.4;">
  <section style="display: inline-block; vertical-align: middle; background: #2563eb; color: #ffffff; font-size: 15px; font-weight: 800; width: 34px; height: 34px; line-height: 34px; text-align: center; border-radius: 50%; margin-right: 12px; -webkit-box-shadow: 0 4px 10px rgba(37,99,235,0.3); box-shadow: 0 4px 10px rgba(37,99,235,0.3);">${indexPadded}</section>
  <span style="display: inline-block; vertical-align: middle; font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: 0.5px;">${title}</span>
</section>`;
    }
  },
  {
    id: 'h-135-yellow-3d',
    name: '135 经典立体明黄浮雕',
    description: '黄色立体沉底图层 + 左侧亮黄方块',
    tag: '135爆款',
    previewHtml: `<div style="background:#fef08a;padding:4px 8px;border-radius:4px;box-shadow:2px 2px 0 #f59e0b;font-size:12px;font-weight:800;color:#78350f;">打造高转化率结构</div>`,
    render: (title) => {
      return `<section style="margin: 24px 0 16px; display: block; clear: both;">
  <section style="background: #fef08a; padding: 6px 16px 6px 12px; border-radius: 6px; -webkit-box-shadow: 3px 3px 0px #f59e0b; box-shadow: 3px 3px 0px #f59e0b; display: inline-block; line-height: 1.4;">
    <span style="display: inline-block; vertical-align: middle; width: 8px; height: 18px; background: #d97706; border-radius: 2px; margin-right: 8px;"></span>
    <span style="display: inline-block; vertical-align: middle; font-size: 16px; font-weight: 800; color: #78350f;">${title}</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-135-3d-mint-num',
    name: '135 薄荷绿立体 02 序号',
    description: '薄荷绿圆角方块 + 侧阴影 01, 02 序号块',
    tag: '135热选',
    previewHtml: `<div style="display:flex;align-items:center;gap:6px;"><div style="background:#10b981;color:#fff;font-size:10px;font-weight:bold;padding:2px 5px;border-radius:4px;box-shadow:2px 2px 0 #047857;">02</div><span style="font-size:12px;font-weight:bold;color:#064e3b;">突破认知瓶颈</span></div>`,
    render: (title, index) => {
      const indexPadded = String(index).padStart(2, '0');
      return `<section style="margin: 24px 0 16px; clear: both; line-height: 1.4;">
  <section style="display: inline-block; vertical-align: middle; background: #10b981; color: #ffffff; font-weight: bold; font-size: 16px; width: 36px; height: 32px; line-height: 32px; text-align: center; border-radius: 8px; -webkit-box-shadow: 3px 3px 0px #047857; box-shadow: 3px 3px 0px #047857; margin-right: 10px;">
    ${indexPadded}
  </section>
  <span style="display: inline-block; vertical-align: middle; font-size: 17px; font-weight: bold; color: #064e3b; letter-spacing: 0.5px;">
    ${title}
  </span>
</section>`;
    }
  },
  {
    id: 'h-135-morandi-block',
    name: '135 莫兰迪双色拼接',
    description: '低饱和度莫兰迪色系拼接，高级沉稳',
    tag: '莫兰迪',
    previewHtml: `<div style="display:inline-flex;border-radius:4px;overflow:hidden;font-size:11px;"><span style="background:#a3b18a;color:#fff;padding:2px 5px;font-weight:bold;">SECTION</span><span style="background:#dad7cd;color:#3a5a40;padding:2px 6px;font-weight:bold;">发现闪光日常</span></div>`,
    render: (title, index, options = {}) => {
      const prefix = options.prefix || 'SECTION';
      return `<section style="margin: 22px 0 14px; display: inline-block; border-radius: 6px; overflow: hidden; clear: both; line-height: 1;">
  <span style="display: inline-block; vertical-align: middle; background: #a3b18a; color: #ffffff; font-weight: bold; font-size: 13px; padding: 8px 12px; letter-spacing: 0.5px;">${prefix}</span><span style="display: inline-block; vertical-align: middle; background: #dad7cd; color: #3a5a40; font-weight: bold; font-size: 15px; padding: 8px 16px;">${title}</span>
</section>`;
    }
  },
  {
    id: 'h-135-guofeng-cloud',
    name: '135 国风古韵红木印章',
    description: '浓郁中国风红木上下边框 + ❖ 符号',
    tag: '国风',
    previewHtml: `<div style="padding:2px 8px;border-top:1px solid #991b1b;border-bottom:1px solid #991b1b;color:#991b1b;font-size:11px;font-weight:bold;text-align:center;">❖ 岁时节气 ❖</div>`,
    render: (title) => {
      return `<section style="margin: 26px 0 16px; text-align: center; clear: both;">
  <section style="display: inline-block; padding: 6px 24px; border-top: 2px solid #991b1b; border-bottom: 2px solid #991b1b; background: #fff5f5;">
    <span style="font-family: 'SimSun', 'Songti SC', serif; font-size: 17px; font-weight: bold; color: #991b1b; letter-spacing: 2px;">❖ ${title} ❖</span>
  </section>
</section>`;
    }
  },
  {
    id: 'h-bar-emerald',
    name: '135 极简翡翠绿包边',
    description: '带有柔和绿底色与 4px 左侧修饰条',
    tag: '极简',
    previewHtml: `<div style="padding:3px 8px;border-left:3px solid #10b981;background:#ecfdf5;font-size:12px;font-weight:bold;color:#065f46;">构建持续交付 SOP</div>`,
    render: (title) => {
      return `<section style="margin: 22px 0 14px; padding: 8px 16px; border-left: 4px solid #10b981; background: #ecfdf5; border-radius: 0 8px 8px 0; clear: both;">
  <span style="font-size: 16px; font-weight: bold; color: #065f46;">${title}</span>
</section>`;
    }
  },
  {
    id: 'h-135-tech-cyber',
    name: '135 赛博黑金科技感',
    description: '黑底金边科技光感标题，带琥珀闪电图标',
    tag: '科技感',
    previewHtml: `<div style="background:#0f172a;padding:3px 8px;border-left:3px solid #f59e0b;color:#f8fafc;font-size:11px;font-weight:bold;">⚡ GenAI 业务落地痛点</div>`,
    render: (title) => {
      return `<section style="margin: 24px 0 16px; background: #0f172a; padding: 10px 18px; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; clear: both; line-height: 1.4;">
  <span style="display: inline-block; vertical-align: middle; color: #f59e0b; font-size: 18px; margin-right: 8px;">⚡</span>
  <span style="display: inline-block; vertical-align: middle; font-size: 16px; font-weight: bold; color: #f8fafc; letter-spacing: 0.5px;">${title}</span>
</section>`;
    }
  }
];

export const headingTemplatesMap = headingTemplates.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});

export const quoteTemplates = [
  {
    id: 'none',
    name: '默认主题引用样式',
    description: '使用当前主题预设的引用 CSS 渲染',
    tag: '默认',
    previewHtml: `<div style="padding: 8px 12px; background: #f1f5f9; border-left: 4px solid #3b82f6; font-size: 12px; color: #334155;">默认引用块 preview...</div>`,
    render: () => null
  },
  {
    id: 'q-135-big-quote',
    name: '135 经典大型对话双引号框',
    description: '包含优雅的放大双引号与微阴影圆角边框',
    tag: '135热选',
    previewHtml: `<div style="padding: 10px 14px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; font-size: 12px; color: #334155;"><span style="font-size: 18px; color: #2563eb; font-family: Georgia;">“</span> 经典名言与深度引语 <span style="font-size: 18px; color: #2563eb; font-family: Georgia;">”</span></div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 18px 22px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #334155; font-size: 14.5px; line-height: 1.8; position: relative;">
  <span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-right: 4px;">“</span>${content}<span style="font-size: 32px; color: #2563eb; font-family: Georgia, serif; line-height: 1; vertical-align: -8px; margin-left: 4px;">”</span>
</blockquote>`
  },
  {
    id: 'q-135-speech-bubble',
    name: '135 极简对话气泡框',
    description: '对话气泡底色 + 💬 深度洞察图标',
    tag: '135爆款',
    previewHtml: `<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #1e40af;">💬 深度洞察：把时间浪费在值得的事情上</div>`,
    render: (content) => `<section style="margin: 22px 0; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; color: #1e40af; font-size: 14.5px; line-height: 1.8;">
  <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #1d4ed8;">💬 深度洞察：</strong>${content}
</section>`
  },
  {
    id: 'q-135-paper-fold',
    name: '135 便签折角贴纸引用框',
    description: '暖黄便签底色 + 5px 亮黄左边框',
    tag: '便签风',
    previewHtml: `<div style="padding: 8px 12px; background: #fefce8; border-left: 4px solid #eab308; font-size: 12px; color: #854d0e;">📖 读书札记：生活原本沉闷，但跑起来就有风</div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #fefce8; border: 1px solid #fef08a; border-left: 5px solid #eab308; border-radius: 8px; color: #854d0e; font-size: 14px; line-height: 1.8;">
  📖 <strong>读书札记：</strong>${content}
</blockquote>`
  },
  {
    id: 'q-gradient-bar',
    name: '135 渐变蓝条优雅导读',
    description: '左侧采用 5px 蓝紫渐变条与浅灰卡片',
    tag: '推荐',
    previewHtml: `<div style="padding: 8px 12px; background: #f1f5f9; border-left: 4px solid #3b82f6; font-size: 12px; color: #475569;">💡 导读摘要：用杠杆思维做选择</div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 14px 18px; background: #f1f5f9; border-left: 5px solid #3b82f6; border-radius: 0 8px 8px 0; color: #475569; font-size: 14px; line-height: 1.75;">
  <strong>💡 导读摘要：</strong>${content}
</blockquote>`
  },
  {
    id: 'q-dark-slate',
    name: '135 深灰极简黑金框',
    description: '深色质感引用框，高级沉稳',
    tag: '高级感',
    previewHtml: `<div style="padding: 8px 12px; background: #0f172a; border-radius: 6px; font-size: 12px; color: #f8fafc;">📌 架构法则：不要为了设计而设计</div>`,
    render: (content) => `<blockquote style="margin: 20px 0; padding: 16px 20px; background: #0f172a; border-radius: 10px; color: #f8fafc; font-size: 14px; line-height: 1.8; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
  📌 <strong>核心要点：</strong>${content}
</blockquote>`
  },
  {
    id: 'c-135-orange-fire',
    name: '135 橙色热度关注框',
    description: '橙色高光底色 + 🔥 热度图标',
    tag: '135爆款',
    previewHtml: `<div style="padding: 8px 12px; background: #fff7ed; border-left: 4px solid #f97316; font-size: 12px; color: #c2410c;">🔥 核心干货要点...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 16px 20px; background: #fff7ed; border: 1px solid #ffedd5; border-left: 5px solid #f97316; border-radius: 8px; color: #c2410c; font-size: 14px; line-height: 1.75;">
  <strong style="display: block; margin-bottom: 6px; font-size: 15px; color: #ea580c;">🔥 核心干货：</strong>${content}
</section>`
  },
  {
    id: 'c-note-blue',
    name: '💡 蓝色 Note 提示卡片',
    description: '柔和浅蓝背景 + 💡 图标 header',
    tag: '提示',
    previewHtml: `<div style="padding: 8px 12px; background: #eff6ff; border-left: 4px solid #3b82f6; font-size: 12px; color: #1e40af;">💡 温馨提示...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; color: #1e40af; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">💡 温馨提示：</strong>${content}
</section>`
  },
  {
    id: 'c-warning-red',
    name: '⚠️ 红色 Warning 警告卡片',
    description: '淡红背景 + ⚠️ 图标',
    tag: '警告',
    previewHtml: `<div style="padding: 8px 12px; background: #fef2f2; border-left: 4px solid #ef4444; font-size: 12px; color: #991b1b;">⚠️ 注意事项...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; color: #991b1b; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">⚠️ 注意事项：</strong>${content}
</section>`
  },
  {
    id: 'c-success-green',
    name: '✅ 绿色 Success 推荐卡片',
    description: '淡绿背景 + ✅ 图标',
    tag: '推荐',
    previewHtml: `<div style="padding: 8px 12px; background: #ecfdf5; border-left: 4px solid #10b981; font-size: 12px; color: #065f46;">✅ 推荐方案...</div>`,
    render: (content) => `<section style="margin: 20px 0; padding: 14px 18px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; color: #065f46; font-size: 14px; line-height: 1.7;">
  <strong style="display: block; margin-bottom: 4px; font-size: 14.5px;">✅ 推荐方案：</strong>${content}
</section>`
  }
];

export const dividerTemplates = [
  {
    id: 'none',
    name: '默认主题分割线',
    description: '使用当前主题预设的分割线样式',
    tag: '默认',
    previewHtml: `<div style="border-top: 1px solid #cbd5e1; margin: 8px 0;"></div>`,
    render: () => null
  },
  {
    id: 'd-135-scissors',
    name: '135 剪刀裁剪虚线分割线',
    description: '趣味剪刀图标 + 虚线切割',
    tag: '135爆款',
    previewHtml: `<div style="color: #94a3b8; font-size: 12px;">✂️ ------------------</div>`,
    render: () => `<section style="margin: 26px 0; color: #94a3b8; font-size: 14px; line-height: 1;">
  <span style="display: inline-block; vertical-align: middle; margin-right: 8px;">✂️</span>
  <section style="display: inline-block; vertical-align: middle; width: calc(100% - 30px); border-top: 2px dashed #cbd5e1; height: 0;"></section>
</section>`
  },
  {
    id: 'd-135-double-wave',
    name: '135 暖黄浪漫浪花分割线',
    description: '优雅手绘双重浪花线条',
    tag: '135热选',
    previewHtml: `<div style="text-align: center; color: #f59e0b; font-size: 12px;">〰〰〰〰〰</div>`,
    render: () => `<div style="text-align: center; margin: 26px 0;">
  <svg width="200" height="12" viewBox="0 0 200 12" fill="none">
    <path d="M0 6 Q 15 0, 30 6 T 60 6 T 90 6 T 120 6 T 150 6 T 180 6 T 200 6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>`
  },
  {
    id: 'd-dots',
    name: '三点星光居中分割线',
    description: '居中修饰三个优雅圆点',
    tag: '极简',
    previewHtml: `<div style="text-align: center; color: #cbd5e1; font-size: 14px;">• • •</div>`,
    render: () => `<div style="text-align: center; margin: 26px 0; color: #cbd5e1; font-size: 18px; letter-spacing: 12px;">• • •</div>`
  },
  {
    id: 'd-dashed-blue',
    name: '蓝色淡雅虚线分割线',
    description: '轻盈的蓝色虚线',
    tag: '蓝色',
    previewHtml: `<div style="border-top: 2px dashed #93c5fd; margin: 8px 0;"></div>`,
    render: () => `<hr style="border: none; border-top: 2px dashed #93c5fd; margin: 26px 0;" />`
  }
];

export const allMaterialTemplatesMap = {
  ...headingTemplatesMap,
  ...quoteTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {}),
  ...dividerTemplates.reduce((acc, c) => { acc[c.id] = c; return acc; }, {})
};

export function getMaterialTemplatesForKey(key) {
  if (key === 'blockquote') {
    return quoteTemplates;
  }
  if (key === 'hr') {
    return dividerTemplates;
  }
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(key)) {
    return headingTemplates;
  }
  return [];
}


