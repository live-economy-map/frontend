// frontend/src/components/case-studies/evidenceTier.ts

import type { CaseStudySummary } from '@/types';

// Define the evidence tier type explicitly
export type EvidenceTier = 'OFFICIAL' | 'MARKET_REPORT' | 'INFRASTRUCTURE' | 'LOCAL_NEWS';

// Use the explicit type (non-optional) for the Record keys
const LABELS: Record<EvidenceTier, string> = {
  OFFICIAL: 'Official',
  MARKET_REPORT: 'Market Report',
  INFRASTRUCTURE: 'Infrastructure',
  LOCAL_NEWS: 'Local News',
};

// Default label for when tier is undefined or not found
const DEFAULT_LABEL = 'Unknown';

export function evidenceTierLabel(tier: CaseStudySummary['evidenceTier']): string {
  if (!tier) return DEFAULT_LABEL;
  return LABELS[tier as EvidenceTier] || DEFAULT_LABEL;
}

// Get color/ styling info for evidence tier
export function getEvidenceTierInfo(tier?: string) {
  const tiers: Record<EvidenceTier, { label: string; bg: string; text: string; border: string }> = {
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

  if (!tier || !(tier in tiers)) {
    return {
      label: 'UNKNOWN',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
    };
  }

  return tiers[tier as EvidenceTier];
}
