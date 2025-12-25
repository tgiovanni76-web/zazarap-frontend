import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import DirectPromotionModal from '../components/promotions/DirectPromotionModal';

export default function QuickPromote() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Anzeige nicht gefunden</h2>
        <Button onClick={() => navigate('/marketplace')}>
          Zurück zum Marktplatz
        </Button>
      </div>
    );
  }

  const handleClose = () => {
    setShowModal(false);
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Button
        onClick={() => navigate(`/listing/${listingId}`)}
        variant="outline"
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Anzeige
      </Button>

      <DirectPromotionModal
        listingId={listingId}
        listingTitle={listing.title}
        isOpen={showModal}
        onClose={handleClose}
      />
    </div>
  );
}