import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Camera, UserRoundCog } from 'lucide-react';

const SNOOZE_KEY = 'onboarding_snooze_until_v1';
const isSnoozed = () => {
  try {
    const v = localStorage.getItem(SNOOZE_KEY);
    if (!v) return false;
    const ts = parseInt(v, 10);
    return Number.isFinite(ts) && Date.now() < ts;
  } catch { return false; }
};
const snoozeDays = (days) => {
  try { localStorage.setItem(SNOOZE_KEY, String(Date.now() + days * 24 * 60 * 60 * 1000)); } catch {}
};

export default function FirstRunChecklist({ user, onAddPhotoClick }) {
  const [hidden, setHidden] = useState(false);

  const steps = useMemo(() => {
    if (!user) return [];
    const hasPhoto = !!(user.profilePhoto || user.profileImageUrl);
    const profileDone = !!(user.birthDate && user.privacyAccepted);
    return [
      {
        key: 'photo',
        done: hasPhoto,
        label: 'Profilbild hinzufügen',
        actionLabel: 'Foto hinzufügen',
        onAction: onAddPhotoClick,
        icon: Camera,
      },
      {
        key: 'profile',
        done: profileDone,
        label: 'Profil vervollständigen',
        actionLabel: 'Profil öffnen',
        link: createPageUrl('CompleteProfile'),
        icon: UserRoundCog,
      },
    ];
  }, [user, onAddPhotoClick]);

  const pendingCount = steps.filter(s => !s.done).length;
  const shouldShow = !!user && !hidden && !isSnoozed() && pendingCount > 0;

  useEffect(() => {
    if (shouldShow) {
      base44.analytics.track({ eventName: 'onboarding_checklist_shown', properties: { pending: pendingCount } });
    }
  }, [shouldShow, pendingCount]);

  if (!shouldShow) return null;

  return (
    <div className="mt-3">
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Schnellstart-Check
            <Badge className="ml-2" variant="secondary">{pendingCount} offen</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center justify-between gap-3 py-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${s.done ? 'text-green-600' : 'text-slate-400'}`} />
                    <span className={`text-sm ${s.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{s.label}</span>
                  </div>
                  {s.done ? (
                    <Badge variant="outline" className="text-xs">Erledigt</Badge>
                  ) : s.link ? (
                    <Link to={s.link} onClick={() => base44.analytics.track({ eventName: 'onboarding_open_profile' })}>
                      <Button size="sm" variant="outline">{s.actionLabel}</Button>
                    </Link>
                  ) : (
                    <Button size="sm" onClick={() => { base44.analytics.track({ eventName: 'onboarding_add_photo_click' }); s.onAction?.(); }}>
                      {s.actionLabel}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { snoozeDays(7); setHidden(true); base44.analytics.track({ eventName: 'onboarding_snoozed', properties: { days: 7 } }); }}
            >Später</Button>
            <Link to={createPageUrl('CompleteProfile')}>
              <Button size="sm" variant="secondary" onClick={() => base44.analytics.track({ eventName: 'onboarding_open_profile' })}>Jetzt starten</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}