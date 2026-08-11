/**
 * NiceMD Publish Adapters
 * Implements direct HTTP API publishing and image uploading for supported platforms.
 */

// AWS4 Signature and CRC32 helpers for Juejin ImageX upload
async function hmacSha256(key, message) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
}

async function sha256(message) {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(message));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatAmzDate(date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function formatDateStamp(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

async function signAWS4(params) {
  const {
    method,
    url,
    accessKeyId,
    secretAccessKey,
    securityToken,
    region = 'cn-north-1',
    service = 'imagex',
    headers = {},
    body = ''
  } = params;

  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  const queryString = parsedUrl.search.slice(1);

  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = formatDateStamp(now);

  const queryParams = new URLSearchParams(queryString);
  const sortedParams = Array.from(queryParams.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const canonicalQueryString = sortedParams
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const signedHeadersObj = {
    'x-amz-date': amzDate
  };

  if (securityToken) {
    signedHeadersObj['x-amz-security-token'] = securityToken;
  }

  Object.assign(signedHeadersObj, headers);

  const signedHeaderNames = Object.keys(signedHeadersObj)
    .map(k => k.toLowerCase())
    .sort()
    .join(';');

  const canonicalHeaders = Object.entries(signedHeadersObj)
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .sort()
    .join('\n') + '\n';

  const payloadHash = await sha256(body);

  const canonicalRequest = [
    method.toUpperCase(),
    path || '/',
    canonicalQueryString,
    canonicalHeaders,
    signedHeaderNames,
    payloadHash
  ].join('\n');

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await sha256(canonicalRequest);

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n');

  const enc = new TextEncoder();
  const kDate = await hmacSha256(enc.encode('AWS4' + secretAccessKey), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');

  const signatureBuffer = await hmacSha256(kSigning, stringToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const authorization = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames}, Signature=${signature}`;

  const resultHeaders = {
    authorization,
    'x-amz-date': amzDate
  };

  if (securityToken) {
    resultHeaders['x-amz-security-token'] = securityToken;
  }

  return {
    authorization,
    amzDate,
    headers: resultHeaders
  };
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = getCRC32Table();
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0');
}

let crc32Table = null;
function getCRC32Table() {
  if (crc32Table) return crc32Table;
  crc32Table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crc32Table[i] = c;
  }
  return crc32Table;
}

class CodeAdapter {
  constructor(platformId) {
    this.platformId = platformId;
  }

  async fetch(url, init = {}) {
    init.credentials = 'include';
    return fetch(url, init);
  }

  async getCookieValue(url, name) {
    return new Promise((resolve) => {
      if (!chrome.cookies) {
        resolve(null);
        return;
      }
      chrome.cookies.get({ url, name }, (cookie) => {
        if (chrome.runtime.lastError) {
          console.warn(`[NiceMD Cookie] Failed to read ${name}:`, chrome.runtime.lastError.message);
          resolve(null);
        } else {
          resolve(cookie ? cookie.value : null);
        }
      });
    });
  }

  createResult(success, data = {}) {
    return {
      platform: this.platformId,
      success,
      timestamp: Date.now(),
      ...data
    };
  }

  parseMarkdownImages(markdown) {
    const results = [];
    const len = markdown.length;
    let i = 0;
    const findClosingBracket = (start) => {
      for (let j = start; j < len; j++) {
        const ch = markdown[j];
        if (ch === '\\') {
          j++;
          continue;
        }
        if (ch === ']') return j;
      }
      return -1;
    };

    while (i < len) {
      const start = markdown.indexOf('![', i);
      if (start === -1) break;

      const altStart = start + 2;
      const altEnd = findClosingBracket(altStart);
      if (altEnd === -1 || markdown[altEnd + 1] !== '(') {
        i = altStart;
        continue;
      }

      let k = altEnd + 2;
      while (k < len && /\s/.test(markdown[k])) k++;

      let url = '';
      if (markdown[k] === '<') {
        const close = markdown.indexOf('>', k + 1);
        if (close === -1) {
          i = altEnd + 1;
          continue;
        }
        url = markdown.slice(k + 1, close);
        k = close + 1;
      } else {
        const urlStart = k;
        let depth = 0;
        while (k < len) {
          const ch = markdown[k];
          if (ch === '\\') {
            k += 2;
            continue;
          }
          if (ch === '(') {
            depth++;
          } else if (ch === ')') {
            if (depth === 0) break;
            depth--;
          } else if (/\s/.test(ch) && depth === 0) {
            break;
          }
          k++;
        }
        url = markdown.slice(urlStart, k);
      }

      if (!url) {
        i = altEnd + 1;
        continue;
      }

      while (k < len && /\s/.test(markdown[k])) k++;

      if (k < len && (markdown[k] === '"' || markdown[k] === '\'')) {
        const quote = markdown[k];
        k++;
        while (k < len) {
          const ch = markdown[k];
          if (ch === '\\') {
            k += 2;
            continue;
          }
          if (ch === quote) {
            k++;
            break;
          }
          k++;
        }
        while (k < len && /\s/.test(markdown[k])) k++;
      }

      if (markdown[k] !== ')') {
        i = altEnd + 1;
        continue;
      }

      const full = markdown.slice(start, k + 1);
      const alt = markdown.slice(altStart, altEnd);
      results.push({ full, alt, src: url });
      i = k + 1;
    }
    return results;
  }

  // Base download helper (handles remote URLs and data URIs)
  async downloadImage(url) {
    if (url.startsWith('data:')) {
      const res = await fetch(url);
      return res.blob();
    }
    const res = await this.fetch(url);
    if (!res.ok) throw new Error(`HTTP image download failed with ${res.status}`);
    return res.blob();
  }

  // Unified image extraction and replacements
  async processImages(content, uploadFn, options = {}) {
    const { skipPatterns = [] } = options;
    const matches = [];

    // 1. HTML Image tags
    const htmlImgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let match;
    while ((match = htmlImgRegex.exec(content)) !== null) {
      matches.push({ full: match[0], src: match[1], type: 'html' });
    }

    // 2. Markdown Images
    const mdMatches = this.parseMarkdownImages(content);
    for (const m of mdMatches) {
      matches.push({ full: m.full, src: m.src, alt: m.alt, type: 'markdown' });
    }

    if (matches.length === 0) return content;

    let result = content;
    const uploadedMap = new Map();

    for (const item of matches) {
      const src = item.src;
      if (!src) continue;

      if (!src.startsWith('data:')) {
        const shouldSkip = skipPatterns.some(pattern => src.includes(pattern));
        if (shouldSkip) continue;
      }

      try {
        let uploadedUrl = uploadedMap.get(src);
        if (!uploadedUrl) {
          const blob = await this.downloadImage(src);
          const uploadRes = await uploadFn(blob, src);
          uploadedUrl = uploadRes.url;
          uploadedMap.set(src, uploadedUrl);
        }

        let replacement;
        if (item.type === 'html') {
          replacement = item.full.replace(src, uploadedUrl);
        } else {
          replacement = `![${item.alt || ''}](${uploadedUrl})`;
        }
        result = result.replace(item.full, replacement);
      } catch (err) {
        console.warn(`[NiceMD ProcessImages] Failed to process image ${src}:`, err.message);
      }

      // Small delay to prevent rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    return result;
  }
}

// 1. CSDN Adapter
class CsdnAdapter extends CodeAdapter {
  constructor() {
    super('csdn');
  }

  async signRequest(path, method = 'POST') {
    const nonce = crypto.randomUUID();
    const key = '203803574';
    const secret = '9znpamsyl2c7cdrr9sas0le9vbc3r6ba';
    
    const stringToSign = method === 'GET'
      ? `GET\n*/*\n\n\n\nx-ca-key:${key}\nx-ca-nonce:${nonce}\n${path}`
      : `POST\n*/*\n\napplication/json\n\nx-ca-key:${key}\nx-ca-nonce:${nonce}\n${path}`;
      
    const signature = await self.hmacSHA256Base64(secret, stringToSign);
    
    const headers = {
      'accept': '*/*',
      'x-ca-key': key,
      'x-ca-nonce': nonce,
      'x-ca-signature': signature,
      'x-ca-signature-headers': 'x-ca-key,x-ca-nonce'
    };
    if (method === 'POST') {
      headers['content-type'] = 'application/json';
    }
    return headers;
  }

  async uploadImage(blob, src) {
    const ext = src.split('.').pop()?.toLowerCase()?.split('?')[0] || 'jpg';
    const validExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    
    const apiPath = '/resource-api/v1/image/direct/upload/signature';
    const signHeaders = await this.signRequest(apiPath, 'POST');
    
    const sigRes = await this.fetch(`https://bizapi.csdn.net${apiPath}`, {
      method: 'POST',
      headers: signHeaders,
      body: JSON.stringify({
        imageTemplate: '',
        appName: 'direct_blog_markdown',
        imageSuffix: validExt
      })
    });
    
    const sigJson = await sigRes.json();
    if (sigJson.code !== 200 || !sigJson.data) {
      throw new Error('获取 CSDN 上传签名失败');
    }
    
    const uploadData = sigJson.data;
    const customParam = uploadData.customParam;
    
    const formData = new FormData();
    formData.append('key', uploadData.filePath);
    formData.append('policy', uploadData.policy);
    formData.append('signature', uploadData.signature);
    formData.append('callbackBody', uploadData.callbackBody);
    formData.append('callbackBodyType', uploadData.callbackBodyType);
    formData.append('callbackUrl', uploadData.callbackUrl);
    formData.append('AccessKeyId', uploadData.accessId);
    formData.append('x:rtype', customParam.rtype);
    formData.append('x:filePath', customParam.filePath);
    formData.append('x:isAudit', String(customParam.isAudit));
    formData.append('x:x-image-app', customParam['x-image-app']);
    formData.append('x:type', customParam.type);
    formData.append('x:x-image-suffix', customParam['x-image-suffix']);
    formData.append('x:username', customParam.username);
    formData.append('file', blob, `image.${validExt}`);
    
    const obsResponse = await fetch(uploadData.host, {
      method: 'POST',
      body: formData
    });
    
    const obsRes = await obsResponse.json();
    if (obsRes.code !== 200 || !obsRes.data || !obsRes.data.imageUrl) {
      throw new Error('OBS 上传失败');
    }
    
    return { url: obsRes.data.imageUrl };
  }

  async publish(article) {
    let processedMarkdown = article.markdown;
    try {
      processedMarkdown = await this.processImages(
        processedMarkdown,
        (blob, src) => this.uploadImage(blob, src),
        { skipPatterns: ['csdnimg.cn', 'csdn.net'] }
      );
    } catch (err) {
      console.warn('[CSDN Publish] Image processing failed:', err.message);
    }

    const nonce = crypto.randomUUID();
    const key = '203803574';
    const secret = '9znpamsyl2c7cdrr9sas0le9vbc3r6ba';
    const path = '/blog-console-api/v3/mdeditor/saveArticle';
    const stringToSign = `POST\n*/*\n\napplication/json\n\nx-ca-key:${key}\nx-ca-nonce:${nonce}\n${path}`;
    
    const signature = await self.hmacSHA256Base64(secret, stringToSign);

    const body = {
      title: article.title,
      markdowncontent: processedMarkdown,
      content: article.html,
      readType: 'public',
      level: 0,
      tags: '',
      status: 2,
      categories: '',
      type: 'original',
      original_link: '',
      authorized_status: false,
      not_auto_saved: '1',
      source: 'pc_mdeditor',
      cover_images: [],
      cover_type: 1,
      is_new: 1,
      vote_id: 0,
      resource_id: '',
      pubStatus: 'draft',
      creator_activity_id: ''
    };

    const response = await this.fetch('https://bizapi.csdn.net/blog-console-api/v3/mdeditor/saveArticle', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': '*/*',
        'x-ca-key': key,
        'x-ca-nonce': nonce,
        'x-ca-signature': signature,
        'x-ca-signature-headers': 'x-ca-key,x-ca-nonce'
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    if (json.code === 200 && json.data && json.data.id) {
      return this.createResult(true, {
        postId: String(json.data.id),
        postUrl: `https://editor.csdn.net/md?articleId=${json.data.id}`,
        draftOnly: true
      });
    }

    throw new Error(json.msg || json.message || 'CSDN draft creation API failed');
  }
}

// 2. Juejin Adapter
class JuejinAdapter extends CodeAdapter {
  constructor() {
    super('juejin');
    this.uuid = 'xxxxxxxxxxxxxxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    ) + Date.now().toString();
  }

  async getCsrfToken() {
    const res = await this.fetch('https://api.juejin.cn/user_api/v1/sys/token', {
      method: 'HEAD',
      headers: {
        'x-secsdk-csrf-request': '1',
        'x-secsdk-csrf-version': '1.2.10'
      }
    });
    const headerVal = res.headers.get('x-ware-csrf-token');
    if (!headerVal) return '';
    const parts = headerVal.split(',');
    return parts[1] || '';
  }

  async getImageXToken() {
    const url = `https://api.juejin.cn/imagex/v2/gen_token?aid=2608&uuid=${this.uuid}&client=web`;
    const res = await this.fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await res.json();
    if (json.err_no && json.err_no !== 0) {
      throw new Error(json.err_msg || '获取 Juejin ImageX Token 失败');
    }
    const tokenData = json.data?.token;
    if (!tokenData || !tokenData.AccessKeyId || !tokenData.SecretAccessKey) {
      throw new Error('Juejin ImageX Token 响应不完整');
    }
    return {
      AccessKeyId: tokenData.AccessKeyId,
      SecretAccessKey: tokenData.SecretAccessKey,
      SessionToken: tokenData.SessionToken
    };
  }

  async uploadImage(blob, src) {
    const token = await this.getImageXToken();
    const serviceId = '73owjymdk6';
    
    // Apply image upload
    const applyUrl = `https://imagex.bytedanceapi.com/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${serviceId}`;
    const signResult = await signAWS4({
      method: 'GET',
      url: applyUrl,
      accessKeyId: token.AccessKeyId,
      secretAccessKey: token.SecretAccessKey,
      securityToken: token.SessionToken,
      region: 'cn-north-1',
      service: 'imagex'
    });
    
    const applyRes = await fetch(applyUrl, {
      method: 'GET',
      headers: signResult.headers
    });
    
    const applyJson = await applyRes.json();
    if (!applyJson.Result?.UploadAddress) {
      throw new Error('申请 Juejin ImageX 上传失败');
    }
    
    const uploadAddress = applyJson.Result.UploadAddress;
    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    if (!storeInfo || !uploadHost) {
      throw new Error('无效的 Juejin ImageX 上传地址');
    }
    
    // Upload binary to TOS
    const uploadUrl = `https://${uploadHost}/${storeInfo.StoreUri}`;
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const crc32Val = crc32(uint8Array);
    
    const tosRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': storeInfo.Auth,
        'Content-Type': blob.type || 'application/octet-stream',
        'Content-CRC32': crc32Val
      },
      body: blob
    });
    
    if (!tosRes.ok) {
      throw new Error(`Juejin TOS 上传失败: ${tosRes.status}`);
    }
    
    // Commit upload
    const commitUrl = `https://imagex.bytedanceapi.com/?Action=CommitImageUpload&Version=2018-08-01&SessionKey=${encodeURIComponent(uploadAddress.SessionKey)}&ServiceId=${serviceId}`;
    const commitSign = await signAWS4({
      method: 'POST',
      url: commitUrl,
      accessKeyId: token.AccessKeyId,
      secretAccessKey: token.SecretAccessKey,
      securityToken: token.SessionToken,
      region: 'cn-north-1',
      service: 'imagex'
    });
    
    const commitRes = await fetch(commitUrl, {
      method: 'POST',
      headers: {
        ...commitSign.headers,
        'Content-Length': '0'
      }
    });
    const commitJson = await commitRes.json();
    if (!commitJson.Result) {
      throw new Error('提交 Juejin ImageX 上传失败');
    }
    
    // Retrieve image URL
    const getUrl = `https://api.juejin.cn/imagex/v2/get_img_url?aid=2608&uuid=${this.uuid}&uri=${encodeURIComponent(storeInfo.StoreUri)}&img_type=private`;
    const getUrlRes = await this.fetch(getUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const getUrlJson = await getUrlRes.json();
    if (getUrlJson.err_no && getUrlJson.err_no !== 0) {
      throw new Error(getUrlJson.err_msg || '获取 Juejin 图片 URL 失败');
    }
    
    const imageUrl = getUrlJson.data?.main_url || getUrlJson.data?.backup_url;
    if (!imageUrl) {
      throw new Error('获取 Juejin 图片 URL 失败');
    }
    
    return { url: imageUrl };
  }

  async publish(article) {
    const csrfToken = await this.getCsrfToken();
    
    let processedMarkdown = article.markdown;
    try {
      processedMarkdown = await this.processImages(
        processedMarkdown,
        (blob, src) => this.uploadImage(blob, src),
        {
          skipPatterns: [
            'juejin.cn', 'p1-juejin', 'p3-juejin',
            'p6-juejin', 'p9-juejin', 'byteimg.com'
          ]
        }
      );
    } catch (err) {
      console.warn('[Juejin Publish] Image processing failed:', err.message);
    }

    const body = {
      brief_content: '',
      category_id: '0',
      cover_image: '',
      edit_type: 10,
      html_content: 'deprecated',
      link_url: '',
      mark_content: processedMarkdown,
      tag_ids: [],
      title: article.title
    };

    const headers = {
      'content-type': 'application/json',
      'accept': '*/*'
    };
    if (csrfToken) {
      headers['x-secsdk-csrf-token'] = csrfToken;
    }

    const response = await this.fetch('https://api.juejin.cn/content_api/v1/article_draft/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const json = await response.json();
    if ((!json.err_no || json.err_no === 0) && json.data && json.data.id) {
      return this.createResult(true, {
        postId: String(json.data.id),
        postUrl: `https://juejin.cn/editor/drafts/${json.data.id}`,
        draftOnly: true
      });
    }

    throw new Error(json.err_msg || 'Juejin draft creation API failed');
  }
}

// 3. WeChat / Weixin Adapter
// 3. WeChat / Weixin Adapter
class WechatAdapter extends CodeAdapter {
  constructor() {
    super('wechat');
    this.weixinMeta = null;
  }

  async getWechatParams(forceRefresh = false) {
    if (this.weixinMeta && !forceRefresh) {
      return this.weixinMeta;
    }

    const response = await this.fetch('https://mp.weixin.qq.com/', {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });
    const finalUrl = response.url;
    const html = await response.text();

    const tokenMatch = html.match(/data:\s*\{[\s\S]*?t:\s*["']([^"']+)["']/) || finalUrl.match(/token=(\d+)/);
    if (!tokenMatch) {
      throw new Error('请先登录微信公众号后台');
    }
    const token = tokenMatch[1];
    
    const ticketMatch = html.match(/ticket:\s*["']([^"']+)["']/);
    const userNameMatch = html.match(/user_name:\s*["']([^"']+)["']/);
    const timeMatch = html.match(/time:\s*["'](\d+)["']/);
    
    this.weixinMeta = {
      token,
      ticket: ticketMatch ? ticketMatch[1] : '',
      userName: userNameMatch ? userNameMatch[1] : '',
      svrTime: timeMatch ? timeMatch[1] : String(Math.floor(Date.now() / 1000))
    };

    return this.weixinMeta;
  }

  async uploadImage(blob, src) {
    const params = await this.getWechatParams();
    const formData = new FormData();
    const timestamp = Date.now();
    const fileName = `image_${timestamp}.jpg`;
    
    formData.append('type', blob.type || 'image/jpeg');
    formData.append('id', String(timestamp));
    formData.append('name', fileName);
    formData.append('size', String(blob.size));
    formData.append('file', blob, fileName);
    
    const seq = Date.now();
    const uploadUrl = `https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&scene=8&writetype=doublewrite&groupid=1&ticket_id=${params.userName}&ticket=${params.ticket}&svr_time=${params.svrTime}&token=${params.token}&lang=zh_CN&seq=${seq}&t=${Math.random()}`;
    
    const res = await this.fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    const json = await res.json();
    if (json.base_resp && json.base_resp.err_msg === 'ok' && json.cdn_url) {
      return { url: json.cdn_url };
    }
    throw new Error(json.base_resp ? json.base_resp.err_msg : '微信图片上传接口失败');
  }

  isLatexFormula(text) {
    if (/[\\^_{}]/.test(text)) return true;
    if (/[α-ωΑ-Ω]/.test(text)) return true;
    if (/[∑∏∫∂∇∞≠≤≥±×÷√]/.test(text)) return true;
    return false;
  }

  processLatex(content) {
    const LATEX_API = 'https://latex.codecogs.com/png.latex';

    content = content.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
      if (!this.isLatexFormula(latex)) return match;
      const encoded = encodeURIComponent(latex.trim());
      return `<p style="text-align: center;"><img src="${LATEX_API}?\\dpi{150}${encoded}" alt="formula" style="vertical-align: middle; max-width: 100%;"></p>`;
    });

    content = content.replace(/\$([^$]+)\$/g, (match, latex) => {
      if (!this.isLatexFormula(latex)) return match;
      const encoded = encodeURIComponent(latex.trim());
      return `<img src="${LATEX_API}?\\dpi{120}${encoded}" alt="formula" style="vertical-align: middle;">`;
    });

    return content;
  }

  stripExternalLinks(content) {
    return content.replace(
      /<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (match, href, text) => {
        if (href && (
          href.includes('mp.weixin.qq.com') ||
          href.includes('weixin.qq.com') ||
          href.startsWith('#') ||
          href.startsWith('javascript:')
        )) {
          return match;
        }
        return text;
      }
    );
  }

  cleanTitle(title) {
    if (!title) return '';
    // 1. Remove HTML tags
    let clean = title.replace(/<[^>]+>/g, '');
    // 2. Remove markdown bold/italic/code decorations
    clean = clean.replace(/[\*\_\`]/g, '');
    // 3. Remove surrogate pair emojis (SMP plane)
    clean = clean.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
    // 4. Remove BMP emojis & technical symbols
    clean = clean.replace(/[\u2600-\u27BF]/g, '');
    clean = clean.replace(/[\u2300-\u23FF]/g, '');
    // 5. Remove symbols that WeChat often rejects
    clean = clean.replace(/[\/\\\|\"\']/g, '');
    return clean.replace(/\s+/g, ' ').trim();
  }

  async publish(article) {
    console.log('[NiceMD WeChat Sync] Starting WeChat publish with title:', article.title);
    
    // Clear session cache at publish start
    this.weixinMeta = null;
    let token;
    try {
      const params = await this.getWechatParams();
      token = params.token;
      console.log('[NiceMD WeChat Sync] Retrieved WeChat params. Token:', token, 'UserName:', params.userName);
    } catch (err) {
      console.error('[NiceMD WeChat Sync] Failed to retrieve WeChat params:', err.message);
      throw err;
    }

    let processedHtml = article.html || '';

    // If source is WeChat, bypass all preprocessing to retain native layout
    if (article.source && (article.source.platform === 'wechat' || article.source.platform === 'weixin')) {
      console.log('[NiceMD WeChat Sync] Source is WeChat, using raw HTML');
    } else {
      console.log('[NiceMD WeChat Sync] Pre-processing LaTeX and links');
      processedHtml = this.processLatex(processedHtml);
      processedHtml = this.stripExternalLinks(processedHtml);
      try {
        console.log('[NiceMD WeChat Sync] Processing images...');
        processedHtml = await this.processImages(
          processedHtml,
          (blob, src) => this.uploadImage(blob, src),
          { skipPatterns: ['mmbiz.qpic.cn', 'mmbiz.qlogo.cn'] }
        );
        console.log('[NiceMD WeChat Sync] Images processed successfully.');
      } catch (err) {
        console.warn('[NiceMD WeChat Sync] Image processing warning (continuing sync):', err.message);
      }
      
      // Wrap content inside a section with inline styles as Wechatsync does, ONLY if not already styled by NiceMD
      if (!processedHtml.includes('nice-md-wechat-wrapper') && !processedHtml.includes('id="nice"')) {
        processedHtml = `<section style="margin-left: 6px; margin-right: 6px; line-height: 1.75em;">${processedHtml}</section>`;
      }
    }

    const cleanedTitle = this.cleanTitle(article.title) || '无标题文章';
    console.log('[NiceMD WeChat Sync] Original title:', article.title, '-> Cleaned title:', cleanedTitle);

    // Prepare URLSearchParams body
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('lang', 'zh_CN');
    params.append('f', 'json');
    params.append('ajax', '1');
    params.append('random', String(Math.random()));
    params.append('AppMsgId', '');
    params.append('count', '1');
    params.append('data_seq', '0');
    params.append('operate_from', 'Chrome');
    params.append('isnew', '0');
    params.append('title0', cleanedTitle);
    params.append('author0', '');
    params.append('writerid0', '0');
    params.append('fileid0', '');
    params.append('digest0', '');
    params.append('auto_gen_digest0', '1');
    params.append('content0', processedHtml);
    params.append('sourceurl0', '');
    params.append('need_open_comment0', '1');
    params.append('only_fans_can_comment0', '0');
    params.append('cdn_url0', '');
    params.append('cdn_235_1_url0', '');
    params.append('cdn_1_1_url0', '');
    params.append('cdn_url_back0', '');
    params.append('crop_list0', '');
    params.append('music_id0', '');
    params.append('video_id0', '');
    params.append('voteid0', '');
    params.append('voteismlt0', '');
    params.append('supervoteid0', '');
    params.append('cardid0', '');
    params.append('cardquantity0', '');
    params.append('cardlimit0', '');
    params.append('vid_type0', '');
    params.append('show_cover_pic0', '0');
    params.append('shortvideofileid0', '');
    params.append('copyright_type0', '0');
    params.append('releasefirst0', '');
    params.append('platform0', '');
    params.append('reprint_permit_type0', '');
    params.append('allow_reprint0', '');
    params.append('allow_reprint_modify0', '');
    params.append('original_article_type0', '');
    params.append('ori_white_list0', '');
    params.append('free_content0', '');
    params.append('fee0', '0');
    params.append('ad_id0', '');
    params.append('guide_words0', '');
    params.append('is_share_copyright0', '0');
    params.append('share_copyright_url0', '');
    params.append('source_article_type0', '');
    params.append('reprint_recommend_title0', '');
    params.append('reprint_recommend_content0', '');
    params.append('share_page_type0', '0');
    params.append('share_imageinfo0', '{"list":[]}');
    params.append('share_video_id0', '');
    params.append('dot0', '{}');
    params.append('share_voice_id0', '');
    params.append('insert_ad_mode0', '');
    params.append('categories_list0', '[]');
    params.append('ad_video_transition0', '');
    params.append('can_reward0', '0');
    params.append('related_video0', '');
    params.append('is_video_recommend0', '-1');

    console.log('[NiceMD WeChat Sync] Sending operate_appmsg request with content length:', processedHtml.length);

    let response;
    try {
      response = await this.fetch(`https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=77&token=${token}&lang=zh_CN`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
    } catch (err) {
      console.error('[NiceMD WeChat Sync] Network fetch failed during operate_appmsg:', err.message);
      throw err;
    }

    const json = await response.json();
    console.log('[NiceMD WeChat Sync] operate_appmsg JSON response:', JSON.stringify(json));

    if (json.appMsgId) {
      console.log('[NiceMD WeChat Sync] Success! Created WeChat draft appMsgId:', json.appMsgId);
      return this.createResult(true, {
        postId: String(json.appMsgId),
        postUrl: `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&appmsgid=${json.appMsgId}&token=${token}&lang=zh_CN`,
        draftOnly: true
      });
    }

    const errMap = {
      '-6': '请输入验证码',
      '-8': '请输入验证码',
      '-1': '系统错误，请注意备份内容后重试',
      '-2': '参数错误，请注意备份内容后重试',
      '-5': '服务错误，请注意备份内容后重试',
      '-99': '内容超出字数，请调整',
      '-206': '服务负荷过大，请稍后重试',
      '200002': '参数错误，请注意备份内容后重试',
      '200003': '登录态超时，请重新登录',
      '412': '图文中含非法外链',
      '62752': '可能含有具备安全风险 of 链接，请检查',
      '64502': '你输入的微信号不存在',
      '64505': '发送预览失败，请稍后再试',
      '64506': '保存失败，链接不合法',
      '64507': '内容不能包含外部链接',
      '64562': '请勿插入非微信域名的链接',
      '64509': '正文中不能包含超过3个视频',
      '64515': '当前素材非最新内容，请重新打开并编辑',
      '64702': '标题超出64字长度限制',
      '64703': '摘要超出120字长度限制',
      '64705': '内容超出字数，请调整',
      '10806': '正文不能有违规内容，请重新编辑',
      '10807': '内容不能违反公众平台协议',
      '220001': '素材管理中的存储数量已达上限',
      '220002': '图片库已达到存储上限'
    };

    const ret = json.ret || (json.base_resp ? json.base_resp.ret : null);
    const errMsg = ret ? (errMap[String(ret)] || (json.base_resp ? json.base_resp.err_msg : null)) : null;
    const finalError = errMsg || json.err_msg || '微信草稿创建API失败';
    console.error('[NiceMD WeChat Sync] Save draft failed. WeChat returned error:', finalError);
    throw new Error(finalError);
  }
}

// 4. Cnblogs Adapter
class CnblogsAdapter extends CodeAdapter {
  constructor() {
    super('cnblogs');
  }

  async uploadImage(blob, src) {
    const xsrfToken = await this.getCookieValue('https://i.cnblogs.com', 'XSRF-TOKEN');
    if (!xsrfToken) {
      throw new Error('未登录博客园或无法提取 XSRF-TOKEN');
    }
    
    const formData = new FormData();
    formData.append('image', blob, 'image.png');
    formData.append('app', 'blog');
    formData.append('uploadType', 'Select');
    
    const uploadRes = await this.fetch('https://upload.cnblogs.com/v2/images/cors-upload', {
      method: 'POST',
      headers: {
        'x-xsrf-token': xsrfToken
      },
      body: formData
    });
    
    const res = await uploadRes.json();
    const imageUrl = res.data || res.url || res.imageUrl || res.src;
    if (!imageUrl) {
      throw new Error('博客园图片上传接口失败');
    }
    return { url: imageUrl };
  }

  async publish(article) {
    // 1. Trigger setting cookie
    await this.fetch('https://i.cnblogs.com/posts/edit');
    // 2. Read XSRF token
    const xsrfToken = await this.getCookieValue('https://i.cnblogs.com', 'XSRF-TOKEN');
    if (!xsrfToken) {
      throw new Error('未登录博客园或无法提取 XSRF-TOKEN');
    }

    let processedMarkdown = article.markdown;
    try {
      processedMarkdown = await this.processImages(
        processedMarkdown,
        (blob, src) => this.uploadImage(blob, src),
        { skipPatterns: ['cnblogs.com', 'img2024.cnblogs.com', 'img2023.cnblogs.com'] }
      );
    } catch (err) {
      console.warn('[Cnblogs Publish] Image processing failed:', err.message);
    }

    const body = {
      id: null,
      postType: 2,
      accessPermission: 0,
      title: article.title,
      url: null,
      postBody: processedMarkdown,
      categoryIds: null,
      categories: null,
      collectionIds: [],
      inSiteCandidate: false,
      inSiteHome: false,
      siteCategoryId: null,
      blogTeamIds: null,
      isPublished: false,
      displayOnHomePage: false,
      isAllowComments: true,
      includeInMainSyndication: false,
      isPinned: false,
      showBodyWhenPinned: false,
      isOnlyForRegisterUser: false,
      isUpdateDateAdded: false,
      entryName: null,
      description: null,
      featuredImage: null,
      tags: null,
      password: null,
      publishAt: null,
      datePublished: new Date().toISOString(),
      dateUpdated: null,
      isMarkdown: true,
      isDraft: true,
      autoDesc: null,
      changePostType: false,
      blogId: 0,
      author: null,
      removeScript: false,
      clientInfo: null,
      changeCreatedTime: false,
      canChangeCreatedTime: false,
      isContributeToImpressiveBugActivity: false,
      usingEditorId: 5,
      sourceUrl: null
    };

    const response = await this.fetch('https://i.cnblogs.com/api/posts', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-xsrf-token': xsrfToken
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`博客园 API 返回 HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json && json.id) {
      return this.createResult(true, {
        postId: String(json.id),
        postUrl: `https://i.cnblogs.com/articles/edit;postId=${json.id}`,
        draftOnly: true
      });
    }

    throw new Error('博客园草稿保存失败');
  }
}

// 5. Bilibili Adapter
class BilibiliAdapter extends CodeAdapter {
  constructor() {
    super('bilibili');
  }

  async publish(article) {
    const csrf = await this.getCookieValue('https://api.bilibili.com', 'bili_jct');
    if (!csrf) {
      throw new Error('未检测到 B站 Cookie bili_jct，请检查登录');
    }

    // Strip external links as requested by B站 flow rules
    const cleanHtml = article.html.replace(/href="([^"]+)"/gi, (match, url) => {
      if (url.includes('bilibili.com') || url.includes('hdslb.com')) return match;
      return 'href="javascript:void(0)"';
    });

    const params = new URLSearchParams();
    params.append('tid', '4');
    params.append('title', article.title);
    params.append('content', cleanHtml);
    params.append('csrf', csrf);
    params.append('save', '0');
    params.append('pgc_id', '0');

    const response = await this.fetch('https://api.bilibili.com/x/article/creative/draft/addupdate', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const json = await response.json();
    if (json.code === 0 && json.data && json.data.aid) {
      return this.createResult(true, {
        postId: String(json.data.aid),
        postUrl: `https://member.bilibili.com/platform/upload/text/edit?aid=${json.data.aid}`,
        draftOnly: true
      });
    }

    throw new Error(json.message || 'B站草稿创建 API 失败');
  }
}

// 6. Oschina Adapter
class OschinaAdapter extends CodeAdapter {
  constructor() {
    super('oschina');
  }

  async publish(article) {
    const detailsRes = await this.fetch('https://apiv1.oschina.net/oschinapi/user/myDetails');
    const details = await detailsRes.json();
    if (!details.success || !details.result || !details.result.userId) {
      throw new Error('开源中国未登录');
    }
    const userId = details.result.userId;

    const body = {
      title: article.title,
      user: userId,
      content: article.markdown,
      contentType: 1, // 1 for Markdown
      catalog: 0,
      originUrl: '',
      privacy: true,
      disableComment: false
    };

    const response = await this.fetch('https://apiv1.oschina.net/oschinapi/api/draft/save_draft', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    if (json.success === true && json.result && json.result.id) {
      return this.createResult(true, {
        postId: String(json.result.id),
        postUrl: `https://my.oschina.net/u/${userId}/blog/write/draft/${json.result.id}`,
        draftOnly: true
      });
    }

    throw new Error('开源中国草稿 API 保存失败');
  }
}

// 7. Yuque Adapter
class YuqueAdapter extends CodeAdapter {
  constructor() {
    super('yuque');
  }

  async publish(article) {
    const ctoken = await this.getCookieValue('https://www.yuque.com', 'yuque_ctoken');
    if (!ctoken) {
      throw new Error('语雀未登录');
    }

    // Step 1: Get mine books
    const mineRes = await this.fetch('https://www.yuque.com/api/mine/common_used', {
      headers: { 'x-csrf-token': ctoken }
    });
    const mineJson = await mineRes.json();
    if (!mineJson.data || !Array.isArray(mineJson.data.books) || mineJson.data.books.length === 0) {
      throw new Error('语雀知识库拉取失败');
    }
    const bookId = mineJson.data.books[0].target_id;

    // Step 2: Create blank doc
    const createRes = await this.fetch('https://www.yuque.com/api/docs', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': ctoken
      },
      body: JSON.stringify({
        title: article.title,
        type: 'Doc',
        format: 'lake',
        book_id: bookId,
        status: 0
      })
    });
    const createJson = await createRes.json();
    if (!createJson.data || !createJson.data.id) {
      throw new Error('语雀空草稿创建失败');
    }
    const postId = createJson.data.id;

    // Step 3: Convert markdown to lake
    const convertRes = await this.fetch('https://www.yuque.com/api/docs/convert', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': ctoken
      },
      body: JSON.stringify({
        from: 'markdown',
        to: 'lake',
        content: article.markdown
      })
    });
    const convertJson = await convertRes.json();
    if (!convertJson.data || !convertJson.data.content) {
      throw new Error('语雀 Markdown 内容转码失败');
    }
    const lakeContent = convertJson.data.content;

    // Step 4: Save content
    await this.fetch(`https://www.yuque.com/api/docs/${postId}/content`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': ctoken
      },
      body: JSON.stringify({
        format: 'lake',
        body_asl: lakeContent,
        body: `<div class='lake-content' typography='traditional'>${lakeContent}</div>`,
        body_html: `<div class='lake-content' typography='traditional'>${lakeContent}</div>`,
        draft_version: 0,
        sync_dynamic_data: false,
        save_type: 'auto',
        edit_type: 'Lake'
      })
    });

    return this.createResult(true, {
      postId: String(postId),
      postUrl: `https://www.yuque.com/go/doc/${postId}/edit`,
      draftOnly: true
    });
  }
}

// 8. Zip Download Adapter (Always triggers local download only)
class ZipDownloadAdapter extends CodeAdapter {
  constructor() {
    super('zip-download');
  }

  async publish(article) {
    return this.createResult(true, {
      localOnly: true
    });
  }
}

// Register all adapters
self.publishAdapters = {
  csdn: new CsdnAdapter(),
  juejin: new JuejinAdapter(),
  wechat: new WechatAdapter(),
  weixin: new WechatAdapter(), // alias
  cnblogs: new CnblogsAdapter(),
  bilibili: new BilibiliAdapter(),
  oschina: new OschinaAdapter(),
  yuque: new YuqueAdapter(),
  'zip-download': new ZipDownloadAdapter()
};
console.log('[NiceMD Adapters] Registry initialized.');
