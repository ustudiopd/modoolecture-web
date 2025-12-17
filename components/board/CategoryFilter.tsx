'use client';

import { cn } from '@/lib/utils/cn';
import { getTagLabel } from '@/lib/types/question-tags';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryLabels?: string[];
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryLabels,
}: CategoryFilterProps) {
  const getLabel = (cat: string, index: number) => {
    if (categoryLabels && categoryLabels[index]) {
      return categoryLabels[index];
    }
    if (cat === 'All') {
      return '전체';
    }
    return getTagLabel(cat);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat, index) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategory === cat
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          )}
        >
          {getLabel(cat, index)}
        </button>
      ))}
    </div>
  );
}



