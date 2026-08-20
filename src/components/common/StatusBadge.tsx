type Status = 'success' | 'warning' | 'error' | 'neutral';

interface StatusBadgeProps {
  status: Status;
  label: string;
}

const STATUS_STYLES: Record<Status, string> = {
  success: 'bg-status-success-bg text-status-success-text',
  warning: 'bg-status-warning-bg text-status-warning-text',
  error: 'bg-status-error-bg text-status-error-text',
  neutral: 'bg-surface-container text-on-surface-variant',
};

// Consolidated success/warning/error/neutral pill — see 9.4.
// Used by admin-pipeline/* status chips. NOT used for case-studies'
// evidenceTier (a 4-value content category, not a success/warning/error
// state) — that badge is rendered locally in the case-studies components.
export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-label-caps uppercase ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}
