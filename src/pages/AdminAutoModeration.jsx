import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, AlertCircle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function AdminAutoModeration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: pendingListings = [], refetch } = useQuery({
    queryKey: ['pendingListings'],
    queryFn: async () => {
      return base44.entities.Listing.filter({ moderationStatus: 'pending' });
    }
  });

  const { data: recentEvents = [] } = useQuery({
    queryKey: ['recentModerationEvents'],
    queryFn: async () => {
      return base44.entities.ModerationEvent.filter(
        { automatedDecision: true },
        '-created_date',
        20
      );
    }
  });

  const handleBulkModeration = async () => {
    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('bulkAutoModerate', {});
      
      if (response.data?.success) {
        setResults(response.data);
        toast.success(`Moderazione completata: ${response.data.totalProcessed} annunci analizzati`);
        refetch();
      }
    } catch (error) {
      console.error('Bulk moderation error:', error);
      toast.error('Errore durante la moderazione automatica');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-center text-slate-700">Accesso negato</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          Moderazione AI Automatica
        </h2>
        <Link to={createPageUrl('AdminDashboard')}>
          <Button variant="outline">Torna al Dashboard</Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Attesa</p>
                <p className="text-2xl font-bold">{pendingListings.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {results && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Approvati</p>
                    <p className="text-2xl font-bold text-green-600">{results.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Rifiutati</p>
                    <p className="text-2xl font-bold text-red-600">{results.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Da Revisionare</p>
                    <p className="text-2xl font-bold text-yellow-600">{results.needsReview}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Bulk Moderation Control */}
      <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle>Moderazione Automatica di Massa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Avvia la moderazione AI automatica per tutti gli annunci in attesa. 
              Il sistema analizzerà ogni annuncio per frodi, contenuti inappropriati e qualità.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBulkModeration}
                disabled={isProcessing || pendingListings.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Elaborazione in corso...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Avvia Moderazione AI
                  </>
                )}
              </Button>
              {pendingListings.length > 0 && (
                <span className="text-sm text-slate-600">
                  {pendingListings.length} annunci verranno analizzati
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Results */}
      {results && results.results && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Risultati Ultima Elaborazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.results.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{result.title}</p>
                    {result.error && (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                  {result.action && (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          result.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          result.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          result.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {result.riskLevel}
                      </Badge>
                      {result.action === 'approve' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {result.action === 'reject' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {result.action === 'review' && (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Automated Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>Decisioni AI Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Nessuna decisione automatica recente
              </p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-slate-50 rounded-lg border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {event.action === 'approve' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {event.action === 'reject' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        {event.action === 'review' && (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="font-medium text-sm">
                          {event.action === 'approve' ? 'Approvato' :
                           event.action === 'reject' ? 'Rifiutato' : 'In Revisione'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{event.reason}</p>
                      <Link
                        to={createPageUrl('ListingDetail') + '?id=' + event.listingId}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Vedi Annuncio →
                      </Link>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(event.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}