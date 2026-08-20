// src/components/layouts/PublicLayout.tsx
import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/about', label: 'About' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <div
      className={cn(
        'flex flex-col bg-white',
        isMapPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      )}
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-200 shrink-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 font-bold text-gray-900 group">
            <img
              src="/ecolens-tr.png"
              alt="EcoLens Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight text-gray-900">EcoLens</span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-blue-600',
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Header Action Button */}
          <button
            onClick={() => navigate('/map')}
            className="hidden md:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Shield className="h-4 w-4" />
            Explore the Map
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Page Area */}
      <main className={cn('flex-1', isMapPage ? 'overflow-hidden' : 'overflow-auto')}>
        <Outlet />
      </main>

      {/* Global Footer (shown on all public pages except fullscreen Map) */}
      {!isMapPage && (
        <footer className="border-t border-gray-100 bg-white py-6 shrink-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/ecolens-tr.png" alt="EcoLens" className="h-6 w-auto object-contain" />
              <p className="text-xs text-gray-500 font-medium">
                © {new Date().getFullYear()} EcoLens. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/methodology"
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                Methodology
              </Link>
              <Link
                to="/about"
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
