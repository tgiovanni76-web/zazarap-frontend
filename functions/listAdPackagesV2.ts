import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

/**
 * V2: Language-neutral ad packages API
 * Returns packageCode instead of hardcoded names/labels
 * Frontend translates via i18n keys: t(`pricing.${packageCode}.title`)
 */

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

    // Language-neutral package definitions
    // Frontend translates: t(`pricing.${packageCode}.title`)
    const packages = {
      topAd: { 
        id: 'topAd', 
        packageCode: 'top_ad',
        displayPrice: '€9,99', 
        priceAmount: 9.99,
        currency: 'EUR',
        days: 7,
        kind: 'one_time' 
      },
      highlighted: { 
        id: 'highlighted', 
        packageCode: 'highlighted',
        displayPrice: '€3,99', 
        priceAmount: 3.99,
        currency: 'EUR',
        days: 7,
        kind: 'one_time' 
      },
      premium14: { 
        id: 'premium14', 
        packageCode: 'premium14',
        displayPrice: '€14,99', 
        priceAmount: 14.99,
        currency: 'EUR',
        days: 14,
        kind: 'one_time' 
      },
      basicShop: { 
        id: 'basicShop', 
        packageCode: 'basic_shop',
        displayPrice: '€19,99 / Monat', 
        priceAmount: 19.99,
        currency: 'EUR',
        interval: 'monthly',
        kind: 'subscription' 
      },
      businessShop: { 
        id: 'businessShop', 
        packageCode: 'business_shop',
        displayPrice: '€39,99 / Monat', 
        priceAmount: 39.99,
        currency: 'EUR',
        interval: 'monthly',
        kind: 'subscription' 
      },
      premiumShop: { 
        id: 'premiumShop', 
        packageCode: 'premium_shop',
        displayPrice: '€69,99 / Monat', 
        priceAmount: 69.99,
        currency: 'EUR',
        interval: 'monthly',
        kind: 'subscription' 
      },
      homeBanner: { 
        id: 'homeBanner', 
        packageCode: 'home_banner',
        displayPrice: '€199,00 / Woche', 
        priceAmount: 199.00,
        currency: 'EUR',
        interval: 'weekly',
        kind: 'banner' 
      },
      categoryBanner: { 
        id: 'categoryBanner', 
        packageCode: 'category_banner',
        displayPrice: '€99,00 / Woche', 
        priceAmount: 99.00,
        currency: 'EUR',
        interval: 'weekly',
        kind: 'banner' 
      },
      sidebarAd: { 
        id: 'sidebarAd', 
        packageCode: 'sidebar_ad',
        displayPrice: '€49,00 / Woche', 
        priceAmount: 49.00,
        currency: 'EUR',
        interval: 'weekly',
        kind: 'banner' 
      }
    };

    // Log access (no sensitive data)
    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info', message: 'LIST_AD_PACKAGES_V2', details: 'Language-neutral packages fetched',
      context: JSON.stringify({ user: user?.email || 'anon', correlationId, version: 'v2' }), path: '/functions/listAdPackagesV2', source: 'backend'
    }).catch(() => {});

    return new Response(JSON.stringify({ packages }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});