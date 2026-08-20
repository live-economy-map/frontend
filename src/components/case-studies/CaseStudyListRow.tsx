import { Card, CardContent } from '@/components/ui/card';
import type { CaseStudySummary } from '@/types';
import { evidenceTierLabel } from './evidenceTier';

interface CaseStudyListRowProps {
  caseStudy: CaseStudySummary;
  onClick: (caseStudyId: string) => void;
}

export default function CaseStudyListRow({ caseStudy, onClick }: CaseStudyListRowProps) {
  return (
    <Card
      onClick={() => onClick(caseStudy.id)}
      className="cursor-pointer rounded-xl border-none bg-surface-container-lowest p-space-lg soft-shadow transition-shadow hover:shadow-md"
    >
      <CardContent className="flex flex-col gap-space-sm p-0 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-card-title text-on-surface">{caseStudy.name}</p>
          <p className="text-body-sm text-text-muted">
            Score rise: {caseStudy.scoreRiseDate} · Confirmed: {caseStudy.confirmedDate}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#EAF2FF] px-3 py-1 text-label-caps uppercase text-primary">
          {caseStudy.evidenceTier === 'OFFICIAL' && (
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
          )}
          {evidenceTierLabel(caseStudy.evidenceTier)}
        </span>
      </CardContent>
    </Card>
  );
}
