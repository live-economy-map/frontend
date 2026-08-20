// src/pages/LandingPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Globe,
  Layers,
  LayoutGrid,
  Clock,
  Satellite,
  Building2,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Radar,
  FileCheck,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { useAboutContent } from '@/hooks/useContent';

// ── 8x8 Matrix for Satellite Density Heatmap ────────────────────────────────
const GRID_COLORS: string[][] = [
  ['#dbeafe', '', '#dbeafe', '', '#dbeafe', '', '#dbeafe', ''],
  ['', '#dbeafe', '', '#dbeafe', '#dbeafe', '', '', '#dbeafe'],
  ['#dbeafe', '#dbeafe', '', '#bbf7d0', '#fde68a', '#bbf7d0', '', ''],
  ['', '#dbeafe', '#bbf7d0', '#fcd34d', '#fb923c', '#fcd34d', '#bbf7d0', '#dbeafe'],
  ['#dbeafe', '#bbf7d0', '#fcd34d', '#fb923c', '#ef4444', '#fb923c', '#fcd34d', '#bbf7d0'],
  ['', '#dbeafe', '#bbf7d0', '#fcd34d', '#fb923c', '#fcd34d', '#bbf7d0', ''],
  ['#dbeafe', '', '#dbeafe', '#bbf7d0', '#fcd34d', '#bbf7d0', '', '#dbeafe'],
  ['', '#dbeafe', '', '#dbeafe', '#dbeafe', '', '#dbeafe', ''],
];

