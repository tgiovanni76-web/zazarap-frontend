import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function OfferModal({ 
  open, 
  onClose, 
  onSubmit, 
  listingPrice, 
  lastOffer,
  isCounter = false,
  isPending = false 
}) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(lastOffer?.amount || listingPrice || '');
  const [message, setMessage] = useState('');

  const basePrice = lastOffer?.amount || listingPrice;
  const priceDiff = basePrice ? ((amount - basePrice) / basePrice * 100).toFixed(1) : 0;
  const isIncrease = parseFloat(priceDiff) > 0;

  const suggestedPrices = listingPrice ? [
    { label: '-10%', value: Math.round(listingPrice * 0.9) },
    { label: '-5%', value: Math.round(listingPrice * 0.95) },
    { label: 'Prezzo', value: listingPrice },
  ] : [];

  const handleSubmit = () => {
    if (!amount || amount <= 0) return;
    onSubmit({ 
      amount: parseFloat(amount), 
      message: message.trim(),
      type: isCounter ? 'counter' : 'initial'
    });
    setAmount('');
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCounter ? '🔄 Fai una contro-offerta' : '💰 Fai un\'offerta'}
          </DialogTitle>
          <DialogDescription>
            {isCounter 
              ? `Ultima offerta: ${lastOffer?.amount}€` 
              : `Prezzo richiesto: ${listingPrice}€`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Price Buttons */}
          {suggestedPrices.length > 0 && !isCounter && (
            <div className="flex gap-2 flex-wrap">
              {suggestedPrices.map(({ label, value }) => (
                <Button
                  key={label}
                  variant={amount === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(value)}
                  className="text-xs"
                >
                  {label} ({value}€)
                </Button>
              ))}
            </div>
          )}

          {/* Amount Input */}
          <div>
            <Label>Importo (€)</Label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Inserisci importo"
                className="text-lg font-bold pr-20"
                min="1"
                step="0.01"
              />
              {amount && basePrice && priceDiff !== '0.0' && (
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm ${
                  isIncrease ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isIncrease ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isIncrease ? '+' : ''}{priceDiff}%
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <Label>Messaggio (opzionale)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Aggiungi un messaggio alla tua offerta..."
              rows={2}
            />
          </div>

          {/* Summary */}
          {amount > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">La tua offerta:</span>
                <span className="text-2xl font-bold text-green-600">{parseFloat(amount).toFixed(2)}€</span>
              </div>
              {listingPrice && amount < listingPrice && (
                <p className="text-xs text-slate-500 mt-1">
                  Risparmio: {(listingPrice - amount).toFixed(2)}€
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!amount || amount <= 0 || isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Invia offerta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}