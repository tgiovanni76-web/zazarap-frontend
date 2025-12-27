import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import StatCards from '../components/seller/StatCards';
import PerformanceChart from '../components/seller/PerformanceChart';
import EventsCalendar from '../components/seller/EventsCalendar';
import ListingsTable from '../components/seller/ListingsTable';
import OffersList from '../components/seller/OffersList';
import AIImprovementSuggestions from '../components/seller/AIImprovementSuggestions';
import PromotionsManager from '../components/seller/PromotionsManager';

export default function SellerDashboard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sellerAnalytics'],
    queryFn: async () => {
      const res = await base44.functions.invoke('sellerAnalytics', {});
      return res.data;
    }
  });

  const unfeatureMutation = useMutation({
    mutationFn: (id) => base44.entities.Listing.update(id, { featured: false, featuredUntil: null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellerAnalytics'] })
  });

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Dashboard Venditore</h2>
      </div>

      <StatCards summary={data.summary} salesTotals={data.sales?.totals} />

      <PerformanceChart data={data.sales?.monthly || []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AIImprovementSuggestions listings={data.listings} />
        </div>
        <div>
          <PromotionsManager listings={data.listings} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ListingsTable listings={data.listings} onUnfeature={(id) => unfeatureMutation.mutate(id)} />
        </div>
        <div className="space-y-6">
          <EventsCalendar events={data.events} />
          <OffersList offers={data.offers} />
        </div>
      </div>
    </div>
  );
}