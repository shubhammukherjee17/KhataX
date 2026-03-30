'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function LandingNavAuth({ isMobile }: { isMobile?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-4 w-32 justify-end">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-[#00ea77] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className={`flex items-center gap-4 ${isMobile ? 'w-full flex-col items-start gap-4' : ''}`}>
        <Link href="/dashboard" className={`text-sm font-medium hover:text-white text-slate-300 transition ${!isMobile ? 'hidden sm:block' : 'text-xl'}`}>
          Dashboard
        </Link>
        <Link href="/dashboard" className={`flex items-center gap-2 text-sm font-semibold bg-[#111] border border-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition group ${isMobile ? 'w-full justify-center py-3' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
             {user?.photoURL ? (
               <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
             ) : (
               <span className="text-white font-bold text-xs uppercase">
                 {(profile?.name || user?.displayName || user?.email || 'U').charAt(0)}
               </span>
             )}
          </div>
          <span className="pr-1 text-slate-100">{profile?.name || 'Account'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${isMobile ? 'w-full flex-col gap-4' : ''}`}>
      <Link href="/login" className={`text-sm font-medium hover:text-white text-slate-300 transition ${!isMobile ? 'hidden sm:block' : 'text-xl mb-2'}`}>Log in</Link>
      <Link href="/login" className={`text-sm font-semibold bg-[#00ea77] text-black px-5 py-2.5 rounded-full hover:bg-[#00c563] transition shadow-[0_0_15px_rgba(0,234,119,0.2)] ${isMobile ? 'w-full text-center text-lg py-4' : ''}`}>
        Get Started
      </Link>
    </div>
  );
}
