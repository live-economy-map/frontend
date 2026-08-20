import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '@/store/adminAuth.store';
import { ROUTES } from '@/constants';

export default function ProtectedRoute() {
  const token = useAdminAuthStore((s) => s.token);
  return token ? <Outlet /> : <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
}
