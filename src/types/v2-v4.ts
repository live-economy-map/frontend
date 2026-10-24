// src/types/v2-v4.ts

// ==========================================
// V2: Authentication & Profile
// ==========================================
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  organizationName?: string | null;
  phoneNumber?: string | null;
  telegramHandle?: string | null;
  isEmailVerified: boolean;
  createdAt?: string;
  plan?: string;
  planTier?: 'FREE' | 'PRO' | 'ENTERPRISE';
  planStatus?: string;
  subscription?: Subscription | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  organizationName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  organizationName?: string;
  phoneNumber?: string;
  telegramHandle?: string;
}

// ==========================================
// V2: Saved Areas (Bookmarks)
// ==========================================
export interface SavedArea {
  id: string;
  userId: string;
  gridCellId: string;
  customName?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  cell?: {
    cellId: string;
    compositeScore?: number;
    cellRow?: number;
    cellCol?: number;
    areaLabel?: string | null;
    trend?: 'up' | 'down' | 'flat';
    sparkline?: { period: string; compositeScore: number }[];
  };
}

export interface CreateSavedAreaDTO {
  gridCellId: string;
  customName?: string;
  notes?: string;
}

export interface UpdateSavedAreaDTO {
  customName?: string;
  notes?: string;
}

// ==========================================
// V2: Custom Report Requests & Admin Queue
// ==========================================
export type ReportRequestStatus =
  'SUBMITTED' | 'IN_REVIEW' | 'IN_PROGRESS' | 'DELIVERED' | 'REJECTED';

export type ContactPreference = 'EMAIL' | 'PHONE' | 'TELEGRAM';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ReportDeliverable {
  id: string;
  requestId: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;
  createdAt: string;
}

export interface ReportRequestEvent {
  id: string;
  requestId: string;
  status: ReportRequestStatus | string;
  note?: string;
  createdById?: string;
  createdAt: string;
}

export interface ReportDraft {
  id: string;
  reportRequestId: string;
  draftContent: string;
  reviewNotes?: string | null;
  isApproved: boolean;
  generatedAt: string;
  updatedAt: string;
}

export interface ReportRequest {
  id: string;
  userId: string;
  title: string;
  questionPrompt: string;
  areaCellIds: string[];
  orgType?: string | null;
  contactPreference?: ContactPreference;
  phoneNumber?: string | null;
  telegramHandle?: string | null;
  status: ReportRequestStatus;
  priority?: RequestPriority;
  assignedAdminId?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  deliverables?: ReportDeliverable[];
  events?: ReportRequestEvent[];
  user?: {
    id: string;
    email: string;
    fullName: string;
    organizationName?: string | null;
    phoneNumber?: string | null;
    telegramHandle?: string | null;
  };
  draft?: ReportDraft | null;
}

export interface CreateReportRequestDTO {
  title: string;
  questionPrompt: string;
  areaCellIds: string[];
  orgType?: string;
  contactPreference?: ContactPreference;
  phoneNumber?: string;
  telegramHandle?: string;
}

export interface UpdateReportRequestAdminDTO {
  status?: ReportRequestStatus;
  assignedAdminId?: string | null;
  internalNotes?: string | null;
  priority?: RequestPriority;
}

export interface AddDeliverableDTO {
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;
}

export interface DemandMetrics {
  totalRequests: number;
  distinctUsers: number;
  targetRequests: number;
  targetUsers: number;
  gateStatus: 'PASSED' | 'PENDING';
}

// ==========================================
// V3: Monetization, Chapa & Subscriptions
// ==========================================
export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface Plan {
  id: string;
  name: string;
  tier?: PlanTier;
  priceEtb: number;
  billingInterval?: 'monthly' | 'yearly';
  interval?: string;
  features?: string[];
  canExport?: boolean;
  canAlert?: boolean;
  priorityReports?: boolean;
  maxAlerts?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: Plan;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CheckoutDTO {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  txRef: string;
}

export interface VerifyCheckoutResponse {
  success: boolean;
  subscription?: Subscription;
  message?: string;
}

// ==========================================
// V3: Spatial Alerts & Data Export
// ==========================================
export interface SpatialAlert {
  id: string;
  userId: string;
  gridCellId: string;
  thresholdDelta: number;
  isActive: boolean;
  createdAt: string;
  cell?: {
    cellId: string;
    areaLabel?: string | null;
    compositeScore?: number;
  };
}

export interface CreateAlertDTO {
  gridCellId: string;
  thresholdDelta: number;
}

export interface UpdateAlertDTO {
  thresholdDelta?: number;
  isActive?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  linkUrl?: string;
  createdAt: string;
}

// ==========================================
// V4: Developer API & Metered Keys
// ==========================================
export type ApiKeyTier = 'COMMERCIAL' | 'INSTITUTIONAL';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyPlaintext?: string;
  tier: ApiKeyTier;
  rpmLimit: number;
  rateLimit?: number;
  orgId?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
}

export interface CreateApiKeyDTO {
  name: string;
  tier: ApiKeyTier;
  orgId?: string;
  expiresInDays?: number;
}

export interface ApiUsage {
  totalRequests: number;
  remainingRpm: number;
  rpmLimit: number;
  dailyUsage: { date: string; count: number }[];
}

// ==========================================
// V4: Institutional Orgs & Watchlists
// ==========================================
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  user: {
    id?: string;
    email: string;
    fullName: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  billingEmail: string;
  createdAt: string;
  members?: OrgMember[];
}

export interface CreateOrgDTO {
  name: string;
  slug: string;
  billingEmail: string;
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  gridCellId: string;
  notes?: string;
  createdAt: string;
  cell?: {
    cellId: string;
    compositeScore?: number;
    areaLabel?: string | null;
    trend?: 'up' | 'down' | 'flat';
    sparkline?: { period: string; compositeScore: number }[];
  };
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  orgId?: string | null;
  createdAt: string;
  items: WatchlistItem[];
}

export interface CreateWatchlistDTO {
  name: string;
  description?: string;
  orgId?: string;
}

export interface AddWatchlistItemDTO {
  gridCellId: string;
  notes?: string;
}

// ==========================================
// V2-V4: Spatial AI Cell Chat
// ==========================================
export * from './map';
