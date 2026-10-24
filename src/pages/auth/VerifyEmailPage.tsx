// src/pages/auth/VerifyEmailPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuth } from '@/context/AuthContext';
import { formatApiError } from '@/lib/axios';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing verification token. Please check your verification link.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    authApi
      .verifyEmail(token)
      .then(async () => {
        setStatus('success');
        await refreshUser();
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(formatApiError(err));
      });
  }, [token, refreshUser]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-5">
        <img src="/ecolens-tr.png" alt="EcoLens" className="h-10 w-auto mx-auto object-contain" />

        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Verifying your email…</h2>
            <p className="text-sm text-gray-500">
              Please wait while we validate your email verification token.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your account has been verified. You now have full access to saved areas, report
              requests, and data export.
            </p>
            <Link
              to={ROUTES.MAP}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Explore Live Economy Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {errorMessage || 'The verification link may have expired or is invalid.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to={ROUTES.HOME}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
