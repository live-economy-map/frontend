// src/types/dto.ts

export type EvidenceTier = 'OFFICIAL' | 'MARKET_REPORT' | 'INFRASTRUCTURE' | 'LOCAL_NEWS';

export interface LandingHighlightStatsDTO {
  publishedCaseStudyCount: number;
  lastDataRefresh: string | null;
}

export interface LandingContentDTO {
  tagline: string;
  intro: string;
  highlightStats: LandingHighlightStatsDTO;
}

export interface CaseStudySummaryDTO {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  scoreRiseDate: string;
  confirmedDate: string;
  evidenceTier: EvidenceTier;
  isPublished: boolean;
  gridCellId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseStudyDetailDTO extends CaseStudySummaryDTO {
  evidenceDescription: string;
  evidenceUrl: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
}

export interface AdminCaseStudyPayload {
  name: string;
  latitude: number;
  longitude: number;
  gridCellId?: string;
  evidenceDescription: string;
  evidenceUrl?: string | null;
  evidenceTier?: EvidenceTier;
  scoreRiseDate: string;
  confirmedDate: string;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  isPublished?: boolean;
}

export interface DiscoveryCandidate {
  summary: string;
  sourceUrl: string;
  suggestedEvidenceTier: EvidenceTier | string;
  mentionedDate: string;
  title?: string;
  areaFocus?: string;
  confidenceScore?: number;
  latitude?: number;
  longitude?: number;
}

export interface DiscoverCandidatesDTO {
  candidates: DiscoveryCandidate[];
  areaFocus?: string;
  totalFound?: number;
  summary?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}
