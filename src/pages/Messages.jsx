import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import PaymentShippingModal from '../components/marketplace/PaymentShippingModal';
import ReportListingModal from '../components/ReportListingModal';
import { useLanguage } from '../components/LanguageProvider';

export default function Messages() {
  const { t } = useLanguage();
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const queryClient = useQueryClient();

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-updatedAt'),
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const { data: chatMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['chatMessages', selectedChat?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ chatId: selectedChat.id }, 'created_date'),
    enabled: !!selectedChat,
    refetchInterval: 3000, // Poll every 3 seconds for real-time messages
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  // Filter chats where user is buyer or seller
  const myChats = chats.filter(
    c => c.buyerId === user?.email || c.sellerId === user?.email
  );

  // Get current listing
  const currentListing = listings.find(l => l.id === selectedChat?.listingId);

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    queryClient.invalidateQueries({ queryKey: ['chatMessages', chat.id] });
  };

  // Loading state
  if (chatsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d62828]"></div>
      </div>
    );
  }

  // Mobile: show only sidebar or chat
  if (isMobileView) {
    if (selectedChat) {
      return (
        <div className="h-[calc(100vh-140px)]">
          <ChatWindow
            chat={selectedChat}
            messages={chatMessages}
            user={user}
            listing={currentListing}
            onBack={() => setSelectedChat(null)}
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
      <div className="h-[calc(100vh-140px)]">
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
    <div className="py-6">
      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-180px)]">
        {/* Sidebar */}
        <div className="col-span-1">
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
        <div className="col-span-2">
          {selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              messages={chatMessages}
              user={user}
              listing={currentListing}
              onBack={() => setSelectedChat(null)}
              onOpenPayment={() => setShowPaymentModal(true)}
              onReport={() => setShowReportModal(true)}
            />
          ) : (
            <div className="h-full bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">{t('selectChat')}</p>
              <p className="text-sm mt-2">Seleziona una chat per iniziare</p>
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