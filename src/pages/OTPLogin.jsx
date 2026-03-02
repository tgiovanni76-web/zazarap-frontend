import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function OTPLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: enter email, 2: enter code
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!contact.trim()) {
      toast.error('Bitte E-Mail-Adresse eingeben');
      return;
    }

    // Basic validation
    if (!contact.includes('@') || !contact.includes('.')) {
      toast.error('Ungültige E-Mail-Adresse');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('sendLoginCode', {
        email: contact.trim()
      });

      console.log('SendLoginCode response:', response);

      if (response.data?.success) {
        setStep(2);
        toast.success('✅ Code wurde an ' + contact + ' gesendet!');
      } else {
        toast.error(response.data?.message || 'Fehler beim Senden des Codes');
        console.error('Send code failed:', response.data);
      }
    } catch (error) {
      console.error('Send code error:', error);
      toast.error('Fehler: ' + (error.message || 'Code konnte nicht gesendet werden'));
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Bitte 6-stelligen Code eingeben');
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('verifyLoginCode', {
        email: contact.trim(),
        code: code.trim()
      });

      console.log('VerifyLoginCode response:', response);

      if (response.data?.success) {
        toast.success('✅ Code verifiziert!');
        
        if (response.data.loginUrl) {
          // Redirect to Base44 login link
          toast.success('🔐 Anmeldung wird vorbereitet...');
          setTimeout(() => {
            window.location.href = response.data.loginUrl;
          }, 1000);
        } else if (response.data.isNewUser) {
          toast.success('🎉 Konto erstellt! Prüfe deine E-Mails für den Login-Link.');
          setTimeout(() => {
            navigate(createPageUrl('Marketplace'));
          }, 2000);
        } else {
          toast.error('Login-Link konnte nicht generiert werden');
        }
      } else {
        toast.error(response.data?.message || 'Ungültiger Code');
        console.error('Verify code failed:', response.data);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      toast.error('Fehler: ' + (error.message || 'Verifizierung fehlgeschlagen'));
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setCode('');
    await handleSendCode();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-white text-black">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-black mb-2">Zazarap</h1>
          <p className="text-slate-600">Sicher einloggen mit Code</p>
        </div>

        <Card className="shadow-2xl bg-white border border-slate-200 text-slate-900">
          <CardHeader className="bg-white text-black border-b border-slate-200">
            <CardTitle className="text-2xl">
              {step === 1 && 'Anmeldung'}
              {step === 2 && 'Code eingeben'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {step === 1 && 'Wir senden dir einen Einmalcode per E-Mail'}
              {step === 2 && 'Gib den 6-stelligen Code ein'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-8">
            
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-base font-semibold mb-3 block text-slate-800">
                    Deine E-Mail-Adresse
                  </Label>
                  <Input
                    type="email"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                    placeholder="beispiel@email.de"
                    className="h-14 text-lg bg-white border-slate-300 text-black placeholder-slate-500"
                    autoFocus
                    style={{ fontSize: '16px' }}
                  />
                  <p className="text-xs text-slate-600 mt-2">
                    Wir senden einen Einmalcode an diese E-Mail-Adresse
                  </p>
                </div>

                <Button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-[var(--z-primary)] hover:bg-[var(--z-primary-light)] text-white h-14 text-lg font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Code wird gesendet...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Code per E-Mail senden
                    </>
                  )}
                </Button>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-center text-slate-400">
                    Mit der Anmeldung stimmst du unseren{' '}
                    <a href={createPageUrl('AGB')} className="text-black underline-offset-2 hover:underline">AGB</a>
                    {' '}und{' '}
                    <a href={createPageUrl('PrivacyPolicy')} className="text-black underline-offset-2 hover:underline">Datenschutzbestimmungen</a>
                    {' '}zu.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Enter Code */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    📬 Code gesendet an: <strong className="text-black">{contact}</strong>
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block text-slate-800">
                    Gib den 6-stelligen Code ein
                  </Label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={(e) => e.key === 'Enter' && code.length === 6 && handleVerifyCode()}
                    placeholder="123456"
                    className="h-16 text-center text-3xl tracking-widest font-bold bg-white border-slate-300 text-black placeholder-slate-400"
                    maxLength={6}
                    autoFocus
                    style={{ fontSize: '28px', letterSpacing: '0.5em' }}
                  />
                  <p className="text-xs text-slate-600 mt-2 text-center">
                    Der Code ist 15 Minuten gültig
                  </p>
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || loading}
                  className="w-full bg-[var(--z-primary)] hover:bg-[var(--z-primary-light)] text-white h-14 text-lg font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Wird überprüft...
                    </>
                  ) : (
                    'Anmelden'
                  )}
                </Button>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep(1);
                      setCode('');
                    }}
                    className="text-sm"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm text-black hover:text-neutral-800"
                  >
                    Code erneut senden
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <div className="mt-6 bg-gray-100 border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-slate-700">
            <strong className="text-black">ℹ️ Neu bei Zazarap.de?</strong> Kein Problem! Nach der Code-Verifizierung wird automatisch ein Konto für dich erstellt und du erhältst eine E-Mail mit dem Login-Link.
          </p>
        </div>

      </div>
    </div>
  );
}