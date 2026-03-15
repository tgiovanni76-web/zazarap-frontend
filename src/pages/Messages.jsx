import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Bell } from 'lucide-react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import PaymentShippingModal from '../components/marketplace/PaymentShippingModal';
import ReportListingModal from '../components/ReportListingModal';
import { useLanguage } from '../components/LanguageProvider';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function Messages() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const chatIdFromUrl = urlParams.get('chatId');
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const queryClient = useQueryClient();

  const handleSeedDemo = async () => {
    try {
      await base44.functions.invoke('seedDemoData', {});
      await queryClient.invalidateQueries({ queryKey: ['chats'] });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Dati demo creati');
    } catch (e) {
      toast.error('Errore creazione dati demo');
    }
  };

  // Handle responsive view (mobile + tablet stacked layout)
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Do not lock global scroll; constrain scrolling to internal panels via fixed heights
  useEffect(() => { return () => {}; }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-updatedAt'),
    enabled: !!user,
  });

  // Real-time subscription for chats
  useEffect(() => {
    if (!user) return;

    const unsubscribe = base44.entities.Chat.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    });

    return () => unsubscribe();
  }, [user, queryClient]);

  const { data: chatMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', selectedChat?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ chatId: selectedChat.id }, 'created_date'),
    enabled: !!selectedChat,
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!selectedChat?.id) return;

    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.chatId === selectedChat.id) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedChat.id] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    });

    return () => unsubscribe();
  }, [selectedChat?.id, queryClient]);

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  // Filter chats where user is buyer or seller
  const myChats = chats.filter(
    c => c.buyerId === user?.email || c.sellerId === user?.email
  );

  // Auto-select chat from URL parameter
  useEffect(() => {
    if (chatIdFromUrl && myChats.length > 0 && !selectedChat) {
      const chatFromUrl = myChats.find(c => c.id === chatIdFromUrl);
      if (chatFromUrl) {
        setSelectedChat(chatFromUrl);
      }
    }
  }, [chatIdFromUrl, myChats, selectedChat]);

  // Real-time notification for new messages
  useEffect(() => {
    if (!user || !myChats.length) return;
    
    const totalUnread = myChats.reduce((sum, chat) => {
      const unread = chat.sellerId === user.email ? chat.unreadSeller : chat.unreadBuyer;
      return sum + (unread || 0);
    }, 0);

    if (totalUnread > previousUnreadCount && previousUnreadCount > 0) {
      // Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQsAGIrZ7d+TTAAAFoje7t+PQgAAGYri8eCQPwAAHYjc7t+PPwAAJo/g8uCXRwUYKYnf8uKdSwcZKYrf8uKdSwYYJ4jd7+CaRwQQG4HW6tuPOwAAE4HU59iJNQAAFYPV59iKNgAAGovc8N+URQghL5Pj8uSiVQ4hL5Pj8+OiVQ0gLZHg8N+dUA0XJYHW6deIPwAAD3vO4dF+MgAAD3vO4dB+MQAAEHzP4tGAMwQYJYfb7dyLQgQYJYfa7NyKQQMWI4TW6NaCOwAADnrM3857LwAADnrM3817LwAAD3vN3897MAMRHHzO39B/MQMRHHzO4NB/MgQUIIPU5dV+NgQUIIPU5dZ/NwUYJovc7t2MQgUYJovc7t2MQgUYJYrb7NyKQAMVIoLT5NR7NAISH4HT5NZ9NgUYJ4zd7t6NQwUZJo3f7+CORAUVJY3e7t+MQQUUJ4vb7NuIPwMRHYPV5tV8MgQUIYXX6NeBOQUYJ47f7+GOQwUYJ4/g7+KPRAUZKJHi8eSSRwwkM5Pk8+WlWRAtOJro9OuwYxc1QaXz+fK8bx49Sq/4+vbEdiRFVLn+/PrMfylLXsAA/v3UhS5RY8kE/v7ZijRYas4J/v/dkDlecc0M/v/fkztkds8Q//');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}
      
      toast.info(t('new') + ' ' + t('messages') + '!', {
        icon: <Bell className="h-4 w-4" />,
        duration: 3000,
      });
    }
    
    setPreviousUnreadCount(totalUnread);
  }, [myChats, user, previousUnreadCount]);

  // Notification for new messages in current chat (no global scroll)
  useEffect(() => {
    if (chatMessages.length > previousMessageCount && previousMessageCount > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage && lastMessage.senderId !== user?.email) {
        // Let ChatWindow handle internal scroll; avoid touching global
      }
    }
    setPreviousMessageCount(chatMessages.length);
  }, [chatMessages, previousMessageCount, user]);

  // Get current listing
  const currentListing = listings.find(l => l.id === selectedChat?.listingId);

  // Handle chat selection
  const handleSelectChat = (chat) => {
    const container = document.getElementById('main-content');
    const prevScroll = container ? container.scrollTop : null;

    setSelectedChat(chat);
    queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });

    if (prevScroll !== null) {
      requestAnimationFrame(() => {
        const el = document.getElementById('main-content');
        if (el) el.scrollTop = prevScroll;
      });
    }
  };

  // Loading state
  if (chatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d62828]"></div>
      </div>
    );
  }

  // Gate unauthenticated users: require login to use messages
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('loginOrRegister')}</h1>
        <p className="text-slate-600 mb-6">Per inviare o leggere i messaggi devi effettuare l'accesso.</p>
        <button
          className="bg-[var(--z-primary)] text-white px-5 py-2 rounded-lg"
          onClick={() => base44.auth.redirectToLogin(createPageUrl('Messages'))}
        >
          {t('loginOrRegister')}
        </button>
      </div>
    );
  }

  // Mobile: show only sidebar or chat
  if (isMobileView) {
    if (selectedChat) {
      return (
            <div className="h-full min-h-0 overflow-hidden">
          <ChatWindow
            chat={selectedChat}
            messages={chatMessages}
            user={user}
            listing={currentListing}
            onBack={() => {
              const el = document.getElementById('main-content');
              const prev = el ? el.scrollTop : null;
              setSelectedChat(null);
              if (prev !== null) requestAnimationFrame(() => {
                const c = document.getElementById('main-content');
                if (c) c.scrollTop = prev;
              });
            }}
            onOpenPayment={() => setShowPaymentModal(true)}
            onReport={() => setShowReportModal(true)}
          />

          {showPaymentModal && (
            <PaymentShippingModal
              chat={selectedChat}
              listing={currentListing}
              onClose={() => setShowPaymentModal(false)}
            />
          )}

          {showReportModal && (
            <ReportListingModal
              open={showReportModal}
              onClose={() => setShowReportModal(false)}
              listingId={selectedChat.listingId}
              listingTitle={currentListing?.title}
              sellerEmail={selectedChat.sellerId === user.email ? selectedChat.buyerId : selectedChat.sellerId}
              user={user}
            />
          )}
        </div>
      );
    }

    return (
      <div className="h-full min-h-0 overflow-hidden">
        {myChats.length === 0 && (
          <div className="p-3">
            <Button onClick={handleSeedDemo} className="w-full bg-[var(--z-primary)] hover:bg-[var(--z-primary-dark)]">
              Crea dati demo
            </Button>
          </div>
        )}
        <ChatSidebar
          chats={myChats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          user={user}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
    );
  }

  // Desktop: show both sidebar and chat
  return (
    <div className="py-0 md:py-6 h-full min-h-0 overflow-hidden">
      <div className="grid grid-cols-3 gap-4 h-full min-h-0 pb-2 overflow-hidden">
        {/* Sidebar */}
        <div className="col-span-1 h-full min-h-0 overflow-y-auto overscroll-contain">
          <ChatSidebar
            chats={myChats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            user={user}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Chat Window */}
        <div className="col-span-2 h-full min-h-0 overflow-hidden">
          {/* The ChatWindow itself manages internal scrolling for messages; ensure no bleed */}
        
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={chatMessages}
              user={user}
              listing={currentListing}
              onBack={() => {
                const el = document.getElementById('main-content');
                const prev = el ? el.scrollTop : null;
                setSelectedChat(null);
                if (prev !== null) requestAnimationFrame(() => {
                  const c = document.getElementById('main-content');
                  if (c) c.scrollTop = prev;
                });
              }}
              onOpenPayment={() => setShowPaymentModal(true)}
              onReport={() => setShowReportModal(true)}
            />
          ) : (
            <div className="h-full bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">{t('selectChat')}</p>
              <p className="text-sm mt-2">{t('selectChat')}</p>
              {myChats.length === 0 && (
                <Button onClick={handleSeedDemo} className="mt-4 bg-[var(--z-primary)] hover:bg-[var(--z-primary-dark)]">
                  Crea dati demo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && selectedChat && (
        <PaymentShippingModal
          chat={selectedChat}
          listing={currentListing}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showReportModal && selectedChat && (
        <ReportListingModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          listingId={selectedChat.listingId}
          listingTitle={currentListing?.title}
          sellerEmail={selectedChat.sellerId === user.email ? selectedChat.buyerId : selectedChat.sellerId}
          user={user}
        />
      )}
    </div>
  );
}