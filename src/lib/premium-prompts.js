// @ts-check
// Centralized utility for Premium upgrade triggers & reasons
export const PremiumReasons = {
  AFTER_PUBLISH: 'after_publish',
  NO_MESSAGES_24H: 'no_messages_24h',
  VIEWS_NO_MESSAGES: 'views_no_messages',
  FIRST_MESSAGE: 'first_message',
  EXPIRING_48H: 'expiring_48h',
};

export function buildPremiumCopy(reason, listing) {
  const titleMap = {
    [PremiumReasons.AFTER_PUBLISH]: 'Neu veröffentlicht? Jetzt Sichtbarkeit steigern',
    [PremiumReasons.NO_MESSAGES_24H]: 'Noch keine Anfragen? Steigern Sie Ihre Sichtbarkeit jetzt',
    [PremiumReasons.VIEWS_NO_MESSAGES]: 'Viele Aufrufe, aber keine Anfragen?',
    [PremiumReasons.FIRST_MESSAGE]: 'Mehr Nachrichten und Angebote mit Premium',
    [PremiumReasons.EXPIRING_48H]: 'Bald weniger Sichtbarkeit – jetzt hervorheben',
  };
  const bodyMap = {
    [PremiumReasons.AFTER_PUBLISH]: 'Ihre Anzeige ist neu online. Mit Premium sichern Sie sich bessere Platzierungen und mehr Reichweite. Ohne Boost sinkt die Sichtbarkeit mit der Zeit.',
    [PremiumReasons.NO_MESSAGES_24H]: 'Ihre Anzeige wird aktuell weniger gesehen. Mit Premium erreichen Sie bis zu 10x mehr Käufer. Ohne Boost sinkt die Sichtbarkeit mit der Zeit.',
    [PremiumReasons.VIEWS_NO_MESSAGES]: 'Ihre Anzeige wird angesehen, aber führt zu keinen Kontakten. Premium erhöht Reichweite und Sichtbarkeit – für mehr Anfragen.',
    [PremiumReasons.FIRST_MESSAGE]: 'Die ersten Kontakte kommen rein – verstärken Sie jetzt die Reichweite und erhalten Sie mehr Angebote mit Premium.',
    [PremiumReasons.EXPIRING_48H]: 'Ihre Sichtbarkeit nimmt demnächst ab. Vermeiden Sie den Rückgang und heben Sie die Anzeige jetzt hervor.',
  };
  return {
    title: titleMap[reason] || 'Anzeige hervorheben',
    body: bodyMap[reason] || 'Mit Premium steigern Sie Sichtbarkeit, Vertrauen und Conversion. Ohne Boost sinkt die Sichtbarkeit mit der Zeit.',
    cta: 'Jetzt hervorheben',
  };
}

export function canShowPrompt(listing) {
  if (!listing) return false;
  // Do not prompt if already premium (featured or topAdUntil in future)
  const now = Date.now();
  const isPremium = Boolean(listing.featured) || (listing.topAdUntil && new Date(listing.topAdUntil).getTime() > now) || (listing.featuredUntil && new Date(listing.featuredUntil).getTime() > now);
  if (isPremium) return false;

  // Throttle: max 1 every 24h per listing
  if (listing.lastBoostPromptAt) {
    const last = new Date(listing.lastBoostPromptAt).getTime();
    if (now - last < 24 * 60 * 60 * 1000) return false;
  }
  return true;
}

export function shouldTrigger(reason, context) {
  // context provides signals for each rule
  switch (reason) {
    case PremiumReasons.AFTER_PUBLISH:
      return context?.justPublished === true;
    case PremiumReasons.NO_MESSAGES_24H:
      return context?.ageHours >= 24 && context?.messagesCount === 0;
    case PremiumReasons.VIEWS_NO_MESSAGES:
      return (context?.viewsCount || 0) >= 5 && (context?.messagesCount || 0) === 0;
    case PremiumReasons.FIRST_MESSAGE:
      return context?.firstMessageJustArrived === true;
    case PremiumReasons.EXPIRING_48H:
      return context?.hoursToExpiry != null && context.hoursToExpiry <= 48 && context.hoursToExpiry > 0;
    default:
      return false;
  }
}