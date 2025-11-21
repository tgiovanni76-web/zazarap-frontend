import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Heart, MessageCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ['notificationPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ userId: user.email });
      if (prefs.length === 0) {
        const newPref = await base44.entities.NotificationPreference.create({
          userId: user.email,
          newOfferOnFavorite: true,
          messageReplies: true,
          statusUpdates: true,
          emailNotifications: true
        });
        return [newPref];
      }
      return prefs;
    },
    enabled: !!user,
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: ({ field, value }) => 
      base44.entities.NotificationPreference.update(preferences[0].id, { [field]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preferenze aggiornate');
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentPrefs = preferences[0] || {};

  const settings = [
    {
      icon: Heart,
      title: 'Offerte su Preferiti',
      description: 'Ricevi notifiche quando qualcuno fa un\'offerta su annunci che hai salvato tra i preferiti',
      field: 'newOfferOnFavorite',
      color: 'text-red-600'
    },
    {
      icon: MessageCircle,
      title: 'Risposte ai Messaggi',
      description: 'Ricevi notifiche quando qualcuno risponde ai tuoi messaggi',
      field: 'messageReplies',
      color: 'text-blue-600'
    },
    {
      icon: RefreshCw,
      title: 'Aggiornamenti Trattative',
      description: 'Ricevi notifiche per cambiamenti di stato nelle tue trattative attive',
      field: 'statusUpdates',
      color: 'text-green-600'
    },
    {
      icon: Mail,
      title: 'Notifiche Email',
      description: 'Ricevi una copia delle notifiche anche via email',
      field: 'emailNotifications',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-indigo-600" />
        <h2 className="text-3xl font-bold">Preferenze Notifiche</h2>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-700">
            Personalizza quali notifiche vuoi ricevere per rimanere aggiornato sulle tue attività nel marketplace.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {settings.map((setting) => {
          const Icon = setting.icon;
          const isEnabled = currentPrefs[setting.field];
          
          return (
            <Card key={setting.field} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className={`p-3 rounded-lg bg-slate-100 ${setting.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{setting.title}</h3>
                      <p className="text-sm text-slate-600">{setting.description}</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => updatePreferenceMutation.mutate({ 
                          field: setting.field, 
                          value: e.target.checked 
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 bg-slate-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-slate-600 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Come funzionano le notifiche?</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Le notifiche in-app appaiono nell'icona campanella in alto</li>
                <li>• Le notifiche email vengono inviate solo se abilitate</li>
                <li>• Puoi modificare queste preferenze in qualsiasi momento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}