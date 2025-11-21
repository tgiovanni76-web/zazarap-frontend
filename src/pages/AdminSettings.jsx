import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, CreditCard, BarChart3, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accesso Negato</h2>
        <p>Solo gli amministratori possono accedere a questa pagina.</p>
      </div>
    );
  }

  const integrations = [
    {
      name: 'PayPal',
      icon: CreditCard,
      description: 'Integrazione pagamenti e escrow',
      secrets: [
        { key: 'PAYPAL_CLIENT_ID', label: 'Client ID', placeholder: 'AXX...' },
        { key: 'PAYPAL_CLIENT_SECRET', label: 'Client Secret', placeholder: 'EXX...' },
        { key: 'PAYPAL_WEBHOOK_ID', label: 'Webhook ID', placeholder: 'WH-...' }
      ],
      docs: 'https://developer.paypal.com/dashboard/',
      status: 'required',
      color: 'bg-blue-500'
    },
    {
      name: 'Google Analytics',
      icon: BarChart3,
      description: 'Tracciamento utenti e conversioni',
      secrets: [
        { key: 'GOOGLE_ANALYTICS_ID', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX' }
      ],
      docs: 'https://analytics.google.com/',
      status: 'recommended',
      color: 'bg-yellow-500'
    }
  ];

  const setupSteps = [
    {
      title: '1. Abilita Backend Functions',
      description: 'Dal pannello Base44, vai in Settings → Backend Functions e abilitale',
      status: 'required',
      icon: Shield
    },
    {
      title: '2. Configura PayPal',
      description: 'Crea un\'app PayPal e inserisci le credenziali qui sotto',
      status: 'required',
      icon: CreditCard
    },
    {
      title: '3. Imposta Google Analytics',
      description: 'Crea una proprietà GA4 e inserisci il Measurement ID',
      status: 'recommended',
      icon: BarChart3
    },
    {
      title: '4. Configura Dominio',
      description: 'Collega il tuo dominio personalizzato nelle impostazioni Base44',
      status: 'recommended',
      icon: Settings
    }
  ];

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Configurazione Piattaforma</h2>

      <Card className="mb-8 bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Configurazione Necessaria</h3>
              <p className="text-sm text-yellow-800 mb-4">
                Per utilizzare il marketplace in produzione, devi completare la configurazione delle integrazioni.
                Vai nel pannello Base44 → Settings per inserire i secrets.
              </p>
              <div className="space-y-2">
                {setupSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <step.icon className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">{step.title}</p>
                      <p className="text-xs text-yellow-700">{step.description}</p>
                    </div>
                    <Badge variant={step.status === 'required' ? 'destructive' : 'secondary'} className="ml-auto">
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(integration => {
          const Icon = integration.icon;
          return (
            <Card key={integration.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`${integration.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <p className="text-sm text-slate-600">{integration.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {integration.secrets.map(secret => (
                    <div key={secret.key}>
                      <label className="text-sm font-medium mb-1 block">{secret.label}</label>
                      <div className="text-xs text-slate-500 mb-1">
                        Secret Key: <code className="bg-slate-100 px-1 py-0.5 rounded">{secret.key}</code>
                      </div>
                      <Input
                        type="password"
                        placeholder={secret.placeholder}
                        disabled
                        className="bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Configura questo secret nel pannello Base44 → Settings → Secrets
                      </p>
                    </div>
                  ))}
                </div>
                <a
                  href={integration.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  📚 Documentazione {integration.name} →
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Guida Rapida: PayPal Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            <li>Vai su <a href="https://developer.paypal.com/dashboard/" target="_blank" className="text-blue-600 hover:underline">PayPal Developer Dashboard</a></li>
            <li>Crea una nuova app (Apps & Credentials → Create App)</li>
            <li>Copia il Client ID e Client Secret</li>
            <li>Configura i Webhooks (Webhooks → Add Webhook)</li>
            <li>URL Webhook: <code className="bg-slate-100 px-2 py-1 rounded text-xs">https://tuodominio.com/api/paypal-webhook</code></li>
            <li>Eventi da sottoscrivere: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.REFUNDED</li>
            <li>Copia il Webhook ID</li>
            <li>Inserisci tutti i secrets nel pannello Base44</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Checklist Pre-Lancio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              'Backend Functions abilitate',
              'Secrets PayPal configurati',
              'Google Analytics configurato',
              'Dominio personalizzato collegato',
              'SSL/HTTPS attivo',
              'Email di sistema configurate',
              'Test pagamenti eseguiti (sandbox)',
              'Privacy Policy e ToS pubblicati',
              'Sistema di backup attivo'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded">
                <input type="checkbox" className="h-4 w-4" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}