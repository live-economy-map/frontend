// src/components/admin-pipeline/WeightConfigHistory.tsx
import { CheckCircle2, Clock } from 'lucide-react';
import type { ScoreWeightConfig } from '@/types';

interface WeightConfigHistoryProps {
  configs: ScoreWeightConfig[];
}

export default function WeightConfigHistory({ configs }: WeightConfigHistoryProps) {
  if (!configs.length) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-200/80 text-gray-400 text-sm">
        No configurations recorded yet. Create one on the left to set active weights.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <div
          key={config.id}
          className={`bg-white rounded-2xl p-5 border transition-all ${
            config.isActive
              ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm'
              : 'border-gray-200/80 shadow-2xs hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="font-mono text-xs font-bold text-gray-900 block truncate max-w-[200px]">
                Config #{config.id.slice(0, 8)}
              </span>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(config.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>

            {config.isActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="w-3 h-3" />
                Active Model
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
            {config.weights.map((w) => (
              <div key={w.sourceKey} className="p-2 rounded-xl bg-gray-50/80">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">
                  {w.sourceKey}
                </span>
                <span className="text-sm font-mono font-extrabold text-blue-600">
                  {(w.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
