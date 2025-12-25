import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2, Copy, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DescriptionGenerator({ title, category, condition, price, images, onDescriptionSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [features, setFeatures] = useState('');

  const generate = async () => {
    if (!title) {
      toast.error('Titel ist erforderlich');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generateDescription', {
        title,
        category,
        condition,
        features,
        price,
        images
      });

      if (response.data?.success) {
        setGenerated(response.data);
        toast.success('Beschreibung generiert!');
      }
    } catch (error) {
      console.error('Description generation error:', error);
      toast.error('Fehler beim Generieren der Beschreibung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-blue-500" />
          KI-Beschreibungsgenerator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Features & Besonderheiten (optional)
            </label>
            <Input
              placeholder="z.B. neuwertig, mit Garantie, OVP vorhanden..."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>

          {!generated ? (
            <Button 
              onClick={generate} 
              disabled={isLoading || !title}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generiere Beschreibung...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Beschreibung generieren
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* Generated Description */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Generierte Beschreibung</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(generated.description);
                      toast.success('In Zwischenablage kopiert');
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Textarea
                  value={generated.description}
                  onChange={(e) => setGenerated({...generated, description: e.target.value})}
                  className="min-h-32 bg-white"
                />
              </div>

              {/* Highlights */}
              {generated.highlights && generated.highlights.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">✨ Verkaufsargumente</p>
                  <div className="flex flex-wrap gap-2">
                    {generated.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Keywords */}
              {generated.seoKeywords && generated.seoKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">🔍 SEO Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {generated.seoKeywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Insights */}
              {generated.imageInsights && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-semibold mb-1">📸 Bildanalyse</p>
                  <div className="text-xs space-y-1 text-slate-600">
                    {generated.imageInsights.productType && (
                      <p>Typ: {generated.imageInsights.productType}</p>
                    )}
                    {generated.imageInsights.condition && (
                      <p>Zustand: {generated.imageInsights.condition}</p>
                    )}
                    {generated.imageInsights.colors?.length > 0 && (
                      <p>Farben: {generated.imageInsights.colors.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => onDescriptionSelect(generated.description)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Beschreibung übernehmen
                </Button>
                <Button 
                  onClick={generate}
                  variant="outline"
                >
                  Neu generieren
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}