import { useEffect, useState } from 'react';
import { ArrowRight, Truck, ShieldCheck, Tag, RotateCcw } from 'lucide-react';
import type { Category, Product, PromoBanner } from '@/types';
import type { useCart } from '@/store';
import { SearchBar } from '@/components/SearchBar';
import { PromoCarousel } from '@/components/PromoBanner';
import { CategoryCarousel } from '@/components/CategoryCard';
import { ProductCarousel } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { fetchCategories, fetchProducts, fetchPromotions } from '@/services/catalog';

interface HomeScreenProps { search: string; onSearchChange: (value: string) => void; onCategory: (category: Category) => void; onProduct: (product: Product) => void; onViewAll: () => void; cart: ReturnType<typeof useCart>; }

export function HomeScreen({ search, onSearchChange, onCategory, onProduct, onViewAll, cart }: HomeScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [catRes, prodRes, promoRes] = await Promise.all([fetchCategories(), fetchProducts(), fetchPromotions()]);
        setCategories(catRes.categories);
        setProducts(prodRes.products);
        setPromotions(promoRes);
      } catch (err) { console.error('Failed to load catalog', err); }
      setLoading(false);
    })();
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = query ? products.filter((p) => `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(query)) : products;
  const popular = filtered.slice(0, 8);
  const deals = filtered.slice(8, 16);
  const essentials = filtered.slice(16, 24);
  const actions = { getQuantity: cart.getQuantity, onAdd: cart.addToCart, onIncrement: (p: Product) => cart.addToCart(p), onDecrement: (p: Product) => cart.updateQuantity(p.id, cart.getQuantity(p.id) - 1), onProductClick: onProduct, onViewAll };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-6">
      <SearchBar value={search} onChange={onSearchChange} onFilter={() => undefined} />
      {!query && promotions.length > 0 && <PromoCarousel banners={promotions.slice(0, 3)} />}
      {query ? (
        <div className="px-4">
          <p className="text-xs text-ink-500 mb-3">{filtered.length} products found for <span className="font-bold text-ink-700">"{search}"</span></p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white border border-ink-100 rounded-2xl shadow-card overflow-hidden">
                <div className="relative bg-ink-50 h-[132px] overflow-hidden cursor-pointer" onClick={() => onProduct(p)}>
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wide truncate">{p.brand}</p>
                  <h3 className="text-[12px] font-bold text-ink-800 leading-tight mt-0.5 line-clamp-2">{p.name}</h3>
                  <p className="text-[10px] text-ink-400 mt-1">{p.packSize}</p>
                  <div className="flex items-end justify-between gap-1 mt-2">
                    <div><p className="text-[10px] text-ink-400 line-through">₹{p.mrp}</p><p className="text-[15px] font-extrabold text-brand-700">₹{p.price}</p></div>
                    {cart.getQuantity(p.id) > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => cart.updateQuantity(p.id, cart.getQuantity(p.id) - 1)} className="h-7 w-7 rounded-lg border border-brand-200 text-brand-700 font-bold">-</button>
                        <span className="text-xs font-bold">{cart.getQuantity(p.id)}</span>
                        <button onClick={() => cart.addToCart(p)} className="h-7 w-7 rounded-lg border border-brand-200 text-brand-700 font-bold">+</button>
                      </div>
                    ) : (
                      <button onClick={() => cart.addToCart(p)} className="h-8 px-2.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold">Add</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section>
            <SectionHeader title="Shop by Category" subtitle="Everything your business needs" onViewAll={onViewAll} accent="bg-brand-600" />
            <CategoryCarousel categories={categories.slice(0, 10)} onCategoryClick={onCategory} />
          </section>
          {popular.length > 0 && <ProductCarousel title="Popular Products" products={popular} {...actions} />}
          <section className="px-4">
            <div className="relative overflow-hidden rounded-2xl bg-accent-50 border border-accent-100 min-h-[116px] flex items-center">
              <div className="p-4 relative z-10 w-[65%]">
                <span className="text-[9px] font-bold text-accent-700 tracking-wider uppercase">LIMITED TIME</span>
                <h3 className="text-[17px] font-extrabold text-ink-900 mt-1 leading-tight">Fresh stocks.<br /><span className="text-accent-600">Fresh savings.</span></h3>
                <p className="text-[11px] text-ink-600 mt-1">Up to 20% off on everyday essentials</p>
              </div>
              <img src="https://images.pexels.com/photos/37321079/pexels-photo-37321079.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" alt="Fresh vegetables" className="absolute right-0 top-0 h-full w-[44%] object-cover" />
              <div className="absolute right-[35%] top-0 h-full w-20 bg-gradient-to-r from-accent-50 to-transparent" />
            </div>
          </section>
          {deals.length > 0 && <ProductCarousel title="Wholesale Deals" products={deals} {...actions} />}
          <section className="px-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-3.5 min-h-[118px]"><Truck className="text-brand-600" size={21} /><h3 className="font-bold text-sm text-brand-900 mt-3">Fast delivery</h3><p className="text-[10px] text-brand-700 mt-1">Same day in Bengaluru</p></div>
              <div className="rounded-2xl bg-ink-50 border border-ink-200 p-3.5 min-h-[118px]"><ShieldCheck className="text-ink-600" size={21} /><h3 className="font-bold text-sm text-ink-800 mt-3">Quality assured</h3><p className="text-[10px] text-ink-600 mt-1">Verified brands only</p></div>
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3.5 min-h-[118px]"><Tag className="text-orange-600" size={21} /><h3 className="font-bold text-sm text-orange-900 mt-3">Best prices</h3><p className="text-[10px] text-orange-700 mt-1">Wholesale rates daily</p></div>
              <div className="rounded-2xl bg-sky-50 border border-sky-100 p-3.5 min-h-[118px]"><RotateCcw className="text-sky-600" size={21} /><h3 className="font-bold text-sm text-sky-900 mt-3">Easy returns</h3><p className="text-[10px] text-sky-700 mt-1">Simple, hassle-free</p></div>
            </div>
          </section>
          {essentials.length > 0 && <ProductCarousel title="Everyday Essentials" products={essentials} {...actions} />}
          <section className="mx-4 rounded-2xl bg-brand-950 p-5 text-white flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[9px] text-brand-300 font-bold tracking-widest uppercase">BUILT FOR BUSINESS</p>
              <h3 className="text-lg font-extrabold mt-1">Stock up. Save big.</h3>
              <p className="text-[11px] text-brand-200 mt-1.5">Your reliable partner for every restock.</p>
              <button className="mt-3 flex items-center gap-1 text-xs font-bold bg-white text-brand-900 px-3 py-1.5 rounded-lg">Learn more <ArrowRight size={13} /></button>
            </div>
            <div className="absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-brand-700/40" />
            <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-brand-600/30" />
          </section>
        </>
      )}
    </div>
  );
}
