import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postalCode, country = 'DE' } = await req.json();
    
    if (!postalCode) {
      return Response.json({ error: 'Postleitzahl erforderlich' }, { status: 400 });
    }

    // Nominatim API - OpenStreetMap geocoding service
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(postalCode)}&country=${country}&format=json&addressdetails=1&limit=10`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Zazarap-Marketplace/1.0'
      }
    });

    if (!response.ok) {
      return Response.json({ 
        found: false, 
        error: 'Geocoding service nicht verfügbar' 
      }, { status: 500 });
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return Response.json({ 
        found: false, 
        error: 'Postleitzahl nicht gefunden' 
      });
    }

    // Extract unique locations
    const locations = results.map(r => ({
      city: r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || '',
      region: r.address?.state || '',
      province: r.address?.county || r.address?.state_district || '',
      country: r.address?.country || country,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      displayName: r.display_name
    })).filter(loc => loc.city);

    // Remove duplicates based on city
    const uniqueLocations = Array.from(
      new Map(locations.map(loc => [loc.city, loc])).values()
    );

    if (uniqueLocations.length === 0) {
      return Response.json({ 
        found: false, 
        error: 'Keine Stadt für diese Postleitzahl gefunden' 
      });
    }

    // If single result, return directly
    if (uniqueLocations.length === 1) {
      return Response.json({
        found: true,
        ...uniqueLocations[0],
        multipleCities: false
      });
    }

    // Multiple cities - return list
    return Response.json({
      found: true,
      multipleCities: true,
      cities: uniqueLocations
    });

  } catch (error) {
    return Response.json({ 
      found: false, 
      error: error.message 
    }, { status: 500 });
  }
});