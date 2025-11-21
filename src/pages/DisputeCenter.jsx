import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DisputeCenter() {
  const [selectedChat, setSelectedChat] = useState('');
  const [disputeType, setDisputeType] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['myChats'],
    queryFn: () => base44.entities.Chat.list('-updatedAt'),
    enabled: !!user,
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => base44.entities.Dispute.list('-created_date'),
    enabled: !!user,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const createDisputeMutation = useMutation({
    mutationFn: async () => {
      const chat = chats.find(c => c.id === selectedChat);
      const respondent = chat.sellerId === user.email ? chat.buyerId : chat.sellerId;

      return base44.entities.Dispute.create({
        chatId: selectedChat,
        reporterId: user.email,
        respondentId: respondent,
        type: disputeType,
        description,
        evidence: uploadedFiles,
        status: 'open'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute aperta. Esamineremo entro 48 ore.');
      setSelectedChat('');
      setDisputeType('');
      setDescription('');
      setUploadedFiles([]);
    }
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const urls = [];
    
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      urls.push(result.file_url);
    }
    
    setUploadedFiles([...uploadedFiles, ...urls]);
    toast.success(`${files.length} file caricati`);
  };

  const myChats = chats.filter(c => c.buyerId === user?.email || c.sellerId === user?.email);
  const myDisputes = disputes.filter(d => d.reporterId === user?.email || d.respondentId === user?.email);

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-800'
  };

  if (!user) {
    return <div className="py-8 text-center">Effettua il login</div>;
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Centro Dispute e Reclami</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Apri una Dispute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Transazione</label>
              <Select value={selectedChat} onValueChange={setSelectedChat}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona transazione" />
                </SelectTrigger>
                <SelectContent>
                  {myChats.map(chat => {
                    const listing = listings.find(l => l.id === chat.listingId);
                    return (
                      <SelectItem key={chat.id} value={chat.id}>
                        {listing?.title} - {format(new Date(chat.created_date), 'dd/MM/yy')}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo di Problema</label>
              <Select value={disputeType} onValueChange={setDisputeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_issue">Problema Pagamento</SelectItem>
                  <SelectItem value="item_not_received">Prodotto Non Ricevuto</SelectItem>
                  <SelectItem value="item_not_as_described">Prodotto Non Conforme</SelectItem>
                  <SelectItem value="refund_request">Richiesta Rimborso</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Descrizione Dettagliata</label>
              <Textarea
                placeholder="Spiega il problema in dettaglio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prove (foto, screenshot)</label>
              <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    Carica foto o documenti (max 5 file)
                  </p>
                </label>
              </div>
              {uploadedFiles.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {uploadedFiles.length} file caricati
                </p>
              )}
            </div>

            <Button
              onClick={() => createDisputeMutation.mutate()}
              disabled={!selectedChat || !disputeType || !description}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Apri Dispute
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Le Mie Dispute</h3>
          {myDisputes.map(dispute => {
            const chat = chats.find(c => c.id === dispute.chatId);
            const listing = listings.find(l => l.id === chat?.listingId);
            
            return (
              <Card key={dispute.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">{listing?.title}</h4>
                      <p className="text-sm text-slate-600">
                        {dispute.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Badge className={statusColors[dispute.status]}>
                      {dispute.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm mb-3">{dispute.description}</p>
                  
                  {dispute.resolution && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-semibold text-green-800 mb-1">Risoluzione:</p>
                      <p className="text-sm text-green-700">{dispute.resolution}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-slate-500 mt-2">
                    Aperta il {format(new Date(dispute.created_date), 'dd/MM/yyyy')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
          
          {myDisputes.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                Nessuna dispute aperta
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}