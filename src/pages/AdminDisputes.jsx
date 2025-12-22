import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminDisputes() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date'),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list(),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, status, resolution, notes }) => {
      await base44.entities.Dispute.update(disputeId, {
        status,
        resolution,
        adminNotes: notes
      });

      const dispute = disputes.find(d => d.id === disputeId);
      
      // Notifica entrambe le parti
      await base44.entities.Notification.create({
        userId: dispute.reporterId,
        type: 'status_update',
        title: '⚖️ Dispute Risolta',
        message: `La tua dispute è stata risolta. Decisione: ${resolution}`,
        linkUrl: '/DisputeCenter',
        relatedId: disputeId
      });

      await base44.entities.Notification.create({
        userId: dispute.respondentId,
        type: 'status_update',
        title: '⚖️ Dispute Risolta',
        message: `Una dispute contro di te è stata risolta. Decisione: ${resolution}`,
        linkUrl: '/DisputeCenter',
        relatedId: disputeId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute risolta');
      setSelectedDispute(null);
      setResolution('');
      setAdminNotes('');
    }
  });

  if (user?.role !== 'admin') {
    return <div className="py-8 text-center">{t('accessDenied')}</div>;
  }

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800'
  };

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">{t('admin.disputeManagement')}</h2>

      <div className="grid grid-cols-1 gap-4">
        {disputes.map(dispute => {
          const chat = chats.find(c => c.id === dispute.chatId);
          const listing = listings.find(l => l.id === chat?.listingId);
          
          return (
            <Card key={dispute.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{listing?.title}</h3>
                    <p className="text-sm text-slate-600">
                      Tipo: {dispute.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-slate-500">
                      Da: {dispute.reporterId} | Contro: {dispute.respondentId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(dispute.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge className={statusColors[dispute.status]}>
                    {dispute.status}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-semibold mb-1">Descrizione:</p>
                  <p className="text-sm text-slate-700">{dispute.description}</p>
                </div>

                {dispute.evidence?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold mb-1">Prove allegate:</p>
                    <div className="flex gap-2">
                      {dispute.evidence.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Evidence ${i+1}`} className="w-20 h-20 object-cover rounded" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {dispute.status === 'open' || dispute.status === 'under_review' ? (
                  <div className="space-y-3 mt-4 p-4 bg-slate-50 rounded">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('admin.supportReplyTitle')}</label>
                      <Textarea
                        placeholder="Descrivi la decisione presa..."
                        value={selectedDispute === dispute.id ? resolution : ''}
                        onChange={(e) => {
                          setSelectedDispute(dispute.id);
                          setResolution(e.target.value);
                        }}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('adminOnly')}</label>
                      <Textarea
                        placeholder="Note interne..."
                        value={selectedDispute === dispute.id ? adminNotes : ''}
                        onChange={(e) => {
                          setSelectedDispute(dispute.id);
                          setAdminNotes(e.target.value);
                        }}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => resolveDisputeMutation.mutate({
                          disputeId: dispute.id,
                          status: 'under_review',
                          resolution: resolution || 'In corso di revisione',
                          notes: adminNotes
                        })}
                        variant="outline"
                        size="sm"
                      >
                        {t('admin.moderation.pending')}
                      </Button>
                      <Button
                        onClick={() => resolveDisputeMutation.mutate({
                          disputeId: dispute.id,
                          status: 'resolved',
                          resolution,
                          notes: adminNotes
                        })}
                        disabled={!resolution}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {t('action.resolved')}
                      </Button>
                      <Button
                        onClick={() => resolveDisputeMutation.mutate({
                          disputeId: dispute.id,
                          status: 'closed',
                          resolution: resolution || 'Chiusa senza azione',
                          notes: adminNotes
                        })}
                        size="sm"
                        variant="destructive"
                      >
                        Chiudi
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-semibold text-green-800 mb-1">Risoluzione:</p>
                    <p className="text-sm text-green-700">{dispute.resolution}</p>
                    {dispute.adminNotes && (
                      <>
                        <p className="text-sm font-semibold text-green-800 mt-2 mb-1">Note Admin:</p>
                        <p className="text-sm text-green-700">{dispute.adminNotes}</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {disputes.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          {t('admin.noDisputesFound')}
        </div>
      )}
    </div>
  );
}