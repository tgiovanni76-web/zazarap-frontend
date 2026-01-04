import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { Award, Star, Trophy, Crown } from 'lucide-react';

export default function LoyaltyBadge({ user, showPoints = true }) {
  const { data: loyaltyAccount } = useQuery({
    queryKey: ['loyaltyAccount', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.LoyaltyAccount.filter({ userId: user.email });
      return accounts[0] || null;
    },
    enabled: !!user
  });

  if (!loyaltyAccount) return null;

  const tierConfig = {
    bronze: { icon: Award, color: 'bg-amber-100 text-amber-900', label: 'Bronzo' },
    silver: { icon: Star, color: 'bg-slate-100 text-slate-700', label: 'Argento' },
    gold: { icon: Trophy, color: 'bg-yellow-100 text-yellow-900', label: 'Oro' },
    platinum: { icon: Crown, color: 'bg-purple-100 text-purple-900', label: 'Platino' }
  };

  const config = tierConfig[loyaltyAccount.tier] || tierConfig.bronze;
  const TierIcon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <TierIcon className="h-3 w-3" />
      {config.label}
      {showPoints && ` • ${loyaltyAccount.points} pt`}
    </Badge>
  );
}