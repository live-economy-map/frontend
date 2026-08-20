// src/types/index.ts
import type { Polygon } from 'geojson';

// API response shape matching your backend's ApiResponse class
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// ---- Growth Map & Exploration ----
export interface DataSourceSignal {
  source: 'VIIRS' | 'GHSL' | 'RWI';
  rawValue: number;
  normalizedValue: number;
}

export interface GrowthCell {
  cellId: string;
  cellRow: number;
  cellCol: number;
  boundaryGeoJson: Polygon;
  compositeScore: number;
  isComplete: boolean;
}

export interface CellDetail {
  cellId: string;
  period: string;
  areaLabel: string | null;
  compositeScore: number;
  isComplete: boolean;
  trend: 'up' | 'down' | 'flat';
  sparkline: { period: string; compositeScore: number }[];
  signals: DataSourceSignal[];
  aiSummary: string | null;
  lastUpdated: string;
}

export interface RawLayerCell {
  cellId: string;
  normalizedValue: number;
}

export interface MapSearchResult {
  parsedFilters: { areaLabel?: string; period?: string; signalFocus?: string } | null;
  cells: { cellId: string; compositeScore: number }[];
  message?: string;
}

// ---- Case Studies & Validation ----
export interface CaseStudySummary {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  scoreRiseDate: string;
  confirmedDate: string;
  evidenceTier: 'OFFICIAL' | 'MARKET_REPORT' | 'INFRASTRUCTURE' | 'LOCAL_NEWS';
}

export interface CaseStudyDetail extends CaseStudySummary {
  evidenceDescription: string;
  evidenceUrl: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
}

// ---- Site Content & Onboarding ----
export interface AboutContentDTO {
  stats: {
    countriesMapped: number;
    primarySourcesCount: number;
    dataUpdateFrequency: string;
    dataPointsAnalyzed: string;
    totalDataPoints?: number;
    gridCellsCount?: number;
    snapshotsCount?: number;
    publishedCaseStudies?: number;
    lastDataRefresh: string | null;
  };
  summary: {
    solutionBullets: string[];
  };
}

export type AboutPageData = AboutContentDTO;
export type AboutData = AboutContentDTO;

export interface LandingContent {
  tagline: string;
  intro: string;
  highlightStats: { publishedCaseStudyCount: number; lastDataRefresh: string | null };
}

export interface MethodologyContent {
  scoreExplanation: string;
  dataSources: { key: string; name: string; description: string }[];
  validationApproach: string;
  limitations: string[];
}

// ---- Admin Access ----
export interface AdminIdentity {
  id: string;
  email: string;
}
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  createdAt: string;
}
export interface AdminLoginResponse {
  token: string;
  admin: AdminUser;
}
export interface AdminLoginCredentials {
  email: string;
  password: string;
}
// ---- Data Pipeline Management ----
export interface DataSourceStatus {
  key: 'VIIRS' | 'GHSL' | 'RWI' | 'GDELT';
  name: string;
  isActive: boolean;
  lastSuccessfulRunAt: string | null;
  healthStatus: 'healthy' | 'stale' | 'failed' | 'never_run';
}

export interface PipelineRun {
  id: string;
  dataSourceKey: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt: string;
  completedAt: string | null;
  recordsProcessed: number | null;
  errorMessage: string | null;
}

export interface ScoreWeightConfig {
  id: string;
  isActive: boolean;
  createdAt: string;
  weights: { sourceKey: 'VIIRS' | 'GHSL' | 'RWI'; weight: number }[];
}

// ---- Case Study Curation (admin) & DTOs ----
export * from './dto';
