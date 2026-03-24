import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    const userId = targetUserId || user.email;

    // Get user data
    const [targetUser] = await base44.asServiceRole.entities.User.filter({ email: userId });
    
    // Get statistics
    const listings = await base44.asServiceRole.entities.Listing.filter({ created_by: userId });
    const orders = await base44.asServiceRole.entities.Order.filter({ userId });
    const ratings = await base44.asServiceRole.entities.UserRating.filter({ reviewedUserId: userId });
    const activities = await base44.asServiceRole.entities.UserActivity.filter({ userId });

    const badges = [];

    // Seller badges
    const activeSales = listings.filter(l => l.status === 'active').length;
    const completedSales = listings.filter(l => l.status === 'sold').length;
    
    if (completedSales >= 50) badges.push('🏆 Venditore Pro');
    else if (completedSales >= 20) badges.push('⭐ Venditore Esperto');
    else if (completedSales >= 5) badges.push('✨ Venditore Affidabile');
    
    if (activeSales >= 10) badges.push('📦 Catalogo Ricco');

    // Buyer badges
    const completedPurchases = orders.filter(o => o.status === 'delivered').length;
    
    if (completedPurchases >= 30) badges.push('🛍️ Super Shopper');
    else if (completedPurchases >= 10) badges.push('🛒 Acquirente Frequente');
    else if (completedPurchases >= 3) badges.push('💳 Acquirente Fidato');

    // Rating badges
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;
    
    if (avgRating >= 4.8 && ratings.length >= 10) badges.push('⭐⭐⭐⭐⭐ 5 Stelle');
    else if (avgRating >= 4.5 && ratings.length >= 5) badges.push('🌟 Top Rated');

    // Activity badges
    if (activities.length >= 100) badges.push('🔥 Utente Attivo');
    
    // Time-based badges
    const accountAge = Date.now() - new Date(targetUser.created_date).getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysOld >= 365) badges.push('🎂 Veterano (1+ anno)');
    else if (daysOld >= 180) badges.push('📅 Membro di Lunga Data');

    // Verification badges
    if (targetUser.verifiedEmail) badges.push('✅ Email Verificata');
    if (targetUser.verifiedPhone) badges.push('📱 Telefono Verificato');

    // Loyalty badges
    const loyaltyAccounts = await base44.asServiceRole.entities.LoyaltyAccount.filter({ userId });
    if (loyaltyAccounts.length > 0) {
      const tier = loyaltyAccounts[0].tier;
      if (tier === 'platinum') badges.push('💎 Platinum Member');
      else if (tier === 'gold') badges.push('🥇 Gold Member');
      else if (tier === 'silver') badges.push('🥈 Silver Member');
    }

    // Update user badges
    await base44.asServiceRole.entities.User.update(targetUser.id, { badges });

    return Response.json({
      success: true,
      badges,
      stats: {
        completedSales,
        completedPurchases,
        avgRating: avgRating.toFixed(1),
        totalReviews: ratings.length
      }
    });

  } catch (error) {
    console.error('Badge calculation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});