import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShieldCheck, AlertTriangle, FileText, Settings, CreditCard, BarChart3, Database, ClipboardList, Flag } from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        Zugriff nur für Administratoren.
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null; // redirected
  }

  const tiles = [
    { to: 'ManageUsers', label: 'Benutzerverwaltung', icon: Users },
    { to: 'AdminModeration', label: 'Moderation', icon: ShieldCheck },
    { to: 'AdminReports', label: 'Meldungen', icon: Flag },
    { to: 'AdminPayments', label: 'Zahlungen', icon: CreditCard },
    { to: 'SystemLogs', label: 'Systemprotokolle', icon: Database },
    { to: 'AdminSEO', label: 'SEO', icon: FileText },
    { to: 'ManageCategories', label: 'Kategorien', icon: ClipboardList },
    { to: 'AdminTickets', label: 'Support-Tickets', icon: AlertTriangle },
    { to: 'AdminSettings', label: 'Einstellungen', icon: Settings },
    { to: 'AdminDashboard', label: 'Analytik', icon: BarChart3 },
  ];

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin-Dashboard</h1>
        <p className="text-slate-600 mt-1">Zentrale Schaltzentrale für das Team – schnelle Zugriffe ohne Umwege.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={createPageUrl(to)}>
            <Card className="hover:shadow-lg transition-all border-2 hover:border-[var(--z-primary)]">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-lg bg-[var(--z-primary)]/10 text-[var(--z-primary)] flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-slate-500">Öffnen</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link to={createPageUrl('Marketplace')}>
          <Button variant="outline">Zurück zum Marktplatz</Button>
        </Link>
      </div>
    </div>
  );
}