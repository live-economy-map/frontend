// src/components/map/TimelinePanel.tsx
interface TimelinePanelProps {
  availablePeriods: string[];
  selectedPeriod: string | undefined;
  onPeriodChange: (period: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TimelinePanel({
  availablePeriods,
  selectedPeriod,
  onPeriodChange,
  isOpen,
  onClose,
}: TimelinePanelProps) {
  const formatLabel = (period: string) =>
    new Date(period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full right-0 mb-2 z-50 bg-surface-container-lowest rounded-lg shadow-ambient border border-border-base p-space-md w-[200px] max-h-[300px] overflow-y-auto">
      <div className="flex justify-between items-center mb-space-sm border-b border-border-base pb-space-sm">
        <div>
          <div className="text-xs font-semibold text-on-surface">Snapshot Timeline</div>
          <div className="text-[9px] text-text-muted">Select period</div>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-on-surface">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div className="space-y-1">
        <div className="bg-surface-container-high/50 rounded px-space-sm py-space-sm flex justify-between items-center">
          <span className="text-xs text-on-surface font-medium">Latest Period</span>
          <span className="text-[9px] text-[#43B982] font-semibold">Ready</span>
        </div>

        {availablePeriods.map((period) => {
          const isSelected = selectedPeriod === period;
          return (
            <button
              key={period}
              onClick={() => {
                onPeriodChange(period);
                onClose();
              }}
              className={`w-full rounded px-space-sm py-space-sm flex justify-between items-center transition-colors text-xs ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'hover:bg-surface-container-high text-on-surface'
              }`}
            >
              <span>{formatLabel(period)}</span>
              {isSelected ? (
                <span className="text-[9px] font-semibold text-white">Selected</span>
              ) : (
                <span className="text-[9px] text-[#43B982] font-semibold">Ready</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
