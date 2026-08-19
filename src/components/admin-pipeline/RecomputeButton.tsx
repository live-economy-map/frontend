import { useTriggerRecompute } from '@/hooks/useAdminPipeline';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useState } from 'react';

interface RecomputeButtonProps {
  period: string;
}

// ✅ Define the error response type
interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function RecomputeButton({ period }: RecomputeButtonProps) {
  const recompute = useTriggerRecompute();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRecompute = () => {
    recompute.mutate(period, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      },
    });
  };

  // ✅ Fixed: Properly typed error
  const error = recompute.error as ApiErrorResponse;
  const isNoActiveConfig = error?.response?.status === 409;

  return (
    <div className="space-y-space-md">
      <Button onClick={handleRecompute} disabled={recompute.isPending}>
        {recompute.isPending ? 'Recomputing...' : 'Trigger Recomputation'}
      </Button>

      {showSuccess && (
        <div className="p-space-md bg-success-bg text-success rounded-lg text-body-sm font-medium">
          ✓ Recomputation started for {period}
        </div>
      )}

      {isNoActiveConfig && (
        <div className="p-space-md bg-warning-bg text-warning rounded-lg text-body-sm">
          <p className="font-medium mb-space-sm">No active weight configuration</p>
          <a
            href={ROUTES.ADMIN_WEIGHT_CONFIGS}
            className="text-warning font-semibold hover:underline"
          >
            Create one now →
          </a>
        </div>
      )}

      {recompute.isError && !isNoActiveConfig && (
        <div className="p-space-md bg-danger-bg text-danger rounded-lg text-body-sm">
          {/* ✅ Fixed: Properly typed error */}
          {error?.response?.data?.message || error?.message || 'Failed to trigger recomputation'}
        </div>
      )}
    </div>
  );
}
