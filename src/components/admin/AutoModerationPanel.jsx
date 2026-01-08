import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoModerationPanel({ listing, onModerationComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAutoModerate = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('autoModerateAndSuggest', {
        listingId: listing.id
      });

      if (response.data?.success) {
        setResult(response.data);
        toast.success('Analisi AI completata');
        if (onModerationComplete) {
          onModerationComplete(response.data);
        }
      }
    } catch (error) {
      console.error('Auto moderation error:', error);
      toast.error('Errore durante l\'analisi AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'approve': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'reject': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'review': return <Eye className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-slate-600" />;
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Moderazione AI Automatica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                Sistema di moderazione AI avanzato
              </p>
              <p className="text-xs text-slate-500">
                Rileva frodi, contenuti inappropriati e suggerisce miglioramenti
              </p>
            </div>
          </div>

          <Button
            onClick={handleAutoModerate}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisi in corso...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Avvia Analisi AI
              </>
            )}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              {/* Risk Level & Action */}
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Livello Rischio:</span>
                  <Badge className={getRiskColor(result.moderation.riskLevel)}>
                    {result.moderation.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Azione Raccomandata:</span>
                  <div className="flex items-center gap-2">
                    {getActionIcon(result.moderation.action)}
                    <Badge variant="outline">
                      {result.moderation.action === 'approve' ? 'Approva' :
                       result.moderation.action === 'reject' ? 'Rifiuta' : 'Revisione Manuale'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Qualità:</span>
                  <Badge variant="outline">
                    {Math.round(result.moderation.qualityScore * 100)}%
                  </Badge>
                </div>
              </div>

              {/* Fraud Indicators */}
              {result.moderation.fraudIndicators?.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-2">
                    🚨 Indicatori di Frode:
                  </p>
                  <ul className="space-y-1">
                    {result.moderation.fraudIndicators.map((indicator, idx) => (
                      <li key={idx} className="text-xs text-red-800">• {indicator}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prohibited Content */}
              {result.moderation.prohibitedContent?.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-2">
                    ⛔ Contenuti Vietati:
                  </p>
                  <ul className="space-y-1">
                    {result.moderation.prohibitedContent.map((content, idx) => (
                      <li key={idx} className="text-xs text-red-800">• {content}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Image Analysis */}
              {result.imageAnalysis && (
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    📸 Analisi Immagini:
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Qualità Immagini:</span>
                      <Badge variant="outline">
                        {Math.round(result.imageAnalysis.imageQualityScore * 100)}%
                      </Badge>
                    </div>
                    {result.imageAnalysis.hasInappropriateContent && (
                      <div className="p-2 bg-red-50 rounded text-xs text-red-800">
                        ⚠️ Contenuti inappropriati rilevati
                      </div>
                    )}
                    {result.imageAnalysis.qualityIssues?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-slate-700 mb-1">Problemi Qualità:</p>
                        <ul className="space-y-1">
                          {result.imageAnalysis.qualityIssues.map((issue, idx) => (
                            <li key={idx} className="text-xs text-slate-600">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.moderation.suggestedCategory && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Suggerimenti:
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="font-medium text-blue-900">Categoria Suggerita: </span>
                      <span className="text-blue-800">{result.moderation.suggestedCategory}</span>
                    </div>
                    {result.moderation.suggestedTags?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-900 mb-1">Tag Suggeriti:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.moderation.suggestedTags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Improvements */}
              {result.moderation.improvements?.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    ✅ Miglioramenti Consigliati:
                  </p>
                  <ul className="space-y-1">
                    {result.moderation.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-xs text-green-800">• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Moderator Notes */}
              {result.moderation.moderatorNotes && (
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <p className="text-sm font-semibold text-slate-900 mb-2">
                    📝 Note Moderatore AI:
                  </p>
                  <p className="text-xs text-slate-700">
                    {result.moderation.moderatorNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}