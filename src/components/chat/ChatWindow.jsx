import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Image, Smile, MoreVertical, Phone, Video, 
  Check, CheckCheck, ArrowLeft, Zap, Languages,
  AlertTriangle, X, Circle, DollarSign, History, Star, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageProvider';
import { createPageUrl } from '@/utils';
import OfferModal from './OfferModal';
import OfferHistory from './OfferHistory';
import ReviewForm from '../reviews/ReviewForm';

const chatTranslations = {
  de: {
    today: 'Heute',
    yesterday: 'Gestern',
    typeMessage: 'Nachricht eingeben...',
    translate: 'Übersetzen',
    original: 'Original',
    buyer: 'Käufer',
    seller: 'Verkäufer',
    lastOffer: 'Letztes Angebot',
    offer: 'Angebot',
    counterOffer: 'Gegenangebot',
    accept: 'Akzeptieren',
    reject: 'Ablehnen',
    offerAccepted: 'Angebot angenommen',
    offerRejected: 'Angebot abgelehnt',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: 'Das Angebot wurde angenommen.',
    makeNewOffer: 'Neues Angebot machen',
    leaveReview: 'Bewertung abgeben',
    reviewPrompt: 'Ihre Meinung ist wichtig! Bewerten Sie',
    reviewLeft: 'Sie haben bereits eine Bewertung für diese Transaktion abgegeben',
    image: 'Bild'
  },
  en: {
    today: 'Today',
    yesterday: 'Yesterday',
    typeMessage: 'Type a message...',
    translate: 'Translate',
    original: 'Original',
    buyer: 'Buyer',
    seller: 'Seller',
    lastOffer: 'Last offer',
    offer: 'Offer',
    counterOffer: 'Counter offer',
    accept: 'Accept',
    reject: 'Reject',
    offerAccepted: 'Offer accepted',
    offerRejected: 'Offer rejected',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: 'The offer has been accepted.',
    makeNewOffer: 'Make a new offer',
    leaveReview: 'Leave a review',
    reviewPrompt: 'Your opinion matters! Rate',
    reviewLeft: 'You have already left a review for this transaction',
    image: 'Image'
  },
  it: {
    today: 'Oggi',
    yesterday: 'Ieri',
    typeMessage: 'Scrivi un messaggio...',
    translate: 'Traduci',
    original: 'Originale',
    buyer: 'Acquirente',
    seller: 'Venditore',
    lastOffer: 'Ultima offerta',
    offer: 'Offerta',
    counterOffer: 'Controproposta',
    accept: 'Accetta',
    reject: 'Rifiuta',
    offerAccepted: 'Offerta accettata',
    offerRejected: 'Offerta rifiutata',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: "Offerta accettata.",
    makeNewOffer: 'Fai una nuova offerta',
    leaveReview: 'Lascia una recensione',
    reviewPrompt: 'La tua opinione è importante! Valuta',
    reviewLeft: 'Hai già lasciato una recensione per questa transazione',
    image: 'Immagine'
  },
  tr: {
    today: 'Bugün',
    yesterday: 'Dün',
    typeMessage: 'Bir mesaj yazın...',
    translate: 'Çevir',
    original: 'Orijinal',
    buyer: 'Alıcı',
    seller: 'Satıcı',
    lastOffer: 'Son teklif',
    offer: 'Teklif',
    counterOffer: 'Karşı teklif',
    accept: 'Kabul et',
    reject: 'Reddet',
    offerAccepted: 'Teklif kabul edildi',
    offerRejected: 'Teklif reddedildi',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: 'Teklif kabul edildi.',
    makeNewOffer: 'Yeni teklif ver',
    leaveReview: 'Değerlendirme bırak',
    reviewPrompt: 'Görüşünüz önemli! Değerlendirin',
    reviewLeft: 'Bu işlem için zaten bir değerlendirme bıraktınız',
    image: 'Resim'
  },
  uk: {
    today: 'Сьогодні',
    yesterday: 'Вчора',
    typeMessage: 'Введіть повідомлення...',
    translate: 'Перекласти',
    original: 'Оригінал',
    buyer: 'Покупець',
    seller: 'Продавець',
    lastOffer: 'Остання пропозиція',
    offer: 'Пропозиція',
    counterOffer: 'Контрпропозиція',
    accept: 'Прийняти',
    reject: 'Відхилити',
    offerAccepted: 'Пропозицію прийнято',
    offerRejected: 'Пропозицію відхилено',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: 'Пропозицію прийнято.',
    makeNewOffer: 'Зробити нову пропозицію',
    leaveReview: 'Залишити відгук',
    reviewPrompt: 'Ваша думка важлива! Оцініть',
    reviewLeft: 'Ви вже залишили відгук для цієї транзакції',
    image: 'Зображення'
  },
  fr: {
    today: "Aujourd'hui",
    yesterday: 'Hier',
    typeMessage: 'Tapez un message...',
    translate: 'Traduire',
    original: 'Original',
    buyer: 'Acheteur',
    seller: 'Vendeur',
    lastOffer: 'Dernière offre',
    offer: 'Offre',
    counterOffer: 'Contre-offre',
    accept: 'Accepter',
    reject: 'Refuser',
    offerAccepted: 'Offre acceptée',
    offerRejected: 'Offre refusée',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: "Offre acceptée.",
    makeNewOffer: 'Faire une nouvelle offre',
    leaveReview: 'Laisser un avis',
    reviewPrompt: 'Votre avis compte ! Évaluez',
    reviewLeft: 'Vous avez déjà laissé un avis pour cette transaction',
    image: 'Image'
  },
  pl: {
    today: 'Dzisiaj',
    yesterday: 'Wczoraj',
    typeMessage: 'Wpisz wiadomość...',
    translate: 'Przetłumacz',
    original: 'Oryginał',
    buyer: 'Kupujący',
    seller: 'Sprzedający',
    lastOffer: 'Ostatnia oferta',
    offer: 'Oferta',
    counterOffer: 'Kontroferta',
    accept: 'Akceptuj',
    reject: 'Odrzuć',
    offerAccepted: 'Oferta zaakceptowana',
    offerRejected: 'Oferta odrzucona',
    /* payNow removed per business model (no payments handled) */
    offerAcceptedDesc: 'Oferta została zaakceptowana.',
    makeNewOffer: 'Złóż nową ofertę',
    leaveReview: 'Zostaw opinię',
    reviewPrompt: 'Twoja opinia jest ważna! Oceń',
    reviewLeft: 'Już zostawiłeś opinię dla tej transakcji',
    image: 'Obraz'
  }
};

const statusColors = {
  'in_attesa': 'bg-yellow-500',
  'accettata': 'bg-green-500',
  'rifiutata': 'bg-red-500',
  'completata': 'bg-blue-500'
};

