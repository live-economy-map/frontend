// src/components/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-space-margin-mobile md:p-space-margin-desktop">
      <div className="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-xl bg-surface-container-lowest soft-shadow md:flex-row">
        {/* Left: decorative panel, desktop only. No image asset uploaded yet —
            solid brand-tinted panel as placeholder until one is provided. */}
        <div className="relative hidden bg-surface-container-low md:block md:w-1/2">
          <div className="absolute left-8 top-8 flex items-center gap-2">
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
        </div>

        {/* Right: form slot */}
        <div className="flex w-full flex-col justify-center p-space-xl md:w-1/2">
          {/* Mobile brand mark, hidden on desktop */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
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

          <Outlet />
        </div>
      </div>
    </div>
  );
}
