// src/hooks/useContent.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { AboutContentDTO } from '@/types';

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
