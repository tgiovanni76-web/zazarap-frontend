import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterForm({ source = 'footer' }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async (email) => {
      // Check if already subscribed
      const existing = await base44.entities.NewsletterSubscriber.filter({ email });
      
      if (existing.length > 0) {
        throw new Error('Email già registrata');
      }

      // Save subscription
      await base44.entities.NewsletterSubscriber.create({
        email,
        source,
        status: 'active'
      });

      // Notify admin
      try {
        await base44.integrations.Core.SendEmail({
          to: 'admin@zazarap.com',
          subject: '🎉 Nuova iscrizione alla newsletter',
          body: `
Una nuova persona si è iscritta alla newsletter!

Email: ${email}
Fonte: ${source}
Data: ${new Date().toLocaleString('it-IT')}
          `
        });
      } catch (emailError) {
        console.error('Admin notification failed:', emailError);
      }
    },
    onSuccess: () => {
      setSubscribed(true);
      toast.success('Iscrizione completata!');
      setEmail('');
    },
    onError: (error) => {
      toast.error(error.message || 'Errore nell\'iscrizione');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Danke für Ihre Anmeldung!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[360px] mt-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ihre E-Mail-Adresse"
        className="block w-full px-3 py-2.5 rounded-[5px] border border-white/30 bg-[#0c1526] text-white placeholder:text-slate-400 focus:outline-none focus:border-white/50 mb-2.5"
      />
      <button 
        type="submit" 
        disabled={subscribeMutation.isPending}
        className="inline-block px-5 py-2.5 rounded-[5px] border-none bg-[#d62828] text-white cursor-pointer hover:bg-[#b82020] disabled:opacity-50"
      >
        {subscribeMutation.isPending ? '...' : 'Abonnieren'}
      </button>
    </form>
  );
}