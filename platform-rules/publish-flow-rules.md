# 浏览器插件 — 平台文章发布/同步流程规则

> 适用场景：浏览器扩展将已提取的文章内容（HTML/Markdown）发布到各内容平台的草稿箱。
>
> 核心流程：预处理内容 → 上传外部图片（替换 URL）→ 调用平台发布 API → 解析响应获取草稿链接。

---

## 通用架构

所有平台适配器（Adapter）均继承 `CodeAdapter` 基类，共享以下能力：

| 基类方法 | 功能 |
|----------|------|
| `withHeaderRules(rules, fn)` | 注入 `declarativeNetRequest` Header 规则 → 执行操作 → 自动清除规则 |
| `processImages(content, uploadFn, options)` | 正则匹配 HTML `<img>` 和 Markdown `![]()` 中的图片 URL，逐一上传并替换 |
| `createResult(success, data)` | 构造统一的 `SyncResult` 返回结构 |
| `runtime.fetch(url, init)` | 带 `credentials: 'include'` 的 HTTP 请求（自动携带 Cookie） |

**发布模式**：所有平台均为 **仅保存草稿**（`draftOnly: true`），不会自动公开发布。

---

## 平台详情

---

### 1. 百家号 (baijiahao)

```yaml
platform_id: baijiahao
platform_name: 百家号
content_format: html

# ========== 内容发布 ==========
publish_api:
  url: https://baijiahao.baidu.com/pcui/article/save?callback=bjhdraft
  method: POST
  content_type: application/x-www-form-urlencoded
  auth_header: "token: {authToken}"
  body_fields:
    title: "{article.title}"
    content: "{article.html}"
    feed_cat: "1"
    len: "{content.length}"
    activity_list: '[{"id":408,"is_checked":0}]'
    source_reprinted_allow: "0"
    original_status: "0"
    original_handler_status: "1"
    isBeautify: "false"
    subtitle: ""
    bjhtopic_id: ""
    bjhtopic_info: ""
    type: "news"

  response:
    format: jsonp (bjhdraft wrapper)
    success_condition: "errno == 0 && ret.article_id 非空"
    post_id_field: ret.article_id
    error_field: errmsg
    post_url_template: "https://baijiahao.baidu.com/builder/rc/edit?type=news&article_id={postId}"

# ========== 图片上传 ==========
image_upload:
  url: https://baijiahao.baidu.com/pcui/picture/uploadproxy
  method: POST
  body:
    media: "{image_blob}"
    type: "image"
    app_id: "1589639493090963"
    is_waterlog: "1"
    save_material: "1"
    no_compress: "0"
    is_events: ""
    article_type: "news"
  response:
    success_condition: "errno == 0 && ret.https_url 非空"
    url_field: ret.https_url
  skip_patterns:
    - baijiahao.baidu.com
    - bdstatic.com
    - bcebos.com

# ========== 特殊机制 ==========
auth_token:
  description: |
    从编辑器页 https://baijiahao.baidu.com/builder/rc/edit 的 HTML 中
    正则提取 window.__BJH__INIT__AUTH__ = 'xxx'，用作 API 的 token 头。

jsonp_wrapper:
  description: |
    发布 API 的响应格式为 bjhdraft({...})，需要先剥离外层回调函数再 JSON.parse。

header_rules:
  - url_filter: "*://baijiahao.baidu.com/*"
    headers: { Origin: "https://baijiahao.baidu.com", Referer: "https://baijiahao.baidu.com/" }
    resource_types: [xmlhttprequest]
```

---

### 2. 哔哩哔哩 (bilibili)

```yaml
platform_id: bilibili
platform_name: 哔哩哔哩
content_format: html
content_preprocessing:
  - 移除所有外部链接（removeLinks: true）

# ========== 内容发布 ==========
publish_api:
  url: https://api.bilibili.com/x/article/creative/draft/addupdate
  method: POST
  content_type: application/x-www-form-urlencoded
  body_fields:
    tid: "4"
    title: "{article.title}"
    content: "{article.html}"
    csrf: "{csrf_token}"
    save: "0"
    pgc_id: "0"

  response:
    success_condition: "code == 0 && data.aid 非空"
    post_id_field: data.aid
    error_field: message
    post_url_template: "https://member.bilibili.com/platform/upload/text/edit?aid={aid}"

# ========== 图片上传 ==========
image_upload:
  url: https://api.bilibili.com/x/article/creative/article/upcover
  method: POST
  body:
    binary: "{image_blob}"
    csrf: "{csrf_token}"
  response:
    success_condition: "code == 0 && data.url 非空"
    url_field: data.url
    extra_attrs: { size: data.size }
  skip_patterns:
    - hdslb.com
    - bilibili.com
    - biliimg.com

# ========== 特殊机制 ==========
csrf_token:
  description: |
    从浏览器 Cookie 读取 bili_jct（域 .bilibili.com）。
    通过 runtime.getCookie('.bilibili.com', 'bili_jct') 获取。
    该 token 在保存草稿和上传图片时都必须携带。

header_rules:
  - url_filter: "*://api.bilibili.com/*"
    headers: { Origin: "https://member.bilibili.com", Referer: "https://member.bilibili.com/" }
    resource_types: [xmlhttprequest]
```

---

### 3. 博客园 (cnblogs)

```yaml
platform_id: cnblogs
platform_name: 博客园
content_format: markdown

# ========== 内容发布 ==========
publish_api:
  url: https://i.cnblogs.com/api/posts
  method: POST
  content_type: application/json
  auth_headers:
    x-xsrf-token: "{xsrfToken}"
  body:
    id: null
    postType: 2
    accessPermission: 0
    title: "{article.title}"
    url: null
    postBody: "{article.markdown}"
    categoryIds: null
    categories: null
    collectionIds: []
    inSiteCandidate: false
    inSiteHome: false
    siteCategoryId: null
    blogTeamIds: null
    isPublished: false
    displayOnHomePage: false
    isAllowComments: true
    includeInMainSyndication: false
    isPinned: false
    showBodyWhenPinned: false
    isOnlyForRegisterUser: false
    isUpdateDateAdded: false
    entryName: null
    description: null
    featuredImage: null
    tags: null
    password: null
    publishAt: null
    datePublished: "{ISO_8601_now}"
    dateUpdated: null
    isMarkdown: true
    isDraft: true
    autoDesc: null
    changePostType: false
    blogId: 0
    author: null
    removeScript: false
    clientInfo: null
    changeCreatedTime: false
    canChangeCreatedTime: false
    isContributeToImpressiveBugActivity: false
    usingEditorId: 5
    sourceUrl: null

  response:
    success_condition: "response.ok && responseData.id 非空"
    post_id_field: id
    post_url_template: "https://i.cnblogs.com/articles/edit;postId={postId}"

# ========== 图片上传 ==========
image_upload:
  url: https://upload.cnblogs.com/v2/images/cors-upload
  method: POST
  headers:
    x-xsrf-token: "{xsrfToken}"
  body:
    image: "{image_blob}"
    app: "blog"
    uploadType: "Select"
  response:
    url_field_candidates: [data, url, imageUrl, src]
  skip_patterns:
    - cnblogs.com
    - img2024.cnblogs.com
    - img2023.cnblogs.com

# ========== 特殊机制 ==========
xsrf_token:
  description: |
    分两步获取：
    1. 先 GET https://i.cnblogs.com/posts/edit 触发浏览器设置 Cookie
    2. 然后从 Cookie 中读取 XSRF-TOKEN，尝试域 ['i.cnblogs.com', '.cnblogs.com', 'cnblogs.com']

header_rules:
  - url_filter: "*://i.cnblogs.com/*"
    headers: { Origin: "https://i.cnblogs.com", Referer: "https://i.cnblogs.com/" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://upload.cnblogs.com/*"
    headers: { Origin: "https://i.cnblogs.com", Referer: "https://i.cnblogs.com/" }
    resource_types: [xmlhttprequest]
```

---

### 4. CSDN (csdn)

