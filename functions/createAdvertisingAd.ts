import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

const schema = z.object({
  title: z.string().min(3).max(120),
  targetUrl: z.string().url(),
  placement: z.enum(['homepage', 'category', 'search', 'sidebar']),
  audience: z.string().max(200).optional().default(''),
  mediaAssetId: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const base44 = createClientFromRequest(req);

    const rl = await checkRateLimit(req, 'createAdvertisingAd', { limit: 10, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));
    if (!user.canCreateAds) return new Response(JSON.stringify({ error: 'Forbidden' }), withSecurityHeaders({ status: 403, headers: { 'Content-Type': 'application/json' } }));

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid payload', details: parsed.error.issues }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }
    const data = parsed.data;

    // Additional URL hardening: only http/https
    try {
      const u = new URL(data.targetUrl);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Invalid URL protocol');
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid target URL' }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    // Verify media asset ownership
    const assets = await base44.asServiceRole.entities.MediaAsset.filter({ id: data.mediaAssetId });
    if (!assets[0] || assets[0].created_by !== user.email) {
      return new Response(JSON.stringify({ error: 'Media not found' }), withSecurityHeaders({ status: 404, headers: { 'Content-Type': 'application/json' } }));
    }

    const ad = await base44.asServiceRole.entities.AdvertisingAd.create({
      title: data.title,
      targetUrl: data.targetUrl,
      placement: data.placement,
      audience: data.audience || '',
      mediaAssetId: data.mediaAssetId,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      status: 'pending'
    });

    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info', message: 'AD_CREATED', details: ad.id,
      context: JSON.stringify({ user: user.email, placement: data.placement }), path: '/functions/createAdvertisingAd', source: 'backend'
    }).catch(() => {});

    return new Response(JSON.stringify({ ad }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});