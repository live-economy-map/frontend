// src/api/watchlists.api.ts
import api from '@/lib/axios';
import type { Watchlist, CreateWatchlistDTO, AddWatchlistItemDTO, WatchlistItem } from '@/types';

export const watchlistsApi = {
  async getWatchlists(): Promise<Watchlist[]> {
    const response = await api.get<Watchlist[]>('/watchlists');
    return response.data;
  },

  async getWatchlistById(id: string): Promise<Watchlist> {
    const response = await api.get<Watchlist>(`/watchlists/${id}`);
    return response.data;
  },

  async createWatchlist(data: CreateWatchlistDTO): Promise<Watchlist> {
    const response = await api.post<Watchlist>('/watchlists', data);
    return response.data;
  },

  async addItem(watchlistId: string, data: AddWatchlistItemDTO): Promise<WatchlistItem> {
    const response = await api.post<WatchlistItem>(`/watchlists/${watchlistId}/items`, data);
    return response.data;
  },

  async removeItem(watchlistId: string, cellId: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(
      `/watchlists/${watchlistId}/items/${cellId}`
    );
    return response.data;
  },
};
