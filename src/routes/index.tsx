import React from 'react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import PublicLayout from '@/components/layouts/PublicLayout';
import { ROUTES } from '@/constants';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const CaseStudiesListPage = lazy(() => import('@/pages/CaseStudiesListPage'));
const CaseStudyDetailPage = lazy(() => import('@/pages/CaseStudyDetailPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );
}

// Wrap each lazy element so Suspense boundaries stay per-page,
// matching the granularity your original Suspense had.
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.CASE_STUDIES, element: withSuspense(<CaseStudiesListPage />) },
      { path: ROUTES.CASE_STUDY_DETAIL, element: withSuspense(<CaseStudyDetailPage />) },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: ROUTES.HOME, element: withSuspense(<DashboardPage />) }],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export default router;
