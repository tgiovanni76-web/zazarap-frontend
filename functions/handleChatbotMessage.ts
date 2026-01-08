import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, message } = await req.json();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const convs = await base44.entities.ChatbotConversation.filter({ id: conversationId });
      conversation = convs[0];
    } else {
      conversation = await base44.entities.ChatbotConversation.create({
        userId: user.email,
        messages: [],
        status: 'active'
      });
    }

    // Add user message
    const messages = conversation.messages || [];
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Get user context
    const listings = await base44.entities.Listing.filter({ created_by: user.email }, '-created_date', 5);
    const orders = await base44.entities.Order.filter({ userId: user.email }, '-created_date', 5);
    const faqs = await base44.asServiceRole.entities.FAQ.list();

    // Build context for AI
    const context = {
      userEmail: user.email,
      userRole: user.role,
      recentListings: listings.length,
      recentOrders: orders.length,
      conversationHistory: messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')
    };

    // AI Prompt
    const prompt = `Sei un assistente AI per Zazarap, un marketplace online. Aiuta l'utente con professionalità e gentilezza.

CONTESTO UTENTE:
- Email: ${context.userEmail}
- Ruolo: ${context.userRole}
- Annunci recenti: ${context.recentListings}
- Ordini recenti: ${context.recentOrders}

CONVERSAZIONE PRECEDENTE:
${context.conversationHistory}

FAQ DISPONIBILI:
${faqs.slice(0, 10).map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

RICHIESTA UTENTE: ${message}

COMPITI:
1. Rispondi alla domanda dell'utente in modo chiaro e completo
2. Se la richiesta è complessa o richiede intervento umano, suggerisci di aprire un ticket
3. Usa le FAQ quando pertinenti
4. Fornisci link utili quando appropriato

IMPORTANTE: Se l'utente ha problemi complessi (dispute, pagamenti, account security), consiglia di aprire un ticket di supporto.

Rispondi in italiano, in modo cordiale e professionale.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          shouldEscalate: { type: "boolean" },
          escalationReason: { type: "string" },
          category: { type: "string" },
          sentiment: { 
            type: "string",
            enum: ["positive", "neutral", "negative"]
          },
          suggestedActions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Add AI response
    messages.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date().toISOString()
    });

    // Update conversation
    await base44.entities.ChatbotConversation.update(conversation.id, {
      messages,
      category: aiResponse.category,
      sentiment: aiResponse.sentiment
    });

    // Check if escalation needed
    let ticketId = null;
    if (aiResponse.shouldEscalate) {
      // Create support ticket
      const summary = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
      
      const ticket = await base44.asServiceRole.entities.SupportTicket.create({
        userId: user.email,
        subject: `Escalation Chatbot: ${aiResponse.category || 'Richiesta supporto'}`,
        description: `${aiResponse.escalationReason}\n\n--- CONVERSAZIONE ---\n${summary}`,
        status: 'open',
        priority: 'high',
        category: aiResponse.category || 'general'
      });

      ticketId = ticket.id;

      // Update conversation
      await base44.entities.ChatbotConversation.update(conversation.id, {
        status: 'escalated',
        escalatedToTicketId: ticketId
      });
    }

    return Response.json({
      success: true,
      conversationId: conversation.id,
      response: aiResponse.message,
      shouldEscalate: aiResponse.shouldEscalate,
      ticketId,
      suggestedActions: aiResponse.suggestedActions,
      sentiment: aiResponse.sentiment
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return Response.json({ 
      error: error.message,
      response: 'Mi dispiace, si è verificato un errore. Prova a riformulare la domanda o contatta il supporto.'
    }, { status: 500 });
  }
});