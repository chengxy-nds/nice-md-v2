# 浏览器插件 — 平台账号登录状态检测规则

> 适用场景：浏览器扩展通过 `credentials: 'include'` 携带 Cookie 发起 HTTP 请求，根据响应判断用户是否已在目标平台登录。
>
> 核心原理：用户在浏览器中已登录过某平台 → 该平台的 Cookie 存在于浏览器中 → 扩展发起请求时自动携带 Cookie → 平台后端识别 Cookie 返回用户信息 → 扩展判定"已登录"。

---

## 检测模式分类

| 模式 | 说明 | 适配器数量 |
|------|------|-----------|
| `json_api` | 调用 REST/JSON API，根据返回码/字段判断 | 9 |
| `html_scrape` | 拉取 HTML 页面，正则提取 JS 变量或 DOM 结构 | 8 |
| `jsonp` | JSONP 响应，剥离回调函数后解析 JSON | 1 |
| `two_step` | 先 HTML 提取 uid，再调 API 验证 | 1 |
| `xmlrpc` | 用户名+密码通过 XML-RPC 验证 | 3 |
| `always_true` | 无需认证，始终返回已登录 | 1 |

---

## 一、JSON API 模式（9 个平台）

请求一个返回 JSON 的用户信息 API，通过 HTTP 状态码或业务字段判定登录态。

### 1. 百家号 (baijiahao)

```yaml
platform_id: baijiahao
platform_name: 百家号
homepage: https://baijiahao.baidu.com
auth_method: json_api

request:
  url: https://baijiahao.baidu.com/builder/app/appinfo?_={timestamp_ms}
  method: GET
  headers: {}
  credentials: include

auth_condition:
  field_path: errmsg == "success" AND data.user exists

user_mapping:
  user_id: data.user.userid
  username: data.user.name
  avatar: data.user.avatar
```

### 2. 哔哩哔哩 (bilibili)

```yaml
platform_id: bilibili
platform_name: 哔哩哔哩
homepage: https://member.bilibili.com/platform/upload/text
auth_method: json_api

request:
  url: https://api.bilibili.com/x/web-interface/nav?build=0&mobi_app=web
  method: GET
  headers: {}
  credentials: include

auth_condition:
  field_path: code == 0 AND data.isLogin == true

user_mapping:
  user_id: data.mid (转字符串)
  username: data.uname
  avatar: data.face
```

### 3. CSDN (csdn)

需要 HMAC-SHA256 签名。

```yaml
platform_id: csdn
platform_name: CSDN
homepage: https://editor.csdn.net/md
auth_method: json_api

request:
  url: https://bizapi.csdn.net/blog-console-api/v3/editor/getBaseInfo
  method: GET
  credentials: include
  headers:
    accept: "*/*"
    x-ca-key: "203803574"
    x-ca-nonce: "{uuid_v4}"
    x-ca-signature: "{hmac_sha256_base64}"
    x-ca-signature-headers: "x-ca-key,x-ca-nonce"

signature:
  algorithm: HMAC-SHA256
  encoding: Base64
  api_key: "203803574"
  api_secret: "9znpamsyl2c7cdrr9sas0le9vbc3r6ba"
  string_to_sign_format: |
    GET 请求: "GET\n*/*\n\n\n\nx-ca-key:{KEY}\nx-ca-nonce:{NONCE}\n{path}"
    POST 请求: "POST\n*/*\n\napplication/json\n\nx-ca-key:{KEY}\nx-ca-nonce:{NONCE}\n{path}"
  note: 使用 Web Crypto API (crypto.subtle) 实现

auth_condition:
  field_path: code == 200 AND data.name 非空

user_mapping:
  user_id: data.name
  username: data.nickname || data.name
  avatar: data.avatar
```

### 4. 东方财富 (eastmoney)

必须先读取 Cookie 中的 token 作为 URL 参数。

