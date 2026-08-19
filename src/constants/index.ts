// src/constants/index.ts

export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  CASE_STUDIES: '/case-studies',
  CASE_STUDY_DETAIL: '/case-studies/:id',
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
} as const;
