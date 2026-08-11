import { useEffect, useState, useCallback } from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import type { useCart } from '@/store';
import { fetchWishlist, toggleWishlist, fetchProducts } from '@/services/catalog';
import { ProductCard } from '@/components/ProductCard';

interface WishlistScreenProps { cart: ReturnType<typeof useCart>; onProduct: (product: Product) => void; onShop: () => void; }

export function WishlistScreen({ cart, onProduct, onShop }: WishlistScreenProps) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [ids, { products: allProducts }] = await Promise.all([fetchWishlist(), fetchProducts()]);
    setWishlistIds(ids);
    setProducts(allProducts.filter((p) => ids.includes(p.id)));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId, true);
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;

  return (
    <div className="px-4 pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Your wishlist</h1>
        <p className="text-xs text-ink-500 mt-1">{products.length} saved {products.length === 1 ? 'product' : 'products'}</p>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600"><Heart size={36} strokeWidth={1.5} /></div>
          <h2 className="text-lg font-extrabold text-ink-900 mt-5">No saved products yet</h2>
          <p className="text-sm text-ink-500 mt-1 max-w-[250px]">Tap the heart icon on products you want to save for later.</p>
          <button onClick={onShop} className="mt-5 h-11 px-5 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center gap-2">Browse products <ArrowRight size={16} /></button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} quantity={cart.getQuantity(product.id)} onAdd={() => cart.addToCart(product)} onIncrement={() => cart.addToCart(product)} onDecrement={() => cart.updateQuantity(product.id, cart.getQuantity(product.id) - 1)} onClick={() => onProduct(product)} />
              <button onClick={() => void handleRemove(product.id)} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 shadow-soft flex items-center justify-center text-red-500"><Heart size={15} className="fill-red-500" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
