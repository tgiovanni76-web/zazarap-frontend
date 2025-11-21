import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function EditListing() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
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
  const [existingImages, setExistingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        category: listing.category || '',
        city: listing.city || '',
      });
      setExistingImages(listing.images || []);
    }
  }, [listing]);

  const updateListingMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrls = [...existingImages];

      if (imageFiles.length > 0) {
        setIsUploading(true);
        for (const file of imageFiles) {
          const uploadResult = await base44.integrations.Core.UploadFile({ file });
          imageUrls.push(uploadResult.file_url);
        }
        setIsUploading(false);
      }

      return base44.entities.Listing.update(listingId, {
        ...data,
        images: imageUrls.slice(0, 4)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      toast.success('Annuncio aggiornato!');
      navigate(createPageUrl('ListingDetail') + '?id=' + listingId);
    },
    onError: () => {
      toast.error('Errore nell\'aggiornamento');
      setIsUploading(false);
    }
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4 - existingImages.length);
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

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.category) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    updateListingMutation.mutate({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  const isLoadingState = isLoading || updateListingMutation.isPending || isUploading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Annuncio non trovato</h2>
          <Link to={createPageUrl('Marketplace')}>
            <Button>Torna al marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl('ListingDetail') + '?id=' + listingId}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">{t('editListing')}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="zaza-form-label">{t('title')}</label>
        <input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="zaza-input"
        />

        <label className="zaza-form-label">{t('description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="zaza-input"
          rows="5"
        />

        <label className="zaza-form-label">{t('price')} (€)</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="zaza-input"
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
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="zaza-input"
        />

        <label className="zaza-form-label">{t('existingImages')}</label>
        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Immagine ${idx + 1}`} className="w-full rounded" />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs"
                  onClick={() => removeExistingImage(idx)}
                >
                  {t('remove')}
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="zaza-form-label">{t('addNewImages')} (max {4 - existingImages.length})</label>
        <div className="zaza-upload">
          <input 
            type="file" 
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="edit-file-upload"
            disabled={existingImages.length >= 4}
          />
          <label htmlFor="edit-file-upload" className="cursor-pointer">
            <Upload className="inline h-6 w-6 mr-2" />
            {t('addMorePhotos')}
          </label>
        </div>
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {imagePreviews.map((preview, idx) => (
              <img key={idx} src={preview} alt={`Nuova ${idx + 1}`} className="w-full rounded" />
            ))}
          </div>
        )}

        <button type="submit" disabled={isLoadingState} className="zaza-submit">
          {isLoadingState ? t('loading') : t('saveChanges')}
        </button>
        <Link to={createPageUrl('ListingDetail') + '?id=' + listingId} className="block mt-3">
          <button type="button" className="w-full p-3 border-2 border-slate-400 rounded-lg">
            {t('cancel')}
          </button>
        </Link>
      </form>
    </div>
  );
}