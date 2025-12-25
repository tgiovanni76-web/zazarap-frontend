import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Shield, Heart, Zap, ArrowRight } from 'lucide-react';
import AIRecommendations from '../components/marketplace/AIRecommendations';
import FeaturedListings from '../components/marketplace/FeaturedListings';
import { useLanguage } from '../components/LanguageProvider';

export default function Home() {
  const { t } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date', 20),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  const mainCategories = categories.filter(c => !c.parentId && c.active).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#d62828] via-[#b82020] to-[#8a1818] text-white py-16 px-4 rounded-2xl mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Willkommen bei Zazarap
          </h1>
          <p className="text-xl mb-8 text-white/90">
            Deutschlands sicherer Kleinanzeigen-Marktplatz mit KI-Empfehlungen
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Marketplace')}>
              <Button size="lg" className="bg-[#f9d65c] text-[#d62828] hover:bg-yellow-300 font-bold text-lg px-8">
                <Search className="h-5 w-5 mr-2" />
                Jetzt durchsuchen
              </Button>
            </Link>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white text-white hover:bg-white/20"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Kostenlos registrieren
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendations - Prominent placement for logged-in users */}
      {user && (
        <AIRecommendations user={user} />
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">KI-Empfehlungen</h3>
            <p className="text-sm text-slate-600">
              Intelligente Vorschläge basierend auf deinem Suchverhalten
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Sicher kaufen</h3>
            <p className="text-sm text-slate-600">
              PayPal-Schutz und sichere Zahlungsabwicklung
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-bold mb-2">Favoriten speichern</h3>
            <p className="text-sm text-slate-600">
              Merke dir interessante Anzeigen für später
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {mainCategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#d62828]" />
            Beliebte Kategorien
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mainCategories.map(cat => (
              <Link 
                key={cat.id} 
                to={createPageUrl('Marketplace') + '?category=' + cat.name}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#d62828]">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">{cat.icon || '📦'}</div>
                    <h3 className="font-semibold">{t(cat.name)}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Listings */}
      <FeaturedListings listings={listings} />

      {/* Recent Listings Preview */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Neue Anzeigen</h2>
          <Link to={createPageUrl('Marketplace')}>
            <Button variant="ghost" className="text-[#d62828]">
              Alle anzeigen
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="zaza-grid">
          {listings.slice(0, 6).map(listing => (
            <Link 
              key={listing.id} 
              to={createPageUrl('ListingDetail') + '?id=' + listing.id}
            >
              <div className="zaza-card">
                {listing.images?.[0] ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="zaza-img"
                  />
                ) : (
                  <div className="zaza-img" />
                )}
                <div className="zaza-category">{t(listing.category)}</div>
                <div className="zaza-title">{listing.title}</div>
                <div className="zaza-price">{listing.price} €</div>
                {listing.city && <div className="zaza-location">{listing.city}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Bereit loszulegen?
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Erstelle ein kostenloses Konto und erhalte personalisierte KI-Empfehlungen
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-slate-100 font-bold"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Jetzt kostenlos registrieren
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}