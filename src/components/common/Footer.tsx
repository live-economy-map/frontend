// src/components/common/Footer.tsx
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function Footer() {
  return (
    <footer className="border-t border-border-base bg-surface px-space-gutter py-space-lg">
      <div className="content-container flex flex-col items-center justify-between gap-space-md md:flex-row">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <img src="/ecolens-tr.png" alt="EcoLens" className="h-7 w-auto object-contain" />
          <span className="font-bold text-base text-on-surface">EcoLens</span>
        </Link>

        <p className="font-body-sm text-body-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} EcoLens. All rights reserved.
        </p>

        <div className="flex flex-wrap gap-5 font-body-sm text-body-sm text-[var(--color-text-muted)]">
          <Link to={ROUTES.METHODOLOGY} className="hover:text-primary transition-colors">
            Methodology
          </Link>
          <Link to={ROUTES.CASE_STUDIES} className="hover:text-primary transition-colors">
            Case Studies
          </Link>
          <Link to={ROUTES.MAP} className="hover:text-primary transition-colors">
            Explore Map
          </Link>
          <Link to={ROUTES.ABOUT} className="hover:text-primary transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
