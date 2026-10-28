import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from '@/components/auth/AuthModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

// Helper component that opens the modal
function ModalTrigger({ defaultTab = 'login' }: { defaultTab?: 'login' | 'register' }) {
  const { openAuthModal } = useAuth();
  return (
    <div>
      <button onClick={() => openAuthModal(defaultTab)}>Open Modal</button>
      <AuthModal />
    </div>
  );
}

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

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

describe('AuthModal', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders login tab by default when opened', () => {
    renderWithProviders(<ModalTrigger defaultTab="login" />);

    // Initially modal is closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click trigger
    fireEvent.click(screen.getByText('Open Modal'));

    // Modal dialog is now visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sign In to EcoLens/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sign In' }).length).toBeGreaterThanOrEqual(2);
  });

  it('switches between Sign In and Create Account tabs', () => {
    renderWithProviders(<ModalTrigger defaultTab="login" />);
    fireEvent.click(screen.getByText('Open Modal'));

    // Click Create Account tab
    const createTabBtn = screen.getByRole('button', { name: 'Create Account' });
    fireEvent.click(createTabBtn);

    expect(screen.getByRole('heading', { name: /Create Your Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Abebe Bikila')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Addis Ababa University/i)).toBeInTheDocument();

    // Switch back to Sign In
    const signInTabBtn = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInTabBtn);
    expect(screen.getByRole('heading', { name: /Sign In to EcoLens/i })).toBeInTheDocument();
  });

  it('navigates to forgot password view and back', () => {
    renderWithProviders(<ModalTrigger defaultTab="login" />);
    fireEvent.click(screen.getByText('Open Modal'));

    // Click forgot password button
    fireEvent.click(screen.getByText(/Forgot password\?/i));

    expect(screen.getByRole('heading', { name: /Reset Your Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();

    // Click Back
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(screen.getByRole('heading', { name: /Sign In to EcoLens/i })).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    renderWithProviders(<ModalTrigger defaultTab="login" />);
    fireEvent.click(screen.getByText('Open Modal'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close auth dialog');
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
