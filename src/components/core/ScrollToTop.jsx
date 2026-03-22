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

  // Force manual scroll restoration globally
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try { window.history.scrollRestoration = 'manual'; } catch {}
    }
  }, []);

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

  // Disable scroll position saving; always start at top
  useEffect(() => {
    return undefined;
  }, [routeKey]);

  // Always scroll to top on route changes; also reset internal scroll containers
  useEffect(() => {
    const scroller = document.getElementById('main-content');

    const resetAll = () => {
      try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {}
      if (scroller) {
        try { scroller.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {}
      }
      // Reset common scrollable containers
      try {
        document.querySelectorAll('.overflow-y-auto, [data-scrollable], [data-reset-scroll]').forEach((el) => {
          el.scrollTop = 0;
          el.scrollLeft = 0;
        });
      } catch {}
    };

    // Reset after paint to avoid layout shifts
    requestAnimationFrame(resetAll);
  }, [routeKey]);

  return null;
}