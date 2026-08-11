import { Home, LayoutGrid, ClipboardList, ShoppingBag, UserRound } from 'lucide-react';
import type { ScreenName } from '@/types';

interface BottomNavigationProps { active: ScreenName; cartCount: number; onNavigate: (screen: ScreenName) => void; }

const navItems: { id: ScreenName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home }, { id: 'categories', label: 'Categories', icon: LayoutGrid }, { id: 'orders', label: 'Orders', icon: ClipboardList }, { id: 'cart', label: 'Cart', icon: ShoppingBag }, { id: 'account', label: 'Account', icon: UserRound },
];

export function BottomNavigation({ active, cartCount, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-100 shadow-nav safe-bottom">
      <div className="mx-auto max-w-[720px] h-[62px] flex items-center justify-around px-2">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return <button key={id} onClick={() => onNavigate(id)} className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full tap-highlight active:scale-95 transition-transform ${isActive ? 'text-brand-700' : 'text-ink-400'}`}>
            <div className="relative"><Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />{id === 'cart' && cartCount > 0 && <span className="absolute -top-2 -right-2 h-3.5 min-w-3.5 px-0.5 rounded-full bg-accent-500 text-white text-[8px] font-bold flex items-center justify-center">{cartCount}</span>}</div>
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            {isActive && <span className="absolute bottom-0 h-0.5 w-8 bg-brand-600 rounded-t-full" />}
          </button>;
        })}
      </div>
    </nav>
  );
}
