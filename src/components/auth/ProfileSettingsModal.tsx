import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  User,
  Building,
  Mail,
  Phone,
  Send,
  Loader2,
  Zap,
  Shield,
  Download,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setOrganizationName(user.organizationName || '');
      setPhoneNumber(user.phoneNumber || '');
      setTelegramHandle(
        user.telegramHandle
          ? user.telegramHandle.startsWith('@')
            ? user.telegramHandle
            : `@${user.telegramHandle}`
          : ''
      );
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
        organizationName: organizationName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        telegramHandle: telegramHandle.trim().replace(/^@/, '') || undefined,
      });
      onClose();
    } catch {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const planName = user.plan || user.subscription?.plan?.name || 'Free Tier';
  const isEnterprise =
    user.planTier === 'ENTERPRISE' || planName.toLowerCase().includes('enterprise');
  const isPro = user.planTier === 'PRO' || planName.toLowerCase().includes('pro');
  const isFree = !isEnterprise && !isPro;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Profile Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subscription Plan & Profile Status Card */}
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  isEnterprise
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : isPro
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                )}
              >
                {isEnterprise ? (
                  <Building className="w-4 h-4" />
                ) : isPro ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {planName}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border',
                      isEnterprise
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                        : isPro
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    {isEnterprise ? 'ENTERPRISE' : isPro ? 'ANALYST PRO' : 'FREE TIER'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 font-semibold">
                    {user.planStatus === 'ACTIVE' || !isFree
                      ? 'Active Plan Status'
                      : 'Standard Access'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{isFree ? 'Upgrade' : 'Change Plan'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60 grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1.5">
              <Download
                className={cn('w-3.5 h-3.5', !isFree ? 'text-blue-600' : 'text-gray-400')}
              />
              <span>{!isFree ? 'CSV/JSON Data Export' : 'Export: Limited'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bell className={cn('w-3.5 h-3.5', !isFree ? 'text-blue-600' : 'text-gray-400')} />
              <span>{!isFree ? 'Spatial Anomaly Alerts' : 'Alerts: Disabled'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Email verification:{' '}
              {user.isEmailVerified ? (
                <span className="text-emerald-600 font-semibold">Verified</span>
              ) : (
                <span className="text-amber-600 font-semibold">Unverified</span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abebe Bikila"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Organization Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Addis Ababa University / Ministry of Innovation"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Telegram Handle
              </label>
              <div className="relative">
                <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={telegramHandle}
                  onChange={(e) => setTelegramHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
