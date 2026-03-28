import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useMessages } from '@/hooks/useMessages';

export default function MessagesV2() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [initialOfferFlag, setInitialOfferFlag] = useState(false);

  // Read URL params (chatId + openOffer)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openOffer = params.get('openOffer') === '1' || params.get('offer') === '1';
    setInitialOfferFlag(openOffer);
  }, []);

  // Current user (reuse global cache key)
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  // Chats for current user (RLS already restricts)
  const { data: chats = [], isLoading: loadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      // Most recent first
      const list = await base44.entities.Chat.list('-updated_date');
      return Array.isArray(list) ? list : [];
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
    const chatId = params.get('chatId');
    if (chatId) {
      const found = chats.find((c) => c.id === chatId);
      setSelectedChat(found || chats[0]);
    } else if (!selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [user, chats]);

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
        <div className="text-slate-600">Bitte anmelden…</div>
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
    <div className="h-[calc(100vh- var(--header-height,64px))] min-h-[60vh] -mx-1 md:mx-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-full">
        {/* Sidebar */}
        <div className="md:col-span-1 h-full min-h-0">
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
        <div className="md:col-span-2 h-full min-h-0">
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
            />
          ) : (
            <div className="h-full grid place-items-center bg-white rounded-xl border">
              <div className="text-slate-500 text-sm">Seleziona una chat per iniziare</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}