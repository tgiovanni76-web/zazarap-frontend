import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Loader2, Brain } from 'lucide-react';
import { toast } from 'sonner';

export default function SmartTicketRouter({ ticket, onRoutingComplete }) {
  const [isRouting, setIsRouting] = useState(false);
  const [result, setResult] = useState(null);

  const handleRoute = async () => {
    setIsRouting(true);
    try {
      const response = await base44.functions.invoke('routeSupportTicket', {
        ticketId: ticket.id
      });

      if (response.data?.success) {
        setResult(response.data.routing);
        toast.success('Ticket instradato automaticamente');
        if (onRoutingComplete) {
          onRoutingComplete(response.data.routing);
        }
      }
    } catch (error) {
      console.error('Routing error:', error);
      toast.error('Errore durante l\'instradamento');
    } finally {
      setIsRouting(false);
    }
  };

  const departmentLabels = {
    technical: 'Tecnico',
    payments: 'Pagamenti',
    moderation: 'Moderazione',
    disputes: 'Dispute',
    account: 'Account',
    general: 'Generale'
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const sentimentIcons = {
    positive: '😊',
    neutral: '😐',
    negative: '😟',
    angry: '😡'
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Routing AI Intelligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <p className="text-sm text-slate-700">
              L'AI analizzerà il ticket e lo instradarà al dipartimento corretto con priorità appropriata
            </p>
          </div>

          <Button
            onClick={handleRoute}
            disabled={isRouting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isRouting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisi in corso...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Avvia Routing AI
              </>
            )}
          </Button>

          {result && (
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-white rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Dipartimento:</span>
                  <Badge variant="outline" className="font-semibold">
                    {departmentLabels[result.department] || result.department}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Priorità:</span>
                  <Badge className={priorityColors[result.priority]}>
                    {result.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sentiment:</span>
                  <span className="text-lg">
                    {sentimentIcons[result.sentiment]} {result.sentiment}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo stimato:</span>
                  <span className="text-sm text-slate-600">{result.estimatedResolutionTime}</span>
                </div>
              </div>

              {result.tags && result.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tag:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.preliminaryResponse && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    ✅ Risposta Preliminare Inviata:
                  </p>
                  <p className="text-xs text-green-800">{result.preliminaryResponse}</p>
                </div>
              )}

              {result.suggestedActions && result.suggestedActions.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Azioni Suggerite:
                  </p>
                  <ul className="space-y-1">
                    {result.suggestedActions.map((action, idx) => (
                      <li key={idx} className="text-xs text-blue-800">• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}