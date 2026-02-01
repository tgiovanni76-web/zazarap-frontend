import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, DollarSign, Eye, Sparkles, LifeBuoy, Zap, AlertCircle } from 'lucide-react';
import SellerMetrics from '../components/seller/SellerMetrics';
import ProductsQuickManager from '../components/seller/ProductsQuickManager';
import PrioritySupport from '../components/seller/PrioritySupport';

export default function SellerHub() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['sellerListings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ created_by: user.email }),
    enabled: !!user
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['sellerChats', user?.email],
    queryFn: () => base44.entities.Chat.filter({ sellerId: user.email }),
    enabled: !!user
  });

  const activeListings = listings.filter(l => l.status === 'active' && l.moderationStatus === 'approved');
  const pendingChats = chats.filter(c => c.status === 'in_attesa' || c.status === 'proposta_in_corso').length;
  const totalRevenue = chats.filter(c => c.status === 'completata').reduce((sum, c) => sum + (c.agreedPrice || 0), 0);
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

  return (
    <div className="py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🏪 Hub Venditore</h1>
          <p className="text-slate-600 mt-1">Dashboard completa per gestire le tue vendite</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
          <Sparkles className="h-4 w-4 mr-1" />
          Venditore Pro
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Annunci attivi</p>
                <p className="text-2xl font-bold">{activeListings.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ricavi totali</p>
                <p className="text-2xl font-bold">{totalRevenue.toFixed(0)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Visualizzazioni</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Chat attive</p>
                <p className="text-2xl font-bold">{pendingChats}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Metriche
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Prodotti
          </TabsTrigger>
          <TabsTrigger value="support">
            <LifeBuoy className="h-4 w-4 mr-2" />
            Supporto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <SellerMetrics listings={listings} chats={chats} />
        </TabsContent>

        <TabsContent value="products">
          <ProductsQuickManager listings={listings} />
        </TabsContent>

        <TabsContent value="support">
          <PrioritySupport user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}