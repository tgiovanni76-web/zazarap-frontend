import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminTickets() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date'),
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status, response }) => {
      const ticket = tickets.find(t => t.id === ticketId);
      
      await base44.entities.SupportTicket.update(ticketId, {
        status,
        adminResponse: response
      });

      if (response) {
        await base44.entities.Notification.create({
          userId: ticket.userId,
          type: 'status_update',
          title: '💬 Risposta Supporto',
          message: `Il supporto ha risposto al tuo ticket: "${ticket.subject}"`,
          linkUrl: '/CustomerSupport',
          relatedId: ticketId
        });

        await base44.integrations.Core.SendEmail({
          to: ticket.userId,
          subject: `${t('email.supportReplySubjectPrefix')}: ${ticket.subject}`,
          body: `${t('email.supportReplyBodyHeader')}\n\n${response}\n\n${t('email.supportReplyBodyFooter')}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket aggiornato');
      setSelectedTicket(null);
      setResponse('');
    }
  });

  if (user?.role !== 'admin') {
    return <div className="py-8 text-center">{t('accessDenied')}</div>;
  }

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800'
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">{t('admin.supportTickets')}</h2>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map(ticket => (
          <Card key={ticket.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{ticket.subject}</h3>
                  <p className="text-sm text-slate-600">
                    Da: {ticket.userId} | {ticket.category}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(ticket.created_date), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={priorityColors[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={statusColors[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-slate-700">{ticket.message}</p>
              </div>

              {ticket.adminResponse ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-green-800 mb-1">{t('admin.supportReplyTitle')}:</p>
                  <p className="text-sm text-green-700">{ticket.adminResponse}</p>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-slate-50 rounded">
                  <Textarea
                    placeholder="Scrivi la risposta..."
                    value={selectedTicket === ticket.id ? response : ''}
                    onChange={(e) => {
                      setSelectedTicket(ticket.id);
                      setResponse(e.target.value);
                    }}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateTicketMutation.mutate({
                        ticketId: ticket.id,
                        status: 'in_progress',
                        response: ''
                      })}
                      variant="outline"
                      size="sm"
                    >
                      In Corso
                    </Button>
                    <Button
                      onClick={() => updateTicketMutation.mutate({
                        ticketId: ticket.id,
                        status: 'resolved',
                        response
                      })}
                      disabled={!response}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Rispondi e Risolvi
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Nessun ticket trovato
        </div>
      )}
    </div>
  );
}