import { logger } from './logger.js';
export const defaultMarkdown = `---
title: EasyMD 全语法 Markdown 排版全集模板
author: 程序员小富
tags: [Markdown, 微信公众号, 排版]
---

# EasyMD 全语法 Markdown 排版全集模板

欢迎使用 **EasyMD** —— 专为微信公众号、知乎、掘金、CSDN 等平台打造的极简 Markdown 微信排版工具 :rocket: :sparkles:。

本篇文档汇总了 **EasyMD 支持的所有标准与扩展 Markdown 语法**（包括文档顶部的 YAML Front Matter 元信息，预览与导出时会自动隐藏过滤）。你可以直接用来测试各大主题渲染效果，也可以作为日常创作参考指南 :bulb:！

## 目录导航

[TOC]

---

## 一、 1到6级标题样式 (Headings)

# 1级标题 (H1)
## 2级标题 (H2)
### 3级标题 (H3)
#### 4级标题 (H4)
##### 5级标题 (H5)
###### 6级标题 (H6)

---

## 二、 文本样式与扩展行内语法 (Text & Inline Extensions)

* **粗体强调**：**Spring Boot 3.0 核心原理解析**
* *斜体文本*：*延迟初始化与按需加载*
* ***粗斜体组合***：***重要提示：请勿在主线程执行耗时操作***
* **标准下划线**：++使用双加号绘制下划线重点句++（亦兼容原生 <u>HTML 下划线</u>）
* ~~删除线文本~~：~~原定于 8 月 1 日上线~~（已废弃/变更）
* **标准高亮标记**：==使用双等号高亮核心关键词==
* **上标与下标**：水的化学式为 H~2~O，勾股定理 X^2^ + Y^2^ = Z^2^
* **Emoji 短代码**：支持 \`:rocket:\` :rocket:、\`:fire:\` :fire:、\`:sparkles:\` :sparkles:、\`:100:\` :100:、\`:bulb:\` :bulb: 等常见短代码
* **中文注音 / Ruby**：支持拼音或注释标注，例如 {山海}^(shān hǎi) 与 {排版}^(pái bǎn)
* **术语缩写提示**：鼠标悬停 HTML、API 或 SVG 等缩写词可查看完整释义，导出公众号时自动转为清晰可读文本
* **行内代码块**：使用 \`ObjectFactory<T>\` 或 \`getEarlyBeanReference\` 标记代码词汇
* **键盘按键标签**：按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制，按 <kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴
* **多条文末脚注**：带有文献说明的句子[^1]，以及更多排版扩展细节[^2]。

---

## 三、 彩色文字、标签与排版对齐 (Colors & Alignments)

### 1. 彩色文字与调色标签
* <font color="#2563eb">蓝色字体强调</font> | <font color="#dc2626">红色警告字体</font> | <font color="#059669">绿色成功字体</font>
* 高颜值胶囊标签：<span style="background:#eff6ff;color:#2563eb;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">核心技术</span> <span style="background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">爆款推荐</span>

### 2. 段落对齐
<p align="center"><b>【居中对齐】</b> 专为多平台创作打造的极简排版神器</p>

<p align="right">—— 程序员小富 / 2026 年 8 月撰</p>

---

## 四、 引用块与提示卡片容器 (Blockquotes & Callouts)

### 1. 基础引用块
> 很多人就知道 Spring 是靠三级缓存来解决循环依赖的。但其实二级缓存就已经足够解决普通循环依赖了。引入第三级缓存，是为了解决 AOP 代理对象的延迟生成问题。

### 2. 多级嵌套引用块
> 📌 **一级引用**：现代前端架构的核心三要素
>> 💡 **二级嵌套**：组件化设计、自动化构建与监控基建
>>> 🚀 **三级嵌套**：选择适合团队技术栈的技术选型是关键

### 3. 提示卡片容器 (Callout Containers)
支持 \`note\`、\`info\`、\`tip\`、\`important\`、\`warning\`、\`danger\` 与 \`caution\` 等多种语义化提示框，并自动转换为微信公众号兼容内联卡片：

::: tip 效率提升技巧
使用 **\`[TOC]\`** 目录、**\`==高亮==\`** 与 **\`:rocket:\`** 短代码，无需手写 HTML 即可排出一篇层次分明的公众号长文。
:::

::: important 关键核心要点
所有卡片内部均支持完整的 Markdown 嵌套，例如**加粗文本**、\`行内代码\` 以及多条要点整理。
:::

::: warning 重点注意要点
文章如包含外链或交互式折叠块，一键复制到微信公众号时会自动转为微信友好的静态卡片与文末引用。
:::

::: danger 高危红线警示
使用 \`:::\` 闭合容器时，请确保首尾 \`:::\` 均独占一行，避免后续段落被一并包裹。
:::

---

## 五、 无序、有序、任务与定义列表 (Lists & Definition Lists)

### 1. 无序列表
* **第一级项目符号 A**
  * 缩进二级项目 A-1
  * 缩进二级项目 A-2
* **第一级项目符号 B**

### 2. 有序步骤列表
1. **步骤一：导入/撰写 Markdown 内容**（支持拖拽 Word/PDF 自动转换）
2. **步骤二：选择排版主题与代码高亮**（实时双栏对照预览）
3. **步骤三：一键同步至微信草稿箱**（或导出 Word / PDF / PNG 长图）

### 3. 任务清单 (Checklists)
- [x] **已完成**：重构 Word & PDF 导出引擎，解决跨域与布局适配
- [x] **已完成**：上线全新的模板中心与扩展 Markdown 语法体系
- [ ] **待办**：支持更多自定义品牌 CSS 样式一键导入

### 4. 定义列表 (Definition Lists)
Markdown
: 轻量级标记语言，用纯文本即可编写结构清晰、易读易写的富排版内容。

EasyMD 排版引擎
: 自动解析 \`[TOC]\`、定义列表、注音与 \`:::\` 提示卡片，并实时转为微信兼容的内联样式。

---

## 六、 代码块与 YAML 元信息 (Code Blocks & Front Matter)

### 1. YAML Front Matter 示例（本文第 1~5 行已启用）
\`\`\`yaml
---
title: 文章标题
author: 作者署名
tags: [Markdown, 排版]
---
\`\`\`

### 2. JavaScript / TypeScript 代码块
\`\`\`javascript
// 测试 Spring 循环依赖与解压小动画
function launchConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
logger.info("NiceMD 渲染引擎初始化完成！");
\`\`\`

### 3. Java 代码块
\`\`\`java
public class SingletonFactory {
    private static volatile SingletonFactory instance;
    
    public static SingletonFactory getInstance() {
        if (instance == null) {
            synchronized (SingletonFactory.class) {
                if (instance == null) {
                    instance = new SingletonFactory();
                }
            }
        }
        return instance;
    }
}
\`\`\`

### 4. SQL 语句代码块
\`\`\`sql
SELECT id, title, author, views_count 
FROM articles 
WHERE status = 'PUBLISHED' AND is_deleted = 0 
ORDER BY created_at DESC 
LIMIT 10;
\`\`\`

---

## 七、 Mermaid 流程图、时序图与图表 (Mermaid Diagrams)

### 1. 业务流程拓扑图 (Flowchart)
\`\`\`mermaid
graph TD
    A[撰写 Markdown] --> B[NiceMD 实时渲染]
    B --> C{选择分发渠道}
    C -- 微信公众号 --> D[一键同步草稿箱]
    C -- 导出文档 --> E[导出 Word / PDF / PNG]
    C -- 技术社区 --> F[一键复制代码至掘金/知乎]
\`\`\`

### 2. API 时序交互图 (Sequence Diagram)
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor A as 创作者
    participant B as EasyMD 编辑器
    participant C as 云端排版引擎
    participant D as 微信公众号后台

    A->>B: 输入 Markdown 与素材
    B->>B: 实时解析并渲染精美样式
    A->>B: 点击「同步草稿」
    B->>C: 发起图文同步请求
    C->>D: 推送排版内容至草稿箱
    D-->>C: 返回同步成功 (MediaId)
    C-->>B: 同步完成
    B-->>A: 提示「已成功同步至草稿箱」
\`\`\`

---

## 八、 数学公式 (LaTeX Math)

### 1. 行内数学公式
爱因斯坦质能方程 $E = mc^2$ 与欧拉恒等式 $e^{i\\pi} + 1 = 0$ 可直接嵌在行内排布。

### 2. 独立公式块
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}, \\quad f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2\\pi i \\xi x}\\,d\\xi
$$

---

## 九、 表格样式 (Tables)

| 语法类型 | Markdown 格式 | 渲染效果 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **自动目录** | \`[TOC]\` | 层级可跳转目录 | 长文导航 |
| **高亮与下划线** | \`==高亮==\` / \`++下划线++\` | ==高亮== / ++下划线++ | 重点标注 |
| **上标与下标** | \`X^2^\` / \`H~2~O\` | X^2^ / H~2~O | 公式与角标 |
| **中文注音** | \`{山海}^(shān hǎi)\` | {山海}^(shān hǎi) | 读音与释义 |
| **Emoji 短代码** | \`:rocket:\` \`:sparkles:\` | :rocket: :sparkles: | 情感与视觉点缀 |
| **数学公式** | \`$E=mc^2$\` | $E=mc^2$ | 理工科与推导 |

---

## 十、 链接与指定尺寸图片 (Links & Sized Images)

### 1. 链接说明
* 外部链接（分发时自动降级为文本脚注，符合微信规范）：[EasyMD 官方网站](https://github.com)
* 微信内部文章链接（分发时保留超链接）：https://mp.weixin.qq.com/s/sample

### 2. 自适应大图与指定尺寸图片
常规自适应图片语法 \`![描述](图片地址)\`：

![EasyMD 效果展示图](https://firebook.oss-cn-beijing.aliyuncs.com/2026/08/841876a55a964959.png)

通过 \`=宽x高\` 指定展示尺寸（例如 \`=260xauto\` 固定宽度自适应高度）：

![指定宽度示例图 (=260xauto)](https://firebook.oss-cn-beijing.aliyuncs.com/2026/08/841876a55a964959.png =260xauto)

---

## 十一、 折叠详情块 (Collapsible Details)

### 1. Markdown 容器折叠语法 (\`::: details\`)
::: details 点击展开查看 Markdown 容器折叠详情
通过 \`::: details 标题\` 即可用纯 Markdown 创建交互式折叠内容，内部支持 **粗体**、\`行内代码\` 与列表；一键复制至微信公众号时会自动展开为静态卡片，保证微信读者可直接阅读！
:::

### 2. 原生 HTML 折叠块 (\`<details>\`)
<details>
  <summary>🔍 点击展开查看折叠的高阶技术说明</summary>
  <p>EasyMD 同时兼容原生 HTML 混排语法，您可以直接在 Markdown 中嵌入 kbd 标签、自定义 HTML 容器以及内联 Style 样式！</p>
</details>

---

[^1]: 脚注（Footnote）常用于长文、论文或技术文章的文献来源说明与出处标注。
[^2]: 支持多条文末脚注按引用顺序自动编号；复制至微信公众号时会自动转化为静态文末参考列表。

*[HTML]: Hyper Text Markup Language（超文本标记语言）
*[API]: Application Programming Interface（应用程序编程接口）
*[SVG]: Scalable Vector Graphics（可缩放矢量图形）

欢迎开始您的创作与排版！✍️
`;
