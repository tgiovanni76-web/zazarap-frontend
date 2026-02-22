import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageProvider';

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">{t('privacy.title')}</h1>
      <p className="text-slate-600 mb-6">{t('privacy.validFrom')}: 01. Februar 2026</p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section1.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section1.intro')}</p>
          <p className="mt-2">
            zazarap GmbH<br />
            Musterstraße 123<br />
            10115 Berlin<br />
            Deutschland<br />
            E-Mail: privacy@zazarap.de
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section2.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section2.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('privacy.section2.li1')}</li>
            <li>{t('privacy.section2.li2')}</li>
            <li>{t('privacy.section2.li3')}</li>
            <li>{t('privacy.section2.li4')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section3.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section3.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('privacy.section3.li1')}</li>
            <li>{t('privacy.section3.li2')}</li>
            <li>{t('privacy.section3.li3')}</li>
            <li>{t('privacy.section3.li4')}</li>
            <li>{t('privacy.section3.li5')}</li>
          </ul>
          <p className="mt-3">{t('privacy.section3.consent')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section4.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section4.intro')}</p>
          <p className="mt-2"><strong>{t('privacy.section4.necessary')}</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('privacy.section4.nec1')}</li>
            <li>{t('privacy.section4.nec2')}</li>
            <li>{t('privacy.section4.nec3')}</li>
          </ul>
          <p className="mt-3"><strong>{t('privacy.section4.optional')}</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('privacy.section4.opt1')}</li>
            <li>{t('privacy.section4.opt2')}</li>
            <li>{t('privacy.section4.opt3')}</li>
          </ul>
          <p className="mt-3">{t('privacy.section4.revoke')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section5.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section5.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('privacy.section5.li1')}</li>
            <li>{t('privacy.section5.li2')}</li>
            <li>{t('privacy.section5.li3')}</li>
          </ul>
          <p className="mt-3">{t('privacy.section5.noSale')}</p>
          <p className="mt-2 italic text-slate-600">{t('privacy.section5.notice')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section6.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section6.p1')}</p>
          <p>{t('privacy.section6.p2')}</p>
          <p>{t('privacy.section6.p3')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section7.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section7.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('privacy.section7.li1')}</li>
            <li>{t('privacy.section7.li2')}</li>
            <li>{t('privacy.section7.li3')}</li>
            <li>{t('privacy.section7.li4')}</li>
            <li>{t('privacy.section7.li5')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section8.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section8.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('privacy.section8.li1')}</li>
            <li>{t('privacy.section8.li2')}</li>
            <li>{t('privacy.section8.li3')}</li>
          </ul>
          <p className="mt-3">{t('privacy.section8.deletion')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('privacy.section9.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('privacy.section9.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('privacy.section9.li1')}</li>
            <li>{t('privacy.section9.li2')}</li>
            <li>{t('privacy.section9.li3')}</li>
            <li>{t('privacy.section9.li4')}</li>
            <li>{t('privacy.section9.li5')}</li>
            <li>{t('privacy.section9.li6')}</li>
          </ul>
          <p className="mt-3">{t('privacy.section9.contact')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('privacy.section10.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>{t('privacy.section10.p1')}</p>
          <p className="mt-3"><strong>{t('privacy.validFrom')}:</strong> 01. Februar 2026</p>
        </CardContent>
      </Card>
    </div>
  );
}