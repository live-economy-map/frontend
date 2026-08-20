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
  const adminStorage =
    localStorage.getItem('admin-auth-storage') || localStorage.getItem('auth-storage');
  if (adminStorage) {
    try {
      const { state } = JSON.parse(adminStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // malformed storage
    }
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
      localStorage.removeItem('auth-storage');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
