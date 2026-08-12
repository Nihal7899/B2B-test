import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, MapPin, Tag, Truck, Loader as Loader2, CircleCheck as CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import type { useCart } from '@/store';
import type { DbAddress } from '@/services/catalog';
import { fetchAddresses, placeOrder, clearCartItems } from '@/services/catalog';
import { supabase } from '@/lib/supabase';

interface CheckoutScreenProps { cart: ReturnType<typeof useCart>; onBack: () => void; onOrderPlaced: (orderId: string) => void; onAddAddress: () => void; }

export function CheckoutScreen({ cart, onBack, onOrderPlaced, onAddAddress }: CheckoutScreenProps) {
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

  const load = useCallback(async () => {
    const data = await fetchAddresses();
    setAddresses(data);
    if (data.length > 0) {
      const def = data.find((a) => a.is_default);
      setSelectedAddr(def?.id ?? data[0].id);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const deliveryFee = cart.subtotal >= 2000 ? 0 : 80;
  const total = cart.subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { setError('Please select a delivery address.'); return; }
    setPlacing(true);
    setError('');
    try {
      const items = cart.items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }));
      const orderId = await placeOrder(selectedAddr, items);
      if (!orderId) throw new Error('Order failed');
      if (paymentMethod === 'razorpay') {
        const { data: payData, error: payErr } = await supabase.functions.invoke('razorpay', {
          body: { action: 'create_order', order_id: orderId, amount: total },
        });
        if (payErr || !payData?.razorpay_order_id) {
          setError('Payment setup failed, but your order is placed. Pay on delivery.');
        } else if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).Razorpay) {
          const Razorpay = (window as unknown as Record<string, unknown>).Razorpay as new (opts: Record<string, unknown>) => { open: () => void };
          const rzp = new Razorpay({
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: Math.round(total * 100),
            order_id: payData.razorpay_order_id,
            name: 'Stackknit',
            description: 'Wholesale order',
            handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
              const verification = await supabase.functions.invoke('razorpay', { body: { action: 'verify_payment', order_id: orderId, payment_id: response.razorpay_payment_id, signature: response.razorpay_signature } });
              if (verification.error || !verification.data?.verified) {
                setError('Payment could not be verified. Please contact support before trying again.');
                return;
              }
              await clearCartItems(cart.cartId ?? '');
              cart.clearCart();
              onOrderPlaced(orderId);
            },
          });
          rzp.open();
        } else {
          await clearCartItems(cart.cartId ?? '');
          cart.clearCart();
          onOrderPlaced(orderId);
        }
      } else {
        await clearCartItems(cart.cartId ?? '');
        cart.clearCart();
        onOrderPlaced(orderId);
      }
    } catch (err) {
      setError('Could not place order. Please try again.');
    }
    setPlacing(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-ink-500 mt-0.5">Review and place your order</p>
        </div>
      </div>
      <section>
        <h2 className="text-sm font-bold text-ink-900 mb-2">Delivery address</h2>
        {addresses.length === 0 ? (
          <button onClick={onAddAddress} className="w-full h-14 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 text-brand-700 text-sm font-bold flex items-center justify-center gap-2"><MapPin size={16} /> Add a delivery address</button>
        ) : (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <button key={addr.id} onClick={() => setSelectedAddr(addr.id)} className={`w-full text-left p-3.5 rounded-2xl border-2 transition-colors ${selectedAddr === addr.id ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white'}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedAddr === addr.id ? 'border-brand-600 bg-brand-600' : 'border-ink-300'}`}>
                    {selectedAddr === addr.id && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-ink-800">{addr.label}</p>
                      {addr.is_default && <span className="text-[9px] font-bold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">DEFAULT</span>}
                    </div>
                    <p className="text-xs text-ink-600 mt-1 leading-relaxed">{addr.line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                    <p className="text-[11px] text-ink-400 mt-1">{addr.recipient_name} · {addr.phone}</p>
                  </div>
                </div>
              </button>
            ))}
            <button onClick={onAddAddress} className="w-full h-10 rounded-xl border border-ink-200 text-ink-600 text-xs font-bold flex items-center justify-center gap-1">+ Add another address</button>
          </div>
        )}
      </section>
      <section>
        <h2 className="text-sm font-bold text-ink-900 mb-2">Payment method</h2>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setPaymentMethod('cod')} className={`p-3.5 rounded-2xl border-2 text-left transition-colors ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white'}`}>
            <Banknote size={20} className={paymentMethod === 'cod' ? 'text-brand-600' : 'text-ink-400'} />
            <p className="text-sm font-bold text-ink-800 mt-2">Cash on delivery</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Pay when you receive</p>
          </button>
          <button onClick={() => setPaymentMethod('razorpay')} className={`p-3.5 rounded-2xl border-2 text-left transition-colors ${paymentMethod === 'razorpay' ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white'}`}>
            <CreditCard size={20} className={paymentMethod === 'razorpay' ? 'text-brand-600' : 'text-ink-400'} />
            <p className="text-sm font-bold text-ink-800 mt-2">Online payment</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Razorpay secure</p>
          </button>
        </div>
      </section>
      <section className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-sm font-bold text-ink-900">Order summary</h2>
        <div className="space-y-1.5">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-xs">
              <span className="text-ink-600 truncate flex-1">{item.product.brand} {item.product.name} × {item.quantity}</span>
              <span className="font-semibold text-ink-800 ml-2">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-ink-200 pt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-ink-500"><span>Subtotal</span><span>₹{cart.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-xs text-brand-600"><span className="flex items-center gap-1"><Tag size={13} /> Discount</span><span>- ₹{cart.discount.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-xs text-ink-500"><span className="flex items-center gap-1"><Truck size={13} /> Delivery</span><span className="font-semibold text-brand-600">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
          <div className="border-t border-dashed border-ink-200 pt-2 flex justify-between"><span className="text-sm font-bold text-ink-800">Total</span><span className="text-xl font-extrabold text-brand-700">₹{total.toLocaleString('en-IN')}</span></div>
        </div>
      </section>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button onClick={handlePlaceOrder} disabled={placing || !selectedAddr || cart.items.length === 0} className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-soft disabled:opacity-60">
        {placing ? <><Loader2 size={17} className="animate-spin" /> Placing order...</> : <>Place order · ₹{total.toLocaleString('en-IN')}</>}
      </button>
    </div>
  );
}
