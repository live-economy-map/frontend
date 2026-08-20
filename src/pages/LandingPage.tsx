// src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Database, Clock, Map, FlaskConical, Shield } from 'lucide-react';
import { useLandingContent } from '@/hooks/useContent';

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
  const { data: landingData } = useLandingContent();

  const publishedCount = landingData?.highlightStats?.publishedCaseStudyCount ?? 1246;
  const lastRefresh = landingData?.highlightStats?.lastDataRefresh
    ? new Date(landingData.highlightStats.lastDataRefresh).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Oct 24, 2024';

  const stats = [
    {
      icon: Database,
      value: publishedCount.toLocaleString(),
      label: 'DATA POINTS PUBLISHED',
      sub: 'Manually verified & validated',
    },
    {
      icon: Clock,
      value: lastRefresh,
      label: 'LAST DATA REFRESH',
      sub: 'All data locally is valid',
    },
    {
      icon: Map,
      value: '45,231',
      label: 'GRID CELLS ANALYZED',
      sub: 'Global coverage',
    },
    {
      icon: FlaskConical,
      value: '3',
      label: 'SATELLITE & DATA SOURCES',
      sub: 'VIIRS, GHSL, RWI',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* ── 1. Hero Section ── */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Copy & CTAs */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 py-16 lg:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold w-fit mb-6 border border-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Live Observational Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-2">
            Understand the
            <br />
            Hidden Economy.
          </h1>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-600 tracking-tight leading-[1.1] mb-8">
            See What Others
            <br />
            Miss.
          </h2>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-md mb-10 font-normal">
            {landingData?.intro ||
              'We combine high-resolution satellite data, nighttime radiance, and infrastructure signals to detect economic activity that traditional metrics cannot capture.'}
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

      {/* ── 2. Highlight Statistics Row ── */}
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

      {/* ── 3. Bottom Transparency Banner ── */}
      <section className="border-t border-gray-100 bg-gray-50/80 px-6 sm:px-12 lg:px-20 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Open, Transparent, Built for Impact.
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                All data, methods, and case studies are publicly accessible. No login required. No
                data hidden.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/methodology')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            About the Project
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
