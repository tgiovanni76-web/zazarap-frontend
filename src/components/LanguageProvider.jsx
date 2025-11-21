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
    close: 'Schließen'
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
    close: 'Chiudi'
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
    close: 'Kapat'
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
    close: 'Закрити'
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