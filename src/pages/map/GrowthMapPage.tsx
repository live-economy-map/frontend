// src/pages/map/GrowthMapPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, RotateCw } from 'lucide-react';
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

  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [activeRawLayer, setActiveRawLayer] = useState<RawLayer | null>(null);
  const [zoomToCellId, setZoomToCellId] = useState<string | null>(null);
  const [highlightedCellIds, setHighlightedCellIds] = useState<string[]>([]);
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);

  const mapRef = useRef<GrowthMapCanvasRef>(null);

  const { data: periodsData, isLoading: isPeriodsLoading } = useAvailablePeriods();
  const allPeriods = periodsData?.all;
  const availablePeriods = useMemo(() => {
    if (!allPeriods || !Array.isArray(allPeriods)) return [];
    return [...allPeriods]
      .filter(Boolean)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [allPeriods]);

  // Determine the initial period from URL or fallback to latest available
  const defaultPeriod = useMemo(() => {
    if (availablePeriods.length === 0) return urlPeriod;
    if (urlPeriod && availablePeriods.includes(urlPeriod)) return urlPeriod;
    return availablePeriods[availablePeriods.length - 1];
  }, [urlPeriod, availablePeriods]);

  // userSelectedPeriod is set immediately when the user moves the slider
  const [userSelectedPeriod, setUserSelectedPeriod] = useState<string | null>(null);

  // activePeriod drives ALL data fetching (map cells + cell detail panel)
  const activePeriod = userSelectedPeriod ?? defaultPeriod;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handlePeriodChange = (period: string) => {
    // Update data-fetch period immediately so map + panel respond instantly
    setUserSelectedPeriod(period);
    // Debounce the URL search param update (browser history / shareable URL)
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

  const {
    data: cellsData,
    isLoading: isCellsLoading,
    isFetching: isCellsFetching,
    isError: isCellsError,
    refetch: refetchCells,
  } = useMapCells(activePeriod);

  const {
    data: rawLayerData,
    isLoading: isLayerLoading,
    isFetching: isLayerFetching,
  } = useRawLayer(activeRawLayer, activePeriod);

  const isMapLoading =
    isPeriodsLoading ||
    (isCellsLoading && !cellsData) ||
    (Boolean(activeRawLayer) && isLayerLoading && !rawLayerData);
  const isMapUpdating = !isMapLoading && (isCellsFetching || isLayerFetching);

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
                        className={`w-full text-left px-space-sm py-space-sm rounded-lg text-body-sm transition-colors cursor-pointer ${
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
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer"
                aria-label="Zoom In"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
              <button
                onClick={() => mapRef.current?.zoomOut()}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface cursor-pointer"
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

          {/* Fallback Notice Banner */}
          {cellsData?.periodSubstituted && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-500/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 border border-amber-400/50">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>No data for requested period — showing {cellsData.period}</span>
            </div>
          )}

          {/* Map Loading State - Pure Circular Spinner */}
          {isMapLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-xs pointer-events-none transition-opacity duration-200">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}

          {/* Subtle Background Update Indicator */}
          {isMapUpdating && (
            <div className="absolute top-4 right-4 z-30 flex items-center p-2 rounded-full bg-surface/80 backdrop-blur-md shadow-sm border border-border-base">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          )}

          {/* Error State */}
          {isCellsError && !isMapLoading && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-xs p-6">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-red-100 dark:border-red-950/50 text-center max-w-sm">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Couldn't load map data
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Failed to fetch grid cells from the server. Please check your connection and
                    retry.
                  </p>
                </div>
                <button
                  onClick={() => refetchCells()}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}

          <GrowthMapCanvas
            ref={mapRef}
            cells={cellsData?.cells ?? []}
            valueOverride={valueOverride}
            activeLayerLabel={activeRawLayer ? currentLayerLabel : undefined}
            onCellClick={handleCellClick}
            selectedCellId={selectedCellId}
            zoomToCellId={zoomToCellId}
            highlightedCellIds={highlightedCellIds}
          />

          <OnboardingOverlay />

          <ActivityBar
            availablePeriods={availablePeriods}
            selectedPeriod={activePeriod}
            onPeriodChange={handlePeriodChange}
            isPanelOpen={!!selectedCellId}
          />
        </div>

        {selectedCellId && (
          <CellDetailPanel
            cellId={selectedCellId}
            period={activePeriod}
            activeLayer={activeRawLayer}
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
