'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TopNav() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">
          {/* Breadcrumbs or Page Title could go here dynamically */}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-500 hover:text-slate-700 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700">{profile?.name || 'User'}</span>
            <span className="text-xs text-slate-500">{profile?.businesses?.[0]?.role || 'Owner'}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <User className="h-5 w-5" />
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
