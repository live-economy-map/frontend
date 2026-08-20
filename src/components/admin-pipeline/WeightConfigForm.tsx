import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateWeightConfig } from '@/hooks/useAdminPipeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

  // ✅ Using useWatch instead of watch
  const weights = useWatch({
    control,
    name: ['VIIRS', 'GHSL', 'RWI'],
  });

  const total = weights.reduce((sum, w) => sum + (w || 0), 0);

  const onSubmit = (data: WeightConfigFormValues) => {
    if (Math.abs(total - 1.0) > 0.01) {
      setError('root', {
        message: `Weights must sum to 1.0 (currently ${total.toFixed(2)})`,
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
    <Card>
      <CardContent className="p-space-lg">
        <h3 className="text-card-title font-bold mb-space-lg">Create New Configuration</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-space-lg">
          {['VIIRS', 'GHSL', 'RWI'].map((source) => (
            <div key={source}>
              <label className="block text-card-title font-semibold mb-space-sm">
                {source === 'VIIRS' && 'VIIRS Night-Time Lights'}
                {source === 'GHSL' && 'GHSL Urban Mapping'}
                {source === 'RWI' && 'RWI Resource Mapping'}
              </label>
              <input
                type="number"
                step="0.01"
                {...register(source as keyof WeightConfigFormValues, {
                  valueAsNumber: true,
                })}
                className="w-full px-space-md py-space-sm border border-border-base rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {errors[source as keyof WeightConfigFormValues] && (
                <p className="text-danger text-body-sm mt-space-micro">
                  {errors[source as keyof WeightConfigFormValues]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="p-space-md bg-surface-container rounded-lg">
            <p className="text-body-sm text-muted-foreground">
              Total Weight:{' '}
              <span
                className={`font-bold ${
                  Math.abs(total - 1.0) > 0.01 ? 'text-danger' : 'text-success'
                }`}
              >
                {total.toFixed(2)}
              </span>
            </p>
          </div>

          {errors.root && (
            <div className="p-space-md bg-danger-bg text-danger rounded-lg text-body-sm">
              {errors.root.message}
            </div>
          )}

          {createConfig.isError && !errors.root && (
            <div className="p-space-md bg-danger-bg text-danger rounded-lg text-body-sm">
              {(createConfig.error as { response?: { data?: { message?: string } } })?.response
                ?.data?.message || 'Failed to create configuration'}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || createConfig.isPending}
            className="w-full"
          >
            {createConfig.isPending ? 'Creating...' : 'Create Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
