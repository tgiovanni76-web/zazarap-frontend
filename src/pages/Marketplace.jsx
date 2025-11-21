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
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
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
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    return matchesSearch && matchesCategory && listing.status === 'active';
  });

  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))];

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
      <h2 className="text-3xl font-bold mb-6">Annunci</h2>

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
        <p className="text-slate-500">Nessun annuncio trovato</p>
      )}
    </div>
  );
}