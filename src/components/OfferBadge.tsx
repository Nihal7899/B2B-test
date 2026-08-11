interface OfferBadgeProps {
  discountPercent: number;
  size?: 'sm' | 'md';
}

export function OfferBadge({ discountPercent, size = 'sm' }: OfferBadgeProps) {
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
  return (
    <span className={`inline-flex items-center font-bold rounded-md bg-brand-50 text-brand-700 ${padding} leading-none tracking-tight`}>
      {discountPercent}% OFF
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    Delivered: 'bg-brand-50 text-brand-700',
    Processing: 'bg-amber-50 text-amber-700',
    'Out for Delivery': 'bg-sky-50 text-sky-700',
    Cancelled: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] ?? 'bg-ink-100 text-ink-600'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles[status]?.replace('text-', 'bg-').split(' ')[1] ?? 'bg-ink-400'}`} />
      {status}
    </span>
  );
}