```yaml
platform_id: eastmoney
platform_name: 东方财富
homepage: https://mp.eastmoney.com
auth_method: json_api

prerequisite:
  - cookie_name: ct
    cookie_domain: .eastmoney.com
    usage: URL query param ctoken
  - cookie_name: ut
    cookie_domain: .eastmoney.com
    usage: URL query param utoken

request:
  url: https://caifuhaoapi.eastmoney.com/api/v2/getauthorinfo?platform=&ctoken={ctoken}&utoken={utoken}
  method: GET
  credentials: include
  headers:
    x-requested-with: fetch

auth_condition:
  field_path: Success == 1 AND Result.accountId 非空

user_mapping:
  user_id: Result.accountId
  username: Result.accountName
  avatar: Result.portrait
```

### 5. 开源中国 (oschina)

```yaml
platform_id: oschina
platform_name: 开源中国
homepage: https://my.oschina.net
auth_method: json_api

request:
  url: https://apiv1.oschina.net/oschinapi/user/myDetails
  method: GET
  headers: {}
  credentials: include

auth_condition:
  field_path: success == true AND result.userId 非空

user_mapping:
  user_id: result.userId (转字符串)
  username: result.userVo.name || userId
  avatar: result.userVo.portraitUrl
```

### 6. 搜狐号 (sohu)

支持多子账号。

```yaml
platform_id: sohu
platform_name: 搜狐号
homepage: https://mp.sohu.com
auth_method: json_api

request:
  url: https://mp.sohu.com/mpbp/bp/account/list?_={timestamp_ms}
  method: GET
  headers: {}
  credentials: include

auth_condition:
  field_path: code == 2000000 AND data.data[0].accounts 数组非空 (至少 1 个元素)

user_mapping:
  user_id: 第一个子账号的 id (转字符串)
  username: 第一个子账号的 nickName；多子账号时追加 "(共N个子账号)"
  avatar: 第一个子账号的 avatar

special:
  - 遍历 data.data 中所有 group 收集全部子账号
  - 默认使用第一个子账号作为主账号
```

### 7. 知乎 (zhihu)

```yaml
platform_id: zhihu
platform_name: 知乎
homepage: https://www.zhihu.com
auth_method: json_api

request:
  url: https://www.zhihu.com/api/v4/me
  method: GET
  credentials: include
  headers:
    x-requested-with: fetch

auth_condition:
  field_path: id 非空 (truthy)

user_mapping:
  user_id: id
  username: name
  avatar: avatar_url
```

### 8. 掘金 (juejin)

```yaml
platform_id: juejin
platform_name: 掘金
homepage: https://juejin.cn
auth_method: json_api

request:
  url: https://api.juejin.cn/user_api/v1/user/get
  method: GET
  headers: {}
  credentials: include

auth_condition:
  field_path: data.user_id 非空

user_mapping:
  user_id: data.user_id
  username: data.user_name
  avatar: data.avatar_large
```

### 9. 语雀 (yuque)

需要先从 Cookie 中读取 CSRF Token。

```yaml
platform_id: yuque
platform_name: 语雀
homepage: https://www.yuque.com/dashboard
auth_method: json_api

prerequisite:
  cookie_name: yuque_ctoken
  cookie_domain: .yuque.com
  usage: 作为 x-csrf-token 请求头；Cookie 不存在则直接判定未登录

request:
  url: https://www.yuque.com/api/mine/common_used
  method: GET
  credentials: include
  headers:
    x-csrf-token: "{cookie: yuque_ctoken}"

auth_condition:
  field_path: data.books 数组非空（至少 1 个知识库）; 取第一个 book 的 user 信息

user_mapping:
  user_id: data.books[0].user.id (转字符串)
  username: data.books[0].user.name
  avatar: data.books[0].user.avatar_url
```

---

## 二、HTML Scrape 模式（8 个平台）

拉取需要登录才能访问的页面 HTML，用正则匹配页面中的用户信息（嵌入在 JS 变量或 DOM 结构中）。如果匹配不到关键字段，则判定未登录。

### 10. 微信公众号 (weixin)

