import React from 'react';
import { ArrowUpDown, Filter, Sparkles } from 'lucide-react';
import { Gender, ProductCategory } from '../types/product';

export type SortOption = 'match' | 'price-asc' | 'price-desc' | 'rating';

interface FilterBarProps {
  selectedGender: Gender;
  onGenderChange: (gender: Gender) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isVisualSearchActive: boolean;
  totalProductsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedGender,
  onGenderChange,
  sortBy,
  onSortChange,
  isVisualSearchActive,
  totalProductsCount,
}) => {
  const genders: Gender[] = ['All', 'Men', 'Women', 'Unisex'];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200/80">
      {/* Gender Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mr-1.5">
          Audience:
        </span>
        {genders.map((g) => (
          <button
            key={g}
            onClick={() => onGenderChange(g)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              selectedGender === g
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            {g === 'All' ? 'Everyone' : g}
          </button>
        ))}
      </div>

      {/* Results Count & Sort Dropdown */}
      <div className="flex items-center justify-between sm:justify-end gap-4">
        <span className="text-xs text-neutral-600">
          Showing <span className="font-semibold text-neutral-900">{totalProductsCount}</span> pieces
        </span>

        <div className="relative flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-neutral-600 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="text-xs font-medium text-neutral-800 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-900 cursor-pointer shadow-2xs hover:border-neutral-300 transition"
          >
            {isVisualSearchActive && (
              <option value="match">Highest Visual Match</option>
            )}
            <option value="rating">Highest Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};
