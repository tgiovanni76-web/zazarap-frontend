// @ts-check
import React, { createContext, useContext, useState, useEffect } from 'react';

const SUPPORTED_LANGS = ["de", "it", "en", "fr", "pl", "tr", "uk"];
const DEFAULT_LANG = "de";

// COMPLETE i18n dictionary - NO hardcoded texts
const i18n = {
  // Support / CustomerSupport
  "support.title": { de: "Kundensupport", it: "Supporto Clienti", en: "Customer Support", fr: "Support Client", pl: "Wsparcie Klienta", tr: "Müşteri Desteği", uk: "Підтримка клієнтів" },
  "support.openTicket": { de: "Support-Ticket öffnen", it: "Apri un Ticket di Supporto", en: "Open a Support Ticket", fr: "Ouvrir un ticket", pl: "Otwórz zgłoszenie", tr: "Destek Talebi Aç", uk: "Відкрити тікет" },
  "support.subject": { de: "Betreff", it: "Oggetto", en: "Subject", fr: "Objet", pl: "Temat", tr: "Konu", uk: "Тема" },
  "support.subjectPlaceholder": { de: "Problem zusammenfassen...", it: "Riassumi il problema...", en: "Summarize the issue...", fr: "Résumez le problème...", pl: "Podsumuj problem...", tr: "Sorunu özetleyin...", uk: "Опишіть проблему..." },
  "support.category": { de: "Kategorie", it: "Categoria", en: "Category", fr: "Catégorie", pl: "Kategoria", tr: "Kategori", uk: "Категорія" },
  "support.selectCategory": { de: "Kategorie auswählen", it: "Seleziona categoria", en: "Select category", fr: "Sélectionner catégorie", pl: "Wybierz kategorię", tr: "Kategori seçin", uk: "Виберіть категорію" },
  "support.cat.technical": { de: "Technisches Problem", it: "Problema Tecnico", en: "Technical Issue", fr: "Problème technique", pl: "Problem techniczny", tr: "Teknik Sorun", uk: "Технічна проблема" },
  "support.cat.payment": { de: "Zahlung", it: "Pagamento", en: "Payment", fr: "Paiement", pl: "Płatność", tr: "Ödeme", uk: "Оплата" },
  "support.cat.account": { de: "Konto", it: "Account", en: "Account", fr: "Compte", pl: "Konto", tr: "Hesap", uk: "Акаунт" },
  "support.cat.listing": { de: "Anzeigen", it: "Annunci", en: "Listings", fr: "Annonces", pl: "Ogłoszenia", tr: "İlanlar", uk: "Оголошення" },
  "support.cat.other": { de: "Anderes", it: "Altro", en: "Other", fr: "Autre", pl: "Inne", tr: "Diğer", uk: "Інше" },
  "support.message": { de: "Nachricht", it: "Messaggio", en: "Message", fr: "Message", pl: "Wiadomość", tr: "Mesaj", uk: "Повідомлення" },
  "support.messagePlaceholder": { de: "Problem im Detail beschreiben...", it: "Descrivi il problema in dettaglio...", en: "Describe the issue in detail...", fr: "Décrivez le problème en détail...", pl: "Opisz problem szczegółowo...", tr: "Sorunu detaylı açıklayın...", uk: "Опишіть проблему детально..." },
  "support.submit": { de: "Ticket senden", it: "Invia Ticket", en: "Send Ticket", fr: "Envoyer ticket", pl: "Wyślij zgłoszenie", tr: "Talep Gönder", uk: "Надіслати тікет" },
  "support.responseTime.label": { de: "Antwortzeit", it: "Tempo di risposta", en: "Response time", fr: "Temps de réponse", pl: "Czas odpowiedzi", tr: "Yanıt süresi", uk: "Час відповіді" },
  "support.responseTime.value": { de: "24 Stunden für Standard-Tickets, 4 Stunden für dringende", it: "24 ore per ticket standard, 4 ore per urgenti", en: "24 hours for standard tickets, 4 hours for urgent", fr: "24h pour tickets standard, 4h pour urgents", pl: "24 godziny dla standardowych, 4 godziny dla pilnych", tr: "Standart talepler için 24 saat, acil için 4 saat", uk: "24 години для стандартних, 4 години для термінових" },
  "support.myTickets": { de: "Meine Tickets", it: "I Miei Ticket", en: "My Tickets", fr: "Mes tickets", pl: "Moje zgłoszenia", tr: "Taleplerim", uk: "Мої тікети" },
  "support.status.open": { de: "Offen", it: "Aperto", en: "Open", fr: "Ouvert", pl: "Otwarte", tr: "Açık", uk: "Відкритий" },
  "support.status.inProgress": { de: "In Bearbeitung", it: "In corso", en: "In Progress", fr: "En cours", pl: "W trakcie", tr: "İşlemde", uk: "В процесі" },
  "support.status.resolved": { de: "Gelöst", it: "Risolto", en: "Resolved", fr: "Résolu", pl: "Rozwiązane", tr: "Çözüldü", uk: "Вирішено" },
  "support.status.closed": { de: "Geschlossen", it: "Chiuso", en: "Closed", fr: "Fermé", pl: "Zamknięte", tr: "Kapalı", uk: "Закритий" },
  "support.adminResponse": { de: "Support-Antwort", it: "Risposta Supporto", en: "Support Response", fr: "Réponse support", pl: "Odpowiedź wsparcia", tr: "Destek Yanıtı", uk: "Відповідь підтримки" },
  "support.noTickets": { de: "Keine offenen Tickets", it: "Nessun ticket aperto", en: "No open tickets", fr: "Aucun ticket ouvert", pl: "Brak otwartych zgłoszeń", tr: "Açık talep yok", uk: "Немає відкритих тікетів" },
  "support.ticketCreated": { de: "Ticket gesendet! Wir antworten innerhalb von 24 Stunden.", it: "Ticket inviato! Ti risponderemo entro 24 ore.", en: "Ticket sent! We'll respond within 24 hours.", fr: "Ticket envoyé! Réponse sous 24h.", pl: "Zgłoszenie wysłane! Odpowiemy w ciągu 24h.", tr: "Talep gönderildi! 24 saat içinde yanıtlanacak.", uk: "Тікет надіслано! Відповімо протягом 24 годин." },
  "support.pleaseLogin": { de: "Bitte einloggen", it: "Effettua il login", en: "Please log in", fr: "Veuillez vous connecter", pl: "Zaloguj się", tr: "Lütfen giriş yapın", uk: "Будь ласка, увійдіть" },

  // Listing Form (NewListing)
  "listing.createNew": { de: "Anzeige erstellen", it: "Pubblica", en: "Post Ad", fr: "Publier", pl: "Dodaj ogłoszenie", tr: "İlan Ver", uk: "Створити" },
  "listing.offerPrice": { de: "Angebotspreis (€) — optional", it: "Prezzo in offerta (€) — opzionale", en: "Offer price (€) — optional", fr: "Prix promotionnel (€) — optionnel", pl: "Cena promocyjna (€) — opcjonalnie", tr: "İndirimli fiyat (€) — isteğe bağlı", uk: "Ціна пропозиції (€) — опціонально" },
  "listing.expiryDate": { de: "Ablaufdatum & -zeit — optional", it: "Data e ora di scadenza — opzionale", en: "Expiry date & time — optional", fr: "Date d'expiration — optionnel", pl: "Data wygaśnięcia — opcjonalnie", tr: "Son kullanma tarihi — isteğe bağlı", uk: "Дата закінчення — опціонально" },
  "listing.promoOptions": { de: "Werbeoptionen", it: "Opzioni promozionali", en: "Promotion Options", fr: "Options promotionnelles", pl: "Opcje promocyjne", tr: "Promosyon Seçenekleri", uk: "Промо-опції" },
  "listing.promoNone": { de: "Keine", it: "Nessuna", en: "None", fr: "Aucune", pl: "Brak", tr: "Yok", uk: "Немає" },
  "listing.promoFeatured": { de: "Hervorgehobene Anzeige", it: "Annuncio evidenziato", en: "Featured Ad", fr: "Annonce mise en avant", pl: "Wyróżnione ogłoszenie", tr: "Öne Çıkan İlan", uk: "Виділене оголошення" },
  "listing.promoTop": { de: "Top-Anzeige", it: "Annuncio TOP", en: "Top Ad", fr: "Annonce TOP", pl: "Ogłoszenie TOP", tr: "TOP İlan", uk: "TOP оголошення" },
  "listing.perDay": { de: "pro Tag", it: "al giorno", en: "per day", fr: "par jour", pl: "dziennie", tr: "günlük", uk: "на день" },
  "listing.perWeek": { de: "pro Woche", it: "a settimana", en: "per week", fr: "par semaine", pl: "tygodniowo", tr: "haftalık", uk: "на тиждень" },
  "listing.createSuccess": { de: "Anzeige zur Moderation eingereicht! Sie wird nach Überprüfung veröffentlicht.", it: "Annuncio inviato per moderazione! Sarà pubblicato dopo la revisione.", en: "Listing submitted for moderation! Will be published after review.", fr: "Annonce soumise pour modération! Sera publiée après révision.", pl: "Ogłoszenie wysłane do moderacji! Zostanie opublikowane po weryfikacji.", tr: "İlan moderasyona gönderildi! İncelemeden sonra yayınlanacak.", uk: "Оголошення надіслано на модерацію! Буде опубліковано після перевірки." },
  "listing.createError": { de: "Fehler beim Veröffentlichen der Anzeige", it: "Errore nella pubblicazione dell'annuncio", en: "Error publishing listing", fr: "Erreur lors de la publication", pl: "Błąd podczas publikacji ogłoszenia", tr: "İlan yayınlanırken hata", uk: "Помилка при публікації оголошення" },
  "listing.fillRequired": { de: "Bitte füllen Sie alle Pflichtfelder aus", it: "Compila tutti i campi obbligatori", en: "Please fill all required fields", fr: "Veuillez remplir tous les champs obligatoires", pl: "Wypełnij wszystkie wymagane pola", tr: "Lütfen tüm gerekli alanları doldurun", uk: "Будь ласка, заповніть усі обов'язкові поля" },

  // Form fields (common)
  "form.title": { de: "Titel", it: "Titolo", en: "Title", fr: "Titre", pl: "Tytuł", tr: "Başlık", uk: "Назва" },
  "form.description": { de: "Beschreibung", it: "Descrizione", en: "Description", fr: "Description", pl: "Opis", tr: "Açıklama", uk: "Опис" },
  "form.price": { de: "Preis", it: "Prezzo", en: "Price", fr: "Prix", pl: "Cena", tr: "Fiyat", uk: "Ціна" },
  "form.category": { de: "Kategorie", it: "Categoria", en: "Category", fr: "Catégorie", pl: "Kategoria", tr: "Kategori", uk: "Категорія" },
  "form.selectCategory": { de: "Kategorie auswählen", it: "Seleziona categoria", en: "Select category", fr: "Sélectionner catégorie", pl: "Wybierz kategorię", tr: "Kategori seçin", uk: "Виберіть категорію" },
  "form.city": { de: "Stadt", it: "Città", en: "City", fr: "Ville", pl: "Miasto", tr: "Şehir", uk: "Місто" },

  // Common actions
  "common.submit": { de: "Absenden", it: "Invia", en: "Submit", fr: "Soumettre", pl: "Wyślij", tr: "Gönder", uk: "Надіслати" },
  "common.cancel": { de: "Abbrechen", it: "Annulla", en: "Cancel", fr: "Annuler", pl: "Anuluj", tr: "İptal", uk: "Скасувати" },
  "common.loading": { de: "Lädt...", it: "Caricamento...", en: "Loading...", fr: "Chargement...", pl: "Ładowanie...", tr: "Yükleniyor...", uk: "Завантаження..." },
  "common.save": { de: "Speichern", it: "Salva", en: "Save", fr: "Enregistrer", pl: "Zapisz", tr: "Kaydet", uk: "Зберегти" },

  // Existing keys from LanguageProviderV2
  "header.brand": { de: "Zazarap", it: "Zazarap", en: "Zazarap", uk: "Zazarap", tr: "Zazarap", fr: "Zazarap", pl: "Zazarap" },
  "aria.home": { de: "Startseite", it: "Home", en: "Home", fr: "Accueil", pl: "Strona główna", tr: "Ana sayfa", uk: "Головна" },
  "aria.messages": { de: "Nachrichten", it: "Messaggi", en: "Messages", fr: "Messages", pl: "Wiadomości", tr: "Mesajlar", uk: "Повідомлення" },
  "aria.create": { de: "Anzeige erstellen", it: "Crea annuncio", en: "Create ad", fr: "Créer annonce", pl: "Utwórz ogłoszenie", tr: "İlan oluştur", uk: "Створити оголошення" },
  "aria.notifications": { de: "Benachrichtigungen", it: "Notifiche", en: "Notifications", fr: "Notifications", pl: "Powiadomienia", tr: "Bildirimler", uk: "Сповіщення" },
  "aria.settings": { de: "Einstellungen", it: "Impostazioni", en: "Settings", fr: "Paramètres", pl: "Ustawienia", tr: "Ayarlar", uk: "Налаштування" },
  "aria.language": { de: "Sprache wählen", it: "Scegli lingua", en: "Choose language", fr: "Choisir la langue", pl: "Wybierz język", tr: "Dil seçin", uk: "Вибрати мову" },

  // Ads/Werbung (all keys from WerbungV2)
  "ads.header.title": { de: "Werbung & Premium-Pakete", it: "Pubblicità & Pacchetti Premium", en: "Advertising & Premium Packages", fr: "Publicité & Forfaits premium", pl: "Reklama i pakiety premium", tr: "Reklam & Premium Paketler", uk: "Реклама та преміум-пакети" },
  "ads.header.subtitle": { de: "Mehr Sichtbarkeit. Mehr Kunden. Mehr Verkäufe.", it: "Più visibilità. Più clienti. Più vendite.", en: "More visibility. More customers. More sales.", fr: "Plus de visibilité. Plus de clients. Plus de ventes.", pl: "Więcej widoczności. Więcej klientów. Więcej sprzedaży.", tr: "Daha fazla görünürlük. Daha fazla müşteri. Daha fazla satış.", uk: "Більше видимості. Більше клієнтів. Більше продажів." },
  "ads.btn.buyNow": { de: "Jetzt kaufen", it: "Acquista ora", en: "Buy now", fr: "Acheter maintenant", pl: "Kup teraz", tr: "Şimdi satın al", uk: "Купити зараз" },
  "pricing.top_ad.title": { de: "TOP-Anzeige", it: "Annuncio TOP", en: "TOP Ad", fr: "Annonce TOP", pl: "Ogłoszenie TOP", tr: "TOP İlan", uk: "TOP-оголошення" },
  "pricing.highlighted.title": { de: "Hervorgehobene Anzeige", it: "Annuncio evidenziato", en: "Highlighted ad", fr: "Annonce mise en avant", pl: "Wyróżnione ogłoszenie", tr: "Vurgulanan ilan", uk: "Виділене оголошення" },
  "ads.modal.select.chooseListing": { de: "Anzeige auswählen", it: "Seleziona annuncio", en: "Select listing", fr: "Sélectionner l'annonce", pl: "Wybierz ogłoszenie", tr: "İlan seçin", uk: "Виберіть оголошення" },
  "ads.modal.request.submit": { de: "Anfrage senden", it: "Invia richiesta", en: "Send request", fr: "Envoyer la demande", pl: "Wyślij zapytanie", tr: "Talep gönder", uk: "Надіслати запит" },
  
  // Subscriptions
  "subs.mySubscriptions": { de: "Meine Abonnements", it: "I Miei Abbonamenti", en: "My Subscriptions", fr: "Mes abonnements", pl: "Moje subskrypcje", tr: "Aboneliklerim", uk: "Мої підписки" },

  // SEO
  "seoOptimization": { de: "SEO Optimierung (Optional)", it: "Ottimizzazione SEO (Opzionale)", en: "SEO Optimization (Optional)", fr: "Optimisation SEO (Optionnel)", pl: "Optymalizacja SEO (Opcjonalnie)", tr: "SEO Optimizasyonu (İsteğe Bağlı)", uk: "SEO оптимізація (Опціонально)" },
  "metaTitle": { de: "Meta Titel (max 60 Zeichen)", it: "Meta Title (max 60 caratteri)", en: "Meta Title (max 60 chars)", fr: "Meta Title (max 60 caractères)", pl: "Meta Title (maks 60 znaków)", tr: "Meta Title (maks 60 karakter)", uk: "Meta Title (макс 60 символів)" },
  "metaDesc": { de: "Meta Beschreibung (max 160 Zeichen)", it: "Meta Description (max 160 caratteri)", en: "Meta Description (max 160 chars)", fr: "Meta Description (max 160 caractères)", pl: "Meta Description (maks 160 znaków)", tr: "Meta Description (maks 160 karakter)", uk: "Meta Description (макс 160 символів)" },
  "keywords": { de: "SEO Keywords (kommagetrennt)", it: "Keywords SEO (separate da virgola)", en: "SEO Keywords (comma separated)", fr: "Mots-clés SEO (séparés par virgule)", pl: "Słowa kluczowe SEO (oddzielone przecinkiem)", tr: "SEO Anahtar Kelimeler (virgülle ayrılmış)", uk: "SEO ключові слова (через кому)" },
  "chars": { de: "Zeichen", it: "caratteri", en: "chars", fr: "caractères", pl: "znaków", tr: "karakter", uk: "символів" },
  "images": { de: "Bilder", it: "Immagini", en: "Images", fr: "Images", pl: "Zdjęcia", tr: "Resimler", uk: "Зображення" },

  // Error messages
  "error.illegal": { de: "Dieses Angebot ist auf Zazarap nicht erlaubt.", it: "Questo annuncio non è permesso su Zazarap.", en: "This listing is not allowed on Zazarap.", fr: "Cette annonce n'est pas autorisée sur Zazarap.", pl: "To ogłoszenie nie jest dozwolone na Zazarap.", tr: "Bu ilan Zazarap'ta yasaktır.", uk: "Це оголошення заборонене на Zazarap." },

  // Categories
  "Fahrzeuge": { de: "Fahrzeuge", it: "Veicoli", en: "Vehicles", fr: "Véhicules", pl: "Pojazdy", tr: "Araçlar", uk: "Транспорт" },
  "Autos": { de: "Autos", it: "Auto", en: "Cars", fr: "Voitures", pl: "Samochody", tr: "Arabalar", uk: "Автомобілі" },
  "Immobilien": { de: "Immobilien", it: "Immobili", en: "Real Estate", fr: "Immobilier", pl: "Nieruchomości", tr: "Emlak", uk: "Нерухомість" },
  "Marktplatz": { de: "Marktplatz", it: "Mercato", en: "Marketplace", fr: "Marché", pl: "Rynek", tr: "Pazar Yeri", uk: "Маркетплейс" },
  "Elektronik": { de: "Elektronik", it: "Elettronica", en: "Electronics", fr: "Électronique", pl: "Elektronika", tr: "Elektronik", uk: "Електроніка" }
};

