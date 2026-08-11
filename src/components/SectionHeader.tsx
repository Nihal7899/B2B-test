import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  accent?: string;
}

export function SectionHeader({ title, subtitle, onViewAll, accent }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between px-4 mb-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {accent && <span className={`h-4 w-1 rounded-full ${accent}`} />}
          <h2 className="text-base font-bold text-ink-900 tracking-tight truncate">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-ink-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-brand-600 tap-highlight active:opacity-60 transition-opacity shrink-0"
        >
          View All
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
