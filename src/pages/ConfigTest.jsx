import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ConfigTest() {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results = {
      googleAnalytics: null,
      paypalFrontend: null,
      paypalBackend: null
    };

    // Test 1: Google Analytics
    try {
      const gaId = process.env.REACT_APP_GA_ID;
      results.googleAnalytics = {
        status: gaId && gaId !== 'G-6EWH7J0RLD' ? 'success' : 'warning',
        message: gaId && gaId !== 'G-6EWH7J0RLD' 
          ? `✓ Configurato: ${gaId}` 
          : '⚠️ Usa ID placeholder - configura REACT_APP_GA_ID',
        value: gaId
      };
    } catch (error) {
      results.googleAnalytics = {
        status: 'error',
        message: '✗ Errore nel recupero della configurazione',
        error: error.message
      };
    }

    // Test 2: PayPal Frontend
    try {
      const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
      results.paypalFrontend = {
        status: paypalClientId ? 'success' : 'error',
        message: paypalClientId 
          ? `✓ Client ID configurato (inizia con: ${paypalClientId.substring(0, 10)}...)` 
          : '✗ REACT_APP_PAYPAL_CLIENT_ID non configurato',
        value: paypalClientId ? 'Presente' : 'Mancante'
      };
    } catch (error) {
      results.paypalFrontend = {
        status: 'error',
        message: '✗ Errore nel recupero della configurazione',
        error: error.message
      };
    }

    // Test 3: PayPal Backend (crea ordine test)
    try {
      const testResponse = await base44.functions.invoke('createPayPalOrder', {
        amount: 10,
        chatId: 'test_' + Date.now(),
        listingId: 'test_listing'
      });

      if (testResponse.data.orderId) {
        results.paypalBackend = {
          status: 'success',
          message: '✓ PayPal Backend configurato correttamente',
          details: `Order ID creato: ${testResponse.data.orderId.substring(0, 15)}...`
        };
      } else if (testResponse.data.error) {
        results.paypalBackend = {
          status: 'error',
          message: '✗ ' + testResponse.data.error,
          details: testResponse.data.details || 'Verifica PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET nei secrets'
        };
      }
    } catch (error) {
      results.paypalBackend = {
        status: 'error',
        message: '✗ Errore nella chiamata backend',
        details: error.message
      };
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Test Configurazione Secrets</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Guida Configurazione</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">1. Elimina Secret Invalido</h3>
            <p className="text-sm text-slate-600">
              Dashboard → Settings → Secrets → Elimina <code className="bg-red-100 px-2 py-1 rounded">Afx1IAhkhW-fIRXO3KR4q.</code>
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">2. Google Analytics</h3>
            <p className="text-sm text-slate-600 mb-2">
              Configura il secret: <code className="bg-slate-100 px-2 py-1 rounded">REACT_APP_GA_ID</code>
            </p>
            <p className="text-xs text-slate-500">
              Ottieni il tuo ID da: analytics.google.com → Admin → Flussi di dati → ID misurazione
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">3. PayPal (Modalità SANDBOX per test)</h3>
            <p className="text-sm text-slate-600 mb-2">
              Vai su <a href="https://developer.paypal.com" target="_blank" className="text-blue-600 underline">developer.paypal.com</a> → Dashboard → Apps & Credentials → Sandbox
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4">
              <li>• <code className="bg-slate-100 px-2 py-1 rounded">REACT_APP_PAYPAL_CLIENT_ID</code> → Client ID (inizia con "Ab...")</li>
              <li>• <code className="bg-slate-100 px-2 py-1 rounded">PAYPAL_CLIENT_ID</code> → Stesso Client ID</li>
              <li>• <code className="bg-slate-100 px-2 py-1 rounded">PAYPAL_CLIENT_SECRET</code> → Secret (clicca "Show")</li>
            </ul>
            <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
              ⚠️ Le funzioni usano SANDBOX (test). Per produzione cambia l'URL nelle funzioni da sandbox.paypal.com a paypal.com
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">4. Account Test PayPal</h3>
            <p className="text-sm text-slate-600">
              developer.paypal.com → Sandbox → Accounts → Crea account buyer e seller per testare
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verifica Configurazione</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runTests} 
            disabled={testing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 mb-6"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test in corso...
              </>
            ) : (
              'Avvia Test Configurazione'
            )}
          </Button>

          {testResults && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(testResults.googleAnalytics?.status)}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Google Analytics</h4>
                    <p className="text-sm text-slate-600">{testResults.googleAnalytics?.message}</p>
                    {testResults.googleAnalytics?.value && (
                      <p className="text-xs text-slate-500 mt-1">ID: {testResults.googleAnalytics.value}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(testResults.paypalFrontend?.status)}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">PayPal Frontend (Client ID)</h4>
                    <p className="text-sm text-slate-600">{testResults.paypalFrontend?.message}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(testResults.paypalBackend?.status)}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">PayPal Backend (API Connection)</h4>
                    <p className="text-sm text-slate-600">{testResults.paypalBackend?.message}</p>
                    {testResults.paypalBackend?.details && (
                      <p className="text-xs text-slate-500 mt-1">{testResults.paypalBackend.details}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {testResults && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Prossimi passi:</strong><br/>
                {testResults.paypalBackend?.status === 'success' 
                  ? '✓ Tutto configurato! Prova a fare un acquisto di test nell\'app.'
                  : '1. Correggi gli errori sopra\n2. Ricarica la pagina\n3. Esegui nuovamente il test'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}