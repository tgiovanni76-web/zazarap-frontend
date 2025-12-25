import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

const schema = z.object({
  fileUri: z.string().min(3),
  originalName: z.string().min(1).max(256)
});

const ALLOWED = {
  images: ['image/jpeg', 'image/png', 'image/webp'],
  videos: ['video/mp4', 'video/webm']
};
const LIMITS = { image: 10 * 1024 * 1024, video: 100 * 1024 * 1024 };

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const base44 = createClientFromRequest(req);

    const rl = await checkRateLimit(req, 'registerMediaAsset', { limit: 20, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));

    if (!user.canUploadMedia) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), withSecurityHeaders({ status: 403, headers: { 'Content-Type': 'application/json' } }));
    }

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    const { fileUri, originalName } = parsed.data;

    // Create signed URL and fetch HEAD to validate content type/size
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 120 });
    const head = await fetch(signed_url, { method: 'HEAD' });
    const contentType = head.headers.get('content-type') || '';
    const sizeStr = head.headers.get('content-length') || '0';
    const size = parseInt(sizeStr, 10) || 0;

    const isImage = ALLOWED.images.includes(contentType);
    const isVideo = ALLOWED.videos.includes(contentType);
    if (!isImage && !isVideo) {
      return new Response(JSON.stringify({ error: 'Unsupported content type' }), withSecurityHeaders({ status: 415, headers: { 'Content-Type': 'application/json' } }));
    }
    if (isImage && size > LIMITS.image) {
      return new Response(JSON.stringify({ error: 'Image too large' }), withSecurityHeaders({ status: 413, headers: { 'Content-Type': 'application/json' } }));
    }
    if (isVideo && size > LIMITS.video) {
      return new Response(JSON.stringify({ error: 'Video too large' }), withSecurityHeaders({ status: 413, headers: { 'Content-Type': 'application/json' } }));
    }

    const kind = isImage ? 'image' : 'video';

    const asset = await base44.asServiceRole.entities.MediaAsset.create({
      userId: user.email,
      fileUri,
      originalName,
      contentType,
      size,
      kind,
      scanStatus: 'unknown'
    });

    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info', message: 'MEDIA_ASSET_REGISTERED', details: `${kind} ${size} bytes`,
      context: JSON.stringify({ user: user.email }), path: '/functions/registerMediaAsset', source: 'backend'
    }).catch(() => {});

    return new Response(JSON.stringify({ asset }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});