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

// HMAC-SHA1 and SHA1 helpers for Tencent Cloud COS signature
async function hmacSha1(key, message) {
  const enc = new TextEncoder();
  const rawKey = typeof key === 'string' ? enc.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, typeof message === 'string' ? enc.encode(message) : message);
}

async function sha1Hex(message) {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-1', enc.encode(message));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
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

  // Helper to upload article cover image
  async uploadCover(coverUrl, uploadFn) {
    if (!coverUrl) return '';
    try {
      console.log(`[NiceMD ${this.platformId}] Uploading cover image:`, typeof coverUrl === 'string' ? coverUrl.slice(0, 80) : 'blob');
      const blob = await this.downloadImage(coverUrl);
      const res = await uploadFn(blob, coverUrl);
      const cdnUrl = res && res.url ? res.url : (typeof res === 'string' ? res : '');
      console.log(`[NiceMD ${this.platformId}] Cover uploaded successfully:`, cdnUrl);
      return cdnUrl;
    } catch (err) {
      console.warn(`[NiceMD ${this.platformId}] Cover upload failed (will continue without cover):`, err.message);
      return '';
    }
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
          uploadedUrl = (uploadRes && typeof uploadRes === 'object' && uploadRes.url) ? uploadRes.url : (typeof uploadRes === 'string' ? uploadRes : '');
          if (uploadedUrl) {
            uploadedMap.set(src, uploadedUrl);
          }
        }

        if (uploadedUrl && typeof uploadedUrl === 'string') {
          let replacement;
          if (item.type === 'html') {
            replacement = item.full.replace(src, uploadedUrl);
          } else {
            replacement = `![${item.alt || ''}](${uploadedUrl})`;
          }
          result = result.replace(item.full, replacement);
        }
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

    let csdnCoverUrl = '';
    if (article.cover) {
      csdnCoverUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
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
      cover_images: csdnCoverUrl ? [csdnCoverUrl] : (article.cover ? [article.cover] : []),
      cover_type: (csdnCoverUrl || article.cover) ? 1 : 0,
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

    let juejinCoverUrl = '';
    if (article.cover) {
      juejinCoverUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
    }

    const body = {
      brief_content: '',
      category_id: '0',
      cover_image: juejinCoverUrl || article.cover || '',
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

    let coverCdnUrl = '';
    if (article.cover) {
      coverCdnUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
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
    params.append('cdn_url0', coverCdnUrl || '');
    params.append('cdn_235_1_url0', coverCdnUrl || '');
    params.append('cdn_1_1_url0', coverCdnUrl || '');
    params.append('cdn_url_back0', coverCdnUrl || '');
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
    params.append('show_cover_pic0', coverCdnUrl ? '1' : '0');
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

    let cnblogsCoverUrl = '';
    if (article.cover) {
      cnblogsCoverUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
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
      featuredImage: cnblogsCoverUrl || null,
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

// Helper pure JS MD5 calculation
function computeMd5(input) {
  let bytes;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    bytes = new Uint8Array(input);
  }

  function toHex(array) {
    return Array.prototype.map.call(array, x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
  function add32(a, b) { return (a + b) & 0xFFFFFFFF; }

  const n = bytes.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) {
    let k = [];
    for (let j = 0; j < 16; j++) {
      k[j] = bytes[i - 64 + j * 4] | (bytes[i - 64 + j * 4 + 1] << 8) | (bytes[i - 64 + j * 4 + 2] << 16) | (bytes[i - 64 + j * 4 + 3] << 24);
    }
    md5cycle(state, k);
  }
  let tail = bytes.subarray(i - 64);
  let k = new Array(16).fill(0);
  for (let j = 0; j < tail.length; j++) {
    k[j >> 2] |= tail[j] << ((j % 4) << 3);
  }
  k[tail.length >> 2] |= 0x80 << ((tail.length % 4) << 3);
  if (tail.length > 55) {
    md5cycle(state, k);
    k.fill(0);
  }
  k[14] = (n * 8) & 0xFFFFFFFF;
  k[15] = Math.floor((n * 8) / 0x100000000);
  md5cycle(state, k);

  const res = new Uint8Array(16);
  for (let j = 0; j < 16; j++) {
    res[j] = (state[j >> 2] >> ((j % 4) << 3)) & 0xFF;
  }
  return toHex(res);
}

// 9. Zhihu Adapter
class ZhihuAdapter extends CodeAdapter {
  constructor() {
    super('zhihu');
  }

  async getXsrfToken() {
    const xsrf = await this.getCookieValue('https://www.zhihu.com', '_xsrf') ||
                 await this.getCookieValue('https://zhuanlan.zhihu.com', '_xsrf');
    return xsrf || '';
  }

  async hmacSha1Base64(key, message) {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
  }

  async uploadImage(blob, src) {
    const xsrf = await this.getXsrfToken();
    const buffer = await blob.arrayBuffer();
    const imageHash = computeMd5(buffer);

    console.log('[NiceMD Zhihu] Requesting image upload token for hash:', imageHash);
    const headers = {
      'content-type': 'application/json',
      'x-requested-with': 'fetch'
    };
    if (xsrf) {
      headers['x-xsrftoken'] = xsrf;
      headers['x-xsrf-token'] = xsrf;
    }

    try {
      // 1. Request image upload token from official gateway
      const tokenRes = await this.fetch('https://api.zhihu.com/images', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          image_hash: imageHash,
          source: 'article'
        })
      });

      const tokenData = await tokenRes.json();
      console.log('[NiceMD Zhihu] Upload token response:', tokenData);

      const uploadFile = tokenData.upload_file;
      if (uploadFile) {
        // If image already exists on Zhihu CDN
        if (uploadFile.state === 1) {
          let objectKey = uploadFile.object_key;
          if (!objectKey && uploadFile.image_id) {
            try {
              const detailRes = await this.fetch(`https://api.zhihu.com/images/${uploadFile.image_id}`, { headers });
              const detailData = await detailRes.json();
              objectKey = detailData.original_hash || detailData.object_key;
            } catch (e) {}
          }
          const finalUrl = `https://pic4.zhimg.com/${objectKey || imageHash}`;
          return { url: finalUrl };
        }

        // Upload to OSS if upload_token provided
        if (tokenData.upload_token) {
          const token = tokenData.upload_token;
          const objectKey = uploadFile.object_key;
          const contentType = blob.type || 'image/jpeg';
          const ossDate = new Date().toUTCString();
          const ossHeaders = {
            'x-oss-date': ossDate,
            'x-oss-security-token': token.access_token,
            'x-oss-user-agent': 'aliyun-sdk-js/6.8.0'
          };
          const canonicalizedOSSHeaders = Object.keys(ossHeaders)
            .sort()
            .map(k => `${k}:${ossHeaders[k]}`)
            .join('\n');
          const canonicalizedResource = `/zhihu-pics/${objectKey}`;
          const stringToSign = `PUT\n\n${contentType}\n${ossDate}\n${canonicalizedOSSHeaders}\n${canonicalizedResource}`;
          
          const sig = await this.hmacSha1Base64(token.access_key, stringToSign);
          const auth = `OSS ${token.access_id}:${sig}`;

          await this.fetch(`https://zhihu-pics-upload.zhimg.com/${objectKey}`, {
            method: 'PUT',
            headers: {
              'Content-Type': contentType,
              'Authorization': auth,
              'x-oss-date': ossDate,
              'x-oss-security-token': token.access_token,
              'x-oss-user-agent': 'aliyun-sdk-js/6.8.0'
            },
            body: blob
          });

          const finalUrl = `https://pic4.zhimg.com/${objectKey}`;
          console.log('[NiceMD Zhihu] Image uploaded to OSS successfully:', finalUrl);
          return { url: finalUrl };
        }
      }
    } catch (e) {
      console.warn('[NiceMD Zhihu] API image upload warning, falling back to uploaded_images:', e.message);
    }

    // Fallback: try uploaded_images
    const ext = (src && typeof src === 'string' && src.split('.').pop()?.toLowerCase()?.split('?')[0]) || 'jpg';
    const validExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    const formData = new FormData();
    formData.append('picture', blob, `image.${validExt}`);
    formData.append('source', 'article');

    const res = await this.fetch('https://zhuanlan.zhihu.com/api/uploaded_images', {
      method: 'POST',
      headers: headers,
      body: formData
    });
    const json = await res.json();
    if (json.src || json.url) {
      return { url: json.src || json.url };
    }
    throw new Error('知乎图片上传失败');
  }

  async publish(article) {
    const xsrf = await this.getXsrfToken();
    const headers = {
      'content-type': 'application/json',
      'x-requested-with': 'fetch'
    };
    if (xsrf) {
      headers['x-xsrftoken'] = xsrf;
      headers['x-xsrf-token'] = xsrf;
    }

    const createRes = await this.fetch('https://zhuanlan.zhihu.com/api/articles/drafts', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        title: article.title,
        content: '',
        delta_time: 0
      })
    });

    const createJson = await createRes.json();
    if (!createJson || !createJson.id) {
      throw new Error('知乎草稿创建失败，请确认是否已在浏览器中登录知乎');
    }
    const draftId = createJson.id;

    let content = article.html || '';
    try {
      content = await this.processImages(
        content,
        (blob, src) => this.uploadImage(blob, src),
        { skipPatterns: ['zhimg.com', 'zhihu.com'] }
      );
    } catch (e) {
      console.warn('[Zhihu Publish] Image processing failed:', e.message);
    }

    content = content.replace(/<section\b[^>]*>/gi, '<div>').replace(/<\/section>/gi, '</div>');

    let zhihuCoverUrl = '';
    if (article.cover) {
      zhihuCoverUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
    }

    if (zhihuCoverUrl) {
      const coverFigure = `<figure data-size="normal"><img src="${zhihuCoverUrl}" class="origin_image zh-lightbox-thumb" data-original="${zhihuCoverUrl}"/></figure>`;
      if (!content.includes(zhihuCoverUrl)) {
        content = coverFigure + content;
      }
    }

    const patchBody = {
      title: article.title,
      content: content
    };
    if (zhihuCoverUrl) {
      patchBody.titleImage = zhihuCoverUrl;
      patchBody.title_image = zhihuCoverUrl;
      patchBody.image_url = zhihuCoverUrl;
      patchBody.cover = zhihuCoverUrl;
      patchBody.title_image_url = zhihuCoverUrl;
    }

    const updateRes = await this.fetch(`https://zhuanlan.zhihu.com/api/articles/${draftId}/draft`, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(patchBody)
    });

    const updateJson = await updateRes.json();
    if (updateJson && (updateJson.id || updateJson.title)) {
      return this.createResult(true, {
        postId: String(draftId),
        postUrl: `https://zhuanlan.zhihu.com/p/${draftId}/edit`,
        draftOnly: true
      });
    }

    throw new Error('知乎保存草稿内容失败');
  }
}

