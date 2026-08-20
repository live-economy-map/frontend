// src/pages/MethodologyPage.tsx
import { useNavigate } from 'react-router-dom';
import {
  Satellite,
  Activity,
  ShieldCheck,
  ArrowRight,
  Database,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MethodologyPage() {
  const navigate = useNavigate();

  const dataSources = [
    {
      key: 'VIIRS',
      name: 'VIIRS Nighttime Radiance',
      badge: 'Night Lights',
      description:
        'Captures continuous nocturnal luminosity emissions at ~500m resolution. Sudden persistent radiance shifts indicate new electrification, commercial operations, and density spikes.',
      metrics: 'NOAA-20 / Suomi-NPP VIIRS DNB band',
    },
    {
      key: 'GHSL',
      name: 'Global Human Settlement Layer',
      badge: 'Built-up Surface',
      description:
        'Quantifies multi-temporal built-up volume, spatial structural footprint, and physical infrastructure emergence across 1.5 km² grid units.',
      metrics: 'Copernicus Sentinel-1 / Sentinel-2 radar & optical fusion',
    },
    {
      key: 'RWI',
      name: 'Relative Wealth Index',
      badge: 'Economic Proxy',
      description:
        'Combines anonymized micro-connectivity, building density metrics, and spatial asset estimations to benchmark ground-level prosperity gradients.',
      metrics: 'High-precision spatial wealth indices calibrated against DHS surveys',
    },
  ];

  const validationTiers = [
    {
      tier: 'Tier 1: Ground-Truth Official Registries',
      desc: 'Corroborated by municipal construction permits, commercial cadastral expansions, or official infrastructure notices.',
    },
    {
      tier: 'Tier 2: Enterprise & Market Reports',
      desc: 'Validated through published industrial corridor filings, regional trade surveys, and logistics hubs development data.',
    },
    {
      tier: 'Tier 3: Localized Media & News Verification',
      desc: 'Cross-referenced with verified local reports, photographic field records, and public project inaugurations.',
    },
  ];

  return (
    <div className="w-full bg-white selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-16">
        {/* ── 1. Header & Overview ── */}
        <section className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Satellite className="w-3.5 h-3.5" />
            <span>Scientific Framework & Data Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Methodology & <span className="text-blue-600">Earth Observation</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed pt-1">
            Our framework transforms raw orbital sensor data into an interpretable composite index
            of unrecorded economic activity, backed by multi-tier ground validation.
          </p>
        </section>

        {/* ── 2. The Multi-Sensor Composite Score ── */}
        <section className="rounded-3xl border border-gray-100 bg-gradient-to-br from-blue-50/50 via-white to-gray-50 p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Activity className="w-4 h-4" />
              Composite Score Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              How the Index is Computed
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We partition the study area into uniform 1.5 km² analytical grid cells. Each cell
              integrates continuous time-series observations from multiple distinct
              earth-observation modalities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <div
                key={source.key}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                      {source.badge}
                    </span>
                    <span className="text-xs font-mono text-gray-400 font-semibold">
                      {source.key}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{source.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {source.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{source.metrics}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Ground Truth & Case Study Verification ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              Empirical Validation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Triangulating Satellite Signals with Ground Truth
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Satellite anomalies are not treated in isolation. When a cell demonstrates a sharp,
              persistent divergence between official economic statistics and orbital indicators, our
              automated candidate engine flags it for multi-source ground truth corroboration.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3">
            {validationTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/60 flex items-start gap-4"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{tier.tier}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Call to Action ── */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-gray-900">Explore the Dynamic Heatmap</h3>
            <p className="text-sm text-gray-600">
              See the raw satellite indicators and composite growth vectors live across Addis Ababa.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <Button
              onClick={() => navigate('/map')}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6 h-11 gap-2 cursor-pointer"
            >
              <span>Launch Map</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/case-studies')}
              className="border-gray-200 text-gray-700 hover:bg-white rounded-xl h-11 px-5 cursor-pointer"
            >
              <Search className="w-4 h-4 mr-2" />
              Case Studies
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
