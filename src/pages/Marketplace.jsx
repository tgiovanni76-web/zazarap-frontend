import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageProvider';
import SEOHead from '../components/SEOHead';
import { Heart, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function Marketplace() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

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

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    const matchesCity = !cityFilter || listing.city?.toLowerCase().includes(cityFilter.toLowerCase());
    
    // Show active listings (or all if admin)
    const matchesStatus = user?.role === 'admin' ? true : listing.status === 'active';
    const matchesModeration = user?.role === 'admin' || listing.moderationStatus === 'approved';
    
    return matchesSearch && matchesCategory && matchesCity && matchesStatus && matchesModeration;
  });

  const uniqueCities = [...new Set(listings.map(l => l.city).filter(Boolean))].sort();

  // Hardcoded categories from design to map to if needed, otherwise use dynamic
  // We will use dynamic categories for the grid to ensure functionality

  return (
    <div className="page-wrapper">
      <SEOHead 
        title="Zazarap – Kleinanzeigen in Deutschland"
        description="Finde, was du suchst – mit Zazarap. Durchsuche Tausende von Kleinanzeigen in ganz Deutschland."
      />

      <style>{`
        :root {
          --z-red: #dd2c2c;
          --z-yellow: #f9c100;
          --bg-light: #f5f5f5;
          --text-main: #222222;
          --text-muted: #666666;
          --card-bg: #ffffff;
          --shadow-soft: 0 6px 18px rgba(0, 0, 0, 0.06);
          --radius: 14px;
        }

        .page-wrapper {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 16px 48px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: var(--text-main);
        }

        /* HERO / SUCHE */
        .hero {
          background: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow-soft);
          padding: 28px 24px 24px;
          margin-top: 24px;
        }

        .hero-title {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .hero-subtitle {
          margin: 0 0 18px;
          font-size: 14px;
          color: var(--text-muted);
        }

        .search-row {
          display: grid;
          grid-template-columns: 2.2fr 1.4fr 1.4fr auto;
          gap: 10px;
          align-items: center;
        }

        .search-input,
        .search-select {
          border-radius: 999px;
          border: 1px solid #dddddd;
          padding: 10px 14px;
          font-size: 14px;
          width: 100%;
          background: #ffffff;
          height: 42px;
        }

        .search-input::placeholder {
          color: #aaaaaa;
        }

        .btn-primary {
          border-radius: 999px;
          border: none;
          padding: 0 24px;
          height: 42px;
          font-size: 15px;
          font-weight: 600;
          background: var(--z-red);
          color: #ffffff;
          cursor: pointer;
          transition: background 0.15s ease-out, transform 0.1s ease-out;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary:hover {
          background: #c32121;
          transform: translateY(-1px);
        }

        /* KATEGORIEN */
        .section {
          margin-top: 36px;
        }

        .section h2 {
          font-size: 22px;
          margin-bottom: 14px;
          font-weight: 700;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .category-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow-soft);
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
          transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
          border: 1px solid transparent;
        }

        .category-card:hover, .category-card.active {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
          border-color: var(--z-yellow);
        }

        .category-icon {
          font-size: 22px;
          margin-bottom: 4px;
        }

        .category-title {
          font-size: 16px;
          font-weight: 600;
        }

        .category-desc {
          font-size: 13px;
          color: var(--text-muted);
        }

        /* ANZEIGEN IM FOKUS */
        .focus-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }

        .ad-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          box-shadow: var(--shadow-soft);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.12s ease-out;
          position: relative;
        }
        
        .ad-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .ad-image-container {
          height: 170px;
          width: 100%;
          position: relative;
          background: #dddddd;
        }

        .ad-image {
          height: 100%;
          width: 100%;
          object-fit: cover;
        }

        .ad-body {
          padding: 14px 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ad-title {
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ad-price {
          font-size: 17px;
          font-weight: 700;
          color: var(--z-red);
        }

        .ad-location {
          font-size: 13px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ad-badge {
          font-size: 11px;
          background: var(--z-yellow);
          color: #7a3a00;
          display: inline-block;
          padding: 3px 8px;
          border-radius: 999px;
          font-weight: 600;
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
        }

        .ad-heart {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255,255,255,0.9);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--z-red);
          cursor: pointer;
          z-index: 10;
          border: none;
          transition: transform 0.1s;
        }
        
        .ad-heart:hover {
            transform: scale(1.1);
        }

        /* ENDECKE MEHR */
        .discover-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          font-size: 13px;
        }

        .discover-column-title {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--z-red);
        }

        .discover-links {
          color: var(--text-muted);
          line-height: 1.6;
        }
        
        @media (max-width: 860px) {
          .search-row {
            grid-template-columns: 1fr;
          }
          .search-row > * {
            margin-bottom: 10px;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {user && (user.firstName || user.lastName) && (
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
          animation: 'fadeIn 0.6s ease-out',
          marginBottom: '24px'
        }}>
          <span style={{fontSize: '26px'}}>👋</span>
          <span>{t('welcomeBack').replace('{name}', `${user.firstName || ''} ${user.lastName || ''}`.trim())}</span>
        </div>
      )}

      {/* HERO / SUCHE */}
      <section className="hero">
        <h1 className="hero-title">Finde, was du suchst – mit Zazarap</h1>
        <p className="hero-subtitle">
          Durchsuche Tausende von Kleinanzeigen in ganz Deutschland – sicher und schnell.
        </p>
        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Auto, Wohnung, Smartphone, Fahrrad …"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="search-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{t(cat.name)}</option>
            ))}
          </select>
          <input
            className="search-input"
            type="text"
            placeholder="Ganz Deutschland"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
          <button className="btn-primary">Suchen</button>
        </div>
      </section>

      {/* KATEGORIEN */}
      <section className="section">
        <h2>Kategorien entdecken</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`category-card ${categoryFilter === cat.name ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.name === categoryFilter ? 'all' : cat.name)}
            >
              <div className="category-icon">
                {/* Simple mapping or first char if no icon */}
                {cat.icon ? <i className={`lucide-${cat.icon}`} /> : '📦'}
              </div>
              <div className="category-title">{t(cat.name)}</div>
              <div className="category-desc">
                 {t(cat.name + '_desc') !== (cat.name + '_desc') ? t(cat.name + '_desc') : 'Entdecken Sie ' + t(cat.name)}
              </div>
            </div>
          ))}
          
          {/* Hardcoded fallback for design demo if no categories exist */}
          {categories.length === 0 && (
            <>
              <div className="category-card">
                <div className="category-icon">🚗</div>
                <div className="category-title">Motoren</div>
                <div className="category-desc">Autos, Motorräder & Ersatzteile.</div>
              </div>
              <div className="category-card">
                <div className="category-icon">🛒</div>
                <div className="category-title">Markt</div>
                <div className="category-desc">Elektronik, Möbel und mehr.</div>
              </div>
              <div className="category-card">
                <div className="category-icon">🏡</div>
                <div className="category-title">Immobilien</div>
                <div className="category-desc">Wohnungen, Häuser & WG-Zimmer.</div>
              </div>
              <div className="category-card">
                <div className="category-icon">💼</div>
                <div className="category-title">Arbeit</div>
                <div className="category-desc">Jobs & Vollzeitstellen.</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ANZEIGEN IM FOKUS / ERGEBNISSE */}
      <section className="section">
        <h2>{searchTerm || categoryFilter !== 'all' ? 'Suchergebnisse' : '⭐ Anzeigen im Fokus'}</h2>
        <div className="focus-grid">
          {filteredListings.length > 0 ? (
            filteredListings.map(listing => {
              const isFavorite = user && favorites.some(fav => fav.listing_id === listing.id);
              return (
                <article key={listing.id} className="ad-card">
                  <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id} className="block">
                    <div className="ad-image-container">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="ad-image" />
                      ) : (
                        <div className="ad-image flex items-center justify-center text-gray-400">
                          Kein Bild
                        </div>
                      )}
                      {(listing.featured || listing.promoted) && <span className="ad-badge">Im Fokus</span>}
                    </div>
                  </Link>
                  
                  {user && (
                    <button 
                      className="ad-heart"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavoriteMutation.mutate({ listingId: listing.id, isFavorite });
                      }}
                    >
                      <Heart 
                        size={18} 
                        fill={isFavorite ? "currentColor" : "none"} 
                        strokeWidth={2}
                      />
                    </button>
                  )}

                  <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id} className="block no-underline text-current">
                    <div className="ad-body">
                      <div className="ad-title">{listing.title}</div>
                      <div className="ad-price">{listing.price} €</div>
                      <div className="ad-location">
                        <MapPin size={12} /> {listing.city || 'Deutschland'}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              Keine Anzeigen gefunden.
            </div>
          )}
        </div>
      </section>

      {/* ENTDECKE MEHR */}
      <section className="section">
        <h2>Mehr auf Zazarap entdecken</h2>
        <div className="discover-grid">
          <div>
            <div className="discover-column-title">Motoren</div>
            <div className="discover-links">
              Gebrauchtwagen – Motorräder – E-Bikes – Transporter – Oldtimer – Händlerfahrzeuge
            </div>
          </div>

          <div>
            <div className="discover-column-title">Markt</div>
            <div className="discover-links">
              Elektronik – Smartphones – Möbel – Garten – Haustiere – Fahrräder – Kinderartikel
            </div>
          </div>

          <div>
            <div className="discover-column-title">Immobilien</div>
            <div className="discover-links">
              Wohnungen – Häuser – Mieten – Kaufen – WG-Zimmer – Gewerbeimmobilien
            </div>
          </div>

          <div>
            <div className="discover-column-title">Arbeit</div>
            <div className="discover-links">
              Vollzeitjobs – Teilzeitjobs – Minijobs – Homeoffice – Pflege – Gastronomie – Verkauf – Logistik
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}