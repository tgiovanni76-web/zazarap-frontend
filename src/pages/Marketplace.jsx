import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Laptop, Home, Shirt, Bike, Car, PawPrint, Package, Heart } from 'lucide-react';
import { toast } from 'sonner';
import RecommendationsWidget from '../components/marketplace/RecommendationsWidget';
import FeaturedListings from '../components/marketplace/FeaturedListings';
import CategoriesBar from '../components/marketplace/CategoriesBar';
import { useLanguage } from '../components/LanguageProvider';

export default function Marketplace() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('-created_date');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings', sortBy],
    queryFn: () => base44.entities.Listing.list(sortBy),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ listingId, isFavorite }) => {
      if (isFavorite) {
        const fav = favorites.find(f => f.listing_id === listingId);
        await base44.entities.Favorite.delete(fav.id);
      } else {
        await base44.entities.Favorite.create({
          listing_id: listingId,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const matchesMinPrice = !minPrice || listing.price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || listing.price <= parseFloat(maxPrice);
    const matchesCity = !cityFilter || listing.city?.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesCity && listing.status === 'active';
  });

  const uniqueCities = [...new Set(listings.map(l => l.city).filter(Boolean))].sort();

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setCityFilter('');
    setSortBy('-created_date');
  };

  const categoryIcons = {
    'elettronica': Laptop,
    'casa': Home,
    'moda': Shirt,
    'sport': Bike,
    'auto': Car,
    'animali': PawPrint,
    'altro': Package
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('home')}</h2>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-yellow-400 text-red-600 border-2 border-red-600 hover:bg-yellow-500 hover:text-red-700"
        >
          {showFilters ? t('filters') : t('filters')}
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && user && searchTerm.trim()) {
                base44.entities.UserActivity.create({
                  userId: user.email,
                  activityType: 'search',
                  searchTerm: searchTerm.trim()
                });
              }
            }}
            className="pl-10 h-12 text-lg border-2 border-red-600"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-64 h-12 bg-yellow-400 text-red-600 border-2 border-red-600 font-bold hover:bg-yellow-500">
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            <SelectItem value="Motori">🚗 Motori</SelectItem>
            <SelectItem value="Immobili">🏠 Immobili</SelectItem>
            <SelectItem value="Mercato">🛍️ Mercato</SelectItem>
            <SelectItem value="Lavoro">💼 Lavoro</SelectItem>
            <SelectItem value="Animali">🐾 Animali</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('priceMin')}</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('priceMax')}</label>
                <Input
                  type="number"
                  placeholder=""
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('city')}</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allCities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t('allCities')}</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('sortBy')}</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_date">{t('mostRecent')}</SelectItem>
                    <SelectItem value="created_date">{t('leastRecent')}</SelectItem>
                    <SelectItem value="price">{t('priceAsc')}</SelectItem>
                    <SelectItem value="-price">{t('priceDesc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleResetFilters} variant="outline" className="flex-1">
                {t('resetFilters')}
              </Button>
              <Badge variant="secondary" className="py-2 px-4">
                {filteredListings.length} {t('adsFound')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <CategoriesBar onCategorySelect={setCategoryFilter} />
      
      <FeaturedListings listings={listings} />

      {user && (
        <div className="mb-8">
          <RecommendationsWidget user={user} />
        </div>
      )}

      <div className="zaza-grid">
        {filteredListings.map(listing => {
          const isFavorite = user && favorites.some(fav => fav.listing_id === listing.id);
          return (
            <div key={listing.id} className="zaza-card">
              <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    className="zaza-img"
                  />
                ) : (
                  <div className="zaza-img" />
                )}
              </Link>
              
              {user && (
                <div 
                  className={`zaza-heart ${isFavorite ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavoriteMutation.mutate({ listingId: listing.id, isFavorite });
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </div>
              )}

              <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id} className="block">
                <div className="zaza-category">{listing.category}</div>
                <div className="zaza-title">{listing.title}</div>
                <div className="zaza-price">{listing.price} €</div>
                {listing.city && <div className="zaza-location">{listing.city}</div>}
              </Link>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg mb-4">{t('noAdsFound')}</p>
          <Button onClick={handleResetFilters} variant="outline">
            {t('resetFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}