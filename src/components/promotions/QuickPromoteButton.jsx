import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from 'lucide-react';
import DirectPromotionModal from './DirectPromotionModal';

export default function QuickPromoteButton({ listingId, listingTitle, variant = 'default', size = 'default', className = '' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`}
      >
        <Zap className="w-4 h-4 mr-2" />
        Jetzt hervorheben
      </Button>

      <DirectPromotionModal
        listingId={listingId}
        listingTitle={listingTitle}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}