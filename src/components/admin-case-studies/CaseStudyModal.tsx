// src/components/admin-case-studies/CaseStudyModal.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useCreateCaseStudy, useUpdateCaseStudy, useCaseStudyDetail } from '@/hooks/useCaseStudies';
import { Button } from '@/components/ui/button';
import type { AdminCaseStudyPayload, CaseStudyDetailDTO, EvidenceTier } from '@/types';
import { getApiErrorMessage } from '@/utils/errorHandler';

const caseStudySchema = z.object({
  name: z.string().min(1, 'Title / Name is required'),
  latitude: z.coerce
    .number({ message: 'Latitude must be a valid number' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number({ message: 'Longitude must be a valid number' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  gridCellId: z.string().optional(),
  evidenceTier: z.enum(['OFFICIAL', 'MARKET_REPORT', 'INFRASTRUCTURE', 'LOCAL_NEWS'], {
    message: 'Please select a valid evidence tier',
  }),
  evidenceUrl: z.string().optional(),
  evidenceDescription: z.string().min(1, 'Evidence description narrative is required'),
  scoreRiseDate: z.string().min(1, 'Score rise date is required'),
  confirmedDate: z.string().min(1, 'Confirmed date is required'),
  beforeImageUrl: z.string().optional(),
  afterImageUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type CaseStudyFormData = z.infer<typeof caseStudySchema>;

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<CaseStudyDetailDTO & AdminCaseStudyPayload & { id?: string }> | null;
}

export default function CaseStudyModal({ isOpen, onClose, initialData }: CaseStudyModalProps) {
  const isEditing = !!initialData?.id;
  const createMutation = useCreateCaseStudy();
  const updateMutation = useUpdateCaseStudy();
  const [formError, setFormError] = useState<string | null>(null);

  // If editing and initialData is missing full fields (e.g. from list item), fetch detail
  const { data: fullDetail, isLoading: isDetailLoading } = useCaseStudyDetail(
    isEditing && initialData?.id ? initialData.id : null
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CaseStudyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(caseStudySchema) as any,
    defaultValues: {
      name: '',
      latitude: 8.9806,
      longitude: 38.7578,
      gridCellId: '',
      evidenceTier: 'OFFICIAL',
      evidenceUrl: '',
      evidenceDescription: '',
      scoreRiseDate: new Date().toISOString().split('T')[0],
      confirmedDate: new Date().toISOString().split('T')[0],
      beforeImageUrl: '',
      afterImageUrl: '',
      isPublished: false,
    },
  });

  const beforeImg = watch('beforeImageUrl');
  const afterImg = watch('afterImageUrl');
  const isPublished = watch('isPublished');
  const scoreRiseDateVal = watch('scoreRiseDate');
  const confirmedDateVal = watch('confirmedDate');

  const isDateWarning = scoreRiseDateVal && confirmedDateVal && scoreRiseDateVal > confirmedDateVal;

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      const dataToUse = fullDetail || initialData;
      if (dataToUse) {
        reset({
          name: dataToUse.name || '',
          latitude: Number(dataToUse.latitude) || 8.9806,
          longitude: Number(dataToUse.longitude) || 38.7578,
          gridCellId: dataToUse.gridCellId || '',
          evidenceTier: (dataToUse.evidenceTier as EvidenceTier) || 'OFFICIAL',
          evidenceUrl: dataToUse.evidenceUrl || '',
          evidenceDescription: dataToUse.evidenceDescription || '',
          scoreRiseDate: dataToUse.scoreRiseDate
            ? String(dataToUse.scoreRiseDate).split('T')[0]
            : new Date().toISOString().split('T')[0],
          confirmedDate: dataToUse.confirmedDate
            ? String(dataToUse.confirmedDate).split('T')[0]
            : new Date().toISOString().split('T')[0],
          beforeImageUrl: dataToUse.beforeImageUrl || '',
          afterImageUrl: dataToUse.afterImageUrl || '',
          isPublished: dataToUse.isPublished ?? false,
        });
      } else {
        reset({
          name: '',
          latitude: 8.9806,
          longitude: 38.7578,
          gridCellId: '',
          evidenceTier: 'OFFICIAL',
          evidenceUrl: '',
          evidenceDescription: '',
          scoreRiseDate: new Date().toISOString().split('T')[0],
          confirmedDate: new Date().toISOString().split('T')[0],
          beforeImageUrl: '',
          afterImageUrl: '',
          isPublished: false,
        });
      }
    }
  }, [isOpen, initialData, fullDetail, reset]);

  if (!isOpen) return null;

  const onValidSubmit = async (values: CaseStudyFormData) => {
    setFormError(null);
    try {
      // Build clean payload matching backend schema (omit optional fields if empty)
      const payload: AdminCaseStudyPayload = {
        name: values.name.trim(),
        latitude: parseFloat(String(values.latitude)),
        longitude: parseFloat(String(values.longitude)),
        evidenceTier: values.evidenceTier,
        evidenceDescription: values.evidenceDescription.trim(),
        scoreRiseDate: String(values.scoreRiseDate).split('T')[0],
        confirmedDate: String(values.confirmedDate).split('T')[0],
        isPublished: Boolean(values.isPublished),
      };

      if (values.evidenceUrl && values.evidenceUrl.trim() !== '') {
        payload.evidenceUrl = values.evidenceUrl.trim();
      }
      if (values.beforeImageUrl && values.beforeImageUrl.trim() !== '') {
        payload.beforeImageUrl = values.beforeImageUrl.trim();
      }
      if (values.afterImageUrl && values.afterImageUrl.trim() !== '') {
        payload.afterImageUrl = values.afterImageUrl.trim();
      }
      if (values.gridCellId && values.gridCellId.trim() !== '') {
        payload.gridCellId = values.gridCellId.trim();
      }

      if (isEditing && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save case study'));
    }
  };

  const onInvalidSubmit = (fieldErrors: typeof errors) => {
    const firstError = Object.values(fieldErrors)[0];
    if (firstError?.message) {
      setFormError(`Please fix validation: ${firstError.message}`);
    } else {
      setFormError('Please fill in all required fields correctly.');
    }
  };

  const isPending =
    isSubmitting || createMutation.isPending || updateMutation.isPending || isDetailLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-border-base flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ── Header (Always Visible) ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base bg-surface-container-low shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEditing ? `Edit Case Study` : 'New Validation Case Study'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Document ground-truth infrastructure and economic changes on the map.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Form with Scrollable Body & Fixed Footer ── */}
        <form
          onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Scrollable Form Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Date Warning Banner */}
            {isDateWarning && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold">Note on verification dates:</span> Score rise date
                  ({scoreRiseDateVal}) is after ground confirmation date ({confirmedDateVal}). For
                  predictive anomaly validation, the satellite score usually rises before or
                  concurrently with ground confirmation.
                </div>
              </div>
            )}

            {/* Row 1: Name & GridCellId */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Case Study Title / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bole Lemi Industrial Park Expansion"
                  {...register('name')}
                  className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Grid Cell ID <span className="text-gray-400 font-normal">(optional UUID)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  {...register('gridCellId')}
                  className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 2: Coordinates (Lat / Lng) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-surface-container-low rounded-2xl border border-border-base/70">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Latitude (WGS84) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground">-90 to 90</span>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="8.9806"
                  {...register('latitude')}
                  className="w-full h-10 px-3 text-xs bg-white border border-border-base rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                />
                {errors.latitude && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Longitude (WGS84) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground">-180 to 180</span>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="38.7578"
                  {...register('longitude')}
                  className="w-full h-10 px-3 text-xs bg-white border border-border-base rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                />
                {errors.longitude && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.longitude.message}</p>
                )}
              </div>
            </div>

            {/* Row 3: Evidence Tier & Evidence URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Evidence Tier <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('evidenceTier')}
                  className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-800"
                >
                  <option value="OFFICIAL">OFFICIAL (Government / Ministry Gazette)</option>
                  <option value="MARKET_REPORT">
                    MARKET_REPORT (Market Research / Sector Report)
                  </option>
                  <option value="INFRASTRUCTURE">INFRASTRUCTURE (Public Works & Roads)</option>
                  <option value="LOCAL_NEWS">LOCAL_NEWS (Verified Local Press & News)</option>
                </select>
                {errors.evidenceTier && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {errors.evidenceTier.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                  Evidence Reference URL{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/report.pdf"
                  {...register('evidenceUrl')}
                  className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 4: Evidence Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Evidence Context & Verification Narrative <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Phase 2 factory sheds operational as confirmed by industrial ministry report and ground inspection..."
                {...register('evidenceDescription')}
                className="w-full p-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none leading-relaxed"
              ></textarea>
              {errors.evidenceDescription && (
                <p className="text-[11px] text-red-500 font-medium">
                  {errors.evidenceDescription.message}
                </p>
              )}
            </div>

            {/* Row 5: Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  Score Rise Date (Satellite Detection) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('scoreRiseDate')}
                  className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                />
                {errors.scoreRiseDate && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {errors.scoreRiseDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Confirmed Date (Ground Verification) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('confirmedDate')}
                  className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                />
                {errors.confirmedDate && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {errors.confirmedDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 6: Image URLs */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                    Before Development Photo URL{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/before.jpg"
                    {...register('beforeImageUrl')}
                    className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                    After Development Photo URL{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/after.jpg"
                    {...register('afterImageUrl')}
                    className="w-full h-10 px-3 text-xs bg-gray-50/60 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
                  />
                </div>
              </div>

              {/* Live Thumbnails */}
              {(beforeImg || afterImg) && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container-low rounded-2xl border border-border-base/70">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">
                      Before Preview
                    </span>
                    {beforeImg ? (
                      <img
                        src={beforeImg}
                        alt="Before Preview"
                        className="w-full h-24 object-cover rounded-xl border border-border-base bg-white"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-24 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-[11px] text-gray-400">
                        No Before Image
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">
                      After Preview
                    </span>
                    {afterImg ? (
                      <img
                        src={afterImg}
                        alt="After Preview"
                        className="w-full h-24 object-cover rounded-xl border border-border-base bg-white"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-24 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-[11px] text-gray-400">
                        No After Image
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Row 7: Publish Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-border-base">
              <div>
                <div className="text-xs font-bold text-gray-900">Publish Immediately</div>
                <div className="text-[11px] text-muted-foreground">
                  When unchecked, this case study is saved as a Draft for internal review.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setValue('isPublished', !isPublished, { shouldDirty: true })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  isPublished ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isPublished ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ── Footer / Actions (Always Visible) ── */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-base bg-surface-container-low shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs rounded-xl h-10 px-4 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="text-xs bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-5 shadow-sm shadow-primary/30 cursor-pointer font-semibold"
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Case Study'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
