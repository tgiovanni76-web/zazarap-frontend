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
    "accessDenied": { de: "Zugriff verweigert", it: "Accesso Negato", en: "Access Denied", fr: "Accès refusé", pl: "Odmowa dostępu", tr: "Erişim Engellendi", uk: "Доступ заборонено" },
    "adminOnly": { de: "Nur Administratoren können auf diese Seite zugreifen.", it: "Solo gli amministratori possono accedere a questa pagina.", en: "Only administrators can access this page.", fr: "Seuls les administrateurs peuvent accéder à cette page.", pl: "Tylko administratorzy mogą uzyskać dostęp do tej strony.", tr: "Bu sayfaya yalnızca yöneticiler erişebilir.", uk: "Тільки адміністратори можуть отримати доступ до цієї сторінки." },

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
  "dashboard.exportCSV": { de: "CSV exportieren", it: "Esporta CSV", en: "Export CSV", fr: "Exporter CSV", pl: "Eksportuj CSV", tr: "CSV Dışa Aktar", uk: "Експортувати CSV" }
  "dashboard.listingsActivity": { de: "Anzeigen-Aktivit e4t (Letzte 7 Tage)", it: "Attivit e0 annunci (ultimi 7 giorni)", en: "Listings Activity (Last 7 Days)", fr: "Activit e9 des annonces (7 derniers jours)", pl: "Aktywno5b07 og42osze44 (ostatnie 7 dni)", tr: "30lan Aktivitesi (Son 7 G fcn)", uk: "Активність оголошень (останні 7 днів)" },
  "dashboard.legend.active": { de: "Aktive Anzeigen", it: "Annunci attivi", en: "Active Listings", fr: "Annonces actives", pl: "Aktywne ogłoszenia", tr: "Aktif 30lanlar", uk: "Активні оголошення" },
  "dashboard.legend.sold": { de: "Verkaufte Artikel", it: "Oggetti venduti", en: "Sold Items", fr: "Articles vendus", pl: "Sprzedane", tr: "Sat31lanlar", uk: "Продані товари" },

  "admin.moderation.rejectReasonLabel": { de: "Ablehnungsgrund", it: "Motivo del rifiuto", en: "Rejection reason", fr: "Raison du refus", pl: "Pow f3d odrzucenia", tr: "Reddetme nedeni", uk: "Причина відхилення" },
  "admin.moderation.rejectReasonRequired": { de: "Bitte gib einen Ablehnungsgrund an", it: "Inserisci un motivo per il rifiuto", en: "Please provide a rejection reason", fr: "Veuillez indiquer une raison du refus", pl: "Podaj pow f3d odrzucenia", tr: "L fctfen reddetme nedeni girin", uk: "Будь ласка, вкажіть причину відхилення" },

  "moderation.updated": { de: "Anzeige aktualisiert", it: "Annuncio aggiornato", en: "Listing updated", fr: "Annonce mise  e0 jour", pl: "Og42oszenie zaktualizowano", tr: "30lan g fcncellendi", uk: "Оголошення оновлено" },
  "moderation.deleted": { de: "Anzeige gel f6scht", it: "Annuncio eliminato", en: "Listing deleted", fr: "Annonce supprim e9e", pl: "Og42oszenie usuni19to", tr: "30lan silindi", uk: "Оголошення видалено" }
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

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('zazarap_language');
    if (saved) return saved;

    // Auto-detect browser language
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

    return 'de'; // Default to German
    });

    useEffect(() => {
    localStorage.setItem('zazarap_language', language);
    document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
    // 1. Check namespace-based i18n first (new format: "home.hero.title")
    if (i18n[key]) {
      return i18n[key][language] || i18n[key][DEFAULT_LANG] || key;
    }

    // 2. Try legacy flat translations
    const translated = translations[language]?.[key] || translations['de']?.[key];
    if (translated) return translated;

    // 3. Return key as fallback
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}