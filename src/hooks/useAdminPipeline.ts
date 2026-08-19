import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { QUERY_KEYS } from '@/constants';
import type { DataSourceStatus, PipelineRun, ScoreWeightConfig } from '@/types';

export function usePipelineSources() {
  return useQuery({
    queryKey: [QUERY_KEYS.PIPELINE_SOURCES],
    queryFn: () =>
      api.get<{ sources: DataSourceStatus[] }>('/admin/pipeline/sources').then((r) => r.data),
    refetchInterval: 10_000,
  });
}

export function useTriggerRefresh() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceKey: string) => api.post(`/admin/pipeline/sources/${sourceKey}/refresh`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_SOURCES] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PIPELINE_RUNS] });
    },
  });
}

export function usePipelineRuns(sourceKey?: string, page = 1) {
  return useQuery({
    queryKey: [QUERY_KEYS.PIPELINE_RUNS, sourceKey, page],
    queryFn: () =>
      api
        .get<{ items: PipelineRun[]; total: number }>('/admin/pipeline/runs', {
          params: { sourceKey, page },
        })
        .then((r) => r.data),
  });
}

export function useTriggerRecompute() {
  return useMutation({
    mutationFn: (period: string) => api.post('/admin/pipeline/recompute', { period }),
  });
}

export function useWeightConfigs() {
  return useQuery({
    queryKey: [QUERY_KEYS.WEIGHT_CONFIGS],
    queryFn: () =>
      api
        .get<{ configs: ScoreWeightConfig[] }>('/admin/pipeline/weight-configs')
        .then((r) => r.data),
  });
}

export function useCreateWeightConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weights: { sourceKey: string; weight: number }[]) =>
      api.post<ScoreWeightConfig>('/admin/pipeline/weight-configs', { weights }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.WEIGHT_CONFIGS] });
    },
  });
}
