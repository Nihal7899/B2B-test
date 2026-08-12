// screens/FilteredProductsScreen.tsx
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { FilterConfig, Product } from '@/types';
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

export function FilteredProductsScreen({
  filter,
  title,
  cart,
  onBack,
  onProduct,
}: FilteredProductsScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchFilteredProducts(filter);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch filtered products', err);
      }
      setLoading(false);
    })();
  }, [filter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">{title}</h1>
          <p className="text-xs text-ink-500 mt-0.5">{products.length} products found</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-500">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart.getQuantity(product.id)}
              onAdd={() => cart.addToCart(product)}
              onIncrement={() => cart.addToCart(product)}
              onDecrement={() =>
                cart.updateQuantity(product.id, cart.getQuantity(product.id) - 1)
              }
              onClick={onProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}