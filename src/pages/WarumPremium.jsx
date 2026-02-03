import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageProvider';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Check, X, Zap, TrendingUp, Eye, Clock, Star } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

export default function WarumPremium() {
  const { t } = useLanguage();

  const freeFeatures = [
    { icon: Check, text: t('premium.free.feature1') },
    { icon: Check, text: t('premium.free.feature2') },
    { icon: Check, text: t('premium.free.feature3') },
    { icon: X, text: t('premium.free.feature4'), disabled: true },
    { icon: X, text: t('premium.free.feature5'), disabled: true },
    { icon: X, text: t('premium.free.feature6'), disabled: true },
  ];

  const premiumFeatures = [
    { icon: Check, text: t('premium.premium.feature1') },
    { icon: Check, text: t('premium.premium.feature2') },
    { icon: Check, text: t('premium.premium.feature3') },
    { icon: Check, text: t('premium.premium.feature4'), highlight: true },
    { icon: Check, text: t('premium.premium.feature5'), highlight: true },
    { icon: Check, text: t('premium.premium.feature6'), highlight: true },
  ];

  const packages = [
    {
      type: 'featured',
      icon: Star,
      name: t('premium.package.featured.name'),
      description: t('premium.package.featured.desc'),
      prices: [
        { duration: t('premium.duration.1day'), price: '2,99 €' },
        { duration: t('premium.duration.7days'), price: '14,99 €' },
        { duration: t('premium.duration.30days'), price: '49,99 €' }
      ],
      features: [
        t('premium.package.featured.feat1'),
        t('premium.package.featured.feat2'),
        t('premium.package.featured.feat3')
      ],
      color: 'bg-[#FFF8E5] border-[#FFD500]'
    },
    {
      type: 'top',
      icon: TrendingUp,
      name: t('premium.package.top.name'),
      description: t('premium.package.top.desc'),
      prices: [
        { duration: t('premium.duration.1day'), price: '4,99 €' },
        { duration: t('premium.duration.7days'), price: '24,99 €' },
        { duration: t('premium.duration.30days'), price: '79,99 €' }
      ],
      features: [
        t('premium.package.top.feat1'),
        t('premium.package.top.feat2'),
        t('premium.package.top.feat3'),
        t('premium.package.top.feat4')
      ],
      color: 'bg-[#FFEDD5] border-[#E10600]',
      recommended: true
    }
  ];

  const stats = [
    { icon: Eye, value: '10x', label: t('premium.stats.visibility') },
    { icon: Clock, value: '3x', label: t('premium.stats.speed') },
    { icon: Zap, value: '85%', label: t('premium.stats.success') }
  ];

  return (
    <div className="py-4 md:py-8 px-4 max-w-6xl mx-auto">
      <SEOHead 
        title={t('premium.seo.title')}
        description={t('premium.seo.description')}
      />

      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <Badge className="mb-3 md:mb-4 bg-[#E10600] text-[#FFD500] border-2 border-[#FFD500] text-xs">
          <Zap className="h-3 w-3 mr-1" />
          {t('premium.badge')}
        </Badge>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2" style={{
          background: 'linear-gradient(90deg, #E10600 0%, #FFD500 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {t('premium.title')}
        </h1>
        <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto px-2">
          {t('premium.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="text-center border-2 border-[#FFD500]">
              <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                <Icon className="h-6 md:h-8 w-6 md:w-8 text-[#E10600] mx-auto mb-2 md:mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-[#E10600] mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-slate-600">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">{t('premium.comparison.title')}</h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Free Plan */}
          <Card className="border-2">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-center">
                <div className="text-xl md:text-2xl font-bold">{t('premium.comparison.free')}</div>
                <div className="text-xs md:text-sm font-normal text-slate-600 mt-2">0 €</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6">
              <ul className="space-y-2 md:space-y-3">
                {freeFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <li key={idx} className={`flex items-start gap-2 md:gap-3 ${feature.disabled ? 'text-slate-400' : ''}`}>
                      <Icon className={`h-4 md:h-5 w-4 md:w-5 mt-0.5 flex-shrink-0 ${feature.disabled ? 'text-slate-300' : 'text-green-600'}`} />
                      <span className="text-xs md:text-sm">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-[#FFD500] shadow-lg relative overflow-hidden">
            <div className="absolute top-2 md:top-4 right-2 md:right-4">
              <Badge className="bg-[#E10600] text-[#FFD500] border-2 border-[#FFD500] text-xs px-2 py-0.5">
                {t('premium.recommended')}
              </Badge>
            </div>
            <CardHeader style={{ background: 'linear-gradient(135deg, #FFF8E5 0%, #FFEDD5 100%)' }}>
              <CardTitle className="text-center pt-6 md:pt-0">
                <div className="text-xl md:text-2xl font-bold" style={{
                  background: 'linear-gradient(90deg, #E10600 0%, #FFD500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {t('premium.comparison.premium')}
                </div>
                <div className="text-xs md:text-sm font-normal text-slate-600 mt-2">{t('premium.comparison.from')} 2,99 €</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6">
              <ul className="space-y-2 md:space-y-3">
                {premiumFeatures.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <li key={idx} className={`flex items-start gap-2 md:gap-3 ${feature.highlight ? 'font-medium' : ''}`}>
                      <Icon className={`h-4 md:h-5 w-4 md:w-5 mt-0.5 flex-shrink-0 ${feature.highlight ? 'text-[#FFD500]' : 'text-green-600'}`} />
                      <span className="text-xs md:text-sm">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Packages */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 px-2">{t('premium.packages.title')}</h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card key={pkg.type} className={`border-2 ${pkg.color} ${pkg.recommended ? 'shadow-xl' : ''} relative`}>
                {pkg.recommended && (
                  <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-[#E10600] text-[#FFD500] border-2 border-[#FFD500] px-3 md:px-4 py-0.5 md:py-1 text-xs">
                      {t('premium.recommended')}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-6 md:pt-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-2">
                    <Icon className="h-5 md:h-6 w-5 md:w-6 text-[#E10600]" />
                    <CardTitle className="text-lg md:text-xl">{pkg.name}</CardTitle>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600">{pkg.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-xs md:text-sm font-medium text-slate-700 mb-2">{t('premium.packages.pricing')}:</div>
                    <div className="space-y-2">
                      {pkg.prices.map((price, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs md:text-sm bg-white p-2 rounded border border-[#FFD500]">
                          <span className="text-slate-600">{price.duration}</span>
                          <span className="font-bold text-[#E10600]">{price.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-xs md:text-sm font-medium text-slate-700 mb-2">{t('premium.packages.includes')}:</div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs md:text-sm">
                          <Check className="h-3 md:h-4 w-3 md:w-4 text-[#E10600] mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to={createPageUrl('Marketplace')}>
                    <Button className="w-full bg-[#E10600] hover:bg-[#c30500] text-white border-2 border-[#FFD500] text-sm md:text-base">
                      {t('premium.packages.cta')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-center text-xl md:text-2xl px-2">{t('premium.howto.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="bg-[#E10600] text-[#FFD500] rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3 text-lg md:text-xl font-bold border-2 border-[#FFD500]">
                1
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">{t('premium.howto.step1.title')}</h3>
              <p className="text-xs md:text-sm text-slate-600">{t('premium.howto.step1.desc')}</p>
            </div>
            <div className="text-center">
              <div className="bg-[#FFD500] text-[#E10600] rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3 text-lg md:text-xl font-bold border-2 border-[#E10600]">
                2
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">{t('premium.howto.step2.title')}</h3>
              <p className="text-xs md:text-sm text-slate-600">{t('premium.howto.step2.desc')}</p>
            </div>
            <div className="text-center">
              <div className="bg-[#E10600] text-[#FFD500] rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-auto mb-2 md:mb-3 text-lg md:text-xl font-bold border-2 border-[#FFD500]">
                3
              </div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">{t('premium.howto.step3.title')}</h3>
              <p className="text-xs md:text-sm text-slate-600">{t('premium.howto.step3.desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600 text-center">
          {t('premium.legal.notice')}{' '}
          <Link to={createPageUrl('AGB')} className="text-blue-600 hover:underline">
            {t('premium.legal.terms')}
          </Link>
          {' '}{t('premium.legal.and')}{' '}
          <Link to={createPageUrl('Widerrufsrecht')} className="text-blue-600 hover:underline">
            {t('premium.legal.withdrawal')}
          </Link>
        </p>
      </div>
    </div>
  );
}