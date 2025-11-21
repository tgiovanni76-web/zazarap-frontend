import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ModerateListings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
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

  const handleArchive = (listing) => {
    if (confirm('Archiviare questo annuncio?')) {
      updateListingMutation.mutate({
        id: listing.id,
        data: { status: 'archived' }
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

  const filteredListings = listings.filter(l =>
    l.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-blue-100 text-blue-800',
    expired: 'bg-slate-100 text-slate-800',
    archived: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Moderazione Annunci</h2>

      <div className="mb-6">
        <Input
          placeholder="Cerca per titolo o venditore..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[listing.status]}>
                        {listing.status}
                      </Badge>
                      <span className="text-xl font-bold text-red-600">
                        {listing.price}€
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mb-3">{listing.description}</p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleArchive(listing)}
                      disabled={listing.status === 'archived'}
                      variant="outline"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Archivia
                    </Button>
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
    </div>
  );
}