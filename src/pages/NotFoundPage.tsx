import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-space-margin-mobile text-center"
      style={{
        background:
          'radial-gradient(circle at 50% 30%, rgba(104, 154, 255, 0.08), transparent 55%), var(--background)',
      }}
    >
      {/* Signal Not Found */}
      <div className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-wider text-primary">
        <span className="material-symbols-outlined text-sm">satellite_alt</span>
        <span>Signal Not Found</span>
      </div>

      {/* Icon */}
      <div className="my-space-lg flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>
          travel_explore
        </span>
      </div>

      {/* 404 */}
      <h1 className="font-hero-lg-mobile text-hero-lg-mobile text-on-surface md:font-hero-lg md:text-hero-lg">
        404
      </h1>

      {/* Description */}
      <p className="mt-space-sm w-full max-w-md text-body-md text-text-secondary">
        This page doesn't exist, or the signal we're looking for has faded.
      </p>

      {/* Actions */}
      <div className="mt-space-lg flex flex-col gap-space-md sm:flex-row">
        <Button
          asChild
          className="bg-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-wider text-white shadow-sm transition-all hover:-translate-y-px hover:bg-primary-hover hover:shadow-md"
        >
          <Link to={ROUTES.HOME}>Back to Home</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="border-border-base px-6 py-3 font-label-caps text-label-caps uppercase tracking-wider text-primary shadow-sm transition-all hover:border-primary hover:shadow-md"
        >
          <Link to={ROUTES.MAP}>Explore the Map</Link>
        </Button>
      </div>
    </div>
  );
}
