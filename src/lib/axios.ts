// src/lib/axios.ts
import axios from 'axios';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types';
import { ROUTES } from '@/constants';

const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach admin JWT token when present.
// Public endpoints proceed without the header on the same client instance
// (per frontend conventions 0.4) — no separate unauthenticated client needed.
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('admin-auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // malformed storage, skip attaching token
    }
  }
  return config;
});

// Response interceptor — unwrap the backend's SuccessResponse envelope,
// and handle 401 globally
api.interceptors.response.use(
  (response) => {
    // Backend always responds with { statusCode, success, message, data }.
    // Unwrap here once so every caller can keep doing `res.data` and get
    // the actual payload, not the envelope.
    const body = response.data as ApiResponse<unknown>;
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    // A 401 can only ever come from an /admin/* call — public endpoints
    // never return 401 (per frontend conventions 0.6). Only redirect when
    // the failing request's URL actually matches /admin/, and always to
    // the admin login route specifically — never a generic /login, since
    // public visitors never log in at all.
    const requestUrl: string = error.config?.url ?? '';
    if (error.response?.status === 401 && requestUrl.includes('/admin/')) {
      localStorage.removeItem('admin-auth-storage');
      window.location.href = ROUTES.ADMIN_LOGIN;
    }
    return Promise.reject(error);
  }
);

export default api;
