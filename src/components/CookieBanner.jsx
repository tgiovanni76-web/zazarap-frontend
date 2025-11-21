import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: consent } = useQuery({
    queryKey: ['userConsent', user?.email],
    queryFn: async () => {
      const consents = await base44.entities.UserConsent.filter({ userId: user.email });
      return consents[0];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && consent && !consent.cookiesAccepted) {
      setVisible(true);
    }
  }, [user, consent]);

  const acceptMutation = useMutation({
    mutationFn: async (acceptMarketing) => {
      if (consent) {
        await base44.entities.UserConsent.update(consent.id, {
          cookiesAccepted: true,
          marketingAccepted: acceptMarketing,
          consentDate: new Date().toISOString()
        });
      } else {
        await base44.entities.UserConsent.create({
          userId: user.email,
          cookiesAccepted: true,
          marketingAccepted: acceptMarketing,
          privacyAccepted: true,
          termsAccepted: true,
          consentDate: new Date().toISOString()
        });
      }
    },
    onSuccess: () => setVisible(false)
  });

  if (!visible || !user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-red-600 shadow-2xl z-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-4">
          <Cookie className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">🍪 Utilizziamo i Cookie</h3>
            <p className="text-sm text-slate-700 mb-4">
              Utilizziamo cookie essenziali per il funzionamento del sito e cookie opzionali per migliorare la tua esperienza. 
              Accettando, ci aiuti a personalizzare i contenuti. Puoi gestire le tue preferenze in qualsiasi momento.
              <a href="/PrivacyPolicy" className="text-red-600 underline ml-1">Privacy Policy</a>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => acceptMutation.mutate(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Accetta Tutti
              </Button>
              <Button 
                onClick={() => acceptMutation.mutate(false)}
                variant="outline"
              >
                Solo Essenziali
              </Button>
              <Button 
                onClick={() => setVisible(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}