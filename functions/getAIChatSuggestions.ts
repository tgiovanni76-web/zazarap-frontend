import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, buyerMessage } = await req.json();

    // Get chat and messages
    const chats = await base44.entities.Chat.filter({ id: chatId });
    if (!chats || chats.length === 0) {
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }
    const chat = chats[0];

    // Verify user is seller
    if (chat.sellerId !== user.email) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get chat messages
    const messages = await base44.entities.ChatMessage.filter({ chatId }, '-created_date', 10);
    
    // Get listing details
    const listings = await base44.entities.Listing.filter({ id: chat.listingId });
    const listing = listings[0];

    // Build context for AI
    const conversationHistory = messages
      .reverse()
      .map(m => `${m.senderId === chat.sellerId ? 'Venditore' : 'Acquirente'}: ${m.text || ''}${m.price ? ` (Offerta: €${m.price})` : ''}`)
      .join('\n');

    const prompt = `Sei un assistente AI per un marketplace. Aiuta il venditore a rispondere in modo professionale ed efficace.

CONTESTO:
Annuncio: ${listing.title}
Prezzo richiesto: €${listing.price}
${listing.offerPrice ? `Prezzo in offerta: €${listing.offerPrice}` : ''}
Ultima offerta: ${chat.lastPrice ? `€${chat.lastPrice}` : 'Nessuna'}
Stato trattativa: ${chat.status}

STORICO CONVERSAZIONE:
${conversationHistory}

ULTIMO MESSAGGIO ACQUIRENTE:
${buyerMessage}

Genera 3 risposte suggerite per il venditore:
1. Una risposta professionale e diretta
2. Una risposta che propone una controfferta (se appropriato)
3. Una risposta che chiede più informazioni all'acquirente

Inoltre, analizza se l'acquirente sembra:
- Seriamente interessato (score 1-10)
- Pronto ad acquistare (yes/no/maybe)
- Necessita di più informazioni (yes/no)

Rispondi in italiano.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                type: { type: 'string' },
                suggestedPrice: { type: 'number' }
              }
            }
          },
          buyerAnalysis: {
            type: 'object',
            properties: {
              interestScore: { type: 'number' },
              readyToBuy: { type: 'string' },
              needsMoreInfo: { type: 'string' },
              recommendation: { type: 'string' }
            }
          }
        }
      }
    });

    return Response.json({
      suggestions: aiResponse.suggestions,
      buyerAnalysis: aiResponse.buyerAnalysis,
      context: {
        listingPrice: listing.price,
        lastOffer: chat.lastPrice
      }
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});