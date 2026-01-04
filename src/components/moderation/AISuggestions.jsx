import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Lightbulb, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AISuggestions({ listing, onApplySuggestion }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('suggestListingCorrections', {
        listingId: listing.id
      });
      if (response.data?.corrections) {
        setSuggestions(response.data.corrections);
      }
    } catch (error) {
      toast.error('Errore nel caricamento suggerimenti');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato negli appunti');
  };

  if (!suggestions && !isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">🤖 Assistente AI Correzioni</h3>
              <p className="text-sm text-slate-600 mb-4">
                L'AI può analizzare il motivo del rifiuto e suggerire correzioni specifiche per il tuo annuncio.
              </p>
              <Button onClick={loadSuggestions} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Genera suggerimenti AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600">L'AI sta analizzando il tuo annuncio...</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) return null;

  const priorityColors = {
    alta: 'bg-red-100 text-red-800 border-red-200',
    media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bassa: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-900">
          <strong>Analisi AI completata!</strong> Ecco i suggerimenti per correggere l'annuncio.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Spiegazione del problema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">{suggestions.problemExplanation}</p>
        </CardContent>
      </Card>

      {suggestions.titleSuggestions && suggestions.titleSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>✏️ Suggerimenti per il titolo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.titleSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(suggestion)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.descriptionSuggestions && suggestions.descriptionSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📝 Suggerimenti per la descrizione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.descriptionSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(suggestion)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.otherImprovements && suggestions.otherImprovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Altri miglioramenti necessari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.otherImprovements.map((improvement, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${priorityColors[improvement.priority] || 'bg-slate-50'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm">{improvement.issue}</p>
                    <Badge variant="outline" className="text-xs">
                      Priorità {improvement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm">{improvement.suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.estimatedApprovalChance && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>Probabilità di approvazione dopo le correzioni:</strong> {suggestions.estimatedApprovalChance}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}