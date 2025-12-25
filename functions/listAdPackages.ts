import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    const base44 = createClientFromRequest(req);
    const incomingCid = req.headers.get('x-correlation-id');
    const correlationId = incomingCid && incomingCid.length <= 128 ? incomingCid : (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const user = await base44.auth.me().catch(() => null);

    const rl = await checkRateLimit(req, 'listAdPackages', { limit: 60, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const packages = {
      topAd: { id: 'topAd', name: 'TOP-Anzeige (7 Tage)', displayPrice: '€9,99', kind: 'one_time' },
      highlighted: { id: 'highlighted', name: 'Hervorgehobene Anzeige', displayPrice: '€3,99', kind: 'one_time' },
      premium14: { id: 'premium14', name: 'Premium 14 Tage', displayPrice: '€14,99', kind: 'one_time' },
      basicShop: { id: 'basicShop', name: 'Basic Shop-Paket', displayPrice: '€19,99 / Monat', kind: 'subscription' },
      businessShop: { id: 'businessShop', name: 'Business Shop-Paket', displayPrice: '€39,99 / Monat', kind: 'subscription' },
      premiumShop: { id: 'premiumShop', name: 'Premium Shop-Paket', displayPrice: '€69,99 / Monat', kind: 'subscription' },
      homeBanner: { id: 'homeBanner', name: 'Startseiten-Banner', displayPrice: '€199,00 / Woche', kind: 'banner' },
      categoryBanner: { id: 'categoryBanner', name: 'Kategorie-Banner', displayPrice: '€99,00 / Woche', kind: 'banner' },
      sidebarAd: { id: 'sidebarAd', name: 'Sidebar-Werbung', displayPrice: '€49,00 / Woche', kind: 'banner' }
    };

    // Log access (no sensitive data)
    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info', message: 'LIST_AD_PACKAGES', details: 'Packages fetched',
      context: JSON.stringify({ user: user?.email || 'anon', correlationId }), path: '/functions/listAdPackages', source: 'backend'
    }).catch(() => {});

    return new Response(JSON.stringify({ packages }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});