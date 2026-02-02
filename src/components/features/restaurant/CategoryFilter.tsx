'use client';

import { CategoryFilter as CategoryFilterType, CATEGORY_LABELS } from '@/types';

interface CategoryFilterProps {
  selected: CategoryFilterType;
  onChange: (category: CategoryFilterType) => void;
}

const categories: CategoryFilterType[] = [
  'all',
  'korean',
  'chinese',
  'japanese',
  'western',
  'snack',
  'cafe',
];

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selected === category;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`
              flex-shrink-0 px-6 py-2.5 rounded-full font-semibold text-sm
              transition-all duration-200
              ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
