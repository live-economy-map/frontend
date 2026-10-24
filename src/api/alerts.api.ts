// src/api/alerts.api.ts
import api from '@/lib/axios';
import type { SpatialAlert, CreateAlertDTO, UpdateAlertDTO, AppNotification } from '@/types';

export const alertsApi = {
  async getMyAlerts(): Promise<SpatialAlert[]> {
    const response = await api.get<SpatialAlert[] | { items: SpatialAlert[] }>('/me/alerts');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (
      data &&
      typeof data === 'object' &&
      'items' in data &&
      Array.isArray((data as { items: SpatialAlert[] }).items)
    ) {
      return (data as { items: SpatialAlert[] }).items;
    }
    return [];
  },

  async createAlert(data: CreateAlertDTO): Promise<SpatialAlert> {
    const response = await api.post<SpatialAlert>('/me/alerts', data);
    return response.data;
  },

  async updateAlert(id: string, data: UpdateAlertDTO): Promise<SpatialAlert> {
    const response = await api.patch<SpatialAlert>(`/me/alerts/${id}`, data);
    return response.data;
  },

  async deleteAlert(id: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/me/alerts/${id}`);
    return response.data;
  },

  async getMyNotifications(): Promise<AppNotification[]> {
    const response = await api.get<AppNotification[] | { items: AppNotification[] }>(
      '/me/notifications'
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (
      data &&
      typeof data === 'object' &&
      'items' in data &&
      Array.isArray((data as { items: AppNotification[] }).items)
    ) {
      return (data as { items: AppNotification[] }).items;
    }
    return [];
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>(`/me/notifications/${id}/read`);
    return response.data;
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const response = await api.patch<{ success: boolean }>('/me/notifications/read-all');
    return response.data;
  },
};
