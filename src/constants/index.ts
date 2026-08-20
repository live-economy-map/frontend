export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  MAP: '/map',
  CASE_STUDIES: '/case-studies',
  CASE_STUDY_DETAIL: '/case-studies/:caseStudyId',
  METHODOLOGY: '/methodology',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PIPELINE: '/admin/pipeline',
  ADMIN_WEIGHT_CONFIGS: '/admin/weight-configs',
  ADMIN_CASE_STUDIES: '/admin/case-studies',
} as const;

export const QUERY_KEYS = {
  MAP_CELLS: 'map-cells',
  CELL_DETAIL: 'cell-detail',
  MAP_LAYER: 'map-layer',
  CASE_STUDIES: 'case-studies',
  CASE_STUDY_DETAIL: 'case-study-detail',
  CONTENT_LANDING: 'content-landing',
  CONTENT_METHODOLOGY: 'content-methodology',
  ADMIN_ME: 'admin-me',
  PIPELINE_SOURCES: 'pipeline-sources',
  PIPELINE_RUNS: 'pipeline-runs',
  WEIGHT_CONFIGS: 'weight-configs',
  ADMIN_CASE_STUDIES: 'admin-case-studies',
  // Add these new keys
  USERS: 'users',
  USER_DETAIL: 'user-detail',
} as const;

// Helper: build a concrete case-study detail path from the ROUTES pattern.
export function caseStudyDetailPath(caseStudyId: string) {
  return ROUTES.CASE_STUDY_DETAIL.replace(':caseStudyId', caseStudyId);
}
