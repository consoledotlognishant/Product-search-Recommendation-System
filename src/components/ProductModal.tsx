import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Camera, Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Product, RecommendationMatch, VisualQuery } from '../types/product';

interface ProductModalProps {
  product: Product | null;
  matchInfo?: RecommendationMatch;
  activeQuery: VisualQuery | null;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onFindSimilar: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  matchInfo,
  activeQuery,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onFindSimilar,
}) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-900 rounded-full shadow-sm backdrop-blur-xs transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image & Visual Match Comparison */}
          <div className="bg-neutral-50 p-6 flex flex-col justify-between">
            <div className="relative aspect-4/5 rounded-xl overflow-hidden bg-white shadow-sm border border-neutral-200/60">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Visual Search Match Analysis Box (if active) */}
            {matchInfo && activeQuery && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Visual Match Breakdown</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    {matchInfo.matchPercentage}% Overall
                  </span>
                </div>

                {/* Progress bars */}
                <div className="space-y-2 text-[11px] text-neutral-600">
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span>Color Harmony</span>
                      <span className="font-medium text-neutral-900">{matchInfo.colorMatchScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full"
                        style={{ width: `${matchInfo.colorMatchScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span>Texture & Silhouette</span>
                      <span className="font-medium text-neutral-900">{matchInfo.textureMatchScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-700 rounded-full"
                        style={{ width: `${matchInfo.textureMatchScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Details, Sizes & Purchase */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Brand & Subcategory */}
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold tracking-wider uppercase text-neutral-600">
                  {product.brand}
                </span>
                <span className="text-neutral-600">
                  {product.gender}'s {product.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-neutral-900">{product.rating}</span>
                  <span className="text-neutral-600">({product.reviewsCount} customer reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-bold text-neutral-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-neutral-600 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Save ${product.originalPrice - product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Color Swatch */}
              <div className="mt-5">
                <span className="text-xs font-medium text-neutral-700">
                  Color: <span className="text-neutral-900 font-semibold">{product.colorName}</span>
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {product.colors.map((hex, i) => (
                    <span
                      key={i}
                      className="w-6 h-6 rounded-full border border-neutral-300 shadow-2xs"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              {product.category !== 'Accessories' && product.category !== 'Watches' && product.category !== 'Bags' && (
                <div className="mt-5">
                  <div className="flex justify-between items-center text-xs font-medium text-neutral-700 mb-2">
                    <span>Select Size</span>
                    <span className="text-neutral-600 hover:text-neutral-900 cursor-pointer underline">Size Guide</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition ${
                          selectedSize === s
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 hover:border-neutral-400 text-neutral-800'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features Bullet points */}
              <div className="mt-5 pt-4 border-t border-neutral-100">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                  Product Specifications
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-neutral-600">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-5 border-t border-neutral-200/80 space-y-2.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-xl border transition ${
                    isWishlisted
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                  }`}
                  title="Save item"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Find Similar Button */}
              <button
                type="button"
                onClick={() => {
                  onFindSimilar(product);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Search Visually Similar Products to This</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
