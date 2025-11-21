import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailVerificationBanner() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: verification } = useQuery({
    queryKey: ['userVerification', user?.email],
    queryFn: async () => {
      const verifs = await base44.entities.UserVerification.filter({ userId: user.email });
      return verifs[0];
    },
    enabled: !!user,
  });

  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (verification) {
        await base44.entities.UserVerification.update(verification.id, {
          verificationCode: code,
          codeExpiry: expiry
        });
      } else {
        await base44.entities.UserVerification.create({
          userId: user.email,
          verificationCode: code,
          codeExpiry: expiry
        });
      }

      // Simula invio email (in produzione usare SendGrid)
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Verifica il tuo account Zazarap',
        body: `Codice di verifica: ${code}\n\nInserisci questo codice nell'app per verificare il tuo account.`
      });
    },
    onSuccess: () => {
      toast.success('Email di verifica inviata!');
      queryClient.invalidateQueries({ queryKey: ['userVerification'] });
    }
  });

  if (!user || verification?.emailVerified) return null;

  return (
    <div className="bg-yellow-50 border-b-2 border-yellow-400 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Verifica la tua email</p>
            <p className="text-sm text-yellow-700">
              Completa la verifica per aumentare la tua affidabilità e sbloccare tutte le funzionalità.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => sendVerificationMutation.mutate()}
          disabled={sendVerificationMutation.isPending}
          size="sm"
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {sendVerificationMutation.isPending ? 'Invio...' : 'Invia Email'}
        </Button>
      </div>
    </div>
  );
}