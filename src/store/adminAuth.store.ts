// src/store/adminAuth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminIdentity } from '@/types';

interface AdminAuthState {
  token: string | null;
  admin: AdminIdentity | null;
  setAuth: (token: string, admin: AdminIdentity) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      setAuth: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
