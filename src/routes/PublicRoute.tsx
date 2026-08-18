import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '@/store/adminAuth.store';
import { ROUTES } from '@/constants';

export default function PublicRoute() {
  const token = useAdminAuthStore((s) => s.token);
  return token ? <Navigate to={ROUTES.ADMIN_DASHBOARD} replace /> : <Outlet />;
}
