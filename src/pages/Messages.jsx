import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list('-updatedAt'),
    enabled: !!user,
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages', selectedChat?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ chatId: selectedChat.id }, '-created_date'),
    enabled: !!selectedChat,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, price }) => {
      const message = await base44.entities.ChatMessage.create({
        chatId: selectedChat.id,
        senderId: user.email,
        text,
        price: price || undefined
      });

      await base44.entities.Chat.update(selectedChat.id, {
        lastMessage: text,
        lastPrice: price || selectedChat.lastPrice,
        updatedAt: new Date().toISOString()
      });

      // Notifica e email al destinatario
      const receiverId = selectedChat.sellerId === user.email ? selectedChat.buyerId : selectedChat.sellerId;
      const listing = listings.find(l => l.id === selectedChat.listingId);
      
      await base44.entities.Notification.create({
        userId: receiverId,
        type: price ? 'offer' : 'message',
        title: price ? 'Nuova offerta ricevuta' : 'Nuovo messaggio',
        message: price ? `Offerta di ${price} € per "${listing?.title}"` : `Nuovo messaggio per "${listing?.title}"`,
        linkUrl: '/Messages',
        relatedId: selectedChat.id
      });

      await base44.integrations.Core.SendEmail({
        to: receiverId,
        subject: price ? '💰 Nuova offerta ricevuta - Zazarap' : '💬 Nuovo messaggio - Zazarap',
        body: `Ciao!\n\n${price ? `Hai ricevuto un'offerta di ${price} € per "${listing?.title}".` : `Hai ricevuto un nuovo messaggio per "${listing?.title}".`}\n\nVisita Zazarap per rispondere: ${window.location.origin}/Messages\n\nGrazie,\nIl team di Zazarap`
      });

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setMessageText('');
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async () => {
      const text = `Accetto la tua offerta di ${selectedChat.lastPrice} €.`;
      
      await base44.entities.ChatMessage.create({
        chatId: selectedChat.id,
        senderId: user.email,
        text,
        price: selectedChat.lastPrice
      });

      await base44.entities.Chat.update(selectedChat.id, {
        status: 'accettata',
        lastMessage: text,
        updatedAt: new Date().toISOString()
      });

      // Notifica e email all'acquirente
      const listing = listings.find(l => l.id === selectedChat.listingId);
      
      await base44.entities.Notification.create({
        userId: selectedChat.buyerId,
        type: 'status_update',
        title: '✅ Offerta accettata!',
        message: `Il venditore ha accettato la tua offerta di ${selectedChat.lastPrice} € per "${listing?.title}"`,
        linkUrl: '/Messages',
        relatedId: selectedChat.id
      });

      await base44.integrations.Core.SendEmail({
        to: selectedChat.buyerId,
        subject: '✅ Offerta accettata - Zazarap',
        body: `Congratulazioni!\n\nIl venditore ha accettato la tua offerta di ${selectedChat.lastPrice} € per "${listing?.title}".\n\nPuoi ora contattare il venditore per finalizzare l'acquisto.\n\nVisita Zazarap: ${window.location.origin}/Messages\n\nGrazie,\nIl team di Zazarap`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const rejectOfferMutation = useMutation({
    mutationFn: async () => {
      const text = 'Mi dispiace, non posso accettare questa offerta.';
      
      await base44.entities.ChatMessage.create({
        chatId: selectedChat.id,
        senderId: user.email,
        text
      });

      await base44.entities.Chat.update(selectedChat.id, {
        status: 'rifiutata',
        lastMessage: text,
        updatedAt: new Date().toISOString()
      });

      // Notifica e email all'acquirente
      const listing = listings.find(l => l.id === selectedChat.listingId);
      
      await base44.entities.Notification.create({
        userId: selectedChat.buyerId,
        type: 'status_update',
        title: '❌ Offerta rifiutata',
        message: `Il venditore ha rifiutato la tua offerta per "${listing?.title}"`,
        linkUrl: '/Messages',
        relatedId: selectedChat.id
      });

      await base44.integrations.Core.SendEmail({
        to: selectedChat.buyerId,
        subject: 'Offerta rifiutata - Zazarap',
        body: `Ciao,\n\nIl venditore ha rifiutato la tua offerta per "${listing?.title}".\n\nPuoi fare una nuova proposta contattando il venditore.\n\nVisita Zazarap: ${window.location.origin}/Messages\n\nGrazie,\nIl team di Zazarap`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const counterOfferMutation = useMutation({
    mutationFn: async (price) => {
      const text = `La mia controproposta è di ${price} €.`;
      
      await base44.entities.ChatMessage.create({
        chatId: selectedChat.id,
        senderId: user.email,
        text,
        price
      });

      await base44.entities.Chat.update(selectedChat.id, {
        lastPrice: price,
        status: 'in_attesa',
        lastMessage: text,
        updatedAt: new Date().toISOString()
      });

      // Notifica e email all'acquirente
      const listing = listings.find(l => l.id === selectedChat.listingId);
      
      await base44.entities.Notification.create({
        userId: selectedChat.buyerId,
        type: 'offer',
        title: '🔄 Controproposta ricevuta',
        message: `Il venditore propone ${price} € per "${listing?.title}"`,
        linkUrl: '/Messages',
        relatedId: selectedChat.id
      });

      await base44.integrations.Core.SendEmail({
        to: selectedChat.buyerId,
        subject: '🔄 Controproposta ricevuta - Zazarap',
        body: `Ciao,\n\nIl venditore ha fatto una controproposta di ${price} € per "${listing?.title}".\n\nVisita Zazarap per rispondere: ${window.location.origin}/Messages\n\nGrazie,\nIl team di Zazarap`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setCounterPrice('');
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate({ text: messageText });
  };

  const handleCounterOffer = () => {
    if (!counterPrice || counterPrice <= 0) return;
    counterOfferMutation.mutate(parseFloat(counterPrice));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const myChats = chats.filter(
    c => c.buyerId === user.email || c.sellerId === user.email
  );

  const statusColors = {
    'in_attesa': 'bg-yellow-100 text-yellow-800',
    'accettata': 'bg-green-100 text-green-800',
    'rifiutata': 'bg-red-100 text-red-800'
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Messaggi e Trattative</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myChats.map((chat) => {
                const listing = listings.find(l => l.id === chat.listingId);
                const isSeller = chat.sellerId === user.email;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-indigo-50 border-2 border-indigo-600' : 'hover:bg-slate-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{listing?.title || 'Annuncio'}</p>
                        <p className="text-xs text-slate-600">{isSeller ? 'Acquirente' : 'Venditore'}: {isSeller ? chat.buyerId : chat.sellerId}</p>
                        {chat.lastPrice && (
                          <p className="text-xs font-bold text-red-600">Ultima offerta: {chat.lastPrice} €</p>
                        )}
                      </div>
                      <Badge className={statusColors[chat.status]}>{chat.status}</Badge>
                    </div>
                  </button>
                );
              })}
              {myChats.length === 0 && (
                <p className="text-slate-500 text-sm">Nessuna chat</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedChat ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>
                    {listings.find(l => l.id === selectedChat.listingId)?.title}
                  </CardTitle>
                  <Badge className={statusColors[selectedChat.status]}>{selectedChat.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="zaza-chat-container mb-20">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={msg.senderId === user.email ? 'zaza-msg-right' : 'zaza-msg-left'}
                    >
                      <p className="text-sm">{msg.text}</p>
                      {msg.price && (
                        <p className="mt-1">
                          <span className="zaza-price-tag">{msg.price} €</span>
                        </p>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.created_date), 'dd/MM/yy HH:mm')}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedChat.status === 'in_attesa' && selectedChat.sellerId === user.email && selectedChat.lastPrice && (
                  <div className="zaza-offer-buttons mb-4">
                    <button
                      onClick={() => acceptOfferMutation.mutate()}
                      className="zaza-btn-accept"
                    >
                      Accetta
                    </button>
                    <button
                      onClick={() => rejectOfferMutation.mutate()}
                      className="zaza-btn-reject"
                    >
                      Rifiuta
                    </button>
                    <button
                      onClick={() => {
                        const price = prompt('Inserisci controproposta (€):');
                        if (price && !isNaN(price) && price > 0) {
                          counterOfferMutation.mutate(parseFloat(price));
                        }
                      }}
                      className="zaza-btn-counter"
                    >
                      Controproposta
                    </button>
                  </div>
                )}

                <div className="zaza-chat-inputbox">
                  <Input
                    placeholder="Scrivi un messaggio..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    Invia
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seleziona una chat</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}