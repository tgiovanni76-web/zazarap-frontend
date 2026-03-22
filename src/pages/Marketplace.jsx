import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Laptop, Home, Shirt, Bike, Car, PawPrint, Package, Heart, ShoppingBag, Briefcase, Sparkles } from 'lucide-react';
import MapView from '../components/marketplace/MapView';
import { toast } from 'sonner';
import FeaturedListings from '../components/marketplace/FeaturedListings';
import { variantUrl } from '../components/media/variantUrl';
import { useLanguage } from '../components/LanguageProvider';
import SEOHead from '../components/SEOHead';
import FollowButton from '../components/profile/FollowButton';
import AdCard from '@/components/ads/AdCard';

export default function Marketplace() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [showFilters, setShowFilters] = useState(false);
  const [radiusKm, setRadiusKm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cityCoordsRef = useRef({});
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings', sortBy],
    queryFn: () => base44.entities.Listing.list(sortBy),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  // Trigger expiry checks in background on page load
  useEffect(() => {
    (async () => {
      try { await base44.functions.invoke('handleListingsExpiry', {}); } catch (_) {}
    })();
  }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', user?.email],
    queryFn: () => base44.entities.UserActivity.filter({ userId: user.email }, '-created_date', 200),
    enabled: !!user
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  const labelForCategory = (cat) => {
    if (!cat) return '';
    if (cat.i18nKey) {
      const txt = t(cat.i18nKey);
      if (txt && txt !== cat.i18nKey) return txt;
    }
    return t(cat.name);
  };

  // Strip demo prefix from seeded titles when rendering
  const cleanTitle = (title) => (title || '').replace(/^(demo)\s*[-–—]?\s*/i, '');

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

  // Helpers for advanced keyword search
  const normalize = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const stem = (w) => w
    .replace(/(mente|mente$)/, '')
    .replace(/(azioni|zione|zioni|mente|mente$)/, '')
    .replace(/(ing|ed|es|s)$/,'')
    .replace(/(mente|ico|ici|ica|iche|ivi|iva|ivo)$/,'')
    .replace(/(lichkeit|schaft|chen|ung|en|er|e|n)$/,'');
  const tokenize = (s) => normalize(s).split(/[^a-z0-9à-ÿ]+/).filter(Boolean).map(stem);
  const SYN = {
    auto: ['car', 'auto', 'wagen'],
    macchina: ['auto', 'car'],
    telefono: ['smartphone', 'cellulare', 'phone', 'handy'],
    bici: ['bicicletta', 'fahrrad', 'bike'],
    casa: ['house', 'home', 'wohnung'],
    vestiti: ['abbigliamento', 'clothes', 'kleidung'],
  };
  const expand = (t) => Array.from(new Set([t, ...(SYN[t] || [])]));

  // Geodesic distance (km)
  const haversineKm = (a, b) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  // Preload coords for visible cities when needed
  useEffect(() => {
    if (!radiusKm && !showMap) return;
    const uniqueCitiesToLoad = Array.from(new Set(listings.map(l => l.city).filter(Boolean)))
      .filter(city => !cityCoordsRef.current[city]);
    if (uniqueCitiesToLoad.length === 0) return;
    (async () => {
      for (const city of uniqueCitiesToLoad.slice(0, 20)) { // limit per batch
        try {
          const { data } = await base44.functions.invoke('geocodeCity', { city });
          if (data?.found) {
            cityCoordsRef.current[city] = { lat: data.lat, lng: data.lon };
          }
        } catch (_) {}
      }
    })();
  }, [radiusKm, showMap, listings]);

  const displayListings = listings;

  const filteredListings = displayListings.filter(listing => {
    // Advanced keyword match
    const qTokens = tokenize(searchTerm);
    const lTokens = new Set([...tokenize(listing.title || ''), ...tokenize(listing.description || '')]);
    const matchesSearch = qTokens.length === 0 || qTokens.every(t => {
      const ex = expand(t);
      return ex.some(x => lTokens.has(x));
    });

    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const matchesMinPrice = !minPrice || listing.price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || listing.price <= parseFloat(maxPrice);

    // City text filter
    const matchesCity = !cityFilter || listing.city?.toLowerCase().includes(cityFilter.toLowerCase());

    // Geo radius filter
    let matchesRadius = true;
    if (radiusKm && userLocation) {
      const coords = listing.city ? cityCoordsRef.current[listing.city] : null;
      if (!coords) {
        matchesRadius = false; // will become true after coords load and re-render
      } else {
        const d = haversineKm(userLocation, coords);
        matchesRadius = d <= parseFloat(radiusKm);
      }
    }

    // Status filter - exclude sold/archived/reserved from public view (unless admin filtering)
    const matchesStatus = statusFilter === 'all' 
      ? (user?.role === 'admin' ? true : listing.status === 'active')
      : listing.status === statusFilter;
    
    // Always hide sold, archived, and reserved from public marketplace (non-owners)
    const isPubliclyVisible = user?.role === 'admin' || 
      listing.status === 'active' || 
      (user && listing.created_by === user.email);
    
    // Date filter
    const now = new Date();
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const createdDate = new Date(listing.created_date);
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      if (dateFilter === 'today') matchesDate = daysDiff === 0;
      else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
    }
    
    // Listing type filter
    const matchesListingType = listingTypeFilter === 'all' || listing.listingType === listingTypeFilter;

    // Only show approved listings to non-admin users
    const matchesModeration = user?.role === 'admin' || listing.moderationStatus === 'approved';
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesCity && matchesRadius && matchesStatus && matchesDate && matchesListingType && matchesModeration && isPubliclyVisible;
  });

  const uniqueCities = [...new Set(listings.map(l => l.city).filter(Boolean))].sort();

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setCityFilter('');
    setStatusFilter('all');
    setDateFilter('all');
    setListingTypeFilter('all');
    setSortBy('-created_date');
    setRadiusKm('');
    setUserLocation(null);
  };

  const categoryIcons = {
    'motoren': Car,
    'markt': ShoppingBag,
    'immobilien': Home,
    'arbeit': Briefcase
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
      <SEOHead 
        title="Zazarap.de - Marketplace Italiano Sicuro | Compra e Vendi Usato"
        description="Il miglior marketplace per comprare e vendere usato in sicurezza con protezione acquisti PayPal ed Escrow. Abbigliamento, Elettronica, Auto e altro."
      />

      {/* Rimosso banner di benvenuto ingombrante per richiesta UX */}
      {false && user && (user.firstName || user.lastName) && (
        <>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{
            background: 'linear-gradient(90deg, #ffcc00 0%, #ffdd44 100%)',
            padding: '18px',
            borderRadius: '10px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#8a0000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.6s ease-out'
          }} className="mb-6">
            <span style={{fontSize: '26px'}}>👋</span>
            <span>{t('welcomeBack').replace('{name}', `${user.firstName || ''} ${user.lastName || ''}`.trim())}</span>
          </div>
        </>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('nav.home')}</h2>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-yellow-400 text-red-600 border-2 border-red-600 hover:bg-yellow-500 hover:text-red-700"
        >
          {showFilters ? t('filters') : t('filters')}
        </Button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch max-w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" aria-hidden="true" />
          <div className="relative">
            <Input
              type="search"
              aria-label={t('searchPlaceholder')}
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(false);
              }}
              onFocus={() => setShowSuggestions(searchTerm.trim().length >= 2)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}

              className="pl-10 h-12 text-lg border-2 border-red-600"
            />

          </div>
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger 
            className="md:w-64 h-12 bg-yellow-400 text-red-600 border-2 border-red-600 font-bold hover:bg-yellow-500 focus:ring-2 focus:ring-red-600"
            aria-label={t('category')}
          >
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent className="max-h-96 overflow-y-auto">
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories
            .filter(c => !c.parentId && c.active)
            .map(mainCat => {
            const subs = categories.filter(c => c.parentId === mainCat.id && c.active);
            return [
              (
                <SelectItem key={`main-${mainCat.id}`} value={mainCat.name} className="font-bold">
                  {labelForCategory(mainCat)}
                </SelectItem>
              ),
              ...subs.map(sub => (
                <SelectItem key={`sub-${sub.id}`} value={sub.name} className="pl-6">
                  ↳ {labelForCategory(sub)}
                </SelectItem>
              ))
            ];
            })}
          </SelectContent>
        </Select>
        {categoryFilter !== 'all' && (
          <FollowButton
            targetType="category"
            targetId={categoryFilter}
            className="md:ml-2 h-12"
            labelFollow={t('ui.followCategory')}
            labelUnfollow={t('ui.unfollowCategory')}
          />
        )}
        </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('priceMin')}</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('priceMax')}</label>
                <Input
                  type="number"
                  placeholder=""
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('city')}</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allCities')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>{t('allCities')}</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('ui.radius')}</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder=""
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        });
                      }
                    }}
                  >
                    {t('ui.useMyLocation')}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('sortBy')}</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_date">{t('mostRecent')}</SelectItem>
                    <SelectItem value="created_date">{t('leastRecent')}</SelectItem>
                    <SelectItem value="price">{t('priceAsc')}</SelectItem>
                    <SelectItem value="-price">{t('priceDesc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('listingStatus')}</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses')}</SelectItem>
                      <SelectItem value="active">{t('active')}</SelectItem>
                      <SelectItem value="sold">{t('sold')}</SelectItem>
                      <SelectItem value="expired">{t('expired')}</SelectItem>
                      <SelectItem value="archived">{t('archived')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('publishDate')}</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allDates')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allDates')}</SelectItem>
                    <SelectItem value="today">{t('today')}</SelectItem>
                    <SelectItem value="week">{t('thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('thisMonth')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('listingType')}</label>
                <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allListingTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allListingTypes')}</SelectItem>
                    <SelectItem value="fixed">{t('listingType.fixed')}</SelectItem>
                    <SelectItem value="negotiable">{t('listingType.negotiable')}</SelectItem>
                    <SelectItem value="auction">{t('listingType.auction')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleResetFilters} variant="outline" className="flex-1">
                {t('resetFilters')}
              </Button>
              <Badge variant="secondary" className="py-2 px-4">
                {filteredListings.length} {t('adsFound')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <FeaturedListings listings={listings} />



      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-600">
          {userLocation ? `${t('ui.positionSet')} • ${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}` : t('ui.positionNotSet')}
          {radiusKm && ` • Raggio: ${radiusKm}km`}
        </div>
        <Button variant="outline" onClick={() => setShowMap(!showMap)}>
          {showMap ? t('ui.hideMap') : t('ui.showMap')}
        </Button>
      </div>
      {showMap && (
        <div className="mb-6">
          <MapView
            markers={filteredListings
              .map(l => ({
                id: l.id,
                title: l.title,
                price: l.price,
                ...(l.city && cityCoordsRef.current[l.city] ? { lat: cityCoordsRef.current[l.city].lat, lng: cityCoordsRef.current[l.city].lng } : null)
              }))
              .filter(m => m.lat && m.lng)}
            userLocation={userLocation}
            height={420}
          />
        </div>
      )}

      <div className="zaza-grid">
          {filteredListings.map((listing, idx) => {
            const isFavorite = user && favorites.some(fav => fav.listing_id === listing.id);
            return (
              <React.Fragment key={listing.id}>
                {idx > 0 && idx % 12 === 0 && <AdCard />}
                <div className="zaza-card">
                <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                  {listing.images && listing.images.length > 0 ? (
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
              </Link>
              
              {user && (
                <button 
                  type="button"
                  className={`zaza-heart ${isFavorite ? 'active' : ''} border-none focus:outline-none focus:ring-2 focus:ring-red-500`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavoriteMutation.mutate({ listingId: listing.id, isFavorite });
                  }}
                  aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                  aria-pressed={isFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                </button>
              )}

              <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id} className="block">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="zaza-category">{labelForCategory(categories.find(c => c.name === listing.category)) || t(listing.category)}</div>
                  {listing.status === 'reserved' && (
                    <Badge className="bg-yellow-600 text-white text-xs">🔒 Reserviert</Badge>
                  )}
                  {listing.status === 'sold' && (
                    <Badge className="bg-red-600 text-white text-xs">✓ Verkauft</Badge>
                  )}
                  {listing.status === 'archived' && (
                    <Badge variant="secondary" className="text-xs">Archiviert</Badge>
                  )}
                </div>
                <div className="zaza-title">{cleanTitle(listing.title)}</div>
                {listing.offerPrice ? (
                  <div className="zaza-price">
                    <span className="text-green-700 font-bold mr-2">{listing.offerPrice} €</span>
                    <span className="line-through text-slate-400 text-sm">{listing.price} €</span>
                  </div>
                ) : (
                  <div className="zaza-price">{listing.price} €</div>
                )}
                {listing.city && <div className="zaza-location">{listing.city}</div>}
              </Link>
            </div>
            </React.Fragment>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 text-lg mb-4">{t('noAdsFound')}</p>
          <Button onClick={handleResetFilters} variant="outline">
            {t('resetFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}