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
import { useLanguage } from '@/components/LanguageProvider';

export default function Werbung() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me().catch(() => null) });
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
  const [requestModal, setRequestModal] = React.useState({ open: false, packageName: '', price: '' });

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
    toast.success('Promozione attivata sull\'annuncio');
  };

  const openRequest = async (pkg) => {
    if (!(await ensureAuth())) return;
    setRequestModal({ open: true, ...pkg });
  };

  const handleSendRequest = async ({ message }) => {
    if (!user) return;
    await createTicketMutation.mutateAsync({
      userId: user.email,
      subject: `Richiesta pubblicità: ${requestModal.packageName}`,
      message: `${message || ''}\n\nPacchetto: ${requestModal.packageName}\nPrezzo: ${requestModal.price}`,
      category: 'listing',
      priority: 'urgent',
      status: 'open'
    });
    setRequestModal({ open: false, packageName: '', price: '' });
    toast.success('Richiesta inviata. Ti contatteremo a breve.');
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
              price="€4,99"
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo({ packageName: 'TOP-Anzeige', days: 7, price: 4.99 })}
            />
            <PricingCard 
              title={t('ads.packages.highlighted.title')} 
              description={t('ads.packages.highlighted.desc')}
              price="€2,49"
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo({ packageName: 'Hervorgehobene Anzeige', days: 7, price: 2.49 })}
            />
            <PricingCard 
              title={t('ads.packages.premium14.title')} 
              description={t('ads.packages.premium14.desc')}
              price="€8,99"
              btnText={t('ads.btn.buyNow')}
              onAction={() => startPromo({ packageName: 'Premium 14 Tage', days: 14, price: 8.99 })}
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
              price="€14,99 / Monat"
              btnText={t('ads.btn.subscribeNow')}
              onAction={() => openRequest({ packageName: 'Basic Shop-Paket', price: '€14,99 / Monat' })}
            />
             <PricingCard 
              title={t('ads.packages.businessShop.title')} 
              features={[t('ads.features.upTo100Active'), t('ads.features.logoBranding'), t('ads.features.searchBanner')]}
              price="€39,99 / Monat"
              btnText="Jetzt abonnieren"
              highlighted={true}
              onAction={() => openRequest({ packageName: 'Business Shop-Paket', price: '€39,99 / Monat' })}
            />
             <PricingCard 
              title={t('ads.packages.premiumShop.title')} 
              features={[t('ads.features.unlimitedAds'), t('ads.features.homepageBanner'), t('ads.features.prioritySupport')]}
              price="€79,99 / Monat"
              btnText="Jetzt abonnieren"
              onAction={() => openRequest({ packageName: 'Premium Shop-Paket', price: '€79,99 / Monat' })}
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
              price="€149,00 / Woche"
              btnText="Banner buchen"
              onAction={() => openRequest({ packageName: 'Startseiten-Banner', price: '€149,00 / Woche' })}
            />
            <PricingCard 
              title={t('ads.packages.categoryBanner.title')} 
              description={t('ads.packages.categoryBanner.desc')}
              price="€79,00 / Woche"
              btnText="Banner buchen"
              onAction={() => openRequest({ packageName: 'Kategorie-Banner', price: '€79,00 / Woche' })}
            />
            <PricingCard 
              title={t('ads.packages.sidebarAd.title')} 
              description={t('ads.packages.sidebarAd.desc')}
              price="€39,00 / Woche"
              btnText="Banner buchen"
              onAction={() => openRequest({ packageName: 'Sidebar-Werbung', price: '€39,00 / Woche' })}
            />
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
        onClose={() => setRequestModal({ open: false, packageName: '', price: '' })}
        packageName={requestModal.packageName}
        price={requestModal.price}
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