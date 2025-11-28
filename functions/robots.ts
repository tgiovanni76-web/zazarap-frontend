import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const host = req.headers.get('host') || 'zazarap.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Note: In a real deployment, you might need to check the actual path of the sitemap function
    // typically available via the SDK or configured routes.
    // For now we point to the common location or the root if rewritten.
    const sitemapUrl = `${baseUrl}/functions/generateSitemap`; 

    const robots = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;

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