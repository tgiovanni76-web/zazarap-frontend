import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { ticketId } = await req.json();

    if (!ticketId) {
      return Response.json({ error: 'ticketId required' }, { status: 400 });
    }

    // Get ticket
    const tickets = await base44.asServiceRole.entities.SupportTicket.filter({ id: ticketId });
    const ticket = tickets[0];

    if (!ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // AI routing analysis
    const routingPrompt = `Sei un sistema AI di routing per ticket di supporto di Zazarap marketplace.

TICKET:
Soggetto: ${ticket.subject}
Descrizione: ${ticket.description}
Categoria attuale: ${ticket.category || 'Non specificata'}
Priorità: ${ticket.priority || 'normal'}

COMPITO:
Analizza il ticket e determina:
1. Il dipartimento più appropriato per gestirlo
2. La priorità corretta (low, normal, high, urgent)
3. Una risposta preliminare utile per l'utente
4. Tag rilevanti per categorizzazione
5. Tempo stimato di risoluzione

DIPARTIMENTI DISPONIBILI:
- technical: problemi tecnici, bug, errori piattaforma
- payments: pagamenti, rimborsi, transazioni, Escrow
- moderation: segnalazioni contenuti, spam, frodi
- disputes: controversie acquirente-venditore
- account: accesso account, password, dati personali
- general: domande generali, informazioni

Fornisci un'analisi completa e actionable.`;

    const routingResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: routingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          department: {
            type: "string",
            enum: ["technical", "payments", "moderation", "disputes", "account", "general"]
          },
          priority: {
            type: "string",
            enum: ["low", "normal", "high", "urgent"]
          },
          preliminaryResponse: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          estimatedResolutionTime: { type: "string" },
          requiresEscalation: { type: "boolean" },
          suggestedActions: {
            type: "array",
            items: { type: "string" }
          },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative", "angry"]
          }
        }
      }
    });

    // Update ticket with AI routing
    const updateData = {
      category: routingResult.department,
      priority: routingResult.priority,
      tags: routingResult.tags,
      aiAnalysis: JSON.stringify({
        sentiment: routingResult.sentiment,
        estimatedResolutionTime: routingResult.estimatedResolutionTime,
        suggestedActions: routingResult.suggestedActions,
        analyzedAt: new Date().toISOString()
      })
    };

    await base44.asServiceRole.entities.SupportTicket.update(ticketId, updateData);

    // Send preliminary response to user if useful
    if (routingResult.preliminaryResponse && routingResult.preliminaryResponse.length > 50) {
      await base44.asServiceRole.entities.Notification.create({
        userId: ticket.userId,
        type: 'support_update',
        title: '🤖 Risposta Automatica al Ticket',
        message: routingResult.preliminaryResponse,
        relatedEntity: 'SupportTicket',
        relatedId: ticketId,
        priority: 'normal'
      });

      // Add as ticket message
      const currentMessages = ticket.messages || [];
      currentMessages.push({
        senderId: 'AI_SYSTEM',
        message: routingResult.preliminaryResponse,
        timestamp: new Date().toISOString(),
        isAutomatic: true
      });

      await base44.asServiceRole.entities.SupportTicket.update(ticketId, {
        messages: currentMessages
      });
    }

    // Notify appropriate team based on priority and department
    if (routingResult.priority === 'urgent' || routingResult.requiresEscalation) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'support@zazarap.com',
        subject: `🚨 URGENT: ${routingResult.department.toUpperCase()} Ticket`,
        body: `Ticket urgente richiede attenzione immediata:

ID: ${ticketId}
Dipartimento: ${routingResult.department}
Priorità: ${routingResult.priority}
Sentiment: ${routingResult.sentiment}

Soggetto: ${ticket.subject}

Azioni suggerite:
${routingResult.suggestedActions.map(a => `- ${a}`).join('\n')}

Link: https://app.zazarap.com/admin/tickets/${ticketId}`
      });
    }

    return Response.json({
      success: true,
      ticketId,
      routing: {
        department: routingResult.department,
        priority: routingResult.priority,
        sentiment: routingResult.sentiment,
        tags: routingResult.tags,
        estimatedResolutionTime: routingResult.estimatedResolutionTime,
        preliminaryResponse: routingResult.preliminaryResponse,
        suggestedActions: routingResult.suggestedActions
      }
    });

  } catch (error) {
    console.error('Ticket routing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});