// @ts-check
import React, { createContext, useContext, useState, useEffect } from 'react';

const SUPPORTED_LANGS = ["de", "it", "en", "fr", "pl", "tr", "uk"];
const DEFAULT_LANG = "de";

// Namespace-based translations (new format)
const i18n = {
  "header.brand": { de: "Zazarap", it: "Zazarap", en: "Zazarap", uk: "Zazarap", tr: "Zazarap", fr: "Zazarap", pl: "Zazarap" },
  "header.nav.home": { de: "Startseite", it: "Homepage", en: "Home", uk: "Головна", tr: "Ana sayfa", fr: "Accueil", pl: "Strona główna" },
  "header.nav.categories": { de: "Kategorien", it: "Categorie", en: "Categories", uk: "Категорії", tr: "Kategoriler", fr: "Catégories", pl: "Kategorie" },
  "header.nav.login": { de: "Anmelden", it: "Accedi", en: "Log in", uk: "Увійти", tr: "Giriş yap", fr: "Se connecter", pl: "Zaloguj się" },
  "header.nav.register": { de: "Registrieren", it: "Registrati", en: "Sign up", uk: "Зареєструватися", tr: "Kayıt ol", fr: "S'inscrire", pl: "Załóż konto" },

  "ui.showMap": { de: "Karte anzeigen", it: "Mostra mappa", en: "Show map", uk: "Показати мапу", tr: "Haritayı göster", fr: "Afficher la carte", pl: "Pokaż mapę" },
  "ui.hideMap": { de: "Karte ausblenden", it: "Nascondi mappa", en: "Hide map", uk: "Сховати мапу", tr: "Haritayı gizle", fr: "Masquer la carte", pl: "Ukryj mapę" },
  "ui.positionSet": { de: "Position gesetzt", it: "Posizione impostata", en: "Position set", uk: "Позицію встановлено", tr: "Konum ayarlandı", fr: "Position définie", pl: "Pozycja ustawiona" },
  "ui.positionNotSet": { de: "Position nicht festgelegt", it: "Posizione non impostata", en: "Position not set", uk: "Позицію не встановлено", tr: "Konum ayarlı değil", fr: "Position non définie", pl: "Pozycja nieustawiona" },
  "ui.useMyLocation": { de: "Meinen Standort verwenden", it: "Usa la mia posizione", en: "Use my location", uk: "Використати мою локацію", tr: "Konumumu kullan", fr: "Utiliser ma position", pl: "Użyj mojej lokalizacji" },
  "ui.radius": { de: "Radius (km)", it: "Raggio (km)", en: "Radius (km)", uk: "Радіус (км)", tr: "Yarıçap (km)", fr: "Rayon (km)", pl: "Promień (km)" },
  "ui.follow": { de: "Folgen", it: "Segui", en: "Follow", uk: "Стежити", tr: "Takip et", fr: "Suivre", pl: "Obserwuj" },
  "ui.unfollow": { de: "Nicht mehr folgen", it: "Smetti di seguire", en: "Unfollow", uk: "Відписатися", tr: "Takibi bırak", fr: "Ne plus suivre", pl: "Przestań obserwować" },
  "ui.followCategory": { de: "Kategorie folgen", it: "Segui categoria", en: "Follow category", uk: "Стежити за категорією", tr: "Kategoriyi takip et", fr: "Suivre la catégorie", pl: "Obserwuj kategorię" },
  "ui.unfollowCategory": { de: "Kategorie nicht mehr folgen", it: "Non seguire più", en: "Unfollow category", uk: "Відписатися від категорії", tr: "Kategoriyi takipten çık", fr: "Ne plus suivre la catégorie", pl: "Przestań obserwować kategorię" }
  ,"header.nav.postAd": { de: "Anzeige aufgeben", it: "Pubblica annuncio", en: "Post an ad", uk: "Створити оголошення", tr: "İlan ver", fr: "Déposer une annonce", pl: "Dodaj ogłoszenie" },
  
  // Nav shortcuts
  "nav.home": { de: "Startseite", it: "Homepage", en: "Home", uk: "Головна", tr: "Ana sayfa", fr: "Accueil", pl: "Strona główna" },
  "nav.categories": { de: "Kategorien", it: "Categorie", en: "Categories", uk: "Категорії", tr: "Kategoriler", fr: "Catégories", pl: "Kategorie" },
  "nav.postAd": { de: "Anzeige aufgeben", it: "Pubblica annuncio", en: "Post an ad", uk: "Створити оголошення", tr: "İlan ver", fr: "Déposer une annonce", pl: "Dodaj ogłoszenie" },

  // Home hero
  // Ads / Werbung
  "ads.header.title": { de: "Werbung & Premium-Pakete", it: "Pubblicità & Pacchetti Premium", en: "Advertising & Premium Packages", fr: "Publicité & Forfaits premium", pl: "Reklama i pakiety premium", tr: "Reklam & Premium Paketler", uk: "Реклама та преміум-пакети" },
  "ads.header.subtitle": { de: "Mehr Sichtbarkeit. Mehr Kunden. Mehr Verkäufe.", it: "Più visibilità. Più clienti. Più vendite.", en: "More visibility. More customers. More sales.", fr: "Plus de visibilité. Plus de clients. Plus de ventes.", pl: "Więcej widoczności. Więcej klientów. Więcej sprzedaży.", tr: "Daha fazla görünürlük. Daha fazla müşteri. Daha fazla satış.", uk: "Більше видимості. Більше клієнтів. Більше продажів." },
  "ads.banner.cta": { de: "Erhöhen Sie Ihre Reichweite auf Zazarap", it: "Aumenta la tua portata su Zazarap", en: "Boost your reach on Zazarap", fr: "Augmentez votre portée sur Zazarap", pl: "Zwiększ zasięg na Zazarap", tr: "Zazarap'ta erişiminizi artırın", uk: "Збільшіть охоплення на Zazarap" },
  "ads.section.privateTitle": { de: "Premium-Werbung für private Nutzer", it: "Pubblicità premium per utenti privati", en: "Premium ads for private users", fr: "Publicité premium pour les particuliers", pl: "Reklama premium dla użytkowników prywatnych", tr: "Bireysel kullanıcılar için premium reklam", uk: "Преміум-реклама для приватних користувачів" },
  "ads.section.privateDesc": { de: "Steigern Sie die Sichtbarkeit Ihrer Anzeigen mit unseren Premium-Optionen. Ideal für Verkäufer, die schneller verkaufen möchten.", it: "Aumenta la visibilità dei tuoi annunci con le nostre opzioni premium. Ideale per chi vuole vendere più velocemente.", en: "Increase your listings' visibility with our premium options. Ideal for faster sales.", fr: "Augmentez la visibilité de vos annonces avec nos options premium.", pl: "Zwiększ widoczność ogłoszeń dzięki opcjom premium.", tr: "Premium seçeneklerle ilan görünürlüğünü artırın.", uk: "Підвищіть видимість оголошень за допомогою преміум-опцій." },
  "ads.section.businessTitle": { de: "Werbepakete für Geschäfte & Unternehmen", it: "Pacchetti pubblicitari per negozi e aziende", en: "Ad packages for shops & businesses", fr: "Forfaits publicitaires pour commerces & entreprises", pl: "Pakiety reklamowe dla sklepów i firm", tr: "Mağazalar ve işletmeler için reklam paketleri", uk: "Рекламні пакети для магазинів і бізнесу" },
  "ads.section.businessDesc": { de: "Perfekt für Shops, Händler und professionelle Anbieter. Präsentieren Sie Ihre Marke auf Zazarap.", it: "Perfetto per negozi, rivenditori e professionisti. Presenta il tuo brand su Zazarap.", en: "Perfect for shops, dealers and pros. Showcase your brand on Zazarap.", fr: "Parfait pour boutiques, revendeurs et pros.", pl: "Idealne dla sklepów, sprzedawców i profesjonalistów.", tr: "Mağazalar, satıcılar ve profesyoneller için mükemmel.", uk: "Ідеально для магазинів, продавців та професіоналів." },
  "ads.section.bannerTitle": { de: "Werbebanner & Grafikpromotion", it: "Banner pubblicitari & promozioni grafiche", en: "Ad banners & graphic promotion", fr: "Bannières publicitaires & promotion graphique", pl: "Banery reklamowe i promocja graficzna", tr: "Reklam afişleri ve grafik tanıtım", uk: "Рекламні банери та графічна промоція" },
  "ads.section.bannerDesc": { de: "Platzieren Sie Ihren Banner an strategischen Orten auf Zazarap.", it: "Posiziona i tuoi banner in punti strategici su Zazarap.", en: "Place your banner in strategic spots on Zazarap.", fr: "Placez votre bannière à des endroits stratégiques sur Zazarap.", pl: "Umieść baner w strategicznych miejscach na Zazarap.", tr: "Bannerinizi Zazarap'ta stratejik noktalara yerleştirin.", uk: "Розмістіть банер у стратегічних місцях на Zazarap." },
  "ads.packages.topAd.title": { de: "TOP-Anzeige", it: "Annuncio TOP", en: "TOP Ad", fr: "Annonce TOP", pl: "Ogłoszenie TOP", tr: "TOP İlan", uk: "TOP-оголошення" },
  "ads.packages.topAd.desc": { de: "Ihre Anzeige wird 7 Tage lang ganz oben in der Kategorie angezeigt.", it: "Il tuo annuncio resta 7 giorni in cima alla categoria.", en: "Your listing stays 7 days on top of the category.", fr: "Votre annonce reste 7 jours en haut de la catégorie.", pl: "Twoje ogłoszenie przez 7 dni na górze kategorii.", tr: "İlanınız 7 gün kategori en üstünde kalır.", uk: "Оголошення 7 днів зверху категорії." },
  "ads.packages.highlighted.title": { de: "Hervorgehobene Anzeige", it: "Annuncio evidenziato", en: "Highlighted ad", fr: "Annonce mise en avant", pl: "Wyróżnione ogłoszenie", tr: "Vurgulanan ilan", uk: "Виділене оголошення" },
  "ads.packages.highlighted.desc": { de: "Farblicher Rahmen + besserer Platz in den Suchergebnissen.", it: "Cornice colorata + miglior posizione nei risultati.", en: "Colored frame + better search placement.", fr: "Cadre coloré + meilleur placement.", pl: "Kolorowa ramka + lepsza pozycja w wynikach.", tr: "Renkli çerçeve + daha iyi arama konumu.", uk: "Кольорова рамка + краща позиція у видачі." },
  "ads.packages.premium14.title": { de: "Premium 14 Tage", it: "Premium 14 giorni", en: "Premium 14 days", fr: "Premium 14 jours", pl: "Premium 14 dni", tr: "Premium 14 gün", uk: "Premium 14 днів" },
  "ads.packages.premium14.desc": { de: "Maximale Sichtbarkeit für zwei Wochen mit allen Vorteilen.", it: "Massima visibilità per due settimane con tutti i vantaggi.", en: "Max visibility for two weeks with all benefits.", fr: "Visibilité maximale pendant deux semaines.", pl: "Maksymalna widoczność przez dwa tygodnie.", tr: "İki hafta boyunca maksimum görünürlük.", uk: "Максимальна видимість на два тижні." },
  "ads.packages.basicShop.title": { de: "Basic Shop-Paket", it: "Pacchetto Shop Basic", en: "Basic Shop Package", fr: "Forfait boutique Basic", pl: "Pakiet Sklep Basic", tr: "Temel Mağaza Paketi", uk: "Базовий пакет магазину" },
  "ads.packages.businessShop.title": { de: "Business Shop-Paket", it: "Pacchetto Shop Business", en: "Business Shop Package", fr: "Forfait boutique Business", pl: "Pakiet Sklep Business", tr: "İşletme Mağaza Paketi", uk: "Пакет магазину Business" },
  "ads.packages.premiumShop.title": { de: "Premium Shop-Paket", it: "Pacchetto Shop Premium", en: "Premium Shop Package", fr: "Forfait boutique Premium", pl: "Pakiet Sklep Premium", tr: "Premium Mağaza Paketi", uk: "Пакет магазину Premium" },
  "ads.features.ownShopPage": { de: "Eigene Shop-Seite", it: "Pagina negozio dedicata", en: "Own shop page", fr: "Page boutique dédiée", pl: "Własna strona sklepu", tr: "Özel mağaza sayfası", uk: "Власна сторінка магазину" },
  "ads.features.upTo20Active": { de: "Bis zu 20 aktive Anzeigen", it: "Fino a 20 annunci attivi", en: "Up to 20 active listings", fr: "Jusqu'à 20 annonces actives", pl: "Do 20 aktywnych ogłoszeń", tr: "20'ye kadar aktif ilan", uk: "До 20 активних оголошень" },
  "ads.features.standardSupport": { de: "Standard-Unterstützung", it: "Supporto standard", en: "Standard support", fr: "Support standard", pl: "Wsparcie standardowe", tr: "Standart destek", uk: "Стандартна підтримка" },
  "ads.features.upTo100Active": { de: "Bis zu 100 aktive Anzeigen", it: "Fino a 100 annunci attivi", en: "Up to 100 active listings", fr: "Jusqu'à 100 annonces actives", pl: "Do 100 aktywnych ogłoszeń", tr: "100'e kadar aktif ilan", uk: "До 100 активних оголошень" },
  "ads.features.logoBranding": { de: "Logo & Branding", it: "Logo & Branding", en: "Logo & Branding", fr: "Logo & Branding", pl: "Logo i branding", tr: "Logo & Marka", uk: "Логотип і брендинг" },
  "ads.features.searchBanner": { de: "Werbebanner im Suchbereich", it: "Banner pubblicitario nella ricerca", en: "Ad banner in search area", fr: "Bannière dans la recherche", pl: "Baner w wyszukiwarce", tr: "Arama alanında banner", uk: "Банер у пошуку" },
  "ads.features.unlimitedAds": { de: "Unbegrenzte Anzeigen", it: "Annunci illimitati", en: "Unlimited listings", fr: "Annonces illimitées", pl: "Nielimitowane ogłoszenia", tr: "Sınırsız ilan", uk: "Необмежені оголошення" },
  "ads.features.homepageBanner": { de: "Startseiten-Banner", it: "Banner in homepage", en: "Homepage banner", fr: "Bannière d'accueil", pl: "Baner na stronie głównej", tr: "Ana sayfa bannerı", uk: "Банер на головній" },
  "ads.features.prioritySupport": { de: "Priorisierter Support", it: "Supporto prioritario", en: "Priority support", fr: "Support prioritaire", pl: "Priorytetowe wsparcie", tr: "Öncelikli destek", uk: "Пріоритетна підтримка" },
  "ads.packages.homeBanner.title": { de: "Startseiten-Banner", it: "Banner Homepage", en: "Homepage Banner", fr: "Bannière d'accueil", pl: "Baner na stronie głównej", tr: "Ana sayfa bannerı", uk: "Банер на головній" },
  "ads.packages.homeBanner.desc": { de: "Perfekt für maximale Sichtbarkeit.", it: "Perfetto per la massima visibilità.", en: "Perfect for maximum visibility.", fr: "Parfait pour une visibilité maximale.", pl: "Idealny dla maksymalnej widoczności.", tr: "Maksimum görünürlük için ideal.", uk: "Ідеально для максимальної видимості." },
  "ads.packages.categoryBanner.title": { de: "Kategorie-Banner", it: "Banner Categoria", en: "Category Banner", fr: "Bannière de catégorie", pl: "Baner kategorii", tr: "Kategori bannerı", uk: "Банер категорії" },
  "ads.packages.categoryBanner.desc": { de: "Direkt in der passenden Kategorie für Ihre Zielgruppe.", it: "Direttamente nella categoria giusta per il tuo target.", en: "Right inside the right category for your audience.", fr: "Directement dans la catégorie adaptée à votre audience.", pl: "Bezpośrednio w odpowiedniej kategorii dla grupy docelowej.", tr: "Hedef kitle için doğru kategoride.", uk: "Прямо в потрібній категорії для вашої аудиторії." },
  "ads.packages.sidebarAd.title": { de: "Sidebar-Werbung", it: "Annuncio sidebar", en: "Sidebar Ad", fr: "Publicité sidebar", pl: "Reklama w bocznym pasku", tr: "Kenar çubuğu reklamı", uk: "Реклама в сайдбарі" },
  "ads.packages.sidebarAd.desc": { de: "Eine günstige, aber sichtbare Werbefläche.", it: "Spazio pubblicitario economico ma visibile.", en: "Affordable yet visible ad spot.", fr: "Emplacement publicitaire abordable mais visible.", pl: "Tanie, ale widoczne miejsce reklamowe.", tr: "Uygun fiyatlı ancak görünür reklam alanı.", uk: "Доступне, але помітне місце реклами." },
  "ads.btn.buyNow": { de: "Jetzt kaufen", it: "Acquista ora", en: "Buy now", fr: "Acheter maintenant", pl: "Kup teraz", tr: "Şimdi satın al", uk: "Купити зараз" },
  "ads.btn.subscribeNow": { de: "Jetzt abonnieren", it: "Abbonati ora", en: "Subscribe now", fr: "S'abonner", pl: "Subskrybuj teraz", tr: "Hemen abone ol", uk: "Підписатися" },
  "ads.btn.bookBanner": { de: "Banner buchen", it: "Prenota banner", en: "Book banner", fr: "Réserver bannière", pl: "Zarezerwuj banner", tr: "Banner rezervasyonu yap", uk: "Забронювати банер" },
  "ads.bestseller": { de: "Bestseller", it: "Più venduto", en: "Bestseller", fr: "Meilleure vente", pl: "Bestseller", tr: "En çok satan", uk: "Хіт продажів" },
  "ads.modal.select.successToast": { de: "Promotion aktiviert", it: "Promozione attivata", en: "Promotion activated", fr: "Promotion activée", pl: "Promocja aktywowana", tr: "Promosyon etkinleştirildi", uk: "Промоцію активовано" },
  "ads.modal.request.emailSubject": { de: "Werbeanfrage", it: "Richiesta pubblicitaria", en: "Ad request", fr: "Demande publicitaire", pl: "Zapytanie reklamowe", tr: "Reklam talebi", uk: "Запит реклами" },
  "ads.modal.request.emailPackage": { de: "Paket", it: "Pacchetto", en: "Package", fr: "Forfait", pl: "Pakiet", tr: "Paket", uk: "Пакет" },
  "ads.modal.request.emailPrice": { de: "Preis", it: "Prezzo", en: "Price", fr: "Prix", pl: "Cena", tr: "Fiyat", uk: "Ціна" },
  "ads.modal.request.successToast": { de: "Anfrage gesendet. Wir melden uns in Kürze.", it: "Richiesta inviata. Ti ricontatteremo presto.", en: "Request sent. We'll get back to you soon.", fr: "Demande envoyée. Nous vous recontacterons bientôt.", pl: "Zapytanie wysłane. Wkrótce się odezwiemy.", tr: "Talep gönderildi. Yakında size döneceğiz.", uk: "Запит надіслано. Ми зв'яжемося з вами незабаром." },
  "ads.adListing.title": { de: "Werbeinserat", it: "Annuncio pubblicitario", en: "Advertising listing", fr: "Annonce publicitaire", pl: "Ogłoszenie reklamowe", tr: "Reklam ilanı", uk: "Рекламне оголошення" },
  "ads.adListing.subscribersOnly": { de: "Nur für Abonnenten", it: "Solo per abbonati", en: "Subscribers only", fr: "Réservé aux abonnés", pl: "Tylko dla subskrybentów", tr: "Sadece aboneler için", uk: "Тільки для передплатників" },
  "ads.adListing.createNew": { de: "Neues Inserat", it: "Nuovo annuncio", en: "New listing", fr: "Nouvelle annonce", pl: "Nowe ogłoszenie", tr: "Yeni ilan", uk: "Нове оголошення" },
  "ads.createModal.title": { de: "Werbeinserat erstellen", it: "Crea annuncio pubblicitario", en: "Create ad listing", fr: "Créer une annonce", pl: "Utwórz ogłoszenie reklamowe", tr: "Reklam ilanı oluştur", uk: "Створити рекламне оголошення" },
  "ads.createModal.subscribersOnly": { de: "Nur für Abonnenten · Upgrade erforderlich", it: "Solo per abbonati · Upgrade richiesto", en: "Subscribers only · Upgrade required", fr: "Abonnés uniquement · Mise à niveau requise", pl: "Tylko dla subskrybentów · Wymagana aktualizacja", tr: "Sadece aboneler · Yükseltme gerekli", uk: "Тільки для передплатників · Потрібне оновлення" },
  "ads.createModal.titlePlaceholder": { de: "Titel", it: "Titolo", en: "Title", fr: "Titre", pl: "Tytuł", tr: "Başlık", uk: "Назва" },
  "ads.createModal.urlPlaceholder": { de: "Ziel-URL (https://...)", it: "URL destinazione (https://...)", en: "Target URL (https://...)", fr: "URL cible (https://...)", pl: "Docelowy URL (https://...)", tr: "Hedef URL (https://...)", uk: "Цільовий URL (https://...)" },
  "ads.createModal.placementLabel": { de: "Platzierung", it: "Posizionamento", en: "Placement", fr: "Emplacement", pl: "Lokalizacja", tr: "Yerleşim", uk: "Розміщення" },
  "ads.createModal.placement.homepage": { de: "Startseite", it: "Homepage", en: "Homepage", fr: "Page d'accueil", pl: "Strona główna", tr: "Ana sayfa", uk: "Головна" },
  "ads.createModal.placement.category": { de: "Kategorie", it: "Categoria", en: "Category", fr: "Catégorie", pl: "Kategoria", tr: "Kategori", uk: "Категорія" },
  "ads.createModal.placement.search": { de: "Suche", it: "Ricerca", en: "Search", fr: "Recherche", pl: "Wyszukiwanie", tr: "Arama", uk: "Пошук" },
  "ads.createModal.placement.sidebar": { de: "Sidebar", it: "Barra laterale", en: "Sidebar", fr: "Barre latérale", pl: "Pasek boczny", tr: "Kenar çubuğu", uk: "Бічна панель" },
  "ads.createModal.mediaAssetLabel": { de: "Medien-Asset", it: "Risorsa multimediale", en: "Media asset", fr: "Ressource média", pl: "Zasób medialny", tr: "Medya kaynağı", uk: "Медіа-ресурс" },
  "ads.createModal.selectAsset": { de: "Wähle ein Asset...", it: "Seleziona una risorsa...", en: "Select an asset...", fr: "Sélectionner une ressource...", pl: "Wybierz zasób...", tr: "Bir kaynak seçin...", uk: "Виберіть ресурс..." },
  "ads.createModal.createBtn": { de: "Erstellen", it: "Crea", en: "Create", fr: "Créer", pl: "Utwórz", tr: "Oluştur", uk: "Створити" },
  "ads.createModal.error": { de: "Fehler beim Erstellen", it: "Errore durante la creazione", en: "Error creating", fr: "Erreur lors de la création", pl: "Błąd podczas tworzenia", tr: "Oluşturma hatası", uk: "Помилка при створенні" },

  // AGB (Terms of Service)
  "agb.title": { de: "Allgemeine Geschäftsbedingungen (AGB)", it: "Termini e Condizioni Generali", en: "General Terms and Conditions", fr: "Conditions générales", pl: "Ogólne Warunki", tr: "Genel Şartlar ve Koşullar", uk: "Загальні Умови" },
  "agb.validFrom": { de: "Gültig ab", it: "Valido dal", en: "Valid from", fr: "Valable à partir du", pl: "Ważne od", tr: "Geçerlilik tarihi", uk: "Дійсно з" },
  "agb.operator": { de: "Betreiber", it: "Gestore", en: "Operator", fr: "Opérateur", pl: "Operator", tr: "İşletici", uk: "Оператор" },

  "agb.section1.title": { de: "§ 1 Geltungsbereich und Vertragspartner", it: "§ 1 Ambito di applicazione e parti contrattuali", en: "§ 1 Scope and Contracting Parties", fr: "§ 1 Champ d'application et parties contractantes", pl: "§ 1 Zakres i strony umowy", tr: "§ 1 Kapsam ve Sözleşme Tarafları", uk: "§ 1 Сфера застосування та сторони договору" },
  "agb.section1.p1": { de: "(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend \"AGB\") gelten für die Nutzung der Online-Plattform zazarap.de (nachfolgend \"Plattform\"), die von der zazarap GmbH, Musterstraße 123, 10115 Berlin, Deutschland (nachfolgend \"Betreiber\") betrieben wird.", it: "(1) I presenti Termini e Condizioni Generali (di seguito \"CGC\") si applicano all'utilizzo della piattaforma online zazarap.de (di seguito \"Piattaforma\"), gestita da zazarap GmbH, Musterstraße 123, 10115 Berlino, Germania (di seguito \"Gestore\").", en: "(1) These General Terms and Conditions (hereinafter \"GTC\") apply to the use of the online platform zazarap.de (hereinafter \"Platform\"), operated by zazarap GmbH, Musterstraße 123, 10115 Berlin, Germany (hereinafter \"Operator\").", fr: "(1) Les présentes Conditions Générales (ci-après \"CG\") s'appliquent à l'utilisation de la plateforme en ligne zazarap.de (ci-après \"Plateforme\"), exploitée par zazarap GmbH, Musterstraße 123, 10115 Berlin, Allemagne (ci-après \"Exploitant\").", pl: "(1) Niniejsze Ogólne Warunki (zwane dalej \"OW\") mają zastosowanie do korzystania z platformy internetowej zazarap.de (zwanej dalej \"Platformą\"), obsługiwanej przez zazarap GmbH, Musterstraße 123, 10115 Berlin, Niemcy (zwanej dalej \"Operatorem\").", tr: "(1) Bu Genel Şartlar ve Koşullar (bundan böyle \"GŞK\"), zazarap GmbH, Musterstraße 123, 10115 Berlin, Almanya (bundan böyle \"İşletici\") tarafından işletilen zazarap.de çevrimiçi platformunun (bundan böyle \"Platform\") kullanımı için geçerlidir.", uk: "(1) Ці Загальні Умови (надалі \"ЗУ\") застосовуються до використання онлайн-платформи zazarap.de (надалі \"Платформа\"), яку управляє zazarap GmbH, Musterstraße 123, 10115 Берлін, Німеччина (надалі \"Оператор\")." },
  "agb.section1.p2": { de: "(2) Die Plattform richtet sich ausschließlich an private Nutzer (Verbraucher), die Waren im Rahmen eines privaten Verkaufs anbieten oder erwerben. Gewerbliche oder berufliche Verkäufe sind auf der Plattform nicht gestattet.", it: "(2) La Piattaforma si rivolge esclusivamente a utenti privati (consumatori) che offrono o acquistano beni nell'ambito di una vendita privata. Le vendite commerciali o professionali non sono consentite sulla Piattaforma.", en: "(2) The Platform is exclusively for private users (consumers) who offer or purchase goods within the framework of a private sale. Commercial or professional sales are not permitted on the Platform.", fr: "(2) La Plateforme s'adresse exclusivement aux utilisateurs privés (consommateurs) qui offrent ou achètent des biens dans le cadre d'une vente privée. Les ventes commerciales ou professionnelles ne sont pas autorisées sur la Plateforme.", pl: "(2) Platforma jest przeznaczona wyłącznie dla użytkowników prywatnych (konsumentów), którzy oferują lub kupują towary w ramach prywatnej sprzedaży. Sprzedaż komercyjna lub zawodowa nie jest dozwolona na Platformie.", tr: "(2) Platform yalnızca özel bir satış çerçevesinde mal sunan veya satın alan özel kullanıcılara (tüketicilere) yöneliktir. Ticari veya profesyonel satışlara Platform'da izin verilmez.", uk: "(2) Платформа призначена виключно для приватних користувачів (споживачів), які пропонують або купують товари в рамках приватного продажу. Комерційні або професійні продажі не дозволяються на Платформі." },
  "agb.section1.important": { de: "WICHTIG", it: "IMPORTANTE", en: "IMPORTANT", fr: "IMPORTANT", pl: "WAŻNE", tr: "ÖNEMLİ", uk: "ВАЖЛИВО" },
  "agb.section1.p3": { de: "Der Kaufvertrag kommt ausschließlich zwischen Käufer und Verkäufer zustande. Der Betreiber (zazarap.de) ist nicht Vertragspartei und übernimmt keine Verpflichtungen aus diesem Vertrag.", it: "Il contratto di vendita si conclude esclusivamente tra Acquirente e Venditore. Il Gestore (zazarap.de) non è parte contrattuale e non assume obblighi derivanti da questo contratto.", en: "The purchase contract is concluded exclusively between Buyer and Seller. The Operator (zazarap.de) is not a contracting party and assumes no obligations from this contract.", fr: "Le contrat de vente est conclu exclusivement entre l'Acheteur et le Vendeur. L'Exploitant (zazarap.de) n'est pas partie contractante et n'assume aucune obligation découlant de ce contrat.", pl: "Umowa kupna zawierana jest wyłącznie między Kupującym a Sprzedawcą. Operator (zazarap.de) nie jest stroną umowy i nie przyjmuje zobowiązań wynikających z tej umowy.", tr: "Satış sözleşmesi yalnızca Alıcı ile Satıcı arasında yapılır. İşletici (zazarap.de) sözleşme tarafı değildir ve bu sözleşmeden kaynaklanan hiçbir yükümlülük üstlenmez.", uk: "Договір купівлі-продажу укладається виключно між Покупцем та Продавцем. Оператор (zazarap.de) не є стороною договору і не бере на себе зобов'язань з цього договору." },
  "agb.section1.p4": { de: "(3) Mit der Registrierung akzeptiert der Nutzer diese AGB. Abweichende AGB des Nutzers werden nicht anerkannt, es sei denn, der Betreiber stimmt ihrer Geltung ausdrücklich schriftlich zu.", it: "(3) Con la registrazione, l'utente accetta le presenti CGC. Le CGC divergenti dell'utente non saranno riconosciute, salvo consenso scritto esplicito del Gestore.", en: "(3) By registering, the user accepts these GTC. Deviating GTC of the user will not be recognized unless the Operator expressly agrees in writing.", fr: "(3) En s'inscrivant, l'utilisateur accepte les présentes CG. Les CG divergentes de l'utilisateur ne seront pas reconnues, sauf accord écrit explicite de l'Exploitant.", pl: "(3) Rejestrując się, użytkownik akceptuje niniejsze OW. Odmienne OW użytkownika nie będą uznawane, chyba że Operator wyrazi na to pisemną zgodę.", tr: "(3) Kaydolarak kullanıcı bu GŞK'yı kabul eder. Kullanıcının farklı GŞK'ları, İşletici açıkça yazılı olarak onaylamadıkça tanınmaz.", uk: "(3) Реєструючись, користувач приймає ці ЗУ. Відмінні ЗУ користувача не визнаються, якщо Оператор не дасть на це прямої письмової згоди." },

  "agb.section2.title": { de: "§ 2 Registrierung und Nutzerkonto", it: "§ 2 Registrazione e account utente", en: "§ 2 Registration and User Account", fr: "§ 2 Inscription et compte utilisateur", pl: "§ 2 Rejestracja i konto użytkownika", tr: "§ 2 Kayıt ve Kullanıcı Hesabı", uk: "§ 2 Реєстрація та обліковий запис" },
  "agb.section2.p1": { de: "(1) Zur Nutzung der Plattform ist eine Registrierung erforderlich. Der Nutzer muss mindestens 18 Jahre alt sein.", it: "(1) Per utilizzare la Piattaforma è richiesta la registrazione. L'utente deve avere almeno 18 anni.", en: "(1) Registration is required to use the Platform. The user must be at least 18 years old.", fr: "(1) L'inscription est requise pour utiliser la Plateforme. L'utilisateur doit avoir au moins 18 ans.", pl: "(1) Do korzystania z Platformy wymagana jest rejestracja. Użytkownik musi mieć co najmniej 18 lat.", tr: "(1) Platformu kullanmak için kayıt gereklidir. Kullanıcı en az 18 yaşında olmalıdır.", uk: "(1) Для користування Платформою потрібна реєстрація. Користувач повинен бути не молодшим 18 років." },
  "agb.section2.p2": { de: "(2) Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.", it: "(2) L'utente si impegna a fornire informazioni veritiere e a mantenerle aggiornate.", en: "(2) The user undertakes to provide truthful information and keep it up to date.", fr: "(2) L'utilisateur s'engage à fournir des informations véridiques et à les maintenir à jour.", pl: "(2) Użytkownik zobowiązuje się do podawania prawdziwych informacji i utrzymywania ich w aktualności.", tr: "(2) Kullanıcı gerçek bilgiler sağlamayı ve bunları güncel tutmayı taahhüt eder.", uk: "(2) Користувач зобов'язується надавати правдиву інформацію та підтримувати її в актуальному стані." },
  "agb.section2.p3": { de: "(3) Der Zugang zum Nutzerkonto ist durch ein Passwort geschützt. Der Nutzer ist verpflichtet, das Passwort geheim zu halten.", it: "(3) L'accesso all'account utente è protetto da password. L'utente è obbligato a mantenere la password riservata.", en: "(3) Access to the user account is protected by a password. The user is obliged to keep the password secret.", fr: "(3) L'accès au compte utilisateur est protégé par mot de passe. L'utilisateur est tenu de garder le mot de passe secret.", pl: "(3) Dostęp do konta użytkownika jest chroniony hasłem. Użytkownik jest zobowiązany do zachowania hasła w tajemnicy.", tr: "(3) Kullanıcı hesabına erişim şifre ile korunmaktadır. Kullanıcı şifreyi gizli tutmakla yükümlüdür.", uk: "(3) Доступ до облікового запису захищений паролем. Користувач зобов'язаний зберігати пароль у таємниці." },
  "agb.section2.p4": { de: "(4) Jeder Nutzer darf nur ein Nutzerkonto führen. Die Weitergabe des Nutzerkontos an Dritte ist untersagt.", it: "(4) Ogni utente può gestire un solo account. La cessione dell'account a terzi è vietata.", en: "(4) Each user may only maintain one user account. Transfer of the account to third parties is prohibited.", fr: "(4) Chaque utilisateur ne peut détenir qu'un seul compte. La cession du compte à des tiers est interdite.", pl: "(4) Każdy użytkownik może posiadać tylko jedno konto. Przekazywanie konta osobom trzecim jest zabronione.", tr: "(4) Her kullanıcı yalnızca bir hesap tutabilir. Hesabın üçüncü kişilere devri yasaktır.", uk: "(4) Кожен користувач може мати лише один обліковий запис. Передача облікового запису третім особам заборонена." },

  "agb.section3.title": { de: "§ 3 Vertragsschluss", it: "§ 3 Conclusione del contratto", en: "§ 3 Contract Conclusion", fr: "§ 3 Conclusion du contrat", pl: "§ 3 Zawarcie umowy", tr: "§ 3 Sözleşmenin Yapılması", uk: "§ 3 Укладення договору" },
  "agb.section3.p1": { de: "(1) Die Einstellung eines Angebots durch den Verkäufer stellt noch kein bindendes Angebot dar, sondern eine Aufforderung an andere Nutzer, ein Angebot abzugeben (invitatio ad offerendum).", it: "(1) La pubblicazione di un'offerta da parte del Venditore non costituisce ancora un'offerta vincolante, ma un invito ad altri utenti a presentare un'offerta (invitatio ad offerendum).", en: "(1) The posting of an offer by the Seller does not yet constitute a binding offer, but an invitation to other users to make an offer (invitatio ad offerendum).", fr: "(1) La publication d'une offre par le Vendeur ne constitue pas encore une offre contraignante, mais une invitation faite aux autres utilisateurs à présenter une offre (invitatio ad offerendum).", pl: "(1) Umieszczenie oferty przez Sprzedawcę nie stanowi jeszcze wiążącej oferty, lecz zaproszenie do składania ofert przez innych użytkowników (invitatio ad offerendum).", tr: "(1) Satıcı tarafından bir teklifin yayınlanması henüz bağlayıcı bir teklif oluşturmaz, ancak diğer kullanıcılara teklif sunma daveti niteliğindedir (invitatio ad offerendum).", uk: "(1) Публікація пропозиції Продавцем ще не є обов'язковою пропозицією, а запрошенням інших користувачів зробити пропозицію (invitatio ad offerendum)." },
  "agb.section3.important": { de: "WICHTIG", it: "IMPORTANTE", en: "IMPORTANT", fr: "IMPORTANT", pl: "WAŻNE", tr: "ÖNEMLİ", uk: "ВАЖЛИВО" },
  "agb.section3.p2": { de: "Der Kaufvertrag kommt ausschließlich zwischen Käufer und Verkäufer zustande. zazarap.de ist nicht Vertragspartei des Kaufvertrags und übernimmt keine Verpflichtungen aus diesem Vertrag.", it: "Il contratto di vendita si conclude esclusivamente tra Acquirente e Venditore. zazarap.de non è parte del contratto di vendita e non assume obblighi derivanti da questo contratto.", en: "The purchase contract is concluded exclusively between Buyer and Seller. zazarap.de is not a party to the purchase contract and assumes no obligations from this contract.", fr: "Le contrat de vente est conclu exclusivement entre l'Acheteur et le Vendeur. zazarap.de n'est pas partie au contrat de vente et n'assume aucune obligation découlant de ce contrat.", pl: "Umowa kupna zawierana jest wyłącznie między Kupującym a Sprzedawcą. zazarap.de nie jest stroną umowy kupna i nie przyjmuje zobowiązań wynikających z tej umowy.", tr: "Satış sözleşmesi yalnızca Alıcı ile Satıcı arasında yapılır. zazarap.de satış sözleşmesinin tarafı değildir ve bu sözleşmeden kaynaklanan hiçbir yükümlülük üstlenmez.", uk: "Договір купівлі-продажу укладається виключно між Покупцем та Продавцем. zazarap.de не є стороною договору купівлі-продажу і не бере на себе зобов'язань з цього договору." },
  "agb.section3.p3": { de: "(3) Durch die Kontaktaufnahme über die Plattform, die Einigung über Preis, Lieferbedingungen und Zahlungsmodalitäten kommt ein rechtsverbindlicher Kaufvertrag zwischen den Parteien zustande.", it: "(3) Attraverso il contatto tramite la Piattaforma e l'accordo su prezzo, condizioni di consegna e modalità di pagamento, si conclude un contratto di vendita legalmente vincolante tra le parti.", en: "(3) By contacting via the Platform and agreeing on price, delivery conditions, and payment terms, a legally binding purchase contract is concluded between the parties.", fr: "(3) En prenant contact via la Plateforme et en convenant du prix, des conditions de livraison et des modalités de paiement, un contrat de vente juridiquement contraignant est conclu entre les parties.", pl: "(3) Poprzez kontakt za pośrednictwem Platformy i uzgodnienie ceny, warunków dostawy oraz sposobów płatności, zostaje zawarta prawnie wiążąca umowa kupna między stronami.", tr: "(3) Platform üzerinden iletişim kurarak ve fiyat, teslimat koşulları ve ödeme şartları üzerinde anlaşarak, taraflar arasında yasal olarak bağlayıcı bir satış sözleşmesi yapılır.", uk: "(3) Через контакт через Платформу та домовленість щодо ціни, умов доставки та способів оплати між сторонами укладається юридично обов'язковий договір купівлі-продажу." },

  "agb.section4.title": { de: "§ 4 Pflichten des Verkäufers", it: "§ 4 Obblighi del Venditore", en: "§ 4 Seller's Obligations", fr: "§ 4 Obligations du Vendeur", pl: "§ 4 Obowiązki Sprzedawcy", tr: "§ 4 Satıcının Yükümlülükleri", uk: "§ 4 Обов'язки Продавця" },
  "agb.section4.intro": { de: "(1) Der Verkäufer verpflichtet sich:", it: "(1) Il Venditore si impegna a:", en: "(1) The Seller undertakes to:", fr: "(1) Le Vendeur s'engage à :", pl: "(1) Sprzedawca zobowiązuje się do:", tr: "(1) Satıcı taahhüt eder:", uk: "(1) Продавець зобов'язується:" },
  "agb.section4.li1": { de: "Nur Waren anzubieten, die er rechtmäßig besitzt und verkaufen darf", it: "Offrire solo beni che possiede legalmente e può vendere", en: "Offer only goods that he lawfully owns and may sell", fr: "N'offrir que des biens qu'il possède légalement et peut vendre", pl: "Oferować tylko towary, które legalnie posiada i może sprzedać", tr: "Yalnızca yasal olarak sahip olduğu ve satabileceği malları sunmak", uk: "Пропонувати лише товари, які він законно володіє та може продати" },
  "agb.section4.li2": { de: "Wahrheitsgemäße und vollständige Produktbeschreibungen zu erstellen", it: "Creare descrizioni veritiere e complete dei prodotti", en: "Create truthful and complete product descriptions", fr: "Créer des descriptions de produits véridiques et complètes", pl: "Tworzyć prawdziwe i pełne opisy produktów", tr: "Gerçek ve eksiksiz ürün açıklamaları oluşturmak", uk: "Створювати правдиві та повні описи товарів" },
  "agb.section4.li3": { de: "Den vereinbarten Preis einzuhalten", it: "Rispettare il prezzo concordato", en: "Adhere to the agreed price", fr: "Respecter le prix convenu", pl: "Przestrzegać ustalonej ceny", tr: "Anlaşılan fiyata uymak", uk: "Дотримуватися узгодженої ціни" },
  "agb.section4.li4": { de: "Die Ware ordnungsgemäß zu verpacken und zu versenden", it: "Imballare e spedire correttamente la merce", en: "Properly pack and ship the goods", fr: "Emballer et expédier correctement les marchandises", pl: "Właściwie zapakować i wysłać towar", tr: "Malları uygun şekilde paketleyip göndermek", uk: "Належно упакувати та відправити товар" },
  "agb.section4.li5": { de: "Der Verkäufer versichert, dass er ausschließlich als Privatperson handelt und keine gewerbliche oder selbständige Tätigkeit ausübt", it: "Il Venditore assicura di agire esclusivamente come persona privata e di non svolgere attività commerciali o professionali", en: "The Seller assures that he acts exclusively as a private individual and does not conduct commercial or professional activities", fr: "Le Vendeur assure qu'il agit exclusivement en tant que particulier et n'exerce aucune activité commerciale ou professionnelle", pl: "Sprzedawca zapewnia, że działa wyłącznie jako osoba prywatna i nie prowadzi działalności komercyjnej lub zawodowej", tr: "Satıcı yalnızca özel bir kişi olarak hareket ettiğini ve ticari veya mesleki faaliyet yürütmediğini garanti eder", uk: "Продавець запевняє, що діє виключно як приватна особа і не здійснює комерційної або професійної діяльності" },
  "agb.section4.p2": { de: "(2) Der Verkäufer haftet für die Richtigkeit seiner Angaben und die Einhaltung gesetzlicher Vorschriften.", it: "(2) Il Venditore è responsabile della correttezza delle sue dichiarazioni e del rispetto delle normative.", en: "(2) The Seller is liable for the accuracy of his statements and compliance with legal regulations.", fr: "(2) Le Vendeur est responsable de l'exactitude de ses déclarations et du respect de la réglementation.", pl: "(2) Sprzedawca odpowiada za prawidłowość swoich danych i przestrzeganie przepisów prawnych.", tr: "(2) Satıcı, beyanlarının doğruluğundan ve yasal düzenlemelere uyumdan sorumludur.", uk: "(2) Продавець несе відповідальність за точність своїх заяв та дотримання законодавства." },

  "agb.section5.title": { de: "§ 5 Pflichten des Käufers", it: "§ 5 Obblighi dell'Acquirente", en: "§ 5 Buyer's Obligations", fr: "§ 5 Obligations de l'Acheteur", pl: "§ 5 Obowiązki Kupującego", tr: "§ 5 Alıcının Yükümlülükleri", uk: "§ 5 Обов'язки Покупця" },
  "agb.section5.intro": { de: "(1) Der Käufer verpflichtet sich:", it: "(1) L'Acquirente si impegna a:", en: "(1) The Buyer undertakes to:", fr: "(1) L'Acheteur s'engage à :", pl: "(1) Kupujący zobowiązuje się do:", tr: "(1) Alıcı taahhüt eder:", uk: "(1) Покупець зобов'язується:" },
  "agb.section5.li1": { de: "Den vereinbarten Kaufpreis fristgerecht zu zahlen", it: "Pagare puntualmente il prezzo d'acquisto concordato", en: "Pay the agreed purchase price on time", fr: "Payer le prix d'achat convenu dans les délais", pl: "Terminowo zapłacić ustaloną cenę zakupu", tr: "Anlaşılan satın alma fiyatını zamanında ödemek", uk: "Вчасно сплатити узгоджену ціну покупки" },
  "agb.section5.li2": { de: "Eine korrekte Lieferadresse anzugeben", it: "Fornire un indirizzo di consegna corretto", en: "Provide a correct delivery address", fr: "Fournir une adresse de livraison correcte", pl: "Podać prawidłowy adres dostawy", tr: "Doğru teslimat adresi sağlamak", uk: "Надати правильну адресу доставки" },
  "agb.section5.li3": { de: "Die Ware unverzüglich nach Erhalt zu prüfen", it: "Verificare la merce immediatamente al ricevimento", en: "Inspect the goods immediately upon receipt", fr: "Inspecter les marchandises immédiatement à réception", pl: "Niezwłocznie sprawdzić towar po otrzymaniu", tr: "Malları aldıktan hemen sonra kontrol etmek", uk: "Негайно перевірити товар після отримання" },
  "agb.section5.li4": { de: "Den Erhalt der Ware zu bestätigen", it: "Confermare la ricezione della merce", en: "Confirm receipt of the goods", fr: "Confirmer la réception des marchandises", pl: "Potwierdzić odbiór towaru", tr: "Malların alındığını onaylamak", uk: "Підтвердити отримання товару" },

  "agb.section6.title": { de: "§ 6 Zahlungsabwicklung", it: "§ 6 Elaborazione dei pagamenti", en: "§ 6 Payment Processing", fr: "§ 6 Traitement des paiements", pl: "§ 6 Przetwarzanie płatności", tr: "§ 6 Ödeme İşleme", uk: "§ 6 Обробка платежів" },
  "agb.section6.p1": { de: "(1) Die Zahlung erfolgt über externe Zahlungsdienstleister (z. B. PayPal). Weitere Zahlungsarten können zukünftig angeboten werden.", it: "(1) Il pagamento avviene tramite fornitori di servizi di pagamento esterni (es. PayPal). Ulteriori metodi di pagamento potranno essere offerti in futuro.", en: "(1) Payment is made through external payment service providers (e.g., PayPal). Additional payment methods may be offered in the future.", fr: "(1) Le paiement s'effectue via des prestataires de services de paiement externes (par ex. PayPal). D'autres méthodes de paiement pourront être proposées à l'avenir.", pl: "(1) Płatność dokonywana jest za pośrednictwem zewnętrznych dostawców usług płatniczych (np. PayPal). Dodatkowe metody płatności mogą być oferowane w przyszłości.", tr: "(1) Ödeme, harici ödeme hizmeti sağlayıcıları (örn. PayPal) aracılığıyla yapılır. Gelecekte ek ödeme yöntemleri sunulabilir.", uk: "(1) Оплата здійснюється через зовнішніх платіжних провайдерів (наприклад, PayPal). Додаткові способи оплати можуть бути запропоновані в майбутньому." },
  "agb.section6.important": { de: "WICHTIG", it: "IMPORTANTE", en: "IMPORTANT", fr: "IMPORTANT", pl: "WAŻNE", tr: "ÖNEMLİ", uk: "ВАЖЛИВО" },
  "agb.section6.p2": { de: "zazarap.de ist kein Zahlungsdienstleister. Die Zahlungsabwicklung erfolgt ausschließlich über externe Zahlungsdienstleister (z.B. PayPal). Der Betreiber empfängt, verwahrt oder leitet keine Gelder weiter.", it: "zazarap.de non è un fornitore di servizi di pagamento. L'elaborazione dei pagamenti avviene esclusivamente tramite fornitori di servizi di pagamento esterni (es. PayPal). Il Gestore non riceve, custodisce né inoltra fondi.", en: "zazarap.de is not a payment service provider. Payment processing is handled exclusively by external payment service providers (e.g., PayPal). The Operator does not receive, hold, or forward funds.", fr: "zazarap.de n'est pas un prestataire de services de paiement. Le traitement des paiements est effectué exclusivement par des prestataires de services de paiement externes (par ex. PayPal). L'Exploitant ne reçoit, ne détient ni ne transfère de fonds.", pl: "zazarap.de nie jest dostawcą usług płatniczych. Przetwarzanie płatności odbywa się wyłącznie za pośrednictwem zewnętrznych dostawców usług płatniczych (np. PayPal). Operator nie otrzymuje, nie przechowuje ani nie przekazuje środków.", tr: "zazarap.de bir ödeme hizmeti sağlayıcısı değildir. Ödeme işleme yalnızca harici ödeme hizmeti sağlayıcıları (örn. PayPal) tarafından gerçekleştirilir. İşletici fon almaz, saklamaz veya iletmez.", uk: "zazarap.de не є платіжним провайдером. Обробка платежів здійснюється виключно через зовнішніх платіжних провайдерів (наприклад, PayPal). Оператор не отримує, не зберігає і не переказує кошти." },
  "agb.section6.p3": { de: "(2) Die Plattform erhebt für die Nutzung der Dienste eine Provision. Die genauen Gebühren werden transparent im jeweiligen Angebot bzw. Checkout angezeigt.", it: "(2) La Piattaforma addebita una commissione per l'utilizzo dei servizi. Le tariffe esatte vengono visualizzate in modo trasparente nell'offerta o al checkout.", en: "(2) The Platform charges a commission for the use of services. The exact fees are transparently displayed in the respective offer or checkout.", fr: "(2) La Plateforme facture une commission pour l'utilisation des services. Les frais exacts sont affichés de manière transparente dans l'offre ou au moment du paiement.", pl: "(2) Platforma pobiera prowizję za korzystanie z usług. Dokładne opłaty są przejrzyście wyświetlane w odpowiedniej ofercie lub przy kasie.", tr: "(2) Platform, hizmetlerin kullanımı için komisyon alır. Kesin ücretler ilgili teklifte veya ödeme sırasında şeffaf bir şekilde görüntülenir.", uk: "(2) Платформа стягує комісію за використання послуг. Точні збори прозоро відображаються у відповідній пропозиції або під час оформлення замовлення." },
  "agb.section6.p4": { de: "(3) Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, soweit diese anfällt.", it: "(3) I prezzi si intendono comprensivi dell'imposta sul valore aggiunto (IVA) legale, ove applicabile.", en: "(3) Prices include statutory value-added tax (VAT), where applicable.", fr: "(3) Les prix incluent la taxe sur la valeur ajoutée (TVA) légale, le cas échéant.", pl: "(3) Ceny zawierają ustawowy podatek od towarów i usług (VAT), jeśli ma zastosowanie.", tr: "(3) Fiyatlar, uygulanabilir olduğu durumlarda yasal katma değer vergisini (KDV) içerir.", uk: "(3) Ціни включають законний податок на додану вартість (ПДВ), якщо застосовується." },

  "agb.section6b.p1": { de: "Da auf der Plattform ausschließlich Privatverkäufe zwischen Verbrauchern (C2C) stattfinden, besteht kein gesetzliches Widerrufsrecht.", it: "Poiché sulla Piattaforma avvengono esclusivamente vendite private tra consumatori (C2C), non esiste un diritto di recesso legale.", en: "Since only private sales between consumers (C2C) take place on the Platform, there is no statutory right of withdrawal.", fr: "Étant donné que seules des ventes privées entre consommateurs (C2C) ont lieu sur la Plateforme, il n'existe aucun droit de rétractation légal.", pl: "Ponieważ na Platformie odbywają się wyłącznie prywatne sprzedaże między konsumentami (C2C), nie ma ustawowego prawa odstąpienia.", tr: "Platform'da yalnızca tüketiciler arası özel satışlar (C2C) gerçekleştiğinden, yasal bir cayma hakkı bulunmamaktadır.", uk: "Оскільки на Платформі здійснюються виключно приватні продажі між споживачами (C2C), законного права на відмову не існує." },
  "agb.section6b.p2": { de: "Eine freiwillige Rücknahme kann individuell zwischen Käufer und Verkäufer vereinbart werden.", it: "Un ritiro volontario può essere concordato individualmente tra Acquirente e Venditore.", en: "A voluntary return can be individually agreed upon between Buyer and Seller.", fr: "Un retour volontaire peut être convenu individuellement entre l'Acheteur et le Vendeur.", pl: "Dobrowolny zwrot może być indywidualnie uzgodniony między Kupującym a Sprzedawcą.", tr: "Gönüllü iade, Alıcı ve Satıcı arasında bireysel olarak kararlaştırılabilir.", uk: "Добровільне повернення може бути індивідуально узгоджене між Покупцем та Продавцем." },
  "agb.section6b.linkWithdrawal": { de: "Weitere Informationen zum Widerrufsrecht", it: "Ulteriori informazioni sul diritto di recesso", en: "More information on right of withdrawal", fr: "Plus d'informations sur le droit de rétractation", pl: "Więcej informacji o prawie odstąpienia", tr: "Cayma hakkı hakkında daha fazla bilgi", uk: "Більше інформації про право на відмову" },

  "agb.section7.title": { de: "§ 7 Gewährleistung und Haftung", it: "§ 7 Garanzia e responsabilità", en: "§ 7 Warranty and Liability", fr: "§ 7 Garantie et responsabilité", pl: "§ 7 Gwarancja i odpowiedzialność", tr: "§ 7 Garanti ve Sorumluluk", uk: "§ 7 Гарантія та відповідальність" },
  "agb.section7.p1": { de: "(1) Die Plattform haftet nicht für die Qualität, Sicherheit, Rechtmäßigkeit oder Verfügbarkeit der angebotenen Waren und Dienstleistungen. Der Betreiber überprüft die Angebote nicht im Einzelnen auf ihre Richtigkeit.", it: "(1) La Piattaforma non è responsabile per qualità, sicurezza, legalità o disponibilità dei beni e servizi offerti. Il Gestore non verifica individualmente la correttezza delle offerte.", en: "(1) The Platform is not liable for the quality, safety, legality, or availability of the goods and services offered. The Operator does not individually verify the correctness of offers.", fr: "(1) La Plateforme n'est pas responsable de la qualité, de la sécurité, de la légalité ou de la disponibilité des biens et services offerts. L'Exploitant ne vérifie pas individuellement l'exactitude des offres.", pl: "(1) Platforma nie odpowiada za jakość, bezpieczeństwo, legalność lub dostępność oferowanych towarów i usług. Operator nie weryfikuje indywidualnie poprawności ofert.", tr: "(1) Platform, sunulan mal ve hizmetlerin kalitesi, güvenliği, yasallığı veya kullanılabilirliğinden sorumlu değildir. İşletici, tekliflerin doğruluğunu tek tek doğrulamaz.", uk: "(1) Платформа не несе відповідальності за якість, безпеку, законність або доступність запропонованих товарів та послуг. Оператор не перевіряє окремо правильність пропозицій." },
  "agb.section7.p2": { de: "(2) Für Mängel an der Ware ist ausschließlich der Verkäufer verantwortlich. Es gelten die gesetzlichen Gewährleistungsrechte zwischen Käufer und Verkäufer.", it: "(2) Dei difetti della merce è responsabile esclusivamente il Venditore. Si applicano i diritti di garanzia legali tra Acquirente e Venditore.", en: "(2) The Seller is solely responsible for defects in the goods. Statutory warranty rights between Buyer and Seller apply.", fr: "(2) Le Vendeur est seul responsable des défauts des marchandises. Les droits de garantie légaux entre l'Acheteur et le Vendeur s'appliquent.", pl: "(2) Za wady towaru odpowiada wyłącznie Sprzedawca. Obowiązują ustawowe prawa gwarancyjne między Kupującym a Sprzedawcą.", tr: "(2) Malların kusurlarından yalnızca Satıcı sorumludur. Alıcı ile Satıcı arasında yasal garanti hakları geçerlidir.", uk: "(2) Продавець несе виключну відповідальність за дефекти товару. Застосовуються законні гарантійні права між Покупцем та Продавцем." },
  "agb.section7.p3": { de: "(3) Der Betreiber haftet für Schäden nur nach Maßgabe der gesetzlichen Vorschriften. Die Haftung ist grundsätzlich beschränkt auf Vorsatz und grobe Fahrlässigkeit, außer bei Verletzung wesentlicher Vertragspflichten (Kardinalspflichten).", it: "(3) Il Gestore è responsabile dei danni solo secondo le disposizioni di legge. La responsabilità è generalmente limitata a dolo e colpa grave, salvo violazione di obblighi contrattuali essenziali (obblighi cardinali).", en: "(3) The Operator is liable for damages only in accordance with statutory provisions. Liability is generally limited to intent and gross negligence, except for breach of essential contractual obligations (cardinal duties).", fr: "(3) L'Exploitant n'est responsable des dommages que conformément aux dispositions légales. La responsabilité est généralement limitée à l'intention et à la faute lourde, sauf en cas de violation d'obligations contractuelles essentielles (obligations cardinales).", pl: "(3) Operator odpowiada za szkody tylko zgodnie z przepisami prawnymi. Odpowiedzialność jest generalnie ograniczona do umyślności i rażącego niedbalstwa, z wyjątkiem naruszenia istotnych zobowiązań umownych (obowiązków kardynalnych).", tr: "(3) İşletici zararlardan yalnızca yasal hükümlere göre sorumludur. Sorumluluk genellikle kasıt ve ağır ihmal ile sınırlıdır, ancak temel sözleşme yükümlülüklerinin (kardinal görevler) ihlali hariçtir.", uk: "(3) Оператор несе відповідальність за збитки лише відповідно до законодавства. Відповідальність, як правило, обмежена умислом і грубою недбалістю, за винятком порушення істотних договірних зобов'язань (кардинальних обов'язків)." },
  "agb.section7.exceptions": { de: "Ausnahmen von der Haftungsbeschränkung", it: "Eccezioni alla limitazione di responsabilità", en: "Exceptions to Liability Limitation", fr: "Exceptions à la limitation de responsabilité", pl: "Wyjątki od ograniczenia odpowiedzialności", tr: "Sorumluluk Sınırlamasının İstisnaları", uk: "Винятки з обмеження відповідальності" },
  "agb.section7.ex1": { de: "Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit", it: "Danni derivanti da lesioni alla vita, al corpo o alla salute", en: "Damages from injury to life, body, or health", fr: "Dommages causés par une atteinte à la vie, au corps ou à la santé", pl: "Szkody wynikające z uszczerbku na życiu, ciele lub zdrowiu", tr: "Yaşam, beden veya sağlığa verilen zararlardan kaynaklanan hasarlar", uk: "Шкода від ушкодження життя, тіла або здоров'я" },
  "agb.section7.ex2": { de: "Haftung nach dem Produkthaftungsgesetz", it: "Responsabilità ai sensi della legge sulla responsabilità del prodotto", en: "Liability under the Product Liability Act", fr: "Responsabilité en vertu de la loi sur la responsabilité du fait des produits", pl: "Odpowiedzialność zgodnie z Ustawą o odpowiedzialności za produkt", tr: "Ürün Sorumluluğu Yasası kapsamındaki sorumluluk", uk: "Відповідальність відповідно до Закону про відповідальність за продукцію" },
  "agb.section7.ex3": { de: "Arglistig verschwiegene Mängel", it: "Difetti dolosamente taciuti", en: "Fraudulently concealed defects", fr: "Défauts frauduleusement dissimulés", pl: "Wady podstępnie ukryte", tr: "Hileli olarak gizlenen kusurlar", uk: "Умисно приховані дефекти" },

  "agb.section8.title": { de: "§ 8 Streitbeilegung", it: "§ 8 Risoluzione delle controversie", en: "§ 8 Dispute Resolution", fr: "§ 8 Résolution des litiges", pl: "§ 8 Rozstrzyganie sporów", tr: "§ 8 Uyuşmazlık Çözümü", uk: "§ 8 Вирішення спорів" },
  "agb.section8.p1": { de: "(1) Bei Streitigkeiten zwischen Käufer und Verkäufer können beide Parteien das interne Dispute-Center der Plattform nutzen.", it: "(1) In caso di controversie tra Acquirente e Venditore, entrambe le parti possono utilizzare il Centro Dispute interno della Piattaforma.", en: "(1) In case of disputes between Buyer and Seller, both parties can use the Platform's internal Dispute Center.", fr: "(1) En cas de litige entre l'Acheteur et le Vendeur, les deux parties peuvent utiliser le Centre de règlement des litiges interne de la Plateforme.", pl: "(1) W przypadku sporów między Kupującym a Sprzedawcą obie strony mogą korzystać z wewnętrznego Centrum Sporów Platformy.", tr: "(1) Alıcı ile Satıcı arasında anlaşmazlık olması durumunda, her iki taraf da Platformun dahili Anlaşmazlık Merkezini kullanabilir.", uk: "(1) У разі спорів між Покупцем та Продавцем обидві сторони можуть скористатися внутрішнім Центром вирішення спорів Платформи." },
  "agb.section8.p2": { de: "(2) Der Betreiber kann bei der Vermittlung unterstützen, ist aber nicht verpflichtet, eine Lösung herbeizuführen. Die rechtliche Verantwortung liegt allein bei den Vertragsparteien.", it: "(2) Il Gestore può supportare nella mediazione, ma non è obbligato a fornire una soluzione. La responsabilità legale spetta unicamente alle parti contrattuali.", en: "(2) The Operator may assist in mediation but is not obligated to provide a solution. Legal responsibility lies solely with the contracting parties.", fr: "(2) L'Exploitant peut aider à la médiation mais n'est pas obligé de fournir une solution. La responsabilité légale incombe uniquement aux parties contractantes.", pl: "(2) Operator może pomóc w mediacji, ale nie jest zobowiązany do zapewnienia rozwiązania. Odpowiedzialność prawna spoczywa wyłącznie na stronach umowy.", tr: "(2) İşletici arabuluculukta yardımcı olabilir ancak çözüm sağlamakla yükümlü değildir. Yasal sorumluluk yalnızca sözleşme taraflarına aittir.", uk: "(2) Оператор може допомогти в посередництві, але не зобов'язаний надавати рішення. Юридична відповідальність лежить виключно на договірних сторонах." },
  "agb.section8.odr": { de: "Link zur EU-Streitschlichtungsplattform", it: "Link alla piattaforma UE di risoluzione delle controversie online", en: "Link to the EU Online Dispute Resolution platform", fr: "Lien vers la plateforme européenne de règlement en ligne des litiges", pl: "Link do unijnej platformy rozstrzygania sporów online", tr: "AB Çevrimiçi Uyuşmazlık Çözüm platformuna bağlantı", uk: "Посилання на платформу вирішення онлайн-спорів ЄС" },

  "agb.section9.title": { de: "§ 9 Datenschutz", it: "§ 9 Protezione dei dati", en: "§ 9 Data Protection", fr: "§ 9 Protection des données", pl: "§ 9 Ochrona danych", tr: "§ 9 Veri Koruma", uk: "§ 9 Захист даних" },
  "agb.section9.p1": { de: "Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer", it: "Il trattamento dei dati personali avviene secondo la nostra", en: "The processing of personal data is carried out in accordance with our", fr: "Le traitement des données personnelles est effectué conformément à notre", pl: "Przetwarzanie danych osobowych odbywa się zgodnie z naszą", tr: "Kişisel verilerin işlenmesi bizim", uk: "Обробка персональних даних здійснюється відповідно до нашої" },
  "agb.section9.linkPrivacy": { de: "Datenschutzerklärung", it: "Informativa sulla Privacy", en: "Privacy Policy", fr: "Politique de confidentialité", pl: "Polityki prywatności", tr: "Gizlilik Politikası", uk: "Політики конфіденційності" },
  "agb.section9.p2": { de: "und der Datenschutz-Grundverordnung (DSGVO).", it: "e del Regolamento Generale sulla Protezione dei Dati (GDPR).", en: "and the General Data Protection Regulation (GDPR).", fr: "et du Règlement Général sur la Protection des Données (RGPD).", pl: "oraz Ogólnego Rozporządzenia o Ochronie Danych (RODO).", tr: "ve Genel Veri Koruma Yönetmeliği (GDPR) uyarınca gerçekleştirilir.", uk: "та Загального регламенту про захист даних (GDPR)." },

  "agb.section10.title": { de: "§ 10 Verbotene Angebote", it: "§ 10 Offerte vietate", en: "§ 10 Prohibited Offers", fr: "§ 10 Offres interdites", pl: "§ 10 Zakazane oferty", tr: "§ 10 Yasak Teklifler", uk: "§ 10 Заборонені пропозиції" },
  "agb.section10.intro": { de: "Die folgenden Angebote sind auf Zazarap strikt untersagt:", it: "Le seguenti offerte sono severamente vietate su Zazarap:", en: "The following offers are strictly prohibited on Zazarap:", fr: "Les offres suivantes sont strictement interdites sur Zazarap:", pl: "Następujące oferty są surowo zakazane na Zazarap:", tr: "Aşağıdaki teklifler Zazarap'ta kesinlikle yasaktır:", uk: "Наступні пропозиції суворо заборонені на Zazarap:" },
  "agb.section10.li1": { de: "Waffen, Munition und explosionsgefährliche Stoffe", it: "Armi, munizioni e sostanze esplosive", en: "Weapons, ammunition and explosive substances", fr: "Armes, munitions et substances explosives", pl: "Broń, amunicja i materiały wybuchowe", tr: "Silahlar, mühimmat ve patlayıcı maddeler", uk: "Зброя, боєприпаси та вибухонебезпечні речовини" },
  "agb.section10.li2": { de: "Betäubungsmittel gemäß BtMG", it: "Sostanze stupefacenti secondo BtMG", en: "Narcotics according to BtMG", fr: "Stupéfiants selon BtMG", pl: "Środki odurzające według BtMG", tr: "BtMG'ye göre uyuşturucular", uk: "Наркотичні речовини відповідно до BtMG" },
  "agb.section10.li3": { de: "Verschreibungspflichtige Arzneimittel und medizinische Geräte", it: "Farmaci soggetti a prescrizione e dispositivi medici", en: "Prescription drugs and medical devices", fr: "Médicaments sur ordonnance et dispositifs médicaux", pl: "Leki na receptę i urządzenia medyczne", tr: "Reçeteli ilaçlar ve tıbbi cihazlar", uk: "Ліки за рецептом та медичні прилади" },
  "agb.section10.li4": { de: "Pornografische Inhalte und jugendgefährdende Medien", it: "Contenuti pornografici e media dannosi per i minori", en: "Pornographic content and media harmful to minors", fr: "Contenu pornographique et médias nuisibles aux mineurs", pl: "Treści pornograficzne i media szkodliwe dla nieletnich", tr: "Pornografik içerik ve küçükler için zararlı medya", uk: "Порнографічний контент та медіа, шкідливі для неповнолітніх" },
  "agb.section10.li5": { de: "Geschützte Tierarten und artgeschützte Produkte", it: "Specie animali protette e prodotti derivati", en: "Protected animal species and wildlife products", fr: "Espèces animales protégées et produits dérivés", pl: "Gatunki chronione i produkty pochodne", tr: "Korunan hayvan türleri ve türev ürünler", uk: "Захищені види тварин та похідні продукти" },
  "agb.section10.li6": { de: "Markenfälschungen und urheberrechtswidrige Produkte", it: "Contraffazioni e prodotti che violano i diritti d'autore", en: "Counterfeit goods and copyright-infringing products", fr: "Contrefaçons et produits contrefaisant les droits d'auteur", pl: "Podróbki i produkty naruszające prawa autorskie", tr: "Sahte mallar ve telif hakkı ihlal eden ürünler", uk: "Підробки та продукти, що порушують авторські права" },
  "agb.section10.li7": { de: "Verfassungswidrige Symbole und extremistische Inhalte", it: "Simboli anticostituzionali e contenuti estremisti", en: "Unconstitutional symbols and extremist content", fr: "Symboles anticonstitutionnels et contenus extrémistes", pl: "Symbole antykonstytucyjne i treści ekstremistyczne", tr: "Anayasaya aykırı semboller ve aşırılıkçı içerik", uk: "Антиконституційні символи та екстремістський контент" },
  "agb.section10.li8": { de: "Gefährliche Chemikalien und radioaktive Stoffe", it: "Sostanze chimiche pericolose e radioattive", en: "Dangerous chemicals and radioactive substances", fr: "Produits chimiques dangereux et substances radioactives", pl: "Niebezpieczne chemikalia i substancje radioaktywne", tr: "Tehlikeli kimyasallar ve radyoaktif maddeler", uk: "Небезпечні хімікати та радіоактивні речовини" },
  "agb.section10.li9": { de: "Illegale Dienstleistungen", it: "Servizi illegali", en: "Illegal services", fr: "Services illégaux", pl: "Nielegalne usługi", tr: "Yasadışı hizmetler", uk: "Незаконні послуги" },
  "agb.section10.li10": { de: "Angebote aus dem Glücksspiel- und Wettbereich", it: "Offerte di giochi d'azzardo e scommesse", en: "Gambling and betting offers", fr: "Offres de jeux d'argent et de paris", pl: "Oferty hazardu i zakładów", tr: "Kumar ve bahis teklifleri", uk: "Пропозиції азартних ігор та ставок" },
  "agb.section10.li11": { de: "Sonstige gesetzlich genehmigungspflichtige Produkte ohne Nachweis der Genehmigung", it: "Altri prodotti soggetti ad autorizzazione legale senza prova dell'autorizzazione", en: "Other products requiring legal authorization without proof of authorization", fr: "Autres produits nécessitant une autorisation légale sans preuve d'autorisation", pl: "Inne produkty wymagające prawnego zezwolenia bez dowodu autoryzacji", tr: "Yasal izin gerektiren diğer ürünler, izin belgesi olmadan", uk: "Інші продукти, що потребують юридичного дозволу без підтвердження дозволу" },
  "agb.section10.li12": { de: "Gewerbliche Angebote oder der wiederholte Verkauf mit Gewinnerzielungsabsicht", it: "Offerte commerciali o vendite ripetute con scopo di lucro", en: "Commercial offers or repeated sales for profit", fr: "Offres commerciales ou ventes répétées à but lucratif", pl: "Oferty komercyjne lub powtarzająca się sprzedaż w celu zysku", tr: "Ticari teklifler veya kâr amacıyla tekrarlanan satışlar", uk: "Комерційні пропозиції або повторні продажі з метою отримання прибутку" },

  "agb.section11.title": { de: "§ 11 Moderation und Sanktionen", it: "§ 11 Moderazione e sanzioni", en: "§ 11 Moderation and Sanctions", fr: "§ 11 Modération et sanctions", pl: "§ 11 Moderacja i sankcje", tr: "§ 11 Moderasyon ve Yaptırımlar", uk: "§ 11 Модерація та санкції" },
  "agb.section11.p1": { de: "Zazarap setzt automatische Filter sowie manuelle Kontrollen ein, um verbotene Inhalte frühzeitig zu erkennen und zu entfernen. Bei Verstößen gegen diese AGB wird der Nutzer wie folgt sanktioniert:", it: "Zazarap utilizza filtri automatici e controlli manuali per rilevare e rimuovere tempestivamente contenuti vietati. In caso di violazione delle presenti CGC, l'utente sarà sanzionato come segue:", en: "Zazarap uses automatic filters and manual controls to detect and remove prohibited content early. In case of violations of these GTC, the user will be sanctioned as follows:", fr: "Zazarap utilise des filtres automatiques et des contrôles manuels pour détecter et supprimer rapidement les contenus interdits. En cas de violation des présentes CG, l'utilisateur sera sanctionné comme suit:", pl: "Zazarap stosuje automatyczne filtry i kontrole ręczne w celu wczesnego wykrywania i usuwania zabronionych treści. W przypadku naruszeń niniejszych OW, użytkownik zostanie ukarany w następujący sposób:", tr: "Zazarap, yasaklanmış içerikleri erken tespit etmek ve kaldırmak için otomatik filtreler ve manuel kontroller kullanır. Bu GŞK'nın ihlali durumunda kullanıcı aşağıdaki şekilde yaptırıma tabi tutulacaktır:", uk: "Zazarap використовує автоматичні фільтри та ручні перевірки для раннього виявлення та видалення забороненого контенту. У разі порушення цих ЗУ користувач буде санкціонований наступним чином:" },
  "agb.section11.li1": { de: "Warnung", it: "Avviso", en: "Warning", fr: "Avertissement", pl: "Ostrzeżenie", tr: "Uyarı", uk: "Попередження" },
  "agb.section11.li2": { de: "Vorübergehende Sperrung", it: "Sospensione temporanea", en: "Temporary suspension", fr: "Suspension temporaire", pl: "Tymczasowe zawieszenie", tr: "Geçici askıya alma", uk: "Тимчасове блокування" },
  "agb.section11.li3": { de: "Dauerhafte Kontoschließung", it: "Chiusura permanente dell'account", en: "Permanent account closure", fr: "Fermeture permanente du compte", pl: "Trwałe zamknięcie konta", tr: "Kalıcı hesap kapatma", uk: "Постійне закриття облікового запису" },
  "agb.section11.li4": { de: "Weitergabe von Daten an Behörden (bei schweren Verstößen)", it: "Trasmissione di dati alle autorità (in caso di gravi violazioni)", en: "Transfer of data to authorities (in case of serious violations)", fr: "Transmission de données aux autorités (en cas de violations graves)", pl: "Przekazanie danych organom (w przypadku poważnych naruszeń)", tr: "Verilerin yetkililere aktarılması (ciddi ihlaller durumunda)", uk: "Передача даних органам влади (у разі серйозних порушень)" },

  "agb.section12.title": { de: "§ 12 Sperrung und Kündigung", it: "§ 12 Sospensione e risoluzione", en: "§ 12 Suspension and Termination", fr: "§ 12 Suspension et résiliation", pl: "§ 12 Zawieszenie i rozwiązanie", tr: "§ 12 Askıya Alma ve Fesih", uk: "§ 12 Блокування та розірвання" },
  "agb.section12.p1": { de: "(1) Der Betreiber kann Nutzerkonten bei Verstößen gegen diese AGB sperren oder löschen.", it: "(1) Il Gestore può sospendere o eliminare gli account utente in caso di violazione delle presenti CGC.", en: "(1) The Operator may suspend or delete user accounts in case of violations of these GTC.", fr: "(1) L'Exploitant peut suspendre ou supprimer les comptes utilisateur en cas de violation des présentes CG.", pl: "(1) Operator może zawiesić lub usunąć konta użytkowników w przypadku naruszeń niniejszych OW.", tr: "(1) İşletici, bu GŞK'nın ihlali durumunda kullanıcı hesaplarını askıya alabilir veya silebilir.", uk: "(1) Оператор може призупинити або видалити облікові записи користувачів у разі порушення цих ЗУ." },
  "agb.section12.p2": { de: "(2) Beide Parteien (Nutzer und Betreiber) können das Nutzerkonto jederzeit ohne Angabe von Gründen kündigen.", it: "(2) Entrambe le parti (Utente e Gestore) possono risolvere l'account utente in qualsiasi momento senza indicare motivi.", en: "(2) Both parties (User and Operator) may terminate the user account at any time without giving reasons.", fr: "(2) Les deux parties (Utilisateur et Exploitant) peuvent résilier le compte utilisateur à tout moment sans donner de raisons.", pl: "(2) Obie strony (Użytkownik i Operator) mogą wypowiedzieć konto użytkownika w dowolnym momencie bez podawania przyczyn.", tr: "(2) Her iki taraf (Kullanıcı ve İşletici) kullanıcı hesabını herhangi bir zamanda sebep göstermeksizin feshedebilir.", uk: "(2) Обидві сторони (Користувач та Оператор) можуть розірвати обліковий запис у будь-який час без зазначення причин." },
  "agb.section12.p3": { de: "(3) Laufende Transaktionen müssen ordnungsgemäß abgeschlossen werden, auch wenn das Nutzerkonto gekündigt wurde.", it: "(3) Le transazioni in corso devono essere completate correttamente, anche se l'account utente è stato risolto.", en: "(3) Ongoing transactions must be properly completed, even if the user account has been terminated.", fr: "(3) Les transactions en cours doivent être correctement finalisées, même si le compte utilisateur a été résilié.", pl: "(3) Bieżące transakcje muszą zostać prawidłowo zakończone, nawet jeśli konto użytkownika zostało wypowiedziane.", tr: "(3) Kullanıcı hesabı feshedilmiş olsa bile devam eden işlemler düzgün bir şekilde tamamlanmalıdır.", uk: "(3) Поточні транзакції повинні бути належно завершені, навіть якщо обліковий запис був розірваний." },

  "agb.section13.title": { de: "§ 13 Haftungsausschluss", it: "§ 13 Esclusione di responsabilità", en: "§ 13 Limitation of Liability", fr: "§ 13 Limitation de responsabilité", pl: "§ 13 Wyłączenie odpowiedzialności", tr: "§ 13 Sorumluluk Sınırlaması", uk: "§ 13 Обмеження відповідальності" },
  "agb.section13.p1": { de: "zazarap.de ist nicht Vertragspartner zwischen Käufer und Verkäufer. Der Betreiber haftet nur nach Maßgabe der gesetzlichen Vorschriften und unter Berücksichtigung der in § 7 genannten Haftungsbeschränkungen.", it: "zazarap.de non è parte contrattuale tra Acquirente e Venditore. Il Gestore è responsabile solo secondo le disposizioni di legge e tenendo conto delle limitazioni di responsabilità menzionate nel § 7.", en: "zazarap.de is not a contracting party between Buyer and Seller. The Operator is liable only in accordance with statutory provisions and taking into account the liability limitations mentioned in § 7.", fr: "zazarap.de n'est pas partie contractante entre l'Acheteur et le Vendeur. L'Exploitant n'est responsable que conformément aux dispositions légales et en tenant compte des limitations de responsabilité mentionnées au § 7.", pl: "zazarap.de nie jest stroną umowy między Kupującym a Sprzedawcą. Operator odpowiada tylko zgodnie z przepisami prawnymi i z uwzględnieniem ograniczeń odpowiedzialności wymienionych w § 7.", tr: "zazarap.de, Alıcı ile Satıcı arasında sözleşme tarafı değildir. İşletici yalnızca yasal hükümlere göre ve § 7'de belirtilen sorumluluk sınırlamalarını dikkate alarak sorumludur.", uk: "zazarap.de не є договірною стороною між Покупцем та Продавцем. Оператор несе відповідальність лише відповідно до законодавства та з урахуванням обмежень відповідальності, зазначених у § 7." },

  "agb.section14.title": { de: "§ 14 Schlussbestimmungen", it: "§ 14 Disposizioni finali", en: "§ 14 Final Provisions", fr: "§ 14 Dispositions finales", pl: "§ 14 Postanowienia końcowe", tr: "§ 14 Son Hükümler", uk: "§ 14 Заключні положення" },
  "agb.section14.p1": { de: "(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.", it: "(1) Si applica la legge della Repubblica Federale Tedesca, con esclusione della Convenzione di Vienna.", en: "(1) The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods.", fr: "(1) Le droit de la République fédérale d'Allemagne s'applique, à l'exclusion de la Convention de Vienne.", pl: "(1) Obowiązuje prawo Republiki Federalnej Niemiec, z wyłączeniem Konwencji Wiedeńskiej.", tr: "(1) Birleşik Almanya Cumhuriyeti hukuku, Viyana Konvansiyonu hariç olmak üzere geçerlidir.", uk: "(1) Застосовується законодавство Федеративної Республіки Німеччина, за винятком Віденської конвенції." },
  "agb.section14.p2": { de: "(2) Gerichtsstand ist, soweit gesetzlich zulässig, Berlin, Deutschland.", it: "(2) Il foro competente è, nella misura consentita dalla legge, Berlino, Germania.", en: "(2) The place of jurisdiction is, insofar as legally permissible, Berlin, Germany.", fr: "(2) Le lieu de juridiction est, dans la mesure permise par la loi, Berlin, Allemagne.", pl: "(2) Miejscem jurysdykcji jest, o ile jest to prawnie dopuszczalne, Berlin, Niemcy.", tr: "(2) Yetki alanı, yasal olarak izin verildiği ölçüde, Berlin, Almanya'dır.", uk: "(2) Місце юрисдикції, наскільки це юридично допустимо, — Берлін, Німеччина." },
  "agb.section14.p3": { de: "(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung wird durch eine wirksame ersetzt, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.", it: "(3) Qualora singole disposizioni delle presenti CGC fossero inefficaci, l'efficacia delle restanti disposizioni rimane inalterata. La disposizione inefficace sarà sostituita da una efficace che si avvicini maggiormente allo scopo economico della disposizione inefficace.", en: "(3) Should individual provisions of these GTC be invalid, the validity of the remaining provisions remains unaffected. The invalid provision will be replaced by a valid one that comes closest to the economic purpose of the invalid provision.", fr: "(3) Si certaines dispositions des présentes CG sont invalides, la validité des autres dispositions reste inchangée. La disposition invalide sera remplacée par une disposition valide qui se rapproche le plus de l'objectif économique de la disposition invalide.", pl: "(3) W przypadku gdyby poszczególne postanowienia niniejszych OW były nieważne, ważność pozostałych postanowień pozostaje nienaruszona. Nieważne postanowienie zostanie zastąpione ważnym, które najbardziej zbliża się do celu gospodarczego nieważnego postanowienia.", tr: "(3) Bu GŞK'nın tek tek hükümlerinin geçersiz olması durumunda, kalan hükümlerin geçerliliği etkilenmez. Geçersiz hüküm, geçersiz hükmün ekonomik amacına en yakın geçerli bir hükümle değiştirilecektir.", uk: "(3) Якщо окремі положення цих ЗУ є недійсними, дійсність інших положень залишається незмінною. Недійсне положення буде замінено дійсним, яке найближче до економічної мети недійсного положення." },

  // Notification Settings
  "notificationSettings.title": { de: "Benachrichtigungseinstellungen", it: "Impostazioni notifiche", en: "Notification Settings", fr: "Paramètres de notification", pl: "Ustawienia powiadomień", tr: "Bildirim Ayarları", uk: "Налаштування сповіщень" },
  "notificationSettings.description": { de: "Passen Sie an, welche Benachrichtigungen Sie erhalten möchten, um über Ihre Aktivitäten auf dem Marktplatz informiert zu bleiben.", it: "Personalizza quali notifiche vuoi ricevere per rimanere aggiornato sulle tue attività nel marketplace.", en: "Customize which notifications you want to receive to stay updated on your marketplace activities.", fr: "Personnalisez les notifications que vous souhaitez recevoir pour rester informé de vos activités sur la marketplace.", pl: "Dostosuj, które powiadomienia chcesz otrzymywać, aby być na bieżąco ze swoją aktywnością na platformie.", tr: "Pazar yerindeki faaliyetlerinizden haberdar olmak için hangi bildirimleri almak istediğinizi özelleştirin.", uk: "Налаштуйте, які сповіщення ви хочете отримувати, щоб бути в курсі своєї діяльності на платформі." },
  "notificationSettings.updated": { de: "Einstellungen aktualisiert", it: "Preferenze aggiornate", en: "Settings updated", fr: "Paramètres mis à jour", pl: "Ustawienia zaktualizowane", tr: "Ayarlar güncellendi", uk: "Налаштування оновлено" },

  "notificationSettings.favorite.title": { de: "Angebote zu Favoriten", it: "Offerte su preferiti", en: "Offers on favorites", fr: "Offres sur favoris", pl: "Oferty na ulubionych", tr: "Favorilerde teklifler", uk: "Пропозиції на улюблених" },
  "notificationSettings.favorite.desc": { de: "Benachrichtigungen erhalten, wenn jemand ein Angebot für gespeicherte Anzeigen macht", it: "Ricevi notifiche quando qualcuno fa un'offerta su annunci salvati", en: "Receive notifications when someone makes an offer on saved listings", fr: "Recevoir des notifications lorsque quelqu'un fait une offre sur des annonces sauvegardées", pl: "Otrzymuj powiadomienia, gdy ktoś złoży ofertę na zapisane ogłoszenia", tr: "Birisi kayıtlı ilanlara teklif verdiğinde bildirim alın", uk: "Отримувати сповіщення, коли хтось робить пропозицію на збережені оголошення" },

  "notificationSettings.messages.title": { de: "Nachrichtenantworten", it: "Risposte ai messaggi", en: "Message replies", fr: "Réponses aux messages", pl: "Odpowiedzi na wiadomości", tr: "Mesaj yanıtları", uk: "Відповіді на повідомлення" },
  "notificationSettings.messages.desc": { de: "Benachrichtigungen erhalten, wenn jemand auf Ihre Nachrichten antwortet", it: "Ricevi notifiche quando qualcuno risponde ai tuoi messaggi", en: "Receive notifications when someone replies to your messages", fr: "Recevoir des notifications lorsque quelqu'un répond à vos messages", pl: "Otrzymuj powiadomienia, gdy ktoś odpowie na Twoje wiadomości", tr: "Birisi mesajlarınıza yanıt verdiğinde bildirim alın", uk: "Отримувати сповіщення, коли хтось відповідає на ваші повідомлення" },

  "notificationSettings.statusUpdates.title": { de: "Statusaktualisierungen", it: "Aggiornamenti stato", en: "Status updates", fr: "Mises à jour de statut", pl: "Aktualizacje statusu", tr: "Durum güncellemeleri", uk: "Оновлення статусу" },
  "notificationSettings.statusUpdates.desc": { de: "Benachrichtigungen für Statusänderungen bei aktiven Verhandlungen", it: "Notifiche per cambiamenti di stato nelle trattative attive", en: "Notifications for status changes in active negotiations", fr: "Notifications pour les changements de statut dans les négociations actives", pl: "Powiadomienia o zmianach statusu w aktywnych negocjacjach", tr: "Aktif müzakerelerdeki durum değişiklikleri için bildirimler", uk: "Сповіщення про зміни статусу в активних переговорах" },

  "notificationSettings.purchases.title": { de: "Kaufbestätigungen", it: "Conferme acquisti", en: "Purchase confirmations", fr: "Confirmations d'achat", pl: "Potwierdzenia zakupów", tr: "Satın alma onayları", uk: "Підтвердження покупок" },
  "notificationSettings.purchases.desc": { de: "Benachrichtigungen für erfolgreiche Käufe und Transaktionen", it: "Notifiche per acquisti e transazioni riuscite", en: "Notifications for successful purchases and transactions", fr: "Notifications pour les achats et transactions réussis", pl: "Powiadomienia o udanych zakupach i transakcjach", tr: "Başarılı satın almalar ve işlemler için bildirimler", uk: "Сповіщення про успішні покупки та транзакції" },

  "notificationSettings.shipping.title": { de: "Versandinformationen", it: "Informazioni spedizione", en: "Shipping information", fr: "Informations d'expédition", pl: "Informacje o wysyłce", tr: "Gönderim bilgileri", uk: "Інформація про доставку" },
  "notificationSettings.shipping.desc": { de: "Benachrichtigungen über Versandstatus und Lieferaktualisierungen", it: "Notifiche su stato spedizione e aggiornamenti consegna", en: "Notifications about shipping status and delivery updates", fr: "Notifications sur l'état de l'expédition et les mises à jour de livraison", pl: "Powiadomienia o statusie wysyłki i aktualizacjach dostawy", tr: "Gönderim durumu ve teslimat güncellemeleri hakkında bildirimler", uk: "Сповіщення про статус доставки та оновлення" },

  "notificationSettings.priceDrops.title": { de: "Preissenkungen", it: "Riduzioni prezzo", en: "Price drops", fr: "Baisses de prix", pl: "Obniżki cen", tr: "Fiyat düşüşleri", uk: "Зниження цін" },
  "notificationSettings.priceDrops.desc": { de: "Benachrichtigungen, wenn beobachtete Artikel günstiger werden", it: "Notifiche quando gli articoli osservati diventano più economici", en: "Notifications when watched items become cheaper", fr: "Notifications lorsque les articles surveillés deviennent moins chers", pl: "Powiadomienia, gdy obserwowane przedmioty stają się tańsze", tr: "İzlenen öğeler ucuzladığında bildirimler", uk: "Сповіщення, коли відстежувані товари дешевшають" },

  // AI Tools for Sellers
  "aiTools.pageTitle": { de: "KI-Tools für Verkäufer", it: "Strumenti AI per Venditori", en: "AI Tools for Sellers", fr: "Outils IA pour vendeurs", pl: "Narzędzia AI dla sprzedawców", tr: "Satıcılar için AI Araçları", uk: "AI-інструменти для продавців" },
  "aiTools.pageDesc": { de: "Nutzen Sie Künstliche Intelligenz, um perfekte Anzeigen zu erstellen und Ihren Umsatz zu maximieren", it: "Utilizza l'intelligenza artificiale per creare annunci perfetti e massimizzare le vendite", en: "Use artificial intelligence to create perfect listings and maximize sales", fr: "Utilisez l'intelligence artificielle pour créer des annonces parfaites et maximiser les ventes", pl: "Wykorzystaj sztuczną inteligencję do tworzenia idealnych ogłoszeń i maksymalizacji sprzedaży", tr: "Mükemmel ilanlar oluşturmak ve satışları artırmak için yapay zekayı kullanın", uk: "Використовуйте штучний інтелект для створення ідеальних оголошень та максимізації продажів" },
  
  "aiTools.descriptionAssistant.title": { de: "Beschreibungs-Assistent", it: "Assistente Descrizioni", en: "Description Assistant", fr: "Assistant descriptions", pl: "Asystent opisów", tr: "Açıklama Asistanı", uk: "Асистент описів" },
  "aiTools.descriptionAssistant.desc": { de: "Generiere verkaufsstarke und SEO-optimierte Beschreibungen", it: "Genera descrizioni accattivanti e ottimizzate SEO", en: "Generate compelling and SEO-optimized descriptions", fr: "Générez des descriptions convaincantes et optimisées SEO", pl: "Generuj przekonujące opisy zoptymalizowane pod SEO", tr: "Etkileyici ve SEO optimize edilmiş açıklamalar oluşturun", uk: "Генеруйте переконливі та SEO-оптимізовані описи" },
  
  "aiTools.imageAnalyzer.title": { de: "Bildanalyse", it: "Analisi Immagini", en: "Image Analysis", fr: "Analyse d'images", pl: "Analiza obrazów", tr: "Görsel Analizi", uk: "Аналіз зображень" },
  "aiTools.imageAnalyzer.desc": { de: "Optimiere Fotos für mehr Verkäufe", it: "Ottimizza le foto per vendere di più", en: "Optimize photos for more sales", fr: "Optimisez les photos pour plus de ventes", pl: "Optymalizuj zdjęcia dla większej sprzedaży", tr: "Daha fazla satış için fotoğrafları optimize edin", uk: "Оптимізуйте фото для більших продажів" },
  
  "aiTools.demandPredictor.title": { de: "Nachfragevorhersage", it: "Previsione Domanda", en: "Demand Prediction", fr: "Prévision de la demande", pl: "Prognoza popytu", tr: "Talep Tahmini", uk: "Прогноз попиту" },
  "aiTools.demandPredictor.desc": { de: "Analysiere den Markt und optimiere Preise", it: "Analizza il mercato e ottimizza i prezzi", en: "Analyze market and optimize prices", fr: "Analysez le marché et optimisez les prix", pl: "Analizuj rynek i optymalizuj ceny", tr: "Pazarı analiz edin ve fiyatları optimize edin", uk: "Аналізуйте ринок та оптимізуйте ціни" },
  
  "aiTools.testProduct": { de: "Prova gli strumenti", it: "Prova gli strumenti", en: "Test the tools", fr: "Testez les outils", pl: "Przetestuj narzędzia", tr: "Araçları test edin", uk: "Тестуйте інструменти" },
  "aiTools.testProductDesc": { de: "Füge Produktdaten ein, um die KI-Funktionen zu testen", it: "Inserisci i dati di un prodotto per testare le funzionalità AI", en: "Enter product data to test AI features", fr: "Entrez les données du produit pour tester les fonctionnalités IA", pl: "Wprowadź dane produktu, aby przetestować funkcje AI", tr: "AI özelliklerini test etmek için ürün verilerini girin", uk: "Введіть дані продукту для тестування AI-функцій" },
  
  "aiTools.uploadImages": { de: "Bilder hochladen", it: "Carica immagini", en: "Upload images", fr: "Télécharger des images", pl: "Prześlij zdjęcia", tr: "Görselleri yükle", uk: "Завантажити зображення" },
  "aiTools.clickToUpload": { de: "Klicken zum Hochladen", it: "Clicca per caricare", en: "Click to upload", fr: "Cliquez pour télécharger", pl: "Kliknij, aby przesłać", tr: "Yüklemek için tıklayın", uk: "Натисніть для завантаження" },
  "aiTools.tips.title": { de: "Tipps für mehr Verkäufe", it: "Consigli per vendere di più", en: "Tips for more sales", fr: "Conseils pour plus de ventes", pl: "Wskazówki dla większej sprzedaży", tr: "Daha fazla satış için ipuçları", uk: "Поради для більших продажів" },
  
  // Advanced Description Assistant
  "aiDesc.mainKeywords": { de: "Hauptschlüsselwörter", it: "Parole chiave principali", en: "Main keywords", fr: "Mots-clés principaux", pl: "Główne słowa kluczowe", tr: "Ana anahtar kelimeler", uk: "Основні ключові слова" },
  "aiDesc.keywordsPlaceholder": { de: "z.B. neu, original, Garantie...", it: "es. nuovo, originale, garanzia...", en: "e.g. new, original, warranty...", fr: "ex. neuf, original, garantie...", pl: "np. nowy, oryginalny, gwarancja...", tr: "örn. yeni, orijinal, garanti...", uk: "напр. новий, оригінал, гарантія..." },
  "aiDesc.specificFeatures": { de: "Spezifische Merkmale", it: "Caratteristiche specifiche", en: "Specific features", fr: "Caractéristiques spécifiques", pl: "Specyficzne cechy", tr: "Özel özellikler", uk: "Специфічні особливості" },
  "aiDesc.featuresPlaceholder": { de: "z.B. 128GB, schwarz, Baujahr 2023...", it: "es. 128GB, colore nero, anno 2023...", en: "e.g. 128GB, black, year 2023...", fr: "ex. 128GB, noir, année 2023...", pl: "np. 128GB, czarny, rok 2023...", tr: "örn. 128GB, siyah, yıl 2023...", uk: "напр. 128GB, чорний, рік 2023..." },
  "aiDesc.advancedOptions": { de: "Erweiterte Optionen", it: "Opzioni avanzate", en: "Advanced options", fr: "Options avancées", pl: "Opcje zaawansowane", tr: "Gelişmiş seçenekler", uk: "Розширені параметри" },
  "aiDesc.target": { de: "Zielgruppe", it: "Target", en: "Target audience", fr: "Public cible", pl: "Grupa docelowa", tr: "Hedef kitle", uk: "Цільова аудиторія" },
  "aiDesc.target.general": { de: "Allgemein", it: "Generale", en: "General", fr: "Général", pl: "Ogólny", tr: "Genel", uk: "Загальний" },
  "aiDesc.target.young": { de: "Jugendliche (18-30)", it: "Giovani (18-30)", en: "Young (18-30)", fr: "Jeunes (18-30)", pl: "Młodzi (18-30)", tr: "Gençler (18-30)", uk: "Молодь (18-30)" },
  "aiDesc.target.families": { de: "Familien", it: "Famiglie", en: "Families", fr: "Familles", pl: "Rodziny", tr: "Aileler", uk: "Сім'ї" },
  "aiDesc.target.professionals": { de: "Fachleute", it: "Professionisti", en: "Professionals", fr: "Professionnels", pl: "Profesjonaliści", tr: "Profesyoneller", uk: "Професіонали" },
  "aiDesc.target.collectors": { de: "Sammler", it: "Collezionisti", en: "Collectors", fr: "Collectionneurs", pl: "Kolekcjonerzy", tr: "Koleksiyoncular", uk: "Колекціонери" },
  "aiDesc.tone": { de: "Tonalität", it: "Tono", en: "Tone", fr: "Ton", pl: "Ton", tr: "Ton", uk: "Тон" },
  "aiDesc.tone.friendly": { de: "Freundlich", it: "Amichevole", en: "Friendly", fr: "Amical", pl: "Przyjazny", tr: "Arkadaşça", uk: "Дружній" },
  "aiDesc.tone.professional": { de: "Professionell", it: "Professionale", en: "Professional", fr: "Professionnel", pl: "Profesjonalny", tr: "Profesyonel", uk: "Професійний" },
  "aiDesc.tone.urgent": { de: "Dringend", it: "Urgente", en: "Urgent", fr: "Urgent", pl: "Pilny", tr: "Acil", uk: "Терміновий" },
  "aiDesc.tone.luxury": { de: "Luxus/Premium", it: "Lusso/Premium", en: "Luxury/Premium", fr: "Luxe/Premium", pl: "Luksus/Premium", tr: "Lüks/Premium", uk: "Люкс/Преміум" },
  "aiDesc.tone.dynamic": { de: "Jugendlich/Dynamisch", it: "Giovane/Dinamico", en: "Young/Dynamic", fr: "Jeune/Dynamique", pl: "Młodzieżowy/Dynamiczny", tr: "Genç/Dinamik", uk: "Молодіжний/Динамічний" },
  
  "aiDesc.generateBtn": { de: "KI-Beschreibungen generieren", it: "Genera Descrizioni AI", en: "Generate AI Descriptions", fr: "Générer descriptions IA", pl: "Generuj opisy AI", tr: "AI Açıklamaları Oluştur", uk: "Генерувати AI-описи" },
  "aiDesc.generating": { de: "KI-Generierung läuft...", it: "Generazione AI in corso...", en: "AI generation in progress...", fr: "Génération IA en cours...", pl: "Generowanie AI w toku...", tr: "AI oluşturma devam ediyor...", uk: "AI-генерація в процесі..." },
  "aiDesc.enterTitle": { de: "Gib zuerst einen Titel ein", it: "Inserisci prima un titolo", en: "Enter a title first", fr: "Entrez d'abord un titre", pl: "Najpierw wprowadź tytuł", tr: "Önce bir başlık girin", uk: "Спочатку введіть назву" },
  "aiDesc.generated": { de: "Erfolgreich generiert!", it: "Generato con successo!", en: "Generated successfully!", fr: "Généré avec succès!", pl: "Wygenerowano pomyślnie!", tr: "Başarıyla oluşturuldu!", uk: "Успішно згенеровано!" },
  "aiDesc.error": { de: "Generierungsfehler", it: "Errore nella generazione", en: "Generation error", fr: "Erreur de génération", pl: "Błąd generowania", tr: "Oluşturma hatası", uk: "Помилка генерації" },
  
  "aiDesc.version.short": { de: "Kurz", it: "Breve", en: "Short", fr: "Court", pl: "Krótki", tr: "Kısa", uk: "Короткий" },
  "aiDesc.version.standard": { de: "Standard", it: "Standard", en: "Standard", fr: "Standard", pl: "Standardowy", tr: "Standart", uk: "Стандартний" },
  "aiDesc.version.detailed": { de: "Detailliert", it: "Dettagliata", en: "Detailed", fr: "Détaillé", pl: "Szczegółowy", tr: "Detaylı", uk: "Детальний" },
  "aiDesc.words": { de: "Wörter", it: "parole", en: "words", fr: "mots", pl: "słów", tr: "kelime", uk: "слів" },
  "aiDesc.altHeadline": { de: "Alternativer Titel vorgeschlagen", it: "Titolo alternativo suggerito", en: "Alternative headline suggested", fr: "Titre alternatif suggéré", pl: "Sugerowany tytuł alternatywny", tr: "Alternatif başlık önerildi", uk: "Запропонований альтернативний заголовок" },
  "aiDesc.strengths": { de: "Stärken", it: "Punti di forza", en: "Strengths", fr: "Points forts", pl: "Mocne strony", tr: "Güçlü yönler", uk: "Сильні сторони" },
  "aiDesc.targetEmotions": { de: "Zielemotionen", it: "Emozioni target", en: "Target emotions", fr: "Émotions cibles", pl: "Docelowe emocje", tr: "Hedef duygular", uk: "Цільові емоції" },
  "aiDesc.seoOptimization": { de: "SEO-Optimierung", it: "Ottimizzazione SEO", en: "SEO Optimization", fr: "Optimisation SEO", pl: "Optymalizacja SEO", tr: "SEO Optimizasyonu", uk: "SEO-оптимізація" },
  "aiDesc.metaTitle": { de: "Meta-Titel", it: "Meta Title", en: "Meta Title", fr: "Meta Title", pl: "Meta Title", tr: "Meta Başlık", uk: "Meta Title" },
  "aiDesc.metaDesc": { de: "Meta-Beschreibung", it: "Meta Description", en: "Meta Description", fr: "Meta Description", pl: "Meta Description", tr: "Meta Açıklama", uk: "Meta Description" },
  "aiDesc.keywords": { de: "Schlüsselwörter", it: "Keywords", en: "Keywords", fr: "Mots-clés", pl: "Słowa kluczowe", tr: "Anahtar Kelimeler", uk: "Ключові слова" },
  "aiDesc.socialHashtags": { de: "Social-Media-Hashtags", it: "Hashtag Social", en: "Social Media Hashtags", fr: "Hashtags réseaux sociaux", pl: "Hashtagi mediów społecznościowych", tr: "Sosyal Medya Hashtag'leri", uk: "Хештеги соцмереж" },
  "aiDesc.applySeo": { de: "SEO anwenden", it: "Applica SEO", en: "Apply SEO", fr: "Appliquer SEO", pl: "Zastosuj SEO", tr: "SEO Uygula", uk: "Застосувати SEO" },
  "aiDesc.persuasionElements": { de: "Überzeugende Elemente", it: "Elementi persuasivi", en: "Persuasion elements", fr: "Éléments persuasifs", pl: "Elementy perswazji", tr: "İkna edici öğeler", uk: "Переконливі елементи" },
  "aiDesc.urgencyPhrases": { de: "Dringlichkeitsphrasen", it: "Frasi di urgenza", en: "Urgency phrases", fr: "Phrases d'urgence", pl: "Zwroty pilności", tr: "Aciliyet ifadeleri", uk: "Фрази терміновості" },
  "aiDesc.trustSignals": { de: "Vertrauenssignale", it: "Segnali di fiducia", en: "Trust signals", fr: "Signaux de confiance", pl: "Sygnały zaufania", tr: "Güven sinyalleri", uk: "Сигнали довіри" },
  "aiDesc.useDescription": { de: "Diese Beschreibung verwenden", it: "Usa questa descrizione", en: "Use this description", fr: "Utiliser cette description", pl: "Użyj tego opisu", tr: "Bu açıklamayı kullan", uk: "Використати цей опис" },
  "aiDesc.regenerate": { de: "Neu generieren", it: "Rigenera", en: "Regenerate", fr: "Régénérer", pl: "Wygeneruj ponownie", tr: "Yeniden oluştur", uk: "Перегенерувати" },
  "aiDesc.copied": { de: "In Zwischenablage kopiert", it: "Copiato negli appunti", en: "Copied to clipboard", fr: "Copié dans le presse-papiers", pl: "Skopiowano do schowka", tr: "Panoya kopyalandı", uk: "Скопійовано в буфер" },

  // Advanced Image Analyzer
  "aiImg.title": { de: "Erweiterte Bildanalyse", it: "Analisi Avanzata Immagini", en: "Advanced Image Analysis", fr: "Analyse d'images avancée", pl: "Zaawansowana analiza obrazów", tr: "Gelişmiş Görsel Analizi", uk: "Розширений аналіз зображень" },
  "aiImg.analyzeBtn": { de: "{count} Bilder analysieren", it: "Analizza {count} immagini", en: "Analyze {count} images", fr: "Analyser {count} images", pl: "Analizuj {count} zdjęć", tr: "{count} görseli analiz et", uk: "Проаналізувати {count} зображень" },
  "aiImg.analyzing": { de: "Analyse läuft...", it: "Analisi in corso...", en: "Analysis in progress...", fr: "Analyse en cours...", pl: "Analiza w toku...", tr: "Analiz devam ediyor...", uk: "Аналіз триває..." },
  "aiImg.uploadFirst": { de: "Lade mindestens ein Bild hoch", it: "Carica almeno un'immagine", en: "Upload at least one image", fr: "Téléchargez au moins une image", pl: "Prześlij przynajmniej jedno zdjęcie", tr: "En az bir görsel yükleyin", uk: "Завантажте хоча б одне зображення" },
  "aiImg.completed": { de: "Analyse abgeschlossen!", it: "Analisi completata!", en: "Analysis completed!", fr: "Analyse terminée!", pl: "Analiza zakończona!", tr: "Analiz tamamlandı!", uk: "Аналіз завершено!" },
  "aiImg.analysisError": { de: "Analysefehler", it: "Errore nell'analisi", en: "Analysis error", fr: "Erreur d'analyse", pl: "Błąd analizy", tr: "Analiz hatası", uk: "Помилка аналізу" },
  
  "aiImg.overallScore": { de: "Gesamtbewertung", it: "Punteggio complessivo", en: "Overall score", fr: "Score global", pl: "Wynik ogólny", tr: "Genel puan", uk: "Загальний бал" },
  "aiImg.rating.excellent": { de: "Ausgezeichnet", it: "Eccellente", en: "Excellent", fr: "Excellent", pl: "Doskonały", tr: "Mükemmel", uk: "Відмінно" },
  "aiImg.rating.good": { de: "Gut", it: "Buono", en: "Good", fr: "Bon", pl: "Dobry", tr: "İyi", uk: "Добре" },
  "aiImg.rating.sufficient": { de: "Ausreichend", it: "Sufficiente", en: "Sufficient", fr: "Suffisant", pl: "Wystarczający", tr: "Yeterli", uk: "Достатньо" },
  "aiImg.rating.needsWork": { de: "Verbesserungsbedürftig", it: "Da migliorare", en: "Needs improvement", fr: "À améliorer", pl: "Do poprawy", tr: "İyileştirme gerekli", uk: "Потребує поліпшення" },
  
  "aiImg.bestMainPhoto": { de: "Empfohlenes Hauptfoto: Bild {index}", it: "Foto principale consigliata: Immagine {index}", en: "Recommended main photo: Image {index}", fr: "Photo principale recommandée: Image {index}", pl: "Zalecane główne zdjęcie: Obraz {index}", tr: "Önerilen ana fotoğraf: Görsel {index}", uk: "Рекомендоване основне фото: Зображення {index}" },
  "aiImg.score": { de: "Punktzahl", it: "Punteggio", en: "Score", fr: "Score", pl: "Wynik", tr: "Puan", uk: "Бал" },
  
  "aiImg.tab.photos": { de: "Fotos", it: "Foto", en: "Photos", fr: "Photos", pl: "Zdjęcia", tr: "Fotoğraflar", uk: "Фото" },
  "aiImg.tab.missing": { de: "Fehlend", it: "Mancanti", en: "Missing", fr: "Manquantes", pl: "Brakujące", tr: "Eksik", uk: "Відсутні" },
  "aiImg.tab.quickFixes": { de: "Schnelle Korrekturen", it: "Fix Rapidi", en: "Quick Fixes", fr: "Corrections rapides", pl: "Szybkie poprawki", tr: "Hızlı Düzeltmeler", uk: "Швидкі виправлення" },
  "aiImg.tab.tips": { de: "Tipps", it: "Tips", en: "Tips", fr: "Conseils", pl: "Wskazówki", tr: "İpuçları", uk: "Поради" },
  
  "aiImg.photo": { de: "Foto", it: "Foto", en: "Photo", fr: "Photo", pl: "Zdjęcie", tr: "Fotoğraf", uk: "Фото" },
  "aiImg.light": { de: "Licht", it: "Luce", en: "Light", fr: "Lumière", pl: "Światło", tr: "Işık", uk: "Світло" },
  "aiImg.quality": { de: "Qualität", it: "Qualità", en: "Quality", fr: "Qualité", pl: "Jakość", tr: "Kalite", uk: "Якість" },
  "aiImg.composition": { de: "Komposition", it: "Composizione", en: "Composition", fr: "Composition", pl: "Kompozycja", tr: "Kompozisyon", uk: "Композиція" },
  "aiImg.missingDetails": { de: "Fehlende Details", it: "Dettagli mancanti", en: "Missing details", fr: "Détails manquants", pl: "Brakujące szczegóły", tr: "Eksik detaylar", uk: "Відсутні деталі" },
  
  "aiImg.noMissing": { de: "Du hast alle wesentlichen Perspektiven!", it: "Hai tutte le angolazioni essenziali!", en: "You have all essential angles!", fr: "Vous avez tous les angles essentiels!", pl: "Masz wszystkie istotne kąty!", tr: "Tüm temel açılara sahipsiniz!", uk: "У вас є всі необхідні ракурси!" },
  "aiImg.lifestyleIdeas": { de: "Lifestyle-Foto-Ideen", it: "Idee per foto lifestyle", en: "Lifestyle photo ideas", fr: "Idées de photos lifestyle", pl: "Pomysły na zdjęcia lifestyle", tr: "Yaşam tarzı fotoğraf fikirleri", uk: "Ідеї для лайфстайл-фото" },
  "aiImg.howToShoot": { de: "So fotografierst du es:", it: "Come scattarla:", en: "How to shoot it:", fr: "Comment la prendre:", pl: "Jak zrobić:", tr: "Nasıl çekilir:", uk: "Як зробити:" },
  
  "aiImg.impact": { de: "Auswirkung", it: "Impatto", en: "Impact", fr: "Impact", pl: "Wpływ", tr: "Etki", uk: "Вплив" },
  "aiImg.impact.high": { de: "Hoch", it: "Alto", en: "High", fr: "Élevé", pl: "Wysoki", tr: "Yüksek", uk: "Високий" },
  "aiImg.impact.medium": { de: "Mittel", it: "Medio", en: "Medium", fr: "Moyen", pl: "Średni", tr: "Orta", uk: "Середній" },
  "aiImg.impact.low": { de: "Niedrig", it: "Basso", en: "Low", fr: "Faible", pl: "Niski", tr: "Düşük", uk: "Низький" },
  
  "aiImg.smartphoneTips": { de: "Smartphone-Tipps", it: "Tips per smartphone", en: "Smartphone tips", fr: "Conseils smartphone", pl: "Wskazówki smartfona", tr: "Akıllı telefon ipuçları", uk: "Поради для смартфона" },
  "aiImg.freeApps": { de: "Kostenlose Apps empfohlen", it: "App gratuite consigliate", en: "Recommended free apps", fr: "Apps gratuites recommandées", pl: "Polecane darmowe aplikacje", tr: "Önerilen ücretsiz uygulamalar", uk: "Рекомендовані безкоштовні додатки" },
  "aiImg.strengths": { de: "Stärken", it: "Punti di forza", en: "Strengths", fr: "Points forts", pl: "Mocne strony", tr: "Güçlü yönler", uk: "Сильні сторони" },
  "aiImg.toFix": { de: "Zu korrigieren", it: "Da correggere", en: "To fix", fr: "À corriger", pl: "Do naprawy", tr: "Düzeltilecek", uk: "Виправити" },
  "aiImg.reanalyze": { de: "Neu analysieren", it: "Rianalizza", en: "Reanalyze", fr: "Réanalyser", pl: "Przeanalizuj ponownie", tr: "Yeniden analiz et", uk: "Переаналізувати" },
  
  // Market Demand Predictor
  "aiDemand.title": { de: "Markt-Nachfragevorhersage", it: "Previsione Domanda di Mercato", en: "Market Demand Prediction", fr: "Prévision de la demande du marché", pl: "Prognoza popytu rynkowego", tr: "Pazar Talebi Tahmini", uk: "Прогноз ринкового попиту" },
  "aiDemand.analyzeBtn": { de: "Nachfrage analysieren", it: "Analizza Domanda", en: "Analyze Demand", fr: "Analyser la demande", pl: "Analizuj popyt", tr: "Talebi Analiz Et", uk: "Проаналізувати попит" },
  "aiDemand.analyzing": { de: "Marktanalyse läuft...", it: "Analisi mercato in corso...", en: "Market analysis in progress...", fr: "Analyse de marché en cours...", pl: "Analiza rynku w toku...", tr: "Pazar analizi devam ediyor...", uk: "Аналіз ринку триває..." },
  "aiDemand.enterProductTitle": { de: "Gib zuerst den Produkttitel ein", it: "Inserisci prima il titolo del prodotto", en: "Enter product title first", fr: "Entrez d'abord le titre du produit", pl: "Najpierw wprowadź tytuł produktu", tr: "Önce ürün başlığını girin", uk: "Спочатку введіть назву продукту" },
  "aiDemand.completed": { de: "Marktanalyse abgeschlossen!", it: "Analisi di mercato completata!", en: "Market analysis completed!", fr: "Analyse de marché terminée!", pl: "Analiza rynku zakończona!", tr: "Pazar analizi tamamlandı!", uk: "Аналіз ринку завершено!" },
  "aiDemand.error": { de: "Analysefehler", it: "Errore nell'analisi", en: "Analysis error", fr: "Erreur d'analyse", pl: "Błąd analizy", tr: "Analiz hatası", uk: "Помилка аналізу" },
  
  "aiDemand.willAnalyze": { de: "Die KI analysiert den Markt und liefert:", it: "L'AI analizzerà il mercato e ti fornirà:", en: "AI will analyze the market and provide:", fr: "L'IA analysera le marché et fournira:", pl: "AI przeanalizuje rynek i dostarczy:", tr: "AI pazarı analiz edecek ve sağlayacak:", uk: "AI проаналізує ринок і надасть:" },
  "aiDemand.currentDemand": { de: "Aktuelle Nachfrage-Schätzung", it: "Stima della domanda attuale", en: "Current demand estimate", fr: "Estimation de la demande actuelle", pl: "Aktualna ocena popytu", tr: "Mevcut talep tahmini", uk: "Поточна оцінка попиту" },
  "aiDemand.optimalPrice": { de: "Optimaler empfohlener Preis", it: "Prezzo ottimale consigliato", en: "Optimal recommended price", fr: "Prix optimal recommandé", pl: "Optymalnie zalecana cena", tr: "Önerilen optimal fiyat", uk: "Оптимальна рекомендована ціна" },
  "aiDemand.expectedTime": { de: "Voraussichtliche Verkaufszeit", it: "Tempo di vendita previsto", en: "Expected sale time", fr: "Temps de vente prévu", pl: "Przewidywany czas sprzedaży", tr: "Beklenen satış süresi", uk: "Очікуваний час продажу" },
  "aiDemand.trendsSeason": { de: "Trends und Saisonalität", it: "Trend e stagionalità", en: "Trends and seasonality", fr: "Tendances et saisonnalité", pl: "Trendy i sezonowość", tr: "Trendler ve mevsimsellik", uk: "Тренди та сезонність" },
  "aiDemand.inventoryTips": { de: "Tipps für Lager und Vorrat", it: "Consigli per scorte e inventory", en: "Inventory and stock tips", fr: "Conseils pour stock et inventaire", pl: "Wskazówki dotyczące zapasów", tr: "Stok ve envanter ipuçları", uk: "Поради щодо запасів" },
  
  "aiDemand.demandLevel": { de: "Nachfragestufe", it: "Livello di domanda", en: "Demand level", fr: "Niveau de demande", pl: "Poziom popytu", tr: "Talep seviyesi", uk: "Рівень попиту" },
  "aiDemand.level.veryHigh": { de: "Sehr hoch", it: "Molto Alta", en: "Very High", fr: "Très élevée", pl: "Bardzo wysoki", tr: "Çok Yüksek", uk: "Дуже високий" },
  "aiDemand.level.high": { de: "Hoch", it: "Alta", en: "High", fr: "Élevée", pl: "Wysoki", tr: "Yüksek", uk: "Високий" },
  "aiDemand.level.medium": { de: "Mittel", it: "Media", en: "Medium", fr: "Moyenne", pl: "Średni", tr: "Orta", uk: "Середній" },
  "aiDemand.level.low": { de: "Niedrig", it: "Bassa", en: "Low", fr: "Faible", pl: "Niski", tr: "Düşük", uk: "Низький" },
  "aiDemand.level.veryLow": { de: "Sehr niedrig", it: "Molto Bassa", en: "Very Low", fr: "Très faible", pl: "Bardzo niski", tr: "Çok Düşük", uk: "Дуже низький" },
  
  "aiDemand.similarListings": { de: "Ähnliche Anzeigen", it: "Annunci simili", en: "Similar listings", fr: "Annonces similaires", pl: "Podobne ogłoszenia", tr: "Benzer ilanlar", uk: "Схожі оголошення" },
  "aiDemand.avgPrice": { de: "Durchschnittspreis", it: "Prezzo medio", en: "Average price", fr: "Prix moyen", pl: "Średnia cena", tr: "Ortalama fiyat", uk: "Середня ціна" },
  "aiDemand.recentSearches": { de: "Kürzliche Suchen", it: "Ricerche recenti", en: "Recent searches", fr: "Recherches récentes", pl: "Ostatnie wyszukiwania", tr: "Son aramalar", uk: "Останні пошуки" },
  "aiDemand.recentViews": { de: "Kürzliche Aufrufe", it: "Visualizzazioni", en: "Recent views", fr: "Vues récentes", pl: "Ostatnie wyświetlenia", tr: "Son görüntülemeler", uk: "Останні перегляди" },
  
  "aiDemand.tab.pricing": { de: "Preise", it: "Prezzi", en: "Pricing", fr: "Prix", pl: "Ceny", tr: "Fiyatlandırma", uk: "Ціноутворення" },
  "aiDemand.tab.timing": { de: "Timing", it: "Timing", en: "Timing", fr: "Timing", pl: "Timing", tr: "Zamanlama", uk: "Час" },
  "aiDemand.tab.trends": { de: "Trends", it: "Trend", en: "Trends", fr: "Tendances", pl: "Trendy", tr: "Trendler", uk: "Тренди" },
  "aiDemand.tab.inventory": { de: "Lagerbestand", it: "Scorte", en: "Inventory", fr: "Stock", pl: "Zapasy", tr: "Envanter", uk: "Запаси" },
  
  "aiDemand.price.quickSale": { de: "Schnellverkauf", it: "Vendita rapida", en: "Quick sale", fr: "Vente rapide", pl: "Szybka sprzedaż", tr: "Hızlı satış", uk: "Швидкий продаж" },
  "aiDemand.price.recommended": { de: "Empfohlen", it: "Consigliato", en: "Recommended", fr: "Recommandé", pl: "Zalecany", tr: "Önerilen", uk: "Рекомендовано" },
  "aiDemand.price.premium": { de: "Premium", it: "Premium", en: "Premium", fr: "Premium", pl: "Premium", tr: "Premium", uk: "Преміум" },
  "aiDemand.price.best": { de: "Optimal", it: "Best", en: "Best", fr: "Optimal", pl: "Najlepszy", tr: "En iyi", uk: "Найкраще" },
  
  "aiDemand.time.optimistic": { de: "Optimistisch", it: "Ottimista", en: "Optimistic", fr: "Optimiste", pl: "Optymistyczny", tr: "İyimser", uk: "Оптимістичний" },
  "aiDemand.time.realistic": { de: "Realistisch", it: "Realistico", en: "Realistic", fr: "Réaliste", pl: "Realistyczny", tr: "Gerçekçi", uk: "Реалістичний" },
  "aiDemand.time.pessimistic": { de: "Pessimistisch", it: "Pessimista", en: "Pessimistic", fr: "Pessimiste", pl: "Pesymistyczny", tr: "Kötümser", uk: "Песимістичний" },
  
  "aiDemand.bestTime": { de: "Bester Verkaufszeitpunkt", it: "Momento migliore per vendere", en: "Best time to sell", fr: "Meilleur moment pour vendre", pl: "Najlepszy czas na sprzedaż", tr: "Satış için en iyi zaman", uk: "Найкращий час для продажу" },
  "aiDemand.days": { de: "Tage", it: "Giorni", en: "Days", fr: "Jours", pl: "Dni", tr: "Günler", uk: "Дні" },
  "aiDemand.hours": { de: "Uhrzeiten", it: "Orari", en: "Hours", fr: "Heures", pl: "Godziny", tr: "Saatler", uk: "Години" },
  
  "aiDemand.marketTrend": { de: "Markttrend", it: "Trend di mercato", en: "Market trend", fr: "Tendance du marché", pl: "Trend rynkowy", tr: "Pazar trendi", uk: "Ринковий тренд" },
  "aiDemand.trend.rising": { de: "Steigend", it: "Crescente", en: "Rising", fr: "En hausse", pl: "Rosnący", tr: "Yükseliş", uk: "Зростаючий" },
  "aiDemand.trend.stable": { de: "Stabil", it: "Stabile", en: "Stable", fr: "Stable", pl: "Stabilny", tr: "Sabit", uk: "Стабільний" },
  "aiDemand.trend.falling": { de: "Fallend", it: "Decrescente", en: "Falling", fr: "En baisse", pl: "Spadający", tr: "Düşüş", uk: "Спадний" },
  "aiDemand.forecast3M": { de: "3-Monats-Prognose", it: "Previsione 3 mesi", en: "3-month forecast", fr: "Prévision 3 mois", pl: "Prognoza 3-miesięczna", tr: "3 aylık tahmin", uk: "Прогноз на 3 місяці" },
  
  "aiDemand.competition": { de: "Wettbewerbsanalyse", it: "Analisi competizione", en: "Competition analysis", fr: "Analyse de la concurrence", pl: "Analiza konkurencji", tr: "Rekabet analizi", uk: "Аналіз конкуренції" },
  "aiDemand.competition.high": { de: "Hoch", it: "Alta", en: "High", fr: "Élevée", pl: "Wysoka", tr: "Yüksek", uk: "Висока" },
  "aiDemand.competition.medium": { de: "Mittel", it: "Media", en: "Medium", fr: "Moyenne", pl: "Średnia", tr: "Orta", uk: "Середня" },
  "aiDemand.competition.low": { de: "Niedrig", it: "Bassa", en: "Low", fr: "Faible", pl: "Niska", tr: "Düşük", uk: "Низька" },
  "aiDemand.activeCompetitors": { de: "aktive Konkurrenten", it: "competitor attivi", en: "active competitors", fr: "concurrents actifs", pl: "aktywnych konkurentów", tr: "aktif rakip", uk: "активних конкурентів" },
  "aiDemand.howToDifferentiate": { de: "Wie differenzieren:", it: "Come differenziarti:", en: "How to differentiate:", fr: "Comment se différencier:", pl: "Jak się wyróżnić:", tr: "Nasıl farklılaşılır:", uk: "Як виділитись:" },
  
  "aiDemand.buyerProfile": { de: "Typisches Käuferprofil", it: "Profilo acquirente tipico", en: "Typical buyer profile", fr: "Profil d'acheteur typique", pl: "Typowy profil kupującego", tr: "Tipik alıcı profili", uk: "Типовий профіль покупця" },
  
  "aiDemand.opportunities": { de: "Chancen", it: "Opportunità", en: "Opportunities", fr: "Opportunités", pl: "Szanse", tr: "Fırsatlar", uk: "Можливості" },
  "aiDemand.risks": { de: "Risiken", it: "Rischi", en: "Risks", fr: "Risques", pl: "Ryzyko", tr: "Riskler", uk: "Ризики" },
  
  "aiDemand.stockManagement": { de: "Lagerverwaltung", it: "Gestione scorte", en: "Stock management", fr: "Gestion des stocks", pl: "Zarządzanie zapasami", tr: "Stok yönetimi", uk: "Управління запасами" },
  "aiDemand.optimalQuantity": { de: "Optimale Menge", it: "Quantità ottimale", en: "Optimal quantity", fr: "Quantité optimale", pl: "Optymalna ilość", tr: "Optimal miktar", uk: "Оптимальна кількість" },
  "aiDemand.restockTrigger": { de: "Wiederauffüllung bei", it: "Trigger rifornimento", en: "Restock trigger", fr: "Déclencheur réapprovisionnement", pl: "Wyzwalacz uzupełnienia", tr: "Yeniden stok tetikleyicisi", uk: "Тригер поповнення" },
  
  "aiDemand.complementary": { de: "Ergänzende Produkte", it: "Prodotti complementari", en: "Complementary products", fr: "Produits complémentaires", pl: "Produkty komplementarne", tr: "Tamamlayıcı ürünler", uk: "Комплементарні продукти" },
  "aiDemand.priceAlerts": { de: "Preisalarme empfohlen", it: "Alert prezzo consigliati", en: "Recommended price alerts", fr: "Alertes de prix recommandées", pl: "Zalecane alerty cenowe", tr: "Önerilen fiyat uyarıları", uk: "Рекомендовані цінові сповіщення" },
  
  "aiDemand.actionableInsights": { de: "Handlungsempfehlungen", it: "Azioni consigliate", en: "Actionable insights", fr: "Recommandations d'action", pl: "Zalecenia do działania", tr: "Eyleme dönüştürülebilir içgörüler", uk: "Рекомендації до дій" },
  "aiDemand.effort.easy": { de: "Einfach", it: "Facile", en: "Easy", fr: "Facile", pl: "Łatwe", tr: "Kolay", uk: "Легко" },
  "aiDemand.effort.medium": { de: "Mittel", it: "Medio", en: "Medium", fr: "Moyen", pl: "Średnie", tr: "Orta", uk: "Середньо" },
  "aiDemand.effort.hard": { de: "Schwierig", it: "Difficile", en: "Hard", fr: "Difficile", pl: "Trudne", tr: "Zor", uk: "Складно" },
  
  "aiDemand.confidence": { de: "Zuverlässigkeit", it: "Affidabilità", en: "Confidence", fr: "Fiabilité", pl: "Pewność", tr: "Güvenilirlik", uk: "Надійність" },
  "aiDemand.confidence.high": { de: "Hoch", it: "Alta", en: "High", fr: "Élevée", pl: "Wysoka", tr: "Yüksek", uk: "Висока" },
  "aiDemand.confidence.medium": { de: "Mittel", it: "Media", en: "Medium", fr: "Moyenne", pl: "Średnia", tr: "Orta", uk: "Середня" },
  "aiDemand.confidence.low": { de: "Niedrig", it: "Bassa", en: "Low", fr: "Faible", pl: "Niska", tr: "Düşük", uk: "Низька" },
  "aiDemand.basedOnDataPoints": { de: "Basierend auf {count} Datenpunkten", it: "Basato su {count} punti dati", en: "Based on {count} data points", fr: "Basé sur {count} points de données", pl: "Na podstawie {count} punktów danych", tr: "{count} veri noktasına dayalı", uk: "На основі {count} точок даних" },
  "aiDemand.updateAnalysis": { de: "Analyse aktualisieren", it: "Aggiorna analisi", en: "Update analysis", fr: "Mettre à jour l'analyse", pl: "Zaktualizuj analizę", tr: "Analizi güncelle", uk: "Оновити аналіз" },

  // User Settings
  "settings.title": { de: "Benutzereinstellungen", it: "Impostazioni Utente", en: "User Settings", fr: "Paramètres utilisateur", pl: "Ustawienia użytkownika", tr: "Kullanıcı Ayarları", uk: "Налаштування користувача" },
  "settings.subtitle": { de: "Personalisieren Sie Ihr Zazarap-Erlebnis", it: "Personalizza la tua esperienza Zazarap", en: "Customize your Zazarap experience", fr: "Personnalisez votre expérience Zazarap", pl: "Dostosuj swoje doświadczenie Zazarap", tr: "Zazarap deneyiminizi özelleştirin", uk: "Персоналізуйте свій досвід Zazarap" },
  
  "settings.tab.profile": { de: "Profil", it: "Profilo", en: "Profile", fr: "Profil", pl: "Profil", tr: "Profil", uk: "Профіль" },
  "settings.tab.language": { de: "Sprache", it: "Lingua", en: "Language", fr: "Langue", pl: "Język", tr: "Dil", uk: "Мова" },
  "settings.tab.notifications": { de: "Benachrichtigungen", it: "Notifiche", en: "Notifications", fr: "Notifications", pl: "Powiadomienia", tr: "Bildirimler", uk: "Сповіщення" },
  "settings.tab.email": { de: "E-Mail", it: "E-Mail", en: "Email", fr: "E-mail", pl: "E-mail", tr: "E-posta", uk: "Ел. пошта" },
  
  "settings.profile.title": { de: "Profilinformationen", it: "Informazioni Profilo", en: "Profile Information", fr: "Informations du profil", pl: "Informacje o profilu", tr: "Profil Bilgileri", uk: "Інформація профілю" },
  "settings.profile.desc": { de: "Aktualisieren Sie Ihre persönlichen Daten", it: "Aggiorna i tuoi dati personali", en: "Update your personal information", fr: "Mettez à jour vos informations personnelles", pl: "Zaktualizuj swoje dane osobowe", tr: "Kişisel bilgilerinizi güncelleyin", uk: "Оновіть свою особисту інформацію" },
  "settings.profile.firstName": { de: "Vorname", it: "Nome", en: "First Name", fr: "Prénom", pl: "Imię", tr: "Ad", uk: "Ім'я" },
  "settings.profile.firstNamePh": { de: "Max", it: "Mario", en: "John", fr: "Jean", pl: "Jan", tr: "Ahmet", uk: "Іван" },
  "settings.profile.lastName": { de: "Nachname", it: "Cognome", en: "Last Name", fr: "Nom", pl: "Nazwisko", tr: "Soyad", uk: "Прізвище" },
  "settings.profile.lastNamePh": { de: "Mustermann", it: "Rossi", en: "Doe", fr: "Dupont", pl: "Kowalski", tr: "Yılmaz", uk: "Петренко" },
  "settings.profile.email": { de: "E-Mail-Adresse", it: "Indirizzo E-Mail", en: "Email Address", fr: "Adresse e-mail", pl: "Adres e-mail", tr: "E-posta Adresi", uk: "Електронна адреса" },
  "settings.profile.emailNote": { de: "Die E-Mail-Adresse kann nicht geändert werden", it: "L'indirizzo email non può essere modificato", en: "Email address cannot be changed", fr: "L'adresse e-mail ne peut pas être modifiée", pl: "Adres e-mail nie może być zmieniony", tr: "E-posta adresi değiştirilemez", uk: "Електронну адресу не можна змінити" },
  "settings.profile.phone": { de: "Telefonnummer", it: "Numero di Telefono", en: "Phone Number", fr: "Numéro de téléphone", pl: "Numer telefonu", tr: "Telefon Numarası", uk: "Номер телефону" },
  "settings.profile.bio": { de: "Über mich", it: "Bio", en: "About Me", fr: "À propos de moi", pl: "O mnie", tr: "Hakkımda", uk: "Про себе" },
  "settings.profile.bioPh": { de: "Erzählen Sie etwas über sich...", it: "Racconta qualcosa su di te...", en: "Tell us about yourself...", fr: "Parlez-nous de vous...", pl: "Opowiedz nam o sobie...", tr: "Kendinizden bahsedin...", uk: "Розкажіть про себе..." },
  
  "settings.lang.title": { de: "Spracheinstellungen", it: "Impostazioni Lingua", en: "Language Settings", fr: "Paramètres de langue", pl: "Ustawienia języka", tr: "Dil Ayarları", uk: "Налаштування мови" },
  "settings.lang.desc": { de: "Wählen Sie Ihre bevorzugte Sprache", it: "Scegli la tua lingua preferita", en: "Choose your preferred language", fr: "Choisissez votre langue préférée", pl: "Wybierz preferowany język", tr: "Tercih ettiğiniz dili seçin", uk: "Виберіть бажану мову" },
  "settings.lang.select": { de: "Sprache auswählen", it: "Seleziona lingua", en: "Select language", fr: "Sélectionner la langue", pl: "Wybierz język", tr: "Dil seçin", uk: "Вибрати мову" },
  "settings.lang.infoTitle": { de: "Spracheinstellungen gespeichert", it: "Impostazioni lingua salvate", en: "Language settings saved", fr: "Paramètres de langue enregistrés", pl: "Ustawienia języka zapisane", tr: "Dil ayarları kaydedildi", uk: "Налаштування мови збережено" },
  "settings.lang.infoDesc": { de: "Ihre Spracheinstellung wird auf allen Geräten synchronisiert", it: "Le tue impostazioni lingua saranno sincronizzate su tutti i dispositivi", en: "Your language settings will sync across all devices", fr: "Vos paramètres de langue seront synchronisés sur tous les appareils", pl: "Twoje ustawienia języka będą synchronizowane na wszystkich urządzeniach", tr: "Dil ayarlarınız tüm cihazlarda senkronize edilecektir", uk: "Ваші налаштування мови синхронізуються на всіх пристроях" },
  
  "settings.notif.title": { de: "Benachrichtigungen", it: "Notifiche", en: "Notifications", fr: "Notifications", pl: "Powiadomienia", tr: "Bildirimler", uk: "Сповіщення" },
  "settings.notif.desc": { de: "Verwalten Sie, wie Sie Updates erhalten", it: "Gestisci come ricevi gli aggiornamenti", en: "Manage how you receive updates", fr: "Gérez comment vous recevez les mises à jour", pl: "Zarządzaj sposobem otrzymywania aktualizacji", tr: "Güncellemeleri nasıl alacağınızı yönetin", uk: "Керуйте отриманням оновлень" },
  "settings.notif.newOffer": { de: "Neue Angebote auf Favoriten", it: "Nuove offerte sui preferiti", en: "New offers on favorites", fr: "Nouvelles offres sur favoris", pl: "Nowe oferty na ulubionych", tr: "Favorilerde yeni teklifler", uk: "Нові пропозиції на улюблених" },
  "settings.notif.newOfferDesc": { de: "Benachrichtigung, wenn jemand ein Angebot für gespeicherte Anzeigen macht", it: "Notifica quando qualcuno fa un'offerta su annunci salvati", en: "Notification when someone makes an offer on saved listings", fr: "Notification lorsque quelqu'un fait une offre sur annonces sauvegardées", pl: "Powiadomienie gdy ktoś złoży ofertę na zapisane ogłoszenia", tr: "Birisi kayıtlı ilanlara teklif verdiğinde bildirim", uk: "Сповіщення коли хтось робить пропозицію на збережені оголошення" },
  "settings.notif.messageReplies": { de: "Nachrichtenantworten", it: "Risposte ai messaggi", en: "Message replies", fr: "Réponses aux messages", pl: "Odpowiedzi na wiadomości", tr: "Mesaj yanıtları", uk: "Відповіді на повідомлення" },
  "settings.notif.messageRepliesDesc": { de: "Benachrichtigung, wenn jemand auf Ihre Nachrichten antwortet", it: "Notifica quando qualcuno risponde ai tuoi messaggi", en: "Notification when someone replies to your messages", fr: "Notification lorsque quelqu'un répond à vos messages", pl: "Powiadomienie gdy ktoś odpowie na Twoje wiadomości", tr: "Birisi mesajlarınıza yanıt verdiğinde bildirim", uk: "Сповіщення коли хтось відповідає на ваші повідомлення" },
  "settings.notif.statusUpdates": { de: "Statusaktualisierungen", it: "Aggiornamenti stato", en: "Status updates", fr: "Mises à jour de statut", pl: "Aktualizacje statusu", tr: "Durum güncellemeleri", uk: "Оновлення статусу" },
  "settings.notif.statusUpdatesDesc": { de: "Benachrichtigung für Statusänderungen bei aktiven Verhandlungen", it: "Notifica per cambiamenti di stato nelle trattative attive", en: "Notification for status changes in active negotiations", fr: "Notification pour changements de statut dans négociations actives", pl: "Powiadomienie o zmianach statusu w aktywnych negocjacjach", tr: "Aktif müzakerelerdeki durum değişiklikleri için bildirim", uk: "Сповіщення про зміни статусу в активних переговорах" },
  "settings.notif.purchase": { de: "Kaufbestätigungen", it: "Conferme acquisti", en: "Purchase confirmations", fr: "Confirmations d'achat", pl: "Potwierdzenia zakupów", tr: "Satın alma onayları", uk: "Підтвердження покупок" },
  "settings.notif.purchaseDesc": { de: "Benachrichtigung für erfolgreiche Käufe und Transaktionen", it: "Notifica per acquisti e transazioni riuscite", en: "Notification for successful purchases and transactions", fr: "Notification pour achats et transactions réussis", pl: "Powiadomienie o udanych zakupach i transakcjach", tr: "Başarılı satın almalar ve işlemler için bildirim", uk: "Сповіщення про успішні покупки та транзакції" },
  "settings.notif.shipping": { de: "Versandinformationen", it: "Informazioni spedizione", en: "Shipping information", fr: "Informations d'expédition", pl: "Informacje o wysyłce", tr: "Gönderim bilgileri", uk: "Інформація про доставку" },
  "settings.notif.shippingDesc": { de: "Benachrichtigung über Versandstatus und Lieferaktualisierungen", it: "Notifica su stato spedizione e aggiornamenti consegna", en: "Notification about shipping status and delivery updates", fr: "Notification sur état expédition et mises à jour livraison", pl: "Powiadomienie o statusie wysyłki i aktualizacjach dostawy", tr: "Gönderim durumu ve teslimat güncellemeleri hakkında bildirim", uk: "Сповіщення про статус доставки та оновлення" },
  "settings.notif.priceDrop": { de: "Preissenkungen", it: "Riduzioni prezzo", en: "Price drops", fr: "Baisses de prix", pl: "Obniżki cen", tr: "Fiyat düşüşleri", uk: "Зниження цін" },
  "settings.notif.priceDropDesc": { de: "Benachrichtigung, wenn beobachtete Artikel günstiger werden", it: "Notifica quando gli articoli osservati diventano più economici", en: "Notification when watched items become cheaper", fr: "Notification lorsque les articles surveillés deviennent moins chers", pl: "Powiadomienie gdy obserwowane przedmioty stają się tańsze", tr: "İzlenen öğeler ucuzladığında bildirim", uk: "Сповіщення коли відстежувані товари дешевшають" },
  
  "settings.email.title": { de: "E-Mail-Einstellungen", it: "Impostazioni E-Mail", en: "Email Settings", fr: "Paramètres e-mail", pl: "Ustawienia e-mail", tr: "E-posta Ayarları", uk: "Налаштування ел. пошти" },
  "settings.email.desc": { de: "Verwalten Sie Ihre E-Mail-Benachrichtigungen", it: "Gestisci le tue notifiche email", en: "Manage your email notifications", fr: "Gérez vos notifications par e-mail", pl: "Zarządzaj powiadomieniami e-mail", tr: "E-posta bildirimlerinizi yönetin", uk: "Керуйте сповіщеннями ел. пошти" },
  "settings.email.notifications": { de: "E-Mail-Benachrichtigungen", it: "Notifiche E-Mail", en: "Email Notifications", fr: "Notifications par e-mail", pl: "Powiadomienia e-mail", tr: "E-posta Bildirimleri", uk: "Сповіщення ел. поштою" },
  "settings.email.notificationsDesc": { de: "Benachrichtigungen auch per E-Mail erhalten", it: "Ricevi notifiche anche via email", en: "Receive notifications via email", fr: "Recevoir aussi notifications par e-mail", pl: "Otrzymuj powiadomienia e-mailem", tr: "Bildirimleri e-posta ile de alın", uk: "Отримувати сповіщення ел. поштою" },
  "settings.email.note": { de: "Hinweis", it: "Nota", en: "Note", fr: "Remarque", pl: "Uwaga", tr: "Not", uk: "Примітка" },
  "settings.email.noteDesc": { de: "Wichtige Transaktionsbenachrichtigungen werden immer gesendet, unabhängig von Ihren Einstellungen", it: "Le notifiche transazionali importanti verranno sempre inviate indipendentemente dalle tue impostazioni", en: "Important transactional notifications will always be sent regardless of your settings", fr: "Les notifications transactionnelles importantes seront toujours envoyées quelle que soit votre configuration", pl: "Ważne powiadomienia transakcyjne będą zawsze wysyłane niezależnie od ustawień", tr: "Önemli işlem bildirimleri ayarlarınızdan bağımsız olarak her zaman gönderilecektir", uk: "Важливі транзакційні сповіщення завжди надсилаються незалежно від налаштувань" },
  
  "settings.saving": { de: "Wird gespeichert...", it: "Salvataggio...", en: "Saving...", fr: "Enregistrement...", pl: "Zapisywanie...", tr: "Kaydediliyor...", uk: "Збереження..." },
  "settings.saveChanges": { de: "Änderungen speichern", it: "Salva modifiche", en: "Save changes", fr: "Enregistrer les modifications", pl: "Zapisz zmiany", tr: "Değişiklikleri kaydet", uk: "Зберегти зміни" },
  "settings.profileUpdated": { de: "Profil aktualisiert", it: "Profilo aggiornato", en: "Profile updated", fr: "Profil mis à jour", pl: "Profil zaktualizowany", tr: "Profil güncellendi", uk: "Профіль оновлено" },
  "settings.profileError": { de: "Fehler beim Aktualisieren des Profils", it: "Errore nell'aggiornamento del profilo", en: "Error updating profile", fr: "Erreur de mise à jour du profil", pl: "Błąd aktualizacji profilu", tr: "Profil güncellenirken hata", uk: "Помилка оновлення профілю" },
  "settings.notifUpdated": { de: "Benachrichtigungseinstellungen aktualisiert", it: "Impostazioni notifiche aggiornate", en: "Notification settings updated", fr: "Paramètres de notification mis à jour", pl: "Ustawienia powiadomień zaktualizowane", tr: "Bildirim ayarları güncellendi", uk: "Налаштування сповіщень оновлено" },
  "settings.notifError": { de: "Fehler beim Aktualisieren der Einstellungen", it: "Errore nell'aggiornamento delle impostazioni", en: "Error updating settings", fr: "Erreur de mise à jour des paramètres", pl: "Błąd aktualizacji ustawień", tr: "Ayarlar güncellenirken hata", uk: "Помилка оновлення налаштувань" },
  "settings.langChanged": { de: "Sprache geändert", it: "Lingua cambiata", en: "Language changed", fr: "Langue modifiée", pl: "Język zmieniony", tr: "Dil değiştirildi", uk: "Мову змінено" },

  "notificationSettings.email.title": { de: "E-Mail-Benachrichtigungen", it: "Notifiche email", en: "Email notifications", fr: "Notifications par email", pl: "Powiadomienia e-mail", tr: "E-posta bildirimleri", uk: "Сповіщення електронною поштою" },
  "notificationSettings.email.desc": { de: "Benachrichtigungen auch per E-Mail erhalten", it: "Ricevi una copia delle notifiche anche via email", en: "Receive notifications via email as well", fr: "Recevoir également des notifications par email", pl: "Otrzymuj powiadomienia również e-mailem", tr: "Bildirimleri e-posta ile de alın", uk: "Отримувати сповіщення також електронною поштою" },

  "notificationSettings.howItWorks.title": { de: "Wie funktionieren die Benachrichtigungen?", it: "Come funzionano le notifiche?", en: "How do notifications work?", fr: "Comment fonctionnent les notifications?", pl: "Jak działają powiadomienia?", tr: "Bildirimler nasıl çalışır?", uk: "Як працюють сповіщення?" },
  "notificationSettings.howItWorks.inApp": { de: "In-App-Benachrichtigungen erscheinen im Glockensymbol oben", it: "Le notifiche in-app appaiono nell'icona campanella in alto", en: "In-app notifications appear in the bell icon at the top", fr: "Les notifications in-app apparaissent dans l'icône cloche en haut", pl: "Powiadomienia w aplikacji pojawiają się w ikonie dzwonka u góry", tr: "Uygulama içi bildirimler üstteki zil simgesinde görünür", uk: "Сповіщення в додатку з'являються в іконці дзвоника вгорі" },
  "notificationSettings.howItWorks.email": { de: "E-Mail-Benachrichtigungen werden nur bei Aktivierung gesendet", it: "Le notifiche email vengono inviate solo se abilitate", en: "Email notifications are only sent when enabled", fr: "Les notifications par email ne sont envoyées que si elles sont activées", pl: "Powiadomienia e-mail są wysyłane tylko gdy włączone", tr: "E-posta bildirimleri yalnızca etkinleştirildiğinde gönderilir", uk: "Сповіщення електронною поштою надсилаються лише коли увімкнено" },
  "notificationSettings.howItWorks.change": { de: "Sie können diese Einstellungen jederzeit ändern", it: "Puoi modificare queste preferenze in qualsiasi momento", en: "You can change these settings at any time", fr: "Vous pouvez modifier ces paramètres à tout moment", pl: "Możesz zmienić te ustawienia w dowolnym momencie", tr: "Bu ayarları istediğiniz zaman değiştirebilirsiniz", uk: "Ви можете змінити ці налаштування в будь-який час" },

  // New Listing
  "newListing.offerPrice": { de: "Angebotspreis (€) — optional", it: "Prezzo in offerta (€) — opzionale", en: "Offer price (€) — optional", fr: "Prix en promotion (€) — optionnel", pl: "Cena promocyjna (€) — opcjonalnie", tr: "İndirimli fiyat (€) — opsiyonel", uk: "Ціна зі знижкою (€) — опціонально" },
  "newListing.expiresAt": { de: "Ablaufdatum und -zeit — optional", it: "Data e ora di scadenza — opzionale", en: "Expiry date and time — optional", fr: "Date et heure d'expiration — optionnel", pl: "Data i godzina wygaśnięcia — opcjonalnie", tr: "Son kullanma tarihi ve saati — opsiyonel", uk: "Дата та час закінчення — опціонально" },
  "newListing.requiredFields": { de: "Bitte füllen Sie alle Pflichtfelder aus", it: "Compila tutti i campi obbligatori", en: "Please fill in all required fields", fr: "Veuillez remplir tous les champs obligatoires", pl: "Wypełnij wszystkie wymagane pola", tr: "Lütfen tüm gerekli alanları doldurun", uk: "Будь ласка, заповніть усі обов'язкові поля" },
  "newListing.successToast": { de: "Anzeige zur Moderation eingereicht! Wird nach Prüfung veröffentlicht.", it: "Annuncio inviato per moderazione! Sarà pubblicato dopo la revisione.", en: "Listing submitted for moderation! Will be published after review.", fr: "Annonce soumise à modération! Sera publiée après examen.", pl: "Ogłoszenie przesłane do moderacji! Zostanie opublikowane po sprawdzeniu.", tr: "İlan moderasyona gönderildi! İnceleme sonrası yayınlanacak.", uk: "Оголошення надіслано на модерацію! Буде опубліковано після перевірки." },
  "newListing.errorToast": { de: "Fehler beim Veröffentlichen der Anzeige", it: "Errore nella pubblicazione dell'annuncio", en: "Error publishing listing", fr: "Erreur lors de la publication de l'annonce", pl: "Błąd podczas publikacji ogłoszenia", tr: "İlan yayınlanırken hata oluştu", uk: "Помилка при публікації оголошення" },
  "newListing.promoOptions": { de: "Werbeoptionen", it: "Opzioni pubblicitarie", en: "Promotion options", fr: "Options de promotion", pl: "Opcje promocji", tr: "Tanıtım seçenekleri", uk: "Параметри промоції" },
  "newListing.promoNone": { de: "Keine", it: "Nessuna", en: "None", fr: "Aucune", pl: "Brak", tr: "Yok", uk: "Немає" },
  "newListing.promoFeatured": { de: "Hervorgehobene Anzeige", it: "Annuncio in evidenza", en: "Featured listing", fr: "Annonce mise en avant", pl: "Wyróżnione ogłoszenie", tr: "Öne çıkan ilan", uk: "Виділене оголошення" },
  "newListing.promoTop": { de: "Top-Anzeige", it: "Annuncio TOP", en: "TOP listing", fr: "Annonce TOP", pl: "Ogłoszenie TOP", tr: "TOP ilan", uk: "TOP-оголошення" },
  "newListing.perDay": { de: "pro Tag", it: "al giorno", en: "per day", fr: "par jour", pl: "dziennie", tr: "günlük", uk: "на день" },
  "newListing.perWeek": { de: "pro Woche", it: "a settimana", en: "per week", fr: "par semaine", pl: "tygodniowo", tr: "haftalık", uk: "на тиждень" },

  // Listing Types
  "listingType": { de: "Angebotsart", it: "Tipo di offerta", en: "Listing type", fr: "Type d'offre", pl: "Rodzaj oferty", tr: "İlan türü", uk: "Тип пропозиції" },
  "allListingTypes": { de: "Alle Angebotsarten", it: "Tutti i tipi", en: "All types", fr: "Tous les types", pl: "Wszystkie typy", tr: "Tüm türler", uk: "Всі типи" },
  "listingType.fixed": { de: "Festpreis", it: "Prezzo fisso", en: "Fixed price", fr: "Prix fixe", pl: "Cena stała", tr: "Sabit fiyat", uk: "Фіксована ціна" },
  "listingType.negotiable": { de: "Verhandlungsbasis", it: "Trattabile", en: "Negotiable", fr: "Négociable", pl: "Do negocjacji", tr: "Pazarlık yapılır", uk: "Обговорюється" },
  "listingType.auction": { de: "Auktion", it: "Asta", en: "Auction", fr: "Enchères", pl: "Aukcja", tr: "Müzayede", uk: "Аукціон" },
  "ads.modal.select.title": { de: "{pkg} • {days} Tage • €{price}", it: "{pkg} • {days} giorni • €{price}", en: "{pkg} • {days} days • €{price}", fr: "{pkg} • {days} jours • €{price}", pl: "{pkg} • {days} dni • €{price}", tr: "{pkg} • {days} gün • €{price}", uk: "{pkg} • {days} днів • €{price}" },
  "ads.modal.select.chooseListing": { de: "Anzeige auswählen", it: "Seleziona annuncio", en: "Select listing", fr: "Sélectionner l'annonce", pl: "Wybierz ogłoszenie", tr: "İlan seçin", uk: "Виберіть оголошення" },
  "ads.modal.select.placeholder": { de: "Wähle die Anzeige zur Promotion", it: "Scegli l'annuncio da promuovere", en: "Choose the listing to promote", fr: "Choisissez l'annonce à promouvoir", pl: "Wybierz ogłoszenie do promocji", tr: "Tanıtılacak ilanı seçin", uk: "Виберіть оголошення для просування" },
  "ads.modal.select.noListings": { de: "Keine aktiven Anzeigen. Erstelle eine neue Anzeige und versuche erneut.", it: "Non hai annunci attivi. Crea un nuovo annuncio e riprova.", en: "You have no active listings. Create a new one and try again.", fr: "Aucune annonce active.", pl: "Brak aktywnych ogłoszeń.", tr: "Aktif ilan yok.", uk: "Немає активних оголошень." },
  "ads.modal.select.activate": { de: "Aktivieren", it: "Attiva", en: "Activate", fr: "Activer", pl: "Aktywuj", tr: "Aktifleştir", uk: "Активувати" },
  "ads.modal.request.title": { de: "Anfrage: {pkg} • {price}", it: "Richiesta: {pkg} • {price}", en: "Request: {pkg} • {price}", fr: "Demande : {pkg} • {price}", pl: "Zapytanie: {pkg} • {price}", tr: "Talep: {pkg} • {price}", uk: "Запит: {pkg} • {price}" },
  "ads.modal.request.desc": { de: "Geben Sie ggf. Details an (Zeitraum, Zielgruppe, Zielseite, etc.). Wir melden uns umgehend.", it: "Inserisci eventuali dettagli (periodo, target, pagina di destinazione, ecc.). Ti risponderemo al più presto.", en: "Add details if any (period, target, landing page, etc.). We'll get back to you soon.", fr: "Ajoutez des détails si nécessaire (période, cible, page de destination, etc.).", pl: "Dodaj szczegóły (okres, target, landing page itp.).", tr: "Gerekirse detay ekleyin (dönem, hedef, açılış sayfası vb.).", uk: "Додайте деталі (період, ціль, лендинг тощо)." },
  "ads.modal.request.placeholder": { de: "Details der Anfrage", it: "Dettagli richiesta", en: "Request details", fr: "Détails de la demande", pl: "Szczegóły zapytania", tr: "Talep detayları", uk: "Деталі запиту" },
  "ads.modal.request.submit": { de: "Anfrage senden", it: "Invia richiesta", en: "Send request", fr: "Envoyer la demande", pl: "Wyślij zapytanie", tr: "Talep gönder", uk: "Надіслати запит" },

  "home.heroTitle": { de: "Finde, was du suchst – mit Zazarap", it: "Trova quello che cerchi con Zazarap", en: "Find what you need with Zazarap", uk: "Знайди те, що шукаєш, з Zazarap", tr: "Aradığını Zazarap ile bul", fr: "Trouvez ce dont vous avez besoin avec Zazarap", pl: "Znajdź to, czego szukasz z Zazarap" },
  "home.heroSubtitle": { de: "Durchsuche Tausende von Kleinanzeigen in ganz Deutschland – sicher und schnell.", it: "Cerca tra migliaia di annunci in tutta la Germania – in modo sicuro e veloce.", en: "Browse thousands of classifieds across Germany – safely and quickly.", uk: "Переглядай тисячі оголошень по всій Німеччині – швидко та безпечно.", tr: "Tüm Almanya'daki binlerce ilanı güvenli ve hızlı bir şekilde keşfet.", fr: "Parcourez des milliers d'annonces partout en Allemagne – rapidement et en toute sécurité.", pl: "Przeglądaj tysiące ogłoszeń w całych Niemczech – szybko i bezpiecznie." },
  "home.hero.title": { de: "Finde, was du suchst – mit Zazarap", it: "Trova quello che cerchi con Zazarap", en: "Find what you need with Zazarap", uk: "Знайди те, що шукаєш, з Zazarap", tr: "Aradığını Zazarap ile bul", fr: "Trouvez ce dont vous avez besoin avec Zazarap", pl: "Znajdź to, czego szukasz z Zazarap" },
  "home.hero.subtitle": { de: "Durchsuche Tausende von Kleinanzeigen in ganz Deutschland – sicher und schnell.", it: "Cerca tra migliaia di annunci in tutta la Germania – in modo sicuro e veloce.", en: "Browse thousands of classifieds across Germany – safely and quickly.", uk: "Переглядай тисячі оголошень по всій Німеччині – швидко та безпечно.", tr: "Tüm Almanya'daki binlerce ilanı güvenli ve hızlı bir şekilde keşfet.", fr: "Parcourez des milliers d'annonces partout en Allemagne – rapidement et en toute sécurité.", pl: "Przeglądaj tysiące ogłoszeń w całych Niemczech – szybko i bezpiecznie." },
  
  // Search
  "home.search.what": { de: "Was suchst du?", it: "Cosa cerchi?", en: "What are you looking for?", uk: "Що ти шукаєш?", tr: "Ne arıyorsun?", fr: "Que cherchez-vous ?", pl: "Czego szukasz?" },
  "home.search.placeholderWhat": { de: "Auto, Wohnung, Smartphone, Fahrrad …", it: "Auto, casa, smartphone, bicicletta…", en: "Car, flat, smartphone, bike…", uk: "Авто, квартира, смартфон, велосипед…", tr: "Araba, daire, telefon, bisiklet…", fr: "Voiture, appartement, smartphone, vélo…", pl: "Samochód, mieszkanie, telefon, rower…" },
  "home.search.placeholder.query": { de: "Auto, Wohnung, Smartphone, Fahrrad …", it: "Auto, casa, smartphone, bicicletta…", en: "Car, flat, smartphone, bike…", uk: "Авто, квартира, смартфон, велосипед…", tr: "Araba, daire, telefon, bisiklet…", fr: "Voiture, appartement, smartphone, vélo…", pl: "Samochód, mieszkanie, telefon, rower…" },
  "home.search.placeholder.location": { de: "Ganz Deutschland", it: "Tutta la Germania", en: "All of Germany", uk: "Вся Німеччина", tr: "Tüm Almanya", fr: "Toute l'Allemagne", pl: "Całe Niemcy" },
  "home.search.button": { de: "Suchen", it: "Cerca", en: "Search", uk: "Пошук", tr: "Ara", fr: "Rechercher", pl: "Szukaj" },
  
  // Sections
  "home.section.categories": { de: "Kategorien entdecken", it: "Scopri le categorie", en: "Discover categories", uk: "Переглянути категорії", tr: "Kategorileri keşfet", fr: "Découvrir les catégories", pl: "Odkryj kategorie" },
  "home.section.focusAds": { de: "Anzeigen im Fokus", it: "Annunci in evidenza", en: "Featured ads", uk: "Оголошення у фокусі", tr: "Öne çıkan ilanlar", fr: "Annonces à la une", pl: "Oferty wyróżnione" },
  "home.section.discoverMore": { de: "Mehr auf Zazarap entdecken", it: "Scopri di più su Zazarap", en: "Discover more on Zazarap", uk: "Відкрий більше на Zazarap", tr: "Zazarap'ta daha fazlasını keşfet", fr: "Découvrez-en plus sur Zazarap", pl: "Odkryj więcej na Zazarap" },
  
  // Footer
  "footer.about": { de: "Über uns", it: "Chi siamo", en: "About us", uk: "Про нас", tr: "Hakkımızda", fr: "À propos", pl: "O nas" },
  "footer.contact": { de: "Kontakt", it: "Contatti", en: "Contact", uk: "Контакти", tr: "İletişim", fr: "Contact", pl: "Kontakt" },
  "footer.legal": { de: "Rechtliches", it: "Note legali", en: "Legal", uk: "Правова інформація", tr: "Yasal bilgiler", fr: "Mentions légales", pl: "Informacje prawne" },
  "footer.privacy": { de: "Datenschutz", it: "Privacy", en: "Privacy policy", uk: "Політика конфіденційності", tr: "Gizlilik politikası", fr: "Politique de confidentialité", pl: "Polityka prywatności" },
  "footer.terms": { de: "AGB", it: "Termini e condizioni", en: "Terms & conditions", uk: "Умови користування", tr: "Kullanım şartları", fr: "Conditions générales", pl: "Regulamin" },
  "footer.imprint": { de: "Impressum", it: "Impressum", en: "Imprint", uk: "Impressum", tr: "Künye", fr: "Impressum", pl: "Impressum" },
  
  // Settings (AdminSettings)
  "settings.platformConfigTitle": { de: "Plattformkonfiguration", it: "Configurazione Piattaforma", en: "Platform Configuration", fr: "Configuration de la plateforme", pl: "Konfiguracja platformy", tr: "Platform Yapılandırması", uk: "Налаштування платформи" },
  "settings.necessaryConfig": { de: "Erforderliche Konfiguration", it: "Configurazione Necessaria", en: "Necessary Configuration", fr: "Configuration nécessaire", pl: "Wymagana konfiguracja", tr: "Gerekli Yapılandırma", uk: "Необхідне налаштування" },
  "settings.necessaryConfigDesc": { de: "Um den Marktplatz produktiv zu nutzen, vervollständige die Integrationen. Öffne Base44 → Settings und füge die Secrets ein.", it: "Per utilizzare il marketplace in produzione, completa le integrazioni. Vai in Base44 → Settings e inserisci i secrets.", en: "To use the marketplace in production, complete the integrations. Go to Base44 → Settings and add the secrets.", fr: "Pour utiliser la marketplace en production, complétez les intégrations. Allez dans Base44 → Settings et ajoutez les secrets.", pl: "Aby używać marketplace w produkcji, uzupełnij integracje. Przejdź do Base44 → Settings i dodaj sekrety.", tr: "Pazaryerini prodüksiyonda kullanmak için entegrasyonları tamamlayın. Base44 → Settings'e gidip gizli anahtarları ekleyin.", uk: "Щоб використовувати маркетплейс у продакшн, завершіть інтеграції. Перейдіть у Base44 → Settings і додайте секрети." },
  "settings.required": { de: "erforderlich", it: "required", en: "required", fr: "requis", pl: "wymagane", tr: "gerekli", uk: "обов'язково" },
  "settings.recommended": { de: "empfohlen", it: "recommended", en: "recommended", fr: "recommandé", pl: "zalecane", tr: "önerilen", uk: "рекомендовано" },
  "settings.categoryManagementTitle": { de: "Kategorienverwaltung", it: "Gestione Categorie", en: "Category Management", fr: "Gestion des catégories", pl: "Zarządzanie kategoriami", tr: "Kategori Yönetimi", uk: "Керування категоріями" },
  "settings.categoryResetWarning": { de: "Achtung: Diese Aktion löscht alle vorhandenen Kategorien und ersetzt sie mit der Standardstruktur (Motoren, Markt, Immobilien, Arbeit). Vorhandene Produkte könnten ihre Kategoriezuordnung verlieren.", it: "Attenzione: questa azione cancellerà tutte le categorie esistenti e le sostituirà con la struttura predefinita (Motoren, Markt, Immobilien, Arbeit). I prodotti esistenti potrebbero perdere la loro associazione di categoria.", en: "Warning: this will delete all existing categories and replace them with the default structure (Motoren, Markt, Immobilien, Arbeit). Existing products may lose their category mapping.", fr: "Attention : ceci supprimera toutes les catégories existantes et les remplacera par la structure par défaut (Motoren, Markt, Immobilien, Arbeit). Les produits existants peuvent perdre leur association de catégorie.", pl: "Uwaga: działanie usunie wszystkie kategorie i zastąpi je domyślną strukturą (Motoren, Markt, Immobilien, Arbeit). Istniejące produkty mogą utracić powiązanie kategorii.", tr: "Uyarı: Bu işlem tüm mevcut kategorileri siler ve varsayılan yapı ile değiştirir (Motoren, Markt, Immobilien, Arbeit). Mevcut ürünler kategori eşleşmesini kaybedebilir.", uk: "Увага: ця дія видалить усі категорії та замінить їх стандартною структурою (Motoren, Markt, Immobilien, Arbeit). Існуючі товари можуть втратити прив'язку категорій." },
  "settings.resetCategoriesConfirm": { de: "Tatsächlich alle Kategorien zurücksetzen?", it: "Sei sicuro di voler resettare tutte le categorie?", en: "Are you sure you want to reset all categories?", fr: "Êtes-vous sûr de réinitialiser toutes les catégories ?", pl: "Czy na pewno zresetować wszystkie kategorie?", tr: "Tüm kategorileri sıfırlamak istediğinizden emin misiniz?", uk: "Ви впевнені, що хочете скинути всі категорії?" },
  "settings.resettingCategories": { de: "Kategorien werden zurückgesetzt...", it: "Reimpostazione categorie...", en: "Resetting categories...", fr: "Réinitialisation des catégories...", pl: "Resetowanie kategorii...", tr: "Kategoriler sıfırlanıyor...", uk: "Скидання категорій..." },
  "settings.categoriesResetSuccess": { de: "Kategorien erfolgreich zurückgesetzt", it: "Categorie resettate con successo", en: "Categories reset successfully", fr: "Catégories réinitialisées avec succès", pl: "Kategorie pomyślnie zresetowane", tr: "Kategoriler başarıyla sıfırlandı", uk: "Категорії успішно скинуто" },
  "settings.categoriesResetError": { de: "Errore durante il reset:", it: "Errore durante il reset:", en: "Error during reset:", fr: "Erreur lors de la réinitialisation:", pl: "Błąd podczas resetu:", tr: "Sıfırlama sırasında hata:", uk: "Помилка під час скидання:" },
  "settings.resetCategoriesButton": { de: "Standardkategorien zurücksetzen (Deutsch)", it: "Reset Categorie Default (Tedesco)", en: "Reset Default Categories (German)", fr: "Réinitialiser catégories par défaut (Allemand)", pl: "Resetuj domyślne kategorie (Niemieckie)", tr: "Varsayılan Kategorileri Sıfırla (Almanca)", uk: "Скинути категорії за замовчуванням (німецькі)" },
  "settings.integrations.paypal.description": { de: "Zahlungs- und Treuhand-Integration", it: "Integrazione pagamenti e escrow", en: "Payments and escrow integration", fr: "Intégration paiements et séquestre", pl: "Integracja płatności i escrow", tr: "Ödemeler ve emanet entegrasyonu", uk: "Інтеграція платежів та ескроу" },
  "settings.integrations.ga.description": { de: "Benutzer- und Conversion-Tracking", it: "Tracciamento utenti e conversioni", en: "User and conversion tracking", fr: "Suivi des utilisateurs et conversions", pl: "Śledzenie użytkowników i konwersji", tr: "Kullanıcı ve dönüşüm takibi", uk: "Відстеження користувачів і конверсій" },
  "settings.paypal.clientId": { de: "Client ID", it: "Client ID", en: "Client ID", fr: "Client ID", pl: "Client ID", tr: "Client ID", uk: "Client ID" },
  "settings.paypal.clientSecret": { de: "Client Secret", it: "Client Secret", en: "Client Secret", fr: "Client Secret", pl: "Client Secret", tr: "Client Secret", uk: "Client Secret" },
  "settings.paypal.webhookId": { de: "Webhook ID", it: "Webhook ID", en: "Webhook ID", fr: "Webhook ID", pl: "Webhook ID", tr: "Webhook ID", uk: "Webhook ID" },
  "settings.ga.measurementId": { de: "Measurement ID", it: "Measurement ID", en: "Measurement ID", fr: "Measurement ID", pl: "Measurement ID", tr: "Measurement ID", uk: "Measurement ID" },
  "settings.secretKeyLabel": { de: "Secret Key", it: "Secret Key", en: "Secret Key", fr: "Secret Key", pl: "Secret Key", tr: "Secret Key", uk: "Secret Key" },
  "settings.configureSecretHint": { de: "Konfiguriere diesen Secret im Base44-Panel → Settings → Secrets", it: "Configura questo secret nel pannello Base44 → Settings → Secrets", en: "Configure this secret in Base44 → Settings → Secrets", fr: "Configurez ce secret dans Base44 → Settings → Secrets", pl: "Skonfiguruj ten sekret w Base44 → Settings → Secrets", tr: "Bu gizli anahtarı Base44 → Settings → Secrets altında yapılandırın", uk: "Налаштуйте цей секрет у Base44 → Settings → Secrets" },
  "settings.documentation": { de: "Dokumentation", it: "Documentazione", en: "Documentation", fr: "Documentation", pl: "Dokumentacja", tr: "Dokümantasyon", uk: "Документація" },
  "settings.paypal.quickGuideTitle": { de: "Schnellstart: PayPal Setup", it: "Guida Rapida: PayPal Setup", en: "Quick Guide: PayPal Setup", fr: "Guide rapide : Configuration PayPal", pl: "Szybki start: Konfiguracja PayPal", tr: "Hızlı Başlangıç: PayPal Kurulumu", uk: "Швидкий старт: Налаштування PayPal" },
  "settings.paypal.step1": { de: "Gehe zum", it: "Vai su", en: "Go to", fr: "Allez sur", pl: "Przejdź do", tr: "Şuraya gidin:", uk: "Перейдіть на" },
  "settings.paypal.step2": { de: "Erstelle eine neue App (Apps & Credentials → Create App)", it: "Crea una nuova app (Apps & Credentials → Create App)", en: "Create a new app (Apps & Credentials → Create App)", fr: "Créez une nouvelle app (Apps & Credentials → Create App)", pl: "Utwórz nową aplikację (Apps & Credentials → Create App)", tr: "Yeni bir uygulama oluşturun (Apps & Credentials → Create App)", uk: "Створіть новий застосунок (Apps & Credentials → Create App)" },
  "settings.paypal.step3": { de: "Kopiere Client ID und Client Secret", it: "Copia il Client ID e Client Secret", en: "Copy Client ID and Client Secret", fr: "Copiez le Client ID et Client Secret", pl: "Skopiuj Client ID i Client Secret", tr: "Client ID ve Client Secret'ı kopyalayın", uk: "Скопіюйте Client ID та Client Secret" },
  "settings.paypal.step4": { de: "Webhooks konfigurieren (Webhooks → Add Webhook)", it: "Configura i Webhooks (Webhooks → Add Webhook)", en: "Configure Webhooks (Webhooks → Add Webhook)", fr: "Configurer les Webhooks (Webhooks → Add Webhook)", pl: "Skonfiguruj Webhooki (Webhooks → Add Webhook)", tr: "Webhook'ları yapılandırın (Webhooks → Add Webhook)", uk: "Налаштуйте Webhooks (Webhooks → Add Webhook)" },
  "settings.paypal.webhookUrlLabel": { de: "Webhook-URL", it: "URL Webhook", en: "Webhook URL", fr: "URL Webhook", pl: "URL webhooka", tr: "Webhook URL", uk: "URL вебхука" },
  "settings.paypal.eventsToSubscribe": { de: "Zu abonnierende Events", it: "Eventi da sottoscrivere", en: "Events to subscribe", fr: "Événements à souscrire", pl: "Zdarzenia do subskrypcji", tr: "Abone olunacak olaylar", uk: "Події для підписки" },
  "settings.paypal.step7": { de: "Kopiere die Webhook ID", it: "Copia il Webhook ID", en: "Copy the Webhook ID", fr: "Copiez l'ID du webhook", pl: "Skopiuj ID webhooka", tr: "Webhook ID'yi kopyalayın", uk: "Скопіюйте Webhook ID" },
  "settings.paypal.step8": { de: "Füge alle Secrets im Base44-Panel ein", it: "Inserisci tutti i secrets nel pannello Base44", en: "Add all secrets into Base44 panel", fr: "Ajoutez tous les secrets dans Base44", pl: "Dodaj wszystkie sekrety w panelu Base44", tr: "Tüm gizli anahtarları Base44 paneline ekleyin", uk: "Додайте всі секрети в панелі Base44" },
  "settings.checklist.title": { de: "Pre-Launch Checkliste", it: "Checklist Pre-Lancio", en: "Pre-Launch Checklist", fr: "Liste avant lancement", pl: "Lista przed startem", tr: "Yayın Öncesi Kontrol Listesi", uk: "Чекліст перед запуском" },
  "settings.checklist.backendFunctions": { de: "Backend Functions aktiviert", it: "Backend Functions abilitate", en: "Backend Functions enabled", fr: "Fonctions backend activées", pl: "Funkcje backend włączone", tr: "Backend Functions etkin", uk: "Увімкнено Backend Functions" },
  "settings.checklist.paypalSecrets": { de: "Sekrety PayPal skonfigurowane", it: "Secrets PayPal configurati", en: "PayPal secrets configured", fr: "Secrets PayPal configurés", pl: "Sekrety PayPal skonfigurowane", tr: "PayPal gizlileri yapılandırıldı", uk: "Секрети PayPal налаштовано" },
  "settings.checklist.ga": { de: "Google Analytics skonfigurowany", it: "Google Analytics configurato", en: "Google Analytics configured", fr: "Google Analytics configuré", pl: "Skonfigurowano Google Analytics", tr: "Google Analytics yapılandırıldı", uk: "Налаштовано Google Analytics" },
  "settings.checklist.customDomain": { de: "Własna domena połączona", it: "Dominio personalizzato collegato", en: "Custom domain connected", fr: "Domaine personnalisé connecté", pl: "Podłączono własną domenę", tr: "Özel alan adı bağlandı", uk: "Підключено власний домен" },
  "settings.checklist.ssl": { de: "SSL/HTTPS aktywne", it: "SSL/HTTPS attivo", en: "SSL/HTTPS active", fr: "SSL/HTTPS actif", pl: "SSL/HTTPS aktywne", tr: "SSL/HTTPS etkin", uk: "SSL/HTTPS активний" },
  "settings.checklist.systemEmails": { de: "E-maile systemowe skonfigurowane", it: "Email di sistema configurate", en: "System emails configured", fr: "E-mails système configurés", pl: "Skonfigurowano e-maile systemowe", tr: "Sistem e-postaları yapılandırıldı", uk: "Налаштовано системні листи" },
  "settings.checklist.paymentsTested": { de: "Płatności przetestowane (sandbox)", it: "Test pagamenti eseguiti (sandbox)", en: "Payments tested (sandbox)", fr: "Paiements testés (sandbox)", pl: "Płatności przetestowane (sandbox)", tr: "Ödemeler test edildi (sandbox)", uk: "Платежі протестовано (sandbox)" },
  "settings.checklist.privacyTos": { de: "Polityka prywatności i ToS opublikowane", it: "Privacy Policy e ToS pubblicati", en: "Privacy Policy and ToS published", fr: "Politique de confidentialité et CGV publiées", pl: "Opublikowano Politykę prywatności i ToS", tr: "Gizlilik Politikası ve ToS yayınlandı", uk: "Опубліковано Політику конфіденційності та ToS" },
  "settings.checklist.backup": { de: "Aktywny system kopii zapasowych", it: "Sistema di backup attivo", en: "Backup system active", fr: "Système de sauvegarde actif", pl: "Aktywny system kopii zapasowych", tr: "Yedekleme sistemi aktif", uk: "Активна система резервного копіювання" },

  // Auth
  "auth.login.title": { de: "Bei Zazarap anmelden", it: "Accedi a Zazarap", en: "Log in to Zazarap", uk: "Увійти в Zazarap", tr: "Zazarap'a giriş yap", fr: "Se connecter à Zazarap", pl: "Zaloguj się do Zazarap" },
  "auth.login.email": { de: "E-Mail-Adresse", it: "Indirizzo e-mail", en: "Email address", uk: "Електронна пошта", tr: "E-posta adresi", fr: "Adresse e-mail", pl: "Adres e-mail" },
  "auth.login.password": { de: "Passwort", it: "Password", en: "Password", uk: "Пароль", tr: "Şifre", fr: "Mot de passe", pl: "Hasło" },
  "auth.login.submit": { de: "Einloggen", it: "Accedi", en: "Log in", uk: "Увійти", tr: "Giriş yap", fr: "Se connecter", pl: "Zaloguj się" },
  "auth.register.title": { de: "Konto erstellen", it: "Crea un account", en: "Create an account", uk: "Створити акаунт", tr: "Hesap oluştur", fr: "Créer un compte", pl: "Utwórz konto" },
  "auth.register.submit": { de: "Registrieren", it: "Registrati", en: "Sign up", uk: "Зареєструватися", tr: "Kayıt ol", fr: "S'inscrire", pl: "Zarejestruj się" },

    // Errors
    "error.illegal": { de: "Dieses Angebot ist auf Zazarap nicht erlaubt.", it: "Questo annuncio non è permesso su Zazarap.", en: "This listing is not allowed on Zazarap.", fr: "Cette annonce n'est pas autorisée sur Zazarap.", pl: "To ogłoszenie nie jest dozwolone na Zazarap.", tr: "Bu ilan Zazarap'ta yasaktır.", uk: "Це оголошення заборонене на Zazarap." },

    // Report
    "report.listing": { de: "Anzeige melden", it: "Segnala annuncio", en: "Report listing", fr: "Signaler l'annonce", pl: "Zgłoś ogłoszenie", tr: "İlanı bildir", uk: "Поскаржитись на оголошення" },
    "report.listingDesc": { de: "Melden Sie diese Anzeige, wenn sie gegen unsere Regeln verstößt", it: "Segnala questo annuncio se viola le nostre regole", en: "Report this listing if it violates our rules", fr: "Signalez cette annonce si elle enfreint nos règles", pl: "Zgłoś to ogłoszenie, jeśli narusza nasze zasady", tr: "Kurallarımızı ihlal ediyorsa bu ilanı bildirin", uk: "Поскаржтеся на це оголошення, якщо воно порушує наші правила" },
    "report.illegalContent": { de: "Illegaler Inhalt", it: "Contenuto illegale", en: "Illegal content", fr: "Contenu illégal", pl: "Nielegalna treść", tr: "Yasadışı içerik", uk: "Незаконний вміст" },
    "report.wrongCategory": { de: "Falsche Kategorie", it: "Categoria sbagliata", en: "Wrong category", fr: "Mauvaise catégorie", pl: "Błędna kategoria", tr: "Yanlış kategori", uk: "Неправильна категорія" },
    "report.fakeListing": { de: "Gefälschte Anzeige", it: "Annuncio falso", en: "Fake listing", fr: "Annonce fausse", pl: "Fałszywe ogłoszenie", tr: "Sahte ilan", uk: "Фейкове оголошення" },
    "report.descPlaceholder": { de: "Beschreiben Sie das Problem...", it: "Descrivi il problema...", en: "Describe the issue...", fr: "Décrivez le problème...", pl: "Opisz problem...", tr: "Sorunu açıklayın...", uk: "Опишіть проблему..." },
    "report.success": { de: "Meldung gesendet", it: "Segnalazione inviata", en: "Report submitted", fr: "Signalement envoyé", pl: "Zgłoszenie wysłane", tr: "Bildirim gönderildi", uk: "Скаргу надіслано" },

    // Admin Dashboard
    "admin.panel": { de: "Admin-Panel", it: "Pannello Amministratore", en: "Admin Panel", fr: "Panneau d'administration", pl: "Panel administratora", tr: "Yönetici Paneli", uk: "Панель адміністратора" },
    "admin.activeUsers": { de: "Aktive Benutzer", it: "Utenti Attivi", en: "Active Users", fr: "Utilisateurs actifs", pl: "Aktywni użytkownicy", tr: "Aktif Kullanıcılar", uk: "Активні користувачі" },
    "admin.activeListings": { de: "Aktive Anzeigen", it: "Annunci Attivi", en: "Active Listings", fr: "Annonces actives", pl: "Aktywne ogłoszenia", tr: "Aktif İlanlar", uk: "Активні оголошення" },
    "admin.openDisputes": { de: "Offene Streitfälle", it: "Dispute Aperte", en: "Open Disputes", fr: "Litiges ouverts", pl: "Otwarte spory", tr: "Açık Anlaşmazlıklar", uk: "Відкриті суперечки" },
    "admin.fundsInEscrow": { de: "Treuhand-Guthaben", it: "Fondi in Escrow", en: "Funds in Escrow", fr: "Fonds en séquestre", pl: "Środki w depozycie", tr: "Emanetteki Fonlar", uk: "Кошти на ескроу" },
    "admin.userManagement": { de: "Benutzerverwaltung", it: "Gestione Utenti", en: "User Management", fr: "Gestion des utilisateurs", pl: "Zarządzanie użytkownikami", tr: "Kullanıcı Yönetimi", uk: "Управління користувачами" },
    "admin.userManagementDesc": { de: "Benutzer, Rollen und Sperren verwalten", it: "Gestisci utenti, ruoli e ban", en: "Manage users, roles and bans", fr: "Gérer les utilisateurs, rôles et bannissements", pl: "Zarządzaj użytkownikami, rolami i banami", tr: "Kullanıcıları, rolleri ve yasakları yönet", uk: "Керування користувачами, ролями та баном" },
    "admin.listingModeration": { de: "Anzeigen-Moderation", it: "Moderazione Annunci", en: "Listing Moderation", fr: "Modération des annonces", pl: "Moderacja ogłoszeń", tr: "İlan Moderasyonu", uk: "Модерація оголошень" },
    "admin.listingModerationDesc": { de: "Anzeigen genehmigen, ablehnen oder löschen", it: "Approva, rifiuta o elimina annunci", en: "Approve, reject or delete listings", fr: "Approuver, rejeter ou supprimer des annonces", pl: "Zatwierdzaj, odrzucaj lub usuwaj ogłoszenia", tr: "İlanları onayla, reddet veya sil", uk: "Схвалення, відхилення або видалення оголошень" },
    "admin.moderation.pending": { de: "Ausstehend", it: "In attesa", en: "Pending" },
    "admin.moderation.approved": { de: "Genehmigt", it: "Approvati", en: "Approved" },
    "admin.moderation.rejected": { de: "Abgelehnt", it: "Rifiutati", en: "Rejected" },
    "admin.moderation.searchPlaceholder": { de: "Nach Titel oder Verkäufer suchen...", it: "Cerca per titolo o venditore...", en: "Search by title or seller..." },
    "admin.moderation.allModeration": { de: "Alle Moderationsstatus", it: "Tutti gli stati moderazione", en: "All moderation statuses" },
    "admin.moderation.rejectListing": { de: "Anzeige ablehnen", it: "Rifiuta Annuncio", en: "Reject Listing" },
    "admin.moderation.rejectReasonPlaceholder": { de: "Begründe, warum die Anzeige abgelehnt wird...", it: "Spiega perché l'annuncio viene rifiutato...", en: "Explain why the listing is rejected..." },
    "admin.moderation.deleteReasonPrompt": { de: "Löschgrund (wird dem Verkäufer mitgeteilt):", it: "Motivo eliminazione (verrà notificato al venditore):", en: "Deletion reason (will be notified to the seller):" },
    "action.approve": { de: "Genehmigen", it: "Approva", en: "Approve" },
    "admin.disputeManagement": { de: "Streitfallverwaltung", it: "Gestione Dispute", en: "Dispute Management", fr: "Gestion des litiges", pl: "Zarządzanie sporami", tr: "Anlaşmazlık Yönetimi", uk: "Управління суперечками" },
    "admin.disputeManagementDesc": { de: "Streitigkeiten zwischen Benutzern lösen", it: "Risolvi controversie tra utenti", en: "Resolve disputes between users", fr: "Résoudre les litiges entre utilisateurs", pl: "Rozwiązuj spory między użytkownikami", tr: "Kullanıcılar arasındaki anlaşmazlıkları çöz", uk: "Вирішення суперечок між користувачами" },
    "admin.supportTickets": { de: "Support-Tickets", it: "Ticket Supporto", en: "Support Tickets", fr: "Tickets de support", pl: "Zgłoszenia wsparcia", tr: "Destek Talepleri", uk: "Тікети підтримки" },
    "admin.supportTicketsDesc": { de: "Auf Benutzeranfragen antworten", it: "Rispondi alle richieste utenti", en: "Respond to user requests", fr: "Répondre aux demandes des utilisateurs", pl: "Odpowiadaj na zapytania użytkowników", tr: "Kullanıcı isteklerine yanıt ver", uk: "Відповіді на запити користувачів" },
    "admin.reports": { de: "Meldungen", it: "Segnalazioni", en: "Reports", fr: "Signalements", pl: "Zgłoszenia", tr: "Raporlar", uk: "Скарги" },
    "admin.reportsDesc": { de: "Benutzermeldungen verwalten", it: "Gestisci segnalazioni utenti", en: "Manage user reports", fr: "Gérer les signalements", pl: "Zarządzaj zgłoszeniami użytkowników", tr: "Kullanıcı raporlarını yönet", uk: "Управління скаргами користувачів" },
    "admin.analytics": { de: "Statistiken", it: "Analytics", en: "Analytics", fr: "Statistiques", pl: "Analityka", tr: "Analitik", uk: "Аналітика" },
    "admin.analyticsDesc": { de: "Plattform-Statistiken und Metriken", it: "Statistiche e metriche piattaforma", en: "Platform statistics and metrics", fr: "Statistiques et métriques de la plateforme", pl: "Statystyki i metryki platformy", tr: "Platform istatistikleri ve metrikleri", uk: "Статистика та метрики платформи" },
    "admin.categoryManagement": { de: "Kategorienverwaltung", it: "Gestione Categorie", en: "Category Management", fr: "Gestion des catégories", pl: "Zarządzanie kategoriami", tr: "Kategori Yönetimi", uk: "Управління категоріями" },
    "admin.categoryManagementDesc": { de: "Kategorien erstellen und bearbeiten", it: "Crea e modifica categorie", en: "Create and edit categories", fr: "Créer et modifier les catégories", pl: "Twórz i edytuj kategorie", tr: "Kategorileri oluştur ve düzenle", uk: "Створення та редагування категорій" },
    "admin.paymentsEscrow": { de: "Zahlungen & Treuhand", it: "Pagamenti & Escrow", en: "Payments & Escrow", fr: "Paiements & Séquestre", pl: "Płatności i depozyt", tr: "Ödemeler & Emanet", uk: "Платежі та ескроу" },
    "admin.paymentsEscrowDesc": { de: "Transaktionen und Guthaben überwachen", it: "Monitora transazioni e fondi", en: "Monitor transactions and funds", fr: "Surveiller les transactions et les fonds", pl: "Monitoruj transakcje i środki", tr: "İşlemleri ve fonları izle", uk: "Моніторинг транзакцій та коштів" },
    "admin.configuration": { de: "Konfiguration", it: "Configurazione", en: "Configuration", fr: "Configuration", pl: "Konfiguracja", tr: "Yapılandırma", uk: "Налаштування" },
    "admin.configurationDesc": { de: "Integrationen und Secrets", it: "Integrazioni e Secrets", en: "Integrations and Secrets", fr: "Intégrations et secrets", pl: "Integracje i sekrety", tr: "Entegrasyonlar ve gizlilikler", uk: "Інтеграції та секрети" },
    "admin.launchChecklist": { de: "Launch-Checkliste", it: "Checklist Lancio", en: "Launch Checklist", fr: "Liste de contrôle de lancement", pl: "Lista kontrolna uruchomienia", tr: "Lansman Kontrol Listesi", uk: "Контрольний список запуску" },
    "admin.launchChecklistDesc": { de: "Pre-Launch-Überprüfung", it: "Verifica pre-lancio", en: "Pre-launch verification", fr: "Vérification pré-lancement", pl: "Weryfikacja przed uruchomieniem", tr: "Lansman öncesi doğrulama", uk: "Перевірка перед запуском" },
    "admin.systemCheckup": { de: "System-Check", it: "Controllo Sistema", en: "System Checkup", fr: "Vérification système", pl: "Sprawdzanie systemu", tr: "Sistem Kontrolü", uk: "Перевірка системи" },
    "admin.systemCheckupDesc": { de: "Vollständige Systemanalyse", it: "Analisi completa sistema", en: "Complete system analysis", fr: "Analyse complète du système", pl: "Pełna analiza systemu", tr: "Tam sistem analizi", uk: "Повний аналіз системи" },
    "admin.systemCheckupComplete": { de: "System-Check abgeschlossen", it: "System Checkup Completo", en: "System Checkup Complete", fr: "Vérification du système terminée", pl: "Pełny przegląd systemu", tr: "Sistem Kontrolü Tamamlandı", uk: "Системна перевірка завершена" },
    "admin.paymentsManagement": { de: "Zahlungsverwaltung", it: "Gestione Pagamenti", en: "Payments Management", fr: "Gestion des paiements", pl: "Zarządzanie płatnościami", tr: "Ödeme Yönetimi", uk: "Керування платежами" },
    "accessDenied": { de: "Zugriff verweigert", it: "Accesso Negato", en: "Access Denied", fr: "Accès refusé", pl: "Odmowa dostępu", tr: "Erişim Engellendi", uk: "Доступ заборонено" },
    "adminOnly": { de: "Nur Administratoren können auf diese Seite zugreifen.", it: "Solo gli amministratori possono accedere a questa pagina.", en: "Only administrators can access this page.", fr: "Seuls les administrateurs peuvent accéder à cette page.", pl: "Tylko administratorzy mogą uzyskać dostęp do tej strony.", tr: "Bu sayfaya yalnızca yöneticiler erişebilir.", uk: "Тільки адміністратори можуть отримати доступ до цієї сторінки." },

    "action.reviewed": { de: "Überprüft", it: "Revisionata", en: "Reviewed" },
    "action.resolved": { de: "Gelöst", it: "Risolta", en: "Resolved" },
    "action.banUser": { de: "Benutzer sperren", it: "Ban Utente", en: "Ban User" },

    "admin.noReportsFound": { de: "Keine Meldungen gefunden", it: "Nessuna segnalazione trovata", en: "No reports found" },
    "admin.noDisputesFound": { de: "Keine Streitfälle gefunden", it: "Nessuna dispute trovata", en: "No disputes found" },
    "admin.total": { de: "Gesamt", it: "Totale", en: "Total" },
    "admin.active": { de: "Aktiv", it: "Attivi", en: "Active" },
    "admin.blocked": { de: "Gesperrt", it: "Bloccati", en: "Blocked" },
    "admin.admins": { de: "Admins", it: "Admin", en: "Admins" },
    "admin.searchUserPlaceholder": { de: "Nach E-Mail oder Namen suchen...", it: "Cerca per email o nome...", en: "Search by email or name..." },
    "admin.noUsersFound": { de: "Keine Benutzer gefunden", it: "Nessun utente trovato", en: "No users found" },
    "admin.blockUser": { de: "Benutzer sperren", it: "Blocca Utente", en: "Block User" },
    "admin.userLabel": { de: "Benutzer:", it: "Utente:", en: "User:" },
    "admin.blockReasonLabel": { de: "Sperrgrund", it: "Motivo del blocco", en: "Block reason" },
    "admin.blockReasonPlaceholder": { de: "Geben Sie den Sperrgrund an...", it: "Descrivi il motivo del blocco...", en: "Describe the block reason..." },
    "admin.activityHistory": { de: "Aktivitätsverlauf", it: "Storico Attività", en: "Activity History" },
    "admin.noActivity": { de: "Keine Aktivitäten registriert", it: "Nessuna attività registrata", en: "No activity recorded" },

    "admin.newCategory": { de: "Neue Kategorie", it: "Nuova Categoria", en: "New Category" },
    "admin.editCategory": { de: "Kategorie bearbeiten", it: "Modifica Categoria", en: "Edit Category" },
    "admin.deactivated": { de: "Deaktiviert", it: "Disattivata", en: "Deactivated" },
    "admin.deleteCategoryConfirm": { de: "Diese Kategorie löschen?", it: "Eliminare questa categoria?", en: "Delete this category?" },

    "admin.reportUpdated": { de: "Meldung aktualisiert", it: "Segnalazione aggiornata", en: "Report updated" },
    "admin.userBanned": { de: "Benutzer gesperrt", it: "Utente bannato", en: "User banned" },
    "admin.ticketUpdated": { de: "Ticket aktualisiert", it: "Ticket aggiornato", en: "Ticket updated" },

    "admin.supportReplyTitle": { de: "Support-Antwort", it: "Risposta Supporto", en: "Support Reply" },
    "admin.supportReplyPrefix": { de: "Der Support hat auf dein Ticket geantwortet:", it: "Il supporto ha risposto al tuo ticket:", en: "Support replied to your ticket:" },
    "email.supportReplySubjectPrefix": { de: "Antwort auf", it: "Risposta a", en: "Reply to" },
    "email.supportReplyBodyHeader": { de: "Wir haben auf dein Support-Ticket geantwortet:", it: "Abbiamo risposto al tuo ticket di supporto:", en: "We replied to your support ticket:" },
    "email.supportReplyBodyFooter": { de: "Wenn du weitere Fragen hast, antworte bitte auf diese Nachricht.\nDas Zazarap Team", it: "Se hai altre domande, non esitare a contattarci.\nIl team Zazarap", en: "If you have more questions, just reply to this message.\nThe Zazarap Team" },

    "admin.accountBlockedTitle": { de: "Konto gesperrt", it: "Account bloccato", en: "Account blocked" },
    "admin.accountBlockedMsgPrefix": { de: "Dein Konto wurde gesperrt. Grund:", it: "Il tuo account è stato bloccato. Motivo:", en: "Your account has been blocked. Reason:" },
    "admin.accountUnblockedTitle": { de: "Konto entsperrt", it: "Account sbloccato", en: "Account unblocked" },
    "admin.accountUnblockedMessage": { de: "Dein Konto wurde entsperrt und du kannst dich normal anmelden.", it: "Il tuo account è stato sbloccato e puoi accedere normalmente.", en: "Your account has been unblocked and you can sign in normally." },
    "admin.confirmBan": { de: "Diesen Benutzer sperren", it: "Bannare", en: "Ban" },

    "admin.released": { de: "Freigegeben", it: "Rilasciati", en: "Released" },
    "admin.totalTransactions": { de: "Transaktionen gesamt", it: "Totale Transazioni", en: "Total Transactions" },
    "admin.method": { de: "Methode", it: "Metodo", en: "Method" },
    "admin.paypalOrder": { de: "PayPal-Bestellung", it: "Ordine PayPal", en: "PayPal Order" },
    "admin.estimatedRelease": { de: "Voraussichtliche Freigabe", it: "Rilascio previsto", en: "Estimated release" },
    "admin.releaseFunds": { de: "Gelder freigeben", it: "Rilascia Fondi", en: "Release funds" },
    "admin.refund": { de: "Rcckerstatten", it: "Rimborsa", en: "Refund" },
    "admin.confirmRelease": { de: "Gelder an den Verk e4ufer freigeben?", it: "Rilasciare i fondi al venditore?", en: "Release funds to seller?" },
    "admin.confirmRefund": { de: "K e4ufer erstatten?", it: "Rimborsare l'acquirente?", en: "Refund the buyer?" },
    "admin.noPaymentsFound": { de: "Keine Zahlungen gefunden", it: "Nessun pagamento trovato", en: "No payments found" },
    "admin.noTicketsFound": { de: "Keine Tickets gefunden", it: "Nessun ticket trovato", en: "No tickets found" },
    "admin.type": { de: "Typ", it: "Tipo", en: "Type" },
    "admin.from": { de: "Da", it: "Da", en: "From" },
    "admin.against": { de: "Gegen", it: "Contro", en: "Against" },
    "admin.evidence": { de: "Beweise", it: "Prove allegate", en: "Evidence" },
    "admin.decisionPlaceholder": { de: "Beschreibe die getroffene Entscheidung...", it: "Descrivi la decisione presa...", en: "Describe the decision taken..." },
    "admin.internalNotesPlaceholder": { de: "Interne Notizen...", it: "Note interne...", en: "Internal notes..." },
    "admin.resolutionLabel": { de: "L f6sung", it: "Risoluzione", en: "Resolution" },
    "admin.adminNotesLabel": { de: "Admin-Notizen", it: "Note Admin", en: "Admin notes" },
    "admin.iconLabel": { de: "Icon", it: "Icona", en: "Icon" },
    "admin.order": { de: "Ordnung", it: "Ordine", en: "Order" },
    "admin.activeCategory": { de: "Kategorie aktiv", it: "Categoria attiva", en: "Active category" },

    // Categories (canonical keys)
    "category.veicoli": { de: "Fahrzeuge", it: "Veicoli", en: "Vehicles", fr: "Véhicules", pl: "Pojazdy", tr: "Araçlar", uk: "Транспорт" },
    "category.sport": { de: "Sport", it: "Sport", en: "Sports", fr: "Sport", pl: "Sport", tr: "Spor", uk: "Спорт" },
    "category.servizi": { de: "Dienstleistungen", it: "Servizi", en: "Services", fr: "Services", pl: "Usługi", tr: "Hizmetler", uk: "Послуги" },
    "category.elettronica": { de: "Elektronik", it: "Elettronica", en: "Electronics", fr: "Électronique", pl: "Elektronika", tr: "Elektronik", uk: "Електроніка" },
    "category.animali": { de: "Tiere", it: "Animali", en: "Animals", fr: "Animaux", pl: "Zwierzęta", tr: "Hayvanlar", uk: "Тварини" },
    "category.arredamento": { de: "Möbel", it: "Arredamento", en: "Furniture", fr: "Meubles", pl: "Meble", tr: "Mobilya", uk: "Меблі" },
    "category.abbigliamento": { de: "Kleidung", it: "Abbigliamento", en: "Clothing", fr: "Vêtements", pl: "Odzież", tr: "Giyim", uk: "Одяг" },
    "category.libri": { de: "Bücher", it: "Libri", en: "Books", fr: "Livres", pl: "Książki", tr: "Kitaplar", uk: "Книги" },
    "category.altro": { de: "Sonstiges", it: "Altro", en: "Other", fr: "Autre", pl: "Inne", tr: "Diğer", uk: "Інше" },

  "dashboard.title": { de: "Zazarap Dashboard", it: "Zazarap Dashboard", en: "Zazarap Dashboard", fr: "Tableau de bord Zazarap", pl: "Pulpit Zazarap", tr: "Zazarap Panosu", uk: "Панель Zazarap" },
  "dashboard.subtitle": { de: "Überwache die Performance deines Marktplatzes", it: "Monitora le performance del tuo marketplace", en: "Monitor your marketplace performance", fr: "Surveillez les performances de votre marketplace", pl: "Monitoruj wydajność swojego marketplace", tr: "Pazaryerinizin performansını izleyin", uk: "Відстежуйте ефективність свого маркетплейсу" },
  "dashboard.activeListings": { de: "Aktive Anzeigen", it: "Annunci attivi", en: "Active Listings", fr: "Annonces actives", pl: "Aktywne ogłoszenia", tr: "Aktif İlanlar", uk: "Активні оголошення" },
  "dashboard.soldItems": { de: "Verkaufte Artikel", it: "Venduti", en: "Sold Items", fr: "Articles vendus", pl: "Sprzedane", tr: "Satılanlar", uk: "Продані товари" },
  "dashboard.totalRevenue": { de: "Gesamtumsatz", it: "Ricavi totali", en: "Total Revenue", fr: "Revenu total", pl: "Łączne przychody", tr: "Toplam Gelir", uk: "Загальний дохід" },
  "dashboard.listingsByCategory": { de: "Anzeigen nach Kategorie", it: "Annunci per categoria", en: "Listings by Category", fr: "Annonces par catégorie", pl: "Ogłoszenia wg kategorii", tr: "Kategoriye göre ilanlar", uk: "Оголошення за категоріями" },
  "dashboard.recentListings": { de: "Neueste Anzeigen", it: "Annunci recenti", en: "Recent Listings", fr: "Annonces récentes", pl: "Najnowsze ogłoszenia", tr: "En Son İlanlar", uk: "Останні оголошення" },
  "dashboard.exportCSV": { de: "CSV exportieren", it: "Esporta CSV", en: "Export CSV", fr: "Exporter CSV", pl: "Eksportuj CSV", tr: "CSV Dışa Aktar", uk: "Експортувати CSV" },
  "dashboard.listingsActivity": { de: "Anzeigen-Aktivität (Letzte 7 Tage)", it: "Attività annunci (ultimi 7 giorni)", en: "Listings Activity (Last 7 Days)", fr: "Activité des annonces (7 derniers jours)", pl: "Aktywność ogłoszeń (ostatnie 7 dni)", tr: "İlan Aktivitesi (Son 7 Gün)", uk: "Активність оголошень (останні 7 днів)" },
  "dashboard.legend.active": { de: "Aktive Anzeigen", it: "Annunci attivi", en: "Active Listings", fr: "Annonces actives", pl: "Aktywne ogłoszenia", tr: "Aktif 30lanlar", uk: "Активні оголошення" },
  "dashboard.legend.sold": { de: "Verkaufte Artikel", it: "Oggetti venduti", en: "Sold Items", fr: "Articles vendus", pl: "Sprzedane", tr: "Sat31lanlar", uk: "Продані товари" },

  "admin.moderation.rejectReasonLabel": { de: "Ablehnungsgrund", it: "Motivo del rifiuto", en: "Rejection reason", fr: "Raison du refus", pl: "Pow f3d odrzucenia", tr: "Reddetme nedeni", uk: "Причина відхилення" },
  "admin.moderation.rejectReasonRequired": { de: "Bitte gib einen Ablehnungsgrund an", it: "Inserisci un motivo per il rifiuto", en: "Please provide a rejection reason", fr: "Veuillez indiquer une raison du refus", pl: "Podaj pow f3d odrzucenia", tr: "L fctfen reddetme nedeni girin", uk: "Будь ласка, вкажіть причину відхилення" },

  "moderation.updated": { de: "Anzeige aktualisiert", it: "Annuncio aggiornato", en: "Listing updated", fr: "Annonce mise  e0 jour", pl: "Og42oszenie zaktualizowano", tr: "30lan g fcncellendi", uk: "Оголошення оновлено" },
  "moderation.deleted": { de: "Anzeige gel f6scht", it: "Annuncio eliminato", en: "Listing deleted", fr: "Annonce supprim e9e", pl: "Og42oszenie usuni19to", tr: "30lan silindi", uk: "Оголошення видалено" }
,
        "systemCheck.subtitle": { de: "Detaillierte Analyse des Zustands der Zazarap-Anwendung", it: "Analisi dettagliata dello stato dell'applicazione Zazarap", en: "Detailed analysis of the Zazarap application state" },
        "aria.home": { de: "Startseite", it: "Home", en: "Home" },
        "aria.messages": { de: "Nachrichten", it: "Messaggi", en: "Messages" },
        "aria.create": { de: "Anzeige erstellen", it: "Crea annuncio", en: "Create ad" },
        "aria.stats": { de: "Statistiken", it: "Statistiche", en: "Statistics" },
        "aria.packages": { de: "Pakete", it: "Pacchetti", en: "Packages" },
        "aria.notifications": { de: "Benachrichtigungen", it: "Notifiche", en: "Notifications" },
        "aria.settings": { de: "Einstellungen", it: "Impostazioni", en: "Settings" },
        "aria.language": { de: "Sprache wählen", it: "Scegli lingua", en: "Choose language" },
  "systemCheck.overallScore": { de: "Gesamtpunktzahl", it: "Punteggio Complessivo", en: "Overall Score" },
  "systemCheck.totalListings": { de: "Gesamtanzeigen", it: "Total Listings", en: "Total Listings" },
  "systemCheck.totalUsers": { de: "Gesamtnutzer", it: "Total Users", en: "Total Users" },
  "systemCheck.categories": { de: "Kategorien", it: "Categorie", en: "Categories" },
  "systemCheck.entities": { de: "Entities", it: "Entities", en: "Entities" },
  "systemCheck.categoryAnalysis": { de: "📊 Analyse nach Kategorie", it: "📊 Analisi per Categoria", en: "📊 Category Analysis" },
  "systemCheck.recommendations": { de: "💡 Empfehlungen", it: "💡 Raccomandazioni", en: "💡 Recommendations" },
  "systemCheck.criticalLabel": { de: "🚨 KRITISCH (Vor dem Launch erledigen)", it: "🚨 CRITICHE (Da fare PRIMA del lancio)", en: "🚨 CRITICAL (Do before launch)" },
  "systemCheck.highPriorityLabel": { de: "⚡ HOHE PRIORITÄT", it: "⚡ PRIORITÀ ALTA", en: "⚡ HIGH PRIORITY" },
  "systemCheck.mediumPriorityLabel": { de: "📋 Mittlere Priorität", it: "📋 Priorità Media", en: "📋 Medium Priority" },
  "systemCheck.nextStepsTitle": { de: "🎯 Nächste Schritte für den Launch", it: "🎯 Prossimi Passi per il Lancio", en: "🎯 Next Steps for Launch" },
  "systemCheck.goToChecklistButton": { de: "📋 Zur Pre-Launch-Checkliste", it: "📋 Vai alla Pre-Launch Checklist", en: "📋 Go to Pre-Launch Checklist" },
  "systemCheck.backToDashboardButton": { de: "⬅️ Zurück zum Dashboard", it: "⬅️ Torna al Dashboard", en: "⬅️ Back to Dashboard" },
  "systemCheck.cat.core": { de: "🎯 Kernfunktionen", it: "🎯 Funzionalità Core", en: "🎯 Core Features" },
  "systemCheck.cat.moderation": { de: "🛡️ Moderation & Sicherheit", it: "🛡️ Moderazione e Sicurezza", en: "🛡️ Moderation & Security" },
  "systemCheck.cat.adminTools": { de: "⚙️ Admin-Tools", it: "⚙️ Strumenti Admin", en: "⚙️ Admin Tools" },
  "systemCheck.cat.legal": { de: "⚖️ Rechtliche Compliance", it: "⚖️ Compliance Legale", en: "⚖️ Legal Compliance" },
  "systemCheck.cat.seo": { de: "📈 SEO & Marketing", it: "📈 SEO & Marketing", en: "📈 SEO & Marketing" },
  "systemCheck.cat.ux": { de: "🌍 UX & Mehrsprachigkeit", it: "🌍 UX & Multilingua", en: "🌍 UX & Multilingual" },
  "systemCheck.cat.technical": { de: "💻 Technische Aspekte", it: "💻 Aspetti Tecnici", en: "💻 Technical Aspects" },
  "systemCheck.cat.db": { de: "🗄️ Datenbank & Entities", it: "🗄️ Database & Entities", en: "🗄️ Database & Entities" },
  "systemCheck.cat.security": { de: "🔒 Erweiterte Sicherheit", it: "🔒 Sicurezza Avanzata", en: "🔒 Advanced Security" }
};

