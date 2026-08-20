// src/components/map/CellDetailPanel.tsx
import { useCellDetail } from '@/hooks/useMap';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface CellDetailPanelProps {
  cellId: string;
  period: string | undefined;
  onClose: () => void;
}

const TREND_ICON: Record<string, { icon: string; color: string }> = {
  up: { icon: 'trending_up', color: '#43B982' },
  down: { icon: 'trending_down', color: '#E74F3D' },
  flat: { icon: 'trending_flat', color: '#8290A7' },
};

export default function CellDetailPanel({ cellId, period, onClose }: CellDetailPanelProps) {
  const { data, isLoading, isError } = useCellDetail(cellId, period);

  return (
    <div className="fixed inset-x-0 bottom-0 md:relative md:inset-auto w-full md:w-[340px] bg-surface-container-lowest border-t md:border-t-0 md:border-l border-border-base shadow-ambient z-40 md:z-10 flex flex-col h-auto md:h-full max-h-[70vh] md:max-h-full overflow-y-auto rounded-t-xl md:rounded-none">
      <div className="px-space-lg py-space-md flex items-start justify-between border-b border-border-base">
        <div>
          <h2 className="text-sm font-semibold text-on-surface">Cell Details</h2>
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
                <span className="text-xs text-text-muted font-medium">Composite Score</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                  style={{
                    backgroundColor:
                      data.compositeScore >= 0.7
                        ? '#F5A34A20'
                        : data.compositeScore >= 0.4
                          ? '#F3D96A20'
                          : '#69C79A20',
                    borderColor:
                      data.compositeScore >= 0.7
                        ? '#F5A34A40'
                        : data.compositeScore >= 0.4
                          ? '#F3D96A40'
                          : '#69C79A40',
                    color:
                      data.compositeScore >= 0.7
                        ? '#F5A34A'
                        : data.compositeScore >= 0.4
                          ? '#9BD6A9'
                          : '#69C79A',
                  }}
                >
                  {data.compositeScore >= 0.7
                    ? 'High'
                    : data.compositeScore >= 0.4
                      ? 'Medium'
                      : 'Low'}
                </span>
              </div>
              <div className="text-2xl font-bold text-on-surface mb-0.5">
                {(data.compositeScore * 100).toFixed(1)}
              </div>
              <div
                className="flex items-center gap-1 text-xs"
                style={{ color: TREND_ICON[data.trend].color }}
              >
                <span className="material-symbols-outlined text-sm">
                  {TREND_ICON[data.trend].icon}
                </span>
                <span className="capitalize">
                  {data.trend === 'up' ? 'Rising' : data.trend === 'down' ? 'Declining' : 'Stable'}
                </span>
                <span className="text-text-muted ml-1">from previous period</span>
              </div>
            </div>

            {/* Sparkline Chart */}
            <div>
              <h3 className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1">
                Trend
              </h3>
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
              <h3 className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1">
                Signal Contribution
              </h3>
              <div className="space-y-1 bg-surface rounded-lg p-space-md border border-border-base">
                {data.signals.map((signal) => (
                  <div key={signal.source} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-on-surface">{signal.source}</span>
                    <span className="text-xs text-text-muted">
                      {signal.normalizedValue.toFixed(2)}
                    </span>
                  </div>
                ))}
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
