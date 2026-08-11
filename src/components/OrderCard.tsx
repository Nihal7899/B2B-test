import { ChevronRight, PackageCheck } from 'lucide-react';
import type { Order } from '@/types';
import { StatusBadge } from './OfferBadge';

interface OrderCardProps { order: Order; onClick: () => void; }
export function OrderCard({ order, onClick }: OrderCardProps) {
  return <div className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2.5"><div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><PackageCheck size={18} /></div><div><p className="text-sm font-bold text-ink-800">{order.orderNo}</p><p className="text-[11px] text-ink-400 mt-0.5">{order.date} · {order.itemCount} items</p></div></div>
      <StatusBadge status={order.status} />
    </div>
    <div className="border-t border-ink-100 mt-3 pt-3 flex items-center justify-between"><div><p className="text-[10px] text-ink-400">Order total</p><p className="text-base font-extrabold text-ink-900 mt-0.5">₹{order.total.toLocaleString('en-IN')}</p></div><button onClick={onClick} className="flex items-center gap-1 text-xs font-bold text-brand-600">View Details <ChevronRight size={14} /></button></div>
  </div>;
}
