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
import { useLanguage } from '../components/LanguageProvider';
import SocialShareButtons from '../components/SocialShareButtons';
import FollowButton from '../components/profile/FollowButton';
import SimilarProducts from '../components/marketplace/SimilarProducts';


export default function ListingDetail() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [activityTracked, setActivityTracked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isContactingLoading, setIsContactingLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: () => base44.entities.Review.filter({ listing_id: listingId }),
    enabled: !!listingId
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes', listingId],
    queryFn: () => base44.entities.ListingLike.filter({ listing_id: listingId }),
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

  const handleContactSeller = async () => {
    if (!listing) return;
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl('ListingDetail') + `?id=${listingId}`);
      return;
    }
    
    setIsContactingLoading(true);
    try {
      // Check if chat already exists
      const existingChats = await base44.entities.Chat.filter({
        listingId: listingId,
        buyerId: user.email
      });

      let chatId;
      
      if (existingChats.length > 0) {
        // Chat exists, use it
        chatId = existingChats[0].id;
      } else {
        // Create new chat
        const newChat = await base44.entities.Chat.create({
          listingId: listingId,
          buyerId: user.email,
          sellerId: listing.created_by,
          status: 'in_attesa',
          lastMessage: '',
          listingTitle: listing.title,
          listingImage: listing.images?.[0] || '',
          updatedAt: new Date().toISOString(),
          unreadBuyer: 0,
          unreadSeller: 0
        });
        chatId = newChat.id;
        
        // Send welcome system message
        await base44.entities.ChatMessage.create({
          chatId: chatId,
          senderId: 'system',
          text: `💬 Chat avviata per "${listing.title}" - Prezzo: ${listing.price}€`,
          messageType: 'system'
        });
      }

      // Navigate to Messages with chatId
      navigate(createPageUrl('Messages') + '?chatId=' + chatId);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Errore nell\'avvio della chat');
    } finally {
      setIsContactingLoading(false);
    }
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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

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
      {listing.images && listing.images.length > 0 && (
        <div className="mb-4">
          {listing.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${listing.title} ${idx + 1}`} 
              className="zaza-detail-img"
            />
          ))}
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
      <h2 className="zaza-detail-title">{listing.title}</h2>
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

      <div className="mb-6">
        <SocialShareButtons 
          url={window.location.href}
          title={listing.title}
          description={listing.description}
        />
      </div>

      <div className="zaza-detail-description">{listing.description}</div>

      {user && (
        <div className="mb-6 space-y-3">
          {listing.created_by === user.email ? (
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
              <button 
                onClick={handleContactSeller}
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
              <button
                onClick={() => toggleFavoriteMutation.mutate()}
                className="w-full mt-3 p-3 border-2 border-[#e84c00] text-[#e84c00] rounded-lg font-bold focus:ring-2 focus:ring-[#e84c00]"
                aria-pressed={isFavorite}
              >
                <Heart className={`inline h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              </button>
              {user && user.email !== listing.created_by && (
                <FollowButton
                  targetType="user"
                  targetId={listing.created_by}
                  className="w-full mt-3"
                  labelFollow="Segui venditore"
                  labelUnfollow="Smetti di seguire"
                />
              )}
              <FollowButton
                targetType="category"
                targetId={listing.category}
                className="w-full mt-3"
                labelFollow="Segui categoria"
                labelUnfollow="Non seguire più"
              />
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full mt-3 p-3 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-bold focus:ring-2 focus:ring-red-500"
              >
                <Flag className="inline h-4 w-4 mr-2" aria-hidden="true" />
                {t('report.listing') || 'Segnala annuncio'}
              </button>
            </>
          )}
        </div>
      )}

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