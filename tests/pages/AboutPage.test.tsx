// tests/pages/AboutPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import AboutPage from '@/pages/AboutPage';
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

describe('AboutPage', () => {
  it('renders default/fallback stats and bullets when backend data is not present', () => {
    renderWithProviders(<AboutPage />);

    // Hero headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Shadow\s*Economy/i);

    // Fallback Stats
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/Pilot Area \(Ethiopia\)/i)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText(/Primary Satellite Sources/i)).toBeInTheDocument();
    expect(screen.getByText('238')).toBeInTheDocument();
    expect(screen.getByText(/1.5 km² Grid Cells/i)).toBeInTheDocument();
    expect(screen.getByText('7.9K+')).toBeInTheDocument();
    expect(screen.getByText(/Data Points Analyzed/i)).toBeInTheDocument();

    // Problem & Solution
    expect(screen.getByText(/The Gap in Economic Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Our Solution/i)).toBeInTheDocument();
    expect(screen.getByText(/Objective, satellite-derived metrics/i)).toBeInTheDocument();

    // CTA Buttons
    expect(screen.getByRole('button', { name: /Explore the Map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Read Methodology/i })).toBeInTheDocument();
  });

  it('renders dynamic stats and bullets when backend data is returned', () => {
    vi.spyOn(contentHooks, 'useAboutContent').mockReturnValue({
      data: {
        stats: {
          countriesMapped: 1,
          primarySourcesCount: 4,
          dataUpdateFrequency: 'Monthly / On-Demand',
          dataPointsAnalyzed: '7.9K+',
          totalDataPoints: 7854,
          gridCellsCount: 238,
          snapshotsCount: 3570,
          publishedCaseStudies: 1,
          lastDataRefresh: '2026-08-20T00:00:00.000Z',
        },
        summary: {
          solutionBullets: [
            'Dynamic Bullet 1 from Backend API.',
            'Dynamic Bullet 2 with high spatial resolution.',
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof contentHooks.useAboutContent>);

    renderWithProviders(<AboutPage />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('238')).toBeInTheDocument();
    expect(screen.getByText('7.9K+')).toBeInTheDocument();
    expect(screen.getByText(/7,854 Total Signals & Snapshots/i)).toBeInTheDocument();
    expect(screen.getByText(/Dynamic Bullet 1 from Backend API/i)).toBeInTheDocument();
    expect(screen.getByText(/Dynamic Bullet 2 with high spatial resolution/i)).toBeInTheDocument();
  });
});
