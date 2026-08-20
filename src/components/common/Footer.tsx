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
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            public
          </span>

          <span className="font-card-title text-card-title text-on-surface">
            Shadow Economy Map
          </span>
        </Link>

        <p className="font-body-sm text-body-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Shadow Economy Map. All rights reserved.
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
