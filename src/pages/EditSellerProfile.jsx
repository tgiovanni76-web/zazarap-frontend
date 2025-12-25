import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Upload, Save, ArrowLeft } from 'lucide-react';

export default function EditSellerProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const [formData, setFormData] = useState({
    profilePicture: '',
    companyName: '',
    companyDescription: '',
    phoneNumber: '',
    website: '',
    location: '',
    businessType: 'privato',
    vatNumber: '',
    responseTime: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData({
        profilePicture: user.profilePicture || '',
        companyName: user.companyName || '',
        companyDescription: user.companyDescription || '',
        phoneNumber: user.phoneNumber || '',
        website: user.website || '',
        location: user.location || '',
        businessType: user.businessType || 'privato',
        vatNumber: user.vatNumber || '',
        responseTime: user.responseTime || ''
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      toast.success('Profil erfolgreich aktualisiert');
      queryClient.invalidateQueries(['currentUser']);
      navigate(createPageUrl('SellerProfile') + `?id=${user.email}`);
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern: ' + error.message);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profilePicture: file_url }));
      toast.success('Bild hochgeladen');
    } catch (error) {
      toast.error('Fehler beim Hochladen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Lädt...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Bitte anmelden</h2>
        <Button onClick={() => base44.auth.redirectToLogin()}>
          Anmelden
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Button
        variant="outline"
        onClick={() => navigate(createPageUrl('SellerProfile') + `?id=${user.email}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zum Profil
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Verkäuferprofil bearbeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={formData.profilePicture} />
                <AvatarFallback className="text-3xl">
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="cursor-pointer">
                <Button type="button" variant="outline" disabled={uploadingImage} asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Lädt hoch...' : 'Profilbild ändern'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Business Type */}
            <div>
              <Label htmlFor="businessType">Verkäufertyp</Label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="privato">Privatverkäufer</option>
                <option value="professionista">Professionell</option>
                <option value="negozio">Geschäft</option>
                <option value="azienda">Unternehmen</option>
              </select>
            </div>

            {/* Company Name */}
            <div>
              <Label htmlFor="companyName">Firmenname / Geschäftsname (optional)</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Mein Geschäft"
              />
            </div>

            {/* Company Description */}
            <div>
              <Label htmlFor="companyDescription">Über mich / Geschäftsbeschreibung</Label>
              <Textarea
                id="companyDescription"
                value={formData.companyDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                placeholder="Erzählen Sie etwas über Ihr Geschäft..."
                rows={4}
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Standort</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Berlin, Deutschland"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phoneNumber">Telefonnummer (optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+49 123 456789"
              />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://meine-website.de"
              />
            </div>

            {/* VAT Number */}
            {(formData.businessType === 'professionista' || formData.businessType === 'azienda') && (
              <div>
                <Label htmlFor="vatNumber">Umsatzsteuer-ID (optional)</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, vatNumber: e.target.value }))}
                  placeholder="DE123456789"
                />
              </div>
            )}

            {/* Response Time */}
            <div>
              <Label htmlFor="responseTime">Durchschnittliche Antwortzeit (optional)</Label>
              <select
                id="responseTime"
                value={formData.responseTime}
                onChange={(e) => setFormData(prev => ({ ...prev, responseTime: e.target.value }))}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="">Wählen...</option>
                <option value="wenigen Minuten">wenigen Minuten</option>
                <option value="1 Stunde">1 Stunde</option>
                <option value="wenigen Stunden">wenigen Stunden</option>
                <option value="1 Tag">1 Tag</option>
                <option value="2-3 Tagen">2-3 Tagen</option>
              </select>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Speichert...' : 'Änderungen speichern'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(createPageUrl('SellerProfile') + `?id=${user.email}`)}
              >
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}