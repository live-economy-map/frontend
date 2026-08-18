// src/components/common/StatusBadge.tsx
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'neutral';

interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  error: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  neutral: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variantStyles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
