import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Activity, SlidersHorizontal, BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { ROUTES } from '@/constants';
import { useAdminAuthStore } from '@/store/adminAuth.store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Pipeline Health', to: ROUTES.ADMIN_PIPELINE, icon: Activity },
  { label: 'Weight Config', to: ROUTES.ADMIN_WEIGHT_CONFIGS, icon: SlidersHorizontal },
  { label: 'Case Studies', to: ROUTES.ADMIN_CASE_STUDIES, icon: BookOpen },
] as const;

export function AdminSidebar() {
  const location = useLocation();
  const logout = useAdminAuthStore((s) => s.logout);
  const admin = useAdminAuthStore((s) => s.admin);

  const { mutate: doLogout } = useMutation({
    mutationFn: () => api.post('/admin/auth/logout'),
    onSettled: () => logout(),
  });

  const adminInitial = admin?.email ? admin.email.charAt(0).toUpperCase() : 'A';

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200/80 bg-white md:flex">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <img
            src="/ecolens-tr.png"
            alt="EcoLens"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-gray-900 tracking-tight leading-none">
              EcoLens
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-0.5">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Admin User Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
          {adminInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-900 truncate">Administrator</p>
          <p className="text-[11px] text-gray-500 truncate">
            {admin?.email || 'admin@ecolens.org'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 flex-col gap-1 px-3 py-2 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Management
        </p>
        {NAV_LINKS.map(({ label, to, icon: Icon }) => {
          const isActive = location.pathname === to;

          return (
            <Link
              key={label}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn('w-4 h-4 shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Navigation: Back to public map & Logout */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <span>Public Map</span>
        </Link>
        <button
          onClick={() => doLogout()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
