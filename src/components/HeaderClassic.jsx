import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Home, MessageSquare, Plus, BarChart3, Package, Bell, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function HeaderClassic({
  homeUrl = '/',
  messagesUrl = '/nachrichten',
  createUrl = '/anzeige-erstellen',
  statsUrl = '/statistiken',
  packagesUrl = '/pakete',
  notificationsUrl = '/benachrichtigungen',
  settingsUrl = '/einstellungen',
  unreadCount = 0,
}) {
  const { t, language } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const IconBtn = ({
    to,
    title,
    ariaLabel,
    children,
    primary = false,
    className = '',
  }) => (
    <Link
      to={to}
      aria-label={ariaLabel}
      title={title}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
        primary
          ? 'bg-[#d62828] text-[#f9d65c] border border-[#f9d65c] hover:bg-[#b71f1f]'
          : 'text-slate-700 hover:bg-slate-100',
        className,
      ].join(' ')}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link to={homeUrl} aria-label={t('nav.home')} className="no-underline leading-tight">
            <div className="flex flex-col">
              <span
                className="text-xl font-extrabold"
                style={{
                  background:
                    'linear-gradient(180deg, #000000 33%, #DD0000 33%, #DD0000 66%, #FFCC00 66%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter:
                    'drop-shadow(1px 1px 0 #000) drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000)',
                }}
              >
                Zazarap.de
              </span>
              <span className="text-[11px] tracking-wide text-[#d62828]">kleinanzeigen</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2" aria-label="Hauptnavigation">
          <IconBtn to={homeUrl} title={t('nav.home')} ariaLabel={t('nav.home')}>
            <Home className="h-5 w-5" aria-hidden="true" />
          </IconBtn>

          <IconBtn to={messagesUrl} title={t('messages')} ariaLabel={t('messages')}>
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </IconBtn>

          <IconBtn
            to={createUrl}
            title={t('header.nav.postAd')}
            ariaLabel={t('header.nav.postAd')}
            primary
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </IconBtn>

          <IconBtn to={statsUrl} title={t('admin.analytics')} ariaLabel={t('admin.analytics')}>
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </IconBtn>

          <IconBtn
            to={packagesUrl}
            title={language === 'de' ? 'Pakete' : language === 'it' ? 'Pacchetti' : 'Packages'}
            ariaLabel={language === 'de' ? 'Pakete' : language === 'it' ? 'Pacchetti' : 'Packages'}
          >
            <Package className="h-5 w-5" aria-hidden="true" />
          </IconBtn>

          <IconBtn to={notificationsUrl} title={t('notifications')} ariaLabel={t('notifications')} className="relative">
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </IconBtn>

          <IconBtn
            to={settingsUrl}
            title={language === 'de' ? 'Einstellungen' : language === 'it' ? 'Impostazioni' : 'Settings'}
            ariaLabel={language === 'de' ? 'Einstellungen' : language === 'it' ? 'Impostazioni' : 'Settings'}
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </IconBtn>

          {/* Login button when not authenticated */}
          {!user && (
            <Button 
              onClick={() => base44.auth.redirectToLogin()}
              className="ml-2 bg-[#f9d65c] hover:bg-yellow-300 text-[#d62828] font-bold px-3 py-1 text-xs"
            >
              {t('loginOrRegister')}
            </Button>
          )}

          {/* Language switcher */}
          <div className="ml-1 h-10 w-10 flex items-center justify-center">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}