// Legacy flat translations (kept for backward compatibility)
const translations = {
  de: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Fahrzeuge',
    'Autos': 'Autos',
    'Motorräder': 'Motorräder',
    'Roller': 'Roller',
    'Nutzfahrzeuge': 'Nutzfahrzeuge',
    'E-Scooter': 'E-Scooter',

    // Categories - Immobilien
    'Immobilien': 'Immobilien',
    'Wohnungen & Häuser': 'Wohnungen & Häuser',
    'Mietobjekte': 'Mietobjekte',
    'Zimmer': 'Zimmer',

    // Categories - Marktplatz
    'Marktplatz': 'Marktplatz',
    'Elektronik': 'Elektronik',
    'Sport & Freizeit': 'Sport & Freizeit',
    'Möbel': 'Möbel',
    'Haushalt & Küche': 'Haushalt & Küche',
    'Videospiele': 'Videospiele',
    'Bücher': 'Bücher',
    'Musik & Filme': 'Musik & Filme',
    'Kleidung': 'Kleidung',
    'Kinder': 'Kinder',
    'Garten': 'Garten',
    'Heimwerken': 'Heimwerken',
    'Beauty & Pflege': 'Beauty & Pflege',

    // Categories - Tiere
    'Tiere': 'Tiere',
    'Hunde': 'Hunde',
    'Katzen': 'Katzen',
    'Vögel': 'Vögel',
    'Fische': 'Fische',
    'Nagetiere': 'Nagetiere',
    'Reptilien (legal)': 'Reptilien (legal)',
    'Tierzubehör': 'Tierzubehör',

    // Categories - Jobs
    'Jobs': 'Jobs',
    'Stellenangebote': 'Stellenangebote',
    'Lebenslauf': 'Lebenslauf',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Dienstleistungen',
    'Nachhilfe': 'Nachhilfe',
    'Reinigungsservice': 'Reinigungsservice',
    'Transport & Umzüge': 'Transport & Umzüge',
    'Reparaturen': 'Reparaturen',

    // Header & Navigation
    loginOrRegister: 'Anmelden oder Registrieren',
    firstName: 'Vorname',
    lastName: 'Nachname',
    address: 'Adresse',
    country: 'Land',
    province: 'Provinz',
    region: 'Region',
    birthDate: 'Geburtsdatum',
    completeProfile: 'Profil vervollständigen',
    completeProfileDesc: 'Vervollständigen Sie Ihr Profil, um loszulegen.',
    welcome: 'Willkommen',
    welcomeBack: 'Willkommen, {name}! Schön, dass Sie wieder da sind.',
    acceptPrivacy: 'Ich akzeptiere die Datenschutzbestimmungen und AGB',
    marketingConsent: '(Optional) Ich möchte Angebote per E-Mail erhalten',
    
    home: 'Startseite',
    publish: 'Inserieren',
    sales: 'Verkäufe',
    purchases: 'Käufe',
    messages: 'Nachrichten',
    notifications: 'Benachrichtigungen',
    admin: 'Admin',
    
    // Marketplace
    searchPlaceholder: 'Anzeigen durchsuchen...',
    filters: 'Filter',
    category: 'Kategorie',
    allCategories: 'Alle Kategorien',
    priceMin: 'Mindestpreis (€)',
    priceMax: 'Höchstpreis (€)',
    city: 'Stadt',
    allCities: 'Alle Städte',
    sortBy: 'Sortieren nach',
    mostRecent: 'Neueste',
    leastRecent: 'Älteste',
    priceAsc: 'Preis aufsteigend',
    priceDesc: 'Preis absteigend',
    resetFilters: 'Filter zurücksetzen',
    'dashboard.recentListings': 'Neueste Anzeigen',
    'dashboard.exportCSV': 'CSV exportieren',
    'dashboard.listingsByCategory': 'Anzeigen nach Kategorie',
    adsFound: 'Anzeigen gefunden',
    noAdsFound: 'Keine Anzeigen gefunden',
    
    // Listing
    contactSeller: 'Verkäufer kontaktieren',
    addToFavorites: 'Zu Favoriten',
    removeFromFavorites: 'Aus Favoriten entfernen',
    editListing: 'Anzeige bearbeiten',
    promote: 'Hervorheben',
    featuredListings: 'Anzeigen im Fokus',
    featured: 'Im Fokus',
    
    // Forms
    title: 'Titel',
    description: 'Beschreibung',
    price: 'Preis',
    images: 'Bilder',
    save: 'Speichern',
    cancel: 'Abbrechen',
    submit: 'Absenden',
    delete: 'Löschen',
    
    // Chat
    sendMessage: 'Nachricht senden',
    accept: 'Akzeptieren',
    reject: 'Ablehnen',
    counterOffer: 'Gegenangebot',
    
    // Payment
    proceedToPayment: 'Zur Zahlung',
    paymentMethod: 'Zahlungsmethode',
    shippingMethod: 'Versandart',
    pickupInPerson: 'Abholung',
    courier: 'Kurier',
    
    // Footer
    legal: 'Rechtliches',
    impressum: 'Impressum',
    agb: 'AGB',
    privacy: 'Datenschutz',
    rightOfWithdrawal: 'Widerrufsrecht',
    disputeResolution: 'Streitbeilegung',
    support: 'Support',
    contactUs: 'Kontakt',
    allRightsReserved: 'Alle Rechte vorbehalten',
    
    // Common
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
    confirm: 'Bestätigen',
    close: 'Schließen',
    
    // Footer
    tagline: 'Der sichere und zuverlässige deutsche Marktplatz',
    slogan: 'zazarap.de',
    newsletter: 'Newsletter',
    newsletterDesc: 'Erhalten Sie exklusive Angebote und Neuigkeiten',
    euDispute: 'EU-Streitschlichtung',

    // Admin
    preLaunchChecklist: 'Pre-Launch Checkliste',
    checkBeforeLaunch: 'Überprüfen Sie alle Punkte vor dem Go-Live',
    criticalConfig: 'Kritische Konfiguration',
    legalRequirements: 'Rechtliche Anforderungen',
    testingQA: 'Testing & QA',
    recommendedImprovements: 'Empfohlene Verbesserungen',
    nextSteps: 'Nächste Schritte',
    launch: 'Launch!',

    // Recommendations
    aiRecommendations: 'KI-Empfehlungen für Sie',
    generateRecommendations: 'Empfehlungen generieren',
    generating: 'Wird generiert...',
    suggestedCategories: 'Vorgeschlagene Kategorien:',
    refreshRecommendations: 'Empfehlungen aktualisieren',
    discoverRecommendations: 'KI-Empfehlungen entdecken',
    exploreToGetSuggestions: 'Erkunden Sie einige Anzeigen, um personalisierte Vorschläge zu erhalten!',

    // Sales/Purchases
    mySales: 'Meine Verkäufe',
    myPurchases: 'Meine Käufe',
    totalSales: 'Verkäufe insgesamt',
    totalRevenue: 'Gesamteinnahmen',
    inEscrow: 'Im Treuhand',
    toShip: 'Zu versenden',
    buyer: 'Käufer',
    seller: 'Verkäufer',
    shipping: 'Versand',
    addTracking: 'Hinzufügen',
    goToChat: 'Zur Chat gehen',
    noSalesYet: 'Noch keine Verkäufe',
    totalPurchases: 'Käufe insgesamt',
    totalSpent: 'Insgesamt ausgegeben',
    inProgress: 'In Bearbeitung',
    noPurchasesYet: 'Noch keine Käufe',
    paymentStatus: 'Zahlungsstatus',
    protectedInEscrow: '🔒 Geschützt im Treuhand',
    completed: '✅ Abgeschlossen',

    // Edit Listing
    editListing: 'Anzeige bearbeiten',
    existingImages: 'Vorhandene Bilder',
    remove: 'Entfernen',
    addNewImages: 'Neue Bilder hinzufügen',
    addMorePhotos: 'Weitere Fotos hinzufügen',
    saveChanges: 'Änderungen speichern',
    selectCategory: 'Kategorie auswählen',
    electronics: 'Elektronik',
    home: 'Haus',
    fashion: 'Mode',
    sports: 'Sport',
    auto: 'Auto',
    animals: 'Tiere',
    other: 'Andere',

    // Filters & Status
    listingStatus: 'Anzeigenstatus',
    allStatuses: 'Alle Status',
    active: 'Aktiv',
    sold: 'Verkauft',
    expired: 'Abgelaufen',
    archived: 'Archiviert',
    
    publishDate: 'Veröffentlichungsdatum',
    allDates: 'Alle Daten',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    thisMonth: 'Diesen Monat',

    // Misc
    reviews: 'Bewertungen',
    addReview: 'Bewertung hinzufügen',
    rating: 'Bewertung',
    stars: 'Sterne',
    back: 'Zurück',
    listingNotFound: 'Anzeige nicht gefunden',
    backToMarketplace: 'Zurück zum Marktplatz',
    share: 'Teilen',
    report: 'Melden',
    reason: 'Grund',
    description: 'Beschreibung',
    sendReport: 'Meldung senden',
    cancel: 'Abbrechen',
    selectReason: 'Grund auswählen',
    spam: 'Spam',
    inappropriate: 'Unangemessen',
    scam: 'Betrug',
    harassment: 'Belästigung',
    other: 'Andere',
    favorites: 'Favoriten',
    noSavedAds: 'Keine gespeicherten Anzeigen',
    details: 'Details',
    notifications: 'Benachrichtigungen',
    markAllRead: 'Alle als gelesen markieren',
    unread: 'ungelesen',
    view: 'Ansehen',
    markAsRead: 'Als gelesen markieren',
    noNotifications: 'Keine Benachrichtigungen',
    new: 'Neu',
    messages: 'Nachrichten',
    chats: 'Chats',
    noChats: 'Keine Chats',
    selectChat: 'Chat auswählen',
    typeMessage: 'Nachricht eingeben...',
    translate: 'Übersetzen',
    original: 'Original',
    offerAccepted: 'Angebot angenommen',
    offerRejected: 'Angebot abgelehnt',
    offerReceived: 'Angebot erhalten',
    congratulations: 'Glückwunsch',
    visitToReply: 'Zum Antworten besuchen',
    thanks: 'Danke',
    team: 'Das Zazarap Team',
    seoOptimization: 'SEO Optimierung (Optional)',
    metaTitle: 'Meta Titel (max 60 Zeichen)',
    metaDesc: 'Meta Beschreibung (max 160 Zeichen)',
    keywords: 'SEO Keywords (kommagetrennt)',
    chars: 'Zeichen',
    reportUser: 'Benutzer melden',
    fundsReceived: 'Gelder erhalten',
    pending: 'Ausstehend',
    tracking: 'Sendungsverfolgung',
    add: 'Hinzufügen',
    lastOffer: 'Letztes Angebot',
    noReviews: 'Keine Bewertungen'
    },
  
  it: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Veicoli',
    'Autos': 'Auto',
    'Motorräder': 'Moto',
    'Roller': 'Scooter',
    'Nutzfahrzeuge': 'Veicoli Commerciali',
    'E-Scooter': 'Monopattini Elettrici',

    // Categories - Immobilien
    'Immobilien': 'Immobili',
    'Wohnungen & Häuser': 'Appartamenti e Case',
    'Mietobjekte': 'Affitti',
    'Zimmer': 'Stanze',

    // Categories - Marktplatz
    'Marktplatz': 'Mercato',
    'Elektronik': 'Elettronica',
    'Sport & Freizeit': 'Sport e Tempo Libero',
    'Möbel': 'Mobili',
    'Haushalt & Küche': 'Casa e Cucina',
    'Videospiele': 'Videogiochi',
    'Bücher': 'Libri',
    'Musik & Filme': 'Musica e Film',
    'Kleidung': 'Abbigliamento',
    'Kinder': 'Bambini',
    'Garten': 'Giardino',
    'Heimwerken': 'Fai da Te',
    'Beauty & Pflege': 'Bellezza e Cura',

    // Categories - Tiere
    'Tiere': 'Animali',
    'Hunde': 'Cani',
    'Katzen': 'Gatti',
    'Vögel': 'Uccelli',
    'Fische': 'Pesci',
    'Nagetiere': 'Roditori',
    'Reptilien (legal)': 'Rettili (legali)',
    'Tierzubehör': 'Accessori Animali',

    // Categories - Jobs
    'Jobs': 'Lavoro',
    'Stellenangebote': 'Offerte di Lavoro',
    'Lebenslauf': 'Curriculum',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Servizi',
    'Nachhilfe': 'Ripetizioni',
    'Reinigungsservice': 'Pulizie',
    'Transport & Umzüge': 'Trasporti e Traslochi',
    'Reparaturen': 'Riparazioni',

    // Header & Navigation
    loginOrRegister: 'Accedi o Registrati',
    firstName: 'Nome',
    lastName: 'Cognome',
    address: 'Indirizzo',
    country: 'Paese',
    province: 'Provincia',
    region: 'Regione',
    birthDate: 'Data di Nascita',
    completeProfile: 'Completa Profilo',
    completeProfileDesc: 'Completa il tuo profilo per iniziare.',
    welcome: 'Benvenuto',
    welcomeBack: 'Benvenuto, {name}! Bello rivederti.',
    acceptPrivacy: 'Accetto la Privacy Policy e i Termini di Servizio',
    marketingConsent: '(Opzionale) Voglio ricevere offerte via email',
    
    home: 'Home',
    publish: 'Pubblica',
    sales: 'Vendite',
    purchases: 'Acquisti',
    messages: 'Messaggi',
    notifications: 'Notifiche',
    admin: 'Admin',
    
    // Marketplace
    searchPlaceholder: 'Cerca annunci...',
    filters: 'Filtri',
    category: 'Categoria',
    allCategories: 'Tutte le categorie',
    priceMin: 'Prezzo minimo (€)',
    priceMax: 'Prezzo massimo (€)',
    city: 'Città',
    allCities: 'Tutte le città',
    sortBy: 'Ordina per',
    mostRecent: 'Più recenti',
    leastRecent: 'Meno recenti',
    priceAsc: 'Prezzo crescente',
    priceDesc: 'Prezzo decrescente',
    resetFilters: 'Resetta filtri',
    'dashboard.recentListings': 'Annunci recenti',
    'dashboard.exportCSV': 'Esporta CSV',
    'dashboard.listingsByCategory': 'Annunci per categoria',
    adsFound: 'annunci trovati',
    noAdsFound: 'Nessun annuncio trovato',
    
    // Listing
    contactSeller: 'Contatta venditore',
    addToFavorites: 'Aggiungi ai preferiti',
    removeFromFavorites: 'Rimuovi dai preferiti',
    editListing: 'Modifica annuncio',
    promote: 'Metti in evidenza',
    featuredListings: 'Annunci in Evidenza',
    featured: 'In Evidenza',
    
    // Forms
    title: 'Titolo',
    description: 'Descrizione',
    price: 'Prezzo',
    images: 'Immagini',
    save: 'Salva',
    cancel: 'Annulla',
    submit: 'Invia',
    delete: 'Elimina',
    
    // Chat
    sendMessage: 'Invia messaggio',
    accept: 'Accetta',
    reject: 'Rifiuta',
    counterOffer: 'Controproposta',
    
    // Payment
    proceedToPayment: 'Procedi al pagamento',
    paymentMethod: 'Metodo di pagamento',
    shippingMethod: 'Metodo di spedizione',
    pickupInPerson: 'Ritiro di persona',
    courier: 'Corriere',
    
    // Footer
    legal: 'Legale',
    impressum: 'Impressum',
    agb: 'Termini',
    privacy: 'Privacy',
    rightOfWithdrawal: 'Diritto di recesso',
    disputeResolution: 'Risoluzione dispute',
    support: 'Supporto',
    contactUs: 'Contattaci',
    allRightsReserved: 'Tutti i diritti riservati',
    
    // Common
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    confirm: 'Conferma',
    close: 'Chiudi',
    
    // Footer
    tagline: 'Il marketplace italiano sicuro e affidabile',
    slogan: 'zazarap.de',
    newsletter: 'Newsletter',
    newsletterDesc: 'Ricevi offerte esclusive e novità',
    euDispute: 'Risoluzione controversie UE',

    // Admin
    preLaunchChecklist: 'Checklist Pre-Lancio',
    checkBeforeLaunch: 'Controlla tutti i punti prima del lancio',
    criticalConfig: 'Configurazione Critica',
    legalRequirements: 'Requisiti Legali',
    testingQA: 'Testing & QA',
    recommendedImprovements: 'Miglioramenti Consigliati',
    nextSteps: 'Prossimi Passi',
    launch: 'Lancia!',

    // Recommendations
    aiRecommendations: 'Raccomandazioni AI per te',
    generateRecommendations: 'Genera raccomandazioni',
    generating: 'Generazione in corso...',
    suggestedCategories: 'Categorie suggerite:',
    refreshRecommendations: 'Aggiorna raccomandazioni',
    discoverRecommendations: 'Scopri le raccomandazioni AI',
    exploreToGetSuggestions: 'Esplora alcuni annunci per ricevere suggerimenti personalizzati!',

    // Sales/Purchases
    mySales: 'Le Mie Vendite',
    myPurchases: 'I Miei Acquisti',
    totalSales: 'Vendite Totali',
    totalRevenue: 'Ricavi Totali',
    inEscrow: 'In Escrow',
    toShip: 'Da Spedire',
    buyer: 'Acquirente',
    seller: 'Venditore',
    shipping: 'Spedizione',
    addTracking: 'Aggiungi',
    goToChat: 'Vai alla Chat',
    noSalesYet: 'Nessuna vendita ancora',
    totalPurchases: 'Acquisti Totali',
    totalSpent: 'Totale Speso',
    inProgress: 'In Corso',
    noPurchasesYet: 'Nessun acquisto ancora',
    paymentStatus: 'Stato Pagamento',
    protectedInEscrow: '🔒 Protetto in Escrow',
    completed: '✅ Completato',

    // Edit Listing
    editListing: 'Modifica annuncio',
    existingImages: 'Immagini esistenti',
    remove: 'Rimuovi',
    addNewImages: 'Aggiungi nuove immagini',
    addMorePhotos: 'Aggiungi altre foto',
    saveChanges: 'Salva modifiche',
    selectCategory: 'Seleziona categoria',
    electronics: 'Elettronica',
    home: 'Casa',
    fashion: 'Moda',
    sports: 'Sport',
    auto: 'Auto',
    animals: 'Animali',
    other: 'Altro',

    // Filters & Status
    listingStatus: 'Stato Annuncio',
    allStatuses: 'Tutti gli stati',
    active: 'Attivi',
    sold: 'Venduti',
    expired: 'Scaduti',
    archived: 'Archiviati',
    
    publishDate: 'Data Pubblicazione',
    allDates: 'Tutte le date',
    today: 'Oggi',
    thisWeek: 'Ultima settimana',
    thisMonth: 'Ultimo mese',

    // Misc
    reviews: 'Recensioni',
    addReview: 'Aggiungi recensione',
    rating: 'Valutazione',
    stars: 'stelle',
    back: 'Indietro',
    listingNotFound: 'Annuncio non trovato',
    backToMarketplace: 'Torna al marketplace',
    share: 'Condividi',
    report: 'Segnala',
    reason: 'Motivo',
    description: 'Descrizione',
    sendReport: 'Invia segnalazione',
    cancel: 'Annulla',
    selectReason: 'Seleziona motivo',
    spam: 'Spam',
    inappropriate: 'Inappropriato',
    scam: 'Truffa',
    harassment: 'Molestie',
    other: 'Altro',
    favorites: 'Preferiti',
    noSavedAds: 'Nessun annuncio salvato',
    details: 'Dettagli',
    notifications: 'Notifiche',
    markAllRead: 'Segna tutte come lette',
    unread: 'non lette',
    view: 'Visualizza',
    markAsRead: 'Segna come letta',
    noNotifications: 'Nessuna notifica',
    new: 'Nuova',
    messages: 'Messaggi',
    chats: 'Chat',
    noChats: 'Nessuna chat',
    selectChat: 'Seleziona una chat',
    typeMessage: 'Scrivi un messaggio...',
    translate: 'Traduci',
    original: 'Originale',
    offerAccepted: 'Offerta accettata',
    offerRejected: 'Offerta rifiutata',
    offerReceived: 'Offerta ricevuta',
    congratulations: 'Congratulazioni',
    visitToReply: 'Visita per rispondere',
    thanks: 'Grazie',
    team: 'Il team di Zazarap',
    seoOptimization: 'Ottimizzazione SEO (Opzionale)',
    metaTitle: 'Meta Title (max 60 caratteri)',
    metaDesc: 'Meta Description (max 160 caratteri)',
    keywords: 'Keywords SEO (separate da virgola)',
    chars: 'caratteri',
    reportUser: 'Segnala utente',
    fundsReceived: 'Fondi Ricevuti',
    pending: 'In attesa',
    tracking: 'Tracking',
    add: 'Aggiungi',
    lastOffer: 'Ultima offerta',
    noReviews: 'Nessuna recensione'
    },
  
  tr: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Araçlar',
    'Autos': 'Arabalar',
    'Motorräder': 'Motosikletler',
    'Roller': 'Scooterlar',
    'Nutzfahrzeuge': 'Ticari Araçlar',
    'E-Scooter': 'Elektrikli Scooter',

    // Categories - Immobilien
    'Immobilien': 'Emlak',
    'Wohnungen & Häuser': 'Daireler ve Evler',
    'Mietobjekte': 'Kiralık',
    'Zimmer': 'Odalar',

    // Categories - Marktplatz
    'Marktplatz': 'Pazar Yeri',
    'Elektronik': 'Elektronik',
    'Sport & Freizeit': 'Spor ve Eğlence',
    'Möbel': 'Mobilya',
    'Haushalt & Küche': 'Ev ve Mutfak',
    'Videospiele': 'Video Oyunları',
    'Bücher': 'Kitaplar',
    'Musik & Filme': 'Müzik ve Filmler',
    'Kleidung': 'Giyim',
    'Kinder': 'Çocuk',
    'Garten': 'Bahçe',
    'Heimwerken': 'Kendin Yap',
    'Beauty & Pflege': 'Güzellik ve Bakım',

    // Categories - Tiere
    'Tiere': 'Hayvanlar',
    'Hunde': 'Köpekler',
    'Katzen': 'Kediler',
    'Vögel': 'Kuşlar',
    'Fische': 'Balıklar',
    'Nagetiere': 'Kemirgenler',
    'Reptilien (legal)': 'Sürüngenler (yasal)',
    'Tierzubehör': 'Evcil Hayvan Malzemeleri',

    // Categories - Jobs
    'Jobs': 'İş İlanları',
    'Stellenangebote': 'İş Teklifleri',
    'Lebenslauf': 'Özgeçmiş',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Hizmetler',
    'Nachhilfe': 'Özel Ders',
    'Reinigungsservice': 'Temizlik Hizmeti',
    'Transport & Umzüge': 'Taşıma ve Nakliyat',
    'Reparaturen': 'Tamirler',

    // Header & Navigation
    loginOrRegister: 'Giriş Yap veya Kayıt Ol',
    firstName: 'Ad',
    lastName: 'Soyad',
    address: 'Adres',
    country: 'Ülke',
    province: 'İl',
    region: 'Bölge',
    birthDate: 'Doğum Tarihi',
    completeProfile: 'Profili Tamamla',
    completeProfileDesc: 'Başlamak için profilinizi tamamlayın.',
    welcome: 'Hoşgeldiniz',
    welcomeBack: 'Hoş geldiniz, {name}! Sizi tekrar görmek güzel.',
    acceptPrivacy: 'Gizlilik Politikasını ve Şartları kabul ediyorum',
    marketingConsent: '(İsteğe bağlı) E-posta ile teklif almak istiyorum',
    
    home: 'Ana Sayfa',
    publish: 'İlan Ver',
    sales: 'Satışlar',
    purchases: 'Alışlar',
    messages: 'Mesajlar',
    notifications: 'Bildirimler',
    admin: 'Yönetici',
    
    // Marketplace
    searchPlaceholder: 'İlanları ara...',
    filters: 'Filtreler',
    category: 'Kategori',
    allCategories: 'Tüm Kategoriler',
    priceMin: 'Minimum Fiyat (€)',
    priceMax: 'Maksimum Fiyat (€)',
    city: 'Şehir',
    allCities: 'Tüm Şehirler',
    sortBy: 'Sırala',
    mostRecent: 'En Yeni',
    leastRecent: 'En Eski',
    priceAsc: 'Artan Fiyat',
    priceDesc: 'Azalan Fiyat',
    resetFilters: 'Filtreleri Sıfırla',
    adsFound: 'ilan bulundu',
    noAdsFound: 'İlan bulunamadı',
    
    // Listing
    contactSeller: 'Satıcıyla İletişime Geç',
    addToFavorites: 'Favorilere Ekle',
    removeFromFavorites: 'Favorilerden Çıkar',
    editListing: 'İlanı Düzenle',
    promote: 'Öne Çıkar',
    featuredListings: 'Öne Çıkan İlanlar',
    featured: 'Öne Çıkan',
    
    // Forms
    title: 'Başlık',
    description: 'Açıklama',
    price: 'Fiyat',
    images: 'Resimler',
    save: 'Kaydet',
    cancel: 'İptal',
    submit: 'Gönder',
    delete: 'Sil',
    
    // Chat
    sendMessage: 'Mesaj Gönder',
    accept: 'Kabul Et',
    reject: 'Reddet',
    counterOffer: 'Karşı Teklif',
    
    // Payment
    proceedToPayment: 'Ödemeye Geç',
    paymentMethod: 'Ödeme Yöntemi',
    shippingMethod: 'Kargo Yöntemi',
    pickupInPerson: 'Elden Teslim',
    courier: 'Kurye',
    
    // Footer
    legal: 'Yasal',
    impressum: 'Künye',
    agb: 'Şartlar',
    privacy: 'Gizlilik',
    rightOfWithdrawal: 'Cayma Hakkı',
    disputeResolution: 'Uyuşmazlık Çözümü',
    support: 'Destek',
    contactUs: 'İletişim',
    allRightsReserved: 'Tüm hakları saklıdır',
    
    // Common
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    confirm: 'Onayla',
    close: 'Kapat',
    
    // Footer
    tagline: 'Güvenli ve güvenilir Alman pazaryeri',
    slogan: 'zazarap.de',
    newsletter: 'Bülten',
    newsletterDesc: 'Özel teklifler ve haberler alın',
    euDispute: 'AB Uyuşmazlık Çözümü',

    // Admin
    preLaunchChecklist: 'Lansman Öncesi Kontrol Listesi',
    checkBeforeLaunch: 'Yayına geçmeden önce tüm noktaları kontrol edin',
    criticalConfig: 'Kritik Yapılandırma',
    legalRequirements: 'Yasal Gereksinimler',
    testingQA: 'Test & QA',
    recommendedImprovements: 'Önerilen İyileştirmeler',
    nextSteps: 'Sonraki Adımlar',
    launch: 'Başlat!',

    // Recommendations
    aiRecommendations: 'Sizin için AI Önerileri',
    generateRecommendations: 'Öneri oluştur',
    generating: 'Oluşturuluyor...',
    suggestedCategories: 'Önerilen Kategoriler:',
    refreshRecommendations: 'Önerileri yenile',
    discoverRecommendations: 'AI önerilerini keşfedin',
    exploreToGetSuggestions: 'Kişiselleştirilmiş öneriler almak için bazı ilanları keşfedin!',

    // Sales/Purchases
    mySales: 'Satışlarım',
    myPurchases: 'Alışlarım',
    totalSales: 'Toplam Satış',
    totalRevenue: 'Toplam Gelir',
    inEscrow: 'Emanette',
    toShip: 'Gönderilecek',
    buyer: 'Alıcı',
    seller: 'Satıcı',
    shipping: 'Kargo',
    addTracking: 'Ekle',
    goToChat: 'Sohbete Git',
    noSalesYet: 'Henüz satış yok',
    totalPurchases: 'Toplam Alış',
    totalSpent: 'Toplam Harcanan',
    inProgress: 'Devam Ediyor',
    noPurchasesYet: 'Henüz alış yok',
    paymentStatus: 'Ödeme Durumu',
    protectedInEscrow: '🔒 Emanette Korunuyor',
    completed: '✅ Tamamlandı',

    // Edit Listing
    editListing: 'İlanı Düzenle',
    existingImages: 'Mevcut Resimler',
    remove: 'Kaldır',
    addNewImages: 'Yeni resimler ekle',
    addMorePhotos: 'Daha fazla fotoğraf ekle',
    saveChanges: 'Değişiklikleri kaydet',
    selectCategory: 'Kategori seçin',
    electronics: 'Elektronik',
    home: 'Ev',
    fashion: 'Moda',
    sports: 'Spor',
    auto: 'Araba',
    animals: 'Hayvanlar',
    other: 'Diğer',

    // Filters & Status
    listingStatus: 'İlan Durumu',
    allStatuses: 'Tüm Durumlar',
    active: 'Aktif',
    sold: 'Satıldı',
    expired: 'Süresi Doldu',
    archived: 'Arşivlendi',
    
    publishDate: 'Yayınlanma Tarihi',
    allDates: 'Tüm Tarihler',
    today: 'Bugün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',

    // Misc
    reviews: 'Değerlendirmeler',
    addReview: 'Değerlendirme ekle',
    rating: 'Puan',
    stars: 'yıldız',
    back: 'Geri',
    listingNotFound: 'İlan bulunamadı',
    backToMarketplace: 'Pazaryerine dön',
    share: 'Paylaş',
    report: 'Bildir',
    reason: 'Sebep',
    description: 'Açıklama',
    sendReport: 'Bildirimi gönder',
    cancel: 'İptal',
    selectReason: 'Sebep seçin',
    spam: 'Spam',
    inappropriate: 'Uygunsuz',
    scam: 'Dolandırıcılık',
    harassment: 'Taciz',
    other: 'Diğer',
    favorites: 'Favoriler',
    noSavedAds: 'Kaydedilmiş ilan yok',
    details: 'Detaylar',
    notifications: 'Bildirimler',
    markAllRead: 'Tümünü okundu işaretle',
    unread: 'okunmamış',
    view: 'Görüntüle',
    markAsRead: 'Okundu işaretle',
    noNotifications: 'Bildirim yok',
    new: 'Yeni',
    messages: 'Mesajlar',
    chats: 'Sohbetler',
    noChats: 'Sohbet yok',
    selectChat: 'Bir sohbet seçin',
    typeMessage: 'Bir mesaj yazın...',
    translate: 'Çevir',
    original: 'Orijinal',
    offerAccepted: 'Teklif Kabul Edildi',
    offerRejected: 'Teklif Reddedildi',
    offerReceived: 'Teklif Alındı',
    congratulations: 'Tebrikler',
    visitToReply: 'Cevaplamak için ziyaret et',
    thanks: 'Teşekkürler',
    team: 'Zazarap Ekibi',
    seoOptimization: 'SEO Optimizasyonu (İsteğe Bağlı)',
    metaTitle: 'Meta Başlık (maks 60 karakter)',
    metaDesc: 'Meta Açıklama (maks 160 karakter)',
    keywords: 'SEO Anahtar Kelimeler (virgülle ayrılmış)',
    chars: 'karakter',
    reportUser: 'Kullanıcıyı Bildir',
    fundsReceived: 'Fonlar Alındı',
    pending: 'Beklemede',
    tracking: 'Takip',
    add: 'Ekle',
    lastOffer: 'Son Teklif',
    noReviews: 'Değerlendirme yok'
    },
  
  uk: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Транспорт',
    'Autos': 'Автомобілі',
    'Motorräder': 'Мотоцикли',
    'Roller': 'Скутери',
    'Nutzfahrzeuge': 'Комерційний транспорт',
    'E-Scooter': 'Електросамокати',

    // Categories - Immobilien
    'Immobilien': 'Нерухомість',
    'Wohnungen & Häuser': 'Квартири та Будинки',
    'Mietobjekte': 'Оренда',
    'Zimmer': 'Кімнати',

    // Categories - Marktplatz
    'Marktplatz': 'Маркетплейс',
    'Elektronik': 'Електроніка',
    'Sport & Freizeit': 'Спорт та Відпочинок',
    'Möbel': 'Меблі',
    'Haushalt & Küche': 'Дім та Кухня',
    'Videospiele': 'Відеоігри',
    'Bücher': 'Книги',
    'Musik & Filme': 'Музика та Фільми',
    'Kleidung': 'Одяг',
    'Kinder': 'Діти',
    'Garten': 'Сад',
    'Heimwerken': 'Зроби сам',
    'Beauty & Pflege': 'Краса та Догляд',

    // Categories - Tiere
    'Tiere': 'Тварини',
    'Hunde': 'Собаки',
    'Katzen': 'Коти',
    'Vögel': 'Птахи',
    'Fische': 'Риби',
    'Nagetiere': 'Гризуни',
    'Reptilien (legal)': 'Рептилії (легальні)',
    'Tierzubehör': 'Товари для тварин',

    // Categories - Jobs
    'Jobs': 'Робота',
    'Stellenangebote': 'Вакансії',
    'Lebenslauf': 'Резюме',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Послуги',
    'Nachhilfe': 'Репетиторство',
    'Reinigungsservice': 'Прибирання',
    'Transport & Umzüge': 'Транспорт та Переїзд',
    'Reparaturen': 'Ремонт',

    // Header & Navigation
    loginOrRegister: 'Увійти або Зареєструватися',
    firstName: "Ім'я",
    lastName: 'Прізвище',
    address: 'Адреса',
    country: 'Країна',
    province: 'Область',
    region: 'Регіон',
    birthDate: 'Дата народження',
    completeProfile: 'Заповнити профіль',
    completeProfileDesc: 'Заповніть свій профіль, щоб почати.',
    welcome: 'Ласкаво просимо',
    welcomeBack: 'Ласкаво просимо, {name}! Раді вас знову бачити.',
    acceptPrivacy: 'Я приймаю Політику конфіденційності та Умови',
    marketingConsent: '(Необов’язково) Я хочу отримувати пропозиції електронною поштою',
    
    home: 'Головна',
    publish: 'Розмістити',
    sales: 'Продажі',
    purchases: 'Покупки',
    messages: 'Повідомлення',
    notifications: 'Сповіщення',
    admin: 'Адмін',
    
    // Marketplace
    searchPlaceholder: 'Шукати оголошення...',
    filters: 'Фільтри',
    category: 'Категорія',
    allCategories: 'Всі категорії',
    priceMin: 'Мін. ціна (€)',
    priceMax: 'Макс. ціна (€)',
    city: 'Місто',
    allCities: 'Всі міста',
    sortBy: 'Сортувати',
    mostRecent: 'Найновіші',
    leastRecent: 'Найстаріші',
    priceAsc: 'Ціна за зростанням',
    priceDesc: 'Ціна за спаданням',
    resetFilters: 'Скинути фільтри',
    adsFound: 'оголошень знайдено',
    noAdsFound: 'Оголошень не знайдено',
    
    // Listing
    contactSeller: 'Зв\'язатися з продавцем',
    addToFavorites: 'Додати в обране',
    removeFromFavorites: 'Видалити з обраного',
    editListing: 'Редагувати оголошення',
    promote: 'Виділити',
    featuredListings: 'Рекомендовані оголошення',
    featured: 'Рекомендоване',
    
    // Forms
    title: 'Назва',
    description: 'Опис',
    price: 'Ціна',
    images: 'Зображення',
    save: 'Зберегти',
    cancel: 'Скасувати',
    submit: 'Надіслати',
    delete: 'Видалити',
    
    // Chat
    sendMessage: 'Надіслати повідомлення',
    accept: 'Прийняти',
    reject: 'Відхилити',
    counterOffer: 'Контрпропозиція',
    
    // Payment
    proceedToPayment: 'До оплати',
    paymentMethod: 'Спосіб оплати',
    shippingMethod: 'Спосіб доставки',
    pickupInPerson: 'Самовивіз',
    courier: 'Кур\'єр',
    
    // Footer
    legal: 'Юридична інформація',
    impressum: 'Імпресум',
    agb: 'Умови',
    privacy: 'Конфіденційність',
    rightOfWithdrawal: 'Право на відмову',
    disputeResolution: 'Вирішення спорів',
    support: 'Підтримка',
    contactUs: 'Контакти',
    allRightsReserved: 'Всі права захищені',
    
    // Common
    loading: 'Завантаження...',
    error: 'Помилка',
    success: 'Успішно',
    confirm: 'Підтвердити',
    close: 'Закрити',
    
    // Footer
    tagline: 'Безпечна та надійна німецька торговельна платформа',
    slogan: 'zazarap.de',
    newsletter: 'Розсилка',
    newsletterDesc: 'Отримуйте ексклюзивні пропозиції та новини',
    euDispute: 'Вирішення спорів ЄС',

    // Admin
    preLaunchChecklist: 'Контрольний список перед запуском',
    checkBeforeLaunch: 'Перевірте всі пункти перед запуском',
    criticalConfig: 'Критична конфігурація',
    legalRequirements: 'Юридичні вимоги',
    testingQA: 'Тестування та QA',
    recommendedImprovements: 'Рекомендовані покращення',
    nextSteps: 'Наступні кроки',
    launch: 'Запустити!',

    // Recommendations
    aiRecommendations: 'AI рекомендації для вас',
    generateRecommendations: 'Створити рекомендації',
    generating: 'Генерується...',
    suggestedCategories: 'Рекомендовані категорії:',
    refreshRecommendations: 'Оновити рекомендації',
    discoverRecommendations: 'Відкрийте AI рекомендації',
    exploreToGetSuggestions: 'Перегляньте кілька оголошень, щоб отримати персоналізовані пропозиції!',

    // Sales/Purchases
    mySales: 'Мої Продажі',
    myPurchases: 'Мої Покупки',
    totalSales: 'Всього Продажів',
    totalRevenue: 'Загальний Дохід',
    inEscrow: 'На Ескроу',
    toShip: 'До Відправки',
    buyer: 'Покупець',
    seller: 'Продавець',
    shipping: 'Доставка',
    addTracking: 'Додати',
    goToChat: 'До Чату',
    noSalesYet: 'Ще немає продажів',
    totalPurchases: 'Всього Покупок',
    totalSpent: 'Всього Витрачено',
    inProgress: 'В Процесі',
    noPurchasesYet: 'Ще немає покупок',
    paymentStatus: 'Статус Оплати',
    protectedInEscrow: '🔒 Захищено Ескроу',
    completed: '✅ Завершено',

    // Edit Listing
    editListing: 'Редагувати оголошення',
    existingImages: 'Наявні зображення',
    remove: 'Видалити',
    addNewImages: 'Додати нові зображення',
    addMorePhotos: 'Додати більше фото',
    saveChanges: 'Зберегти зміни',
    selectCategory: 'Виберіть категорію',
    electronics: 'Електроніка',
    home: 'Дім',
    fashion: 'Мода',
    sports: 'Спорт',
    auto: 'Авто',
    animals: 'Тварини',
    other: 'Інше',

    // Filters & Status
    listingStatus: 'Статус оголошення',
    allStatuses: 'Всі статуси',
    active: 'Активні',
    sold: 'Продані',
    expired: 'Минули',
    archived: 'Архівовані',
    
    publishDate: 'Дата публікації',
    allDates: 'Всі дати',
    today: 'Сьогодні',
    thisWeek: 'Цей тиждень',
    thisMonth: 'Цей місяць',

    // Misc
    reviews: 'Відгуки',
    addReview: 'Додати відгук',
    rating: 'Рейтинг',
    stars: 'зірки',
    back: 'Назад',
    listingNotFound: 'Оголошення не знайдено',
    backToMarketplace: 'Назад до магазину',
    share: 'Поділитися',
    report: 'Поскаржитись',
    reason: 'Причина',
    description: 'Опис',
    sendReport: 'Надіслати скаргу',
    cancel: 'Скасувати',
    selectReason: 'Виберіть причину',
    spam: 'Спам',
    inappropriate: 'Неприйнятний вміст',
    scam: 'Шахрайство',
    harassment: 'Переслідування',
    other: 'Інше',
    favorites: 'Обране',
    noSavedAds: 'Немає збережених оголошень',
    details: 'Деталі',
    notifications: 'Сповіщення',
    markAllRead: 'Позначити всі як прочитані',
    unread: 'непрочитаних',
    view: 'Переглянути',
    markAsRead: 'Позначити як прочитане',
    noNotifications: 'Немає сповіщень',
    new: 'Нове',
    messages: 'Повідомлення',
    chats: 'Чати',
    noChats: 'Немає чатів',
    selectChat: 'Виберіть чат',
    typeMessage: 'Введіть повідомлення...',
    translate: 'Перекласти',
    original: 'Оригінал',
    offerAccepted: 'Пропозиція прийнята',
    offerRejected: 'Пропозиція відхилена',
    offerReceived: 'Отримано пропозицію',
    congratulations: 'Вітаємо',
    visitToReply: 'Відвідайте, щоб відповісти',
    thanks: 'Дякуємо',
    team: 'Команда Zazarap',
    seoOptimization: 'SEO Оптимізація (Необов\'язково)',
    metaTitle: 'Meta Title (макс 60 символів)',
    metaDesc: 'Meta Description (макс 160 символів)',
    keywords: 'SEO Ключові слова (через кому)',
    chars: 'символів',
    reportUser: 'Поскаржитися на користувача',
    fundsReceived: 'Кошти отримано',
    pending: 'В очікуванні',
    tracking: 'Відстеження',
    add: 'Додати',
    lastOffer: 'Остання пропозиція',
    noReviews: 'Немає відгуків'
    },
  
  fr: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Véhicules',
    'Autos': 'Voitures',
    'Motorräder': 'Motos',
    'Roller': 'Scooters',
    'Nutzfahrzeuge': 'Véhicules utilitaires',
    'E-Scooter': 'Trottinettes électriques',

    // Categories - Immobilien
    'Immobilien': 'Immobilier',
    'Wohnungen & Häuser': 'Appartements et Maisons',
    'Mietobjekte': 'Locations',
    'Zimmer': 'Chambres',

    // Categories - Marktplatz
    'Marktplatz': 'Marché',
    'Elektronik': 'Électronique',
    'Sport & Freizeit': 'Sport et Loisirs',
    'Möbel': 'Meubles',
    'Haushalt & Küche': 'Maison et Cuisine',
    'Videospiele': 'Jeux Vidéo',
    'Bücher': 'Livres',
    'Musik & Filme': 'Musique et Films',
    'Kleidung': 'Vêtements',
    'Kinder': 'Enfants',
    'Garten': 'Jardin',
    'Heimwerken': 'Bricolage',
    'Beauty & Pflege': 'Beauté et Soins',

    // Categories - Tiere
    'Tiere': 'Animaux',
    'Hunde': 'Chiens',
    'Katzen': 'Chats',
    'Vögel': 'Oiseaux',
    'Fische': 'Poissons',
    'Nagetiere': 'Rongeurs',
    'Reptilien (legal)': 'Reptiles (légaux)',
    'Tierzubehör': 'Accessoires animaux',

    // Categories - Jobs
    'Jobs': 'Emploi',
    'Stellenangebote': 'Offres d\'emploi',
    'Lebenslauf': 'CV',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Services',
    'Nachhilfe': 'Cours particuliers',
    'Reinigungsservice': 'Nettoyage',
    'Transport & Umzüge': 'Transport et Déménagement',
    'Reparaturen': 'Réparations',

    // Header & Navigation
    loginOrRegister: 'Connexion ou Inscription',
    firstName: 'Prénom',
    lastName: 'Nom',
    address: 'Adresse',
    country: 'Pays',
    province: 'Province',
    region: 'Région',
    birthDate: 'Date de naissance',
    completeProfile: 'Compléter le profil',
    completeProfileDesc: 'Complétez votre profil pour commencer.',
    welcome: 'Bienvenue',
    welcomeBack: 'Bienvenue, {name} ! Content de vous revoir.',
    acceptPrivacy: 'J\'accepte la politique de confidentialité et les CGV',
    marketingConsent: '(Optionnel) Je souhaite recevoir des offres par email',
    
    home: 'Accueil',
    publish: 'Publier',
    sales: 'Ventes',
    purchases: 'Achats',
    messages: 'Messages',
    notifications: 'Notifications',
    admin: 'Admin',
    
    // Marketplace
    searchPlaceholder: 'Rechercher des annonces...',
    filters: 'Filtres',
    category: 'Catégorie',
    allCategories: 'Toutes les catégories',
    priceMin: 'Prix min (€)',
    priceMax: 'Prix max (€)',
    city: 'Ville',
    allCities: 'Toutes les villes',
    sortBy: 'Trier par',
    mostRecent: 'Plus récents',
    leastRecent: 'Plus anciens',
    priceAsc: 'Prix croissant',
    priceDesc: 'Prix décroissant',
    resetFilters: 'Réinitialiser les filtres',
    adsFound: 'annonces trouvées',
    noAdsFound: 'Aucune annonce trouvée',
    
    // Listing
    contactSeller: 'Contacter le vendeur',
    addToFavorites: 'Ajouter aux favoris',
    removeFromFavorites: 'Retirer des favoris',
    editListing: 'Modifier l\'annonce',
    promote: 'Mettre en avant',
    featuredListings: 'Annonces en vedette',
    featured: 'En vedette',
    
    // Forms
    title: 'Titre',
    description: 'Description',
    price: 'Prix',
    images: 'Images',
    save: 'Enregistrer',
    cancel: 'Annuler',
    submit: 'Envoyer',
    delete: 'Supprimer',
    
    // Footer
    legal: 'Mentions légales',
    impressum: 'Impressum',
    agb: 'CGV',
    privacy: 'Confidentialité',
    rightOfWithdrawal: 'Droit de rétractation',
    disputeResolution: 'Résolution des litiges',
    support: 'Support',
    contactUs: 'Nous contacter',
    allRightsReserved: 'Tous droits réservés',
    tagline: 'La place de marché allemande sûre et fiable',
    slogan: 'zazarap.de',
    newsletter: 'Newsletter',
    newsletterDesc: 'Recevez des offres exclusives et des actualités',
    euDispute: 'Résolution des litiges UE',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    confirm: 'Confirmer',
    close: 'Fermer',
    reviews: 'Avis',
    back: 'Retour',
    noReviews: 'Aucun avis'
  },

  pl: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Pojazdy',
    'Autos': 'Samochody',
    'Motorräder': 'Motocykle',
    'Roller': 'Skutery',
    'Nutzfahrzeuge': 'Pojazdy użytkowe',
    'E-Scooter': 'Hulajnogi elektryczne',

    // Categories - Immobilien
    'Immobilien': 'Nieruchomości',
    'Wohnungen & Häuser': 'Mieszkania i Domy',
    'Mietobjekte': 'Wynajem',
    'Zimmer': 'Pokoje',

    // Categories - Marktplatz
    'Marktplatz': 'Rynek',
    'Elektronik': 'Elektronika',
    'Sport & Freizeit': 'Sport i Rekreacja',
    'Möbel': 'Meble',
    'Haushalt & Küche': 'Dom i Kuchnia',
    'Videospiele': 'Gry Wideo',
    'Bücher': 'Książki',
    'Musik & Filme': 'Muzyka i Filmy',
    'Kleidung': 'Odzież',
    'Kinder': 'Dzieci',
    'Garten': 'Ogród',
    'Heimwerken': 'Majsterkowanie',
    'Beauty & Pflege': 'Uroda i Pielęgnacja',

    // Categories - Tiere
    'Tiere': 'Zwierzęta',
    'Hunde': 'Psy',
    'Katzen': 'Koty',
    'Vögel': 'Ptaki',
    'Fische': 'Ryby',
    'Nagetiere': 'Gryzonie',
    'Reptilien (legal)': 'Gady (legalne)',
    'Tierzubehör': 'Akcesoria dla zwierząt',

    // Categories - Jobs
    'Jobs': 'Praca',
    'Stellenangebote': 'Oferty pracy',
    'Lebenslauf': 'CV',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Usługi',
    'Nachhilfe': 'Korepetycje',
    'Reinigungsservice': 'Sprzątanie',
    'Transport & Umzüge': 'Transport i Przeprowadzki',
    'Reparaturen': 'Naprawy',

    // Header & Navigation
    loginOrRegister: 'Zaloguj się lub Zarejestruj',
    firstName: 'Imię',
    lastName: 'Nazwisko',
    address: 'Adres',
    country: 'Kraj',
    province: 'Województwo',
    region: 'Region',
    birthDate: 'Data urodzenia',
    completeProfile: 'Uzupełnij profil',
    completeProfileDesc: 'Uzupełnij swój profil, aby rozpocząć.',
    welcome: 'Witamy',
    welcomeBack: 'Witaj, {name}! Miło Cię znów widzieć.',
    acceptPrivacy: 'Akceptuję politykę prywatności i regulamin',
    marketingConsent: '(Opcjonalnie) Chcę otrzymywać oferty e-mailem',
    
    home: 'Strona główna',
    publish: 'Dodaj ogłoszenie',
    sales: 'Sprzedaże',
    purchases: 'Zakupy',
    messages: 'Wiadomości',
    notifications: 'Powiadomienia',
    admin: 'Admin',
    
    // Marketplace
    searchPlaceholder: 'Szukaj ogłoszeń...',
    filters: 'Filtry',
    category: 'Kategoria',
    allCategories: 'Wszystkie kategorie',
    priceMin: 'Cena min (€)',
    priceMax: 'Cena max (€)',
    city: 'Miasto',
    allCities: 'Wszystkie miasta',
    sortBy: 'Sortuj według',
    mostRecent: 'Najnowsze',
    leastRecent: 'Najstarsze',
    priceAsc: 'Cena rosnąco',
    priceDesc: 'Cena malejąco',
    resetFilters: 'Resetuj filtry',
    adsFound: 'ogłoszeń znalezionych',
    noAdsFound: 'Nie znaleziono ogłoszeń',
    
    // Listing
    contactSeller: 'Skontaktuj się ze sprzedawcą',
    addToFavorites: 'Dodaj do ulubionych',
    removeFromFavorites: 'Usuń z ulubionych',
    editListing: 'Edytuj ogłoszenie',
    promote: 'Promuj',
    featuredListings: 'Wyróżnione ogłoszenia',
    featured: 'Wyróżnione',
    
    // Forms
    title: 'Tytuł',
    description: 'Opis',
    price: 'Cena',
    images: 'Zdjęcia',
    save: 'Zapisz',
    cancel: 'Anuluj',
    submit: 'Wyślij',
    delete: 'Usuń',
    
    // Footer
    legal: 'Informacje prawne',
    impressum: 'Impressum',
    agb: 'Regulamin',
    privacy: 'Prywatność',
    rightOfWithdrawal: 'Prawo do odstąpienia',
    disputeResolution: 'Rozwiązywanie sporów',
    support: 'Wsparcie',
    contactUs: 'Kontakt',
    allRightsReserved: 'Wszelkie prawa zastrzeżone',
    tagline: 'Bezpieczna i niezawodna niemiecka platforma handlowa',
    slogan: 'zazarap.de',
    newsletter: 'Newsletter',
    newsletterDesc: 'Otrzymuj ekskluzywne oferty i aktualności',
    euDispute: 'Rozwiązywanie sporów UE',
    
    // Common
    loading: 'Ładowanie...',
    error: 'Błąd',
    success: 'Sukces',
    confirm: 'Potwierdź',
    close: 'Zamknij',
    reviews: 'Opinie',
    back: 'Wstecz',
    noReviews: 'Brak opinii'
  },

  en: {
    // Categories - Fahrzeuge
    'Fahrzeuge': 'Vehicles',
    'Autos': 'Cars',
    'Motorräder': 'Motorcycles',
    'Roller': 'Scooters',
    'Nutzfahrzeuge': 'Commercial Vehicles',
    'E-Scooter': 'E-Scooters',

    // Categories - Immobilien
    'Immobilien': 'Real Estate',
    'Wohnungen & Häuser': 'Apartments & Houses',
    'Mietobjekte': 'Rentals',
    'Zimmer': 'Rooms',

    // Categories - Marktplatz
    'Marktplatz': 'Marketplace',
    'Elektronik': 'Electronics',
    'Sport & Freizeit': 'Sports & Leisure',
    'Möbel': 'Furniture',
    'Haushalt & Küche': 'Home & Kitchen',
    'Videospiele': 'Video Games',
    'Bücher': 'Books',
    'Musik & Filme': 'Music & Movies',
    'Kleidung': 'Clothing',
    'Kinder': 'Kids',
    'Garten': 'Garden',
    'Heimwerken': 'DIY',
    'Beauty & Pflege': 'Beauty & Care',

    // Categories - Tiere
    'Tiere': 'Pets',
    'Hunde': 'Dogs',
    'Katzen': 'Cats',
    'Vögel': 'Birds',
    'Fische': 'Fish',
    'Nagetiere': 'Rodents',
    'Reptilien (legal)': 'Reptiles (legal)',
    'Tierzubehör': 'Pet Supplies',

    // Categories - Jobs
    'Jobs': 'Jobs',
    'Stellenangebote': 'Job Offers',
    'Lebenslauf': 'Resume',

    // Categories - Dienstleistungen
    'Dienstleistungen': 'Services',
    'Nachhilfe': 'Tutoring',
    'Reinigungsservice': 'Cleaning Service',
    'Transport & Umzüge': 'Transport & Moving',
    'Reparaturen': 'Repairs',

    // Header & Navigation
    loginOrRegister: 'Login or Register',
    firstName: 'First Name',
    lastName: 'Last Name',
    address: 'Address',
    country: 'Country',
    province: 'Province',
    region: 'Region',
    birthDate: 'Date of Birth',
    completeProfile: 'Complete Profile',
    completeProfileDesc: 'Complete your profile to get started.',
    welcome: 'Welcome',
    welcomeBack: 'Welcome, {name}! Nice to see you again.',
    acceptPrivacy: 'I accept the Privacy Policy and Terms',
    marketingConsent: '(Optional) I want to receive offers via email',
    
    home: 'Home',
    publish: 'Post',
    sales: 'Sales',
    purchases: 'Purchases',
    messages: 'Messages',
    notifications: 'Notifications',
    admin: 'Admin',
    
    // Marketplace
    searchPlaceholder: 'Search listings...',
    filters: 'Filters',
    category: 'Category',
    allCategories: 'All Categories',
    priceMin: 'Min Price (€)',
    priceMax: 'Max Price (€)',
    city: 'City',
    allCities: 'All Cities',
    sortBy: 'Sort by',
    mostRecent: 'Most Recent',
    leastRecent: 'Oldest',
    priceAsc: 'Price Ascending',
    priceDesc: 'Price Descending',
    resetFilters: 'Reset Filters',
    'dashboard.recentListings': 'Recent Listings',
    'dashboard.exportCSV': 'Export CSV',
    'dashboard.listingsByCategory': 'Listings by Category',
    adsFound: 'ads found',
    noAdsFound: 'No ads found',
    
    // Listing
    contactSeller: 'Contact Seller',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    editListing: 'Edit Listing',
    promote: 'Promote',
    featuredListings: 'Featured Listings',
    featured: 'Featured',
    
    // Forms
    title: 'Title',
    description: 'Description',
    price: 'Price',
    images: 'Images',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    
    // Chat
    sendMessage: 'Send Message',
    accept: 'Accept',
    reject: 'Reject',
    counterOffer: 'Counter Offer',
    
    // Payment
    proceedToPayment: 'Proceed to Payment',
    paymentMethod: 'Payment Method',
    shippingMethod: 'Shipping Method',
    pickupInPerson: 'Pickup in Person',
    courier: 'Courier',
    
    // Footer
    legal: 'Legal',
    impressum: 'Imprint',
    agb: 'Terms',
    privacy: 'Privacy',
    rightOfWithdrawal: 'Right of Withdrawal',
    disputeResolution: 'Dispute Resolution',
    support: 'Support',
    contactUs: 'Contact Us',
    allRightsReserved: 'All rights reserved',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',
    
    // Footer
    tagline: 'The secure and reliable German marketplace',
    slogan: 'zazarap.de',
    newsletter: 'Newsletter',
    newsletterDesc: 'Receive exclusive offers and news',
    euDispute: 'EU Dispute Resolution',

    // Admin
    preLaunchChecklist: 'Pre-Launch Checklist',
    checkBeforeLaunch: 'Check all points before going live',
    criticalConfig: 'Critical Configuration',
    legalRequirements: 'Legal Requirements',
    testingQA: 'Testing & QA',
    recommendedImprovements: 'Recommended Improvements',
    nextSteps: 'Next Steps',
    launch: 'Launch!',

    // Recommendations
    aiRecommendations: 'AI Recommendations for You',
    generateRecommendations: 'Generate Recommendations',
    generating: 'Generating...',
    suggestedCategories: 'Suggested Categories:',
    refreshRecommendations: 'Refresh Recommendations',
    discoverRecommendations: 'Discover AI Recommendations',
    exploreToGetSuggestions: 'Explore some listings to get personalized suggestions!',

    // Sales/Purchases
    mySales: 'My Sales',
    myPurchases: 'My Purchases',
    totalSales: 'Total Sales',
    totalRevenue: 'Total Revenue',
    inEscrow: 'In Escrow',
    toShip: 'To Ship',
    buyer: 'Buyer',
    seller: 'Seller',
    shipping: 'Shipping',
    addTracking: 'Add',
    goToChat: 'Go to Chat',
    noSalesYet: 'No sales yet',
    totalPurchases: 'Total Purchases',
    totalSpent: 'Total Spent',
    inProgress: 'In Progress',
    noPurchasesYet: 'No purchases yet',
    paymentStatus: 'Payment Status',
    protectedInEscrow: '🔒 Protected in Escrow',
    completed: '✅ Completed',

    // Edit Listing
    editListing: 'Edit Listing',
    existingImages: 'Existing Images',
    remove: 'Remove',
    addNewImages: 'Add new images',
    addMorePhotos: 'Add more photos',
    saveChanges: 'Save changes',
    selectCategory: 'Select category',
    electronics: 'Electronics',
    home: 'Home',
    fashion: 'Fashion',
    sports: 'Sports',
    auto: 'Auto',
    animals: 'Animals',
    other: 'Other',

    // Filters & Status
    listingStatus: 'Listing Status',
    allStatuses: 'All Statuses',
    active: 'Active',
    sold: 'Sold',
    expired: 'Expired',
    archived: 'Archived',
    
    publishDate: 'Publish Date',
    allDates: 'All Dates',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',

    // Misc
    reviews: 'Reviews',
    addReview: 'Add review',
    rating: 'Rating',
    stars: 'stars',
    back: 'Back',
    listingNotFound: 'Listing not found',
    backToMarketplace: 'Back to Marketplace',
    share: 'Share',
    report: 'Report',
    reason: 'Reason',
    description: 'Description',
    sendReport: 'Send Report',
    cancel: 'Cancel',
    selectReason: 'Select reason',
    spam: 'Spam',
    inappropriate: 'Inappropriate',
    scam: 'Scam',
    harassment: 'Harassment',
    other: 'Other',
    favorites: 'Favorites',
    noSavedAds: 'No saved ads',
    details: 'Details',
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    unread: 'unread',
    view: 'View',
    markAsRead: 'Mark as read',
    noNotifications: 'No notifications',
    new: 'New',
    messages: 'Messages',
    chats: 'Chats',
    noChats: 'No chats',
    selectChat: 'Select a chat',
    typeMessage: 'Type a message...',
    translate: 'Translate',
    original: 'Original',
    offerAccepted: 'Offer Accepted',
    offerRejected: 'Offer Rejected',
    offerReceived: 'Offer Received',
    congratulations: 'Congratulations',
    visitToReply: 'Visit to reply',
    thanks: 'Thanks',
    team: 'The Zazarap Team',
    seoOptimization: 'SEO Optimization (Optional)',
    metaTitle: 'Meta Title (max 60 chars)',
    metaDesc: 'Meta Description (max 160 chars)',
    keywords: 'SEO Keywords (comma separated)',
    chars: 'chars',
    reportUser: 'Report User',
    fundsReceived: 'Funds Received',
    pending: 'Pending',
    tracking: 'Tracking',
    add: 'Add',
    lastOffer: 'Last Offer',
    noReviews: 'No reviews'
    }
    };

