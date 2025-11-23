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
          <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
            <p className="text-green-800">
              <strong>✅ Backend Functions attive!</strong> Il webhook è stato creato.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">1. URL Webhook</h3>
            <p className="mb-2">Usa questo URL per configurare PayPal:</p>
            <code className="bg-slate-900 text-slate-100 px-3 py-2 rounded block">
              {window.location.origin}/api/functions/paypalWebhook
            </code>
          </div>

          <div>
            <h3 className="font-bold mb-2">2. Configura PayPal Dashboard</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Vai su <a href="https://developer.paypal.com" target="_blank" className="text-blue-600 underline">developer.paypal.com</a></li>
              <li>Dashboard → Apps & Credentials → Sandbox/Live</li>
              <li>Seleziona la tua app → Webhooks → Add Webhook</li>
              <li>Incolla l'URL sopra nel campo "Webhook URL"</li>
              <li>Seleziona questi eventi:
                <ul className="list-disc pl-6 mt-1">
                  <li><strong>PAYMENT.CAPTURE.COMPLETED</strong> - Pagamento completato</li>
                  <li><strong>PAYMENT.CAPTURE.REFUNDED</strong> - Rimborso</li>
                  <li><strong>CHECKOUT.ORDER.APPROVED</strong> - Ordine approvato</li>
                  <li><strong>CUSTOMER.DISPUTE.CREATED</strong> - Disputa aperta</li>
                </ul>
              </li>
              <li>Salva e copia il <strong>Webhook ID</strong></li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold mb-2">3. Testa il Webhook</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Su PayPal Dashboard, vai alla sezione del webhook appena creato</li>
              <li>Clicca "Send Test Notification"</li>
              <li>Seleziona un evento (es. PAYMENT.CAPTURE.COMPLETED)</li>
              <li>Verifica che lo stato sia "Success" (200)</li>
            </ol>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">
              <strong>ℹ️ Funzionalità Webhook:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
              <li>Pagamenti messi in <strong>escrow</strong> per 14 giorni</li>
              <li>Rilascio automatico fondi al venditore dopo conferma acquirente</li>
              <li>Gestione rimborsi e dispute</li>
              <li>Notifiche automatiche acquirente/venditore</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}