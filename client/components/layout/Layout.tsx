import HeaderBanner from '@/components/HeaderBanner';
import { MobileNav } from '@/components/navigation/MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderBanner />

      {/* Main Content (full width after sidebar removal) */}
      <main className="pb-20 md:pb-0" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="p-4 md:p-6 w-full">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