```yaml
platform_id: csdn
platform_name: CSDN
content_format: markdown

# ========== 内容发布 ==========
publish_api:
  url: https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle
  method: POST
  content_type: application/json
  auth_headers:
    x-ca-key: "{API_KEY}"
    x-ca-nonce: "{uuid_v4}"
    x-ca-signature: "{HMAC_SHA256_signature_base64}"
    x-ca-signature-headers: "x-ca-key,x-ca-nonce"
  body:
    title: "{article.title}"
    markdowncontent: "{article.markdown}"
    content: "{article.html}"
    readType: "public"
    level: 0
    tags: ""
    status: 2
    categories: ""
    type: "original"
    original_link: ""
    authorized_status: false
    not_auto_saved: "1"
    source: "pc_mdeditor"
    cover_images: []
    cover_type: 1
    is_new: 1
    vote_id: 0
    resource_id: ""
    pubStatus: "draft"
    creator_activity_id: ""

  response:
    success_condition: "code == 200 && data.id 非空"
    post_id_field: data.id
    error_field: msg || message
    post_url_template: "https://editor.csdn.net/md?articleId={postId}"

# ========== 图片上传 (两步：签名 + OBS上传) ==========
image_upload:
  step1_get_signature:
    url: https://bizapi.csdn.net/resource-api/v1/image/direct/upload/signature
    method: POST
    auth: HMAC-SHA256 签名
    body:
      imageTemplate: ""
      appName: "direct_blog_markdown"
      imageSuffix: "{ext}"
    response_fields: [host, filePath, accessId, policy, signature, callbackUrl, callbackBody, callbackBodyType, customParam]

  step2_upload_to_obs:
    url: "https://{host}"
    method: POST
    body:
      key: "{filePath}"
      policy: "{policy}"
      signature: "{signature}"
      callbackBody: "{callbackBody}"
      callbackBodyType: "{callbackBodyType}"
      callbackUrl: "{callbackUrl}"
      AccessKeyId: "{accessId}"
      "x:rtype": "{customParam.rtype}"
      "x:filePath": "{customParam.filePath}"
      "x:isAudit": "{customParam.isAudit}"
      "x:x-image-app": "{customParam.x-image-app}"
      "x:type": "{customParam.type}"
      "x:x-image-suffix": "{customParam.x-image-suffix}"
      "x:username": "{customParam.username}"
      file: "{image_blob}"
    response:
      success_condition: "code == 200 && data.imageUrl 非空"
      url_field: data.imageUrl

  skip_patterns:
    - csdnimg.cn
    - csdn.net

# ========== 特殊机制 ==========
hmac_signing:
  api_key: "203803574"
  api_secret: "9znpamsyl2c7cdrr9sas0le9vbc3r6ba"
  algorithm: HMAC-SHA256 (Web Crypto API)
  encoding: Base64
  sign_string_format: |
    POST: "POST\n*/*\n\napplication/json\n\nx-ca-key:{KEY}\nx-ca-nonce:{NONCE}\n{API_PATH}"
    GET:  "GET\n*/*\n\n\n\nx-ca-key:{KEY}\nx-ca-nonce:{NONCE}\n{API_PATH}"

header_rules:
  - url_filter: "*://bizapi.csdn.net/*"
    headers: { Origin: "https://editor.csdn.net", Referer: "https://editor.csdn.net/" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://imgservice.csdn.net/*"
    headers: { Origin: "https://editor.csdn.net", Referer: "https://editor.csdn.net/" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://csdn-img-blog.obs.cn-north-4.myhuaweicloud.com/*"
    headers: { Origin: "https://editor.csdn.net", Referer: "https://editor.csdn.net/" }
    resource_types: [xmlhttprequest]
```

---

### 5. 51CTO (cto51)

```yaml
platform_id: 51cto
platform_name: 51CTO
content_format: markdown
content_fallback: html (如果 markdown 为空则使用 html)

# ========== 内容发布 ==========
publish_api:
  url: https://blog.51cto.com/blogger/draft
  method: POST
  content_type: application/x-www-form-urlencoded; charset=UTF-8
  headers:
    X-Requested-With: XMLHttpRequest
    Accept: "application/json, text/javascript, */*; q=0.01"
  body_fields:
    title: "{article.title}"
    content: "{article.markdown || article.html}"
    pid: ""
    cate_id: ""
    custom_id: "0"
    tag: ""
    abstract: ""
    banner_type: "0"
    blog_type: "1"
    copy_code: "1"
    is_hide: "0"
    top_time: "0"
    is_comment: "0"
    is_old: "0"  # 用 markdown 为 "0"，纯 html 为 "2"
    blog_id: ""
    did: ""
    work_id: ""
    class_id: ""
    subjectId: ""
    import_type: "-1"
    invite_code: ""
    raffle: ""
    orig: ""
    _csrf: "{csrf_token}"

  response:
    success_condition: "status == 1 && data 非空"
    post_id_field: data.did
    post_url_template: "https://blog.51cto.com/blogger/draft/{did}"

# ========== 图片上传 (三步：签名 → 配置 → COS上传) ==========
image_upload:
  step1_get_sign:
    url: https://blog.51cto.com/getUploadSign
    method: POST
    body: { upload_type: "image" }
    response_fields: [allows, sizeLimit, url, sign]

  step2_get_config:
    url: https://blog.51cto.com/getUploadConfig
    method: POST
    body:
      upload_type: "image"
      upload_sign: "{sign}"
      ext: "{ext}"
      name: "{filename}"
    response_fields: [url, fields]

  step3_upload_to_cos:
    url: "{step2.url}"
    method: POST
    body:
      key: "{fields.key}"
      policy: "{fields.policy}"
      x-amz-algorithm: "{fields.x-amz-algorithm}"
      x-amz-signature: "{fields.x-amz-signature}"
      x-amz-credential: "{fields.x-amz-credential}"
      X-Amz-Date: "{fields.X-Amz-Date}"
      Content-Type: "{mime_type}"
      file: "{image_blob}"
    result_url_template: "https://s2.51cto.com/{fields.key}"

  skip_patterns: []  # 所有图片都重新上传

# ========== 特殊机制 ==========
csrf_token:
  description: |
    在 checkAuth() 阶段从编辑器页 HTML 中正则提取：
    /<meta\s+name="csrf-token"\s+content="([^"]+)"/

is_old_field:
  description: |
    如果内容为 markdown → is_old = "0"（新版编辑器）
    如果内容为纯 html → is_old = "2"（旧版编辑器）

header_rules:
  - url_filter: "*://blog.51cto.com/*"
    headers: { Origin: "https://blog.51cto.com", Referer: "https://blog.51cto.com/blogger/publish" }
    resource_types: [xmlhttprequest]
```

---

### 6. 豆瓣 (douban)

```yaml
platform_id: douban
platform_name: 豆瓣
content_format: markdown

# ========== 内容预处理 ==========
content_transformation:
  description: |
    Markdown → Draft.js JSON 格式。
    使用 markdown-draft-js 库转换，并注入图片的完整元数据
    （id, url, thumb, width, height, file_name, file_size）。

# ========== 内容发布 ==========
publish_api:
  url: https://www.douban.com/j/note/autosave
  method: POST
  content_type: application/x-www-form-urlencoded
  body_fields:
    is_rich: "1"
    note_id: "{note_id}"
    note_title: "{article.title}"
    note_text: "{draft_js_content}"
    introduction: ""
    note_privacy: "P"
    cannot_reply: ""
    author_tags: ""
    accept_donation: ""
    donation_notice: ""
    is_original: ""
    ck: "{ck_token}"

  response:
    success_condition: 不抛异常即视为成功（无显式检查）
    post_url: "https://www.douban.com/note/create"  # 固定，无法直接跳转到草稿

# ========== 图片上传 ==========
image_upload:
  url: https://www.douban.com/j/note/add_photo
  method: POST
  body:
    note_id: "{note_id}"
    image_file: "{image_blob}"
    ck: "{ck_token}"
    upload_auth_token: "{site_cookie_value}"
  response:
    success_condition: "photo 对象存在"
    full_data_fields: { id, url, thumb, width, height, file_name, file_size }
  skip_patterns:
    - doubanio.com
    - douban.com

# ========== 特殊机制 ==========
form_data_from_page:
  description: |
    从 https://www.douban.com/note/create 页面 HTML 中提取以下信息（checkAuth 阶段完成）：
    - note_id: 正则 /name="note_id"\s+value="(\d+)"/
    - ck: 正则 /name="ck"\s+value="([^"]+)"/
    - upload_auth_token: 从 _POST_PARAMS JS 变量中提取 siteCookie.value

draft_js_conversion:
  description: |
    图片在转换时注入完整元数据到 Draft.js 的 entityMap 中，
    这使得豆瓣编辑器中图片自带尺寸等属性。

header_rules:
  - url_filter: "*://www.douban.com/*"
    headers: { Origin: "https://www.douban.com", Referer: "https://www.douban.com" }
    resource_types: [xmlhttprequest]
```

---

### 7. 东方财富 (eastmoney)

