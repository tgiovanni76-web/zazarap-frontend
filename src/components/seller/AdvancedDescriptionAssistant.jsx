import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, Wand2, Copy, Loader2, CheckCircle2, 
  FileText, Target, Hash, Heart, AlertCircle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedDescriptionAssistant({ 
  title, 
  category, 
  condition, 
  price, 
  images, 
  onDescriptionSelect,
  onSeoSelect 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [features, setFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('generale');
  const [tone, setTone] = useState('amichevole');
  const [selectedVersion, setSelectedVersion] = useState('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generate = async () => {
    if (!title) {
      toast.error('Inserisci prima un titolo');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generateAdvancedDescription', {
        title,
        category,
        condition,
        keywords,
        features,
        price,
        images,
        targetAudience,
        tone
      });

      if (response.data?.success) {
        setGenerated(response.data);
        toast.success('Descrizioni generate con successo!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Errore nella generazione');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato negli appunti');
  };

  const getSelectedDescription = () => {
    if (!generated?.descriptions) return '';
    return generated.descriptions[selectedVersion]?.text || '';
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-600" />
          Assistente AI per Descrizioni
          <Badge className="ml-2 bg-purple-100 text-purple-700">Pro</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Parole chiave principali
              </label>
              <Input
                placeholder="es. nuovo, originale, garanzia..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Caratteristiche specifiche
              </label>
              <Input
                placeholder="es. 128GB, colore nero, anno 2023..."
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
              />
            </div>
          </div>

          {/* Advanced options toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Opzioni avanzate
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Target</label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generale">Generale</SelectItem>
                      <SelectItem value="giovani">Giovani (18-30)</SelectItem>
                      <SelectItem value="famiglie">Famiglie</SelectItem>
                      <SelectItem value="professionisti">Professionisti</SelectItem>
                      <SelectItem value="collezionisti">Collezionisti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tono</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amichevole">Amichevole</SelectItem>
                      <SelectItem value="professionale">Professionale</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="lusso">Lusso/Premium</SelectItem>
                      <SelectItem value="giovane">Giovane/Dinamico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate button */}
          {!generated ? (
            <Button 
              onClick={generate} 
              disabled={isLoading || !title}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generazione AI in corso...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Genera Descrizioni AI
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-6">
              {/* Description versions tabs */}
              <Tabs value={selectedVersion} onValueChange={setSelectedVersion}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="short">
                    <FileText className="h-3 w-3 mr-1" />
                    Breve
                  </TabsTrigger>
                  <TabsTrigger value="standard">
                    <FileText className="h-3 w-3 mr-1" />
                    Standard
                  </TabsTrigger>
                  <TabsTrigger value="detailed">
                    <FileText className="h-3 w-3 mr-1" />
                    Dettagliata
                  </TabsTrigger>
                </TabsList>

                {['short', 'standard', 'detailed'].map(version => (
                  <TabsContent key={version} value={version}>
                    <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          ~{generated.descriptions?.[version]?.wordCount || 0} parole
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generated.descriptions?.[version]?.text)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        value={generated.descriptions?.[version]?.text || ''}
                        onChange={(e) => {
                          setGenerated({
                            ...generated,
                            descriptions: {
                              ...generated.descriptions,
                              [version]: {
                                ...generated.descriptions[version],
                                text: e.target.value
                              }
                            }
                          });
                        }}
                        className="min-h-32"
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Alternative headline */}
              {generated.headline && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">💡 Titolo alternativo suggerito</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generated.headline)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-yellow-900 mt-1 font-medium">{generated.headline}</p>
                </div>
              )}

              {/* Highlights */}
              {generated.highlights?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    Punti di forza
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generated.highlights.map((h, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-800">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Target emotions */}
              {generated.targetEmotions?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    Emozioni target
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {generated.targetEmotions.map((e, idx) => (
                      <Badge key={idx} variant="outline" className="text-pink-700 border-pink-300">
                        {e}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Section */}
              {generated.seo && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-800">
                    <Hash className="h-4 w-4" />
                    Ottimizzazione SEO
                  </p>
                  
                  {generated.seo.metaTitle && (
                    <div className="mb-3">
                      <span className="text-xs text-blue-600">Meta Title</span>
                      <p className="text-sm bg-white p-2 rounded mt-1">{generated.seo.metaTitle}</p>
                    </div>
                  )}
                  
                  {generated.seo.metaDescription && (
                    <div className="mb-3">
                      <span className="text-xs text-blue-600">Meta Description</span>
                      <p className="text-sm bg-white p-2 rounded mt-1">{generated.seo.metaDescription}</p>
                    </div>
                  )}

                  {generated.seo.primaryKeywords?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-blue-600">Keywords</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generated.seo.primaryKeywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {generated.seo.hashtags?.length > 0 && (
                    <div>
                      <span className="text-xs text-blue-600">Hashtag Social</span>
                      <p className="text-sm mt-1">
                        {generated.seo.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                      </p>
                    </div>
                  )}

                  {onSeoSelect && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-3"
                      onClick={() => onSeoSelect({
                        seo_title: generated.seo.metaTitle,
                        seo_description: generated.seo.metaDescription,
                        seo_keywords: generated.seo.primaryKeywords?.join(', ')
                      })}
                    >
                      Applica SEO
                    </Button>
                  )}
                </div>
              )}

              {/* Persuasion elements */}
              {generated.persuasion && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-4 w-4" />
                    Elementi persuasivi
                  </p>

                  {generated.persuasion.urgencyTriggers?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-orange-600">Frasi di urgenza</span>
                      <ul className="text-sm mt-1 space-y-1">
                        {generated.persuasion.urgencyTriggers.map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-500">→</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {generated.persuasion.trustSignals?.length > 0 && (
                    <div>
                      <span className="text-xs text-orange-600">Segnali di fiducia</span>
                      <ul className="text-sm mt-1 space-y-1">
                        {generated.persuasion.trustSignals.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600 mt-1" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => onDescriptionSelect(getSelectedDescription())}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Usa questa descrizione
                </Button>
                <Button 
                  onClick={generate}
                  variant="outline"
                >
                  Rigenera
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}