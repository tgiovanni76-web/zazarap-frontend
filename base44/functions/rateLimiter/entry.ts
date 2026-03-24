const store = new Map();

function getClientKey(req, user) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const uid = user?.email || 'anon';
  return `${ip}:${uid}`;
}

export function checkRateLimit(req, user, endpoint, { limit = 60, windowSeconds = 60 } = {}) {
  const k = `${endpoint}:${getClientKey(req, user)}`;
  const now = Date.now();
  const entry = store.get(k);
  if (!entry || (now - entry.start) > windowSeconds * 1000) {
    store.set(k, { start: now, count: 1 });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowSeconds * 1000 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.start + windowSeconds * 1000 };
  }
  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.start + windowSeconds * 1000 };
}