import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import SEOHead from '../components/SEOHead';
import SocialShareButtons from '../components/SocialShareButtons';

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => base44.entities.BlogPost.filter({ slug: slug }),
    enabled: !!slug
  });

  const post = posts[0];

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

  if (!post) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Articolo non trovato</h1>
        <Link to={createPageUrl('Blog')} className="text-red-600 hover:underline">
          Torna al blog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <SEOHead
        title={`${post.title} – Blog Zazarap`}
        description={post.excerpt || post.title}
        image={post.image}
        type="article"
      />

      <Link 
        to={createPageUrl('Blog')} 
        className="text-red-600 flex items-center gap-1 mb-6 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Torna al blog
      </Link>

      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-64 md:h-80 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex items-center gap-3 mb-4">
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

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      
      {post.excerpt && (
        <p className="text-lg text-slate-600 mb-6 border-l-4 border-red-600 pl-4">
          {post.excerpt}
        </p>
      )}

      <div className="prose prose-lg max-w-none mb-8">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="border-t pt-6">
        <p className="text-sm text-slate-600 mb-3">Condividi questo articolo:</p>
        <SocialShareButtons 
          url={window.location.href}
          title={post.title}
          description={post.excerpt}
        />
      </div>
    </div>
  );
}