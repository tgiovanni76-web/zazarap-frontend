import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { listingId } = body || {};
    if (!listingId) return Response.json({ error: 'listingId is required' }, { status: 400 });

    // Try to fetch listing as user first, fallback to service role (public listings or owner)
    let listing = null;
    try {
      const ls = await base44.entities.Listing.filter({ id: listingId });
      listing = Array.isArray(ls) ? ls[0] : null;
    } catch (_) {}
    if (!listing) {
      const ls2 = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
      listing = Array.isArray(ls2) ? ls2[0] : null;
    }
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

    const sellerEmail = listing.created_by || listing.ownerEmail || listing.sellerEmail || null;
    if (!sellerEmail) return Response.json({ error: 'Seller email not found on listing' }, { status: 400 });

    // Resolve seller user.id from email using service role
    const sellerUsers = await base44.asServiceRole.entities.User.filter({ email: sellerEmail });
    const seller = Array.isArray(sellerUsers) ? sellerUsers[0] : null;
    if (!seller?.id) return Response.json({ error: 'Seller user not found' }, { status: 404 });

    // Find existing chat by strict ids
    let chats = [];
    try {
      chats = await base44.entities.Chat.filter({ listingId, buyerId: user.id, sellerId: seller.id }, '-updated_date');
    } catch (_) { chats = []; }

    if (chats && chats.length > 0) {
      return Response.json(chats[0]);
    }

    // Create chat with ids only
    const payload = {
      listingId,
      buyerId: user.id,
      sellerId: seller.id,
      status: 'in_attesa',
      lastMessage: '',
      listingTitle: listing.title,
      listingImage: (listing.images && listing.images[0]) || '',
      lastPrice: typeof listing.price === 'number' ? listing.price : undefined,
      updatedAt: new Date().toISOString(),
      unreadBuyer: 0,
      unreadSeller: 0
    };

    const chat = await base44.entities.Chat.create(payload);
    return Response.json(chat);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});