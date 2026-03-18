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
    const listingId = state.listing?.id;
    // Close immediately for snappier UX
    setState({ open: false, copy: null, listing: null, reason: null });
    // Update throttle timestamp in background (non-blocking)
    if (listingId) {
      base44.entities.Listing.update(listingId, { lastBoostPromptAt: new Date().toISOString() });
    }
  };

  const handleConfirm = async () => {
    const listingId = state.listing?.id;
    const reason = state.reason;
    // Close immediately
    setState({ open: false, copy: null, listing: null, reason: null });
    if (listingId) {
      // Fire-and-forget update + tracking, do not block navigation
      base44.entities.Listing.update(listingId, { lastBoostPromptAt: new Date().toISOString() });
      base44.analytics.track({ eventName: 'premium_prompt_cta_click', properties: { listing_id: listingId, reason } });
      const url = createPremiumUrl(listingId, reason);
      window.location.href = url; // navigate maintaining layout routing
    }
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