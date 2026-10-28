// tests/components/CellChatAssistant.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CellChatAssistant from '@/components/map/CellChatAssistant';
import { mapApi } from '@/api/map.api';

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('CellChatAssistant', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial assistant greeting with cell area label and ai summary', () => {
    renderWithProviders(
      <CellChatAssistant
        cellId="cell-bole-1234"
        areaLabel="Bole District"
        aiSummary="Nightlight radiance grew 14% over the last 12 months with strong commercial density."
        compositeScore={0.78}
        trend="up"
      />
    );

    expect(screen.getByText('Spatial AI Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Llama-3 Spatial/i)).toBeInTheDocument();
    expect(screen.getByText(/Nightlight radiance grew 14%/i)).toBeInTheDocument();
  });

  it('allows sending a question via input and displays AI reply', async () => {
    vi.spyOn(mapApi, 'chatWithCell').mockResolvedValue({
      reply: 'The nightlight increase in Bole is driven by airport corridor commercial expansion.',
      cellId: 'cell-bole-1234',
      areaLabel: 'Bole District',
      compositeScore: 0.78,
      trend: 'up',
    });

    renderWithProviders(<CellChatAssistant cellId="cell-bole-1234" areaLabel="Bole District" />);

    const input = screen.getByPlaceholderText(/Ask about growth, nightlights, risk/i);
    fireEvent.change(input, { target: { value: 'Why are nightlights increasing?' } });

    const sendBtn = screen.getByTitle('Send message (Enter)');
    fireEvent.click(sendBtn);

    // User message should appear immediately
    expect(screen.getByText('Why are nightlights increasing?')).toBeInTheDocument();

    // Assistant response should render
    await waitFor(() => {
      expect(
        screen.getByText(/The nightlight increase in Bole is driven by airport corridor/i)
      ).toBeInTheDocument();
    });

    expect(mapApi.chatWithCell).toHaveBeenCalledWith('cell-bole-1234', {
      message: 'Why are nightlights increasing?',
      history: expect.any(Array),
    });
  });

  it('sends question when clicking quick prompt chips', async () => {
    vi.spyOn(mapApi, 'chatWithCell').mockResolvedValue({
      reply: 'GHSL built-up surface correlates 0.82 with commercial activity in this sector.',
      cellId: 'cell-bole-1234',
      areaLabel: 'Bole District',
      compositeScore: 0.78,
      trend: 'up',
    });

    renderWithProviders(<CellChatAssistant cellId="cell-bole-1234" areaLabel="Bole District" />);

    const quickChip = screen.getByText('Correlate with population density');
    fireEvent.click(quickChip);

    await waitFor(() => {
      expect(screen.getByText(/GHSL built-up surface correlates 0.82/i)).toBeInTheDocument();
    });
  });

  it('resets conversation when clicking reset button', async () => {
    renderWithProviders(<CellChatAssistant cellId="cell-bole-1234" areaLabel="Bole District" />);

    const resetBtn = screen.getByTitle('Reset Conversation');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Conversation cleared/i)).toBeInTheDocument();
  });
});
