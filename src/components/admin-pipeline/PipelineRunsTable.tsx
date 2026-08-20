import { usePipelineRuns } from '@/hooks/useAdminPipeline';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/common/StatusBadge';
import { useState } from 'react';

interface PipelineRunsTableProps {
  sourceKey?: string;
}

export default function PipelineRunsTable({ sourceKey }: PipelineRunsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePipelineRuns(sourceKey, page);

  if (isLoading) return <div className="text-center py-space-lg">Loading runs...</div>;
  if (isError) return <div className="text-danger text-center py-space-lg">Error loading runs</div>;

  // ✅ FIX: Don't show "No runs yet" if we're on a page with no data but total > 0
  if (!data?.items?.length) {
    // If we're on a page with no data but there are runs, go back to page 1
    if (data?.total && data.total > 0 && page > 1) {
      setPage(1);
      return <div className="text-center py-space-lg">Loading...</div>;
    }
    return <div className="text-center py-space-lg text-muted-foreground">No runs yet</div>;
  }

  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    SUCCESS: 'success',
    RUNNING: 'warning',
    FAILED: 'error',
  };

  const statusLabels: Record<string, string> = {
    SUCCESS: 'Success',
    RUNNING: 'Running',
    FAILED: 'Failed',
  };

  // Find the first failed run to show error at the bottom
  const failedRun = data.items.find((run) => run.status === 'FAILED');

  // ✅ Calculate total pages
  const totalPages = Math.ceil((data.total || 0) / 20); // 20 is the default limit

  return (
    <Card>
      <CardContent className="p-space-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border-base">
                <th className="text-left py-space-md px-space-sm font-semibold">Source</th>
                <th className="text-left py-space-md px-space-sm font-semibold">Status</th>
                <th className="text-left py-space-md px-space-sm font-semibold">Started</th>
                <th className="text-left py-space-md px-space-sm font-semibold">Completed</th>
                <th className="text-left py-space-md px-space-sm font-semibold">Records</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((run) => (
                <tr key={run.id} className="border-b border-border-base hover:bg-surface-container">
                  <td className="py-space-md px-space-sm">{run.dataSourceKey}</td>
                  <td className="py-space-md px-space-sm">
                    <StatusBadge status={statusMap[run.status]} label={statusLabels[run.status]} />
                  </td>
                  <td className="py-space-md px-space-sm text-muted-foreground">
                    {new Date(run.startedAt).toLocaleString()}
                  </td>
                  <td className="py-space-md px-space-sm text-muted-foreground">
                    {run.status === 'RUNNING'
                      ? '⏳ In Progress'
                      : run.completedAt
                        ? new Date(run.completedAt).toLocaleString()
                        : '—'}
                  </td>
                  <td className="py-space-md px-space-sm font-medium">
                    {run.recordsProcessed ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {failedRun && failedRun.errorMessage && (
          <div className="mt-space-md p-space-md bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-body-sm font-medium">Error:</p>
            <p className="text-red-600 text-body-sm">{failedRun.errorMessage}</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-space-lg">
          <p className="text-muted-foreground text-body-sm">
            Page {page} of {totalPages || 1} • Total: {data.total} runs
          </p>
          <div className="space-x-space-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-space-md py-space-sm bg-primary text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || !data.total}
              className="px-space-md py-space-sm bg-primary text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
