// Utility formatters for currency and numbers with locale awareness
export const getLocaleFromLang = (lang) => ({
  de: 'de-DE',
  it: 'it-IT',
  en: 'en-US',
  fr: 'fr-FR',
  pl: 'pl-PL',
  tr: 'tr-TR',
  uk: 'uk-UA',
}[lang] || 'de-DE');

export const formatCurrency = (value, lang = 'de') => {
  const locale = getLocaleFromLang(lang);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `${Number(value || 0).toFixed(0)}€`;
  }
};

export const formatNumber = (value, lang = 'de', digits = 1) => {
  const locale = getLocaleFromLang(lang);
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number(value) || 0);
  } catch {
    return String(Number(value || 0).toFixed(digits));
  }
};