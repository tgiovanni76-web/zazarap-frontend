import { base44 } from '@/api/base44Client';

// Validazioni anti-frode
export async function checkAntifraud(user, transaction) {
  const checks = [];

  // 1. Verifica email
  const verification = await base44.entities.UserVerification.filter({ userId: user.email });
  if (!verification[0]?.emailVerified) {
    checks.push({ 
      type: 'warning', 
      message: 'Email non verificata. Verifica per aumentare affidabilità.' 
    });
  }

  // 2. Trust score basso
  if (verification[0]?.trustScore < 30) {
    checks.push({ 
      type: 'error', 
      message: 'Trust score troppo basso. Contatta il supporto.' 
    });
  }

  // 3. Transazioni sospette recenti
  const recentPayments = await base44.entities.Payment.filter({ 
    buyerId: user.email 
  });
  
  const last24h = recentPayments.filter(p => {
    const diff = Date.now() - new Date(p.created_date).getTime();
    return diff < 24 * 60 * 60 * 1000;
  });

  if (last24h.length > 5) {
    checks.push({ 
      type: 'error', 
      message: 'Troppe transazioni in 24h. Attendi prima di procedere.' 
    });
  }

  // 4. Importo sospetto
  if (transaction.amount > 1000 && !verification[0]?.identityVerified) {
    checks.push({ 
      type: 'warning', 
      message: 'Transazioni sopra 1000€ richiedono verifica identità.' 
    });
  }

  // 5. Check dispute history
  const disputes = await base44.entities.Dispute.filter({ 
    reporterId: user.email 
  });
  
  const openDisputes = disputes.filter(d => d.status === 'open');
  if (openDisputes.length > 2) {
    checks.push({ 
      type: 'error', 
      message: 'Hai dispute aperte. Risolvile prima di nuove transazioni.' 
    });
  }

  return {
    passed: !checks.some(c => c.type === 'error'),
    warnings: checks.filter(c => c.type === 'warning'),
    errors: checks.filter(c => c.type === 'error'),
    allChecks: checks
  };
}

// Rate limiting (client-side per UX)
const rateLimitStore = new Map();

export function checkRateLimit(userId, action, maxCount = 10, windowMs = 60000) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const timestamps = rateLimitStore.get(key).filter(t => now - t < windowMs);
  
  if (timestamps.length >= maxCount) {
    return {
      allowed: false,
      message: `Troppi tentativi. Riprova tra ${Math.ceil((timestamps[0] + windowMs - now) / 1000)}s`
    };
  }
  
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  
  return { allowed: true };
}