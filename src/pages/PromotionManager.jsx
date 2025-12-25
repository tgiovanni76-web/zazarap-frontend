import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Calendar, Euro, Eye, MessageSquare, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function PromotionCard({ promo, onExtend }) {
  const [showExtension, setShowExtension] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const queryClient = useQueryClient();

  const extendMutation = useMutation({
    mutationFn: async ({ promotionId, days }) => {
      const res = await base44.functions.invoke('extendPromotion', { 
        promotionId, 
        extensionDays: days 
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success(`Verlängerung vorbereitet: ${data.extensionDays} Tage für €${data.amount.toFixed(2)}`);
        setPaymentUrl(data.clientSecret);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleExtend = () => {
    extendMutation.mutate({ promotionId: promo.promotionId, days: extensionDays });
  };

  const statusColor = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }[promo.status] || 'bg-slate-100 text-slate-800';

  const typeLabel = promo.type === 'featured' ? '⭐ Hervorgehoben' : '🔝 TOP-Anzeige';
  const isActive = promo.status === 'paid' && new Date(promo.endDate) > new Date();
  const isExpiringSoon = isActive && 
    (new Date(promo.endDate) - new Date()) < 3 * 24 * 60 * 60 * 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{promo.listingTitle}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={statusColor}>{promo.status}</Badge>
              <Badge variant="outline">{typeLabel}</Badge>
              {isExpiringSoon && (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Läuft bald ab
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">€{promo.amount}</div>
            <div className="text-sm text-slate-500">{promo.durationDays} Tage</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-slate-500">Start</div>
            <div className="font-medium">
              {new Date(promo.startDate).toLocaleDateString('de-DE')}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Ende</div>
            <div className="font-medium">
              {new Date(promo.endDate).toLocaleDateString('de-DE')}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg mb-4">
          <div className="text-center">
            <Eye className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <div className="font-bold">{promo.metrics.views}</div>
            <div className="text-xs text-slate-500">Ansichten</div>
          </div>
          <div className="text-center">
            <MessageSquare className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <div className="font-bold">{promo.metrics.messages}</div>
            <div className="text-xs text-slate-500">Nachrichten</div>
          </div>
          <div className="text-center">
            <Star className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <div className="font-bold">{promo.metrics.favorites}</div>
            <div className="text-xs text-slate-500">Favoriten</div>
          </div>
          <div className="text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-slate-500 mb-1" />
            <div className="font-bold">{promo.metrics.conversionRate}%</div>
            <div className="text-xs text-slate-500">Conversion</div>
          </div>
        </div>

        {/* Extension UI */}
        {isActive && !showExtension && (
          <Button 
            onClick={() => setShowExtension(true)}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Promotion verlängern
          </Button>
        )}

        <Dialog open={showExtension} onOpenChange={setShowExtension}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promotion verlängern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Verlängerung wählen:</label>
                <select 
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(Number(e.target.value))}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value={7}>7 Tage</option>
                  <option value={14}>14 Tage</option>
                  <option value={30}>30 Tage</option>
                </select>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Geschätzter Preis:</div>
                <div className="text-2xl font-bold">
                  €{((promo.amount / promo.durationDays) * extensionDays).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Basierend auf €{(promo.amount / promo.durationDays).toFixed(2)}/Tag
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleExtend}
                  disabled={extendMutation.isPending}
                  className="flex-1"
                >
                  {extendMutation.isPending ? 'Wird verarbeitet...' : 'Zur Zahlung'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowExtension(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default function PromotionManager() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['promotionAnalytics'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPromotionAnalytics', {});
      return res.data;
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Bitte anmelden</h2>
        <Button onClick={() => base44.auth.redirectToLogin()}>
          Anmelden
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="py-20 text-center">Lädt Promotions...</div>;
  }

  const active = analytics?.promotions.filter(p => 
    p.status === 'paid' && new Date(p.endDate) > new Date()
  ) || [];
  const expired = analytics?.promotions.filter(p => 
    new Date(p.endDate) <= new Date()
  ) || [];
  const cancelled = analytics?.promotions.filter(p => 
    p.status === 'cancelled' || p.status === 'pending_cancellation'
  ) || [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Promotion Manager</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Aktive Promotions</div>
            <div className="text-3xl font-bold">{analytics?.summary.activePromotions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Gesamt Ausgaben</div>
            <div className="text-3xl font-bold text-green-600">
              €{analytics?.summary.totalSpent.toFixed(0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Gesamt Ansichten</div>
            <div className="text-3xl font-bold">{analytics?.summary.totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Ø Conversion</div>
            <div className="text-3xl font-bold">
              {analytics?.summary.avgConversionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Aktiv ({active.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Abgelaufen ({expired.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Storniert ({cancelled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {active.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Keine aktiven Promotions
              </CardContent>
            </Card>
          ) : (
            active.map(promo => (
              <PromotionCard key={promo.promotionId} promo={promo} />
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4 mt-4">
          {expired.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Keine abgelaufenen Promotions
              </CardContent>
            </Card>
          ) : (
            expired.map(promo => (
              <PromotionCard key={promo.promotionId} promo={promo} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4 mt-4">
          {cancelled.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Keine stornierten Promotions
              </CardContent>
            </Card>
          ) : (
            cancelled.map(promo => (
              <PromotionCard key={promo.promotionId} promo={promo} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}