// src/components/case-studies/BeforeAfterSlider.tsx
import { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImageUrl,
  afterImageUrl,
  beforeLabel = 'Before Detection',
  afterLabel = 'After Development',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current) updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 2));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 2));
  };

  if (failed) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 p-4 md:h-[420px]">
        <p className="text-xs sm:text-sm text-gray-500">
          Before/after imagery currently unavailable
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[320px] w-full touch-none overflow-hidden rounded-2xl bg-gray-900 border border-gray-200 shadow-sm md:h-[420px] select-none"
    >
      <div className="absolute inset-0">
        <img
          src={beforeImageUrl}
          alt={beforeLabel}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-white/10">
          {beforeLabel}
        </span>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <img
            src={afterImageUrl}
            alt={afterLabel}
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute right-4 top-4 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm border border-white/10">
            {afterLabel}
          </span>
        </div>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reveal comparison"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 z-10 flex w-1 -translate-x-1/2 transform cursor-ew-resize items-center justify-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]"
        style={{ left: `${position}%` }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 shadow-md text-white">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
