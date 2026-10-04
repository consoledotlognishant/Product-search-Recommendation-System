import React, { useState } from 'react';
import { Camera, Search, Heart, ShoppingBag, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { ProductCategory } from '../types/product';

interface NavbarProps {
  onOpenVisualSearch: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  isVisualSearchActive: boolean;
  onClearVisualSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVisualSearch,
  onOpenCart,
  onOpenWishlist,
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  isVisualSearchActive,
  onClearVisualSearch,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const categories: ProductCategory[] = [
    'All',
    'Topwear',
    'Outerwear',
    'Footwear',
    'Bottomwear',
    'Watches',
    'Bags',
    'Accessories',
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Micro Announcement Bar */}
      <div className="bg-neutral-900 text-neutral-300 text-[11px] font-medium tracking-wider uppercase py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Visual Search & Recommendation Engine</span>
        <span className="hidden sm:inline text-neutral-500">•</span>
        <span className="hidden sm:inline text-neutral-400">Client-Side Canvas Feature Embeddings</span>
        <span className="hidden md:inline text-neutral-500">•</span>
        <span className="hidden md:inline text-neutral-400">Zero Backend Required</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('All');
                onSearchChange('');
                onClearVisualSearch();
              }}
              className="group flex flex-col cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-semibold tracking-tighter text-neutral-900 group-hover:text-neutral-700 transition">
                  ATELIER
                </span>
                <span className="text-[10px] tracking-widest font-mono uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200">
                  VISUAL SEARCH
                </span>
              </div>
              <span className="text-[9px] tracking-widest uppercase text-neutral-600 font-medium">
                Product Recommendation System
              </span>
            </a>
          </div>

          {/* Desktop Search & Visual Search Trigger */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
            <div className="relative w-full flex items-center">
              <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search products by brand, color, style..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-28 py-2.5 bg-neutral-50/80 hover:bg-neutral-100/80 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-full border border-neutral-200 focus:border-neutral-900 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={onOpenVisualSearch}
                className="absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-medium transition shadow-sm"
                title="Search using an image"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Search Image</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Visual Search Button (Visible on mobile/tablet) */}
            <button
              type="button"
              onClick={onOpenVisualSearch}
              className="flex md:hidden items-center justify-center p-2.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition shadow-sm"
              aria-label="Upload image to search"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Mobile Search Input Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="flex md:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="relative p-2.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition"
              title="Saved items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {mobileSearchOpen && (
          <div className="pb-3 md:hidden">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-neutral-100 text-sm text-neutral-900 rounded-full border border-neutral-200 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Horizontal Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 py-2.5 overflow-x-auto scrollbar-none border-t border-neutral-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {cat === 'All' ? 'All Collections' : cat}
            </button>
          ))}
          {isVisualSearchActive && (
            <button
              onClick={onClearVisualSearch}
              className="ml-auto flex items-center gap-1 px-3 py-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full font-medium transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Image Search</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
