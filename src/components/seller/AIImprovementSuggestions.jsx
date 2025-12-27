import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Image, DollarSign, FileText, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AIImprovementSuggestions({ listings }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const analyzeListing = async () => {
    if (!listings || listings.length === 0) {
      toast.error('Keine Listings zum Analysieren');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('generateListingImprovements', {
        listings: listings.slice(0, 10) // Analyze top 10
      });

      if (response.data?.success) {
        setSuggestions(response.data);
        toast.success('Analyse abgeschlossen!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Fehler bei der Analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const typeIcons = {
    price: DollarSign,
    description: FileText,
    images: Image,
    general: TrendingUp
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          KI-Verbesserungsvorschläge
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!suggestions ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 mb-4">
              Lass unsere KI deine Listings analysieren und erhalte personalisierte Verbesserungsvorschläge
            </p>
            <Button 
              onClick={analyzeListing} 
              disabled={isAnalyzing || !listings || listings.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere Listings...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Listings analysieren
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Score */}
            {suggestions.overallScore && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Gesamtbewertung</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {suggestions.overallScore}/100
                    </div>
                  </div>
                  <Badge className={
                    suggestions.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                    suggestions.overallScore >= 60 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {suggestions.overallScore >= 80 ? 'Ausgezeichnet' :
                     suggestions.overallScore >= 60 ? 'Gut' : 'Verbesserungsbedarf'}
                  </Badge>
                </div>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.suggestions && suggestions.suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Empfohlene Maßnahmen:</h4>
                {suggestions.suggestions.map((suggestion, idx) => {
                  const Icon = typeIcons[suggestion.type] || TrendingUp;
                  return (
                    <div 
                      key={idx}
                      className={`border-2 rounded-lg p-4 ${priorityColors[suggestion.priority] || priorityColors.low}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">
                              {suggestion.listingTitle}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.priority === 'high' ? 'Hoch' :
                               suggestion.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{suggestion.suggestion}</p>
                          {suggestion.impact && (
                            <p className="text-xs text-slate-600 mb-2">
                              💡 Erwartete Auswirkung: {suggestion.impact}
                            </p>
                          )}
                          {suggestion.listingId && (
                            <Link to={createPageUrl('EditListing') + '?id=' + suggestion.listingId}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                Jetzt bearbeiten
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Wins */}
            {suggestions.quickWins && suggestions.quickWins.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold mb-2 text-green-900">⚡ Quick Wins</p>
                <ul className="text-sm text-green-800 space-y-1">
                  {suggestions.quickWins.map((win, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{win}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={analyzeListing}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Neu analysieren
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}