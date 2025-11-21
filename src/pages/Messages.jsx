import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Languages, Zap, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [quickReplies, setQuickReplies] = useState([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [isTranslating, setIsTranslating] = useState({});
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
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

  const generateQuickReplies = async () => {
    if (!selectedChat || chatMessages.length === 0) return;
    
    setIsGeneratingReplies(true);
    try {
      const recentMessages = chatMessages.slice(-5).map(m => 
        `${m.senderId === user.email ? 'Tu' : 'Altro'}: ${m.text}${m.price ? ` (${m.price}€)` : ''}`
      ).join('\n');

      const listing = listings.find(l => l.id === selectedChat.listingId);
      const isSeller = selectedChat.sellerId === user.email;

      const prompt = `Sei un assistente che suggerisce risposte rapide per una chat di marketplace.

Contesto:
- Ruolo utente: ${isSeller ? 'Venditore' : 'Acquirente'}
- Annuncio: ${listing?.title} (${listing?.price}€)
- Stato trattativa: ${selectedChat.status}
- Ultimo prezzo proposto: ${selectedChat.lastPrice ? selectedChat.lastPrice + '€' : 'N/A'}

Ultimi messaggi:
${recentMessages}

Suggerisci 3-4 risposte rapide appropriate, cortesi e professionali in italiano. Considera il contesto della trattativa.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            replies: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setQuickReplies(result.replies || []);
    } catch (error) {
      console.error('Error generating replies:', error);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const translateMessage = async (messageId, text) => {
    setIsTranslating(prev => ({ ...prev, [messageId]: true }));
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Traduci questo messaggio in italiano. Se è già in italiano, lascialo invariato. Rispondi SOLO con la traduzione, nessun testo aggiuntivo.\n\nMessaggio: ${text}`,
      });

      setTranslatedMessages(prev => ({ ...prev, [messageId]: result }));
    } catch (error) {
      console.error('Error translating:', error);
    } finally {
      setIsTranslating(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const reportMutation = useMutation({
    mutationFn: async () => {
      const reportedUserId = selectedChat.sellerId === user.email ? selectedChat.buyerId : selectedChat.sellerId;
      
      await base44.entities.Report.create({
        reporterId: user.email,
        reportedUserId,
        chatId: selectedChat.id,
        reason: reportReason,
        description: reportDescription
      });

      await base44.entities.Notification.create({
        userId: 'admin@zazarap.com',
        type: 'status_update',
        title: '⚠️ Nuova segnalazione',
        message: `${user.email} ha segnalato ${reportedUserId} per: ${reportReason}`,
        linkUrl: '/MarketplaceDashboard',
        relatedId: selectedChat.id
      });
    },
    onSuccess: () => {
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
      alert('Segnalazione inviata. Il team la esaminerà al più presto.');
    }
  });

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
                  <div>
                    <CardTitle>
                      {listings.find(l => l.id === selectedChat.listingId)?.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[selectedChat.status]}>{selectedChat.status}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowReportDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="zaza-chat-container mb-20">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={msg.senderId === user.email ? 'zaza-msg-right' : 'zaza-msg-left'}
                    >
                      <p className="text-sm">
                        {translatedMessages[msg.id] || msg.text}
                      </p>
                      {msg.price && (
                        <p className="mt-1">
                          <span className="zaza-price-tag">{msg.price} €</span>
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs opacity-70">
                          {format(new Date(msg.created_date), 'dd/MM/yy HH:mm')}
                        </p>
                        {msg.senderId !== user.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => translateMessage(msg.id, msg.text)}
                            disabled={isTranslating[msg.id]}
                            className="h-6 px-2 text-xs"
                          >
                            <Languages className="h-3 w-3 mr-1" />
                            {isTranslating[msg.id] ? '...' : translatedMessages[msg.id] ? 'Originale' : 'Traduci'}
                          </Button>
                        )}
                      </div>
                      {translatedMessages[msg.id] && (
                        <p className="text-xs opacity-60 mt-1 italic">Originale: {msg.text}</p>
                      )}
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

                {quickReplies.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {quickReplies.map((reply, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setMessageText(reply)}
                        className="text-xs"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {reply.substring(0, 40)}...
                      </Button>
                    ))}
                  </div>
                )}

                <div className="zaza-chat-inputbox">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateQuickReplies}
                    disabled={isGeneratingReplies}
                    className="mr-2"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
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