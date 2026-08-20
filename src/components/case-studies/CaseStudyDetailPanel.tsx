// frontend/src/components/case-studies/CaseStudyDetailPanel.tsx

import { useCaseStudyDetail } from '@/hooks/useCaseStudies';
import BeforeAfterSlider from './BeforeAfterSlider';
import { evidenceTierLabel } from './evidenceTier';

interface CaseStudyDetailPanelProps {
  caseStudyId: string;
  onClose?: () => void;
}

export default function CaseStudyDetailPanel({ caseStudyId, onClose }: CaseStudyDetailPanelProps) {
  const { data, isLoading, isError, error } = useCaseStudyDetail(caseStudyId);

  // Debug: Log what's happening
  console.log('CaseStudyDetailPanel Debug:', {
    caseStudyId,
    isLoading,
    isError,
    error,
    data,
    dataKeys: data ? Object.keys(data) : 'no data',
  });

  if (isLoading) {
    return <div className="animate-pulse py-space-xl text-center text-text-muted">Loading…</div>;
  }

  if (isError) {
    console.error('Error fetching case study:', error);
    return (
      <div className="py-space-xl text-center">
        <p className="text-text-muted">Failed to load case study.</p>
        <p className="text-sm text-red-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!data) {
    return <div className="py-space-xl text-center text-text-muted">Case study not found.</div>;
  }

  const hasBeforeAfter = !!data.beforeImageUrl && !!data.afterImageUrl;

  // Format dates if they are Date objects
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="mb-space-md flex items-center gap-1 text-label-caps text-primary hover:text-primary-hover"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Close
        </button>
      )}

      <span className="mb-space-sm inline-flex items-center gap-1 rounded-full bg-[#EAF2FF] px-3 py-1 text-label-caps uppercase text-primary">
        {data.evidenceTier === 'OFFICIAL' && (
          <span className="material-symbols-outlined text-[14px]">check_circle</span>
        )}
        {evidenceTierLabel(data.evidenceTier)}
      </span>

      <h1 className="mb-1 text-hero-lg-mobile text-on-surface md:text-page-title">{data.name}</h1>

      <div className="mb-space-lg grid grid-cols-2 gap-6 rounded-xl bg-surface-container-lowest p-space-lg soft-shadow">
        <div>
          <p className="mb-1 text-label-caps text-text-muted">Score Date</p>
          <p className="text-data-kpi text-on-surface">{formatDate(data.scoreRiseDate)}</p>
        </div>
        <div>
          <p className="mb-1 text-label-caps text-text-muted">Confirmed</p>
          <p className="text-data-kpi text-on-surface">{formatDate(data.confirmedDate)}</p>
        </div>
        <div>
          <p className="mb-1 text-label-caps text-text-muted">Location</p>
          <p className="text-data-kpi text-on-surface">
            {data.latitude}° N, {data.longitude}° E
          </p>
        </div>
      </div>

      {hasBeforeAfter && (
        <div className="mb-space-lg">
          <BeforeAfterSlider
            beforeImageUrl={data.beforeImageUrl as string}
            afterImageUrl={data.afterImageUrl as string}
          />
        </div>
      )}

      <div>
        <h3 className="mb-space-sm text-card-title text-on-surface">Evidence Description</h3>
        <p className="mb-space-md leading-relaxed text-text-secondary">
          {data.evidenceDescription || 'No description available.'}
        </p>
        {data.evidenceUrl && (
          <a
            href={data.evidenceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            View Original Source
          </a>
        )}
      </div>
    </div>
  );
}
