import { useCaseStudyDetail } from '@/hooks/useCaseStudies';
import BeforeAfterSlider from './BeforeAfterSlider';
import { evidenceTierLabel } from './evidenceTier';

interface CaseStudyDetailPanelProps {
  caseStudyId: string;
  onClose?: () => void;
}

export default function CaseStudyDetailPanel({ caseStudyId, onClose }: CaseStudyDetailPanelProps) {
  const { data, isLoading, isError } = useCaseStudyDetail(caseStudyId);

  if (isLoading) {
    return <div className="animate-pulse py-space-xl text-center text-text-muted">Loading…</div>;
  }

  // A 404 (nonexistent or unpublished caseStudyId) and a network error are
  // rendered the same generic way here; the page-level distinction between
  // "not found" and "network error" lives in CaseStudyDetailPage.
  if (isError || !data) {
    return <div className="py-space-xl text-center text-text-muted">Case study not found.</div>;
  }

  const hasBeforeAfter = !!data.beforeImageUrl && !!data.afterImageUrl;

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
          <p className="text-data-kpi text-on-surface">{data.scoreRiseDate}</p>
        </div>
        <div>
          <p className="mb-1 text-label-caps text-text-muted">Confirmed</p>
          <p className="text-data-kpi text-on-surface">{data.confirmedDate}</p>
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
          {data.evidenceDescription}
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
