import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { buyerId } = await req.json();

    // Get buyer's history
    const buyerChats = await base44.entities.Chat.filter({ buyerId }, '-created_date', 50);
    const buyerMessages = await base44.entities.ChatMessage.filter({ senderId: buyerId }, '-created_date', 100);
    const buyerReviews = await base44.entities.SellerReview.filter({ buyerId });

    // Calculate metrics
    const totalChats = buyerChats.length;
    const completedPurchases = buyerChats.filter(c => c.status === 'completata').length;
    const cancelledChats = buyerChats.filter(c => c.status === 'rifiutata').length;
    const conversionRate = totalChats > 0 ? (completedPurchases / totalChats * 100).toFixed(1) : 0;
    
    const averageResponseTime = buyerMessages.length > 1 
      ? calculateAverageResponseTime(buyerMessages)
      : 'Unknown';

    const averageReviewsGiven = buyerReviews.length > 0
      ? (buyerReviews.reduce((sum, r) => sum + r.rating, 0) / buyerReviews.length).toFixed(1)
      : null;

    // AI Analysis
    const analysisPrompt = `Analizza questo acquirente su un marketplace:

STATISTICHE:
- Chat totali: ${totalChats}
- Acquisti completati: ${completedPurchases}
- Trattative annullate: ${cancelledChats}
- Tasso conversione: ${conversionRate}%
- Recensioni lasciate: ${buyerReviews.length}
${averageReviewsGiven ? `- Media recensioni date: ${averageReviewsGiven}/5` : ''}

Fornisci un punteggio di affidabilità (1-10) e una categoria:
- "excellent": acquirente ideale, rapido e affidabile
- "good": buon acquirente, probabilmente concluderà
- "average": acquirente medio, potrebbe concludere
- "risky": acquirente che spesso non conclude
- "new": acquirente nuovo, nessuno storico

Aggiungi anche un breve consiglio per il venditore.`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reliabilityScore: { type: 'number' },
          category: { type: 'string' },
          advice: { type: 'string' }
        }
      }
    });

    return Response.json({
      buyerId,
      stats: {
        totalChats,
        completedPurchases,
        cancelledChats,
        conversionRate: parseFloat(conversionRate),
        averageResponseTime,
        reviewsGiven: buyerReviews.length,
        averageReviewsGiven: averageReviewsGiven ? parseFloat(averageReviewsGiven) : null
      },
      aiAnalysis: {
        reliabilityScore: aiAnalysis.reliabilityScore,
        category: aiAnalysis.category,
        advice: aiAnalysis.advice
      }
    });

  } catch (error) {
    console.error('Buyer qualification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateAverageResponseTime(messages) {
  // Simple calculation based on message timestamps
  if (messages.length < 2) return 'Unknown';
  
  const intervals = [];
  for (let i = 1; i < Math.min(messages.length, 10); i++) {
    const diff = new Date(messages[i-1].created_date) - new Date(messages[i].created_date);
    intervals.push(Math.abs(diff));
  }
  
  const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const avgMinutes = Math.floor(avgMs / 1000 / 60);
  
  if (avgMinutes < 60) return `${avgMinutes} minuti`;
  const avgHours = Math.floor(avgMinutes / 60);
  if (avgHours < 24) return `${avgHours} ore`;
  return `${Math.floor(avgHours / 24)} giorni`;
}