import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Cleanup function: deletes listings by specified titles and normalizes category names
// Usage (frontend): await base44.functions.invoke('cleanupListings', { titles: [...], normalizeCategories: true })
// You can also run it from the dashboard -> Code -> Functions -> cleanupListings

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth: require authenticated admin for destructive maintenance
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    // Default titles from the user's list, used if none are provided in payload
    const defaultTitles = [
      'Fiat Punto Evo',
      'Auto',
      'Creatin',
      'bott',
      'cane',
      'TELECOMANDO',
      'cane corso',
      'Divano Moderno',
      'Mountain Bike Trek',
      'Giacca in Pelle',
      'Laptop Gaming ASUS',
      'Tavolo da Pranzo con 6 Sedie',
      'Collezione Libri Usati',
      'Vespa Piaggio',
      'iPhone 13 Pro 256GB',
      'Modern Sofa - Like New',
      'Gaming Laptop ASUS ROG',
      'Dining Table with 6 Chairs',
      'Used Books Collection',
      'Vespa Scooter'
    ];

    const titles = Array.isArray(body.titles) && body.titles.length > 0 ? body.titles : defaultTitles;
    const normalizeCategories = body.normalizeCategories !== false; // default true

    // Category normalization map (key -> canonical)
    // Canonical set chosen in Italian to align with current app usage.
    const categoryMap = {
      // electronics
      'Elektronik': 'elettronica',
      'Electronics': 'elettronica',
      'electronics': 'elettronica',
      'Elettronica': 'elettronica',
      'elettronica': 'elettronica',
      // furniture
      'furniture': 'arredamento',
      'Furniture': 'arredamento',
      'arredamento': 'arredamento',
      'Arredamento': 'arredamento',
      // sport
      'Sport': 'sport',
      'sport': 'sport',
      // clothing
      'clothing': 'abbigliamento',
      'Clothing': 'abbigliamento',
      'abbigliamento': 'abbigliamento',
      'Abbigliamento': 'abbigliamento',
      // books
      'books': 'libri',
      'Books': 'libri',
      'libri': 'libri',
      'Libri': 'libri',
      // vehicles
      'vehicles': 'veicoli',
      'Vehicles': 'veicoli',
      'veicoli': 'veicoli',
      'Veicoli': 'veicoli',
      // animals
      'Animali': 'animali',
      'animali': 'animali',
      // services
      'Servizi': 'servizi',
      'servizi': 'servizi',
      // generic localized stray categories
      'Auto': 'veicoli'
    };

    const results = {
      deleted: 0,
      deletedByTitle: {},
      categoryUpdates: [],
      skipped: 0,
      errors: []
    };

    // Delete listings by title (service role to bypass RLS when needed)
    for (const title of titles) {
      const matches = await base44.asServiceRole.entities.Listing.filter({ title });
      let perTitleDeleted = 0;
      if (Array.isArray(matches) && matches.length > 0) {
        for (const item of matches) {
          try {
            await base44.asServiceRole.entities.Listing.delete(item.id);
            results.deleted += 1;
            perTitleDeleted += 1;
          } catch (e) {
            // tolerate stale or already-deleted IDs
            results.skipped += 1;
            results.errors.push(`delete ${item.id}: ${e?.message || e}`);
          }
        }
      }
      results.deletedByTitle[title] = perTitleDeleted;
    }

    // Normalize categories where requested
    if (normalizeCategories) {
      // Build unique set of source categories that actually map to a different target
      const entries = Object.entries(categoryMap).filter(([from, to]) => from !== to);
      for (const [from, to] of entries) {
        const toUpdate = await base44.asServiceRole.entities.Listing.filter({ category: from });
        let count = 0;
        for (const item of toUpdate) {
          try {
            await base44.asServiceRole.entities.Listing.update(item.id, { category: to });
            count += 1;
          } catch (e) {
            results.skipped += 1;
            results.errors.push(`update ${item.id}: ${e?.message || e}`);
          }
        }
        if (count > 0) {
          results.categoryUpdates.push({ from, to, updated: count });
        }
      }
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});