```yaml
platform_id: eastmoney
platform_name: 东方财富
content_format: html
content_preprocessing_flags:
  - removeComments
  - removeSpecialTags
  - processCodeBlocks
  - convertSectionToDiv
  - removeEmptyLines
  - removeEmptyDivs
  - removeNestedEmptyContainers
  - unwrapSingleChildContainers
  - unwrapNestedFigures
  - removeTrailingBr
  - removeDataAttributes
  - removeSrcset
  - removeSizes
  - compactHtml

# ========== 内容发布 (两步：创建空草稿 → 更新内容) ==========
publish_api:
  step1_create_draft:
    url: https://emfront.eastmoney.com/apifront/Tran/GetData?platform=
    method: POST
    content_type: application/json
    body:
      pageUrl: ""
      path: "draft/api/Article/SaveDraft"
      parm: |
        JSON.stringify([
          {ip:"$IP$"}, {deviceid}, {version:"100"}, {plat:"web"},
          {product:"CFH"}, {ctoken}, {utoken},
          {draftid:""}, {drafttype:"0"}, {type:"0"},
          {title: encodeURIComponent(article.title)},
          {text: encodeURIComponent('<div class="xeditor_content cfh_web"></div>')},
          ...
        ])
    返回 draft_id

  step2_update_draft:
    url: 同上
    method: POST
    content_type: application/json
    body:
      path: "draft/api/Article/SaveDraft"
      parm: |
        与 step1 相同，但 draftid 设为 step1 返回的 id，
        text 设为带封装的完整 HTML：
        '<div class="xeditor_content cfh_web">{article.html}</div>'

  response:
    outer_format: { RRquestSuccess, RCode, RMsg, RData }
    inner_format: JSON.parse(RData) → { error_code, draft_id, me }
    success_condition: "RRquestSuccess && RCode == 200 && innerData.error_code == 0"
    post_id_field: draft_id (from inner RData)
    post_url_template: "https://mp.eastmoney.com/collect/pc_article/index.html#/?id={draftId}"

# ========== 图片上传 ==========
image_upload:
  mode_remote_url:
    url: "https://gbapi.eastmoney.com/iimage/image/byLink?platform="
    method: PUT
    params: { linkUrl: "{src}", ctoken: "{ctoken}", utoken: "{utoken}" }

  mode_binary:
    url: "https://gbapi.eastmoney.com/iimage/image?platform="
    method: POST
    body:
      file: "{image_blob}"
      ctoken: "{ctoken}"
      utoken: "{utoken}"

  skip_patterns:
    - gbres.dfcfw.com

# ========== 特殊机制 ==========
token_cookies:
  description: |
    ctoken: Cookie ct 的值（域 .eastmoney.com）
    utoken: Cookie ut 的值（域 .eastmoney.com）
    通过 runtime.getCookie() 读取。

device_id:
  description: |
    32 位大写 hex 字符串，首次生成后存入 storage 持久化。
    用于请求参数中。

nested_api_protocol:
  description: |
    API 采用嵌套协议：外层固定格式包裹内层业务参数。
    parm 是 JSON.stringify 后的数组 [{name, value}, ...] 对象列表。
    内层响应也编码在 RData 字符串中，需要二次 JSON.parse。

header_rules:
  - url_filter: "*://mp.eastmoney.com/*"
    headers: { Origin: "https://mp.eastmoney.com", HOST: "emfront.eastmoney.com" }
    resource_types: [xmlhttprequest]
```

---

### 8. 慕课手记 (imooc)

```yaml
platform_id: imooc
platform_name: 慕课手记
content_format: markdown
content_fallback: html

# ========== 内容发布 ==========
publish_api:
  url: https://www.imooc.com/article/savedraft
  method: POST
  content_type: application/x-www-form-urlencoded
  body_fields:
    editor: "0"
    draft_id: "0"
    title: "{article.title}"
    content: "{article.markdown || article.html}"

  response:
    success_condition: "data 非空 (truthy)"
    post_id_field: data
    post_url_template: "https://www.imooc.com/article/draft/id/{data}"

# ========== 图片上传 ==========
image_upload:
  url: https://www.imooc.com/article/ajaxuploadimg
  method: POST
  body:
    photo: "{image_blob}"
    type: "{mime_type}"
    id: "WU_FILE_0"
    name: "{timestamp}.jpg"
    lastModifiedDate: "{current_date_string}"
    size: "{file_size_string}"
  response:
    success_condition: "result == 0 && data.imgpath 非空"
    url_field: data.imgpath
    post_process: "如果 URL 以 // 开头，补充 https: 前缀"
  skip_patterns: []

# ========== 特殊机制 ==========
jsonp_auth:
  description: |
    checkAuth 使用 JSONP 格式的 API (jsonpcallback({...}))，
    需要剥离回调函数前缀和后缀再 JSON.parse。

header_rules:
  - url_filter: "*://www.imooc.com/article/*"
    headers: { Origin: "https://www.imooc.com", Referer: "https://www.imooc.com/" }
    resource_types: [xmlhttprequest]
```

---

### 9. 掘金 (juejin)

```yaml
platform_id: juejin
platform_name: 掘金
content_format: markdown

# ========== 内容发布 ==========
publish_api:
  url: https://api.juejin.cn/content_api/v1/article_draft/create
  method: POST
  content_type: application/json
  auth_headers:
    x-secsdk-csrf-token: "{csrfToken}"
  body:
    brief_content: ""
    category_id: "0"
    cover_image: ""
    edit_type: 10
    html_content: "deprecated"
    link_url: ""
    mark_content: "{article.markdown}"
    tag_ids: []
    title: "{article.title}"

  response:
    success_condition: "(!err_no || err_no == 0) && data.id 非空"
    post_id_field: data.id
    error_field: err_msg
    post_url_template: "https://juejin.cn/editor/drafts/{draftId}"

# ========== 图片上传 (五步 ImageX 流程) ==========
image_upload:
  step1_get_token:
    url: "https://api.juejin.cn/imagex/v2/gen_token?aid=2608&uuid={uuid}&client=web"
    method: GET
    response: { AccessKeyId, SecretAccessKey, SessionToken, ExpiredTime }
    cache: 缓存到过期前 60 秒

  step2_apply_upload:
    url: "https://imagex.bytedanceapi.com/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=73owjymdk6"
    method: GET
    auth: AWS4 签名 (region: cn-north-1, service: imagex)
    response: { UploadAddress: { StoreInfos, UploadHosts, SessionKey } }

  step3_upload_to_tos:
    url: "https://{UploadHost}/{StoreUri}"
    method: PUT
    headers:
      Authorization: "{StoreInfo.Auth}"
      Content-Type: "{mime_type}"
      Content-CRC32: "{crc32_of_file}"
    body: "{image_blob}"

  step4_commit_upload:
    url: "https://imagex.bytedanceapi.com/?Action=CommitImageUpload&Version=2018-08-01&SessionKey={key}&ServiceId=73owjymdk6"
    method: POST
    auth: AWS4 签名
    headers:
      Content-Length: "0"

  step5_get_url:
    url: "https://api.juejin.cn/imagex/v2/get_img_url?aid=2608&uuid={uuid}&uri={uri}&img_type=private"
    method: GET
    response:
      url_field: data.main_url || data.backup_url

  skip_patterns:
    - juejin.cn
    - p1-juejin
    - p3-juejin
    - p6-juejin
    - p9-juejin
    - byteimg.com

# ========== 特殊机制 ==========
csrf_token:
  description: |
    通过 HEAD 请求 https://api.juejin.cn/user_api/v1/sys/token 获取。
    请求头：x-secsdk-csrf-request: "1", x-secsdk-csrf-version: "1.2.10"
    从响应头 x-ware-csrf-token 中提取。
    Token 格式为逗号分隔： "0,{actual_token},86370000,success,{session_id}"
    取第二部分作为实际 CSRF token。

aws4_signing:
  description: ImageX 服务的 ApplyImageUpload 和 CommitImageUpload 需要 AWS4 签名。

header_rules:
  - url_filter: "*://api.juejin.cn/*"
    headers: { Origin: "https://juejin.cn", Referer: "https://juejin.cn/" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://imagex.bytedanceapi.com/*"
    headers: { Origin: "https://juejin.cn", Referer: "https://juejin.cn/" }
    resource_types: [xmlhttprequest]
```

---

### 10. 开源中国 (oschina)

