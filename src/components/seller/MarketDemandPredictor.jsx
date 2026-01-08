import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Loader2, BarChart3, Clock, Euro, 
  Users, AlertTriangle, Lightbulb, Target, Calendar,
  Package, Zap, ArrowUp, ArrowDown, Minus,
  ShoppingCart, Bell
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function MarketDemandPredictor({ 
  productTitle, 
  category, 
  currentPrice,
  condition,
  location,
  onPriceSelect 
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const analyzeDemand = async () => {
    if (!productTitle) {
      toast.error('Inserisci prima il titolo del prodotto');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('predictMarketDemand', {
        productTitle,
        category,
        currentPrice,
        condition,
        location
      });

      if (response.data?.success) {
        setPrediction(response.data);
        toast.success('Analisi di mercato completata!');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Errore nell\'analisi');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDemandColor = (level) => {
    const colors = {
      'molto_alta': 'bg-green-500',
      'alta': 'bg-green-400',
      'media': 'bg-yellow-400',
      'bassa': 'bg-orange-400',
      'molto_bassa': 'bg-red-400'
    };
    return colors[level] || colors.media;
  };

  const getDemandLabel = (level) => {
    const labels = {
      'molto_alta': 'Molto Alta',
      'alta': 'Alta',
      'media': 'Media',
      'bassa': 'Bassa',
      'molto_bassa': 'Molto Bassa'
    };
    return labels[level] || 'Media';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'crescente') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (direction === 'decrescente') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Previsione Domanda di Mercato
          <Badge className="ml-2 bg-emerald-100 text-emerald-700">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!prediction ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-slate-600 mb-2">
              L'AI analizzerà il mercato e ti fornirà:
            </p>
            <ul className="text-sm text-slate-500 mb-6 space-y-1">
              <li>✓ Stima della domanda attuale</li>
              <li>✓ Prezzo ottimale consigliato</li>
              <li>✓ Tempo di vendita previsto</li>
              <li>✓ Trend e stagionalità</li>
              <li>✓ Consigli per scorte e inventory</li>
            </ul>
            <Button 
              onClick={analyzeDemand} 
              disabled={isAnalyzing || !productTitle}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisi mercato in corso...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analizza Domanda
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Demand score */}
            <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Livello di domanda</span>
                <Badge className={getDemandColor(prediction.prediction?.demandLevel) + ' text-white'}>
                  {getDemandLabel(prediction.prediction?.demandLevel)}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-emerald-600">
                  {prediction.prediction?.demandScore}/10
                </div>
                <div className="flex-1">
                  <Progress value={(prediction.prediction?.demandScore || 0) * 10} className="h-3" />
                </div>
              </div>
            </div>

            {/* Market data summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-slate-500">Annunci simili</p>
                <p className="text-xl font-bold text-slate-800">{prediction.marketData?.similarListings || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-slate-500">Prezzo medio</p>
                <p className="text-xl font-bold text-slate-800">{prediction.marketData?.averagePrice || 0}€</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-slate-500">Ricerche recenti</p>
                <p className="text-xl font-bold text-slate-800">{prediction.marketData?.recentSearches || 0}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border text-center">
                <p className="text-xs text-slate-500">Visualizzazioni</p>
                <p className="text-xl font-bold text-slate-800">{prediction.marketData?.recentViews || 0}</p>
              </div>
            </div>

            <Tabs defaultValue="pricing" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pricing">
                  <Euro className="h-3 w-3 mr-1" />
                  Prezzi
                </TabsTrigger>
                <TabsTrigger value="timing">
                  <Clock className="h-3 w-3 mr-1" />
                  Timing
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trend
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  <Package className="h-3 w-3 mr-1" />
                  Scorte
                </TabsTrigger>
              </TabsList>

              {/* Pricing tab */}
              <TabsContent value="pricing" className="space-y-4">
                {prediction.prediction?.pricingStrategy && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <motion.div 
                        className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onPriceSelect && onPriceSelect(prediction.prediction.pricingStrategy.quickSalePrice)}
                      >
                        <p className="text-xs text-blue-600 mb-1">Vendita rapida</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {prediction.prediction.pricingStrategy.quickSalePrice}€
                        </p>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border-2 border-emerald-300 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onPriceSelect && onPriceSelect(prediction.prediction.pricingStrategy.recommendedPrice)}
                      >
                        <p className="text-xs text-emerald-600 mb-1">Consigliato</p>
                        <p className="text-2xl font-bold text-emerald-800">
                          {prediction.prediction.pricingStrategy.recommendedPrice}€
                        </p>
                        <Badge className="mt-1 bg-emerald-200 text-emerald-800 text-xs">Best</Badge>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => onPriceSelect && onPriceSelect(prediction.prediction.pricingStrategy.premiumPrice)}
                      >
                        <p className="text-xs text-purple-600 mb-1">Premium</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {prediction.prediction.pricingStrategy.premiumPrice}€
                        </p>
                      </motion.div>
                    </div>

                    {prediction.prediction.pricingStrategy.priceJustification && (
                      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                        💡 {prediction.prediction.pricingStrategy.priceJustification}
                      </div>
                    )}
                  </>
                )}

                {/* Buyer persona */}
                {prediction.prediction?.buyerPersona && (
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-600" />
                      Profilo acquirente tipico
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      {prediction.prediction.buyerPersona.typicalBuyer}
                    </p>
                    {prediction.prediction.buyerPersona.buyingMotivations?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {prediction.prediction.buyerPersona.buyingMotivations.map((m, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Timing tab */}
              <TabsContent value="timing" className="space-y-4">
                {prediction.prediction?.expectedSaleTime && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                      <p className="text-xs text-green-600">Ottimista</p>
                      <p className="font-bold text-green-800">
                        {prediction.prediction.expectedSaleTime.optimistic}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-300 text-center">
                      <p className="text-xs text-blue-600">Realistico</p>
                      <p className="font-bold text-blue-800">
                        {prediction.prediction.expectedSaleTime.realistic}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                      <p className="text-xs text-orange-600">Pessimista</p>
                      <p className="font-bold text-orange-800">
                        {prediction.prediction.expectedSaleTime.pessimistic}
                      </p>
                    </div>
                  </div>
                )}

                {prediction.prediction?.bestTimeToSell && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      Momento migliore per vendere
                    </p>
                    <div className="space-y-2 text-sm">
                      {prediction.prediction.bestTimeToSell.bestDays?.length > 0 && (
                        <p>
                          <span className="font-medium">Giorni:</span>{' '}
                          {prediction.prediction.bestTimeToSell.bestDays.join(', ')}
                        </p>
                      )}
                      {prediction.prediction.bestTimeToSell.bestHours?.length > 0 && (
                        <p>
                          <span className="font-medium">Orari:</span>{' '}
                          {prediction.prediction.bestTimeToSell.bestHours.join(', ')}
                        </p>
                      )}
                      {prediction.prediction.bestTimeToSell.seasonalFactors && (
                        <p className="text-slate-600 italic">
                          📅 {prediction.prediction.bestTimeToSell.seasonalFactors}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Trends tab */}
              <TabsContent value="trends" className="space-y-4">
                {prediction.prediction?.marketTrend && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium flex items-center gap-2">
                        Trend di mercato
                        {getTrendIcon(prediction.prediction.marketTrend.direction)}
                      </p>
                      <Badge variant="outline">
                        {prediction.prediction.marketTrend.direction}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {prediction.prediction.marketTrend.reason}
                    </p>
                    <p className="text-sm bg-slate-50 p-2 rounded">
                      <span className="font-medium">Previsione 3 mesi:</span>{' '}
                      {prediction.prediction.marketTrend.forecast3Months}
                    </p>
                  </div>
                )}

                {prediction.prediction?.competitionAnalysis && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-2">Analisi competizione</p>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={
                        prediction.prediction.competitionAnalysis.level === 'alta' ? 'bg-red-100 text-red-800' :
                        prediction.prediction.competitionAnalysis.level === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        Competizione {prediction.prediction.competitionAnalysis.level}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        ~{prediction.prediction.competitionAnalysis.activeCompetitors} competitor attivi
                      </span>
                    </div>
                    {prediction.prediction.competitionAnalysis.differentiationTips?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Come differenziarti:</p>
                        <ul className="text-sm space-y-1">
                          {prediction.prediction.competitionAnalysis.differentiationTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Target className="h-3 w-3 text-emerald-600 mt-1" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Risks and opportunities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {prediction.prediction?.opportunities?.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-800 mb-2">🚀 Opportunità</p>
                      <ul className="text-xs text-green-700 space-y-1">
                        {prediction.prediction.opportunities.map((o, idx) => (
                          <li key={idx}>• {o}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {prediction.prediction?.risks?.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Rischi</p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {prediction.prediction.risks.map((r, idx) => (
                          <li key={idx}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Inventory tab */}
              <TabsContent value="inventory" className="space-y-4">
                {prediction.inventory?.stockRecommendation && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-600" />
                      Gestione scorte
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Quantità ottimale:</span>{' '}
                        {prediction.inventory.stockRecommendation.optimalQuantity}
                      </p>
                      <p>
                        <span className="font-medium">Trigger rifornimento:</span>{' '}
                        {prediction.inventory.stockRecommendation.restockTrigger}
                      </p>
                    </div>
                  </div>
                )}

                {prediction.inventory?.complementaryProducts?.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-purple-600" />
                      Prodotti complementari
                    </p>
                    <div className="space-y-3">
                      {prediction.inventory.complementaryProducts.map((prod, idx) => (
                        <div key={idx} className="p-2 bg-purple-50 rounded">
                          <p className="font-medium text-sm">{prod.product}</p>
                          <p className="text-xs text-slate-600">{prod.synergy}</p>
                          {prod.bundleIdea && (
                            <p className="text-xs text-purple-600 mt-1">💡 {prod.bundleIdea}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prediction.inventory?.priceAlerts?.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-600" />
                      Alert prezzo consigliati
                    </p>
                    <div className="space-y-2">
                      {prediction.inventory.priceAlerts.map((alert, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-orange-50 rounded text-sm">
                          <span>{alert.condition}</span>
                          <span className="font-medium text-orange-700">{alert.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Actionable insights */}
            {prediction.prediction?.actionableInsights?.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <p className="font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  Azioni consigliate
                </p>
                <div className="space-y-2">
                  {prediction.prediction.actionableInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                      <span className="text-sm">{insight.action}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={
                          insight.impact === 'alto' ? 'border-green-300 text-green-700' :
                          insight.impact === 'medio' ? 'border-yellow-300 text-yellow-700' :
                          'border-slate-300 text-slate-600'
                        }>
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.effort}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence indicator */}
            {prediction.confidence && (
              <div className="text-center text-xs text-slate-500">
                <Badge variant="outline">
                  Affidabilità: {prediction.confidence.level}
                </Badge>
                <span className="ml-2">
                  Basato su {prediction.confidence.dataPoints} punti dati
                </span>
              </div>
            )}

            {/* Actions */}
            <Button 
              onClick={analyzeDemand}
              variant="outline"
              className="w-full"
            >
              Aggiorna analisi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}