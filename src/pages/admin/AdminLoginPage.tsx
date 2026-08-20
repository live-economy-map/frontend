// src/pages/admin/AdminLoginPage.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminLogin } from '@/hooks/useAdminAuth';
import { ROUTES } from '@/constants';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { mutate, isPending, error } = useAdminLogin();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    mutate(data, {
      onError: () => {
        setError('root', {
          message: 'Invalid email address or password.',
        });
      },
    });
  };

  const errorMessage =
    errors.root?.message ||
    (error && !errors.email && !errors.password ? (error as Error).message : null);

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[520px]">
      {/* ── Left Column: Ambient Glow + Large Shield Icon ── */}
      <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-blue-50/20 p-12 overflow-hidden">
        {/* Soft Radial Glow */}
        <div className="absolute w-72 h-72 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Large Central Shield with Checkmark Icon */}
        <div className="relative z-10 text-blue-600 transition-transform hover:scale-105 duration-300">
          <svg
            className="w-36 h-36 drop-shadow-sm"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* ── Right Column: Login Form ── */}
      <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
        <div className="max-w-sm w-full mx-auto space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
              <img
                src="/ecolens-tr.png"
                alt="EcoLens"
                className="h-6 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-base font-bold text-gray-900 tracking-tight">EcoLens</span>
            </Link>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Sign in to access the admin dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 pr-10 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                  onClick={() => setShowPwd((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Secure Access Footer */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Secure access • Encrypted • Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