从首页 HTML 中提取 JS 内嵌的 token 和用户信息。

```yaml
platform_id: weixin
platform_name: 微信公众号
homepage: https://mp.weixin.qq.com
auth_method: html_scrape

request:
  url: https://mp.weixin.qq.com/
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    HTML 中能匹配到正则: /data:\s*\{[\s\S]*?t:\s*["']([^"']+)["']/
    匹配不到 → 未登录
  extraction_rules:
    - field: token
      regex: '/data:\s*\{[\s\S]*?t:\s*["']([^"']+)["']/'
      capture_group: 1
    - field: ticket
      regex: '/ticket:\s*["']([^"']+)["']/'
      capture_group: 1
    - field: user_name
      regex: '/user_name:\s*["']([^"']+)["']/'
      capture_group: 1
    - field: nick_name
      regex: '/nick_name:\s*["']([^"']+)["']/'
      capture_group: 1
    - field: svr_time
      regex: '/time:\s*["'](\d+)["']/'
      capture_group: 1
      fallback: Date.now() / 1000
    - field: head_img
      regex: '/head_img:\s*['"]([^'"]+)['"]/'
      capture_group: 1
    - field: avatar
      regex: '/class="weui-desktop-account__thumb"[^>]*src="([^"]+)"/'
      capture_group: 1
      fallback: head_img 的值
      post_process: http:// 替换为 https://

user_mapping:
  user_id: user_name
  username: nick_name
  avatar: avatar
```

### 11. 博客园 (cnblogs)

```yaml
platform_id: cnblogs
platform_name: 博客园
homepage: https://www.cnblogs.com
auth_method: html_scrape

request:
  url: https://home.cnblogs.com/user/CurrentUserInfo
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    HTML 中能匹配到: /href="\/u\/([^/]+)\/"/
    匹配不到 → 未登录

extraction_rules:
  - field: uid
    regex: '/href="\/u\/([^\/]+)\/"/'
    capture_group: 1
  - field: avatar
    regex: '/<img[^>]+class="pfs"[^>]+src="([^"]+)"/'
    capture_group: 1
    optional: true

user_mapping:
  user_id: uid
  username: uid
  avatar: avatar
```

### 12. 51CTO (cto51)

```yaml
platform_id: 51cto
platform_name: 51CTO
homepage: https://blog.51cto.com/blogger/publish
auth_method: html_scrape

request:
  url: https://blog.51cto.com/blogger/publish
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    HTML 中能匹配到: /<li class="more user">\s*<a[^>]*href="([^"]+)"[^>]*>\s*<img[^>]*src="([^"]+)")/
    匹配不到 → 未登录

extraction_rules:
  - field: user_link
    regex: '/<li class="more user">\s*<a[^>]*href="([^"]+)"[^>]*>\s*<img[^>]*src="([^"]+)"/'
    capture_group: 1
  - field: avatar
    regex: 同上
    capture_group: 2
  - field: uid
    source: user_link
    transform: 取 URL path 最后一段 (以 / 分割后最后一个非空元素)
  - field: csrf_token
    regex: '/<meta\s+name="csrf-token"\s+content="([^"]+)"/'
    capture_group: 1
    optional: true

user_mapping:
  user_id: uid
  username: uid
  avatar: avatar
```

### 13. 豆瓣 (douban)

从写笔记页面的 JS 全局变量中提取。

