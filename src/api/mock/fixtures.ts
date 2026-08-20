import type { LandingContentDTO } from '@/types/dto';

export const mockLandingData: LandingContentDTO = {
  tagline: 'See the economy that no one measures.',
  intro: 'The Shadow Economy Map tracks real, on-the-ground growth in Addis Ababa.',
  highlightStats: {
    publishedCaseStudyCount: 1246,
    lastDataRefresh: new Date().toISOString(),
  },
};
