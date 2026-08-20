import { useTriggerRefresh } from '@/hooks/useAdminPipeline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import type { DataSourceStatus } from '@/types';

interface SourceHealthCardProps {
  source: DataSourceStatus;
}

// ✅ Define the error response type
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function SourceHealthCard({ source }: SourceHealthCardProps) {
  const refresh = useTriggerRefresh();

  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
    healthy: 'success',
    stale: 'warning',
    failed: 'error',
    never_run: 'neutral',
  };

  const labelMap: Record<string, string> = {
    healthy: 'Healthy',
    stale: 'Stale',
    failed: 'Failed',
    never_run: 'Never Run',
  };

  const formattedDate = source.lastSuccessfulRunAt
    ? new Date(source.lastSuccessfulRunAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  return (
    <Card>
      <CardContent className="p-space-lg">
        <div className="flex items-start justify-between mb-space-md">
          <div>
            <h3 className="font-semibold text-foreground">{source.name}</h3>
            <p className="text-body-sm text-on-surface-variant mt-space-micro">
              Last run: {formattedDate}
            </p>
          </div>
          <StatusBadge
            status={statusMap[source.healthStatus]}
            label={labelMap[source.healthStatus]}
          />
        </div>
        <Button
          onClick={() => refresh.mutate(source.key)}
          disabled={refresh.isPending}
          variant="outline"
          className="w-full"
        >
          {refresh.isPending ? 'Refreshing...' : 'Refresh'}
        </Button>
        {refresh.isError && (
          <p className="text-danger text-body-sm mt-space-sm">
            {/* ✅ Fixed: Properly typed error */}
            {(refresh.error as ApiErrorResponse)?.response?.data?.message ||
              'Failed to trigger refresh'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
