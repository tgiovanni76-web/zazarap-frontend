import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

export default function ManageCategories() {
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '', description: '', active: true, order: 0 });
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setFormData({ name: '', icon: '', description: '', active: true, order: 0 });
      toast.success('Categoria creata');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      setShowForm(false);
      toast.success('Categoria aggiornata');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria eliminata');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowForm(true);
  };

  const handleMoveOrder = (category, direction) => {
    const newOrder = category.order + direction;
    updateCategoryMutation.mutate({ id: category.id, data: { ...category, order: newOrder } });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold">{t('accessDenied')}</h2>
        <p className="text-slate-600">{t('adminOnly')}</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{t('admin.categoryManagement')}</h2>
        <Button onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', icon: '', description: '', active: true, order: 0 }); }}>
          <Plus className="h-4 w-4 mr-2" />
          {t('admin.newCategory')}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingCategory ? t('admin.editCategory') : t('admin.newCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Elettronica"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Icona (nome Lucide)</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="es. Laptop"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descrizione</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrizione categoria..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ordine</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label className="text-sm">Categoria attiva</label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingCategory ? 'Aggiorna' : 'Crea'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingCategory(null); }}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleMoveOrder(category, -1)}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleMoveOrder(category, 1)}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{category.name}</h3>
                      {!category.active && (<Badge variant="secondary">{t('admin.deactivated')}</Badge>)}
                    </div>
                    {category.description && <p className="text-sm text-slate-600">{category.description}</p>}
                    <p className="text-xs text-slate-500">Icona: {category.icon || 'N/A'} | Ordine: {category.order}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    if (confirm(t('admin.deleteCategoryConfirm'))) {
                      deleteCategoryMutation.mutate(category.id);
                    }
                  }}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}