```yaml
platform_id: oschina
platform_name: 开源中国
content_format: markdown (优先) / html (回退)

# ========== 内容发布 ==========
publish_api:
  url: https://apiv1.oschina.net/oschinapi/api/draft/save_draft
  method: POST
  content_type: application/json
  body:
    title: "{article.title}"
    user: "{numeric_userId}"
    content: "{article.markdown || article.html}"
    contentType: 1  # 1=Markdown, 2=HTML
    catalog: 0
    originUrl: ""
    privacy: true
    disableComment: false

  response:
    success_condition: "success == true && result.id 非空"
    post_id_field: result.id
    post_url_template: "https://my.oschina.net/u/{userId}/blog/write/draft/{draftId}"

# ========== 图片上传 ==========
image_upload:
  url: https://apiv1.oschina.net/oschinapi/ai/creation/project/uploadDetail
  method: POST
  body:
    file: "{image_blob}"
  response:
    success_condition: "success == true && result 非空"
    url_field: result
  skip_patterns: []

# ========== 特殊机制 ==========
content_type_flag:
  description: |
    请求体中的 contentType 字段：当前内容为 Markdown 时值为 1，纯 HTML 时值为 2。

numeric_userid:
  description: |
    user 字段必须为数字类型，来自 checkAuth 返回的 result.userId。

header_rules:
  - url_filter: "*://apiv1.oschina.net/oschinapi/*"
    headers: { Origin: "https://my.oschina.net", Referer: "https://my.oschina.net/" }
    resource_types: [xmlhttprequest]
```

---

### 11. 思否 (segmentfault)

```yaml
platform_id: segmentfault
platform_name: 思否
content_format: markdown
content_fallback: html

# ========== 内容发布 ==========
publish_api:
  url: https://segmentfault.com/gateway/draft
  method: POST
  content_type: application/json
  headers:
    token: "{sessionToken}"
    accept: "*/*"
  body:
    title: "{article.title}"
    tags: []
    text: "{article.markdown || article.html}"
    object_id: ""
    type: "article"

  response:
    dual_format: true
    format_array: "[0, data] = 成功, [1, error_message] = 失败"
    format_object: "{ id, message, msg, error, errMsg }"
    success_condition: |
      数组格式: res[0] != 1 && data.id 存在 → 成功
      对象格式: res.id 存在 → 成功
    post_id_field: data.id (数组) 或 id (对象)
    post_url_template: "https://segmentfault.com/write?draftId={id}"

# ========== 图片上传 ==========
image_upload:
  url: https://segmentfault.com/gateway/image
  method: POST
  headers:
    token: "{sessionToken}"
  body:
    image: "{image_blob}"
  response:
    format_new: { url, result }
    format_old: "[0, url, id]" (成功) 或 "[1, error]" (失败)
    url_field: result (新版) 或 res[1] (旧版)
  skip_patterns: []

# ========== 特殊机制 ==========
session_token:
  description: |
    从编辑器页 HTML 中提取：
    优先尝试新版格式：正则 /serverData":\s*\{\s*"Token"\s*:\s*"([^"]+)"/
    回退旧版格式：提取 window.g_initialProps JSON，取 global.sessionInfo.key

unauthorized_detection:
  description: |
    如果响应是纯文本 "Unauthorized" 或包含 "禁言"/"锁定"，
    抛出对应的中文错误提示。

header_rules:
  - url_filter: "*://segmentfault.com/gateway/*"
    headers: { Origin: "https://segmentfault.com", Referer: "https://segmentfault.com/" }
    resource_types: [xmlhttprequest]
```

---

### 12. 搜狐号 (sohu)

```yaml
platform_id: sohu
platform_name: 搜狐号
content_format: html

# ========== 内容发布 ==========
publish_api:
  url: "https://mp.sohu.com/mpbp/bp/news/v4/news/draft/v2?accountId={accountId}"
  method: POST
  content_type: application/json
  headers:
    X-Requested-With: XMLHttpRequest
    dv-id: "{deviceId}"
    sp-cm: "{spCm}"
  body:
    title: "{article.title}"
    brief: ""
    content: "{article.html}"
    channelId: 24
    categoryId: -1
    id: 0
    userColumnId: 0
    columnNewsIds: []
    businessCode: 0
    declareOriginal: false
    cover: ""
    topicIds: []
    isAd: 0
    userLabels: "[]"
    reprint: false
    customTags: ""
    infoResource: 0
    sourceUrl: ""
    visibleToLoginedUsers: 0
    attrIds: []
    auto: true
    accountId: "{numeric_accountId}"

  response:
    success_condition: "success == true"
    post_id_field: data (字符串或数字)
    post_url_template: "https://mp.sohu.com/mpfe/v4/contentManagement/news/addarticle?spm=smmp.articlelist.0.0&contentStatus=2&id={postId}"

# ========== 图片上传 ==========
image_upload:
  url: "https://mp.sohu.com/commons/front/outerUpload/image/file?accountId={accountId}"
  method: POST
  body:
    file: "{image_blob}"
    accountId: "{accountId}"
  response:
    url_field: url
  skip_patterns:
    - sohu.com

# ========== 特殊机制 ==========
device_id:
  description: 随机 32 字符 hex 字符串，在适配器实例化时生成（不持久化）。

sp_cm_header:
  description: |
    优先从 Cookie mp-cv（域 .sohu.com）读取。
    如果读取失败，则生成 "100-{timestamp}-{randomHex}"。

multi_account:
  description: |
    搜狐号支持多个子账号。checkAuth 会收集全部子账号，
    但默认使用第一个。用户可通过界面切换。

header_rules:
  - url_filter: "*://mp.sohu.com/*"
    headers: { Origin: "https://mp.sohu.com", Referer: "https://mp.sohu.com/" }
    resource_types: [xmlhttprequest]
```

---

### 13. 微博 (weibo)

```yaml
platform_id: weibo
platform_name: 微博
content_format: html
content_preprocessing:
  - 标签间空白压缩: content.replace(/>\s+</g, '><')

# ========== 内容发布 (两步：创建 → 保存) ==========
publish_api:
  step1_create_draft:
    url: "https://card.weibo.com/article/v5/aj/editor/draft/create?uid={uid}&_rid={reqId}"
    method: POST
    content_type: application/x-www-form-urlencoded
    headers:
      accept: "application/json, text/plain, */*"
      SN-REQID: "{reqId}"
    body: "{}"  # 空 URLSearchParams
    response:
      success_condition: "code == 100000 && data.id 非空"
      post_id_field: data.id

  step2_save_draft:
    url: "https://card.weibo.com/article/v5/aj/editor/draft/save?uid={uid}&id={postId}&_rid={saveReqId}"
    method: POST
    content_type: application/x-www-form-urlencoded
    headers:
      accept: "application/json, text/plain, */*"
      SN-REQID: "{saveReqId}"
    body_fields:
      id: "{draft_id}"
      title: "{article.title}"
      subtitle: ""
      type: ""
      status: "0"
      publish_at: ""
      error_msg: ""
      error_code: "0"
      collection: "[]"
      free_content: ""
      content: "{article.html}"
      cover: ""
      summary: ""
      writer: ""
      extra: "null"
      is_word: "0"
      article_recommend: "[]"
      follow_to_read: "1"
      isreward: "1"
      pay_setting: '{"ispay":0,"isvclub":0}'
      source: "0"
      action: "1"
      content_type: "0"
      save: "1"

    response:
      success_condition: "code == '100000'"  # 注意：字符串比较
      post_url_template: "https://card.weibo.com/article/v5/editor#/draft/{postId}"

# ========== 图片上传 (两种模式：直接上传 / 异步上传+轮询) ==========
image_upload:
  mode_direct_blob:
    url: "https://picupload.weibo.com/interface/pic_upload.php?app=miniblog&s=json&p=1&data=1&url=&markpos=1&logo=0&nick=&file_source=4&_rid={reqId}"
    method: POST
    body: "{image_blob}"  # 原始二进制，非 FormData
    response:
      url_template: "https://wx3.sinaimg.cn/large/{pid}.jpg"
      pid_field: data.pics.pic_1.pid

  mode_async_url:
    step1_trigger:
      url: "https://card.weibo.com/article/v5/aj/editor/plugins/asyncuploadimg?uid={uid}&_rid={reqId}"
      method: POST
      body: { "urls[0]": "{src}" }
    step2_poll:
      url: "https://card.weibo.com/article/v5/aj/editor/plugins/asyncimginfo?uid={uid}&_rid={reqId}"
      method: POST
      body: { "urls[0]": "{src}" }
      poll_config:
        max_attempts: 30
        interval_ms: 1000
        success_condition: "task_status_code == 1"
        failure_condition: "task_status_code == 2"

  skip_patterns:
    - sinaimg.cn
    - weibo.com

# ========== 特殊机制 ==========
sn_reqid:
  description: |
    格式: base64("{uid}&{timestamp}")，URL-safe，填充到 43 字符。

custom_image_processor:
  description: |
    替换基类的 processImages()。处理 <figure><img> 和独立 <img> 两种格式，
    替换为 <figure class="image"><img src="..." data-pid="..." /></figure>。

user_config:
  description: |
    从编辑器页 HTML 解析 config: JSON.parse('{...}') 获取 uid。

header_rules:
  - url_filter: "*://card.weibo.com/*"
    headers: { Origin: "https://card.weibo.com", Referer: "https://card.weibo.com/article/v5/editor" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://picupload.weibo.com/*"
    headers: { Origin: "https://weibo.com", Referer: "https://weibo.com/" }
    resource_types: [xmlhttprequest]
```

