// src/components/admin-pipeline/SourceHealthCard.tsx
import {
  RefreshCw,
  AlertTriangle,
  XCircle,
  Clock,
  Moon,
  Building2,
  TrendingUp,
  Globe,
  Database,
} from 'lucide-react';
import { useTriggerRefresh } from '@/hooks/useAdminPipeline';
import type { DataSourceStatus } from '@/types';

interface SourceHealthCardProps {
  source: DataSourceStatus;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function SourceHealthCard({ source }: SourceHealthCardProps) {
  const refresh = useTriggerRefresh();

  const formattedDate = source.lastSuccessfulRunAt
    ? new Date(source.lastSuccessfulRunAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  const getSourceIcon = () => {
    const key = source.key.toUpperCase();
    if (key.includes('VIIRS'))
      return { icon: Moon, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
    if (key.includes('GHSL'))
      return { icon: Building2, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (key.includes('RWI'))
      return { icon: TrendingUp, bg: 'bg-amber-50 text-amber-600 border-amber-100' };
    if (key.includes('GDELT'))
      return { icon: Globe, bg: 'bg-blue-50 text-blue-600 border-blue-100' };
    return { icon: Database, bg: 'bg-gray-50 text-gray-600 border-gray-100' };
  };

  const { icon: SourceIcon, bg: iconBg } = getSourceIcon();

  const getStatusBadge = () => {
    switch (source.healthStatus) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Healthy
          </span>
        );
      case 'stale':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Stale
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200/60 shadow-2xs">
            <XCircle className="w-3 h-3 text-red-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200/60 shadow-2xs">
            <Clock className="w-3 h-3 text-gray-500" />
            Never Run
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-md transition-all duration-200">
      <div className="space-y-4">
        {/* Top Icon & Status Row */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-10 h-10 rounded-xl border ${iconBg} flex items-center justify-center shadow-2xs`}
          >
            <SourceIcon className="w-5 h-5" />
          </div>
          {getStatusBadge()}
        </div>

        {/* Source Name & Telemetry */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
              {source.key}
            </span>
          </div>
          <h3 className="font-extrabold text-base text-gray-900 tracking-tight mt-0.5">
            {source.name}
          </h3>
        </div>

        {/* Mini Specs */}
        <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-gray-50/80 border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Cadence
            </span>
            <span className="text-xs font-semibold text-gray-800">Monthly Run</span>
          </div>
          <div className="p-2 rounded-xl bg-gray-50/80 border border-gray-100">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Last Sync
            </span>
            <span
              className="text-xs font-semibold text-gray-800 truncate block"
              title={formattedDate}
            >
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
        <button
          onClick={() => refresh.mutate(source.key)}
          disabled={refresh.isPending}
          className="w-full h-10 rounded-xl bg-gray-50 hover:bg-blue-50 active:bg-blue-100 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-2xs"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refresh.isPending ? 'animate-spin text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`}
          />
          <span>{refresh.isPending ? 'Triggering Ingestion…' : 'Trigger Ingestion'}</span>
        </button>

        {refresh.isError && (
          <p className="text-xs text-red-600 font-medium text-center">
            {(refresh.error as ApiErrorResponse)?.response?.data?.message ||
              'Failed to trigger refresh'}
          </p>
        )}
      </div>
    </div>
  );
}
