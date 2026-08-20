// src/components/case-studies/CaseStudyDetailPanel.tsx
import {
  Calendar,
  CheckCircle2,
  MapPin,
  ExternalLink,
  X,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useCaseStudyDetail } from '@/hooks/usePublicCaseStudies';
import BeforeAfterSlider from './BeforeAfterSlider';
import { getEvidenceTierInfo } from './evidenceTier';

interface CaseStudyDetailPanelProps {
  caseStudyId: string;
  onClose?: () => void;
}

export default function CaseStudyDetailPanel({ caseStudyId, onClose }: CaseStudyDetailPanelProps) {
  const { data, isLoading, isError } = useCaseStudyDetail(caseStudyId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-6 bg-gray-100 rounded-md w-1/4" />
        <div className="h-10 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-72 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-16 text-center bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Case study not found or unavailable.</p>
        <p className="text-xs text-gray-500">Please return to the list to select another study.</p>
      </div>
    );
  }

  const hasBeforeAfter = !!data.beforeImageUrl && !!data.afterImageUrl;
  const tierInfo = getEvidenceTierInfo(data.evidenceTier);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 bg-white">
      {/* Top action / Close bar if mounted as a drawer */}
      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      )}

      {/* Header & Badges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`${tierInfo.bg} ${tierInfo.text} text-xs font-bold px-3 py-1 rounded-lg border ${tierInfo.border} uppercase`}
          >
            {tierInfo.label}
          </span>
          <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Empirically Verified</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {data.name}
        </h1>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Anomaly Rise Date</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-gray-900">
            {formatDate(data.scoreRiseDate)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed Date</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-gray-900">
            {formatDate(data.confirmedDate)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Coordinates</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-gray-900">
            {data.latitude?.toFixed(4)}° N, {data.longitude?.toFixed(4)}° E
          </p>
        </div>
      </div>

      {/* Satellite Imagery Comparison */}
      {hasBeforeAfter && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">
            Satellite Imagery Anomaly Comparison
          </h2>
          <BeforeAfterSlider
            beforeImageUrl={data.beforeImageUrl as string}
            afterImageUrl={data.afterImageUrl as string}
          />
        </div>
      )}

      {/* Narrative & Evidence Description */}
      <div className="space-y-4 rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <FileText className="w-4 h-4" />
          <span>Ground Truth Evidence Record</span>
        </div>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          {data.evidenceDescription || 'No detailed evidence description provided.'}
        </p>

        {data.evidenceUrl && (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <a
              href={data.evidenceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>View Source & Verification Notice</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
