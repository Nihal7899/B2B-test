import { Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';
import { QuantitySelector } from './QuantitySelector';

interface CartItemProps { item: CartItemType; onIncrement: () => void; onDecrement: () => void; onRemove: () => void; onClick: () => void; }

export function CartItem({ item, onIncrement, onDecrement, onRemove, onClick }: CartItemProps) {
  return <div className="flex gap-3 p-3 bg-white border border-ink-100 rounded-2xl shadow-card">
    <button onClick={onClick} className="h-[76px] w-[76px] rounded-xl overflow-hidden bg-ink-50 shrink-0"><img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" /></button>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">{item.product.brand}</p>
      <h3 className="font-bold text-sm text-ink-800 truncate mt-0.5">{item.product.name}</h3>
      <p className="text-[11px] text-ink-400 mt-0.5">{item.product.packSize} · ₹{item.product.price} / unit</p>
      <div className="flex items-center justify-between mt-2">
        <QuantitySelector quantity={item.quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        <p className="text-base font-extrabold text-brand-700">₹{item.product.price * item.quantity}</p>
      </div>
    </div>
    <button onClick={onRemove} className="self-start p-1 text-ink-300 hover:text-red-500 transition-colors" aria-label="Remove item"><Trash2 size={15} /></button>
  </div>;
}
