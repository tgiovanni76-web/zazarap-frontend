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

export default function Marketplace() {
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
        <h2 className="text-3xl font-bold">Annunci</h2>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
        >
          {showFilters ? 'Nascondi filtri' : 'Filtri avanzati'}
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Cerca annunci per parola chiave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 text-lg"
          />
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prezzo minimo (€)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prezzo massimo (€)</label>
                <Input
                  type="number"
                  placeholder="Illimitato"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Città</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutte le città" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Tutte le città</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ordina per</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_date">Più recenti</SelectItem>
                    <SelectItem value="created_date">Meno recenti</SelectItem>
                    <SelectItem value="price">Prezzo crescente</SelectItem>
                    <SelectItem value="-price">Prezzo decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleResetFilters} variant="outline" className="flex-1">
                Resetta filtri
              </Button>
              <Badge variant="secondary" className="py-2 px-4">
                {filteredListings.length} annunci trovati
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {['elettronica', 'casa', 'moda', 'sport', 'auto', 'animali', 'altro'].map(cat => {
          const Icon = categoryIcons[cat];
          const count = listings.filter(l => l.category === cat && l.status === 'active').length;
          return (
            <Link
              key={cat}
              to={createPageUrl('Category') + '?name=' + cat}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                categoryFilter === cat 
                  ? 'border-indigo-600 bg-indigo-50' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Icon className={`h-8 w-8 mb-2 ${categoryFilter === cat ? 'text-indigo-600' : 'text-slate-600'}`} />
              <p className="text-sm font-medium capitalize">{cat}</p>
              <p className="text-xs text-slate-500">{count}</p>
            </Link>
          );
        })}
      </div>

      <div className="zaza-filters">
        <div className="zaza-filters-title">Cerca annunci</div>
        <input
          placeholder="Cerca per parola chiave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="zaza-filter-input"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="text-sm text-[#e84c00] mt-2"
          >
            Cancella ricerca
          </button>
        )}
      </div>

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
          <p className="text-slate-500 text-lg mb-4">Nessun annuncio trovato</p>
          <Button onClick={handleResetFilters} variant="outline">
            Resetta filtri
          </Button>
        </div>
      )}
    </div>
  );
}