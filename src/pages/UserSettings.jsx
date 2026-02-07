import React, { useState, useEffect } from 'react';
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
      toast.success(t('settings.profileUpdated'));
    },
    onError: () => {
      toast.error(t('settings.profileError'));
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
      toast.success(t('settings.notifUpdated'));
    },
    onError: () => {
      toast.error(t('settings.notifError'));
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
    toast.success(t('settings.langChanged'));
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('settings.title')}</h1>
        <p className="text-slate-600">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            {t('settings.tab.profile')}
          </TabsTrigger>
          <TabsTrigger value="language">
            <Globe className="h-4 w-4 mr-2" />
            {t('settings.tab.language')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {t('settings.tab.notifications')}
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            {t('settings.tab.email')}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.profile.title')}</CardTitle>
              <CardDescription>{t('settings.profile.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('settings.profile.firstName')}</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder={t('settings.profile.firstNamePh')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('settings.profile.lastName')}</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder={t('settings.profile.lastNamePh')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-500">{t('settings.profile.emailNote')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('settings.profile.bio')}</Label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder={t('settings.profile.bioPh')}
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
                    {t('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveChanges')}
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
              <CardTitle>{t('settings.lang.title')}</CardTitle>
              <CardDescription>{t('settings.lang.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t('settings.lang.select')}</Label>
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
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
                    <p className="text-sm font-medium text-blue-900">{t('settings.lang.infoTitle')}</p>
                    <p className="text-sm text-blue-700 mt-1">{t('settings.lang.infoDesc')}</p>
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
              <CardTitle>{t('settings.notif.title')}</CardTitle>
              <CardDescription>{t('settings.notif.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notif.newOffer')}</Label>
                    <p className="text-sm text-slate-500">{t('settings.notif.newOfferDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.newOfferOnFavorite}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, newOfferOnFavorite: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notif.messageReplies')}</Label>
                    <p className="text-sm text-slate-500">{t('settings.notif.messageRepliesDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.messageReplies}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, messageReplies: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notif.statusUpdates')}</Label>
                    <p className="text-sm text-slate-500">{t('settings.notif.statusUpdatesDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.statusUpdates}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, statusUpdates: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notif.purchase')}</Label>
                    <p className="text-sm text-slate-500">{t('settings.notif.purchaseDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.purchaseNotifications}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, purchaseNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notif.shipping')}</Label>
                    <p className="text-sm text-slate-500">{t('settings.notif.shippingDesc')}</p>
                  </div>
                  <Switch
                    checked={notifData.shippingNotifications}
                    onCheckedChange={(checked) => setNotifData({ ...notifData, shippingNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.notif.priceDrop')}</Label>
                    <p className="text-sm text-slate-500">{t('settings.notif.priceDropDesc')}</p>
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
                    {t('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveChanges')}
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
              <CardTitle>{t('settings.email.title')}</CardTitle>
              <CardDescription>{t('settings.email.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.email.notifications')}</Label>
                  <p className="text-sm text-slate-500">{t('settings.email.notificationsDesc')}</p>
                </div>
                <Switch
                  checked={notifData.emailNotifications}
                  onCheckedChange={(checked) => setNotifData({ ...notifData, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>{t('settings.email.note')}:</strong> {t('settings.email.noteDesc')}
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
                    {t('settings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveChanges')}
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