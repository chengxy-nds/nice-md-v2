# Nice-MD v2 多渠道发布平台与封面管理系统优化记录

---

## 📋 概述
本文档记录了 **Nice-MD v2** 在多渠道分发抽屉（Launchpad）、渠道展示管理、发布设置及文章封面全流程管理上的需求迭代与技术实现方案。

---

## 🚀 核心需求与迭代记录

### 一、 渠道管理与登录状态控制
1. **未登录平台限制**：
   - 未登录的平台在分发列表与渠道管理弹窗中不可选/禁用勾选，点击直接打开目标渠道登录授权页面；
   - 修复了“未登录”文案重复问题，统一精简为可交互的 `去登录 >` 标签。
2. **真实用户信息展示**：
   - 渠道管理弹窗中的格式说明替换为展示当前渠道已登录的实际用户名称（如“程序员小富”等）。
3. **已登录渠道置顶排序**：
   - 分发抽屉列表及渠道管理分类列表中，已登录平台自动排在最前列，提升操作效率。
4. **点击用户名直达主页**：
   - 在渠道管理弹窗与分发抽屉列表中，点击已登录渠道的用户名，即可自动跳转至对应平台的用户个人主页或创作者后台（如知乎个人页、掘金主页、博客园主页、LearnKu 个人页等）。
5. **渠道管理弹窗重构**：
   - 弹窗宽度扩展至 `min(58rem, 95vw)`，全面适配各类屏幕分辨率；
   - 布局改造为**左侧分类导航栏**（全部分类、技术社区、新媒体平台）+ **右侧卡片网格**；
   - 移除了冗余的装饰图标与“恢复默认”按钮；
   - 工具栏入口按钮文本由「批量管理」正式命名为「渠道管理」。

---

### 二、 发布抽屉布局与设置项优化
1. **视觉美化**：
   - 优化了左上角纸飞机品牌徽章背景色，调整为更轻盈透亮的浅橙粉底色（`#fff8f5`）。
2. **精简设置选项**：
   - 暂时隐藏「定时发布」与「原创声明」开关，界面全面聚焦于「文章封面」。
3. **底部操作栏横向排版**：
   - 底部按钮调整为左右横向排布：**一键发布按钮占据 4/5 宽度**，右侧搭配「发布后打开草稿」配置项。

---

### 三、 文章封面管理与沉浸式大图预览体系

#### 1. 沉浸式毛玻璃大图预览（Lightbox）
- **触发方式**：点击封面右下角放大图标或直接点击封面卡片；
- **视觉风格**：摒弃传统白框弹窗，采用 Apple 级全屏深色毛玻璃（`backdrop-filter: blur(20px)`）+ 居中立体无边框卡片；
- **顶部悬浮胶囊控制栏**：半透明毛玻璃胶囊提供「更换封面」与灵动「关闭」控制。

#### 2. 更换封面多源选择弹窗
- **文章正文插图智能嗅探**：
  - 自动解析 Markdown 正文与 HTML 内容中的所有图片链接，去重后生成「从文章插图中选择」图库；
  - 支持单选勾选、高亮边框和选中角标。
- **本地图片上传**：
  - 顶部提供大尺寸虚线上传卡片，支持点击与拖拽本地 JPG、PNG、WebP、GIF 图片文件。
- **推荐精选封面**：
  - 底部提供精选高清摄影/科技壁纸备选。
- **缩略图大图预览**：
  - 图库中每张缩略图均支持**悬停出现放大图标**以及**双击直接进入大图预览**。
- **联动关闭体验**：
  - 从大图预览点击更换封面时平滑关闭预览层；确认选取或上传后自动关闭选择器并即时刷新文章封面。

---

