import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function PromoteListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  const promoteMutation = useMutation({
    mutationFn: async (days) => {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + days);

      await base44.entities.Listing.update(listingId, {
        featured: true,
        featuredUntil: featuredUntil.toISOString()
      });

      await base44.entities.Notification.create({
        userId: user.email,
        type: 'status_update',
        title: '⭐ Annuncio in evidenza!',
        message: `Il tuo annuncio "${listing.title}" è ora in evidenza per ${days} giorni`,
        linkUrl: `/ListingDetail?id=${listingId}`,
        relatedId: listingId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Annuncio messo in evidenza con successo!');
      navigate(createPageUrl('ListingDetail') + '?id=' + listingId);
    },
  });

  if (isLoading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (listing.created_by !== user?.email) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold">Accesso negato</h2>
        <p className="text-slate-600">Puoi promuovere solo i tuoi annunci.</p>
      </div>
    );
  }

  const plans = [
    { days: 3, price: 4.99, label: 'Base', features: ['3 giorni in evidenza', 'Visibilità aumentata', 'Badge distintivo'] },
    { days: 7, price: 9.99, label: 'Standard', popular: true, features: ['7 giorni in evidenza', 'Visibilità aumentata', 'Badge distintivo', 'Posizione prioritaria'] },
    { days: 14, price: 17.99, label: 'Premium', features: ['14 giorni in evidenza', 'Visibilità massima', 'Badge distintivo', 'Posizione prioritaria', 'Supporto prioritario'] },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-center">Metti in Evidenza il tuo Annuncio</h2>
      <p className="text-slate-600 text-center mb-8">Aumenta la visibilità e ricevi più contatti</p>

      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {listing.images?.[0] && (
              <img src={listing.images[0]} alt={listing.title} className="w-24 h-24 object-cover rounded" />
            )}
            <div>
              <h3 className="font-bold text-lg">{listing.title}</h3>
              <p className="text-xl font-bold text-red-600">{listing.price} €</p>
              {listing.featured && (
                <Badge className="mt-2 bg-yellow-500 text-black">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Già in evidenza fino al {listing.featuredUntil ? new Date(listing.featuredUntil).toLocaleDateString() : 'N/A'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.days}
            className={`cursor-pointer transition-all ${
              selectedPlan?.days === plan.days 
                ? 'border-2 border-yellow-500 shadow-lg' 
                : 'hover:shadow-md'
            } ${plan.popular ? 'border-2 border-yellow-400' : ''}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.label}</CardTitle>
                {plan.popular && (
                  <Badge className="bg-yellow-500 text-black">Popolare</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">{plan.price} €</p>
                <p className="text-sm text-slate-600">{plan.days} giorni</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={() => promoteMutation.mutate(selectedPlan.days)}
          disabled={!selectedPlan}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 text-lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Procedi al Pagamento ({selectedPlan?.price || '0.00'} €)
        </Button>
        <p className="text-xs text-slate-500 mt-4">Pagamento simulato - L'annuncio sarà promosso immediatamente</p>
      </div>
    </div>
  );
}