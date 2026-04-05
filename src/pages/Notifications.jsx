import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../components/LanguageProvider';

export default function Notifications() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ userId: user.email }, '-created_date'),
    enabled: !!user,
  });

  React.useEffect(() => {
    if (user) {
      console.log('[Notifications] env', window.location.hostname);
      console.log('[Notifications] user', user.email);
      console.log('[Notifications] count', Array.isArray(notifications) ? notifications.length : 'n/a');
      if (notifications && notifications[0]) console.log('[Notifications] sample', notifications[0]);
    }
  }, [user, notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => base44.entities.Notification.update(n.id, { read: true }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const typeIcons = {
    offer: DollarSign,
    message: MessageSquare,
    status_update: AlertCircle,
    reminder: Bell
  };

  const typeColors = {
    offer: 'text-green-600',
    message: 'text-blue-600',
    status_update: 'text-orange-600',
    reminder: 'text-purple-600'
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">{t('notifications')}</h2>
          {unreadCount > 0 && (
            <p className="text-slate-600 mt-1">{unreadCount} {t('unread')}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsReadMutation.mutate()} variant="outline">
            {t('markAllRead')}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(notification => {
          const Icon = typeIcons[notification.type] || Bell;
          const colorClass = typeColors[notification.type];
          
          return (
            <Card 
              key={notification.id}
              className={`transition-all ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="bg-blue-600">{t('new')}</Badge>
                      )}
                    </div>
                    <p className="text-slate-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(notification.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {notification.linkUrl && (
                        <Link to={notification.linkUrl}>
                          <Button 
                            size="sm" 
                            onClick={() => !notification.read && markAsReadMutation.mutate(notification.id)}
                          >
                            {t('view')}
                          </Button>
                        </Link>
                      )}
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('markAsRead')}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {notifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('noNotifications')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}