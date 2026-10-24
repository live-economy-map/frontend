// src/api/apiKeys.api.ts
import api from '@/lib/axios';
import type { ApiKey, CreateApiKeyDTO, ApiUsage } from '@/types';

export const apiKeysApi = {
  async getMyKeys(): Promise<ApiKey[]> {
    const response = await api.get<ApiKey[]>('/me/api-keys');
    return response.data;
  },

  async createKey(data: CreateApiKeyDTO): Promise<ApiKey> {
    const response = await api.post<ApiKey>('/me/api-keys', data);
    return response.data;
  },

  async deleteKey(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/me/api-keys/${id}`);
    return response.data;
  },

  async getMyUsage(): Promise<ApiUsage> {
    const response = await api.get<ApiUsage>('/me/usage');
    return response.data;
  },
};
