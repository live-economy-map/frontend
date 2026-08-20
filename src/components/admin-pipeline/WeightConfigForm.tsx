// src/components/admin-pipeline/WeightConfigForm.tsx
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWeightConfig } from '@/hooks/useAdminPipeline';
import { Sliders, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const weightConfigSchema = z.object({
  VIIRS: z.number().min(0).max(1, 'Weight must be between 0 and 1'),
  GHSL: z.number().min(0).max(1, 'Weight must be between 0 and 1'),
  RWI: z.number().min(0).max(1, 'Weight must be between 0 and 1'),
});

type WeightConfigFormValues = z.infer<typeof weightConfigSchema>;

interface WeightConfigFormProps {
  onSuccess?: () => void;
}

export default function WeightConfigForm({ onSuccess }: WeightConfigFormProps) {
  const createConfig = useCreateWeightConfig();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
  } = useForm<WeightConfigFormValues>({
    resolver: zodResolver(weightConfigSchema),
    defaultValues: { VIIRS: 0.4, GHSL: 0.35, RWI: 0.25 },
  });

  const weights = useWatch({
    control,
    name: ['VIIRS', 'GHSL', 'RWI'],
  });

  const total = weights.reduce((sum, w) => sum + (w || 0), 0);
  const isValidTotal = Math.abs(total - 1.0) <= 0.01;

  const onSubmit = (data: WeightConfigFormValues) => {
    if (!isValidTotal) {
      setError('root', {
        message: `Weights must sum to exactly 1.0 (currently ${total.toFixed(2)})`,
      });
      return;
    }

    createConfig.mutate(
      [
        { sourceKey: 'VIIRS', weight: data.VIIRS },
        { sourceKey: 'GHSL', weight: data.GHSL },
        { sourceKey: 'RWI', weight: data.RWI },
      ],
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-6">
      <div className="space-y-1">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <Sliders className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          Create Weight Configuration
        </h2>
        <p className="text-xs text-gray-500">
          Adjust the relative contribution of each modality to composite anomaly scores.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          {
            key: 'VIIRS',
            label: 'VIIRS Night-Time Radiance',
            desc: 'High-frequency nocturnal luminosity proxy',
          },
          {
            key: 'GHSL',
            label: 'GHSL Built-up Surface',
            desc: 'SAR radar physical building footprints',
          },
          {
            key: 'RWI',
            label: 'RWI Relative Wealth Index',
            desc: 'Machine-learning spatial wealth proxy',
          },
        ].map(({ key, label, desc }) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">{label}</label>
              <span className="text-[11px] font-mono text-gray-400">{key}</span>
            </div>
            <p className="text-[11px] text-gray-500">{desc}</p>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              {...register(key as keyof WeightConfigFormValues, {
                valueAsNumber: true,
              })}
              className="w-full h-10 px-3.5 border border-gray-200 bg-gray-50/50 rounded-xl text-xs font-mono font-bold text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {errors[key as keyof WeightConfigFormValues] && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors[key as keyof WeightConfigFormValues]?.message}
              </p>
            )}
          </div>
        ))}

        {/* Sum Indicator */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            isValidTotal
              ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800'
              : 'bg-amber-50 border-amber-200/80 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {isValidTotal ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span>Total Weight Allocation:</span>
          </div>
          <span className="font-mono text-sm font-bold">{total.toFixed(2)} / 1.00</span>
        </div>

        {errors.root && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {createConfig.isError && !errors.root && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>
              {(createConfig.error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || 'Failed to create weight configuration'}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || createConfig.isPending}
          className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {createConfig.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving & Activating…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save & Set Active Configuration</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
