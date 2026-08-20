// API response shape matching your backend's ApiResponse class
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// User type
export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

// --- Case Studies & Validation feature (02-case-studies.md / 02-case-studies-frontend.md) ---

export interface CaseStudySummary {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  scoreRiseDate: string;
  confirmedDate: string;
  evidenceTier: 'OFFICIAL' | 'MARKET_REPORT' | 'INFRASTRUCTURE' | 'LOCAL_NEWS';
  // Add these missing fields
  evidenceDescription: string;
  evidenceUrl?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  isPublished?: boolean;
}

export interface CaseStudyDetail extends CaseStudySummary {
  evidenceDescription: string;
  evidenceUrl: string | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  // Add any additional detail fields here
  gridCellId?: string | null;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
