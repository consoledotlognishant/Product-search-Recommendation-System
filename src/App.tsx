import React, { useState, useMemo } from 'react';
import { Camera, Sparkles, ArrowRight, RefreshCw, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { PRODUCTS_CATALOG } from './data/products';
import { SAMPLE_QUERIES } from './data/samples';
import { CartItem, Gender, Product, ProductCategory, RecommendationMatch, VisualQuery } from './types/product';
import { extractImageFeatures, recommendProducts } from './utils/visualSearch';

import { Navbar } from './components/Navbar';
import { VisualSearchModal } from './components/VisualSearchModal';
import { VisualSearchBanner } from './components/VisualSearchBanner';
import { FilterBar, SortOption } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation & Filtering State
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('All');
  const [selectedGender, setSelectedGender] = useState<Gender>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Visual Search State
  const [isVisualSearchModalOpen, setIsVisualSearchModalOpen] = useState(false);
  const [activeVisualQuery, setActiveVisualQuery] = useState<VisualQuery | null>(null);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Quick View Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Handle Visual Search Result
  const handleVisualSearchSuccess = (query: VisualQuery) => {
    setActiveVisualQuery(query);
    setSortBy('match');
    showToast('Visual features extracted. Displaying ranked recommendations.');
  };

  const handleClearVisualSearch = () => {
    setActiveVisualQuery(null);
    setSortBy('rating');
  };

  // Find Similar trigger from any product card
  const handleFindSimilarToProduct = async (product: Product) => {
    try {
      showToast(`Analyzing visual style of ${product.name}...`);
      const query = await extractImageFeatures(product.image);
      setActiveVisualQuery(query);
      setSortBy('match');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      // Fallback: use product's own vector
      setActiveVisualQuery({
        imageUrl: product.image,
        vector: product.vector,
        dominantPalette: [product.dominantColor],
        averageBrightness: 0.5,
        edgeDensity: 0.5,
        aspectRatio: 1.0,
      });
      setSortBy('match');
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, size: string = 'M') => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, selectedSize: size, quantity: 1 }];
    });
    showToast(`Added ${product.name} to shopping bag.`);
  };

  const handleUpdateCartQuantity = (id: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id && item.selectedSize === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === id && item.selectedSize === size))
    );
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed from saved items.`);
        return prev.filter((p) => p.id !== product.id);
      } else {
        showToast(`Saved ${product.name} to wishlist.`);
        return [...prev, product];
      }
    });
  };

  // Filtered & Ranked Products Computation
  const { displayedMatches, displayedProducts } = useMemo(() => {
    if (activeVisualQuery) {
      // Recommendations active
      const matches = recommendProducts(activeVisualQuery, PRODUCTS_CATALOG, {
        topK: 60,
        category: activeCategory,
        gender: selectedGender,
        searchQuery,
      });

      // Apply secondary sort if selected
      const sortedMatches = [...matches];
      if (sortBy === 'price-asc') {
        sortedMatches.sort((a, b) => a.product.price - b.product.price);
      } else if (sortBy === 'price-desc') {
        sortedMatches.sort((a, b) => b.product.price - a.product.price);
      } else if (sortBy === 'rating') {
        sortedMatches.sort((a, b) => b.product.rating - a.product.rating);
      }

      return {
        displayedMatches: sortedMatches,
        displayedProducts: sortedMatches.map((m) => m.product),
      };
    } else {
      // Standard Catalog browsing
      let prods = PRODUCTS_CATALOG.filter((p) => {
        if (activeCategory !== 'All' && p.category !== activeCategory) return false;
        if (selectedGender !== 'All' && p.gender !== selectedGender && p.gender !== 'Unisex')
          return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.colorName.toLowerCase().includes(q) ||
            p.subCategory.toLowerCase().includes(q) ||
            p.features.some((f) => f.toLowerCase().includes(q))
          );
        }
        return true;
      });

      if (sortBy === 'price-asc') {
        prods.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        prods.sort((a, b) => b.price - a.price);
      } else {
        prods.sort((a, b) => b.rating - a.rating);
      }

      return {
        displayedMatches: [],
        displayedProducts: prods,
      };
    }
  }, [activeVisualQuery, activeCategory, selectedGender, searchQuery, sortBy]);

  // Match lookup map for fast card rendering
  const matchMap = useMemo(() => {
    const map = new Map<string, RecommendationMatch>();
    for (const m of displayedMatches) {
      map.set(m.product.id, m);
    }
    return map;
  }, [displayedMatches]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white text-xs font-medium rounded-xl shadow-xl border border-neutral-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenVisualSearch={() => setIsVisualSearchModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        isVisualSearchActive={!!activeVisualQuery}
        onClearVisualSearch={handleClearVisualSearch}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section (only when no visual search active) */}
        {!activeVisualQuery && (
          <section className="relative overflow-hidden rounded-3xl bg-white border border-neutral-200/80 p-8 sm:p-12 mb-10 shadow-2xs">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-neutral-200">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span>Next-Gen Visual Discovery</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                Search products using the power of image embeddings.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
                Upload any outfit photo, garment screenshot, or sample image. Our client-side visual embedding engine analyzes color palettes, texture gradients, and silhouette contours to recommend matching pieces.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsVisualSearchModalOpen(true)}
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Image to Search</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs text-neutral-600 pl-2">
                  <span>Or try a sample:</span>
                  <div className="flex items-center gap-1">
                    {SAMPLE_QUERIES.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={async () => {
                          const query = await extractImageFeatures(s.imageUrl);
                          handleVisualSearchSuccess(query);
                        }}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md font-medium text-[11px] transition"
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Visual Search Active Banner */}
        {activeVisualQuery && (
          <VisualSearchBanner
            query={activeVisualQuery}
            resultsCount={displayedProducts.length}
            onClear={handleClearVisualSearch}
            onChangeImage={() => setIsVisualSearchModalOpen(true)}
          />
        )}

        {/* Filter & Sort Controls */}
        <FilterBar
          selectedGender={selectedGender}
          onGenderChange={setSelectedGender}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isVisualSearchActive={!!activeVisualQuery}
          totalProductsCount={displayedProducts.length}
        />

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-neutral-200">
            <Camera className="w-12 h-12 mx-auto mb-3 text-neutral-400 stroke-1" />
            <h3 className="text-base font-semibold text-neutral-900">
              No matching pieces found
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
              Try adjusting your category filter, audience selection, or upload another image to search.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSelectedGender('All');
                setSearchQuery('');
                setActiveVisualQuery(null);
              }}
              className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                matchInfo={matchMap.get(product.id)}
                isWishlisted={wishlist.some((p) => p.id === product.id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={setSelectedProduct}
                onFindSimilar={handleFindSimilarToProduct}
                onAddToCart={(p) => handleAddToCart(p, 'M')}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <VisualSearchModal
        isOpen={isVisualSearchModalOpen}
        onClose={() => setIsVisualSearchModalOpen(false)}
        onVisualSearchSuccess={handleVisualSearchSuccess}
      />

      <ProductModal
        product={selectedProduct}
        matchInfo={selectedProduct ? matchMap.get(selectedProduct.id) : undefined}
        activeQuery={activeVisualQuery}
        isWishlisted={selectedProduct ? wishlist.some((p) => p.id === selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onFindSimilar={handleFindSimilarToProduct}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p, 'M')}
        onFindSimilar={handleFindSimilarToProduct}
      />
    </div>
  );
}
