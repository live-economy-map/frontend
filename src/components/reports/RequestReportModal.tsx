// src/components/reports/RequestReportModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { reportRequestsApi } from '@/api/reportRequests.api';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import {
  X,
  FileText,
  MapPin,
  Building2,
  Mail,
  Phone,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { ContactPreference } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RequestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCellId?: string;
  defaultAreaLabel?: string;
}

const ORG_TYPES = [
  'Financial Institution / Bank',
  'Commercial Real Estate Developer',
  'Government / Municipal Planning',
  'Multilateral / Development Agency',
  'Academic / Policy Think Tank',
  'Private Equity / Investment Fund',
  'Independent Researcher',
  'Other',
];

export default function RequestReportModal({
  isOpen,
  onClose,
  defaultCellId,
  defaultAreaLabel,
}: RequestReportModalProps) {
  const { isAuthenticated, openAuthModal } = useAuth();

  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [cellIdsInput, setCellIdsInput] = useState('');
  const [orgType, setOrgType] = useState('Commercial Real Estate Developer');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultCellId) {
      setCellIdsInput(defaultCellId);
      setTitle(
        defaultAreaLabel
          ? `Economic Growth & Infrastructure Deep-Dive: ${defaultAreaLabel}`
          : `Custom Spatial Analysis: Cell ${defaultCellId.slice(0, 8)}`
      );
    } else {
      setCellIdsInput('');
      setTitle('Addis Ababa Spatial Economic Activity Deep-Dive');
    }
    setErrorMessage(null);
  }, [defaultCellId, defaultAreaLabel, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => inputRef.current?.focus(), 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onClose();
      openAuthModal('login');
      return;
    }

    setErrorMessage(null);

    const cells = cellIdsInput
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (cells.length === 0) {
      setErrorMessage('Please specify at least one target grid cell ID.');
      return;
    }

    if (!title.trim() || !questionPrompt.trim()) {
      setErrorMessage('Please provide a report title and your research questions.');
      return;
    }

    setIsLoading(true);
    try {
      await reportRequestsApi.createRequest({
        title: title.trim(),
        questionPrompt: questionPrompt.trim(),
        areaCellIds: cells,
        orgType,
        contactPreference,
      });

      toast.success(
        'Your custom analysis request has been submitted. Our spatial analytics team is reviewing it.',
        { title: 'Request Submitted' }
      );
      onClose();
      navigate('/my-requests');
    } catch (err) {
      setErrorMessage(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="report-modal-title"
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                Request Deep-Dive Analysis
              </h2>
              <p className="text-xs text-gray-500">
                Tailored spatial economic intelligence synthesized by AI and verified by analysts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close report request modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unauthenticated notice */}
        {!isAuthenticated && (
          <div className="m-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>You must be signed in to submit and track custom report requests.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 cursor-pointer text-xs shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Error message alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5">
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Report Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Commercial viability of mixed-use development in Bole"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Grid Cell ID(s) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={cellIdsInput}
                onChange={(e) => setCellIdsInput(e.target.value)}
                placeholder="Comma-separated cell IDs (e.g. 05e2d83f-..., a94101e...)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Active cell is automatically attached. You can add multiple cell IDs separated by
              commas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Key Questions & Research Objectives <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={questionPrompt}
              onChange={(e) => setQuestionPrompt(e.target.value)}
              placeholder="What specific economic insights do you need? (e.g., Nightlight trajectory over last 3 years, daytime activity correlations with GHSL built-up density, comparison against adjacent commercial corridors, expected growth momentum)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Organization Type
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ORG_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Contact Preference
              </label>
              <div className="flex gap-2">
                {(['EMAIL', 'PHONE', 'TELEGRAM'] as ContactPreference[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setContactPreference(pref)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5',
                      contactPreference === pref
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    )}
                  >
                    {pref === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                    {pref === 'PHONE' && <Phone className="w-3.5 h-3.5" />}
                    {pref === 'TELEGRAM' && <Send className="w-3.5 h-3.5" />}
                    <span>{pref}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isAuthenticated}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request…</span>
                </>
              ) : (
                <>
                  <span>Submit Analysis Request</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
