import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Globe, Facebook, Instagram, Twitter, Linkedin, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function EditProfile() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    bio: '',
    profilePicture: '',
    websiteUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    phoneNumber: '',
    showPhone: false,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        websiteUrl: user.websiteUrl || '',
        facebookUrl: user.facebookUrl || '',
        instagramUrl: user.instagramUrl || '',
        twitterUrl: user.twitterUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        phoneNumber: user.phoneNumber || '',
        showPhone: user.showPhone || false,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profilo aggiornato');
      navigate(createPageUrl(`UserProfile?email=${user.email}`));
    },
    onError: () => {
      toast.error('Errore nell\'aggiornamento');
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profilePicture: file_url }));
      toast.success('Immagine caricata');
    } catch (err) {
      toast.error('Errore nel caricamento');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p>Devi essere loggato per modificare il profilo.</p>
        <Button onClick={() => base44.auth.redirectToLogin()} className="mt-4">
          Accedi
        </Button>
      </div>
    );
  }

  const getInitials = () => {
    const first = user.firstName?.[0] || user.full_name?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Modifica Profilo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={formData.profilePicture} />
                  <AvatarFallback className="text-3xl bg-red-100 text-red-600">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-sm text-slate-500">Clicca sull'icona per cambiare foto</p>
            </div>

            {/* Bio */}
            <div>
              <Label>Biografia</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Raccontaci qualcosa di te..."
                rows={4}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-medium">Link Social</h3>
              
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-500" />
                <Input
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://tuosito.com"
                />
              </div>

              <div className="flex items-center gap-3">
                <Facebook className="h-5 w-5 text-blue-600" />
                <Input
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/tuoprofilo"
                />
              </div>

              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-pink-600" />
                <Input
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  placeholder="https://instagram.com/tuoprofilo"
                />
              </div>

              <div className="flex items-center gap-3">
                <Twitter className="h-5 w-5 text-sky-500" />
                <Input
                  value={formData.twitterUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                  placeholder="https://twitter.com/tuoprofilo"
                />
              </div>

              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-blue-700" />
                <Input
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/tuoprofilo"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-4">
              <h3 className="font-medium">Telefono</h3>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showPhone">Mostra telefono pubblicamente</Label>
                <Switch
                  id="showPhone"
                  checked={formData.showPhone}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salva
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}