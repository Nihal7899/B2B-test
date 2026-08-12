import { useEffect, useState } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import type { Product, FilterConfig } from '@/types';
import type { useCart } from '@/store';
import { fetchFilteredProducts } from '@/services/catalog';
import { ProductCard } from '@/components/ProductCard';

interface FilteredProductsScreenProps {
  filter: FilterConfig;
  title: string;
  cart: ReturnType<typeof useCart>;
  onBack: () => void;
  onProduct: (product: Product) => void;
}

export function FilteredProductsScreen({ filter, title, cart, onBack, onProduct }: FilteredProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchFilteredProducts(filter);
        setProducts(data);
      } catch (err) { console.error('Failed to load filtered products', err); }
      setLoading(false);
    })();
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">{title}</h1>
          <p className="text-xs text-ink-500 mt-0.5">{products.length} products found</p>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600"><Package size={36} strokeWidth={1.5} /></div>
          <h2 className="text-lg font-extrabold text-ink-900 mt-5">No products match</h2>
          <p className="text-sm text-ink-500 mt-1 max-w-[250px]">No products match these filter criteria. Try adjusting the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              quantity={cart.getQuantity(p.id)}
              onAdd={() => cart.addToCart(p)}
              onIncrement={() => cart.addToCart(p)}
              onDecrement={() => cart.updateQuantity(p.id, cart.getQuantity(p.id) - 1)}
              onClick={() => onProduct(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
