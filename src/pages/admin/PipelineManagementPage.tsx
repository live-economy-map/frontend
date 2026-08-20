// src/pages/admin/PipelineManagementPage.tsx
import { useState } from 'react';
import { usePipelineRuns, usePipelineSources } from '@/hooks/useAdminPipeline';
import PipelineRunsTable from '@/components/admin-pipeline/PipelineRunsTable';
import RecomputeButton from '@/components/admin-pipeline/RecomputeButton';
import SourceHealthCard from '@/components/admin-pipeline/SourceHealthCard';
import { Filter, Calendar, RefreshCw } from 'lucide-react';

export default function PipelineManagementPage() {
  const [selectedSource, setSelectedSource] = useState<string | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().split('T')[0]);

  const { isLoading: runsLoading, isError: runsError } = usePipelineRuns(selectedSource);
  const { data: sourcesData, isLoading: sourcesLoading } = usePipelineSources();

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Pipeline Management
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Monitor source telemetry, inspect ingestion logs, and trigger score recomputations.
        </p>
      </div>

      {/* ── Data Sources Grid ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Active Data Sources</h2>
          <p className="text-xs text-gray-500">
            Real-time feed health and individual source ingestion triggers.
          </p>
        </div>

        {sourcesLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
            Loading data sources…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sourcesData?.sources.map((source) => (
              <SourceHealthCard key={source.key} source={source} />
            ))}
          </div>
        )}
      </div>

      {/* ── Pipeline Runs & Score Recomputation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Execution Runs Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Execution History
              </h2>
              <p className="text-xs text-gray-500">
                Log of automated and manual satellite processing jobs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedSource || ''}
                onChange={(e) => setSelectedSource(e.target.value || undefined)}
                className="h-9 px-3 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
              >
                <option value="">All Data Sources</option>
                <option value="VIIRS">VIIRS Night Lights</option>
                <option value="GHSL">GHSL Urban Layer</option>
                <option value="RWI">RWI Wealth Index</option>
                <option value="GDELT">GDELT Global News</option>
              </select>
            </div>
          </div>

          {runsLoading && (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
              Loading pipeline execution logs…
            </div>
          )}
          {runsError && (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-600 text-sm font-medium">
              Failed to load pipeline runs.
            </div>
          )}
          {!runsLoading && !runsError && <PipelineRunsTable sourceKey={selectedSource} />}
        </div>

        {/* Right: Recompute Control Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-5 sticky top-6">
          <div className="space-y-1">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Recompute Scores</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Recalculate regional anomaly metrics across all 238 grid cells for a target period.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-gray-700">
              Target Monthly Period
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3.5 text-xs font-medium text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <RecomputeButton period={selectedPeriod} />
          </div>
        </div>
      </div>
    </div>
  );
}
