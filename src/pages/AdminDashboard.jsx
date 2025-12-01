import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, AlertTriangle, MessageSquare, ShoppingBag, TrendingUp, Settings, FileText, CheckSquare, Globe } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { language, setLanguage } = useLanguage();
  
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

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accesso Negato</h2>
        <p>Solo gli amministratori possono accedere a questa pagina.</p>
      </div>
    );
  }

  const pendingListings = listings.filter(l => l.status === 'active').length;
  const activeUsers = users.filter(u => !u.blocked).length;
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const escrowAmount = payments.filter(p => p.status === 'held_in_escrow').reduce((sum, p) => sum + p.amount, 0);

  const adminTools = [
    {
      title: 'Gestione Utenti',
      description: 'Gestisci utenti, ruoli e ban',
      icon: Users,
      link: 'ManageUsers',
      count: activeUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Moderazione Annunci',
      description: 'Approva, rifiuta o elimina annunci',
      icon: Package,
      link: 'ModerateListings',
      count: pendingListings,
      color: 'bg-green-500'
    },
    {
      title: 'Gestione Dispute',
      description: 'Risolvi controversie tra utenti',
      icon: AlertTriangle,
      link: 'AdminDisputes',
      count: openDisputes,
      color: 'bg-red-500'
    },
    {
      title: 'Ticket Supporto',
      description: 'Rispondi alle richieste utenti',
      icon: MessageSquare,
      link: 'AdminTickets',
      count: openTickets,
      color: 'bg-yellow-500'
    },
    {
      title: 'Segnalazioni',
      description: 'Gestisci segnalazioni utenti',
      icon: AlertTriangle,
      link: 'AdminReports',
      count: pendingReports,
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'Statistiche e metriche piattaforma',
      icon: TrendingUp,
      link: 'MarketplaceDashboard',
      count: null,
      color: 'bg-purple-500'
    },
    {
      title: 'Gestione Categorie',
      description: 'Crea e modifica categorie',
      icon: Settings,
      link: 'ManageCategories',
      count: null,
      color: 'bg-indigo-500'
    },
    {
      title: 'Pagamenti & Escrow',
      description: 'Monitora transazioni e fondi',
      icon: ShoppingBag,
      link: 'AdminPayments',
      count: `${escrowAmount.toFixed(0)}€`,
      color: 'bg-pink-500'
    },
    {
      title: 'Konfiguration',
      description: 'Integrationen und Secrets',
      icon: Settings,
      link: 'AdminSettings',
      count: null,
      color: 'bg-slate-500'
    },
    {
      title: 'Launch Checklist',
      description: 'Pre-Launch Überprüfung',
      icon: CheckSquare,
      link: 'PreLaunchChecklist',
      count: null,
      color: 'bg-emerald-500'
    },
    {
      title: 'System Checkup',
      description: 'Analisi completa sistema',
      icon: CheckSquare,
      link: 'SystemCheckup',
      count: null,
      color: 'bg-cyan-500'
    }
  ];

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Pannello Amministratore</h2>
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
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Utenti Attivi</div>
            <div className="text-3xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Annunci Attivi</div>
            <div className="text-3xl font-bold">{pendingListings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Dispute Aperte</div>
            <div className="text-3xl font-bold text-red-600">{openDisputes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Fondi in Escrow</div>
            <div className="text-3xl font-bold text-green-600">{escrowAmount.toFixed(0)}€</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link key={tool.link} to={createPageUrl(tool.link)}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
                  <p className="text-sm text-slate-600">{tool.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}