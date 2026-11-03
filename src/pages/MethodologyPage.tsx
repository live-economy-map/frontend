// src/pages/MethodologyPage.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database, Search, CheckCircle2 } from 'lucide-react';
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
        'Micro-estimate wealth and living standards derived from high-resolution satellite imagery, connectivity features, and calibrated mobile data.',
      metrics: 'Meta Data for Good & UC Berkeley spatial micro-estimates',
    },
  ];

  const validationTiers = [
    {
      tier: 'Tier 1: Official Ground-Truth',
      title: 'Municipal & Tax Registry Reconciliation',
      desc: 'Corroborated against regional building permits, commercial business licenses, and government development zones.',
    },
    {
      tier: 'Tier 2: Physical Infrastructure Audits',
      title: 'High-Res Optical & Drone Validation',
      desc: 'Sub-meter imagery verification (Sentinel/Planet) proving active foundations, industrial sheds, and logistical activity.',
    },
    {
      tier: 'Tier 3: Localized Ground Verification',
      title: 'Trade & Field Ground Corroboration',
      desc: 'Market reports, local trade intelligence, and field verifications confirming informal manufacturing clusters.',
    },
  ];

  return (
    <div className="w-full bg-background text-on-surface selection:bg-primary/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 space-y-12">
        {/* ── 1. Page Header ── */}
        <section className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
            Scientific Framework & <span className="text-primary">Methodology</span>
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed pt-1">
            How we fuse nighttime satellite radiance, high-resolution human settlement footprints,
            and micro-wealth proxies into a continuous index of economic expansion across Addis
            Ababa.
          </p>
        </section>

        {/* ── 2. The Multi-Sensor Composite Score ── */}
        <section className="rounded-3xl border border-border-base bg-gradient-to-br from-accent via-surface to-surface-container-low p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl space-y-3 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              How the Index is Computed
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              We partition the study area into uniform 1.5 km² analytical grid cells. Each cell
              integrates continuous time-series observations from multiple distinct
              earth-observation modalities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataSources.map((source) => (
              <div
                key={source.key}
                className="bg-surface rounded-2xl p-6 border border-border-base shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all hover:shadow-md"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-on-surface">{source.name}</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {source.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border-base flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{source.metrics}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Ground Truth & Case Study Verification ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Triangulating Satellite Signals with Ground Truth
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Satellite anomalies are not treated in isolation. When a cell demonstrates a sharp,
              persistent divergence between official economic statistics and orbital indicators, our
              automated candidate engine flags it for multi-source ground truth corroboration.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-3">
            {validationTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border-base bg-surface-container-low flex items-start gap-4"
              >
                <div className="w-7 h-7 rounded-lg bg-success-bg text-success flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">{tier.tier}</h4>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Call to Action ── */}
        <section className="rounded-2xl border border-primary/20 bg-accent p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-on-surface">Explore the Dynamic Heatmap</h3>
            <p className="text-sm text-on-surface-variant">
              See the raw satellite indicators and composite growth vectors live across Addis Ababa.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <Button
              onClick={() => navigate('/map')}
              className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl shadow-sm px-6 h-11 gap-2 cursor-pointer flex items-center"
            >
              <img
                src="/ecolens-tr.png"
                alt="EcoLens"
                className="h-4 w-auto brightness-0 invert dark:invert-0 dark:brightness-0 object-contain"
              />
              <span>Launch Map</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/case-studies')}
              className="border-border-base bg-surface text-on-surface-variant hover:bg-surface-container rounded-xl h-11 px-5 cursor-pointer"
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
