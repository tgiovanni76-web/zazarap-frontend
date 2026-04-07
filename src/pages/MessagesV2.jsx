import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import PreChatComposer from '@/components/chat/PreChatComposer';
import { useMessages } from '@/hooks/useMessages';
import { useLanguage } from '@/components/LanguageProvider';

export default function MessagesV2() {
  const queryClient = useQueryClient();
  useEffect(() => { console.warn('[RouteEnter]/messages', window.location.href); }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const initializedRef = useRef(false);
  const [initialOfferFlag, setInitialOfferFlag] = useState(false);
  const { t } = useLanguage();
  const [autoFocusComposer, setAutoFocusComposer] = useState(false);
  const landingListingId = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get('listingId') || p.get('listing') || p.get('lid');
  }, []);

  // Read URL params (chatId + openOffer)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openOffer = params.get('openOffer') === '1' || params.get('offer') === '1';
    setInitialOfferFlag(openOffer);
    if (params.get('listingId') || params.get('listing') || params.get('lid')) {
      setAutoFocusComposer(true);
    }
  }, []);

  // Current user (reuse global cache key)
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  // Chats for current user (RLS already restricts)
  const { data: chats = [], isLoading: loadingChats } = useQuery({
    queryKey: ['chats', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const [asBuyerId, asSellerId, asBuyerEmail, asSellerEmail] = await Promise.all([
        base44.entities.Chat.filter({ buyerId: user.id }, '-updated_date', 200),
        base44.entities.Chat.filter({ sellerId: user.id }, '-updated_date', 200),
        base44.entities.Chat.filter({ buyerId: user.email }, '-updated_date', 200),
        base44.entities.Chat.filter({ sellerId: user.email }, '-updated_date', 200),
      ]);
      const merged = [
        ...(Array.isArray(asBuyerId) ? asBuyerId : []),
        ...(Array.isArray(asSellerId) ? asSellerId : []),
        ...(Array.isArray(asBuyerEmail) ? asBuyerEmail : []),
        ...(Array.isArray(asSellerEmail) ? asSellerEmail : []),
      ];
      const map = new Map();
      merged.forEach(c => { if (c?.id) map.set(c.id, c); });
      const unique = Array.from(map.values());
      unique.sort((a, b) => new Date(b.updated_date || b.updatedAt || 0) - new Date(a.updated_date || a.updatedAt || 0));
      return unique;
    },
    enabled: !!user,
  });

  // Initial selection: run once from URL or fallback, then never override from URL again
  useEffect(() => {
    if (!user) return;
    if (initializedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chatId') || params.get('cid');
    const lId = params.get('listingId') || params.get('listing') || params.get('lid');
    const sellerEmail = params.get('seller');
    let nextId = null;
    if (chatId && chats && chats.length) {
      const found = chats.find(c => c.id === chatId);
      if (found) nextId = found.id;
    } else if (lId && chats && chats.length) {
      let foundByListing = chats.find(c => c.listingId === lId && (!sellerEmail || c.sellerId === sellerEmail || c.buyerId === sellerEmail));
      if (!foundByListing) foundByListing = chats.find(c => c.listingId === lId);
      if (foundByListing) nextId = foundByListing.id;
    } else if (chats && chats.length) {
      nextId = chats[0].id;
    }
    if (nextId) setSelectedChatId(nextId);
    initializedRef.current = true;
  }, [user, chats]);

  // Keep URL in sync with the current selection to avoid stale params overriding selection later
  useEffect(() => {
    if (!selectedChatId) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('chatId', selectedChatId);
      // Clear pre-chat params that could conflict
      url.searchParams.delete('listingId');
      url.searchParams.delete('listing');
      url.searchParams.delete('lid');
      url.searchParams.delete('seller');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, [selectedChatId]);

  // Listing pre-chat focus when arriving from listing (without auto-creating chat)
  useEffect(() => {
    if (!user) return;
    if (landingListingId) setAutoFocusComposer(true);
  }, [user, landingListingId]);

  const selectedChat = useMemo(() => (chats || []).find(c => c.id === selectedChatId) || null, [chats, selectedChatId]);

  // Listing for selected chat (optional)
  const listingId = selectedChat?.listingId;
  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const res = await base44.entities.Listing.filter({ id: listingId });
      return Array.isArray(res) ? res[0] : null;
    },
    enabled: !!listingId,
  });

  // Load messages for selected chat
  const { messages = [], loading: loadingMessages } = useMessages(selectedChatId);

// Do NOT let chat list refresh override current selection
useEffect(() => {
  if (!initializedRef.current) return;
  if (!selectedChatId) return;
  // If the selected chat disappeared (e.g., deleted), keep selection null; otherwise keep as-is
  const exists = (chats || []).some(c => c.id === selectedChatId);
  if (!exists) {
    // Do not auto-switch to another chat; user will pick manually
    // setSelectedChatId(null); // intentionally commented to avoid sudden jump
  }
  // else: no-op to preserve selection
}, [chats, selectedChatId]);

  // Debug: log selected chat + messages
  useEffect(() => {
    if (selectedChatId && user) {
      try { console.warn('[ChatDBG] selectedChat', { chatId: selectedChatId, buyerId: selectedChat?.buyerId, sellerId: selectedChat?.sellerId, me: user.email, msgCount: (messages||[]).length }); } catch(_){}
    }
  }, [selectedChatId, user?.email, messages?.length]);

  if (!user) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="text-slate-600">{t('pleaseLogin','Effettua il login…')}</div>
      </div>
    );
  }

  if (loadingChats) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          Laden…
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[60vh] -mx-1 md:mx-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
        {/* Sidebar */}
        <div className="md:col-span-1 h-full min-h-0 overflow-y-auto">
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={(c) => setSelectedChatId(c.id)}
            user={user}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Chat window */}
        <div className="md:col-span-2 h-full min-h-0 overflow-y-auto">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={messages}
              user={user}
              listing={listing}
              onBack={() => setSelectedChatId(null)}
              onOpenPayment={() => {}}
              onReport={() => {}}
              initialOpenOffer={initialOfferFlag}
              autoFocusComposer={autoFocusComposer}
            />
          ) : (landingListingId ? (
            <PreChatComposer
              listingId={landingListingId}
              user={user}
              autoFocusComposer={true}
              onChatCreated={(chat) => setSelectedChatId(chat.id)}
            />
          ) : (
            <div className="h-full grid place-items-center bg-white rounded-xl border">
              <div className="text-slate-500 text-sm">{t('selectChat','Seleziona una chat per iniziare')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}