```yaml
platform_id: douban
platform_name: 豆瓣
homepage: https://www.douban.com/note/create
auth_method: html_scrape

request:
  url: https://www.douban.com/note/create
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    以下三个正则全部能匹配 → 已登录:
      - /_USER_NAME\s*=\s*['"]([^'"]+)['"]/
      - /name="note_id"\s+value="(\d+)"/
      - /name="ck"\s+value="([^"]+)"/
    任一匹配不到 → 未登录

extraction_rules:
  - field: username
    regex: '/_USER_NAME\s*=\s*['"]([^'"]+)['"]/'
    capture_group: 1
  - field: avatar
    regex: '/_USER_AVATAR\s*=\s*['"]([^'"]+)['"]/'
    capture_group: 1
    optional: true
  - field: note_id
    regex: '/name="note_id"\s+value="(\d+)"/'
    capture_group: 1
  - field: ck
    regex: '/name="ck"\s+value="([^"]+)"/'
    capture_group: 1
  - field: site_cookie_value
    regex: '从 _POST_PARAMS 中提取: /siteCookie[^}]*value\s*:\s*['"]([^'"]+)['"]/'
    capture_group: 1
    optional: true

user_mapping:
  user_id: username
  username: username
  avatar: avatar
```

### 14. 思否 (segmentfault)

```yaml
platform_id: segmentfault
platform_name: 思否
homepage: https://segmentfault.com
auth_method: html_scrape

request:
  url: https://segmentfault.com/user/settings
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    HTML 中能匹配到: /href="\/u\/([^"]+)"/
    匹配不到 → 未登录

extraction_rules:
  - field: uid
    regex: '/href="\/u\/([^"]+)"/'
    capture_group: 1
  - field: avatar
    regex: '/src="(https:\/\/avatar-static\.segmentfault\.com\/[^"]+)"/'
    capture_group: 1
    optional: true

user_mapping:
  user_id: uid
  username: uid
  avatar: avatar
```

### 15. 微博 (weibo)

从编辑器页面的 JS 内嵌 JSON 中解析。

```yaml
platform_id: weibo
platform_name: 微博
homepage: https://card.weibo.com/article/v5/editor
auth_method: html_scrape

request:
  url: https://card.weibo.com/article/v5/editor
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    HTML 中能匹配到: /config:\s*JSON\.parse\('(.+?)'\)/
    匹配不到 → 未登录
    匹配到后解析内嵌 JSON，JSON 中 uid 非空 → 已登录

extraction_rules:
  - field: config_json
    regex: "/config:\\s*JSON\\.parse\\('(.+?)'\\)/"
    capture_group: 1
    post_process:
      - 将 \\' 替换为 '
      - 将 \\\\ 替换为 \\
      - JSON.parse() 解析
  - field: uid
    source: config_json.uid (转字符串)
  - field: nick
    source: config_json.nick
  - field: avatar_large
    source: config_json.avatar_large

user_mapping:
  user_id: uid
  username: nick
  avatar: avatar_large
```

### 16. 雪球 (xueqiu)

```yaml
platform_id: xueqiu
platform_name: 雪球
homepage: https://mp.xueqiu.com/writeV2
auth_method: html_scrape

request:
  url: https://mp.xueqiu.com/writeV2
  method: GET
  headers: {}
  credentials: include

auth_condition:
  primary_check: |
    HTML 中能匹配到: /window\.UOM_CURRENTUSER\s*=\s*(\{[\s\S]*?\})\s*<\/script>/
    匹配不到 → 未登录
    匹配到后 JSON.parse() 解析，currentUser.id 非空 → 已登录

extraction_rules:
  - field: state_json
    regex: '/window\.UOM_CURRENTUSER\s*=\s*(\{[\s\S]*?\})\s*<\/script>/'
    capture_group: 1
    post_process: JSON.parse()
  - field: id
    source: state_json.currentUser.id (转字符串)
  - field: screen_name
    source: state_json.currentUser.screen_name
  - field: avatar
    source: |
      拼接: "https:" + state_json.currentUser.photo_domain
            + state_json.currentUser.profile_image_url.split(',')[0]
    fallback: ""

user_mapping:
  user_id: id
  username: screen_name
  avatar: avatar
```

---

## 三、JSONP 模式（1 个平台）

### 17. 慕课手记 (imooc)

响应是 JSONP 格式，需手动剥离回调函数。