// 10. Weibo Adapter
class WeiboAdapter extends CodeAdapter {
  constructor() {
    super('weibo');
  }

  async getUserConfig() {
    const res = await this.fetch('https://card.weibo.com/article/v5/editor');
    const html = await res.text();
    const configMatch = html.match(/config:\s*JSON\.parse\('(.+?)'\)/);
    if (!configMatch) return null;
    try {
      const configJson = configMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
      const config = JSON.parse(configJson);
      return config.uid ? { uid: String(config.uid), nick: config.nick || '' } : null;
    } catch (e) {
      return null;
    }
  }

  async uploadImage(blob, src) {
    const formData = new FormData();
    formData.append('pic', blob, 'image.jpg');
    const res = await this.fetch('https://card.weibo.com/article/v5/aj/editor/draft/uploadimage', {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (json.code === '100000' && json.data && (json.data.url || json.data.pic)) {
      return { url: json.data.url || json.data.pic };
    }
    return { url: '' };
  }

  async publish(article) {
    const config = await this.getUserConfig();
    if (!config || !config.uid) {
      throw new Error('请先在浏览器中登录微博');
    }

    let weiboCoverUrl = '';
    if (article.cover) {
      weiboCoverUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
    }

    const reqId = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const createRes = await this.fetch(`https://card.weibo.com/article/v5/aj/editor/draft/create?uid=${config.uid}&_rid=${reqId}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json, text/plain, */*',
        'SN-REQID': reqId
      },
      body: new URLSearchParams({
        title: article.title,
        content: article.html || article.markdown || '',
        cover: weiboCoverUrl || article.cover || '',
        summary: ''
      }).toString()
    });

    const createJson = await createRes.json();
    if (createJson.code === '100000' && createJson.data && createJson.data.id) {
      const draftId = createJson.data.id;
      return this.createResult(true, {
        postId: String(draftId),
        postUrl: `https://card.weibo.com/article/v5/editor?id=${draftId}`,
        draftOnly: true
      });
    }

    throw new Error(createJson.msg || '微博头条草稿创建失败');
  }
}

// 11. Baijiahao Adapter
class BaijiahaoAdapter extends CodeAdapter {
  constructor() {
    super('baijiahao');
  }

  async fetchAuthToken() {
    const res = await this.fetch('https://baijiahao.baidu.com/builder/rc/edit');
    const html = await res.text();
    const match = html.match(/window\.__BJH__INIT__AUTH__\s*=\s*['"]([^'"]+)['"]/);
    if (!match) throw new Error('登录失效，请重新登录百家号');
    return match[1];
  }

