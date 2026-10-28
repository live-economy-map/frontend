// src/components/export/ExportModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exportApi } from '@/api/export.api';
import { billingApi } from '@/api/billing.api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import {
  X,
  Download,
  Lock,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Loader2,
  ArrowRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCellId?: string | null;
}

export default function ExportModal({ isOpen, onClose, selectedCellId }: ExportModalProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toast } = useToast();

  const [format, setFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [dateFrom, setDateFrom] = useState('2023-01-01');
  const [dateTo, setDateTo] = useState('2026-03-01');
  const [includeAllCells, setIncludeAllCells] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const { data: subscription } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => billingApi.getMySubscription(),
    enabled: isOpen && isAuthenticated,
  });

  const isProOrEnterprise =
    subscription?.status === 'ACTIVE' &&
    (subscription?.plan?.tier === 'PRO' || subscription?.plan?.tier === 'ENTERPRISE');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onClose();
      openAuthModal('login');
      return;
    }

    if (!isProOrEnterprise) {
      toast.warning('Historical data export is available on Analyst Pro. Click to upgrade.');
      return;
    }

    setIsExporting(true);
    try {
      const cellIds = !includeAllCells && selectedCellId ? [selectedCellId] : undefined;

      const blob = await exportApi.downloadExport({
        format,
        cellIds,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format.toLowerCase();
      link.setAttribute('download', `ecolens_addis_ababa_export_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Data export (${format}) downloaded successfully!`);
      onClose();
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Export Failed' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="export-modal-title"
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                Export Spatial Economic Data
              </h2>
              <p className="text-xs text-gray-500">
                Download structured historical series across nightlights, built-up area & wealth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pro Tier Lock Banner if not pro */}
        {!isProOrEnterprise && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                Analyst Pro Feature
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                Historical CSV and JSON data export is available on the <strong>Analyst Pro</strong>{' '}
                tier (2,500 ETB/mo).
              </p>
              <Link
                to="/pricing"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <span>Upgrade to Pro Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleExport} className="p-6 space-y-4">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('CSV')}
                className={cn(
                  'p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer',
                  format === 'CSV'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                )}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">CSV Spreadsheet</div>
                  <div className="text-[10px] text-gray-400">Excel, Python, R, Stata</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('JSON')}
                className={cn(
                  'p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer',
                  format === 'JSON'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50'
                )}
              >
                <FileCode className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <div className="text-xs font-bold">GeoJSON / JSON</div>
                  <div className="text-[10px] text-gray-400">GIS, Mapbox, QGIS</div>
                </div>
              </button>
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Cell scope */}
          <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Spatial Scope
              </span>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAllCells}
                  onChange={(e) => setIncludeAllCells(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Export entire Addis Ababa grid</span>
              </label>
            </div>

            {!includeAllCells && selectedCellId && (
              <p className="text-[11px] text-blue-600 font-mono">
                Currently targeting selected cell: {selectedCellId.slice(0, 10)}…
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing Data Stream…</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Historical Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
