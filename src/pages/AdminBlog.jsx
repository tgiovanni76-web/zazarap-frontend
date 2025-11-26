import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminBlog() {
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'guide',
    published: false,
    publishedAt: ''
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['allBlogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      resetForm();
      toast.success('Articolo creato');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      resetForm();
      toast.success('Articolo aggiornato');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
      toast.success('Articolo eliminato');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      category: 'guide',
      published: false,
      publishedAt: ''
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      category: post.category || 'guide',
      published: post.published || false,
      publishedAt: post.publishedAt || ''
    });
    setEditingPost(post);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Compila titolo, slug e contenuto');
      return;
    }

    const data = {
      ...formData,
      publishedAt: formData.published && !formData.publishedAt 
        ? new Date().toISOString().split('T')[0] 
        : formData.publishedAt
    };

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[àáäâ]/g, 'a')
      .replace(/[èéëê]/g, 'e')
      .replace(/[ìíïî]/g, 'i')
      .replace(/[òóöô]/g, 'o')
      .replace(/[ùúüû]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Accesso negato</h1>
        <p>Solo gli admin possono gestire il blog.</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestione Blog</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuovo Articolo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingPost ? 'Modifica Articolo' : 'Nuovo Articolo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titolo *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value)
                    });
                  }}
                  placeholder="Titolo dell'articolo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug URL *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-articolo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="sicurezza">Sicurezza</SelectItem>
                    <SelectItem value="novità">Novità</SelectItem>
                    <SelectItem value="consigli">Consigli</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Excerpt/Anteprima</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve descrizione dell'articolo"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contenuto * (Markdown)</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenuto completo in Markdown..."
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Immagine URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                  />
                  <label className="text-sm font-medium">Pubblicato</label>
                </div>

                {formData.published && (
                  <div>
                    <Input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingPost ? 'Salva Modifiche' : 'Crea Articolo'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{post.title}</h3>
                  {post.published ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Eye className="h-3 w-3 mr-1" /> Pubblicato
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <EyeOff className="h-3 w-3 mr-1" /> Bozza
                    </Badge>
                  )}
                  {post.category && (
                    <Badge variant="secondary">{post.category}</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">/{post.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => {
                    if (confirm('Eliminare questo articolo?')) {
                      deleteMutation.mutate(post.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && !isLoading && (
          <p className="text-center text-slate-500 py-8">Nessun articolo creato ancora.</p>
        )}
      </div>
    </div>
  );
}