  async publish(article) {
    const token = await this.fetchAuthToken();
    const content = article.html || '';

    const res = await this.fetch('https://baijiahao.baidu.com/pcui/article/save?callback=bjhdraft', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      body: new URLSearchParams({
        title: article.title,
        content: content,
        feed_cat: '1',
        len: String(content.length),
        activity_list: JSON.stringify([{ id: 408, is_checked: 0 }]),
        source_reprinted_allow: '0',
        original_status: '0',
        original_handler_status: '1',
        isBeautify: 'false',
        subtitle: '',
        bjhtopic_id: '',
        bjhtopic_info: '',
        type: 'news'
      }).toString()
    });

    const text = await res.text();
    const jsonMatch = text.match(/bjhdraft\((.*)\)/);
    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[1]);
        if (json.errno === 0 && json.data && json.data.article_id) {
          return this.createResult(true, {
            postId: String(json.data.article_id),
            postUrl: `https://baijiahao.baidu.com/builder/rc/edit?type=news&article_id=${json.data.article_id}`,
            draftOnly: true
          });
        }
      } catch (e) {}
    }

    return this.createResult(true, {
      postUrl: 'https://baijiahao.baidu.com/builder/rc/write/article',
      draftOnly: true
    });
  }
}

// 12. Segmentfault Adapter
class SegmentfaultAdapter extends CodeAdapter {
  constructor() {
    super('segmentfault');
  }

  async getSessionToken() {
    try {
      // 1. Check direct cookies (PHPSESSID, SHARESESSID, token)
      const phpsessid = await this.getCookieValue('https://segmentfault.com', 'PHPSESSID');
      const sharesessid = await this.getCookieValue('https://segmentfault.com', 'SHARESESSID');
      const tokenCookie = await this.getCookieValue('https://segmentfault.com', 'token');
      const cookieToken = tokenCookie || phpsessid || sharesessid;

      // 2. Fetch /write page to inspect inline Token
      const res = await this.fetch('https://segmentfault.com/write');
      const html = await res.text();
      
      const tokenMatch = html.match(/serverData":\s*\{\s*"Token"\s*:\s*"([^"]+)"/) ||
                         html.match(/"Token"\s*:\s*"([^"]+)"/) ||
                         html.match(/"token"\s*:\s*"([^"]+)"/);
      if (tokenMatch) return tokenMatch[1];

      // 3. Match window.g_initialProps
      const markStr = 'window.g_initialProps = ';
      const authIndex = html.indexOf(markStr);
      if (authIndex !== -1) {
        const scriptEndIndex = html.indexOf('</script>', authIndex);
        if (scriptEndIndex !== -1) {
          let jsonStr = html.substring(authIndex + markStr.length, scriptEndIndex).trim();
          if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1).trim();
          try {
            const config = JSON.parse(jsonStr);
            const token = config?.global?.sessionInfo?.key || config?.Token || config?.token;
            if (token) return token;
          } catch (e) {}
        }
      }

      if (cookieToken) return cookieToken;

      // 4. Fallback: check user settings page
      const settingsRes = await this.fetch('https://segmentfault.com/user/settings');
      const settingsHtml = await settingsRes.text();
      const settingsTokenMatch = settingsHtml.match(/"Token"\s*:\s*"([^"]+)"/) || 
                                 settingsHtml.match(/"token"\s*:\s*"([^"]+)"/);
      if (settingsTokenMatch) return settingsTokenMatch[1];
    } catch (err) {
      console.warn('[NiceMD Segmentfault] Failed to fetch session token:', err.message);
    }
    return '';
  }

  async uploadImage(blob, src) {
    const token = await this.getSessionToken();
    const formData = new FormData();
    const ext = (src && typeof src === 'string' && src.split('.').pop()?.toLowerCase()?.split('?')[0]) || 'png';
    const validExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'png';
    formData.append('image', blob, `cover_${Date.now()}.${validExt}`);

    const headers = {
      'accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['token'] = token;
      headers['authorization'] = `Bearer ${token}`;
    }

    const response = await this.fetch('https://segmentfault.com/gateway/image', {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const res = await response.json();
    console.log('[NiceMD Segmentfault] Image upload response:', res);

    let imageKey = null;
    if (Array.isArray(res)) {
      if (res[0] === 1) throw new Error(res[1] || '思否图片上传失败');
      
      // 思否返回格式为 [0, 附件ID(如388), 图片短标识(如"bVdqh07")]
      // 必须优先提取有效字符串短码 res[2]，而非数字 ID res[1]
      if (res[2] && typeof res[2] === 'string' && res[2].trim()) {
        imageKey = res[2].trim();
      } else if (res[1] && typeof res[1] === 'string' && (res[1].startsWith('/img') || res[1].startsWith('bV') || res[1].startsWith('http') || isNaN(Number(res[1])))) {
        imageKey = res[1].trim();
      } else if (res[2]) {
        imageKey = String(res[2]).trim();
      } else if (res[1]) {
        imageKey = String(res[1]).trim();
      }
    } else if (res && typeof res === 'object') {
      // 必须优先使用 res.url ("/img/bVdqh07")，而非包含分片数字子目录的 res.result full cdn 链接
      imageKey = res.url || res.path || res.result || res.data || res.src;
    }
    
    if (!imageKey) {
      throw new Error('思否图片上传失败: ' + JSON.stringify(res));
    }

    let imageUrl = imageKey;
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = `/img/${imageUrl}`;
    }
    return { url: imageUrl, key: imageKey };
  }

  async publish(article) {
    const token = await this.getSessionToken();

    let content = article.markdown || article.html || '';
    try {
      content = await this.processImages(content, (blob, src) => this.uploadImage(blob, src));
    } catch (err) {
      console.warn('[NiceMD Segmentfault] Image process warning:', err.message);
    }

    let sfCoverUrl = '';
    if (article.cover) {
      sfCoverUrl = await this.uploadCover(article.cover, (blob, src) => this.uploadImage(blob, src));
    }

    let cleanCover = sfCoverUrl || '';
    if (cleanCover) {
      // 优先精准提取 bV 标识
      const bVMatch = cleanCover.match(/\/(?:img\/)?(bV[a-zA-Z0-9_-]+)/);
      if (bVMatch) {
        cleanCover = `/img/${bVMatch[1]}`;
      } else if (cleanCover.startsWith('/img/')) {
        cleanCover = cleanCover;
      } else if (!cleanCover.startsWith('http') && !cleanCover.startsWith('/')) {
        cleanCover = `/img/${cleanCover}`;
      }
    }

    const postData = {
      title: article.title,
      tags: [],
      text: content,
      object_id: '',
      type: 'article',
      cover: cleanCover || sfCoverUrl || '',
      cover_url: cleanCover || sfCoverUrl || '',
      cover_img: cleanCover || sfCoverUrl || '',
      cover_image: cleanCover || sfCoverUrl || '',
      bg_img: cleanCover || sfCoverUrl || '',
      background: cleanCover || sfCoverUrl || '',
      image: cleanCover || sfCoverUrl || '',
      banner: cleanCover || sfCoverUrl || ''
    };

    const headers = {
      'content-type': 'application/json',
      'accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['token'] = token;
      headers['authorization'] = `Bearer ${token}`;
    }

    const res = await this.fetch('https://segmentfault.com/gateway/draft', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postData)
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('思否草稿保存接口异常: ' + text);
    }

    // Handle array response: [0, { id: "123" }] or [0, "123"] or [1, "error"]
    let draftId = null;
    if (Array.isArray(json)) {
      if (json[0] === 1) throw new Error(json[1] || '思否草稿保存失败');
      const data = json[1];
      draftId = data?.id || (typeof data === 'string' || typeof data === 'number' ? data : null);
    } else if (json && (json.id || json.data?.id)) {
      draftId = json.id || json.data?.id || (typeof json.data === 'string' ? json.data : null);
    }

    if (draftId) {
      if (cleanCover) {
        try {
          await this.fetch(`https://segmentfault.com/gateway/draft/${draftId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
              id: draftId,
              title: article.title,
              tags: [],
              text: content,
              type: 'article',
              cover: cleanCover,
              cover_url: cleanCover,
              cover_img: cleanCover,
              cover_image: cleanCover,
              image: cleanCover,
              bg_img: cleanCover,
              background: cleanCover,
              banner: cleanCover
            })
          });
          console.log('[NiceMD Segmentfault] Draft PUT with cover successful:', cleanCover);
        } catch (e) {
          console.warn('[NiceMD Segmentfault] Draft PUT update warning:', e.message);
        }
      }
      return this.createResult(true, {
        postId: String(draftId),
        postUrl: `https://segmentfault.com/write?draftId=${draftId}`,
        draftOnly: true
      });
    }

    throw new Error(json.message || json.msg || '思否草稿保存失败');
  }
}

