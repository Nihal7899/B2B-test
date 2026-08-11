import { MapPin, Bell, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-ink-100 safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4" /><path d="M3 17l9 4 9-4" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-extrabold text-ink-900 tracking-tight">Stackknit</span>
              <span className="text-[9px] font-semibold text-brand-600 tracking-wider uppercase">B2B Wholesale</span>
            </div>
          </div>
          <div className="hidden xs:flex items-center gap-1 ml-1 pl-2 border-l border-ink-100 min-w-0">
            <MapPin size={13} className="text-brand-600 shrink-0" strokeWidth={2.5} />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[9px] text-ink-400 font-medium uppercase tracking-wide">Deliver to</span>
              <span className="text-[11px] font-semibold text-ink-700 truncate">Koramangala, BLR</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button className="relative h-9 w-9 flex items-center justify-center rounded-lg text-ink-600 tap-highlight active:scale-90 transition-transform" aria-label="Notifications">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-accent-500 border border-white" />
          </button>
          <button
            onClick={onCartClick}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg text-ink-700 tap-highlight active:scale-90 transition-transform"
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold tabular-nums border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