const LanguageContext = createContext();

/**
 * @returns {{language: string, setLanguage: (lang: string) => void, t: (key: string, params?: object) => string, translations: Record<string, any>}}
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

/** @param {{children: React.ReactNode}} props */
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    // 1. Check URL path prefix (/de, /it, etc.)
    if (typeof window !== 'undefined') {
      const pathLang = window.location.pathname.split('/')[1];
      if (SUPPORTED_LANGS.includes(pathLang)) {
        return pathLang;
      }
    }

    // 2. Check cookie
    if (typeof document !== 'undefined') {
      const cookieLang = document.cookie.split('; ').find(row => row.startsWith('zazarap_lang='));
      if (cookieLang) {
        const lang = cookieLang.split('=')[1];
        if (SUPPORTED_LANGS.includes(lang)) return lang;
      }
    }

    // 3. Check localStorage (backward compatibility)
    const saved = localStorage.getItem('zazarap_language');
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

    // 4. Auto-detect browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
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

  const setLanguage = (newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return;
    
    // Update state
    setLanguageState(newLang);
    
    // Update cookie (30 days expiry)
    if (typeof document !== 'undefined') {
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `zazarap_lang=${newLang}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    // Update localStorage (backward compatibility)
    localStorage.setItem('zazarap_language', newLang);
    
    // Update HTML lang attribute
    document.documentElement.lang = newLang;
    
    // Update URL if needed (without reload)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const currentLangPrefix = currentPath.split('/')[1];
      
      if (SUPPORTED_LANGS.includes(currentLangPrefix)) {
        // Replace existing lang prefix
        const newPath = currentPath.replace(`/${currentLangPrefix}`, `/${newLang}`);
        window.history.replaceState({}, '', newPath + window.location.search);
      } else {
        // Add lang prefix
        const newPath = `/${newLang}${currentPath}`;
        window.history.replaceState({}, '', newPath + window.location.search);
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, params) => {
    // 1. Check namespace-based i18n first (new format: "home.hero.title")
    if (i18n[key]) {
      let translated = i18n[key][language] || i18n[key][DEFAULT_LANG] || key;
      
      // Replace parameters like {name}, {price}, etc.
      if (params && typeof translated === 'string') {
        Object.keys(params).forEach(paramKey => {
          translated = translated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
        });
      }
      
      return translated;
    }

    // 2. Try legacy flat translations
    const translated = translations[language]?.[key] || translations['de']?.[key];
    if (translated) return translated;

    // 3. Return key as fallback
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations, currentLanguage: language, changeLanguage: setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}