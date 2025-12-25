import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProviderV2';

export default function CustomerSupportV2() {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets', user?.email],
    queryFn: () => base44.entities.SupportTicket.filter({ userId: user.email }, '-created_date'),
    enabled: !!user,
  });

  const createTicketMutation = useMutation({
    mutationFn: () => base44.entities.SupportTicket.create({
      userId: user.email,
      subject,
      message,
      category,
      status: 'open',
      priority: 'medium'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      toast.success(t('support.ticketCreated'));
      setSubject('');
      setMessage('');
      setCategory('');
    }
  });

  const statusConfig = {
    open: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: t('support.status.open') },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: t('support.status.inProgress') },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: t('support.status.resolved') },
    closed: { color: 'bg-slate-100 text-slate-800', icon: CheckCircle, label: t('support.status.closed') }
  };

  if (!user) {
    return <div className="py-8 text-center">{t('support.pleaseLogin')}</div>;
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t('support.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('support.openTicket')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('support.subject')}</label>
              <Input
                placeholder={t('support.subjectPlaceholder')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('support.category')}</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">{t('support.cat.technical')}</SelectItem>
                  <SelectItem value="payment">{t('support.cat.payment')}</SelectItem>
                  <SelectItem value="account">{t('support.cat.account')}</SelectItem>
                  <SelectItem value="listing">{t('support.cat.listing')}</SelectItem>
                  <SelectItem value="other">{t('support.cat.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('support.message')}</label>
              <Textarea
                placeholder={t('support.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <Button
              onClick={() => createTicketMutation.mutate()}
              disabled={!subject || !message || !category}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('support.submit')}
            </Button>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>{t('support.responseTime.label')}:</strong> {t('support.responseTime.value')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">{t('support.myTickets')}</h3>
          {tickets.map(ticket => {
            const config = statusConfig[ticket.status];
            const Icon = config.icon;
            
            return (
              <Card key={ticket.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{ticket.subject}</h4>
                      <p className="text-xs text-slate-500">
                        {format(new Date(ticket.created_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-3">{ticket.message}</p>
                  
                  {ticket.adminResponse && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-semibold text-green-800 mb-1">{t('support.adminResponse')}:</p>
                      <p className="text-sm text-green-700">{ticket.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {tickets.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('support.noTickets')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}