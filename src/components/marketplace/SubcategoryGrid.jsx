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
    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      {subs.map((s) => (
        <Link key={s.id} to={createPageUrl('Marketplace') + `?category=${encodeURIComponent(s.name)}` }>
          <Card className="hover:shadow-sm">
            <CardContent className="py-3 text-center text-sm">
              {t(s.i18nKey || s.name)}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}