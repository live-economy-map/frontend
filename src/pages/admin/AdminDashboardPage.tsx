import { usePipelineSources } from '@/hooks/useAdminPipeline';
import SourceHealthCard from '@/components/admin-pipeline/SourceHealthCard';

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = usePipelineSources();

  return (
    <div>
      <div className="mb-space-xl">
        <h1 className="text-page-title font-bold text-foreground">Pipeline Dashboard</h1>
        <p className="text-body-md text-on-surface-variant mt-space-md">
          Monitor system health and data source status.
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-space-xl text-muted-foreground">
          Loading source status...
        </div>
      )}

      {isError && (
        <div className="text-center py-space-xl text-danger">
          Failed to load source status. Please try again.
        </div>
      )}

      {data?.sources && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {data.sources.map((source) => (
            <SourceHealthCard key={source.key} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}
