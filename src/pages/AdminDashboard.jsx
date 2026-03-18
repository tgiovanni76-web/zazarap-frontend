import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, AlertTriangle, MessageSquare, ShoppingBag, TrendingUp, Settings, FileText, CheckSquare, Globe, Brain, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminAssistantChat from "@/components/agents/AdminAssistantChat";

const languages = [
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'pl', name: 'Polski' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'uk', name: 'Українська' }
];

export default function AdminDashboard() {
  const { language, setLanguage, t } = useLanguage();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => base44.entities.Dispute.list(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.SupportTicket.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list(),
  });
  
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list(),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{t('accessDenied') || 'Zugriff verweigert'}</h2>
        <p>{t('adminOnly') || 'Nur Administratoren können auf diese Seite zugreifen.'}</p>
      </div>
    );
  }

  const moderationPending = listings.filter(l => l.moderationStatus === 'pending').length;
  const activeUsers = users.filter(u => !u.blocked).length;
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const escrowAmount = payments.filter(p => p.status === 'held_in_escrow').reduce((sum, p) => sum + p.amount, 0);
  
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const revenueToday = (transactions || [])
    .filter(tr => ['paid', 'captured'].includes(tr.status) && new Date(tr.created_date) >= startOfToday && new Date(tr.created_date) <= endOfToday)
    .reduce((sum, tr) => sum + (tr.amount || 0), 0);

  const newListingsToday = (listings || [])
    .filter(l => new Date(l.created_date) >= startOfToday && new Date(l.created_date) <= endOfToday)
    .length;

  const adminTools = [
    {
      title: 'Moderation',
      desc: 'Neue Anzeigen prüfen und freigeben',
      icon: Package,
      link: 'ModerateListings',
      count: moderationPending,
      color: 'bg-green-600',
      emphasis: true
    },
    {
      title: 'Meldungen',
      desc: 'Nutzer-Meldungen prüfen und bearbeiten',
      icon: AlertTriangle,
      link: 'AdminReports',
      count: pendingReports,
      color: 'bg-orange-500',
      emphasis: true
    },
    {
      title: 'Support-Tickets',
      desc: 'Offene Anfragen im Support-Center',
      icon: MessageSquare,
      link: 'AdminTickets',
      count: openTickets,
      color: 'bg-yellow-500',
      emphasis: true
    },
    {
      title: 'Benutzerverwaltung',
      desc: 'Nutzerkonten, Rollen und Sperren verwalten',
      icon: Users,
      link: 'ManageUsers',
      count: activeUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Streitfälle',
      desc: 'Konflikte prüfen und moderieren',
      icon: AlertTriangle,
      link: 'AdminDisputes',
      count: openDisputes,
      color: 'bg-red-500'
    },
    {
      title: 'Statistiken',
      desc: 'Kennzahlen und Trends des Marktplatzes',
      icon: TrendingUp,
      link: 'MarketplaceDashboard',
      count: null,
      color: 'bg-purple-500'
    },
    {
      title: 'Nutzer-Analysen',
      desc: 'Detaillierte Metriken zu Verhalten und Performance',
      icon: BarChart3,
      link: 'AdminAnalytics',
      count: null,
      color: 'bg-indigo-500'
    },
    {
      title: 'Zahlungen & Treuhand',
      desc: 'Zahlungsstatus und Treuhandkonten überwachen',
      icon: ShoppingBag,
      link: 'AdminPayments',
      count: `${escrowAmount.toFixed(0)}€`,
      color: 'bg-pink-500'
    },
    {
      title: 'Kategorienverwaltung',
      desc: 'Kategorien strukturieren und pflegen',
      icon: Settings,
      link: 'ManageCategories',
      count: null,
      color: 'bg-indigo-500'
    },
    {
      title: 'Systemkonfiguration',
      desc: 'Plattform-Einstellungen und Richtlinien',
      icon: Settings,
      link: 'AdminSettings',
      count: null,
      color: 'bg-slate-500'
    },
    {
      title: 'Systemprotokolle',
      desc: 'Ereignisse und Fehler überwachen',
      icon: FileText,
      link: 'SystemLogs',
      count: null,
      color: 'bg-slate-600'
    }
  ];
    {
      titleKey: 'admin.userManagement',
      descKey: 'admin.userManagementDesc',
      icon: Users,
      link: 'ManageUsers',
      count: activeUsers,
      color: 'bg-blue-500'
    },
    {
      titleKey: 'admin.listingModeration',
      descKey: 'admin.listingModerationDesc',
      icon: Package,
      link: 'ModerateListings',
      count: pendingListings,
      color: 'bg-green-500'
    },
    {
      titleKey: 'KI-Moderation',
      descKey: 'Automatische Content-Prüfung mit AI',
      icon: Brain,
      link: 'AdminModeration',
      count: pendingListings,
      color: 'bg-purple-500'
    },
    {
      titleKey: 'admin.disputeManagement',
      descKey: 'admin.disputeManagementDesc',
      icon: AlertTriangle,
      link: 'AdminDisputes',
      count: openDisputes,
      color: 'bg-red-500'
    },
    {
      titleKey: 'admin.supportTickets',
      descKey: 'admin.supportTicketsDesc',
      icon: MessageSquare,
      link: 'AdminTickets',
      count: openTickets,
      color: 'bg-yellow-500'
    },
    {
      titleKey: 'admin.reports',
      descKey: 'admin.reportsDesc',
      icon: AlertTriangle,
      link: 'AdminReports',
      count: pendingReports,
      color: 'bg-orange-500'
    },
    {
      titleKey: 'admin.analytics',
      descKey: 'admin.analyticsDesc',
      icon: TrendingUp,
      link: 'MarketplaceDashboard',
      count: null,
      color: 'bg-purple-500'
    },
    {
      titleKey: 'User Analytics',
      descKey: 'Detaillierte Nutzer- und Performance-Daten',
      icon: BarChart3,
      link: 'AdminAnalytics',
      count: null,
      color: 'bg-indigo-500'
    },
    {
      titleKey: 'admin.categoryManagement',
      descKey: 'admin.categoryManagementDesc',
      icon: Settings,
      link: 'ManageCategories',
      count: null,
      color: 'bg-indigo-500'
    },
    {
      titleKey: 'admin.paymentsEscrow',
      descKey: 'admin.paymentsEscrowDesc',
      icon: ShoppingBag,
      link: 'AdminPayments',
      count: `${escrowAmount.toFixed(0)}€`,
      color: 'bg-pink-500'
    },
    {
      titleKey: 'admin.configuration',
      descKey: 'admin.configurationDesc',
      icon: Settings,
      link: 'AdminSettings',
      count: null,
      color: 'bg-slate-500'
    },
    {
      titleKey: 'admin.launchChecklist',
      descKey: 'admin.launchChecklistDesc',
      icon: CheckSquare,
      link: 'PreLaunchChecklist',
      count: null,
      color: 'bg-emerald-500'
    },
    {
      titleKey: 'admin.systemCheckup',
      descKey: 'admin.systemCheckupDesc',
      icon: CheckSquare,
      link: 'SystemCheckup',
      count: null,
      color: 'bg-cyan-500'
    },
    {
      titleKey: 'System Logs',
      descKey: 'Eventi e errori dell\'app',
      icon: FileText,
      link: 'SystemLogs',
      count: null,
      color: 'bg-slate-600'
    },
    {
      titleKey: 'Accessibility Audit',
      descKey: 'Verifica base a11y (manuale)',
      icon: CheckSquare,
      link: 'AccessibilityAudit',
      count: null,
      color: 'bg-emerald-600'
    }
    ];
  const filteredAdminTools = adminTools;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('admin.panel') || 'Admin-Panel'}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-slate-500" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => base44.auth.logout()} variant="outline">
            Abmelden
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Umsatz heute</div>
            <div className="text-3xl font-bold">{revenueToday.toFixed(0)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Aktive Nutzer</div>
            <div className="text-3xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Neue Anzeigen (heute)</div>
            <div className="text-3xl font-bold">{newListingsToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Offene Tickets</div>
            <div className="text-3xl font-bold">{openTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Offene Meldungen</div>
            <div className="text-3xl font-bold">{pendingReports}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin AI Assistant */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Zazarap Admin Assistent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <AdminAssistantChat />
              <div className="flex flex-wrap gap-3">
                <a
                  href={base44.agents.getWhatsAppConnectURL('zazarap_admin_assistent')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-[12px] bg-[var(--z-primary)] text-white px-4 py-2 hover:bg-[var(--z-primary-dark)]"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdminTools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link key={tool.link} to={createPageUrl(tool.link)}>
              <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${tool.emphasis ? 'ring-2 ring-[var(--z-accent)] shadow-md' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${tool.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {tool.count !== null && (
                      <span className="text-2xl font-bold text-slate-700">{tool.count}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
                  <p className="text-sm text-slate-600">{tool.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}