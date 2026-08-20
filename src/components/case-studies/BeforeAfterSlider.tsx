import { useState, useRef, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

// Caller's responsibility to only mount this when both URLs are non-null
// (see CaseStudyDetailPanel) — this component does not branch on nullability.
export default function BeforeAfterSlider({
  beforeImageUrl,
  afterImageUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
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
      <div className="flex h-[300px] items-center justify-center rounded-xl bg-surface-container-lowest p-2 soft-shadow md:h-[400px]">
        <p className="text-body-sm text-text-muted">Before/after imagery unavailable</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[300px] w-full touch-none overflow-hidden rounded-xl bg-surface-container-lowest p-2 soft-shadow md:h-[400px]"
    >
      <div className="absolute inset-0">
        <img
          src={beforeImageUrl}
          alt={beforeLabel}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-sm bg-surface-container-lowest/90 px-3 py-1 text-label-caps text-on-surface shadow-sm">
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
          <span className="absolute right-4 top-4 rounded-sm bg-surface-container-lowest/90 px-3 py-1 text-label-caps text-on-surface shadow-sm">
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
        className="absolute inset-y-0 z-10 flex w-0.5 -translate-x-1/2 transform cursor-ew-resize items-center justify-center bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${position}%` }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg">
          <span className="material-symbols-outlined text-[16px] text-white">swap_horiz</span>
        </div>
      </div>
    </div>
  );
}