```yaml
platform_id: imooc
platform_name: 慕课手记
homepage: https://www.imooc.com/article
auth_method: jsonp

request:
  url: https://www.imooc.com/u/card
  method: GET
  headers: {}
  credentials: include

response_processing:
  raw_format: "jsonpcallback({...})"
  transform:
    - 删除前缀 "jsonpcallback("
    - 删除后缀 "})"
    - 追加 "}"
    - JSON.parse()

auth_condition:
  field_path: result == 0 (等于 0 表示已登录，不为 0 表示未登录)

user_mapping:
  user_id: data.uid
  username: data.nickname
  avatar: data.img

error_field: result.msg (当 result != 0 时的错误消息)
```

---

## 四、两步验证模式（1 个平台）

### 18. 人人都是产品经理 (woshipm)

先 HTML 提取 uid → 再调 API 验证。

```yaml
platform_id: woshipm
platform_name: 人人都是产品经理
homepage: https://www.woshipm.com
auth_method: two_step

step1:
  description: 拉取写作页 HTML，提取 uid 和 jltoken
  request:
    url: https://www.woshipm.com/writing
    method: GET
    headers: {}
    credentials: include
  extraction:
    - field: jltoken
      regex: '/"jltoken"\s*:\s*"([^"]+)"/'
      capture_group: 1
      optional: true
    - field: uid
      regex: '/var\s+userSettings\s*=\s*\{[^}]*"uid"\s*:\s*"(\d+)"/'
      capture_group: 1
  condition: uid 匹配不到 → 直接判定未登录

step2:
  description: 用 uid 调 API 验证登录态
  request:
    url: https://www.woshipm.com/api2/user/profile?uid={uid}
    method: GET
    credentials: include
    headers:
      X-Requested-With: XMLHttpRequest

auth_condition:
  field_path: CODE == 200 AND RESULT.userInfoVo.uid 非空

user_mapping:
  user_id: RESULT.userInfoVo.uid (转字符串)
  username: RESULT.userInfoVo.nickName
  avatar: RESULT.userInfoVo.avartar (注意: API 返回的字段名拼写是 avartar 不是 avatar)
```

---

## 五、XML-RPC 用户名密码模式（3 个平台）

用户名+密码通过 XML-RPC 协议验证。这些是自建/自托管 CMS 平台，不存在 Cookie 登录态，需要用户手动输入站点 URL、用户名和密码。

### 20. WordPress (wordpress)

```yaml
platform_id: wordpress
platform_name: WordPress
homepage: "{用户输入的站点 URL}"
auth_method: xmlrpc

request:
  url: "{siteUrl}/xmlrpc.php"
  method: POST
  content_type: text/xml
  credentials: omit
  body: |
    <?xml version="1.0" encoding="UTF-8"?>
    <methodCall>
      <methodName>wp.getUsersBlogs</methodName>
      <params>
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
      </params>
    </methodCall>

auth_condition:
  description: |
    HTTP 状态码 200 且 XML 响应中不含 <fault> 元素 → 已登录。
    如果包含 <fault>，提取 <string> 中的错误消息作为 error。

user_mapping:
  user_id: username
  username: username
  avatar: null

special:
  - 密码通过 chrome.storage.local 单独加密存储（key: cms_pwd_{accountId}）
  - 不使用浏览器的 Cookie 机制，直接通过 XML-RPC POST 请求验证
```

### 21. MetaWeblog 通用 (metaweblog)

兼容所有支持 MetaWeblog API 的博客系统（如 Z-Blog、emlog 等）。

```yaml
platform_id: metaweblog
platform_name: MetaWeblog
homepage: "{用户输入的站点 URL}"
auth_method: xmlrpc

request:
  url: "{siteUrl}/xmlrpc.php"  (或用户自定义 endpoint)
  method: POST
  content_type: text/xml
  credentials: omit
  body: |
    <?xml version="1.0"?>
    <methodCall>
      <methodName>blogger.getUsersBlogs</methodName>
      <params>
        <param><value><string></string></value></param>  <!-- appKey，通常为空 -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
      </params>
    </methodCall>

auth_condition:
  description: |
    HTTP 状态码 200 且 XML 响应中不含 <fault> 元素 → 已登录。
    如果包含 <fault>，提取 <string> 中的错误消息作为 error。

user_mapping:
  user_id: username
  username: username
  avatar: null

special:
  - 支持自定义 XML-RPC endpoint（通过 credentials.endpoint 配置）
  - 如果未指定 endpoint，默认使用 {siteUrl}/xmlrpc.php
```

