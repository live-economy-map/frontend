// src/components/admin-pipeline/RecomputeButton.tsx
import { useState } from 'react';
import { useTriggerRecompute } from '@/hooks/useAdminPipeline';
import { RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface RecomputeButtonProps {
  period: string;
}

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
        setTimeout(() => setShowSuccess(false), 4000);
      },
    });
  };

  const error = recompute.error as ApiErrorResponse;
  const isNoActiveConfig = error?.response?.status === 409;

  return (
    <div className="space-y-3">
      <button
        onClick={handleRecompute}
        disabled={recompute.isPending}
        className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${recompute.isPending ? 'animate-spin' : ''}`} />
        <span>{recompute.isPending ? 'Recomputing Scores…' : 'Trigger Recomputation'}</span>
      </button>

      {showSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Recomputation started for period: <strong>{period}</strong>
          </span>
        </div>
      )}

      {isNoActiveConfig && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>No Active Weight Configuration</span>
          </div>
          <p className="text-amber-800">
            A calibrated active weight configuration is required to compute scores.
          </p>
          <Link
            to={ROUTES.ADMIN_WEIGHT_CONFIGS}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline pt-1"
          >
            <span>Create Configuration</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {recompute.isError && !isNoActiveConfig && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>
            {error?.response?.data?.message || error?.message || 'Failed to trigger recomputation'}
          </span>
        </div>
      )}
    </div>
  );
}
