import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Camera, Loader2, CheckCircle2, AlertCircle, Lightbulb,
  Star, Sun, Focus, Layout, Smartphone, Zap, Image as ImageIcon,
  ChevronRight, Trophy
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedImageAnalyzer({ images, category, onReorderImages }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeImages = async () => {
    if (!images || images.length === 0) {
      toast.error('Carica almeno un\'immagine');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeImageSuggestions', {
        images,
        category
      });

      if (response.data?.success) {
        setAnalysis(response.data);
        toast.success('Analisi completata!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Errore nell\'analisi');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRatingLabel = (rating) => {
    const labels = {
      'eccellente': { label: 'Eccellente', color: 'bg-green-500' },
      'buono': { label: 'Buono', color: 'bg-blue-500' },
      'sufficiente': { label: 'Sufficiente', color: 'bg-yellow-500' },
      'da_migliorare': { label: 'Da migliorare', color: 'bg-red-500' }
    };
    return labels[rating] || labels.sufficiente;
  };

  return (
    <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-cyan-600" />
          Analisi Avanzata Immagini
          <Badge className="ml-2 bg-cyan-100 text-cyan-700">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-cyan-600" />
            </div>
            <p className="text-slate-600 mb-2">
              L'AI analizzerà le tue foto e ti dirà:
            </p>
            <ul className="text-sm text-slate-500 mb-6 space-y-1">
              <li>✓ Quale foto usare come principale</li>
              <li>✓ Come migliorare ogni immagine</li>
              <li>✓ Quali angolazioni mancano</li>
              <li>✓ Tips per foto professionali</li>
            </ul>
            <Button 
              onClick={analyzeImages} 
              disabled={isAnalyzing || !images || images.length === 0}
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisi in corso...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analizza {images?.length || 0} immagini
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall score */}
            <div className="bg-white p-4 rounded-xl border-2 border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Punteggio complessivo</span>
                <Badge className={getRatingLabel(analysis.overallRating).color + ' text-white'}>
                  {getRatingLabel(analysis.overallRating).label}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}
                </div>
                <div className="flex-1">
                  <Progress value={analysis.overallScore} className="h-3" />
                </div>
                <span className="text-slate-400">/100</span>
              </div>
            </div>

            {/* Best main photo */}
            {analysis.bestMainPhoto && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-800">
                      Foto principale consigliata: Immagine {analysis.bestMainPhoto.index + 1}
                    </p>
                    <p className="text-sm text-yellow-700">
                      Punteggio: {analysis.bestMainPhoto.score}/100
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for detailed analysis */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  Foto
                </TabsTrigger>
                <TabsTrigger value="missing">
                  <Layout className="h-3 w-3 mr-1" />
                  Mancanti
                </TabsTrigger>
                <TabsTrigger value="fixes">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Fix Rapidi
                </TabsTrigger>
                <TabsTrigger value="tips">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Tips
                </TabsTrigger>
              </TabsList>

              {/* Individual images analysis */}
              <TabsContent value="overview" className="space-y-3">
                {analysis.analyses?.map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img 
                          src={img.imageUrl} 
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Foto {idx + 1}</span>
                          <Badge className={getScoreBg(img.overallScore)}>
                            {img.overallScore}/100
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {img.lighting && (
                            <div className="flex items-center gap-1">
                              <Sun className={`h-3 w-3 ${img.lighting.score >= 70 ? 'text-green-500' : 'text-yellow-500'}`} />
                              <span>Luce: {img.lighting.score}</span>
                            </div>
                          )}
                          {img.technicalQuality && (
                            <div className="flex items-center gap-1">
                              <Focus className={`h-3 w-3 ${img.technicalQuality.score >= 70 ? 'text-green-500' : 'text-yellow-500'}`} />
                              <span>Qualità: {img.technicalQuality.score}</span>
                            </div>
                          )}
                          {img.composition && (
                            <div className="flex items-center gap-1">
                              <Layout className={`h-3 w-3 ${img.composition.score >= 70 ? 'text-green-500' : 'text-yellow-500'}`} />
                              <span>Comp: {img.composition.score}</span>
                            </div>
                          )}
                        </div>

                        {img.productPresentation?.missingDetails?.length > 0 && (
                          <p className="text-xs text-orange-600 mt-2">
                            ⚠️ Dettagli mancanti: {img.productPresentation.missingDetails.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Missing shots */}
              <TabsContent value="missing" className="space-y-3">
                {analysis.recommendations?.missingEssentialShots?.length > 0 ? (
                  analysis.recommendations.missingEssentialShots.map((shot, idx) => (
                    <div key={idx} className="bg-white rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">{shot.type}</span>
                        <Badge variant={shot.importance === 'critica' ? 'destructive' : 'secondary'}>
                          {shot.importance}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{shot.reason}</p>
                      <div className="p-2 bg-blue-50 rounded text-sm">
                        <p className="font-medium text-blue-800 mb-1">Come scattarla:</p>
                        <p className="text-blue-700">{shot.howToShoot}</p>
                      </div>
                      {shot.compositionTip && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          💡 {shot.compositionTip}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                    <p>Hai tutte le angolazioni essenziali!</p>
                  </div>
                )}

                {analysis.recommendations?.lifestyleShots?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-medium text-purple-800 mb-2">📸 Idee per foto lifestyle</p>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {analysis.recommendations.lifestyleShots.map((shot, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5" />
                          {shot}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              {/* Quick fixes */}
              <TabsContent value="fixes" className="space-y-3">
                {analysis.quickFixes?.map((fix, idx) => (
                  <div key={idx} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium">{fix.title}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Impatto: {fix.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ⏱️ {fix.timeRequired}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{fix.description}</p>
                    
                    {fix.steps?.length > 0 && (
                      <ol className="text-sm space-y-1">
                        {fix.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="font-medium text-cyan-600">{sIdx + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </TabsContent>

              {/* Smartphone tips */}
              <TabsContent value="tips" className="space-y-3">
                {analysis.smartphoneTips?.length > 0 && (
                  <div className="bg-white rounded-lg border p-4">
                    <p className="font-medium mb-3 flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-cyan-600" />
                      Tips per smartphone
                    </p>
                    <ul className="space-y-2">
                      {analysis.smartphoneTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.freeTools?.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
                    <p className="font-medium mb-3">🛠️ App gratuite consigliate</p>
                    <div className="space-y-2">
                      {analysis.freeTools.map((tool, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                          <div>
                            <p className="font-medium text-sm">{tool.name}</p>
                            <p className="text-xs text-slate-500">{tool.purpose}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {tool.platform}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Summary */}
            {analysis.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.summary.strengths?.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-2">✅ Punti di forza</p>
                    <ul className="text-xs text-green-700 space-y-1">
                      {analysis.summary.strengths.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.summary.criticalIssues?.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-semibold text-red-800 mb-2">⚠️ Da correggere</p>
                    <ul className="text-xs text-red-700 space-y-1">
                      {analysis.summary.criticalIssues.map((i, idx) => (
                        <li key={idx}>• {i}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={analyzeImages}
                variant="outline"
                className="flex-1"
              >
                Rianalizza
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}