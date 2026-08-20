import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

// Nav items backed by a real spec'd route. "About" appears in the Stitch
// design but has no route in 8-1's ROUTES — left as a `#` placeholder,
// same treatment the spec gives Footer's un-routed links.
const NAV_LINKS = [
  { label: 'Map', to: ROUTES.MAP },
  { label: 'Case Studies', to: ROUTES.CASE_STUDIES },
  { label: 'Methodology', to: ROUTES.METHODOLOGY },
];

export default function TopNavBar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-base bg-surface/80 px-space-gutter backdrop-blur-md shadow-nav">
      <Link to={ROUTES.HOME} className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          travel_explore
        </span>
        <span className="text-card-title font-bold text-on-surface">Shadow Economy Map</span>
      </Link>

      <nav className="hidden h-full items-center gap-6 md:flex">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={
                isActive
                  ? 'flex h-full items-center border-b-2 border-primary pt-0.5 text-label-caps text-primary'
                  : 'flex h-full items-center border-b-2 border-transparent pt-0.5 text-label-caps text-on-surface-variant transition-colors hover:border-border-base hover:text-primary'
              }
            >
              {link.label}
            </Link>
          );
        })}
        <a
          href="#"
          className="flex h-full items-center border-b-2 border-transparent pt-0.5 text-label-caps text-on-surface-variant transition-colors hover:border-border-base hover:text-primary"
        >
          About
        </a>
      </nav>

      <Button asChild size="default" className="hidden md:inline-flex">
        <Link to={ROUTES.MAP}>
          <span className="material-symbols-outlined text-sm">map</span>
          Explore the Map
        </Link>
      </Button>

      <button className="text-on-surface md:hidden" aria-label="Open menu">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </header>
  );
}
