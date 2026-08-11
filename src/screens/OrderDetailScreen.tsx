import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { fetchOrderDetail } from '@/services/catalog';
import type { DbOrder, DbOrderItem, DbAddress } from '@/services/catalog';

interface OrderDetailScreenProps { orderId: string; onBack: () => void; }

export function OrderDetailScreen({ orderId, onBack }: OrderDetailScreenProps) {
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [items, setItems] = useState<DbOrderItem[]>([]);
  const [address, setAddress] = useState<DbAddress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await fetchOrderDetail(orderId);
      if (result) {
        setOrder(result.order);
        setItems(result.items);
        setAddress(result.address);
      }
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;
  if (!order) return <div className="flex flex-col items-center justify-center min-h-[50vh]"><p className="text-sm text-ink-500">Order not found</p><button onClick={onBack} className="mt-3 text-sm font-bold text-brand-600">Go back</button></div>;

  const statusSteps = [
    { key: 'pending', label: 'Order placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: Package },
    { key: 'packed', label: 'Packed', icon: Package },
    { key: 'ready_for_pickup', label: 'Ready for pickup', icon: Package },
    { key: 'out_for_delivery', label: 'Out for delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = order.status === 'cancelled' ? -1 : statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-lg font-extrabold text-ink-900 tracking-tight">{order.order_number}</h1>
          <p className="text-xs text-ink-500 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
      {order.status === 'cancelled' ? (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3">
          <XCircle size={22} className="text-red-500" />
          <div><p className="text-sm font-bold text-red-700">Order cancelled</p><p className="text-xs text-red-500 mt-0.5">This order was cancelled</p></div>
        </div>
      ) : (
        <section className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
          <h2 className="text-sm font-bold text-ink-900 mb-3">Order status</h2>
          <div className="space-y-3">
            {statusSteps.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${isDone ? 'text-ink-800' : 'text-ink-400'}`}>{step.label}</p>
                    {isCurrent && <p className="text-[10px] text-brand-600 mt-0.5">Current status</p>}
                  </div>
                  {index < statusSteps.length - 1 && <div className={`absolute left-[27px] w-0.5 h-3 ${isDone ? 'bg-brand-600' : 'bg-ink-200'}`} />}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
        <h2 className="text-sm font-bold text-ink-900 mb-3">Items ({items.length})</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-800">{item.brand} {item.product_name}</p>
                <p className="text-xs text-ink-400 mt-0.5">{item.pack_size} · Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-ink-800">₹{Number(item.line_total).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </section>
      {address && (
        <section className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card">
          <h2 className="text-sm font-bold text-ink-900 mb-2">Delivery address</h2>
          <div className="flex items-start gap-2.5">
            <MapPin size={17} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-ink-800">{address.label} · {address.recipient_name}</p>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.postal_code}</p>
              <p className="text-xs text-ink-400 mt-1">{address.phone}</p>
            </div>
          </div>
        </section>
      )}
      <section className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card space-y-2">
        <h2 className="text-sm font-bold text-ink-900 mb-1">Payment details</h2>
        <div className="flex justify-between text-xs text-ink-500"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-xs text-brand-600"><span>Discount</span><span>- ₹{Number(order.discount).toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-xs text-ink-500"><span>Delivery fee</span><span>₹{Number(order.delivery_fee).toLocaleString('en-IN')}</span></div>
        <div className="border-t border-dashed border-ink-200 pt-2 flex justify-between"><span className="text-sm font-bold text-ink-800">Total paid</span><span className="text-lg font-extrabold text-brand-700">₹{Number(order.total).toLocaleString('en-IN')}</span></div>
      </section>
    </div>
  );
}
