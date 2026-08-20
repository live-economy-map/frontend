// src/components/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-space-margin-mobile md:p-space-margin-desktop">
      <div className="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-xl bg-surface-container-lowest soft-shadow md:flex-row">
        {/* Left: decorative panel, desktop only */}
        <div className="relative hidden bg-surface-container-low md:flex md:flex-col md:items-center md:justify-center md:w-1/2 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <img src="/ecolens-tr.png" alt="EcoLens" className="h-16 w-auto object-contain mb-2" />
            <span className="text-2xl font-bold text-on-surface">EcoLens</span>
            <p className="text-sm text-text-muted max-w-xs">
              Economic Intelligence & Earth Observation Platform
            </p>
          </div>
        </div>

        {/* Right: form slot */}
        <div className="flex w-full flex-col justify-center p-space-xl md:w-1/2">
          {/* Mobile brand mark, hidden on desktop */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <img src="/ecolens-tr.png" alt="EcoLens" className="h-8 w-auto object-contain" />
            <span className="font-card-title text-card-title text-on-surface font-bold">
              EcoLens
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
