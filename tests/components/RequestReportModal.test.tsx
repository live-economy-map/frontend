// tests/components/RequestReportModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RequestReportModal from '@/components/reports/RequestReportModal';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { reportRequestsApi } from '@/api/reportRequests.api';

const renderWithProviders = (ui: React.ReactElement, options?: { isAuthenticated?: boolean }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  if (options?.isAuthenticated) {
    localStorage.setItem('auth_token', 'valid-mock-jwt');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 'user-1',
        email: 'developer@realestate.et',
        fullName: 'Real Estate Developer',
        role: 'USER',
        isEmailVerified: true,
      })
    );
  } else {
    localStorage.clear();
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('RequestReportModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders modal when open and pre-fills default cell and title', () => {
    renderWithProviders(
      <RequestReportModal
        isOpen={true}
        onClose={vi.fn()}
        defaultCellId="cell-sarbet-442"
        defaultAreaLabel="Sarbet Corridor"
      />,
      { isAuthenticated: true }
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Request Deep-Dive Analysis/i })
    ).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue(/Sarbet Corridor/i);
    expect(titleInput).toBeInTheDocument();

    const cellInput = screen.getByDisplayValue('cell-sarbet-442');
    expect(cellInput).toBeInTheDocument();
  });

  it('submits analysis request with all form parameters', async () => {
    const createSpy = vi.spyOn(reportRequestsApi, 'createRequest').mockResolvedValue({
      id: 'req-123',
      userId: 'user-1',
      title: 'Sarbet Retail Demand Assessment',
      questionPrompt: 'Investigate nighttime foot traffic trajectory vs built-up growth.',
      areaCellIds: ['cell-sarbet-442'],
      orgType: 'Commercial Real Estate Developer',
      contactPreference: 'TELEGRAM',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const mockClose = vi.fn();

    renderWithProviders(
      <RequestReportModal
        isOpen={true}
        onClose={mockClose}
        defaultCellId="cell-sarbet-442"
        defaultAreaLabel="Sarbet"
      />,
      { isAuthenticated: true }
    );

    // Fill Prompt
    const promptInput = screen.getByPlaceholderText(/What specific economic insights/i);
    fireEvent.change(promptInput, {
      target: {
        value: 'Investigate nighttime foot traffic trajectory vs built-up growth.',
      },
    });

    // Select TELEGRAM
    const telegramBtn = screen.getByRole('button', { name: /TELEGRAM/i });
    fireEvent.click(telegramBtn);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Analysis Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          areaCellIds: ['cell-sarbet-442'],
          contactPreference: 'TELEGRAM',
          questionPrompt: 'Investigate nighttime foot traffic trajectory vs built-up growth.',
        })
      );
    });
  });
});
