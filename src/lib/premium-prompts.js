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
    [PremiumReasons.AFTER_PUBLISH]: 'Dai slancio al tuo annuncio! 🚀',
    [PremiumReasons.NO_MESSAGES_24H]: 'Nessun messaggio ancora? Aumenta la visibilità',
    [PremiumReasons.VIEWS_NO_MESSAGES]: 'Molte visualizzazioni, nessun contatto? Rendi l’annuncio Premium',
    [PremiumReasons.FIRST_MESSAGE]: 'Più messaggi e offerte grazie a Premium',
    [PremiumReasons.EXPIRING_48H]: 'Sta per scadere: metti in evidenza ora',
  };
  const bodyMap = {
    [PremiumReasons.AFTER_PUBLISH]: 'Appena pubblicato: parti in pole position con maggiore visibilità e priorità nei risultati.',
    [PremiumReasons.NO_MESSAGES_24H]: 'Dopo 24 ore senza contatti, un boost Premium può fare la differenza con badge e posizionamento migliori.',
    [PremiumReasons.VIEWS_NO_MESSAGES]: 'Il tuo annuncio viene visto ma non converte: prova il boost Premium per aumentare i contatti.',
    [PremiumReasons.FIRST_MESSAGE]: 'Stanno arrivando contatti: amplifica la portata e ricevi più offerte attivando Premium.',
    [PremiumReasons.EXPIRING_48H]: 'Mancano meno di 2 giorni: evita il calo di visibilità e promuovi prima della scadenza.',
  };
  return {
    title: titleMap[reason] || 'Rendi l’annuncio Premium',
    body: bodyMap[reason] || 'Aumenta visibilità, fiducia e conversioni con il pacchetto Premium.',
    cta: 'Scopri Premium',
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