// src/api/export.api.ts
import api from '@/lib/axios';

export interface ExportParams {
  format: 'CSV' | 'JSON';
  cellIds?: string[];
  from?: string;
  to?: string;
}

export const exportApi = {
  async downloadExport(params: ExportParams): Promise<Blob> {
    const searchParams = new URLSearchParams();
    searchParams.append('format', params.format);
    if (params.cellIds && params.cellIds.length > 0) {
      searchParams.append('cellIds', params.cellIds.join(','));
    }
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);

    const response = await api.get(`/me/export?${searchParams.toString()}`, {
      responseType: 'blob',
    });

    return response.data as Blob;
  },
};
