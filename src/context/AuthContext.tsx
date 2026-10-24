// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth.api';
import type { User, LoginDTO, RegisterDTO, UpdateProfileDTO } from '@/types';
import { formatApiError } from '@/lib/axios';
import { useToast } from './ToastContext';

export type AuthModalTab = 'login' | 'register' | 'forgot' | 'reset';

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileDTO) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');

  const { toast } = useToast();

  const openAuthModal = useCallback((tab: AuthModalTab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Sync token and user to localStorage
  const handleSetAuth = useCallback((newToken: string | null, newUser: User | null) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (newUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch {
      // If fetching user profile fails with invalid token, logout
      handleSetAuth(null, null);
    }
  }, [token, handleSetAuth]);

  // Initial load: verify token and fetch user
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        try {
          const freshUser = await authApi.getMe();
          if (mounted) {
            setUser(freshUser);
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          }
        } catch {
          if (mounted) {
            handleSetAuth(null, null);
          }
        }
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      mounted = false;
    };
  }, [handleSetAuth]);

  const login = useCallback(
    async (credentials: LoginDTO) => {
      try {
        const response = await authApi.login(credentials);
        handleSetAuth(response.token, response.user);
        closeAuthModal();
        toast.success(`Welcome back, ${response.user.fullName || response.user.email}!`);
      } catch (err) {
        const errorMsg = formatApiError(err);
        toast.error(errorMsg, { title: 'Login Failed' });
        throw err;
      }
    },
    [handleSetAuth, closeAuthModal, toast]
  );

  const register = useCallback(
    async (data: RegisterDTO) => {
      try {
        const response = await authApi.register(data);
        handleSetAuth(response.token, response.user);
        closeAuthModal();
        toast.success('Account created successfully! Check your inbox to verify your email.');
      } catch (err) {
        const errorMsg = formatApiError(err);
        toast.error(errorMsg, { title: 'Registration Failed' });
        throw err;
      }
    },
    [handleSetAuth, closeAuthModal, toast]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed even if network fails
    } finally {
      handleSetAuth(null, null);
      toast.info('You have been signed out.');
    }
  }, [handleSetAuth, toast]);

  const updateProfile = useCallback(
    async (data: UpdateProfileDTO) => {
      try {
        const updated = await authApi.updateMe(data);
        setUser(updated);
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        toast.success('Profile updated successfully.');
      } catch (err) {
        const errorMsg = formatApiError(err);
        toast.error(errorMsg, { title: 'Update Failed' });
        throw err;
      }
    },
    [toast]
  );

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
