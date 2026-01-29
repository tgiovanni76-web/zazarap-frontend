import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function MarketplaceDashboard() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
  });

  const active = listings.filter(l => l.status === 'active').length;
  const sold = listings.filter(l => l.status === 'sold').length;
  const totalRevenue = listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.price || 0), 0);

  if (isLoading) return <div className="p-6 text-center">Caricamento...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm text-slate-600">Attivi</p>
            <p className="text-2xl font-bold">{active}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-sm text-slate-600">Venduti</p>
            <p className="text-2xl font-bold">{sold}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-sm text-slate-600">Ricavi</p>
            <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}