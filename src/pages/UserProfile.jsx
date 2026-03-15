import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Edit2, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Package, ShoppingBag, Star, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import UserStats from '../components/profile/UserStats';
import UserReviews from '../components/profile/UserReviews';
import { format } from 'date-fns';
import { formatCurrency } from '@/components/utils/format';
import { useLanguage } from '../components/LanguageProvider';

export default function UserProfile() {
  const { t, currentLanguage } = useLanguage();
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get('user');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profileUser, isLoading: loadingProfile } = useQuery({
    queryKey: ['profileUser', profileUserId],
    queryFn: async () => {
      if (!profileUserId || profileUserId === currentUser?.email) {
        return currentUser;
      }
      const users = await base44.entities.User.filter({ email: profileUserId });
      return users[0] || null;
    },
    enabled: !!currentUser,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings', profileUser?.email],
    queryFn: () => base44.entities.Listing.filter({ created_by: profileUser.email }, '-created_date'),
    enabled: !!profileUser,
  });

  const isOwnProfile = !profileUserId || profileUserId === currentUser?.email;

  const { data: orders = [] } = useQuery({
    queryKey: ['userOrders', profileUser?.email],
    queryFn: () => base44.entities.Order.filter({ userId: profileUser.email }, '-created_date'),
    enabled: !!profileUser && isOwnProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['profileUser'] });
      toast.success('Profilo aggiornato!');
      setIsEditing(false);
    },
  });

  const recalculateBadgesMutation = useMutation({
    mutationFn: () => base44.functions.invoke('calculateUserBadges', { 
      targetUserId: profileUser.email 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileUser'] });
      toast.success('Badge aggiornati!');
    },
  });

  if (loadingProfile || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">{tr('profile.notFound','Utente non trovato')}</p>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editData);
  };

  const startEditing = () => {
    setEditData({
      bio: profileUser.bio || '',
      location: profileUser.location || '',
      phoneNumber: profileUser.phoneNumber || '',
      socialLinks: profileUser.socialLinks || {},
      preferences: profileUser.preferences || {}
    });
    setIsEditing(true);
  };

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');

  return (
    <div className="py-8 max-w-6xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold shrink-0">
                {profileUser.full_name?.charAt(0) || profileUser.email?.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h1 className="text-3xl font-bold">{profileUser.full_name || profileUser.email}</h1>
                  <p className="text-slate-600 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {profileUser.email}
                  </p>
                </div>
                {isOwnProfile && !isEditing && (
                  <Button onClick={startEditing} variant="outline" className="self-start sm:self-auto mt-2 sm:mt-0 whitespace-nowrap">
                    <Edit2 className="h-4 w-4 mr-2" />
                    {tr('profile.edit','Modifica profilo')}
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <>
                  {profileUser.bio && (
                    <p className="text-slate-700 mb-3">{profileUser.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                    {profileUser.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profileUser.location}
                      </span>
                    )}
                    {profileUser.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {profileUser.phoneNumber}
                      </span>
                    )}
                  </div>

                  {profileUser.socialLinks && Object.keys(profileUser.socialLinks).length > 0 && (
                    <div className="flex gap-3">
                      {profileUser.socialLinks.facebook && (
                        <a href={profileUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {profileUser.socialLinks.instagram && (
                        <a href={profileUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {profileUser.socialLinks.twitter && (
                        <a href={profileUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {profileUser.socialLinks.linkedin && (
                        <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{tr('profile.bio','Bio')}</label>
                    <Textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder={tr('profile.bioPlaceholder','Racconta qualcosa di te...')}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{tr('profile.location','Località')}</label>
                      <Input
                        value={editData.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder={tr('profile.locationPlaceholder','Roma, Italia')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{tr('profile.phone','Telefono')}</label>
                      <Input
                        value={editData.phoneNumber || ''}
                        onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                        placeholder={tr('profile.phonePlaceholder','+39 123 456 7890')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{tr('profile.social','Social Media')}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        value={editData.socialLinks?.facebook || ''}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          socialLinks: { ...editData.socialLinks, facebook: e.target.value }
                        })}
                        placeholder="Facebook URL"
                      />
                      <Input
                        value={editData.socialLinks?.instagram || ''}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          socialLinks: { ...editData.socialLinks, instagram: e.target.value }
                        })}
                        placeholder="Instagram URL"
                      />
                      <Input
                        value={editData.socialLinks?.twitter || ''}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          socialLinks: { ...editData.socialLinks, twitter: e.target.value }
                        })}
                        placeholder="Twitter URL"
                      />
                      <Input
                        value={editData.socialLinks?.linkedin || ''}
                        onChange={(e) => setEditData({ 
                          ...editData, 
                          socialLinks: { ...editData.socialLinks, linkedin: e.target.value }
                        })}
                        placeholder="LinkedIn URL"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                      Salva
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats and Badges */}
      <UserStats user={profileUser} isOwnProfile={isOwnProfile} />

      {isOwnProfile && (
        <Button 
          onClick={() => recalculateBadgesMutation.mutate()}
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={recalculateBadgesMutation.isPending}
        >
          <Star className="h-4 w-4 mr-2" />
          {tr('profile.refreshBadges','Aggiorna badge')}
        </Button>
      )}

      {/* Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="listings">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">
              <Package className="h-4 w-4 mr-2" />
              Annunci ({listings.length})
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="purchases">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Acquisti ({orders.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Recensioni
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.length === 0 ? (
                <p className="text-center text-slate-500 col-span-2 py-8">{tr('profile.noListings','Nessun annuncio')}</p>
              ) : (
                listings.map(listing => (
                  <Link key={listing.id} to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {listing.images?.[0] && (
                            <img src={listing.images[0]} alt={listing.title} className="w-24 h-24 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{listing.title}</h3>
                            <p className="text-lg font-bold text-red-600 mb-2">{(await import('@/utils/format')).then(m=>m.formatCurrency(listing.price, currentLanguage))}</p>
                            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                              {listing.status === 'active' ? 'Attivo' : 
                               listing.status === 'sold' ? 'Venduto' : listing.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="purchases" className="mt-6">
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">{tr('profile.noPurchases','Nessun acquisto')}</p>
                ) : (
                  orders.map(order => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold mb-1">Ordine #{order.orderNumber}</p>
                            <p className="text-sm text-slate-600 mb-2">
                              {format(new Date(order.created_date), 'dd/MM/yyyy')}
                            </p>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' :
                              'outline'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{(await import('@/utils/format')).then(m=>m.formatCurrency(order.totalAmount, currentLanguage))}</p>
                            <Link to={createPageUrl('MyOrders') + '?orderId=' + order.id}>
                              <Button variant="outline" size="sm" className="mt-2">
                                Dettagli
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="reviews" className="mt-6">
            <UserReviews userId={profileUser.email} canReview={!isOwnProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}