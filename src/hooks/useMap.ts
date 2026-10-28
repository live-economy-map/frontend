// src/hooks/useMap.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { mapApi } from '@/api/map.api';
import { QUERY_KEYS } from '@/constants';
import type {
  GrowthCell,
  CellDetail,
  RawLayerCell,
  MapSearchResult,
  CellChatRequest,
} from '@/types';

export function useMapCells(period?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MAP_CELLS, period],
    queryFn: async () => {
      const response = await api.get<{
        period: string;
        periodSubstituted: boolean;
        cells: Array<{
          gridCell: {
            id: string;
            cellRow: number;
            cellCol: number;
            boundaryGeoJson: GeoJSON.Polygon;
          };
          compositeScore: number;
          isComplete: boolean;
        }>;
      }>('/map/cells', { params: { period } });

      // Support both nested gridCell structure and flat GrowthCell payloads
      interface IncomingCellPayload {
        gridCell?: {
          id: string;
          cellRow?: number;
          cellCol?: number;
          boundaryGeoJson?: GeoJSON.Polygon;
        };
        cellId?: string;
        id?: string;
        cellRow?: number;
        cellCol?: number;
        boundaryGeoJson?: GeoJSON.Polygon;
        compositeScore?: number;
        isComplete?: boolean;
      }

      const rawCells = (response.data?.cells || []) as IncomingCellPayload[];
      const flattenedCells: GrowthCell[] = rawCells.map((c) => ({
        cellId: c.gridCell?.id || c.cellId || c.id || '',
        cellRow: c.gridCell?.cellRow ?? c.cellRow ?? 0,
        cellCol: c.gridCell?.cellCol ?? c.cellCol ?? 0,
        boundaryGeoJson: (c.gridCell?.boundaryGeoJson || c.boundaryGeoJson) as GeoJSON.Polygon,
        compositeScore: c.compositeScore ?? 0,
        isComplete: Boolean(c.isComplete),
      }));

      return {
        period: response.data?.period || period || '',
        periodSubstituted: Boolean(response.data?.periodSubstituted),
        cells: flattenedCells,
      };
    },
  });
}

export function useCellDetail(cellId: string | null, period?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CELL_DETAIL, cellId, period],
    queryFn: () =>
      api.get<CellDetail>(`/map/cells/${cellId}`, { params: { period } }).then((r) => r.data),
    enabled: !!cellId,
  });
}

export function useRawLayer(sourceKey: 'VIIRS' | 'GHSL' | 'RWI' | null, period?: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.MAP_LAYER, sourceKey, period],
    queryFn: async () => {
      if (!sourceKey) return null;
      const response = await api.get<{
        sourceKey: string;
        period: string;
        periodSubstituted: boolean;
        cells: Array<{ gridCellId?: string; cellId?: string; normalizedValue: number }>;
      }>(`/map/layers/${sourceKey}`, { params: { period } });

      interface IncomingRawItem {
        gridCellId?: string;
        cellId?: string;
        id?: string;
        normalizedValue?: number;
      }

      const rawCells = (response.data?.cells || []) as IncomingRawItem[];
      const flattenedCells: RawLayerCell[] = rawCells.map((c) => ({
        cellId: c.gridCellId || c.cellId || c.id || '',
        normalizedValue: c.normalizedValue ?? 0,
      }));

      return {
        sourceKey: response.data?.sourceKey || sourceKey,
        period: response.data?.period || period || '',
        periodSubstituted: Boolean(response.data?.periodSubstituted),
        cells: flattenedCells,
      };
    },
    enabled: !!sourceKey,
  });
}

export function useMapSearch() {
  return useMutation({
    mutationFn: (query: string) =>
      api.post<MapSearchResult>('/map/search', { query }).then((r) => r.data),
  });
}

export function useAvailablePeriods() {
  return useQuery({
    queryKey: [QUERY_KEYS.AVAILABLE_PERIODS],
    queryFn: async () => {
      const { data } = await api.get<{
        earliest: string;
        latest: string;
        all: string[];
      }>('/map/periods');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCellChat(cellId: string | null) {
  return useMutation({
    mutationFn: (payload: CellChatRequest) => {
      if (!cellId) throw new Error('No cell selected for chat');
      return mapApi.chatWithCell(cellId, payload);
    },
  });
}
