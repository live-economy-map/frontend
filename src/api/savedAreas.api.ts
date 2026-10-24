// src/api/savedAreas.api.ts
import api from '@/lib/axios';
import type { SavedArea, CreateSavedAreaDTO, UpdateSavedAreaDTO } from '@/types';

export const savedAreasApi = {
  async getSavedAreas(): Promise<SavedArea[]> {
    const response = await api.get<SavedArea[]>('/me/saved-areas');
    return response.data;
  },

  async createSavedArea(data: CreateSavedAreaDTO): Promise<SavedArea> {
    const response = await api.post<SavedArea>('/me/saved-areas', data);
    return response.data;
  },

  async updateSavedArea(id: string, data: UpdateSavedAreaDTO): Promise<SavedArea> {
    const response = await api.patch<SavedArea>(`/me/saved-areas/${id}`, data);
    return response.data;
  },

  async deleteSavedArea(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/me/saved-areas/${id}`);
    return response.data;
  },
};
