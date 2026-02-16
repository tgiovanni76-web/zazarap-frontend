import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function OTPLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: choose method, 2: enter contact, 3: enter code
  const [method, setMethod] = useState(''); // 'email' or 'phone'
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
  };

  const handleSendCode = async () => {
    if (!contact.trim()) {
      toast.error(method === 'email' ? 'Bitte E-Mail eingeben' : 'Bitte Telefonnummer eingeben');
      return;
    }

    // Basic validation
    if (method === 'email' && !contact.includes('@')) {
      toast.error('Ungültige E-Mail-Adresse');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('sendLoginCode', {
        method,
        contact: contact.trim()
      });

      if (data.success) {
        setCodeSent(true);
        setStep(3);
        toast.success('Code gesendet! Prüfe deine ' + (method === 'email' ? 'E-Mails' : 'SMS'));
      } else {
        toast.error(data.message || 'Fehler beim Senden');
      }
    } catch (error) {
      toast.error(error.message || 'Fehler beim Senden des Codes');
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
      const { data } = await base44.functions.invoke('verifyLoginCode', {
        method,
        contact: contact.trim(),
        code: code.trim()
      });

      if (data.success && data.sessionToken) {
        toast.success('Login erfolgreich!');
        
        // Store session token
        localStorage.setItem('base44_session', data.sessionToken);
        
        // Redirect to complete profile if new user, otherwise to marketplace
        setTimeout(() => {
          if (data.isNewUser) {
            navigate(createPageUrl('CompleteProfile'));
          } else {
            navigate(createPageUrl('Marketplace'));
          }
          window.location.reload(); // Reload to refresh auth state
        }, 500);
      } else {
        toast.error(data.message || 'Ungültiger Code');
      }
    } catch (error) {
      toast.error(error.message || 'Fehler bei der Verifizierung');
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setCode('');
    await handleSendCode();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#d62828] mb-2">Zazarap</h1>
          <p className="text-slate-600">Sicher einloggen mit Code</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-[#d62828] to-[#c91f23] text-white">
            <CardTitle className="text-2xl">
              {step === 1 && 'Anmeldung'}
              {step === 2 && 'Kontakt eingeben'}
              {step === 3 && 'Code eingeben'}
            </CardTitle>
            <CardDescription className="text-white/90">
              {step === 1 && 'Wähle deine bevorzugte Methode'}
              {step === 2 && 'Wir senden dir einen Einmalcode'}
              {step === 3 && 'Gib den 6-stelligen Code ein'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-8">
            
            {/* Step 1: Choose Method */}
            {step === 1 && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleMethodSelect('email')}
                  className="w-full h-20 text-left flex items-center gap-4 hover:border-[#d62828] hover:bg-slate-50"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">Per E-Mail</div>
                    <div className="text-sm text-slate-500">Code an deine E-Mail-Adresse</div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleMethodSelect('phone')}
                  className="w-full h-20 text-left flex items-center gap-4 hover:border-[#d62828] hover:bg-slate-50"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">Per SMS</div>
                    <div className="text-sm text-slate-500">Code an deine Handynummer</div>
                  </div>
                </Button>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-center text-slate-500">
                    Mit der Anmeldung stimmst du unseren{' '}
                    <a href={createPageUrl('AGB')} className="text-[#d62828] hover:underline">AGB</a>
                    {' '}und{' '}
                    <a href={createPageUrl('PrivacyPolicy')} className="text-[#d62828] hover:underline">Datenschutzbestimmungen</a>
                    {' '}zu.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Enter Contact */}
            {step === 2 && (
              <div className="space-y-5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep(1);
                    setMethod('');
                    setContact('');
                  }}
                  className="text-sm mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
                </Button>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    {method === 'email' ? 'Deine E-Mail-Adresse' : 'Deine Handynummer'}
                  </Label>
                  <Input
                    type={method === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                    placeholder={method === 'email' ? 'beispiel@email.de' : '+49 123 456789'}
                    className="h-14 text-lg"
                    autoFocus
                    style={{ fontSize: '16px' }}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {method === 'email' 
                      ? 'Wir senden einen Einmalcode an diese E-Mail-Adresse'
                      : 'Wir senden einen Einmalcode per SMS an diese Nummer'}
                  </p>
                </div>

                <Button
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-[#d62828] hover:bg-[#c91f23] text-white h-14 text-lg font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Wird gesendet...
                    </>
                  ) : (
                    'Code senden'
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Enter Code */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    📬 Code gesendet an: <strong>{contact}</strong>
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Gib den 6-stelligen Code ein
                  </Label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={(e) => e.key === 'Enter' && code.length === 6 && handleVerifyCode()}
                    placeholder="123456"
                    className="h-16 text-center text-3xl tracking-widest font-bold"
                    maxLength={6}
                    autoFocus
                    style={{ fontSize: '28px', letterSpacing: '0.5em' }}
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Der Code ist 15 Minuten gültig
                  </p>
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-bold"
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
                      setStep(2);
                      setCode('');
                      setCodeSent(false);
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
                    className="text-sm text-[#d62828] hover:text-[#c91f23]"
                  >
                    Code erneut senden
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Neu bei Zazarap? Kein Problem! Mit dem Code wird automatisch ein Konto für dich erstellt.
        </p>

      </div>
    </div>
  );
}