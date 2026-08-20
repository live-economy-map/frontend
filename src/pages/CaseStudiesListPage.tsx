// frontend/src/pages/CaseStudiesListPage.tsx

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCaseStudies } from '@/hooks/useCaseStudies';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { caseStudyDetailPath } from '@/constants';

export default function CaseStudiesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const { data, isLoading, isError, refetch } = useCaseStudies(page);

  const goToPage = (p: number) => {
    setPage(p);
    setSearchParams({ page: String(p) });
  };

  const openDetail = (caseStudyId: string) => navigate(caseStudyDetailPath(caseStudyId));

  // Get evidence tier color and label
  const getEvidenceTierInfo = (tier?: string) => {
    const tiers: Record<string, { label: string; bg: string; text: string; border: string }> = {
      OFFICIAL: {
        label: 'OFFICIAL',
        bg: 'bg-[#EAF2FF]',
        text: 'text-primary',
        border: 'border-primary/20',
      },
      INFRASTRUCTURE: {
        label: 'INFRASTRUCTURE',
        bg: 'bg-[#F3E8FF]',
        text: 'text-[#9333EA]',
        border: 'border-[#9333EA]/20',
      },
      LOCAL_NEWS: {
        label: 'LOCAL NEWS',
        bg: 'bg-[#EAF2FF]',
        text: 'text-primary',
        border: 'border-primary/20',
      },
      MARKET_REPORT: {
        label: 'MARKET REPORT',
        bg: 'bg-[#FFF3E0]',
        text: 'text-[#F5A34A]',
        border: 'border-[#F5A34A]/20',
      },
    };
    return tier ? tiers[tier] || tiers.OFFICIAL : tiers.OFFICIAL;
  };

  return (
    <div>
      <h1 className="mb-2 text-hero-lg-mobile text-on-surface md:text-page-title">Case Studies</h1>
      <p className="mb-space-lg text-text-secondary max-w-2xl">
        Real-world analysis of economic activity detected through satellite imagery, human mobility
        patterns, and infrastructure signals, providing insights where traditional metrics fall
        short.
      </p>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-white p-4 rounded-xl card-shadow border border-border-base">
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Evidence Tier Filter */}
          <div className="relative w-full sm:w-auto">
            <select className="appearance-none w-full sm:w-48 bg-background border border-border-base text-on-surface font-body-sm rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors">
              <option>All Tiers</option>
              <option>OFFICIAL</option>
              <option>INFRASTRUCTURE</option>
              <option>LOCAL NEWS</option>
              <option>MARKET REPORT</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-muted text-sm">search</span>
          </div>
          <input
            className="w-full bg-background border border-border-base text-on-surface font-body-sm rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="Search case studies..."
            type="text"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl card-shadow border border-border-base overflow-hidden"
            >
              <div className="h-48 bg-surface-container animate-pulse" />
              <div className="p-lg space-y-3">
                <div className="h-6 bg-surface-container animate-pulse rounded w-3/4" />
                <div className="h-4 bg-surface-container animate-pulse rounded w-1/2" />
                <div className="h-20 bg-surface-container animate-pulse rounded" />
                <div className="h-4 bg-surface-container animate-pulse rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-space-md py-space-xl text-center">
          <p className="text-text-muted">Failed to load case studies.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          title="No published case studies yet"
          description="Check back later for verified growth observations."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((cs) => {
              const tierInfo = getEvidenceTierInfo(cs.evidenceTier);
              return (
                <div
                  key={cs.id}
                  className="bg-white card-shadow border border-border-base overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300 rounded-xl cursor-pointer"
                  onClick={() => openDetail(cs.id)}
                >
                  {/* Image Section */}
                  <div className="h-48 relative">
                    {cs.beforeImageUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        src={cs.beforeImageUrl}
                        alt={cs.name}
                        onError={(e) => {
                          // Fallback image if the URL fails to load
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/800x400/e0e2e7/52627A?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    {/* All items in public list are published - show verified badge */}
                    <div className="absolute top-3 right-3 bg-[#EAF8F2] text-[#43B982] font-label-caps text-label-caps px-2 py-1 border border-[#43B982]/20 flex items-center gap-1 rounded-full font-bold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Verified
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-lg flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-card-title text-card-title text-on-surface mb-1 line-clamp-1">
                          {cs.name}
                        </h3>
                        {cs.latitude && cs.longitude && (
                          <p className="text-text-muted font-body-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              location_on
                            </span>
                            {cs.latitude.toFixed(4)}, {cs.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                      {cs.evidenceTier && (
                        <span
                          className={`${tierInfo.bg} ${tierInfo.text} font-label-caps text-label-caps px-2 py-1 rounded border ${tierInfo.border} whitespace-nowrap ml-2`}
                        >
                          {tierInfo.label}
                        </span>
                      )}
                    </div>

                    <p className="text-on-surface-variant font-body-sm mt-3 mb-6 flex-grow line-clamp-3">
                      {cs.evidenceDescription}
                    </p>

                    <div className="pt-4 border-t border-border-base flex justify-between items-center">
                      <div className="flex items-center gap-2 text-text-muted font-body-sm">
                        <span className="material-symbols-outlined text-[16px]">
                          calendar_today
                        </span>
                        {cs.confirmedDate ? (
                          new Date(cs.confirmedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          <span>Verified case study</span>
                        )}
                      </div>
                      <div className="text-primary font-body-sm font-semibold hover:text-[#3275EC] flex items-center gap-1 transition-colors">
                        View Details
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data.total > data.limit && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-base text-text-muted hover:bg-surface-container hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {[...Array(Math.min(5, Math.ceil(data.total / data.limit)))].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                return (
                  <button
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-body-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-white font-semibold'
                        : 'border border-border-base text-on-surface hover:bg-surface-container hover:text-primary'
                    }`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {Math.ceil(data.total / data.limit) > 5 && (
                <>
                  <span className="text-text-muted mx-1">...</span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-base text-on-surface hover:bg-surface-container hover:text-primary transition-colors font-body-sm"
                    onClick={() => goToPage(Math.ceil(data.total / data.limit))}
                  >
                    {Math.ceil(data.total / data.limit)}
                  </button>
                </>
              )}

              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border-base text-text-muted hover:bg-surface-container hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page >= Math.ceil(data.total / data.limit)}
                onClick={() => goToPage(page + 1)}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
