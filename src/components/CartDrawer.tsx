import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types/product';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, size: string, delta: number) => void;
  onRemoveItem: (id: string, size: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 200;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h3 className="text-base font-semibold text-neutral-900">
                Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping Progress */}
          <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <p className="text-emerald-700 font-medium">
                🎉 You have qualified for complimentary express delivery!
              </p>
            ) : (
              <p className="text-neutral-600">
                Add <span className="font-semibold text-neutral-900">${freeShippingThreshold - subtotal}</span> more for complimentary shipping.
              </p>
            )}
            <div className="w-full h-1.5 bg-neutral-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="py-20 text-center text-neutral-600">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-neutral-400 stroke-1" />
                <p className="text-sm font-medium">Your shopping bag is empty</p>
                <p className="text-xs text-neutral-600 mt-1">
                  Discover pieces using our visual search engine
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="py-4 flex gap-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-neutral-900 line-clamp-1">
                          {item.product.name}
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          ${item.product.price * item.quantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {item.product.brand} • Size {item.selectedSize}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-neutral-200 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{subtotal >= freeShippingThreshold ? 'Free' : '$15'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>${subtotal + (subtotal >= freeShippingThreshold ? 0 : 15)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Checkout simulation complete. Thank you for testing Atelier Visual Search!')}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
