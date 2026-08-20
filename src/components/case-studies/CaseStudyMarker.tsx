import type { CaseStudySummary } from '@/types';

interface CaseStudyMarkerProps {
  caseStudy: CaseStudySummary;
  isSelected: boolean;
  onClick: (caseStudyId: string) => void;
}

// Visually distinct from grid-cell shading so a case study is never mistaken
// for a scored cell (NFR: distinguishes detected signal from confirmed case
// study). No data fetching here — data always present via parent's list.
export default function CaseStudyMarker({ caseStudy, isSelected, onClick }: CaseStudyMarkerProps) {
  return (
    <button
      onClick={() => onClick(caseStudy.id)}
      aria-label={caseStudy.name}
      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform ${
        isSelected ? 'scale-125 bg-primary-hover' : 'bg-primary'
      }`}
    >
      <span className="material-symbols-outlined text-[14px] text-white">location_on</span>
    </button>
  );
}
