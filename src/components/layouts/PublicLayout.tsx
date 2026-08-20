import { Outlet } from 'react-router-dom';
import TopNavBar from '@/components/common/TopNavBar';
import Footer from '@/components/common/Footer';

// New layout beyond the base template — public routes carry no auth concept
// at all (see frontend conventions 0.1). No guard wraps this layout.
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface">
      <TopNavBar />
      <main className="content-container w-full flex-grow px-space-margin-mobile py-8 md:px-space-margin-desktop md:py-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
