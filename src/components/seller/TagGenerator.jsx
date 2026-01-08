import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Tags, Sparkles, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function TagGenerator({ 
  title, 
  description, 
  category, 
  price, 
  images,
  onTagsSelect 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTags, setGeneratedTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [reasoning, setReasoning] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleGenerate = async () => {
    if (!title) {
      toast.error('Inserisci un titolo prima di generare i tag');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateOptimalTags', {
        title,
        description,
        category,
        price,
        images
      });

      if (response.data?.tags) {
        setGeneratedTags(response.data.tags);
        setSelectedTags(response.data.tags);
        setTrendingTags(response.data.trendingTags || []);
        setReasoning(response.data.reasoning || '');
        toast.success(`${response.data.tags.length} tag generati con AI`);
      }
    } catch (error) {
      toast.error('Errore nella generazione dei tag');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    onTagsSelect(selectedTags);
    toast.success('Tag applicati');
  };

  if (generatedTags.length === 0) {
    return (
      <Card className="mb-4 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tags className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">
                🏷️ Generatore Tag AI
              </h3>
              <p className="text-sm text-purple-700 mb-3">
                Genera automaticamente tag ottimizzati per SEO e visibilità basati su AI e trend di mercato.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !title}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Genera Tag Ottimizzati
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-purple-900 flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Tag Generati AI ({selectedTags.length})
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Nascondi Dettagli' : 'Mostra Dettagli'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Rigenera'
              )}
            </Button>
          </div>
        </div>

        {showDetails && reasoning && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs font-medium text-purple-700 mb-1">Strategia AI:</p>
            <p className="text-sm text-slate-600">{reasoning}</p>
          </div>
        )}

        {trendingTags.length > 0 && showDetails && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Tag Trending nella Categoria:
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  🔥 {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-purple-700 mb-2">
            Seleziona i tag da includere (clicca per attivare/disattivare):
          </p>
          <div className="flex flex-wrap gap-2">
            {generatedTags.map((tag, idx) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={idx}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {tag}
                  {isSelected && <X className="inline-block ml-1 h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={selectedTags.length === 0}
          >
            <Tags className="h-4 w-4 mr-2" />
            Applica {selectedTags.length} Tag
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setGeneratedTags([]);
              setSelectedTags([]);
              setReasoning('');
            }}
          >
            Annulla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}