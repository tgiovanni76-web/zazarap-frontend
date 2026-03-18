import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export default function OfflineFormGuard() {
  const onlineRef = React.useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const toggleSubmitButtons = (isOnline) => {
    try {
      const btns = document.querySelectorAll('form button[type="submit"], form [type="submit"]');
      btns.forEach((btn) => {
        const form = btn.closest('form');
        if (!form) return;
        if (form.dataset && form.dataset.allowOffline === 'true') return;
        if (!isOnline) {
          if (!btn.disabled) btn.setAttribute('disabled', 'true');
          btn.dataset.offlineDisabled = 'true';
        } else if (btn.dataset.offlineDisabled === 'true') {
          btn.removeAttribute('disabled');
          delete btn.dataset.offlineDisabled;
        }
      });
    } catch (_) {}
  };

  React.useEffect(() => {
    const onOnline = () => {
      onlineRef.current = true;
      toggleSubmitButtons(true);
    };
    const onOffline = () => {
      onlineRef.current = false;
      toggleSubmitButtons(false);
    };

    // Init on mount
    toggleSubmitButtons(onlineRef.current);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  React.useEffect(() => {
    const onSubmit = (e) => {
      try {
        if (typeof navigator === 'undefined') return;
        if (navigator.onLine) return;
        const form = e.target;
        if (form && form.dataset && form.dataset.allowOffline === 'true') return;
        e.preventDefault();
        e.stopPropagation();
        toast.error('Sei offline: impossibile inviare il form.');
      } catch (_) {}
    };

    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
  }, []);

  return null;
}