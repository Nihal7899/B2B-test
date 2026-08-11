import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Share2, Star, Truck, ShieldCheck } from 'lucide-react';
import type { Product } from '@/types';
import type { useCart } from '@/store';
import { OfferBadge } from '@/components/OfferBadge';
import { QuantitySelector } from '@/components/QuantitySelector';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeader } from '@/components/SectionHeader';
import { fetchProductById, fetchWishlist, toggleWishlist } from '@/services/catalog';

interface ProductDetailScreenProps {
  productId: string;
  cart: ReturnType<typeof useCart>;
  onBack: () => void;
  onProduct: (product: Product) => void;
}

export function ProductDetailScreen({ productId, cart, onBack, onProduct }: ProductDetailScreenProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const result = await fetchProductById(productId);
      if (result) {
        setProduct(result.product);
        setRelated(result.related);
        const wl = await fetchWishlist();
        setWishlisted(wl.includes(productId));
      }
      setLoading(false);
    })();
  }, [productId]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;
  if (!product) return <div className="flex flex-col items-center justify-center min-h-[50vh] text-center"><p className="text-sm text-ink-500">Product not found</p><button onClick={onBack} className="mt-3 text-sm font-bold text-brand-600">Go back</button></div>;

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const quantity = cart.getQuantity(product.id);

  const handleWishlist = async () => {
    setWishlistBusy(true);
    await toggleWishlist(product.id, wishlisted);
    setWishlisted(!wishlisted);
    setWishlistBusy(false);
  };

  return (
    <div className="pb-6 space-y-5">
      <div className="relative h-[270px] bg-ink-50 overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <button onClick={onBack} className="absolute top-4 left-4 h-9 w-9 rounded-xl bg-white/90 text-ink-700 flex items-center justify-center shadow-soft"><ArrowLeft size={18} /></button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="h-9 w-9 rounded-xl bg-white/90 text-ink-600 flex items-center justify-center shadow-soft"><Share2 size={16} /></button>
          <button onClick={handleWishlist} disabled={wishlistBusy} className={`h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center shadow-soft transition-colors ${wishlisted ? 'text-red-500' : 'text-ink-600'}`}><Heart size={17} className={wishlisted ? 'fill-red-500' : ''} /></button>
        </div>
      </div>
      <div className="px-4 space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">{product.brand}</p>
            <OfferBadge discountPercent={discount} size="md" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight mt-1">{product.name}</h1>
          <p className="text-sm text-ink-500 mt-1">{product.packSize} <span className="mx-1 text-ink-300">·</span> Minimum order: {product.moq} units</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="flex items-center gap-1 text-xs font-bold text-ink-700"><Star size={14} className="fill-amber-400 text-amber-400" /> {product.rating}</span>
            <span className="text-xs text-ink-300">|</span>
            <span className={`text-xs font-semibold ${product.inStock ? 'text-brand-600' : 'text-red-500'}`}>{product.inStock ? 'In stock' : 'Out of stock'}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-extrabold text-brand-700">₹{product.price}</span>
            <span className="text-sm text-ink-400 line-through mb-1">MRP ₹{product.mrp}</span>
            <OfferBadge discountPercent={discount} />
          </div>
          <p className="text-[11px] text-brand-700 mt-1">Your wholesale price · Inclusive of all taxes</p>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={17} className="text-brand-600" />
          <div>
            <p className="text-xs font-bold text-ink-700">Delivery by tomorrow</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Free delivery on orders above ₹2,000</p>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-900">About this product</h2>
          <p className="text-xs text-ink-600 leading-relaxed mt-2">{product.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-ink-50 p-3 flex items-center gap-2"><ShieldCheck size={17} className="text-brand-600" /><div><p className="text-[10px] font-bold text-ink-700">Quality checked</p><p className="text-[9px] text-ink-400">Verified product</p></div></div>
          <div className="rounded-xl bg-ink-50 p-3 flex items-center gap-2"><Truck size={17} className="text-brand-600" /><div><p className="text-[10px] font-bold text-ink-700">Fast delivery</p><p className="text-[9px] text-ink-400">Reliable supply</p></div></div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            {quantity > 0
              ? <div className="h-12 flex items-center justify-center rounded-xl border border-brand-200 bg-brand-50"><QuantitySelector quantity={quantity} onIncrement={() => cart.addToCart(product)} onDecrement={() => cart.updateQuantity(product.id, quantity - 1)} size="md" /></div>
              : <button onClick={() => cart.addToCart(product)} className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold">Add to cart</button>}
          </div>
          <button onClick={handleWishlist} disabled={wishlistBusy} className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${wishlisted ? 'border-red-200 text-red-500' : 'border-ink-200 text-ink-600'}`}><Heart size={19} className={wishlisted ? 'fill-red-500' : ''} /></button>
        </div>
      </div>
      {related.length > 0 && (
        <div>
          <SectionHeader title="You may also like" onViewAll={() => undefined} />
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1">
            {related.map((item) => <ProductCard key={item.id} product={item} quantity={cart.getQuantity(item.id)} onAdd={() => cart.addToCart(item)} onIncrement={() => cart.addToCart(item)} onDecrement={() => cart.updateQuantity(item.id, cart.getQuantity(item.id) - 1)} onClick={() => onProduct(item)} horizontal />)}
          </div>
        </div>
      )}
    </div>
  );
}
