// src/api/admin/reportRequests.api.ts
import api from '@/lib/axios';
import type {
  ReportRequest,
  UpdateReportRequestAdminDTO,
  AddDeliverableDTO,
  ReportDeliverable,
  DemandMetrics,
  PaginatedResponse,
} from '@/types';

export interface AdminReportRequestsQuery {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const adminReportRequestsApi = {
  async getRequests(
    query?: AdminReportRequestsQuery
  ): Promise<PaginatedResponse<ReportRequest> | ReportRequest[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.search) params.append('search', query.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<PaginatedResponse<ReportRequest> | ReportRequest[]>(
      `/admin/report-requests${queryString}`
    );
    return response.data;
  },

  async updateRequest(id: string, data: UpdateReportRequestAdminDTO): Promise<ReportRequest> {
    const response = await api.patch<ReportRequest>(`/admin/report-requests/${id}`, data);
    return response.data;
  },

  async addDeliverable(id: string, data: AddDeliverableDTO): Promise<ReportDeliverable> {
    const response = await api.post<ReportDeliverable>(
      `/admin/report-requests/${id}/deliverable`,
      data
    );
    return response.data;
  },

  async getDemandMetrics(): Promise<DemandMetrics> {
    const response = await api.get<DemandMetrics>('/admin/metrics/demand');
    return response.data;
  },
};
