import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const host = req.headers.get('host') || 'zazarap.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const base44 = createClientFromRequest(req);
    const settingsList = await base44.asServiceRole.entities.SEOSettings.list();
    const settings = settingsList[0] || {};

    // Note: In a real deployment, you might need to check the actual path of the sitemap function
    // typically available via the SDK or configured routes.
    // For now we point to the common location or the root if rewritten.
    const sitemapUrl = `${baseUrl}/functions/generateSitemap`; 

    let robots = settings.robotsTxtContent;
    
    if (!robots) {
        robots = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;
    } else if (!robots.includes('Sitemap:')) {
        robots += `\n\nSitemap: ${sitemapUrl}`;
    }

    return new Response(robots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});