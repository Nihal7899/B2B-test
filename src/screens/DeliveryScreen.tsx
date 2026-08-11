import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, Loader2, Navigation, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DbOrder, DbOrderItem, DbAddress } from '@/services/catalog';

interface DeliveryScreenProps { onBack: () => void; }

export function DeliveryScreen({ onBack }: DeliveryScreenProps) {
  const [assignments, setAssignments] = useState<{ assignment: { id: string; order_id: string; status: string; picked_up_at: string | null; delivered_at: string | null }; order: DbOrder; items: DbOrderItem[]; address: DbAddress | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: assignData } = await supabase.from('delivery_assignments').select('*').order('created_at', { ascending: false });
    if (!assignData) { setLoading(false); return; }
    const results = await Promise.all((assignData as { id: string; order_id: string; status: string; picked_up_at: string | null; delivered_at: string | null }[]).map(async (a) => {
      const { data: order } = await supabase.from('orders').select('*').eq('id', a.order_id).maybeSingle();
      if (!order) return null;
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', a.order_id);
      let address: DbAddress | null = null;
      if ((order as DbOrder).address_id) {
        const { data: addr } = await supabase.from('addresses').select('*').eq('id', (order as DbOrder).address_id as string).maybeSingle();
        address = addr as DbAddress | null;
      }
      return { assignment: a, order: order as DbOrder, items: (items as DbOrderItem[]) ?? [], address };
    }));
    setAssignments(results.filter((r): r is NonNullable<typeof r> => r !== null));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const markPickedUp = async (assignmentId: string, orderId: string) => {
    await supabase.from('delivery_assignments').update({ status: 'out_for_delivery', picked_up_at: new Date().toISOString() }).eq('id', assignmentId);
    await supabase.from('orders').update({ status: 'out_for_delivery' }).eq('id', orderId);
    void load();
  };

  const markDelivered = async (assignmentId: string, orderId: string) => {
    await supabase.from('delivery_assignments').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', assignmentId);
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    void load();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 size={28} className="animate-spin text-brand-600" /></div>;

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Delivery Panel</h1>
          <p className="text-xs text-ink-500 mt-0.5">Your assigned deliveries</p>
        </div>
      </div>
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600"><Truck size={36} strokeWidth={1.5} /></div>
          <h2 className="text-lg font-extrabold text-ink-900 mt-5">No deliveries assigned</h2>
          <p className="text-sm text-ink-500 mt-1 max-w-[250px]">Orders assigned to you will appear here for pickup and delivery.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(({ assignment, order, items, address }) => (
            <div key={assignment.id} className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Package size={18} /></div>
                  <div>
                    <p className="text-sm font-bold text-ink-800">{order.order_number}</p>
                    <p className="text-[10px] text-ink-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-bold rounded-full px-2.5 py-1 ${assignment.status === 'delivered' ? 'bg-brand-100 text-brand-700' : assignment.status === 'out_for_delivery' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{assignment.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="space-y-1 border-t border-ink-100 pt-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-ink-600">{item.brand} {item.product_name} × {item.quantity}</span>
                    <span className="font-semibold text-ink-800">₹{Number(item.line_total).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-ink-100 pt-2">
                <p className="text-[10px] text-ink-400">Total</p>
                <p className="text-sm font-extrabold text-brand-700">₹{Number(order.total).toLocaleString('en-IN')}</p>
              </div>
              {address && (
                <div className="rounded-xl bg-ink-50 p-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-ink-800">{address.label} · {address.recipient_name}</p>
                      <p className="text-[11px] text-ink-600 mt-0.5 leading-relaxed">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} - {address.postal_code}</p>
                      <p className="text-[11px] text-ink-500 mt-1 flex items-center gap-1"><Phone size={11} /> {address.phone}</p>
                    </div>
                  </div>
                  {address.latitude && address.longitude && (
                    <a href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold text-brand-600 mt-1"><Navigation size={13} /> Open in Maps</a>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {assignment.status === 'ready_for_pickup' && <button onClick={() => void markPickedUp(assignment.id, order.id)} className="flex-1 h-10 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"><Package size={15} /> Mark picked up</button>}
                {assignment.status === 'out_for_delivery' && <button onClick={() => void markDelivered(assignment.id, order.id)} className="flex-1 h-10 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> Mark delivered</button>}
                {assignment.status === 'delivered' && <div className="flex-1 h-10 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> Delivered</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
