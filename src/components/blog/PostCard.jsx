import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PostCard({ post }) {
  return (
    <article className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full h-44 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">
          <Link to={createPageUrl(`BlogPost?slug=${encodeURIComponent(post.slug)}`)} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="text-slate-600 text-sm line-clamp-3">{post.excerpt}</p>}
        <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-2">
          {post.tags?.map((t) => (
            <span key={t} className="px-2 py-0.5 rounded bg-slate-100 border">#{t}</span>
          ))}
          {post.publishedAt && (
            <span className="ml-auto">{new Date(post.publishedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </article>
  );
}