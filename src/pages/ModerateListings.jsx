import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ModerateListings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterModeration, setFilterModeration] = useState('pending');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
  });

  const updateListingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Listing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Annuncio aggiornato');
      setSelectedListing(null);
    }
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id) => base44.entities.Listing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Annuncio eliminato');
      setSelectedListing(null);
    }
  });

  const handleApprove = async (listing) => {
    await updateListingMutation.mutateAsync({
      id: listing.id,
      data: { moderationStatus: 'approved' }
    });

    // Notifica venditore
    await base44.entities.Notification.create({
      userId: listing.created_by,
      type: 'status_update',
      title: '✅ Annuncio Approvato',
      message: `Il tuo annuncio "${listing.title}" è stato approvato ed è ora visibile!`,
      linkUrl: `/listing-detail?id=${listing.id}`,
      relatedId: listing.id
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Inserisci un motivo per il rifiuto');
      return;
    }

    await updateListingMutation.mutateAsync({
      id: selectedListing.id,
      data: { 
        moderationStatus: 'rejected',
        rejectionReason: rejectReason
      }
    });

    // Notifica venditore
    await base44.entities.Notification.create({
      userId: selectedListing.created_by,
      type: 'status_update',
      title: '❌ Annuncio Rifiutato',
      message: `Il tuo annuncio "${selectedListing.title}" è stato rifiutato. Motivo: ${rejectReason}`,
      linkUrl: '/Marketplace',
      relatedId: selectedListing.id
    });

    setShowRejectDialog(false);
    setRejectReason('');
    setSelectedListing(null);
  };

  const handleChangeStatus = async (listing, newStatus) => {
    await updateListingMutation.mutateAsync({
      id: listing.id,
      data: { status: newStatus }
    });

    // Notifica venditore se stato cambia
    if (newStatus === 'sold') {
      await base44.entities.Notification.create({
        userId: listing.created_by,
        type: 'status_update',
        title: '💰 Annuncio Venduto',
        message: `Il tuo annuncio "${listing.title}" è stato marcato come venduto.`,
        linkUrl: `/listing-detail?id=${listing.id}`,
        relatedId: listing.id
      });
    }
  };

  const handleDelete = (listing) => {
    const reason = prompt('Motivo eliminazione (verrà notificato al venditore):');
    if (reason) {
      deleteListingMutation.mutate(listing.id);
      
      // Notifica venditore
      base44.entities.Notification.create({
        userId: listing.created_by,
        type: 'status_update',
        title: '❌ Annuncio Rimosso',
        message: `Il tuo annuncio "${listing.title}" è stato rimosso. Motivo: ${reason}`,
        linkUrl: '/Marketplace',
        relatedId: listing.id
      });
    }
  };

  if (user?.role !== 'admin') {
    return <div className="py-8 text-center">Accesso negato</div>;
  }

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.created_by?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchesModeration = filterModeration === 'all' || l.moderationStatus === filterModeration;
    return matchesSearch && matchesStatus && matchesModeration;
  });

  const stats = {
    pending: listings.filter(l => l.moderationStatus === 'pending').length,
    approved: listings.filter(l => l.moderationStatus === 'approved').length,
    rejected: listings.filter(l => l.moderationStatus === 'rejected').length,
    total: listings.length
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-blue-100 text-blue-800',
    expired: 'bg-slate-100 text-slate-800',
    archived: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Moderazione Annunci</h2>
        <div className="flex gap-3">
          <Card className="px-4 py-2">
            <div className="text-xs text-slate-600">In Attesa</div>
            <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-slate-600">Approvati</div>
            <div className="text-xl font-bold text-green-600">{stats.approved}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-xs text-slate-600">Rifiutati</div>
            <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Cerca per titolo o venditore..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="w-full p-2 border rounded-md"
              value={filterModeration}
              onChange={(e) => setFilterModeration(e.target.value)}
            >
              <option value="all">Tutti gli stati moderazione</option>
              <option value="pending">In attesa</option>
              <option value="approved">Approvati</option>
              <option value="rejected">Rifiutati</option>
            </select>
            <select
              className="w-full p-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tutti gli stati</option>
              <option value="active">Attivi</option>
              <option value="sold">Venduti</option>
              <option value="expired">Scaduti</option>
              <option value="archived">Archiviati</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredListings.map(listing => (
          <Card key={listing.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                {listing.images?.[0] && (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{listing.title}</h3>
                      <p className="text-sm text-slate-600">
                        Venditore: {listing.created_by}
                      </p>
                      <p className="text-sm text-slate-500">
                        Creato: {format(new Date(listing.created_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[listing.status]}>
                          {listing.status}
                        </Badge>
                        {listing.moderationStatus === 'pending' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            In attesa
                          </Badge>
                        )}
                        {listing.moderationStatus === 'approved' && (
                          <Badge className="bg-green-100 text-green-800">
                            Approvato
                          </Badge>
                        )}
                        {listing.moderationStatus === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800">
                            Rifiutato
                          </Badge>
                        )}
                      </div>
                      <span className="text-xl font-bold text-red-600">
                        {listing.price}€
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-3 line-clamp-2">{listing.description}</p>

                  {listing.rejectionReason && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <span className="font-semibold">Motivo rifiuto:</span> {listing.rejectionReason}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {listing.moderationStatus === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(listing)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approva
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowRejectDialog(true);
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rifiuta
                        </Button>
                      </>
                    )}
                    
                    <select
                      className="text-sm p-2 border rounded"
                      value={listing.status}
                      onChange={(e) => handleChangeStatus(listing, e.target.value)}
                    >
                      <option value="active">Attivo</option>
                      <option value="sold">Venduto</option>
                      <option value="expired">Scaduto</option>
                      <option value="archived">Archiviato</option>
                    </select>

                    <Button
                      size="sm"
                      onClick={() => handleDelete(listing)}
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Elimina
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Nessun annuncio trovato
        </div>
      )}

      {showRejectDialog && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rifiuta Annuncio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Annuncio:</p>
                  <p className="font-bold">{selectedListing.title}</p>
                  <p className="text-sm text-slate-600">{selectedListing.created_by}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Motivo del rifiuto *</label>
                  <Textarea
                    placeholder="Spiega perché l'annuncio viene rifiutato..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || updateListingMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rifiuta Annuncio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectReason('');
                      setSelectedListing(null);
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}