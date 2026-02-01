import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageProvider';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AGB() {
  const { t } = useLanguage();
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('agb.title')}</h1>
      <p className="text-sm text-slate-600 mb-6">{t('agb.validFrom')}: {new Date().toLocaleDateString('de-DE')}</p>
      <p className="text-sm text-slate-600 mb-6">
        <strong>{t('agb.operator')}:</strong> zazarap GmbH, Musterstraße 123, 10115 Berlin, Deutschland<br />
        <strong>E-Mail:</strong> info@zazarap.com
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section1.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section1.p1')}</p>
          <p>{t('agb.section1.p2')}</p>
          <p><strong>{t('agb.section1.important')}:</strong> {t('agb.section1.p3')}</p>
          <p>{t('agb.section1.p4')}</p>
          <p>{t('agb.section1.p5')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section2.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section2.p1')}</p>
          <p>{t('agb.section2.p2')}</p>
          <p>{t('agb.section2.p3')}</p>
          <p>{t('agb.section2.p4')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section3.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section3.p1')}</p>
          <p><strong>{t('agb.section3.important')}:</strong> {t('agb.section3.p2')}</p>
          <p>{t('agb.section3.p3')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section4.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section4.intro')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('agb.section4.li1')}</li>
            <li>{t('agb.section4.li2')}</li>
            <li>{t('agb.section4.li3')}</li>
            <li>{t('agb.section4.li4')}</li>
            <li>{t('agb.section4.li5')}</li>
          </ul>
          <p>{t('agb.section4.p2')}</p>
          <p>{t('agb.section4.p3')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section4a.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section4a.p1')}</p>
          <p>{t('agb.section4a.p2')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section5.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section5.intro')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('agb.section5.li1')}</li>
            <li>{t('agb.section5.li2')}</li>
            <li>{t('agb.section5.li3')}</li>
            <li>{t('agb.section5.li4')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section6.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section6.p1')}</p>
          <p><strong>{t('agb.section6.important')}:</strong> {t('agb.section6.p2')}</p>
          <p>{t('agb.section6.p3')}</p>
          <p>{t('agb.section6.p4')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section6b.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section6b.p1')}</p>
          <p>{t('agb.section6b.p2')}</p>
          <p>{t('agb.section6b.p3')}</p>
          <p>
            <Link to={createPageUrl('Widerrufsrecht')} className="text-blue-600 hover:underline">
              → {t('agb.section6b.linkWithdrawal')}
            </Link>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section7.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section7.p1')}</p>
          <p>{t('agb.section7.p2')}</p>
          <p>{t('agb.section7.p3')}</p>
          <p><strong>{t('agb.section7.exceptions')}:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('agb.section7.ex1')}</li>
            <li>{t('agb.section7.ex2')}</li>
            <li>{t('agb.section7.ex3')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section8.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section8.p1')}</p>
          <p>{t('agb.section8.p2')}</p>
          <p>
            {t('agb.section8.odr')}: 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section9.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>
            {t('agb.section9.p1')}{' '}
            <Link to={createPageUrl('PrivacyPolicy')} className="text-blue-600 hover:underline">
              {t('agb.section9.linkPrivacy')}
            </Link>
            {' '}{t('agb.section9.p2')}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section10.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section10.intro')}</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>{t('agb.section10.li1')}</li>
            <li>{t('agb.section10.li2')}</li>
            <li>{t('agb.section10.li3')}</li>
            <li>{t('agb.section10.li4')}</li>
            <li>{t('agb.section10.li5')}</li>
            <li>{t('agb.section10.li6')}</li>
            <li>{t('agb.section10.li7')}</li>
            <li>{t('agb.section10.li8')}</li>
            <li>{t('agb.section10.li9')}</li>
            <li>{t('agb.section10.li10')}</li>
            <li>{t('agb.section10.li11')}</li>
            <li>{t('agb.section10.li12')}</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section11.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section11.p1')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('agb.section11.li1')}</li>
            <li>{t('agb.section11.li2')}</li>
            <li>{t('agb.section11.li3')}</li>
            <li>{t('agb.section11.li4')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section12.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section12.p1')}</p>
          <p>{t('agb.section12.p2')}</p>
          <p>{t('agb.section12.p3')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('agb.section13.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section13.p1')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('agb.section14.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('agb.section14.p1')}</p>
          <p>{t('agb.section14.p2')}</p>
          <p>{t('agb.section14.p3')}</p>
        </CardContent>
      </Card>
    </div>
  );
}