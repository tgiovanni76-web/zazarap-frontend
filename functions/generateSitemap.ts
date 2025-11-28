import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch all active listings
    const listings = await base44.asServiceRole.entities.Listing.filter({ status: 'active' });
    
    // Base URL of the site
    const host = req.headers.get('host') || 'zazarap.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
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
      { path: '/marketplace', priority: '0.9' },
      { path: '/faq', priority: '0.7' },
      { path: '/contact', priority: '0.7' },
      { path: '/privacy-policy', priority: '0.5' },
      { path: '/terms-of-service', priority: '0.5' }
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
      sitemap += `    <loc>${baseUrl}/listing-detail?id=${listing.id}</loc>\n`;
      const lastmod = listing.updated_date || listing.created_date;
      sitemap += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});