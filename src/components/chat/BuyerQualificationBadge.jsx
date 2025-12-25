import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, Star, AlertTriangle, Sparkles } from 'lucide-react';

export default function BuyerQualificationBadge({ buyerId, compact = false }) {
  const { data: qualification } = useQuery({
    queryKey: ['buyerQualification', buyerId],
    queryFn: async () => {
      const res = await base44.functions.invoke('analyzeBuyerQualification', { buyerId });
      return res.data;
    },
    staleTime: 10 * 60 * 1000
  });

  if (!qualification) return null;

  const { category, reliabilityScore } = qualification.aiAnalysis;

  const configs = {
    excellent: { 
      icon: Star, 
      color: 'bg-green-100 text-green-800 border-green-300',
      label: '⭐ Top Buyer'
    },
    good: { 
      icon: Shield, 
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: '✓ Affidabile'
    },
    average: { 
      icon: Sparkles, 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: '~ Medio'
    },
    risky: { 
      icon: AlertTriangle, 
      color: 'bg-red-100 text-red-800 border-red-300',
      label: '⚠ Attenzione'
    },
    new: { 
      icon: Sparkles, 
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      label: '🆕 Nuovo'
    }
  };

  const config = configs[category] || configs.new;
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`${config.color} border text-xs`}>
              <Icon className="w-3 h-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-semibold mb-1">{config.label}</div>
              <div>Affidabilità: {reliabilityScore}/10</div>
              <div>Acquisti: {qualification.stats.completedPurchases}</div>
              <div>Conversione: {qualification.stats.conversionRate}%</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={`${config.color} border`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div className="font-semibold">Analisi Acquirente</div>
            <div>Score: {reliabilityScore}/10</div>
            <div>Acquisti completati: {qualification.stats.completedPurchases}</div>
            <div>Tasso conversione: {qualification.stats.conversionRate}%</div>
            {qualification.aiAnalysis.advice && (
              <div className="mt-2 pt-2 border-t">
                <div className="italic">{qualification.aiAnalysis.advice}</div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}