function MiniHeatmap() {
  return (
    <div
      className="grid gap-1.5 p-4 rounded-3xl bg-white/60 backdrop-blur-sm shadow-inner"
      style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}
      aria-label="Satellite Density Heatmap Matrix"
    >
      {GRID_COLORS.flat().map((color, i) =>
        color ? (
          <div
            key={i}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-transform duration-300 hover:scale-110 shadow-xs cursor-pointer"
            style={{ backgroundColor: color }}
            title={`Satellite Grid Cell ${i + 1}`}
          />
        ) : (
          <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 opacity-0" aria-hidden="true" />
        )
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { data: aboutData } = useAboutContent();
  const [activeLayer, setActiveLayer] = useState<'VIIRS' | 'GHSL' | 'RWI'>('VIIRS');

  const countriesCount = aboutData?.stats?.countriesMapped ?? 1;
  const countriesDisplay = countriesCount === 1 ? '1' : `${countriesCount}+`;
  const countriesLabel = countriesCount === 1 ? 'PILOT AREA (ETHIOPIA)' : 'COUNTRIES MAPPED';

  const sourcesCount = aboutData?.stats?.primarySourcesCount?.toString() || '4';
  const gridCellsDisplay = aboutData?.stats?.gridCellsCount
    ? String(aboutData.stats.gridCellsCount)
    : '238';
  const dataPointsDisplay = aboutData?.stats?.dataPointsAnalyzed || '7.9K+';

  const stats = [
    {
      icon: Globe,
      value: countriesDisplay,
      label: countriesLabel,
      sub: 'Addis Ababa study area',
    },
    {
      icon: Layers,
      value: sourcesCount,
      label: 'PRIMARY SATELLITE SOURCES',
      sub: 'VIIRS, GHSL, RWI',
    },
    {
      icon: LayoutGrid,
      value: gridCellsDisplay,
      label: '1.5 KM² GRID CELLS',
      sub: 'Analytical grid units',
    },
    {
      icon: Clock,
      value: dataPointsDisplay,
      label: 'DATA POINTS ANALYZED',
      sub: 'Continuous signals & snapshots',
    },
  ];

  const layerDetails = {
    VIIRS: {
      name: 'VIIRS Nighttime Radiance',
      sensor: 'NOAA-20 / Suomi-NPP VIIRS DNB',
      tag: 'Nocturnal Luminosity',
      description:
        'Continuous ~500m night-light emissions. Sudden, persistent radiance spikes illuminate unrecorded commercial zones, power grid extensions, and high-density informal night markets.',
      highlight: 'Resolves 24-hour economic energy outputs with sub-kilometer sensitivity.',
    },
    GHSL: {
      name: 'Global Human Settlement Layer',
      sensor: 'Copernicus Sentinel-1 / Sentinel-2 Radar & Optical',
      tag: 'Built-up Infrastructure Footprint',
      description:
        'Analyzes spatial structural footprints, roof density, and industrial construction surfaces. Detects physical warehouse clusters and logistical nodes before census updates.',
      highlight: 'Synthetic aperture radar tracks physical building volumes through cloud cover.',
    },
    RWI: {
      name: 'Relative Wealth Index',
      sensor: 'High-Res Asset & Connectivity Proxies',
      tag: 'Micro-Prosperity Gradients',
      description:
        'Machine-learning micro-estimates combining spatial infrastructure connectivity, building metrics, and survey-calibrated economic gradients.',
      highlight: 'Calibrated against national demographic and living standard surveys.',
    },
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Orbital Ingestion',
      icon: Satellite,
      desc: 'Automated retrieval of multispectral optical, synthetic aperture radar, and night lights rasters.',
    },
    {
      step: '02',
      title: 'Grid Normalization',
      icon: LayoutGrid,
      desc: 'Harmonization of spatial datasets across uniform 1.5 km² analytical grid cells across Addis Ababa.',
    },
    {
      step: '03',
      title: 'Anomaly Engine',
      icon: Cpu,
      desc: 'Algorithmic weighting and growth vector scoring to flag persistent economic divergence.',
    },
    {
      step: '04',
      title: 'Ground Corroboration',
      icon: FileCheck,
      desc: 'Corroborating orbital anomalies with municipal permits, market filings, and on-the-ground records.',
    },
  ];

  const capabilities = [
    {
      icon: Radar,
      title: 'High-Frequency Anomaly Detection',
      desc: 'Detects real-time economic shifts months before national GDP estimates or periodic surveys are published.',
    },
    {
      icon: Building2,
      title: 'Granular 1.5 km² Resolution',
      desc: 'Decomposes urban corridors into micro-zones, capturing informal market expansions at block-level scale.',
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tier Empirical Ground Truth',
      desc: 'Every flagged hotspot is verified across 3 distinct validation tiers to eliminate noise and sensor artifacts.',
    },
    {
      icon: BarChart3,
      title: 'Open Data & Transparent Scoring',
      desc: 'Publicly inspectable weights, reproducible methodologies, and open analytical access without paywalls.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* ── 1. Hero Section ── */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Copy & CTAs */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 py-16 lg:py-24">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
            Understand the
            <br />
            Hidden Economy.
          </h1>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-600 tracking-tight leading-tight mb-6">
            See What Others
            <br />
            Miss.
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mb-10 font-normal">
            We combine high-resolution satellite data, nighttime radiance, and infrastructure
            signals to detect economic activity that traditional metrics cannot capture.
          </p>

          <div className="flex items-center gap-5 flex-wrap">
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
            >
              Explore the Map
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/case-studies')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-3.5 transition-colors group cursor-pointer"
            >
              View Case Studies
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Column: Heatmap Visualization & Legend */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50/50 px-8 py-16 overflow-hidden min-h-[420px]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Heatmap Grid */}
          <MiniHeatmap />

          {/* Floating Severity Legend Card */}
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">
            <p className="text-xs font-bold text-gray-900 tracking-wide mb-3">
              Latest Severity Hotspots
            </p>
            {[
              { color: '#ef4444', label: 'Very High' },
              { color: '#fb923c', label: 'High' },
              { color: '#fcd34d', label: 'Medium' },
              { color: '#bbf7d0', label: 'Low' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-3 mb-2 last:mb-0">
                <span
                  className="w-3.5 h-3.5 rounded-[4px] shadow-xs shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Highlight Statistics Row (About Page Analytics) ── */}
      <section className="border-t border-gray-100 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {stats.map(({ icon: Icon, value, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center px-6 py-9 hover:bg-gray-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">
                {label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Earth Observation Layers & Data Architecture ── */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-white to-blue-50/30 py-16 sm:py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <Satellite className="w-3.5 h-3.5" />
              <span>Multi-Sensor Modalities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Orbital Signals Powering the Index
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              We ingest and harmonize three distinct remote sensing streams to isolate genuine
              economic growth signatures from seasonal variance and sensor noise.
            </p>
          </div>

          {/* Interactive Layer Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-gray-100/80 border border-gray-200/80 gap-1.5">
              {(['VIIRS', 'GHSL', 'RWI'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveLayer(key)}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeLayer === key
                      ? 'bg-white text-blue-600 shadow-xs border border-gray-200/60'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {key} Layer
                </button>
              ))}
            </div>
          </div>

          {/* Active Layer Feature Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  {layerDetails[activeLayer].tag}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {layerDetails[activeLayer].sensor}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                {layerDetails[activeLayer].name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {layerDetails[activeLayer].description}
              </p>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs sm:text-sm text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{layerDetails[activeLayer].highlight}</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              {[
                {
                  label: 'Spatial Unit',
                  value: '1.5 km² analytical grid cells',
                  icon: LayoutGrid,
                },
                {
                  label: 'Temporal Cadence',
                  value: 'Monthly time-series composite',
                  icon: Clock,
                },
                {
                  label: 'Confidence Metric',
                  value: 'Calibrated against ground truth',
                  icon: TrendingUp,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center gap-3.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-white text-blue-600 shadow-2xs flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {label}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Key Analytical Capabilities ── */}
      <section className="border-t border-gray-100 bg-white py-16 sm:py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Why Satellite Observational Intelligence?
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Bridging the gap between official macroeconomic data and fast-evolving physical growth
              on the ground.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. End-to-End Discovery Pipeline ── */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50/60 to-white py-16 sm:py-20 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <Cpu className="w-3.5 h-3.5" />
              <span>Algorithmic Workflow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              From Raw Orbit to Verified Insights
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              A transparent, four-phase pipeline turning terabytes of satellite imagery into
              verified case studies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map(({ step, title, icon: Icon, desc }) => (
              <div
                key={step}
                className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 px-2 py-0.5 rounded-md bg-blue-50">
                      STEP {step}
                    </span>
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Final Call to Action Banner ── */}
      <section className="border-t border-gray-100 bg-gray-900 text-white py-14 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Explore Addis Ababa on the Live Heatmap
            </h3>
            <p className="text-sm text-gray-300">
              Inspect 238 grid units, historical time-series curves, and verified ground-truth case
              studies interactively.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Launch Interactive Map
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/methodology')}
              className="inline-flex items-center justify-center gap-1.5 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-200 text-sm font-medium px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Scientific Framework
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
