import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { perfBeaconSchema } from './_lib/validation.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const rl = await checkRateLimit(req, 'perfBeacon', { limit: 60, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ ok: false, error: 'Zu viele Anfragen', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const payload = await req.json().catch(() => ({}));
    const parsed = perfBeaconSchema.safeParse(payload);
    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: false, error: 'Ungültige Eingabedaten', details: parsed.error.issues }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }
    const { metrics } = parsed.data;

    await base44.asServiceRole.entities.PerformanceEvent.create({
      path: String(metrics.path || ''),
      userId: user?.email || 'anon',
      userAgent: String(metrics.userAgent || ''),
      viewport: JSON.stringify(metrics.viewport || {}),
      connection: JSON.stringify(metrics.connection || {}),
      navigation: JSON.stringify(metrics.navigation || {}),
      fcp: typeof metrics.fcp === 'number' ? metrics.fcp : null,
      lcp: typeof metrics.lcp === 'number' ? metrics.lcp : null,
      cls: typeof metrics.cls === 'number' ? metrics.cls : null,
    });

    return new Response(JSON.stringify({ ok: true }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});