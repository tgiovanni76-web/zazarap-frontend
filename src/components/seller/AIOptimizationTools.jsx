import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, DollarSign, Target, Zap, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AIOptimizationTools({ listings }) {
  const [selectedListing, setSelectedListing] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeListing = async (listing) => {
    setIsLoading(true);
    setSelectedListing(listing);
    try {
      const response = await base44.functions.invoke('optimizeListing', {
        listingId: listing.id
      });
      if (response.data?.optimization) {
        setSuggestions(response.data.optimization);
      }
    } catch (error) {
      toast.error('Errore analisi');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">🤖 Strumenti AI per ottimizzazioni</h3>
        <Badge className="bg-purple-100 text-purple-800">
          <Sparkles className="h-3 w-3 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Ottimizzazione prezzi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              L'AI analizza il mercato e suggerisce il prezzo ottimale per massimizzare vendite e profitti.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Ottimizzazione titoli
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Genera titoli accattivanti e SEO-friendly per aumentare visualizzazioni e click.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleziona un annuncio da ottimizzare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {listings.filter(l => l.status === 'active').slice(0, 10).map((listing) => (
              <div 
                key={listing.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                onClick={() => analyzeListing(listing)}
              >
                <div>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-slate-600">{listing.price}€ • {listing.views || 0} views</p>
                </div>
                <Button size="sm" disabled={isLoading}>
                  <Zap className="h-4 w-4 mr-1" />
                  Analizza
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Analisi AI in corso...</p>
          </CardContent>
        </Card>
      )}

      {suggestions && !isLoading && (
        <div className="space-y-4">
          <Alert className="bg-purple-50 border-purple-200">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-900">
              <strong>Analisi completata!</strong> Ecco i suggerimenti per "{selectedListing?.title}"
            </AlertDescription>
          </Alert>

          {suggestions.priceOptimization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Ottimizzazione prezzo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Prezzo attuale</p>
                    <p className="text-2xl font-bold">{selectedListing.price}€</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Prezzo suggerito</p>
                    <p className="text-2xl font-bold text-green-600">
                      {suggestions.priceOptimization.suggestedPrice}€
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Motivazione:</p>
                  <p className="text-sm text-slate-700">{suggestions.priceOptimization.reasoning}</p>
                </div>
                {suggestions.priceOptimization.marketComparison && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Confronto mercato:</p>
                    <p className="text-sm text-slate-700">{suggestions.priceOptimization.marketComparison}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {suggestions.titleSuggestions && suggestions.titleSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Titoli alternativi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suggestions.titleSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <p className="font-medium flex-1">{suggestion.title}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(suggestion.title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{suggestion.reason}</p>
                      {suggestion.expectedImpact && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          +{suggestion.expectedImpact}% visualizzazioni
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {suggestions.overallScore && (
            <Card>
              <CardHeader>
                <CardTitle>Punteggio complessivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${suggestions.overallScore}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{suggestions.overallScore}/100</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}