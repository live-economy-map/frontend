// src/components/layouts/PublicLayout.tsx
import { Outlet } from 'react-router-dom';
import { TopNavBar } from '@/components/common/TopNavBar';
import { Footer } from '@/components/common/Footer';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
