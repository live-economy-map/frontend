// src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import PublicLayout from '@/components/layouts/PublicLayout';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import { ROUTES } from '@/constants';

// Public pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const GrowthMapPage = lazy(() => import('@/pages/map/GrowthMapPage'));
const CaseStudiesListPage = lazy(() => import('@/pages/CaseStudiesListPage'));
const CaseStudyDetailPage = lazy(() => import('@/pages/CaseStudyDetailPage'));
const MethodologyPage = lazy(() => import('@/pages/MethodologyPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PricingPage = lazy(() => import('@/pages/billing/PricingPage'));
const CheckoutSuccessPage = lazy(() => import('@/pages/billing/CheckoutSuccessPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const MyRequestsPage = lazy(() => import('@/pages/requests/MyRequestsPage'));
const DeveloperDashboardPage = lazy(() => import('@/pages/developer/DeveloperDashboardPage'));
const WatchlistsDashboardPage = lazy(() => import('@/pages/watchlists/WatchlistsDashboardPage'));

// Admin pages
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const PipelineManagementPage = lazy(() => import('@/pages/admin/PipelineManagementPage'));
const WeightConfigPage = lazy(() => import('@/pages/admin/WeightConfigPage'));
const CaseStudyCurationPage = lazy(() => import('@/pages/admin/CaseStudyCurationPage'));
const AdminRequestsPage = lazy(() => import('@/pages/admin/AdminRequestsPage'));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

// Wrap each lazy element so Suspense boundaries stay per-page.
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

const router = createBrowserRouter([
  // Public — no guard, PublicLayout
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(<LandingPage />) },
      { path: ROUTES.MAP, element: withSuspense(<GrowthMapPage />) },
      { path: ROUTES.CASE_STUDIES, element: withSuspense(<CaseStudiesListPage />) },
      { path: ROUTES.CASE_STUDY_DETAIL, element: withSuspense(<CaseStudyDetailPage />) },
      { path: ROUTES.METHODOLOGY, element: withSuspense(<MethodologyPage />) },
      { path: ROUTES.ABOUT, element: withSuspense(<AboutPage />) },
      { path: ROUTES.PRICING, element: withSuspense(<PricingPage />) },
      { path: ROUTES.CHECKOUT_SUCCESS, element: withSuspense(<CheckoutSuccessPage />) },
      { path: ROUTES.VERIFY_EMAIL, element: withSuspense(<VerifyEmailPage />) },
      { path: ROUTES.MY_REQUESTS, element: withSuspense(<MyRequestsPage />) },
      { path: ROUTES.DEVELOPER, element: withSuspense(<DeveloperDashboardPage />) },
      { path: ROUTES.WATCHLISTS, element: withSuspense(<WatchlistsDashboardPage />) },
    ],
  },

  // Admin login only — PublicRoute + AuthLayout
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.ADMIN_LOGIN,
            element: withSuspense(<AdminLoginPage />),
          },
        ],
      },
    ],
  },

  // Admin area — ProtectedRoute + DashboardLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.ADMIN_DASHBOARD,
            element: withSuspense(<AdminDashboardPage />),
          },
          {
            path: ROUTES.ADMIN_PIPELINE,
            element: withSuspense(<PipelineManagementPage />),
          },
          {
            path: ROUTES.ADMIN_WEIGHT_CONFIGS,
            element: withSuspense(<WeightConfigPage />),
          },
          {
            path: ROUTES.ADMIN_CASE_STUDIES,
            element: withSuspense(<CaseStudyCurationPage />),
          },
          {
            path: ROUTES.ADMIN_REQUESTS,
            element: withSuspense(<AdminRequestsPage />),
          },
        ],
      },
    ],
  },

  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export default router;
