// components/StoreCard.tsx
import { Store } from '@/types';
import { ChevronRight } from 'lucide-react';

export function StoreCard({ store, onClick }: { store: Store; onClick: (store: Store) => void }) {
  return (
    <button
      onClick={() => onClick(store)}
      className={`relative shrink-0 w-44 rounded-2xl overflow-hidden border ${store.theme_border} shadow-card tap-highlight active:scale-[0.98] transition-transform`}
    >
      <div className={`h-28 ${store.theme_bg} relative`}>
        <img src={store.image_url} alt={store.name} className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className={`absolute bottom-2 left-2 text-white font-bold text-sm ${store.theme_text}`}>
          {store.name}
        </div>
      </div>
      <div className="p-2 flex items-center justify-between text-xs bg-white">
        <span className="text-ink-600 truncate">{store.description}</span>
        <ChevronRight size={14} className={store.theme_text} />
      </div>
    </button>
  );
}

export function StoreCarousel({ stores, onStoreClick }: { stores: Store[]; onStoreClick: (store: Store) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-touch px-4 pb-1">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} onClick={onStoreClick} />
      ))}
    </div>
  );
}