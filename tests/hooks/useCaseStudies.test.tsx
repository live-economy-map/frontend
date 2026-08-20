// tests/hooks/useCaseStudies.test.tsx
import { describe, it, expect } from 'vitest';
import { QUERY_KEYS } from '@/constants/queryKeys';

describe('Case Studies Query Keys & Constants', () => {
  it('should define correct query keys', () => {
    expect(QUERY_KEYS.ADMIN_CASE_STUDIES).toBe('admin-case-studies');
    expect(QUERY_KEYS.CASE_STUDIES).toBe('case-studies');
    expect(QUERY_KEYS.CASE_STUDY_DETAIL).toBe('case-study-detail');
    expect(QUERY_KEYS.DISCOVER_CANDIDATES).toBe('discover-candidates');
  });
});
