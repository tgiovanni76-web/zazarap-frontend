import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Settings, CheckCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [isTriggeringNotifs, setIsTriggeringNotifs] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ userId: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: preferences = [{}] } = useQuery({
    queryKey: ['notificationPrefs', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ userId: user.email });
      return prefs.length > 0 ? prefs : [{
        newOfferOnFavorite: true,
        messageReplies: true,
        statusUpdates: true,
        emailNotifications: true,
        priceDropNotifications: true
      }];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Benachrichtigung gelöscht');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      for (const notif of unread) {
        await base44.entities.Notification.update(notif.id, { read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Alle als gelesen markiert');
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs) => {
      const existing = await base44.entities.NotificationPreference.filter({ userId: user.email });
      if (existing.length > 0) {
        await base44.entities.NotificationPreference.update(existing[0].id, newPrefs);
      } else {
        await base44.entities.NotificationPreference.create({ userId: user.email, ...newPrefs });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
      toast.success('Einstellungen gespeichert');
    }
  });

  const triggerSmartNotifications = async () => {
    setIsTriggeringNotifs(true);
    try {
      await base44.functions.invoke('generateSmartNotifications', {});
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Benachrichtigungen aktualisiert!');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setIsTriggeringNotifs(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const prefs = preferences[0] || {};

  const typeIcons = {
    offer: '💰',
    message: '💬',
    status_update: '📢',
    reminder: '⏰'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Benachrichtigungen
            {unreadCount > 0 && (
              <Badge className="bg-red-500">{unreadCount}</Badge>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Button
              onClick={triggerSmartNotifications}
              disabled={isTriggeringNotifs}
              variant="outline"
            >
              {isTriggeringNotifs ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsReadMutation.mutate()}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Alle lesen
            </Button>
          )}
        </div>
      </div>

      {showSettings && (
        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Benachrichtigungs-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotif">E-Mail Benachrichtigungen</Label>
              <Switch
                id="emailNotif"
                checked={prefs.emailNotifications}
                onCheckedChange={(checked) => 
                  updatePreferencesMutation.mutate({ ...prefs, emailNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="messageNotif">Nachrichten</Label>
              <Switch
                id="messageNotif"
                checked={prefs.messageReplies}
                onCheckedChange={(checked) => 
                  updatePreferencesMutation.mutate({ ...prefs, messageReplies: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="favoriteNotif">Favoriten-Angebote</Label>
              <Switch
                id="favoriteNotif"
                checked={prefs.newOfferOnFavorite}
                onCheckedChange={(checked) => 
                  updatePreferencesMutation.mutate({ ...prefs, newOfferOnFavorite: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="priceDropNotif">Preissenkungen</Label>
              <Switch
                id="priceDropNotif"
                checked={prefs.priceDropNotifications}
                onCheckedChange={(checked) => 
                  updatePreferencesMutation.mutate({ ...prefs, priceDropNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="statusNotif">Status-Updates</Label>
              <Switch
                id="statusNotif"
                checked={prefs.statusUpdates}
                onCheckedChange={(checked) => 
                  updatePreferencesMutation.mutate({ ...prefs, statusUpdates: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Keine Benachrichtigungen
            </h3>
            <p className="text-slate-500">
              Du bist auf dem neuesten Stand!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card 
              key={notification.id}
              className={`transition-all ${notification.read ? 'bg-slate-50' : 'bg-white border-2 border-blue-200'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{typeIcons[notification.type] || '🔔'}</span>
                      <h3 className={`font-semibold ${!notification.read ? 'text-blue-600' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge className="bg-blue-500 text-xs">Neu</Badge>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(notification.created_date).toLocaleString('de-DE')}</span>
                      {notification.linkUrl && (
                        <Link 
                          to={notification.linkUrl}
                          className="text-blue-600 hover:underline"
                          onClick={() => !notification.read && markAsReadMutation.mutate(notification.id)}
                        >
                          Anzeigen →
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}