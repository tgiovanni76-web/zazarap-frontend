import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Centralized notification creator with hard idempotency and optional rate limits
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, type, title, message, linkUrl, relatedId, idempotencyKey, rateLimit = { perSeconds: 60, max: 10 } } = await req.json();
    if (!userId || !type || !title) return Response.json({ error: 'Missing fields' }, { status: 400 });

    // Hard dedupe by idempotencyKey (if provided)
    if (idempotencyKey) {
      const exist = await base44.asServiceRole.entities.Notification.filter({ idempotencyKey }, '-created_date', 1);
      if (Array.isArray(exist) && exist.length) {
        return Response.json({ ok: true, skipped: true, reason: 'idempotent_duplicate' });
      }
    }

    // Optional per-user rate limit
    if (rateLimit && rateLimit.perSeconds && rateLimit.max) {
      const recent = await base44.asServiceRole.entities.Notification.filter({ userId }, '-created_date', Math.max(rateLimit.max * 2, 25));
      const now = Date.now();
      const count = (recent || []).filter(n => n?.created_date && (now - new Date(n.created_date).getTime()) < (rateLimit.perSeconds * 1000)).length;
      if (count >= rateLimit.max) {
        return Response.json({ ok: true, skipped: true, reason: 'rate_limited' });
      }
    }

    const note = await base44.asServiceRole.entities.Notification.create({ userId, type, title, message, linkUrl, relatedId, idempotencyKey, source: 'sendNotification' });
    return Response.json({ ok: true, note });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});