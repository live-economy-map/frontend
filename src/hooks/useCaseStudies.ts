import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { CaseStudyDetail, CaseStudySummary, PaginatedResponse } from '@/types';

export function useCaseStudies(page = 1, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEYS.CASE_STUDIES, page, limit],
    queryFn: () =>
      api
        .get<PaginatedResponse<CaseStudySummary>>('/case-studies', { params: { page, limit } })
        .then((r) => r.data),
  });
}

export function useCaseStudyDetail(caseStudyId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CASE_STUDY_DETAIL, caseStudyId],
    queryFn: () => api.get<CaseStudyDetail>(`/case-studies/${caseStudyId}`).then((r) => r.data),
    enabled: !!caseStudyId,
  });
}
