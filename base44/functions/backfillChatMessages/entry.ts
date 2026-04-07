import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let totalProcessed = 0;
    let totalUpdated = 0;

    // Load all messages (adjust if your dataset is huge)
    const messages = await base44.asServiceRole.entities.ChatMessage.list();

    for (const msg of (messages || [])) {
      totalProcessed++;
      // Load related chat to copy buyer/seller
      const chats = await base44.asServiceRole.entities.Chat.filter({ id: msg.chatId });
      const chat = Array.isArray(chats) ? chats[0] : null;
      if (!chat) continue;

      let buyerKey = chat.buyerId || msg.buyerId;
      let sellerKey = chat.sellerId || msg.sellerId;

      // Resolve emails -> user.id where possible (admin privileges)
      async function resolveToUserId(value) {
        if (!value) return null;
        const isEmail = typeof value === 'string' && value.includes('@');
        if (isEmail) {
          try {
            const found = await base44.asServiceRole.entities.User.filter({ email: value });
            if (Array.isArray(found) && found[0]?.id) return found[0].id;
          } catch (_) {}
        }
        return value;
      }

      const patch = {};
      const resolvedBuyer = await resolveToUserId(buyerKey);
      const resolvedSeller = await resolveToUserId(sellerKey);
      const resolvedSender = await resolveToUserId(msg.senderId);
      const resolvedReceiver = await resolveToUserId(msg.receiverId);

      if (!msg.buyerId && resolvedBuyer) patch.buyerId = resolvedBuyer;
      if (!msg.sellerId && resolvedSeller) patch.sellerId = resolvedSeller;
      if (resolvedSender && resolvedSender !== msg.senderId) patch.senderId = resolvedSender;
      if (resolvedReceiver && resolvedReceiver !== msg.receiverId) patch.receiverId = resolvedReceiver;

      if (Object.keys(patch).length > 0) {
        await base44.asServiceRole.entities.ChatMessage.update(msg.id, patch);
        totalUpdated++;
      }
    }

    return Response.json({ status: 'ok', processed: totalProcessed, updated: totalUpdated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});