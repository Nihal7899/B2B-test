import { useRef, useEffect, useCallback } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

interface SlideToConfirmProps {
  onConfirm: () => void;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SlideToConfirm({
  onConfirm,
  label,
  isLoading = false,
  disabled = false,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const progress = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startProgress = useRef(0);

  const snapBack = useCallback(() => {
    progress.current = 0;
    if (thumbRef.current) {
      thumbRef.current.style.transform = 'translateX(0px)';
      thumbRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    if (fillRef.current) {
      fillRef.current.style.width = '0%';
      fillRef.current.style.transition = 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    if (labelRef.current) {
      labelRef.current.style.color = '#1e293b';
      labelRef.current.style.mixBlendMode = 'multiply';
    }
  }, []);

  const updateUI = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const max = rect.width - 56;
    let raw = (clientX - rect.left) / max;
    raw = Math.min(Math.max(raw, 0), 1);
    progress.current = raw;
    const px = raw * max;

    if (thumbRef.current) {
      thumbRef.current.style.transform = `translateX(${px}px)`;
      thumbRef.current.style.transition = 'none';
    }
    if (fillRef.current) {
      fillRef.current.style.width = `${raw * 100}%`;
      fillRef.current.style.transition = 'none';
    }
    if (labelRef.current) {
      labelRef.current.style.color = raw > 0.4 ? 'white' : '#1e293b';
      labelRef.current.style.mixBlendMode = raw > 0.4 ? 'normal' : 'multiply';
    }
  }, []);

  const handleStart = useCallback(
    (clientX: number) => {
      if (isLoading || disabled) return;
      isDragging.current = true;
      startX.current = clientX;
      startProgress.current = progress.current;
    },
    [isLoading, disabled]
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging.current) return;
      const delta = clientX - startX.current;
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const max = rect.width - 56;
      const deltaProgress = delta / max;
      let newProgress = Math.min(
        Math.max(startProgress.current + deltaProgress, 0),
        1
      );
      progress.current = newProgress;
      const px = newProgress * max;
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateX(${px}px)`;
        thumbRef.current.style.transition = 'none';
      }
      if (fillRef.current) {
        fillRef.current.style.width = `${newProgress * 100}%`;
        fillRef.current.style.transition = 'none';
      }
      if (labelRef.current) {
        labelRef.current.style.color = newProgress > 0.4 ? 'white' : '#1e293b';
        labelRef.current.style.mixBlendMode = newProgress > 0.4 ? 'normal' : 'multiply';
      }
    },
    []
  );

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (thumbRef.current) {
      thumbRef.current.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    if (fillRef.current) {
      fillRef.current.style.transition = 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    if (progress.current >= 0.9) {
      onConfirm();
    } else {
      snapBack();
    }
  }, [onConfirm, snapBack]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    if (isDragging.current) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMove, handleEnd]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();
    if (isDragging.current) {
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleMove, handleEnd]);

  // Reset on loading
  useEffect(() => {
    if (isLoading) {
      snapBack();
      isDragging.current = false;
    }
  }, [isLoading, snapBack]);

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-2xl overflow-hidden select-none touch-none ${
        disabled || isLoading ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5)',
        willChange: 'transform',
      }}
    >
      <div
        ref={fillRef}
        className="absolute left-0 top-0 h-full rounded-2xl"
        style={{
          width: '0%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
          willChange: 'width',
          transition: 'none',
        }}
      />
      <span
        ref={labelRef}
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold pointer-events-none"
        style={{
          color: '#1e293b',
          mixBlendMode: 'multiply',
          transition: 'color 0.15s ease',
        }}
      >
        {isLoading ? (
          <Loader2 size={22} className="animate-spin text-white" />
        ) : (
          label
        )}
      </span>
      <div
        ref={thumbRef}
        className="absolute top-1/2 -translate-y-1/2 h-12 w-14 bg-white rounded-2xl shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          transform: 'translateX(0px)',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3), 0 0 0 1px rgba(255,255,255,0.2)',
          willChange: 'transform',
          transition: 'none',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <ChevronRight
          size={22}
          className="text-indigo-500"
          style={{ transform: `translateX(${progress.current * 4}px)` }}
        />
      </div>
    </div>
  );
}