import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

    const { city } = await req.json();
    if (!city || typeof city !== 'string') {
      return toJSON({ error: 'Invalid payload: city required' }, 400);
    }

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