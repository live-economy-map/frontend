// src/pages/map/GrowthMapPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMapCells, useRawLayer, useAvailablePeriods } from '@/hooks/useMap';
import GrowthMapCanvas, { type GrowthMapCanvasRef } from '@/components/map/GrowthMapCanvas';
import ActivityBar from '@/components/map/ActivityBar';
import MapToolbar from '@/components/map/MapToolbar';
import CellDetailPanel from '@/components/map/CellDetailPanel';
import OnboardingOverlay from '@/components/content/OnboardingOverlay';

type RawLayer = 'VIIRS' | 'GHSL' | 'RWI';

export default function GrowthMapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPeriod = searchParams.get('period') ?? undefined;

  const [displayPeriod, setDisplayPeriod] = useState<string | undefined>(urlPeriod);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [activeRawLayer, setActiveRawLayer] = useState<RawLayer | null>(null);
  const [zoomToCellId, setZoomToCellId] = useState<string | null>(null);
  const [highlightedCellIds, setHighlightedCellIds] = useState<string[]>([]);
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);

  const mapRef = useRef<GrowthMapCanvasRef>(null);

  const { data: periodsData } = useAvailablePeriods();
  const allPeriods = periodsData?.all;
  const availablePeriods = useMemo(() => {
    if (!allPeriods || !Array.isArray(allPeriods)) return [];
    return [...allPeriods]
      .filter(Boolean)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [allPeriods]);

  const validPeriod = useMemo(() => {
    if (availablePeriods.length === 0) return urlPeriod;
    if (urlPeriod && availablePeriods.includes(urlPeriod)) return urlPeriod;
    return availablePeriods[availablePeriods.length - 1];
  }, [urlPeriod, availablePeriods]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handlePeriodChange = (period: string) => {
    setDisplayPeriod(period);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('period', period);
        return next;
      });
    }, 300);
  };
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const { data: cellsData, isLoading, isError, refetch } = useMapCells(validPeriod);
  const { data: rawLayerData } = useRawLayer(activeRawLayer, validPeriod);

  const valueOverride = useMemo(() => {
    if (!activeRawLayer || !rawLayerData) return undefined;
    return new Map(rawLayerData.cells.map((c) => [c.cellId, c.normalizedValue]));
  }, [activeRawLayer, rawLayerData]);

  const handleSearchResult = (
    cells: { cellId: string; compositeScore: number }[],
    parsedFilters: { areaLabel?: string; period?: string; signalFocus?: string } | null
  ) => {
    if (parsedFilters?.period && availablePeriods.includes(parsedFilters.period)) {
      handlePeriodChange(parsedFilters.period);
    }
    const ids = cells.map((c) => c.cellId);
    setHighlightedCellIds(ids);
    if (cells.length > 0) {
      setZoomToCellId(cells[0].cellId);
      setSelectedCellId(cells[0].cellId);
    }
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCellId(cellId);
    setZoomToCellId(cellId);
    setHighlightedCellIds([]);
  };

  const layerOptions = [
    { label: 'Composite', value: null },
    { label: 'VIIRS', value: 'VIIRS' as RawLayer },
    { label: 'GHSL', value: 'GHSL' as RawLayer },
    { label: 'RWI', value: 'RWI' as RawLayer },
  ];

  const currentLayerLabel =
    layerOptions.find((opt) => opt.value === activeRawLayer)?.label || 'Composite';

  return (
    <div className="relative flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="relative flex-1 overflow-hidden flex">
        <div className="relative flex-1">
          {/* Top-Left Search Bar */}
          <MapToolbar onSearchResult={handleSearchResult} />

          {/* Top-Right Unified Controls Bar */}
          <div className="absolute top-space-lg right-space-lg z-30 bg-surface-container-lowest rounded-full shadow-card border border-border-base px-space-md py-space-sm flex items-center gap-2">
            {/* Layer Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLayerDropdownOpen(!isLayerDropdownOpen)}
                className="flex items-center gap-2 px-space-sm py-space-micro rounded-full hover:bg-surface-container-high transition-colors text-body-sm text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">layers</span>
                <span>{currentLayerLabel}</span>
                <span className="material-symbols-outlined text-sm text-text-muted">
                  {isLayerDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Layer Dropdown */}
              {isLayerDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-surface-container-lowest rounded-xl shadow-card border border-border-base p-space-sm min-w-[140px]">
                  {layerOptions.map((opt) => {
                    const isActive = activeRawLayer === opt.value;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setActiveRawLayer(opt.value);
                          setIsLayerDropdownOpen(false);
                        }}
                        className={`w-full text-left px-space-sm py-space-sm rounded-lg text-body-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'hover:bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-border-base" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => mapRef.current?.zoomIn()}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface"
                aria-label="Zoom In"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
              <button
                onClick={() => mapRef.current?.zoomOut()}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface"
                aria-label="Zoom Out"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
            </div>

            {/* Cell Size Indicator */}
            <div className="text-[10px] text-text-muted font-medium border-l border-border-base pl-space-sm">
              Cell: ~1.5 km
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-surface/60">
              <span className="text-body-sm text-text-muted">Loading map…</span>
            </div>
          )}
          {isError && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-surface/90 gap-space-sm">
              <span className="text-body-sm text-[#E74F3D]">Couldn't load the map data.</span>
              <button onClick={() => refetch()} className="text-body-sm text-primary underline">
                Retry
              </button>
            </div>
          )}

          <GrowthMapCanvas
            ref={mapRef}
            cells={cellsData?.cells ?? []}
            valueOverride={valueOverride}
            onCellClick={handleCellClick}
            selectedCellId={selectedCellId}
            zoomToCellId={zoomToCellId}
            highlightedCellIds={highlightedCellIds}
          />

          <OnboardingOverlay />

          <ActivityBar
            availablePeriods={availablePeriods}
            selectedPeriod={displayPeriod ?? validPeriod}
            onPeriodChange={handlePeriodChange}
            isPanelOpen={!!selectedCellId}
          />
        </div>

        {selectedCellId && (
          <CellDetailPanel
            cellId={selectedCellId}
            period={validPeriod}
            onClose={() => {
              setSelectedCellId(null);
              setZoomToCellId(null);
              setHighlightedCellIds([]);
            }}
          />
        )}
      </div>
    </div>
  );
}
