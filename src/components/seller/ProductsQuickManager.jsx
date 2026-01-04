import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, EyeOff, Copy, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsQuickManager({ listings }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Listing.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
      setEditingId(null);
      setEditData({});
      toast.success('Aggiornato!');
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (listing) => {
      await base44.entities.Listing.create({
        ...listing,
        title: listing.title + ' (Copia)',
        status: 'active',
        moderationStatus: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
      toast.success('Annuncio duplicato!');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      const newStatus = currentStatus === 'active' ? 'archived' : 'active';
      await base44.entities.Listing.update(id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerListings'] });
      toast.success('Status aggiornato!');
    }
  });

  const handleStartEdit = (listing) => {
    setEditingId(listing.id);
    setEditData({
      title: listing.title,
      price: listing.price,
      offerPrice: listing.offerPrice || ''
    });
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: editingId,
      data: {
        title: editData.title,
        price: parseFloat(editData.price),
        offerPrice: editData.offerPrice ? parseFloat(editData.offerPrice) : undefined
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Gestione rapida prodotti</h3>
        <Link to={createPageUrl('NewListing')}>
          <Button className="bg-green-600 hover:bg-green-700">
            + Nuovo annuncio
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Prodotto</th>
                  <th className="text-left p-3 text-sm font-semibold">Prezzo</th>
                  <th className="text-left p-3 text-sm font-semibold">Stato</th>
                  <th className="text-left p-3 text-sm font-semibold">Visualizzazioni</th>
                  <th className="text-right p-3 text-sm font-semibold">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const isEditing = editingId === listing.id;

                  return (
                    <tr key={listing.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="text-sm"
                          />
                        ) : (
                          <div>
                            <Link 
                              to={createPageUrl('ListingDetail') + '?id=' + listing.id}
                              className="font-medium hover:text-blue-600"
                            >
                              {listing.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1">{listing.category}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              type="number"
                              value={editData.price}
                              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                              className="text-sm w-24"
                              placeholder="Prezzo"
                            />
                            <Input
                              type="number"
                              value={editData.offerPrice}
                              onChange={(e) => setEditData({ ...editData, offerPrice: e.target.value })}
                              className="text-sm w-24"
                              placeholder="Offerta"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold">{listing.price}€</p>
                            {listing.offerPrice && (
                              <p className="text-xs text-green-600">Offerta: {listing.offerPrice}€</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={
                            listing.status === 'active' && listing.moderationStatus === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : listing.status === 'sold' 
                              ? 'bg-blue-100 text-blue-800'
                              : listing.moderationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-200 text-slate-800'
                          }
                        >
                          {listing.status === 'active' && listing.moderationStatus === 'approved' 
                            ? 'Attivo' 
                            : listing.status === 'sold'
                            ? 'Venduto'
                            : listing.moderationStatus === 'pending'
                            ? 'In revisione'
                            : listing.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-slate-600">{listing.views || 0}</span>
                      </td>
                      <td className="p-3">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={updateMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(listing)}
                              title="Modifica rapida"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleStatusMutation.mutate({ 
                                id: listing.id, 
                                currentStatus: listing.status 
                              })}
                              title={listing.status === 'active' ? 'Archivia' : 'Riattiva'}
                            >
                              {listing.status === 'active' ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => duplicateMutation.mutate(listing)}
                              title="Duplica"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Link to={createPageUrl('EditListing') + '?id=' + listing.id}>
                              <Button size="sm" variant="ghost" title="Modifica completa">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}