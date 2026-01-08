import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Send, Loader2, AlertCircle, CheckCircle2, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AIChatbot({ onClose }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ciao! 👋 Sono l\'assistente AI di Zazarap. Come posso aiutarti oggi?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [escalatedTicket, setEscalatedTicket] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('handleChatbotMessage', {
        conversationId,
        message: userMessage
      });

      if (response.data?.conversationId) {
        setConversationId(response.data.conversationId);
      }

      // Add AI response to UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data?.response || 'Mi dispiace, non ho capito. Puoi riformulare?',
        timestamp: new Date().toISOString()
      }]);

      // Handle escalation
      if (response.data?.shouldEscalate && response.data?.ticketId) {
        setEscalatedTicket(response.data.ticketId);
        toast.success('Ticket di supporto creato!');
      }

      // Update suggested actions
      if (response.data?.suggestedActions) {
        setSuggestedActions(response.data.suggestedActions);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Mi dispiace, si è verificato un errore. Per favore riprova.',
        timestamp: new Date().toISOString()
      }]);
      toast.error('Errore nella comunicazione');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistente AI
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-white/80 mt-1">Qui per aiutarti 24/7</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {escalatedTicket && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Ticket creato!</strong> Un operatore ti contatterà presto.
              <br />
              <span className="text-xs">ID: {escalatedTicket}</span>
            </AlertDescription>
          </Alert>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-slate-200'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-slate-600">AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <span className="text-sm text-slate-600">Sto pensando...</span>
              </div>
            </div>
          </div>
        )}

        {suggestedActions.length > 0 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Azioni suggerite:</p>
            {suggestedActions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(action)}
                className="w-full text-left justify-start text-sm"
              >
                {action}
              </Button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Scrivi il tuo messaggio..."
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Powered by AI • Disponibile 24/7
        </p>
      </div>
    </Card>
  );
}