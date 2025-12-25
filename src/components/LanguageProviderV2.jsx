// @ts-check
import React, { createContext, useContext, useState, useEffect } from 'react';

const SUPPORTED_LANGS = ["de", "it", "en", "fr", "pl", "tr", "uk"];
const DEFAULT_LANG = "de";
const COOKIE_NAME = "zazarap_language";

// Complete i18n translations (namespace-based)
const i18n = {
  // Header & Navigation
  "header.brand": { de: "Zazarap", it: "Zazarap", en: "Zazarap", uk: "Zazarap", tr: "Zazarap", fr: "Zazarap", pl: "Zazarap" },
  "header.nav.home": { de: "Startseite", it: "Homepage", en: "Home", uk: "Головна", tr: "Ana sayfa", fr: "Accueil", pl: "Strona główna" },
  "header.nav.categories": { de: "Kategorien", it: "Categorie", en: "Categories", uk: "Категорії", tr: "Kategoriler", fr: "Catégories", pl: "Kategorie" },
  "header.nav.login": { de: "Anmelden", it: "Accedi", en: "Log in", uk: "Увійти", tr: "Giriş yap", fr: "Se connecter", pl: "Zaloguj się" },
  "header.nav.register": { de: "Registrieren", it: "Registrati", en: "Sign up", uk: "Зареєструватися", tr: "Kayıt ol", fr: "S'inscrire", pl: "Załóż konto" },
  "header.nav.postAd": { de: "Anzeige aufgeben", it: "Pubblica annuncio", en: "Post an ad", uk: "Створити оголошення", tr: "İlan ver", fr: "Déposer une annonce", pl: "Dodaj ogłoszenie" },

  // UI Elements
  "ui.showMap": { de: "Karte anzeigen", it: "Mostra mappa", en: "Show map", uk: "Показати мапу", tr: "Haritayı göster", fr: "Afficher la carte", pl: "Pokaż mapę" },
  "ui.hideMap": { de: "Karte ausblenden", it: "Nascondi mappa", en: "Hide map", uk: "Сховати мапу", tr: "Haritayı gizle", fr: "Masquer la carte", pl: "Ukryj mapę" },
  "ui.positionSet": { de: "Position gesetzt", it: "Posizione impostata", en: "Position set", uk: "Позицію встановлено", tr: "Konum ayarlandı", fr: "Position définie", pl: "Pozycja ustawiona" },
  "ui.positionNotSet": { de: "Position nicht festgelegt", it: "Posizione non impostata", en: "Position not set", uk: "Позицію не встановлено", tr: "Konum ayarlı değil", fr: "Position non définie", pl: "Pozycja nieustawiona" },
  "ui.useMyLocation": { de: "Meinen Standort verwenden", it: "Usa la mia posizione", en: "Use my location", uk: "Використати мою локацію", tr: "Konumumu kullan", fr: "Utiliser ma position", pl: "Użyj mojej lokalizacji" },
  "ui.radius": { de: "Radius (km)", it: "Raggio (km)", en: "Radius (km)", uk: "Радіус (км)", tr: "Yarıçap (km)", fr: "Rayon (km)", pl: "Promień (km)" },
  "ui.follow": { de: "Folgen", it: "Segui", en: "Follow", uk: "Стежити", tr: "Takip et", fr: "Suivre", pl: "Obserwuj" },
  "ui.unfollow": { de: "Nicht mehr folgen", it: "Smetti di seguire", en: "Unfollow", uk: "Відписатися", tr: "Takibi bırak", fr: "Ne plus suivre", pl: "Przestań obserwować" },
  "ui.followCategory": { de: "Kategorie folgen", it: "Segui categoria", en: "Follow category", uk: "Стежити за категорією", tr: "Kategoriyi takip et", fr: "Suivre la catégorie", pl: "Obserwuj kategorię" },
  "ui.unfollowCategory": { de: "Kategorie nicht mehr folgen", it: "Non seguire più", en: "Unfollow category", uk: "Відписатися від категорії", tr: "Kategoriyi takipten çık", fr: "Ne plus suivre la catégorie", pl: "Przestań obserwować kategorię" },

  // Advertising & Pricing Packages
  "pricing.top_ad.title": { de: "TOP-Anzeige", it: "Annuncio TOP", en: "TOP Ad", fr: "Annonce TOP", pl: "Ogłoszenie TOP", tr: "TOP İlan", uk: "TOP-оголошення" },
  "pricing.top_ad.desc": { de: "Ihre Anzeige wird 7 Tage lang ganz oben in der Kategorie angezeigt.", it: "Il tuo annuncio resta 7 giorni in cima alla categoria.", en: "Your listing stays 7 days on top of the category.", fr: "Votre annonce reste 7 jours en haut de la catégorie.", pl: "Twoje ogłoszenie przez 7 dni na górze kategorii.", tr: "İlanınız 7 gün kategori en üstünde kalır.", uk: "Оголошення 7 днів зверху категорії." },
  "pricing.highlighted.title": { de: "Hervorgehobene Anzeige", it: "Annuncio evidenziato", en: "Highlighted ad", fr: "Annonce mise en avant", pl: "Wyróżnione ogłoszenie", tr: "Vurgulanan ilan", uk: "Виділене оголошення" },
  "pricing.highlighted.desc": { de: "Farblicher Rahmen + besserer Platz in den Suchergebnissen.", it: "Cornice colorata + miglior posizione nei risultati.", en: "Colored frame + better search placement.", fr: "Cadre coloré + meilleur placement.", pl: "Kolorowa ramka + lepsza pozycja w wynikach.", tr: "Renkli çerçeve + daha iyi arama konumu.", uk: "Кольорова рамка + краща позиція у видачі." },
  "pricing.premium14.title": { de: "Premium 14 Tage", it: "Premium 14 giorni", en: "Premium 14 days", fr: "Premium 14 jours", pl: "Premium 14 dni", tr: "Premium 14 gün", uk: "Premium 14 днів" },
  "pricing.premium14.desc": { de: "Maximale Sichtbarkeit für zwei Wochen mit allen Vorteilen.", it: "Massima visibilità per due settimane con tutti i vantaggi.", en: "Max visibility for two weeks with all benefits.", fr: "Visibilité maximale pendant deux semaines.", pl: "Maksymalna widoczność przez dwa tygodnie.", tr: "İki hafta boyunca maksimum görünürlük.", uk: "Максимальна видимість на два тижні." },
  "pricing.basic_shop.title": { de: "Basic Shop-Paket", it: "Pacchetto Shop Basic", en: "Basic Shop Package", fr: "Forfait boutique Basic", pl: "Pakiet Sklep Basic", tr: "Temel Mağaza Paketi", uk: "Базовий пакет магазину" },
  "pricing.business_shop.title": { de: "Business Shop-Paket", it: "Pacchetto Shop Business", en: "Business Shop Package", fr: "Forfait boutique Business", pl: "Pakiet Sklep Business", tr: "İşletme Mağaza Paketi", uk: "Пакет магазину Business" },
  "pricing.premium_shop.title": { de: "Premium Shop-Paket", it: "Pacchetto Shop Premium", en: "Premium Shop Package", fr: "Forfait boutique Premium", pl: "Pakiet Sklep Premium", tr: "Premium Mağaza Paketi", uk: "Пакет магазину Premium" },
  "pricing.home_banner.title": { de: "Startseiten-Banner", it: "Banner Homepage", en: "Homepage Banner", fr: "Bannière d'accueil", pl: "Baner na stronie głównej", tr: "Ana sayfa bannerı", uk: "Банер на головній" },
  "pricing.home_banner.desc": { de: "Perfekt für maximale Sichtbarkeit.", it: "Perfetto per la massima visibilità.", en: "Perfect for maximum visibility.", fr: "Parfait pour une visibilité maximale.", pl: "Idealny dla maksymalnej widoczności.", tr: "Maksimum görünürlük için ideal.", uk: "Ідеально для максимальної видимості." },
  "pricing.category_banner.title": { de: "Kategorie-Banner", it: "Banner Categoria", en: "Category Banner", fr: "Bannière de catégorie", pl: "Baner kategorii", tr: "Kategori bannerı", uk: "Банер категорії" },
  "pricing.category_banner.desc": { de: "Direkt in der passenden Kategorie für Ihre Zielgruppe.", it: "Direttamente nella categoria giusta per il tuo target.", en: "Right inside the right category for your audience.", fr: "Directement dans la catégorie adaptée à votre audience.", pl: "Bezpośrednio w odpowiedniej kategorii dla grupy docelowej.", tr: "Hedef kitle için doğru kategoride.", uk: "Прямо в потрібній категорії для вашої аудиторії." },
  "pricing.sidebar_ad.title": { de: "Sidebar-Werbung", it: "Annuncio sidebar", en: "Sidebar Ad", fr: "Publicité sidebar", pl: "Reklama w bocznym pasku", tr: "Kenar çubuğu reklamı", uk: "Реклама в сайдбарі" },
  "pricing.sidebar_ad.desc": { de: "Eine günstige, aber sichtbare Werbefläche.", it: "Spazio pubblicitario economico ma visibile.", en: "Affordable yet visible ad spot.", fr: "Emplacement publicitaire abordable mais visible.", pl: "Tanie, ale widoczne miejsce reklamowe.", tr: "Uygun fiyatlı ancak görünür reklam alanı.", uk: "Доступне, але помітне місце реклами." },

  // Ads Page
  "ads.header.title": { de: "Werbung & Premium-Pakete", it: "Pubblicità & Pacchetti Premium", en: "Advertising & Premium Packages", fr: "Publicité & Forfaits premium", pl: "Reklama i pakiety premium", tr: "Reklam & Premium Paketler", uk: "Реклама та преміум-пакети" },
  "ads.header.subtitle": { de: "Mehr Sichtbarkeit. Mehr Kunden. Mehr Verkäufe.", it: "Più visibilità. Più clienti. Più vendite.", en: "More visibility. More customers. More sales.", fr: "Plus de visibilité. Plus de clients. Plus de ventes.", pl: "Więcej widoczności. Więcej klientów. Więcej sprzedaży.", tr: "Daha fazla görünürlük. Daha fazla müşteri. Daha fazla satış.", uk: "Більше видимості. Більше клієнтів. Більше продажів." },
  "ads.banner.cta": { de: "Erhöhen Sie Ihre Reichweite auf Zazarap", it: "Aumenta la tua portata su Zazarap", en: "Boost your reach on Zazarap", fr: "Augmentez votre portée sur Zazarap", pl: "Zwiększ zasięg na Zazarap", tr: "Zazarap'ta erişiminizi artırın", uk: "Збільшіть охоплення на Zazarap" },
  "ads.section.privateTitle": { de: "Premium-Werbung für private Nutzer", it: "Pubblicità premium per utenti privati", en: "Premium ads for private users", fr: "Publicité premium pour les particuliers", pl: "Reklama premium dla użytkowników prywatnych", tr: "Bireysel kullanıcılar için premium reklam", uk: "Преміум-реклама для приватних користувачів" },
  "ads.section.privateDesc": { de: "Steigern Sie die Sichtbarkeit Ihrer Anzeigen mit unseren Premium-Optionen. Ideal für Verkäufer, die schneller verkaufen möchten.", it: "Aumenta la visibilità dei tuoi annunci con le nostre opzioni premium. Ideale per chi vuole vendere più velocemente.", en: "Increase your listings' visibility with our premium options. Ideal for faster sales.", fr: "Augmentez la visibilité de vos annonces avec nos options premium.", pl: "Zwiększ widoczność ogłoszeń dzięki opcjom premium.", tr: "Premium seçeneklerle ilan görünürlüğünü artırın.", uk: "Підвищіть видимість оголошень за допомогою преміум-опцій." },
  "ads.section.businessTitle": { de: "Werbepakete für Geschäfte & Unternehmen", it: "Pacchetti pubblicitari per negozi e aziende", en: "Ad packages for shops & businesses", fr: "Forfaits publicitaires pour commerces & entreprises", pl: "Pakiety reklamowe dla sklepów i firm", tr: "Mağazalar ve işletmeler için reklam paketleri", uk: "Рекламні пакети для магазинів і бізнесу" },
  "ads.section.businessDesc": { de: "Perfekt für Shops, Händler und professionelle Anbieter. Präsentieren Sie Ihre Marke auf Zazarap.", it: "Perfetto per negozi, rivenditori e professionisti. Presenta il tuo brand su Zazarap.", en: "Perfect for shops, dealers and pros. Showcase your brand on Zazarap.", fr: "Parfait pour boutiques, revendeurs et pros.", pl: "Idealne dla sklepów, sprzedawców i profesjonalistów.", tr: "Mağazalar, satıcılar ve profesyoneller için mükemmel.", uk: "Ідеально для магазинів, продавців та професіоналів." },
  "ads.section.bannerTitle": { de: "Werbebanner & Grafikpromotion", it: "Banner pubblicitari & promozioni grafiche", en: "Ad banners & graphic promotion", fr: "Bannières publicitaires & promotion graphique", pl: "Banery reklamowe i promocja graficzna", tr: "Reklam afişleri ve grafik tanıtım", uk: "Рекламні банери та графічна промоція" },
  "ads.section.bannerDesc": { de: "Platzieren Sie Ihren Banner an strategischen Orten auf Zazarap.", it: "Posiziona i tuoi banner in punti strategici su Zazarap.", en: "Place your banner in strategic spots on Zazarap.", fr: "Placez votre bannière à des endroits stratégiques sur Zazarap.", pl: "Umieść baner w strategicznych miejscach na Zazarap.", tr: "Bannerinizi Zazarap'ta stratejik noktalara yerleştirin.", uk: "Розмістіть банер у стратегічних місцях на Zazarap." },
  "ads.btn.buyNow": { de: "Jetzt kaufen", it: "Acquista ora", en: "Buy now", fr: "Acheter maintenant", pl: "Kup teraz", tr: "Şimdi satın al", uk: "Купити зараз" },
  "ads.btn.subscribeNow": { de: "Jetzt abonnieren", it: "Abbonati ora", en: "Subscribe now", fr: "S'abonner", pl: "Subskrybuj teraz", tr: "Hemen abone ol", uk: "Підписатися" },
  "ads.btn.bookBanner": { de: "Banner buchen", it: "Prenota banner", en: "Book banner", fr: "Réserver bannière", pl: "Zarezerwuj baner", tr: "Banner ayırt", uk: "Забронювати банер" },
  "ads.bestseller": { de: "Bestseller", it: "Più venduto", en: "Bestseller", fr: "Meilleure vente", pl: "Bestseller", tr: "En çok satan", uk: "Хіт продажів" },

  // Ad Features
  "ads.features.ownShopPage": { de: "Eigene Shop-Seite", it: "Pagina negozio dedicata", en: "Own shop page", fr: "Page boutique dédiée", pl: "Własna strona sklepu", tr: "Özel mağaza sayfası", uk: "Власна сторінка магазину" },
  "ads.features.upTo20Active": { de: "Bis zu 20 aktive Anzeigen", it: "Fino a 20 annunci attivi", en: "Up to 20 active listings", fr: "Jusqu'à 20 annonces actives", pl: "Do 20 aktywnych ogłoszeń", tr: "20'ye kadar aktif ilan", uk: "До 20 активних оголошень" },
  "ads.features.standardSupport": { de: "Standard-Unterstützung", it: "Supporto standard", en: "Standard support", fr: "Support standard", pl: "Wsparcie standardowe", tr: "Standart destek", uk: "Стандартна підтримка" },
  "ads.features.upTo100Active": { de: "Bis zu 100 aktive Anzeigen", it: "Fino a 100 annunci attivi", en: "Up to 100 active listings", fr: "Jusqu'à 100 annonces actives", pl: "Do 100 aktywnych ogłoszeń", tr: "100'e kadar aktif ilan", uk: "До 100 активних оголошень" },
  "ads.features.logoBranding": { de: "Logo & Branding", it: "Logo & Branding", en: "Logo & Branding", fr: "Logo & Branding", pl: "Logo i branding", tr: "Logo & Marka", uk: "Логотип і брендинг" },
  "ads.features.searchBanner": { de: "Werbebanner im Suchbereich", it: "Banner pubblicitario nella ricerca", en: "Ad banner in search area", fr: "Bannière dans la recherche", pl: "Baner w wyszukiwarce", tr: "Arama alanında banner", uk: "Банер у пошуку" },
  "ads.features.unlimitedAds": { de: "Unbegrenzte Anzeigen", it: "Annunci illimitati", en: "Unlimited listings", fr: "Annonces illimitées", pl: "Nielimitowane ogłoszenia", tr: "Sınırsız ilan", uk: "Необмежені оголошення" },
  "ads.features.homepageBanner": { de: "Startseiten-Banner", it: "Banner in homepage", en: "Homepage banner", fr: "Bannière d'accueil", pl: "Baner na stronie głównej", tr: "Ana sayfa bannerı", uk: "Банер на головній" },
  "ads.features.prioritySupport": { de: "Priorisierter Support", it: "Supporto prioritario", en: "Priority support", fr: "Support prioritaire", pl: "Priorytetowe wsparcie", tr: "Öncelikli destek", uk: "Пріоритетна підтримка" },

  // Ad Modals
  "ads.modal.select.title": { de: "{pkg} • {days} Tage • €{price}", it: "{pkg} • {days} giorni • €{price}", en: "{pkg} • {days} days • €{price}", fr: "{pkg} • {days} jours • €{price}", pl: "{pkg} • {days} dni • €{price}", tr: "{pkg} • {days} gün • €{price}", uk: "{pkg} • {days} днів • €{price}" },
  "ads.modal.select.chooseListing": { de: "Anzeige auswählen", it: "Seleziona annuncio", en: "Select listing", fr: "Sélectionner l'annonce", pl: "Wybierz ogłoszenie", tr: "İlan seçin", uk: "Виберіть оголошення" },
  "ads.modal.select.placeholder": { de: "Wähle die Anzeige zur Promotion", it: "Scegli l'annuncio da promuovere", en: "Choose the listing to promote", fr: "Choisissez l'annonce à promouvoir", pl: "Wybierz ogłoszenie do promocji", tr: "Tanıtılacak ilanı seçin", uk: "Виберіть оголошення для просування" },
  "ads.modal.select.noListings": { de: "Keine aktiven Anzeigen. Erstelle eine neue Anzeige und versuche erneut.", it: "Non hai annunci attivi. Crea un nuovo annuncio e riprova.", en: "You have no active listings. Create a new one and try again.", fr: "Aucune annonce active.", pl: "Brak aktywnych ogłoszeń.", tr: "Aktif ilan yok.", uk: "Немає активних оголошень." },
  "ads.modal.select.activate": { de: "Aktivieren", it: "Attiva", en: "Activate", fr: "Activer", pl: "Aktywuj", tr: "Aktifleştir", uk: "Активувати" },
  "ads.modal.request.title": { de: "Anfrage: {pkg} • {price}", it: "Richiesta: {pkg} • {price}", en: "Request: {pkg} • {price}", fr: "Demande : {pkg} • {price}", pl: "Zapytanie: {pkg} • {price}", tr: "Talep: {pkg} • {price}", uk: "Запит: {pkg} • {price}" },
  "ads.modal.request.desc": { de: "Geben Sie ggf. Details an (Zeitraum, Zielgruppe, Zielseite, etc.). Wir melden uns umgehend.", it: "Inserisci eventuali dettagli (periodo, target, pagina di destinazione, ecc.). Ti risponderemo al più presto.", en: "Add details if any (period, target, landing page, etc.). We'll get back to you soon.", fr: "Ajoutez des détails si nécessaire (période, cible, page de destination, etc.).", pl: "Dodaj szczegóły (okres, target, landing page itp.).", tr: "Gerekirse detay ekleyin (dönem, hedef, açılış sayfası vb.).", uk: "Додайте деталі (період, ціль, лендинг тощо)." },
  "ads.modal.request.placeholder": { de: "Details der Anfrage", it: "Dettagli richiesta", en: "Request details", fr: "Détails de la demande", pl: "Szczegóły zapytania", tr: "Talep detayları", uk: "Деталі запиту" },
  "ads.modal.request.submit": { de: "Anfrage senden", it: "Invia richiesta", en: "Send request", fr: "Envoyer la demande", pl: "Wyślij zapytanie", tr: "Talep gönder", uk: "Надіслати запит" },
  "ads.create.title": { de: "Werbeinserat", it: "Annuncio pubblicitario", en: "Advertising ad", fr: "Annonce publicitaire", pl: "Ogłoszenie reklamowe", tr: "Reklam ilanı", uk: "Рекламне оголошення" },
  "ads.create.subscribersOnly": { de: "Nur für Abonnenten", it: "Solo per abbonati", en: "Subscribers only", fr: "Réservé aux abonnés", pl: "Tylko dla subskrybentów", tr: "Sadece aboneler için", uk: "Тільки для передплатників" },
  "ads.create.newAd": { de: "Neues Inserat", it: "Nuovo annuncio", en: "New ad", fr: "Nouvelle annonce", pl: "Nowe ogłoszenie", tr: "Yeni ilan", uk: "Нове оголошення" },
  "ads.create.adTitle": { de: "Anzeigentitel", it: "Titolo annuncio", en: "Ad title", fr: "Titre de l'annonce", pl: "Tytuł ogłoszenia", tr: "İlan başlığı", uk: "Назва оголошення" },
  "ads.create.targetUrl": { de: "Ziel-URL", it: "URL di destinazione", en: "Target URL", fr: "URL cible", pl: "Docelowy URL", tr: "Hedef URL", uk: "Цільовий URL" },
  "ads.create.placement": { de: "Platzierung", it: "Posizionamento", en: "Placement", fr: "Emplacement", pl: "Umiejscowienie", tr: "Yerleşim", uk: "Розміщення" },
  "ads.create.selectPlacement": { de: "Platzierung wählen", it: "Seleziona posizionamento", en: "Select placement", fr: "Sélectionner l'emplacement", pl: "Wybierz umiejscowienie", tr: "Yerleşim seçin", uk: "Виберіть розміщення" },
  "ads.create.placement.homepage": { de: "Startseite", it: "Homepage", en: "Homepage", fr: "Page d'accueil", pl: "Strona główna", tr: "Ana sayfa", uk: "Головна" },
  "ads.create.placement.category": { de: "Kategorie", it: "Categoria", en: "Category", fr: "Catégorie", pl: "Kategoria", tr: "Kategori", uk: "Категорія" },
  "ads.create.placement.search": { de: "Suche", it: "Ricerca", en: "Search", fr: "Recherche", pl: "Wyszukiwanie", tr: "Arama", uk: "Пошук" },
  "ads.create.placement.sidebar": { de: "Sidebar", it: "Barra laterale", en: "Sidebar", fr: "Barre latérale", pl: "Pasek boczny", tr: "Kenar çubuğu", uk: "Бічна панель" },
  "ads.create.mediaAsset": { de: "Medien-Asset", it: "Media asset", en: "Media asset", fr: "Ressource média", pl: "Zasób medialny", tr: "Medya varlığı", uk: "Медіа-актив" },
  "ads.create.selectMedia": { de: "Asset auswählen", it: "Seleziona asset", en: "Select asset", fr: "Sélectionner ressource", pl: "Wybierz zasób", tr: "Varlık seçin", uk: "Виберіть актив" },
  "ads.create.noMedia": { de: "Keine Assets verfügbar", it: "Nessun asset disponibile", en: "No assets available", fr: "Aucune ressource disponible", pl: "Brak dostępnych zasobów", tr: "Kullanılabilir varlık yok", uk: "Немає доступних активів" },
  "ads.create.startDate": { de: "Startdatum", it: "Data inizio", en: "Start date", fr: "Date de début", pl: "Data rozpoczęcia", tr: "Başlangıç tarihi", uk: "Дата початку" },
  "ads.create.endDate": { de: "Enddatum", it: "Data fine", en: "End date", fr: "Date de fin", pl: "Data zakończenia", tr: "Bitiş tarihi", uk: "Дата закінчення" },
  "ads.create.cancel": { de: "Abbrechen", it: "Annulla", en: "Cancel", fr: "Annuler", pl: "Anuluj", tr: "İptal", uk: "Скасувати" },
  "ads.create.submit": { de: "Erstellen", it: "Crea", en: "Create", fr: "Créer", pl: "Utwórz", tr: "Oluştur", uk: "Створити" },
  "ads.create.success": { de: "Werbeanzeige erstellt", it: "Annuncio creato", en: "Ad created", fr: "Annonce créée", pl: "Ogłoszenie utworzone", tr: "İlan oluşturuldu", uk: "Оголошення створено" },
  "ads.create.error": { de: "Fehler beim Erstellen", it: "Errore durante la creazione", en: "Error creating ad", fr: "Erreur lors de la création", pl: "Błąd podczas tworzenia", tr: "Oluşturma hatası", uk: "Помилка при створенні" },
  "ads.promo.activated": { de: "Promotion aktiviert", it: "Promozione attivata", en: "Promotion activated", fr: "Promotion activée", pl: "Promocja aktywowana", tr: "Promosyon etkinleştirildi", uk: "Промоцію активовано" },
  "ads.request.sent": { de: "Anfrage gesendet. Wir melden uns in Kürze.", it: "Richiesta inviata. Ti contatteremo presto.", en: "Request sent. We'll contact you soon.", fr: "Demande envoyée. Nous vous contacterons bientôt.", pl: "Zapytanie wysłane. Skontaktujemy się wkrótce.", tr: "Talep gönderildi. Yakında iletişime geçeceğiz.", uk: "Запит надіслано. Ми зв'яжемося з вами незабаром." },

  // Subscriptions
  "subs.mySubscriptions": { de: "Meine Abonnements", it: "I miei abbonamenti", en: "My Subscriptions", fr: "Mes abonnements", pl: "Moje subskrypcje", tr: "Aboneliklerim", uk: "Мої підписки" },
  "subs.activeSubscriptions": { de: "Aktive Abonnements", it: "Abbonamenti attivi", en: "Active Subscriptions", fr: "Abonnements actifs", pl: "Aktywne subskrypcje", tr: "Aktif abonelikler", uk: "Активні підписки" },
  "subs.oneTimePromotions": { de: "Einmalige Promotionen", it: "Promozioni una tantum", en: "One-time Promotions", fr: "Promotions ponctuelles", pl: "Jednorazowe promocje", tr: "Tek seferlik promosyonlar", uk: "Одноразові промоції" },
  "subs.renewsOn": { de: "Verlängert sich am", it: "Si rinnova il", en: "Renews on", fr: "Se renouvelle le", pl: "Odnawia się", tr: "Yenileniyor", uk: "Поновлюється" },
  "subs.expiresOn": { de: "Läuft ab am", it: "Scade il", en: "Expires on", fr: "Expire le", pl: "Wygasa", tr: "Sona eriyor", uk: "Закінчується" },
  "subs.cancel": { de: "Kündigen", it: "Annulla", en: "Cancel", fr: "Annuler", pl: "Anuluj", tr: "İptal", uk: "Скасувати" },
  "subs.confirmCancel": { de: "Möchten Sie dieses Abonnement wirklich kündigen?", it: "Vuoi davvero annullare questo abbonamento?", en: "Do you really want to cancel this subscription?", fr: "Voulez-vous vraiment annuler cet abonnement ?", pl: "Czy na pewno chcesz anulować tę subskrypcję?", tr: "Bu aboneliği gerçekten iptal etmek istiyor musunuz?", uk: "Ви дійсно хочете скасувати цю підписку?" },
  "subs.cancelSuccess": { de: "Abonnement gekündigt", it: "Abbonamento annullato", en: "Subscription cancelled", fr: "Abonnement annulé", pl: "Subskrypcja anulowana", tr: "Abonelik iptal edildi", uk: "Підписку скасовано" },
  "subs.noActive": { de: "Keine aktiven Abonnements", it: "Nessun abbonamento attivo", en: "No active subscriptions", fr: "Aucun abonnement actif", pl: "Brak aktywnych subskrypcji", tr: "Aktif abonelik yok", uk: "Немає активних підписок" },
  "subs.noPromos": { de: "Keine Promotionen", it: "Nessuna promozione", en: "No promotions", fr: "Aucune promotion", pl: "Brak promocji", tr: "Promosyon yok", uk: "Немає промоцій" },
  "subs.premiumMember": { de: "Premium-Mitglied", it: "Membro Premium", en: "Premium Member", fr: "Membre Premium", pl: "Członek Premium", tr: "Premium Üye", uk: "Преміум-користувач" },
  "subs.upgradeToPremium": { de: "Premium-Mitgliedschaft", it: "Abbonamento Premium", en: "Premium Membership", fr: "Abonnement Premium", pl: "Członkostwo Premium", tr: "Premium Üyelik", uk: "Преміум-підписка" },
  "subs.premiumBenefits": { de: "Unbegrenzte Anzeigen, Vorrang-Support und mehr", it: "Annunci illimitati, supporto prioritario e altro", en: "Unlimited listings, priority support and more", fr: "Annonces illimitées, support prioritaire et plus", pl: "Nielimitowane ogłoszenia, priorytetowe wsparcie i więcej", tr: "Sınırsız ilan, öncelikli destek ve daha fazlası", uk: "Необмежені оголошення, пріоритетна підтримка та багато іншого" },
  "subs.explore": { de: "Pakete erkunden", it: "Esplora i pacchetti", en: "Explore packages", fr: "Explorer les forfaits", pl: "Poznaj pakiety", tr: "Paketleri keşfet", uk: "Переглянути пакети" },

  // Common
  "common.loading": { de: "Lädt...", it: "Caricamento...", en: "Loading...", fr: "Chargement...", pl: "Ładowanie...", tr: "Yükleniyor...", uk: "Завантаження..." },
  "common.error": { de: "Fehler", it: "Errore", en: "Error", fr: "Erreur", pl: "Błąd", tr: "Hata", uk: "Помилка" },
  "common.success": { de: "Erfolg", it: "Successo", en: "Success", fr: "Succès", pl: "Sukces", tr: "Başarılı", uk: "Успішно" },
  "common.confirm": { de: "Bestätigen", it: "Conferma", en: "Confirm", fr: "Confirmer", pl: "Potwierdź", tr: "Onayla", uk: "Підтвердити" },
  "common.cancel": { de: "Abbrechen", it: "Annulla", en: "Cancel", fr: "Annuler", pl: "Anuluj", tr: "İptal", uk: "Скасувати" },
  "common.close": { de: "Schließen", it: "Chiudi", en: "Close", fr: "Fermer", pl: "Zamknij", tr: "Kapat", uk: "Закрити" },
  "common.save": { de: "Speichern", it: "Salva", en: "Save", fr: "Enregistrer", pl: "Zapisz", tr: "Kaydet", uk: "Зберегти" },
  "common.delete": { de: "Löschen", it: "Elimina", en: "Delete", fr: "Supprimer", pl: "Usuń", tr: "Sil", uk: "Видалити" },

  // Home
  "home.hero.title": { de: "Finde, was du suchst – mit Zazarap", it: "Trova quello che cerchi con Zazarap", en: "Find what you need with Zazarap", uk: "Знайди те, що шукаєш, з Zazarap", tr: "Aradığını Zazarap ile bul", fr: "Trouvez ce dont vous avez besoin avec Zazarap", pl: "Znajdź to, czego szukasz z Zazarap" },
  "home.hero.subtitle": { de: "Durchsuche Tausende von Kleinanzeigen in ganz Deutschland – sicher und schnell.", it: "Cerca tra migliaia di annunci in tutta la Germania – in modo sicuro e veloce.", en: "Browse thousands of classifieds across Germany – safely and quickly.", uk: "Переглядай тисячі оголошень по всій Німеччині – швидко та безпечно.", tr: "Tüm Almanya'daki binlerce ilanı güvenli ve hızlı bir şekilde keşfet.", fr: "Parcourez des milliers d'annonces partout en Allemagne – rapidement et en toute sécurité.", pl: "Przeglądaj tysiące ogłoszeń w całych Niemczech – szybko i bezpiecznie." },
  "home.search.placeholder.query": { de: "Auto, Wohnung, Smartphone, Fahrrad …", it: "Auto, casa, smartphone, bicicletta…", en: "Car, flat, smartphone, bike…", uk: "Авто, квартира, смартфон, велосипед…", tr: "Araba, daire, telefon, bisiklet…", fr: "Voiture, appartement, smartphone, vélo…", pl: "Samochód, mieszkanie, telefon, rower…" },
  "home.search.placeholder.location": { de: "Ganz Deutschland", it: "Tutta la Germania", en: "All of Germany", uk: "Вся Німеччина", tr: "Tüm Almanya", fr: "Toute l'Allemagne", pl: "Całe Niemcy" },
  "home.search.button": { de: "Suchen", it: "Cerca", en: "Search", uk: "Пошук", tr: "Ara", fr: "Rechercher", pl: "Szukaj" },

  // Marketplace
  "marketplace.searchPlaceholder": { de: "Anzeigen durchsuchen...", it: "Cerca annunci...", en: "Search listings...", fr: "Rechercher des annonces...", pl: "Szukaj ogłoszeń...", tr: "İlanları ara...", uk: "Шукати оголошення..." },
  "marketplace.filters": { de: "Filter", it: "Filtri", en: "Filters", fr: "Filtres", pl: "Filtry", tr: "Filtreler", uk: "Фільтри" },
  "marketplace.category": { de: "Kategorie", it: "Categoria", en: "Category", fr: "Catégorie", pl: "Kategoria", tr: "Kategori", uk: "Категорія" },
  "marketplace.allCategories": { de: "Alle Kategorien", it: "Tutte le categorie", en: "All Categories", fr: "Toutes les catégories", pl: "Wszystkie kategorie", tr: "Tüm Kategoriler", uk: "Всі категорії" },
  "marketplace.priceMin": { de: "Mindestpreis (€)", it: "Prezzo minimo (€)", en: "Min Price (€)", fr: "Prix min (€)", pl: "Cena min (€)", tr: "Minimum Fiyat (€)", uk: "Мін. ціна (€)" },
  "marketplace.priceMax": { de: "Höchstpreis (€)", it: "Prezzo massimo (€)", en: "Max Price (€)", fr: "Prix max (€)", pl: "Cena max (€)", tr: "Maksimum Fiyat (€)", uk: "Макс. ціна (€)" },
  "marketplace.city": { de: "Stadt", it: "Città", en: "City", fr: "Ville", pl: "Miasto", tr: "Şehir", uk: "Місто" },
  "marketplace.allCities": { de: "Alle Städte", it: "Tutte le città", en: "All Cities", fr: "Toutes les villes", pl: "Wszystkie miasta", tr: "Tüm Şehirler", uk: "Всі міста" },
  "marketplace.sortBy": { de: "Sortieren nach", it: "Ordina per", en: "Sort by", fr: "Trier par", pl: "Sortuj według", tr: "Sırala", uk: "Сортувати" },
  "marketplace.mostRecent": { de: "Neueste", it: "Più recenti", en: "Most Recent", fr: "Plus récents", pl: "Najnowsze", tr: "En Yeni", uk: "Найновіші" },
  "marketplace.leastRecent": { de: "Älteste", it: "Meno recenti", en: "Oldest", fr: "Plus anciens", pl: "Najstarsze", tr: "En Eski", uk: "Найстаріші" },
  "marketplace.priceAsc": { de: "Preis aufsteigend", it: "Prezzo crescente", en: "Price Ascending", fr: "Prix croissant", pl: "Cena rosnąco", tr: "Artan Fiyat", uk: "Ціна за зростанням" },
  "marketplace.priceDesc": { de: "Preis absteigend", it: "Prezzo decrescente", en: "Price Descending", fr: "Prix décroissant", pl: "Cena malejąco", tr: "Azalan Fiyat", uk: "Ціна за спаданням" },
  "marketplace.resetFilters": { de: "Filter zurücksetzen", it: "Resetta filtri", en: "Reset Filters", fr: "Réinitialiser les filtres", pl: "Resetuj filtry", tr: "Filtreleri Sıfırla", uk: "Скинути фільтри" },
  "marketplace.adsFound": { de: "Anzeigen gefunden", it: "annunci trovati", en: "ads found", fr: "annonces trouvées", pl: "ogłoszeń znalezionych", tr: "ilan bulundu", uk: "оголошень знайдено" },
  "marketplace.noAdsFound": { de: "Keine Anzeigen gefunden", it: "Nessun annuncio trovato", en: "No ads found", fr: "Aucune annonce trouvée", pl: "Nie znaleziono ogłoszeń", tr: "İlan bulunamadı", uk: "Оголошень не знайдено" },

  // Listing Detail
  "listing.contactSeller": { de: "Verkäufer kontaktieren", it: "Contatta venditore", en: "Contact Seller", fr: "Contacter le vendeur", pl: "Skontaktuj się ze sprzedawcą", tr: "Satıcıyla İletişime Geç", uk: "Зв'язатися з продавцем" },
  "listing.addToFavorites": { de: "Zu Favoriten", it: "Aggiungi ai preferiti", en: "Add to Favorites", fr: "Ajouter aux favoris", pl: "Dodaj do ulubionych", tr: "Favorilere Ekle", uk: "Додати в обране" },
  "listing.removeFromFavorites": { de: "Aus Favoriten entfernen", it: "Rimuovi dai preferiti", en: "Remove from Favorites", fr: "Retirer des favoris", pl: "Usuń z ulubionych", tr: "Favorilerden Çıkar", uk: "Видалити з обраного" },
  "listing.editListing": { de: "Anzeige bearbeiten", it: "Modifica annuncio", en: "Edit Listing", fr: "Modifier l'annonce", pl: "Edytuj ogłoszenie", tr: "İlanı Düzenle", uk: "Редагувати оголошення" },
  "listing.promote": { de: "Hervorheben", it: "Metti in evidenza", en: "Promote", fr: "Mettre en avant", pl: "Promuj", tr: "Öne Çıkar", uk: "Виділити" },
  "listing.share": { de: "Teilen", it: "Condividi", en: "Share", fr: "Partager", pl: "Udostępnij", tr: "Paylaş", uk: "Поділитися" },
  "listing.report": { de: "Melden", it: "Segnala", en: "Report", fr: "Signaler", pl: "Zgłoś", tr: "Bildir", uk: "Поскаржитись" },
  "listing.notFound": { de: "Anzeige nicht gefunden", it: "Annuncio non trovato", en: "Listing not found", fr: "Annonce introuvable", pl: "Nie znaleziono ogłoszenia", tr: "İlan bulunamadı", uk: "Оголошення не знайдено" },
  "listing.backToMarketplace": { de: "Zurück zum Marktplatz", it: "Torna al marketplace", en: "Back to Marketplace", fr: "Retour au marché", pl: "Wróć do marketplace", tr: "Pazaryerine dön", uk: "Назад до маркетплейсу" },

  // Forms
  "form.title": { de: "Titel", it: "Titolo", en: "Title", fr: "Titre", pl: "Tytuł", tr: "Başlık", uk: "Назва" },
  "form.description": { de: "Beschreibung", it: "Descrizione", en: "Description", fr: "Description", pl: "Opis", tr: "Açıklama", uk: "Опис" },
  "form.price": { de: "Preis", it: "Prezzo", en: "Price", fr: "Prix", pl: "Cena", tr: "Fiyat", uk: "Ціна" },
  "form.category": { de: "Kategorie", it: "Categoria", en: "Category", fr: "Catégorie", pl: "Kategoria", tr: "Kategori", uk: "Категорія" },
  "form.selectCategory": { de: "Kategorie auswählen", it: "Seleziona categoria", en: "Select category", fr: "Sélectionner catégorie", pl: "Wybierz kategorię", tr: "Kategori seçin", uk: "Виберіть категорію" },
  "form.images": { de: "Bilder", it: "Immagini", en: "Images", fr: "Images", pl: "Zdjęcia", tr: "Resimler", uk: "Зображення" },
  "form.city": { de: "Stadt", it: "Città", en: "City", fr: "Ville", pl: "Miasto", tr: "Şehir", uk: "Місто" },

  // Auth
  "auth.loginOrRegister": { de: "Anmelden oder Registrieren", it: "Accedi o Registrati", en: "Login or Register", fr: "Connexion ou Inscription", pl: "Zaloguj się lub Zarejestruj", tr: "Giriş Yap veya Kayıt Ol", uk: "Увійти або Зареєструватися" },

  // ARIA Labels
  "aria.home": { de: "Startseite", it: "Home", en: "Home", fr: "Accueil", pl: "Strona główna", tr: "Ana sayfa", uk: "Головна" },
  "aria.messages": { de: "Nachrichten", it: "Messaggi", en: "Messages", fr: "Messages", pl: "Wiadomości", tr: "Mesajlar", uk: "Повідомлення" },
  "aria.create": { de: "Anzeige erstellen", it: "Crea annuncio", en: "Create ad", fr: "Créer annonce", pl: "Utwórz ogłoszenie", tr: "İlan oluştur", uk: "Створити оголошення" },
  "aria.notifications": { de: "Benachrichtigungen", it: "Notifiche", en: "Notifications", fr: "Notifications", pl: "Powiadomienia", tr: "Bildirimler", uk: "Сповіщення" },
  "aria.settings": { de: "Einstellungen", it: "Impostazioni", en: "Settings", fr: "Paramètres", pl: "Ustawienia", tr: "Ayarlar", uk: "Налаштування" },
  "aria.language": { de: "Sprache wählen", it: "Scegli lingua", en: "Choose language", fr: "Choisir la langue", pl: "Wybierz język", tr: "Dil seçin", uk: "Вибрати мову" },

  // Footer
  "footer.tagline": { de: "Der sichere und zuverlässige deutsche Marktplatz", it: "Il marketplace tedesco sicuro e affidabile", en: "The secure and reliable German marketplace", fr: "La place de marché allemande sûre et fiable", pl: "Bezpieczna i niezawodna niemiecka platforma handlowa", tr: "Güvenli ve güvenilir Alman pazaryeri", uk: "Безпечна та надійна німецька торговельна платформа" },
  "footer.legal": { de: "Rechtliches", it: "Note legali", en: "Legal", fr: "Mentions légales", pl: "Informacje prawne", tr: "Yasal bilgiler", uk: "Правова інформація" },
  "footer.impressum": { de: "Impressum", it: "Impressum", en: "Imprint", fr: "Impressum", pl: "Impressum", tr: "Künye", uk: "Impressum" },
  "footer.privacy": { de: "Datenschutz", it: "Privacy", en: "Privacy", fr: "Confidentialité", pl: "Prywatność", tr: "Gizlilik", uk: "Конфіденційність" },
  "footer.agb": { de: "AGB", it: "Termini", en: "Terms", fr: "CGV", pl: "Regulamin", tr: "Şartlar", uk: "Умови" },
  "footer.support": { de: "Support", it: "Supporto", en: "Support", fr: "Support", pl: "Wsparcie", tr: "Destek", uk: "Підтримка" },
  "footer.contactUs": { de: "Kontakt", it: "Contattaci", en: "Contact Us", fr: "Nous contacter", pl: "Kontakt", tr: "İletişim", uk: "Контакти" },
  "footer.newsletter": { de: "Newsletter", it: "Newsletter", en: "Newsletter", fr: "Newsletter", pl: "Newsletter", tr: "Bülten", uk: "Розсилка" },
  "footer.newsletterDesc": { de: "Erhalten Sie exklusive Angebote und Neuigkeiten", it: "Ricevi offerte esclusive e novità", en: "Receive exclusive offers and news", fr: "Recevez des offres exclusives et actualités", pl: "Otrzymuj ekskluzywne oferty i aktualności", tr: "Özel teklifler ve haberler alın", uk: "Отримуйте ексклюзивні пропозиції та новини" },
  "footer.allRightsReserved": { de: "Alle Rechte vorbehalten", it: "Tutti i diritti riservati", en: "All rights reserved", fr: "Tous droits réservés", pl: "Wszelkie prawa zastrzeżone", tr: "Tüm hakları saklıdır", uk: "Всі права захищені" },
};

