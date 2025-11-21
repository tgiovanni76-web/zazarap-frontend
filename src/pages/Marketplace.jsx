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
import { Search, MapPin, Laptop, Home, Shirt, Bike, Car, PawPrint, Package, Heart, Plus, Briefcase } from 'lucide-react';
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
    'motori': Car,
    'casa': Home,
    'animali': PawPrint,
    'lavoro': Briefcase,
    'sport': Bike
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header nero con logo rosso */}
      <header className="bg-black py-4 px-4">
        <h1 className="text-3xl font-bold text-[#E10600] text-center">
          ZAZARAP
          <div className="h-1 bg-[#FFD500] w-32 mx-auto mt-1"></div>
        </h1>
      </header>

      {/* Barra di ricerca gialla */}
      <div className="px-4 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cosa stai cercando?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-12 pr-4 rounded-full bg-[#FFD500] border-2 border-[#E10600] text-black placeholder-black font-medium focus:outline-none focus:ring-2 focus:ring-[#E10600]"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
        </div>
      </div>

      {/* Sezione categorie - 6 card, 2 per riga */}
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold mb-4 text-black">Categorie</h2>
        <div className="grid grid-cols-2 gap-4">
          {['elettronica', 'motori', 'casa', 'animali', 'lavoro', 'sport'].map(cat => {
            const Icon = categoryIcons[cat];
            return (
              <Link
                key={cat}
                to={createPageUrl('Category') + '?name=' + cat}
                className="bg-[#FFD500] border-3 border-[#E10600] rounded-2xl p-5 flex flex-col items-center justify-center hover:transform hover:-translate-y-1 transition-transform shadow-md"
              >
                <Icon className="h-10 w-10 mb-2 text-black" />
                <span className="text-sm font-bold text-black capitalize">{cat}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Listings - griglia 2 colonne, card nere */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4 text-black">Annunci in evidenza</h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredListings.slice(0, 10).map(listing => {
            const isFavorite = user && favorites.some(fav => fav.listing_id === listing.id);
            return (
              <div key={listing.id} className="bg-black rounded-xl overflow-hidden shadow-lg relative">
                <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title} 
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-800" />
                  )}
                </Link>
                
                {user && (
                  <div 
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavoriteMutation.mutate({ listingId: listing.id, isFavorite });
                    }}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-[#E10600] text-[#E10600]' : 'text-gray-600'}`} />
                  </div>
                )}

                <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id} className="block p-3">
                  <div className="text-[#FFD500] font-bold text-sm line-clamp-2 mb-1">{listing.title}</div>
                  <div className="text-[#E10600] font-bold text-lg">{listing.price} €</div>
                  {listing.city && <div className="text-gray-400 text-xs mt-1">{listing.city}</div>}
                </Link>
              </div>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nessun annuncio trovato</p>
        )}
      </div>

      {/* Pulsante floating rosso con bordo giallo */}
      <Link to={createPageUrl('NewListing')}>
        <button className="fixed bottom-20 right-6 bg-[#E10600] text-white rounded-full p-4 shadow-2xl border-4 border-[#FFD500] hover:scale-110 transition-transform z-50">
          <Plus className="h-8 w-8" />
        </button>
      </Link>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3 z-40">
        <div className="flex justify-around items-center">
          <Link to={createPageUrl('Marketplace')} className="flex flex-col items-center">
            <Home className="h-6 w-6 text-[#E10600]" />
            <span className="text-xs text-[#E10600] font-medium mt-1">Home</span>
          </Link>
          <Link to={createPageUrl('Favorites')} className="flex flex-col items-center">
            <Heart className="h-6 w-6 text-[#FFD500]" />
            <span className="text-xs text-[#FFD500] mt-1">Preferiti</span>
          </Link>
          <Link to={createPageUrl('Messages')} className="flex flex-col items-center">
            <Package className="h-6 w-6 text-[#FFD500]" />
            <span className="text-xs text-[#FFD500] mt-1">Messaggi</span>
          </Link>
          <Link to={createPageUrl('MarketplaceDashboard')} className="flex flex-col items-center">
            <Briefcase className="h-6 w-6 text-[#FFD500]" />
            <span className="text-xs text-[#FFD500] mt-1">Profilo</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}