### 四、 主页 Header 居中悬浮胶囊工具栏与发布按钮
1. **居中胶囊工具栏（Floating Capsule Toolbar）**：
   - 采用纯白高透圆角胶囊药丸造型与精致投影；
   - 包含核心创作高频动作：
     - **AI 润色**（高亮品牌橙色星芒图标 + 点击呼出智能润色弹窗）；
     - **智能排版**（一键自动进行中英文空格规范化、标题规范、无序列表整理及空行优化）；
     - **插入图片**（快速触发本地图片上传）；
     - **生成封面**（直达文章封面多源选择器与生成器）；
     - **更多工具**（集成查找替换、URL 文章抓取导入、示例模板、清空内容、偏好设置下拉菜单）。
2. **右侧一键发布按钮**：
   - 采用活力橙红渐变配色搭配斜角纸飞机图标，点击直接呼出多渠道分发抽屉。

---

### 五、 思否（SegmentFault）封面上传与草稿关联修复
1. **鉴权头补齐（Bearer Authorization）**：
   - 思否网关上传接口 `https://segmentfault.com/gateway/image` 与草稿接口 `https://segmentfault.com/gateway/draft` 新增 `authorization: Bearer <token>` 请求头支持，避免因缺少 Bearer 头导致接口无法将上传封面绑定到用户草稿。
2. **Session Cookie 多源容灾**：
   - 优先提取 `PHPSESSID` / `SHARESESSID` Cookie 作为 Token 凭据，确保无缝认证。
3. **封面字段全量映射**：
   - 草稿保存（POST）与更新（PUT）全量注入 `cover`, `cover_url`, `cover_img`, `cover_image`, `bg_img`, `background`, `image`, `banner` 等字段，并将封面路径标准化为 `/img/bV...` 相对路径，确保思否草稿页 `<img class="w-100 cover text" style="background-image: url('/img/bV...');" alt="头图">` 能够精准匹配并渲染。
4. **图片上传响应解析修复（解决 `/img/388` 404 错误）**：
   - 当思否网关返回对象 `{ "url": "/img/bVdqh07", "result": "https://image-static.segmentfault.com/482/553/..." }` 时，原逻辑错误优先取了 `res.result`，后续正则匹配误抓了二级数字子目录 `388` / `482` 生成了错误的 `/img/388` 导致 404；
   - 现已重构解析逻辑，**最高优先级提取 `res.url`（即精确的 `/img/bVdqh07`）**，并对 `bV` 标识进行精准提取，彻底确保思否草稿封面背景图正常加载。

---

### 六、 知乎（Zhihu）同步标题与封面注入全面深度修复
1. **函数作用域异常与标题选择器修复**：
   - 修复了 `isElementValidTextEditable` 原先被误定义在局部函数内部导致 `injectContent` 触发 `ReferenceError` 并静默中断标题注入的致命 Bug；
   - 适配知乎新版 `.WriteIndex-titleInput textarea`, `.WriteIndex-titleInput .Input`, `textarea.Input`, `textarea[placeholder*="请输入标题"]`；
   - 采用 `HTMLTextAreaElement.prototype` 原型链属性赋值器触发 React 内部 `_valueTracker` 与 SyntheticEvent，解决知乎 React 受控组件值无法同步的问题。
2. **清除过早清除定时器阻断标题/封面注入的逻辑**：
   - 修复了当编辑器检测到服务端已存在内容（>20字符）时，原逻辑执行 `clearInterval` 导致后续标题和封面注入流程被提前永久终止的重大逻辑缺陷。
3. **适配知乎官方 `UploadPicture-input` 与 `UploadPicture-wrapper` 真实 DOM**：
   - 抓取知乎真实封面上传组件：`<label class="UploadPicture-wrapper"><input type="file" accept=".jpeg, .jpg, .png" class="UploadPicture-input">...添加文章封面</label>`；
   - 适配知乎封面已上传状态检测：`<div class="css-6e7dvl"><img alt="封面图" class="css-1n3bltk"><div class="WriteCoverV2-buttonGroup">...</div></div>`；
   - 精准通过 `label.UploadPicture-wrapper input.UploadPicture-input` 挂载 `File` 二进制对象并派发标准 `change` 与 `input` 事件，确保知乎 React 组件即时响应并渲染出带有「更换」「删除」按钮的封面图卡片。
