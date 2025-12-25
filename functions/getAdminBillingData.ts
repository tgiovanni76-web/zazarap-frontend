import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all data using service role
    const [transactions, promotions, paymentMethods, invoices, users] = await Promise.all([
      base44.asServiceRole.entities.Transaction.list('-created_date', 100),
      base44.asServiceRole.entities.ListingPromotion.list('-created_date', 100),
      base44.asServiceRole.entities.PaymentMethod.list('-created_date', 100),
      base44.asServiceRole.entities.Invoice.list('-created_date', 100),
      base44.asServiceRole.entities.User.list()
    ]);

    // Calculate stats
    const totalRevenue = transactions
      .filter(t => t.status === 'paid' || t.status === 'captured')
      .reduce((sum, t) => sum + t.amount, 0);

    const activeSubscriptions = promotions.filter(p => 
      p.autoRenew && 
      p.status === 'paid' && 
      new Date(p.endDate) > new Date()
    ).length;

    const monthlyRecurringRevenue = promotions
      .filter(p => p.autoRenew && p.status === 'paid' && new Date(p.endDate) > new Date())
      .reduce((sum, p) => {
        const dailyRate = p.amount / p.durationDays;
        if (p.renewalFrequency === 'weekly') return sum + (dailyRate * 7);
        if (p.renewalFrequency === 'monthly') return sum + (dailyRate * 30);
        return sum;
      }, 0);

    const totalUsers = users.length;
    const payingUsers = [...new Set(transactions.map(t => t.userId))].length;

    // Recent activity
    const recentTransactions = transactions.slice(0, 20).map(t => {
      const userObj = users.find(u => u.email === t.userId);
      return {
        ...t,
        userName: userObj?.full_name || t.userId
      };
    });

    const recentPromotions = promotions.slice(0, 20).map(p => {
      const userObj = users.find(u => u.email === p.created_by);
      return {
        ...p,
        userName: userObj?.full_name || p.created_by
      };
    });

    // User payment methods summary
    const userPaymentMethodsSummary = users.map(u => {
      const methods = paymentMethods.filter(pm => pm.userId === u.email && pm.isActive);
      const userTransactions = transactions.filter(t => t.userId === u.email);
      const totalSpent = userTransactions
        .filter(t => t.status === 'paid' || t.status === 'captured')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        userId: u.email,
        userName: u.full_name,
        paymentMethodsCount: methods.length,
        totalSpent,
        lastTransaction: userTransactions[0]?.created_date || null
      };
    }).filter(u => u.paymentMethodsCount > 0 || u.totalSpent > 0);

    return Response.json({
      stats: {
        totalRevenue,
        activeSubscriptions,
        monthlyRecurringRevenue,
        totalUsers,
        payingUsers,
        conversionRate: totalUsers > 0 ? (payingUsers / totalUsers * 100).toFixed(1) : 0
      },
      recentTransactions,
      recentPromotions,
      userPaymentMethodsSummary,
      invoices: invoices.slice(0, 20)
    });

  } catch (error) {
    console.error('Error fetching admin billing data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});