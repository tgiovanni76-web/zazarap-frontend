import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  de: {
    // Header & Navigation
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
    lastOffer: 'Letztes Angebot'
    },
  
  it: {
    // Header & Navigation
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
    lastOffer: 'Ultima offerta'
    },
  
  tr: {
    // Header & Navigation
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
    lastOffer: 'Son Teklif'
    },
  
  uk: {
    // Header & Navigation
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
    lastOffer: 'Остання пропозиція'
    },
  
  en: {
    // Header & Navigation
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
    lastOffer: 'Last Offer'
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
    return saved || 'de'; // Default to German
  });

  useEffect(() => {
    localStorage.setItem('zazarap_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    // Try to translate the key directly
    const translated = translations[language]?.[key] || translations['de'][key];
    if (translated) return translated;

    // If key matches a known category (case-insensitive check), try to translate it
    if (typeof key === 'string') {
      const lowerKey = key.toLowerCase();
      // Check if we have a translation for this category in the current language
      // We look for keys that match the category name in lowercase
      // e.g. "Elettronica" -> check for "electronics" or "elettronica" key in translation map
      
      // Common category mappings to translation keys
      const categoryMap = {
        'elektronik': 'electronics', 'elettronica': 'electronics', 'electronics': 'electronics',
        'haus': 'home', 'casa': 'home', 'home': 'home',
        'mode': 'fashion', 'moda': 'fashion', 'fashion': 'fashion',
        'sport': 'sports', 'sports': 'sports',
        'auto': 'auto',
        'tiere': 'animals', 'animali': 'animals', 'animals': 'animals',
        'andere': 'other', 'altro': 'other', 'other': 'other'
      };

      const mappedKey = categoryMap[lowerKey];
      if (mappedKey) {
         return translations[language]?.[mappedKey] || translations['de'][mappedKey] || key;
      }
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}