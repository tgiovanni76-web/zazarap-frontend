import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { chatId, text = '', imageUrl, price, messageType = 'text' } = body || {};
    if (!chatId) return Response.json({ error: 'chatId is required' }, { status: 400 });

    // Load chat using service role to access participants reliably
    const chats = await base44.asServiceRole.entities.Chat.filter({ id: chatId });
    const chat = Array.isArray(chats) ? chats[0] : null;
    if (!chat) return Response.json({ error: 'Chat not found' }, { status: 404 });

    // Helper: resolve email/identifier to user.id if possible
    async function resolveToUserId(val) {
      if (!val) return null;
      // If it's already an id, keep it
      if (typeof val === 'string' && !val.includes('@')) return val;
      // Try to resolve by email
      try {
        const found = await base44.asServiceRole.entities.User.filter({ email: val });
        if (Array.isArray(found) && found[0]?.id) return found[0].id;
      } catch (_) {}
      return val; // fallback (may be email)
    }

    const resolvedBuyerId = await resolveToUserId(chat.buyerId);
    const resolvedSellerId = await resolveToUserId(chat.sellerId);

    // Determine sender/receiver by comparing current user to resolved ids or emails as fallback
    const senderId = user.id;
    const isSenderSeller = (resolvedSellerId && resolvedSellerId === user.id) || chat.sellerId === user.email;
    const receiverId = isSenderSeller ? (resolvedBuyerId || chat.buyerId) : (resolvedSellerId || chat.sellerId);

    const messageData = {
      chatId,
      senderId,
      receiverId,
      buyerId: resolvedBuyerId || chat.buyerId,
      sellerId: resolvedSellerId || chat.sellerId,
      text: text || '',
      imageUrl,
      price,
      messageType,
      read: false,
      from_user: true,
      source: 'user',
      is_automated: false,
    };

    const created = await base44.entities.ChatMessage.create(messageData);
    return Response.json(created);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});