import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Admin-only chunked backfill for ChatMessage records
// Goals:
// - Convert senderId/receiverId from email -> user.id
// - Ensure buyerId/sellerId on message align with parent Chat
// - Detect and report participants_mismatch and orphan_message
// - Processes up to BATCH_LIMIT messages per invocation
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const BATCH_LIMIT = 30;

    const emailCache = new Map();
    const resolveUserIdByEmail = async (email) => {
      if (!email || typeof email !== 'string') return null;
      if (!email.includes('@')) return null;
      if (emailCache.has(email)) return emailCache.get(email);
      const users = await base44.asServiceRole.entities.User.filter({ email });
      const id = users && users.length > 0 ? users[0].id : null;
      emailCache.set(email, id);
      return id;
    };

    // Load a window of recent messages; filter in-memory to target those needing work
    const windowSize = 200;
    const messagesWindow = await base44.asServiceRole.entities.ChatMessage.list('-updated_date', windowSize);

    const needsWork = [];
    for (const m of messagesWindow || []) {
      const s = m?.senderId, r = m?.receiverId;
      const sEmail = typeof s === 'string' && s.includes('@');
      const rEmail = typeof r === 'string' && r.includes('@');
      const missingBR = !m?.buyerId || !m?.sellerId;
      if (sEmail || rEmail || missingBR) needsWork.push(m);
      if (needsWork.length >= BATCH_LIMIT) break;
    }

    let participantsMismatch = 0;
    let orphanMessage = 0;

    const processed = [];
    const notMigratable = [];

    for (const msg of needsWork) {
      const chatId = msg.chatId;
      const chat = chatId ? await base44.asServiceRole.entities.Chat.get?.(chatId).catch?.(() => null) : null;
      if (!chat) {
        // Orphan message: parent chat missing
        orphanMessage += 1;
        continue;
      }

      // Normalize sender/receiver if they look like emails
      let senderId = msg.senderId;
      let receiverId = msg.receiverId;
      if (typeof senderId === 'string' && senderId.includes('@')) {
        const mapped = await resolveUserIdByEmail(senderId);
        if (mapped) senderId = mapped; else notMigratable.push({ messageId: msg.id, field: 'senderId', value: msg.senderId });
      }
      if (typeof receiverId === 'string' && receiverId.includes('@')) {
        const mapped = await resolveUserIdByEmail(receiverId);
        if (mapped) receiverId = mapped; else notMigratable.push({ messageId: msg.id, field: 'receiverId', value: msg.receiverId });
      }

      // Ensure buyerId/sellerId on message match the chat
      const buyerId = chat.buyerId;
      const sellerId = chat.sellerId;

      // Try auto-fix when only one side matches chat roles
      if (!!buyerId && !!sellerId) {
        const senderMatches = senderId === buyerId || senderId === sellerId;
        const receiverMatches = receiverId === buyerId || receiverId === sellerId;
        if (senderMatches && !receiverMatches) {
          receiverId = senderId === buyerId ? sellerId : buyerId;
        } else if (!senderMatches && receiverMatches) {
          senderId = receiverId === buyerId ? sellerId : buyerId;
        }
      }

      // Participant sanity: sender/receiver must be among buyer/seller
      const bothKnown = !!senderId && !!receiverId && !!buyerId && !!sellerId;
      if (bothKnown) {
        const valid = (senderId === buyerId || senderId === sellerId) && (receiverId === buyerId || receiverId === sellerId) && senderId !== receiverId;
        if (!valid) participantsMismatch += 1;
      }

      const patch = {
        senderId,
        receiverId,
        buyerId,
        sellerId,
      };

      await base44.asServiceRole.entities.ChatMessage.update(msg.id, patch);
      processed.push({ id: msg.id });
    }

    return Response.json({
      processedCount: processed.length,
      participantsMismatch,
      orphanMessage,
      notMigratableCount: notMigratable.length,
      notMigratable: notMigratable.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});