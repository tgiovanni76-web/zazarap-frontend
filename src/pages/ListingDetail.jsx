import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Calendar, Tag, Heart, MessageSquare, Star, ThumbsUp, Flag, Loader2 } from 'lucide-react';
import ReportListingModal from '../components/ReportListingModal';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SEOHead from '../components/SEOHead';
import StructuredData from '../components/marketplace/StructuredData';
import { variantUrl } from '../components/media/variantUrl';
import { useLanguage } from '../components/LanguageProvider';
import PremiumPromptManager from '@/components/premium/PremiumPromptManager';
import { PremiumReasons } from '@/lib/premium-prompts';
import SimilarProducts from '../components/marketplace/SimilarProducts';
import ImageLightbox from '../components/media/ImageLightbox';


export default function ListingDetail() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const cleanTitle = (title) => (title || '').replace(/^(demo)\s*[-–—]?\s*/i, '');
  const listingId = urlParams.get('id') || urlParams.get('listingId');
  const queryClient = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [activityTracked, setActivityTracked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isContactingLoading, setIsContactingLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings?.[0] ?? null; // react-query v5: never return undefined
    },
    enabled: !!listingId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: async () => {
      const r = await base44.entities.Review.filter({ listing_id: listingId });
      return r ?? [];
    },
    enabled: !!listingId
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      const f = await base44.entities.Favorite.filter({ user_email: user.email });
      return f ?? [];
    },
    enabled: !!user
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes', listingId],
    queryFn: async () => {
      const l = await base44.entities.ListingLike.filter({ listing_id: listingId });
      return l ?? [];
    },
    enabled: !!listingId
  });

  const isFavorite = favorites.some(fav => fav.listing_id === listingId);
  const isLiked = user && likes.some(like => like.user_email === user.email);
  const likesCount = likes.length;

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
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
      toast.success(isFavorite ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti');
    }
  });

  const addReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setReviewComment('');
      toast.success('Recensione aggiunta');
    }
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        const like = likes.find(l => l.user_email === user.email);
        await base44.entities.ListingLike.delete(like.id);
      } else {
        await base44.entities.ListingLike.create({
          listing_id: listingId,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      toast.success(isLiked ? 'Mi piace rimosso' : 'Mi piace aggiunto');
    }
  });

  const markAsSoldMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Listing.update(listingId, { status: 'sold' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Anzeige als verkauft markiert');
    },
    onError: () => {
      toast.error('Fehler beim Markieren');
    }
  });

  const handleAddReview = () => {
    if (!reviewComment.trim()) return;
    addReviewMutation.mutate({
      listing_id: listingId,
      reviewer_email: user.email,
      rating: reviewRating,
      comment: reviewComment
    });
  };

  const handleContactSeller = async (opts = {}) => {
    if (!listing) { toast.error('Anzeige nicht gefunden'); return; }
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('ListingDetail') + `?id=${listingId}`);
      return;
    }
    // Ensure listingId and seller are valid
    if (!listingId) {
      console.error('[ContactSeller] missing listingId in URL');
      toast.error('Fehler: Ungültige URL');
      return;
    }

    // Log current user ids for diagnostics
    console.debug('[ContactSeller] current user', { id: user.id, email: user.email });
    console.debug('[ContactSeller] listing owner fields', { created_by: listing.created_by, sellerId: listing.sellerId, ownerEmail: listing.ownerEmail, ownerId: listing.ownerId });

    const normalizeEmail = (s) => (s || '').toString().trim().toLowerCase();
    const buyerEmail = normalizeEmail(user.email);
    const sellerEmail = normalizeEmail([
      listing.created_by,
      listing.ownerEmail,
      listing.sellerId,
      listing.ownerId,
    ].find(v => typeof v === 'string' && v.includes('@')) || listing.created_by || listing.ownerEmail);

    if (!sellerEmail) {
      console.error('[ContactSeller] sellerEmail missing/invalid on listing', { listingId, listing });
      toast.error('Fehler: Verkäufer nicht gefunden');
      return;
    }
    if (buyerEmail === sellerEmail) {
      toast.error('Sie können Ihre eigene Anzeige nicht kontaktieren');
      return;
    }

    setIsContactingLoading(true);
    try {
      console.debug('[ContactSeller] click', { listingId, buyerEmail, sellerEmail });

      // Prüfen: existiert bereits eine Chat‑Konversation? Fehler ignorieren → anlegen
      let existingChats = [];
      try {
        existingChats = await base44.entities.Chat.filter(
          { listingId: listingId, buyerId: buyerEmail, sellerId: sellerEmail },
          '-updated_date'
        );
      } catch (e) {
        console.warn('[ContactSeller] existingChats filter failed, will create new chat', e);
        existingChats = [];
      }
      console.debug('[ContactSeller] filter for existing', { listingId, buyerId: user.email, sellerId: sellerEmail });
      console.debug('[ContactSeller] existingChats count', existingChats?.length, existingChats?.map(c => c.id));

      let chatId;

      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
        console.debug('[ContactSeller] using existing chat', { chatId });
      } else {
        // Neue Chat-Konversation anlegen
        const payload = {
          listingId: listingId,
          buyerId: buyerEmail,
          sellerId: sellerEmail,
          status: 'in_attesa',
          lastMessage: '',
          listingTitle: listing.title,
          listingImage: listing.images?.[0] || '',
          lastPrice: typeof listing.price === 'number' ? listing.price : undefined,
          updatedAt: new Date().toISOString(),
          unreadBuyer: 0,
          unreadSeller: 0
        };
        console.debug('[ContactSeller] creating chat payload', payload);
        try {
          localStorage.setItem('pendingChatMeta', JSON.stringify({
            listingId,
            buyerId: user.email,
            sellerId: sellerEmail,
            listingTitle: listing.title,
            listingImage: listing.images?.[0] || '',
            lastPrice: typeof listing.price === 'number' ? listing.price : null
          }));
        } catch {}
        console.debug('[ContactSeller] creating chat with payload', payload);
        const newChat = await base44.entities.Chat.create(payload);
        chatId = newChat?.id || newChat?.data?.id || newChat?.inserted_id;
        console.debug('[ContactSeller] new chat created', { chatId, newChat });
        // Fallback + robust wait loop: if ID missing, poll until record is visible
        if (!chatId) {
          for (let i = 0; i < 12 && !chatId; i++) { // ~12 * 300ms = 3.6s max
            try {
              // Retry by buyer only; seller may vary in legacy data
              const retry = await base44.entities.Chat.filter({ listingId: listingId, buyerId: buyerEmail }, '-updated_date').catch(() => []);
              chatId = retry?.[0]?.id || null;
              if (chatId) {
                console.debug('[ContactSeller] fallback found chat id', { chatId, try: i + 1 });
                break;
              }
            } catch (e) {
              console.warn('[ContactSeller] fallback fetch failed (try loop)', e);
            }
            await new Promise(r => setTimeout(r, 300));
          }
        }

        // Verify persistence by id (best-effort)
        if (chatId) {
          try {
            const verify = await base44.entities.Chat.filter({ id: chatId });
            console.debug('[ContactSeller] persisted chat', verify?.[0]);
            if (verify && verify[0]) {
              const ch = verify[0];
              console.debug('[ContactSeller] persisted fields', { listingId: ch.listingId, buyerId: ch.buyerId, sellerId: ch.sellerId });
            }
          } catch {}
        }

        // Begrüßungs‑Systemnachricht (non bloccante)
        try {
          await base44.entities.ChatMessage.create({
            chatId: chatId,
            senderId: 'system',
            text: `💬 Chat gestartet für "${listing.title}" – Preis: ${listing.price}€`,
            messageType: 'system'
          });
        } catch (e) {
          console.warn('[ContactSeller] welcome message failed', e);
        }
      }

      // Direkt zur Chat-Seite mit chatId navigieren (mit Fallback)
      if (!chatId) {
        console.error('[ContactSeller] missing chatId after creation, aborting navigation');
        toast.error('Impossibile aprire la chat, riprova.');
        navigate(createPageUrl('Messages'));
        return;
      }
      try { 
        localStorage.setItem('pendingChatId', chatId); 
        localStorage.removeItem('pendingChatMeta');
      } catch {}
      let targetUrl = createPageUrl('Messages') + `?chatId=${encodeURIComponent(chatId)}`;
      if (opts.openOffer) { targetUrl += '&open=offer'; }
      console.debug('[ContactSeller] redirecting to', targetUrl);
      navigate(targetUrl);
      // Fallback: falls der Router die Query verliert, erzwinge Navigation
      const ensureNav = () => {
        const present = new URLSearchParams(window.location.search).get('chatId');
        if (!present) {
          console.warn('[ContactSeller] router lost chatId, forcing location.assign', { targetUrl });
          window.location.assign(targetUrl);
        } else {
          console.debug('[ContactSeller] router confirmed chatId in URL', { chatId: present });
        }
      };
      setTimeout(ensureNav, 150);
      setTimeout(ensureNav, 400);
    } catch (error) {
      console.error('[ContactSeller] Error creating/getting chat:', error);
      toast.error('Fehler beim Starten des Chats');
    } finally {
      setIsContactingLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    // Reuse chat creation/navigation
    await handleContactSeller();
  };

   // Track user activity for AI recommendations
  useEffect(() => {
    if (user && listing && !activityTracked) {
      base44.entities.UserActivity.create({
        userId: user.email,
        activityType: 'view',
        listingId: listing.id,
        category: listing.category,
        city: listing.city,
        priceRange: listing.price < 50 ? '0-50' : listing.price < 200 ? '50-200' : '200+',
        source: urlParams.get('source') || 'direct'
      });
      setActivityTracked(true);
    }
  }, [user, listing, activityTracked]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('listingNotFound')}</h2>
          <Link to={createPageUrl('Marketplace')}>
            <Button>{t('backToMarketplace')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = !!user && listing.created_by === user.email;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // Premium trigger context for this listing (owner only)
  const premiumContextProvider = (l) => {
    const ageHours = Math.max(0, (Date.now() - new Date(l.created_date).getTime()) / 36e5);
    const hoursToExpiry = l.expiresAt ? (new Date(l.expiresAt).getTime() - Date.now()) / 36e5 : null;
    const viewsCount = l.viewsCount || l.views || 0;
    // messagesCount is not directly on listing; use Chat counters if available via listing cache (fallback 0)
    const messagesCount = l.messagesCount || 0;
    // immediate triggers managed via props from page logic (e.g., justPublished/firstMessageJustArrived) not set here
    return { ageHours, hoursToExpiry, viewsCount, messagesCount };
  };

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <SEOHead 
        title={listing.seo_title || `${listing.title} - ${listing.price}€ | Zazarap.de`}
        description={listing.seo_description || listing.description}
        image={listing.images?.[0]}
        keywords={listing.seo_keywords}
        type="product"
      />
      <StructuredData 
        type="product" 
        data={{ 
          listing, 
          rating: avgRating, 
          reviewCount: reviews.length 
        }} 
      />
      {/* Owner-only premium prompt manager (single listing) */}
      {isOwner && listing.status === 'active' && (
        <PremiumPromptManager listings={[listing]} contextProvider={premiumContextProvider} />
      )}

      {listing.images && listing.images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {listing.images.map((img, idx) => {
            const full = variantUrl(img, 'full');
            const thumb = variantUrl(img, 'thumb');
            return (
              <button
                type="button"
                key={idx}
                onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                className="relative group rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-indigo-600"
                aria-label={`Apri immagine ${idx + 1}`}
              >
                <img
                  src={full}
                  srcSet={`${thumb} 320w, ${img} 800w, ${full} 1600w`}
                  sizes="(max-width: 640px) 100vw, 800px"
                  alt={`${listing.title} ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-40 sm:h-48 object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10" />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap mb-2">
        <div className="zaza-detail-category">{t(listing.category)}</div>
        {listing.status === 'sold' && (
          <Badge className="bg-red-600 text-white text-sm px-3 py-1">
            ✓ Verkauft
          </Badge>
        )}
        {listing.status === 'archived' && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Archiviert
          </Badge>
        )}
      </div>
      <h2 className="zaza-detail-title">{cleanTitle(listing.title)}</h2>
      {listing.offerPrice ? (
        <div className="zaza-detail-price">
          <span className="text-green-600 font-bold mr-2">{listing.offerPrice} €</span>
          <span className="line-through text-slate-400 text-base">{listing.price} €</span>
        </div>
      ) : (
        <div className="zaza-detail-price">{listing.price} €</div>
      )}
      {listing.expiresAt && (new Date(listing.expiresAt) > new Date()) && (
        <div className="text-sm text-red-600 mt-1">
          Scade il {format(new Date(listing.expiresAt), 'dd/MM/yyyy HH:mm')}
        </div>
      )}
      {listing.city && <div className="zaza-detail-location">{listing.city}</div>}

      <div className="flex items-center gap-4 mb-4">
        {user && (
          <button
            onClick={() => toggleLikeMutation.mutate()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-600 ${
              isLiked 
                ? 'bg-red-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label={`Like listing, ${likesCount} likes`}
            aria-pressed={isLiked}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
            <span>{likesCount}</span>
          </button>
        )}
        {!user && likesCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
            <ThumbsUp className="h-4 w-4 text-slate-600" />
            <span className="font-medium text-slate-700">{likesCount}</span>
          </div>
        )}
      </div>


      <div className="zaza-detail-description">{listing.description}</div>

      <div className="mb-6 space-y-3">
        {isOwner ? (
          <>
            <Link to={createPageUrl('EditListing') + '?id=' + listingId}>
              <button className="zaza-contact-btn">{t('editListing')}</button>
            </Link>
            {listing.status === 'active' && (
              <button
                onClick={() => markAsSoldMutation.mutate()}
                disabled={markAsSoldMutation.isPending}
                className="w-full p-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {markAsSoldMutation.isPending ? 'Wird markiert...' : '✓ Als verkauft markieren'}
              </button>
            )}
            {!listing.featured && listing.status === 'active' && (
              <Link to={createPageUrl('PromoteListing') + '?id=' + listingId}>
                <button className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg">
                  ⭐ {t('promote')}
                </button>
              </Link>
            )}
          </>
        ) : (
          <>
            {['active','reserved'].includes(listing.status) ? (
              <>
                <button 
                  onClick={user ? () => handleContactSeller() : () => base44.auth.redirectToLogin(createPageUrl('ListingDetail') + `?id=${listingId}`)}
                  disabled={isContactingLoading}
                  className="zaza-contact-btn flex items-center justify-center gap-2"
                >
                  {isContactingLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="inline h-4 w-4" />
                  )}
                  {isContactingLoading ? 'Avvio chat...' : t('contactSeller')}
                </button>
              </>
            ) : null}

            {user && (
              <>
                <button
                  onClick={() => toggleFavoriteMutation.mutate()}
                  className="w-full mt-3 p-3 border-2 border-[#e84c00] text-[#e84c00] rounded-lg font-bold focus:ring-2 focus:ring-[#e84c00]"
                  aria-pressed={isFavorite}
                >
                  <Heart className={`inline h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                  {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                </button>
              </>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="mt-2 text-sm text-slate-500 hover:text-red-600 underline inline-flex items-center"
            >
              <Flag className="h-3 w-3 mr-1" aria-hidden="true" />
              {t('report.listing') || 'Segnala annuncio'}
            </button>
          </>
        )}
      </div>

      <ReportListingModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        listingId={listingId}
        listingTitle={listing.title}
        sellerEmail={listing.created_by}
        user={user}
      />

      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold">{avgRating}</span>
          <span className="text-slate-600">({reviews.length} {t('reviews')})</span>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">{t('reviews')}</h3>
          
          {user && (
                <div className="mb-6 p-4 bg-slate-50 rounded">
              <div className="flex items-center gap-2 mb-3">
                <label className="font-medium">{t('rating')}:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-3 py-1 border rounded"
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n} {t('stars')}</option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder=""
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mb-3"
              />
              <Button onClick={handleAddReview} disabled={!reviewComment.trim()}>
                {t('addReview')}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-1">{review.reviewer_email}</p>
                <p className="text-slate-700">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-slate-500">{t('noReviews')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={listing.images || []}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        title={listing.title}
      />

      <SimilarProducts listingId={listingId} />

 
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-indigo-600 hover:underline mt-6 focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded px-2 py-1"
        aria-label="Zurück zur vorherigen Seite"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </button>
      </div>
      );
      }