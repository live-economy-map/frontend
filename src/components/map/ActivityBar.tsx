import { useState, useRef, useEffect, useCallback } from 'react';
import TimelinePanel from './TimelinePanel';

interface ActivityBarProps {
  availablePeriods: string[];
  selectedPeriod: string | undefined;
  onPeriodChange: (period: string) => void;
  isPanelOpen?: boolean;
}

export default function ActivityBar({
  availablePeriods,
  selectedPeriod,
  onPeriodChange,
  isPanelOpen = false,
}: ActivityBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPeriods = availablePeriods.length;
  const maxIndex = Math.max(totalPeriods - 1, 0);

  const selectedIndex = selectedPeriod ? availablePeriods.indexOf(selectedPeriod) : -1;

  const displayIndex = selectedIndex !== -1 ? selectedIndex : Math.min(currentIndex, maxIndex);

  const progress = maxIndex > 0 ? displayIndex / maxIndex : 0;

  const formatLabel = (period: string) =>
    new Date(period).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

  const shortLabel = (period: string) =>
    new Date(period).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });

  const updateIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= availablePeriods.length) {
        return;
      }

      indexRef.current = index;
      setCurrentIndex(index);
      onPeriodChange(availablePeriods[index]);
    },
    [availablePeriods, onPeriodChange]
  );

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    if (totalPeriods === 0) return;

    stopPlayback();

    let nextIndex = selectedIndex !== -1 ? selectedIndex : indexRef.current;

    if (nextIndex >= maxIndex) {
      nextIndex = 0;
      updateIndex(0);
    }

    indexRef.current = nextIndex;
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      nextIndex += 1;

      if (nextIndex >= totalPeriods) {
        nextIndex = 0;
      }

      updateIndex(nextIndex);
    }, 1500);
  }, [maxIndex, selectedIndex, stopPlayback, totalPeriods, updateIndex]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopPlayback();

    const newIndex = Number(e.target.value);
    updateIndex(newIndex);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTimelineDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (totalPeriods === 0) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[min(1180px,calc(100%-2rem))] max-w-[calc(100%-2rem)] bg-surface-container-lowest border border-border-base rounded-xl shadow-ambient px-4 py-3 transition-all duration-200 ${
        isPanelOpen ? 'hidden md:block' : 'block'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          onClick={handlePlayToggle}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="w-[120px] sm:w-[140px] shrink-0 hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-on-surface">Activity Trend</span>

            <span className="text-[11px] font-bold text-primary">
              {Math.round(progress * 100)}%
            </span>
          </div>

          <span className="block text-[10px] text-text-muted mt-0.5">Past to Present</span>
        </div>

        <div className="flex-1 relative h-[58px] min-w-0 mr-4 sm:mr-8">
          <div className="absolute left-0 right-0 top-[16px] h-[3px] bg-primary/20 rounded-full" />

          <div
            className="absolute left-0 top-[16px] h-[3px] bg-primary rounded-full transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />

          <input
            type="range"
            min={0}
            max={maxIndex}
            step={1}
            value={displayIndex}
            onChange={handleSliderChange}
            disabled={totalPeriods <= 1}
            aria-label="Activity timeline"
            className="absolute left-0 right-0 top-[7px] w-full h-[22px] opacity-0 cursor-pointer z-30 m-0 p-0"
          />

          {availablePeriods.map((period, idx) => {
            const position = maxIndex > 0 ? (idx / maxIndex) * 100 : 50;

            const isSelected = idx === displayIndex;
            const isPast = idx <= displayIndex;

            return (
              <div
                key={period}
                className="absolute top-0 pointer-events-none"
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {isSelected ? (
                  <>
                    <div className="absolute left-1/2 -translate-x-1/2 top-[2px] w-[2px] h-[30px] bg-primary rounded-full" />

                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[8px] h-[8px] rounded-full bg-primary ring-2 ring-surface-container-lowest" />

                    <div className="absolute left-1/2 -translate-x-1/2 top-[38px] px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-semibold whitespace-nowrap shadow-sm">
                      {shortLabel(period)}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-[13px] w-[5px] h-[5px] rounded-full ${
                        isPast ? 'bg-primary' : 'bg-border-base'
                      }`}
                    />

                    <span className="absolute left-1/2 -translate-x-1/2 top-[38px] text-[10px] text-text-muted whitespace-nowrap">
                      {shortLabel(period)}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setShowTimelineDropdown(!showTimelineDropdown)}
            className="flex items-center gap-2 border border-border-base rounded-xl px-3 py-2 bg-surface-container-lowest hover:bg-surface-container-high transition-colors"
          >
            <span className="text-sm font-medium text-on-surface">
              {formatLabel(selectedPeriod || availablePeriods[availablePeriods.length - 1])}
            </span>

            <span className="material-symbols-outlined text-sm text-text-muted">
              {showTimelineDropdown ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <TimelinePanel
            availablePeriods={availablePeriods}
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            isOpen={showTimelineDropdown}
            onClose={() => setShowTimelineDropdown(false)}
          />
        </div>
      </div>
    </div>
  );
}
