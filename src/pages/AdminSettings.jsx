import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, Key, CreditCard, BarChart3, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminSettings() {
  const { t } = useLanguage();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{t('accessDenied')}</h2>
        <p>{t('adminOnly')}</p>
      </div>
    );
  }

  const integrations = [
    {
      name: 'PayPal',
      icon: CreditCard,
      description: t('settings.integrations.paypal.description'),
      secrets: [
        { key: 'PAYPAL_CLIENT_ID', label: t('settings.paypal.clientId'), placeholder: 'AXX...' },
        { key: 'PAYPAL_CLIENT_SECRET', label: t('settings.paypal.clientSecret'), placeholder: 'EXX...' },
        { key: 'PAYPAL_WEBHOOK_ID', label: t('settings.paypal.webhookId'), placeholder: 'WH-...' }
      ],
      docs: 'https://developer.paypal.com/dashboard/',
      status: 'required',
      color: 'bg-blue-500'
    },
    {
      name: 'Google Analytics',
      icon: BarChart3,
      description: t('settings.integrations.ga.description'),
      secrets: [
        { key: 'GOOGLE_ANALYTICS_ID', label: t('settings.ga.measurementId'), placeholder: 'G-XXXXXXXXXX' }
      ],
      docs: 'https://analytics.google.com/',
      status: 'recommended',
      color: 'bg-yellow-500'
    }
  ];

  const setupSteps = [
    {
      title: t('settings.step.enableFunctions.title'),
      description: t('settings.step.enableFunctions.desc'),
      status: 'required',
      icon: Shield
    },
    {
      title: t('settings.step.setupPayPal.title'),
      description: t('settings.step.setupPayPal.desc'),
      status: 'required',
      icon: CreditCard
    },
    {
      title: t('settings.step.setupGA.title'),
      description: t('settings.step.setupGA.desc'),
      status: 'recommended',
      icon: BarChart3
    },
    {
      title: t('settings.step.setupDomain.title'),
      description: t('settings.step.setupDomain.desc'),
      status: 'recommended',
      icon: Settings
    }
  ];

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">{t('settings.platformConfigTitle')}</h2>

      <Card className="mb-8 bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">{t('settings.necessaryConfig')}</h3>
              <p className="text-sm text-yellow-800 mb-4">
                {t('settings.necessaryConfigDesc')}
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
                      {step.status === 'required' ? t('settings.required') : t('settings.recommended')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 border-red-200">
        <CardHeader>
            <CardTitle className="text-red-600">{t('settings.categoryManagementTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="mb-4 text-sm text-gray-600">
                {t('settings.categoryResetWarning')}
            </p>
            <Button 
                variant="destructive"
                onClick={async () => {
                    if(confirm(t('settings.resetCategoriesConfirm'))) {
                        const toastId = toast.loading(t('settings.resettingCategories'));
                        try {
                            await base44.functions.invoke('setupCategories');
                            toast.success(t('settings.categoriesResetSuccess'), { id: toastId });
                            // Reload page to reflect changes if needed or just let user know
                        } catch (e) {
                            toast.error(t('settings.categoriesResetError') + ' ' + e.message, { id: toastId });
                        }
                    }
                }}
            >
                {t('settings.resetCategoriesButton')}
            </Button>
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
                        {t('settings.secretKeyLabel')}: <code className="bg-slate-100 px-1 py-0.5 rounded">{secret.key}</code>
                      </div>
                      <Input
                        type="password"
                        placeholder={secret.placeholder}
                        disabled
                        className="bg-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {t('settings.configureSecretHint')}
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
                  📚 {t('settings.documentation')} {integration.name} →
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('settings.paypal.quickGuideTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            <li>{t('settings.paypal.step1')} <a href="https://developer.paypal.com/dashboard/" target="_blank" className="text-blue-600 hover:underline">PayPal Developer Dashboard</a></li>
            <li>{t('settings.paypal.step2')}</li>
            <li>{t('settings.paypal.step3')}</li>
            <li>{t('settings.paypal.step4')}</li>
            <li>{t('settings.paypal.webhookUrlLabel')}: <code className="bg-slate-100 px-2 py-1 rounded text-xs">https://tuodominio.com/api/paypal-webhook</code></li>
            <li>{t('settings.paypal.eventsToSubscribe')}: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.REFUNDED</li>
            <li>{t('settings.paypal.step7')}</li>
            <li>{t('settings.paypal.step8')}</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('settings.checklist.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              t('settings.checklist.backendFunctions'),
              t('settings.checklist.paypalSecrets'),
              t('settings.checklist.ga'),
              t('settings.checklist.customDomain'),
              t('settings.checklist.ssl'),
              t('settings.checklist.systemEmails'),
              t('settings.checklist.paymentsTested'),
              t('settings.checklist.privacyTos'),
              t('settings.checklist.backup')
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