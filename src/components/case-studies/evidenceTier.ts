import type { CaseStudySummary } from '@/types';

const LABELS: Record<CaseStudySummary['evidenceTier'], string> = {
  OFFICIAL: 'Official',
  MARKET_REPORT: 'Market Report',
  INFRASTRUCTURE: 'Infrastructure',
  LOCAL_NEWS: 'Local News',
};

export function evidenceTierLabel(tier: CaseStudySummary['evidenceTier']) {
  return LABELS[tier];
}
