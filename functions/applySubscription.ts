import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

const schema = z.object({ plan: z.string().min(2), enableAds: z.boolean().optional().default(true) });

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const base44 = createClientFromRequest(req);

    const rl = await checkRateLimit(req, 'applySubscription', { limit: 6, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid payload' }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));

    const plan = parsed.data.plan;
    const enableAds = parsed.data.enableAds;

    const updated = await base44.auth.updateMe({
      subscriptionActive: true,
      subscriptionPlan: plan,
      canUploadMedia: true,
      canCreateAds: !!enableAds
    });

    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info', message: 'SUBSCRIPTION_APPLIED', details: plan,
      context: JSON.stringify({ user: user.email }), path: '/functions/applySubscription', source: 'backend'
    }).catch(() => {});

    return new Response(JSON.stringify({ user: updated }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});