import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Truck, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { checkAntifraud, checkRateLimit } from './AntifraudCheck';

export default function PaymentShippingModal({ chat, listing, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [shippingMethod, setShippingMethod] = useState('ritiro_persona');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fraudCheck, setFraudCheck] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const completePurchaseMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);

      // Anti-fraud checks
      const rateLimit = checkRateLimit(user.email, 'purchase', 3, 60000);
      if (!rateLimit.allowed) {
        throw new Error(rateLimit.message);
      }

      const antifraud = await checkAntifraud(user, { 
        amount: totalAmount 
      });
      
      setFraudCheck(antifraud);
      
      if (!antifraud.passed) {
        throw new Error(antifraud.errors[0]?.message || 'Controllo antifrode fallito');
      }

      // Crea pagamento con escrow
      const payment = await base44.entities.Payment.create({
        chatId: chat.id,
        buyerId: chat.buyerId,
        sellerId: chat.sellerId,
        amount: chat.lastPrice || listing.price,
        method: paymentMethod,
        status: paymentMethod === 'paypal' ? 'held_in_escrow' : 'completed',
        paypalOrderId: paymentMethod === 'paypal' ? `ORDER_${Date.now()}` : undefined,
        escrowReleaseDate: paymentMethod === 'paypal' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined
      });

      // Crea spedizione
      const shipping = await base44.entities.Shipping.create({
        chatId: chat.id,
        method: shippingMethod,
        address: shippingAddress,
        status: shippingMethod === 'ritiro_persona' ? 'delivered' : 'pending',
        cost: shippingMethod === 'ritiro_persona' ? 0 : shippingMethod === 'corriere' ? 10 : 5,
        carrier: shippingMethod === 'corriere' ? 'DHL' : shippingMethod === 'posta' ? 'Poste Italiane' : undefined,
        estimatedDelivery: shippingMethod !== 'ritiro_persona' ? 
          new Date(Date.now() + (shippingMethod === 'corriere' ? 2 : 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          undefined
      });

      // Aggiorna annuncio
      await base44.entities.Listing.update(listing.id, {
        status: 'sold'
      });

      // Aggiorna stato chat
      await base44.entities.Chat.update(chat.id, {
        status: 'pagamento_in_escrow',
        lastMessage: paymentMethod === 'paypal' ? 'Pagamento in escrow - in attesa di spedizione' : 'Pagamento completato',
        updatedAt: new Date().toISOString()
      });

      // Notifica venditore
      await base44.entities.Notification.create({
        userId: chat.sellerId,
        type: 'status_update',
        title: paymentMethod === 'paypal' ? '💰 Fondi in Escrow' : '✅ Vendita completata!',
        message: paymentMethod === 'paypal' ? 
          `Fondi per "${listing.title}" trattenuti in sicurezza. Spedisci l'articolo per riceverli.` :
          `Hai venduto "${listing.title}" per ${chat.lastPrice || listing.price}€`,
        linkUrl: '/MySales',
        relatedId: chat.id
      });

      // Notifica acquirente
      await base44.entities.Notification.create({
        userId: chat.buyerId,
        type: 'status_update',
        title: '🔒 Pagamento Protetto',
        message: paymentMethod === 'paypal' ?
          `I tuoi fondi sono trattenuti in sicurezza fino alla consegna di "${listing.title}"` :
          `Acquisto di "${listing.title}" completato`,
        linkUrl: '/MyPurchases',
        relatedId: chat.id
      });

      return { payment, shipping };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      
      toast.success('Acquisto completato con successo!');
      onClose();
    },
    onError: () => {
      setIsProcessing(false);
      toast.error('Errore durante il pagamento');
    }
  });

  const shippingCosts = {
    ritiro_persona: 0,
    corriere: 10,
    posta: 5
  };

  const totalAmount = (chat.lastPrice || listing.price) + shippingCosts[shippingMethod];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Completa l'Acquisto</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border-2 border-red-200 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
            <p className="text-2xl font-bold text-red-600">{chat.lastPrice || listing.price}€</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-red-600" />
              <h3 className="font-bold">Metodo di Pagamento</h3>
            </div>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">💳 PayPal</SelectItem>
                <SelectItem value="contanti">💵 Contanti</SelectItem>
                <SelectItem value="bonifico">🏦 Bonifico Bancario</SelectItem>
              </SelectContent>
            </Select>
            {paymentMethod === 'paypal' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 font-semibold mb-2">🔒 Pagamento Protetto con Escrow</p>
                <p className="text-xs text-blue-700">
                  • I fondi vengono trattenuti in modo sicuro<br/>
                  • Rilasciati al venditore solo dopo la conferma di ricezione<br/>
                  • Protezione completa per acquirente e venditore
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-5 w-5 text-red-600" />
              <h3 className="font-bold">Metodo di Spedizione</h3>
            </div>
            <Select value={shippingMethod} onValueChange={setShippingMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ritiro_persona">🤝 Ritiro di Persona (Gratis)</SelectItem>
                <SelectItem value="corriere">📦 Corriere Espresso (+10€)</SelectItem>
                <SelectItem value="posta">📮 Posta Ordinaria (+5€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shippingMethod !== 'ritiro_persona' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Indirizzo di Spedizione</label>
              <Textarea
                placeholder="Inserisci l'indirizzo completo..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                required
              />
            </div>
          )}

          <div className="border-t-2 border-red-200 pt-4">
            <div className="flex justify-between mb-2">
              <span>Prezzo articolo:</span>
              <span className="font-bold">{chat.lastPrice || listing.price}€</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Spedizione:</span>
              <span className="font-bold">{shippingCosts[shippingMethod]}€</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-red-600 border-t-2 border-red-200 pt-2">
              <span>TOTALE:</span>
              <span>{totalAmount}€</span>
            </div>
          </div>

          {fraudCheck?.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">Avvisi:</p>
                  {fraudCheck.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-yellow-700">{w.message}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => completePurchaseMutation.mutate()}
            disabled={isProcessing || (shippingMethod !== 'ritiro_persona' && !shippingAddress)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
          >
            {isProcessing ? 'Elaborazione...' : `Paga ${totalAmount}€ con ${paymentMethod === 'paypal' ? 'PayPal' : paymentMethod}`}
          </Button>

          <p className="text-xs text-center text-slate-500">
            Simulazione pagamento - In produzione verrai reindirizzato al gateway di pagamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}