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

    // Get comprehensive user context for better support
    const listings = await base44.entities.Listing.filter({ created_by: user.email }, '-created_date', 5);
    const orders = await base44.entities.Order.filter({ userId: user.email }, '-created_date', 5);
    const tickets = await base44.entities.SupportTicket.filter({ userId: user.email }, '-created_date', 3);
    const faqs = await base44.asServiceRole.entities.FAQ.filter({ active: true });
    
    // Get platform documentation/knowledge base
    const knowledgeBase = `
COME FUNZIONA ZAZARAP:
- Zazarap è un marketplace sicuro per comprare e vendere prodotti usati
- Protezione acquirenti con PayPal ed Escrow
- Sistema di moderazione AI per sicurezza
- Chat integrata tra acquirenti e venditori

PUBBLICARE ANNUNCI:
- Crea annuncio con titolo, descrizione, prezzo e foto
- Annunci gratuiti, opzioni premium disponibili
- Moderazione automatica per contenuti appropriati
- Suggerimenti AI per ottimizzare annunci

COMPRARE PRODOTTI:
- Cerca prodotti per categoria, prezzo, località
- Contatta venditori tramite chat interna
- Pagamento sicuro con PayPal o Escrow
- Tracking spedizione in tempo reale

PAGAMENTI E SICUREZZA:
- PayPal: protezione acquirenti integrata
- Escrow: fondi trattenuti fino a consegna confermata
- Sistema anti-frode AI
- Valutazioni e recensioni verificate

SPEDIZIONI:
- Accordo diretto con venditore
- Tracking automatico disponibile
- Feedback consegna per migliorare servizio

PROBLEMI E DISPUTE:
- Centro dispute per risolvere controversie
- Supporto ticket per problemi complessi
- Rimborsi gestiti tramite PayPal/Escrow

PROGRAMMA FEDELTÀ:
- Guadagna punti con acquisti e vendite
- Livelli Bronze, Silver, Gold, Platinum
- Sconti e vantaggi esclusivi

PROMOZIONI ANNUNCI:
- Annunci in evidenza: maggiore visibilità
- Top Anzeige: posizionamento prioritario
- Piani giornalieri, settimanali o mensili
`;


    // Build comprehensive context for AI
    const context = {
      userEmail: user.email,
      userRole: user.role,
      recentListings: listings.length,
      recentOrders: orders.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      conversationHistory: messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')
    };

    // Enhanced AI Prompt with knowledge base
    const prompt = `Sei Zazarap AI Assistant, un assistente virtuale esperto per il marketplace Zazarap. Sei disponibile 24/7 e sei addestrato su tutta la documentazione della piattaforma.

CONTESTO UTENTE:
- Email: ${context.userEmail}
- Ruolo: ${context.userRole}
- Annunci pubblicati: ${context.recentListings}
- Ordini effettuati: ${context.recentOrders}
- Ticket aperti: ${context.openTickets}

CONVERSAZIONE CORRENTE:
${context.conversationHistory}

KNOWLEDGE BASE PIATTAFORMA:
${knowledgeBase}

FAQ PIÙ COMUNI:
${faqs.slice(0, 15).map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}

DOMANDA UTENTE: "${message}"

ISTRUZIONI OPERATIVE:
1. Analizza la domanda e identifica l'intento (informazioni, problema tecnico, dispute, pagamenti, etc.)
2. Rispondi utilizzando la knowledge base e le FAQ quando pertinenti
3. Fornisci risposte complete, chiare e actionable con passi specifici
4. Se la domanda riguarda problemi complessi (dispute, pagamenti, sicurezza account, problemi tecnici gravi), suggerisci di creare un ticket
5. Mantieni tono professionale, cordiale e rassicurante
6. Usa emoji occasionalmente per essere friendly (max 1-2 per messaggio)
7. Fornisci link interni utili quando appropriato (es: /ListingDetail, /UserSettings, /FAQ)
8. Se l'utente è frustrato o arrabbiato, mostra empatia e offri soluzioni immediate

CRITERI ESCALATION:
- Dispute di pagamento → ESCALATE
- Problemi di sicurezza account → ESCALATE  
- Frodi sospette → ESCALATE
- Bug tecnici critici → ESCALATE
- Richieste di rimborso → ESCALATE
- Problemi irrisolti dopo 3+ messaggi → ESCALATE

Rispondi in italiano con un approccio customer-first.`;

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