import api from '@/lib/axios';
import type { LandingContentDTO } from '@/types/dto';

export const contentApi = {
  async landing(): Promise<LandingContentDTO> {
    const response = await api.get<LandingContentDTO>('/content/landing');
    return response.data;
  },
};
