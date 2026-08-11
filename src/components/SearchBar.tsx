import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilter?: () => void;
}

export function SearchBar({ value, onChange, onFilter }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-4">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={2.5} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products, brands, categories..."
          className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-ink-200 rounded-xl text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
        />
      </div>
      {onFilter && (
        <button
          onClick={onFilter}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-ink-200 text-ink-600 tap-highlight active:scale-95 transition-transform"
          aria-label="Filter"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
