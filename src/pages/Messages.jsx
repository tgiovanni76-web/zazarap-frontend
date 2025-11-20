import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date'),
    enabled: !!user,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const myMessages = messages.filter(
    m => m.sender_email === user.email || m.receiver_email === user.email
  );

  const conversations = {};
  myMessages.forEach(msg => {
    const otherUser = msg.sender_email === user.email ? msg.receiver_email : msg.sender_email;
    const key = `${msg.listing_id}-${otherUser}`;
    if (!conversations[key]) {
      conversations[key] = {
        listing_id: msg.listing_id,
        other_user: otherUser,
        messages: [],
        unread: 0
      };
    }
    conversations[key].messages.push(msg);
    if (!msg.read && msg.receiver_email === user.email) {
      conversations[key].unread++;
    }
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      listing_id: selectedConversation.listing_id,
      sender_email: user.email,
      receiver_email: selectedConversation.other_user,
      content: messageText,
      read: false
    });
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Messaggi</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversazioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(conversations).map((conv, idx) => {
                const listing = listings.find(l => l.id === conv.listing_id);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedConversation(conv)}
                    className="w-full text-left p-3 rounded hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{listing?.title || 'Annuncio'}</p>
                        <p className="text-xs text-slate-600">{conv.other_user}</p>
                      </div>
                      {conv.unread > 0 && (
                        <Badge variant="destructive" className="text-xs">{conv.unread}</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
              {Object.keys(conversations).length === 0 && (
                <p className="text-slate-500 text-sm">Nessun messaggio</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedConversation ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {listings.find(l => l.id === selectedConversation.listing_id)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {selectedConversation.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender_email === user.email
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.created_date), 'dd/MM/yy HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Scrivi un messaggio..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                    rows={2}
                  />
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Seleziona una conversazione</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}