// src/pages/CaseStudiesListPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  FileText,
} from 'lucide-react';
import { useCaseStudies } from '@/hooks/usePublicCaseStudies';
import { Button } from '@/components/ui/button';
import { caseStudyDetailPath } from '@/constants';
import { getEvidenceTierInfo } from '@/components/case-studies/evidenceTier';

export default function CaseStudiesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const { data, isLoading, isError, refetch } = useCaseStudies(page, 12);

  const goToPage = (p: number) => {
    setPage(p);
    setSearchParams({ page: String(p) });
  };

  const openDetail = (caseStudyId: string) => navigate(caseStudyDetailPath(caseStudyId));

  const items = data?.items;
  // Client-side filtering across current page items for search query and tier
  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter((cs) => {
      const matchesTier = selectedTier === 'ALL' || cs.evidenceTier === selectedTier;
      const matchesSearch =
        searchQuery.trim() === '' ||
        cs.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.evidenceDescription?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [items, selectedTier, searchQuery]);

  const tierFilters = [
    { label: 'All Tiers', value: 'ALL' },
    { label: 'Official', value: 'OFFICIAL' },
    { label: 'Infrastructure', value: 'INFRASTRUCTURE' },
    { label: 'Local News', value: 'LOCAL_NEWS' },
    { label: 'Market Report', value: 'MARKET_REPORT' },
  ];

  return (
    <div className="w-full min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 space-y-10">
        {/* ── 1. Page Header ── */}
        <section className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Empirical <span className="text-blue-600">Case Studies</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed pt-1">
            Real-world analyses of economic expansions detected through satellite radiance shifts,
            building footprints, and multi-tier ground-truth corroboration across Addis Ababa.
          </p>
        </section>

        {/* ── 2. Filters & Search Bar ── */}
        <section className="bg-gray-50/80 border border-gray-100 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tier Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {tierFilters.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTier(tf.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedTier === tf.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:border-blue-200 hover:bg-blue-50/50'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case studies..."
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl py-2.5 pl-10 pr-9 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>

        {/* ── 3. Loading State ── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
              >
                <div className="h-48 bg-gray-100 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-100 animate-pulse rounded-md w-3/4" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded-md w-1/2" />
                  <div className="h-16 bg-gray-100 animate-pulse rounded-md" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded-md w-1/3 pt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 4. Error State ── */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
            <p className="text-sm font-medium text-gray-600">
              Failed to load verified case studies.
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── 5. Empty State ── */}
        {!isLoading && !isError && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No case studies found</h3>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
              {searchQuery || selectedTier !== 'ALL'
                ? 'Try adjusting your search terms or filter criteria to see matching results.'
                : 'No published case studies available yet. Check back soon for newly corroborated growth corridors.'}
            </p>
            {(searchQuery || selectedTier !== 'ALL') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTier('ALL');
                }}
                className="mt-2 text-xs rounded-xl border-gray-200"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}

        {/* ── 6. Case Studies Cards Grid ── */}
        {!isLoading && !isError && filteredItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((cs) => {
                const tierInfo = getEvidenceTierInfo(cs.evidenceTier);
                return (
                  <div
                    key={cs.id}
                    onClick={() => openDetail(cs.id)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col overflow-hidden group cursor-pointer"
                  >
                    {/* Image Section */}
                    <div className="h-48 relative overflow-hidden bg-gray-100">
                      {cs.beforeImageUrl ? (
                        <img
                          src={cs.beforeImageUrl}
                          alt={cs.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50/50 to-gray-100">
                          <Layers className="w-10 h-10 text-blue-200" />
                        </div>
                      )}

                      {/* Verified Badge */}
                      <div className="absolute top-3 right-3 bg-emerald-50/95 backdrop-blur-xs text-emerald-700 font-semibold text-[11px] px-2.5 py-1 border border-emerald-200/80 flex items-center gap-1.5 rounded-full shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {cs.name}
                        </h3>
                        {cs.evidenceTier && (
                          <span
                            className={`${tierInfo.bg} ${tierInfo.text} text-[10px] font-bold px-2 py-0.5 rounded-md border ${tierInfo.border} whitespace-nowrap shrink-0`}
                          >
                            {tierInfo.label}
                          </span>
                        )}
                      </div>

                      {cs.latitude && cs.longitude && (
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {cs.latitude.toFixed(4)}° N, {cs.longitude.toFixed(4)}° E
                          </span>
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-gray-600 mt-3 mb-6 flex-1 line-clamp-3 leading-relaxed">
                        {cs.evidenceDescription}
                      </p>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {cs.confirmedDate
                              ? new Date(cs.confirmedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Verified study'}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition-colors">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── 7. Pagination ── */}
            {data && data.total > data.limit && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(Math.min(5, Math.ceil(data.total / data.limit)))].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === page;
                  return (
                    <button
                      key={i}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  disabled={page >= Math.ceil(data.total / data.limit)}
                  onClick={() => goToPage(page + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
