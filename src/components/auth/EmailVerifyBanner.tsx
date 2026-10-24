import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth.api';
import { useToast } from '@/context/ToastContext';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { formatApiError } from '@/lib/axios';

export default function EmailVerifyBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await authApi.resendVerificationEmail();
      toast.success(`Verification email sent to ${user.email}. Please check your inbox.`);
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Could not send verification email' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside
      aria-label="Email verification reminder"
      className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs transition-all relative z-40"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-200 shrink-0" />
          <span className="font-medium text-blue-50">
            Please verify your email address (<strong>{user.email}</strong>) to access spatial
            alerts, saved areas export, and institutional features.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResend}
            disabled={isSending}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer text-xs"
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Resend verification email</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-blue-200 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
