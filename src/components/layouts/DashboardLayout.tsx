// src/components/layouts/DashboardLayout.tsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Activity,
  SlidersHorizontal,
  BookOpen,
  LogOut,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { AdminSidebar } from '@/components/common/AdminSidebar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ROUTES } from '@/constants';
import { useAdminAuthStore } from '@/store/adminAuth.store';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Pipeline Health', to: ROUTES.ADMIN_PIPELINE, icon: Activity },
  { label: 'Weight Config', to: ROUTES.ADMIN_WEIGHT_CONFIGS, icon: SlidersHorizontal },
  { label: 'Case Studies', to: ROUTES.ADMIN_CASE_STUDIES, icon: BookOpen },
  { label: 'Report Requests', to: ROUTES.ADMIN_REQUESTS, icon: FileText },
] as const;

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const logout = useAdminAuthStore((s) => s.logout);

  const { mutate: doLogout } = useMutation({
    mutationFn: () => api.post('/admin/auth/logout'),
    onSettled: () => logout(),
  });

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row selection:bg-primary/20">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          <div className="p-4 border-b border-border-base flex items-center justify-between">
            <Link
              to={ROUTES.HOME}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <img src="/ecolens-tr.png" alt="EcoLens" className="h-7 w-auto object-contain" />
              <span className="font-bold text-on-surface">EcoLens Admin</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Management
            </p>
            <div className="space-y-1">
              {NAV_LINKS.map(({ label, to, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-primary' : 'text-on-surface-variant'
                      )}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-border-base space-y-1">
          <Link
            to={ROUTES.HOME}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Map</span>
          </Link>
          <button
            onClick={() => doLogout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-60 min-w-0">
        {/* Desktop Top Bar (theme toggle lives here on md+ screens) */}
        <div className="sticky top-0 z-20 hidden h-14 items-center justify-end border-b border-border-base bg-surface/80 px-6 backdrop-blur-md md:flex">
          <ThemeToggle />
        </div>

        {/* Mobile Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-base bg-surface/90 px-4 shadow-xs backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <img src="/ecolens-tr.png" alt="EcoLens" className="h-6 w-auto object-contain" />
            <span className="font-bold text-on-surface text-sm">EcoLens Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