// 13. 51CTO Adapter
class Cto51Adapter extends CodeAdapter {
  constructor() {
    super('51cto');
  }

  async publish(article) {
    const pageRes = await this.fetch('https://blog.51cto.com/blogger/publish');
    const html = await pageRes.text();
    const csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
    const csrf = csrfMatch ? csrfMatch[1] : '';

    const res = await this.fetch('https://blog.51cto.com/save/draft', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-csrf-token': csrf,
        'x-requested-with': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        title: article.title,
        content: article.markdown,
        is_original: '1',
        pid: ''
      }).toString()
    });

    const json = await res.json();
    if (json.code === 0 && json.data && json.data.blog_id) {
      return this.createResult(true, {
        postId: String(json.data.blog_id),
        postUrl: `https://blog.51cto.com/blogger/publish?blog_id=${json.data.blog_id}`,
        draftOnly: true
      });
    }

    throw new Error(json.msg || '51CTO 草稿保存失败');
  }
}

class ImoocAdapter extends CodeAdapter {
  constructor() {
    super('imooc');
  }

  async uploadImage(blob, src) {
    const filename = `${Date.now()}.jpg`;
    const formData = new FormData();
    formData.append('photo', blob, filename);
    formData.append('type', blob.type || 'image/jpeg');
    formData.append('id', 'WU_FILE_0');
    formData.append('name', filename);
    formData.append('lastModifiedDate', new Date().toString());
    formData.append('size', String(blob.size));

    const response = await this.fetch('https://www.imooc.com/article/ajaxuploadimg', {
      method: 'POST',
      body: formData
    });

    const res = await response.json();
    if (res.result !== 0) {
      throw new Error(res.msg || '慕课网图片上传失败');
    }

    let imgUrl = res.data.imgpath;
    if (imgUrl && imgUrl.startsWith('//')) {
      imgUrl = 'https:' + imgUrl;
    }
    return { url: imgUrl };
  }

  async publish(article) {
    let content = article.markdown || article.html || '';
    try {
      content = await this.processImages(content, (blob, src) => this.uploadImage(blob, src));
    } catch (err) {
      console.warn('[NiceMD Imooc] Image process warning:', err.message);
    }

    const res = await this.fetch('https://www.imooc.com/article/savedraft', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        editor: '0',       // 0: 强制指定 Markdown 模式，标题与正文完全统一在 Markdown 编辑器中
        draft_id: '0',
        title: article.title,
        content: content
      }).toString()
    });

    const json = await res.json();
    const draftId = json.data && (typeof json.data === 'object' ? json.data.id : json.data);
    if (draftId) {
      return this.createResult(true, {
        postId: String(draftId),
        postUrl: `https://www.imooc.com/article/publish?id=${draftId}`,
        draftOnly: true
      });
    }

    throw new Error(json.msg || '慕课网草稿保存失败');
  }
}

// 15. Douban Adapter
class DoubanAdapter extends CodeAdapter {
  constructor() {
    super('douban');
  }

  async publish(article) {
    const pageRes = await this.fetch('https://www.douban.com/note/create');
    const html = await pageRes.text();
    const noteIdMatch = html.match(/name="note_id"\s+value="(\d+)"/);
    const ckMatch = html.match(/name="ck"\s+value="([^"]+)"/);
    if (!noteIdMatch || !ckMatch) {
      throw new Error('未登录豆瓣账号');
    }

    const noteId = noteIdMatch[1];
    const ck = ckMatch[1];

    await this.fetch('https://www.douban.com/j/note/create', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        note_id: noteId,
        ck: ck,
        note_title: article.title,
        note_text: article.html || article.markdown,
        is_preview: '0'
      }).toString()
    });

    return this.createResult(true, {
      postId: String(noteId),
      postUrl: `https://www.douban.com/note/${noteId}/create`,
      draftOnly: true
    });
  }
}

// 16. Sohu Adapter
class SohuAdapter extends CodeAdapter {
  constructor() {
    super('sohu');
  }

  async publish(article) {
    const listRes = await this.fetch(`https://mp.sohu.com/mpbp/bp/account/list?_=${Date.now()}`);
    const listJson = await listRes.json();
    const account = listJson?.data?.data?.[0]?.accounts?.[0];
    if (!account || !account.id) {
      throw new Error('未检测到搜狐号登录账号');
    }

    const res = await this.fetch('https://mp.sohu.com/mpbp/bp/article/save', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        accountId: account.id,
        title: article.title,
        content: article.html || article.markdown,
        originFlag: 0
      })
    });

    const json = await res.json();
    if (json.code === 2000000 && json.data && json.data.id) {
      return this.createResult(true, {
        postId: String(json.data.id),
        postUrl: `https://mp.sohu.com/mpfe/v3/main/news/edit/${json.data.id}`,
        draftOnly: true
      });
    }

    throw new Error(json.msg || '搜狐号草稿保存失败');
  }
}

// 17. Xueqiu Adapter
class XueqiuAdapter extends CodeAdapter {
  constructor() {
    super('xueqiu');
  }

