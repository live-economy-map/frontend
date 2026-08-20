import { Link } from 'react-router-dom';
import {
  Activity,
  Database,
  SlidersHorizontal,
  BookOpen,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { usePipelineSources } from '@/hooks/useAdminPipeline';
import SourceHealthCard from '@/components/admin-pipeline/SourceHealthCard';
import { ROUTES } from '@/constants';

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = usePipelineSources();

  const healthyCount = data?.sources?.filter((s) => s.healthStatus === 'healthy').length || 0;
  const totalCount = data?.sources?.length || 3;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pipeline Health Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitor real-time orbital ingestion status, satellite health, and anomaly execution
            runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN_WEIGHT_CONFIGS}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Weight Config</span>
          </Link>
          <Link
            to={ROUTES.ADMIN_CASE_STUDIES}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curate Studies</span>
          </Link>
        </div>
      </div>

      {/* ── Overview KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            icon: Activity,
            label: 'Pipeline Health',
            value: `${healthyCount}/${totalCount} Healthy`,
            sub: 'Active ingestion feeds',
            color: 'text-emerald-600 bg-emerald-50',
          },
          {
            icon: Database,
            label: 'Monitored Cells',
            value: '238 Cells',
            sub: '1.5 km² analytical grid units',
            color: 'text-blue-600 bg-blue-50',
          },
          {
            icon: Layers,
            label: 'Data Modalities',
            value: '3 Streams',
            sub: 'VIIRS • GHSL • RWI',
            color: 'text-indigo-600 bg-indigo-50',
          },
          {
            icon: CheckCircle2,
            label: 'Ingestion Engine',
            value: 'Operational',
            sub: 'Auto-scheduled cadence',
            color: 'text-purple-600 bg-purple-50',
          },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div
            key={label}
            className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                {value}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ingestion Sources Section ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Earth Observation Data Feeds
            </h2>
            <p className="text-xs text-gray-500">
              Individual source telemetry, cadence status, and on-demand refresh triggers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Sources Synced</span>
          </div>
        </div>

        {/* Live System Telemetry Status Bar */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900">
                Orbital Data Ingestion Pipeline: Operational
              </span>
              <p className="text-[11px] text-gray-500">
                Autonomous multi-sensor retrieval & spatial normalization active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Cadence: Monthly Time-Series</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Coverage: 238 Grid Cells</span>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
            Loading data source health status…
          </div>
        )}

        {isError && (
          <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-600 text-sm font-medium">
            Failed to retrieve data source status from the backend.
          </div>
        )}

        {data?.sources && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.sources.map((source) => (
              <SourceHealthCard key={source.key} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
