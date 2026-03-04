'use client';

import { Bell, Search, Plus, Menu } from 'lucide-react';
import Link from 'next/link';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="flex h-16 lg:h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-4 lg:px-8 z-10">

      {/* Left side: Hamburger (mobile) + Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative group flex-1 hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-500 group-focus-within:text-[#00ea77] transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#111] border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button className="text-slate-500 hover:text-white transition-colors relative mt-1 hidden sm:block">
          <Bell className="h-5 w-5" />
          <span className="absolute 0 top-0 right-0 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </button>

        <Link
          href="/sales/new"
          className="flex items-center gap-2 bg-[#00ea77] hover:bg-[#00c563] text-black font-bold py-2 px-3 sm:py-2.5 sm:px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(0,234,119,0.15)] hover:shadow-[0_0_25px_rgba(0,234,119,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden text-xs">New</span>
        </Link>
      </div>
    </header>
  );
}
