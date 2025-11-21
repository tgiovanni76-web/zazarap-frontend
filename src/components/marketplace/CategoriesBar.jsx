import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronDown } from 'lucide-react';

export default function CategoriesBar({ onCategorySelect, selectedCategory }) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order'),
  });

  const mainCategories = categories.filter(c => !c.parentId && c.active);

  return (
    <div className="bg-white border-b-2 border-red-200 mb-6 overflow-x-auto">
      <div className="flex gap-1 px-2 py-2">
        <button
          onClick={() => onCategorySelect('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-yellow-100 text-red-600 hover:bg-yellow-200'
          }`}
        >
          Tutte
        </button>
        {mainCategories.map((cat) => {
          const subCategories = categories.filter(c => c.parentId === cat.id && c.active);
          return (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => onCategorySelect(cat.name)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  selectedCategory === cat.name
                    ? 'bg-red-600 text-white'
                    : 'bg-yellow-100 text-red-600 hover:bg-yellow-200'
                }`}
              >
                {cat.name}
                {subCategories.length > 0 && <ChevronDown className="h-4 w-4" />}
              </button>
              {subCategories.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white border-2 border-red-200 rounded-lg shadow-lg hidden group-hover:block z-10 min-w-[200px]">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => onCategorySelect(sub.name)}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-yellow-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}