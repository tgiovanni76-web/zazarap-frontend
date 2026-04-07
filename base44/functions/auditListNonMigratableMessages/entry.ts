import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const emailCache = new Map();
    const resolveUserIdByEmail = async (email) => {
      if (!email || typeof email !== 'string') return null;
      if (!email.includes('@')) return null;
      if (emailCache.has(email)) return emailCache.get(email);
      const users = await base44.asServiceRole.entities.User.filter({ email });
      const id = Array.isArray(users) && users.length > 0 ? users[0].id : null;
      emailCache.set(email, id);
      return id;
    };

    const hasEmailLike = (v) => typeof v === 'string' && v.includes('@');

    // Pull full datasets (service role). If dataset becomes huge, consider paging in future.
    const [messages] = await Promise.all([
      base44.asServiceRole.entities.ChatMessage.list(),
    ]);

    const nonMigratable = [];

    for (const m of messages) {
      const s = m?.senderId;
      const r = m?.receiverId;
      const sEmail = hasEmailLike(s) ? s : null;
      const rEmail = hasEmailLike(r) ? r : null;

      let sOk = true, rOk = true;
      if (sEmail) {
        const mapped = await resolveUserIdByEmail(sEmail);
        sOk = !!mapped;
      }
      if (rEmail) {
        const mapped = await resolveUserIdByEmail(rEmail);
        rOk = !!mapped;
      }

      // Non-migratable if we have an email-like id that doesn't resolve to a user
      if ((sEmail && !sOk) || (rEmail && !rOk)) {
        nonMigratable.push({
          id: m.id,
          chatId: m.chatId,
          senderId: m.senderId,
          receiverId: m.receiverId,
          created_date: m.created_date || null,
          text_preview: (m.text || '').slice(0, 120),
          reason: {
            sender_unresolved: !!(sEmail && !sOk),
            receiver_unresolved: !!(rEmail && !rOk)
          },
          demo_like: /(^demo[-_.]?|@example\.|@test\.|@demo\.|^test[-_.]?)/i.test(String(sEmail || rEmail))
        });
      }
    }

    // Sort by created_date asc for readability
    nonMigratable.sort((a, b) => {
      const da = new Date(a.created_date || 0).getTime();
      const db = new Date(b.created_date || 0).getTime();
      return da - db;
    });

    return Response.json({
      generatedAt: new Date().toISOString(),
      nonMigratableCount: nonMigratable.length,
      nonMigratable
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});