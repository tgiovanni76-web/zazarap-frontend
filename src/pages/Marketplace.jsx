import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Laptop, Home, Shirt, Bike, Car, PawPrint, Package } from 'lucide-react';

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
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

      <div className="mb-6 space-y-4">
        <Input
          placeholder="Cerca annunci..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
        {categoryFilter !== 'all' && (
          <Button variant="outline" onClick={() => setCategoryFilter('all')}>
            Mostra tutte le categorie
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3.5 p-2.5">
        {filteredListings.map(listing => (
          <Link
            key={listing.id}
            to={createPageUrl('ListingDetail') + '?id=' + listing.id}
            className="bg-white rounded-[10px] overflow-hidden shadow-[0px_2px_6px_rgba(0,0,0,0.18)] hover:shadow-lg transition-shadow"
          >
            {listing.images && listing.images.length > 0 && (
              <img 
                src={listing.images[0]} 
                alt={listing.title} 
                className="w-full h-[135px] object-cover"
              />
            )}
            <h3 className="text-sm font-bold m-1.5">{listing.title}</h3>
            <p className="text-[15px] font-bold text-[#e84c00] m-1.5">{listing.price} €</p>
          </Link>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <p className="text-slate-500">Nessun annuncio trovato</p>
      )}
    </div>
  );
}