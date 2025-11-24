import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // Save to database
      await base44.entities.ContactMessage.create(data);
      
      // Send email to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: 'admin@zazarap.com',
          subject: `Nuovo messaggio di contatto: ${data.subject}`,
          body: `
Nome: ${data.name}
Email: ${data.email}
Oggetto: ${data.subject}

Messaggio:
${data.message}
          `
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Messaggio inviato con successo!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: (error) => {
      toast.error('Errore nell\'invio del messaggio');
      console.error(error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Messaggio Inviato!</h2>
            <p className="text-slate-600 mb-6">
              Grazie per averci contattato. Ti risponderemo al più presto.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Invia un altro messaggio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Contattaci</h1>
          <p className="text-slate-600">
            Hai domande o suggerimenti? Inviaci un messaggio!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Modulo di Contatto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Il tuo nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="tua@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Oggetto *
                </label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="Di cosa vuoi parlare?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Messaggio *
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Scrivi qui il tuo messaggio..."
                  className="min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>Invio in corso...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Messaggio
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>Oppure scrivici direttamente a: <a href="mailto:support@zazarap.com" className="text-red-600 hover:underline">support@zazarap.com</a></p>
        </div>
      </div>
    </div>
  );
}