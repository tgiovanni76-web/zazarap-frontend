import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ImageAnalyzer({ images, onSuggestionsApplied }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeImages = async () => {
    if (!images || images.length === 0) {
      toast.error('Bitte lade mindestens ein Bild hoch');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeListingImages', {
        images
      });

      if (response.data?.success) {
        setAnalysis(response.data);
        toast.success('Bildanalyse abgeschlossen!');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      toast.error('Fehler bei der Bildanalyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const qualityColors = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-500" />
          KI-Bildanalyse
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 mb-4">
              Lass unsere KI deine Bilder analysieren und erhalte Verbesserungsvorschläge
            </p>
            <Button 
              onClick={analyzeImages} 
              disabled={isAnalyzing || !images || images.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere Bilder...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Bilder analysieren
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Quality */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamtqualität</span>
                <Badge className={qualityColors[analysis.overallQuality]}>
                  {analysis.overallQuality === 'excellent' ? 'Ausgezeichnet' :
                   analysis.overallQuality === 'good' ? 'Gut' :
                   analysis.overallQuality === 'fair' ? 'Befriedigend' : 'Verbesserungsbedürftig'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {analysis.qualityScore}/100
              </div>
            </div>

            {/* Image Details */}
            {analysis.imageAnalysis && analysis.imageAnalysis.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Einzelne Bilder:</h4>
                {analysis.imageAnalysis.map((img, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-slate-50">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium">Bild {idx + 1}</span>
                      <Badge variant="outline" className="text-xs">
                        {img.quality}/100
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      {img.brightness && (
                        <div className="flex items-center gap-2">
                          {img.brightness === 'good' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-600" />
                          )}
                          <span>Helligkeit: {img.brightness === 'good' ? 'Optimal' : 'Anpassung empfohlen'}</span>
                        </div>
                      )}
                      {img.sharpness && (
                        <div className="flex items-center gap-2">
                          {img.sharpness === 'good' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-600" />
                          )}
                          <span>Schärfe: {img.sharpness === 'good' ? 'Scharf' : 'Unscharf'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths && analysis.strengths.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold mb-2 text-green-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Stärken
                </p>
                <ul className="text-sm text-green-800 space-y-1">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements && analysis.improvements.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-semibold mb-2 text-amber-900 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Verbesserungsvorschläge
                </p>
                <ul className="text-sm text-amber-800 space-y-1">
                  {analysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips */}
            {analysis.tips && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold mb-1 text-blue-900">💡 Profi-Tipps</p>
                <p className="text-sm text-blue-800">{analysis.tips}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={analyzeImages}
                variant="outline"
                size="sm"
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