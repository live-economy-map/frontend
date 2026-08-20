// src/components/content/OnboardingOverlay.tsx
import { useState } from 'react';

const DISMISS_KEY = 'onboarding-dismissed';

interface OnboardingOverlayProps {
  onDismiss?: () => void;
}

export default function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  // Use lazy initializer to check sessionStorage only once on mount
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem(DISMISS_KEY);
  });

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-space-lg max-w-md border border-border-base">
        <h2 className="font-card-title text-card-title text-on-surface mb-2">
          Welcome to the Shadow Economy Map
        </h2>
        <p className="text-body-sm text-text-muted mb-space-md">
          Explore economic growth signals across Addis Ababa. Click any grid cell to see its
          composite score and signal breakdown.
        </p>
        <button
          onClick={dismiss}
          className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-body-sm font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
