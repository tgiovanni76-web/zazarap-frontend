import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Zazarap Marketplace</h1>
          <p className="text-slate-600">Trova quello che cerchi</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Cerca annunci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le categorie</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map(listing => (
            <Link key={listing.id} to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                <div className="aspect-square bg-slate-200 overflow-hidden">
                  {listing.image ? (
                    <img 
                      src={listing.image} 
                      alt={listing.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 truncate mb-1">{listing.title}</h3>
                  <p className="text-2xl font-bold text-indigo-600 mb-2">€{listing.price?.toFixed(2)}</p>
                  {listing.city && (
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.city}</span>
                    </div>
                  )}
                  {listing.category && (
                    <Badge className="mt-2 bg-slate-100 text-slate-700 border-slate-200">
                      {listing.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">Nessun annuncio trovato</p>
          </div>
        )}
      </div>
    </div>
  );
}