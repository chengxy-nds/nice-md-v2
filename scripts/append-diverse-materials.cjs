const fs = require('fs');
const path = require('path');

const newMaterials = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. 标题类 (headings) - 多样化审美风格
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'h-oriental-seal',
    category: 'headings',
    tag: '国风水墨',
    title: '国风朱砂·双印章雅宋标题',
    description: '朱砂方印章章次 + 雅致宋体字标 + 渐变金石横线与祥云暗纹',
    tags: ['国风', '水墨', '印章', '宋体', '文学'],
    html: `<section style="margin: 28px 0 18px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-flex; align-items: center; gap: 10px; border-bottom: 2px solid #b91c1c; padding-bottom: 6px; position: relative;">
    <section style="background: #b91c1c; color: #ffffff; font-family: 'Songti SC', 'SimSun', serif; font-size: 13px; font-weight: 700; padding: 3px 8px; border-radius: 2px; box-shadow: 2px 2px 0px rgba(185, 28, 28, 0.25); letter-spacing: 2px;">
      壹·章
    </section>
    <span style="font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 19px; font-weight: 800; color: #1c1917; letter-spacing: 2px;">
      水墨流转·文气自华
    </span>
    <span style="color: #b91c1c; font-size: 16px; margin-left: 2px;">❖</span>
  </section>
</section>`
  },
  {
    id: 'h-cyber-terminal',
    category: 'headings',
    tag: '赛博极客',
    title: '极客赛博·终端发光命令标题',
    description: '深黑终端底色 + 霓虹亮青光标 + 命令行提示符与状态标识',
    tags: ['极客', '终端', '代码', '赛博', '命令行'],
    html: `<section style="margin: 28px 0 18px; clear: both;" data-material="true">
  <section style="display: inline-flex; align-items: center; background: #0f172a; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
    <span style="color: #38bdf8; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; font-weight: 700; margin-right: 8px;">❯_ [SEC_01]</span>
    <span style="color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">高并发链路与架构基建</span>
    <span style="display: inline-block; width: 8px; height: 14px; background: #38bdf8; margin-left: 8px; opacity: 0.85;"></span>
  </section>
</section>`
  },
  {
    id: 'h-editorial-roman',
    category: 'headings',
    tag: '杂志社论',
    title: '大刊社论·半透罗马序号大标题',
    description: '底置超大浅灰罗马序号 + 精致无衬线加粗主标 + 极简纯黑下划线',
    tags: ['杂志', '社论', '罗马数字', '大刊', '极简'],
    html: `<section style="margin: 32px 0 20px; clear: both; position: relative;" data-material="true">
  <div style="font-family: 'Times New Roman', serif; font-size: 46px; font-weight: 900; color: rgba(0, 0, 0, 0.07); line-height: 1; margin-bottom: -18px; user-select: none;">
    01.
  </div>
  <div style="display: inline-block; border-bottom: 2.5px solid #0a0a0a; padding-bottom: 5px;">
    <h3 style="margin: 0; font-family: 'Outfit', 'PingFang SC', sans-serif; font-size: 20px; font-weight: 800; color: #0a0a0a; letter-spacing: -0.02em;">
      范式转移与核心增长飞轮
    </h3>
  </div>
</section>`
  },
  {
    id: 'h-handdrawn-pin',
    category: 'headings',
    tag: '手账便签',
    title: '手账手绘·立体图钉便签标题',
    description: '倾斜手写黄色标签 + 3D 红色图钉 + 荧光马克笔底色',
    tags: ['手账', '便签', '图钉', '手绘', '活泼'],
    html: `<section style="margin: 28px 0 18px; clear: both; text-align: left;" data-material="true">
  <section style="display: inline-block; position: relative; background: #fef08a; padding: 7px 18px 7px 14px; border-radius: 4px; transform: rotate(-1.5deg); box-shadow: 2px 3px 6px rgba(0,0,0,0.08); border-left: 4px solid #eab308;">
    <span style="position: absolute; top: -10px; left: 10px; font-size: 16px;">📌</span>
    <span style="font-family: 'PingFang SC', sans-serif; font-size: 16px; font-weight: 800; color: #713f12; margin-left: 14px; letter-spacing: 0.5px;">
      今日灵感清单与实操笔记
    </span>
  </section>
</section>`
  },
  {
    id: 'h-pill-duotone',
    category: 'headings',
    tag: '现代双色',
    title: '现代双色·渐变胶囊药丸标题',
    description: '深蓝主序号胶囊 + 天蓝浅底扩展条 + 纯白反差对亮点',
    tags: ['双色', '胶囊', '药丸', '现代', '清爽'],
    html: `<section style="margin: 28px 0 18px; clear: both;" data-material="true">
  <section style="display: inline-flex; align-items: center; background: #eff6ff; border-radius: 9999px; padding: 3px 16px 3px 4px; border: 1px solid #bfdbfe;">
    <span style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);">
      STEP 01
    </span>
    <span style="font-size: 15px; font-weight: 700; color: #1e3a8a; margin-left: 10px; letter-spacing: 0.2px;">
      系统环境初始化与脚手架搭建
    </span>
  </section>
</section>`
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. 金句与引用类 (quotes) - 多样化审美风格
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'q-terminal-log',
    category: 'quotes',
    tag: '极客终端',
    title: '极客 Mac 终端·命令输出引用框',
    description: 'macOS 红黄绿三色原生按钮 + 暗色磨砂背景 + 极客哲学金句',
    tags: ['极客', '终端', 'macOS', '代码', '金句'],
    html: `<section style="margin: 24px 0; background: #0f172a; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" data-material="true">
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
    <p style="margin: 0; color: #f1f5f9; font-style: italic;">“软件工程的本质不是制造复杂，而是在极度混乱的现实世界中建立清晰的抽象与秩序。”</p>
    <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0; text-align: right;">— 《Clean Code 架构思考》</p>
  </div>
</section>`
  },
  {
    id: 'q-ancient-scroll',
    category: 'quotes',
    tag: '古风宣纸',
    title: '古风典籍·宣纸朱砂双线古卷引用',
    description: '宣纸米黄底色 + 典雅回纹边框 + 朱砂红篆刻印章 + 典雅竖排风韵',
    tags: ['古风', '宣纸', '水墨', '金句', '国风'],
    html: `<section style="margin: 24px 0; padding: 22px 24px; background: #faf7f0; border: 2px solid #e7dfd1; border-radius: 8px; position: relative; box-shadow: inset 0 0 12px rgba(217, 201, 179, 0.25);" data-material="true">
  <div style="border: 1px dashed #c4b5a0; padding: 16px 20px; text-align: center;">
    <p style="font-family: 'Songti SC', 'Source Han Serif SC', serif; font-size: 15.5px; line-height: 1.85; color: #451a03; margin: 0; letter-spacing: 1.5px; font-weight: 500;">
      “博学之，审问之，慎思之，明辨之，笃行之。天下之事，闻之不若见之，见之不若知之，知之不若行之。”
    </p>
    <div style="margin-top: 12px; font-size: 12px; color: #b91c1c; font-weight: 700; letter-spacing: 2px;">
      【 儒林·礼记中庸 】
    </div>
  </div>
</section>`
  },
  {
    id: 'q-magazine-bigquote',
    category: 'quotes',
    tag: '大刊金句',
    title: '大刊双引号·巨型流光大字符金句',
    description: '左上角 72px 浅蓝半透立体大双引号 + 斜体精致社论观点排版',
    tags: ['大刊', '双引号', '名言', '杂志', '高级'],
    html: `<section style="margin: 28px 0; padding: 24px 28px; background: #f8fafc; border-left: 4px solid #0f172a; border-radius: 0 12px 12px 0; position: relative;" data-material="true">
  <div style="font-family: Georgia, serif; font-size: 72px; color: rgba(15, 23, 42, 0.12); position: absolute; top: -10px; left: 16px; line-height: 1; user-select: none;">
    “
  </div>
  <p style="position: relative; z-index: 1; margin: 0; font-family: 'Georgia', 'Songti SC', serif; font-size: 16px; font-weight: 600; line-height: 1.75; color: #1e293b; font-style: italic;">
    真正优秀的设计不是把所有东西堆砌完整，而是直到没有任何一件多余的东西可以再被拿走。
  </p>
  <div style="margin-top: 10px; text-align: right; font-size: 12.5px; color: #64748b; font-weight: 700;">
    — 安托万·德·圣-埃克苏佩里
  </div>
</section>`
  },
  {
    id: 'q-highlighter-marker',
    category: 'quotes',
    tag: '荧光涂抹',
    title: '手绘荧光·胶带纸荧光笔涂抹金句',
    description: '荧光黄手绘高亮背景 + 倾斜半透胶带纸固定 + 亲和力手写便签感',
    tags: ['荧光笔', '胶带', '手绘', '便签', '金句'],
    html: `<section style="margin: 26px 0; padding: 20px 22px; background: #fffdf5; border: 1px solid #fef08a; border-radius: 6px; position: relative; box-shadow: 2px 4px 12px rgba(234, 179, 8, 0.08);" data-material="true">
  <div style="width: 60px; height: 16px; background: rgba(253, 224, 71, 0.6); position: absolute; top: -8px; left: 50%; transform: translateX(-50%) rotate(-1deg); border-radius: 2px;"></div>
  <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #713f12; font-weight: 600;">
    <span style="background: linear-gradient(180deg, transparent 60%, #fef08a 60%); padding: 0 4px;">
      保持对未知的好奇，把每一次挑战当成认知的升级。做长期有价值的事，时间会成为最坚固的盟友。
    </span>
  </p>
</section>`
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. 提示与警告卡片类 (callouts) - Notion 彩卡 & 极客状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'c-notion-info',
    category: 'callouts',
    tag: 'Notion彩卡',
    title: 'Notion 极简彩卡·天蓝信息提示盒',
    description: '极简浅蓝底色 + 圆形信息图标 + 柔和灰蓝正文',
    tags: ['Notion', 'Info', '信息', '提示', '蓝调'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">ℹ️</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #1e40af; margin-bottom: 2px;">核心信息提示 (Note)</div>
    <div style="font-size: 13.5px; color: #1e3a8a; line-height: 1.6;">
      系统默认在每周一凌晨 03:00 自动进行冷数据归档与索引重建，期间只读操作不受任何影响。
    </div>
  </div>
</section>`
  },
  {
    id: 'c-notion-tip',
    category: 'callouts',
    tag: 'Notion彩卡',
    title: 'Notion 极简彩卡·薄荷绿技巧小贴士',
    description: '清爽薄荷绿底色 + 灯泡技巧图标 + 实操效率建议',
    tags: ['Notion', 'Tip', '技巧', '小贴士', '绿色'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">💡</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 2px;">效率提升技巧 (Pro Tip)</div>
    <div style="font-size: 13.5px; color: #14532d; line-height: 1.6;">
      使用快捷键 <code style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;">Cmd + K</code> 可以快速调出全局多渠道一键发布控制台。
    </div>
  </div>
</section>`
  },
  {
    id: 'c-notion-warning',
    category: 'callouts',
    tag: 'Notion彩卡',
    title: 'Notion 极简彩卡·暖橙警示避坑指南',
    description: '暖橙警示底色 + 叹号三角图标 + 避坑注意要点',
    tags: ['Notion', 'Warning', '警告', '避坑', '橙色'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">⚠️</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #9a3412; margin-bottom: 2px;">重点注意要点 (Warning)</div>
    <div style="font-size: 13.5px; color: #7c2d12; line-height: 1.6;">
      在修改核心生产环境配置前，务必先在测试环境完整执行压力测试并备份全量数据库快照。
    </div>
  </div>
</section>`
  },
  {
    id: 'c-notion-danger',
    category: 'callouts',
    tag: 'Notion彩卡',
    title: 'Notion 极简彩卡·绯红高危禁止操作箱',
    description: '绯红警戒底色 + 禁止手势图标 + 高危红线警示',
    tags: ['Notion', 'Danger', '危险', '红线', '禁止'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; display: flex; align-items: flex-start; gap: 12px;" data-material="true">
  <span style="font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px;">🛑</span>
  <div style="flex: 1; min-width: 0;">
    <div style="font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 2px;">高危红线警示 (Danger)</div>
    <div style="font-size: 13.5px; color: #7f1d1d; line-height: 1.6;">
      严禁在未经脱敏的代码仓库中硬编码生产 API Key、密码与私钥，违者将触发安全审计封禁。
    </div>
  </div>
</section>`
  },
  {
    id: 'c-folded-memo',
    category: 'callouts',
    tag: '立体便签',
    title: '3D 立体·右上折角便签贴',
    description: '右上角立体折角阴影 + 浅鹅黄温馨底色 + 纸张微浮动质感',
    tags: ['便签', '折角', '3D', '手账', '卡片'],
    html: `<section style="margin: 24px 0; padding: 18px 22px; background: #fef9c3; border-radius: 8px 0 8px 8px; border: 1px solid #fde047; position: relative; box-shadow: 3px 5px 15px rgba(0,0,0,0.06);" data-material="true">
  <div style="position: absolute; top: -1px; right: -1px; width: 0; height: 0; border-style: solid; border-width: 0 20px 20px 0; border-color: transparent #facc15 transparent transparent; box-shadow: -1px 1px 3px rgba(0,0,0,0.12);"></div>
  <div style="font-size: 14px; font-weight: 700; color: #854d0e; margin-bottom: 4px;">📝 备忘速记 / Quick Memo</div>
  <div style="font-size: 13.5px; color: #713f12; line-height: 1.65;">
    记得在文章结尾附上互动问答与投票组件，可大幅提升粉丝在公众号底部的留言互动率与在看转化。
  </div>
</section>`
  },
  {
    id: 'c-metric-kpi-card',
    category: 'callouts',
    tag: '数据看板',
    title: '核心指标·大厂成果数据看板卡',
    description: '3 列核心业务指标大数字 + 增长百分比 + 结构化对比',
    tags: ['数据', '看板', '指标', 'KPI', '增长'],
    html: `<section style="margin: 24px 0; padding: 18px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;" data-material="true">
  <div style="padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 11px; color: #64748b; font-weight: 600;">全网总阅读</div>
    <div style="font-size: 20px; font-weight: 800; color: #2563eb; margin: 4px 0;">120W+</div>
    <div style="font-size: 10px; color: #16a34a; font-weight: 600;">↑ 35% 同比增长</div>
  </div>
  <div style="padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 11px; color: #64748b; font-weight: 600;">分发耗时</div>
    <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0;">3.2s</div>
    <div style="font-size: 10px; color: #16a34a; font-weight: 600;">⚡ 效率提升 10x</div>
  </div>
  <div style="padding: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
    <div style="font-size: 11px; color: #64748b; font-weight: 600;">粉丝留存率</div>
    <div style="font-size: 20px; font-weight: 800; color: #7c3aed; margin: 4px 0;">94.8%</div>
    <div style="font-size: 10px; color: #16a34a; font-weight: 600;">★ 行业顶尖</div>
  </div>
</section>`
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. 步骤与列表类 (lists) - 多样化列表呈现
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'l-timeline-milestone',
    category: 'lists',
    tag: '时间轴',
    title: '彩色时间轴·大事记里程碑流程',
    description: '纵向连线时间轴 + 彩色阶梯节点 + 卡片式事件演进',
    tags: ['时间轴', '里程碑', '步骤', '发展历程', '节点'],
    html: `<section style="margin: 26px 0; padding: 10px 4px;" data-material="true">
  <div style="position: relative; padding-left: 24px; border-left: 2px dashed #93c5fd; margin-bottom: 20px;">
    <span style="position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #93c5fd;"></span>
    <div style="font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase;">阶段一 · 需求洞察与立项</div>
    <div style="font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;">完成行业竞品深度调研与用户痛点画像建模，确定核心功能矩阵。</div>
  </div>
  <div style="position: relative; padding-left: 24px; border-left: 2px dashed #93c5fd; margin-bottom: 20px;">
    <span style="position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #7dd3fc;"></span>
    <div style="font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase;">阶段二 · 核心引擎敏捷迭代</div>
    <div style="font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;">搭建自研 AST 语法树解析器与微信专用富文本样式渲染引擎。</div>
  </div>
  <div style="position: relative; padding-left: 24px;">
    <span style="position: absolute; left: -8px; top: 0; width: 14px; height: 14px; border-radius: 50%; background: #16a34a; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #86efac;"></span>
    <div style="font-size: 12px; font-weight: 800; color: #16a34a; text-transform: uppercase;">阶段三 · 全网公测与商业化发布</div>
    <div style="font-size: 13.5px; color: #334155; line-height: 1.6; margin-top: 4px;">接入微信公众号、知乎、掘金一键多渠道分发网关，服务 10w+ 创作者。</div>
  </div>
</section>`
  },
  {
    id: 'l-task-checklist',
    category: 'lists',
    tag: '任务清单',
    title: '极简方格·任务清单待办 Checklist',
    description: 'Notion 风格方形复选框 + 已完成与未完成对照清单',
    tags: ['清单', 'Checklist', '待办', 'Notion', '任务'],
    html: `<section style="margin: 22px 0; padding: 18px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);" data-material="true">
  <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">📋 发布前自查清单 (Pre-flight Checklist)</div>
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
    <span style="width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">✓</span>
    <span style="font-size: 13.5px; color: #64748b; text-decoration: line-through;">检查文章首图与封面比例是否为 2.35:1 官方规范</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
    <span style="width: 18px; height: 18px; background: #10b981; color: #ffffff; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">✓</span>
    <span style="font-size: 13.5px; color: #64748b; text-decoration: line-through;">校对代码块中关键字高亮与中英文空格规范</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px;">
    <span style="width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 4px; display: inline-block;"></span>
    <span style="font-size: 13.5px; color: #1e293b; font-weight: 600;">一键同步多平台分发并配置原创声明标签</span>
  </div>
</section>`
  },
  {
    id: 'l-pros-cons-grid',
    category: 'lists',
    tag: '红蓝对比',
    title: '红蓝对比·优缺点 Pros & Cons 左右卡',
    description: '左侧翠绿优势清单 vs 右侧珊瑚红劣势清单对比',
    tags: ['对比', '优缺点', 'Pros', 'Cons', '选型'],
    html: `<section style="margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" data-material="true">
  <div style="padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
    <div style="font-size: 13.5px; font-weight: 800; color: #166534; margin-bottom: 8px;">✅ 核心优势 (Pros)</div>
    <ul style="margin: 0; padding-left: 16px; font-size: 12.5px; color: #14532d; line-height: 1.7;">
      <li>毫秒级热重载排版渲染</li>
      <li>全自动同步至微信公众号</li>
      <li>支持自定义 CSS 深度定制</li>
    </ul>
  </div>
  <div style="padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;">
    <div style="font-size: 13.5px; font-weight: 800; color: #991b1b; margin-bottom: 8px;">⚠️ 潜在局限 (Cons)</div>
    <ul style="margin: 0; padding-left: 16px; font-size: 12.5px; color: #7f1d1d; line-height: 1.7;">
      <li>需要一定 Markdown 语法基础</li>
      <li>部分小众平台授权有效期受限</li>
    </ul>
  </div>
</section>`
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. 代码与技术展示类 (tech_cards) - 开发者硬核专属
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'tech-macos-window',
    category: 'tech_cards',
    tag: 'macOS代码',
    title: 'macOS 原生终端·代码展示窗口',
    description: 'macOS 经典红黄绿三色控制圆点 + 深曜石代码框',
    tags: ['代码', 'macOS', '终端', '开发', '极客'],
    html: `<section style="margin: 24px 0; background: #1e1e24; border-radius: 10px; overflow: hidden; border: 1px solid #2d2d38; box-shadow: 0 8px 24px rgba(0,0,0,0.18);" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #26262e;">
    <div style="display: flex; gap: 6px;">
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
      <span style="width: 10px; height: 10px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
    </div>
    <span style="color: #94a3b8; font-size: 11px; font-family: monospace;">ServerEngine.ts</span>
    <span style="color: #64748b; font-size: 11px; font-family: monospace;">TypeScript</span>
  </div>
  <pre style="margin: 0; padding: 16px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; line-height: 1.6; color: #f8fafc; overflow-x: auto; background: transparent;"><code style="color:#f8fafc;"><span style="color:#c678dd;">export async function</span> <span style="color:#61afef;">publishArticle</span>(doc: <span style="color:#e5c07b;">ArticlePayload</span>) {
  <span style="color:#5c6370;font-style:italic;">// 一键并行分发至全渠道</span>
  <span style="color:#c678dd;">const</span> res = <span style="color:#c678dd;">await</span> <span style="color:#e5c07b;">Promise</span>.<span style="color:#61afef;">all</span>([
    <span style="color:#61afef;">syncToWeChat</span>(doc),
    <span style="color:#61afef;">syncToZhihu</span>(doc)
  ]);
  <span style="color:#c678dd;">return</span> { <span style="color:#e06c75;">success</span>: <span style="color:#d19a66;">true</span>, <span style="color:#e06c75;">data</span>: res };
}</code></pre>
</section>`
  },
  {
    id: 'tech-api-endpoint',
    category: 'tech_cards',
    tag: 'API文档',
    title: 'RESTful API·接口路由与参数规范卡',
    description: 'POST 翠绿药丸徽章 + 请求路径 + 参数结构表',
    tags: ['API', 'RESTful', '接口', '后端', '架构'],
    html: `<section style="margin: 22px 0; padding: 16px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;" data-material="true">
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
    <span style="background: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; font-family: monospace;">POST</span>
    <code style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #0f172a;">/api/v2/articles/sync</code>
  </div>
  <div style="font-size: 12.5px; color: #64748b; margin-bottom: 8px;">支持传入 Markdown 原文并指定目标分发平台列表与授权令牌。</div>
  <div style="background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px; color: #334155;">
    Content-Type: application/json; charset=utf-8
  </div>
</section>`
  },
  {
    id: 'tech-kbd-shortcuts',
    category: 'tech_cards',
    tag: '快捷键',
    title: '立体按键·键盘快捷键组合展示栏',
    description: '拟物立体质感 KBD 键盘按键 + 功能快捷操作说明',
    tags: ['快捷键', 'KBD', '键盘', '效率', '工具'],
    html: `<section style="margin: 20px 0; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;" data-material="true">
  <span style="font-size: 13.5px; font-weight: 700; color: #1e293b;">⚡ 全屏专注排版模式</span>
  <div style="display: flex; align-items: center; gap: 4px;">
    <kbd style="display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Ctrl</kbd>
    <span style="color: #94a3b8; font-weight: 700;">+</span>
    <kbd style="display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Shift</kbd>
    <span style="color: #94a3b8; font-weight: 700;">+</span>
    <kbd style="display: inline-block; padding: 4px 8px; font-family: inherit; font-size: 11px; font-weight: 700; color: #1e293b; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8; border-radius: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">F</kbd>
  </div>
</section>`
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. 表格与对比矩阵类 (tables) - 现代化专业数据对比
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'tbl-modern-striped',
    category: 'tables',
    tag: '斑马表格',
    title: '现代无界·斑马交替行数据明细表',
    description: '深曜石表头 + 浅灰交替底色 + 优雅圆角外框',
    tags: ['表格', '斑马纹', '数据', '对比', '现代'],
    html: `<section style="margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px;" data-material="true">
  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; font-family: sans-serif;">
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
    category: 'tables',
    tag: '方案对比',
    title: '版本矩阵·免费版 vs 专业版特性对比',
    description: '结构化方案功能点对勾比对卡片',
    tags: ['版本对比', '功能矩阵', '方案', '表格'],
    html: `<section style="margin: 24px 0; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);" data-material="true">
  <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 13px;">
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. 分割线与装饰类 (dividers) - 灵动多样
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'd-sparkle-diamond',
    category: 'dividers',
    tag: '星芒分割',
    title: '星芒闪耀·双侧流光居中微光分割线',
    description: '居中 ✨ 闪光星芒 + 双侧渐变流光细线',
    tags: ['分割线', '星芒', '极简', '装饰', '优雅'],
    html: `<section style="margin: 28px 0; text-align: center; display: flex; align-items: center; justify-content: center; gap: 14px;" data-material="true">
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #cbd5e1);"></div>
  <span style="font-size: 14px; color: #64748b; transform: scale(1.2);">✦ ✦ ✦</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(90deg, #cbd5e1, transparent);"></div>
</section>`
  },
  {
    id: 'd-scissors-coupon',
    category: 'dividers',
    tag: '虚线剪刀',
    title: '虚线剪刀·优惠券裁切打孔分割线',
    description: '✂️ 经典裁切剪刀 + 细密打孔虚线',
    tags: ['分割线', '剪刀', '打孔', '虚线', '活动'],
    html: `<section style="margin: 28px 0; display: flex; align-items: center; gap: 8px; color: #94a3b8;" data-material="true">
  <span style="font-size: 16px; transform: rotate(-90deg);">✂️</span>
  <div style="flex: 1; border-top: 1.5px dashed #cbd5e1; height: 0;"></div>
</section>`
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. 顶部导读与文末互动类 (header_widgets / footer_widgets)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'hw-tldr-summary',
    category: 'header_widgets',
    tag: 'TL;DR导读',
    title: '观点精粹·TL;DR 30秒核心要点速览',
    description: '高亮总结卡片，帮助读者30秒抓住全文核心精髓',
    tags: ['导读', 'TLDR', '摘要', '要点', '开头'],
    html: `<section style="margin: 0 0 24px 0; padding: 18px 20px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);" data-material="true">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
    <div style="font-size: 14px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
      <span>⚡</span> <span>TL;DR · 30秒核心要点</span>
    </div>
    <span style="font-size: 11px; color: #64748b; background: #e2e8f0; padding: 2px 8px; border-radius: 9999px;">精读约 5 分钟</span>
  </div>
  <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155; line-height: 1.75;">
    <li><strong>痛点所在：</strong> 传统内容跨平台排版耗时长、格式易崩塌。</li>
    <li><strong>解决方案：</strong> 采用 AST 抽象语法树与专属 CSS 隔离渲染引擎。</li>
    <li><strong>落地效果：</strong> 全网矩阵同步发布效率提升 10 倍以上。</li>
  </ul>
</section>`
  },
  {
    id: 'fw-social-matrix',
    category: 'footer_widgets',
    tag: '社交矩阵',
    title: '全网矩阵·微信/掘金/知乎多平台一键关注',
    description: '极具品质的多社交平台彩色徽标阵列与订阅引导',
    tags: ['文末', '关注', '社交矩阵', '微信', '知乎', '掘金'],
    html: `<section style="margin: 32px 0 16px; padding: 22px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.04); text-align: center;" data-material="true">
  <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">🚀 与 100,000+ 创作者共同成长</div>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">欢迎在各大技术社区关注我的专栏，获取每周独家干货更新</p>
  <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;">
    <span style="background: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bbf7d0;">💚 微信公众号</span>
    <span style="background: #eff6ff; color: #1e40af; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #bfdbfe;">💙 知乎专栏</span>
    <span style="background: #fff7ed; color: #c2410c; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #fed7aa;">🧡 稀土掘金</span>
    <span style="background: #f8fafc; color: #0f172a; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid #cbd5e1;">🖤 GitHub 开源</span>
  </div>
</section>`
  }
];

const targetFilePath = path.join(__dirname, '..', 'src', 'utils', 'materialLibrary.js');
let rawContent = fs.readFileSync(targetFilePath, 'utf8');

// Normalize line endings for replacement
const content = rawContent.replace(/\r\n/g, '\n');

const targetHeadingSection = '\n// ── 标题模版定义（H1 / H2 / H3 / H4 / H5 / H6）──';
const targetPos = content.indexOf(targetHeadingSection);

if (targetPos === -1) {
  console.error('❌ Could not find target section in materialLibrary.js');
  process.exit(1);
}

// Find the last item before `];`
const lastBracketPos = content.lastIndexOf('];', targetPos);

if (lastBracketPos === -1) {
  console.error('❌ Could not find materials array closing bracket');
  process.exit(1);
}

const formattedNewMaterials = newMaterials.map(m => {
  return `  {\n    id: ${JSON.stringify(m.id)},\n    category: ${JSON.stringify(m.category)},\n    tag: ${JSON.stringify(m.tag)},\n    title: ${JSON.stringify(m.title)},\n    description: ${JSON.stringify(m.description)},\n    tags: ${JSON.stringify(m.tags)},\n    html: ${JSON.stringify(m.html)}\n  }`;
}).join(',\n');

const before = content.slice(0, lastBracketPos);
const after = content.slice(lastBracketPos);

const updatedContent = before.trimEnd() + ',\n' + formattedNewMaterials + '\n' + after;

fs.writeFileSync(targetFilePath, updatedContent, 'utf8');
console.log(`✅ Successfully injected ${newMaterials.length} diverse materials into materialLibrary.js!`);
