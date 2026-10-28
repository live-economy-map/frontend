import axios from 'axios';
import { env } from '@/config/env';

const normalizedBaseUrl = (env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedBaseUrl || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  let adminToken: string | null = null;
  const adminStorage =
    localStorage.getItem('admin-auth-storage') || localStorage.getItem('auth-storage');
  if (adminStorage) {
    try {
      const { state } = JSON.parse(adminStorage);
      if (state?.token) {
        adminToken = state.token;
      }
    } catch {
      // malformed storage
    }
  }

  const userToken = localStorage.getItem('auth_token');

  // If making an admin request, prioritize adminToken, fallback to userToken
  const isAdminRequest =
    config.url?.startsWith('/admin') ||
    config.url?.includes('/admin/') ||
    config.url?.includes('/admin');

  const token = isAdminRequest ? adminToken || userToken : userToken || adminToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const activeOrgId = localStorage.getItem('active_org_id');
  if (activeOrgId) {
    config.headers['x-org-id'] = activeOrgId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (
      body &&
      typeof body === 'object' &&
      !(typeof Blob !== 'undefined' && body instanceof Blob) &&
      'data' in body
    ) {
      const envelope = body as { data?: unknown; success?: boolean; message?: string };
      if (envelope.data !== null && envelope.data !== undefined) {
        response.data = envelope.data;
      } else if (envelope.success !== undefined) {
        response.data = { success: envelope.success, message: envelope.message };
      } else {
        response.data = envelope.data;
      }
    }
    return response;
  },
  (error) => {
    const isAdminUrl =
      error.config?.url?.startsWith('/admin') ||
      error.config?.url?.includes('/admin/') ||
      error.config?.url?.includes('/admin');

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      isAdminUrl &&
      !error.config?.url?.includes('/admin/auth/login')
    ) {
      // Only clear storage and redirect if user is actively in the admin section
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin-auth-storage');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const errs = (data as { errors?: Array<string | { message?: string }> }).errors;
      if (Array.isArray(errs) && errs.length > 0) {
        return errs
          .map((item) => (typeof item === 'string' ? item : item?.message || JSON.stringify(item)))
          .filter(Boolean)
          .join(', ');
      }
      const msg = (data as { message?: string }).message;
      if (msg) return msg;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

export default api;