---

### 14. 微信公众号 (weixin)

```yaml
platform_id: weixin
platform_name: 微信公众号
content_format: html
content_preprocessing:
  - removeLinks: true (保留 mp.weixin.qq.com / weixin.qq.com 域名的链接)
  - keepLinkDomains: [mp.weixin.qq.com, weixin.qq.com]
  - compactHtml: true
  - 同平台快速通道: 如果来源是微信公众号且存在 rawHtml，跳过所有处理直接用原始 HTML

# ========== 内容发布前处理 ==========
publish_preprocessing:
  step1_latex_to_image:
    description: |
      $$...$$ → <img src="https://latex.codecogs.com/png.latex?\dpi{150}{encoded}">
      $...$  → <img src="https://latex.codecogs.com/png.latex?\dpi{120}{encoded}">
      仅当文本包含 LaTeX 特征字符（\^_{} 或希腊字母/数学符号）时才转换。

  step2_strip_external_links:
    description: |
      移除指向非微信域名的 <a> 标签，保留文字内容。
      保留条件: mp.weixin.qq.com / weixin.qq.com / #锚点 / javascript:

  step3_upload_images:
    description: 上传外部图片（skip_patterns 内的跳过）

  step4_css_inlining:
    description: |
      将内容包裹在 <section style="margin-left:6px;margin-right:6px;line-height:1.75em;"> 中，
      使用 juice.inlineContent() 将预定义 CSS 内联为 style 属性。
      预定义 CSS 包括：p/h1-h6/ul/ol/li/pre/code/blockquote/hr/i/b 等元素的字体、颜色、间距。

# ========== 内容发布 ==========
publish_api:
  url: "https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=77&token={token}&lang=zh_CN"
  method: POST
  content_type: application/x-www-form-urlencoded
  body_fields:
    token: "{token}"
    lang: "zh_CN"
    f: "json"
    ajax: "1"
    random: "{Math.random()}"
    AppMsgId: ""
    count: "1"
    data_seq: "0"
    operate_from: "Chrome"
    isnew: "0"
    title0: "{article.title}"
    author0: ""
    writerid0: "0"
    fileid0: ""
    digest0: ""
    auto_gen_digest0: "1"
    content0: "{processed_content}"
    sourceurl0: ""
    need_open_comment0: "1"
    only_fans_can_comment0: "0"
    cdn_url0: ""
    cdn_235_1_url0: ""
    cdn_1_1_url0: ""
    cdn_url_back0: ""
    crop_list0: ""
    music_id0: ""
    video_id0: ""
    voteid0: ""
    voteismlt0: ""
    supervoteid0: ""
    cardid0: ""
    cardquantity0: ""
    cardlimit0: ""
    vid_type0: ""
    show_cover_pic0: "0"
    shortvideofileid0: ""
    copyright_type0: "0"
    releasefirst0: ""
    platform0: ""
    reprint_permit_type0: ""
    allow_reprint0: ""
    allow_reprint_modify0: ""
    original_article_type0: ""
    ori_white_list0: ""
    free_content0: ""
    fee0: "0"
    ad_id0: ""
    guide_words0: ""
    is_share_copyright0: "0"
    share_copyright_url0: ""
    source_article_type0: ""
    reprint_recommend_title0: ""
    reprint_recommend_content0: ""
    share_page_type0: "0"
    share_imageinfo0: '{"list":[]}'
    share_video_id0: ""
    dot0: "{}"
    share_voice_id0: ""
    insert_ad_mode0: ""
    categories_list0: "[]"
    ad_video_transition0: ""
    can_reward0: "0"
    related_video0: ""
    is_video_recommend0: "-1"

  response:
    success_condition: "appMsgId 非空"
    post_id_field: appMsgId
    post_url_template: "https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&appmsgid={appMsgId}&token={token}&lang=zh_CN"

  error_mapping:
    -6: "请输入验证码"
    -8: "请输入验证码"
    -1: "系统错误，请注意备份内容后重试"
    -2: "参数错误，请注意备份内容后重试"
    -5: "服务错误，请注意备份内容后重试"
    -99: "内容超出字数，请调整"
    -206: "服务负荷过大，请稍后重试"
    200002: "参数错误，请注意备份内容后重试"
    200003: "登录态超时，请重新登录"
    412: "图文中含非法外链"
    62752: "可能含有具备安全风险的链接，请检查"
    64502: "你输入的微信号不存在"
    64505: "发送预览失败，请稍后再试"
    64506: "保存失败，链接不合法"
    64507: "内容不能包含外部链接"
    64562: "请勿插入非微信域名的链接"
    64509: "正文中不能包含超过3个视频"
    64515: "当前素材非最新内容，请重新打开并编辑"
    64702: "标题超出64字长度限制"
    64703: "摘要超出120字长度限制"
    64705: "内容超出字数，请调整"
    10806: "正文不能有违规内容，请重新编辑"
    10807: "内容不能违反公众平台协议"
    220001: "素材管理中的存储数量已达上限"
    220002: "图片库已达到存储上限"

# ========== 图片上传 ==========
image_upload:
  url: "https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&scene=8&writetype=doublewrite&groupid=1&ticket_id={userName}&ticket={ticket}&svr_time={svrTime}&token={token}&lang=zh_CN&seq={seq}&t={random}"
  method: POST
  body:
    type: "{mime_type}"
    id: "{timestamp}"
    name: "{timestamp}.jpg"
    lastModifiedDate: "{current_date_string}"
    size: "{file_size_string}"
    file: "{image_blob}"
  response:
    success_condition: "base_resp.err_msg == 'ok' && cdn_url 非空"
    url_field: cdn_url
  skip_patterns:
    - mmbiz.qpic.cn
    - mmbiz.qlogo.cn

# ========== 特殊机制 ==========
auth_params_from_page:
  description: |
    token, ticket, userName, svrTime 均在 checkAuth 阶段
    从 mp.weixin.qq.com 首页 HTML 正则提取。这些参数在所有 API 调用中都需要。

wechat_to_wechat_fast_path:
  description: |
    如果 article.source.platform === 'weixin' 且存在 rawHtml 字段，
    直接使用原始的未经处理的 HTML，跳过 LaTeX/链接剥离/图片上传/CSS 内联所有步骤。

latex_detection:
  description: |
    isLatexFormula() 检测文本是否包含 LaTeX 特征：
    - 包含 \ ^ _ { } 等 LaTeX 命令字符
    - 包含 Unicode 希腊字母/数学符号（α-ω 等）

header_rules:
  - url_filter: "*://mp.weixin.qq.com/cgi-bin/*"
    headers: { Origin: "https://mp.weixin.qq.com", Referer: "https://mp.weixin.qq.com/" }
    resource_types: [xmlhttprequest]
```

---

### 15. 人人都是产品经理 (woshipm)

```yaml
platform_id: woshipm
platform_name: 人人都是产品经理
content_format: html
content_preprocessing:
  - removeEmptyLines: true

# ========== 内容发布 ==========
publish_api:
  url: https://www.woshipm.com/wp-admin/admin-ajax.php
  method: POST
  content_type: application/x-www-form-urlencoded
  headers:
    X-Requested-With: XMLHttpRequest
  body_fields:
    action: "add_draft"
    post_title: "{article.title}"
    post_content: "{article.html}"

  response:
    success_condition: "post_id 非空"
    post_id_field: post_id
    post_url_template: "{response.url} || 'https://www.woshipm.com/writing?pid={draftId}'"

# ========== 图片上传 ==========
image_upload:
  url: https://www.woshipm.com/tensorflow/upyun/upload
  method: POST
  headers:
    Origin: "{referer}"
    Referer: "{referer}"
    jlstar: "Bearer {jltoken}"  # 可选
  body:
    action: "wpuf_insert_image"
    name: "{filename}"
    files: "{image_blob}"
  response:
    success_condition: "data[0].url 非空"
    url_field: data[0].url
  skip_patterns:
    - woshipm.com
    - image.woshipm.com

# ========== 特殊机制 ==========
wordpress_ajax:
  description: |
    基于 WordPress，使用标准的 admin-ajax.php 端点。

jltoken:
  description: |
    从写作页 HTML 中正则提取 /"jltoken"\s*:\s*"([^"]+)"/，
    用作图片上传的 Bearer token（jlstar 头）。

header_rules:
  - url_filter: "*://woshipm.com/wp-admin/admin-ajax.php*"
    headers: { X-Requested-With: "XMLHttpRequest" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://woshipm.com/api2/*"
    headers: { X-Requested-With: "XMLHttpRequest" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://woshipm.com/tensorflow/upyun/upload*"
    headers: { X-Requested-With: "XMLHttpRequest" }
    resource_types: [xmlhttprequest]
```

