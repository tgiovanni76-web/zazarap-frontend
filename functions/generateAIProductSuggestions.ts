import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();
    
    let notificationsSent = 0;

    for (const user of users.slice(0, 50)) { // Process 50 users per run
      try {
        // Get user's activity
        const activities = await base44.asServiceRole.entities.UserActivity.filter({
          userId: user.email
        }, '-created_date', 30);

        const favorites = await base44.asServiceRole.entities.Favorite.filter({
          user_email: user.email
        });

        if (activities.length < 3 && favorites.length === 0) continue;

        // Get all listings
        const listings = await base44.asServiceRole.entities.Listing.filter({
          status: 'active',
          moderationStatus: 'approved'
        }, '-created_date', 100);

        // Get user's categories of interest
        const categories = [
          ...new Set([
            ...activities.map(a => a.category).filter(Boolean),
            ...favorites.map(f => f.listingTitle).filter(Boolean)
          ])
        ];

        // Ask AI to suggest products
        const prompt = `Analizza le attività dell'utente e suggerisci 3 prodotti dal marketplace.

INTERESSI UTENTE:
- Categorie visualizzate: ${categories.join(', ')}
- Numero attività: ${activities.length}
- Numero preferiti: ${favorites.length}

PRODOTTI DISPONIBILI:
${listings.slice(0, 20).map(l => `- ${l.title} (${l.category}, ${l.price}€)`).join('\n')}

Seleziona 3 prodotti che potrebbero interessare all'utente e spiega perché.`;

        const suggestions = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    listingTitle: { type: "string" },
                    reason: { type: "string" },
                    relevanceScore: { type: "number" }
                  }
                }
              }
            }
          }
        });

        // Send notification for top suggestion
        if (suggestions.suggestions && suggestions.suggestions.length > 0) {
          const topSuggestion = suggestions.suggestions[0];
          const listing = listings.find(l => l.title === topSuggestion.listingTitle);

          if (listing) {
            await base44.functions.invoke('generateSmartNotifications', {
              userId: user.email,
              type: 'product_suggestion',
              context: {
                listingId: listing.id,
                listingTitle: listing.title,
                listingPrice: listing.price,
                reason: topSuggestion.reason,
                actionUrl: `/listing?id=${listing.id}`
              }
            });

            notificationsSent++;
          }
        }

      } catch (userError) {
        console.log(`Error processing user ${user.email}:`, userError);
      }
    }

    return Response.json({
      success: true,
      usersProcessed: Math.min(50, users.length),
      notificationsSent
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});