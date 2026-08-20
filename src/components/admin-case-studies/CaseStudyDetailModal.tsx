// src/components/admin-case-studies/CaseStudyDetailModal.tsx
import {
  X,
  MapPin,
  Calendar,
  ExternalLink,
  Edit2,
  Shield,
  FileText,
  Building2,
  Newspaper,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { useCaseStudyDetail } from '@/hooks/useCaseStudies';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CaseStudyDetailDTO, EvidenceTier } from '@/types';

interface CaseStudyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: (CaseStudyDetailDTO & { id: string }) | null;
  onEdit: (study: CaseStudyDetailDTO) => void;
}

export default function CaseStudyDetailModal({
  isOpen,
  onClose,
  study,
  onEdit,
}: CaseStudyDetailModalProps) {
  const { data: detailData, isLoading } = useCaseStudyDetail(isOpen && study?.id ? study.id : null);

  if (!isOpen || !study) return null;

  const current = detailData || study;

  const renderTierBadge = (tier?: EvidenceTier | string | null) => {
    switch (tier) {
      case 'OFFICIAL':
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-medium">
            <Shield className="w-3 h-3 text-blue-600" />
            Official Gazette
          </Badge>
        );
      case 'MARKET_REPORT':
        return (
          <Badge className="bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 font-medium">
            <FileText className="w-3 h-3 text-purple-600" />
            Market Report
          </Badge>
        );
      case 'INFRASTRUCTURE':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-medium">
            <Building2 className="w-3 h-3 text-amber-600" />
            Infrastructure
          </Badge>
        );
      case 'LOCAL_NEWS':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-medium">
            <Newspaper className="w-3 h-3 text-emerald-600" />
            Local News
          </Badge>
        );
      default:
        return <Badge variant="outline">{tier || 'Uncategorized'}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-border-base flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ── Header (Always Visible) ── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border-base bg-surface-container-low shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {renderTierBadge(current.evidenceTier)}
              {current.isPublished ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700 border border-gray-200">
                  <Clock className="w-3 h-3 text-gray-500" />
                  Draft
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{current.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1 font-mono">
              {current.latitude !== undefined && current.longitude !== undefined && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {Number(current.latitude).toFixed(5)}°, {Number(current.longitude).toFixed(5)}°
                </span>
              )}
              {current.gridCellId && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  Cell: {current.gridCellId}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoading && !detailData ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Key Dates Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-container-low rounded-2xl border border-border-base/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Score Rise (Satellite)
                    </span>
                    <span className="text-xs font-semibold text-gray-800 font-mono">
                      {current.scoreRiseDate ? String(current.scoreRiseDate).split('T')[0] : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Ground Confirmed
                    </span>
                    <span className="text-xs font-semibold text-gray-800 font-mono">
                      {current.confirmedDate ? String(current.confirmedDate).split('T')[0] : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Evidence Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Evidence Context & Narrative
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/70 p-3.5 rounded-2xl border border-border-base whitespace-pre-wrap">
                  {current.evidenceDescription || 'No detailed evidence description provided.'}
                </p>
              </div>

              {/* Evidence Source Link */}
              {current.evidenceUrl && (
                <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-blue-900 truncate">
                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium truncate">{current.evidenceUrl}</span>
                  </div>
                  <a
                    href={current.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 ml-2"
                  >
                    Open Link
                  </a>
                </div>
              )}

              {/* Satellite Imagery Before / After */}
              {(current.beforeImageUrl || current.afterImageUrl) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Visual Comparison (Before vs After)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {current.beforeImageUrl && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-600">Before</span>
                        <img
                          src={current.beforeImageUrl}
                          alt="Before"
                          className="w-full h-44 object-cover rounded-2xl border border-border-base shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {current.afterImageUrl && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-600">After</span>
                        <img
                          src={current.afterImageUrl}
                          alt="After"
                          className="w-full h-44 object-cover rounded-2xl border border-border-base shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer (Always Visible) ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-base bg-surface-container-low shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl h-9 cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(current as CaseStudyDetailDTO);
            }}
            className="text-xs bg-primary hover:bg-primary/90 text-white rounded-xl h-9 gap-1.5 shadow-xs cursor-pointer font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Case Study
          </Button>
        </div>
      </div>
    </div>
  );
}
