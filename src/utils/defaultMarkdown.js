export const defaultMarkdown = `# NiceMD 全语法 Markdown 排版全集模板

欢迎使用 **NiceMD** —— 专为微信公众号、知乎、掘金、CSDN 等平台打造的极简 Markdown 微信排版工具。

本篇文档汇总了 **NiceMD 支持的所有 Markdown 语法与排版元素**。你可以用它来测试各大主题的渲染效果，也可以作为日常创作的参考指南！

---

## 一、 1到6级标题样式 (Headings)

# 1级标题 (H1)
## 2级标题 (H2)
### 3级标题 (H3)
#### 4级标题 (H4)
##### 5级标题 (H5)
###### 6级标题 (H6)

---

## 二、 文本样式与修饰 (Text Formatting)

* **粗体强调**：**Spring Boot 3.0 核心原理解析**
* *斜体文本*：*延迟初始化与按需加载*
* ***粗斜体组合***：***重要提示：请勿在主线程执行耗时操作***
* <u>下划线文本</u>：<u>下划线修饰词句</u>
* ~~删除线文本~~：~~原定于 8 月 1 日上线~~（已废弃/变更）
* <mark>高亮标记文本</mark>：<mark>标记关键重点内容</mark>
* 上标与下标：水的化学式为 H<sub>2</sub>O，勾股定理 X<sup>2</sup> + Y<sup>2</sup> = Z<sup>2</sup>
* 行内代码块：使用 \`ObjectFactory<T>\` 或 \`getEarlyBeanReference\` 标记代码词汇
* 键盘按键标签：按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制，按 <kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴
* 带有脚注文档说明的句子[^1]。

---

## 三、 彩色文字、标签与排版对齐 (Colors & Alignments)

### 1. 彩色文字与调色标签
* <font color="#2563eb">蓝色字体强调</font> | <font color="#dc2626">红色警告字体</font> | <font color="#059669">绿色成功字体</font>
* 高颜值胶囊标签：<span style="background:#eff6ff;color:#2563eb;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">核心技术</span> <span style="background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;">爆款推荐</span>

### 2. 段落对齐
<p align="center"><b>【居中对齐】</b> 专为多平台创作打造的极简排版神器</p>

<p align="right">—— 程序员小富 / 2026 年 8 月撰</p>

---

## 四、 分割线与引用块 (Blockquotes & Callouts)

### 1. 基础引用块
> 很多人就知道 Spring 是靠三级缓存来解决循环依赖的。但其实二级缓存就已经足够解决普通循环依赖了。引入第三级缓存，是为了解决 AOP 代理对象的延迟生成问题。

### 2. 多级嵌套引用块
> 📌 **一级引用**：现代前端架构的核心三要素
>> 💡 **二级嵌套**：组件化设计、自动化构建与监控基建
>>> 🚀 **三级嵌套**：选择适合团队技术栈的技术选型是关键

---

## 五、 无序、有序与任务列表 (Lists)

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
- [x] **已完成**：上线全新的模板中心与全语法 Markdown 示例文档
- [ ] **待办**：支持更多自定义品牌 CSS 样式一键导入

---

## 六、 代码块 (Code Blocks)

### 1. JavaScript / TypeScript 代码块
\`\`\`javascript
// 测试 Spring 循环依赖与解压小动画
function launchConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
console.log("NiceMD 渲染引擎初始化完成！");
\`\`\`

### 2. Java 代码块
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

### 3. SQL 语句代码块
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
    Actor 用户
    Participant 编辑器
    Participant 后端API
    用户->>编辑器: 点击一键分发
    编辑器->>后端API: 发送文章 HTML & 凭证
    后端API-->>编辑器: 返回同步成功结果
    编辑器-->>用户: 播放解压礼花动画
\`\`\`

### 3. 饼图 (Pie Chart)
\`\`\`mermaid
pie title 常见文章分发渠道占比
    "微信公众号" : 45
    "知乎专栏" : 25
    "掘金 / CSDN" : 20
    "个人博客" : 10
\`\`\`

---

## 八、 LaTeX 数学公式 (LaTeX Math)

### 1. 行内数学公式
例如著名的质能方程 $E = mc^2$，欧拉恒等式 $e^{i\\pi} + 1 = 0$，以及勾股定理 $a^2 + b^2 = c^2$。

### 2. 块级数学公式
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2\\pi i \\xi x}\\,d\\xi
$$

---

## 九、 多对齐方式表格 (Tables)

| 语法名称 | 源码写法示例 | 渲染效果 | 适用排版场景 |
| :--- | :---: | :---: | ---: |
| **标题 H1~H6** | \`# 标题名称\` | 各种级别标题 | 章节划分 |
| **粗体** | \`**文本**\` | **粗体** | 重点强调 |
| **删除线** | \`~~文本~~\` | ~~删除线~~ | 作废/改动标注 |
| **行内代码** | \`code\` | \`code\` | 类名与命令 |
| **数学公式** | \`$E=mc^2$\` | $E=mc^2$ | 理工科与推导 |

---

## 十、 链接与多媒体 (Links & Images)

### 1. 链接说明
* 外部链接（分发时自动降级为文本脚注，符合微信规范）：[NiceMD 官方网站](https://github.com)
* 微信内部文章链接（分发时保留超链接）：https://mp.weixin.qq.com/s/sample

### 2. 图片排版与阴影样式
![NiceMD 效果展示图](/images/demo-banner.png)

---

## 十一、 折叠块与扩展组件 (Collapsible Details)

<details>
  <summary>🔍 点击展开查看折叠的高阶技术说明</summary>
  <p>NiceMD 支持原生的 HTML 混排语法，您可以直接在 Markdown 中嵌入 kbd 标签、自定义 HTML 容器以及内联 Style 样式！</p>
</details>

---

[^1]: 脚注（Footnote）常用于长文、论文或技术文章的文献来源说明与出处标注。

欢迎开始您的创作与排版！✍️
`;
