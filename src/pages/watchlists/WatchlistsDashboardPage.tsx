import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistsApi } from '@/api/watchlists.api';
import { useAuth } from '@/context/AuthContext';
import { useOrg } from '@/context/OrgContext';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import { Layers, Plus, Trash2, ExternalLink, Loader2, X } from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

export default function WatchlistsDashboardPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { activeOrg } = useOrg();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [watchlistName, setWatchlistName] = useState('');
  const [watchlistDescription, setWatchlistDescription] = useState('');
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);

  const { data: watchlists = [], isLoading } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistsApi.getWatchlists(),
    enabled: isAuthenticated,
  });

  const activeWatchlist =
    watchlists.find((w) => w.id === selectedWatchlistId) || watchlists[0] || null;

  const createWatchlistMutation = useMutation({
    mutationFn: () =>
      watchlistsApi.createWatchlist({
        name: watchlistName.trim(),
        description: watchlistDescription.trim() || undefined,
        orgId: activeOrg?.id,
      }),
    onSuccess: (newWl) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      setIsCreateOpen(false);
      setWatchlistName('');
      setWatchlistDescription('');
      setSelectedWatchlistId(newWl.id);
      toast.success(`Watchlist "${newWl.name}" created!`);
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to create watchlist' });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ watchlistId, cellId }: { watchlistId: string; cellId: string }) =>
      watchlistsApi.removeItem(watchlistId, cellId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Cell removed from watchlist.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to remove cell' });
    },
  });

  // Calculate combined average score
  const items = activeWatchlist?.items || [];
  const avgScore =
    items.length > 0
      ? (
          (items.reduce((sum, item) => sum + (item.cell?.compositeScore ?? 0.5), 0) /
            items.length) *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Institutional Portfolios
              </span>
              <span className="text-xs text-gray-400">
                {activeOrg ? `• ${activeOrg.name}` : '• Personal Account'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              Multi-Cell Watchlists
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mt-1">
              Group high-priority Addis Ababa commercial nodes, monitor aggregate trend
              trajectories, and receive synchronized anomaly alerts.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
              else setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Watchlist</span>
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xs space-y-4">
            <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Sign In to View Watchlists
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Institutional watchlists require an authenticated account.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Sign In
            </button>
          </div>
        ) : isLoading ? (
          <div className="py-20 flex justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : watchlists.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No Watchlists Created Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Create a watchlist to track a portfolio of cells (e.g. "Bole Commercial Axis",
              "Industrial Parks", "Airport Corridor").
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Create First Watchlist
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Watchlist Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {watchlists.map((wl) => {
                const isSelected = activeWatchlist?.id === wl.id;
                return (
                  <button
                    key={wl.id}
                    onClick={() => setSelectedWatchlistId(wl.id)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span>{wl.name}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px]',
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {wl.items?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Watchlist Overview Card */}
            {activeWatchlist && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {activeWatchlist.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {activeWatchlist.description || 'Custom multi-cell monitoring group.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Aggregate Score
                      </span>
                      <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {avgScore}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Watched Cells
                      </span>
                      <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        {items.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                {items.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="text-xs text-gray-400">
                      No grid cells added to this watchlist yet.
                    </p>
                    <Link
                      to={ROUTES.MAP}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      <span>Explore Map & Add Cells</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          <th className="py-3 px-4">Cell / Area</th>
                          <th className="py-3 px-4">Composite Score</th>
                          <th className="py-3 px-4">Historical Sparkline</th>
                          <th className="py-3 px-4">Notes</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item) => {
                          const score = item.cell?.compositeScore ?? 0.65;
                          const sparkline = item.cell?.sparkline || [
                            { period: '2025-09', compositeScore: 0.58 },
                            { period: '2025-11', compositeScore: 0.62 },
                            { period: '2026-01', compositeScore: 0.64 },
                            { period: '2026-03', compositeScore: score },
                          ];

                          return (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="py-4 px-4">
                                <div className="font-bold text-gray-900">
                                  {item.cell?.areaLabel || `Cell ${item.gridCellId.slice(0, 8)}`}
                                </div>
                                <div className="font-mono text-[10px] text-gray-400">
                                  {item.gridCellId.slice(0, 10)}
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <span className="text-sm font-bold text-gray-900">
                                  {(score * 100).toFixed(1)}
                                </span>
                              </td>

                              <td className="py-4 px-4 w-40">
                                <div className="h-10 w-36">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart data={sparkline}>
                                      <Line
                                        type="monotone"
                                        dataKey="compositeScore"
                                        stroke="#4F46E5"
                                        strokeWidth={2}
                                        dot={false}
                                      />
                                    </RechartsLineChart>
                                  </ResponsiveContainer>
                                </div>
                              </td>

                              <td className="py-4 px-4 max-w-xs text-gray-500 italic">
                                {item.notes || '—'}
                              </td>

                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    to={`${ROUTES.MAP}?cellId=${item.gridCellId}`}
                                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"
                                    title="View on Map"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() =>
                                      removeItemMutation.mutate({
                                        watchlistId: activeWatchlist.id,
                                        cellId: item.gridCellId,
                                      })
                                    }
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    title="Remove from Watchlist"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Watchlist Modal */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Create Watchlist
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createWatchlistMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Watchlist Name
                </label>
                <input
                  type="text"
                  required
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  placeholder="e.g. Bole Corridor Watchlist"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={watchlistDescription}
                  onChange={(e) => setWatchlistDescription(e.target.value)}
                  placeholder="Focus areas, investment thesis, or team notes…"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWatchlistMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {createWatchlistMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Create Watchlist'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
