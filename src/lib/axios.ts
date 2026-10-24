import axios from 'axios';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types';

const normalizedBaseUrl = (env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedBaseUrl || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('auth_token');
  if (!token) {
    const adminStorage =
      localStorage.getItem('admin-auth-storage') || localStorage.getItem('auth-storage');
    if (adminStorage) {
      try {
        const { state } = JSON.parse(adminStorage);
        if (state?.token) {
          token = state.token;
        }
      } catch {
        // malformed storage
      }
    }
  }

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
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.url?.includes('/admin/') &&
      !error.config?.url?.includes('/admin/auth/login')
    ) {
      localStorage.removeItem('admin-auth-storage');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export function formatApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const errs = (data as { errors?: string[] }).errors;
      if (Array.isArray(errs) && errs.length > 0) {
        return errs.join(', ');
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
