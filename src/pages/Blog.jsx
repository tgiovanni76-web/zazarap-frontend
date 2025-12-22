import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/blog/PostCard';

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const all = await base44.entities.BlogPost.list('-publishedAt');
      return (all || []).filter(p => p.published !== false);
    }
  });

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-slate-600 mb-6">Novità, guide e consigli per usare al meglio Zazarap.</p>

      {isLoading && <div>Caricamento…</div>}

      {!isLoading && posts.length === 0 && (
        <div className="text-slate-500">Nessun articolo pubblicato al momento.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map(p => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}