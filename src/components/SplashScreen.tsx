import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, ShieldCheck, Tag } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2300);
    const doneTimer = setTimeout(onFinish, 2900);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 safe-top safe-bottom ${
        exiting ? 'splash-fade-out' : ''
      }`}
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-brand-400/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-10 h-32 w-32 rounded-full bg-accent-500/15 blur-2xl" />

      {/* Expanding rings behind logo */}
      <div className="pointer-events-none absolute">
        <div className="splash-ring h-28 w-28 rounded-full border-2 border-brand-300/40" />
        <div className="splash-ring h-28 w-28 rounded-full border-2 border-brand-300/40" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* Logo mark */}
      <div className="splash-logo-in relative">
        <div className="splash-float flex items-center justify-center h-20 w-20 rounded-3xl bg-white shadow-2xl shadow-brand-950/50 relative overflow-hidden">
          <div className="absolute inset-0 splash-shimmer" />
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0f7760" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 12l9 4 9-4" />
            <path d="M3 17l9 4 9-4" />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      <h1 className="splash-word-in mt-6 text-3xl font-extrabold text-white tracking-tight">
        Stackknit
      </h1>
      <p className="splash-tag-in mt-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-200">
        B2B Grocery Wholesale
      </p>

      {/* Feature pills */}
      <div className="splash-tag-in mt-7 flex items-center gap-2">
        {[
          { icon: Truck, label: 'Fast delivery' },
          { icon: ShieldCheck, label: 'Verified quality' },
          { icon: Tag, label: 'Best prices' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5"
          >
            <Icon size={13} className="text-brand-200" strokeWidth={2.2} />
            <span className="text-[10px] font-semibold text-brand-100">{label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 w-44 h-1 rounded-full bg-white/15 overflow-hidden">
        <div className="splash-bar h-full rounded-full bg-gradient-to-r from-brand-300 to-white" />
      </div>

      {/* Footer */}
      <div className="absolute bottom-7 flex items-center gap-1.5 text-brand-300">
        <ShoppingBag size={12} strokeWidth={2.2} />
        <span className="text-[10px] font-medium tracking-wide">Built for growing businesses</span>
      </div>
    </div>
  );
}
