import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode } = await req.json();

    // Find referral code
    const codes = await base44.asServiceRole.entities.ReferralCode.filter({
      code: referralCode,
      isActive: true
    });

    if (codes.length === 0) {
      return Response.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    const refCode = codes[0];
    const referrerId = refCode.userId;

    // Check if user already used a referral
    const existingConversions = await base44.entities.ReferralConversion.filter({
      referredUserId: user.email
    });

    if (existingConversions.length > 0) {
      return Response.json({ error: 'You have already used a referral code' }, { status: 400 });
    }

    // Calculate personalized rewards
    const rewardsResponse = await base44.functions.invoke('calculatePersonalizedRewards', {
      referredUserId: user.email
    });

    const rewards = rewardsResponse.data?.rewards || {
      referrerReward: 10,
      referredReward: 5,
      rewardType: 'credit'
    };

    // Create conversion
    const conversion = await base44.asServiceRole.entities.ReferralConversion.create({
      referrerId,
      referredUserId: user.email,
      referralCode,
      status: 'pending',
      referrerReward: rewards.referrerReward,
      referredReward: rewards.referredReward,
      rewardType: rewards.rewardType
    });

    // Update referral code stats
    await base44.asServiceRole.entities.ReferralCode.update(refCode.id, {
      invitesSent: refCode.invitesSent + 1
    });

    // Apply immediate reward to referred user
    if (rewards.referredReward > 0) {
      const loyaltyAccounts = await base44.entities.LoyaltyAccount.filter({
        userId: user.email
      });

      if (loyaltyAccounts.length > 0) {
        const account = loyaltyAccounts[0];
        await base44.asServiceRole.entities.LoyaltyAccount.update(account.id, {
          points: account.points + Math.floor(rewards.referredReward * 10)
        });

        await base44.asServiceRole.entities.LoyaltyTransaction.create({
          userId: user.email,
          points: Math.floor(rewards.referredReward * 10),
          type: 'bonus',
          reason: 'Bonus referral - benvenuto!',
          balanceAfter: account.points + Math.floor(rewards.referredReward * 10)
        });
      }
    }

    return Response.json({
      success: true,
      message: `Benvenuto! Hai ricevuto ${rewards.referredReward}€ di bonus`,
      conversion
    });

  } catch (error) {
    console.error('Referral processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});