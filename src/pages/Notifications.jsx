import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, MessageSquare, DollarSign, AlertCircle, CheckCircle, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../components/LanguageProvider';

export default function Notifications() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // User
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Notifications list
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ userId: user.email }, '-created_date', 200),
    enabled: !!user,
    initialData: [],
  });

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  // Single-item actions
  const markAsRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const unread = (notifications || []).filter(n => !n.read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  const deleteOne = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  // Minimal multi-select state + bulk actions
  const [selectedIds, setSelectedIds] = React.useState(new Set());
  const allSelected = (notifications?.length || 0) > 0 && selectedIds.size === notifications.length;

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allSelected) return new Set();
      return new Set((notifications || []).map(n => n.id));
    });
  };

  const bulkMarkRead = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => base44.entities.Notification.update(id, { read: true })));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.email] });
      const previous = queryClient.getQueryData(['notifications', user?.email]);
      queryClient.setQueryData(['notifications', user?.email], (old = []) => old.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
      setSelectedIds(new Set());
      return { previous };
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['notifications', user?.email], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => base44.entities.Notification.delete(id)));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.email] });
      const previous = queryClient.getQueryData(['notifications', user?.email]);
      queryClient.setQueryData(['notifications', user?.email], (old = []) => old.filter((n) => !ids.includes(n.id)));
      setSelectedIds(new Set());
      return { previous };
    },
    onError: (_e, _ids, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['notifications', user?.email], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.email, 'unread'] });
    },
  });

  // Icons/colors
  const typeIcons = { offer: DollarSign, message: MessageSquare, status_update: AlertCircle, reminder: Bell };
  const typeColors = { offer: 'text-green-600', message: 'text-blue-600', status_update: 'text-orange-600', reminder: 'text-purple-600' };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">{t('notifications')}</h2>
          {unreadCount > 0 && (
            <p className="text-slate-600 mt-1">{unreadCount} {t('unread')}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label={t('notifications.selectOne') || t('notifications')} />
            {t('notifications')}
          </label>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead.mutate()} variant="outline">
              {t('markAllRead')}
            </Button>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="sticky top-16 z-10 bg-white/90 backdrop-blur border rounded-md p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-700">{t('notifications.selectedCount', { count: selectedIds.size }) || selectedIds.size}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulkMarkRead.mutate(Array.from(selectedIds))}>
              <Check className="h-4 w-4 mr-1" /> {t('markAsRead')}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => bulkDelete.mutate(Array.from(selectedIds))}>
              <Trash2 className="h-4 w-4 mr-1" /> {t('delete')}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = typeIcons[n.type] || Bell;
          const colorClass = typeColors[n.type];
          const mainText = n.templateKey ? t(n.templateKey, n.templateParams || {}) : (n.title || '');
          const secondaryText = n.templateKey ? [
            n.templateParams?.listingTitle || null,
            (n.templateParams?.amount != null) ? `${t('payment.email.amount')}: € ${n.templateParams.amount}` : null,
            n.templateParams?.snippet || null,
          ].filter(Boolean).join(' • ') : (n.message || '');
          return (
            <Card key={n.id} className={`transition-all ${!n.read ? 'bg-blue-50 border-blue-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <Checkbox checked={selectedIds.has(n.id)} onCheckedChange={() => toggleSelectOne(n.id)} aria-label={t('notifications.selectOne') || t('notifications')} />
                  </div>
                  <div className={`mt-1 ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold">{mainText || n.title || ''}</h3>
                      {!n.read && (
                        <Badge variant="default" className="bg-blue-600">{t('new')}</Badge>
                      )}
                    </div>
                    <p className="text-slate-700 mb-2">{secondaryText}</p>
                    <p className="text-xs text-slate-500">{format(new Date(n.created_date), 'dd/MM/yyyy HH:mm')}</p>
                    <div className="flex gap-2 mt-3">
                      {n.linkUrl && (
                        <Link to={n.linkUrl}>
                          <Button size="sm" onClick={() => !n.read && markAsRead.mutate(n.id)}>
                            {t('view')}
                          </Button>
                        </Link>
                      )}
                      {!n.read && (
                        <Button size="sm" variant="outline" onClick={() => markAsRead.mutate(n.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('markAsRead')}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => deleteOne.mutate(n.id)}>
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