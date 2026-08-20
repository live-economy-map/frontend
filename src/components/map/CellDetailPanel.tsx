// src/components/map/CellDetailPanel.tsx
import { useCellDetail } from '@/hooks/useMap';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CellDetailPanelProps {
  cellId: string;
  period: string | undefined;
  activeLayer?: 'VIIRS' | 'GHSL' | 'RWI' | null;
  onClose: () => void;
}

const TREND_ICON: Record<string, { icon: string; color: string }> = {
  up: { icon: 'trending_up', color: '#43B982' },
  down: { icon: 'trending_down', color: '#E74F3D' },
  flat: { icon: 'trending_flat', color: '#8290A7' },
};

const METRIC_LABELS: Record<string, string> = {
  VIIRS: 'VIIRS Nightlights',
  GHSL: 'GHSL Human Settlement',
  RWI: 'Relative Wealth Index',
};

export default function CellDetailPanel({
  cellId,
  period,
  activeLayer,
  onClose,
}: CellDetailPanelProps) {
  const { data, isLoading, isError } = useCellDetail(cellId, period);

  const activeSignal = data?.signals?.find((s) => s.source === activeLayer);
  const displayScore = activeSignal ? activeSignal.normalizedValue : (data?.compositeScore ?? 0);
  const scoreTitle = activeLayer
    ? (METRIC_LABELS[activeLayer] ?? `${activeLayer} Signal`)
    : 'Composite Score';

  return (
    <div className="fixed inset-x-0 bottom-0 md:relative md:inset-auto w-full md:w-[340px] bg-surface-container-lowest border-t md:border-t-0 md:border-l border-border-base shadow-ambient z-40 md:z-10 flex flex-col h-auto md:h-full max-h-[70vh] md:max-h-full overflow-y-auto rounded-t-xl md:rounded-none">
      <div className="px-space-lg py-space-md flex items-start justify-between border-b border-border-base">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-on-surface">Cell Details</h2>
            {activeLayer && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                {activeLayer} Filtered
              </span>
            )}
          </div>
          {data && (
            <div className="text-xs text-text-muted mt-0.5">
              {data.cellId.slice(0, 8)} {data.areaLabel ? `• ${data.areaLabel}` : ''}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-on-surface transition-colors p-1 -m-1"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <div className="p-space-lg flex-1 space-y-space-lg">
        {isLoading && (
          <div className="text-xs text-text-muted animate-pulse">Loading cell data…</div>
        )}
        {isError && <div className="text-xs text-[#E74F3D]">No data available for this cell.</div>}

        {data && (
          <>
            {/* Score Card */}
            <div className="bg-surface rounded-lg p-space-md border border-border-base shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-text-muted font-medium">{scoreTitle}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                  style={{
                    backgroundColor:
                      displayScore >= 0.7
                        ? '#F5A34A20'
                        : displayScore >= 0.4
                          ? '#F3D96A20'
                          : '#69C79A20',
                    borderColor:
                      displayScore >= 0.7
                        ? '#F5A34A40'
                        : displayScore >= 0.4
                          ? '#F3D96A40'
                          : '#69C79A40',
                    color:
                      displayScore >= 0.7 ? '#F5A34A' : displayScore >= 0.4 ? '#9BD6A9' : '#69C79A',
                  }}
                >
                  {displayScore >= 0.7 ? 'High' : displayScore >= 0.4 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="text-2xl font-bold text-on-surface mb-0.5">
                {(displayScore * 100).toFixed(1)}
              </div>
              {activeSignal ? (
                <div className="text-xs text-text-muted">
                  Raw Value:{' '}
                  <span className="font-mono text-on-surface">
                    {activeSignal.rawValue.toFixed(2)}
                  </span>
                  {data.compositeScore !== undefined && (
                    <span className="ml-2 text-[11px]">
                      (Composite: {(data.compositeScore * 100).toFixed(1)})
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: TREND_ICON[data.trend].color }}
                >
                  <span className="material-symbols-outlined text-sm">
                    {TREND_ICON[data.trend].icon}
                  </span>
                  <span className="capitalize">
                    {data.trend === 'up'
                      ? 'Rising'
                      : data.trend === 'down'
                        ? 'Declining'
                        : 'Stable'}
                  </span>
                  <span className="text-text-muted ml-1">from previous period</span>
                </div>
              )}
            </div>

            {/* Sparkline Chart */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">
                  Composite Trend
                </h3>
                <span className="text-[10px] text-text-muted">Historical</span>
              </div>
              <div className="h-24 w-full bg-surface rounded-lg border border-border-base p-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.sparkline}>
                    <Line
                      type="monotone"
                      dataKey="compositeScore"
                      stroke="#3F82F7"
                      strokeWidth={2}
                      dot={false}
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Signal Contribution */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[10px] text-text-muted uppercase font-semibold tracking-wider">
                  Signal Contribution
                </h3>
                {activeLayer && (
                  <span className="text-[10px] text-primary font-medium">
                    Filtered on {activeLayer}
                  </span>
                )}
              </div>
              <div className="space-y-1 bg-surface rounded-lg p-space-md border border-border-base">
                {data.signals.map((signal) => {
                  const isSelectedMetric = signal.source === activeLayer;
                  return (
                    <div
                      key={signal.source}
                      className={`flex items-center justify-between py-1 px-2 rounded-md transition-colors ${
                        isSelectedMetric
                          ? 'bg-primary/10 border border-primary/30 font-semibold text-primary'
                          : 'hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isSelectedMetric && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        <span className="text-xs">{signal.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-text-muted font-mono">
                          raw: {signal.rawValue.toFixed(1)}
                        </span>
                        <span className="text-xs font-mono">
                          {(signal.normalizedValue * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Summary */}
            <div>
              <h3 className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1">
                AI Summary
              </h3>
              <div className="bg-surface rounded-lg p-space-md border border-border-base">
                <p className="text-xs text-on-surface leading-relaxed">
                  {data.aiSummary ?? (
                    <span className="text-text-muted italic">Summary unavailable</span>
                  )}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
