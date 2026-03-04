'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null; // Wait for redirect

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans">
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex flex-1 flex-col justify-start w-full relative overflow-y-auto overflow-x-hidden">
        <TopNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 bg-[#0a0a0a] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