const statusLabels = {
  it: {
    in_attesa: 'In attesa',
    accettata: 'Accettata',
    rifiutata: 'Rifiutata',
    completata: 'Completata',
  },
  de: {
    in_attesa: 'Ausstehend',
    accettata: 'Angenommen',
    rifiutata: 'Abgelehnt',
    completata: 'Abgeschlossen',
  },
  en: {
    in_attesa: 'Pending',
    accettata: 'Accepted',
    rifiutata: 'Rejected',
    completata: 'Completed',
  }
};

// Ring highlight per l'offerta attiva (lastOffer) in base allo stato
const offerRingClasses = {
  pending: 'ring-2 ring-green-500',
  accepted_reserved: 'ring-2 ring-green-600',
  rejected: 'ring-2 ring-red-500',
  countered: 'ring-2 ring-amber-500',
  withdrawn: 'ring-2 ring-slate-400',
  expired: 'ring-2 ring-amber-400'
};

const CHAT_WINDOW_BUILD_ID = 'chatwindow-2026-04-05T00:00:00Z';

function formatMessageDate(dateStr, lang = 'de') {
  const date = new Date(dateStr);
  const ct = chatTranslations[lang] || chatTranslations.de;
  if (isToday(date)) return ct.today;
  if (isYesterday(date)) return ct.yesterday;
  return format(date, 'dd MMMM yyyy');
}

