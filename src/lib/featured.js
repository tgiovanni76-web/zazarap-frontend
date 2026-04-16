// Centralized "featured" logic
// A listing is considered featured ONLY if featured=true AND topAdUntil is in the future
export function isListingFeatured(listing) {
  if (!listing) return false;
  const hasFlag = !!listing.featured;
  const until = listing.topAdUntil ? new Date(listing.topAdUntil) : null;
  return Boolean(hasFlag && until && until > new Date());
}