---

### 16. 雪球 (xueqiu)

```yaml
platform_id: xueqiu
platform_name: 雪球
content_format: markdown

# ========== 内容预处理 ==========
content_transformation:
  description: |
    使用 Remarkable 将 Markdown 转为 HTML，并覆盖默认渲染规则以匹配雪球格式：
    - 所有标题 (h1-h6) → <h4>
    - <strong> → <b>
    - <em> → <i>
    - 移除列表包裹元素（<ul>/<ol>/<li> 起始/闭合标签全部移除）
    - 移除水平线 <hr>
    - <img> 添加 class="ke_img" (KindEditor 格式)
    - 清理空 <p> 和多余换行

# ========== 内容发布 ==========
publish_api:
  url: https://mp.xueqiu.com/xq/statuses/draft/save.json
  method: POST
  content_type: application/x-www-form-urlencoded
  body_fields:
    text: "{rendered_html}"
    title: "{article.title}"
    cover_pic: ""
    flags: "false"
    original_event: ""
    status_id: ""
    legal_user_visible: "false"
    is_private: "false"

  response:
    success_condition: "id 非空"
    post_id_field: id
    error_field: error_description
    post_url_template: "https://mp.xueqiu.com/write/draft/{postId}"

# ========== 图片上传 ==========
image_upload:
  url: https://mp.xueqiu.com/xq/photo/upload.json
  method: POST
  body:
    file: "{image_blob}"
  response:
    url_template: "https:{url}/{filename}"  # 如果 url 以 // 开头则补 https:
    fields: [url, filename]
  skip_patterns:
    - xueqiu.com
    - imedao.com

# ========== 特殊机制 ==========
custom_markdown_rendering:
  description: |
    Markdown → HTML 转换使用 Remarkable 库，渲染规则完全定制。
    雪球编辑器使用 KindEditor，因此图片添加 class="ke_img"。
    雪球不支持标准的列表/标题 HTML 标签。

header_rules:
  - url_filter: "*://mp.xueqiu.com/xq/*"
    headers: { Origin: "https://mp.xueqiu.com", Referer: "https://mp.xueqiu.com/" }
    resource_types: [xmlhttprequest]
```

---

### 17. 语雀 (yuque)

```yaml
platform_id: yuque
platform_name: 语雀
content_format: markdown

# ========== 内容发布 (三步：创建文档 → 转换格式 → 保存内容) ==========
publish_api:
  step1_create_doc:
    url: https://www.yuque.com/api/docs
    method: POST
    content_type: application/json
    headers:
      x-csrf-token: "{csrfToken}"
    body:
      title: "{article.title}"
      type: "Doc"
      format: "lake"
      book_id: "{bookId}"   # 数字类型
      status: 0             # 0=草稿
    response:
      success_condition: "data.id 非空"
      post_id_field: data.id

  step2_convert_content:
    url: https://www.yuque.com/api/docs/convert
    method: POST
    content_type: application/json
    headers:
      x-csrf-token: "{csrfToken}"
    body:
      from: "markdown"
      to: "lake"
      content: "{article.markdown}"
    response:
      success_condition: "data.content 非空"
      content_field: data.content

  step3_save_content:
    url: "https://www.yuque.com/api/docs/{postId}/content"
    method: PUT
    content_type: application/json
    headers:
      x-csrf-token: "{csrfToken}"
    body:
      format: "lake"
      body_asl: "{lake_content}"
      body: "<div class='lake-content' typography='traditional'>{lake_content}</div>"
      body_html: "<div class='lake-content' typography='traditional'>{lake_content}</div>"
      draft_version: 0
      sync_dynamic_data: false
      save_type: "auto"
      edit_type: "Lake"

    response:
      success_condition: 不抛异常即视为成功

  post_url_template: "https://www.yuque.com/go/doc/{postId}/edit"

# ========== 图片上传 ==========
image_upload:
  url: "https://www.yuque.com/api/upload/attach?attachable_type=Doc&attachable_id={postId}&type=image"
  method: POST
  headers:
    x-csrf-token: "{csrfToken}"
  body:
    file: "{image_blob}"
  response:
    success_condition: "data.url 非空"
    url_field: data.url
  skip_patterns:
    - yuque.com
    - cdn.nlark.com

# ========== 特殊机制 ==========
csrf_token:
  description: |
    从 Cookie yuque_ctoken（域 .yuque.com）中读取。
    Cookie 不存在 → 直接判定未登录。

lake_format:
  description: |
    语雀使用自研的 "lake" 格式存储文档内容。
    通过服务端 API /api/docs/convert 将 Markdown 转为 lake 格式。

book_id:
  description: |
    来自 checkAuth 时返回的第一个用户知识库的 target_id。

header_rules:
  - url_filter: "*://www.yuque.com/api/*"
    headers: { Origin: "https://www.yuque.com", Referer: "https://www.yuque.com/dashboard" }
    resource_types: [xmlhttprequest]
```

---

### 18. 知乎 (zhihu)

```yaml
platform_id: zhihu
platform_name: 知乎
content_format: html
content_preprocessing_flags:
  - removeSpecialTags
  - removeSpecialTagsWithParent
  - processCodeBlocks
  - convertSectionToDiv
  - removeTrailingBr
  - unwrapSingleChildContainers
  - unwrapNestedFigures
  - compactHtml
  - removeEmptyLines
  - removeEmptyDivs
  - removeNestedEmptyContainers

# ========== 内容发布前处理 ==========
publish_preprocessing:
  transform_content:
    - 表格转 Draft.js 格式: |
        <table> → data-draft-node="block" data-draft-type="table"
        <thead>/<tbody> → data-draft-type="table-thead"/"table-tbody"
        <tr> → data-draft-type="table-row"
        <td>/<th> → data-draft-type="table-cell"
        自动检测表头行（全 <th> 的行）
    - <img> 包裹在 <figure> 标签中
    - <pre><code class="language-xxx"> → <pre lang="xxx"><code>
    - 移除非 Draft.js 的 data-* 属性和 inline style

# ========== 内容发布 (两步：创建空草稿 → PATCH 更新) ==========
publish_api:
  step1_create_draft:
    url: https://zhuanlan.zhihu.com/api/articles/drafts
    method: POST
    content_type: application/json
    headers:
      x-requested-with: fetch
    body:
      title: "{article.title}"
      content: ""
      delta_time: 0
    response:
      success_condition: "response.ok && id 非空"
      post_id_field: id

  step2_update_draft:
    url: "https://zhuanlan.zhihu.com/api/articles/{draftId}/draft"
    method: PATCH
    content_type: application/json
    headers:
      x-requested-with: fetch
    body:
      title: "{article.title}"
      content: "{transformed_html}"
    response:
      success_condition: "response.ok" (PATCH 可能返回 204 No Content)

  post_url_template: "https://zhuanlan.zhihu.com/p/{draftId}/edit"

# ========== 图片上传 (两种模式：URL直传 / OSS二进制上传) ==========
image_upload:
  mode_remote_url:
    url: https://zhuanlan.zhihu.com/api/uploaded_images
    method: POST
    content_type: application/x-www-form-urlencoded
    headers:
      x-requested-with: fetch
    body:
      url: "{src}"
      source: "article"
    response:
      url_field: src

  mode_binary_oss:
    step1_get_token:
      url: https://api.zhihu.com/images
      method: POST
      headers:
        x-requested-with: fetch
      body:
        image_hash: "{MD5_of_file_buffer}"
        source: "article"
      response_fields: [upload_file, upload_token]

    step2_check_existence:
      condition: "upload_file.state == 1"
      action: "轮询 GET https://api.zhihu.com/images/{imageId} 直到完成"

    step3_oss_upload:
      condition: "upload_file.state != 1"
      url: "https://zhihu-pics-upload.zhimg.com/{objectKey}"
      method: PUT
      auth: HMAC-SHA1 手动签名（V1）
      headers:
        Authorization: "{OSS_Auth}"
        x-oss-date: "{date}"
        x-oss-security-token: "{access_token}"
        x-oss-user-agent: "aliyun-sdk-js/6.17.1"
      body: "{image_blob}"

    result_url_template: "https://pic4.zhimg.com/{objectKey}"

  skip_patterns:
    - zhimg.com
    - pic1.zhimg.com
    - pic2.zhimg.com
    - pic3.zhimg.com
    - pic4.zhimg.com

# ========== 特殊机制 ==========
draft_js_format:
  description: |
    知乎专栏编辑器使用 Draft.js。需要将标准 HTML 表格转换
    为 Draft.js 的 data-draft-* 属性格式。

gif_handling:
  description: |
    如果上传的图片 MIME 类型是 image/gif，
    OSS 上传的 objectKey 会追加 .gif 后缀。

image_deduplication:
  description: |
    上传前先计算图片的 MD5 hash，
    如果知乎服务器已存在相同 hash 的图片，直接返回已有 URL。

header_rules:
  - url_filter: "*://www.zhihu.com/api/*"
    headers: { x-requested-with: "fetch" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://zhuanlan.zhihu.com/api/*"
    headers: { x-requested-with: "fetch" }
    resource_types: [xmlhttprequest]
  - url_filter: "*://api.zhihu.com/*"
    headers: { x-requested-with: "fetch" }
    resource_types: [xmlhttprequest]
```

