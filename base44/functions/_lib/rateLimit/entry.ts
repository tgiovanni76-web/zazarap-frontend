import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function getClientIp(req) {
  const xf = req.headers.get('x-forwarded-for') || '';
  return (xf.split(',')[0] || '').trim() || (req.headers.get('cf-connecting-ip') || '') || 'anon';
}

export function makeKey(req, endpoint, userEmail, windowSec, now = new Date()) {
  const ip = getClientIp(req);
  const winStart = new Date(Math.floor(now.getTime() / (windowSec * 1000)) * windowSec * 1000);
  const key = `${endpoint}:${userEmail || ip}:${winStart.toISOString()}`;
  return { key, windowStart: winStart, ip };
}

export async function checkRateLimit(req, endpoint, { limit = 60, windowSec = 60 } = {}) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  const { key, windowStart } = makeKey(req, endpoint, user?.email || null, windowSec);

  const existing = await base44.asServiceRole.entities.RateLimit.filter({ key }).catch(() => []);
  if (!existing || existing.length === 0) {
    await base44.asServiceRole.entities.RateLimit.create({
      key,
      endpoint,
      windowStart: windowStart.toISOString(),
      windowSec,
      count: 1,
      expiresAt: new Date(windowStart.getTime() + windowSec * 1000 * 2).toISOString()
    });
    return { allowed: true };
  }
  const rec = existing[0];
  const newCount = (rec.count || 0) + 1;
  await base44.asServiceRole.entities.RateLimit.update(rec.id, { count: newCount });
  if (newCount > limit) {
    const retryAfter = Math.max(1, Math.ceil((new Date(rec.windowStart).getTime() + rec.windowSec * 1000 - Date.now()) / 1000));
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}