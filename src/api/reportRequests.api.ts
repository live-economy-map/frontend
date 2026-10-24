// src/api/reportRequests.api.ts
import api from '@/lib/axios';
import type { ReportRequest, CreateReportRequestDTO } from '@/types';

export const reportRequestsApi = {
  async createRequest(data: CreateReportRequestDTO): Promise<ReportRequest> {
    const response = await api.post<ReportRequest>('/me/report-requests', data);
    return response.data;
  },

  async getMyRequests(): Promise<ReportRequest[]> {
    const response = await api.get<ReportRequest[]>('/me/report-requests');
    return response.data;
  },

  async getRequestById(id: string): Promise<ReportRequest> {
    const response = await api.get<ReportRequest>(`/me/report-requests/${id}`);
    return response.data;
  },
};
