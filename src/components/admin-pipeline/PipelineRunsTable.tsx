// src/components/admin-pipeline/PipelineRunsTable.tsx
import { useState } from 'react';
import { usePipelineRuns } from '@/hooks/useAdminPipeline';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface PipelineRunsTableProps {
  sourceKey?: string;
}

export default function PipelineRunsTable({ sourceKey }: PipelineRunsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePipelineRuns(sourceKey, page);

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
        Loading runs…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-600 text-sm font-medium">
        Error loading pipeline execution runs.
      </div>
    );
  }

  if (!data?.items?.length) {
    if (data?.total && data.total > 0 && page > 1) {
      setPage(1);
      return (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
          Loading…
        </div>
      );
    }
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
        No execution runs recorded yet.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3" />
            Success
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <AlertTriangle className="w-3 h-3" />
            Running
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/60">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200/60">
            {status}
          </span>
        );
    }
  };

  const failedRun = data.items.find((run) => run.status === 'FAILED');
  const totalPages = Math.ceil((data.total || 0) / 20);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Source Key</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Started At</th>
              <th className="py-3 px-4">Completed At</th>
              <th className="py-3 px-4 text-right">Records</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {data.items.map((run) => (
              <tr key={run.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-gray-900">{run.dataSourceKey}</td>
                <td className="py-3 px-4">{getStatusBadge(run.status)}</td>
                <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                  {new Date(run.startedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                  {run.status === 'RUNNING'
                    ? 'In Progress…'
                    : run.completedAt
                      ? new Date(run.completedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                  {run.recordsProcessed != null ? run.recordsProcessed.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {failedRun && failedRun.errorMessage && (
        <div className="p-3.5 m-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Latest Error Message:</span>
            <span className="text-red-600">{failedRun.errorMessage}</span>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>
          Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong> • {data.total} total
          runs
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || !data.total}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
