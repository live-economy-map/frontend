// Static public footer. Terms/Privacy/Data Sources/API Documentation have no
// routes yet — rendered as `#` placeholders per 9.4.
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border-base bg-surface-container-lowest">
      <div className="content-container flex flex-col items-center justify-between gap-space-lg px-space-gutter py-space-xl md:flex-row">
        <div className="flex items-center gap-2 text-card-title font-bold text-on-surface">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            travel_explore
          </span>
          Shadow Economy Map
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a href="#" className="text-body-sm text-text-muted hover:text-primary hover:underline">
            Terms of Service
          </a>
          <a href="#" className="text-body-sm text-text-muted hover:text-primary hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="text-body-sm text-text-muted hover:text-primary hover:underline">
            Data Sources
          </a>
          <a href="#" className="text-body-sm text-text-muted hover:text-primary hover:underline">
            API Documentation
          </a>
        </nav>

        <div className="text-body-sm text-text-secondary">
          © 2024 Shadow Economy Map. Precision Geographic Analytics.
        </div>
      </div>
    </footer>
  );
}
