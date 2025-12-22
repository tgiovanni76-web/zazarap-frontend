import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || '';

  const { data: post } = useQuery({
    queryKey: ['blogPost', slug],
    enabled: !!slug,
    queryFn: async () => {
      const list = await base44.entities.BlogPost.filter({ slug });
      return list?.[0] || null;
    }
  });

  if (!slug) return <div className="py-8">Articolo non trovato.</div>;

  if (!post) return <div className="py-8">Caricamento…</div>;

  return (
    <article className="py-8 max-w-3xl mx-auto">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      {post.publishedAt && (
        <div className="text-sm text-slate-500 mb-6">Pubblicato il {new Date(post.publishedAt).toLocaleDateString()}</div>
      )}
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown>{post.content || ''}</ReactMarkdown>
      </div>
    </article>
  );
}