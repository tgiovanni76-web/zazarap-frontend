import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, Zap, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function PrioritySupport({ user }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets', user?.email],
    queryFn: () => base44.entities.SupportTicket.filter({ email: user.email }, '-created_date', 10),
    enabled: !!user
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.SupportTicket.create({
        ...data,
        name: user.full_name || user.email,
        email: user.email,
        status: 'open',
        priority: 'high' // Sellers get priority
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setSubject('');
      setCategory('');
      setMessage('');
      toast.success('Ticket creato! Ti risponderemo a breve');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !category || !message) {
      toast.error('Compila tutti i campi');
      return;
    }

    createTicketMutation.mutate({
      subject,
      category,
      message
    });
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const avgResponseTime = '< 2 ore';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">🎯 Supporto prioritario venditore</h3>
        <Badge className="bg-yellow-100 text-yellow-800">
          <Zap className="h-3 w-3 mr-1" />
          Priorità alta
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Tempo risposta medio</p>
                <p className="text-xl font-bold">{avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Ticket aperti</p>
                <p className="text-xl font-bold">{openTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Ticket risolti</p>
                <p className="text-xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Apri nuovo ticket prioritario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Oggetto</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Es: Problema con pagamento, domanda su spedizioni..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Problema tecnico</SelectItem>
                  <SelectItem value="pagamenti">Pagamenti e commissioni</SelectItem>
                  <SelectItem value="spedizioni">Spedizioni</SelectItem>
                  <SelectItem value="moderazione">Moderazione annunci</SelectItem>
                  <SelectItem value="account">Gestione account</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Messaggio</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Descrivi il tuo problema o la tua domanda..."
                rows={5}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-yellow-600 hover:bg-yellow-700"
              disabled={createTicketMutation.isPending}
            >
              <Zap className="h-4 w-4 mr-2" />
              Invia ticket prioritario
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>I tuoi ticket</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">Nessun ticket aperto</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{ticket.subject}</p>
                      <p className="text-sm text-slate-600">{ticket.category}</p>
                    </div>
                    <Badge className={
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {ticket.status === 'open' ? 'Aperto' :
                       ticket.status === 'in_progress' ? 'In lavorazione' :
                       'Risolto'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{ticket.message}</p>
                  <p className="text-xs text-slate-500">
                    Creato il {new Date(ticket.created_date).toLocaleDateString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}