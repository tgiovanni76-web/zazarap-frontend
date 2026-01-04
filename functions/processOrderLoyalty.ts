import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TIER_MULTIPLIERS = {
  bronze: 1,
  silver: 1.5,
  gold: 2,
  platinum: 3
};

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000
};

function calculateTier(totalPoints) {
  if (totalPoints >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (totalPoints >= TIER_THRESHOLDS.gold) return 'gold';
  if (totalPoints >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { orderId, userId, amount } = await req.json();

    if (!orderId || !userId || !amount) {
      return Response.json({ 
        success: false, 
        message: 'Parametri mancanti' 
      }, { status: 400 });
    }

    // Get or create loyalty account
    let accounts = await base44.asServiceRole.entities.LoyaltyAccount.filter({ userId });
    let account;
    
    if (accounts.length === 0) {
      account = await base44.asServiceRole.entities.LoyaltyAccount.create({
        userId,
        points: 0,
        totalPointsEarned: 0,
        tier: 'bronze',
        tierProgress: 0
      });
    } else {
      account = accounts[0];
    }

    // Calculate points based on tier multiplier
    const multiplier = TIER_MULTIPLIERS[account.tier] || 1;
    const pointsEarned = Math.floor(amount * multiplier);

    // Update account
    const newPoints = account.points + pointsEarned;
    const newTotalPoints = account.totalPointsEarned + pointsEarned;
    const newTier = calculateTier(newTotalPoints);
    const tierUpgraded = newTier !== account.tier;

    await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
      points: newPoints,
      totalPointsEarned: newTotalPoints,
      tier: newTier
    });

    // Create transaction record
    await base44.asServiceRole.entities.LoyaltyTransaction.create({
      userId,
      points: pointsEarned,
      type: 'earn',
      reason: `Acquisto ordine #${orderId}`,
      relatedOrderId: orderId,
      balanceAfter: newPoints
    });

    // If tier upgraded, add bonus
    if (tierUpgraded) {
      const bonusPoints = 100;
      await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
        points: newPoints + bonusPoints
      });
      
      await base44.asServiceRole.entities.LoyaltyTransaction.create({
        userId,
        points: bonusPoints,
        type: 'bonus',
        reason: `Bonus per passaggio a livello ${newTier.toUpperCase()}`,
        balanceAfter: newPoints + bonusPoints
      });
    }

    return Response.json({
      success: true,
      pointsEarned,
      newBalance: newPoints,
      tier: newTier,
      tierUpgraded,
      message: tierUpgraded 
        ? `Congratulazioni! Sei passato al livello ${newTier.toUpperCase()}! +${pointsEarned + 100} punti`
        : `Hai guadagnato ${pointsEarned} punti!`
    });

  } catch (error) {
    console.error('Loyalty processing error:', error);
    return Response.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
});