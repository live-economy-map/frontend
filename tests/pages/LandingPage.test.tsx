// tests/pages/LandingPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '@/pages/LandingPage';
import * as contentHooks from '@/hooks/useContent';

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

describe('LandingPage', () => {
  it('renders landing hero, headings, CTAs, heatmap matrix, and fallback stats', () => {
    renderWithProviders(<LandingPage />);

    // Headlines
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Understand the/i);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/See What Others/i);

    // Call-to-action buttons
    expect(screen.getByRole('button', { name: /Explore the Map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Case Studies/i })).toBeInTheDocument();

    // Heatmap aria-label and legend
    expect(screen.getByLabelText(/Satellite Density Heatmap Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Latest Severity Hotspots/i)).toBeInTheDocument();

    // Default Stats
    expect(screen.getByText('DATA POINTS PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('LAST DATA REFRESH')).toBeInTheDocument();
    expect(screen.getByText('GRID CELLS ANALYZED')).toBeInTheDocument();
    expect(screen.getByText('SATELLITE & DATA SOURCES')).toBeInTheDocument();

    // Transparency banner
    expect(screen.getByText(/Open, Transparent, Built for Impact/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /About the Project/i })).toBeInTheDocument();
  });

  it('renders dynamic content when backend API returns landing data', () => {
    vi.spyOn(contentHooks, 'useLandingContent').mockReturnValue({
      data: {
        tagline: 'Custom Tagline',
        intro: 'Live satellite data intelligence across Ethiopia.',
        highlightStats: {
          publishedCaseStudyCount: 8850,
          lastDataRefresh: '2026-08-15T00:00:00.000Z',
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof contentHooks.useLandingContent>);

    renderWithProviders(<LandingPage />);

    expect(
      screen.getByText(/Live satellite data intelligence across Ethiopia./i)
    ).toBeInTheDocument();
    expect(screen.getByText('8,850')).toBeInTheDocument();
    expect(screen.getByText('Aug 15, 2026')).toBeInTheDocument();
  });
});
