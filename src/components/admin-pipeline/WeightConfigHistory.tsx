import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/common/StatusBadge';
import type { ScoreWeightConfig } from '@/types';

interface WeightConfigHistoryProps {
  configs: ScoreWeightConfig[];
}

export default function WeightConfigHistory({ configs }: WeightConfigHistoryProps) {
  if (!configs.length) {
    return (
      <Card>
        <CardContent className="p-space-lg">
          <p className="text-muted-foreground text-center py-space-lg">
            No configurations yet. Create one to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-space-lg">
        <h3 className="text-card-title font-bold mb-space-lg">Configuration History</h3>

        <div className="space-y-space-md">
          {configs.map((config) => (
            <div
              key={config.id}
              className={`p-space-md rounded-lg border-2 ${
                config.isActive
                  ? 'border-primary bg-accent'
                  : 'border-border-base bg-surface-container-lowest'
              }`}
            >
              <div className="flex items-start justify-between mb-space-md">
                <div>
                  <p className="text-body-sm font-mono text-muted-foreground">{config.id}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {new Date(config.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {config.isActive && <StatusBadge status="success" label="ACTIVE" />}
              </div>

              <div className="space-y-space-sm">
                {config.weights.map((w) => (
                  <div key={w.sourceKey} className="flex justify-between items-center">
                    <p className="text-body-sm font-medium">{w.sourceKey}</p>
                    <p className="text-body-sm font-bold text-primary">
                      {(w.weight * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
