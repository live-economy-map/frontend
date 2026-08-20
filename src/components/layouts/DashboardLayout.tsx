// src/components/layouts/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/common/AdminSidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      <main className="h-screen overflow-y-auto md:ml-[220px]">
        {/* Mobile header — hamburger only, no menu state/drawer spec'd yet;
            trivial and layout-specific, kept inline per 9-ui-foundation-spec.md §9.4 */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-base bg-surface/80 px-space-margin-mobile shadow-nav backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <img src="/ecolens-tr.png" alt="EcoLens" className="h-7 w-auto object-contain" />
            <span className="font-card-title text-card-title font-bold text-on-surface">
              EcoLens
            </span>
          </div>

          <button
            className="rounded-lg p-2 text-text-muted hover:bg-surface-container"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className="content-container flex flex-col gap-space-xl py-space-margin-mobile md:py-space-margin-desktop">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
