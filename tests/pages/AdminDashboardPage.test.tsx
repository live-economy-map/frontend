// tests/pages/AdminDashboardPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import * as pipelineHooks from '@/hooks/useAdminPipeline';

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

describe('AdminDashboardPage', () => {
  it('renders dashboard headers, KPI cards, and source health cards', () => {
    vi.spyOn(pipelineHooks, 'usePipelineSources').mockReturnValue({
      data: {
        sources: [
          {
            key: 'viirs',
            name: 'VIIRS Nighttime Radiance',
            healthStatus: 'healthy',
            lastSuccessfulRunAt: '2026-08-20T10:00:00Z',
          },
          {
            key: 'ghsl',
            name: 'GHSL Built-up Surface',
            healthStatus: 'healthy',
            lastSuccessfulRunAt: '2026-08-19T10:00:00Z',
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof pipelineHooks.usePipelineSources>);

    renderWithProviders(<AdminDashboardPage />);

    // Headings
    expect(
      screen.getByRole('heading', { level: 1, name: /Pipeline Health Dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Earth Observation Data Feeds/i })
    ).toBeInTheDocument();

    // KPI Cards
    expect(screen.getAllByText(/Pipeline Health/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Monitored Cells/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Modalities/i)).toBeInTheDocument();

    // Source cards
    expect(screen.getByText('VIIRS Nighttime Radiance')).toBeInTheDocument();
    expect(screen.getByText('GHSL Built-up Surface')).toBeInTheDocument();
    expect(screen.getAllByText('Healthy').length).toBeGreaterThan(0);
  });
});
