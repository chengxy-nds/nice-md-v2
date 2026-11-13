export const config = {
  runtime: 'edge',
};

/**
 * Universal Alibaba Cloud OSS Proxy & Signing Handler for Vercel
 * Runs strictly on Vercel Edge Runtime using 100% Web Standard APIs
 * (crypto.subtle, TextEncoder, btoa, Request, Response).
 * Zero Node.js dependencies, zero cold-start latency.
 */

import { resolveOssConfig, generateSignedUploadParams } from './lib/proxy-shared.js';

export default async function handler(req) {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Health & Status Check
  if (req.method === 'GET') {
    const ossConfig = resolveOssConfig(process.env);
    return new Response(
      JSON.stringify({
        status: 'ok',
        hasDefault: Boolean(ossConfig),
        bucket: ossConfig?.bucket || '',
        endpoint: ossConfig?.endpoint || '',
        domain: ossConfig?.domain || '',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // 3. Generate Signed Upload Policy for client-side direct upload
  if (req.method === 'POST') {
    const ossConfig = resolveOssConfig(process.env);
    if (!ossConfig) {
      return new Response(
        JSON.stringify({
          error: 'Vercel 服务端未配置阿里云 OSS 环境变量 (OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET / OSS_ENDPOINT)。',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    try {
      const body = await req.json().catch(() => ({}));
      const filename = body?.filename || 'image.png';
      const uploadParams = await generateSignedUploadParams(ossConfig, filename);
      return new Response(
        JSON.stringify(uploadParams),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: '生成 OSS 上传凭证失败: ' + err.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
