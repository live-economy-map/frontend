// src/components/admin/DemandMetricsCard.tsx
import { useQuery } from '@tanstack/react-query';
import { adminReportRequestsApi } from '@/api/admin/reportRequests.api';
import { Target, Users, FileText, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemandMetrics } from '@/types';

interface DemandMetricsCardProps {
  metricsOverride?: DemandMetrics;
}

export default function DemandMetricsCard({ metricsOverride }: DemandMetricsCardProps) {
  const { data: fetchedMetrics } = useQuery({
    queryKey: ['admin-demand-metrics'],
    queryFn: () => adminReportRequestsApi.getDemandMetrics(),
    enabled: !metricsOverride,
  });

  const metrics: DemandMetrics = metricsOverride ||
    fetchedMetrics || {
      totalRequests: 0,
      distinctUsers: 0,
      targetRequests: 10,
      targetUsers: 5,
      gateStatus: 'PENDING',
    };

  const requestPct = Math.min(
    100,
    Math.round((metrics.totalRequests / (metrics.targetRequests || 10)) * 100)
  );
  const userPct = Math.min(
    100,
    Math.round((metrics.distinctUsers / (metrics.targetUsers || 5)) * 100)
  );

  const isGatePassed =
    metrics.gateStatus === 'PASSED' ||
    (metrics.totalRequests >= (metrics.targetRequests || 10) &&
      metrics.distinctUsers >= (metrics.targetUsers || 5));

  return (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/50 p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs',
              isGatePassed ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            )}
          >
            {isGatePassed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Gate 2 Demand Validation Tracker
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                V2 → V3 Transition
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Validating real customer pull: requires ≥ 10 analysis requests across ≥ 5 distinct
              users
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border',
              isGatePassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
            )}
          >
            {isGatePassed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GATE 2: PASSED</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>GATE 2: PENDING</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric 1: Total Requests */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Deep-Dive Requests</span>
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {metrics.totalRequests} / {metrics.targetRequests || 10}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                requestPct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
              )}
              style={{ width: `${requestPct}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {metrics.totalRequests >= (metrics.targetRequests || 10)
              ? 'Target criteria achieved'
              : `${(metrics.targetRequests || 10) - metrics.totalRequests} more requests required`}
          </p>
        </div>

        {/* Metric 2: Distinct Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Distinct Requesters</span>
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {metrics.distinctUsers} / {metrics.targetUsers || 5}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                userPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              )}
              style={{ width: `${userPct}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {metrics.distinctUsers >= (metrics.targetUsers || 5)
              ? 'User diversity target met'
              : `${(metrics.targetUsers || 5) - metrics.distinctUsers} more unique users required`}
          </p>
        </div>
      </div>
    </div>
  );
}
