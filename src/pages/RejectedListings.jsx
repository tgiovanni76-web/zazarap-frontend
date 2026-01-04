import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, Edit, AlertTriangle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function RejectedListings() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: rejectedListings = [], isLoading } = useQuery({
    queryKey: ['rejectedListings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ 
      created_by: user.email,
      moderationStatus: 'rejected' 
    }, '-updated_date'),
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl('MySales')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">Annunci Rifiutati</h2>
          <p className="text-slate-600 mt-1">
            Visualizza gli annunci rifiutati e le motivazioni per correggerli
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {rejectedListings.length} rifiutati
        </Badge>
      </div>

      {rejectedListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">Nessun annuncio rifiutato</h3>
            <p className="text-slate-600 mb-6">
              Tutti i tuoi annunci sono stati approvati o sono in attesa di moderazione
            </p>
            <Link to={createPageUrl('MySales')}>
              <Button>Torna ai miei annunci</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Gli annunci rifiutati non sono visibili sul marketplace. Correggi i problemi indicati e 
              aggiorna l'annuncio per sottoporlo nuovamente a moderazione.
            </AlertDescription>
          </Alert>

          {rejectedListings.map(listing => (
            <Card key={listing.id} className="border-red-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rifiutato
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>{listing.category}</span>
                      <span>•</span>
                      <span>{listing.price}€</span>
                      <span>•</span>
                      <span>Rifiutato il {format(new Date(listing.updated_date), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  </div>
                  {listing.images && listing.images[0] && (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-24 h-24 object-cover rounded ml-4"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="bg-red-50 border-red-200 mb-4">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <p className="font-semibold text-red-900 mb-1">Motivo del rifiuto:</p>
                    <p className="text-red-800">
                      {listing.rejectionReason || 'Nessuna motivazione fornita'}
                    </p>
                  </AlertDescription>
                </Alert>

                {listing.moderationNotes && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
                    <p className="text-sm font-medium text-slate-700 mb-1">Note aggiuntive:</p>
                    <p className="text-sm text-slate-600">{listing.moderationNotes}</p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Descrizione dell'annuncio:</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{listing.description}</p>
                </div>

                <div className="flex gap-3">
                  <Link to={createPageUrl('EditListing') + '?id=' + listing.id} className="flex-1">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Correggi e ripubblica
                    </Button>
                  </Link>
                  <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                    <Button variant="outline">
                      Visualizza dettagli
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Suggerimento:</strong> Dopo aver corretto l'annuncio, 
                    verrà automaticamente inviato nuovamente per la moderazione e apparirà come "In attesa".
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}