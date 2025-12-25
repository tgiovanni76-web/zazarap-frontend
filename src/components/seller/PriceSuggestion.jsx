import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PriceSuggestion({ title, description, category, condition, images, onPriceSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const getSuggestion = async () => {
    if (!title || !category) {
      toast.error('Titel und Kategorie sind erforderlich');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('suggestPrice', {
        title,
        description,
        category,
        condition,
        images
      });

      if (response.data?.success) {
        setSuggestion(response.data);
        toast.success('Preisvorschlag erhalten!');
      }
    } catch (error) {
      console.error('Price suggestion error:', error);
      toast.error('Fehler beim Abrufen des Preisvorschlags');
    } finally {
      setIsLoading(false);
    }
  };

  const confidenceColors = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-green-100 text-green-800'
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          KI-Preisvorschlag
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!suggestion ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 mb-4">
              Lass unsere KI einen optimalen Preis basierend auf Marktdaten vorschlagen
            </p>
            <Button 
              onClick={getSuggestion} 
              disabled={isLoading || !title || !category}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere Markt...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Preis vorschlagen
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Suggested Price */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Empfohlener Preis</span>
                <Badge className={confidenceColors[suggestion.confidence]}>
                  {suggestion.confidence === 'high' ? 'Hohe' : suggestion.confidence === 'medium' ? 'Mittlere' : 'Geringe'} Sicherheit
                </Badge>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {suggestion.suggestedPrice?.toFixed(2)}€
              </div>
              <div className="flex gap-2 text-sm text-slate-600">
                <span>Min: {suggestion.minPrice?.toFixed(2)}€</span>
                <span>•</span>
                <span>Max: {suggestion.maxPrice?.toFixed(2)}€</span>
              </div>
            </div>

            {/* Market Position */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-600">Position:</span>
              <Badge variant="outline" className="capitalize">
                {suggestion.marketPosition}
              </Badge>
            </div>

            {/* Strategy */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold mb-1">💡 Strategie</p>
              <p className="text-sm text-slate-700">{suggestion.strategy}</p>
            </div>

            {/* Market Data */}
            {suggestion.marketData && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-xs text-slate-600">Ø Marktpreis</p>
                  <p className="font-semibold text-blue-700">{suggestion.marketData.averagePrice}€</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <p className="text-xs text-slate-600">Ø Verkaufspreis</p>
                  <p className="font-semibold text-green-700">{suggestion.marketData.averageSoldPrice}€</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <p className="text-xs text-slate-600">Aktive Anzeigen</p>
                  <p className="font-semibold text-purple-700">{suggestion.marketData.activeListingsCount}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <p className="text-xs text-slate-600">Verkaufte</p>
                  <p className="font-semibold text-orange-700">{suggestion.marketData.soldListingsCount}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={() => onPriceSelect(suggestion.suggestedPrice)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Preis übernehmen
              </Button>
              <Button 
                onClick={getSuggestion}
                variant="outline"
              >
                Neu berechnen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}