import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import type { Layer } from 'leaflet';
import type { GrowthCell } from '@/types';

function scoreToColor(score: number): string {
  if (score >= 0.85) return '#991b1b'; // Deep Red
  if (score >= 0.7) return '#dc2626'; // Red
  if (score >= 0.55) return '#f97316'; // Orange
  if (score >= 0.41) return '#fb923c'; // Amber / Light Orange
  if (score >= 0.18) return '#fcd34d'; // Yellow
  return '#bbf7d0'; // Light Green
}

function getStatus(score: number): { label: string; color: string; bg: string } {
  if (score >= 0.7) {
    return { label: 'High', color: '#dc2626', bg: '#dc262620' };
  }
  if (score >= 0.4) {
    return { label: 'Medium', color: '#f97316', bg: '#f9731620' };
  }
  return { label: 'Low', color: '#16a34a', bg: '#16a34a20' };
}

const ADDIS_ABABA_CENTER: [number, number] = [9.03, 38.74];

function HatchPatternDefs() {
  const map = useMap();

  useMemo(() => {
    const svg = map.getPanes().overlayPane.querySelector('svg') as SVGSVGElement | null;

    if (!svg || svg.querySelector('#incomplete-hatch')) return;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    defs.innerHTML = `
      <pattern id="incomplete-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#e0e2e7" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="#8290A7" stroke-width="3" />
      </pattern>`;

    svg.prepend(defs);
  }, [map]);

  return null;
}

/** Internal component to handle auto-zoom when a cell is clicked */
function AutoZoom({ boundaryGeoJson }: { boundaryGeoJson: GeoJSON.Polygon }) {
  const map = useMap();

  useEffect(() => {
    if (!boundaryGeoJson) return;

    const coords = boundaryGeoJson.coordinates[0] as [number, number][];
    const bounds = coords.map(([lng, lat]) => [lat, lng] as [number, number]);

    map.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 13,
    });
  }, [boundaryGeoJson, map]);

  return null;
}

/** Internal component to set the map to zoom level 12 on initial load and center it */
function SetInitialZoom() {
  const map = useMap();

  useEffect(() => {
    // 1. Lock the map to zoom level 12
    map.setZoom(12);

    // 2. Get the current center
    const center = map.getCenter();

    // 3. Pan significantly higher and slightly right
    map.panTo([center.lat - 0.035, center.lng + 0.02]);
  }, [map]);

  return null;
}

export interface GrowthMapCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface GrowthMapCanvasProps {
  cells: GrowthCell[];
  valueOverride?: Map<string, number>;
  activeLayerLabel?: string;
  onCellClick: (cellId: string) => void;
  selectedCellId: string | null;
  zoomToCellId?: string | null;
  highlightedCellIds?: string[];
}

