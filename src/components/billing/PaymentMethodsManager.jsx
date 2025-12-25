import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Trash2, Star, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SiCkJPVdLKlAY8B64CaZceL4okGRDJft2nI7SUv3pMDx8JeYEfZLDfYFzJAUG9dfzdzejqdeVV9YTJJMR1oa3JG00ZWyU2ny2');

function AddPaymentMethodForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [nickname, setNickname] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Save to database
    const res = await base44.functions.invoke('savePaymentMethod', {
      paymentMethodId: setupIntent.payment_method,
      nickname,
      isDefault
    });

    if (res.data.success) {
      toast.success('Metodo di pagamento salvato');
      onSuccess();
    } else {
      toast.error('Errore nel salvare il metodo');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <Input
        placeholder="Nome metodo (es. Carta principale)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        <span className="text-sm">Imposta come predefinito</span>
      </label>

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Salvataggio...' : 'Salva Metodo di Pagamento'}
      </Button>
    </form>
  );
}

export default function PaymentMethodsManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const queryClient = useQueryClient();

  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      return await base44.entities.PaymentMethod.filter({ isActive: true }, '-created_date');
    }
  });

  const addMethodMutation = useMutation({
    mutationFn: async (type) => {
      const res = await base44.functions.invoke('addPaymentMethod', { type });
      return res.data;
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowAddDialog(true);
    }
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (paymentMethodId) => {
      const res = await base44.functions.invoke('deletePaymentMethod', { paymentMethodId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Metodo di pagamento rimosso');
      queryClient.invalidateQueries(['paymentMethods']);
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (methodId) => {
      // Remove default from all
      const updates = paymentMethods.map(m => 
        base44.entities.PaymentMethod.update(m.id, { isDefault: m.id === methodId })
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      toast.success('Metodo predefinito aggiornato');
      queryClient.invalidateQueries(['paymentMethods']);
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Metodi di Pagamento</CardTitle>
          <Button onClick={() => addMethodMutation.mutate('card')}>
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Carta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">Caricamento...</div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nessun metodo di pagamento salvato</p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {method.type === 'card' 
                        ? `${method.cardBrand} •••• ${method.cardLast4}`
                        : `PayPal ${method.paypalEmail}`}
                    </span>
                    {method.isDefault && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Star className="w-3 h-3 mr-1" />
                        Predefinito
                      </Badge>
                    )}
                  </div>
                  {method.nickname && (
                    <div className="text-sm text-slate-500">{method.nickname}</div>
                  )}
                  {method.type === 'card' && (
                    <div className="text-xs text-slate-400">
                      Scadenza: {method.cardExpMonth}/{method.cardExpYear}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultMutation.mutate(method.id)}
                  >
                    Imposta predefinito
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Rimuovere questo metodo di pagamento?')) {
                      deleteMethodMutation.mutate(method.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Metodo di Pagamento</DialogTitle>
          </DialogHeader>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <AddPaymentMethodForm
                clientSecret={clientSecret}
                onSuccess={() => {
                  setShowAddDialog(false);
                  queryClient.invalidateQueries(['paymentMethods']);
                }}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}