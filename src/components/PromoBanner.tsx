import type { PromoBanner } from '@/types';

interface PromoBannerCardProps {
  banner: PromoBanner;
  onAction?: (banner: PromoBanner) => void;
}

export function PromoBannerCard({ banner, onAction }: PromoBannerCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${banner.bgClass} ${banner.textClass} shadow-soft min-h-[124px] flex`}>
      <div className="flex-1 p-4 flex flex-col justify-between z-10 min-w-0">
        <div>
          {banner.badge && (
            <span className="inline-block text-[9px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 mb-2">
              {banner.badge}
            </span>
          )}
          <h3 className="text-[17px] font-extrabold leading-tight tracking-tight">{banner.headline}</h3>
          <p className="text-[11px] opacity-90 mt-1 leading-snug line-clamp-2">{banner.subtext}</p>
        </div>
        <button onClick={() => onAction?.(banner)} className="mt-2.5 self-start bg-white text-ink-900 text-xs font-bold rounded-lg px-3.5 py-1.5 tap-highlight active:scale-95 transition-transform shadow-sm">
          {banner.cta}
        </button>
      </div>
      <div className="w-[42%] shrink-0 relative overflow-hidden">
        <img src={banner.image} alt={banner.headline} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgClass.includes('brand') ? 'from-brand-800' : 'from-ink-900'} to-transparent opacity-60`} />
      </div>
    </div>
  );
}

interface PromoCarouselProps {
  banners: PromoBanner[];
  onAction?: (banner: PromoBanner) => void;
}

export function PromoCarousel({ banners, onAction }: PromoCarouselProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-touch px-4 pb-1">
      {banners.map((banner) => (
        <div key={banner.id} className="scroll-snap-item shrink-0 w-[85%] max-w-[340px]">
          <PromoBannerCard banner={banner} onAction={onAction} />
        </div>
      ))}
    </div>
  );
}
