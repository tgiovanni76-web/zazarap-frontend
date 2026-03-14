import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Smart scroll restoration:
// - Records scrollTop of the main scroll container (#main-content) in sessionStorage per-route
// - On back/forward (POP): restore previous position
// - On normal nav (PUSH/REPLACE): scroll to top
export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType(); // 'POP' | 'PUSH' | 'REPLACE'

  const routeKey = `${location.pathname}|${location.search}|${location.hash}`;
  const STORAGE_KEY = 'scrollPositions';

  const readStore = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeStore = (store) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {}
  };

  const savePos = (top) => {
    const store = readStore();
    store[routeKey] = top;
    writeStore(store);
  };

  // Attach scroll listener to the primary app scroller
  useEffect(() => {
    const scroller = document.getElementById('main-content');
    if (!scroller) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        savePos(scroller.scrollTop || 0);
        ticking = false;
      });
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      savePos(scroller.scrollTop || 0);
    };
  }, [routeKey]);

  // Restore or reset on navigation changes
  useEffect(() => {
    const scroller = document.getElementById('main-content');
    if (!scroller) return;

    const stored = readStore();
    const targetTop = navType === 'POP' ? (stored[routeKey] ?? 0) : 0;

    // Restore after next paint
    requestAnimationFrame(() => {
      scroller.scrollTo({ top: targetTop, left: 0, behavior: 'auto' });
    });
  }, [routeKey, navType]);

  return null;
}