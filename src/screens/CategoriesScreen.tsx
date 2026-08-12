// screens/CategoriesScreen.tsx
import { useEffect, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { Category } from '@/types';
import { fetchCategories, fetchProducts } from '@/services/catalog';

interface CategoriesScreenProps { onCategory: (category: Category) => void; }

export function CategoriesScreen({ onCategory }: CategoriesScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const { categories: cats } = await fetchCategories();
        const { products } = await fetchProducts();
        
        // Build count map: keyed by category slug (which is category.id in our mapped objects)
        const productCounts: Record<string, number> = {};
        products.forEach((p) => {
          const slug = p.category; // product.category is the slug string
          productCounts[slug] = (productCounts[slug] ?? 0) + 1;
        });
        
        setCategories(cats);
        setCounts(productCounts);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Browse categories</h1>
        <p className="text-xs text-ink-500 mt-1">Find everything your business needs</p>
      </div>

      <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl h-10 px-3">
        <Search size={16} className="text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategory(category)}
            className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-card text-left tap-highlight active:scale-[.98] transition-transform"
          >
            <div className={`h-28 ${category.color} relative`}>
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover mix-blend-multiply opacity-85"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/EEE/999?text=Category';
                }}
              />
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink-800">{category.name}</h3>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  {counts[category.id] ?? 0} products
                </p>
              </div>
              <ChevronRight size={15} className="text-brand-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}