import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({ message, ctaLabel, onCtaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-space-md py-space-xxl text-center">
      <p className="text-text-muted">{message}</p>
      {ctaLabel && onCtaClick && (
        <Button variant="default" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
