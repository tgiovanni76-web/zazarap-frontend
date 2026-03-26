// @ts-check
import React, { useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from '@/components/core/ErrorBoundary';
import PerformanceMonitor from '@/components/monitoring/PerformanceMonitor';
import GlobalErrorListener from '@/components/core/GlobalErrorListener';
import NetworkStatusBanner from '@/components/core/NetworkStatusBanner';
import OfflineFormGuard from '@/components/core/OfflineFormGuard';
import FirstRunChecklist from '@/components/onboarding/FirstRunChecklist';

import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { LayoutDashboard, Plus, Bell, Settings, TrendingUp, Package, Home, LogOut, User, ArrowLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { initAuditLogger } from '@/components/auditLogger';
import { footerT } from '@/components/i18n/footer';





import { LanguageProvider, useLanguage } from '@/components/LanguageProvider';
import ScrollToTop from '@/components/core/ScrollToTop';
const StructuredData = lazy(() => import('@/components/marketplace/StructuredData'));
const SEOHead = lazy(() => import('@/components/SEOHead'));
const LanguageSwitcher = lazy(() => import('@/components/LanguageSwitcher'));
const CookieBanner = lazy(() => import('@/components/CookieBanner'));



function LayoutContent({ children, currentPageName, user, unreadCount }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

/**
 * @param {{children: React.ReactNode, currentPageName?: string}} props
 */
export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <ScrollToTop />
      <LayoutInner children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}

function LayoutInner({ children, currentPageName }) {
        const { t, currentLanguage } = useLanguage();
        const ADD_PHOTO_LABELS = { de: 'Foto hinzufügen', it: 'Aggiungi foto', en: 'Add photo', fr: 'Ajouter une photo', pl: 'Dodaj zdjęcie', tr: 'Fotoğraf ekle', uk: 'Додати фото' };
        const addPhotoLabel = ADD_PHOTO_LABELS[currentLanguage] || ADD_PHOTO_LABELS.de;
        const navigate = useNavigate();
        const queryClient = useQueryClient();
        const fileInputRef = React.useRef(null);

        const onAddPhotoClick = () => {
          fileInputRef.current?.click();
        };

        const onFileChange = async (e) => {
          const file = e.target?.files?.[0];
          if (!file) return;
          const allowed = ['image/jpeg','image/png','image/webp'];
          if (!allowed.includes(file.type)) {
            alert('Formato non supportato. Usa JPG, PNG o WEBP.');
            e.target.value = '';
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            alert('Dimensione massima 5MB.');
            e.target.value = '';
            return;
          }
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          await base44.auth.updateMe({ profilePhoto: file_url, profileImageUrl: file_url });
          await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          e.target.value = '';
        };

        // Initialize global audit logger once
        useEffect(() => { initAuditLogger(base44); }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user && (!user.birthDate || !user.privacyAccepted) && currentPageName !== 'CompleteProfile' && currentPageName !== 'OTPLogin') {
      console.log('[Layout] User needs to complete profile, redirecting...');
      navigate(createPageUrl('CompleteProfile'), { replace: true });
    }
  }, [user, currentPageName, navigate]);

  // Redirect initial landing from AGB to Home (default start page)
  useEffect(() => {
    if (currentPageName === 'AGB') {
      const path = window.location.pathname || '';
      const hasRef = !!document.referrer;
      const hasParams = (window.location.search && window.location.search !== '') || (window.location.hash && window.location.hash !== '');
      if (path === '/' || (!hasRef && !hasParams)) {
        navigate(createPageUrl('Home'), { replace: true });
      }
    }
  }, [currentPageName, navigate]);

  const { data: seoSettings } = useQuery({
    queryKey: ['seoSettings'],
    queryFn: async () => {
      try {
        const res = await base44.entities.SEOSettings.list();
        return res[0] || {};
      } catch (error) {
        console.log('SEO Settings not available:', error);
        return {};
      }
    }
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email, 'unread'],
    queryFn: () => base44.entities.Notification.filter({ userId: user.email, read: false }, '-created_date'),
    enabled: !!user,
  });

  // Real-time notifications: refresh unread badge instantly when a notification for this user changes
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event?.data?.userId === user.email) {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.email, 'unread'] });
      }
    });
    return unsubscribe;
  }, [user?.email, queryClient]);

  const unreadCount = notifications.length;

  // Sticky header height -> CSS variable (desktop/mobile + safe-area)
  useEffect(() => {
    const setVar = () => {
      const el = document.getElementById('app-header');
      if (!el) return;
      const h = el.offsetHeight || 64;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };
    setVar();

    // Observe header size and viewport/orientation changes
    let ro;
    const el = document.getElementById('app-header');
    if (el && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => setVar());
      ro.observe(el);
    }
    const onResize = () => setVar();
    const onOrientation = () => setVar();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientation);
    // iOS visual viewport resize (keyboard/toolbar)
    const vv = window.visualViewport;
    if (vv) vv.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientation);
      if (vv) vv.removeEventListener('resize', onResize);
      if (ro && el) ro.unobserve(el);
    };
  }, []);

  const TL = (k, fb) => {
    const v = t(k);
    return v === k ? (footerT(k.replace('footer.', ''), currentLanguage) || fb) : v;
  };

  return (
    <ErrorBoundary>
      <div className="h-auto min-h-0 bg-[var(--z-bg)] text-[var(--z-text)] overflow-visible max-w-full">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white text-black px-3 py-2 rounded">Salta al contenuto</a>
        <GlobalErrorListener />
        <PerformanceMonitor />
        <NetworkStatusBanner />
        <OfflineFormGuard />
        <Suspense fallback={null}>
            <SEOHead googleVerification={seoSettings?.googleSiteVerification} />
            <StructuredData type="organization" data={{}} />
          </Suspense>
      <style>{`
          :root {
            /* Global palette from app icon */
            --z-gray-light: #F5F7FB;        /* Sfondo generale */
            --z-red: #1F3C88;               /* Legacy var used across styles -> now Primary */
            --z-yellow: #FFD200;            /* Accent (giallo Z) */
            --z-black: #1A1A1A;             /* Testo principale */

            /* New theme tokens */
            --z-primary: #1F3C88;
            --z-primary-dark: #162E6B;
            --z-primary-light: #2A56C6;
            --z-accent: #FFD200;
            --z-bg: #F5F7FB;
            --z-card: #FFFFFF;
            --z-text: #1A1A1A;
            --z-text-on-primary: #FFFFFF;
            --z-text-secondary: #6B7280;
            --z-border-soft: #E4E7EC;
            --z-link: #2A56C6;
            --z-link-hover: #1F3C88;

            /* shadcn/ui semantic tokens (HSL for Tailwind) */
            --background: 219 42% 97%;
            --foreground: 0 0% 10%;
            --card: 0 0% 100%;
            --card-foreground: 0 0% 10%;
            --popover: 0 0% 100%;
            --popover-foreground: 0 0% 10%;
            --primary: 223 63% 33%;
            --primary-foreground: 0 0% 100%;
            --secondary: 0 0% 100%;
            --secondary-foreground: 0 0% 10%;
            --muted: 219 42% 97%;
            --muted-foreground: 221 9% 46%;
            --accent: 49 100% 50%;
            --accent-foreground: 0 0% 10%;
            --destructive: 0 84% 60%;
            --destructive-foreground: 0 0% 100%;
            --border: 217 17% 91%;
            --input: 217 17% 91%;
            --ring: 223 63% 33%;
          }

          /* Base typography & links */
          body { background: var(--z-bg); color: var(--z-text); }
          a { color: var(--z-link); }
          a:hover { color: var(--z-link-hover); }
          html { scroll-behavior: smooth; }



          /* Spaziatura safe-area + respiro sotto */
          form { padding-bottom: 32px !important; }
          @supports (padding: env(safe-area-inset-bottom)) {
            form { padding-bottom: calc(env(safe-area-inset-bottom) + 32px) !important; }
          }

          /* Input più usabili su iOS (no zoom) */
          input, select, textarea, button {
            font-size: 16px !important;
          }

          /* Card/form più stabile */
          form, form * { box-sizing: border-box; }

          /* Bottone submit più chiaro e grande */
          form button[type="submit"], form [type="submit"] {
            min-height: 52px !important;
            border-radius: 12px !important;
          }

          /* Scrolling globale: nessun blocco su body/html, niente overflow hidden */
          html, body {
            height: 100vh !important;
            min-height: 100vh !important;
            /* allow scroll; dialog/lightbox will trap focus itself */
            overflow: auto !important;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
            overscroll-behavior: none;
            scroll-snap-type: none !important;
          }
          main {
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: none !important;
          }
          /* Mantieni overlay/menus visibili senza forzare il body/main */
          header, form, section {
            overflow: visible;
          }

          /* HEADER */
          .zaza-header {
            background: #ffffff;
            color: var(--z-red);
            padding: 16px;
            font-size: 22px;
            font-weight: bold;
            border-bottom: 3px solid var(--z-red);
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }

          /* SEARCH BAR */
          .zaza-search {
            background: var(--z-gray-light);
            border: 2px solid var(--z-red);
            padding: 12px;
            border-radius: 12px;
            font-size: 16px;
            margin: 14px;
          }

          /* CATEGORIE */
          .zaza-cat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            padding: 10px;
          }

          .zaza-cat-card {
            background: var(--z-yellow);
            color: #b91c1c; /* Darker red for better contrast */
            border-radius: 14px;
            padding: 20px;
            text-align: center;
            font-weight: bold;
            border: 2px solid #b91c1c;
            font-size: 20px;
          }

          .zaza-cat-card span {
            display: block;
            font-size: 14px;
            margin-top: 6px;
          }

          /* ANNUNCI */
          .zaza-card {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            padding-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            position: relative;
          }

          .zaza-card-title {
            color: var(--z-black);
            font-weight: bold;
            margin: 8px;
          }

          .zaza-card-price {
            color: var(--z-red);
            font-size: 18px;
            font-weight: bold;
            margin: 0 8px 8px;
          }

          /* PUBBLICA BUTTON */
          .zaza-btn-pubblica {
            background: var(--z-red);
            color: white;
            padding: 15px;
            margin: 16px;
            border-radius: 14px;
            text-align: center;
            border: 3px solid var(--z-yellow);
            font-size: 18px;
            font-weight: bold;
          }

          /* FOOTER */
          .zaza-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            border-top: 1px solid #ddd;
          }

          .zaza-footer-item {
            color: var(--z-black);
            text-align: center;
            font-size: 12px;
          }

          .zaza-footer-active {
            color: var(--z-red);
            font-weight: bold;
          }

          /* Legacy styles maintained for compatibility */
          .zaza-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            padding: 10px;
          }

          @media (min-width: 680px) {
            .zaza-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .zaza-img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            background: var(--z-gray-light);
          }

          .zaza-heart {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.9);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: var(--z-red);
            cursor: pointer;
            z-index: 10;
          }

          .zaza-heart.active,
          .zaza-heart-active {
            color: var(--z-red);
            transform: scale(1.3);
          }

          .zaza-title {
            font-size: 14px;
            font-weight: bold;
            margin: 6px;
            line-height: 1.2em;
            color: var(--z-black);
          }

          .zaza-price {
            font-size: 16px;
            font-weight: bold;
            color: var(--z-red);
            margin: 0 6px;
          }

          .zaza-location {
            font-size: 12px;
            color: #666;
            margin: 0 6px 6px 6px;
          }

          .zaza-category {
            display: inline-block;
            background: var(--z-yellow);
            color: var(--z-red);
            padding: 2px 8px;
            font-size: 11px;
            border-radius: 6px;
            margin: 4px 6px;
            border: 1px solid var(--z-red);
          }

          .zaza-detail-img {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 15px;
          }

          .zaza-detail-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 6px;
          }

          .zaza-detail-price {
            font-size: 22px;
            color: var(--z-red);
            font-weight: bold;
            margin-bottom: 10px;
          }

          .zaza-detail-location {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
          }

          .zaza-detail-category {
            display: inline-block;
            background: var(--z-yellow);
            color: var(--z-red);
            padding: 4px 10px;
            font-size: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border: 2px solid var(--z-red);
          }

          .zaza-detail-description {
            font-size: 15px;
            line-height: 1.4em;
            margin-bottom: 25px;
          }

          .zaza-contact-btn {
            background-color: var(--z-red);
            color: white;
            padding: 14px;
            font-size: 16px;
            text-align: center;
            border-radius: 8px;
            font-weight: bold;
            border: 3px solid var(--z-yellow);
            cursor: pointer;
            width: 100%;
          }

          .zaza-form-label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
            display: block;
          }

          .zaza-input {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ccc;
            margin-bottom: 15px;
          }

          .zaza-upload {
            border: 2px dashed var(--z-red);
            color: var(--z-red);
            background: var(--z-gray-light);
            padding: 20px;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 20px;
            cursor: pointer;
            font-weight: bold;
          }

          .zaza-submit {
            background: var(--z-red);
            color: white;
            padding: 14px;
            font-size: 16px;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
            border: 3px solid var(--z-yellow);
            cursor: pointer;
            width: 100%;
          }

          .zaza-profile-pic {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin: 20px auto;
            display: block;
          }

          .zaza-profile-name {
            font-size: 20px;
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .zaza-profile-count {
            font-size: 14px;
            text-align: center;
            color: #666;
            margin-bottom: 20px;
          }

          .zaza-profile-btn {
            background: var(--z-red);
            color: white;
            padding: 12px;
            border-radius: 10px;
            margin: 10px 0;
            text-align: center;
            font-weight: bold;
            display: block;
            text-decoration: none;
            border: 2px solid var(--z-yellow);
            cursor: pointer;
            width: 100%;
          }

          .zaza-filters {
            background: white;
            padding: 12px;
            border-radius: 12px;
            box-shadow: 0px 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 18px;
            border: 1px solid #ddd;
          }

          .zaza-filters-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--z-black);
          }

          .zaza-filters-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .zaza-filter-input,
          .zaza-filter-select {
            width: 100%;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 14px;
          }

          .zaza-filter-btn {
            margin-top: 14px;
            width: 100%;
            background: var(--z-red);
            color: white;
            padding: 12px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            border: none;
            cursor: pointer;
          }

          .zaza-filters-bar {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding: 10px;
          }

          .zaza-filter-chip {
            padding: 8px 14px;
            background: var(--z-gray-light);
            color: var(--z-black);
            font-size: 14px;
            border-radius: 20px;
            white-space: nowrap;
            border: 1px solid #ccc;
            cursor: pointer;
          }

          .zaza-filter-advanced-btn {
            padding: 8px 14px;
            background: var(--z-red);
            color: white;
            border-radius: 20px;
            font-size: 14px;
            white-space: nowrap;
            border: none;
            cursor: pointer;
          }

          .zaza-filter-panel {
            background: white;
            padding: 20px;
            border-radius: 14px;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.2);
          }

          .zaza-filter-panel-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .zaza-filter-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
          }

          .zaza-filter-apply,
          .zaza-filter-reset {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-size: 16px;
            text-align: center;
            margin-top: 10px;
            border: none;
            cursor: pointer;
          }

          .zaza-filter-apply {
            background: var(--z-red);
            color: white;
          }

          .zaza-filter-reset {
            background: var(--z-gray-light);
            color: var(--z-black);
          }

          .zaza-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 65px;
            background: white;
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-top: 1px solid #ddd;
            z-index: 999;
            box-shadow: 0px -2px 6px rgba(0,0,0,0.08);
          }

          .zaza-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 12px;
            color: var(--z-black);
            text-decoration: none;
            cursor: pointer;
          }

          .zaza-nav-item-active {
            color: var(--z-red);
          }

          .zaza-nav-icon {
            font-size: 22px;
            margin-bottom: 3px;
          }

          .zaza-premium-box {
            background: #fff8e5;
            border: 2px solid var(--z-yellow);
            padding: 12px;
            border-radius: 12px;
            margin-top: 15px;
          }

          .zaza-premium-title {
            font-weight: bold;
            color: var(--z-red);
          }

          /* CHAT LAYOUT */
          .zaza-chat-container {
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          /* MESSAGGI SINISTRA (venditore) */
          .zaza-msg-left {
            max-width: 80%;
            padding: 10px;
            background: #e6e6e6;
            border-radius: 10px;
            align-self: flex-start;
          }

          /* MESSAGGI DESTRA (acquirente) */
          .zaza-msg-right {
            max-width: 80%;
            padding: 10px;
            background: #d4f6c6;
            border-radius: 10px;
            align-self: flex-end;
          }

          /* PREZZO NEL MESSAGGIO */
          .zaza-price-tag {
            font-weight: bold;
            color: #E10600;
          }

          /* BOX INPUT */
          .zaza-chat-inputbox {
            position: fixed;
            bottom: 60px;
            left: 0;
            right: 0;
            background: white;
            padding: 10px;
            display: flex;
            gap: 10px;
          }

          /* PULSANTI DEL VENDITORE */
          .zaza-offer-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }

          .zaza-btn-accept {
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
          }

          .zaza-btn-reject {
            background: #FF5252;
            color: white;
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
          }

          .zaza-btn-counter {
            background: #FFBF00;
            color: black;
            padding: 10px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
          }
        `}</style>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />
      <header id="app-header" className="bg-[var(--z-primary)] px-5 py-2.5 border-b-[3px] border-[var(--z-accent)] rounded-b-xl sticky top-0 z-[999] min-h-[60px] md:min-h-[72px] max-w-full overflow-visible shadow-none">
                    <div className="flex items-center justify-between text-white max-w-full">
                      {/* Logo + Slogan + Home */}
                                      <div className="flex items-center gap-4">
                                        <Link to={createPageUrl('Marketplace')} className="no-underline flex flex-col leading-tight">
                                          <span className="text-[18px] md:text-[26px] font-extrabold" style={{ color: 'var(--z-accent)', textShadow: '0 1px 0 rgba(0,0,0,0.25)' }}>Zazarap.de</span>
                                          <span className="text-[10px] md:text-xs tracking-wide text-white/80 mt-0.5">kleinanzeigen</span>
                                          </Link>

                                      </div>

                      {/* Menu Icons */}
                      <nav className="flex items-center gap-1.5 md:gap-4" aria-label="Main navigation">
                        {/* Mobile overflow handling */}
                        <style>{`@media (max-width: 380px){ #app-header nav a, #app-header nav button{transform:scale(0.92)} }`}</style>
                        <Link to={createPageUrl('Marketplace')} className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white" title={t('aria.home')} aria-label={t('aria.home')}>
                          <Home className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" focusable="false" />
                        </Link>

                        {/* Plus - sempre visibile */}
                        {user ? (
                          <Link to={createPageUrl('NewListing')} className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white" title={t('aria.create')} aria-label={t('aria.create')}>
                            <Plus className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" focusable="false" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => base44.auth.redirectToLogin(createPageUrl('NewListing'))}
                            className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white"
                            title={t('aria.create')}
                            aria-label={t('aria.create')}
                          >
                            <Plus className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" focusable="false" />
                          </button>
                        )}

                        {/* Notifiche */}
                        {user ? (
                          <Link to={createPageUrl('Notifications')} className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white relative" title={t('aria.notifications')} aria-label={`${t('aria.notifications')}${unreadCount > 0 ? `, ${unreadCount} ungelesen` : ''}`}>
                            <Bell className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" focusable="false" />
                            {unreadCount > 0 && (
                              <Badge className="absolute -top-1 -right-1 bg-white text-[var(--z-primary)] px-1 py-0.5 text-[10px]" aria-hidden="true">
                                {unreadCount}
                              </Badge>
                            )}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => base44.auth.redirectToLogin(createPageUrl('Notifications'))}
                            className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white"
                            title={t('aria.notifications')}
                            aria-label={t('aria.notifications')}
                          >
                            <Bell className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" focusable="false" />
                          </button>
                        )}

                        {/* Menu profilo 👤 */}
                        {user && (
                          <span className="hidden md:inline text-white/70 text-[11px] md:text-xs mr-1 md:mr-2 truncate max-w-[90px] md:max-w-none">
                            👋 {(
                              currentLanguage === 'it' ? 'Ciao' :
                              currentLanguage === 'de' ? 'Hallo' :
                              currentLanguage === 'en' ? 'Hello' :
                              currentLanguage === 'fr' ? 'Bonjour' :
                              currentLanguage === 'pl' ? 'Cześć' :
                              currentLanguage === 'tr' ? 'Merhaba' : 'Hallo'
                            )}, {user.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            {user ? (
                              (user.profilePhoto || user.profileImageUrl) ? (
                                <button className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-full overflow-hidden focus:ring-2 focus:ring-white border-2 border-white/20" title="Account" aria-label="Account">
                                  <img src={user.profilePhoto || user.profileImageUrl} alt="Foto profilo" className="h-full w-full object-cover" />
                                </button>
                              ) : (
                                <button onClick={onAddPhotoClick} onPointerDown={(e)=>{e.preventDefault(); e.stopPropagation();}} className="px-2 h-7 md:h-8 inline-flex items-center justify-center text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white border border-white/30 text-xs" title={addPhotoLabel} aria-label={addPhotoLabel}>
                                  {addPhotoLabel}
                                </button>
                              )
                            ) : (
                              <button className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 text-white hover:text-[var(--z-accent)] rounded focus:ring-2 focus:ring-white" title="Account" aria-label="Account">
                                <User className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" focusable="false" />
                              </button>
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[220px]">
                            {user ? (
                              <>
                                <Link to={createPageUrl('UserProfile')}><DropdownMenuItem>Mein Konto</DropdownMenuItem></Link>
                                <Link to={createPageUrl('UserSettings')}><DropdownMenuItem>Einstellungen</DropdownMenuItem></Link>
                                <Link to={createPageUrl('MyListings')}><DropdownMenuItem>Meine Anzeigen</DropdownMenuItem></Link>
                                <Link to={createPageUrl('Messages')}><DropdownMenuItem>Nachrichten</DropdownMenuItem></Link>
                                <Link to={createPageUrl('WarumPremium')}><DropdownMenuItem>Premium</DropdownMenuItem></Link>
      {user?.role === 'admin' && (
        <Link to={createPageUrl('AdminDashboard')}><DropdownMenuItem>Admin-Panel</DropdownMenuItem></Link>
      )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}>Benutzer wechseln</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl('Home'))}>Abmelden</DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}>Anmelden</DropdownMenuItem>
                                <Link to={createPageUrl('WarumPremium')}><DropdownMenuItem>Premium</DropdownMenuItem></Link>
                                <DropdownMenuItem onClick={() => base44.auth.redirectToLogin(createPageUrl('Home'))}>Registrieren</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="inline-flex items-center justify-center" title={t('aria.language')} aria-label={t('aria.language')}><Suspense fallback={null}><LanguageSwitcher /></Suspense></div>
                      </nav>
                    </div>
                  </header>

      {/* EmailVerificationBanner removed as requested */}
      
      <main id="main-content" role="main" tabIndex={-1} className="container max-w-7xl mx-auto px-4 overflow-x-hidden overflow-y-auto h-auto min-h-0 pb-24" style={{ height: 'calc(100vh - var(--header-height, 64px))', WebkitOverflowScrolling: 'touch' }}>
        <FirstRunChecklist user={user} onAddPhotoClick={onAddPhotoClick} />
        {children}

        {user?.role === 'admin' && currentPageName !== 'AdminDashboard' && ([
          'ManageUsers','ModerateListings','AdminModeration','AdminDisputes','AdminTickets','AdminReports','AdminPayments','AdminSettings','AdminSEO','SystemLogs','SystemCheckup','PreLaunchChecklist','AccessibilityAudit','ManageCategories','RejectedListings','AdminAnalytics','MarketplaceDashboard'
        ].includes(currentPageName)) && (
          <div className="container max-w-7xl mx-auto px-4 mb-4 -mt-4">
            <Link
              to={createPageUrl('AdminDashboard')}
              className="inline-flex items-center gap-2 bg-white text-[var(--z-primary)] border border-[var(--z-primary)] rounded-full px-3 py-1.5 shadow-sm hover:bg-[var(--z-primary)] hover:text-white"
              aria-label="Zurück zum Admin-Panel"
              title="Zurück zum Admin-Panel"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Admin-Panel</span>
            </Link>
          </div>
        )}

        <Suspense fallback={null}>
          <CookieBanner />
        </Suspense>

        {/* Footer inside scrollable content */}
        <footer className="bg-[var(--z-primary-dark)] text-white/80 mt-12 py-3 md:py-4 lg:py-5">
                    <div className="max-w-[1100px] mx-auto px-4 flex flex-wrap gap-3 md:gap-5">
                      {/* Logo + Newsletter */}
                      <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                        {/* Zazarap.de */}
                        <div>
                          <h3 className="font-medium text-[11px] md:text-xs mb-1 text-slate-300">{TL('footer.company','Zazarap.de')}</h3>
                          <ul className="space-y-0.5 md:space-y-1 text-[11px] md:text-xs leading-tight">
                            <li><Link to={createPageUrl('UeberUns')} className="text-slate-500 hover:text-slate-300">{TL('footer.about','Über uns')}</Link></li>
                            <li><Link to={createPageUrl('Contact')} className="text-slate-500 hover:text-slate-300">{TL('footer.contact','Kontakt')}</Link></li>
                            <li><Link to={createPageUrl('SicherheitsHinweise')} className="text-slate-500 hover:text-slate-300">{TL('footer.security','Sicherheit')}</Link></li>
                            <li><Link to={createPageUrl('FAQ')} className="text-slate-500 hover:text-slate-300">{TL('footer.faq','FAQ')}</Link></li>
                          </ul>
                        </div>

                        {/* Rechtliches */}
                        <div>
                          <h3 className="font-medium text-[11px] md:text-xs mb-1 text-slate-300">{TL('footer.legal','Rechtliches')}</h3>
                          <ul className="space-y-0.5 md:space-y-1 text-[11px] md:text-xs leading-tight">
                            <li><Link to={createPageUrl('Impressum')} className="text-slate-500 hover:text-slate-300">{TL('footer.imprint','Impressum')}</Link></li>
                            <li><Link to={createPageUrl('Datenschutz')} className="text-slate-500 hover:text-slate-300">{TL('footer.privacy','Datenschutz')}</Link></li>
                            <li><Link to={createPageUrl('AGB')} className="text-slate-500 hover:text-slate-300">{TL('footer.terms','AGB')}</Link></li>
                            <li><Link to={createPageUrl('Nutzungsbedingungen')} className="text-slate-500 hover:text-slate-300">{TL('footer.tos','Nutzungsbedingungen')}</Link></li>
                            <li><Link to={createPageUrl('CookieRichtlinie')} className="text-slate-500 hover:text-slate-300">{TL('footer.cookies','Cookies')}</Link></li>
                          </ul>
                        </div>

                        {/* Service */}
                        <div>
                          <h3 className="font-medium text-[11px] md:text-xs mb-1 text-slate-300">{TL('footer.service','Service')}</h3>
                          <ul className="space-y-0.5 md:space-y-1 text-[11px] md:text-xs leading-tight">
                            <li><Link to={createPageUrl('Support')} className="text-slate-500 hover:text-slate-300">{TL('footer.support','Support')}</Link></li>
                            <li><Link to={createPageUrl('Hilfe')} className="text-slate-500 hover:text-slate-300">{TL('footer.help','Hilfe')}</Link></li>
                            <li><Link to={createPageUrl('Plattformregeln')} className="text-slate-500 hover:text-slate-300">{TL('footer.platformRules','Plattformregeln')}</Link></li>
                          </ul>
                        </div>

                        {/* Folge uns */}
                        <div>
                          <h3 className="font-medium text-[11px] md:text-xs mb-1 text-slate-300">{TL('footer.followUs','Folge uns')}</h3>
                          <ul className="space-y-0.5 md:space-y-1 text-[11px] md:text-xs leading-tight">
                            <li className="text-slate-500">{t('footer.twitterSoon') || 'Twitter (bald)'}</li>
                            <li className="text-slate-500">{t('footer.instagramSoon') || 'Instagram (bald)'}</li>
                            <li className="text-slate-500">{t('footer.linkedinSoon') || 'LinkedIn (bald)'}</li>
                          </ul>
                        </div>
                      </div>
                      </div>

                      {/* Für Unternehmen */}
                      <div className="max-w-[1100px] mx-auto px-4 w-full">
                        {/* Desktop: Dropdown on click */}
                        <div className="hidden lg:block">
                          <div className="text-[10px] text-slate-400 mb-1">Für Händler & Unternehmen</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-[11px] md:text-xs text-slate-300 hover:text-slate-200 bg-transparent border border-[#243246] rounded-full px-3 py-1">
                                Für Unternehmen – Werbung
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[220px]">
                              <Link to={createPageUrl('Business')}><DropdownMenuItem>Werbung schalten</DropdownMenuItem></Link>
                              <Link to={`${createPageUrl('Business')}?view=pricing`}><DropdownMenuItem>Preise & Pakete</DropdownMenuItem></Link>
                              <Link to={createPageUrl('BusinessContact')}><DropdownMenuItem>Business-Kontakt</DropdownMenuItem></Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Mobile: Accordion behavior */}
                        <div className="block lg:hidden mt-2">
                          <div className="text-[10px] text-slate-400 mb-1">Für Händler & Unternehmen</div>
                          <Collapsible>
                            <CollapsibleTrigger className="w-full text-left px-3 py-2 text-slate-300 font-medium border border-[#243246] rounded-md">
                              Für Unternehmen – Werbung
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-3 pb-2">
                              <ul className="space-y-1 text-[13px]">
                                <li><Link to={createPageUrl('Business')} className="text-slate-500 hover:text-slate-300">Werbung schalten</Link></li>
                                <li><Link to={`${createPageUrl('Business')}?view=pricing`} className="text-slate-500 hover:text-slate-300">Preise & Pakete</Link></li>
                                <li><Link to={createPageUrl('BusinessContact')} className="text-slate-500 hover:text-slate-300">Business-Kontakt</Link></li>
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>

                      <hr className="border-0 border-t border-[#243246] my-2 md:my-3.5 mx-auto w-[92%]" />

                      <div className="text-center text-[11px] md:text-xs pb-1">
                      <p className="text-slate-500">© {new Date().getFullYear()} Zazarap.de. {t('allRightsReserved')}.</p>
                      <p className="mt-0.5">
                        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">
                          {t('euDispute')}
                        </a>
                      </p>
                      </div>
                  </footer>
      </main>
      </div>
      </ErrorBoundary>
      );
      }