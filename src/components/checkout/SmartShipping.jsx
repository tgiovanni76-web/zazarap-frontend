import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Zap, Clock, Shield, CheckCircle2, Sparkles } from 'lucide-react';

export default function SmartShipping({ address, cartTotal, onSelectCarrier }) {
  const [optimization, setOptimization] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  useEffect(() => {
    if (address) {
      optimizeShipping();
    }
  }, [address, cartTotal]);

  const optimizeShipping = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('optimizeShipping', {
        destination: address,
        weight: Math.ceil(cartTotal / 50),
        totalValue: cartTotal,
        urgency: 'normale'
      });
      if (response.data?.optimization) {
        setOptimization(response.data.optimization);
        setSelectedCarrier(response.data.optimization.recommendedCarrier);
      }
    } catch (error) {
      console.error('Shipping optimization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCarrier = (carrierName, cost) => {
    setSelectedCarrier(carrierName);
    if (onSelectCarrier) {
      onSelectCarrier(carrierName, cost);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Ottimizzazione spedizione con AI...</p>
        </CardContent>
      </Card>
    );
  }

  if (!optimization) return null;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Opzioni Spedizione Intelligenti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Consiglio AI:</strong> {optimization.recommendation}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {optimization.rankedCarriers && optimization.rankedCarriers.map((carrier, idx) => {
            const isRecommended = carrier.name === optimization.recommendedCarrier;
            const isSelected = carrier.name === selectedCarrier;

            return (
              <div 
                key={idx}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-600 bg-blue-50' :
                  isRecommended ? 'border-green-500 bg-green-50' :
                  'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleSelectCarrier(carrier.name, carrier.estimatedCost)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-slate-600" />
                    <span className="font-semibold">{carrier.name}</span>
                    {isRecommended && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Consigliato
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{carrier.estimatedCost.toFixed(2)}€</p>
                    <p className="text-xs text-slate-500">{carrier.estimatedDays} giorni</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <span>Affidabilità: {Math.round(carrier.reliability * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{carrier.estimatedDays}gg</span>
                  </div>
                </div>

                {carrier.pros && carrier.pros.length > 0 && (
                  <div className="mb-2">
                    {carrier.pros.slice(0, 2).map((pro, i) => (
                      <p key={i} className="text-xs text-green-700">✓ {pro}</p>
                    ))}
                  </div>
                )}

                {carrier.riskFactors && carrier.riskFactors.length > 0 && (
                  <div>
                    {carrier.riskFactors.slice(0, 1).map((risk, i) => (
                      <p key={i} className="text-xs text-amber-700">⚠️ {risk}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {optimization.savingTips && optimization.savingTips.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm font-semibold mb-2">💡 Suggerimenti per risparmiare:</p>
            <div className="space-y-1">
              {optimization.savingTips.map((tip, idx) => (
                <p key={idx} className="text-xs text-slate-600">• {tip}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}