// src/api/map.api.ts
import api from '@/lib/axios';
import type { CellChatRequest, CellChatResponse } from '@/types';

export const mapApi = {
  async chatWithCell(cellId: string, payload: CellChatRequest): Promise<CellChatResponse> {
    const response = await api.post<CellChatResponse>(`/map/cells/${cellId}/chat`, payload);
    return response.data;
  },
};