  async publish(article) {
    const res = await this.fetch('https://mp.xueqiu.com/v2/articles/draft', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        title: article.title,
        text: article.markdown,
        anonymous: 0
      })
    });

    const json = await res.json();
    if (json && (json.id || json.draft_id)) {
      const draftId = json.draft_id || json.id;
      return this.createResult(true, {
        postId: String(draftId),
        postUrl: `https://mp.xueqiu.com/writeV2?draft_id=${draftId}`,
        draftOnly: true
      });
    }

    throw new Error(json.error_description || '雪球草稿创建失败');
  }
}

// 18. Woshipm Adapter
class WoshipmAdapter extends CodeAdapter {
  constructor() {
    super('woshipm');
  }

  async publish(article) {
    const res = await this.fetch('https://www.woshipm.com/api/content/article/draft', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        title: article.title,
        content: article.html || article.markdown,
        type: 'article'
      })
    });

    const json = await res.json();
    if (json.code === 200 && json.data && json.data.id) {
      return this.createResult(true, {
        postId: String(json.data.id),
        postUrl: `https://www.woshipm.com/writing?id=${json.data.id}`,
        draftOnly: true
      });
    }

    throw new Error(json.message || '人人都是产品经理草稿保存失败');
  }
}

// 19. Eastmoney Adapter
class EastmoneyAdapter extends CodeAdapter {
  constructor() {
    super('eastmoney');
  }

  async publish(article) {
    const res = await this.fetch('https://mp.eastmoney.com/NewWrite/Article/Save', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        Title: article.title,
        Content: article.html || article.markdown,
        IsDraft: true
      })
    });

    const json = await res.json();
    if (json.Result === 0 || (json.Data && json.Data.ArticleId)) {
      const artId = json.Data?.ArticleId || '';
      return this.createResult(true, {
        postId: String(artId),
        postUrl: `https://mp.eastmoney.com/NewWrite/Article?id=${artId}`,
        draftOnly: true
      });
    }

    throw new Error(json.Message || '东方财富草稿保存失败');
  }
}

// 20. Jianshu Adapter
class JianshuAdapter extends CodeAdapter {
  constructor() {
    super('jianshu');
  }

  async publish(article) {
    const nbRes = await this.fetch('https://www.jianshu.com/author/notebooks');
    const notebooks = await nbRes.json();
    if (!Array.isArray(notebooks) || notebooks.length === 0) {
      throw new Error('未检测到简书文集，请确认登录');
    }
    const notebookId = notebooks[0].id;

    const createRes = await this.fetch('https://www.jianshu.com/author/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        notebook_id: String(notebookId),
        title: article.title,
        at_bottom: false
      })
    });
    const note = await createRes.json();
    if (!note.id) throw new Error('简书创建文章失败');

    await this.fetch(`https://www.jianshu.com/author/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: note.id,
        title: article.title,
        content: article.markdown,
        autosave_control: 1
      })
    });

    return this.createResult(true, {
      postId: String(note.id),
      postUrl: `https://www.jianshu.com/writer#/notebooks/${notebookId}/notes/${note.id}`,
      draftOnly: true
    });
  }
}

// 21. Toutiao Adapter
class ToutiaoAdapter extends CodeAdapter {
  constructor() {
    super('toutiao');
  }

  async publish(article) {
    return this.createResult(true, {
      postUrl: 'https://mp.toutiao.com/profile_v4/graphic/publish',
      draftOnly: true
    });
  }
}

// 22. Zip Download Adapter (Always triggers local download only)
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

// 23. InfoQ Adapter
class InfoqAdapter extends CodeAdapter {
  constructor() {
    super('infoq');
  }

  async publish(article) {
    return this.createResult(true, {
      postUrl: 'https://xie.infoq.cn/article/draft/new',
      draftOnly: true
    });
  }
}

// 24. LearnKu Adapter
class LearnkuAdapter extends CodeAdapter {
  constructor() {
    super('learnku');
  }

  async getPageFormData() {
    const res = await this.fetch('https://learnku.com/articles/create', {
      method: 'GET'
    });
    if (!res.ok) {
      throw new Error(`无法访问 LearnKu 发布页面: ${res.status}`);
    }
    const html = await res.text();
    
    // Extract CSRF _token
    let token = '';
    const tokenMatch = html.match(/name="_token"\s+value="([^"]+)"/i) || 
                       html.match(/name="csrf-token"\s+content="([^"]+)"/i) ||
                       html.match(/'csrfToken':\s*'([^']+)'/i);
    if (tokenMatch) {
      token = tokenMatch[1];
    }

    // Extract editor_unique_id
    let editorUniqueId = 'articles-create_article_content_';
    const editorIdMatch = html.match(/name="editor_unique_id"\s+value="([^"]+)"/i);
    if (editorIdMatch) {
      editorUniqueId = editorIdMatch[1];
    }

    // Extract default category_id
    let categoryId = '8';
    const catMatch = html.match(/<select[^>]*name="category_id"[^>]*>[\s\S]*?<option[^>]*value="(\d+)"[^>]*selected/i) ||
                     html.match(/<select[^>]*name="category_id"[^>]*>[\s\S]*?<option[^>]*value="(\d+)"/i);
    if (catMatch) {
      categoryId = catMatch[1];
    }

    // Extract default community_id
    let communityId = '19';
    const commMatch = html.match(/name="community_id"\s+value="(\d+)"/i) ||
                      html.match(/<select[^>]*name="community_id"[^>]*>[\s\S]*?<option[^>]*value="(\d+)"/i);
    if (commMatch) {
      communityId = commMatch[1];
    }

    if (!token) {
      throw new Error('未获取到 LearnKu CSRF Token，请确认是否已在浏览器中登录 LearnKu');
    }

    return { token, editorUniqueId, categoryId, communityId };
  }

  async uploadImage(blob, src) {
    const formData = new FormData();
    const filename = (src && src.split('/').pop().split('?')[0]) || 'image.png';
    const finalFilename = filename.match(/\.(png|jpe?g|gif|webp|bmp|svg)$/i) ? filename : `${filename}.png`;
    formData.append('file', blob, finalFilename);

    const guid = Date.now();
    const response = await this.fetch(`https://learnku.com/courses/upload_image?guid=${guid}`, {
      method: 'POST',
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`LearnKu 图片上传失败: ${response.status}`);
    }

    const resJson = await response.json();
    const uploadedUrl = resJson.file_path || resJson.url || resJson.link || resJson.data?.url || resJson.data?.file_path || resJson.image_url;
    if (!uploadedUrl) {
      throw new Error('LearnKu 图片上传未返回有效图片地址');
    }
    return uploadedUrl;
  }

  async publish(article) {
    // 1. 获取创建文章页面的 CSRF Token 和默认表单参数
    const formData = await this.getPageFormData();

    // 2. 图片转存
    let markdown = article.markdown || '';
    if (markdown) {
      try {
        markdown = await this.processImages(
          markdown,
          (blob, src) => this.uploadImage(blob, src),
          { skipPatterns: ['learnku.com', 'cdn.learnku.com', 'iocaff.com'] }
        );
      } catch (e) {
        console.warn('[LearnKu Publish] Image conversion warning:', e.message);
      }
    }

    return this.createResult(true, {
      postUrl: 'https://learnku.com/articles/create',
      draftOnly: true,
      markdown: markdown
    });
  }
}

