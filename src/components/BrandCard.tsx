// components/BrandCard.tsx
import { TrustedBrand } from '@/types';

export function BrandCarousel({ brands }: { brands: TrustedBrand[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-touch px-4 pb-1">
      {brands.map((brand) => (
        <div key={brand.id} className="shrink-0 flex flex-col items-center bg-white rounded-xl border border-ink-100 px-4 py-3 shadow-sm min-w-[80px]">
          <div className="w-12 h-12 bg-ink-50 rounded-full flex items-center justify-center p-1">
            <img src={brand.logo_url} alt={brand.name} className="max-h-8 max-w-8 object-contain" />
          </div>
          <span className="text-xs font-semibold text-ink-700 mt-1">{brand.name}</span>
        </div>
      ))}
    </div>
  );
}