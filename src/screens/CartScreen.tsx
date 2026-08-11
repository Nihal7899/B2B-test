import { ArrowLeft, ArrowRight, CheckCircle2, ShoppingBag, Tag, Truck } from 'lucide-react';
import type { Product } from '@/types';
import type { useCart } from '@/store';
import { CartItem } from '@/components/CartItem';

interface CartScreenProps { cart: ReturnType<typeof useCart>; onProduct: (product: Product) => void; onShop: () => void; onCheckout: () => void; }

export function CartScreen({ cart, onProduct, onShop, onCheckout }: CartScreenProps) {
  if (cart.items.length === 0)
    return (
      <div className="px-4 pb-6 min-h-[65vh] flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600"><ShoppingBag size={36} strokeWidth={1.5} /></div>
        <h1 className="text-lg font-extrabold text-ink-900 mt-5">Your cart is empty</h1>
        <p className="text-sm text-ink-500 mt-1 max-w-[250px]">Add products you need for your next business restock.</p>
        <button onClick={onShop} className="mt-5 h-11 px-5 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center gap-2 shadow-soft">Start shopping <ArrowRight size={16} /></button>
      </div>
    );

  return (
    <div className="px-4 pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Your cart <span className="text-sm font-semibold text-ink-400">({cart.totalItems} items)</span></h1>
        <p className="text-xs text-ink-500 mt-1">Review your wholesale order</p>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-100 p-3">
        <Truck size={17} className="text-brand-600 shrink-0" />
        <p className="text-xs text-brand-800"><span className="font-bold">Free delivery</span> on orders above ₹2,000</p>
      </div>
      <div className="space-y-2.5">
        {cart.items.map((item) => <CartItem key={item.product.id} item={item} onIncrement={() => cart.addToCart(item.product)} onDecrement={() => cart.updateQuantity(item.product.id, item.quantity - 1)} onRemove={() => cart.removeFromCart(item.product.id)} onClick={() => onProduct(item.product)} />)}
      </div>
      <section className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-sm font-bold text-ink-900">Order summary</h2>
        <div className="flex justify-between text-xs text-ink-500"><span>MRP total</span><span>₹{cart.totalMrp.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-xs text-brand-600"><span className="flex items-center gap-1"><Tag size={13} /> Wholesale discount</span><span>- ₹{cart.discount.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-xs text-ink-500"><span>Delivery charges</span><span className="font-semibold text-brand-600">{cart.subtotal >= 2000 ? 'FREE' : '₹80'}</span></div>
        <div className="border-t border-dashed border-ink-200 pt-3 flex justify-between"><span className="text-sm font-bold text-ink-800">Total payable</span><span className="text-xl font-extrabold text-brand-700">₹{(cart.subtotal >= 2000 ? cart.subtotal : cart.subtotal + 80).toLocaleString('en-IN')}</span></div>
        <button onClick={onCheckout} className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-soft tap-highlight active:scale-[.98] transition-transform">Proceed to Checkout <ArrowRight size={17} /></button>
        <p className="text-center text-[10px] text-ink-400 flex items-center justify-center gap-1"><CheckCircle2 size={12} className="text-brand-500" /> Secure checkout · No hidden charges</p>
      </section>
      <button onClick={onShop} className="w-full flex items-center justify-center gap-2 text-xs font-bold text-brand-600"><ArrowLeft size={14} /> Continue shopping</button>
    </div>
  );
}
