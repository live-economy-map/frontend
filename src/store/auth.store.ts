// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser } from '@/types';

export interface AdminProfile {
  id: string;
  email: string;
  role?: string;
}

export interface AuthState {
  token: string | null;
  admin: AdminProfile | AdminUser | null;
  setAuth: (token: string, admin: AdminProfile | AdminUser) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      clearAuth: () => set({ token: null, admin: null }),
      logout: () => set({ token: null, admin: null }),
    }),
    { name: 'auth-storage' }
  )
);

export { useAdminAuthStore } from './adminAuth.store';