5. **知乎「选择文件」知识库弹窗自动勾选确认与防重执行**：
   - 当向知乎文件输入框注入封面时，知乎会唤起「选择文件（默认储存在我的直答知识库）」弹窗；
   - 增加了 `coverStarted` 单次防重锁，彻底杜绝定时器重复上传两张相同封面；
   - 新增弹窗自动处理逻辑：自动识别弹窗内已就绪的封面图（剔除上传中状态），自动点击单选框（Radio）并点击底部的「确定/插入」按钮，实现弹窗全自动关闭与封面最终装载。

---

### 七、 多渠道分发 30 分钟登录状态缓存与全链路刷新功能
1. **30 分钟有效期持久化缓存（TTL Cache）**：
   - 采用 `nicemd_platform_logins_cache_v2` 本地存储缓存各渠道登录状态（`loginStatus`, `userId`, `username`, `avatar`）及检查时间戳 `lastChecked`；
   - 只要在 30 分钟有效期内，打开多渠道内容分发抽屉或打开渠道管理弹窗时，**0 秒即时呈现已登录状态，不再重复请求后台逐个检测**，彻底消除开窗等待与卡顿；
   - 在挂载阶段（`onMounted`）立即执行 `loadCachedLogins()`，打开即呈现已点亮的渠道列表。
2. **多位置专属「刷新状态」按钮**：
   - 在右侧多渠道分发主抽屉头部保留「刷新状态」按钮；
   - 在「发布平台展示管理」弹窗标题栏右侧新增精致的「刷新状态」操作按钮（带 `RotateCw` 旋转动画与禁用态防重）；
   - 点击任一「刷新状态」按钮均会强制触发 `checkAllLogins(true)`，忽略缓存实时重新检测所有渠道状态并刷新本地缓存。

---

### 八、 LearnKu 渠道标题、CodeMirror 正文与后台草稿 API 全流程适配
1. **标题输入框适配**：
   - 适配 LearnKu 当前真实 DOM：`<input class="form-control" type="text" name="title" id="title-field" ...>`；
   - 选择器更新为 `#title-field, input[name="title"], input.form-control#title-field`，并结合原型链属性注入触发 `input` 与 `change`。
2. **CodeMirror 编辑器多重注入机制**：
   - 适配 LearnKu 的 `.CodeMirror`, `.CodeMirror-code`, `textarea#body-field`；
   - 优先通过 `cm.setValue()` / `cm.save()` 写入，并在隔离环境下对 `.CodeMirror textarea` 派发带有 Markdown 的 `ClipboardEvent`，同步更新底层的原生 `textarea#body-field`。
3. **后台接口直传草稿（`POST /articles`）与图片直传**：
   - 在 `LearnkuAdapter` 中通过后台爬取页面提取 `_token`, `editor_unique_id`, `category_id`, `community_id`；
   - 官方图片接口：`POST https://learnku.com/courses/upload_image?guid=${Date.now()}`；
   - 官方草稿接口：`POST https://learnku.com/articles`（携带 `subject=draft`、`body`、`body_html`、`title` 等参数），直接在后台创建草稿并精准返回草稿编辑页链接（`https://learnku.com/articles/{id}/edit`）。

---

## 🛠️ 技术涉及文件
- `extension/publish-adapters.js`：LearnkuAdapter 官方接口草稿直传、CSRF Token 动态提取与图片转存管道。
- `extension/content-automation.js`：LearnKu `#title-field` 标题定位、CodeMirror 多重注入与事件派发。
- `extension/background.js`：Learnku 官方图片与发布接口 declarativeNetRequest 请求头防盗链规则配置。
- `src/components/LaunchpadModal.vue`：多渠道分发抽屉、30 分钟登录状态持久化缓存机制、渠道管理弹窗头部刷新状态按钮与响应式布局。
