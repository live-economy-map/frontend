// src/components/map/CellDetailPanel.tsx
import { useState } from 'react';
import { useCellDetail } from '@/hooks/useMap';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedAreasApi } from '@/api/savedAreas.api';
import { alertsApi } from '@/api/alerts.api';
import { watchlistsApi } from '@/api/watchlists.api';
import { formatApiError } from '@/lib/axios';
import {
  Bookmark,
  Bell,
  Download,
  FileText,
  Layers,
  Plus,
  Loader2,
  ChevronDown,
} from 'lucide-react';

import RequestReportModal from '@/components/reports/RequestReportModal';
import ExportModal from '@/components/export/ExportModal';
import CellChatAssistant from '@/components/map/CellChatAssistant';
import { cn } from '@/lib/utils';

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
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWatchlistDropdownOpen, setIsWatchlistDropdownOpen] = useState(false);

  // Check if cell is bookmarked
  const { data: savedAreas = [] } = useQuery({
    queryKey: ['saved-areas'],
    queryFn: () => savedAreasApi.getSavedAreas(),
    enabled: isAuthenticated,
  });

  const savedRecord = savedAreas.find((s) => s.gridCellId === cellId);
  const isSaved = Boolean(savedRecord);

  // Check if cell has an alert
  const { data: alerts = [] } = useQuery({
    queryKey: ['my-alerts'],
    queryFn: () => alertsApi.getMyAlerts(),
    enabled: isAuthenticated,
  });

  const existingAlert = alerts.find((a) => a.gridCellId === cellId);
  const isAlertActive = Boolean(existingAlert && existingAlert.isActive);

  // Fetch watchlists for "Add to Watchlist" dropdown
  const { data: watchlists = [] } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistsApi.getWatchlists(),
    enabled: isAuthenticated && isWatchlistDropdownOpen,
  });

  // Bookmark toggle mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isSaved && savedRecord) {
        await savedAreasApi.deleteSavedArea(savedRecord.id);
        return false;
      } else {
        await savedAreasApi.createSavedArea({
          gridCellId: cellId,
          customName: data?.areaLabel || undefined,
        });
        return true;
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['saved-areas'] });
      toast.success(saved ? 'Area added to bookmarks!' : 'Area removed from bookmarks.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Bookmark action failed' });
    },
  });

  // Alert toggle mutation
  const alertMutation = useMutation({
    mutationFn: async () => {
      if (existingAlert) {
        await alertsApi.updateAlert(existingAlert.id, { isActive: !existingAlert.isActive });
        return !existingAlert.isActive;
      } else {
        await alertsApi.createAlert({ gridCellId: cellId, thresholdDelta: 0.15 });
        return true;
      }
    },
    onSuccess: (active) => {
      queryClient.invalidateQueries({ queryKey: ['my-alerts'] });
      toast.success(
        active
          ? 'Spatial alert active! You will be notified when activity shifts > 15%.'
          : 'Spatial alert disabled.'
      );
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Alert toggle failed' });
    },
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: ({ watchlistId }: { watchlistId: string }) =>
      watchlistsApi.addItem(watchlistId, { gridCellId: cellId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setIsWatchlistDropdownOpen(false);
      toast.success('Cell added to watchlist!');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Could not add to watchlist' });
    },
  });

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleAlertClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    alertMutation.mutate();
  };

  const activeSignal = data?.signals?.find((s) => s.source === activeLayer);
  const displayScore = activeSignal ? activeSignal.normalizedValue : (data?.compositeScore ?? 0);
  const scoreTitle = activeLayer
    ? (METRIC_LABELS[activeLayer] ?? `${activeLayer} Signal`)
    : 'Composite Score';

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 md:relative md:inset-auto w-full md:w-[350px] bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-l border-border-base shadow-xl z-40 md:z-10 flex flex-col h-auto md:h-full max-h-[75vh] md:max-h-full overflow-y-auto rounded-t-2xl md:rounded-none">
        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between border-b border-border-base bg-gray-50/50 dark:bg-gray-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Cell Inspection</h2>
              {activeLayer && (
                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">
                  {activeLayer} Filtered
                </span>
              )}
            </div>
            {data && (
              <div className="text-xs text-text-muted mt-0.5 font-mono">
                {data.cellId.slice(0, 10)} {data.areaLabel ? `• ${data.areaLabel}` : ''}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Bookmark button */}
            <button
              onClick={handleBookmarkClick}
              disabled={bookmarkMutation.isPending}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark cell'}
              title={isSaved ? 'Remove from Saved Areas' : 'Save Area / Bookmark'}
              className={cn(
                'p-1.5 rounded-lg transition-all cursor-pointer',
                isSaved
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 shadow-xs'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
            </button>

            {/* Close panel */}
            <button
              onClick={onClose}
              className="text-text-muted hover:text-gray-900 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg leading-none">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 space-y-5">
          {isLoading && (
            <div className="text-xs text-text-muted animate-pulse py-8 text-center">
              Loading cell analytics…
            </div>
          )}
          {isError && (
            <div className="text-xs text-[#E74F3D] py-4">No data available for this cell.</div>
          )}

          {data && (
            <>
              {/* Score Card */}
              <div className="bg-white dark:bg-gray-850 rounded-2xl p-4 border border-border-base shadow-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted font-medium">{scoreTitle}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
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
                        displayScore >= 0.7
                          ? '#F5A34A'
                          : displayScore >= 0.4
                            ? '#BFA012'
                            : '#43B982',
                    }}
                  >
                    {displayScore >= 0.7 ? 'High' : displayScore >= 0.4 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(displayScore * 100).toFixed(1)}
                </div>
                {activeSignal ? (
                  <div className="text-xs text-text-muted">
                    Raw Value:{' '}
                    <span className="font-mono text-gray-900 dark:text-white">
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
                    <span className="capitalize font-semibold">
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
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    Composite Trend Trajectory
                  </h3>
                  <span className="text-[10px] text-text-muted">Historical Series</span>
                </div>
                <div className="h-20 w-full bg-white dark:bg-gray-850 rounded-2xl border border-border-base p-1.5">
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
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    Signal Contribution Breakdown
                  </h3>
                </div>
                <div className="space-y-1 bg-white dark:bg-gray-850 rounded-2xl p-3 border border-border-base">
                  {data.signals.map((signal) => {
                    const isSelectedMetric = signal.source === activeLayer;
                    return (
                      <div
                        key={signal.source}
                        className={cn(
                          'flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors',
                          isSelectedMetric
                            ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          {isSelectedMetric && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          )}
                          <span className="text-xs">{signal.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-text-muted font-mono">
                            raw: {signal.rawValue.toFixed(1)}
                          </span>
                          <span className="text-xs font-mono font-bold">
                            {(signal.normalizedValue * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spatial Anomaly Alert Toggle */}
              <div className="p-3 rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell
                    className={cn('w-4 h-4', isAlertActive ? 'text-amber-500' : 'text-gray-400')}
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Spatial Anomaly Alert
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Alert me when activity changes by &gt; 15%
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAlertClick}
                  disabled={alertMutation.isPending}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                    isAlertActive
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
                  )}
                >
                  {alertMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isAlertActive ? (
                    'Active'
                  ) : (
                    'Enable'
                  )}
                </button>
              </div>

              {/* Action Buttons: Request Report, Export, Add to Watchlist */}
              <div className="space-y-2 pt-2 border-t border-border-base">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Request Deep-Dive Analysis</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Data</span>
                  </button>

                  {/* Add to Watchlist Dropdown */}
                  <div className="relative flex-1">
                    <button
                      onClick={() => {
                        if (!isAuthenticated) openAuthModal('login');
                        else setIsWatchlistDropdownOpen(!isWatchlistDropdownOpen);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Watchlist</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {isWatchlistDropdownOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Add to Watchlist
                        </div>
                        {watchlists.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-400">
                            No watchlists created yet.
                          </div>
                        ) : (
                          watchlists.map((wl) => (
                            <button
                              key={wl.id}
                              onClick={() => addToWatchlistMutation.mutate({ watchlistId: wl.id })}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-indigo-50 text-gray-800 dark:text-gray-200 flex items-center justify-between cursor-pointer"
                            >
                              <span className="truncate">{wl.name}</span>
                              <Plus className="w-3 h-3 text-indigo-600" />
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Spatial AI Chat Assistant */}
              <CellChatAssistant
                cellId={cellId}
                areaLabel={data.areaLabel}
                aiSummary={data.aiSummary}
                compositeScore={data.compositeScore}
                trend={data.trend}
              />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <RequestReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultCellId={cellId}
        defaultAreaLabel={data?.areaLabel || undefined}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedCellId={cellId}
      />
    </>
  );
}