export default function ChatWindow({ 
  chat, 
  messages, 
  user, 
  listing,
  onBack,
  onOpenPayment,
  onReport,
  initialOpenOffer = false,
  autoFocusComposer = false
}) {
  const { language } = useLanguage();
  const ct = chatTranslations[language] || chatTranslations.de;
  const [messageText, setMessageText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showOfferHistory, setShowOfferHistory] = useState(false);
  const [isCounterOffer, setIsCounterOffer] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [translatingId, setTranslatingId] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [botSuggestions, setBotSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const queryClient = useQueryClient();

  const meIds = React.useMemo(() => [user?.id, user?.email].filter(Boolean), [user?.id, user?.email]);
  const normalizeEmail = (v) => (typeof v === 'string' && v.includes('@') ? v.trim().toLowerCase() : v);
  const role = React.useMemo(() => {
    if (!chat) return 'unknown';
    const seller = chat?.sellerId;
    const buyer = chat?.buyerId;
    // Prefer exact id match
    if (seller && seller === user?.id) return 'seller';
    if (buyer && buyer === user?.id) return 'buyer';
    // Fallback to normalized email match
    const meEmail = normalizeEmail(user?.email);
    if (meEmail) {
      const sellerEmail = normalizeEmail(seller);
      const buyerEmail = normalizeEmail(buyer);
      if (sellerEmail && sellerEmail === meEmail) return 'seller';
      if (buyerEmail && buyerEmail === meEmail) return 'buyer';
    }
    return 'unknown';
  }, [chat?.sellerId, chat?.buyerId, user?.id, user?.email]);
  const isSeller = role === 'seller';
  const isBuyer = role === 'buyer';
  const otherUser = React.useMemo(() => (isSeller ? chat?.buyerId : chat?.sellerId), [isSeller, chat?.buyerId, chat?.sellerId]);
  // Debug flag via URL (?debug=1 or ?debugParticipants=1)
  const debugParticipants = React.useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search || '');
      return p.get('debug') === '1' || p.get('debugParticipants') === '1';
    } catch { return false; }
  }, []);

  // Log key ids when debugging (deferred to avoid TDZ on lastOffer)
  useEffect(() => {
    if (!debugParticipants) return;
    const timer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('[Chat Debug]', {
        chatId: chat?.id,
        buyerId: chat?.buyerId,
        sellerId: chat?.sellerId,
        currentUserId: user?.id,
        currentUserEmail: user?.email,
        role,
        lastOfferId: lastOffer?.id,
        lastOfferReceiverId: lastOffer?.receiverId,
      });
    }, 0);
    return () => clearTimeout(timer);
  // Do NOT add lastOffer to deps — would reintroduce TDZ at render time
  }, [debugParticipants, chat?.id, chat?.buyerId, chat?.sellerId, user?.id, user?.email, role]);
  
  // Always act on behalf of real participants (buyer/seller), never admin
  const senderEmail = isSeller ? chat?.sellerId : isBuyer ? chat?.buyerId : chat?.buyerId; // admin fallback: act as buyer
  const receiverEmail = isSeller ? chat?.buyerId : isBuyer ? chat?.sellerId : chat?.sellerId; // admin fallback: other participant
  
  const isRecipient = (offer) => {
    if (!offer) return false;
    // Direct match (includes both id and raw email in meIds)
    if (offer.receiverId && meIds.includes(offer.receiverId)) return true;
    // Also consider normalized email equality
    const myEmailNorm = normalizeEmail(user?.email);
    if (offer.receiverId && myEmailNorm && offer.receiverId === myEmailNorm) return true;
    // Failsafe: if receiverId is wrong, let the opposite participant of the sender act
    const senderNorm = normalizeEmail(offer.senderId) || offer.senderId;
    const sellerNorm = normalizeEmail(chat?.sellerId) || chat?.sellerId;
    const buyerNorm = normalizeEmail(chat?.buyerId) || chat?.buyerId;
    const senderIsSeller = senderNorm && sellerNorm && senderNorm === sellerNorm;
    const senderIsBuyer = senderNorm && buyerNorm && senderNorm === buyerNorm;
    if ((senderIsSeller && isBuyer) || (senderIsBuyer && isSeller)) return true;
    return false;
  };

  // Auto-open Offer modal when requested via URL (only for buyer)
  useEffect(() => {
    if (initialOpenOffer && isBuyer) {
      setIsCounterOffer(false);
      setShowOfferModal(true);
    }
  }, [initialOpenOffer, isBuyer]);

  // Focus composer when requested
  useEffect(() => {
    if (autoFocusComposer) {
      try { messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight }); } catch {}
      setTimeout(() => messageInputRef.current?.focus(), 100);
    }
  }, [autoFocusComposer]);

  const goBack = useCallback(() => {
    const targetId = listing?.id || chat?.listingId;
    if (targetId) {
      // Use router-style URL used by ListingDetail
      window.location.href = createPageUrl('ListingDetail') + `?id=${targetId}`;
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = createPageUrl('Marketplace');
    }
  }, [listing?.id, chat?.listingId]);

  // Translate message function
  const handleTranslateMessage = async (msgId, text) => {
    if (translatedMessages[msgId]) {
      // Toggle back to original
      setTranslatedMessages(prev => {
        const copy = { ...prev };
        delete copy[msgId];
        return copy;
      });
      return;
    }

    setTranslatingId(msgId);
    try {
      const targetLang = language === 'de' ? 'German' : language === 'en' ? 'English' : language === 'it' ? 'Italian' : language === 'tr' ? 'Turkish' : language === 'uk' ? 'Ukrainian' : language === 'fr' ? 'French' : language === 'pl' ? 'Polish' : 'German';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to ${targetLang}. Only return the translation, nothing else:\n\n${text}`,
      });
      
      setTranslatedMessages(prev => ({
        ...prev,
        [msgId]: result
      }));
    } catch (err) {
      toast.error('Übersetzung fehlgeschlagen');
    } finally {
      setTranslatingId(null);
    }
  };

  // Fetch offers for this chat
  const { data: offers = [], isLoading: isLoadingOffers } = useQuery({
      queryKey: ['offers', chat?.id],
      queryFn: () => base44.entities.Offer.filter({ chatId: chat.id }, '-created_date'),
      enabled: !!chat?.id,
  });
  const offersForChat = React.useMemo(() => (offers || []).filter(o => o.chatId === chat?.id), [offers, chat?.id]);

  // Real-time: keep offers fresh so the receiver sees counteroffers immediately
  useEffect(() => {
    if (!chat?.id) return;
    const unsubscribe = base44.entities.Offer.subscribe((event) => {
      if (event?.data?.chatId === chat.id) {
        queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      }
    });
    return unsubscribe;
  }, [chat?.id, queryClient]);

  // AI assistant suggestions ("Hunger Bot")
  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const langName = language === 'de' ? 'German' : language === 'en' ? 'English' : language === 'it' ? 'Italian' : language === 'tr' ? 'Turkish' : language === 'uk' ? 'Ukrainian' : language === 'fr' ? 'French' : language === 'pl' ? 'Polish' : 'English';
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful assistant for a buyer-seller chat about "${listing?.title || chat?.listingTitle || 'the item'}". Role: ${isSeller ? 'seller' : 'buyer'}. Generate 3 short, friendly reply suggestions in ${langName} (max 90 chars each). Return JSON matching the schema.`,
        response_json_schema: {
          type: 'object',
          properties: { suggestions: { type: 'array', items: { type: 'string' } } }
        }
      });
      setBotSuggestions((res?.suggestions || []).slice(0,3));
    } catch (e) {
      toast.error('Suggerimenti non disponibili');
    } finally {
      setIsSuggesting(false);
    }
  };

  const lastOffer = React.useMemo(() => {
    if (!offersForChat || offersForChat.length === 0) return null;
    return [...offersForChat]
      .sort((a,b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))[0];
  }, [offersForChat]);
  const hasActiveReservation = listing?.status === 'reserved' && (offersForChat || []).some(o => o.status === 'accepted_reserved');
  const derivedChatStatus = React.useMemo(() => {
    if (!lastOffer) return chat?.status;
    if (lastOffer.chatId && lastOffer.chatId !== chat?.id) return chat?.status; // hard guard
    switch (lastOffer.status) {
      case 'pending': return 'in_attesa';
      case 'accepted_reserved': return 'accettata';
      case 'rejected': return 'rifiutata';
      case 'countered': return 'in_attesa';
      case 'withdrawn': return 'rifiutata';
      case 'expired': return 'rifiutata';
      default: return chat?.status;
    }
  }, [lastOffer, chat?.status]);
  const displayPrice = (listing && typeof listing.price === 'number') ? listing.price : (typeof chat?.lastPrice === 'number' ? chat.lastPrice : null);

  // Listing availability helpers
  const expiresAt = listing?.expiresAt ? new Date(listing.expiresAt) : null;
  const isExpired = !!(expiresAt && expiresAt < new Date());
  const isListingUnavailable = !!(
   (listing?.status && ['sold', 'archived', 'expired'].includes(listing.status)) || isExpired
  );

  // Check if user already left a review for this chat
  const { data: existingReviews = [] } = useQuery({
    queryKey: ['chatReviews', chat?.id, user?.email],
    queryFn: () => base44.entities.UserRating.filter({ chatId: chat.id, raterEmail: user.email }),
    enabled: !!chat?.id && !!user?.email,
  });

  const hasLeftReview = existingReviews.length > 0;

  // Typing indicator logic
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      // Store typing status (could be expanded to use a real-time service)
      localStorage.setItem(`typing_${chat?.id}_${user?.email}`, Date.now().toString());
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      localStorage.removeItem(`typing_${chat?.id}_${user?.email}`);
    }, 2000);
  }, [chat?.id, user?.email, isTyping]);

  // Check if other user is typing
  useEffect(() => {
    if (!chat || !otherUser) return;
    
    const checkTyping = () => {
      const typingTimestamp = localStorage.getItem(`typing_${chat.id}_${otherUser}`);
      if (typingTimestamp) {
        const elapsed = Date.now() - parseInt(typingTimestamp);
        setOtherUserTyping(elapsed < 3000);
      } else {
        setOtherUserTyping(false);
      }
    };
    
    const interval = setInterval(checkTyping, 1000);
    return () => clearInterval(interval);
  }, [chat, otherUser]);

  // Scroll messages panel to bottom on new messages (avoid global scroll jump)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read (ChatMessage.update is admin-only by RLS)
  useEffect(() => {
    if (chat && messages.length > 0) {
      const unreadMessages = messages.filter(m => !m.read && !meIds.includes(m.senderId));
      if (user?.role === 'admin') {
        unreadMessages.forEach(async (msg) => {
          await base44.entities.ChatMessage.update(msg.id, { read: true });
        });
      }
      
      // Always zero the chat-side counter (allowed for buyer/seller)
      const updateField = isSeller ? 'unreadSeller' : 'unreadBuyer';
      if (chat[updateField] > 0) {
        base44.entities.Chat.update(chat.id, { [updateField]: 0 });
      }
    }
  }, [chat, messages, user?.role, isSeller]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, imageUrl, price, messageType = 'text' }) => {
      const messageRes = await base44.functions.invoke('createChatMessage', {
       chatId: chat.id,
       text: text || '',
       imageUrl,
       price,
       messageType
      });
      const message = messageRes.data;

      // Update chat
      const unreadField = isSeller ? 'unreadBuyer' : 'unreadSeller';
      await base44.entities.Chat.update(chat.id, {
        lastMessage: imageUrl ? '📷 Immagine' : text?.substring(0, 50) || '',
        lastPrice: price || chat.lastPrice,
        updatedAt: new Date().toISOString(),
        [unreadField]: (chat[unreadField] || 0) + 1
      });

      // Send notification via backend (service role)
      await base44.functions.invoke('sendNotification', {
        userId: otherUser,
        type: 'message',
        title: '💬 Neue Nachricht',
        message: `${(listing?.title || chat?.listingTitle || 'Chat')}: ${text?.substring(0, 50) || (imageUrl ? 'Bild' : 'Nachricht')}`,
        actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
        metadata: { chatId: chat.id, listingId: chat.listingId, subtype: 'message' }
      });

      // AI moderation (non-blocking)
      try {
        if (text && text.trim().length > 0) {
          const moderation = await base44.integrations.Core.InvokeLLM({
            prompt: `Sei un moderatore AI per una chat di marketplace. Classifica il seguente messaggio come appropriato o da segnalare. Restituisci JSON con: flagged (boolean), labels (array di stringhe come spam, harassment, scam, hate, sexual, violence, self-harm), severity (low|medium|high), rationale (breve spiegazione).\n\nMessaggio:\n"${text}"`,
            response_json_schema: {
              type: 'object',
              properties: {
                flagged: { type: 'boolean' },
                labels: { type: 'array', items: { type: 'string' } },
                severity: { type: 'string' },
                rationale: { type: 'string' }
              }
            }
          });

          if (moderation?.flagged) {
            const labels = (moderation.labels || []).map(l => String(l).toLowerCase());
            const reason = labels.some(l => l.includes('spam')) ? 'spam'
              : labels.some(l => l.includes('harass')) ? 'harassment'
              : labels.some(l => l.includes('scam') || l.includes('fraud') || l.includes('phishing')) ? 'scam'
              : labels.some(l => l.includes('sexual') || l.includes('hate') || l.includes('violence') || l.includes('inappropriate')) ? 'inappropriate'
              : 'other';

            await base44.entities.ChatMessage.update(message.id, {
              flagged: true,
              moderationLabels: moderation.labels || [],
              moderationSeverity: moderation.severity || 'medium'
            });

            // Create admin report for review
            await base44.entities.Report.create({
              reporterId: user.email,
              reportedUserId: user.email,
              chatId: chat.id,
              messageId: message.id,
              reason,
              description: `[AI] ${moderation.rationale || 'Contenuto potenzialmente problematico'}`
            });

            // Email admin for review
            await base44.integrations.Core.SendEmail({
              to: 'info@zazarap.com',
              subject: `AI Moderation - Messaggio segnalato | Chat ${chat.id}`,
              body: `Un messaggio è stato segnalato dalla moderazione AI.\n\nChat ID: ${chat.id}\nMessaggio ID: ${message.id}\nMittente: ${user.email}\nAnnuncio: ${listing?.title || ''}\nEtichette: ${(moderation.labels || []).join(', ')}\nSeverità: ${moderation.severity || 'n/d'}\n\nTesto:\n${text}`
            });
          }
        }
      } catch (err) {
        console.error('Moderation error:', err);
      }

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessageText('');
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast.error('Invio non riuscito, riprova');
    }
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate({ text: messageText });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo immagini sono permesse');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Immagine troppo grande (max 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMessageMutation.mutate({ 
        text: '', 
        imageUrl: file_url, 
        messageType: 'image' 
      });
      toast.success('Immagine inviata');
    } catch (error) {
      toast.error('Errore upload immagine');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAcceptOffer = (offerId) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !meIds.includes(offer.receiverId)) {
      toast.error('Solo il destinatario può accettare');
      return;
    }
    acceptOfferMutation.mutate(offerId);
  };
  
  const handleRejectOffer = (offerId) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !meIds.includes(offer.receiverId)) {
      toast.error('Solo il destinatario può rifiutare');
      return;
    }
    rejectOfferMutation.mutate(offerId);
  };

  const handleCounterOffer = (offerToCounter) => {
    if (!offerToCounter || !meIds.includes(offerToCounter.receiverId)) {
      toast.error('Solo il destinatario può fare una controproposta');
      return;
    }
    setIsCounterOffer(true);
    setShowOfferModal(true);
  };

  const handleMakeOffer = () => {
    if (isSeller) {
      toast.error('Nur Käufer können initiale Angebote senden');
      return;
    }
    setIsCounterOffer(false);
    setShowOfferModal(true);
  };

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async ({ amount, message, type }) => {
      // Validation: Amount must be > 0
      if (amount <= 0) {
        throw new Error('Betrag muss größer als 0 sein');
      }

      // Validation: Amount must be <= listingPrice * MAX_OFFER_MULTIPLIER
      const MAX_OFFER_MULTIPLIER = 1.5; // Configurable
      if (typeof listing?.price === 'number' && listing.price > 0) {
        if (amount > listing.price * MAX_OFFER_MULTIPLIER) {
          throw new Error(`Betrag darf nicht mehr als ${MAX_OFFER_MULTIPLIER}x des Listenpreises (${listing.price}€) sein`);
        }
      }

      // Validation: Only buyer can make initial offers
      if (type === 'initial' && isSeller) {
        throw new Error('Nur Käufer können initiale Angebote senden');
      }


      // Update my previous pending offers to 'countered' (respect RLS)
      const pendingOffers = offers.filter(o => o.status === 'pending' && o.senderId === senderEmail);
      for (const offer of pendingOffers) {
        await base44.entities.Offer.update(offer.id, { status: 'countered' });
      }

      // Create new offer in DB
      const offer = await base44.entities.Offer.create({
        chatId: chat.id,
        listingId: chat.listingId,
        // Ensure correct participants: initial offer always buyer -> seller
        senderId: type === 'initial' ? (chat?.buyerId || senderEmail) : senderEmail,
        receiverId: type === 'initial' ? (chat?.sellerId || receiverEmail) : receiverEmail,
        amount,
        previousAmount: lastOffer?.amount || listing?.price,
        status: 'pending',
        type,
        message
      });

      // Create chat message of type 'offer' - include OFFER_ID for robust linking
      const offerText = message 
        ? `${type === 'counter' ? '🔄 Gegenangebot' : '💰 Angebot'}: ${amount}€\n"${message}"` 
        : `${type === 'counter' ? '🔄 Gegenangebot' : '💰 Angebot'}: ${amount}€`;
      
      const offerMessageRes = await base44.functions.invoke('createChatMessage', {
        chatId: chat.id,
        text: offerText + `\n[OFFER_ID:${offer.id}]`,
        price: amount,
        messageType: 'offer'
      });
      const offerMessage = offerMessageRes.data;



      // Update chat with new offer price and increment unread counter for receiver
      const unreadField = isSeller ? 'unreadBuyer' : 'unreadSeller';
      await base44.entities.Chat.update(chat.id, {
        lastPrice: amount,
        lastMessage: `💰 ${amount}€`,
        status: 'in_attesa',
        updatedAt: new Date().toISOString(),
        [unreadField]: (chat[unreadField] || 0) + 1
      });

      // Create notification for receiver (service role) — non-blocking
      try {
        await base44.functions.invoke('sendNotification', {
          userId: otherUser,
          type: 'offer', // aligned with Notification entity; function maps to prefs
          title: type === 'counter' ? '🔄 Neues Gegenangebot!' : '💰 Neues Angebot!',
          message: `${(senderEmail || user.email).split('@')[0]} hat ${type === 'counter' ? 'ein Gegenangebot' : 'ein Angebot'} von ${amount}€ für "${listing?.title || chat?.listingTitle}" gemacht`,
          actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
          metadata: { chatId: chat.id, offerId: offer.id, listingId: chat.listingId }
        });
      } catch (_) { /* ignore notification failures */ }

      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });
      setShowOfferModal(false);
      toast.success('Angebot gesendet!');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Senden des Angebots');
    }
  });

  // Accept offer mutation (Reserve)
  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      const offerToAccept = offers.find(o => o.id === offerId);
      if (!offerToAccept) {
        throw new Error('Offerta non trovata');
      }
      if (!meIds.includes(offerToAccept.receiverId)) {
        throw new Error('Solo il destinatario può accettare');
      }
      if (offerToAccept.status !== 'pending') {
        throw new Error('Angebot ist nicht mehr gültig');
      }

      // Check if listing is already reserved
      if (listing?.status === 'reserved') {
        throw new Error('Anzeige ist bereits reserviert');
      }

      // Update offer status to accepted_reserved
      await base44.entities.Offer.update(offerId, { status: 'accepted_reserved' });

      // Create system message
      await base44.functions.invoke('createChatMessage', {
        chatId: chat.id,
        text: `✅ Angebot von ${offerToAccept.amount}€ angenommen – Anzeige reserviert. Zahlung und Übergabe bitte direkt im Chat abstimmen.`,
        messageType: 'system'
      });

      // Update chat status
      await base44.entities.Chat.update(chat.id, {
        status: 'accettata',
        lastMessage: '✅ Angebot angenommen - Reserviert',
        lastPrice: offerToAccept.amount,
        updatedAt: new Date().toISOString()
      });

      // Set listing to reserved (only by listing owner)
      if (listing && listing.created_by === user.email) {
        await base44.entities.Listing.update(listing.id, { status: 'reserved' });
      }

      // Notify buyer via backend — non-blocking
      try {
        await base44.functions.invoke('sendNotification', {
          userId: offerToAccept.senderId,
          type: 'status_update',
          title: '✅ Angebot angenommen - Reserviert!',
          message: `Dein Angebot von ${offerToAccept.amount}€ für "${listing?.title || chat?.listingTitle}" wurde angenommen. Die Anzeige ist für dich reserviert. Bitte klärt Zahlung und Übergabe privat im Chat.`,
          actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
          metadata: { chatId: chat.id }
        });
      } catch (_) { /* ignore notification failures */ }

      return offerToAccept;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Angebot angenommen - Anzeige reserviert!');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Annehmen des Angebots');
    }
  });

  // Unreserve listing mutation
  const unreserveMutation = useMutation({
    mutationFn: async () => {
      if (!isSeller) {
        throw new Error('Nur der Verkäufer kann die Reservierung aufheben');
      }

      if (listing?.status !== 'reserved') {
        throw new Error('Anzeige ist nicht reserviert');
      }

      // Set listing back to active
      await base44.entities.Listing.update(listing.id, {
        status: 'active'
      });

      // Set all accepted_reserved offers to withdrawn
      const reservedOffers = offers.filter(o => o.status === 'accepted_reserved');
      for (const offer of reservedOffers) {
        await base44.entities.Offer.update(offer.id, { status: 'withdrawn' });
      }

      // Create system message
      await base44.functions.invoke('createChatMessage', {
        chatId: chat.id,
        text: '🔓 Reservierung wurde vom Verkäufer aufgehoben. Anzeige ist wieder verfügbar.',
        messageType: 'system'
      });

      // Notify buyer via backend — non-blocking
      try {
        await base44.functions.invoke('sendNotification', {
          userId: chat.buyerId,
          type: 'status_update',
          title: '🔓 Reservierung aufgehoben',
          message: `Die Reservierung für "${listing?.title || chat?.listingTitle}" wurde aufgehoben. Die Anzeige ist wieder verfügbar.`,
          actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
          metadata: { chatId: chat.id }
        });
      } catch (_) { /* ignore notification failures */ }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Reservierung aufgehoben');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Aufheben der Reservierung');
    }
  });

  // Mark as sold mutation
  const markAsSoldMutation = useMutation({
    mutationFn: async () => {
      if (!isSeller) {
        throw new Error('Nur der Verkäufer kann als verkauft markieren');
      }

      // Set listing to sold
      await base44.entities.Listing.update(listing.id, {
        status: 'sold'
      });

      // Create system message
      await base44.functions.invoke('createChatMessage', {
        chatId: chat.id,
        text: '✅ Anzeige wurde als verkauft markiert.',
        messageType: 'system'
      });

      // Update chat status
      await base44.entities.Chat.update(chat.id, {
        status: 'completata',
        lastMessage: '✅ Verkauft',
        updatedAt: new Date().toISOString()
      });

      // Notify buyer via backend — non-blocking
      try {
        await base44.functions.invoke('sendNotification', {
          userId: chat.buyerId,
          type: 'status_update',
          title: '✅ Verkauft',
          message: `"${listing?.title || chat?.listingTitle}" wurde als verkauft markiert.`,
          actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
          metadata: { chatId: chat.id }
        });
      } catch (_) { /* ignore notification failures */ }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Als verkauft markiert');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Markieren als verkauft');
    }
  });

  // Reject offer mutation
  const rejectOfferMutation = useMutation({
    mutationFn: async (offerId) => {
      const offerToReject = offers.find(o => o.id === offerId);
      if (!offerToReject) {
        throw new Error('Offerta non trovata');
      }
      if (!meIds.includes(offerToReject.receiverId)) {
        throw new Error('Solo il destinatario può rifiutare');
      }
      if (offerToReject.status !== 'pending') {
        throw new Error('Offerta non più valida');
      }

      // Update offer status to rejected
      await base44.entities.Offer.update(offerId, { status: 'rejected' });

      // Create system message
      await base44.functions.invoke('createChatMessage', {
        chatId: chat.id,
        text: `❌ Angebot von ${offerToReject.amount}€ abgelehnt`,
        messageType: 'system'
      });

      // Update chat status
      await base44.entities.Chat.update(chat.id, {
        status: 'rifiutata',
        lastMessage: '❌ Angebot abgelehnt',
        updatedAt: new Date().toISOString()
      });

      // Notify buyer via backend — non-blocking
      try {
        await base44.functions.invoke('sendNotification', {
          userId: offerToReject.senderId,
          type: 'status_update',
          title: '❌ Angebot abgelehnt',
          message: `Dein Angebot von ${offerToReject.amount}€ für "${listing?.title}" wurde abgelehnt.`,
          actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
          metadata: { chatId: chat.id }
        });
      } catch (_) { /* ignore notification failures */ }

      return offerToReject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });
      toast.info('Angebot abgelehnt');
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Ablehnen des Angebots');
    }
  });

  // Group messages by date
  const focusMessageInput = () => {
    try {
      messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
    } catch {}
    setTimeout(() => messageInputRef.current?.focus(), 100);
  };

  const messagesWithOffers = React.useMemo(() => {
    // Hard guard: never mix messages across chats
    const safeOffers = (offersForChat || []).filter(o => o.chatId === chat?.id);
    const list = Array.isArray(messages) ? [...messages] : [];
    const hasLinked = (offer) => list.some(m => m.messageType === 'offer' && (
      (typeof m.text === 'string' && m.text.includes(`[OFFER_ID:${offer.id}]`)) ||
      (m.senderId === offer.senderId && Number(m.price) === Number(offer.amount))
    ));

    (offersForChat || []).forEach((offer) => {
      if (!hasLinked(offer)) {
        list.push({
          id: `virtual-${offer.id}`,
          chatId: chat.id,
          senderId: offer.senderId,
          receiverId: offer.receiverId,
          text: `${(offer.type === 'counter' ? '🔄 Gegenangebot' : '💰 Angebot')}: ${offer.amount}€ [OFFER_ID:${offer.id}]`,
          price: offer.amount,
          messageType: 'offer',
          created_date: offer.created_date || offer.updated_date || new Date().toISOString(),
          read: false,
        });
      }
    });

    // Ensure chronological order
    list.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return list;
  }, [messages, offers, chat?.id]);

  const timelineMessages = React.useMemo(() => {
    const deduped = [];
    const seenSystemTexts = new Set();
    for (const m of messagesWithOffers) {
      if (m?.messageType === 'system' && typeof m?.text === 'string') {
        const key = m.text.trim();
        if (seenSystemTexts.has(key)) continue;
        seenSystemTexts.add(key);
      }
      deduped.push(m);
    }
    return deduped;
  }, [messagesWithOffers]);

  const groupedMessages = timelineMessages.reduce((groups, message) => {
    const date = formatMessageDate(message.created_date, language);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (!chat || !user?.email) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div data-offer-build={CHAT_WINDOW_BUILD_ID} className="flex flex-col h-full min-h-0 w-full bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:p-3 border-b bg-gradient-to-r from-[var(--z-primary)] to-[var(--z-primary-dark)] text-white">
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden text-white hover:bg-white/20"
          onClick={() => ((listing?.id || chat?.listingId) ? goBack() : (onBack ? onBack() : goBack()))}
          aria-label="Zurück"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          ← Chats
        </Button>
        {/* Back to listing (desktop and mobile) */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex text-white hover:bg-white/20"
          onClick={() => goBack()}
          aria-label="Zurück zur Anzeige"
          title="Zur Anzeige"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          {listing?.title ? '' : ''}
        </Button>
        
        {(listing?.images?.[0] || chat?.listingImage) ? (
          <img src={listing?.images?.[0] || chat?.listingImage} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg">📦</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-sm md:text-base">{(listing?.title || chat?.listingTitle) ?? 'Annuncio'}</h3>
          <p className="text-xs text-white/80 truncate flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded-full border border-white/30 text-[10px]">
              {isSeller ? (language==='it'?'Tu: Venditore':language==='de'?'Ich: Verkäufer':language==='en'?'You: Seller':ct.seller) : (language==='it'?'Tu: Acquirente':language==='de'?'Ich: Käufer':language==='en'?'You: Buyer':ct.buyer)}
            </span>
            <span className="opacity-70">•</span>
            {(isSeller ? ct.buyer : ct.seller)}: {(() => {
              const v = otherUser || '';
              if (typeof v !== 'string') return '—';
              const at = v.indexOf('@');
              return at > 0 ? v.slice(0, at) : v;
            })()}
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[derivedChatStatus]}`} />
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20"
            onClick={onReport}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Debug Participants Panel */}
      {debugParticipants && (
        <div className="m-2 md:m-3 p-2 md:p-3 border rounded-lg bg-yellow-50 text-[11px] md:text-xs text-yellow-900">
          <div className="font-semibold mb-1">Debug partecipanti</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <div><span className="text-yellow-700">chatId:</span> <code>{String(chat?.id || '')}</code></div>
            <div><span className="text-yellow-700">currentUser.id:</span> <code>{String(user?.id || '')}</code></div>
            <div><span className="text-yellow-700">buyerId:</span> <code>{String(chat?.buyerId || '')}</code></div>
            <div><span className="text-yellow-700">sellerId:</span> <code>{String(chat?.sellerId || '')}</code></div>
            {lastOffer && (
              <div className="md:col-span-2"><span className="text-yellow-700">lastOffer.receiverId:</span> <code>{String(lastOffer?.receiverId || '')}</code></div>
            )}
            <div className="md:col-span-2"><span className="text-yellow-700">role calcolato:</span> <code>{role}</code></div>
          </div>
        </div>
      )}

      {/* Unavailable Listing Banner */}
      {isListingUnavailable && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs md:text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{isExpired ? (language==='de'?'Anzeige abgelaufen':language==='en'?'Listing expired':'Annuncio scaduto') : (listing?.status === 'sold' ? (language==='de'?'Anzeige verkauft':language==='en'?'Listing sold':'Annuncio venduto') : (language==='de'?'Anzeige nicht verfügbar':language==='en'?'Listing not available':'Annuncio non più disponibile'))}</span>
        </div>
      )}

      {/* Listing Info Bar (works even if listing not readable) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-2 md:p-3 bg-slate-50 border-b text-[12px] md:text-sm gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {displayPrice !== null && (
            <span className="font-semibold text-green-600">{displayPrice}€</span>
          )}
          {chat.lastPrice && (displayPrice === null || chat.lastPrice !== displayPrice) && (
            <Badge variant="outline" className="text-xs">
              {ct.lastOffer}: {lastOffer?.amount ?? chat.lastPrice}€
              {lastOffer && lastOffer.status === 'pending' && (language==='de' ? ' • Aktiv' : language==='en' ? ' • Active' : ' • Attiva')}
            </Badge>
          )}
          <Badge className={(statusColors[derivedChatStatus] || 'bg-slate-200 text-slate-700').replace('bg-', 'bg-opacity-20 text-').replace('-500', '-700')}>
            {statusLabels[language]?.[derivedChatStatus] || derivedChatStatus}
          </Badge>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowOfferHistory(!showOfferHistory)}
            className="text-xs"
          >
            <History className="h-4 w-4 mr-1" />
            {offersForChat.length}
             </Button>
             {isBuyer && derivedChatStatus !== 'accettata' && derivedChatStatus !== 'completata' && !hasActiveReservation && (
               <Button 
                 size="sm" 
                 onClick={handleMakeOffer}
                 className="bg-green-600 hover:bg-green-700 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                 disabled={isListingUnavailable || listing?.status === 'reserved'}
                 title={
                   isListingUnavailable
                     ? (isExpired ? 'Annuncio scaduto' : 'Annuncio non disponibile')
                     : (listing?.status === 'reserved' ? 'Anzeige ist reserviert' : '')
                 }
               >
              <DollarSign className="h-4 w-4 mr-1" />
              {ct.offer}
            </Button>
          )}
        </div>
      </div>

      {/* Offer History Panel */}
      {showOfferHistory && (
        <div className="p-3 bg-slate-100 border-b">
          <OfferHistory 
            offers={offersForChat} 
            userEmail={user?.email} 
            listingPrice={listing?.price}
            lastOfferId={lastOffer?.id}
          />
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain p-3 pb-28 md:p-4 md:pb-4 space-y-3 md:space-y-4"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      >
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center mb-3 md:mb-4">
              <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                {date}
              </span>
            </div>

            {/* Messages */}
            {dayMessages.map((msg) => {
              const isOwn = meIds.includes(msg.senderId);
              const isSystem = msg.messageType === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              // Extract offer ID from message text
              const offerIdMatch = msg.text?.match(/\[OFFER_ID:([^\]]+)\]/);
              const linkedOfferId = offerIdMatch ? offerIdMatch[1] : null;
              const linkedOffer = linkedOfferId ? offers.find(o => o.id === linkedOfferId) : null; // could be null on initial render; realtime/useQuery will hydrate shortly
              const candidateOffer = linkedOffer || offersForChat.find(o => o.status === 'pending' && o.senderId === msg.senderId && Number(o.amount) === Number(msg.price));
              const displayText = msg.text?.replace(/\[OFFER_ID:[^\]]+\]/, '').trim();

              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[95%] md:max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-3 py-2 md:px-4 ${
                        msg.messageType === 'offer'
                          ? ((candidateOffer && lastOffer && candidateOffer.id === lastOffer.id)
                              ? (isOwn ? 'bg-[#d62828] text-white rounded-br-md' : 'bg-white border shadow-sm rounded-bl-md')
                              : (isOwn ? 'bg-white border shadow-sm text-slate-800 rounded-br-md' : 'bg-slate-50 border-slate-200 rounded-bl-md')
                            )
                          : (isOwn ? 'bg-[#d62828] text-white rounded-br-md' : 'bg-white border shadow-sm rounded-bl-md')
                      } ${ (candidateOffer && lastOffer && candidateOffer.id === lastOffer.id) ? `${offerRingClasses[lastOffer.status] || 'ring-2 ring-slate-400'} shadow-md` : ''}`}>
                      {msg.messageType === 'offer' && (
                        <div className={`${(candidateOffer && lastOffer && candidateOffer.id === lastOffer.id) ? (isOwn ? 'text-red-200' : 'text-red-600') : 'text-slate-400'} text-xs font-semibold mb-1`}>
                          {(() => {
                            const type = (linkedOffer?.type) || ((/Gegenangebot|Controproposta|Counter/i.test(displayText)) ? 'counter' : 'offer');
                            const youOffer =
                              language==='it' ? (type==='counter' ? 'La tua controproposta' : 'La tua offerta') :
                              language==='de' ? (type==='counter' ? 'Dein Gegenangebot' : 'Dein Angebot') :
                              language==='en' ? (type==='counter' ? 'Your counter-offer' : 'Your offer') :
                              (type==='counter' ? ct.counterOffer : ct.offer);
                            const receivedOffer =
                              language==='it' ? (type==='counter' ? 'Controproposta ricevuta' : 'Offerta ricevuta') :
                              language==='de' ? (type==='counter' ? 'Erhaltenes Gegenangebot' : 'Erhaltenes Angebot') :
                              language==='en' ? (type==='counter' ? 'Counter-offer received' : 'Offer received') :
                              (type==='counter' ? ct.counterOffer : ct.offer);
                            return isOwn ? youOffer : receivedOffer;
                          })()}
                        </div>
                      )}

                      {/* Image */}
                      {msg.imageUrl && (
                        <img 
                          src={msg.imageUrl} 
                          alt="Immagine" 
                          className="rounded-lg max-w-full cursor-pointer mb-2"
                          onClick={() => setShowImagePreview(msg.imageUrl)}
                        />
                      )}

                      {/* Text */}
                      {displayText && (
                        <div>
                          <p className="text-[13px] md:text-sm whitespace-pre-wrap break-words hyphens-auto">
                            {translatedMessages[msg.id] || displayText}
                          </p>
                          {displayText && !meIds.includes(msg.senderId) && msg.messageType !== 'system' && (
                            <button
                              onClick={() => handleTranslateMessage(msg.id, displayText)}
                              disabled={translatingId === msg.id}
                              className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-white/60 hover:text-white/80' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {translatingId === msg.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Languages className="h-3 w-3" />
                              )}
                              {translatedMessages[msg.id] ? ct.original : ct.translate}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      {msg.price && (
                                                <div className={`mt-1 font-bold ${
                                                  (msg.messageType === 'offer' && candidateOffer && lastOffer && candidateOffer.id === lastOffer.id)
                                                    ? (isOwn ? 'text-yellow-300' : 'text-green-600')
                                                    : 'text-slate-500'
                                                }`}>
                                                  💰 {msg.price}€
                                                </div>
                                              )}

                      {/* Offer Action Buttons (only for pending offers and receiver) */}
                      {msg.messageType === 'offer' && candidateOffer && lastOffer && candidateOffer.id === lastOffer.id && candidateOffer.status === 'pending' && !isOwn && isRecipient(candidateOffer) && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptOffer(candidateOffer.id)}
                            disabled={acceptOfferMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {language==='it' ? 'Accetta offerta' : ct.accept}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCounterOffer(candidateOffer)}
                            variant="outline"
                            className="flex-1"
>
                            {language==='it' ? 'Controproposta' : ct.counterOffer}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRejectOffer(candidateOffer.id)}
                            disabled={rejectOfferMutation.isPending}
                            variant="destructive"
                            className="flex-1"
                          >
                            {language==='it' ? 'Rifiuta' : ct.reject}
                          </Button>
                        </div>
                      )}

                      {/* Offer Status Badge */}
                      {msg.messageType === 'offer' && candidateOffer && lastOffer && candidateOffer.id === lastOffer.id && candidateOffer.status !== 'pending' && (
                        <div className="mt-2">
                          <Badge 
                            variant={
                              candidateOffer.status === 'accepted_reserved' ? 'default' : 
                              candidateOffer.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {candidateOffer.status === 'accepted_reserved' && '✓ Angenommen - Reserviert'}
                            {candidateOffer.status === 'rejected' && '✕ Abgelehnt'}
                            {candidateOffer.status === 'countered' && '🔄 Kontriert'}
                            {candidateOffer.status === 'withdrawn' && '🚫 Zurückgezogen'}
                            {candidateOffer.status === 'expired' && '⏰ Abgelaufen'}
                          </Badge>
                        </div>
                      )}

                      {/* Moderation Flag */}
                      {msg.flagged && (
                        <div className={`mt-1 flex items-center gap-1 ${isOwn ? 'text-yellow-200' : 'text-red-600'} text-xs`}>
                          <AlertTriangle className="h-3 w-3" />
                          In review
                        </div>
                      )}
                      
                      {/* Time & Read Status */}
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-slate-400'}`}>
                        <span className="text-xs">
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </span>
                        {isOwn && (
                          msg.read 
                            ? <CheckCheck className="h-3 w-3 text-blue-300" />
                            : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-slate-200 rounded-2xl px-4 py-2 rounded-bl-md">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

      </div>



      {/* Seller Actions for Reserved Listing */}
      {hasActiveReservation && isSeller && (
        <div className="p-2 md:p-3 bg-yellow-50 border-t space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-yellow-800 font-medium">🔒 Anzeige reserviert</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => unreserveMutation.mutate()}
              disabled={unreserveMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              🔓 Reservierung aufheben
            </Button>
            <Button 
              onClick={() => markAsSoldMutation.mutate()}
              disabled={markAsSoldMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              ✅ Als verkauft markieren
            </Button>
          </div>
        </div>
      )}

      {/* Accepted state — informational only, no payments */}
      {derivedChatStatus === 'accettata' && (
        <div className="p-2 md:p-3 bg-green-50 border-t text-center">
          <p className="text-sm text-green-800">
            {language==='de' ? 'Angebot angenommen – Anzeige reserviert. Zahlung/Übergabe werden privat zwischen den Parteien geregelt.' :
             language==='en' ? 'Offer accepted — listing reserved. Payment/delivery are arranged privately between the parties.' :
             'Offerta accettata — annuncio riservato. Pagamento/consegna sono concordati privatamente tra le parti.'}
          </p>
        </div>
      )}

      {/* Buyer can make new offer after rejection */}
      {derivedChatStatus === 'rifiutata' && isBuyer && (
        <div className="p-2 md:p-3 bg-orange-50 border-t">
          <Button onClick={handleMakeOffer} className="w-full bg-orange-500 hover:bg-orange-600">
            <DollarSign className="h-4 w-4 mr-2" />
            {ct.makeNewOffer}
          </Button>
        </div>
      )}

      {/* Review prompt after transaction completed */}
      {derivedChatStatus === 'completata' && !hasLeftReview && (
        <div className="p-2 md:p-3 bg-yellow-50 border-t">
          <Button 
            onClick={() => setShowReviewModal(true)} 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Star className="h-4 w-4 mr-2" />
            {ct.leaveReview}
          </Button>
          <p className="text-center text-xs text-yellow-700 mt-2">
            {ct.reviewPrompt} {isSeller ? ct.buyer : ct.seller}
          </p>
        </div>
      )}

      {/* Already reviewed message */}
      {derivedChatStatus === 'completata' && hasLeftReview && (
        <div className="p-2 md:p-3 bg-green-50 border-t text-center">
          <p className="text-sm text-green-700 flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            {ct.reviewLeft}
          </p>
        </div>
      )}


      {/* AI suggestions */}
      {botSuggestions.length > 0 && (
        <div className="px-3 py-2 border-t bg-white flex gap-2 flex-wrap">
          {botSuggestions.map((s, i) => (
            <button
              key={i}
              className="text-xs border rounded-full px-2 py-1 hover:bg-slate-50"
              onClick={() => { setMessageText(s); setTimeout(() => messageInputRef.current?.focus(), 50); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-2 md:p-3 border-t bg-slate-50">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isListingUnavailable}
          title={isListingUnavailable ? 'Annuncio non disponibile' : undefined}
        >
          <Image className={`h-5 w-5 ${isUploading ? 'animate-pulse' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={isSuggesting || isListingUnavailable}
          title="Hunger Bot"
          className="hidden md:inline-flex"
        >
          <Zap className={`h-4 w-4 mr-1 ${isSuggesting ? 'animate-spin' : ''}`} />
          Hunger Bot
        </Button>

        <Input
           ref={messageInputRef}
           placeholder={isListingUnavailable ? 'Annuncio non disponibile' : ct.typeMessage}
           value={messageText}
           onChange={(e) => {
             setMessageText(e.target.value);
             handleTyping();
           }}
           onKeyDown={(e) => !isListingUnavailable && e.key === 'Enter' && !e.shiftKey && handleSend()}
           className="flex-1 min-w-0"
           disabled={isListingUnavailable}
         />
        
        <Button 
          onClick={handleSend} 
          disabled={isListingUnavailable || !messageText.trim() || sendMessageMutation.isPending}
          className="bg-[#d62828] hover:bg-[#b82020]"
          title={isListingUnavailable ? 'Annuncio non disponibile' : undefined}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(null)}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 text-white"
            onClick={() => setShowImagePreview(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img src={showImagePreview} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Offer Modal */}
      <OfferModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={(data) => createOfferMutation.mutate(data)}
        listingPrice={listing?.price}
        lastOffer={lastOffer}
        isCounter={isCounterOffer}
        isPending={createOfferMutation.isPending}
      />

      {/* Review Modal */}
      <ReviewForm
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        chatId={chat.id}
        listingId={chat.listingId}
        ratedEmail={otherUser}
        raterEmail={user?.email}
        raterRole={isSeller ? 'seller' : 'buyer'}
        listingTitle={listing?.title}
        transactionAmount={chat.lastPrice}
      />
    </div>
  );
}