---

---

### 20. WordPress (wordpress)

```yaml
platform_id: wordpress
platform_name: WordPress
content_format: html  (用户输入的内容，不做格式转换)

# ========== 内容发布前处理 ==========
publish_preprocessing:
  image_processing:
    description: |
      扫描内容中的 <img src="..."> 和 Markdown ![]() 图片，
      将外部域名图片下载后通过 XML-RPC 上传到 WordPress 站点，
      替换为站点本地 URL。相同 URL 只上传一次（去重）。
      跳过本站域名图片和 data: URI 图片。

# ========== 内容发布 ==========
publish_api:
  url: "{siteUrl}/xmlrpc.php"
  method: POST
  content_type: text/xml
  credentials: omit
  body_template: |
    <?xml version="1.0" encoding="UTF-8"?>
    <methodCall>
      <methodName>wp.newPost</methodName>
      <params>
        <param><value><int>0</int></value></param>           <!-- blog_id -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
        <param>
          <value>
            <struct>
              <member><name>post_title</name><value><string>{title}</string></value></member>
              <member><name>post_content</name><value><string>{content}</string></value></member>
              <member><name>post_status</name><value><string>draft</string></value></member>
              <member><name>post_type</name><value><string>post</string></value></member>
            </struct>
          </value>
        </param>
      </params>
    </methodCall>

  response:
    format: XML-RPC (text/xml)
    success_condition: "HTTP 200 且 XML 不含 <fault>"
    post_id_field: 解析 <string> 元素的值
    error_field: <fault> 内的 <string> 值
    post_url_template: |
      草稿: {siteUrl}/wp-admin/post.php?post={postId}&action=edit
      发布: {siteUrl}/?p={postId}

# ========== 图片上传 ==========
image_upload:
  url: "{siteUrl}/xmlrpc.php"
  method: POST
  content_type: text/xml
  body_template: |
    <?xml version="1.0" encoding="UTF-8"?>
    <methodCall>
      <methodName>wp.uploadFile</methodName>
      <params>
        <param><value><int>0</int></value></param>           <!-- blog_id -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
        <param>
          <value>
            <struct>
              <member><name>name</name><value><string>{filename}</string></value></member>
              <member><name>type</name><value><string>{mimeType}</string></value></member>
              <member><name>bits</name><value><base64>{base64_encoded_image}</base64></value></member>
              <member><name>overwrite</name><value><boolean>1</boolean></value></member>
            </struct>
          </value>
        </param>
      </params>
    </methodCall>

  response:
    success_condition: "HTTP 200 且 XML 中含 url 字段"
    url_field: <member><name>url</name> 对应的 <string> 值
    error_field: <fault> 内的 <string> 值

  retry:
    max_attempts: 10
    delay_strategy: 递增延迟 (1000ms * attempt)
    timeout: 30 秒下载超时

  filename:
    generated_from_mime: |
      MIME → 扩展名映射: image/jpeg→jpg, image/png→png, image/gif→gif, image/webp→webp, image/bmp→bmp, image/svg+xml→svg
      fallback: png
      pattern: "image_{timestamp}.{ext}"

# ========== 特殊机制 ==========
credentials_storage:
  description: |
    密码单独存储在 chrome.storage.local (key: cms_pwd_{accountId})，
    账户信息存储在 cmsAccounts 数组中。

xmlrpc_protocol:
  description: |
    使用标准 XML-RPC 协议。请求体手工拼接 XML 字符串。
    参数类型映射: string→<string>, number→<int>, boolean→<boolean>, Uint8Array→<base64>
    XML 特殊字符 (& < > " ') 做 escape 处理。

no_header_rules:
  description: 不使用 declarativeNetRequest，直接通过 fetch() 调用。
```

---

### 21. MetaWeblog 通用 (metaweblog)

```yaml
platform_id: metaweblog
platform_name: MetaWeblog
content_format: html

# ========== 内容发布 ==========
publish_api:
  url: "{siteUrl}/xmlrpc.php"  (或用户自定义 endpoint)
  method: POST
  content_type: text/xml
  credentials: omit
  body_template: |
    <?xml version="1.0"?>
    <methodCall>
      <methodName>metaWeblog.newPost</methodName>
      <params>
        <param><value><string>0</string></value></param>          <!-- blogId -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
        <param>
          <value>
            <struct>
              <member><name>title</name><value><string>{title}</string></value></member>
              <member><name>description</name><value><string>{content}</string></value></member>
              <member><name>categories</name><value><array><data></data></array></value></member>
            </struct>
          </value>
        </param>
        <param><value><boolean>0</boolean></value></param>        <!-- publish flag, 0=draft -->
      </params>
    </methodCall>

  response:
    format: XML-RPC (text/xml)
    success_condition: "HTTP 200 且 XML 不含 <fault>"
    post_id_field: 解析 <string> 或 <i4> 元素的值
    error_field: <fault> 内的 <string> 值
    post_url_template: |
      草稿: {siteUrl}/admin/manage-posts.php?cid={postId}
      发布: {siteUrl}/archives/{postId}/

# ========== 图片上传 ==========
image_upload:
  url: "{siteUrl}/xmlrpc.php"  (或用户自定义 endpoint)
  method: POST
  content_type: text/xml
  body_template: |
    <?xml version="1.0"?>
    <methodCall>
      <methodName>metaWeblog.newMediaObject</methodName>
      <params>
        <param><value><int>0</int></value></param>               <!-- blogId -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
        <param>
          <value>
            <struct>
              <member><name>name</name><value><string>{filename}</string></value></member>
              <member><name>type</name><value><string>{mimeType}</string></value></member>
              <member><name>bits</name><value><base64>{base64_encoded_image}</base64></value></member>
              <member><name>bytes</name><value><base64>{base64_encoded_image}</base64></value></member>
            </struct>
          </value>
        </param>
      </params>
    </methodCall>

  response:
    success_condition: "HTTP 200 且 XML 中含 url 字段"
    url_field: <member><name>url</name> 对应的 <string> 值

  compatibility:
    description: |
      同时发送 bits 和 bytes 字段以提高兼容性：
      - 标准 MetaWeblog 使用 bits
      - Typecho 使用 bytes

# ========== 特殊机制 ==========
endpoint_config:
  description: |
    支持自定义 XML-RPC endpoint：
    - 如果用户提供了 endpoint，使用用户指定的地址
    - 否则默认使用 {siteUrl}/xmlrpc.php

type_mapping:
  description: |
    参数类型的 XML-RPC 映射使用 i4 而非 int，兼容性更好。
    boolean 用 1/0 而非 true/false。

no_header_rules:
  description: 不使用 declarativeNetRequest，直接通过 fetch() 调用。
```

---

### 22. Typecho (typecho)

Typecho 兼容 MetaWeblog API，但 XML-RPC 端点和发布流程有差异。

