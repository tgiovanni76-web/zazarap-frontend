import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

export default function InvoicesList() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      return await base44.entities.Invoice.filter({}, '-created_date');
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (transactionId) => {
      const res = await base44.functions.invoke('generateInvoice', { transactionId });
      return res.data;
    },
    onSuccess: (blob) => {
      toast.success('Fattura generata');
    }
  });

  const downloadInvoice = async (transactionId, invoiceNumber) => {
    try {
      const response = await fetch('/functions/generateInvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      toast.error('Errore nel download della fattura');
    }
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800',
    issued: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fatture</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Caricamento...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nessuna fattura disponibile</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-slate-600">
                      {format(new Date(invoice.issueDate), 'dd MMM yyyy', { locale: it })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-lg">€{invoice.amount.toFixed(2)}</div>
                    <Badge className={statusColors[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(invoice.transactionId, invoice.invoiceNumber)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}