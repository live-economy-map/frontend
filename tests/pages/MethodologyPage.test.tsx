// tests/pages/MethodologyPage.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import MethodologyPage from '@/pages/MethodologyPage';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('MethodologyPage', () => {
  it('renders methodology hero, sections, data sources, and action buttons', () => {
    renderWithRouter(<MethodologyPage />);

    // Hero title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Methodology/i);

    // Key data source cards
    expect(screen.getByText(/VIIRS Nighttime Radiance/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Human Settlement Layer/i)).toBeInTheDocument();
    expect(screen.getByText(/Relative Wealth Index/i)).toBeInTheDocument();

    // Ground truth tiers
    expect(screen.getByText(/Tier 1: Official Ground-Truth/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2: Physical Infrastructure Audits/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 3: Localized Ground Verification/i)).toBeInTheDocument();

    // CTA buttons
    expect(screen.getByRole('button', { name: /Launch Map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Case Studies/i })).toBeInTheDocument();
  });
});
