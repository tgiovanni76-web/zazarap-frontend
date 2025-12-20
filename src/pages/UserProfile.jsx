import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, MapPin, Calendar, Globe, Facebook, Instagram, Twitter, Linkedin, 
  Phone, Star, Package, MessageSquare, Shield, CheckCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/components/LanguageProvider';
import { AggregatedRating, ReviewCard } from '@/components/reviews/UserRatingDisplay';
import FollowButton from '../components/profile/FollowButton';
import UserStats from '../components/profile/UserStats';

export default function UserProfile() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const profileUser = users.find(u => u.email === userEmail);

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings', userEmail],
    queryFn: () => base44.entities.Listing.filter({ created_by: userEmail }),
    enabled: !!userEmail,
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['userRatings', userEmail],
    queryFn: () => base44.entities.UserRating.filter({ ratedEmail: userEmail }),
    enabled: !!userEmail,
  });

  const { data: verification } = useQuery({
    queryKey: ['userVerification', userEmail],
    queryFn: async () => {
      const res = await base44.entities.UserVerification.filter({ userId: userEmail });
      return res[0] || null;
    },
    enabled: !!userEmail,
  });

  if (!userEmail) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-600">Profilo non trovato</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">{t('loading')}</p>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active' && l.moderationStatus === 'approved');
  const soldListings = listings.filter(l => l.status === 'sold');
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length).toFixed(1)
    : null;

  const getInitials = () => {
    const first = profileUser.firstName?.[0] || profileUser.full_name?.[0] || '';
    const last = profileUser.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="py-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32 mx-auto md:mx-0">
              <AvatarImage src={profileUser.profilePicture} />
              <AvatarFallback className="text-3xl bg-red-100 text-red-600">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">
                  {profileUser.firstName} {profileUser.lastName || profileUser.full_name}
                </h1>
                {verification?.identityVerified && (
                  <Badge className="bg-green-100 text-green-700 w-fit mx-auto md:mx-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificato
                  </Badge>
                )}
              </div>

              {profileUser.region && (
                <p className="text-slate-600 flex items-center justify-center md:justify-start gap-1 mb-2">
                  <MapPin className="h-4 w-4" />
                  {profileUser.region}, {profileUser.country}
                </p>
              )}

              {profileUser.bio && (
                <p className="text-slate-700 mb-4">{profileUser.bio}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{activeListings.length}</div>
                  <div className="text-sm text-slate-500">Annunci attivi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{soldListings.length}</div>
                  <div className="text-sm text-slate-500">Venduti</div>
                </div>
                {avgRating && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500" />
                      {avgRating}
                    </div>
                    <div className="text-sm text-slate-500">{ratings.length} recensioni</div>
                  </div>
                )}
                {verification?.trustScore && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                      <Shield className="h-5 w-5" />
                      {verification.trustScore}%
                    </div>
                    <div className="text-sm text-slate-500">Trust Score</div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {profileUser.websiteUrl && (
                  <a href={profileUser.websiteUrl} target="_blank" rel="noopener noreferrer" 
                     className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <Globe className="h-5 w-5 text-slate-600" />
                  </a>
                )}
                {profileUser.facebookUrl && (
                  <a href={profileUser.facebookUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                    <Facebook className="h-5 w-5 text-blue-600" />
                  </a>
                )}
                {profileUser.instagramUrl && (
                  <a href={profileUser.instagramUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-pink-100 rounded-full hover:bg-pink-200 transition-colors">
                    <Instagram className="h-5 w-5 text-pink-600" />
                  </a>
                )}
                {profileUser.twitterUrl && (
                  <a href={profileUser.twitterUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-sky-100 rounded-full hover:bg-sky-200 transition-colors">
                    <Twitter className="h-5 w-5 text-sky-500" />
                  </a>
                )}
                {profileUser.linkedinUrl && (
                  <a href={profileUser.linkedinUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors">
                    <Linkedin className="h-5 w-5 text-blue-700" />
                  </a>
                )}
                {profileUser.showPhone && profileUser.phoneNumber && (
                  <a href={`tel:${profileUser.phoneNumber}`}
                     className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
                    <Phone className="h-5 w-5 text-green-600" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Button */}
            {currentUser && currentUser.email !== userEmail && (
              <div>
                <Button className="bg-red-600 hover:bg-red-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contatta
                </Button>
                <FollowButton
                  targetType="user"
                  targetId={userEmail}
                  className="mt-2 w-full"
                  labelFollow="Segui venditore"
                  labelUnfollow="Smetti di seguire"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <UserStats userEmail={userEmail} />
      </div>
      {/* Tabs for Listings and Reviews */}
      <Tabs defaultValue="listings">
        <TabsList className="mb-4">
          <TabsTrigger value="listings" className="gap-2">
            <Package className="h-4 w-4" />
            Annunci ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Recensioni ({ratings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {activeListings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                Nessun annuncio attivo
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeListings.map(listing => (
                <Link key={listing.id} to={createPageUrl(`ListingDetail?id=${listing.id}`)}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-slate-100">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} 
                             className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                      <p className="text-red-600 font-bold">{listing.price?.toFixed(2)}€</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                Nessuna recensione ancora
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Aggregated Rating Summary */}
              <Card>
                <CardContent className="pt-6">
                  <AggregatedRating ratings={ratings} showDetails={true} />
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {ratings.map(rating => (
                  <ReviewCard key={rating.id} review={rating} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}