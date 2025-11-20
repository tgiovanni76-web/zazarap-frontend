import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditListing() {
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
    <div className="py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl('ListingDetail') + '?id=' + listingId}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Modifica annuncio</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Titolo</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Descrizione</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Prezzo</label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Categoria</label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Seleziona categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="elettronica">Elettronica</SelectItem>
            <SelectItem value="casa">Casa</SelectItem>
            <SelectItem value="moda">Moda</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="animali">Animali</SelectItem>
            <SelectItem value="altro">Altro</SelectItem>
          </SelectContent>
        </Select>

        <label className="block mb-2 font-medium">Città</label>
        <Input
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Immagini esistenti</label>
        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {existingImages.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Immagine ${idx + 1}`} className="w-full rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeExistingImage(idx)}
                >
                  Rimuovi
                </Button>
              </div>
            ))}
          </div>
        )}

        <label className="block mb-2 font-medium">Aggiungi nuove immagini (max {4 - existingImages.length})</label>
        <input 
          type="file" 
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mb-4 block"
          disabled={existingImages.length >= 4}
        />
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {imagePreviews.map((preview, idx) => (
              <img key={idx} src={preview} alt={`Nuova ${idx + 1}`} className="w-full rounded" />
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoadingState}>
            {isLoadingState ? 'Caricamento...' : 'Salva modifiche'}
          </Button>
          <Link to={createPageUrl('ListingDetail') + '?id=' + listingId}>
            <Button type="button" variant="outline">Annulla</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}