import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import PaymentShippingModal from '@/components/marketplace/PaymentShippingModal';
import ReportListingModal from '@/components/ReportListingModal';
import { MessageSquare } from 'lucide-react';

export default function MessagesV2() {
  const { t, currentLanguage } = useLanguage();
  const queryClient = useQueryClient();

  // Robust URL param getter (supports both ?chatId= and ?chatid=)
  const getChatIdFromUrl = () => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('chatId') || sp.get('chatid') || null;
  };

  const [selectedChat, setSelectedChat] = useState(null);
  const [urlChatId, setUrlChatId] = useState(() => getChatIdFromUrl());
  const [openIntent, setOpenIntent] = useState(() => new URLSearchParams(window.location.search).get('open'));
  const [urlChatNotFound, setUrlChatNotFound] = useState(false);
  const awaitingChatFromUrl = !!urlChatId && !selectedChat && !urlChatNotFound;
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Track URL changes (back/forward) and reset not-found state
  useEffect(() => {
    const handler = () => {
      setUrlChatId(getChatIdFromUrl());
      const sp = new URLSearchParams(window.location.search);
      setOpenIntent(sp.get('open'));
      setUrlChatNotFound(false);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Restore chatId from pendingChatId if the router lost the query string (common after redirects)
  useEffect(() => {
    try {
      const pid = localStorage.getItem('pendingChatId');
      if (!urlChatId && pid) {
        const url = new URL(window.location.href);
        url.searchParams.set('chatId', pid);
        window.history.replaceState({}, '', url.toString());
        setUrlChatId(pid);
      }
    } catch {}
  }, [urlChatId]);

  // Restore chatId from pendingChatId if router dropped it
  useEffect(() => {
    try {
      const pid = localStorage.getItem('pendingChatId');
      if (!urlChatId && pid) {
        const url = new URL(window.location.href);
        url.searchParams.set('chatId', pid);
        window.history.replaceState({}, '', url.toString());
        setUrlChatId(pid);
      }
    } catch {}
  }, [urlChatId]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user?.email) console.debug('[MessagesV2] currentUser', user.email);
  }, [user?.email]);

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ['chats', user?.email || 'anon'],
    enabled: !!user?.email,
    queryFn: async () => {
      const me = user.email;
      const meLower = (me || '').toLowerCase();

      const chats = await base44.entities.Chat.filter(
        {
          $or: [
            { buyerId: me },
            { sellerId: me },
            { buyerId: meLower },
            { sellerId: meLower }
          ]
        },
        '-updated_date'
      ).catch(() => []);

      // Deduplicate in case of both exact and lower-case matches for the same chat
      const map = new Map();
      chats.forEach(c => c?.id && map.set(c.id, c));
      const uniqueChats = Array.from(map.values()).sort((a, b) => new Date(b.updated_date || b.updatedAt || 0) - new Date(a.updated_date || a.updatedAt || 0));

      console.debug('[MessagesV2] chats loaded', { total: uniqueChats.length, ids: uniqueChats.map(c => c.id) });
      return uniqueChats;
    }
  });

  // Real-time refresh
  useEffect(() => {
    if (!user?.email) return;
    const u1 = base44.entities.Chat.subscribe(() => queryClient.invalidateQueries({ queryKey: ['chats', user.email] }));
    const u2 = base44.entities.ChatMessage.subscribe((e) => {
      if (e?.data?.chatId === selectedChat?.id) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedChat.id] });
      }
    });
    return () => { u1?.(); u2?.(); };
  }, [user?.email, selectedChat?.id, queryClient]);

  const myChats = useMemo(() => {
    const u = (user?.email || '').toLowerCase();
    return (chats || []).filter(c => (c?.buyerId || '').toLowerCase() === u || (c?.sellerId || '').toLowerCase() === u);
  }, [chats, user?.email]);
  useEffect(() => { if (user?.email) console.debug('[MessagesV2] myChats', myChats.length); }, [myChats.length, user?.email]);

  // Select chat from URL once list is ready
  useEffect(() => {
    if (!urlChatId || !myChats.length) return;
    const found = myChats.find(c => c.id === urlChatId);
    if (found) {
      setSelectedChat(found);
      setUrlChatNotFound(false);
    }
  }, [urlChatId, myChats]);

  // If list is empty or doesn't include the URL chat, try fetching that chat directly
  useEffect(() => {
    if (!urlChatId || selectedChat) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.entities.Chat.filter({ id: urlChatId });
        const c = res?.[0];
        const u = (user?.email || '').toLowerCase();
        const isMine = c && ((((c.buyerId || '').toLowerCase() === u) || ((c.sellerId || '').toLowerCase() === u)));
        const isAdmin = user?.role === 'admin';
        if (c && (isMine || isAdmin)) {
          if (!cancelled) {
            setSelectedChat(c);
            setUrlChatNotFound(false);
          }
        } else if (!cancelled) {
          setUrlChatNotFound(true);
        }
      } catch (_) {
        if (!cancelled) setUrlChatNotFound(true);
      }
    })();
    return () => { cancelled = true; };
  }, [urlChatId, selectedChat, user?.email]);



  // If we navigated with a just-created chatId, poll briefly until it becomes readable (eventual consistency)
  useEffect(() => {
    const pendingId = (() => { try { return localStorage.getItem('pendingChatId'); } catch { return null; } })();
    if (!urlChatId || !pendingId || pendingId !== urlChatId || selectedChat?.id) return;
    let cancelled = false;
    let tries = 0; const maxTries = 5; const delayMs = 1500;
    console.debug('[MessagesV2] Starting poll for chat ID', urlChatId, '(max 5 tries, 1.5s delay)');

    const poll = async () => {
      // Show loading state instead of not-found while polling
      setUrlChatNotFound(false);
      while (!cancelled && tries < maxTries && !selectedChat?.id) {
        try {
          const res = await base44.entities.Chat.filter({ id: urlChatId });
          const c = res?.[0];
          const u = (user?.email || '').toLowerCase();
          const isAdmin = user?.role === 'admin';
          if (c && (isAdmin || ((c.buyerId || '').toLowerCase() === u) || ((c.sellerId || '').toLowerCase() === u))) {
            setSelectedChat(c);
            try { localStorage.removeItem('pendingChatId'); } catch {}
            return;
          }
        } catch {}
        tries++;
        await new Promise(r => setTimeout(r, delayMs));
      }
      if (!cancelled && !selectedChat?.id) {
        setUrlChatNotFound(true);
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [urlChatId, selectedChat?.id, user?.email]);

  // Self-heal: if chatId is in URL but chat isn't readable yet, recreate/attach using pendingChatMeta (runs once when we already concluded not-found)
  useEffect(() => {
    if (!urlChatNotFound || !user?.email) return;
    let meta = null;
    try { meta = JSON.parse(localStorage.getItem('pendingChatMeta') || 'null'); } catch { meta = null; }
    if (!meta?.listingId || !meta?.sellerId) {
      const sp = new URLSearchParams(window.location.search);
      const lid = sp.get('lid') || sp.get('listingId');
      const seller = sp.get('seller');
      if (lid && seller) meta = { listingId: lid, sellerId: seller, listingTitle: '', listingImage: '' };
    }
    if (!meta?.listingId || !meta?.sellerId) return;

    let cancelled = false;
    (async () => {
      try {
        // Check if it already exists for me (exact case)
        const existing = await base44.entities.Chat.filter({ listingId: meta.listingId, buyerId: user.email, sellerId: meta.sellerId }, '-updated_date').catch(() => []);
        if (existing?.length) {
          if (cancelled) return;
          setSelectedChat(existing[0]);
          try { localStorage.removeItem('pendingChatMeta'); } catch {}
          const url = new URL(window.location.href);
          url.searchParams.set('chatId', existing[0].id);
          window.history.replaceState({}, '', url.toString());
          setUrlChatId(existing[0].id);
          setUrlChatNotFound(false);
          return;
        }
        // Create again with my email as buyer
        const payload = {
          listingId: meta.listingId,
          buyerId: user.email,
          sellerId: meta.sellerId,
          status: 'in_attesa',
          lastMessage: '',
          listingTitle: meta.listingTitle || '',
          listingImage: meta.listingImage || '',
          lastPrice: typeof meta.lastPrice === 'number' ? meta.lastPrice : undefined,
          updatedAt: new Date().toISOString(),
          unreadBuyer: 0,
          unreadSeller: 0,
        };
        const created = await base44.entities.Chat.create(payload);
        const newId = created?.id || created?.data?.id || created?.inserted_id;
        if (!cancelled && newId) {
          try { localStorage.setItem('pendingChatId', newId); localStorage.removeItem('pendingChatMeta'); } catch {}
          const url = new URL(window.location.href);
          url.searchParams.set('chatId', newId);
          window.history.replaceState({}, '', url.toString());
          setUrlChatId(newId);
          setUrlChatNotFound(false);
        }
      } catch (e) {
        console.warn('[MessagesV2] self-heal create failed', e);
      }
    })();

    return () => { cancelled = true; };
  }, [urlChatNotFound, user?.email]);

  // Early self-heal: if we are awaiting a chat from URL for >700ms and still none, try to attach/create using meta
  useEffect(() => {
    if (!awaitingChatFromUrl || selectedChat?.id || !user?.email) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled || selectedChat?.id) return;
      let meta = null;
      try { meta = JSON.parse(localStorage.getItem('pendingChatMeta') || 'null'); } catch { meta = null; }
      if (!meta?.listingId || !meta?.sellerId) {
        const sp = new URLSearchParams(window.location.search);
        const lid = sp.get('lid') || sp.get('listingId');
        const seller = sp.get('seller');
        if (lid && seller) meta = { listingId: lid, sellerId: seller, listingTitle: '', listingImage: '' };
      }
      if (!meta?.listingId || !meta?.sellerId) return;
      try {
        const existing = await base44.entities.Chat.filter({ listingId: meta.listingId, buyerId: user.email, sellerId: meta.sellerId }, '-updated_date').catch(() => []);
        if (existing?.length) {
          setSelectedChat(existing[0]);
          try { localStorage.removeItem('pendingChatMeta'); } catch {}
          const url = new URL(window.location.href);
          url.searchParams.set('chatId', existing[0].id);
          window.history.replaceState({}, '', url.toString());
          setUrlChatId(existing[0].id);
          return;
        }
        const payload = {
          listingId: meta.listingId,
          buyerId: user.email,
          sellerId: meta.sellerId,
          status: 'in_attesa',
          lastMessage: '',
          listingTitle: meta.listingTitle || '',
          listingImage: meta.listingImage || '',
          lastPrice: typeof meta.lastPrice === 'number' ? meta.lastPrice : undefined,
          updatedAt: new Date().toISOString(),
          unreadBuyer: 0,
          unreadSeller: 0,
        };
        const created = await base44.entities.Chat.create(payload);
        const newId = created?.id || created?.data?.id || created?.inserted_id;
        if (newId) {
          try { localStorage.setItem('pendingChatId', newId); localStorage.removeItem('pendingChatMeta'); } catch {}
          const url = new URL(window.location.href);
          url.searchParams.set('chatId', newId);
          window.history.replaceState({}, '', url.toString());
          setUrlChatId(newId);
        }
      } catch (e) {
        console.warn('[MessagesV2] early self-heal failed', e);
      }
    }, 700);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [awaitingChatFromUrl, selectedChat?.id, user?.email]);

  // Last-resort: if I still have no chats listed and meta exists, create/attach a chat
  useEffect(() => {
    if (selectedChat?.id || !user?.email || (myChats?.length || 0) > 0) return;
    let meta = null;
    try { meta = JSON.parse(localStorage.getItem('pendingChatMeta') || 'null'); } catch { meta = null; }
    if (!meta?.listingId || !meta?.sellerId) {
      const sp = new URLSearchParams(window.location.search);
      const lid = sp.get('lid') || sp.get('listingId');
      const seller = sp.get('seller');
      if (lid && seller) meta = { listingId: lid, sellerId: seller, listingTitle: '', listingImage: '' };
    }
    if (!meta?.listingId || !meta?.sellerId) return;

    (async () => {
      try {
        const existing = await base44.entities.Chat.filter({ listingId: meta.listingId, buyerId: user.email, sellerId: meta.sellerId }, '-updated_date').catch(() => []);
        if (existing?.length) {
          setSelectedChat(existing[0]);
          const url = new URL(window.location.href);
          url.searchParams.set('chatId', existing[0].id);
          window.history.replaceState({}, '', url.toString());
          setUrlChatId(existing[0].id);
          try { localStorage.removeItem('pendingChatMeta'); } catch {}
          return;
        }
        const created = await base44.entities.Chat.create({
          listingId: meta.listingId,
          buyerId: user.email,
          sellerId: meta.sellerId,
          status: 'in_attesa',
          lastMessage: '',
          listingTitle: meta.listingTitle || '',
          listingImage: meta.listingImage || '',
          lastPrice: typeof meta.lastPrice === 'number' ? meta.lastPrice : undefined,
          updatedAt: new Date().toISOString(),
          unreadBuyer: 0,
          unreadSeller: 0,
        });
        const newId = created?.id || created?.data?.id || created?.inserted_id;
        if (newId) {
          const url = new URL(window.location.href);
          url.searchParams.set('chatId', newId);
          window.history.replaceState({}, '', url.toString());
          setUrlChatId(newId);
          try { localStorage.setItem('pendingChatId', newId); localStorage.removeItem('pendingChatMeta'); } catch {}
        }
      } catch (e) {
        console.warn('[MessagesV2] last-resort self-heal failed', e);
      }
    })();
  }, [myChats?.length, selectedChat?.id, user?.email]);

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['chatMessages', selectedChat?.id || 'none'],
    enabled: !!selectedChat?.id,
    queryFn: async () => base44.entities.ChatMessage.filter({ chatId: selectedChat.id }, 'created_date').catch(() => []),
  });

  const { data: listingById = [] } = useQuery({
    queryKey: ['listingById', selectedChat?.listingId],
    enabled: !!selectedChat?.listingId,
    queryFn: async () => {
      try { return await base44.entities.Listing.filter({ id: selectedChat.listingId }); } catch { return []; }
    }
  });

  const currentListing = Array.isArray(listingById) ? listingById[0] : undefined;

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('chatId', chat.id);
      window.history.replaceState({}, '', url.toString());
      setUrlChatId(chat.id);
    } catch {}
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('loginOrRegister')}</h1>
        <p className="text-slate-600 mb-6">Per inviare o leggere i messaggi devi effettuare l'accesso.</p>
        <button className="bg-[var(--z-primary)] text-white px-5 py-2 rounded-lg" onClick={() => base44.auth.redirectToLogin(createPageUrl('Messages'))}>
          {t('loginOrRegister')}
        </button>
      </div>
    );
  }

  if (chatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--z-primary)]"></div>
      </div>
    );
  }

  // Mobile view: show either sidebar or chat
  if (isMobileView) {
    if (selectedChat?.id) {
      return (
        <div className="h-full min-h-0 overflow-hidden">
          <ChatWindow
            chat={selectedChat}
            messages={chatMessages}
            user={user}
            listing={currentListing}
            initialOpenOffer={openIntent === 'offer'}
            onBack={() => setSelectedChat(null)}
            onOpenPayment={() => setShowPaymentModal(true)}
            onReport={() => setShowReportModal(true)}
          />

          {showPaymentModal && selectedChat?.id && (
            <PaymentShippingModal chat={selectedChat} listing={currentListing} onClose={() => setShowPaymentModal(false)} />
          )}

          {showReportModal && selectedChat?.id && (
            <ReportListingModal
              open={showReportModal}
              onClose={() => setShowReportModal(false)}
              listingId={selectedChat.listingId}
              listingTitle={currentListing?.title}
              sellerEmail={selectedChat.sellerId === user.email ? selectedChat.buyerId : selectedChat.sellerId}
              user={user}
            />
          )}
        </div>
      );
    }

    return (
      <div className="h-full min-h-0 overflow-hidden">
        {urlChatNotFound ? (
          <div className="h-full bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <MessageSquare className="h-14 w-14 mb-3 opacity-30" />
            <p className="text-base md:text-lg mb-1">{currentLanguage==='de' ? 'Chat nicht gefunden oder nicht zugänglich.' : 'Chat non trovata o non accessibile.'}</p>
            <p className="text-sm mb-4">{currentLanguage==='de' ? 'Wähle einen Chat aus der Liste oder kehre zum Marktplatz zurück.' : 'Seleziona una chat dalla lista o torna al marketplace.'}</p>
            <Button asChild className="bg-[var(--z-primary)] hover:bg-[var(--z-primary-dark)]">
              <Link to={createPageUrl('Marketplace')}>{currentLanguage==='de' ? 'Zum Marktplatz' : 'Torna al marketplace'}</Link>
            </Button>
          </div>
        ) : myChats.length === 0 ? (
          <div className="h-full bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center text-slate-500 p-6 text-center">
            <MessageSquare className="h-14 w-14 mb-3 opacity-30" />
            <p className="text-base md:text-lg mb-1">{currentLanguage==='de' ? 'Du hast noch keine Chats.' : 'Non hai ancora chat.'}</p>
            <p className="text-sm mb-4">{currentLanguage==='de' ? 'Um eine Unterhaltung zu starten, öffne eine Anzeige und klicke „Verkäufer kontaktieren“.' : 'Per iniziare una conversazione, apri un annuncio e clicca “Verkäufer kontaktieren”.'}</p>
            <Button asChild className="bg-[var(--z-primary)] hover:bg-[var(--z-primary-dark)]">
              <Link to={createPageUrl('Marketplace')}>{currentLanguage==='de' ? 'Zum Marktplatz' : 'Torna al marketplace'}</Link>
            </Button>
          </div>
        ) : (
          <ChatSidebar
            chats={myChats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            user={user}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}
      </div>
    );
  }

  // Desktop: split view
  return (
    <div className="py-0 md:py-6 h-full min-h-0 overflow-hidden">
      <div className="grid grid-cols-3 gap-4 h-full min-h-0 pb-2 overflow-hidden">
        <div className="col-span-1 h-full min-h-0 overflow-y-auto overscroll-contain">
          <ChatSidebar
            chats={myChats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            user={user}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        <div className="col-span-2 h-full min-h-0 overflow-hidden">
          {awaitingChatFromUrl ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--z-primary)]"></div>
            </div>
          ) : selectedChat?.id ? (
            <ChatWindow
              chat={selectedChat}
              messages={chatMessages}
              user={user}
              listing={currentListing}
              initialOpenOffer={openIntent === 'offer'}
              onBack={() => setSelectedChat(null)}
              onOpenPayment={() => setShowPaymentModal(true)}
              onReport={() => setShowReportModal(true)}
            />
          ) : urlChatNotFound ? (
            <div className="h-full bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg mb-1">{currentLanguage==='de' ? 'Chat nicht gefunden oder nicht zugänglich.' : 'Chat non trovata o non accessibile.'}</p>
              <p className="text-sm mb-4">{currentLanguage==='de' ? 'Wähle einen Chat aus der Liste oder kehre zum Marktplatz zurück.' : 'Seleziona una chat dalla lista o torna al marketplace.'}</p>
              <Button asChild className="bg-[var(--z-primary)] hover:bg-[var(--z-primary-dark)]">
                <Link to={createPageUrl('Marketplace')}>{currentLanguage==='de' ? 'Zum Marktplatz' : 'Torna al marketplace'}</Link>
              </Button>
            </div>
          ) : (
            <div className="h-full bg-white rounded-xl shadow-sm border flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              {(myChats?.length || 0) === 0 ? (
                <div className="contents">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg mb-1">{currentLanguage==='de' ? 'Du hast noch keine Chats.' : 'Non hai ancora chat.'}</p>
                  <p className="text-sm mb-4">{currentLanguage==='de' ? 'Um eine Unterhaltung zu starten, öffne eine Anzeige und klicke „Verkäufer kontaktieren“.' : 'Per iniziare una conversazione, apri un annuncio e clicca “Verkäufer kontaktieren”.'}</p>
                  <Button asChild className="bg-[var(--z-primary)] hover:bg-[var(--z-primary-dark)]">
                    <Link to={createPageUrl('Marketplace')}>{currentLanguage==='de' ? 'Zum Marktplatz' : 'Torna al marketplace'}</Link>
                  </Button>
                </div>
              ) : (
                <div className="contents">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg">{t('selectChat')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && selectedChat && (
        <PaymentShippingModal chat={selectedChat} listing={currentListing} onClose={() => setShowPaymentModal(false)} />
      )}

      {showReportModal && selectedChat && (
        <ReportListingModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          listingId={selectedChat.listingId}
          listingTitle={currentListing?.title}
          sellerEmail={selectedChat.sellerId === user.email ? selectedChat.buyerId : selectedChat.sellerId}
          user={user}
        />
      )}
    </div>
  );
}