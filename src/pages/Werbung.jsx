import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import SEOHead from '@/components/SEOHead';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SelectListingModal from '@/components/ads/SelectListingModal';
import RequestAdModal from '@/components/ads/RequestAdModal';
import MediaUploader from '@/components/ads/MediaUploader';
import CreateAdModal from '@/components/ads/CreateAdModal';
import { useLanguage } from '@/components/LanguageProvider';

export default function Werbung() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me().catch(() => null) });
  const { data: pkgData } = useQuery({ queryKey: ['adPackages'], queryFn: async () => (await base44.functions.invoke('listAdPackages')).data, staleTime: 1000 * 60 * 10 });
  React.useEffect(() => { if (pkgData?.packages) setPackages(pkgData.packages); }, [pkgData]);
  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: async () => {
      if (!user) return [];
      // show only active listings created by the user
      return base44.entities.Listing.filter({ created_by: user.email, status: 'active' }, '-updated_date', 200);
    },
    enabled: !!user,
    initialData: []
  });

  const [selectModal, setSelectModal] = React.useState({ open: false, packageName: '', days: 0, price: 0 });
  const [packages, setPackages] = React.useState(null);
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
    setSelectModal({ open: true, ...pkg });
  };

  const handleActivatePromo = async (listingId) => {
    const daysMs = selectModal.days * 24 * 60 * 60 * 1000;
    const until = new Date(Date.now() + daysMs).toISOString();
    await updateListingMutation.mutateAsync({ id: listingId, data: { featured: true, featuredUntil: until } });
    setSelectModal({ open: false, packageName: '', days: 0, price: 0 });
    toast.success(t('ads.modal.select.successToast'));
  };

  const openRequest = async (pkg) => {
    if (!(await ensureAuth())) return;
    setRequestModal({ open: true, packageId: pkg.packageId });
  };

  const handleSendRequest = async ({ message }) => {
    if (!user) return;
    const pkg = packages?.[requestModal.packageId];
    const pkgName = pkg?.packageCode ? t(`ads.packages.${pkg.packageCode}.title`) : requestModal.packageId;
    await createTicketMutation.mutateAsync({
      userId: user.email,
      subject: `${t('ads.modal.request.emailSubject')}: ${pkgName}`,
      message: `${message || ''}\n\n${t('ads.modal.request.emailPackage')}: ${pkgName}\n${t('ads.modal.request.emailPrice')}: ${pkg?.displayPrice || ''}`,
      category: 'ads',
      priority: 'normal',
      status: 'open'
    });
    setRequestModal({ open: false, packageId: '' });
    toast.success(t('ads.modal.request.successToast'));
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

        {/* Section 1 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">{t('ads.section.privateTitle')}</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">{t('ads.section.privateDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title={t('ads.packages.topAd.title')} 
              description={t('ads.packages.topAd.desc')}
              price={packages?.topAd?.displayPrice || '€9,99'}
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo({ packageName: t('ads.packages.topAd.title'), days: 7, price: 9.99 })}
            />
            <PricingCard 
              title={t('ads.packages.highlighted.title')} 
              description={t('ads.packages.highlighted.desc')}
              price={packages?.highlighted?.displayPrice || '€3,99'}
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo({ packageName: t('ads.packages.highlighted.title'), days: 7, price: 3.99 })}
            />
            <PricingCard 
              title={t('ads.packages.premium14.title')} 
              description={t('ads.packages.premium14.desc')}
              price={packages?.premium14?.displayPrice || '€14,99'}
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo({ packageName: t('ads.packages.premium14.title'), days: 14, price: 14.99 })}
            />
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">{t('ads.section.businessTitle')}</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">{t('ads.section.businessDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <PricingCard 
               title={t('ads.packages.basicShop.title')} 
               features={[t('ads.features.ownShopPage'), t('ads.features.upTo20Active'), t('ads.features.standardSupport')]}
               price={packages?.basicShop?.displayPrice || '€14,99 / Monat'}
               btnText={t('ads.btn.subscribeNow')}
               onAction={() => openRequest({ packageId: 'basicShop' })}
             />
             <PricingCard 
               title={t('ads.packages.businessShop.title')} 
               features={[t('ads.features.upTo100Active'), t('ads.features.logoBranding'), t('ads.features.searchBanner')]}
               price={packages?.businessShop?.displayPrice || '€39,99 / Monat'}
               btnText={t('ads.btn.subscribeNow')}
               highlighted={true}
               onAction={() => openRequest({ packageId: 'businessShop' })}
             />
             <PricingCard 
               title={t('ads.packages.premiumShop.title')} 
               features={[t('ads.features.unlimitedAds'), t('ads.features.homepageBanner'), t('ads.features.prioritySupport')]}
               price={packages?.premiumShop?.displayPrice || '€79,99 / Monat'}
               btnText={t('ads.btn.subscribeNow')}
               onAction={() => openRequest({ packageId: 'premiumShop' })}
             />
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left border-l-4 border-[#d62020] pl-4">{t('ads.section.bannerTitle')}</h2>
          <p className="text-gray-600 mb-8 text-center md:text-left pl-5">{t('ads.section.bannerDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title={t('ads.packages.homeBanner.title')} 
              description={t('ads.packages.homeBanner.desc')}
              price={packages?.homeBanner?.displayPrice || '€199,00'}
              btnText={t('ads.btn.bookBanner')}
              onAction={() => openRequest({ packageId: 'homeBanner' })}
            />
            <PricingCard 
              title={t('ads.packages.categoryBanner.title')} 
              description={t('ads.packages.categoryBanner.desc')}
              price={packages?.categoryBanner?.displayPrice || '€99,00'}
              btnText={t('ads.btn.bookBanner')}
              onAction={() => openRequest({ packageId: 'categoryBanner' })}
            />
            <PricingCard 
              title={t('ads.packages.sidebarAd.title')} 
              description={t('ads.packages.sidebarAd.desc')}
              price={packages?.sidebarAd?.displayPrice || '€49,00'}
              btnText={t('ads.btn.bookBanner')}
              onAction={() => openRequest({ packageId: 'sidebarAd' })}
            />
          </div>
        </div>

      </div>

      {/* Create Advertising Ad Modal (gated) */}
      <div className="container max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{t('ads.adListing.title')}</h3>
            {!user?.canCreateAds && <span className="text-xs text-slate-500">{t('ads.adListing.subscribersOnly')}</span>}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setAdModalOpen(true)} disabled={!user?.canCreateAds} className="bg-[#d62020] hover:bg-[#b91818]">{t('ads.adListing.createNew')}</Button>
          </div>
        </div>
      </div>
      {/* Modals */}
      <SelectListingModal 
        open={selectModal.open}
        onClose={() => setSelectModal({ open: false, packageName: '', days: 0, price: 0 })}
        listings={myListings}
        packageName={selectModal.packageName}
        days={selectModal.days}
        price={selectModal.price}
        onConfirm={handleActivatePromo}
      />
      <RequestAdModal 
        open={requestModal.open}
        onClose={() => setRequestModal({ open: false, packageId: '' })}
        packageId={requestModal.packageId}
        packages={packages}
        onSubmit={handleSendRequest}
      />
    </div>
  );
}

function PricingCard({ title, description, features, price, btnText, highlighted = false, onAction }) {
  const { t } = useLanguage();
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