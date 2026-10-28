// src/components/layouts/PublicLayout.tsx
import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Bookmark,
  FileText,
  Key,
  Layers,
  CreditCard,
  LogOut,
  Settings,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import EmailVerifyBanner from '@/components/auth/EmailVerifyBanner';
import AuthModal from '@/components/auth/AuthModal';
import SavedAreasDrawer from '@/components/saved-areas/SavedAreasDrawer';
import ProfileSettingsModal from '@/components/auth/ProfileSettingsModal';
import NotificationBell from '@/components/notifications/NotificationBell';
import OrgSwitcher from '@/components/orgs/OrgSwitcher';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/about', label: 'About' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSavedAreasOpen, setIsSavedAreasOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : 'U';

  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-gray-950',
        isMapPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      )}
    >
      {/* Email Verification Banner */}
      <EmailVerifyBanner />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 font-bold text-gray-900 dark:text-white group"
          >
            <img
              src="/ecolens-tr.png"
              alt="EcoLens Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              EcoLens
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-xs font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-600 dark:text-gray-300'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Org Switcher */}
            {isAuthenticated && <OrgSwitcher />}

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* Explore Map Button */}
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Explore Map</span>
            </button>

            {/* Auth State Button / User Dropdown */}
            {!isAuthenticated ? (
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-gray-100 dark:divide-gray-800 space-y-1">
                    {/* User Profile Summary */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {user?.fullName || 'User Account'}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {user?.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email}</p>

                      {/* Plan Status Badge */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border',
                            user?.planTier === 'ENTERPRISE'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                              : user?.planTier === 'PRO'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                          )}
                        >
                          {user?.plan || 'Free Plan'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsSavedAreasOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-blue-600" />
                        <span>My Saved Areas</span>
                      </button>

                      <Link
                        to="/my-requests"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>My Analysis Requests</span>
                      </Link>

                      <Link
                        to="/watchlists"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Multi-Cell Watchlists</span>
                      </Link>

                      <Link
                        to="/developer"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Key className="w-4 h-4 text-purple-600" />
                        <span>Developer API Keys</span>
                      </Link>

                      <Link
                        to="/pricing"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Pricing & Plans</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsProfileOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Profile Settings</span>
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
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

            {isAuthenticated ? (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setIsSavedAreasOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-blue-600" />
                  <span>My Saved Areas</span>
                </button>
                <NavLink
                  to="/my-requests"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  My Requests
                </NavLink>
                <NavLink
                  to="/watchlists"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Watchlists
                </NavLink>
                <NavLink
                  to="/developer"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Developer API
                </NavLink>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Sign In / Register
                </button>
              </div>
            )}
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
                to="/pricing"
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/developer"
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                Developer API
              </Link>
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

      {/* Modals & Drawers */}
      <AuthModal />
      <SavedAreasDrawer isOpen={isSavedAreasOpen} onClose={() => setIsSavedAreasOpen(false)} />
      <ProfileSettingsModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
