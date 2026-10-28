// tests/components/ApiKeyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApiKeyCard from '@/components/developer/ApiKeyCard';
import type { ApiKey } from '@/types';

const mockApiKey: ApiKey = {
  id: 'key-test-1',
  name: 'Addis Analytics Service',
  keyPrefix: 'lem_live_a1b2c3d4',
  keyPlaintext: 'lem_live_a1b2c3d4e5f6g7h8i9j0',
  tier: 'COMMERCIAL',
  rpmLimit: 60,
  rateLimit: 60,
  createdAt: '2026-03-01T10:00:00.000Z',
  lastUsedAt: '2026-03-15T12:00:00.000Z',
};

const mockInstitutionalKey: ApiKey = {
  id: 'key-test-2',
  name: 'Ministry of Innovation Pipeline',
  keyPrefix: 'lem_inst_99887766',
  tier: 'INSTITUTIONAL',
  rpmLimit: 300,
  rateLimit: 300,
  createdAt: '2026-03-05T08:00:00.000Z',
};

describe('ApiKeyCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders key name, prefix, commercial RPM limit badge, and dates', () => {
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />);

    expect(screen.getByText('Addis Analytics Service')).toBeInTheDocument();
    expect(screen.getByText(/lem_live_a1b2c3d4••••••••/i)).toBeInTheDocument();
    expect(screen.getByText('60 RPM Limit')).toBeInTheDocument();
    expect(screen.getByText('COMMERCIAL')).toBeInTheDocument();
  });

  it('renders 300 RPM limit badge for institutional tier', () => {
    render(<ApiKeyCard apiKey={mockInstitutionalKey} onRevoke={vi.fn()} />);

    expect(screen.getByText('Ministry of Innovation Pipeline')).toBeInTheDocument();
    expect(screen.getByText('300 RPM Limit')).toBeInTheDocument();
    expect(screen.getByText('INSTITUTIONAL')).toBeInTheDocument();
  });

  it('copies plaintext key to clipboard when copy button is clicked', async () => {
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={vi.fn()} />);

    const copyBtn = screen.getByLabelText('Copy API Key');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('lem_live_a1b2c3d4e5f6g7h8i9j0');
  });

  it('calls onRevoke when trash button is clicked', () => {
    const mockRevoke = vi.fn();
    render(<ApiKeyCard apiKey={mockApiKey} onRevoke={mockRevoke} />);

    const revokeBtn = screen.getByLabelText('Revoke key');
    fireEvent.click(revokeBtn);

    expect(mockRevoke).toHaveBeenCalledWith('key-test-1');
  });
});
