import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProviderV2';

export default function I18nDebug() {
  const { language, t } = useLanguage();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me().catch(() => null) });
  
  const { data: pkgData, isLoading: pkgLoading } = useQuery({ 
    queryKey: ['adPackagesV2Debug'], 
    queryFn: async () => (await base44.functions.invoke('listAdPackagesV2')).data
  });

  const cookieValue = typeof document !== 'undefined' 
    ? document.cookie.match(/zazarap_language=([^;]+)/)?.[1] 
    : null;

  const criticalKeys = [
    'ads.header.title',
    'ads.btn.buyNow',
    'pricing.top_ad.title',
    'pricing.highlighted.title',
    'ads.modal.select.chooseListing',
    'ads.modal.request.submit',
    'subs.mySubscriptions',
    'common.cancel'
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 i18n V2 Debug Panel</h1>

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold w-40">Current Language:</span>
              <Badge className="bg-blue-600">{language.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold w-40">Cookie Value:</span>
              {cookieValue ? (
                <Badge className="bg-green-600">{cookieValue}</Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">Not Set</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold w-40">Provider:</span>
              <Badge variant="outline">LanguageProviderV2</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold w-40">URL Pathname:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</code>
            </div>
          </CardContent>
        </Card>

        {/* Translation Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Translation Test ({language.toUpperCase()})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalKeys.map(key => {
                const translated = t(key);
                const hasTranslation = translated !== key;
                return (
                  <div key={key} className="flex items-start gap-3 py-2 border-b last:border-0">
                    {hasTranslation ? (
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <code className="text-xs text-gray-500 block mb-1">{key}</code>
                      <p className="font-semibold">{translated}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Backend API Response */}
        <Card>
          <CardHeader>
            <CardTitle>Backend API: listAdPackagesV2</CardTitle>
          </CardHeader>
          <CardContent>
            {pkgLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : pkgData?.packages ? (
              <div className="space-y-4">
                {Object.entries(pkgData.packages).map(([key, pkg]) => (
                  <div key={key} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{key}</span>
                      {pkg.packageCode ? (
                        <Badge className="bg-green-600">✓ Has packageCode</Badge>
                      ) : (
                        <Badge variant="destructive">✗ Missing packageCode</Badge>
                      )}
                    </div>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(pkg, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">Failed to load packages</p>
            )}
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>🧪 Manual Test Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-2 text-sm">
              <li>Switch language to IT using LanguageSwitcher (top right)</li>
              <li>Verify all translations above change to Italian</li>
              <li>Verify Cookie Value shows "it"</li>
              <li>Reload page (F5) → Language stays IT</li>
              <li>Visit /WerbungV2 → All texts in Italian</li>
              <li>Open modal (click "Acquista ora") → Modal in Italian</li>
              <li>Switch back to DE → Everything German again</li>
              <li>Check Backend Response → All packages have <code>packageCode</code></li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}