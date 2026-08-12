// components/PromoAdBanner.tsx
import { PromoBanner } from '@/types';

interface PromoAdBannerProps {
  banner: PromoBanner;
}

export function PromoAdBanner({ banner }: PromoAdBannerProps) {
  const promoCode = (banner.actionConfig?.promoCode as string) || 'HYPER10';
  const discount = (banner.actionConfig?.discount as string) || '10% OFF';

  return (
    <div className="mx-4 rounded-2xl overflow-hidden relative min-h-[100px] shadow-card">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${banner.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="relative z-10 p-4 flex flex-col justify-center h-full text-white">
        {banner.badge && (
          <p className="text-[10px] font-bold tracking-wider uppercase text-yellow-300">
            {banner.badge}
          </p>
        )}
        <h3 className="text-lg font-extrabold leading-tight">{banner.headline}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-wider border border-white/30">
            {promoCode}
          </span>
          <span className="text-sm font-semibold">{discount}</span>
        </div>
        <p className="text-xs opacity-80 mt-1">{banner.subtext}</p>
      </div>
    </div>
  );
}