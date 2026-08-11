import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
}

export function QuantitySelector({ quantity, onIncrement, onDecrement, size = 'sm' }: QuantitySelectorProps) {
  const btn = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const icon = size === 'sm' ? 14 : 18;

  return (
    <div className="flex items-center gap-1 rounded-lg bg-brand-50 border border-brand-200 p-0.5">
      <button
        onClick={(e) => { e.stopPropagation(); onDecrement(); }}
        className={`${btn} flex items-center justify-center rounded-md bg-white text-brand-700 shadow-sm tap-highlight active:scale-90 transition-transform`}
        aria-label="Decrease quantity"
      >
        <Minus size={icon} strokeWidth={2.5} />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-bold text-brand-800 tabular-nums">
        {quantity}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onIncrement(); }}
        className={`${btn} flex items-center justify-center rounded-md bg-brand-600 text-white shadow-sm tap-highlight active:scale-90 transition-transform`}
        aria-label="Increase quantity"
      >
        <Plus size={icon} strokeWidth={2.5} />
      </button>
    </div>
  );
}
