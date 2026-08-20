import { useWeightConfigs } from '@/hooks/useAdminPipeline';
import WeightConfigForm from '@/components/admin-pipeline/WeightConfigForm';
import WeightConfigHistory from '@/components/admin-pipeline/WeightConfigHistory';

export default function WeightConfigPage() {
  const { data, isLoading, isError } = useWeightConfigs();

  return (
    <div>
      <div className="mb-space-xl">
        <h1 className="text-page-title font-bold text-foreground">Weight Configurations</h1>
        <p className="text-body-md text-on-surface-variant mt-space-md">
          Manage scoring weights for data sources.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
        <div>
          <WeightConfigForm />
        </div>

        <div>
          <h2 className="text-card-title font-bold mb-space-md">Recent Configurations</h2>

          {isLoading && <div className="text-center py-space-lg">Loading configs...</div>}
          {isError && (
            <div className="text-center py-space-lg text-danger">Error loading configs</div>
          )}
          {data?.configs && <WeightConfigHistory configs={data.configs} />}
        </div>
      </div>
    </div>
  );
}
