'use client';

import { Bell, Search, Plus, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationTray } from '@/components/ui/NotificationTray';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard' || pathname === '/';
  
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className={`flex h-16 lg:h-20 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#0A0A0A]/80 backdrop-blur-xl px-4 lg:px-8 z-10 ${isDashboard ? 'lg:hidden border-transparent' : ''}`}>

      {/* Left side: Hamburger (mobile) + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-zinc-400 hover:text-white lg:hidden transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative group flex-1 hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-500 group-focus-within:text-brand-primary transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#111] border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right Actions */}
      {!isDashboard && (
        <div className="flex items-center gap-3 lg:gap-6 relative">
          <button 
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className="text-zinc-500 hover:text-white transition-colors relative mt-1 hidden sm:block"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute 0 top-0 right-0 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </button>
          
          <NotificationTray isOpen={isTrayOpen} onClose={() => setIsTrayOpen(false)} />

          <Link
            href="/sales/new"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-black font-heading font-semibold py-2 px-3 sm:py-2.5 sm:px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(0,255,163,0.15)] hover:shadow-[0_0_25px_rgba(0,255,163,0.3)] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
            <span className="sm:hidden text-xs">New</span>
          </Link>
        </div>
      )}
    </header>
  );
}
