// src/hooks/useCaseStudies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type {
  CaseStudyDetailDTO,
  AdminCaseStudyPayload,
  DiscoverCandidatesDTO,
  PaginatedResponse,
} from '@/types';

export function useAdminCaseStudiesList(page = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CASE_STUDIES, page],
    queryFn: async () => {
      // Note: We intentionally do NOT send `limit` as a query param because
      // the backend Prisma service passes `take: req.query.limit` directly,
      // which crashes if a string is provided. Omitting `limit` lets the backend
      // safely use its native default number.
      const params: Record<string, unknown> = {};
      if (page > 1) {
        params.page = page;
      }

      const response = await api.get('/admin/case-studies', {
        params: Object.keys(params).length > 0 ? params : undefined,
      });

      const resData = response.data as Record<string, unknown> | CaseStudyDetailDTO[] | undefined;
      let items: CaseStudyDetailDTO[] = [];
      let total = 0;

      if (Array.isArray(resData)) {
        items = resData;
        total = resData.length;
      } else if (resData && typeof resData === 'object') {
        if ('items' in resData && Array.isArray(resData.items)) {
          items = resData.items as CaseStudyDetailDTO[];
          total = (resData.total as number) ?? items.length;
        } else if ('caseStudies' in resData && Array.isArray(resData.caseStudies)) {
          items = resData.caseStudies as CaseStudyDetailDTO[];
          total = (resData.total as number) ?? items.length;
        } else if ('data' in resData && Array.isArray(resData.data)) {
          items = resData.data as CaseStudyDetailDTO[];
          total = (resData.total as number) ?? items.length;
        }
      }

      return {
        items,
        total: total || items.length,
        page,
        limit: 10,
        totalPages: Math.ceil((total || items.length) / 10) || 1,
      } as PaginatedResponse<CaseStudyDetailDTO>;
    },
  });
}

export function useCaseStudyDetail(id: string | undefined | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CASE_STUDY_DETAIL, id],
    queryFn: async () => {
      if (!id) throw new Error('Case study ID is required');
      const response = await api.get<CaseStudyDetailDTO>(`/admin/case-studies/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminCaseStudyPayload) => {
      const response = await api.post<CaseStudyDetailDTO>('/admin/case-studies', payload);
      return response.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CASE_STUDIES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CASE_STUDIES] });
    },
  });
}

export function useUpdateCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminCaseStudyPayload> }) => {
      const response = await api.patch<CaseStudyDetailDTO>(`/admin/case-studies/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CASE_STUDIES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CASE_STUDIES] });
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: [QUERY_KEYS.CASE_STUDY_DETAIL, variables.id] });
      }
    },
  });
}

export function useDeleteCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/case-studies/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CASE_STUDIES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CASE_STUDIES] });
    },
  });
}

export function useDiscoverCandidates() {
  return useMutation({
    mutationFn: async (areaFocus: string) => {
      const response = await api.post<DiscoverCandidatesDTO | DiscoverCandidatesDTO['candidates']>(
        '/admin/case-studies/discover',
        { areaFocus }
      );
      const data = response.data;
      if (Array.isArray(data)) {
        return {
          candidates: data,
          areaFocus,
          totalFound: data.length,
        } as DiscoverCandidatesDTO;
      }
      return data as DiscoverCandidatesDTO;
    },
  });
}
