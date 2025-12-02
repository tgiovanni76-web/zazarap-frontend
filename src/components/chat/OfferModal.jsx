import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

const offerTranslations = {
  de: {
    makeOffer: 'Ein Angebot machen',
    makeCounterOffer: 'Gegenangebot machen',
    lastOffer: 'Letztes Angebot',
    askingPrice: 'Preis',
    amount: 'Betrag (€)',
    enterAmount: 'Betrag eingeben',
    messageOptional: 'Nachricht (optional)',
    messagePlaceholder: 'Fügen Sie Ihrem Angebot eine Nachricht hinzu...',
    yourOffer: 'Ihr Angebot:',
    savings: 'Ersparnis',
    cancel: 'Abbrechen',
    sendOffer: 'Angebot senden',
    price: 'Preis'
  },
  en: {
    makeOffer: 'Make an offer',
    makeCounterOffer: 'Make a counter offer',
    lastOffer: 'Last offer',
    askingPrice: 'Asking price',
    amount: 'Amount (€)',
    enterAmount: 'Enter amount',
    messageOptional: 'Message (optional)',
    messagePlaceholder: 'Add a message to your offer...',
    yourOffer: 'Your offer:',
    savings: 'Savings',
    cancel: 'Cancel',
    sendOffer: 'Send offer',
    price: 'Price'
  },
  it: {
    makeOffer: "Fai un'offerta",
    makeCounterOffer: 'Fai una contro-offerta',
    lastOffer: 'Ultima offerta',
    askingPrice: 'Prezzo richiesto',
    amount: 'Importo (€)',
    enterAmount: 'Inserisci importo',
    messageOptional: 'Messaggio (opzionale)',
    messagePlaceholder: 'Aggiungi un messaggio alla tua offerta...',
    yourOffer: 'La tua offerta:',
    savings: 'Risparmio',
    cancel: 'Annulla',
    sendOffer: 'Invia offerta',
    price: 'Prezzo'
  },
  tr: {
    makeOffer: 'Teklif ver',
    makeCounterOffer: 'Karşı teklif ver',
    lastOffer: 'Son teklif',
    askingPrice: 'İstenen fiyat',
    amount: 'Tutar (€)',
    enterAmount: 'Tutar girin',
    messageOptional: 'Mesaj (isteğe bağlı)',
    messagePlaceholder: 'Teklifinize bir mesaj ekleyin...',
    yourOffer: 'Teklifiniz:',
    savings: 'Tasarruf',
    cancel: 'İptal',
    sendOffer: 'Teklif gönder',
    price: 'Fiyat'
  },
  uk: {
    makeOffer: 'Зробити пропозицію',
    makeCounterOffer: 'Зробити контрпропозицію',
    lastOffer: 'Остання пропозиція',
    askingPrice: 'Запитувана ціна',
    amount: 'Сума (€)',
    enterAmount: 'Введіть суму',
    messageOptional: 'Повідомлення (необов'язково)',
    messagePlaceholder: 'Додайте повідомлення до вашої пропозиції...',
    yourOffer: 'Ваша пропозиція:',
    savings: 'Економія',
    cancel: 'Скасувати',
    sendOffer: 'Надіслати пропозицію',
    price: 'Ціна'
  },
  fr: {
    makeOffer: 'Faire une offre',
    makeCounterOffer: 'Faire une contre-offre',
    lastOffer: 'Dernière offre',
    askingPrice: 'Prix demandé',
    amount: 'Montant (€)',
    enterAmount: 'Entrez le montant',
    messageOptional: 'Message (optionnel)',
    messagePlaceholder: 'Ajoutez un message à votre offre...',
    yourOffer: 'Votre offre :',
    savings: 'Économie',
    cancel: 'Annuler',
    sendOffer: 'Envoyer l\'offre',
    price: 'Prix'
  },
  pl: {
    makeOffer: 'Złóż ofertę',
    makeCounterOffer: 'Złóż kontrofertę',
    lastOffer: 'Ostatnia oferta',
    askingPrice: 'Cena wywoławcza',
    amount: 'Kwota (€)',
    enterAmount: 'Wprowadź kwotę',
    messageOptional: 'Wiadomość (opcjonalnie)',
    messagePlaceholder: 'Dodaj wiadomość do swojej oferty...',
    yourOffer: 'Twoja oferta:',
    savings: 'Oszczędność',
    cancel: 'Anuluj',
    sendOffer: 'Wyślij ofertę',
    price: 'Cena'
  }
};

export default function OfferModal({ 
  open, 
  onClose, 
  onSubmit, 
  listingPrice, 
  lastOffer,
  isCounter = false,
  isPending = false 
}) {
  const { language } = useLanguage();
  const ot = offerTranslations[language] || offerTranslations.de;
  const [amount, setAmount] = useState(lastOffer?.amount || listingPrice || '');
  const [message, setMessage] = useState('');

  const basePrice = lastOffer?.amount || listingPrice;
  const priceDiff = basePrice ? ((amount - basePrice) / basePrice * 100).toFixed(1) : 0;
  const isIncrease = parseFloat(priceDiff) > 0;

  const suggestedPrices = listingPrice ? [
    { label: '-10%', value: Math.round(listingPrice * 0.9) },
    { label: '-5%', value: Math.round(listingPrice * 0.95) },
    { label: ot.price, value: listingPrice },
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
            {isCounter ? `🔄 ${ot.makeCounterOffer}` : `💰 ${ot.makeOffer}`}
          </DialogTitle>
          <DialogDescription>
            {isCounter 
              ? `${ot.lastOffer}: ${lastOffer?.amount}€` 
              : `${ot.askingPrice}: ${listingPrice}€`
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
            <Label>{ot.amount}</Label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={ot.enterAmount}
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