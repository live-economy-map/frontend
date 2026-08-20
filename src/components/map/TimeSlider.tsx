// src/components/map/TimeSlider.tsx
interface TimeSliderProps {
  availablePeriods: string[];
  selectedPeriod: string | undefined;
  onChange: (period: string) => void;
  periodSubstituted: boolean;
}

export default function TimeSlider({
  availablePeriods,
  selectedPeriod,
  onChange,
  periodSubstituted,
}: TimeSliderProps) {
  const currentPeriod = selectedPeriod ?? availablePeriods[availablePeriods.length - 1];
  const index = Math.max(0, availablePeriods.indexOf(currentPeriod));

  const formatLabel = (period: string) =>
    new Date(period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 glass-panel rounded-xl shadow-card px-space-lg py-space-md w-[min(720px,90vw)]">
      <div className="flex items-center justify-between mb-space-sm">
        <span className="font-label-caps text-label-caps text-text-muted uppercase">
          {formatLabel(currentPeriod)}
        </span>
        {periodSubstituted && (
          <span className="font-body-sm text-body-sm text-[#F5A34A] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Showing nearest available period
          </span>
        )}
      </div>
      <input
        type="range"
        min={0}
        max={availablePeriods.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(availablePeriods[Number(e.target.value)])}
        className="w-full accent-primary cursor-pointer"
        aria-label="Select time period"
      />
      <div className="flex justify-between mt-space-micro">
        <span className="font-body-sm text-body-sm text-text-muted">
          {formatLabel(availablePeriods[0])}
        </span>
        <span className="font-body-sm text-body-sm text-text-muted">
          {formatLabel(availablePeriods[availablePeriods.length - 1])}
        </span>
      </div>
    </div>
  );
}
