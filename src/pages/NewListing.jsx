import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function NewListing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrls = [];

      if (imageFiles.length > 0) {
        setIsUploading(true);
        for (const file of imageFiles) {
          const uploadResult = await base44.integrations.Core.UploadFile({ file });
          imageUrls.push(uploadResult.file_url);
        }
        setIsUploading(false);
      }

      return base44.entities.Listing.create({
        ...data,
        images: imageUrls,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Annuncio pubblicato con successo!');
      navigate(createPageUrl('Marketplace'));
    },
    onError: () => {
      toast.error('Errore nella pubblicazione dell\'annuncio');
      setIsUploading(false);
    }
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (files.length > 0) {
      setImageFiles(files);
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    createListingMutation.mutate({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  const isLoading = createListingMutation.isPending || isUploading;

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t('publish')}</h2>
      <form onSubmit={handleSubmit}>
        <label className="zaza-form-label">{t('title')}</label>
        <input
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="zaza-input"
          placeholder=""
        />

        <label className="zaza-form-label">{t('description')}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="zaza-input"
          rows="5"
          placeholder=""
        />

        <label className="zaza-form-label">{t('price')} (€)</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="zaza-input"
          placeholder="0.00"
        />

        <label className="zaza-form-label">{t('category')}</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="zaza-input"
        >
          <option value="">{t('selectCategory')}</option>
          <option value="elettronica">{t('electronics')}</option>
          <option value="casa">{t('home')}</option>
          <option value="moda">{t('fashion')}</option>
          <option value="sport">{t('sports')}</option>
          <option value="auto">{t('auto')}</option>
          <option value="animali">{t('animals')}</option>
          <option value="altro">{t('other')}</option>
        </select>

        <label className="zaza-form-label">{t('city')}</label>
        <input
          name="city"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="zaza-input"
          placeholder=""
        />

        <label className="zaza-form-label">{t('images')} (max 4)</label>
        <div className="zaza-upload">
          <input 
            type="file" 
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="inline h-6 w-6 mr-2" />
            {t('images')}
          </label>
        </div>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {imagePreviews.map((preview, idx) => (
              <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full rounded" />
            ))}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="zaza-submit">
          {isLoading ? t('loading') : t('submit')}
        </button>
        </form>
        </div>
  );
}