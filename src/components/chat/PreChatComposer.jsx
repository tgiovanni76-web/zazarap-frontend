import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, DollarSign, History, Image as ImageIcon, Languages, Send, Zap } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function PreChatComposer({ listingId, user, autoFocusComposer = false, onChatCreated }) {
  const { currentLanguage } = useLanguage();
  const queryClient = useQueryClient();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['prechat-listing', listingId],
    queryFn: async () => {
      const res = await base44.entities.Listing.filter({ id: listingId });
      return Array.isArray(res) ? res[0] : null;
    },
    enabled: !!listingId,
  });

  const [messageText, setMessageText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [botSuggestions, setBotSuggestions] = useState([]);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (autoFocusComposer) {
      setTimeout(() => messageInputRef.current?.focus(), 150);
    }
  }, [autoFocusComposer]);

  const isExpired = listing?.expiresAt ? new Date(listing.expiresAt) < new Date() : false;
  const isUnavailable = !!(isExpired || (listing?.status && ['sold', 'archived', 'expired'].includes(listing.status)));

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const langName = currentLanguage === 'de' ? 'German' : currentLanguage === 'en' ? 'English' : currentLanguage === 'it' ? 'Italian' : currentLanguage === 'tr' ? 'Turkish' : currentLanguage === 'uk' ? 'Ukrainian' : currentLanguage === 'fr' ? 'French' : currentLanguage === 'pl' ? 'Polish' : 'English';
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful assistant for a buyer-seller chat about "${listing?.title || 'the item'}". Role: buyer. Generate 3 short, friendly first messages in ${langName} (max 90 chars each). Return JSON { suggestions: string[] }`,
        response_json_schema: { type: 'object', properties: { suggestions: { type: 'array', items: { type: 'string' } } } }
      });
      setBotSuggestions((res?.suggestions || []).slice(0, 3));
    } catch (e) {
      toast.error('Suggerimenti non disponibili');
    } finally {
      setIsSuggesting(false);
    }
  };

  const createAndSend = useMutation({
    mutationFn: async () => {
      if (!user || !listing) throw new Error('Missing data');
      const sellerEmail = listing.created_by || listing.sellerId;
      // Create chat
      const chat = await base44.entities.Chat.create({
        listingId,
        buyerId: user.email,
        sellerId: sellerEmail,
        listingTitle: listing.title,
        listingImage: (listing.images && listing.images[0]) || '',
        updatedAt: new Date().toISOString()
      });
      // First message
      await base44.entities.ChatMessage.create({
        chatId: chat.id,
        senderId: user.email,
        receiverId: sellerEmail,
        text: messageText,
        messageType: 'text',
        read: false
      });
      // Update chat last fields + unread for seller
      await base44.entities.Chat.update(chat.id, {
        lastMessage: messageText.substring(0, 50),
        lastPrice: chat.lastPrice,
        updatedAt: new Date().toISOString(),
        unreadSeller: (chat.unreadSeller || 0) + 1
      });
      // Notification for seller
      await base44.functions.invoke('sendNotification', {
        userId: sellerEmail,
        type: 'message',
        title: '💬 Nuovo messaggio',
        message: `${(listing.title || 'Annuncio')}: ${messageText.substring(0, 50)}`,
        actionUrl: createPageUrl('Messages') + `?chatId=${chat.id}`,
        metadata: { chatId: chat.id, listingId }
      });
      return chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      const url = new URL(window.location.href);
      url.searchParams.set('chatId', chat.id);
      window.history.replaceState({}, '', url.toString());
      onChatCreated?.(chat);
      setMessageText('');
    }
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    if (isUnavailable) {
      toast.error(isExpired ? 'Annuncio scaduto' : 'Annuncio non disponibile');
      return;
    }
    createAndSend.mutate();
  };

  // Simple i18n for status banner
  const bannerText = isExpired ? (
    currentLanguage === 'de' ? 'Anzeige abgelaufen' : currentLanguage === 'en' ? 'Listing expired' : 'Annuncio scaduto'
  ) : (
    currentLanguage === 'de' ? 'Anzeige nicht verfügbar' : currentLanguage === 'en' ? 'Listing not available' : 'Annuncio non disponibile'
  );

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:p-3 border-b bg-gradient-to-r from-[var(--z-primary)] to-[var(--z-primary-dark)] text-white">
        {listing?.images?.[0] ? (
          <img src={listing.images[0]} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center"><span className="text-lg">📦</span></div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-sm md:text-base">{listing?.title || 'Annuncio'}</h3>
          {typeof listing?.price === 'number' && (
            <span className="text-xs text-white/80">{listing.price}€</span>
          )}
        </div>
        {listing?.status && (
          <Badge className="bg-white/20 text-white text-xs">{listing.status}</Badge>
        )}
      </div>

      {/* Unavailable banner */}
      {isUnavailable && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs md:text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{bannerText}</span>
        </div>
      )}

      {/* AI suggestions chips */}
      {botSuggestions.length > 0 && (
        <div className="px-3 py-2 border-b bg-white flex gap-2 flex-wrap">
          {botSuggestions.map((s, i) => (
            <button key={i} className="text-xs border rounded-full px-2 py-1 hover:bg-slate-50" onClick={() => { setMessageText(s); setTimeout(() => messageInputRef.current?.focus(), 50); }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="mt-auto flex items-center gap-2 p-2 md:p-3 bg-slate-50 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={isSuggesting || isUnavailable}
          title="Hunger Bot"
          className="hidden md:inline-flex"
        >
          <Zap className={`h-4 w-4 mr-1 ${isSuggesting ? 'animate-spin' : ''}`} />
          Hunger Bot
        </Button>
        <Input
          ref={messageInputRef}
          placeholder={isUnavailable ? (isExpired ? 'Annuncio scaduto' : 'Annuncio non disponibile') : 'Scrivi un messaggio…'}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => !isUnavailable && e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 min-w-0"
          disabled={isUnavailable}
        />
        <Button onClick={handleSend} disabled={isUnavailable || !messageText.trim() || createAndSend.isPending} className="bg-[#d62828] hover:bg-[#b82020]">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}