import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TitleGenerator({ category, description, price, onTitleSelect }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateTitles = async () => {
    if (!category) {
      toast.error('Bitte wähle zuerst eine Kategorie');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateListingTitles', {
        category,
        description,
        price,
        keywords
      });

      if (response.data?.success) {
        setSuggestions(response.data.titles);
        toast.success('Titel generiert!');
      }
    } catch (error) {
      console.error('Title generation error:', error);
      toast.error('Fehler bei der Titel-Generierung');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (title, index) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success('Titel kopiert!');
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          KI-Titel Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Lass unsere KI ansprechende, SEO-optimierte Titel für dein Listing generieren
            </p>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Zusätzliche Schlagwörter (optional)
              </label>
              <Input
                placeholder="z.B. neu, vintage, limitiert..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="mb-3"
              />
            </div>

            <Button 
              onClick={generateTitles} 
              disabled={isGenerating || !category}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generiere Titel...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Titel generieren
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Vorgeschlagene Titel:</p>
              <Button 
                onClick={generateTitles}
                variant="outline"
                size="sm"
              >
                Neu generieren
              </Button>
            </div>

            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="group border rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
                  onClick={() => onTitleSelect(suggestion.title)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 mb-1">
                        {suggestion.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.length} Zeichen
                        </Badge>
                        {suggestion.seoScore && (
                          <Badge 
                            className={
                              suggestion.seoScore >= 80 ? 'bg-green-100 text-green-800' :
                              suggestion.seoScore >= 60 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            SEO: {suggestion.seoScore}/100
                          </Badge>
                        )}
                      </div>
                      {suggestion.reason && (
                        <p className="text-xs text-slate-600 mt-1">
                          {suggestion.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(suggestion.title, idx);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 mt-4">
              <p className="text-xs text-indigo-900">
                💡 <strong>Tipp:</strong> Klicke auf einen Titel, um ihn automatisch zu übernehmen
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}