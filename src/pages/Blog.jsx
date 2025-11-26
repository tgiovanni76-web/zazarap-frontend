import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import SEOHead from '../components/SEOHead';

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-publishedAt'),
  });

  const categoryColors = {
    guide: 'bg-blue-100 text-blue-800',
    sicurezza: 'bg-red-100 text-red-800',
    novità: 'bg-green-100 text-green-800',
    consigli: 'bg-yellow-100 text-yellow-800'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <SEOHead
        title="Blog Zazarap – Guide e consigli per il marketplace"
        description="Guide, consigli e novità sul marketplace Zazarap: sicurezza, pagamenti escrow, recensioni, e molto altro."
      />
      
      <h1 className="text-3xl font-bold mb-2">Blog Zazarap</h1>
      <p className="text-slate-600 mb-8">
        Guide pratiche, novità della piattaforma e consigli per comprare e vendere in sicurezza.
      </p>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="md:flex">
              {post.image && (
                <div className="md:w-1/3">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
              )}
              <CardContent className={`p-6 ${post.image ? 'md:w-2/3' : 'w-full'}`}>
                <div className="flex items-center gap-3 mb-3">
                  {post.category && (
                    <Badge className={categoryColors[post.category]}>
                      {post.category}
                    </Badge>
                  )}
                  {post.publishedAt && (
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(post.publishedAt), 'dd MMMM yyyy', { locale: de })}
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-slate-600 mb-4">{post.excerpt}</p>
                
                <Link 
                  to={createPageUrl('BlogPost') + '?slug=' + post.slug}
                  className="text-red-600 font-medium flex items-center gap-1 hover:underline"
                >
                  Leggi l'articolo <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </div>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Nessun articolo pubblicato ancora.</p>
          </div>
        )}
      </div>
    </div>
  );
}