### 22. Typecho (typecho)

Typecho 是流行的轻量级 PHP 博客系统，兼容 MetaWeblog API，但 XML-RPC 端点不同。

```yaml
platform_id: typecho
platform_name: Typecho
homepage: "{用户输入的站点 URL}"
auth_method: xmlrpc

request:
  url: "{siteUrl}/action/xmlrpc"  # Typecho 专用端点
  method: POST
  content_type: text/xml
  credentials: omit
  body: |
    <?xml version="1.0"?>
    <methodCall>
      <methodName>metaWeblog.getUsersBlogs</methodName>
      <params>
        <param><value><string></string></value></param>  <!-- appKey -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
      </params>
    </methodCall>

auth_condition:
  description: |
    HTTP 状态码 200 且 XML 响应中不含 <fault> 元素 → 已登录。

user_mapping:
  user_id: username
  username: username
  avatar: null

special:
  - 使用 /action/xmlrpc 端点（非标准 /xmlrpc.php）
  - Typecho 的新文章 postid 有时返回 0，需要额外调用 getRecentPosts 获取真实 ID
```

---

## 六、无需认证模式（1 个平台）

### 23. Markdown 压缩包 (zip-download)

```yaml
platform_id: zip-download
platform_name: Markdown 压缩包
homepage: ""
auth_method: always_true

auth_condition:
  always: true

user_mapping:
  user_id: null
  username: "本地下载"
  avatar: null
```

---

## 通用机制说明

### Cookie 携带
所有 DSL 平台请求均设置 `credentials: 'include'`，浏览器自动附加目标域名的 Cookie。

### XML-RPC 认证（CMS 平台）
WordPress / MetaWeblog / Typecho 不使用 Cookie 机制，而是通过用户名+密码 XML-RPC 调用验证：
- 密码存储在 `chrome.storage.local` 中（key: `cms_pwd_{accountId}`）
- 验证通过 `wp.getUsersBlogs` / `blogger.getUsersBlogs` / `metaWeblog.getUsersBlogs` 方法
- 响应不含 `<fault>` 元素即表示验证成功

### 特殊 Header 注入
部分平台的 API 需要特定 `Origin`/`Referer` 才能通过 CSRF 校验。使用 Chrome `declarativeNetRequest` API 动态注入：

| 平台 | 需要的 Header | 匹配 URL 模式 |
|------|--------------|---------------|
| 百家号 | Origin, Referer | `*://baijiahao.baidu.com/*` |
| B站 | Origin, Referer | `*://api.bilibili.com/*` |
| 博客园 | Origin, Referer | `*://i.cnblogs.com/*` |
| 51CTO | Origin, Referer | `*://blog.51cto.com/*` |
| 豆瓣 | Origin, Referer | `*://www.douban.com/*` |
| 东方财富 | Origin, HOST | `*://mp.eastmoney.com/*` |
| 慕课手记 | Origin, Referer | `*://www.imooc.com/article/*` |
| 开源中国 | Origin, Referer | `*://apiv1.oschina.net/oschinapi/*` |
| 思否 | Origin, Referer | `*://segmentfault.com/gateway/*` |
| 搜狐号 | Origin, Referer | `*://mp.sohu.com/*` |
| 微博 | Origin, Referer | `*://card.weibo.com/*` |
| 微信公众号 | Origin, Referer | `*://mp.weixin.qq.com/cgi-bin/*` |
| 人人都是PM | X-Requested-With | `*://woshipm.com/api2/*` |
| 雪球 | Origin, Referer | `*://mp.xueqiu.com/xq/*` |
| 语雀 | Origin, Referer | `*://www.yuque.com/api/*` |
| 掘金 | Origin, Referer | `*://api.juejin.cn/*` |
| 知乎 | x-requested-with: fetch | (直接在请求头中设置) |
| CSDN | HMAC-SHA256 签名头 | (直接在请求头中设置) |

