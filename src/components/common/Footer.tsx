// src/components/common/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-border-base bg-surface px-space-gutter py-space-lg">
      <div className="content-container flex flex-col items-center justify-between gap-space-md md:flex-row">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            public
          </span>

          <span className="font-card-title text-card-title text-on-surface">
            Shadow Economy Map
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Shadow Economy Map. All rights reserved.
        </p>

        <div className="flex gap-4 font-body-sm text-body-sm text-[var(--color-text-muted)]">
          <a href="#" className="hover:text-primary">
            Terms
          </a>
          <a href="#" className="hover:text-primary">
            Privacy
          </a>
          <a href="#" className="hover:text-primary">
            Data Sources
          </a>
          <a href="#" className="hover:text-primary">
            API Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
