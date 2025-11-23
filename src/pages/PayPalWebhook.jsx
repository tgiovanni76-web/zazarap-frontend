import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayPalWebhook() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">PayPal Webhook Configuration</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold mb-2">1. Abilita Backend Functions</h3>
            <p>Dashboard → Settings → Enable Backend Functions</p>
          </div>

          <div>
            <h3 className="font-bold mb-2">2. Crea Webhook Endpoint</h3>
            <p>Crea file <code className="bg-slate-100 px-2 py-1 rounded">functions/paypalWebhook.js</code>:</p>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded mt-2 overflow-x-auto text-xs">
{`export default async function handler(req, context) {
  const { event_type, resource } = req.body;
  
  // Verifica signature PayPal
  const isValid = await verifyWebhookSignature(req);
  if (!isValid) return { status: 401, body: 'Invalid signature' };
  
  switch (event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePaymentCompleted(resource);
      break;
    case 'PAYMENT.CAPTURE.REFUNDED':
      await handleRefund(resource);
      break;
    case 'CHECKOUT.ORDER.APPROVED':
      await handleOrderApproved(resource);
      break;
  }
  
  return { status: 200, body: 'OK' };
}

async function handlePaymentCompleted(resource) {
  const { id, amount } = resource;
  
  // Update payment record
  const payments = await context.entities.Payment.filter({
    paypalTransactionId: id
  });
  
  if (payments[0]) {
    await context.entities.Payment.update(payments[0].id, {
      status: 'held_in_escrow',
      escrowReleaseDate: new Date(Date.now() + 14*24*60*60*1000)
    });
  }
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-bold mb-2">3. Configura PayPal Dashboard</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Vai su developer.paypal.com</li>
              <li>Webhooks → Create Webhook</li>
              <li>URL: <code>https://tuodominio.com/api/functions/paypalWebhook</code></li>
              <li>Eventi da ascoltare:
                <ul className="list-disc pl-6 mt-1">
                  <li>PAYMENT.CAPTURE.COMPLETED</li>
                  <li>PAYMENT.CAPTURE.REFUNDED</li>
                  <li>CHECKOUT.ORDER.APPROVED</li>
                  <li>CUSTOMER.DISPUTE.CREATED</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold mb-2">4. Environment Variables</h3>
            <p>Settings → Secrets:</p>
            <ul className="list-disc pl-6">
              <li>PAYPAL_CLIENT_ID</li>
              <li>PAYPAL_CLIENT_SECRET</li>
              <li>PAYPAL_WEBHOOK_ID</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              <strong>⚠️ Importante:</strong> Questa configurazione richiede backend functions abilitate. 
              Contatta il supporto Base44 per attivarle.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}