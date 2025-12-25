import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAssistantPanel({ chat, lastBuyerMessage, onUseSuggestion }) {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const { data: aiData, isLoading: loadingSuggestions, refetch } = useQuery({
    queryKey: ['aiSuggestions', chat.id, lastBuyerMessage],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAIChatSuggestions', {
        chatId: chat.id,
        buyerMessage: lastBuyerMessage
      });
      return res.data;
    },
    enabled: !!lastBuyerMessage,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: buyerQualification, isLoading: loadingQualification } = useQuery({
    queryKey: ['buyerQualification', chat.buyerId],
    queryFn: async () => {
      const res = await base44.functions.invoke('analyzeBuyerQualification', {
        buyerId: chat.buyerId
      });
      return res.data;
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  const handleCopySuggestion = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Risposta copiata negli appunti');
  };

  const handleUseSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    if (onUseSuggestion) {
      onUseSuggestion(suggestion.text, suggestion.suggestedPrice);
    }
  };

  const getCategoryBadge = (category) => {
    const configs = {
      excellent: { label: 'Eccellente', color: 'bg-green-100 text-green-800' },
      good: { label: 'Buono', color: 'bg-blue-100 text-blue-800' },
      average: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
      risky: { label: 'Rischio', color: 'bg-red-100 text-red-800' },
      new: { label: 'Nuovo', color: 'bg-slate-100 text-slate-800' }
    };
    return configs[category] || configs.new;
  };

  const getReadyToBuyIcon = (status) => {
    if (status === 'yes') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'maybe') return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Buyer Qualification */}
      {buyerQualification && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analisi Acquirente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Affidabilità</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${buyerQualification.aiAnalysis.reliabilityScore * 10}%` }}
                  />
                </div>
                <span className="font-bold text-sm">
                  {buyerQualification.aiAnalysis.reliabilityScore}/10
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Categoria</span>
              <Badge className={getCategoryBadge(buyerQualification.aiAnalysis.category).color}>
                {getCategoryBadge(buyerQualification.aiAnalysis.category).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-600">Acquisti: </span>
                <span className="font-semibold">{buyerQualification.stats.completedPurchases}</span>
              </div>
              <div>
                <span className="text-slate-600">Conversione: </span>
                <span className="font-semibold">{buyerQualification.stats.conversionRate}%</span>
              </div>
            </div>

            {buyerQualification.aiAnalysis.advice && (
              <div className="p-2 bg-white rounded-lg">
                <p className="text-xs text-slate-700">
                  💡 {buyerQualification.aiAnalysis.advice}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Assistente AI - Risposte Suggerite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : aiData?.suggestions ? (
            <>
              {/* Buyer Analysis */}
              {aiData.buyerAnalysis && (
                <div className="p-3 bg-blue-50 rounded-lg mb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Interesse acquirente:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600"
                          style={{ width: `${aiData.buyerAnalysis.interestScore * 10}%` }}
                        />
                      </div>
                      <span className="font-bold">{aiData.buyerAnalysis.interestScore}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {getReadyToBuyIcon(aiData.buyerAnalysis.readyToBuy)}
                    <span className="text-slate-700">
                      {aiData.buyerAnalysis.readyToBuy === 'yes' && 'Pronto ad acquistare'}
                      {aiData.buyerAnalysis.readyToBuy === 'maybe' && 'Potenzialmente interessato'}
                      {aiData.buyerAnalysis.readyToBuy === 'no' && 'Necessita convincimento'}
                    </span>
                  </div>
                  {aiData.buyerAnalysis.recommendation && (
                    <p className="text-xs text-slate-600 italic">
                      "{aiData.buyerAnalysis.recommendation}"
                    </p>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {aiData.suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className={`p-3 border-2 rounded-lg transition-all cursor-pointer ${
                    selectedSuggestion === suggestion
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type === 'professional' && '👔 Professionale'}
                      {suggestion.type === 'counter_offer' && '💰 Controfferta'}
                      {suggestion.type === 'question' && '❓ Domanda'}
                    </Badge>
                    {suggestion.suggestedPrice && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Offerta: €{suggestion.suggestedPrice}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{suggestion.text}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySuggestion(suggestion.text);
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copia
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseSuggestion(suggestion);
                      }}
                    >
                      Usa risposta
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="w-full"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Genera nuove risposte
              </Button>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              In attesa del messaggio dell'acquirente...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}