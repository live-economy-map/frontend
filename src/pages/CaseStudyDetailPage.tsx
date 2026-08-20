import { Link, useParams } from 'react-router-dom';
import CaseStudyDetailPanel from '@/components/case-studies/CaseStudyDetailPanel';
import { ROUTES } from '@/constants';

export default function CaseStudyDetailPage() {
  const { caseStudyId } = useParams<{ caseStudyId: string }>();

  return (
    <div>
      <Link
        to={ROUTES.CASE_STUDIES}
        className="mb-space-lg inline-flex items-center gap-2 text-label-caps text-primary hover:text-primary-hover"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to all Case Studies
      </Link>

      {/* No onClose — this is the standalone page, not an overlay (per 8-3) */}
      <CaseStudyDetailPanel caseStudyId={caseStudyId ?? ''} />
    </div>
  );
}
