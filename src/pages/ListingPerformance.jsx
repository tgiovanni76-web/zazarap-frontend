import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import ListingAnalytics from '../components/seller/ListingAnalytics';

export default function ListingPerformance() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.UserActivity.list('-created_date', 1000),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 500),
  });

  if (listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Anzeige nicht gefunden</h2>
        <Link to={createPageUrl('SellerDashboard')}>
          <Button>Zurück zum Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (user?.email !== listing.created_by) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h2>
        <p>Du kannst nur die Performance deiner eigenen Anzeigen sehen.</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to={createPageUrl('SellerDashboard')}>
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Performance-Analyse</h1>
          <p className="text-slate-600 mt-1">{listing.title}</p>
        </div>
      </div>

      <ListingAnalytics 
        listing={listing}
        activities={activities}
        favorites={favorites}
        messages={messages}
      />
    </div>
  );
}