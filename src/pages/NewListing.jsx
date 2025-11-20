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

export default function NewListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    city: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const createListingMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = null;

      if (imageFile) {
        setIsUploading(true);
        const uploadResult = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = uploadResult.file_url;
        setIsUploading(false);
      }

      return base44.entities.Listing.create({
        ...data,
        image: imageUrl,
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
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Pubblica un nuovo annuncio</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Titolo</label>
        <Input
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Descrizione</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Prezzo</label>
        <Input
          name="price"
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
          name="city"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="mb-4"
        />

        <label className="block mb-2 font-medium">Immagine</label>
        <input 
          type="file" 
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4 block"
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="max-w-xs mb-4" />
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Caricamento...' : 'Pubblica'}
        </Button>
      </form>
    </div>
  );
}