import { useAdminAuthStore } from '@/store/adminAuth.store';
import api from '@/lib/axios';
import type { AdminLoginCredentials, AdminUser, AdminLoginResponse } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

// ---------- useAdminLogin ----------
export function useAdminLogin() {
  const setAuth = useAdminAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (credentials: AdminLoginCredentials) => {
      const { data } = await api.post<AdminLoginResponse>('/admin/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      // Set auth state – the PublicRoute guard will automatically redirect
      // to ADMIN_DASHBOARD because token is now non-null.
      setAuth(data.token, data.admin);
    },
    // No imperative navigate() – redirection is declarative via the route guard.
  });
}

// ---------- useAdminLogout ----------
export function useAdminLogout() {
  const logout = useAdminAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => api.post('/admin/auth/logout'),
    // Clear local state even if the API call fails (onSettled, not onSuccess)
    onSettled: () => {
      logout();
    },
  });
}

// ---------- useAdminMe ----------
export function useAdminMe() {
  const token = useAdminAuthStore((s) => s.token);

  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ME],
    queryFn: async () => {
      const { data } = await api.get<AdminUser>('/admin/auth/me');
      return data;
    },
    enabled: !!token, // only run if we have a token
    retry: false, // let the 401 interceptor handle failures
  });
}
