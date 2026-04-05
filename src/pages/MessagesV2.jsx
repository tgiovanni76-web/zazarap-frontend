import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import PreChatComposer from '@/components/chat/PreChatComposer';
import { useMessages } from '@/hooks/useMessages';
import { useLanguage } from '@/components/LanguageProvider';

export default function MessagesV2() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
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
      const [asBuyer, asSeller] = await Promise.all([
        base44.entities.Chat.filter({ buyerId: user.email }, '-updated_date', 200),
        base44.entities.Chat.filter({ sellerId: user.email }, '-updated_date', 200),
      ]);
      const merged = [...(Array.isArray(asBuyer) ? asBuyer : []), ...(Array.isArray(asSeller) ? asSeller : [])];
      const map = new Map();
      merged.forEach(c => { if (c?.id) map.set(c.id, c); });
      const unique = Array.from(map.values());
      unique.sort((a, b) => new Date(b.updated_date || b.updatedAt || 0) - new Date(a.updated_date || a.updatedAt || 0));
      return unique;
    },
    enabled: !!user,
  });

  // Select chat from URL (?chatId) or default to most recent
  useEffect(() => {
    if (!user) return;
    if (!chats || chats.length === 0) {
      setSelectedChat(null);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chatId') || params.get('cid');
    const lId = params.get('listingId') || params.get('listing') || params.get('lid');
    const sellerEmail = params.get('seller');

    const pickFirst = () => { if (!selectedChat) setSelectedChat(chats[0] || null); };

    if (chatId) {
      const found = chats.find((c) => c.id === chatId);
      if (found) {
        setSelectedChat(found);
      } else {
        // Fallback: fetch chat directly by id if not in the preloaded list
        base44.entities.Chat.filter({ id: chatId }).then((res) => {
          if (Array.isArray(res) && res[0]) setSelectedChat(res[0]);
          else pickFirst();
        }).catch(() => pickFirst());
      }
    } else if (lId) {
      // Try match by listing id (+ optional seller email)
      let foundByListing = chats.find((c) => c.listingId === lId && (!sellerEmail || c.sellerId === sellerEmail || c.buyerId === sellerEmail));
      if (!foundByListing) foundByListing = chats.find((c) => c.listingId === lId);
      if (foundByListing) setSelectedChat(foundByListing);
      // otherwise PreChatComposer will handle creation
    } else {
      pickFirst();
    }
  }, [user, chats]);

  // Listing pre-chat focus when arriving from listing (without auto-creating chat)
  useEffect(() => {
    if (!user) return;
    if (landingListingId) setAutoFocusComposer(true);
  }, [user, landingListingId]);

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
  const { messages = [], loading: loadingMessages } = useMessages(selectedChat?.id);

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
            onSelectChat={(c) => setSelectedChat(c)}
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
              onBack={() => setSelectedChat(null)}
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
              onChatCreated={(chat) => setSelectedChat(chat)}
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