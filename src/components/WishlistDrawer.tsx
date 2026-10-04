import React from 'react';
import { X, Heart, ShoppingBag, Camera, Trash2 } from 'lucide-react';
import { Product } from '../types/product';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onFindSimilar: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveWishlist,
  onAddToCart,
  onFindSimilar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="text-base font-semibold text-neutral-900">
                Saved Items ({items.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="py-20 text-center text-neutral-600">
                <Heart className="w-12 h-12 mx-auto mb-3 text-neutral-400 stroke-1" />
                <p className="text-sm font-medium">Your wishlist is empty</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Save pieces while exploring or performing visual searches
                </p>
              </div>
            ) : (
              items.map((prod) => (
                <div key={prod.id} className="py-4 flex gap-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {prod.name}
                        </span>
                        <button
                          onClick={() => onRemoveWishlist(prod)}
                          className="text-neutral-400 hover:text-rose-600 p-0.5"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {prod.brand} • ${prod.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          onAddToCart(prod);
                          onRemoveWishlist(prod);
                        }}
                        className="flex-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                      <button
                        onClick={() => {
                          onFindSimilar(prod);
                          onClose();
                        }}
                        className="p-1.5 border border-neutral-200 hover:border-neutral-900 rounded-lg text-neutral-700 transition"
                        title="Find visually similar"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
