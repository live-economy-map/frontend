// src/pages/billing/CheckoutSuccessPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { billingApi } from '@/api/billing.api';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { formatApiError } from '@/lib/axios';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Download,
  Bell,
  Key,
} from 'lucide-react';
import { ROUTES } from '@/constants';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get('txRef') || searchParams.get('trx_ref') || searchParams.get('ref');
  const queryClient = useQueryClient();
  const { refreshUser, user } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!txRef) {
      setStatus('error');
      setMessage('Missing payment transaction reference.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    billingApi
      .verifyCheckout(txRef)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Subscription successfully activated!');
        queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
        refreshUser();
      })
      .catch((err) => {
        setStatus('error');
        setMessage(formatApiError(err));
      });
  }, [txRef, queryClient]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50/60 dark:bg-gray-950">
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 text-center space-y-6">
        <img src="/ecolens-tr.png" alt="EcoLens" className="h-10 w-auto mx-auto object-contain" />

        {status === 'verifying' && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activating your subscription…
            </h2>
            <p className="text-xs text-gray-500 font-mono">Reference: {txRef}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Payment Confirmed
              </span>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
                Welcome to {user?.plan || 'Analyst Pro'}!
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-md mx-auto">
                {message ||
                  'Your subscription has been activated. Your account has now been granted premium spatial entitlements.'}
              </p>
            </div>

            {/* Entitlements Unlocked Card */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-left space-y-3">
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Active Entitlements Unlocked:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Unlimited CSV/JSON Data Export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>10 Spatial Anomaly Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Priority Deep-Dive Queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Multi-Signal Historical Breakdown</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={ROUTES.MAP}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Open Live Economy Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Payment Verification Failed
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {message || 'Unable to confirm subscription activation.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/pricing"
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition-colors"
              >
                Back to Pricing
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
