// tests/pages/AdminLoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import * as authHooks from '@/hooks/useAdminAuth';

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

describe('AdminLoginPage', () => {
  it('renders login form, fields, logo, welcome title, and submit button', () => {
    vi.spyOn(authHooks, 'useAdminLogin').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof authHooks.useAdminLogin>);

    renderWithProviders(<AdminLoginPage />);

    // Brand and Headings
    expect(screen.getByAltText('EcoLens')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();

    // Inputs
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /^Sign in$/i })).toBeInTheDocument();

    // Security badge
    expect(screen.getByText(/Secure access • Encrypted • Protected/i)).toBeInTheDocument();
  });

  it('validates required fields and shows error message', async () => {
    const mockMutate = vi.fn();
    vi.spyOn(authHooks, 'useAdminLogin').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof authHooks.useAdminLogin>);

    renderWithProviders(<AdminLoginPage />);

    const submitBtn = screen.getByRole('button', { name: /^Sign in$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
