// src/components/common/AdminSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { ROUTES } from '@/constants';
import { useAdminAuthStore } from '@/store/adminAuth.store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Pipeline', to: ROUTES.ADMIN_PIPELINE, icon: 'account_tree' },
  { label: 'Weight Config', to: ROUTES.ADMIN_WEIGHT_CONFIGS, icon: 'tune' },
  { label: 'Case Studies', to: ROUTES.ADMIN_CASE_STUDIES, icon: 'library_books' },
] as const;

export function AdminSidebar() {
  const location = useLocation();
  const logout = useAdminAuthStore((s) => s.logout);
  const admin = useAdminAuthStore((s) => s.admin);

  // NOTE: mirrors the useAdminLogout contract from 04-admin-access-frontend.md §4.4 —
  // onSettled clears local state even if the API call itself fails, so the admin
  // is never stuck unable to log out client-side. Once src/hooks/useAdminAuth.ts
  // exists (Phase D), replace this with `const { mutate: doLogout } = useAdminLogout()`
  // and call `doLogout()` below — same behavior, shared implementation.
  const { mutate: doLogout } = useMutation({
    mutationFn: () => api.post('/admin/auth/logout'),
    onSettled: () => logout(),
  });

  return (
    <nav className="fixed left-0 top-0 z-10 hidden h-screen w-[220px] shrink-0 flex-col border-r border-border-base bg-[var(--color-secondary-fixed,#dce3ed)] md:flex">
      <div className="mb-space-sm flex flex-col items-start gap-space-md border-b border-border-base p-space-gutter">
        <span className="font-card-title text-card-title font-bold text-[var(--color-on-secondary-fixed-variant,#40474f)]">
          Shadow Economy Map
        </span>

        <div className="mt-space-sm flex items-center gap-space-sm">
          <div className="h-8 w-8 rounded-full bg-surface shadow-sm" />

          <div>
            <div className="font-card-title text-card-title text-on-surface">Admin Panel</div>

            {admin?.email && (
              <div className="font-body-sm text-body-sm text-[var(--color-text-muted)]">
                {admin.email}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-space-sm overflow-y-auto py-space-sm">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.label}
              to={link.to}
              className={cn(
                'mx-2 my-1 flex items-center gap-3 rounded-lg px-4 py-3 font-label-caps text-label-caps transition-all duration-200',
                isActive
                  ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container,#fefcff)]'
                  : 'text-[var(--color-on-secondary-fixed-variant,#40474f)] hover:bg-[var(--color-secondary-fixed-dim,#c0c7d1)]'
              )}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto border-t border-border-base p-space-sm">
        <button
          onClick={() => doLogout()}
          className="mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps text-[var(--color-on-secondary-fixed-variant,#40474f)] transition-all duration-200 hover:bg-[var(--color-secondary-fixed-dim,#c0c7d1)]"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </nav>
  );
}
