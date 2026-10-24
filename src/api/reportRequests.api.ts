// src/api/reportRequests.api.ts
import api from '@/lib/axios';
import type { ReportRequest, CreateReportRequestDTO } from '@/types';

export const reportRequestsApi = {
  async createRequest(data: CreateReportRequestDTO): Promise<ReportRequest> {
    try {
      const response = await api.post<ReportRequest>('/report-requests', data);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const response = await api.post<ReportRequest>('/me/report-requests', data);
        return response.data;
      }
      throw err;
    }
  },

  async getMyRequests(): Promise<ReportRequest[]> {
    try {
      const response = await api.get<ReportRequest[] | { items: ReportRequest[] }>(
        '/report-requests'
      );
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (
        data &&
        typeof data === 'object' &&
        'items' in data &&
        Array.isArray((data as { items: ReportRequest[] }).items)
      ) {
        return (data as { items: ReportRequest[] }).items;
      }
      return [];
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const response = await api.get<ReportRequest[] | { items: ReportRequest[] }>(
          '/me/report-requests'
        );
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          Array.isArray((data as { items: ReportRequest[] }).items)
        ) {
          return (data as { items: ReportRequest[] }).items;
        }
        return [];
      }
      throw err;
    }
  },

  async getRequestById(id: string): Promise<ReportRequest> {
    try {
      const response = await api.get<ReportRequest>(`/report-requests/${id}`);
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        const response = await api.get<ReportRequest>(`/me/report-requests/${id}`);
        return response.data;
      }
      throw err;
    }
  },
};
