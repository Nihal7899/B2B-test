import { Heart, Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/types';
import { OfferBadge } from './OfferBadge';
import { QuantitySelector } from './QuantitySelector';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onClick: () => void;
  horizontal?: boolean;
}

export function ProductCard({ product, quantity, onAdd, onIncrement, onDecrement, onClick, horizontal = false }: ProductCardProps) {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  return (
    <article onClick={onClick} className={`group relative bg-white border border-ink-100 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden ${horizontal ? 'w-[158px] shrink-0' : ''}`}>
      <div className="relative bg-ink-50 h-[132px] flex items-center justify-center overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        <div className="absolute top-2 left-2"><OfferBadge discountPercent={discount} /></div>
        <button onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-ink-500 shadow-sm tap-highlight active:scale-90 transition-transform" aria-label="Add to wishlist">
          <Heart size={14} strokeWidth={2} />
        </button>
      </div>
      <div className="p-2.5">
        <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wide truncate">{product.brand}</p>
        <h3 className="text-[12px] font-bold text-ink-800 leading-tight mt-0.5 line-clamp-2 min-h-[30px]">{product.name}</h3>
        <p className="text-[10px] text-ink-400 mt-1">{product.packSize} <span className="text-ink-300 mx-0.5">·</span> MOQ {product.moq}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-ink-500 font-medium">{product.rating}</span>
        </div>
        <div className="flex items-end justify-between gap-1 mt-2">
          <div className="min-w-0">
            <p className="text-[10px] text-ink-400 line-through">MRP ₹{product.mrp}</p>
            <p className="text-[15px] font-extrabold text-brand-700 leading-tight">₹{product.price}</p>
          </div>
          {quantity > 0 ? <QuantitySelector quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} /> : (
            <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="h-8 px-2.5 flex items-center gap-1 rounded-lg bg-brand-600 text-white text-[11px] font-bold shadow-sm tap-highlight active:scale-95 transition-transform">
              <ShoppingCart size={13} strokeWidth={2.5} /> Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  getQuantity: (id: string) => number;
  onAdd: (product: Product) => void;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
}

export function ProductCarousel({ title, products, getQuantity, onAdd, onIncrement, onDecrement, onProductClick, onViewAll }: ProductCarouselProps) {
  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold text-ink-900 tracking-tight">{title}</h2>
        <button onClick={onViewAll} className="text-xs font-semibold text-brand-600 tap-highlight">View All</button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-touch px-4 pb-1">
        {products.map((product) => <ProductCard key={product.id} product={product} quantity={getQuantity(product.id)} onAdd={() => onAdd(product)} onIncrement={() => onIncrement(product)} onDecrement={() => onDecrement(product)} onClick={() => onProductClick(product)} horizontal />)}
      </div>
    </section>
  );
}