// 25. Tencent Cloud Adapter
class TencentCloudAdapter extends CodeAdapter {
  constructor() {
    super('tencentcloud');
  }

  getCsrfCode(skey) {
    if (!skey) return '';
    let hash = 5381;
    for (let i = 0; i < skey.length; ++i) {
      hash += (hash << 5) + skey.charCodeAt(i);
    }
    return String(hash & 0x7fffffff);
  }

  async getAuthInfo() {
    try {
      let skey = await this.getCookieValue('https://cloud.tencent.com', 'skey');
      let uinCookie = await this.getCookieValue('https://cloud.tencent.com', 'uin') || '';
      if (!skey || !uinCookie) {
        if (typeof chrome !== 'undefined' && chrome.cookies) {
          const cookies = await chrome.cookies.getAll({ domain: 'tencent.com' });
          const skeyObj = cookies.find(c => c.name === 'skey');
          const uinObj = cookies.find(c => c.name === 'uin' || c.name === 'qcstats_ouin-515361725');
          if (skeyObj) skey = skeyObj.value;
          if (uinObj) uinCookie = uinObj.value;
        }
      }
      const uin = (uinCookie || '').replace(/^o0*/, '');
      const csrfCode = this.getCsrfCode(skey);
      return { uin, csrfCode };
    } catch (e) {
      return { uin: '', csrfCode: '' };
    }
  }

  async signCos({ method, pathname, tmpSecretId, tmpSecretKey, keyTime, host }) {
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const formatString = [
      method.toLowerCase(),
      cleanPath,
      '', // query string params
      `host=${host}`,
      ''
    ].join('\n');
    const formatStringHash = await sha1Hex(formatString);
    const stringToSign = ['sha1', keyTime, formatStringHash, ''].join('\n');
    const signKeyBuffer = await hmacSha1(tmpSecretKey, keyTime);
    const signKeyHex = bufferToHex(signKeyBuffer);
    const signatureBuffer = await hmacSha1(signKeyHex, stringToSign);
    const signature = bufferToHex(signatureBuffer);
    return `q-sign-algorithm=sha1&q-ak=${tmpSecretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=host&q-url-param-list=&q-signature=${signature}`;
  }

  async getCosSignature({ method, pathname, tmpSecretKey, keyTime, host }) {
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const formatString = [
      method.toLowerCase(),
      cleanPath,
      '',
      `host=${host}`,
      ''
    ].join('\n');
    const formatStringHash = await sha1Hex(formatString);
    const stringToSign = ['sha1', keyTime, formatStringHash, ''].join('\n');
    const signKeyBuffer = await hmacSha1(tmpSecretKey, keyTime);
    const signKeyHex = bufferToHex(signKeyBuffer);
    const signatureBuffer = await hmacSha1(signKeyHex, stringToSign);
    return bufferToHex(signatureBuffer);
  }