// Cookie utilities
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, maxAge = 31536000) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

// URL prefix detection
const getLanguageFromURL = () => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const match = path.match(/^\/(de|it|en|fr|pl|tr|uk)(\/|$)/);
  return match ? match[1] : null;
};

const LanguageContext = createContext();

/**
 * @returns {{language: string, setLanguage: (lang: string) => void, t: (key: string, vars?: object) => string}}
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProviderV2');
  }
  return context;
}

/** @param {{children: React.ReactNode}} props */
export function LanguageProviderV2({ children }) {
  const [language, setLanguageState] = useState(() => {
    // Priority: URL prefix > Cookie > Browser > Default
    const urlLang = getLanguageFromURL();
    if (urlLang && SUPPORTED_LANGS.includes(urlLang)) return urlLang;

    const cookieLang = getCookie(COOKIE_NAME);
    if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) return cookieLang;

    // Auto-detect browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      for (const lang of SUPPORTED_LANGS) {
        if (browserLang.startsWith(lang)) return lang;
      }
    }

    return DEFAULT_LANG;
  });

  const setLanguage = (lang) => {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    setLanguageState(lang);
    setCookie(COOKIE_NAME, lang);
    localStorage.setItem('zazarap_language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    setCookie(COOKIE_NAME, language);
    localStorage.setItem('zazarap_language', language);
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Translation function with variable interpolation
   * @param {string} key - Translation key (e.g., "ads.header.title")
   * @param {object} vars - Variables for interpolation (e.g., {name: "John"})
   * @returns {string} Translated string
   */
  const t = (key, vars = {}) => {
    let translated = i18n[key]?.[language] || i18n[key]?.[DEFAULT_LANG] || key;
    
    // Variable interpolation: {name} → vars.name
    if (vars && typeof translated === 'string') {
      Object.keys(vars).forEach(varKey => {
        translated = translated.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
      });
    }

    return translated;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}