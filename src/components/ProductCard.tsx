import React from 'react';
import { Camera, Heart, Eye, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { Product, RecommendationMatch } from '../types/product';

interface ProductCardProps {
  product: Product;
  matchInfo?: RecommendationMatch;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onFindSimilar: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  matchInfo,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onFindSimilar,
  onAddToCart,
}) => {
  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-neutral-200/80 hover:border-neutral-400/80 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-neutral-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Visual Match Badge (when visual search active) */}
        {matchInfo && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/90 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full shadow-sm">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{matchInfo.matchPercentage}% Match</span>
          </div>
        )}

        {/* New / Best Seller Badge (when visual search not active) */}
        {!matchInfo && product.isBestSeller && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-bold tracking-wider uppercase rounded">
            Best Seller
          </div>
        )}
        {!matchInfo && !product.isBestSeller && product.isNew && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-bold tracking-wider uppercase rounded border border-neutral-300">
            New
          </div>
        )}

        {/* Quick Actions (Floating Right) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full shadow-sm backdrop-blur-xs transition ${
              isWishlisted
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/90 text-neutral-700 hover:text-neutral-900 hover:bg-white'
            }`}
            title={isWishlisted ? 'Remove from saved' : 'Save to wishlist'}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFindSimilar(product);
            }}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 shadow-sm backdrop-blur-xs transition"
            title="Find products visually similar to this"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Overlay CTA: Quick View */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold rounded-lg shadow-sm backdrop-blur-xs flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold uppercase tracking-wider text-neutral-600">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-neutral-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-neutral-600">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h4
            onClick={() => onQuickView(product)}
            className="text-sm font-medium text-neutral-900 line-clamp-1 cursor-pointer hover:underline underline-offset-2"
          >
            {product.name}
          </h4>

          {/* Dominant Color & SubCategory */}
          <p className="text-xs text-neutral-600 mt-0.5">
            {product.subCategory} • {product.colorName}
          </p>

          {/* Visual Similarity Explanation (if active) */}
          {matchInfo && matchInfo.matchReasons && matchInfo.matchReasons[0] && (
            <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-100">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              {matchInfo.matchReasons[0]}
            </p>
          )}
        </div>

        {/* Price & Add to Bag */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-600 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="p-1.5 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
              title="Add to shopping bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onFindSimilar(product)}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 hover:underline flex items-center gap-1 ml-1"
            >
              <span>Similar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
