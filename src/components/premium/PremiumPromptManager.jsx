import React, { useEffect, useMemo, useState } from 'react';
import PremiumUpsellModal from './PremiumUpsellModal';
import { PremiumReasons, buildPremiumCopy, canShowPrompt, shouldTrigger } from '@/lib/premium-prompts';
import { base44 } from '@/api/base44Client';

/**
 * Usage: place <PremiumPromptManager listings={arrayOfUserListings} contextProvider={fn(listing)=>signals}/> once per page
 * - Does NOT change business logic; only shows a modal and navigates on confirm
 */
export default function PremiumPromptManager({ listings = [], contextProvider }) {
  const [state, setState] = useState({ open: false, copy: null, listing: null, reason: null });

  const candidates = useMemo(() => {
    const now = Date.now();
    return (listings || []).filter(l => l?.status === 'active');
  }, [listings]);

  useEffect(() => {
    if (!candidates?.length || state.open) return;

    for (const listing of candidates) {
      if (!canShowPrompt(listing)) continue;
      const ctx = contextProvider ? contextProvider(listing) : {};

      const rules = [
        PremiumReasons.AFTER_PUBLISH,
        PremiumReasons.NO_MESSAGES_24H,
        PremiumReasons.VIEWS_NO_MESSAGES,
        PremiumReasons.FIRST_MESSAGE,
        PremiumReasons.EXPIRING_48H,
      ];

      for (const reason of rules) {
        if (shouldTrigger(reason, ctx)) {
          const copy = buildPremiumCopy(reason, listing);
          // Track show
          base44.analytics.track({ eventName: 'premium_prompt_shown', properties: { listing_id: listing.id, reason } });
          setState({ open: true, copy, listing, reason });
          return;
        }
      }
    }
  }, [candidates, state.open, contextProvider]);

  const handleClose = async () => {
    if (state.listing) {
      // Update throttle timestamp
      await base44.entities.Listing.update(state.listing.id, { lastBoostPromptAt: new Date().toISOString() });
    }
    setState({ open: false, copy: null, listing: null, reason: null });
  };

  const handleConfirm = async () => {
    if (state.listing) {
      await base44.entities.Listing.update(state.listing.id, { lastBoostPromptAt: new Date().toISOString() });
      base44.analytics.track({ eventName: 'premium_prompt_cta_click', properties: { listing_id: state.listing.id, reason: state.reason } });
      const url = createPremiumUrl(state.listing.id, state.reason);
      window.location.href = url; // navigate maintaining layout routing
    }
    setState({ open: false, copy: null, listing: null, reason: null });
  };

  return (
    <PremiumUpsellModal
      open={state.open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      copy={state.copy}
      listing={state.listing}
    />
  );
}

function createPremiumUrl(listingId, reason) {
  const base = '/WarumPremium';
  const params = new URLSearchParams({ listingId, reason });
  return `${base}?${params.toString()}`;
}