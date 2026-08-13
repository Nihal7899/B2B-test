import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ArrowLeft, Package, Truck, CheckCircle2, MapPin, Loader2,
  Navigation, Phone, ChevronRight, PhoneCall
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DbOrder, DbOrderItem, DbAddress } from '@/services/catalog';

interface DeliveryScreenProps {
  onBack: () => void;
}

// ---------- Modern Slide‑to‑Confirm Component ----------
interface SlideToConfirmProps {
  onConfirm: () => void;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
}

function SlideToConfirm({ onConfirm, label, isLoading = false, disabled = false }: SlideToConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const snapBack = () => setProgress(0);

  const handleStart = (clientX: number) => {
    if (isLoading || disabled) return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const max = rect.width - 56; // thumb width ~56px
    const pct = Math.min(Math.max(x / max, 0), 1);
    setProgress(pct);
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (progress >= 0.9) {
      onConfirm();
    } else {
      snapBack();
    }
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, progress]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();
    if (isDragging) {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, progress]);

  // Snap back when loading starts
  useEffect(() => {
    if (isLoading) snapBack();
  }, [isLoading]);

  const thumbLeft = `calc(${progress * 100}% - ${progress * 56}px)`;
  const fillWidth = `${progress * 100}%`;

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-2xl overflow-hidden select-none touch-none ${
        disabled || isLoading ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5)',
      }}
    >
      {/* Fill track */}
      <div
        className="absolute left-0 top-0 h-full transition-all duration-150 ease-out rounded-2xl"
        style={{
          width: fillWidth,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      />

      {/* Label - slides with progress */}
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink-800 pointer-events-none transition-all duration-200"
        style={{
          color: progress > 0.4 ? 'white' : '#1e293b',
          mixBlendMode: progress > 0.4 ? 'normal' : 'multiply',
        }}
      >
        {isLoading ? (
          <Loader2 size={22} className="animate-spin text-white" />
        ) : (
          label
        )}
      </div>

      {/* Thumb - floating round with shadow */}
      <div
        ref={thumbRef}
        className="absolute top-1/2 -translate-y-1/2 h-12 w-14 bg-white rounded-2xl shadow-lg flex items-center justify-center transition-all duration-150 ease-out cursor-grab active:cursor-grabbing"
        style={{
          left: thumbLeft,
          boxShadow: '0 4px 12px rgba(99,102,241,0.3), 0 0 0 1px rgba(255,255,255,0.2)',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <ChevronRight
          size={22}
          className="text-indigo-500 transition-transform duration-200"
          style={{ transform: `translateX(${progress * 4}px)` }}
        />
      </div>
    </div>
  );
}

// ---------- Main Component ----------
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

                {/* Address with modern call/navigate buttons */}
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

                    {/* Modern action buttons */}
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

                {/* Slide‑to‑confirm action */}
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