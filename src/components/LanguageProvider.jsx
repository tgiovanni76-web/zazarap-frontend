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
    launch: 'Launch!'
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
    launch: 'Lancia!'
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
    launch: 'Başlat!'
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
    launch: 'Запустити!'
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
    launch: 'Launch!'
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
    return translations[language]?.[key] || translations['de'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}