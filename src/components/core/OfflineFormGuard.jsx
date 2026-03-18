import React from 'react';
import { toast } from 'sonner';

export default function OfflineFormGuard() {
  React.useEffect(() => {
    const onSubmit = (e) => {
      try {
        // ignoriamo SSR/ambiente non browser
        if (typeof navigator === 'undefined') return;
        if (navigator.onLine) return;
        const form = e.target;
        if (form && form.dataset && form.dataset.allowOffline === 'true') return;
        // Blocca submit quando offline
        e.preventDefault();
        e.stopPropagation();
        toast.error('Sei offline: impossibile inviare il form.');
      } catch (_) {}
    };

    document.addEventListener('submit', onSubmit, true); // capture
    return () => document.removeEventListener('submit', onSubmit, true);
  }, []);

  return null;
}