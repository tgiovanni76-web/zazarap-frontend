import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Activity, Eye, Heart, MessageSquare, ShoppingCart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserActivityDetail({ activities, users, listings }) {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = (email) => {
    setSearchEmail(email);
    if (email.trim()) {
      const user = users.find(u => u.email.toLowerCase().includes(email.toLowerCase()));
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
  };

  const userActivities = selectedUser 
    ? activities.filter(a => a.userId === selectedUser.email).sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      )
    : [];

  const activityIcons = {
    view: Eye,
    favorite: Heart,
    search: Search,
    message: MessageSquare,
    click: Activity,
    purchase: ShoppingCart
  };

  const activityColors = {
    view: 'bg-blue-100 text-blue-800',
    favorite: 'bg-red-100 text-red-800',
    search: 'bg-green-100 text-green-800',
    message: 'bg-purple-100 text-purple-800',
    click: 'bg-yellow-100 text-yellow-800',
    purchase: 'bg-pink-100 text-pink-800'
  };

  // User stats
  const userStats = selectedUser ? {
    totalActivities: userActivities.length,
    views: userActivities.filter(a => a.activityType === 'view').length,
    favorites: userActivities.filter(a => a.activityType === 'favorite').length,
    searches: userActivities.filter(a => a.activityType === 'search').length,
    messages: userActivities.filter(a => a.activityType === 'message').length,
    topCategories: [...new Set(userActivities.filter(a => a.category).map(a => a.category))].slice(0, 5)
  } : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Nutzer-Aktivität durchsuchen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="E-Mail-Adresse eingeben..."
                value={searchEmail}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {searchEmail && users.filter(u => 
            u.email.toLowerCase().includes(searchEmail.toLowerCase())
          ).slice(0, 5).map(user => (
            <div 
              key={user.email}
              onClick={() => {
                setSelectedUser(user);
                setSearchEmail(user.email);
              }}
              className="mt-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <p className="font-semibold">{user.full_name || 'Unbekannt'}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <div className="grid md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{userStats.totalActivities}</p>
                <p className="text-xs text-slate-600">Aktivitäten</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{userStats.views}</p>
                <p className="text-xs text-slate-600">Ansichten</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{userStats.favorites}</p>
                <p className="text-xs text-slate-600">Favoriten</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{userStats.searches}</p>
                <p className="text-xs text-slate-600">Suchen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{userStats.messages}</p>
                <p className="text-xs text-slate-600">Nachrichten</p>
              </CardContent>
            </Card>
          </div>

          {userStats.topCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Interessenkategorien</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userStats.topCategories.map(cat => (
                    <Badge key={cat} variant="secondary" className="text-sm">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Aktivitätsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userActivities.map((activity, idx) => {
                  const Icon = activityIcons[activity.activityType] || Activity;
                  const listing = activity.listingId ? listings.find(l => l.id === activity.listingId) : null;
                  
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${activityColors[activity.activityType] || 'bg-slate-100'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={activityColors[activity.activityType]}>
                            {activity.activityType}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(activity.created_date).toLocaleString('de-DE')}
                          </span>
                        </div>
                        {listing && (
                          <Link 
                            to={createPageUrl('ListingDetail') + '?id=' + listing.id}
                            className="text-sm font-medium hover:text-blue-600"
                          >
                            {listing.title}
                          </Link>
                        )}
                        {activity.searchTerm && (
                          <p className="text-sm text-slate-600">Suchbegriff: "{activity.searchTerm}"</p>
                        )}
                        {activity.category && (
                          <p className="text-xs text-slate-500">Kategorie: {activity.category}</p>
                        )}
                        {activity.source && (
                          <p className="text-xs text-slate-500">Quelle: {activity.source}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {userActivities.length === 0 && (
                  <p className="text-slate-500 text-center py-8">Keine Aktivitäten gefunden</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}