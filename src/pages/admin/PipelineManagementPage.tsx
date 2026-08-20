import { useState } from 'react';
import { usePipelineRuns, usePipelineSources } from '@/hooks/useAdminPipeline';
import PipelineRunsTable from '@/components/admin-pipeline/PipelineRunsTable';
import RecomputeButton from '@/components/admin-pipeline/RecomputeButton';
import SourceHealthCard from '@/components/admin-pipeline/SourceHealthCard';

export default function PipelineManagementPage() {
  const [selectedSource, setSelectedSource] = useState<string | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().split('T')[0]);

  const { isLoading: runsLoading, isError: runsError } = usePipelineRuns(selectedSource);
  const { data: sourcesData, isLoading: sourcesLoading } = usePipelineSources();

  return (
    <div>
      <div className="mb-space-xl">
        <h1 className="text-page-title font-bold text-foreground">Pipeline Management</h1>
        <p className="text-body-md text-on-surface-variant mt-space-md">
          Manage data refreshes and score recomputation.
        </p>
      </div>

      {/* ─── DATA SOURCES SECTION ─── */}
      <div className="mb-space-xl">
        <h2 className="text-card-title font-bold mb-space-md">Data Sources</h2>

        {sourcesLoading ? (
          <div className="text-center py-space-lg">Loading sources...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {sourcesData?.sources.map((source) => (
              <SourceHealthCard key={source.key} source={source} />
            ))}
          </div>
        )}
      </div>

      {/* ─── PIPELINE RUNS + RECOMPUTE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mb-space-xl">
        <div className="lg:col-span-2">
          <h2 className="text-card-title font-bold mb-space-md">Pipeline Runs</h2>

          <div className="mb-space-md flex items-center gap-space-md">
            <label className="text-body-sm font-medium">Filter by source:</label>
            <select
              value={selectedSource || ''}
              onChange={(e) => setSelectedSource(e.target.value || undefined)}
              className="px-space-md py-space-sm border border-border-base rounded-lg"
            >
              <option value="">All sources</option>
              <option value="VIIRS">VIIRS</option>
              <option value="GHSL">GHSL</option>
              <option value="RWI">RWI</option>
              <option value="GDELT">GDELT</option>
            </select>
          </div>

          {runsLoading && <div className="text-center py-space-lg">Loading runs...</div>}
          {runsError && (
            <div className="text-center py-space-lg text-danger">Error loading runs</div>
          )}
          {!runsLoading && !runsError && <PipelineRunsTable sourceKey={selectedSource} />}
        </div>

        <div>
          <h2 className="text-card-title font-bold mb-space-md">Recompute Scores</h2>

          <div className="mb-space-md">
            <label className="block text-body-sm font-medium mb-space-sm">Select period:</label>
            <input
              type="date"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-space-md py-space-sm border border-border-base rounded-lg"
            />
          </div>

          <RecomputeButton period={selectedPeriod} />
        </div>
      </div>
    </div>
  );
}
