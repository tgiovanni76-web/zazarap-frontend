import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function Contact() {
  const { t } = useLanguage();
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
          subject: `Contact message: ${data.subject}`,
          body: `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
          `
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success(t('contact.success') || 'Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: (error) => {
      toast.error(t('contact.error') || 'Error sending message');
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
            <h2 className="text-2xl font-bold mb-2">{t('contact.sent.title') || 'Message Sent!'}</h2>
            <p className="text-slate-600 mb-6">
              {t('contact.sent.desc') || 'Thank you for contacting us. We will get back to you soon.'}
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              {t('contact.sent.another') || 'Send another message'}
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
          <h1 className="text-3xl font-bold mb-2">{t('contactUs')}</h1>
          <p className="text-slate-600">
            {t('contact.desc') || 'Have questions or suggestions? Send us a message!'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('contact.form.title') || 'Contact Form'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('firstName')} *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={t('firstName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('settings.profile.email')} *
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('contact.subject') || 'Subject'} *
                </label>
                <Input
                  required
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder={t('contact.subject.ph') || 'What do you want to talk about?'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('contact.message') || 'Message'} *
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder={t('contact.message.ph') || 'Write your message here...'}
                  className="min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>{t('contact.sending') || 'Sending...'}</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t('contact.send') || 'Send Message'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>{t('contact.directEmail') || 'Or write to us directly at'}: <a href="mailto:support@zazarap.com" className="text-red-600 hover:underline">support@zazarap.com</a></p>
        </div>
      </div>
    </div>
  );
}