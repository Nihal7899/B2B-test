import { useEffect, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { Category } from '@/types';
import { fetchCategories, fetchProducts } from '@/services/catalog';
import type { DbCategory, DbProduct } from '@/services/catalog';

interface CategoriesScreenProps { onCategory: (category: Category) => void; }

export function CategoriesScreen({ onCategory }: CategoriesScreenProps) {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const { categories: cats } = await fetchCategories();
        const { products } = await fetchProducts();
        const dbCats = cats;
        const productCounts: Record<string, number> = {};
        products.forEach((p) => { productCounts[p.category] = (productCounts[p.category] ?? 0) + 1; });
        setCategories(dbCats as unknown as DbCategory[]);
        setCounts(productCounts);
      } catch (err) { console.error('Failed to load categories', err); }
      setLoading(false);
    })();
  }, []);

  const categoryColors = ['bg-brand-50', 'bg-amber-50', 'bg-orange-50', 'bg-yellow-50', 'bg-rose-50', 'bg-red-50', 'bg-sky-50', 'bg-blue-50', 'bg-teal-50', 'bg-emerald-50', 'bg-indigo-50', 'bg-purple-50'];
  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;

  return (
    <div className="px-4 pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Browse categories</h1>
        <p className="text-xs text-ink-500 mt-1">Find everything your business needs</p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl h-10 px-3">
        <Search size={16} className="text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((category, index) => (
          <button key={category.id} onClick={() => onCategory({ id: category.slug, name: category.name, image: category.image_url, count: counts[category.slug] ?? 0, color: categoryColors[index % categoryColors.length] })} className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-card text-left tap-highlight active:scale-[.98] transition-transform">
            <div className={`h-28 ${categoryColors[index % categoryColors.length]} relative`}>
              <img src={category.image_url} alt={category.name} className="h-full w-full object-cover mix-blend-multiply opacity-85" />
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink-800">{category.name}</h3>
                <p className="text-[11px] text-ink-400 mt-0.5">{counts[category.slug] ?? 0} products</p>
              </div>
              <ChevronRight size={15} className="text-brand-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
