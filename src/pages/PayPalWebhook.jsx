import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayPalWebhook() {
  const webhookUrl = `${window.location.origin}/api/functions/paypalWebhook`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiato negli appunti!');
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">🔧 Configurazione PayPal</h1>

      <Card className="mb-6 border-green-500">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800 flex items-center gap-2">
            ✅ Sistema PayPal Configurato
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">✓ Backend Functions</h4>
              <p className="text-sm text-blue-700">Webhook attivo e funzionante</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">✓ PayPal SDK</h4>
              <p className="text-sm text-blue-700">Integrato nel frontend</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">✓ Escrow System</h4>
              <p className="text-sm text-blue-700">Pagamenti protetti per 14 giorni</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">✓ Secrets Configurati</h4>
              <p className="text-sm text-blue-700">Credenziali PayPal salvate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📋 Passi Finali su PayPal Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
                <div>
                  <h3 className="font-bold mb-3 text-lg">1️⃣ URL Webhook</h3>
                  <p className="mb-2 text-slate-600">Copia questo URL e usalo per configurare PayPal:</p>
                  <div className="bg-slate-900 text-slate-100 px-4 py-3 rounded flex items-center justify-between">
                    <code className="text-sm">{webhookUrl}</code>
                    <button 
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="ml-4 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
                    >
                      📋 Copia
                    </button>
                  </div>
                </div>

          <div>
            <h3 className="font-bold mb-3 text-lg">2️⃣ Registra Webhook su PayPal</h3>
            <ol className="space-y-3 pl-6 list-decimal">
              <li>
                <strong>Apri PayPal Developer:</strong><br/>
                <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                  developer.paypal.com/dashboard →
                </a>
              </li>
              <li>
                <strong>Vai a:</strong> Apps & Credentials → Seleziona <span className="bg-yellow-100 px-2 py-0.5 rounded">Sandbox</span> o <span className="bg-green-100 px-2 py-0.5 rounded">Live</span>
              </li>
              <li>
                <strong>Crea/Seleziona la tua app</strong> → Scroll a <strong>"Webhooks"</strong> → Click <strong>"Add Webhook"</strong>
              </li>
              <li>
                <strong>Webhook URL:</strong> Incolla l'URL copiato sopra
              </li>
              <li>
                <strong>Event types:</strong> Seleziona questi 4 eventi:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li className="text-green-700"><strong>PAYMENT.CAPTURE.COMPLETED</strong> ← Pagamento completato</li>
                  <li className="text-blue-700"><strong>PAYMENT.CAPTURE.REFUNDED</strong> ← Rimborso</li>
                  <li className="text-purple-700"><strong>CHECKOUT.ORDER.APPROVED</strong> ← Ordine approvato</li>
                  <li className="text-red-700"><strong>CUSTOMER.DISPUTE.CREATED</strong> ← Disputa aperta</li>
                </ul>
              </li>
              <li>
                <strong>Salva il webhook</strong> e copia il <span className="bg-yellow-100 px-2 py-0.5 rounded font-mono">Webhook ID</span>
              </li>
              <li>
                <strong>Aggiorna il secret:</strong> Se il Webhook ID è diverso, aggiornalo in Dashboard → Settings → Secrets → PAYPAL_WEBHOOK_ID
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold mb-3 text-lg">3️⃣ Testa il Webhook</h3>
            <ol className="space-y-2 pl-6 list-decimal">
              <li>Su PayPal Dashboard, torna alla sezione <strong>Webhooks</strong></li>
              <li>Click sul webhook appena creato</li>
              <li>Click <strong>"Send Test Notification"</strong></li>
              <li>Seleziona evento: <strong>PAYMENT.CAPTURE.COMPLETED</strong></li>
              <li>✅ Verifica stato: <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">200 Success</span></li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> Se ricevi errori, verifica che l'URL webhook sia corretto e che i secrets siano configurati correttamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-blue-500">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">🎯 Come Funziona l'Escrow</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-700">1</div>
                <div>
                  <h4 className="font-bold">Acquirente paga con PayPal</h4>
                  <p className="text-sm text-slate-600">I fondi vengono trattenuti da PayPal in modalità escrow</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-700">2</div>
                <div>
                  <h4 className="font-bold">Venditore spedisce l'oggetto</h4>
                  <p className="text-sm text-slate-600">Il webhook aggiorna lo stato a "held_in_escrow"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 font-bold text-blue-700">3</div>
                <div>
                  <h4 className="font-bold">Acquirente conferma ricezione</h4>
                  <p className="text-sm text-slate-600">Oppure dopo 14 giorni i fondi vengono rilasciati automaticamente</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 font-bold text-green-700">✓</div>
                <div>
                  <h4 className="font-bold text-green-700">Fondi rilasciati al venditore</h4>
                  <p className="text-sm text-slate-600">Transazione completata con successo</p>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Prossimi Passi</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Vai a <strong>Messages</strong> e completa una trattativa</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Testa il pagamento PayPal in modalità Sandbox</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Verifica che le notifiche vengano inviate correttamente</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-600">⚠️</span>
              <span><strong>IMPORTANTE:</strong> Prima di andare live, passa da Sandbox a Live su PayPal e aggiorna i secrets</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}