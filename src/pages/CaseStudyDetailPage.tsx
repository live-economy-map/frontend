// src/pages/CaseStudyDetailPage.tsx
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CaseStudyDetailPanel from '@/components/case-studies/CaseStudyDetailPanel';
import { ROUTES } from '@/constants';

export default function CaseStudyDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to={ROUTES.CASE_STUDIES} replace />;
  }

  return (
    <div className="w-full min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-6">
        <Link
          to={ROUTES.CASE_STUDIES}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to all Case Studies</span>
        </Link>

        <CaseStudyDetailPanel caseStudyId={id} />
      </div>
    </div>
  );
}
