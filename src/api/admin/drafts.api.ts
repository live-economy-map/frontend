// src/api/admin/drafts.api.ts
import api from '@/lib/axios';
import type { ReportDraft } from '@/types';

export const adminDraftsApi = {
  async generateDraft(reportRequestId: string): Promise<ReportDraft> {
    const response = await api.post<ReportDraft>(
      `/admin/report-requests/${reportRequestId}/generate-draft`
    );
    return response.data;
  },

  async getDraft(id: string): Promise<ReportDraft> {
    const response = await api.get<ReportDraft>(`/admin/report-drafts/${id}`);
    return response.data;
  },

  async updateDraft(
    id: string,
    data: { draftContent: string; reviewNotes?: string }
  ): Promise<ReportDraft> {
    const response = await api.patch<ReportDraft>(`/admin/report-drafts/${id}`, data);
    return response.data;
  },

  async deliverDraft(
    id: string,
    data: { fileName: string }
  ): Promise<{ success: boolean; fileUrl: string }> {
    const response = await api.post<{ success: boolean; fileUrl: string }>(
      `/admin/report-drafts/${id}/deliver`,
      data
    );
    return response.data;
  },
};
