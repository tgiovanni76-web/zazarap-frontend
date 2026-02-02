import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, TrendingUp, Users, Star } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WarumPremium() {
  const { t } = useLanguage();

  const features = [
    { name: t('premium.features.visibility'), free: false, premium: true },
    { name: t('premium.features.topAds'), free: false, premium: true },
    { name: t('premium.features.analytics'), free: false, premium: true },
    { name: t('premium.features.support'), free: false, premium: true },
    { name: t('premium.features.multiImages'), free: t('premium.limited'), premium: t('premium.unlimited') },
    { name: t('premium.features.promotions'), free: false, premium: true },
  ];

  const packages = [
    {
      name: t('premium.packages.basic.name'),
      description: t('premium.packages.basic.description'),
      price: '9.99',
      period: t('premium.monthly'),
      features: [
        t('premium.packages.basic.f1'),
        t('premium.packages.basic.f2'),
        t('premium.packages.basic.f3'),
      ],
    },
    {
      name: t('premium.packages.pro.name'),
      description: t('premium.packages.pro.description'),
      price: '19.99',
      period: t('premium.monthly'),
      featured: true,
      features: [
        t('premium.packages.pro.f1'),
        t('premium.packages.pro.f2'),
        t('premium.packages.pro.f3'),
        t('premium.packages.pro.f4'),
      ],
    },
    {
      name: t('premium.packages.business.name'),
      description: t('premium.packages.business.description'),
      price: '49.99',
      period: t('premium.monthly'),
      features: [
        t('premium.packages.business.f1'),
        t('premium.packages.business.f2'),
        t('premium.packages.business.f3'),
        t('premium.packages.business.f4'),
        t('premium.packages.business.f5'),
      ],
    },
  ];

  const stats = [
    { icon: TrendingUp, value: '+300%', label: t('premium.stats.visibility') },
    { icon: Users, value: '10x', label: t('premium.stats.engagement') },
    { icon: Star, value: '95%', label: t('premium.stats.satisfaction') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-yellow-500 text-white px-4 py-1">
            <Zap className="w-4 h-4 mr-2 inline" />
            {t('premium.badge')}
          </Badge>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            {t('premium.title')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('premium.subtitle')}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <Card key={idx} className="text-center border-2 hover:shadow-lg transition">
              <CardContent className="pt-6">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">{t('premium.comparison')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">{t('premium.feature')}</th>
                    <th className="text-center py-4 px-4">{t('premium.free')}</th>
                    <th className="text-center py-4 px-4 bg-yellow-50">
                      <Badge className="bg-yellow-500">{t('premium.premium')}</Badge>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">{feature.name}</td>
                      <td className="text-center py-4 px-4">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-slate-600">{feature.free}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4 bg-yellow-50">
                        {typeof feature.premium === 'boolean' ? (
                          feature.premium ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-slate-900 font-semibold">{feature.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Packages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">{t('premium.choosePlan')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <Card key={idx} className={`${pkg.featured ? 'border-4 border-yellow-500 shadow-2xl scale-105' : 'border-2'} hover:shadow-xl transition`}>
                <CardHeader>
                  {pkg.featured && (
                    <Badge className="mb-2 bg-yellow-500">{t('premium.mostPopular')}</Badge>
                  )}
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <p className="text-slate-600">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">€{pkg.price}</span>
                    <span className="text-slate-600">/{pkg.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${pkg.featured ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-800 hover:bg-slate-900'}`}
                    size="lg"
                  >
                    {t('premium.selectPlan')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{t('premium.howItWorks')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold mb-2">{t('premium.step1.title')}</h3>
                <p className="text-slate-600">{t('premium.step1.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold mb-2">{t('premium.step2.title')}</h3>
                <p className="text-slate-600">{t('premium.step2.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold mb-2">{t('premium.step3.title')}</h3>
                <p className="text-slate-600">{t('premium.step3.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <p className="text-center text-sm text-slate-500">
          {t('premium.legal')}
        </p>
      </div>
    </div>
  );
}