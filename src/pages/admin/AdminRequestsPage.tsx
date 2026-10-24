// src/pages/admin/AdminRequestsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminReportRequestsApi } from '@/api/admin/reportRequests.api';
import DemandMetricsCard from '@/components/admin/DemandMetricsCard';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import { FileText, Search, Filter, Upload, Sparkles, ChevronRight, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportRequest, ReportRequestStatus, RequestPriority } from '@/types';
import AIDraftEditor from '@/components/admin/AIDraftEditor';

const STATUSES: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'In Synthesis', value: 'IN_PROGRESS' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Declined', value: 'REJECTED' },
];

const PRIORITIES: { label: string; value: string }[] = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ReportRequest | null>(null);

  // Deliverable upload state
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableName, setDeliverableName] = useState('');
  const [deliverableSize] = useState('2.4');

  // AI Draft Modal State
  const [isAiDraftOpen, setIsAiDraftOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-report-requests', statusFilter, priorityFilter, searchQuery, page],
    queryFn: () =>
      adminReportRequestsApi.getRequests({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchQuery || undefined,
        page,
        limit: 10,
      }),
  });

  const requests: ReportRequest[] = Array.isArray(data)
    ? data
    : data && 'items' in data
      ? data.items
      : [];

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        status?: ReportRequestStatus;
        assignedAdminId?: string | null;
        internalNotes?: string | null;
        priority?: RequestPriority;
      };
    }) => adminReportRequestsApi.updateRequest(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin-report-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-demand-metrics'] });
      setSelectedRequest((prev) => (prev?.id === updated.id ? updated : prev));
      toast.success('Request updated successfully.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to update request' });
    },
  });

  const deliverableMutation = useMutation({
    mutationFn: ({
      id,
      fileUrl,
      fileName,
      fileSizeBytes,
    }: {
      id: string;
      fileUrl: string;
      fileName: string;
      fileSizeBytes?: number;
    }) =>
      adminReportRequestsApi.addDeliverable(id, {
        fileUrl,
        fileName,
        fileSizeBytes,
        mimeType: 'application/pdf',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-report-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-demand-metrics'] });
      setDeliverableUrl('');
      setDeliverableName('');
      toast.success('Deliverable attached and request marked as DELIVERED.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to add deliverable' });
    },
  });

  const handleStatusChange = (newStatus: ReportRequestStatus) => {
    if (!selectedRequest) return;
    updateMutation.mutate({
      id: selectedRequest.id,
      data: { status: newStatus },
    });
  };

  const handleDeliverableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !deliverableUrl || !deliverableName) return;

    deliverableMutation.mutate({
      id: selectedRequest.id,
      fileUrl: deliverableUrl,
      fileName: deliverableName,
      fileSizeBytes: Math.round(parseFloat(deliverableSize || '1') * 1024 * 1024),
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Demand Tracker */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Custom Analysis Requests Queue
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review inbound customer deep-dive prompts, track Gate 2 market demand, generate AI
          intelligence drafts, and publish client deliverables.
        </p>
      </div>

      {/* Demand Metrics Card */}
      <DemandMetricsCard />

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by requester email, title, or cell ID…"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs">Loading analysis requests…</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-red-600">
            Failed to load report requests.
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-900">No report requests found</p>
            <p className="text-xs text-gray-500">
              No requests match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <th className="px-5 py-3.5">Requester & Org</th>
                  <th className="px-5 py-3.5">Report Title</th>
                  <th className="px-5 py-3.5">Target Cells</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">
                        {req.user?.fullName || 'Requester'}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {req.user?.email || 'N/A'}
                      </div>
                      {req.orgType && (
                        <span className="text-[10px] text-gray-400">{req.orgType}</span>
                      )}
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-gray-900 truncate">{req.title}</div>
                      <div className="text-[11px] text-gray-500 line-clamp-1 italic">
                        "{req.questionPrompt}"
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {req.areaCellIds.slice(0, 2).map((cellId) => (
                          <span
                            key={cellId}
                            className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px]"
                          >
                            {cellId.slice(0, 8)}
                          </span>
                        ))}
                        {req.areaCellIds.length > 2 && (
                          <span className="text-[10px] text-gray-400">
                            +{req.areaCellIds.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px]',
                          req.status === 'DELIVERED' && 'bg-emerald-50 text-emerald-700',
                          req.status === 'IN_PROGRESS' && 'bg-indigo-50 text-indigo-700',
                          req.status === 'IN_REVIEW' && 'bg-amber-50 text-amber-700',
                          req.status === 'SUBMITTED' && 'bg-blue-50 text-blue-700',
                          req.status === 'REJECTED' && 'bg-red-50 text-red-700'
                        )}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-400 font-mono text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(req);
                        }}
                        className="p-1 rounded-lg text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Detail Drawer */}
      {selectedRequest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRequest(null);
          }}
        >
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  REQ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 truncate max-w-xs">
                    {selectedRequest.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">ID: {selectedRequest.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Update & Actions */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Request Lifecycle Status</span>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(e.target.value as ReportRequestStatus)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-800 bg-white"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setIsAiDraftOpen(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Report Draft</span>
                  </button>
                </div>
              </div>

              {/* Requester Profile */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Requester Information
                </h4>
                <div className="p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Full Name</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRequest.user?.fullName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-mono text-gray-900">
                      {selectedRequest.user?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contact Preference</span>
                    <span className="font-semibold text-blue-600">
                      {selectedRequest.contactPreference || 'EMAIL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organization Type</span>
                    <span className="text-gray-900">{selectedRequest.orgType || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Research Prompt & Cells */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Analysis Objectives
                </h4>
                <div className="p-4 rounded-2xl border border-gray-100 space-y-3">
                  <p className="text-xs text-gray-800 leading-relaxed font-serif bg-slate-50 p-3 rounded-xl">
                    "{selectedRequest.questionPrompt}"
                  </p>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Target Spatial Cells:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.areaCellIds.map((id) => (
                        <span
                          key={id}
                          className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverable Uploader */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Attach Deliverable File
                </h4>
                <form
                  onSubmit={handleDeliverableSubmit}
                  className="p-4 rounded-2xl border border-gray-100 space-y-3 bg-white"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Deliverable File Name
                    </label>
                    <input
                      type="text"
                      required
                      value={deliverableName}
                      onChange={(e) => setDeliverableName(e.target.value)}
                      placeholder="e.g. Bole_Economic_Corridor_Assessment_Q3.pdf"
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      File URL or Hosted Asset Path
                    </label>
                    <input
                      type="url"
                      required
                      value={deliverableUrl}
                      onChange={(e) => setDeliverableUrl(e.target.value)}
                      placeholder="https://storage.ecolens.org/reports/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={deliverableMutation.isPending}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {deliverableMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Publish Deliverable & Mark Delivered</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Chronological Audit Events */}
              {selectedRequest.events && selectedRequest.events.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Audit Trail & Events
                  </h4>
                  <div className="space-y-2 border-l-2 border-gray-100 pl-3">
                    {selectedRequest.events.map((evt) => (
                      <div key={evt.id} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{evt.status}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(evt.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {evt.note && <p className="text-gray-500 text-[11px]">{evt.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Draft Review Editor Modal */}
      {selectedRequest && isAiDraftOpen && (
        <AIDraftEditor
          requestId={selectedRequest.id}
          requestTitle={selectedRequest.title}
          targetCells={selectedRequest.areaCellIds}
          questionPrompt={selectedRequest.questionPrompt}
          onClose={() => setIsAiDraftOpen(false)}
          onDelivered={() => {
            setIsAiDraftOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-report-requests'] });
          }}
        />
      )}
    </div>
  );
}
