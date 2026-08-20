// src/components/common/TopNavBar.tsx
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'Case Studies', to: ROUTES.CASE_STUDIES },
  { label: 'Methodology', to: ROUTES.METHODOLOGY },
  { label: 'About', to: ROUTES.ABOUT },
] as const;

function NavLink({ label, to, isActive }: { label: string; to: string; isActive: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        'font-label-caps text-label-caps uppercase tracking-wider transition-colors hover:text-primary',
        isActive ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'
      )}
    >
      {label}
    </Link>
  );
}

export function TopNavBar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-base bg-surface/80 px-space-gutter shadow-nav backdrop-blur-md">
      <Link to={ROUTES.HOME} className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          public
        </span>

        <span className="font-card-title text-card-title text-on-surface">Shadow Economy Map</span>
      </Link>

      <div className="hidden gap-6 md:flex">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.label}
            label={link.label}
            to={link.to}
            isActive={location.pathname === link.to}
          />
        ))}
      </div>

      <Link
        to={ROUTES.MAP}
        className="hidden rounded-lg bg-primary px-4 py-2 font-label-caps text-label-caps text-white transition-transform hover:bg-primary-hover active:scale-95 md:block"
      >
        Explore the Map
      </Link>

      <button className="text-on-surface md:hidden" aria-label="Open menu">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </nav>
  );
}
