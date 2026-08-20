// src/components/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-blue-100 selection:text-blue-900">
      <Outlet />
    </div>
  );
}
