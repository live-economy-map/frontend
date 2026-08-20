// tests/pages/WeightConfigPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import WeightConfigPage from '@/pages/admin/WeightConfigPage';
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

describe('WeightConfigPage', () => {
  it('renders weight config form and history list', () => {
    vi.spyOn(pipelineHooks, 'useWeightConfigs').mockReturnValue({
      data: {
        configs: [
          {
            id: 'cfg-1',
            isActive: true,
            createdAt: '2026-08-20T10:00:00Z',
            weights: [
              { sourceKey: 'VIIRS', weight: 0.4 },
              { sourceKey: 'GHSL', weight: 0.35 },
              { sourceKey: 'RWI', weight: 0.25 },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof pipelineHooks.useWeightConfigs>);

    renderWithProviders(<WeightConfigPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Weight Configurations/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Create Weight Configuration/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Configuration History/i })
    ).toBeInTheDocument();

    expect(screen.getByText('VIIRS Night-Time Radiance')).toBeInTheDocument();
    expect(screen.getByText('GHSL Built-up Surface')).toBeInTheDocument();
    expect(screen.getByText('RWI Relative Wealth Index')).toBeInTheDocument();

    expect(screen.getByText(/Active Model/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Save & Set Active Configuration/i })
    ).toBeInTheDocument();
  });
});
