import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Users, Heart, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import FeaturedListings from '../components/marketplace/FeaturedListings';
import AdBanner from '@/components/ads/AdBanner';
import CategoryIcon from '../components/marketplace/CategoryIcon';

import { variantUrl } from '../components/media/variantUrl';
import { useLanguage } from '../components/LanguageProvider';

export default function Home() {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

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

  const FALLBACK_DE_BY_ICON = {
    Car: 'Fahrzeuge',
    Home: 'Immobilien',
    Laptop: 'Elektronik',
    Sprout: 'Haus & Garten',
    Shirt: 'Mode & Beauty',
    Users: 'Familie & Baby',
    Gamepad2: 'Freizeit & Hobby',
    PawPrint: 'Tiere',
    Briefcase: 'Jobs',
    Wrench: 'Dienstleistungen',
    Gift: 'Zu verschenken',
  };

  const labelFromCat = (cat) => {
    if (!cat) return '';
    if (cat.i18nKey) {
      const txt = t(cat.i18nKey);
      if (txt && txt !== cat.i18nKey) return txt;
    }
    const tryKey = (cat.icon || cat.name || '').trim();
    if (FALLBACK_DE_BY_ICON[tryKey]) return FALLBACK_DE_BY_ICON[tryKey];
    return t(cat.name);
  };

  const PREFERRED_MAIN_ORDER = [
    'Fahrzeuge',
    'Immobilien',
    'Elektronik',
    'Haus & Garten',
    'Mode & Beauty',
    'Familie & Baby',
    'Freizeit & Hobby',
    'Tiere',
    'Jobs',
    'Dienstleistungen',
    'Zu verschenken',
  ];

  const mainCategories = (() => {
    const roots = categories.filter(c => !c.parentId && c.active);
    const byLabel = new Map();
    for (const c of roots) {
      const label = labelFromCat(c);
      const childrenCount = categories.filter(x => x.parentId === c.id).length;
      const cur = byLabel.get(label);
      if (!cur || childrenCount > cur.childrenCount) {
        byLabel.set(label, { cat: c, childrenCount });
      }
    }
    return Array.from(byLabel.values())
      .map(v => v.cat)
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
  })();



  const tr = (key, fb) => { const v = t(key); return v === key ? fb : v; };
  const heroTitle = tr('home.hero.title', currentLanguage === 'de' ? 'Finde, was du suchst – mit Zazarap' : t('home.hero.title'));
  const heroSubtitle = tr('home.hero.subtitle', currentLanguage === 'de' ? 'Durchsuche Tausende von Kleinanzeigen in ganz Deutschland – sicher und schnell.' : t('home.hero.subtitle'));
  const searchLabel = tr('home.search.button', currentLanguage === 'de' ? 'Suchen' : (t('searchPlaceholder') || 'Search'));
  const categoriesTitle = tr('home.section.categories', currentLanguage === 'de' ? 'Entdecke die Kategorien' : t('nav.categories'));
  const viewAllLabel = tr('home.section.viewAll', currentLanguage === 'de' ? 'Alle anzeigen' : t('home.section.viewAll'));
  const safeTitle = tr('home.feature.safe.title', currentLanguage === 'de' ? 'Direkter Kontakt' : 'Direct contact');
  const safeDesc = tr('home.feature.safe.desc', currentLanguage === 'de' ? 'Käufer und Verkäufer vereinbaren Zahlung, Abholung und Übergabe direkt miteinander.' : 'Buyers and sellers arrange payment, pickup, and handover directly.');
  const favoritesTitle = tr('favorites', currentLanguage === 'de' ? 'Favoriten' : t('favorites'));
  const favoritesDesc = tr('home.feature.favorites.desc', currentLanguage === 'de' ? 'Merke dir interessante Anzeigen für später' : t('home.feature.favorites.desc'));

  const catScrollRef = React.useRef(null);
  const scrollCats = (dir) => {
    const el = catScrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

   return (
    <div className="h-auto min-h-0">

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

      {/* Ad Banner - Home */}
      <AdBanner placement="home_banner" />

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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
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

      {/* Categories - horizontal scroll */}
      {mainCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[var(--z-primary)]" />
            {categoriesTitle}
          </h2>
          <div className="relative">
            {/* Left arrow (desktop) */}
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollCats(-1)}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow border hover:bg-white text-[var(--z-primary)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Scroll container */}
            <div
              ref={catScrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth px-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {mainCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={createPageUrl('Marketplace') + '?category=' + encodeURIComponent(cat.name)}
                  className="flex-shrink-0 w-40 sm:w-48 md:w-56 snap-start"
                >
                  <Card className="h-full hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-2 hover:border-[var(--z-primary)]">
                    <CardContent className="pt-6 text-center">
                      <div className="mb-2 flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 text-[var(--z-primary)] flex items-center justify-center border border-yellow-300">
                          <CategoryIcon name={cat.icon} className="h-6 w-6" />
                        </div>
                      </div>
                      <h3 className="font-semibold truncate">{labelFromCat(cat)}</h3>
                      <div className="mt-1 text-xs text-slate-600">
                        {categories
                          .filter((x) => x.parentId === cat.id && x.active)
                          .sort((a,b) => ((a.order ?? 0) - (b.order ?? 0)) || labelFromCat(a).localeCompare(labelFromCat(b), 'de'))
                          .slice(0,3)
                          .map((sub, i, arr) => (
                            <React.Fragment key={sub.id}>
                              <span
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(createPageUrl('Marketplace') + '?category=' + encodeURIComponent(sub.name)); }}
                                className="text-[var(--z-primary)] hover:underline cursor-pointer"
                              >
                                {labelFromCat(sub)}
                              </span>
                              {i < arr.length - 1 && <span className="mx-1 text-slate-400">•</span>}
                            </React.Fragment>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* View all button as last card */}
              <Link to={createPageUrl('Marketplace')} className="flex-shrink-0 w-40 sm:w-48 md:w-56 snap-start">
                <Card className="h-full border-2 border-dashed hover:border-[var(--z-primary)] hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="h-full pt-6 text-center flex items-center justify-center font-semibold text-[var(--z-primary)]">
                    {t('home.section.viewAll') || 'Alle Kategorien'} <ArrowRight className="h-4 w-4 ml-2" />
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Right arrow (desktop) */}
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollCats(1)}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow border hover:bg-white text-[var(--z-primary)]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
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
                    src={variantUrl(listing.images[0], 'thumb')} 
                    srcSet={`${variantUrl(listing.images[0], 'thumb')} 320w, ${variantUrl(listing.images[0], 'card')} 800w`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    alt={listing.title}
                    loading="lazy"
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