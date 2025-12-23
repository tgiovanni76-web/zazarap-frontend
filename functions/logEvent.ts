import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { logEventSchema } from './_lib/validation.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    // Rate limit
    const rl = await checkRateLimit(req, 'logEvent', { limit: 120, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Zu viele Anfragen', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    // Validate
    const parsed = logEventSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Ungültige Eingabedaten', details: parsed.error.issues }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }
    body = parsed.data;

    const url = new URL(req.url);
    const path = body.path || url.searchParams.get('path') || '';
    const ua = req.headers.get('user-agent') || '';

    // Try to identify user, but allow unauthenticated logging
    const user = await base44.auth.me().catch(() => null);

    const payload = {
      level: body.level || 'info',
      message: body.message || 'log',
      details: typeof body.details === 'string' ? body.details : JSON.stringify(body.details || {}),
      context: typeof body.context === 'string' ? body.context : JSON.stringify(body.context || {}),
      path,
      userAgent: ua,
      userId: user?.email || body.userId || 'anonymous',
      source: body.source || 'frontend'
    };

    await base44.asServiceRole.entities.SystemLog.create(payload);

    // Forward to Logtail (Better Stack) if configured
    const token = Deno.env.get('LOGTAIL_SOURCE_TOKEN');
    if (token) {
      const logtailPayload = {
        level: payload.level,
        message: payload.message,
        dt: new Date().toISOString(),
        path: payload.path,
        userAgent: payload.userAgent,
        userId: payload.userId,
        source: payload.source,
        details: payload.details
      };
      // Fire-and-forget to avoid slowing down the request
      fetch('https://in.logtail.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(logtailPayload)
      }).catch(() => {});
    }

    // Opportunistic retention: delete SystemLog records older than 30 days (max 200 per call)
    // Runs ~5% of the time to keep DB tidy without extra scheduling
    if (Math.random() < 0.05) {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const batch = await base44.asServiceRole.entities.SystemLog.list('created_date', 500);
      const toDelete = (batch || []).filter(l => l?.created_date && new Date(l.created_date) < cutoff).slice(0, 200);
      for (const l of toDelete) {
        await base44.asServiceRole.entities.SystemLog.delete(l.id);
      }
    }

    return new Response(JSON.stringify({ status: 'ok' }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});