// tests/components/SavedAreasDrawer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SavedAreasDrawer from '@/components/saved-areas/SavedAreasDrawer';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { savedAreasApi } from '@/api/savedAreas.api';
import type { SavedArea } from '@/types';

const mockSavedAreas: SavedArea[] = [
  {
    id: 'area-1',
    userId: 'user-1',
    gridCellId: 'cell-bole-001',
    customName: 'Bole Medhanealem Hub',
    notes: 'High commercial nightlight growth corridor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cell: {
      cellId: 'cell-bole-001',
      compositeScore: 0.88,
      cellRow: 12,
      cellCol: 18,
      areaLabel: 'Bole',
    },
  },
];

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
        email: 'test@ecolens.org',
        fullName: 'Test User',
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

describe('SavedAreasDrawer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders sign in prompt when user is unauthenticated', () => {
    renderWithProviders(<SavedAreasDrawer isOpen={true} onClose={vi.fn()} />, {
      isAuthenticated: false,
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sign In Required/i })).toBeInTheDocument();
  });

  it('renders list of bookmarked areas with scores and actions when authenticated', async () => {
    vi.spyOn(savedAreasApi, 'getSavedAreas').mockResolvedValue(mockSavedAreas);

    renderWithProviders(<SavedAreasDrawer isOpen={true} onClose={vi.fn()} />, {
      isAuthenticated: true,
    });

    await waitFor(() => {
      expect(screen.getByText('Bole Medhanealem Hub')).toBeInTheDocument();
    });

    expect(screen.getByText(/ID: cell-bole-/i)).toBeInTheDocument();
    expect(screen.getByText('88.0')).toBeInTheDocument(); // Composite score formatted
    expect(screen.getByText(/High commercial nightlight growth corridor/i)).toBeInTheDocument();
    expect(screen.getByText('Fly to Cell on Map')).toBeInTheDocument();
  });

  it('calls onSelectCell and onClose when Fly to Cell is clicked', async () => {
    vi.spyOn(savedAreasApi, 'getSavedAreas').mockResolvedValue(mockSavedAreas);
    const mockClose = vi.fn();
    const mockSelect = vi.fn();

    renderWithProviders(
      <SavedAreasDrawer isOpen={true} onClose={mockClose} onSelectCell={mockSelect} />,
      { isAuthenticated: true }
    );

    await waitFor(() => {
      expect(screen.getByText('Fly to Cell on Map')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Fly to Cell on Map'));

    expect(mockSelect).toHaveBeenCalledWith('cell-bole-001');
    expect(mockClose).toHaveBeenCalled();
  });

  it('triggers delete mutation when delete button is clicked', async () => {
    vi.spyOn(savedAreasApi, 'getSavedAreas').mockResolvedValue(mockSavedAreas);
    const deleteSpy = vi
      .spyOn(savedAreasApi, 'deleteSavedArea')
      .mockResolvedValue({ success: true });

    renderWithProviders(<SavedAreasDrawer isOpen={true} onClose={vi.fn()} />, {
      isAuthenticated: true,
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Delete saved area')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Delete saved area'));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('area-1');
    });
  });
});
