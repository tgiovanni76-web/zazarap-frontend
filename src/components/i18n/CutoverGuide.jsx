/**
 * i18n V2 Cutover Guide
 * 
 * This component renders the complete migration guide.
 * Use this as documentation for activating i18n V2.
 */

import React from 'react';

export default function I18nV2CutoverGuide() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <h1 className="text-3xl font-bold mb-6">i18n V2 Cutover Guide</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">📋 Overview</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>✅ URL prefix language detection (<code>/de</code>, <code>/it</code>)</li>
          <li>✅ Cookie persistence (<code>zazarap_language</code>)</li>
          <li>✅ Language-neutral backend (packageCode instead of hardcoded labels)</li>
          <li>✅ No hardcoded UI texts (all via i18n keys)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🆕 New Files Created</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-mono text-sm mb-2">Frontend:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm font-mono">
            <li>components/LanguageProviderV2.js</li>
            <li>components/ads/SelectListingModalV2.js</li>
            <li>components/ads/RequestAdModalV2.js</li>
            <li>components/ads/CreateAdModalV2.js</li>
            <li>pages/WerbungV2.js</li>
            <li>pages/MySubscriptionsV2.js</li>
          </ul>
          <p className="font-mono text-sm mt-4 mb-2">Backend:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm font-mono">
            <li>functions/listAdPackagesV2.js</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🔄 Cutover Steps</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold mb-2">Step 1: Update Layout.js Provider</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Before:
import { LanguageProvider } from '@/components/LanguageProvider';

// After:
import { LanguageProviderV2 } from '@/components/LanguageProviderV2';`}
            </pre>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold mb-2">Step 2: Update All Import Paths</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Replace in ALL files using useLanguage():
import { useLanguage } from '@/components/LanguageProviderV2';`}
            </pre>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold mb-2">Step 3: Update API Calls</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Replace:
base44.functions.invoke('listAdPackages')
// With:
base44.functions.invoke('listAdPackagesV2')`}
            </pre>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold mb-2">Step 4: Use WerbungV2.js as Template</h3>
            <p className="text-sm mb-2">Copy the pattern from <code>pages/WerbungV2.js</code> to other pages:</p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Use packageCode for translation:
<PricingCard 
  packageCode="top_ad"
  price={packages?.topAd?.displayPrice}
/>

// Inside component:
const title = t(\`pricing.\${packageCode}.title\`);
const desc = t(\`pricing.\${packageCode}.desc\`);`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">📦 Package Code Mapping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Old (hardcoded)</th>
                <th className="border p-2 text-left">New (packageCode)</th>
                <th className="border p-2 text-left">i18n Key</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-2">TOP-Anzeige</td><td className="border p-2 font-mono">top_ad</td><td className="border p-2 font-mono">pricing.top_ad.title</td></tr>
              <tr><td className="border p-2">Hervorgehobene Anzeige</td><td className="border p-2 font-mono">highlighted</td><td className="border p-2 font-mono">pricing.highlighted.title</td></tr>
              <tr><td className="border p-2">Premium 14 Tage</td><td className="border p-2 font-mono">premium14</td><td className="border p-2 font-mono">pricing.premium14.title</td></tr>
              <tr><td className="border p-2">Basic Shop-Paket</td><td className="border p-2 font-mono">basic_shop</td><td className="border p-2 font-mono">pricing.basic_shop.title</td></tr>
              <tr><td className="border p-2">Business Shop-Paket</td><td className="border p-2 font-mono">business_shop</td><td className="border p-2 font-mono">pricing.business_shop.title</td></tr>
              <tr><td className="border p-2">Premium Shop-Paket</td><td className="border p-2 font-mono">premium_shop</td><td className="border p-2 font-mono">pricing.premium_shop.title</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🧪 Quick Test Commands</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded space-y-2 text-sm font-mono">
          <p># German (default)</p>
          <p>window.location.href = '/de/WerbungV2'</p>
          <p className="mt-3"># Italian</p>
          <p>window.location.href = '/it/WerbungV2'</p>
          <p className="mt-3"># Check cookie</p>
          <p>document.cookie.match(/zazarap_language=([^;]+)/)?.[1]</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">✅ Success Criteria</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>✅ Single Source of Truth: URL &gt; Cookie &gt; Browser &gt; Default</li>
          <li>✅ No hardcoded texts anywhere</li>
          <li>✅ Backend language-neutral</li>
          <li>✅ Cookie persistence works</li>
          <li>✅ No mixed languages (100% DE or 100% IT)</li>
          <li>✅ Business logic unchanged</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-red-600">🔙 Rollback</h2>
        <p className="mb-4">If issues occur:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Revert imports from V2 to V1</li>
          <li>Change API calls back to <code>listAdPackages</code></li>
          <li>System returns to original state</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">No data loss - V2 is fully additive.</p>
      </section>
    </div>
  );
}