  async uploadImage(blob, src = 'image.png') {
    const { uin, csrfCode } = await this.getAuthInfo();
    if (!csrfCode) {
      throw new Error('未获取到腾讯云登录凭证 (skey/csrfCode)');
    }

    // 1. 获取图片后缀
    let ext = 'png';
    if (typeof src === 'string') {
      const matchExt = src.split('.').pop()?.toLowerCase()?.split('?')[0];
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(matchExt)) {
        ext = matchExt === 'jpeg' ? 'jpg' : matchExt;
      }
    }
    if (blob.type) {
      const mimeExt = blob.type.split('/')[1]?.toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(mimeExt)) {
        ext = mimeExt === 'jpeg' ? 'jpg' : mimeExt;
      }
    }

    // 2. Step 1: GenObjectKey
    const genKeyUrl = `https://cloud.tencent.com/developer/services/ajax/discovery?action=GenObjectKey${uin ? `&uin=${uin}` : ''}&csrfCode=${csrfCode}`;
    const genKeyRes = await this.fetch(genKeyUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': '*/*',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://cloud.tencent.com',
        'referer': 'https://cloud.tencent.com/developer/article/write'
      },
      body: JSON.stringify({
        action: 'GenObjectKey',
        payload: {
          extension: ext,
          scene: 'column.article'
        }
      })
    });

    if (!genKeyRes.ok) {
      throw new Error(`GenObjectKey failed: HTTP ${genKeyRes.status}`);
    }

    const genKeyData = await genKeyRes.json();
    const objectKey = genKeyData?.data?.objectKey || genKeyData?.data?.key;
    if (!objectKey) {
      throw new Error(genKeyData?.msg || '未能生成腾讯云 ObjectKey');
    }

    // 3. Step 2: GetTmpSecret
    const secretUrl = `https://cloud.tencent.com/developer/services/ajax/discovery?action=GetTmpSecret${uin ? `&uin=${uin}` : ''}&csrfCode=${csrfCode}`;
    const secretRes = await this.fetch(secretUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': '*/*',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://cloud.tencent.com',
        'referer': 'https://cloud.tencent.com/developer/article/write'
      },
      body: JSON.stringify({
        action: 'GetTmpSecret',
        payload: {
          objectKey: objectKey
        }
      })
    });

    if (!secretRes.ok) {
      throw new Error(`GetTmpSecret failed: HTTP ${secretRes.status}`);
    }

    const secretData = await secretRes.json();
    const creds = secretData?.data?.credentials;
    const tmpSecretId = creds?.TmpSecretId || creds?.tmpSecretId;
    const tmpSecretKey = creds?.TmpSecretKey || creds?.tmpSecretKey;
    const token = creds?.Token || creds?.token || creds?.sessionToken;
    const bucket = genKeyData?.data?.bucket || secretData?.data?.bucket || 'developer-private-1258344699';
    const region = genKeyData?.data?.region || secretData?.data?.region || 'ap-guangzhou';
    const startTime = secretData?.data?.startTime || Math.floor(Date.now() / 1000);
    const expiredTime = secretData?.data?.expiredTime || (startTime + 3600);
    const keyTime = `${startTime};${expiredTime}`;

    if (!tmpSecretId || !tmpSecretKey) {
      throw new Error('未能获取到腾讯云 COS 临时密钥 (TmpSecretId/TmpSecretKey)');
    }

    // 4. Step 3: PUT Object to Tencent Cloud COS
    const cleanObjectKey = objectKey.startsWith('/') ? objectKey : `/${objectKey}`;
    const host = `${bucket}.cos.${region}.myqcloud.com`;
    const cosPutUrl = `https://${host}${cleanObjectKey}`;

    const authorization = await this.signCos({
      method: 'PUT',
      pathname: cleanObjectKey,
      tmpSecretId: tmpSecretId,
      tmpSecretKey: tmpSecretKey,
      keyTime: keyTime,
      host: host
    });

    const mimeType = ext === 'png' ? 'image/png' : (ext === 'gif' ? 'image/gif' : (ext === 'webp' ? 'image/webp' : 'image/jpeg'));
    const putRes = await this.fetch(cosPutUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authorization,
        'x-cos-security-token': token,
        'Content-Type': mimeType,
        'Origin': 'https://cloud.tencent.com',
        'Referer': 'https://cloud.tencent.com/'
      },
      body: blob
    });

    if (!putRes.ok) {
      throw new Error(`COS PUT upload failed: HTTP ${putRes.status}`);
    }

    // 5. Build final Pre-signed COS URL (with GET authorization)
    const getSignature = await this.getCosSignature({
      method: 'GET',
      pathname: cleanObjectKey,
      tmpSecretKey: tmpSecretKey,
      keyTime: keyTime,
      host: host
    });

    const finalCosUrl = `https://${host}${cleanObjectKey}?q-sign-algorithm=sha1&q-ak=${tmpSecretId}&q-sign-time=${keyTime}&q-key-time=${keyTime}&q-header-list=host&q-url-param-list=&q-signature=${getSignature}&x-cos-security-token=${token}`;

    console.log('[Tencent Cloud Publish] Image uploaded to COS successfully:', finalCosUrl);
    return {
      url: finalCosUrl,
      imageUrl: finalCosUrl
    };
  }

  async publish(article) {
    let markdown = article.markdown || '';
    let coverUrl = article.cover || '';
    const title = article.title || '未命名文档';

    // 1. 转存 Markdown 中的所有外部图片至腾讯云官方 COS / CDN
    if (markdown) {
      try {
        markdown = await this.processImages(
          markdown,
          (blob, src) => this.uploadImage(blob, src),
          { skipPatterns: ['developer.qcloudimg.com', 'qcloudimg.com', 'myqcloud.com'] }
        );
      } catch (e) {
        console.warn('[Tencent Cloud Publish] Image conversion warning:', e.message);
      }
    }

    // 2. 转存并设置封面图（若未指定则自动从 Markdown 第一张图片提取）
    if (!coverUrl && markdown) {
      const mdMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
      if (mdMatch) {
        coverUrl = mdMatch[1];
      }
    }

    if (coverUrl && !coverUrl.includes('developer.qcloudimg.com') && !coverUrl.includes('qcloudimg.com')) {
      try {
        const res = await this.uploadCover(coverUrl, (blob, src) => this.uploadImage(blob, 'article-cover.png'));
        coverUrl = (res && res.url) ? res.url : (typeof res === 'string' ? res : coverUrl);
      } catch (e) {
        console.warn('[Tencent Cloud Publish] Cover upload warning:', e.message);
      }
    }

    let targetUrl = 'https://cloud.tencent.com/developer/article/write';

    // 3. 调用腾讯云官方草稿保存接口
    try {
      const { uin, csrfCode } = await this.getAuthInfo();
      if (csrfCode) {
        const draftApiUrl = `https://cloud.tencent.com/developer/services/ajax/column/article?action=CreateArticleDraft${uin ? `&uin=${uin}` : ''}&csrfCode=${csrfCode}`;
        const encodedContent = btoa(encodeURIComponent(JSON.stringify(markdown)));
        const encodedPlain = btoa(encodeURIComponent(JSON.stringify(markdown)));

        const draftPayload = {
          action: 'CreateArticleDraft',
          payload: {
            articleId: 0,
            title: title,
            content: encodedContent,
            plain: encodedPlain,
            columnIds: [],
            tagIds: [],
            keywords: [],
            sourceType: 0,
            openComment: 1,
            focusReadTotalAfterFollowAuthor: 0,
            closeTextLink: 0,
            classifyIds: []
          }
        };

        if (coverUrl) {
          draftPayload.payload.coverUrl = coverUrl;
          draftPayload.payload.cover = coverUrl;
        }

        const draftRes = await this.fetch(draftApiUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'accept': '*/*',
            'x-requested-with': 'XMLHttpRequest',
            'origin': 'https://cloud.tencent.com',
            'referer': 'https://cloud.tencent.com/developer/article/write'
          },
          body: JSON.stringify(draftPayload)
        });

        if (draftRes.ok) {
          const draftData = await draftRes.json();
          console.log('[Tencent Cloud Publish] Draft created result:', draftData);
          const articleId = draftData?.data?.articleId || draftData?.data?.id || draftData?.articleId;
          if (articleId) {
            targetUrl = `https://cloud.tencent.com/developer/article/write?articleId=${articleId}`;
          }
        }
      }
    } catch (err) {
      console.warn('[Tencent Cloud Publish] Draft API warning, falling back to frontend automation:', err.message);
    }

    return this.createResult(true, {
      postUrl: targetUrl,
      draftOnly: true,
      markdown: markdown,
      title: title,
      cover: coverUrl
    });
  }
}

// 26. Nowcoder Adapter
class NowcoderAdapter extends CodeAdapter {
  constructor() {
    super('nowcoder');
  }

  async publish(article) {
    return this.createResult(true, {
      postUrl: 'https://www.nowcoder.com/discuss/post/write',
      draftOnly: true
    });
  }
}

// 27. Aliyun Developer Adapter
class AliyunAdapter extends CodeAdapter {
  constructor() {
    super('aliyun');
  }

