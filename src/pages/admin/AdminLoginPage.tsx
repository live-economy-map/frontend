import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminLogin } from '@/hooks/useAdminAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
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
        // FR-16: generic 401 error – do not reveal which field is wrong
        setError('root', {
          message: 'Invalid email or password',
        });
      },
    });
  };

  return (
    <div className="flex w-full h-full min-h-screen bg-white rounded-3xl overflow-hidden shadow-lg">
      {/* ── Right Column: Form ── */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-xs text-gray-500 mb-8">Sign in to access the admin dashboard.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 max-w-sm w-full">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50/50 px-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                onClick={() => setShowPwd((s) => !s)}
                tabIndex={-1}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
            {errors.root && <p className="mt-1.5 text-xs text-red-500">{errors.root.message}</p>}
            {error && !errors.root && !errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{(error as Error).message}</p>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs text-gray-600">Remember me</span>
            </label>
            <button type="button" className="text-xs font-medium text-blue-600 hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
