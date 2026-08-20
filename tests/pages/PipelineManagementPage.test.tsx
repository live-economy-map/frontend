// tests/pages/PipelineManagementPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import PipelineManagementPage from '@/pages/admin/PipelineManagementPage';
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

describe('PipelineManagementPage', () => {
  it('renders pipeline management headers, sources, and execution history', () => {
    vi.spyOn(pipelineHooks, 'usePipelineSources').mockReturnValue({
      data: {
        sources: [
          {
            key: 'VIIRS',
            name: 'VIIRS Nighttime Radiance',
            healthStatus: 'healthy',
            lastSuccessfulRunAt: '2026-08-20T10:00:00Z',
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof pipelineHooks.usePipelineSources>);

    vi.spyOn(pipelineHooks, 'usePipelineRuns').mockReturnValue({
      data: {
        items: [
          {
            id: 'run-1',
            dataSourceKey: 'VIIRS',
            status: 'SUCCESS',
            startedAt: '2026-08-20T10:00:00Z',
            completedAt: '2026-08-20T10:05:00Z',
            recordsProcessed: 238,
          },
        ],
        total: 1,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof pipelineHooks.usePipelineRuns>);

    renderWithProviders(<PipelineManagementPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Pipeline Management/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Active Data Sources/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Execution History/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Recompute Scores/i })
    ).toBeInTheDocument();

    expect(screen.getByText('VIIRS Nighttime Radiance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trigger Recomputation/i })).toBeInTheDocument();
  });
});
