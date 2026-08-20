// tests/pages/CaseStudiesListPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import CaseStudiesListPage from '@/pages/CaseStudiesListPage';
import * as publicHooks from '@/hooks/usePublicCaseStudies';

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

describe('CaseStudiesListPage', () => {
  it('renders page header, tier filters, search bar, and empty state when empty', () => {
    vi.spyOn(publicHooks, 'useCaseStudies').mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 12 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof publicHooks.useCaseStudies>);

    renderWithProviders(<CaseStudiesListPage />);

    // Header
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Case Studies/i);

    // Filters & Search
    expect(screen.getByRole('button', { name: /All Tiers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Official/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search case studies/i)).toBeInTheDocument();

    // Empty state
    expect(screen.getByText(/No case studies found/i)).toBeInTheDocument();
  });

  it('renders case study cards and filters by tier and search query', () => {
    vi.spyOn(publicHooks, 'useCaseStudies').mockReturnValue({
      data: {
        items: [
          {
            id: 'cs-1',
            name: 'Bole Bulbula Logistics Hub',
            latitude: 8.9806,
            longitude: 38.7578,
            scoreRiseDate: '2024-01-01',
            confirmedDate: '2024-03-01',
            evidenceTier: 'OFFICIAL',
            evidenceDescription: 'Rapid expansion of commercial warehousing facility.',
            isPublished: true,
          },
          {
            id: 'cs-2',
            name: 'Akaki Kality Industrial Corridor',
            latitude: 8.8806,
            longitude: 38.7878,
            scoreRiseDate: '2024-02-01',
            confirmedDate: '2024-04-01',
            evidenceTier: 'INFRASTRUCTURE',
            evidenceDescription: 'New railway siding and freight terminal construction.',
            isPublished: true,
          },
        ],
        total: 2,
        page: 1,
        limit: 12,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof publicHooks.useCaseStudies>);

    renderWithProviders(<CaseStudiesListPage />);

    // Check card rendering
    expect(screen.getByText('Bole Bulbula Logistics Hub')).toBeInTheDocument();
    expect(screen.getByText('Akaki Kality Industrial Corridor')).toBeInTheDocument();

    // Filter by tier: click INFRASTRUCTURE
    fireEvent.click(screen.getByRole('button', { name: /Infrastructure/i }));
    expect(screen.queryByText('Bole Bulbula Logistics Hub')).not.toBeInTheDocument();
    expect(screen.getByText('Akaki Kality Industrial Corridor')).toBeInTheDocument();

    // Reset to All Tiers
    fireEvent.click(screen.getByRole('button', { name: /All Tiers/i }));
    expect(screen.getByText('Bole Bulbula Logistics Hub')).toBeInTheDocument();

    // Search query
    const searchInput = screen.getByPlaceholderText(/Search case studies/i);
    fireEvent.change(searchInput, { target: { value: 'Bole' } });
    expect(screen.getByText('Bole Bulbula Logistics Hub')).toBeInTheDocument();
    expect(screen.queryByText('Akaki Kality Industrial Corridor')).not.toBeInTheDocument();
  });
});
