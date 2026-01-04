import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Gift, Truck, Zap, Crown, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function LoyaltyProgram() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: loyaltyAccount, isLoading } = useQuery({
    queryKey: ['loyaltyAccount', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.LoyaltyAccount.filter({ userId: user.email });
      if (accounts.length === 0) {
        return await base44.entities.LoyaltyAccount.create({
          userId: user.email,
          points: 0,
          totalPointsEarned: 0,
          tier: 'bronze',
          tierProgress: 0
        });
      }
      return accounts[0];
    },
    enabled: !!user
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['loyaltyTransactions', user?.email],
    queryFn: () => base44.entities.LoyaltyTransaction.filter({ userId: user.email }, '-created_date', 50),
    enabled: !!user
  });

  const tiers = {
    bronze: {
      name: 'Bronzo',
      icon: Award,
      color: 'from-amber-700 to-amber-900',
      textColor: 'text-amber-900',
      bgColor: 'bg-amber-100',
      minPoints: 0,
      maxPoints: 500,
      benefits: ['1 punto ogni 1€ speso', 'Accesso al programma fedeltà']
    },
    silver: {
      name: 'Argento',
      icon: Star,
      color: 'from-slate-400 to-slate-600',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-100',
      minPoints: 500,
      maxPoints: 2000,
      benefits: ['1.5 punti ogni 1€ speso', '5% sconto su tutti gli acquisti', 'Accesso anticipato saldi']
    },
    gold: {
      name: 'Oro',
      icon: Trophy,
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-yellow-900',
      bgColor: 'bg-yellow-100',
      minPoints: 2000,
      maxPoints: 5000,
      benefits: ['2 punti ogni 1€ speso', '10% sconto su tutti gli acquisti', 'Spedizione gratuita', 'Supporto prioritario']
    },
    platinum: {
      name: 'Platino',
      icon: Crown,
      color: 'from-purple-500 to-purple-700',
      textColor: 'text-purple-900',
      bgColor: 'bg-purple-100',
      minPoints: 5000,
      maxPoints: 99999,
      benefits: ['3 punti ogni 1€ speso', '15% sconto su tutti gli acquisti', 'Spedizione gratuita prioritaria', 'Accesso VIP eventi esclusivi', 'Regalo di compleanno']
    }
  };

  const currentTier = tiers[loyaltyAccount?.tier || 'bronze'];
  const tierKeys = Object.keys(tiers);
  const currentTierIndex = tierKeys.indexOf(loyaltyAccount?.tier || 'bronze');
  const nextTierKey = tierKeys[currentTierIndex + 1];
  const nextTier = nextTierKey ? tiers[nextTierKey] : null;

  const pointsToNextTier = nextTier ? nextTier.minPoints - (loyaltyAccount?.totalPointsEarned || 0) : 0;
  const progressPercent = nextTier 
    ? ((loyaltyAccount?.totalPointsEarned || 0) - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints) * 100
    : 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const CurrentIcon = currentTier.icon;

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Programma Fedeltà</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`lg:col-span-2 bg-gradient-to-br ${currentTier.color} text-white`}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CurrentIcon className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">{currentTier.name}</h3>
                </div>
                <p className="text-white/90 text-sm">Il tuo livello attuale</p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {loyaltyAccount?.totalPointsEarned || 0} punti totali
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progressione verso {nextTier?.name || 'Livello massimo'}</span>
                  <span className="font-bold">
                    {nextTier ? `${pointsToNextTier} punti mancanti` : 'Livello massimo raggiunto!'}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3 bg-white/20" />
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg">Punti disponibili</span>
                  <span className="text-4xl font-bold">{loyaltyAccount?.points || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vantaggi attivi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentTier.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className={`h-6 w-6 rounded-full ${currentTier.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Zap className={`h-3 w-3 ${currentTier.textColor}`} />
                  </div>
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tutti i livelli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(tiers).map(([key, tier]) => {
                const TierIcon = tier.icon;
                const isCurrentTier = key === loyaltyAccount?.tier;
                const isPastTier = tierKeys.indexOf(key) < currentTierIndex;

                return (
                  <div 
                    key={key}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentTier 
                        ? `${tier.bgColor} border-current` 
                        : isPastTier 
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TierIcon className={`h-5 w-5 ${isCurrentTier || isPastTier ? tier.textColor : 'text-slate-400'}`} />
                        <span className="font-semibold">{tier.name}</span>
                        {isCurrentTier && (
                          <Badge className={tier.bgColor}>Attuale</Badge>
                        )}
                      </div>
                      <span className="text-sm text-slate-600">
                        {tier.minPoints}+ punti
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      {tier.benefits.slice(0, 2).map((b, i) => (
                        <div key={i}>• {b}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Come guadagnare punti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Effettua acquisti</p>
                  <p className="text-sm text-green-700">Guadagna punti in base al tuo livello per ogni euro speso</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Lascia recensioni</p>
                  <p className="text-sm text-blue-700">Guadagna 50 punti per ogni recensione verificata</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-900">Invita amici</p>
                  <p className="text-sm text-purple-700">Guadagna 200 punti per ogni amico che effettua un acquisto</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronologia punti</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center py-8 text-slate-500">Nessuna transazione ancora</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{tx.reason}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(tx.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      tx.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </p>
                    <p className="text-xs text-slate-500">
                      Saldo: {tx.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}