### AuthResult 统一返回结构

```typescript
interface AuthResult {
  isAuthenticated: boolean   // 是否已登录
  username?: string          // 用户名/昵称
  userId?: string            // 用户 ID
  avatar?: string            // 头像 URL
  error?: string             // 错误信息（未登录或请求失败时）
}
```

### 运行时环境

- 浏览器扩展 (Chrome Extension Manifest V3) 的 Service Worker 环境
- HTTP 请求通过 `fetch()` API，自动附带 `credentials: 'include'`
- Cookie 读取通过 `chrome.cookies.getAll({ domain, name })` API
- 不依赖 DOM（Service Worker 中无 DOM），所有 HTML 解析均通过正则表达式

## 私有子模块平台

以下约 10 个平台的适配器位于私有 git 子模块 `wechatsync-private-adapters` 中，不在公开仓库中，无法从本仓库提取规则：

| 平台 ID | 平台名称 | 备注 |
|---------|---------|------|
| xiaohongshu | 小红书 | 私有适配器 |
| jianshu | 简书 | 私有适配器 |
| toutiao | 头条号 | 私有适配器 |
| douyin | 抖音 | 私有适配器 |
| dayu | 大鱼号 | 私有适配器 |
| yidian | 一点号 | 私有适配器 |
| sohu-focus | 搜狐焦点 | 私有适配器 |
| twitter | X/Twitter | 私有适配器 |
| smzdm | 什么值得买 | 私有适配器 |
| netease | 网易号 | 私有适配器 |

> 公开仓库 23 个平台（21 个 DSL + 2 个本地）+ 私有子模块 ~10 个平台 ≈ 31+ 平台，与 README 声明的"29+"一致。

## 平台汇总

| # | 平台 ID | 平台名称 | 认证方式 | 需要特殊 Header |
|---|---------|---------|---------|---------------|
| 1 | baijiahao | 百家号 | json_api | Origin, Referer |
| 2 | bilibili | 哔哩哔哩 | json_api | Origin, Referer |
| 3 | csdn | CSDN | json_api (HMAC-SHA256) | HMAC 签名头 |
| 4 | eastmoney | 东方财富 | json_api | Origin, HOST |
| 5 | oschina | 开源中国 | json_api | Origin, Referer |
| 6 | sohu | 搜狐号 | json_api | Origin, Referer |
| 7 | zhihu | 知乎 | json_api | x-requested-with: fetch |
| 8 | juejin | 掘金 | json_api | Origin, Referer |
| 9 | yuque | 语雀 | json_api | Origin, Referer, x-csrf-token |
| 10 | weixin | 微信公众号 | html_scrape | Origin, Referer |
| 11 | cnblogs | 博客园 | html_scrape | Origin, Referer |
| 12 | 51cto | 51CTO | html_scrape | Origin, Referer |
| 13 | douban | 豆瓣 | html_scrape | Origin, Referer |
| 14 | segmentfault | 思否 | html_scrape | Origin, Referer |
| 15 | weibo | 微博 | html_scrape | Origin, Referer |
| 16 | xueqiu | 雪球 | html_scrape | Origin, Referer |
| 17 | imooc | 慕课手记 | jsonp | Origin, Referer |
| 18 | woshipm | 人人都是PM | two_step | X-Requested-With |
| 19 | wordpress | WordPress | xmlrpc | 无（直接 fetch） |
| 20 | metaweblog | MetaWeblog | xmlrpc | 无（直接 fetch） |
| 21 | typecho | Typecho | xmlrpc | 无（直接 fetch） |
| 22 | zip-download | 压缩包 | always_true | 无 |
