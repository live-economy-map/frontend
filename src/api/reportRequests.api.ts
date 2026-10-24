// src/api/reportRequests.api.ts
import api from '@/lib/axios';
import type { ReportRequest, CreateReportRequestDTO } from '@/types';

export const reportRequestsApi = {
  async createRequest(data: CreateReportRequestDTO): Promise<ReportRequest> {
    const response = await api.post<ReportRequest>('/me/report-requests', data);
    return response.data;
  },

  async getMyRequests(): Promise<ReportRequest[]> {
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
  },

  async getRequestById(id: string): Promise<ReportRequest> {
    const response = await api.get<ReportRequest>(`/me/report-requests/${id}`);
    return response.data;
  },
};
