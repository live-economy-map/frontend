// src/hooks/useContent.ts
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/api';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { LandingContentDTO, AboutContentDTO } from '@/types';

export function useLandingContent() {
  return useQuery<LandingContentDTO>({
    queryKey: [QUERY_KEYS.LANDING],
    queryFn: () => contentApi.landing(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache freshness
  });
}

export function useAboutContent() {
  return useQuery<AboutContentDTO>({
    queryKey: [QUERY_KEYS.CONTENT_ABOUT],
    queryFn: async () => {
      const response = await api.get<AboutContentDTO>('/content/about');
      return response.data as AboutContentDTO;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
