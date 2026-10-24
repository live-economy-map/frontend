// src/pages/requests/MyRequestsPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportRequestsApi } from '@/api/reportRequests.api';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';

import RequestReportModal from '@/components/reports/RequestReportModal';
import { cn } from '@/lib/utils';
import type { ReportRequestStatus } from '@/types';

import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

const STATUS_CONFIG: Record<
  ReportRequestStatus,
  { label: string; bg: string; text: string; icon: typeof Clock }
> = {
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-600 dark:text-blue-400',
    icon: Clock,
  },
  IN_REVIEW: {
    label: 'In Review',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-600 dark:text-amber-400',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'In Synthesis',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-600 dark:text-indigo-400',
    icon: Loader2,
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Declined',
    bg: 'bg-red-50 dark:bg-red-950/60',
    text: 'text-red-600 dark:text-red-400',
    icon: AlertCircle,
  },
};

const TIMELINE_STEPS: ReportRequestStatus[] = [
  'SUBMITTED',
  'IN_REVIEW',
  'IN_PROGRESS',
  'DELIVERED',
];

export default function MyRequestsPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: requests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-report-requests'],
    queryFn: () => reportRequestsApi.getMyRequests(),
    enabled: isAuthenticated,
  });

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Customer Intelligence
              </span>
              <span className="text-xs text-gray-400">• V2 Gate 2 Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              My Deep-Dive Analysis Requests
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mt-1">
              Track custom spatial reports requested for Addis Ababa corridors, view status
              timelines, and download finalized analytical deliverables.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
              else setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Analysis Request</span>
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xs space-y-4">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Sign In to View Your Requests
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please sign in with your account to access requested deep-dive deliverables and track
              in-flight analyses.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        ) : isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs">Loading your report requests…</p>
          </div>
        ) : isError ? (
          <div className="p-6 rounded-2xl bg-red-50 text-red-600 text-xs">
            Failed to load your analysis requests. Please try again later.
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No Analysis Requests Yet
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Have specific questions about daytime density vs nightlight trends in a specific Addis
              Ababa neighborhood? Submit your first deep-dive request.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Submit First Request
              </button>
              <Link
                to={ROUTES.MAP}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Explore Map First
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const statusCfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.SUBMITTED;
              const StatusIcon = statusCfg.icon;

              const currentStepIndex = TIMELINE_STEPS.indexOf(request.status);

              return (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow space-y-6"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
                            statusCfg.bg,
                            statusCfg.text
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusCfg.label}</span>
                        </span>

                        <span className="text-xs text-gray-400 font-mono">
                          ID: {request.id.slice(0, 10)}
                        </span>

                        {request.orgType && (
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {request.orgType}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {request.title}
                      </h3>

                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                        "{request.questionPrompt}"
                      </p>
                    </div>

                    <div className="text-xs text-gray-400 flex items-center gap-1.5 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Target Cells */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500">Target Cells:</span>
                    {request.areaCellIds.map((cellId) => (
                      <Link
                        key={cellId}
                        to={`${ROUTES.MAP}?cellId=${cellId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-mono font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <span>{cellId.slice(0, 10)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>

                  {/* Visual Status Timeline */}
                  {request.status !== 'REJECTED' && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between relative">
                        {/* Connecting line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-gray-800 -z-0" />

                        {TIMELINE_STEPS.map((step, idx) => {
                          const isCompleted =
                            currentStepIndex >= idx || request.status === 'DELIVERED';
                          const isCurrent = currentStepIndex === idx;

                          return (
                            <div
                              key={step}
                              className="relative z-10 flex flex-col items-center gap-1.5"
                            >
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs',
                                  isCompleted
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 text-gray-400',
                                  isCurrent && 'ring-4 ring-blue-100 dark:ring-blue-950'
                                )}
                              >
                                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={cn(
                                  'text-[10px] font-semibold uppercase tracking-wider',
                                  isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                                )}
                              >
                                {step.replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Deliverables Section (When DELIVERED) */}
                  {request.status === 'DELIVERED' &&
                    request.deliverables &&
                    request.deliverables.length > 0 && (
                      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Download className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                              Analytical Deliverable Ready
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {request.deliverables[0].fileName}
                              {request.deliverables[0].fileSizeBytes &&
                                ` • ${(request.deliverables[0].fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`}
                            </p>
                          </div>
                        </div>

                        <a
                          href={request.deliverables[0].fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={request.deliverables[0].fileName}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Deliverable</span>
                        </a>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RequestReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
