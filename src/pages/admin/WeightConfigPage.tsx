// src/pages/admin/WeightConfigPage.tsx
import { useWeightConfigs } from '@/hooks/useAdminPipeline';
import WeightConfigForm from '@/components/admin-pipeline/WeightConfigForm';
import WeightConfigHistory from '@/components/admin-pipeline/WeightConfigHistory';

export default function WeightConfigPage() {
  const { data, isLoading, isError } = useWeightConfigs();

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Weight Configurations
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Calibrate composite score weights across VIIRS, GHSL, and RWI data streams.
        </p>
      </div>

      {/* ── 2-Column Layout: Form & History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6">
          <WeightConfigForm />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Configuration History
            </h2>
            <p className="text-xs text-gray-500">
              Historical calibration versions and active production model weights.
            </p>
          </div>

          {isLoading && (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
              Loading configurations…
            </div>
          )}

          {isError && (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-600 text-sm font-medium">
              Failed to load weight configuration history.
            </div>
          )}

          {data?.configs && <WeightConfigHistory configs={data.configs} />}
        </div>
      </div>
    </div>
  );
}