  async getCsrfToken() {
    try {
      const c1 = await this.getCookieValue('https://developer.aliyun.com/article/new', 'c_csrf');
      if (c1) return c1;
      const c2 = await this.getCookieValue('https://developer.aliyun.com/', 'c_csrf');
      if (c2) return c2;
      const c3 = await this.getCookieValue('https://aliyun.com/', 'c_csrf');
      if (c3) return c3;
      const cookies = await chrome.cookies.getAll({ domain: 'aliyun.com' });
      const cCsrf = cookies.find(c => c.name === 'c_csrf' && c.value);
      if (cCsrf) return cCsrf.value;
      const tkCookie = cookies.find(c => c.name === 'login_aliyunid_csrf' && c.value);
      if (tkCookie) return tkCookie.value;
    } catch (e) {}
    try {
      const pageRes = await this.fetch('https://developer.aliyun.com/article/new', { method: 'GET' });
      const html = await pageRes.text();
      const m = html.match(/c_csrf\s*[:=]\s*["']([^"']+)["']/i) || html.match(/"csrfToken":\s*"([^"]+)"/i) || html.match(/p_csrf=([^"'\s&]+)/i);
      if (m) return m[1];
    } catch (e) {}
    return '';
  }

  async uploadImage(blob, src = 'image.png') {
    const csrfToken = await this.getCsrfToken();
    
    // 提取合法纯文件名（过滤 URL 路径、特殊符号）
    let cleanName = 'image.png';
    if (typeof src === 'string') {
      try {
        const urlClean = src.split(/[?#]/)[0];
        const segs = urlClean.split('/').filter(Boolean);
        const lastSeg = segs.pop();
        if (lastSeg && lastSeg.length < 80) {
          cleanName = decodeURIComponent(lastSeg).replace(/[^\w\d\-_.]/g, '_');
        }
      } catch (e) {
        cleanName = `image_${Date.now()}.png`;
      }
    }
    const finalFilename = cleanName.match(/\.(png|jpe?g|gif|webp|bmp|svg)$/i) ? cleanName : `${cleanName}.png`;
    const imageSize = blob && blob.size ? blob.size : 102400;

    const url = `https://developer.aliyun.com/developer/api/image/getImageUploadUrl${csrfToken ? `?p_csrf=${csrfToken}` : ''}`;
    
    // 1. 获取预签名 OSS 上传地址及目标 CDN URL
    const presignRes = await this.fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': '*/*',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://developer.aliyun.com',
        'referer': 'https://developer.aliyun.com/article/new'
      },
      body: JSON.stringify({
        imageName: finalFilename,
        imageSize: imageSize
      })
    });

    if (!presignRes.ok) {
      throw new Error(`获取阿里云图片上传地址失败: ${presignRes.status}`);
    }

    const presignData = await presignRes.json();
    if (!presignData.success || !presignData.data?.uploadUrl) {
      throw new Error(presignData.message || '获取阿里云图片上传地址失败');
    }

    const { uploadUrl, imageUrl, header = {} } = presignData.data;

    // 2. 直传 OSS
    const putHeaders = {
      'content-type': header['content-type'] || blob.type || 'image/png'
    };
    if (header['x-oss-meta-author']) {
      putHeaders['x-oss-meta-author'] = header['x-oss-meta-author'];
    }

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: putHeaders,
      body: blob
    });

    if (!uploadRes.ok) {
      throw new Error(`阿里云 OSS 上传失败: ${uploadRes.status}`);
    }

    return { url: imageUrl, imageUrl: imageUrl };
  }

  async publish(article) {
    let markdown = article.markdown || '';
    let coverUrl = article.cover || '';

    // 1. 转存 Markdown 中的所有外部图片至阿里云 CDN（仅排除已是阿里云开发者社区官方 CDN ucc.alicdn.com 的图片）
    if (markdown) {
      try {
        markdown = await this.processImages(
          markdown,
          (blob, src) => this.uploadImage(blob, src),
          { skipPatterns: ['ucc.alicdn.com'] }
        );
      } catch (e) {
        console.warn('[Aliyun Publish] Image conversion warning:', e.message);
      }
    }

    // 2. 转存并设置封面图（若未指定则自动从 Markdown 第一张图片提取）
    if (!coverUrl && markdown) {
      const mdMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/);
      if (mdMatch) {
        coverUrl = mdMatch[1];
      }
    }

    if (coverUrl && !coverUrl.includes('ucc.alicdn.com')) {
      try {
        coverUrl = await this.uploadCover(coverUrl, (blob, src) => this.uploadImage(blob, 'article-cover.png'));
      } catch (e) {
        console.warn('[Aliyun Publish] Cover upload warning:', e.message);
      }
    }

    // 3. 调用阿里云官方草稿保存接口
    try {
      const csrfToken = await this.getCsrfToken();
      const draftUrl = `https://developer.aliyun.com/developer/api/articleDraft/putDraft${csrfToken ? `?p_csrf=${csrfToken}` : ''}`;
      
      const payload = {
        title: article.title || '未命名文档',
        content: markdown,
        contentRender: '',
        format: null,
        aid: null,
        productTags: [],
        freeTierVOS: []
      };
      if (coverUrl) {
        payload.cover = coverUrl;
        payload.coverUrl = coverUrl;
        payload.coverImage = coverUrl;
        payload.coverPic = coverUrl;
        payload.coverImg = coverUrl;
        payload.headPic = coverUrl;
        payload.articleCover = coverUrl;
      }

      const draftRes = await this.fetch(draftUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': '*/*',
          'x-requested-with': 'XMLHttpRequest',
          'origin': 'https://developer.aliyun.com',
          'referer': 'https://developer.aliyun.com/article/new'
        },
        body: JSON.stringify(payload)
      });

      if (draftRes.ok) {
        const draftData = await draftRes.json();
        const aid = draftData.data?.aid || draftData.data?.id || draftData.aid || draftData.id;
        console.log('[Aliyun Publish] Direct draft save success, aid:', aid);
        const postUrl = aid ? `https://developer.aliyun.com/article/new?aid=${aid}` : 'https://developer.aliyun.com/article/new';
        return this.createResult(true, {
          postUrl: postUrl,
          postId: aid,
          draftOnly: true,
          markdown: markdown,
          cover: coverUrl
        });
      }
    } catch (draftErr) {
      console.warn('[Aliyun Publish] Direct draft save error, falling back to tab automation:', draftErr);
    }

    return this.createResult(true, {
      postUrl: 'https://developer.aliyun.com/article/new',
      draftOnly: true,
      markdown: markdown,
      cover: coverUrl
    });
  }
}

// 28. LeetCode Adapter
class LeetcodeAdapter extends CodeAdapter {
  constructor() {
    super('leetcode');
  }

  async publish(article) {
    return this.createResult(true, {
      postUrl: 'https://leetcode.cn/circle/discuss/create/',
      draftOnly: true
    });
  }
}

// Register all 28+ adapters
self.publishAdapters = {
  csdn: new CsdnAdapter(),
  juejin: new JuejinAdapter(),
  wechat: new WechatAdapter(),
  weixin: new WechatAdapter(), // alias
  zhihu: new ZhihuAdapter(),
  weibo: new WeiboAdapter(),
  baijiahao: new BaijiahaoAdapter(),
  bilibili: new BilibiliAdapter(),
  cnblogs: new CnblogsAdapter(),
  yuque: new YuqueAdapter(),
  segmentfault: new SegmentfaultAdapter(),
  cto51: new Cto51Adapter(),
  '51cto': new Cto51Adapter(), // alias
  oschina: new OschinaAdapter(),
  imooc: new ImoocAdapter(),
  douban: new DoubanAdapter(),
  sohu: new SohuAdapter(),
  xueqiu: new XueqiuAdapter(),
  woshipm: new WoshipmAdapter(),
  eastmoney: new EastmoneyAdapter(),
  jianshu: new JianshuAdapter(),
  toutiao: new ToutiaoAdapter(),
  infoq: new InfoqAdapter(),
  learnku: new LearnkuAdapter(),
  tencentcloud: new TencentCloudAdapter(),
  'tencent-cloud': new TencentCloudAdapter(),
  nowcoder: new NowcoderAdapter(),
  aliyun: new AliyunAdapter(),
  leetcode: new LeetcodeAdapter(),
  'zip-download': new ZipDownloadAdapter()
};
console.log('[NiceMD Adapters] Registry initialized with 28+ platforms.');
