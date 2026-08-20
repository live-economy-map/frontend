// src/pages/AboutPage.tsx
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Layers,
  Clock,
  LayoutGrid,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Sparkles,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useAboutContent } from '@/hooks/useContent';

export default function AboutPage() {
  const navigate = useNavigate();
  const { data: aboutData } = useAboutContent();

  const countriesCount = aboutData?.stats?.countriesMapped ?? 1;
  const countriesDisplay = countriesCount === 1 ? '1' : `${countriesCount}+`;
  const countriesLabel = countriesCount === 1 ? 'Pilot Area (Ethiopia)' : 'Countries Mapped';

  const sourcesCount = aboutData?.stats?.primarySourcesCount?.toString() || '4';
  const gridCellsDisplay = aboutData?.stats?.gridCellsCount
    ? String(aboutData.stats.gridCellsCount)
    : '238';
  const dataPointsDisplay = aboutData?.stats?.dataPointsAnalyzed || '7.9K+';

  // 4 Primary Metric Cards
  const stats = [
    {
      icon: Globe,
      value: countriesDisplay,
      label: countriesLabel,
    },
    {
      icon: Layers,
      value: sourcesCount,
      label: 'Primary Satellite Sources',
    },
    {
      icon: LayoutGrid,
      value: gridCellsDisplay,
      label: '1.5 km² Grid Cells',
    },
    {
      icon: Clock,
      value: dataPointsDisplay,
      label: 'Data Points Analyzed',
    },
  ];

  // Dynamic solution bullet points with reliable defaults
  const solutionBullets = aboutData?.summary?.solutionBullets?.length
    ? aboutData.summary.solutionBullets
    : [
        'Objective, satellite-derived metrics unaffected by survey gaps.',
        'Granular resolution down to the city-block level.',
        'Continuous temporal analysis over years.',
      ];

  const formattedLastRefresh = aboutData?.stats?.lastDataRefresh
    ? new Date(aboutData.stats.lastDataRefresh).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 space-y-12 sm:space-y-16">
        {/* ── 1. Hero Title & Introduction ── */}
        <section className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Economic Intelligence & Earth Observation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Shining Light on the{' '}
            <span className="text-primary">
              Shadow
              <br className="hidden sm:inline" /> Economy
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
            Traditional economic metrics often miss the full picture. By combining high-resolution
            satellite imagery, human mobility data, and advanced AI, we reveal hidden economic
            activity that standard data collection methods simply cannot capture.
          </p>
        </section>

        {/* ── 2. Earth / Satellite Banner Image ── */}
        <section className="w-full overflow-hidden rounded-2xl border border-border-base bg-muted shadow-sm transition-shadow hover:shadow-md">
          <div className="relative h-[240px] sm:h-[320px] lg:h-[380px] w-full">
            <img
              src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1400&q=85"
              alt="Earth night lights and orbital observation showing global economic activity"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-wrap items-center gap-2 text-white text-xs font-medium bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <span>Orbital Earth Observation • Addis Ababa Pilot (~1.5 km² grid)</span>
              {formattedLastRefresh && (
                <span className="text-white/70 pl-1 border-l border-white/20">
                  Refreshed: {formattedLastRefresh}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Stats Grid (Analytics Section) ── */}
        <div className="space-y-4">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center p-5 sm:p-7 bg-card rounded-2xl border border-border-base shadow-xs text-center transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3.5 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {value}
                </p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1.5">
                  {label}
                </p>
              </div>
            ))}
          </section>

          {/* Secondary Live Telemetry Pill if backend data is present */}
          {aboutData?.stats && (
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 px-4 py-2.5 bg-muted/50 rounded-xl border border-border-base text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground">Live Telemetry:</span>
                <span>
                  {aboutData.stats.totalDataPoints
                    ? `${aboutData.stats.totalDataPoints.toLocaleString()} Total Signals & Snapshots`
                    : 'Dynamic Database Integration'}
                </span>
                {aboutData.stats.snapshotsCount && (
                  <span className="hidden sm:inline text-muted-foreground/70">
                    • {aboutData.stats.snapshotsCount.toLocaleString()} Monthly Snapshots
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary font-medium text-[11px]">
                  Cadence: {aboutData.stats.dataUpdateFrequency || 'Monthly / On-Demand'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. Gap vs. Solution Section ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Problem / Gap */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span>The Data Blindspot</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              The Gap in Economic Data
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Conventional economic indicators often rely on formal reporting, tax registries, and
              infrequent sample surveys. This creates a significant blind spot when it comes to
              informal or &ldquo;shadow&rdquo; economies, leading to misinformed policy decisions
              and an incomplete understanding of regional development.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              In rapidly developing regions like Addis Ababa, vast amounts of commerce and physical
              construction occur outside traditional banking frameworks. Without objective,
              high-frequency observation across our 238 grid cells, accurately mapping true economic
              growth remains impossible.
            </p>
          </div>

          {/* Right Column: Solution Card */}
          <div className="lg:col-span-6 rounded-2xl border border-blue-100 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Our Solution</h3>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                We leverage non-traditional data streams to proxy economic health. By analyzing
                nighttime light emissions, physical infrastructure development signatures from
                synthetic aperture radar, and aggregate human mobility patterns, our AI models
                construct a highly accurate, near-real-time index of economic activity.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-blue-200/50 dark:border-blue-900/50 mt-6">
              {solutionBullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Call to Action (CTA) ── */}
        <section className="border-t border-border-base pt-8 sm:pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-foreground">Ready to explore the data?</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Interact with regional heatmaps, historical timelines, and validated ground truth case
              studies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => navigate(ROUTES.MAP)}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm text-sm font-semibold h-11 px-5 gap-2 w-full sm:w-auto justify-center"
            >
              <span>Explore the Map</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.METHODOLOGY)}
              className="border-border-base text-foreground hover:bg-muted rounded-xl text-sm font-medium h-11 px-5 w-full sm:w-auto justify-center"
            >
              Read Methodology
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
