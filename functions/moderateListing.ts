import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId } = await req.json();

    if (!listingId) {
      return Response.json({ error: 'Missing listingId' }, { status: 400 });
    }

    // Fetch the listing
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // AI Content Moderation for text
    const textModerationPrompt = `Du bist ein Content-Moderationssystem für einen Kleinanzeigen-Marktplatz. Analysiere den folgenden Inhalt auf unangemessene, illegale oder problematische Inhalte.

Titel: "${listing.title}"
Beschreibung: "${listing.description || 'Keine Beschreibung'}"
Kategorie: "${listing.category}"

Prüfe auf:
1. Illegale Inhalte (Waffen, Drogen, gestohlene Ware)
2. Betrügerische Angebote (zu gut um wahr zu sein, Phishing)
3. Hassrede, Diskriminierung
4. Sexuelle/unangemessene Inhalte
5. Gewaltverherrlichung
6. Spam oder Werbung
7. Kontaktdaten im Text (Telefonnummern, E-Mails außerhalb des Systems)
8. Verbotene Tier- oder Waffenverkäufe

Bewerte die Schwere: low (geringfügig), medium (bedenklich), high (schwerwiegend), critical (sofort sperren)`;

    const textAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: textModerationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          flagged: { type: 'boolean' },
          severity: { type: 'string' },
          categories: {
            type: 'array',
            items: { type: 'string' }
          },
          reason: { type: 'string' },
          confidence: { type: 'number' }
        }
      }
    });

    // Image Moderation (if images exist)
    let imageAnalysis = null;
    if (listing.images && listing.images.length > 0) {
      const imagePrompt = `Analysiere dieses Bild eines Kleinanzeigen-Produkts. Prüfe auf:
- Unangemessene oder sexuelle Inhalte
- Gewalt oder verstörende Bilder
- Gefälschte Markenprodukte (offensichtliche Fälschungen)
- Waffen oder illegale Gegenstände
- Qualität: Ist das Bild relevant für das Produkt?

Kontext: Titel "${listing.title}", Kategorie "${listing.category}"`;

      try {
        imageAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: imagePrompt,
          file_urls: [listing.images[0]], // Analyze first image
          response_json_schema: {
            type: 'object',
            properties: {
              flagged: { type: 'boolean' },
              severity: { type: 'string' },
              issues: {
                type: 'array',
                items: { type: 'string' }
              },
              reason: { type: 'string' }
            }
          }
        });
      } catch (err) {
        console.error('Image analysis error:', err);
      }
    }

    // Combine results
    const isFlagged = textAnalysis.flagged || (imageAnalysis?.flagged || false);
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const textSeverityScore = severityLevels[textAnalysis.severity] || 0;
    const imageSeverityScore = imageAnalysis ? (severityLevels[imageAnalysis.severity] || 0) : 0;
    const maxSeverity = Math.max(textSeverityScore, imageSeverityScore);
    const finalSeverity = Object.keys(severityLevels).find(k => severityLevels[k] === maxSeverity) || 'low';

    const allCategories = [
      ...(textAnalysis.categories || []),
      ...(imageAnalysis?.issues || [])
    ];

    // Update listing with moderation results
    const updateData = {
      moderationStatus: isFlagged ? 'pending' : 'approved',
      moderationNotes: JSON.stringify({
        textAnalysis: {
          flagged: textAnalysis.flagged,
          severity: textAnalysis.severity,
          reason: textAnalysis.reason,
          confidence: textAnalysis.confidence,
          categories: textAnalysis.categories
        },
        imageAnalysis: imageAnalysis ? {
          flagged: imageAnalysis.flagged,
          severity: imageAnalysis.severity,
          reason: imageAnalysis.reason,
          issues: imageAnalysis.issues
        } : null,
        analyzedAt: new Date().toISOString()
      })
    };

    // Auto-reject critical content
    if (finalSeverity === 'critical') {
      updateData.moderationStatus = 'rejected';
      updateData.rejectionReason = `Automatisch abgelehnt: ${textAnalysis.reason || imageAnalysis?.reason}`;
      updateData.status = 'archived';
    }

    await base44.asServiceRole.entities.Listing.update(listingId, updateData);

    // Create moderation event log
    await base44.asServiceRole.entities.ModerationEvent.create({
      entityType: 'listing',
      entityId: listingId,
      action: isFlagged ? 'flagged' : 'approved',
      severity: finalSeverity,
      reason: textAnalysis.reason || 'Automatisch geprüft',
      moderatorId: 'AI_SYSTEM',
      details: JSON.stringify({
        textCategories: textAnalysis.categories,
        imageIssues: imageAnalysis?.issues,
        confidence: textAnalysis.confidence
      })
    });

    // Notify user if rejected
    if (finalSeverity === 'critical') {
      await base44.asServiceRole.entities.Notification.create({
        userId: listing.created_by,
        type: 'status_update',
        title: '❌ Anzeige abgelehnt',
        message: `Deine Anzeige "${listing.title}" wurde automatisch abgelehnt. Grund: ${textAnalysis.reason}`,
        linkUrl: '/MyListings'
      });
    } else if (isFlagged) {
      // Notify admins
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'info@zazarap.com',
        subject: `Moderation erforderlich: ${listing.title}`,
        body: `Eine Anzeige wurde zur Moderation markiert:\n\nTitel: ${listing.title}\nKategorie: ${listing.category}\nSchwere: ${finalSeverity}\nGrund: ${textAnalysis.reason}\n\nBitte überprüfen: https://app.base44.com/admin/moderate`
      });
    }

    return Response.json({
      success: true,
      flagged: isFlagged,
      severity: finalSeverity,
      categories: allCategories,
      autoRejected: finalSeverity === 'critical',
      textAnalysis,
      imageAnalysis
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});