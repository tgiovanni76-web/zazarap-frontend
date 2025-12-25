import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createPageUrl } from '@/utils';
import { 
  Star, MapPin, Phone, Globe, ShoppingBag, Clock, Award, 
  CheckCircle, TrendingUp, Package, MessageCircle
} from 'lucide-react';
import SellerReviews from '../components/seller/SellerReviews';

export default function SellerProfile() {
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('id');

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: sellerId });
      return users[0];
    },
    enabled: !!sellerId
  });

  const { data: sellerListings = [] } = useQuery({
    queryKey: ['sellerListings', sellerId],
    queryFn: () => base44.entities.Listing.filter({ 
      created_by: sellerId,
      status: 'active'
    }, '-created_date'),
    enabled: !!sellerId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['sellerReviews', sellerId],
    queryFn: () => base44.entities.SellerReview.filter({ sellerId }, '-created_date'),
    enabled: !!sellerId
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  if (sellerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Lädt Verkäuferprofil...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Verkäufer nicht gefunden</h2>
        <Link to={createPageUrl('Marketplace')}>
          <Button>Zurück zum Marktplatz</Button>
        </Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const badgeIcons = {
    top_seller: <Award className="w-4 h-4" />,
    fast_shipper: <Clock className="w-4 h-4" />,
    verified: <CheckCircle className="w-4 h-4" />,
    trusted: <Star className="w-4 h-4" />
  };

  const badgeLabels = {
    top_seller: 'Top Verkäufer',
    fast_shipper: 'Schneller Versand',
    verified: 'Verifiziert',
    trusted: 'Vertrauenswürdig'
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Seller Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={seller.profilePicture} />
                <AvatarFallback className="text-3xl">
                  {seller.full_name?.charAt(0) || seller.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{averageRating}</span>
                <span className="text-slate-600">({reviews.length} Bewertungen)</span>
              </div>

              {/* Badges */}
              {seller.sellerBadges && seller.sellerBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {seller.sellerBadges.map(badge => (
                    <Badge key={badge} className="bg-blue-100 text-blue-800">
                      {badgeIcons[badge]}
                      <span className="ml-1">{badgeLabels[badge]}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {seller.companyName || seller.full_name}
                  </h1>
                  {seller.businessType && (
                    <Badge variant="outline" className="mb-2">
                      {seller.businessType.charAt(0).toUpperCase() + seller.businessType.slice(1)}
                    </Badge>
                  )}
                </div>
                {currentUser?.email === sellerId && (
                  <Link to={createPageUrl('EditSellerProfile')}>
                    <Button>Profil bearbeiten</Button>
                  </Link>
                )}
              </div>

              {seller.companyDescription && (
                <p className="text-slate-700 mb-4">{seller.companyDescription}</p>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {seller.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{seller.location}</span>
                  </div>
                )}
                {seller.phoneNumber && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{seller.phoneNumber}</span>
                  </div>
                )}
                {seller.website && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-4 h-4" />
                    <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Website besuchen
                    </a>
                  </div>
                )}
                {seller.responseTime && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>Antwortet in {seller.responseTime}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{sellerListings.length}</div>
                  <div className="text-sm text-slate-600">Aktive Anzeigen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reviews.length}</div>
                  <div className="text-sm text-slate-600">Bewertungen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{averageRating}</div>
                  <div className="text-sm text-slate-600">Durchschnitt</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings & Reviews Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seller's Listings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Anzeigen von {seller.companyName || seller.full_name} ({sellerListings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sellerListings.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Keine aktiven Anzeigen</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sellerListings.map(listing => (
                    <Link key={listing.id} to={createPageUrl('ListingDetail') + `?id=${listing.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="pt-4">
                          {listing.images?.[0] && (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-40 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h3 className="font-semibold mb-2 line-clamp-2">{listing.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">€{listing.price}</span>
                            {listing.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reviews */}
        <div>
          <SellerReviews sellerId={sellerId} reviews={reviews} />
        </div>
      </div>
    </div>
  );
}