```yaml
platform_id: typecho
platform_name: Typecho
content_format: html

# ========== 内容发布 ==========
publish_api:
  url: "{siteUrl}/action/xmlrpc"   # Typecho 专用端点
  method: POST
  content_type: text/xml
  credentials: omit
  body_template: |
    <?xml version="1.0"?>
    <methodCall>
      <methodName>metaWeblog.newPost</methodName>
      <params>
        <param><value><int>0</int></value></param>               <!-- blogId -->
        <param><value><string>{username}</string></value></param>
        <param><value><string>{password}</string></value></param>
        <param>
          <value>
            <struct>
              <member><name>title</name><value><string>{title}</string></value></member>
              <member><name>description</name><value><string>{trimmed_content}</string></value></member>
            </struct>
          </value>
        </param>
        <param><value><boolean>0</boolean></value></param>        <!-- publish flag -->
      </params>
    </methodCall>

  response:
    format: XML-RPC (text/xml)
    success_condition: "HTTP 200 且 XML 不含 <fault>"
    post_id_field: 解析 <string> 元素的值
    error_field: <fault> 内的 <string> 值

  post_id_quirk:
    description: |
      Typecho 的 metaWeblog.newPost 有时返回 "0" 而非真实 ID。
      处理方法：
      1. 如果 postId 非空且不是 "0" → 直接使用
      2. 如果 postId 为空或是 "0" → 调用 metaWeblog.getRecentPosts 获取最新文章 ID

    fallback_api:
      method: metaWeblog.getRecentPosts
      params: [0, username, password, 1]   # 获取最新 1 篇
      response:
        post_id_field: 第一个 <name>postid</name> 的 <value><string> 值

  post_url_template: |
    正常: {siteUrl}/admin/write-post.php?cid={postId}
    回退: {siteUrl}/admin/manage-posts.php

# ========== 图片上传 ==========
image_upload:
  url: "{siteUrl}/action/xmlrpc"   # Typecho 专用端点
  method: POST
  content_type: text/xml
  body_template: |
    同 MetaWeblog 的 metaWeblog.newMediaObject，同时发送 bits 和 bytes

# ========== 特殊机制 ==========
typecho_specific_endpoint:
  description: |
    Typecho 使用 /action/xmlrpc 而非 /xmlrpc.php。
    图片上传的 endpoint 也设为 /action/xmlrpc。

content_trimming:
  description: 发布时对 description 内容做 trim() 处理。

no_header_rules:
  description: 不使用 declarativeNetRequest，直接通过 fetch() 调用。
```

---

### 23. Markdown 压缩包 (zip-download)

```yaml
platform_id: zip-download
platform_name: Markdown 压缩包
content_format: markdown (内部自转换)

# ========== 内容预处理 ==========
content_preprocessing:
  - 如果没有 # 标题开头，自动在开头添加 "# {title}\n\n"
  - 使用 htmlToMarkdown() 作为 markdown 为空时的回退

# ========== "发布"流程 (本地导出) ==========
export_flow:
  description: |
    不涉及任何 HTTP API，通过 chrome.downloads API 导出 ZIP 文件。
  
  steps:
    - 创建 JSZip 实例，压缩级别 DEFLATE level 6
    - 创建 images/ 文件夹
    - 并发下载所有外部图片（4 个并发 worker），以 image_{timestamp}_{index}.{ext} 命名
    - 图片 URL 去重：相同 URL 只下载一次
    - 将图片加入 images/ 文件夹
    - 替换 markdown 中的图片引用为相对路径 images/xxx
    - 生成 article.md
    - 打包为 ZIP，通过 runtime.downloads.download() 触发浏览器下载

  image_handling:
    download: 并发池，最多 4 个同时下载
    naming: "image_{timestamp}_{index}.{ext}"
    extension_detection: 优先从 MIME type，回退到 URL 后缀
    deduplication: 相同 URL 只下载一次，引用相同文件名
    skip: data URI 图片跳过

  filename_sanitization:
    - 移除 Windows 非法字符 (< > : " / \ | ? *)
    - 移除控制字符
    - 移除尾部点号
    - 截断到 200 字符以内

# ========== 特殊机制 ==========
always_authenticated:
  description: |
    无需认证，checkAuth() 始终返回 isAuthenticated: true, username: '本地下载'。

no_header_rules:
  description: 不需要任何 Header 注入规则。
```

---

## 汇总对比表

| # | 平台 | 内容格式 | 图片上传方式 | 发布步骤 | 特殊复杂度 |
|---|------|----------|-------------|---------|-----------|
| 1 | 百家号 | HTML | 简单 FormData | 1 步 | JSONP 响应，页面 token |
| 2 | B站 | HTML (无链接) | 简单 FormData + CSRF | 1 步 | Cookie CSRF |
| 3 | 博客园 | Markdown | FormData + XSRF | 1 步 | Cookie XSRF-TOKEN |
| 4 | CSDN | Markdown + HTML | HMAC签名 → OBS | 1 步 | HMAC-SHA256 签名 |
| 5 | 51CTO | Markdown | 签名 → 配置 → COS | 1 步 | 三步腾讯云 COS |
| 6 | 豆瓣 | Markdown→Draft.js | FormData + CK | 1 步 | Draft.js 转换+图片元数据 |
| 7 | 东方财富 | HTML (大量预处理) | PUT远程/FormData | 2 步 | 嵌套API，cookie token，deviceId |
| 8 | 慕课手记 | Markdown | 简单 FormData | 1 步 | JSONP 认证 |
| 9 | 掘金 | Markdown | AWS4签名 ImageX (5步) | 1 步 | Ware CSRF, AWS4, 5步图片 |
| 10 | 开源中国 | Markdown/HTML | 简单 FormData | 1 步 | contentType 标志位 |
| 11 | 思否 | Markdown | FormData + token | 1 步 | 页面 token, 双格式响应 |
| 12 | 搜狐号 | HTML | FormData + accountId | 1 步 | 设备ID, sp-cm, 多账号 |
| 13 | 微博 | HTML | 直接Blob / 异步+轮询 | 2 步 | SN-REQID, 自定义图片处理器 |
| 14 | 微信公众号 | HTML | FormData + 多参数 | 1 步 | LaTeX转换, CSS内联, 外链剥离, 错误码映射 |
| 15 | 人人都是PM | HTML | FormData + Bearer | 1 步 | WordPress AJAX |
| 16 | 雪球 | Markdown→定制HTML | 简单 FormData | 1 步 | Remarkable 自定义渲染 |
| 17 | 语雀 | Markdown→lake | FormData + CSRF | 3 步 | lake 格式转换 |
| 18 | 知乎 | HTML (大量预处理) | URL直传 / OSS HMAC-SHA1 | 2 步 | Draft.js 表格, OSS 签名, 图片去重 |
| 19 | WordPress | HTML (用户输入) | XML-RPC base64 | 1 步 | XML-RPC, 密码存储, 10次重试 |
| 20 | MetaWeblog | HTML | XML-RPC base64 (bits+bytes) | 1 步 | 自定义 endpoint, i4 类型 |
| 21 | Typecho | HTML | XML-RPC base64 (/action/xmlrpc) | 1 步 | postId=0 回退, /action/xmlrpc 端点 |
| 22 | 压缩包 | Markdown | 本地下载到ZIP | 本地 | JSZip, 并发下载池 |

---

## 私有子模块平台

以下约 10 个平台的发布适配器位于私有 git 子模块 `wechatsync-private-adapters` 中，无法从公开仓库提取规则：

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

> 公开仓库 22 个平台（19 个 DSL + 3 个 CMS）+ 私有子模块 ~10 个平台 ≈ 32 平台。

---

## 通用模式总结

### 内容格式
- **Markdown** (9个): 博客园、CSDN、51CTO、豆瓣、慕课、掘金、开源中国、思否、雪球
- **HTML** (9个): 百家号、B站、东方财富、搜狐号、微博、微信公众号、人人都是PM、知乎、语雀(转lake)
- **HTML/用户输入** (3个): WordPress、MetaWeblog、Typecho
- **本地** (1个): 压缩包

### 发布步骤复杂度
- **1 步直接保存** (15个): 百家号、B站、博客园、CSDN、51CTO、豆瓣、慕课、掘金、开源中国、搜狐号、微信公众号、人人都是PM、WordPress、MetaWeblog、Typecho
- **2 步创建+更新** (4个): 东方财富、微博、知乎、雪球
- **3 步创建+转换+保存** (1个): 语雀
- **本地导出** (1个): 压缩包

### 图片上传复杂度
- **简单 FormData** (9个): 百家号、B站、博客园、豆瓣、慕课、开源中国、人人都是PM、搜狐号、雪球
- **需要签名认证** (5个): CSDN(HMAC-SHA256)、51CTO(三步COS)、掘金(AWS4五步)、微博(异步轮询)、知乎(OSS HMAC-SHA1)
- **XML-RPC base64** (3个): WordPress、MetaWeblog、Typecho
- **直接二进制上传** (2个): 东方财富(PUT)、微信公众号(FORMDATA+多认证参数)
- **本地下载** (1个): 压缩包

### 图片 Skip Patterns 规律
所有适配器都会跳过自身域名的图片（已上传到该平台的图片不需要重新上传），避免重复上传浪费带宽和时间。

### 统一返回结构
```typescript
interface SyncResult {
  platform: string       // 平台 ID
  success: boolean       // 是否成功
  postId?: string        // 草稿/文章 ID
  postUrl?: string       // 草稿编辑页 URL
  draftOnly?: boolean    // 是否为草稿（始终为 true）
  error?: string         // 错误信息
  timestamp: number      // 完成时间戳
}
```
