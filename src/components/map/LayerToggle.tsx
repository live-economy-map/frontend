// src/components/map/LayerToggle.tsx
type RawLayer = 'VIIRS' | 'GHSL' | 'RWI';

interface LayerToggleProps {
  activeLayer: RawLayer | null;
  onChange: (layer: RawLayer | null) => void;
}

const OPTIONS: { label: string; value: RawLayer | null }[] = [
  { label: 'Composite', value: null },
  { label: 'VIIRS', value: 'VIIRS' },
  { label: 'GHSL', value: 'GHSL' },
  { label: 'RWI', value: 'RWI' },
];

export default function LayerToggle({ activeLayer, onChange }: LayerToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-surface-container-lowest rounded-full border border-border-base px-space-sm py-space-micro shadow-sm">
      {OPTIONS.map((opt) => {
        const isActive = activeLayer === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.value)}
            className={
              isActive
                ? 'px-space-sm py-space-micro rounded-full bg-primary text-on-primary text-body-sm font-medium transition-colors'
                : 'px-space-sm py-space-micro rounded-full text-on-surface-variant text-body-sm hover:text-primary transition-colors'
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
