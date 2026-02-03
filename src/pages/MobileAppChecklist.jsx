import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, XCircle, AlertCircle, Smartphone, Apple, Download } from 'lucide-react';

export default function MobileAppChecklist() {
  const [checks, setChecks] = useState({});

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const sections = [
    {
      title: "📱 App Information & Assets",
      platform: "both",
      items: [
        { id: 'app_name', label: 'App Name (max 30 chars iOS, 50 chars Android)', value: 'Zazarap', status: 'pass' },
        { id: 'app_subtitle', label: 'Subtitle/Short Description', value: 'Kleinanzeigen Marketplace', status: 'pass' },
        { id: 'app_description', label: 'Long Description (4000 chars)', value: '✅ Ready', status: 'pass' },
        { id: 'app_icon', label: 'App Icon 1024x1024px (PNG, no transparency)', value: '❌ Missing', status: 'fail' },
        { id: 'app_screenshots', label: 'Screenshots (min 2, recommended 5-8)', value: '❌ Missing', status: 'fail' },
        { id: 'app_preview', label: 'Preview Video (optional)', value: 'Not required', status: 'optional' },
        { id: 'feature_graphic', label: 'Feature Graphic 1024x500px (Android)', value: '❌ Missing', status: 'fail' },
      ]
    },
    {
      title: "🍎 Apple App Store Requirements",
      platform: "ios",
      items: [
        { id: 'ios_developer', label: 'Apple Developer Account ($99/year)', value: '❓ To verify', status: 'warning' },
        { id: 'ios_privacy', label: 'Privacy Policy URL (required)', value: 'https://zazarap.de/privacy-policy', status: 'pass' },
        { id: 'ios_terms', label: 'Terms of Use URL (required)', value: 'https://zazarap.de/agb', status: 'pass' },
        { id: 'ios_age', label: 'Age Rating (PEGI equivalent)', value: '✅ 12+ (Marketplace)', status: 'pass' },
        { id: 'ios_category', label: 'Primary Category', value: 'Shopping', status: 'pass' },
        { id: 'ios_keywords', label: 'Keywords (100 chars max)', value: '✅ Ready', status: 'pass' },
        { id: 'ios_support', label: 'Support URL', value: 'https://zazarap.de/contact', status: 'pass' },
        { id: 'ios_guideline', label: 'Guideline 4.2 (Minimum Functionality)', value: '✅ Pass - Full marketplace', status: 'pass' },
        { id: 'ios_guideline2', label: 'Guideline 3.1.1 (In-App Purchases)', value: '⚠️ Premium payments via web', status: 'warning' },
      ]
    },
    {
      title: "🤖 Google Play Store Requirements",
      platform: "android",
      items: [
        { id: 'android_developer', label: 'Google Play Console Account ($25 one-time)', value: '❓ To verify', status: 'warning' },
        { id: 'android_privacy', label: 'Privacy Policy URL', value: 'https://zazarap.de/privacy-policy', status: 'pass' },
        { id: 'android_category', label: 'App Category', value: 'Shopping', status: 'pass' },
        { id: 'android_content', label: 'Content Rating (IARC)', value: '❓ To complete', status: 'warning' },
        { id: 'android_permissions', label: 'Permissions Declaration', value: '✅ Camera, Location, Storage', status: 'pass' },
        { id: 'android_target', label: 'Target API Level (min SDK 33)', value: '✅ Up to date', status: 'pass' },
        { id: 'android_store', label: 'Store Listing Assets', value: '❌ Missing graphics', status: 'fail' },
      ]
    },
    {
      title: "⚖️ Legal & Compliance",
      platform: "both",
      items: [
        { id: 'legal_company', label: 'Legal Entity (zazarap GmbH)', value: '✅ Registered', status: 'pass' },
        { id: 'legal_address', label: 'Physical Address in App', value: '❓ Update with real address', status: 'warning' },
        { id: 'legal_contact', label: 'Contact Email (info@zazarap.com)', value: '✅ Active', status: 'pass' },
        { id: 'legal_gdpr', label: 'GDPR Compliance (EU)', value: '✅ Full compliance', status: 'pass' },
        { id: 'legal_coppa', label: 'COPPA (if <13 users)', value: 'N/A - 12+ rating', status: 'pass' },
        { id: 'legal_content', label: 'User-Generated Content Policy', value: '✅ Moderation system', status: 'pass' },
        { id: 'legal_payments', label: 'Payment Processing Disclosure', value: '✅ PayPal/Stripe disclosed', status: 'pass' },
      ]
    },
    {
      title: "🎨 Design & UX",
      platform: "both",
      items: [
        { id: 'design_responsive', label: 'Mobile Responsive Design', value: '✅ Fully responsive', status: 'pass' },
        { id: 'design_navigation', label: 'Touch-Friendly Navigation', value: '✅ Bottom nav implemented', status: 'pass' },
        { id: 'design_loading', label: 'Loading States', value: '✅ Implemented', status: 'pass' },
        { id: 'design_offline', label: 'Offline Message', value: '❓ To implement', status: 'warning' },
        { id: 'design_splash', label: 'Splash Screen', value: '❌ Missing', status: 'fail' },
        { id: 'design_dark', label: 'Dark Mode Support', value: '❌ Not implemented', status: 'optional' },
      ]
    },
    {
      title: "🔒 Security & Performance",
      platform: "both",
      items: [
        { id: 'security_https', label: 'HTTPS Only', value: '✅ Enforced', status: 'pass' },
        { id: 'security_auth', label: 'Secure Authentication', value: '✅ Base44 Auth', status: 'pass' },
        { id: 'security_data', label: 'Data Encryption', value: '✅ At rest & transit', status: 'pass' },
        { id: 'perf_load', label: 'Page Load Time (<3s)', value: '✅ Optimized', status: 'pass' },
        { id: 'perf_images', label: 'Image Optimization', value: '✅ Lazy loading', status: 'pass' },
        { id: 'perf_bundle', label: 'Bundle Size Optimization', value: '✅ Code splitting', status: 'pass' },
      ]
    },
    {
      title: "📝 Submission Preparation",
      platform: "both",
      items: [
        { id: 'sub_test', label: 'Test Account Credentials (for reviewers)', value: '❌ Create demo account', status: 'fail' },
        { id: 'sub_notes', label: 'Review Notes', value: '❌ Prepare explanation', status: 'fail' },
        { id: 'sub_demo', label: 'Demo Video (optional but recommended)', value: '❌ Not created', status: 'optional' },
        { id: 'sub_build', label: 'Base44 Mobile Build Request', value: '❌ Not started', status: 'fail' },
      ]
    }
  ];

  const getStatusCounts = () => {
    const counts = { pass: 0, fail: 0, warning: 0, optional: 0 };
    sections.forEach(section => {
      section.items.forEach(item => {
        if (counts[item.status] !== undefined) counts[item.status]++;
      });
    });
    return counts;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'optional': return <AlertCircle className="h-5 w-5 text-blue-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      optional: 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const getPlatformIcon = (platform) => {
    if (platform === 'ios') return <Apple className="h-5 w-5" />;
    if (platform === 'android') return <Smartphone className="h-5 w-5" />;
    return <Download className="h-5 w-5" />;
  };

  const counts = getStatusCounts();
  const totalRequired = counts.pass + counts.fail + counts.warning;
  const completionRate = Math.round((counts.pass / totalRequired) * 100);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mobile App Submission Checklist</h1>
        <p className="text-slate-600">iOS App Store & Google Play Store - Pass/Fail Review</p>
      </div>

      {/* Overall Status */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{counts.pass}</div>
            <div className="text-sm text-slate-600">✅ Ready</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">{counts.fail}</div>
            <div className="text-sm text-slate-600">❌ Blockers</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-200">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">{counts.warning}</div>
            <div className="text-sm text-slate-600">⚠️ To Verify</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{completionRate}%</div>
            <div className="text-sm text-slate-600">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Blockers */}
      <Card className="mb-8 border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <XCircle className="h-6 w-6" />
            🚨 Critical Blockers for Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-semibold mb-1">App Icon 1024x1024px</div>
                <p className="text-slate-600">Required for both iOS and Android. Must be PNG, no transparency, rounded corners will be applied automatically.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <span className="text-2xl">📸</span>
              <div>
                <div className="font-semibold mb-1">App Screenshots (min 2)</div>
                <p className="text-slate-600">iPhone: 6.7" display (1290x2796), Android: Various sizes. Show key features: search, listing detail, chat.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <span className="text-2xl">🎨</span>
              <div>
                <div className="font-semibold mb-1">Feature Graphic (Android)</div>
                <p className="text-slate-600">1024x500px promotional banner for Google Play Store listing.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <span className="text-2xl">👤</span>
              <div>
                <div className="font-semibold mb-1">Test Account for Reviewers</div>
                <p className="text-slate-600">Create demo account with pre-populated listings and messages. Include credentials in review notes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg">
              <span className="text-2xl">🎬</span>
              <div>
                <div className="font-semibold mb-1">Splash Screen</div>
                <p className="text-slate-600">Native app launch screen with Zazarap branding.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Warnings */}
      <Card className="mb-8 border-2 border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            ⚠️ Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-yellow-900">
          <div className="flex gap-3">
            <span className="font-bold">iOS:</span>
            <p>Premium payments via web may be flagged by Apple (Guideline 3.1.1). Be prepared to explain that these are marketplace fees, not in-app purchases. Consider implementing as "reader app" exception.</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">Legal:</span>
            <p>Update placeholder addresses (Musterstraße 123) with real zazarap GmbH registered address before submission.</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">Accounts:</span>
            <p>Verify you have Apple Developer Program ($99/year) and Google Play Console ($25 one-time) accounts ready.</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checklist */}
      {sections.map((section, idx) => (
        <Card key={idx} className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlatformIcon(section.platform)}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-xs text-slate-600">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Next Steps */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Next Steps to Submit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900">
          <div className="flex gap-3">
            <span className="font-bold">1.</span>
            <p><strong>Create App Assets:</strong> Icon (1024x1024), Screenshots (6.7" iPhone + Android), Feature Graphic (1024x500)</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">2.</span>
            <p><strong>Developer Accounts:</strong> Register for Apple Developer Program + Google Play Console</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">3.</span>
            <p><strong>Test Account:</strong> Create demo@zazarap.com with sample listings and chats</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">4.</span>
            <p><strong>Base44 Build:</strong> Go to Base44 dashboard → Click "Mobile" → Follow steps to generate iOS/Android builds</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">5.</span>
            <p><strong>Review Notes:</strong> Prepare explanation of marketplace model and premium fees for App Store review</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">6.</span>
            <p><strong>Legal Update:</strong> Replace all placeholder addresses with real zazarap GmbH data</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">7.</span>
            <p><strong>Submit:</strong> Upload builds to App Store Connect and Google Play Console</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Estimate */}
      <Card className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>⏱️ Estimated Timeline</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Asset Creation (Icon, Screenshots, Graphics)</span>
            <strong>2-3 days</strong>
          </div>
          <div className="flex justify-between">
            <span>Developer Account Setup</span>
            <strong>1-2 days</strong>
          </div>
          <div className="flex justify-between">
            <span>Base44 Build Generation</span>
            <strong>1 day</strong>
          </div>
          <div className="flex justify-between">
            <span>Submission & Review (Apple)</span>
            <strong>2-7 days</strong>
          </div>
          <div className="flex justify-between">
            <span>Submission & Review (Google)</span>
            <strong>1-3 days</strong>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between text-lg font-bold text-purple-900">
            <span>Total Estimated Time</span>
            <span>1-2 weeks</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}