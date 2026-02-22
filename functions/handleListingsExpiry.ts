import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Fetch active listings with potential expiry
    const listings = await base44.asServiceRole.entities.Listing.filter({ status: 'active' }, '-created_date', 1000);

    let expired = 0;
    let reminders = 0;

    for (const l of listings) {
      if (!l.expiresAt) continue;
      const exp = new Date(l.expiresAt);

      // Expire
      if (exp <= now) {
        await base44.asServiceRole.entities.Listing.update(l.id, { status: 'expired' });
        expired += 1;

        // Notify owner about expiration
        await base44.asServiceRole.entities.Notification.create({
          userId: l.created_by,
          type: 'status_update',
          title: 'Annuncio scaduto',
          message: `"${l.title}" è scaduto. Puoi riattivarlo o modificarlo.`,
          linkUrl: '/EditListing?id=' + l.id,
          relatedId: l.id
        });

        // Email owner
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: l.created_by,
          subject: 'Il tuo annuncio è scaduto',
          body: `Ciao,\n\nIl tuo annuncio "${l.title}" è scaduto. Visita Zazarap per riattivarlo o modificarlo:\nhttps://app.zazarap.com/EditListing?id=${l.id}\n\nGrazie!`
        });
        continue;
      }

      // Reminder within 24h
      if (exp > now && exp <= soon && !l.expiryReminderSent) {
        await base44.asServiceRole.entities.Notification.create({
          userId: l.created_by,
          type: 'reminder',
          title: 'Promemoria: annuncio in scadenza',
          message: `"${l.title}" scadrà entro 24 ore. Aggiorna o estendi la scadenza.`,
          linkUrl: '/EditListing?id=' + l.id,
          relatedId: l.id
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: l.created_by,
          subject: 'Promemoria: annuncio in scadenza',
          body: `Ciao,\n\nIl tuo annuncio "${l.title}" sta per scadere (entro 24 ore). Modificalo qui:\nhttps://app.zazarap.com/EditListing?id=${l.id}\n\nGrazie!`
        });

        await base44.asServiceRole.entities.Listing.update(l.id, { expiryReminderSent: true });
        reminders += 1;
      }
    }

    return Response.json({ ok: true, expired, reminders });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});