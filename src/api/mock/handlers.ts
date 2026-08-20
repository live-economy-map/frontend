import type { LandingContentDTO } from '@/types/dto';
import { mockLandingData } from './fixtures';

export const contentApi = {
  landing(): Promise<LandingContentDTO> {
    return Promise.resolve(mockLandingData);
  },
};
