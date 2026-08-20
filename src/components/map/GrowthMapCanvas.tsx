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
  onCellClick: (cellId: string) => void;
  selectedCellId: string | null;
  zoomToCellId?: string | null;
  highlightedCellIds?: string[];
}

const GrowthMapCanvas = forwardRef<GrowthMapCanvasRef, GrowthMapCanvasProps>(
  (
    { cells, valueOverride, onCellClick, selectedCellId, zoomToCellId, highlightedCellIds = [] },
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

    const featureCollection = useMemo(
      () => ({
        type: 'FeatureCollection' as const,
        features: cells.map((cell) => ({
          type: 'Feature' as const,
          geometry: cell.boundaryGeoJson,
          properties: {
            cellId: cell.cellId,
            score: valueOverride?.get(cell.cellId) ?? cell.compositeScore,
            isComplete: valueOverride ? true : cell.isComplete,
            isHighlighted: highlightedCellIds.includes(cell.cellId),
          },
        })),
      }),
      [cells, valueOverride, highlightedCellIds]
    );

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

    if (cells.length === 0) {
      return (
        <div className="relative w-full h-full bg-surface/50 flex items-center justify-center z-10">
          <span className="text-body-sm text-text-muted">No data available for this period.</span>
        </div>
      );
    }

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

        <GeoJSON
          key={selectedCellId ?? 'none'}
          data={featureCollection as GeoJSON.FeatureCollection}
          style={(feature) => {
            const isSelected = feature?.properties.cellId === selectedCellId;
            const isHovered = feature?.properties.cellId === hoveredCellId;
            const isHighlighted = feature?.properties.isHighlighted ?? false;
            const score = feature?.properties.score ?? 0;
            const isComplete = feature?.properties.isComplete ?? false;

            let fillOpacity = isHighlighted ? 0.7 : 0.35;

            if (isSelected || isHovered) {
              fillOpacity = 0.7;
            }

            if (!isComplete) {
              return {
                fillColor: 'url(#incomplete-hatch)',
                fillOpacity: isHighlighted ? 0.5 : 0.2,
                color: isSelected ? '#3F82F7' : isHighlighted ? '#3F82F7' : '#c2c6d6',
                weight: isSelected ? 2 : isHighlighted ? 2 : 0.5,
                dashArray: isSelected || isHighlighted ? undefined : '4',
              };
            }

            return {
              fillColor: scoreToColor(score),
              fillOpacity,
              color: isSelected ? '#3F82F7' : isHighlighted ? '#3F82F7' : 'transparent',
              weight: isSelected ? 2 : isHighlighted ? 2 : 0,
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
                  backgroundColor: getStatus(hoveredCell.compositeScore).bg,
                  borderColor: getStatus(hoveredCell.compositeScore).color + '40',
                  color: getStatus(hoveredCell.compositeScore).color,
                }}
              >
                {getStatus(hoveredCell.compositeScore).label}
              </span>
            </div>

            <div className="flex items-end gap-1 mb-2">
              <div className="font-data-kpi text-xl text-on-surface font-bold">
                {(hoveredCell.compositeScore * 100).toFixed(1)}%
              </div>

              <div className="text-[11px] mb-1 flex items-center gap-0.5">
                <span
                  className="material-symbols-outlined text-sm"
                  style={{
                    color: hoveredCell.compositeScore > 0.5 ? '#43B982' : '#E74F3D',
                  }}
                >
                  {hoveredCell.compositeScore > 0.5 ? 'trending_up' : 'trending_down'}
                </span>
              </div>
            </div>

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
