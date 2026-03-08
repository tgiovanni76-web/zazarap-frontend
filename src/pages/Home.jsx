import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Shield, Heart, Zap, ArrowRight } from 'lucide-react';
import FeaturedListings from '../components/marketplace/FeaturedListings';
import CategoryIcon from '../components/marketplace/CategoryIcon';
import SubcategoryGrid from '../components/marketplace/SubcategoryGrid';
import { useLanguage } from '../components/LanguageProvider';

export default function Home() {
  const { t, currentLanguage } = useLanguage();

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

  const PREFERRED_MAIN_ORDER = [
    'Fahrzeuge',
    'Immobilien',
    'Elektronik',
    'Haus & Garten',
    'Mode & Beauty',
    'Familie, Kind & Baby',
    'Freizeit & Hobby',
    'Tiere',
    'Jobs',
    'Dienstleistungen',
    'Zu verschenken',
  ];

  const mainCategories = categories
    .filter(c => !c.parentId && c.active)
    .sort((a,b) => {
      const la = labelFromCat(a);
      const lb = labelFromCat(b);
      const ia = PREFERRED_MAIN_ORDER.indexOf(la);
      const ib = PREFERRED_MAIN_ORDER.indexOf(lb);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return la.localeCompare(lb, 'de');
    })
    .slice(0, 12);

  // Compute main categories after helpers are defined
  const mainCategories = categories
    .filter(c => !c.parentId && c.active)
    .sort((a,b) => {
      const la = labelFromCat(a);
      const lb = labelFromCat(b);
      const ia = PREFERRED_MAIN_ORDER.indexOf(la);
      const ib = PREFERRED_MAIN_ORDER.indexOf(lb);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return la.localeCompare(lb, 'de');
    })
    .slice(0, 12);

  const tr = (key, fb) => { const v = t(key); return v === key ? fb : v; };
  const heroTitle = tr('home.hero.title', currentLanguage === 'de' ? 'Finde, was du suchst – mit Zazarap' : t('home.hero.title'));
  const heroSubtitle = tr('home.hero.subtitle', currentLanguage === 'de' ? 'Durchsuche Tausende von Kleinanzeigen in ganz Deutschland – sicher und schnell.' : t('home.hero.subtitle'));
  const searchLabel = tr('home.search.button', currentLanguage === 'de' ? 'Suchen' : (t('searchPlaceholder') || 'Search'));
  const categoriesTitle = tr('home.section.categories', currentLanguage === 'de' ? 'Entdecke die Kategorien' : t('nav.categories'));
  const viewAllLabel = tr('home.section.viewAll', currentLanguage === 'de' ? 'Alle anzeigen' : t('home.section.viewAll'));
  const safeTitle = tr('home.feature.safe.title', currentLanguage === 'de' ? 'Sicher kaufen' : t('home.feature.safe.title'));
  const safeDesc = tr('home.feature.safe.desc', currentLanguage === 'de' ? 'PayPal-Schutz und sichere Zahlungsabwicklung' : t('home.feature.safe.desc'));
  const favoritesTitle = tr('favorites', currentLanguage === 'de' ? 'Favoriten' : t('favorites'));
  const favoritesDesc = tr('home.feature.favorites.desc', currentLanguage === 'de' ? 'Merke dir interessante Anzeigen für später' : t('home.feature.favorites.desc'));


   return (
    <div className="h-auto min-h-0">
      {user && (
        <div
          className="fixed left-3 md:left-6 pointer-events-none z-[998]"
          style={{ top: 'calc(var(--header-height, 64px) + 6px)' }}
          aria-live="polite"
        >
          <div className="inline-flex items-center gap-2 text-sm text-slate-700 bg-slate-100/80 dark:bg-slate-800/70 px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
            <span aria-hidden>👋</span>
            <span>
              Willkommen zurück, {(
                user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.full_name || (user?.email || '').split('@')[0]
              )}
            </span>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--z-primary)] via-[var(--z-primary-light)] to-[var(--z-primary-dark)] text-white py-16 px-4 rounded-2xl mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            {heroTitle}
          </h1>
          <p className="text-xl mb-8 text-white/90">
            {heroSubtitle}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Marketplace')}>
              <Button size="lg" className="bg-[#f9d65c] text-[var(--z-primary)] hover:bg-yellow-300 font-bold text-lg px-8">
                <Search className="h-5 w-5 mr-2" />
                {searchLabel}
              </Button>
            </Link>
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white text-white hover:bg-white/20"
                onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
              >
                {t('header.nav.register')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">{t('aiRecommendations')}</h3>
            <p className="text-sm text-slate-600">
              {t('exploreToGetSuggestions')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">{safeTitle}</h3>
            <p className="text-sm text-slate-600">
              {safeDesc}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-bold mb-2">{favoritesTitle}</h3>
            <p className="text-sm text-slate-600">
              {favoritesDesc}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {mainCategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[var(--z-primary)]" />
            {categoriesTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mainCategories.map(cat => (
              <div key={cat.id}>
                <Link to={createPageUrl('Marketplace') + '?category=' + encodeURIComponent(cat.name)}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[var(--z-primary)]">
                    <CardContent className="pt-6 text-center">
                      <div className="mb-2 flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 text-[var(--z-primary)] flex items-center justify-center border border-yellow-300">
                          <CategoryIcon name={cat.icon} className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="font-semibold">{labelFromCat(cat)}</h3>
                    </CardContent>
                  </Card>
                </Link>
                <SubcategoryGrid categories={categories} parent={cat} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Listings */}
      <FeaturedListings listings={listings} />

      {/* Recent Listings Preview */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('dashboard.recentListings')}</h2>
          <Link to={createPageUrl('Marketplace')}>
            <Button variant="ghost" className="text-[var(--z-primary)]">
              {viewAllLabel}
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
                <div className="zaza-category">{(categories && categories.length) ? (t(categories.find(c => c.name === listing.category)?.i18nKey || categories.find(c => c.name === listing.category)?.name || listing.category)) : t(listing.category)}</div>
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
              {t('home.cta.title') || 'Bereit loszulegen?'}
            </h2>
            <p className="text-lg mb-6 text-white/90">
              {t('home.cta.subtitle') || 'Erstelle ein kostenloses Konto und erhalte personalisierte KI-Empfehlungen'}
            </p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-slate-100 font-bold"
              onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}
            >
              {t('home.cta.button') || 'Jetzt kostenlos registrieren'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}