import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all active listings
    const listings = await base44.asServiceRole.entities.Listing.filter({ status: 'active' });
    
    // Base URL of the site
    const host = req.headers.get('host') || 'zazarap.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Rate limit
    const rl = await checkRateLimit(req, 'generateSitemap', { limit: 6, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Zu viele Anfragen', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    // Generate sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';
    
    // Static pages
    const staticPages = [
      { path: '/Marketplace', priority: '1.0' },
      { path: '/FAQ', priority: '0.8' },
      { path: '/Contact', priority: '0.8' },
      { path: '/PrivacyPolicy', priority: '0.5' },
      { path: '/AGB', priority: '0.5' },
      { path: '/Impressum', priority: '0.5' },
      { path: '/Widerrufsrecht', priority: '0.5' },
      { path: '/DisputeCenter', priority: '0.6' }
    ];
    
    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });
    
    // Listing pages
    listings.forEach(listing => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/ListingDetail?id=${listing.id}</loc>\n`;
      const lastmod = listing.updated_date || listing.created_date;
      sitemap += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    return new Response(sitemap, withSecurityHeaders({
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    }));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});