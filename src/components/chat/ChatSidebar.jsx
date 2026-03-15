import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';
import { formatCurrency } from '@/components/utils/format';

const statusColors = {
  'in_attesa': 'bg-yellow-100 text-yellow-800',
  'accettata': 'bg-green-100 text-green-800',
  'rifiutata': 'bg-red-100 text-red-800',
  'completata': 'bg-blue-100 text-blue-800'
};

const statusEmoji = {
  'in_attesa': '⏳',
  'accettata': '✅',
  'rifiutata': '❌',
  'completata': '🎉'
};

function formatChatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return format(date, 'dd/MM');
  return format(date, 'dd/MM');
}

export default function ChatSidebar({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  user,
  searchTerm,
  onSearchChange 
}) {
  const { t, currentLanguage } = useLanguage();
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };

  const filteredChats = (chats || []).filter(chat => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      chat.listingTitle?.toLowerCase().includes(search) ||
      chat.buyerId?.toLowerCase().includes(search) ||
      chat.sellerId?.toLowerCase().includes(search) ||
      chat.lastMessage?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-[var(--z-primary)] to-[var(--z-primary-dark)]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('chats')}
        </h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={tr('searchPlaceholder','Cerca tra le chat...')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-50"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{tr('noChats','Nessuna chat')}</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSeller = chat.sellerId === user?.email;
            const otherUser = isSeller ? chat.buyerId : chat.sellerId;
            const unreadCount = isSeller ? chat.unreadSeller : chat.unreadBuyer;
            const isSelected = selectedChat?.id === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`w-full text-left p-3 border-b hover:bg-slate-50 transition-colors ${
                  isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar/Image */}
                  <div className="relative flex-shrink-0">
                    {chat.listingImage ? (
                      <img 
                        src={chat.listingImage} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm truncate">
                        {chat.listingTitle || tr('listing','Annuncio')}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {formatChatTime(chat.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">
                      {isSeller ? `${tr('buyer','Acquirente')}: ` : `${tr('seller','Venditore')}: `}
                      {otherUser?.split('@')[0]}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate flex-1 ${unreadCount > 0 ? 'font-semibold text-slate-700' : 'text-slate-400'}`}>
                        {statusEmoji[chat.status]} {chat.lastMessage || t('typeMessage')}
                      </p>
                      {chat.lastPrice && (
                        <span className="text-xs font-bold text-green-600 ml-2">
                          {formatCurrency(chat.lastPrice, currentLanguage)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}