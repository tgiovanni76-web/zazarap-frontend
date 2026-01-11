import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ThumbsUp, ThumbsDown, Send, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoResponseGenerator({ review, onResponsePublished }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateReviewResponse', {
        reviewId: review.id,
        autoPublish: false
      });

      if (response.data?.success) {
        setGeneratedResponse(response.data.generatedResponse);
        setEditedResponse(response.data.generatedResponse.text);
        toast.success('Risposta generata!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Errore durante la generazione');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await base44.entities.Review.update(review.id, {
        sellerResponse: editedResponse,
        sellerResponseDate: new Date().toISOString(),
        sellerResponseAI: true
      });

      toast.success('Risposta pubblicata!');
      if (onResponsePublished) {
        onResponsePublished(editedResponse);
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Errore durante la pubblicazione');
    } finally {
      setIsPublishing(false);
    }
  };

  const toneIcons = {
    appreciative: '🙏',
    apologetic: '😔',
    professional: '💼',
    enthusiastic: '🎉'
  };

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          Risposta AI Automatica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{'⭐'.repeat(review.rating)}</span>
              <Badge variant="outline">{review.rating}/5</Badge>
            </div>
            <p className="text-sm text-slate-700 italic">"{review.comment}"</p>
            <p className="text-xs text-slate-500 mt-2">
              da {review.reviewer_email}
            </p>
          </div>

          {!generatedResponse ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Genera Risposta AI
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tono:</span>
                  <Badge variant="outline">
                    {toneIcons[generatedResponse.tone]} {generatedResponse.tone}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Rigenera
                </Button>
              </div>

              <Textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                rows={6}
                className="text-sm"
                placeholder="Modifica la risposta se necessario..."
              />

              {generatedResponse.suggestedAction && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-medium text-blue-900">
                    💡 Azione suggerita: {generatedResponse.suggestedAction}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing || !editedResponse.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Pubblica Risposta
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}