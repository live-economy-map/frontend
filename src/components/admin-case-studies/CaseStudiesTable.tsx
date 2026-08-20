// src/components/admin-case-studies/CaseStudiesTable.tsx
import { useState, useMemo } from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  Building2,
  Newspaper,
  Search,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  useAdminCaseStudiesList,
  useUpdateCaseStudy,
  useDeleteCaseStudy,
} from '@/hooks/useCaseStudies';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CaseStudyDetailDTO, EvidenceTier } from '@/types';
import { getApiErrorMessage } from '@/utils/errorHandler';

interface CaseStudiesTableProps {
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (study: CaseStudyDetailDTO) => void;
  onView: (study: CaseStudyDetailDTO) => void;
  onCreateNew: () => void;
}

export default function CaseStudiesTable({
  page,
  onPageChange,
  onEdit,
  onView,
  onCreateNew,
}: CaseStudiesTableProps) {
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'drafts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, isFetching } = useAdminCaseStudiesList(page);

  const updateMutation = useUpdateCaseStudy();
  const deleteMutation = useDeleteCaseStudy();

  const handleTogglePublish = (study: CaseStudyDetailDTO) => {
    setActionError(null);
    updateMutation.mutate(
      {
        id: study.id,
        data: { isPublished: !study.isPublished },
      },
      {
        onError: (err) => {
          setActionError(getApiErrorMessage(err, 'Failed to update publish status'));
        },
      }
    );
  };

  const handleDeleteConfirm = (id: string) => {
    setActionError(null);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
      },
      onError: (err) => {
        setActionError(getApiErrorMessage(err, 'Failed to delete case study'));
      },
    });
  };

  const items = data?.items;

  // Client-side search, tier, and publish status filtering across items
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.evidenceDescription &&
          item.evidenceDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.gridCellId && item.gridCellId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTier = selectedTier === 'ALL' || item.evidenceTier === selectedTier;

      const matchesStatus =
        filterTab === 'all' ||
        (filterTab === 'published' && Boolean(item.isPublished)) ||
        (filterTab === 'drafts' && !item.isPublished);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [items, searchQuery, selectedTier, filterTab]);

  const totalPages = Math.ceil((data?.total || 0) / (data?.limit || 10)) || 1;

  const renderTierBadge = (tier: EvidenceTier | string) => {
    switch (tier) {
      case 'OFFICIAL':
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 font-medium">
            <Shield className="w-3 h-3 text-blue-600" />
            Official
          </Badge>
        );
      case 'MARKET_REPORT':
        return (
          <Badge className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 flex items-center gap-1 font-medium">
            <FileText className="w-3 h-3 text-purple-600" />
            Market Report
          </Badge>
        );
      case 'INFRASTRUCTURE':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1 font-medium">
            <Building2 className="w-3 h-3 text-amber-600" />
            Infrastructure
          </Badge>
        );
      case 'LOCAL_NEWS':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 font-medium">
            <Newspaper className="w-3 h-3 text-emerald-600" />
            Local News
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            {tier || 'Uncategorized'}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Action Error Notification ── */}
      {actionError && (
        <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top Filter Bar & Search ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border-base shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center p-1 bg-surface-container rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              setFilterTab('all');
              onPageChange(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab('published');
              onPageChange(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'published'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Published
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab('drafts');
              onPageChange(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterTab === 'drafts'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Drafts
          </button>
        </div>

        {/* Search & Tier Dropdown */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-xs bg-gray-50/70 border border-border-base rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="h-9 px-3 text-xs bg-gray-50/70 border border-border-base rounded-xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="ALL">All Tiers</option>
            <option value="OFFICIAL">Official</option>
            <option value="MARKET_REPORT">Market Report</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="LOCAL_NEWS">Local News</option>
          </select>
        </div>
      </div>

      {/* ── Table Container ── */}
      <Card className="border border-border-base shadow-xs overflow-hidden rounded-2xl bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs text-muted-foreground font-medium">Loading case studies...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <AlertTriangle className="w-10 h-10 text-danger mb-2" />
              <h3 className="text-sm font-semibold text-gray-900">Failed to load case studies</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {getApiErrorMessage(error, 'Could not connect to the case study service.')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs"
                onClick={() => onPageChange(page)}
              >
                Retry
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">No case studies found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {searchQuery || selectedTier !== 'ALL' || filterTab !== 'all'
                  ? 'Try adjusting your search filters or active tabs.'
                  : 'Start curating ground-truth validation case studies for the map.'}
              </p>
              <Button
                onClick={onCreateNew}
                size="sm"
                className="mt-4 text-xs bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs"
              >
                + Create First Case Study
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-base bg-surface-container-low/60 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Case Study Location & Details</th>
                    <th className="py-3 px-4">Evidence Tier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-base/70">
                  {filteredItems.map((study) => {
                    const isDeleting = deletingId === study.id;
                    const isUpdating =
                      updateMutation.isPending && updateMutation.variables?.id === study.id;

                    const dateDisplay = study.confirmedDate
                      ? String(study.confirmedDate).split('T')[0]
                      : study.createdAt
                        ? new Date(study.createdAt).toISOString().split('T')[0]
                        : '—';

                    return (
                      <tr
                        key={study.id}
                        className="hover:bg-surface-container-low/40 transition-colors group"
                      >
                        {/* Name & Coordinates */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-3">
                            {study.beforeImageUrl || study.afterImageUrl ? (
                              <img
                                src={study.afterImageUrl || study.beforeImageUrl || ''}
                                alt={study.name}
                                className="w-10 h-10 rounded-lg object-cover border border-border-base shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-border-base flex items-center justify-center text-gray-400 shrink-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                            )}

                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                                {study.name}
                                {study.evidenceUrl && (
                                  <a
                                    href={study.evidenceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-primary inline-flex"
                                    title="Open Evidence Source"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-mono">
                                {study.latitude !== undefined && study.longitude !== undefined && (
                                  <span>
                                    {Number(study.latitude).toFixed(4)}°,{' '}
                                    {Number(study.longitude).toFixed(4)}°
                                  </span>
                                )}
                                {study.gridCellId && (
                                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded text-[10px]">
                                    Cell: {study.gridCellId.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Evidence Tier */}
                        <td className="py-3.5 px-4">{renderTierBadge(study.evidenceTier)}</td>

                        {/* Status Toggle Switch */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleTogglePublish(study)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              study.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                            }`}
                            title={
                              study.isPublished
                                ? 'Click to unpublish (draft)'
                                : 'Click to publish on public map'
                            }
                          >
                            {study.isPublished ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-gray-500" />
                                Draft
                              </>
                            )}
                          </button>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 font-mono text-gray-700 text-xs">
                          {dateDisplay}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isDeleting ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[11px] text-red-600 font-medium">Delete?</span>
                              <button
                                onClick={() => handleDeleteConfirm(study.id)}
                                disabled={deleteMutation.isPending}
                                className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-semibold hover:bg-red-700 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[10px] font-semibold hover:bg-gray-300 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onView(study)}
                                className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEdit(study)}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit Case Study"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingId(study.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Case Study"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination Footer ── */}
          {!isLoading && !isError && data && data.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-border-base bg-surface-container-low/30 gap-2">
              <div className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-gray-800">
                  {Math.min((page - 1) * 10 + 1, data.total)}-{Math.min(page * 10, data.total)}
                </span>{' '}
                of <span className="font-semibold text-gray-800">{data.total}</span> case studies
                {isFetching && (
                  <span className="ml-2 text-primary animate-pulse">(updating...)</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="h-8 px-2.5 text-xs rounded-lg gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>

                <span className="text-xs font-medium px-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="h-8 px-2.5 text-xs rounded-lg gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
