import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function NetworkStatusBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [justCameBack, setJustCameBack] = useState(false);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      setJustCameBack(true);
      const t = setTimeout(() => setJustCameBack(false), 2500);
      return () => clearTimeout(t);
    };
    const off = () => setOnline(false);

    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online && !justCameBack) return null;

  const isOffline = !online;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full text-xs font-medium shadow-md',
        isOffline ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
      )}
      style={{ top: 'calc(var(--header-height, 64px) + 8px)' }}
    >
      {isOffline ? 'Sei offline. Alcune azioni sono disabilitate.' : 'Connessione ripristinata'}
    </div>
  );
}