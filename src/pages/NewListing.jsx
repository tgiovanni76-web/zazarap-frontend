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
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
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
    offerPrice: '',
    expiresAt: '',
    category: '',
    city: '',
    listingType: 'fixed',
    tags: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [promoType, setPromoType] = useState('none');
  const [promoBilling, setPromoBilling] = useState('week');
  const [promoQty, setPromoQty] = useState(1);
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
        const results = await Promise.all(
          imageFiles.map((file) => base44.integrations.Core.UploadFile({ file }))
        );
        imageUrls = results.map(r => r.file_url);
        setIsUploading(false);
      }

      const listing = await base44.entities.Listing.create({
        ...data,
        images: imageUrls,
        status: 'active',
        moderationStatus: 'pending'
      });

      // Trigger AI moderation in background
      base44.functions.invoke('moderateListing', { listingId: listing.id }).catch(err => {
        console.error('Moderation error:', err);
      });

      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success(t('newListing.successToast'));
      navigate(createPageUrl('Marketplace'));
    },
    onError: () => {
      toast.error(t('newListing.errorToast'));
      setIsUploading(false);
    }
  });

  const handleImageChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    const merged = [...imageFiles, ...picked].slice(0, 8);
    setImageFiles(merged);

    const readers = merged.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((urls) => setImagePreviews(urls));

    // reset input to allow picking the same file again
    e.target.value = '';
  };

  const removeImage = (idx) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category) {
      toast.error(t('newListing.requiredFields'));
      return;
    }

    // Validazione contenuto proibito
    try {
      const validationResult = await base44.functions.invoke('validateListingAdvanced', {
        title: formData.title,
        description: formData.description,
        categoryName: formData.category
      });

      if (!validationResult.data.allowed) {
        toast.error(t('error.illegal'), {
          duration: 5000
        });
        return;
      }
    } catch (err) {
      console.error('Validation error:', err);
      // Continua comunque se la validazione fallisce per errore tecnico
    }

    createListingMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
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
          className="zaza-input mt-4"
          placeholder=""
        />

        <label className="zaza-form-label">{t('description')}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="zaza-input mt-4"
          rows="5"
          placeholder=""
        />

        <label className="zaza-form-label">{t('price')} (€)</label>
        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="zaza-input mt-4"
          placeholder="0.00"
        />

        <label className="zaza-form-label">{t('newListing.offerPrice')}</label>
        <input
          name="offerPrice"
          type="number"
          value={formData.offerPrice}
          onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
          className="zaza-input"
          placeholder=""
        />

        <label className="zaza-form-label">{t('newListing.expiresAt')}</label>
        <input
          name="expiresAt"
          type="datetime-local"
          value={formData.expiresAt}
          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          className="zaza-input"
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
                    {t(mainCat.name)}
                  </option>
                  {subs.map(sub => (
                    <option key={sub.id} value={sub.name} style={{paddingLeft: '20px'}}>
                      ↳ {t(sub.name)}
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



        <label className="zaza-form-label">{t('listingType')}</label>
        <select
          value={formData.listingType}
          onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
          className="zaza-input"
        >
          <option value="fixed">{t('listingType.fixed')}</option>
          <option value="negotiable">{t('listingType.negotiable')}</option>
          <option value="auction">{t('listingType.auction')}</option>
        </select>

        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">{t('seoOptimization')}</h3>
          
          <label className="zaza-form-label">{t('metaTitle')}</label>
          <input
            value={formData.seo_title}
            onChange={(e) => setFormData({...formData, seo_title: e.target.value.slice(0, 60)})}
            className="zaza-input"
            placeholder=""
            maxLength={60}
          />
          <p className="text-xs text-slate-500 mt-1 mb-4">{formData.seo_title.length}/60 {t('chars')}</p>

          <label className="zaza-form-label">{t('metaDesc')}</label>
          <textarea
            value={formData.seo_description}
            onChange={(e) => setFormData({...formData, seo_description: e.target.value.slice(0, 160)})}
            className="zaza-input"
            placeholder=""
            maxLength={160}
            rows="3"
          />
          <p className="text-xs text-slate-500 mt-1 mb-4">{formData.seo_description.length}/160 {t('chars')}</p>

          <label className="zaza-form-label">{t('keywords')}</label>
          <input
            value={formData.seo_keywords}
            onChange={(e) => setFormData({...formData, seo_keywords: e.target.value})}
            className="zaza-input"
            placeholder=""
          />
        </div>

        <label className="zaza-form-label">
          {t('images')} (max 8){' '}{imageFiles.length > 0 && `• ${imageFiles.length}/8`}
        </label>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative group">
                <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full rounded object-cover aspect-square" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label={`Rimuovi immagine ${idx + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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