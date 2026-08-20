// tests/pages/AdminCaseStudiesPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import AdminCaseStudiesPage from '@/pages/admin/AdminCaseStudiesPage';
import * as caseStudyHooks from '@/hooks/useCaseStudies';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AdminCaseStudiesPage', () => {
  it('renders page header, stat cards, and action button', () => {
    vi.spyOn(caseStudyHooks, 'useAdminCaseStudiesList').mockReturnValue({
      data: {
        items: [
          {
            id: 'cs-1',
            name: 'Akaki Industrial Surge',
            evidenceTier: 'OFFICIAL',
            evidenceDescription: 'New manufacturing corridor emergence.',
            isPublished: true,
            latitude: 8.9,
            longitude: 38.7,
            confirmedDate: '2026-01-01',
            scoreRiseDate: '2025-06-01',
            tags: ['Industrial'],
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof caseStudyHooks.useAdminCaseStudiesList>);

    renderWithProviders(<AdminCaseStudiesPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Case Study Curation/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Case Study/i })).toBeInTheDocument();

    expect(screen.getByText(/Total Studies/i)).toBeInTheDocument();
    expect(screen.getByText(/Published on Map/i)).toBeInTheDocument();
  });
});
