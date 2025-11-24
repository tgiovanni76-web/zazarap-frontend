import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

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
          {categories
            .filter(c => !c.parentId && c.active)
            .map(mainCat => {
              const subs = categories.filter(c => c.parentId === mainCat.id && c.active);
              return (
                <React.Fragment key={mainCat.id}>
                  <option value={mainCat.name} style={{fontWeight: 'bold'}}>
                    {mainCat.name}
                  </option>
                  {subs.map(sub => (
                    <option key={sub.id} value={sub.name} style={{paddingLeft: '20px'}}>
                      ↳ {sub.name}
                    </option>
                  ))}
                </React.Fragment>
              );
            })}
        </select>

        <label className="zaza-form-label">{t('city')}</label>
        <input
          name="city"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="zaza-input"
          placeholder=""
        />

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">SEO Optimization (Opzionale)</h3>
          
          <label className="zaza-form-label">Meta Title (max 60 caratteri)</label>
          <input
            value={formData.seo_title}
            onChange={(e) => setFormData({...formData, seo_title: e.target.value.slice(0, 60)})}
            className="zaza-input"
            placeholder="Es: Vendo iPhone 13 Pro Usato - Milano €500"
            maxLength={60}
          />
          <p className="text-xs text-slate-500 mt-1 mb-4">{formData.seo_title.length}/60 caratteri</p>

          <label className="zaza-form-label">Meta Description (max 160 caratteri)</label>
          <textarea
            value={formData.seo_description}
            onChange={(e) => setFormData({...formData, seo_description: e.target.value.slice(0, 160)})}
            className="zaza-input"
            placeholder="Descrizione breve per i motori di ricerca..."
            maxLength={160}
            rows="3"
          />
          <p className="text-xs text-slate-500 mt-1 mb-4">{formData.seo_description.length}/160 caratteri</p>

          <label className="zaza-form-label">Keywords SEO (separate da virgola)</label>
          <input
            value={formData.seo_keywords}
            onChange={(e) => setFormData({...formData, seo_keywords: e.target.value})}
            className="zaza-input"
            placeholder="Es: iphone, smartphone, usato, milano"
          />
        </div>

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