import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SelectListingModalV2 from '@/components/ads/SelectListingModalV2';
import RequestAdModalV2 from '@/components/ads/RequestAdModalV2';
import CreateAdModalV2 from '@/components/ads/CreateAdModalV2';
import { useLanguage } from '@/components/LanguageProviderV2';

export default function WerbungV2() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me().catch(() => null) });
  
  // Use V2 API endpoint
  const { data: pkgData } = useQuery({ 
    queryKey: ['adPackagesV2'], 
    queryFn: async () => (await base44.functions.invoke('listAdPackagesV2')).data, 
    staleTime: 1000 * 60 * 10 
  });
  
  const packages = pkgData?.packages;

  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Listing.filter({ created_by: user.email, status: 'active' }, '-updated_date', 200);
    },
    enabled: !!user,
    initialData: []
  });

  const [selectModal, setSelectModal] = React.useState({ open: false, packageCode: '', days: 0, price: 0 });
  const [adModalOpen, setAdModalOpen] = React.useState(false);
  const [requestModal, setRequestModal] = React.useState({ open: false, packageId: '' });

  const updateListingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Listing.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    }
  });

  const createTicketMutation = useMutation({
    mutationFn: (payload) => base44.entities.SupportTicket.create(payload),
  });

  const ensureAuth = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return false;
    }
    return true;
  };

  const startPromo = async (pkg) => {
    if (!(await ensureAuth())) return;
    setSelectModal({ 
      open: true, 
      packageCode: pkg.packageCode,
      days: pkg.days, 
      price: pkg.priceAmount 
    });
  };

  const handleActivatePromo = async (listingId) => {
    const daysMs = selectModal.days * 24 * 60 * 60 * 1000;
    const until = new Date(Date.now() + daysMs).toISOString();
    await updateListingMutation.mutateAsync({ id: listingId, data: { featured: true, featuredUntil: until } });
    setSelectModal({ open: false, packageCode: '', days: 0, price: 0 });
    toast.success(t('ads.promo.activated'));
  };

  const openRequest = async (pkg) => {
    if (!(await ensureAuth())) return;
    setRequestModal({ open: true, packageId: pkg.id });
  };

  const handleSendRequest = async ({ message }) => {
    if (!user) return;
    const pkg = packages?.[requestModal.packageId];
    const packageTitle = pkg?.packageCode ? t(`pricing.${pkg.packageCode}.title`) : pkg?.name || requestModal.packageId;
    
    await createTicketMutation.mutateAsync({
      userId: user.email,
      subject: `${t('ads.modal.request.title', { pkg: packageTitle, price: '' }).replace(' • ', ': ')}`,
      message: `${message || ''}\n\nPaket: ${packageTitle}\nPreis: ${pkg?.displayPrice || ''}`,
      category: 'ads',
      priority: 'normal',
      status: 'open'
    });
    setRequestModal({ open: false, packageId: '' });
    toast.success(t('ads.request.sent'));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <SEOHead title={`${t('ads.header.title')} – Zazarap`} description={t('ads.header.subtitle')} />
      
      {/* Header */}
      <div className="bg-[#d62020] py-12 px-4 text-center text-white mb-10 shadow-md">
        <h1 className="text-4xl font-bold mb-3">{t('ads.header.title')}</h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">{t('ads.header.subtitle')}</p>
      </div>

      <div className="container max-w-6xl mx-auto px-4">
        
        {/* Banner */}
        <div className="w-full h-48 bg-gradient-to-br from-[#d62020] to-[#ff4b4b] rounded-2xl flex items-center justify-center text-white text-2xl md:text-4xl font-bold mb-16 shadow-xl text-center px-6 transform hover:scale-[1.01] transition-transform duration-300">
          {t('ads.banner.cta')}
        </div>

        {/* Section 1: Private Users */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">{t('ads.section.privateTitle')}</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">{t('ads.section.privateDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              packageCode="top_ad"
              price={packages?.topAd?.displayPrice || '€9,99'}
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo(packages?.topAd || { packageCode: 'top_ad', days: 7, priceAmount: 9.99 })}
            />
            <PricingCard 
              packageCode="highlighted"
              price={packages?.highlighted?.displayPrice || '€3,99'}
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo(packages?.highlighted || { packageCode: 'highlighted', days: 7, priceAmount: 3.99 })}
            />
            <PricingCard 
              packageCode="premium14"
              price={packages?.premium14?.displayPrice || '€14,99'}
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo(packages?.premium14 || { packageCode: 'premium14', days: 14, priceAmount: 14.99 })}
            />
          </div>
        </div>

        {/* Section 2: Business Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">{t('ads.section.businessTitle')}</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">{t('ads.section.businessDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              packageCode="basic_shop"
              features={[t('ads.features.ownShopPage'), t('ads.features.upTo20Active'), t('ads.features.standardSupport')]}
              price={packages?.basicShop?.displayPrice || '€14,99 / Monat'}
              btnText={t('ads.btn.subscribeNow')}
              onAction={() => openRequest(packages?.basicShop || { id: 'basicShop', packageCode: 'basic_shop' })}
            />
            <PricingCard 
              packageCode="business_shop"
              features={[t('ads.features.upTo100Active'), t('ads.features.logoBranding'), t('ads.features.searchBanner')]}
              price={packages?.businessShop?.displayPrice || '€39,99 / Monat'}
              btnText={t('ads.btn.subscribeNow')}
              highlighted={true}
              onAction={() => openRequest(packages?.businessShop || { id: 'businessShop', packageCode: 'business_shop' })}
            />
            <PricingCard 
              packageCode="premium_shop"
              features={[t('ads.features.unlimitedAds'), t('ads.features.homepageBanner'), t('ads.features.prioritySupport')]}
              price={packages?.premiumShop?.displayPrice || '€79,99 / Monat'}
              btnText={t('ads.btn.subscribeNow')}
              onAction={() => openRequest(packages?.premiumShop || { id: 'premiumShop', packageCode: 'premium_shop' })}
            />
          </div>
        </div>

        {/* Section 3: Banner Ads */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">{t('ads.section.bannerTitle')}</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">{t('ads.section.bannerDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              packageCode="home_banner"
              price={packages?.homeBanner?.displayPrice || '€199,00 / Woche'}
              btnText={t('ads.btn.bookBanner')}
              onAction={() => openRequest(packages?.homeBanner || { id: 'homeBanner', packageCode: 'home_banner' })}
            />
            <PricingCard 
              packageCode="category_banner"
              price={packages?.categoryBanner?.displayPrice || '€99,00 / Woche'}
              btnText={t('ads.btn.bookBanner')}
              onAction={() => openRequest(packages?.categoryBanner || { id: 'categoryBanner', packageCode: 'category_banner' })}
            />
            <PricingCard 
              packageCode="sidebar_ad"
              price={packages?.sidebarAd?.displayPrice || '€49,00 / Woche'}
              btnText={t('ads.btn.bookBanner')}
              onAction={() => openRequest(packages?.sidebarAd || { id: 'sidebarAd', packageCode: 'sidebar_ad' })}
            />
          </div>
        </div>

      </div>

      {/* Create Advertising Ad Section */}
      <div className="container max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{t('ads.create.title')}</h3>
            {!user?.canCreateAds && <span className="text-xs text-slate-500">{t('ads.create.subscribersOnly')}</span>}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setAdModalOpen(true)} disabled={!user?.canCreateAds} className="bg-[#d62020] hover:bg-[#b91818]">
              {t('ads.create.newAd')}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SelectListingModalV2 
        open={selectModal.open}
        onClose={() => setSelectModal({ open: false, packageCode: '', days: 0, price: 0 })}
        listings={myListings}
        packageName={selectModal.packageCode ? t(`pricing.${selectModal.packageCode}.title`) : ''}
        days={selectModal.days}
        price={selectModal.price}
        onConfirm={handleActivatePromo}
      />
      <RequestAdModalV2 
        open={requestModal.open}
        onClose={() => setRequestModal({ open: false, packageId: '' })}
        packageId={requestModal.packageId}
        packages={packages}
        onSubmit={handleSendRequest}
      />
      <CreateAdModalV2 
        open={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myAds'] })}
      />
    </div>
  );
}

function PricingCard({ packageCode, features, price, btnText, highlighted = false, onAction }) {
  const { t } = useLanguage();
  const title = t(`pricing.${packageCode}.title`);
  const description = features ? null : t(`pricing.${packageCode}.desc`);

  return (
    <Card className={`h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${highlighted ? 'ring-2 ring-[#d62020] scale-105 relative z-10' : ''}`}>
      {highlighted && (
        <div className="bg-[#d62020] text-white text-xs font-bold text-center py-1 uppercase tracking-wider">
          {t('ads.bestseller')}
        </div>
      )}
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center pt-0">
        {description && <p className="text-gray-600 text-center mb-6 px-2">{description}</p>}
        
        {features && (
          <ul className="space-y-3 mb-8 w-full px-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-600 text-left">
                <Check className="h-5 w-5 text-[#d62020] shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-auto w-full text-center">
          <div className="text-3xl font-bold text-[#d62020] mb-6">{price}</div>
          <Button onClick={onAction} className="w-full bg-[#d62020] hover:bg-[#b91818] text-white font-bold py-6 text-lg rounded-xl transition-colors shadow-md hover:shadow-lg">
            {btnText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}