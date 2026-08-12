// screens/HomeScreen.tsx
import { useEffect, useState } from 'react';
import { ArrowRight, Truck, ShieldCheck, Tag, RotateCcw } from 'lucide-react';
import type { Category, Product, PromoBanner, Store, TrustedBrand } from '@/types';
import type { useCart } from '@/store';
import { SearchBar } from '@/components/SearchBar';
import { PromoCarousel } from '@/components/PromoBanner';
import { PromoAdBanner } from '@/components/PromoAdBanner';
import { CategoryCarousel } from '@/components/CategoryCard';
import { ProductCarousel } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { StoreCarousel } from '@/components/StoreCard';
import { BrandCarousel } from '@/components/BrandCard';
import {
  fetchCategories,
  fetchProducts,
  fetchHomeBanners,
  fetchStores,
  fetchTrustedBrands,
} from '@/services/catalog';

interface HomeScreenProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCategory: (category: Category) => void;
  onProduct: (product: Product) => void;
  onViewAll: () => void;
  onStoreClick: (store: Store) => void;
  cart: ReturnType<typeof useCart>;
  onBannerAction?: (banner: PromoBanner) => void;
}

export function HomeScreen({
  search,
  onSearchChange,
  onCategory,
  onProduct,
  onViewAll,
  onStoreClick,
  cart,
  onBannerAction,
}: HomeScreenProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [brands, setBrands] = useState<TrustedBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [topBanner, setTopBanner] = useState<PromoBanner | null>(null);
  const [carouselBanners, setCarouselBanners] = useState<PromoBanner[]>([]);
  const [middleBanner, setMiddleBanner] = useState<PromoBanner | null>(null);
  const [bottomBanner, setBottomBanner] = useState<PromoBanner | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [catRes, prodRes, banners, storesRes, brandsRes] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
          fetchHomeBanners(),
          fetchStores(),
          fetchTrustedBrands(),
        ]);
        setCategories(catRes.categories);
        setProducts(prodRes.products);
        setStores(storesRes);
        setBrands(brandsRes);

        const top = banners.find((b) => b.position === 'top') || null;
        const carousel = banners.filter((b) => b.position === 'carousel');
        const middle = banners.find((b) => b.position === 'middle') || null;
        const bottom = banners.find((b) => b.position === 'bottom') || null;
        setTopBanner(top);
        setCarouselBanners(carousel);
        setMiddleBanner(middle);
        setBottomBanner(bottom);
      } catch (err) {
        console.error('Failed to load catalog', err);
      }
      setLoading(false);
    })();
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? products.filter((p) =>
        `${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(query)
      )
    : products;
  const popular = filtered.slice(0, 8);
  const deals = filtered.slice(8, 16);
  const essentials = filtered.slice(16, 24);

  const actions = {
    getQuantity: cart.getQuantity,
    onAdd: cart.addToCart,
    onIncrement: (p: Product) => cart.addToCart(p),
    onDecrement: (p: Product) =>
      cart.updateQuantity(p.id, cart.getQuantity(p.id) - 1),
    onProductClick: onProduct,
    onViewAll,
  };

  const bgMap: Record<string, string> = {
    brand: 'bg-brand-50',
    accent: 'bg-accent-50',
    ink: 'bg-ink-50',
  };
  const borderMap: Record<string, string> = {
    brand: 'border-brand-100',
    accent: 'border-accent-100',
    ink: 'border-ink-100',
  };
  const accentTextMap: Record<string, string> = {
    brand: 'text-brand-700',
    accent: 'text-accent-700',
    ink: 'text-ink-700',
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 pb-6">
      <SearchBar value={search} onChange={onSearchChange} onFilter={() => undefined} />

      {/* 1. TOP RECTANGULAR PROMO CODE BANNER */}
      {!query && topBanner && <PromoAdBanner banner={topBanner} />}

      {/* 2. CAROUSEL OF ACTION BANNERS */}
      {!query && carouselBanners.length > 0 && (
        <PromoCarousel banners={carouselBanners} onAction={onBannerAction} />
      )}

      {query ? (
        <div className="px-4">
          <p className="text-xs text-ink-500 mb-3">
            {filtered.length} products found for{' '}
            <span className="font-bold text-ink-700">“{search}”</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-ink-100 rounded-2xl shadow-card overflow-hidden"
              >
                <div
                  className="relative bg-ink-50 h-[132px] overflow-hidden cursor-pointer"
                  onClick={() => onProduct(p)}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x400/EEE/999?text=Product';
                    }}
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wide truncate">
                    {p.brand}
                  </p>
                  <h3 className="text-[12px] font-bold text-ink-800 leading-tight mt-0.5 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-[10px] text-ink-400 mt-1">{p.packSize}</p>
                  <div className="flex items-end justify-between gap-1 mt-2">
                    <div>
                      <p className="text-[10px] text-ink-400 line-through">₹{p.mrp}</p>
                      <p className="text-[15px] font-extrabold text-brand-700">₹{p.price}</p>
                    </div>
                    {cart.getQuantity(p.id) > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            cart.updateQuantity(p.id, cart.getQuantity(p.id) - 1)
                          }
                          className="h-7 w-7 rounded-lg border border-brand-200 text-brand-700 font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold">{cart.getQuantity(p.id)}</span>
                        <button
                          onClick={() => cart.addToCart(p)}
                          className="h-7 w-7 rounded-lg border border-brand-200 text-brand-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => cart.addToCart(p)}
                        className="h-8 px-2.5 rounded-lg bg-brand-600 text-white text-[11px] font-bold"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Categories */}
          <section>
            <SectionHeader
              title="Shop by Category"
              subtitle="Everything your business needs"
              onViewAll={onViewAll}
              accent="bg-brand-600"
            />
            <CategoryCarousel categories={categories.slice(0, 10)} onCategoryClick={onCategory} />
          </section>

          {/* Stores */}
          {stores.length > 0 && (
            <div>
              <SectionHeader
                title="Shop by Stores"
                subtitle="Curated collections"
                accent="bg-purple-600"
              />
              <StoreCarousel stores={stores} onStoreClick={onStoreClick} />
            </div>
          )}

          {/* Trusted Brands */}
          {brands.length > 0 && (
            <div>
              <SectionHeader
                title="Trusted Brands"
                subtitle="Quality you can rely on"
                accent="bg-blue-600"
              />
              <BrandCarousel brands={brands} />
            </div>
          )}

          {/* Popular Products */}
          {popular.length > 0 && (
            <ProductCarousel title="Popular Products" products={popular} {...actions} />
          )}

          {/* 3. MIDDLE ACTION BANNER */}
          {middleBanner && (
            <section className="px-4">
              <div
                className={`relative overflow-hidden rounded-2xl min-h-[116px] flex items-center border ${borderMap[middleBanner.background_color] || 'border-accent-100'}`}
              >
                <div
                  className={`absolute inset-0 ${
                    bgMap[middleBanner.background_color] || 'bg-accent-50'
                  }`}
                />
                <div className="p-4 relative z-10 w-[65%]">
                  {middleBanner.badge && (
                    <span
                      className={`text-[9px] font-bold ${accentTextMap[middleBanner.background_color] || 'text-accent-700'} tracking-wider uppercase`}
                    >
                      {middleBanner.badge}
                    </span>
                  )}
                  <h3 className="text-[17px] font-extrabold text-ink-900 mt-1 leading-tight">
                    {middleBanner.headline}
                  </h3>
                  <p className="text-[11px] text-ink-600 mt-1">{middleBanner.subtext}</p>
                  <button
                    onClick={() => onBannerAction?.(middleBanner)}
                    className="mt-2.5 bg-white text-ink-900 text-xs font-bold rounded-lg px-3.5 py-1.5 shadow-sm cursor-pointer"
                  >
                    {middleBanner.cta}
                  </button>
                </div>
                <img
                  src={middleBanner.image}
                  alt={middleBanner.headline}
                  className="absolute right-0 top-0 h-full w-[44%] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/EEE/999?text=Banner';
                  }}
                />
                <div
                  className={`absolute right-[35%] top-0 h-full w-20 bg-gradient-to-r from-${
                    middleBanner.background_color || 'accent'
                  }-50 to-transparent`}
                />
              </div>
            </section>
          )}

          {/* Wholesale Deals */}
          {deals.length > 0 && (
            <ProductCarousel title="Wholesale Deals" products={deals} {...actions} />
          )}

          {/* Perks */}
          <section className="px-4">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-3.5 min-h-[118px]">
                <Truck className="text-brand-600" size={21} />
                <h3 className="font-bold text-sm text-brand-900 mt-3">Fast delivery</h3>
                <p className="text-[10px] text-brand-700 mt-1">Same day in Bengaluru</p>
              </div>
              <div className="rounded-2xl bg-ink-50 border border-ink-200 p-3.5 min-h-[118px]">
                <ShieldCheck className="text-ink-600" size={21} />
                <h3 className="font-bold text-sm text-ink-800 mt-3">Quality assured</h3>
                <p className="text-[10px] text-ink-600 mt-1">Verified brands only</p>
              </div>
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3.5 min-h-[118px]">
                <Tag className="text-orange-600" size={21} />
                <h3 className="font-bold text-sm text-orange-900 mt-3">Best prices</h3>
                <p className="text-[10px] text-orange-700 mt-1">Wholesale rates daily</p>
              </div>
              <div className="rounded-2xl bg-sky-50 border border-sky-100 p-3.5 min-h-[118px]">
                <RotateCcw className="text-sky-600" size={21} />
                <h3 className="font-bold text-sm text-sky-900 mt-3">Easy returns</h3>
                <p className="text-[10px] text-sky-700 mt-1">Simple, hassle-free</p>
              </div>
            </div>
          </section>

          {/* Everyday Essentials */}
          {essentials.length > 0 && (
            <ProductCarousel title="Everyday Essentials" products={essentials} {...actions} />
          )}

          {/* 4. BOTTOM ACTION BANNER */}
          {bottomBanner && (
            <section className="mx-4 rounded-2xl p-5 text-white flex items-center justify-between overflow-hidden relative">
              <div className="absolute inset-0">
                <div
                  className={`absolute inset-0 ${
                    bgMap[bottomBanner.background_color] || 'bg-brand-950'
                  }`}
                />
                {bottomBanner.image && (
                  <img
                    src={bottomBanner.image}
                    alt={bottomBanner.headline}
                    className="absolute right-0 top-0 h-full w-[44%] object-cover opacity-30"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/600x400/EEE/999?text=Banner';
                    }}
                  />
                )}
                <div className="absolute -right-8 -bottom-10 h-36 w-36 rounded-full bg-white/10" />
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-white/5" />
              </div>
              <div className="relative z-10 flex-1">
                <p className="text-[9px] text-white/60 font-bold tracking-widest uppercase">
                  {bottomBanner.badge || 'BUILT FOR BUSINESS'}
                </p>
                <h3 className="text-lg font-extrabold mt-1 text-white">{bottomBanner.headline}</h3>
                <p className="text-[11px] text-white/70 mt-1.5">{bottomBanner.subtext}</p>
                <button
                  onClick={() => onBannerAction?.(bottomBanner)}
                  className="mt-3 flex items-center gap-1 text-xs font-bold bg-white text-brand-900 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  {bottomBanner.cta || 'Learn more'} <ArrowRight size={13} />
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}