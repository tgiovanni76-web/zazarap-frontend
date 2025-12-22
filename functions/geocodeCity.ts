import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './rateLimiter.js';
import { z } from 'npm:zod@3.24.2';

function toJSON(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return toJSON({ error: 'Unauthorized' }, 401);
    }

    // Rate limiting
    const rl = checkRateLimit(req, user, 'geocodeCity', { limit: 30, windowSeconds: 60 });
    if (!rl.allowed) {
      return toJSON({ error: 'Rate limit exceeded', resetAt: rl.resetAt }, 429);
    }

    const payload = await req.json().catch(() => ({}));
    const schema = z.object({ city: z.string().min(1) });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return toJSON({ error: 'Invalid payload', details: parsed.error.issues }, 400);
    }
    const { city } = parsed.data;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&addressdetails=0&countrycodes=de`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Zazarap/1.0 (contact: info@zazarap.com)'
      }
    });

    if (!res.ok) {
      return toJSON({ error: 'Geocoding failed', details: await res.text() }, 502);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return toJSON({ found: false });
    }

    const first = data[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);

    return toJSON({ found: true, lat, lon });
  } catch (error) {
    return toJSON({ error: error.message }, 500);
  }
});