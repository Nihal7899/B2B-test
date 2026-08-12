// components/PromoAdBanner.tsx
import { PromoBanner } from '@/types';

interface PromoAdBannerProps {
  banner: PromoBanner;
  onAction?: (banner: PromoBanner) => void;
}

export function PromoAdBanner({ banner, onAction }: PromoAdBannerProps) {
  return (
    <div className="mx-4 rounded-2xl overflow-hidden relative min-h-[100px] shadow-card">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner.image})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="relative z-10 p-4 flex flex-col justify-center h-full text-white">
        {banner.badge && <p className="text-[10px] font-bold tracking-wider uppercase text-yellow-300">{banner.badge}</p>}
        <h3 className="text-lg font-extrabold leading-tight">{banner.headline}</h3>
        <div className="flex items-center gap-3 mt-1">
          {banner.actionConfig?.promoCode && (
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-wider border border-white/30">
              {banner.actionConfig.promoCode}
            </span>
          )}
          <span className="text-sm font-semibold">{banner.subtext}</span>
        </div>
        <button
          onClick={() => onAction?.(banner)}
          className="mt-2.5 self-start bg-white text-ink-900 text-xs font-bold rounded-lg px-3.5 py-1.5"
        >
          {banner.cta}
        </button>
      </div>
    </div>
  );
}