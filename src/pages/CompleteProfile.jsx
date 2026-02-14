import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function CompleteProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    address: '',
    country: '',
    province: '',
    region: '',
    privacyAccepted: false,
    marketingAccepted: false
  });
  
  const [errors, setErrors] = useState({});

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profilo completato con successo!');
      navigate(createPageUrl('Marketplace')); // Redirect to home
    },
    onError: (error) => {
      toast.error('Errore durante il salvataggio: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = t('error');
    if (!formData.lastName) newErrors.lastName = t('error');
    if (!formData.address) newErrors.address = t('error');
    if (!formData.country) newErrors.country = t('error');
    if (!formData.province) newErrors.province = t('error');
    if (!formData.region) newErrors.region = t('error');
    if (!formData.birthDate) newErrors.birthDate = t('error');
    
    // Check age (e.g., at least 16 years old)
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16) {
        newErrors.birthDate = 'Devi avere almeno 16 anni per registrarti.';
      }
    }

    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = t('error');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateProfileMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
      <Card className="w-full max-w-md" style={{ overflow: 'visible' }}>
        <div className="absolute top-4 right-4">
            <LanguageSwitcher />
        </div>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[#d62828]">{t('welcome')} Zazarap!</CardTitle>
          <CardDescription>
            {t('completeProfileDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={errors.firstName ? "border-red-500" : ""}
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={errors.lastName ? "border-red-500" : ""}
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">{t('birthDate')}</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className={errors.birthDate ? "border-red-500" : ""}
                style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
              />
              {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={errors.address ? "border-red-500" : ""}
                style={{ fontSize: '16px', padding: '14px', borderRadius: '10px', WebkitTextSizeAdjust: '100%' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={errors.country ? "border-red-500" : ""}
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">{t('region')}</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className={errors.region ? "border-red-500" : ""}
                  style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">{t('province')}</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className={errors.province ? "border-red-500" : ""}
                style={{ fontSize: '16px', padding: '14px', borderRadius: '10px' }}
              />
            </div>

            <div className="items-top flex space-x-2 mt-4">
              <Checkbox 
                id="privacy" 
                checked={formData.privacyAccepted}
                onCheckedChange={(checked) => setFormData({ ...formData, privacyAccepted: checked })}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="privacy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('acceptPrivacy')}
                </Label>
                {errors.privacyAccepted && (
                  <p className="text-sm text-red-500">{errors.privacyAccepted}</p>
                )}
              </div>
            </div>

            <div className="items-top flex space-x-2">
              <Checkbox 
                id="marketing" 
                checked={formData.marketingAccepted}
                onCheckedChange={(checked) => setFormData({ ...formData, marketingAccepted: checked })}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="marketing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('marketingConsent')}
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#d62828] hover:bg-[#b91c1c] text-white font-bold rounded focus:outline-none focus:shadow-outline"
              style={{ height: '52px', borderRadius: '12px', marginTop: '10px', marginBottom: 'calc(env(safe-area-inset-bottom) + 12px)', fontWeight: '600' }}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? t('loading') : t('completeProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}