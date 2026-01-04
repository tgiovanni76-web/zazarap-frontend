import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function PreSubmitCheck({ title, description, category, price, enabled = true }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!enabled || !title || !description) {
      setAnalysis(null);
      return;
    }

    const debounceTimer = setTimeout(() => {
      analyzeContent();
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [title, description, category, price, enabled]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('preModerateContent', {
        title,
        description,
        category,
        price
      });
      if (response.data?.analysis) {
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Pre-moderation error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!enabled) return null;

  if (isAnalyzing) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-900">Analisi AI in corso...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const riskConfig = {
    low: { icon: CheckCircle2, color: 'bg-green-50 border-green-200', textColor: 'text-green-900', badgeColor: 'bg-green-100 text-green-800' },
    medium: { icon: AlertTriangle, color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-900', badgeColor: 'bg-yellow-100 text-yellow-800' },
    high: { icon: AlertTriangle, color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-900', badgeColor: 'bg-orange-100 text-orange-800' },
    critical: { icon: XCircle, color: 'bg-red-50 border-red-200', textColor: 'text-red-900', badgeColor: 'bg-red-100 text-red-800' }
  };

  const config = riskConfig[analysis.riskLevel] || riskConfig.medium;
  const RiskIcon = config.icon;

  return (
    <Card className={`border-2 ${config.color}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Analisi AI Pre-Pubblicazione
          </span>
          <Badge className={config.badgeColor}>
            Rischio: {analysis.riskLevel.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <RiskIcon className={`h-6 w-6 ${config.textColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`font-semibold ${config.textColor} mb-1`}>
              Raccomandazione: {
                analysis.recommendation === 'approve' ? 'Approvazione immediata' :
                analysis.recommendation === 'review' ? 'Revisione consigliata' :
                'Possibile rifiuto'
              }
            </p>
            <p className="text-sm text-slate-600">{analysis.detailedAnalysis}</p>
          </div>
        </div>

        {analysis.violations && analysis.violations.length > 0 && (
          <div>
            <p className="font-semibold text-sm mb-2">⚠️ Problemi identificati:</p>
            <div className="space-y-2">
              {analysis.violations.map((violation, idx) => (
                <div key={idx} className="text-sm p-2 bg-white rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{violation.type}</span>
                    <Badge variant="outline" className="text-xs">{violation.severity}</Badge>
                  </div>
                  <p className="text-slate-600">{violation.description}</p>
                  <p className="text-xs text-slate-500 mt-1">Posizione: {violation.location}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis.improvements && analysis.improvements.length > 0 && (
          <div>
            <p className="font-semibold text-sm mb-2">💡 Suggerimenti:</p>
            <div className="space-y-2">
              {analysis.improvements.map((improvement, idx) => (
                <div key={idx} className="text-sm p-2 bg-white rounded border">
                  <p className="font-medium text-slate-700">{improvement.issue}</p>
                  <p className="text-slate-600">{improvement.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-sm text-slate-600">Punteggio conformità</span>
          <Badge variant="outline">{analysis.score}/100</Badge>
        </div>
      </CardContent>
    </Card>
  );
}