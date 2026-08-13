import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle2, Loader2, Search, ClipboardList, Boxes } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DbProduct, DbOrder, DbOrderItem } from '@/services/catalog';

interface WarehouseScreenProps { onBack: () => void; }

type Tab = 'orders' | 'stock';

export function WarehouseScreen({ onBack }: WarehouseScreenProps) {
  const [tab, setTab] = useState<Tab>('orders');
  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Warehouse Panel</h1>
          <p className="text-xs text-ink-500 mt-0.5">Manage stock and fulfill orders</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('orders')} className={`flex-1 h-10 rounded-xl text-sm font-bold ${tab === 'orders' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-600'}`}>Orders</button>
        <button onClick={() => setTab('stock')} className={`flex-1 h-10 rounded-xl text-sm font-bold ${tab === 'stock' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-600'}`}>Stock</button>
      </div>
      {tab === 'orders' ? <OrdersTab /> : <StockTab />}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<(DbOrder & { customer_name: string; payments?: { status: string; provider: string } })[]>([]);
  const [items, setItems] = useState<Record<string, DbOrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState<{ user_id: string; name: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'packed' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled'>('all');

  const load = useCallback(async () => {
    // Fetch only actionable orders: pending with valid payment, or non-pending
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        *,
        payments!left(status, provider)
      `)
      .or(`status.neq.pending, and(status.eq.pending, payments.status.eq.paid), and(status.eq.pending, payments.provider.eq.cod)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Get delivery partners
    const { data: partnerRoles } = await supabase
      .from('user_roles')
      .select('user_id, profiles!inner(full_name)')
      .eq('role', 'delivery_partner');
    if (partnerRoles) {
      setPartners(partnerRoles.map((r: Record<string, unknown>) => {
        const p = r.profiles as { full_name: string };
        return { user_id: r.user_id as string, name: p.full_name || 'Partner' };
      }));
    }

    if (orderData) {
      const orderIds = (orderData as any[]).map((o) => o.id);
      const { data: itemData } = await supabase.from('order_items').select('*').in('order_id', orderIds);
      const itemsMap: Record<string, DbOrderItem[]> = {};
      (itemData as DbOrderItem[] | null)?.forEach((item) => {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push(item);
      });
      setItems(itemsMap);

      const ordersWithNames = await Promise.all((orderData as any[]).map(async (o) => {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', o.user_id).maybeSingle();
        return { ...o, customer_name: (profile as { full_name: string } | null)?.full_name ?? 'Customer' };
      }));
      setOrders(ordersWithNames);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) void load();
    }, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const confirmOrder = async (orderId: string) => {
    const { error } = await supabase.rpc('confirm_order', { p_order_id: orderId });
    if (error) {
      alert('Could not confirm order: ' + error.message);
    } else {
      void load();
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    void load();
  };

  const assignPartner = async (orderId: string, partnerId: string) => {
    if (!partnerId) return;
    await supabase.from('delivery_assignments').upsert({ order_id: orderId, delivery_partner_id: partnerId, status: 'ready_for_pickup' }, { onConflict: 'order_id' });
    await supabase.from('orders').update({ status: 'ready_for_pickup' }).eq('id', orderId);
    void load();
  };

  const filtered = orders
    .filter((o) => 
      o.order_number.toLowerCase().includes(search.toLowerCase()) || 
      o.customer_name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((o) => statusFilter === 'all' || o.status === statusFilter);

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  const statusOptions = ['all', 'pending', 'confirmed', 'packed', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl h-10 px-3">
        <Search size={16} className="text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              statusFilter === status ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-600'
            }`}
          >
            {status === 'all' ? 'All Orders' : status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList size={36} className="text-ink-300" strokeWidth={1.5} />
          <p className="text-sm text-ink-500 mt-3">No orders found</p>
        </div>
      ) : (
        filtered.map((order) => {
          const hasValidPayment = order.status !== 'pending' || 
            (order.payments && (order.payments.status === 'paid' || order.payments.provider === 'cod'));
          return (
            <div key={order.id} className={`bg-white border rounded-2xl p-4 shadow-card ${
              order.status === 'pending' ? 'border-amber-300 bg-amber-50/30' : 'border-ink-100'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-ink-800">{order.order_number}</p>
                  <p className="text-[10px] text-ink-400 mt-0.5">
                    {order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-IN')}
                    {order.status === 'pending' && (
                      <span className="ml-2 text-amber-600 font-bold">⏳ Awaiting confirmation</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {order.payments && order.payments.provider === 'cod' && (
                    <span className="text-[8px] font-bold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">COD</span>
                  )}
                  {order.payments && order.payments.status === 'paid' && (
                    <span className="text-[8px] font-bold bg-green-100 text-green-700 rounded-full px-2 py-0.5">PAID</span>
                  )}
                  <span className={`text-[9px] font-bold rounded-full px-2.5 py-1 ${
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'delivered' ? 'bg-brand-100 text-brand-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {(items[order.id] ?? []).map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-ink-600">{item.brand} {item.product_name} × {item.quantity}</span>
                    <span className="font-semibold text-ink-800">₹{Number(item.line_total).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 pt-2">
                <p className="text-sm font-extrabold text-brand-700">₹{Number(order.total).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-2 mt-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => void confirmOrder(order.id)}
                    disabled={!hasValidPayment}
                    className={`flex-1 h-9 rounded-lg text-white text-xs font-bold ${
                      hasValidPayment ? 'bg-brand-600 hover:bg-brand-700' : 'bg-ink-300 cursor-not-allowed'
                    }`}
                  >
                    Confirm
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => void updateStatus(order.id, 'packed')} className="flex-1 h-9 rounded-lg bg-brand-600 text-white text-xs font-bold">Mark packed</button>
                )}
                {order.status === 'packed' && (
                  <select onChange={(e) => void assignPartner(order.id, e.target.value)} className="flex-1 h-9 rounded-lg border border-ink-200 px-2 text-xs font-bold outline-none">
                    <option value="">Assign delivery...</option>
                    {partners.map((p) => <option key={p.user_id} value={p.user_id}>{p.name}</option>)}
                  </select>
                )}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button onClick={() => void updateStatus(order.id, 'cancelled')} className="h-9 px-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold">Cancel</button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function StockTab() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState(0);

  const load = useCallback(async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts((data as DbProduct[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateStock = async (id: string) => {
    await supabase.from('products').update({ stock_quantity: stockValue }).eq('id', id);
    setEditId(null);
    void load();
  };

  const filtered = products.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl h-10 px-3">
        <Search size={16} className="text-ink-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      {filtered.map((prod) => (
        <div key={prod.id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card flex items-center gap-3">
          {prod.image_url && <img src={prod.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-800 truncate">{prod.brand} {prod.name}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">{prod.pack_size} · MOQ {prod.moq}</p>
          </div>
          {editId === prod.id ? (
            <div className="flex items-center gap-1">
              <input type="number" value={stockValue} onChange={(e) => setStockValue(Number(e.target.value))} className="w-16 h-9 rounded-lg border border-ink-200 px-2 text-sm outline-none focus:border-brand-500" />
              <button onClick={() => void updateStock(prod.id)} className="h-9 px-3 rounded-lg bg-brand-600 text-white text-xs font-bold">Save</button>
            </div>
          ) : (
            <button onClick={() => { setEditId(prod.id); setStockValue(prod.stock_quantity); }} className={`h-9 px-3 rounded-lg text-xs font-bold ${prod.stock_quantity > 0 ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600'}`}>{prod.stock_quantity} in stock</button>
          )}
        </div>
      ))}
    </div>
  );
}