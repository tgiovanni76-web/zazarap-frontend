import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, CheckCircle2, TrendingUp, FileText, Image, Tag, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ListingOptimizationAssistant({ listing, onApplySuggestions }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState({
    title: false,
    description: false,
    keywords: false,
    price: false
  });

  const analyzeAndOptimize = async () => {
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('optimizeListing', {
        listingId: listing.id
      });

      if (response.data?.success) {
        setOptimization(response.data);
        toast.success('Optimierungsvorschläge generiert!');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Fehler bei der Optimierung');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySelected = () => {
    const updates = {};
    
    if (selectedSuggestions.title && optimization.titleSuggestion) {
      updates.title = optimization.titleSuggestion.newTitle;
    }
    if (selectedSuggestions.description && optimization.descriptionSuggestion) {
      updates.description = optimization.descriptionSuggestion.newDescription;
    }
    if (selectedSuggestions.keywords && optimization.keywordsSuggestion) {
      updates.seo_keywords = optimization.keywordsSuggestion.keywords.join(', ');
    }
    if (selectedSuggestions.price && optimization.priceSuggestion) {
      updates.price = optimization.priceSuggestion.suggestedPrice;
    }

    if (Object.keys(updates).length > 0) {
      onApplySuggestions(updates);
      toast.success(`${Object.keys(updates).length} Verbesserung(en) angewendet!`);
    } else {
      toast.error('Bitte wähle mindestens eine Verbesserung aus');
    }
  };

  const performanceColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          KI-Optimierungsassistent
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!optimization ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 mb-4">
              Analysiere dein Listing und erhalte personalisierte Optimierungsvorschläge 
              basierend auf Performance-Daten und Markttrends
            </p>
            <Button 
              onClick={analyzeAndOptimize} 
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere Listing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Jetzt optimieren
                </>
              )}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="title">Titel</TabsTrigger>
              <TabsTrigger value="description">Text</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="price">Preis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Performance Score */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Performance-Score</span>
                  <Badge className={
                    optimization.performanceScore >= 70 ? 'bg-green-100 text-green-800' :
                    optimization.performanceScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {optimization.performanceScore >= 70 ? 'Gut' :
                     optimization.performanceScore >= 40 ? 'Mittel' : 'Schwach'}
                  </Badge>
                </div>
                <div className={`text-4xl font-bold mb-2 ${performanceColor(optimization.performanceScore)}`}>
                  {optimization.performanceScore}/100
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-slate-600">Aufrufe</div>
                    <div className="font-semibold">{optimization.currentMetrics?.views || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Klicks</div>
                    <div className="font-semibold">{optimization.currentMetrics?.clicks || 0}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Engagement</div>
                    <div className="font-semibold">{optimization.currentMetrics?.engagement?.toFixed(1) || 0}%</div>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              {optimization.summary && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">{optimization.summary}</p>
                </div>
              )}

              {/* Improvement Overview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Verbesserungspotenzial:</h4>
                {optimization.titleSuggestion && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">📝 Titel optimieren</span>
                    <Badge variant="outline">+{optimization.titleSuggestion.improvement}%</Badge>
                  </div>
                )}
                {optimization.descriptionSuggestion && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">📄 Beschreibung verbessern</span>
                    <Badge variant="outline">+{optimization.descriptionSuggestion.improvement}%</Badge>
                  </div>
                )}
                {optimization.keywordsSuggestion && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">🏷️ Keywords hinzufügen</span>
                    <Badge variant="outline">+{optimization.keywordsSuggestion.improvement}%</Badge>
                  </div>
                )}
                {optimization.priceSuggestion && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">💰 Preis anpassen</span>
                    <Badge variant="outline">+{optimization.priceSuggestion.improvement}%</Badge>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="title" className="space-y-3">
              {optimization.titleSuggestion && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Titel-Optimierung</h4>
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.title}
                      onChange={(e) => setSelectedSuggestions({...selectedSuggestions, title: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="text-xs text-red-600 mb-1">Aktuell:</div>
                      <div className="text-sm font-medium text-red-900">{optimization.titleSuggestion.currentTitle}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="text-xs text-green-600 mb-1">Vorschlag:</div>
                      <div className="text-sm font-medium text-green-900">{optimization.titleSuggestion.newTitle}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded text-xs text-blue-900">
                    <strong>Warum?</strong> {optimization.titleSuggestion.reason}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Erwartete Verbesserung: <strong>+{optimization.titleSuggestion.improvement}%</strong> Aufrufe</span>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="description" className="space-y-3">
              {optimization.descriptionSuggestion && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Beschreibungs-Optimierung</h4>
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.description}
                      onChange={(e) => setSelectedSuggestions({...selectedSuggestions, description: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded border border-red-200 max-h-32 overflow-y-auto">
                      <div className="text-xs text-red-600 mb-1">Aktuell:</div>
                      <div className="text-sm text-red-900">{optimization.descriptionSuggestion.currentDescription}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200 max-h-32 overflow-y-auto">
                      <div className="text-xs text-green-600 mb-1">Vorschlag:</div>
                      <div className="text-sm text-green-900">{optimization.descriptionSuggestion.newDescription}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded text-xs text-blue-900">
                    <strong>Verbesserungen:</strong> {optimization.descriptionSuggestion.improvements.join(', ')}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-3">
              {optimization.keywordsSuggestion && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Keyword-Optimierung</h4>
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.keywords}
                      onChange={(e) => setSelectedSuggestions({...selectedSuggestions, keywords: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <div className="text-xs text-purple-600 mb-2">Empfohlene Keywords:</div>
                    <div className="flex flex-wrap gap-2">
                      {optimization.keywordsSuggestion.keywords.map((kw, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded text-xs text-blue-900">
                    <strong>Basis:</strong> {optimization.keywordsSuggestion.basedOn}
                  </div>
                  {optimization.keywordsSuggestion.trendingSearches && (
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="text-xs text-yellow-700 mb-1">🔥 Trending Suchanfragen:</div>
                      <div className="text-xs text-yellow-900">
                        {optimization.keywordsSuggestion.trendingSearches.join(', ')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="price" className="space-y-3">
              {optimization.priceSuggestion && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Preis-Optimierung</h4>
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.price}
                      onChange={(e) => setSelectedSuggestions({...selectedSuggestions, price: e.target.checked})}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <div className="text-xs text-red-600 mb-1">Aktueller Preis:</div>
                      <div className="text-2xl font-bold text-red-900">{optimization.priceSuggestion.currentPrice}€</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="text-xs text-green-600 mb-1">Empfohlener Preis:</div>
                      <div className="text-2xl font-bold text-green-900">{optimization.priceSuggestion.suggestedPrice}€</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded text-xs text-blue-900">
                    <strong>Strategie:</strong> {optimization.priceSuggestion.strategy}
                  </div>
                  {optimization.priceSuggestion.marketData && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-100 rounded">
                        <div className="text-slate-600">Ø Marktpreis</div>
                        <div className="font-semibold">{optimization.priceSuggestion.marketData.averagePrice}€</div>
                      </div>
                      <div className="p-2 bg-slate-100 rounded">
                        <div className="text-slate-600">Konkurrierende</div>
                        <div className="font-semibold">{optimization.priceSuggestion.marketData.competingListings}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {optimization && (
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={applySelected}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!Object.values(selectedSuggestions).some(v => v)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Ausgewählte anwenden
            </Button>
            <Button 
              onClick={analyzeAndOptimize}
              variant="outline"
            >
              Neu analysieren
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}