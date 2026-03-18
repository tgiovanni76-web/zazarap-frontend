import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, CheckCircle, Archive, Edit, Eye } from 'lucide-react';
import PremiumPromptManager from '@/components/premium/PremiumPromptManager';
import { useLanguage } from '../components/LanguageProvider';
import { format } from 'date-fns';

export default function MyListings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('active');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user,
  });

  const activeListings = listings.filter(l => l.status === 'active');

  // Map of listingId -> signals (views/messages/age/expiry). Kept lightweight without changing business logic
  const contextProvider = (l) => {
    const ageHours = Math.max(0, (Date.now() - new Date(l.created_date).getTime()) / 36e5);
    const hoursToExpiry = l.expiresAt ? (new Date(l.expiresAt).getTime() - Date.now()) / 36e5 : null;
    // Best-effort counters if present on listing cache; if not, default 0
    const viewsCount = l.viewsCount || l.views || 0;
    const messagesCount = l.messagesCount || l.unreadBuyer + l.unreadSeller || 0;
    return { ageHours, hoursToExpiry, viewsCount, messagesCount };
  };
  const soldListings = listings.filter(l => l.status === 'sold');
  const archivedListings = listings.filter(l => l.status === 'archived' || l.status === 'expired');

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const ListingCard = ({ listing, showEdit = true }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {listing.images?.[0] && (
            <img 
              src={listing.images[0]} 
              alt={listing.title} 
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
                <p className="text-2xl font-bold text-red-600 mb-2">{listing.price}€</p>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline">{t(listing.category)}</Badge>
                  {listing.city && (
                    <span className="text-sm text-slate-600">{listing.city}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Erstellt: {format(new Date(listing.created_date), 'dd.MM.yyyy')}
                </p>
                {listing.status === 'sold' && listing.updated_date && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Verkauft am: {format(new Date(listing.updated_date), 'dd.MM.yyyy')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ansehen
                </Button>
              </Link>
              {showEdit && listing.status === 'active' && (
                <Link to={createPageUrl('EditListing') + '?id=' + listing.id}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Meine Anzeigen</h1>
        <p className="text-slate-600">Verwalte deine aktiven, verkauften und archivierten Anzeigen</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{activeListings.length}</p>
            <p className="text-sm text-slate-600">Aktive Anzeigen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold">{soldListings.length}</p>
            <p className="text-sm text-slate-600">Verkauft</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Archive className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p className="text-3xl font-bold">{archivedListings.length}</p>
            <p className="text-sm text-slate-600">Archiviert</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            <Package className="h-4 w-4 mr-2" />
            Aktiv ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="sold">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verkauft ({soldListings.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-4 w-4 mr-2" />
            Archiv ({archivedListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {activeListings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-4">Keine aktiven Anzeigen</p>
                <Link to={createPageUrl('NewListing')}>
                  <Button>Neue Anzeige erstellen</Button>
                </Link>
              </div>
            ) : (
              activeListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} showEdit={true} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sold" className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-1">✓ Verkaufshistorie</h3>
            <p className="text-sm text-green-700">
              Diese Anzeigen wurden als verkauft markiert und können nicht mehr bearbeitet werden. Sie dienen als deine persönliche Verkaufshistorie.
            </p>
          </div>
          <div className="space-y-4">
            {soldListings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Noch keine verkauften Anzeigen</p>
              </div>
            ) : (
              soldListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} showEdit={false} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <div className="space-y-4">
            {archivedListings.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Keine archivierten Anzeigen</p>
              </div>
            ) : (
              archivedListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} showEdit={false} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}