import React, { useState, useEffect } from 'react';
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
import { generateVariantBlobs, makeVariantFilenames } from "../components/media/imageUtils";
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';
import VehicleForm from "../components/listings/VehicleForm";


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
  const [imageFiles, setImageFiles] = useState([]); // selected originals (client-side)
  const MAX_IMAGES = 8;
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
  const [promoType, setPromoType] = useState('none');
  const [promoBilling, setPromoBilling] = useState('week');
  const [promoQty, setPromoQty] = useState(1);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [vehicle, setVehicle] = useState({
    brand: '',
    model: '',
    registrationYear: '',
    mileageKm: '',
    fuelType: '',
    transmission: '',
    powerKw: '',
    color: '',
    condition: '',
    tuvValidUntil: '',
    equipment: []
  });

  useEffect(() => {
    if ((formData.category || '').toLowerCase() !== 'auto') {
      setVehicle({
        brand: '', model: '', registrationYear: '', mileageKm: '', fuelType: '', transmission: '', powerKw: '', color: '', condition: '', tuvValidUntil: '', equipment: []
      });
    }
  }, [formData.category]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
        let cardUrls = [];
        const originals = [];

        if (imageFiles.length > 0) {
          setIsUploading(true);
          for (const file of imageFiles) {
            // Process variants client-side
            const variants = await generateVariantBlobs(file);
            const names = makeVariantFilenames(file.name.replace(/\.(heic|heif|jpeg|jpg|png|webp)$/i, ''));

            // Upload original (private) to keep 30 days
            const originalUpload = await base44.integrations.Core.UploadPrivateFile({ file });
            originals.push({ fileUri: originalUpload.file_uri, originalName: file.name, contentType: file.type, size: file.size, width: variants.width, height: variants.height });

            // Upload public variants
            const thumbFile = new File([variants.thumb.blob], `${names.thumb}.${variants.thumb.ext}`, { type: variants.thumb.type });
            const cardFile  = new File([variants.card.blob],  `${names.card}.${variants.card.ext}`,   { type: variants.card.type });
            const fullFile  = new File([variants.full.blob],  `${names.full}.${variants.full.ext}`,   { type: variants.full.type });

            const [thumbRes, cardRes, fullRes] = await Promise.all([
              base44.integrations.Core.UploadFile({ file: thumbFile }),
              base44.integrations.Core.UploadFile({ file: cardFile }),
              base44.integrations.Core.UploadFile({ file: fullFile }),
            ]);
            cardUrls.push(cardRes.file_url); // store only CARD in Listing
          }
          setIsUploading(false);
        }

        // Create listing with CARD images only
        const listing = await base44.entities.Listing.create({
          ...data,
          images: cardUrls,
          status: 'active',
          moderationStatus: 'pending'
        });

        // Link originals to listing in MediaAsset registry
        for (const o of originals) {
          try {
            await base44.functions.invoke('registerMediaAsset', {
              fileUri: o.fileUri,
              originalName: o.originalName,
              contentType: o.contentType,
              size: o.size,
              kind: 'image',
              width: o.width,
              height: o.height,
              correlationId: `listing:${listing.id}`
            });
          } catch (e) { console.warn('registerMediaAsset failed', e); }
        }

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

    // Validate type and size, block HEIC/HEIF
    const valid = [];
    for (const f of picked) {
      const t = (f.type || '').toLowerCase();
      const name = (f.name || '').toLowerCase();
      if (t.includes('heic') || t.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')) {
        continue; // block uncompressed HEIC/HEIF
      }
      if (!['image/jpeg','image/png','image/webp'].includes(t)) continue;
      if (f.size > MAX_IMAGE_BYTES) continue;
      valid.push(f);
    }

    const merged = [...imageFiles, ...valid].slice(0, MAX_IMAGES);
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

    const isAuto = (formData.category || '').toLowerCase() === 'auto';
    const baseTitle = (formData.title || '').trim();
    const baseDesc = (formData.description || '').trim();
    const seoTitleRaw = isAuto && vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model} - ${baseTitle}` : baseTitle;
    const seo_title = seoTitleRaw.slice(0, 60);
    const seo_description = baseDesc.slice(0, 160);
    const keywordParts = [formData.title, formData.category];
    if (isAuto) keywordParts.push(vehicle.brand, vehicle.model, vehicle.fuelType, vehicle.transmission, String(vehicle.registrationYear || ''));
    const seo_keywords = keywordParts.filter(Boolean).join(', ').toLowerCase();

    const vehiclePayload = isAuto ? {
      brand: vehicle.brand || undefined,
      model: vehicle.model || undefined,
      registrationYear: vehicle.registrationYear ? parseInt(vehicle.registrationYear, 10) : undefined,
      mileageKm: vehicle.mileageKm ? parseInt(vehicle.mileageKm, 10) : undefined,
      fuelType: vehicle.fuelType || undefined,
      transmission: vehicle.transmission || undefined,
      powerKw: vehicle.powerKw ? parseFloat(vehicle.powerKw) : undefined,
      color: vehicle.color || undefined,
      condition: vehicle.condition || undefined,
      tuvValidUntil: vehicle.tuvValidUntil || undefined,
      equipment: (vehicle.equipment || []).length ? vehicle.equipment : undefined,
    } : undefined;

    createListingMutation.mutate({
      ...formData,
      seo_title,
      seo_description,
      seo_keywords,
      price: parseFloat(formData.price),
      offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      vehicle: vehiclePayload
    });
  };

  const isLoading = createListingMutation.isPending || isUploading;

  // Gate: require login to publish
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Accedi per pubblicare</h1>
        <p className="text-slate-600 mb-6">Per inserire un annuncio devi effettuare l'accesso.</p>
        <button
          className="bg-[var(--z-primary)] text-white px-5 py-2 rounded-lg"
          onClick={() => base44.auth.redirectToLogin(createPageUrl('NewListing'))}
        >
          Accedi / Registrati
        </button>
      </div>
    );
  }
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

        {formData.category && formData.category.toLowerCase() === 'auto' && (
          <VehicleForm vehicle={vehicle} onChange={setVehicle} />
        )}

        <label className="zaza-form-label">
          {t('images')} (max 10){' '}{imageFiles.length > 0 && `• ${imageFiles.length}/${MAX_IMAGES}`}
        </label>
        <div className="zaza-upload">
          <input 
            type="file" 
            name="images"
            accept="image/jpeg,image/png,image/webp"
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