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
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Grazie per esserti iscritto!</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
      <div className="flex-1 relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="La tua email"
          className="pl-10"
        />
      </div>
      <Button 
        type="submit" 
        disabled={subscribeMutation.isPending}
        className="bg-red-600 hover:bg-red-700"
      >
        {subscribeMutation.isPending ? 'Invio...' : 'Iscriviti'}
      </Button>
    </form>
  );
}