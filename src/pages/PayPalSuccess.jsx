import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PayPalSuccess() {
  const [status, setStatus] = useState('processing');
  const navigate = useNavigate();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('token');
        const chatId = urlParams.get('chatId');
        const listingId = urlParams.get('listingId');

        // Retrieve stored payment details
        const storedDetails = sessionStorage.getItem('paypal_payment_details');
        let paymentDetails = null;
        
        if (storedDetails) {
          paymentDetails = JSON.parse(storedDetails);
          sessionStorage.removeItem('paypal_payment_details');
        }

        if (!orderId || !chatId || !listingId) {
          setStatus('error');
          return;
        }

        // Capture PayPal payment
        const { data } = await base44.functions.invoke('capturePayPalOrder', {
          orderId,
          chatId: paymentDetails?.chatId || chatId,
          listingId: paymentDetails?.listingId || listingId,
          sellerId: paymentDetails?.sellerId || '',
          shippingMethod: paymentDetails?.shippingMethod || 'ritiro_persona',
          shippingAddress: paymentDetails?.shippingAddress || ''
        });

        if (data.success) {
          setStatus('success');
          setTimeout(() => {
            navigate(createPageUrl('MyPurchases'));
          }, 3000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
      }
    };

    processPayment();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          {status === 'processing' && (
            <div className="text-center">
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Elaborazione Pagamento</h2>
              <p className="text-slate-600">Attendere prego...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold mb-2 text-green-700">Pagamento Completato!</h2>
              <p className="text-slate-600 mb-4">
                I tuoi fondi sono stati trattenuti in sicurezza in escrow. 
                Verranno rilasciati al venditore dopo la conferma di ricezione.
              </p>
              <p className="text-sm text-slate-500">Reindirizzamento ai tuoi acquisti...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2 text-red-700">Errore nel Pagamento</h2>
              <p className="text-slate-600 mb-4">
                Si è verificato un errore durante l'elaborazione del pagamento.
              </p>
              <button 
                onClick={() => navigate(createPageUrl('Messages'))}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Torna ai Messaggi
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}