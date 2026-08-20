// src/pages/admin/AdminCaseStudiesPage.tsx
import { useState } from 'react';
import { Plus, BookOpen, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CaseStudiesTable,
  CaseStudyModal,
  CaseStudyDetailModal,
  DiscoverCandidatesSidebar,
} from '@/components/admin-case-studies';
import { useAdminCaseStudiesList } from '@/hooks/useCaseStudies';
import type {
  CaseStudyDetailDTO,
  DiscoveryCandidate,
  AdminCaseStudyPayload,
  EvidenceTier,
} from '@/types';

export default function AdminCaseStudiesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyDetailDTO | null>(null);
  const [modalInitialData, setModalInitialData] = useState<Partial<
    CaseStudyDetailDTO & AdminCaseStudyPayload & { id?: string }
  > | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch case studies for table and KPI widgets
  const { data } = useAdminCaseStudiesList(currentPage);

  const totalStudies = data?.total || data?.items?.length || 0;
  const publishedCount = data?.items?.filter((s) => s.isPublished).length || 0;
  const draftCount = data?.items?.filter((s) => !s.isPublished).length || 0;
  const officialCount =
    data?.items?.filter((s) => s.evidenceTier === 'OFFICIAL' || s.evidenceTier === 'INFRASTRUCTURE')
      .length || 0;

  const handleCreateNew = () => {
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (study: CaseStudyDetailDTO) => {
    setModalInitialData(study);
    setIsModalOpen(true);
  };

  const handleView = (study: CaseStudyDetailDTO) => {
    setSelectedStudy(study);
    setIsDetailModalOpen(true);
  };

  const handleUseCandidate = (candidate: DiscoveryCandidate) => {
    // Pre-fill the case study modal form with AI candidate data
    const prefilledData: Partial<AdminCaseStudyPayload> = {
      name: candidate.title || candidate.summary.slice(0, 60),
      evidenceDescription: candidate.summary,
      evidenceUrl: candidate.sourceUrl || '',
      evidenceTier: (candidate.suggestedEvidenceTier as EvidenceTier) || 'LOCAL_NEWS',

      confirmedDate: candidate.mentionedDate
        ? new Date(candidate.mentionedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      scoreRiseDate: new Date().toISOString().split('T')[0],
      latitude: candidate.latitude || 9.0105,
      longitude: candidate.longitude || 38.7615,
      isPublished: false,
    };

    setModalInitialData(prefilledData);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              Admin Portal
            </span>
            <span className="text-xs text-muted-foreground">• Ground Truth Validation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">Case Study Curation</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Curate and verify physical economic growth stories, before/after satellite proofs, and
            AI-extracted news candidates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md shadow-primary/20 text-xs h-10 px-4 gap-1.5 font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Case Study
          </Button>
        </div>
      </div>

      {/* ── Top KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total */}
        <div className="p-4 bg-white rounded-2xl border border-border-base shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Total Studies
            </div>
            <div className="text-xl font-bold text-gray-900">{totalStudies}</div>
          </div>
        </div>

        {/* Published */}
        <div className="p-4 bg-white rounded-2xl border border-border-base shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Published on Map
            </div>
            <div className="text-xl font-bold text-emerald-700">{publishedCount}</div>
          </div>
        </div>

        {/* Drafts */}
        <div className="p-4 bg-white rounded-2xl border border-border-base shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Drafts in Progress
            </div>
            <div className="text-xl font-bold text-amber-700">{draftCount}</div>
          </div>
        </div>

        {/* High Confidence */}
        <div className="p-4 bg-white rounded-2xl border border-border-base shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Official / Infra
            </div>
            <div className="text-xl font-bold text-purple-700">{officialCount}</div>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Table (Left 8 cols) & AI Discovery (Right 4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Curation Table Panel */}
        <div className="lg:col-span-8 space-y-4">
          <CaseStudiesTable
            page={currentPage}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onView={handleView}
            onCreateNew={handleCreateNew}
          />
        </div>

        {/* Right AI Discovery Panel */}
        <div className="lg:col-span-4 sticky top-6">
          <DiscoverCandidatesSidebar onUseCandidate={handleUseCandidate} />
        </div>
      </div>

      {/* ── Modals ── */}
      <CaseStudyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalInitialData(null);
        }}
        initialData={modalInitialData}
      />

      <CaseStudyDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudy(null);
        }}
        study={selectedStudy}
        onEdit={(study) => {
          setIsDetailModalOpen(false);
          handleEdit(study);
        }}
      />
    </div>
  );
}
