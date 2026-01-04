import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Gift, TrendingUp, Copy, Share2, Sparkles, Target, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferralDashboard() {
  const [referralCode, setReferralCode] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: referralCodes = [] } = useQuery({
    queryKey: ['referralCodes', user?.email],
    queryFn: () => base44.entities.ReferralCode.filter({ userId: user.email }),
    enabled: !!user
  });

  const { data: conversions = [] } = useQuery({
    queryKey: ['referralConversions', user?.email],
    queryFn: () => base44.entities.ReferralConversion.filter({ referrerId: user.email }),
    enabled: !!user
  });

  useEffect(() => {
    if (referralCodes.length > 0) {
      setReferralCode(referralCodes[0]);
    } else if (user) {
      createReferralCode();
    }
  }, [referralCodes, user]);

  const createCodeMutation = useMutation({
    mutationFn: async () => {
      const code = `REF${user.email.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      return base44.entities.ReferralCode.create({
        userId: user.email,
        code,
        invitesSent: 0,
        conversions: 0,
        totalEarned: 0
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['referralCodes'] });
      setReferralCode(data);
    }
  });

  const createReferralCode = () => {
    createCodeMutation.mutate();
  };

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await base44.functions.invoke('generateReferralSuggestions', {});
      if (response.data?.suggestions) {
        setSuggestions(response.data);
      }
    } catch (error) {
      toast.error('Errore caricamento suggerimenti');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const copyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast.success('Codice copiato!');
    }
  };

  const shareReferral = async () => {
    const url = `${window.location.origin}${window.location.pathname}?ref=${referralCode?.code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Iscriviti a Zazarap',
          text: 'Usa il mio codice referral e ottieni un bonus!',
          url
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiato!');
  };

  const completedConversions = conversions.filter(c => c.status === 'completed');
  const pendingConversions = conversions.filter(c => c.status === 'pending' || c.status === 'qualified');

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🎁 Programma Referral</h1>
          <p className="text-slate-600 mt-1">Invita amici e guadagna insieme!</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
          <Sparkles className="h-4 w-4 mr-1" />
          Powered by AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Inviti inviati</p>
                <p className="text-2xl font-bold">{referralCode?.invitesSent || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversioni</p>
                <p className="text-2xl font-bold">{completedConversions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Guadagnato</p>
                <p className="text-2xl font-bold">{referralCode?.totalEarned?.toFixed(2) || 0}€</p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>Il tuo codice referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode && (
            <>
              <div className="flex gap-2">
                <Input
                  value={referralCode.code}
                  readOnly
                  className="text-lg font-mono font-bold text-center"
                />
                <Button onClick={copyCode} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareReferral} className="bg-purple-600 hover:bg-purple-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Gift className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Come funziona:</strong> Condividi il tuo codice con gli amici. 
                  Quando si iscrivono e completano la prima azione, entrambi ricevete ricompense personalizzate!
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Suggerimenti AI - A chi invitare
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!suggestions && !isLoadingSuggestions && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <p className="text-slate-600 mb-4">L'AI può suggerire le persone ideali da invitare basandosi sui tuoi interessi</p>
              <Button onClick={loadSuggestions} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Genera suggerimenti AI
              </Button>
            </div>
          )}

          {isLoadingSuggestions && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Analisi in corso...</p>
            </div>
          )}

          {suggestions && !isLoadingSuggestions && (
            <div className="space-y-4">
              {suggestions.personalizedIntro && (
                <Alert className="bg-purple-50 border-purple-200">
                  <AlertDescription className="text-purple-900">
                    {suggestions.personalizedIntro}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {suggestions.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{suggestion.targetType}</h4>
                          <Badge variant="outline" className="text-xs">
                            Match: {suggestion.compatibilityScore}%
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{suggestion.reason}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-sm font-medium mb-1">📧 Messaggio suggerito:</p>
                      <p className="text-sm text-slate-700 italic">"{suggestion.inviteMessage}"</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(suggestion.inviteMessage)}
                        className="mt-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copia messaggio
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={loadSuggestions}
                className="w-full"
                disabled={isLoadingSuggestions}
              >
                Rigenera suggerimenti
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Le tue conversioni</CardTitle>
        </CardHeader>
        <CardContent>
          {conversions.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Nessuna conversione ancora. Inizia a invitare!</p>
          ) : (
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{conversion.referredUserId}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(conversion.created_date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      conversion.status === 'completed' ? 'bg-green-100 text-green-800' :
                      conversion.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {conversion.status === 'completed' ? 'Completato' :
                       conversion.status === 'qualified' ? 'Qualificato' :
                       'In attesa'}
                    </Badge>
                    {conversion.referrerReward > 0 && (
                      <p className="text-sm font-bold text-green-600 mt-1">
                        +{conversion.referrerReward}€
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}