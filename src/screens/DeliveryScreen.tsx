import { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, Package, Truck, CheckCircle2, MapPin, Loader2,
  PhoneCall, Navigation
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DbOrder, DbOrderItem, DbAddress } from '@/services/catalog';
import { SlideToConfirm } from '@/components/SlideToConfirm';

interface DeliveryScreenProps {
  onBack: () => void;
}

export function DeliveryScreen({ onBack }: DeliveryScreenProps) {
  const [assignments, setAssignments] = useState<
    {
      assignment: { id: string; order_id: string; status: string; picked_up_at: string | null; delivered_at: string | null };
      order: DbOrder;
      items: DbOrderItem[];
      address: DbAddress | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: assignData, error: assignError } = await supabase
        .from('delivery_assignments')
        .select('*')
        .eq('delivery_partner_id', user.id)
        .order('created_at', { ascending: false });

      if (assignError || !assignData) {
        console.error('Error fetching assignments:', assignError);
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        assignData.map(async (a) => {
          const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', a.order_id)
            .maybeSingle();
          if (!order) return null;

          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', a.order_id);

          let address: DbAddress | null = null;
          if (order.address_id) {
            const { data: addr } = await supabase
              .from('addresses')
              .select('*')
              .eq('id', order.address_id)
              .maybeSingle();
            address = addr as DbAddress | null;
          }

          return {
            assignment: a,
            order: order as DbOrder,
            items: (items as DbOrderItem[]) ?? [],
            address,
          };
        })
      );

      setAssignments(results.filter((r): r is NonNullable<typeof r> => r !== null));
    } catch (err) {
      console.error('Unexpected error in load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) void load();
    }, 30000);
    return () => clearInterval(interval);
  }, [load, loading]);

  const completeDelivery = async (assignmentId: string, status: 'out_for_delivery' | 'delivered') => {
    setProcessingId(assignmentId);
    try {
      const { error } = await supabase.rpc('complete_delivery', {
        p_assignment_id: assignmentId,
        p_status: status,
      });
      if (error) {
        console.error('Error updating delivery:', error);
        alert('Could not update delivery: ' + error.message);
      } else {
        await load();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  const isProcessing = (id: string) => processingId === id;

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Delivery Panel</h1>
          <p className="text-xs text-ink-500 mt-0.5">Your assigned deliveries</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="h-20 w-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Truck size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-extrabold text-ink-900 mt-5">No deliveries assigned</h2>
          <p className="text-sm text-ink-500 mt-1 max-w-[250px]">
            Orders assigned to you will appear here for pickup and delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(({ assignment, order, items, address }) => {
            const isCurrentProcessing = isProcessing(assignment.id);
            return (
              <div
                key={assignment.id}
                className="bg-white border border-ink-100 rounded-2xl p-4 shadow-card space-y-3"
              >
                {/* Order header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-800">{order.order_number}</p>
                      <p className="text-[10px] text-ink-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold rounded-full px-2.5 py-1 ${
                      assignment.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : assignment.status === 'out_for_delivery'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {assignment.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Order items */}
                <div className="space-y-1 border-t border-ink-100 pt-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-ink-600">
                        {item.brand} {item.product_name} × {item.quantity}
                      </span>
                      <span className="font-semibold text-ink-800">
                        ₹{Number(item.line_total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t border-ink-100 pt-2">
                  <p className="text-[10px] text-ink-400">Total</p>
                  <p className="text-sm font-extrabold text-indigo-700">
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Address with inline Call & Navigate */}
                {address && (
                  <div className="rounded-xl bg-ink-50 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-ink-800">
                          {address.label} · {address.recipient_name}
                        </p>
                        <p className="text-[11px] text-ink-600 mt-0.5 leading-relaxed">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} -{' '}
                          {address.postal_code}
                        </p>
                      </div>
                    </div>

                    {/* Inline Call / Navigate buttons (modern capsules) */}
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${address.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-sm font-semibold shadow-sm border border-emerald-100/50 transition hover:shadow-md active:scale-[0.98]"
                      >
                        <PhoneCall size={16} className="text-emerald-600" />
                        Call
                      </a>
                      {address.latitude && address.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 text-sm font-semibold shadow-sm border border-sky-100/50 transition hover:shadow-md active:scale-[0.98]"
                        >
                          <Navigation size={16} className="text-sky-600" />
                          Navigate
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Slide‑to‑confirm */}
                <div className="pt-1">
                  {assignment.status === 'ready_for_pickup' && (
                    <SlideToConfirm
                      label="Slide to pick up"
                      onConfirm={() => completeDelivery(assignment.id, 'out_for_delivery')}
                      isLoading={isCurrentProcessing}
                      disabled={isCurrentProcessing}
                    />
                  )}
                  {assignment.status === 'out_for_delivery' && (
                    <SlideToConfirm
                      label="Slide to deliver"
                      onConfirm={() => completeDelivery(assignment.id, 'delivered')}
                      isLoading={isCurrentProcessing}
                      disabled={isCurrentProcessing}
                    />
                  )}
                  {assignment.status === 'delivered' && (
                    <div className="h-14 rounded-2xl bg-green-50 text-green-700 text-sm font-bold flex items-center justify-center gap-2 border border-green-200/50">
                      <CheckCircle2 size={22} />
                      Delivered ✓
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}