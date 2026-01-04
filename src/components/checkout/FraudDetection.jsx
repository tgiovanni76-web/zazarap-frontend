import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function FraudDetection({ cartTotal, shippingAddress, paymentMethod, enabled = true }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (enabled && cartTotal > 0 && shippingAddress) {
      analyzeCheckout();
    }
  }, [cartTotal, shippingAddress, paymentMethod, enabled]);

  const analyzeCheckout = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('detectCheckoutFraud', {
        cartValue: cartTotal,
        shippingAddress,
        paymentMethod: paymentMethod || 'card',
        sessionData: {
          timestamp: new Date().toISOString()
        }
      });
      if (response.data?.analysis) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Fraud detection error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!enabled) return null;

  if (isAnalyzing) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        <AlertDescription className="text-blue-900">
          Verifica sicurezza in corso...
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysis) return null;

  const riskConfig = {
    low: { icon: CheckCircle2, color: 'bg-green-50 border-green-200', textColor: 'text-green-900' },
    medium: { icon: Shield, color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-900' },
    high: { icon: AlertTriangle, color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-900' },
    critical: { icon: XCircle, color: 'bg-red-50 border-red-200', textColor: 'text-red-900' }
  };

  const config = riskConfig[analysis.riskLevel] || riskConfig.low;
  const Icon = config.icon;

  // Only show if there's a concern
  if (analysis.riskLevel === 'low' && (!analysis.redFlags || analysis.redFlags.length === 0)) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          ✓ Transazione sicura - Punteggio: {analysis.riskScore}/100
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={config.color}>
      <Icon className={`h-4 w-4 ${config.textColor}`} />
      <AlertDescription className={config.textColor}>
        <div className="space-y-2">
          <p className="font-semibold">
            Livello di rischio: {analysis.riskLevel.toUpperCase()} (Score: {analysis.riskScore}/100)
          </p>
          <p className="text-sm">{analysis.reasoning}</p>

          {analysis.redFlags && analysis.redFlags.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold mb-1">Segnali rilevati:</p>
              <div className="space-y-1">
                {analysis.redFlags.map((flag, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-medium">{flag.flag}</span> - {flag.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendation === 'additional_verification' && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-sm font-semibold mb-1">Verifiche consigliate:</p>
              <ul className="text-xs space-y-1">
                {analysis.verificationSuggestions?.map((suggestion, idx) => (
                  <li key={idx}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendation === 'manual_review' && (
            <p className="text-sm mt-2 font-semibold">
              ⚠️ Questo ordine richiederà una revisione manuale prima della spedizione.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}