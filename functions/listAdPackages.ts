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
      topAd: { packageCode: 'topAd', displayPrice: '€9,99', days: 7, kind: 'one_time' },
      highlighted: { packageCode: 'highlighted', displayPrice: '€3,99', days: 7, kind: 'one_time' },
      premium14: { packageCode: 'premium14', displayPrice: '€14,99', days: 14, kind: 'one_time' },
      basicShop: { packageCode: 'basicShop', displayPrice: '€19,99', period: 'month', kind: 'subscription' },
      businessShop: { packageCode: 'businessShop', displayPrice: '€39,99', period: 'month', kind: 'subscription' },
      premiumShop: { packageCode: 'premiumShop', displayPrice: '€69,99', period: 'month', kind: 'subscription' },
      homeBanner: { packageCode: 'homeBanner', displayPrice: '€199,00', period: 'week', kind: 'banner' },
      categoryBanner: { packageCode: 'categoryBanner', displayPrice: '€99,00', period: 'week', kind: 'banner' },
      sidebarAd: { packageCode: 'sidebarAd', displayPrice: '€49,00', period: 'week', kind: 'banner' }
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