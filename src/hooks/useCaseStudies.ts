// frontend/src/hooks/useCaseStudies.ts

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { CaseStudyDetail, CaseStudySummary, PaginatedResponse } from '@/types';

export function useCaseStudies(page = 1, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEYS.CASE_STUDIES, page, limit],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<CaseStudySummary>>('/case-studies', {
        params: { page, limit },
      });
      // The interceptor already unwrapped response.data to the inner payload
      return response.data ?? null;
    },
  });
}

export function useCaseStudyDetail(caseStudyId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CASE_STUDY_DETAIL, caseStudyId],
    queryFn: async () => {
      const response = await api.get<CaseStudyDetail>(`/case-studies/${caseStudyId}`);
      // The interceptor already unwrapped response.data to the inner payload
      return response.data ?? null;
    },
    enabled: !!caseStudyId,
  });
}
