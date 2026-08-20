// frontend/src/components/case-studies/CaseStudyCard.tsx

import type { CaseStudySummary } from '@/types';

interface CaseStudyCardProps {
  caseStudy: CaseStudySummary;
  onClick: (id: string) => void;
}

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

export default function CaseStudyCard({ caseStudy, onClick }: CaseStudyCardProps) {
  const tierInfo = getEvidenceTierInfo(caseStudy.evidenceTier);

  return (
    <div
      className="bg-white card-shadow border border-border-base overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300 rounded-xl cursor-pointer"
      onClick={() => onClick(caseStudy.id)}
    >
      {/* Image Section */}
      <div className="h-48 relative">
        {caseStudy.beforeImageUrl ? (
          <img
            className="w-full h-full object-cover"
            src={caseStudy.beforeImageUrl}
            alt={caseStudy.name}
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
        {caseStudy.isPublished && (
          <div className="absolute top-3 right-3 bg-[#EAF8F2] text-[#43B982] font-label-caps text-label-caps px-2 py-1 border border-[#43B982]/20 flex items-center gap-1 rounded-full font-bold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Verified
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-lg flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-card-title text-card-title text-on-surface mb-1 line-clamp-1">
              {caseStudy.name}
            </h3>
            {caseStudy.latitude && caseStudy.longitude && (
              <p className="text-text-muted font-body-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {caseStudy.latitude.toFixed(4)}, {caseStudy.longitude.toFixed(4)}
              </p>
            )}
          </div>
          {caseStudy.evidenceTier && (
            <span
              className={`${tierInfo.bg} ${tierInfo.text} font-label-caps text-label-caps px-2 py-1 rounded border ${tierInfo.border} whitespace-nowrap ml-2`}
            >
              {tierInfo.label}
            </span>
          )}
        </div>

        <p className="text-on-surface-variant font-body-sm mt-3 mb-6 flex-grow line-clamp-3">
          {caseStudy.evidenceDescription}
        </p>

        <div className="pt-4 border-t border-border-base flex justify-between items-center">
          <div className="flex items-center gap-2 text-text-muted font-body-sm">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {new Date(caseStudy.confirmedDate).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="text-primary font-body-sm font-semibold hover:text-[#3275EC] flex items-center gap-1 transition-colors">
            View Details
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
}
