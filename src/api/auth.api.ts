// src/api/auth.api.ts
import api from '@/lib/axios';
import type {
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  User,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  UpdateProfileDTO,
} from '@/types';

export const authApi = {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { token }
    );
    return response.data;
  },

  async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/resend-verification'
    );
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordDTO): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      data
    );
    return response.data;
  },

  async resetPassword(data: ResetPasswordDTO): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      data
    );
    return response.data;
  },

  async getMe(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/me');
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const response = await api.get<User>('/me');
        return response.data;
      }
      throw err;
    }
  },

  async updateMe(data: UpdateProfileDTO): Promise<User> {
    try {
      const response = await api.patch<User>('/auth/me', data);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const response = await api.patch<User>('/me', data);
        return response.data;
      }
      throw err;
    }
  },
};
