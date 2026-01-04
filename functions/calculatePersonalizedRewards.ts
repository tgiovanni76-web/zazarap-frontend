import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referredUserId } = await req.json();

    // Get referrer data
    const referrerListings = await base44.entities.Listing.filter({
      created_by: user.email
    });

    const referrerOrders = await base44.entities.Order.filter({
      userId: user.email
    });

    const referrerLoyalty = await base44.entities.LoyaltyAccount.filter({
      userId: user.email
    });

    // Get referred user data (if they have activity)
    const referredActivities = await base44.asServiceRole.entities.UserActivity.filter({
      userId: referredUserId
    }, '-created_date', 20);

    const referredListings = await base44.asServiceRole.entities.Listing.filter({
      created_by: referredUserId
    });

    const prompt = `Calcola ricompense personalizzate per un referral basandoti sui comportamenti.

REFERRER (chi invita):
- Annunci pubblicati: ${referrerListings.length}
- Ordini completati: ${referrerOrders.length}
- Livello fedeltà: ${referrerLoyalty[0]?.tier || 'bronze'}

REFERRED (invitato):
- Attività sulla piattaforma: ${referredActivities.length}
- Annunci pubblicati: ${referredListings.length}

TASK: Calcola ricompense ottimali considerando:
1. Valore potenziale dell'utente invitato
2. Storico e fedeltà del referrer
3. Attività dell'invitato sulla piattaforma

Fornisci ricompense specifiche in EUR per entrambi.`;

    const rewards = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          referrerReward: { type: "number" },
          referredReward: { type: "number" },
          rewardType: { type: "string" },
          reasoning: { type: "string" },
          bonusConditions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      rewards
    });

  } catch (error) {
    console.error('Rewards calculation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});