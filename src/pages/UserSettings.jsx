import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Globe, Mail, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function UserSettings() {
  const { t, changeLanguage, currentLanguage } = useLanguage();
  const queryClient = useQueryClient();

  // Local i18n for missing keys in LanguageProvider
  const TX = {
    de: {
      photoSectionTitle: 'Profilfoto',
      uploadBtnAdd: 'Foto hinzufügen',
      uploadBtnChange: 'Foto ändern',
      uploadBtnUploading: 'Lade hoch…',
      removeBtn: 'Entfernen',
      formatsHint: 'Formate: JPG/PNG • Max 5 MB',
      altProfilePhoto: 'Profilfoto',
      toastInvalidFormat: 'Ungültiges Format. Verwenden Sie JPG oder PNG.',
      toastTooLarge: 'Datei zu groß (max. 5 MB).',
      toastPhotoUpdated: 'Foto aktualisiert',
      toastUploadFailed: 'Upload fehlgeschlagen',
      toastPhotoRemoved: 'Foto entfernt',
      toastRemoveFailed: 'Foto kann nicht entfernt werden'
    },
    it: {
      photoSectionTitle: 'Foto profilo',
      uploadBtnAdd: 'Aggiungi foto',
      uploadBtnChange: 'Cambia foto',
      uploadBtnUploading: 'Carico…',
      removeBtn: 'Rimuovi',
      formatsHint: 'Formati: JPG/PNG • Max 5 MB',
      altProfilePhoto: 'Foto profilo',
      toastInvalidFormat: 'Formato non valido. Usa JPG o PNG.',
      toastTooLarge: 'File troppo grande (max 5 MB).',
      toastPhotoUpdated: 'Foto aggiornata',
      toastUploadFailed: 'Caricamento non riuscito',
      toastPhotoRemoved: 'Foto rimossa',
      toastRemoveFailed: 'Impossibile rimuovere la foto'
    },
    en: {
      photoSectionTitle: 'Profile photo',
      uploadBtnAdd: 'Add photo',
      uploadBtnChange: 'Change photo',
      uploadBtnUploading: 'Uploading…',
      removeBtn: 'Remove',
      formatsHint: 'Formats: JPG/PNG • Max 5 MB',
      altProfilePhoto: 'Profile photo',
      toastInvalidFormat: 'Invalid format. Use JPG or PNG.',
      toastTooLarge: 'File too large (max 5 MB).',
      toastPhotoUpdated: 'Photo updated',
      toastUploadFailed: 'Upload failed',
      toastPhotoRemoved: 'Photo removed',
      toastRemoveFailed: 'Unable to remove photo'
    },
    fr: {
      photoSectionTitle: 'Photo de profil',
      uploadBtnAdd: 'Ajouter une photo',
      uploadBtnChange: 'Changer la photo',
      uploadBtnUploading: 'Téléversement…',
      removeBtn: 'Supprimer',
      formatsHint: 'Formats : JPG/PNG • Max 5 Mo',
      altProfilePhoto: 'Photo de profil',
      toastInvalidFormat: 'Format invalide. Utilisez JPG ou PNG.',
      toastTooLarge: 'Fichier trop volumineux (max 5 Mo).',
      toastPhotoUpdated: 'Photo mise à jour',
      toastUploadFailed: "Échec du téléversement",
      toastPhotoRemoved: 'Photo supprimée',
      toastRemoveFailed: 'Impossible de supprimer la photo'
    },
    pl: {
      photoSectionTitle: 'Zdjęcie profilowe',
      uploadBtnAdd: 'Dodaj zdjęcie',
      uploadBtnChange: 'Zmień zdjęcie',
      uploadBtnUploading: 'Przesyłanie…',
      removeBtn: 'Usuń',
      formatsHint: 'Formaty: JPG/PNG • Maks 5 MB',
      altProfilePhoto: 'Zdjęcie profilowe',
      toastInvalidFormat: 'Nieprawidłowy format. Użyj JPG lub PNG.',
      toastTooLarge: 'Plik za duży (maks. 5 MB).',
      toastPhotoUpdated: 'Zaktualizowano zdjęcie',
      toastUploadFailed: 'Przesyłanie nie powiodło się',
      toastPhotoRemoved: 'Usunięto zdjęcie',
      toastRemoveFailed: 'Nie można usunąć zdjęcia'
    },
    tr: {
      photoSectionTitle: 'Profil fotoğrafı',
      uploadBtnAdd: 'Fotoğraf ekle',
      uploadBtnChange: 'Fotoğrafı değiştir',
      uploadBtnUploading: 'Yükleniyor…',
      removeBtn: 'Kaldır',
      formatsHint: 'Biçimler: JPG/PNG • Maks 5 MB',
      altProfilePhoto: 'Profil fotoğrafı',
      toastInvalidFormat: 'Geçersiz format. JPG veya PNG kullanın.',
      toastTooLarge: 'Dosya çok büyük (maks 5 MB).',
      toastPhotoUpdated: 'Fotoğraf güncellendi',
      toastUploadFailed: 'Yükleme başarısız',
      toastPhotoRemoved: 'Fotoğraf kaldırıldı',
      toastRemoveFailed: 'Fotoğraf kaldırılamıyor'
    },
    uk: {
      photoSectionTitle: 'Фото профілю',
      uploadBtnAdd: 'Додати фото',
      uploadBtnChange: 'Змінити фото',
      uploadBtnUploading: 'Завантаження…',
      removeBtn: 'Видалити',
      formatsHint: 'Формати: JPG/PNG • Макс 5 МБ',
      altProfilePhoto: 'Фото профілю',
      toastInvalidFormat: 'Неприпустимий формат. Використовуйте JPG або PNG.',
      toastTooLarge: 'Файл завеликий (макс 5 МБ).',
      toastPhotoUpdated: 'Фото оновлено',
      toastUploadFailed: 'Не вдалося завантажити',
      toastPhotoRemoved: 'Фото видалено',
      toastRemoveFailed: 'Не вдалося видалити фото'
    }
  };
  const tt = (k) => (TX[currentLanguage] || TX.en)[k] || TX.en[k] || k;

  // Fallback translations for settings.* keys (avoid mixed languages)
  const SETTINGS_TX = {
    it: {
      'settings.title': 'Impostazioni',
      'settings.subtitle': 'Gestisci profilo, lingua e notifiche',
      'settings.tab.profile': 'Profilo',
      'settings.tab.language': 'Lingua',
      'settings.tab.notifications': 'Notifiche',
      'settings.tab.email': 'E‑mail',
      'settings.profile.title': 'Informazioni profilo',
      'settings.profile.desc': 'Aggiorna i tuoi dati personali',
      'settings.profile.firstName': 'Nome',
      'settings.profile.lastName': 'Cognome',
      'settings.profile.firstNamePh': 'Giovanni',
      'settings.profile.lastNamePh': 'Rossi',
      'settings.profile.email': 'Indirizzo e‑mail',
      'settings.profile.emailNote': "L'indirizzo e‑mail non può essere modificato",
      'settings.profile.phone': 'Numero di telefono',
      'settings.profile.bio': 'Su di me',
      'settings.profile.bioPh': 'Raccontaci qualcosa di te…',
      'settings.saving': 'Salvataggio…',
      'settings.saveChanges': 'Salva modifiche',
      'settings.profileUpdated': 'Profilo aggiornato',
      'settings.profileError': 'Errore durante il salvataggio',
      'settings.lang.title': "Lingua dell'app",
      'settings.lang.desc': 'Scegli la tua lingua preferita',
      'settings.lang.select': 'Seleziona lingua',
      'settings.lang.infoTitle': 'Lingua aggiornata',
      'settings.lang.infoDesc': "La lingua viene applicata subito in tutta l'app",
      'settings.langChanged': 'Lingua aggiornata',
      'settings.notif.title': 'Notifiche',
      'settings.notif.desc': 'Scegli quali notifiche ricevere',
      'settings.notif.newOffer': 'Offerte sugli annunci salvati',
      'settings.notif.newOfferDesc': 'Ricevi una notifica quando qualcuno fa un’offerta',
      'settings.notif.messageReplies': 'Risposte ai messaggi',
      'settings.notif.messageRepliesDesc': 'Avvisami quando qualcuno risponde in chat',
      'settings.notif.statusUpdates': 'Aggiornamenti stato trattativa',
      'settings.notif.statusUpdatesDesc': 'Ricevi notifiche su riserve/accettazioni',
      'settings.notif.purchase': 'Conferme di acquisto',
      'settings.notif.purchaseDesc': 'Notifiche per transazioni riuscite',
      'settings.notif.shipping': 'Informazioni di spedizione',
      'settings.notif.shippingDesc': 'Aggiornamenti spedizione e consegna',
      'settings.notif.priceDrop': 'Riduzioni di prezzo',
      'settings.notif.priceDropDesc': 'Avvisi quando il prezzo diminuisce',
      'settings.notifUpdated': 'Preferenze aggiornate',
      'settings.notifError': 'Errore nel salvataggio preferenze',
      'settings.email.title': 'Preferenze e‑mail',
      'settings.email.desc': 'Ricevi aggiornamenti importanti via e‑mail',
      'settings.email.notifications': 'Notifiche via e‑mail',
      'settings.email.notificationsDesc': 'Riepiloghi e aggiornamenti importanti',
      'settings.email.note': 'Nota',
      'settings.email.noteDesc': 'Puoi disiscriverti in qualsiasi momento.'
    },
    en: {
      'settings.title': 'Settings',
      'settings.subtitle': 'Manage profile, language and notifications',
      'settings.tab.profile': 'Profile',
      'settings.tab.language': 'Language',
      'settings.tab.notifications': 'Notifications',
      'settings.tab.email': 'Email',
      'settings.profile.title': 'Profile information',
      'settings.profile.desc': 'Update your personal data',
      'settings.profile.firstName': 'First name',
      'settings.profile.lastName': 'Last name',
      'settings.profile.firstNamePh': 'John',
      'settings.profile.lastNamePh': 'Doe',
      'settings.profile.email': 'Email address',
      'settings.profile.emailNote': "Email can't be changed",
      'settings.profile.phone': 'Phone number',
      'settings.profile.bio': 'About me',
      'settings.profile.bioPh': 'Tell us about yourself…',
      'settings.saving': 'Saving…',
      'settings.saveChanges': 'Save changes',
      'settings.profileUpdated': 'Profile updated',
      'settings.profileError': 'Save failed',
      'settings.lang.title': 'App language',
      'settings.lang.desc': 'Choose your preferred language',
      'settings.lang.select': 'Select language',
      'settings.lang.infoTitle': 'Language updated',
      'settings.lang.infoDesc': 'Language is applied immediately',
      'settings.langChanged': 'Language updated',
      'settings.notif.title': 'Notifications',
      'settings.notif.desc': 'Choose what to receive',
      'settings.notif.newOffer': 'Offers on favorites',
      'settings.notif.newOfferDesc': 'Be notified when someone makes an offer',
      'settings.notif.messageReplies': 'Message replies',
      'settings.notif.messageRepliesDesc': 'Alert when someone replies in chat',
      'settings.notif.statusUpdates': 'Status updates',
      'settings.notif.statusUpdatesDesc': 'Reservation/acceptance updates',
      'settings.notif.purchase': 'Purchase confirmations',
      'settings.notif.purchaseDesc': 'Successful purchase notifications',
      'settings.notif.shipping': 'Shipping information',
      'settings.notif.shippingDesc': 'Shipping and delivery updates',
      'settings.notif.priceDrop': 'Price drops',
      'settings.notif.priceDropDesc': 'Alerts when price decreases',
      'settings.notifUpdated': 'Preferences updated',
      'settings.notifError': 'Failed to save preferences',
      'settings.email.title': 'Email preferences',
      'settings.email.desc': 'Get important updates via email',
      'settings.email.notifications': 'Email notifications',
      'settings.email.notificationsDesc': 'Summaries and important updates',
      'settings.email.note': 'Note',
      'settings.email.noteDesc': 'You can unsubscribe at any time.'
    }
  };
  const trS = (k, fb) => {
    const v = t(k);
    if (v !== k) return v;
    const local = (SETTINGS_TX[currentLanguage] || SETTINGS_TX.en)[k];
    return local ?? fb ?? k;
  };

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notificationPrefs } = useQuery({
    queryKey: ['notificationPrefs', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ userId: user.email });
      return prefs[0] || null;
    },
    enabled: !!user,
  });

  // Local state for form
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  });

  const [notifData, setNotifData] = useState({
    newOfferOnFavorite: true,
    messageReplies: true,
    statusUpdates: true,
    emailNotifications: true,
    purchaseNotifications: true,
    shippingNotifications: true,
    priceDropNotifications: true,
  });

  // Foto profilo: stato e handler upload/rimozione
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error(tt('toastInvalidFormat'));
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(tt('toastTooLarge'));
      e.target.value = '';
      return;
    }
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profileImageUrl: file_url });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success(tt('toastPhotoUpdated'));
    } catch (err) {
      toast.error(tt('toastUploadFailed'));
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handlePhotoRemove = async () => {
    setUploadingPhoto(true);
    try {
      await base44.auth.updateMe({ profileImageUrl: '' });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success(tt('toastPhotoRemoved'));
    } catch (err) {
      toast.error(tt('toastRemoveFailed'));
    } finally {
      setUploadingPhoto(false);
    }
  };

   // Initialize form data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (notificationPrefs) {
      setNotifData({
        newOfferOnFavorite: notificationPrefs.newOfferOnFavorite ?? true,
        messageReplies: notificationPrefs.messageReplies ?? true,
        statusUpdates: notificationPrefs.statusUpdates ?? true,
        emailNotifications: notificationPrefs.emailNotifications ?? true,
        purchaseNotifications: notificationPrefs.purchaseNotifications ?? true,
        shippingNotifications: notificationPrefs.shippingNotifications ?? true,
        priceDropNotifications: notificationPrefs.priceDropNotifications ?? true,
      });
    }
  }, [notificationPrefs]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success(trS('settings.profileUpdated'));
    },
    onError: () => {
      toast.error(trS('settings.profileError'));
    },
  });

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data) => {
      if (notificationPrefs) {
        await base44.entities.NotificationPreference.update(notificationPrefs.id, data);
      } else {
        await base44.entities.NotificationPreference.create({
          userId: user.email,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
      toast.success(trS('settings.notifUpdated'));
    },
    onError: () => {
      toast.error(trS('settings.notifError'));
    },
  });

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleNotificationsSave = () => {
    updateNotificationsMutation.mutate(notifData);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    toast.success(trS('settings.langChanged'));
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{trS('settings.title')}</h1>
        <p className="text-slate-600">{trS('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            {trS('settings.tab.profile')}
          </TabsTrigger>
          <TabsTrigger value="language">
            <Globe className="h-4 w-4 mr-2" />
            {trS('settings.tab.language')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {trS('settings.tab.notifications')}
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            {trS('settings.tab.email')}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{trS('settings.profile.title')}</CardTitle>
              <CardDescription>{trS('settings.profile.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-base font-semibold">{tt('photoSectionTitle')}</h3>
                <section id="photo" className="flex flex-col items-center gap-3">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={tt('altProfilePhoto')} className="h-28 w-28 rounded-full object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-slate-200 border border-slate-300" />
                  )}
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoFileChange} />
                    <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
                      {uploadingPhoto ? tt('uploadBtnUploading') : user?.profileImageUrl ? tt('uploadBtnChange') : tt('uploadBtnAdd')}
                    </Button>
                    {user?.profileImageUrl && (
                      <Button type="button" variant="outline" onClick={handlePhotoRemove} disabled={uploadingPhoto}>
                        {tt('removeBtn')}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{tt('formatsHint')}</p>
                </section>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{trS('settings.profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder={trS('settings.profile.firstNamePh')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{trS('settings.profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder={trS('settings.profile.lastNamePh')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{trS('settings.profile.email')}</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">{trS('settings.profile.emailNote')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{trS('settings.profile.phone')}</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder={currentLanguage === 'de' ? '+49 123 456789' : currentLanguage === 'it' ? '+39 345 678 9012' : '+1 555 123 4567'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{trS('settings.profile.bio')}</Label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder={trS('settings.profile.bioPh')}
                  className="w-full min-h-24 px-3 py-2 border rounded-md"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500">{profileData.bio.length}/500</p>
              </div>

              <Separator />

              <Button
                onClick={handleProfileSave}
                disabled={updateProfileMutation.isPending}
                className="w-full md:w-auto"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {trS('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {trS('settings.saveChanges')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{trS('settings.lang.title')}</CardTitle>
              <CardDescription>{trS('settings.lang.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{trS('settings.lang.select')}</Label>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder={trS('settings.lang.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="pl">🇵🇱 Polski</SelectItem>
                    <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                    <SelectItem value="uk">🇺🇦 Українська</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{trS('settings.lang.infoTitle')}</p>
                    <p className="text-sm text-blue-700 mt-1">{trS('settings.lang.infoDesc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{trS('settings.notif.title')}</CardTitle>
              <CardDescription>{trS('settings.notif.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{trS('settings.notif.newOffer')}</Label>
                    <p className="text-sm text-slate-500">{trS('settings.notif.newOfferDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.newOfferOnFavorite}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, newOfferOnFavorite: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{trS('settings.notif.messageReplies')}</Label>
                    <p className="text-sm text-slate-500">{trS('settings.notif.messageRepliesDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.messageReplies}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, messageReplies: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{trS('settings.notif.statusUpdates')}</Label>
                    <p className="text-sm text-slate-500">{trS('settings.notif.statusUpdatesDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.statusUpdates}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, statusUpdates: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{trS('settings.notif.purchase')}</Label>
                    <p className="text-sm text-slate-500">{trS('settings.notif.purchaseDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.purchaseNotifications}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, purchaseNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{trS('settings.notif.shipping')}</Label>
                    <p className="text-sm text-slate-500">{trS('settings.notif.shippingDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.shippingNotifications}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, shippingNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{trS('settings.notif.priceDrop')}</Label>
                    <p className="text-sm text-slate-500">{trS('settings.notif.priceDropDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.priceDropNotifications}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, priceDropNotifications: checked })}
                  />
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleNotificationsSave}
                disabled={updateNotificationsMutation.isPending}
                className="w-full md:w-auto"
              >
                {updateNotificationsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {trS('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {trS('settings.saveChanges')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Preferences Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>{trS('settings.email.title')}</CardTitle>
              <CardDescription>{trS('settings.email.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{trS('settings.email.notifications')}</Label>
                  <p className="text-sm text-slate-500">{trS('settings.email.notificationsDesc')}</p>
                </div>
                <Switch
                  checked={notifData.emailNotifications}
                  onCheckedChange={(checked) => setNotifData({ ...notifData, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>{trS('settings.email.note')}:</strong> {trS('settings.email.noteDesc')}
                </p>
              </div>

              <Button
                onClick={handleNotificationsSave}
                disabled={updateNotificationsMutation.isPending}
                className="w-full md:w-auto"
              >
                {updateNotificationsMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {trS('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {trS('settings.saveChanges')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}