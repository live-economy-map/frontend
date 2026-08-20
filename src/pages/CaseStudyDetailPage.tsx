// frontend/src/pages/CaseStudyDetailPage.tsx

import { Link, useParams, Navigate } from 'react-router-dom';
import CaseStudyDetailPanel from '@/components/case-studies/CaseStudyDetailPanel';
import { ROUTES } from '@/constants';

export default function CaseStudyDetailPage() {
  // CHANGE THIS: Match the route parameter name ':id'
  const { id } = useParams<{ id: string }>(); // Changed from 'caseStudyId' to 'id'

  // If no ID is provided, redirect back to the list
  if (!id) {
    return <Navigate to={ROUTES.CASE_STUDIES} replace />;
  }

  return (
    <div>
      <Link
        to={ROUTES.CASE_STUDIES}
        className="mb-space-lg inline-flex items-center gap-2 text-label-caps text-primary hover:text-primary-hover"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to all Case Studies
      </Link>

      {/* Pass the id to the panel */}
      <CaseStudyDetailPanel caseStudyId={id} />
    </div>
  );
}
