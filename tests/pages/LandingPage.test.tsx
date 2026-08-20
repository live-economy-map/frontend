// tests/pages/LandingPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByRole('heading', { level: 2, name: /See What Others/i })).toBeInTheDocument();

    // Call-to-action buttons
    expect(screen.getByRole('button', { name: /Explore the Map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Case Studies/i })).toBeInTheDocument();

    // Heatmap aria-label and legend
    expect(screen.getByLabelText(/Satellite Density Heatmap Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Latest Severity Hotspots/i)).toBeInTheDocument();

    // Default Stats (from About Page Analytics)
    expect(screen.getByText('PILOT AREA (ETHIOPIA)')).toBeInTheDocument();
    expect(screen.getByText('PRIMARY SATELLITE SOURCES')).toBeInTheDocument();
    expect(screen.getByText('1.5 KM² GRID CELLS')).toBeInTheDocument();
    expect(screen.getByText('DATA POINTS ANALYZED')).toBeInTheDocument();

    // What Does EcoLens Mean section
    expect(
      screen.getByRole('heading', { level: 2, name: /What Does EcoLens Mean/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Economic Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Spatial Observation/i)).toBeInTheDocument();

    // Multi-sensor section
    expect(screen.getByText(/Orbital Signals Powering the Index/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GHSL Layer/i })).toBeInTheDocument();

    // Workflow steps
    expect(screen.getByText(/Orbital Ingestion/i)).toBeInTheDocument();
    expect(screen.getByText(/Grid Normalization/i)).toBeInTheDocument();
    expect(screen.getByText(/Anomaly Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Ground Corroboration/i)).toBeInTheDocument();

    // Final CTA
    expect(screen.getByRole('button', { name: /Launch Interactive Map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scientific Framework/i })).toBeInTheDocument();
  });

  it('switches layer details when layer tabs are clicked', () => {
    renderWithProviders(<LandingPage />);

    // Default layer is VIIRS
    expect(screen.getByText(/VIIRS Nighttime Radiance/i)).toBeInTheDocument();

    // Switch to GHSL
    fireEvent.click(screen.getByRole('button', { name: /GHSL Layer/i }));
    expect(screen.getByText(/Global Human Settlement Layer/i)).toBeInTheDocument();

    // Switch to RWI
    fireEvent.click(screen.getByRole('button', { name: /RWI Layer/i }));
    expect(screen.getByText(/Relative Wealth Index/i)).toBeInTheDocument();
  });

  it('renders dynamic content when backend API returns analytics data', () => {
    vi.spyOn(contentHooks, 'useAboutContent').mockReturnValue({
      data: {
        stats: {
          countriesMapped: 3,
          primarySourcesCount: 5,
          gridCellsCount: 450,
          dataPointsAnalyzed: '15.2K+',
        },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof contentHooks.useAboutContent>);

    renderWithProviders(<LandingPage />);

    expect(screen.getByText('3+')).toBeInTheDocument();
    expect(screen.getByText('COUNTRIES MAPPED')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('15.2K+')).toBeInTheDocument();
  });
});
