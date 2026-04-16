import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { listingId } = await req.json();
    if (!listingId) return Response.json({ error: 'Missing listingId' }, { status: 400 });

    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    const listing = listings?.[0];
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

    // Use central moderation pipeline from the bundle
    const { data: bundle } = await base44.functions.invoke('generateListingBundle', {
      listingId, include: ['moderation']
    });
    const m = bundle?.moderation || { success: true, flagged: false, severity: 'low', categories: [], autoRejected: false, textAnalysis: {}, imageAnalysis: {} };

    // Update listing with moderation results (no KI in notifications)
    const updateData = {
      moderationStatus: m.flagged ? 'pending' : 'approved',
      moderationNotes: JSON.stringify({
        textAnalysis: m.textAnalysis,
        imageAnalysis: m.imageAnalysis,
        analyzedAt: new Date().toISOString()
      })
    };
    if (m.severity === 'critical') {
      updateData.moderationStatus = 'rejected';
      updateData.rejectionReason = `Automatisch abgelehnt: ${m.textAnalysis?.reason || m.imageAnalysis?.reason || ''}`;
      updateData.status = 'archived';
    }
    await base44.asServiceRole.entities.Listing.update(listingId, updateData);

    // Log moderation event
    await base44.asServiceRole.entities.ModerationEvent.create({
      entityType: 'listing',
      entityId: listingId,
      action: m.flagged ? 'flagged' : 'approved',
      severity: m.severity,
      reason: m.textAnalysis?.reason || 'Automatisch geprüft',
      moderatorId: 'AI_SYSTEM',
      details: JSON.stringify({
        textCategories: m.textAnalysis?.categories,
        imageIssues: m.imageAnalysis?.issues,
        confidence: m.textAnalysis?.confidence
      })
    });

    // Notifications and email WITHOUT KI
    if (m.severity === 'critical') {
      await base44.asServiceRole.entities.Notification.create({
        userId: listing.created_by,
        type: 'status_update',
        title: '❌ Anzeige abgelehnt',
        message: `Deine Anzeige "${listing.title}" wurde automatisch abgelehnt. Grund: ${m.textAnalysis?.reason || 'Verstoß gegen Richtlinien'}`,
        linkUrl: '/MyListings'
      });
    } else if (m.flagged) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'info@zazarap.com',
        subject: `Moderation erforderlich: ${listing.title}`,
        body: `Eine Anzeige wurde zur Moderation markiert:\n\nTitel: ${listing.title}\nKategorie: ${listing.category}\nSchwere: ${m.severity}\nGrund: ${m.textAnalysis?.reason || ''}\n\nBitte überprüfen: https://app.base44.com/admin/moderate`
      });
    }

    return Response.json({
      success: true,
      flagged: m.flagged,
      severity: m.severity,
      categories: m.categories,
      autoRejected: m.autoRejected,
      textAnalysis: m.textAnalysis,
      imageAnalysis: m.imageAnalysis
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});