// Cookie helpers
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function detectLangFromUrl() {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  for (const lang of SUPPORTED_LANGS) {
    if (path.startsWith(`/${lang}/`) || path === `/${lang}`) return lang;
  }
  return null;
}

const LanguageContext = createContext();

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Priority: URL > Cookie > Browser > Default
    const urlLang = detectLangFromUrl();
    if (urlLang) return urlLang;

    const cookieLang = getCookie('zazarap_language');
    if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) return cookieLang;

    if (typeof navigator !== 'undefined') {
      const browserLang = (navigator.language || '').toLowerCase();
      if (browserLang.startsWith('de')) return 'de';
      if (browserLang.startsWith('it')) return 'it';
      if (browserLang.startsWith('en')) return 'en';
      if (browserLang.startsWith('fr')) return 'fr';
      if (browserLang.startsWith('pl')) return 'pl';
      if (browserLang.startsWith('tr')) return 'tr';
      if (browserLang.startsWith('uk')) return 'uk';
    }

    return DEFAULT_LANG;
  });

  useEffect(() => {
    setCookie('zazarap_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, vars = {}) => {
    let text = i18n[key]?.[language] || i18n[key]?.[DEFAULT_LANG] || key;
    
    // Variable interpolation: t('key', {name: 'John'}) → replaces {name}
    Object.keys(vars).forEach(varKey => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}