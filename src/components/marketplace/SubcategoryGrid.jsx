import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageProvider';

export default function SubcategoryGrid({ categories, parent }) {
  const { t } = useLanguage();
  const subs = categories.filter(c => c.parentId === parent?.id && c.active);
  if (subs.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {subs.map((s) => (
        <Link key={s.id} to={createPageUrl('Marketplace') + `?category=${encodeURIComponent(s.name)}`}>
          <div className="inline-flex items-center rounded-full border border-[var(--z-border-soft)] bg-white px-3 py-1 text-sm text-slate-700 shadow-sm hover:shadow whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
            {t(s.i18nKey || s.locales?.de || s.name)}
          </div>
        </Link>
      ))}
    </div>
  );
}