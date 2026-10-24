// src/constants/index.ts

export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  CASE_STUDIES: '/case-studies',
  CASE_STUDY_DETAIL: '/case-studies/:id',
  METHODOLOGY: '/methodology',
  ABOUT: '/about',
  PRICING: '/pricing',
  CHECKOUT_SUCCESS: '/billing/success',
  MY_REQUESTS: '/my-requests',
  DEVELOPER: '/developer',
  WATCHLISTS: '/watchlists',
  VERIFY_EMAIL: '/verify-email',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PIPELINE: '/admin/pipeline',
  ADMIN_WEIGHT_CONFIGS: '/admin/weight-configs',
  ADMIN_CASE_STUDIES: '/admin/case-studies',
  ADMIN_REQUESTS: '/admin/requests',
} as const;

// Helper: build a concrete case-study detail path from the ROUTES pattern.
export function caseStudyDetailPath(caseStudyId: string) {
  return ROUTES.CASE_STUDY_DETAIL.replace(':id', caseStudyId);
}

export * from './queryKeys';
