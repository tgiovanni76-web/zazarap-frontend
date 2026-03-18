Premium Prompt System

- lib/premium-prompts.js: reasons, copy builder, gating (isPremium + 24h throttle), rules evaluation
- components/premium/PremiumUpsellModal.jsx: reusable modal UI
- components/premium/PremiumPromptManager.jsx: scans listings, decides, tracks events, updates lastBoostPromptAt, navigates to WarumPremium with listingId + reason

Integration points:
- pages/MyListings: <PremiumPromptManager listings={activeListings} contextProvider={provider} />
- pages/ListingDetail (owner): <PremiumPromptManager listings={[listing]} contextProvider={provider} />

Analytics events:
- premium_prompt_shown { listing_id, reason }
- premium_prompt_cta_click { listing_id, reason }