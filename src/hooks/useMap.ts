// src/hooks/useMap.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { GrowthCell, CellDetail, RawLayerCell, MapSearchResult } from '@/types';

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

      // Flatten the nested gridCell structure into the flat GrowthCell type
      const flattenedCells: GrowthCell[] = response.data.cells.map((c) => ({
        cellId: c.gridCell.id,
        cellRow: c.gridCell.cellRow,
        cellCol: c.gridCell.cellCol,
        boundaryGeoJson: c.gridCell.boundaryGeoJson,
        compositeScore: c.compositeScore,
        isComplete: c.isComplete,
      }));

      return {
        period: response.data.period,
        periodSubstituted: response.data.periodSubstituted,
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
        cells: Array<{ gridCellId: string; normalizedValue: number }>;
      }>(`/map/layers/${sourceKey}`, { params: { period } });

      const flattenedCells: RawLayerCell[] = response.data.cells.map((c) => ({
        cellId: c.gridCellId,
        normalizedValue: c.normalizedValue,
      }));

      return {
        sourceKey: response.data.sourceKey,
        period: response.data.period,
        periodSubstituted: response.data.periodSubstituted,
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
