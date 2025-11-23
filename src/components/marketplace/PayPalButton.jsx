import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PayPalButton({ amount, chatId, onSuccess, onError }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Verifica se PayPal SDK è già caricato
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    // Carica PayPal SDK
    const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test';
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&intent=capture`;
    script.async = true;
    
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      toast.error('Errore caricamento PayPal');
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal) return;

    const paypalContainer = document.getElementById(`paypal-button-container-${chatId}`);
    if (!paypalContainer) return;

    // Pulisci container se già popolato
    paypalContainer.innerHTML = '';

    window.paypal.Buttons({
      createOrder: async (data, actions) => {
        setProcessing(true);
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toFixed(2),
              currency_code: 'EUR'
            },
            description: `Acquisto Zazarap - Chat ${chatId}`
          }]
        });
      },

      onApprove: async (data, actions) => {
        try {
          const order = await actions.order.capture();
          console.log('PayPal order captured:', order);
          
          // Passa i dati del pagamento al genitore
          if (onSuccess) {
            onSuccess({
              orderId: order.id,
              transactionId: order.purchase_units[0].payments.captures[0].id,
              status: order.status,
              amount: parseFloat(order.purchase_units[0].amount.value)
            });
          }
        } catch (error) {
          console.error('PayPal capture error:', error);
          toast.error('Errore durante il pagamento');
          if (onError) onError(error);
        } finally {
          setProcessing(false);
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        toast.error('Errore PayPal');
        setProcessing(false);
        if (onError) onError(err);
      },

      onCancel: () => {
        toast.info('Pagamento annullato');
        setProcessing(false);
      },

      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      }
    }).render(`#paypal-button-container-${chatId}`);

  }, [sdkReady, amount, chatId, onSuccess, onError]);

  if (!sdkReady) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Caricamento PayPal...</span>
      </div>
    );
  }

  return (
    <div>
      <div id={`paypal-button-container-${chatId}`}></div>
      {processing && (
        <div className="text-center mt-4 text-sm text-slate-600">
          Elaborazione pagamento...
        </div>
      )}
    </div>
  );
}