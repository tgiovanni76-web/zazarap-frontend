import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Download, Eye, MessageSquare, 
  CheckCircle, Clock, XCircle, Euro, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function SalesTable({ chats }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const statusConfig = {
    completata: { 
      label: 'Completata', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle 
    },
    accettata: { 
      label: 'In Corso', 
      color: 'bg-blue-100 text-blue-800', 
      icon: Clock 
    },
    in_attesa: { 
      label: 'In Attesa', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    },
    rifiutata: { 
      label: 'Annullata', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle 
    }
  };

  const filteredAndSortedChats = useMemo(() => {
    let filtered = chats;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.buyerId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(chat => chat.status === statusFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.updated_date) - new Date(a.updated_date);
        case 'date_asc':
          return new Date(a.updated_date) - new Date(b.updated_date);
        case 'amount_desc':
          return (b.lastPrice || 0) - (a.lastPrice || 0);
        case 'amount_asc':
          return (a.lastPrice || 0) - (b.lastPrice || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [chats, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const completed = chats.filter(c => c.status === 'completata');
    const inProgress = chats.filter(c => c.status === 'accettata' || c.status === 'in_attesa');
    const cancelled = chats.filter(c => c.status === 'rifiutata');
    const totalRevenue = completed.reduce((sum, c) => sum + (c.lastPrice || 0), 0);

    return { completed, inProgress, cancelled, totalRevenue };
  }, [chats]);

  const exportToCSV = () => {
    const headers = ['Data', 'Acquirente', 'Annuncio', 'Importo', 'Stato'];
    const rows = filteredAndSortedChats.map(chat => [
      format(new Date(chat.updated_date), 'dd/MM/yyyy HH:mm'),
      chat.buyerId,
      chat.listingTitle || '-',
      chat.lastPrice ? `€${chat.lastPrice}` : '-',
      statusConfig[chat.status]?.label || chat.status
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendite_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Completate</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">In Corso</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Annullate</div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Ricavi Totali</div>
            <div className="text-2xl font-bold text-green-600">€{stats.totalRevenue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Cerca per annuncio o acquirente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tutti gli stati</option>
              <option value="completata">Completate</option>
              <option value="accettata">In Corso</option>
              <option value="in_attesa">In Attesa</option>
              <option value="rifiutata">Annullate</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="date_desc">Data (recente)</option>
              <option value="date_asc">Data (vecchia)</option>
              <option value="amount_desc">Importo (alto)</option>
              <option value="amount_asc">Importo (basso)</option>
            </select>

            {/* Export */}
            <Button
              onClick={exportToCSV}
              variant="outline"
              disabled={filteredAndSortedChats.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transazioni ({filteredAndSortedChats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedChats.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nessuna transazione trovata</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Annuncio</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Acquirente</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Importo</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Stato</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-600">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedChats.map((chat) => {
                    const StatusIcon = statusConfig[chat.status]?.icon || Clock;
                    
                    return (
                      <tr key={chat.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <div>
                              <div>{format(new Date(chat.updated_date), 'dd/MM/yyyy', { locale: it })}</div>
                              <div className="text-xs text-slate-500">
                                {format(new Date(chat.updated_date), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {chat.listingImage && (
                              <img 
                                src={chat.listingImage} 
                                alt="" 
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium line-clamp-1">
                                {chat.listingTitle || 'Annuncio eliminato'}
                              </div>
                              <div className="text-xs text-slate-500">
                                ID: {chat.listingId?.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">{chat.buyerId.split('@')[0]}</div>
                            <div className="text-xs text-slate-500">{chat.buyerId}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {chat.lastPrice ? (
                            <div className="flex items-center gap-1 font-bold text-green-600">
                              <Euro className="w-4 h-4" />
                              {chat.lastPrice.toFixed(2)}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusConfig[chat.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[chat.status]?.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link to={createPageUrl('Messages') + `?chatId=${chat.id}`}>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Chat
                              </Button>
                            </Link>
                            {chat.listingId && (
                              <Link to={createPageUrl('ListingDetail') + `?id=${chat.listingId}`}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}