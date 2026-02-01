import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageProvider';

export default function Widerrufsrecht() {
  const { t } = useLanguage();
  
  return (
    <div className="py-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">{t('withdrawal.title')}</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('withdrawal.b2c.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('withdrawal.b2c.intro')}</p>
          <p>{t('withdrawal.b2c.period')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('withdrawal.exercise.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('withdrawal.exercise.p1')}</p>
          <p>{t('withdrawal.exercise.p2')}</p>
          <p>{t('withdrawal.exercise.p3')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('withdrawal.consequences.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('withdrawal.consequences.p1')}</p>
          <p>{t('withdrawal.consequences.p2')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6 border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">{t('withdrawal.c2c.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-900 space-y-2">
          <p className="font-medium">{t('withdrawal.c2c.p1')}</p>
          <p>{t('withdrawal.c2c.p2')}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('withdrawal.exceptions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('withdrawal.exceptions.intro')}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>{t('withdrawal.exceptions.li1')}</li>
            <li>{t('withdrawal.exceptions.li2')}</li>
            <li>{t('withdrawal.exceptions.li3')}</li>
            <li>{t('withdrawal.exceptions.li4')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('withdrawal.platform.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>{t('withdrawal.platform.p1')}</p>
          <p>{t('withdrawal.platform.p2')}</p>
          <p>{t('withdrawal.platform.p3')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('withdrawal.form.title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p>{t('withdrawal.form.p1')}</p>
        </CardContent>
      </Card>
    </div>
  );
}