const GrowthMapCanvas = forwardRef<GrowthMapCanvasRef, GrowthMapCanvasProps>(
  (
    {
      cells,
      valueOverride,
      activeLayerLabel,
      onCellClick,
      selectedCellId,
      zoomToCellId,
      highlightedCellIds = [],
    },
    ref
  ) => {
    const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{
      x: number;
      y: number;
    } | null>(null);

    const zoomTarget = useMemo(() => {
      if (!zoomToCellId) return null;

      return cells.find((c) => c.cellId === zoomToCellId)?.boundaryGeoJson ?? null;
    }, [cells, zoomToCellId]);

    const hoveredCell = useMemo(() => {
      if (!hoveredCellId) return null;

      return cells.find((c) => c.cellId === hoveredCellId) ?? null;
    }, [cells, hoveredCellId]);

    const hoveredScore = useMemo(() => {
      if (!hoveredCell) return 0;
      return valueOverride?.get(hoveredCell.cellId) ?? hoveredCell.compositeScore;
    }, [hoveredCell, valueOverride]);

    const featureCollection = useMemo(
      () => ({
        type: 'FeatureCollection' as const,
        features: cells.map((cell) => {
          let geom = cell.boundaryGeoJson;
          if (typeof geom === 'string') {
            try {
              geom = JSON.parse(geom);
            } catch {
              // fallback
            }
          }
          return {
            type: 'Feature' as const,
            geometry: geom,
            properties: {
              cellId: cell.cellId,
              score: valueOverride?.get(cell.cellId) ?? cell.compositeScore,
              isComplete: valueOverride ? true : cell.isComplete,
              isHighlighted: highlightedCellIds.includes(cell.cellId),
            },
          };
        }),
      }),
      [cells, valueOverride, highlightedCellIds]
    );

    // Build a unique key fingerprint that changes whenever the underlying scores change.
    // React-Leaflet's <GeoJSON> ignores data prop changes — it only re-renders on key change.
    const geoJsonKey = useMemo(() => {
      const scoreSample = cells
        .slice(0, 5)
        .map((c) => (valueOverride?.get(c.cellId) ?? c.compositeScore).toFixed(4))
        .join('-');
      return `geojson-${cells.length}-${scoreSample}-${selectedCellId ?? 'x'}-${valueOverride ? 'raw' : 'comp'}`;
    }, [cells, valueOverride, selectedCellId]);

    // Expose zoom methods to parent
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const map = (window as unknown as { __mapInstance: L.Map }).__mapInstance;

        if (map) map.zoomIn();
      },

      zoomOut: () => {
        const map = (window as unknown as { __mapInstance: L.Map }).__mapInstance;

        if (map) map.zoomOut();
      },
    }));

    return (
      <MapContainer
        center={ADDIS_ABABA_CENTER}
        zoom={12}
        className="relative z-0 w-full h-full"
        zoomControl={false}
        ref={(map) => {
          if (map) {
            (window as unknown as { __mapInstance: L.Map }).__mapInstance = map;
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <HatchPatternDefs />

        {/* Lock the map to zoom level 12 */}
        <SetInitialZoom />

        {zoomTarget && <AutoZoom boundaryGeoJson={zoomTarget} />}

        {cells.length === 0 && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-surface/60 pointer-events-none">
            <span className="text-body-sm text-text-muted">No data available for this period.</span>
          </div>
        )}

        {cells.length > 0 && (
          <GeoJSON
            key={geoJsonKey}
            data={featureCollection as GeoJSON.FeatureCollection}
            style={(feature) => {
              const isSelected = feature?.properties.cellId === selectedCellId;
              const isHovered = feature?.properties.cellId === hoveredCellId;
              const isHighlighted = feature?.properties.isHighlighted ?? false;
              const score = feature?.properties.score ?? 0;
              const isComplete = feature?.properties.isComplete ?? false;

              if (!isComplete) {
                return {
                  fillColor: isSelected || isHovered ? '#93c5fd' : '#cbd5e1',
                  fillOpacity: isSelected || isHovered ? 0.6 : isHighlighted ? 0.5 : 0.25,
                  color: isSelected
                    ? '#1d4ed8'
                    : isHovered
                      ? '#2563eb'
                      : isHighlighted
                        ? '#3b82f6'
                        : '#94a3b8',
                  weight: isSelected ? 3 : isHovered ? 2.5 : isHighlighted ? 2 : 1,
                  dashArray: isSelected || isHighlighted ? undefined : '3, 3',
                };
              }

              return {
                fillColor: scoreToColor(score),
                fillOpacity: isSelected || isHovered ? 0.8 : isHighlighted ? 0.7 : 0.45,
                color: isSelected
                  ? '#1d4ed8'
                  : isHovered
                    ? '#2563eb'
                    : isHighlighted
                      ? '#3b82f6'
                      : '#64748b',
                weight: isSelected ? 3 : isHovered ? 2 : isHighlighted ? 2 : 0.75,
              };
            }}
            onEachFeature={(feature, layer: Layer) => {
              layer.on('click', () => onCellClick(feature.properties.cellId));

              layer.on('mouseover', (e) => {
                setHoveredCellId(feature.properties.cellId);
                setTooltipPos({
                  x: e.originalEvent.clientX,
                  y: e.originalEvent.clientY,
                });
              });

              layer.on('mouseout', () => {
                setHoveredCellId(null);
                setTooltipPos(null);
              });
            }}
          />
        )}

        {hoveredCell && tooltipPos && (
          <div
            className="fixed z-[99999] pointer-events-none glass-panel rounded-xl shadow-card p-space-sm min-w-[160px] transition-opacity duration-200"
            style={{
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 16,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-body-sm text-body-sm text-text-muted uppercase tracking-wide">
                {hoveredCell.cellId.slice(0, 8)}
              </div>

              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold border"
                style={{
                  backgroundColor: getStatus(hoveredScore).bg,
                  borderColor: getStatus(hoveredScore).color + '40',
                  color: getStatus(hoveredScore).color,
                }}
              >
                {getStatus(hoveredScore).label}
              </span>
            </div>

            <div className="flex items-end justify-between gap-1 mb-1">
              <div className="font-data-kpi text-xl text-on-surface font-bold">
                {(hoveredScore * 100).toFixed(1)}%
              </div>

              <div className="text-[11px] mb-1 flex items-center gap-0.5">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{
                    color: hoveredScore > 0.5 ? '#43B982' : '#E74F3D',
                  }}
                >
                  {hoveredScore > 0.5 ? 'trending_up' : 'trending_down'}
                </span>
              </div>
            </div>

            {activeLayerLabel && (
              <div className="text-[10px] text-text-muted font-medium mb-1.5">
                Layer: <span className="text-primary font-semibold">{activeLayerLabel}</span>
              </div>
            )}

            <div className="pt-1.5 border-t border-border-base flex items-center justify-end text-[11px] text-primary">
              <span>Click for details</span>
              <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
            </div>
          </div>
        )}
      </MapContainer>
    );
  }
);

GrowthMapCanvas.displayName = 'GrowthMapCanvas';

export default GrowthMapCanvas;
