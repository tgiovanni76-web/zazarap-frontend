import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UserDemographics from '../components/analytics/UserDemographics';
import EngagementMetrics from '../components/analytics/EngagementMetrics';
import TransactionVolume from '../components/analytics/TransactionVolume';
import ListingPerformance from '../components/analytics/ListingPerformance';
import UserActivityDetail from '../components/analytics/UserActivityDetail';

export default function AdminAnalytics() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.UserActivity.list('-created_date', 1000),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 500),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h2>
        <p>Nur Administratoren können auf diese Seite zugreifen.</p>
      </div>
    );
  }

  const isLoading = usersLoading || listingsLoading || activitiesLoading;

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Lade Analytics-Daten...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          User Analytics Dashboard
        </h1>
        <Link to={createPageUrl('AdminDashboard')}>
          <Button variant="outline">← Zurück zum Dashboard</Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Demografie
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Transaktionen
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Listings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-slate-600 mb-1">Gesamt Nutzer</div>
                <div className="text-3xl font-bold text-blue-600">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-slate-600 mb-1">Aktivitäten</div>
                <div className="text-3xl font-bold text-green-600">{activities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-slate-600 mb-1">Listings</div>
                <div className="text-3xl font-bold text-purple-600">{listings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-slate-600 mb-1">Transaktionen</div>
                <div className="text-3xl font-bold text-orange-600">{transactions.length}</div>
              </CardContent>
            </Card>
          </div>

          <UserDemographics users={users} listings={listings} />
          <UserActivityDetail activities={activities} users={users} listings={listings} />
        </TabsContent>

        <TabsContent value="demographics">
          <UserDemographics users={users} listings={listings} />
        </TabsContent>

        <TabsContent value="engagement">
          <EngagementMetrics 
            activities={activities} 
            favorites={favorites}
            messages={messages}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionVolume transactions={transactions} />
        </TabsContent>

        <TabsContent value="listings">
          <ListingPerformance 
            listings={listings} 
            activities={activities}
            favorites={favorites}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}