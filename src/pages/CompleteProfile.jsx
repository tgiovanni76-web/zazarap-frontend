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

export default function CompleteProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    birthDate: '',
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
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'La data di nascita è obbligatoria';
    }
    
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
      newErrors.privacyAccepted = 'Devi accettare la privacy policy';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateProfileMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[#d62828]">Benvenuto in Zazarap!</CardTitle>
          <CardDescription>
            Completa il tuo profilo per iniziare a comprare e vendere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data di Nascita</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className={errors.birthDate ? "border-red-500" : ""}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>

            <div className="items-top flex space-x-2">
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
                  Accetto la <a href="/PrivacyPolicy" target="_blank" className="underline text-blue-600">Privacy Policy</a> e i <a href="/AGB" target="_blank" className="underline text-blue-600">Termini di Servizio</a>
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
                  (Opzionale) Voglio ricevere offerte e novità via email
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#d62828] hover:bg-[#b91c1c] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Salvataggio...' : 'Completa Registrazione'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}