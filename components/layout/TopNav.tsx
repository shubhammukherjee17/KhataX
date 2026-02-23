'use client';

import { Bell, Search, Plus } from 'lucide-react';
import Link from 'next/link';

export function TopNav() {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#1a231f] bg-[#0A0F0D] px-8 z-10">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-500 group-focus-within:text-[#00ea77] transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions, customers, or items..." 
            className="w-full bg-[#121c17] border border-[#1a231f] rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="text-slate-500 hover:text-white transition-colors relative mt-1">
          <Bell className="h-5 w-5" />
          <span className="absolute 0 top-0 right-0 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        </button>
        
        <Link 
          href="/sales/new"
          className="flex items-center gap-2 bg-[#00ea77] hover:bg-[#00c563] text-black font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(0,234,119,0.15)] hover:shadow-[0_0_25px_rgba(0,234,119,0.3)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
        </Link>
      </div>
    </header>
  );
}
