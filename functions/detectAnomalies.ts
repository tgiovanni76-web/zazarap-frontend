import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const alerts = [];
    
    // 1. Verdächtige Aktivitäten erkennen
    const recentActivities = await base44.asServiceRole.entities.UserActivity.filter(
      { created_date: { $gte: new Date(Date.now() - 60 * 60 * 1000).toISOString() } },
      '-created_date',
      500
    );

    // Gruppiere nach User
    const userActivityCount = {};
    for (const activity of recentActivities) {
      userActivityCount[activity.userId] = (userActivityCount[activity.userId] || 0) + 1;
    }

    // Erkennen von ungewöhnlich hoher Aktivität (möglicher Bot)
    for (const [userId, count] of Object.entries(userActivityCount)) {
      if (count > 50) { // Mehr als 50 Aktionen pro Stunde
        alerts.push({
          severity: 'high',
          type: 'suspicious_activity',
          message: `Nutzer ${userId} hat ${count} Aktionen in der letzten Stunde ausgeführt (möglicher Bot)`,
          action: 'rate_limit_check'
        });
      }
    }

    // 2. Massenhafte Listings von einem Nutzer
    const recentListings = await base44.asServiceRole.entities.Listing.filter(
      { created_date: { $gte: new Date(Date.now() - 60 * 60 * 1000).toISOString() } },
      '-created_date',
      100
    );

    const listingsByUser = {};
    for (const listing of recentListings) {
      listingsByUser[listing.created_by] = (listingsByUser[listing.created_by] || 0) + 1;
    }

    for (const [userId, count] of Object.entries(listingsByUser)) {
      if (count > 10) {
        alerts.push({
          severity: 'medium',
          type: 'mass_listing',
          message: `Nutzer ${userId} hat ${count} Anzeigen in der letzten Stunde erstellt`,
          action: 'review_listings'
        });
      }
    }

    // 3. Ungewöhnliche Transaktionsmuster
    const recentTransactions = await base44.asServiceRole.entities.Transaction.filter(
      { created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } },
      '-created_date',
      100
    );

    const failedTransactions = recentTransactions.filter(t => t.status === 'failed');
    if (failedTransactions.length > 10) {
      alerts.push({
        severity: 'high',
        type: 'transaction_failures',
        message: `${failedTransactions.length} fehlgeschlagene Transaktionen in den letzten 24h`,
        action: 'check_payment_gateway'
      });
    }

    // 4. Ausstehende Moderationsaufgaben
    const pendingModeration = await base44.asServiceRole.entities.Listing.filter({
      moderationStatus: 'pending'
    });

    if (pendingModeration.length > 20) {
      alerts.push({
        severity: 'medium',
        type: 'moderation_backlog',
        message: `${pendingModeration.length} Anzeigen warten auf Moderation`,
        action: 'process_moderation_queue'
      });
    }

    // 5. Flagged Messages
    const flaggedMessages = await base44.asServiceRole.entities.ChatMessage.filter({
      flagged: true,
      created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
    });

    if (flaggedMessages.length > 5) {
      alerts.push({
        severity: 'high',
        type: 'content_moderation',
        message: `${flaggedMessages.length} verdächtige Nachrichten in den letzten 24h`,
        action: 'review_flagged_content'
      });
    }

    // 6. Offene Disputes
    const openDisputes = await base44.asServiceRole.entities.Dispute.filter({
      status: 'open'
    });

    if (openDisputes.length > 5) {
      alerts.push({
        severity: 'high',
        type: 'dispute_resolution',
        message: `${openDisputes.length} offene Streitfälle benötigen Aufmerksamkeit`,
        action: 'resolve_disputes'
      });
    }

    // 7. System Errors
    const recentErrors = await base44.asServiceRole.entities.SystemLog.filter({
      level: 'error',
      created_date: { $gte: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
    });

    if (recentErrors.length > 10) {
      alerts.push({
        severity: 'critical',
        type: 'system_errors',
        message: `${recentErrors.length} System-Fehler in der letzten Stunde`,
        action: 'investigate_errors'
      });
    }

    // KI-Analyse für komplexe Muster
    if (alerts.length > 0) {
      const aiPrompt = `Analysiere diese System-Alerts und priorisiere sie. Gib Empfehlungen für sofortige Maßnahmen.

Alerts:
${alerts.map(a => `[${a.severity}] ${a.type}: ${a.message}`).join('\n')}

Bewerte die Dringlichkeit und schlage vor, welche Alerts zuerst behandelt werden sollten.`;

      try {
        const aiAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: aiPrompt,
          response_json_schema: {
            type: 'object',
            properties: {
              priorityAlerts: {
                type: 'array',
                items: { type: 'string' },
                description: 'Alert-Typen nach Priorität sortiert'
              },
              recommendations: { 
                type: 'string',
                description: 'Sofortmaßnahmen-Empfehlungen'
              },
              riskLevel: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                description: 'Gesamtrisikoniveau'
              }
            }
          }
        });

        // Benachrichtige alle Admins
        const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
        
        for (const admin of admins) {
          await base44.asServiceRole.functions.invoke('sendNotification', {
            userId: admin.email,
            type: 'status_update',
            title: `🚨 ${alerts.length} System-Alert(s) [${aiAnalysis.riskLevel.toUpperCase()}]`,
            message: aiAnalysis.recommendations || `${alerts.length} Ereignisse benötigen Admin-Aufmerksamkeit`,
            linkUrl: '/AdminDashboard'
          });
        }

        return Response.json({
          success: true,
          alerts,
          analysis: aiAnalysis,
          notifiedAdmins: admins.length
        });
      } catch (err) {
        console.error('AI analysis error:', err);
      }
    }

    return Response.json({
      success: true,
      alerts,
      message: alerts.length === 0 ? 'Keine kritischen Ereignisse erkannt' : `${alerts.length} Alerts generiert`
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});