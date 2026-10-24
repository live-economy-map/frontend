// tests/components/PricingTable.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PricingTable from '@/components/billing/PricingTable';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { billingApi } from '@/api/billing.api';

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
        email: 'analyst@ecolens.org',
        fullName: 'Analyst User',
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

describe('PricingTable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all three tiers with correct names, prices, and features', async () => {
    renderWithProviders(<PricingTable />);

    // Tier Titles
    expect(screen.getByRole('heading', { name: 'Free Explorer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Analyst Pro' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Institutional Enterprise' })).toBeInTheDocument();

    // Pricing
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('2,500 ETB')).toBeInTheDocument();
    expect(screen.getByText('15,000 ETB')).toBeInTheDocument();

    // Key Features
    expect(screen.getByText(/Interactive Addis Ababa heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Full historical CSV & JSON spatial data export/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Developer API platform access \(300 RPM limit\)/i)
    ).toBeInTheDocument();
  });

  it('invokes checkout mutation with plan ID when authenticated user clicks upgrade', async () => {
    const checkoutSpy = vi.spyOn(billingApi, 'createCheckout').mockResolvedValue({
      checkoutUrl: 'https://checkout.chapa.co/checkout/test1234',
      txRef: 'lem_tx_1234',
    });

    renderWithProviders(<PricingTable />, { isAuthenticated: true });

    const upgradeBtn = screen.getByRole('button', { name: /Upgrade to Analyst Pro/i });
    fireEvent.click(upgradeBtn);

    await waitFor(() => {
      expect(checkoutSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: 'plan_pro',
        })
      );
    });
  });
});
