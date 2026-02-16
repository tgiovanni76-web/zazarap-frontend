import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function CompleteProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [verificationMethod, setVerificationMethod] = useState(''); // 'email' or 'phone'
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  // Step 1 - Basic Info
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    // Step 2 - Location
    postalCode: '',
    street: '',
    country: '',
    region: '',
    province: '',
    city: '',
    latitude: null,
    longitude: null,
    zone: '',
    // Privacy
    privacyAccepted: false,
    marketingConsent: false,
    // Step 3 - Verification (optional)
    phoneNumber: '',
    verificationEmail: ''
  });

  const [errors, setErrors] = useState({});
  const [locationSearching, setLocationSearching] = useState(false);
  const [locationNotFound, setLocationNotFound] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [multipleCities, setMultipleCities] = useState([]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      toast.success(t('profile.success'));
      setTimeout(() => {
        navigate(createPageUrl('Marketplace'));
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Speichern');
    }
  });

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('profile.firstName.error');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('profile.lastName.error');
    }
    if (!formData.birthDate) {
      newErrors.birthDate = t('profile.birthDate.error');
    } else {
      const birthYear = new Date(formData.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 16) {
        newErrors.birthDate = t('profile.birthDate.ageError');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t('profile.postalCode.error');
    }
    if (!formData.street.trim()) {
      newErrors.street = t('profile.street.error');
    }
    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = t('profile.privacy.error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Search location by postal code
  const searchLocation = async (postalCode) => {
    if (!postalCode || postalCode.length < 4) return;

    setLocationSearching(true);
    setLocationNotFound(false);
    setMultipleCities([]);

    try {
      const { data } = await base44.functions.invoke('geocodePostalCode', {
        postalCode: postalCode.trim(),
        country: 'DE'
      });

      if (!data.found) {
        setLocationNotFound(true);
        setManualEntry(true);
        setLocationSearching(false);
        return;
      }

      if (data.multipleCities) {
        setMultipleCities(data.cities);
        setLocationSearching(false);
        return;
      }

      // Single result - auto-fill
      setFormData(prev => ({
        ...prev,
        country: data.country || 'Deutschland',
        region: data.region || '',
        province: data.province || '',
        city: data.city || '',
        latitude: data.lat,
        longitude: data.lon,
        zone: `${data.city}_${postalCode}`
      }));
      setLocationNotFound(false);
      setManualEntry(false);

    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationNotFound(true);
      setManualEntry(true);
    }

    setLocationSearching(false);
  };

  // Select city from multiple options
  const handleCitySelect = (selectedCity) => {
    const cityData = multipleCities.find(c => c.city === selectedCity);
    if (cityData) {
      setFormData(prev => ({
        ...prev,
        country: cityData.country || 'Deutschland',
        region: cityData.region || '',
        province: cityData.province || '',
        city: cityData.city,
        latitude: cityData.lat,
        longitude: cityData.lon,
        zone: `${cityData.city}_${formData.postalCode}`
      }));
      setMultipleCities([]);
    }
  };

  // Handle Step 1 Next
  const handleStep1Next = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // Handle Step 2 Next (to verification)
  const handleStep2Next = () => {
    if (!validateStep2()) return;
    setStep(3);
  };

  // Send verification code
  const sendVerificationCode = async () => {
    if (!verificationMethod) {
      toast.error(t('profile.verification.selectMethod'));
      return;
    }

    const value = verificationMethod === 'email' 
      ? formData.verificationEmail 
      : formData.phoneNumber;

    if (!value || value.trim().length === 0) {
      toast.error(t('profile.verification.enterValue'));
      return;
    }

    setSendingCode(true);
    try {
      await base44.functions.invoke('sendVerificationCode', {
        method: verificationMethod,
        value: value.trim()
      });
      setCodeSent(true);
      toast.success(t('profile.verification.codeSent'));
    } catch (error) {
      toast.error(error.message || t('profile.verification.sendError'));
    }
    setSendingCode(false);
  };

  // Verify code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      toast.error(t('profile.verification.codeInvalid'));
      return;
    }

    try {
      const { data } = await base44.functions.invoke('verifyCode', {
        method: verificationMethod,
        code: verificationCode.trim()
      });

      if (data.verified) {
        toast.success(t('profile.verification.success'));
        // Update user with verified status
        if (verificationMethod === 'email') {
          formData.verifiedEmail = true;
        } else {
          formData.verifiedPhone = true;
          formData.phoneNumber = formData.phoneNumber.trim();
        }
        // Proceed to final submit
        await handleFinalSubmit();
      } else {
        toast.error(t('profile.verification.codeFailed'));
      }
    } catch (error) {
      toast.error(error.message || t('profile.verification.verifyError'));
    }
  };

  // Handle Final Submit
  const handleFinalSubmit = async () => {
    const profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      postalCode: formData.postalCode,
      street: formData.street,
      country: formData.country,
      region: formData.region,
      province: formData.province,
      location: formData.city,
      city: formData.city,
      zone: formData.zone,
      latitude: formData.latitude,
      longitude: formData.longitude,
      privacyAccepted: formData.privacyAccepted,
      marketingConsent: formData.marketingConsent,
      phoneNumber: formData.phoneNumber || undefined,
      verifiedEmail: formData.verifiedEmail || false,
      verifiedPhone: formData.verifiedPhone || false
    };

    updateProfileMutation.mutate(profileData);
  };

  // Skip verification and complete profile
  const skipVerification = () => {
    handleFinalSubmit();
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ paddingBottom: 'max(80px, env(safe-area-inset-bottom))' }}>
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-[#d62828] font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-[#d62828] text-white' : 'bg-slate-200'}`}>1</div>
              <span className="text-sm hidden sm:inline">{t('profile.step1.basicInfo')}</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-slate-200 rounded">
              <div className={`h-full bg-[#d62828] rounded transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-[#d62828] font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-[#d62828] text-white' : 'bg-slate-200'}`}>2</div>
              <span className="text-sm hidden sm:inline">{t('profile.step2.title')}</span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-slate-200 rounded">
              <div className={`h-full bg-[#d62828] rounded transition-all ${step === 3 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#d62828] font-bold' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-[#d62828] text-white' : 'bg-slate-200'}`}>3</div>
              <span className="text-sm hidden sm:inline">{t('profile.step3.title')}</span>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#d62828] to-[#c91f23] text-white rounded-t-xl">
            <CardTitle className="text-2xl">
              {step === 1 ? t('profile.step1.title') : step === 2 ? t('profile.step2.title') : t('profile.step3.title')}
            </CardTitle>
            <CardDescription className="text-sm text-white/90 mt-1">
              {step === 1 ? t('profile.step1.subtitle') : step === 2 ? t('profile.step2.subtitle') : t('profile.step3.subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 pb-8">
            
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); handleStep1Next(); }} className="space-y-5">
                
                <div>
                  <Label htmlFor="firstName" className="text-base font-semibold mb-2 block">
                    {t('profile.firstName.label')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      setErrors({ ...errors, firstName: null });
                    }}
                    className={errors.firstName ? "border-red-500" : ""}
                    style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                    spellCheck="false"
                    autoCapitalize="words"
                    autoCorrect="off"
                  />
                  {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-base font-semibold mb-2 block">
                    {t('profile.lastName.label')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      setErrors({ ...errors, lastName: null });
                    }}
                    className={errors.lastName ? "border-red-500" : ""}
                    style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                    spellCheck="false"
                    autoCapitalize="words"
                    autoCorrect="off"
                  />
                  {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <Label htmlFor="birthDate" className="text-base font-semibold mb-2 block">
                    {t('profile.birthDate.label')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => {
                      setFormData({ ...formData, birthDate: e.target.value });
                      setErrors({ ...errors, birthDate: null });
                    }}
                    className={errors.birthDate ? "border-red-500" : ""}
                    style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                    spellCheck="false"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                  {errors.birthDate && <p className="text-red-600 text-sm mt-1">{errors.birthDate}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#d62828] hover:bg-[#c91f23] text-white h-14 text-lg font-bold rounded-xl mt-6"
                >
                  {t('profile.btn.next')} <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            )}

            {/* STEP 2: Location Data */}
            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
                
                <div>
                  <Label htmlFor="postalCode" className="text-base font-semibold mb-2 block">
                    {t('profile.postalCode.label')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, postalCode: value });
                      setErrors({ ...errors, postalCode: null });
                      
                      // Trigger search when 5 digits entered
                      if (value.length === 5) {
                        searchLocation(value);
                      }
                    }}
                    onBlur={() => searchLocation(formData.postalCode)}
                    className={errors.postalCode ? "border-red-500" : ""}
                    style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                    placeholder="z.B. 10115"
                    maxLength={5}
                    spellCheck="false"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                  {errors.postalCode && <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>}
                  
                  {locationSearching && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t('profile.location.searching')}</span>
                    </div>
                  )}
                  
                  {locationNotFound && (
                    <div className="flex items-center gap-2 mt-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{t('profile.postalCode.notFound')}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="street" className="text-base font-semibold mb-2 block">
                    {t('profile.street.label')} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => {
                      setFormData({ ...formData, street: e.target.value });
                      setErrors({ ...errors, street: null });
                    }}
                    className={errors.street ? "border-red-500" : ""}
                    style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                    placeholder="z.B. Hauptstraße 42"
                    spellCheck="false"
                    autoCapitalize="words"
                    autoCorrect="off"
                  />
                  {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
                </div>

                {/* Multiple Cities Selection */}
                {multipleCities.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <Label className="text-base font-semibold mb-3 block flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {t('profile.city.select')}
                    </Label>
                    <Select onValueChange={handleCitySelect}>
                      <SelectTrigger style={{ fontSize: '16px', padding: '14px' }}>
                        <SelectValue placeholder={t('profile.city.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {multipleCities.map((loc, idx) => (
                          <SelectItem key={idx} value={loc.city} style={{ fontSize: '16px' }}>
                            {loc.city} ({loc.province})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Auto-filled Location Fields */}
                {formData.country && !multipleCities.length && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Standort ermittelt:
                    </p>

                    <div>
                      <Label className="text-sm text-slate-600">{t('profile.country.label')}</Label>
                      <Input
                        value={formData.country}
                        readOnly
                        disabled={!manualEntry}
                        onChange={(e) => manualEntry && setFormData({ ...formData, country: e.target.value })}
                        className="bg-white mt-1"
                        style={{ fontSize: '16px', padding: '12px' }}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-slate-600">{t('profile.region.label')}</Label>
                      <Input
                        value={formData.region}
                        readOnly
                        disabled={!manualEntry}
                        onChange={(e) => manualEntry && setFormData({ ...formData, region: e.target.value })}
                        className="bg-white mt-1"
                        style={{ fontSize: '16px', padding: '12px' }}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-slate-600">{t('profile.province.label')}</Label>
                      <Input
                        value={formData.province}
                        readOnly
                        disabled={!manualEntry}
                        onChange={(e) => manualEntry && setFormData({ ...formData, province: e.target.value })}
                        className="bg-white mt-1"
                        style={{ fontSize: '16px', padding: '12px' }}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-slate-600">{t('profile.city.label')} (bearbeitbar)</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-white mt-1"
                        style={{ fontSize: '16px', padding: '12px' }}
                        spellCheck="false"
                        autoCapitalize="words"
                        autoCorrect="off"
                      />
                    </div>

                    {manualEntry && (
                      <p className="text-xs text-slate-500 mt-2">
                        {t('profile.location.manualEntry')}
                      </p>
                    )}
                  </div>
                )}

                {/* Privacy Consent */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacyAccepted}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, privacyAccepted: checked });
                        setErrors({ ...errors, privacyAccepted: null });
                      }}
                      className={errors.privacyAccepted ? "border-red-500" : ""}
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                      {t('profile.privacy.label')} <span className="text-red-600">*</span>
                    </Label>
                  </div>
                  {errors.privacyAccepted && <p className="text-red-600 text-sm">{errors.privacyAccepted}</p>}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="marketing"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => setFormData({ ...formData, marketingConsent: checked })}
                    />
                    <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer text-slate-600">
                      {t('profile.marketing.label')}
                    </Label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 text-base font-semibold rounded-xl"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" /> {t('profile.btn.back')}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleStep2Next}
                    className="flex-1 bg-[#d62828] hover:bg-[#c91f23] text-white h-14 text-lg font-bold rounded-xl"
                  >
                    {t('profile.btn.next')} <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Account Verification (Optional) */}
            {step === 3 && (
              <div className="space-y-5">
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>{t('profile.step3.optional')}</strong> {t('profile.step3.optionalDesc')}
                  </p>
                </div>

                {!verificationMethod && (
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">{t('profile.verification.choose')}</Label>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVerificationMethod('email')}
                      className="w-full h-16 text-left flex items-center gap-4 hover:border-[#d62828]"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📧</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('profile.verification.email')}</div>
                        <div className="text-sm text-slate-500">{t('profile.verification.emailDesc')}</div>
                      </div>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVerificationMethod('phone')}
                      className="w-full h-16 text-left flex items-center gap-4 hover:border-[#d62828]"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div>
                        <div className="font-semibold">{t('profile.verification.phone')}</div>
                        <div className="text-sm text-slate-500">{t('profile.verification.phoneDesc')}</div>
                      </div>
                    </Button>
                  </div>
                )}

                {verificationMethod && !codeSent && (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setVerificationMethod('')}
                      className="text-sm"
                    >
                      ← {t('profile.verification.changeMethod')}
                    </Button>

                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        {verificationMethod === 'email' ? t('profile.verification.emailLabel') : t('profile.verification.phoneLabel')}
                      </Label>
                      <Input
                        type={verificationMethod === 'email' ? 'email' : 'tel'}
                        value={verificationMethod === 'email' ? formData.verificationEmail : formData.phoneNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          [verificationMethod === 'email' ? 'verificationEmail' : 'phoneNumber']: e.target.value
                        })}
                        placeholder={verificationMethod === 'email' ? 'beispiel@email.de' : '+49 123 456789'}
                        className="h-12"
                        style={{ fontSize: '16px', padding: '14px' }}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={sendingCode}
                      className="w-full bg-[#d62828] hover:bg-[#c91f23] text-white h-14"
                    >
                      {sendingCode ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('profile.verification.sending')}
                        </>
                      ) : (
                        t('profile.verification.sendCode')
                      )}
                    </Button>
                  </div>
                )}

                {codeSent && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        {t('profile.verification.codeSentTo')} <strong>{verificationMethod === 'email' ? formData.verificationEmail : formData.phoneNumber}</strong>
                      </p>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        {t('profile.verification.enterCode')}
                      </Label>
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="h-14 text-center text-2xl tracking-widest"
                        maxLength={6}
                        style={{ fontSize: '24px' }}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={verifyCode}
                      disabled={verificationCode.length !== 6}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-bold"
                    >
                      {t('profile.verification.verify')}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={sendVerificationCode}
                      disabled={sendingCode}
                      className="w-full text-sm"
                    >
                      {t('profile.verification.resend')}
                    </Button>
                  </div>
                )}

                <div className="border-t pt-6 mt-6">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 h-14 text-base font-semibold rounded-xl"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" /> {t('profile.btn.back')}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={skipVerification}
                      disabled={updateProfileMutation.isPending}
                      variant="outline"
                      className="flex-1 h-14 text-base font-semibold rounded-xl"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('profile.creating')}
                        </>
                      ) : (
                        t('profile.btn.skip')
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-slate-500 mt-3">
                    {t('profile.step3.laterInfo')}
                  </p>
                </div>

              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}