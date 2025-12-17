import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Image, Smile, MoreVertical, Phone, Video, 
  Check, CheckCheck, ArrowLeft, Zap, Languages,
  CreditCard, AlertTriangle, X, Circle, DollarSign, History, Star, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageProvider';
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
    payNow: 'JETZT BEZAHLEN',
    offerAcceptedDesc: 'Das Angebot wurde angenommen! Schließen Sie die Zahlung ab.',
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
    payNow: 'PAY NOW',
    offerAcceptedDesc: 'The offer has been accepted! Complete the payment.',
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
    payNow: 'PAGA ORA',
    offerAcceptedDesc: "L'offerta è stata accettata! Completa il pagamento.",
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
    payNow: 'ŞİMDİ ÖDE',
    offerAcceptedDesc: 'Teklif kabul edildi! Ödemeyi tamamlayın.',
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
    payNow: 'ОПЛАТИТИ ЗАРАЗ',
    offerAcceptedDesc: 'Пропозицію прийнято! Завершіть оплату.',
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
    payNow: 'PAYER MAINTENANT',
    offerAcceptedDesc: "L'offre a été acceptée ! Complétez le paiement.",
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
    payNow: 'ZAPŁAĆ TERAZ',
    offerAcceptedDesc: 'Oferta została zaakceptowana! Dokończ płatność.',
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
  onReport
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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const isSeller = chat?.sellerId === user?.email;
  const otherUser = isSeller ? chat?.buyerId : chat?.sellerId;

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
  const { data: offers = [] } = useQuery({
    queryKey: ['offers', chat?.id],
    queryFn: () => base44.entities.Offer.filter({ chatId: chat.id }, '-created_date'),
    enabled: !!chat?.id,
  });

  const lastOffer = offers.find(o => o.status === 'pending') || offers[0];

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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (chat && messages.length > 0) {
      const unreadMessages = messages.filter(m => !m.read && m.senderId !== user?.email);
      unreadMessages.forEach(async (msg) => {
        await base44.entities.ChatMessage.update(msg.id, { read: true });
      });
      
      // Update chat unread count
      const updateField = isSeller ? 'unreadSeller' : 'unreadBuyer';
      if (chat[updateField] > 0) {
        base44.entities.Chat.update(chat.id, { [updateField]: 0 });
      }
    }
  }, [chat, messages, user, isSeller]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, imageUrl, price, messageType = 'text' }) => {
      const message = await base44.entities.ChatMessage.create({
        chatId: chat.id,
        senderId: user.email,
        text: text || '',
        imageUrl,
        price,
        messageType,
        read: false
      });

      // Update chat
      const unreadField = isSeller ? 'unreadBuyer' : 'unreadSeller';
      await base44.entities.Chat.update(chat.id, {
        lastMessage: imageUrl ? '📷 Immagine' : text?.substring(0, 50) || '',
        lastPrice: price || chat.lastPrice,
        updatedAt: new Date().toISOString(),
        [unreadField]: (chat[unreadField] || 0) + 1
      });

      // Send notification
      const receiverPrefs = await base44.entities.NotificationPreference.filter({ userId: otherUser });
      const prefs = receiverPrefs[0] || { messageReplies: true, emailNotifications: true };
      
      if (prefs.messageReplies) {
        await base44.entities.Notification.create({
          userId: otherUser,
          type: price ? 'offer' : 'message',
          title: price ? `💰 Offerta: ${price}€` : '💬 Nuovo messaggio',
          message: `${listing?.title}: ${text?.substring(0, 50) || 'Immagine'}`,
          linkUrl: '/Messages',
          relatedId: chat.id
        });
      }

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

  const handleAcceptOffer = () => acceptOfferMutation.mutate();
  const handleRejectOffer = () => rejectOfferMutation.mutate();

  const handleCounterOffer = () => {
    setIsCounterOffer(true);
    setShowOfferModal(true);
  };

  const handleMakeOffer = () => {
    setIsCounterOffer(false);
    setShowOfferModal(true);
  };

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async ({ amount, message, type }) => {
      // Update previous pending offers to 'countered'
      const pendingOffers = offers.filter(o => o.status === 'pending');
      for (const offer of pendingOffers) {
        await base44.entities.Offer.update(offer.id, { status: 'countered' });
      }

      // Create new offer
      const offer = await base44.entities.Offer.create({
        chatId: chat.id,
        listingId: chat.listingId,
        senderId: user.email,
        receiverId: otherUser,
        amount,
        previousAmount: lastOffer?.amount || listing?.price,
        status: 'pending',
        type,
        message
      });

      // Send chat message
      await sendMessageMutation.mutateAsync({
        text: message ? `${type === 'counter' ? '🔄 Controproposta' : '💰 Offerta'}: ${amount}€\n"${message}"` : `${type === 'counter' ? '🔄 Controproposta' : '💰 Offerta'}: ${amount}€`,
        price: amount,
        messageType: 'offer'
      });

      // Update chat status
      await base44.entities.Chat.update(chat.id, {
        lastPrice: amount,
        status: 'in_attesa',
        updatedAt: new Date().toISOString()
      });

      // Send detailed notification
      await base44.entities.Notification.create({
        userId: otherUser,
        type: 'offer',
        title: type === 'counter' ? '🔄 Nuova controproposta!' : '💰 Nuova offerta!',
        message: `${user.email.split('@')[0]} ha ${type === 'counter' ? 'fatto una controproposta di' : 'offerto'} ${amount}€ per "${listing?.title}"`,
        linkUrl: '/Messages',
        relatedId: chat.id
      });

      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setShowOfferModal(false);
      toast.success('Offerta inviata!');
    }
  });

  // Accept offer mutation  
  const acceptOfferMutation = useMutation({
    mutationFn: async () => {
      // Update offer status
      if (lastOffer) {
        await base44.entities.Offer.update(lastOffer.id, { status: 'accepted' });
      }

      await base44.entities.ChatMessage.create({
        chatId: chat.id,
        senderId: user.email,
        text: `✅ Offerta di ${chat.lastPrice}€ accettata! Procedi al pagamento.`,
        messageType: 'system'
      });

      await base44.entities.Chat.update(chat.id, {
        status: 'accettata',
        lastMessage: '✅ Offerta accettata',
        updatedAt: new Date().toISOString()
      });

      await base44.entities.Notification.create({
        userId: chat.buyerId,
        type: 'status_update',
        title: '✅ Offerta accettata!',
        message: `La tua offerta di ${chat.lastPrice}€ per "${listing?.title}" è stata accettata! Procedi al pagamento.`,
        linkUrl: '/Messages',
        relatedId: chat.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      toast.success('Offerta accettata!');
    }
  });

  // Reject offer mutation
  const rejectOfferMutation = useMutation({
    mutationFn: async () => {
      if (lastOffer) {
        await base44.entities.Offer.update(lastOffer.id, { status: 'rejected' });
      }

      await base44.entities.ChatMessage.create({
        chatId: chat.id,
        senderId: user.email,
        text: `❌ Offerta di ${chat.lastPrice}€ rifiutata`,
        messageType: 'system'
      });

      await base44.entities.Chat.update(chat.id, {
        status: 'rifiutata',
        lastMessage: '❌ Offerta rifiutata',
        updatedAt: new Date().toISOString()
      });

      await base44.entities.Notification.create({
        userId: chat.buyerId,
        type: 'status_update',
        title: '❌ Offerta rifiutata',
        message: `La tua offerta di ${chat.lastPrice}€ per "${listing?.title}" è stata rifiutata.`,
        linkUrl: '/Messages',
        relatedId: chat.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', chat.id] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      toast.info('Offerta rifiutata');
    }
  });

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatMessageDate(message.created_date, language);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-gradient-to-r from-[#d62828] to-[#b82020] text-white">
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden text-white hover:bg-white/20"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {listing?.images?.[0] ? (
          <img src={listing.images[0]} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg">📦</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{listing?.title || 'Annuncio'}</h3>
          <p className="text-xs text-white/80 truncate flex items-center gap-1">
            {isSeller ? ct.buyer : ct.seller}: {otherUser?.split('@')[0]}
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColors[chat.status]}`} />
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

      {/* Listing Info Bar */}
      {listing && (
        <div className="flex items-center justify-between p-2 bg-slate-50 border-b text-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-green-600">{listing.price}€</span>
            {chat.lastPrice && chat.lastPrice !== listing.price && (
              <Badge variant="outline" className="text-xs">
                {ct.lastOffer}: {chat.lastPrice}€
              </Badge>
            )}
            <Badge className={statusColors[chat.status].replace('bg-', 'bg-opacity-20 text-').replace('-500', '-700')}>
              {chat.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowOfferHistory(!showOfferHistory)}
              className="text-xs"
            >
              <History className="h-4 w-4 mr-1" />
              {offers.length}
            </Button>
            {!isSeller && chat.status !== 'accettata' && chat.status !== 'completata' && (
              <Button 
                size="sm" 
                onClick={handleMakeOffer}
                className="bg-green-600 hover:bg-green-700 text-xs"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                {ct.offer}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Offer History Panel */}
      {showOfferHistory && (
        <div className="p-3 bg-slate-100 border-b">
          <OfferHistory 
            offers={offers} 
            userEmail={user?.email} 
            listingPrice={listing?.price} 
          />
        </div>
      )}

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      >
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center mb-4">
              <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                {date}
              </span>
            </div>

            {/* Messages */}
            {dayMessages.map((msg) => {
              const isOwn = msg.senderId === user?.email;
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

              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isOwn ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      isOwn 
                        ? 'bg-[#d62828] text-white rounded-br-md' 
                        : 'bg-white border shadow-sm rounded-bl-md'
                    }`}>
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
                      {msg.text && (
                        <div>
                          <p className="text-sm whitespace-pre-wrap">
                            {translatedMessages[msg.id] || msg.text}
                          </p>
                          {msg.text && msg.senderId !== user?.email && msg.messageType !== 'system' && (
                            <button
                              onClick={() => handleTranslateMessage(msg.id, msg.text)}
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
                        <div className={`mt-1 font-bold ${isOwn ? 'text-yellow-300' : 'text-green-600'}`}>
                          💰 {msg.price}€
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
        <div ref={messagesEndRef} />
      </div>

      {/* Offer Actions (for seller) */}
      {chat.status === 'in_attesa' && isSeller && chat.lastPrice && (
        <div className="flex gap-2 p-3 bg-yellow-50 border-t">
          <Button 
            onClick={handleAcceptOffer} 
            disabled={acceptOfferMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            ✓ {ct.accept}
          </Button>
          <Button onClick={handleCounterOffer} variant="outline" className="flex-1">
            🔄 {ct.counterOffer}
          </Button>
          <Button 
            onClick={handleRejectOffer} 
            disabled={rejectOfferMutation.isPending}
            variant="destructive" 
            className="flex-1"
          >
            ✕ {ct.reject}
          </Button>
        </div>
      )}

      {/* Payment Button (for buyer after acceptance) */}
      {chat.status === 'accettata' && !isSeller && (
        <div className="p-3 bg-green-50 border-t animate-pulse">
          <Button onClick={onOpenPayment} className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
            <CreditCard className="h-5 w-5 mr-2" />
            💳 {ct.payNow} - {chat.lastPrice}€
          </Button>
          <p className="text-center text-xs text-green-700 mt-2">
            {ct.offerAcceptedDesc}
          </p>
        </div>
      )}

      {/* Buyer can make new offer after rejection */}
      {chat.status === 'rifiutata' && !isSeller && (
        <div className="p-3 bg-orange-50 border-t">
          <Button onClick={handleMakeOffer} className="w-full bg-orange-500 hover:bg-orange-600">
            <DollarSign className="h-4 w-4 mr-2" />
            {ct.makeNewOffer}
          </Button>
        </div>
      )}

      {/* Review prompt after transaction completed */}
      {chat.status === 'completata' && !hasLeftReview && (
        <div className="p-3 bg-yellow-50 border-t">
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
      {chat.status === 'completata' && hasLeftReview && (
        <div className="p-3 bg-green-50 border-t text-center">
          <p className="text-sm text-green-700 flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            {ct.reviewLeft}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t bg-slate-50">
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
          disabled={isUploading}
        >
          <Image className={`h-5 w-5 ${isUploading ? 'animate-pulse' : ''}`} />
        </Button>
        
        <Input
          placeholder={ct.typeMessage}
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1"
        />
        
        <Button 
          onClick={handleSend} 
          disabled={!messageText.trim() || sendMessageMutation.isPending}
          className="bg-[#d62828] hover:bg-[#b82020]"
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